# Vendor Onboarding Checklist

| Field   | Value            |
|---------|------------------|
| Date    | 2026-03-09       |
| Version | 1.0              |
| Owner   | Mike Levene      |

## Purpose

This checklist must be completed before engaging a new vendor or third-party service provider. It ensures that vendor risk is assessed proportional to data access, that appropriate contractual protections are in place, and that the vendor is tracked in the Vendor Inventory.

---

## Pre-Engagement

- [ ] Business need documented and sponsor identified
- [ ] Data access level determined (None / Internal / Confidential / Restricted)
- [ ] Risk assessment completed (proportional to data access level)
- [ ] For Critical vendors: SOC 2 report requested and reviewed
- [ ] For vendors accessing Confidential/Restricted data: NDA or confidentiality provisions in contract
- [ ] Security and data protection provisions included in contract
- [ ] Executive management approval obtained (for Critical vendors or those accessing Restricted data)

## At Engagement

- [ ] Vendor added to Vendor Inventory with all fields populated
- [ ] Access provisioned (least-privilege, only what is needed for the service)
- [ ] Vendor contact information documented
- [ ] Contract and NDA stored in [contract repository -- TBD]
- [ ] Next assessment date scheduled per vendor criticality tier

---

## Sign-Off

| Field              | Value        |
|--------------------|--------------|
| Vendor Name        | ____________ |
| Service            | ____________ |
| Sponsor            | ____________ |
| Data Access Level  | ____________ |
| Criticality        | ____________ |
| Date Completed     | ____________ |
| Completed By       | ____________ |

---

## Open Questions

- Where do we store vendor contracts? (Google Drive folder, contract management tool, compliance platform)
- Who has final sign-off on vendor contracts -- CEO or Head of Ops?
- Do we have a standard vendor security questionnaire, or do we rely on SOC 2 reports?
- What is our threshold for "Critical" vendor designation -- revenue dependency, data access level, or both?
