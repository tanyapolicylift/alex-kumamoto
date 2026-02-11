# Spec: Email Channel for Cycle Time Compression

References: [[cycle_spec]], [[cycle_brainstorm]], [[cycle_prd]]

---

## Purpose

Email is the **secondary outbound channel** (after SMS) for automated follow-up with customers who have incomplete quote data after an initial interaction (call, chat, form). This spec covers: how we send email, how we receive and parse replies, how we represent email conversations in our platform, and key build-vs-buy decisions.

---

## 1. Technical Questions

### Sending

- **Transactional email provider**: Do we use a dedicated transactional email service (SendGrid, Postmark, Amazon SES, Resend) or route through a more full-featured platform (Customer.io, Braze, etc.) that also handles orchestration?
- **From-address strategy**: Do emails come from `quotes@[agency-domain].com` (requires DNS setup per agency), from a shared domain like `quotes@[ourdomain].com`, or from the individual producer's email? Each has deliverability and trust implications.
  - White-labeling per agency increases open rates but requires per-agency DKIM/SPF/DMARC setup.
  - Shared domain is simpler but may feel less personal / more spammy.
- **Template rendering**: Do we use the ESP's template engine or render HTML server-side and send raw HTML? Server-side gives us more control (dynamic missing-field lists, bilingual support, conditional sections).
- **Tracking**: Open tracking (pixel), click tracking (link wrapping), bounce handling, complaint (spam) feedback loops. Most ESPs provide these out of the box.
- **Rate limiting & warm-up**: If using a new sending domain, we need IP/domain warm-up to avoid spam filters. How do we handle this across multiple agency onboardings?

### Receiving & Parsing

- **Inbound email parsing**: Do we need to receive email replies and extract structured data from them?
  - The PRD mentions direct reply as an input modality for simple fields.
  - Options: inbound parse webhooks (SendGrid Inbound Parse, Postmark Inbound, Mailgun Routes) or dedicated inbound email APIs.
- **Reply-to address routing**: Each communication job needs a unique reply-to or a shared inbox with thread identification. Options:
  - Unique reply-to per lead: `quote-abc123@inbound.[domain].com` — simple routing but many addresses.
  - Shared inbox with subject-line or header-based routing.
- **LLM parsing of replies**: When a customer replies with free-text ("My VIN is 1HGBH41JXMN109186 and my wife's birthday is 3/15/1985"), we need to extract structured fields. Same LLM parsing pipeline as SMS replies? Likely yes — shared service.
- **Attachment handling**: Customers may reply with attachments (deck page photos, PDFs). Do we detect and route these to the deck page parsing pipeline automatically?

### Deliverability & Compliance

- **CAN-SPAM compliance**: Transactional emails related to an active quote request are generally not marketing, but we should include:
  - Clear identification of the sender (agency name).
  - Physical address.
  - Opt-out mechanism (even if technically not required for transactional).
- **Unsubscribe handling**: Link in every email. Respect immediately. Sync with communication job state.
- **Bounce management**: Hard bounces → mark email as invalid, don't retry. Soft bounces → retry with backoff.

---

## 2. Build vs Buy Analysis

### What We Can Buy / Integrate

| Capability | Buy Options | Notes |
|---|---|---|
| Transactional sending | SendGrid, Postmark, Amazon SES, Resend | Commodity; all support templates, tracking, webhooks |
| Orchestration & cadence | Customer.io, Braze, Knock, Courier | Handle send timing, reminders, channel fallback logic |
| Inbound email parsing | SendGrid Inbound Parse, Postmark Inbound, Mailgun | Webhook-based; gives us parsed body, headers, attachments |
| Template design | MJML, React Email, ESP built-in editors | MJML or React Email for dev-controlled templates |
| Deliverability monitoring | Postmark, SendGrid reputation dashboard, Google Postmaster | Track domain reputation, spam complaints, delivery rates |

### What We Likely Need to Build

| Capability | Why Build |
|---|---|
| Dynamic content generation from MissingDataProfile | Our domain logic — which fields are missing, how to phrase the ask, bilingual rendering |
| Reply parsing → structured field extraction | LLM-powered; needs to understand our field schema and map free-text to it |
| Communication job state machine | Ties together send events, opens, clicks, replies, form completions, upload completions → decides next action |
| Per-agency from-address configuration | Onboarding flow to set up DNS records; store config per agency |
| Attachment-to-deck-page routing | Detect attachments in inbound emails, route to OCR/parsing pipeline |

