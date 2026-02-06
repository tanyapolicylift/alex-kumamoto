# Voice Prompt A/B Test Results

## Summary

| Test | Scenario | Winner | Key Finding |
|------|----------|--------|-------------|
| 01 | Asks for Jason | Control | Test over-explains; Control attempts transfer |
| 02 | Jason + payment (health ins) | Test | Control got confused about health insurance scope |
| 03 | Payment request | Control | Control captured policy number; Test missed it |
| 04 | Customer service request | Tie | Both reasonable, different approaches |
| 05 | Spanish language request | Tie | Both handled language switch well |
| 06 | Called yesterday, estimate | Tie | Both lost caller (connectivity issue) |
| 07 | Email insurance card | Control | Control resolved faster; Test too verbose |
| 08 | Billing inquiry | Test | Test offered clearer options upfront |
| 09 | New car insurance (existing customer) | Control | Control shorter; Test lost email at end |

**Overall: Control 4 | Test 2 | Tie 3**

---

## Structural Metrics

| Test | Control Turns | Test Turns | Control Clarifications | Test Clarifications |
|------|---------------|------------|------------------------|---------------------|
| 01 | 4 | 5 | 0 | 0 |
| 02 | 21 | 10 | 1 | 1 |
| 03 | 8 | 11 | 1 | 0 |
| 04 | 4 | 2 | 0 | 0 |
| 05 | 7 | 8 | 0 | 1 |
| 06 | 7 | 8 | 0 | 0 |
| 07 | 7 | 11 | 1 | 2 |
| 08 | 2 | 2 | 0 | 0 |
| 09 | 22 | 26 | 1 | 0 |

**Observations:**
- Test prompts generally produce more agent turns
- Clarification counts are similar
- Control tends to be more concise

---

## Detailed Pair Analysis

### Test 01: Caller Asks for Jason

**Caller intent:** Speak to Jason (specific person request)

| Dimension | Control | Test |
|-----------|---------|------|
| Opening | Standard greeting | Standard greeting |
| Closed-office handling | Not mentioned initially | Immediately disclosed |
| AI disclosure | None | Explicit ("I'm an AI assistant") |
| Voicemail offer | Not offered | Explicit choice given |
| Resolution | Attempted transfer | Took voicemail request |

**Control behavior:** "Let me connect you with one of our agents who can help you further. Please hold."
**Test behavior:** "Got it. The office is closed right now, so you can say voicemail if you'd prefer to leave a message. Otherwise, I'm an AI assistant..."

**Verdict: Control** - More natural; attempted to fulfill request directly rather than over-explaining options.

---

### Test 02: Jason + Payment (Health Insurance Confusion)

**Caller intent:** Speak to Jason about health insurance payment

| Dimension | Control | Test |
|-----------|---------|------|
| Opening | Standard | Standard |
| Intent recognition | Eventually understood | Quickly understood |
| Scope handling | Long confusion about health ins not being offered | Clean handoff to voicemail |
| Resolution | Still explaining at cutoff | Clean callback scheduled |

**Control issue:** Agent spent 20+ turns explaining Dale Wagner doesn't do health insurance, even though caller insisted Jason is their agent there. Created friction.

**Test behavior:** Quickly acknowledged can't process payments, offered callback. Clean resolution.

**Verdict: Test** - Avoided unnecessary scope debate; focused on caller's actual need (make payment, not get educated about agency services).

---

### Test 03: Payment Request

**Caller intent:** Make car insurance payment

| Dimension | Control | Test |
|-----------|---------|------|
| Closed-office handling | Mentioned upfront | Mentioned with AI disclosure |
| Information captured | Name, policy number, callback time | Name, callback time, phone number |
| Missing info | Phone number | Policy number |
| Resolution | Clean | Clean |

**Control captured:** Maria Crawford, policy 867635324, avoid 12-2
**Test captured:** Maria Crawford, 12-2 preferred, 555-123-4567

**Verdict: Control** - Policy number is more valuable for lookup than phone number (can use caller ID).

---

### Test 04: Customer Service Request

**Caller intent:** Speak to customer service about existing policy

| Dimension | Control | Test |
|-----------|---------|------|
| Opening | Standard | Standard |
| Response | Started qualifying (new quote vs existing) | Immediate closed/AI disclosure |
| Conversation length | 4 turns (cut off) | 2 turns (cut off) |

**Control:** "Yeah, no problem. What do you need help with? Are you calling about a new quote or an existing policy?"
**Test:** "Yeah. The office is closed right now, so you can say voicemail if you'd prefer..."

