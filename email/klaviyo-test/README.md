# Klaviyo segment-builder test harness

Dummy insurance subscribers for **rebuilding our tier-1 segments (S1–S5) inside Klaviyo**
and seeing where its builder strains — part of the AR/Klaviyo teardown
(see [`../research_segment_builder_ux.md`](../research_segment_builder_ux.md),
[`../segment_library_poc.md`](../segment_library_poc.md), [`../changelog.md`](../changelog.md)).

- **`generate_dummy_subscribers.py`** — reproducible generator (stdlib only, fixed seed). Re-run to regenerate.
- **`dummy_subscribers.csv`** — 150 fake profiles. Import this.

> Fake addresses use the RFC-2606 reserved `example.com` domain with a `+klaviyotest###`
> tag — guaranteed non-routable and one-click to bulk-delete later. **Import and segment
> only — never run a campaign to these.** (You won't need to; segments evaluate without sending.)

## The modeling catch — and why it's itself a finding

Klaviyo profiles are **flat: one row per person, no child collections.** Our segments anchor on
**Policy / Account / Contact** and *quantify over a customer's policies* ("has an active Home with a
bundle carrier **AND** no active Auto"). Klaviyo can't quantify over a child collection, so the CSV
**pre-flattens** policy facts onto each profile (`has_auto`, `has_home`, `home_carrier`,
`earliest_renewal_date`, …).

That precomputation is exactly the work our engine (and AR) does *for* the user and Klaviyo can't —
note it when you compare. The moment a real question needs "**which** policy / how many / same-policy
scoping," the flat model breaks and you'd have to bake a new boolean column per question. That's the
relational/quantifier ceiling (complexity-ladder rungs 2–5) made concrete.

## Import steps

1. **Audience → Lists & Segments → Create List** → name it e.g. `Dummy / segment test`.
2. Open the list → **Manage List → Import from file** (or **Add Members**) → upload `dummy_subscribers.csv`.
3. **Map columns — the type you pick matters.** Klaviyo auto-maps `email`, `first_name`,
   `last_name`, `city`, `region`, `zip`. **Every other column becomes a custom profile property.**
   - **Scalar enums/strings → Text.** `account_status`, `auto_carrier`, `home_carrier`,
     `earliest_renewal_lob`, `earliest_renewal_carrier`, `flagged_status`, `flagged_substatus`.
     ⚠️ **Do NOT map these as List** — Klaviyo's *List* type expects a multi-value array, so a single
     scalar like `active` fails validation with `The list is invalid (account_status)` on every row.
   - **Multi-value → List.** `policy_lobs` and `carriers` are stringified arrays
     (`["Auto","Home"]`) — map these as **List** so the `contains` operator works (see below).
   - **Booleans** (`has_auto`, `has_home`) arrive as strings `true`/`false`; segment with **equals `true`**.
   - **Dates** (`earliest_renewal_date`, `last_sold_date`, `last_nps_date`) — confirm Klaviyo types
     them as **dates** so relative-date operators work; if it treats them as text you only get
     exact-match (a real friction point worth noting).
   - There's **no phone column** (Klaviyo phone-validates and our fakes would all reject; phone isn't
     needed for segment testing).
4. Build segments under **Audience → Lists & Segments → Create Segment**, category
   **"Properties about someone."**

## Rebuild these and compare counts

Expected matches in this dataset (the generator prints these too):

| Seg | Definition | Klaviyo conditions (category: *Properties about someone*) | Expect |
|-----|------------|------------------------------------------------------------|:--:|
| **S1** | Auto renewing in 30 days | `earliest_renewal_lob` equals `Auto` **AND** `earliest_renewal_date` is in the next 30 days **AND** `account_status` equals `active` | **14** |
| **S2** | Pending cancellation, non-payment | `flagged_status` equals `Cancelled (Pending)` **AND** `flagged_substatus` equals `Non-Payment` | **9** |
| **S3** | Newly sold (last 14 days) | `last_sold_date` is in the last 14 days | **14** |
| **S4** | Home (bundle carrier) without Auto | `has_home` equals `true` **AND** `home_carrier` is in {Nationwide, Travelers, Safeco, Erie} **AND** `has_auto` equals `false` | **16** |
| **S5** | NPS promoters (9+) | `nps_score` is ≥ `9` | **46** |

