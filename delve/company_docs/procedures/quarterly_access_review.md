# Quarterly Access Review Procedure

| Field   | Value                      |
|---------|----------------------------|
| Date    | 2026-03-09                 |
| Version | 1.0                        |
| Owner   | Alex Kumamoto (CTO/CISO)  |

## Purpose

Ensure that access to critical systems remains appropriate, current, and aligned with the principle of least privilege through quarterly reviews.

## Scope

Critical systems include: production infrastructure, databases, admin consoles, source code management (GitHub/GitLab), cloud provider accounts (AWS/GCP/Azure), and any system containing customer data.

## Cadence

- **Quarterly:** March (Q1), June (Q2), September (Q3), December (Q4)
- **Annual (Q4):** The December quarterly review is combined with the Baseline Hardening annual review, which covers all access including non-critical systems.

## Procedure

### 1. Generate Access Lists

CISO generates a current list of all users with access to each critical system, including their access level (read, write, admin).

### 2. Compare Against Employee Roster

Cross-reference access lists with the current employee/contractor roster and their assigned roles.

### 3. Flag Anomalies

Identify:
- Accounts belonging to departed employees or ended contractors
- Permissions that exceed what the role requires
- Dormant accounts (no login in 90+ days)
- Shared or generic accounts

### 4. Remediate

- Revoke access for departed personnel immediately.
- Downgrade excessive permissions to the appropriate level.
- Disable or remove dormant accounts after confirming with the account holder.
- Eliminate shared accounts or document an exception with compensating controls.

### 5. Document the Review

Record:
- Date of review
- Systems reviewed
- Findings (accounts flagged and why)
- Actions taken (revoked, downgraded, exception documented)
- Reviewer name

### 6. Store for Audit Evidence

Save the review record in the compliance evidence repository. Retain for the SOC 2 audit period plus one year.
