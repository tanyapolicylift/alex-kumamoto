# Approved Tools List

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |

## Purpose

This document defines the approved software and cloud services authorized for use in PolicyLift business operations. All personnel must use only approved tools for company work to maintain security posture and SOC 2 compliance.

## Approved Tools

| Tool/Service       | Category              | Purpose                          | MFA Enforced | SOC 2 Status | Owner           |
|--------------------|-----------------------|----------------------------------|--------------|--------------|-----------------|
| [AWS/GCP]          | Cloud Infrastructure  | Production hosting and services  | [TBD]        | [TBD]        | Yurii Kabannik  |
| GitHub             | Source Code Management| Code hosting and version control | Yes          | [TBD]        | Alex Kumamoto   |
| [TBD]              | CI/CD                 | Build and deployment automation  | [TBD]        | [TBD]        | Yurii Kabannik  |
| Slack              | Communication         | Team messaging                   | [TBD]        | [TBD]        | Mike Levene     |
| Google Workspace   | Email / Docs          | Email, calendar, document collaboration | [TBD] | [TBD]        | Mike Levene     |
| [TBD]              | Password Manager      | Credential storage and sharing   | [TBD]        | [TBD]        | Alex Kumamoto   |
| [TBD]              | Project Management    | Task and project tracking        | [TBD]        | [TBD]        | Mike Levene     |
| [TBD]              | HR / Payroll          | Employee management and payroll  | [TBD]        | [TBD]        | Mike Levene     |
| [TBD]              | Compliance Platform   | SOC 2 evidence collection and monitoring | [TBD] | [TBD]       | Alex Kumamoto   |
| [TBD]              | Monitoring / Logging  | Application and infrastructure monitoring | [TBD] | [TBD]      | Yurii Kabannik  |
| [TBD]              | VPN                   | Secure remote access             | [TBD]        | [TBD]        | Alex Kumamoto   |
| [TBD]              | Endpoint Protection   | Antivirus / EDR for company devices | [TBD]    | [TBD]        | Alex Kumamoto   |
| [TBD]              | Security Training     | Security awareness training      | [TBD]        | [TBD]        | Alex Kumamoto   |
| [TBD]              | Status Page           | Public-facing service status     | [TBD]        | [TBD]        | Yurii Kabannik  |

## Unapproved Software

Software and cloud services not listed above must not be used for PolicyLift business without prior CISO approval. This includes:

- Personal accounts on file-sharing services (Dropbox, personal Google Drive, etc.)
- Unapproved messaging platforms
- Browser extensions that access company data
- AI tools not explicitly approved for use with company or customer data

To request approval for a new tool, contact the CISO with the tool name, intended use, and whether it will process or store company or customer data.

## Review

This list is reviewed annually by the CISO, and updated whenever new tools are adopted or existing tools are deprecated.

---

## Open Questions

- What is our full current tool stack? (Need to fill in all [TBD] entries.)
- Which password manager will we standardize on? (1Password, Bitwarden, or other?)
- Which compliance platform are we using or evaluating? (Vanta, Drata, or other?)
- Which endpoint protection tool will we deploy?
- Do we need a VPN, or is our architecture fully zero-trust?
- Are there any tools currently in use that should be reviewed or removed?
