---
langfuse: voice/quote/personal-landlord/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Property Address**
2. **Square Footage**
3. **Year Built**
4. **Primary Usage** — single-family, multi-family, mixed-use
5. **Tenant Type** — residential, commercial, mixed
6. **Dwelling Coverage Limit** — replacement cost vs ACV
7. **Liability Limit**

## Additional Information

- Covers property damage, lost rental income, liability.
- Replacement cost vs ACV important distinction.
