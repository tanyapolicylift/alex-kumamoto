# Email Automation — Changelog

Running log of brainstorm decisions, doc restructures, research artifacts, and client signal — reverse-chronological (newest first). Tag with `[brainstorm]`, `[docs]`, `[research]`, `[client-call]` so slices are grep-able.

For the brainstorm in progress, see [`concepts_working_doc.md`](concepts_working_doc.md). For research, see [`research_segment_builder_ux.md`](research_segment_builder_ux.md). For companion docs, see [`segments.md`](segments.md), [`templates.md`](templates.md), [`broadcasts.md`](broadcasts.md), and [`automations.md`](automations.md).

---

## 2026-05-27 — `[docs]` Fourth companion doc (short version): `automations.md`

Created [`automations.md`](automations.md) — fourth companion doc, intentionally a **starter / short version** at Martin's request. Captures the concepts we've aligned on so far without committing to schema, send pipeline, step-type implementation, or builder UX. Those land incrementally as decisions firm up.

### Why the short version

Automation is the heaviest of the four primitives (15 items under AU in the working doc concept map). Trying to write the full vision doc before we've actually onboarded a client on the simpler primitives would be premature — we don't yet know which Automation surfaces matter most in practice. The starter doc captures what's settled so it isn't lost, and lays out an explicit "still TBD" list so the unfinished work is visible.

### Structure

Non-technical only. Six parts of an Automation, entry trigger categories, enrollment policy (the "lock recipients?" question explained again), Segment reference, Sequence of Steps with PoC step types (email + wait + exit) and beyond-PoC step types flagged, exit conditions + re-enrollment rules, sender + recipient resolution (cross-referenced to Broadcast), pre-launch verification (cross-referenced to Broadcast), and the three concrete Marker PoC Automations (Cancellation by 2026-05-29, Welcome Kit + Renewal in ~2 weeks).

No "Implementation details" section. Instead a "What's settled vs what's still TBD" section that explicitly lists what's deferred: schema, send-pipeline integration, step-type semantics in detail, branching design, calendar-driven sub-pattern fit, approval mode, re-enrollment defaults, builder UX, per-Automation reporting, in-flight editing.

