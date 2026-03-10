# Business Impact Analysis

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |
| Status  | Draft                |

---

## Purpose

This Business Impact Analysis (BIA) identifies PolicyLift's critical business functions, their dependencies, and the impact of their unavailability. It provides the foundation for recovery prioritization in our Business Continuity and Disaster Recovery plans.

---

## Business Function Impact Assessment

| Business Function | Description | RPO | RTO | Dependencies | Impact if Unavailable | Owner |
|---|---|---|---|---|---|---|
| Customer-facing application | Primary web application used by policyholders and agents | [To be determined] | [To be determined] | Cloud compute, database, CDN, DNS, authentication | High | Yurii Kabannik |
| Customer data storage | Database(s) storing policyholder records, documents, and transaction history | [To be determined] | [To be determined] | Cloud database service, encryption keys, backup storage | High | Yurii Kabannik |
| Authentication / SSO | User login and identity management for all PolicyLift systems | [To be determined] | [To be determined] | Identity provider, cloud infrastructure | High | Alex Kumamoto |
| Payment processing | Premium collection and payment handling for policyholders | [To be determined] | [To be determined] | Payment processor (e.g., Stripe), application, database | High | Mike Levene |
| Internal communications | Slack, email, and video conferencing used for daily operations | [To be determined] | [To be determined] | Slack, Google Workspace / Microsoft 365, internet connectivity | Medium | Mike Levene |
| CI/CD pipeline | Build, test, and deployment infrastructure | [To be determined] | [To be determined] | GitHub, cloud provider, container registry | Medium | Yurii Kabannik |
| Monitoring and alerting | Observability stack for application and infrastructure health | [To be determined] | [To be determined] | [To be determined] | Medium | Alex Kumamoto |
| [Additional function] | [Description] | [To be determined] | [To be determined] | [Dependencies] | [H/M/L] | [Owner] |

---

## RPO / RTO Reference

- **RPO (Recovery Point Objective):** Maximum acceptable amount of data loss measured in time. Example: RPO of 1 hour means we can tolerate losing up to 1 hour of data.
- **RTO (Recovery Time Objective):** Maximum acceptable time to restore a function after disruption. Example: RTO of 4 hours means the function must be back online within 4 hours.

---

## Open Questions

- What are all critical business functions beyond the ones listed above?
- What are acceptable RPO/RTO targets for each function? (Requires input from engineering and business stakeholders.)
- What third-party dependencies exist? Specifically:
  - Cloud provider(s) — AWS, GCP, or both?
  - Payment processor — Stripe, other?
  - Identity provider — Auth0, Okta, Cognito, other?
  - DNS provider?
  - CDN provider?
  - Monitoring/alerting tools?
- Are there regulatory requirements that dictate specific RPO/RTO targets for insurance data?
- What is the financial impact per hour of downtime for each function?

---

*Satisfies: BC/DR #1*
