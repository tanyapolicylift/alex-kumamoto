## Product Requirements Document: Personal Lines Cycle Time Compression – Customer Communication Layer

### 1. Problem Statement

Personal lines quoting (especially auto and home) often requires multiple back‑and‑forth cycles between agency and customer to collect sufficient data for a rater (TurboRater, PL Rater, EZ Rater, Applied, etc.). This creates multi‑cycle workflows (initial contact → data collection → follow‑up → more data → final quote).

The specific sub‑problem in scope for this PRD:

> Compress the communication between agency and end‑customer such that quote‑critical data is collected in as close to a single cycle as possible, for personal lines (initially auto and home), via structured, automated interactions (text, email, forms, deck‑page upload, etc.).

This PRD **only** covers the customer communication and data‑capture surface (post‑call and async flows), not the internal rater/browser automation.

---

### 2. Goals & Non‑Goals

#### 2.1 Goals

1. **Reduce cycles** between initial lead contact and “quote‑ready dataset”:
    - Target: move from current multi‑cycle back‑and‑forth to **one cycle** in as many cases as possible.
2. **Automate follow‑ups** so that producers/CSRs are not manually chasing customers for missing data.
3. **Offer multiple customer input channels**, but with a clear prioritized stance (not “do everything blindly”).
4. **Increase completion rate and data quality** for required quote fields for personal auto and home.
5. **Integrate tightly with raters’ data needs** (TurboRater, PL Rater, EZ Rater, Applied, etc.) so that captured data maps cleanly to quote required fields.

#### 2.2 Non‑Goals

- Not implementing full browser automation to raters (covered in separate PRD).
- Not implementing full end‑to‑end servicing workflows (COIs, endorsements, etc.).
- Not building full marketing automation (drip campaigns, newsletters).
- Not solving for commercial lines in v1.
- Not building full, general‑purpose CRM.

---

### 3. Scope

#### 3.1 In Scope (v1)

1. **Triggering post‑interaction workflows**
    
    - Triggered when:
        - A voice agent or human call ends with _insufficient data_ for quoting.
        - A web/chat interaction ends with partial data.
    - System generates a **structured “missing data” profile** and spins up async communication.
2. **Outbound communication channels**
    
    - **SMS (primary)**:
        - For customers where we have a mobile number (almost always).
        - Texts containing:
            - Short explanation of what’s needed.
            - One or more links (smart form, deck‑page upload).
            - Optionally, allow direct text reply for simple fields.
    - **Email (secondary)**:
        - When email address is available.
        - Email with same content as SMS: explanation + links.
    - **Channel fallback logic**:
        - If only phone: SMS only.
        - If phone + email: both, but SMS is the “primary ask”.
        - If only email: email only.
3. **Input modalities for customers**
    
    - **Smart Form (structured web form)**
        - Dynamically generated form based on missing fields for:
            - Personal auto.
            - Personal home.
        - Mobile‑first design.
        - Field types: text inputs, selects, multi‑selects, date pickers, upload fields.
        - Support multi‑line quoting (e.g., multiple vehicles, multiple drivers, multiple properties).
    - **Deck‑page uploader**
        - Simple UX for uploading:
            - Auto deck pages.
            - Home policy declarations.
        - Supports:
            - PDF, images (JPG/PNG/HEIC).
        - Hooks into back‑end parsing/OCR/LLM extraction (not fully scoped here, but interface must be ready).
    - **Direct reply via SMS/email**
        - For **simple follow‑ups** (low field cardinality) such as:
            - “What’s your email address?”
            - “What’s the VIN of your car?”
        - The system parses replies and populates structured fields.
4. **Reminder cadence**
    
    - Configurable but opinionated default:
        - Initial message at **t = 0** (right after call/interaction).
        - Reminder **every 72 hours**, max N attempts (e.g., N=3).
    - Stop reminders when:
        - All required data collected.
        - Customer opts out / replies with “stop” or similar.
    - Track:
        - Delivered / bounced.
        - Click‑through on links.
        - Form start / completion.
        - Upload completion.
5. **Data modeling & mapping**
    
    - Internal “quote requirement” schemas for:
        - **Auto**: driver info, vehicle info (VIN, year/make/model), garaging address, prior insurance, violations, etc.
        - **Home**: property address, occupancy, construction details, coverage limits, prior claims, etc.
    - Mapping of:
        - Call/chat‑captured data → internal schema.
        - Form fields / SMS responses / deck‑page extracted data → internal schema.
    - “Missingness engine”:
        - Given internal schema + rater requirements:
            - Returns a **list of missing fields** and associated priority/importance.
            - Drives what questions we ask in follow‑ups.
