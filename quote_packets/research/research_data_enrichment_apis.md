---
created: 2026-02-10
author: Alex
status: in-progress
tags: [quote-cycle, data-enrichment, API-research, pl-auto, pl-home]
---

# Insurance Data Enrichment APIs & Services: Comprehensive Research

> **Objective**: Identify and evaluate APIs and services that provide structured insurance data to pre-fill quote fields and compress quoting cycle time for personal auto and home in CA, TX, OH, FL.

---

## Table of Contents

1. [Canopy Connect -- Deep Dive](#1-canopy-connect--deep-dive)
2. [Fenris Digital](#2-fenris-digital)
3. [LexisNexis Insurance Products](#3-lexisnexis-insurance-products)
4. [Verisk / ISO Products](#4-verisk--iso-products)
5. [TransUnion Insurance Products](#5-transunion-insurance-products)
6. [Other Insurance Data Vendors](#6-other-insurance-data-vendors)
7. [Comparison Matrix](#7-comparison-matrix)
8. [Recommended Enrichment Stack](#8-recommended-enrichment-stack)

---

## 1. Canopy Connect -- Deep Dive

### What Is Canopy Connect?

Canopy Connect is the "Plaid for insurance" -- a consumer-permissioned insurance data intake platform. It works exactly like Plaid does for banking: a customer links their existing insurance carrier account, authenticates, and Canopy pulls their full policy data directly from the carrier in structured JSON format.

**Founded**: 2020, Beaverton, Oregon
**Trusted by**: 20,000+ insurance agents
**Funding**: Series A+ (exact amount not publicly disclosed)

### How It Works (Flow)

1. You send the customer a link (via text, email) or embed the Canopy Connect widget in your website/app
2. Customer selects their current insurance carrier from a list of 400+ supported carriers
3. Customer authenticates with their carrier credentials (username/password for their carrier's online portal)
4. Canopy logs into the carrier on behalf of the customer, extracts all policy data
5. Structured data is returned via API/webhooks in real-time
6. **Average data transfer time: 5.6 seconds** from carrier
7. Total customer-facing experience: **less than 20-30 seconds**

### Carrier Coverage

- **400+ carrier integrations** across personal and commercial P&C
- **96% of the U.S. auto insurance market** covered (based on NAIC 2023 Market Share Reports)
- **91% of the U.S. homeowners insurance market** covered
- **61% of the commercial multi-peril market** covered

Given 96% auto market coverage, this almost certainly includes the major carriers in our target states:
- State Farm, GEICO, Progressive, Allstate, USAA, Farmers, Liberty Mutual, Nationwide, Travelers, etc.
- **Note**: Canopy does not publicly list specific carrier names. Need to confirm during sales conversation, especially for USAA (which has unique authentication) and any smaller regional carriers in CA/TX/OH/FL.

### Data Returned

Canopy returns **250+ structured insurance data fields** via JSON API. The data schema is nested/hierarchical:

**Personal Auto Policy Fields:**
| Category | Fields |
|---|---|
| **Policy Details** | policy_id, carrier_policy_number, policy_type, effective_date, expiry_date, renewal_date, canceled_date, total_premium_cents |
| **Contact Info** | first_name, middle_name, last_name, email, phone, address |
| **Coverages** | Coverage types, limits, deductibles per coverage line (liability, collision, comprehensive, UM/UIM, PIP, medical payments) |
| **Vehicles** | VIN, year, make, model per vehicle on policy |
| **Drivers** | Names, DOBs, driver's license numbers per driver |
| **Claims History** | Loss events, claim details, payout amounts (preliminary -- does NOT notify agent of record or carrier) |
| **Documents** | PDFs of declaration pages, ID cards, endorsements, binders, verification of insurance, applications, renewal notices |

**Personal Home Policy Fields:**
| Category | Fields |
|---|---|
| **Policy Details** | Same structure as auto -- policy_id, carrier number, dates, premium |
| **Property/Dwelling** | Property address, dwelling characteristics, dwelling coverages |
| **Coverages** | Dwelling coverage (Coverage A), other structures (B), personal property (C), loss of use (D), liability (E), medical payments (F), deductibles |
| **Claims** | Loss events, claim structures |
| **Documents** | Dec pages, endorsements |

**Data Format**: REST API returning JSON. Nested objects for policies, vehicles, drivers, coverages. Webhooks for real-time event notification (AUTH_STATUS, POLICY_AVAILABLE, COMPLETE, ERROR, MONITORING_EVENTS).

### Customer Experience

- **Completion time**: Less than 20-30 seconds total
- **Success/completion rate**: **70-90%** client success rate reported by agents; 70% success rate from credentials submitted to completion
- **Failure modes**: Customer doesn't know carrier portal credentials, carrier portal is down, MFA complications, carrier not supported
- Agents report saving **30 minutes per client** on average
- Some agencies report **95% of new clients** successfully use it

### Integration Methods

1. **JavaScript SDK (Widget/Modal)**: Include `<script src="https://cdn.usecanopy.com/v2/canopy-connect.js">` and call `CanopyConnect.create()` with your public alias. Opens a modal overlay. Supports React with CodePen examples.
2. **Mobile SDKs**: Swift (iOS), Kotlin (Android), React Native
3. **Direct API**: REST API v1.0.0 for server-to-server integration
4. **Webhooks**: Real-time event notifications
5. **White-label**: Customizable branding on the widget
6. **Pre-built integrations**: Vertafore, Applied Systems, EZLynx, and others

**Integration Complexity**: Low-medium. JavaScript SDK can be embedded in days. Full API integration 1-2 weeks.

```javascript
// Basic React/JS integration example
const handler = CanopyConnect.create({
  publicAlias: "<YOUR_WIDGET_PUBLIC_ALIAS>",
  pullMetaData: {
    yourUserIdentifier: "123"
  }
});

// Open modal on button click
document.getElementById('connect-btn').addEventListener('click', () => {
  handler.open();
});
```

### Enrichment Capabilities Beyond Policy Pull

- **Property Data Enrichment** (`GET /propertyData`): Supplementary property data
- **Driver License Lookup** (`GET /driverLicense`): Driver license verification
- **Household Data** (`GET /household`): Household member information
- **Policy Monitoring** (`POST /monitorings`): Ongoing monitoring for policy changes, cancellations
- **Policy Search** (`POST /policySearch`): Search across pulled policies
- **DecSight**: Extracts and structures data from uploaded dec pages (for customers who can't link their account)

### Pricing

| Tier | Cost | Included |
|---|---|---|
| **API Sandbox** | Free | Full API access, sandbox credentials, unlimited sandbox keys, self-serve support |
| **API Production (Pilot)** | Contact sales | Live production, unlimited API keys, personal + commercial P&C, auto/home policy editing, property enrichment, account monitoring, standard vendor integrations, email/chat support |
| **API Enterprise (Scale)** | Contact sales | Volume-based pricing discounts on pre-committed spend, premium integrations, custom MSA/SLA, custom data retention, dedicated integration engineer, SSO, early feature access |

**Estimated Pricing** (based on market data, not confirmed):
- Agency plans: $100-$600/month
- API production plans: Likely starting ~$1,000/month + per-pull fees
- Enterprise: Custom based on volume commitment

**Pricing model**: Likely per-connection/per-pull + monthly platform fee. Need sales conversation to confirm exact unit economics.

### Security & Compliance

- SOC II Type 2 certified
- 256-bit AES encryption at rest
- TLS 1.3+ encryption in transit
- Continuous compliance monitoring

### Key Strengths for Our Use Case

1. **Richest data source**: Actual current policy data directly from carrier -- not predicted/estimated
2. **Pre-fills almost everything**: Coverages, limits, deductibles, vehicles, drivers, claims -- the exact data needed to generate a competing quote
3. **Speed**: 5.6 seconds average vs. 30+ minutes manual
4. **High success rate**: 70-90% when customers have carrier credentials
5. **Includes dec pages**: Backup verification and audit trail

### Key Risks / Limitations

1. **Requires customer action**: Customer must know their carrier login credentials. Not everyone does.
2. **Not passive enrichment**: Can't run it silently with just name/address -- requires explicit customer consent and authentication
3. **Carrier coverage gaps**: While 96% auto market, some smaller regional carriers or newer insurtechs may not be supported
4. **Credential fatigue**: Some customers may distrust entering their carrier credentials into a third-party widget
5. **USAA/military carriers**: May have unique authentication (MFA, etc.) that could reduce success rate
6. **California-specific**: CA has specific data privacy regulations (CCPA/CPRA) -- need to verify Canopy's compliance posture

---

### Competitors to Canopy Connect ("Plaid for Insurance")

#### Trellis (formerly TrellisConnect)

**What it does**: Embedded insurance solutions platform. Two products:
1. **Trellis Connect**: P&C pre-fill via consumer-permissioned data (similar to Canopy)
2. **Savvy**: All-in-one platform for comparing and purchasing personal P&C insurance (auto, home)

**Key difference from Canopy**: Trellis is more focused on embedded insurance shopping/switching, not just data extraction. They partner with fintechs (Brigit, Rocket Money, Acorns) to embed insurance comparison into financial apps.

**Founded**: 2019, Claymont, Delaware
**Funding**: $5M from Amex Ventures (2022) + additional rounds
**Carrier coverage**: Not publicly disclosed, but claimed broad coverage
**Data fields**: Policy pre-fill for auto (expanding to home)
**Pricing**: Not publicly available

**Assessment**: More of an embedded insurance distribution play than a pure data enrichment API. Less relevant for our use case of building our own quoting workflow. Could be interesting if we wanted to offer comparison shopping, but we are building our own rater.

#### Axle

**What it does**: Insurance data platform for instant verification. Universal API for insurance data.

**Key products**:
1. **Verification**: Retrieve data directly from carriers -- policy status, term, coverages
2. **Policy Monitoring**: Real-time alerts on changes, cancellations
3. **Document AI**: Classify and extract policy info from ID Cards or Dec pages
4. **Validation Engine**: Automatically validate whether a policy meets requirements

**Integration**: Axle Ignition (embeddable consent UI), API, dashboard, platform integrations

**Clients**: Avis, Hertz, Sixt, Turo, BMW, Mercedes-Benz, Ford, Toyota, Honda; 25% of top 30 mortgage servicers, 50% of rental car industry

**Founded**: 2022, Atlanta, Georgia
**Security**: SOC 2 Type 2 certified
**Insurance types**: Auto, home, renters, flood

**Assessment**: Very similar to Canopy Connect but more focused on verification (rental car, mortgage) than insurance agency quoting. Could be a viable alternative if Canopy pricing is unfavorable. Seems more enterprise/automotive focused.

#### Glia

**NOT a "Plaid for insurance"**. Glia is a customer interaction platform (voice, digital, AI) used by 600+ financial institutions and insurance companies. It helps with customer service interactions, not insurance data extraction. **Not relevant to our data enrichment use case.**

#### Polly

**NOT an insurance data exchange**. Polly is focused on embedded insurance for auto dealerships -- integrates insurance enrollment into the car-buying experience using Cox Automotive's API. **Not relevant for our direct-to-consumer/agency quoting use case.**

#### Matic Insurance

**Embedded insurance platform** for mortgage servicers, originators, and banks. Partners with 100+ lenders representing 20% of U.S. mortgage market. Offers home, auto, and personal lines through embedded distribution.

**Assessment**: Matic is a distribution platform, not a data enrichment API. They connect carriers with borrowers through lender channels. Not directly relevant for our data enrichment needs, but worth noting as a potential distribution partnership for the future.

---

## 2. Fenris Digital

### What Is Fenris Digital?

Fenris Digital provides **predictive data enrichment** for insurance. Given minimal inputs (just a name and address), Fenris returns extensive predicted/verified insurance-relevant data about the person, household, vehicles, property, and risk profile.

**Key difference from Canopy**: Canopy requires customer authentication to pull actual carrier data. Fenris works silently in the background with just name + address -- no customer action required. The tradeoff is the data is predicted/sourced from third-party databases rather than directly from the carrier.

**Founded**: Pre-2020 era
**Data sources**: 216+ million adults, 130+ million households, 100% of U.S. addresses for property data

### How It Works

1. You send a name + address (and optionally DOB) via API call
2. Fenris matches against its database of 216M+ adults and 130M+ households
3. Returns structured JSON with predicted/verified data points
4. **Response time**: Sub-second (under 1 second for most calls)

### API Endpoints & Data Fields

Fenris has a well-documented REST API with OAuth2 Bearer token authentication.

#### Auto Prefill (`POST /services/personal/v1/autoprefill/search`)

**Inputs**: firstName, lastName, (optional) dateOfBirth, addressLine1, city, state, zipCode

**Returns 80+ data points including:**

| Category | Fields |
|---|---|
| **Primary Applicant** | gender, maritalStatus, homeOwnerStatus, lengthOfResidence |
| **Household** | numberOfGenerations, presenceOf16Or17YearOlds, age ranges of children, up to 20 hobby interests |
| **Drivers** | Array of drivers in household: name, DOB, age, gender, maritalStatus, memberCode |
| **Vehicles** | Array of registered vehicles: year, make, model, type, fuelType, mileage, marketValue, confidence score |
| **Enhanced Vehicles** | VIN, registration data (when responseType="C") |
| **Response Types** | "M" = base data, "C" = enhanced (includes VINs) |

**Status returns**: Success, Success-Restricted State, Success-No VIN, VIN Return Only, Not Found

#### Driver Record Insights (`POST /services/personal/v1/driverrecord/search`)

**Returns**:
- Clean / Minor Violations / Major Violations / No Results
- Violation counts: minorCount, majorCount, accidentCount, duiCount
- Latest violation dates for each category
- ratingFactor object: preferred, standard, nonStandard, fullSpectrum values

#### Driver's License Lookup (`POST /services/driverslicense/v1/search`)

**Returns**: licenseState, licenseNumber, maskedLicenseNumber, matchDescription

#### VIN Decoder (`GET /services/personal/v1/vindecoder`)

**Returns**: Make, model, modelYear, trim, vehicleType, bodyClass, manufacturer, engine specs, plant location, seat/door count, airbag info

#### Property Assessment Details (`POST /services/propertydetails/v1/search`)

**Inputs**: Address (or lat/long, or APN)

**Returns 500+ property data points including:**

| Category | Fields |
|---|---|
| **Building Characteristics** | Year built, square footage, bedrooms, bathrooms, stories, construction type, roof type, foundation, heating/cooling, garage, pool, etc. |
| **Valuation & Mortgage** | Market value, assessed value, land value, improvement value, mortgage details |
| **Ownership** | Owner name, length of ownership, sale history |
| **Hazards & Perils** | Environmental risks, natural hazard data |
| **Replacement Cost** | Estimated replacement cost |

#### Customer 360 (Composite Profile)

Combined profile aggregating all data about a person/address into a single call.

#### Lead & Applicant Scoring

- Propensity-to-buy scoring for auto, home, commercial, life, health
- Lifetime value prediction
- Cross-sell/upsell indicators

### State-Specific Limitations

**CRITICAL for our use case**: Fenris has "restricted states" for vehicle data:
- **CA, HI, NH, NY, OK, PA, VA** are listed as restricted states with limited VIN/vehicle data availability
- **California is a restricted state** -- this means vehicle data (particularly VINs) may be limited or unavailable for CA residents
- Fenris announced VIN data for all 50 states, but CA still shows restrictions in documentation

**Impact on our target states:**
- **CA**: Restricted -- limited vehicle/VIN data. Significant concern for our largest target market.
- **TX**: Appears unrestricted -- full data available
- **OH**: Appears unrestricted -- full data available
- **FL**: Appears unrestricted -- full data available

### Accuracy Claims

- Over 90% reduction in manual data gathering reported by customers
- 20%+ improvement in abandonment rates
- Customers process over 1 million API requests monthly
- Data sourced from "verified third-party data" -- not self-reported
- **No published third-party accuracy validation** found

### Pricing

- **Per-request pricing**: Charged by the request, not by data returned
- Invoiced monthly
- Developer/sandbox data is free (uses synthetic data -- no PII)
- **Exact pricing not published** -- requires sales conversation
- **Estimated**: Based on similar vendors, likely $0.50-$3.00 per API call depending on endpoint and volume

### Integration Complexity

- **Low**: Well-documented REST API with OpenAPI 3 spec
- OAuth2 Bearer token authentication
- Postman collection available
- Developer sandbox with synthetic test data
- Integration time estimate: **3-5 days** for basic auto prefill, **1-2 weeks** for full suite

### Comparison to Property Data Aggregators

| Feature | Fenris | ATTOM | CoreLogic/Cotality |
|---|---|---|---|
| **Property Data** | 500+ fields, integrated | 9,000 attributes/property, 70B rows | 200+ data sources, enterprise-grade |
| **Auto/Driver Data** | Yes (drivers, VINs, violations) | No | No |
| **Insurance-Specific** | Purpose-built for insurance | General real estate/property | Insurance + mortgage + real estate |
| **Input Required** | Name + address | Address | Address |
| **Pricing** | Per-request, likely $1-3 | ~$500+/mo for few thousand calls | Enterprise pricing, contact sales |
| **Startup Friendly** | Yes, self-serve sandbox | Moderate -- enterprise sales | Difficult -- enterprise only |
| **Best For** | Insurance quoting prefill | Deep property analytics | Enterprise insurance underwriting |

### Competitors (Predictive Prefill from Minimal Inputs)

- **LexisNexis Data Prefill**: Similar concept but requires carrier sponsorship/Node ID. More comprehensive but harder to access.
- **Verisk QuickFill**: ISO's 34 databases bundled. Enterprise only.
- **SortSpoke**: AI-powered extraction + enrichment + prefill. More focused on commercial submissions.
- **Veridion**: Business data enrichment (80M businesses). Better for commercial than personal lines.

---

## 3. LexisNexis Insurance Products

### Overview

LexisNexis Risk Solutions is the dominant player in insurance data. They operate the largest contributory databases in the industry. Their products are the gold standard for claims history, driver data, and risk scoring.

### C.L.U.E. (Comprehensive Loss Underwriting Exchange)

#### What It Provides

**C.L.U.E. Auto**:
- Up to **7 years** of personal automobile claims history
- **99.6% of the auto industry** contributes claims data
- Most comprehensive claims history database in the United States
- Data fields: claim date, type of loss, payout amounts, policy information, claim status, driver info, vehicle info
- 23.4% of added drivers have claims activity within 3 years
- 31.7% of added drivers over 25 have claims within 3 years

**C.L.U.E. Property**:
- Up to **7 years** of home insurance and personal property claims
- Claims data contributed by 95%+ of home insurance companies
- Data fields: claim date, loss type, amount paid, property address, policy info

#### Access Requirements

**This is the biggest barrier**: Only insurance companies subscribing to C.L.U.E. can contribute and access reports. Specifically:
- You must be a **licensed insurer or have carrier sponsorship**
- If you have an existing **LexisNexis Node ID**, integration is faster
- If you don't, you need to complete a LexisNexis application AND **obtain carrier sponsorship**
- An insurtech/agency platform can access it IF they act on behalf of a subscribing carrier
- **Individual consumers can request their own CLUE report** (free once per year under FCRA)

**For our use case**: We would need to either:
1. Become a licensed entity (MGA/carrier) -- long-term play
2. Partner with a carrier who sponsors our access -- more realistic for V1
3. Have our carrier partners pull CLUE on our behalf during their underwriting -- most common current approach
4. Use Canopy Connect which can surface claims data from the carrier's own records -- workaround

#### Pricing

- Not publicly disclosed
- Enterprise/subscription model
- Typically bundled with other LexisNexis products
- **Estimated**: Per-inquiry pricing in the $1-5 range, with monthly minimums

### LexisNexis Data Prefill

#### Auto Data Prefill (ADP)

- **Single-inquiry solution** that returns driver, vehicle, and policy data
- Draws from the "largest source of industry trusted data assets"
- Uses proprietary linking technology (LexID) to match records
- Returns: household members, registered vehicles, prior policy info, driver details
- Designed for **point-of-quote** use

#### Property Data Prefill

- Automatically fills in **80+ property elements**: year built, roof type, foundation, finish, bedrooms, bathrooms, square footage, construction type, etc.
- Covers data for streamlining the homeowners application process
- Single-inquiry, interactive solution

#### Access Requirements

Same barrier as CLUE:
- Requires LexisNexis account and credentialing process
- **Requires carrier sponsorship** if you don't have an existing Node ID
- Designed primarily for carriers and their authorized agents/vendors
- Can be accessed through rater platforms (EZLynx, Applied Rater) that have pre-built integrations

**For our use case**: Same access challenges as CLUE. Best path is through carrier partnership or rater platform integration.

### LexisNexis Insurance Exchange

- This is a **data delivery platform** (not a distinct data product)
- Unified integration point for accessing multiple LexisNexis insurance products
- Pre-integrated with Duck Creek, Guidewire, and other core platforms
- Allows carriers to access CLUE, Prefill, MVR, credit scores, and other products through a single API connection

### Other Relevant LexisNexis Products

| Product | Description | Relevance |
|---|---|---|
| **Active Insights CLUE at Renewal** | Proactive monitoring for new/updated claims post-underwriting | Future: renewal monitoring |
| **Telematics OnDemand** | Telematics-based risk scoring at point of quote | Future: UBI pricing |
| **MVR (Motor Vehicle Reports)** | Official driving records from state DMVs | High: driver risk assessment |
| **Insurance Score** | Credit-based insurance score | Carrier-side only |
| **CLUE Auto Damage 360** | Enhanced claims data with damage/repair details | Future: advanced underwriting |

### Assessment for Our Use Case

LexisNexis products are the **gold standard** but have significant **access barriers** for a startup. Our realistic options:

1. **Short-term**: Use Canopy Connect to get claims/policy data from the consumer side; use Fenris for prefill
2. **Medium-term**: When we have carrier partnerships, get sponsored access to CLUE + Prefill
3. **Long-term**: If we become an MGA, get direct LexisNexis access

---

## 4. Verisk / ISO Products

### 360Value (Replacement Cost Estimation)

#### What It Does

360Value provides component-based replacement cost estimates for residential properties. Given an address, it:
1. Prefills property characteristics from a database of ~90 million residential structures
2. Calculates cost-to-rebuild based on actual claims data
3. Returns estimated replacement cost with area-specific pricing for **468 different U.S. regions**

#### Data Sources

- Millions of replacement cost and claims loss estimates from 360Value and Xactimate
- ISO PushPin (insurance-ready public records)
- Terrain and road network analytics
- Research from 92,000 claims and building contractors

#### SmartSource (Prefill Within 360Value)

- Provides **up to 68 property characteristics** with confidence scores for 15 key items
- Covers **124+ million U.S. addresses**
- Insurance-ready, property-specific information
- Used to populate applications AND validate agent/homeowner-provided data

#### Integration

- Web integration option available (works on computers, tablets, smartphones)
- Can integrate into any web-based policy management system
- Pre-built integrations with BriteCore and other policy admin systems
- API access via Verisk Gateway with client_id/client_secret

#### Accuracy

- Widely considered the **industry standard** for replacement cost estimation
- Based on actual claims cost data, not just square footage multipliers
- Component-based (not a single formula) -- accounts for materials, labor, local costs
- Used by the majority of U.S. property insurers

#### Access Requirements

- Requires Verisk account and contract
- Historically enterprise-only (carriers and large MGAs)
- BriteCore and other platforms offer integrated access -- could be a path for startups
- **Estimated barrier**: Medium-high. Need to go through Verisk sales.

#### Pricing

- Not publicly disclosed
- Likely per-lookup + subscription model
- **Estimated**: $1-5 per replacement cost estimate, with monthly minimums in the thousands

### ISO Protection Class (PPC)

#### What It Does

Assigns a Public Protection Classification (PPC) from **1 to 10** to every property address:
- Class 1 = superior fire protection
- Class 10 = fire suppression doesn't meet minimum criteria
- Critical rating factor for homeowners insurance

#### How It Works

- ISO's **LOCATION database** contains street-level addresses for virtually all U.S. properties
- Powered by ISO's Geographic Underwriting System (GUS) geocoding
- Address-level lookup: validates against address table, returns exact fire district and protection class
- Measures **1,000+ unique data elements** about fire suppression capabilities

#### API Access

- Available through ISO Passport platform (responds to 20M+ transaction requests/year)
- Part of the Verisk Underwriting API suite
- Can be queried at the address level
- **ISO Property Territory API** documented at gateway.verisk.com

#### Access Requirements

- Requires Verisk/ISO subscription
- Part of the QuickFill bundle or standalone
- **Access path for startups**: Through a rater platform or carrier partner that has Verisk access

### Verisk QuickFill (Comprehensive Prefill)

#### What It Does

QuickFill delivers data from any combination of **ISO's 34 automobile and property databases** at point of quote:
- Prior claims and coverage information
- Registered vehicles (VINs)
- Location-specific property characteristics
- Estimated replacement cost evaluations
- Hazard data (flood, fire, wind, etc.)
- Drivers in the household
- Protection class
- Distance to coast

#### Delivery

- Via **ISO Passport** technology platform
- Single integration point for multiple databases
- Supports cross-selling between auto and home

#### Access

- Enterprise subscription through Verisk
- **Not easily accessible for startups** without carrier partnership
- Can access through rater platforms that have Verisk integration

### Other Verisk Products

| Product | Description | Relevance |
|---|---|---|
| **ISO PushPin** | Public records data, insurance-ready | Property characteristics |
| **Verisk Underwriting API** | Homeowner data API with tech docs/schemas | Home underwriting data |
| **Verisk Property** | Broad property data including slope, site access | Advanced underwriting |
| **ISO Claims Database** | Access to MVRs through ISO | Driver records |
| **A-PLUS (Auto)** | Personal auto loss underwriting service | Auto claims history |

### Assessment for Our Use Case

Verisk/ISO products are **essential for homeowners** but have **enterprise access barriers**:

1. **360Value**: Must-have for home quoting (replacement cost). Access through carrier partner or BriteCore integration.
2. **PPC**: Must-have for home rating. Access through ISO Passport or bundled with rater.
3. **QuickFill**: Ideal comprehensive prefill but enterprise-only. Use Fenris as alternative for V1.

---

## 5. TransUnion Insurance Products

### TruVision Insurance Risk Scores

- **TruVision Insurance Rate Score (TUIRS)**: Credit-based insurance score
  - Auto Model (00R96)
  - Property Model (00R95)
  - Combo Model (00R99)
- Used by carriers to predict insurance losses and set premiums
- **Access**: Carriers pull this during underwriting. Not something we would access directly.
- Regulated under FCRA -- requires permissible purpose

### DriverRisk / MVR Solutions

#### What It Does

TransUnion's national driving record solution combines:
- **DriverRisk court records** (captures out-of-state violations that traditional MVRs miss)
- **State Motor Vehicle Reports (MVRs)**
- Delivers a more comprehensive view of driver behavior

#### Key Stats

- Insurers report **30-50% savings** on total MVR expenses using DriverRisk
- Traditional MVRs leave "critical gaps, especially for out-of-state violations"
- Configurable: select which court record violations and state MVRs to include

#### SmartMVR

Intelligent MVR ordering -- uses risk indicators to determine when a full MVR pull is needed vs. when DriverRisk court data is sufficient.

#### Access Requirements

- Available through TransUnion's insurance data services (Datalink platform)
- Requires contract with TransUnion
- **Access for startups**: Moderate barrier. TransUnion works with insurtechs but requires account setup and likely carrier partnership.
- Regulated data -- requires DPPA compliance and permissible purpose

### TrueVision for Property

- Property risk scoring for insurance underwriting
- Focuses on identifying high-risk policies and streamlining low-risk
- Optimizes underwriting resources and inspections
- **Limited detail publicly available** on specific data fields

### Assessment for Our Use Case

TransUnion products are **carrier-side tools** for the most part:
1. **Insurance scores**: Carrier pulls during underwriting -- not our domain
2. **DriverRisk/MVR**: Relevant but requires DPPA compliance and carrier partnership. For V1, rely on Fenris driver record insights or Canopy Connect driver data.
3. **Property data**: Less relevant than Verisk/CoreLogic for our use case

---

## 6. Other Insurance Data Vendors

### Property Intelligence (Aerial Imagery AI)

#### Cape Analytics (acquired by Moody's, Jan 2025)

- **What**: AI-powered geospatial property risk intelligence from aerial imagery
- **Data**: Roof condition rating, vegetation proximity, solar panels, property attributes, lot-level details
- **Coverage**: 100+ million properties, trusted by 50%+ of top U.S. insurance carriers
- **Regulatory**: Roof Condition Rating approved for ratemaking in 40 states
- **Now part of Moody's**: Integrated with Moody's Intelligent Risk Platform and catastrophe models
- **Access**: API-based. Now through Moody's -- may affect startup accessibility.
- **Pricing**: Enterprise; not publicly disclosed
- **Relevance**: V2/V3 for advanced home underwriting and risk-based pricing

#### Betterview (acquired by Nearmap, 2023)

- **What**: Property intelligence and risk management platform using AI + aerial imagery
- **Data**: 100M+ properties, 87% of U.S. population coverage at leading resolution (up to 3x/year imagery)
- **Capabilities**: Roof condition, property monitoring, automation flags, damage detection
- **Access**: API and platform
- **Pricing**: Enterprise; not publicly disclosed
- **Relevance**: V2/V3 alternative to Cape Analytics. Now part of Nearmap.

#### Arturo

- **What**: AI-based property intelligence from imagery for insurance underwriting, risk management, claims
- **Founded**: 2018, Denver, CO (formerly Deep Image Analytics)
- **Capabilities**: Computer vision models for property analysis
- **Relevance**: V3 -- less established than Cape Analytics or Betterview

### Climate Risk Analytics

#### ZestyAI

- **What**: AI risk intelligence platform for insurance -- property-level risk scoring across perils
- **Products**:
  - **Z-FIRE**: Wildfire risk prediction (which homes survive vs. are lost)
  - **Z-HAIL/Z-SCS**: Severe convective storm risk with accumulated damage modeling
  - **Z-PROPERTY**: Property intelligence (roof condition, complexity, lot-level details)
- **Key differentiator**: Mitigation-aware scoring (adjusts for roof replacements, upgrades, etc.)
- **Partnerships**: EarthDaily Analytics (satellite imagery), Duck Creek integration
- **Regulator approved**: Emphasized for ratemaking
- **Pricing**: Enterprise; not publicly disclosed
- **Relevance**: V2/V3 for CA wildfire risk (critical), FL hurricane risk, TX hail risk

### Property Data Platforms

#### ATTOM Data Solutions

- **What**: Multi-source property data covering 158M+ properties (99% of U.S. addresses)
- **Data**: 70 billion rows, 9,000 attributes per property -- ownership, AVMs, mortgage, sales history, characteristics, tax assessments, zoning, environmental hazards
- **Access**: REST APIs and cloud data delivery
- **Pricing**: Custom/enterprise. Estimated ~$500+/month for basic API access (few thousand calls)
- **Relevance**: Alternative to CoreLogic for property characteristics. More accessible for startups.

#### CoreLogic / Cotality

- **What**: Global property data leader. 500+ P&C insurers rely on their data.
- **Products**:
  - **Marshall & Swift**: Gold standard for replacement cost data (90+ years)
  - **Property API Solutions**: 200+ data sources
  - **Insurance underwriting solutions**: Risk selection, claims management
- **Access**: Developer portal at developer.corelogic.com. Enterprise pricing.
- **Pricing**: Not published. Enterprise sales required. Estimated high ($$$).
- **Relevance**: Enterprise alternative to Verisk for property data. Too expensive and complex for V1.

### Insurance-Adjacent Platforms

#### AgentSync

- **What**: Insurance producer compliance and licensing management
- **Products**: ProducerSync API (200+ data points on licensing, appointments, adjuster licensing from NIPR)
- **Relevance**: Not data enrichment for quoting. Relevant if we need producer licensing verification for our agent platform. V3+.

#### Socotra / Duck Creek / Guidewire

- **What**: Core insurance platforms (policy admin, billing, claims)
- **Data capabilities**: These are not data enrichment vendors. They are platforms that CONSUME enrichment data from LexisNexis, Verisk, etc.
- **Relevance**: Potential future platform if we become an MGA/carrier. Not relevant for data enrichment research.
- **Note**: Duck Creek has pre-built integrations with LexisNexis, Verisk, ZestyAI, and others -- worth noting for future architecture decisions.

#### SortSpoke

- **What**: AI-powered data extraction, enrichment, and prefill for insurance submissions
- **Focus**: Commercial insurance submissions (PDF extraction + enrichment)
- **Capabilities**: Extracts from PDFs, enriches with firmographics, property details, hazard data, prefills forms
- **Relevance**: More commercial-focused. Not primary for personal lines V1 but interesting tech.

#### Planck

- **What**: AI-powered underwriting intelligence, primarily for commercial P&C
- **Capabilities**: Aggregates public and proprietary data for underwriting insights -- web presence, financial risk, historical violations
- **Relevance**: Commercial-focused. Not relevant for personal lines V1.

---

## 7. Comparison Matrix

### Insurance Data Linking / "Plaid for Insurance"

| Vendor | Product | Data Source | Auto Fields | Home Fields | Carrier Coverage | Access Req | Pricing Model | Integration | Our Priority |
|---|---|---|---|---|---|---|---|---|---|
| **Canopy Connect** | Insurance Data Intake API | Direct from carriers (consumer-permissioned) | Policy, coverages, limits, deductibles, drivers, vehicles (VIN, year, make, model), claims, dec pages, premiums | Policy, dwelling coverages, property address, claims, dec pages, premiums | 400+ carriers, 96% auto, 91% home | API key (self-serve sandbox) | Per-pull + platform fee. Est. $1K+/mo | JS SDK, mobile SDKs, REST API, webhooks. Low-med complexity | **P0 -- MUST HAVE** |
| **Axle** | Insurance Verification API | Direct from carriers (consumer-permissioned) | Policy status, term, coverages | Home, renters, flood | Not disclosed (automotive/mortgage focused) | API key | Not disclosed | Axle Ignition widget, REST API | P2 -- Backup to Canopy |
| **Trellis** | Trellis Connect | Consumer-permissioned carrier data | Auto policy prefill | Expanding to home | Not disclosed | API | Not disclosed | API, embedded | P3 -- Different use case |

### Data Enrichment / Prefill (Passive -- No Customer Action)

| Vendor | Product | Input Required | Auto Fields | Home Fields | State Coverage | Access Req | Pricing | Integration | Our Priority |
|---|---|---|---|---|---|---|---|---|---|
| **Fenris Digital** | Auto Prefill API | Name + address | Drivers, vehicles (year/make/model/VIN), household, driver records (violations/DUI/accidents), license lookup, rating factors | 500+ property fields: year built, sq ft, beds/baths, construction, roof, foundation, heating/cooling, valuation, mortgage, hazards, replacement cost | All 50 states. **CA restricted** for vehicle VINs | OAuth2 API key (self-serve sandbox) | Per-request. Est. $0.50-3.00/call | REST API, OpenAPI 3, Postman. **Low complexity** | **P0 -- MUST HAVE** |
| **LexisNexis** | Auto Data Prefill | Name + address | Drivers, vehicles, policy info, household | 80+ property elements: year built, roof, foundation, bedrooms, bathrooms | National | Carrier sponsorship + Node ID | Enterprise subscription | Platform integration or direct API | P1 -- When carrier-sponsored |
| **LexisNexis** | C.L.U.E. Auto/Property | Name + address or policy | 7 years claims: dates, loss type, payouts, status | 7 years property claims | National (99.6% auto industry) | Licensed insurer or carrier sponsorship | Enterprise subscription | Platform integration | P1 -- When carrier-sponsored |
| **Verisk** | QuickFill | Address | VIN, drivers, prior claims/coverage | Property chars, replacement cost, PPC, hazards | National (34 ISO databases) | ISO Passport subscription | Enterprise | ISO Passport platform | P1 -- Via carrier partner |
| **Verisk** | 360Value + SmartSource | Address | N/A | 68 property chars, replacement cost (90M addresses) | National (468 pricing regions) | Verisk contract | Enterprise. Est. $1-5/lookup | Web integration, API, BriteCore | **P0 for HOME** |
| **Verisk** | ISO PPC/LOCATION | Address | N/A | Fire protection class (1-10), fire district | National (virtually all addresses) | ISO subscription | Bundled with QuickFill or standalone | ISO Passport API | **P0 for HOME** |

### Property Data (Deep Property Intelligence)

| Vendor | Product | Data Type | Key Fields | Coverage | Access | Pricing | Our Priority |
|---|---|---|---|---|---|---|---|
| **ATTOM** | Property API | Public records, assessor | Ownership, AVM, mortgage, sales history, tax, characteristics, zoning, hazards | 158M+ properties (99% US) | REST API, cloud | Custom. Est. $500+/mo | P2 -- Alt to Fenris property |
| **CoreLogic/Cotality** | Property + Marshall & Swift | Property + replacement cost | 200+ sources, replacement cost (gold standard) | National | Developer portal | Enterprise $$$ | P3 -- Too expensive for V1 |
| **Cape Analytics** (Moody's) | Property Intelligence | Aerial imagery AI | Roof condition, vegetation, solar panels, lot details | 100M+ properties | API | Enterprise | P3 -- V2/V3 |
| **Betterview** (Nearmap) | Property Intelligence | Aerial imagery AI | Roof condition, monitoring, damage detection | 100M+ properties | API, platform | Enterprise | P3 -- V2/V3 |
| **ZestyAI** | Z-FIRE, Z-SCS, Z-PROPERTY | Climate risk + property AI | Wildfire score, hail risk, roof condition, mitigation-aware | National | API, Duck Creek | Enterprise | P2 -- Important for CA/FL |

### Driver Data

| Vendor | Product | Data Type | Fields | Access | Pricing | Our Priority |
|---|---|---|---|---|---|---|
| **Fenris** | Driver Record Insights | Predicted violations | Minor/major/accident/DUI counts, dates, rating factors | API (self-serve) | Per-request | P0 -- V1 |
| **Fenris** | Driver License Lookup | License number | State, license number (masked available) | API (self-serve) | Per-request | P0 -- V1 |
| **LexisNexis** | MVR | Official state DMV records | Full driving record, violations, suspensions | Carrier sponsorship | Enterprise | P1 -- When sponsored |
| **TransUnion** | DriverRisk + MVR | Court records + state MVR | Comprehensive violations incl. out-of-state | TU contract + DPPA | Enterprise. 30-50% MVR savings | P2 -- Alternative to LN |

---

## 8. Recommended Enrichment Stack

### V1: Personal Auto in CA, TX, OH, FL

#### MUST-HAVE Integrations

**1. Canopy Connect (Insurance Data Intake)**
- **Why**: This is our single most impactful integration. When a customer links their existing policy, we get their EXACT current coverages, limits, deductibles, vehicles, drivers, claims, and dec pages. This is the fastest path to a pre-filled quote.
- **Integration time**: 1-2 weeks (JS SDK embed + API backend)
- **Ongoing cost**: Estimated $1,000-2,500/month + per-pull fees (need sales call)
- **Impact on cycle time**: Reduces quote data collection from 15-30 minutes to under 30 seconds for ~70-90% of customers who can authenticate
- **Risk**: Customer must know their carrier credentials. ~10-30% may not be able to complete linking.

**2. Fenris Digital Auto Prefill + Driver Record Insights**
- **Why**: For customers who can't or won't link via Canopy, Fenris provides passive enrichment from just name + address. Populates drivers, vehicles, household, and violation history. Also serves as a data verification layer against Canopy data.
- **Integration time**: 3-5 days (REST API)
- **Ongoing cost**: Estimated $500-1,500/month at initial volumes (per-request pricing)
- **Impact on cycle time**: Pre-fills 80+ fields in under 1 second. Reduces manual entry by 60-80% even without Canopy.
- **Risk**: CA is a "restricted state" for vehicle VINs -- may have gaps in our largest target market. Need to test and quantify.

**Combined V1 Workflow:**
```
Customer enters: Name + Address + DOB
    |
    v
[Fenris Auto Prefill] --> Pre-fills drivers, vehicles, household (background, <1 sec)
    |
    v
[Optional: Canopy Connect] --> Customer links carrier account
    |                          --> Overwrites/validates Fenris data with actual policy data
    |                          --> Pulls exact coverages, limits, claims, dec pages
    v
[Smart Form] --> Customer reviews/corrects pre-filled data
    |
    v
[Submit to Rater] --> Generate quotes with complete, verified data
```

**Estimated V1 integration time**: 2-3 weeks total
**Estimated V1 monthly cost**: $1,500-4,000/month
**Estimated cycle time impact**: 70-85% reduction in data collection time

---

### V2: Add Personal Home, Deeper Data

#### SHOULD-HAVE Integrations

**3. Fenris Property Assessment Details**
- **Why**: 500+ property data points from just an address. Pre-fills dwelling characteristics for home quoting.
- **Integration time**: 1-2 days (already integrated with Fenris for auto)
- **Additional cost**: Per-request pricing (bundled with auto)
- **Impact**: Pre-fills most home application fields. Reduces home data collection by 80%+.

**4. Verisk 360Value (Replacement Cost) -- via carrier partner**
- **Why**: Industry-standard replacement cost estimation. Required for accurate dwelling coverage recommendations.
- **Integration time**: 2-4 weeks (depends on carrier partner's Verisk access)
- **Cost**: Passed through carrier partner or direct subscription ($2K-5K/month estimated)
- **Impact**: Accurate Coverage A recommendations. Critical for credibility and proper coverage.

**5. Verisk ISO PPC (Protection Class) -- via carrier partner**
- **Why**: Fire protection class is a required rating factor for home insurance.
- **Integration time**: 1-2 weeks (often bundled with 360Value via ISO Passport)
- **Cost**: Bundled with Verisk subscription
- **Impact**: Required data -- can't rate home policies without it.

**6. LexisNexis Prefill + CLUE -- via carrier sponsorship**
- **Why**: When we have carrier partnerships established, getting sponsored LexisNexis access gives us the gold-standard prefill and claims history data.
- **Integration time**: 4-8 weeks (includes credentialing process)
- **Cost**: Enterprise pricing, subsidized by carrier partnership
- **Impact**: Replaces/supplements Fenris with more authoritative data. CLUE claims data enables better risk assessment.

**Estimated V2 integration time**: 6-10 weeks (incremental from V1)
**Estimated V2 monthly cost**: $5,000-12,000/month total
**Estimated cycle time impact**: 85-95% reduction in data collection for auto+home combined

---

### V3+: Advanced Analytics & Future

#### NICE-TO-HAVE Integrations

**7. ZestyAI (Climate Risk Scoring)**
- **Why**: Critical for CA wildfire risk and FL hurricane risk. Enables risk-based pricing and helps identify properties in high-risk areas.
- **Timeline**: 6+ months out
- **Cost**: Enterprise pricing ($$$$)
- **Impact**: Better risk selection, competitive pricing in high-risk areas

**8. Cape Analytics / Betterview (Aerial Property Intelligence)**
- **Why**: Roof condition and property attributes from imagery. Reduces need for physical inspections.
- **Timeline**: 6-12 months out
- **Cost**: Enterprise pricing
- **Impact**: Better underwriting accuracy, fewer post-bind surprises

**9. TransUnion DriverRisk (Enhanced MVR)**
- **Why**: 30-50% MVR cost savings, catches out-of-state violations that traditional MVRs miss
- **Timeline**: When MVR volume justifies
- **Cost**: Per-lookup, lower than traditional MVR
- **Impact**: Better driver risk assessment, cost savings on MVR pulls

**10. ATTOM Property Data (Deep Property Analytics)**
- **Why**: 9,000 attributes per property for advanced analytics and property intelligence
- **Timeline**: When building advanced underwriting models
- **Cost**: Custom, ~$500+/month
- **Impact**: Enhanced property risk models

---

### Summary: Investment vs. Impact

| Phase | Integrations | Est. Integration Time | Est. Monthly Cost | Cycle Time Reduction |
|---|---|---|---|---|
| **V1 (Auto, 4 states)** | Canopy Connect + Fenris Auto/Driver | 2-3 weeks | $1,500-4,000 | 70-85% |
| **V2 (Add Home)** | + Fenris Property + Verisk 360Value/PPC + LexisNexis (via carrier) | +6-10 weeks | $5,000-12,000 total | 85-95% |
| **V3 (Advanced)** | + ZestyAI + Cape/Betterview + TransUnion DriverRisk | +3-6 months | $15,000-30,000+ total | 95%+ (approaching full automation) |

### Key Decision Points

1. **Canopy Connect vs. Fenris is not either/or -- we need BOTH.** Canopy provides exact carrier data when the customer authenticates; Fenris provides passive prefill when they don't. Together they cover all scenarios.

2. **Carrier partnerships unlock enterprise data.** LexisNexis CLUE/Prefill and Verisk 360Value/PPC are gated behind carrier sponsorship. Securing carrier partnerships early accelerates our data access.

3. **CA vehicle data gap with Fenris needs testing.** California being a restricted state for Fenris VIN data is a concern since CA is likely our largest market. Need to quantify the actual data gap during sandbox testing. Canopy Connect may fully compensate for this gap.

4. **Home quoting requires Verisk access.** You cannot properly quote homeowners without replacement cost estimation (360Value) and protection class (PPC). This is non-negotiable for V2 and should inform carrier partnership strategy.

5. **Start sales conversations now.** Canopy Connect, Fenris, Verisk, and LexisNexis all require sales conversations for production pricing. Start these in parallel with development.

---

### Immediate Next Steps

- [ ] **Schedule Canopy Connect demo/sales call** -- Get exact pricing, confirm carrier coverage for CA/TX/OH/FL, test sandbox
- [ ] **Schedule Fenris sales call** -- Get pricing, test sandbox, specifically test CA vehicle data restrictions
- [ ] **Register for Canopy Connect sandbox** (free, self-serve at usecanopy.com/api/developer-account)
- [ ] **Register for Fenris developer sandbox** (free synthetic data at fenrisd.com/contact-us)
- [ ] **Map carrier partnership strategy** -- Which carriers can sponsor LexisNexis/Verisk access?
- [ ] **Evaluate Verisk access paths** -- Through BriteCore? Through carrier partner? Direct?
