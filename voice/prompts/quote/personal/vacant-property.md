---
langfuse: voice/quote/personal-vacant-property/instructions
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
3. **Square Footage**
4. **Number of Stories**
5. **Occupancy Status** — when last occupied, utilities active?
6. **Reason for Vacancy** — renovation, sale, between tenants, estate
7. **Security** — locks, fencing, lighting, inspections
8. **Prior Insurance** — carrier, canceled/expired?
9. **Loss History**
10. **Security System** — alarm/camera, monitored?

## Additional Information

- Standard homeowners often excludes vacant 30-60+ days.
- Security features reduce risk.
- Winterizing prevents burst pipes.
