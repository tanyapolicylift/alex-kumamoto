# Templates

**Status:** Companion doc to [`concepts_working_doc.md`](concepts_working_doc.md). Permanent home for the Template primitive — what it is, what differs per channel, how merge tokens work, how agency branding flows through, and how it's implemented under the hood. Non-technical readers can stop at "Implementation details"; everything before that is plain-language.

**Created:** 2026-05-27

**Related:** [`concepts_working_doc.md`](concepts_working_doc.md) · [`segments.md`](segments.md) · [`changelog.md`](changelog.md)

---

Once you know *who* you're sending to (a Segment), you need to know *what* you're sending. A **Template** is the saved content of a message — the email body, the SMS text, the postcard layout. Templates are reusable: the same "Renewal reminder" template gets used by the Renewal Automation, by the occasional one-off Broadcast to a specific customer, and by the welcome-back campaign for reinstated customers. Build it once, reference it many times.

Templates are deliberately *just the content*. They don't know who they're being sent to, who they're being sent from, or when they're going out. All of that is the Broadcast's or Automation's job. A Template is content + merge tokens + channel-specific format, and nothing else.

This sounds simple until you realize that "the content" looks completely different per channel — a thousand-word HTML email with images and a footer doesn't translate to a 160-character SMS, which doesn't translate to a postcard with a graphic on one side and an address block on the other. Templates are unified in concept but channel-specific in editor and validation.

---

## What a Template is

A Template has four parts that matter to the people using it:

- **A name and description.** "Renewal reminder — 30 days out" — short enough to scan in the library, clear enough to know what it does without opening it.
- **A channel** — email, SMS, postcard, or handwritten card. Set when the Template is first created, doesn't change. Determines what kind of editor opens when you click in, what validation runs, and which channels of a Campaign can use it.
- **The content** — the body of the message, in the shape that channel needs. Plus channel-specific extras (subject line for email, address block for postcards).
- **Merge tokens** — placeholders for data that varies per recipient (`{first_name}`, `{policy.renewal_date}`, `{agency.phone}`). These get filled in at send time from the recipient's data.

A Template is stateless. It doesn't store who's received it or when. Send records (covered elsewhere) are the runtime artifact that tracks "Template X was sent to Recipient Y at time Z." The Template itself just sits in the library.

---

## Channels — what's different, what's the same

PolicyLift will eventually support four channels. Each has different content shape, editor, validation, and send mechanics. But the *concept* of a Template — a reusable named piece of content with merge tokens — is the same across all of them.

### Email — the primary channel

Email is the default and the most-used channel. What an email Template carries:

- **Subject line** — short, with merge tokens (often required by agency convention; see below)
- **Body** — rich text or simple HTML, with images, links, headings, lists, signature blocks
- **Preview text** — optional, the snippet shown in inbox previews before the recipient opens
- **Plain-text fallback** — auto-generated from the rich content for deliverability + accessibility

Editor expectations: WYSIWYG-style rich text editor with image insertion, link insertion, merge-token picker, "send test to self" affordance, mobile + desktop preview, dark-mode preview. Standard email-marketing tool surface.

### SMS — the short-and-direct channel

SMS Templates are simpler in structure but operationally more constrained. What an SMS Template carries:

- **Body text only** — no subject, no formatting, no images
- **Per-segment character count** — tight visible counter (160 chars per segment; multi-segment messages cost more and may arrive out of order)
- **Required compliance text** — "Reply STOP to unsubscribe" patterns, opt-in disclosure if relevant

Editor expectations: simple text field with visible character + segment counter, merge-token picker (with warnings if tokens would push the message over a segment boundary), URL shortener for any links (to save characters), preview.

