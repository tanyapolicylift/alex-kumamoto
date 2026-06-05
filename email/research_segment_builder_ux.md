# Research — Segment Builder UX Across Products

**Status:** Survey of segment / cohort / filter / rule builder design across ~15 products in marketing automation, analytics, CRM, and adjacent categories. Counterweight to the AR + Lev focus that's been the primary reference so far. Not exhaustive — focused on recurring patterns, pitfalls, and best practices rather than tool-specific feature comparison. **2026-06-03 addendum:** §5.5 / §7.4 / §8.4 / §13.7 capture findings from a *hands-on* Klaviyo teardown (rebuilding our S1–S5 in Klaviyo via the `klaviyo-test/` harness), cross-checked against Customer.io and Braze docs — moving beyond the original doc-survey into live behavior.
**Created:** 2026-05-26
**Updated:** 2026-06-03
**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segment_library_poc.md`](segment_library_poc.md) · [`automations.md`](automations.md) · [`research_feature_list.md`](research_feature_list.md) · [`changelog.md`](changelog.md) · `klaviyo-test/`

---

## 1. Why this research exists

We surfaced a question while pressure-testing the segmenter concept: when AR shows a "set of sets of rules" for quantification over child collections (one card per "at least one policy where..."), it's solving a real problem but with dense UX. Surely this isn't the first time this problem has been solved — every product that lets users build filter expressions hits some version of it. This doc surveys what others have done so we're not designing in a vacuum.

---

## 2. The universal filter atom

Across every product surveyed, a single filter "row" decomposes into three parts (Pencil & Paper's framing, which matches what every tool actually does):

1. **Identifier** — the property or field being filtered (e.g. `policy.status`)
2. **Relative** — the operator (`is`, `is not`, `>`, `contains`, `between`)
3. **Value** — the comparison value (`Cancelled`, `30`, `["A", "B"]`)

A filter row is just `(field, operator, value)`. All complexity above that — composition, quantification, grouping, nesting — is about how multiple of these atoms combine.

react-querybuilder's data model is the cleanest representation of this:

```
RuleGroup {
  combinator: 'and' | 'or'      // how children combine
  rules: (Rule | RuleGroup)[]   // recursive — groups can nest
}

