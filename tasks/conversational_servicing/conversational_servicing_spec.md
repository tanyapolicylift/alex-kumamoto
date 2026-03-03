---
created: 2026-03-03
author: Alex
status: in-progress
assignees: [Alex, Raghav]
tags: [conversational-servicing, payments, coi, product-spec]
depends_on: []
---

# Conversational Servicing Spec: Payments & COI Intake

> **Scope**: This spec covers two servicing modules — **Payments** and **COI Intake** — for the voice AI assistant used by independent insurance agencies. Personal lines (home & auto) are the primary focus. Commercial lines are referenced where relevant (particularly for COI). All other servicing use cases (claims, endorsements, ID cards, policy questions) are handled by a separate project and are **out of scope**.

---

## 1. Overview & Vision

### What Is Conversational Servicing?

Conversational servicing is the capability for an AI voice agent — already deployed to handle inbound calls at independent agencies — to **resolve routine service requests** without transferring to a human. Today, the agent handles quoting. This spec extends it into servicing, starting with the two highest-value, most tractable use cases.

### The Data Case

Analysis of three months of completed call data across agencies reveals:

| Call Reason | % of Completed Calls |
|---|---|
| Quotes | 27% |
| **Payments** | **16%** |
| Policy Questions | 16% |
| Speak with Agent | 14% |
| Claims | 4% |
| Other / Non-actionable | 23% |

**Payment-related calls represent the same volume as quoting inquiries.** These calls follow predictable patterns and can be resolved with structured information delivery — making them ideal for automation.

COI requests, while less frequent in the call log data, represent a high-value servicing action: each COI request that the voice agent can intake saves agency staff a phone call, a data entry step, and follow-up coordination.

### Design Philosophy

1. **Modular**: Payments and COI Intake are independent modules. Agencies can enable either or both.
2. **Prompt-driven**: The agent's behavior is controlled by configurable prompt templates, not hardcoded logic. Agencies customize what the agent says without engineering changes.
3. **Agency-configurable**: Every agency has different carriers, billing arrangements, and disclosure preferences. The system provides sensible defaults but gives agencies full control.
4. **Information-only by default**: The voice agent **routes and informs** — it does not transact. It tells the customer where and how to pay; it does not process payments. It collects COI request details; it does not generate certificates.

---

## 2. Customer Identification & Intent Routing

### 2.1 Caller Identification

Before any servicing action, the agent must identify who is calling. The identification flow:

1. **ANI / Caller ID lookup**: Match the inbound phone number against policy records in the AMS. If a unique match is found, confirm: *"I see you may be calling about a policy under [Name]. Is that correct?"*
2. **Name + policy number**: If no ANI match (or multiple matches), ask: *"Can I get your name and policy number?"*
3. **Name + address fallback**: If the caller doesn't have their policy number: *"No problem — can I get your name and the address on the policy?"*

Once identified, the agent loads the caller's policy record(s) from the AMS.

```
┌─────────────────┐
│  Inbound Call    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     match found      ┌──────────────────┐
│  ANI Lookup      │ ──────────────────► │  Confirm Identity  │
└────────┬────────┘                      └────────┬─────────┘
         │ no match                               │
         ▼                                        ▼
┌─────────────────┐                      ┌──────────────────┐
│  Ask Name +      │ ──────────────────► │  Policy Lookup     │
│  Policy Number   │     match found     └────────┬─────────┘
└────────┬────────┘                               │
         │ no policy #                            ▼
         ▼                               ┌──────────────────┐
┌─────────────────┐                      │  Load Policy       │
│  Ask Name +      │ ──────────────────► │  Record(s)         │
│  Address         │     match found     └──────────────────┘
└─────────────────┘
```

### 2.2 Intent Detection

After identification, the agent determines what the caller needs:

| Signal | Detected Intent |
|---|---|
| "make a payment", "pay my bill", "how much do I owe", "when is my payment due" | **Payments** |
| "need a certificate", "proof of insurance", "COI", "my landlord needs...", "my mortgage company needs..." | **COI Intake** |
| Anything else | **Escalate to human** |

Intent detection is handled by the LLM's natural language understanding — no keyword matching. The examples above are illustrative, not exhaustive.

### 2.3 Routing

```
┌──────────────────┐
│  Intent Detected   │
└────────┬─────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Payment │ │  COI   │
│Module  │ │ Intake │
│(§3)    │ │(§4)    │
└────────┘ └────────┘

    If neither → transfer to human agent
```

### 2.4 Schema Sketch: Customer Identity

