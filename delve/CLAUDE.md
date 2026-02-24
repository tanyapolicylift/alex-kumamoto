# Delve — SOC 2 Policy Commitment Analysis

This directory contains SOC 2 compliance policies for PolicyLift. The goal is to analyze each policy, extract the concrete operational commitments it imposes, and let the team decide which commitments to keep or discard before producing a final cleaned-up policy.

## Directory Structure

```
delve/
├── source/          # Original policy markdown files (DO NOT MODIFY)
├── analysis/        # Commitment analysis files (one per policy, agent-produced then user-edited)
├── output/          # Finalized rewritten policies (produced after user review)
└── CLAUDE.md        # This file
```

## Source Policies

| # | Source File | Analysis File |
|---|-------------|---------------|
| 1 | `source/# Acceptable Use Policy.md` | `analysis/Acceptable Use Policy.md` |
| 2 | `source/# Access Control and Termination Policy.md` | `analysis/Access Control and Termination Policy.md` |
| 3 | `source/# Baseline Hardening Policy.md` | `analysis/Baseline Hardening Policy.md` |
| 4 | `source/# Board of Directors Charter.md` | `analysis/Board of Directors Charter.md` |
| 5 | `source/# Business Continuity and Disaster Recovery.md` | `analysis/Business Continuity and Disaster Recovery.md` |
| 6 | `source/# Change Management Policy.md` | `analysis/Change Management Policy.md` |
| 7 | `source/# Chief Information Security Officer (CISO) Policy.md` | `analysis/Chief Information Security Officer (CISO) Policy.md` |
| 8 | `source/# Data Classification Policy.md` | `analysis/Data Classification Policy.md` |
| 9 | `source/# Incident Response Policy.md` | `analysis/Incident Response Policy.md` |
| 10 | `source/# Information Security Policy.md` | `analysis/Information Security Policy.md` |
| 11 | `source/# Information Technology Leadership Committee Charter.md` | `analysis/Information Technology Leadership Committee Charter.md` |
| 12 | `source/# Network Security Policy.md` | `analysis/Network Security Policy.md` |
| 13 | `source/# Personnel Security Policy.md` | `analysis/Personnel Security Policy.md` |
| 14 | `source/# PolicyLift Handbook.md` | `analysis/PolicyLift Handbook.md` |
| 15 | `source/# Risk Assessment and Treatment Policy.md` | `analysis/Risk Assessment and Treatment Policy.md` |
| 16 | `source/# Risk and Governance Executive Committee.md` | `analysis/Risk and Governance Executive Committee.md` |
| 17 | `source/# Vendor Management Policy.md` | `analysis/Vendor Management Policy.md` |

---

## Phase 1: Analyze a Policy

**Trigger:** User says "Analyze `<policy name>`" (or similar).

### Steps

1. **Read the source policy thoroughly.** The file is in `source/`. Read the entire document — do not skim.

2. **Identify concrete operational commitments.** Extract every commitment in the policy that requires an actual **change** in how PolicyLift operates. Focus on things like:
   - Recurring meetings, reviews, or audits at a specified cadence
   - Adoption of specific systems, tools, or platforms
   - Formal processes that must be established (approval workflows, documentation requirements, etc.)
   - Roles or positions that must be designated or created
   - Training programs that must be conducted
   - Documented procedures that must be written and maintained
   - Reporting or notification obligations with specific timelines

   **Exclude** vague aspirational statements like "we will uphold the protection of customer data" — these are not actionable changes. Only include commitments that would require the team to **do something new or different**.

3. **Group commitments thoughtfully.** Aim for **3–15 broad commitment groups** per policy, not 30–40 granular line items. Related sub-commitments should be nested under a parent group. Use your judgment to cluster logically.

4. **Analyze each commitment on two axes:**

   - **Implementation Difficulty** (for a small startup with ~10 people, limited dedicated IT/security staff):
     - `Low` — Can be done quickly with minimal effort (e.g., enable a setting, write a short doc)
     - `Medium` — Requires meaningful effort but is achievable (e.g., set up a recurring process, configure a tool)
     - `High` — Significant ongoing burden or requires dedicated resources/tooling

   - **SOC 2 Necessity** — How important is this commitment for actually passing a SOC 2 Type II audit?
     - `Critical` — Auditors will explicitly look for this; omitting it risks a qualification
     - `Important` — Strongly expected and would raise questions if absent, but not an automatic fail
     - `Nice-to-Have` — Goes beyond what most startups do for SOC 2; overkill for our stage

