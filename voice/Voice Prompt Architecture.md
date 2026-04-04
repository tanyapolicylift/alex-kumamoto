# Voice Prompt Architecture Reference

> Generated from Langfuse on 2026-04-04. 166 voice prompts across 211 total.
> Source of truth: Langfuse project `cmfw9alii02utad07f2jr63p1`

---

## System Overview

The voice system is a **multi-agent architecture** where an **Orchestrator** routes callers to specialized sub-agents. Each agent has its own instructions prompt, per-language message templates, and tool configurations.

```
                         ┌─────────────────────┐
                         │   Incoming Call      │
                         └─────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            Agency OPEN                    Agency CLOSED
                    │                             │
    ┌───────────────┴──────┐      ┌───────────────┴──────┐
    │ orchestrator/         │      │ orchestrator/         │
    │ instructions-         │      │ instructions          │
    │ working-hours (v10)   │      │ (v40, after-hours)    │
    └───────┬──────────────┘      └───────┬──────────────┘
            │                             │
            ├─→ transferToQuote           ├─→ transferToQuote
            ├─→ transferToHuman           ├─→ hangUp (collect name,
            ├─→ transferToBooking         │    issue, callback time)
            └─→ hangUp                    └─→ hangUp
            │
    ┌───────┴────────────────────────────────────┐
    │              QUOTE AGENTS                   │
    │  (transferToQuote routes by insurance type)  │
    │                                             │
    │  ┌─ personal-auto ──┐  ┌─ commercial-gl ─┐ │
    │  │  record-name     │  │  record-name    │ │
    │  │  record-phone    │  │  record-phone   │ │
    │  │  record-email    │  │  record-email   │ │
    │  │  sms-consent     │  │  sms-consent    │ │
    │  │  quote-intake    │  │  quote-intake   │ │
    │  └──────────────────┘  └────────────────┘ │
    │  ... + 25 more insurance types             │
    │  + fallback (unknown type)                 │
    └────────────────────────────────────────────┘
    │
    ├─→ BOOKING AGENTS
    │   ├─ booking/instructions (v11) — full scheduling with calendar
    │   ├─ booking-upfront/instructions (v1) — schedule then collect quote info
    │   └─ booking-with-phone/instructions (v4) — just collect preferred contact hours
    │
    ├─→ GENERAL INFO AGENT
    │   └─ general-info/instructions (v3) — answers questions, transfers back to orchestrator
    │
    └─→ PEO AGENT
        └─ peo/instructions (v5) — Professional Employer Organization intake
```

---

## Agent Routing Logic

### Working Hours (orchestrator/instructions-working-hours)
| Caller Need | Action |
|---|---|
| Quote | Get insurance type → `transferToQuote` |
| Existing policy question | `transferToHuman` (live agent) |
| Meeting scheduling | `transferToBooking` |
| Driver addition | `transferToHuman` |
| Done | `hangUp` |

### After Hours (orchestrator/instructions)
| Caller Need | Action |
|---|---|
| Quote | Get insurance type → `transferToQuote` |
| Existing policy question | Collect name, issue, **preferred callback time** → disclaimer about not binding coverage → `hangUp` |
| Done | `hangUp` |

**Key difference:** After-hours has no `transferToHuman` or `transferToBooking`. Instead collects callback info and hangs up for existing policy questions.

---

## Shared Components

These are reusable prompt fragments composed into agent instructions.

### voice/shared/system-instructions (v5)
Core tone and TTS guidelines shared across all agents:
- Sound human, not scripted (use "Yeah," "Mhmm," natural fillers)
- Keep it short and direct (one sentence usually enough)
- React before responding ("Got it." / "Makes sense.")
- Spell out abbreviations for TTS
- Ask one question at a time
- Never use ellipses, colons, dashes — only periods and commas
- Call is recorded for quality purposes

### voice/shared/agency-information (v4)
Template variables injected per-agency:
- `{{agencyName}}`, `{{licensedStates}}`, `{{locationAddress}}`
- `{{locationHours}}`, `{{insuranceCarriers}}`, `{{policyTypes}}`
- `{{agencyLocationGeneralInfo}}`

### voice/shared/language (v7)
Multi-language support:
- Conversation must be in `{{currentLanguage}}`
- Spell out info using native alphabet names
- Available languages: `{{availableLanguages}}`
- Call `switchLanguage` when language change detected
- After switching, respond briefly — don't re-explain context

