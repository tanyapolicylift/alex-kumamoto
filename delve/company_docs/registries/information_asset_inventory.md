# Information Asset Inventory

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |

## Purpose

This inventory catalogs all information assets owned or operated by PolicyLift. It provides the basis for data classification, access control decisions, and risk assessment activities.

## Asset Inventory

| Asset ID | Asset Name                | Type           | Description                              | Classification Tier | Owner           | Storage Location | Access Method             | Last Reviewed |
|----------|---------------------------|----------------|------------------------------------------|---------------------|-----------------|------------------|---------------------------|---------------|
| A-001    | Production Application    | Application    | Customer-facing web application          | Confidential        | [TBD]           | [Cloud region]   | [Access method]           | [TBD]         |
| A-002    | Production Database       | Database       | Primary customer data store              | Restricted          | [TBD]           | [Cloud region]   | [Access method]           | [TBD]         |
| A-003    | Source Code Repository    | Repository     | Application source code                  | Confidential        | Alex Kumamoto   | GitHub           | GitHub access controls    | [TBD]         |
| A-004    | Internal Documentation    | Document Store | Company wiki and internal docs           | Internal            | [TBD]           | [Platform]       | [Access method]           | [TBD]         |
| A-005    | CI/CD Pipeline            | Service        | Build and deployment automation          | Confidential        | [TBD]           | [Platform]       | [Access method]           | [TBD]         |
| A-006    | Secrets Management        | Service        | Storage of API keys, credentials, certs  | Restricted          | [TBD]           | [Platform]       | [Access method]           | [TBD]         |
| A-007    | Log Aggregation           | Service        | Centralized application and audit logs   | Confidential        | [TBD]           | [Platform]       | [Access method]           | [TBD]         |
| A-008    | Backup Storage            | Service        | Database and application backups         | Restricted          | [TBD]           | [Cloud region]   | [Access method]           | [TBD]         |
| A-009    | [TBD]                     | [TBD]          | [TBD]                                    | [TBD]               | [TBD]           | [TBD]            | [TBD]                     | [TBD]         |

## Data Flow Summary

Data flow diagrams should be maintained to document how data moves between systems, including:

- Customer data ingestion and storage paths
- Internal data flows between application components
- Data shared with or accessible by third-party services
- Backup and replication flows

**[Data flow diagrams to be created and linked here.]**

## Review

This inventory is reviewed annually as part of the formal risk assessment process, and updated whenever new systems are deployed or decommissioned.

---

## Open Questions

- What are all production systems and databases in use?
- What SaaS tools store customer data?
- Where does sensitive data flow between systems?
- Who are the appropriate owners for each asset?
- Do we have a current architecture or data flow diagram to reference?
