---
langfuse: voice/quote/personal-watercraft/instructions
version: 6
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Vehicle Make, Model, Year**
2. **Engine Size** — cc or HP
3. **Top Speed** — mph
4. **HIN (Hull Identification Number)** — 12-char
5. **Location**
6. **Water Type** — inland lakes, rivers, coastal, open ocean
7. **Primary Operator Name**
8. **Primary Operator Age**
9. **Loss History**

## Additional Information

- HIN is like a VIN for watercraft.
- Saltwater increases corrosion risk.
- Operator age/experience key underwriting factors.
