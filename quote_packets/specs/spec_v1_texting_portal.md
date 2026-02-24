# V1 Spec: Quote Packet Texting + Portal

> **Scope**: Build the SMS outreach + customer portal extension on top of shipped quote packet templating. Prove that AI chat, AI voice, and form ToF → LLM-generated text + portal link → structured data collection materially accelerates quote packet completion for Ley and JAMCO.

---

## The Build (Two Components)

### 1. LLM-Generated SMS Reply

After any top-of-funnel interaction (AI voice call, AI chat, form submission), the system:

1. Evaluates what data was captured vs. what the agency's template requires
2. Generates a **short, specific, conversational text message** via LLM that:
   - References what the customer just discussed ("Thanks for calling about coverage for your 2021 Civic...")
   - Names 1-2 specific missing items if obvious gaps exist ("We just need your date of birth and driver's license to get started")
   - Provides the portal link as the primary CTA
3. Sends from agency's toll-free number (Twilio V1)

**Message constraints**: Max 2 SMS segments (~300 chars). No generic templates — every message is LLM-generated from the interaction context + missing data profile.

**LLM prompt inputs**: ToF interaction transcript/data, customer name, captured fields, missing required fields (from template), agency name, producer name, **template-level customer specification** (per-agency emphasis guidance — e.g., JAMCO's spec weights current coverage limits as highest priority ask, Ley's spec emphasizes the homeowner cross-sell signal).

### 2. Customer Portal (Branded Link)

A single branded URL per quote packet that presents:

**A. Status Display** — "Here's what we have so far"
- Shows captured fields grouped by category (driver info, vehicles, coverage)
- Read-only, gives customer confidence we're not starting from scratch

**B. Smart Form** — "Help us fill in the gaps"
- Only renders fields that are missing or low-confidence from the template
- Pre-fills anything extracted from ToF interaction (marked "from your call" / "from your form")
- Step-by-step: Drivers → Vehicles → Current Coverage → History
- Save-and-resume (cookie + phone-based lookup)
- Partial submission sends data incrementally to packet

**C. Dec Page Intake** — "Or just share your current policy"
- **Option 1: Photo/PDF upload** — mobile-first camera capture or file upload. Plain-language explainer: "This is the summary page of your current policy — usually 1-2 pages." Visual example thumbnail. Supports multiple uploads (front/back, auto + home). LLM Vision parsing (Claude Sonnet) → extracted fields populate smart form fields with source="dec_page"
- **Option 2: InsureGrid connect** (Ley only, baked into portal) — for agencies that use InsureGrid, embed the InsureGrid link as an alternative intake method within the same Dec Page Intake section. Customer sees one CTA with two paths: "Upload a photo of your policy" or "Connect your current policy via InsureGrid." This avoids sending two separate links in the SMS
- Per-agency portal config determines which options are shown

**Portal is mobile-first, no login required** (accessed via unique link in SMS).

---

## Ley Insurance — Template & Retrieval Spec

**Agency context**: Kyle Ley, solo agent, 30 carriers, PLRater, Hawksoft. Already uses InsureGrid for dec pages ($100/mo flat, 75-80% customer agreement rate). Handles ~2 internet leads/week + bulk phone/referral. Paper quote sheets today.

**Template: `ley_personal_auto_ca`**

| Entity | Field | Type | Required | Voice Mappable | Notes |
|--------|-------|------|----------|---------------|-------|
| **Applicant** | Full name | text | yes | yes | |
| | Date of birth | date | yes | yes | |
| | Mailing address | address | yes | yes | |
| | Phone | phone | yes | yes | |
| | Email | email | yes | yes | |
| | Marital status | select | yes | yes | Single/Married/Domestic Partner |
| | Occupation | text | yes | yes | Kyle asks this every call |
| | Own or rent home | select | yes | yes | Homeowner cross-sell signal |
| | SSN | ssn | no | no | "Gives me a lot of info" — qualification signal, not required V1 |
| **Person** (per driver) | Full name | text | yes | yes | All driving-age adults in household |
| | Date of birth | date | yes | yes | |
| | Driver's license # | text | yes | no | Portal/dec page capture |
| | Gender | select | yes | yes | |
| | Relationship to applicant | select | yes | yes | |
| **Asset** (per vehicle) | Year / Make / Model | text | yes | yes | |
| | VIN | text | yes | no | Dec page or portal entry; validate via NHTSA |
| | Usage | select | no | yes | Commute/Pleasure/Business |
| | Annual mileage | number | no | no | |
| **Prior Coverage** | Current carrier | text | yes | yes | |
| | Policy expiration date | date | yes | yes | |
| | Prior coverage duration | text | no | yes | "How long with current carrier" |
| | Accidents/violations (3yr) | textarea | yes | yes | |
| **Coverage** | Desired liability limits | select | no | no | PLRater defaults; Kyle customizes |

