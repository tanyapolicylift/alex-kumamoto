# Personnel Security Policy — Commitment Analysis

**Source:** `source/# Personnel Security Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Personnel Security Policy"**

---

## Commitment 1: Background Checks on All New Hires and Contractors

> "The organization shall carry out background and/or reference checks on all new employees and contractors prior to joining the organization in accordance with relevant laws, regulations and ethics, and proportional to the business requirements."

> "Management utilizes a pre-hire checklist to ensure that hiring manager has assessed the qualification of candidates during the hiring process to confirm that they can perform the necessary job requirements."

**What this requires:** Run background checks (or at minimum reference checks) on every new employee and contractor before they start. Maintain a pre-hire checklist that hiring managers complete to document qualification assessment.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Background checks are a standard SOC 2 expectation and auditors will look for evidence that they happen. Services like Checkr make this trivially easy and inexpensive. The pre-hire checklist can be a simple Google Form or a Notion template — nothing elaborate needed.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Confidentiality and IP Agreements at Hire

> "At the time of hire, company employees and contractors are required to read and accept the Employee Confidentiality Agreement that includes an intellectual property clause, code of business conduct, ethical standards, and Information Security Policy that includes appropriate use of information technology."

> "All contractors engaged with PolicyLift shall have a contractual agreement in place with PolicyLift for not divulging any confidential or sensitive information to any unauthorized parties both during and after the cessation of the contract with PolicyLift."

**What this requires:** Have a formal confidentiality/IP agreement that every employee and contractor signs upon hire or engagement. This agreement must cover: IP assignment, confidentiality obligations (surviving termination), code of conduct, and acknowledgment of the Information Security Policy.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** This is table stakes for SOC 2 and for any startup generally. You likely already have something like this from your lawyer. The key audit evidence is a signed copy on file for every person. Make sure contractor agreements include the same confidentiality language — auditors check contractor coverage too.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Annual Reaffirmation of Code of Conduct and Policies

> "Personnel, including contractors, are required to formally reaffirm the understanding of the code of conduct and ethical standards on an annual basis."

> "All PolicyLift employees are required to annually acknowledge that they have read and understood the security policies and procedures."

**What this requires:** Once a year, every employee and contractor must re-sign or re-acknowledge the code of conduct, ethical standards, and security policies. You need to track and retain records of these acknowledgments.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Annual policy acknowledgment is one of the most commonly checked SOC 2 controls. Auditors will ask for a list of all personnel and proof that each one acknowledged policies within the audit period. This can be as simple as an annual email with a DocuSign link or a checkbox in your compliance tool (Vanta, Drata, etc.). Very low effort, very high audit value.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Security Awareness Training (At Hire + Annually)

> "Employees are required to complete an information security and awareness training upon hire and at least annually."

> "PolicyLift must establish formal information security awareness, education, and training programs for all employees and, where relevant, contractors and/or third parties, appropriate for their assigned job functions."

> "Employees shall undergo mandatory security awareness training at least annually, and records of such training shall be maintained."

> "Specialized training is scheduled at intervals for different units in the organization and/or when there are significant changes to the information systems."

**What this requires:** Every employee must complete security awareness training when they join and then again at least once per year. Training records must be retained as evidence. The policy also calls for "specialized training" for different units when there are significant system changes.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Simplify |

**Why:** Annual security awareness training is non-negotiable for SOC 2 — auditors will explicitly check for completion records. Use an off-the-shelf platform (KnowBe4, Curricula, or whatever your compliance tool bundles) and you are done. However, the "specialized training scheduled at intervals for different units" language is enterprise overhead. At a 10-person startup, everyone can take the same training. Simplify to: security awareness training at hire + annually for all personnel, with records retained. Drop the specialized-by-unit cadence.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Employee Handbook and Sanctions Policy

> "The company maintains an up-to-date Employee Handbook and an (including) up-to-date Sanctions Policy. The sanctions policy mentions that non-compliance with the code of business conduct can lead to termination of employees."

**What this requires:** Maintain a written Employee Handbook that includes (or links to) a Sanctions Policy. The sanctions policy must make clear that violating security/conduct policies can result in disciplinary action up to termination.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Auditors want to see that there are consequences for policy violations — it shows the policies have teeth. You probably already have an employee handbook via your PEO or HR platform (Gusto, Rippling, etc.). Just make sure it includes a section stating that policy violations may result in disciplinary action including termination. This can be a single paragraph; it does not need to be a standalone document.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Job Descriptions with Security Responsibilities

> "Roles and responsibilities shall be defined in a job description highlighting the responsibilities and required skills for specific roles and communicated to individuals."

> "Roles and responsibilities of senior management and information security employees/contractors must be defined in written job descriptions or contractual agreements."

> "For senior management and security related roles, the job description includes duties such as proper oversight, management, and monitoring of security activities, and are communicated to the employees/contractors during the onboarding process."

**What this requires:** Written job descriptions for all roles — and for senior management and security-related roles specifically, the descriptions must include security oversight duties. Job descriptions should be reviewed and updated as needed.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors may ask to see job descriptions for key security roles (CISO, engineering leads) to verify that security responsibilities are formally assigned. You do not need formal job descriptions for every single role at a 10-person startup. Simplify to: maintain written role descriptions for security-relevant roles (whoever fills the CISO function, engineering leads, anyone with production access). A short paragraph per role in a Notion doc is sufficient. Do not build an enterprise-grade job description library.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Annual Performance Evaluations

> "PolicyLift shall conduct annual performance evaluations by the end of each calendar year for employees that have been with the organization for more than a year. Respective supervisors shall perform these formal performance evaluations at least annually based on the criteria and objectives outlined in the job descriptions."

> "During the annual review the employees and their supervisor discuss relevant training needs, if any, to support in-scope systems. A review of job descriptions shall be performed and any changes shall be discussed."

**What this requires:** Formal annual performance reviews for every employee who has been at the company for more than a year. Reviews must be tied to job description criteria, include a discussion of training needs, and trigger a review of the job description itself.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Simplify |

**Why:** Annual performance evaluations are good practice but are not a core SOC 2 control. Auditors are primarily interested in whether security responsibilities are assigned and whether people complete required training — not whether you have a formal annual review cycle with job-description-linked criteria. Most early-stage startups do lightweight check-ins, not structured annual reviews. If you already do annual reviews, great — include a brief discussion of security responsibilities and training. If you do not, do not build a formal performance review process just for SOC 2. Simplify to: periodic check-ins that include discussion of security-relevant training needs.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Access Request Tracking via Ticketing System

> "A ticketing system and/or access request form is used to record granting of new or modified access to the system account based on authorization by the management."

**What this requires:** All access grants and modifications must be tracked through a ticketing system or formal access request form with management approval on record.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Access management is one of the most heavily scrutinized areas in a SOC 2 audit. Auditors will sample access grants and ask to see evidence that each one was requested and approved before being provisioned. This does not need to be a heavyweight ITSM tool — a Slack workflow, a Jira ticket template, or even a Google Form that routes to a manager for approval will satisfy auditors. The key is having a written record that access was authorized. This commitment is correctly scoped and important to keep.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Org Chart and Communication of Role Changes

> "Organization has established an organization chart that defines organizational roles, reporting lines, and authorities as it relates to development, quality assurance, and security operations of its services. The organization structure is reviewed and updated as needed basis."

> "Significant changes to people, roles, and responsibilities for key personnel are internally communicated to all personnel via e-mail or the internal communication tool."

**What this requires:** Maintain a current org chart covering dev, QA, and security operations. When key personnel change roles or leave, communicate this to the team via email or Slack.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors want to see that there is a clear picture of who is responsible for what, especially for security functions. At a 10-person startup, a simple org chart in Notion or your HR tool (which likely auto-generates one) is fine. The "communicate changes to all personnel" part is natural at a small company — you are already doing this in Slack when someone joins, leaves, or changes roles. Keep this but do not over-formalize it. An auto-generated org chart from your HR tool plus normal Slack announcements will satisfy this.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: Termination Separation Agreement

> "The organization shall consider creating a separation agreement to safeguard PolicyLift and its customers' Intellectual Property Rights and confidential information at the time of terminating their employment or business relationship with PolicyLift."

**What this requires:** Have a separation agreement (or at minimum a termination checklist that includes IP/confidentiality reminders) that is used when employees or contractors depart.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** The policy language here is notably soft — it says "shall consider creating" rather than "shall create." Auditors care far more about the access revocation side of termination (covered in Access Control and Termination Policy) than a formal separation agreement. That said, having a basic offboarding checklist that includes a reminder of ongoing confidentiality obligations is good practice and easy to do. Simplify to: include a confidentiality reminder as part of the offboarding process. You do not need a formal legal separation agreement for every departure unless your lawyer recommends it.

- [ ] **Implementing**
- **Comment:**
