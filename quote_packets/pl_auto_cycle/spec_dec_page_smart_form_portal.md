# Spec: Dec Page Uploader, Smart Form & Link-Based Portal

References: [[cycle_spec]], [[cycle_brainstorm]], [[cycle_prd]], [[context_plrater_home_auto]]

---

## Purpose

These are the **customer-facing input surfaces** where end-customers provide the remaining quote data that wasn't captured during the initial interaction. They share a common delivery mechanism (a link sent via SMS/email or presented mid-interaction) and a common goal (get structured data into our system). This spec covers the three modalities, how they connect, and how they're introduced to the customer.

---

## 1. Dec Page Uploader

### What It Is

A minimal upload flow where the customer submits their current insurance declaration page (auto or home). This is the single richest document for re-shop scenarios — a dec page contains prior carrier, policy number, coverage limits, vehicles/VINs, drivers, property details, premium, and claims summary.

### UX Flow

1. Customer taps link from SMS/email → lands on a mobile-friendly upload page.
2. Page explains in plain language: "Upload a photo or PDF of your current insurance policy summary (your 'declarations page'). It's usually 1-2 pages and shows your coverages and vehicles/property."
   - Include a visual example (annotated screenshot of what a dec page looks like).
   - Optional "Where do I find this?" expandable section: "Check your email from your current insurer, your online account, or your insurance app."
3. Customer either:
   - **Takes a photo** (mobile camera opens directly).
   - **Uploads a file** (PDF, JPG, PNG, HEIC).
4. Support multiple uploads (front/back pages, separate auto + home docs).
5. Confirmation screen: "Got it! We're reviewing your info now. We'll reach out if we need anything else."
6. If we can parse quickly (< 30 sec), show a confirmation of what we extracted: "We found: 2019 Honda Civic, VIN ending in ...9186, current coverage 100/300/100. Does this look right?" with a confirm/edit option.

### Technical: Declaration Page Parsing

This is the core technical challenge. Dec pages vary wildly by carrier — different layouts, formats, terminology.

**Key questions for research subagent:**
- What fields appear on a typical personal auto dec page? What fields appear on a typical home dec page? Map these to our quote schema.
- How much do dec page layouts vary across the ~15-20 carriers common in CA, TX, OH, FL?
- What's the state of the art for insurance document parsing?

**Build vs Buy for OCR / Parsing:**

| Approach | Examples | Pros | Cons |
|---|---|---|---|
| General OCR + LLM | Tesseract/Google Vision + GPT-4/Claude | Flexible, handles novel layouts, improving fast | May hallucinate on messy docs, needs validation |
| Insurance-specific document AI | Canopy Connect (has dec parsing), Fenris, Planck, Indico Data | Purpose-built for insurance docs, higher accuracy | Vendor dependency, cost per parse, may not cover all carriers |
| Template-based OCR | Custom templates per carrier layout | Highest accuracy for known layouts | Doesn't scale — new carrier = new template. Maintenance burden |
| Hybrid: LLM with carrier-specific hints | LLM parsing with a library of carrier layout hints | Balances flexibility with accuracy | Still needs tuning, but less rigid than templates |

**Recommendation**: Start with **General OCR (Google Vision or AWS Textract) + LLM extraction** for V1. The LLM can handle layout variation better than templates. Validate parsed fields against known schema constraints (VIN length, date formats, coverage limit ranges). Flag low-confidence extractions for human review. Evaluate Canopy Connect's parsing as a potential upgrade path (see Data Enrichment spec).

### Implementation Considerations

- **File handling**: Accept PDF, JPG, PNG, HEIC. Convert HEIC → JPG server-side. Max file size ~20MB.
- **Storage**: S3 or equivalent. Retain originals for audit/reprocessing. Apply retention policy.
- **Processing pipeline**: Upload → store → OCR → LLM extraction → schema mapping → confidence scoring → write to CapturedField.
- **Turnaround time**: Ideally < 60 seconds for the customer to see confirmation. Batch/async is fine for agency-side — they'll see results on the dashboard.
- **Error handling**: If parsing fails completely → surface raw doc to agency for manual review. Don't lose the upload.

---

## 2. Smart Form

### What It Is

A dynamically generated, mobile-first web form that asks only for the fields still missing for this specific lead. Pre-filled with any data we already have (from voice, dec page, enrichment). Progressive disclosure to avoid overwhelming the customer.

### UX Flow

