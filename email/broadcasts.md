# Broadcasts

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Broadcast primitive — what it is, how it assembles a Segment + Template + sender into a one-off send, how recipient verification works, and how it's implemented under the hood. Non-technical readers can stop at "Implementation details"; everything before that is plain-language.

**Created:** 2026-05-27

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segments.md`](segments.md) · [`templates.md`](templates.md) · [`changelog.md`](changelog.md)

---

A **Broadcast** is the simplest way to actually send something. The user picks who's going to receive it (a Segment), what they'll receive (a Template), who it's coming from (a sender), reviews the recipient list, and clicks send. It's a one-off event — fires once, doesn't repeat, doesn't track ongoing state per recipient.

Broadcasts cover the cases where an agency wants to send something *right now* (or, eventually, at a specific scheduled time) to a defined audience: a Memorial Day promo, an announcement of a new producer joining, a one-off check-in on a specific list of prospects, a holiday card to all active clients. Anything that isn't a recurring lifecycle automation.

Broadcasts are the easier of the two send primitives because almost all of their interesting work was already settled when we designed Segments and Templates. The Broadcast is the *assembly* — picking the ingredients and pressing go. Where the design earns attention is in **pre-send recipient verification** (the screen agencies will actually spend time on) and the small set of decisions about fanout and sender resolution that determine who specifically gets what.

---

## What a Broadcast is

A Broadcast has six parts:

- **A name and description** — for finding it later in history, and for distinguishing it from other Broadcasts that go to similar audiences. "Memorial Day promo — May 2026" is a Broadcast name; "Send to active clients" is not (too vague).
- **The audience** — one Segment, or a composition of Segments via include/intersect/except. The Broadcast records *which* Segment(s); the actual people are resolved at send time.
- **A Template** — what the recipient receives. Channel-specific. For PoC, always an email Template (per [`templates.md`](templates.md)).
- **A sender** — resolved at send time via the sender chain (Segment metadata → policy producer → account CSR/AR → house team), with per-Broadcast override possible.
- **Send timing** — when the Broadcast goes out. For PoC, "send now" only. Scheduled sends are a deferred feature.
- **A status** — Draft / Sending / Sent / Failed. Drives what affordances are available in the UI.

What a Broadcast is *not*: it's not a trigger, it's not a sequence, it's not a recurring thing. A Broadcast that goes "every Monday" is an Automation, not a Broadcast. A Broadcast that sends three emails in a sequence with delays between is also an Automation. Broadcasts are explicitly one-shot.

---

## How a Broadcast comes together

The composing flow has five steps. Each one has its own UI surface; transitions happen as the user moves through:

1. **Pick the audience.** Browse the Segment library, pick one. Optionally combine with other Segments via include/intersect/except (tier 3 composition; see [`segments.md`](segments.md)). The composing UI shows a running count as Segments are layered.
2. **Pick the Template.** From the Template library, filtered to email (at PoC) and to Templates whose expected anchors match the audience's anchor entity. If a chosen Template's required tokens won't resolve for some recipients (e.g. references `{policy.renewal_date}` on an Account-anchored Segment with no specific policy in context), this is flagged.
3. **Resolve sender behavior.** Default sender resolves via the chain. The user can override per-Broadcast ("everyone gets this from the agency principal, not their CSR"). The Broadcast also picks the fanout rule — primary contact per account, all contacts per account, named insured per policy, etc. — with sensible defaults from the audience's anchor type.
4. **Verify recipients.** The verification screen (see below) shows the final list of who would receive the email, with the rendered preview per recipient. The user can bulk-exclude individuals with notes, or click confirm.
5. **Send.** For PoC, the "Send now" button enqueues the Broadcast immediately. Status → Sending. Status → Sent when all Send records have resolved (delivered, bounced, or errored).

At any point before step 5, the Broadcast can be saved as a Draft and resumed later.

---

## Pre-send recipient verification

This is the screen that makes Broadcasts trustworthy. It's where Ley's "review every recipient" commitment lives and where Marker's "I want to know who's getting what" gets answered concretely.

After the user has picked audience + Template + sender, the verification screen lists the final recipients — Segment matches *after* suppression filters (consent layer: unsubscribed, bounced, deceased, do-not-market) and *after* the fanout rule has resolved each match into specific contacts.

Each row shows:

- **Recipient name + email** — who's actually going to receive it
- **Account and (if applicable) policy** they're attached to — so the reviewer has context
- **Sender** for this row — small chip indicating who they'd receive from (relevant when sender resolution varies across recipients, e.g. different CSRs per account)
- **Render preview link** — opens the actual rendered email for this specific recipient, with all merge tokens filled from their data. Lets the reviewer see exactly what each person would receive.
- **Flags** if the system noticed anything worth attention — e.g. "this contact was emailed yesterday by another campaign" or "missing token: this recipient has no `policy.renewal_date` — the email will fall back to '[not on file]'"

Counts at the top:

```
284 matched the Segment(s)
 ↓
 12 suppressed (8 unsubscribed, 3 bounced, 1 deceased)
  5 excluded by you (bulk exclude with notes)
 ↓
