---
created: 2026-01-18
author: Claude
type: workstream-dashboard
tags:
  - CRM
  - dashboard
---

# CRM Workstream

## Current Status

| Aspect | Status | Notes |
|--------|--------|-------|
| Current Cycle | [[cycles/2026-01-cycle-01/hypothesis\|Cycle 01]] | MVP hypothesis |
| Phase | Discovery | Validating core assumptions |
| Next Milestone | TBD | Pending validation results |

## Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| PM | TBD | Product direction, hypothesis ownership |
| Engineering | TBD | Technical scoping, feasibility |
| Design | TBD | UX research, mockups |

## Quick Links

- **Cycles**: [[cycles/_index|Cycle Registry]]
- **Validation**: [[validation/_index|Customer Feedback]]
- **Engineering**: [[engineering/_index|Technical Scoping]]
- **Decisions**: [[decisions/_index|Decision Log]]
- **External Docs**: [[confluence-refs/_index|Confluence References]]

## Active Hypotheses

```dataview
TABLE status, linked-cycle
FROM "workstreams/CRM/cycles"
WHERE contains(file.name, "hypothesis")
SORT file.ctime DESC
```

## Recent Updates

### 2026-01-18
- Workstream structure created
- Cycle 01 initialized

---

*Use [[cycles/_index|cycles]] to track lean startup iterations. All technical work should link back to a hypothesis.*