### voice/shared/quote-information (v23)
Base prompt for ALL quote intake agents. Provides:
- Role definition (gather info only, no pricing/recommendations)
- Agency information block
- Conversation flow tips
- Ending the call logic (record info → ask if more questions → hangUp)
- Callback time collection if caller needs to go
- Error handling scripts
- Number formatting rules (phone: 3 segments, ZIP: 2 parts)
- Full tone guidelines (duplicated from system-instructions)
- Full language block (duplicated from shared/language)
- DOB validation (birth year >= 1925)

### voice/shared/record-name/instructions (v16)
Single-step agent for capturing first + last name:
- Handles noisy voice transcription ("Kelly with double L", "O'Connor O apostrophe...")
- Tools: `updateName`, `confirmName`, `transferToHuman`
- Silent normalization of spelled-out names, hyphens, apostrophes
- Falls back to asking first name then last name separately
- Allows skipping if caller refuses

### voice/shared/record-email/instructions (v10)
Single-step agent for capturing email:
- Handles spoken email ("john dot doe at gmail dot com")
- Tools: `updateEmail`, `confirmEmail`, `moveOnWithoutEmail`, `transferToHuman`
- 3 failed attempts → `moveOnWithoutEmail`

### voice/shared/record-phone-number/instructions (v10)
Single-step agent for capturing phone number:
- Critical: if user confirms calling-from number, skip to `confirmPhoneNumber` directly
- Handles noisy transcription ("double five", "area code four oh eight...")
- Tools: `updatePhoneNumber`, `confirmPhoneNumber`, `switchLanguage`

### voice/shared/sms-consent/instructions (v5)
Single-step agent for SMS opt-in:
- Simple yes/no collection
- Tools: `recordSmsConsent(granted: true/false)`

### voice/shared/tools/hang-up-description (v2)
2-step closing flow:
1. `hangUp(confirmed=false)` — plays system closing prompt ("anything else?")
2. `hangUp(confirmed=true)` — only after user confirms nothing else needed

---

## Agent Details

### Orchestrator — After Hours
**Prompt:** `voice/orchestrator/instructions` (v40, production label `production`)
**51 versions** — most actively iterated prompt

Key behaviors:
- Agency is **closed**
- Personality: friendly CSR with 10 years experience
- Uses `{{currentDate}}` for time-aware reasoning
- Don't ask name/phone until call is ending
- For existing policy: collect name, issue, **preferred callback time**, then disclaimer: "leaving a message won't automatically bind, change, or delete coverage"
- Tools: `transferToQuote`, `switchLanguage`, `hangUp`

**Messages (EN):**
| Message | Content |
|---|---|
| intro (v12) | "Hi - Thanks for calling {{agencyName}}, this is {{assistantName}} on a recorded line. How can I help?" |
| farewell (v2) | "Thanks for calling us, we appreciate your time. Have a great day! Goodbye." |
| pre-hang-up (v1) | "Is there anything else I can help you with today?" |
| outro (v2) | *(not fetched — likely a closing statement)* |
| transfer-to-human (v1) | *(not fetched — transfer announcement)* |

### Orchestrator — Working Hours
**Prompt:** `voice/orchestrator/instructions-working-hours` (v10)

Key differences from after-hours:
- Agency is **open**
- Has `transferToHuman` for existing policy questions (live transfer)
- Has `transferToBooking` for meeting requests
- No callback time collection needed

### Booking Agent (Full Calendar)
**Prompt:** `voice/booking/instructions` (v11)
**Tools:** `checkAvailability`, `scheduleAppointment`, `transferToHuman`, `hangUp`

3-step flow:
1. **Check availability** — get date/time, call `checkAvailability`
   - Same-day: current time + 10 min buffer
   - 5+ slots: summarize with examples
   - <4 slots: list all
2. **Collect contact** — name → email (optional) → phone (required)
3. **Verify & book** — confirm details → `scheduleAppointment` (call ONCE)
   - Must use EXACT slots from checkAvailability

### Booking Upfront
**Prompt:** `voice/booking-upfront/instructions` (v1)
Same as booking but after successful booking, continues conversation for quote info collection.

### Booking With Phone (Callback Hours)
**Prompt:** `voice/booking-with-phone/instructions` (v4)
**Tools:** `transferToHuman`, `hangUp`

Simpler agent — just collects **preferred contact hours** for agent callback.
- "When's usually the best time for you to take a call?"
- Interprets natural language ("mornings" → 09:00-12:00)
- Confirms and hangs up

