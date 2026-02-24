- [Ideated Service Cases](https://docs.google.com/spreadsheets/d/19Vltb_h1QMOmTpihbYSa2SJxObzniaCmFtMC0SA17Mw/edit?gid=428758042#gid=428758042 "https://docs.google.com/spreadsheets/d/19Vltb_h1QMOmTpihbYSa2SJxObzniaCmFtMC0SA17Mw/edit?gid=428758042#gid=428758042")
    
- [==Brief: Voice Agent Experience for Payment-Related Calls==](https://docs.google.com/document/d/1jmPfQcVXJmA8H6_UaiKgPBsmFSaBYzHb4A-dck9Dkmg/edit?tab=t.0#heading=h.h1kiwzt2iitt "https://docs.google.com/document/d/1jmPfQcVXJmA8H6_UaiKgPBsmFSaBYzHb4A-dck9Dkmg/edit?tab=t.0#heading=h.h1kiwzt2iitt")
    

# Voice Analysis

![](blob:https://policyliftai.atlassian.net/ec6f24b7-397a-48bf-b4d2-8cc1fdb9081b#media-blob-url=true&id=545e83a9-9ecd-46fd-90fb-e9934043b985&collection=contentId-100958227&contextId=100958227&mimeType=image%2Fpng&name=Screenshot%202026-02-01%20at%205.14.23%E2%80%AFPM.png&size=91660&width=1348&height=444&alt=&clientId=79fe909d-f13d-42a0-8ffa-977f043f391c)

3 Month Call Log Analysis

_Parsing the tables: First we broke down by **Status**. Then we focused only on **Completed** calls and broke down by **Reason**. Then we broke out **Service+Unknown** for further analysis, and classified by subject. We deep-dove on **Payment intent** to ascertain most common payment cases. Finally we broke out **Other** with more detailed prompting to classify what we had missed (some redundancies with higher level categories - for example “<= 3 msgs” to be grouped in with filtered)._

[Link](https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?usp=sharing "https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?usp=sharing")

### Key Observations

- ~55% (hidden + filtered + other(hungup or not_actionable_spam)) of all calls end because either the call was not actionable or the caller is anti-voiceAI
    
    - It is very hard to figure out which is which, because in both cases very few messages are exchanged and the call ends very quickly
        
- **Completed Call Insights:** Looking at only Completed calls, and removing the 89 that are not valuable (in “Other” = took longer than 5s but were <= 3 msgs) - **Total Completed Calls = 454**
    
    - **27% of completed calls are quotes**
        
    - **4% are Claims**
        
    - Core servicing use cases:
        
        - **Speak with an Agent** (Service+Unknown’s Transfer: 24 and Other’s speak_with_agent: 22) **is 9.7% of completed calls**
            
            - NOTE: When checking the [3 msg calls](https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?gid=1190372205#gid=1190372205 "https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?gid=1190372205#gid=1190372205") (assistant greeting, user spoke once, assistant responded and then call ended) many were _valid_ requests for call transfer. When factoring these into numerator and denominator, call transfers are **14% of completed calls**.
                
        - **Payment-related issues are 16% of completed calls**
            
        - **Questions about policy are 16% of completed calls**
            
        - Spam + non-actionable Other = 15%
            
        - Long tail of Other = 9.3% of completed calls
            

### Closing Analysis Thoughts

- **# Quotes = # Payment + # Policy Qs:** It is important to remember that of calls that are completing with actual interaction today, there are roughly as many quotes as servicing opportunities (Payment + Policy Qs).
    
- **Recommend prioritizing Payments, Deprioritizing policy questions.** We can add better handling for Payment questions, which arise 16% of the time, but after scanning the Policy Questions (also 16% of time) - these are likely going to be hard to action on. For those interested in taking a stab at analyzing Policy Questions to better handle them, this can be done by [copying this sheet](https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?gid=1222050317#gid=1222050317 "https://docs.google.com/spreadsheets/d/1gAWRv96NGl4tI6Cq21c1nJGLwUnyIdizkh3x2E3EnCw/edit?gid=1222050317#gid=1222050317").
    
    - By simply understanding the Name or Policy Number of the insured, it may be possible to easily provide direction regarding payment info.
        
    - Coming up with a strategy to holistically cover policy questions seems very difficult from data. Instead, I recommend we take **customer-driven approach** and identify a cohort of customers that want this feature. Understand their needs and identify opportunities to expose policy info safely in a manner that they believe is helpful. Truthfully, our current data suggests this will not be relevant or we will not be able to handle the requests sufficiently, even with access to AMS.
        

---

# Conversational Servicing: Payments Spec

## AI Assistant Module Design for Independent Agencies

---

## 1. Payment Scenario Prevalence

|   |   |   |   |
|---|---|---|---|
|Scenario|Personal Lines|Commercial (Standard)|Commercial (E&S/Large)|
|Direct Bill|**Most Common**|Common|Rare|
|Agency Bill|Rare|Less Common|**Most Common**|
|Premium Finance|Very Rare|Moderate|**Very Common**|

The AI assistant must handle three distinct payment scenarios. Each requires agency-specific configuration and AMS integration to determine routing and permissible disclosures.

---

## 2. Module Architecture

### 2.1 Direct Bill Module

**Purpose**: Route customer to carrier's payment system with agency-approved instructions.

**[Requires Validation]** We must be careful to comply with all Insurance information laws across all states, and should consider erring on the conservative side just to prevent exposure to PolicyLift. We should also determine what level of granularity customers are comfortable with controlling (should the following config be set on carrier to carrier basis, or agency basis)?

**AMS Identification Logic** (agency-configurable):

- **[Requires Validation]** Agency defines carrier-based rules indicating direct bill
    
- Agency can specify carrier-level defaults (e.g., "All Progressive personal auto = direct bill")
    

**Agency Configuration Schema**:

`DirectBillConfig { carrier_id: string carrier_name: string payment_portal_url: string | null payment_phone: string | null custom_instructions: string | null // Agency-specific messaging disclose_amount_due: boolean // Can AI state balance? disclose_due_date: boolean // Can AI state due date? disclose_policy_number: boolean // Can AI confirm policy number? }`

**Agency Service Notes:**

- We will also need to define _how_ any given customer (once looked up) is associated with a DirectBillConfig
    
- We will also need to identify the Account’s relevant Policy object (determine _which_ policy the customer is referencing without dangerously exposing information)
    

**Disclosure Rules**:

- AI only exposes fields where agency has set `disclose_*: true`
    
- If portal URL provided, AI offers it; otherwise routes to phone
    
- Custom instructions override defaults (e.g., "Call carrier directly, we cannot assist with payments")
    

---

### 2.2 Agency Bill Module

**Purpose**: Provide agency's payment instructions for policies the agency collects on.

**AMS Identification Logic** (agency-configurable):

- Agency defines rules to determine agency bill
    
    - **[Requires Validation]** AMS data check of some kind
        
- May include rules like "All policies through [MGA/Wholesaler] = agency bill"
    

**[Requires Validation]** **Agency Configuration Schema**:

`AgencyBillConfig { payment_portal_url: string | null // ePayPolicy, Ascend, custom, etc. payment_phone: string | null accepted_methods: string[] // ["ACH", "Credit Card", "Check"] fee_disclosure: string | null // e.g., "2.5% card fee applies" mailing_address: string | null // For check payments custom_instructions: string | null disclose_amount_due: boolean disclose_due_date: boolean disclose_invoice_number: boolean trust_account_notice: string | null // Regulatory language if required }`

**Disclosure Rules**:

- AI only exposes fields explicitly enabled by agency
    
- Agency controls whether AI can quote invoice amounts or just route to portal
    
- Custom instructions allow agency-specific handling (e.g., "Contact Sarah at ext. 204")
    

---

### 2.3 Premium Finance Module

**Purpose**: Route customer to their finance company with account-specific details.

**AMS Identification Logic** (agency-configurable):

- **[Requires Validation]** Agency defines rules to determine premium financing
    
- Finance agreement number stored in AMS links policy to finance account
    

**[Requires Validation]** **Agency Configuration Schema**:

`PremiumFinanceConfig { finance_company_id: string finance_company_name: string payment_portal_url: string payment_phone: string mobile_app_name: string | null custom_instructions: string | null disclose_account_number: boolean // Finance agreement number disclose_payment_amount: boolean disclose_due_date: boolean cancellation_warning: string // Required: late payment consequences }`

**Finance Company Reference Table** (system-provided defaults, agency can override):

|   |   |   |
|---|---|---|
|Company|Portal|Phone|
|IPFS|[IPFS \| Insurance Premium Financing & Payment Technology](http://ipfs.com/)|1-800-552-4737|
|AFCO|[AFCO Direct Insurance Premium Finance](http://afcodirect.com/)|1-800-288-6901|
|ClassicPlan|[ClassicPlan Insurance Premium Financing - ClassicPlan Insurance Premium Financing \| Serving the Insurance Industry Since 1984](http://classicplan.com/)|1-800-347-6481|
|Capital Premium|[Capital Finance Insurance \| Reliable Premium Financing Solutions](http://capitalpremium.net/)|1-800-929-3113|

**Disclosure Rules**:

- AI must always include cancellation warning for financed policies
    
- Account number disclosure requires explicit agency opt-in
    
- AI distinguishes between agency invoice (down payment) and finance company invoice (installments)
    

---

## 3. Routing Decision Logic

`On payment inquiry: 1. Lookup policy in AMS 2. Determine billing type using agency's configured rules 3. Load corresponding module config 4. Respond using only disclosed fields + custom instructions 5. If billing type undetermined → ask clarifying question or escalate to human`

---

## 4. Data Requirements

**Per-Policy (from AMS)**:

- Policy number, carrier, line of business
    
- Billing type flag (or derivable from carrier/LOB rules)
    
- Finance company + agreement number (if applicable)
    
- Current amount due, due date (if agency permits disclosure)
    

**Per-Agency (configuration)**:

- DirectBillConfig per carrier
    
- AgencyBillConfig (single config or per-MGA)
    
- PremiumFinanceConfig per finance company
    
- Global disclosure defaults
    

---

## Appendix: Payment Model Context

**Direct Bill**: Carrier bills policyholder directly and handles all payment collection. Agency receives commission after carrier collects. Dominant in personal lines and standard commercial.

**Agency Bill**: Agency invoices policyholder, collects premium into trust account, remits to carrier/MGA net of commission. Required for most E&S/wholesale placements. Agency controls payment relationship.

**Premium Finance**: Third-party lender pays full annual premium upfront; policyholder repays lender in monthly installments. Finance company can cancel policy for non-payment. Common for commercial premiums above $2,500+.

**Key Regulatory Note**: Agency bill funds must flow through a trust account with strict handling requirements. AI should never imply agency can "hold" or "delay" premium payments.

# To Validate with Clients

- **Info Security:** We must be careful to comply with all Insurance information laws across all states, and should consider erring on the conservative side just to prevent exposure to PolicyLift. We should ID and DOUBLE CHECK our understanding against clients.
    
- **Direct Bill:** We should also determine what level of granularity customers are comfortable with controlling (should the following config be set on carrier to carrier basis, or agency basis)?
    
    - What info do you need to control, and what info do you need to relay to customer _specifically_? Walk through scenario if possible. (Check against suggested schema in relevant section)
        
- **Agency Bill:** Agency defines rules to determine agency bill
    
    - AMS data check of some kind
        
    - What info do you need to control, and what info do you need to relay to customer _specifically_? Walk through scenario if possible. (Check against suggested schema in relevant section)
        
- **Premium Financing:** Agency defines rules to determine premium financing
    
    - What info do you need to control, and what info do you need to relay to customer _specifically_? Walk through scenario if possible. (Check against suggested schema in relevant section)
        
- **Have we missed any key billing methods?**