# Risk and Governance Executive Committee — Commitment Analysis

**Source:** `source/# Risk and Governance Executive Committee.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Risk and Governance Executive Committee"**

---

## Commitment 1: Establish a Formal Risk and Governance Executive Committee (RGEC)

> "The Risk and Governance Executive Committee ("RGEC") of the Board of Directors (the "Board") of PolicyLift shall be to assist the Board of Directors of PolicyLift in its oversight of PolicyLift's risk governance structure"

> "The Risk and Governance Executive Committee shall be appointed by and will serve at the discretion of the Board. The Chairman of the Risk and Governance Executive Committee shall be a member of the Board."

**What this requires:** You must formally designate an RGEC — a named group of people, appointed by the Board, with a Board member as chairman — responsible for risk governance oversight. This means documenting who is on the committee, that the Board appointed them, and that someone on the Board chairs it.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 auditors want to see that *someone* at the leadership level is responsible for risk oversight. But you do not need a formally chartered "Executive Committee" with a Board-appointed chairman. For a 10-person startup, this can simply be "the founders meet periodically to review risk" — documented in a lightweight way. Simplify this to name 2-3 people (e.g., CEO + CTO) as the risk oversight group without the enterprise governance theater of Board appointments and chairmanship.

- [x] **Implementing**
- **Comment:**
Commit to the suggestion, leadership will meet periodically to review risk
---

## Commitment 2: Hold RGEC Meetings at Least Twice Per Year

> "The Committee shall meet at least 2 times per year."

**What this requires:** Schedule and actually hold at least two formal committee meetings per year, with documented agendas and attendance.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** SOC 2 auditors will look for evidence that risk governance happens on a regular cadence. Two meetings per year is actually a very light ask — most frameworks expect quarterly. This is the minimum viable frequency and easy to maintain. Just pick two dates (e.g., mid-year and end-of-year), hold the meeting, and keep notes.

- [x] **Implementing**
- **Comment:**

---

## Commitment 3: Minute All Meetings and Track Action Items

> "Proceedings of all meetings are minuted and signed by one member of the Committee."

> "Minutes of all Committee meetings are circulated to Committee members and at the start of each subsequent meeting, the status of action items identified at the end of the previous meeting is discussed."

**What this requires:** Three things: (1) write meeting minutes for every RGEC meeting, (2) have one member sign/approve them, (3) review prior action items at the start of each subsequent meeting.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep (simplify the "signed" part) |

**Why:** Auditors absolutely want to see documented evidence that governance meetings happened and decisions were made. Minutes are the proof. The "signed by one member" language is overly formal — a Notion page or Google Doc with a noted approver is fine. The action-item tracking is genuinely useful and easy to do. Keep this, but don't worry about wet signatures or formal sign-off ceremonies.

- [x] **Implementing**
- **Comment:**

---

## Commitment 4: Periodic Risk Assessment and Mitigation Review

> "The Risk and Governance Executive Committee shall periodically assess risks to the effective execution of business strategy and review key leading indicators in this regard."

> "Evaluate significant risk exposures of PolicyLift and assess management's actions to mitigate the exposures promptly (including one-off initiatives and ongoing activities such as business continuity planning and disaster recovery planning and testing)."

> "Evaluate risks related to cybersecurity and ensure appropriate procedures are placed to mitigate these risks promptly."

**What this requires:** The RGEC must actively review the company's risk landscape — including cybersecurity risks, business continuity, and disaster recovery — and assess whether mitigations are adequate. This should happen at the biannual meetings at minimum.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** A formal risk assessment is one of the core pillars of SOC 2. Auditors will look for a documented risk register and evidence that leadership reviewed and addressed risks. This is not optional. The good news: for a small startup, your risk register can be a simple spreadsheet with 15-25 risks, their likelihood, impact, and what you're doing about them. Review it at your biannual meetings and you've covered this commitment.

- [x] **Implementing**
- **Comment:**

---

## Commitment 5: Review Internal Controls and Compliance Framework Alignment

> "The alignment of the Organization's policies and procedures with the established compliance frameworks"

> "Reviews of internal controls assessments and information required to support internal controls and the achievement of the service commitment and system requirements"

> "Review of control design considerations, including management's evaluation of manual versus automated controls and the appropriate balance of preventive and detective controls when implementing new control activities."

**What this requires:** The RGEC must review whether your policies actually align with your compliance framework (SOC 2 trust service criteria), and specifically evaluate the design of controls — manual vs. automated, preventive vs. detective.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Auditors do want to see that someone is checking whether your controls actually match your commitments. But the language about "evaluation of manual versus automated controls" and "appropriate balance of preventive and detective controls" is enterprise-grade formality. For a startup: during your biannual risk meeting, include a quick review of "are we actually doing what our policies say we do?" That covers this. Remove the control-design-philosophy language — no auditor at a Series A startup expects a formal manual-vs-automated control analysis.

- [x] **Implementing**
- **Comment:**

---

## Commitment 6: Oversight of Fraud Risk Management

> "Oversight of fraud risk management, including the identification of potential fraud and misconduct scenarios within the organization and the adequacy of measures implemented to mitigate those risks."

**What this requires:** The RGEC must formally identify fraud and misconduct scenarios and evaluate mitigations. This implies maintaining some kind of fraud risk assessment.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Remove |

**Why:** Fraud risk management is important for public companies and large enterprises. For a 10-person startup going through SOC 2 Type II, this is not something auditors typically focus on. SOC 2 is about the trust service criteria (security, availability, processing integrity, confidentiality, privacy) — fraud oversight is a governance nice-to-have, not a SOC 2 requirement. If you keep a general risk register (Commitment 4), you can note fraud as one risk among many without building a separate fraud risk management program.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Succession Planning for Key Roles

> "Review of succession planning for key roles and personnel critical to the organization's operations and risk management functions."

**What this requires:** The RGEC must review succession plans for key personnel — i.e., "what happens if the CTO gets hit by a bus?" This implies that succession plans must exist and be periodically reviewed.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Remove |

**Why:** Succession planning is a governance best practice, but SOC 2 auditors at a startup are not going to ask for documented succession plans. At a 10-person company, everyone is a key person and realistic succession planning is "we'd hire someone." This is overkill for your stage. If you want, you can note key-person dependencies in your risk register as a risk, but a formal succession-planning review process is unnecessary overhead.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Authority to Retain Independent Consultants at Company Expense

> "To retain independent consultants to advise the RGEC, at PolicyLift expense, as it deems necessary. PolicyLift shall provide for appropriate funding, as determined by the RGEC, for the payment of compensation to consultants or advisors employed by the RGEC."

**What this requires:** The charter grants the RGEC budgetary authority to hire outside consultants without further Board approval. This is a governance power delegation.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove |

**Why:** This is corporate governance boilerplate for large-company board committees. At a 10-person startup where the founders are both the Board and the RGEC, giving yourself permission to spend your own money on consultants is meaningless. No SOC 2 auditor will check whether your risk committee has a formal budget authorization clause. Remove this entirely — if you need a consultant, you'll just hire one.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Prepare and Submit Reports to the Board

> "Prepare and submit reports to the Board, including reports concerning risk management and minimization procedures."

**What this requires:** After each RGEC meeting, the committee must prepare a formal report and submit it to the Board of Directors.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove |

**Why:** In a large company, the risk committee reports up to a separate Board. At PolicyLift, the founders likely *are* the Board. Writing a report from yourself to yourself is theater. The meeting minutes from Commitment 3 already serve as the documented record. If your Board ever becomes meaningfully separate from your operating team, you can add this back. For now, it's unnecessary.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: Annual Charter Review and Board Approval

> "The Board of Directors will review, update, and approve this charter annually to ensure it remains consistent with the Committee's objectives and responsibilities."

> "Review and reassess the adequacy of this Charter periodically and recommend any proposed changes to the Board for approval."

**What this requires:** Once a year, the Board must formally review this charter document and approve it (even if no changes are made). The RGEC must also periodically assess whether the charter is still adequate.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 auditors do want to see that policies are reviewed periodically — annual review is a standard expectation across all your policies. But this doesn't need to be a formal "Board approval" process. Simplify to: "This charter is reviewed annually as part of the company's policy review cycle." That way it gets swept up with all your other policy reviews rather than being a standalone Board agenda item.

- [x] **Implementing**
- **Comment:**
