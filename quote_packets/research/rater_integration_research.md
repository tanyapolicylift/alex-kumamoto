# Rater Integration Research: PLRating, EZLynx, TurboRater
## How to Send Lead Data from Our System to Each Rater

**Date:** 2026-02-23
**Author:** Alex (research compiled from deep web research + competitor analysis)
**Status:** Complete

---

## EXECUTIVE SUMMARY

We researched three comparative raters used by our design partners to determine the feasibility, cost, and technical approach for sending lead data from our webapp into each rater. Here are the top-line findings:

### Integration Difficulty Scorecard

| Rater | Difficulty | Best Available Method | Can User Trigger from Webapp? | Steps for Agent | Est. Time to Implement |
|-------|-----------|----------------------|------------------------------|-----------------|----------------------|
| **EZLynx** | **EASY** (Open API) | REST API + Zapier fallback | **Yes** -- fully automated push | 0 (auto-sync) | 2-4 weeks |
| **TurboRater** | **MODERATE** (Gated API) | REST API (credentialed) | **Yes** -- fully automated push | 0 (auto-sync) | 4-8 weeks |
| **PLRating** | **HARD** (Closed ecosystem) | AL3 file generation + manual import | **Partial** -- generate file, agent imports manually | 3-4 clicks | 6-12 weeks |

### Key Finding: Competitors Can't Solve PLRating Either

All three competitors we studied (XILO, Salt, RiskAdvisor) have the same PLRating problem: none have fully automated PLRating integration. Salt's is manual-only (6-7 steps per submission). RiskAdvisor uses a "Bridge Link." XILO uses a link/redirect. **PLRating is the hardest rater to integrate with across the entire industry.**

### Recommended Priority Order

1. **EZLynx first** -- most open ecosystem, best API, 330+ carriers, serves our Texas design partners
2. **TurboRater second** -- good API (gated), 200+ carriers, serves JAMCO (via HawkSoft bridge)
3. **PLRating third** -- interim AL3 file approach, pursue Orange Partner Program for long-term API access

### Biggest Risks & Unknowns

| Risk | Severity | Mitigation |
|------|----------|------------|
| PLRating has no public API; Orange Partner enrollment timeline unknown | **HIGH** | Start with AL3 file generation (interim); apply to Orange Partner Program immediately |
| TurboRater API docs are not public; "difficult to integrate" per users | **MEDIUM** | Contact sales for credentials ASAP; study TurboTags GitHub spec for data model |
| EZLynx API pricing not disclosed; may require enterprise contract | **LOW** | Start with Zapier (free/cheap); negotiate API access in parallel |
| No rater returns quote results back to our system | **MEDIUM** | Build one-way push first; explore EZLynx QAS for backend rating long-term |
| ACORD AL3 spec requires $1,000+ membership for full documentation | **LOW** | Use WinsurTech API ($90/mo) which handles AL3 generation from JSON |

---

## RATER 1: EZLynx (Applied Systems) -- EASIEST

### Overview

- **Owner:** Applied Systems (acquired 2021)
- **Type:** 100% cloud-based comparative rater
- **Carriers:** 330+ across 48 states
- **Lines:** Personal Auto, Home, Dwelling Fire
- **Our Design Partners Using It:** All Texas agencies (East Texas, Venture Casualty, LSM)

### Integration Difficulty: EASY (Open API)

EZLynx has the most open integration ecosystem of the three raters. Multiple pathways exist, from no-code (Zapier) to full API.

### How We Would Integrate (Step-by-Step)

#### Path A: Zapier (Fastest -- days to implement)

**User Experience (0 manual steps after setup):**
1. Lead data collected in our webapp (voice, portal, smart form)
2. Our system triggers a Zapier webhook
3. Zapier creates a Personal Lines Applicant with Opportunity in EZLynx
4. Agent sees the new applicant in EZLynx, clicks "Quote"

**Setup Steps:**
1. Agency needs EZLynx Sales Center license (required for Zapier)
2. We configure a Zap: Our webhook --> EZLynx "Create Personal Lines Applicant with Opportunity"
3. Map our fields to EZLynx fields (name, address, phone, email, DOB, marital status, co-applicant, LOB, prior carrier/premium)

**Limitations:**
- Creates applicant but does NOT auto-trigger rating -- agent must click "Quote"
- Limited to fields Zapier exposes (basic applicant + opportunity data, not full vehicle/driver detail)
- Requires EZLynx Sales Center license (additional cost)

#### Path B: Direct REST API (Most Powerful -- weeks to implement)