Whether SMS ships in PoC is TBD. Email-only PoC covers most stated customer needs (Marker's cancellation + welcome + renewal automations); SMS is a 10DLC-registration project on top of the Template work plus per-agency provisioning.

### Postcard — the print-and-mail channel

Postcard Templates are layout-driven, not text-driven. What a postcard Template carries:

- **Front design** — typically image + headline
- **Back content** — message body + address block (recipient + return) + postage indicia area
- **Paper size / format** — usually fixed (e.g. 4×6 or 6×9)

Editor expectations: layout designer with image upload, drag-and-drop text blocks, address-block enforcement (must include recipient + return address with valid postal codes), image-DPI validation (low-res images print badly).

Postcards are post-PoC. They depend on a print-partner integration (Lob, PostGrid, similar).

### Handwritten card — the personal-touch channel

Handwritten card Templates are the rarest and most expensive ($4–$5 per send via partners like Lev's). What they carry:

- **Body text** — short, written-by-machine-but-looks-human
- **Handwriting style** — picked from a set offered by the partner
- **Signature** — usually a specific person's actual handwriting (sourced once, applied per send)
- **Paper / card style** — sometimes configurable

Editor expectations: text field with character limit (cards are small), handwriting style picker, signature picker, paper picker if configurable. Editor is largely a configuration form, not a layout designer.

Also post-PoC, also a partner integration.

### What's the same across all channels

These properties apply to every Template regardless of channel:

- **Name, description, category** — for organizing the library
- **Status** — Draft / Active / Archived. Drafts can't be used by Campaigns until they're Active.
- **Merge tokens** — same token vocabulary (canonical fields), filtered by what's reasonable per channel (a 50-word `{policy.coverage_description}` token doesn't go in an SMS)
- **Required conventions** — agency-specific enforced patterns (see below)
- **Reuse semantics** — every Template is referenced by zero, one, or many Broadcasts and Automations
- **Cloning** — duplicate to start a variant
- **Audit log** — who edited when

---

## Merge tokens — making content per-recipient

A merge token is a placeholder in the Template content that gets replaced with recipient-specific data at send time. `Hi {first_name},` becomes `Hi Sarah,` for Sarah and `Hi Mike,` for Mike.

The tokens available to a Template come from the same vocabulary the Segment builder uses — canonical fields plus a few Template-specific extras.

Categories of tokens:

- **Recipient — contact level.** `{contact.first_name}`, `{contact.last_name}`, `{contact.email}`, `{contact.birthday}`
- **Recipient — account level.** `{account.name}`, `{account.account_rep}`, `{account.csr_on_file}`
- **Recipient — policy level (only when the Campaign is policy-anchored).** `{policy.number}`, `{policy.renewal_date}`, `{policy.carrier}`, `{policy.premium}`, `{policy.type_display}`
- **Sender.** `{sender.name}`, `{sender.email}`, `{sender.phone}`, `{sender.signature_block}` — resolved against whoever the sender resolver picks at send time
- **Agency / Office.** `{agency.name}`, `{agency.logo_url}`, `{agency.phone}`, `{agency.footer}`, `{agency.unsubscribe_link}`, `{office.address}`
- **External IDs (for operational use).** `{policy.hawksoft_external_id}` — important for Marker's CSR-reverse-lookup pattern (subject lines reference this)

### Fallback values for missing data

What happens when a token references data that doesn't exist for a particular recipient? Three options the system should support:

- **Default fallback.** `{first_name|"there"}` — if `first_name` is null, render "there." Standard pattern across email tools.
- **Skip the recipient.** Some tokens are critical enough that sending without them is worse than not sending. The recipient is excluded from this send with a reason ("missing policy.renewal_date").
- **Render as bracketed placeholder.** `[customer]` — useful when previewing a Template against a recipient with incomplete data. Not used in production sends.

Default behavior: empty-string fallback if no explicit default is given, with a pre-send warning if any recipient would have a critical token missing. Aggressive policies (skip / placeholder) are post-PoC.

### Tokens that depend on the Campaign's anchor

Some tokens only make sense in specific Campaign contexts. A Template can reference `{policy.renewal_date}` and still be valid — but if it gets used by an Account-anchored Campaign, the system has to decide which policy's renewal date to merge (probably "the policy that caused the match" via Segment metadata, or the soonest-renewing active policy as a fallback).

This coupling between Template tokens and Campaign anchor is real. Worth being explicit about: a Template *can* require a specific anchor (e.g. "this template only makes sense for Policy-anchored Campaigns"), or it can be anchor-agnostic with smart defaults for resolving collection tokens.

PoC simplification: Templates declare which anchor(s) they expect. If a Campaign with the wrong anchor tries to use a Template, the system shows a clear error.

---

## Required conventions — operational rules at template level

Some content patterns aren't optional for some agencies. They're operational requirements that have to be enforced at the Template level, not left to individual senders to remember.

The canonical example from Marker (§12.1 of `concepts_working_doc.md`):

- **Email subject line must include both customer name and HawkSoft external ID.** Reason: when a customer calls in confused about an email they received, the CSR pulls the ID from the subject header and looks them up immediately in HawkSoft. Without this convention, the CSR has to ask the customer to identify themselves, slowing every support call.
- **Email body must include a visible automation indicator.** Reason: when a customer calls and says "I got this email," the CSR can ask "does it have the orange band at the top?" If yes, it's an automation; if no, it's a real one-to-one send. Lets CSRs disambiguate fast.

How conventions should work:

- **Each agency declares its required conventions** in agency settings — a list of rules like "all email subjects must include `{contact.first_name}` AND `{policy.hawksoft_external_id}`."
- **Enforced at Template save time.** The editor surfaces missing required tokens before letting the user save. Clear messages: "This template's subject is missing `{policy.hawksoft_external_id}` which is required by your agency settings."
- **Can be soft or hard.** Soft = warning, can save anyway. Hard = blocking, can't save. Agency picks.

For PoC: hard-code Marker's specific rules; generalize to a per-agency rule list when a second agency wants different conventions.

This is the same pattern as canonical fields — start concrete for one agency, abstract when a second agency forces it.

---

## Brand assets — agency-level, inherited by Templates

Templates don't carry agency logos, brand colors, or footer disclaimers directly. Those live one level up — on the Agency (or Office, for multi-office setups).

A Template references brand assets via tokens:

- `{agency.logo_url}` — the agency's logo image
- `{agency.primary_color}` — the agency's brand color (for header bars, button backgrounds, etc.)
- `{agency.footer}` — the standard footer block (legal address per CAN-SPAM, unsubscribe link, "you're receiving this because..." copy)
- `{office.address}` — for multi-office agencies, the relevant office's physical address

When a Template is rendered for a send, these tokens are resolved against the agency's settings. If an agency updates its logo, every Template that references `{agency.logo_url}` automatically uses the new logo on the next send — no Template editing needed.

Some Templates need to override brand defaults. Carrier-approved content with a different brand, for example. Templates can override agency defaults by hardcoding values, or by referencing alternate token sets (`{carrier.logo_url}` instead of `{agency.logo_url}`).

Carrier-co-op content + brand override is post-PoC. PoC: every email uses the agency's brand, no overrides.

---

## Templates as library items — reuse and editing

A Template is a library item, not a one-off content blob copied into each Campaign. The same "Renewal reminder — 30 days out" Template is referenced by multiple Automations (one per LOB, say), each one of those Automations has its own enrollment + sequence + sender + cadence, but they all merge from the same content body.

What this enables:

- **Edit once, propagates everywhere.** When the renewal-reminder copy needs updating, you edit it in one place and the next send from every consuming Campaign uses the new content.
- **Consistent brand and tone** — agency staff don't accidentally drift content because copy-paste went wrong.
- **Versioning awareness** — agencies that care can see "this Template is used by N Campaigns" before editing.

What it implies:

- **Edits to a Template affect all in-flight Campaigns** that reference it (unless they're explicitly pinned). This is sometimes desirable, sometimes scary.
- **Soft-delete only.** A Template that's referenced by any Campaign can't be hard-deleted — only archived. Archived Templates stop appearing in pickers but continue to work for already-configured Campaigns.

### Versioning — what changes when

For PoC, edits propagate immediately. No version pinning. There's an audit log (who edited what, when), and the editor warns "This template is used by 3 active Automations — your changes will take effect on the next scheduled send."

Beyond PoC, when a customer is sensitive to drift (Marker is the prototypical case — she wants to know what's going out), Templates get explicit versioning:

- Each save creates a new version with timestamp + author
- Campaigns either pin to a version ("send v3 forever, ignore future edits") or auto-follow ("send whatever the latest version is, get edit notifications")
- Default is auto-follow; agencies opt individual Campaigns into pinning

---

## Where Templates fit alongside other concepts

A Template is one of [the four primitives](concepts_working_doc.md). The non-overlaps:

- **Templates don't know who they're being sent to.** Recipients are the Broadcast's or Automation's concern, resolved from a Segment + fanout rule.
- **Templates don't know who they're being sent from.** Sender is resolved at send time by the Broadcast or Automation. Templates can declare expectations via tokens (`{sender.name}`) but don't pick the actual identity.
- **Templates don't know when they go.** Schedule (Broadcast) and trigger + timing (Automation) live one level up.
- **Templates aren't channel-bridging.** A single Template is one channel only. To send the same content via email AND SMS, you build two Templates (one per channel) — possibly sharing a name prefix to indicate they're a "family." (Cross-channel families are a future affordance, not a primitive.)
- **Templates don't carry tracking.** Engagement events (opens, clicks, replies, bounces) attach to Send records, not to Templates. A Template's "performance" is computed by aggregating its Sends.

These boundaries are why Templates can be reusable. The moment you couple a Template to a specific Campaign or recipient or sender, it stops being reusable.

### Cross-cutting touchpoints

Templates do *touch* most other concepts, even if they don't *contain* them:

- **Merge tokens reference canonical fields** — same vocabulary that Segments query against. Both Template authoring UX and Segment authoring UX need a unified picker.
- **Templates appear in Broadcast and Automation builders** as the "what gets sent at this step" choice. The picker filters by channel + status + (eventually) anchor compatibility.
- **Templates participate in audience verification** — the pre-send review screen renders the Template against each recipient so reviewers can see what each person will actually receive.

---

## Implementation details

The technical side of how Templates work in the system. Non-technical readers can stop here; everything below is for engineering reference.

### PoC: schema

One `templates` table with a `channel` discriminator:

```
templates
├── id                       uuid
├── name                     text
├── description              text
├── category                 text                  -- "Renewal" / "Welcome" / "Cross-sell" / ...
├── channel                  text                  -- 'email' (PoC); 'sms' / 'postcard' / 'handwritten' later
├── status                   text                  -- 'draft' / 'active' / 'archived'
├── agency_id                uuid                  -- always agency-scoped (no global templates at PoC)
├── content                  jsonb                 -- channel-specific structured content
├── tokens_used              text[]                -- denormalized list of merge tokens referenced; for picker filtering
├── expected_anchors         text[]                -- optional: 'account' / 'policy' / 'contact' (which Campaign anchors this works with)
├── conventions_satisfied    boolean               -- cached check against agency's required-conventions config
├── created_by / created_at / updated_by / updated_at
```

The `content` column shape varies by channel:

```json
// email
{
  "subject": "Your {policy.type_display} renewal — {policy.hawksoft_external_id}",
  "preview_text": "Time to review your coverage",
  "body_html": "<html>...</html>",
  "body_text": "...auto-generated plain-text fallback...",
  "attachments": []
}

// sms (when added)
{
  "body": "Hi {first_name}, your {policy.type_display} renews on {policy.renewal_date}. Reply STOP to unsubscribe."
}

// postcard (post-PoC)
{
  "front": { "image_url": "...", "headline": "..." },
  "back": { "body": "...", "address_block": "auto" }
}
```

This keeps one table, one Drizzle entity, one set of CRUD endpoints. Editor UX is per-channel and lives in app-layer code.

### PoC: merge-token rendering

A render pipeline takes (Template, recipient context, sender context, agency context) → rendered Message:

1. Pull the recipient's data — contact, account, optionally policy (depending on Campaign anchor)
2. Pull the sender's data — from the sender resolver
3. Pull the agency's data — branding, footer, unsubscribe link
4. Walk the Template's content, substitute each `{token}` reference with the resolved value, applying any fallback
5. Run plain-text auto-generation for the email body (if `body_text` is empty)
6. Return the rendered Message

Token catalog is hardcoded at PoC. Beyond PoC, the catalog is derived from the canonical field catalog plus a fixed set of Template-only tokens (sender / agency / office).

### PoC: convention enforcement

Single agency-config table or jsonb column on `agencies`:

```
agency_settings.template_conventions
{
  email: {
    required_subject_tokens: ["contact.first_name", "policy.hawksoft_external_id"],
    required_body_elements: ["automation_indicator"]
  }
}
```

Save-time validation reads the agency's settings, parses the Template content for required tokens, and either warns or blocks based on severity. PoC: hardcoded Marker rules + this generalized hook for when a second agency needs different rules.

### PoC: editor (email-only)

App-layer rich-text editor (likely Tiptap or similar) with:

- Subject + body fields
- Merge-token picker (popover with categorized list, search, click-to-insert)
- "Send test to self" affordance with chosen recipient context
- Mobile + desktop preview
- Save / Save and use in Campaign
- Required-convention warnings inline

Plain-text fallback is auto-generated on save; not exposed for editing at PoC.

### Beyond PoC: versioning

Add a `template_versions` table:

```
template_versions
├── id                   uuid
├── template_id          uuid
├── version_number       int                   -- 1, 2, 3, ...
├── content              jsonb                 -- snapshot of content at this version
├── changed_by           uuid
├── changed_at           timestamptz
├── change_summary       text                  -- optional, freeform note
```

Each save adds a row. Campaigns either pin to a version (`campaign.template_version = "fixed:42"`) or auto-follow (`"latest"`).

When a Template is edited and any consuming Campaign auto-follows, the system surfaces a notification: "Your Renewal Automation is using v3 of this Template; the next scheduled send will use v4."

### Beyond PoC: per-channel content tables

If the JSONB content column becomes painful to query (e.g. wanting to grep all templates that reference a specific token across many agencies), split into per-channel tables: `email_template_content`, `sms_template_content`, etc., joined to the parent `templates` row 1:1. Probably not needed before scale.

### Beyond PoC: snippets / partials

Reusable building blocks (standard signature, standard product-disclosure block, standard CTA box). A snippet is a mini-Template that gets embedded into other Templates via `{include:standard_signature}`-style references.

Useful when agencies have boilerplate that needs to be identical across many Templates and might change centrally over time.

### Beyond PoC: SMS / postcard / handwritten editors + send mechanics

SMS adds 10DLC registration flow, per-segment character counting, URL shortening, STOP/HELP automation. Per-agency phone number provisioning is an operational project on top of the Template work.

Postcard + handwritten add print-partner integration (Lob / PostGrid / similar), address validation, image DPI checks, per-piece cost accounting.

### Beyond PoC: AI compose / rewrite

Industry standard (Lev, Klaviyo). LLM-backed assistance to draft initial content, rewrite for tone or length, translate to other languages. Useful but not foundational; trivially layerable on top of the Template editor once it exists.

### Beyond PoC: approval workflow

Some compliance-heavy use cases want Template-level approval before a Template can be used in any Campaign: Draft → Submitted → Reviewed → Approved → Active. Distinct from the per-Broadcast send-time approval (the Outbox concept). Layered on the Template status field with extra states.

---

## Open questions

1. **Channels for PoC — email only, or email + SMS?** Lean: email only. SMS is a 10DLC registration + per-agency provisioning project that competes for engineering time. Email-only covers Marker's stated needs (cancellation + welcome + renewal automations) and gets us to client onboarding fastest. Revisit if a client absolutely needs SMS at PoC.
2. **Merge token system — when to formalize.** Tied to canonical field catalog timing (see `segments.md` and `concepts_working_doc.md` §4.3). PoC can hardcode the token vocabulary. The right time to formalize is when client-authored Templates ship (tier 2 builder side) — same trigger as for Segments.
3. **Required conventions — per-agency rule list vs hardcoded.** Hardcode Marker's rules at PoC; build the general per-agency-rule system when agency #2 needs different conventions.
4. **Anchor expectations on Templates.** Should a Template explicitly declare which Campaign anchors it can be used with (Policy / Account / Contact)? Or should the system infer from token usage? Lean: explicit declaration, system pre-fills based on tokens detected, user can edit.
5. **Template-to-Campaign coupling for collection tokens.** When a Template uses `{policy.renewal_date}` and gets sent from an Account-anchored Campaign, which policy's date is merged? Likely "the policy that caused the segment match" via Segment metadata; fallback "the soonest-renewing active policy."
6. **Plain-text fallback — auto-generated and hidden, or exposed for edit?** Lean: auto-generated and hidden at PoC. Expose if a deliverability problem surfaces.
7. **Versioning default — pin or auto-follow?** Lean: auto-follow with notifications. Pin available per-Campaign for risk-averse agencies.
8. **Cross-channel families — needed?** Probably eventually. PoC: not a primitive. Build "clone Template for a new channel" affordance if anyone asks; group via category + naming.
9. **Localization.** Multiple language versions of the same Template. Klaviyo + Lev handle this; ours doesn't yet. Post-PoC; folds into versioning if we want.
10. **Brand asset ownership across multi-office agencies.** Office-level overrides? Per-producer overrides? Likely office-level for PoC, producer-level later if requested.
