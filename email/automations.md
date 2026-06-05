# Automations

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Automation primitive — what it is, the major moving parts, and where the design currently sits. **Short version**: this doc captures the basic concepts we've aligned on so far. Implementation details, deeper Step-type design, branching, approval mode, and the technical pipeline are still to be worked through and will be added incrementally.

**Created:** 2026-05-27

**Updated:** 2026-06-03 — trigger-driven enrollment model (collapsed the three enrollment policies; added date-property + added-to-segment triggers and the two filter layers). See Entry trigger + Enrollment.

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segments.md`](segments.md) · [`templates.md`](templates.md) · [`broadcasts.md`](broadcasts.md) · [`changelog.md`](changelog.md)

---

An **Automation** is the triggered, ongoing send pipeline. Where a Broadcast is "send this to these people now," an Automation is "whenever X happens, send this sequence to people who match, and keep doing that." Renewal reminders 60/30/7 days before expiration. Welcome kits that fire when a new policy binds. Cancellation save campaigns triggered when a policy moves to pending-cancellation status. The lifecycle stuff agencies care about — the work that adds up over a year — is mostly Automations.

Automations are the heaviest of the four primitives. They have a trigger, trigger + profile filters that decide who's eligible (enrollment is newly-entering by construction — see below), a sequence of Steps with delays between, exit conditions that can pull people out mid-sequence, re-entry rules, sender resolution per Step, and per-person state tracked over weeks or months. Most of the engineering reality of the email product lives here.

This doc is intentionally a starter. It captures the concepts we've aligned on without committing to the implementation surface — that work happens once we've onboarded the first agency on the simpler primitives (Segments + Templates + Broadcasts) and have real signal on which Automation surfaces matter most.

---

## Broadcast vs Automation — scheduled vs triggered

The clean line between the two send primitives (confirmed against Klaviyo's Campaign/Flow split, 2026-06-03):

- **Broadcast** (= Klaviyo **Campaign**) — you **pick an audience** (a Segment) and it sends on a **schedule** (now or a set time). Audience resolved at send.
- **Automation** (= Klaviyo **Flow**) — people enter via a **trigger**, continuously, each on their own clock.

The dividing line is **scheduled vs triggered** — **not** single-message-vs-series and not one-channel-vs-many. A *scheduled* series across channels is still a Broadcast (Klaviyo's "omnichannel campaign"); a *triggered* single email is still an Automation.

Every documented client ask (`concepts_working_doc.md` §12.2 + `client_feedback.md`) lands in one of three buckets:

| Pattern | Primitive | Examples |
|---|---|---|
| **Date-anchored** | Automation, **date-property trigger** | renewal reminders/notices, welcome kit (sold-date), inspection-by-date |
| **State-transition** | Automation, **added-to-segment trigger** | cancellation/non-payment, NPS promoters, tag-based drips, cross-sell nurture |
| **One-time to a current set** | **Broadcast** to a Segment | state-min-auto / $100k-liability pushes, one-off cross-sell blast, the existing-book backlog |

So a windowed "renewing in N days" Segment isn't the renewal mechanism — it's only useful as a **Broadcast** audience. The recurring renewal program is a date-triggered Automation (below).

---

## What an Automation is

An Automation has these parts:

- **A name and description.** "Personal auto renewal nurture" — clear enough to find in the library, specific enough that nobody confuses it with the commercial auto version.
- **An entry trigger.** The *transition* that enrolls a person: **added to a Segment** (state-change), a **metric/event** ("policy status changed to pending-cancellation," "new policy bound"), a **date property** ("30 days before `renewal_date`," recurring yearly, reschedule-on-change), or a manual launch. Because a trigger is a *transition*, enrollment is **newly-entering by construction** (see Enrollment, below).
- **Audience filters.** The trigger says *when*; filters narrow *who* — **trigger filters** (on the event's data) + **profile filters** (on record state: active, auto, region). The audience is defined here *with* the trigger, not assembled in a separate place. A saved **Segment** can *be* the trigger ("added to segment") or serve as a filter.
- **A sequence of Steps.** What happens to each enrolled person, in order, over time. Send an email. Wait 14 days. Send another email. Wait 7 days. Send a third. Each Step has its own Template (for send-type Steps) and timing relative to the previous Step or entry.
- **Exit conditions and re-enrollment rules.** When does a person leave the Automation before completing the sequence (unsubscribed, policy status changed, manual exit)? Can they re-enter later if they re-qualify? Under what circumstances?

Behind all of this, the Automation maintains **per-person enrollment state** — for every person currently in the Automation, the system tracks which Step they're on, when the next Step fires, whether they've exited, and why. This is what makes Automations stateful and what distinguishes them from Broadcasts.

---

## Entry trigger

The trigger is what wakes the Automation up. Categories we've identified:

- **AMS event** — something changed in the agency management system that the Automation cares about. "Policy status changed to pending-cancellation" is the Marker example. Other examples: new policy bound, claim filed, account moved to lost, premium changed by more than X%.
- **Date property** — fire relative to a date field on a record (`renewal_date`, `sold_date`, birthday): X days before/after, **recurring** (e.g. yearly) and **rescheduling when the date changes**, run once per record. This is the **primary renewal mechanism** — *not* a "renewing in N days" Segment (a relative-time Segment churns daily — the membership-drift / batch-exit problem, `research_segment_builder_ux.md` §8.4; the date trigger computes timing per-record instead). Validated against Klaviyo/Customer.io and the Katz/Eclipse requirement ("use expiry dates, not status, for renewals").
- **Behavioral** — a person did something. Submitted a form, clicked a link, replied to a previous email.
- **Manual launch** — a person on the PL team or agency staff explicitly enrolls someone or a Segment.
- **Added to a Segment** — a person *enters* a Segment (state transition). This is how a Segment feeds an Automation — the Segment *is* the trigger (e.g. "added to Pending-cancellation / Non-payment," "added to NPS Promoters"). Fires on transition-in; pair with exit-on-no-longer-match for transition-out.

Each trigger has its own configuration (offset days, recurrence, threshold, which event). Two filter layers narrow *who*: **trigger filters** (conditions on the trigger event's own data) and **profile filters** (conditions on the record's state — active, auto, region), checked at entry and re-checked before each Step. The **trigger is fixed once saved**; filters stay editable.

Because every trigger is a *transition* (added-to-segment, an event, a date arriving), enrollment is **newly-entering by construction** — there's no "enroll everyone currently matching" mode. The existing backlog is a separate one-time operation (see Enrollment, next).

**Anti-pattern to avoid** (observed in AR per Marker §12.1 of `concepts_working_doc.md`): burying the trigger in an ordered list of Steps. The trigger should be surfaced at the Automation's header level so users can answer "when does this fire?" in three seconds, not five minutes of digging.

---

## Enrollment — trigger-driven (newly-entering); the backlog is a one-time op

**Revised 2026-06-03.** We previously modeled three enrollment policies (at-launch / newly-entering / continuous). Verifying Klaviyo / Customer.io / Braze (see `changelog.md`) collapsed this, and it's cleaner.

Entry is **trigger-driven**, and every trigger is a **transition, not a state** (added-to-segment, an event, a date arriving). So enrollment is **newly-entering by construction** — "newly-entering" and "continuous" are the same behavior, and there's no standing set to "lock."

What's left over is only the **existing book / backlog** ("reach everyone who *already* matches"). That's **not an ongoing automation mode** — it's a **one-time operation**: either a deliberate **"add current matches" backfill** on the Automation (Klaviyo's verified "add past profiles" — existing matches enter at the trigger, anyone who already completed isn't re-sent), or — more often — a **Broadcast** to the Segment. A discrete action, not a running setting.

Free win: a trigger-driven flow **cannot** blast the backlog by accident — Reach's "all in *or* entering" failure mode (`concepts_working_doc.md` §12.2 Welcome Kit) is structurally impossible.

(The old "this lives on the Automation, not the Segment" point still holds — the trigger + filters live on the Automation; a Segment plugs in as the trigger or a filter.) The remaining repeat knob is **re-entry** (below).

---

## The Segment reference

An Automation's audience = its **trigger + filters** (above). A saved **Segment** plugs into either slot — as the **trigger** ("added to segment") or as a **profile filter** — but the audience is assembled in the Automation, not picked from a separate place. Composition of Segments (intersect / union / except, per `segments.md`) is supported where a Segment is referenced — same recipe shape as Broadcasts.

The Automation does *not* own the Segment definition — the Segment lives in the Segment library independently. Edits to a Segment affect any in-flight Automations using it (with appropriate notifications when changes would materially shift the matching audience).

When a person's state changes such that they no longer match the Segment (e.g., they were enrolled because their policy was below state minimum, but now they've upgraded), the Automation handles this via **exit conditions** — not by automatically removing them. Whether to exit on Segment-no-longer-matches is configurable per Automation.

---

## Sequence of Steps

Each enrolled person walks through the Automation's Steps in order. The simplest Sequence is one Step. The most complex include branching, conditional waits, and parallel paths — but we don't need to ship that complexity at PoC.

**PoC step types** (working list — likely shrinks before shipping):

- **Send email** — references a Template (per `templates.md`)
- **Wait** — explicit delay (e.g., "wait 14 days from the previous Step")
- **Exit** — terminal step that marks the person as completed

Each Step has timing — usually expressed as a delay relative to the previous Step or to the entry event. The first Step typically fires immediately on enrollment.

**Beyond-PoC step types** worth flagging now even though we're not designing them:

- Send SMS, postcard, handwritten card (channel-dependent — see `templates.md`)
- Branch — if/else based on engagement or data
- Tag-add / tag-remove (side effects on PL-side data)
- Internal notification (notify producer/CSR, not the customer)
- Action item (create a task)
- Webhook out

**Anti-pattern**: AR-style per-Step triggers that confuse delays with triggers. A Step in our model has a delay, not a trigger. The Automation has ONE entry trigger; everything after is just delay-based progression.

---

## Exit conditions and re-enrollment

While a person is enrolled, things change. Their policy renews. They unsubscribe. They're now eligible for a different campaign. Exit conditions are the rules that pull someone out of an Automation before they complete the Sequence.

Categories of exit conditions:

- **Unsubscribe** — person hit the unsubscribe link on a previous Step (or any previous email)
- **Status change** — the policy or account they were enrolled around changed status (e.g., enrolled for cancellation save, but they paid the bill and the policy is active again)
- **Segment-no-longer-matches** — the underlying Segment query no longer matches them
- **Manual exit** — someone on the agency side pulled them out
- **Reply received** — stop-on-reply, common for human-feeling sequences (Lev convention)

Re-enrollment rules say what happens after an exit. Can the same person enter the same Automation again? When? Some defaults that probably make sense:

- **Never re-enroll** — once enrolled, never again (for irreversible lifecycle events like Welcome Kits — you only get welcomed once)
- **Re-enroll after N days** — cooling-off period
- **Re-enroll on next trigger event** — for trigger-driven Automations (a cancellation Automation can re-fire if the policy goes pending-cancel again later)
- **Always allow re-enrollment** — for recurring patterns

These rules are configurable per Automation. The default should depend on the trigger category — "once per lifecycle event" feels right for AMS-event triggers; "always allow" feels right for date-based recurring triggers (because they fire repeatedly by nature).

---

## Enrollment state & drift over time

A Broadcast fires once, so the world can't change underneath it — it snapshots its audience at send and that's that. An Automation persists: it can enroll someone today and email them across the next month, and the data that justified enrolling them *will* change in between. This section is about what happens then.

The first thing to untangle: "the Segment changes over time" is really **three independent clocks**, and only the last two are about drift:

1. **Who enters, and when** — **trigger-driven enrollment** (newly-entering; see Enrollment above). Already decided.
2. **Do they still qualify** — *membership drift*. They matched at enrollment; do they still match later?
3. **What each send shows** — *data drift*. A Sequence sends several emails; the specific records pulled into the content (e.g. "your 2 policies renewing soon") can change between enrollment and a later Step.

The framing that keeps this sane: **the Segment stays a stateless question (it's never "locked" — see [`segments.md`](segments.md)); the *enrollment* is the stateful thing.** When an Automation enrolls a subject it creates a per-subject record (where they are in the Sequence, their status). The real design choice is *how much that enrollment record freezes vs. re-derives over its life.* Two kinds of drift, two answers:

- **Membership drift → exit conditions.** Re-evaluate matching; if the subject no longer matches, exit (the *Segment-no-longer-matches* exit above). For lifecycle Automations (renewal, cancellation) the sensible default is **exit-on-no-longer-match** — the moment a renewal isn't happening or a policy is canceled, stop emailing about it.
- **Data drift → re-resolve at each send, never freeze at enrollment.** Recompute the content's records right before each email renders, against current truth. Stale insurance data ("your 2 policies are renewing" when one was canceled last week) is a worse failure than the content shifting. Each Send record immutably captures *what it actually rendered* (the audit trail); the *next* Send recomputes.

### The partial-bundle subtlety is really an anchor decision

The messy case — *"we pulled an account + 2 matching policies into the email, then one policy stops matching"* — is messy **specifically because the account was anchored and 2 policies were bundled into one enrollment and one email.** Whether you hit this at all is the same Path A vs. Path B choice from [`dynamic-content.md`](dynamic-content.md), now seen along the time axis:

- **Per-entity enrollment (Path B — how AR works).** Enroll *per policy*: each renewing policy is its own enrollment. One policy stops matching → *that* enrollment exits; the others are untouched. No partial bundle, no surprises. Clean drift semantics. Cost: an account with 2 renewing policies gets 2 emails.
- **Account-anchored bundle (Path A — "your 2 policies").** The account stays enrolled while *any* policy still matches, so the bundle can mutate underneath the Sequence. With re-resolve-at-send, the next email shows whatever currently matches — which means:
  - it can shrink (2 → 1): the surrounding prose must tolerate a changing count (the pluralization / conditional requirement from [`dynamic-content.md`](dynamic-content.md) — "a policy" vs "your policies");
  - it can go empty (2 → 0): that's itself an **exit signal** — nothing to say, so exit;
  - it can grow (a *new* third policy starts matching mid-Sequence): re-resolve would silently fold it into the next email, which is usually *not* what you want for an in-flight narrative (see open questions).

So the choice of how to anchor the Automation *is* the choice of how much drift complexity you take on — the same "anchor moves the complexity" lever, in the time dimension. Bundling buys the nice consolidated email and pays for it with count-tolerant content and empty-set-as-exit.

### PoC stance

Marker's three Automations (Cancellation, Welcome Kit, Renewal) are each *about one policy or event*, so:

- **Per-entity (per-policy) enrollment is the default** — clean drift, matches AR, and none of them needs a bundled "list" email. (This is the per-`(subject, automation, trigger_event)` granularity flagged in open question #4.)
- **Re-resolve at each send** is the universal render rule — content always reflects current truth.
- **Exit-on-no-longer-match** is the default exit for lifecycle Automations.

The account-anchored *bundled* "all your renewing policies in one email" Automation (re-resolve + count-tolerant prose + empty-set-exit + a rule for new mid-flight matches) is reserved for when an agency explicitly asks for it — **post-PoC**, since it needs that extra handling.

---

## Sender resolution and recipient resolution

Same as Broadcast (see [`broadcasts.md`](broadcasts.md)).

- **Sender** resolves via the shared chain (Segment metadata → policy producer → account CSR/AR → house team) with per-Automation and possibly per-Step override.
- **Recipient resolution / fanout** turns Segment matches into specific contacts per the standard defaults (primary contact per account, named insured per policy, contact directly for Contact-anchored).

Per-Step sender overrides are worth pointing out specifically because they matter for Marker's case: a Cancellation Automation might have three Steps with three different sender treatments (initial notice from CSR, second reminder from CSR, final escalation from the agency principal).

---

## Pre-launch recipient verification

Same surface as Broadcast verification, but with a twist: at launch the verification *previews* who currently qualifies based on the Automation's trigger + filters + suppression. Because enrollment is trigger-driven (newly-entering), this is just a preview of the current matches — future enrollees aren't shown (they don't exist yet). A one-time **backfill** (or a Broadcast for the backlog) is where you'd verify-and-send to the existing set.

The verification surface is shared between Broadcasts and Automations because the questions are the same: who's getting what, from whom, with what content? Same screen, similar affordances (filter, sort, bulk exclude with notes, render preview per recipient, sender preview per recipient).

---

## Marker's PoC Automations (concrete scope)

The Marker onboarding (`concepts_working_doc.md` §12.1) committed PolicyLift to three specific Automations in the first weeks:

- **Cancellation Automation** — by Friday 2026-05-29 (2 days from the call). **Trigger:** *added to* the "Pending cancellation — non-payment" Segment (HawkSoft `status = Cancelled (Pending)` + `substatus = Non-Payment`). Sequence: 3 emails over time, CSR as sender, HawkSoft external ID + customer name in every subject line. **Exit:** policy no longer pending-cancellation (customer paid / reason resolved).
- **Welcome Kit Automation** — within ~2 weeks. **Trigger:** date property on `sold_date` (or the new-policy-bound event) — date-anchored, so it's newly-entering and never touches the existing book. Sequence: a few touches over the first 30-60 days. **Re-entry:** never (welcomed once).
- **Renewal Automation** — within ~2 weeks. **Trigger:** **date property** on `policy.renewal_date` (fall back to `effective_date + agency term` where HawkSoft lacks a reliable renewal date), firing at **60/30/7 days before**, recurring yearly and rescheduling if the date changes; **profile filter** `status = 'active'` (canceled policies carry stale dates). Sequence: the 60/30/7 touches. *(This replaces the earlier "Policy renewing in N days" Segment — the window is the trigger offset, not segment membership.)*

These three Automations are the operational scope for the first onboarding. Each one exercises a different trigger type (event-based, event-based, date-based) and helps validate the Automation infrastructure's reach.

---

## Where Automations fit alongside other concepts

An Automation is one of [the four primitives](concepts_working_doc.md). The non-overlaps:

- **Automations don't define audiences from scratch.** They reference Segments, which already do that work.
- **Automations don't write content.** They reference Templates per Step.
- **Automations don't replace Broadcasts.** A one-off send is a Broadcast, not a single-Step Automation. The mental models are different even if there's shared infrastructure underneath.
- **Automations don't carry sender identity.** Sender is resolved at send time via the shared chain.

Where they touch other concepts:

- **Segments** — Automations reference Segments for eligibility filtering at every trigger evaluation
- **Templates** — each Step that sends references a Template
- **Sender resolver** — Automations use the shared sender chain (with per-Automation and per-Step override)
- **Send records** — every Step that dispatches a Message creates a Send record (shared with Broadcast send records)
- **Engagement events** — opens, clicks, bounces, replies all attach to Send records; can drive exit conditions ("exit on reply") and (post-PoC) branching
- **Consent layer / suppression** — applied at each Step's dispatch, not just at enrollment. A person enrolled today who unsubscribes next week stops receiving Steps next week.

---

## What's settled vs what's still TBD

We've aligned on:

- The parts (trigger + filters, Sequence of Steps, exits, re-entry; enrollment is trigger-driven)
- **Enrollment is trigger-driven (newly-entering by construction)**; the backlog is a one-time backfill or Broadcast, not an automation mode (revised 2026-06-03). Repeat knob = re-entry.
- Trigger types (added-to-segment, metric/event, **date property** [offset + recurrence + reschedule-on-change], behavioral, manual) + two filter layers (trigger filters + profile filters); trigger fixed after save
- **Broadcast vs Automation = scheduled vs triggered** (= Klaviyo Campaign vs Flow); three-bucket use-case taxonomy (date-anchored / state-transition → Automation; one-time-to-current-set → Broadcast)
- PoC step types (email, wait, exit) with beyond-PoC list flagged
- Recipient + sender resolution shared with Broadcast
- Pre-launch verification surface shared with Broadcast
- The hidden-trigger anti-pattern to avoid
- The three concrete Marker Automations as the operational scope
- **Drift handling**: Segment stays stateless, the enrollment is the stateful object; membership drift → exit conditions, data drift → re-resolve at each send (never freeze merge data at enrollment)
- **PoC drift defaults**: per-entity (per-policy) enrollment, re-resolve-at-send, exit-on-no-longer-match for lifecycle Automations; bundled account-anchored "list" Automations deferred post-PoC

Still to work through (incrementally, in this doc as decisions land):

- **Schema** — what an `automations` table looks like, what a `steps` table looks like, what an `enrollments` table for per-person state looks like
- **Send pipeline integration** — how Automation Steps create Send records, how Resend events feed back into enrollment state
- **Step-type semantics in detail** — exact behavior of Wait, Exit, future Branch
- **Branching design** — the UX and the data model (post-PoC but worth sketching)
- **Calendar-driven sub-pattern** (AU14 in the working doc) — holiday calendar with on/off toggles per occasion; how this fits the Automation primitive vs being its own thing
- **Approval mode** — per-Step or per-Automation, YOLO vs Outbox, daily digest format
- **Re-enrollment defaults per trigger category** — concrete recommendations once we've seen more triggers in practice
- **Builder UX** — what does it actually look like to compose an Automation, especially the trigger + filters choice
- **Per-Automation reporting** — engagement rollups, drop-off-by-step, attribution to outcomes (policy renewed, cancellation prevented, etc.)
- **In-flight editing** — what happens when an Automation is edited while people are enrolled in it (does a Step change affect already-enrolled people who haven't hit that Step yet?)

---

## Open questions

1. **PoC step types — is "email + wait + exit" really enough?** Yes for Marker's three Automations. But the second agency may want SMS, or branching. Decide as the second-agency signal lands.
2. **Where does Step ordering live — explicit `position` integer, or linked-list / DAG?** Linear ordering is enough for PoC; DAG only matters when branching ships. Defer.
3. **Should an Automation be able to have multiple entry triggers?** Most tools (AR included) allow a single Automation to be triggered by multiple things ("renewal in 30 days" OR "renewal in 60 days" both enroll into the same renewal sequence). Probably yes long-term, but PoC can start with single-trigger.
4. **What's the granularity of enrollment-state tracking?** Per (person, automation) pair? Or per (person, automation, trigger_event)? Affects re-enrollment behavior. Defer.
5. **Calendar-driven sub-pattern fit** — is the holiday calendar a special kind of Automation (one Automation per occasion, fired on a date), or its own concept that doesn't quite fit the Automation primitive? Defer until we design the holiday calendar UX.
6. **Cancellation Automation deadline** — Marker's Friday 2026-05-29 commitment. Practical question: how much Automation infrastructure does PL need to ship by then vs. wire up manually? Probably manual wiring for the first Automation since the full builder won't exist; documented in the concierge workflow.
7. **Stop-on-reply** — does an Automation Step support "if the recipient replies, exit them from the Automation"? Lev convention; useful. Probably yes for PoC since Resend tracks replies via webhooks.
8. **Per-Step override of recipient resolution.** Could a multi-Step Automation send Step 1 to the primary contact, Step 2 to the spouse? Probably overkill for PoC; revisit if a real use case lands.
9. **Matched set grows mid-Sequence (bundle case).** For an account-anchored bundled Automation that re-resolves at send, a *new* matching record (e.g. a third policy enters the renewal window after enrollment) would silently join the next email. Probably we want to *not* retroactively add it to an in-flight narrative — render only the records present at enrollment, or only-shrink-never-grow — but that needs deciding. (Doesn't arise with per-entity enrollment, the PoC default, where the new match just starts its own enrollment per the enrollment policy.)
10. **Re-evaluation cadence.** How often is membership / matched-data re-evaluated for enrolled subjects — nightly (aligned with the Segment count refresh in `segments.md`), or lazily at each Step's send time, or both? Lazy-at-send is simplest and guarantees the email reflects truth at the moment it goes out; a nightly pass is needed if exits should fire *between* sends (e.g. exit the day a policy cancels, not at the next scheduled email). Likely: re-resolve lazily at send for content + a nightly membership pass for timely exits. Confirm.
