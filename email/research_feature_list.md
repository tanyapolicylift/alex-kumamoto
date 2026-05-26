---
created: 2026-05-25
author: Alex (compiled from research PDFs by Claude)
status: open
assignees: [Alex, Raghav, Martin, Mike]
tags: [email-automation, research, scope-review, competitor-teardown]
depends_on: []
---

# Research Feature List — Agency Revolution + Levitate Teardown

> **Purpose:** Single running inventory of every feature, capability, trigger, integration, gap, and differentiation opportunity surfaced in the two research PDFs in this folder. Use the **Scope** column to mark each row `IN` / `OUT` / `?` as we run the de-scoping pass.
>
> **Sources:**
> - **[Big]** = `Agency Revolution vs Levitate_ Engineering-Grade Platform Teardown.pdf` (38 pp.)
> - **[Small]** = `Engineering Teardown of Agency Revolution and Levitate for Independent P&C Insurance Agencies-2.pdf` (17 pp.)
>
> **Legend:** AR = Agency Revolution · Lev = Levitate · ✅ supported · ⚠️ partial / inferred · ❌ gap · 🆕 differentiation opportunity (not in either today).

---

## 1. Email Marketing

### 1.1 Email Composition & Editor

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 1.1.1 | Block-based drag-drop WYSIWYG editor (text, image, button, video, divider) | ✅ | ❌ | Big, Small | |
| 1.1.2 | Plain-text "personal" email composer (primary Lev flow; discourages HTML/graphics/links) | ❌ | ✅ | Big | |
| 1.1.3 | HTML Newsletter tab as a separate asset type (added Aug 2025 in Lev) | ⚠️ | ✅ | Big, Small | |
| 1.1.4 | Blank template creation from scratch | ✅ | ✅ | Small | |
| 1.1.5 | Reusable agency branding (logo, footer, signature) | ✅ | ⚠️ | Big | |
| 1.1.6 | Signature component that swaps producer/CSR identity, photo, title, phone, website per send | ✅ | ⚠️ | Small | |
| 1.1.7 | Location-based sender/signature logic for multi-office agencies | ✅ | ❌ | Small | |
| 1.1.8 | Policy list / active-policies component embedded into email body | ✅ | ❌ | Small | |
| 1.1.9 | Grammarly integration in composer | ✅ | ❌ | Big | |
| 1.1.10 | AI content generation / rewrite (tone + length) | ✅ | ✅ | Big | |
| 1.1.11 | AI translate to 10 languages (Lev AI Assistant) | ❌ | ✅ | Big | |
| 1.1.12 | Subject-line merge fields | ✅ | ✅ | Small | |
| 1.1.13 | Media insertion: links, images, GIPHY GIFs, YouTube thumbnails, attachments | ⚠️ | ✅ | Small | |
| 1.1.14 | Merge tokens for contact, secondary contact, policy, carrier, rate-change % | ✅ | ⚠️ | Big | |
| 1.1.15 | Custom fields usable as merge fields | ⚠️ | ✅ | Small | |
| 1.1.16 | Fallback merge values when token data is missing | ✅ | ⚠️ | Small | |
| 1.1.17 | Nickname substitution ("Bob" for "Robert") | ❌ | ✅ | Big | |
| 1.1.18 | Dynamic content via Segment Match filters (sequence-level, not per-block) | ⚠️ | ❌ | Big |  |
| 1.1.19 | Email attachment support (with limits — Lev cap is 3 MB) | ✅ | ⚠️ | Big | |
| 1.1.20 | Shared internal templates between co-workers | ✅ | ✅ | Small | |
| 1.1.21 | Subscription preferences by content category (email categories) | ✅ | ❌ | Small | |
| 1.1.22 | Generative-AI content categorization for subscription preferences | ✅ | ❌ | Small | |

