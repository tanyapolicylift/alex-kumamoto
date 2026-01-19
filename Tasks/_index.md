# Task System

This folder contains shared tasks for the team. Each task is a dated markdown file with YAML frontmatter.

## File Naming

`YYYY-MM-DD-task-description.md`

Example: `2026-01-16-review-q1-budget.md`

## Task Template

```markdown
---
created: 2026-01-16
author: Alex
status: open
assignees: [Raghav, Mike]
tags: [Q1-planning, budget]
depends_on: []
---

# Task Title

## Description
What needs to be done.

## Dependencies
- [[2026-01-15-related-task]] - Why it's needed

## Updates
### 2026-01-16 - Alex
Initial task creation.
```

## Status Values

| Status | Meaning |
|--------|---------|
| `open` | Not yet started |
| `in-progress` | Someone is actively working on it |
| `blocked` | Waiting on something else |
| `done` | Completed |

## Tag Reference

### Project Tags
- `#Q1-planning` - Q1 planning activities
- `#product-launch` - Product launch related
- `#hiring` - Hiring and recruiting
- `#budget` - Budget and finance
- `#strategy` - Strategic planning

### Type Tags
- `#decision` - Needs a decision
- `#action` - Action item to complete
- `#review` - Needs review/approval
- `#discussion` - Needs team discussion

### Priority Tags
- `#urgent` - High priority, needs immediate attention
- `#low-priority` - Can wait, no rush

## Tips

- Use `[[wikilinks]]` to link to related tasks
- Add updates under the Updates section instead of editing the description
- In Obsidian, use the tag pane to filter tasks by tag
- Use the graph view to see task dependencies
