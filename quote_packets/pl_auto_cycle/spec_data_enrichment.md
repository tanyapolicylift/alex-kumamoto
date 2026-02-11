# Spec: Data Enrichment for Personal Lines Cycle Time Compression

References: [[cycle_spec]], [[cycle_brainstorm]], [[cycle_prd]], [[context_plrater_home_auto]]

---

## Purpose

Data enrichment is the practice of **automatically filling in quote-required fields from external data sources** rather than asking the customer. Every field we can enrich is one fewer question on the form, one fewer SMS follow-up, and a faster cycle. This spec covers two categories:

1. **Public apps and sites** — freely or cheaply available data sources (property records, DMV, realty sites, etc.)
2. **Insurance-specific enrichment APIs** — purpose-built services like Canopy Connect that pull policyholder data with customer consent

Target scope: **Personal auto and home** quotes in **CA, TX, OH, FL**.

---

## Part 1: Public Apps and Sites

### The Opportunity

For a personal lines quote, we need ~40-80 fields across auto and home. Many of these fields describe **publicly observable facts** — the property's square footage, year built, construction type, roof material, number of bedrooms, the vehicle's year/make/model from a VIN, etc. If we can pre-fill these from public or semi-public sources, the customer only needs to confirm (not provide) them.

### Data Needs by Line

#### Personal Auto — Fields Amenable to Enrichment

| Field | Potential Public Source | Confidence | Notes |
|---|---|---|---|
| Vehicle Year/Make/Model/Trim | VIN decoder (NHTSA free API) | **High** | Free, authoritative, instant |
| Vehicle safety features | VIN decoder (NHTSA) | **High** | Airbags, ABS, etc. decoded from VIN |
| Vehicle MSRP / value | KBB, Edmunds, NADA (APIs) | **Medium-High** | Useful for coverage recommendations |
| Garaging address | Customer-provided address + USPS validation | **High** | Not really "enrichment" but validation |
| Driver license status | State DMV APIs (limited) | **Low** | Most states don't offer public APIs; some have batch lookup services for authorized entities |
| Driver record (violations/accidents) | State DMV / LexisNexis CLUE | **Low** (public) | Not publicly available. Need authorized data provider (see Part 2) |
| Credit-based insurance score | TransUnion, Experian, LexisNexis | **None** (public) | Requires consumer consent + authorized pull. Carrier-side only |
| Prior insurance verification | LexisNexis, Verisk | **None** (public) | Not public. Enrichment APIs only |

#### Personal Home — Fields Amenable to Enrichment

| Field | Potential Public Source | Confidence | Notes |
|---|---|---|---|
| Year built | County assessor / property records, Zillow, Redfin, Realtor.com | **High** | Widely available |
| Square footage | County assessor, Zillow, Redfin | **High** | Living area; may not include additions |
| Number of bedrooms/bathrooms | Zillow, Redfin, Realtor.com | **High** | Usually accurate from MLS data |
| Construction type (frame/masonry) | County assessor records | **Medium** | Available in many counties, format varies |
| Exterior wall material | County assessor (sometimes), Zillow (limited) | **Medium-Low** | Less consistently available |
| Roof type/material | County assessor (sometimes), satellite imagery AI | **Medium** | Assessor records may have it; emerging AI solutions can detect from aerial imagery |
| Roof age | County permit records (if reroof was permitted) | **Low-Medium** | Not always available; permits are inconsistent |
| Number of stories | Zillow, Redfin, county assessor | **High** | Widely available |
| Foundation type | County assessor (sometimes) | **Medium** | Varies by county |
| Garage (attached/detached, size) | County assessor, Zillow | **Medium** | Usually in property records |
| Swimming pool | County assessor, satellite imagery AI | **Medium-High** | Assessors often record pools; aerial AI very accurate |
| Fire protection class (ISO PPC) | ISO / Verisk (paid), NFPA resources | **Medium** | PPC is an industry standard; some free lookup tools exist |
| Distance to fire station/hydrant | Google Maps API + fire station data | **High** | Can compute from address + public fire station locations |
| Flood zone | FEMA NFIP maps (free) | **High** | Official FEMA API available |
| Wildfire risk score | CAL FIRE maps (CA), state forestry (other states) | **High** (CA) | CA has detailed public wildfire maps; other states vary |
| Property value / tax assessment | County assessor | **High** | Not the same as replacement cost, but useful as a sanity check |
| Prior claims (CLUE report) | LexisNexis C.L.U.E. | **None** (public) | Requires authorized access |