### 1.2 Email Send Architecture & Deliverability

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 1.2.1 | Send through shared managed ESP infrastructure | ✅ | ❌ | Big | |
| 1.2.2 | Send via user's own OAuth'd mailbox (Gmail / Outlook / M365 / Exchange) | ❌ | ✅ | Big, Small | |
| 1.2.3 | **🆕 Hybrid sending: choose per-send between mailbox vs managed ESP with auto quota mgmt** | 🆕 | 🆕 | Big (Opp #4), Small | |
| 1.2.4 | Custom domain provisioning + DMARC/DKIM/SPF verification | ✅ | ⚠️ | Big, Small | |
| 1.2.5 | Spam analysis / deliverability scoring tools | ✅ | ⚠️ | Small | |
| 1.2.6 | Bring-Your-Own-Domain dedicated sending subdomains | ✅ | ⚠️ | Big | |
| 1.2.7 | Automatic validation of email addresses on first group send | ❌ | ✅ | Small | |
| 1.2.8 | Per-provider safeguards (30-second buffers, business-hours sending) | ❌ | ✅ | Small | |
| 1.2.9 | Quota-aware scheduling that spans days when needed | ❌ | ✅ | Big | |
| 1.2.10 | Account-wide cap (Lev: 5,000 emails / 24h with nightly reset + queueing) | ❌ | ✅ | Big, Small | |
| 1.2.11 | Auto-generated unsubscribe link (CAN-SPAM + CASL compliant) | ✅ | ✅ | Big, Small | |
| 1.2.12 | Mandatory physical address footer for commercial emails | ⚠️ | ✅ | Small | |
| 1.2.13 | Auto-exclusion of deceased / unsubscribed / "Email Bounced" tag | ⚠️ | ✅ | Big | |
| 1.2.14 | Pixel tracking on emails (open rates + engagement events) | ✅ | ✅ | Both PDFs + requirements doc | |
| 1.2.15 | Warm-up scheduler for new domains/IPs | ⚠️ | ⚠️ | Big (system design) | |
| 1.2.16 | Reputation monitoring + complaint-based auto-pausing | ⚠️ | ⚠️ | Big (Opp + system design) | |
| 1.2.17 | Bounce classification (hard / soft / spam-complaint) → tag writeback | ✅ | ✅ | Big | |
| 1.2.18 | "Email Gathering" hygiene campaign | ✅ | ❌ | Big | |
| 1.2.19 | "Unable to Email" hygiene campaign | ✅ | ❌ | Big | |
| 1.2.20 | "Invalid Email" notification campaign | ✅ | ❌ | Big | |

### 1.3 Email Send Types

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 1.3.1 | Broadcast (one-off manual send) | ✅ | ✅ | Big, Small | |
| 1.3.2 | Campaign sequence step (automated) | ✅ | ✅ | Big, Small | |
| 1.3.3 | Newsletters (monthly cadence) | ✅ | ✅ | Big | |
| 1.3.4 | Postcard step as alternative channel | ✅ | ❌ | Big | |
| 1.3.5 | Handwritten card step ($4–$5 each via Lob-style print partner) | ❌ | ✅ | Big | |

### 1.4 Email Testing & QA

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 1.4.1 | Outbox approval queue: preview + approve queued messages before release | ✅ | ⚠️ | Big, Small | |
| 1.4.2 | Bulk approve / cancel from Outbox | ✅ | ⚠️ | Big | |
| 1.4.3 | Daily Outbox-reminder digest email to approvers | ✅ | ❌ | Big | |
| 1.4.4 | Send test-to-self | ✅ | ✅ | Big | |
| 1.4.5 | Native A/B testing (subject / body / send time) | ❌ | ❌ | Big (Opp #8) | |
| 1.4.6 | Multivariate testing | ❌ | ❌ | Big (Opp #8) | |
| 1.4.7 | Send-time optimization by behavior / policy window | ❌ | ❌ | Small (Opp) | |

---

## 2. SMS / Text Marketing

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 2.1 | 1:1 SMS threads / two-way inbox (web) | ✅ | ✅ | Big, Small | |
| 2.2 | Two-way SMS inbox on mobile | ⚠️ | ✅ | Big | |
| 2.3 | Bulk text (AR: Campaign sequence only; Lev: text campaigns sent singly) | ⚠️ | ⚠️ | Big | |
| 2.4 | SMS step inside automation/campaign | ✅ | ✅ | Big, Small | |
| 2.5 | SMS unavailable in Broadcasts (AR limitation) | ⚠️ | n/a | Big (gap) | |
| 2.6 | MMS support (image / media attachments) | ✅ | ✅ | Big | |
| 2.7 | MMS size limits — Lev: ≤1.7 MB / attachment, ≤3.5 MB total | n/a | ✅ | Big | |
| 2.8 | URLs in MMS render as plain text (no hyperlinks — Lev) | n/a | ⚠️ | Big | |
| 2.9 | Web chat widget (AR: Forge integration) | ✅ | ❌ | Big, Small | |
| 2.10 | Port existing phone number or provision new | ✅ | ⚠️ | Big | |
| 2.11 | Shared agency-wide phone number | ⚠️ | ✅ | Big | |
| 2.12 | 10DLC brand/campaign registration | ✅ | ✅ | Big, Small | |
| 2.13 | STOP keyword opt-out handling | ✅ | ✅ | Big, Small | |
| 2.14 | TOS-enforced opt-in capture | ✅ | ⚠️ | Big | |
| 2.15 | Daily send caps — Lev: 1,000 messages/day/account (Sole Prop 50/hr & 15/min) | n/a | ✅ | Big | |
| 2.16 | Default 250 texts / number / day (raise-by-request) — Lev | n/a | ✅ | Small | |
| 2.17 | SMS archiving after 14 days + AMS writeback + optional AI summaries | ✅ | ⚠️ | Small | |
| 2.18 | Financial-vertical compliance archiving | ❌ | ✅ | Big | |
| 2.19 | Recipient narrowing by tag group / advanced key-fact filter | ⚠️ | ✅ | Small | |
| 2.20 | Draft support for text campaigns | ⚠️ | ✅ | Small | |
| 2.21 | Schedule now / later for text campaigns | ⚠️ | ✅ | Small | |
| 2.22 | Business-hours-only guidance for SMS | ✅ | ✅ | Small | |
| 2.23 | Twilio-backed SMS provisioning + forwarding (AR) | ✅ | ⚠️ | Small | |
| 2.24 | **🆕 Conversational AI on web chat + SMS with AMS context + quote-intent detection + producer handoff** | 🆕 | 🆕 | Big (Opp #16) | |

---

## 3. CRM / Contact System

### 3.1 Core Hierarchy & Records

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 3.1.1 | Account → Contact(s) → Policy(ies) AMS mirror | ✅ | ⚠️ | Big, Small | |
| 3.1.2 | Contact-centric profile with tags, key facts, history, ownership/connections | ⚠️ | ✅ | Big, Small | |
| 3.1.3 | Primary / Secondary / Spouse contact roles per account | ✅ | ⚠️ | Big, Small | |
| 3.1.4 | Household grouping by email or first+last name (Lev: one email per contact limit) | ⚠️ | ⚠️ | Big, Small | |
| 3.1.5 | Household Key Facts to explicitly link spouses/partners | ❌ | ✅ | Small | |
| 3.1.6 | Activity timeline per account (sent / opened / bounced / form submission / NPS) | ✅ | ✅ | Big, Small | |
| 3.1.7 | **🆕 Household-aware orchestration (frequency capping, coordinated messaging across spouses)** | 🆕 | 🆕 | Big (Opp #11) | |
| 3.1.8 | **🆕 Multi-email + multi-phone + channel-preference contact model** | 🆕 | 🆕 | Big (Opp #12) | |
| 3.1.9 | **🆕 Account + Household + Contact hybrid model** | 🆕 | 🆕 | Small (Opp) | |
| 3.1.10 | Cross-household membership (e.g., business owner who is also personal-lines client) | ❌ | ❌ | Big (gap) | |
| 3.1.11 | Search within contact profile by non-name fields (e.g., contract #, DOB) | ✅ | ❌ | Big (gap) | |

### 3.2 Tags & Key Facts

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 3.2.1 | Tags applied to accounts ("Tagging Accounts from Statistics Views") | ✅ | ✅ | Big | |
| 3.2.2 | Colored tags + Tag Categories | ❌ | ✅ | Big | |
| 3.2.3 | Tag Logic (AND/OR) for filtering and triggers | ⚠️ | ✅ | Big | |
| 3.2.4 | Auto-applied system tags: `Imported On: <date>`, `Email Bounced`, `Unsubscribe`, LOB, Carrier, Client/Past Client/Prospect | ⚠️ | ✅ | Big | |
| 3.2.5 | Key Facts: typed (date or info) per contact (anniversary, renewal date, "twin girls") | ❌ | ✅ | Big, Small | |
| 3.2.6 | Custom Fields (up to 25 on Lev; mergeable but **not** searchable/filterable) | ⚠️ | ⚠️ | Small (gap) | |
| 3.2.7 | **🆕 Searchable custom-field schema with type system** | 🆕 | 🆕 | Small (Opp) | |
| 3.2.8 | Custom Tags on PolicyLift side (no sync-back to AMS) — internal CS requirement | 🆕 | 🆕 | client_feedback.md, requirements doc | |
| 3.2.9 | Pipeline / Kanban (stages, My Day view, CSV lead import) | ✅ | ❌ | Big, Small | |

### 3.3 Communication History & Activity

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 3.3.1 | Activity timeline (all channels — email, SMS, postcard, handwritten, call, note) | ✅ | ✅ | Big | |
| 3.3.2 | Two-way AMS writeback for activities | ✅ | ✅ | Big, Small | |
| 3.3.3 | Sent / Opened / Bounced status capture | ✅ | ✅ | Big, Small | |
| 3.3.4 | Form-submission events captured to timeline | ✅ | ⚠️ | Big | |
| 3.3.5 | NPS response captured to timeline | ✅ | ⚠️ | Big | |

### 3.4 Relationship & Action Tools

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 3.4.1 | Keep-in-Touch cadence per contact (e.g., every 30d); auto-resets on send | ❌ | ✅ | Big, Small | |
| 3.4.2 | Tag-group-level cadence intervals | ❌ | ✅ | Big (US-07) | |
| 3.4.3 | Action Items (tasks, private option, calendar sync) | ⚠️ | ✅ | Big, Small | |
| 3.4.4 | Policy Boards: searchable policy UI (LOB, carrier, owner, date range) | ❌ | ✅ | Big, Small | |
| 3.4.5 | Meeting scheduler: 30/60/custom durations, daily/monthly caps, mandatory comments | ❌ | ✅ | Big | |
| 3.4.6 | Calendar sync (Outlook, Exchange, Gmail, Redtail) | ⚠️ | ✅ | Big | |
| 3.4.7 | Data boards for policies / opportunities / donations | ❌ | ✅ | Small | |
| 3.4.8 | Custom dashboard cards (Lev) | ⚠️ | ✅ | Small | |

---

## 4. Automation Engine

### 4.1 Workflow Structure

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.1.1 | Campaign → Sequence → Step (linear, AR) | ✅ | n/a | Big, Small | |
| 4.1.2 | Visual canvas with conditional branching (Lev — newer) | ❌ | ✅ | Big, Small | |
| 4.1.3 | Per-segment branching inside one automation (Lev) | ❌ | ✅ | Big | |
| 4.1.4 | Automation-to-automation chaining (one kicks off another) | ⚠️ | ✅ | Small | |
| 4.1.5 | Flexible sequence launch — activate some sequences in a campaign, keep others paused (AR 2026) | ✅ | n/a | Big | |
| 4.1.6 | **🆕 Visual branching workflow canvas with if/else, wait-until-condition, goal nodes, A/B splits** | 🆕 | 🆕 | Big (Opp #3) | |
| 4.1.7 | **🆕 Insurance-native nodes inside visual canvas** | 🆕 | 🆕 | Small (Opp) | |

### 4.2 Step Types

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.2.1 | Email step | ✅ | ✅ | Big | |
| 4.2.2 | SMS step | ✅ | ✅ | Big | |
| 4.2.3 | Postcard step | ✅ | ❌ | Big | |
| 4.2.4 | Handwritten card step | ❌ | ✅ | Big | |
| 4.2.5 | HTML newsletter step | ⚠️ | ✅ | Small | |
| 4.2.6 | Internal notification step (to producer/CSR) | ✅ | ❌ | Big | |
| 4.2.7 | Wait step (explicit delay) | ✅ | ⚠️ | Big | |
| 4.2.8 | Add-tag / delete-tag step (side effect) | ⚠️ | ✅ | Big, Small | |
| 4.2.9 | Action-item / task step | ⚠️ | ✅ | Big, Small | |
| 4.2.10 | Zapier step | ✅ | ✅ | Big | |
| 4.2.11 | Stop-on-reply step control | ❌ | ✅ | Big | |
| 4.2.12 | Tag-on-click step control | ❌ | ✅ | Big | |
| 4.2.13 | Override sender per step | ❌ | ✅ | Big | |
| 4.2.14 | Cancel-if-criteria-no-longer-met step control | ❌ | ✅ | Big, Small | |

### 4.3 Triggers (Event-Based)

| # | Trigger | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.3.1 | New Customer | ✅ | ⚠️ | Big, Small | |
| 4.3.2 | New Bound Customer | ✅ | ⚠️ | Big, Small | |
| 4.3.3 | New Prospect (not on HawkSoft natively — must simulate via segment) | ⚠️ | ✅ | Big, Small | |
| 4.3.4 | Lost Customer (~3-week buffer to avoid false positives) | ✅ | ⚠️ | Big, Small | |
| 4.3.5 | Reinstated Customer | ✅ | ❌ | Big, Small | |
| 4.3.6 | First New Policy | ✅ | ⚠️ | Big, Small | |
| 4.3.7 | Each New Policy | ✅ | ⚠️ | Big, Small | |
| 4.3.8 | Additional Policy | ✅ | ⚠️ | Big, Small | |
| 4.3.9 | Lost Policy | ✅ | ⚠️ | Big, Small | |
| 4.3.10 | New Quoted Policy (NOT on QQ Catalyst, Xanatek, EZLynx) | ⚠️ | ❌ | Big, Small | |
| 4.3.11 | Renewed Policy (NOT on Partner Platform, NASA Eclipse, PowerBroker) | ⚠️ | ⚠️ | Big, Small | |
| 4.3.12 | Policy Premium Rate Change with % threshold | ✅ | ❌ | Big, Small | |
| 4.3.13 | New Claim | ✅ | ❌ | Small | |
| 4.3.14 | Closed Claim | ✅ | ❌ | Small | |
| 4.3.15 | Endorsement | ⚠️ | ⚠️ | Big | |
| 4.3.16 | New Donation (vertical-specific to Lev) | ❌ | ✅ | Small | |
| 4.3.17 | Contact creation | ⚠️ | ✅ | Big, Small | |
| 4.3.18 | Lead Parser → New Leads Automation | ⚠️ | ✅ | Small | |
| 4.3.19 | **🆕 Real-time quote trigger (webhook, sub-5-minute SLA)** | 🆕 | 🆕 | Big (Opp #2, US-10) | |
| 4.3.20 | **🆕 Payment delinquency trigger** | 🆕 | 🆕 | Small (Opp) | |
| 4.3.21 | **🆕 Rewrite-to-new-carrier trigger** | 🆕 | 🆕 | Small (Opp) | |

### 4.4 Triggers (Date-Based)

| # | Trigger | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.4.1 | X-date / renewal offset (e.g., 30/60/90 days prior) | ✅ | ✅ | Big | |
| 4.4.2 | Specific-date sequences (anchored to static date) | ✅ | ✅ | Small | |
| 4.4.3 | Date-field sequence relative to account or policy dates (run once or annually) | ✅ | ✅ | Small | |
| 4.4.4 | Birthday (primary + secondary contact) | ✅ | ✅ | Big, Small | |
| 4.4.5 | Turning XX (age milestone) | ❌ | ✅ | Big, Small | |
| 4.4.6 | Anniversary | ✅ | ✅ | Big | |
| 4.4.7 | Scheduled broadcast send | ✅ | ✅ | Big | |
| 4.4.8 | Meeting reminders | ❌ | ✅ | Small | |

### 4.5 Triggers (Behavior-Based)

| # | Trigger | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.5.1 | Form submission | ✅ | ⚠️ | Big | |
| 4.5.2 | Limited email open/click (step-level tag) | ⚠️ | ✅ | Big | |
| 4.5.3 | Stop-on-reply | ❌ | ✅ | Big | |
| 4.5.4 | Tag-apply (tag-triggered flow) | ⚠️ | ✅ | Big, Small | |
| 4.5.5 | NPS response | ✅ | ⚠️ | Big | |
| 4.5.6 | Pipeline stage change (manual) | ✅ | ❌ | Big | |

### 4.6 Audience Enrollment & Segmentation

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.6.1 | Segment Match — rule-based query over 100+ data points | ✅ | ⚠️ | Big, Small | |
| 4.6.2 | Match All / Match Any logic (AND/OR predicates) | ✅ | ✅ | Small | |
| 4.6.3 | Relative date filters in segments | ✅ | ✅ | Small | |
| 4.6.4 | Geo filters (multi-zip targeting) | ✅ | ⚠️ | Small | |
| 4.6.5 | Live count of matching contacts in segment builder | ⚠️ | ✅ | Big (US-14) | |
| 4.6.6 | Dynamic recompute on each run | ✅ | ✅ | Big | |
| 4.6.7 | Tag output from segment | ⚠️ | ✅ | Big | |
| 4.6.8 | Segment export | ✅ | ⚠️ | Small | |
| 4.6.9 | AI assistant support for field discovery in segments | ✅ | ⚠️ | Small | |
| 4.6.10 | At Launch / Ongoing / In The Future audience enrollment modes | ✅ | ⚠️ | Small | |
| 4.6.11 | Auto-exit on cross-sell purchase | ✅ | ⚠️ | Big | |
| 4.6.12 | Exit on segment removal | ✅ | ⚠️ | Big | |
| 4.6.13 | Pause sequence at account level | ✅ | ✅ | Big | |
| 4.6.14 | **🆕 Manual review of recipients before send** (per Kyle / Ley Insurance) | ✅ | ❌ | requirements doc + Big | |

### 4.7 Execution Logic

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 4.7.1 | YOLO mode — fully automated, no approval gate (Lev) | n/a | ✅ | Big, Small | |
| 4.7.2 | Approval-gated mode (AR Outbox is architectural lynchpin) | ✅ | ✅ | Big | |
| 4.7.3 | Backfill safety — suppress triggers during initial sync | ✅ | ⚠️ | Big | |
| 4.7.4 | Concurrency / re-entry prevention during active sequence | ⚠️ | ✅ | Big | |
| 4.7.5 | Cadence auto-resets on outbound touch | n/a | ✅ | Big | |
| 4.7.6 | Date triggers run nightly (Lev: ~24–48h lag) | n/a | ⚠️ | Big | |
| 4.7.7 | Frequency capping (per-household, cross-channel, cross-producer) | ❌ | ❌ | Big (US-11) | |
| 4.7.8 | Quiet-hours / send-window enforcement | ⚠️ | ✅ | Small + req doc | |
| 4.7.9 | Timezone management across queued messages (AR: TZ change forces re-schedule) | ⚠️ | ⚠️ | Big (gap) | |
| 4.7.10 | Dynamic CC support | ⚠️ | ⚠️ | requirements doc | |
| 4.7.11 | Producer-specific "From" / "Reply-To" based on policy/account assignment | ✅ | ✅ | Big, requirements doc | |
| 4.7.12 | Aggregated policy emails for same-date policies (one email for home + auto) | ❌ | ❌ | client_feedback.md, requirements doc | |

---

## 5. Campaign / Content Library

### 5.1 Pre-Built Insurance Campaigns

| # | Campaign | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 5.1.1 | Personal Welcome Kit | ✅ | ✅ | Big, Small | |
| 5.1.2 | Commercial Welcome Kit | ✅ | ⚠️ | Big | |
| 5.1.3 | Post-policy onboarding automation | ⚠️ | ✅ | Big, Small | |
| 5.1.4 | Renewal nurture (X-date driven) | ✅ | ✅ | Big, Small | |
| 5.1.5 | Premium Rate Change Renewal sequence | ✅ | ❌ | Big | |
| 5.1.6 | Auto ↔ Home cross-sell | ✅ | ⚠️ | Big, Small | |
| 5.1.7 | Personal → Umbrella cross-sell | ✅ | ⚠️ | Big, Small | |
| 5.1.8 | Personal → Life cross-sell | ✅ | ⚠️ | Big | |
| 5.1.9 | Commercial → Personal cross-sell | ✅ | ⚠️ | Big | |
| 5.1.10 | Commercial → Workers Comp cross-sell | ✅ | ⚠️ | Big | |
| 5.1.11 | High-Net-Worth "Clickable Coverage" | ✅ | ❌ | Big | |
| 5.1.12 | Account Reviews (Personal + Commercial) | ✅ | ⚠️ | Big | |
| 5.1.13 | Lost Customer Winback | ✅ | ⚠️ | Big, Small | |
| 5.1.14 | Claims follow-up | ✅ | ❌ | Big, Small | |
| 5.1.15 | Disaster Preparedness broadcast | ✅ | ❌ | Big, Small | |
| 5.1.16 | NPS Campaign | ✅ | ⚠️ | Big | |
| 5.1.17 | Google review request | ✅ | ✅ | Big, Small | |
| 5.1.18 | Reputation Management sequences | ✅ | ⚠️ | Big | |
| 5.1.19 | Referral thank-you | ⚠️ | ✅ | Small | |
| 5.1.20 | Monthly newsletter | ✅ | ✅ | Big, Small | |
| 5.1.21 | Medicare quarterly newsletter | ✅ | ❌ | Big | |
| 5.1.22 | Local "Neighboring" newsletter | ✅ | ❌ | Big | |
| 5.1.23 | Primary Contact Birthday | ✅ | ✅ | Big | |
| 5.1.24 | Secondary Contact Birthday | ✅ | ❌ | Big | |
| 5.1.25 | 2026 15-email holiday series | ✅ | ⚠️ | Big | |
| 5.1.26 | Holiday postcards | ✅ | ⚠️ | Big | |
| 5.1.27 | Cyber Liability outreach | ✅ | ❌ | Big, Small | |
| 5.1.28 | New Business Homeowners Pipeline | ✅ | ❌ | Big | |
| 5.1.29 | Donor cadence (non-insurance vertical) | ❌ | ✅ | Big | |
| 5.1.30 | Meeting reminders | ❌ | ✅ | Big | |
| 5.1.31 | Industry-curated AI blog content | ❌ | ✅ | Big, Small | |
| 5.1.32 | Social media template library | ❌ | ✅ | Big | |
| 5.1.33 | Drag-drop content calendar (schedule months ahead) | ❌ | ✅ | Big | |
| 5.1.34 | 4 custom templates / year per plan | ❌ | ✅ | Big | |

### 5.2 Customer-Specific Use Cases (from feedback)

| # | Use Case | Customer | Source | Scope |
|---|---|---|---|---|
| 5.2.1 | Identify auto policies with state-minimum limits, send "limits increasing at renewal" campaign | The Insurance Center | client_feedback.md | |
| 5.2.2 | Identify home policies with only $100K liability, recommend $300K–$500K | The Insurance Center | client_feedback.md | |
| 5.2.3 | Home-inspection drip stops once policy marked "inspection-complete" in HawkSoft (via substatus) | Marker Insurance | client_feedback.md | |
| 5.2.4 | Aggregated policy emails for same-date home + auto on one account | JAMCO | client_feedback.md | |
| 5.2.5 | Custom sender per-touch (agent on policy, producer/CSR on customer) | JAMCO | client_feedback.md | |
| 5.2.6 | Manual recipient review before campaign send (tribal knowledge of long-tenured clients) | Ley Insurance | client_feedback.md | |
| 5.2.7 | Renewal emails removed from campaign once policy renews | JAMCO | client_feedback.md | |

---

## 6. AMS Integrations

### 6.1 AMS Connector Coverage Matrix

| # | AMS | AR | Lev | Sync Style | Directionality | Source | Scope |
|---|---|---|---|---|---|---|---|
| 6.1.1 | Applied Epic | ✅ native | ⚠️ daily scheduled report | API + report | AR: read + writeback; Lev: read-only | Big, Small | |
| 6.1.2 | Applied TAM | ✅ | ❌ | API | Read-primarily | Big | |
| 6.1.3 | EZLynx (Applied) | ✅ email-report/CSV | ✅ email-report/CSV | Scheduled report ingest | Read-only both; no writeback | Big, Small | |
| 6.1.4 | Vertafore AMS360 (flagship for AR) | ✅ native | ✅ real-time sync | API nightly (AR) / real-time (Lev) | AR: read + limited write; Lev: bi-directional (notes, emails, calls, cards, texts) | Big, Small | |
| 6.1.5 | Vertafore QQCatalyst | ✅ (no Quoted trigger) | ✅ daily sync | API | AR: read; Lev: push emails / notes / texts back | Big, Small | |
| 6.1.6 | Vertafore Sagitta | ⚠️ inferred via Epic/TAM | ❌ | — | — | Big | |
| 6.1.7 | HawkSoft | ✅ V2 API two-way (2022+) — writes sent/opened/bounced as activities | ✅ bi-directional (notes/emails/texts/calls); Client Tags NOT exposed via API | API | Bi-directional | Big | |
| 6.1.8 | Nowcerts | ✅ | ❌ | API (inferred) | Read | Big | |
| 6.1.9 | Xanatek (IMS) | ✅ two-way (2025/2026) | ✅ | API | Bi-directional (AR) | Big | |
| 6.1.10 | NASA Eclipse | ✅ (no Renewed Policy trigger) | ✅ | API | Read | Big | |
| 6.1.11 | Partner Platform | ✅ (no Renewed Policy trigger) | ❌ | API | Read | Big | |
| 6.1.12 | PowerBroker | ✅ (no Renewed Policy trigger) | ❌ | API | Read | Big | |
| 6.1.13 | AgencyZoom | ⚠️ via Zapier / Forge | ❌ | — | — | Big | |
| 6.1.14 | Veruna | ⚠️ Forge integration | ❌ | — | — | Big | |
| 6.1.15 | Wealthbox / Redtail (wealth vertical) | ❌ | ✅ twice-daily sync; custom fields → tags / key facts; writeback optional | API | Bi-directional | Big | |
| 6.1.16 | Clio Manage / MyCase / PracticePanther (legal) | ❌ | ✅ | API | Bi-directional (Clio) | Big | |

### 6.2 Integration Patterns

| # | Pattern | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 6.2.1 | API polling (most AMSes) | ✅ | ✅ | Big | |
| 6.2.2 | Email-report CSV ingestion (EZLynx, Epic) | ✅ | ✅ | Big, Small | |
| 6.2.3 | Webhook ingest | ❌ | ❌ | Big (gap) | |
| 6.2.4 | Nightly batch (dominant in both) | ✅ | ✅ | Big | |
| 6.2.5 | Real-time / sub-5-minute trigger | ❌ | ❌ | Big (Opp #2) | |
| 6.2.6 | Backfill mode suppresses event emission | ✅ | ⚠️ | Big | |
| 6.2.7 | Change detection via field-level diff | ✅ | ⚠️ | Small | |
| 6.2.8 | Report-failure detection + retry (AR halts sync on EZLynx failure) | ❌ | ⚠️ | Big (gap) | |
| 6.2.9 | Zapier ingest | ✅ | ✅ | Big, Small | |
| 6.2.10 | CSV manual import | ✅ | ✅ | Big | |
| 6.2.11 | Spreadsheet ingest | ⚠️ | ✅ | Small | |
| 6.2.12 | Lead Parser ingest | ❌ | ✅ | Small | |

### 6.3 AMS Writeback Capabilities

| # | Writeback | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 6.3.1 | Activities posted as AMS notes (HawkSoft confirmed) | ✅ | ✅ | Big | |
| 6.3.2 | Email-send outcomes (sent / opened / bounced) | ✅ | ✅ | Big | |
| 6.3.3 | Logged phone calls written back | ⚠️ | ✅ | Small | |
| 6.3.4 | Handwritten cards written back | ❌ | ✅ | Small | |
| 6.3.5 | Texts written back | ✅ | ✅ | Small | |
| 6.3.6 | Custom tag writeback to HawkSoft (NOT possible — confirmed by HawkSoft API team) | ❌ | ❌ | client_feedback.md | |
| 6.3.7 | HawkSoft substatus as alternative to custom tag writeback | ⚠️ | ⚠️ | client_feedback.md | |
| 6.3.8 | **🆕 Deep AMS write-back standard across Epic, AMS360, HawkSoft, EZLynx, Nowcerts** | 🆕 | 🆕 | Big (Opp #20) | |

### 6.4 Direct Field Access (PolicyLift-specific)

| # | Capability | Source | Scope |
|---|---|---|---|
| 6.4.1 | Direct AMS Data Access (eliminate field-registration bottleneck) | requirements doc | |
| 6.4.2 | NASA Eclipse-specific field mapping (`email`, `displayName`/`Salutation`, `gender` from driver table, Policy Status codes 1–4, inception/expiration date semantics, company vs writing_company) | client_feedback.md, requirements doc | |
| 6.4.3 | Clear AMS-term → customer-facing field mapping UI for CS | client_feedback.md | |

---

## 7. AI / Agentic Surface

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 7.1 | AI compose / rewrite inside editor | ✅ | ✅ | Big | |
| 7.2 | AI translate to 10 languages | ❌ | ✅ | Big | |
| 7.3 | Universal AI Assistant — agentic in-app (answers support Qs, pulls contact lists by criteria, reports account stats) | ❌ | ✅ | Big | |
| 7.4 | AI social posts | ❌ | ✅ | Big | |
| 7.5 | AI blog (unlimited GPT-created content — Advanced/Prestige tier) | ❌ | ✅ | Big | |
| 7.6 | AI Tagging Game (segmentation hygiene; AI suggests tags from 2 years of subject lines) | ❌ | ✅ | Big | |
| 7.7 | AI-suggested Google review replies | ❌ | ✅ | Big | |
| 7.8 | Custom GPT per agency | ❌ | ✅ | Big | |
| 7.9 | **🆕 Agentic inbox copilot (drafts replies, schedules follow-ups, pulls AMS context, proposes cross-sell at reply-time)** | 🆕 | 🆕 | Big (Opp #5) | |
| 7.10 | **🆕 AI draft from AMS context (contact + policy + last 5 comms)** | 🆕 | 🆕 | Big (US-12) | |
| 7.11 | **🆕 AI meeting notes** | 🆕 | 🆕 | Big (gap) | |
| 7.12 | **🆕 AI inbox reply suggestions** | 🆕 | 🆕 | Big (gap) | |
| 7.13 | **🆕 At-risk account scorer (ML)** | 🆕 | 🆕 | Big (Opp #18) | |
| 7.14 | **🆕 Quote-intent detection on web chat / SMS** | 🆕 | 🆕 | Big (Opp #16) | |
| 7.15 | Voice-matching fine-tune per producer | 🆕 | 🆕 | Big (system design, stretch) | |

---

## 8. Reporting & Analytics

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 8.1 | Unified workspace dashboard | ✅ | ✅ | Big | |
| 8.2 | Email opens / clicks / bounces per campaign | ✅ | ✅ | Big, Small | |
| 8.3 | Real-time open/click/reply notifications to producer | ⚠️ | ✅ | Big | |
| 8.4 | Reply tracking (mailbox-native) | ⚠️ | ✅ | Big | |
| 8.5 | Failed-send tracking | ✅ | ✅ | Small | |
| 8.6 | Unsubscribe metrics | ✅ | ✅ | Small | |
| 8.7 | Complaint metrics | ✅ | ⚠️ | Small | |
| 8.8 | Composite engagement score | ✅ | n/a | Big | |
| 8.9 | Client Happiness Score™ (Lev — NPS-style) | n/a | ✅ | Big | |
| 8.10 | NPS full workflow (1–10 scoring, promoter/passive/detractor, per-employee) | ✅ | ⚠️ | Big | |
| 8.11 | NPS export | ✅ | ⚠️ | Big | |
| 8.12 | Business Insights (book of business, active customers, policies in force, premium, producer perf) | ✅ | ⚠️ | Big, Small | |
| 8.13 | Health / Financial toggles on Business Insights | ✅ | ❌ | Big | |
| 8.14 | Marketing Analytics cross-campaign view | ✅ | ⚠️ | Big, Small | |
| 8.15 | Marketing Calendar (2026: visualization of scheduled/sent comms) | ✅ | ⚠️ | Big, Small | |
| 8.16 | Opportunity Boards (Lev) | ❌ | ✅ | Big | |
| 8.17 | QuickSight advanced reports (Lev) | ❌ | ✅ | Big | |
| 8.18 | Tag + automation progress reports | ⚠️ | ✅ | Big, Small | |
| 8.19 | Follow-up sends to behavioral cohorts ("did not reply", "clicked", "did not open") | ⚠️ | ✅ | Small | |
| 8.20 | Pending / completed states for automations | ⚠️ | ✅ | Small | |
| 8.21 | CSV export of reports | ✅ | ⚠️ weak | Big, Small | |
| 8.22 | Audit logs for compliance / regulatory tracking | ⚠️ | ⚠️ | requirements doc | |
| 8.23 | Employee-level / book-of-business view per agent | ✅ | ⚠️ | requirements doc | |
| 8.24 | **🆕 Policy-level revenue attribution with producer rollups, multi-touch weighting, configurable lookback, carrier-level ROI** | 🆕 | 🆕 | Big (Opp #1, US-06), Small | |
| 8.25 | **🆕 Commission-aware campaign ROI (factor carrier commission % into revenue)** | 🆕 | 🆕 | Big (Opp #10) | |
| 8.26 | **🆕 Producer/CSR/office/LOB/campaign-type performance dashboards with cohort exports** | 🆕 | 🆕 | Small (US) | |
| 8.27 | **🆕 Producer coaching layer (benchmark cadence, response times, cross-sell ratios)** | 🆕 | 🆕 | Big (Opp #19) | |
| 8.28 | Paid-ad attribution (Facebook/Google Lead Forms → policy ROI) | ❌ | ❌ | Big (Opp #9) | |

---

## 9. Compliance, Consent & Suppression

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 9.1 | Global + tenant-specific unsubscribe management | ⚠️ | ⚠️ | requirements doc | |
| 9.2 | Bounce suppression list (cross-channel) | ✅ | ✅ | Big | |
| 9.3 | "Do Not Market" flag at account level | ✅ | ⚠️ | Big | |
| 9.4 | Deceased flag → auto-exclude | ⚠️ | ✅ | Big | |
| 9.5 | TCPA opt-in capture + immutable ledger | ⚠️ | ⚠️ | Big (US-13) | |
| 9.6 | CAN-SPAM compliance (unsubscribe + physical address) | ✅ | ✅ | Big, Small | |
| 9.7 | CASL (Canada) flags | ✅ | ⚠️ | Big | |
| 9.8 | Per-state regulatory flags on content (CA / NY / TX specifics) | ⚠️ | ⚠️ | Big | |
| 9.9 | STOP / HELP keyword auto-logging | ✅ | ✅ | Big | |
| 9.10 | 10DLC brand + campaign association recorded | ✅ | ✅ | Big | |
| 9.11 | Renewal Automations DO NOT respect Unsubscribe tag (Lev edge case) | n/a | ⚠️ bug | Small | |
| 9.12 | Birthday automations DO respect Unsubscribe (Lev) | n/a | ✅ | Small | |
| 9.13 | **🆕 Unified channel-native consent + preference center** | 🆕 | 🆕 | Small (Opp) | |
| 9.14 | **🆕 Marketing vs service-transactional category split (so service notices aren't suppressed)** | 🆕 | 🆕 | Small (US — compliance manager) | |
| 9.15 | **🆕 Carrier-approved content library with compliance review workflow (E&O safe, carrier brand-safe)** | 🆕 | 🆕 | Big (Opp #6, US-09) | |
| 9.16 | SOC 2 Type 2 parity | ⚠️ | ⚠️ | Big | |

---

## 10. Onboarding & Tenant Setup

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 10.1 | Sales-led onboarding | ✅ | ✅ | Big | |
| 10.2 | Concierge "Do It For Me" tier ($400/mo on AR add-on) | ✅ | ⚠️ | Big, Small | |
| 10.3 | Initial AMS data download (AR: 4–8h after setup) | ✅ | ✅ | Small | |
| 10.4 | 4–6 week typical onboarding window (AR) | ✅ | ✅ | Big | |
| 10.5 | 10DLC registration bottleneck for SMS | ⚠️ | ⚠️ | Big, Small | |
| 10.6 | Dedicated Success Specialist (every Lev plan) | ❌ | ✅ | Small | |
| 10.7 | **🆕 Self-serve onboarding with guided AMS connection wizard** | 🆕 | 🆕 | Big | |
| 10.8 | **🆕 Baseline sync progress UI** | 🆕 | 🆕 | Big | |
| 10.9 | **🆕 10DLC registration assistant** | 🆕 | 🆕 | Big | |
| 10.10 | **🆕 First-campaign-in-15-minutes flow** | 🆕 | 🆕 | Big | |
| 10.11 | **🆕 Self-serve AMS mapping debugger (sync health, last successful job, missing fields, unmapped LOBs, event audit trail)** | 🆕 | 🆕 | Small (Opp + US) | |
| 10.12 | Multi-tenant: per-agency logos, brand colors, disclaimers | ✅ | ✅ | requirements doc | |
| 10.13 | Multi-tenant: per-agency PII isolation | ⚠️ | ⚠️ | Big | |
| 10.14 | Role-based access: Principal / Producer / CSR / Marketer / Compliance | ⚠️ | ⚠️ | Big | |

---

## 11. Pricing & Packaging

| # | Feature | AR | Lev | Source | Scope |
|---|---|---|---|---|---|
| 11.1 | Tiered plans (Essential / Preferred / Prestige — Lev) | n/a | ✅ | Small | |
| 11.2 | Per-seat pricing | ⚠️ | ✅ | Big | |
| 11.3 | 5-user cap on base plans (Lev — extra seats paid) | n/a | ✅ | Big | |
| 11.4 | Texting add-on pricing | ✅ | ✅ | Big | |
| 11.5 | Handwritten cards billed per unit ($4–$5 — Lev) | n/a | ✅ | Big | |
| 11.6 | Hidden / custom-quote pricing | ✅ | ✅ | Big | |
| 11.7 | **🆕 Transparent tiered pricing surfaced in product** | 🆕 | 🆕 | Big | |
| 11.8 | **🆕 Usage-based add-ons priced in product (SMS, cards, AI tokens metered)** | 🆕 | 🆕 | Big | |
| 11.9 | **🆕 AMS integrations bundled (don't break the norm)** | 🆕 | 🆕 | Big | |
| 11.10 | **🆕 Carrier co-op reimbursement as billing feature (split invoices per carrier)** | 🆕 | 🆕 | Big (Opp #17) | |

---

## 12. Differentiation Opportunities (Net-New / Both-Are-Behind)

Numbered with priority scores from Big PDF §10 (CV = Customer Value, EC = Engineering Complexity, SD = Strategic Differentiation; all 1–5).

| # | Opportunity | CV | EC | SD | Source | Scope |
|---|---|---|---|---|---|---|
| 12.1 | Policy-level revenue attribution with producer rollups, multi-touch, configurable lookback, carrier-level ROI | 5 | 3 | 5 | Big Opp #1 | |
| 12.2 | Real-time event bus (AMS webhooks + polling fallback) enabling sub-minute triggers (quote → text) | 5 | 4 | 5 | Big Opp #2 | |
| 12.3 | Visual branching workflow canvas with if/else, wait-until-condition, goal nodes, A/B splits | 5 | 4 | 4 | Big Opp #3 | |
| 12.4 | Hybrid sending architecture (mailbox + managed ESP with auto quota mgmt) | 5 | 4 | 5 | Big Opp #4 | |
| 12.5 | Agentic inbox copilot (drafts, follow-ups, AMS context, reply-time cross-sell) | 5 | 4 | 5 | Big Opp #5 | |
| 12.6 | Carrier-approved content library + compliance review workflow | 4 | 3 | 4 | Big Opp #6 | |
| 12.7 | Quote-to-bind nurture integrated with comparative raters (PL Rating, EZLynx Rater, Turbo Rater) | 5 | 4 | 4 | Big Opp #7 | |
| 12.8 | Native A/B + multivariate testing (subject / body / send time / channel) | 4 | 2 | 3 | Big Opp #8 | |
| 12.9 | Lead capture + landing pages + paid-ad attribution (Facebook/Google Lead Forms → bound policy ROI) | 5 | 3 | 4 | Big Opp #9 | |
| 12.10 | Commission-aware campaign ROI (carrier commission % factored into revenue attribution) | 4 | 3 | 5 | Big Opp #10 | |
| 12.11 | Household-aware orchestration (cross-policy, cross-contact frequency capping, coordinated messaging) | 5 | 3 | 4 | Big Opp #11 | |
| 12.12 | Multi-email, multi-phone, channel-preference contact model | 4 | 2 | 3 | Big Opp #12 | |
| 12.13 | Claims experience loop (filed → closed → CSAT → review/referral request) | 4 | 3 | 4 | Big Opp #13 | |
| 12.14 | Video messaging (async Loom-style producer intros with AMS-data-personalized cards) | 3 | 3 | 4 | Big Opp #14 | |
| 12.15 | Voice/calling + AI transcription with auto-logged notes, sentiment tagging, follow-up tasks | 4 | 4 | 4 | Big Opp #15 | |
| 12.16 | Conversational AI on web chat + SMS with AMS context, quote-intent detection, producer handoff | 5 | 5 | 5 | Big Opp #16 | |
| 12.17 | Carrier content marketplace + co-op funding tracker | 4 | 3 | 5 | Big Opp #17 | |
| 12.18 | Revenue-loss early warning (ML-flagged at-risk accounts) | 5 | 4 | 5 | Big Opp #18 | |
| 12.19 | Producer coaching layer (benchmarks for cadence, response time, cross-sell ratios) | 3 | 3 | 4 | Big Opp #19 | |
| 12.20 | Deep AMS write-back standard across Epic, AMS360, HawkSoft, EZLynx, Nowcerts | 5 | 5 | 5 | Big Opp #20 | |
| 12.21 | Send-time optimization by policy window + client behavior | high | medium | — | Small | |
| 12.22 | Producer/CSR routing with role fallbacks | high | medium | — | Small | |
| 12.23 | Conversion-aware cross-sell recommender (coverage gaps + household assets + lifecycle context) | high | high | — | Small | |
| 12.24 | Omnichannel outbox/approval queue (email + text + cards + tasks) | medium | medium | — | Small | |
| 12.25 | Policy timeline UI (history + comms + agent actions on one record) | medium | medium | — | Small | |
| 12.26 | Renewal cockpit with competitor-offer defense (pre-renewal action center) | high | high | — | Small | |
| 12.27 | Account + Household + Contact hybrid model | very high | medium | — | Small | |
| 12.28 | Unified insurance event bus across quote / bind / issue / cancel / rewrite / rewrite-to-new-carrier / lapse / claim open/close / endorsement / payment delinquency | very high | high | — | Small | |
| 12.29 | Channel-native consent + preference center | very high | medium | — | Small | |
| 12.30 | Searchable custom-field schema with type system | medium | low | — | Small | |

---

## 13. Documented Gaps in Each Platform

### 13.1 Agency Revolution Gaps

| # | Gap | Source | Scope (i.e. should our product close it?) |
|---|---|---|---|
| 13.1.1 | No visual branching automation canvas; complex if/else needs sequence gymnastics | Big | |
| 13.1.2 | No documented A/B testing for email or SMS | Big | |
| 13.1.3 | Nightly-batch sync — no near-real-time triggers | Big | |
| 13.1.4 | EZLynx integration is email-report/CSV — failed report halts sync | Big | |
| 13.1.5 | Trigger gaps: New Prospect (HawkSoft), New Quoted Policy (QQCatalyst/Xanatek/EZLynx), Renewed Policy (Partner Platform / NASA Eclipse / PowerBroker) | Big | |
| 13.1.6 | Lost Customer requires ~3-week buffer to avoid false positives | Big | |
| 13.1.7 | Pricing opacity + contract-cancellation complaints | Big | |
| 13.1.8 | Templated output "feels cookie-cutter" | Big | |
| 13.1.9 | Review presence thin (G2/Capterra near-empty) | Big | |
| 13.1.10 | Time-zone changes force full re-scheduling of queued messages | Big | |
| 13.1.11 | SMS unavailable in Broadcasts (Campaigns only) | Big | |
| 13.1.12 | No native revenue attribution model | Big | |
| 13.1.13 | Marketing Analytics dashboard excludes texts and postcards | Small | |
| 13.1.14 | Branching/workflow ergonomics weaker than Levitate | Small | |

### 13.2 Levitate Gaps

| # | Gap | Source | Scope |
|---|---|---|---|
| 13.2.1 | Automation depth "takes longer to create than it should"; segmentation clunky for insurance | Big | |
| 13.2.2 | Gmail/Outlook send quotas throttle large lists (big sends span days/weeks) | Big | |
| 13.2.3 | SMS: 1,000/day cap, MMS size limits, links as plain text, images distort | Big | |
| 13.2.4 | "Fails more than it delivers" (SMS) | Big | |
| 13.2.5 | No multi-email per contact; household combines husband + wife awkwardly | Big | |
| 13.2.6 | No Applied Epic native integration; no Nowcerts | Big | |
| 13.2.7 | EZLynx writeback not supported | Big | |
| 13.2.8 | HawkSoft Client Tags not exposed via API (writeback gap) | Big | |
| 13.2.9 | Analytics depth: list health metrics, campaign aggregate exports all weak | Big | |
| 13.2.10 | Template design flexibility limited | Big | |
| 13.2.11 | Per-seat + texting add-ons push TCO up | Big | |
| 13.2.12 | No AI meeting notes; no AI inbox reply suggestions | Big | |
| 13.2.13 | No revenue/policy attribution | Big | |
| 13.2.14 | 5-user cap on base plans | Big | |
| 13.2.15 | Email attachment cap 3 MB | Big | |
| 13.2.16 | Can't search within contact profile by non-name fields (contract #, DOB) | Big | |
| 13.2.17 | Custom fields not searchable/filterable | Small | |
| 13.2.18 | Renewal Automations don't respect Unsubscribe tag | Small | |
| 13.2.19 | Insurance data model shallower than AR | Small | |
| 13.2.20 | Self-serve config incomplete (CS-specialist dependent for custom fields, dashboard cards, branding) | Small | |
| 13.2.21 | No insurance quote-state trigger | Small | |

### 13.3 Gaps in BOTH Platforms (largest opportunity zone)

| # | Gap | Source | Scope |
|---|---|---|---|
| 13.3.1 | Revenue / policy-level attribution with configurable lookback | Big | |
| 13.3.2 | A/B testing (subject line, content, send time) | Big | |
| 13.3.3 | Real-time event triggers (webhooks vs nightly batch) | Big | |
| 13.3.4 | Carrier-approved content libraries / compliance review workflow | Big | |
| 13.3.5 | Lead capture forms → landing pages tied to paid-ad attribution | Big | |
| 13.3.6 | Commission/earnings tracking tied to campaign outcomes | Big | |
| 13.3.7 | Deep claims workflow (claim filed → closed → satisfaction) | Big | |
| 13.3.8 | Rich quote integration (quote-to-bind nurture with real comparative-rater data) | Big | |
| 13.3.9 | Conversational AI for inbound (web chat + SMS bot with AMS context) | Big | |
| 13.3.10 | Voice/calling with recording + transcription | Big | |
| 13.3.11 | Video messaging (Loom-style producer video intros) | Big | |
| 13.3.12 | Truly unified consent model across policy, email, SMS | Small | |
| 13.3.13 | Self-serve configurability (both depend on CS specialists) | Small | |

---

## 14. Engineering-Ready User Stories (from research)

These come directly from §11 of the Big PDF and §"Engineering-ready user stories" of the Small PDF. Each implies a bundle of features and should be marked as in/out of scope as a unit.

| # | Story (slug) | Source | Scope |
|---|---|---|---|
| 14.1 | **US-01 Renewal nurture trigger** — 30/14/7d before expiration, email + SMS + handwritten, skip suppressed, optional approval gate | Big | |
| 14.2 | **US-02 Premium rate-change alert** — fires when renewal premium increases by >X%, threshold configurable, suppresses if already in Lost Customer flow | Big | |
| 14.3 | **US-03 Monoline cross-sell** — Home but no Auto, sequence 90d after bind, auto-exit when Auto added, respects household freq cap | Big | |
| 14.4 | **US-04 Outbox approval** — preview with merge fields, approve/cancel per-message or bulk, daily digest, audit log | Big | |
| 14.5 | **US-05 Hybrid sending** — per-template choice of mailbox vs managed domain, OAuth flow, quota-aware scheduler | Big | |
| 14.6 | **US-06 Policy-level attribution** — configurable lookback, multi-touch weighting, producer + carrier rollups, export | Big | |
| 14.7 | **US-07 Keep-in-Touch cadence** — per-contact interval, resets on outbound, tag-group intervals, dashboard surface | Big | |
| 14.8 | **US-08 Lost customer winback with buffer** — ~3 week grace, auto-cancel if Reinstated | Big | |
| 14.9 | **US-09 Carrier-approved content** — template tagged by carrier + LOB + expiration, blocks unapproved templates by agent appointments | Big | |
| 14.10 | **US-10 Real-time quote trigger** — webhook/sub-5-min polling, SMS step on 10DLC number, compliance check | Big | |
| 14.11 | **US-11 Household frequency cap** — N messages/household/week across all channels and producers | Big | |
| 14.12 | **US-12 AI draft from AMS context** — pulls contact + policy + last 5 comms, output in producer voice, human edit before send | Big | |
| 14.13 | **US-13 SMS compliance ledger** — immutable opt-in source + timestamp + keyword history, STOP/HELP auto-logged, 10DLC association recorded | Big | |
| 14.14 | **US-14 Segment builder** — AND/OR over 100+ predicates on contact / policy / behavior, live count, dynamic recompute, optional tag output | Big | |
| 14.15 | **US-15 Claims loop** — claims-filed + claims-closed events → check-in + CSAT + review-request sequences | Big | |
| 14.16 | **US-S1 Renewal workflow auto-enroll at 60d** — stop/reschedule on early renewal, supports email + SMS + tasks + branching, edge cases for rewritten policies / duplicates / missing email | Small | |
| 14.17 | **US-S2 Policy-attributed reporting** — touched accounts, converted policies, premium retained/won, time-to-bind, by producer + LOB | Small | |
| 14.18 | **US-S3 Unified customer record** — household + active policies + claims + key dates + comm history; personal & commercial | Small | |
| 14.19 | **US-S4 Cross-sell recommender** — Home no Auto, Commercial no Workers Comp, Personal no Umbrella + agency-configurable gaps | Small | |
| 14.20 | **US-S5 Unified consent engine** — marketing vs service categories, contact + household suppressions, audit log, channel-specific STOP/unsubscribe | Small | |
| 14.21 | **US-S6 Self-serve integration console** — sync health, last successful job, missing required fields, unmapped LOBs, event audit, writeback status | Small | |
| 14.22 | **US-S7 Omnichannel approval queue** — email + SMS + tasks + cards; approve/reject/bulk/auto-approve at confidence threshold | Small | |
| 14.23 | **US-S8 Producer / CSR / office / LOB / campaign performance dashboards** — cohort exports, side-by-side comparisons, booked meetings + replies + policy outcomes | Small | |

---

## 15. Out-of-the-Box Channels Roundup (cross-channel orchestration table)

| Channel | AR | Lev | Source | Scope |
|---|---|---|---|---|
| Email (managed ESP) | ✅ | ❌ | Big | |
| Email (mailbox OAuth) | ❌ | ✅ | Big | |
| SMS / MMS (1:1) | ✅ | ✅ | Big | |
| SMS (bulk / campaign) | ✅ | ✅ | Big | |
| Postcard (direct mail print) | ✅ | ❌ | Big | |
| Handwritten card (Lob-style) | ❌ | ✅ | Big | |
| Web chat widget | ✅ | ❌ | Big | |
| Internal notification to producer/CSR | ✅ | ⚠️ | Big | |
| Producer push notification | ⚠️ | ⚠️ | Big (system design) | |
| Voice / calling | ❌ | ❌ | Big (Opp #15) | |
| Video messaging (async Loom-style) | ❌ | ❌ | Big (Opp #14) | |

---

## Notes for Scope Review

1. **Quick-win zone:** rows tagged `🆕` and marked CV ≥ 4 / SD ≥ 4 in §12 are the clearest "both competitors are behind" plays — start scope here.
2. **Table-stakes zone:** anything ✅ on both AR and Levitate is likely a must-have for parity (e.g., merge fields, X-date triggers, Outbox approval).
3. **AR-only features** mostly translate to *insurance-event depth* and *templated library* — high value but high build cost.
4. **Lev-only features** mostly translate to *mailbox delivery + AI assistant + canvas UX* — also high value but pull in OAuth + LLM infra.
5. **Customer-specific commitments** in §5.2 are already in client commitments — treat as default-in unless we explicitly de-scope.

---

*Generated 2026-05-25 by Claude from the two engineering teardown PDFs in `email/`, with cross-references to `client_feedback.md` and `email_automation_system_requirements.md`.*
