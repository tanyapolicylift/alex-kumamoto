---
langfuse: voice/quote/commercial-cyber-liability/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: "No explicit Information Collection section. Relies entirely on {{schema}} JSON for question flow."
---

Extends [[quote-information]] base prompt

No explicit information collection section. This prompt relies entirely on the `{{schema}}` JSON for question flow.
