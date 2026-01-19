---
name: save
description: Commit all changes and push to share with the team
---

# Save Skill

Save and share all your changes with the team.

## Steps

1. Check for any changes using `git status`
2. If there are changes:
   - Stage all changes: `git add -A`
   - Create a commit with an auto-generated message describing the changes
   - Push to remote: `git push`
3. Confirm success to the user

## Commit Message Format

Generate a brief, descriptive commit message based on what changed. Examples:
- "Add task: Q1 budget review"
- "Update meeting notes for 2026-01-16"
- "Add report: monthly metrics"

## Error Handling

- If push fails due to remote changes, tell the user to run `/sync` first
- If there are no changes, let the user know everything is already saved
