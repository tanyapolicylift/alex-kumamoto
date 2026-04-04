---
langfuse: voice/quote/personal-dwelling-fire/instructions
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
4. **Primary Usage** — owner, tenant, vacant
5. **Number of Units**
6. **Prior Claims/Incidents**
7. **Loss of Rent Coverage**

## Additional Information

- For rental/non-owner-occupied.
- Covers structure against fire and named perils.
- Vacant homes higher risk.
