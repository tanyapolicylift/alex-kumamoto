# Research: Declaration Page Parsing & OCR Solutions for Personal Lines

References: [[spec_dec_page_smart_form_portal]], [[context_plrater_home_auto]], [[cycle_prd]]

---

## 1. Declaration Page Field Mapping

### 1.1 Personal AUTO Declaration Page Fields

A personal auto dec page is typically 1-2 pages and contains the following fields. The right column maps each to the corresponding PL Rater quote input.

| Dec Page Field | Description | PL Rater Quote Field | Required for Quote? |
|---|---|---|---|
| **Policy Header** | | | |
| Policy Number | Carrier-assigned policy ID | Prior policy number | Yes |
| Carrier / Company Name | Issuing insurance company | Prior carrier name | Yes |
| Policy Period (Effective / Expiration) | Coverage dates | Policy effective date, prior insurance duration | Yes |
| Agent Name & Contact | Producing agent info | *Not needed for quoting* | No |
| Named Insured(s) | Policyholder name(s) | Applicant name, co-applicant name | Yes |
| Mailing Address | Policyholder address | Applicant address (garaging address) | Yes |
| **Driver Schedule** | | | |
| Driver Name(s) | Listed drivers | Driver name(s) | Yes |
| Driver DOB | Date of birth per driver | Driver DOB | Yes |
| Driver License Number | DL number per driver | Driver license number | Recommended |
| Relationship | Relationship to named insured | Driver relationship | Recommended |
| Marital Status | Sometimes shown | Marital status | Yes (PL Rater) |
| Gender | Sometimes shown | Driver gender | Yes (PL Rater) |
| **Vehicle Schedule** | | | |
| Year / Make / Model | Vehicle description | Vehicle year, make, model | Yes |
| VIN | 17-character Vehicle ID | Vehicle VIN | Yes |
| Body Type | Sedan, SUV, truck, etc. | Body type | Recommended |
| Use / Mileage | Pleasure, commute, annual miles | Vehicle use, annual mileage | Recommended |
| Garaging Address | Where vehicle is kept | Garaging ZIP | Yes |
| **Coverage Table** | | | |
| Bodily Injury Liability | Per-person / per-accident limits | BI liability limits | Yes |
| Property Damage Liability | PD limit | PD liability limit | Yes |
| UM/UIM Bodily Injury | Uninsured/underinsured limits | UM/UIM limits | Yes |
| UM Property Damage | If applicable (varies by state) | UMPD limit | State-dependent |
| Medical Payments / PIP | Med Pay or PIP amount | Med Pay / PIP limit | Yes |
| Comprehensive | Deductible amount | Comp deductible | Yes |
| Collision | Deductible amount | Collision deductible | Yes |
| Towing / Roadside | Coverage limit | Towing/roadside | Optional |
| Rental Reimbursement | Daily / max limit | Rental reimbursement | Optional |
| **Premium Summary** | | | |
| Premium per Vehicle | Broken out by vehicle | *Context only; not a quote input* | No (useful context) |
| Total Policy Premium | Total annual or 6-month premium | Prior premium (for competitive context) | Useful |
| **Endorsements** | | | |
| SR-22 Filing | If present | SR-22 required flag | Yes if present |
| Full Glass | No-deductible glass | Full glass coverage | Optional |
| Gap Coverage | Loan/lease gap | Gap coverage | Optional |
| **Discounts Applied** | | | |
| Multi-policy, good driver, etc. | Listed discounts | *Not directly input; implied by data* | No |
| **Claims/Incidents** | | | |
| Sometimes listed on dec page | Prior claims summary | Incident history (date, type, amount) | Yes if present |

**Fields on dec pages NOT needed for quoting but useful as context:**
- Agent name and agency info (useful for competitive intelligence)
- Billing plan / payment schedule
- Policy form type (e.g., PAP, PP)
- Endorsement detail language
- Cancellation/non-renewal notices
- Lender/lienholder info (needed at bind, not for comparative quote)

### 1.2 Personal HOME Declaration Page Fields

| Dec Page Field | Description | PL Rater Quote Field | Required for Quote? |
|---|---|---|---|
| **Policy Header** | | | |
| Policy Number | Carrier-assigned ID | Prior policy number | Yes |
| Carrier / Company Name | Issuing company | Prior carrier name | Yes |
| Policy Period | Effective / expiration dates | Policy effective date | Yes |
| Named Insured(s) | Policyholder(s) | Applicant name | Yes |
| Mailing Address | Policyholder mailing address | Applicant mailing address | Yes |
| **Property Details** | | | |
| Property Address | Location of insured dwelling | Property address | Yes |
| Dwelling Type | Single family, condo, etc. | Occupancy / dwelling type | Yes |
| Year Built | Construction year | Year built | Yes |
| Construction Type | Frame, masonry, etc. | Construction type | Yes |
| Square Footage | Sometimes listed | Square footage | Recommended |
| Number of Stories | Sometimes listed | Stories | Recommended |
| Roof Type / Year | Sometimes in endorsements | Roof material, roof age | Recommended |
| **Coverage Schedule** | | | |
| Dwelling (Coverage A) | Replacement cost amount | Dwelling coverage amount | Yes |
| Other Structures (Cov B) | Usually % of Cov A | Other structures amount | Yes |
| Personal Property (Cov C) | Contents coverage | Personal property amount | Yes |
| Loss of Use (Cov D) | Additional living expense | Loss of use amount | Yes |
| Personal Liability | Liability limit | Liability limit | Yes |
| Medical Payments | Guest medical | Medical payments limit | Yes |
| **Deductibles** | | | |
| All-Perils Deductible | Base deductible | Deductible amount | Yes |
| Wind/Hail Deductible | Separate % deductible (TX, FL) | Wind/hail deductible | Yes (TX, FL) |
| Hurricane Deductible | Coastal areas | Hurricane deductible | Yes (FL coastal) |
| **Premium** | | | |
| Annual/Term Premium | Total premium | Prior premium (context) | Useful |
| Premium Breakdown | Per-coverage or per-peril | *Context only* | No |
| **Endorsements** | | | |
| Water Backup | Sewer/drain coverage | Water backup endorsement | Recommended |
| Extended Replacement Cost | +25/50% dwelling | Extended replacement cost | Recommended |
| Earthquake (CA) | Separate or CEA | Earthquake coverage flag | State-dependent |
| Scheduled Property | Jewelry, art, etc. | Scheduled items | Optional |
| Equipment Breakdown | HVAC/electrical | Equipment breakdown | Optional |
| **Discounts** | | | |
| Claims-free, multi-policy, etc. | Applied discounts | *Not direct inputs* | No |
| **Claims History** | | | |
| Prior claims (if shown) | Date, type, amount | Claims history | Yes if present |

