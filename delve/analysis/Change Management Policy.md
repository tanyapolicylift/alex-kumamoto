# Change Management Policy — Commitment Analysis

**Source:** `source/# Change Management Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Change Management Policy"**

---

## Commitment 1: Formal Change Control Process with Tooling

> "Changes to the information system shall be authorized, documented, and controlled by the use of formal change control procedures."

> "Automatic tools shall be employed (wherever possible) to initiate changes/change requests, to notify the appropriate approval authority, and to record the approval and implementation details."

> "All changes shall be formally assigned to the designated representative for authorization who can approve or disapprove the change depending upon the impact on business services."

**What this requires:** Every change to production systems must go through a documented workflow: someone proposes a change, it gets formally authorized by a designated approver, and the entire trail (request, approval, implementation) is recorded in a tool. The policy also calls for automated tooling to manage this workflow — not just ad hoc Slack messages.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** This is the backbone of SOC 2 change management. Auditors will look for evidence that changes are authorized before they hit production and that there is an audit trail. The good news: if you are already using GitHub PRs (or similar) with required approvals, you are most of the way there. The "automatic tools" language does not mean you need a dedicated change management platform — GitHub/GitLab with branch protection rules qualifies. Just make sure you can pull a report showing "every production change was approved before merge."

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Code Review and Branch Protection (No Direct Production Changes)

> "Developers do not make changes to application code in the production environment without additional approval. Code repository branch rules have been configured to ensure that every merge request to the production environment requires additional approval."

> "Source code changes are logged, time-stamped, and attributed to their author in a source code management tool. Access to the source code tool is restricted to authorized users using multi-factor authentication."

**What this requires:** Two concrete things: (1) Branch protection rules on your production branch so that no one can push directly — every change must go through a pull/merge request with at least one additional approver. (2) MFA must be enforced on your source code management tool (GitHub, GitLab, etc.) for all users with access.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** This is non-negotiable for SOC 2. Auditors will check that branch protection is enabled and that MFA is enforced on your SCM. For a startup already using GitHub, this is a settings change — enable "Require pull request reviews before merging" and "Require approvals" on your main/production branch, and enforce 2FA at the org level. The logging and attribution part comes free with any modern SCM.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Baseline Configuration Documentation

> "A current baseline configuration of the information systems and its components shall be developed, documented and maintained."

> "The baseline configuration of the information systems shall be updated as an integral part of the information system component installation."

> "Changes in the configuration of the information systems shall be monitored."

**What this requires:** You need a documented record of your system's baseline configuration (what servers you run, what versions of software, what security settings are applied, etc.) and you must keep it updated when things change. The policy also says configuration changes should be monitored.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors want to see that you know what your production environment looks like and that changes to it are tracked. But "baseline configuration documentation" sounds more formal than it needs to be for a startup. If you use Infrastructure as Code (Terraform, CloudFormation, Pulumi, etc.), your IaC repo IS your baseline configuration document — it is versioned, auditable, and updated with every change. If you do not use IaC, a simple inventory spreadsheet listing your key systems, their versions, and configs would suffice. You do not need a formal "configuration monitoring" tool at this stage — your IaC diffs or a quarterly manual review will satisfy auditors.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Separate Development/Test Environments

> "Changes to application and system infrastructure are developed and tested in a separate development or test environment before implementation."

**What this requires:** You must have at least one non-production environment (dev, staging, or QA) where changes are tested before being deployed to production. No testing directly in prod.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Auditors will ask about your environments and expect to see separation between where code is developed/tested and where it runs in production. Most startups already have this (even a simple staging environment counts). If you do not have a separate environment yet, this is worth the investment — it also just makes good engineering sense. The cost of a staging environment in the cloud is typically minimal.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Change Communication Procedures (Internal and External)

> "A communication procedure is maintained that describes how employees and customers are notified of a potential application outage, planned or unplanned downtime, changes to application and its functionality, security events and major releases."

> "Internal and external system users are notified through email or internal communication tool for releases prior to system changes which will affect job responsibilities and commitments to the customers."

> "Changes affecting customers in a significant manner shall be formally communicated to them prior to change implementation."

**What this requires:** You need a written procedure for how you communicate changes — both to your team internally and to customers externally. This covers planned outages, major feature changes, security events, and releases. The procedure needs to specify the communication channel (email, Slack, status page, etc.) and timing (before the change goes live).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors expect to see that you have thought about how you communicate changes to affected parties. But this does not need to be an elaborate multi-page procedure. A short document (half a page) saying "for planned maintenance, we post to our status page 24 hours in advance and email affected customers; for unplanned outages, we update the status page immediately and email after resolution" is sufficient. If you already use a status page (e.g., Statuspage by Atlassian, Instatus), point to that. The key is having something written down, not having a complex multi-channel communication matrix.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Post-Implementation Review Meetings

> "Meetings shall be scheduled on a periodic basis to discuss high and medium impact changes and their status ('successful' or 'unsuccessful')."

> "Post-implementation reviews shall be performed to evaluate whether the desired result has been achieved. In the event a change does not perform as expected or causes issues to one or more areas of the production environment, the attendees of the change meeting will determine if the change should be removed and the production environment returned to its prior stable state."

**What this requires:** Regular meetings to review significant changes after they have been deployed, assess whether they worked as expected, and decide on rollbacks if they did not. This implies a recurring cadence (the policy says "periodic") and a defined group of attendees.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Simplify |

**Why:** Formal post-implementation review meetings with defined attendees and agendas are overkill for a 10-person startup where the people who built the change are the same people operating the system. Auditors want to see that you have a way to catch and roll back failed changes, not that you hold formal committee meetings about them. A simpler alternative: (1) Use deployment monitoring (error rates, latency) to detect problems after deploys, and (2) document any rollback decisions in your ticketing system or Slack channel. If you already do retrospectives or post-mortems for incidents, that covers the spirit of this commitment. You do not need a separate recurring "change review meeting."

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Emergency Change Process with Retrospective Approval

> "Changes that can not follow the regular process because of their urgency (such as service outage) shall be considered as emergency changes and require immediate attention and need to be implemented quickly in order to avoid disruption."

> "Approvals shall be obtained for such changes in the form of discussing the matter with a relevant service manager. Such changes shall be assessed and formally approved retrospectively. In addition, such changes shall be discussed in periodic meetings for analysis on lessons learned, root cause, impact, and status."

**What this requires:** A defined process for when you need to push a hotfix or emergency change without going through the normal approval workflow. The process must include: (1) verbal/chat approval from a manager at the time, (2) formal after-the-fact documentation and approval, and (3) a lessons-learned review.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Auditors know that emergencies happen and that you cannot always follow the full approval workflow. What they will flag is if you have NO process for emergencies — that suggests either emergencies never happen (unlikely) or people bypass controls without any documentation (bad). The fix is simple: write a short emergency change procedure (e.g., "In an emergency, get verbal approval from CTO via Slack, push the fix, then create a retrospective PR/ticket within 24 hours documenting what happened and get formal approval after the fact"). The "periodic meetings for lessons learned" part folds into your existing incident retrospective process — you do not need a separate meeting series for this.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Patch Management on a Defined Schedule (with CVSS-based Prioritization)

> "All systems shall be patched and updated on a documented, regular, and timely schedule. Common Vulnerability Scoring System (CVSS) is recommended to be used to aid in setting patching guidelines."

> "Applicable critical vendor-supplied security patches shall be applied within a defined timeframe after release and shall include installation of all other applicable vendor-supplied security patches as per the defined patching schedule. In addition to the patching guidelines, vulnerabilities and exploitable findings deemed critical by PolicyLift, regardless of CVSS score, must be patched as soon as possible."

**What this requires:** You need a documented patching schedule that specifies how quickly different severity levels of patches must be applied. Critical patches have an explicit SLA (the policy says "within a defined timeframe" — you need to define that timeframe). You should reference CVSS scores for prioritization, and anything deemed critical by the team must be patched "as soon as possible" regardless of its official CVSS score.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Patch management is a core SOC 2 control. Auditors will ask to see your patching policy and will sample evidence that you are actually following it. The good news: you do not need to overcomplicate this. Define simple SLAs (e.g., critical patches within 7 days, high within 30 days, medium within 90 days), enable auto-updates where feasible (OS-level patches, dependency updates via Dependabot/Renovate), and keep a record of when patches were applied. If you are fully cloud-native and use managed services (RDS, Lambda, etc.), much of the OS-level patching is handled by your cloud provider — document that fact. The CVSS recommendation is just guidance, not a rigid requirement.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Change Denial Criteria and Rollback Plans

> "The business owner/change advisory board or their designee may deny a scheduled or unscheduled change for unreasonable changes like inadequate change planning or unit testing, lack of stakeholder acceptance (where applicable), system integration, interoperability concerns, missing or deficient roll-back plans, security implications and risks, timing of the change negatively impacting key business processes..."

**What this requires:** There must be defined criteria under which a proposed change can be denied, and changes are expected to include rollback plans. This implies that change requests should document: what the change is, why, what testing was done, and how to roll it back if something goes wrong.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** Having a formal "change advisory board" with enumerated denial criteria is enterprise-level process. For a startup, the PR review process already serves this function — a reviewer can reject a PR for any of these reasons. The one useful nugget here is rollback plans: for significant infrastructure or database changes, it is genuinely good practice to think about "how do we undo this if it breaks?" You do not need a formal checklist or CAB — just add a lightweight prompt in your PR template (e.g., "Rollback plan: ___") for changes that touch infrastructure or data. The rest of the denial criteria language can be removed without SOC 2 risk.

- [ ] **Implementing**
- **Comment:**

---