```yaml
CustomerIdentity:
  phone_number: string          # ANI from inbound call
  matched_contact_id: string    # AMS contact record ID
  name: string
  policies:                     # All policies associated with this contact
    - policy_id: string
      policy_number: string
      carrier: string
      line_of_business: string  # "home", "auto", "commercial_gl", etc.
      billing_type: string      # "direct_bill", "agency_bill", "premium_finance"
      payment_provider: string  # carrier name or finance company name
      status: string            # "active", "pending_cancellation", etc.
```

If the customer has multiple policies, the agent asks which policy they're calling about before proceeding to the relevant module.

---

## 3. Module: Payments

### 3.1 Approach

The payments module provides **generic information delivery**: it tells the customer how to resolve their payment based on who they pay and how they pay. The agent does not process payments, disclose financial data by default, or access carrier payment systems.

The core logic is simple:

> Given a customer's policy → determine the **billing type** and **payment provider** → deliver the matching **prompt template** (portal URL, phone number, instructions).

### 3.2 Payment Provider + Type Taxonomy

Every policy has a billing arrangement that falls into one of three types:

| Billing Type | Who Bills the Customer | Personal Lines Prevalence | How It Works |
|---|---|---|---|
| **Direct Bill** | Carrier | **Most common** (vast majority of home & auto) | Carrier bills policyholder directly. Agency receives commission after carrier collects. |
| **Agency Bill** | Agency | Rare for personal lines | Agency invoices policyholder, collects into trust account, remits to carrier net of commission. |
| **Premium Finance** | Finance company | Very rare for personal lines | Third-party lender pays full annual premium upfront; policyholder repays in installments. Finance company can cancel for non-payment. |

For personal lines (home & auto), **Direct Bill dominates**. Agency Bill and Premium Finance are uncommon but must be handled — an agency with a mixed book will have some policies in each category.

**Common payment providers by type:**

- **Direct Bill carriers**: Progressive, State Farm, Travelers, Hartford, Safeco, Liberty Mutual, Nationwide, etc.
- **Premium finance companies**: IPFS, AFCO, ClassicPlan, Capital Premium Finance

### 3.3 Prompt System Architecture

#### Core Concept

Each combination of **(payment provider, billing type)** maps to a **prompt template** — the script the voice agent uses when speaking with the customer about that specific payment arrangement.

```
┌──────────────────────────────────────────────────────┐
│                    Prompt Matching                      │
│                                                        │
│  Policy Record                                         │
│  ┌──────────────────┐                                  │
│  │ carrier: "Progressive"                              │
│  │ billing_type: "direct_bill"                         │
│  └────────┬─────────┘                                  │
│           │                                            │
│           ▼                                            │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │ Match Key:        │───►│ Prompt Template:          │  │
│  │ (Progressive,     │    │ "Your policy is billed    │  │
│  │  direct_bill)     │    │  directly by Progressive. │  │
│  └──────────────────┘    │  You can make a payment   │  │
│                          │  at progressive.com or    │  │
│                          │  call 1-800-776-4737."    │  │
│                          └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### Schema Sketch

```yaml
PromptTemplate:
  id: string
  provider_key: string              # e.g., "progressive", "ipfs", "agency_default"
  billing_type: string              # "direct_bill" | "agency_bill" | "premium_finance"
  prompt_text: string               # The script the agent delivers
  payment_portal_url: string | null
  payment_phone: string | null
  additional_instructions: string | null
  cancellation_warning: string | null  # Required for premium_finance
  created_by: string                # "system" or agency_id
  version: int

PaymentProviderConfig:
  agency_id: string
  provider_key: string
  billing_type: string
  prompt_template_id: string        # Links to the PromptTemplate used
  disclosure_settings:
    disclose_amount_due: boolean    # Can the agent state the balance?
    disclose_due_date: boolean      # Can the agent state the due date?
    disclose_policy_number: boolean # Can the agent confirm the policy number?
