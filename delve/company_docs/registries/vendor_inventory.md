# Vendor Inventory

| Field   | Value                     |
|---------|---------------------------|
| Date    | 2026-03-09                |
| Version | 1.0                       |
| Owner   | Mike Levene (Head of Ops) |

## Purpose

This inventory tracks all third-party vendors and SaaS services used by PolicyLift, their data access levels, compliance posture, and contractual status. It supports vendor risk management and SOC 2 compliance requirements.

## Vendor Inventory

| Vendor Name        | Service Provided                | Data Access Level | Criticality | SOC 2 Report | Last SOC 2 Review | Last Risk Assessment | Contract Expiry | NDA on File | Owner           |
|--------------------|---------------------------------|-------------------|-------------|--------------|--------------------|-----------------------|-----------------|-------------|-----------------|
| [AWS/GCP]          | Cloud infrastructure and hosting| Restricted        | Critical    | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | Yurii Kabannik  |
| GitHub             | Source code hosting             | Confidential      | Critical    | Yes          | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | Alex Kumamoto   |
| Slack              | Team communication              | Internal          | Important   | Yes          | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | Mike Levene     |
| Google Workspace   | Email, calendar, docs           | Confidential      | Critical    | Yes          | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | Mike Levene     |
| [Password Manager] | Credential storage and sharing  | Restricted        | Critical    | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | Alex Kumamoto   |
| [TBD]              | [TBD]                           | [TBD]             | [TBD]       | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | [TBD]           |
| [TBD]              | [TBD]                           | [TBD]             | [TBD]       | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | [TBD]           |
| [TBD]              | [TBD]                           | [TBD]             | [TBD]       | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | [TBD]           |
| [TBD]              | [TBD]                           | [TBD]             | [TBD]       | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | [TBD]           |
| [TBD]              | [TBD]                           | [TBD]             | [TBD]       | [TBD]        | [TBD]              | [TBD]                 | [TBD]           | [TBD]       | [TBD]           |

## Assessment Schedule

| Vendor Criticality | SOC 2 Report Available | Assessment Frequency       |
|--------------------|------------------------|----------------------------|
| Critical           | No                     | Quarterly risk assessment  |
| Critical           | Yes                    | Annual SOC 2 report review |
| Important          | Any                    | Annual risk assessment     |
| Low                | Any                    | At onboarding only         |

## Review

The full vendor inventory is reviewed annually by the vendor inventory owner, or when new vendors are onboarded or existing vendor relationships change materially.

---

## Open Questions

- What is the complete list of vendors and SaaS tools we use?
- Which vendors have access to customer data?
- Do we have current SOC 2 reports on file for critical vendors?
- Are NDAs in place for all vendors with data access?
- Are there vendors we should evaluate replacing due to lack of SOC 2 or security posture concerns?