6. **Internal agency experience**
    
    - Per‑lead “Quote Readiness” view:
        - Which fields are present.
        - Which fields are missing.
        - Status of outbound communications (sent, opened, completed).
        - Links to:
            - The completed smart form.
            - Uploaded deck pages.
    - Ability to see **raw customer responses** (SMS/email) alongside parsed structured data.

---

### 4. Users & Personas

#### 4.1 End Customer

- A consumer seeking a **personal auto or home** quote.
- May have initiated contact via:
    - Voice agent.
    - Human phone call.
    - Website lead form.
- Behaviors:
    - Often on mobile.
    - Low tolerance for long, complex forms.
    - May have deck pages available, but may not understand what they are or where to get them.
    - Response preferences (text vs email) vary; we must test.

#### 4.2 Agency Persona (Producer / CSR)

- Works at agencies like:
    - Jamco, Folco, Seguros, Lei, Alt Texas, Venture Casualty, CoverLink, etc.
- Needs:
    - To **reduce manual chasing** for missing data.
    - To get **quote‑ready data** packaged for their rater.
    - Visibility into whether follow‑ups are working.
    - Ability to override / augment automated interactions when needed.

#### 4.3 Internal Ops / Product

- Needs:
    - To experiment with different outreach strategies (content, cadence, channel mix).
    - To measure which patterns actually **reduce cycle time** and **increase completion**.

---

### 5. Detailed Functional Requirements

#### 5.1 Triggering Logic

1. **Missing Data Computation**
    
    - Input:
        - Call/chat transcript + structured fields already captured.
        - Product type (auto/home).
        - Target rater(s) for this agency.
    - Logic:
        - Compute internal schema object for the quote.
        - Identify missing fields **relative to the target rater’s minimum viable inputs** (MVP for a workable quote, not necessarily every optional field).
    - Output:
        - `MissingDataProfile`:
            - Product: auto/home.
            - Rater: TurboRater / PL Rater / EZ Rater / Applied / generic.
            - Required fields (blocking quote).
            - Recommended fields (nice to have).
            - Confidence levels if any partial info is inferred.
2. **Trigger Conditions**
    
    - If `MissingDataProfile.requiredFields.length > 0`, create a **Communication Job**:
        - Contains:
            - Lead/customer identifiers.
            - Contact methods (phone, email).
            - Missing fields.
            - Product type.
            - Rater context.

#### 5.2 Messaging Orchestration

1. **Channel Decision**
    
    - Rules:
        - If **phone only**: send SMS.
        - If **email only**: send email.
        - If **phone + email**: send both, but:
            - SMS content is short and contains primary CTA.
            - Email can have slightly richer explanation and backup CTAs.
2. **Content Generation**
    
    - Messages must:
        - Thank the customer for reaching out / calling.
        - Clarify the value: “To finish your quote before we call you back, we just need a few details.”
        - Clearly enumerate what’s needed, but in digestible form.
    - Example SMS structure (not exact wording binding):
        - “Thanks for contacting [Agency]. To finish your auto quote, we need: (1) VIN(s), (2) driver details. Tap to complete: [Smart Form Link]. If you have a deck page, you can upload it here: [Upload Link].”
    - Example Email structure:
        - Brief intro.
        - Summary of missing items.
        - Two buttons:
            - “Complete secure form”
            - “Upload your current policy (deck page)”
3. **Dynamic Question Bundling**
    
    - Use `MissingDataProfile` to:
        - Prioritize questions that are **most quote‑blocking**.
        - Group related questions into sections:
            - Contact basics.
            - Vehicles.
            - Drivers.
            - Property.
            - Coverages.
    - If **only one or two simple fields** missing (e.g., email, VIN):
        - Prefer a direct question in SMS/email body:
            - “What’s the VIN of your car?” and parse reply.
        - Optionally still include a form link as backup.
