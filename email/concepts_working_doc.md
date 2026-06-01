# Email Automation — Concepts Working Doc

**Status:** Live brainstorming notes. Captures framing settled, concepts queued, decisions made, open threads. Eventually breaks into per-concept vision docs (style: Fairs.com `specs/kiosk/kiosk.md` + `specs/registrations/crm-vision.md`).
**Created:** 2026-05-26
**Updated:** 2026-05-27 (v5 — restructured around four primitives)
**Companion docs:** [`segments.md`](segments.md) · [`templates.md`](templates.md) · [`broadcasts.md`](broadcasts.md) · [`automations.md`](automations.md) · [`dynamic-content.md`](dynamic-content.md)
**Related:** [`research_segment_builder_ux.md`](research_segment_builder_ux.md) · [`client_feedback.md`](client_feedback.md) · [`data_object_map.md`](data_object_map.md) · [`research_feature_list.md`](research_feature_list.md) · [`email_automation_system_requirements.md`](email_automation_system_requirements.md) · [`changelog.md`](changelog.md)

> **How to use:** Read top-to-bottom on first pickup. After that, jump to "The four primitives" (§5) for vocabulary, "Concept map" (§7) for status, "Active thread" (§8) for the current question, "Client signal" (§12) for real-world grounding. Doc-level changelog lives in [`changelog.md`](changelog.md).

---

## 1. What this work is

PolicyLift's native email automation, replacing the third-party Reach integration. The product is a marketing + lifecycle communication layer for independent insurance agencies, built on top of PolicyLift's existing CXP (Customer Experience Platform). It owns the outbound channels — email primarily, also SMS / postcards / handwritten — but its center of gravity is the AMS connection: every Message is informed by policy data, fired off insurance lifecycle events (renewals, claims, rate changes, quotes), written back as an AMS activity, and rolled up to policy-level revenue attribution.

The **central unmet need** that Reach can't solve: **accurate, deep Segments over heterogeneous AMS data, with recipient verification before send.** Everything else (sending, templates, automation) is largely solved technology; the Segment + Automation pipeline is where the product wins or loses.

Compared to **Agency Revolution** we lean deeper into producer-mailbox sending and household orchestration. Compared to **Levitate** we lean deeper into insurance event triggers, custom fields, multi-contact-per-account, policy-level reporting, and explicit modeling of the **Lead → Prospect lifecycle boundary** that determines whether automated nurture or human-handoff CRM applies (see §12.1).

---

## 2. Why we're replacing Reach (not extending)

Confirmed by Alex/Yurii (2026-05-26) and Marker onboarding call (2026-05-27, §12.1):

1. PolicyLift currently one-way syncs AMS → CXP `accounts/contacts/policies`, then flattens that into a Reach "Customer" object pushed to Reach. **CXP UI isn't enabled for clients yet** — practically, CXP is in-transit data and clients only see anything through Reach's interface.
2. AMS data structures are complex and vary dramatically across AMSes. Clients care intensely about **building specific Segments accurately** and **verifying recipients before sending**. The Reach Customer shape is too simplistic to express what real clients want to target on. Result: **we can't onboard real clients to Reach** because the simplistic shape can't carry their actual segmentation requirements.
3. Concrete evidence in code: the HawkSoft → Reach adapter collapses an Account into one Customer carrying only the `is_primary` contact's email/name/phone/birthday/gender. Every other contact and most policy detail is dropped at the sync boundary.

The research PDFs in this folder (Agency Revolution + Levitate teardowns) and the 2026-05-25 inventory docs predate this context — they assume a greenfield replacement, which is now the actual plan.

---

## 3. What's already true in PolicyLift (don't re-derive)

Authoritative source: `../policylift/docs/cxp/data-model.md` and `sync/architecture.md`.

### 3.1 Entities

- `agencies` — tenants
- `accounts` — customer record (personal | commercial); `status` (active/dead_file/prospect/lead), `total_premium`, `ams_type`, **`ams_data` (raw jsonb — load-bearing for the new direction, see §4)**, `is_filtered`, `source` (ams|policylift)
- `contacts` — person under an account; `role`, `is_primary` (unique per account), `birthday`, `gender`
- `contact_methods` — multi email + multi phone per contact, with `is_primary` per type, `title` (Work/Mobile/etc.). **Already solves Levitate's "one email per contact" gap.**
- `policies` — `account_id`, `policy_type_id`, `status` (17 values), `premium`, `carrier` (text — not an entity), `effective_date`, `renewal_date`, `expiry_date`, `inception_date`
- `policy_types` — 51 standardized types across commercial / personal / other
- `account_calls` / `account_chats` / `account_appointments` — 1:1 join with `status` (pending|confirmed)
- `quote_packets` — with status started → collecting-data → finalizing → quoted → binded → lost

### 3.2 UI

- **Basic CXP UI exists today** — accounts and contacts tables with detail pages. Not yet enabled for clients (still internal-only) but we'll be using and extending it, not designing greenfield. Martin plans a clickable HTML proto resembling the current platform as a brainstorm reference artifact.
- **Admin UI exists** for PL employees — browse accounts/contacts/policies/etc. with more raw AMS data exposed than the client-facing CXP UI.

### 3.3 AMS sync

In production for 6 systems: HawkSoft (+ Partner), EZLynx, Sentry, QQCatalyst, Momentum, AgencyMatrix, NASA. QStash-based pipeline (agency → account → upsert/delete jobs). Adapters in `src/server/accounts/reach/adapters/<ams>/`. HawkSoft alone supports deletion tracking. Exclusion rules use JSON Logic.

### 3.4 Entity assignment

ADR-0020 — per-entity user junction tables (assignment + per-user `is_read`) for calls / chats / form_submissions / quote_packets. **NOT yet on accounts or policies** — so per-account producer/CSR routing has no schema home today.

### 3.5 Source-of-truth field

`source: ams | policylift` exists on accounts, contacts, contact_methods, policies — the schema anticipates mixed origin, but conflict / merge / editability policies aren't documented anywhere visible. Less urgent than originally thought because CXP isn't user-facing yet; revisit when CXP enables for clients.

### 3.6 What's NOT in CXP yet (relevant to email automation)

- Household
- Tag (TBD — see §7 / N1; AMS-only fallback now confirmed blocked for major cases — see §12.1)
- Key Fact (Levitate concept)
- Carrier as an entity (currently text on policies)
- Coverage / Coverage Limit on Policy
- Claim
- Segment (lives in Reach today)
- Custom Field (agency-defined attributes)
- Producer / CSR assignment on Accounts or Policies (see 3.4)

