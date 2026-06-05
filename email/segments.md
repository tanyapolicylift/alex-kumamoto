# Segments

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Segment primitive — what it is, how clients use it, how the three authorship tiers work, how it composes with other Segments, and how it's implemented under the hood. Non-technical readers can stop at "Implementation details"; everything before that is plain-language.

**Created:** 2026-05-27

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segment_library_poc.md`](segment_library_poc.md) (concrete tier-1 Segments + the `ams.`/`pl.` fields they read) · [`research_segment_builder_ux.md`](research_segment_builder_ux.md) · [`changelog.md`](changelog.md)

---

Every campaign starts with a question: *who are we sending this to?* A **Segment** is the saved answer to that question — a named, reusable definition of a group that matches some criteria. "Auto policies renewing in the next 30 days" is a Segment. So is "Customers in California with state-minimum liability limits." So is "Lost customers from the past 6 months."

Segments are how the rest of the email automation product knows who to talk to. Broadcasts pick a Segment and send to it once. Automations pick a Segment and walk people through a sequence whenever they enter or match. Without Segments, every email would have to redefine its audience from scratch — and the kind of agencies we're building for run dozens of overlapping campaigns where the same audience definitions show up over and over.

Segments are also where the product wins or loses. Reach (the third-party email tool PolicyLift integrates with today) couldn't deliver real customer onboardings because its Segment shape is too simplistic to express what agencies actually want to target on. The Segment design below is what closes that gap.

---

## What a Segment is

A Segment has four parts that matter to the people using it:

- **A name and description.** "Auto policies renewing in 30 days" — short enough to scan in a list, clear enough to know what it does without opening it.
- **An anchor** — what kind of thing the Segment returns. Some Segments return accounts ("Customers in California"). Some return policies ("Policies below state minimum"). Some return contacts ("Anyone who clicked the May newsletter"). This matters because campaigns need to know what the answer looks like.
- **The criteria** that define who's in. This can be anything from AMS data ("renewal date in the next 30 days," "carrier = Nationwide," "premium > $5,000") to PolicyLift-side annotations ("has the 'inspection pending' tag," "hasn't unsubscribed").
- **A current count and sample of who matches right now.** The count tells you how big the Segment is. The sample lets you eyeball who's actually in it — names, key fields, anything that helps spot a mistake before you hit send.

Crucially, a Segment is a *question*, not a list. We come back to this below — but the short version is that a Segment doesn't store names. It stores the criteria, and we run them whenever someone asks "who matches right now?" The answer changes as data changes.

---

## What Segments select — the anchor

When someone uses a Segment, the result is a set of records. The **anchor** is what kind of record each row in that set is.

A Segment with anchor *Account* returns accounts — "Mitchell Family Insurance" as one row, "Big Top Catering" as another. A Segment with anchor *Policy* returns policies — "HO-2026-0042 (Mitchell, Home, $1,250/yr)" as one row. A Segment with anchor *Contact* returns specific people.

Five anchors are useful for our world:

- **Account** — a customer (personal or commercial). Most segments anchor here.
- **Policy** — a specific insurance policy. Used when the criteria are policy-shaped ("renewing soon," "below state minimum," "lapsed last month"). Common.
- **Contact** — a specific person attached to an account. Less common for marketing; mostly used for behavior-based segments ("everyone who replied to our last campaign").
- **Claim** — a filed insurance claim. For claims-loop campaigns (filed → closed → satisfaction check).
- **Quote** — a pending quote that hasn't bound. For quote-to-bind nurture.

The anchor is part of the Segment, set when it's first created, and doesn't change. Why it matters: a campaign sending an email needs to figure out *who* to email. If the Segment returns Accounts, the campaign emails one or more contacts on each account. If the Segment returns Policies, the campaign emails the named insured on each policy. If it returns Contacts, the campaign emails those contacts directly. This recipient-resolution decision lives on the Broadcast or Automation, not on the Segment — but the anchor type is what makes it possible.

---

## How Segments come into being — three tiers

There are three ways a Segment gets created. They build on each other.

### Tier 1 — PolicyLift creates them

PolicyLift's team writes Segments on the client's behalf. The client picks from a list of pre-built Segments curated for their agency and AMS. The complexity of insurance segmentation — the AMS-specific data shapes, the "policy in force" filters, the canonical-field resolution — lives entirely on PolicyLift's side. The client doesn't see it.

This is the only tier we ship at PoC, and the only one we need to onboard real customers. Why: insurance segmentation is hard and AMSes vary wildly. The first time a client gets to author a Segment from scratch is also the first time they get to author it *wrong* — and a wrong Segment sends a wrong campaign to real customers. Starting with PL-authored Segments lets us onboard fast and learn what clients actually need before exposing them to authoring.

When a client needs a Segment that doesn't exist yet, they arrange it with the PolicyLift ops team **directly, out of band** (clients are already in regular contact with ops); PolicyLift creates it as a **Managed** Segment, shares a preview or a Loom, and the client confirms. This concierge model is operational at PoC, not a fallback — and there's deliberately **no in-product request flow** in the first cut.

### Tier 2 — clients build their own simple Segments

Once we know which fields clients reach for most often, we'll ship a rule-based builder. The client picks a field, picks an operator, picks a value; combines multiple rules with And/Or; sees the matching count live; saves it under a name. This is the shape every modern marketing tool ships, and it covers maybe 80% of what clients want to do day-to-day.

Tier 2 is post-PoC. It depends on a few things that aren't ready yet — most importantly the canonical field catalog (covered below) — and we want client signal before we lock in which fields and operators matter.

### Tier 3 — combining Segments

Even with PL-built Segments only, clients need to combine them. "Send to (PL-built: Auto-below-state-min) AND (in California) AND NOT (already contacted this month)" — three Segments stacked into one final audience. This is tier 3 — composition — and it's what makes tier 1 scale.

Without tier 3, PolicyLift would have to write a new Segment every time an agency wanted a slightly different cut. With tier 3, PolicyLift writes one "Auto below state minimum" Segment, and twenty different agencies can layer their own filters on top.

Tier 3 ships with PoC. Combining Segments is straightforward to build and immediately useful.

---

## The complexity ladder — flat predicates to quantified relations

The three tiers above are about *who* authors a Segment. This section is about *what the criteria can express* — and that's a separate axis. Criteria range from trivial ("accounts where status = active") to genuinely demanding ("accounts with at least 2 auto policies under $1,000 each"), and understanding the rungs between them is the single most important concept in the whole Segment design. It's the gap that Reach's too-simple Segment shape couldn't cross, and it's why we anchor Segments on an entity in the first place.

The governing rule is simple: **complexity is driven by the relationship between a criterion and the anchor.** A criterion that lives *on the anchor itself* is flat and easy. A criterion that lives on a *different, related* entity forces a question that flat filtering never has to answer. Here's the ladder, with anchor = **Account** held constant so the escalation is visible.

**Rung 0 — single predicate on the anchor.** `status = active`. One entity, one field, one operator.

**Rung 1 — several predicates on the anchor, AND/OR combined.** `status = active AND state = CA`. Still all fields *of the account*. Flat. This is where most marketing tools max out.

**Rung 2 — a predicate on a *related* entity (the leap).** "Accounts that have an auto policy." The anchor is Account, but `type = auto` is a fact about **Policy**, a child collection. Crossing that boundary forces a question that didn't exist below: an account has *many* policies — how many have to match? That's the **quantifier**, with three settings (`any` / `all` / `none`):

- **any** — has at least one auto policy
- **all** — *every* policy is auto
- **none** — has no auto policy

Rungs 0–1 are "filtering a table." Rung 2 and up are "asking a question about a related set." This is the conceptual cliff.

**Rung 3 — multiple conditions on the child, and the same-row trap.** "Accounts that have a policy of type auto **with premium < $1,000**." Two conditions now live on the policy, and a subtle, bug-prone question appears: *do both conditions have to hold on the **same** policy, or can they be satisfied by **different** policies?* "Same policy" = the account has one auto policy that is also cheap. "Any policy" = the account has *some* auto policy *and* *some* cheap policy — possibly two different ones. These return different account sets, and getting it wrong silently sends the wrong campaign. This is the *"Same policy as above? Or any matching policy?"* micro-prompt in the tier-2 builder sketch (see Implementation details). It is the #1 footgun in relational segmentation.

**Rung 4 — counting.** "Accounts with **at least 2** auto policies under $1,000." This upgrades the quantifier from *existence* (`any` = "at least 1") to a *threshold count* (≥ 2, exactly 1, between 2 and 5…). Most marketing tools can't do this at all. Rungs 3 + 4 stacked — "at least X policies of type Y with premium < Z, same policy" — is a genuinely demanding query.

**Rung 5 — multiple child collections, mixed quantifiers, negation.** "Accounts with an auto policy (`any`) **AND** no open claims (`none`) **AND** all policies in force (`all`)." Each child collection gets its own independent quantifier. Negation interacts with the quantifier in a way people get wrong: "no policy of type X" (`none` over `type = X`) is **not** the same as "a policy that is not type X" (`any` over `type ≠ X`). Same words, opposite meaning.

**Rung 6 — computed fields.** Swap a raw column for a derived concept: "days until renewal `<= 30`". Not a stored field — computed from `ams.policy.renewal_date` (or `effective_date + term`); written inline at PoC, a named `calc.*` field later (see [Fields by source](#fields-by-source--ams-pl-and-later-calc) below). You'll usually pair it with a plain `ams.policy.status = active` condition (canceled policies have stale dates — see the "policy in force" note below). The complexity here isn't structural; it's that the value is computed, not stored.

**Rung 7 — cross-source (AMS + PolicyLift-side data in one expression).** "…renewing in 30 days [AMS] **AND** has 'Inspection Pending' tag [PL] **AND** not unsubscribed [PL suppression]." The engine joins two data sources in one predicate; the client never has to know which fact came from where. (See [PolicyLift-side data in Segments](#policylift-side-data-in-segments) below.)

**Rung 8 — composition (a different *level* entirely).** This is tier 3. You're no longer building one predicate tree — you're combining whole *answers* with set operators: `(Auto below state min) ∩ (in California) − (contacted this month)`. It sits *above* the ladder because each operand is itself a Segment that internally can be anywhere from rung 0 to rung 7. (See [Combining Segments](#combining-segments--composition) below.)

### The insight that ties it together — anchor choice moves the complexity

The same real-world intent can land on different rungs depending on the anchor, because **the anchor decides which predicates are flat and which require a quantifier:**

- Anchor = **Account**: "has ≥ X auto policies under $Z" is a *quantified, counted* predicate over a child collection — rungs 3–4. Hard.
- Anchor = **Policy**: "type = auto AND premium < Z" is a *flat* predicate on the anchor itself — rung 1. Easy. And the same-row question vanishes, because each row *is* one policy.

Same intent, wildly different query complexity — and a different result *shape* (accounts vs policies). This is why the anchor is a first-class, immutable property of a Segment, and why **cross-anchor lifting** ("which accounts have ≥ 1 matching policy?" — see Implementation details) is the bridge between the two views. Choosing the anchor *is* choosing where the complexity lands.

### Why this maps onto the tiers

At **PoC, none of this is exposed to clients** — PolicyLift hand-writes the SQL, including the quantifiers, same-row joins, and counts, so every rung is reachable on day one *for PL authors*. The ladder only becomes a *UI* problem at tier 2, and rungs 2–5 are brutal to expose safely (the same-row trap and the negation/quantifier interaction are where untrained users send the wrong campaign). That difficulty is the concrete reason tier 2 is deferred until we have client signal on which rungs they actually reach for.

One orthogonal note: **operators are gated by field type** (number → `gt`/`lte`/`between`; enum → `eq`/`in`; date → `before`/`within N days`). That constrains the leaves of any predicate but adds no structural depth — it's a separate axis from the ladder.

---

## Browsing Segments — the library

The Segment library is one of the four screens clients touch in the email product (alongside the Template editor, Broadcast builder, and Automation builder). It's a list view of every Segment available to the client's agency. There are two kinds, marked in each row (Reach-style): **Managed** — PolicyLift/ops-built, read-only to the client — and **Regular** — client-built and editable.

Each row identifies a Segment, marks it **Managed** or **Regular**, and shows its size at a glance; clients search and filter the list and click into a Segment for the full detail view. (Exact columns, filters, and layout are a design concern — see the prototype blueprint, `prototype/v1/blueprint.md`.)

The detail view shows the full description, the current count with a refresh button, a sample preview (covered next), and a "Use in Broadcast" / "Use in Automation" CTA. **Managed** Segments are read-only here (a "Managed by PolicyLift" note, no edit) — their logic is maintained by PolicyLift; **Regular** Segments show an **Edit** action that opens the builder.

When a client needs a Managed Segment created or changed, they arrange it with the PolicyLift ops team **directly, out of band** — there is no in-product request flow (clients are already in regular contact with ops). An in-product "request a segment" surface may come later, but it's deliberately not in the first cut.

---

## Seeing who matches — count and sample preview

Picking a Segment is one thing; trusting it is another. Two affordances make Segments trustworthy.

**The current count** — "284 policies match this Segment right now." Updated nightly in the background, refreshable on demand. It's a fast sanity check: if a client expects "around 200" and sees 1,800, something is wrong with the Segment definition and the client knows to dig before sending.

**The sample preview** — a scrollable list of the actual records that match, with the columns that make sense for the anchor type:

- **Account anchor:** account name, primary contact, status, total premium
- **Policy anchor:** policy number, type, carrier, effective date, renewal date, account name
- **Contact anchor:** name, email, role, account name

The sample is the trust surface. Clients eyeball it, recognize names, spot weirdness ("why is this commercial account in here when this Segment is supposed to be personal lines?"), and ask PolicyLift to fix the Segment if something looks off. This is the lighter version of the audience-verification step that happens at Broadcast and Automation send time.

Industry-standard: every marketing automation tool worth using has both count + sample. (See [`research_segment_builder_ux.md`](research_segment_builder_ux.md) for the survey — count and sample are universal across Mailchimp, HubSpot, Klaviyo, Customer.io, Adobe, Mixpanel.)

---

## Combining Segments — composition

Most real campaigns don't target a single Segment. They target a combination. "Customers with state-minimum auto in California who haven't opted out" is three filters stacked.

There are three ways Segments combine:

- **Include / Intersect** — both Segments must match. *"In California" AND "Auto below state min"* = California customers with state-min auto.
- **Union** — either Segment matches. *"Auto below state min" OR "Home with $100K liability"* = anyone underinsured on either line.
- **Except** — first Segment matches AND second does NOT. *"Renewal in 30 days" EXCEPT "Already contacted this month"* = the right people to email this week.

In the UI, this looks like a recipe — start from a Segment, add another with a chosen operator, see the running count update at each step, add more if needed. Each step is visible; the order doesn't change the result mathematically but it can change the running count display.

All Segments in a composition must share the same anchor type. You can't combine a Policy-anchored Segment with an Account-anchored Segment directly (the answers are different shapes — there's no obvious way to say whether "Account X" intersects with "Policy 42"). Later we'll support automatic "lifting" — a Policy-anchored Segment can be lifted into an Account-anchored one by asking "which accounts have at least one matching policy?" — but that's post-PoC.

A naming note: we're using **include / intersect / except** as the operator names. "Suppression" overlaps with the consent layer (a suppressed contact is one who's unsubscribed or bounced), and "minus" is too math-y. "Except" reads cleanly in English and matches SQL's `EXCEPT` operator under the hood.

---

## Segments vs lists — why they're not frozen

This is the part that confuses people coming from older email tools, and it's worth being explicit about.

In Mailchimp-style products, an "audience" or "list" is a literal frozen set of email addresses. You upload contacts to it, add and remove members, send messages to it. It's *stored* membership — a thing that contains people.

A Segment is not that. A Segment is a *question*. "Who has an auto policy renewing in 30 days?" Ask it Monday, you get 284 matches. Ask it Friday, you get 287 — three new policies entered the 30-day window. Nothing about the Segment changed. The world changed, and the Segment re-answered with the new state.

This distinction matters in three places:

- **A Segment can't be "locked."** It's always live. Whoever uses the Segment decides what to do about people whose status changes over time. The Segment itself stays as a question — a saved criteria definition.
- **Broadcasts implicitly snapshot** the Segment at send time. They fire once. The 284 people who matched the moment we hit send are the audience for that Broadcast — anyone who matches later doesn't matter, because there's no later for a Broadcast.
- **Automations are trigger-driven** — a person enters when they *cross into* the Segment (added-to-segment trigger) or hit a date/event, so enrollment is **newly-entering by construction** (revised 2026-06-03; see `automations.md`). The Segment stays a stateless question; the Automation's trigger + filters decide enrollment. Reaching the *existing* matches is a one-time backfill or a Broadcast, not an automation mode.

Treating Segments as questions instead of lists keeps the data model simple and the user mental model honest. Re-using the same Segment in different campaigns with different ongoing behavior is the whole point.

(For more on enrollment behavior, see the [`concepts_working_doc.md`](concepts_working_doc.md) §5.6 walkthrough and — eventually — the Automation companion doc.)

---

## Fields by source — `ams.`, `pl.`, and (later) `calc.`

A Segment's predicate references fields, and the simplest useful model names them by **source**:

- **`ams.*`** — data that originates in the AMS: `ams.policy.status`, `ams.policy.renewal_date`, `ams.policy.substatus`. This is a *source* label, not a storage one — whether PolicyLift keeps a field in a normalized CXP column or reads it from raw `ams_data` JSONB is invisible *under* the `ams.` name; the author doesn't care.
- **`pl.*`** — data that originates in PolicyLift: `pl.conversation.type`, tags, NPS responses, consent/suppression, custom fields, lifecycle markers.

So "accounts with an active policy and no chats" is `count(ams.policy where status = 'active') > 0 AND count(pl.conversation where type = 'chat') = 0`.

### At PoC: no canonical / mapping layer

PoC onboards one agency on one AMS (Marker / HawkSoft) and only PolicyLift authors Segments (tier-1 SQL). With **one** AMS there is nothing to map *across*, and with **PL-only** authoring nobody needs a friendly vocabulary that hides field names — so we **don't build a normalization layer**. Segments reference `ams.*` / `pl.*` fields directly, and each `ams.*` field resolves to one concrete HawkSoft location (a CXP column or a JSONB path). Computed concepts are written **inline** in the SQL — e.g. `ams.policy.renewal_date BETWEEN now() AND now() + 30d`, or `ams.policy.effective_date + <term>` where a reliable renewal date is missing. Clunky but honest — and PL writes it, not clients.

This is close to what Agency Revolution does: its Advanced Segment exposes raw per-AMS fields directly (an "AMS/BMS section… [that] varies from system to system"), normalizing only selectively (policy-type, renewal proxy).

### Later: `calc.*` — the unified / computed layer (deferred)

When a computed concept is reused enough to deserve a name, or is exposed to tier-2 self-serve clients who can't write raw expressions, promote it to a **`calc.*` field** — a *named expression* over `ams.` / `pl.` inputs (e.g. `calc.policy.days_until_renewal`). The prefix flags "computed, possibly approximate / AMS-dependent." A `calc.` field is exactly what earlier drafts called a *canonical field*: it carries a definition, a type, the AMSes it works on, and — **only when a second AMS needs that same field** — a per-AMS resolution inside its definition. (Some are reference-data-backed, e.g. "at or below state minimum" against a state-minimums table.) So the model complicates only where forced:

1. **`ams.` / `pl.` raw, math inline** ← PoC (one AMS, PL authors)
2. **name a `calc.` field** ← when reused, or exposed to tier-2
3. **per-AMS resolution inside a `calc.` field** ← only when a 2nd AMS needs that field

The "seven AMSes store renewal date seven different ways" problem is real — but it's a *step-2/3, multi-AMS* problem, not a PoC one. The deeper design (catalog, versioning, agency extensions) lives in [`concepts_working_doc.md > §4.3`](concepts_working_doc.md), deferred until that step actually arrives.

### A note on the "policy in force" filter

Some canonical fields only make sense paired with another condition. The main case is date-based fields and policy status: when a policy is canceled in HawkSoft, the renewal/expiration date becomes unreliable (stale value or gone), but other date fields stick around. A naive "renewal in 30 days" segment that doesn't *also* filter `status = active` will start emailing canceled policies — bad.

The fix is **just another condition** — include `status = active` in the predicate. It's not a special construct: at PoC, PL hand-writes the SQL, so it's one more line in the `WHERE` clause. We deliberately don't model "guards" as a separate concept (it would only ever compile to a plain `AND`).

*Deferred, tier-2 only:* once non-experts author segments, a canonical field could quietly **auto-include** this companion condition so a self-serve author who picks "days until renewal" doesn't forget it and footgun. That's an invisible convenience of the field in the future catalog — not a user-facing concept, and nothing to build at PoC.

Surfaced by Marker Insurance during their 2026-05-27 onboarding (`concepts_working_doc.md` §12.1).

---

## PolicyLift-side data in Segments

Not all the data a Segment queries comes from the AMS. Some lives on PolicyLift's side: tags applied by the client, custom fields they've set up, do-not-market flags, consent and suppression state, lifecycle markers.

These need to be queryable in the same Segment expression as canonical AMS fields. Concretely: a Segment can say *"Auto policies renewing in 30 days [from the AMS] AND has the 'Inspection Pending' tag [from PolicyLift] AND has not unsubscribed [from PolicyLift suppression]"* and the Segment engine joins both data sources at query time without the client having to know which is which.

This matters more than originally planned. The first sketch of the email product assumed clients would tag in their AMS and PolicyLift would just read those tags — but during Marker's onboarding it became clear that HawkSoft's substatus (which is the tagging-like field available via API) is only editable on a few statuses (Cancellation / Non-Renewed / Moved / Rejected) and NOT on the New Business / Rewrite statuses where Marker needed it for inspection tracking. So AMS-only tagging is structurally blocked for a big chunk of real use cases, and PolicyLift-side tags end up doing more of the work than the original framing suggested.

Tag design itself — categories, colors, AND/OR logic, system tags vs custom tags — lives in [`concepts_working_doc.md > §7 N1`](concepts_working_doc.md) and will get its own companion doc when it matures. For Segment design, the relevant point is just that PL-side data and AMS data both feed the same Segment query.

---

## Segment metadata — sender hints and ownership

A Segment can carry metadata beyond its predicate. The current motivating case is **prospect lists with producer assignment** (Marker §12.1):

- An agency uploads a prospect list — say J-Lo's 200-name list for the contractor outreach campaign
- The list gets tagged in HawkSoft as J-Lo's
- That tag becomes a Segment ("J-Lo's contractor prospects")
- All emails from that Segment should be sent from J-Lo, not from a house mailbox or some other producer

The producer assignment isn't part of *who matches the Segment* — it's a property *of the Segment*. So Segments carry an optional metadata block:

- **Suggested sender** — for use by the sender-resolver chain when a Broadcast or Automation uses this Segment (covered in the Broadcast/Automation docs)
- **Owner** — which user/producer "owns" the Segment, for permissions and visibility
- **Tags** on the Segment itself (different from tags on contacts) — for organizing the library

Metadata is opt-in. Most Segments don't need it; the prospect-list-with-producer case is the canonical reason it exists.

---

## Where Segments fit alongside other concepts

A Segment is one of [the four primitives](concepts_working_doc.md) — Segment, Template, Broadcast, Automation. The boundaries are deliberate:

- **Segments are stateless.** They answer "who matches?" Nothing else.
- **Templates** carry the actual content of a message — body, subject, merge tokens. Channel-aware (email/SMS/postcard).
- **Broadcasts** combine a Segment + Template + sender + schedule → one send.
- **Automations** combine a Trigger + Segment + sequence of Templates → ongoing enrollment.

A Segment doesn't know how it'll be used. The same Segment can power five different Broadcasts and three Automations. Its only job is to be a correct, fast, current answer to a question.

A few specific non-overlaps worth being explicit about:

- **Segments don't know about recipients.** Recipients are *people who'll receive an email*. Segments may anchor on accounts or policies; turning those into actual contact-method targets is the job of the Broadcast or Automation (covered as "Recipient resolution" / fanout in their docs).
- **Segments don't know about senders.** A Segment may carry a *suggested* sender via metadata, but the actual From identity per message is resolved by the Broadcast or Automation at send time.
- **Segments don't know about timing.** When something happens (now / scheduled / triggered) is the Broadcast's or Automation's concern.
- **Segments don't carry "campaign state."** Per-person enrollment in an Automation is the Automation's state, not the Segment's.

These non-overlaps are the entire reason the four primitives are clean.

---

## Implementation details

The technical side of how Segments work in the system. Non-technical readers can stop here; everything below is for engineering reference. The implementation evolves substantially between PoC and beyond — PoC keeps it intentionally simple, the post-PoC version supports client authoring.

### PoC: schema

Each saved Segment is a row in a `segments` table:

```
segments
├── id                  uuid
├── name                text                  -- "Auto policies below state minimum"
├── description         text                  -- shown in library + tooltip
├── category            text                  -- "Renewal" / "Cross-sell" / "Lifecycle"
├── anchor_entity       text                  -- 'account' | 'policy' | 'contact' | 'claim' | 'quote'
├── agency_id           uuid (nullable)       -- null = global, available to all agencies
├── ams_scope           text[]                -- e.g. ['hawksoft','ezlynx']; null = all
├── query_sql           text                  -- the SQL; must return single column `id` of anchor type
├── metadata            jsonb                 -- suggested sender, ownership, hints
├── is_active           boolean
├── last_run_at         timestamptz
├── last_count          int
├── last_run_duration_ms int
├── last_error          text
├── created_by / created_at / updated_by / updated_at
```

`query_sql` receives `:agency_id` as a bound parameter and must return `id` of the anchor entity as a single column.

### PoC: per-AMS branching in SQL

PL writes per-AMS branching inline. Example for the "Auto policies renewing in next 30 days" Segment:

```sql
SELECT DISTINCT p.id
FROM policies p
JOIN accounts a ON p.account_id = a.id
JOIN policy_types pt ON p.policy_type_id = pt.id
WHERE a.agency_id = :agency_id
  AND pt.type = 'personal_auto'
  AND p.status = 'active'                    -- "policy in force" filter (just a condition)
  AND CASE a.ams_type
    WHEN 'hawksoft' THEN p.effective_date + INTERVAL '300 days'
                          BETWEEN now() AND now() + INTERVAL '30 days'
    WHEN 'ezlynx'   THEN p.renewal_date
                          BETWEEN now() AND now() + INTERVAL '30 days'
    -- ... per AMS
  END;
