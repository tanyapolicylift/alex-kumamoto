# Spec: SMS/Text Channel for Cycle Time Compression

References: [[cycle_spec]], [[cycle_brainstorm]], [[cycle_prd]]

---

## Purpose

SMS is the **primary outbound channel** for automated follow-up with customers who have incomplete quote data. Text messages have significantly higher open rates (~98%) and faster response times than email. This spec covers: how we send and receive SMS, conversational data collection, compliance, and key build-vs-buy decisions.

---

## 1. Technical Questions

### Sending

- **SMS provider**: Twilio, Vonage (Nexmo), Bandwidth, Telnyx, or a higher-level platform like Zipwhip (now Twilio), MessageBird, etc.?
- **Number strategy**:
  - **Toll-free number**: Single number for all agencies. Fast to set up, good throughput, but less personal.
  - **Local numbers**: One per agency (or per producer). Feels more local/trusted. Requires 10DLC registration.
  - **Short code**: High throughput, recognizable, but expensive ($500-$1000/month) and slow to provision (8-12 weeks).
  - **10DLC (10-Digit Long Code)**: Industry standard for A2P (application-to-person) messaging. Requires brand and campaign registration with The Campaign Registry (TCR). Moderate throughput. This is likely our path.
- **10DLC registration**:
  - We register as the platform (ISV/CSP).
  - Each agency is a "brand" registered under us.
  - Campaign type: likely "Insurance" or "Account Notifications" use case.
  - Vetting can take days-weeks. Must plan for agency onboarding lead time.
- **MMS support**: Do we need to send images (e.g., a screenshot of what a deck page looks like, to help customers find theirs)? MMS is slightly more expensive but higher engagement.
- **Message length**: SMS is 160 chars (or 70 for Unicode/emoji). Longer messages split into segments (more cost). Keep messages concise. Use link shorteners (but beware: some carriers filter shortened URLs — use branded short domains).

### Receiving & Conversational Collection

- **Two-way SMS**: Essential. Customer replies come back to our number via webhook.
- **Session management**: When we ask "What's your VIN?" and they reply "1HGBH41JXMN109186", we need to know which lead/question this reply maps to. Options:
  - **Phone number → lead mapping**: Simple if one number per customer per active job. But what if a customer has multiple quotes or re-engages later?
  - **Stateful conversation context**: Track the "last question asked" per phone number so we can interpret the reply.
- **LLM parsing of replies**: Same pipeline as email. Parse free-text replies against the MissingDataProfile. Handle:
  - Clean answers: "1HGBH41JXMN109186" → VIN field.
  - Multi-field answers: "2019 Honda Civic, VIN 1HGBH..., I drive about 10k miles a year" → multiple fields.
  - Ambiguous answers: "yeah sure" → doesn't map to anything useful. Need fallback: "Thanks! Could you provide [specific field]?"
  - Off-topic or confused: "What is this?" → explain who we are, reference the agency, offer opt-out.
- **Conversational depth**: How many back-and-forth turns do we allow via SMS before pushing to smart form?
  - Recommendation: Max 2-3 targeted questions via SMS. If more than 3 fields missing, the initial message should push to the smart form, not try to collect everything conversationally.
- **Photo/MMS inbound**: Customer sends a photo of their dec page or driver's license. We need to:
  - Detect the MMS attachment.
  - Route to the appropriate parsing pipeline (deck page parser, DL OCR).
  - Confirm receipt: "Got your photo! We're extracting the details now."

### Compliance (TCPA, CTIA, Carrier Policies)

- **TCPA (Telephone Consumer Protection Act)**:
  - We need **prior express consent** to send automated texts. Where do we capture this?
    - During the initial call (voice agent or human gets verbal consent → logged).
    - On the web form (checkbox/disclosure).
    - In the chat interaction (disclosure + implied consent).
  - Consent must be for the specific purpose (quote follow-up).
  - Must honor opt-out immediately. "STOP" keyword → auto-unsubscribe.
- **10DLC compliance**:
  - Register brand + campaign with TCR.
  - Include opt-out language in first message: "Reply STOP to opt out."
  - Don't send prohibited content (SHAFT categories — we're fine, insurance is allowed).
  - Message throughput limits depend on trust score (starts low, increases with good behavior).
- **Quiet hours**: Some states restrict texting during certain hours (e.g., not before 8am or after 9pm local time). Implement sending windows per customer timezone.
- **CTIA guidelines**: Follow carrier best practices — identify yourself in first message, provide opt-out, don't spam.

---

## 2. Build vs Buy Analysis

