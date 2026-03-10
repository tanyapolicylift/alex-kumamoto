# Risk Register

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |

## Purpose

This register identifies, scores, and tracks information security and operational risks to PolicyLift. It serves as the central record for risk management decisions and treatment plans required under SOC 2.

## Risk Scoring

- **Likelihood**: 1 (Rare) to 5 (Almost Certain)
- **Impact**: 1 (Negligible) to 5 (Severe)
- **Risk Score**: Likelihood x Impact (1-25)
- Scores 1-6: Low | 7-12: Medium | 13-19: High | 20-25: Critical

## Risk Register

| Risk ID | Risk Description                                | Category    | Likelihood | Impact | Risk Score | Risk Owner       | Treatment Plan                                                     | Treatment Status | Residual Risk Score | Last Reviewed |
|---------|-------------------------------------------------|-------------|------------|--------|------------|------------------|--------------------------------------------------------------------|------------------|---------------------|---------------|
| R-001   | Unauthorized access to production systems       | Technical   | [TBD]      | [TBD]  | [TBD]      | Alex Kumamoto    | MFA on all accounts, least-privilege access, quarterly access reviews | [TBD]            | [TBD]               | [TBD]         |
| R-002   | Data breach via third-party vendor              | Operational | [TBD]      | [TBD]  | [TBD]      | Mike Levene      | Vendor security assessments, contractual security provisions, data access controls | [TBD]            | [TBD]               | [TBD]         |
| R-003   | Key person dependency (bus factor)              | Personnel   | [TBD]      | [TBD]  | [TBD]      | Raghav Bansal    | Cross-training program, runbook documentation, shared credentials in password manager | [TBD]            | [TBD]               | [TBD]         |
| R-004   | Cloud provider outage                           | Technical   | [TBD]      | [TBD]  | [TBD]      | Yurii Kabannik   | Multi-AZ deployment, disaster recovery plan, defined RTO/RPO       | [TBD]            | [TBD]               | [TBD]         |
| R-005   | Failure to meet SOC 2 audit requirements        | Compliance  | [TBD]      | [TBD]  | [TBD]      | Alex Kumamoto    | Compliance program implementation, policy documentation, continuous monitoring | [TBD]            | [TBD]               | [TBD]         |
| R-006   | Ransomware or malware infection                 | Technical   | [TBD]      | [TBD]  | [TBD]      | Alex Kumamoto    | Endpoint protection, immutable backups, incident response plan, security training | [TBD]            | [TBD]               | [TBD]         |

## Executive Risk Acceptance

Risks that are accepted (not mitigated or transferred) require documented CEO approval. Accepted risks must be reviewed at least annually.

| Risk ID | Accepted By    | Justification | Acceptance Date | Next Review Date |
|---------|----------------|---------------|-----------------|------------------|
| [TBD]   | Raghav Bansal  | [TBD]         | [TBD]           | [TBD]            |

**CEO Signature**: ___________________________  **Date**: _______________

## Review

This risk register is reviewed annually during the formal risk assessment, and updated whenever new risks are identified or existing risk conditions materially change. Ad-hoc reviews may be triggered by security incidents, significant infrastructure changes, or new regulatory requirements.

---

## Open Questions

- What risks does the team consider most likely or highest impact? (Need to assign Likelihood and Impact scores.)
- Are there any known compliance gaps we should register as risks?
- What is our risk appetite -- what residual risk score threshold requires treatment vs. acceptance?
- Are there insurance-industry-specific risks (e.g., regulatory action, state filing requirements) that should be included?