```

Inline `CASE a.ams_type` branching keeps complexity in the Segment query rather than spreading it across schema views or app-layer logic. Honest and ugly; gets replaced by the canonical-field catalog when that ships.

> **Note on the renewal proxy.** Two ways to resolve "days until renewal" (Alex, 2026-06-02 — see working-doc §12.2): **prefer `renewal_date` directly** where the AMS carries it reliably; **fall back to `effective_date + term`** where it doesn't (AR's approach — Effective Date is more universal and consistent). The `+ INTERVAL '300 days'` above is **illustrative, not a constant** — the term is **agency-configurable** (and may be per-AMS): agencies represent renewal differently and not every book is a clean 1-year term, so the offset lives in config, not hardcoded. AR assumes a ~360-day (1-yr) term; if using the effective-date proxy, the term should reflect the agency's actual policy terms.

### PoC: execution operations

Three operations matter:

- **Count** — `SELECT COUNT(*) FROM (query_sql) sub` cached in `last_count`. Refreshed nightly via a background job and on-demand from the segment detail UI.
- **Sample preview** — `SELECT id FROM (query_sql) sub ORDER BY id LIMIT 50`, joined back to a per-anchor display view (see below). On-demand only.
- **Resolve for send** — full result set materialized at Broadcast send or Automation evaluation time. This is the canonical "who's in the Segment right now" answer.

No persistent membership cache at PoC. Every operation runs the query. If query cost becomes a problem at scale, add a `segment_membership_cache` table keyed by `(segment_id, anchor_id)` with `computed_at`.

### PoC: per-anchor display views

Sample preview and audience verification both need to show records in a human-readable form. Each anchor type has a "display view" that maps IDs to columns:

- Account anchor → name, primary contact, status, total_premium
- Policy anchor → policy_number, type display, carrier, effective_date, renewal_date, account name
- Contact anchor → name, email, role, account name
- Claim anchor → (post-PoC)
- Quote anchor → (post-PoC)

These views are also consumed by the audience-verification UI at Broadcast send and Automation activation, so the display is consistent across surfaces.

### PoC: composition at the Campaign level

Composition is **on the Campaign**, not stored as a separate Segment entity at PoC. A Broadcast or Automation holds a recipe:

```
campaign.segment_recipe = [
  { segment_id: "auto-below-state-min",  op: "include" },
  { segment_id: "in-california",         op: "intersect" },
  { segment_id: "has-unsubscribed",      op: "except" }
]
```

Executed at send time with Postgres set operators:

```sql
(SELECT id FROM (segment_1_sql) s1)
INTERSECT
(SELECT id FROM (segment_2_sql) s2)
EXCEPT
(SELECT id FROM (segment_3_sql) s3);
```

All Segments in a recipe must share `anchor_entity`. Mixing anchor types is rejected at recipe creation with a clear error.

### Beyond PoC: predicate AST replaces opaque SQL

Each Segment stores a serialized predicate (JSON), not raw SQL. A compiler turns the AST into SQL at execution time.

```json
{
  "anchor": "account",
  "predicate": {
    "type": "group",
    "op": "and",
    "rules": [
      { "type": "rule", "field": "account.total_premium", "op": "gt", "value": 5000 },
      {
        "type": "quantifier",
        "scope": "any",
        "collection": "policies",
        "predicate": {
          "type": "group",
          "op": "and",
          "rules": [
            { "field": "policy.status",           "op": "eq",  "value": "active" },
            { "field": "policy.renewing_in_days", "op": "lte", "value": 30 }
          ]
        }
      }
    ]
  }
}
```

Format:

- `anchor` at the top — every Segment has one anchor entity
- `type: "group"` — boolean composition. **Pinned to CNF: a top-level AND of OR-groups, exactly one level of nesting** (see below). Not a freely-nested AND/OR tree.
- `type: "quantifier"` — explicit existence / universal predicates over child collections. `scope` is `any | all | none`. This is the cleaner version of AR's "set of sets" UI pattern.
- `type: "rule"` — leaf predicates with `field` referencing a canonical field ID or raw AMS path.

PoC SQL Segments can migrate to AST form via a synthetic "raw SQL rule" type if backward compatibility is needed during the transition.

#### Boolean shape: CNF within a Segment, union across Segments

A single Segment's predicate is **pinned to CNF — a top-level AND of OR-groups, with exactly one level of nesting** (`AND( OR(...), OR(...), ... )`). This is *not* a freely-nestable AND/OR tree. The decision follows both the research doc's "cap visible nesting at 2 levels" guidance and Klaviyo's segment builder, which pins to the same shape: groups are joined by a hardwired AND, and OR lives only *inside* a group (OR binds tighter, auto-parenthesized between ANDs — so flipping an inner OR to AND ejects the condition to the top level). Verified against Klaviyo's docs, 2026-06-01 (see `changelog.md`).

Why this isn't a loss of expressive power, only of shape:

- **CNF is the natural form for *narrowing one audience*** — keep adding required gates with AND, each gate allowing alternatives with OR ("engaged (opened OR clicked) AND is a customer AND in (CA OR NY)"). This is how agencies actually reason about who a campaign is for.
- **DNF — a *union of distinct personas*, `(A AND B) OR (C AND D)` — is deliberately *not* expressed in the predicate.** It's a [composition](#combining-segments--composition): build each AND-group as its own Segment and `union` them via tier-3. Klaviyo's own escape hatch for this case is "make separate segments"; our composition layer is the first-class version. Every boolean formula *has* a CNF, so nothing is strictly inexpressible inside one Segment — but DNF-shaped intent expands combinatorially when forced into CNF, which is exactly the signal that it belongs in composition instead.
- **Relational complexity stays out of the boolean layer.** Counting and existence ("≥ 2 auto policies under $1k") live in the `quantifier` node / leaf condition (the Mixpanel-sentence, "placed order ≥ 2 times" pattern), not in the AND/OR structure — so the group tree never has to nest to express a relational fact. The boolean layer and the [complexity ladder](#the-complexity-ladder--flat-predicates-to-quantified-relations)'s relational axis are kept orthogonal.

### Beyond PoC: condition categories (category-first builder)

A leaf condition is **not** a uniform `(field, operator, value)` triple. Different *kinds* of condition have fundamentally different grammars — a behavioral/engagement condition needs frequency + recency, a consent condition has fixed semantics and no free operators, a related-record condition needs a quantifier. The clean way to model this — validated by Klaviyo's segment builder (verified 2026-06-01) and Adobe's Attributes/Events/Audiences tabs — is to make the **condition category the first, explicit choice**, and have it select the sub-builder (and the AST node type) underneath. This supersedes the tier-2 sketch's "pick a field, then we infer whether it's a quantifier" approach: pick the *category* first, and the field picker, operators, and value editor follow from it.

Klaviyo's seven categories anchor on Person and query "kinds of facts about a person." Ours anchor on Account / Policy / Contact / … and query facts about the anchor *and its related insurance records*, so the category set differs:

| PL condition category | Klaviyo analog | Builder shape | AST node | PoC? |
|---|---|---|---|---|
| **Properties about the [anchor]** | Properties about someone | canonical/raw field → type-driven operator → value editor | `rule` | ✅ core |
| **Related insurance records (quantified)** | What someone has done | child entity (policy/claim/quote) → `any`/`all`/`none` + count → nested predicate (+ same-row scoping prompt) | `quantifier` | ✅ the differentiator |
| **Email/SMS engagement** | What someone has done (events) | message event (opened/clicked/bounced/replied) → frequency + recency | `quantifier` over sends | ⏳ needs send history |
| **Consent / marketing eligibility** | Can/cannot receive marketing | channel → consent state (fixed semantics, no free operators) | specialized `rule` | ✅ critical (exclude unsubscribed) |
| **In / not in another Segment** | In or not in a list | pick a Segment → in / not-in | composition / `rule` | ✅ (≈ tier-3) |
| **Tags / PL-side annotations** | (folded into properties) | tag / custom field → has / doesn't-have | PL-side `rule` | ✅ (Marker inspection tag) |
| **Location** | Proximity / EU GDPR | state (a property) / radius from zip | `rule` / geo | state ✅ (as property); proximity ❌ |
| **Predictive** | Predictive analytics | ML metrics | — | ❌ (no near-term plan) |

Three categories — consent, segment-membership, tags — confirm that those aren't generic field predicates but distinct condition kinds with their own semantics. And the "Related records" category *is* the [complexity-ladder](#the-complexity-ladder--flat-predicates-to-quantified-relations) quantifier surfaced as a first-class category — Klaviyo's "What someone has done" (frequency + recency over an event collection) is the same machinery, which reinforces keeping the quantifier in the category/leaf and the boolean layer flat (CNF, above).

Two wrinkles Klaviyo's single-anchor model doesn't have:

- **Categories are anchor-dependent.** The available fields ("Properties about the *Policy*" vs "*Account*") and child collections ("Related records" on an Account = policies/claims/quotes; on a Policy = claims + parent account) change with the anchor. The category list and its sub-pickers must be filtered by the Segment's anchor.
- **Engagement and consent live on *contacts*, but the anchor often isn't a contact.** "Account has a contact who opened the May email" or "…who hasn't unsubscribed" is itself a *quantifier over the account's contacts*. So when anchor ≠ Contact, the engagement and consent categories silently become quantified — and "exclude unsubscribed" on an Account- or Policy-anchored Broadcast is an everyday case, so this needs a sensible default (e.g. "any contact" / "the primary contact") rather than forcing the user to express the quantifier.

### Beyond PoC: canonical field catalog as first-class

Stored as a table with per-AMS resolution functions:

```
canonical_fields
├── id                              -- "policy.renewing_in_days"
├── display_name                    -- "Days until policy renews"
├── description
├── category                        -- "Policy lifecycle"
├── entity                          -- 'policy'
├── cardinality                     -- 'single' | 'many'
├── type                            -- 'number' | 'date' | 'boolean' | 'currency' | 'string' | 'enum'
├── domain                          -- for enum types, the allowed values
├── default_condition               -- optional companion condition the field auto-includes (tier-2 convenience, e.g. policy.status = 'active'); just an AND'd predicate, not special
├── predicates                      -- ['eq', 'lte', 'gte', 'between']
├── per_ams_resolutions             -- jsonb:
                                    --   { hawksoft: { kind: 'expr', sql: '...' },
                                    --     ezlynx:   { kind: 'expr', sql: '...' },
                                    --     nasa:     { kind: 'unavailable', reason: '...' } }