1. Customer taps link → lands on a branded form page (agency logo, name).
2. Welcome step: "Hi [Name], we just need a few more details to finish your [auto/home] quote with [Agency]." Shows what we already have (name, address) as a confidence builder.
3. Step-by-step sections (only sections with missing fields shown):
   - **Drivers**: Name, DOB, license #, years licensed, relationship. "Add another driver" button.
   - **Vehicles**: Year/Make/Model or VIN, usage, annual mileage, ownership. "Add another vehicle" button.
   - **Property** (home only): Year built, sq ft, construction type, roof age/type, updates.
   - **Coverage preferences**: Current limits, desired limits (simplified choices, not raw numbers).
   - **History**: Any accidents/tickets in last 3 years? Any home claims in last 5 years? (Yes/No → conditional detail fields).
   - **Prior insurance**: Current carrier, years insured, prior limits.
4. Save-and-resume: If customer abandons mid-form, their partial data is saved. On return (same link), they pick up where they left off.
5. Submission: "Thanks! Your info has been received. [Agency] will be in touch with your quote."

### Implementation Considerations

- **Form framework**: Build with a dynamic form renderer (React + JSON schema, or a form builder like Feathery, Typeform, Formstack). The form definition is generated from the MissingDataProfile.
  - **Buy option**: Feathery has insurance-specific form templates and conditional logic. Could accelerate V1.
  - **Build option**: Custom React forms give us full control over UX, branding, and data flow.