**Fields on home dec pages NOT needed for quoting but useful:**
- Mortgagee / lienholder info (needed at bind, not quote)
- Agent/agency details
- Billing schedule
- Policy form type (HO-3, HO-5, DP-1, etc.) -- actually useful to know the form
- ISO Protection Class (sometimes shown)

---

## 2. Declaration Page Format Variation Across Carriers

### 2.1 How Much Do Layouts Vary?

**Significantly.** Every carrier designs their own dec page layout. There is no industry standard format (unlike ACORD forms). Key variation dimensions:

| Variation Dimension | Range of Variation |
|---|---|
| **Overall Layout** | Single column, two-column, tabular, mixed |
| **Header Design** | Logo placement, policy info location varies completely |
| **Coverage Presentation** | Table format, list format, per-vehicle breakdown, or aggregate |
| **Terminology** | "Bodily Injury" vs "BI Liability" vs "Section I - Liability" |
| **Field Ordering** | Some show vehicles first, others show coverages first |
| **Page Count** | 1 page (simple) to 4+ pages (multi-vehicle, endorsements) |
| **Font / Typography** | Varies wildly; some use monospace, some proportional |
| **Digital vs Scanned** | PDFs from carrier portals vs photographed paper copies |

### 2.2 Carrier-Specific Notes (CA, TX, OH, FL Focus)

| Carrier | Auto Dec Layout Notes | Home Dec Layout Notes |
|---|---|---|
| **State Farm** | Clean tabular layout. Vehicles and coverages in a grid. Consistent across states. Relatively parse-friendly. | Structured coverage table. Year built and construction sometimes on a separate property page. |
| **GEICO** | Simple layout. Coverage table per vehicle. Uses "Coverage Summary" header. Premium clearly shown. | GEICO primarily writes auto; home is through partners, so home dec pages vary. |
| **Progressive** | Well-structured. Vehicle schedule + coverage table. Clear VIN display. Consistent digital PDFs. | Home through Progressive Home (ASI). Different format from auto. |
| **Allstate** | Multi-section layout. Driver schedule, vehicle schedule, coverage schedule clearly separated. | Standard HO dec page. Coverage A-D clearly listed. Endorsements section present. |
| **USAA** | Clean military-style layout. Well-organized tables. Digital PDFs are high quality. | Similar structured approach for home. Clear coverage breakdown. |
| **Farmers** | More text-heavy. Coverages embedded in paragraph-like sections. Harder to parse. | Mix of tabular and text. Property details may span multiple sections. |
| **Liberty Mutual** | Structured but verbose. Multiple pages common. Coverage per vehicle in separate tables. | Detailed property section. Construction details sometimes included. |
| **Nationwide** | Clean tabular format. Uses standard terminology. Parse-friendly. | Good structure. Coverage schedule is well-organized. |
| **Travelers** | Clean professional layout. Coverage and vehicle info in clear tables. | Very detailed home dec. Includes property characteristics section. |
| **Hartford** | Primarily AARP market. Clean layout. Simpler policies = simpler dec pages. | Standard format. Often includes detailed endorsement list. |
| **Auto-Owners** | Regional carrier. Moderate complexity. Mix of table and list formatting. | Well-structured for home. Property details included. |
| **Erie** | Clean layout. Regional (mostly OH, PA). Consistent format. | Good structure for home. |
| **Mercury** | CA-focused. Clean auto dec pages. Coverage table per vehicle. | Home through Mercury. Standard format. |
| **CSAA (AAA)** | CA/NV focused. Clean tabular format. VINs clearly displayed. | Standard home format. |
| **Bristol West** | Non-standard/high-risk market. Simpler policies, simpler dec pages. | N/A (auto focused) |
| **Safeco (Liberty Mutual)** | Clean format. Agency channel. Good table structure. | Well-organized home dec. Extended replacement cost often shown. |
| **Kemper** | Specialty/non-standard. Simpler layout. May lack some optional coverages. | Limited home presence. |

### 2.3 Common Structural Patterns

Despite layout variation, most dec pages follow a recognizable structural pattern:

