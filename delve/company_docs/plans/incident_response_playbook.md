# Incident Response Playbook

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |
| Status  | Draft                |

---

## Purpose

This playbook defines how PolicyLift identifies, responds to, contains, and recovers from security incidents. It establishes clear roles, escalation paths, severity definitions, and response timelines so the team can act quickly and consistently.

## Scope

Covers all security incidents affecting PolicyLift systems, data, or personnel. This includes but is not limited to: unauthorized access, data breaches, malware, denial of service, social engineering, insider threats, and vulnerabilities under active exploitation.

---

## Reporting

**Anyone who suspects a security incident must report it immediately.**

### How to Report

Post to the **#security-incidents** Slack channel with the following information:

- **What happened** -- describe what you observed
- **When** -- date and time (include timezone)
- **What systems are affected** -- application, database, specific service, etc.
- **Any actions already taken** -- did you disconnect a machine, change a password, etc.
- **Your contact info** -- so the response team can follow up

If Slack is unavailable, call Alex Kumamoto directly (see Emergency Contact List).

**Do not** attempt to investigate or remediate on your own unless you are trained to do so. Preserving evidence is critical.

---

## Escalation Chain

```
1. First Responder (whoever discovers the incident)
   |
   |--> Reports to #security-incidents Slack channel
   |
2. CISO -- Alex Kumamoto
   |
   |--> Triages and classifies severity
   |--> Assigns investigation lead
   |
   |--- For High or Critical severity:
   |
3. CEO -- Raghav Bansal
   |
   |--> Notified immediately
   |--> Authorizes external communication
   |
   |--- As needed:
   |
4. External Contacts
   |--> Legal counsel
   |--> Insurance carrier (cyber insurance claim)
   |--> Law enforcement (FBI IC3 for cyber crime)
   |--> Affected third parties / vendors
```

### Backup Escalation

If Alex Kumamoto is unreachable within 30 minutes:

1. Yurii Kabannik assumes CISO responsibilities for triage
2. Raghav Bansal is notified regardless of severity

---

## Severity Levels

| Severity | Definition | Examples | Notification |
|---|---|---|---|
| **Critical** | Confirmed breach of customer data, complete system outage, or active attacker in environment | Customer PII exfiltrated; production database compromised; ransomware active in production | Entire team + CEO + external contacts as needed |
| **High** | Potential data exposure, significant service degradation, or vulnerability under active exploitation | Unauthorized access to internal system; API exposing data it should not; known CVE being exploited in the wild against our stack | CISO + CEO + engineering team |
| **Medium** | Contained security event, minor service impact, or vulnerability identified but not exploited | Phishing email received but not acted on; non-critical service degraded; vulnerability found in dependency (not yet exploited) | CISO + relevant engineers |
| **Low** | Policy violation, suspicious but unconfirmed activity, or failed attack attempt | Unusual login pattern (not confirmed malicious); brute force attempts blocked by WAF; employee using unauthorized SaaS tool | CISO (documented for quarterly review) |

---

## Response Timeline

| Phase | Timeframe | Actions |
|---|---|---|
| **Detection and Reporting** | 0-1 hour | Incident reported to #security-incidents. CISO notified. Initial triage begins. |
| **Triage and Classification** | 1-4 hours | CISO classifies severity. Investigation lead assigned. Containment actions initiated if needed. CEO notified for High/Critical. |
| **Investigation and Containment** | 4-48 hours | Full investigation underway. Scope and impact determined. Affected systems contained. Evidence preserved. |
| **Resolution and Recovery** | 48 hours - 2 weeks | Root cause identified and remediated. Affected systems restored. Monitoring for recurrence. |
| **Post-Incident Review** | Within 5 business days of resolution | Post-mortem conducted. Report written. Action items assigned. |

These are targets. Adjust based on incident complexity. The key commitment: **triage within 1 hour, post-mortem within 5 business days.**

---

## Investigation Procedure

When an incident is confirmed or suspected:

### 1. Preserve Evidence

- **Do not** reboot, wipe, or modify affected systems until evidence is collected
- Capture and retain:
  - Application logs, access logs, audit logs
  - Cloud provider activity logs (CloudTrail, Cloud Audit Logs)
  - Screenshots of anomalous behavior
  - Network flow logs if available
  - Affected user account activity
- Store evidence in a dedicated, access-controlled location
- Note: log retention policies should ensure logs are available for at least [retention period -- TBD]

### 2. Document Timeline

- Record all known events in chronological order
- Include timestamps with timezones
- Note who discovered what and when
- Maintain a running incident log in the #security-incidents thread

### 3. Identify Scope and Impact

- What systems are affected?
- What data may be exposed or compromised?
- How many users/customers are affected?
- Is the incident ongoing or contained?
- What is the business impact?

### 4. Classify Severity

- Apply severity level from the table above
- Escalate per the escalation chain
- Severity can be upgraded or downgraded as investigation reveals more information

---

## Containment

Take these actions as appropriate to the incident:

### Immediate Containment

- **Isolate affected systems** -- remove from network/security group, disable public access
- **Revoke compromised credentials** -- rotate passwords, API keys, access tokens, SSH keys
- **Block malicious actors** -- update WAF rules, security groups, or IP blocklists
- **Disable compromised user accounts** -- in identity provider and application

### Preserve Before Remediation

