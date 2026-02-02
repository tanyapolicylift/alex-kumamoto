---
created: 2026-01-18
author: Claude
type: guide
tags: [CRM, onboarding, guide]
---

# Getting Started: CRM Workstream Framework

A practical guide to using this lean startup framework in your daily workflow.

---

## Quick Orientation

This framework is built around **cycles** — short iterations where you:
1. State a hypothesis
2. Test it with real users
3. Learn and decide: pivot or persevere

Everything traces back to a hypothesis. Engineering doesn't start until assumptions are validated.

```
Your workflow:
Hypothesis → Validation → Learnings → (if validated) → Engineering Scoping → Specs
```

---

## Day in the Life: Scenarios

### 🌅 Scenario 1: Starting a New Initiative

**Situation:** Leadership says "We need CRM capabilities." You're kicking off the workstream.

**What to do:**

1. **Check the dashboard**
   - Open [[_index|workstreams/CRM/_index.md]]
   - This is your home base — current status, stakeholders, quick links

2. **Create your first cycle**
   - Go to [[cycles/_index|cycles/]]
   - Create a new folder: `2026-01-cycle-01-mvp/`
   - Start with [[cycles/2026-01-cycle-01/hypothesis|hypothesis.md]]

3. **Fill in the hypothesis**
   ```markdown
   We believe that [sales teams at SMBs]
   need [a simple way to track customer contacts]
   because [they lose deals due to forgotten follow-ups].

   We will know we're right when [70% of pilot users
   log at least 5 contacts in their first week].
   ```

4. **Identify riskiest assumptions**
   - What would kill this if wrong?
   - Rank them: which to test first?

5. **Link to external docs**
   - If there's a PRD in Confluence, create a stub in [[confluence-refs/_index|confluence-refs/]]
   - Don't copy content — just link and add engineering notes

---

### 📞 Scenario 2: Running Customer Interviews

**Situation:** You're validating assumptions with real users this week.

**What to do:**

1. **Review your validation plan**
   - Open [[cycles/2026-01-cycle-01/validation-plan|validation-plan.md]]
   - Check which assumptions you're testing
   - Review your interview guide

2. **After each interview, create a session note**
   - Go to [[validation/_index|validation/]]
   - Create: `2026-01-18-customer-acme.md`

   ```markdown
   ---
   created: 2026-01-18
   participant: Acme Corp (Sales Manager)
   type: customer
   linked-cycle: cycle-01
   tags: [CRM, validation]
   ---

   # Session: Acme Corp - 2026-01-18

   ## Key Quotes
   > "I keep contacts in three different spreadsheets
   > and still forget to follow up"

   ## Assumptions Tested
   - [x] They forget follow-ups: ✅ VALIDATED
   - [ ] They'd pay for a solution: ❓ UNCLEAR
   ```

3. **After 3+ interviews, synthesize**
   - Go to [[validation/synthesis/_index|validation/synthesis/]]
   - Create a synthesis doc identifying patterns
   - What themes keep emerging?

---

### 🔬 Scenario 3: Wrapping Up a Cycle

**Situation:** You've done 5 interviews. Time to decide: pivot or persevere?

**What to do:**

1. **Complete your learnings doc**
   - Open [[cycles/2026-01-cycle-01/learnings|learnings.md]]
   - Fill in assumption outcomes with evidence

   ```markdown
   | # | Assumption | Outcome | Evidence | Confidence |
   |---|------------|---------|----------|------------|
   | 1 | Users forget follow-ups | ✅ Validated | 4/5 mentioned this | High |
   | 2 | Willing to pay $50/mo | ❌ Invalidated | Price sensitivity | High |
   ```

2. **Make the pivot/persevere decision**
   - Document your reasoning
   - If pivoting: what's the new direction?
   - If persevering: what's the refined scope?

3. **Update the cycle registry**
   - Go to [[cycles/_index|cycles/_index.md]]
   - Update the outcomes table
   - Add key learnings summary

4. **If proceeding to engineering:**
   - Create a scoping doc (see Scenario 4)

---

### 🔧 Scenario 4: Starting Engineering Scoping

**Situation:** Hypothesis validated. Time to figure out what to build.

**What to do:**

1. **Create a scoping document**
   - Go to [[engineering/_index|engineering/scoping/]]
   - Copy the [[engineering/scoping/2026-01-18-scoping-template|template]]
   - Name it: `2026-01-20-contact-management-mvp.md`

