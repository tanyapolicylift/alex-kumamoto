---
langfuse: voice/quote/personal-life/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: "Minimal — no additional questions. Confirm name and phone number and end call."
---

Extends [[quote-information]] base prompt

No additional information collection beyond name and phone number. Confirm details and end call.