Rule {
  field: string
  operator: string
  value: any
}
```

That's the universal abstract model. Every product surveyed conforms to some variant of it.

---

## 3. Composition models (AND / OR)

### 3.1 Group-level combinator (dominant pattern)

Most products attach the AND/OR to the **group**, not the individual rule. The user phrases it as "Match **all** of the following rules" (= AND) or "Match **any** of the following rules" (= OR). The phrase appears at the top of the group and acts as a single toggle.

This is what Klaviyo, HubSpot, Mailchimp, Mixpanel, and react-querybuilder all do. Microsoft Entra's rule builder shows the "Match all" / "Match any" toggle only when a second rule is added — neat detail to reduce noise for single-rule segments.

### 3.2 Independent (per-rule) combinators

Less common but exists (react-querybuilder supports it as `RuleGroupTypeIC`). Each rule has its own AND/OR connecting it to the next: `A AND B OR C AND D`. More expressive but harder to read; users routinely get the precedence wrong (does `A AND B OR C` mean `(A AND B) OR C` or `A AND (B OR C)`?). Universally discouraged for non-expert users.

### 3.3 Mixing AND with OR at the same level

To mix AND and OR in one expression, products force you to use **nested groups**. Adobe Experience Platform makes this explicit: *"Without using containers, you cannot mix both AND with OR logic in a single level."* This is the right call — it forces the user to be unambiguous via grouping rather than juggling operator precedence in their head.

---

## 4. Nesting strategies

Nesting is the most contested feature. Roughly three positions across products:

### 4.1 No nesting (most marketing tools)

Mailchimp, basic HubSpot lists, Customer.io: a flat list of rules combined with one group-level operator. The reasoning is that nesting adds cognitive load and most users only need flat compositions. When a real client needs nested logic, they fall back to advanced/SQL mode.

### 4.2 Optional nesting via explicit grouping (iTunes pattern)

iTunes Smart Playlists in iTunes 9 introduced the now-classic **ellipsis (…) pattern**: click the ellipsis on any rule line to "make this a group" — the rule becomes a container that can hold sub-rules indented one level. Each new container has its own Any/All toggle. Apple Mail rules, OS X dynamic groups, and many enterprise tools followed.

The strength: the same UI scales from flat (most users) to nested (power users). The weakness, noted in usability reviews: "the nested rule interface isn't very intuitive." Users have trouble knowing when they're inside vs outside a group, and dragging to rearrange across levels is fiddly.

### 4.3 Required containers for any composition (Adobe pattern)

Adobe Experience Platform makes containers a first-class concept — they're the unit of composition. You add rules to containers, containers to other containers, and the hierarchy is always explicit. More structured than iTunes but visually heavier — every segment looks like a tree.

### 4.4 Bounded nesting

react-querybuilder ships with a `maxLevels` prop (default infinity) to cap depth. Adobe enforces a soft limit ("avoid excessive nesting reduces performance"). Hagan Rivers's UX guidance is even stronger: *"Most rule builders do NOT need nesting, and it shouldn't be put in unless really needed."*

### 4.5 Synthesis

**Best practice:** offer nesting as a power-user feature, not a default. Most segments should be flat. When nesting exists, it should be **explicit and visible** (containers, indentation, the iTunes ellipsis). Avoid arbitrary depth — cap at 2–3 levels in the UI, or break out to SQL/advanced.

---

## 5. Quantification over child collections (the AR screenshot problem)

This is where most marketing tools quietly fail and where AR's "set of sets of rules" pattern earns its complexity.

### 5.1 The implicit-quantifier shortcut

Most simple marketing tools just **assume "any"** for any predicate over a child collection. "Customer has a policy where status = Cancelled" means "at least one." There's no UI for "all policies are Cancelled" or "no policies are Cancelled" — those are advanced/SQL territory.

This works for the 80% case and is what Klaviyo, Mailchimp, and basic HubSpot do. The trade-off: you can't express "Account has a Home policy AND has an Auto policy" cleanly — that needs separate quantifier scopes, which the implicit model collapses.

### 5.2 Explicit quantifier per condition

Mixpanel's cohort builder uses sentence-like quantifiers: *"Users who did `<event>` more/less than `<threshold>` times in the past `<period>`."* The quantifier is baked into the condition shape ("more than 0" = at least one; "exactly 0" = none; "more than N" = many).

Omeda's audience builder is more explicit: it offers "any of," "all of," "none of" as event-list selectors. The user picks events, then picks the quantifier.

### 5.3 Scoped containers (AR's pattern)

What AR is doing: each card is its own existence-quantifier scope. Rules inside one card constrain *the same child*; rules in different cards constrain *different children*. Visually: `[exists policy where X AND Y] AND [exists policy where Z]`.

Adobe Experience Platform does the same via containers — a container scoped to "Events" carries a quantifier that applies to all rules inside it.

### 5.4 Synthesis

**Three levels of quantification need to be modelable in the UI:**

- **Anchor entity** (top-level: who/what we're segmenting on — Account, Policy, Contact)
- **Child quantifier scope** (one or more groups, each carrying a `EXISTS / NOT EXISTS / FORALL` over a child collection)
- **Within-scope rules** (multiple predicates on the same child; combined with AND/OR)

**Best practice (synthesized from tools that handle this well):**
- Default to **implicit "any"** for the simple case (one quantifier scope, no UI for it)
- Surface explicit scoping only when the user adds a second predicate on the same child entity — at that point ask "same child, or different child?" via a clear UI choice
- Use prefix language ("Find a policy that is...", "And find a different policy that has...") rather than connecting AND/OR
- Visual scoping (containers, cards) should clearly group co-scoped rules

### 5.5 The flattened-quantifier ceiling, confirmed live (Klaviyo, 2026-06-03)

Hands-on rebuilding of our S1–S5 in Klaviyo (`klaviyo-test/`) made the §5.1 implicit-"any" limitation concrete. Klaviyo profiles are **flat** — one row per person, no child collections — so a customer's policies must be **pre-flattened** onto the profile. The builder can then approximate a child-collection quantifier two ways, **both lossy**:

- **List property + `includes any of` / `has at least N items`.** A List-typed property (e.g. `carriers = ["Travelers","Safeco"]`) gives a real existence (`includes any of`) and even **count** (`has at least N items`) quantifier over the array — but the array has **lost which policy each value came from**. So `carriers includes any of {bundle set}` AND `policy_lobs includes Home` AND `policy_lobs doesn't include Auto` matches a bundle carrier on **any** policy, not the *Home* one.
- **Text property + `is in {set}`.** One value per profile (e.g. `home_carrier`), so it preserves "this is the *Home* carrier" — but only because we pre-computed a per-LOB scalar, and it can't count or range over the collection.