```
[CARRIER LOGO / HEADER]
    - Carrier name, address, phone
    - Agent name, agency

[POLICY IDENTIFICATION BLOCK]
    - Policy number
    - Named insured(s)
    - Mailing address
    - Policy period (effective - expiration)

[VEHICLE/PROPERTY SCHEDULE]  (auto: vehicles; home: property details)
    - Auto: VIN, Year/Make/Model, use
    - Home: Property address, dwelling type, year built

[DRIVER SCHEDULE] (auto only)
    - Driver names, DOBs, license numbers

[COVERAGE TABLE]
    - Coverage type | Limit | Deductible | Premium
    - Per vehicle (auto) or per coverage (home)

[ENDORSEMENTS/ADDITIONAL COVERAGES]
    - List of added/removed coverages

[PREMIUM SUMMARY]
    - Per-vehicle or per-coverage premium
    - Total premium

[DISCOUNTS] (sometimes)
    - Applied discounts list

[FORMS/CONDITIONS] (sometimes)
    - Policy form references
```

This structural pattern is exploitable. Even though the exact pixel coordinates and formatting differ, the *logical sections* are highly consistent. This is what makes LLM-based extraction viable -- the model can identify these logical sections regardless of exact layout.

### 2.4 PDF vs Scanned/Photographed Challenges

| Document Type | Challenges | Mitigation |
|---|---|---|
| **Digital PDF** (from carrier portal) | Text is selectable. Tables have structure. **Easiest to parse.** Low error rate. | Direct text extraction; no OCR needed. Layout parsing for structure. |
| **Scanned PDF** (paper scanned to PDF) | Text is embedded as image. Quality depends on scanner. May have skew, noise. | OCR required. Quality usually decent. Deskew preprocessing helps. |
| **Photographed** (mobile camera) | Perspective distortion, glare, shadows, partial capture, low resolution, finger occlusion. **Hardest to parse.** | Need robust preprocessing: deskew, perspective correction, enhancement. LLM vision handles this surprisingly well. |
| **Multi-page** | Vehicle schedule on page 1, coverages on page 2. Need to stitch context across pages. | Must process all pages as a unit. LLM context windows handle this. |
| **HEIC format** (iPhone photos) | Requires conversion before most OCR engines can process. | Server-side HEIC to JPG conversion. |

---

## 3. OCR / Document AI Solutions Comparison

### 3.1 Platform Comparison Matrix

| Capability | Google Document AI | AWS Textract | Azure AI Document Intelligence | Tesseract + LLM |
|---|---|---|---|---|
| **OCR Accuracy** | Excellent (98%+) | Very Good (96%+) | Excellent (98%+) | Good (92-95% raw; improved with LLM post-processing) |
| **Table Extraction** | Strong | Strong | Best-in-class | Weak natively; LLM compensates |
| **Key-Value Pairs** | Strong | Strong | Strong | Requires LLM |
| **Custom Training** | Yes (Custom Extractor) | No (pre-trained only; Custom Queries available) | Yes (Custom Neural/Template models) | N/A (LLM prompt tuning instead) |
| **Insurance-Specific Models** | No pre-built insurance model | No pre-built insurance model | No pre-built insurance model | N/A |
| **Layout Variation Handling** | Good with custom processor | Moderate (better with Queries) | Good with custom models | Excellent (LLM strength) |
| **Handwriting** | Good | Good | Good | Variable |
| **Setup Complexity** | Medium (GCP familiarity needed) | Low (AWS ecosystem) | Medium (Azure familiarity needed) | Low-Medium (open source + API calls) |
| **Processing Speed** | ~1-3 sec/page | ~2-3 sec/page | ~2-4 sec/page | ~3-10 sec/page (LLM latency dominant) |
| **Cloud Lock-in** | GCP | AWS | Azure | None |

### 3.2 Pricing Comparison (Per 1,000 Pages)

| Service | Basic OCR | Forms/Tables Extraction | Custom Model/Queries | Notes |
|---|---|---|---|---|
| **Google Document AI** | $1.50 (Enterprise OCR) | $30 (Form Parser or Custom Extractor) | $30 (Custom Extractor) | Custom processor hosting: $0.05/hr. Volume discount at 1M+ pages. |
| **AWS Textract** | $1.50 (Detect Text) | $50 (Forms) / $15 (Tables) / $15 (Queries) | $25 (Custom Queries) / $70 (Forms+Tables+Queries combined) | Volume discount at 1M+ pages. Free tier: 1,000 pages/month for 3 months. |
| **Azure AI Doc Intelligence** | ~$1.50 (Read) | ~$12.50 (General Document) | ~$12.50 (Custom model, per page analysis); training: free for template, $3/hr for neural | Custom neural model training cost adds up. Volume discounts available. |
| **Tesseract + LLM** | Free (Tesseract is open source) | LLM cost only | LLM cost only | See LLM pricing below. Total cost depends on LLM choice. |

### 3.3 Detailed Analysis

**Google Document AI:**
- Strengths: Excellent OCR quality, custom extractor with labeling UI, good for scaling.
- Weaknesses: No insurance-specific pre-built model. Custom Extractor at $30/1K pages is expensive at scale. Requires GCP commitment.
- Best for: Teams already on GCP who want a managed custom extraction pipeline.

**AWS Textract:**
- Strengths: Easy AWS integration (S3 + Lambda pipeline). Good key-value and table extraction. Queries feature lets you ask natural language questions about the document.
- Weaknesses: No custom training (cannot fine-tune models on your documents). Queries are limited to 15-30 per page. Combined pricing ($70/1K pages for forms+tables+queries) adds up.
- Best for: AWS-native teams wanting quick setup with moderate customization via queries.

**Azure AI Document Intelligence:**
- Strengths: Best semantic output quality in benchmarks. Custom neural models allow insurance-specific training. Rich confidence scoring. Layout-aware extraction.
- Weaknesses: Azure ecosystem dependency. Custom neural model training has per-hour costs. Slightly slower processing.
- Best for: Teams willing to invest in custom model training for highest accuracy on specific carrier formats.