### Specific Public Data Sources to Research

#### Property Data

- **County Assessor / Tax Assessor Records**: Every county maintains property records (year built, sq ft, construction type, bedrooms, bathrooms, lot size, assessed value). Accessibility varies — some have free online portals, some have bulk data downloads, some require FOIA requests.
  - **CA**: County-by-county (LA County, Orange County, etc. have online portals).
  - **TX**: County appraisal districts (HCAD for Harris County, TCAD for Travis, etc.) — generally good online access.
  - **OH**: County auditor sites (Cuyahoga, Franklin, Hamilton) — good online access.
  - **FL**: County property appraiser (Broward, Miami-Dade, etc.) — good online access.
  - **Question**: Is there an aggregator that normalizes county assessor data across states?

- **Zillow / Redfin / Realtor.com**: Rich property data from MLS feeds. Available via APIs (with restrictions):
  - **Zillow**: Deprecated public API in 2021; now offers Zillow Group Bridge API for partners only. May need partnership agreement.
  - **Redfin**: No public API. Data available via scraping (TOS issues) or data licensing.
  - **Realtor.com**: API available for licensed partners.
  - **Alternatives**: ATTOM Data, CoreLogic, Estated — commercial property data APIs.

- **Google Maps / Places API**: For computing distances (to fire station, to coast, etc.) and validating addresses.

- **FEMA Flood Maps**: Free API for flood zone determination by address.

- **CAL FIRE / State Wildfire Maps**: CA has the Fire Hazard Severity Zones (FHSZ) map. Can determine wildfire risk by address.

#### Vehicle Data

- **NHTSA VIN Decoder**: Free, official API. Decodes VIN → year, make, model, trim, body type, engine, safety features (airbags, ABS, ESC, etc.). Covers all US-market vehicles. This is a no-brainer to integrate.

- **KBB / Edmunds / NADA APIs**: Vehicle valuation. Useful for recommending appropriate coverage levels (e.g., if car is worth $3k, maybe skip collision). These are paid APIs but widely used.

#### People Data

- **USPS Address Validation**: Free via USPS Web Tools API. Standardize and validate addresses.
- **State DMV**: Most states do NOT offer public driver record APIs. Some have authorized electronic reporting for insurance entities (e.g., California DMV ERS for authorized insurers). We likely can't access these directly — carriers do during the rating process.
- **Public records aggregators** (Whitepages Pro, Pipl, etc.): Can verify name/address/phone associations. Useful for identity confirmation, not for quote fields specifically.

### Prioritized Enrichment Opportunities

**Tier 1 — High value, easy to implement:**
1. NHTSA VIN Decoder (auto: year/make/model/safety features) — Free, instant, authoritative
2. FEMA Flood Zone lookup (home) — Free API
3. Distance to fire station/hydrant (home) — Google Maps + public data
4. USPS address validation — Free
5. State wildfire risk (CA especially) — CAL FIRE public data

**Tier 2 — High value, moderate effort:**
6. County assessor property data (home: year built, sq ft, bedrooms, construction) — Need per-county integration or aggregator
7. Property data aggregator API (ATTOM, CoreLogic, Estated) — Paid, but normalizes across counties
8. Vehicle valuation (KBB/Edmunds API) — Paid, useful for coverage recommendations

**Tier 3 — Medium value, higher effort or uncertainty:**
9. Roof type/age from satellite imagery AI (Cape Analytics, Betterview) — Insurance-specific, paid
10. Pool detection from aerial imagery — Often bundled with roof analytics
11. Zillow/Redfin property data — Access challenges, but rich data if available

---

## Part 2: Insurance-Specific Enrichment APIs

### Canopy Connect

**What it is**: Canopy Connect allows customers to **link their existing insurance account** (like linking a bank account via Plaid, but for insurance). The customer authenticates with their current insurer, and Canopy pulls the full policy data: declarations, coverages, vehicles, drivers, property details, claims history, premiums.

**Why it matters**: This is potentially the **single most powerful enrichment source** — it gives us nearly everything on the dec page, but structured and verified, without OCR.

