---
created: 2026-02-10
author: Alex
status: complete
tags: [data-enrichment, insurance, prefill, homeowners, auto, research, quote-packets]
---

# Data Enrichment Opportunities for Personal Lines Insurance Quotes

Deep research on public and private data sources for pre-filling, validating, and enhancing home and auto quote data for independent insurance agencies.

---

## 1. Property Data Sources for Homeowners Quotes

### 1.1 What Data Is Needed

Every homeowners quote requires the following property characteristics:

| Data Field | Rating Impact | Typical Source |
|---|---|---|
| Year built | High | Tax assessor, MLS |
| Square footage (finished) | High | Tax assessor, MLS |
| Construction type (frame, masonry, etc.) | High | Tax assessor, aerial imagery |
| Roof type/material | High | Aerial imagery, permits |
| Roof age | High | Permits, aerial imagery AI |
| Number of stories | Medium | Tax assessor, aerial imagery |
| Foundation type | Medium | Tax assessor |
| Heating type | Medium | Tax assessor (varies) |
| Electrical/plumbing updates | Medium | Permits, self-reported |
| Swimming pool (yes/no, fenced) | Medium | Aerial imagery, tax assessor |
| Detached structures | Medium | Aerial imagery, tax assessor |
| Distance to fire station/hydrant | High | Verisk PPC/LOCATION |
| Replacement cost estimate | Critical | Verisk 360Value, CoreLogic MSB |
| Flood zone | Critical | FEMA NFHL, private models |
| Wildfire risk score | Critical (CA) | Verisk FireLine, ZestyAI |
| Prior claims history | High | LexisNexis CLUE, Verisk A-PLUS |

### 1.2 Public Data Sources

#### County Assessor / Tax Records
- **What it provides**: Year built, square footage, lot size, number of stories, construction type, number of bedrooms/bathrooms, assessed value, land use codes
- **Access**: Varies dramatically by county. No national API exists. Individual county websites range from fully digitized with APIs (e.g., many CA and FL counties) to paper-only offices
- **Aggregators**: TaxNetUSA (300+ counties, XML/JSON API), NETR Online (portal to county sites), actDataScout (county-sponsored records), AssessorData.org
- **Limitations**: Data is often 1-3 years stale. Fields like roof type, heating type, and pool presence are inconsistently captured. No renovation/update history
- **Cost**: Varies. TaxNetUSA charges per-query fees. Many county sites are free but require scraping

