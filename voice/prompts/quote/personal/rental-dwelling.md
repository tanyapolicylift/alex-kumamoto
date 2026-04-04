---
langfuse: voice/quote/personal-rental-dwelling/instructions
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
2. **Year Built**
3. **Construction Type** — frame, brick, masonry, stucco
4. **Roof Age**
5. **Roof Material**
6. **Square Footage**
7. **Number of Units**
8. **Occupancy Type** — tenant, vacant, seasonal, short-term
9. **Prior Claims History**
10. **Heating Type**

## Additional Information

- DP-1/DP-2/DP-3 policies.
- Construction and roof affect replacement cost.
- Heating type can increase fire risk.
