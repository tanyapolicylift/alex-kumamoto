# Board of Directors Charter — Commitment Analysis

**Source:** `source/# Board of Directors Charter.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Board of Directors Charter"**

---

## Commitment 1: Annual Board Meeting with Structured Review Agenda

> Management and board of directors meet on an annual basis to review the following:
> - Review different committee charters, corporate governance issues, company strategy, business objectives, capabilities, and executions.
> - Determine whether additional employees, systems, equipment, and technologies are required to meet the company's goals. Evaluate the Risk and Governance Executive Committee report to the Board of Directors containing results of annual risk assessment and relevant information resulting from assessments conducted by internal and external parties.
> - Evaluate the organization's pay and performance assessment policies to retain qualified personnel and spot any possible pressures or incentives for staff to commit fraud.
> - Evaluate the business contingency plans.
> - Evaluate succession plans for assignment of responsibility for key roles.
> - Approve the budgets for the organization.
> - Assess the need for additional subcommittees, experts, or consultants and evaluate the skill and expertise of current board members.
> - Establish goals and performance objectives for senior employees to be reviewed on an annual basis and approved by Executive Management.
> - Oversee internal controls, operations, and business objectives.

**What this requires:** At least one formal board meeting per year with a documented agenda covering strategy, risk assessment results, BCP review, succession planning, budgets, fraud risk, and internal controls. This is a significant list of items that all need to be covered and documented annually.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** SOC 2 auditors do want to see that there is board-level (or executive-level) oversight of security and risk. However, this laundry list of 9+ review items is enterprise-grade. A 10-person startup can satisfy auditors with a single annual meeting where founders/leadership review risk posture, security program status, and business continuity. You do not need separate line items for "succession planning," "fraud incentive review," or "subcommittee assessment" at this stage. Collapse this into a simple annual leadership review with 3-4 key agenda items: risk assessment results, security program status, business continuity, and budget.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Board Meeting Minutes — Maintenance and Approval

> The minutes and records of all meetings are maintained.
>
> Minutes of all Board meetings are distributed to directors and approved by the Board at the next meeting.

**What this requires:** Every board meeting must have formal written minutes. Those minutes must be distributed to all directors and then formally approved at the subsequent meeting. This creates a two-meeting cycle for every set of minutes.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** Auditors will want evidence that board/leadership oversight actually happened — and meeting minutes are the standard proof artifact. However, the "approved at the next meeting" formality is unnecessary overhead for a startup that meets infrequently. Just keep written notes/minutes from the annual review meeting and store them where you can produce them for auditors. A shared Google Doc or Notion page with attendees and decisions is fine. Drop the formal approval-at-next-meeting process.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Designated Board Membership Roster

> The Board's membership includes the following members:
>
> Chairman:
>
> Vice chairman:
>
> Members:

**What this requires:** Formally designate named individuals for Chairman, Vice Chairman, and Board Members roles. The template currently has these blank — they need to be filled in and maintained.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 auditors expect to see that governance responsibilities have been assigned to named individuals. You need to fill this in — but you almost certainly do not need a "Vice Chairman" at a 10-person startup. Simplify to just list the founders/leadership who serve as the board. If you have actual investors on the board, list them. If not, listing the founding team is fine. The key is that someone is named as responsible for oversight.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: CEO Oversight of Risk, Security, and Audit Functions

> Assist the Board with oversight of the principal risk exposures facing PolicyLift related to data management, security and compliance, and PolicyLift's mitigation efforts regarding such risks.
>
> Review and discuss with management and any independent auditor engaged by PolicyLift's internal controls and information security compliance programs' adequacy and effectiveness.
>
> Schedule separate executive sessions with management, internal auditor, and any independent auditor engaged by PolicyLift. Regularly discuss matters that could significantly impact PolicyLift's data security and compliance, if any and address them privately.
>
> Review the scope and outcomes of any internal audits.
>
> Review PolicyLift's data and information management systems, processes, and policies, as well as oversee PolicyLift's security and compliance frameworks.
>
> Review the scope and plan for security and compliance audits and related services.

**What this requires:** The CEO must actively oversee risk management, security, and compliance — including reviewing audit scopes and outcomes, holding executive sessions with auditors, and reviewing information management systems. This implies the CEO is hands-on with the security and compliance program, not just nominally responsible.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify |

**Why:** Executive ownership of the security program is genuinely critical for SOC 2. Auditors need to see that leadership is involved, not just the engineering team running things unsupervised. However, the language here implies multiple separate review sessions with internal auditors and independent auditors — that is enterprise overhead. At a startup, the CEO (or a designated founder) should be clearly responsible for overseeing the security/compliance program and should review its status at least annually. You do not need "separate executive sessions" with multiple auditor types. Simplify to: the CEO reviews and approves the security program, participates in the annual risk review, and is the point of contact for external auditors during SOC 2 engagement.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Internal Auditor Engagement and Evaluation

> Evaluate the internal auditor's performance, if any, and recommend the internal auditor's replacement.
>
> Review the scope and outcomes of any internal audits.

**What this requires:** If PolicyLift engages an internal auditor, the Board/CEO must evaluate their performance and review audit outcomes. This implies a formal internal audit function may exist or should exist.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Nice-to-Have | Remove |

**Why:** A 10-person startup does not need an internal audit function. SOC 2 Type II does not require an internal auditor — you need an external auditor (your SOC 2 auditing firm), and you need internal controls, but a dedicated internal audit role or contractor is enterprise-grade overkill. The policy already hedges with "if any," which is a signal this is optional. Remove this commitment. If you grow to 50+ people and handle very sensitive data, revisit.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Risk and Governance Executive Committee Reporting

> Evaluate the Risk and Governance Executive Committee report to the Board of Directors containing results of annual risk assessment and relevant information resulting from assessments conducted by internal and external parties.

**What this requires:** A separate "Risk and Governance Executive Committee" must produce a formal report to the Board containing annual risk assessment results. This implies both that the committee exists and that it produces a written deliverable.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Annual risk assessment is genuinely important for SOC 2 — auditors will want to see that you identified risks and have a treatment plan. However, having a separate formal committee produce a report to a separate Board is organizational theater at a 10-person company. Simplify: conduct an annual risk assessment (this is covered by a separate Risk Assessment policy), document the results, and have the CEO/leadership review them as part of the annual board meeting (Commitment 1). No separate committee report needed — just make risk assessment review an agenda item.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Business Continuity Plan and Succession Planning Reviews

> Evaluate the business contingency plans.
>
> Evaluate succession plans for assignment of responsibility for key roles.

**What this requires:** The Board must annually evaluate both the business continuity/disaster recovery plans and succession plans for key roles.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important (BCP) / Nice-to-Have (Succession) | Simplify |

**Why:** BCP/DR review is important for SOC 2 — auditors check that you have a plan and that leadership has reviewed it. This should be a line item in your annual review meeting. Succession planning, on the other hand, is not a SOC 2 requirement. It is a good business practice, but auditors will not ask "who takes over if the CTO leaves?" Keep the BCP review as part of the annual meeting agenda; drop the formal succession planning requirement from this policy.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Annual Charter Review

> This charter will be reviewed annually by the Board to ensure that it aligns with the Board's goals and obligations.

**What this requires:** Once a year, the Board must review this charter document itself and confirm it is still appropriate.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Annual policy review is a standard SOC 2 expectation. Auditors want to see that policies are not "write once and forget." This is low effort — add a recurring calendar reminder to review and re-approve this charter alongside your other annual policy reviews. Just make sure you document the review date (even if no changes were made). This can be batched with all other policy reviews in a single session.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Fraud Risk and Compensation Review

> Evaluate the organization's pay and performance assessment policies to retain qualified personnel and spot any possible pressures or incentives for staff to commit fraud.

**What this requires:** The Board must annually review compensation and performance policies specifically to identify whether employees might be incentivized or pressured to commit fraud.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove |

**Why:** This is a COSO/internal controls concept borrowed from financial audit frameworks. SOC 2 does not require a formal fraud incentive analysis for a startup. At 10 people, you know your team — there is no need for a formal policy review to determine if someone's pay structure might motivate fraud. This is enterprise boilerplate. Remove it. If you grow significantly or handle financial transactions directly, revisit.

- [ ] **Implementing**
- **Comment:**

---
