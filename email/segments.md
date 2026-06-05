# Segments

**Status:** Companion detail doc for the **Segment** primitive — the deep dive beneath [`vision.md`](vision.md). What a Segment is, how clients use it, how the three authorship tiers work, how it composes, where the Segment↔Automation line sits, and the conceptual model underneath. Plain-language throughout — there's no deep-technical section here; engineers derive the build from these concepts.

**Created:** 2026-05-27 · **Updated:** 2026-06-05 (Segment↔Automation boundary; raw-AMS-first sharpening)

**Related:** [`vision.md`](vision.md) (the front door) · [`concepts_working_doc.md`](concepts_working_doc.md) · [`segment_library_poc.md`](segment_library_poc.md) (concrete tier-1 Segments + the `ams.`/`pl.` fields they read) · [`research_segment_builder_ux.md`](research_segment_builder_ux.md) · [`changelog.md`](changelog.md)

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

## How Segments get authored

A Segment can be authored at a few levels of self-serve. The more self-serve the tool, the simpler it is — and the more guardrails it needs, because a wrong Segment sends a wrong campaign to real customers. So authoring starts on PolicyLift's side and opens up outward as we learn.

### PolicyLift writes them (tier 1)

The complexity of insurance segmentation — AMS-specific data shapes, "policy in force" filters — stays on PolicyLift's side, out of the client's view. There's a progression in *how* PolicyLift authors:

- **Engineers write the query directly.** The simplest and most powerful — it handles every case, including the hard relational ones. This is how the first real Segments get made.
- **Ops use a rudimentary builder.** A lighter internal tool so the ops/CS team can create and tweak Segments without pulling in an engineer. At its simplest that "builder" is little more than a box to enter a query; it can grow into a real field-picker over time.

Either way the result is a **Managed** Segment — read-only to the client. When a client needs one that doesn't exist yet, they arrange it with ops directly, out of band (they're already in regular contact); PolicyLift builds it, shares a preview or a Loom, and the client confirms. There's deliberately no in-product "request a segment" flow.

### Clients build their own (tier 2)

Further along, a client-facing builder: pick a field, an operator, a value; combine a few rules with And/Or; watch the count update live; save it under a name — the shape every marketing tool ships, producing a **Regular** (client-editable) Segment. This is also where a client can author a Segment *wrong*, so it opens up once we've learned which fields and rungs clients actually reach for.

### Combining Segments (tier 3 — uncertain)