```

**Relationship**: An agency has many `PaymentProviderConfig` entries (one per provider+type combination they serve). Each config points to a `PromptTemplate` — either a system default or an agency-customized version.

#### Example Prompt Templates

**Direct Bill — Progressive (system default):**
> "Your policy is billed directly by Progressive. You can make a payment online at progressive.com, through the Progressive app, or by calling 1-800-776-4737. Is there anything else I can help with?"

**Direct Bill — Generic carrier (fallback):**
> "Your policy is billed directly by your carrier, [carrier_name]. For payment options, I'd recommend contacting them directly or visiting their website. Would you like me to transfer you to your agent for more help?"

**Premium Finance — IPFS (system default):**
> "Your premium is financed through IPFS. You can make payments online at ipfs.com, through the myIPFS mobile app, or by calling 1-800-552-4737. Please note: it's important to keep your finance payments current, as late payments on financed policies may result in a notice of cancellation."

**Agency Bill — Agency default:**
> "Your policy is billed through our agency. You can make a payment online at [agency_portal_url], mail a check to [agency_address], or call us during business hours at [agency_phone]. We accept [accepted_methods]. [fee_disclosure]"

### 3.4 End-to-End Flow

```
 Customer calls
       │
       ▼
 ┌─────────────┐
 │ 1. Identify   │  (§2 — name, policy number, ANI lookup)
 │    Customer    │
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │ 2. Policy     │  Determine: billing_type + payment_provider
 │    Lookup     │  (from AMS policy record)
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │ 3. Match      │  Look up (provider, billing_type) → PromptTemplate
 │    Template   │  Check agency overrides first, then system defaults
 └──────┬──────┘
        │
   ┌────┴─────────────────┐
   │ Match found?          │
   │                       │
   ▼ Yes                   ▼ No
 ┌─────────────┐    ┌─────────────┐
 │ 4. Deliver    │    │ 4b. Fallback │
 │    Guidance   │    │    - Use generic template           │
 │    (portal,   │    │    - Or escalate to human           │
 │    phone, etc)│    └─────────────┘
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │ 5. Wrap Up    │  "Is there anything else I can help with?"
 └─────────────┘
```

**Walkthrough — typical Direct Bill call (home insurance):**

1. Customer calls. ANI matches to Jane Smith, who has a homeowner's policy with Travelers.
2. Agent confirms: *"Hi Jane, are you calling about your Travelers homeowner's policy?"* Jane confirms.
3. Jane asks: *"When is my next payment due?"*
4. Policy lookup shows: billing_type = `direct_bill`, payment_provider = `travelers`.
5. Agent matches (travelers, direct_bill) → system default prompt template.
6. Disclosure check: agency has `disclose_due_date: false`, so the agent cannot share the due date.
7. Agent responds: *"Your Travelers homeowner's policy is billed directly by Travelers. I don't have your payment details here, but you can check your balance and due date at travelers.com, or call Travelers at 1-800-842-5075. Would you like help with anything else?"*

### 3.5 Configuration & Defaults

#### System Defaults

The platform ships with prompt templates for the most common carriers and all major premium finance companies:

| Provider | Type | Portal | Phone |
|---|---|---|---|
| Progressive | Direct Bill | progressive.com | 1-800-776-4737 |
| State Farm | Direct Bill | statefarm.com | 1-800-782-8332 |
| Travelers | Direct Bill | travelers.com | 1-800-842-5075 |
| Hartford | Direct Bill | thehartford.com | 1-800-243-5860 |
| Safeco | Direct Bill | safeco.com | 1-800-332-3226 |
| Liberty Mutual | Direct Bill | libertymutual.com | 1-800-290-8206 |
| Nationwide | Direct Bill | nationwide.com | 1-877-669-6877 |
| IPFS | Premium Finance | ipfs.com | 1-800-552-4737 |
| AFCO | Premium Finance | afcodirect.com | 1-800-288-6901 |
| ClassicPlan | Premium Finance | classicplan.com | 1-800-347-6481 |
| Capital Premium | Premium Finance | capitalpremium.net | 1-800-929-3113 |

#### Agency Overrides

Agencies can:
- **Replace** a system default prompt with custom messaging for any provider
- **Add** prompt templates for carriers not in the system defaults
- **Configure disclosure settings** per provider (what the agent can/cannot say about balances, dates, etc.)
- **Set a global default** for unmatched carriers (e.g., "For payment questions on this policy, let me transfer you to your agent")

#### Disclosure Guardrails

By default, the agent **does not disclose financial information** (amounts, due dates, account numbers). Agencies must explicitly opt in to each disclosure type per provider. This conservative default protects against:
- State insurance information privacy laws
- Liability for incorrect information (stale AMS data)
- Customer complaints about data exposure

---

## 4. Module: COI Intake (Separate Add-On)

### 4.1 Overview

**Use case**: An insured calls the agency to **request a Certificate of Insurance (COI)** that they need to provide to a third party.

This is an **inbound request from the policyholder**, not an outbound certificate distribution workflow. The insured has been asked by someone (landlord, mortgage company, lienholder, general contractor) to provide proof of insurance, and they're calling their agency to get it.

**Common personal lines scenarios:**
- Landlord requires proof of renter's insurance before lease signing
- Mortgage company requires proof of homeowner's insurance at closing or annual renewal
- Auto lienholder requires proof of coverage on a financed vehicle

**Common commercial lines scenarios (secondary focus):**
- General contractor requires COI from a subcontractor before allowing them on-site
- Property management company requires tenant's business liability COI
- Vendor compliance — a business partner requires proof of coverage as a contract condition

**What the voice agent does**: Collects all necessary information from the caller, creates a structured intake request, and queues it for agency staff to generate the actual certificate in their AMS and deliver it. The agent does **not** generate certificates.

### 4.2 Intake Workflow

The voice agent collects the following information from the caller:

#### Required Fields

| Field | Description | Example |
|---|---|---|
| **Which policy** | The policy the COI should reference | "My homeowner's policy" / policy number |
| **Certificate holder name** | Who needs to receive the COI | "Wells Fargo Home Mortgage" |
| **Certificate holder address** | Mailing address of the recipient | "1 Home Campus, Des Moines, IA 50328" |
| **Delivery method** | How to send the completed COI | Email, fax, mail |
| **Delivery destination** | Email address, fax number, or mailing address | "certrequests@wellsfargo.com" |

#### Optional / Situational Fields

| Field | Description | When to Ask |
|---|---|---|
| **Special requirements** | Additional insured, specific limits, special language | If the caller mentions their third party "has specific requirements" |
| **Urgency / deadline** | When the COI is needed by | Always ask: "Is there a deadline for when this is needed?" |
| **Contact info for follow-up** | Best way to reach the caller if the agency has questions | If any details are unclear or complex |
| **Reference / loan number** | Mortgage loan number or contract reference | For mortgage company COI requests |

#### Intake Flow

```
 Customer calls, identified, intent = COI
       │
       ▼
 ┌─────────────────────────┐
 │ 1. "Which policy is the  │
 │    certificate for?"      │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 2. "Who needs to receive │
 │    the certificate?"      │
 │    (name + address)       │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 3. "Does [third party]   │
 │    have any specific      │
 │    requirements?"         │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 4. "How should we send   │
 │    the certificate?"      │
 │    (email / fax / mail)   │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 5. "Is there a deadline   │
 │    for when this is       │
 │    needed?"               │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 6. Confirm & summarize    │
 │    all collected details   │
 └──────────┬──────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │ 7. Queue intake request   │
 │    for agency staff       │
 └─────────────────────────┘
