---
langfuse: voice/quote/personal-renters/instructions
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
2. **Unit Type** — apartment, condo, duplex, single-family
3. **Square Footage**
4. **Number of Occupants**
5. **Coverage Limit** — desired personal property amount
6. **Liability Limit** — $100K or $300K
7. **Claims History** — past 5 years

## Additional Information

- Covers personal belongings and liability, not building.
- Coverage limit should reflect replacement value.
