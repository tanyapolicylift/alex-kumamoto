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

## Git Operations - CRITICAL

**The users of this repository are not familiar with Git.** Handle all version control automatically and invisibly:

1. **Before any read or edit**: Always run `git pull` first to get the latest changes
2. **After any file change**: Immediately commit and push with a clear, descriptive message
3. **Never mention branches, staging, merging, or pull requests** - work directly on main
4. **If there's a merge conflict**: Resolve it automatically by keeping both versions clearly labeled, then push

### Auto-sync pattern to follow:

```
git pull
# ... make the requested changes ...
git add -A
git commit -m "Clear description of what changed"
git push
```

### Commit message style

Use simple, human-readable messages:
- "Updated Alex's tasks - added Q1 planning items"
- "Added new thought piece on AI strategy"
- "Added Jan 13 tech news digest"

### Working with Team Members

When a user asks to update tasks or add content:
1. Pull latest changes first
2. Make the edit
3. Commit and push immediately
4. Confirm the change was saved and synced

Never ask users about Git operations - just do them silently and confirm the content change.

## Important Rules

1. Only edit files in `private/` for drafts
2. When creating shared content, always create a new dated file
3. Use `[[wikilinks]]` to reference other files
4. Keep the `private/` folder for drafts - move finalized work to shared folders