- **Pre-fill**: Fields with known values are shown as read-only (or editable if we want the customer to confirm). Source indicated subtly: "From your call" or "From your uploaded policy."
- **Validation**: Client-side + server-side. VIN check digit validation. Address autocomplete (Google Places). Date sanity checks.
- **Multi-entity UX**: Adding multiple drivers/vehicles is the trickiest UX challenge. Keep it simple — one entity at a time, clear "Add another" affordance, ability to remove.
- **Partial submission**: Every field save sends data to the backend incrementally (not just on final submit). This way, even if the customer drops off at step 3 of 5, we capture steps 1-2.
- **Bilingual**: Form must support English and Spanish. Language selector at top, or auto-detect from the SMS/email language.
- **Branding**: Agency logo, colors, name. Minimal but trustworthy — customers are sharing sensitive info (SSN for some carriers, DL#, DOB).
- **Security**: HTTPS, no local storage of sensitive fields, consider SOC2 implications if handling SSN/DL.

### Estimated Complexity

- If using Feathery or similar: **2-3 weeks** to configure forms, set up dynamic rendering from MissingDataProfile, and build the pre-fill integration.
- If building custom: **4-6 weeks** for form renderer, validation, multi-entity support, save-and-resume, bilingual, branding.
- Shared regardless: API integration with MissingDataProfile engine, CapturedField writes.

---

## 3. Link-Based Portal

### What It Is

A single branded link/page that serves as the customer's "hub" for completing their quote. Instead of receiving separate links for the form and the uploader, the customer gets one link that presents both options (and potentially more in the future).

### UX Flow

1. Customer taps link → lands on a simple portal page.
2. Page shows:
   - Agency branding.
   - "Hi [Name], here's what we need to finish your [auto/home] quote."
   - Summary of what we already have (builds confidence: "we captured your name, address, and vehicle from our call").
   - **Two clear CTAs**:
     - "Fill out a quick form" → opens Smart Form.
     - "Upload your current policy" → opens Dec Page Uploader.
   - Optional third CTA (future): "Connect your insurance account" → Canopy Connect flow.
3. Status indicators: If customer has already completed the form or uploaded, show a checkmark. If they return later, they see what's done and what's still needed.

### Why a Portal vs Separate Links

- **Reduces cognitive load**: Customer gets one link, not two.
- **Adaptive**: If the customer uploads a dec page and it fills most fields, the portal can update to show "Just 2 more fields needed" and link to a much shorter form.
- **Extensible**: We can add new modalities (Canopy Connect, ID verification, etc.) without changing the SMS/email content.

### Implementation Considerations

- Lightweight: This is essentially a landing page that reads the lead's current MissingDataProfile and renders the right options.
- Unique per lead: URL contains a token (e.g., `https://portal.[domain].com/q/abc123`).
- Expiry: Links should expire after a configurable period (e.g., 30 days) for security.
- Mobile-first: 80%+ of traffic will be mobile (from SMS links).

---

## 4. Introduction Methods: How Do We Get the Link to the Customer?

### Via Engaged ToF Hook (Mid-Interaction)

**During a call (voice agent or human):**
- Voice agent: "I'm going to text you a link right now so you can upload your current policy or fill in a few more details at your convenience."
- Human producer: clicks a button in the dashboard to trigger an SMS with the portal link mid-call.
- **Key UX**: The customer hears about the link while still engaged. Much higher completion rate than a cold follow-up later.

**During a chat:**
- Chatbot: "I can get you a quick quote! While we chat, here's a link where you can upload your current policy or fill in details: [Portal Link]"
- Embed the uploader/form directly in the chat widget (iframe or component) for zero-friction.

**During a web form:**
- After the customer submits a lead form (name, phone, basic interest), the confirmation page includes: "Want to speed up your quote? Upload your current policy here: [Upload Link]" or "Fill in a few more details: [Form Link]".

### Via SMS (Post-Interaction)

- See [[spec_sms]] for detailed flows. The portal link is the primary CTA in automated SMS follow-ups.
- Example: "Hi [Name], thanks for calling [Agency]! To finish your auto quote, tap here: [Portal Link]. Reply STOP to opt out."

### Via Email (Post-Interaction)

- See [[spec_email]] for detailed flows. The portal link appears as a button CTA in automated email follow-ups.
- Email can also include the two CTAs separately (form button + upload button) since there's more real estate.

### Timing Considerations

| Introduction Method | When | Expected Completion Rate | Notes |
|---|---|---|---|
| Mid-call SMS | During active call | **Highest** — customer is engaged, motivated | Requires real-time SMS trigger from call flow |
| Chat embed | During active chat | **High** — already in digital channel | Seamless if embedded; link if not |
| Form confirmation | Right after form submit | **Medium-High** — still engaged | Capitalize on momentum |
| Post-call SMS (immediate) | Within minutes of call end | **Medium** — still warm | The default post-interaction trigger |
| Post-call email | Within minutes of call end | **Medium-Low** — may not open immediately | Include as secondary channel |
| Reminder SMS (72h) | 3 days later | **Low-Medium** — attention has faded | Keep it short, reference the call |
| Reminder email (72h) | 3 days later | **Low** — easy to ignore | Different subject line, add urgency |

---

## 5. Open Questions & TODOs

- [ ] **TODO: Align with CX platform** — The portal page, smart form, and uploader should live within or be served by our customer experience platform. Need to understand the hosting, auth, and session model.
- [ ] **TODO: Align with AMS integrations** — When a customer submits form data or uploads a dec page, where does that data land? Our internal schema first, then synced to AMS? Or directly into the AMS?
- [ ] **TODO: Align with contact management** — The portal link is tied to a lead record. Need a unified lead/contact service that tracks portal visits, form progress, uploads.
- [ ] **TODO: Align with current conversational management** — If the smart form or uploader is embedded in a chat widget, how does that integrate with the existing chat/conversation platform?
- [ ] **Dec page carrier coverage analysis**: Which carriers' dec pages do we need to parse well for CA, TX, OH, FL personal auto and home? (Research subagent task.)
- [ ] **Form builder evaluation**: Evaluate Feathery vs custom build. Run a spike to test Feathery's dynamic form generation from JSON schema.
- [ ] **Security review**: Handling SSN, DL#, DOB, VIN via web forms — what are our security and compliance requirements? PCI-like? SOC2?
- [ ] **Analytics**: Implement full funnel tracking — link click → portal view → form start → form step N → form complete / upload complete. Critical for optimizing completion rates.

---

## 6. Research Questions (for subagent — Dec Page Focus)

1. **Declaration page field mapping**: For the top 15-20 personal auto carriers and top 15-20 home carriers in CA, TX, OH, FL — what fields appear on a typical declaration page? Create a mapping to PLRater quote fields.
2. **Declaration page format variation**: How much do formats vary across carriers? Are there common structural patterns (header/policy info section, vehicle/driver section, coverage section) even across different layouts?
3. **OCR / Document AI for insurance**: Compare Google Document AI vs AWS Textract vs Azure Form Recognizer vs Tesseract + LLM for semi-structured insurance document parsing. Accuracy benchmarks, pricing, setup complexity.
4. **Insurance-specific parsing vendors**: Deep dive on Canopy Connect's dec page parsing, Fenris, Planck, Indico Data, and any other vendors. What do they parse, accuracy claims, pricing model, integration complexity.
5. **LLM-based document extraction**: What's the current state of using GPT-4 Vision / Claude vision for insurance document extraction? Any published benchmarks or case studies? Prompt engineering patterns for structured extraction from dec pages.
