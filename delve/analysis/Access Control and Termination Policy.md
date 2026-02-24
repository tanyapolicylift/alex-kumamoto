# Access Control and Termination Policy — Commitment Analysis

**Source:** `source/# Access Control and Termination Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Access Control and Termination Policy"**

---

## Commitment 1: Enforce Multi-Factor Authentication on Critical Systems

> ==Multi-factor authentication (MFA) is enforced for user accounts with administrative access to the company's production platform. Multi-factor authentication must be used for access to company email, version control tool and cloud infrastructure.==

**What this requires:** MFA must be turned on for all admin-level access to production infrastructure, plus for every user on email (e.g., Google Workspace), version control (e.g., GitHub), and cloud consoles (e.g., AWS/GCP). This means verifying that MFA is enabled across these systems and that no exceptions exist.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** MFA is one of the first things auditors check. Most modern SaaS tools (Google Workspace, GitHub, AWS) make it trivial to enforce org-wide. If you aren't doing this already, it's the single highest-ROI security control you can implement. Non-negotiable for SOC 2.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: Least-Privilege Access with Formal Approval Workflow

> Systems will be given minimum access to data and systems based on job function, business requirements, or need-to-know for that specific user. Access to systems should be provisioned via a deny-all methodology - users should only gain access to a system upon receiving formal independent approval.

**What this requires:** Two things: (1) Default-deny access — new employees/contractors get nothing unless explicitly granted. (2) A documented approval step before granting access (e.g., a Slack message from a manager, a ticket, an email trail). This also implies maintaining some awareness of what access each role needs.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep, but simplify |

**Why:** Least privilege is a core SOC 2 principle and auditors will ask how you provision access. However, "formal independent approval" sounds heavier than it needs to be at a 10-person startup. A simple Slack thread or a short checklist in your project management tool (Linear, Notion, etc.) showing "Manager X approved access Y for Person Z" is sufficient. You do not need a ticketing system or approval-chain software. Keep the principle, lighten the process.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Documented Onboarding Process with Device Inventory

> ==Any PolicyLift devices provided to the new hire must be inventoried in accordance with PolicyLift policy.== ==A new hire email or ticket must be sent to the appropriate team to inform them of new personnel. IT/Engineering and the new personnel's manager must document a checklist of accounts and permission levels needed for that hire. The applicable team must set up each user with the appropriate access, both logical and physical.==
>
> ==All of the onboarding processes must be appropriately documented via ticketing or other document management tools.==

**What this requires:** Three concrete things: (1) Maintain a device inventory (serial numbers, who has what laptop, etc.). (2) Create a documented onboarding checklist listing every account/system a new hire needs, with permission levels. (3) Document the execution of each onboarding — meaning there's a paper trail (ticket, checklist, etc.) showing what was provisioned for each person.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Auditors will sample onboarding events and ask to see evidence that access was provisioned according to a process. At a startup, a Notion/Google Sheets template that you fill out per hire is plenty. The device inventory can be a simple spreadsheet. The key is consistency — pick a method and use it every time. This is highlighted (==) in the source, likely because it's a gap today.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Offboarding Within One Business Day with Termination Checklist

> A human resources representative notifies security administrators of terminations of employees or consultants resulting in respective user accounts being disabled within one business day upon termination of employment as per the offboarding procedures.
>
> Management utilizes an employee termination checklist to ensure that the termination process is consistently executed, and access is revoked for terminated employees within one business day.

**What this requires:** (1) A written offboarding checklist covering: revoking system access, recovering devices/keys/tokens, removing physical access. (2) A one-business-day SLA for completing access revocation after someone leaves. (3) Evidence that this checklist was followed each time (a completed ticket or checked-off list).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Timely access revocation for departing employees is a classic SOC 2 audit target. Auditors will pull a list of terminated employees and check whether their accounts were disabled promptly. The one-business-day standard is industry-typical and reasonable. The checklist itself can be simple — the important part is having one and using it consistently. At a small startup the "HR representative notifies security administrators" step is probably just one person Slacking another, which is fine as long as it's documented.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Unique User Accounts (No Shared Credentials)

> Users of PolicyLift systems and applications will be provided with unique credentials (IDs, keys, passwords etc.) that can be used to trace activities to the individual responsible for that account. Shared user accounts shall only be utilized in circumstances where there is a clear business benefit and when user functions do not need to be traced.

**What this requires:** Every person gets their own login for every system — no passing around a single "admin@company.com" account. Shared accounts are only acceptable where there's a documented business reason and traceability isn't needed. Any shared-account passwords must live in the company password manager.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Individual accountability is fundamental to SOC 2. Auditors need to see that actions can be traced to specific people. Most cloud tools make individual accounts easy. If you have legacy shared accounts (e.g., a shared social media login, a shared AWS root account), document them and store credentials in your password manager. This is straightforward.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Company-Approved Password Manager and Password Standards

> Passwords must only be stored using a Company-approved password manager. PolicyLift does not hard code passwords or embed credentials in static code.
>
> Unique accounts and passwords are required for all users. Passwords must be kept confidential and not shared with multiple users. Where possible, all user and system account passwords must be a minimum of eight characters and complex. All accounts must use unique passwords not used elsewhere.

**What this requires:** (1) Select and mandate a specific password manager (e.g., 1Password, Bitwarden). (2) Ensure no hardcoded credentials exist in your codebase. (3) Set a minimum password policy (8+ characters, complexity) where possible. (4) Communicate to team that all credentials must live in the approved password manager.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Having a designated password manager and a no-hardcoded-credentials rule is expected by auditors and is genuinely good security hygiene. The 8-character minimum is modest by modern standards (many orgs use 12+), but it's fine for SOC 2. The main operational change is picking a password manager if you haven't already and ensuring everyone uses it. Consider running a secrets-scan on your codebase to catch any hardcoded credentials.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Documented Access Change Process for Role Changes

> Requests for changes to access level(s), such as in the cases of a change in job duties or an emergency requiring elevated permissions, must be documented and approved by the appropriate manager.
>
> A documented request must be sent to the appropriate department when an employee or contractor role changes to evaluate whether access privileges should be changed.
>
> Such changes must be tracked using PolicyLift ticketing or other document management tools.

**What this requires:** When someone changes roles internally or needs temporary elevated access (e.g., an engineer needs production DB access for an incident), there must be a documented approval (ticket, Slack message, email) and a record of what changed. This also implies reviewing whether existing access is still appropriate when someone's job changes.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep, but simplify |

**Why:** Auditors want to see that access changes are intentional and approved, not ad-hoc. At a 10-person startup, role changes are infrequent, so this won't be burdensome. A Slack message from a manager saying "Please grant X access to Y" plus a note in your access log is sufficient — you don't need a formal ticketing workflow. For emergency access, just make sure someone writes down what happened after the fact.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Quarterly Access Reviews of Critical Systems

> A team manager must review, audit, and document user accounts and associated privileges of at least high-risk and critical systems at least quarterly to ensure that access is restricted appropriately.

**What this requires:** Every quarter, someone (a manager or designated person) must pull user lists from your critical systems (cloud console, production database, version control, etc.), review who has access and at what level, document the review, and revoke any access that's no longer needed.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Periodic access reviews are one of the most commonly tested SOC 2 controls. Auditors will ask to see evidence of these reviews (screenshots, spreadsheets, tickets showing accounts were reviewed and any issues remediated). Quarterly is the standard cadence for SOC 2. At a small startup this might take 1-2 hours per quarter — pull user lists from AWS/GCP, GitHub, Google Workspace, and your production database, verify each person still needs their access level, and document it. Not glamorous, but it's a must-do.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Annual Policy Review and Update Cycle

> PolicyLift reviews and updates its security policies and plans to maintain organizational security objectives and meet regulatory requirements at least annually. The results are shared with appropriate parties internally and findings are tracked to resolution. Any changes are communicated across the organization.

**What this requires:** Once a year, review this policy (and all other security policies), decide if anything needs updating, document the review, share results internally, and communicate any changes to the team.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Annual policy review is a standard SOC 2 expectation. It's low-effort — once a year, sit down, re-read each policy, note any changes, update version dates, and send an email/Slack message to the team. Auditors will look for evidence that policies were reviewed (a dated review note or version history). This is boilerplate but expected.

- [ ] **Implementing**
- **Comment:**

---
