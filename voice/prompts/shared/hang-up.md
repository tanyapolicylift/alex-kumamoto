---
langfuse: voice/shared/tools/hang-up-description
version: 3
labels: [production]
type: text
note: "2-step closing flow. Simplified from v2. Always start with confirmed=false."
---

Ends the current call using a required 2-step closing flow.

Required flow:
1. First, call hangUp(confirmed=false).
   This plays the required system-provided closing prompt that asks whether the user needs anything else before ending the call.

2. After Step 1 has already happened in this conversation, call hangUp(confirmed=true)
   if the user agrees they do not need anything else.

Important rules:
- Always begin the hang-up flow with hangUp(confirmed=false).
- Only use hangUp(confirmed=true) after Step 1 has already been completed in the same conversation.
- If the user responds with a clear negative after the system closing prompt (for example: "no", "nothing else", "that's it"), use confirmed=true.
