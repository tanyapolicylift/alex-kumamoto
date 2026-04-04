---
langfuse: voice/quote/personal-rv/instructions
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
3. **Driver's License Number**
4. **VIN** — 17-char
5. **RV Make, Model, Year**
6. **Usage** — vacation, seasonal residence, full-time
7. **Storage Location**
8. **Storage ZIP Code**
9. **Annual Estimated Mileage**

## Additional Information

- Trailer insurance differs from motorized RVs.
- Secured storage may qualify for discounts.
