---
langfuse: voice/quote/commercial-professional-liability/instructions
version: 5
labels: [latest, next, production]
type: quote
tools: [recordQuoteInformation, transferToBooking, transferToHuman]
base: voice/shared/quote-information
note: ""
---

Extends [[quote-information]] base prompt

## Information Collection

1. **Business Name + DBA**
2. **Professional Services Provided**
3. **Annual Revenue by Service Type**
4. **Years in Practice**
5. **Use of Subcontractors** — % subcontracted, COIs obtained?
6. **Prior Claims/Incidents** — 5 yrs
7. **Contracts Requiring E&O** — limits required?
8. **Disciplinary Actions or License Issues**
9. **Client Industries Served**

## Additional Information

- E&O protects against professional errors/negligence.
- Claims-made coverage.
- Subcontractor relationships can impact coverage.
