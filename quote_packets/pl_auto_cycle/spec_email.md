# Spec: Email Channel for Cycle Time Compression

References: [[cycle_spec]], [[cycle_brainstorm]], [[cycle_prd]], [[research_email]]

---

## Purpose

Email is the **secondary outbound channel** (after SMS) for automated follow-up with customers who have incomplete quote data after an initial interaction (call, chat, form). This spec covers: how we send and receive email through the producer's own inbox (BYOD approach), how we parse replies, how we represent email conversations in our platform, and key build-vs-buy decisions.

---

## 1. Architecture: BYOD via Inbox Integration

### Core Concept

Instead of sending emails from our own transactional infrastructure, we **send and receive emails through the producer's actual inbox** (Google Workspace or Microsoft 365) using an email API abstraction layer. When our system sends a follow-up email to a customer, it appears in the producer's Sent folder, comes from their real address (john@abcinsurance.com), and uses their established domain reputation.

### Why BYOD Over Transactional ESP

| Factor | BYOD (Producer's Inbox) | Transactional ESP (Postmark/SendGrid) |
|---|---|---|
| **From address** | Producer's real email (john@abcinsurance.com) | Generic or white-labeled (quotes@abcinsurance.com) |
| **Sent folder** | Appears in producer's Sent — they have full context | Not visible to producer |
| **Customer replies** | Land in producer's inbox + our system gets webhook | Route to inbound parse endpoint — producer has no visibility |
| **Manual handoff** | Producer continues the thread naturally from their email client | Producer starts a new disconnected thread |
| **Domain reputation** | Uses established domain — no warm-up needed | New domain requires warm-up; risk of spam filtering |
| **Deliverability** | High — customer sees a real person they spoke with | Moderate — may look automated |
| **DNS setup** | None — OAuth only | DKIM/SPF/DMARC per agency |
| **Tracking** | Open/click tracking available (with limitations) | Full built-in tracking |
| **Volume limits** | Gmail: 2,000/day, Microsoft 365: 10,000/day | Essentially unlimited |

**Verdict**: BYOD is fundamentally superior for customer-facing follow-up emails. Transactional ESP is still needed for internal system notifications (new lead alerts, token expiration warnings, etc.).

### Addressable Inbox Requirements

For V1, we target the two dominant providers that cover ~70% of small businesses:

- **Google Workspace** — Gmail API via OAuth2
- **Microsoft 365** — Microsoft Graph API via OAuth2

Agencies on other providers (GoDaddy, Rackspace, etc.) can use IMAP/SMTP fallback with degraded functionality, or we require Google/Microsoft as a prerequisite for V1.

---

## 2. Technical Questions

### Sending

- **API abstraction layer**: Do we use Nylas (managed API) to abstract Google/Microsoft differences, or integrate directly with Gmail API and Microsoft Graph API?
  - **Nylas**: Unified API across providers. Managed OAuth token refresh. Built-in tracking. ~$1.35-5.29/connected account/month. Fastest to implement.
  - **Direct APIs**: Free but requires maintaining two separate integrations (Gmail + Graph), handling token refresh ourselves, and building our own tracking. More engineering effort, lower ongoing cost.
  - **EmailEngine**: Self-hosted alternative to Nylas. $995/year flat regardless of account count. Open source core. Good for cost optimization at scale (>50 accounts).
- **Sending mechanism**: Send via the connected inbox API (Nylas `POST /messages/send` or Graph `POST /users/{id}/sendMail`). Email appears in producer's Sent folder automatically.
- **Template rendering**: We render HTML server-side using React Email, then pass the rendered HTML to the inbox API. No ESP template engine needed.
- **Scheduled send**: Nylas supports `send_at` parameter for scheduling. Important for respecting quiet hours and optimal send times.
- **Rate limits**:
  - Gmail Workspace: 2,000 messages/day per user. At 20-50 automated emails/day per producer, we're well within limits.
  - Microsoft 365: 10,000 messages/day per user. No practical concern.

### Receiving & Parsing

- **Inbound via webhooks**: Nylas fires a `message.created` webhook when the customer replies. We get the full message body, headers, thread context, and attachments.
- **No inbound parse endpoint needed**: Unlike the transactional ESP approach, we don't need a dedicated inbound parse address. Replies go to the producer's real inbox, and we observe them via the API.
- **Dual-read scenario**: Customer replies land in the producer's inbox AND our system gets the webhook. Our system is a "silent observer" — we process the reply but do NOT mark it as read. The producer sees it as unread in their inbox and can respond manually if needed.
- **LLM parsing of replies**: Same shared pipeline as SMS. Parse free-text replies against the MissingDataProfile for the lead. Classify as: `data_response`, `question`, `opt_out`, `unrelated`, or `ambiguous`.
- **Attachment handling**: Nylas API provides attachment download endpoints. Detect attachments on inbound messages and route to the dec page parsing pipeline.

### Thread Management

- **Thread coherence**: Because we send from the producer's inbox, all messages (automated and manual) live in the same email thread. If the producer opens their email client and replies manually, it stays in the same thread.
- **Thread tracking**: Nylas Threads API lets us follow the full conversation. We store the `thread_id` for each lead's email sequence.
- **This is a major advantage over ESP**: With a transactional ESP, the producer would need to start a separate thread — breaking context for the customer.

### Authentication & Token Management

- **OAuth2 flow**: Producer clicks "Connect your inbox" in our app → redirected to Google/Microsoft consent screen → grants our app access → OAuth tokens stored securely.
- **Admin pre-approval**: For Microsoft 365, a tenant admin can grant org-wide consent so individual producers don't see consent prompts. For Google Workspace, admin can add our app to trusted apps.
- **Token refresh**: Access tokens expire. Nylas handles token refresh automatically. If using direct APIs, we must implement refresh logic and handle failures.
- **Token expiration alerts**: If a token becomes invalid (revoked, password changed), our system detects via Nylas `grant.expired` webhook → sends in-app notification + SMS alert to producer to re-authenticate.

### Deliverability & Compliance

- **CAN-SPAM**: When sending through the producer's inbox, the "sender" is clearly the producer/agency. Transactional emails triggered by the customer's quote request are largely exempt from CAN-SPAM advertising requirements, but we still include:
  - Agency physical address in footer
  - Opt-out link (best practice even for transactional)
  - Accurate, non-deceptive subject lines
- **No domain warm-up needed**: The producer's domain is already established. This eliminates a major deliverability risk.
- **Bounce handling**: Nylas fires `message.bounce_detected` webhooks. Mark email as invalid, don't retry.
- **Data residency**: Nylas offers US-region data residency and is SOC2 Type II certified.

---

## 2. Build vs Buy Analysis

### Recommended Hybrid Architecture

| Layer | Approach | Vendor | Notes |
|---|---|---|---|
| **Customer-facing email** | BYOD (inbox integration) | **Nylas** (V1) → **EmailEngine** (V2 cost optimization) | Send/receive through producer's actual inbox |
| **Internal notifications** | Transactional ESP | **Postmark** | New lead alerts, token expiration warnings, system notifications to producers |
| **Templates** | Build | **React Email** (open source) | Render HTML server-side, pass to Nylas/Postmark |
| **Reply parsing** | Build | **Custom LLM pipeline** (GPT-4o-mini / Claude Haiku) | Shared with SMS. Classifies + extracts structured fields |
| **Orchestration** | Build | **Custom state machine** (BullMQ / Temporal) | Orchestration platforms don't natively support Nylas as a sending channel |
| **Tracking** | Buy | **Nylas message tracking** + **Google Postmaster Tools** | Opens, clicks, bounces. Thread replies detected via webhook |

### What We Buy

| Capability | Vendor | Cost |
|---|---|---|
| Inbox API abstraction + token management + webhooks | Nylas (Core tier, annual) | ~$1.35/connected account/month |
| Internal transactional email | Postmark | $15-50/month |

### What We Build

| Capability | Why Build |
|---|---|
| Dynamic email content generation from MissingDataProfile | Our domain logic — which fields to ask for, how to phrase, bilingual |
| Reply classification + structured field extraction | LLM-powered; classifies reply type + extracts insurance data fields |
| Follow-up state machine / orchestration | Timed sends, conditional logic (opened? replied? submitted form?), SMS fallback |
| Producer onboarding OAuth flow | Connect inbox UI, re-auth prompts, connected accounts dashboard |
| Attachment-to-dec-page routing | Detect attachments in inbound replies, route to OCR/parsing pipeline |

---

## 3. UX Questions

### How Do We Represent Email Conversations?

**Key difference with BYOD**: The producer already sees the email thread in their own inbox (Gmail/Outlook). Our platform's role is to surface the *data* extracted from emails, not to replicate the inbox experience.

**Recommendation**: **Unified conversation log** (same as SMS) with **status badges** on the dashboard.

- All interactions (calls, SMS, emails, form submissions, uploads) appear in a single chronological timeline per lead.
- Email entries show: subject, snippet, extracted data (if any), status (sent/opened/clicked/replied).
- The producer does NOT need to read emails in our platform — they can see the full thread in their own inbox.
- If a reply needs human attention (question, ambiguous, low confidence), flag it in the timeline with a prominent alert.

### Email Content Design

- **Mobile-first HTML**: Most customers will open on mobile. Keep emails short, scannable, with clear CTAs.
- **Two primary CTAs**:
  1. "Complete your info" → Smart Form link
  2. "Upload your current policy" → Dec Page uploader link
- **Personalization**: Producer's real name + signature (pulled from their inbox profile), customer first name, agency name, list of 2-3 specific missing items in plain language.
- **Tone**: Personal, not automated. Should read like the producer typed it. "Hey [Name], it was great chatting with you. I just need a couple more details to get your quote ready..."
- **Reminder emails**: Shorter, reference the original thread, different phrasing. "Just a quick follow-up — we still need your VIN and your date of birth to finalize your quote."
- **Bilingual**: Support English and Spanish. Language selector during lead intake determines which template to use.

### Manual Override / Intervention

**Resolved by BYOD**: Producers naturally continue the thread from their own email client. No compose UI needed in our platform.

- If producer replies from Gmail/Outlook, the reply appears in the same thread. Our system sees it via webhook and can pause automation.
- **Automation pause logic**: If a producer sends a manual message in the thread, pause automated follow-ups for that lead for 24 hours (configurable).
- Our platform can optionally show a "Reply" button that deep-links to the thread in Gmail/Outlook (using the thread's message-id or URL).

---

## 4. Key Flows

### Flow 1: Post-Call Automated Email
1. Call ends → voice-to-structured-data extracts fields → missingness engine identifies gaps.
2. Communication job created → channel decision: if email available, include email.
3. Email generated: dynamic HTML content from MissingDataProfile, rendered via React Email, personalized with producer name/signature.
4. **Sent via Nylas through the producer's inbox.** Email appears in producer's Sent folder.
5. Nylas tracks: delivery, open, click. Fires webhooks for each event.
6. Customer clicks "Complete your info" → smart form (pre-filled with known data).
7. OR customer replies directly with info → Nylas `message.created` webhook → LLM extraction → fields updated.
8. OR customer attaches a deck page → attachment detected via webhook → routed to OCR parsing pipeline.
9. Missingness engine re-evaluates. If complete → mark job done. If not → schedule reminder.

### Flow 2: Reminder Cadence
1. 72h after initial email, if still incomplete → send reminder (different subject, shorter, same thread).
2. Track engagement. If no open after 2 emails → fall back to SMS.
3. Max 3 email attempts. After that, flag for producer manual follow-up.

### Flow 3: Customer Reply Parsing
1. Customer replies to the email thread: "Here is my VIN: 1HGBH41JXMN109186"
2. Reply lands in producer's inbox (unread) AND Nylas fires `message.created` webhook to our backend.
3. Our system does NOT mark the email as read — producer sees it normally.
4. LLM parses reply against the MissingDataProfile for this lead.
5. Classification: `data_response` → auto-process. `question` → flag for producer.
6. Extracted fields written to CapturedField with `source = email_reply`.
7. If attachments present → queue DeckPageParsingJob.
8. If all requested fields extracted → send confirmation email via producer's inbox: "Thanks [Name]! Got everything we need. We'll have your quote ready shortly."

### Flow 4: Producer Onboarding (Email Connection)
1. Agency signs up on our platform.
2. Producer clicks "Connect your email" in account settings.
3. Redirect to Google/Microsoft OAuth consent screen.
4. Producer grants access → Nylas stores OAuth tokens → we store the Nylas grant ID.
5. Takes ~30 seconds per producer. No DNS changes needed.
6. If admin pre-approved (Microsoft tenant-wide consent or Google Workspace trusted app), the consent screen auto-completes.

---

## 5. Open Questions & TODOs

- [ ] **TODO: Align with CX platform decisions** — Email sending via Nylas should integrate with our broader CX platform architecture. How does the connected inbox model fit with our platform's session/auth model?
- [ ] **TODO: Align with AMS integration plans** — With BYOD, emails are already in the producer's inbox (visible in AMS tools that sync with email). Do we still need to push email events to the AMS separately?
- [ ] **TODO: Align with contact management** — Where does the canonical customer contact record live? We need: email verified? Opted out? Preferred language? This lives in a shared contact/lead service.
- [ ] **TODO: Align with conversational management** — Email threads should integrate with the unified conversation model (alongside SMS, calls, form submissions).
- [ ] **Non-Google/Microsoft agencies**: What percentage of our target agencies use non-Google/Microsoft email? Do we need an IMAP/SMTP fallback for V1, or can we require Google/Microsoft as a prerequisite?
- [ ] **Multi-producer routing**: When a lead comes in, how do we decide which producer's inbox to send from? Assigned producer at lead level? Round-robin? This affects the Nylas grant selection logic.
- [ ] **Nylas vs direct API decision**: Confirm Nylas for V1 (speed) vs building direct Gmail API + Microsoft Graph integrations (cost). The crossover point for EmailEngine (~50 accounts) should inform timing.
- [ ] **Legal review**: Confirm CAN-SPAM classification. Our system sends emails on behalf of the producer through their inbox — confirm this doesn't create additional compliance obligations for us as the technology provider.
- [ ] **Deliverability monitoring**: Set up Google Postmaster Tools for agencies using Google Workspace. Monitor domain reputation.

---

## 6. Research Findings Summary

*See [[research_email]] for full details (870 lines, comprehensive analysis).*

### Primary Recommendation: BYOD via Nylas

| Component | V1 Choice | V2 Consideration |
|---|---|---|
| **Customer-facing email** | Nylas (Core tier, ~$1.35/CA/month annual) | EmailEngine (self-hosted, $995/year flat) |
| **Internal notifications** | Postmark ($15-50/mo) | Keep Postmark |
| **Orchestration** | Custom state machine (BullMQ/Temporal) | Customer.io/Knock if workflows get complex |
| **Templates** | React Email (open source) | Keep |
| **Reply parsing** | Custom LLM (shared with SMS) | Keep |

### Nylas Key Details

- **Pricing**: Core tier at $1.35/connected account/month (annual billing). Growth tier at $3.30/CA/month with advanced features (message tracking, scheduled send).
- **Capabilities**: Send, read, threads, webhooks (`message.created`, `message.opened`, `message.link_clicked`, `message.bounce_detected`, `grant.expired`), attachment download, scheduled send.
- **OAuth flow**: ~30 seconds per producer. Admin pre-approval possible for Microsoft (tenant-wide consent) and Google (trusted apps).
- **Tracking**: Open tracking (pixel-based, subject to ad blockers), click tracking (link rewriting), thread reply detection.
- **Token management**: Automatic refresh. Webhook alert on expiration.
- **SOC2 Type II certified. US data residency available.**

### Alternatives Evaluated

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **Nylas** (recommended V1) | ~$1.35-5.29/CA/month | Fastest to implement, managed tokens, unified API | Per-account cost adds up at scale |
| **EmailEngine** (recommended V2) | $995/year flat | Cheapest at >50 accounts, self-hosted | Requires server infrastructure, more maintenance |
| **Direct Gmail + Graph APIs** | Free | No vendor dependency | 2x integration work, build own token management |
| **Unipile** | ~$5.50/CA/month | Email + LinkedIn + messaging | Expensive, less mature |
| **Transactional ESP (Postmark)** | $15-85/month | Simple, high volume | No Sent folder visibility, no producer context |

### Cost Model

| Scale | Agencies | Connected Accounts | Nylas (annual) | Postmark (internal) | Total/month |
|---|---|---|---|---|---|
| **Launch** | 5 | 10 | ~$14 | $15 | **~$29** |
| **Growth** | 20 | 50 | ~$68 | $30 | **~$98** |
| **Traction** | 50 | 150 | ~$203 | $50 | **~$253** |
| **Scale** | 200 | 600 | ~$810 | $75 | **~$885** |

*At ~50 connected accounts, evaluate migration to EmailEngine ($83/month flat) for significant savings.*

### Implementation Timeline: 6-9 weeks

| Phase | Scope | Duration |
|---|---|---|
| 1 | Nylas integration: OAuth flow, send endpoint, webhook receiver | 1.5-2 weeks |
| 2 | React Email templates: initial follow-up, reminders, bilingual, dynamic content | 1-2 weeks (parallel with Phase 1) |
| 3 | Custom orchestration: follow-up state machine with timed sends, conditional logic, SMS fallback | 1.5-2 weeks |
| 4 | Inbound processing: LLM reply parsing, attachment routing, classification | 1.5-2 weeks |
| 5 | Postmark for internal system notifications | 3-5 days |
| 6 | Producer onboarding UI: OAuth consent flow, connected accounts dashboard, re-auth prompts | 1 week |

### Key Risks

| Risk | Mitigation |
|---|---|
| Nylas outage disrupts sending | Queue emails locally, retry with backoff. Direct API as emergency fallback. |
| OAuth token expires, producer doesn't re-auth | `grant.expired` webhook → in-app notification + SMS alert. Grace period queues emails. |
| Agency uses non-Google/Microsoft email | IMAP/SMTP fallback or V1 prerequisite. ~70% of small businesses covered by Google + Microsoft. |
| Nylas pricing increases at scale | EmailEngine migration path is our hedge. Crossover at ~50 connected accounts. |

---

## Appendix A: Google OAuth Verification & Security Review

### Why This Matters

Any app that accesses Gmail via OAuth2 (whether through Nylas or direct Google API integration) must go through Google's verification process if it serves users outside a single Google Workspace organization. This has historically been cited as a major blocker for BYOD email implementations — stories of $15,000-$75,000 security audits and months-long review timelines are common in developer forums.

**The reality is significantly more favorable than the conventional wisdom suggests.** There are multiple paths to production access, and the costs/timelines are a fraction of what's commonly reported.

### Background: Google's OAuth Scope Tiers

Google classifies OAuth scopes into three tiers, each with different verification requirements:

| Tier | Example Scopes | Verification Required | Security Assessment (CASA) |
|---|---|---|---|
| **Non-sensitive** | `openid`, `profile`, `email` | None | None |
| **Sensitive** | `gmail.send`, `calendar.events`, `contacts` | Google verification (brand/domain/privacy policy review) | None |
| **Restricted** | `gmail.readonly`, `gmail.modify`, `gmail.compose` | Google verification + CASA security assessment | Required |

**Key insight**: The scope you need determines the path. If we only need to **send** emails (not read the full inbox), `gmail.send` is a **sensitive** scope that requires only Google verification — no CASA assessment at all.

However, for full BYOD functionality (reading replies, accessing threads, detecting attachments), we likely need `gmail.modify` or `gmail.readonly` — **restricted** scopes that require the CASA assessment.

### Three Paths to Production Access

#### Path 1: Nylas Shared GCP Project (Recommended for V1)

Nylas maintains their own pre-verified, CASA-assessed Google Cloud Platform project. Customers on **Nylas Contract plans** (not self-serve) can use Nylas's existing verification instead of going through the process themselves.

- **How it works**: Nylas's GCP project is already verified for restricted Gmail scopes. When your users OAuth through Nylas, they're authenticating against Nylas's verified app — not yours.
- **What's required**: Sign a Nylas Contract plan (vs. self-serve billing). Contact Nylas Account Manager to enable Shared GCP.
- **Cost**: Only the Nylas subscription itself — no separate verification or CASA fees.
- **Timeline**: Immediate once on Contract plan.
- **Limitations**: You're dependent on Nylas maintaining their verification. If you later migrate off Nylas, you'd need your own verification.

**This is the fastest path to production.** It completely eliminates the Google Security Review as a concern for V1.

#### Path 2: Google Workspace Admin Trust/Allowlist

For agencies that use **Google Workspace** (not consumer Gmail), the Workspace admin can explicitly trust an unverified app, bypassing the verification requirement entirely.

- **How it works**: In Google Admin Console → Security → API Controls → App Access Control, the admin adds your app's OAuth Client ID and sets it to "Trusted." This overrides the unverified app warning and grants access to restricted scopes for all users in the organization.
- **What's required**: The agency's Google Workspace admin performs a one-time configuration (~2 minutes).
- **Cost**: Zero.
- **Timeline**: Immediate.
- **Limitations**: Only works for Google Workspace accounts (not consumer Gmail). Requires agency admin cooperation during onboarding. Each agency's admin must do this independently.

**This is highly practical for our use case** because our target customers are insurance agencies — businesses that overwhelmingly use Google Workspace (not consumer Gmail). Adding "trust our app" to the agency onboarding checklist is straightforward, especially since these agencies are already choosing to integrate with our platform.

#### Path 3: Full Google Verification + CASA Assessment (Own GCP Project)

If we want our own verified GCP project (e.g., for independence from Nylas, or if we build direct Gmail API integration), we go through the full process.

**Step 1: Google OAuth Verification (All Apps with Sensitive+ Scopes)**

| Requirement | Details |
|---|---|
| Verified domain | Must own the domain associated with the app |
| Privacy policy | Public URL, covers data usage, deletion |
| Homepage | Public URL explaining the app |
| Google review | Submit via Google Cloud Console → OAuth Consent Screen → "Publish" |
| Timeline | 3-5 business days (typically) |
| Cost | Free |

**Step 2: CASA Security Assessment (Restricted Scopes Only)**

Google requires apps accessing restricted scopes (gmail.modify, gmail.readonly, gmail.compose) to complete a Cloud Application Security Assessment (CASA). The assessment tier is assigned by Google based on the number of users and data access scope:

| CASA Tier | When Assigned | What's Involved | Cost | Timeline |
|---|---|---|---|---|
| **Tier 1** | Low user count, minimal data | Self-assessment questionnaire only | Free | Days |
| **Tier 2** | Moderate user/data scope | Independent assessor reviews against OWASP ASVS/MASVS controls. Can be lab-based (no source access needed). | **$540 - $1,800** | 1-3 weeks |
| **Tier 3** | High user count, broad data access | Full pen-test style assessment by authorized lab. Source code or binary access may be required. | **$4,500 - $8,000+** | 2-4 weeks |

**Cheapest CASA Tier 2 providers** (as of 2025):

| Provider | Tier 2 Price | Tier 3 Price | Notes |
|---|---|---|---|
| **TAC Security** | **$540** | $4,500 | Cheapest option. India-based. |
| **Neuvik** | $1,350 | $7,000 | US-based. |
| **Leviathan Security** | ~$1,800 | ~$6,000-$8,000 | Nylas partner. Offers "Express Security Review" bundle. |
| **Bishop Fox** | ~$1,500 | ~$7,500 | Well-known US firm. |

**Annual re-verification**: CASA assessments must be renewed annually. Budget for recurring cost.

**Important**: If we already have **SOC 2 Type II** certification, much of the CASA evidence can be reused, significantly simplifying the assessment. Nylas completed their own CASA in ~2 weeks leveraging their existing SOC 2.

### Which Scopes Do We Actually Need?

The scope selection directly determines whether we need CASA:

| Use Case | Minimum Scope | Tier | CASA Required? |
|---|---|---|---|
| Send emails only | `gmail.send` | Sensitive | **No** |
| Send + read replies | `gmail.modify` | Restricted | **Yes** |
| Send + read + full inbox access | `gmail.readonly` + `gmail.send` | Restricted | **Yes** |
| Full inbox control (Nylas default) | `gmail.modify` | Restricted | **Yes** |

For our full BYOD implementation (send automated emails, read replies via webhook, access threads, download attachments), we need `gmail.modify` — a restricted scope.

**However**, if using Nylas's Shared GCP (Path 1), this is moot — Nylas's app is already verified for these scopes.

### Recommended Strategy

| Phase | Path | Why |
|---|---|---|
| **V1 (Launch)** | **Nylas Shared GCP** (Path 1) + **Admin Trust** (Path 2) as fallback | Zero verification overhead. Fastest to market. Nylas handles all Google compliance. For agencies that can't use Nylas's shared project for any reason, admin allowlist is instant. |
| **V2 (If migrating off Nylas)** | **Full verification + CASA Tier 2** (Path 3) | Budget $540-$1,800 for initial CASA + ~$540/year renewal. 2-4 weeks total timeline. Not a blocker if planned in advance. |

### Common Misconceptions vs Reality

| Misconception | Reality |
|---|---|
| "Google Security Review costs $15,000-$75,000" | CASA Tier 2 starts at **$540** (TAC Security). The $15K+ figure is for white-glove consulting bundles, not the assessment itself. |
| "It takes 3-6 months" | CASA assessment: 1-4 weeks. Google review: 3-5 business days after. Total: **2-6 weeks**. |
| "You need it for any Gmail access" | Only for **restricted** scopes. `gmail.send` (sensitive) only needs free Google verification. |
| "There's no way around it" | Nylas Shared GCP eliminates it entirely. Workspace Admin Trust bypasses it for managed accounts. |
| "Small apps can't get through" | Google has an informal <100 user exception for low-risk apps. CASA Tier 1 (self-assessment, free) may be assigned for small user bases. |
| "We need to do this before writing any code" | Development and testing use unverified apps freely (with a warning screen). Verification is only needed for production deployment to external users. |

### Open Questions

- [ ] **Confirm Nylas Contract plan pricing and Shared GCP availability** — Reach out to Nylas sales to confirm Contract tier pricing and that Shared GCP is available for our use case.
- [ ] **Determine our likely CASA tier** — If we pursue Path 3, Google assigns the tier. For a new app with <1,000 users initially, Tier 2 is most likely. Confirm with Google's CASA team.
- [ ] **Admin Trust onboarding flow** — Design the agency onboarding step where a Google Workspace admin trusts our app. Should be a guided walkthrough with screenshots (similar to how Slack and other SaaS tools handle Workspace admin approval).
- [ ] **Scope minimization analysis** — Evaluate whether we can achieve core functionality with `gmail.send` (sensitive, no CASA) for sending + a separate webhook/push notification mechanism for inbound reply detection, avoiding restricted scopes entirely.
