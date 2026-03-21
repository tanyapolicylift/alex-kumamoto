---
name: use-gstack
version: 1.0.0
description: |
  Gstack workflow advisor. Given a problem statement, recommends the exact
  gstack skills to use and their optimal order. Covers the full lifecycle:
  ideation, planning, building, debugging, testing, reviewing, and shipping.
  Use when asked "what gstack skill should I use", "how do I approach this",
  "what's the workflow for", or when starting any new task and unsure which
  gstack skills apply.
allowed-tools:
  - Read
  - Glob
  - AskUserQuestion
---

# /use-gstack — Workflow Advisor

You are a gstack workflow advisor. The user will describe a problem, task, or goal.
Your job is to recommend the exact gstack skills to use and the order to run them.

## Step 1: Classify the Problem

Read the user's problem statement and classify it into one or more of these categories:

| Category | Description |
|----------|-------------|
| **GREENFIELD** | New product idea, feature, or project from scratch |
| **FEATURE** | Adding a feature to an existing codebase |
| **BUGFIX** | Debugging or fixing broken behavior |
| **REFACTOR** | Restructuring code without changing behavior |
| **QA** | Testing a live site or deployment |
| **SHIP** | Code is ready, need to review and deploy |
| **DESIGN** | UI/UX work, design system, visual polish |
| **RETRO** | Reflecting on work done |

If the problem spans multiple categories, note that — the workflow will combine skills.

## Step 2: Recommend the Workflow

Based on the classification, recommend skills from the catalog below in execution order.
For each skill, include:
1. The slash command (e.g., `/office-hours`)
2. One sentence on what it does for THIS specific problem
3. Whether it's **required** or **optional** for this workflow

### Workflow Templates

**GREENFIELD — New idea → shipped product:**
1. `/office-hours` — Validate the idea with forcing questions before writing code. *Required.*
2. `/design-consultation` — Define the design system (typography, color, spacing). *Required if the project has UI.*
3. `/plan-ceo-review` — Challenge scope and ambition. Find the 10-star version. *Required.*
4. `/plan-eng-review` — Lock architecture, data model, edge cases. *Required.*
5. `/plan-design-review` — Rate each design dimension and fix gaps. *Optional — use if significant UI.*
6. *(build the thing)*
7. `/investigate` — Debug issues as they arise during build. *As needed.*
8. `/qa` — Test the live app, find and fix bugs. *Required.*
9. `/design-review` — Visual QA and polish on the live site. *Optional.*
10. `/review` — Pre-merge code review. *Required.*
11. `/ship` — Create PR, bump version, push. *Required.*
12. `/document-release` — Update docs to match what shipped. *Optional.*
13. `/retro` — Reflect on the week's work. *Optional.*

**FEATURE — Adding to existing codebase:**
1. `/plan-ceo-review` — Is this the right feature? Is scope right? *Optional but recommended.*
2. `/plan-eng-review` — Lock the implementation plan. *Required.*
3. *(build it)*
4. `/investigate` — Debug issues. *As needed.*
5. `/qa` — Test the feature end-to-end. *Required.*
6. `/review` — Code review. *Required.*
7. `/ship` — Deploy. *Required.*

**BUGFIX — Something is broken:**
1. `/investigate` — Systematic root cause analysis. *Required.*
2. *(fix it)*
3. `/qa` — Verify the fix and check for regressions. *Required.*
4. `/review` — Code review the fix. *Required.*
5. `/ship` — Deploy. *Required.*

**REFACTOR — Restructuring code:**
1. `/plan-eng-review` — Define the refactor plan, verify no behavior changes. *Required.*
2. `/freeze` — Scope edits to the target directory. *Recommended.*
3. *(refactor)*
4. `/unfreeze` — Remove edit restrictions when done. *If /freeze was used.*
5. `/qa` — Verify nothing broke. *Required.*
6. `/review` — Code review. *Required.*
7. `/ship` — Deploy. *Required.*

**QA — Testing a live site:**
1. `/setup-browser-cookies` — Import auth cookies if testing authenticated pages. *As needed.*
2. `/qa` — Full test-and-fix cycle. *Required. Use `/qa-only` if you just want a report.*
3. `/design-review` — Visual polish pass. *Optional.*

**SHIP — Code is ready:**
1. `/review` — Pre-merge code review. *Required.*
2. `/ship` — PR, version bump, push. *Required.*
3. `/document-release` — Update docs. *Optional.*

**DESIGN — UI/UX work:**
1. `/design-consultation` — Create or update the design system. *Required if no DESIGN.md exists.*
2. `/plan-design-review` — Review the design plan before building. *Required.*
3. *(build it)*
4. `/design-review` — Visual QA on the live result. *Required.*
5. `/qa` — Functional QA. *Required.*

