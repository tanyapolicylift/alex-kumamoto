# Email Automation — Changelog

Running log of brainstorm decisions, doc restructures, research artifacts, and client signal — reverse-chronological (newest first). Tag with `[brainstorm]`, `[docs]`, `[research]`, `[client-call]` so slices are grep-able.

For the brainstorm in progress, see [`concepts_working_doc.md`](concepts_working_doc.md). For research, see [`research_segment_builder_ux.md`](research_segment_builder_ux.md). For companion docs, see [`segments.md`](segments.md), [`templates.md`](templates.md), [`broadcasts.md`](broadcasts.md), and [`automations.md`](automations.md).

---

## 2026-06-03 — `[docs]` Consolidated decisions & open-questions register for team review

Created [`decisions_and_open_questions.md`](decisions_and_open_questions.md) — a single review artifact pulling every decided/leaning/open item out of the scattered docs (companion-doc open-questions sections, the §7 cluster status flags, §11 commitments, prototype blueprint) into one place, grouped by area with status (✅/🔄/🔲/⏭️), current leans, dependencies, and back-pointers. Explicitly **not** a source of truth — each home doc stays authoritative. Opens with a "decide-these-first" shortlist (tagging strategy, verification UX, re-eval cadence, coverage data, matched-set ownership, sender resolver). For Martin to walk through with Alex / Raghav / Mike.

---

## 2026-06-03 — `[research]` `[brainstorm]` `[docs]` Broadcast=Campaign / Automation=Flow; enrollment collapses to trigger-driven; renewal = date-triggered Automation

Triggered by Martin examining the client's actual AR renewal setup, then walking Klaviyo's Campaign/Flow builders and triggers live — and verifying each behavioral claim against Klaviyo / Customer.io / Braze docs (per the "go to source" lesson). A cluster of model refinements landed, all pushing toward *simpler*. Updated `concepts_working_doc.md` (§5.1/§5.3/§5.4/§5.5/§5.6 + AU2), `automations.md` (new "scheduled vs triggered" section, Entry trigger, Enrollment, Marker scope, What's-settled), and `segment_library_poc.md` (S1 + S3 reframed).

### The findings (verified)

- **AR's renewal model isn't a "renewing in N days" segment.** It's a broad *Active Commercial Customers* segment + a **sequence triggered off `Policy › Expiration Date`** (date field, ± offset, "run annually & reschedule when date changes," once per policy). Timing lives on the sequence, not the segment — the same "anchor/timing on the sequence" pattern we'd found for AR's dynamic content (2026-06-01), now for *time*.
- **Klaviyo/Customer.io do the same and keep it unified, not split.** A **date property is the flow trigger**; "who" = trigger + **profile filters** *inside the same flow*. So it's not "assemble a segment over here, wire a trigger over there" — one builder. (Addresses Martin's worry about splitting audience/targeting.) This also dodges the §8.4 relative-time-exit churn: a windowed segment churns daily; a date trigger computes timing per-record.
- **Campaign vs Flow = Broadcast vs Automation.** Klaviyo's two objects map exactly onto our two send primitives. The dividing line is **scheduled (audience picked) vs triggered (per-person, continuous)** — **not** single-vs-series. Klaviyo's "omnichannel campaign" (a *scheduled* multi-message/channel send) is still a **Broadcast**, not an Automation.
- **No "audience lock / existing+new vs only-new" in Klaviyo flows — by design.** Every trigger is a *transition* ("added to segment for the first time," event, date arriving), so enrollment is **newly-entering by construction**. Verified: existing members **don't** auto-enter when a flow turns on, and manual segment-definition edits don't trigger; the backlog is an explicit one-time **"add past profiles"** backfill — or a Broadcast.

### Decisions (model refinements)

1. **Collapse the three enrollment policies.** "Newly-entering ≡ continuous" (trigger-driven). "At-launch / blast the existing book" is **not** an automation mode — it's a one-time op (backfill or Broadcast). Repeat knob = **re-entry**. The Welcome-Kit "don't blast the backlog" win (§12.2) now falls out for free.
2. **Add real trigger types + two filter layers** to the Automation: added-to-segment (transition), metric/event, **date property** (offset + recurrence + reschedule-on-change), manual; narrowed by **trigger filters** (event data) + **profile filters** (record state); trigger fixed after save.
3. **Renewal = date-triggered Automation, not a windowed Segment.** S1 "Policies renewing in N days" reframed: the window is the trigger offset; the predicate survives only as a **Broadcast** audience. Same for S3 (welcome kit → `sold_date` date trigger). Corroborated by Katz/Eclipse ("use expiry dates, not status, for renewals").
4. **Three-bucket use-case taxonomy** (validated against every §12.2 + `client_feedback.md` ask): date-anchored → date-trigger Automation; state-transition → added-to-segment Automation; one-time-to-current-set → Broadcast. Known deferred tension: JAMCO's "one combined email for same-date home+auto" fights per-policy date triggers (account-bundled roll-up, already post-PoC).