---

## 4. AMS data strategy — two-tier with canonical fields on top

The architectural posture that shapes everything in the Segment design. Established 2026-05-26 with Alex/Yurii.

### 4.1 Two tiers of AMS data

**Tier 1 — CXP abstraction layer.** AMS data is mapped into PolicyLift's first-class entities (`accounts`, `contacts`, `policies`, future `claims` / `carriers` / etc.) using a common shape across all AMSes. This is what the CXP UI surfaces. It exists for convenience: showing the same accounts/contacts/policies regardless of which AMS the agency uses, supporting CRUD UX, and being readable by humans.

**Tier 2 — Raw AMS data.** Alongside the abstraction, the raw AMS payload is preserved (currently in `accounts.ams_data` as jsonb). This is the source-of-truth shape — every field the AMS actually carries, in its native structure. The Segment engine primarily queries this tier because **only here lives the fidelity needed for real segmentation** (the Insurance Center state-min-auto campaign, JAMCO renewal indicator, Marker substatus, Katz writing-company logic).

Working assumption (Martin, 2026-05-26): jsonb-based raw storage continues — possibly an evolved version, but we won't be recreating typed shadow tables per AMS. Segment engine queries into jsonb directly. **Open question:** indexing/query-performance strategy for raw-tier predicates as data volume grows.

### 4.2 Two goals of AMS↔PL sync

Distinct goals served by the two tiers:

- **Convenience goal** — work with AMS data at a higher level on the platform (accounts/contacts/policies UI when CXP enables for clients). Met by tier 1.
- **Segmentation power goal** — let clients query the actual AMS shape, because that's where the fidelity is. Met by tier 2.

These advance independently. Convenience-goal improvements (richer Carrier entity, Claim entity, Household) make CXP UI better but don't unlock segmentation. Segmentation-goal improvements (canonical field catalog, predicate vocabulary, recipient verification) unlock client onboarding even before CXP UI is enabled.

### 4.3 Canonical field vocabulary — the unifying layer

(Working name; we may rename.) The conceptual layer the client sees in the Segment builder. The user picks "Policy age > 365 days," not `ams_data->>'policy_inception_dt' < now() - 365` — because under the hood, "policy age" resolves differently across the 6+ AMSes.

