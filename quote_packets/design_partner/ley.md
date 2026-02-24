---
created: 2026-02-15
author: PolicyLift
status: in-progress
design_partner: Ley Insurance
discovery_call_date: 2026-02-12
tags: [design-partner, personal-lines, auto, home, PLRater, Hawksoft]
---

# Agency Profile

**Agency Name:** Ley Insurance
**Key Contact:** Kyle Ley — Agency Owner / Principal
**Location / States Served:** Not explicitly stated in call; based on context, personal lines focus (likely CA or multi-state)
**Team Size:** Not explicitly stated; Kyle appears to be the primary producer handling quote intake, with at least some staff (references "we" and "our insurance agency" throughout)
**Lines of Business:** Personal Auto, Homeowners, Commercial, Life (Kyle offered to send four quote sheets covering all four lines at [@26:42](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1602.02))
**Carrier Count:** ~30 carriers — Kyle explicitly stated: *"we have 30 carriers"* [@22:07](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1327.96)

---

# Quote Packet Template
*Portal field prioritization for `ley_personal_auto_ca`. Primary fields are shown to the customer first (below "Or enter data manually" in the portal). After submitting primary fields, the customer is optionally prompted to fill secondary fields. Fields marked multi-entity support "Add another driver" / "Add another vehicle" flows.*

## Primary Fields (Shown First)

These are the fields Kyle explicitly listed as minimum required to generate a quote and get to his video proposal step (85% close rate). Without these, PLRater entry cannot begin.

| Field | Entity Type | Multi-Entity | Reasoning |
|-------|------------|--------------|-----------|
| | **Applicant** | | |
| **Full Name** | Applicant | No | Core identifier. Kyle collects first on every call. Required for PLRater Client Info tab. |
| **Date of Birth** | Applicant | No | Primary rating factor. Kyle: *"date of birth"* in his explicit required list [@20:36]. |
| **Mailing Address** | Applicant | No | Determines rating territory and garaging location. Kyle explicitly listed [@20:36]. Portal should use address autocomplete. |
| **Phone** | Applicant | No | Core contact field. May already be captured from call — shown in portal only if missing. |
| **Email** | Applicant | No | Needed for InsureGrid link delivery, follow-up communications, and video proposal delivery. |
| **Marital Status** | Applicant | No | *"We have to know if they're married or single"* [@18:00]. Directly impacts rate and triggers spouse driver addition. |
| | **Driver** *(per driver)* | | |
| **Full Name** | Driver | Yes — per driver | *"If there's any other driving adults living in that house"* [@18:00]. "Add another driver" button adds a new driver card. |
| **Date of Birth** | Driver | Yes — per driver | Required for every additional driver. Each added driver requires Name + DOB + DL# at minimum. |
| **Driver's License #** | Driver | Yes — per driver | Kyle explicitly listed [@20:36]. Not voice-capturable — this is one of the portal's highest-value fields. Required for MVR pull. |
| | **Vehicle** *(per vehicle)* | | |
| **VIN** | Vehicle | Yes — per vehicle | *"And the VIN, and the vehicles, the VINs"* [@20:48]. Not voice-capturable. Validate via NHTSA check digit. If customer doesn't have VIN, fall back to Year/Make/Model. |
| **Year / Make / Model** | Vehicle | Yes — per vehicle | Core vehicle identification. Voice-capturable as fallback when VIN not available. NHTSA decode supplements from VIN. |

## Secondary Fields (Shown After Initial Submit)

These fields improve quote accuracy, unlock discounts, and enable cross-sell but are not strictly required for PLRater entry. Shown as optional step after primary submission.

| Field | Entity Type | Multi-Entity | Reasoning |
|-------|------------|--------------|-----------|
| | **Applicant** | | |
| **Own or Rent Home** | Applicant | No | Triggers multi-policy opportunity + homeowner discount on auto: *"owning or renting a home then wouldn't branch off"* [@16:08]. Key cross-sell signal for home bundling. |
| **SSN** | Applicant | No | Used by carriers for credit-based insurance scores. Also Kyle's informal lead qualification signal [@10:18]. Sensitive — many customers balk. Optional in V1 portal. |
| | **Driver** *(per driver)* | | |
| **Occupation** | Driver | Yes — per driver | *"A lot of insurance companies rate on your occupation... the factory worker is not getting the same rate as a teacher"* [@16:08]. Discount eligibility (teacher discounts). Maps to PLRater Client Info tab. |
| **Gender** | Driver | Yes — per driver | Rating factor in most states. Required for PLRater Drivers tab. |
| **Relationship to Applicant** | Driver | Yes — per driver | Required for PLRater Drivers tab (spouse, child, other). |
| **College Student / Vehicle at College** | Driver | Yes — per driver | Discount for child away at college 100+ miles: *"Is your son at college? Is the vehicle at college?"* [@16:00]. Only shown if driver is age 16-25. |
| | **Vehicle** *(per vehicle)* | | |
| **Vehicle Usage** | Vehicle | Yes — per vehicle | Commute / Pleasure / Business. Affects rate. |
| **Annual Mileage** | Vehicle | Yes — per vehicle | Rating factor for many carriers. |
| **Garaging Address** | Vehicle | Yes — per vehicle | Only if different from mailing address. *"Is the vehicle at college?"* scenario [@16:00]. |
| | **Prior Coverage** | | |
| **Current Carrier** | Prior Coverage | No | For apples-to-apples comparison. May already be captured via InsureGrid or voice call. |
| **Policy Expiration Date** | Prior Coverage | No | Timing — determines urgency and prior coverage verification. |
| **Prior Coverage Duration** | Prior Coverage | No | "How long with current carrier" — loyalty/stability indicator. |
| | **History** | | |
| **Accidents / Violations (3yr)** | History | No | Screening criterion. Kyle flags 2+ DUIs as low priority [@19:12]. Free-text or structured date/description. |
| | **Coverage** | | |
| **Desired Liability Limits** | Coverage | No | PLRater defaults; Kyle customizes per customer. Low priority for portal — Kyle prefers to set these himself during the consultative step. |

