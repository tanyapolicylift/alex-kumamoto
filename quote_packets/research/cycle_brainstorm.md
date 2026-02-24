# Cycle Time Compression: Top 10 Feature Brainstorm

Synthesized from [[context_plrater_home_auto]], [[context_general]], and [[cycle_prd]].

---

## A. Intake & Extraction (Getting data in from existing sources)

- **1. Voice-to-Structured-Data Extraction** — Parse call transcripts (voice agent or human) to auto-extract structured quote fields: names, DOBs, addresses, VINs, vehicles, driver details, coverage preferences, incident history. This seeds the data model *before* any follow-up happens, meaning the customer never gets asked something they already said on the phone. The bigger the seed, the fewer follow-up fields, the shorter the cycle.

- **2. Deck Page Upload + AI Parsing** — Simple mobile-friendly upload flow (snap a photo or attach a PDF) for auto dec pages and home policy declarations. Back-end LLM/OCR extraction pulls out policyholder info, VINs, vehicles, property address, coverage limits, prior carrier, claims history. Even a mediocre parse with human review beats manual re-entry and gives us the richest single-document source of truth for a re-shop.

- **3. Dynamic Smart Form (customer-facing)** — Mobile-first web form generated from only the *missing* fields for this specific lead, pre-filled with anything we already know (from voice or deck page). Progressive disclosure (step-by-step sections: drivers, vehicles, property, coverages), support for multi-entity (add driver / add vehicle), and the ability to save-and-resume so partial submissions still capture incremental value.

## B. Intelligence Layer (Making sense of what we have and what we need)

- **4. Missingness Engine** — Given the structured data we've captured so far (from any source) and the target rater's minimum viable inputs, compute and rank a prioritized list of missing fields. Distinguishes "quote-blocking required" from "nice-to-have recommended." This is the brain that drives every downstream decision: what the smart form asks, what the SMS says, what the dashboard shows.

- **5. Field Dependency & Prefill Intelligence** — An LLM-aware rules layer that understands the conditional logic baked into PL Rater workflows. Examples: if state = CA, suppress credit score fields and flag Good Driver eligibility; if homeowner = yes, surface multi-policy discount on auto side; if roof age > 15 in TX, warn agent about likely ACV-only carriers; if commute < 3 miles, note short-commute discount opportunity. Can prefill, flag, and warn — turning domain knowledge from the context docs into active guidance.

## C. Customer Communication (Getting the remaining data)

- **6. Automated Follow-Up Orchestration** — Post-interaction trigger that fires when the missingness engine detects gaps. Generates and sends an initial SMS (primary) and/or email with a personalized explanation of what's needed, a smart form link, and an upload link. Manages a reminder cadence (default: every 72h, up to 3 attempts). Tracks delivery, opens, clicks, form starts, completions, and uploads. Stops when data is complete or customer opts out.

- **7. Conversational SMS Collection** — When only 1-2 simple fields are missing (VIN, email, DOB), skip the form entirely and ask the question directly in a text message. LLM-assisted parsing extracts the answer from the customer's free-text reply and populates the structured field. Lower friction than opening a link for the easy cases.

- **8. Bilingual Support (English + Spanish)** — Templated messages, smart forms, and upload instructions in both English and Spanish, auto-selected based on customer language preference or agency configuration. Critical for agencies like Seguros, Folco, and Lei where a large share of the book is Spanish-speaking. Without this, completion rates will crater for a meaningful segment.

## D. Agency Experience (Visibility and output)

- **9. Quote Readiness Dashboard** — Per-lead view showing: which fields are captured and from what source (call, form, deck page, SMS), which fields are still missing and how critical they are, communication status (sent / opened / form started / completed), links to the completed smart form and uploaded documents, and raw customer replies alongside parsed structured data. Gives producers/CSRs a single pane to know exactly where every lead stands without digging.

- **10. Smart Rater Prefill / Copy-Paste Assist** — Once a lead hits "quote-ready," package the structured data for the agency's target rater (TurboRater, PL Rater, EZ Rater, Applied). Lightest version: an organized, copy-pasteable summary grouped by rater section (Client Info, Drivers, Vehicles, Incidents, Coverages). Next level: a Chrome extension that maps fields and auto-fills the rater UI. This closes the loop — data goes from customer to rater without the producer re-typing 40 fields.