Prototype left as-is for now (the flagship "renewing in 30 days" detail page stands as a valid Broadcast-style windowed-segment example).

---

## 2026-06-03 — `[research]` `[docs]` Live Klaviyo teardown — schemaless types, flattened-quantifier ceiling, segment update cadence

Hands-on session: imported 150 dummy insurance subscribers (`klaviyo-test/` — fixed-seed generator + CSV whose columns map to our S1–S5 predicates) and rebuilt the tier-1 segments inside Klaviyo to find where its builder strains. Every behavioral claim was verified against Klaviyo docs (and cross-checked against Customer.io + Braze), per the "go to source for behavioral claims" lesson from the earlier CNF read. Findings folded into `research_segment_builder_ux.md` (new §5.5, §7.4, §8.4, §13.7 + Sources/Updated header).

### Findings

- **List vs Text is multi-value-per-profile, not enum/picklist (§5.5).** Multi-select set-membership (`is in`) lives on **Text** too; **List** (`includes any of` / `has at least N items`) is for arrays. Rebuilding **S4** ("Home with a bundle carrier, no Auto") proved the **same-row trap survives flattening** — list operators quantify over a policy array that has lost row identity, so you can't say "the *Home* policy's carrier is a bundle carrier." Cleanest proof yet that **anchor-as-first-class-entity does real work** a flatten-to-profile model can't.
- **Schemaless property typing → query-time cast → silent failure (§7.4).** Klaviyo properties are loosely-typed; type is chosen at import *and* re-cast per condition via a `Type:` dropdown, and a mismatch (e.g. `nps_score` as Date) yields a silent **"Unavailable"** segment, not an error. Concrete argument **for** our typed `ams.*`/`pl.*` catalog (type lives on the field → drives operators → nonsense is unrepresentable).
- **Membership is eventually consistent; relative-time exits are batched (§8.4).** Klaviyo: ~15 min property propagation, viewed-count lag up to 1h, **relative-time passive exits swept once every 24h**. Cross-checked — **Braze** recomputes membership *at send* ("exact segment membership is always calculated just before the message is sent") + a re-evaluate-at-send toggle; **Customer.io** claims continuous relative-date exit (cadence undocumented). Validates **re-resolve-at-send** + **nightly membership pass** (`automations.md` data-drift / open Q10) as mainstream, not workarounds — load-bearing for our date-windowed S1/S3. UX nudge: label any displayed count "as of …".

### Why it matters

Three independent confirmations that the model is right exactly where it diverges from a generic e-commerce tool: **typed field catalog** (vs schemaless), **multi-anchor with first-class child collections** (vs flatten-to-profile), and **send-time audience resolution** (vs trusting standing membership). The dummy-data harness in `klaviyo-test/` stays for further competitor probing (e.g. an events-based slice to test Klaviyo's "what someone has done" category, which CSV can't reach).

---

## 2026-06-02 — `[brainstorm]` `[docs]` Lean segment-library columns (mirror Reach); design detail → blueprint, not vision prose