```

**Confirmation script example:**
> "Let me confirm what I have. You need a certificate of insurance for your homeowner's policy, to be sent to Wells Fargo Home Mortgage at certrequests@wellsfargo.com. No special requirements mentioned, and you'd like this by end of week. Does that all sound correct?"

### 4.3 Personal Lines COI Specifics

#### Home Insurance

**Typical request**: Mortgage company or landlord needs proof of property coverage.

- **Standard form**: ACORD 28 — Evidence of Commercial Property Insurance (despite the name, widely used for residential property evidence as well) or carrier-specific Evidence of Property Insurance forms
- **What's typically required**: Property address, coverage amounts (dwelling, liability), mortgage clause / loss payee information, policy effective dates
- **Mortgage company COIs** often require the mortgagee clause to be listed exactly as the lender specifies (e.g., "Wells Fargo Bank, N.A., its successors and/or assigns" with a specific mailing address)
- **Turnaround**: Most agencies can produce same-day or next business day

**Voice agent notes**: The agent should ask if the caller has the exact mortgagee clause wording their lender requires. If not, the agent notes this and agency staff will follow up.

#### Auto Insurance

**Typical request**: Lienholder needs proof of coverage on a financed vehicle.

- **Standard form**: ACORD 25 — Certificate of Liability Insurance (for liability proof) or state-specific insurance ID cards
- **Lienholder requests** require the lienholder to be listed as loss payee on the physical damage coverage
- **Common lienholders**: Ally Financial, Capital One Auto Finance, Chase Auto, credit unions
- **Turnaround**: Same-day is typical

**Voice agent notes**: The agent should confirm which vehicle the certificate is for if the caller has multiple vehicles on the policy.

### 4.4 Commercial Lines COI Specifics (Secondary)

Commercial COI requests are more complex and more likely to require agency staff involvement. The voice agent's role is to **collect as much information as possible** to minimize back-and-forth.

#### Common Forms

| Form | Use Case |
|---|---|
| **ACORD 25** | Certificate of Liability Insurance — the most common commercial COI |
| **ACORD 27** | Evidence of Property Insurance (commercial property) |
| **ACORD 28** | Evidence of Commercial Property Insurance |

#### Complexity Factors

Commercial COI requests often involve requirements that the voice agent should flag but not attempt to interpret:

- **Additional insured**: The certificate holder wants to be listed as an additional insured on the policy — this may require an endorsement
- **Waiver of subrogation**: The third party wants the insured's carrier to waive its right to subrogate against them
- **Primary & non-contributory**: The third party wants the insured's policy to be primary regardless of other coverage
- **Specific coverage limits**: The third party requires minimum limits (e.g., "$1M per occurrence / $2M aggregate")

**Voice agent approach**: If the caller mentions any of these terms, the agent captures the requirement verbatim and notes it on the intake request. The agent does not assess whether the current policy meets the requirements — that's for agency staff.

### 4.5 State-Specific Considerations

COI requirements and regulatory nuances vary by state. The four states researched for this spec — California, Ohio, Florida, and Texas — represent a cross-section of regulatory approaches. Detailed findings are in **Appendix A**.

#### Key Themes Across States

**Personal lines:**
- Most states do not have COI-specific legislation for personal lines — standard ACORD forms and carrier evidence-of-insurance forms are universally accepted
- Mortgage company and lienholder requirements are driven by the lender, not by state regulation
- Some states (FL, TX) have specific proof-of-insurance requirements for auto that affect what documents satisfy lienholder requests

**Commercial lines:**
- Several states (including TX, FL, OH) have enacted **Certificate of Insurance legislation** that restricts what can appear on or be attached to a COI — primarily aimed at preventing certificate holders from demanding coverage terms that don't exist in the underlying policy
- These laws generally prohibit altering ACORD forms, requiring agents to certify coverage beyond what the policy provides, or attaching endorsement-like language to certificates
- The voice agent does not need to enforce these rules (that's the agency's responsibility when issuing the COI), but awareness informs the intake prompts — the agent should capture requirements as stated and let agency staff assess compliance

### 4.6 Modularity

COI Intake is a standalone module that agencies can enable or disable independently of the Payments module.

#### Schema Sketch: COI Intake Request

```yaml
COIIntakeRequest:
  id: string
  created_at: datetime
  customer_identity: CustomerIdentity   # From §2
  policy_reference:
    policy_id: string
    policy_number: string
    line_of_business: string
  certificate_holder:
    name: string
    address: string
    reference_number: string | null      # Loan number, contract number, etc.
  requirements:
    additional_insured: boolean
    waiver_of_subrogation: boolean
    primary_and_noncontributory: boolean
    specific_limits: string | null
    other_requirements: string | null     # Free text for anything else
  delivery:
    method: string                       # "email", "fax", "mail"
    destination: string                  # Email address, fax number, or mailing address
  urgency:
    deadline: date | null
    notes: string | null
  status: string                         # "pending", "in_progress", "completed", "escalated"
  assigned_to: string | null             # Agency staff member