### Hybrid / TBD

- **Orchestration**: If we already have a customer engagement platform (TODO: align with CX platform thinking), we may use its orchestration layer rather than building our own state machine. If not, we build a lightweight job runner.
- **Inbox/conversation UI**: See UX section below — this could be part of a broader CX platform or built custom.

---

## 3. UX Questions

### How Do We Represent Email Conversations?

This is the agency-facing question: when a producer looks at a lead, how do they see the email thread?

**Option A: Unified Conversation Log**
- All interactions (calls, SMS, emails, form submissions, uploads) appear in a single chronological timeline per lead.
- Emails show as expandable cards with subject, preview, full body on click.
- Pros: Single pane of glass. Producer sees the full story.
- Cons: Can get noisy if there are many touchpoints. Need good filtering/collapsing.

**Option B: Dedicated Inbox View**
- A separate "Inbox" tab in the agency dashboard that looks like a simplified email client.
- Threads grouped by lead. Unread/read state. Ability to reply manually.
- Pros: Familiar email mental model. Good if producers need to manually intervene in email threads.
- Cons: Another view to check. May fragment attention.

**Option C: Minimal — Status Only**
- Email interactions show only as status badges on the Quote Readiness Dashboard: "Email sent", "Email opened", "Reply received", "Data extracted".
- Raw email content accessible via drill-down but not a primary surface.
- Pros: Simplest to build. Keeps focus on data completeness, not communication management.
- Cons: Producers can't easily see what was actually said or manually follow up via email.

**Recommendation**: Start with **Option A** (unified log) as the primary view, with **Option C** status badges on the dashboard for at-a-glance monitoring. Defer a full inbox (Option B) unless producer feedback demands it.

### Email Content Design

- **Mobile-first HTML**: Most customers will open on mobile. Keep emails short, scannable, with clear CTAs.
- **Two primary CTAs**:
  1. "Complete your info" → Smart Form link
  2. "Upload your current policy" → Dec Page uploader link
- **Personalization**: Agency name, producer name, customer first name, list of 2-3 specific missing items in plain language ("We still need your vehicle's VIN and your date of birth").
- **Reminder emails**: Shorter, reference the original, different subject line to avoid "same email again" fatigue.
- **Bilingual**: Ability to send in Spanish with English fallback link. Template system must support language variants.

### Manual Override / Intervention

- Can a producer manually send an email from within our platform to a customer?
  - If yes: we need a compose UI, reply threading, and likely OAuth or SMTP integration with the producer's actual email.
  - If no: producer falls back to their own email client. We lose visibility into that thread.
- **Recommendation**: V1 — no manual email compose from our platform. Producers use their own email for ad-hoc follow-up. We handle only automated outbound + inbound reply parsing. Revisit in V2 based on demand.

---

## 4. Key Flows

### Flow 1: Post-Call Automated Email
1. Call ends → voice-to-structured-data extracts fields → missingness engine identifies gaps.
2. Communication job created → channel decision: if email available, include email.
3. Email generated: dynamic content from MissingDataProfile, rendered in agency-branded template.
4. Sent via transactional ESP. Tracked: delivery, open, click.
5. Customer clicks "Complete your info" → smart form (pre-filled with known data).
6. OR customer replies directly with info → inbound parse → LLM extraction → fields updated.
7. OR customer attaches a deck page → routed to parsing pipeline.
8. Missingness engine re-evaluates. If complete → mark job done. If not → schedule reminder.

### Flow 2: Reminder Cadence
1. 72h after initial email, if still incomplete → send reminder email (shorter, different subject).
2. Track engagement. If no open after 2 emails → consider SMS-only for remaining attempts.
3. Max 3 email attempts. After that, flag for producer manual follow-up.

### Flow 3: Customer Reply Parsing
1. Customer hits "Reply" on email and types: "Here is my VIN: 1HGBH41JXMN109186"
2. Inbound parse webhook fires → body extracted.
3. LLM parses reply against the MissingDataProfile for this lead.
4. Extracted fields written to CapturedField with `source = email_reply`.
5. If attachments present → queue DeckPageParsingJob.
6. Confirmation reply sent: "Thanks! We got your VIN. We'll have your quote ready shortly."

---

## 5. Open Questions & TODOs

