# Emergency Change Procedure

| Field   | Value                  |
|---------|------------------------|
| Date    | 2026-03-09             |
| Version | 1.0                    |
| Owner   | Alex Kumamoto (CTO/CISO) |

## Purpose

Define the process for implementing emergency changes that cannot follow the normal PR approval flow due to active incidents, critical security vulnerabilities, or production-down scenarios.

## Procedure

### 1. Obtain Verbal Approval

Contact the CTO (Alex Kumamoto) via Slack or phone. Clearly state:
- What system is affected
- What change is needed
- Why it cannot wait for normal review

The CTO gives verbal or chat-based approval to proceed.

### 2. Implement the Fix

Make the minimum change necessary to resolve the issue. Deploy through the standard pipeline if possible; direct production access is permitted only if the pipeline itself is broken.

### 3. Create a Retrospective PR (Within 24 Hours)

Open a pull request that documents:
- **What changed** -- the code diff and any infrastructure modifications
- **Why it was urgent** -- the incident or risk that triggered the emergency
- **Who approved verbally** -- name, channel/method, and approximate time
- **Root cause** -- preliminary understanding of what caused the issue

### 4. CTO Formally Approves the Retrospective PR

The CTO reviews the retrospective PR for correctness and completeness, then approves and merges it. This closes the audit trail gap.

### 5. Post-Mortem (If Applicable)

If the emergency change caused any secondary issues (degraded performance, data inconsistency, new bugs), conduct a post-mortem following the Incident Response Playbook. Document lessons learned and any process improvements.
