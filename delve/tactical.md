# PolicyLift — Tactical Action Plan

**Generated:** 2026-03-09
**Source:** `commitment_summary.md` (136 commitments across 17 policies)

---

This document converts our policy commitments into concrete action items grouped by type of work. Each item references the commitments it satisfies.

---

## 1. Roles to Appoint

These are formal role designations our policies require. Each needs a named person and, where noted, a written scope document.

| Role | What's Needed | Satisfies |
|------|---------------|-----------|
| **CISO (or equivalent)** | Name a person. Write a brief role description covering: security strategy ownership, risk oversight, policy maintenance, training oversight, vendor security oversight, budget authority, reporting line to CEO/Board. This person does not need to be a dedicated hire — a founder or CTO wearing the hat is fine. | CISO #1–9, Risk Assessment #3 |
| **CTO as Policy Modification Authority** | Formally document that the CTO is the designated authority for approving policy changes and maintaining change records. | Info Security #2 |
| **BC/DR Roles** | Assign named individuals to BC/DR responsibilities (incident commander, communications lead, technical recovery lead). Document in the BCP/DRP. | BC/DR #7 |
| **Information Asset Owners** | For each category in the asset inventory (see Section 5), assign an owner responsible for classification and access decisions. | Data Classification #3 |

**Deliverable:** A single "Role Assignments" page (Notion or similar) listing each role, the person filling it, date assigned, and a link to the role description.

---

## 2. Committees to Establish & Meetings to Schedule

### 2.1 Board of Directors — Annual Meeting

| Detail | Value |
|--------|-------|
| **Frequency** | 1× per year |
| **Attendees** | Board members (fill in roster — see action below) |
| **Agenda** | 1. Risk assessment results (RGEC report) 2. Security program status (CISO report) 3. BCP/DRP review 4. Budget approval 5. Fraud risk and compensation review 6. Internal auditor evaluation (if any) 7. Charter reviews (Board, RGEC, ITLC) 8. Internal controls overview |
| **Artifacts** | Written minutes, stored and accessible for audit |
| **Satisfies** | Board of Directors #1, #2, #5, #6, #7, #8, #9 |

**Action:** Fill in the board membership roster (Chairman + Members). Schedule the first annual meeting. Create a recurring calendar event and a minutes template.

### 2.2 Risk and Governance Executive Committee (RGEC) — Biannual

| Detail | Value |
|--------|-------|
| **Frequency** | 2× per year (minimum) |
| **Attendees** | CEO + CTO (+ others as needed) |
| **Agenda** | 1. Risk assessment and mitigation review 2. Internal controls and compliance framework alignment 3. Remediation status on open findings 4. Policy/procedure changes since last meeting 5. Resource and budget needs |
| **Artifacts** | Written minutes with action items tracked to completion |
| **Satisfies** | RGEC #1–5, #10; Board of Directors #6 |

**Action:** Schedule two RGEC meetings per year. Create a minutes/action-item template. Results feed into the annual Board meeting.

### 2.3 IT Leadership Committee (ITLC) — Quarterly

| Detail | Value |
|--------|-------|
| **Frequency** | 4× per year |
| **Attendees** | CTO + engineering/security leads |
| **Agenda** | 1. Technology strategy and investment review 2. Security posture and incident review 3. Policy approvals or changes 4. Vulnerability/patch status |
| **Artifacts** | Written minutes |
| **Satisfies** | ITLC #1–6 |

**Action:** Schedule quarterly ITLC meetings. Create a minutes template. The ITLC serves as the policy approval body.

### 2.4 Recurring Review Calendar (Non-Meeting)

These are annual review tasks that can be batched into a single "Annual Policy Review Week" or folded into the Board/RGEC meetings:

| Review Item | Cadence | Satisfies |
|-------------|---------|-----------|
| All security policies and charters | Annual | Info Security #1, Access Control #9, Board #8, RGEC #10, ITLC #6, CISO #9 |
| Firewall rules | Annual | Network Security #1, Baseline Hardening #1 |
| Network diagram | Annual | Network Security #6 |
| Insurance coverage (including cyber) | Annual | Risk Assessment #8 |
| Vendor risk re-assessment | Annual | Vendor Mgmt #3 |
| Incident response plan test/tabletop | Annual | Incident Response #8, Info Security #11 |
| BC/DR plan test | Annual | BC/DR #6 |
| Backup restoration test | Annual | BC/DR #5, Baseline Hardening #9 |
| Risk assessment (full) | Annual | Risk Assessment #1, Baseline Hardening #6, Info Security #12 |
| Access reviews (privileged + general) | Annual | Baseline Hardening #3 |
| Access reviews (critical systems) | Quarterly | Access Control #8 |
| Vendor assessments (critical, no SOC 2) | Quarterly | Vendor Mgmt #5 |
| Security awareness training | Annual (+ at hire) | Personnel Security #4, AUP #2, Info Security #5 |
| Code of conduct / policy reaffirmation | Annual | Personnel Security #3 |

