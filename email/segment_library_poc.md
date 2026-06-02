# Tier-1 PoC Segment Library + Canonical-Field Seed

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md) and [`segments.md`](segments.md). The concrete tier-1 (PolicyLift-authored) Segments we ship at PoC, derived from the prioritized client use cases in working-doc §12.2 — and, by construction, the **canonical-field seed** those Segments require. This is the artifact that turns the segmentation *model* into actual segment definitions.

**Created:** 2026-06-02

**Related:** [`segments.md`](segments.md) · [`dynamic-content.md`](dynamic-content.md) · [`automations.md`](automations.md) · [`concepts_working_doc.md`](concepts_working_doc.md) (§12.2 use cases) · [`changelog.md`](changelog.md)

---

> **⚠️ Provisional per-AMS resolutions.** The field paths and per-AMS logic below are a **seed**, derived from brainstorm signal (Marker / HawkSoft), the worked example in `segments.md`, and §12.2 — **not verified against the live CXP schema.** The CXP data-model docs may be stale; confirm every resolution against the actual `accounts.ams_data` JSONB and the sync code before implementing. Where a resolution isn't known for an AMS, it's marked **TBD** rather than guessed. PoC onboards Marker (HawkSoft), so HawkSoft is specced concretely and other AMSes are stubs.

At PoC, only **tier 1** (PL-authored Segments) and **tier 3** (composition) ship — clients pick from this library and combine, but don't author from scratch (see [`segments.md`](segments.md) authorship tiers). PL hand-writes the SQL, including the per-AMS branching, quantifiers, and any `status = active` filters; there is no canonical-field *catalog* as a separate system yet. This doc's Part 1 is the **proto-catalog**: the fields that recur across the library, named once so the SQL is consistent.

---

## Part 1 — Canonical-field seed

The fields the §12.2 use cases need. Type drives operators.

| Field id | Display | Entity | Type | Operators |
|---|---|---|---|---|
| `policy.status` | Policy status | Policy | enum | `eq` / `in` |
| `policy.substatus` | Policy substatus | Policy | enum | `eq` / `in` |
| `policy.type` | Line of business | Policy | enum | `eq` / `in` |
| `policy.carrier` | Carrier | Policy | enum/string | `eq` / `in` |
| `policy.effective_date` | Effective date | Policy | date | `before` / `after` / `between` |
| `policy.renewal_date` | Renewal date | Policy | date | `before` / `after` / `between` |
| `policy.renewing_in_days` | Days until renewal | Policy | number (derived) | `lte` / `gte` / `between` |
| `policy.sold_date` | Sold date | Policy | date | `before` / `after` / `between` |
| `policy.days_since_sold` | Days since sold | Policy | number (derived) | `lte` / `gte` / `between` |
| `account.status` | Account status | Account | enum | `eq` / `in` |
| `contact.nps_score` | Latest NPS score | Contact | number (PL-side) | `gte` / `lte` / `eq` |

### Resolution notes (per-AMS, provisional)

- **`policy.renewing_in_days`** — *prefer* `renewal_date` directly where the AMS carries it reliably; *fall back* to `effective_date + term` where it doesn't (AR's approach — Effective Date is more universal/consistent). **The term is agency-configurable, not a constant** (agencies represent renewal differently; not every book is a clean 1-year term) — see the renewal-proxy note in [`segments.md`](segments.md). HawkSoft: confirm whether a reliable renewal date exists; if not, `effective_date + <agency_term>`. EZLynx: `renewal_date` direct (per the `segments.md` example). Other AMSes: **TBD**. *Authoring note:* renewal-type segments using this field should also include `status = active` — a plain condition, not special machinery — because canceled policies carry stale/unreliable dates and you'd otherwise email canceled customers (Marker §12.1).
- **`policy.status` / `policy.substatus`** — HawkSoft: status values include `"Cancelled (Pending)"`; **substatus is editable/readable only on certain statuses** (Cancellation / Non-Renewed / Moved / Rejected — *not* New Business / Rewrite; working-doc N1). Substatus value `"Non-Payment"` is the missed-payment signal. The canonical `status` enum must map per-AMS status strings to a normalized set; **mapping TBD** beyond HawkSoft.
- **`policy.type` (LOB)** — requires a **policy-type mapping** per AMS (AR has an explicit "map your policy types" step; we need the equivalent). Normalized values e.g. `personal_auto`, `home`, `umbrella`, … Mapping **TBD**; seed with the LOBs §12.2 needs (`personal_auto`, `home`).
- **`policy.carrier`** — normalized carrier identity; the agency's *bundle set* (carriers it bundles home+auto with) is **agency-configured**, not global.
- **`policy.sold_date` / `policy.days_since_sold`** — HawkSoft exposes a **Sold Date** (the §12.2 welcome-kit signal). `days_since_sold = now() - sold_date`. Other AMSes: **TBD**.
- **`contact.nps_score`** — **PL-side data**, not from the AMS — depends on NPS responses being captured (survey runtime). Usually scoped to the latest response within a window. Not available until NPS collection exists.

---

## Part 2 — The tier-1 Segments

Each block: anchor · category · predicate (plain + shape) · per-AMS notes · display columns · default fanout · how it's used (Broadcast / Automation, enrollment + dynamic-content posture). Predicates are **CNF** (AND of OR-groups) per [`segments.md`](segments.md); quantifiers over child collections are named explicitly. (`status = active` etc. are just conditions in the predicate — no separate "guard" concept.)

### S1 — Policies renewing in N days  *(Renewal Reminders — highest priority)*

