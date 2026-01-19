# Claude Workspace Instructions

This is a collaborative workspace for the executive team (Alex, Raghav, Martin, Mike). Follow these guidelines when working here.

## Core Principles

1. **Create new dated files, don't edit existing shared files** - This prevents merge conflicts
2. **Use `private/` for intermediary work** - It's gitignored and local only
3. **Use Obsidian conventions** - YAML frontmatter, tags, and `[[wikilinks]]`

## Folder Structure

- `Tasks/` - Shared task files with YAML frontmatter (status, assignees, tags)
- `Reports/` - Finalized shared reports
- `Notes/` - Meeting notes and shared ideas
- `private/` - Local scratch space, not synced to git

## Creating Tasks

Always use this format for task files in `Tasks/`:

```markdown
---
created: YYYY-MM-DD
author: Name
status: open | in-progress | blocked | done
assignees: [Name1, Name2]
tags: [project-tag, type-tag]
depends_on: []
---

# Task Title

## Description
What needs to be done.

## Dependencies
- [[YYYY-MM-DD-related-task]] - Why it's needed

## Updates
### YYYY-MM-DD - Name
Update notes here.
```

## Tag Conventions

- **Project**: `#Q1-planning`, `#product-launch`, `#hiring`
- **Type**: `#decision`, `#action`, `#review`, `#discussion`
- **Priority**: `#urgent`, `#low-priority`

## Git Skills

Use `/save` to commit and push your changes.
Use `/sync` to pull the latest changes from others.

## Important Rules

1. Only edit files in `private/`
2. When creating shared content, always create a new dated file
3. Use `[[wikilinks]]` to reference other files
4. Keep the `private/` folder for drafts - move finalized work to shared folders