```

#### Integration with Customer Identification

The COI Intake module reuses the same customer identification flow from Section 2. Once the customer is identified and their intent is classified as a COI request, the agent has access to their policy records and can pre-populate the `policy_reference` field — the caller just needs to confirm which policy the COI is for.

---

## 5. Agency Configuration & Prompt Management

### 5.1 Top-Level Configuration Model

```yaml
AgencyServicingConfig:
  agency_id: string
  agency_name: string

  payments:
    enabled: boolean
    global_disclosure_defaults:
      disclose_amount_due: boolean       # Default: false
      disclose_due_date: boolean         # Default: false
      disclose_policy_number: boolean    # Default: true
    provider_configs:                    # List of PaymentProviderConfig (§3.3)
      - provider_key: string
        billing_type: string
        prompt_template_id: string
        disclosure_overrides: object | null
    fallback_behavior: string            # "generic_template" | "transfer_to_agent"

  coi_intake:
    enabled: boolean
    auto_assign_to: string | null        # Default staff member for COI requests
    default_turnaround_message: string   # e.g., "We typically process COI requests within 1 business day"
    commercial_enabled: boolean          # Enable/disable commercial COI intake (personal always on if module enabled)
    escalation_triggers:                 # Keywords/conditions that auto-escalate to staff
      - "additional insured"
      - "waiver of subrogation"
      - "primary and non-contributory"

  escalation:
    transfer_phone: string               # Where to transfer if agent can't resolve
    business_hours: string               # When live agents are available
    after_hours_message: string
