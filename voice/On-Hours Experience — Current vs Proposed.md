---
created: 2026-04-06
author: Raghav + Claude working session
status: draft
tags: [voice, kelly, on-hours, strategy]
---

# On-Hours Experience — Current vs Proposed

## What this doc is

A side-by-side comparison of Kelly's current on-hours behavior vs the proposed on-hours experience. For each scenario a caller might bring, we map: what happens today, what should happen, what changes, and what the implications are.

No prompt language here. Strategy and alignment first.

---

## System Context

**What Kelly has today (tools, no changes needed):**
- `transferToQuote` — routes to insurance-specific quote intake agent
- `transferToHuman(route)` — routes to a live agent, supports named routes per agency config + "default" fallback
- `transferToBooking` — routes to appointment scheduling agent
- `transferToPEOIntake` — routes to PEO intake (conditional)
- `switchLanguage` — language switching
- `hangUp` — 2-step call ending

**What Kelly knows today (data, no changes needed):**
- Agency name, address, hours, licensed states
- Insurance carriers represented
- Policy types offered
- Additional agency info (free-text per agency)

**What Kelly cannot do (hard constraints):**
- No session memory across calls
- No warm transfer (can't pass context to receiving agent)
- No access to caller's existing policy data
- Cannot quote prices, bind coverage, or process changes
- Cannot detect repeat callers or voicemail bouncebacks

---

## Scenario-by-Scenario Comparison

### 1. Greeting & Intent Discovery

**Today:**
Orchestrator takes over after static greeting. Prompt says "figure out what the caller needs" then lists routing categories. Kelly immediately tries to bucket the caller.

**Proposed:**
Kelly lets the caller talk. Responds naturally ("Sure, what's going on?"). Asks for first name early ("And who am I speaking with?"). Then routes based on what she heard.

**What changes:** Routing Guidelines section of orchestrator prompt. One line in Tools & Guidelines section.

**Implications:**
- Adds 1-2 conversational turns before routing
- Caller feels like they're talking to a receptionist, not a phone tree
- Name is collected before transfer, so agent has it
- Risk: some callers want speed. Mitigated by tone guidelines keeping Kelly brief.
- Risk: Kelly might struggle to categorize ambiguous requests. Mitigated by "if vague, ask one clarifying question" instruction.

---

### 2. New Quote

**Today:**
Orchestrator gets insurance type → `transferToQuote` → full intake (name, phone, email, SMS consent, type-specific questions) → `recordQuoteInformation` → "a licensed agent will follow up as soon as possible" → `hangUp`

**Proposed:**
Same flow. Only change: softer callback language since office is open. Instead of "follow up as soon as possible" → "give you a call shortly" or similar.

**What changes:** Minor language tweak in `voice/shared/quote-information` ending section (optional).

**Implications:**
- Minimal change, minimal risk
- We keep callback because without warm transfer, a blind transfer after 5 minutes of intake is worse — the agent has no context and the caller repeats everything
- The callback model is actually better: agent gets all the data, can prep before calling
- Future: if warm transfer is built, we could add a toggle to offer live transfer after intake

**Decision made:** Callback stays. No transfer after quote intake.

---

### 3. General Question

**Today:**
Identity section says "answer general questions about insurance or the agency" and "if someone has a question, answer it before moving on to quoting." But Routing Guidelines has no "general question" path — so Kelly's behavior is ambiguous. She might answer, might try to route, might give too much or too little.

**Proposed:**
Explicit instruction: answer general questions using agency info and general insurance knowledge. Keep answers concise. After answering, ask if there's anything else. If question goes beyond her depth, offer to connect to an agent.

**What changes:** New section in Routing Guidelines.

**Implications:**
- Kelly becomes useful for the most common simple calls: "What are your hours?", "Do you do commercial?", "What carriers do you work with?"
- Reduces unnecessary transfers for questions Kelly can already answer from her agency info
- Risk: Kelly answers something she shouldn't (coverage advice, pricing). Mitigated by existing Limitations section which says she can't do these things.
- Risk: Kelly gives too long an answer. Mitigated by tone guidelines ("one sentence is usually enough").

---

### 4. Existing Policy / Service Request

**Today:**
"Let the customer know you will try to get a licensed agent on the line and call `transferToHuman` tool." That's it. No name collected. No context gathered. Blind transfer.

**Proposed:**
Get name (if not already collected). Ask briefly what they need: "What's going on with your policy?" One question, not an interrogation. Then transfer with the best matching route.

**What changes:** Expanded section in Routing Guidelines.

**Implications:**
- Agent on the other end at least knows caller's name and what they need (even without warm transfer, Kelly's intake is logged somewhere — need to confirm with CTO)
- Adds maybe 30 seconds to the call before transfer
- Risk: caller just wants to be transferred and doesn't want to explain twice. Mitigated by keeping it to one brief question. If caller says "I just need to talk to someone" → route immediately (falls into "just want a human" path).
- Open question: does Kelly's pre-transfer conversation get logged anywhere the receiving agent can see? If not, the context gathering is still valuable for call analytics but doesn't help the agent. Worth confirming with CTO.