- **Anchor:** Policy · **Category:** Renewal
- **Predicate:** `status = active` **AND** `renewing_in_days BETWEEN 0 AND N` (default N = 30) — optionally **AND** `type IN {…}` to scope to a line of business. (The `status = active` is here for the canceled-policy-stale-date reason in Part 1 — just a condition.)
- **Per-AMS:** the `renewing_in_days` resolution above (prefer renewal_date, else effective + agency term).
- **Display (Policy):** policy_number, type, carrier, effective_date, renewal_date, account name.
- **Fanout:** Policy → named insured on that policy.
- **Used by:** the Renewal Automation. **Per-policy enrollment** (one enrollment per renewing policy → clean drift, AR-style); **re-resolve at send**; **exit-on-no-longer-match** (e.g. policy canceled or renewed). Date-anchored, so a continuous/newly-entering policy works cleanly. *Parameters:* the window `N` and the LOB scope.
- *Note:* the account-bundled "all your renewing policies in one email" variant (Path A) is **post-PoC** (needs roll-up + count-tolerant content — see [`dynamic-content.md`](dynamic-content.md)).

### S2 — Pending cancellation, non-payment  *(Cancellations — highest priority; Marker)*

- **Anchor:** Policy · **Category:** Lifecycle / Retention
- **Predicate:** `status = "Cancelled (Pending)"` **AND** `substatus = "Non-Payment"`. (Substatus is only readable on this status, so the predicate is self-consistent; N1.)
- **Per-AMS:** HawkSoft concrete (above). Substatus is a HawkSoft concept — **the equivalent on other AMSes is TBD**; this Segment may be HawkSoft-only at first (mark `ams_scope = ['hawksoft']`).
- **Display (Policy):** policy_number, type, carrier, account name, cancellation/effective date.
- **Fanout:** Policy → named insured.
- **Used by:** the Cancellation Automation (Marker's first, time-sensitive one). Per-policy enrollment; exit if the policy is reinstated (status → active) — i.e. exit-on-no-longer-match doubles as the "they paid, stop the save sequence" exit.

### S3 — Newly sold accounts  *(Welcome Kits — highest priority)*

- **Anchor:** Account · **Category:** Lifecycle / Onboarding
- **Predicate:** has a policy where `days_since_sold <= N` (default N = 7–14) — i.e. `any` policy with a recent Sold Date. *(Preferred over "account.status became Active," per the Sold-Date principle — a date condition, not a state-transition.)*
- **Quantifier:** `any` over the account's policies (existence of a recently-sold policy).
- **Per-AMS:** `sold_date` / `days_since_sold` (HawkSoft has Sold Date; others **TBD**).
- **Display (Account):** account name, primary contact, earliest sold_date, first policy type.
- **Fanout:** Account → primary contact.
- **Used by:** the Welcome Kit Automation. **Enrollment policy = newly-entering only** — the textbook case (§12.2): avoids the Reach failure of blasting the whole existing active book. (Because the predicate is date-anchored — "sold in last N days" — even continuous enrollment approximates newly-entering and excludes the backlog.) **Never re-enroll** (you're welcomed once).

### S4 — Cross-sell: Home without Auto  *(Cross-Sells — medium priority)*

- **Anchor:** Account · **Category:** Cross-sell
- **Predicate:** `any` policy where (`type = home` **AND** `carrier IN {agency bundle set}` **AND** `status = active`) **AND** `none` policy where (`type = personal_auto` **AND** `status = active`).
- **Quantifiers:** `any` over policies (an active Home with a bundle carrier) + `none` over policies (no active Auto). **Same-row** scoping on the Home clause (type *and* carrier on the *same* policy). The `none(Auto)` is the negation/quantifier case from the [complexity ladder](segments.md) rung 5; the `any(Home)` requirement also **guards the vacuous-truth trap** — an account with zero policies satisfies `none(Auto)` vacuously but fails `any(Home)`, so it's correctly excluded.
- **Per-AMS:** LOB mapping (`home`, `personal_auto`) + carrier normalization; bundle set is **agency-configured**.
- **Display (Account):** account name, primary contact, home carrier, home premium.
- **Fanout:** Account → primary contact.
- **Used by:** Broadcast (one-off cross-sell push) or a nurture Automation. *Parameters:* the X/Y LOB pair and the bundle-carrier set, so the same shape powers "Auto without Home," etc.

### S5 — NPS promoters  *(Reputation / NPS — medium priority)*

- **Anchor:** Contact · **Category:** Reputation
- **Predicate:** `nps_score >= 9` (latest response, optionally within last N days).
- **Per-AMS:** none — **PL-side data**; requires NPS responses captured. Unavailable until NPS collection ships.
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

1. **Per-AMS resolutions beyond HawkSoft** — `renewing_in_days`, `status`/`substatus` mapping, `type` (LOB) mapping, `sold_date` for EZLynx / Sentry / QQCatalyst / Momentum / AgencyMatrix / NASA. Each is a confirm-against-live-data task. PoC needs only HawkSoft (Marker).
2. **Renewal term default + per-agency config** — confirm the real default with Alex (the `+300` in the `segments.md` example looked low for a 1-yr term); decide where the term is configured (per-agency, per-AMS, per-LOB?).
3. **Policy-type (LOB) mapping mechanism** — the equivalent of AR's "map your policy types." Where does the mapping live, who maintains it?
4. **Cancellation Segment AMS scope** — is S2 HawkSoft-only at PoC, or do we define the substatus-equivalent for the next agency's AMS?
5. **NPS data dependency** — S5 is blocked on NPS response capture existing as PL-side data; sequence it after the survey runtime.
6. **Account- vs policy-anchoring for Welcome Kit (S3)** — anchored on Account here (welcome the customer once); confirm we don't want a per-policy welcome for multi-policy new customers.
7. **Bundle-carrier set source (S4)** — where the agency declares which carriers it bundles (agency settings? a Segment metadata block?).
