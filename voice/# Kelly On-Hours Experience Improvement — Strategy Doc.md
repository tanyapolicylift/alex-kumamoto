
**Date:** April 2, 2026 **Author:** Raghav + Claude working session **Status:** Draft — in progress

---

## Executive Summary

Kelly's on-hours orchestrator prompt (`voice/orchestrator/instructions-working-hours`) is built to transfer. The identity section says "receptionist" but the routing guidelines say "categorize and route immediately." Agencies increasingly expect Kelly to function as a real on-hours receptionist: greeting callers warmly, fielding questions she can answer, gathering useful context before transferring, and routing to the right person — not just the nearest `transferToHuman` call.

This doc maps the current state, defines the ideal experience per use case, identifies every gap, and lays out the surgical prompt changes needed to close them.

---

## The Strategic Shift

**Today:** Kelly on-hours = transfer bot with a friendly voice. **Goal:** Kelly on-hours = smart receptionist who answers what she can, assists by gathering context, and routes intelligently when needed.

```
TRANSFER BOT ◄─────────────────────► FULL SELF-SERVICE
(today)                                 (not the goal)

              SMART RECEPTIONIST
              (where we want to be)
```

A smart receptionist operates in three modes depending on the situation:

- **ANSWER** — Handle it herself (general questions, agency info, insurance education)
- **ASSIST → ROUTE** — Gather context, then transfer to the right person (quotes, service, claims)
- **ROUTE** — Transfer immediately, no friction (caller asks for a person, wants a human, is escalating)

---

## Prompts In Scope

|Prompt File (Langfuse)|Role|Changes Needed?|
|---|---|---|
|`voice/orchestrator/instructions-working-hours`|Core routing logic, identity, greeting handoff|**Yes — primary target**|
|`voice/shared/quote-information`|Quote intake flow|**Yes — on-hours ending needs live transfer option**|
|`voice/shared/system-instructions`|Tone, formatting, TTS rules|**No — already strong**|
|`voice/shared/agency-information`|Agency knowledge base (templated)|**No — data source, not behavior**|
|`voice/shared/language`|Language detection and switching|**No**|

---

## Current State: Call Flow Map

```
Caller calls during business hours
  │
  ▼
Static greeting plays (configured per agency, outside prompt)
  │
  ▼
Orchestrator takes over
  │
  ├── Caller wants a QUOTE
  │     → Get insurance type (~1-2 turns)
  │     → transferToQuote
  │     → Full intake collected
  │     → "An agent will call you back" → hangUp
  │     ❌ No live transfer option. Callback promised even though office is open.
  │
  ├── Caller has EXISTING POLICY QUESTION
  │     → Brief acknowledgment (~1 turn)
  │     → transferToHuman
  │     ❌ No name collected. No context gathered. Agent starts from scratch.
  │
  ├── Caller wants to SCHEDULE A MEETING
  │     → transferToBooking
  │     ✅ Clean path.
  │
  ├── Caller needs DRIVER ADDITION
  │     → transferToHuman
  │     ❌ No context gathered.
  │
  ├── Caller has a CLAIM
  │     → ❌ NO PATH DEFINED. Undefined behavior.
  │
  ├── Caller asks for a SPECIFIC PERSON
  │     → ❌ NO PATH DEFINED. No directory access.
  │
  ├── Caller asks a GENERAL QUESTION
  │     → Identity says "answer it" but no guidance on depth or boundaries.
  │     → ❌ Ambiguous behavior — Kelly may answer or may route randomly.
  │
  ├── Caller just wants A HUMAN
  │     → ❌ NO PATH DEFINED.
  │
  └── Caller is ANGRY / ESCALATING
        → ❌ NO PATH DEFINED.
```

---

## Current State: Problems Summary