---

### 5. Claims

**Today:**
No path defined. Kelly improvises or ignores.

**Proposed:**
Get name. Ask what happened and when — just the basics, don't interrogate. Transfer to claims route (or default if no claims route configured).

**What changes:** New section in Routing Guidelines.

**Implications:**
- Claims callers currently hit undefined behavior — this is a real gap
- Even basic info (name + "my car was hit yesterday") helps
- Risk: caller is stressed/urgent about a claim and doesn't want questions. Mitigated by "just the basics, don't interrogate" instruction + the angry/escalation path catching these cases.
- Same open question as #4: does pre-transfer context get logged?

---

### 6. Caller Asks for a Specific Person

**Today:**
No path defined in the prompt. But `transferToHuman` already supports named routes via `config.params.routes`. If an agency configures routes for their staff (e.g., "Sarah - Account Manager"), the tool can route to them.

**Proposed:**
Add prompt instruction: when caller asks for a specific person, try to match against available routes. "Let me see if I can get you over to [name]." If no match, use "default".

**What changes:** New section in Routing Guidelines.

**Implications:**
- This is almost free — the tool already supports it, we just need the prompt to tell Kelly to use it this way
- Depends entirely on agency configuration. If agency hasn't set up named routes, everything goes to "default" — which is fine, that's what happens today
- No new tools needed
- Future: a richer directory (with schedules, departments, descriptions) would make this more powerful, but it works today with what we have

---

### 7. "I Just Want to Talk to a Human"

**Today:**
No path defined. Kelly might try to help, ask what they need, or route — behavior is unpredictable.

**Proposed:**
Immediate transfer, no questions. "Sure, one sec." → `transferToHuman(default)`

**What changes:** New section in Routing Guidelines.

**Implications:**
- Zero friction for callers who don't want to interact with AI
- This is table stakes — any caller who says "human" or "agent" or "representative" should be transferred immediately
- Risk: none. This is strictly better than undefined behavior.

---

### 8. Frustrated / Angry Caller

**Today:**
No path defined. Kelly might try to de-escalate, apologize, or keep asking questions — all wrong moves.

**Proposed:**
Don't try to fix it. Don't apologize repeatedly. Fast-track to human. "Let me get you to someone who can help."

**What changes:** New section in Routing Guidelines.

**Implications:**
- Prevents Kelly from making angry callers angrier by being chirpy or asking questions
- Risk: false positive — Kelly interprets frustration when caller is just direct/terse. Mitigated by tone guidelines ("match their energy").

---

### 9. Scheduling a Meeting

**Today:**
"Always call `transferToBooking` tool to start booking process." Works fine.

**Proposed:**
No change.

---

## Summary: What Actually Changes

| What | Scope | Risk |
|---|---|---|
| Routing Guidelines section rewritten | One section in one prompt | Medium — core routing logic changes |
| Name collection moved early | One line change | Low — "don't press if declined" mitigates |
| Intent discovery made natural | Part of routing rewrite | Low — tone guidelines keep it brief |
| General questions get explicit guidance | New routing path | Low — boundaries already in Limitations section |
| Policy/service gets context gathering | Expanded routing path | Low — one question before transfer |
| Claims gets a defined path | New routing path | Low — fills a real gap |
| Directory routing gets a defined path | New routing path | Very low — tool already supports it |
| "Just want a human" gets a path | New routing path | None — strictly better |
| Angry/escalating gets a path | New routing path | Very low |
| Quote callback language softened | Optional, minor | None |

**Total prompts changed: 1** (orchestrator working-hours)
**Optional: 1** (quote-information, minor language)
**New tools needed: 0**
**Architecture changes: 0**

---

## Open Questions for CTO

1. **Call logging:** When Kelly gathers context before `transferToHuman` (name, what they need), is that conversation logged somewhere the receiving agent can access? Or is it only in call analytics?

2. **Message-taking tool:** Does a tool exist for Kelly to take a message? If so, we can add a "would you like to leave a message?" fallback for specific-person transfers. If not, we defer this.

3. **Route configuration:** How many agencies currently have named routes configured in `config.params.routes`? This determines how useful directory routing is on day one.

---

## Next Steps

1. Align on this strategy doc
2. Answer open CTO questions (or decide to proceed without them)
3. Draft the updated prompt language (change table format)
4. Review and sign off
5. Apply in Langfuse, promote to production