> Counts are from the fixed-seed dataset; the generator prints them too. Re-running prints fresh counts if you change the seed/distributions.

If a count matches, the property-based predicate works. The interesting part is **how it feels** to
express each one (esp. S1's relative-date-on-renewal and S4's flattened "no Auto") versus our builder.

## Things to probe while you're in there

- **Relative dates** — does `earliest_renewal_date` segment with "in the next 30 days," or only literals?
  (Our S1 lives or dies on this.)
- **Text `is in` vs List `includes any of` — the multi-select lives on BOTH, but they differ.**
  (Verified against Klaviyo docs — see Sources at bottom.)
  - A **Text** property (one value per profile) supports **`is in` / `is not in`** — pick a *set* of
    values, no retyping. This is the right tool for S4's bundle set: `home_carrier is in
    {Nationwide,Travelers,Safeco,Erie}`. It **preserves same-row scoping** — it's specifically the
    *Home* policy's carrier. (Klaviyo's own Zip Code example defaults to this multi-select on a text field.)
  - A **List** property (array per profile) supports **`includes any of` / `includes all of` /
    `contains the text` / `is empty` / `has at least N items`**. `includes any of` is an **existence
    quantifier** and `has at least N items` is a **count quantifier** over the array — but both
    **flatten away which policy** the value came from.
- **The same-row ceiling, stated precisely.** `carriers includes any of {bundle set}` **AND**
  `policy_lobs includes Home` **AND** `policy_lobs doesn't include Auto` *approximates* S4 — but it
  matches anyone with a bundle carrier on **any** policy, not the **Home** one. You cannot express
  "the *Home* policy's carrier is a bundle carrier" with list properties. Text `is in` keeps same-row
  but only on the single flattened `home_carrier`. **Neither path expresses the full S4 in one shot** —
  that's complexity-ladder rung 3/5, and it's why our model keeps Policy as a first-class anchor.
- **Numeric `nps_score`** — typed as number (so `≥ 9` works) or string?

## Type handling is schemaless — findings (verified live + docs)

Klaviyo custom properties have **no enforced type**; the value is loosely-typed JSON and type is
decided in two places, at two layers:

- **Import-time type = write-time parsing/storage.** How the raw cell is parsed & normalized when
  stored (Date → real datetime; Number → numeric `9` not `"9"`; List → parsed array) and the *default*
  the builder pre-selects.
- **Query-time type (builder `Type:` dropdown) = read-time interpretation.** Per-condition cast; the
  operators offered depend on it (Text→`equals`/`is in`; Number→`≥`; Date→`in last N days`; List→
  `includes any of`/`has at least N items`). You can override it, and **nothing forces it to match the
  import type.**

Two footguns this creates (both avoided by a typed field catalog like ours):

1. **Double type specification** — once at import, once at query, no guarantee they agree.
2. **Silent failure on mismatch** — evaluating `nps_score` as **Date** (operator `after`) yields a
   segment count of **"Unavailable"**, not an error: the value can't coerce to a date so the condition
   silently matches no one. A mistyped field in a multi-rule segment = quietly-wrong audience, no signal.

**Practical:** to make our segments work, set the `Type:` correctly per condition — `nps_score` →
**Number** (so `≥ 9` for S5), date columns → **Date** (S1/S3 relative dates), `carriers`/`policy_lobs`
→ **List**. Leaving a numeric field as the default **Text** silently breaks numeric/relative comparisons.

In our model the source field is typed (`pl.contact.nps_score : number`), type drives the operators, and
"nps after a date" isn't expressible — the schemaless query-time-cast footgun can't occur.

## Segment update timing — findings (verified docs)

Klaviyo segments are **dynamic** (auto-update), but membership is **eventually** consistent, not
synchronous — and the cadence splits by condition kind:

- **Standard property/event conditions** (e.g. `nps_score > 7`): re-evaluated "as close to real-time
  as possible" on change, but with lag — a manual/property update can take **up to ~15 min** to
  propagate; a monitored count can lag **up to ~1 hour**. (Observed live: editing a member's NPS
  10→5 didn't drop them from `nps_score > 7` immediately — it's the processing delay, not a bug.)