|#|Problem|Impact|Root Cause|
|---|---|---|---|
|1|Identity vs. behavior mismatch — prompt says "receptionist" but instructs "router"|Kelly's personality promises help she never delivers|Routing guidelines override identity section|
|2|Quotes end in callback even when office is open|Caller called during hours expecting to talk to someone. Gets told to wait.|Quote intake prompt hardcodes callback language with no on-hours branch|
|3|No pre-transfer context gathering|Agent gets a blind transfer. Caller repeats everything.|No instruction to collect name or summarize before transferring|
|4|"Don't ask for name until call is ending" rule|Fights receptionist model. Name late = data collection feel. Name early = personal.|Rule was written for after-hours callback flow, carried into on-hours|
|5|No claims routing path|Kelly improvises or ignores claims requests|Simply missing from routing guidelines|
|6|No "specific person" routing path|Caller asks for Sarah, Kelly can't help|Directory feature planned but not yet built; no prompt path regardless|
|7|No "just want a human" path|Caller feels trapped in phone tree|Not defined in routing guidelines|
|8|No escalation/angry caller path|Kelly may try to "help" an angry caller instead of fast-tracking to human|Not defined|
|9|General questions have no depth guidance|Kelly may give too little or too much, or route when she could answer|Identity says "answer" but no boundaries defined|
|10|No voicemail/failed-transfer handling|Caller hits voicemail, calls back, starts from scratch with no acknowledgment|No session memory + no prompt guidance for this scenario|
|11|No message-taking path|Real receptionist fallback missing — "Can I take a message?" never happens|Tool may exist but no prompt instructs Kelly to offer it|

---

## Ideal On-Hours Use Case Map

| #   | Use Case                        | Kelly's Mode   | What She Does                                                                                              | Pre-Transfer Context              | Ends With                                             | Toggle Candidate                                                                   |
| --- | ------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Greeting & intent discovery** | —              | Static greeting plays. Kelly asks name, lets caller state need, triages naturally.                         | N/A                               | Proceeds to relevant path                             | `collect_name_early: on/off`                                                       |
| 2   | **New quote**                   | ASSIST → ROUTE | Gets insurance type, collects intake info, then offers to connect to live agent.                           | Name, insurance type, intake data | `transferToQuote` → intake → `transferToHuman` (live) | `quote_handling: intake_and_transfer / intake_and_callback / transfer_immediately` |
| 3   | **General questions**           | ANSWER         | Answers from agency info + general insurance knowledge. Offers transfer if question goes beyond her depth. | N/A                               | Answers, asks if anything else                        | `general_questions: answer_fully / answer_then_offer / transfer_immediately`       |
| 4   | **Existing policy / service**   | ASSIST → ROUTE | Gets name, brief description of need. Transfers to right person with context.                              | Name, what they need              | `transferToHuman` with context                        | —                                                                                  |
| 5   | **Claims**                      | ASSIST → ROUTE | Gets name, basic claim info (what happened, when, policy type). Transfers.                                 | Name, claim basics                | `transferToHuman` with context                        | `claims_handling: capture_basics / transfer_immediately`                           |
| 6   | **Directory routing**           | ROUTE          | "Can I speak to Sarah?" → Checks directory, transfers.                                                     | Name of caller if collected       | `transferToHuman` (specific person)                   | Requires directory feature                                                         |
| 7   | **"Just want a human"**         | ROUTE          | "Sure, let me get someone on the line." No interrogation.                                                  | Name if already collected         | `transferToHuman`                                     | —                                                                                  |
| 8   | **Angry / escalating**          | ROUTE          | Immediate transfer. Don't try to fix. "Let me get you to someone who can help."                            | Minimal                           | `transferToHuman`                                     | —                                                                                  |
| 9   | **Scheduling**                  | ROUTE          | Hands to booking.                                                                                          | N/A                               | `transferToBooking`                                   | Already works                                                                      |

---

## Transfer Experience Design

### The Core Problem

Kelly transfers calls, but she can't guarantee anyone picks up. The office being "open" doesn't mean every person is at their desk. A real receptionist knows this and sets expectations accordingly.

### Design Principles

1. **Never guarantee availability.** Kelly should say "Let me get you over to [person/team]" not "Let me connect you with [person] right now."
2. **Set voicemail expectations when appropriate.** For transfers to specific people: "If she's not at her desk you might hit her voicemail." For general transfers, lighter touch.
3. **Offer message-taking as a fallback.** Before transferring, especially to a specific person: "If you'd rather, I can take a message and make sure she gets it."
4. **Handle the callback gracefully.** Kelly has no session memory. If a caller says "I just called and got voicemail" — Kelly responds to what they tell her: "Oh, sorry about that. I can try transferring you again, or I can take a message."

### Pre-Transfer Script Framework

**General transfer (no specific person):**

> "Let me get you to one of our agents. One sec." → `transferToHuman`

**Transfer to specific person:**

> "Let me get you over to [name]. If she's not at her desk you might hit her voicemail, but I'm happy to take a message instead if you'd prefer." → Caller chooses → transfer or message

**Caller says they already hit voicemail / calling back:**

