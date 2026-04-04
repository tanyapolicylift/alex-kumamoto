---
langfuse: voice/quote/commercial-business-owners-policy/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Business Name**
2. **Years in Business**
3. **Building Ownership** — own or lease
4. **Square Footage**
5. **Inventory Value**
6. **Equipment Value**
7. **Loss History**
8. **Business Interruption Exposure**

## Additional Information

- BOP combines property + GL + business interruption for small-to-mid businesses.