**Tesseract + LLM Post-Processing:**
- Strengths: Zero OCR licensing cost. LLM handles layout variation extremely well. Most flexible approach. No vendor lock-in.
- Weaknesses: Tesseract OCR quality is lower than commercial alternatives (especially on photographed docs). Two-step pipeline adds latency. LLM costs per page can exceed cloud OCR for high volumes.
- Best for: V1 prototyping, low volume, or when combined with a better OCR frontend.

### 3.4 Recommendation for Our Use Case

For personal lines dec page parsing across ~15-20 carriers per state, the **Tesseract/Cloud OCR + LLM approach** or a **direct LLM vision approach** (see Section 5) is the most practical V1 path because:

1. **Layout variation is the primary challenge** -- not raw OCR accuracy. LLMs handle layout variation far better than template-based or custom-trained OCR models.
2. **Custom model training** (Google, Azure) requires labeled training data per carrier format. With 60-80 distinct carrier formats across 4 states and 2 lines, the labeling burden is enormous.
3. **Volume at V1** (thousands/month, not millions) doesn't justify the investment in custom OCR models.

---

## 4. Insurance-Specific Document Parsing Vendors

### 4.1 Canopy Connect (DecSight)

**Product:** DecSight -- dedicated declaration page parsing product, part of their Insurance Data Intake Platform.

**How it works:**
- Upload a dec page (PDF, image) via API, dashboard, or embedded widget
- DecSight routes the document through three mechanisms:
  1. **Template recognition** -- pre-mapped carrier-specific templates
  2. **Semantic extraction** -- understanding document structure contextually
  3. **Image processing** -- handling photos, scans, low-quality inputs
- Returns structured data: policy info, contact info, driver info, vehicle info, property info, coverages, premiums

**Extracted Fields:**
- Policy number, carrier, effective/expiration dates
- Named insured, address, DOB
- Drivers (name, DOB, license)
- Vehicles (VIN, year/make/model)
- Property details (address, construction, year built)
- Coverages and limits
- Deductibles
- Premium breakdown
- Claims history (if on dec page)

**Carrier Coverage:** Claims 96% of auto insurance market and 91% of home insurance market coverage. This likely means they have templates or trained models for the top carriers.

**Pricing:**
- Agency plans use "Policy Points" system: 1 point per personal lines submission, 5 per commercial. Additional points at $2-$4 each depending on plan.
- API pricing is custom/volume-based. Not publicly disclosed for DecSight specifically.
- Estimated cost: likely $2-$5 per document based on their policy point pricing.

**Integration:** REST API, embeddable widget, dashboard. Can integrate into existing agency workflows.

**Strengths:**
- Purpose-built for insurance dec pages
- Broadest carrier coverage claims
- Combined with their account linking product (pull data direct from carrier portals)
- Pre-built insurance data schema output

**Weaknesses:**
- Vendor dependency / black box
- Pricing not transparent for API use
- May not cover every niche/non-standard carrier
- Limited customization of output schema

**Verdict:** **Strong contender for buy path.** If accuracy and carrier coverage claims hold, this is the most turnkey solution. Worth a pilot evaluation.

### 4.2 Sensible

**Product:** Developer-first document extraction API with insurance as a key vertical.

**How it works:**
- Define extraction configurations using their SDK (combines LLM-based and layout-based extraction)
- Upload documents via API
- Returns structured JSON per defined schema
- No model training required -- onboard with a single sample document

**Insurance Capabilities:**
- Dec page parsing (auto and home)
- Loss run extraction
- ACORD form extraction
- COI extraction
- Policy document extraction

**Pricing:**
- **Growth:** $499/month for 750 documents ($0.67/doc); $0.50 per additional doc
- **Scale:** $1,499/month for 3,200 documents ($0.47/doc); $0.50 per additional doc
- **Enterprise:** Custom pricing for 10,000+ documents

**Strengths:**
- Developer-first API (clean integration)
- Per-document pricing (not per-page) -- good for multi-page dec pages
- No model training needed
- Combines LLM + layout-based extraction
- Unlimited document layouts included
- Insurance-specific configurations available

**Weaknesses:**
- Less insurance-domain-specific than Canopy Connect
- You define the extraction schema yourself (more flexible, but more setup work)
- At $0.50-$0.67 per document, moderately expensive at scale

**Verdict:** **Strong developer-friendly option.** Good for teams that want control over the extraction schema. Lower upfront commitment than Canopy Connect. Worth evaluating alongside DecSight.

### 4.3 SortSpoke

**Product:** Insurance-specific intelligent document processing platform.

**Capabilities:**
- Loss runs, submissions, applications, policies, endorsements, schedules
- Dec page parsing capability
- Claims 95%+ accuracy
- 5x faster than manual processing
- No templates required
- Configurable API and pre-built connectors

**Pricing:** Not publicly available. Contact sales.

**Strengths:**
- Purpose-built for insurance documents
- Handles wide variety of insurance document types
- Quick implementation (days, not months)
- Insurance LLM specifically trained on insurance documents

**Weaknesses:**
- Pricing opacity
- Relatively newer player
- Primarily focused on commercial lines (submissions, loss runs) -- personal lines dec page support unclear

**Verdict:** Worth a conversation if SortSpoke has strong personal lines dec page coverage. Their commercial focus may mean personal auto/home dec pages are secondary.

### 4.4 Indico Data

**Product:** Agentic Decisioning Platform for insurance -- intelligent document processing (IDP).

