# PolicyLift Email Automation — Vision

**Status:** Draft vision spec — the readable front door to the email work. High-level by design; depth lives in the companion docs linked throughout.
**Created:** 2026-06-05
**Related:** [segments.md](segments.md) · [templates.md](templates.md) · [broadcasts.md](broadcasts.md) · [automations.md](automations.md) · [dynamic-content.md](dynamic-content.md) · [segment_library_poc.md](segment_library_poc.md)

> **How to read this:** top to bottom, in plain language — no schema, no status tracking. Each section explains a concept and points to the companion doc that holds the detail. For the live brainstorm record, the concept-by-concept status map, and decision history, see [`concepts_working_doc.md`](concepts_working_doc.md) (the working doc) and [`decisions_and_open_questions.md`](decisions_and_open_questions.md). Doc-level history is in [`changelog.md`](changelog.md).

---

## Summary

Independent insurance agencies need to talk to their customers at the right moment — renewals coming up, a payment about to lapse, a new policy just sold, a claim just closed. Today PolicyLift does this through **Reach**, a third-party email tool it pushes data into. Reach can't carry the fidelity that matters: it flattens each customer into a too-simple shape, drops every contact but the primary one, and loses most policy detail at the sync boundary. The result is that we **can't onboard real agencies to it** — they can't build the audiences they actually care about, and they can't trust who an email will reach before it goes out.

This is the vision for **PolicyLift's own email automation**, replacing Reach. It's a marketing and lifecycle communication layer built directly on PolicyLift's existing customer data and its connection to the agency's management system (the AMS). The central bet is the part Reach can't do: **accurate, deep audience-building over messy AMS data, with recipient verification before every send.** Everything else — composing content, scheduling, automating sequences — is well-understood technology. The audience pipeline is where the product wins or loses.

---

## Core concepts — the four primitives

The product organizes around four self-contained concepts. Each does one thing and has its own builder. Everything else is either a *property* of one of these or a runtime artifact created when they run.

### Segment — who you're talking to

A **Segment** is a saved, named question about who matches some criteria: *"active auto policies,"* *"customers in California with state-minimum limits,"* *"lost customers from the past six months."* It's a question, not a frozen list — ask it today and next week and you get different matches as the underlying data changes. Each Segment has an **anchor**: the kind of record it returns (an account, a policy, a contact, a claim, a quote), which determines the shape of the answer.

Segments are where the hard, differentiating work lives. Expressing real insurance audiences — *"home policies with a bundle carrier but no auto,"* *"renewing in 30 days and still in force"* — over data that every AMS stores differently is exactly what Reach's simplistic shape couldn't cross.

*Detail — the anchor concept, how Segments get authored, the complexity ladder from flat filters to quantified relations, the library + sample preview, fields by source, and composition — in [`segments.md`](segments.md).*

### Template — what the message says

A **Template** is reusable content for a single channel: an email body + subject + merge tokens, or an SMS, or a postcard. It knows nothing about who receives it, when, or from whom — only how the message reads. Templates also carry the agency's conventions, like Marker's requirement that the subject line include the customer name and HawkSoft ID so a CSR can look someone up when they call in.

*Detail — channels, merge tokens with fallbacks, required conventions, inherited brand assets, and versioning — in [`templates.md`](templates.md).*

### Broadcast — the one-off send

A **Broadcast** is a scheduled send to a chosen audience: pick a Segment, a Template, a sender, and a time, and it goes out once. (This is what Klaviyo calls a *Campaign*.) A "welcome to the agency" announcement or a "your limits are increasing at renewal" notice are Broadcasts. The dividing line from an Automation is **scheduled vs. triggered** — a Broadcast is a deliberate, one-time send to whoever matches at that moment.

*Detail — the compose flow, pre-send recipient verification, fanout, sender resolution, send timing, and status lifecycle — in [`broadcasts.md`](broadcasts.md).*

### Automation — the triggered workflow

An **Automation** is an ongoing pipeline that enrolls people as they cross a **trigger** and walks each one through a sequence of steps over time. (This is what Klaviyo calls a *Flow*.) The trigger is a *transition*: a date arriving (30 days before a renewal), an event firing (a policy bound, a claim filed), or someone entering a Segment. The renewal reminder, the welcome kit, and the cancellation sequence are all Automations. This is where the product's complexity concentrates — each enrolled person has their own state, timing, and exit conditions.

