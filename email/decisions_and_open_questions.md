# Email Automation — Decisions & Open Questions (review doc)

**Status:** Consolidated register pulled from all the `email/` docs so the team can review in one place. **Not a source of truth** — each item points back to its home doc, which stays authoritative. When a decision changes, change it there and update this.

**Created:** 2026-06-03 · **For:** review with Alex / Raghav / Mike

**Legend:** ✅ decided · 🔄 leaning (a default exists, not ratified) · 🔲 open (no lean yet) · ⏭️ deferred post-PoC

**Sources:** `[concepts_working_doc.md](concepts_working_doc.md)` (clusters §7, commitments §11, signal §12) · `[segments.md](segments.md)` · `[templates.md](templates.md)` · `[broadcasts.md](broadcasts.md)` · `[automations.md](automations.md)` · `[dynamic-content.md](dynamic-content.md)` · `[segment_library_poc.md](segment_library_poc.md)` · `[research_segment_builder_ux.md](research_segment_builder_ux.md)` · `[changelog.md](changelog.md)` · prototype `[blueprint.md](prototype/v1/blueprint.md)`

---

## 0. At a glance — the headlines

The product-shaping calls and the biggest unresolved questions, pulled from every section below. Read this first; the rest is detail.

### Key decisions (the shape of the product) ✅