**Ley retrieval strategy**:
- Voice/chat captures: name, DOB, address, marital status, occupation, own/rent, vehicles (Y/M/M), current carrier, expiration, violations — these are Kyle's paper quote sheet fields
- Portal smart form targets: DL#, VINs, additional drivers, desired coverage
- Dec page intake (portal): two paths within the same section — photo/PDF upload OR InsureGrid connect (Kyle already pays $100/mo flat, ~100% customer completion rate). InsureGrid resolves: VINs, current coverage limits, DL#s, prior carrier details

**Ley-specific SMS example**:
> "Hi [Name], thanks for chatting with Kyle at Ley Insurance about your 2021 Civic. To shop your 30 carriers and find you the best rate, we just need a few more details: [portal link] — Kyle"

---

## JAMCO Home & Auto — Template & Retrieval Spec

**Agency context**: Jose Medrano (owner) + Romeo Ocampo (producer). CA-focused, Hawksoft → TurboRater bridge (auto data flows automatically once in Hawksoft). Two segments: old-school 80% (phone, human touch) and tech-forward 20% (want speed, self-service). Romeo spends 5-7 min per call collecting data verbally.

**Template: `jamco_personal_auto_ca`**

| Entity                  | Field                     | Type     | Required | Voice Mappable | Notes                                                                   |
| ----------------------- | ------------------------- | -------- | -------- | -------------- | ----------------------------------------------------------------------- |
| **Applicant**           | Full name                 | text     | yes      | yes            |                                                                         |
|                         | Date of birth             | date     | yes      | yes            |                                                                         |
|                         | Mailing address           | address  | yes      | yes            | Garaging address if different                                           |
|                         | Phone                     | phone    | yes      | yes            |                                                                         |
|                         | Email                     | email    | yes      | yes            |                                                                         |
| **Person** (per driver) | Full name                 | text     | yes      | yes            | Romeo collects all household drivers on call                            |
|                         | Date of birth             | date     | yes      | yes            |                                                                         |
|                         | Driver's license #        | text     | yes      | no             | Portal/dec page — not collected on first call                           |
|                         | Gender                    | select   | yes      | yes            |                                                                         |
|                         | Relationship to applicant | select   | yes      | yes            |                                                                         |
| **Asset** (per vehicle) | Year / Make / Model       | text     | yes      | yes            | Romeo collects verbally                                                 |
|                         | VIN                       | text     | yes      | no             | Hawksoft has VIN lookup; also dec page capture                          |
|                         | Usage                     | select   | no       | yes            |                                                                         |
|                         | Garaging address          | address  | yes      | yes            | If different from mailing                                               |
| **Prior Coverage**            | Current carrier           | text     | yes      | yes            | Critical — Romeo asks every call                                        |
|                         | Current coverage limits   | text     | **yes**  | no             | **"If we don't have this, we quote minimums and lose the deal"** — Jose |
|                         | Current premium           | currency | yes      | yes            | Romeo asks on first call                                                |
|                         | Policy expiration date    | date     | yes      | yes            |                                                                         |
|                         | Payment amount            | currency | no       | yes            |                                                                         |
|                         | Payment method            | select   | no       | yes            |                                                                         |
|                         | Tickets/accidents (3yr)   | textarea | yes      | yes            |                                                                         |
| **Coverage**            | Desired liability limits  | select   | no       | no             | TurboRater defaults to current if known                                 |