### General Info Agent
**Prompt:** `voice/general-info/instructions` (v3)
**Tools:** `transferToOrchestrator`

Educational/informational agent:
- Agency hours, locations, carriers, service areas
- Insurance education (coverage types, deductibles, state minimums)
- Process info (how to get a quote, file a claim)
- Routing triggers: ready for quote → transfer, needs policy service → transfer, wants appointment → transfer
- Transfers back to orchestrator when done

### PEO Agent
**Prompt:** `voice/peo/instructions` (v5)
Professional Employer Organization intake. Collects structured business data:
- Legal business name, DBA, address, industry
- Employee count, states, annual payroll
- Workers comp classifications and experience modifier
- Benefits offered, payroll management method
- Services of interest

Uses JSON schema for structured data collection.

### Quote Fallback
**Prompt:** `voice/quote/fallback/instructions` (v4)
For unknown/unsupported insurance types. Only collects name and phone number, then hangs up. Uses the shared quote-information base prompt but overrides to be minimal.

---

## Quote Agents — Insurance Types

All quote agents share `voice/shared/quote-information` as their base prompt. Each adds type-specific **Information Collection** questions and a JSON `{{schema}}` for structured data.

### Personal Lines (13 types)
Each has: `instructions` + `messages/en/intro` + `messages/es/intro`

| Type | Key Questions |
|---|---|
| **personal-auto** (v7) | DOB, driver's license, location, VIN, ownership, primary use, current carrier, make/model/year, claims history, coverage level |
| **personal-homeowners** | *(standard home questions)* |
| **personal-renters** | *(standard renters questions)* |
| **personal-condo** | *(standard condo questions)* |
| **personal-life** | *(standard life questions)* |
| **personal-boat** | *(standard boat questions)* |
| **personal-rv** | *(standard RV questions)* |
| **personal-motorcycle** | *(standard motorcycle questions)* |
| **personal-flood** | *(standard flood questions)* |
| **personal-umbrella** | *(standard umbrella questions)* |
| **personal-landlord** | *(standard landlord questions)* |
| **personal-dwelling-fire** | *(standard dwelling fire questions)* |
| **personal-earthquake** | *(standard earthquake questions)* |
| **personal-home-warranty** | *(standard home warranty questions)* |
| **personal-jewelry** | *(standard jewelry questions)* |
| **personal-mobile-home** | *(standard mobile home questions)* |
| **personal-named-non-owner-auto** | *(standard non-owner auto questions)* |
| **personal-off-road-vehicle** | *(standard off-road questions)* |
| **personal-pet** | *(standard pet questions)* |
| **personal-rental-dwelling** | *(standard rental dwelling questions)* |
| **personal-short-term-rental** | *(standard short-term rental questions)* |
| **personal-sr22** | *(standard SR-22 questions)* |
| **personal-travel** | *(standard travel questions)* |
| **personal-vacant-property** | *(standard vacant property questions)* |
| **personal-watercraft** | *(standard watercraft questions)* |

### Commercial Lines (7 types)
Each has: `instructions` + `messages/en/intro` + `messages/es/intro`

| Type | Key Questions |
|---|---|
| **commercial-auto** (v5) | *(fleet/vehicle questions)* |
| **commercial-business-owners-policy** (v5) | *(BOP questions)* |
| **commercial-cyber-liability** (v5) | *(cyber risk questions)* |
| **commercial-directors-officers** (v5) | *(D&O questions)* |
| **commercial-general-liability** (v5) | Business name, nature of business, payroll by class code, subcontractor usage, COIs from subs, premises liability, products/completed ops, annual customers/jobs, loss history |
| **commercial-professional-liability** (v5) | *(E&O questions)* |
| **commercial-property** (v5) | *(property questions)* |
| **commercial-workers-compensation** (v5) | *(workers comp questions)* |

### Quote Agent Tools (all types)
```
recordQuoteInformation  — Record collected quote data
transferToBooking       — Route to booking agent
transferToHuman         — Transfer to live agent
hangUp                  — End call (2-step flow)
switchLanguage          — Switch conversation language
```

---

## Message Templates

Messages are short TTS-optimized strings organized by: `voice/{agent}/messages/{lang}/{message-name}`

### Pattern
```
voice/orchestrator/messages/en/intro          → greeting
voice/orchestrator/messages/en/farewell       → goodbye
voice/orchestrator/messages/en/pre-hang-up    → "anything else?"
voice/orchestrator/messages/en/outro          → closing
voice/orchestrator/messages/en/transfer-to-human → transfer announcement
voice/orchestrator/messages/es/*              → Spanish equivalents
```

