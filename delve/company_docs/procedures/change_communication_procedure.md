# Change Communication Procedure

| Field   | Value                      |
|---------|----------------------------|
| Date    | 2026-03-09                 |
| Version | 1.0                        |
| Owner   | Mike Levene (Head of Ops)  |

## Purpose

Define how changes, outages, and releases are communicated to employees and customers so that affected parties receive timely, accurate information.

## Procedure

### Planned Maintenance

1. Post to the status page at least 24 hours in advance with expected start time, duration, and impact.
2. Notify the team via the #engineering Slack channel.
3. If customer-facing downtime is expected, email affected customers with the maintenance window and expected impact.

### Unplanned Outages

1. Update the status page immediately once the outage is confirmed.
2. Post in #incidents on Slack with current status and estimated time to resolution.
3. Update the status page as the situation evolves.
4. After resolution, email affected customers with a summary: what happened, duration, resolution, and any follow-up actions.

### Major Releases with Customer Impact

1. Announce via email or in-app notification before the release goes live.
2. Update the changelog and relevant documentation.
3. Post in #general on Slack so the full team is aware.

### Security Events Affecting Customers

1. Follow the communication section of the Incident Response Playbook.
2. Coordinate external messaging through the CTO and CEO before sending.
3. Notify affected customers within the timeline required by applicable regulations and contracts.

---

## Open Questions

- What is our status page provider (e.g., Statuspage, Instatus, BetterStack)?
- Do we have a customer email list or announcement tool (e.g., Customer.io, Mailchimp, in-app system)?