267 will receive this Broadcast
```

The reviewer can:

- **Filter / sort** — by account, sender, flag presence
- **Bulk exclude** with required note — "Long-tenured clients — don't auto-market" — these per-Broadcast exclusions persist in the audit log
- **Send test to self first** — render the Template against a chosen recipient's data and send to the reviewer's own inbox. Useful for catching merge-token issues before committing.
- **Confirm and send** — only enabled once the reviewer has scrolled through the list (or explicitly clicked "I've reviewed")

The verification screen is the load-bearing piece of the Broadcast UX. Skimping here is the difference between "we built a marketing tool" and "we built something agencies trust with their book."

---

## Send timing

For PoC, every Broadcast is **send-now**. The user finishes verifying recipients, clicks "Send now," and the Broadcast enters Sending status immediately. There's no schedule picker, no future datetime, no time zone choice, no quiet-hours guard.

This is a deliberate simplification. Scheduling is a real product surface (time zones, quiet hours, per-recipient send-time optimization, etc.) and we can ship a useful PoC without it. The agencies we're onboarding can compose a Broadcast in advance and click send themselves when the moment arrives.

Beyond PoC, scheduling adds:

- **Scheduled datetime** in the agency's timezone, with a calendar/clock picker
- **Quiet-hours guard** — agency setting that bounces scheduling to a valid window if the user picks 3am
- **Per-recipient timezone** for large broadcasts across timezones (later)
- **Send-time optimization** — best time per recipient based on prior engagement (later)
- **Cancel scheduled** — a scheduled Broadcast can be canceled before it enters Sending status

Until then, "send now" is the only verb. Drafts remain a thing (save a half-built Broadcast and come back), but a Broadcast in Draft state stays in Draft until the user actively sends.

---

## Recipient resolution — turning Segment matches into recipients

A Segment returns records of its anchor type. The Broadcast turns those records into actual people to email via a **fanout rule**.

Default fanout per anchor type:

- **Account-anchored Segment** → email each account's primary contact (per-agency configurable; eventually household-aware for personal lines, role-aware for commercial)
- **Policy-anchored Segment** → email the named insured contact on each matching policy
- **Contact-anchored Segment** → email the contact directly (no fanout needed)

The Broadcast carries a fanout override slot. Most Broadcasts accept the default; some don't. Examples where the default is wrong:

- An Account-anchored Broadcast for a B2B announcement might want to email *all* contacts on each account (owner, office manager, billing contact), not just primary.
- A Policy-anchored Broadcast for a renewal might want to email both the named insured *and* the secondary insured (spouse) on personal-lines policies.

When the fanout rule produces zero recipients for a Segment match (e.g. an account whose primary contact has no email), the row appears in verification with a flag: "Skipped — no primary contact email." The reviewer sees the skip and can decide whether to fix the data or accept the gap.

---

## Sender resolution

The "From" identity for each Message is resolved at send time via the chain documented in [`concepts_working_doc.md > §9.2`](concepts_working_doc.md). Most Broadcasts let the chain do its work; per-Broadcast overrides handle the cases where it doesn't.

Example overrides:

- **House sender** — agency-wide announcement sent from a shared inbox (`announcements@marker.com`) instead of per-account producers
- **Principal sender** — special message from the agency owner, ignoring per-account routing
- **Producer of choice** — a Broadcast tied to a specific producer's outreach campaign (this is also the prospect-list-with-producer pattern, where the override comes from Segment metadata)

In verification, every recipient row shows which sender they'd receive from. If the override is set, every row shows the same sender. If the chain is in effect, different rows may show different senders (e.g. accounts with different CSRs). Either way, the routing is visible before send.

---

## Drafts, status lifecycle, and the audit trail

A Broadcast progresses through a small set of statuses:

- **Draft** — partially or fully configured but not yet sent. Editable, deletable. No Send records exist yet.
- **Sending** — user clicked send; the system is dispatching Messages to recipients. Send records exist and accumulate engagement events as they arrive (delivered, opened, clicked, bounced, etc.).
- **Sent** — all Send records have reached a terminal state (delivered, bounced, or failed). Broadcast is read-only from here; engagement events can still arrive (opens / clicks can occur days after send) but they attach to the existing Send records.
- **Failed** — the Broadcast couldn't dispatch (e.g. infrastructure error before any Sends were created). Distinct from per-recipient failures, which are tracked on individual Send records inside an otherwise-Sent Broadcast.

The audit trail captures every state transition with timestamps and the user who triggered it. Bulk exclusions from the verification step are part of this audit trail — "Sarah excluded 5 recipients at 9:42am with reason 'long-tenured clients.'" If anyone asks "who got this and why," the system answers.

Note: there's no Cancel for PoC because there's no scheduled state to cancel from. Once a Broadcast enters Sending, it sends to completion. Beyond PoC, scheduling adds a Cancel affordance for Scheduled-status Broadcasts (before they tip over to Sending).

---

## Test sends

A standard affordance: "send a copy of this Broadcast to me first, so I can see what it looks like in an actual inbox."

The challenge with test sends is merge tokens. The Template references things like `{contact.first_name}` and `{policy.renewal_date}` — what fills those when the recipient is just the user clicking "test send"?

Two reasonable patterns:

- **Render against a real recipient.** The user picks one row from the verification screen, says "send me what this person would get." The test inbox receives an email with that recipient's data merged in.
- **Render against a chosen contact.** The user picks any contact in the agency (not necessarily a Broadcast recipient) and the test renders against them.

Klaviyo + Mailchimp do (a) — render against a real recipient. It's the more honest preview because you see exactly what someone in the audience would actually receive. Lean: do (a) for PoC.

Test sends are critical enough to be PoC. Verification preview-per-row already exists (per the verification section), but actually receiving it in an inbox catches rendering issues that on-screen previews miss (dark mode, mobile rendering, link tracking, etc.).

---

## Channels at PoC

Email only. SMS / postcard / handwritten are post-PoC, gated on their own infrastructure (10DLC registration for SMS, print partners for postcard / handwritten). See [`templates.md`](templates.md) for the channel-by-channel breakdown.

When other channels ship, a Broadcast remains single-channel — one Broadcast sends one Message via one channel. Multi-channel sends (the same content across email + SMS + postcard) would be multiple coordinated Broadcasts; the cross-channel coordination is its own product surface (not a primitive).

---

## Where Broadcasts fit alongside other concepts

A Broadcast is one of [the four primitives](concepts_working_doc.md). The non-overlaps:

- **Broadcasts aren't recurring.** Anything that happens on a schedule or trigger is an Automation. A "send the same thing every Monday" pattern is an Automation with a date-based trigger, not a recurring Broadcast.
- **Broadcasts aren't sequences.** A Broadcast sends one Message. A sequence of Messages over time is an Automation.
- **Broadcasts don't carry per-recipient state.** Once sent, a Broadcast is over. The recipients aren't "enrolled" in anything. Compare to Automations, where each recipient has an enrollment record that tracks where they are in the sequence.
- **Broadcasts don't compose with Automations directly.** Broadcasts and Automations are peers, not parents/children. A Broadcast can send to a Segment that an Automation also uses, but the two don't coordinate.

### Where they touch other concepts

- **Segments** — Broadcasts consume Segments (one Segment or a composition) to define the audience.
- **Templates** — Broadcasts consume one Template for the content.
- **Sender resolver** — Broadcasts use the shared sender chain (with override).
- **Suppression / consent layer** — Broadcasts honor agency suppressions and per-contact consent state at recipient verification.
- **Send records** — Each Broadcast generates one Send record per recipient. Engagement events (opens, clicks, etc.) attach to Send records.
- **Reporting** — Per-Broadcast reports aggregate the Send-record engagement data.

---

## Implementation details

The technical side of how Broadcasts work in the system. Non-technical readers can stop here.

### PoC: schema

```
broadcasts
├── id                          uuid
├── name                        text
├── description                 text
├── agency_id                   uuid
├── status                      text             -- 'draft' | 'sending' | 'sent' | 'failed'
├── segment_recipe              jsonb            -- list of { segment_id, op: 'include'|'intersect'|'except' }
├── template_id                 uuid
├── fanout_rule                 text             -- 'primary_contact' | 'all_contacts' | 'role:<role>' | 'named_insured' | 'contact_directly'
├── sender_override             jsonb            -- null = use chain; otherwise the explicit sender to use
├── recipient_count_estimate    int              -- last computed estimate from verification
├── exclusions                  jsonb            -- list of { contact_id, reason, excluded_by, excluded_at } from verification step
├── sent_at                     timestamptz      -- when the user clicked send
├── completed_at                timestamptz      -- when all Send records reached terminal state
├── created_by / created_at / updated_by / updated_at
```

Plus the runtime artifact:

```
sends
├── id                          uuid
├── broadcast_id                uuid (nullable)  -- nullable because Sends also come from Automations
├── automation_id               uuid (nullable)
├── automation_step_id          uuid (nullable)
├── enrollment_id               uuid (nullable)  -- for Automation sends
├── recipient_contact_id        uuid
├── contact_method_id           uuid             -- which email address specifically
├── channel                     text             -- 'email' for PoC
├── sender_resolved             jsonb            -- snapshot of resolved sender at send time (name, email, signature, etc.)
├── template_id                 uuid
├── template_version            int (nullable)   -- pinned version if any (post-PoC)
├── rendered_content            jsonb            -- final rendered content with all tokens substituted
├── provider_message_id         text             -- Resend's message ID
├── status                      text             -- 'queued' | 'dispatched' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked' | 'replied' | 'unsubscribed'
├── status_updated_at           timestamptz
├── created_at                  timestamptz
```

The `sends` table is shared infrastructure used by both Broadcasts and Automations. Both write rows here at dispatch time; engagement events come back via Resend webhooks and update `status` / append to an engagement-events stream.

### PoC: send pipeline

1. User clicks "Send now" on a verified Broadcast.
2. Backend transitions Broadcast to `Sending` status.
3. Backend resolves the audience: runs the Segment composition, applies fanout rule, filters out suppressed contacts and per-Broadcast exclusions, produces final recipient list.
4. For each recipient, backend creates a Send row in `sends` (status `queued`), renders the Template against the recipient + sender + agency context, and enqueues to Resend via QStash for rate-limited delivery.
5. Resend's webhooks update each Send's status as events come in (delivered, opened, clicked, bounced, etc.).
6. When all Send rows reach a terminal state, backend transitions Broadcast to `Sent` with `completed_at`.

For PoC scale (a few hundred recipients per Broadcast, low concurrency), this pipeline is straightforward. Resend handles the delivery, QStash handles queueing + retries. PolicyLift's send pipeline just owns the recipient resolution + render + status tracking.

### PoC: recipient verification view

The verification screen runs the same audience-resolution query as the eventual send pipeline (Segment composition → fanout → suppression → exclusions) and renders the result with per-row metadata.

For performance on large audiences, the verification can paginate the recipient list and compute counts via `SELECT COUNT(*)` separately from the row-level data. Sample render preview (the per-recipient render) is computed on demand when the user clicks the preview link, not for every row up front.

### PoC: send-test-to-self

The test-send endpoint takes a Broadcast ID + a chosen recipient ID + a destination email (defaults to the requesting user's own email). It renders the Template against the chosen recipient's data, and dispatches via Resend with a "[TEST]" subject prefix and a "this is a test, not for the actual recipient" disclaimer added by the system (so an accidentally-real-recipient test send is clearly marked).

Test sends create a Send row with `is_test = true` (added column not in the sketch above) so they're traceable but don't pollute Broadcast engagement metrics.

### Beyond PoC: scheduling

Adds a `scheduled_for` timestamp on `broadcasts` plus a new `scheduled` status. A scheduler (cron or QStash delayed job) wakes at the scheduled time and triggers the same send pipeline. Quiet-hours guard runs at schedule-time (rejects datetimes outside the agency's window). Cancel affordance available while status is `scheduled`.

### Beyond PoC: cancel during sending

For very large Broadcasts that take time to dispatch (mailbox-OAuth-style rate limits, SMS provider throttling, etc.), a Cancel mid-Sending may matter. Implementation: backend marks Broadcast as `cancel_requested = true`; the dispatch loop checks this between batches and stops enqueueing new Send rows. Already-dispatched Sends still complete (you can't unsend an email Resend already delivered).

### Beyond PoC: A/B testing

Adds variant Templates per Broadcast. The audience splits N ways (e.g. 10% to variant A, 10% to variant B for an early-engagement window, then the winning variant goes to the remaining 80%). Each Send row references which variant it received. Statistical-significance reporting on engagement metrics.

### Beyond PoC: follow-up to non-engaged

UX affordance: from a Sent Broadcast, "Send follow-up to people who didn't open." Creates a new Broadcast with a composed audience: `[original recipients] EXCEPT [opened the original]`. Requires the engagement-event stream to be queryable as a Segment filter (which is a Segment-side capability, not Broadcast-specific). Useful pattern across marketing tools.

### Beyond PoC: multi-channel coordination

Out of primitive scope. If an agency wants the same content across email + SMS + postcard, they create three Broadcasts (one per channel) and orchestrate timing manually. A future "Multi-channel Broadcast" might bundle them, but it's a composite, not a primitive.

---

## Open questions

1. **Fanout default for Account-anchored Broadcasts.** Primary contact only (Lev-style), or household-aware (our differentiator)? Household requires the Household entity which doesn't exist yet. Lean: primary-contact-only at PoC; upgrade to household-aware when Household ships.
2. **Test-send rendering — against a real recipient, or against a "test contact" fixture?** Going with real recipient (Klaviyo / Mailchimp pattern). Worth confirming nothing in PolicyLift's contact model breaks this assumption.
3. **What if a Broadcast's underlying Segment changes mid-Draft?** A Broadcast saved as Draft references Segments by ID; if a Segment's logic is edited before the Broadcast sends, the next time the Broadcast runs audience resolution, it'll use the new logic. Acceptable for PoC. If a customer complains, we add Segment pinning to Broadcasts (similar to Template pinning).
4. **What if a Broadcast's Template changes mid-Draft?** Same as above — Template references are by ID, edits propagate. PoC tolerates it; pinning is a beyond-PoC fix.
5. **Render preview cost on verification.** Rendering hundreds of merge-token previews on the verification screen could be slow if every row pre-renders. Lean: render on demand (click a row to see preview) rather than rendering all rows up front. Counts come from cheaper queries.
6. **Bulk exclusion persistence beyond the Broadcast.** When a reviewer excludes 5 recipients with a note, those exclusions persist as part of *this Broadcast's* audit trail. Should they also feed back to a per-contact suppression flag ("Sarah never sends marketing to this contact") for future Broadcasts? Lean: no — keep Broadcast exclusions local. Persistent suppression is a separate, more deliberate action via the consent layer (post-PoC).
7. **Status granularity.** Is "Sending" vs "Sent" enough, or do we need "Partially Sent" for cases where some Sends failed but most succeeded? Lean: Broadcast status reflects whether dispatch completed; per-recipient outcomes are queryable via Send records. No "Partially Sent" status; reporting tells the story.
8. **Per-Broadcast custom labels / categories.** Same taxonomy as Segments + Templates? Probably yes — one consistent category vocabulary across all primitives (Renewal / Welcome / Cross-sell / Lifecycle / Marketing / Hygiene).
9. **Editing a Sent Broadcast.** Lean: no edits to Sent Broadcasts. Re-running a Broadcast = creating a new one (with a "duplicate from" affordance to copy the configuration).
10. **Estimated send completion time on Sending status.** For PoC scale this is fast (minutes); UI just shows "Sending..." with progress count. Beyond PoC at larger scale, ETA estimation might be useful.