- [ ] **TODO: Align with CX platform decisions** — If we are building or buying a broader customer experience / engagement platform, email sending and orchestration should likely live there rather than being a standalone integration. Need to understand current thinking on CX platform architecture.
- [ ] **TODO: Align with AMS integration plans** — Some AMS platforms (Applied Epic, Hawksoft, EZLynx) have built-in email/communication logs. Do we need to sync our email events back to the AMS? Or is our platform the source of truth for communication?
- [ ] **TODO: Align with contact management** — Where does the canonical customer contact record live? If we're sending email, we need to know: is this email address verified? Has the customer opted out? Is there a preferred language? This likely lives in a shared contact/lead service.
- [ ] **TODO: Align with conversational management** — If we have a broader conversational AI or messaging platform, email threads should integrate with that unified conversation model rather than being siloed.
- [ ] **Deliverability testing**: Before launch, test with major providers (Gmail, Outlook, Yahoo) for inbox placement, especially with agency-branded from-addresses.
- [ ] **Legal review**: Confirm transactional email classification (not marketing) for CAN-SPAM purposes given our use case.
- [ ] **Agency onboarding flow**: Design the DNS setup experience for white-labeled from-addresses. How much can we automate?

---

## 6. Research Questions (for subagent)

1. What are the top transactional email providers in 2025-2026? Compare SendGrid vs Postmark vs Amazon SES vs Resend on: pricing, deliverability reputation, inbound parse capabilities, template support, webhook reliability.
2. What orchestration platforms (Customer.io, Braze, Knock, Courier, etc.) support multi-channel (email + SMS) with programmable logic? How do they compare on pricing for our scale (thousands of leads/month, not millions)?
3. Best practices for insurance-industry email outreach to consumers — deliverability tips, subject line patterns, open rate benchmarks.
4. How do other insurtech platforms (Bind, Hippo, Lemonade, Bold Penguin) handle post-lead email follow-up for data collection?
5. What's the state of the art for LLM-based email reply parsing in structured data extraction? Any off-the-shelf tools or is this custom?

---

## 7. Research Findings Summary

*See [[research_email]] for full details.*

### Recommended Stack

| Layer | Vendor | Why | Cost |
|---|---|---|---|
| **Transactional sending** | **Postmark** | Best deliverability reputation, dedicated IP included at Scale plan ($85/mo for 50K emails), inbound parse at $0 extra. 98%+ inbox placement. | $15-85/mo |
| **Orchestration** | **Knock** | Usage-based pricing ($0.005/notification), multi-channel (email + SMS + in-app), programmable workflows via API, good for our scale. | $0-250/mo |
| **Templates** | **React Email** | Dev-controlled, version-controlled, responsive. Open source. | Free |
| **Reply parsing** | **Custom LLM pipeline** | No off-the-shelf tools exist for insurance-specific email reply parsing. Build with GPT-4o-mini or Claude Haiku — same pipeline shared with SMS. | ~$5-20/mo in LLM costs |
| **Address validation** | **Postmark DKIM/SPF wizard** | Simplifies per-agency DNS setup. | Included |

### Key Findings

- **Postmark vs SendGrid**: Postmark has 50% better inbox placement in independent tests. SendGrid is cheaper at high volume but has reputation issues with shared IPs. Postmark is the clear winner for transactional email at our scale.
- **Orchestration**: Knock is preferred over Customer.io for V1 — usage-based pricing means we pay nothing until volume grows, vs Customer.io's $100/mo minimum. Both support email + SMS + programmable workflows.
- **Inbound parse**: Postmark's inbound parse is free and webhook-based. Perfect for receiving customer replies and routing to our LLM parsing pipeline.
- **Insurance email benchmarks**: Insurance transactional emails see 40-60% open rates (vs 20-25% for marketing). Subject lines with agency name + specific ask perform best.
- **Reply parsing is custom**: No vendor does this. We build a shared LLM service that takes free-text email/SMS replies + the lead's MissingDataProfile and extracts structured fields. Estimated 2-3 weeks to build.

### Cost Estimate

| Scale | Monthly Cost |
|---|---|
| Launch (1,000 emails/mo) | $20-45 |
| Growth (10,000 emails/mo) | $85-300 |
| Scale (50,000 emails/mo) | $250-750 |

### Implementation Timeline: 6-10 weeks

| Weeks | Milestone |
|---|---|
| 1-2 | Postmark setup, DNS configuration, React Email templates |
| 3-4 | Knock integration, workflow definitions, dynamic content from MissingDataProfile |
| 5-6 | Inbound parse setup, LLM reply parsing pipeline (shared with SMS) |
| 7-8 | Per-agency from-address config, deliverability testing |
| 9-10 | Integration testing, bilingual templates, analytics |