2. **Link to your hypothesis** (critical!)
   ```yaml
   ---
   linked-hypothesis: [[../../cycles/2026-01-cycle-01/hypothesis]]
   status: draft
   estimated-effort: M
   confidence: medium
   ---
   ```

3. **Reference external docs, don't duplicate**
   - Link to Confluence PRD stub
   - Link to Design mockups stub
   - Add engineering-specific notes to those stubs

4. **Identify dependencies**
   - Create blockers in [[engineering/dependencies/|dependencies/]]
   - Flag anything that could delay delivery

5. **After approval, create spec**
   - Move to [[engineering/specs/|specs/]] folder
   - Spec has full technical detail

---

### 📋 Scenario 5: Cross-Functional Decision

**Situation:** PM wants one thing, Engineering sees risks. Need alignment.

**What to do:**

1. **Create a decision doc**
   - Go to [[decisions/_index|decisions/]]
   - Create: `2026-01-22-decision-mvp-scope.md`

2. **Document options and trade-offs**
   ```markdown
   ## Options Considered

   ### Option A: Full contact sync
   - Pros: Complete solution
   - Cons: 4 weeks, dependency on API

   ### Option B: Manual entry only
   - Pros: 1 week, no dependencies
   - Cons: More user friction
   ```

3. **Record the decision and rationale**
   - Who made it
   - Why this option
   - What we're accepting

4. **Link to relevant cycle**
   - Trace back to hypothesis this supports

---

### 🔗 Scenario 6: New Confluence Doc Arrives

**Situation:** Design just published mockups in Confluence. You need to reference them.

**What to do:**

1. **Create a stub, not a copy**
   - Go to [[confluence-refs/_index|confluence-refs/]]
   - Create: `DESIGN-contact-list-v2.md`

2. **Fill in the stub template**
   ```markdown
   ---
   confluence-url: https://confluence.company.com/...
   last-verified: 2026-01-18
   linked-cycles: [cycle-01]
   tags: [CRM, confluence-ref, design]
   ---

   # Design: Contact List v2

   ## Source
   🔗 [View in Confluence](url)

   ## Engineering Notes
   - List virtualization needed for 1000+ contacts
   - Unclear: how does search work?

   ## Questions for Design
   - [ ] What's the empty state?
   ```

3. **Link from your scoping doc**
   - Reference this stub, not the raw URL

4. **Check freshness weekly**
   - Update `last-verified` when you confirm it's current

---

## Daily Checklist

```
Morning:
☐ Check [[_index|workstream dashboard]] for status
☐ Review any blocked items
☐ Check if confluence-refs need freshness update

During work:
☐ Log interview notes immediately after calls
☐ Update hypothesis when assumptions change
☐ Link all engineering work to a hypothesis

End of day:
☐ Update cycle status if changed
☐ Move any decisions to decisions/ folder
```

---

## Common Mistakes to Avoid

| Mistake | Why it's bad | Do this instead |
|---------|--------------|-----------------|
| Copying PRD content | Gets stale, conflicting sources | Create a stub with link |
| Scoping before validation | Might build wrong thing | Complete learnings first |
| Skipping hypothesis | No trace to user need | Always start with hypothesis |
| Unlinked scoping docs | Can't trace decisions | Use `linked-hypothesis` frontmatter |
| Raw session notes only | Miss patterns | Create synthesis after 3+ sessions |

---

## Folder Quick Reference

| Folder | What goes there | When to use |
|--------|-----------------|-------------|
| `cycles/` | Hypothesis → Validation → Learnings | Starting/running a cycle |
| `validation/` | Interview notes, synthesis | After customer calls |
| `confluence-refs/` | Link stubs to external docs | New PRD/Design arrives |
| `engineering/scoping/` | Technical estimates | After validation |
| `engineering/specs/` | Approved tech specs | After scoping approved |
| `engineering/dependencies/` | External blockers | When blocked |
| `decisions/` | Cross-functional choices | When alignment needed |
| `meetings/` | CRM-specific meetings | After meetings |

---

## Tags to Use

```
Workstream:  #CRM
Cycles:      #cycle-01, #cycle-02
Types:       #hypothesis, #learnings, #scoping, #validation
External:    #confluence-ref
```

---

## Getting Help

- **Framework questions:** Review this guide and [[_index|dashboard]]
- **Confluence freshness:** Check [[confluence-refs/_index|confluence-refs guide]]
- **Engineering conventions:** See [[engineering/_index|engineering overview]]

---

*Remember: Everything traces to a hypothesis. If you can't link your work to a hypothesis, ask why you're doing it.*
