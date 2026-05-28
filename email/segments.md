# Segments

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Segment primitive — what it is, how clients use it, how the three authorship tiers work, how it composes with other Segments, and how it's implemented under the hood. Non-technical readers can stop at "Implementation details"; everything before that is plain-language.

**Created:** 2026-05-27

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`research_segment_builder_ux.md`](research_segment_builder_ux.md) · [`changelog.md`](changelog.md)

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

PolicyLift's team writes Segments on the client's behalf. The client picks from a list of pre-built Segments curated for their agency and AMS. The complexity of insurance segmentation — the AMS-specific data shapes, the "policy in force" guards, the canonical-field resolution — lives entirely on PolicyLift's side. The client doesn't see it.

This is the only tier we ship at PoC, and the only one we need to onboard real customers. Why: insurance segmentation is hard and AMSes vary wildly. The first time a client gets to author a Segment from scratch is also the first time they get to author it *wrong* — and a wrong Segment sends a wrong campaign to real customers. Starting with PL-authored Segments lets us onboard fast and learn what clients actually need before exposing them to authoring.

When a client needs a Segment that doesn't exist yet, they file a service request. PolicyLift creates it, sends a preview link or a Loom showing how it works, and the client approves. This concierge model is operational at PoC, not a fallback.

### Tier 2 — clients build their own simple Segments

Once we know which fields clients reach for most often, we'll ship a rule-based builder. The client picks a field, picks an operator, picks a value; combines multiple rules with And/Or; sees the matching count live; saves it under a name. This is the shape every modern marketing tool ships, and it covers maybe 80% of what clients want to do day-to-day.

Tier 2 is post-PoC. It depends on a few things that aren't ready yet — most importantly the canonical field catalog (covered below) — and we want client signal before we lock in which fields and operators matter.

### Tier 3 — combining Segments

Even with PL-built Segments only, clients need to combine them. "Send to (PL-built: Auto-below-state-min) AND (in California) AND NOT (already contacted this month)" — three Segments stacked into one final audience. This is tier 3 — composition — and it's what makes tier 1 scale.

Without tier 3, PolicyLift would have to write a new Segment every time an agency wanted a slightly different cut. With tier 3, PolicyLift writes one "Auto below state minimum" Segment, and twenty different agencies can layer their own filters on top.

Tier 3 ships with PoC. Combining Segments is straightforward to build and immediately useful.

---

## Browsing Segments — the library

The Segment library is one of the four screens clients touch in the email product (alongside the Template editor, Broadcast builder, and Automation builder). It's a list view of every Segment available to the client's agency — both PolicyLift-built and any client-saved compositions.

Each row in the library shows:

- **Name** and short description
- **Category badge** — Renewal / Cross-sell / Lifecycle / Marketing / Hygiene / etc.
- **Anchor type** — small icon indicating whether it returns accounts, policies, contacts, etc.
- **Current count** — "284 matches" as of the last refresh
- **AMS compatibility** — a small chip showing which AMSes the Segment works on. Most work on all; some are AMS-specific.

Clients can filter by anchor type, category, or AMS compatibility, search by name + description, and sort by name / count / recently used. Clicking a row opens a detail view.

The detail view shows the full description, the current count with a refresh button, a sample preview (covered next), and a "Use in Broadcast" / "Use in Automation" CTA. There's no editing affordance for clients — only PolicyLift staff can change a Segment's underlying logic, via a service request from the client.

The library is also where clients realize a Segment they want doesn't exist. The flow is: search → don't find what they need → click "Request a new Segment" → fill out a short form describing the criteria → PolicyLift builds it and sends back a preview link.

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
- **Automations explicitly choose** how to handle ongoing matches via an enrollment policy ("at-launch only" / "newly-entering only" / "continuous"). This lives on the Automation, not on the Segment. The Segment doesn't care; the Automation decides when to ask.

Treating Segments as questions instead of lists keeps the data model simple and the user mental model honest. Re-using the same Segment in different campaigns with different ongoing behavior is the whole point.

(For more on enrollment behavior, see the [`concepts_working_doc.md`](concepts_working_doc.md) §5.6 walkthrough and — eventually — the Automation companion doc.)

