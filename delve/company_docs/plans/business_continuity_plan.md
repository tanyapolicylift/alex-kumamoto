# Business Continuity Plan

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |
| Status  | Draft                |

---

## Purpose

This plan defines how PolicyLift maintains critical business operations during and after a significant disruption. It covers activation criteria, communication procedures, and continuity strategies for key business functions.

## Scope

This plan applies to all PolicyLift business operations, systems, and personnel. It is activated when a disruption exceeds normal incident response capabilities or duration thresholds.

---

## BC/DR Team and Roles

Roles are defined in [[role_assignments]]. Key assignments:

| Role | Person | Responsibilities |
|---|---|---|
| Incident Commander | Alex Kumamoto | Overall coordination, decision authority, severity classification |
| Communications Lead | Mike Levene | Internal and external notifications, status page updates, customer communication |
| Technical Recovery Lead | Yurii Kabannik | System restoration, failover execution, data integrity verification |
| Executive Sponsor | Raghav Bansal | Business decisions, regulatory/legal coordination, external stakeholder communication |

---

## Activation Criteria

This plan is activated when any of the following occur:

1. **Extended outage** -- primary systems unavailable for more than 4 hours with no clear resolution timeline
2. **Confirmed data breach** -- unauthorized access to customer data requiring containment and notification
3. **Natural disaster** -- event affecting the physical ability of the team to operate (earthquake, severe weather, power grid failure)
4. **Cloud provider failure** -- major outage at our cloud provider affecting our primary region
5. **Key personnel unavailability** -- multiple critical team members simultaneously unavailable
6. **Ransomware or destructive attack** -- malicious encryption or destruction of production systems

The Incident Commander (Alex Kumamoto) makes the activation decision. In Alex's absence, Yurii Kabannik activates.

---

## Communication Plan

### Internal Notification

1. **Primary channel:** #incidents Slack channel -- post situation summary immediately
2. **Backup channel:** Phone tree (see Emergency Contact List below)
3. **Cadence:** Status updates every 2 hours during active incident, or as significant developments occur

**Phone tree order:** Alex Kumamoto -> Raghav Bansal -> Yurii Kabannik -> Mike Levene

### External Notification

1. **Status page:** Update public status page within 1 hour of confirmed customer impact. Provider: [TBD]
2. **Customer email:** For incidents affecting customer data or extended service disruption (>4 hours), send customer notification drafted by Mike Levene and approved by Raghav Bansal
3. **Partners/vendors:** Notify affected partners as needed

### Regulatory Notification

- If customer personal data is compromised, follow breach notification requirements under applicable state laws (notification timelines vary; many states require notification within 30-60 days of discovery)
- Raghav Bansal coordinates with legal counsel on regulatory notification obligations
- Document all notification decisions and timestamps

---

## Critical Business Functions

Refer to [[business_impact_analysis]] for the full assessment. Summary of priority order:

1. Customer-facing application
2. Customer data storage
3. Authentication / SSO
4. Payment processing
5. Internal communications
6. CI/CD pipeline
7. Monitoring and alerting

---

## Continuity Procedures

### If Primary Cloud Region Is Unavailable

1. Technical Recovery Lead initiates failover to secondary region [region TBD]
2. Update DNS to point to secondary region
3. Verify all services are healthy in secondary region
4. Notify team via Slack (or backup channel) that failover is complete

### If Primary Communication Tools (Slack) Are Unavailable

1. Fall back to [alternate communication tool -- TBD, e.g., Microsoft Teams, Discord, phone/SMS]
2. Incident Commander sends SMS to all team members with alternate channel instructions
3. Use email as secondary backup

### If Key Personnel Are Unavailable

1. Refer to role backup assignments in [[role_assignments]]
2. Cross-trained team members assume responsibilities per documented succession

### If Office / Work Location Is Inaccessible

PolicyLift operates as a remote-first / cloud-native company. No single physical location is required for operations. Team members work from any location with internet access.

---

## Recovery Priorities

Recovery follows the priority order established in the BIA. General approach:

1. Restore authentication and data storage first (everything else depends on these)
2. Restore customer-facing application
3. Restore payment processing
4. Restore internal tools and CI/CD
5. Return to normal operations and conduct post-incident review

Detailed recovery procedures are in [[disaster_recovery_plan]].

---

## Emergency Contact List

| Name | Role | Phone | Email | Alternate Contact |
|---|---|---|---|---|
| Alex Kumamoto | CTO / CISO | [Phone TBD] | [Email TBD] | [Alternate TBD] |
| Raghav Bansal | CEO | [Phone TBD] | [Email TBD] | [Alternate TBD] |
| Yurii Kabannik | Chief Engineering Architect | [Phone TBD] | [Email TBD] | [Alternate TBD] |
| Mike Levene | Head of Operations | [Phone TBD] | [Email TBD] | [Alternate TBD] |
| Cloud Provider Support | AWS/GCP Support | [Phone TBD] | [Email TBD] | [Support portal URL TBD] |
| Insurance Carrier | Cyber Insurance | [Phone TBD] | [Email TBD] | [Claims contact TBD] |
| Legal Counsel | Outside Counsel | [Phone TBD] | [Email TBD] | [Alternate TBD] |
| FBI Cyber Division | Law Enforcement | N/A | https://ic3.gov | Local FBI field office: [TBD] |

---

## Testing

- This plan will be **tested annually** via a tabletop exercise simulating a disruption scenario.
- Test results will be documented, including: scenario description, participants, findings, and action items.
- The plan will be reviewed and updated after each test, or after any real activation.
- Next scheduled test: [TBD]

---

## Open Questions

- What is our cloud provider -- AWS, GCP, or both?
- What is our insurance carrier contact info? Do we have cyber insurance?
- Do we have legal counsel contact info for breach notification?
- What alternate communication tools do we use if Slack is down?
- What is our secondary region / failover strategy? Is it configured today?
- What is our status page provider?
- Should we establish a physical meetup location for extreme scenarios, or is fully remote sufficient?

---

*Satisfies: BC/DR #2, #7, #9; Incident Response #10*