**User Experience (0 manual steps):**
1. Lead data collected in our webapp
2. Our backend calls EZLynx REST API to create applicant with full data (drivers, vehicles, property, coverages)
3. Agent receives notification, opens EZLynx, sees fully pre-populated quote
4. Agent clicks "Quote" to run comparative rating

**Technical Details:**
- **Auth:** OAuth 2.0 over HTTPS
- **Format:** JSON and XML supported
- **Endpoints:** Create/update applicants, contacts, prospects, opportunities; create policy headers; get quote results
- **Webhook events available:** `ApplicantCreated`, `ApplicantQuoteCompleted`, `CarrierQuoteCompleted`, `PolicyCreated`, etc.

**Setup Steps:**
1. Contact EZLynx (`ezl-support@appliedsystems.com`) to request API enablement
2. Get API credentials (OAuth client ID/secret)
3. Build integration using Connect Web Services API (REST endpoints for Rating API + Applicant API)
4. Map our Quote Packet fields to EZLynx applicant schema

#### Path C: EZLynx QAS -- Backend Rating (Most Ambitious)

**User Experience (fully automated, 0 steps):**
1. Lead data collected in our webapp
2. Our backend calls EZLynx QAS API
3. EZLynx runs comparative rating in the background (8M+ quotes/month capacity)
4. Quote results returned to our system
5. Agent sees quotes directly in our dashboard -- never leaves our app

**This is the holy grail** but requires enterprise partnership. EZLynx QAS lets you design your own UI while EZLynx handles all backend rating. Supports multiline, multi-carrier, multi-state. Uses configurable templates (downloadable as Excel or JSON).

### What Competitors Do with EZLynx

| Competitor | Method | Auto-Sync? | Official Partner? |
|-----------|--------|-----------|-------------------|
| XILO | Direct API (credentials) | Yes | No |
| Salt | Direct API (EZLynx Connect) | Yes (consumer forms) | **Yes** (official partner since 2021) |
| RiskAdvisor | Direct API (EZLynx enablement) | Yes | No |
| Canopy Connect | EZLynx Marketplace | Yes (250+ fields) | Yes |
| Feathery | Premium integration | Bidirectional | Yes |

### Cost

- EZLynx base: ~$350/month (agency), ~$70/month per user
- API access: Not publicly priced -- likely enterprise add-on
- Zapier path: EZLynx Sales Center license + Zapier subscription (~$20-50/mo)
- QAS: Enterprise negotiation required

### Key Contacts

- **Support:** support@ezlynx.com / (877) 932-2382
- **Integration enablement:** ezl-support@appliedsystems.com

---

## RATER 2: TurboRater (ITC/Zywave) -- MODERATE

### Overview

- **Owner:** Zywave (acquired ITC in 2021)
- **Type:** 100% cloud-based comparative rater
- **Carriers:** 200+ carriers
- **Lines:** Personal Auto, Home, Dwelling Fire, Condo, Renters, Motorcycle
- **Our Design Partners Using It:** JAMCO (via HawkSoft bridge), FOCO

### Integration Difficulty: MODERATE (Gated API)

TurboRater has a real REST API but documentation is gated behind a sales relationship. Multiple integration pathways exist, including an open-source data format (TurboTags).

### How We Would Integrate (Step-by-Step)

#### Path A: REST API (Recommended -- 4-8 weeks)

**User Experience (0 manual steps):**
1. Lead data collected in our webapp
2. Our backend calls TurboRater Rating & Quote Storage API
3. TurboRater runs comparative rating across 200+ carriers
4. Agent receives email with direct link to pre-populated quote in TurboRater
5. Agent opens link, reviews, and binds

**Technical Details:**
- **Auth:** API Account ID (from sales) + ITC Account Number (6-digit, found in TurboRater portal)
- **Architecture:** RESTful
- **Lines:** Auto, Home, Flood
- **Capabilities:** Create quotes, rate across carriers, store/retrieve quotes, real-time premiums

**Setup Steps:**
1. Contact TurboRater sales (800-383-3482, Option 4) to request API Account ID
2. Provide ITC Account Number from agency's TurboRater portal
3. Customer Success Manager activates the integration
4. Build integration using provided API documentation
5. Map our Quote Packet fields to TurboRater schema

**Caveat:** Users on G2 describe API as "very flexible" but "very difficult to integrate, with errors that are very seldom obvious." Plan for extra debugging time.

#### Path B: TurboTags (.TT2) File Generation (Interim -- 2-4 weeks)

