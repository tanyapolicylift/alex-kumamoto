# Business Continuity and Disaster Recovery — Commitment Analysis

**Source:** `source/# Business Continuity and Disaster Recovery.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Business Continuity and Disaster Recovery"**

---

## Commitment 1: Formal Business Impact Analysis (BIA) Process

> PolicyLift must implement a formal process to establish the criticality of a specific process or business unit and the impact on PolicyLift's business if they are not operational in the event of a disaster. The results of this process should be used to determine business continuity priorities and requirements. The BIA should be reviewed and updated periodically.

> At the very least, the business impact analysis exercise should consider maximum tolerable business downtime, recovery time objective, recovery point objective, monetary loss, operational disruption, financial consideration, regulatory requirements, contractual obligations, and organizational reputation.

> Before performing a Business Impact Analysis, PolicyLift should carry out a Risk Assessment.

**What this requires:** You must create a documented BIA that catalogs your critical systems/processes, defines RTO (Recovery Time Objective) and RPO (Recovery Point Objective) for each, and estimates impact of downtime. This needs to be reviewed periodically (at least annually). The policy also says a Risk Assessment should precede the BIA, tying this to your Risk Assessment policy.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplified) |

**Why:** Auditors will ask to see a BIA during a SOC 2 Type II audit — it is the backbone of your BC/DR story. However, for a 10-person startup, this does not need to be an elaborate multi-department exercise. A single document listing your 5-10 critical systems (database, app servers, auth provider, payment processing, etc.) with RTO/RPO targets and a rough impact assessment is sufficient. The nine-factor checklist in the policy (monetary loss, regulatory requirements, etc.) is enterprise overkill — cover RTO, RPO, and business impact and you are in good shape. The "Risk Assessment first" requirement is already handled if you have a Risk Assessment policy in place.

- [x] **Implementing**
- **Comment:**

---

## Commitment 2: Written Business Continuity Plan (BCP)

> Business Continuity Plans are maintained for processes and business units identified as critical during the BIA. The BCP includes strategies for personnel safety, threat analysis, alternate strategies for business continuity, primary tasks required for continuing operations, management contact information, personnel relocation information, data backups and site backup information, communication strategies, and organizational buy-in.

> Every internal department, process, or any distinct client business component that is considered vital and whose prolonged disruption would significantly impact PolicyLift, must establish a Business Continuity (BCP) and Disaster Recovery Plan (DRP) in line with an agreed-upon strategy.

**What this requires:** You need a written BCP document that covers how the business keeps operating during a disruption. The policy frames this as per-department plans, and includes a long list of required contents (personnel safety, relocation info, communication strategies, etc.).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify |

**Why:** SOC 2 auditors will look for a documented continuity plan. But "every internal department" writing its own BCP is enterprise thinking — at a 10-person startup, you are one department. Write a single, concise BCP document that covers: (1) who makes decisions during an outage, (2) how the team communicates (Slack channel, phone tree), (3) what the critical systems are and how they fail over, and (4) how you notify customers. Skip "personnel relocation information" and "organizational buy-in" — those are filler for large orgs. One document, 2-4 pages, is all you need.

- [x] **Implementing**
- **Comment:**

---

## Commitment 3: Written Disaster Recovery Plan (DRP)

> Disaster Recovery Plans are maintained detailing the sequential process of recovering and restoring business operations to a pre-disaster state. This includes damage assessment, recovery cost estimation, liaison with insurance companies, monitoring recovery progress, and transitioning management back from the recovery team to the regular managers.

**What this requires:** A separate DRP document focused on the technical recovery steps: how to restore services, in what order, who does what. The policy lists items like "liaison with insurance companies" and "transitioning management back from the recovery team to the regular managers."

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify (merge with BCP) |

**Why:** Auditors want to see that you have documented recovery procedures. But for a startup, having a separate BCP and DRP is unnecessary overhead — they cover overlapping ground. Merge the DRP into your BCP as a "Recovery Procedures" section that documents: which infrastructure to restore first, how to restore from backups, the runbook for spinning up services in a new region, and who is responsible. Drop the enterprise-specific items like "liaison with insurance companies" and "recovery cost estimation" — those are irrelevant at your scale.

- [x] **Implementing**
- **Comment:**

---

## Commitment 4: Automated Backups with Cross-Zone Replication

> Back-ups should be performed at least weekly for user data using an automated system and replicated to a different availability zone.

> Operations personnel must be alerted in case of backup failures. Failures that impact backups of database instances should be investigated and resolved in accordance with the Incident Management Policy/Procedure.

**What this requires:** Automated backups of user data at least weekly, replicated to a different availability zone. Alerting on backup failures, with failures treated as incidents.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** This is table stakes. If you are on AWS RDS or similar managed databases, you likely already have automated daily backups with cross-AZ replication enabled by default. Verify the setting is on, make sure CloudWatch (or equivalent) alerts on failures, and you are done. The "weekly" minimum is very lenient — most managed databases back up daily or continuously. This is one of the first things an auditor will verify. Non-negotiable.

- [x] **Implementing**
- **Comment:**

---

## Commitment 5: Annual Backup Restoration Testing

> Restoration of backups should be periodically tested annually.

**What this requires:** At least once per year, actually restore a backup to verify it works. Document the results.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** An untested backup is not a backup. Auditors will ask for evidence that you have verified your backups actually restore successfully. This is a one-day exercise once a year: spin up a test instance, restore from backup, verify data integrity, document it, tear it down. Easy to do, easy to forget — put it on the calendar. Non-negotiable for SOC 2.

- [x] **Implementing**
- **Comment:**

---

## Commitment 6: BC/DR Plan Testing and Post-Test Reporting

> Periodic tests should be performed by authorized personnel to test the execution of business continuity and disaster recovery plans. These tests could be tabletop sessions, disaster simulations, or other realistic scenarios. Following each test, an assessment report should be created indicating the success of the exercise and required corrective actions. Plans should be updated based on the results of these tests.

> The business continuity and disaster recovery plans should be tested and reviewed periodically to ensure they remain pertinent.

**What this requires:** Periodic (the policy does not specify cadence) testing of your BC/DR plans — tabletop exercises, simulations, or similar. After each test, produce a written assessment report with findings and corrective actions. Update the plans based on test results.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors want to see that your BC/DR plan is not just shelfware — that you have actually exercised it. For a startup, an annual tabletop exercise is sufficient: gather the team for 1-2 hours, walk through a scenario ("our primary region goes down — what do we do?"), and write up a one-page summary of what went well and what needs fixing. You do not need "disaster simulations" or multiple tests per year. The assessment report can be lightweight — a dated document with attendees, scenario, findings, and action items. The key is having dated evidence that you tested.

- [x] **Implementing**
- **Comment:**

---

## Commitment 7: BC/DR Role Assignment and Responsibility Documentation

> The organization must ensure roles and responsibilities are allocated for providing guidance and supervision for business continuity and disaster recovery activities, managing all aspects of the BIA (Business Impact Analysis), BCP, and DRP, keeping management updated on BCP and DRP readiness, managing BCP testing exercises, educating the relevant individuals on the organization's business continuity and disaster activities, and managing the BCP and DRP plans in the event of an actual or potential disaster.

> Management should assign respective department heads with the responsibility to maintain a basic acceptable standard of service in disaster situations.

**What this requires:** Formally assign someone to own the BC/DR program: maintaining the plans, running tests, keeping leadership informed, and managing the response during an actual incident. The policy frames this as multiple roles across departments.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors want to see that someone owns this — it cannot be "everyone's job" (which means no one's job). At a 10-person startup, this does not require a formal role assignment matrix or department-level heads. Simply designate one person (likely your CTO or head of engineering) as the BC/DR owner in your plan document. That person is responsible for keeping the plan current, scheduling the annual test, and leading response during an actual incident. One line in the BCP naming the owner, not a committee structure.

- [x] **Implementing**
- **Comment:**

---

## Commitment 8: Employee BC/DR Training and Awareness

> Regular training and awareness sessions on business continuity and disaster recovery should be arranged for PolicyLift employees.

> Additionally, all management personnel and employees should be informed about the business continuity and disaster recovery plans and their role and responsibilities in achieving the set continuity and recovery goals.

**What this requires:** Recurring training sessions for all employees on BC/DR plans, including their specific roles during a disruption.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors will check that employees know the BC/DR plan exists and understand their role. For a 10-person startup, "regular training sessions" is overkill — you do not need a formal training program. Cover BC/DR awareness as part of your annual security training (which you will already need for SOC 2). Make the BCP/DRP accessible to everyone (e.g., in a shared wiki or Notion). When you do your annual tabletop exercise (Commitment 6), that itself serves as training. No separate recurring sessions needed.

- [x] **Implementing**
- **Comment:**

---

## Commitment 9: Emergency Contact List Maintenance

> The essential team contact list should be updated and maintained regularly.

**What this requires:** Maintain an up-to-date emergency contact list for the team and keep it current.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Simple and useful beyond compliance. Maintain a list of team members' phone numbers and personal emails in a secure, accessible location (e.g., a pinned doc, your BCP document, or a password manager shared vault). Review it when someone joins or leaves. At 10 people this is trivial to maintain and auditors like to see it as part of your continuity plan. Just make sure it is actually kept current — stale contact lists are worse than useless in a real incident.

- [x] **Implementing**
- **Comment:**

---

## Commitment 10: Third-Party Supplier BC/DR Requirements

> The contract with third-party suppliers that provide critical services to PolicyLift should include clear communication and understanding of relevant plans, and sufficient contingency or recovery strategies over the product and service lifecycle.

**What this requires:** Your contracts with critical vendors must include provisions about their own BC/DR capabilities and contingency strategies.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Remove (or defer) |

**Why:** In theory, yes, you should understand how your critical vendors handle disasters. In practice, you are using AWS, Stripe, Auth0, and similar SaaS providers — you have zero leverage to negotiate BC/DR contract terms with them, and they all publish their own SOC 2 reports and SLAs. For SOC 2, what actually matters is that you have a vendor management process (covered by your Vendor Management Policy) and that you have reviewed your critical vendors' SOC 2 reports. Putting BC/DR language into every vendor contract is an enterprise procurement activity that adds no real security value at your scale. If your Vendor Management Policy already covers reviewing vendor compliance reports, this commitment is redundant. Defer or remove.

- [ ] **Implementing**
- **Comment:**

---
