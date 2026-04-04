---
langfuse: voice/quote/personal-motorcycle/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Driver(s) Name**
2. **Driver(s) Date of Birth**
3. **Driver's License Number** — must be valid for motorcycle
4. **Motorcycle Make, Model, Year**
5. **Usage** — commuting, pleasure/weekend, business
6. **Storage Location**
7. **Store ZIP Code**
8. **Annual Estimated Mileage**

## Additional Information

- Riders need motorcycle endorsement.
- Garaged storage lowers risk.
