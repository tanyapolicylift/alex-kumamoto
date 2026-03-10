# Disaster Recovery Plan

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |
| Status  | Draft                |

---

## Purpose

This plan defines the technical procedures for recovering PolicyLift's infrastructure and data after a disaster or major outage. It complements the [[business_continuity_plan]], which covers broader business operations.

## Scope

Covers all production infrastructure, databases, application services, and supporting systems operated by PolicyLift.

---

## DR Team

Same as the BC/DR team defined in [[role_assignments]]:

| Role | Person |
|---|---|
| Incident Commander | Alex Kumamoto |
| Technical Recovery Lead | Yurii Kabannik |
| Communications Lead | Mike Levene |
| Executive Sponsor | Raghav Bansal |

---

## Infrastructure Overview

Document the following for all production systems:

| Component | Details |
|---|---|
| Cloud Provider | [AWS / GCP / both -- TBD] |
| Primary Region | [TBD] |
| Secondary Region | [TBD] |
| Compute | [ECS / EKS / Cloud Run / EC2 / etc. -- TBD] |
| Database(s) | [RDS / DynamoDB / Cloud SQL / etc. -- TBD] |
| Object Storage | [S3 / GCS -- TBD] |
| CDN | [CloudFront / Cloud CDN / other -- TBD] |
| DNS | [Route 53 / Cloud DNS / other -- TBD] |
| IaC Tool | [Terraform / Pulumi / CloudFormation / CDK -- TBD] |
| Container Registry | [ECR / GCR / other -- TBD] |
| Secrets Management | [AWS Secrets Manager / GCP Secret Manager / Vault -- TBD] |
| Monitoring | [CloudWatch / Datadog / other -- TBD] |

---

## Backup Strategy

### Databases

| Item | Value |
|---|---|
| Backup method | [Automated snapshots / continuous replication -- TBD] |
| Backup frequency | [TBD -- e.g., continuous, hourly, daily] |
| Retention period | [TBD -- e.g., 30 days] |
| Cross-region replication | [Yes/No -- TBD] |
| Encryption | Backups encrypted at rest using [KMS key / provider-managed key -- TBD] |

### Object Storage

| Item | Value |
|---|---|
| Versioning | [Enabled/Disabled -- TBD] |
| Cross-region replication | [Yes/No -- TBD] |
| Retention period | [TBD] |

### Application Configuration and Code

| Item | Value |
|---|---|
| Source code | GitHub (cloud-hosted, inherently backed up) |
| Infrastructure as Code | [Stored in Git -- TBD] |
| Secrets | [Backed up via provider -- TBD] |

### Backup Verification

- Backups are monitored for completion via [monitoring tool -- TBD]
- Failed backup alerts are sent to [alert channel -- TBD]
- Backup integrity is verified during annual restoration test

---

## Recovery Procedures

### Scenario 1: Database Failure

**Trigger:** Primary database instance is unresponsive or corrupted.

1. **Detect** -- Monitoring alerts on database health check failure
2. **Assess** -- Determine if the issue is instance-level or data-level
3. **Failover** -- If a read replica or standby exists, promote it to primary
   - [Specific failover command/procedure -- TBD]
4. **Verify** -- Run data integrity checks against known-good state
5. **Update configuration** -- Point application to new primary endpoint if needed
6. **Notify** -- Inform team via #incidents Slack channel
7. **Document** -- Log timeline, actions taken, and root cause

**If no replica is available:**
1. Restore from most recent backup snapshot
2. Accept data loss up to RPO (see [[business_impact_analysis]])
3. Verify data integrity
4. Resume normal operations

### Scenario 2: Application Server Failure

**Trigger:** Application containers/instances failing health checks.

1. **Detect** -- Health check failures trigger alerts
2. **Auto-recovery** -- Container orchestrator ([ECS/EKS/Cloud Run -- TBD]) automatically restarts failed containers or launches replacements
3. **Verify** -- Confirm health checks pass on replacement instances
4. **Scale** -- If auto-scaling is insufficient, manually scale up
5. **Investigate** -- Determine root cause (bad deploy, resource exhaustion, dependency failure)
6. **Rollback** -- If caused by a deployment, roll back to previous known-good version
   - [Specific rollback command/procedure -- TBD]

### Scenario 3: Full Region Outage

**Trigger:** Cloud provider region is unavailable.

1. **Confirm** -- Verify outage via cloud provider status page and independent checks
2. **Activate** -- Incident Commander activates [[business_continuity_plan]]
3. **Failover** -- Technical Recovery Lead initiates region failover:
   - Deploy infrastructure in secondary region using IaC ([procedure TBD])
   - Restore database from cross-region replica or backup
   - Update DNS records to point to secondary region
   - [Specific failover runbook -- TBD]
4. **Verify** -- Confirm all services are healthy in secondary region
5. **Notify** -- Update status page and notify customers per [[business_continuity_plan#Communication Plan]]
6. **Monitor** -- Watch for primary region recovery
7. **Failback** -- Once primary region is stable, plan and execute failback during low-traffic window

### Scenario 4: Data Corruption

**Trigger:** Data integrity issue discovered (accidental deletion, bad migration, malicious modification).

1. **Stop the bleeding** -- Identify and halt the process causing corruption
2. **Assess scope** -- Determine which data is affected and time range
3. **Preserve evidence** -- Snapshot current state before any restoration (for forensic analysis if needed)
4. **Restore** -- Restore affected data from backup to a point before corruption occurred
   - Restore to an isolated environment first
   - Verify data integrity in isolated environment
   - Apply restoration to production
5. **Verify** -- Confirm data integrity and application functionality
6. **Root cause** -- Investigate how corruption occurred; implement preventive measures
7. **Document** -- Full post-incident report

---

## RPO / RTO Targets

Refer to [[business_impact_analysis]] for targets by business function. Summary:

| Business Function | RPO | RTO |
|---|---|---|
| Customer-facing application | [TBD] | [TBD] |
| Customer data storage | [TBD] | [TBD] |
| Authentication / SSO | [TBD] | [TBD] |
| Payment processing | [TBD] | [TBD] |
| Internal communications | [TBD] | [TBD] |

---

## Backup Restoration Testing

Annual test procedure:

1. **Select** -- Choose a recent production backup (database and/or object storage)
2. **Restore** -- Restore the backup to an isolated environment (separate VPC / project, no production access)
3. **Verify** -- Run the following checks:
   - Database record counts match expected values
   - Sample queries return expected data
   - Application can connect and serve requests against restored data
   - No corruption or missing data detected
4. **Document** -- Record results including: date, backup selected, restoration time, issues encountered, pass/fail
5. **Remediate** -- If issues are found, investigate and fix the backup process
6. **Report** -- Share results with team; file in compliance evidence

Next scheduled test: [TBD]

---

## Communication During DR

Follow the communication plan in [[business_continuity_plan#Communication Plan]]:

- Internal updates via #incidents Slack channel (or backup channel if Slack is down)
- Customer-facing updates via status page and email for service-affecting incidents
- Regulatory notification as required

---

## Open Questions

- What databases do we run (RDS, DynamoDB, Cloud SQL, etc.)?
- What is our IaC tool (Terraform, Pulumi, CloudFormation, CDK)?
- What is our current backup frequency and retention policy?
- Do we have a secondary region configured today?
- What is our container orchestration platform (ECS, EKS, Cloud Run, etc.)?
- Do we have cross-region replication enabled for databases and object storage?
- What is the procedure for DNS failover -- manual or automated?
- Do we have runbooks for common operational tasks that should be referenced here?

---

*Satisfies: BC/DR #3, #4, #5, #6; Baseline Hardening #9*