#### Building Permits (BuildFax / Verisk)
- **What it provides**: Permit history including roof replacements, electrical/plumbing updates, additions, renovations, demolitions
- **BuildFax** (now owned by Verisk): The nation's largest permit database with 184M+ permits across 90M+ properties and 270M+ inspection records. Data sourced from local building departments nationwide
- **Insurance use**: Determines roof age (from roofing permits), validates renovation claims, identifies unpermitted work risk
- **Access**: API, batch, and web application. Integrated into Verisk's suite
- **Limitations**: Permit coverage is uneven -- urban areas well covered, rural areas spotty. Not all jurisdictions report to BuildFax. Unpermitted work (common for roofs, pools) is invisible
- **Sources**: [BuildFax](https://www.buildfax.com/)

#### FEMA Flood Maps (National Flood Hazard Layer)
- **What it provides**: Flood zone designation (A, AE, V, VE, X, etc.), Base Flood Elevation, floodway boundaries
- **Access**: Free. FEMA's National Flood Hazard Layer (NFHL) is publicly available via map viewer and downloadable GIS data. FEMA also publishes the National Risk Index (updated Dec 2025 to v1.20) covering 18 natural hazards
- **Limitations**: FEMA maps are frequently outdated -- many based on decades-old studies. Do not capture pluvial (rainfall) flooding or recent development patterns. Private flood models significantly outperform FEMA for actual risk
- **Sources**: [FEMA NFHL](https://www.fema.gov/flood-maps/national-flood-hazard-layer), [FEMA National Risk Index](https://www.fema.gov/flood-maps/products-tools/national-risk-index)

#### Zillow / Redfin / Real Estate APIs
- **What it provides**: Zestimate (market valuation), property details (beds, baths, sq ft), listing history, property photos
- **Zillow API**: Historically popular but increasingly restricted. Zillow currently does not allow API access for commercial/business purposes unless you are a non-profit. Paid plans start ~$500/month for enhanced features. Key limitation: no tax/assessment history, no transaction history via API
- **Redfin API**: Pay-as-you-go per API call; bulk licensing available for enterprise. More accessible than Zillow for commercial use
- **Insurance relevance**: Limited direct use. MLS-sourced data can supplement assessor data for property characteristics, but licensing restrictions prevent most insurance applications
- **Sources**: [Zillow Group Developers](https://www.zillowgroup.com/developers/)

#### Google Maps / Aerial Imagery (Public)
- **What it provides**: Street View (exterior photos), satellite imagery (roof visible), property context
- **Google Aerial View API**: Available for developers. Useful for basic property context
- **Insurance use**: Street View can validate exterior condition; satellite imagery can identify pools, outbuildings. However, Google imagery resolution is typically insufficient for detailed roof analysis
- **Limitations**: Not insurance-grade resolution. Update frequency varies. Not a substitute for commercial aerial providers
- **Sources**: [Google Aerial View API](https://developers.google.com/maps/documentation/aerial-view/overview)

### 1.3 Private / Commercial Data Sources

#### Verisk (ISO) -- The 800-Pound Gorilla

| Product | What It Does | Key Stats |
|---|---|---|
| **SmartSource Prefill** | Address-in, property-characteristics-out for 124M+ U.S. residential properties. Up to 68 characteristics with confidence scores for 15 key items | 100% hit rate for U.S. addresses. 17% better hit rate than prior for exterior wall finishes |
| **360Value** | Replacement cost estimation using prefilled property data | Industry standard for RCE. Includes slope, site access data |
| **FireLine** | Wildfire risk scoring (0-30 scale) using fuel, slope, road access | Used in 13 western states. Mercury won't insure above score 12 in CA |
| **LOCATION** | Suite of address-level peril data: PPC (fire protection), WaterLine (flood), Crime Service | 1,000+ unique data elements for PPC alone |
| **A-PLUS** | Claims history reports (alternative to CLUE) | Less market share than CLUE but still significant |
| **BuildFax** | Permit history database (acquired by Verisk) | 184M+ permits, 90M+ properties |

- **API access**: Full API, batch, and web portal options
- **Pricing**: Enterprise contracts; not publicly disclosed. Typically priced per-transaction with volume tiers
- **Sources**: [Verisk SmartSource](https://www.verisk.com/blog/reliable-prefill-data-helps-boost-homeowners-underwriting-confidently/), [Verisk 360Value](https://www.verisk.com/products/360value-personal/), [Verisk FireLine](https://www.verisk.com/products/fireline/), [Verisk LOCATION](https://www.verisk.com/products/location-specific-risk-data/)

#### LexisNexis Risk Solutions

| Product | What It Does |
|---|---|
| **Property Data Prefill** | 80+ property elements: year built, roof type, foundation, finish, etc. |
| **CLUE Property** | Up to 7 years of property claims history. 99.6% of auto industry contributes |
| **CLUE Auto** | Up to 7 years of auto claims history (most comprehensive U.S. database) |
| **Rooftop** | Aerial imagery-based roof condition assessment |
| **Verification of Occupancy** | Combines public/proprietary records to verify owner-occupied vs. rental |
| **InstantID for Insurance** | Identity verification against billions of public records |
| **IDVerse for Insurance** | AI-powered document authentication and biometric verification (launched Feb 2026) |
| **Insurance Exchange** | Prior coverage verification |

- **Sources**: [LexisNexis Property Prefill](https://risk.lexisnexis.com/products/property-data-prefill), [CLUE Property](https://risk.lexisnexis.com/products/clue-property), [Verification of Occupancy](https://risk.lexisnexis.com/products/verification-of-occupancy)

#### CoreLogic (Cotality)
- **What it provides**: Property data, risk assessment, hazard analytics, replacement cost via Marshall & Swift. Comprehensive property insurance solutions
- **Insurance use**: Used by EZLynx for home prefill via Marshall & Swift residential lookup
- **Cat modeling**: CoreLogic provides hurricane, flood, and severe weather loss estimation (e.g., estimated Hurricane Milton losses at $17-28B)
- **Sources**: [CoreLogic Insurance](https://www.corelogic.com/insurance/risk-evaluation-solutions/)

#### CAPE Analytics -- Aerial Imagery AI
- **What it provides**: AI-powered property intelligence from aerial imagery
- **Key product -- Roof Condition Rating (RCR)**: 5-point scale with reason codes explaining score. Approved for ratemaking in 39+ U.S. states
- **Roof Age Solution**: Uses ML and change detection on aerial imagery + permits to estimate roof age with high accuracy
- **Data access**: API, batch processing, or web application
- **Market position**: Used by top-20 P&C carriers
- **Sources**: [CAPE Analytics](https://capeanalytics.com/home-insurance-property-intelligence/), [Roof Age](https://capeanalytics.com/roof-age/), [RCR v5](https://capeanalytics.com/resources/roof-condition-rating-version-5/)

#### Betterview (acquired by Nearmap)
- **What it provides**: Property intelligence platform applying AI and computer vision to high-resolution aerial imagery
- **Nearmap coverage**: 100M+ properties nationwide, covering 87% of U.S. population, captured up to 3x per year at leading resolution
- **Key capability**: Roof condition scores, change detection, inspection optimization (route physical inspections only to high-risk properties)
- **Sources**: [Betterview/Nearmap](https://www.nearmap.com/products/betterview)

#### EagleView
- **What it provides**: Precision roof and property measurements from aerial imagery
- **Accuracy**: Roof measurements accurate to 98.77% (within inches)
- **Technology**: Proprietary camera systems with 1-inch pixel resolution, own aircraft fleet
- **Pricing**: Plans starting from $18/report (Silver, Gold, Platinum tiers)
- **API**: Supports integration via APIs and batch processing
- **Sources**: [EagleView Insurance](https://www.eagleview.com/industry/insurance/), [EagleView Pricing](https://www.eagleview.com/pricing/)

#### Other Notable Providers
- **Nearmap**: High-resolution aerial imagery (1-inch GSD), captured 2-3x/year across major metros. Used for insurance analytics
- **ZestyAI**: AI risk platform (detailed in Section 4 below)
- **HazardHub** (Guidewire): Comprehensive natural hazard scoring (detailed in Section 4)
- **Athenium Analytics (IRIS)**: Web-based aerial imagery dashboard using computer vision to detect property features including hot tubs, trampolines
- **Vexcel Data Program**: Aerial imagery platform that can identify taxable features like pools, sport courts, trampolines

### 1.4 State-by-State Data Accessibility (CA, FL, OH, TX)

| Factor | California | Florida | Ohio | Texas |
|---|---|---|---|---|
| **Assessor data online** | Excellent. Most counties fully digitized (LA, Sacramento, etc.) | Excellent. Property appraiser sites well-developed | Good. County auditor sites vary in quality | Good. CAD (Central Appraisal District) sites available but vary |
| **Sales price disclosure** | Yes (public record) | Yes (public record) | Yes (public record) | **No** -- Texas is a non-disclosure state. Sale prices not in public records |
| **Permit data coverage** | Strong in urban areas (LA, SF, San Jose). Spotty rural | Moderate. Wind mitigation inspections well-documented | Moderate. Major metros covered | Moderate. Major metros (Houston, Dallas, Austin) covered |
| **Aerial imagery quality** | Excellent (high population density, frequent flyovers) | Excellent (insurance demand drives coverage) | Good (major metros) | Good (major metros) |
| **Wildfire data** | Critical. FireLine, ZestyAI Z-FIRE, CAL FIRE maps all active | Not primary concern | Not applicable | Moderate wildfire risk in Hill Country |
| **Flood data quality** | Mixed. FEMA maps outdated in many areas | Critical. Extensive FEMA coverage but still gaps | Good. FEMA coverage reasonable | Critical. Coastal and inland flood risk. FEMA maps aging |
| **Hail/wind data** | Not primary concern | Critical for hurricane/wind | Important (tornado alley edge) | Critical (severe hail corridor, hurricane coast) |
| **Key regulatory note** | Prop 103 restrictions on rating factors. No credit scoring for auto | Citizens depopulation driving data demand | Standard regulatory environment | TDI relatively permissive on data use |

---

## 2. Vehicle Data Sources for Auto Quotes

### 2.1 VIN Decoding

#### NHTSA vPIC API (Free)
- **What it provides**: Decodes VIN to extract make, model, year, body type, engine, trim, plant, GVWR, safety equipment
- **Access**: Free, no registration required, available 24/7
- **Endpoint**: `https://vpic.nhtsa.dot.gov/api/`
- **Limitations**: Does not include aftermarket modifications, detailed equipment packages, or insurance-specific data (safety ratings by model year, theft frequency). Batch decoding available
- **Sources**: [NHTSA VIN Decoder](https://vpic.nhtsa.dot.gov/api/), [NHTSA VIN Decoder Web](https://www.nhtsa.gov/vin-decoder)

#### Commercial VIN Decoders
- **Polk/IHS Markit (now S&P Global Mobility)**: Used by EZLynx for vehicle prefill. Includes registration data, detailed trim/equipment
- **DataOne Software**: VIN decoding with insurance-specific data including ISO symbol codes, vehicle classification
- **CARFAX**: VIN-based vehicle history including accident reports, service records, odometer readings
- **Key advantage over NHTSA**: Commercial decoders include ISO symbol/tier codes that directly map to carrier rating tables

### 2.2 Driver History / Motor Vehicle Reports (MVR)

- **What it provides**: Traffic violations, accidents, license suspensions/revocations, DUI/DWI, license class, endorsements, restrictions
- **Source**: State DMV databases. Each state maintains its own system
- **Access for insurers**: Electronic ordering through vendors like LexisNexis, Drivers Alert (Smart MVRS), MVR Online, MVRNOW
- **Cost**: State fee varies ($2-$25+ depending on state) plus vendor processing fee ($6-$11 per report)
- **Turnaround**: Instant to 24 hours depending on state and vendor
- **Key limitation**: MVRs only capture incidents in the state of licensure. Multi-state drivers may have unreported violations
- **Sources**: [MVR Fees by State](https://www.mvronline.com/mvr-fees/), [Drivers Alert Smart MVRS](https://www.driversalert.com/smart-mvrs/)

### 2.3 Claims History

#### LexisNexis CLUE Auto
- **Coverage**: 99.6% of the auto industry contributes claims data
- **What it provides**: Up to 7 years of auto claims history including date of loss, type of loss, amounts paid, policy info, driver license number, VIN
- **Access**: Ordered by insurers during underwriting/quoting
- **Consumer access**: One free report per year; additional reports $19.95 each
- **Sources**: [CLUE Auto](https://risk.lexisnexis.com/products/clue-auto)

#### Verisk A-PLUS
- **What it provides**: Similar claims history data to CLUE but from Verisk's contributing insurer base
- **Market position**: Less commonly used than CLUE but still significant, especially among Verisk-aligned carriers
- **Sources**: [Verisk A-PLUS](https://www.verisk.com/products/a-plus-personal-lines-loss-history-solutions/)

### 2.4 Telematics Data Sources

| Provider/Program | Type | Data Collected | Scale |
|---|---|---|---|
| **Cambridge Mobile Telematics (CMT)** | White-label platform for carriers | Driving behavior (braking, acceleration, speed, phone use, time of day, miles driven), crash detection | World's largest telematics provider. Powers programs for high % of PL insurers |
| **Progressive Snapshot** | Carrier-owned | Driving behavior via mobile app or OBD-II plug-in | 20+ years, 14B+ miles of data. Partnerships with GM and Toyota for new-business quoting |
| **Root Insurance** | Carrier-owned (100% UBI) | Mobile-only driving behavior | Entire pricing model is telematics-based |
| **Arity (Allstate)** | Data marketplace | Driving behavior scores, crash data | Aggregates data from multiple apps/sources |
| **Connected car OEMs** | OEM partnerships | Vehicle telemetry, driving behavior, crash detection | GM OnStar, Toyota, Ford, Hyundai increasingly sharing data with insurers |

- **Key trend**: Shift from OBD-II dongles to mobile apps to OEM-embedded telematics. OEM partnerships (Progressive + GM/Toyota) enable pre-quote scoring without requiring a monitoring period
- **Sources**: [Progressive Snapshot](https://www.progressive.com/answers/telematics-devices-car-insurance/), [CMT](https://www.cmtelematics.com/)

### 2.5 Vehicle Valuation

| Provider | Primary Use | Notes |
|---|---|---|
| **CCC Intelligent Solutions** | Total loss valuation (dominant) | Compares to local market sales within 30-mile radius. Used by most major carriers. Analyzes millions of vehicle sales |
| **Mitchell (Enlyte)** | Total loss valuation, appraisal | One of the "Big 3" alongside CCC and Audatex |
| **Audatex (Solera)** | Total loss valuation | Third major platform |
| **NADA** | Dealer retail value, lending | Factors condition, mileage, location, historical data. Favored for commercial vehicles |
| **Kelley Blue Book** | Consumer-facing valuation | Insurers do NOT directly use KBB despite popular belief. KBB values serve as consumer reference points |
| **Black Book** | Wholesale/auction values | Used more in dealer/lending than insurance |

- **How insurers actually value vehicles**: They use CCC, Mitchell, or Audatex -- not KBB or NADA directly. These platforms analyze recent local comparable sales, adjusted for condition, mileage, and equipment
- **Sources**: [CCC Valuations](https://www.cccis.com/insurance-carriers/claims-solutions/apd/total-loss-management/valuations)

---

## 3. Person / Risk Data Sources Used in Quoting

### 3.1 Credit-Based Insurance Scores

- **Providers**: LexisNexis, TransUnion, Equifax, Fair Isaac (FICO)
- **What it provides**: A numeric score predicting likelihood of filing a claim, derived from credit history but NOT the same as a credit score
- **Regulatory landscape**:

| State | Auto | Homeowners | Notes |
|---|---|---|---|
| **California** | **BANNED** (Prop 103, 1988) | **BANNED** | Most restrictive state. Cannot use credit for rating |
| **Hawaii** | **BANNED** | Allowed with restrictions | Auto ban only |
| **Massachusetts** | **BANNED** | **BANNED** | Comprehensive ban |
| **Michigan** | **BANNED** (2020 reform) | Allowed with restrictions | Recent change |
| **Maryland** | Restricted | Restricted | Partial controls |
| **Oregon** | Restricted | Restricted | Partial controls |
| **Florida** | Allowed | Allowed | Standard use |
| **Ohio** | Allowed | Allowed | Standard use |
| **Texas** | Allowed | Allowed | Standard use |

- **FCRA requirements**: Adverse Action Notification required if credit-based score results in higher premium or denial. Consumers must be informed they can request a free copy
- **Sources**: [NAIC Credit-Based Insurance Scores](https://content.naic.org/insurance-topics/credit-based-insurance-scores), [Experian State Restrictions](https://www.experian.com/blogs/ask-experian/which-states-prohibit-or-restrict-the-use-of-credit-based-insurance-scores/)

### 3.2 Prior Insurance Verification

- **LexisNexis Insurance Exchange**: Verifies prior coverage dates, carrier, limits, and lapse history
- **Canopy Connect**: Consumer-permissioned data intake from 300+ carriers. Imports dec pages and structures policy data using DecSight OCR technology. Integrates with comparative raters and AMS platforms
- **Why it matters**: Prior coverage gaps result in significant surcharges. Accurate verification prevents both overcharging loyal customers and missing gaps on risky applicants
- **Sources**: [Canopy Connect](https://www.usecanopy.com/insurance-data-intake)

### 3.3 Claims History

- **CLUE (LexisNexis)**: 7 years property + 7 years auto. Most comprehensive. 99.6% auto industry participation
- **A-PLUS (Verisk)**: Alternative claims database. Less market share but still widely used
- **Both are ordered during underwriting**, not typically at initial quote. Some carriers order at quote for real-time pricing
- **Sources**: [Privacy Rights CLUE/A-PLUS](https://privacyrights.org/resources-tools/articles/loss-history-clue-and-plus-reports)

### 3.4 Identity Verification

- **LexisNexis InstantID for Insurance**: Searches billions of public records to verify identity, flag potential fraud, identify discrepancies, and surface alternative addresses/phone numbers
- **LexisNexis IDVerse for Insurance** (launched Feb 2026): AI-powered document authentication with biometric verification. Uses deep neural networks to authenticate ID documents within seconds. Defends against AI-generated deepfakes
- **Use cases**: Fraud prevention at quote/bind, claims identity verification, high-risk transaction authentication
- **Sources**: [LexisNexis InstantID](https://risk.lexisnexis.com/products/lexisnexis-instantid-for-insurance)

### 3.5 Occupancy / Residency Verification

- **LexisNexis Verification of Occupancy**: Combines public and proprietary records with linking analytics. Determines owner-occupied vs. rental, occupancy changes over time
- **Why it matters**: Owner-occupied homes have 40-60% lower claim frequency than tenant-occupied. Misrepresentation of occupancy is a major rating factor
- **Sources**: [LexisNexis Verification of Occupancy](https://risk.lexisnexis.com/products/verification-of-occupancy)

---

## 4. Geospatial / Catastrophe Data

### 4.1 Wildfire Risk (Critical for CA)

| Provider | Product | Method | Key Stats |
|---|---|---|---|
| **Verisk** | FireLine | Fuel, slope, road access analysis via remote sensing | Scores 0-30 across 13 western states. Accounts for 30-50% of CA underwriting decisions |
| **ZestyAI** | Z-FIRE | ML trained on 1,500+ historical wildfires + aerial imagery + topography + property characteristics | Outperforms traditional models by 44x. Trusted by 40% of CA homeowners market including FAIR Plan. Filing-ready in CA (approved 2024) |
| **IBHS** | Research/standards | Wildfire research, building code recommendations, Fortified Home standards | Provides mitigation guidelines, not direct scoring |
| **CAL FIRE** | Fire Hazard Severity Zones | State-designated zone mapping (Very High, High, Moderate) | Regulatory tool. Free. Used for disclosure requirements |
| **CAPE Analytics** | Property-level assessment | AI on aerial imagery to assess defensible space, roof condition, vegetation proximity | Integrates with carrier workflows via API |

- **Key insight**: California CDI has approved ZestyAI's Z-FIRE for rate filings, signaling regulatory acceptance of AI-driven risk models over traditional zone-based approaches
- **Sources**: [ZestyAI Z-FIRE](https://zesty.ai/products/wildfire), [Verisk FireLine](https://www.verisk.com/products/fireline/)

### 4.2 Hurricane / Wind Risk (Critical for FL, TX)

| Provider | Product | Method |
|---|---|---|
| **Moody's RMS** | North Atlantic Hurricane Models (v25) | Advanced wind/water simulation. Certified by Florida Commission on Hurricane Loss Projection Methodology |
| **Moody's RMS** | Severe Convective Storm HD Models | 100,000 simulation years covering hail, tornado, downburst wind. Calibrated on $55B+ in claims data |
| **Verisk AIR** | Hurricane/wind models | Integrated into Verisk's LOCATION suite |
| **CoreLogic** | Hazard risk solutions | Hurricane loss estimation, wind damage modeling |

- **Scale**: U.S. insured losses from severe convective storms have exceeded $50B annually in each of the last 3 years -- surpassing hurricanes
- **Sources**: [Moody's RMS SCS](https://www.rms.com/models/severe-convective-storm), [Moody's RMS Hurricane](https://www.moodys.com/web/en/us/capabilities/catastrophe-modeling/cyclone-hurricane-typhoon.html)

### 4.3 Flood Zone Data

#### Public (Free)
- **FEMA NFIP Maps (NFHL)**: Free GIS data. Zone designations (A, V, X, etc.). Base flood elevations
- **FEMA National Risk Index**: 18 natural hazards scored at community level. Updated Dec 2025 (v1.20)
- **Limitation**: Many FEMA maps are decades old. Do not capture pluvial flooding. Poor granularity

#### Private Flood Models
| Provider | Key Differentiator |
|---|---|
| **Neptune Flood** | AI-driven pricing. 77% of at-risk homes outside FEMA zones have no flood coverage. Up to $4M building / $500K contents |
| **Palomar** | Excess flood over NFIP. Up to $5M building / $1M contents |
| **Wright Flood** | Among cheapest rates. Operates in 40 states |
| **Beyond Floods** | Up to $750K contents (3x NFIP) |
| **Fathom Global** | Probabilistic flood modeling beyond FEMA |

- **Key trend**: Private flood insurers use modern catastrophe modeling and data science that significantly outperforms FEMA's outdated maps
- **Sources**: [Neptune Flood](https://neptuneflood.com/blog/private-flood-insurance-vs-fema/), [FEMA NFHL](https://www.fema.gov/flood-maps/national-flood-hazard-layer)

### 4.4 Hail / Tornado Risk (TX, OH)

- **Moody's RMS SCS HD Models**: The most advanced. 100K simulation years, sub-perils for hail, tornado, and downburst wind. Calibrated on $55B+ in location-level claims data
- **Verisk**: Hail and severe weather models integrated into LOCATION suite
- **CoreLogic**: Severe weather analytics
- **HazardHub (Guidewire)**: Historical hail data, proximity-based damage modeling, tornado path history with impact radius and damage levels
- **Sources**: [HazardHub](https://www.guidewire.com/products/analytics/hazardhub-risk-data)

### 4.5 Crime Data

- **FBI UCR / NIBRS**: Uniform Crime Reporting captures data from 18,000+ agencies. Part I offenses include burglary, larceny-theft, motor vehicle theft, arson. Free Crime Data Explorer at cde.ucr.cjis.gov
- **Verisk Crime Service**: Address-level current and projected crime risk scores broken down by crime type. Part of the LOCATION suite
- **HazardHub**: Includes crime scoring in its multi-peril risk assessment
- **Third-party crime score vendors**: Provide numerical ratings at address level using law enforcement data
- **Caution**: Using strict crime score thresholds can create bias against properties near high-risk zones. Fair lending/underwriting concerns apply
- **Sources**: [FBI Crime Data Explorer](https://cde.ucr.cjis.gov/), [Federato on Crime Scores](https://www.federato.ai/library/post/beyond-location-factors-strategic-integration-of-crime-scores-into-underwriting)

---

## 5. Pre-fill and Enrichment in Practice

### 5.1 How Comparative Raters Use Pre-fill Today

#### EZLynx (Applied Systems)
- **Auto prefill**: VIN/vehicle data via Polk (S&P Global Mobility). Driver prefill via LexisNexis and Fenris integrations
- **Home prefill**: Property data via CoreLogic Marshall & Swift residential lookup
- **Additional sources**: LexisNexis, Fenris, MSB, Google Maps
- **Agent experience**: Agent enters name + address (or name + DOB for auto). Prefill populates known fields. Agent reviews, corrects, and fills gaps. Then rates across carriers
- **Sources**: [EZLynx Rating Engine](https://www.ezlynx.com/products/rating-engine/), [EZLynx Prefill Partners](https://www.ezlynx.com/partners/rating-pre-fill/)

#### Vertafore PL Rating (FSC Rater)
- **Capabilities**: Home, driver, and vehicle data auto-fill. Prefilled, verified third-party data
- **Integrations**: AMS360, Sagitta, QQCatalyst, Applied TAM, Applied Epic
- **Sources**: [Vertafore PL Rating](https://www.vertafore.com/products/insurance-comparative-rater/pl-rating)

### 5.2 What Gets Auto-Populated vs. Manual Entry

| Data Category | Typically Auto-Populated | Typically Manual Entry |
|---|---|---|
| **Property basics** | Year built, sq ft, stories, construction type | Roof age (often wrong), updates/renovations, interior finishes, alarm systems |
| **Property perils** | Flood zone, fire protection class, distance to coast | Brush clearance, mitigation measures, trampoline/pool fencing |
| **Vehicle** | Year, make, model, VIN decode, body style | Annual mileage, garaging address (if different), usage (commute vs. pleasure), aftermarket mods |
| **Driver** | Name, DOB, license number, address | Occupation, education level, marital status changes, good student status |
| **Coverage** | Prior carrier, prior limits (via exchange) | Desired limits, deductible preferences, endorsement selections |
| **Claims/violations** | CLUE claims, MVR violations | Explanation of losses, mitigating circumstances |

### 5.3 Key Pre-fill Vendors

#### Fenris Digital
- **Data scope**: 255M+ adults, 130M+ households, 30M+ small businesses, complete U.S. property coverage
- **Products**: Auto prefill (VIN, driver data, DL lookup), property prefill, life prefill, small commercial prefill
- **Integrations**: EZLynx, Quotamation, various carrier and rater platforms
- **Pricing**: Per-request billing (monthly invoice). No per-data-element charge. Specific pricing not publicly disclosed
- **Differentiator**: Fast API delivery in seconds. SOC2 compliant. Positioned for independent agent channel
- **Sources**: [Fenris Digital](https://fenrisd.com/), [Fenris Property](https://fenrisd.com/property-insurance/), [Fenris FAQ](https://fenrisd.com/frequently-asked-questions/)

#### Verisk SmartSource
- **Data scope**: 124M+ U.S. residential properties. 100% address hit rate. Up to 68 property characteristics with confidence scores
- **Method**: Multi-source (assessor records, aerial imagery, ML models) choosing the most reliable source per characteristic
- **Key improvements**: 17% better hit rate for exterior wall finishes. 3-5% improvements for sq ft, year built, stories, foundation, garages, fireplaces
- **Integration**: Via 360Value and direct API
- **Sources**: [Verisk SmartSource](https://www.verisk.com/company/newsroom/verisk-launches-smartsource-prefill-to-streamline-property-insurance-quoting/)

#### Planck (Commercial Lines Focus)
- **Data scope**: Mines thousands of open web sources including business websites, social media, reviews, public records, government databases, images, videos
- **Method**: Proprietary AI (computer vision, NLP, unstructured data analysis) to generate risk insights from a business name + address
- **Key clients**: Berkshire Hathaway GUARD and other commercial carriers
- **Limitation**: Primarily commercial lines. Not a direct personal lines play, but their approach (web mining + AI) is instructive for the personal lines opportunity
- **Sources**: [Planck](https://www.planckdata.com/), [Planck Technology](https://www.planckdata.com/technology)

#### Canopy Connect
- **Data scope**: Consumer-permissioned data from 300+ insurance carriers
- **Method**: Consumers authorize access to their existing policies. DecSight OCR extracts structured data from declaration pages
- **Use case**: Re-shopping / account rounding. Agent gets full current policy details without manual entry
- **Integration**: Comparative raters, AMS platforms, CRMs
- **Sources**: [Canopy Connect](https://www.usecanopy.com/insurance-data-intake)

#### SortSpoke
- **Focus**: Automated data enrichment and pre-fill for insurance submissions (commercial focus)
- **Method**: AI-powered extraction from documents + enrichment from external sources
- **Sources**: [SortSpoke](https://sortspoke.com/platform/data-enrichment-pre-fill/)

### 5.4 Pre-fill Accuracy and Breakdown Points

**Overall**: Pre-fill systems can eliminate ~90% of manual data entry errors (per SortSpoke). Verisk SmartSource achieves 100% address hit rate.

**Where pre-fill is MOST accurate**:
- Year built (well-documented in assessor records)
- Square footage (assessor records, generally reliable)
- Number of stories (assessor + aerial imagery)
- Basic construction type (assessor records)
- Flood zone (FEMA data, though may be outdated)
- Fire protection class (Verisk PPC well-maintained)

**Where pre-fill BREAKS DOWN**:

| Data Element | Why It's Inaccurate | Impact |
|---|---|---|
| **Roof age** | Assessor records only capture original roof year. No systematic tracking of replacements. Permits are filed inconsistently. Aerial imagery can detect NEW roofs but not age precisely | Massive. Roof age drives 15-25% of homeowners premium in many states |
| **Roof material/type** | Assessor data often says "composition" generically. Aerial imagery improving but still struggles with some materials | Significant for hail-prone areas |
| **Renovations/updates** | Electrical, plumbing, heating updates are self-reported. Permits filed inconsistently. BuildFax helps but coverage is uneven | Can swing premium 10-20% |
| **Swimming pools** | Tax assessors inconsistently record pools. Aerial imagery detection improving (CAPE, Vexcel, Nearmap can detect) but fenced vs. unfenced is hard | Liability and premium impact |
| **Interior finishes** | No external data source can see inside a home. Granite counters, hardwood floors, etc. always self-reported | Affects replacement cost significantly |
| **Detached structures** | Assessor data inconsistent. Aerial imagery can detect but may not distinguish shed from guest house | Affects Coverage B |
| **Occupancy type** | LexisNexis Verification of Occupancy helps, but rental units sometimes appear owner-occupied | Major rating factor |
| **Annual mileage (auto)** | Always self-reported. Telematics can validate but only after policy inception | Affects auto premium significantly |

---

## 6. Opportunities and Gaps

### 6.1 Publicly Available but Underutilized Data

1. **Building permit records**: BuildFax aggregates them, but many agencies and small carriers don't use permit data despite it being the best source for roof age and renovation history. Local building departments publish permits that could be systematically mined
2. **FEMA National Risk Index**: Free, comprehensive, recently updated (Dec 2025), covers 18 hazards at community level. Underused by independent agents who rely on carrier-provided risk data
3. **FBI UCR / NIBRS crime data**: Free API available. Most carriers use Verisk Crime Service instead, but smaller players could leverage free data
4. **CAL FIRE Hazard Severity Zone maps**: Free, regulatory-grade wildfire data for California. Could be integrated into quoting workflows
5. **County GIS data**: Many counties publish parcel data, zoning, and environmental layers via open GIS portals. Rarely integrated into insurance workflows
6. **USPS address data**: Change of address data could flag occupancy changes. Available through USPS NCOA
7. **Census / ACS data**: Demographic and housing characteristics at block-group level. Free. Could supplement property-level data

### 6.2 Expensive Private Data Sources Ripe for Disruption

1. **Verisk's near-monopoly on property data**: SmartSource, 360Value, LOCATION, FireLine -- carriers pay millions annually. An aggregator combining free public sources (assessor, permits, FEMA) with affordable aerial imagery could undercut significantly
2. **LexisNexis claims data (CLUE)**: Near-monopoly with 99.6% auto participation. Barriers to entry are network effects (you need data to sell data). Could potentially be disrupted by blockchain-based claims registries or carrier consortiums
3. **MVR reports**: State DMV fees ($2-25) plus vendor markup. Telematics data from OEM partnerships could eventually replace MVR for risk assessment
4. **Replacement cost estimation**: Verisk 360Value is the standard. Open-source construction cost data + AI could potentially compete
5. **Aerial imagery / roof analysis**: EagleView and Nearmap charge per-report. Satellite imagery (Planet, Maxar) is becoming cheaper and more frequent. Google Earth imagery, while lower resolution, is free

### 6.3 Where AI/ML Can Improve Data Enrichment

1. **Satellite/aerial imagery for roof condition**: Already happening (CAPE, Betterview, ZestyAI). Opportunity to use cheaper satellite imagery (Planet Labs) combined with ML to approximate what premium aerial providers deliver
2. **NLP for permit records**: Many building departments publish permits as PDFs or unstructured web pages. NLP could extract structured data (roof replacement date, scope of electrical work, etc.) systematically
3. **Computer vision for property features**: Pool detection, trampoline detection, solar panel identification, tree proximity to structures, defensible space measurement -- all from imagery
4. **Change detection over time**: Comparing imagery across years to flag new construction, tree growth, roof deterioration, removed structures
5. **Predictive roof age models**: Combining permit history + aerial imagery + assessor data + local weather patterns (hail frequency) to predict roof remaining useful life
6. **NLP for real estate listings**: MLS descriptions contain valuable interior details (renovated kitchen, new HVAC, updated electrical) that could be extracted and matched to properties
7. **Telematics-based underwriting without monitoring period**: OEM data partnerships (Progressive + GM/Toyota model) enable pre-quote risk scoring. Opportunity to aggregate OEM data across carriers

### 6.4 State-Specific Data Access Summary

| Dimension | California | Florida | Ohio | Texas |
|---|---|---|---|---|
| **Greatest data need** | Wildfire risk at property level | Hurricane wind + flood risk | Severe weather (hail/tornado) | Hail + hurricane coast + flood |
| **Best public data** | CAL FIRE zones, strong assessor data, Prop 103 transparency requirements | Property appraiser data, wind mitigation forms, sinkhole maps | County auditor data | CAD data (but non-disclosure on sales) |
| **Biggest data gap** | Interior defensible space compliance | Roof condition (aging housing stock) | Roof condition (hail damage) | Flood risk beyond FEMA zones, rural property data |
| **Credit scoring** | Banned for auto + home | Allowed | Allowed | Allowed |
| **Regulatory climate for data** | Most restrictive. CCPA/CPRA applies. Prop 103 limits rating factors | Moderate. OIR active but generally pro-data | Standard | TDI generally permissive |
| **AI model acceptance** | CDI has approved ZestyAI for rate filings | Florida Commission certifies cat models | Standard actuarial review | Standard actuarial review |

### 6.5 Regulatory Constraints on Data Use

#### Federal
- **FCRA (Fair Credit Reporting Act)**: Governs use of consumer reports (CLUE, credit scores, MVR). Requires permissible purpose, adverse action notices, consumer dispute rights. Applies to all states
- **Gramm-Leach-Bliley Act (GLBA)**: Requires privacy notices for financial information. Insurance is explicitly covered. Provides partial CCPA exemption for covered data

#### State-Level
- **California CCPA/CPRA**: Broadest state privacy law. Insurance companies get partial exemption for GLBA-covered data, but CCPA applies to personal data NOT governed by California Insurance Code. The California Privacy Protection Agency (CPPA) voted in Nov 2024 to clarify CCPA application to insurers. Key takeaway: insurers in CA face dual regulation (Insurance Code + CCPA)
- **California Prop 103**: Restricts rating factors. Bans credit scoring. Requires rate approval. Limits use of territorial rating. Most restrictive insurance regulatory environment in the U.S.
- **California Insurance Information and Privacy Protection Act (IIPPA)**: Insurance Code 791-791.27 governs PII handling by agents, brokers, and carriers
- **Other states**: Most follow NAIC model laws. Maryland, Massachusetts, Hawaii have additional credit-scoring restrictions. Trend toward more state privacy laws (Virginia CDPA, Colorado CPA, Connecticut, etc.)

#### Emerging Concerns
- **AI/ML model transparency**: Regulators increasingly asking for explainability of AI-driven pricing models. ZestyAI's California approval sets precedent but also establishes that AI models will face scrutiny
- **Proxy discrimination**: Using data that correlates with protected classes (race, income) even if not directly using those factors. Crime scores, credit scores, and ZIP-code-based data all face scrutiny
- **Aerial imagery privacy**: Photographing properties raises privacy questions, though courts have generally upheld aerial observation as not constituting a search

---

## 7. Summary: Highest-Value Enrichment Opportunities

### For Agents (Time Savings)

1. **Full auto prefill from name + DOB**: Driver info, vehicle info, prior coverage, violations -- reduces a 15-minute auto application to 3 minutes
2. **Property prefill from address**: Year built, sq ft, construction, roof type, flood zone, fire class -- reduces home application by 60-70%
3. **Dec page import** (Canopy Connect model): Consumer-permissioned pull of current policy details from 300+ carriers eliminates re-keying
4. **VIN-based vehicle lookup**: Instant trim, equipment, and rating symbol from VIN eliminates manual vehicle selection

### For Carriers (Better Risk Selection)

1. **Roof condition from aerial imagery** (CAPE, Betterview): The single highest-impact data enrichment. Roof claims are #1 homeowners loss cause
2. **Property-level catastrophe scoring** (ZestyAI, HazardHub): Granular risk differentiation within territories
3. **Telematics-based driver scoring**: Real driving behavior vs. proxy variables
4. **Permit-based renovation verification**: Confirms (or contradicts) self-reported updates
5. **Occupancy verification** (LexisNexis): Catches owner-occupied misrepresentation

### The Big Opportunity

**The gap between what data EXISTS and what independent agents can ACCESS in their quoting workflow is enormous.** Carriers have invested heavily in data enrichment for their own underwriting, but the independent agent channel still relies on:
- Manual data entry for 30-40% of quote fields
- Comparative raters with basic prefill (address lookup, VIN decode)
- Self-reported data for critical fields (roof age, renovations, mileage)

A platform that aggregates public data (assessor, permits, FEMA, crime) with affordable private sources (aerial imagery AI, telematics) and delivers it through the agent's existing rater workflow could dramatically improve quote accuracy, speed, and conversion -- while giving carriers better risk data at the point of sale.

---

*Research compiled 2026-02-10. Sources include direct vendor documentation, industry publications, regulatory filings, and public data portals.*
