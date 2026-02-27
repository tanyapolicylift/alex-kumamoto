# Baseline Hardening Policy — Commitment Analysis

**Source:** `source/# Baseline Hardening Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Baseline Hardening Policy"**

---

## Commitment 1: Network Hardening (Firewall Rules and Inbound Restrictions)

> "The organization must harden the network by applying different inbound rules to restrict IP addresses to meet the organization's security objectives."

> "The organization should have a secure web application for the use of the clients to securely process transactions."

**What this requires:** Configure and maintain firewall rules that restrict inbound traffic by IP address. Audit these rules periodically. Ensure the client-facing web application is deployed behind appropriate network controls.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** If you're running on AWS/GCP, you already have security groups and VPC firewalls — this is mostly about making sure they're configured correctly and not left wide open. Auditors will check that you have network-level access controls. This is table stakes for SOC 2 and cloud security in general; very little incremental effort if you're already using cloud infrastructure properly.

- [x] **Implementing**
- **Comment:**

---

## Commitment 2: Patching and Vulnerability Management

> "Local machines must have the updated operating system and should be configured to receive an automatic update."

> "Vulnerability scanning tool must be implemented to perform vulnerability assessment on the web applications."

> "CTO/management must review the vulnerabilities and take necessary actions depending upon the criticality of the vulnerability."

**What this requires:** Three things: (1) Enable automatic OS updates on all team laptops/workstations. (2) Deploy a vulnerability scanning tool (e.g., Dependabot, Snyk, AWS Inspector, or similar) to scan web applications. (3) Establish a lightweight process where the CTO or tech lead reviews scan results and prioritizes remediation.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Auditors will want to see evidence of vulnerability management — both that you scan and that you act on findings. Enabling auto-updates on laptops is trivial. Running a vulnerability scanner is straightforward (GitHub Dependabot is free). The "management review" piece is the real commitment: you need a lightweight but documented process for triaging vulnerabilities. This doesn't need to be heavy — a monthly Slack thread or ticket review is fine — but it needs to exist and have evidence.

- [x] **Implementing**
- **Comment:**

---

## Commitment 3: Access Reviews (Annual Review of Privileged and General Access)

> "The management should perform annual review of access, including privileged access to the production environment to identify unauthorized or terminated users. Any discrepancies must be tracked to resolution."

> "Privileged access to the production environment must be limited to authorized engineers."

**What this requires:** At least once per year, review who has access to production systems, cloud consoles, databases, and other sensitive resources. Confirm that every person with access still needs it and that no terminated employees retain access. Document the review and track any remediation (e.g., revoking stale accounts). Day-to-day, enforce least-privilege so only engineers who need production access have it.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Access reviews are one of the most commonly tested SOC 2 controls. At a 10-person company this is genuinely easy — you can review all access in under an hour. The annual cadence is the minimum auditors expect. Least-privilege for production access is also non-negotiable; auditors will ask who has access and why. This is low-effort, high-value.

- [x] **Implementing**
- **Comment:**

---

## Commitment 4: Logging, Monitoring, and Alerting

> "Logging should be enabled to monitor activities such as administrative activities, logon attempts, provisioning and deprovisioning at the application and infrastructure level."

> "The IT team should continuously monitor system capacity and performance using monitoring tools. Additionally, the monitoring tool should generate alerts when specific predefined thresholds are met."

> "A log management tool should be utilized to identify events that may have a potential impact on the company's ability to achieve its security objectives."

**What this requires:** Three layers: (1) Enable audit/security logging across cloud infrastructure and applications — covering admin actions, login attempts, and user provisioning. (2) Set up a monitoring tool (e.g., CloudWatch, Datadog, or similar) with alerting on predefined thresholds for capacity and performance. (3) Aggregate logs in a centralized log management tool where you can search for security-relevant events.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Auditors will ask to see that you have logging enabled and that you actually look at the logs. Cloud providers give you CloudTrail/Cloud Audit Logs out of the box — the main effort is making sure they're turned on and retained. A monitoring/alerting tool like CloudWatch or Datadog is standard for any production system. The "log management tool" language sounds enterprise-heavy but can be satisfied by CloudWatch Logs, Datadog, or even a simple ELK setup. The key is: logs exist, they're centralized enough to search, and someone gets alerted when things go wrong.

- [x] **Implementing**
- **Comment:**

---

## Commitment 5: Anti-Virus / Endpoint Protection on Production Servers

> "Anti-virus and malware protection software must be installed and configured on production servers."

**What this requires:** Install and maintain anti-virus or endpoint protection software on all production servers.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low–Medium | Important | Simplify |

**Why:** This commitment is written with traditional on-premise servers in mind. If your production workloads run on managed cloud services (Lambda, Fargate, managed Kubernetes, etc.), there are no "servers" to install AV on — and auditors understand this. If you do run EC2 instances or VMs, a lightweight agent (e.g., CrowdStrike, SentinelOne, or even ClamAV) satisfies this. For a startup on modern cloud-native infrastructure, consider simplifying this to "endpoint protection is deployed where applicable based on architecture" rather than a blanket AV requirement. Auditors care more about endpoint protection on employee laptops than on ephemeral containers.

- [x] **Implementing**
- **Comment:**
Please perform the recommended update to language
---

## Commitment 6: Annual Risk Assessment

> "An annual risk assessment must be conducted to identify risks arising from external and internal sources."

**What this requires:** Conduct a formal risk assessment at least annually. Identify external threats (cyberattacks, vendor failures, regulatory changes) and internal risks (insider threats, process gaps). Document the findings and any treatment plans.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** An annual risk assessment is a foundational SOC 2 requirement across all Trust Services Criteria. Auditors will ask for this document — it's essentially non-negotiable. The good news: at a 10-person startup, this doesn't need to be a 50-page enterprise exercise. A structured spreadsheet listing 15-25 risks with likelihood, impact, and mitigation notes is perfectly adequate. Budget half a day once a year. Note: this commitment also appears in the Risk Assessment and Treatment Policy, so the work is shared — but the Baseline Hardening Policy explicitly references it too.

- [x] **Implementing**
- **Comment:**

---

## Commitment 7: Encryption (In Transit and At Rest)

> "HTTPS must be utilized over public networks for encrypting authentication flows."

> "All sensitive customer data should be encrypted at rest."

> "The organization shall have a secure web application for the use of clients to securely process transactions."

**What this requires:** Enforce HTTPS for all public-facing traffic, especially authentication. Encrypt sensitive customer data at rest (e.g., using AWS KMS, GCP CMEK, or database-level encryption). Ensure the web application handles transactions securely.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** HTTPS everywhere is already standard practice — if you're not doing this, something is very wrong. Encryption at rest is also straightforward on cloud platforms (S3, RDS, GCS all support encryption at rest with a checkbox). Auditors will specifically verify both in-transit and at-rest encryption. This is the easiest "Critical" item on the list: it's likely already done, and if not, it's a one-time configuration.

- [x] **Implementing**
- **Comment:**

---

## Commitment 8: Multi-Factor Authentication (MFA)

> "MFA must be enabled on the systems. MFA should be required before an administrator or engineer can connect to the production environment."

**What this requires:** Enable MFA on all in-scope systems — especially cloud consoles, production infrastructure, and any admin tooling. Require MFA for anyone connecting to the production environment.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** MFA is one of the first things auditors check. Every major cloud provider and SaaS tool supports it. If you use an SSO provider (Okta, Google Workspace with enforced MFA), you can satisfy this across the board with a single configuration. This is absolute baseline — no startup should skip this.

- [x] **Implementing**
- **Comment:**

---

## Commitment 9: Disaster Recovery and Availability (Multi-Zone + Backup Testing)

> "Cloud environments must be distributed across different zones to support service redundancy and availability."

> "Data backup restoration testing must be performed."

**What this requires:** Two things: (1) Deploy cloud infrastructure across multiple availability zones for redundancy. (2) Periodically test that backups can actually be restored (not just that they exist).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Keep (simplify backup testing cadence) |

**Why:** Multi-AZ deployment is standard cloud architecture and most startups already do it (or should). The real commitment here is backup restoration testing — you need to actually prove your backups work, not just assume they do. Auditors will ask for evidence. This doesn't need to be a full DR drill; restoring a database snapshot to a test environment once or twice a year and documenting it is sufficient. Simplify the language to set a clear cadence (e.g., "annually" or "semi-annually") rather than leaving it open-ended.

- [x] **Implementing**
- **Comment:**
Please set to annual as recommended
---

## Commitment 10: Password Policies and Baseline Configuration Management

> "Password for in-scope system infrastructures and applications must be configured to have at least 8 characters and be complex in nature."

> "Production systems and servers should be hardened to ensure an appropriate level of security."

> "Baseline configurations and policies must be reviewed and updated annually or when required due to system changes."

**What this requires:** Three things: (1) Enforce password complexity requirements (minimum 8 characters, complexity) across all in-scope systems. (2) Harden production systems according to security best practices (disable unnecessary services, remove default credentials, etc.). (3) Document baseline configurations for production systems and review/update them annually or when significant changes occur.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Keep (simplify baseline config review) |

**Why:** Password policies are easy to enforce if you use SSO or an identity provider — just set the policy there once. The 8-character minimum with complexity is actually below modern best practices (NIST now recommends longer passphrases over complex short passwords), but it satisfies the SOC 2 checkbox. System hardening is good practice but vague — for a cloud-native startup, this mostly means following cloud provider best practices (CIS benchmarks) and not leaving default settings in place. The annual baseline configuration review is the operational commitment to watch: you need a documented record that someone reviewed and confirmed your production configs are still appropriate. At a small startup, this can be combined with your annual risk assessment or access review cycle to avoid creating yet another standalone review process.

- [x] **Implementing**
- **Comment:**