---

## Canonical fields — same concept, different AMS shapes

Insurance agencies don't all use the same agency management system. PolicyLift currently integrates with seven (HawkSoft, EZLynx, Sentry, QQCatalyst, Momentum, AgencyMatrix, NASA Eclipse) and each stores its data differently. "Policy renewal date" lives in seven different places, sometimes computed differently, sometimes named differently, sometimes missing entirely.

Clients don't want to know about that. When they ask for a "renewal in 30 days" Segment, they expect it to work the same way regardless of their AMS.

The unifying layer is what we call a **canonical field** — a client-facing concept ("Policy renewing in N days") that resolves per-AMS underneath. The client picks "renewal in N days"; PolicyLift's Segment engine knows how to compute that for HawkSoft vs EZLynx vs NASA.

A canonical field carries:

- A **display name + definition** ("Policy age" = days since the policy was first written)
- The **AMSes it works on** — sometimes a field is genuinely missing from one AMS, and the Segment builder should grey out gracefully rather than pretend
- A **type** (number, date, true/false, currency, list-of-values) — drives which operators apply
- Per-AMS **resolution functions** — the actual logic that turns the raw AMS data into the canonical value

Some canonical fields are simple lookups ("the policy's status"). Some are computed from raw AMS data ("days until renewal," derived from one of three possible date fields per AMS). Some depend on reference data PolicyLift maintains ("Is at or below state minimum," which uses a state-by-state minimum-limits table that gets updated when states change their requirements).

For PoC, PolicyLift writes per-AMS logic by hand directly into each Segment's query. There's no canonical-field catalog as a separate concept yet — the complexity lives in PL's Segment library, which is OK because PL is the only one authoring at PoC. The canonical-field catalog as a first-class concept ships before client-built Segments (tier 2), because the moment clients can pick fields, they need a unified field vocabulary that doesn't expose AMS internals.

The deeper canonical-field design — shape, catalog model, versioning, agency extensions — lives in [`concepts_working_doc.md > §4.3`](concepts_working_doc.md) until it deserves its own companion doc.

### Companion predicates (status guards)

One specific pattern worth calling out: some canonical fields only make sense when paired with another filter. The most common case is date-based fields and the "policy in force" status. When a policy is canceled in HawkSoft, the expiration date becomes unreliable (it may persist with a stale value or disappear entirely), but other date fields stick around. A naive "renewal in 30 days" segment that doesn't filter on `status = active` will start emailing canceled policies, which is bad.

The fix: canonical fields that have this problem declare a **status guard** — a companion predicate the Segment engine adds automatically. "Renewal in N days" carries `policy.status = active` as a guard; PolicyLift staff don't have to remember to add it.

This was surfaced by Marker Insurance during their 2026-05-27 onboarding call (captured in `concepts_working_doc.md` §12.1).

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
  AND p.status = 'active'                    -- "policy in force" guard
  AND CASE a.ams_type
    WHEN 'hawksoft' THEN p.effective_date + INTERVAL '300 days'
                          BETWEEN now() AND now() + INTERVAL '30 days'
    WHEN 'ezlynx'   THEN p.renewal_date
                          BETWEEN now() AND now() + INTERVAL '30 days'
    -- ... per AMS
  END;
```

Inline `CASE a.ams_type` branching keeps complexity in the Segment query rather than spreading it across schema views or app-layer logic. Honest and ugly; gets replaced by the canonical-field catalog when that ships.

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
- `type: "group"` — AND/OR composition. Mixing AND with OR requires nesting, in line with research best practice.
- `type: "quantifier"` — explicit existence / universal predicates over child collections. `scope` is `any | all | none`. This is the cleaner version of AR's "set of sets" UI pattern.
- `type: "rule"` — leaf predicates with `field` referencing a canonical field ID or raw AMS path.

PoC SQL Segments can migrate to AST form via a synthetic "raw SQL rule" type if backward compatibility is needed during the transition.

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
├── status_guard                    -- optional companion predicate (e.g. policy.status = 'active')
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
- "Add rule" opens a hybrid field picker: categorized panel + search bar on top
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
