# Insurance Quote Sheet Field Analysis

> **Documents Analyzed:**
> 
> 1. **Doc A** — `dw_auto_quote.docx` (Simple auto-only, 2 drivers/vehicles)
> 2. **Doc B** — `texas_quote_sheet.docx` (Combined home + auto, Texas-style)
> 3. **Doc C** — Auto Quote Info Sheet PDF (Detailed auto, up to 4 cars + Section 2 questions)
> 4. **Doc D** — CoverLink Insurance PDF (Full personal lines: sales, home, auto — 6 pages)

---

## PART 1: Human-Readable Summary

### Universal Fields (Present in All or Nearly All Documents)

These are the non-negotiable core fields every agency needs for an auto quote:

|Field|A|B|C|D|Importance|
|---|---|---|---|---|---|
|**Named Insured / Name**|✅|✅|✅|✅|🔴 Critical|
|**Date of Birth**|✅|✅|✅|✅|🔴 Critical|
|**Driver's License #**|✅|✅|✅|✅|🔴 Critical|
|**Address**|✅|implied|✅|✅|🔴 Critical|
|**Phone**|✅|✅|✅|✅|🔴 Critical|
|**Email**|✅|✅|✅|✅|🔴 Critical|
|**Vehicle Year**|✅|✅|✅|✅|🔴 Critical|
|**Vehicle Make**|✅|✅|✅|✅|🔴 Critical|
|**Vehicle Model**|✅|✅|✅|✅|🔴 Critical|
|**VIN**|✅|✅|✅|✅|🔴 Critical|

### High-Frequency Fields (3 of 4 Documents)

|Field|A|B|C|D|Importance|
|---|---|---|---|---|---|
|**SSN**|✅|—|✅|✅|🟡 High (rating)|
|**Current Insurance Carrier**|—|✅|✅|✅|🟡 High|
|**Current Premium**|—|✅|✅|✅|🟡 High|
|**Marital Status**|—|—|✅|✅|🟡 High (rating factor)|
|**Occupation**|—|—|✅|✅|🟡 High (discount eligibility)|
|**Claims History (last 5 yrs)**|—|✅|✅|✅|🟡 High|
|**Liability Limits**|—|✅|✅|✅|🟡 High|
|**Comp / Collision Deductibles**|—|✅|✅|✅|🟡 High|
|**Spouse/Partner Info**|—|—|✅|✅|🟡 High|

### Moderate-Frequency Fields (2 of 4 Documents)

|Field|Docs|Importance|
|---|---|---|
|Rental Coverage|B, C|🟢 Medium|
|Roadside/Towing|B, C|🟢 Medium|
|PIP / Medpay|B, D|🟢 Medium|
|UM/UIM Limits|B, C|🟢 Medium|
|Ticket/Violation History|C, D|🟢 Medium|
|Loan/Lease GAP Coverage|C only (detailed)|🟢 Medium|
|Expiration / Renewal Date|B, C, D|🟡 High|

### Key Differences Between Documents

|Dimension|Observation|
|---|---|
|**Scope**|Doc A is auto-only minimal. Doc B bundles home+auto. Doc C is auto-focused with depth. Doc D is full personal lines with a sales process wrapper.|
|**Sales Process**|Only Doc D includes discovery/sales questions (why shopping, referral source, budget, decision timeline). Doc C has a lead-source checkbox at the top.|
|**Home Cross-Sell**|Docs B, C, and D all include homeownership questions. Doc C asks "own or rent?" Doc B has a full home section. Doc D has the most detailed home section (4 pages).|
|**Vehicle Detail Depth**|Doc C is the deepest — per-vehicle fields for rideshare, titled owner, GAP, how long owned. Doc A is the shallowest.|
|**Multi-Driver Support**|Doc A: 2 drivers. Doc B: 4 drivers. Doc C: 4 drivers. Doc D: table-based (unlimited).|
|**Multi-Vehicle Support**|Doc A: 2 vehicles (paired with drivers). Doc B: 4 vehicles. Doc C: 4 vehicles. Doc D: table-based.|
|**SR-22 / Special Filings**|Only Doc C asks about SR-22 needs.|
|**Student Discount**|Only Doc C asks about student w/ 3.0 GPA.|
|**Rideshare Usage**|Only Doc C captures this per vehicle.|
|**Umbrella Policy**|Docs B (implicitly), C, and D reference umbrella coverage.|
|**Budget Question**|Only Doc C directly asks for the customer's insurance budget.|

