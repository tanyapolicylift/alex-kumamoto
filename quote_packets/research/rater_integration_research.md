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
| **PLRating** | **MODERATE** (Gated API via Integration Partner) | Vertafore Rating API (server-to-server push + link) | **Yes** -- 2-click flow (send + open link) | 2 clicks | 4-8 weeks (with Integration Partner access) |

### Key Finding: PLRating IS Solvable -- Competitors Already Do It

**CORRECTION (2026-02-23, deep research):** PLRating integration is NOT limited to manual AL3 file import. Vertafore has a **Rating API** that enables server-to-server data push.

**CRITICAL DISCOVERY: There are TWO separate Vertafore partnership programs:**

1. **Orange Partner Program** -- The well-known program for deep AMS360/Sagitta integrations. ~45 partners. Requires extensive legal/security review. This is NOT what most rater integrators use.

2. **PL Rating Integration Partner Program** -- A SEPARATE, less-known program specifically for feeding data into PL Rating. ~30 partners listed at `help.vertafore.com/plrating/content/howto/integration_partners.htm`. This is what Salt, XILO, Feathery, RiskAdvisor, EverQuote, QuoteWizard, NowCerts, and others use. **No PL Rating admin configuration needed on the agency side.**

**The ~28 known PL Rating Integration Partners include:** SALT, XILO, Canopy Connect, RiskAdvisor, EverQuote, QuoteWizard, Feathery, Momentum AMS, NowCerts, and ~19 others.

**The technical mechanism ("Temporary State + Claim" pattern):**
1. Our backend calls Vertafore's **Rating API** with applicant/driver/vehicle/coverage payload
2. API creates a submission in a **temporary/unclaimed state** (data is held but not assigned to any agency)
3. API returns a **deep link URL** (format: `rating.vertafore.com/UserInterface/main/iFrameTest.aspx?Partner={ID}&Redir=../Connect/Connect.aspx?Import=1`)
4. Agent must be **logged into PL Rating** already
5. Agent clicks the link --> PL Rating opens with ALL data pre-filled
6. The submission is **"claimed"** -- permanently associated with the agent's account
7. Agent reviews, fills any gaps, runs quotes

**No file download. No AL3 file. No manual import. Clean server-to-server handoff.**

**Rating API technical details:**
- Separate API key system (NOT OAuth like AMS360)
- Swagger/OpenAPI specs available from Vertafore's API Catalog
- SDK generation available in C# and Java
- Developer Portal at `developer.vertafore.com`
- Rating API Reference at `rating-reference.vertafore.com`
- Referenced in PL Rating 2022 R2 Release Notes as a distinct import type

**Competitors already doing this:**
- **Salt** uses a 2-step "Request Client Link" + "Confirm and Sync" flow -- Salt's backend calls the Rating API, gets back a session link, agent clicks to open PLRating with data pre-filled
- **Canopy Connect** (also an Orange Partner) does a single "Submit to PL Rating" click
- **XILO** has two methods: legacy AL3 export (80% data) AND newer Rating API link generation
- **Feathery** maps form fields to PLRating quoting properties on form submit
- **Momentum AMS** documentation confirms: "PL Rating does not authenticate initially, and your submitted quote will be held in a temporary state until you claim it by authenticating"

### Recommended Priority Order

1. **EZLynx first** -- most open ecosystem, best API, 330+ carriers, serves our Texas design partners
2. **TurboRater second** -- good API (gated), 200+ carriers, serves JAMCO (via HawkSoft bridge)
3. **PLRating third** -- apply to **PL Rating Integration Partner program** ASAP for Rating API access; AL3 file as backup interim only

### Biggest Risks & Unknowns

| Risk | Severity | Mitigation |
|------|----------|------------|
| PL Rating Integration Partner enrollment timeline unknown; may take weeks-months | **HIGH** | Apply immediately; use AL3 file generation as interim fallback |
| TurboRater API docs are not public; "difficult to integrate" per users | **MEDIUM** | Contact sales for credentials ASAP; study TurboTags GitHub spec for data model |
| EZLynx API pricing not disclosed; may require enterprise contract | **LOW** | Start with Zapier (free/cheap); negotiate API access in parallel |
| No rater returns quote results back to our system | **MEDIUM** | Build one-way push first; explore EZLynx QAS for backend rating long-term |
| Vertafore Rating API documentation is gated (JS-rendered portal, VSSO auth required) | **MEDIUM** | Integration Partner enrollment includes documentation; Swagger/OpenAPI specs available from API Catalog |

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

