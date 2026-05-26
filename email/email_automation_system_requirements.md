

---

## 1. Project Overview

### 1.1 Objective

Summary of the strategic pivot from third-party platforms to a proprietary solution to address specific insurance agency needs and competitor gaps.

### 1.2 Target Personas

- Agency Owners
- Individual Producers / Agents
- Customer Success Representatives (CSRs)

---

## 2. Functional Requirements

### Customer-Specific Requirements

#### The Insurance Center

Shawn described two specific campaign use cases tied to coverage limits:

- **Auto policies with state minimum limits:** They acquired an agency ~1 year ago and discovered minimum limits on some auto policies. Since Insurance Center doesn't offer minimum limits, they want to identify **everyone with state minimum auto limits** and send a campaign notifying them that limits will increase at next renewal.
- **Home policies with only $100,000 liability:** They want to pull **home customers with $100K liability** and send a campaign recommending at least $300K–$500K coverage.

The ideal data pull would include **both home and auto**.

---

#### Ley Insurance

Kyle wants to **review every recipient before sending** emails. He has tribal knowledge of certain clients (e.g., long-tenured customers who should not receive marketing correspondence).

> This is an available feature in **Agency Revolution** — manual review of campaign recipients before send.

---

#### Marker Insurance

Wants **custom tags for clients** to run targeted campaigns. Example use case: send a home inspection drip campaign for every home policy tagged as undergoing inspection, with the drip stopping once the policy is marked as inspection-complete in HawkSoft.

> **Agency Revolution has custom tags** within their interface, but **does NOT sync custom info back to HawkSoft** (confirmed by HawkSoft API team — not possible).
> 
> HawkSoft **substatus** is available as an alternative.

---

#### JAMCO

- Renewal emails must only go to recipients with relevant info
    - Remove from campaign once renewed (requires HawkSoft field discovery for the indicator)
    - ⚠️ **We need to map every trigger and filter condition for core partners (HawkSoft, Vertafore) and confirm exact field mappings**
- Wants content/newsletter campaigns
- Wants tagging support
- Needs custom sender specification (agent on policy, producer/CSR on customer, etc.)
- Prefers aggregated policy emails for same-date policies (e.g., one email for combined home + auto)

---

#### Katz Insurance — NASA Eclipse-Specific Field Requirements

1. **`email`**
    
    - First email flagged as default in `emailList` → `insuredEmailAddress` → `businessAccountIndividualEmailAddress`
    - Remaining `emailList` values stored as secondary
    - Trimmed, lowercased, deduplicated
2. **`displayName`**
    
    - Eclipse field: `Salutation` — intended to be the preferred individual's name or business name
3. **`gender`**
    
    - Sourced from the `driver` table in carrier downloads: `M`, `F`, `X` (non-binary), `U` (unknown), or blank
    - Available on auto policies; not reliably tied to insured/co-insured unless names match
4. **Policy Status** ⚠️ CRITICAL
    
    |Code|Meaning|
    |---|---|
    |1|Inactive (just entered, no billing — limbo state, NOT truly inactive)|
    |2|Active|
    |3|Canceled|
    |4|Non-renewed|
    
    - **Key nuance:** Past-renewal policies remain marked "active" in Eclipse until manually cleaned
    - **Requirement:** Do not use for resurrection/churn campaigns (Kayla's agency doesn't do this). Use inception and expiration dates for renewal triggers instead. Status-based future campaigns will require separate discovery.
5. **Policy Inception & Expiration Dates** ⚠️ CRITICAL
    
    - **Current behavior:**
        - Carrier downloads arrive 30–60 days ahead
        - Expiration date in Eclipse may already reflect the upcoming term
        - Kayla manually runs downloads daily (Eclipse doesn't auto-sync like AMS360)
    - **Requirement:**
        - Treat expiration date as "date through which policy is active"
        - Use for renewal notice triggers (e.g., 3 months before expiry)
        - Assume downloads happen daily; check for date changes on each pull
        - Safe to action on expiration date immediately upon sync
6. **Company Name vs. Writing Company** ⚠️ CRITICAL
    
    - **Current state:**
        - Direct carriers (Allied, Nationwide, Safeco, Progressive): use `company` field
        - Wholesalers (RT Specialty, Burns & Wilcox): use `writing_company` field
        - California Fair Plan edge case: may have dual policies
    - **Data quality issue:**
        - No visible flag in Eclipse UI to distinguish company vs. broker
        - Flag exists in the database but is not exposed to users
        - `writing_company` field is sometimes empty even when needed
    - **Requirement:**
        - **Phase 1 (Personal Lines):** Use `company` field; monitor for issues
        - **Phase 2 (Commercial):** Implement logic using the database flag:
            - If `company` = broker → pull `writing_company`
            - If `company` = direct → pull `company`

---

### 2.1 Data Architecture & Integration

- **AMS Bidirectional Sync:** Requirements for pushing activities, notes, and emails back to systems like QQ Catalyst or AMS360.
- **Direct AMS Data Access:** Eliminating field registration bottlenecks by accessing raw data.
- **Suppression Management:** Global and tenant-specific unsubscribe/bounce handling.

### 2.2 Automation & Trigger Logic

- **Event-Based Triggers:** Renewal windows, new policy issuance, and cross-sell gaps.
- **Dynamic CC**
- **Producer-Specific Logic:** Dynamic "From" and "Reply-To" assignment based on the agent assigned to the customer or policy.
- **Scheduling Controls:** Quiet hours, frequency capping, and timezone management.

### 2.3 Content & Template Management

- **Strong CS Management:** Robust internal tooling to allow CS to pull reports, confirm data sanity, resolve mapping issues, and create verification solutions to build customer confidence.
- **Flexible Template Engine:** Support for custom HTML, standard editors, and dynamic tokens.
- **Brand Consistency:** Multi-tenant support for logos, brand colors, and disclaimers.

### 2.4 Deliverability & Domain Management

- **Pixel Tracking on Emails:** Open rates and engagement events
- **Bring Your Own Domain (BYOD):** Dedicated sending domains and subdomains for improved inbox placement.
    - Most importantly: **run campaigns out of a user's existing inbox**
    - Reference: https://help.levitate.ai/article/33-connect-your-email-to-levitate
- **[Low Pri] Authentication Support:** Automated wizard for SPF, DKIM, and DMARC verification.
- **[Low Pri] Reputation Monitoring:** Warm-up services and complaint-based auto-pausing.

---

## 3. Reporting & Visibility

### 3.1 Engagement Metrics

- Delivery, open, click, and reply tracking
- Sync with AMS
- Audit logs for compliance and regulatory tracking

### 3.2 Employee-Level Insights

- Interfaces for individual agents to view correspondence for their specific book of business

---

## 4. Open Questions & Risks

- **Legacy Data Migration:** Process for importing historical unsubscribe lists and contact data.
- **Carrier Co-op Compliance:** Requirements for co-branded assets and proof-of-performance for carrier reimbursement.
- **API Limitations:** Workarounds for gated APIs (e.g., Zywave) or poor integrations with specific AMS platforms.