> "Oh, sorry about that. I can try again, or if you'd like I can take a message and make sure [name/the team] gets it." → Caller chooses → transfer or message

---

## Open Questions / Dependencies

|#|Question|Owner|Impact|Status|
|---|---|---|---|---|
|1|**What call logging tools does Kelly have today?** Does `recordQuoteInformation` exist for non-quote calls? Is there a general `recordCallLog` tool?|CTO|Determines whether pre-transfer context is logged anywhere useful|❓ Need to ask|
|2|**Warm transfer technical scope** — What does it take to pass Kelly's collected context to the receiving agent (screen pop, whisper, CRM note)?|CTO / Eng|Determines ROI of pre-transfer intake. Even without tech, logging has value.|❓ Future scope|
|3|**Staff directory feature** — What's the data model? Name, extension, role/description? Per-location?|Product / Eng|Blocks Use Case 6 (directory routing)|❓ Planned, not built|
|4|**Message-taking tool** — Confirmed Kelly can take messages. What tool does she call? Where does the message go?|CTO|Blocks the voicemail fallback pattern|❓ Need to confirm tool name/behavior|
|5|**Session memory** — Confirmed Kelly has NO cross-call memory today. Is this on the roadmap?|Eng|Affects voicemail callback scenario. Current design works without it.|✅ Confirmed: not available today|
|6|**Per-agency toggles** — When does the toggle infrastructure need to be built? Can we write prompts now with `{{variables}}` that toggles will populate later?|Product / Eng|Affects how we parameterize the prompt changes|❓ Future scope|

---

## Toggle Framework (Future State)

Rather than custom prompts per agency, we design one prompt with configurable behavior via toggles:

|Toggle|Options|Default|What It Controls|
|---|---|---|---|
|`collect_name_early`|on / off|on|Whether Kelly asks for name after intent is stated|
|`quote_handling`|`intake_and_transfer` / `intake_and_callback` / `transfer_immediately`|`intake_and_transfer`|How much Kelly does for quotes on-hours|
|`general_questions`|`answer_fully` / `answer_then_offer` / `transfer_immediately`|`answer_then_offer`|How deep Kelly goes on general questions|
|`claims_handling`|`capture_basics` / `transfer_immediately`|`capture_basics`|Whether Kelly gathers claim info before transferring|
|`ai_disclosure`|`on_greeting` / `only_if_asked`|`only_if_asked`|Whether Kelly mentions she's AI in the opening|
|`intent_discovery`|`natural` / `structured`|`natural`|Whether Kelly lets caller talk vs. offers menu-style options|

Prompts will be written for the **default (medium)** setting. Toggle logic can wrap sections later with `{{#if}}` conditionals or similar.

---

## Change Plan: Use Case by Use Case

### Completed

- ✅ **Use Case 1: Greeting & Intent Discovery** — 2 changes drafted (1A: name early, 1B: natural intent discovery)

### Up Next

- Use Case 2: Quotes on-hours
- Use Case 3: General questions
- Use Case 4: Existing policy / service requests
- Use Case 5: Claims
- Use Case 6: Directory routing
- Use Case 7: "Just want a human" / escalation

---

## Change Table (Rolling — Updated Per Use Case)

|Prompt File|Use Case|Change #|Previous Language|Updated Language|Positive Impacts|Risk to Consider|
|---|---|---|---|---|---|---|
|`instructions-working-hours`|Intent / Name|1A|"Don't ask for name or phone number until the call is ending."|"Once the caller states what they need, ask for their first name. Keep it natural: 'And who am I speaking with?' or 'Can I grab your name?' Get the name before transferring or starting intake. Don't ask for phone number unless the call is ending without a transfer."|Receptionist feel. Agent gets context on transfer. Caller feels known.|Some callers may not want to give name. Don't press if declined. **Toggle:** `collect_name_early`|
|`instructions-working-hours`|Intent Discovery|1B|"After the greeting, figure out what the caller needs:" (then immediately lists routing categories)|"After the greeting, let the caller tell you what they need. Don't rush to categorize or route. If their request is clear, act on it. If it's vague or general, ask one clarifying question before routing. Example: Caller says 'I have a question' — respond with 'Sure, what's going on?' not 'Is this about an existing policy or a new quote?'"|Conversational, not phone-tree. Natural triage.|Could add 1-2 turns. Mitigated by system instructions enforcing brevity. **Toggle:** `intent_discovery`|
|_More rows added as we complete each use case_|||||||

---

_This is a living document. Updated as we work through each use case._