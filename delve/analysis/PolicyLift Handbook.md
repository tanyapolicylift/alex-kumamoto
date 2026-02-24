# PolicyLift Handbook — Commitment Analysis

**Source:** `source/# PolicyLift Handbook.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize PolicyLift Handbook"**

---

## Overview

This is a standard Employee Handbook covering employment terms, conduct expectations, HR policies, and benefits. The vast majority of the content is boilerplate employment law compliance (at-will employment, EEO, leave policies, pay practices) that has **no direct SOC 2 relevance**. Only a handful of sections create operational commitments that matter for a SOC 2 audit. The analysis below focuses exclusively on those.

Sections **not** analyzed because they are standard HR/legal boilerplate with no SOC 2 implications:
- At-Will Employment
- Equal Employment Opportunity / Accommodation of Disabilities
- Pay Practices / Overtime / Error in Pay / Exempt Employee Salary Reduction
- Maternity & Parental Leave / Jury Duty / Personal Leave of Absence
- Violence in the Workplace / Weapons / Drug-Free Workplace
- Workers' Compensation

---

## Commitment 1: Employee Handbook Acknowledgement & Distribution

> "I acknowledge receipt of PolicyLift's Employee Handbook ('Handbook'). I understand this handbook contains information regarding PolicyLift's rules and benefits which affect me as an employee."

> "This Employee Handbook replaces all previous PolicyLift handbooks, policies, and memoranda. Failure to follow any of the policies in this handbook may result in disciplinary action, up to and including, termination of employment."

**What this requires:** Every employee must receive the handbook and sign an acknowledgement form. This means maintaining a process to distribute the handbook to new hires (and after updates) and collecting signed acknowledgements that are stored in personnel files.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** SOC 2 auditors explicitly check that employees have acknowledged company policies. This is table stakes — you need a record showing each employee received and acknowledged the handbook (and by extension, the security policies referenced within it). For a small startup, this is as simple as a signed PDF or a checkbox in your onboarding tool.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Personnel File Maintenance

> "PolicyLift maintains a personnel file on each employee. Contact your supervisor to request a review of your company, payroll, and/or benefits plan personnel file."

> "To ensure that your personnel file is up-to-date at all times, notify your supervisor or your payroll specialist of any changes in your name, telephone number, home address, withholding instructions, number of dependents, beneficiary designations, or the individuals to notify in case of an emergency."

**What this requires:** Maintain a personnel file for each employee containing up-to-date personal information, employment records, and policy acknowledgements. Employees are expected to report changes; the company must have a system to store and update these records.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Personnel files are where you store evidence of background checks, policy acknowledgements, and training completion — all of which auditors want to see. Most startups already handle this through their payroll/HR platform (Gusto, Rippling, etc.). The commitment itself is minimal; the real question is whether you are storing the right documents in those files. No new process needed if you already use an HR tool.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Progressive Discipline & Policy Enforcement Process

> "Where appropriate, supervisors will follow a process of progressive employee discipline. Before or during application of any discipline, employees may be given an opportunity to relate their version of the incident or problem and provide an explanation."

> "Verbal Counseling — A conversation with an employee explaining that the employee's conduct or poor performance is unacceptable... Written Counseling — A written document or memo that describes the unacceptable conduct or performance... Termination — If an employee fails to follow acceptable conduct or performance standards, the company may terminate the employee's employment."

**What this requires:** A defined escalation path for policy violations (verbal warning, written warning, termination). Supervisors must document disciplinary actions and retain records. This applies to violations of all company policies, including security policies.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** SOC 2 auditors want to see that security policies are enforceable — that there are consequences for violations. You do not need a complex HR discipline system; you just need the handbook to state that policy violations can lead to disciplinary action up to termination. The three-tier structure (verbal, written, termination) is clean and standard. Keep it as-is; it costs nothing and demonstrates that policies have teeth.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Anti-Harassment Complaint & Investigation Procedure

> "Reported or suspected occurrences of harassment or discrimination will be promptly and thoroughly investigated. Following an investigation, PolicyLift will promptly take any necessary and appropriate disciplinary action."

> "If you wish to make an anonymous or formal complaint, you may do so. For reporting an employer who isn't meeting the minimum employment standards, please refer to PolicyLift whistleblower form provided on the Delve platform."

> "Once a complaint of alleged harassment, sexual harassment, or discrimination is received, we will begin a prompt and thorough investigation. The investigation may include interviews with all involved employees..."

**What this requires:** A formal complaint intake channel (including an anonymous whistleblower form on the Delve platform), a defined investigation procedure, and documented outcomes. Supervisors must be trained on their duty to escalate complaints.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Simplify |

**Why:** The anti-harassment investigation procedure is important for employment law compliance, but it is not a SOC 2 audit focus area. What SOC 2 auditors *do* care about is that employees have a way to report security concerns and policy violations — a whistleblower/reporting channel. The reference to the "Delve platform whistleblower form" serves double duty here. Recommendation: keep the whistleblower/reporting channel reference (it supports SOC 2 integrity controls), but do not over-invest in formalizing the detailed investigation procedure beyond what employment law requires. The detailed harassment investigation steps are a legal obligation, not a SOC 2 one.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Internet Acceptable Use & Communications Monitoring

> "Access to the internet has been provided to employees primarily for the benefit of the organization."

> "All messages created, sent or retrieved over the internet are the property of the company and are not private. The company may access and monitor all messages and files on the computer system at any time."

> "Never disclose personal or system passwords to anyone other than authorized company representatives. You are not to attempt to gain access to another employee's system, including email."

> "You should obtain prior approval before downloading any software. Users are not permitted to copy, transfer, rename, add or delete information or programs belonging to other users unless given express permission to do so by the owner."

**What this requires:** Several sub-commitments:
- Employees must not share passwords or access others' systems without authorization
- Software downloads require prior approval
- Company reserves the right to monitor all electronic communications
- Employees are responsible for content they transmit

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep (but note overlap) |

**Why:** These commitments directly support SOC 2 access control and acceptable use requirements. Password sharing prohibition, software installation controls, and the company's right to monitor systems are all things auditors expect to see in policy. However, note that most of this likely overlaps with the separate **Acceptable Use Policy** (`source/# Acceptable Use Policy.md`). Recommendation: keep these statements in the handbook for completeness (they reinforce what employees sign), but ensure they are consistent with your standalone Acceptable Use Policy. Do not create conflicting rules between the two documents.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Confidentiality of Personal & System Information

