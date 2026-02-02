---
created: 2026-01-18
author: Claude
type: guide
tags: [CRM, confluence-ref]
---

# Confluence References

This folder contains **stubs** that link to external Confluence documents. We do NOT duplicate content here—only reference it.

## Purpose

- Maintain single source of truth in Confluence
- Track which external docs are relevant to CRM work
- Add engineering-relevant notes without polluting original docs
- Link external artifacts to specific cycles

## Reference Format

Each stub file should contain:

```markdown
---
confluence-url: https://confluence.company.com/...
last-verified: YYYY-MM-DD
linked-cycles: [cycle-01]
tags: [CRM, confluence-ref]
---

# Document Title

## Source
[View in Confluence](confluence-url)

## Engineering Notes
- Relevant technical considerations
- Questions for PM/Design

## Linked Work
- [[../cycles/2026-01-cycle-01/hypothesis|Cycle 01 Hypothesis]]
```

## Reference Registry

| Document | Type | Last Verified | Linked Cycles |
|----------|------|---------------|---------------|
| [[PRD-contact-management|Contact Management PRD]] | PRD | TBD | cycle-01 |
| [[DESIGN-mockups|CRM Mockups]] | Design | TBD | cycle-01 |

## Freshness Guidelines

- Verify links weekly during active development
- Update `last-verified` date after each check
- If source doc changes significantly, note it in Engineering Notes
- Flag stale references (>30 days) for review

---

*Remember: If you find yourself copying content, stop. Link instead.*