**JAMCO retrieval strategy**:
- Voice/chat captures minimum set (per Jose's explicit guidance): name, DOB, phone, email, # of vehicles, current carrier, current premium — **NOT the full 15+ fields** (AI voice fatigue is real for their 80% old-school segment)
- Portal smart form targets: DL#s, VINs, current coverage limits (the deal-critical field), violations, additional driver details
- Dec page uploader is the highest-value path: Jose called this "unique" and his #1 unprompted request — resolves current coverage limits, VINs, DL#s, carrier details in one shot
- **No InsureGrid** — JAMCO doesn't use it

**JAMCO-specific SMS example**:
> "Hi [Name], this is Romeo from JAMCO Insurance. Thanks for reaching out about auto coverage for your [vehicles]. To get you accurate quotes, it'd help to have a few details — easiest way is here: [portal link].  — Romeo"

---

## Technical Stack (V1)

| Component | Tech | Notes |
|-----------|------|-------|
| SMS send/receive | **Twilio** | Toll-free numbers (V1), 2-way, ISV registration model. Migrate to per-tenant 10DLC for production |
| LLM message generation | **Claude Sonnet** | Prompt: interaction context + missing fields + agency voice |
| Portal frontend | **Next.js** (existing app) | New `/portal/[packetId]` route |
| Smart form | **Custom** (React) | Dynamic field rendering from packet template's missing fields |
| Dec page parsing | **Claude Sonnet Vision** | Image/PDF → structured field extraction, $0.02-0.06/doc |
| VIN validation | **NHTSA API** (free) | Check digit + decode confirms validity |
| Data model | **Existing packet template system** | `packet_template` → `entity_template` → `field_template` per V1 ADR |
| Portal auth | **None** | Unique link = access. Phone-based lookup for save/resume |
| Consent evidence | **Custom** (Postgres) | Immutable consent_record table, queryable by recipient + campaign |

---

## Twilio Multi-Tenant Architecture: Registration Strategy

PolicyLift is a **multi-tenant SaaS** sending on behalf of multiple agencies. The core tension: 10DLC requires per-tenant brand + campaign registration (10-15 business day approval each), but we need to rapidly onboard design partners to test and validate hypotheses this week.

### The Options

#### Option A: Toll-Free Per-Tenant (RECOMMENDED for V1)

Buy one toll-free number per agency. Submit toll-free verification per agency. **Approval: 3-5 business days** — roughly 3x faster than 10DLC campaign vetting.

```
PolicyLift (ISV, Primary Business Profile)
  ├── Subaccount: Ley Insurance
  │   ├── Toll-Free Number (1-8XX)
  │   ├── Toll-Free Verification (Ley as end business, 3-5 days)
  │   └── Messaging Service
  │
  ├── Subaccount: JAMCO Insurance
  │   ├── Toll-Free Number (1-8XX)
  │   ├── Toll-Free Verification (JAMCO as end business, 3-5 days)
  │   └── Messaging Service
  │
  └── [Future design partner] → same pattern, 3-5 day turnaround each
```

**Why this works for rapid iteration:**
- 3-5 days to live vs. 10-15 for 10DLC — real messages flowing by end of Week 1
- Adding a new design partner = buy toll-free number + submit verification. No brand/campaign registration cycle
- Twilio offers a **Compliance Embeddable** — a white-label widget we embed in our onboarding flow so agencies self-service their own verification submission. This is how we scale to 10+ partners without manual overhead
- Per-message cost is comparable to 10DLC (slightly higher base, but no campaign monthly fees or vetting fees)
- Toll-free verification still requires per-tenant submission, but the info required is lighter (no EIN required until late 2026, no campaign vetting)

**Tradeoffs:**
- Number is 1-8XX (not local area code) — less "personal" than a local number. For our use case (one follow-up text from a known agency), this is acceptable
- Toll-free compliance is tightening (BRN/EIN required for new verifications starting early 2026) — but we're ahead of that
- Lower throughput ceiling than high-trust-score 10DLC, but irrelevant at our volume

**Required info per agency for toll-free verification (lighter than 10DLC):**

| Field | Description | Notes |
|-------|-------------|-------|
| **Business name** | The agency name | Does not need to match EIN exactly (though it helps) |
| **Business address** | Physical address | |
| **Business website or social URL** | Must be live and accessible | Campaign reviewers check this |
| **Contact name, email, phone** | Authorized rep | Kyle (Ley) / Jose (JAMCO) |
| **Use case description** | What messages are sent and why | We draft this |
| **Sample messages** (2-5) | Actual message examples | We draft these from our LLM templates |
| **Opt-in description** | How consent is captured | We draft this from Consent Architecture section |
| **Privacy policy URL** | Must be live | **Still a blocker** — same as 10DLC |
| **Terms of service URL** | Must be live | Can be PolicyLift ToS if agency doesn't have one |

#### Option B: PolicyLift as Single 10DLC Brand (Fastest 10DLC Path)

Register **PolicyLift itself** (not each agency) as the brand. One campaign: "PolicyLift sends insurance quote follow-ups on behalf of partner insurance agencies." Messages frame as "via PolicyLift."

This is compliant for **value-added SaaS platforms** (not pass-through aggregators). PolicyLift clearly qualifies: we build the AI, generate the messages, manage consent, and own the portal. Vonage's guidance explicitly describes this pattern for platforms like Shopify sending on behalf of merchants.

```
PolicyLift (Single Brand, Low-Volume Standard, $4)
  └── Campaign: "Insurance Quote Platform Follow-Ups" ($15 vetting + ~$10/mo)
      ├── 10DLC Number #1 (assigned to Ley traffic)
      ├── 10DLC Number #2 (assigned to JAMCO traffic)
      └── [Future partner] → just buy new number, assign to existing campaign
```

**Why this is attractive:**
- One-time 10-15 day wait, then **instant onboarding for every new design partner** — just buy a number
- Local area codes possible (more personal than toll-free)
- No per-tenant brand/campaign registration or vetting fees
- Compliant if PolicyLift is identified in messages (e.g., "via PolicyLift" or "powered by PolicyLift")

**Tradeoffs:**
- Initial 10-15 day campaign approval wait — can't send real messages until approved
- Messages must identify PolicyLift as sender (carrier compliance). Can still mention agency name in body, but brand identity = PolicyLift. Example: `"Hi [Name], PolicyLift for Ley Insurance here. Kyle wanted to follow up on your quote..."`
- **Shared risk**: if any agency's traffic triggers carrier complaints, ALL agencies on this campaign are affected. Acceptable for 2-5 design partners; risky at scale
- Carrier reviewers may push back on "on behalf of" framing — risk of rejection. If rejected, costs $15 and resets clock

**Required info: only PolicyLift's own business info** (EIN, legal name, address, website). No per-agency collection needed.

#### Option C: Per-Tenant 10DLC (Production Path, Not V1)

The original spec — full ISV model, each agency gets brand + campaign registration. **10-15 business days per agency.** This is the correct long-term architecture but wrong for a rapid-testing sprint.

Reserve for when we graduate design partners to production and need local numbers + maximum deliverability + isolated compliance risk.

### Recommendation: Start with Option A, Migrate to Option C

| Phase | Approach | Timeline to Live | New Partner Turnaround |
|-------|----------|-----------------|----------------------|
| **V1 Testing (now)** | Toll-Free Per-Tenant (Option A) | 3-5 business days | 3-5 days each |
| **V1.5 (if needed)** | PolicyLift Single Brand 10DLC (Option B) | 10-15 days once | Instant (buy number) |
| **Production (V2)** | Per-Tenant 10DLC ISV (Option C) | 10-15 days each | 10-15 days each |

For the next 1-2 weeks: **Option A gets us sending real texts to real customers by end of Week 1.** We build the portal and LLM pipeline in parallel. When we're ready to scale, we either move to Option B (if we want speed) or Option C (if we want isolation).

### Info We Must Collect From Each Agency

For **Option A (Toll-Free, recommended)**, the info ask is lighter than full 10DLC:

| Field | Description | Notes |
|-------|-------------|-------|
| **Business name** | Agency name | |
| **Business address** | Physical address | |
| **Website URL** | Must be live, accessible | Reviewers check this |
| **Contact person** | Name, email, phone | Kyle (Ley) / Jose (JAMCO) |
| **Privacy policy URL** | Must include SMS/mobile data language | **Day-1 blocker** — draft for them if needed |
| **Preferred reply-to phone** | For HELP keyword responses | Agency main line |
| **Preferred reply-to email** | For HELP keyword responses | |

For **Option B or C (10DLC)**, add: EIN, legal business name (exact IRS match), business type (LLC/Corp), authorized rep #2.

---

## Consent Architecture

### Consent Classification: Our Use Case

Our V1 flow is **customer-initiated informational follow-up**, not marketing/telemarketing:

1. Customer **initiates contact** (calls, chats, submits form) requesting an insurance quote
2. We respond with a **relevant, non-promotional text** containing their specific quote information + portal link to continue the process they started

Under TCPA, if the consumer initiates the conversation and the business responds with relevant information, no prior express written consent is required. This is "conversational" / "informational" messaging — the customer asked for a quote, and we're facilitating that quote.

**However**, for 10DLC campaign registration, carriers and TCR still expect us to demonstrate a clear consent mechanism and opt-in flow regardless of TCPA category. The campaign will be rejected without it.

### V1 Consent Strategy: Belt-and-Suspenders

Even though our use case likely qualifies as conversational/informational, we implement explicit consent capture at every ToF touchpoint for three reasons: (1) 10DLC campaign registration requires a documented opt-in flow, (2) audit protection if a carrier blocking event occurs, (3) future-proofing for reminder/marketing messages in V2.

**Consent capture by ToF channel:**

| Channel | Consent Mechanism | Evidence Captured |
|---------|------------------|-------------------|
| **Form submission** | Checkbox (not pre-selected): "I agree to receive text messages from [Agency Name] regarding my insurance quote. Msg & data rates may apply. Reply STOP to opt out." | timestamp, IP, user-agent, page URL, consent text version, form field values |
| **AI Chat** | Disclosure message before collecting phone number: "[Agency Name] would like to text you a link to continue your quote. Msg & data rates may apply. Reply STOP to opt out." + user sends phone number = implicit consent | timestamp, chat session ID, disclosure message version, user's affirmative response |
| **AI Voice** | Voice agent verbal disclosure: "I'd like to text you a link so you can easily share a few more details for your quote. Is that okay?" + verbal "yes" | timestamp, call recording ID, transcript excerpt with consent, call SID |

### Consent Evidence Data Model

```
consent_record:
  id: uuid
  quote_packet_id: fk
  recipient_phone: string (E.164)
  agency_id: fk (brand)
  campaign_id: string (Twilio campaign SID)
  consent_method: enum [form_checkbox, chat_disclosure, voice_verbal]
  consent_text_version: string (hash of exact disclosure language)
  evidence_payload: jsonb {
    timestamp, ip?, user_agent?, page_url?, call_sid?,
    chat_session_id?, transcript_excerpt?, recording_url?
  }
  status: enum [active, revoked]
  revoked_at: timestamp?
  revocation_method: string? (STOP reply, portal opt-out, etc.)
```

### Opt-Out Handling

- **STOP keyword**: Twilio handles automatic STOP/UNSTOP at the messaging service level. We additionally suppress the recipient in our DB.
- **Any reasonable manner**: Per FCC April 2025 revocation rule, treat any opt-out language (not just STOP) as revocation. Our inbound webhook parses replies and flags potential opt-outs for immediate suppression.
- **HELP keyword**: Auto-reply with agency name + phone number + email. Example: "Ley Insurance: For help, call (555) 123-4567 or email kyle@leyinsurance.com. Reply STOP to unsubscribe."
- **Confirmation message on opt-in**: First SMS includes: agency name, purpose, frequency disclosure, STOP instructions. Example: "Hi [Name], this is [Agency] via PolicyLift. We'll text you about your insurance quote. Msg & data rates may apply. Reply STOP to opt out."

---

## 10DLC Campaign Registration Package

We submit one campaign per agency. Both use the same template (customized per agency):

### Campaign Use Case: `CUSTOMER_CARE` (or `MIXED` if reviewers push back)

This is not marketing — it's quote-process facilitation in response to customer-initiated inquiries.

### Campaign Description (Template)

> "[Agency Name] uses this campaign to send follow-up text messages to customers who have contacted us requesting an insurance quote via phone call, website chat, or online form. Messages contain personalized information about the customer's quote request, a link to a secure portal where the customer can provide additional details needed for their quote, and instructions for opting out. Messages are only sent to customers who have initiated contact and consented to receive texts."

### Message Flow / Call-to-Action Description (Template)

> "Customers initiate contact with [Agency Name] through one of three channels: (1) calling the agency phone number, (2) using the AI chat widget on [agency website URL], or (3) submitting the quote request form on [agency website URL]. During this interaction, the customer provides their phone number and consents to receive a follow-up text message about their insurance quote. For phone calls, the agent verbally confirms 'I'd like to text you a link to continue your quote, is that okay?' For web chat, a disclosure is shown before collecting the phone number. For form submissions, the customer checks a consent checkbox. After consent is obtained, the system sends one text message with a personalized summary and a link to a secure portal. No marketing messages are sent."

### Sample Messages (Submit 3-4)

1. `"Hi {FirstName}, thanks for chatting with {ProducerName} at {AgencyName} about coverage for your {Vehicle}. To shop our carriers and find you the best rate, we need a few more details: {PortalLink}. Reply STOP to opt out."`

2. `"Hi {FirstName}, this is {ProducerName} from {AgencyName}. Thanks for reaching out about auto insurance. The easiest way to get your quote moving is here: {PortalLink}. You can also snap a photo of your current policy page. Reply STOP to opt out."`

3. `"{AgencyName}: You've been unsubscribed and will no longer receive messages. Questions? Call {AgencyPhone}."`

4. `"{AgencyName}: For help, call {AgencyPhone} or email {AgencyEmail}. Reply STOP to unsubscribe."`

### Privacy Policy Requirement

**Both agencies need a live, publicly accessible privacy policy URL** that includes language stating mobile information will not be shared with third parties for marketing purposes. This is a hard requirement — campaigns are rejected without it.

**Action item**: Check if Ley and JAMCO have privacy policies on their websites. If not, we draft one for them (or add SMS-specific language to an existing one). This is a **day-1 blocker** for campaign submission.

---

## Realistic Timeline & Critical Path (Toll-Free Path)

### V1 Launch Cost (Toll-Free Path)

| Item | Per Agency | Two Agencies |
|------|-----------|-------------|
| Registration | $0 | $0 |
| Toll-free number rental | ~$2/mo | ~$4/mo |
| SMS (est. 200 msgs/mo) | ~$4/mo | ~$8/mo |
| **Total** | **~$6/mo** | **~$12/mo** |

---

## Sprint Plan & Open Items

Critical path: toll-free verification (3-5 business days). Build happens in parallel. Risk: verification rejection (unverifiable website, missing privacy policy, unclear opt-in). Resubmission is free.

### Week 1: Registration + Build

| # | Task | Type | Owner | Blocks | Notes |
|---|------|------|-------|--------|-------|
| 1 | Collect agency info from Kyle + Jose: business name, address, website URL, contact name/email/phone, HELP reply phone + email | Biz | Alex | Verification submission | Single message to each — most of this is on their websites |
| 2 | Verify/create privacy policy URLs for both agencies (must include SMS/mobile data non-sharing language) | Biz | Alex | **DAY-1 BLOCKER** for verification | If they don't have one, we draft and host for them |
| 3 | Get Ley InsureGrid embed link format / API details | Biz | Alex | Portal Dec Page Intake (Ley) | Needed to embed InsureGrid as portal option |
| 4 | Confirm JAMCO preferred producer name for SMS (Romeo vs Jose) | Biz | Alex | SMS go-live | Likely Romeo |
| 5 | Submit PolicyLift Primary Business Profile as ISV in Twilio TrustHub | Eng | Eng | Verification submission | One-time; may already exist |
| 6 | Buy 2 toll-free numbers via Twilio | Eng | Eng | Verification submission | |
| 7 | Submit Toll-Free Verifications for Ley + JAMCO | Eng | Eng | Go-live (3-5 day approval) | Use sample messages + opt-in description from this spec |
| 8 | Scope + add consent capture to existing ToF surfaces: form checkbox, chat disclosure, voice agent verbal ask | Eng + Product | Eng | Go-live | Consent Architecture section has exact copy |
| 9 | Modify voice agent to optimize for text follow-up: if customer indicates willingness to continue via text, collect only minimum fields (name, phone, vehicle count, carrier) and hand off to portal — don't ask for 10+ fields verbally | Eng + Product | Eng | Go-live | JAMCO: minimum set per Jose's guidance. Ley: Kyle's paper quote sheet fields are fine for voice since he's used to that flow |
| 10 | Modify chat agent similarly: once phone number captured + consent given, send portal link rather than continuing long data collection in chat | Eng + Product | Eng | Go-live | |
| 11 | Modify form submissions to trigger SMS pipeline: on submit → create packet → generate SMS → send via Twilio | Eng | Eng | Go-live | |
| 12 | Build SMS generation pipeline: LLM prompt (context + missing fields + template customer spec + agency voice), Twilio send, consent evidence store | Eng | Eng | Go-live | |
| 13 | Build portal `/portal/[packetId]`: status display, smart form (dynamic from missing fields), dec page intake (upload + InsureGrid for Ley) | Eng | Eng | Go-live | Mobile-first, no login, unique link |
| 14 | Build consent evidence table + inbound webhook (STOP/HELP/opt-out parsing) | Eng | Eng | Go-live | See Consent Evidence Data Model |

### Week 2: Go Live + Iterate

| # | Task | Type | Owner | Blocks | Notes |
|---|------|------|-------|--------|-------|
| 15 | Toll-free verifications approved (expected Day 3-5) → associate numbers with messaging services | Eng | Eng | Live traffic | |
| 16 | Go live: first real texts to Ley + JAMCO customers | Milestone | — | — | |
| 17 | Measure: text-back click rate, portal completion rate, dec page upload rate, fields filled per session | Analytics | Eng | — | These are the "What We're Proving" metrics |
| 18 | Iterate: LLM message quality, portal UX, dec page parsing accuracy | Eng + Product | Eng | — | |
| 19 | Onboard next design partner if ready (buy number + submit verification, 3-5 day turnaround) | Biz + Eng | Alex + Eng | — | Same pattern as above |

### Deferred (Production Migration to Per-Tenant 10DLC)

| # | Task | Type | Notes |
|---|------|------|-------|
| 20 | Collect EIN, legal business name (exact IRS match), business type per agency | Biz | Required for 10DLC brand reg, not needed for toll-free V1 |
| 21 | Submit per-agency brand + campaign registrations via Twilio ISV model | Eng | 10-15 day approval per agency |
| 22 | Migrate from toll-free to local 10DLC numbers | Eng | Update messaging services, preserve consent records |

---

## V1 Flow (End-to-End)

```
Customer calls / chats / submits form
        ↓
AI extracts structured data → creates quote_packet instance
        ↓
System diffs captured fields vs. template required fields → MissingDataProfile
        ↓
LLM generates personalized SMS using:
  - interaction transcript/summary
  - captured fields (for specificity)
  - missing fields (for the ask)
  - agency voice/name
        ↓
SMS sent via Twilio (single portal link — InsureGrid is inside portal for Ley)
        ↓
Customer clicks portal link
        ↓
Portal shows: what we know (status) + smart form (gaps) + dec page uploader
        ↓
Customer inputs data and/or uploads dec page
        ↓
Data flows into quote_packet → completeness score updates
        ↓
Producer sees updated packet in dashboard, ready for rater entry
```

---

## What We're Proving

1. **Text-back conversion**: Do customers who receive a specific, LLM-generated text after a ToF interaction engage at higher rates than generic follow-ups?
2. **Portal completion**: What % of customers who click the link complete enough fields to generate a quotable packet?
3. **Dec page uplift**: Does offering dec page upload alongside smart form meaningfully reduce remaining gaps (especially for JAMCO's critical current-coverage-limits field)?
4. **Channel-agnostic ToF**: Does the text+portal pattern work equally well regardless of whether the ToF was voice, chat, or form?

---

## Out of Scope (V1)

- Email channel (V2 — BYOD Nylas architecture specced separately)
- Data enrichment APIs (V2 — Canopy Connect + Fenris specced separately)
- Conversational SMS back-and-forth (V1 is one outbound text + portal; no multi-turn SMS)
- Bilingual support (V2)
- Hawksoft/AMS integration (awaiting API, late 2026)
- Home/property templates (V2 — auto only for V1)
- Reminder cadence (V2 — 72h follow-up SMS/email)
