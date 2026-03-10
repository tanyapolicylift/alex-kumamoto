# Employee/Contractor Offboarding Checklist

| Field   | Value            |
|---------|------------------|
| Date    | 2026-03-09       |
| Version | 1.0              |
| Owner   | Mike Levene      |

## Purpose

This checklist ensures that all access is revoked and company assets are recovered when an employee or contractor departs PolicyLift. **SLA: All system access must be revoked within 1 business day of termination.**

---

## Immediate (Within 1 Business Day)

- [ ] All system access revoked: email, Slack, GitHub, cloud consoles, production systems, VPN, password manager, all SaaS tools
- [ ] SSO/IdP account disabled (if applicable)
- [ ] MFA tokens/sessions revoked
- [ ] Shared credentials rotated (any credentials the departing person had access to)
- [ ] Company devices collected
- [ ] Devices wiped or queued for wipe

## Within 1 Week

- [ ] Confidentiality obligations reminder sent/communicated to departing employee
- [ ] Email forwarding set up for business continuity (if needed, with manager approval -- no external forwarding)
- [ ] Knowledge transfer completed (or documented gaps)
- [ ] Personnel file updated with termination date and checklist
- [ ] Org chart updated
- [ ] Team notified of departure via Slack/email

## Contractor-Specific

- [ ] Contractor agreement termination confirmed
- [ ] Any company data in contractor's possession confirmed returned/deleted

---

## Sign-Off

| Field                | Value                              |
|----------------------|------------------------------------|
| Employee/Contractor  | ____________                       |
| Last Day             | ____________                       |
| Termination Type     | Voluntary / Involuntary            |
| Completed By         | ____________                       |
| Date Completed       | ____________                       |

---

## Open Questions

- Do we have a centralized IdP/SSO (Okta, Google Workspace as IdP) that allows one-click deprovisioning? This would significantly reduce the risk of missed access revocations.
- What is our process for device wipe -- remote wipe via MDM or manual? Do we have an MDM solution deployed?
- Should we require a formal exit interview that includes a security debrief?