Two related calls (Martin), prompted by comparing real tools (Klaviyo, AR, and especially **Reach** — the tool we're replacing, whose list is Name+desc · Type(Managed) · Users · Last Modified · Edit):

**Lean column set.** Dropped **Category** (clutter; no tool shows it — at most a tag-filter later) and **AMS chip** (meaningless at single-AMS PoC), plus **Owner** and a separate **Anchor** column. Final library columns mirror Reach: status dot · name + description · Kind (Managed/Regular) · count (*labeled with its unit* — "284 policies" / "150 customers", which conveys the anchor for free) · Last Modified · Edit (Regular) / view (Managed). Toolbar: search + Kind filter + pagination. Mirroring Reach minimizes migration friction and validates the Managed badge.

**Doc-structure convention.** Design/UI specifics shouldn't live in the vision prose. The column/row spec now lives in `prototype/v1/blueprint.md` (the disposable design artifact); trimmed the enumerated columns + filter/sort behavior out of `segments.md`'s "Browsing the library" section back to concept-level (with a pointer to the blueprint). The existing fenced `## Implementation details` section in `segments.md` is fine — a separate section satisfies the rule. Saved the convention to memory: concept docs stay conceptual; UI/layout/schema goes in the blueprint or a fenced Implementation section.

---

## 2026-06-02 — `[brainstorm]` `[docs]` Managed vs Regular segments; drop in-product request flow

Two segment-library decisions (Martin):

- **Drop "Request a Segment" from the product (first cut).** Clients are already in regular contact with the ops team, so new/changed Managed segments are arranged **out of band** — no in-product request screen yet (may come later).
- **Managed vs Regular kinds (Reach-style).** **Managed** = PolicyLift/ops-built, **read-only** to the client; **Regular** = client-built, **editable**. Each library row is marked; the edit affordance is gated by kind. This replaces the vaguer "PL-built / yours" source badge and ties editability to kind. (Maps onto the tiers: Managed ≈ tier-1; Regular ≈ tier-2/3.)

Updated `prototype/v1/blueprint.md` (model picture, screen list — removed the Request screen, kind badge + read-only/edit gating, build steps: Step 4 is now Compose-only, mock data marks most segments Managed + 1–2 Regular) and `segments.md` (library + detail framing, tier-1 concierge note → out-of-band, no in-product request flow).

---

## 2026-06-02 — `[brainstorm]` `[docs]` Defer canonical fields; reframe around `ams.` / `pl.` / `calc.`

Bigger simplification at Martin's push: do we need canonical fields + cross-AMS mapping at all, vs. just exposing AMS data directly? Answer: **no, not at PoC** — and it's even cleaner than that, because the field-by-source model is the simplest correct framing.

### The reframe

Reference fields by **source**, not by a canonical abstraction:
- **`ams.*`** — data from the AMS (a *source* label, not storage — invisible whether it's a normalized CXP column or raw `ams_data` JSONB underneath).
- **`pl.*`** — data from PolicyLift (conversations, tags, NPS, suppression, custom fields).

Martin's example: `count(ams.policy where status='active') > 0 AND count(pl.conversation where type='chat') = 0`.

**At PoC there's no canonical/normalization layer at all:** one AMS (HawkSoft) → nothing to map across; PL-only authoring → no need for a friendly vocabulary. Segments reference `ams.*`/`pl.*` directly; computed concepts (days-until-renewal, days-since-sold) are written **inline**, not as named fields. This is close to what AR does (raw per-AMS field access + selective normalization).

**Derived fields** answer ("ams, pl, or sth else?"): a third namespace, **`calc.*`** — a *named expression* over `ams.`/`pl.` inputs (e.g. `calc.policy.days_until_renewal`). A `calc.*` field is exactly the old "canonical field"; per-AMS resolution lives *inside* its definition. Staged path: **(1) `ams.`/`pl.` raw + inline math [PoC] → (2) name a `calc.*` field [when reused / tier-2] → (3) per-AMS resolution inside it [when 2nd AMS needs it]**. Complicate only where forced.

### Doc changes

- `segments.md`: "Canonical fields — same concept, different AMS shapes" → **"Fields by source — `ams.`, `pl.`, and (later) `calc.`"**; canonical demoted to deferred `calc.*`. Rung-6 reworded (computed, not "canonical"). Anchor link updated.
- `segment_library_poc.md`: retitled (dropped "+ Canonical-Field Seed"); Part 1 → "The fields these segments read" with `ams.*`/`pl.*` field table (dropped the derived `renewing_in_days`/`days_since_sold` rows — they're inline); field notes reframed HawkSoft-concrete (no cross-AMS "mapping TBD"); Part 2 predicates rewritten in `ams.`/`pl.` + `count(...)` quantifier syntax + inline renewal math; open questions refocused on confirming HawkSoft paths.
- `concepts_working_doc.md` §4.3: added a "reframed — deferred" note pointing to the new model (content kept as the eventual `calc.*` design); §13 reference line updated.

Consistent with the simplification preference saved to memory. Watch item unchanged: introduce `calc.*` / per-AMS resolution at the 2nd-AMS threshold (segments.md open Q1).

---

## 2026-06-02 — `[brainstorm]` `[docs]` Cut "status guard" as a concept — it's just a condition

Simplification at Martin's push ("isn't a guard just another condition? I want to simplify as much as possible"). It is — `status = active` compiles to a plain `AND` with no special behavior — so we removed "guard" as a named concept/column/vocabulary while **keeping the domain knowledge** (canceled policies have stale dates → renewal-type segments must filter `status = active`; Marker §12.1).

### Changes

- `segment_library_poc.md`: dropped the **Guard** column from the canonical-field table; removed the per-segment **"Status guard:"** lines (the predicates already include `status = active`); folded the *why* into an authoring note on `renewing_in_days`.
- `segments.md`: rewrote "Companion predicates (status guards)" → "A note on the 'policy in force' filter" — it's just another condition; PL hand-writes it as a `WHERE` line at PoC. The auto-include behavior is marked a **deferred, invisible tier-2 catalog convenience**, not a user-facing concept. Softened the rung-6 mention; renamed the beyond-PoC catalog field `status_guard` → `default_condition` (labeled "just an AND'd predicate, not special"). Tidied stray "guard" noun usages to "filter."

The "guard"-as-verb usages for the vacuous-truth trap (S4 `any(Home)` guards against empty-collection `none(Auto)`) are normal English and left as-is.

Captured the underlying preference to memory: don't introduce concepts/abstractions unless absolutely needed; check whether a "new" thing is just an existing primitive in disguise.

---

## 2026-06-02 — `[brainstorm]` `[docs]` Tier-1 PoC Segment library + canonical-field seed

Created [`segment_library_poc.md`](segment_library_poc.md) — the concrete tier-1 (PL-authored) Segments we ship at PoC, derived from the §12.2 use cases, plus the canonical-field seed they require. This turns the segmentation *model* (built across this week's brainstorm) into actual segment definitions, and is the long-flagged "canonical-field catalog seed" (working-doc §8.3 #2 / §8.5). Chosen as the next segmentation move because it ships the PoC deliverable *and* validates the whole model against real predicates.

### Structure

- **Part 1 — canonical-field seed:** the recurring fields (policy status/substatus/type/carrier/effective_date/renewal_date/renewing_in_days/sold_date/days_since_sold, account.status, contact.nps_score) with type, operators, guards, and provisional per-AMS resolution notes.
- **Part 2 — the five Segments:** S1 Policies renewing in N days (per-policy enrollment, prefer renewal_date / fall back effective+term), S2 Pending cancellation non-payment (HawkSoft status+substatus; Marker's first), S3 Newly sold accounts (Sold-Date principle; newly-entering enrollment), S4 Cross-sell Home-without-Auto (rung-5 quantifiers: any(Home)+none(Auto), same-row carrier, vacuous-truth guarded), S5 NPS promoters (PL-side data, 2-stage automation). Renewal Notices left unspecced (untested).
- **Part 3 — cross-cutting decisions these force closed:** per-anchor display schemas (was open Q4), default fanout per anchor (was open Q5: Account→primary, Policy→named insured, Contact→self), and the three semantic defaults flagged after the complexity ladder — same-row scoping default = same row; count default = existence (any); vacuous truth guarded by an existence requirement.

### Caveat baked in

Per-AMS field paths are a **provisional seed**, NOT verified against the live CXP schema (which Martin notes may be stale) — confirm against actual `ams_data` / sync code before implementing. HawkSoft specced concretely (Marker is the PoC agency); other AMSes marked TBD. 7 open items, chiefly: per-AMS resolutions beyond HawkSoft, the renewal-term default (confirm with Alex), LOB-mapping mechanism, NPS data dependency.

Wired into working-doc §13 reference list + `segments.md` Related header.

---

## 2026-06-02 — `[client-call]` `[docs]` Priority segment use cases from Alex (§12.2)

Added §12.2 to `concepts_working_doc.md` capturing the prioritized Segment/Automation use cases Alex relayed from client asks, plus a renewal-proxy note in `segments.md`. Strong validation: almost every use case lands on design built this week.

### Use cases captured (with what each validates)

**Highest priority:**
- **Renewal Reminders** (Policy) — canonical `renewing_in_days`, two resolutions: prefer `renewal_date`; fall back to `effective_date + term` (AR proxy). Term is **agency-configurable, not a constant**.
- **Cancellations** (Policy, Marker-only) — concrete predicate `status = "Cancelled (Pending)" AND substatus = "Non-Payment"`. Confirms status guard + HawkSoft substatus readable on Cancelled.
- **Welcome Kits** (Account) — **textbook enrollment-policy validation**: Alex independently describes Reach's "all in or entering" blast-the-backlog failure vs AR's "only newly entering" = our newly-entering-only policy. 🆕 **Sold-Date principle**: prefer a date-anchored entry condition over state-transition detection when a reliable date exists (robust, no transition capture, naturally excludes the backlog).

**Medium priority:**
- **Cross-Sells** (Account) — "Home but no Auto, with bundle carriers" = **complexity-ladder rung 5** (mixed quantifiers + `none` negation + carrier `in`). Concrete proof quantified relational segmentation is required.
- **Renewal Notices** — distinct from reminders; tricky/untested, left open.
- **Reputation/NPS** — "just signed" = newly-entering; NPS ≥ 9 → Google Review = survey-response data feeding a 2-stage automation. Confirms engagement / PL-side-data condition category.

### Renewal-proxy note (`segments.md`)

Added a note at the per-AMS SQL example: prefer `renewal_date`, fall back to `effective_date + term`; the `+300` is illustrative, the term is **agency-configurable** (agencies represent renewal differently; not every book is a clean 1-yr term). The `+300` looks low for a 1-yr term — flagged to confirm the real default with Alex rather than silently changing it.

Net new vs. confirmation: mostly confirms canonical fields, enrollment policy, and quantified relational Segments. New = the Sold-Date-over-state-transition guideline, the agency-configurable renewal term, and the concrete tier-1 predicates (cancellation, cross-sell, NPS≥9) that seed the Segment library.

---

## 2026-06-02 — `[brainstorm]` `[docs]` Enrollment state & drift over time added to `automations.md`

Added an "Enrollment state & drift over time" section to `automations.md` (after Exit conditions), answering Martin's question: what happens when the Segment matching changes *after* an Automation has enrolled someone — e.g. an account + 2 matching policies were pulled into a template and then one policy stops matching.

### The decomposition

"The Segment changes over time" is **three independent clocks**: (1) who enters & when = enrollment policy (already decided); (2) *membership drift* — do they still qualify; (3) *data drift* — what each send renders. The question is clocks 2 & 3, which the enrollment-policy decision doesn't cover. So it's separate from enrollment policy — but it turns out to be the **time-dimension face of the dynamic-content anchor choice (Path A vs B)**, not a new orthogonal axis.

### Decisions captured

- **Framing:** the Segment stays a stateless question (never "locked"); the **enrollment** is the stateful object. Design choice = how much the enrollment freezes vs. re-derives.
- **Membership drift → exit conditions** (default exit-on-no-longer-match for lifecycle Automations).
- **Data drift → re-resolve at each send**, never freeze merge data at enrollment (stale insurance data is the worse failure); each Send immutably records what it rendered, the next Send recomputes.
- **The partial-bundle mess is an anchor decision.** Per-entity enrollment (Path B / AR) → drift is trivial (a record stops matching → that enrollment exits). Account-anchored bundle (Path A) → can shrink (count-tolerant prose needed), go empty (→ exit signal), or grow (usually unwanted mid-flight). Same "anchor moves the complexity" lever, on the time axis.
- **PoC defaults:** per-entity (per-policy) enrollment for the three Marker Automations, re-resolve-at-send universally, exit-on-no-longer-match for lifecycle; bundled account-anchored "list" Automation deferred post-PoC.

Cross-links `segments.md` (stateless question) and `dynamic-content.md` (matched set, Path A/B). Settled/TBD list updated. Two new open questions: #9 matched-set-grows-mid-Sequence (bundle case), #10 re-evaluation cadence (lazy-at-send for content + nightly membership pass for timely exits, to confirm). Connects to existing open question #4 (enrollment-state granularity — per-entity enrollment = the per-`(subject, automation, trigger_event)` option).

---

## 2026-06-01 — `[research]` `[docs]` AR dynamic-content mechanism verified — Path B, not Path C

Resolved the previously-unverified "AR might use Path C" flag in `dynamic-content.md` by checking AR's help docs (merge-field availability + advanced segments). Updated three spots in the doc + resolved open question #3.

### What AR actually does

AR runs sequences on a **per-entity basis** — its **four entity bases: per-account / per-policy / per-contact / per-claim** (confirms Martin's "4 anchors"; we add Quote as a 5th). The basis lives on the **sequence**, set by what triggers/enrolls it — *not* on the segment — and it **gates which merge fields are available**. To merge `{{policy.*}}` the sequence must enroll per-policy; AR's docs: claim merge fields are unavailable unless the sequence enrolls on the New Claim Event, *"since it is possible for customers to have more than one claim … the system will not know which claim it is basing the campaign on."*

This is **Path B (re-anchor to the entity) enforced at the merge-field layer** — there's never more than one record in context, so merge fields resolve unambiguously. It is *not* Path C: there is no render-time query inside the template. For the enumerate-a-list case AR doesn't loop a matched set — it ships a fixed **active-policies component** (teardown 1.1.8) + sequence-level conditional content via Segment Match (1.1.18).

### Doc changes

- **Path B** gains a "Verified precedent — AR works this way" callout (per-entity basis, merge-field gating, the active-policies-widget ceiling).
- **Path C**'s "possible AR parallel (unverified)" callout flipped to "Not how AR does it (verified)" — no insurance precedent for Path C; SFMC `LookupRows` is the only reference.
- **PoC recommendation** notes Path B is the *proven* model (AR ships it) and that Path A's general matched-set loop is exactly where we'd beat AR (AR falls back to a fixed widget).
- **Open question #3** marked RESOLVED.

Architectural contrast captured: AR puts the anchor on the **sequence/enrollment** (gates content); PolicyLift puts the anchor on the **Segment** with fanout on Broadcast/Automation — which is what makes Path A (carry the matched set into the template, loop it) a first-class option AR structurally can't match.

---

## 2026-06-01 — `[research]` `[brainstorm]` Competition finding — Levitate is a relationship tool, not a segmentation engine

Added §8.7 to `concepts_working_doc.md`. First finding from the competition walkthrough — Martin got live Levitate access and was surprised by how shallow its segmentation is ("Advanced Filters" = tags + a fixed field panel). Confirmed against Levitate's docs and our own teardown that this is real and by design.

### The finding

Levitate segmentation = **tags + a fixed Advanced-Filters panel** over standard contact fields only (status / ownership / location / creation date / last communication / key fact). Contact-anchored and flat: no anchor, no child collections, no quantifiers, no AND/OR group tree, no policy-level/relational segmentation. Custom fields not filterable (Lev docs confirm; a primitive exact-match box now exists but no operators). Matches teardown rows 4.6.1 (Segment Match rule-builder: AR ✅ / Lev ⚠️) and 3.2.6 / 13.2.17.

### The positioning

AR and Levitate sit at opposite ends of a spectrum; "parity" conflates them. **AR (and us) = data-driven precision; Levitate = relationship warmth + AI ease** (tag + AI-personal content, keep-in-touch). On segmentation AR ≫ Lev; on its own axis Lev wins (AI email, AI tagging game, tag logic, branching, YOLO mode).

### Takeaways

1. Our segmentation differentiator targets **AR, not Levitate** — beating Lev at segmentation is a non-goal.
2. Levitate validates how much load **tags** carry → reinforces the tag→segment bridge and PL-side tags as load-bearing.
3. The sweet spot — **"Levitate ease + AR depth" — is exactly tier-1** (PL-authored named Segments: simple surface, deep engine underneath).

Placed in §8 (competition area, after the §8.4–8.6 investigation subsections) rather than §12, which is reserved for undiluted client voice.

---

## 2026-06-01 — `[research]` `[brainstorm]` `[docs]` Condition categories (category-first builder) added to `segments.md`

Continuing the Klaviyo teardown (Martin driving, screenshots + their condition reference doc). Added a "Beyond PoC: condition categories (category-first builder)" subsection to the predicate-AST area of `segments.md`, refined the tier-2 builder sketch to be category-first, and added open question #11.

### The finding

Klaviyo's segment builder makes the **condition category the first choice**, and the category swaps the entire sub-builder underneath — field source, operators, quantifiers, value editor. A leaf condition is *not* a uniform `(field, operator, value)` triple; different condition *kinds* have different grammars. Klaviyo's seven categories (per their docs): What someone has done (events: frequency + recency), Properties about someone (attributes), Proximity to a location, In/not in the EU (GDPR), In/not in a list (membership + temporal), Can/cannot receive marketing (consent, fixed semantics), Predictive analytics. Same idea as Adobe's Attributes/Events/Audiences tabs.

### Applied to PL

Adopted the model; the **category set is domain-specific** because we anchor on Account/Policy/Contact/… (not always Person) and query the anchor *plus its related insurance records*. Candidate PL categories (table in the doc): Properties about the anchor (`rule`), Related insurance records / quantified (`quantifier` — the differentiator), Email/SMS engagement (`quantifier` over sends), Consent/marketing eligibility (specialized `rule`, critical for "exclude unsubscribed"), In/not in another Segment (≈ tier-3), Tags/PL-side annotations (PL-side `rule`), Location, Predictive (out).

Key points captured:
- **Category selects the AST node + sub-builder.** Supersedes the old tier-2 sketch's "pick a field, then infer if it's a quantifier" — now category-first.
- The "Related records" category *is* the complexity-ladder quantifier surfaced as a first-class category (Klaviyo's "has done" = same machinery), reinforcing the CNF decision (quantifier in the category/leaf, boolean layer flat).
- Consent / segment-membership / tags being distinct categories confirms they're not generic field predicates.
- **Two PL-only wrinkles:** (a) categories are **anchor-dependent** (available fields + child collections change with the anchor); (b) **engagement & consent live on contacts**, so on a non-Contact anchor they silently become a quantifier over the account's contacts — "exclude unsubscribed" on an Account-anchored Broadcast needs a sensible default contact-quantifier rather than forcing the user to express it.

Open question #11 logs what's left to lock: the final category list, Tags-as-category vs folded-into-Properties, the default contact-quantifier for engagement/consent on non-Contact anchors, and whether "in/not in another Segment" is an inline category or only the tier-3 recipe (avoid two ways to do one thing).

---

## 2026-06-01 — `[research]` `[brainstorm]` `[docs]` Boolean shape pinned to CNF (Klaviyo segment-builder teardown)

Refined `segments.md`'s predicate-AST design after pulling apart Klaviyo's segment builder live (Martin driving, screenshots) and confirming against Klaviyo's docs. Added a "Boolean shape: CNF within a Segment, union across Segments" subsection to the predicate-AST section + open question #10.

### What the Klaviyo teardown established

Klaviyo's standard segment builder is **pinned to CNF** — a top-level AND of OR-groups, exactly one level of nesting. Confirmed from their docs:

- *"the OR connector acts as if it's contained within parentheses … sandwiched between 2 AND connectors"* — OR binds tighter; it's the **inner** operator.
- Condition groups are **joined by a hardwired AND** (Klaviyo's API model); there is no top-level OR.
- Consequence observed in the UI: flipping an inner OR to AND **ejects** the condition to the top level. So `(A OR B) AND (C OR D)` is buildable; **`(A AND B) OR (C AND D)` is not.** A Klaviyo community thread confirms the standard builder doesn't support that DNF shape.

(Process note: took two wrong turns reading the toggle states off screenshots before going to the docs — the docs settled it. Lesson logged: go to source earlier for behavioral claims.)

### Decision captured

- **Single-Segment predicate = CNF** (AND-of-OR-groups, one nesting level). Not a freely-nested AND/OR tree. Matches both Klaviyo and the research doc's "cap visible nesting at 2 levels."
- **DNF / union-of-personas (`(A AND B) OR (C AND D)`) is handled by tier-3 composition** (build each AND-group as a Segment, `union` them), not inside the predicate. Klaviyo's own escape hatch is "make separate segments"; our composition layer is the first-class version. Every formula has a CNF, so nothing is strictly inexpressible in one Segment — but DNF intent blows up combinatorially in CNF, which is the signal it belongs in composition.
- **Quantifier / counting stays in the leaf** (Mixpanel-sentence "≥ 2 times" pattern), keeping the relational axis (the complexity ladder) orthogonal to the boolean axis so the group tree never has to nest for a relational fact.
- Resolves the prior vague "Mixing AND with OR requires nesting" note in the AST section to *exactly one level — CNF*.

This is a beyond-PoC AST refinement (PoC tier-1 SQL Segments are unconstrained); the relevance is for the tier-2 client builder and the eventual AST compiler.

---

## 2026-06-01 — `[brainstorm]` `[docs]` Fifth companion doc (cross-cutting): `dynamic-content.md`

Created [`dynamic-content.md`](dynamic-content.md) — a cross-cutting companion doc (not tied to one primitive) for rendering related data into a message. Driven by Martin's question: a Segment anchored on Account returns *accounts*, but the email body needs to list each account's *renewing policies* — a filtered child collection, a different dataset than the one the Segment returned.

### The framing that anchors the doc

**Existence vs. enumeration.** A `count(...) > 0` / `any` Account-anchored Segment computes a yes/no test ("does at least one matching policy exist?") and returns accounts. It does not return *which* policies matched. The email needs the actual rows. Same predicate underneath, used as a boolean filter by the Segment vs. an enumerated list by the Template.

**The governing principle:** the list shown in the email must be exactly the set that qualified the recipient — so the displayed collection must be *derived from the same condition* that established membership, never authored separately (or the two drift and you email someone "your policies are renewing: [all of them]").

**The mental model:** a message renders against a *recipient context* = one recipient + the records that resolved to them + that set's related data. Both viable paths converge on this one abstraction.

### Three paths captured (C added at Martin's request)

- **Path A — Account-anchored, expose the matched child set.** `json_agg` the matching policies in the resolve query; Template loops the collection. One email per account falls out free; set is non-empty by construction. **PoC recommendation** (one query change, no new fanout machinery).
- **Path B — Policy-anchored, roll up to the account.** Segment returns the policies directly; recipient resolution groups by account → one email listing all matches. Cleaner long-term; needs roll-up fanout (N rows → 1 message) as a first-class capability.
- **Path C — render-time lookup from inside the Template (SFMC `LookupRows` model).** Added this round. Maximally flexible (can pull data the Segment never matched on) but puts a filter *inside the Template*, separate from the Segment → drift risk, so it violates the governing principle for the qualifying-set case. **Posture:** A/B for the qualifying list; C reserved for *supplementary* related data (claims history, last payment) where there's no qualifying-set to stay in sync with.
  - **Flagged unverified:** Martin's recollection that AR may expose something in the Path-C family — logged as a research item to confirm against an AR walkthrough, not asserted as fact.

### Other content

Template contract extended (declare expected *collection slots*, not just anchor; aggregates + conditionals/pluralization over the collection). Where-it-fits section assigning ownership across the four primitives (Segment = what matched + the matched set; Template = how it renders; Broadcast/Automation = recipient resolution + fanout/roll-up). Implementation details: Path-A `json_agg` query, Path-B group-by-fanout, Path-C render-time lookup, and the normalized `recipient_context` object. 7 open questions — most notably matched-set ownership (Segment vs. campaign wiring), A-vs-B PoC default, and confirming the AR/Path-C parallel.

Working doc Companion docs header + Reference section updated to point at the new doc.

---

## 2026-06-01 — `[brainstorm]` `[docs]` Segment complexity ladder added to `segments.md`

Added a new section to [`segments.md`](segments.md), **"The complexity ladder — flat predicates to quantified relations"**, placed right after the three-tiers (authorship) section and before the library section. Driven by Martin wanting to understand the Segment concept in depth — specifically the spectrum from "select accounts where status = X" to "accounts with at least N policies of type Y with premium < Z."

### The core distinction the section draws

Authorship tier (*who* builds a Segment) and predicate complexity (*what* the criteria can express) are **orthogonal axes**. The doc already covered tiers; this section covers the second axis explicitly for the first time.

### The ladder (anchor = Account held constant)

- **Rung 0** — single predicate on the anchor (`status = active`)
- **Rung 1** — several anchor predicates, AND/OR (flat; where most marketing tools max out)
- **Rung 2** — predicate on a *related* entity → forces the **quantifier** (`any`/`all`/`none`). The conceptual cliff: filtering a table vs. asking a question about a related set.
- **Rung 3** — multiple conditions on the child → the **same-row trap** ("same policy?" vs "any policy?"). Flagged as the #1 footgun in relational segmentation.
- **Rung 4** — counting (existence → threshold count, "at least 2")
- **Rung 5** — multiple child collections, mixed quantifiers, **negation/quantifier interaction** ("no policy of type X" ≠ "a policy that is not type X")
- **Rung 6** — computed / canonical fields + status guards
- **Rung 7** — cross-source (AMS + PL-side data in one expression)
- **Rung 8** — composition (tier 3; a different *level*, combining whole answers)

### Load-bearing insight

**Anchor choice moves the complexity.** The same intent ("auto policies under $Z") is a flat rung-1 predicate when anchored on Policy but a quantified rung-3/4 predicate when anchored on Account — and returns a different result shape. This is why anchor is immutable and why cross-anchor lifting is the bridge. Section closes by mapping the ladder back onto the tiers: every rung is reachable by PL authors at PoC (hand-written SQL), but rungs 2–5 are exactly what makes tier-2 client authoring hard to expose safely — the concrete reason tier 2 is deferred.

No new decisions to ratify — this consolidates and names concepts already implicit in the doc (quantifiers, same-row scoping, canonical fields, composition). Pure conceptual clarification. Open spots noted for later: same-row scoping default, count-threshold UX, and vacuous-truth behavior of `all` over an empty collection.

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
