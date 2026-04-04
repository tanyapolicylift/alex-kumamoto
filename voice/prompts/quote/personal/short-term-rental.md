---
langfuse: voice/quote/personal-short-term-rental/instructions
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
3. **Occupancy and Use** — exclusive STR or also personal
4. **Number of Units**
5. **Total Guest Capacity**
6. **Prior Loss History**
7. **Rental Arrangement Provider** — Airbnb, Vrbo, direct

## Additional Information

- Standard homeowners often excludes STR.
- Guest turnover, amenities, security measures assessed.
