# Data Retention Schedule

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |

## Purpose

This schedule defines how long PolicyLift retains each category of data and how it is disposed of when the retention period expires. It ensures compliance with legal requirements and minimizes risk from retaining data longer than necessary.

## Retention Table

| Data Type          | Retention Period                           | Deletion Method                              | Owner         |
|--------------------|--------------------------------------------|----------------------------------------------|---------------|
| Customer data      | Duration of contract + 1 year              | Delete from all systems (production, backups) | [TBD]         |
| Application logs   | 12 months                                  | Automatic expiry via log retention settings  | Engineering   |
| Audit/security logs| 12 months minimum                          | Automatic expiry via log retention settings  | CISO          |
| Employee records   | Duration of employment + 3 years           | Secure deletion                              | Head of Ops   |
| Financial records  | 7 years                                    | Secure deletion                              | CEO           |
| Backups            | [TBD] days rolling                         | Automatic rotation                           | Engineering   |
| Vendor contracts   | Duration of contract + 2 years             | Secure deletion                              | Head of Ops   |
| Incident reports   | 3 years                                    | Manual review and deletion                   | CISO          |

## Deletion Process

When data reaches the end of its retention period, the designated owner is responsible for ensuring deletion is carried out. Guidelines:

1. **Cloud-hosted data**: Use platform lifecycle policies (e.g., S3 lifecycle rules, CloudWatch log group retention, database TTL) to automate expiry where available.
2. **Manual deletion**: Where automation is not possible, the owner must perform deletion and confirm completion.
3. **Backups**: Verify that expired data is also removed from backup systems within a reasonable timeframe (aligned with backup rotation schedule).
4. **Confirmation**: For Confidential and Restricted data, document the deletion date and method.

## Review

This schedule is reviewed annually by the CISO, or when there are changes to legal requirements, business operations, or data processing activities.

---

## Open Questions

- What is our current backup retention period? (Need to fill in the [TBD] row.)
- Are there any regulatory requirements specific to insurance data that affect retention periods?
- Do we store any data subject to state-specific retention laws (e.g., CCPA, state insurance regulations)?
- Should audit/security log retention be extended beyond 12 months for SOC 2 audit continuity?