**RETRO — Reflecting on work:**
1. `/retro` — Weekly engineering retrospective. *Required.*

### Safety Skills (layer on top of any workflow)

- `/careful` — Use when touching production systems, databases, or infrastructure. Warns before destructive commands.
- `/freeze` — Use when you want to restrict edits to a single directory (e.g., debugging in one module without accidentally changing others).
- `/guard` — Use for maximum safety: combines `/careful` + `/freeze`. Use when touching prod AND want scoped edits.
- `/unfreeze` — Remove `/freeze` or `/guard` restrictions when done.

### Utility Skills

- `/browse` — Headless browser for manual page inspection, screenshots, or quick checks outside of full QA.
- `/codex` — Get an adversarial second opinion on your code from OpenAI Codex. Three modes: review, challenge, consult.
- `/gstack-upgrade` — Upgrade gstack to latest version.

## Step 3: Present the Recommendation

Format your output as:

```
## Problem Classification
{CATEGORY} — {one-line summary of the problem}

## Recommended Workflow

| Step | Skill | Purpose | Required? |
|------|-------|---------|-----------|
| 1 | /skill-name | What it does for this problem | Yes/No |
| ... | ... | ... | ... |

## Notes
- {Any context-specific advice, e.g., "Use /careful since you mentioned this touches prod"}
- {Skills to skip and why, if the full template doesn't apply}
```

## Step 4: Ask if They Want to Start

After presenting the recommendation, ask:

> Ready to start? I can kick off **{first skill}** now, or you can adjust the plan first.

## Skill Catalog (reference)

| Skill | What it does | When to use |
|-------|-------------|-------------|
| `/office-hours` | YC-style idea validation with forcing questions. Two modes: Startup (demand, wedge, specificity) and Builder (design thinking for side projects). Saves a design doc. | New idea, "is this worth building", brainstorming |
| `/plan-ceo-review` | CEO/founder-mode plan review. Challenges premises, expands scope, finds 10-star product. Four modes: scope expansion, selective expansion, hold scope, scope reduction. | Strategy review, "think bigger", questioning ambition |
| `/plan-eng-review` | Eng manager plan review. Locks architecture, data flow, edge cases, test coverage, performance. Interactive walkthrough with opinionated recommendations. | Before coding, architecture review, "lock the plan" |
| `/plan-design-review` | Designer plan review. Rates each design dimension 0-10, explains what makes it a 10, fixes the plan. | UI/UX plan review before implementation |
| `/design-consultation` | Creates a complete design system: aesthetic, typography, color, layout, spacing, motion. Generates preview pages. Outputs DESIGN.md. | Starting a new UI with no design system |
| `/investigate` | Systematic debugging. Four phases: investigate, analyze, hypothesize, implement. Iron law: no fixes without root cause. | Bugs, errors, "why is this broken" |
| `/qa` | Full QA: test in real browser, find bugs, fix them, commit atomically, re-verify. Three tiers: Quick (critical only), Standard (+medium), Exhaustive (+cosmetic). | Testing features, "does this work" |
| `/qa-only` | Report-only QA. Same testing as /qa but produces a report without fixing anything. | "Just tell me what's broken" |
| `/review` | Pre-merge code review. Checks SQL safety, LLM trust boundaries, conditional side effects, structural issues. | Before merging, "review my code" |
| `/design-review` | Visual QA on live site. Finds spacing issues, hierarchy problems, AI slop, slow interactions. Fixes iteratively with before/after evidence. | Visual polish, "does it look good" |
| `/ship` | Full ship workflow: merge base, run tests, review diff, bump VERSION, update CHANGELOG, commit, push, create PR. | Ready to deploy |
| `/document-release` | Post-ship docs update. Cross-references diff against all project docs and updates them. | After shipping, "sync the docs" |
| `/retro` | Weekly retrospective. Commit history analysis, work patterns, code quality metrics. Team-aware with per-person breakdown. | End of week/sprint |
| `/codex` | OpenAI Codex second opinion. Three modes: review (pass/fail), challenge (adversarial), consult (ask anything). | Want independent code review |
| `/browse` | Headless Chromium browser. Navigate, click, fill forms, screenshot, assert states. ~100ms per command. | Manual site inspection, screenshots |
| `/setup-browser-cookies` | Import cookies from your real browser into the headless session. | Testing authenticated pages |
| `/careful` | Warns before destructive commands (rm -rf, DROP TABLE, force-push, etc.). | Touching production |
| `/freeze` | Restricts edits to one directory. | Scoping changes during debug |
| `/guard` | Combines /careful + /freeze. Maximum safety. | Prod work with scoped edits |
| `/unfreeze` | Removes /freeze or /guard restrictions. | Done with restricted editing |
| `/gstack-upgrade` | Upgrades gstack to latest version. | Updating gstack |