**Capabilities:**
- Processes 900+ insurance document types
- 120+ product lines coverage
- 70+ languages
- 80% reduction in manual processing time
- Primarily targets carriers and large MGAs for submission intake, underwriting, claims

**Pricing:** Enterprise-only. Not publicly available. Likely $50K+ annual contract given enterprise focus.

**Relevance to Our Use Case:**
- **Low relevance for V1.** Indico is built for carrier-side commercial underwriting workflows, not independent agency personal lines dec page parsing.
- Overkill for our use case. Would be like using a freight truck to deliver a letter.

**Verdict:** Not recommended. Enterprise pricing, commercial focus, and complexity don't align with our personal lines agency use case.

### 4.5 Fenris Digital

**Product:** Insurance data enrichment and prefill API. NOT a document parsing solution.

**Capabilities:**
- Given a name + address, returns pre-fill data for insurance applications
- Covers auto, home, life, small commercial
- 95% US coverage (255M adults, 130M households)
- Returns data like vehicle info, property details, demographics, risk scores

**Document Parsing:** **No.** Fenris does not parse documents. They are a data enrichment provider.

**Relevance:** Complementary to dec page parsing, not a substitute. Fenris can pre-fill fields that are NOT on the dec page (like property construction details, roof age, etc.), while dec page parsing captures what IS on the document. Using both together would maximize data coverage.

**Verdict:** Not a dec page solution, but valuable as a complementary data enrichment source. See [[spec_data_enrichment]].

### 4.6 Planck

**Product:** AI-powered commercial insurance underwriting platform.

**Capabilities:** Generates underwriting insights for commercial lines using web data, images, public records. Uses computer vision, NLP, and unstructured data analysis.

**Personal Lines Capabilities:** **None identified.** Planck is exclusively focused on commercial insurance.

**Verdict:** Not relevant for personal auto/home dec page parsing.

### 4.7 AgentSync / Zywave

- **AgentSync:** Producer management, compliance, and licensing platform. No document parsing for dec pages.
- **Zywave:** Insurance technology solutions for agencies (content, analytics, compliance). No dedicated dec page parsing.

**Verdict:** Neither is relevant for dec page parsing.

### 4.8 Other Notable Vendors

| Vendor | Offering | Relevance |
|---|---|---|
| **Nanonets** | General document OCR/extraction. ~$0.30/page. Strong on tables and handwriting. | Moderate -- general purpose, not insurance-specific. |
| **Reducto** | API-first document parsing for LLM pipelines. Layout-aware chunking. | Moderate -- good preprocessing for LLM-based extraction. |
| **Unstract** | Open-source document processing with LLM orchestration. Insurance use cases highlighted. | Moderate -- could be a good foundation for custom pipeline. |
| **Klippa** | Document extraction with fraud detection. | Low -- more focused on identity and invoice docs. |
| **Docsumo** | Insurance document extraction. ACORD forms, COIs, dec pages. | Moderate -- worth investigating for insurance-specific support. |

---

## 5. LLM Vision for Dec Page Extraction

### 5.1 Current State of the Art

LLM vision models (GPT-4o, Claude Sonnet/Opus, Gemini Pro) can now directly process images of insurance documents and extract structured data without a separate OCR step. This represents a paradigm shift from "OCR then interpret" to "see and understand."

**Key models and capabilities (as of early 2026):**

| Model | Vision Capability | Accuracy on Text-Based PDFs | Accuracy on Scanned Docs | Structured Output | Cost per Page (est.) |
|---|---|---|---|---|---|
| **GPT-4o** | Strong | ~98% | ~91% (with OCR assist) | JSON mode, function calling | ~$0.01-$0.03 |
| **GPT-4o-mini** | Good | ~95% | ~88% | JSON mode | ~$0.001-$0.005 |
| **Claude Sonnet 4.5** | Strong | ~97% | ~90% | JSON mode | ~$0.01-$0.03 |
| **Claude Haiku 4.5** | Good | ~94% | ~87% | JSON mode | ~$0.003-$0.008 |
| **Gemini 2.0 Pro** | Very Strong (native vision) | ~96% | ~94% (best on scanned) | JSON mode | ~$0.01-$0.03 |

*Cost estimates assume ~2-3 pages per dec page, ~1500-3000 tokens input (image) + ~500-1000 tokens output (structured JSON). Actual costs depend on image resolution and complexity.*

### 5.2 Published Benchmarks and Case Studies

- **Koncile.ai** published a comparison of Claude vs GPT vs Gemini for invoice extraction (analogous to dec page extraction): GPT-4o achieved 98% on text PDFs, Claude 97%, Gemini 96%. For scanned documents, Gemini led at 94%.
- **Unstructured AI** benchmarks showed Claude Opus at 90% precision / 80% recall on document extraction tasks, with purpose-built solutions achieving higher (97% precision / 86% recall).
- **Vellum.ai** (2026 analysis) found that LLM vision approaches are increasingly competitive with traditional OCR for structured data extraction, with the advantage of handling layout variation natively.
- **OmniAI OCR Benchmark** showed that VLMs like Gemini 2.0 are becoming cost-competitive with traditional OCR providers while handling more document variation.

No insurance-specific dec page benchmarks have been published publicly, but the invoice/form extraction benchmarks are highly analogous (same challenges: tables, key-value pairs, varied layouts).

### 5.3 Prompt Engineering Patterns for Dec Page Extraction

