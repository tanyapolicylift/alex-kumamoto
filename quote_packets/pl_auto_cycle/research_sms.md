---
created: 2026-02-10
author: Alex (via Claude research)
status: complete
tags: [pl-auto-cycle, sms, research, compliance, vendor-comparison]
references: [[spec_sms]], [[cycle_prd]], [[cycle_spec]]
---

# SMS Platform Research: Automated Post-Lead Follow-Up for Insurance

Research conducted February 2026. Covers SMS providers, 10DLC registration, multi-channel orchestration, insurance-focused platforms, TCPA compliance, and conversational SMS architecture for our personal auto/home quote follow-up use case.

**Use case reminder**: After a customer calls an insurance agency for a personal auto or home quote but doesn't provide all needed data, we automatically send SMS messages asking them to complete a smart form or upload their current policy. We also handle two-way conversational SMS (asking simple questions, parsing replies) and receive MMS photos of declaration pages.

**Target**: CA, TX, OH, FL | 5 agencies growing to 50+ | 5K-50K messages/month initially.

---

## Table of Contents

1. [SMS Provider Comparison](#1-sms-provider-comparison)
2. [10DLC Registration Process](#2-10dlc-registration-process)
3. [Multi-Channel Orchestration Platforms](#3-multi-channel-orchestration-platforms)
4. [Insurance-Focused SMS Platforms](#4-insurance-focused-sms-platforms)
5. [TCPA Compliance for Automated Insurance SMS](#5-tcpa-compliance-for-automated-insurance-sms)
6. [Conversational SMS State Management](#6-conversational-sms-state-management)
7. [Build vs Buy Recommendation](#7-build-vs-buy-recommendation)

---

## 1. SMS Provider Comparison

### Pricing Comparison (US, 10DLC numbers, as of early 2026)

| Feature | Twilio | Telnyx | Bandwidth | Vonage (Nexmo) | MessageBird (Bird) |
|---|---|---|---|---|---|
| **SMS Outbound (per msg)** | $0.0079 | $0.004 | $0.004 | $0.0075-$0.008 | ~$0.008 |
| **SMS Inbound (per msg)** | $0.0079 | $0.004 | Free | ~$0.005 | ~$0.008 |
| **MMS Outbound (per msg)** | $0.0200 | $0.0200 | $0.015 | Limited/add-on | Not publicly listed |
| **MMS Inbound (per msg)** | $0.0100 | $0.0100 | Not listed | Limited | Not publicly listed |
| **Local Number (monthly)** | $1.15 | ~$1.00 + $0.10 SMS add-on | ~$1.00 | Quote-based | ~$1.00 |
| **Carrier Surcharges** | Pass-through ($0.002-$0.006/msg) | Pass-through | Pass-through | Pass-through | Pass-through |

**Notes on carrier surcharges**: All providers pass through carrier fees (AT&T ~$0.003/msg, T-Mobile ~$0.003/msg, Verizon ~$0.003-$0.006/msg). These are unavoidable regardless of provider.

### Cost Estimate at Our Scale

At 25K messages/month (midpoint of our range), using 10DLC local numbers:

| Provider | Base SMS Cost | Carrier Fees (~$0.003) | 10 Numbers | Monthly Total |
|---|---|---|---|---|
| **Twilio** | $198 | $75 | $12 | ~$285 |
| **Telnyx** | $100 | $75 | $11 | ~$186 |
| **Bandwidth** | $100 (outbound only) | $75 | ~$10 | ~$185 |
| **Vonage** | $188-$200 | $75 | Quote | ~$275+ |
| **MessageBird** | $200 | $75 | ~$10 | ~$285 |

### Feature Comparison

| Feature | Twilio | Telnyx | Bandwidth | Vonage | MessageBird |
|---|---|---|---|---|---|
| **10DLC Registration** | Handles TCR registration in-dashboard. Most mature. $46 brand + $15/mo campaign. | Handles TCR. Still alpha API for 10DLC management. | Handles TCR. Enterprise-oriented. | Handles TCR. Adequate. | Less US-focused. |
| **MMS Support** | Full send/receive. Excellent. | Full send/receive. Good. | Full send/receive. Good. | Limited. MMS is an add-on. | Not well-documented for US. |
| **Webhook Reliability** | Industry standard. Retry logic, status callbacks. | Very reliable. Webhook inspector in dashboard. | Reliable. Enterprise SLAs. | Good. | Good. |
| **Conversations API** | **Twilio Conversations API** -- built-in session/state management, threaded conversations, state timers. Best in class. | Basic webhooks. No built-in conversation layer. | Basic webhooks. No conversation layer. | Basic. | Basic. |
| **Developer Experience** | **Best overall.** Massive docs, SDKs for every language, huge community, Stack Overflow answers for everything. | Good docs, responsive support. Smaller community. | Enterprise-focused docs. Less community content. | Adequate docs. Aging developer portal. | Good docs but less US market focus. |
| **Insurance-Specific** | No special insurance features, but used extensively in insurance via ISV integrations. | None specific. | Used by some enterprise insurance platforms. | None specific. | None specific. |
| **ISV/Platform Support** | **Best.** Sub-accounts for multi-tenant. Messaging Services for number pooling. | Messaging Profiles for multi-tenant. Adequate. | Enterprise multi-tenant support. | Basic multi-tenant. | Adequate. |

### Provider Assessment

**Twilio (Recommended for V1)**
- Pros: Best developer experience, most mature 10DLC registration, Conversations API for session management, largest ecosystem, most SDKs and integrations, sub-accounts for multi-agency architecture.
- Cons: Most expensive per-message pricing. Can nickel-and-dime with add-ons.
- Best for: Teams that want the fastest path to production with the most documentation and community support.

**Telnyx (Best Value / Consider for V2)**
- Pros: Roughly 50% cheaper per SMS than Twilio. Good documentation. Pay-as-you-go with no minimums.
- Cons: 10DLC API still in alpha (as of early 2026). Smaller community. No built-in conversation session management.
- Best for: Cost-sensitive scaling. Consider migrating after V1 proves the model.

**Bandwidth (Enterprise Alternative)**
- Pros: Tier-1 carrier (owns network infrastructure, not reselling). Free inbound SMS. Low MMS pricing. Used by many CPaaS platforms behind the scenes.
- Cons: More enterprise-oriented, less startup-friendly. Documentation less accessible for small teams.
- Best for: If we later need carrier-grade SLAs or want to go direct-to-carrier.

**Vonage / MessageBird: Not Recommended**
- Vonage's MMS support is limited and requires add-ons -- a deal-breaker for our dec page photo use case.
- MessageBird (now Bird) is increasingly focused on non-US markets and CRM capabilities rather than US A2P messaging. Pricing transparency is poor.

---

## 2. 10DLC Registration Process

### Overview

10DLC (10-Digit Long Code) is now mandatory for all A2P (application-to-person) SMS in the US. As of February 2025, unregistered traffic is blocked by all major carriers. We must register through The Campaign Registry (TCR).

### Registration Architecture for Our Platform

We register as a **CSP (Campaign Service Provider)** / **ISV (Independent Software Vendor)**. This means:

1. **We register once as a CSP** with TCR (through our SMS provider).
2. **Each agency we onboard becomes a "Brand"** registered under our CSP account.
3. **Each brand gets one or more "Campaigns"** (the messaging use case).

This is the correct model for a multi-tenant platform serving multiple agencies.

### Registration Costs (as of August 2025 TCR fee update)

| Fee Type | Amount | Frequency | Notes |
|---|---|---|---|
| **CSP Registration** | ~$200 | One-time | Includes 10 user licenses |
| **Brand Registration** | $4.50 per brand | One-time | Per agency |
| **Authentication+ Verification** | $12.50 per brand | One-time (if needed) | Required for certain brand types |
| **Standard External Vetting** | $40-$42 per brand | One-time | Recommended for higher trust scores |
| **Enhanced External Vetting** | ~$101.50 per brand | One-time | For maximum trust score boost |
| **Campaign Vetting** | $15 per campaign | One-time at approval | Also charged on resubmission if rejected |
| **Campaign Monthly** | $1.50-$10 per campaign | Monthly (3-month minimum) | Depends on use case category |

**For our use case**: "Insurance" or "Customer Care" campaign type = **$10/month per campaign**.

**Per-agency onboarding cost**: ~$4.50 (brand) + $40 (vetting) + $15 (campaign) + $10/mo = **~$70 one-time + $10/month recurring**.

At 50 agencies: ~$3,500 one-time + $500/month ongoing for 10DLC registration fees alone.

### Registration Timeline

| Step | Duration | Notes |
|---|---|---|
| Brand Registration | 1-3 business days | Automated for most standard brands |
| External Vetting (optional but recommended) | 1-5 business days | Gets higher trust score |
| Campaign Approval | 3-7 business days | Can be 7-10 days if trust score < 50 triggers manual review |
| **Total** | **5-15 business days** | Plan for ~2 weeks per agency in onboarding flow |

### Trust Scores and Throughput

Trust scores range 0-100 and directly determine how many messages per second (MPS) you can send per campaign.

| Trust Score | AT&T MPS | T-Mobile MPS | Assessment | What to Expect |
|---|---|---|---|---|
| **75-100** | 75 MPS | 75 MPS | Excellent | Registered corporation with EIN, external vetting, established web presence |
| **50-74** | 40 MPS | 40 MPS | Good | Standard registration with some vetting |
| **1-49** | 4 MPS | 4 MPS | Poor | New/unvetted brands, triggers manual carrier review |
| **Sole Proprietor** | 0.25 MPS (shared) | 1 MPS | Very Limited | Not recommended for any business use |

**What new ISV registrants typically get**: Without external vetting, new small-business brands typically score in the 30-50 range, landing in the low tier (4 MPS). With standard external vetting ($40), scores typically jump to 50-75 range (40 MPS). This is sufficient for our use case -- even at 4 MPS, that is 240 messages per minute, more than enough for 5-50 agencies.

**At our scale (25K messages/month)**: Even the lowest tier of 4 MPS = 14,400 messages per hour. We could send our entire monthly volume in under 2 hours. Throughput is not a practical concern at our scale.

### Tips for Higher Trust Scores

1. **Always do external vetting** ($40/brand). The ROI on throughput alone makes it worthwhile.
2. **Use the agency's EIN (tax ID)** during brand registration, not a personal SSN.
3. **Ensure the agency has a live website** that matches the registered business name.
4. **Use domain-based email** for the brand contact (not gmail/yahoo).
5. **Register the correct legal entity name** that matches IRS records exactly.
6. **Choose a specific use case** ("Insurance" or "Customer Care") rather than "Mixed" -- declared campaigns get better throughput at the same trust score.

---

## 3. Multi-Channel Orchestration Platforms

These platforms sit above the SMS provider and orchestrate when/how to send messages across channels (SMS + email + push).

### Platform Comparison

| Feature | Customer.io | Knock | Courier | Braze | OneSignal |
|---|---|---|---|---|---|
| **SMS Support** | Yes (built-in Twilio integration or bring-your-own) | Yes (integrates with Twilio, Telnyx, etc.) | Yes (integrates with Twilio, etc.) | Yes (native SMS, MMS, RCS) | Yes (newer, less mature) |
| **Inbound SMS Handling** | **Yes.** Added Sept 2025. Keyword-based routing, campaign triggers from inbound messages. | Limited. Primarily outbound notification orchestration. | Limited. Primarily outbound. | **Yes.** Custom keyword handling, two-way conversation via Canvas. | Limited. |
| **Email + SMS Orchestration** | **Strong.** Visual workflow builder with delays, branching, channel selection. | Good. Cross-channel workflows with batching, throttling. | Good. Visual Journeys with cross-channel orchestration. | **Strongest.** Canvas Flow with real-time branching across all channels. | Basic. Workflow builder is less mature. |
| **Opt-out Management** | Automatic STOP/UNSUBSCRIBE handling. | Via SMS provider. | Via SMS provider. | Built-in keyword management + opt-out handling. | Via SMS provider. |
| **Pricing Model** | Usage-based. Starts ~$100/mo for messaging tier. | Message-based. Free tier available, scales up. | Per-message + per-user. | **Enterprise pricing.** $50K+/year minimum. | Freemium. Free tier generous. Paid from ~$9/mo. |
| **Target Audience** | Startups & mid-market. | Developer teams. Product notifications. | Developer teams. | Enterprise. | Developer/startup. |
| **API-First** | Yes | Yes, excellent | Yes | Yes | Yes |
| **Our Scale Fit** | **Best fit.** Right price point, right feature set. | Good for notifications, weaker for conversational. | Good infrastructure, less insurance-relevant. | Overkill and too expensive for our stage. | Too basic for our needs. |

### SMS-Specific Capabilities Deep Dive

**Customer.io**
- Manages SMS sending either through their built-in Twilio integration or via your own Twilio/provider account.
- Added inbound SMS support in September 2025: automatically handles opt-out keywords (STOP/UNSUBSCRIBE), can trigger campaigns from inbound replies, supports multi-split branching based on reply keywords.
- If you bring your own Twilio account, you point your messaging service's inbound webhook to Customer.io for forwarding.
- Supports MMS sending (images in outbound messages).
- Visual workflow builder with delays, wait-for-reply, conditional branching.
- **Limitation**: Inbound handling is keyword-based, not true conversational AI. For our LLM-based reply parsing, we would still need custom logic that receives the parsed intent and feeds it back.

**Braze**
- Most mature SMS/MMS capabilities. Built-in keyword triggers, custom responses, multi-language keyword sets.
- Canvas Flow provides sophisticated journey orchestration with real-time branching.
- Two-way messaging: can process inbound replies, send automatic responses, and route to human agents.
- **Limitation**: Enterprise pricing ($50K+/year minimum) is prohibitive for our stage. Otherwise it would be ideal.

**Knock**
- Excellent developer experience with comprehensive docs, native SDKs, git-like commit system.
- Best notification infrastructure for engineering teams: batching, throttling, flexible preferences.
- **Limitation**: Primarily outbound/notification-focused. Does not natively handle inbound SMS routing or conversational flows. Would need to pair with direct provider webhooks.

**Courier**
- Visual Journeys with drag-and-drop cross-channel orchestration.
- Drop-in UI components (notification inbox).
- **Limitation**: Less mature SMS features. Pricing scales with both messages and users.

**OneSignal**
- Strong on push notifications. SMS capabilities are newer and less proven.
- Multi-channel support (SMS, email, push, WhatsApp).
- Very affordable pricing.
- **Limitation**: SMS and workflow features are less mature than Customer.io or Braze. Not ideal for our conversational requirements.

### Orchestration Assessment

**Customer.io is the best fit for our stage and use case.** It offers:
- Right price point for startup (~$100-300/month at our volume)
- SMS + email orchestration in one visual workflow builder
- Inbound SMS handling (added 2025) for keyword routing
- Twilio integration (bring your own account)
- API-first design for custom integrations

However, Customer.io's inbound SMS is keyword-based, not conversational AI. For our LLM-powered reply parsing, we will need a **hybrid approach**: Customer.io for orchestration/scheduling/opt-out, with custom webhook handlers for inbound reply parsing that feed structured data back into Customer.io via their API.

---

## 4. Insurance-Focused SMS Platforms

### Agency-Facing SMS Platforms

| Platform | Key Features | Insurance Focus | White-Label / API | Pricing |
|---|---|---|---|---|
| **Heymarket** | Omnichannel (SMS, WhatsApp, Apple Messages). Team inbox. SOC 2 + HIPAA compliant. | Yes -- specific insurance page. Lead nurture, payment collection, service updates. 10DLC included ($10/mo/campaign). | API available. Many integrations (Salesforce, HubSpot, Zendesk). No documented white-label. | Per-user pricing. Standard/Plus/Pro/Enterprise tiers. Min 2 users. |
| **Podium** | AI Employee that auto-responds to leads in <1 minute. Review management + texting. | Used by local businesses including agencies. | API available. Less developer-friendly. | Subscription plans. Premium pricing. |
| **Textline** | HIPAA-compliant. Team collaboration. Purpose-built for regulated industries. | Good compliance posture for insurance. | API available. Better developer docs than Podium. | Per-user pricing. |
| **Zipwhip (now Twilio)** | Acquired by Twilio in 2021 for $850M. Zipwhip's toll-free messaging capabilities absorbed into Twilio's platform. | Historical insurance agency user base (30K+ orgs pre-acquisition). | Now part of Twilio. Not a standalone product. | N/A -- use Twilio. |

### AMS Platform SMS Capabilities

| AMS Platform | Built-in SMS? | Notes |
|---|---|---|
| **Applied Epic** | No native SMS. | Can push activity notes via API. Third-party integrations (Sonant AI, etc.) add SMS. |
| **EZLynx** | Limited. | Has "Client Engagement" features including some messaging, but not full programmatic SMS. Marketing automation module exists. |
| **HawkSoft** | No native SMS. | Strong API for data sync. Partner integrations handle communication. |
| **QQCatalyst** | No native SMS. | Standard AMS, no messaging. |
| **AgencyZoom / Zywave** | Some messaging features. | CRM layer on top of AMS. Some text capabilities but not programmable. |

### Assessment for Our Use Case

**None of these platforms are suitable as our primary SMS infrastructure.** Here is why:

1. **Heymarket / Podium / Textline** are designed for agency staff to manually text customers from an inbox UI. They are not designed for fully automated, LLM-driven conversational flows triggered by API events.
2. They do not expose the level of programmability we need (dynamic message generation from a MissingDataProfile, LLM parsing of replies, MMS routing to OCR pipeline).
3. No white-label or embeddable SMS capabilities that would let us build our own UX on top.
4. Per-user pricing makes them expensive at scale (each agency staff member = another seat).

**Where they might be useful**: If we want to give agencies a manual messaging fallback (producer can text a customer directly), we could integrate Heymarket or Textline as an optional add-on. But our core automated flow should be built on Twilio/Telnyx with our own orchestration.

---

## 5. TCPA Compliance for Automated Insurance SMS

### Federal TCPA Requirements

| Requirement | Details |
|---|---|
| **Consent Type** | Prior **express written consent** required for automated/marketing texts. Verbal consent alone is NOT sufficient for automated SMS. |
| **Consent Capture** | Must be a clear affirmative action (unchecked checkbox, signed form, explicit text opt-in). Pre-checked boxes are invalid. |
| **Consent Scope** | Must be specific to the purpose (e.g., "quote follow-up communications from [Agency Name]"). |
| **Quiet Hours (Federal)** | No messages before 8:00 AM or after 9:00 PM in recipient's local time zone. |
| **Opt-Out Handling** | Must honor any reasonable opt-out method (not just STOP). As of April 11, 2025, FCC requires honoring opt-out via phone, text, email, or any reasonable method. Must action within 10 business days. |
| **Sender Identification** | Must identify the sender in the first message. |
| **Penalties** | $500 per violation (base), $1,500 per willful violation. No cap on total damages. Class action exposure is significant. |

### State-Specific Quiet Hours (CA, TX, OH, FL)

| State | Quiet Hours | Additional Restrictions | Key Notes |
|---|---|---|---|
| **California** | 8:00 AM - 9:00 PM local | CCPA applies: must disclose data collection, provide opt-out, honor data access requests. Stricter than federal in practice. | CA is litigious. Conservative approach recommended. |
| **Texas** | 9:00 AM - 9:00 PM (Mon-Sat), 12:00 PM - 9:00 PM (Sunday) | **SB 140 (effective Sept 1, 2025)**: Expands telemarketing law to cover text messages. Requires registration + $200 fee + $10,000 security bond for marketing texts to TX residents. **However**: consent-based messaging programs are exempt from registration per TX AG guidance (Nov 2025). Insurance companies are also exempt. | Critical to capture consent properly to qualify for exemption. |
| **Ohio** | 8:00 AM - 9:00 PM (federal standard) | No additional state-specific SMS restrictions beyond federal TCPA. | Follow federal rules. |
| **Florida** | 8:00 AM - 8:00 PM local | **Stricter than federal** -- Florida cuts off at 8 PM, not 9 PM. Florida Telephone Solicitation Act applies. | Must implement FL-specific 8 PM cutoff. |

### Recommended Quiet Hours Implementation

To stay safe across all four target states:

| Day | Safe Window |
|---|---|
| **Monday - Saturday** | 9:00 AM - 8:00 PM (recipient local time) |
| **Sunday** | 12:00 PM - 8:00 PM (recipient local time) |

This is the most conservative overlap of all four states' requirements. Using recipient local time is critical -- we need timezone data for each customer phone number (can be derived from area code or zip code).

### Consent Capture for Our Use Case

Our primary ToF (top of funnel) hooks and corresponding consent capture methods:

| Hook | Consent Method | Implementation | Legal Strength |
|---|---|---|---|
| **Inbound call (voice agent)** | Verbal disclosure + verbal "yes" recorded in call audio | Voice agent says: "We'd like to follow up by text to help complete your quote. Is that okay?" Record the response. | Moderate. Audio recording is evidence, but express **written** consent is gold standard for TCPA. Consider sending a confirmation SMS: "You agreed to receive texts from [Agency]. Reply YES to confirm. Reply STOP to opt out." |
| **Web form / smart form** | Checkbox + disclosure text | Unchecked checkbox with text: "I agree to receive text messages from [Agency Name] about my insurance quote. Msg & data rates may apply. Reply STOP to opt out." | **Strong.** Store timestamp, IP address, form version, disclosure text shown. |
| **Chat widget** | Inline disclosure + explicit confirmation | Before first message: "By providing your phone number, you consent to receive text messages from [Agency]. Reply STOP to opt out." User must type/click confirmation. | Moderate-Strong. Log the chat transcript as consent record. |

### Record-Keeping Requirements

For every SMS consent, store and retain:

- **Timestamp** of consent (UTC)
- **Method** of consent (web form, voice call, chat)
- **Exact disclosure language** shown/spoken to customer
- **Customer action** (checked box, said "yes", typed confirmation)
- **IP address** (if web-based)
- **Phone number** consented for
- **Campaign/purpose** consented to
- **Evidence**: Screenshot of form, call recording clip, chat transcript

Retain records for **minimum 5 years** (some attorneys recommend 6+ years given statute of limitations).

### 2025-2026 TCPA Litigation Landscape

This is important context for risk assessment:

- **Q1 2025 saw 507 TCPA class actions filed** -- a 112% increase from Q1 2024.
- Over 100 lawsuits in March 2025 alone alleged quiet hours violations.
- New wave of litigation specifically targeting timing restrictions in SMS programs.
- **Virginia SB 1339 (effective Jan 1, 2026)**: Requires honoring text opt-out commands for 10 years.
- The litigation environment is extremely active. Compliance is not optional.

### Opt-Out Implementation Requirements

1. **First message** must include opt-out instructions: "Reply STOP to opt out."
2. **STOP keyword** must immediately halt all automated messages.
3. **Confirmation message** after STOP: "[Agency]: You've been unsubscribed. No more messages will be sent. Reply START to re-subscribe."
4. As of April 2025 FCC rules: Must also honor opt-out via **any reasonable method** (email, phone call, etc.), not just STOP keyword.
5. Must process opt-outs within **10 business days**.
6. **HELP keyword** should return: "[Agency]: For help, call [phone] or visit [website]. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel."

---

## 6. Conversational SMS State Management

### The Problem

When we text a customer "What's the VIN of your 2019 Honda Civic?" and they reply "1HGBH41JXMN109186", we need to:
1. Know which customer/lead this reply belongs to (phone number mapping)
2. Know what question we asked (conversation state)
3. Parse the reply against the expected field (LLM parsing)
4. Decide what to do next (state transition)

### Existing Solutions

| Tool/Approach | Type | How It Works | Fit for Us |
|---|---|---|---|
| **Twilio Conversations API** | Managed Service | Built-in session management with states (active/inactive/closed), timers for auto-transitions, threaded message history, multi-participant support. | **Good foundation.** Handles the session/threading layer. We add our domain logic on top. |
| **Twilio Studio** | Low-Code Flow Builder | Visual state machine for messaging flows. Drag-and-drop with branching, HTTP requests, variable storage. | Useful for simple flows but may be too rigid for LLM-based dynamic conversations. |
| **Customer.io Inbound Campaigns** | Orchestration | Multi-split branching on inbound keywords. Trigger campaigns from replies. | Good for simple keyword flows (STOP, YES, NO). Not sufficient for free-text LLM parsing. |
| **llm-sms-assistant (GitHub)** | Open Source | Flask app using Twilio + OpenAI + MySQL for SMS conversation management. Stores conversation history, uses LLM for response generation. | Useful reference architecture. Not production-ready but demonstrates the pattern. |
| **Custom State Machine** | Build | Our own state machine backed by a database, tracking: current_state, last_question, expected_fields, conversation_history per phone number. | **Most flexible.** Required for our domain-specific logic. |

### Recommended Architecture: Custom State Machine + Twilio

```
Inbound SMS (Twilio Webhook)
    |
    v
Phone Number Lookup --> Find active ConversationSession
    |
    v
State Machine evaluates:
  - current_state (awaiting_vin, awaiting_dob, awaiting_photo, idle, etc.)
  - message content (text? photo/MMS?)
    |
    v
If text reply:
  LLM Parser (Claude/GPT) extracts structured fields
  - Input: message text + conversation history + expected fields
  - Output: { "vin": "1HGBH41JXMN109186" } or { "unparseable": true }
    |
    v
State Transition:
  - If field extracted --> update MissingDataProfile, check if more fields needed
  - If more needed (and < max turns) --> send next question, update state
  - If complete or max turns reached --> send smart form link, close conversation
  - If unparseable --> send clarification or fallback to smart form
    |
    v
If MMS/photo:
  Route to DeckPageParsingJob
  Send confirmation: "Got your photo! We're reviewing it now."
```

### LLM-Based Reply Parsing for SMS

SMS replies are different from email -- they are terse, often lack punctuation, use abbreviations, and may contain multiple pieces of information in one message.

**Parsing Strategies**:

| Reply Type | Example | Parsing Approach |
|---|---|---|
| Clean single-field | "1HGBH41JXMN109186" | Regex + validation (VIN is 17 chars, alphanumeric). LLM not needed. |
| Multi-field | "2019 civic, 10k miles, vin 1HGB..." | LLM extraction with structured output. Prompt includes expected fields. |
| Ambiguous | "yeah sure" | Cannot extract data. Check if it is a confirmation of a yes/no question. |
| Off-topic | "What is this? Who are you?" | LLM classifies as confusion. Send explanation + agency name + opt-out info. |
| Photo | [MMS attachment] | Route to OCR pipeline. No text parsing needed. |
| Opt-out | "STOP", "stop texting me" | Keyword match first (STOP, CANCEL, UNSUBSCRIBE). LLM fallback for non-standard phrasing. |

**LLM prompt pattern for SMS parsing**:

```
You are parsing a customer's SMS reply in an insurance quote follow-up conversation.

Context:
- Agency: {agency_name}
- Customer: {customer_name}
- We asked: "{last_question}"
- Expected field: {field_name} ({field_type}, {validation_rules})
- Conversation history: {recent_messages}

Customer replied: "{reply_text}"

Extract any structured data. Return JSON:
{
  "extracted_fields": {"field_name": "value", ...},
  "confidence": 0.0-1.0,
  "intent": "answer" | "question" | "confusion" | "opt_out" | "off_topic",
  "suggested_response": "..."
}
```

**Model recommendation**: Claude Haiku or GPT-4o-mini for SMS parsing. Fast, cheap, and sufficient for short-text extraction. Reserve larger models for complex multi-field parsing.

### Conversation Depth Strategy

Based on industry best practices and our use case:

| Missing Fields | Strategy |
|---|---|
| **1-2 simple fields** | Conversational SMS. Ask directly via text. Max 2-3 turns. |
| **3-5 fields** | Send smart form link in first message. Optionally ask 1 easy field conversationally. |
| **5+ fields** | Smart form link only. Do not attempt conversational collection. |
| **Complex fields** (multi-vehicle, coverage details) | Smart form link. These require too much context for SMS. |

---

## 7. Build vs Buy Recommendation

### Recommended Stack

| Layer | Recommendation | Reasoning |
|---|---|---|
| **SMS Provider** | **Twilio** | Best 10DLC registration, Conversations API, MMS support, developer experience. Worth the ~50% premium over Telnyx for V1 speed and reliability. |
| **Orchestration** | **Customer.io** | SMS + email workflows in one platform. Visual workflow builder. Inbound keyword handling. Right price point. |
| **Conversational State** | **Custom build** | No off-the-shelf tool handles our domain-specific state machine (MissingDataProfile-driven questions, LLM parsing, dec page routing). |
| **Reply Parsing** | **Custom build (LLM-powered)** | Shared pipeline with email parsing. Use Claude Haiku / GPT-4o-mini for SMS text extraction. |
| **MMS/Photo Handling** | **Custom build** | Route to existing dec page OCR pipeline. Twilio provides the MMS webhook; we build the routing. |
| **Consent & Compliance** | **Custom build + Twilio opt-out** | Twilio handles STOP keyword automatically. We build the consent audit log, quiet hours enforcement, and record-keeping. |
| **10DLC Registration** | **Twilio (managed)** | Use Twilio's dashboard/API for TCR brand and campaign registration. Automate via API for agency onboarding. |
| **Agent Inbox (V2)** | **Evaluate Heymarket or build** | If agencies need manual messaging fallback, consider integrating a tool like Heymarket. Or build a lightweight inbox view in our dashboard. |

### What to Build vs Buy

| Component | Build or Buy | Effort Estimate | Notes |
|---|---|---|---|
| Twilio integration (send/receive SMS, MMS) | Buy + light integration | 1-2 weeks | Standard webhook + API integration. Well-documented. |
| 10DLC registration automation | Buy (Twilio API) | 1 week | API calls during agency onboarding. |
| Customer.io integration | Buy + configure | 1-2 weeks | Set up workflows, Twilio connection, segment definitions. |
| Quiet hours engine | Build | 3-5 days | Timezone lookup from phone/zip. Scheduling logic. Queue delayed sends. |
| Consent capture & audit log | Build | 1-2 weeks | Database schema, API endpoints, integration with each ToF hook. |
| Conversational state machine | Build | 2-3 weeks | Core custom logic. State transitions, turn counting, escalation to smart form. |
| LLM reply parsing (SMS) | Build (shared with email) | 1-2 weeks | Prompt engineering, structured output, confidence scoring. Leverage email parsing work. |
| MMS inbound routing | Build | 3-5 days | Detect attachment in Twilio webhook, download image, route to OCR pipeline. |
| Message templates & dynamic generation | Build | 1-2 weeks | Template system driven by MissingDataProfile. Bilingual support. |
| Opt-out management | Buy (Twilio) + extend | 3-5 days | Twilio handles STOP keyword. We track in our system and sync to orchestration platform. |

### Total Estimated Implementation Time

| Phase | Duration | What Gets Done |
|---|---|---|
| **Phase 1: Foundation** | 3-4 weeks | Twilio integration, 10DLC setup for first agency, basic outbound SMS (smart form link), opt-out handling, quiet hours. |
| **Phase 2: Conversational** | 2-3 weeks | State machine, LLM reply parsing, 2-3 turn conversational flows, MMS inbound routing. |
| **Phase 3: Orchestration** | 2-3 weeks | Customer.io integration, SMS + email workflow coordination, reminder sequences, A/B testing setup. |
| **Phase 4: Scale** | 2-3 weeks | Agency onboarding automation, 10DLC registration API, monitoring/alerting, cost optimization. |
| **Total** | **9-13 weeks** | Full SMS channel with conversational capabilities |

### Monthly Cost Projection

| Component | 5 Agencies (5K msgs) | 25 Agencies (25K msgs) | 50 Agencies (50K msgs) |
|---|---|---|---|
| Twilio SMS/MMS | ~$65 | ~$285 | ~$550 |
| Twilio Phone Numbers | ~$6 | ~$30 | ~$60 |
| 10DLC Campaign Fees | $50 | $250 | $500 |
| Customer.io | ~$100 | ~$200 | ~$300 |
| LLM Parsing (Haiku/4o-mini) | ~$5 | ~$25 | ~$50 |
| **Total Monthly** | **~$225** | **~$790** | **~$1,460** |

### Migration Path (Cost Optimization at Scale)

Once we reach 50+ agencies and 50K+ messages/month, consider:

1. **Migrate from Twilio to Telnyx** for ~50% SMS cost savings (~$275/mo savings at 50K msgs)
2. **Evaluate Bandwidth** for direct carrier relationships if we need enterprise SLAs
3. **Build custom orchestration** to replace Customer.io if we outgrow their capabilities or want tighter integration
4. **Negotiate volume pricing** with Twilio if staying (volume discounts available above 100K msgs/month)

---

## Sources

### SMS Providers
- [Twilio SMS Pricing](https://www.twilio.com/en-us/sms/pricing/us)
- [Telnyx SMS and MMS Pricing](https://telnyx.com/pricing/messaging)
- [Bandwidth Pricing](https://www.bandwidth.com/pricing/)
- [Vonage SMS API Pricing](https://www.vonage.com/communications-apis/sms/pricing/)
- [Bird (MessageBird) SMS Pricing](https://bird.com/en-us/pricing/sms)
- [Top SMS Providers for Developers 2026 - Knock](https://knock.app/blog/the-top-sms-providers-for-developers)
- [Twilio Alternatives 2026 - Textellent](https://textellent.com/blog/twilio-alternatives/)
- [Telnyx vs Twilio Comparison - Courier](https://www.courier.com/integrations/compare/telnyx-vs-twilio)
- [SMS and MMS Rate Comparison - BayneDM](https://www.baynedm.com/comparing-sms-and-mms-rates-twilio-telnyx-and-klaviyo-cost-breakdown/)

### 10DLC Registration
- [10DLC Registration Cost 2025 Guide for ISVs - Telgorithm](https://www.telgorithm.com/news/how-much-does-10dlc-registration-cost-2025-guide-for-isvs)
- [10DLC Registration and Regulation 2025 - CloudContactAI](https://cloudcontactai.com/10dlc-registration-and-regulation-recent-update/)
- [Twilio A2P 10DLC Fees](https://help.twilio.com/articles/1260803965530-What-pricing-and-fees-are-associated-with-the-A2P-10DLC-service-)
- [Twilio MPS and Trust Scores](https://help.twilio.com/articles/1260803225669-Message-throughput-MPS-and-Trust-Scores-for-A2P-10DLC-in-the-US)
- [Telnyx 10DLC Fees](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges)
- [10DLC Registration Guide - Textedly](https://www.textedly.com/blog/10dlc-registration-and-campaign-vetting)
- [TCR CSP User Guide (Aug 2025)](https://www.campaignregistry.com/wp-content/uploads/CSP-User-Guide_Aug-21-2025-v8.pdf)

### TCPA Compliance
- [TCPA Text Messages Guide 2026 - ActiveProspect](https://activeprospect.com/blog/tcpa-text-messages/)
- [TCPA Quiet Hour Lawsuits - National Law Review](https://natlawreview.com/article/tick-tock-dont-get-caught-navigating-tcpas-quiet-hours)
- [New Class Action Threat: TCPA Quiet Hours - Privacy World](https://www.privacyworld.blog/2025/03/new-class-action-threat-tcpa-quiet-hours-and-marketing-messages/)
- [TCPA Compliance SMS Checklist 2025 - Voxie](https://www.voxie.com/blog/tcpa-compliance-checklist-sms/)
- [TCPA Opt-Out Requirements 2025 - ActiveProspect](https://activeprospect.com/blog/tcpa-opt-out-requirements/)
- [FCC 2025 Opt-Out Rules - BCLP](https://www.bclplaw.com/en-US/events-insights-news/the-tcpas-new-opt-out-rules-take-effect-on-april-11-2025-what-does-this-mean-for-businesses.html)

### Texas SB 140
- [Texas SB 140 Compliance Requirements - CommLaw Group](https://commlawgroup.com/2025/texas-senate-bill-140-registration-and-compliance-requirements-for-telephone-solicitation/)
- [TX AG Confirms Opt-In SMS Exempt - Consumer Financial Services Law Monitor](https://www.consumerfinancialserviceslawmonitor.com/2025/11/texas-attorney-general-confirms-opt-in-sms-is-outside-registration-under-sb-140/)
- [Texas SMS Compliance Law - Sinch](https://sinch.com/engage/resources/sms-compliance/texas-sms-law-sb-140-new-requirements/)

### Orchestration Platforms
- [Customer.io Inbound SMS Support (Sept 2025)](https://docs.customer.io/release-notes/2025-09-04-inbound-sms-support/)
- [Customer.io SMS/MMS Getting Started](https://docs.customer.io/journeys/sms-get-started/)
- [Braze Custom Keyword Handling](https://www.braze.com/docs/user_guide/message_building_by_channel/sms_mms_rcs/keywords/keyword_handling)
- [Knock vs Courier Comparison - Velt](https://velt.dev/blog/knock-vs-courier-notification-api-2025)
- [Braze vs OneSignal - TrustRadius](https://www.trustradius.com/compare-products/braze-vs-onesignal)

### Insurance SMS Platforms
- [Heymarket Insurance SMS](https://www.heymarket.com/texting-for-insurance/)
- [Podium Pricing & Plans](https://www.podium.com/getpricing)
- [Textline vs Heymarket Alternatives](https://www.textline.com/blog/heymarket-alternatives)

### Conversational SMS
- [Twilio Conversations API](https://www.twilio.com/docs/conversations/api)
- [Twilio Conversations States and Timers](https://www.twilio.com/docs/conversations/states-timers)
- [LLM SMS Assistant - GitHub](https://github.com/ImprobabilityLabs/llm-sms-assistant)
- [Multi-Turn LLM Conversations Survey - GitHub](https://github.com/yubol-bobo/Awesome-Multi-Turn-LLMs)

### State SMS Laws
- [Text Messaging Laws by State - EZ Texting](https://www.eztexting.com/resources/sms-resources/text-messaging-laws-by-state)
- [SMS Marketing Laws by State 2025 - Sakari](https://sakari.io/blog/sms-marketing-laws-by-state-a-2025-compliance-guide)
- [California SMS Marketing Laws - ShaneWebGuy](https://shanewebguy.com/understanding-californias-sms-marketing-laws-and-compliance-requirements/)