4. **Reminders**
    
    - For each Communication Job:
        - Maintain state:
            - `pending`, `in_progress`, `completed`, `abandoned`.
        - Schedule reminders:
            - Default: at 72h intervals, up to 3 attempts.
        - Reminder content:
            - Shorter messaging.
            - Clear reference to initial request.
        - Stop conditions:
            - Customer completed form / upload.
            - Customer responded with requested fields via free‑text.
            - Customer opted out (“STOP”) or complaint flagged.

#### 5.3 Smart Form UX/Logic

1. **Form Generation**
    
    - Input:
        - `MissingDataProfile`.
    - Output:
        - A mobile‑friendly form tailored to:
            - Product type (auto vs home).
            - Missing fields only.
    - Requirements:
        - If we already have some data (e.g., name, phone, address), prefill and lock or show but non‑editable, based on agency preference.
        - Support multiple entities:
            - Multiple vehicles (repeatable sections).
            - Multiple drivers.
            - Multiple properties.
2. **Field Behavior**
    
    - Field types:
        - Text / numeric fields (name, VIN, mileage).
        - Dropdowns (state, coverage options).
        - Date pickers (DOB, license issue date).
        - Yes/No toggles (prior claims, prior insurance).
    - Validation:
        - VIN field length and character validation.
        - Address format basic validation.
        - DOB not in the future, age > minimum.
    - Progressive disclosure:
        - Don’t overwhelm; show sections stepwise.
        - Ability to save progress and resume.
3. **Multi‑Line Handling**
    
    - Auto:
        - Add vehicle button.
        - Add driver button.
    - Home:
        - Support at least primary dwelling; multi‑property support can be incremental.
    - **Required vs Optional**:
        - Highlight must‑have vs nice‑to‑have.
        - Allow partial submission if customer abandons halfway; still capture incremental value.
4. **Confirmation & Next Steps**
    
    - After submission:
        - Show simple confirmation:
            - “Thanks, we’ve received your info. We’ll finalize your quote and reach out.”
        - Optionally show:
            - “If we need anything else, we’ll contact you by [text/email].”

#### 5.4 Deck‑Page Upload UX/Logic

1. **Upload Flow**
    
    - Simple page accessible via unique link.
    - Steps:
        - Explain what a deck page is in plain language.
        - Allow:
            - Take photo (mobile camera).
            - Upload file (PDF/image).
    - Support multiple uploads (front/back; multiple docs).
2. **Association**
    
    - Every upload automatically tied to:
        - Customer/lead.
        - Product (auto/home).
    - Metadata:
        - Upload timestamp.
        - File type.
        - Source (SMS link, email link).
3. **Parsing Hook**
    
    - On successful upload:
        - Enqueue a “DeckPageParsingJob” with:
            - File reference.
            - Product type.
        - Parsing system extracts:
            - Policyholder name.
            - Vehicles + VINs.
            - Property address and coverage amounts.
            - Prior insurer, limits, etc.
    - Extracted fields mapped to internal schema and marked as:
        - `extracted_from_deck_page = true`.
4. **Fallback**
    
    - If parsing fails:
        - At minimum, surface the raw doc to agency for manual reference.
        - Optionally trigger a manual review queue.

#### 5.5 SMS/Email Reply Parsing

1. **Simple Field Collection**
    
    - For targeted questions (single field):
        - E.g., “Reply with your VIN.”
    - Parsing:
        - Regex and LLM‑assisted parsing to identify:
            - VIN(s).
            - Email address.
            - DOB.
    - Attach parsed values to lead schema.
2. **Multi‑Field Replies**
    
    - For uncommon but possible multi‑field replies:
        - E.g., “2018 Toyota Camry, VIN X, 12k miles/year.”
    - Use LLM parsing to chunk into fields where feasible.
3. **Error Handling**
    
    - If parsing uncertain:
        - Mark as “needs review” but still show raw response to agency.
    - Don’t loop customer in complex validation back‑and‑forth via text; we prefer smart form for complex corrections.

---

### 6. Data Model Requirements

#### 6.1 Core Entities

- **Lead / Contact**
    - `id`, `name`, `phone`, `email`, `preferred_channel?`
- **QuoteIntent**
    - `id`, `lead_id`, `product_type` (auto/home), `rater_type`, `created_at`
- **FieldSchema**
    - For each product & rater:
        - `field_key`, `description`, `required_level` (required/recommended/optional), `data_type`
- **CapturedField**
    - `quote_intent_id`, `field_key`, `value`, `source` (call, smart_form, sms_reply, deck_page, manual), `confidence`