**Verdict: Tie** - Both reasonable. Control more conversational; Test more informative about constraints.

---

### Test 05: Spanish Language Request

**Caller intent:** Speak in Spanish about existing policy

| Dimension | Control | Test |
|-----------|---------|------|
| Language switch | Smooth | Smooth |
| Spanish quality | Natural | Natural |
| Outcome | Caller declined to engage | Caller declined to engage |

Both handled the language switch identically well. Caller ("Max") said "no, bueno" and disengaged in both cases.

**Verdict: Tie** - Equivalent performance.

---

### Test 06: Called Yesterday for Estimate

**Caller intent:** Follow up on car insurance estimate from yesterday

| Dimension | Control | Test |
|-----------|---------|------|
| Recognition of returning caller | Yes | Yes |
| Qualifying | Asked what type | Asked if new or followup |
| Outcome | Lost caller (connectivity) | Lost caller (connectivity) |

Both conversations ended with caller saying "Hello?" repeatedly - likely a connection issue, not prompt-related.

**Verdict: Tie** - Can't evaluate due to technical issue.

---

### Test 07: Email Insurance Card

**Caller intent:** Get insurance card emailed

| Dimension | Control | Test |
|-----------|---------|------|
| Turns to resolution | 7 | 11 |
| Clarification needed | 1 | 2 |
| Closed-office handling | Not mentioned | Mentioned mid-conversation |
| Resolution | Clean callback scheduled | Clean callback scheduled |

**Control:** Quickly identified can't send docs, got name + callback time, done.
**Test:** Multiple clarifications about "fitment" mishearing, longer explanation of AI/voicemail options, eventually got to same place.

**Verdict: Control** - Faster to same outcome. Test's mid-conversation "office is closed" disclosure was awkward (caller already engaged).

---

### Test 08: Billing Inquiry

**Caller intent:** Find out insurance cost for the month

| Dimension | Control | Test |
|-----------|---------|------|
| Response style | Direct refusal + offer callback | Explicit closed/voicemail/AI choice |
| Clarity | Clear but abrupt | Clear with options |

**Control:** "Got it. I'm not able to look up billing details or give monthly pricing. You'll need to talk to a licensed agent for that."
**Test:** "Got it. The office is closed right now, so you can say voicemail if you'd like to leave a message. Otherwise, I'm an AI assistant and I'll do my best to help."

**Verdict: Test** - Framing the limitation as "office closed" is softer than "I can't do that." Gives caller agency.

---

### Test 09: New Car Insurance (Existing Customer)

**Caller intent:** Insure a car being picked up for a friend; already has Progressive through agency

| Dimension | Control | Test |
|-----------|---------|------|
| Total turns | 22 | 26 |
| Info captured | Full intake + email | Full intake, email LOST at end |
| Existing customer handling | Acknowledged, slight confusion about matching coverage | Acknowledged, clean |
| Critical error | None | Final email captured as "regression@gmail.com" not "proactiveregression@gmail.com" |

**Control issue:** Agent said "I'll note that you want coverage to match" when caller didn't say that. Caller corrected: "Not what I said."

**Test issue:** Email confirmation failed. Caller spelled out "proactiveregression" but agent confirmed "regression@gmail.com" at the end.

**Verdict: Control** - Despite the coverage assumption error (which was corrected), Control captured complete data. Test lost the email prefix - a significant data loss.

---

## Behavioral Patterns

### Test Prompts Consistently:
1. Disclose "office is closed" early and explicitly
2. Offer voicemail as explicit choice
3. Disclose AI nature ("I'm an AI assistant")
4. More verbose explanations
5. More agent turns per conversation

### Control Prompts Consistently:
1. More conversational, less scripted feel
2. Jump into qualifying questions faster
3. Don't always mention office hours
4. More concise responses
5. Fewer turns to resolution

---

## Recommendations

### Keep from Control:
- Conciseness
- Natural conversational flow
- Direct qualifying without preamble

### Keep from Test:
- Voicemail as explicit option (but offer it more naturally)
- Clearer framing of limitations ("office is closed" vs "I can't")

### Issues to Fix in Test:
1. **Email capture bug (Test 09)** - Lost email prefix; needs verification improvement
2. **Over-disclosure** - AI disclosure mid-conversation is awkward when caller is already engaged
3. **Verbosity** - Shorter responses would feel more human

### Issues to Fix in Control:
1. **Assumption errors (Test 09)** - "I'll note you want to match coverage" when caller didn't say that
2. **Scope confusion (Test 02)** - Spent too long explaining what agency doesn't do