- **Relative-time passive exits** (e.g. "in the last 14 days", "renewing in 30 days"): a profile that
  **ages out of a time window with no triggering event** is removed only on a **24-hour batch sweep**,
  not in real time. Entering is near-real-time; the *passive exit* is daily, because nothing fires
  when wall-clock time simply passes.

**Why it matters for us:** our date-anchored segments (**S1** renewing-in-30-days, **S3** sold-in-last-14-days)
are exactly the relative-time-exit case — members leave once/day, not the instant the clock ticks. This
is live precedent for two things already in our design:
- `automations.md` **open Q10** (membership-drift cadence: *lazy-at-send for content + a nightly
  membership pass for timely exits*) — **confirmed**: Klaviyo runs a 24h pass for relative-time exits.
- Our **re-resolve-at-send** decision — even if the nightly sweep hasn't pruned someone, resolving the
  audience at send time catches the staleness.

**Cross-tool comparison (verified docs):**
- **Klaviyo** — push, near-real-time entry (~15 min propagation, count lag up to 1h); **relative-time
  passive exits batched once every 24h** (documented).
- **Customer.io** — data-driven segments auto enter/exit; relative-date users exit *"as soon as"* the
  date crosses (framed continuous; exact cadence not documented).
- **Braze** — real-time off the event stream; **"exact segment membership is always calculated just
  before the message is sent,"** plus an opt-in *re-evaluate segment membership at send-time* for
  delayed sends (SQL Segment Extensions regenerate daily at midnight ±1h).

All three: membership/counts are push-maintained and **eventually consistent** (lag is universal — a
throughput problem *plus* the "no event fires when wall-clock time passes" problem for time windows);
**the send re-queries** rather than trusting standing membership. Braze validates our **re-resolve-at-send**
decision almost verbatim; Klaviyo's 24h sweep validates the **nightly membership pass**. For us — with
many date-windowed segments (S1/S3) — send-time resolution is the safer primary mechanism, with a nightly
sweep just to keep browse counts honest.

*(Folded into `research_segment_builder_ux.md` §8.4 + §13.7 on 2026-06-03. `automations.md` Q10 is cross-referenced from there but its own doc isn't yet updated — do that when next touching automations.)*

## Correction log

- *List ≠ enum/picklist.* Klaviyo's **List** type is strictly a **multi-value array per profile**
  (Shopify tags, purchased items), **not** a way to declare allowed values. There is no enum type;
  the value dropdown is just **autocomplete** of seen values, available on Text too.
- *Multi-select doesn't require List.* **Text** properties have **`is in` / `is not in`**. Map our
  single-value enums (`account_status`, carriers, etc.) as **Text** and you still get set-pick.

## Sources

- [Segment conditions reference — Klaviyo](https://help.klaviyo.com/hc/en-us/articles/115005062847)
- [Understanding data types — Klaviyo](https://help.klaviyo.com/hc/en-us/articles/115005237648)
- [Understanding custom profile properties — Klaviyo](https://help.klaviyo.com/hc/en-us/articles/115000250912)
- [Understanding how segments update — Klaviyo](https://help.klaviyo.com/hc/en-us/articles/115005233488)

## Field reference (CSV columns)

`email · first_name · last_name · city · region · zip` — standard, auto-mapped.
**List columns:** `policy_lobs` (`["Auto","Home"]`) · `carriers` (`["Travelers","Safeco"]`).
**Text/number/date columns:** `account_status` (active/lead/prospect/dead_file) · `total_premium` ·
`policy_count` · `has_auto` · `has_home` · `auto_carrier` · `home_carrier` ·
`earliest_renewal_date` · `earliest_renewal_lob` · `earliest_renewal_carrier` (soonest upcoming renewal) ·
`flagged_status` · `flagged_substatus` (pending-cancellation signal) ·
`last_sold_date` · `nps_score` · `last_nps_date`.

Bundle carriers (S4): **Nationwide, Travelers, Safeco, Erie** (agency-configured set in the real model).