### Shared Messages
```
voice/shared/messages/en/quote-intro          → "Sure. Let me grab some info now so when an agent calls you back, they're ready to go."
voice/shared/messages/en/quote-book-upfront   → "Sure, let's set that up."
voice/shared/messages/es/quote-intro          → Spanish equivalent
voice/shared/messages/es/quote-book-upfront   → Spanish equivalent
```

### Sub-agent Messages
Each record-* agent has per-language messages:
```
voice/shared/record-name/messages/{en,es}/ask-name
voice/shared/record-name/messages/{en,es}/verify-name
voice/shared/record-name/messages/{en,es}/verify-first-name
voice/shared/record-name/messages/{en,es}/verify-last-name
voice/shared/record-name/messages/{en,es}/verify-first-and-last-name

voice/shared/record-email/messages/{en,es}/ask-email
voice/shared/record-email/messages/{en,es}/verify-email
voice/shared/record-email/messages/{en,es}/move-on-without-email

voice/shared/record-phone-number/messages/{en,es}/ask-phone-number
voice/shared/record-phone-number/messages/{en,es}/verify-phone-number
voice/shared/record-phone-number/messages/{en,es}/verify-initial-phone-number

voice/shared/sms-consent/messages/{en,es}/ask-consent
voice/shared/sms-consent/messages/{en,es}/consent-script
```

---

## Template Variables

Variables injected at runtime across all agents:

| Variable | Description |
|---|---|
| `{{agencyName}}` | Agency display name |
| `{{assistantName}}` | Voice assistant's name |
| `{{licensedStates}}` | States the agency operates in |
| `{{locationAddress}}` | Office address |
| `{{locationHours}}` | Business hours |
| `{{insuranceCarriers}}` | Represented carriers |
| `{{policyTypes}}` | Available insurance types |
| `{{agencyLocationGeneralInfo}}` | Additional agency info |
| `{{currentDate}}` | Today's date for time reasoning |
| `{{currentLanguage}}` | Active conversation language |
| `{{availableLanguages}}` | Supported language list |
| `{{insuranceType}}` | Insurance type (quote agents) |
| `{{schema}}` | JSON schema for structured data (quote agents) |
| `{{transcript}}` | Call/chat transcript (processing prompts) |
| `{{quotePacketInstructions}}` | Quote packet instructions (chat) |
| `{{agencyTimeZone}}` | Agency timezone (chat booking) |

---

## Call Processing Prompts (Post-Call)

These run after the call ends to analyze the transcript:

| Prompt | Purpose |
|---|---|
| `app/call-processing/callback` (v1) | Detect if callback was requested |
| `app/call-processing/summary` (v2) | Generate call summary, outcome, actions |
| `app/call-processing/type` (v3) | Classify call type |
| `app/call-processing/reason` (v2) | Extract call reason |
| `app/call-processing/score` (v1) | Score the call |
| `app/call-processing/spam` (v1) | Detect spam calls |
| `app/call-processing/personal-details` (v2) | Extract personal details |
| `app/call-processing/quote-details` (v5) | Extract quote details |
| `app/call-processing/claim-subtype` (v1) | Classify claim type |
| `app/call-processing/service-subtype` (v1) | Classify service type |

Equivalent `app/chat-processing/*` prompts exist for chat transcripts.

---

## Key Design Patterns

1. **Composition over inheritance** — Shared prompts (system-instructions, language, agency-information) are composed into agent instructions. Some agents inline them, others reference via Langfuse prompt linking.

2. **Single-responsibility sub-agents** — Name, email, phone, SMS consent are each isolated agents with their own tools and verification flows.

3. **Noisy transcription handling** — All data-collection agents expect imperfect STT input and normalize silently (double-L, spelled-out names, spoken phone numbers).

4. **2-step hangUp** — `hangUp(confirmed=false)` plays system prompt, `hangUp(confirmed=true)` only after user confirms.

5. **Bilingual by default** — Every agent supports EN/ES with per-language message templates and `switchLanguage` tool.

6. **No recaps** — Agents are instructed NOT to repeat back information. Brief acknowledgment then next question.

7. **Callback time as safety net** — Quote and PEO agents ask for preferred callback time only when caller needs to leave early.

8. **After-hours disclaimer** — Orchestrator (closed) adds: "leaving a message won't automatically bind, change, or delete coverage."