**Key questions for research:**
- What carriers does Canopy Connect support in CA, TX, OH, FL? Coverage breadth is critical.
- What specific fields does Canopy return for personal auto? For personal home?
- What's the customer experience like? How long does the linking take? What's the success rate?
- Pricing model (per connection, monthly, etc.)?
- How does it compare to a customer simply uploading a dec page?
- Any competitors to Canopy Connect?

**Integration considerations:**
- Canopy provides an embeddable widget (iframe or React component) for the customer-facing connection flow.
- After connection, data is returned via webhook or API.
- We map Canopy's output schema to our internal quote schema.
- This could be a **third CTA on the portal**: "Connect your insurance account for the fastest experience."

### Other Insurance Enrichment APIs

**LexisNexis / Verisk:**
- **C.L.U.E. (Comprehensive Loss Underwriting Exchange)**: Claims history for auto and home. Requires authorized entity status (we may not qualify directly — carriers access this during underwriting).
- **LexisNexis Insurance Exchange**: Prefill data (driver info, vehicle info, property info) for authorized insurance entities.
- **Verisk / ISO**: Property data, fire protection class, replacement cost estimation.

**Fenris Digital:**
- Insurance data enrichment API. Given minimal input (name, address, DOB), returns predicted insurance profile data: likely vehicles, property characteristics, estimated coverage needs.
- Claims to use public + proprietary data sources.
- Worth evaluating for pre-fill before the customer even provides detailed info.

**Planck:**
- Commercial-focused, but expanding. AI-powered data enrichment from public web data.
- Less relevant for personal lines V1 but worth tracking.

**TransUnion / Verisk Property Data:**
- TransUnion TrueVision: Property data enrichment (year built, sq ft, construction, roof, etc.) from aggregated property records.
- Verisk 360Value: Replacement cost estimation tool. Many carriers use it. If we can access it, we get an authoritative Coverage A estimate.

**Cape Analytics / Betterview:**
- Geospatial AI: Analyze satellite/aerial imagery to determine roof condition, roof material, solar panels, swimming pool, vegetation encroachment, etc.
- Used by carriers for underwriting. If we can access their API, we get roof data that's otherwise very hard to get.
- Pricing likely per-property lookup.

**Accurate / MiuRo / similar:**
- Various startups offering insurance-specific data enrichment. Market is evolving rapidly.

### Prioritized Enrichment API Opportunities

**Tier 1 — Highest impact, most mature:**
1. **Canopy Connect** — If carrier coverage is good for our states, this is the single best enrichment path. Research deeply.
2. **ATTOM / CoreLogic / Estated** — Property data aggregator to replace per-county assessor integrations.
3. **NHTSA VIN Decoder** — Free, essential, already mentioned in Part 1.

**Tier 2 — High impact, access/cost questions:**
4. **Fenris Digital** — Promising for pre-fill with minimal input. Need to evaluate accuracy and pricing.
5. **Cape Analytics / Betterview** — Roof and property exterior data from imagery. Valuable for home quotes.
6. **Verisk 360Value** — Replacement cost estimation. Would give us a strong Coverage A recommendation.

**Tier 3 — Restricted access or lower priority:**
7. **LexisNexis C.L.U.E.** — Claims history. We likely can't access directly; carriers pull this.
8. **LexisNexis Prefill** — Driver/vehicle/property data. Access may be restricted to licensed entities.
9. **TransUnion TrueVision** — Property data. Evaluate vs ATTOM/CoreLogic.

---

## 3. Enrichment Strategy by Quote Stage

| Stage | What We Know | Enrichment Action |
|---|---|---|
| **Lead captured** (name, phone, maybe address) | Minimal | USPS address validation. If address known: property data lookup (assessor/ATTOM), flood zone, wildfire risk, fire station distance |
| **Post-call** (some fields from voice extraction) | Name, address, maybe vehicles, maybe drivers | VIN decode for any VINs mentioned. Property enrichment for home address. Fenris profile if available |
| **Customer uploads dec page** | Prior policy details | Parse dec page → fill schema. Cross-reference with enrichment data for validation |
| **Customer links via Canopy Connect** | Full prior policy | Richest data. Minimal follow-up needed. May only need confirmation + any new info (new vehicle, changed address) |
| **Customer fills smart form** | Incremental fields | Real-time enrichment as they type: VIN decode on VIN entry, address autocomplete + property lookup on address entry |
| **Pre-rater submission** | Nearly complete | Final validation pass: verify all enriched data is consistent, flag any conflicts |

