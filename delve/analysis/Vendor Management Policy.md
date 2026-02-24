# Vendor Management Policy — Commitment Analysis

**Source:** `source/# Vendor Management Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Vendor Management Policy"**

---

## Commitment 1: Maintain a Critical Vendor Inventory

> "Maintain critical third-party vendor inventory"

> "The scope of this policy covers PolicyLift's relationship with business partners, suppliers, or third-party vendors (collectively referred to as 'vendors' or 'third-parties') including any third-party with access to information, IT assets, IT infrastructure, or facilities of PolicyLift and its clients."

**What this requires:** Create and maintain a living list of all third-party vendors, categorized by criticality (e.g., which ones touch customer data, which ones are core to the product). This is the foundation everything else in the policy builds on — you cannot do risk assessments or annual reviews without first knowing who your vendors are.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** This is table-stakes for SOC 2. Auditors will ask to see your vendor list. For a startup, this is likely a spreadsheet with 15-30 rows covering your cloud providers, SaaS tools, and any contractors with system access. Low effort, high value.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Pre-Engagement Risk Assessment for New Vendors

> "Risk assessment activities must be conducted before the initiation of third parties work and be repeated on an annual basis to identify any gaps between the third-party security controls and PolicyLift Information Security standards/regulatory requirements."

> "Prior to outsourcing any PolicyLift's processes or services to a third party/vendor or allowing third party access to the organization's information or systems, the risks involved must be clearly identified and documented."

> "Before third-party access is granted to the PolicyLift network and systems, conduct a risk assessment of network connectivity."

> "In selecting a service provider, or substantially amending or renewing a contract or outsourcing agreement, PolicyLift is expected to undertake a due diligence process that fully assesses the risks associated with the outsourcing arrangement and addresses all relevant aspects of the service provider, including qualitative and quantitative factors."

**What this requires:** Before onboarding any new vendor that touches PolicyLift data or systems, perform a documented risk assessment. The policy envisions this covering information security controls, business continuity impact, data exposure, regulatory compliance, and due diligence on subcontractors. It also calls for a separate "network connectivity" risk assessment for vendors with network access. Additionally, the due diligence section calls for a qualitative and quantitative assessment of the outsourcing arrangement itself.

This is really three related sub-commitments:
1. A lightweight risk assessment questionnaire/checklist before onboarding any new vendor
2. A deeper due diligence evaluation for vendors where you are outsourcing material business processes
3. A network connectivity risk assessment for vendors with direct network access

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify |

**Why:** Auditors will want to see that you evaluate vendors before giving them access to your environment. However, the policy as written is enterprise-grade: separate due diligence processes, network connectivity assessments, and multi-factor risk categorization (six categories listed) are overkill for a 10-person startup. **Simplify to a single lightweight vendor assessment form** — a one-page checklist covering security posture, data handling, and SOC 2/ISO 27001 status — applied to any vendor that accesses customer data. Skip the formal "network connectivity" risk assessment; for a cloud-native startup, network-level vendor access is rare. The separate "due diligence" section for outsourcing can be collapsed into the same form.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Annual Vendor Risk Re-Assessment

> "Risk assessment activities must be conducted before the initiation of third parties work and be repeated on an annual basis..."

> "Periodically evaluate the performance of critical third-party vendors"

**What this requires:** Once a year, re-evaluate each critical vendor for continued risk appropriateness. This means pulling up the vendor inventory, checking if anything has changed about their security posture, and documenting the review.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Annual vendor reviews are a core SOC 2 control. Auditors will sample your vendor list and ask for evidence that you reviewed them within the audit period. For a startup, this can be a lightweight annual sweep: check if their SOC 2 report is current, confirm data access hasn't expanded, and note any incidents. The key is having dated documentation that the review happened.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: SOC 2 Report Review for Service Providers

> "At the time of onboarding and on an annual basis, management performs reviews of SOC 2 reports from service providers/vendors to review the appropriateness of scope, impact of identified exceptions, and applicable complementary user entity controls."

**What this requires:** For vendors that have SOC 2 reports, obtain and review those reports both at onboarding and annually. Specifically, the review must cover: (1) whether the report's scope covers the services you use, (2) any exceptions or findings noted in the report, and (3) complementary user entity controls (CUECs) — things you need to do on your end to make their controls work.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** This is one of the most commonly tested SOC 2 controls. Auditors love asking for evidence that you reviewed your key vendors' SOC 2 reports. Practically, this means downloading the SOC 2 Type II report from AWS, your hosting provider, and any other critical SaaS vendors once a year, reading the opinion letter and exceptions, and noting any CUECs you need to follow. Document the review with a date and reviewer name. This is real work but non-negotiable.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Quarterly Risk Assessment for Critical Vendors Without SOC 2 Reports

> "For critical vendors that do not have a SOC 2 report but that have access to PolicyLift data or that impact the security of PolicyLift system, a quarterly vendor risk assessment is performed. During this assessment performance, service delivery and compliance with security commitments is also assessed."

**What this requires:** If a critical vendor does not have a SOC 2 report (and many smaller tools and contractors will not), perform a vendor risk assessment every quarter — not annually, but quarterly. Assess their performance, service delivery, and compliance with security commitments.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Nice-to-Have | Simplify |

**Why:** Quarterly assessments for non-SOC-2 vendors is a significant burden, especially for a startup. Most SOC 2 audits accept an annual review cadence for all vendors. The quarterly requirement here seems designed for large enterprises with hundreds of vendors and dedicated vendor management teams. **Simplify to annual reviews for all vendors**, with an option to flag high-risk non-SOC-2 vendors for more frequent review if warranted. If you have a critical vendor with no SOC 2 report (e.g., a small contractor), consider requiring them to complete a security questionnaire annually instead.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Executive Management Review of Vendor Risks Before Engagement

> "Review of identified risks along with mitigation strategies or whether the risks are acceptable should be performed by executive management prior to engaging with vendors."

**What this requires:** Before signing up a new vendor, an executive (not just the person who found the tool) must review and formally accept the identified risks. This implies a sign-off step in the vendor onboarding process.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Having management sign off on vendor risks is a standard SOC 2 expectation and demonstrates a "tone at the top." For a 10-person startup where the founders are already making these decisions, this is essentially already happening informally. Just formalize it: add a sign-off field to whatever vendor assessment form you use. One signature from a founder or CTO is enough.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Vendor Contracts with Security and Confidentiality Provisions

> "At the time of onboarding of a vendor, the vendor must sign the vendor contract provided by PolicyLift or, if the vendor is an online service provider, then PolicyLift must accept the pre-defined terms of service of the vendor."

> "Contracts that include exchange of confidential data must require confidentiality agreements to be executed by the vendor and shall identify applicable security policies and procedures to which the vendor is subjected."

> "Contracts must clearly identify security reporting requirements that stipulate that the vendor is responsible for maintaining the security of confidential data, regardless of ownership."

> "In the event of a breach of PolicyLift's confidential data, the vendor is responsible for immediately notifying PolicyLift regarding incident details, recovery, and remediation."

> "The vendors' responsibilities, which includes security commitments and responsibilities, are documented and agreed with the vendors during the onboarding process."

**What this requires:** Multiple contract-related sub-commitments:
1. Every vendor must have a signed contract or accepted ToS on file.
2. Vendors handling confidential data must sign a confidentiality/NDA agreement.
3. Contracts must include security obligations and breach notification requirements.
4. Vendor security responsibilities must be documented during onboarding.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify |

**Why:** Having contracts and confidentiality agreements with vendors is a real SOC 2 requirement. However, this policy implies custom contract negotiation with every vendor, which is unrealistic for SaaS tools where you simply accept their terms. **Simplify the approach**: for major SaaS vendors (AWS, etc.), accepting their ToS and DPA (Data Processing Agreement) is sufficient — just keep a record that you reviewed and accepted them. For contractors and smaller vendors with direct data access, use a standard NDA/confidentiality agreement template. You do not need to negotiate custom security clauses with every vendor, but you should have a simple contract or NDA on file for any vendor touching customer data.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Vendor Termination Process with Access Revocation and Data Return

> "Vendor and service provider access is removed upon termination through a termination checklist and access is revoked as part of the termination process."

> "Upon termination of vendor services, contracts must require the return or destruction of all organization data unless otherwise agreed upon."

> "Procurement and contract managers as designated by PolicyLift's management shall immediately ensure termination of vendor's access to PolicyLift systems and, if applicable, the facilities housing these systems."

> "Exit reviews on vendors to ensure compliance with termination clauses shall be performed."

**What this requires:** When you stop using a vendor:
1. Follow a termination checklist to revoke all access (system access, API keys, credentials, physical access if any).
2. Require the vendor to return or destroy any PolicyLift data they hold.
3. Designate someone ("procurement and contract managers") to own the termination process.
4. Perform an exit review to ensure termination clauses were followed.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors will want to see that you have a process for revoking vendor access when relationships end. The full process described here — termination checklists, designated procurement managers, formal exit reviews, data return/destruction certification — is enterprise-heavy. **Simplify to a basic offboarding checklist**: when you stop using a vendor, revoke API keys, remove shared credentials, disable integrations, and note it on the vendor inventory. For vendors that held customer data, send a brief email requesting data deletion confirmation. You do not need a "procurement and contract manager" role or formal exit reviews at your stage.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Corrective Action Process Based on Vendor Assessments

> "Corrective actions are taken as required based on the results of the assessments."

**What this requires:** When a vendor assessment (annual review or SOC 2 report review) surfaces an issue, there must be a defined process for taking corrective action — documenting the finding, deciding what to do about it, tracking it to resolution.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** This is a brief statement but it matters. Auditors want to see that reviews are not just checkbox exercises — if you find a problem during a vendor review, you actually do something about it. For a startup, this does not need a formal corrective action tracking system. Just document what you found and what you did about it (even if the answer is "accepted the risk because X"). A note in the vendor inventory spreadsheet is sufficient.

- [ ] **Implementing**
- **Comment:**

---
