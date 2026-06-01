# Dynamic content — rendering related data into a message

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Cross-cutting — touches all four primitives. Covers how a message renders data that lives on a *different* entity than the one the Segment returned: the "Hi {name}, these policies are renewing: …" problem. Non-technical readers can stop at "Implementation details."

**Created:** 2026-06-01

**Related:** [`segments.md`](segments.md) · [`templates.md`](templates.md) · [`broadcasts.md`](broadcasts.md) · [`automations.md`](automations.md) · [`concepts_working_doc.md`](concepts_working_doc.md) · [`changelog.md`](changelog.md)

---

Most emails want to say something specific about the recipient. "Hi Maria" is easy — the name lives right on the account. But "Hi Maria, we noticed **these three policies** are renewing soon: …" is a different kind of ask. The list of policies isn't a single field on the account; it's a *filtered set of related records*. This doc is about how we get that set into the message correctly.

This is a cross-cutting concern by nature. It starts in the Segment (what matched), passes through the Broadcast or Automation (who receives it, and how records roll up to them), and lands in the Template (where the list is rendered). None of the four primitives owns it alone, so it gets its own home here.

---

## The problem: existence vs. enumeration

Take the concrete case. We want to email every customer who has an auto policy renewing in the next 30 days. The natural Segment is Account-anchored:

> *accounts where there exists at least one policy with `type = auto AND renewing_in_days < 30 AND status = active`*

That's a `count(...) > 0` / `any` quantifier (see the complexity ladder in [`segments.md`](segments.md)). Look closely at what that query actually computes: a **yes/no test per account** — "does at least one matching policy exist?" It returns a set of *accounts*. It does **not** return *which policies* matched.

But the email body needs exactly that — the actual matching rows, to list them. Same condition underneath (`type = auto AND renewing_in_days < 30 AND status = active`), but the Segment used it as a *boolean filter on accounts*, while the Template needs it as *a list of policies scoped to this one account*.

That's the gap in a sentence:

> **The anchor decides what the Segment returns (accounts). The content needs a filtered child collection (their renewing policies). Different shape, related data.**

The Segment proved **existence**. The message needs **enumeration**.

---

## The principle that must hold

Before any design choice, one rule governs everything:

> **The list shown in the email must be exactly the set that qualified the recipient.**

If an account has three auto policies but only one is in the 30-day window, the email lists **one**. The instant the Template re-filters the data independently of the Segment, the two definitions can drift, and you send "your policies are renewing: [all three]" — wrong, and precisely the kind of error that destroys an agency's trust in the tool.

So the displayed collection must be **derived from the same condition** that established membership — never authored separately and hoped to agree. This single principle is what rules one of the three approaches below in or out.

---

## The mental model: a recipient context

The clean way to think about rendering: a message is never rendered against "a row." It's rendered against a **recipient context** —

> one recipient + the set of records that resolved to them + that set's related data.

`{{ account.first_name }}` reads the recipient. `{% for p in renewing_policies %}` walks the resolved set. Aggregates (`how many`, `soonest date`, `total premium`) summarize it. Whether we got to that set by anchoring on the account and walking *down* to its policies, or by anchoring on policies and grouping *up* to the account, the Template sees the same thing: a recipient and a collection. Build that one abstraction and the rendering layer doesn't care which path produced it.

---

## Three ways to get the related set

### Path A — Account-anchored, expose the matched child set

Keep the Account anchor. Make audience resolution return, per account, not just the account ID but the **matching policies** — the specific rows that satisfied the child predicate. The Template loops over that collection.

- **Pro:** "one email per account" falls out for free — the account is the unit of sending. The matched set is non-empty *by construction* (the same grouping that proves `> 0` produces the rows), so the email can never say "renewing: (nothing)". Reporting is account-level, which is usually what agencies want.
- **Con:** the Segment engine has to surface the matched child rows, not merely prove they exist. That's a real added capability — the existence test has to become an enumeration.

### Path B — Policy-anchored, roll up to the account

Flip the anchor to **Policy**: the Segment is "auto policies renewing < 30 days," and it returns exactly the rows we want to list. Then recipient resolution **groups by account** so an account with three matching policies receives *one* email listing all three (not three emails).

- **Pro:** the Segment's output *is* the list — correctness is automatic, with no separate "matched set" concept to keep in sync. The most honest model for "tell the customer about these N things."
- **Con:** requires **roll-up fanout** — collapsing N anchor rows into one message while exposing the collapsed rows to the Template. Without that capability you'd send one email per policy. Reporting is policy-level (rolled up).