### What We Can Buy / Integrate

| Capability | Buy Options | Notes |
|---|---|---|
| SMS sending/receiving | Twilio, Telnyx, Bandwidth, Vonage | Commodity API; all support 10DLC, webhooks, MMS |
| 10DLC registration | Via SMS provider (Twilio handles TCR registration) | Some providers simplify this more than others |
| Orchestration | Customer.io, Braze, Knock, Courier | Multi-channel orchestration with SMS support |
| Conversational AI | Twilio Flex, Heymarket, Podium, Textline | Full two-way SMS platforms with agent handoff |
| Opt-out management | Built into SMS providers (STOP keyword handling) | Standard feature |
| Link shortening | Bitly (branded), Rebrandly, or self-hosted | Branded short domain recommended for deliverability |

### What We Likely Need to Build

| Capability | Why Build |
|---|---|
| Dynamic message generation from MissingDataProfile | Our domain logic — which fields to ask for, how to phrase, bilingual |
| Conversational SMS state machine | Track what question was asked, parse response, decide next action |
| Reply parsing → structured field extraction | LLM-powered; shared with email parsing pipeline |
| MMS inbound → deck page routing | Detect photo attachments, route to OCR/parsing pipeline |
| Consent tracking & audit log | Legal requirement; must tie consent event to each message sent |
| Communication job lifecycle | Shared across email + SMS: tracks the overall follow-up status |

### Hybrid / TBD

- **Full conversational platform vs lightweight**: Do we use a conversational SMS platform (like Podium, Heymarket) that already has inbox UIs and agent handoff? Or do we build a thin layer on top of Twilio?
  - If we're building a broader CX platform: thin Twilio layer makes sense, we own the UI.
  - If we want speed-to-market: a platform like Heymarket or Textline gives us an inbox + two-way SMS quickly but may not integrate well with our data model.
- **Shared orchestration with email**: Ideally SMS and email share the same communication job and orchestration engine. Buy a multi-channel orchestrator (Customer.io, Knock) or build one?

---

## 3. UX Questions

### How Do We Represent SMS Conversations?

**Option A: Unified Conversation Log (same as email)**
- SMS messages appear in the same per-lead timeline alongside calls, emails, form submissions.
- Each message shown as a chat bubble (outbound = our message, inbound = customer reply).
- Pros: Consistent with email approach. Full context in one place.
- Cons: Mixing channels in one view can be confusing — email is long-form, SMS is short.

**Option B: Dedicated SMS/Chat Pane**
- A chat-like interface (think iMessage or WhatsApp) per lead, separate from the timeline.
- Producer can see the full SMS thread and optionally jump in to send a manual text.
- Pros: Natural for SMS. Easy to read back-and-forth. Good for manual intervention.
- Cons: Another surface. Producers may not check it.

**Option C: Inbox-Style View**
- All active SMS conversations in a list (like Podium, Heymarket, or a helpdesk inbox).
- Click a conversation → see the thread. Reply button for manual messages.
- Sortable by: most recent, needs attention, awaiting reply.
- Pros: Great for CSRs who manage multiple leads. Familiar pattern.
- Cons: Heavier to build. May be overkill if most SMS is automated.