8 open questions at the bottom — most notably "is email + wait + exit really enough for PoC step types" (yes for Marker's three Automations; revisit as second-agency signal lands), the calendar-driven sub-pattern fit, and the Cancellation Automation Friday deadline practicalities.

### Decisions baked in

- **Three enrollment policies: at-launch / newly-entering / continuous.** Already in working doc; re-stated here.
- **PoC step types: email, wait, exit.** Other step types (SMS, postcard, branching, tag-add/remove, internal notification, action item, webhook) explicitly post-PoC.
- **One entry trigger per Automation at PoC.** Multi-trigger Automations probable long-term, deferred for now.
- **Linear Sequence ordering.** DAG / branching deferred until that step type lands.
- **Pre-launch verification = shared surface with Broadcast.**
- **Sender + recipient resolution = same chain + defaults as Broadcast**, with per-Automation and per-Step overrides allowed.
- **Stop-on-reply** likely yes for PoC since Resend already tracks replies.
- **Hidden-trigger anti-pattern** explicitly called out (surface entry trigger at the header, never bury in step list — observed in AR per Marker §12.1).

Working doc Companion docs + Reference section updated.

---

## 2026-05-27 — `[docs]` Third companion doc: `broadcasts.md`

Created [`broadcasts.md`](broadcasts.md) — third companion doc, same Fairs-style pattern. Permanent home for the Broadcast primitive in full detail.

### Major PoC simplification: send-now only

Decided by Martin: PoC ships **send-now only**. No schedule picker, no future datetime, no time zone choice, no quiet-hours guard. Scheduling is a real product surface (time zones, send-time optimization, per-recipient timezones, etc.) and a useful PoC can ship without it. Agencies compose Broadcasts and click send themselves when the moment arrives.

This collapses the status lifecycle to: **Draft → Sending → Sent** (plus Failed for whole-Broadcast dispatch errors; per-recipient failures are tracked on individual Send records inside an otherwise-Sent Broadcast). No Cancel state at PoC because there's no Scheduled state to cancel from.

Scheduling is captured as the headline beyond-PoC feature in the doc's Implementation details section.

### Structure

Non-technical first: prose intro, what a Broadcast is, the 5-step composition flow, **pre-send recipient verification** (the load-bearing UX — Ley/Marker requirement), send timing (PoC = send-now only), recipient resolution / fanout, sender resolution, drafts + status lifecycle, test sends, channels at PoC (email only), where Broadcasts fit alongside the other primitives.

Implementation details near the end: PoC schema for `broadcasts` and the shared `sends` runtime table (referenced by both Broadcasts and Automations), send pipeline (audience resolution → render → Resend dispatch → status tracking), recipient verification view, test-send mechanics, then beyond-PoC additions (scheduling, cancel-during-sending, A/B testing, follow-up to non-engaged, multi-channel coordination).

10 open questions at the bottom — most notably the Account-anchored fanout default (primary-contact at PoC, household-aware when Household entity ships), Broadcast/Segment pinning behavior when underlying changes mid-Draft, render-preview-on-demand vs up-front, persistent suppression vs per-Broadcast exclusion.

### Decisions baked into the doc that may need ratification

- **Send-now only at PoC.** Already-locked.
- **Status lifecycle: Draft → Sending → Sent / Failed.** No Cancel (until scheduling lands).
- **Fanout default for Account-anchored: primary contact** at PoC. Household-aware when Household ships.
- **Test-send renders against a real recipient** (Klaviyo / Mailchimp pattern), not a fixture.
- **`sends` is shared infrastructure** used by both Broadcasts and Automations. One table, two source-entity foreign keys (nullable `broadcast_id` and `automation_id`).
- **Bulk exclusions during verification persist to the Broadcast's audit trail only**, not to a contact-level "don't auto-market" flag. Persistent suppression is a separate, deliberate action via the consent layer.
- **No edits to Sent Broadcasts.** Re-running = duplicate.

Working doc Companion docs + Reference section updated.

---

## 2026-05-27 — `[docs]` Second companion doc: `templates.md`

Created [`templates.md`](templates.md) — second companion doc, same Fairs-style pattern as `segments.md`. Permanent home for the Template primitive in full detail.

Driven by a brainstorm turn on whether SMS and email templates should be different things. The answer that emerged: separate at the UX layer (different editors, validation, conventions per channel) but unified at the data model layer (one `templates` table with a `channel` discriminator and channel-shaped content). Mirrors what every mature marketing automation tool ships.

### Structure

Non-technical first: prose intro, what a Template is, per-channel breakdown (email primary at PoC; SMS / postcard / handwritten described but post-PoC), merge tokens with fallback semantics, agency-required template conventions (Marker's HawkSoft-ID-in-subject + visible-automation-indicator), brand assets inherited from agency settings, Templates-as-library-items with reuse + versioning concerns, where Templates fit alongside the other primitives with explicit non-overlaps.

Implementation details near the end: schema with channel discriminator + channel-shaped JSONB content, render pipeline for merge token substitution, convention enforcement, editor approach (Tiptap or similar for email), beyond-PoC versioning, per-channel content tables when JSONB becomes painful, snippets / partials, AI compose, approval workflow.

10 open questions at the bottom — most notably the email-only-vs-email-and-SMS-at-PoC choice (leaning email-only), merge token system formalization timing (tied to canonical field catalog), and required-conventions generalization (hardcode Marker now, generalize later).

### Decisions in the doc that may need ratification

- **Channel split posture** — separate editors, unified data model. Industry standard; should be uncontroversial.
- **Templates declare expected anchors** (Account / Policy / Contact). Avoids "wrong-anchor Template used by wrong Campaign" footguns.
- **Brand assets live on Agency / Office, not Template.** Templates reference via tokens — `{agency.logo_url}` etc. Edits propagate without per-Template work.
- **Conventions enforced at save time, configurable per agency, hardcoded for Marker at PoC.**
- **Versioning deferred** — PoC edits in place with audit log + warning when an in-flight Campaign would be affected. Pin / auto-follow added when a customer asks.
- **Cross-channel families** are *not* a primitive. Build one Template per channel; group via name prefix / category.

Working doc Companion docs + Reference section updated.

---

## 2026-05-27 — `[docs]` First companion doc: `segments.md`

Created [`segments.md`](segments.md) — the first companion doc to `concepts_working_doc.md`, following the Fairs `specs/registrations/{applications-pipelines,contacts-accounts,sponsors,...}.md` pattern. Permanent home for everything Segment-related in detail.

Structured for a non-technical reader first: prose intro, what a Segment is, the anchor concept, the three-tier authorship model, library UX, count + sample preview, composition operators, "Segments vs lists" conceptual point, canonical fields, PL-side data, Segment metadata for sender hints, where Segments fit alongside the other primitives. Implementation details (schema, per-AMS SQL branching, execution operations, predicate AST, beyond-PoC catalog) live in a single `## Implementation details` section near the end, explicitly marked as engineering reference. Open questions at the bottom.

Driven by Martin's request after the four-primitives restructure landed: working doc was good as a working doc but Segments deserve a readable, comprehensive home that someone non-technical can pick up cold. Working doc keeps the cross-cutting map + active thread; companion doc absorbs the Segment-specific depth.

Content draws from prior turns: PoC schema + per-AMS SQL approach (the implementation-detail conversation), the segment library + sample preview UX, the canonical-field walkthrough, the segments-vs-lists conceptual clarification, the Marker §12.1 status-guard requirement, the segment-metadata-with-producer pattern, the three-tier authorship strategy.

Working doc Related header + Reference section updated to point at the new companion doc.

---

## 2026-05-27 — `[docs]` Doc style switched to Fairs conventions; changelog extracted

Switched `concepts_working_doc.md` and `research_segment_builder_ux.md` from YAML-frontmatter headers (per the now-ignored repo `CLAUDE.md`) to Fairs-style markdown headers (per `../Nexa/Fairs/fairscom/product/specs/{kiosk,registrations}/`). Header now uses `**Status:** / **Created:** / **Updated:** / **Related:**` lines instead of YAML.

Extracted the embedded `## 14. Changelog` table from `concepts_working_doc.md` into this separate `changelog.md` file. Entries rewritten in narrative style (matching `specs/registrations/changelog.md`) — what happened, why, what changed, with sub-sections where useful — rather than condensed one-paragraph table rows. Tag system added (`[brainstorm]`, `[docs]`, `[research]`, `[client-call]`).

No content changes to the working doc itself — purely a stylistic / structural shift to match conventions Martin prefers.

---

## 2026-05-27 — `[brainstorm]` `[docs]` Doc v5 — major restructure around four primitives

`concepts_working_doc.md` reorganized around four self-contained primitives: **Segment / Template / Broadcast / Automation**. Old clusters Segmenter (S), Targeting/Fanout (T), Engagement (E) dissolved; concepts redistributed into Segment (SE), Template (TE), Broadcast (BR), Automation (AU), Runtime+cross-cutting (RT). Abstraction layer (A) and PL-side annotations (N) unchanged.

Driven by Martin's observation that the prior version had peer concepts and configuration knobs at the same level — Trigger / Fanout / Sender / Audience / Enrollment were all treated as first-class when they're actually properties of Broadcast or Automation. AR's UI feels tangled for the same reason; we shouldn't replicate.

### Key reframes

- **Audience deprecated as a primary concept.** Was 90% the same as Segment — confusing. Now an informal term for "recipients" — lives on Send runtime records, not as a user-built entity.
- **"Lock recipients" → Enrollment policy on Automation.** A Segment is a *question* (stateless predicate); the answer changes over time as data changes. The Automation decides when to ask the question — at-launch / newly-entering / continuous. If "lock" lived on the Segment, you'd have to clone Segments to get different enrollment behaviors. Captured in §5.6.
- **Trigger / Fanout / Sender / Enrollment all reframed as properties.** Of Broadcast or Automation, not peer concepts. Old §9 "Fanout cluster" structure dissolved; now a shared property-documentation section (§9 retitled "Recipient + Sender resolution").
- **Automation cluster (AU) grew to 15 items** — honest about where the design complexity lives. Covers entry trigger, enrollment policy, enrollment state, sequence/steps/step types/timing/branching, sender, fanout, exit conditions, re-enrollment, verification, approval mode, calendar sub-pattern, hidden-trigger anti-pattern.

### PoC scope restated

Four screens for clients at PoC: Segment library + Template editor + Broadcast builder + Automation builder. Plus pre-send recipient verification. Everything we've been talking about — canonical fields, tier-2 builders, composition operators, sender resolver chains, household orchestration — is *under* these surfaces, not next to them.

### Cross-doc

`§5` rewritten as "The four primitives" with explicit boundary lines per primitive (what each does, what each does NOT do). `§5.5` adds a vocabulary cheat sheet naming what's a primitive vs property vs deprecated vs runtime artifact. `§11 + §12` concept references updated to new cluster IDs throughout.

---

## 2026-05-27 — `[client-call]` `[brainstorm]` Marker Insurance onboarding distilled into client signal section

Read Fathom transcript of 2026-05-27 onboarding call: Kim (Marker) + Alex Kumamoto + Javier Salazar (PolicyLift), 66 min. Marker is transitioning from Agency Revolution to PolicyLift; AR access expires 2 days after the call. Source: `fathom.video/calls/687681734`.

Added `§12 Client signal — observed patterns from real onboardings` to the working doc as a permanent section for distilled patterns from real client interactions (separated from research/competitor analysis to keep client voice undiluted). Added `§12.1` Marker entry with ~14 patterns observed.

### Patterns that materially changed the brainstorm

- **Three-tier authorship validated in client voice.** Kim's mental model literally is tier 1 (PL writes) → service-request → eventually self-serve. Alex told her openly: "We feel the system we have built today handles email, but there is a level above what we are doing that we want to be able to deliver to you that is going to require us to revamp the system." Self-serve timeline communicated: "two to eight to ten weeks."
- **Concierge service-request workflow IS the PoC delivery.** Kim endorsed AR's model — "you send them an email with a service... they return you a Loom video... or a link to approve" — as her preferred near-term mode. Added `§5.1.1` (later folded into v5 `§5.7`) capturing this as the operational delivery model, not a fallback.
- **Lead vs Prospect as load-bearing state boundary.** Kim's framing — Lead = automated, no human touch; Prospect = manual state change in HawkSoft, producer takes over — is segmentation-load-bearing. PL can't write Prospect to HawkSoft today; transition is client-manual + observed-via-sync. Updated A10.
- **HawkSoft substatus has hard limits.** Editable only on Cancellation / Non-Renewed / Moved / Rejected statuses — NOT on New Business / Rewrite where Marker needed it. External HawkSoft API limitation. AMS-only-tagging fallback structurally blocked for half of real use cases. Updated N1.
- **Renewal date vs effective date is a real canonical-field problem.** Alex on the call: "different agencies represent the renewal date differently... I've noticed that's inconsistent." AR uses `effective_date + 300 days` as a renewal proxy. PL currently uses `renewal_date` directly. Updated F4.
- **"Policy in force" status guard required.** Kim demonstrated live: canceled policies have unreliable date fields. Any renewal-date-based Automation needs `status = active` as a guard. Added `status_guard` to the canonical field shape sketch.
- **Multi-level sender resolution.** Sender per campaign type: Renewal → CSR, Relationship → Producer, Cancellation → CSR, Prospect-list → list-assigned producer, House → team. Added T5 Sender resolver (later AU8 in v5).
- **Subject + body template conventions.** Customer name + HawkSoft external ID in subject (CSR reverse-lookup); visible automation indicator in body (color band / branded element). Operational requirements at template level. Added TE3 + TE4.
- **Prospect-list-with-producer-assignment workflow.** Kim uploads lists, tags in HawkSoft, assigns a producer at the list level. Emails from that list go from that producer. Added Segment metadata SE8 for ownership / sender-routing info.
- **Calendar-driven Automation sub-pattern.** Holiday calendar with pre-configured per-date templates + on/off toggles. Added AU14.
- **Hidden-trigger anti-pattern observed.** Kim and Alex spent ~5 min hunting for what triggered a sequence in AR — buried in ordered step list, not at the campaign header. Actively avoid (AU15).

### Marker commitments captured in `§11`

- Cancellation Automation live by Friday 2026-05-29 (2 days from call)
- Welcome Kit + Renewal Automations in ~2 weeks
- NPS + Google Review can lag a week or two
- Prospect-list ingestion + nurture as the bigger ask (top-of-funnel)

---

## 2026-05-26 — `[research]` `[docs]` Segment builder UX research across ~15 products

Created `research_segment_builder_ux.md`. Surveyed how segment / cohort / filter / rule builders are designed across marketing automation (Mailchimp, HubSpot, Klaviyo, Customer.io), analytics (Mixpanel, Amplitude), CRM (Salesforce Marketing Cloud), open-source rule-builder libraries (react-querybuilder), classic examples (iTunes Smart Playlists), and UX literature (UI-Patterns, Hagan Rivers Medium, Pencil & Paper, Smashing Magazine, Smart Interface Design Patterns).

Driven by Martin's question after pressure-testing the segmenter concept — *"surely it's not something that only CRMs have issues with but literally any software that works with segments?"* — to counterweight the AR + Lev focus that had been the primary reference.

### Industry-validated for us

- **Three-tier authorship (templates → simple builder → advanced/SQL) is universal.** Our PL-built / client-simple / composition split maps exactly.
- **Sample preview alongside count is universal** — Ley's "review every recipient" is standard practice, not a special feature.
- **Categorized + searchable field picker** is the dominant pattern.

### Contested, our pick

- **Quantification UI** — three approaches (implicit "any" / sentence-baked / explicit containers). Recommendation: implicit-by-default, surface scoping when the user adds a second predicate on the same child entity. AR's "set of sets" is the most expressive but the densest; we don't have to copy it.
- **Nesting** — strong industry guidance against. Most marketing tools have no nesting at all. iTunes-style is the elegant exception. Cap visible nesting at 2 levels or punt to tier-1 SQL.

### Novel for us

- **Multi-anchor segments** (Account / Policy / Contact / Claim / Quote) — almost no general-purpose marketing tool does this; AR is the closest reference because they're also CRM-shaped.
- **Canonical field vocabulary over heterogeneous AMS sources** — no surveyed tool has the exact equivalent. Closest analog is Segment.com's "computed traits" but it's not quite the same problem. Differentiator territory.

### Pitfalls worth actively avoiding

Silent quantifier-scope confusion, missing applied-filter pills, unbounded nesting, single-number count without sample preview, dropdown lists of fields, freezing UI on input.

§15 of the research doc ended with 7 open questions to bring back to the brainstorm — quantifier UI direction, nesting depth cap, templates-as-tier-0, AI-assisted authoring, picker hierarchy, two-number count, sample preview details.

---

## 2026-05-26 — `[brainstorm]` `[docs]` Doc v3 — Segment model + Segment/Audience/Message vocabulary locked

Added `§5 Segment model` to `concepts_working_doc.md` capturing the three-tier authorship strategy and locking the Segment / Audience / Message vocabulary.

### Three-tier authorship

- **Tier 1 — PL-built named Segments.** Hand-authored by PolicyLift (SQL, canonical-field expressions, AI-assisted), exposed to clients as named callable Segments with description + current count. PoC path — fastest way to onboard real clients.
- **Tier 2 — Client-built simple Segments.** Predicate composer over a small set of common canonical fields. Lower-priority than tier 1.
- **Tier 3 — Composition.** Clients combine tier-1 and tier-2 Segments using set operators (intersect / union / except).

For PoC, tiers 1 + 3 are enough.

### Vocabulary

- **Segment** — saved query, anchor entity, resolves to records.
- **Audience** — list of recipients for a Campaign, derived from Segment + fanout. Snapshot at send time.
- **Message** — what the recipient receives, channel-agnostic.
- **Campaign** = Segment + fanout rule + Message(s) + Timing/Triggers (wrapping concept).

### Other v3 changes

Added `§8.2` canonical field walkthrough — "Auto policy is at or below state minimum" worked example. Surfaced generalized canonical field shape (entity, cardinality, type, raw vs computed source, predicates, availability) and 6 open questions (resolution function location, catalog versioning, agency-authored fields, composite vs atomic, "same field across AMSes" definitional precision, quantifier defaults).

Reframed `§9` from "paused sketch" to active Fanout discussion. Anchor entity settled as part of Segment; fanout settled as part of Campaign. Added S8 (segment composition), S9 (tier-1 named library).

---

## 2026-05-26 — `[brainstorm]` `[docs]` Doc v2 — Two-tier AMS data strategy settled with Alex/Yurii sync

Major reframe of `concepts_working_doc.md` after Alex/Yurii sync. Added `§4 AMS data strategy — two-tier with canonical fields on top`. Reorganized concept map into clusters: Foundational + Segmenter + Abstraction-Layer + PL-Annotations + Targeting/Fanout + Engagement.

### Key insight

CXP UI isn't enabled for clients yet, so CXP is practically in-transit data between AMS and Reach. The Reach Customer shape is too simplistic to express what real clients want to target on — that's why we can't onboard real clients to Reach today. The fix isn't to make CXP richer; it's to query the raw AMS data directly for segmentation while keeping the CXP abstraction for UX convenience.

### Two-tier AMS data strategy

- **Tier 1 — CXP abstraction layer** (existing accounts/contacts/policies). For UX convenience; works the same across AMSes.
- **Tier 2 — Raw AMS data** (existing `accounts.ams_data` jsonb). For segmentation fidelity — every field the AMS carries in its native structure. Segmenter queries this tier primarily, mixed with PL-side annotations.

### Canonical field vocabulary on top

The user picks "Policy age > 365 days," not `ams_data->>'policy_inception_dt' < now() - 365`. Per-AMS resolution functions underneath. Catalog hybrid (PL ships base, agencies extend).

### Cluster map and demotions

Reframed active thread from "Account/Contact source-of-truth" to "data layer + canonical fields." Demoted source-of-truth + cross-account-identity questions since CXP isn't user-facing yet. Updated `§10` customer commitments to flag implied canonical fields. Broadened the competition look to full UX walkthroughs of AR + Lev (matching Martin's prior AgencyZoom + InsuredMine deep-dive style).

---

## 2026-05-26 — `[brainstorm]` `[docs]` Initial concepts working doc

Created `concepts_working_doc.md` to capture the conversation so far on the email automation product replacing the third-party Reach integration.

### Initial framing

PolicyLift's native email automation built on top of CXP, with the central differentiator being deep segmentation + audience verification over heterogeneous AMS data. Compared to Agency Revolution: deeper into producer-mailbox sending and household orchestration. Compared to Levitate: deeper into insurance event triggers, multi-contact-per-account, policy-level reporting.

### Concrete finding

Reach Customer = 1:1 with Account in the current PolicyLift→Reach adapter; only the `is_primary` contact's data is carried. Multi-contact info is lost. CXP contacts and Reach contacts are practically separate today. So PolicyLift already has richer data in CXP than Reach can express — replacing Reach unlocks that richness.

### State of brainstorm at v1

Initial 13-concept area list under "audience cluster" (Targeting unit / Account / Contact / Contact Methods / Household / Policy / Carrier / Coverage / Claim / Tag / Key Fact / Custom Field / Segment / Producer assignment / Status & lifecycle / Eligibility) — paused on Martin's competition look at AR + Lev for the dimensions where their contact models differ (primary entity, origin paths, editability, conflict resolution, multi-account membership, role taxonomy, contact-method shape, household grouping). v1 left at "Account/Contact source-of-truth verification" as the active thread before the v2 reframe shifted the framing.
