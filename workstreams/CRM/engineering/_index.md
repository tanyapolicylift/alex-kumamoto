---
created: 2026-01-18
author: Claude
type: dashboard
tags: [CRM, engineering]
---

# Engineering Overview

Technical scoping and specifications for the CRM workstream.

## Status

| Area | Status | Notes |
|------|--------|-------|
| Scoping | 🟡 Not Started | Awaiting validated hypothesis |
| Specs | ⚪ Pending | Blocked on scoping |
| Dependencies | ⚪ Unknown | Needs investigation |

## Folder Structure

```
engineering/
├── scoping/       # Technical estimates and feasibility
├── specs/         # Approved technical specifications
└── dependencies/  # External blockers and integrations
```

## Conventions

### Scoping Documents

All scoping documents MUST include frontmatter:

```yaml
---
linked-hypothesis: [[../cycles/YYYY-MM-cycle-NN/hypothesis]]
status: draft | in-review | approved
estimated-effort: S | M | L | XL
confidence: low | medium | high
---
```

### Linking to Product Intent

Every technical decision should trace back to a hypothesis:

1. Find the relevant cycle in [[../cycles/_index|Cycle Registry]]
2. Link to the hypothesis in your document's frontmatter
3. Reference specific assumptions you're addressing

## Active Scoping

```dataview
TABLE linked-hypothesis, status, estimated-effort
FROM "workstreams/CRM/engineering/scoping"
SORT file.ctime DESC
```

## Quick Links

- [[scoping/2026-01-18-scoping-template|Scoping Template]]
- [[../cycles/_index|Cycle Registry]]
- [[../confluence-refs/_index|Confluence References]]