Neither expresses our **S4** ("the *Home* policy's carrier is a bundle carrier AND no active Auto") in one shot — the **same-row trap (rung 3)** survives even with list operators, because flattening discards row identity. This is the cleanest available proof that **anchor-as-first-class-entity (our model) does real work** a flatten-to-profile model structurally can't: quantifier and same-row scope can't both hold once the child collection is flattened. (The pre-flattening — `has_auto`, `home_carrier`, `earliest_renewal_date` — is exactly the precompute AR and our engine do *for* the user; every new question needs a new precomputed column.)

Operator reference observed (relevant to §2's atom and §7.4): **Text** → `equals` / `is in` / `is not in` / `contains` / `starts with`; **List** → `includes any of` / `includes all of` / `contains the text` / `is empty` / `has at least N items`. So multi-select set-membership (`is in`) lives on **Text** too — it does **not** require the List type (a common misconception); List is strictly for multi-value-per-profile.

---

## 6. Anchor entity selection

Most marketing tools have **one** implicit anchor: the User / Person / Contact. Mixpanel anchors on Users. Klaviyo anchors on People (= contacts). Mailchimp anchors on Subscribers. Customer.io anchors on People.

A few tools let you switch anchors:
- **AR** lets you pick Accounts / Contacts / Policies as the segment subject (per Martin's walkthrough).
- **Adobe Experience Platform** segments are on Profiles, but you can build sub-queries against Events and Audiences (effectively secondary anchors with quantifiers).
- **Salesforce Marketing Cloud's "Data Filter"** is applied to a specific Data Extension — so the anchor is whatever DE you started from.

**Synthesis:** multi-anchor segments are rare and a CRM/insurance specialty. The anchor is part of the segment definition, set up front. PolicyLift's choice to let users pick anchor (Account / Policy / Contact / Claim / Quote) puts us in AR's camp — appropriate for the domain.

---

## 7. Field / property picker

Three dominant patterns:

### 7.1 Hierarchical tree / categorized panel

Adobe Experience Platform uses tabs (Attributes / Events / Audiences) and expandable folders. Klaviyo organizes fields by category (People properties, Events, Predictive analytics). Mailchimp groups by source (subscriber data, signup info, e-commerce).

Pro: scales to many fields, organizes naturally.
Con: users have to know which category their field lives in.

### 7.2 Flat search-first

Modern lightweight tools (Linear, Notion, Airtable, Customer.io's AI mode) lead with a search box. Type the field name, autocomplete shows matches across categories.

Pro: fast for power users who know what they want.
Con: requires the user to know the field name, low discoverability for novices.

### 7.3 Hybrid (most common)

Categorized panel with search at top. The dominant pattern. What we should default to.

**Specific best practices observed:**
- Show field type (number / date / enum) next to the field name — affects which operators are available
- For enum fields, preview the available values inline ("Status: Active, Cancelled, Renewal, ...") so users don't have to guess
- "Recently used" or "Popular" group at the top of the picker for high-frequency fields
- Search should match field names AND descriptions (so a user searching "renewal" finds both `renewal_date` and `next_renewal` and any field whose description mentions renewals)

### 7.4 Property typing — schemaless, cast at query time (Klaviyo, 2026-06-03)

§7's best practice ("show field type — it affects which operators are available") has a failure mode that Klaviyo demonstrates by *not* enforcing type at the schema layer. Klaviyo custom properties are **schemaless**: a value is loosely-typed JSON, and **type is chosen twice** —

- **At import** (write-time parsing/normalization + the builder's default): Date → real datetime, Number → numeric `9` (not `"9"`), List → parsed array.
- **At query time**: each condition has a `Type:` dropdown (Text / Number / Date / Boolean / List) that **re-casts** the property for that comparison, and the available operators change with it (Text→`equals`/`is in`; Number→`≥`; Date→`in last N days`; List→`includes any of`). **Nothing forces the query type to match the import type.**

Two **silent** footguns follow:
1. **Double type specification** with no guaranteed agreement.
2. **Silent failure on mismatch** — evaluating a numeric `nps_score` as **Date** (operator `after`) yields a segment count of **"Unavailable"**, not an error: the value can't coerce, so the condition matches no one with no warning. A mistyped field buried in a multi-rule segment = quietly-wrong audience.

**Implication for us:** a concrete argument *for* a **typed field catalog** — our `ams.*` / `pl.*` fields carry a type at the source. When the type lives on the field it **drives the operators automatically**, the user never picks a type (let alone twice), and nonsense like "nps after a date" is unrepresentable. The schemaless query-time-cast "convenience" is a net UX liability here; design against it explicitly.

---

## 8. Live count and preview

Universally recommended; varies in implementation.

### 8.1 Live count

- **Adobe** shows "Qualified Profiles" (exact, updated every 24h) AND "Estimated Profiles" (approximate, current, with 95% confidence interval). Two-number pattern handles the freshness-vs-accuracy trade-off.
- **Mixpanel** shows a live count as filters change.
- **Customer.io** shows membership count + a 7-day membership change chart.
- **Klaviyo / Mailchimp** show a count, refreshed periodically.

### 8.2 Sample preview

- **Adobe** has "View Profiles" → paginated list of matching profiles
- **Customer.io** shows "Sample members"
- **Mixpanel** lets you click into a cohort to see all users

Sample preview is **load-bearing** for our Audience verification need (Ley Insurance). A count tells you how many; the sample tells you whether they're the right people. Build both from day one.

### 8.3 Trade-off

Live computation is expensive at scale. Adobe's approach (exact-stale + estimated-fresh) is a good compromise. Some products debounce or require explicit "Refresh count" — acceptable if computation is heavy.

### 8.4 Membership update cadence & freshness (live finding, 2026-06-03)

Beyond the count *display*, the live test surfaced how membership itself stays current — relevant because our library leans heavily on **relative-date** predicates (S1 renewing-in-30-days, S3 sold-in-last-14-days). All dynamic-segment engines are **push-maintained and eventually consistent**; they differ mainly in how they handle the *passive* relative-time exit (no event fires when wall-clock time simply passes) and how they guarantee a correct send.

| Tool | Entry on data change | Relative-time passive exit | Correct-send guarantee |
|---|---|---|---|
| **Klaviyo** | Near-real-time (~15 min property propagation; viewed count lags up to 1h) | **Batched once every 24h** (documented) | resolves audience at send |
| **Customer.io** | Auto enter/exit (data-driven) | Exit *"as soon as"* the date crosses — framed continuous; cadence undocumented | n/a confirmed |
| **Braze** | Real-time off the event stream | SQL Segment Extensions regenerate daily (midnight ±1h) | **"Exact segment membership is always calculated just before the message is sent"** + opt-in re-evaluate-at-send for delayed sends |

**Why the lag is structural, not just performance.** Maintaining membership is incremental-view-maintenance over a huge, changing profile table: a property/event change can be *pushed* (hence near-real-time entry, bounded by queue throughput), but a predicate that's a function of `now()` can change its answer with **no underlying row change and no event to react to** — so it's catchable only by a periodic scan, which at scale is throttled (Klaviyo's daily sweep).

**Two takeaways validate decisions already made (cross-ref `automations.md` data-drift / open Q10):**
- **Re-resolve-at-send** — recompute the recipient set at send rather than trusting standing membership. Braze states this as a *core principle*; it's exactly our posture.
- **Nightly membership pass** — to keep browse counts/exits honest. Klaviyo's 24h relative-time sweep is direct precedent.
- **UX nudge:** any count shown on a Segment list/detail should be labelled "as of …" — every one of these tools' displayed counts is eventually consistent, and ours will be too. For an insurance book that's mostly date-windowed segments, send-time resolution is the **primary** correctness mechanism, not an optimization.

---

## 9. Simple vs Advanced modes

Almost universally adopted in mature products. The pattern:

| Tier | Form | Used by |
|---|---|---|
| Templates / presets | Pre-built segments user picks from a library, optionally parameterizes | Mailchimp, Klaviyo, HubSpot, Salesforce |
| Simple builder | Flat list of `(field, op, value)` rows, group-level AND/OR | All marketing tools |
| Advanced builder | Nested groups, mixed AND/OR, quantifier scopes | Adobe, AR, Mixpanel (events), Klaviyo (advanced segments) |
| SQL / code | Raw query language | Salesforce Marketing Cloud (Query Studio), Adobe, Mixpanel (SQL queries) |
| AI / natural language | "Describe segment" prompt | Klaviyo, Customer.io |

**Synthesis:** this maps almost exactly to PolicyLift's three-tier authorship model (PL-built / client-simple / composition). Industry validation that the tiered approach is correct.

**Best-practice transitions between tiers:**
- Templates should expose their underlying simple-builder representation when clicked — so users can see how the template is built and modify it
- Simple → advanced is a one-way ramp for most products; once you're in advanced mode the simplified UI may no longer represent the segment
- SQL / code mode is escape hatch for power users — usually gated behind a permission or warning

---

## 10. AI-assisted segment building

Recent trend (2024–2026):

- **Klaviyo Segments AI** — natural language prompt → generated segment
- **Customer.io AI Segment Builder** — "Describe segment" with conversational refinement
- **Amplitude Predictive Cohorts** — ML-generated cohorts ("likely to churn")
- **AR / Lev** — both have AI-assisted field discovery / template suggestion

The pattern that's emerging: AI is used as an **entry point** to segment authoring, not as a replacement. The AI generates a starting segment that the user then reviews + edits in the regular builder. AI as discovery, not as black-box.

This maps well to our context: PL could provide an AI-assisted way to author tier-1 named segments (we write SQL guided by AI), or eventually let clients prompt their way into tier-2 simple segments.

---

## 11. Common pitfalls and anti-patterns

Synthesized across LogRocket, Pencil & Paper, Smashing Magazine, Smart Interface Design Patterns, and others:

1. **Too many filter options exposed at once.** Analysis paralysis. Use search + categories; hide unused options behind "more filters."
2. **Active filters not visible after applying.** Users forget what's filtered. Always show applied filters as pills/chips, with one-click remove and a "clear all."
3. **Freezing the UI on every input.** Filter changes shouldn't lock the UI mid-typing. Debounce or use an explicit Apply button for expensive computations.
4. **Mobile-hostile filter sidebars.** Long left-sidebar filters become unreachable on mobile. Provide a collapsed-by-default filter modal on small screens.
5. **Dropdowns for long lists.** Slow, hard to navigate. Use search-with-autocomplete instead.
6. **Nesting without visual scoping.** Indented rules without clear container backgrounds confuse users about which level a rule belongs to. iTunes-style indentation with backgrounds is the minimum.
7. **Operator precedence ambiguity.** `A AND B OR C` is a footgun. Force grouping via nested containers.
8. **Implicit quantifiers that don't match user intent.** "Has a policy where X and Y" being interpreted as "same policy" when the user meant "different policies" (or vice versa). Make the quantifier scope visible when more than one predicate touches the same child.
9. **No preview of who matches.** Just a count is insufficient — users need to see sample records to trust the segment.
10. **No empty state handling.** Zero-result segments should explain *why* zero (which filter is too strict, can it be relaxed) rather than just showing nothing.
11. **Inconsistent live vs batch filtering.** Some filters apply instantly, others wait for Apply. Pick one and be consistent within a context.

---

## 12. Notable product references

Brief notes on specific products that came up. Not full reviews — pointers for deeper investigation if needed.

### 12.1 Mixpanel — cohort builder

Anchor: Users (always). Conditions: behavioral (event-based) and attribute-based. Quantification baked into event conditions ("more than N times in past M days"). AND/OR via group-level combinator. Sample preview built in. No nested groups in the standard UI — it's a flat list of conditions per cohort. SQL fallback ("JQL") for the long tail.

### 12.2 Adobe Experience Platform — segment builder

The most expressive UI in the survey. Containers everywhere, explicit AND/OR per container, event sequencing constraints, dual-number live count (exact-stale + estimated-fresh), per-attribute drill-down. Heavy. Performance constraints explicit ("no more than 6 sequential events").

### 12.3 Klaviyo — segments

E-commerce focused. Unlimited conditions, AND/OR group-level. Predefined segment templates ("VIP customers," "At risk"). Klaviyo AI for natural-language segment generation. Strong on behavioral (purchase history, browse behavior).

### 12.4 Mailchimp — segments

Limit of 5 conditions per segment (deliberate simplification). Flat AND/OR. Predefined audience segments. The "simple by design" choice — they punt expressivity to their advanced segment SKU.

### 12.5 HubSpot — lists

Conditions over contact properties, deal stages, engagement events. Limited to AND/OR at group level, with nested groups for complex logic. Live count refreshed periodically. Strong field-picker hierarchy organized by object (Contact / Company / Deal).

### 12.6 Customer.io — data-driven segments

Conditions over attributes + events. AI-assisted creation as primary entry. Live insights panel with membership chart, subscription rate, engagement metrics. Sample members shown.

### 12.7 Salesforce Marketing Cloud — data filters + Query Studio

Drag-and-drop filter builder for simple cases; SQL Query Studio for complex. Two clearly separated authoring paths, with neither pretending to do what the other does better.

### 12.8 iTunes Smart Playlists / Apple Mail rules

The classic "ellipsis to nest" pattern from iTunes 9. Influenced the design of many later tools. Praised for feature richness, criticized for nested-rule UI being unintuitive once you go more than one level deep.

### 12.9 Linear / Notion / Airtable

Modern lightweight pattern. Pill-based active filter display, inline search in field picker, removable chips, "Add filter" button rather than always-visible empty rows. Linear's filter UX is a reference standard for clean, fast, modern enterprise filtering. Not as expressive as marketing tools but the UX bar is much higher.

### 12.10 react-querybuilder (open source)

The canonical implementation of the rule-builder pattern in code. Clean data model (RuleGroup + Rule recursive). Bounded nesting via `maxLevels`. Exports to SQL, MongoDB, JSON Logic, etc. Useful reference for what the underlying schema should look like if we want to keep options open for export/import.

---

## 13. Implications for PolicyLift

Pulling threads relevant to our brainstorm.

### 13.1 Three-tier authorship is industry-validated

Every mature product surveyed has some version of templates → simple builder → advanced / SQL. PolicyLift's tier 1 (PL-built named) + tier 2 (client simple) + tier 3 (composition) maps almost exactly. Adding **AI-assisted** as an entry to either tier is the 2026 trend; worth on the roadmap but not PoC-critical.

### 13.2 The AR "set of sets" pattern is solving a real problem

Quantification over child collections is fundamental and AR's approach is one of several valid ones. Alternatives worth considering:

- **Implicit "any" by default** (Klaviyo/Mailchimp style), surfacing scope only when multiple predicates apply to the same child entity → matches our Option C (simple/advanced split)
- **Mixpanel's sentence-like quantifier-baked-in approach** for the common case ("Account has more than 0 Auto policies where..."), with scoping for edge cases
- **AR / Adobe's explicit container scoping** — most expressive, densest UX

Recommendation: lean Klaviyo-default + Mixpanel-sentence for tier 2; AR/Adobe-style scoping is overkill until we have a power-user persona. PL tier-1 (SQL) handles complex cases until then.

### 13.3 Canonical-first field picker with raw escape hatch

Survey confirms: best-practice pickers are categorized + searchable + show field type/values inline. Our canonical-field approach (one user-facing name, per-AMS resolution underneath) fits this; raw AMS fields can live under a separate "Advanced / Raw" tab when the user needs them. This is similar to Adobe's tabs (Attributes / Events / Audiences) and Klaviyo's category tree.

### 13.4 Audience verification (S3) is a first-class screen, not a feature

Across products, **sample preview** is universal alongside count. We should not skimp here — Ley's "review every recipient" commitment maps to standard practice that most tools already do. Build sample preview into the basic segment view, not as a separate feature.

### 13.5 Common pitfalls to actively avoid

From §11, the ones most relevant to us:
- **Make the quantifier scope visible** when there are multiple predicates on the same child entity. Don't let users get "different policy" when they meant "same policy" silently.
- **Always show applied filters as pills** with one-click remove. This is a 5-minute UX win that prevents most "what's happening" confusion.
- **Cap visible nesting at 2–3 levels.** If a segment needs deeper, it should be a PL tier-1 SQL segment, not a tier-2 simple builder.
- **Two-number count display** (exact-stale + estimated-fresh) is a known good pattern for handling computation cost; keep in mind for performance.

### 13.6 Where insurance/AMS specifics diverge

Two real differences from general-purpose tools:

- **Multi-anchor segments are required**, not optional. We need Account / Policy / Contact / Claim / Quote anchors. Almost all marketing tools have a single fixed anchor (User/Person). AR is one of the few that doesn't, and is the closest reference.
- **Heterogeneous source data (per-AMS) is unique to this domain.** None of the surveyed tools have a "canonical field vocabulary over multiple data sources" abstraction — they assume one source of truth (their own DB). This is novel work for us. The closest analog is Segment.com's "computed traits" — pre-computed fields that live above raw event data — but it's not quite the same problem.

### 13.7 Runtime / data-model findings from live testing (2026-06-03)

Three findings from hands-on rebuilding of S1–S5 in Klaviyo (`klaviyo-test/`), cross-checked against Customer.io and Braze — each confirms the model is right exactly where it diverges from a generic e-commerce tool:

- **Typed field catalog beats schemaless properties (§7.4).** Source-typed `ams.*`/`pl.*` fields drive operators automatically and make mistyped conditions unrepresentable; Klaviyo's schemaless query-time type cast produces silent "Unavailable" segments. Design *for* the typed catalog.
- **Anchor-as-entity is load-bearing (§5.5).** Flattening a policy collection onto the profile (Klaviyo's only option) cannot express same-row + quantifier together (our S4). Keeping Policy a first-class anchor is what makes our relational segments expressible.
- **Re-resolve-at-send + nightly pass are mainstream, not workarounds (§8.4).** Braze recomputes membership at send; Klaviyo sweeps relative-time exits every 24h. Both match `automations.md` (drift handling, open Q10). For a mostly date-windowed insurance book, send-time resolution is the **primary** correctness mechanism.

---

## 14. Sources

- [Rule Builder design pattern](https://ui-patterns.com/patterns/rule-builder) — UI-Patterns
- [UI Design for Rule Builders](https://medium.com/@hagan.rivers/ui-design-for-rule-builders-e3f218461954) — Hagan Rivers, Medium
- [Filter UX Design Patterns & Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering) — Pencil & Paper (enterprise filtering analysis)
- [Designing Filters That Work](https://www.smashingmagazine.com/2021/07/frustrating-design-patterns-broken-frozen-filters/) — Smashing Magazine
- [Complex Filtering UX](https://smart-interface-design-patterns.com/articles/complex-filtering/) — Smart Interface Design Patterns
- [Getting filters right](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices/) — LogRocket
- [Segment Builder UI Guide](https://experienceleague.adobe.com/en/docs/experience-platform/segmentation/ui/segment-builder) — Adobe Experience Platform docs
- [Cohorts: Group users by demographic and behavior](https://docs.mixpanel.com/docs/users/cohorts) — Mixpanel docs
- [Customer.io Segment builder](https://docs.customer.io/journeys/segment-builder/) — Customer.io docs
- [Klaviyo vs Mailchimp: How to choose](https://www.mparticle.com/blog/klaviyo-vs-mailchimp/) — mParticle comparison
- [Klaviyo vs HubSpot](https://www.inboxarmy.com/blog/klaviyo-vs-hubspot/) — InboxArmy
- [QueryBuilder docs](https://react-querybuilder.js.org/docs/components/querybuilder) — react-querybuilder library
- [Segmentation in Salesforce Marketing Cloud](https://deselect.com/blog/segmentation-in-salesforce-marketing-cloud-sfmc/) — DeSelect
- [Using smart playlists with nested conditionals](https://www.macworld.com/article/1142846/nested_playlists.html) — Macworld on iTunes 9
- [Audience Builder Advanced Features](https://knowledgebase.omeda.com/omedaclientkb/audience-builder-onq-advanced-features) — Omeda docs

**Live-teardown sources (2026-06-03):**
- [Segment conditions reference](https://help.klaviyo.com/hc/en-us/articles/115005062847) — Klaviyo (Text vs List operators)
- [Understanding data types](https://help.klaviyo.com/hc/en-us/articles/115005237648) — Klaviyo (schemaless types, list CSV format)
- [Understanding how segments update](https://help.klaviyo.com/hc/en-us/articles/115005233488) — Klaviyo (real-time vs 24h relative-time sweep)
- [Data-driven segments](https://docs.customer.io/journeys/data-driven-segments/) · [Timestamp conditions](https://docs.customer.io/journeys/segmentation-and-timestamp-rules/) — Customer.io
- [Triggered delivery / re-evaluate at send-time](https://www.braze.com/docs/user_guide/messaging/campaigns/schedule_your_campaign/triggered_delivery) · [SQL Segment Extensions](https://www.braze.com/docs/user_guide/brazeai/generative_ai/sql_segment_extensions) — Braze (send-time membership calc)

---

## 15. Open questions raised by this research

To pull back into the brainstorm:

1. **Quantifier UI direction** — implicit "any" with scope surfaced on-demand (Klaviyo) vs explicit scope containers (AR/Adobe) vs Mixpanel sentence-builder. Recommendation: implicit-by-default, with surfaced scope when the user adds a second predicate touching the same child.
2. **Nesting depth cap** — 2 levels? 3? Or no nesting at all in tier-2 (escape to tier-1 SQL for complex)?
3. **Templates as tier 0** — do we ship pre-built segment templates ("Cancelled non-payment + renewal coming up") as a layer below tier 1 (which is also PL-authored but custom-per-agency)? Probably yes, but worth confirming.
4. **AI-assisted authoring** — eventually-yes signal from the survey. PoC scope? Probably no.
5. **Field picker hierarchy** — categorized tabs (Adobe-style) vs flat search (modern lightweight) vs hybrid. Hybrid is the default-correct answer; what are our categories?
6. **Two-number count** — exact-stale + estimated-fresh. Worth doing on day one for performance, or wait until we have data on query cost?
7. **Sample preview** — how many sample records? Adobe paginates; Customer.io shows a handful. Format (table? cards? customizable columns?).

**Live-test addendum (2026-06-03):** the Klaviyo teardown (`klaviyo-test/`) informs Q5 (pickers are type/value-aware — but type discipline should live on the *field*, not the condition; see §7.4), Q6 (all tools' counts are eventually-consistent → label "as of …"; §8.4), and Q7 (sample preview is universal; §8.2). It also raised runtime concerns now captured in §5.5 / §7.4 / §8.4 and cross-referenced to `automations.md` open Q10 (membership-drift cadence).

---

*Generated 2026-05-26 by Claude. Brings competitor + UX-pattern research into the brainstorm at the segmenter level, complementing the AR/Lev focus that's been the primary reference so far. Pairs with the AR/Lev competition walkthrough Martin will do directly.*
