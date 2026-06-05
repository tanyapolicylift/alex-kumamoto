# Tier-1 PoC Segment Library

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md) and [`segments.md`](segments.md). The concrete tier-1 (PolicyLift-authored) Segments we ship at PoC, derived from the prioritized client use cases in working-doc §12.2 — plus the `ams.` / `pl.` fields they read. This is the artifact that turns the segmentation *model* into actual segment definitions.

**Created:** 2026-06-02

**Related:** [`segments.md`](segments.md) · [`dynamic-content.md`](dynamic-content.md) · [`automations.md`](automations.md) · [`concepts_working_doc.md`](concepts_working_doc.md) (§12.2 use cases) · [`changelog.md`](changelog.md)

---

> **⚠️ Provisional field paths.** The `ams.*` field locations below are a **seed**, derived from brainstorm signal (Marker / HawkSoft), the worked example in `segments.md`, and §12.2 — **not verified against the live CXP schema.** The CXP data-model docs may be stale; confirm every `ams.*` path against the actual `accounts.ams_data` JSONB / CXP columns and the sync code before implementing. PoC onboards Marker (HawkSoft), so HawkSoft is specced concretely; other AMSes are out of scope until they onboard.

At PoC, only **tier 1** (PL-authored Segments) and **tier 3** (composition) ship — clients pick from this library and combine, but don't author from scratch (see [`segments.md`](segments.md) authorship tiers). PL hand-writes the SQL against fields by source — **`ams.*`** (from the AMS) and **`pl.*`** (from PolicyLift) — with computed concepts written **inline** (no named `calc.*` fields yet). With one AMS and PL-only authoring there is **no canonical / normalization layer** at PoC (see [`segments.md` → Fields by source](segments.md)); each `ams.*` field resolves to one concrete HawkSoft location.

---

## Part 1 — The fields these segments read

The `ams.*` (AMS-sourced) and `pl.*` (PolicyLift-sourced) fields the §12.2 use cases need. Type drives operators. Derived concepts (e.g. "days until renewal," "days since sold") are **not fields** here — they're written inline from the date fields below, and would only become named `calc.*` fields later (see `segments.md`).

| Field | Display | Entity | Type | Operators |
|---|---|---|---|---|
| `ams.policy.status` | Policy status | Policy | enum | `eq` / `in` |
| `ams.policy.substatus` | Policy substatus | Policy | enum | `eq` / `in` |
| `ams.policy.type` | Line of business | Policy | enum | `eq` / `in` |
| `ams.policy.carrier` | Carrier | Policy | enum/string | `eq` / `in` |
| `ams.policy.effective_date` | Effective date | Policy | date | `before` / `after` / `between` |
| `ams.policy.renewal_date` | Renewal date | Policy | date | `before` / `after` / `between` |
| `ams.policy.sold_date` | Sold date | Policy | date | `before` / `after` / `between` |
| `ams.account.status` | Account status | Account | enum | `eq` / `in` |
| `pl.contact.nps_score` | Latest NPS score | Contact | number | `gte` / `lte` / `eq` |

*Derived inline (not fields): "days until renewal" from `ams.policy.renewal_date` (or `effective_date + term`); "days since sold" from `ams.policy.sold_date`.*

### Field notes (HawkSoft, provisional)