*Detail — trigger types, enrollment, the step sequence, exit and re-entry rules, sender resolution, and pre-launch verification — in [`automations.md`](automations.md).*

### How Segments and Automations fit together

The two are tightly related, and getting the boundary right is the spine of the whole design. The clean split:

> **The Segment holds the durable "what kind of record is this" — slow-changing, reusable, expressed in the agent's own AMS vocabulary. The Automation holds the temporal and program logic — when to send, who it's from, and any refining filters layered on top.**

So a renewal program is a *simple, reusable* Segment ("active auto policies") plus an Automation that supplies the timing ("30 days before the renewal date") and the send resolution. The same base Segment can power many programs; the per-program specifics live on the Automation, which is why agencies don't end up with fifty near-identical Segments.

Two consequences worth stating plainly:

- **They stay separate entities, but the audience is never hidden.** You don't build a Segment from inside an Automation — but the Automation always shows the **net resulting audience** after its layered filters, so you're never guessing who a program will actually reach. (Reach's failing was forcing the two apart with no shared view; we keep them distinct but surface the result together.)
- **Enrollment is newly-entering by construction.** Because a trigger is a transition, an Automation only ever catches people *as they cross in* — it can't accidentally blast the agency's entire existing book (Reach's classic "welcome email to all 3,000 active customers" failure). Reaching everyone who *already* matches is a deliberate one-time backfill or a Broadcast, never a side effect of turning an Automation on.

*Detail — enrollment, drift over time, exit + re-entry, and the date-trigger model — in [`automations.md`](automations.md); the stateless-question framing — in [`segments.md`](segments.md).*

---

## Cross-cutting capabilities

Capabilities that span the primitives.

### Fields by source — `ams.` / `pl.` / `calc.`

Segments reference fields by **where they come from**: `ams.*` for data that originates in the AMS (policy status, substatus, renewal date) and `pl.*` for data that originates in PolicyLift (tags, NPS responses, consent, conversation history). The guiding insight is that agents are **experts in their AMS fields and novices in marketing abstractions** — they trust `status` + `substatus` because that's *exactly what they use in HawkSoft*, and they distrust a "PolicyLift version" of the same thing. So we lean on raw AMS fields rather than transforming them. A normalized/computed layer (`calc.*`, e.g. a single "days until renewal" that resolves differently per AMS) is deferred — and even later it's a harder sell — introduced only when a concept is reused enough to deserve a name or is needed across a second AMS.

*Detail — the `ams.` / `pl.` / `calc.` staging and the per-AMS resolution model — in [`segments.md` → Fields by source](segments.md).*

### Dynamic content — putting related records in the message

A Segment anchored on accounts returns *accounts*, but the email often needs to list each account's *renewing policies* — a related collection, not the thing the Segment returned. The governing rule: the list shown in the message must be exactly the set that qualified the recipient, never authored separately (or the two drift). This supports two send shapes the agencies ask for: **one email per policy**, or **one per customer** that aggregates their matching policies into a merge field (*"your policies renewing this month: …"*).

*Detail — the recipient-context model and the per-entity vs. aggregate paths — in [`dynamic-content.md`](dynamic-content.md).*

### Recipient & sender resolution

A Segment returns records (accounts, policies); turning those into actual people to email — and deciding who the email is *from* — happens on the Broadcast or Automation. **Fanout** chooses the recipient: one per household, per primary contact, per named insured, per role. **Sender resolution** walks a chain (a list's assigned producer → the policy's producer → the account's CSR → a house mailbox), because Marker wants renewals from the CSR, relationship touches from the producer, and prospect-list emails from the producer who owns that list.

*Detail — fanout options, the sender resolver chain, and per-campaign overrides — in [`concepts_working_doc.md` §9](concepts_working_doc.md).*

### Pre-send verification

Before anything goes out, the agency reviews the **actual recipient list** — eyeball the names, recognize who's in it, exclude any rows that look wrong. This is the load-bearing trust surface (a hard requirement from Ley and Marker), shared by both Broadcasts and Automations.

*Detail — the verification surface — in [`broadcasts.md`](broadcasts.md) and [`automations.md`](automations.md).*

### Consent, AMS writeback, and reporting

Three runtime concerns that sit under everything: a **consent layer** (marketing vs. service-transactional, with suppression applied at send), **AMS writeback** (sends and replies posted back to the customer's activity stream in the AMS, which Marker expects), and **reporting** (engagement rolled up to policy-level revenue and producer/carrier/line-of-business performance — the long-term differentiator).

*Detail — the runtime cluster — in [`concepts_working_doc.md` §7 (RT)](concepts_working_doc.md).*

---

## The data foundation

Underneath everything sits a **two-tier view of AMS data**. Tier one is a clean **CXP abstraction layer** — accounts, contacts, and policies in the same shape regardless of which AMS the agency runs — used for the UI and everyday convenience. Tier two is the **raw AMS payload preserved alongside it**, every native field in its original structure. The Segment engine queries the raw tier primarily, because that's where the fidelity for real segmentation lives, and mixes it with PolicyLift-side data.

Each agency is tied to a single AMS, so within an agency there's nothing to normalize *across* — which is why raw-AMS-first works and the unified `calc.*` layer can wait until we want one Segment definition to span agencies on *different* AMSes.

*Detail — the two-tier strategy and what's in CXP today vs. missing — in [`concepts_working_doc.md` §3–§4](concepts_working_doc.md).*

---

## Delivery model

**To start, PolicyLift authors Segments on the agency's behalf** and the agency picks from a curated library — there's no client-built-from-scratch segmentation yet, because a wrong Segment sends a wrong campaign to real customers. New or changed Segments are arranged with the PolicyLift team directly, out of band (agencies are already in regular contact with ops). Segments come in two kinds, marked in the library: **Managed** (PolicyLift-built, read-only to the client) and **Regular** (client-built, editable).

Authoring opens up over time: PolicyLift writes Segments first (engineers, then a lightweight internal ops builder), and a client-facing builder follows once we've seen which fields agencies actually reach for. Combining saved Segments is a possible further step — though even mature tools handle that as a membership condition or a send-time multi-select rather than a dedicated feature.

*Detail — the tiers, the Managed/Regular split, and the concierge workflow — in [`segments.md`](segments.md).*

---

## Concepts at a glance

| Concept | What it is | Detail |
| --- | --- | --- |
| **Segment** | A saved, stateless query — *who* matches some criteria, returning records of one anchor type | [`segments.md`](segments.md) |
| **Anchor** | The kind of record a Segment returns (account / policy / contact / claim / quote) | [`segments.md`](segments.md) |
| **Template** | Reusable content for one channel — *what* the message says | [`templates.md`](templates.md) |
| **Broadcast** | A scheduled one-off send to a chosen Segment (Klaviyo "Campaign") | [`broadcasts.md`](broadcasts.md) |
| **Automation** | A triggered, ongoing workflow that enrolls people over time (Klaviyo "Flow") | [`automations.md`](automations.md) |
| **Trigger** | The transition that enrolls someone — a date, an event, or entering a Segment | [`automations.md`](automations.md) |
| **Enrollment** | A person's per-Automation state; newly-entering by construction | [`automations.md`](automations.md) |
| **Fields by source** | `ams.*` (from the AMS) / `pl.*` (from PolicyLift) / `calc.*` (computed, later) | [`segments.md`](segments.md) |
| **Dynamic content** | Rendering a recipient's related records (their renewing policies) into the message | [`dynamic-content.md`](dynamic-content.md) |
| **Fanout** | Turning Segment records into actual recipients (per household / contact / role) | [`concepts_working_doc.md`](concepts_working_doc.md) |
| **Sender resolution** | The chain that picks who an email is from | [`concepts_working_doc.md`](concepts_working_doc.md) |
| **Pre-send verification** | Reviewing the real recipient list before send — the trust surface | [`broadcasts.md`](broadcasts.md) |
| **Consent / suppression** | Marketing-vs-service eligibility, applied at send | [`concepts_working_doc.md`](concepts_working_doc.md) |
| **Two-tier AMS data** | CXP abstraction layer + raw AMS payload preserved alongside | [`concepts_working_doc.md`](concepts_working_doc.md) |

---

*The live brainstorm, concept-by-concept status map, client signal, and decision history live in [`concepts_working_doc.md`](concepts_working_doc.md). Open decisions for team review are consolidated in [`decisions_and_open_questions.md`](decisions_and_open_questions.md). Doc-level history is in [`changelog.md`](changelog.md).*
