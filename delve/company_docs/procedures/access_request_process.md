# Access Request Process

| Field   | Value                      |
|---------|----------------------------|
| Date    | 2026-03-09                 |
| Version | 1.0                        |
| Owner   | Alex Kumamoto (CTO/CISO)  |

## Purpose

Define how access to company systems is requested, approved, provisioned, modified, and revoked. All access follows the principle of least privilege -- grant only the minimum access required for the role.

## Procedure

### Requesting New Access

1. **Requestor submits an access request** via [Slack workflow / Jira ticket / form -- TBD] specifying:
   - System or resource
   - Level of access needed (read, write, admin, etc.)
   - Business justification
2. **Manager or CISO reviews and approves or denies** the request.
3. **System owner provisions access** per the approved request.
4. **Request and approval are recorded** in [tracking system -- TBD] for audit evidence.

### Modifying Access (Role Changes)

1. Manager submits a modification request following the same flow above.
2. Specify what access is being added and what existing access is no longer needed.
3. Old access that is no longer required for the new role is revoked as part of the same request.

### Revoking Access

- For departures: follow the Access Control and Termination Policy (same-day revocation).
- For role changes: revoke unnecessary access as described above.
- For policy violations: CISO may revoke access immediately without a request.

### Least-Privilege Principle

- Default to the lowest level of access that allows the person to do their job.
- Admin and production access require explicit CISO approval.
- Shared accounts are discouraged; individual accounts are required for audit traceability.

---

## Open Questions

- What tool will we use for access requests (Slack workflow, Jira, Google Form)?
- Who are the designated approvers for each critical system?