## RATER 3: PLRating (Vertafore) -- MODERATE (Corrected)

### Overview

- **Owner:** Vertafore
- **Type:** Cloud-based comparative rater (was desktop, now web-based)
- **Carriers:** 150+ carriers across 48 states
- **Lines:** Personal Auto, Home, Dwelling Fire, Renters, Condo, Motorcycle
- **Our Design Partners Using It:** Ley Insurance, Seguros

### Integration Difficulty: MODERATE (Server-to-Server via Rating API)

**IMPORTANT CORRECTION:** Initial research labeled PLRating as "HARD / closed ecosystem." Deep investigation reveals this is wrong. Vertafore has a **Rating API** accessible via the **PL Rating Integration Partner program** (separate from the Orange Partner Program). ~30 companies already use this to achieve a seamless 1-2 click flow. PLRating is NOT limited to manual AL3 file import.

### How Competitors ACTUALLY Integrate with PLRating (The Real Story)

#### Salt's Flow (2 clicks per submission -- NOT 6-7 as initially reported)

Salt's PLRating integration is a **server-to-server data push**, not a file download/upload:

1. Agent clicks **"Request Client Link"** in Salt
   - Salt's backend calls Vertafore's Rating API
   - Sends the full applicant/driver/vehicle/coverage payload
   - Vertafore validates the data and creates a pending quote session
   - Returns a session URL/link to Salt
   - Button changes to "Confirm and Sync"

2. Agent clicks **"Confirm and Sync"**
   - Opens PLRating in a new browser tab via the session URL
   - PLRating loads with ALL data pre-filled (drivers, vehicles, coverages, etc.)
   - Agent must be logged into PLRating already for the session to work
   - Agent reviews, completes any gaps, runs quotes

**Key insight:** There is NO file download, NO AL3 file, NO manual import. It's a clean server-to-server handoff that opens PLRating with data already loaded.

#### Canopy Connect's Flow (1 click per submission)

