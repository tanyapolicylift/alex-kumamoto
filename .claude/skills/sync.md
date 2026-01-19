---
name: sync
description: Pull the latest changes from the team
---

# Sync Skill

Get the latest changes from everyone on the team.

## Steps

1. Check current status with `git status`
2. If there are uncommitted local changes, warn the user and suggest running `/save` first
3. Pull latest changes: `git pull`
4. Report what changed (new files, updated files)

## Conflict Handling

If there are merge conflicts:

1. List the conflicted files
2. Explain in simple terms: "Both you and someone else edited the same file"
3. For each conflict, show the two versions and ask which to keep
4. After resolving, commit the merge resolution

## Success Message

Tell the user:
- How many files were updated
- Any new files that appeared
- If everything was already up to date