A canonical field has:
- A **client-facing name + definition** ("Policy age" = days since policy inception)
- A **per-AMS resolution function** that maps the canonical field to the raw AMS shape (jsonb path + transform)
- A **type + domain** (number, date, enum-with-values, boolean) for UI rendering and predicate selection
- **Per-AMS availability flags** (some AMSes don't carry the field; Segment builder should grey out gracefully)
- An **entity attachment with cardinality** — lives on Account, Policy, Contact, etc., either single-per-parent or many (collection)
- Optionally: **computed from other canonical fields + reference data + rules** (e.g., "Is at state minimum" derives from BI per person + BI per accident + PD + policy state + state-minimums reference table)
- Often: a **status guard / companion predicate** — date-based fields like "Policy renewing in N days" need a companion `policy.status = active` predicate because canceled policies have unreliable date fields (Marker §12.1)

Walkthrough of "Auto policy is at or below state minimum" happened in conversation 2026-05-26; key insights in §8.2.

Catalog model (Martin, 2026-05-26): **probably hybrid**. PolicyLift ships a base catalog; agencies extend with their own. See §8.2 for open questions about authoring and resolution function location.

### 4.4 PL-side data also feeds Segments

Whatever lives on the PL side — tags (if we keep them PL-side, TBD), custom fields, do-not-market flags, consent state, exclusion rules, future Household groupings — needs to be queryable in the same Segment expression as canonical AMS fields. The Segment engine is one query surface over two underlying sources.

---

## 5. The four primitives

Settled 2026-05-27 with Martin (post-research-doc complexity check). The product organizes around four self-contained concepts. Each does one thing. Each has its own builder and its own data model. Everything else is either a *property* of one of these or a runtime artifact generated when they're used.

This is a hard line against the over-bundling we'd been doing earlier. If a concept doesn't fit cleanly into one of the four, we either fold it in as a property or surface it as a separate primitive.

### 5.1 Segment — the query

A saved filter that defines a group. Predicate-based: "Auto policies renewing in the next 30 days." Has an **anchor entity** (Account / Policy / Contact / Claim / Quote — the shape of each row in the result). Has a name, description, and a current count when asked.

**A Segment is stateless.** It's a question, not an answer. Ask it on Monday, get one set; ask it Friday, get a different set as data changes. The Segment doesn't track who's in it over time.

**What lives in a Segment:**
- Predicates (over canonical AMS fields, raw AMS fields, PL-side annotations)
- Anchor entity
- Name, description
- Metadata (ownership, sender-routing hints for prospect-list pattern — see SE8 in §7)

**What does NOT live in a Segment:**
- Recipients (it's a query, not a list)
- Sending logic
- Triggers
- Templates
- Enrollment state
- Lock/freeze mode (that's an Automation property — see §5.6)

### 5.2 Template — the content

A reusable piece of content for a single channel. Email body + subject + merge tokens, or SMS body, or postcard layout, or handwritten card.

**What lives in a Template:**
- Channel (email / SMS / postcard / handwritten / internal note)
- Subject (for email/SMS where applicable)
- Body content + layout
- Merge tokens (references to canonical fields, sender attributes, agency branding)
- Required convention enforcement (Marker §12.1: customer name + HawkSoft ID in subject; visible automation indicator in body)
- Carrier-approved metadata (future — for carrier co-op content gating)

**What does NOT live in a Template:**
- Recipients
- When it's sent
- Who it's from (the sender is resolved at send time)
- Tracking / engagement data (that lives on Send records)

### 5.3 Broadcast — the one-off send

A single, manually-launched send. The user picks a Segment + a Template + a sender + a time → it goes once.

**What lives in a Broadcast:**
- Reference to a Segment (whose current matches become the recipients at send time)
- Reference to a Template
- Recipient resolution rule (fanout — how Segment matches turn into recipient contacts: per-household, per-primary, per-contact-with-role-X, etc.)
- Sender (resolved via T5-style chain, see §5.4 + Automation)
- Schedule (send-now or send-at-time)
- Pre-send recipient verification (Ley's "review every recipient" commitment lives here)

**What does NOT live in a Broadcast:**
- Triggers (it's manual)
- Multiple steps (it's one shot)
- Enrollment state (no per-person workflow)
- Ongoing logic

A Broadcast is the simpler of the two send primitives. Most concepts here also appear in Automations.

### 5.4 Automation — the stateful workflow

A triggered, ongoing send pipeline. **This is where the complexity lives.** Has an entry Trigger + Segment + Sequence of Steps + enrollment + exit rules.

When the Trigger fires (or on its schedule), the Automation evaluates the Segment, enrolls matching people per its Enrollment policy, and walks them through the Sequence over time. Each person has their own state: which step they're on, when the next one fires, whether they've exited, etc.

**What lives in an Automation:**
- Entry **Trigger** — what causes evaluation (event: status changes / new policy bound / claim filed; date: X days before renewal; manual launch; segment entry)
- Reference to a **Segment** — defines who's eligible at evaluation time
- **Enrollment policy** — at-launch / newly-entering / continuous (see §5.6 — this is the "lock recipients?" question, parameterized clearly)
- **Sequence of Steps** — ordered list. Each Step has:
  - Step type (send email / send SMS / send postcard / wait / internal notification / branch / exit)
  - Reference to a Template (for send-type steps)
  - Delay/timing (relative to entry or previous step)
  - Per-Step sender override (optional)
- Default **sender resolver** for the Automation (chain: segment metadata → policy producer → account CSR/AR → house team)
- **Recipient resolution** rule (fanout — same as Broadcast)
- **Exit conditions** — rules that pull a person out mid-sequence (unsubscribe, policy status changes, manual exit, custom predicate)
- **Re-enrollment rules** — can a person enter the Automation again after exiting? When?
- Per-person **enrollment state** (runtime — see RT cluster)
- Pre-launch recipient verification

**What does NOT live in an Automation:**
- The query logic itself (that's the Segment)
- The content (that's the Templates referenced by Steps)
- Send records (those are runtime artifacts)
- Engagement events (those are runtime artifacts)

### 5.5 Vocabulary cheat sheet

| Term | Status | Meaning |
|---|---|---|
| Segment | **Primitive** | The saved query. Stateless. |
| Template | **Primitive** | The content. |
| Broadcast | **Primitive** | One-off send. |
| Automation | **Primitive** | Triggered ongoing send. |
| Trigger | **Property of Automation** | What kicks off enrollment. |
| Step | **Property of Automation** | Atomic action in the sequence. |
| Enrollment | **Runtime concept** | Per-person record of being in an Automation. |
| Recipients | Informal term | The people receiving a Message (resolved at send time). Not a primary entity. |
| Audience | **Deprecated as a primary concept** | We previously had this as a peer of Segment; it was confusing. Use "recipients" instead. |
| Message | Loose term | A piece of communication a recipient receives. Stored as a Send record at runtime. |
| Send (or Dispatch) | **Runtime artifact** | Per-recipient-per-Message record. Where engagement events attach. |
| Sender resolver | **Property of Broadcast & Automation** | Rule chain that picks the From identity. |
| Fanout rule | **Property of Broadcast & Automation** | Turns Segment matches into recipient contacts. |
| Campaign | Informal umbrella term | Either a Broadcast or an Automation. Use when context-agnostic. |

### 5.6 What "lock recipients" means and why it lives on Automation

The most common point of confusion (and what made AR feel tangled). A Segment is a *question*; the answer changes as data changes. The Automation decides **when to ask** and **what to do with people whose answer changed.**

Three enrollment policies an Automation can use:

- **At-launch only** — snapshot the Segment when the Automation goes live. Everyone currently matching gets enrolled. People who match later are ignored. (AR's "At launch.")
- **Newly-entering only** — don't enroll existing matches at launch. From now on, only people who *newly enter* the Segment get enrolled. (AR's "Future.")
- **Continuously** — at launch, enroll everyone matching. From then on, enroll anyone who newly enters. (AR's "Ongoing.")

If "lock vs live" lived on the Segment, you'd have to clone Segments to get different enrollment behaviors. It belongs on the Automation because the same Segment can drive different Automations with different policies. See conversation 2026-05-27 for the worked example.

### 5.7 PoC scope, restated under the new primitives

The four screens clients touch at PoC:

1. **Segment library** — browse PL-authored Segments. Pick one. *No client-side Segment authoring at PoC; PL writes Segments in SQL via concierge (§5.1.1 in previous version; still applies).*
2. **Template editor** — write/edit content. PL-assisted at PoC for new templates; clients can edit existing.
3. **Broadcast builder** — Segment + Template + sender + schedule → send.
4. **Automation builder** — Trigger + Segment + sender + Sequence of (Template + delay) Steps + Enrollment policy + Exit conditions → activate.

Plus a pre-send recipient verification step at both Broadcast and Automation launch.

---

## 6. Brainstorm style we're following

Modeled on Fairs.com `specs/kiosk/kiosk.md` and `specs/registrations/crm-vision.md`:
- Vision-level, not spec-level. Establishes shape so the team can talk trade-offs.
- Open with short Summary paragraph.
- Each concept gets a first-class section. Prose, not bullet-only. Bakes in decisions where they're clear; calls out trade-offs and open questions where they aren't.
- Reference companion docs by name; defer details rather than packing inline.
- Discuss conversationally first; draft prose once direction is settled.

---

## 7. Concept map

Status legend: ✅ settled · 🔄 in progress / partial · 🔲 not yet started · ⏸️ paused on external info · ❓ blocked on a prior concept · 🆕 added or changed this revision

Reorganized 2026-05-27 around the four primitives (§5). Old clusters (Segmenter, Targeting/Fanout, Engagement) dissolved; concepts redistributed into Segment / Template / Broadcast / Automation clusters. Abstraction layer (A) and PL-side annotations (N) unchanged.

### Foundational (F) — strategic decisions

| # | Concept | Status | Notes |
|---|---|---|---|
| F1 | Reach relationship | ✅ | Replace. Not extend or layer. |
| F2 | Brainstorm scope ordering | ✅ | Segment + Automation first. Template + Broadcast + Engagement details follow. |
| F3 | Two-tier AMS data strategy | ✅ | CXP abstraction layer + raw AMS preserved alongside. See §4.1–4.2. |
| F4 | Canonical field vocabulary | 🔄 | Shape sketched via state-min walkthrough; catalog hybrid. **Constraint:** date-derived canonical fields need status-guard companion (e.g., `policy.status = active`) per Marker §12.1. AR uses effective_date+300d as renewal proxy; PL currently uses renewal_date — needs reconciliation. See §4.3 + §8.2. |
| F5 | Data layer for segmentation | 🔄 | Active thread §8. Segment engine queries raw AMS jsonb + PL-side annotations + (sometimes) abstraction layer. Index/perf TBD. |
| F6 | Three-tier Segment authorship | ✅ | PL-built named (PoC), client-built simple (later), composition layered on top. **PoC delivery is concierge service-request workflow** (Marker §12.1). |
| F7 | Four primitives + vocabulary | ✅ 🆕 | Segment / Template / Broadcast / Automation as the four self-contained concepts. Audience deprecated as primary; Trigger / Fanout / Sender as properties not peers. See §5. |

### Segment cluster (SE) — the query layer

| # | Concept | Status | Notes |
|---|---|---|---|
| SE1 | Anchor entity | ✅ | Part of Segment definition — Account / Policy / Contact / Claim / Quote. Determines shape of each result row. |
| SE2 | Predicate vocabulary (tier-2 builder) | 🔲 | Operators per field type. Lower-priority for PoC since tier 1 covers most cases via PL-authored queries. |
| SE3 | Live count + sample preview | 🔲 | Two-number pattern (exact-stale + estimated-fresh) per research doc. |
| SE4 | Field discovery / mapping UI | 🔲 | "Where does this field come from in my AMS?" Trust-critical surface. |
| SE5 | Mixing PL-side annotations | 🔲 | Tags + custom fields + consent state queryable alongside canonical AMS fields. |
| SE6 | Composition (intersect / union / except) | 🔲 | Tier-3 mechanic. UI representation TBD. Language pick early: "except" vs "minus" vs "suppression." |
| SE7 | PL-built Segment library | 🔲 | Tier-1 surface. Curation, versioning, per-agency exposure model TBD. **Anti-pattern to avoid** (Marker §12.1): AR buries triggers — surface segment criteria + counts at the library header. |
| SE8 | Segment metadata (ownership, sender routing) | 🔲 | Segment can carry metadata beyond predicate: producer assignment for sender resolution (T5-style chain), owner, etc. Prospect-list pattern (Marker §12.1). |

### Template cluster (TE) — the content layer

| # | Concept | Status | Notes |
|---|---|---|---|
| TE1 | Channels | 🔲 | Email / SMS / postcard / handwritten / internal note. Different shape per channel. |
| TE2 | Merge tokens | 🔲 | References to canonical fields, sender attributes, agency branding. Fallback values for missing data. |
| TE3 | Required subject convention | 🔲 | Customer name + HawkSoft external ID in subject — operational requirement at template level per Marker §12.1 (CSR reverse-lookup workflow). |
| TE4 | Visible automation indicator | 🔲 | Color band / branded element in body so manual vs automated email is distinguishable per Marker §12.1. |
| TE5 | Carrier-approved content variants | 🔲 | Future — template tagged by carrier + LOB + expiration; blocks unapproved templates by agent appointments. Big PDF US-09. |
| TE6 | Template versioning + archive | 🔲 | When a Template is edited, what happens to in-flight Automations referencing it? Pin or auto-pick-up? |
| TE7 | Editor UX | 🔲 | Plain mailbox / HTML newsletter / SMS / postcard. Different editors per channel. AI compose/rewrite later. |

### Broadcast cluster (BR) — the one-off send

| # | Concept | Status | Notes |
|---|---|---|---|
| BR1 | Compose UX | 🔲 | Pick Segment + Template + sender + schedule. Single screen flow. |
| BR2 | Recipient resolution (fanout) | 🔲 | Default by anchor entity + account.type. Personal → household-aware; commercial → role-aware. Per-Broadcast override possible. See §9. |
| BR3 | Sender selection | 🔲 | Resolver chain: segment metadata (if list-assigned) → account producer/CSR → house team. Per-Broadcast override possible. |
| BR4 | Pre-send recipient verification | 🔲 | Reviewable list with sample + bulk-exclude. Ley Insurance commitment. Validated by Marker §12.1. |
| BR5 | Schedule (now / future) | 🔲 | Single time. Send-immediately or schedule-once. |
| BR6 | Approval mode | 🔲 | YOLO vs Outbox-approval before release. Cross-channel. |

### Automation cluster (AU) — the stateful workflow

The biggest cluster — this is where complexity lives.

| # | Concept | Status | Notes |
|---|---|---|---|
| AU1 | Entry Trigger | 🔲 | Categories: event-based (status change, new policy, claim filed); date-based (X days before/after renewal/effective/etc.); behavior-based (form submit, NPS response); manual launch; segment-entry. Each with config (offset, threshold, etc.). |
| AU2 | Enrollment policy | 🔄 | At-launch / newly-entering / continuously. The "lock recipients?" question, parameterized. See §5.6. |
| AU3 | Enrollment state (runtime) | 🔲 | Per-person record: which Automation, when enrolled, current step, next fire time, exit state. Idempotent state machine. See RT cluster. |
| AU4 | Sequence of Steps | 🔲 | Ordered list. Each Step = (step_type, payload, delay/timing). |
| AU5 | Step types | 🔲 | Send-email / send-SMS / send-postcard / send-handwritten / wait / internal-notification / branch / tag-add/remove / action-item / webhook-out. Subset for PoC: email + wait + exit. |
| AU6 | Step timing | 🔲 | Delay relative to entry or previous step. Per-step delay; absolute schedules where needed. Quiet-hours / business-hours enforcement. |
| AU7 | Branching / conditions in Steps | 🔲 | Future — if/else inside a Sequence based on engagement or data. Not PoC. |
| AU8 | Default sender resolver | 🔲 | Per-Automation chain. Resolution: segment metadata (S8) → policy producer → account CSR/AR → house team. Per-Step override possible. See §9. |
| AU9 | Recipient resolution (fanout) | 🔲 | Same options as BR2. Per-Automation, possibly per-Step override. |
| AU10 | Exit conditions | 🔲 | Rules that pull a person mid-sequence: unsubscribe, status changes, segment criteria no longer met, manual exit, custom predicate. Stop-on-reply at Step level. |
| AU11 | Re-enrollment rules | 🔲 | Can a person re-enter after exiting? When? (Never / after N days / once per trigger event / always.) |
| AU12 | Pre-launch recipient verification | 🔲 | Reviewable list of who'd be enrolled at launch. Same surface as BR4. |
| AU13 | Approval mode | 🔲 | Per-Step or per-Automation. YOLO vs Outbox-approval. |
| AU14 | Calendar-driven sub-pattern | 🔲 | Holiday calendar — pre-configured per-date templates with on/off toggles per occasion. Marker §12.1, AR pattern. |
| AU15 | Hidden-trigger anti-pattern (avoid) | n/a | Surface the entry Trigger at the Automation header always; never bury in ordered step list (Marker §12.1 observed in AR). |

### Abstraction layer cluster (A) — CXP entities for UX convenience

Tier 1 of the data strategy. Convenience-goal work — makes the platform pleasant to use across AMSes. Does NOT have to carry the Segment engine's fidelity needs.

| # | Concept | Status | Notes |
|---|---|---|---|
| A1 | Account — marketing extensions | 🔲 | Do-not-market flag, lost-customer 3-week buffer, prospect→active transitions. |
| A2 | Contact + role taxonomy | 🔲 | Primary/secondary/spouse/employee — extensible, free-text, or fixed? |
| A3 | Contact methods + channel preference | 🔲 | Multi email/phone exists; per-channel preference + marketing-vs-service designation is new. |
| A4 | Policy — marketing extensions | 🔲 | Renewal indicator surfaced, etc. |
| A5 | Carrier as entity | 🔲 | Currently text on policies. Promote for reporting, appointments, carrier-approved content. |
| A6 | Coverage / Coverage Limit | 🔲 | Required for Insurance Center's state-min-auto + $100K-home-liability — may live primarily as raw-AMS canonical fields rather than CXP entities. Reassess after F4 settles. |
| A7 | Claim | 🔲 | Needed for claims-loop automations. Could initially be canonical-field-only without a CXP Claim entity. |
| A8 | Household | 🔲 | Explicit entity vs computed grouping. Cross-household membership. Triggered by fanout rules (§9). |
| A9 | Producer / CSR assignment on Account / Policy | 🔲 | Extend ADR-0020 pattern. Sender resolution depends on it. In HawkSoft: `account_rep` + `csr_on_file` (Marker §12.1 — same person unless explicitly overridden). |
| A10 | Status & lifecycle | 🔄 | Lost-customer 3-week buffer, reinstated, prospect→active. **Critical case (Marker §12.1): Lead → Prospect transition** determines automated-nurture vs human-handoff CRM. HawkSoft API blocks PL-side Prospect writes; transition is client-manual + PL-observes-via-sync. |

### PL-side annotations cluster (N)

Data that lives on PolicyLift, not the AMS. Mixed into Segment expressions alongside canonical AMS fields (per SE5).

| # | Concept | Status | Notes |
|---|---|---|---|
| N1 | Tag | 🔄 | **TBD: AMS-tags-only vs PL-side vs both.** **Confirmed (Marker §12.1):** HawkSoft substatus editable only on Cancellation/Non-Renewed/Moved/Rejected statuses — NOT on New Business/Rewrite where Marker needed it. AMS-only fallback structurally blocked for half of real use cases. PL-side tags leading. |
| N2 | Key Fact | 🔲 | Levitate concept (typed date or info attached to a contact). Separate entity, or roll into Tag / Custom Field? |
| N3 | Custom Field | 🔲 | Agency-defined attributes. Searchable + filterable (the Lev gap). |
| N4 | Do-not-market + exclusion | 🔲 | `is_filtered` + JSON Logic exclusion rules already exist for the Reach sync. Relationship to consent + suppression in Runtime cluster (RT). |

### Runtime + cross-cutting cluster (RT)

System-generated artifacts and cross-cutting concerns. Not user-built, but central to operation.

| # | Concept | Status | Notes |
|---|---|---|---|
| RT1 | Send / Dispatch record | 🔲 | One per Message-to-recipient. Engagement events attach. Naming TBD (Send vs Dispatch). |
| RT2 | Recipient snapshot (audit) | 🔲 | Frozen list per Broadcast send or Automation enrollment cycle. For audit / attribution / "send the same people again" reuse. Not a primary entity the user builds. |
| RT3 | Engagement events | 🔲 | Delivered / opened / clicked / replied / bounced / complained / unsubscribed / stop-keyword. Stream attached to Send records. |
| RT4 | Consent layer | 🔲 | Marketing vs service-transactional split. Per-channel per-category consent records. Renewal-vs-unsubscribe footgun (Levitate anti-pattern). Suppression list at send time. |
| RT5 | AMS writeback (Activity) | 🔲 | Sends + replies posted as AMS notes per-account. HawkSoft + others. Already partial today. |
| RT6 | Reporting / Attribution | 🔲 | Engagement events; policy-level revenue attribution; producer/carrier/LOB rollups; commission-aware ROI. The big differentiator opportunity per research. |
| RT7 | Tenancy & branding | 🔲 | Multi-office, per-producer "From," per-agency brand colors and footer disclaimers, carrier appointments. |
| RT8 | Migration | 🔲 | Historical unsubscribe lists, contact data, compliance ledger. Import as Consent Records (`source=imported`) or Suppression entries? Affects audit trail. |

---

## 8. Active thread — Data layer + canonical field vocabulary

> **Paused on:** Martin's competition look at AR + Lev (full UX walkthrough, parallel to the AgencyZoom + InsuredMine deep-dives done previously for CRM/CXP). Partially supplemented by Marker onboarding call (§12.1) and segment-builder UX research (`research_segment_builder_ux.md`). Resume here when notes are in hand.

### 8.1 What's been settled in this thread (chronological)

- §4 — Two-tier AMS data strategy. CXP abstraction (tier 1, convenience) + raw AMS jsonb preserved alongside (tier 2, segmenter source-of-truth). No per-AMS shadow tables.
- §4.3 — Canonical field vocabulary as the unifying client-facing layer. Hybrid catalog (PL ships base, agencies extend). Working name.
- §5.1.1 (prior version) — Concierge service-request workflow is the PoC delivery model for tier 1, validated by Marker (§12.1).
- §5 (this version) — **Four primitives locked.** Segment / Template / Broadcast / Automation. Audience deprecated as primary concept. Trigger / Fanout / Sender / Enrollment / "lock recipients" all properties of Broadcast or Automation, not peer concepts.
- §5.6 — "Lock recipients" → Enrollment policy property of Automation (at-launch / newly-entering / continuous). Conceptually: Segments are questions, Automations decide when to ask.
- §12.1 — Marker onboarding call (2026-05-27) — first concrete client signal. Validates three-tier authorship, sharpens Lead/Prospect boundary, confirms substatus limits, adds list-with-producer + sender-resolver requirements.

### 8.2 Canonical field walkthrough — "Auto policy is at or below state minimum"

Done 2026-05-26 in conversation. Key takeaways:

**Why this one is complex (probably upper end):**
- 3 raw coverage fields (BI per person, BI per accident, PD)
- 1 state field (ambiguous: garaging / insured residence / written state)
- 1 versioned reference table (state minimums; CA went 15/30/5 → 30/60/15 in 2025)
- 1 comparison rule (≤ current minimum)

**Generalized canonical field shape (working draft):**
- `id`, `display_name`, `description`, `category`
- `entity` (account | contact | policy | claim | quote | ...)
- `cardinality` (single | many)
- `type` (boolean | number | currency | date | string | enum) + `domain`
- `source`: either `raw` with `per_ams_resolutions` map, or `computed` with `depends_on` + `reference_data` + `formula`
- `predicates` (which operators apply)
- `availability_summary` (% of agency's accounts that can resolve this)
- `status_guard` (optional — companion predicate for date-derived fields per Marker §12.1)

**Open questions surfaced:**
1. Where does the per-AMS resolution function live? Code / config registry / expression language / SQL view per AMS?
2. Catalog versioning — reference tables change, AMS schemas drift; how do old Segments stay interpretable?
3. Agency-authored canonical fields — authoring UX + who owns per-AMS resolution?
4. Composite vs atomic granularity.
5. "Same field across AMSes" definitional precision (Katz Eclipse pre-populates next term 60d early; AR uses effective_date+300d to sidestep).
6. Quantifier defaults for many-cardinality fields.

### 8.3 Questions to settle next in this thread

Listed roughly by load-bearing-ness:

1. **More canonical field examples** — "Policy renewing in N days" (simple but tests per-AMS renewal/expiration weirdness), "Primary contact email" (multi-cardinality + Katz Eclipse rules), "Account total premium" (denormalization + current-vs-sum-of-active), "Customer status = active" (AMS-specific enum mapping), "Account is Lead vs Prospect" (Marker §12.1).
2. **Canonical field catalog seed** — 30–50 fields a base PL catalog might ship.
3. **Composition mechanics** (SE6) — set operators, UI, naming ("except" / "minus" / "suppression").
4. **PL-built Segment library exposure model** (SE7) — auto-share per-AMS / per-agency opt-in / catalogued.
5. **Resolution function location** — open question #1 from §8.2.
6. **Recipient verification UX** (BR4 / AU12).
7. **PL-side annotations + AMS fields in one expression** (SE5).
8. **Catalog versioning** (open question #2 from §8.2).
9. **Sender resolver design** (BR3 / AU8) — chain, per-Campaign overrides, preview at verification time.
10. **Enrollment state shape** (AU3) — schema for the per-person workflow state.

### 8.4 What Martin will look at in competition

Full UX walkthroughs of AR + Lev. Angles weighted by what matters for the new direction:

- **Segment builder UX** — predicate vocabulary, AND/OR composition, live count, AMS field surfacing
- **Recipient verification** — review step before send. Per-recipient overrides? Comments?
- **Field discovery / mapping** — how do users understand where a field comes from in their AMS?
- **Heterogeneous-AMS handling** — when a field isn't available on a particular AMS, what does the UI do?
- **Automation builder UX** — step types, branching, enrollment policy surface, exit conditions
- **Account/Contact model** (secondary) — primary entity, role taxonomy, multi-account membership
- **Concierge / service-request workflow** — how configurable is the client side without dev help?

### 8.5 What Claude can do while you investigate

- **Work more canonical field examples** (§8.3 #1) — test the shape further.
- **Read more CXP code** — surface what current upsert/merge logic implies about AMS-as-SoT.
- **Ground-truth the HawkSoft state-min example** — confirm coverage data shape; write a real resolution.
- **Sketch a canonical-field catalog seed** (§8.3 #2).
- **Build the clickable HTML proto** from CXP pages once Martin saves them.

### 8.6 Restart prompt when you come back

> "Here's what AR / Lev look like at full UX-walkthrough depth. Their Segment builders work like [X], their Automation builders like [Y], their recipient verification is [Z]. Here's what I think PolicyLift's answer should differ on. Now let's drill into [canonical field examples / catalog seed / composition mechanics / verification UX / enrollment state shape]."

---

## 9. Recipient resolution + Sender resolution (properties shared by Broadcast & Automation)

> Both Broadcast (BR2/BR3) and Automation (AU8/AU9) carry these. Captured here once, referenced from both clusters.

### 9.1 Recipient resolution (fanout)

A Segment resolves to records of an anchor entity. Recipient resolution turns those records into actual contact-method targets.

**Proposed options:**
- **One per Household** — default for personal-lines marketing. Picks the household's preferred contact. Requires Household concept (A8).
- **One per Account, primary contact** — Lev default. Safe fallback before Household exists.
- **One per Account, contacts with role X** — commercial-friendly.
- **One per matching Policy, named-insured contact** — Policy-anchored Segments.
- **One per matching Contact directly** — Contact-anchored Segments.

**Per-account-type defaults:**
- `account.type = personal` → household-aware (after Household exists; primary-contact-only before)
- `account.type = commercial` → role-aware

These are defaults; per-Broadcast/Automation override possible.

### 9.2 Sender resolution

**Resolution chain (most specific → most general; first match wins):**
1. **Segment metadata** (SE8) — e.g., prospect list has explicit producer assignment
2. **Policy-level assignment** — if Segment is Policy-anchored and the policy has a producer
3. **Account-level assignment** — `account.csr_on_file` or `account.account_rep` depending on automation/broadcast type
4. **Campaign-level fallback** — house mailbox, "team," or configured agency default

**Concrete cases from Marker §12.1:**
- Renewal Automation → CSR on file
- Relationship Automation → Producer / Account Rep
- Cancellation Automation → CSR on file
- Prospect-list Broadcast → list-assigned producer (SE8 metadata)
- House-account → team mailbox

**Open questions:**
- Per-Step override within an Automation — is the sender per-Automation, or can a Step pick its own?
- Preview at recipient verification (BR4 / AU12) — show "This Message will be from [X]" per row.
- Multi-office tenancy (RT7) interaction.

### 9.3 What this drags in

- **Household (A8)** quietly becomes first-class the moment "one per household" is the default for personal-lines.
- **Channel preference (A3)** — which contact-method when fanout picks a contact? Per-Broadcast/Automation override possible.
- **Suppression interaction** — fanout produces recipients; suppression (RT4 consent layer) filters them. Recipient verification (BR4 / AU12) is where this is visible.

---

## 10. Cross-cutting threads (not yet discussed)

Surfaced for completeness; left for later sections of the brainstorm. Mostly mapped to RT cluster items.

- **Consent model** (RT4) — marketing vs service-transactional split; channel-native per-category consent records; how Reach hands off compliance state at migration.
- **Attribution model** (RT6) — policy-level revenue attribution with configurable lookback, multi-touch weighting, producer/carrier rollups, commission-aware ROI.
- **Tenancy / multi-office** (RT7) — per-office sender identity, per-producer "From," per-agency brand colors, carrier appointments as gates.
- **Migration** (RT8) — historical unsubscribe lists, contact data, compliance ledger.
- **Carrier co-op / proof-of-performance reporting** — data shape for carriers reimbursing campaigns.

---

## 11. Customer commitments (default-in unless explicitly de-scoped)

Pulled from `client_feedback.md` plus live onboarding signal (§12). These are scope inputs, not concept questions.

| Customer | Commitment | Concept area(s) |
|---|---|---|
| The Insurance Center | Identify auto policies with state-minimum limits + send "limits increasing at renewal" campaign | Segment (SE) + canonical field (F4) — walkthrough §8.2 |
| The Insurance Center | Identify home policies with only $100K liability + recommend $300K–$500K | Segment (SE) + canonical field |
| Marker Insurance | Custom tags for clients (e.g., home inspection drip stops on substatus change in HawkSoft) | PL-side tags (N1) — AMS fallback blocked per §12.1 |
| Marker Insurance | Cancellation Automation live by Fri 2026-05-29 — 3-email sequence on `status = pending cancellation`; CSR as sender; HawkSoft ID in subject | Automation (AU1 trigger + AU4 steps + AU8 sender) + Template (TE3) |
| Marker Insurance | Welcome Kit + Renewal Automations in ~2 weeks | Automation (AU) + canonical "Policy renewing in N days" with status guard (F4) |
| Marker Insurance | Prospect-list ingestion with per-list producer assignment; emails from list sent by that producer | Segment metadata (SE8) + sender resolver (§9.2) |
| Marker Insurance | Sender per campaign type (Renewal → CSR; Relationship → Producer; Prospect-list → list producer; House → team) | Sender resolver (§9.2) |
| Marker Insurance | Subject line includes customer name + HawkSoft external ID | Template convention (TE3) |
| Marker Insurance | Visible automation indicator in email body | Template convention (TE4) |
| Marker Insurance | Replies visible in HawkSoft activity stream per-account | AMS writeback (RT5) |
| Marker Insurance | Holiday calendar — pre-configured per-date templates with on/off toggles | Automation sub-pattern (AU14) |
| Marker Insurance | Concierge service-request workflow as near-term mode | PoC delivery (§5.7 + F6) |
| JAMCO | Aggregated policy emails for same-date home + auto on one account | Segment + recipient resolution (§9.1) |
| JAMCO | Custom sender per touch (agent on policy, producer/CSR on customer) | Sender resolver (§9.2) |
| JAMCO | Renewal emails removed from campaign once policy renews | Automation exit conditions (AU10) |
| Ley Insurance | Manual recipient review before campaign send | Recipient verification (BR4 / AU12) |
| Katz Insurance | NASA Eclipse field-level requirements | Per-AMS canonical field resolutions (F4) |

---

## 12. Client signal — observed patterns from real onboardings

> **Purpose:** Distilled patterns from real client onboarding calls where PolicyLift was the vendor. Separated from research/competitor analysis to keep client voice undiluted. Add new entries as new transcripts come in.

### 12.1 Marker Insurance — Kim — 2026-05-27 onboarding

66-min onboarding call between Kim (Marker), Alex Kumamoto (PolicyLift), Javier Salazar (PolicyLift). Marker is transitioning from Agency Revolution to PolicyLift; AR access expires 2 days after the call. Source: `fathom.video/calls/687681734`.

**Patterns observed:**

- **Three-tier authorship validated in client voice.** Kim's mental model: "tell PolicyLift what to do via service request; get a Loom or link to approve; eventually self-serve." Alex explicitly told her: "We feel the system we have built today handles email, but there is a level above what we are doing that we want to be able to deliver to you that is going to require us to revamp the system." Self-serve timeline communicated: "two to eight to ten weeks." Concierge workflow endorsed: "I would like to move with that methodology for now."

- **Lead vs Prospect as the load-bearing state boundary.** Kim's framing:
  - **Lead** = automated, no human touch ("uploaded 3000 emails, you slowly qualify them in the background")
  - **Prospect** = manual state change in HawkSoft, human handoff to producer
  - Determines which world a contact lives in (marketing-automation vs lifecycle CRM). Segmentation-load-bearing.
  - **Constraint:** PL can't write Prospect to HawkSoft today; transition is client-manual, PL observes via sync.

- **Lists-with-assigned-producer is a real workflow.** Kim uploads prospect lists (e.g., "J-Lo Pull Along"), tags them in HawkSoft, **assigns a producer at the list level**. All emails from that list go from that producer. House accounts → team mailbox. The Segment carries metadata beyond predicates (SE8). Tags observed: FL (Florida), HVHC (Office Leads), JC (Jewish Clients — for holiday-card targeting), HC (Holiday Cards), Contractors, Inspections, Any Lab Test Now.

- **Sender resolution is multi-level by Automation/Broadcast type:**
  - Renewal Automation → CSR on file
  - Relationship → Producer / Account Rep
  - Cancellation → CSR on file
  - Prospect-list Broadcast → list-assigned producer
  - House-account → team mailbox
  - In HawkSoft, `account_rep` and `csr_on_file` are usually the same person unless explicitly overridden.

- **HawkSoft substatus has hard limits PolicyLift can't fix.** Kim wanted to use substatus for inspection tracking. Substatus is editable only on Cancellation / Non-Renewed / Moved / Rejected — NOT on New Business or Rewrite. External HawkSoft API limitation. AMS-only-tagging fallback structurally blocked. PL-side tags (N1) leading.

- **Renewal date vs effective date is a real canonical-field problem.** Alex on the call: "different agencies represent the renewal date differently... I've noticed that's inconsistent." AR uses **effective_date + 300 days** as a renewal proxy. PL currently uses renewal_date directly.

- **"Policy in force" is a required predicate companion.** Kim demonstrated: when a policy is canceled, expiration_date disappears or becomes wrong while other date fields persist. Any renewal-date-based Automation needs `status = active` as a guard. Canonical fields that derive from dates should specify the status guard explicitly.

- **Subject-line conventions are required, not optional.** Customer name + HawkSoft external ID in subject. Reason: when a customer calls in confused, CSR pulls the ID from the subject header and looks them up in HawkSoft. Template-level operational requirement (TE3).

- **Visible automation indicator in body.** Kim: "something on the email that's different than the emails we send out manually... so when a customer calls and says 'I got this email,' we can ask 'is this there?'" — a color band, branded element, watermark. Trust convention (TE4).

- **Reply visibility in HawkSoft activity stream.** Kim references this as already-expected behavior: "you're putting these emails into Hawksoft." AMS writeback flow (RT5).

- **Holiday calendar pattern.** AR ships a pre-configured per-date template list with on/off toggles per occasion. Set-and-forget. Automation sub-pattern (AU14).

- **AR's "hidden trigger" anti-pattern.** Kim and Alex spent ~5 min on the call hunting for what triggered a sequence — buried in an ordered step list, not at the campaign header. Active anti-pattern to avoid (AU15).

- **Concierge service-request workflow IS the PoC delivery model.** Kim explicitly endorsed it: "you send them an email with a service... they return you a Loom video... or a link that it's done and you just approve it. I would like to move with that methodology for now." Alex committed accordingly. See §5.7.

- **Specific Marker commitments from this call:**
  - **Cancellation Automation live by Friday 2026-05-29** (2 days from call)
  - **Welcome Kit + Renewal Automations live in ~2 weeks**
  - **NPS + Google Review can lag** a week or two
  - **Prospect-list ingestion + nurture** as the bigger ask (top-of-funnel)

- **PolicyLift gap candidly acknowledged in client conversation.** Alex was open with Kim that the configuration tooling isn't ready: "our tooling for you to go and investigate the back office pipeline yourself today is not where it needs to be... we want to build the version of this that will get you your own ability to go and investigate yourself over the next, you know, two to eight to ten weeks." Kim was OK with this and explicitly chose PolicyLift because the team is "young people that want to get into an industry... going to be driven to success." Trust based on honesty, not feature parity.

---

## 13. Reference

### Local files (this folder)

- [`segments.md`](segments.md) — companion doc, the Segment primitive in full detail (non-technical → implementation details)
- [`templates.md`](templates.md) — companion doc, the Template primitive in full detail (non-technical → implementation details)
- [`broadcasts.md`](broadcasts.md) — companion doc, the Broadcast primitive in full detail (non-technical → implementation details)
- [`automations.md`](automations.md) — companion doc, the Automation primitive (short / starter version; implementation details deferred)
- [`dynamic-content.md`](dynamic-content.md) — cross-cutting companion doc: rendering related data (filtered child collections) into a message — the "list of renewing policies" problem
- [`changelog.md`](changelog.md) — running narrative log of brainstorm decisions, doc restructures, research, client signal
- [`research_segment_builder_ux.md`](research_segment_builder_ux.md) — segment builder UX patterns across ~15 products (2026-05-26)
- [`client_feedback.md`](client_feedback.md) — feedback from 5 named clients
- [`data_object_map.md`](data_object_map.md) — full data object hierarchy (2026-05-25, predates this brainstorm)
- [`research_feature_list.md`](research_feature_list.md) — full feature inventory with empty Scope columns (2026-05-25)
- [`email_automation_system_requirements.md`](email_automation_system_requirements.md) — outline-level requirements
- `Agency Revolution vs Levitate_ Engineering-Grade Platform Teardown.pdf` — 38 pp deep teardown
- `Engineering Teardown of Agency Revolution and Levitate for Independent P&C Insurance Agencies-2.pdf` — 17 pp

### Planned reference artifact

- **Clickable HTML proto of the current CXP platform** — Martin saves the current platform's HTML pages; Claude rebuilds as simple clickable proto with chrome for headers/footers/nav. Same pattern as Fairs proto work.

### PolicyLift codebase docs (`../policylift/docs/`)

- `cxp/README.md` — entry point
- `cxp/data-model.md` — account/contact/policy schema
- `cxp/sync/architecture.md` — AMS sync pipeline
- `cxp/sync/<ams>.md` — per-AMS sync details
- `cxp/reach/data-model.md` — the Reach integration being replaced
- `adr/0007-account-interaction-associations.md` — account_calls / account_chats / account_appointments
- `adr/0020-entity-assignment.md` — per-entity user junction tables
- `adr/0003-use-resend-for-receiving-emails.md` — inbound email infra
- `adr/0008-data-source-tracking.md` — source-of-truth foundations

### PolicyLift codebase code

- `src/server/accounts/service.ts` — upsert + merge logic
- `src/server/accounts/reach/adapters/<ams>/service.ts` — AMS-specific transforms
- `src/lib/constants/reach.ts` — Reach schema definitions (the shape being replaced)
- `src/server/integrations/hawksoft/` — HawkSoft Client schema

### Fairs.com brainstorm-style references (`../Nexa/Fairs/fairscom/product/specs/`)

- `kiosk/kiosk.md` — vision-doc exemplar
- `kiosk/design-session-notes.md` — working-doc exemplar
- `registrations/crm-vision.md` — vision-doc with blocks + cross-cutting + entity reference

### Prior CRM/CXP UX deep-dives (Martin)

- **AgencyZoom** — done, lives in (location TBD)
- **InsuredMine** — done, lives in (location TBD)
- **Agency Revolution** — to do, this brainstorm
- **Levitate** — to do, this brainstorm

### Client onboarding transcripts (Fathom)

- **Marker Insurance — Kim — 2026-05-27** — `fathom.video/calls/687681734` (66 min); distilled in §12.1

---

*Doc-level changelog lives in [`changelog.md`](changelog.md). Reverse-chronological, narrative entries tagged `[brainstorm]` · `[docs]` · `[research]` · `[client-call]`.*