### Multi-Entity UX Notes

- **Drivers:** Start with applicant (Name + DOB + DL# pre-filled if captured from call). "Add another driver" button adds a new driver card requiring at minimum Name + DOB + DL#. Kyle said he needs *"all driving-age adults"* — prompt: "Are there any other drivers in your household?"
- **Vehicles:** Start with one vehicle card (Year/Make/Model or VIN). "Add another vehicle" button. VIN field should have a "Don't have your VIN?" toggle that expands Year/Make/Model fields instead.
- **InsureGrid as shortcut:** For Ley specifically, the portal's "Upload your insurance documents" section (above the manual fields) includes InsureGrid connect as an option. If the customer completes InsureGrid, it resolves VINs, DL#s, current coverage, and prior carrier — potentially filling most primary AND secondary fields in one shot, at zero marginal cost ($100/mo flat subscription).

---

# Technology Stack

| Tool | Role | Notes |
|------|------|-------|
| **Hawksoft** | Agency Management System (AMS) | Primary system of record. Kyle enters coverage information in Hawksoft's coverage screen. Quote sheets are scanned into Hawksoft. Phone system cannot push data to Hawksoft until a client profile exists. |
| **PLRater** | Comparative Rater | Used for personal lines quoting. Kyle mentioned they have used "a rater before in the past and it just wasn't accurate" [@23:15](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1395.16) — this may refer to a previous rater experience or multi-carrier bridge tool, suggesting they now manually quote each carrier individually for accuracy. See [[context_plrater_home_auto]] for PLRater field requirements. |
| **InsureGrid** | Dec page retrieval / carrier account linking | $100/month flat subscription, unlimited pulls. Customer logs into their current carrier through InsureGrid link; dec pages are returned to the agency. Primary tool for obtaining prior policy information. |
| **Phone recording system** | Call recording | Records all inbound/outbound calls. Cannot interface with Hawksoft until a profile has been created — a key integration gap. Kyle: *"our phone is recording them, but they can't, the phone can't talk back to Hawksoft until a profile has been built in Hawksoft"* [@25:22](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1522.92) |
| **Paper quote sheets** | Data collection | Physical paper forms used during phone calls. Kyle writes customer information by hand, then scans sheets into Hawksoft. Four sheets exist: auto, home, commercial, life. |
| **Video proposal tool** | Sales / closing | Kyle creates video proposals for prospects. Claims an ~85% close rate when using this approach. |

### Integration Gaps

- Phone system records calls but **cannot push data to Hawksoft** until a client profile is manually created — meaning all call data is stranded until someone hand-enters it.
- Quote sheets are **handwritten on paper**, then scanned into Hawksoft — no structured data extraction occurs at the scan step.
- InsureGrid data must be **manually transcribed** into Hawksoft and/or the rater; there is no automated pipeline from InsureGrid output to rater input.
- No data enrichment tools (Fenris, NHTSA, etc.) are in use today. Kyle confirmed they have not used data enrichment providers for personal lines: *"Um, no"* [@8:30](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=510.941). They briefly tried a loss run retrieval tool for commercial but found it *"wasn't dependable"*.

---

# Today
*What are the Top-of-Funnel interaction patterns present for the agency today?*

## Lead Sources

Kyle described two primary lead channels:

1. **Internet / web form submissions** — ~2 per week. These yield minimal information (name, maybe phone/email). Close rate is *"very low"* [@2:17](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=137.38).
2. **Phone calls / referrals** — The bulk of the funnel. Referral and phone leads have a significantly higher close rate than internet leads, and an even higher rate when Kyle can deliver a video proposal.

Kyle does **not** currently have:
- Chat on the website
- Voice AI / automated phone intake
- Any structured online form that collects meaningful quote data (he noted: *"it would be cool if someone, they go to request a quote. But we had all, like they were able to enter all of that data because right now we're getting minimal information from that"* [@0:47](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=47.64))

## Current Workflow: Step-by-Step

### Phone / Referral Lead (Primary Flow)

1. **Inbound call arrives.** Kyle (or staff) picks up the phone. The phone system begins recording the call.
2. **Initial information gathering.** Kyle asks for basic info — name, address, date of birth, vehicles, marital status, etc. He is **writing this down by hand on a physical quote sheet** during the call. *"We're physically, at this point, we're physically writing it down"* [@25:06](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1506.9).
3. **SSN request as qualification signal.** Kyle asks for social security number early. If the customer balks, Kyle notes they'll likely be *"a little bit more challenging to deal with"* and *"more reluctant to give you information"* [@10:18](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=618.181). This serves as an informal lead qualification heuristic.
4. **InsureGrid link sent.** After getting basic information, Kyle sends the customer an InsureGrid link via text or email. He frames it as a coverage-focused request: *"I'm a real easy way for you to send us your current deck pages. So we're not missing any coverages because we don't want to miss anything, but we also don't want to provide something that you don't necessarily need"* [@6:20](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=380.96).
5. **Customer completes InsureGrid.** Of those who agree to use it (~75-80% of prospects), 100% actually complete it. Dec pages are returned to the agency.
6. **Quote sheet scanned into Hawksoft.** The handwritten quote sheet is scanned and attached to the client's Hawksoft profile.
7. **Manual data entry into rater / carrier portals.** Kyle manually enters the collected data + InsureGrid dec page information into PLRater or individual carrier portals. He emphasized they go into *"each company and quote them out"* manually for accuracy [@23:15](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1395.16).
8. **Video proposal created and sent.** Once quotes are ready, Kyle creates a video proposal walking the customer through their options. This step has an ~85% close rate.

### Internet Lead Flow

1. **Web form submission received** with minimal data (name, possibly phone/email).
2. **Kyle follows up** via text or phone to collect additional information.
3. **Same InsureGrid + manual flow** as above, but with lower engagement and close rates.

### InsureGrid Failure Fallback

When InsureGrid cannot return data (Allstate, sometimes State Farm), Kyle does **not** go back to the customer for a manual data dump. Instead, he tells them: *"it didn't come through for some reason. So what I'm going to do is I'm going to quote your insurance how I would quote my own personal insurance. And if we want to make any changes from there, we'll go ahead and make those changes"* [@9:36](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=576.74). He uses **preset coverages** (his personal preferred defaults) to generate an initial quote, then adjusts post-sale if needed.

## Video Proposal Approach

Kyle is emphatic about video proposals being his highest-converting sales tool:
- *"the close rate when we do a video proposal... is like 85%"* [@2:17](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=137.38)
- *"I can pretty much guarantee if I'm doing a video quote, I'm going to sell it"* [@2:52](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=172.76)

This suggests that Kyle's bottleneck is **not** the closing step — it is **getting to the point where he has enough data to generate a quote and create the video proposal**. Compressing the data collection cycle directly accelerates his path to the highest-conversion step in his funnel.

---

# Core Data Collection Requirements
*What exactly did the partner request be collected for a customer?*

## Auto — Required Fields

Kyle explicitly listed the minimum required fields for an auto quote at [@20:36](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1236.72):

| Field | Source(s) | Notes |
|-------|-----------|-------|
| **Full Name** | Voice call, web form | First + last required |
| **Address** | Voice call, web form | Determines rating territory; also determines garaging location |
| **Date of Birth** | Voice call | Required for every driver |
| **Marital Status** | Voice call | *"we have to know if they're married or single"* [@18:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1080.0) |
| **Driver's License Number** | Voice call, follow-up | Explicitly listed as required |
| **VIN(s)** | Voice call, InsureGrid, dec page | *"And the VIN, and the vehicles, the VINs"* [@20:48](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1248.52) |
| **Other driving adults in household** | Voice call | *"if there's any other driving adults living in that house"* [@18:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1080.0) |
| **Prior policy / dec page** | InsureGrid | Used for apples-to-apples comparison and to prove prior coverage to carriers |

## Auto — Important Rating Factors (Beyond Minimum)

Kyle highlighted several additional fields that significantly impact rating:

| Field | Rationale | Timestamp |
|-------|-----------|-----------|
| **Occupation** | *"A lot of insurance companies rate on your occupation. So, you know, the same, the factory worker with the same exact same criteria is not getting the same rate as, you know, maybe a teacher"* | [@16:08](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=968.362) |
| **College student / vehicle at college** | *"Is your son at college? Is the vehicle at college?"* — discount for child away at college 100+ miles away | [@16:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=960.002) |
| **Teacher discounts** | *"there are discounts for teachers, depending on the company"* | [@16:08](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=968.362) |
| **Own or rent home** | *"owning or renting a home then wouldn't branch off"* — triggers multi-policy opportunity + homeowner discount on auto | [@16:08](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=968.362) |
| **SSN** | Used by carriers to pull credit-based insurance scores; also serves as Kyle's informal lead qualification test | [@10:18](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=618.181) |
| **Garaging address** | Where vehicle is kept (may differ from mailing address) | [@16:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=960.002) |

## Home — Required Fields

Kyle described home quoting as *"a little bit more intensive"* [@17:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1020.0) and listed:

| Field | Notes |
|-------|-------|
| **Year of roof** | *"That's a number one question we have to ask is the year of the roof"* — critical for eligibility and pricing |
| **Smoke detectors** | Protective device discount |
| **Fire extinguishers** | Protective device discount |
| **Wood stoves in the home** | Liability / underwriting concern |
| **Pools** | Liability concern |
| **Trampolines** | Liability concern |
| **Plumbing last updated** | *"if they know when plumbing, heating, and wiring was last updated"* |
| **Heating last updated** | Same as above |
| **Wiring last updated** | Same as above — old wiring is a fire risk / underwriting concern |
| **Number of bathrooms** | *"another kind of important factor that changes the replacement costs of the homes... bathrooms, bedrooms, they don't matter"* — note Kyle explicitly said **bedrooms don't matter** but **bathrooms do** [@17:19](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1039.54) |

Kyle promised to send the actual quote sheets which will contain the complete field list: *"you'll be able to see on what the sheets that I sent over to you, exactly all the questions that we ask"* [@17:19](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1039.54).

---

# Pain Points & Friction

## 1. Internet Leads: Low Close Rate, Minimal Data
Internet form submissions provide almost no useful data and convert poorly. Kyle: *"Currently, our close rate for internet submissions is very low"* [@2:17](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=137.38). He wishes the web form collected more: *"it would be cool if someone, they go to request a quote. But we had all, like they were able to enter all of that data because right now we're getting minimal information from that"* [@0:47](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=47.64).

## 2. Manual Note-Taking on Phone Calls
Every phone call requires Kyle to physically write down customer information on paper quote sheets. No automation, no transcription, no structured extraction. This is a pure time sink on every single call.

## 3. Phone System Cannot Talk to Hawksoft
The phone system records calls, but the recordings are siloed. *"Our phone is recording them, but they can't, the phone can't talk back to Hawksoft until a profile has been built in Hawksoft"* [@25:22](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1522.92). This creates a chicken-and-egg problem: call data exists in audio form but cannot be leveraged until someone manually creates the client record.

## 4. Carrier Limitations with InsureGrid
Allstate and State Farm sometimes fail to return data via InsureGrid. Kyle: *"specifically Allstate and sometimes State Farm, they either don't are unable to return. So if a customer doesn't have an online presence with them, they we can't get it"* [@9:06](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=546.56).

## 5. Customer Reluctance to Share Prior Policy
~20-25% of prospects refuse to use InsureGrid because they are *"strictly price-oriented"* and don't want to reveal their current rate [@7:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=420.0). Kyle doesn't push hard on these prospects.

## 6. Consumer Expectations Have Changed
Kyle reads industry reports indicating that *"the clientele has changed over the last five years, and people don't have time to wait. And they don't want to wait"* [@1:25](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=85.12). Internet shoppers who have already tried direct carriers (GEICO, Progressive) expect speed, and a slow independent agency process risks losing them.

---

# Dec Page & Prior Policy Workflow

## InsureGrid as Primary Tool

- **Cost:** $100/month flat subscription — unlimited pulls. No per-lead cost. [@26:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1560.58)
- **Delivery:** Kyle sends the customer a link. Customer logs into their current carrier through InsureGrid. Dec pages are automatically returned to the agency.
- **Framing:** Kyle approaches it from a **coverage standpoint**, not a premium standpoint: *"we're not missing any coverages because we don't want to miss anything, but we also don't want to provide something that you don't necessarily need because, you know, we can customize things"* [@6:20](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=380.96). This framing increases compliance.

## Conversion Funnel

| Stage | Rate | Evidence |
|-------|------|----------|
| Prospect agrees to use InsureGrid | ~75-80% | *"I would say probably 75% 80%"* [@7:00](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=420.0) |
| Of those who agree, actually complete it | ~100% | *"I would say 100%"* [@7:40](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=460.48) |
| Prospect refuses InsureGrid | ~20-25% | Price-conscious customers who don't want to reveal their current premium |

## Carrier-Specific Failures

- **Allstate:** Frequently unable to return data via InsureGrid.
- **State Farm:** Sometimes unable to return data, particularly when the customer does not have an online account with State Farm.
- Other carriers appear to work reliably.

## Fallback When InsureGrid Fails

Kyle does not burden the customer with manual data collection. Instead, he uses **his own preset coverage preferences** to generate an initial quote: *"I'm going to quote your insurance how I would quote my own personal insurance. And if we want to make any changes from there, we'll go ahead and make those changes"* [@9:36](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=576.74). This reduces friction but means the initial quote may not match the customer's actual coverage, requiring post-sale adjustments.

## Value of Dec Pages Beyond Pricing

Kyle specifically noted that dec pages serve a **compliance and accuracy purpose** beyond pricing. Some carriers pull CLUE/MVR reports and may flag "no prior coverage" if they can't verify the customer's history. Having the actual dec page prevents this: *"If some companies pull a clue in NVR and they don't, they're like, oh, they don't prior coverage, that, well, that's not true because we have a current deck page"* [@10:18](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=618.181).

---

# Risk Screening & Qualification

## Disqualification Criteria

Kyle identified specific risk characteristics that his agency avoids, even though they technically have a market for them with ~30 carriers:

- **Roofs over 30 years old** (home) — *"roofs, you know, roofs over 30 years old"* [@19:12](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1152.84)
- **2+ DUIs** (auto) — *"the guy has just two DUIs"* [@19:12](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1152.84)

Kyle's language was nuanced — he said *"we have a market for everything"* but these are risks they *"don't necessarily go after."* This suggests a soft disqualification rather than a hard rule: they can write them but choose not to pursue them aggressively.

## SSN as Informal Qualification Signal

Kyle uses the SSN request as a behavioral signal: *"sometimes we ask for social security numbers, and if someone has a problem giving it, I know they're going to be a little bit more challenging to deal with. And they're not going to be a little bit more reluctant to give you information"* [@10:18](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=618.181). This is not a hard gate — it is a heuristic that helps Kyle calibrate how much effort to invest in a prospect.

## Implication for Quote Packets

These screening criteria should be built into the risk scoring layer of Quote Packets. If the voice agent or smart form captures roof year > 30 years or 2+ DUI convictions, the system can flag the lead as low-priority or route it differently. The SSN behavior signal is harder to automate but could be approximated by tracking how many optional fields a customer is willing to provide.

---

# Customer Communication Preferences

## Channel Preferences

Kyle confirmed that follow-up communication should happen via **text or email** [@23:58](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1438.06). This aligns well with Quote Packets' SMS and email follow-up channels.

## Messaging Framework

Kyle was very specific about the messaging he wants customers to receive. The core themes:

1. **Independence and optionality:** *"we have 30 carriers... gives us a really great representation of the market"* [@22:07](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1327.96)
2. **Customer doesn't need to go elsewhere:** *"it's important for us to stress to our clients that they don't need to go somewhere else"* [@22:07](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1327.96)
3. **Market comparison framing:** *"we're going to work on this and compare your insurance to the rest of the market because we are an independent insurance agency"* [@22:07](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1327.96)
4. **Personalized, manual care:** *"we go in there and we manually do this. So we make sure that you get your customized coverage that fits your needs, that fits your price range"* [@23:15](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1395.16)
5. **Long-term relationship / retention framing:** *"they'll have my back because they have options"* and *"when renewal comes around, they know, oh, guess what? They, they have options and they, they have my back"* [@22:07](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1327.96) and [@23:15](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1395.16)

### Suggested Template Language for Automated Follow-Up

Based on Kyle's own words, automated text/email should incorporate phrases like:
- "We represent 30 different carriers, giving us a great representation of the market."
- "We're going to compare your insurance to the rest of the market."
- "We manually quote each carrier to make sure you get customized coverage that fits your needs and your price range."
- "You don't need to go anywhere else — we have options and we have your back."

Kyle explicitly confirmed he wants this framing *reaffirmed* with customers: *"Reaffirming that with them is important"* [@22:40](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1360.44).

---

# Solution Potential
*How exactly will we implement Quote Packets to meet the customer where they are and reduce cycle time?*

## Overview

Ley Insurance's workflow has a clear bottleneck: the time between first customer contact and having enough data to generate quotes and create a video proposal. Kyle's close rate on video proposals is ~85% — the constraint is not closing, it is **getting to the quote**. Every minute saved in data collection directly translates to faster time-to-quote and higher throughput.

## Solution Mapping

### 1. Voice Agent Integration → Structured Data Capture

**Current state:** Kyle manually writes down information on paper during phone calls.
**With Quote Packets:** PolicyLift's voice agent captures structured fields (name, DOB, address, vehicles, marital status, occupation, etc.) during the initial call. This eliminates the handwritten quote sheet for voice-originated leads entirely.

**Key opportunity:** Kyle's phone system already records calls but cannot feed data into Hawksoft. PolicyLift's voice agent or a **call transcription → structured extraction pipeline** would solve this. Even for calls Kyle takes personally (not routed to the AI voice agent), a post-call transcription service that extracts structured quote fields from the recording would save significant time. Raghav identified this as *"an easy win"* at [@25:10](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1510.44), and Kyle agreed.

### 2. InsureGrid Auto-Send on Every Lead

**Current state:** Kyle manually decides when to send the InsureGrid link on a per-customer basis.
**With Quote Packets:** Because InsureGrid is a flat $100/month subscription with unlimited pulls, PolicyLift can **automatically send InsureGrid links to every single lead** immediately after initial contact — via the voice agent's follow-up SMS/email or the smart form. There is zero marginal cost per lead.

**Expected impact:** Even if only 50% of leads complete InsureGrid (below Kyle's stated 75-80% agreement rate), the agency gets free dec page data on half of all inbound leads with zero manual effort. Combined with the 100% completion rate among those who agree, this is a very high-yield, zero-cost automation.

**InsureGrid framing language** should mirror Kyle's own approach: position it as a **coverage accuracy** tool, not a price-comparison tool. This reduces refusal from price-conscious customers.

### 3. Voice Agent → InsureGrid → Smart Form Pipeline

The ideal pipeline for a new lead:

```
Voice Agent Call (or chat/form)
  → Captures: name, DOB, address, marital status, occupation, vehicles (year/make/model)
  → Triggers: InsureGrid link via SMS/email
  → Triggers: Smart Form link for remaining fields

InsureGrid Completion (async)
  → Returns: full dec page (carrier, policy #, coverages, VINs, drivers, limits, deductibles)
  → OCR/parsing extracts structured fields
  → Smart Form updates to remove fields already captured

Smart Form Completion (async)
  → Customer fills remaining gaps (DL#, SSN if willing, household members, home details if bundling)
  → Dynamic — only shows what's still missing

Result: Near-complete quote packet ready for PLRater entry
```

**Fields voice agent can capture:** Name, DOB, phone, email, address, marital status, occupation, own/rent, year/make/model of vehicles, primary use, garaging address, college student status, prior claims.

**Fields InsureGrid provides:** Current carrier, policy number, VINs, coverage limits, deductibles, drivers listed on policy, premium (which Kyle may or may not want the customer to see).

**Fields smart form collects (gaps):** Driver's license number, SSN, additional household drivers not on current policy, any vehicle changes, occupation if not captured by voice agent, home-specific fields if bundling.

### 4. Phone Call Transcription → Auto-Populate

For calls Kyle takes personally (not routed to AI voice agent), PolicyLift can provide a **post-call transcription and structured extraction** service. The call recording (already captured by Kyle's phone system) would be transcribed, and an LLM would extract quote-relevant fields into a structured data model. This data could then populate the quote packet, smart form, or be pushed to Hawksoft once a profile exists.

This addresses the specific gap Kyle identified: phone recordings exist but cannot talk to Hawksoft until a profile is built. PolicyLift's extraction layer would sit between the phone recording and Hawksoft, creating the structured data needed to bootstrap the Hawksoft profile.

### 5. Email/SMS Follow-Up with Trust-Building Messaging

**Current state:** Kyle manually sends follow-up texts and emails.
**With Quote Packets:** Automated follow-up via BYOD email (through Kyle's own inbox via Nylas) and SMS, using the messaging framework Kyle described:
- Emphasize independence, 30 carriers, market comparison
- Include InsureGrid link and portal link
- Frame around coverage accuracy, not price shopping
- Reinforce *"we have your back, we have options"* language

The SMS channel (98% open rate) is particularly well-suited for sending the InsureGrid link, since Kyle already sends it via text today. The follow-up sequence could be:
1. **Immediate SMS:** Thank you + InsureGrid link + trust messaging
2. **If InsureGrid not completed within X hours:** Gentle SMS reminder
3. **Email:** More detailed message with portal link for remaining fields + trust messaging
4. **If gaps remain:** SMS with 1-2 specific missing field questions

### 6. Accelerating the Path to Video Proposals

Kyle's 85% close rate on video proposals is the strongest conversion signal in his funnel. Quote Packets' entire value proposition for Ley Insurance can be framed as: **get Kyle to the video proposal step faster.**

If the quote packet is pre-filled from voice agent + InsureGrid + smart form + data enrichment, Kyle can enter it into PLRater, generate quotes, and create his video proposal in a fraction of the current time. The cycle from first contact to video proposal could compress from days (waiting for InsureGrid, manually writing data, re-entering into rater) to hours.

### 7. PLRater Integration

PLRater is Ley Insurance's comparative rater. See [[context_plrater_home_auto]] for full field requirements. The quote packet output should map directly to PLRater's input schema:
- **Client Info tab:** Name, DOB, address, marital status, occupation, education, own/rent, SSN
- **Drivers tab:** All household drivers with DOB, DL#, years licensed, gender, relationship
- **Vehicles tab:** VIN, year/make/model, usage, mileage, garaging, ownership
- **Coverages tab:** Prior coverage limits and deductibles (from InsureGrid dec page)
- **Incidents tab:** Claims and violation history (from InsureGrid/CLUE data)

A pre-filled PLRater import (or at minimum, a side-by-side data view for manual entry) would eliminate the manual transcription step.

### 8. Hawksoft Integration

Hawksoft is the AMS. Similar to [[jamco]] (which also uses Hawksoft), direct API integration is a future opportunity. In the near term, the quote packet can serve as a structured data handoff that Kyle (or staff) use to populate Hawksoft manually — still faster than transcribing handwritten notes. Hawksoft API access is expected to become available later this year, at which point Quote Packets could auto-create client profiles and populate coverage fields.

### 9. Data Enrichment Layer

Kyle has never used data enrichment providers like Fenris for personal lines. Quote Packets can layer in:
- **NHTSA VIN Decoder:** Convert year/make/model to full VIN details (safety features, body type) — useful when only year/make/model is captured by voice agent
- **Fenris Prefill:** Name + DOB + address can return vehicles, drivers, property details
- **County Property Records:** For home bundling — square footage, year built, construction type
- **FEMA Flood Zones:** For home quoting — flood zone determination from address

These enrichment sources reduce the number of fields the customer needs to provide and fill gaps that InsureGrid may miss (especially for Allstate/State Farm customers where InsureGrid fails).

---

# Specific Agentic Use Cases
*How will Quote Packet "Agent Mode" work for Ley Insurance? Mapped to the three core agent actions, grounded in Kyle's described workflow and his unique position as an owner-operator with a high-conversion video proposal step.*

## Agent Action: Generate Tasks (Subagents)

### Pre-fill

**After any ToF interaction (voice agent, chat, web form):**
Kyle currently has zero enrichment in his pipeline — he confirmed he has never used data enrichment providers: *"Um, no"* [@8:30]. Every field today is either handwritten from a phone call or pulled from InsureGrid. Pre-fill is therefore the single highest-leverage new capability for Ley Insurance.

- **Fenris Prefill** — From just name + address (which Kyle captures on every first call), Fenris returns predicted vehicles, VINs, household drivers, and property data. This eliminates the need for Kyle to ask many of the fields on his paper quote sheet. Particularly powerful because Kyle confirmed he is *"physically writing it down"* [@25:06] — replacing pen-and-paper with automated pre-fill for 60-70% of fields.
- **NHTSA VIN Decode** — When the customer mentions vehicle year/make/model on the call but not the full VIN. The agent decodes to get full VIN, safety features, body type, fuel type. Kyle currently has no VIN lookup tool (unlike JAMCO, which has Hawksoft's native lookup).
- **Phone transcription → pre-fill** — For calls Kyle takes personally (the majority), the agent can transcribe the call recording and extract structured fields. Kyle's phone system records every call but the data is stranded: *"our phone is recording them, but they can't, the phone can't talk back to Hawksoft until a profile has been built in Hawksoft"* [@25:22]. The agent's pre-fill task bridges this gap: transcription → structured extraction → pre-populated quote packet → bootstrap the Hawksoft profile.

**Guardrail recommendation: Autonomous.** Kyle has no current enrichment pipeline, so any pre-fill is net-new value with no risk of conflicting with existing workflows. Non-customer-facing.

### Enrich

**After pre-fill completes — the agent evaluates gaps and spawns targeted enrichment:**

- **InsureGrid auto-send** — The agent generates and sends an InsureGrid link to every new lead via SMS. This is the single most impactful enrichment action for Kyle because:
  - InsureGrid is $100/month flat with unlimited pulls — **zero marginal cost** per lead [@26:00]
  - Kyle already sends InsureGrid manually on a per-customer basis [@6:20]
  - 75-80% of prospects agree to use it [@7:00], and of those, 100% actually complete it [@7:40]
  - **The agent automates what Kyle already does manually, at the exact moment of highest engagement (right after the call), at zero additional cost.**
  - The agent should use Kyle's own framing language: position InsureGrid as a *coverage accuracy* tool — *"we're not missing any coverages because we don't want to miss anything, but we also don't want to provide something that you don't necessarily need"* [@6:20]

- **InsureGrid failure fallback** — If InsureGrid fails (Allstate, State Farm — *"specifically Allstate and sometimes State Farm, they either don't are unable to return"* [@9:06]), the agent should automatically spawn an alternative enrichment path:
  - Send the customer a dec page upload link (photo/PDF via portal or MMS)
  - Trigger LLM Vision parsing on any uploaded document
  - This replaces Kyle's current fallback of quoting with personal presets: *"I'm going to quote your insurance how I would quote my own personal insurance"* [@9:36] — which works but produces a less accurate initial quote

- **Home enrichment** (if customer mentions home or is flagged for bundling via "own or rent" question):
  - County property records: year built, sq ft, construction type, bathrooms (Kyle: *"bathrooms... seems to be a huge factor"* [@17:19])
  - FEMA flood zone from address
  - CAL FIRE wildfire risk (if CA)
  - This pre-fills many of the home fields Kyle described as intensive: *"Home quote sheet's a little bit more intensive. It's going to ask about smoke detectors, fire extinguishers, wood stoves in the home, pools, trampolines, the year of the roof"* [@17:00]

**Guardrail recommendation:**
- **InsureGrid auto-send: HITL initially → Autonomous once Kyle approves messaging.** This is customer-facing and Kyle has specific framing preferences. Once the template is approved, it should run on every lead automatically.
- **Data lookups (NHTSA, Fenris, property records): Autonomous.** Non-customer-facing.
- **InsureGrid fallback (dec page upload link): Autonomous.** The alternative channel fires only when InsureGrid already failed — no downside risk.

### Follow-up

**The agent generates follow-up outreach across SMS and email, using Kyle's specific messaging framework.**

**Scenario A: Immediate post-call follow-up (primary flow)**
Agent sends an SMS within minutes of the initial call:
1. Trust-building messaging per Kyle's framework: *"We represent 30 different carriers... we're going to compare your insurance to the rest of the market"* [@22:07]
2. InsureGrid link
3. Portal link for remaining fields
4. Kyle explicitly confirmed this approach: follow-up via *"text or email"* [@23:58]

**Scenario B: Internet lead (low close rate today)**
Kyle's internet leads provide minimal data and convert poorly: *"our close rate for internet submissions is very low"* [@2:17]. The agent can materially improve this:
1. Immediately send SMS with trust messaging + InsureGrid link + smart form portal link
2. Kyle wishes the web form captured more: *"it would be cool if someone, they go to request a quote. But we had all, like they were able to enter all of that data"* [@0:47]
3. The smart form IS that "enter all of that data" experience Kyle described wanting

**Scenario C: InsureGrid completed — remaining gaps**
After InsureGrid returns the dec page, the agent evaluates what's still missing (likely DL#, SSN, occupation, household members not on current policy). Agent sends a short follow-up:
- "Thanks for connecting your insurance — we got your policy details! We just need your driver's license number and [1-2 other fields] to finalize your quote. Tap here: [short form]"

**Scenario D: No engagement after 72 hours**
- Reminder SMS with different phrasing, reference the call, name the top 2 missing fields
- If no engagement after 2nd SMS → BYOD email with more detail
- After 3 total attempts → escalate to Kyle for personal phone call

**Guardrail recommendation: HITL for initial messaging template approval, then Autonomous.**
Kyle was very specific about messaging tone and content [@22:07, @22:40, @23:15]. Once he approves the templates, the agent should run follow-ups autonomously because Kyle is currently doing all of this manually — automation directly frees his time to create video proposals (his highest-ROI activity).

## Agent Action: Change Status

The agent evaluates the quote packet against Ley-specific readiness thresholds. Kyle gave an explicit minimum field list at [@20:36].

### Status: "Ready for PLRater"
**Trigger:** All of Kyle's explicitly required fields captured: name, address, DOB, marital status, DL#, VINs, household drivers.
**Evidence:** Kyle at [@20:36]: *"Things personally we need are name, address, date of birth, married, single, driver's license number... and the VIN, and the vehicles, the VINs."*

**Agent behavior:** Change status to "Ready for PLRater." This signals that Kyle (or staff) can enter the data into PLRater and begin quoting across carriers. This is the key inflection point — from here, Kyle can generate quotes and create his video proposal.

### Status: "Ready for Video Proposal"
**Trigger:** Quote packet is complete AND quotes have been generated in PLRater (or the agent detects that sufficient data exists for multi-carrier quoting).
**Why this matters:** Kyle's 85% close rate on video proposals makes this the most valuable status transition in his funnel: *"I can pretty much guarantee if I'm doing a video quote, I'm going to sell it"* [@2:52]. Every hour shaved getting to this status directly translates to revenue.

**Agent behavior:** Change status to "Ready for Video Proposal." Notify Kyle with high urgency (see Notify section).

### Status: "Ready for Preset Quote"
**Trigger:** InsureGrid failed (Allstate/State Farm) AND dec page upload was sent as fallback AND 48+ hours with no dec page received from customer.
**Evidence:** Kyle's fallback: *"I'm going to quote your insurance how I would quote my own personal insurance"* [@9:36].

**Agent behavior:** Change status to "Ready for Preset Quote." Attach whatever partial data exists and flag that prior coverage details are missing. Kyle proceeds with his preset approach rather than waiting indefinitely.

### Status: "Needs Personal Call"
**Trigger:** Customer hasn't engaged with any digital follow-up after 72+ hours. OR: Customer replied with a question. OR: Customer refused InsureGrid and appears price-cautious.
**Evidence:** ~20-25% of prospects refuse InsureGrid because they're *"strictly price-oriented"* [@7:00]. Kyle doesn't push hard — *"we don't really try that hard on those"* — but they still deserve a personal touch.

**Agent behavior:** Change status to "Needs Personal Call." Halt all automated outreach. Route to Kyle for a direct phone call.

### Status: "Low Priority — Risk Flag"
**Trigger:** Risk screening criteria met: roof year > 30 years OR 2+ DUI convictions detected.
**Evidence:** Kyle at [@19:12]: *"things that we don't necessarily... go after are, you know, crappy houses, roofs, you know, roofs over 30 years old. And autos with, you know, the guy has just two DUIs."*

**Agent behavior:** Change status to "Low Priority — Risk Flag." Don't suppress the lead entirely (Kyle said *"we have a market for everything"*) but deprioritize it below other active packets.

## Agent Action: Notify Producer

### Notification: "New lead — packet auto-populated from call"
**Trigger:** Phone call ends AND transcription + pre-fill + enrichment completes.
**Routing:** Kyle (primary producer and owner).
**Content:** "New auto quote lead: [Name], [Address]. Packet is [X]% complete from call transcription + enrichment. [N] fields still missing. InsureGrid link [sent/pending]. View packet →"
**Urgency:** Standard.
**Why it matters:** This replaces Kyle's current flow of handwriting a quote sheet, scanning it, and manually creating a Hawksoft profile. The notification arrives with structured data already populated — Kyle can go straight to PLRater entry.

### Notification: "InsureGrid completed — dec page received"
**Trigger:** Customer completed InsureGrid, dec page data returned and parsed.
**Routing:** Kyle.
**Content:** "Dec page received for [Name] via InsureGrid. Prior carrier: [Carrier]. Coverages, VINs, and drivers extracted. Packet now [X]% complete. [Remaining gaps: DL#, occupation]. View packet →"
**Urgency:** Medium-High. This is the data Kyle needs for an accurate apples-to-apples quote.

### Notification: "Packet complete — ready for video proposal"
**Trigger:** All required fields captured. Status changed to "Ready for PLRater" or "Ready for Video Proposal."
**Routing:** Kyle (high priority).
**Content:** "Quote packet for [Name] is complete. All required fields captured (name, address, DOB, marital status, DL#, VINs, household drivers, prior coverage). Ready for PLRater entry and video proposal. View packet →"
**Urgency:** **High.** This is the moment Kyle should drop everything and create the video proposal. With an 85% close rate, complete packets are the agency's highest-value work items.

### Notification: "High-intent internet lead"
**Trigger:** An internet form lead (normally low close rate) has completed InsureGrid AND/OR the smart form within 24 hours of submission.
**Routing:** Kyle (high priority).
**Content:** "Internet lead [Name] is showing high intent — they completed [InsureGrid / smart form / both] within [X hours] of submitting your web form. Packet is [X]% complete. This is unusual for internet leads — consider prioritizing. View packet →"
**Urgency:** **High.** Kyle's internet leads normally have a "very low" close rate [@2:17]. A lead that self-serves through the digital tools is signaling genuine intent and should be fast-tracked.

### Notification: "Cautious lead — may need personal approach"
**Trigger:** Customer refused InsureGrid OR refused optional fields (SSN, etc.) OR sent a message expressing concern about sharing information.
**Routing:** Kyle.
**Content:** "[Name] appears cautious about sharing information — [declined InsureGrid / declined SSN / expressed concern]. They may respond better to a personal phone call. Here's what we have so far: [summary]. Automation paused."
**Urgency:** Standard.
**Evidence:** Kyle's SSN heuristic: *"if someone has a problem giving it, I know they're going to be a little bit more challenging to deal with"* [@10:18]. The agent operationalizes Kyle's gut instinct into a systematic flag.

### Notification: "Risk flag — deprioritize"
**Trigger:** Risk screening criteria detected (roof >30 years, 2+ DUIs).
**Routing:** Kyle.
**Content:** "Lead [Name] flagged for risk: [roof year: 1990 / 2 DUI convictions]. Per your screening preferences, this has been marked low priority. You have a market for it if you choose to pursue. View packet →"
**Urgency:** Low.

## HITL Guardrail Configuration (Ley-Specific)

Kyle is an owner-operator who is also the primary producer. His time is his most constrained resource — and his highest-ROI activity is creating video proposals (85% close rate). Guardrails should optimize for maximizing Kyle's time on video proposals while ensuring customer-facing communications match his voice and trust-building approach.

| Action | Recommended Guardrail | Evidence |
|--------|----------------------|----------|
| Pre-fill (Fenris, NHTSA, transcription) | **Autonomous** | Kyle has zero enrichment today; any pre-fill is net-new value. Non-customer-facing. |
| InsureGrid auto-send | **HITL initially → Autonomous** | Customer-facing but Kyle already sends these manually. Approve template once, then let it run on every lead. Zero marginal cost. |
| InsureGrid failure fallback (dec page upload link) | **Autonomous** | Lower stakes — only fires when primary path failed. |
| Home enrichment (property records, FEMA, etc.) | **Autonomous** | Non-customer-facing data lookups. |
| First follow-up SMS/email | **HITL initially → Autonomous** | Kyle has very specific messaging requirements [@22:07, @22:40, @23:15]. Approve templates, then autonomous. |
| Reminder follow-ups | **Autonomous** | Kyle is time-constrained; reminders should not require his approval every time. |
| Status changes | **Autonomous** | Internal routing logic. Non-customer-facing. |
| Notifications | **Autonomous (always send)** | Kyle needs to know when packets are ready; never suppress. |
| Carrier quoting / PLRater entry | **Always HITL** | Kyle manually quotes each carrier for accuracy: *"we go in there and we manually do this"* [@23:15]. This is consultative work. |
| Video proposal creation | **Always HITL** | Kyle's core sales skill. The agent gets him there faster; it does not replace him. |
| Binding / finalization | **Always HITL** | Kyle conducts personal conversations at this stage. |

---

# Key Quotes

1. **On consumer expectations:**
   > *"The clientele has changed over the last five years, and people don't have time to wait. And they don't want to wait. And if they're going to the website, they are, either have shopped their direct sources, or they're going to, and that's, and they went quick."*
   > — Kyle Ley, [@1:25](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=85.12)

2. **On video proposal close rate:**
   > *"I can pretty much guarantee if I'm doing a video quote, I'm going to sell it."*
   > — Kyle Ley, [@2:52](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=172.76)

3. **On InsureGrid framing (coverage, not price):**
   > *"I'm a real easy way for you to send us your current deck pages. So we're not missing any coverages because we don't want to miss anything, but we also don't want to provide something that you don't necessarily need because, you know, we can customize things."*
   > — Kyle Ley, [@6:20](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=380.96)

4. **On SSN as qualification signal:**
   > *"Sometimes we ask for social security numbers, and if someone has a problem giving it, I know they're going to be a little bit more challenging to deal with."*
   > — Kyle Ley, [@10:18](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=618.181)

5. **On the preset fallback when InsureGrid fails:**
   > *"It didn't come through for some reason. So what I'm going to do is I'm going to quote your insurance how I would quote my own personal insurance. And if we want to make any changes from there, we'll go ahead and make those changes."*
   > — Kyle Ley, [@9:36](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=576.74)

6. **On manual note-taking:**
   > *"We're physically, at this point, we're physically writing it down."*
   > — Kyle Ley, [@25:06](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1506.9)

7. **On phone system limitations:**
   > *"Our phone is recording them, but they can't, the phone can't talk back to Hawksoft until a profile has been built in Hawksoft."*
   > — Kyle Ley, [@25:22](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1522.92)

8. **On customer retention messaging:**
   > *"We go in there and we manually do this. So we make sure that you get your customized coverage that fits your needs, that fits your price range and, you know, have their back. So then when renewal comes around, they know, oh, guess what? They, they have options and they, they have my back."*
   > — Kyle Ley, [@23:15](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1395.16)

---

# Action Items

## Explicit (Marked in Transcript)

1. **Kyle to email Alex & Raghav:** InsureGrid customer-view link + 4 quote sheets (auto, home, commercial, life) — marked as ACTION ITEM in transcript at [@16:38](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=997.9999). Kyle confirmed at end of call: *"I will email you both over the link so you can see what the customer sees on Insure Grid, and then I'll email over these four sheets that we currently use"* [@26:42](https://fathom.video/share/2uFyKEHzTUDa_wA1QbZvNcB8ygx5HX8v?timestamp=1602.02).

## Implicit Follow-Ups

2. **PolicyLift to review quote sheets** once received — map every field on Kyle's auto and home quote sheets to PLRater input fields and Quote Packets data model. Identify any fields on the sheets not currently captured by the voice agent or smart form.
3. **PolicyLift to review InsureGrid customer-view link** — understand the customer experience of InsureGrid to determine how to frame and integrate it into the Quote Packets flow.
4. **PolicyLift to prototype automated InsureGrid send** — design the trigger that auto-sends InsureGrid link to every new lead (via SMS or email) immediately after voice agent / chat / form interaction.
5. **PolicyLift to draft follow-up messaging templates** using Kyle's specific language and trust-building framework (30 carriers, market comparison, customized coverage, "we have your back").
6. **PolicyLift to investigate phone call transcription pipeline** — explore whether Kyle's existing phone system can export recordings in a format that PolicyLift can transcribe and extract structured data from.
7. **PolicyLift to map Allstate/State Farm InsureGrid failure rates** — understand how often these carriers fail and design fallback flows (e.g., dec page photo upload via MMS, OCR parsing as InsureGrid alternative).
8. **PolicyLift to define risk screening rules** for Ley Insurance — roofs > 30 years, 2+ DUIs, and any other criteria Kyle identifies from the quote sheets.