- **Days until renewal** (computed inline) — *prefer* `ams.policy.renewal_date` directly if HawkSoft carries it reliably; *fall back* to `ams.policy.effective_date + term` if not (AR's approach — Effective Date is more universal/consistent). **The term is agency-configurable, not a constant** (agencies represent renewal differently; not every book is a clean 1-year term) — see the renewal-proxy note in [`segments.md`](segments.md). Confirm with Alex which HawkSoft uses. *Authoring note:* renewal-type segments should also include `ams.policy.status = 'active'` — a plain condition — because canceled policies carry stale dates and you'd otherwise email canceled customers (Marker §12.1).
- **`ams.policy.status` / `ams.policy.substatus`** — HawkSoft status values include `"Cancelled (Pending)"`; **substatus is readable only on certain statuses** (Cancellation / Non-Renewed / Moved / Rejected — *not* New Business / Rewrite; working-doc N1). Substatus value `"Non-Payment"` is the missed-payment signal.
- **`ams.policy.type` (LOB)** — HawkSoft's line-of-business values, used directly (seed with what §12.2 needs: auto, home). *(When a 2nd AMS onboards, "is this an auto policy" may need a `calc.*` normalization — AR's "map your policy types" — but that's deferred.)*
- **`ams.policy.carrier`** — the carrier as HawkSoft records it; the agency's *bundle set* (carriers it bundles home+auto with) is **agency-configured**, not global.
- **`ams.policy.sold_date`** — HawkSoft exposes a **Sold Date** (the §12.2 welcome-kit signal); "days since sold" = `now() - sold_date`, inline.
- **`pl.contact.nps_score`** — **PL-side**, not from the AMS — depends on NPS responses being captured (survey runtime). Usually scoped to the latest response within a window. Not available until NPS collection exists.

---

## Part 2 — The tier-1 Segments

Each block: anchor · category · predicate (plain + shape) · per-AMS notes · display columns · default fanout · how it's used (Broadcast / Automation, enrollment + dynamic-content posture). Predicates are **CNF** (AND of OR-groups) per [`segments.md`](segments.md); quantifiers over child collections are named explicitly. (`status = active` etc. are just conditions in the predicate — no separate "guard" concept.)

### S1 — Policies renewing in N days  *(Renewal Reminders — highest priority)*

> **Revised 2026-06-03 — renewal is now a date-triggered *Automation*, not this windowed Segment.** A relative-time Segment churns daily (the membership-drift / batch-exit problem, `research_segment_builder_ux.md` §8.4). Instead the renewal program **triggers off `ams.policy.renewal_date` ± offset** (recurring, reschedule-on-change), filtered to `status = 'active'` — see `automations.md` (date-property trigger). The predicate below survives only as a **Broadcast** audience ("who's renewing this month"), not as the recurring renewal mechanism.

- **Anchor:** Policy · **Category:** Renewal
- **Predicate:** `ams.policy.status = 'active'` **AND** `ams.policy.renewal_date BETWEEN now() AND now() + N days` (default N = 30) — optionally **AND** `ams.policy.type IN {…}` to scope to a line of business. ("Days until renewal" is written inline from `renewal_date`, or `effective_date + term` if HawkSoft lacks a reliable renewal date — see Part 1. The `status = 'active'` is just a condition, for the stale-date reason.)
- **Fields:** see the renewal note in Part 1 (prefer `renewal_date`, else `effective_date + agency term`).
- **Display (Policy):** policy_number, type, carrier, effective_date, renewal_date, account name.
- **Fanout:** Policy → named insured on that policy.
- **Used by:** a **Broadcast** (one-off "policies renewing this month") — *not* the recurring renewal, which is a date-triggered Automation (see callout above + `automations.md`). As a Broadcast audience: per-policy rows, fanout to named insured.
- *Note:* the account-bundled "all your renewing policies in one email" variant (Path A) is **post-PoC** (needs roll-up + count-tolerant content — see [`dynamic-content.md`](dynamic-content.md)).

### S2 — Pending cancellation, non-payment  *(Cancellations — highest priority; Marker)*

- **Anchor:** Policy · **Category:** Lifecycle / Retention
- **Predicate:** `ams.policy.status = 'Cancelled (Pending)'` **AND** `ams.policy.substatus = 'Non-Payment'`. (Substatus is only readable on this status, so the predicate is self-consistent; N1.)
- **Fields:** HawkSoft-specific (substatus is a HawkSoft concept). Fine at PoC (HawkSoft is the only AMS); mark `ams_scope = ['hawksoft']` so it's clear this Segment doesn't claim to be cross-AMS.
- **Display (Policy):** policy_number, type, carrier, account name, cancellation/effective date.
- **Fanout:** Policy → named insured.
- **Used by:** the Cancellation Automation (Marker's first, time-sensitive one). Per-policy enrollment; exit if the policy is reinstated (status → active) — i.e. exit-on-no-longer-match doubles as the "they paid, stop the save sequence" exit.

### S3 — Newly sold accounts  *(Welcome Kits — highest priority)*

- **Anchor:** Account · **Category:** Lifecycle / Onboarding
- **Predicate:** `count(ams.policy where sold_date >= now() - N days) > 0` (default N = 7–14) — i.e. the account has a recently-sold policy. *(Preferred over "`ams.account.status` became Active," per the Sold-Date principle — a date condition, not a state-transition.)*
- **Quantifier:** `count(...) > 0` over the account's policies (existence of a recently-sold policy).
- **Fields:** `ams.policy.sold_date` (HawkSoft Sold Date); "days since sold" written inline.
- **Display (Account):** account name, primary contact, earliest sold_date, first policy type.
- **Fanout:** Account → primary contact.
- **Used by:** the Welcome Kit Automation — **date-property trigger on `sold_date`** (revised 2026-06-03). Date-anchored, so enrollment is newly-entering by construction and never touches the existing book — the §12.2 "don't blast the backlog" win, for free. **Never re-enroll** (welcomed once). *(The standing "newly sold" predicate below still works as a Broadcast audience.)*

### S4 — Cross-sell: Home without Auto  *(Cross-Sells — medium priority)*

- **Anchor:** Account · **Category:** Cross-sell
- **Predicate:** `count(ams.policy where type = 'home' AND carrier IN {agency bundle set} AND status = 'active') > 0` **AND** `count(ams.policy where type = 'auto' AND status = 'active') = 0`.
- **Quantifiers:** `count(...) > 0` over policies (an active Home with a bundle carrier) + `count(...) = 0` (no active Auto). **Same-row** scoping on the Home clause (type *and* carrier on the *same* policy). The Auto `count = 0` is the negation/quantifier case from the [complexity ladder](segments.md) rung 5; the Home `count > 0` requirement also **guards the vacuous-truth trap** — an account with zero policies satisfies "no active Auto" vacuously but fails "has a Home," so it's correctly excluded.
- **Fields:** `ams.policy.type` values used directly (auto, home); `ams.policy.carrier` as recorded; the bundle set is **agency-configured**.
- **Display (Account):** account name, primary contact, home carrier, home premium.
- **Fanout:** Account → primary contact.
- **Used by:** Broadcast (one-off cross-sell push) or a nurture Automation. *Parameters:* the X/Y LOB pair and the bundle-carrier set, so the same shape powers "Auto without Home," etc.

### S5 — NPS promoters  *(Reputation / NPS — medium priority)*

- **Anchor:** Contact · **Category:** Reputation
- **Predicate:** `pl.contact.nps_score >= 9` (latest response, optionally within last N days).
- **Fields:** `pl.contact.nps_score` is **PL-side**; requires NPS responses captured. Unavailable until NPS collection ships.
- **Display (Contact):** name, email, account name, nps_score, response date.
- **Fanout:** Contact → self.
- **Used by:** the 2-stage Reputation Automation (collect NPS → branch on score → request Google review). This Segment is the "promoters" filter that gates the Google-review ask. *(The "customer just signed" reputation trigger reuses S3's newly-sold pattern.)*

### Not specced — Renewal Notices

Distinct from S1 (a formal/compliance *notice at* renewal, vs. a pre-renewal *reminder*). Alex flagged it as tricky/untested ("never really tested we could measure this"). **Left open** — no committed predicate until we confirm we can measure it.

---

## Part 3 — Cross-cutting decisions these force

Speccing real Segments resolves the open questions that were abstract in `segments.md`:

- **Per-anchor display schemas (was open Q4).** Confirmed and extended:
  - **Policy →** policy_number, type, carrier, effective_date, renewal_date, account name (+ sold_date, cancellation date where relevant).
  - **Account →** account name, primary contact, status, total premium (+ sold_date for onboarding).
  - **Contact →** name, email, role, account name (+ nps_score for reputation).
  These are the columns for sample preview *and* audience verification — design them once; the per-Segment block above just selects from them.
- **Default fanout per anchor (was open Q5).** Confirmed: **Account → primary contact · Policy → named insured on that policy · Contact → self.** Every Segment above uses one of these; overrides live on the Broadcast/Automation.
- **The three semantic defaults** (flagged after the complexity ladder, now resolved on real cases):
  - **Same-row scoping default = same row.** S4's "Home *with* a bundle carrier" means one policy that is *both* — multiple predicates on the same child collection default to the *same* record. (Cross-collection clauses — `any(Home)` vs `none(Auto)` — are separate quantifier scopes.)
  - **Count threshold default = existence (`any`, ≥ 1).** None of the PoC set needs "≥ 2"; existence is the default, explicit counts are the exception.
  - **Vacuous truth is guarded by an existence requirement.** `all` / `none` over an empty child collection is vacuously true; pair it with an `any` (as S4 does with `any(Home)`) so empty-collection records don't slip in. PL authors must remember this when writing `none`/`all` predicates — it's a tier-1 authoring rule.

---

## Open / TBD

1. **Confirm the HawkSoft `ams.*` field paths** against live `ams_data` / CXP columns + sync code (not the possibly-stale docs): renewal date availability, status/substatus, type (LOB) values, sold_date. PoC needs only HawkSoft (Marker). *(Other AMSes — and any `calc.*` normalization — are out of scope until a 2nd agency onboards; that's the step-2/3 work in `segments.md` → Fields by source.)*
2. **Renewal term default + per-agency config** — confirm the real default with Alex (the `+300` in the `segments.md` example looked low for a 1-yr term); decide where the term is configured (per-agency? per-LOB?).
3. **Does HawkSoft give a reliable renewal date?** — if yes, use `ams.policy.renewal_date` directly and the effective+term math disappears at PoC. Confirm.
4. **Cancellation Segment AMS scope** — is S2 HawkSoft-only at PoC, or do we define the substatus-equivalent for the next agency's AMS?
5. **NPS data dependency** — S5 is blocked on NPS response capture existing as PL-side data; sequence it after the survey runtime.
6. **Account- vs policy-anchoring for Welcome Kit (S3)** — anchored on Account here (welcome the customer once); confirm we don't want a per-policy welcome for multi-policy new customers.
7. **Bundle-carrier set source (S4)** — where the agency declares which carriers it bundles (agency settings? a Segment metadata block?).