5. **Provide a nuanced recommendation** for each commitment: Should a lean startup pursuing SOC 2 keep this commitment, simplify it, or remove it entirely? Be specific about *why*. If the commitment is overkill, say so plainly and explain what a startup-appropriate alternative might look like.

6. **Cite relevant excerpts** from the source policy to show exactly what language creates each commitment. Use blockquotes.

### Analysis File Format

Write the analysis file to `analysis/<Policy Name>.md` using this exact format:

```markdown
# <Policy Name> — Commitment Analysis

**Source:** `source/# <Policy Name>.md`
**Date Analyzed:** YYYY-MM-DD

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize <Policy Name>"**

---

## Commitment 1: <Descriptive Title>

> <Relevant excerpt(s) from the source policy>

**What this requires:** <Plain-English explanation of the concrete operational change>

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low/Medium/High | Critical/Important/Nice-to-Have | Keep / Simplify / Remove |

**Why:** <1-3 sentences explaining the recommendation — be specific about why a startup should or shouldn't do this>

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: <Descriptive Title>

(...same format...)

---

(repeat for all commitments)
```

### Important Guidelines for Analysis

- **Surgical grouping is key.** If the policy says "review access quarterly" and "review permissions quarterly" and "audit accounts quarterly" — that's ONE commitment about quarterly access reviews, not three.
- **Be honest about overkill.** Many SOC 2 policy templates are written for large enterprises. A 10-person startup does not need a formal "Information Technology Leadership Committee" with chartered quarterly meetings. Say so.
- **But don't dismiss things that matter.** MFA, access reviews, incident response plans, encryption — these are real and auditors check for them. Be clear when something is non-negotiable.
- **Startup context matters.** We use cloud infrastructure (AWS/GCP), modern SaaS tools, and have a small engineering-heavy team. Factor this in when assessing difficulty.
- **The `==highlighted==` text in source files** indicates sections that were flagged during a prior review pass. Pay attention to these — they may indicate areas of concern.

### After Producing the Analysis File

**STOP.** Do not proceed further. The analysis file is now in the hands of the team for review. They will:
1. Read each commitment
2. Check or uncheck the "Implementing" boxes
3. Optionally add comments with nuance or modifications
4. Come back and say **"Finalize <Policy Name>"** when ready

---

## Phase 2: Finalize a Policy

**Trigger:** User says "Finalize `<policy name>`" (or similar).

### Steps

1. **Read the analysis file** from `analysis/<Policy Name>.md`. Note which commitments are checked (implementing) and which are unchecked (removing). Read all user comments carefully.

2. **Read the original source policy** from `source/# <Policy Name>.md`.

3. **Produce a redline document** in `output/<Policy Name>.md`. The output must be the **original source text with inline redline markup** so the team can see exactly what changed and apply edits manually in the SOC 2 vendor platform. This is critical because we cannot directly import rewritten documents — we need to see the exact deletions and insertions against the original.

   **Redline conventions:**
   - `~~strikethrough~~` = text to **delete**
   - `**[INSERT: new text]**` = text to **add**
   - Unchanged text is left as-is (no markup)

   **Rules for the redline:**
   - **Start from the original source text verbatim.** Do not reorganize, reorder, or rewrite sections.
   - **Show deletions inline** using `~~strikethrough~~` on the exact words/sentences/paragraphs being removed.
   - **Show additions inline** using `**[INSERT: ...]**` placed exactly where the new text should appear.
   - When replacing text, show the old text struck through immediately followed by the insertion: `~~old text~~ **[INSERT: new text]**`
   - **Unchanged sections remain untouched** — no markup needed.
   - **Remove template artifacts** (e.g., "Mark as Complete", "Template Provided", "An example has been provided...") by striking them through.
   - **Clean up** orphaned references by striking them through.

4. At the top of the output file, add a legend and change summary:

```markdown
<!--
  REDLINE DOCUMENT — <Policy Name>

  Convention:
    ~~strikethrough~~ = text to DELETE
    **[INSERT: text]** = text to ADD

  Apply these changes manually in your SOC2 vendor platform.
-->

> **REDLINE LEGEND:** ~~Strikethrough~~ = delete · **[INSERT: text]** = add
```

5. **Confirm with the user** what was changed and what was kept.

---

## General Rules

- **NEVER modify files in `source/`.** These are the originals and must remain untouched.
- **One policy at a time.** Each agent invocation handles a single policy through one phase.
- **Be concise but complete.** The analysis should be scannable by busy executives — no walls of text, but don't omit important nuance.
- **Use plain language.** Avoid jargon. The audience is startup founders and operators, not compliance lawyers.