### Inferred Field Importance Tiers

**Tier 1 — Required for any quote (rating engine input):** Name, DOB, DL#, Address, Vehicle Y/M/M, VIN

**Tier 2 — Required for accurate quote (underwriting/pricing):** SSN, Marital Status, Current Carrier + Premium, Claims History, Violation History, Coverage Selections (liability, comp, collision, deductibles)

**Tier 3 — Value-add / Cross-sell / Sales Process:** Occupation, Education, Homeownership, Referral Source, Budget, Renewal/Expiration Date, Spouse Info, Rideshare, SR-22, Student Discount

---

## PART 2: LLM-Optimized Detailed Analysis

### Document Inventory

#### Document A: `dw_auto_quote.docx`

- **Type:** Auto-only quote intake
- **Structure:** Two identical driver/vehicle blocks
- **Max Drivers:** 2
- **Max Vehicles:** 2 (1:1 paired with drivers)
- **Fields per driver block:**
    - Name
    - Address
    - City, State, Zip
    - Phone
    - Email
    - Date of Birth
    - Social Security Number
    - License (Driver's License #)
    - Year, Make, Model (single combined field)
    - VIN
- **Notable characteristics:**
    - No coverage selection fields
    - No current insurance information
    - No claims or violation history
    - No sales/discovery questions
    - No home/cross-sell questions
    - Minimal — essentially a data collection sheet for submitting to a rater
    - SSN is included, suggesting this is used post-permission for hard rating
    - The 1:1 driver-to-vehicle pairing is unusual; most forms separate drivers and vehicles

#### Document B: `texas_quote_sheet.docx`

- **Type:** Combined Home + Auto quote intake
- **Structure:** Two major sections (HOME, AUTO) preceded by contact info and driver list
- **Max Drivers:** 4 (Name/DOB/DL# on single line each)
- **Max Vehicles:** 4 (Year/Make/Model/VIN# on single line each)
- **Contact/Driver Fields:**
    - Email
    - Phone Number
    - Up to 4 driver entries, each capturing: Name, DOB, DL# (combined line format)
- **Home Section Fields:**
    - Property Address
    - Year Built
    - Square Footage
    - Stories
    - Single Family (Y/N)
    - Age of Roof
    - Bathrooms
    - Renovations
    - Pool
    - Other Detached Structures
    - Current Company
    - Current Premium
    - Renewal Date
    - Deed Date
    - Dwelling coverage amount
    - Other Structures coverage
    - Personal Property coverage
    - Liability coverage
    - Loss of Use (LoU)
    - Deductibles
    - Mortgage/Escrow
    - Property Claims history
- **Auto Section Fields:**
    - Up to 4 vehicles: Year/Make/Model/VIN#
    - Current Company
    - Current Premium
    - Liability Limits
    - UM/UIM Limits
    - Autos with Full Coverage designation
    - Collision deductible
    - Comp deductible
    - Rental coverage
    - Roadside coverage
    - PIP/Medpay
    - Auto Claims history
- **Notable characteristics:**
    - Combined format suggests agency quotes home+auto bundles by default
    - No SSN field — may be collected separately or not needed for initial quoting
    - No marital status or occupation
    - No lead source tracking
    - Driver info is compressed onto single lines — efficient but less structured
    - Texas-specific (PIP/Medpay fields align with Texas regulatory requirements)
    - No per-vehicle coverage breakdown — coverage fields are global

#### Document C: Auto Quote Info Sheet (PDF, pages 1-4)

- **Type:** Detailed Auto + Home quote intake
- **Structure:** Page 1 = Auto (drivers, vehicles, current insurance). Page 2 = Section 2 (additional questions). Pages 3-4 = Home Quote Info Sheet.
- **Auto Section — General/Contact:**
    - Lead source checkboxes: Phone Book/Yellow Pages, Direct Mail, Newspaper, Outside Sign, Radio, Event, Referral (who?), Previous Client, Current Customer/Cross Sell, Other
    - Date Called
    - Date Promised By
    - Staff Member
    - Name
    - Spouse/Partner (if applicable)
    - Address
    - County
    - Phone (two fields — home and cell implied)
    - Email
    - Marital Status
- **Auto Section — Drivers (up to 4):**
    - Driver Name
    - Drivers License #
    - Occupation
    - SSN (SS#)
    - State (of license)
    - Where? (where licensed)
    - DOB
    - SR22 Needed (Y/N)
    - Student w/ 3.0 GPA (Y/N)
- **Auto Section — Current Insurance:**
    - Current Insurance (Y/N)
    - What Company?
    - How long with current company?
    - Current Premium
    - Expiration Date
    - Current Limits of Insurance
- **Auto Section — Vehicles (up to 4, each with):**
    - Year
    - Make
    - Model
    - VIN#
    - Comp deductible
    - Collision deductible
    - Title status
    - Loan/Lease GAP Coverage Needed (Y/N)
    - Rental Coverage (Y/N)
    - Roadside Assistance (Y/N)
    - Vehicle Garaged at mailing address (Y/N)
    - Rideshare (Y/N)
    - Who drives this vehicle (Driver #)
    - Titled Owner
    - How Long Owned
- **Section 2 (Page 2):**
    - Own/Rent/Other
    - Ticket history in household (past 5 years) — Who? When?
    - Claims history (past 5 years)
    - Anyone else living in home not listed?
    - Vehicle access to non-household members?
    - Insurance budget question
- **Home Quote Info Sheet (Pages 3-4):**
    - Same lead source checkboxes as auto
    - Name, Spouse/Partner, Address, County, Home Phone, Cell Phone, Email
    - Marital Status (Single, Married, Divorced, Widowed, Partnered)
    - Named Insured Info: DOB, SS#, Occupation
    - Spouse/Partner Info: DOB, SS#, Occupation
    - New Purchase (Y/N), current mailing address, new home address, purchase price, closing date, mortgage company
    - Current Home Insurance Company, Current Annual Premium, Renewal Date
    - Property details: Year Built, Frame/Brick/Masonry, Years Lived There, Inside City Y/N, Township, Fire Hydrant Distance, Woodstove Y/N, Installed/Freestanding, Renters/Condos units count
    - Safety: Smoke Detectors Y/N, Fire Extinguishers Y/N, Dead Bolt Locks Y/N, Alarm System Y/N (who?)
    - Animals
    - Acres
    - Trampoline Y/N
    - Pool Y/N, Above/Below Ground, Fenced Y/N, Locked Gate Y/N
    - Update Year: Roof, Plumbing, Heating, Wiring
    - Home Based Business Y/N
    - Current Home Coverage: Dwelling, Other Structures, Personal Property, Loss of Use
    - Liability options: 100k, 200k, 300k, 400k, 500k
    - Medical: 1k, 2k, 2.5k, 3k, 4k, 5k, 10k, 15k, 20k
    - Deductible options: 250, 500, 750, 1000, 1500, 2000, 2500, 5000
    - Water Backup: 5k, 10k, 15k, 20k, 25k, 50k
    - Earthquake Y/N (Quote)
    - Scheduled items: Jewelry, Fine Arts, Other, Stamps/Coins, Guns, Collections
    - Replacement Cost Info: Total Sq Ft, # Stories, # Bathrooms, Porches sq ft, Decks Y/N sq ft, Basement Y/N, Finished %, Air Conditioning, Fireplace Y/N, Garage Attached Y/N, # of Cars
    - Umbrella: Y/N, Liability Limit ($1M/$2M), Uninsured Motorist (None/$1M/$2M)
    - Claims: Y/N in last 5 years, describe with dates and amounts
- **Notable characteristics:**
    - Most comprehensive auto-specific document
    - Only document capturing SR-22, student discount, rideshare, GAP per vehicle
    - Per-vehicle coverage detail (comp, collision, rental, roadside per car)
    - Driver-to-vehicle assignment
    - Budget question is unique and sales-oriented
    - Lead source tracking with operational fields (date called, promised by, staff)
    - Home section is extensive with granular property details

#### Document D: CoverLink Insurance PDF (6 pages)

- **Type:** Full personal lines intake with integrated sales process
- **Structure:** Page 1 = Sales discovery. Pages 2-4 = Home quote. Pages 5-6 = Auto quote.
- **Sales/Discovery (Page 1):**
    - Agent Name
    - Date
    - How did you hear about us?
    - If Referral — Who Referred / If Other
    - Why are you shopping today? (Price / Service / Life Change / Other)
    - If price — what else is important in selecting an agent?
    - Checkboxes: Introduced yourself / Explained independent agency
    - Policies looking for: Home, Auto, Renters, Condo, Toys, Umbrella, Life, Rental Home/2nd Home, Wind, Earthquake, Inland Marine
    - Other policies with other agencies? (Y/N, What?)
    - Discount interest? (Y/N, if no why?)
    - When/how finalizing insurance decision?
    - Current premium
    - Renewal premium
    - Sales tips checkboxes: Used Client Name, Worked to quote 3+ lines, Quoted Over Phone, Discussed other decision makers, Quoted 2-3 options, Set Time to Deliver Options (Date/Time)
- **Home Quote (Pages 2-4):**
    - General: Marital Status, Occupation (self + spouse), Education Level, Business run from home, Mailing Address, Group Memberships (Senior/Costco/Sam's Club), Current Carrier, Exp Date, Tenure, Current Coverage, New Purchase Y/N, Closing Date, Liability, Deductible, Market Value, Mortgage Company, Loan #, Escrow Y/N, Trust Y/N
    - Property: Year Built, Stories, Sq Ft, Purchase Date, Closing Date, Flooring breakdown (Carpet/Ceramic/Hardwood/Laminate/Other with percentages), Exterior construction, Interior details (cathedral ceilings %, # rooms), Central Air Y/N (using heating ducts Y/N), Fireplace Y/N (# chimneys, # hearths, gas Y/N), Bathrooms (full + half), Garage (Y/N, attached/detached, # cars), Construction type (Brick/Frame/Other), Other detached structures sq ft, Foundation (Basement/Slab/Crawlspace), Daylight basement Y/N sq ft, Additions type + sq ft, Enclosed Porch Y/N sq ft, Breezeway Y/N sq ft
    - Additional Rating: Pets (dog breed), Breeding Y/N, Pool (Y/N, depth, above/in-ground, diving board, slide, fenced, locking ladder), Trampoline Y/N + safety netting, Pond Y/N, Burglar alarm (type: alert/central station, fire/burglary/burglary only), Backup generator Y/N, Smoke detectors, Central station fire/burglar, # fire extinguishers, Deadbolt locks Y/N
    - If 20+ years: Heating type + update year, Plumbing type + update year, Roof type + update year, Electrical (Fuses/Circuit Breakers) + update year
    - Losses/Claims: Up to 5 entries (Date, Amount, Description)
    - Additional Home: Deck/Patio/Sunroom sq ft, deck enclosed Y/N + type, hot tub/jacuzzi size + location, windows (sliding glass/picture/bay/other), unique features, jewelry/furs/others
    - Replacement Cost: Total sq ft, stories, bathrooms, porches sq ft, decks Y/N sq ft, basement Y/N finished %, air conditioning, fireplace Y/N, garage attached Y/N + cars
    - Umbrella: Y/N, Liability ($1M/$2M), Uninsured Motorist (None/$1M/$2M)
    - Claims: Y/N last 5 years, describe w/ dates and amounts
- **Auto Quote (Pages 5-6):**
    - General: How did you hear about us, Date, Name, Phone, Address, Email, Time at current address, Old address, Own/Rent/Other, Group, Education Level, Occupation, Marital Status, Desired Effective Date, Current Carrier, Expiration Date, Tenure, Current Medical Carrier, Medical covers auto injuries Y/N, Company vehicle furnished Y/N, Increase Wage Loss
    - Household Members table: Name, DOB, Drivers License, Primary Car
    - Vehicles table: Year, Make, Model, VIN#, Lien/Lease, Usage Per Day
    - Current Coverage table per vehicle: BI, PD, PIP, Comp Deduct, Collision (Board/Basic), Towing, Rental, Lien/Lease
    - Tickets/Accidents/Claims: Driver Name, Date, T/A/C designation
    - Lienholder/Lease Info: per vehicle (up to 4)
    - Notes section
- **Notable characteristics:**
    - Most comprehensive overall document (6 pages)
    - Only document with explicit sales coaching/process (discovery questions, sales tips checklist)
    - Most detailed home section with granular construction/flooring breakdowns
    - Group membership field for affinity discounts
    - Education level captured (discount factor in many states)
    - Usage per day captured for vehicles
    - Medical carrier cross-reference for PIP coordination
    - Company vehicle question
    - Wage loss increase option
    - Separate ticket/accident/claim tracking with type classification

---

### Cross-Document Field Mapping — Complete Matrix

#### Contact & Identification Fields

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Named Insured Name|✅|✅ (driver 1)|✅|✅|4/4|CRITICAL — required for all rating|
|Mailing Address|✅ (Address + City/State/Zip)|— (property address only)|✅|✅|3/4|CRITICAL — garaging address affects rating|
|Phone|✅|✅|✅ (2 fields)|✅|4/4|CRITICAL — contact|
|Email|✅|✅|✅|✅|4/4|CRITICAL — contact/delivery|
|County|—|—|✅|—|1/4|MEDIUM — territory rating in some states|
|Marital Status|—|—|✅|✅|2/4|HIGH — rating factor in most states|
|Spouse/Partner Name|—|—|✅|✅|2/4|HIGH — required if married (rated driver)|
|SSN|✅|—|✅|—|2/4|HIGH — used for credit-based insurance scoring|
|Occupation|—|—|✅|✅|2/4|MEDIUM-HIGH — discount eligibility|
|Education Level|—|—|—|✅|1/4|MEDIUM — discount factor in some carriers|
|Group Memberships|—|—|—|✅|1/4|LOW-MEDIUM — affinity discounts|

#### Driver Fields

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Driver Name|✅|✅|✅|✅|4/4|CRITICAL|
|Date of Birth|✅|✅|✅|✅|4/4|CRITICAL — age is primary rating factor|
|Driver's License #|✅|✅|✅|✅|4/4|CRITICAL — MVR pull, identification|
|License State|—|—|✅|—|1/4|MEDIUM — relevant for out-of-state drivers|
|Where Licensed|—|—|✅|—|1/4|LOW — supplemental to state|
|SR-22 Needed|—|—|✅|—|1/4|MEDIUM — affects carrier eligibility|
|Student w/ 3.0 GPA|—|—|✅|—|1/4|LOW-MEDIUM — good student discount|
|Max Drivers Supported|2|4|4|Unlimited (table)|—|—|

#### Vehicle Fields

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Year|✅|✅|✅|✅|4/4|CRITICAL|
|Make|✅|✅|✅|✅|4/4|CRITICAL|
|Model|✅|✅|✅|✅|4/4|CRITICAL|
|VIN|✅|✅|✅|✅|4/4|CRITICAL — definitive vehicle ID|
|Comp Deductible|—|✅|✅ (per vehicle)|✅|3/4|HIGH|
|Collision Deductible|—|✅|✅ (per vehicle)|✅|3/4|HIGH|
|Loan/Lease/Lien Info|—|—|✅ (GAP + Title)|✅|2/4|HIGH — determines required coverage|
|Rental Coverage|—|✅|✅ (per vehicle)|✅|3/4|MEDIUM|
|Roadside/Towing|—|✅|✅ (per vehicle)|✅|3/4|MEDIUM|
|Garaged at Mailing Address|—|—|✅|—|1/4|MEDIUM — garaging address|
|Rideshare Use|—|—|✅|—|1/4|HIGH — affects coverage/eligibility|
|Who Drives (driver assignment)|—|—|✅|✅ (Primary Car column)|2/4|MEDIUM-HIGH|
|Titled Owner|—|—|✅|—|1/4|MEDIUM — insurable interest|
|How Long Owned|—|—|✅|—|1/4|LOW|
|Usage Per Day|—|—|—|✅|1/4|MEDIUM — mileage/commute rating|
|Max Vehicles Supported|2|4|4|Unlimited (table)|—|—|

#### Coverage & Policy Fields

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Liability Limits|—|✅|✅ (Current Limits)|✅ (BI + PD separate)|3/4|HIGH|
|UM/UIM Limits|—|✅|—|—|1/4|MEDIUM-HIGH|
|PIP / Medpay|—|✅|—|✅|2/4|MEDIUM-HIGH (state-dependent)|
|Full Coverage Designation|—|✅|—|—|1/4|MEDIUM|
|Current Carrier|—|✅|✅|✅|3/4|HIGH — prior insurance discount|
|Current Premium|—|✅|✅|✅|3/4|HIGH — competitive positioning|
|Policy Expiration/Renewal Date|—|✅|✅|✅|3/4|HIGH — timing/lapse assessment|
|Time with Current Carrier|—|—|✅|✅|2/4|MEDIUM — loyalty/stability indicator|
|Desired Effective Date|—|—|—|✅|1/4|MEDIUM-HIGH|
|Medical Carrier (for PIP)|—|—|—|✅|1/4|MEDIUM — PIP coordination|

#### Claims, Violations & Underwriting

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Claims History (5 yrs)|—|✅|✅|✅|3/4|HIGH — surcharges/eligibility|
|Ticket/Violation History|—|—|✅|✅|2/4|HIGH — surcharges/eligibility|
|Own/Rent Home|—|—|✅|✅|2/4|MEDIUM — homeowner discount|
|Anyone Else in Home|—|—|✅|—|1/4|MEDIUM — excluded driver assessment|
|Vehicle Access to Non-Residents|—|—|✅|—|1/4|LOW-MEDIUM|
|Insurance Budget|—|—|✅|—|1/4|LOW (sales, not rating)|

#### Sales & Process Fields

|Field|Doc A|Doc B|Doc C|Doc D|Frequency|Importance|
|---|---|---|---|---|---|---|
|Lead/Referral Source|—|—|✅|✅|2/4|LOW (operational)|
|Date Called|—|—|✅|✅|2/4|LOW (operational)|
|Staff Member / Agent|—|—|✅|✅|2/4|LOW (operational)|
|Date Promised By|—|—|✅|—|1/4|LOW (operational)|
|Why Shopping|—|—|—|✅|1/4|LOW (sales)|
|Decision Timeline|—|—|—|✅|1/4|LOW (sales)|
|Sales Tips Checklist|—|—|—|✅|1/4|LOW (coaching)|
|Discount Interest|—|—|—|✅|1/4|LOW (sales)|
|Lines Quoted|—|—|—|✅|1/4|LOW (sales tracking)|

---

### Synthesis: Canonical Minimum Viable Quote Packet (Auto)

Based on the intersection of all four documents and weighting by frequency + rating engine necessity, the minimum viable field set for an auto insurance quote is:

**Contact Block:**

- Full Name (Named Insured)
- Mailing Address (Street, City, State, Zip)
- Phone
- Email

**Per-Driver Block (support at least 4):**

- Full Name
- Date of Birth
- Driver's License Number

**Per-Vehicle Block (support at least 4):**

- Year
- Make
- Model
- VIN

**Policy Context:**

- Current Insurance Carrier
- Current Premium
- Expiration / Renewal Date

**Underwriting:**

- Claims History (last 5 years)

**Recommended additions for accurate quoting (Tier 2):**

- SSN (credit score rating)
- Marital Status
- Occupation
- Spouse/Partner Info
- Comp / Collision Deductibles (per vehicle)
- Liability Limits (current)
- Ticket/Violation History
- Own vs Rent
- Loan/Lease/Lien per vehicle

**Optional value-add fields (Tier 3):**

- SR-22 requirement
- Student discount eligibility
- Rideshare usage
- GAP coverage need
- Rental / Roadside preferences
- Driver-to-vehicle assignment
- Garaging address (if different)
- Usage / mileage per day
- Education level
- Group memberships
- Lead source / referral
- Budget
- Desired effective date

---

### Observations for PolicyLift Quote Packet Design

1. **The "universal 10" fields appear in every single document** — these are the absolute floor for any auto quote intake, regardless of agency sophistication or state.
    
2. **SSN is contentious** — 2 of 4 docs include it. It's needed for credit-based insurance scoring but many agencies delay collecting it until after initial quote to reduce friction. Consider making this a deferred field.
    
3. **Per-vehicle coverage granularity varies significantly** — Doc C captures comp, collision, rental, roadside, GAP, and rideshare per vehicle. Doc B captures coverage globally. A flexible design should support per-vehicle overrides with sensible defaults.
    
4. **Home cross-sell data appears in 3 of 4 documents** — even on "auto quote" sheets. This reinforces that multi-line quoting is the industry expectation and the Quote Packet should support bundled intake.
    
5. **Sales process fields (Docs C, D) are operationally important** but are distinct from rating fields. They should exist in the system but be separated from the core quote data model.
    
6. **Driver-to-vehicle assignment (Docs C, D) is important** for accurate rating but often unknown at intake. Design should allow assignment to be deferred.
    
7. **Claims and violation history** appear in 3 of 4 documents, confirming their importance, though the level of detail varies (free text vs structured date/amount/description).
    
8. **State-specific fields** like PIP/Medpay, UM/UIM, and SR-22 need to be conditionally presented based on the insured's state. Texas (Doc B) and the generic forms handle these differently.