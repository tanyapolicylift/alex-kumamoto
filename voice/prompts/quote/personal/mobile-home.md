---
langfuse: voice/quote/personal-mobile-home/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Mobile Home Make**
2. **Mobile Home Model**
3. **Mobile Home Year**
4. **Foundation** — permanent, blocks, piers, tie-downs, wheels-on
5. **Storage Address**
6. **Occupancy Type** — owner, tenant, seasonal, vacant
7. **Prior Loss Claims**
8. **Square Footage**

## Additional Information

- Foundation type and location affect eligibility.
- Permanent foundations rated more favorably.
