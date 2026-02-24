# Acceptable Use Policy — Commitment Analysis

**Source:** `source/# Acceptable Use Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Acceptable Use Policy"**

---

## Commitment 1: Multi-Factor Authentication and Password Management

> "Multi-factor authentication is required for all system access where available. Users must maintain secure password practices, including using unique passwords for each system and maintaining complexity requirements. Passwords must never be shared and should only be stored in approved password managers."

> "All shared account credentials must be stored in a Company-approved password manager."

**What this requires:** Enforce MFA across all systems that support it. Designate an approved password manager (e.g., 1Password, Bitwarden) and require all team members to use it. Establish password complexity requirements and ensure shared service account credentials are stored only in the approved manager.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** MFA and a company password manager are table stakes for SOC 2. Auditors will check that MFA is enforced and that there is a documented approach to credential management. Most startups already use a password manager — just make sure it is formally designated and MFA is turned on everywhere.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Security Awareness Training Program

> "All users must follow established data handling and protection requirements while completing required security awareness training."

**What this requires:** Establish a recurring security awareness training program for all employees and contractors. This typically means selecting a training platform (e.g., KnowBe4, Curricula), running training at onboarding and at least annually, and documenting completion.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** SOC 2 auditors explicitly look for evidence that security awareness training is conducted at least annually and at onboarding. This is non-negotiable. The effort is mostly upfront (choosing a tool, setting up the curriculum); recurring effort is low once established.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Device Registration and Endpoint Security Requirements

> "Any devices used for PolicyLift business must be registered and follow all configuration and security requirements."

> "Personal devices used for PolicyLift business activities must comply with PolicyLift's Bring Your Own Device (BYOD) policy requirements." *(highlighted in source)*

> "Systems must be locked or logged out when unattended, and users should only utilize approved software and services while ensuring their systems and software remain up to date."

**What this requires:** Maintain a registry of all devices accessing company systems. Enforce endpoint security standards (screen lock, disk encryption, up-to-date OS/software). If personal devices are allowed, create and enforce a BYOD policy covering the same standards.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors will want to see that you know what devices access your systems and that those devices meet minimum security standards. For a 10-person startup, a full device registry plus a formal BYOD policy is heavy. Simplify by (a) requiring company-managed devices via an MDM tool like Kandji or Jamf, which gives you the registry and enforcement in one shot, or (b) if personal devices are used, documenting minimum standards (encryption on, screen lock, current OS) without a full standalone BYOD policy document. The highlighted text flags the BYOD clause — decide whether you actually allow personal devices or if you can avoid this complexity by issuing company laptops.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Software Approval and Patch Management Process

> "All software installations must be approved by IT, and users must maintain proper software licenses and compliance. Regular security patches and updates must be applied to all systems and software. Users may only utilize approved cloud services and applications." *(IT highlighted in source)*

**What this requires:** Designate someone as the IT approver for software installations. Maintain a list of approved software and cloud services. Ensure patches and updates are applied in a timely manner across all endpoints and systems.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors care about patch management and knowing what software is in your environment. However, the policy refers to "IT" — which is a highlighted flag because a 10-person startup likely does not have a dedicated IT department. Simplify by (a) assigning this responsibility to a named person (e.g., CTO or a senior engineer), (b) maintaining a lightweight approved-tools list (a simple spreadsheet or Notion page), and (c) using MDM or automatic updates to handle patching rather than a manual process. You do not need a formal software approval workflow — just a list and a responsible person.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Comprehensive Audit Logging

> "PolicyLift maintains comprehensive audit logs documenting user activities, access patterns, system configuration changes, security events, administrator activities, time synchronization, and system alerts." *(entire section highlighted in source)*

> "PolicyLift maintains the right to monitor all system and network activity, audit user actions and access, review stored data and communications..."

**What this requires:** Implement centralized logging that captures user activities, access patterns, configuration changes, security events, admin actions, and system alerts across your infrastructure. Logs must be retained and available for review during audits.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium–High | Critical | Keep (with scoping) |

**Why:** Audit logging is a core SOC 2 requirement — auditors will ask to see logs and will test that they exist and are retained. The highlighted text flags this because "comprehensive" is doing a lot of heavy lifting. For a startup, scope this to what matters: cloud provider audit logs (AWS CloudTrail / GCP Audit Logs), application access logs, and identity provider logs. You do not need a full SIEM on day one. Use your cloud provider's native logging, ensure it is turned on and retained for at least 12 months, and be ready to pull logs if asked. The mention of "time synchronization" is standard (NTP) and typically handled automatically by cloud infrastructure.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Data Handling by Classification Level and Encryption Requirements

> "All users must handle data according to its established sensitivity level, ensuring appropriate encryption for sensitive data both in transit and at rest. Users must implement approved cryptographic controls based on risk assessment and follow specific requirements for cryptographic key management."

> "Data storage is restricted to approved systems and services only. The sharing of sensitive data outside PolicyLift requires proper authorization."

> "Additional controls must be applied for sensitive data categories as defined by PolicyLift's data classification policy."

**What this requires:** Establish a data classification scheme (this policy references a separate Data Classification Policy), encrypt sensitive data in transit and at rest, define approved storage locations, and require authorization before sharing sensitive data externally. Also implies a need for cryptographic key management practices.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplify crypto key management) |

**Why:** Encryption in transit (TLS) and at rest (cloud provider default encryption) are SOC 2 essentials and likely already in place if you use AWS/GCP. Data classification is also expected — auditors want to see that you categorize data and handle it accordingly. The cryptographic key management language is where this gets heavy; for a startup using cloud-managed encryption (AWS KMS, GCP KMS), key management is largely handled for you. Simplify the commitment: keep classification, keep encryption, but define key management as "we use cloud-provider-managed keys" rather than writing a standalone key management procedure.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Immediate Security Incident Reporting Obligation

> "Security incidents must be reported immediately, including any suspected breaches, lost or stolen devices, credential compromises, unusual system behavior, security control failures, or policy violations."

> "Users are required to protect and secure any devices used to access PolicyLift systems and must report all security incidents and suspected compromises immediately."

> "Any suspected data breaches must be reported immediately."

**What this requires:** Establish a clear, documented process for employees to report security incidents. Define what constitutes a reportable incident and provide a specific channel (e.g., Slack channel, email alias, PagerDuty). The word "immediately" appears three times — this implies an expectation of near-real-time reporting, not "when you get around to it."

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Incident reporting is a foundational SOC 2 control. Auditors will ask: "How do employees report security incidents?" and "Can you show me evidence of reported incidents?" This is easy to implement — set up a dedicated Slack channel or email alias, document the process in onboarding materials, and reference it in training. The policy language here is appropriate and does not need simplification.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Prohibited Activities Enforcement and Policy Violation Investigation

> "Any violation of this policy may result in disciplinary action, including but not limited to revocation of system access or termination of employment."

> "All policy violations will be documented and thoroughly investigated."

> "Users are explicitly prohibited from attempting to access, modify, or delete system logs, audit trails, or security data."

**What this requires:** Maintain a process to document and investigate policy violations. This implies you need a way to track violations, conduct investigations, and apply disciplinary measures. The log-tampering prohibition requires that logs are protected from user modification (access controls on logging systems).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep (lightweight) |

**Why:** Having a documented disciplinary process for policy violations is expected in SOC 2 — it shows the policies have teeth. For a startup, this does not need to be elaborate. A simple note in the employee handbook ("violations of security policies may result in disciplinary action up to and including termination") plus basic log protection (which your cloud provider handles if you set permissions correctly) covers this. The "thoroughly investigated" language is fine as aspirational; you do not need a formal investigation framework at this stage.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Prohibition on External Email Forwarding and Communication Controls

> "Automatic email forwarding to external addresses is prohibited. Personal email accounts should not be used for PolicyLift business."

> "Recipients must be verified before sending communications."

**What this requires:** Technically disable automatic email forwarding to external addresses in your email system (e.g., Google Workspace admin setting). Communicate that personal email must not be used for company business.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Disabling external auto-forwarding is a one-click admin setting in Google Workspace or Microsoft 365 and prevents a common data exfiltration vector. Auditors may check for this. The "personal email" prohibition is common sense for data protection. The "verify recipients" clause is more behavioral than technical — it is fine to include but does not require tooling. Easy win, keep it.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: Data Retention and Deletion Practices

> "Users must adhere to all backup and retention requirements. Data should be deleted when it is no longer needed for business purposes."

**What this requires:** Define data retention periods and ensure data is deleted when no longer needed. This implies a retention schedule (even a simple one) and periodic cleanup of unnecessary data.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** SOC 2 auditors expect a data retention policy, but for a startup, this can be a simple one-page document stating retention periods by data type (e.g., "customer data: retained for duration of contract plus 1 year; logs: 12 months; employee records: per legal requirements"). You do not need automated deletion workflows on day one. Just document the intent and review annually. The active deletion requirement ("delete when no longer needed") is important for reducing risk but can be handled as a periodic manual review rather than an automated process.

- [ ] **Implementing**
- **Comment:**