Canopy Connect is an **official Orange Partner** (confirmed on Vertafore's partner page):

1. Agent clicks **"Submit to PL Rating"** in Canopy Connect
2. New window opens to PLRating with pre-filled fields for all drivers, vehicles, properties, and coverages (250+ fields)
3. Agent completes any remaining fields and quotes

#### XILO's Flow (1 click per submission)

1. Agent submits XILO form
2. XILO generates a link (via email or dashboard)
3. Agent clicks link --> opens PLRating with client data pre-populated

**Note:** XILO also has an older AL3 file-based method (documented in their help articles) that gets ~80% of data. Their newer link-based method appears to use the same API approach as Salt and Canopy.

#### Feathery's Flow (automated on form submit)

1. Feathery form fields are mapped to PLRating quoting properties
2. On form submission, data flows to PLRating and creates new records
3. This is described as a "Premium" integration tier

### How WE Should Integrate (Recommended: Rating API)

#### Path A: Vertafore Rating API via PL Rating Integration Partner Program (RECOMMENDED -- 4-8 weeks)

**User Experience (2 clicks):**
1. Lead data collected in our webapp (voice, portal, smart form)
2. Agent clicks **"Send to PLRating"** in our app
3. Our backend calls Vertafore's Rating API with the full payload (API key auth)
4. API creates a submission in **temporary/unclaimed state** and returns a **deep link URL**
5. We open that URL in a new browser tab (or auto-redirect)
6. PLRating opens with data pre-filled; agent **claims** the submission by being logged in
7. Agent reviews, fills any gaps, runs quotes

**This is EXACTLY what Salt, Canopy Connect, XILO, Feathery, Momentum AMS, and ~23 other Integration Partners all do.**

**Technical Details:**
- **Rating API** with its own API key system (separate from AMS360 OAuth)
- **Swagger/OpenAPI specs** available from Vertafore's API Catalog
- **SDK generation** available in C# and Java
- Developer Portal at `developer.vertafore.com`
- Rating API Reference at `rating-reference.vertafore.com`
- Known endpoint: `PreRating/States`
- Deep link format: `rating.vertafore.com/UserInterface/main/iFrameTest.aspx?Partner={NumericID}&Redir=../Connect/Connect.aspx?Import=1`
- **"Temporary state + claim" pattern**: Data is submitted without authentication; the agent's login session claims it when they click the link
- Partners listed at `help.vertafore.com/plrating/content/howto/integration_partners.htm`
- Partners marked as "import only" (no "Add-on Product Tab") = they use the Rating API with no agency-side PL Rating configuration needed

**How to apply (PL Rating Integration Partner -- NOT the Orange Partner Program):**
1. Contact Vertafore about the **PL Rating Integration Partner program** (this is separate from and easier than the Orange Partner Program)
2. Reference the existing ~30 partners as precedent (Salt, XILO, Feathery, EverQuote, etc.)
3. Request API key and access to Swagger/OpenAPI documentation
4. Build integration against test environment using C# or Java SDK (or raw REST)
5. Deploy to production -- no agency-side PLRating admin configuration required

**Why NOT Orange Partner Program (unless we also want AMS360 integration):**
- Orange Partner Program is for broad Vertafore ecosystem integration (AMS360, Sagitta, etc.)
- PL Rating Integration Partner is specifically for rater data submission
- ~30 companies have Integration Partner access vs ~45 Orange Partners -- different programs, different requirements
- Integration Partner appears to be a lighter-weight enrollment: sign a developer agreement (Order), get VSSO credentials, develop in Sandbox, submit for Live approval

**Enrollment process (based on Vertafore Developer Portal docs):**
1. Contact Vertafore business development
2. Sign a developer agreement/Order (the API terms at vertafore.com/terms make NO distinction between Orange Partners and other API users)
3. Get VSSO credentials and Developer Portal access
4. Create an application, get API Key + Secret Key for Rating API
5. Develop against Sandbox using Swagger/OpenAPI specs + C#/Java SDKs
6. Submit for Vertafore approval to promote to Live
7. Get listed on the PL Rating Integration Partners page
8. **Production endpoint:** `bridge-rating.vertafore.com` (Bridge Service API)

**Step count analysis for the agent:**
| Step | Action | Time |
|------|--------|------|
| 1 | Click "Send to PLRating" in our app | 1 sec |
| 2 | PLRating opens in new tab with data pre-filled | 3 sec |
| 3 | Review populated fields, fill any gaps | 30-60 sec |
| **Total** | | **~35-65 sec** |

#### Path B: AL3 File Generation (BACKUP/INTERIM ONLY)

Use this ONLY if Orange Partner enrollment takes too long. Agent experience is worse (3-4 extra clicks for file download/import) but still saves 95% of manual data entry time.

**User Experience (4-5 manual steps):**
1. Agent clicks "Export AL3" in our app
2. AL3 file downloads to their computer
3. Agent opens PLRating
4. File > Import > Browse to Downloads folder > Select file
5. PLRating populates all fields from the AL3 file
6. Agent reviews, fills gaps, runs quotes

**How to generate AL3 programmatically:**
- **WinsurTech AL3 Creator API** (~$90/month): REST API that accepts JSON and returns AL3 files
- **Alternative:** Build our own AL3 generator (requires ACORD membership at $1,000+/term)

#### Path C: Consumer Rate Quotes (CRQ) Link (Limited Use -- Not Recommended)

CRQ portal at `https://secure.consumerratequotes.com/ConsumerV2?id=#####&lob=auto` does NOT support pre-filling data via URL. Consumers must self-enter. Only useful for self-service portal, not for pushing our data.

### What Competitors Do with PLRating (Corrected -- Final)

| Competitor | Method | How It Works | Steps | PL Rating Integration Partner? | Orange Partner? |
|-----------|--------|-------------|-------|-------------------------------|----------------|
| **Salt** | Rating API (server-to-server) | "Request Client Link" + "Confirm and Sync" | **2 clicks** | **Yes** (listed) | No |
| **XILO** | Rating API + AL3 fallback | Link generated --> opens pre-filled PL Rating | **1 click** | **Yes** (listed, import-only) | No |
| **Canopy Connect** | Rating API (server-to-server) | 1-click "Submit to PL Rating" --> opens pre-filled | **1 click** | **Yes** (listed) | **Yes** |
| **RiskAdvisor** | Rating API | Generates data + link in ~3 steps | **~3 clicks** | **Yes** (listed) | No |
| **Feathery** | Rating API (Premium tier) | Form fields mapped to PL Rating properties | **0 (automated)** | **Yes** (listed) | No |
| **EverQuote** | Rating API | Lead data pushed to PL Rating | **0 (automated)** | **Yes** (listed) | No |
| **QuoteWizard** | Rating API | Lead data pushed to PL Rating | **0 (automated)** | **Yes** (listed) | No |
| **Momentum AMS** | Rating API | AMS data pushed to PL Rating | **1 click** | **Yes** (listed) | No |
| **NowCerts** | Rating API | AMS data pushed to PL Rating | **1 click** | **Yes** (listed) | No |

**Integration Partner types (from the official listing):**
- **"Import only"** (like Salt, XILO, RiskAdvisor, EverQuote) = push data INTO PL Rating. This is what we need.
- **"Import/Export"** (like AgencyZoom, InsuredMine) = bidirectional data flow with PL Rating

**Key insight:** You do NOT need to be an Orange Partner to use the Rating API. The path is the **PL Rating Integration Partner program** -- a separate, lighter-weight program that ~30 companies have already joined. All of the competitors listed above (except Canopy Connect, which has both) are Integration Partners WITHOUT being Orange Partners. The Integration Partner listing page at `help.vertafore.com/plrating/content/howto/integration_partners.htm` is the authoritative source.

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

- **Rating API (via PL Rating Integration Partner program):** Unknown -- must contact Vertafore. This is the primary path. ~30 companies have this, so it's clearly accessible.
- WinsurTech AL3 Creator API: ~$90/month (backup/interim only)
- ACORD membership (for raw spec): $1,000+/term (not needed if using WinsurTech or Rating API)
- PLRating agency licensing: ~$100-300+/month (not our cost -- agency pays)
- PL Rating Integration Partner enrollment: Unknown fee -- must contact Vertafore
- **No Zapier, Make, or n8n connectors exist for PLRating** (but the Rating API makes these unnecessary)

### Key Contacts

- **Vertafore Developer Portal:** developer.vertafore.com
- **PL Rating Integration Partners page:** help.vertafore.com/plrating/content/howto/integration_partners.htm
- **Orange Partner Program (NOT required for rater):** vertafore.com/why-vertafore/orange-partner-program
- **Rating API Reference:** rating-reference.vertafore.com (requires VSSO auth)
- **Rating API Swagger/OpenAPI specs:** Available from Vertafore API Catalog (request via developer portal)
- **WinsurTech AL3 API:** winsurtech.com (backup only)

---

## COMPETITOR ANALYSIS: How XILO, Salt, and RiskAdvisor Integrate

### Cross-Competitor Comparison

| Dimension | XILO | Salt | RiskAdvisor |
|-----------|------|------|-------------|
| **EZLynx** | Direct API (auto-sync) | Direct API (official partner, auto-sync) | Direct API (auto-sync) |
| **TurboRater** | Direct API (Zywave key) | **Not supported** | **Not supported** |
| **PLRating** | Rating API (link generation, 1 click) | Rating API (2-click: Request + Confirm) | Bridge Link (~3 clicks) |
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
2. **PLRating integration is well-solved by competitors** -- but only via the PL Rating Integration Partner program, which most newcomers don't know about. The path is clear; we just need to apply.
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
| Apply to Vertafore **PL Rating Integration Partner** program | PLRating | 1-2 weeks (admin) | Unlocks Rating API for 2-click seamless integration |
| Build EZLynx REST API integration | EZLynx | 2-4 weeks | 0-step automated sync with full data |
| Build TurboRater REST API integration | TurboRater | 4-6 weeks | 0-step automated quote with link to agent |
| Build PLRating Rating API integration | PLRating | 4-6 weeks | 2-click flow: send data + open pre-filled PLRating |

### Phase 3: Advanced (Months 3-6)

| Action | Rater | Effort | Impact |
|--------|-------|--------|--------|
| EZLynx QAS backend rating | EZLynx | 6-8 weeks | Quotes returned to our app -- agent never leaves |
| TurboRater iframe embedding | TurboRater | 2-3 weeks | Agent quotes within our app |
| Chrome extension fallback (like XILO XAI) | All | 4-6 weeks | Universal auto-fill for any web rater |

---

## IMMEDIATE NEXT STEPS

1. **Email `ezl-support@appliedsystems.com`** to request API enablement for EZLynx (do this today)
2. **Call TurboRater sales at 800-383-3482 (Option 4)** to request API Account ID and documentation
3. **Contact Vertafore** about the **PL Rating Integration Partner program** (NOT the Orange Partner Program) -- reference the ~28 existing partners (Salt, XILO, Feathery, EverQuote, etc.) listed at `help.vertafore.com/plrating/content/howto/integration_partners.htm`. Request: API key, Swagger/OpenAPI docs, and C#/Java SDK access
4. **Study the TurboTags GitHub wiki** ([getitc/turbotags](https://github.com/getitc/turbotags)) to understand TurboRater's complete field model
5. WinsurTech AL3 API ($90/month) as backup ONLY if Orange Partner enrollment is delayed

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
| **Rating API (Integration Partner)** | **Automated** | **Yes (with enrollment)** | Apply to PL Rating Integration Partner program; ~30 partners use this. Swagger/OpenAPI specs, C#/Java SDKs. Uses "temporary state + claim" pattern. |
| AL3 File Import | Manual browse/upload | **Yes** | User downloads file, imports in PLRating. Backup only. |
| EMS Service | Automated | **No** (Vertafore-internal, AMS360 only) | N/A |
| Consumer Rate Quotes (CRQ) | Consumer self-service | **Partial** | Cannot pre-fill data via URL |
| Orange Partner API | Automated | **Yes (with partnership)** | Orange Partner = broader Vertafore ecosystem (AMS360 etc). NOT required for rater-only integration. |

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

### Vertafore Developer Portal & Rating API

- **Developer Portal URL:** developer.vertafore.com
- **Rating API Reference:** rating-reference.vertafore.com
- **API Specifications:** Swagger/OpenAPI specs available from Vertafore API Catalog (metadata file: `ratingApiMetaData.json`)
- **SDKs:** C# and Java SDK generation available ([C# Client Guide](https://help.vertafore.com/devportal/content/howto/usingcsharpclient.htm))
- **Known endpoint:** `GET /api/PreRating/States`
- **Auth for API calls:** API Key + Secret Key (NOT OAuth -- simpler scheme, separate from AMS360 auth)
- **Auth for portal access:** VSSO (Vertafore Single Sign-On)
- **Deep link URL format:** `rating.vertafore.com/UserInterface/main/iFrameTest.aspx?Partner={NumericID}&Redir=../Connect/Connect.aspx?Import=1`
- **Partner IDs:** Numeric, assigned upon enrollment
- **Referenced in:** PL Rating 2022 R2 Release Notes as a distinct import type
- **Key distinction from AMS360 API:** The Developer Portal docs explicitly state: *"API Keys credential option exists specifically to support the Vertafore Rating API release"* and *"Vertafore AMS360 application developers must use the Oauth credential key method"* -- confirming these are separate API products with different auth schemes

### Bridge Service API (Production Endpoint)

The production REST API used by Integration Partners is the **Bridge Service** at `bridge-rating.vertafore.com`. This is an ASP.NET Web API with the following documented endpoints (from `/Help`):

**BridgeCoordinator endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/BridgeCoordinator/GetRateModel` | Get the rate model (data structure for a quote) |
| `POST` | `/BridgeCoordinator/BridgeToCarrier` | Bridge data to a carrier |
| `POST` | `/BridgeCoordinator/BridgeTest` | Test the bridge connection |
| `GET` | `/BridgeCoordinator/IsAlive` | Health check |

**FileDownloader endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Downloader/IsAlive` | Health check |
| `GET` | `/Downloader/GetFile?Id={Id}` | Download a file by ID |

**How this maps to the Salt workflow:**
1. **"Request Client Link"** = Salt's backend `POST`s to `BridgeCoordinator/GetRateModel` with applicant data; PL Rating validates and stores the record, returns a URL
2. **"Confirm and Sync"** = Opens the returned URL in PL Rating; agent's login session claims the record

**Note:** RiskAdvisor's documentation uses "Bridge Link" terminology, directly matching the `BridgeCoordinator` naming. RiskAdvisor also notes: *"PL Rating has released a new API since they no longer support the current API. We are planning to upgrade."* -- confirming the API is actively versioned.

### PL Rating Integration Partner Program (PRIMARY PATH)

- **Separate from Orange Partner Program** -- specifically for feeding data into PL Rating
- **~30 partners** listed at `help.vertafore.com/plrating/content/howto/integration_partners.htm`
- **Known partners include:** SALT, XILO, Canopy Connect, RiskAdvisor, EverQuote, QuoteWizard, AgencyZoom, InsuredMine, Momentum AMS, NowCerts (and ~20 others)
- **"Import only" designation:** Partners marked without "Add-on Product Tab" checkbox = they use the Rating API with no agency-side PL Rating admin configuration needed
- **Enrollment process:** Contact Vertafore; reference existing Integration Partners as precedent
- **What you get:** API key, Swagger/OpenAPI documentation, SDK access
- **Timeline:** Unknown (must inquire)

### Orange Partner Program (NOT required for rater integration)

- Official channel for **broad** Vertafore ecosystem integration (AMS360, Sagitta, etc.)
- ~45 partners, includes more extensive legal/security review
- Provides: integration toolkit, test instance, documentation for ALL Vertafore products
- Only relevant if we ALSO want AMS360/Sagitta integration (not just rater)
- Canopy Connect has both Integration Partner AND Orange Partner status

---

## APPENDIX D: Competitor Integration Reference

### Full Competitor Rater Support Matrix

| Rater | XILO | Salt | RiskAdvisor | **Us (Proposed)** |
|-------|------|------|-------------|-------------------|
| EZLynx | API | API (official partner) | API | **API + Zapier** |
| TurboRater | API | -- | -- | **API + TT2 + iframe** |
| PLRating | Rating API (link) | Rating API (2-click) | Rating API (~3 clicks) | **Rating API (2-click, via Integration Partner)** |
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
- [PL Rating Integration Partners List](https://help.vertafore.com/plrating/content/howto/integration_partners.htm) -- **KEY SOURCE: lists all ~28 Integration Partners**
- [Vertafore Developer Portal](https://developer.vertafore.com/)
- [Rating API Reference](https://rating-reference.vertafore.com/)
- [PLRating Product Page](https://www.vertafore.com/products/insurance-comparative-rater/pl-rating)
- [Vertafore APIs in InsurTech](https://www.vertafore.com/resources/blog/apis-insurtech-simplifying-complex-connections)
- [Consumer Rate Quotes](https://www.vertafore.com/products/consumer-rate-quotes-pl-rating)
- [Feathery PLRating Integration](https://www.feathery.io/integrations/pl-rating)
- [Agency Systems Wiki - PLRating](https://wiki.agencysystems.com/wiki/PL_Rating_Integration_(Vertafore))
- [Salt PL Rating Guide](https://support.saltinsure.com/article/68-salt-pl-rating-guide)
- [Momentum AMS PL Rating docs](https://support.momentumams.com/) -- confirms "temporary state + claim" pattern
- [Bridge Service API Help/Endpoints](https://bridge-rating.vertafore.com/Help) -- production REST API documentation
- [Vertafore API Keys (Rating API)](https://help.vertafore.com/devportal/content/infographics/apikeys.htm) -- confirms Rating API uses API Key (not OAuth)
- [C# Client for Rating APIs](https://help.vertafore.com/devportal/content/howto/usingcsharpclient.htm)
- [RiskAdvisor PL Rating Integration](https://help.riskadvisor.insure/articles/7771169-pl-rating-integration) -- confirms API versioning
- [Vertafore API Terms](https://www.vertafore.com/terms) -- no distinction between Orange Partners and other API users

**Competitors:**
- [XILO Integrations](https://www.xilo.io/integrations)
- [Salt Knowledge Base](https://support.saltinsure.com/)
- [RiskAdvisor EZLynx](https://help.riskadvisor.insure/articles/4819758-ezlynx-integration)
- [RiskAdvisor PL Rating](https://riskadvisor.insure/integrations/riskadvisor-pl-rating/)
- [Full competitor analysis](../../../Market_Research/2026-02-23-competitor-rater-integration-analysis.md)