**Action:** Create a shared "Compliance Calendar" with all of the above as recurring events. Assign an owner for each.

---

## 3. Documents to Write

These are net-new documents (or lightweight templates) that don't exist yet and are required by our commitments.

### 3.1 Plans & Procedures

| Document | Description | Satisfies |
|----------|-------------|-----------|
| **Business Impact Analysis (BIA)** | Identify critical business functions, RPO/RTO targets, dependencies. Can be a 1–2 page table. | BC/DR #1 |
| **Business Continuity Plan (BCP)** | How the business continues operating during a disruption. Include roles, contact list, communication plan. | BC/DR #2, #7, #9 |
| **Disaster Recovery Plan (DRP)** | Technical recovery procedures — failover steps, backup restoration, infrastructure rebuild. | BC/DR #3 |
| **Incident Response Playbook** | Escalation chain, severity levels, 48-hour investigation process, containment steps, communication templates, post-mortem template. Include external contacts (FBI Cyber Division, insurance carrier). | Incident Response #1–8, #10, #11 |
| **Emergency Change Procedure** | Short doc: "Get verbal CTO approval via Slack → push fix → create retrospective PR within 24 hours." | Change Mgmt #7 |
| **Change Communication Procedure** | Half-page: how to notify employees and customers of outages, releases, and security events. Point to status page. | Change Mgmt #5 |
| **Data Retention Schedule** | Simple table: data type → retention period → deletion method. | AUP #10 |

### 3.2 Policies & Governance Docs

| Document | Description | Satisfies |
|----------|-------------|-----------|
| **Data Classification Policy** | Define the four tiers, handling rules per tier, labeling requirements. | Data Classification #1, #4, #5, #8 |
| **Information Asset Inventory** | Spreadsheet/Notion DB: asset name, type, owner, classification level, storage location. | Data Classification #2, #3, Risk Assessment #10 |
| **Risk Register** | Spreadsheet/Notion DB: risk ID, description, owner, likelihood, impact, treatment plan, residual risk, status. | Risk Assessment #2, #6, #7, #11 |
| **Approved Tools List** | One-page list of approved software, cloud services, and the password manager. | AUP #4 |
| **Vendor Inventory** | Spreadsheet: vendor name, service, data access level, SOC 2 status, last assessment date, contract expiry. | Vendor Mgmt #1 |
| **Board Membership Roster** | Names and roles (Chairman, Members). | Board of Directors #3 |
| **Role Descriptions (Security-Relevant)** | Brief paragraph per role for CISO, CTO, engineering leads, anyone with production access. | Personnel Security #6 |
| **Org Chart** | Use HR tool auto-generation or a simple Notion page. | Personnel Security #9 |

### 3.3 HR & Onboarding Templates

| Document | Description | Satisfies |
|----------|-------------|-----------|
| **Pre-Hire Checklist** | Simple form: background check ordered, references checked, qualifications reviewed. | Personnel Security #1, Info Security #3 |
| **Confidentiality / IP Agreement** | Legal document signed at hire by employees and contractors. Likely already exists — confirm with counsel. | Personnel Security #2, Info Security #4 |
| **Onboarding Checklist** | Steps: sign agreements, complete training, provision accounts (MFA enforced), issue/register device, acknowledge policies. | Access Control #3, Personnel Security #1–4 |
| **Offboarding Checklist** | Steps: revoke all access (within 1 business day), recover devices, confidentiality reminder, document completion. | Access Control #4, Personnel Security #10 |
| **Employee Handbook Updates** | Ensure handbook includes: sanctions policy, progressive discipline, anti-harassment procedure, AUP acknowledgment, incident reporting instructions. | Personnel Security #5, PolicyLift Handbook #1–5, #8 |
| **Annual Policy Acknowledgment Form** | DocuSign or compliance tool: employee confirms they've read and understood security policies + code of conduct. | Personnel Security #3, Info Security #1 |
| **Vendor Onboarding Checklist** | Risk assessment completed, SOC 2 reviewed (if applicable), contract includes security/confidentiality provisions, NDA signed, executive approval obtained. | Vendor Mgmt #2, #4, #6, #7, Data Classification #6 |
| **Vendor Termination Checklist** | Revoke access, confirm data return/deletion, document completion. | Vendor Mgmt #8 |

---

## 4. Systems to Configure or Stand Up