**Recommendation**: For V1, **Option A** (unified log with chat-bubble rendering for SMS) plus a **lightweight inbox view** (Option C) that shows only conversations needing attention (e.g., customer asked a question we couldn't auto-parse). This gives visibility without building a full messaging platform.

### Manual Agent Takeover

- **Critical question**: Can a producer or CSR "jump into" an automated SMS conversation and send a manual message?
  - If yes: we need a compose box in the UI, and logic to pause automation while a human is engaged (avoid crossing wires).
  - If no: automated messages only. Producer uses their personal phone or agency phone to text separately (we lose visibility).
- **Recommendation**: V1 — allow manual send from the SMS thread view, but with a clear "pause automation" toggle. If a producer sends a manual message, the automation pauses for that lead until re-enabled or a timeout (e.g., 24h).

### Notification to Producers

- When a customer replies to an SMS, should the producer get notified?
  - **If the reply was successfully parsed** → no notification needed (data flows in silently, dashboard updates).
  - **If the reply couldn't be parsed or customer asked a question** → notify producer (in-app notification, optional email/Slack alert).
- This avoids alert fatigue while ensuring human-needed situations get attention.

---

## 4. Key Flows

### Flow 1: Post-Call SMS with Smart Form Link
1. Call ends → missingness engine identifies 5+ missing fields.
2. Communication job created → SMS is primary channel.
3. Message sent: "Hi [Name], thanks for calling [Agency]! To wrap up your auto quote, we need a few more details. Tap here to complete: [Smart Form Link]. Or upload your current policy: [Upload Link]. Reply STOP to opt out."
4. Track: delivery, link clicks.
5. If no response in 72h → reminder: "Hi [Name], just a quick follow-up from [Agency]. Your quote is almost ready — we just need: [top 2 missing fields]. [Smart Form Link]"

### Flow 2: Conversational SMS (Few Missing Fields)
1. Missingness engine identifies only 1-2 simple fields missing (e.g., VIN, DOB).
2. Message sent: "Hi [Name], one more thing for your auto quote at [Agency] — what's the VIN of your 2019 Honda Civic? (It's on your registration or inside the driver door.) Reply STOP to opt out."
3. Customer replies: "1HGBH41JXMN109186"
4. LLM parses → VIN extracted → CapturedField written.
5. Confirmation: "Got it, thanks! We'll have your quote ready shortly."
6. If another field still missing: "One last thing — what's your date of birth?"
7. After max 2-3 conversational turns, if still incomplete → "Thanks for the info so far! A few more details are needed — tap here to finish: [Smart Form Link]"

### Flow 3: Inbound MMS (Photo of Dec Page)
1. Customer sends a photo of their auto insurance declaration page as a text reply (unprompted, or in response to the upload prompt).
2. MMS webhook fires → image attachment detected.
3. Route to DeckPageParsingJob → OCR + LLM extraction.
4. Reply: "Thanks for sending your policy info! We're reviewing it now and will have your quote ready soon."
5. Extracted fields populate CapturedField with `source = mms_upload`.
6. Missingness engine re-evaluates → if complete, close job.

### Flow 4: Opt-Out
1. Customer replies "STOP" at any point.
2. Immediately: stop all automated SMS for this customer.
3. Reply with legally required confirmation: "[Agency]: You've been unsubscribed. No more messages will be sent. Reply START to re-subscribe."
4. Update communication job → status = `abandoned_opt_out`.
5. Flag lead for producer: "Customer opted out of SMS. Manual follow-up may be needed."

---

## 5. Open Questions & TODOs

- [ ] **TODO: Align with CX platform decisions** — If we are building or buying a customer engagement / messaging platform, SMS should be a channel within that platform, not a standalone integration. Need to understand current CX platform architecture and vendor considerations.
- [ ] **TODO: Align with AMS integration plans** — Do we log SMS conversations back to the AMS (Applied Epic, Hawksoft, EZLynx)? Some AMS platforms have activity/note APIs where we could push SMS records for compliance and audit trail.
- [ ] **TODO: Align with contact management** — Where is the canonical phone number and consent record stored? We need a single source of truth for: phone number validity, consent status, opt-out history, preferred language.
- [ ] **TODO: Align with current conversational management** — If we already have a voice agent or chatbot platform, SMS conversations should share the same conversation/session model. Understand current architecture for conversation state.
- [ ] **TODO: Consent capture mechanism** — Define exactly how and when we capture SMS consent during each ToF hook (call, chat, form). This is a legal/compliance dependency.
- [ ] **Number provisioning per agency**: When onboarding a new agency, do we auto-provision a 10DLC number and register their brand? What's the timeline and cost? This affects go-live speed.
- [ ] **A/B testing framework**: We want to test different message content, cadence, and channel strategies. Do we need a built-in experimentation layer, or can we use the orchestration platform's A/B features?

---

## 6. Research Questions (for subagent)

1. Compare Twilio vs Telnyx vs Bandwidth vs Vonage for programmatic SMS in 2025-2026: pricing (per message, per number, 10DLC fees), 10DLC registration experience, MMS support, webhook reliability, conversational features.
2. What is the current 10DLC registration process and timeline? What trust scores do new ISVs typically get? What throughput limits should we expect initially?
3. How do insurance-focused platforms (EZLynx, HawkSoft, Podium for Insurance, Heymarket) handle SMS? Any that offer embeddable SMS or white-label SMS we could leverage?
4. What are the best multi-channel orchestration platforms for startups (Customer.io vs Knock vs Courier vs Braze vs OneSignal)? Compare on: SMS + email support, programmable workflows, pricing at ~5-50K messages/month, API-first design.
5. TCPA compliance best practices for automated SMS in insurance — consent capture patterns, quiet hours by state (CA, TX, OH, FL), record-keeping requirements.
6. What open-source or off-the-shelf tools exist for conversational SMS state management? Or is this universally custom-built?