├── created_by / created_at / updated_by / updated_at
```

The compiler combines the predicate AST + the requesting agency's `ams_type` to produce executable SQL by inlining the right resolution per field. AMS-unavailable canonical fields surface in the builder UI as greyed out for that agency.

### Beyond PoC: composition as a stored entity

Saved compositions are promoted to first-class Segments with `type: 'composition'` referencing other Segments + operators. Reusable across multiple Campaigns. Useful when an agency has a stable combination they keep coming back to ("our active commercial book minus high-risk minus opted-out").

### Beyond PoC: other backend work

- **Membership materialization** for large agencies. Background recomputation triggered by AMS sync events and PL-side data changes.
- **AMS-availability check at save time** — when a Segment is authored, the system reports "this won't fully resolve on EZLynx because canonical field X is unavailable there."
- **Versioning** — Segments get a `version` field; Campaigns can either pin to a version or auto-follow.
- **Cross-anchor lifting** — a Policy-anchored Segment can be automatically lifted to Account-anchored when composed with one (via `policies.account_id IN (...)`).

### Beyond PoC: tier-2 builder UI

The client-facing rule composer. Sketch:

- Anchor entity selector at the top (default Account)
- Group combinator below ("Match **all** of the following" / "Match **any**")
- "Add rule" opens a **condition-category** picker first (see [condition categories](#beyond-poc-condition-categories-category-first-builder) above) — the chosen category selects the sub-builder. Within a category, a hybrid field picker: categorized panel + search bar on top
- Once a field is picked, operator dropdown filtered by type, value editor adapts to type
- For many-cardinality fields (e.g. `policies.*` on an Account-anchored Segment), an explicit micro-prompt: "Where the policy [is / is not / there's no policy where] ..." mapping to `any / none / all`
- When adding a second rule on the same child collection, ask "Same policy as above? Or any matching policy?" → resolves to single-quantifier-group vs separate-quantifier-groups
- Live count in the header, debounced
- Two-number display: "**~287** matches now (last verified count: **283** at 8:42am)" — exact-stale + estimated-fresh
- Sample preview drawer flips out from the right

Composition UI (tier 3 in the builder world) is a separate authoring mode that combines saved Segments instead of building from rules.

---

## Open questions

1. **Per-AMS branching inline vs. early canonical-field abstraction.** Inline SQL works for PoC. As we add agencies on more AMSes, the copy-paste burden grows. Watch for the threshold where the canonical-field catalog earns its build cost.
2. **Composition stored vs. on the Campaign.** Campaign-side for PoC simplicity. Promote when clients ask for saved compositions explicitly.
3. **Cross-anchor composition.** Forbid at PoC (clear error); auto-lift later.
4. **Per-anchor display schemas.** Used by Segment detail, audience verification, and recipient preview — worth designing once explicitly so consistency holds.
5. **Default fanout per anchor.** Account → primary contact, Policy → named insured on that policy, Contact → that contact. These are implicit defaults the Broadcast/Automation honors; worth documenting once.
6. **Canonical field naming.** "Canonical field" is a working name. Customer-facing label might be "data field" or "merge field" or something more familiar.
7. **Tier-3 operator vocabulary.** Going with "include / intersect / except." If a customer trips on this, revisit (`union` vs `or`, `except` vs `not`, etc.).
8. **Resolution function location.** Where do per-AMS resolutions live in code/config when the catalog ships? TypeScript? Config table? Expression language? See `concepts_working_doc.md` §8.2 open question #1.
9. **Segments that span agencies.** Mostly out of scope — segments are agency-scoped — but the global Segment case (PL-built, `agency_id = null`) needs explicit ownership / change-control rules.
10. **Boolean shape — CNF-pinned vs. general tree.** Leaning **CNF (AND-of-OR-groups, one nesting level) inside a Segment, with DNF / union-of-personas pushed to tier-3 composition** — matching Klaviyo and the research doc's nesting cap. Open: confirm tier-1 PL-authored SQL Segments are never forced into this shape (they aren't — raw SQL is unconstrained), and that the tier-2 builder UI never silently distributes a user's DNF intent into a combinatorial CNF blow-up instead of nudging them to composition. Also: do agencies ever genuinely need DNF *within* one Segment in a way composition handles awkwardly (e.g. reporting wants it as one Segment)?
11. **Condition categories — the PL category set.** Adopting Klaviyo's category-first model (category selects the sub-builder + AST node). Open: lock the PL category list (the table above is the candidate); decide whether Tags is its own category or folds into Properties; decide the default contact-quantifier for engagement/consent conditions on non-Contact anchors ("any contact" vs "primary contact"); and where "in / not in another Segment" lives — an inline condition category vs. only the tier-3 composition recipe (avoid two ways to do the same thing).