These are technical changes to existing infrastructure and tools.

### 4.1 Source Code Management (GitHub)

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Enable branch protection on production branch** | Require PR reviews before merging, require at least 1 approval, no direct pushes | Change Mgmt #2 |
| **Enforce org-wide 2FA** | GitHub org setting → Require two-factor authentication | Change Mgmt #2, AUP #1 |

### 4.2 Identity & Access

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Enforce MFA on all systems** | Audit every SaaS tool, cloud console, and internal app. Enable MFA everywhere it's available. Maintain a checklist. | Access Control #1, AUP #1, Baseline Hardening #8 |
| **Designate and deploy a password manager** | Pick one (1Password, Bitwarden, etc.), roll out to all employees, store all shared credentials there only. | Access Control #6, AUP #1 |
| **Eliminate shared accounts** | Audit for any shared logins. Convert to individual accounts or, if unavoidable, store credentials only in the approved password manager. | Access Control #5 |
| **Set up access request workflow** | Lightweight: Slack workflow, Jira template, or Google Form → manager approval → provision. Keep records. | Access Control #2, #7 |

### 4.3 Cloud Infrastructure (AWS/GCP)

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Enable cloud audit logging** | AWS: ensure CloudTrail is on for all regions. GCP: ensure Audit Logs are enabled. | AUP #5, Baseline Hardening #4, Info Security #10 |
| **Set log retention to 12 months** | Configure CloudTrail/Audit Logs to retain for 365 days (S3 lifecycle or log sink). | Info Security #10 |
| **Enable centralized log aggregation** | Ship cloud logs + application logs to a central location (CloudWatch, Datadog, or similar). Set up basic alerts. | Network Security #3, Baseline Hardening #4 |
| **Enable IDS/threat detection** | AWS: GuardDuty. GCP: Security Command Center. Turn it on — minimal configuration needed. | Network Security #4 |
| **Verify encryption at rest** | Confirm default encryption is enabled on all storage (S3, RDS, EBS, etc.). Document that you use cloud-managed keys (KMS). | Baseline Hardening #7, AUP #6 |
| **Verify encryption in transit** | Confirm TLS is enforced on all endpoints, load balancers, and API gateways. | Baseline Hardening #7, AUP #6 |
| **Verify NTP sync** | Cloud instances use NTP by default — document this fact. | Network Security #10 |
| **Confirm multi-zone deployment** | Document that production runs across multiple availability zones. | Baseline Hardening #9, BC/DR #4 |
| **Confirm automated backups** | Verify RDS automated backups, S3 versioning, etc. are enabled with cross-zone replication. | BC/DR #4 |
| **Review and document firewall rules** | Export and review security groups / firewall rules. Remove unnecessary inbound rules. Document baseline. | Network Security #1, Baseline Hardening #1 |
| **Document network segmentation** | Map out VPCs, subnets, and how production is isolated from dev/staging. | Network Security #5 |
| **Create/update network diagram** | Visual diagram of VPCs, subnets, load balancers, databases, external connections. | Network Security #6 |
| **Ensure separate environments** | Confirm dev/staging/production are isolated (separate accounts, VPCs, or namespaces). | Change Mgmt #4 |
| **Document IaC as baseline configuration** | If using Terraform/Pulumi/CloudFormation, document that the IaC repo is the baseline config record. | Change Mgmt #3, Baseline Hardening #10 |
| **Document IaC as network device config backup** | Same IaC repo serves as configuration backup for all infrastructure. | Network Security #11 |

### 4.4 Endpoint Security

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Define baseline device security requirements** | Document minimum standards: disk encryption on, screen lock enabled, OS up to date, firewall on. | AUP #3, Network Security #8 |
| **Deploy endpoint protection** | If not already in place, deploy lightweight endpoint protection (e.g., CrowdStrike Falcon Go, SentinelOne) on company laptops and production servers. | Baseline Hardening #5, Info Security #6 |
| **Enable automatic OS/software updates** | Use MDM (Kandji, Jamf) or native OS settings to push updates. This covers endpoint patching. | AUP #4, Network Security #12 |

### 4.5 Email & Communications

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Disable external auto-forwarding** | Google Workspace Admin → Compliance → disable automatic forwarding to external addresses. | AUP #9 |
| **Communicate personal email prohibition** | Include in AUP acknowledgment: company business must use company email only. | AUP #9 |

### 4.6 VPN

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Ensure VPN is deployed for remote access** | If accessing internal resources (not just SaaS), deploy a VPN (Tailscale, WireGuard, etc.). If fully SaaS/cloud-native with no internal network, document that VPN is not applicable. | Network Security #2 |