**Pattern 1: Schema-First Prompting**
```
You are an insurance document parser. Extract the following fields from
this insurance declaration page image and return as JSON matching this
exact schema:

{
  "policy": {
    "carrier_name": "string",
    "policy_number": "string",
    "effective_date": "YYYY-MM-DD",
    "expiration_date": "YYYY-MM-DD"
  },
  "named_insured": {
    "name": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zip": "string"
    }
  },
  "vehicles": [
    {
      "year": "integer",
      "make": "string",
      "model": "string",
      "vin": "string (17 characters exactly)",
      "coverages": {
        "bodily_injury_limit": "string (e.g. 100000/300000)",
        "property_damage_limit": "integer",
        "comprehensive_deductible": "integer or null",
        "collision_deductible": "integer or null",
        ...
      }
    }
  ],
  "drivers": [...],
  "total_premium": "number"
}

Rules:
- VINs must be exactly 17 characters. If uncertain about a character,
  use the most likely alphanumeric character (VINs never contain I, O, Q).
- Dates must be in YYYY-MM-DD format.
- Coverage limits should be numeric (not formatted strings).
- If a field is not present on the document, use null.
- Do NOT hallucinate or infer data not visible on the page.
```

**Pattern 2: Two-Pass Extraction**
- Pass 1: "List all text content you can see on this insurance declaration page, organized by section." (raw extraction)
- Pass 2: "Given this raw text from a dec page, extract structured data matching this JSON schema: {...}" (structuring)
- Advantage: separates OCR from interpretation, allows validation between passes.

**Pattern 3: Carrier-Aware Prompting**
```
This is a [Progressive/State Farm/GEICO] auto insurance declaration
page. These typically have [specific layout hints]. Extract...
```
- Providing carrier context (even if detected automatically from the logo) can improve accuracy by 5-10%.

**Pattern 4: Confidence-Annotated Output**
```
For each extracted field, also provide a confidence level:
- "high": clearly visible and unambiguous
- "medium": partially visible or somewhat ambiguous
- "low": barely visible, estimated, or uncertain

Return as: {"field": {"value": "...", "confidence": "high/medium/low"}}
```

### 5.4 Accuracy Expectations by Field Type

| Field Type | Expected Accuracy | Notes |
|---|---|---|
| **Carrier Name** | 99%+ | Usually large/prominent text or logo |
| **Policy Number** | 97-99% | Clear text, often near top of page |
| **Named Insured** | 98-99% | Prominent text |
| **Address** | 96-99% | Structured, but apartment/unit numbers can be tricky |
| **Dates** | 97-99% | Standard format, well-recognized |
| **VIN (17 chars)** | 90-95% | **Highest error risk.** Similar characters (1/I, 0/O, 8/B, 5/S) cause misreads, especially on photos. VIN checksum validation catches most errors. |
| **Vehicle Y/M/M** | 97-99% | Well-structured, recognizable |
| **Coverage Limits** | 95-98% | Table format helps; ambiguity in which limit maps to which coverage |
| **Deductibles** | 95-98% | Usually in coverage table |
| **Premium Amounts** | 97-99% | Usually prominent numbers |
| **Driver DOB** | 95-98% | Date format is recognizable |
| **Driver License #** | 90-95% | Alphanumeric, similar challenges to VIN |

**VIN accuracy is the critical risk.** At 90-95% raw accuracy on a 17-character string, roughly 5-10% of VINs will have at least one wrong character. Mitigation strategies:
1. **VIN check digit validation** (position 9 is a check digit) catches ~90% of single-character errors
2. **VIN decoding API** (NHTSA vPIC) -- if decoded VIN returns a valid vehicle, it's correct
3. **Cross-reference with year/make/model** -- if the decoded VIN doesn't match the listed Y/M/M, flag for review
4. **Ask customer to confirm** -- if VIN confidence is low, include it in the smart form for manual confirmation

### 5.5 Cost Per Page: Vision Models vs Traditional OCR

| Approach | Cost per Dec Page (2 pages) | At 1,000 pages/month | At 5,000 pages/month |
|---|---|---|---|
| **GPT-4o Vision** | ~$0.02-$0.06 | $20-60 | $100-300 |
| **GPT-4o-mini Vision** | ~$0.003-$0.01 | $3-10 | $15-50 |
| **Claude Sonnet 4.5** | ~$0.02-$0.06 | $20-60 | $100-300 |
| **Claude Haiku 4.5** | ~$0.005-$0.015 | $5-15 | $25-75 |
| **Gemini 2.0 Pro** | ~$0.01-$0.04 | $10-40 | $50-200 |
| **AWS Textract (Forms+Tables+Queries)** | ~$0.14 | $140 | $700 |
| **Google Doc AI (Custom Extractor)** | ~$0.06 | $60 | $300 |
| **Azure Doc Intelligence (Custom)** | ~$0.025 | $25 | $125 |
| **Sensible** | ~$0.50-$0.67 per document | $500-670 | $2,500-3,350 |
| **Canopy DecSight** | ~$2-$5 per document (est.) | $2,000-5,000 | $10,000-25,000 |

**Key insight:** LLM vision is dramatically cheaper per page than insurance-specific vendors. The tradeoff is accuracy, carrier coverage, and maintenance burden.

---

## 6. Hybrid Approaches

### 6.1 Recommended Hybrid Architecture

The best approach combines the strengths of each technology layer:

