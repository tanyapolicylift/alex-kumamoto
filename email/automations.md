# Automations

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Automation primitive — what it is, the major moving parts, and where the design currently sits. **Short version**: this doc captures the basic concepts we've aligned on so far. Implementation details, deeper Step-type design, branching, approval mode, and the technical pipeline are still to be worked through and will be added incrementally.

**Created:** 2026-05-27

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segments.md`](segments.md) · [`templates.md`](templates.md) · [`broadcasts.md`](broadcasts.md) · [`changelog.md`](changelog.md)

---

An **Automation** is the triggered, ongoing send pipeline. Where a Broadcast is "send this to these people now," an Automation is "whenever X happens, send this sequence to people who match, and keep doing that." Renewal reminders 60/30/7 days before expiration. Welcome kits that fire when a new policy binds. Cancellation save campaigns triggered when a policy moves to pending-cancellation status. The lifecycle stuff agencies care about — the work that adds up over a year — is mostly Automations.

Automations are the heaviest of the four primitives. They have a trigger, a Segment, an enrollment policy that decides who gets enrolled and when, a sequence of Steps with delays between, exit conditions that can pull people out mid-sequence, re-enrollment rules, sender resolution per Step, and per-person state tracked over weeks or months. Most of the engineering reality of the email product lives here.

This doc is intentionally a starter. It captures the concepts we've aligned on without committing to the implementation surface — that work happens once we've onboarded the first agency on the simpler primitives (Segments + Templates + Broadcasts) and have real signal on which Automation surfaces matter most.

---

## What an Automation is

An Automation has six parts:

- **A name and description.** "Personal auto renewal nurture" — clear enough to find in the library, specific enough that nobody confuses it with the commercial auto version.
- **An entry trigger.** The event that causes the Automation to evaluate. Could be an AMS event ("policy status changed to pending-cancellation"), a date-based recurring check ("daily — find policies renewing in 30 days"), a behavioral event ("contact submitted the contact form"), or a manual launch.
- **A Segment.** Defines who's eligible when the trigger fires. The trigger says *when*; the Segment says *who among the matches actually qualifies*.
- **An enrollment policy.** When the trigger fires + Segment evaluates, who *actually gets enrolled*? Everyone matching at launch? Only people newly entering the Segment? Continuously? This is the "lock recipients?" question, parameterized.
- **A sequence of Steps.** What happens to each enrolled person, in order, over time. Send an email. Wait 14 days. Send another email. Wait 7 days. Send a third. Each Step has its own Template (for send-type Steps) and timing relative to the previous Step or entry.
- **Exit conditions and re-enrollment rules.** When does a person leave the Automation before completing the sequence (unsubscribed, policy status changed, manual exit)? Can they re-enter later if they re-qualify? Under what circumstances?

Behind all of this, the Automation maintains **per-person enrollment state** — for every person currently in the Automation, the system tracks which Step they're on, when the next Step fires, whether they've exited, and why. This is what makes Automations stateful and what distinguishes them from Broadcasts.

---

## Entry trigger

The trigger is what wakes the Automation up. Categories we've identified:

- **AMS event** — something changed in the agency management system that the Automation cares about. "Policy status changed to pending-cancellation" is the Marker example. Other examples: new policy bound, claim filed, account moved to lost, premium changed by more than X%.
- **Date-based** — a daily (or other periodic) check that finds people matching some date condition. "Find policies whose renewal_date is exactly 30 days from today." Common for renewal nurtures.
- **Behavioral** — a person did something. Submitted a form, clicked a link, replied to a previous email.
- **Manual launch** — a person on the PL team or agency staff explicitly enrolls someone or a Segment.
- **Segment entry** — generic version of behavioral: anyone newly matching this Segment.

Each trigger has its own configuration (offset days, threshold percentage, which event, etc.). The trigger's job is just to identify *when* the Automation should run — figuring out *who* to enroll is still the Segment + enrollment policy's job.

**Anti-pattern to avoid** (observed in AR per Marker §12.1 of `concepts_working_doc.md`): burying the trigger in an ordered list of Steps. The trigger should be surfaced at the Automation's header level so users can answer "when does this fire?" in three seconds, not five minutes of digging.

---

## Enrollment policy — the "lock recipients?" question

When an Automation runs and the Segment resolves to a set of matching people, **what does the Automation do with that set over time?** Three policies:

- **At-launch only.** Snapshot matching people when the Automation goes live. Enroll all of them. People who newly match later are ignored.
- **Newly-entering only.** Don't enroll anyone matching at launch. From now on, enroll people who *newly enter* the Segment (e.g., a new policy is bound and matches the welcome-kit Segment).
- **Continuously.** Combine the above. At launch, enroll everyone currently matching. Going forward, also enroll people who newly enter.

The reason this lives on the Automation and not on the Segment is that the same Segment can drive different Automations with different enrollment behaviors. "Auto policies renewing in 30 days" might be used by a continuous Automation (welcome each new match into the renewal sequence) AND a one-time Automation (snapshot at launch and run the sequence on those people only).

For PoC, all three policies should be available — choose the right default per use case at Automation creation time.

---

## The Segment reference

An Automation references one Segment as its eligibility filter. Composition of Segments (intersect / union / except, per `segments.md`) is also supported at the Automation level — same recipe shape as for Broadcasts.

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

## Sender resolution and recipient resolution

Same as Broadcast (see [`broadcasts.md`](broadcasts.md)).

- **Sender** resolves via the shared chain (Segment metadata → policy producer → account CSR/AR → house team) with per-Automation and possibly per-Step override.
- **Recipient resolution / fanout** turns Segment matches into specific contacts per the standard defaults (primary contact per account, named insured per policy, contact directly for Contact-anchored).

Per-Step sender overrides are worth pointing out specifically because they matter for Marker's case: a Cancellation Automation might have three Steps with three different sender treatments (initial notice from CSR, second reminder from CSR, final escalation from the agency principal).

---

## Pre-launch recipient verification

Same surface as Broadcast verification, but with a twist: at launch, the verification shows who'd be enrolled *right now* based on the Automation's current Segment + enrollment policy + suppression filters. For at-launch-only enrollment, this is the full enrolled audience for the lifetime of the Automation. For newly-entering-only or continuous policies, this is just the starting state — future enrollees aren't shown here (they don't exist yet).

The verification surface is shared between Broadcasts and Automations because the questions are the same: who's getting what, from whom, with what content? Same screen, similar affordances (filter, sort, bulk exclude with notes, render preview per recipient, sender preview per recipient).

---

## Marker's PoC Automations (concrete scope)

The Marker onboarding (`concepts_working_doc.md` §12.1) committed PolicyLift to three specific Automations in the first weeks:

- **Cancellation Automation** — by Friday 2026-05-29 (2 days from the call). Trigger: policy status changes to `pending cancellation`. Segment: that policy. Sequence: 3 emails over time, CSR as sender, HawkSoft external ID + customer name in every subject line. Exit conditions include "policy status no longer pending cancellation" (because the customer paid the bill or the cancellation reason was resolved).
- **Welcome Kit Automation** — within ~2 weeks. Trigger: new policy bound. Sequence: a few touches over the first 30-60 days introducing the agency, key contacts, and self-service tools.
- **Renewal Automation** — within ~2 weeks. Trigger: date-based, 60 days before policy renewal date (using `effective_date + 300 days` as the canonical "Policy renewing in N days" computation, with `policy.status = 'active'` as the status guard). Sequence: 60/30/7 day touches with renewal reminders.

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

- The six parts (trigger, Segment, enrollment policy, Sequence of Steps, exits, re-enrollment)
- Three enrollment policies (at-launch / newly-entering / continuous)
- Trigger categories (AMS event, date-based, behavioral, manual, segment entry)
- PoC step types (email, wait, exit) with beyond-PoC list flagged
- Recipient + sender resolution shared with Broadcast
- Pre-launch verification surface shared with Broadcast
- The hidden-trigger anti-pattern to avoid
- The three concrete Marker Automations as the operational scope

Still to work through (incrementally, in this doc as decisions land):

- **Schema** — what an `automations` table looks like, what a `steps` table looks like, what an `enrollments` table for per-person state looks like
- **Send pipeline integration** — how Automation Steps create Send records, how Resend events feed back into enrollment state
- **Step-type semantics in detail** — exact behavior of Wait, Exit, future Branch
- **Branching design** — the UX and the data model (post-PoC but worth sketching)
- **Calendar-driven sub-pattern** (AU14 in the working doc) — holiday calendar with on/off toggles per occasion; how this fits the Automation primitive vs being its own thing
- **Approval mode** — per-Step or per-Automation, YOLO vs Outbox, daily digest format
- **Re-enrollment defaults per trigger category** — concrete recommendations once we've seen more triggers in practice
- **Builder UX** — what does it actually look like to compose an Automation, especially the trigger + enrollment policy choice
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
