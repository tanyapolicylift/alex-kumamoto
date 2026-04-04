---
langfuse: voice/quote/personal-umbrella/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Underlying Policies** — auto, homeowners, renters, boat
2. **Number of Vehicles**
3. **Amount of Coverage** — $1M, $2M, etc.
4. **Number of Investment Properties**
5. **History of Claims** — 5 years

## Additional Information

- Extends liability above existing policies.
- Minimum limits required on underlying.
- Starts at $1M increments.