```

### 5.2 Prompt Template Lifecycle

1. **Authoring**: System defaults are maintained by the platform team. Agency-custom prompts are authored by agency staff through a configuration UI (or by the platform team during onboarding).
2. **Storage**: Prompt templates are stored centrally and associated with either "system" (default) or an `agency_id` (custom).
3. **Matching**: At runtime, the system checks for an agency-specific template first. If none exists for the (provider, billing_type) pair, it falls back to the system default.
4. **Versioning**: Templates are versioned. When an agency customizes a prompt, a new version is created. Previous versions are retained for audit.

#### Match Resolution Order

```
1. Agency-specific template for (provider, billing_type)     ← highest priority
2. Agency-specific template for (provider, *)                ← agency default for that provider
3. System default template for (provider, billing_type)
4. System default template for (*, billing_type)             ← generic by billing type
5. Global fallback (transfer to agent or generic message)    ← lowest priority
```

### 5.3 Default vs. Custom Configuration

| Aspect | Default (out of box) | Agency Custom |
|---|---|---|
| Payment prompts | System templates for major carriers + finance companies | Agency overrides with custom messaging, URLs, phone numbers |
| Disclosure settings | All financial disclosures OFF | Agency opts in per provider |
| COI intake | Enabled with standard intake flow | Custom turnaround messaging, auto-assignment rules, escalation triggers |
| Fallback behavior | Transfer to agent | Agency can choose generic template instead |

---

## 6. Open Questions & Validation Items

### Design Partner Input Needed

| # | Question | Context | Owner |
|---|---|---|---|
| 1 | **What level of granularity do agencies want for payment config?** Per-carrier, per-billing-type, or per-policy? | The spec assumes per (provider, billing_type) but some agencies may want simpler or more granular control | Product |
| 2 | **What information do agencies actually want the agent to disclose?** | We default to conservative (no financial data). Need to validate whether agencies want to enable balance/due date disclosure and under what conditions | Product |
| 3 | **How do agencies currently determine billing type from AMS data?** | The spec assumes a `billing_type` field exists or can be derived. Need to validate which AMS fields reliably indicate direct bill vs. agency bill vs. premium finance | Engineering |
| 4 | **What is the expected COI turnaround time agencies are comfortable committing to?** | The voice agent tells the caller when to expect their COI. Need realistic SLAs from agencies | Product |
| 5 | **Should the voice agent attempt to collect mortgagee clause wording?** | This is error-prone over the phone. Agencies may prefer to follow up via email for exact wording | Product |
| 6 | **Are there additional premium finance companies we should include in system defaults?** | Current list: IPFS, AFCO, ClassicPlan, Capital Premium. May be missing regional players | Product |

### Regulatory & Compliance

- **State insurance information privacy laws**: Must audit which states restrict verbal disclosure of policy details (amounts, coverage limits) to callers. Conservative default (no disclosure) mitigates but doesn't eliminate this risk.
- **COI legislation compliance**: Several states restrict COI content (see §4.5 and Appendix A). The voice agent doesn't generate COIs, but intake prompts should avoid implying coverage terms that may not exist.
- **Recording & disclosure**: If calls are recorded, state two-party consent laws (CA, FL) apply. This is an existing concern for the voice agent, not specific to servicing modules.

### AMS Integration Dependencies

| Data Needed | Used By | Source |
|---|---|---|
| Customer contact records (name, phone, address) | Customer identification (§2) | AMS contacts |
| Policy records (number, carrier, LOB, status) | Both modules | AMS policies |
| Billing type indicator | Payments (§3) | AMS policy or carrier rules |
| Payment provider / finance company | Payments (§3) | AMS policy or agency config |
| Mortgagee / lienholder info | COI Intake (§4) | AMS policy |

### Information Security

- Voice agent must not store or log sensitive financial information (account numbers, payment card details) from the conversation
- COI intake requests may contain PII (names, addresses) — standard data handling policies apply
- Disclosure settings are a security control — unauthorized changes should require elevated permissions

---

## 7. Appendix A: COI Research by State

> The following research covers COI-related requirements, standard practices, and regulatory references for four target states. Personal lines (home & auto) and commercial lines are addressed for each state.

### 7.1 California

#### Personal Lines

**Home Insurance:**
- Standard proof of coverage is provided via ACORD 28 or carrier-specific Evidence of Property Insurance forms
- Mortgage companies (Wells Fargo, Chase, etc.) require a mortgagee clause listing the lender as loss payee — wording must match the lender's exact requirements
- California Insurance Code §790.03 et seq. (Unfair Practices Act) governs fair claims and information handling but does not impose COI-specific requirements for personal lines
- Landlords commonly require renter's insurance proof — no state-mandated form; carrier declarations pages or ACORD certificates are accepted

**Auto Insurance:**
- California requires all drivers to carry proof of financial responsibility (Cal. Veh. Code §16020)
- Acceptable proof includes: insurance ID card, insurance policy, surety bond, or DMV-issued certificate of self-insurance
- California is an electronic proof of insurance state — digital insurance cards shown on a phone are acceptable (Cal. Veh. Code §16020(b))
- Lienholders (auto lenders) require the lienholder to be listed as loss payee on collision/comprehensive coverage — standard practice, not state-specific regulation
- ACORD 25 or carrier-issued certificates are standard for lienholder proof

#### Commercial Lines

- **California does not currently have a COI-specific statute** (as of 2025) restricting certificate content or form, unlike some other states
- Standard ACORD 25, 27, and 28 forms are used
- Additional insured endorsements, waivers of subrogation, and primary/non-contributory language are common contractual requirements — governed by contract law, not insurance-specific regulation
- California Department of Insurance (CDI) has issued guidance that agents should not alter standard ACORD forms or certify coverage that does not exist in the policy
- Agents can face E&O liability for issuing certificates that misrepresent coverage — standard of care applies under Cal. Ins. Code §1861.05 and common law

#### Key Regulatory References
- Cal. Insurance Code §790.03 — Unfair Practices Act
- Cal. Vehicle Code §16020 — Financial Responsibility
- Cal. Insurance Code §1861.05 — Rating and disclosure standards

---

### 7.2 Ohio

#### Personal Lines

**Home Insurance:**
- Standard proof via ACORD 28 or carrier evidence-of-insurance forms
- Ohio does not have state-specific personal lines COI requirements — standard industry practice applies
- Mortgage companies require loss payee / mortgagee clauses as a contractual matter
- Ohio Revised Code §3937 series governs property insurance but does not impose certificate-specific rules for personal lines

**Auto Insurance:**
- Ohio requires proof of financial responsibility under ORC §4509.101
- Minimum liability limits: $25,000/$50,000/$25,000
- Ohio Bureau of Motor Vehicles accepts insurance company-issued ID cards as proof
- Ohio recognizes electronic proof of insurance (ORC §4509.104, effective 2018)
- Lienholder proof follows standard practice — ACORD 25 or carrier certificates with lienholder listed

#### Commercial Lines

- **Ohio enacted COI legislation in 2015** (ORC §3905.471) — one of the earlier states to do so
- **Key provisions of ORC §3905.471:**
  - Prohibits any person from requiring an insurance agent to issue a certificate that contains terms not contained in the underlying insurance policy
  - Prohibits altering or modifying a standard ACORD certificate form
  - Certificates cannot create or confer new or additional rights beyond what the policy provides
  - A certificate holder cannot require an agent to warrant that the insurance policy terms comply with a contract between the certificate holder and the named insured
- ACORD 25, 27, and 28 remain the standard forms
- Ohio Department of Insurance enforces compliance — violations can result in agent disciplinary action

#### Key Regulatory References
- ORC §3905.471 — Certificate of Insurance (commercial lines COI legislation)
- ORC §4509.101 — Financial Responsibility (auto)
- ORC §4509.104 — Electronic proof of financial responsibility
- ORC §3937 series — Property insurance regulations

---

### 7.3 Florida

#### Personal Lines

**Home Insurance:**
- Standard proof via ACORD 28 or carrier evidence-of-property-insurance forms
- Florida's property insurance market is unique due to hurricane exposure — carriers like Citizens Property Insurance (state-backed) are common
- Mortgage companies require standard mortgagee clause — no Florida-specific form beyond standard ACORD
- Florida Statutes §627 (Insurance Rates and Contracts) governs policy requirements but does not impose personal lines COI-specific rules
- **Wind/flood note**: Some mortgage companies require separate evidence of windstorm coverage (especially in coastal areas where wind is excluded from the base policy and covered by Citizens or a wind pool). The COI intake agent should ask if the caller's lender has mentioned wind or flood coverage requirements.

**Auto Insurance:**
- Florida requires Personal Injury Protection (PIP) and Property Damage Liability (FL Stat. §627.733, §627.7275)
- **Florida does not require Bodily Injury Liability** (one of the few states) — but lienholders may contractually require it
- **FR-44**: Florida requires an FR-44 filing for DUI convictions — significantly higher liability limits ($100K/$300K BI, $50K PD). If a caller has an FR-44 requirement, the COI agent should note it but this is typically handled at policy issuance, not at the certificate level
- Electronic proof of insurance is accepted (FL Stat. §316.646(2))
- Standard ACORD 25 or carrier certificates for lienholder proof

#### Commercial Lines

- **Florida enacted COI legislation in 2013** (FL Stat. §627.4137)
- **Key provisions of FL Stat. §627.4137:**
  - A certificate of insurance shall be used for informational purposes only and confers no rights upon the certificate holder
  - No person shall demand or require the issuance of a certificate that contains false or misleading information
  - Prohibits requiring an agent to issue a certificate that amends, expands, or alters the terms of the underlying policy
  - Prohibits any document or correspondence issued in conjunction with a certificate from containing language that would alter the terms of the policy
  - Violation is a first-degree misdemeanor (FL Stat. §627.4137(4))
- ACORD forms are standard; Florida's statute reinforces that they cannot be altered
- Florida Office of Insurance Regulation (OIR) has enforcement authority

#### Key Regulatory References
- FL Stat. §627.4137 — Certificate of Insurance (commercial COI legislation)
- FL Stat. §627.733, §627.7275 — Motor Vehicle Insurance (PIP, liability)
- FL Stat. §316.646 — Proof of insurance / electronic proof
- FL Stat. §627 — Insurance Rates and Contracts (general)

---

### 7.4 Texas

#### Personal Lines

**Home Insurance:**
- Standard proof via ACORD 28 or carrier evidence forms
- Texas Department of Insurance (TDI) does not impose COI-specific requirements for personal lines homeowner's coverage
- Mortgage company requirements follow standard national practice — mortgagee clause with exact lender wording
- Texas property insurance market includes TWIA (Texas Windstorm Insurance Association) for coastal windstorm coverage — similar to Florida, lenders may require separate windstorm evidence for coastal properties
- Texas Insurance Code §2002 series governs property insurance forms but does not address certificates specifically for personal lines

**Auto Insurance:**
- Texas requires minimum liability: $30K/$60K/$25K (Texas Transportation Code §601.072)
- **TexasSure** — Texas operates a verification program (TexasSure) that electronically verifies auto insurance compliance. This is a backend system used by law enforcement and registration offices, not a consumer-facing COI tool
- Electronic proof of insurance is accepted (Texas Transportation Code §601.053)
- Standard ACORD 25 or carrier certificates for lienholder proof
- SR-22 filings for certain violations — similar to FL FR-44 but at standard liability limits

#### Commercial Lines

- **Texas enacted comprehensive COI legislation in 2011** (Texas Insurance Code §1811)
- **Key provisions of TIC §1811:**
  - A certificate of insurance must comply with an applicable filing with TDI (§1811.051)
  - Prohibits requiring an insurance agent or insurer to issue a certificate that warrants or represents that specific terms exist in a policy unless the terms exist (§1811.053)
  - Prohibits requiring the issuance of a certificate that amends, extends, or alters the coverage provided by the actual policy (§1811.054)
  - No person may prepare or issue a certificate that misrepresents the existence or nature of insurance coverage (§1811.055)
  - Certificates are for informational purposes only and do not confer rights or alter policy terms (§1811.056)
  - Violation is subject to administrative penalties by TDI
- **TDI enforcement**: TDI has issued bulletins reinforcing that standard ACORD forms should not be modified and that agents should not sign off on certificate language that misrepresents coverage
- Texas has one of the most detailed COI statutes in the country and is frequently cited as a model by other states considering similar legislation

#### Key Regulatory References
- Texas Insurance Code §1811 — Certificate of Insurance (comprehensive COI legislation)
- Texas Transportation Code §601.072 — Financial responsibility (auto liability minimums)
- Texas Transportation Code §601.053 — Electronic proof of insurance
- Texas Insurance Code §2002 — Property insurance forms

---

### Appendix A Summary: State Comparison

| Aspect | California | Ohio | Florida | Texas |
|---|---|---|---|---|
| **Personal Lines COI Regulation** | No specific COI statute | No specific COI statute | No specific COI statute | No specific COI statute |
| **Commercial Lines COI Legislation** | No (guidance only) | Yes — ORC §3905.471 (2015) | Yes — FL Stat. §627.4137 (2013) | Yes — TIC §1811 (2011) |
| **COI Form Alteration Prohibited** | CDI guidance (not statute) | Yes (by statute) | Yes (by statute, misdemeanor penalty) | Yes (by statute, admin penalties) |
| **Electronic Proof of Auto Insurance** | Yes | Yes (2018) | Yes | Yes |
| **Auto Minimum Liability** | 15/30/5 | 25/50/25 | PIP + 10K PD (no BI required) | 30/60/25 |
| **Coastal/Wind Considerations** | Earthquake (not wind-specific) | N/A | TWIA / Citizens windstorm | TWIA windstorm |
| **Key COI Enforcement Body** | CDI | Ohio DOI | OIR | TDI |
