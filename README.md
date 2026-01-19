# Executive Team Workspace

A collaborative workspace for Alex, Raghav, Martin, and Mike. Works with Obsidian and Claude.

## Quick Start

1. **Open this folder in Obsidian** - It will recognize all markdown files and enable backlinks
2. **Use `/save` in Claude** - Saves and shares your changes with the team
3. **Use `/sync` in Claude** - Gets the latest changes from others

## Folder Guide

| Folder              | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `Tasks/`            | Shared task tracking with status and assignments |
| `Reports/`          | Finalized reports and documents                  |
| `Notes/`            | Meeting notes and shared ideas                   |
| `private/`          | Local scratch space (not shared)                 |

## How to Work

### Creating a Task
Ask Claude to create a new task in `Tasks/`. It will use the correct format with frontmatter for status, assignees, and tags.

### Personal Notes
Work in `private/` for drafts.

### Sharing Your Work
1. Make your changes
2. Run `/save` in Claude
3. Done - your changes are shared

### Getting Updates
Run `/sync` in Claude to pull the latest from everyone else.

## Tips

- **Link files** using `[[filename]]` - Obsidian will create clickable links
- **Use tags** like `#urgent` or `#Q1-planning` - Obsidian indexes them automatically
- **Check `Tasks/_index.md`** for the full tag list and conventions