A natural-sounding follow-on is stacking saved Segments — "Auto-below-state-min AND in California AND NOT contacted this month." Worth a reality check before committing to it: even mature tools don't ship a first-class "merge these saved Segments into a new one." Klaviyo has no combine-segments object — you either reference another segment as a *condition* inside the builder ("is in / not in segment X"), or, at send time, target several segments at once (a deduped union); AR and Levitate are similar (rule conditions, tag include/exclude). So if we do this, it's likely the same way — a membership condition and/or a campaign-level "send to these few" — rather than a separate composition feature. Whether we need any of it early is an open question. (Mechanics, if we do build it, are under [Combining Segments — composition](#combining-segments--composition) below.)

---

**A second axis runs underneath authorship: *what the criteria can express*** — from flat filters to quantified relations over related records. That's the deepest conceptual material in this doc, so it lives at the end of the conceptual tier rather than here. See [The complexity ladder](#the-complexity-ladder--flat-predicates-to-quantified-relations).

---

## Browsing Segments — the library

The Segment library is one of the four screens clients touch in the email product (alongside the Template editor, Broadcast builder, and Automation builder). It's a list view of every Segment available to the client's agency. There are two kinds, marked in each row (Reach-style): **Managed** — PolicyLift/ops-built, read-only to the client — and **Regular** — client-built and editable.

Each row identifies a Segment, marks it **Managed** or **Regular**, and shows its size at a glance; clients search and filter the list and click into a Segment for the full detail view. (Exact columns, filters, and layout are a design concern — see the prototype blueprint, `prototype/v1/blueprint.md`.)

The detail view shows the full description, the current count with a refresh button, a sample preview (covered next), and a "Use in Broadcast" / "Use in Automation" CTA. **Managed** Segments are read-only here (a "Managed by PolicyLift" note, no edit) — their logic is maintained by PolicyLift; **Regular** Segments show an **Edit** action that opens the builder.

When a client needs a Managed Segment created or changed, they arrange it with the PolicyLift ops team **directly, out of band** — there is no in-product request flow (clients are already in regular contact with ops). An in-product "request a segment" surface may come later, but it's deliberately left out for now.

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

> **A candidate capability, not a committed one.** As noted under [How Segments get authored](#how-segments-get-authored) above, even mature tools don't ship a "merge saved Segments" object — they express this as a membership condition or a send-time multi-select. The mechanics below are how a first-class version *would* work if we decide we need one.

Real campaigns often target a combination rather than a single Segment. "Customers with state-minimum auto in California who haven't opted out" is three filters stacked.

There are three ways Segments combine:

- **Include / Intersect** — both Segments must match. *"In California" AND "Auto below state min"* = California customers with state-min auto.
- **Union** — either Segment matches. *"Auto below state min" OR "Home with $100K liability"* = anyone underinsured on either line.
- **Except** — first Segment matches AND second does NOT. *"Renewal in 30 days" EXCEPT "Already contacted this month"* = the right people to email this week.

In the UI, this looks like a recipe — start from a Segment, add another with a chosen operator, see the running count update at each step, add more if needed. Each step is visible; the order doesn't change the result mathematically but it can change the running count display.

All Segments in a composition must share the same anchor type. You can't combine a Policy-anchored Segment with an Account-anchored Segment directly (the answers are different shapes — there's no obvious way to say whether "Account X" intersects with "Policy 42"). Later we'll support automatic "lifting" — a Policy-anchored Segment can be lifted into an Account-anchored one by asking "which accounts have at least one matching policy?" — but that's a later capability.

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

## What lives on the Segment vs. the Automation

Segments and Automations are tightly related, and the line between them is the spine of the design (`concepts_working_doc.md` §5.8). The split:

> **The Segment holds the durable "what kind of record is this" — slow-changing, reusable, written in the agent's own AMS vocabulary. The Automation holds the temporal and program logic — when to send, who it's from, and any refining filters layered on top.**

A renewal program is a *simple, reusable* Segment ("active auto policies") plus an Automation that supplies the timing ("30 days before the renewal date") and the send resolution — **not** a bespoke "renewing in exactly 30 days" Segment that churns daily. Rule of thumb: *if you'd reuse this exact audience for a different message, it's a Segment; if it only makes sense for one program, it's a filter on the Automation.*

Two consequences:

- **Separate entities, shared result.** You don't author a Segment from inside an Automation — but the Automation always shows the **net resulting audience** after its layered filters, so the agency never has to guess who a program will reach. Reach's mistake was forcing the two apart with no shared view (and producing ~50 one-to-one segment/automation pairs); we keep them distinct but surface the result together.
- **Filter-on-top avoids segment sprawl.** Because the Automation can narrow a broad Segment with its own profile filters, agencies don't need fifty near-identical Segments that differ by a single condition.

This is also *why* a Segment can stay simple and reusable: the parts that vary per campaign — timing, sender, last-minute exclusions — deliberately live on the Automation, not baked into the Segment.

---

## Fields by source — `ams.`, `pl.`, and (later) `calc.`

A Segment's predicate references fields, and the simplest useful model names them by **source**:

- **`ams.*`** — data that originates in the AMS: `ams.policy.status`, `ams.policy.renewal_date`, `ams.policy.substatus`. This is a *source* label, not a storage one — whether PolicyLift keeps a field in a normalized CXP column or reads it from raw `ams_data` JSONB is invisible *under* the `ams.` name; the author doesn't care.
- **`pl.*`** — data that originates in PolicyLift: `pl.conversation.type`, tags, NPS responses, consent/suppression, custom fields, lifecycle markers.

So "accounts with an active policy and no chats" is `count(ams.policy where status = 'active') > 0 AND count(pl.conversation where type = 'chat') = 0`.

### Today: no canonical / mapping layer

Right now we're onboarding one agency on one AMS (Marker / HawkSoft), and PolicyLift authors the Segments. With **one** AMS there is nothing to map *across*, and with **PL-only** authoring nobody needs a friendly vocabulary that hides field names — so we **don't build a normalization layer**. Segments reference `ams.*` / `pl.*` fields directly, and each `ams.*` field resolves to one concrete HawkSoft location (a CXP column or a JSONB path). Computed concepts are written **inline** in the SQL — e.g. `ams.policy.renewal_date BETWEEN now() AND now() + 30d`, or `ams.policy.effective_date + <term>` where a reliable renewal date is missing. Clunky but honest — and PL writes it, not clients.

This is close to what Agency Revolution does: its Advanced Segment exposes raw per-AMS fields directly (an "AMS/BMS section… [that] varies from system to system"), normalizing only selectively (policy-type, renewal proxy).

**Why raw-first is the right posture, not merely the simplest (Alex, 2026-06-03).** Agents are experts in their AMS fields and novices in marketing abstractions. They trust `status` + `substatus` because that's *exactly what they use in HawkSoft* — and they distrust a transformed "PolicyLift version" of the same field, because the moment you normalize it the assumptions change and the Segment stops feeling like theirs. So the realistic shape is **raw AMS fields exposed directly, with a different Segment set authored per AMS — and possibly per customer**, mirroring how each agency actually uses its fields. (It's also why Levitate sidesteps the whole problem with tags-only.) See [`concepts_working_doc.md` §12.3](concepts_working_doc.md).

### Later: `calc.*` — the unified / computed layer (deferred)

When a computed concept is reused enough to deserve a name, or is exposed to tier-2 self-serve clients who can't write raw expressions, promote it to a **`calc.*` field** — a *named expression* over `ams.` / `pl.` inputs (e.g. `calc.policy.days_until_renewal`). The prefix flags "computed, possibly approximate / AMS-dependent." A `calc.` field is exactly what earlier drafts called a *canonical field*: it carries a definition, a type, the AMSes it works on, and — **only when a second AMS needs that same field** — a per-AMS resolution inside its definition. (Some are reference-data-backed, e.g. "at or below state minimum" against a state-minimums table.) So the model complicates only where forced:

1. **`ams.` / `pl.` raw, math inline** ← now (one AMS, PL authors)
2. **name a `calc.` field** ← when reused, or exposed to tier-2
3. **per-AMS resolution inside a `calc.` field** ← only when a 2nd AMS needs that field

The "seven AMSes store renewal date seven different ways" problem is real — but it's a *multi-AMS* problem we don't have yet. And even when it arrives, `calc.*` is a **hard sell** (see the trust note above): expect raw fields to stay the default and `calc.*` to be the exception for genuinely reused/multi-AMS concepts, not a friendly front layered over everything. The deeper design (catalog, versioning, agency extensions) lives in [`concepts_working_doc.md > §4.3`](concepts_working_doc.md), deferred until that step actually arrives.

### A note on the "policy in force" filter

Some canonical fields only make sense paired with another condition. The main case is date-based fields and policy status: when a policy is canceled in HawkSoft, the renewal/expiration date becomes unreliable (stale value or gone), but other date fields stick around. A naive "renewal in 30 days" segment that doesn't *also* filter `status = active` will start emailing canceled policies — bad.

The fix is **just another condition** — include `status = active` in the predicate. It's not a special construct: while PL hand-writes the SQL, it's one more line in the `WHERE` clause. We deliberately don't model "guards" as a separate concept (it would only ever compile to a plain `AND`).

*Deferred, tier-2 only:* once non-experts author segments, a canonical field could quietly **auto-include** this companion condition so a self-serve author who picks "days until renewal" doesn't forget it and footgun. That's an invisible convenience of the field in the future catalog — not a user-facing concept, and nothing to build now.

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

## The complexity ladder — flat predicates to quantified relations

This is the deepest conceptual section — the full *why segmentation is genuinely hard* dive. The sections above are the orientation; read them first. The three tiers were about *who* authors a Segment; this is about *what the criteria can express*, a separate axis. Criteria range from trivial ("accounts where status = active") to genuinely demanding ("accounts with at least 2 auto policies under $1,000 each"), and understanding the rungs between them is the single most important concept in the whole Segment design. It's the gap that Reach's too-simple Segment shape couldn't cross, and it's why we anchor Segments on an entity in the first place.

The governing rule is simple: **complexity is driven by the relationship between a criterion and the anchor.** A criterion that lives *on the anchor itself* is flat and easy. A criterion that lives on a *different, related* entity forces a question that flat filtering never has to answer. Here's the ladder, with anchor = **Account** held constant so the escalation is visible.

**Rung 0 — single predicate on the anchor.** `status = active`. One entity, one field, one operator.

**Rung 1 — several predicates on the anchor, AND/OR combined.** `status = active AND state = CA`. Still all fields *of the account*. Flat. This is where most marketing tools max out.

**Rung 2 — a predicate on a *related* entity (the leap).** "Accounts that have an auto policy." The anchor is Account, but `type = auto` is a fact about **Policy**, a child collection. Crossing that boundary forces a question that didn't exist below: an account has *many* policies — how many have to match? That's the **quantifier**, with three settings (`any` / `all` / `none`):

- **any** — has at least one auto policy
- **all** — *every* policy is auto
- **none** — has no auto policy

Rungs 0–1 are "filtering a table." Rung 2 and up are "asking a question about a related set." This is the conceptual cliff.

**Rung 3 — multiple conditions on the child, and the same-row trap.** "Accounts that have a policy of type auto **with premium < $1,000**." Two conditions now live on the policy, and a subtle, bug-prone question appears: *do both conditions have to hold on the **same** policy, or can they be satisfied by **different** policies?* "Same policy" = the account has one auto policy that is also cheap. "Any policy" = the account has *some* auto policy *and* *some* cheap policy — possibly two different ones. These return different account sets, and getting it wrong silently sends the wrong campaign. This is the same-row scoping question the eventual builder has to surface explicitly (the *"Same policy as above? Or any matching policy?"* prompt — see [Category-first conditions](#category-first-conditions-the-eventual-builder) below). It is the #1 footgun in relational segmentation.

**Rung 4 — counting.** "Accounts with **at least 2** auto policies under $1,000." This upgrades the quantifier from *existence* (`any` = "at least 1") to a *threshold count* (≥ 2, exactly 1, between 2 and 5…). Most marketing tools can't do this at all. Rungs 3 + 4 stacked — "at least X policies of type Y with premium < Z, same policy" — is a genuinely demanding query.

**Rung 5 — multiple child collections, mixed quantifiers, negation.** "Accounts with an auto policy (`any`) **AND** no open claims (`none`) **AND** all policies in force (`all`)." Each child collection gets its own independent quantifier. Negation interacts with the quantifier in a way people get wrong: "no policy of type X" (`none` over `type = X`) is **not** the same as "a policy that is not type X" (`any` over `type ≠ X`). Same words, opposite meaning.

**Rung 6 — computed fields.** Swap a raw column for a derived concept: "days until renewal `<= 30`". Not a stored field — computed from `ams.policy.renewal_date` (or `effective_date + term`); written inline now, a named `calc.*` field later (see [Fields by source](#fields-by-source--ams-pl-and-later-calc) above). You'll usually pair it with a plain `ams.policy.status = active` condition (canceled policies have stale dates — see the "policy in force" note above). The complexity here isn't structural; it's that the value is computed, not stored.

**Rung 7 — cross-source (AMS + PolicyLift-side data in one expression).** "…renewing in 30 days [AMS] **AND** has 'Inspection Pending' tag [PL] **AND** not unsubscribed [PL suppression]." The engine joins two data sources in one predicate; the client never has to know which fact came from where. (See [PolicyLift-side data in Segments](#policylift-side-data-in-segments) above.)

**Rung 8 — composition (a different *level* entirely).** This is tier 3. You're no longer building one predicate tree — you're combining whole *answers* with set operators: `(Auto below state min) ∩ (in California) − (contacted this month)`. It sits *above* the ladder because each operand is itself a Segment that internally can be anywhere from rung 0 to rung 7. (See [Combining Segments](#combining-segments--composition) above.)

### The insight that ties it together — anchor choice moves the complexity

The same real-world intent can land on different rungs depending on the anchor, because **the anchor decides which predicates are flat and which require a quantifier:**

- Anchor = **Account**: "has ≥ X auto policies under $Z" is a *quantified, counted* predicate over a child collection — rungs 3–4. Hard.
- Anchor = **Policy**: "type = auto AND premium < Z" is a *flat* predicate on the anchor itself — rung 1. Easy. And the same-row question vanishes, because each row *is* one policy.

Same intent, wildly different query complexity — and a different result *shape* (accounts vs policies). This is why the anchor is a first-class, immutable property of a Segment, and why **cross-anchor lifting** ("which accounts have ≥ 1 matching policy?" — see [What comes later](#what-comes-later) below) is the bridge between the two views. Choosing the anchor *is* choosing where the complexity lands.

### Why this maps onto the tiers

**Initially, none of this is exposed to clients** — PolicyLift hand-writes the criteria, including the quantifiers, same-row joins, and counts, so every rung is reachable from the start *for PL authors*. The ladder only becomes a *UI* problem once clients author their own, and rungs 2–5 are brutal to expose safely (the same-row trap and the negation/quantifier interaction are where untrained users send the wrong campaign). That difficulty is the concrete reason the client builder is held back until we have signal on which rungs they actually reach for.

One orthogonal note: **operators are gated by field type** (number → `gt`/`lte`/`between`; enum → `eq`/`in`; date → `before`/`within N days`). That constrains the leaves of any predicate but adds no structural depth — it's a separate axis from the ladder.

---

## How Segments work — the conceptual model

This is still "how a Segment works," but at the level of *ideas*, not implementation. The actual build is the engineers' — they'll derive it from these concepts against platform realities these docs don't capture. What's worth pinning down here is the mental model.

### A Segment is re-asked, never stored

There are three things you do with a Segment, and all of them **re-run the question** against current data:

- **Count** — how many match right now. Cached and refreshed in the background (and on demand), so the library shows a number without recomputing on every glance.
- **Sample** — a handful of matching records to eyeball (the trust surface from "count and sample preview" above).
- **Resolve at send** — the full "who's in it right now" answer, computed fresh the moment a Broadcast sends or an Automation evaluates.

The important part is what's *absent*: there's no frozen membership list sitting somewhere. Every use re-asks. This is what makes "a Segment is a question, not a list" literally true — and why a send always reflects current data, never a stale snapshot. (At large scale you'd cache membership for speed, but that's an optimization, not a change to the model.)

### Display is consistent across surfaces

Each anchor type has a standard set of columns it shows — an Account as name / primary contact / status / premium, a Policy as number / type / carrier / dates / account, and so on. The same display is reused everywhere records appear: the sample preview, the segment detail page, and the pre-send recipient verification. One definition per anchor, so the agency sees the same shape of information wherever a Segment surfaces.

### From hand-written to buildable

Initially, PolicyLift authors each Segment's criteria directly — including the AMS-specific bits and the "policy in force" conditions — and Managed Segments are read-only to the client. The conceptual trajectory is to move those criteria from *PL-hand-written* to a *structured, editable* form a client builder can render: the same criteria, but expressed as something a UI can show, validate, and re-count live as you edit. That shift is what unlocks client self-serve authoring; nothing about *what* a Segment means changes.

### The boolean shape — stack gates, push unions to composition

Inside one Segment, conditions combine as **a stack of required gates, each gate allowing alternatives** — "is a customer AND engaged (opened OR clicked) AND in (CA OR NY)." One level of grouping, no deeper nesting. This matches how agencies actually reason about who a campaign is for, and it's the shape Klaviyo's builder settled on too.

What you deliberately *don't* build inside one Segment is a **union of distinct personas** — "(young + urban) OR (older + rural)." That's [composition](#combining-segments--composition): build each persona as its own Segment and union them. Everything stays expressible; persona-unions just belong one level up, where they read clearly, instead of being crammed into a single tangled condition.

(Counting and "related records" questions — "at least 2 auto policies under $1k" — don't add nesting either; they live inside a single condition via the quantifier, keeping the relational axis of the [complexity ladder](#the-complexity-ladder--flat-predicates-to-quantified-relations) separate from the boolean one.)

### Category-first conditions (the eventual builder)

When a client builder does arrive, the cleanest model — borrowed from Klaviyo and Adobe — is to make the **kind of condition the first choice**, because different kinds behave differently. The candidate categories for us:

- **Properties about the anchor** — a field on the account / policy / contact itself.
- **Related insurance records** — "has a policy / claim / quote where …" — the quantified category, and our real differentiator (the complexity ladder surfaced as a first-class choice).
- **Engagement** — opened / clicked / replied to past sends.
- **Consent / eligibility** — can we still market to them (the "exclude unsubscribed" everyone needs).
- **Tags / PL-side annotations** — the inspection-pending kind of marker.
- **In / not in another Segment** — membership, ≈ composition inline.

Picking the category first sets up the right sub-builder — a field + operator, or a quantifier, or a fixed consent toggle — instead of pretending every condition is the same shape. Two PolicyLift wrinkles: the available categories and fields **depend on the anchor** (an Account's "related records" are its policies; a Policy's are its claims), and **engagement / consent live on contacts** — so on an Account- or Policy-anchored Segment, "hasn't unsubscribed" quietly becomes "no contact who's unsubscribed," which needs a sensible default rather than making the user spell out the quantifier.

### What comes later

Conceptually, the later capabilities are:

- **A named field catalog** (`calc.*`) once a computed concept repeats or a second AMS arrives — see [Fields by source](#fields-by-source--ams-pl-and-later-calc).
- **Saved compositions** — promote a recurring combination ("active commercial book minus high-risk minus opted-out") into its own reusable Segment.
- **Versioning** — when a Segment's definition changes under an in-flight campaign, the campaign can pin the old version or auto-follow the new one.
- **Cross-anchor lifting** — use a Policy Segment where an Account one is expected, by asking "which accounts have at least one matching policy?" (the bridge the complexity ladder pointed at).
- **Availability warnings** — flag at authoring time when a field a Segment relies on isn't carried by a particular AMS.

---

## Open questions

### Open — needs a call

1. **Per-anchor display schemas.** Used by Segment detail, audience verification, and recipient preview — worth designing once explicitly so consistency holds.
2. **Default fanout per anchor.** Account → primary contact, Policy → named insured on that policy, Contact → that contact. These are implicit defaults the Broadcast/Automation honors; worth documenting once.
3. **Canonical field naming.** "Canonical field" is a working name. Customer-facing label might be "data field" or "merge field" or something more familiar.
4. **PL-built library scope — per-AMS / per-customer, not global.** Segments are agency-scoped; a global PL-built case (`agency_id = null`) was the original idea, but raw-AMS-first authoring (Alex, §12.3) means Managed Segments are realistically authored **per AMS, possibly per customer**, so the "one global catalog" model is unlikely. Open: ownership / change-control for any shared PL-built Segments, and how much per-AMS authoring can be templated vs. hand-written each time.
5. **Boolean shape — CNF-pinned vs. general tree.** Leaning **CNF (AND-of-OR-groups, one nesting level) inside a Segment, with DNF / union-of-personas pushed to tier-3 composition** — matching Klaviyo and the research doc's nesting cap. Open: confirm tier-1 PL-authored SQL Segments are never forced into this shape (they aren't — raw SQL is unconstrained), and that the tier-2 builder UI never silently distributes a user's DNF intent into a combinatorial CNF blow-up instead of nudging them to composition. Also: do agencies ever genuinely need DNF *within* one Segment in a way composition handles awkwardly (e.g. reporting wants it as one Segment)?
6. **Condition categories — the PL category set.** Adopting Klaviyo's category-first model (category selects the sub-builder + AST node). Open: lock the PL category list (the table above is the candidate); decide whether Tags is its own category or folds into Properties; decide the default contact-quantifier for engagement/consent conditions on non-Contact anchors ("any contact" vs "primary contact"); and where "in / not in another Segment" lives — an inline condition category vs. only the tier-3 composition recipe (avoid two ways to do the same thing).

### Decided for now — revisit later

7. **Per-AMS branching inline vs. early canonical-field abstraction.** Inline SQL works for now. As we add agencies on more AMSes, the copy-paste burden grows. Watch for the threshold where the canonical-field catalog earns its build cost.
8. **Composition stored vs. on the Campaign.** Campaign-side for now, for simplicity. Promote when clients ask for saved compositions explicitly.
9. **Cross-anchor composition.** Forbid initially (clear error); auto-lift later.
10. **Tier-3 operator vocabulary.** Going with "include / intersect / except." If a customer trips on this, revisit (`union` vs `or`, `except` vs `not`, etc.).
11. **Resolution function location.** Where do per-AMS resolutions live in code/config when the catalog ships? TypeScript? Config table? Expression language? See `concepts_working_doc.md` §8.2 open question #1.