1. **Four primitives:** Segment · Template · Broadcast · Automation. Everything else is a property or runtime artifact. *(§1)*
2. **Broadcast = scheduled send to a chosen Segment (Klaviyo Campaign); Automation = triggered flow (Klaviyo Flow).** The line is **scheduled vs triggered — not single-vs-series.** *(§1, §4, §5)*
3. **Automation enrollment is trigger-driven (newly-entering by construction).** The old three policies collapsed; the existing-book backlog is a one-time backfill or a Broadcast; the only repeat knob is re-entry. *(§5)*
4. **Renewal & date-anchored programs = date-property-triggered Automations, *not* "renewing in N days" Segments.** Windowed segments survive only as Broadcast audiences. *(§5)*
5. **Two-tier AMS data; segment on `ams.`* / `pl.*` by source; no canonical/cross-AMS layer at PoC** (`calc.`* deferred to the 2nd AMS). *(§1, §2)*
6. **Three-tier Segment authorship; PoC ships tier-1 (PL-built) + tier-3 (composition), delivered concierge/out-of-band** — no in-product "request a segment." *(§1)_*
7. **PoC scope is deliberately narrow:** email-only, send-now-only Broadcasts; four client surfaces + a shared pre-send verification step. *(§1, §4)*
8. **Typed field catalog** (type on the field drives operators — vs Klaviyo's schemaless cast); **Segment boolean = CNF** (DNF → tier-3 composition). *(§2)*
9. **Managed vs Regular segment kinds** (PL-built read-only vs client-built editable). *(§2, §8)*

### Biggest open questions (decide these first) 🔲🔄

1. **Tagging strategy** — PL-side vs AMS-only vs both (HawkSoft substatus structurally limited). 🔄 PL-side leading. *(N1)*
2. **Recipient-verification UX** — the load-bearing trust surface (Ley/Marker); shared Broadcast+Automation. 🔲 *(BR4/AU12)*
3. **Re-evaluation cadence** — nightly membership pass + lazy-at-send. 🔄 mainstream-confirmed; confirm for us. *(automations Q10)*
4. **Coverage / Coverage-Limit data** — blocks Insurance Center's state-min-auto / $100k-liability campaigns. 🔲 *(A6)*
5. **Matched-set ownership + Path A vs B** — does the Segment own the "explaining" collection? Standardize one render path. 🔄 Segment-owns / Path A. *(dynamic-content Q1/Q2)*
6. **Sender resolver design** — the chain + per-campaign/per-step overrides + verification preview. 🔲 *(BR3/AU8, §9.2)*
7. **Tier-2 client builder & `calc.`* timing** — both keyed to the 2nd-AMS threshold; confirm the trigger. 🔄 *(F4, SE2)*
8. **Approval mode** — YOLO vs Outbox, per-Step vs per-Automation. 🔲 *(BR6/AU13)*

---

## 1. Strategy & scope

### Decided ✅

- **Two-tier AMS data:** CXP abstraction layer + raw AMS jsonb preserved alongside; segmenter queries raw + PL annotations primarily. *(F3/F5, §4)*
- **No canonical/cross-AMS normalization at PoC.** Reference fields by source — `ams.`* (from AMS) / `pl.*` (from PolicyLift); computed concepts written inline. Named `calc.*` fields + per-AMS resolution deferred to the 2nd-AMS threshold. *(changelog 06-02)*
- **Three-tier Segment authorship:** tier-1 PL-built + tier-3 composition ship at PoC; tier-2 client builder later. *(F6)*
- **PoC delivery = concierge / out-of-band** service-request workflow; **no in-product "request a segment."** *(F6, changelog 06-02)*
- **Four primitives:** Segment / Template / Broadcast / Automation. "Audience" deprecated as a primary concept; Trigger / Fanout / Sender / Enrollment are *properties*, not peers. *(F7, §5)*
- **Broadcast = Klaviyo Campaign (scheduled); Automation = Klaviyo Flow (triggered).** The dividing line is **scheduled vs triggered — not single-vs-series.** *(06-03)*
- **PoC client surfaces:** Segment library + Template editor + Broadcast builder + Automation builder + pre-send verification. *(§5.7)*
- **Email only at PoC.** *(templates Q1)*

### Open / leaning

- 🔄 `**calc.`* catalog + per-AMS resolution** — introduce at the **2nd-AMS** threshold; not PoC. Resolution-function location (TS / config table / expression lang) and catalog versioning still 🔲. *(F4, §8.2 Q1/Q2, segments Q1/Q8)*
- 🔄 **Tagging** — PL-side tags leading; AMS-only fallback structurally blocked (HawkSoft substatus editable only on Cancellation/Non-Renewed/Moved/Rejected). *(N1)*
- 🔲 **AMS-as-source-of-truth vs PL** conflict — **demoted** (CXP not client-enabled yet); revisit when CXP enables for clients. *(A10)*

---

## 2. Segments

### Decided ✅

- **Anchor entity** is part of the Segment and immutable (Account / Policy / Contact / Claim / Quote); sets result-row shape. *(SE1)*
- **Segments are stateless** — a question, not a list; can't be "locked." *(segments.md)*
- **Boolean shape = CNF** (AND-of-OR-groups, one nesting level) within a Segment; DNF / union-of-personas → tier-3 composition. *(Klaviyo teardown)*
- **Category-first builder** model adopted (the category selects the sub-builder + AST node) — for the eventual tier-2 builder. *(06-01)*
- **"Status guard" is not a concept** — it's just a normal `status = active` condition. *(changelog 06-02)*
- **Composition operators:** include / intersect / except. *(segments.md)*
- **Per-anchor display schemas + default fanout** decided: Account → primary contact · Policy → named insured · Contact → self. *(segment_library_poc Part 3, segments Q5)*
- **Three semantic defaults:** same-row scoping default = same row; count default = existence (any ≥ 1); vacuous truth guarded by an existence requirement. *(segment_library_poc Part 3)*
- **Tier-1 PoC seed S1–S5** defined. **S1 renewal reframed → date-triggered Automation** (windowed segment is now a Broadcast tool only); **S3 welcome → `sold_date` date trigger.** *(segment_library_poc, 06-03)*
- **Typed field catalog** — type lives on the field and drives operators (explicit stance *vs* Klaviyo's schemaless query-time cast, which silently mis-segments). *(research §7.4)*
- **Managed vs Regular kinds:** Managed = PL/ops-built, read-only; Regular = client-built, editable. *(blueprint, changelog 06-02)*

### Open / leaning

- 🔄 **Composition stored vs on-Campaign** — Campaign-side at PoC; promote when clients ask. *(segments Q2)*
- 🔄 **Cross-anchor composition** — forbid at PoC (clear error); auto-lift later. *(segments Q3)*
- 🔲 **Tier-2 predicate vocabulary / simple builder** (SE2) — deferred; design TBD.
- 🔲 **Live count + sample preview** — two-number (exact-stale + estimated-fresh) pattern; build day-one or wait? *(SE3, research Q6)*
- 🔲 **Field discovery / "where does this come from in my AMS" UI** — trust-critical. *(SE4)*
- 🔄 **Canonical field customer-facing label** — "data field" / "merge field" / other. *(segments Q6)*
- 🔲 **Final tier-2 category list**; Tags as own category vs folded into Properties; default contact-quantifier for engagement/consent on non-Contact anchors; "in/not in another Segment" inline vs tier-3-only. *(segments Q11)*
- 🔲 **PL-built library exposure model** — auto-share per-AMS / opt-in / catalogued; global (`agency_id = null`) ownership + change control. *(SE7, segments Q9)*
- 🔲 **Sample preview details** — row count, format (table/cards), columns. *(research Q7)*

---

## 3. Templates

### Decided ✅

- **Channel split:** separate editors per channel, **unified data model** (channel discriminator + channel-shaped content).
- **Templates declare expected anchor(s)** (Account / Policy / Contact).
- **Brand assets live on Agency/Office**, referenced via tokens (`{agency.logo_url}`), not on the Template.
- **Conventions enforced at save**, per-agency, **hardcoded for Marker at PoC** (customer name + HawkSoft ID in subject; visible automation indicator in body). *(TE3/TE4)*
- **Versioning deferred** — edit-in-place + audit log + warning at PoC.
- **Cross-channel families are not a primitive.**
- **Email only at PoC.**

### Open / leaning

- 🔄 **Merge-token formalization** — hardcode vocabulary at PoC; formalize when tier-2 client authoring ships (same trigger as Segments). *(templates Q2)*
- 🔄 **Anchor declaration** — explicit, system pre-fills from detected tokens, user can edit. *(templates Q4)*
- 🔄 **Collection-token resolution** — Account-anchored Template using `{policy.*}` → "the policy that caused the match" (fallback: soonest-renewing active). *(templates Q5)*
- 🔄 **Plain-text fallback** — auto-generated + hidden at PoC. *(templates Q6)*
- 🔄 **Versioning default** — auto-follow with notifications; per-Campaign pin available. *(templates Q7, TE6)*
- ⏭️ **Localization** (multi-language) — post-PoC. *(templates Q9)*
- 🔄 **Brand-asset ownership** in multi-office agencies — office-level at PoC, producer-level later. *(templates Q10)*
- ⏭️ **Carrier-approved content variants** — future content gating by appointment/LOB. *(TE5)*

---

## 4. Broadcasts

### Decided ✅

- **= Klaviyo Campaign.** Scheduled send to a chosen Segment. Multi-message/channel *scheduled* send is still a Broadcast ("omnichannel campaign"), not an Automation. *(06-03)*
- **Send-now only at PoC** (no schedule picker, no time-zone/quiet-hours). Status lifecycle **Draft → Sending → Sent** (+ Failed); **no Cancel** (nothing to cancel without scheduling).
- **Pre-send recipient verification** is a load-bearing shared surface (Ley/Marker).
- **Test-send renders against a real recipient** (Klaviyo/Mailchimp pattern).
- `**sends` is shared infrastructure** (Broadcast + Automation), nullable `broadcast_id` / `automation_id`.
- **Bulk exclusions persist to the Broadcast's audit trail only**, not a contact-level suppression flag.
- **No edits to Sent Broadcasts** (duplicate to re-run).

### Open / leaning

- 🔄 **Account-anchored fanout default** — primary-contact at PoC; household-aware when the Household entity ships. *(broadcasts Q1, BR2)*
- 🔄 **Segment/Template changed mid-Draft** — referenced by ID, edits propagate; tolerate at PoC, add pinning if a client complains. *(broadcasts Q3/Q4)*
- 🔄 **Render preview on verification** — render on demand (click a row), not all up front. *(broadcasts Q5)*
- 🔄 **Bulk-exclusion persistence** — keep local to the Broadcast; persistent suppression is a separate consent-layer action. *(broadcasts Q6)*
- 🔄 **Status granularity** — no "Partially Sent"; per-recipient outcomes via Send records. *(broadcasts Q7)*
- 🔄 **Per-Broadcast categories** — one shared taxonomy across primitives (Renewal/Welcome/Cross-sell/…). *(broadcasts Q8)*
- 🔲 **Approval mode** (YOLO vs Outbox). *(BR6)*

---

## 5. Automations

### Decided ✅

- **= Klaviyo Flow.** Triggered, ongoing, per-person state. *(06-03)*
- **Enrollment is trigger-driven = newly-entering by construction.** The three policies (at-launch/newly-entering/continuous) **collapsed**. The existing-book/backlog is a **one-time op** (explicit "add current matches" backfill, or a Broadcast), not an ongoing mode. Repeat knob = **re-entry**. *(06-03, AU2)*
- **Trigger types:** added-to-segment (transition), metric/event, **date property** (offset + recurrence + reschedule-on-change), manual. **Two filter layers:** trigger filters (event data) + profile filters (record state). **Trigger fixed after save.** *(06-03)*
- **Date-property trigger is the primary renewal mechanism** — not a windowed segment (which churns daily). Corroborated by Katz/Eclipse ("use expiry dates, not status"). *(06-03)*
- **Three-bucket taxonomy:** date-anchored & state-transition → Automation; one-time-to-current-set → Broadcast.
- **PoC step types:** email, wait, exit. **Linear sequence** (no branching). **One entry trigger** per Automation at PoC.
- **Sender + recipient resolution shared with Broadcast** (per-Automation + per-Step overrides allowed).
- **Drift handling:** Segment stays stateless, the *enrollment* is stateful. Membership drift → exit conditions; data drift → **re-resolve at each send** (never freeze merge data at enrollment).
- **PoC drift defaults:** per-entity (per-policy) enrollment; re-resolve-at-send; exit-on-no-longer-match for lifecycle.
- **Hidden-trigger anti-pattern:** always surface the trigger at the header.
- **Sold-Date principle:** prefer a date-anchored entry over state-transition detection where a reliable date exists.

### Open / leaning

- 🔄 **Re-evaluation cadence** — lazy-at-send (content) + nightly membership pass (timely exits). Confirmed mainstream (Klaviyo 24h sweep); confirm for us. *(automations Q10)*
- 🔄 **Stop-on-reply** at Step level — yes for PoC (Resend tracks replies). *(automations Q7)*
- 🔄 **Multiple entry triggers** per Automation — single at PoC; multi likely later. *(automations Q3)*
- 🔄 **Enrollment-state granularity** — per (person, automation) vs per trigger-event; per-entity at PoC. *(automations Q4)*
- 🔄 **Cancellation deadline infra** — likely manual wiring for the first Automation (full builder won't exist). *(automations Q6)*
- 🔲 **Approval mode** (per-Step vs per-Automation; YOLO vs Outbox). *(AU13)*
- 🔲 **In-flight editing semantics** — editing an Automation while people are enrolled. *(automations "TBD")*
- 🔲 **Re-enrollment defaults per trigger category.** *(AU11)*
- ⏭️ **Branching / conditional steps** — post-PoC. *(AU7)*
- ⏭️ **Calendar-driven sub-pattern** (holiday calendar, per-date templates + toggles) — fit TBD. *(AU14)*
- ⏭️ **Account-bundled "all your renewing policies in one email"** (Path A roll-up; JAMCO same-date aggregation) — needs count-tolerant content + empty-set-exit; post-PoC. *(automations Q9, dynamic-content)*

---

## 6. Dynamic content (cross-cutting)

### Decided ✅

- **Recipient-context abstraction** — one shape (recipient + records that resolved to them + related data); Paths A/B converge on it.
- **Governing principle:** the displayed collection must be *derived from the same condition* that established membership (never authored separately).
- **AR uses Path B** (per-entity sequence anchoring), verified; **Path C** (render-time lookup) is not used in insurance and is reserved for *supplementary* data only.

### Open / leaning

- 🔄 **Matched-set ownership** — Segment owns the explaining collection (predicate lives there) vs per-campaign wiring. Segment-owns leaning. *(dynamic-content Q1)*
- 🔄 **Path A vs B as PoC default** — Path A (json_agg) for simplicity; standardize one so Templates target one context shape. *(dynamic-content Q2)*
- 🔲 **Collection-slot contract** — how a Template declares expected collections + validation. *(Q4)*
- 🔲 **Aggregates vocabulary** over collections (count/min/max/sum/first/sort). *(Q5)*
- 🔲 **Multiple matched collections / multi-anchor in one message** (renewing policies *and* open claims). *(Q7)*

---

## 7. Data model & runtime (mostly design-pending 🔲)

- **CXP entity gaps** (relevant to email): **Coverage/Limit** (blocks Insurance Center 🔲 A6), **Carrier** as entity (A5), **Claim** (A7), **Household** (A8), **Producer/CSR assignment** on account/policy (A9), **Key Fact** (N2), **Custom Field** (N3). Lead→Prospect lifecycle: HawkSoft blocks PL writeback; client-manual + observed-via-sync (A10).
- **Schema** — `automations` / `steps` / `enrollments` tables. 🔲
- **Send pipeline** — Steps → Send records; Resend events → enrollment state. 🔲
- **Send / Dispatch** record naming. 🔲
- **Consent layer** — marketing vs service-transactional; per-channel/per-category; suppression at send. 🔲 *(RT4)*
- **AMS writeback** — sends + replies as AMS activity notes (Marker wants this). 🔲 *(RT5)*
- **Reporting / attribution** — engagement → policy-level revenue, producer/carrier/LOB rollups (the differentiator). 🔲 *(RT6)*
- **Tenancy & branding** — multi-office, per-producer From, per-agency brand/footer. 🔲 *(RT7)*
- **Migration** — historical unsubscribe/consent import as consent/suppression records. 🔲 *(RT8)*

---

## 8. Prototype (disposable — `blueprint.md`)

### Decided ✅

- **Nav:** new **Campaigns** sidebar group (Segments / Templates / Broadcasts / Automations); Reach's Marketing ▸ E-Mails/Reviews left dimmed.
- **Segment Library** page built (Reach-style list, Managed/Regular badge, whole-row click).
- **Segment Detail = Klaviyo-style tabbed page**; first tab = the **anchor's results** (Policies/Accounts/Contacts), then **Edit Segment** + **Settings**. Built page + first tab.
- **Manage Segment** dropdown (Export) replaces the Use-in CTAs; **reachable estimate dropped**; styling pass (no tabular-nums; readable dates).

### Open / leaning

- 🔄 **Flagship detail example** — leave as the windowed "renewing in 30 days" segment (now a *Broadcast* example) vs swap to a broad "Active auto policies." Currently **left as-is**.
- 🔲 **Nav label** — "Campaigns" may roll into Marketing.
- 🔄 **Builder interactivity** — static snapshots vs minimal inline JS for add-condition/category-switch. Lean: a little JS for the Builder.
- 🔲 **Mock agency identity** — pick once, reuse across screens.

---

## 9. Client commitments (scope inputs, not open questions)

From `concepts_working_doc.md` §11 + §12.


| Customer             | Commitment                                                                | Area                                                   |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| The Insurance Center | State-minimum auto → "limits increasing at renewal" campaign              | Segment + Coverage (A6) — **blocked on coverage data** |
| The Insurance Center | $100k-liability home → recommend $300–500k                                | Segment + Coverage                                     |
| Marker               | Custom tags (e.g. home-inspection drip stops on substatus change)         | PL-side tags (N1)                                      |
| Marker               | **Cancellation Automation** (3-email, CSR sender, HawkSoft ID in subject) | Automation + Template                                  |
| Marker               | **Welcome Kit + Renewal Automations** (~2 wks)                            | Automation (date triggers)                             |
| Marker               | Prospect-list ingestion + per-list producer; emails from that producer    | Segment metadata (SE8) + sender                        |
| Marker               | Sender per campaign type (Renewal→CSR, Relationship→Producer, …)          | Sender resolver (§9.2)                                 |
| Marker               | Subject = name + HawkSoft ID; visible automation indicator                | Template conventions (TE3/TE4)                         |
| Marker               | Replies in HawkSoft activity stream                                       | AMS writeback (RT5)                                    |
| Marker               | Holiday calendar (per-date templates + toggles)                           | Automation sub-pattern (AU14)                          |
| JAMCO                | **Aggregated email for same-date home+auto**                              | Dynamic content roll-up — ⏭️ post-PoC                  |
| JAMCO                | Custom sender per touch                                                   | Sender resolver                                        |
| JAMCO                | Renewal emails removed once policy renews                                 | Exit conditions (AU10)                                 |
| Ley                  | Manual recipient review before send                                       | Verification (BR4/AU12)                                |
| Katz                 | NASA Eclipse field-level requirements                                     | Per-AMS field resolutions (F4)                         |


---

## 10. Deferred to post-PoC (explicit non-goals for now)

SMS / postcard / handwritten channels · tier-2 client Segment builder · `calc.`* canonical fields + per-AMS normalization · Broadcast scheduling + omnichannel multi-message · account-bundled "all your renewing policies" roll-up (JAMCO aggregation) · branching steps · approval modes · calendar sub-pattern · Household / Carrier / Coverage / Claim entities (except where a commitment forces Coverage) · reporting/attribution depth · Template versioning/pinning · localization · AI-assisted authoring.