**User Experience (1-2 manual steps):**
1. Lead data collected in our webapp
2. Our system generates a TurboTags .TT2 file
3. Agent downloads the .TT2 file (or it's auto-saved to a known folder)
4. Agent opens TurboRater, imports the .TT2 file via bridge
5. Data pre-populates, agent runs quotes

**Technical Details:**
TurboTags is ITC's **openly documented** integration format, published on GitHub:
- **Format:** CSV-like, each line: `"tagname","scope","value1","value2","value3","value4"`
- **Scopes:** `sys0` (system), `pol0` (policy), `drv1`-`drv6` (drivers), `car1`-`car6` (vehicles)
- **13 tag categories:** System, Policy, Driver, Car, Violation, Rate Engine, etc.
- **GitHub:** [getitc/turbotags](https://github.com/getitc/turbotags)

**Example TT2 file for a personal auto quote:**
```
"version","sys0","2.0","","",""
"state","sys0","TX","","",""
"firstname","drv1","John","","",""
"lastname","drv1","Smith","","",""
"dob","drv1","01/15/1985","","",""
"gender","drv1","M","","",""
"maritalstatus","drv1","M","","",""
"dlnum","drv1","12345678","","",""
"year","car1","2022","","",""
"make","car1","Toyota","","",""
"model","car1","Camry","","",""
"vin","car1","4T1BF1FK5CU123456","","",""
"usage","car1","C","","",""
"annualmiles","car1","12000","","",""
```

#### Path C: Iframe Embedding with Prefill (Quick launch -- 1-2 weeks)

**User Experience (agent works within our app):**
1. Agent opens our webapp
2. TurboRater is embedded in an iframe within our app
3. Data from our Quote Packet is pre-filled into the embedded TurboRater via props
4. Agent completes any remaining fields and runs quotes directly in the iframe

**Technical Details:**
An open-source React component exists: [LeaseCo/react-turborater](https://github.com/LeaseCo/react-turborater)
- `prefill` prop: fname, lname, email, address, VIN, etc.
- `onPageLoad` callbacks: welcome, namedInsured, EditCar, AddCars, Finished
- Custom CSS/JS injection into iframe
- `postMessage` for parent-iframe communication
- Register JS file in TurboRater admin portal for production

### What Competitors Do with TurboRater

| Competitor | Method | Auto-Sync? |
|-----------|--------|-----------|
| XILO | Direct API (Zywave credentials) | Yes |
| Salt | **Not supported** | N/A |
| RiskAdvisor | **Not supported** | N/A |
| GravityCerts | REST API | Yes (agent gets link to active quote) |
| Canopy Connect | Direct integration | Yes (250+ data points) |
| InsuredMine | Two-way sync | Yes |

**Only XILO among the competitors integrates with TurboRater.** This is an opportunity for differentiation.

### How the HawkSoft-to-TurboRater Bridge Works (for JAMCO)

1. Agent opens client record in HawkSoft
2. Clicks bridge/integration button in HawkSoft toolbar
3. HawkSoft exports client data as a TurboTags .TT2 file
4. TurboRater opens in browser with data pre-populated
5. Agent completes remaining fields, runs quotes

**Limitation:** One-directional only. Results don't flow back to HawkSoft. Local integration center required.

### Zywave Winter 2026 Update (Just Announced)

Zywave unveiled a **two-way Partner Platform <--> TurboRater integration** with SSO and automatic data exchange. Rolling out to 35+ early adopters. This could be a future pathway for us.

### Cost

- TurboRater subscription: ~$70-250/month per user (custom-quoted)
- API access: Not publicly priced (likely included with subscription, but must confirm)
- TurboTags: Free (open-source spec on GitHub)
- Iframe embedding: Free (open-source React wrapper)

### Key Contacts

- **Sales (API access):** 800-383-3482, Option 4
- **Carrier integration:** carriers@getitc.com
- **Support:** support.zywave.com

---

## RATER 3: PLRating (Vertafore) -- HARDEST

### Overview

- **Owner:** Vertafore
- **Type:** Cloud-based comparative rater (was desktop, now web-based)
- **Carriers:** 150+ carriers across 48 states
- **Lines:** Personal Auto, Home, Dwelling Fire, Renters, Condo, Motorcycle
- **Our Design Partners Using It:** Ley Insurance, Seguros

### Integration Difficulty: HARD (Closed Ecosystem)

PLRating has the most restricted integration ecosystem. No public API, no Zapier connector, and the primary import mechanism (AL3 files) requires manual user action. Competitors are equally stuck.

### How We Would Integrate (Step-by-Step)

#### Path A: AL3 File Generation + Manual Import (Interim -- 4-6 weeks)

**User Experience (3-4 manual steps):**
1. Lead data collected in our webapp (voice, portal, smart form)
2. Our backend generates an ACORD AL3 file from the collected data
3. Agent clicks "Download AL3" button in our webapp
4. Agent opens PLRating
5. Agent clicks File > Import > Browse to downloaded .al3 file
6. PLRating populates all fields from the AL3 file
7. Agent reviews, completes any gaps, runs quotes

**How AL3 Files Work:**
- AL3 is a **fixed-width positional EDI format** from ACORD (the insurance standards body)
- Uses `?` as placeholders for missing data
- Organized into groups:
  - **Transaction groups:** `1MHG` (header), `2TRG` (routing), `3MTG` (trailer)
  - **Data groups:** `5BIS` (insured info), `5DRV` (drivers), `5VEH` (vehicles), `5BCI` (building construction), `6CVA` (auto coverage)
- Line of business codes: `AUTOP` (personal auto), `HOME` (homeowners)
- Used by 500+ carriers and 20,000+ agents industry-wide

**How to generate AL3 programmatically:**
- **WinsurTech AL3 Creator API** (~$90/month): REST API that accepts JSON and returns AL3 files
  - Send our Quote Packet data as JSON
  - Receive properly formatted .al3 file
  - No need to understand the AL3 spec ourselves
- **Alternative:** Build our own AL3 generator (requires ACORD membership at $1,000+/term for spec access)

**Step count analysis for the agent:**
| Step | Action | Time |
|------|--------|------|
| 1 | Click "Export to PLRating" in our app | 1 sec |
| 2 | AL3 file downloads to their computer | 2 sec |
| 3 | Open PLRating (if not already open) | 5 sec |
| 4 | File > Import > Browse to Downloads folder > Select file | 10 sec |
| 5 | Review populated fields, fill any gaps | 30-60 sec |
| **Total** | | **~50-80 sec** |

Compared to manually entering 40+ fields (15-30 minutes), this saves **~95% of data entry time** even with the manual import steps.

#### Path B: Vertafore Orange Partner Program + Rating API (Long-term -- 3-6 months)

**User Experience (0 manual steps -- fully automated):**
1. Lead data collected in our webapp
2. Our backend calls Vertafore Rating API
3. PLRating creates applicant with all data pre-populated
4. Agent receives notification, opens PLRating, reviews and quotes

**Technical Details:**
- Vertafore has a **Developer Portal** at `developer.vertafore.com`
- A **Rating API** exists (reference at `rating-reference.vertafore.com`) with at least a `PreRating/States` endpoint
- Access requires VSSO (Vertafore Single Sign-On) credentials
- Must be either a licensed Vertafore customer or enrolled in the **Orange Partner Program**
- The API was described as "forthcoming" in some documentation, suggesting it may be newly available or still in limited release

**How to apply:**
1. Contact Vertafore about the Orange Partner Program
2. Program provides: integration toolkit, test instance, documentation
3. Build integration against test environment
4. Deploy to production

**Proof it works:** Canopy Connect and Feathery both have working PLRating integrations that push data programmatically, proving the technical pathway exists via the Orange Partner API.

#### Path C: Consumer Rate Quotes (CRQ) Link (Limited Use)

**User Experience (customer self-service):**
1. We generate a CRQ URL: `https://secure.consumerratequotes.com/ConsumerV2?id=#####&lob=auto&ref1=tracking_id`
2. Customer clicks the link (e.g., via SMS or email)
3. Customer enters their own information on the CRQ form
4. Data flows into the agency's PLRating queue

**Limitation:** CRQ does NOT support pre-filling client data via URL parameters. Consumers must self-enter everything. This is useful only as a "send to customer" portal, not as a "push data from our system" mechanism. Can be embedded via iframe.

### What Competitors Do with PLRating

| Competitor | Method | Auto-Sync? | Steps Per Submission |
|-----------|--------|-----------|---------------------|
| XILO | Link/redirect handoff | No (generates link) | 2-3 clicks |
| Salt | Manual send + redirect link | **No** (manual only) | **6-7 clicks** |
| RiskAdvisor | "Bridge Link" + redirect | Unclear | ~3 clicks |

**Nobody has solved automated PLRating integration.** This is an industry-wide problem caused by Vertafore's closed ecosystem.

### ACORD AL3 Format Deep Dive

For anyone building the AL3 generator, here is the structure:

**Transaction Group Structure:**
```
1MHG  [Message Header Group - contains sender/receiver IDs, date, message type]
2TRG  [Transaction Routing Group - contains LOB code, action type]
  5BIS  [Basic Insured - name, address, SSN, DOB, phone, email]
  5DRV  [Driver - name, DOB, DL#, gender, marital status, years licensed]
  5DRV  [Driver 2...]
  5VEH  [Vehicle - year, make, model, VIN, usage, annual miles, ownership]
  5VEH  [Vehicle 2...]
  6CVA  [Coverage Auto - liability limits, comp/collision deductibles, UM/UIM]
  5BCI  [Building Construction - year built, sq ft, construction type, roof, foundation]
  6CVH  [Coverage Home - dwelling amount, personal property, liability, deductible]
3MTG  [Message Trailer Group - record count, checksum]
```

**Key field codes (Personal Auto):**
- `AUTOP` = Personal Auto line of business
- `5BIS` = Named insured (name, DOB, SSN, address, phone, email)
- `5DRV` = Driver details (per driver, up to 6)
- `5VEH` = Vehicle details (per vehicle, up to 6)
- `6CVA` = Auto coverages (liability, comp/collision, UM/UIM, per vehicle)

**Key field codes (Homeowners):**
- `HOME` = Homeowners line of business
- `5BCI` = Building construction (year built, sq ft, stories, roof, construction type)
- `6CVH` = Homeowners coverages (dwelling, personal property, liability, deductible)

### Cost

- WinsurTech AL3 Creator API: **~$90/month** (recommended for interim approach)
- ACORD membership (for raw spec): $1,000+/term (not needed if using WinsurTech)
- PLRating agency licensing: ~$100-300+/month (not our cost -- agency pays)
- CRQ add-on: Additional charge for agencies (not our cost)
- Orange Partner Program: Unknown -- must contact Vertafore
- **No Zapier, Make, or n8n connectors exist for PLRating**

### Key Contacts

- **Vertafore Developer Portal:** developer.vertafore.com
- **Orange Partner Program:** Contact via Vertafore sales
- **WinsurTech AL3 API:** winsurtech.com

---

## COMPETITOR ANALYSIS: How XILO, Salt, and RiskAdvisor Integrate

### Cross-Competitor Comparison

| Dimension | XILO | Salt | RiskAdvisor |
|-----------|------|------|-------------|
| **EZLynx** | Direct API (auto-sync) | Direct API (official partner, auto-sync) | Direct API (auto-sync) |
| **TurboRater** | Direct API (Zywave key) | **Not supported** | **Not supported** |
| **PLRating** | Link/redirect | Manual only (6-7 steps) | Bridge Link (~3 steps) |
| **Applied Rater** | File upload (manual) | Not supported | Not supported |
| **Total raters** | 8+ | 3 | 3 |
| **Universal fallback** | XAI Chrome Extension (AI auto-fill) | None | None |
| **Official EZLynx partner?** | No | **Yes** | No |
| **Bidirectional data?** | No | No | No |

### XILO's Chrome Extension Approach (XAI)

XILO built an AI-powered Chrome Extension that can "scan and fill any web form." This is their universal fallback for raters without API access:
1. Customer completes XILO quote form
2. Client data appears in Chrome Extension's "Client List"
3. Agent navigates to ANY web-based system (rater, AMS, carrier portal)
4. Agent clicks "Fill Page" for the relevant client
5. Extension auto-fills the form fields

**Pricing:** Free tier = 7 auto-fills/month; Pro = unlimited

**Takeaway:** This is essentially browser-level RPA. Fragile, but clever for covering raters without APIs. We should consider this as a Phase 2 fallback.

### Strategic Gaps We Can Exploit

1. **No competitor returns quote results from raters** -- this is the biggest unserved need
2. **PLRating integration is universally weak** -- even the best competitor (RiskAdvisor) uses a semi-manual bridge
3. **Only XILO supports TurboRater** -- we'd be one of very few to offer this
4. **No competitor supports commercial lines raters** -- future opportunity
5. **Salt's "Assumptions" feature is clever** -- pre-setting defaults for required fields the form doesn't collect. We should replicate this.

---

## IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (Weeks 1-4)

| Action | Rater | Effort | Impact |
|--------|-------|--------|--------|
| Set up Zapier webhook --> EZLynx | EZLynx | 1-2 days | Automated applicant creation for Texas partners |
| Build TurboTags .TT2 generator | TurboRater | 1-2 weeks | File-based import for JAMCO/FOCO |
| Build AL3 file generator (via WinsurTech API) | PLRating | 2-3 weeks | Download + manual import for Ley/Seguros |

### Phase 2: API Integrations (Weeks 4-12)

| Action | Rater | Effort | Impact |
|--------|-------|--------|--------|
| Contact EZLynx for REST API credentials | EZLynx | 1 week (admin) | Unlocks full data push (drivers, vehicles, coverages) |
| Contact TurboRater for API Account ID | TurboRater | 1 week (admin) | Unlocks programmatic quote submission |
| Apply to Vertafore Orange Partner Program | PLRating | Unknown timeline | Unlocks Rating API for seamless integration |
| Build EZLynx REST API integration | EZLynx | 2-4 weeks | 0-step automated sync with full data |
| Build TurboRater REST API integration | TurboRater | 4-6 weeks | 0-step automated quote with link to agent |

### Phase 3: Advanced (Months 3-6)

| Action | Rater | Effort | Impact |
|--------|-------|--------|--------|
| EZLynx QAS backend rating | EZLynx | 6-8 weeks | Quotes returned to our app -- agent never leaves |
| PLRating API integration (if Orange Partner approved) | PLRating | 4-6 weeks | 0-step automated sync |
| TurboRater iframe embedding | TurboRater | 2-3 weeks | Agent quotes within our app |
| Chrome extension fallback (like XILO XAI) | All | 4-6 weeks | Universal auto-fill for any web rater |

---

## IMMEDIATE NEXT STEPS

1. **Email `ezl-support@appliedsystems.com`** to request API enablement for EZLynx (do this today)
2. **Call TurboRater sales at 800-383-3482 (Option 4)** to request API Account ID and documentation
3. **Contact Vertafore** about the Orange Partner Program for PLRating API access
4. **Sign up for WinsurTech AL3 Creator API** ($90/month) for interim PLRating AL3 file generation
5. **Study the TurboTags GitHub wiki** ([getitc/turbotags](https://github.com/getitc/turbotags)) to understand TurboRater's complete field model

---

## APPENDIX A: Detailed EZLynx API Reference

### REST API Capabilities

- **Applicant CRUD:** Create, read, update, delete applicants (Auto, Home, Dwelling Fire)
- **Contact management:** Create/update contacts, prospects, opportunities
- **Policy headers:** Create policy records
- **Documents:** Get email templates, documents
- **Quote results:** Retrieve carrier quotes and premiums
- **Auth:** OAuth 2.0 over HTTPS
- **Formats:** JSON and XML

### Webhook Events

| Event | Description |
|-------|-------------|
| `ApplicantCreated` | New applicant added |
| `ApplicantUpdated` | Applicant data modified |
| `ApplicantDeleted` | Applicant removed |
| `ApplicantQuoteCompleted` | All carriers have returned quotes |
| `CarrierQuoteCompleted` | Individual carrier returned a quote |
| `DynamicPromptsRequired` | Carrier needs additional info |
| `PolicyCreated` | Policy bound |
| `PolicyUpdated` | Policy modified |
| `OpportunityCreated` | New sales opportunity |
| `OpportunityUpdated` | Opportunity modified |

### Zapier Fields (Create Personal Lines Applicant)

**Required:** First Name, Last Name, Address
**Optional:** Prefix, Middle Initial, Suffix, Gender, DOB, Marital Status, SSN, Home/Mobile/Work Phone, Email, Co-Applicant (First Name, Last Name, Phone, Email, Relationship), Opportunity LOB, LOB Source, Prior Carrier, Prior Premium, Finalized Premium, Finalized Carrier, Assigned Username, Lead Source, Notes, X Date

### Quoting Automation Services (QAS)

- Custom UI with backend EZLynx rating
- 8M+ quotes/month capacity
- Multiline support
- Template-based configuration (downloadable as Excel or JSON)
- Configurable by state, LOB, carrier
- Template sections: state selection, underwriting questions, dwelling info, auto info, coverages, carrier selection

### EZLynx Connect Marketplace

- 114 partners (96 tech, 18 channel)
- 20,000+ daily active users
- Categories: Rating/Pre-Fill, Cross-Sell, Financial, Customer Engagement, Communications, Automation
- Build integrations independently using Connect APIs
- Legal/security review required for sensitive data
- Contact: partner inquiry forms on ezlynx.com/partners

---

## APPENDIX B: Detailed TurboRater Technical Reference

### REST API

- **Architecture:** RESTful
- **Auth:** API Account ID + ITC Account Number
- **Lines:** Auto, Home, Flood
- **Capabilities:** Create quotes, rate across carriers, store/retrieve quotes
- **Response:** Real-time premiums (avg 4 sec)
- **Access:** Gated -- must contact sales for credentials and docs

### TurboTags 2.0 (.TT2) Specification

**GitHub:** [getitc/turbotags](https://github.com/getitc/turbotags)

**Format:** `"tagname","scope","value1","value2","value3","value4"`

**Scopes:**

| Scope | Description | Max |
|-------|-------------|-----|
| `sys0` | System info | 1 |
| `pol0` | Policy info | 1 |
| `drv1`-`drv6` | Drivers | 6 |
| `car1`-`car6` | Vehicles | 6 |
| `mpr1`+ | Misc premium | N |
| `exc1`-`exc6` | Excluded drivers | 6 |
| `use1`-`use6` | Usage info | 6 |
| `drv1:vio1` | Violations per driver | N |
| `rnb1`+ | Carrier not bound reasons | N |

**Common Driver Tags:**
- `firstname`, `lastname`, `dob`, `gender`, `maritalstatus`
- `dlnum`, `dlstate`, `dlstatus`
- `relation` (to named insured)
- `occupation`, `industry`, `education`
- `goodstudent`, `defensivedriver`

**Common Vehicle Tags:**
- `year`, `make`, `model`, `vin`
- `usage` (P=pleasure, C=commute, B=business, F=farm)
- `annualmiles`, `onemilecommute`
- `ownership` (O=owned, F=financed, L=leased)
- `garagingaddress`, `garagingcity`, `garagingstate`, `garagingzip`
- `antilock`, `antitheft`, `airbags`

**Common Coverage Tags:**
- `bilimit`, `pdlimit`, `umbi`, `umpd`
- `compded`, `collded` (per vehicle)
- `towing`, `rental`
- `pip`, `pipded` (state-specific)

### Iframe Embedding (react-turborater)

**GitHub:** [LeaseCo/react-turborater](https://github.com/LeaseCo/react-turborater)

**Props:**
- `accountId` (required): TurboRater account ID
- `prefill` (object): Pre-populate form fields
- `style` (object): iframe dimensions
- `autoResize` (boolean): auto-resize iframe
- `frameCSS` (string): custom CSS file
- `frameScripts` (array): custom JS files
- `onPageLoad` (object): page navigation callbacks
- `development` (boolean): dev mode

**Page Events:** welcome, general, namedInsured, Spouse, AddDrivers, EditCar, AddCars, LimitPackages, AUcomparison, Finished

---

## APPENDIX C: Detailed PLRating / ACORD AL3 Reference

### PLRating Import Methods

| Method | Automated? | Available to Us? | Notes |
|--------|-----------|-----------------|-------|
| AL3 File Import | Manual browse/upload | **Yes** | User downloads file, imports in PLRating |
| EMS Service | Automated | **No** (Vertafore-internal, AMS360 only) | N/A |
| Consumer Rate Quotes (CRQ) | Consumer self-service | **Partial** | Cannot pre-fill data via URL |
| Orange Partner API | Automated | **Yes (with partnership)** | Must apply to Orange Partner Program |

### ACORD AL3 File Structure

**Transaction Envelope:**
```
1MHG - Message Header Group
  SenderID, ReceiverID, Date, Time, MessageType
2TRG - Transaction Routing Group
  LOBCode (AUTOP/HOME), ActionType (NEW/CHANGE/CANCEL)
  [Data Groups...]
3MTG - Message Trailer Group
  RecordCount, Checksum
```

**Personal Auto Data Groups:**
| Group | Content | Fields |
|-------|---------|--------|
| `5BIS` | Named Insured | Name, DOB, SSN, Address, Phone, Email |
| `5DRV` | Driver (repeatable) | Name, DOB, DL#, Gender, Marital, Years Licensed |
| `5VEH` | Vehicle (repeatable) | Year, Make, Model, VIN, Usage, Miles, Ownership |
| `6CVA` | Auto Coverage | BI limits, PD limits, UM/UIM, Comp/Coll deductibles |

**Homeowners Data Groups:**
| Group | Content | Fields |
|-------|---------|--------|
| `5BIS` | Named Insured | Name, DOB, Address |
| `5BCI` | Building Construction | Year built, Sq ft, Stories, Roof, Construction, Foundation |
| `6CVH` | Home Coverage | Dwelling, Personal Property, Liability, Deductible |

### WinsurTech AL3 Creator API

- **Price:** ~$90/month
- **Input:** JSON with applicant/driver/vehicle/property data
- **Output:** Properly formatted ACORD AL3 file
- **Benefit:** No need to understand AL3 spec; handles all formatting
- **Use case:** Our backend sends JSON --> gets .al3 file --> user downloads and imports into PLRating

### Vertafore Developer Portal

- **URL:** developer.vertafore.com
- **Rating API reference:** rating-reference.vertafore.com
- **Known endpoint:** `PreRating/States`
- **Auth:** VSSO (Vertafore Single Sign-On)
- **Access:** Licensed customer or Orange Partner enrollment
- **Status:** May be newly available or in limited release

### Orange Partner Program

- Official channel for third-party integration with Vertafore products
- Provides: integration toolkit, test instance, documentation
- Access process: Contact Vertafore sales
- Timeline: Unknown (must inquire)
- **Proof of concept:** Canopy Connect and Feathery both have working PLRating integrations via this program

---

## APPENDIX D: Competitor Integration Reference

### Full Competitor Rater Support Matrix

| Rater | XILO | Salt | RiskAdvisor | **Us (Proposed)** |
|-------|------|------|-------------|-------------------|
| EZLynx | API | API (official partner) | API | **API + Zapier** |
| TurboRater | API | -- | -- | **API + TT2 + iframe** |
| PLRating | Link/redirect | Manual (6-7 steps) | Bridge Link | **AL3 file (interim) + API (long-term)** |
| Applied Rater | File upload | -- | -- | Future |
| QuoteRush | Listed | -- | Direct | Future |
| Applied Epic Quotes | Listed | Listed | -- | Future |
| IBQ | Listed | -- | -- | Future |
| Tarmika | Listed | -- | -- | Future |

### Sources (All Research)

**EZLynx:**
- [EZLynx API Solutions](https://www.ezlynx.com/products/ezlynx-api-solutions/)
- [EZLynx QAS](https://www.ezlynx.com/qas.html)
- [EZLynx Connect Web Services API (Postman)](https://documenter.getpostman.com/view/7956984/2s9YBxac8Q)
- [EZLynx API Events (Postman)](https://documenter.getpostman.com/view/17108315/UVXjHahb)
- [EZLynx Rating Engine](https://www.ezlynx.com/products/rating-engine/)
- [EZLynx Zapier](https://zapier.com/apps/ezlynx/integrations)
- [EZLynx Technology Partners](https://www.ezlynx.com/partners/)
- [EZLynx Connect Strategy](https://www.ezlynx.com/blog/posts/our-strategy-with-ezlynx-connect/)

**TurboRater:**
- [TurboRater Rating API](https://www.turborater.com/products/rating/api/)
- [Zywave TurboRater](https://www.zywave.com/personal-lines/sales-cloud/turborater/)
- [TurboTags GitHub](https://github.com/getitc/turbotags)
- [react-turborater GitHub](https://github.com/LeaseCo/react-turborater)
- [HawkSoft Bridge Setup](https://support.zywave.com/s/article/How-do-I-set-up-the-Hawksoft-bridge-from-TurboRater)
- [Zywave Winter 2026](https://aijourn.com/zywave-unveils-winter-2026-release-to-help-brokers-win-more-deals-faster/)

**PLRating:**
- [Vertafore Developer Portal](https://developer.vertafore.com/)
- [PLRating Product Page](https://www.vertafore.com/products/insurance-comparative-rater/pl-rating)
- [Vertafore APIs in InsurTech](https://www.vertafore.com/resources/blog/apis-insurtech-simplifying-complex-connections)
- [Consumer Rate Quotes](https://www.vertafore.com/products/consumer-rate-quotes-pl-rating)
- [Feathery PLRating Integration](https://www.feathery.io/integrations/pl-rating)
- [Agency Systems Wiki - PLRating](https://wiki.agencysystems.com/wiki/PL_Rating_Integration_(Vertafore))

**Competitors:**
- [XILO Integrations](https://www.xilo.io/integrations)
- [Salt Knowledge Base](https://support.saltinsure.com/)
- [RiskAdvisor EZLynx](https://help.riskadvisor.insure/articles/4819758-ezlynx-integration)
- [RiskAdvisor PL Rating](https://riskadvisor.insure/integrations/riskadvisor-pl-rating/)
- [Full competitor analysis](../../../Market_Research/2026-02-23-competitor-rater-integration-analysis.md)