---

## 4. Open Questions & TODOs

- [ ] **TODO: Align with CX platform** — Enrichment lookups should be triggered by the lead/contact service. Where does enrichment data get stored? In our internal schema alongside customer-provided data?
- [ ] **TODO: Align with AMS integrations** — Some AMS platforms (Applied Epic, EZLynx) have their own property prefill or Canopy Connect integrations. Do we complement or replace those?
- [ ] **TODO: Align with contact management** — Enrichment is per-contact. The contact service needs to track which enrichment sources have been queried and what data came back, to avoid redundant lookups and to attribute data sources.
- [ ] **Data freshness**: How stale can enrichment data be? Property records might be updated annually; Zillow/Redfin data updates with MLS changes. For a quote, "last 12 months" data is probably fine for property; vehicle data from VIN is static.
- [ ] **Cost modeling**: We need to model the per-lead cost of enrichment lookups across all sources to ensure unit economics work. E.g., if ATTOM charges $0.10/lookup and Cape Analytics charges $1.00/lookup, and we process 10,000 leads/month, that's $1,000 + $10,000/month just for enrichment.
- [ ] **Customer consent**: For Canopy Connect and any consumer-report-adjacent data (LexisNexis), we need explicit customer consent. Build this into the portal UX.
- [ ] **Accuracy validation**: Before relying on enrichment data, we should validate accuracy by comparing enrichment outputs to actual dec pages or customer-provided data for a sample of leads. Track accuracy rates per source.

---

## 5. Research Questions (for subagents)

### Subagent A: Public Data Sources Research
1. **Property data by state**: For CA, TX, OH, FL — what county assessor / property record data is available online? How accessible is it (free portal, bulk download, API, FOIA only)? Cover the top 5 counties by population in each state.
2. **Property data aggregators**: Deep comparison of ATTOM Data vs CoreLogic vs Estated vs HouseCanary. What fields do they provide? Pricing models? API quality? Coverage across our 4 states?
3. **Zillow / Redfin / Realtor.com data access**: Current state of their APIs and data licensing programs. Can a startup access property data programmatically? Costs and restrictions?
4. **NHTSA VIN Decoder**: Confirm the API is free and unlimited. What exact fields are returned? Any rate limits?
5. **Vehicle valuation APIs**: Compare KBB API vs Edmunds API vs NADA API vs Black Book. Pricing, coverage, integration complexity.
6. **FEMA flood zone API**: Confirm availability, usage limits, response format.
7. **Wildfire risk data**: What's available by state? CAL FIRE FHSZ for CA — is there an API? TX, OH, FL equivalents?
8. **Fire station / hydrant proximity**: Best approach to compute this? Google Maps + publicly available fire station databases?
9. **Satellite imagery AI for property**: Overview of Cape Analytics, Betterview, Nearmap, EagleView. What property attributes can they detect? Pricing? Accuracy? Integration options?

### Subagent B: Insurance Enrichment APIs Research
1. **Canopy Connect deep dive**: Carrier coverage in CA, TX, OH, FL. Fields returned for personal auto and personal home. Customer experience (what does the linking flow look like?). Pricing model. Success rate / reliability. Any competitors (Plaid for insurance)?
2. **Fenris Digital**: What data do they provide? Accuracy claims? Pricing? How does it compare to property data aggregators? Any case studies?
3. **LexisNexis insurance products**: What's available (C.L.U.E., Prefill, Insurance Exchange)? What are the access requirements (do we need to be a licensed entity)? Can an insurtech startup access these?
4. **Verisk products for enrichment**: 360Value (replacement cost), ISO PPC (fire protection class), property data products. Access requirements and pricing?
5. **Other insurance enrichment startups**: Any new entrants in the market? Search for companies offering insurance data enrichment, prefill, or policy data APIs.
6. **Comparison matrix**: Build a comparison of all enrichment APIs on: fields provided, data coverage (states/carriers), pricing model, integration complexity, accuracy, and access requirements.