```
[Input: Dec Page PDF/Image]
        |
        v
[Step 1: Preprocessing]
  - HEIC conversion
  - Image enhancement (deskew, contrast)
  - PDF text extraction attempt (for digital PDFs)
        |
        v
[Step 2: OCR Layer] (if scanned/photographed)
  - Option A: Cloud OCR (Google Vision, AWS Textract, Azure)
  - Option B: Direct LLM Vision (skip separate OCR)
        |
        v
[Step 3: LLM Extraction]
  - Input: OCR text + original image (or just image for vision approach)
  - Prompt: Schema-first with carrier hints
  - Output: Structured JSON with confidence scores
        |
        v
[Step 4: Validation & Enrichment]
  - VIN check digit validation
  - VIN decode via NHTSA API
  - Date format validation
  - Coverage limit range validation
  - Address standardization (USPS API)
  - Cross-reference: does VIN match Y/M/M?
        |
        v
[Step 5: Confidence Scoring & Routing]
  - High confidence (>95% all fields): Auto-accept
  - Medium confidence (80-95%): Accept with flags for review
  - Low confidence (<80% any critical field): Route to human review
        |
        v
[Step 6: Schema Mapping]
  - Map extracted fields to PL Rater schema
  - Populate CapturedField records
  - Flag remaining missing fields for smart form
```

### 6.2 Template-Based vs Template-Free Approaches

| Aspect | Template-Based | Template-Free (LLM) | Hybrid |
|---|---|---|---|
| **Accuracy on known layouts** | 99%+ (highest) | 95-98% | 97-99% |
| **Accuracy on unknown layouts** | 0% (fails completely) | 93-97% | 93-97% |
| **New carrier onboarding** | Days-weeks per carrier (create template) | Zero setup | Hours (optional tuning) |
| **Maintenance burden** | High (carriers change layouts) | None (model handles variation) | Low |
| **Scale across carriers** | Poor (15-20 carriers x 4 states = 60-80 templates) | Excellent | Excellent |
| **Cost** | Low per-page (once built) | Moderate per-page (LLM costs) | Moderate |
| **Recommended for** | High-volume, single-carrier scenarios | Multi-carrier, varied layouts | Multi-carrier with top-carrier optimization |

**For our use case (multi-carrier, multi-state):** Template-free (LLM-based) is the clear winner. A hybrid where we add light carrier-specific prompt hints for the top 5-10 carriers provides marginal accuracy gains without the full template maintenance burden.

### 6.3 Confidence Scoring Strategies

LLMs don't natively provide calibrated confidence scores. Strategies to generate them:

1. **Self-reported confidence:** Ask the LLM to rate its own confidence per field (as shown in prompt pattern 4). These are directionally useful but not calibrated -- models tend to be overconfident.

2. **Validation-based confidence:**
   - VIN passes check digit? High confidence. Fails? Low confidence.
   - Date is valid and within reasonable range (policy period 6-12 months)? High.
   - Coverage limit is a standard value (25K, 50K, 100K, 250K, 300K, 500K)? Higher confidence than a non-standard value.
   - Address validates via USPS? High.

3. **Multi-model consensus:** Run the same dec page through 2 models (e.g., GPT-4o + Claude Sonnet). If they agree, high confidence. If they disagree, flag for review. Doubles cost but significantly reduces error rate.

4. **N-gram overlap with OCR:** If using OCR + LLM, compare the LLM's extracted text against the raw OCR output. High overlap = the LLM is reading what's there. Low overlap = the LLM may be hallucinating.

5. **Historical accuracy tracking:** Log extraction results and manual corrections over time. Build per-carrier, per-field accuracy metrics. Use these to set carrier-specific confidence thresholds.

**Recommended V1 approach:** Self-reported confidence + validation-based confidence. Route anything with a failed VIN check digit, invalid date, or non-standard coverage amount to human review.

---

## 7. Build vs Buy Recommendation

### 7.1 Option Analysis

| Option | Description | Est. Implementation Time | Monthly Cost at 2,000 docs/mo | Accuracy (est.) | Maintenance |
|---|---|---|---|---|---|
| **A: Canopy Connect DecSight** | Buy their API. Upload docs, get structured data. | 2-4 weeks (integration only) | $4,000-$10,000 (est. $2-$5/doc) | 90-95%+ (their claim) | Vendor-managed |
| **B: Sensible API** | Buy their API. Configure extraction schemas. | 3-6 weeks (config + integration) | $1,000-$1,500 ($0.50/doc) | 90-95% | Schema maintenance |
| **C: LLM Vision (Direct)** | Build pipeline: upload -> LLM vision -> validation -> output | 4-8 weeks (build pipeline + validation) | $40-$120 (LLM API costs) | 90-97% (varies by field) | Prompt tuning, validation rules |
| **D: Cloud OCR + LLM** | Build pipeline: upload -> Textract/Google OCR -> LLM structuring -> validation | 6-10 weeks (more complex pipeline) | $200-$500 (OCR + LLM costs) | 92-97% | Pipeline maintenance |
| **E: Hybrid Buy+Build** | Use Sensible/Canopy for extraction + custom validation layer | 4-8 weeks | $1,000-$5,000+ | 93-98% | Moderate |

### 7.2 V1 Recommendation: Option C (LLM Vision Direct) with Option B (Sensible) as Backup

**Primary recommendation: Build an LLM Vision pipeline (Option C)**

Rationale:
1. **Cost:** 10-50x cheaper per document than insurance-specific vendors at our volume.
2. **Flexibility:** We own the extraction schema and can tune prompts for our specific PL Rater field mapping.
3. **Speed of iteration:** Prompt changes deploy instantly. No vendor support tickets.
4. **Carrier coverage:** Works on ANY carrier's dec page, including non-standard/niche carriers that vendors may not support.
5. **Quality is sufficient for V1:** 90-97% field-level accuracy is acceptable when combined with:
   - Validation rules (VIN check digit, date validation, coverage range checks)
   - Customer confirmation of critical fields in the smart form
   - Human review queue for low-confidence extractions
