# Data Classification Policy — Commitment Analysis

**Source:** `source/# Data Classification Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Data Classification Policy"**

---

## Commitment 1: Establish and Maintain a Four-Tier Data Classification Scheme

> Information in a "final" or published state that is either in the custody of or produced and owned by PolicyLift must be classified into one of the following four categories: **Public**, **Internal**, **Confidential**, **Restricted**.

> Any information which is not explicitly classified is classified as Confidential by default to avoid data leakage.

**What this requires:** PolicyLift must formally adopt and document a four-level classification system (Public, Internal, Confidential, Restricted). Every piece of information the company handles should be classifiable into one of these tiers. Unclassified information defaults to Confidential. The team needs to agree on the definitions, populate the example lists with PolicyLift-specific data types, and communicate the scheme to all staff and contractors.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** SOC 2 auditors expect you to have a documented data classification scheme. The four-tier model here is standard and well-understood. The actual effort is low — you just need to finalize the example lists so they reflect PolicyLift's real data types (not the generic template examples like "Java and .NET Source Code"). The default-to-Confidential rule is a smart safety net.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Create and Maintain an Information Asset Inventory

> PolicyLift shall classify, record and maintain an inventory of information assets. The asset inventory shall include a list of all information assets owned and operated by PolicyLift including, but not limited to, information in an electronic and non-electronic form.

> PolicyLift shall maintain an inventory of all information assets including details on asset ownership, classification and location. The asset inventory listing shall be reviewed and updated by management on an annual or as-needed basis.

**What this requires:** Build and maintain a registry of all information assets — databases, repos, SaaS tools, file stores, documents, etc. — that records what each asset is, who owns it, what classification level it holds, and where it lives. This inventory must be reviewed by management at least annually.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (but keep it simple) |

**Why:** An asset inventory is a core SOC 2 expectation. Auditors will ask to see it. For a 10-person startup, this does not need to be an enterprise CMDB — a well-maintained spreadsheet or Notion table listing your key data stores (production DB, S3 buckets, Google Drive, Slack, etc.) with owner and classification is sufficient. The annual review cadence is reasonable. The real work is the initial build; maintenance is lightweight once it exists.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Assign Designated Owners to All Information Assets

> All information assets (electronic and non-electronic) shall have designated owners.

> All information and related IT assets of PolicyLift shall be clearly identified and have an owner.

> Access to the information assets shall be the responsibility of a designated owner.

**What this requires:** Every information asset in the inventory must have a named owner who is responsible for its access controls and classification. This means someone specific is accountable for each system, data store, or document repository.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Ownership assignment is expected by auditors and is practically useful — it answers "who do I ask about access to X?" At a startup, this is trivial: most assets are owned by one of a handful of people. Just add an "Owner" column to your asset inventory. No new process needed beyond keeping it current.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Implement Protective Marking / Labeling System

> To ensure that the correct controls are applied to the information assets of the organization, a system of protective marking is used i.e., for printed reports, use of watermarks, warning signs for screen displays, classification level for emails, etc.

**What this requires:** Implement a visible labeling system where documents, emails, screen displays, and printed materials are marked with their classification level (e.g., "CONFIDENTIAL" watermarks, email footers, document headers).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Remove or heavily simplify |

**Why:** Formal protective marking (watermarks, email classification tags, screen warnings) is an enterprise practice. SOC 2 auditors for startups do not typically expect watermarked PDFs or classified email headers. What they do expect is that you know which data is sensitive and handle it appropriately. If you want a lightweight version, a simple convention like marking Google Docs or Notion pages with a classification label in the title or header is more than enough. Skip watermarks, print markings, and email classification systems entirely.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Enforce Classification-Based Access Controls

> All information classified as Internal or Confidential must have security controls applied which are sufficient to ensure that the information is accessible only to those users who are authorized for access.

> Information and its related IT assets are processed and stored strictly in accordance with the classification levels assigned to those assets. All information assets must be secured to meet the requirements of their respective classification levels.

> For each security classification level, a set of handling controls must be in place to ensure that the information asset involved is appropriately protected at all times.

**What this requires:** Define and implement specific security controls for each classification tier. For example: Public data has no restrictions, Internal requires authentication, Confidential requires need-to-know access with role-based controls, and Restricted requires named-individual access only. Each classification level needs a documented set of handling rules (who can access, how it can be shared, how it's stored and transmitted).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (but define controls pragmatically) |

**Why:** This is the operational heart of data classification — without it, the classification scheme is just labels. Auditors will check that sensitive data actually has access restrictions matching its classification. For a startup, this means: production databases should have limited access, PII should be encrypted, admin credentials should be tightly held, and public repos should not contain secrets. You do not need a 20-page handling matrix. A one-page table mapping each classification level to a few concrete rules (who can access, encryption requirements, sharing rules) is sufficient.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Require Third-Party Contractual Compliance and NDAs

> Where a third party will be responsible for handling the information on behalf of the PolicyLift, the third party shall be required by contract to adhere to this policy prior to the sharing of information.

> The asset owner shall use their discretion with responsibility in getting NDAs signed from such outsiders. Even after such disclosure, the classification still remains "Confidential" or "Restricted" and does not become "Public."

**What this requires:** Any third party handling PolicyLift data must contractually agree to follow this classification policy. When Confidential or Restricted information is shared with external parties (auditors, consultants, regulators), NDAs must be obtained. This means having standard NDA templates ready and a process to ensure they are signed before sharing sensitive information.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors will check that you have a vendor management process that includes data protection requirements. Having standard NDA and data protection clauses in vendor contracts is good practice and expected. However, requiring every third party to "adhere to this policy" verbatim is overkill — most vendors have their own SOC 2 or equivalent. Simplify this to: (a) include data protection clauses in vendor contracts, and (b) get NDAs when sharing Confidential/Restricted data with non-vendor third parties like consultants. This aligns with your Vendor Management Policy and avoids redundant obligations.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Control External Disclosure Through Corporate Communications

> Any information, which needs to be disclosed or published outside PolicyLift (to the media, press, etc.) shall be done explicitly by or through corporate communications and based on authorization.

**What this requires:** All external disclosures to media or press must go through a designated corporate communications function with proper authorization. No one should independently publish or disclose company information externally without approval.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** SOC 2 does not audit your PR process. This is a general corporate governance practice, not a security control. For a 10-person startup, you do not need a formal "corporate communications" function. A simpler commitment — "external disclosures of non-Public information require founder/CEO approval" — captures the same intent without creating process overhead. Keep the spirit, drop the formality.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Ensure All Personnel Understand and Implement the Policy

> All PolicyLift employees, directors, shareholders, consultants, and contractors who handle information stored at or controlled by PolicyLift are responsible for understanding and implementing this policy.

**What this requires:** Everyone who touches PolicyLift data — employees, contractors, consultants — must be made aware of this policy and understand how to apply it. This implies some form of training, onboarding communication, or acknowledgment process.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep (fold into security awareness training) |

**Why:** SOC 2 auditors expect evidence that employees have been trained on security policies, including data handling. This does not require a standalone training program — fold it into your general security awareness onboarding. Have new hires read the data classification policy and acknowledge it. A short Loom video or one-page summary covering "here's how we classify data and what that means for you" is more than enough for a startup.

- [ ] **Implementing**
- **Comment:**
