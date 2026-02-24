# Information Technology Leadership Committee Charter — Commitment Analysis

**Source:** `source/# Information Technology Leadership Committee Charter.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Information Technology Leadership Committee Charter"**

---

## Commitment 1: Establish a Formal IT Leadership Committee (ITLC)

> An Information Technology Leadership Committee (the "Committee", or, "ITLC") of PolicyLift has been established by resolution of the Board. The purpose of ITLC is to assist the Board of Directors in fulfilling its oversight responsibilities concerning the overall role of technology in executing the business strategy of the Corporation.

> The IT Leadership Committee shall consist of IT and Engineering Executive Management leaders. The members of the IT Leadership Committee may have members who are not part of the board.

**What this requires:** Formally designate a named committee ("ITLC") with defined membership drawn from IT and engineering leadership. This is a governance body that must exist as an identifiable entity, not just ad hoc conversations between cofounders.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 auditors do want to see that someone with authority is overseeing IT and security decisions — but the mechanism matters less than the evidence. At a 10-person startup, the founding team already *is* the IT leadership. You don't need a formally chartered committee with a capital-C name. Instead, designate 2-3 people (e.g., CTO + CEO) as the "technology oversight group" and document that in a single sentence. That satisfies auditors without the theater of a separate governance body.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Quarterly Committee Meetings with Formal Minutes

> The Committee shall meet on a quarterly basis. Minutes and records of all meetings are maintained and distributed to participants.

> Proceedings of all meetings are minuted and signed by one member of the Committee.

> Minutes of all Committee meetings are circulated to Committee members and at the start of each subsequent meeting, the status of action items identified at the end of the previous meeting is discussed.

**What this requires:** Hold a dedicated ITLC meeting every quarter. Each meeting must produce formal minutes that are (a) signed by a committee member, (b) circulated to all members, and (c) include tracking of action items from the previous meeting. This is a recurring operational cadence with documentation requirements.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors will look for evidence that security and technology governance happens on a regular cadence — quarterly is the standard expectation. However, the formality described here (signed minutes, action item tracking between meetings, formal circulation) is enterprise-level overhead. For a startup, a quarterly 30-minute meeting with a simple shared doc summarizing what was discussed and any decisions made is sufficient. You could even fold this into an existing all-hands or leadership sync. The key is having *dated artifacts* that prove the meetings happened and covered security/technology topics. Skip the formal signing requirement — a Google Doc or Notion page with attendees listed is fine.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Technology Strategy and Investment Review

> Review and approve the corporation's technology planning and strategy

> Review significant technology investments and expenditures

> Receive reports from management concerning the Corporation's technology operations including, among other things, software development, project performance, technical operations performance, technology architecture, and significant technology investments.

**What this requires:** The committee must actively review and approve technology strategy, planning, and significant expenditures. It must also receive and review reports on software development, project performance, technical operations, and architecture.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove |

**Why:** This is corporate governance boilerplate, not a SOC 2 requirement. SOC 2 cares about security controls, not whether your board approved your tech strategy. At a 10-person startup, the people making technology decisions *are* the leadership — there is no "management" reporting to a separate "committee" about project performance. This language creates an obligation to produce formal reports nobody needs. Remove it entirely. If you keep Commitment 2 (quarterly meetings), you can briefly touch on tech direction during those meetings without a formal review/approval process.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Security Oversight and Incident Response Review

> Review and evaluate activities and processes that are essential in meeting the organization's security commitments

> Discuss if there are any IT security-related issues and take actions as necessary

> Discuss the lesson learned from ongoing incident response activities and take necessary corrective action as appropriate

**What this requires:** The committee must regularly review security-related activities, discuss active security issues, and conduct post-incident reviews with documented corrective actions. This creates a recurring obligation to assess whether your security controls are working and to review lessons learned from incidents.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplified) |

**Why:** This is the one piece of this charter that genuinely matters for SOC 2. Auditors need evidence that leadership periodically reviews whether security commitments are being met and that incidents are discussed and learned from. You don't need a formal committee to do this — but you *do* need a quarterly touchpoint where someone in a leadership role reviews: (a) are our security controls working, (b) were there any incidents and what did we learn, and (c) any new security issues to address. This can happen in the same quarterly meeting from Commitment 2. Just make sure the meeting notes explicitly cover these security topics.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Policy Approval Authority

> Approve policies related to software development, project performance, technical operations performance, and technology investments or recommend policies to the Board for approval, as appropriate

**What this requires:** The ITLC must serve as a formal approval body for IT-related policies, either approving them directly or escalating them to the Board. This implies a defined policy approval workflow with the committee as a gatekeeper.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 does expect that your security and IT policies are reviewed and approved by someone with authority — auditors will check for an "approved by" line or evidence of review. But this doesn't require a formal committee approval process. At a startup, having your CTO (or whoever owns security) review and sign off on policies is sufficient. You can note "Approved by [Name], [Date]" on each policy document. Drop the language about recommending policies to the Board — that's enterprise governance structure you don't need.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Annual Charter Review by the Board

> The Board of Directors will review this charter annually to ensure it remains consistent with the Committee's objectives and responsibilities.

**What this requires:** The Board of Directors must formally review this charter document once per year and confirm it still reflects the committee's purpose and scope.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove |

**Why:** Annual policy review is a general SOC 2 expectation, but that applies to your core security policies (Information Security Policy, Access Control Policy, etc.) — not to an internal committee charter. No auditor is going to ask whether the Board reviewed the ITLC charter this year. This is pure enterprise governance overhead. If you keep a version of this charter at all, just note that it will be reviewed as part of your normal annual policy review cycle. No need for a separate Board review.

- [ ] **Implementing**
- **Comment:**