> "Breaking confidentiality of information such as, National identification numbers, including any part of National identification numbers. Personal information also includes driver's license numbers, state-issued identification card numbers, date of birth, credit or debit or other account numbers, passport numbers, alien registration numbers or health insurance identification numbers"

> "Giving confidential or proprietary information to competitors"

**What this requires:** Employees are prohibited from disclosing personal data (PII) and proprietary company information. Violations are grounds for disciplinary action up to termination.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** SOC 2 confidentiality criteria require that the organization has policies governing how sensitive data is handled and that employees understand their obligations. This handbook language establishes the baseline expectation. It costs nothing to keep and reinforces the Data Classification Policy. The specific enumeration of PII types (SSN, driver's license, account numbers, etc.) is helpful for auditors — it shows the company has thought about what constitutes sensitive data.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: System Documentation & User Guidelines

> "The organization has developed documentation and user guides that describe relevant system components as well as the purpose and design of the system. These documents are made available to both internal and external users and updated as needed. The documentation also describes the organization, and the product/service delivered."

**What this requires:** Maintain documentation describing PolicyLift's system components, their purpose, and design. Make this documentation available to internal and external users. Update it as needed.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** This is a direct SOC 2 requirement. The AICPA Trust Services Criteria (CC2.1 / CC2.2) require that the entity communicates information about the system's boundaries, components, and responsibilities to both internal users and external parties. Auditors will look for system descriptions, architecture documentation, and user-facing documentation. This commitment is correctly placed here but feels oddly tacked onto the end of an employee handbook. Recommendation: keep this commitment, but consider whether the actual system documentation lives in a more appropriate location (e.g., an internal wiki or the SOC 2 system description itself). The handbook should reference it; the documentation itself should exist elsewhere.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Policy Change Notification Process

> "The company may change, revoke, or supplement the policies in this handbook at any time without notice. The company will determine the effective date of any changes and every effort will be made to notify you in advance."

> "I further understand PolicyLift reserves the right to modify the policies and benefits in the Handbook at any time without notice."

**What this requires:** While the company reserves the right to change policies without notice, it commits to making "every effort" to notify employees in advance of changes. This implies a communication process for policy updates.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** SOC 2 auditors care that employees are aware of current policies, but they do not prescribe a specific change notification process for HR handbooks. The language here is already appropriately vague ("every effort will be made"). For a 10-person startup, policy changes can be communicated via a Slack message or team meeting. No formal process is needed. Keep the language as-is — it is flexible enough to not create a real burden — but do not invest in building a formal policy change management workflow just for the handbook.

- [ ] **Implementing**
- **Comment:**

---

## Summary

| # | Commitment | Difficulty | SOC 2 Necessity | Recommendation |
|---|-----------|------------|-----------------|----------------|
| 1 | Handbook Acknowledgement & Distribution | Low | Critical | Keep |
| 2 | Personnel File Maintenance | Low | Important | Keep |
| 3 | Progressive Discipline & Policy Enforcement | Low | Important | Keep |
| 4 | Anti-Harassment Complaint & Investigation Procedure | Medium | Nice-to-Have | Simplify |
| 5 | Internet Acceptable Use & Communications Monitoring | Low | Important | Keep (note overlap) |
| 6 | Confidentiality of Personal & System Information | Low | Important | Keep |
| 7 | System Documentation & User Guidelines | Medium | Critical | Keep |
| 8 | Policy Change Notification Process | Low | Nice-to-Have | Simplify |

**Overall Assessment:** This handbook is largely standard HR boilerplate. The SOC 2-relevant commitments are modest and mostly low-effort. The two critical items (handbook acknowledgement and system documentation) are non-negotiable. The rest reinforces other policies and costs almost nothing to maintain. This is one of the lighter policies in terms of operational burden — the main risk is inconsistency with the standalone Acceptable Use Policy and other security policies, so ensure alignment across documents.