### 4.7 Vulnerability Scanning & Patching

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Enable Dependabot / Renovate** | Automated dependency updates for application code. | Change Mgmt #8, Baseline Hardening #2 |
| **Set up vulnerability scanning** | Choose a scanner (Qualys, Nessus, AWS Inspector, etc.) for infrastructure. Run at least annually. | Risk Assessment #4, Network Security #9, Info Security #8 |
| **Define patching SLAs** | Document: Critical = 7 days, High = 30 days, Medium = 90 days, Low = next cycle. | Change Mgmt #8, Baseline Hardening #2, Incident Response #5 |
| **Schedule annual penetration test** | Engage an external firm. Budget for this now. | Network Security #9, Info Security #8 |

### 4.8 Security Awareness Training

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Select and deploy a training platform** | KnowBe4, Curricula, or whatever your compliance tool (Vanta/Drata) bundles. | Personnel Security #4, AUP #2, Info Security #5 |
| **Configure onboarding training trigger** | New hire → automatic enrollment in security awareness training. | Personnel Security #4 |
| **Configure annual training reminder** | Annual recurrence for all employees. Track completion. | Personnel Security #4, AUP #2 |

### 4.9 Incident Reporting Channel

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Create a dedicated incident reporting channel** | Slack channel (#security-incidents) or email alias (security@policylift.com). Document in onboarding materials and training. | Incident Response #1, AUP #7 |

### 4.10 Status Page

| Action | Detail | Satisfies |
|--------|--------|-----------|
| **Set up a public status page** | Statuspage, Instatus, or similar. Use for planned maintenance and outage communication. | Change Mgmt #5 |

---

## 5. Processes to Define

These are lightweight workflows that need to be documented (a paragraph or short checklist each), not built as complex systems.

| Process | What to Document | Satisfies |
|---------|------------------|-----------|
| **Access request and approval** | How to request access, who approves, where it's recorded | Access Control #2, #7 |
| **Quarterly access review** | Pull user lists from critical systems, compare to active employees, revoke orphaned access, document review | Access Control #8 |
| **Onboarding** | Checklist: agreements → training → accounts → device → policy acknowledgment | Access Control #3, Personnel Security #1–4 |
| **Offboarding** | Checklist: revoke access (1 business day) → recover devices → confidentiality reminder | Access Control #4, Personnel Security #10 |
| **Vendor onboarding** | Risk assessment → SOC 2 review → contract → NDA → executive sign-off | Vendor Mgmt #2, #4, #6, #7 |
| **Vendor termination** | Revoke access → data return/deletion → document | Vendor Mgmt #8 |
| **Emergency change** | Verbal CTO approval → push fix → retrospective PR within 24 hours | Change Mgmt #7 |
| **Incident response** | Report → triage (48 hrs) → contain → resolve → post-mortem | Incident Response #1–8 |
| **Policy change** | Draft → CTO review → ITLC approval → communicate to all personnel | Info Security #2, ITLC #5, PolicyLift Handbook #8 |
| **Annual policy review** | Batch all policies → review → update version numbers → re-acknowledge | Info Security #1, Access Control #9, all charter reviews |
| **Risk assessment** | Scope assets → identify threats → score likelihood/impact → document in risk register → treatment plans → executive sign-off | Risk Assessment #1–7, #10, #11 |
| **Data classification** | When new data type is introduced: classify tier → assign owner → apply handling rules | Data Classification #1–5, AUP #6 |
| **Background check** | Pre-hire checklist → order check (Checkr or similar) → document completion before start date | Personnel Security #1, Info Security #3 |
| **Performance evaluation** | Regular check-ins that include discussion of security responsibilities and training needs | Personnel Security #7 |
| **Corrective action (vendors)** | Assessment finding → notify vendor → remediation plan → follow-up → escalate or terminate if unresolved | Vendor Mgmt #9 |

---

## 6. Quick Wins (Do This Week)

Items that take less than an hour each and immediately improve audit readiness:

- [ ] Enforce 2FA on GitHub org
- [ ] Enable branch protection on production branch (require 1 approval)
- [ ] Turn on CloudTrail / GCP Audit Logs (if not already on)
- [ ] Turn on GuardDuty / Security Command Center
- [ ] Disable external email auto-forwarding in Google Workspace
- [ ] Verify disk encryption is on for all team laptops
- [ ] Verify TLS is enforced on all production endpoints
- [ ] Verify default encryption at rest on cloud storage/databases
- [ ] Set up #security-incidents Slack channel
- [ ] Create a shared "Compliance Calendar" with all recurring review dates
- [ ] Designate the CISO role (name + one-paragraph scope)
- [ ] Fill in the Board membership roster