- **MissingDataProfile**
    - `quote_intent_id`, lists of missing required/recommended fields at a point in time.
- **CommunicationJob**
    - `id`, `quote_intent_id`, `status`, `channel_config`, `created_at`, `completed_at`
- **CommunicationEvent**
    - `job_id`, `type` (sms_sent, sms_delivered, email_sent, email_opened, form_started, form_submitted, upload_completed), `timestamp`, metadata.

---

### 7. Metrics & Success Criteria

1. **Primary Metrics**
    
    - **Cycle Time to Quote‑Ready**:
        - Time from first contact to “quote‑ready dataset” status.
        - Goal: significant reduction vs current baseline; aspirational: **one cycle**.
    - **Completion Rate of Follow‑ups**:
        - % of Communication Jobs that result in all required fields captured.
    - **Quote Conversion Lift**:
        - % of quote‑ready leads that receive an actual quote vs baseline.
2. **Secondary Metrics**
    
    - Channel engagement:
        - SMS click‑through rate.
        - Email open/click‑through rate.
    - Form metrics:
        - Start‑to‑completion rate.
        - Average time to complete.
    - Deck‑page:
        - % of flows where deck page is used.
        - Parsing success rate.
    - Producer time saved (qualitative, via interviews).

---

### 8. Constraints, Risks, Open Questions

#### 8.1 Constraints

- SMS and email compliance (opt‑in/opt‑out, TCPA, CAN‑SPAM).
- Quality of initial lead data (often missing email).
- Variability in rater requirements (per line, per carrier).

#### 8.2 Risks

- **Over‑choice / complexity**:
    - If we provide too many options at once (form + upload + reply), customers might stall.
- **Channel mismatch**:
    - Some customers may strongly prefer one channel and ignore others.
- **Deck‑page parsing reliability**:
    - Low accuracy could erode agent trust.

#### 8.3 Open Questions

1. **Channel Prioritization**:
    - Do we always bundle form + upload together, or A/B test:
        - Form‑first vs deck‑first vs mixed?
2. **Text vs Email**:
    - For customers with both:
        - Should we ever _only_ use SMS or _only_ email based on profile?
3. **Agency Configuration vs Opinionation**:
    - How much configurability do we allow for:
        - Cadence.
        - Templates.
        - Which modalities are exposed?
4. **Localization**:
    - For Spanish‑heavy books (e.g., Seguros, Folco):
        - How soon do we support bilingual templates and forms?

---

### 9. Phased Implementation Plan

#### Phase 1: Foundations (Auto Only, SMS + Smart Form)

- Implement:
    - Internal auto quote schema.
    - MissingDataProfile engine for auto.
    - SMS‑triggered CommunicationJob.
    - Auto‑tailored smart form for missing fields.
    - Basic reminder cadence (72h, up to 3).
    - Basic agency view of communication status.
- Limit:
    - English‑only.
    - No deck‑page parsing (upload may be stubbed or skipped).
    - Minimal email support.

#### Phase 2: Deck‑Page & Email

- Add:
    - Deck‑page upload flow and parsing hook.
    - Email channel parity.
    - Better question bundling (simple vs complex flows).
- Start:
    - A/B tests on:
        - Form vs deck vs both.

#### Phase 3: Home + Optimization

- Extend:
    - Internal schemas to home.
    - Smart forms and missingness engine to home.
- Optimize:
    - Channel strategies based on data from real agencies (Jamco, Folco, Seguros, Lei, etc.).
    - Content templates and cadences to maximize completion and minimize cycles.

---

### 10. Validation Plan

- **Pre‑build discovery**:
    - Analyze existing quote calls from:
        - Jamco, Folco, Seguros, Lei, Alt Texas, etc.
    - For each call:
        - Determine how “quote‑ready” the data is.
        - Identify common missing fields by line (auto vs home).
- **Design partner pilots**:
    - Run pilots with:
        - Jamco (TurboRater).
        - Seguros + Lei (PL Rater, auto first).
        - Alt Texas / Venture Casualty (EZ Rater) as available.
    - Measure:
        - Time to quote‑ready before vs after.
        - Producer satisfaction.
        - Customer completion rates.

---

This PRD covers the communication and data‑collection layer needed to compress personal lines cycle time, with explicit focus on the **email / text / form / deck‑page** design space and how to structure it into a coherent, opinionated product.