- Snapshot affected instances/volumes before terminating them
- Export relevant logs before they rotate
- Document the state of affected systems

### Prevent Lateral Movement

- Review access of compromised credentials for other systems they could reach
- Check for persistence mechanisms (new user accounts, scheduled tasks, modified configurations)
- Audit recent changes to IAM policies and security groups

---

## Communication

### Internal Communication

- All incident updates posted to **#security-incidents** Slack channel
- For High/Critical: direct message or phone call to CEO (Raghav Bansal)
- Status updates every 2 hours during active investigation, or as significant developments occur
- Keep updates factual. Do not speculate about cause or impact until confirmed.

### Customer Communication

For incidents affecting customer data or service availability:

1. **Draft** notification (Mike Levene)
2. **Review** with legal counsel if data breach is involved
3. **Approve** (Raghav Bansal)
4. **Send** via:
   - Status page update (for service disruptions)
   - Email to affected customers (for data incidents)
5. **Follow up** with resolution notification when incident is closed

### Regulatory Notification

- Determine if breach notification laws apply based on:
  - Type of data compromised (PII, financial, health)
  - Jurisdictions of affected individuals
  - Number of individuals affected
- Consult legal counsel for specific notification requirements and timelines
- Document all notification decisions, including decisions not to notify and rationale

---

## Resolution and Recovery

### Remediate Root Cause

- Fix the vulnerability, misconfiguration, or process failure that enabled the incident
- Deploy fixes through normal CI/CD pipeline (do not skip code review for incident fixes)
- Verify the fix addresses the root cause, not just symptoms

### Restore Affected Systems

- Restore from known-good backups or rebuild from IaC if systems were compromised
- Do **not** simply "clean" a compromised system -- rebuild it
- Verify restored systems are functioning correctly before directing traffic to them

### Return to Production

- Run health checks and smoke tests
- Monitor closely for recurrence (increased logging/alerting as needed)
- Confirm with investigation lead that the incident is fully resolved

### Close the Incident

- Update #security-incidents with final status
- Update status page if it was affected
- Mark incident as resolved in tracking system

---

## Post-Incident Review

Conduct a post-mortem meeting within **5 business days** of incident resolution.

### Post-Mortem Document Must Include

1. **Incident summary** -- one paragraph overview
2. **Timeline** -- chronological record of events, discovery, response actions
3. **Root cause** -- what failed and why
4. **Impact** -- systems affected, data exposed, customers impacted, duration
5. **Response effectiveness** -- what went well, what did not
6. **Lessons learned** -- what we would do differently
7. **Action items** -- specific, assigned, with due dates

### Post-Mortem Principles

- Blameless. Focus on systems and processes, not individuals.
- Action items must be tracked to completion in [incident tracking tool -- TBD]
- Share relevant findings with the full team (redacting sensitive details as needed)

---

## Vulnerability Remediation SLAs

When vulnerabilities are identified (via scanning, pen testing, dependency audit, or incident investigation), remediate according to these timelines:

| Severity | Remediation Deadline | Notes |
|---|---|---|
| **Critical** | 7 days | Actively exploited or trivially exploitable with severe impact |
| **High** | 30 days | Significant risk but not under active exploitation |
| **Medium** | 90 days | Moderate risk, mitigating controls may be in place |
| **Low** | Next scheduled cycle | Minimal risk, address during regular maintenance |

If a deadline cannot be met, document the reason and compensating controls, and get CISO approval for an extension.

---

## Low-Risk Incident Handling

Low-severity incidents (policy violations, suspicious but unconfirmed activity, blocked attacks) are:

1. Documented in #security-incidents with a brief description
2. Logged in the incident tracking system
3. **Reviewed quarterly** by the CISO for trends and patterns
4. Escalated if a pattern suggests a larger issue (e.g., repeated failed login attempts from the same source)

Quarterly review results are documented and shared with the team.

---

## Annual Testing

Incident response procedures are tested annually via a **tabletop exercise**.

### Tabletop Exercise Format

1. Choose a realistic scenario (e.g., phishing leads to credential compromise, dependency vulnerability exploited, insider data exfiltration)
2. Walk through the playbook step by step with the team
3. Identify gaps, unclear procedures, or missing contacts
4. Document findings and update the playbook

### Test Documentation

- Date and participants
- Scenario description
- Decisions made and actions taken (simulated)
- Gaps or issues identified
- Action items with owners and due dates

Next scheduled test: [TBD]

---

## External Contact List

| Contact | Details |
|---|---|
| **FBI Cyber Division** | Report at https://ic3.gov -- Internet Crime Complaint Center |
| **Insurance Carrier** | [TBD -- carrier name, policy number, claims phone, claims email] |
| **Legal Counsel** | [TBD -- firm name, contact name, phone, email] |
| **Cloud Provider Support** | [TBD -- support tier, phone, portal URL] |

---

## Open Questions

- What is our incident tracking tool (Jira, Linear, etc.)?
- What is our status page provider?
- Do we have cyber insurance? Who is the carrier and what is the claims contact?
- Do we have outside legal counsel for breach notification?
- What is our log retention period?
- Should we establish a dedicated forensics/evidence storage location (e.g., separate S3 bucket with restricted access)?
- Do we need to define specific procedures for insurance industry regulatory bodies?

---

*Satisfies: Incident Response #1-11, AUP #7*
