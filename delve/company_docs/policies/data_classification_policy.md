# Data Classification Policy

| Field   | Value                |
|---------|----------------------|
| Date    | 2026-03-09           |
| Version | 1.0                  |
| Owner   | Alex Kumamoto (CISO) |

## Purpose

This policy defines how PolicyLift classifies information assets based on sensitivity and business value. It establishes handling requirements for each classification tier to protect data appropriately throughout its lifecycle.

## Scope

This policy applies to all data created, received, maintained, or transmitted by PolicyLift, regardless of format or storage location. All personnel, contractors, and third parties with access to PolicyLift data must comply.

## Classification Tiers

| Tier         | Definition                                                                 | Examples                                                        |
|--------------|----------------------------------------------------------------------------|-----------------------------------------------------------------|
| Public       | Information intended for public consumption. No special handling required.  | Marketing materials, public documentation, blog posts           |
| Internal     | General business information not intended for public release. Share freely within PolicyLift; do not share externally without approval. | Internal comms, meeting notes, non-sensitive configs, roadmaps  |
| Confidential | Sensitive business or customer information. Encrypt at rest and in transit. Access restricted to need-to-know. Do not share externally without CISO/CEO approval and NDA. | Customer data, financial records, contracts, source code, credentials |
| Restricted   | Highest sensitivity. Encrypt at rest and in transit. Access strictly limited, logged, and reviewed. No external sharing except under legal obligation with CEO approval. | PII, authentication secrets, encryption keys, security audit results |

## Handling Requirements

| Tier         | Storage                                | Transmission                       | Access Control                          | Sharing                                              | Disposal                                |
|--------------|----------------------------------------|------------------------------------|-----------------------------------------|------------------------------------------------------|-----------------------------------------|
| Public       | No restrictions                        | No restrictions                    | No restrictions                         | Open                                                 | No special requirements                 |
| Internal     | Approved platforms only                | Standard channels (Slack, email)   | All PolicyLift personnel                | Internal only; external requires manager approval    | Delete when no longer needed            |
| Confidential | Encrypted at rest on approved platforms| Encrypted in transit (TLS/SSH)     | Need-to-know, role-based access         | External only with CISO/CEO approval and NDA in place| Secure deletion; confirm removal        |
| Restricted   | Encrypted at rest, access logged       | Encrypted in transit, no email     | Strictly need-to-know, access reviewed quarterly | No external sharing except under legal obligation with CEO approval | Secure deletion with verification; log disposal |

## Labeling

Documents and data stores should be labeled with their classification tier where practical (e.g., in document headers, repository descriptions, or folder names). If data is not explicitly labeled, it defaults to **Internal** classification and must be handled accordingly.

## Asset Ownership

Every information asset must have a designated owner responsible for:

- Assigning and maintaining the correct classification tier
- Reviewing and approving access to the asset
- Ensuring handling requirements are followed
- Reviewing classification and access at least annually

Asset owners are recorded in the [[information_asset_inventory]].

## Third-Party Sharing

Confidential and Restricted data may only be shared with third parties when all of the following conditions are met:

1. A signed NDA or contractual agreement with appropriate security provisions is in place
2. The third party has been assessed per PolicyLift's vendor management process
3. Sharing has been approved by the CISO (Confidential) or CEO (Restricted)
4. Data is transmitted using approved encrypted channels

## Training

All personnel must understand and follow this policy. Data classification requirements are covered in PolicyLift's security awareness training program, which all employees complete at onboarding and annually thereafter.

## Review

This policy is reviewed annually by the CISO, or sooner if there is a material change to PolicyLift's data environment, regulatory obligations, or business operations.

---

## Open Questions

- Do we handle any Restricted-tier data today beyond credentials/keys? (e.g., do we store end-user PII directly?)
- Should source code be classified as Confidential or Internal? (Currently listed as Confidential.)
- Are there any data types we are unsure how to classify?
- Do any insurance-industry regulations impose specific classification or handling requirements we need to account for?