Paths A and B are the same capability seen from two ends — *down-walk + matched-set extraction* vs. *up-group + roll-up* — and they converge on the recipient-context abstraction above. Anchor choice just moves where the work lands (the same "anchor moves the complexity" insight from the complexity ladder).

### Path C — render-time lookup from inside the Template

The Template itself fetches the related rows at render time. Given the account, a content block queries "auto policies renewing in 30 days for this account" right where the list is rendered. This is the **Salesforce Marketing Cloud `LookupRows` / AMPscript** model — the Template carries a small query, and the engine runs it per recipient during render.

> **Possible Agency Revolution parallel (unverified).** Martin's recollection is that AR may expose something in this family — a render-time data pull into the message. Flagged as a **research item to confirm**, not an established fact. If AR does it this way, it's worth understanding how they keep the render-time filter from drifting out of sync with the campaign's audience definition (the exact risk below). Verify against an AR walkthrough before treating this as precedent.

- **Pro:** maximally flexible — a Template can pull in *any* related data, even data the Segment never looked at (e.g. list the customer's policies *and* their last three claims, where claims were never part of the match). It decouples "what content can show" from "what the Segment filtered on."
- **Con:** it puts a filter **inside the Template, separate from the Segment** — which directly violates the principle above. The render-time query and the Segment predicate are now two definitions of "renewing auto policy" that must be kept identical by hand. They will drift. It also needs a query capability in the Template authoring surface (heavier, and dangerous in non-technical hands), and makes every render do extra database work.

**Our posture:** **A or B for the qualifying-set case** (the list must equal what matched), because they derive the list from the membership condition and cannot drift. **Path C stays on the table for the genuinely different job it does well** — surfacing *supplementary* related data that was never a matching criterion (claims history, last payment, agent contact card) — where there's no qualifying-set to stay in sync with, so the drift objection doesn't apply. Reach for C deliberately for "extra context," not for "the list of things that triggered this email."

---

## What the Template needs from the collection

Once a collection is in the recipient context (by whichever path), the Template surface needs three things over it. This extends the "Templates declare their expected anchor" decision in [`templates.md`](templates.md):

- **Declared collection slots.** A Template declares not just its anchor but the collections it expects — e.g. *this renewal template expects a `renewing_policies` collection of Policy-shaped rows*. The campaign wiring connects the Segment's matched set (or the Path-C query result) to that named slot, and validates the shapes line up. This is the contract that keeps the data side and the content side honest.
- **Aggregates over the collection.** "You have **{count}** policies renewing, the soonest on **{min renewal_date}**, totaling **{sum premium}** in premium." The Template needs to summarize the set, not only iterate it.
- **Conditionals / pluralization.** "a policy" vs. "some policies"; suppress the whole block if a (supplementary, Path-C) collection is empty. For the qualifying-set paths the collection is guaranteed non-empty, but for supplementary data it may not be — so the Template needs to handle the empty case gracefully.

---

## Where it fits with the other concepts

- **Segment** owns *what matched*. For Paths A/B it should also be able to surface *the rows that explain the match* (the matched child set), so any campaign reusing the Segment gets the list for free. (See the open question on whether this lives on the Segment or the campaign wiring.)
- **Template** owns *how the set is rendered* — the loop, the aggregates, the conditionals — and declares the collection slots it expects.
- **Broadcast / Automation** own *recipient resolution and fanout* — turning anchor rows into actual recipients, and rolling multiple rows up to one recipient (Path B) or carrying the matched set through to render (Path A). This is the "Recipient + Sender resolution" surface in those docs.

---

## PoC recommendation

The Marker renewal Automation is a near-term commitment, so this is not hypothetical. For PoC:

**Use Path A with a `json_agg` matched set.** It's a single query change, keeps "one email per account" trivial, guarantees a non-empty list by construction, and needs no new roll-up-fanout machinery. Path B is arguably the cleaner *long-term* model (the Segment output literally being the display list), and becomes the right answer the moment roll-up fanout exists as a first-class capability. Path C is reserved for supplementary context, not for the qualifying list — and pending the AR verification above.

---

## Implementation details

Engineering reference. Non-technical readers can stop here.

### Path A at PoC — `json_agg` the matched set in the resolve query

The Segment's resolve-for-send query (see [`segments.md`](segments.md) Implementation details) is extended to emit a nested collection alongside each anchor ID:

```sql
SELECT a.id,
       json_agg(
         json_build_object(
           'type',         pt.type,
           'number',       p.policy_number,
           'carrier',      p.carrier,
           'renewal_date', p.renewal_date,
           'premium',      p.premium
         ) ORDER BY p.renewal_date
       ) AS renewing_policies
FROM accounts a
JOIN policies p       ON p.account_id = a.id
JOIN policy_types pt  ON p.policy_type_id = pt.id
WHERE a.agency_id = :agency_id
  AND pt.type = 'personal_auto'
  AND p.status = 'active'                       -- status guard, same as the Segment
  AND CASE a.ams_type                           -- renewing_in_days < 30, per-AMS
    WHEN 'hawksoft' THEN p.effective_date + INTERVAL '300 days' < now() + INTERVAL '30 days'
    WHEN 'ezlynx'   THEN p.renewal_date         < now() + INTERVAL '30 days'
    -- ... per AMS
  END
GROUP BY a.id;        -- GROUP BY enforces "> 0": only accounts with ≥1 matching policy appear
```

The `WHERE` clause **is** the Segment predicate — that's what guarantees the listed set equals the qualifying set; there is one definition, used once. The `sends` pipeline carries the `renewing_policies` JSON through to render; the Template loops it. Because membership and enumeration come from the same query, drift is structurally impossible.

### Path B at PoC — Policy anchor + group-by-recipient at fanout

The Segment returns policy IDs (Policy anchor). Recipient resolution maps each policy → its account → the account's resolved contact (fanout default: primary contact — see [`segments.md`](segments.md) open Q5 and [`broadcasts.md`](broadcasts.md)), then groups the resolved rows by recipient. Each group becomes one `send` whose render context carries the grouped policy rows. Requires the fanout layer to support N-anchor-rows → 1-message roll-up, which Path A sidesteps.

### Path C — render-time lookup

A content block in the Template carries a parameterized query (or a saved "related data source") executed per recipient at render time, scoped by the recipient's anchor ID. Powerful for supplementary data; explicitly **not** used for the qualifying list because the filter would live separately from the Segment predicate. If adopted later, the query should reference the **same canonical-field definitions** as Segments so a shared change propagates — but that still doesn't bind it to a specific campaign's audience definition, which is the residual drift risk.

### The recipient-context object

Regardless of path, the render layer receives a single normalized structure:

```
recipient_context = {
  recipient:   { contact fields — name, email, ... },
  anchor:      { the anchor record — account or policy fields },
  collections: { renewing_policies: [ {...}, {...} ], ... },   // matched set(s)
  agency:      { brand tokens — logo_url, name, ... }          // from agency settings
}
```

Templates resolve `{{ recipient.* }}`, `{{ anchor.* }}`, `{% for x in collections.* %}`, and `{{ agency.* }}` against this. Building this one shape is what lets Paths A and B share the entire rendering layer.

---

## Open questions

1. **Matched-set ownership.** Does the *Segment* own the "child collection that explains the match" (so every campaign reusing it gets the list for free), or does the *campaign / template wiring* specify it per use? Leaning Segment-owns-it, since the predicate already lives there — but a Segment can be reused in contexts that want a different display collection, which argues for the wiring.
2. **A vs. B as the PoC default.** Path A (json_agg) recommended for PoC simplicity; Path B is cleaner long-term. Pick one to standardize on so Templates aren't written against two different context shapes.
3. **Confirm the AR / Path C parallel.** Verify whether Agency Revolution actually exposes render-time data lookup, and if so how they handle (or fail to handle) drift between the render query and the audience definition. Research item.
4. **Collection slot contract.** Exact shape of how a Template declares expected collections and how the campaign validates the Segment's matched-set shape against it. Ties into the merge-token / canonical-field catalog work.
5. **Aggregates vocabulary.** Which aggregate functions the Template language exposes over a collection (count / min / max / sum / first / sort) and whether they're canonical-field-aware.
6. **Supplementary-data empty-state UX.** For Path-C supplementary collections that can be empty, what's the default authoring affordance for "hide this block if empty" so authors don't ship emails with dangling headers.
7. **Multiple matched collections in one message.** A message that lists renewing policies *and* open claims — two matched sets, possibly two anchors. Does the recipient context generalize cleanly, or does this need explicit multi-collection wiring?
