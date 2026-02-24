# Incident Response Policy — Commitment Analysis

**Source:** `source/# Incident Response Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Incident Response Policy"**

---

## Commitment 1: Defined Escalation Chain and Mandatory Reporting by All Users

> "All users must report any system vulnerability, incident, or event pointing to a possible incident to the CTO at the moment that the security problem was discovered. If the CTO is unavailable, the person that discovered the problem should reach out to the following managers in the company until he gets answered, in the following order: Chief Architect, CSO, COO, CEO."

> "Incidents must be reported by sending an email message with details of the incident, following the notification regarding the problem by a call."

> "Failure to report information security incidents shall be a security violation and will be reported to the CEO for disciplinary action."

**What this requires:** Establish a documented escalation chain with named roles, communicate it to all employees and contractors, and enforce a specific reporting method (email + phone call). Failure to report is treated as a disciplinary offense.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep (simplify reporting method) |

**Why:** Auditors absolutely expect a defined escalation path and evidence that employees know how to report incidents. The escalation chain itself is straightforward. However, requiring both an email *and* a follow-up phone call is overly prescriptive — a Slack message or a ticket in your incident tracking tool should be equally valid. Simplify the reporting mechanism to "notify via the company's primary communication channel (e.g., Slack #security-incidents) and create a ticket" rather than mandating email + call. The disciplinary language is fine to keep — auditors like seeing that reporting is taken seriously.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Incident Tracking and Documentation System

> "All critical security (including data breaches) incidents are logged and tracked in the ticketing system and communicated to affected parties."

> "All technical steps taken during an incident must be documented in the organization's incident log, and must contain the following: Description of the incident, Incident severity level, The root cause, Evidence, Mitigations applied, Status (open, closed, archived), Disclosures."

> "Information and artifacts associated with security incidents (including but not limited to files, logs, and screen captures) must be preserved if they need to be used as evidence of a crime."

**What this requires:** Use a ticketing system to log every incident with a structured set of fields (description, severity, root cause, evidence, mitigations, status, disclosures). Preserve forensic artifacts. This is both a tooling and a process commitment — you need a system and a habit of using it consistently.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** This is one of the most audited areas of SOC 2. Auditors will ask to see your incident log, check that incidents are tracked to resolution, and verify that documentation exists. You need a real system for this — a Jira project, Linear workspace, or even a dedicated spreadsheet works, but it must be consistently used. The specific fields listed are reasonable and standard. The forensic preservation language (logs, screenshots) is good practice and auditors appreciate it, though for a startup it mostly means "don't delete your cloud logs." Medium difficulty because the real challenge is the discipline of documenting every incident thoroughly, not the tooling.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Structured Incident Report Content at Time of Reporting

> "The following information must be included as part of the notification: Description of the incident, Date/time/location, The person who discovered the incident, How the incident was discovered, Known evidence of the incident, The affected system(s)."

**What this requires:** Create a standardized incident report template that reporters must fill out when flagging an incident. This could be a form, a Slack workflow, or a ticket template.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Having a structured intake form is good practice and easy to implement — a pinned Slack message, a Google Form, or a Jira issue template takes 15 minutes to set up. Auditors like seeing that you collect consistent information at the point of reporting. It also makes your incident log much more useful. Low effort, real value.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: 48-Hour Preliminary Investigation and Severity Classification

> "Within 48 hours of the incident being reported, the CTO and Chief Architect shall conduct a preliminary investigation and risk assessment to review and confirm the details of the incident. If the incident is confirmed, the CTO must assess the impact on the organization and assign a severity level."

**What this requires:** A formal commitment that every reported incident gets a preliminary investigation and severity assignment within 48 hours, conducted by two named senior roles (CTO and Chief Architect).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplify the "who") |

**Why:** Auditors want to see that incidents are triaged promptly and assigned a severity level. The 48-hour SLA is reasonable and standard. However, requiring *both* the CTO and Chief Architect to jointly investigate every report is heavy for a small team — a single designated "incident lead" (whoever is on-call or the CTO) should be sufficient. The four-tier severity model (Critical/High/Medium/Low) is standard and worth keeping. The GDPR-specific classification criteria are a nice touch if you handle EU personal data, but can be removed if not applicable.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Vulnerability Severity Assessment and Remediation SLAs

> "Vulnerabilities assessed by PolicyLift shall be remediated in the following timeframes: Critical: 24-72 hours, High: 7-14 days, Medium: 30-60 days, Low: 90 days."

> "The engineering department shall evaluate the severity of vulnerabilities, and if it is determined to be a critical or high-risk vulnerability, a service ticket will be created."

**What this requires:** Commit to specific remediation timelines based on severity. Track vulnerabilities in a ticketing system. Engineering must have a process for evaluating, classifying, and resolving vulnerabilities within these windows.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Critical | Keep (but be realistic about the timelines) |

**Why:** Vulnerability management with defined SLAs is a core SOC 2 expectation. Auditors will sample vulnerabilities and check whether you met your own remediation timelines — so whatever numbers you put in this policy, you will be held to them. The timelines listed are industry-standard but aggressive for a small team. Consider whether 24-72 hours for Critical is realistic given your staffing (it may be, depending on the type of vulnerability). The bigger concern is Medium at 30-60 days — if you have a backlog of medium-severity findings from a scanner, you could easily blow past this. Set timelines you can actually meet consistently, or auditors will flag the gap between policy and practice.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Incident Response Procedures — Containment, Communications Plan, and Resolution

> "The CTO, in consultation with management sponsors, shall determine appropriate incident response activities to contain and resolve incidents."

> "If the incident is deemed as High or Medium, the CTO must work with the CSO and the COO to create and execute a communications plan that communicates the incident to users, the public, and others affected."

> "The CTO must take all necessary steps to resolve the incident in a timely manner and recover information systems, data, and connectivity."

**What this requires:** For High/Medium+ incidents: form a response team (CTO + CSO + COO), create a communications plan for affected parties, and execute containment and recovery procedures. This implies you have a pre-established playbook or at least a documented process for how incidents move from detection through containment, eradication, recovery, and communication.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplify roles) |

**Why:** Having a documented incident response procedure (detect, contain, eradicate, recover, communicate) is absolutely required for SOC 2. Auditors will want to see this written down. However, requiring the CTO, CSO, *and* COO to jointly produce a communications plan for every High or Medium incident is overkill for a 10-person startup — half your leadership team would be pulled into every incident. Simplify to: the CTO (or designated incident lead) handles containment and resolution, and loops in the CEO for external communications only when the incident affects customers or involves a data breach. For a startup, a one-page runbook covering these phases is sufficient.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Post-Incident Review (Post Mortem) and Lessons Learned

> "After an incident has been resolved, the CTO must conduct a post mortem that includes root cause analysis and documentation of any lessons learned."

> "Communication is also conducted with senior management for each security incident, to evaluate the root causes, remediation steps, and lessons learned to be able to prevent similar incidents in the future."

> "The CTO must notify all users of the incident, conduct additional training if necessary, and present any lessons learned to prevent future occurrences."

**What this requires:** After every incident, produce a written post-mortem with root cause analysis. Share lessons learned with senior management and all users. Conduct additional training if warranted.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (scope the audience) |

**Why:** Post-incident reviews are a SOC 2 staple — auditors will ask to see post-mortem documentation and evidence that lessons learned fed back into improvements. This is non-negotiable. However, notifying *all users* and presenting lessons learned to the entire company after every incident is excessive. For Critical/High incidents affecting customers, yes — broad communication and a formal write-up make sense. For Medium/Low incidents, a brief write-up in the incident ticket and a discussion within the engineering team is sufficient. The "additional training if necessary" clause is good — keep it as a judgment call, not a mandate for every incident.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Annual Review and Testing of Incident Response Procedures

> "To appropriately plan and prepare for incidents, the organization must review incident response procedures at least once per year for currency and update as required."

> "The incident response procedure must be tested on at least once per year."

**What this requires:** Two annual activities: (1) review and update the incident response policy/procedures document, and (2) conduct a test of the incident response process (e.g., a tabletop exercise or simulated incident).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Annual policy review and incident response testing are explicitly called out in SOC 2 Trust Services Criteria. Auditors will ask for evidence of both. The policy review is low effort — read through the document once a year and note any updates. The IR test is the heavier lift, but it doesn't have to be elaborate: a 1-hour tabletop exercise where the team walks through a hypothetical incident scenario is sufficient. Document both activities with dates and attendees. This is non-negotiable for SOC 2.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: User Training on Incident Reporting

> "Users must be trained on the procedures for reporting information security incidents or discovered vulnerabilities, and their responsibilities to report such incidents."

**What this requires:** Provide training to all employees and contractors on how to report security incidents, what the escalation chain is, and their obligation to report. This would typically be part of onboarding and annual security awareness training.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Security awareness training that covers incident reporting is a SOC 2 baseline. Auditors will check that employees have been trained. This doesn't need to be a separate training program — it can be a section in your general security awareness training (which you'll need for SOC 2 anyway). A 5-minute module or a section in your onboarding deck covering "here's how to report a security issue" is sufficient. Low effort, high audit value.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: Maintaining External Contact List for Incident Escalation

> "The contact details of the following have been provided for follow-up: Data protection regulator, Industry Regulatory Bodies, Government Agencies, Law Enforcement Agencies, Power Companies, Telecoms Companies, Utility Companies, Emergency Services."

> "The CEO may elect to contact external authorities, including but not limited to law enforcement, private investigation firms, and government organizations as part of the response to the incident."

**What this requires:** Maintain a documented list of external contacts (regulators, law enforcement, utilities, etc.) that may need to be notified during or after a security incident.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** Having a list of "who to call" externally is reasonable but the scope here is absurd for a cloud-based SaaS startup. You do not need contact details for power companies, telecoms companies, or utility companies — you run on AWS/GCP, not in a physical data center. Simplify this to: (1) law enforcement contact info (local FBI cyber division or equivalent), (2) data protection regulator if you handle EU data (relevant supervisory authority), and (3) your cyber insurance carrier's breach hotline if you have one. Drop everything else. Auditors will not ding you for not having your power company's phone number.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 11: Low-Risk Incident Handling and Periodic Trend Review

> "Low-risk severity incidents are handled through streamlined processes focused on documentation and routine review. These incidents generally do not require immediate escalation or extensive investigation... All low-risk incidents are periodically reviewed to identify trends, ensure accuracy of documentation, and determine whether any follow-up actions or preventative improvements are needed."

**What this requires:** A lighter-weight process for low-severity incidents: log them, create tickets when appropriate, and periodically review the aggregate set for trends.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** This is actually well-written and startup-friendly — it acknowledges that not every incident needs a full-blown investigation. Having a tiered response where low-risk items get documented but don't trigger the entire escalation chain is both practical and shows maturity to auditors. The "periodic trend review" can be a quick look at your incident log during quarterly security reviews. Keep this as-is; it's one of the more sensible parts of the policy.

- [ ] **Implementing**
- **Comment:**