6. **Implementation time (4-8 weeks)** is competitive with buy options after accounting for integration and testing.

**Implementation approach for Option C:**

- **Model choice V1:** GPT-4o or Claude Sonnet 4.5 (best accuracy). Use GPT-4o-mini or Claude Haiku as fallback for cost optimization on clear digital PDFs.
- **Pipeline:** Upload -> preprocessing -> LLM vision extraction (schema-first prompt) -> validation -> confidence routing -> PL Rater schema mapping
- **Validation layer:** VIN check digit, NHTSA VIN decode, date validation, coverage limit range validation, address standardization
- **Human review:** Flag documents where any critical field has low confidence. Display side-by-side: original image + extracted data. Allow agent correction.
- **Iteration:** Track accuracy per carrier, per field. Tune prompts for problem carriers. Add carrier-specific hints for top-volume carriers.

**Backup plan:** If LLM Vision accuracy is insufficient after 4 weeks of tuning, pivot to **Sensible (Option B)** as a developer-friendly vendor solution. Sensible's per-document pricing ($0.50) and developer-first API make it the best buy option for our scale and technical team.

**Why NOT Canopy Connect DecSight for V1:**
- Cost ($2-$5/doc estimated) is 40-100x more than LLM Vision at our volume
- Pricing is opaque and requires sales engagement
- We lose control over extraction schema and tuning
- Good to evaluate for V2/V3 if our own accuracy plateaus

### 7.3 Accuracy Targets

| Phase | Field-Level Accuracy Target | Document-Level Accuracy Target | Human Review Rate |
|---|---|---|---|
| **V1 (MVP)** | 90%+ per field | 80%+ (all critical fields correct) | 30-40% of documents flagged for review |
| **V2 (3 months)** | 95%+ per field | 90%+ | 15-20% flagged |
| **V3 (6 months)** | 97%+ per field | 95%+ | 5-10% flagged |

"Document-level accuracy" means ALL critical fields (insured name, VIN, coverage limits, carrier, policy number) are correctly extracted. A single wrong VIN character counts as a document-level failure.

At V1, an 80% document-level accuracy rate means 20% of dec pages need some manual correction. This is still dramatically faster than 100% manual entry. Combined with the smart form (where customers confirm/correct key fields), the effective accuracy approaches 99%.

### 7.4 Cost Model

**Assuming 2,000 dec pages/month at V1 (growing to 5,000/month by V2):**

| Cost Category | Option C (LLM Vision) | Option B (Sensible) | Option A (Canopy) |
|---|---|---|---|
| LLM API costs | $40-$120/mo | Included | Included |
| Vendor subscription | $0 | $1,499/mo (Scale plan) | Est. $4,000-$10,000/mo |
| Engineering build (one-time) | 160-320 hours (~$30K-$60K) | 60-120 hours (~$12K-$24K) | 40-80 hours (~$8K-$16K) |
| Ongoing maintenance | 10-20 hrs/mo | 5-10 hrs/mo | 2-5 hrs/mo |
| **Total Year 1 Cost** | **$35K-$65K** | **$30K-$42K** | **$56K-$136K** |
| **Per-doc cost (steady state)** | **$0.02-$0.06** | **$0.47-$0.67** | **$2-$5** |

Option C has higher upfront engineering investment but dramatically lower per-document costs that compound over time as volume grows. At 5,000+ docs/month, Option C costs $100-$300/month in API fees vs $2,500+ for Sensible and $10,000+ for Canopy.

### 7.5 Implementation Timeline

**Option C (LLM Vision) -- Recommended:**

| Week | Milestone |
|---|---|
| 1-2 | Design extraction schema (map to PL Rater fields). Build upload pipeline (S3, preprocessing). Prototype prompt with 10-20 sample dec pages. |
| 3-4 | Build validation layer (VIN check digit, date validation, coverage range checks). Build confidence scoring. Test on 50+ dec pages across 10+ carriers. |
| 5-6 | Build human review UI (side-by-side doc image + extracted data, correction interface). Build PL Rater schema mapping. |
| 7-8 | Integration testing with smart form and portal. Accuracy tuning on real customer uploads. Carrier-specific prompt hints for top 5 carriers. |
| 8+ | Launch V1 in production. Monitor accuracy. Iterate on prompts and validation rules. |

---

## Summary of Key Recommendations

1. **Build an LLM Vision pipeline for V1.** Use GPT-4o or Claude Sonnet 4.5 with schema-first prompts. Cost: ~$0.02-$0.06 per document.

2. **Invest heavily in the validation layer.** VIN check digit, NHTSA decode, date validation, coverage range checks, and address standardization are what turn 90% raw LLM accuracy into 97%+ effective accuracy.

3. **Build a human review queue from day 1.** Show the original document alongside extracted data. Let agents correct errors. Use corrections to improve prompts.

4. **Combine dec page parsing with the smart form.** When extraction confidence is low on specific fields, push those fields to the smart form for customer confirmation. This makes the overall system self-correcting.

5. **Keep Sensible as the backup buy option.** If building proves too slow or accuracy plateaus, Sensible at $0.50/doc is the best developer-friendly vendor alternative.

6. **Canopy Connect DecSight for evaluation, not V1.** Their carrier coverage and insurance expertise are valuable, but the cost and opacity make them a better V2/V3 option after we understand our volume and accuracy needs.

7. **Complement with Fenris Digital** (data enrichment, not doc parsing) for fields that don't appear on dec pages (property construction details, roof age, demographic data).

---

*Research conducted 2026-02-10. Pricing and capabilities subject to change. All vendor pricing estimates should be verified via direct vendor conversations before commitment.*
