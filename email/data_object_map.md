---
created: 2026-05-25
author: Alex (compiled from research PDFs by Claude)
status: open
assignees: [Alex, Raghav, Martin, Mike]
tags: [email-automation, research, data-model, schema, scope-review]
depends_on: [[research_feature_list]]
---

# Data Object Map — Email Automation Platform

> **Purpose:** Map every object and concept inferred from the two research PDFs (and cross-referenced with client feedback) into a single hierarchy. Each entity has a description, where it appears across the competitive landscape, the fields it carries, and how it relates to the other entities. The goal is a shared mental model the team can read top-to-bottom and challenge.
>
> **Sources:** Big PDF (`Agency Revolution vs Levitate_ Engineering-Grade Platform Teardown.pdf`), Small PDF (`Engineering Teardown of Agency Revolution and Levitate…-2.pdf`), `client_feedback.md`, `email_automation_system_requirements.md`. See [[research_feature_list]] for the matching feature inventory.
>
> **Notation:** AR = Agency Revolution · Lev = Levitate. ★ = required-on-create. † = inferred (not directly documented). § = gap in both incumbents and a candidate differentiator.

---

## 0. Reading guide

The model has three layers, top to bottom:

1. **Platform / tenancy** — who the system is run by and for (Agency, Office, User).
2. **Core insurance graph** — who the agency serves and what they're insured for (Household → Account → Contact → Policy → Carrier → Claim).
3. **Engagement layer** — what we do with that graph (Segments, Tags, Key Facts, Campaigns, Automations, Steps, Messages, Outbox, Consent, Attribution).

Everything ultimately points back to the **Insurance Graph** because that is what makes this product insurance-specific instead of being a generic CRM.

```
                            ┌───────────────────────────────────────┐
                            │            TENANCY LAYER              │
                            │  Agency · Office · User (Producer,    │
                            │  CSR, Marketer, Compliance, Admin)    │
                            └───────────────┬───────────────────────┘
                                            │ owns / scopes
                                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          INSURANCE GRAPH LAYER                            │
│                                                                           │
│   Household ──── Account ──── Contact(s) ──── Communication History       │
│                     │             │                                       │
│                     │             └──── Tags · Key Facts · Custom Fields  │
│                     │                                                     │
│                     └──── Policy(ies) ──── Coverage(s)                    │
│                                │              └──── Coverage Limit        │
│                                │                                          │
│                                ├──── Carrier (+ Writing Company)          │
│                                ├──── Producer / CSR assignment            │
│                                └──── Claim(s)                             │
└───────────────────────────────────────────────┬───────────────────────────┘
                                                │ feeds
                                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         ENGAGEMENT LAYER                                  │
│                                                                           │
│   Segment ──── Audience Enrollment ──── Automation/Campaign ──── Sequence │
│                                            │                       │      │
│                                            │                       ▼      │
│                                            │                    Step      │
│                                            │                       │      │
│                                            ▼                       ▼      │
│                                      Trigger Point             Message    │
│                                                                  │        │
│                                                                  ▼        │
│                                                              Outbox /     │
│                                                              Approval     │
│                                                                  │        │
│                                                                  ▼        │
│                                                                Sent       │
│                                                                  │        │
│                                                                  ▼        │
│                                                            Engagement     │
│                                                              Event        │
│                                                                  │        │
│                                                                  ▼        │
│                                                           Attribution     │
└───────────────────────────────────────────────────────────────────────────┘

           Cross-cutting concerns: Consent · Suppression · Compliance Ledger
```

---

## 1. Tenancy Layer

### 1.1 Agency (Tenant)

The top-level isolation boundary. One agency = one tenant. Drives billing, brand, RBAC, and integration scope.

- **AR view:** Implicit; agencies live behind FMG Suite's umbrella.
- **Lev view:** Implicit; per-plan with seat caps (base = 5 users).
- **Likely fields:** `agency_id ★`, `name ★`, `plan_tier`, `created_at`, `time_zone`, `brand_assets[]` (logo, colors, footer disclaimer), `default_from_domain`, `carrier_appointments[]`, `enabled_channels[]` (email_mailbox, email_managed, sms, postcard, handwritten, web_chat, voice†), `default_send_window`, `freq_cap_policy` §.

### 1.2 Office / Location

Multi-office agencies want sender + signature + content tuned per location.

- **AR:** First-class — "per-location / per-brand sender configuration" and location-based sender/signature logic.
- **Lev:** Implicit.
- **Likely fields:** `office_id ★`, `agency_id ★`, `name`, `address`, `local_phone`, `local_signature_block`, `assigned_users[]`.

### 1.3 User (Producer / CSR / Marketer / Compliance / Admin)

Anyone who can act in the product. Maps to AR's Account Rep / Producer / CSR / Servicing Role and Lev's contact owner / connection.

- **Likely fields:** `user_id ★`, `agency_id ★`, `office_id`, `role ★` (Principal / Producer / CSR / Marketer / Compliance / Admin), `email`, `phone`, `signature_html`, `photo_url`, `sender_identity_id`, `email_oauth_token` (Lev mailbox-mode), `nps_score`, `assigned_accounts[]`, `appointments[]` (carriers this user is appointed under — gate for carrier-approved content §).

### 1.4 Sender Identity

The "From" the recipient actually sees on a message. Decoupled from User so one User can have multiple identities (personal mailbox vs branded agency address vs office-specific).

- **AR:** "Signature component can swap producer/CSR sender identity" + "per-location sender."
- **Lev:** OAuth'd mailbox per User.
- **Likely fields:** `sender_id ★`, `user_id` *or* `office_id`, `display_name`, `email_address ★`, `mode` (mailbox_oauth | managed_esp | hybrid §), `oauth_state`, `daily_quota`, `domain_id`.

---

## 2. Insurance Graph Layer

### 2.1 Household

Groups individuals who share a residence / risk exposure. Critical for orchestration ("don't text spouse and primary same day") and for cross-sell context.

- **AR:** Implicit — primary + secondary contacts on an Account.
- **Lev:** Explicit via "Household" key facts linking spouses/partners.
- **Gap §:** Cross-household membership (e.g., business owner who is also a personal-lines client) — neither platform supports it cleanly.
- **Likely fields:** `household_id ★`, `agency_id ★`, `mailing_address`, `members[]` (refs to Contact), `member_relationships[]` (spouse / child / parent / partner), `household_freq_cap_state` §.

### 2.2 Account

The book-of-business unit. The primary party in AR; secondary to Contact in Lev.

- **AR:** The center of gravity — segments, campaigns, and triggers are built off the Account.
- **Lev:** Less first-class; equivalent context is reconstructed via Contact + Policy Board.
- **Likely fields:** `account_id ★`, `agency_id ★`, `household_id`, `account_type ★` (`personal` / `commercial`), `ams_source` (epic / ams360 / qq / hawksoft / ezlynx / nowcerts / xanatek / eclipse / partner_platform / power_broker / wealthbox / clio), `ams_source_id ★`, `producer_id`, `csr_id`, `customer_since`, `segment_tags[]`, `book_value_premium`, `do_not_market_flag`, `status` (active / lost / prospect / reinstated / quoted), `lost_since`, `lost_buffer_until` (~3 weeks past lost — AR pattern), `created_at`, `updated_at`.

### 2.3 Contact

A person attached to an Account. Roles: primary, secondary, spouse, employee-of-business, beneficiary, etc.

- **AR:** Subordinate to Account; primary + secondary contacts.
- **Lev:** The center of gravity — Contact Profile carries tags, key facts, history, ownership, connections.
- **Critical gap §:** Lev allows only one email per Contact; multi-email + multi-phone with channel preference is a differentiation opportunity.
- **Likely fields:** `contact_id ★`, `account_id ★`, `household_id`, `role ★` (primary / secondary / spouse / employee / other), `first_name`, `last_name`, `display_name` (e.g., NASA Eclipse `Salutation`), `nickname` (Lev "Bob for Robert"), `dob`, `gender` (M / F / X / U / blank — NASA Eclipse driver table), `email_primary ★`, `emails_secondary[]` §, `phone_primary`, `phones[]` (channel-preference §), `mailing_address`, `tags[]`, `key_facts[]`, `keep_in_touch_interval` (Lev — every N days), `last_touched_at`, `unsubscribed_flag`, `bounced_flag`, `deceased_flag`, `sms_opt_in_status`, `auto_excluded_reasons[]`.

#### Email handling specifics (from Katz / NASA Eclipse feedback)
First email in `emailList` flagged default → `insuredEmailAddress` → `businessAccountIndividualEmailAddress`. Remaining `emailList` values stored as secondary. All emails trimmed, lowercased, deduplicated.

### 2.4 Policy

The atomic underwritten contract. Drives most insurance-specific triggers.

- **Both:** First-class object, but AR exposes more lifecycle events.
- **Required-on-create fields (Lev import baseline):** `owner ★` (User), `effective_date ★`, `renewal_date ★`, plus `holder_identity` (the Contact/Account it's associated to).
- **Full likely fields:** `policy_id ★`, `policy_number ★`, `account_id ★ (FK)`, `holder_contact_id`, `carrier_id ★`, `writing_company_id` (wholesalers — RT Specialty, Burns & Wilcox; California Fair Plan dual-policy edge case), `line_of_business ★` (auto / home / umbrella / life / commercial / workers_comp / cyber / etc.), `policy_type`, `status ★` (Active / Quoted / Renewed / Reinstated / Canceled / Lost / Non-renewed — note NASA Eclipse codes 1=Inactive-limbo, 2=Active, 3=Canceled, 4=Non-renewed; past-renewal policies may stay "active" until manual cleanup), `inception_date`, `effective_date ★`, `expiration_date ★` (X-date — treat as "date through which policy is active"), `bind_date`, `quote_date`, `cancel_reason`, `premium`, `future_premium` (AR — used for rate-change trigger), `premium_change_pct` (AR on AMS360/Epic), `commission_rate` § (not pulled by either today), `producer_id`, `csr_id`, `policy_source_tag` (QQCatalyst), `last_synced_at`.

### 2.5 Coverage / Coverage Limit (sub-object of Policy)

Needed for The Insurance Center's state-minimum-limits campaign and the $100K home liability campaign. Neither platform exposes coverage metadata richly; treat as an inferred gap §.

- **Likely fields:** `coverage_id ★`, `policy_id ★`, `coverage_type` (bodily_injury / property_damage / personal_liability / etc.), `per_occurrence_limit`, `aggregate_limit`, `deductible`, `is_state_minimum_flag` § (computed), `notes`.

### 2.6 Carrier (and Writing Company)

The underwriting partner. Source of commission, content co-op, and brand-safe content gating.

- **Both:** Surfaced as merge field / tag / Policy Board column.
- **Likely fields:** `carrier_id ★`, `name ★`, `lob_supported[]`, `preferred_flag`, `commission_schedule[]` (rate by LOB) §, `appointment_required_for_marketing_flag` §, `approved_marketing_content_refs[]` §, `is_broker_flag` (true ⇒ pull `writing_company` per Eclipse logic).

### 2.7 Claim

Insurance event — filed, in-progress, closed.

- **AR:** First-class — `New Claim` and `Closed Claim` triggers, claims segmentation, claims follow-up campaign.
- **Lev:** No public claims object found in research; gap §.
- **Likely fields:** `claim_id ★`, `policy_id ★`, `account_id`, `claim_number`, `date_filed ★`, `date_closed`, `status` (open / in_progress / closed / denied), `cause`, `cat_event_ref`, `satisfaction_score` (post-CSAT), `review_request_sent_flag`.

### 2.8 Quote (proto-Policy)

Pre-bind state.

- **AR:** `New Quoted Policy` trigger (but NOT supported on QQ Catalyst / Xanatek / EZLynx).
- **Lev:** No public quote-state trigger; gap §.
- **Differentiator §:** Real-time quote → text within 5 minutes.
- **Likely fields:** `quote_id ★`, `account_id`, `contact_id`, `rater_source` (PL Rating / EZLynx Rater / Turbo Rater / native AMS), `line_of_business`, `quoted_premium`, `quoted_at ★`, `expires_at`, `bound_flag`, `bound_policy_id`.

### 2.9 Form Submission / Inbound Event

Web form, landing page, paid-ad lead.

- **AR:** Form submission triggers, Forge integration; Lead capture is partly there but paid-ad attribution closure is missing.
- **Likely fields:** `submission_id ★`, `agency_id ★`, `form_id`, `source` (web / facebook_lead_form / google_lead_form / referral / manual), `submitted_at`, `payload_json`, `linked_contact_id`, `linked_account_id`, `attribution_metadata_json` § (campaign_id, ad_id, utm_*).

---

## 3. Annotation & Targeting Layer (sits on Contact/Account/Policy)

### 3.1 Tag

Lightweight label, AND/OR composable, colored, categorized (Lev).

- **AR:** Account-level "Tagging Accounts from Statistics Views" + auto-tag on bounce/unsubscribe.
- **Lev:** First-class — Tag Categories, Tag Logic AND/OR, auto-applied system tags (`Imported On: <date>`, `Email Bounced`, `Unsubscribe`, LOB, Carrier, Client/Past Client/Prospect).
- **Likely fields:** `tag_id ★`, `agency_id ★`, `name ★`, `category_id`, `color`, `auto_applied_rule` (predicate / null), `is_system_flag` (true for Unsubscribe / Email Bounced / etc.), `attached_to_type` (contact / account / policy).
- **Important commitment:** Per client_feedback.md, PolicyLift-side custom tags should NOT sync back to the AMS — confirmed by HawkSoft API team that custom-tag writeback is impossible. Use HawkSoft *substatus* as alternative.

### 3.2 Key Fact (Lev concept; AR has Segment criteria instead)

Typed fact attached to a Contact — either **date-based** (anniversary, renewal date, "Turning XX") or **informational** ("twin girls", "new home").

- **Likely fields:** `key_fact_id ★`, `contact_id ★`, `type ★` (`date` / `info`), `label ★`, `value`, `trigger_eligible_flag`, `source` (manual / ams_sync / lead_parser).

### 3.3 Custom Field

Agency-defined attribute. Lev allows up to 25; mergeable but **not** searchable (gap §). PolicyLift's CS team wants searchable + filterable §.

- **Likely fields:** `field_id ★`, `agency_id ★`, `attached_to_type` (contact / account / policy / household), `name ★`, `data_type ★` (string / number / date / bool / enum), `enum_values[]`, `searchable_flag` §, `mergeable_flag`, `default_value`.

### 3.4 Segment

A saved query. The AR engine. Dynamic — recomputes on each run.

- **AR:** Rule-based over 100+ data points across Account / Policy / Claim / AMS/BMS fields. Match All / Match Any logic, relative dates, geo filters (multi-zip), AI-assisted field discovery.
- **Lev:** Tag-logic filters + Policy Board filters; thinner predicate vocabulary.
- **Likely fields:** `segment_id ★`, `agency_id ★`, `name ★`, `rule_tree ★` (nested AND/OR of atomic predicates on contact / policy / behavior / tag / key_fact / coverage), `dynamic_flag` (recompute vs snapshot), `tag_output_id` (apply this tag to matches), `last_count`, `last_evaluated_at`.

---

## 4. Engagement Layer

### 4.1 Campaign

A named container for a marketing intent (e.g., "Renewal nurture", "Auto-to-Home cross-sell"). Holds one or more Sequences.

- **AR:** `Campaign → Sequence → Step` (linear).
- **Lev:** Equivalent is the Automation, which holds the visual canvas.
- **Likely fields:** `campaign_id ★`, `agency_id ★`, `name ★`, `category` (welcome / renewal / cross_sell / winback / claims / review / newsletter / holiday / hygiene / niche / non-insurance), `template_source` (prebuilt_library / custom / cloned_from), `audience_mode` (`at_launch` / `ongoing` / `in_the_future`), `status` (draft / active / paused), `approval_mode ★` (`outbox` / `yolo` / `hybrid`), `entry_segment_id`, `exit_rules[]`, `created_at`.

### 4.2 Sequence (AR) / Automation Canvas (Lev)

Ordered structure of Steps. AR = linear list; Lev = visual canvas with conditional branching and automation-chaining.

- **Sequence subtypes (AR):** step sequence, date-field sequence (anchored to account/policy date, runs once or annually), specific-date sequence (anchored to static date).
- **Likely fields:** `sequence_id ★`, `campaign_id ★`, `type` (step / date_field / specific_date / visual_canvas), `dag ★` (nodes + edges — represents both AR's linear and Lev's canvas as DAG instances per Big PDF §12.1), `repeat_annually_flag`, `flexible_launch_flag` (AR 2026 — activate subset), `status` (draft / active / paused).

### 4.3 Step (Node in the DAG)

Atomic action in a sequence.

- **Step types observed:**
  - `email` (managed ESP)
  - `email_mailbox` (mailbox OAuth)
  - `email_html_newsletter`
  - `sms`
  - `postcard` (AR)
  - `handwritten_card` (Lev, $4–$5)
  - `internal_notification` (to producer/CSR)
  - `wait` (explicit delay)
  - `tag_add` / `tag_remove`
  - `action_item` (task)
  - `zapier_zap`
  - `branch` § (visual canvas — both behind today)
  - `goal` § (canvas opportunity)
  - `webhook_out` §
- **Step-level controls:** `cancel_if_criteria_no_longer_met`, `override_sender_per_step`, `stop_on_reply`, `tag_on_click`, `quiet_hours_respect_flag`.
- **Likely fields:** `step_id ★`, `sequence_id ★`, `position`, `type ★`, `payload_template_id`, `delay_offset_days` (relative to anchor), `anchor_field` (`policy.expiration_date` / `key_fact.renewal_date` / `policy.bind_date` / static), `controls_json`, `next_step_ids[]` (DAG edges).

### 4.4 Trigger Point

The event that fires a Sequence (or enrolls an audience). Categorized in Big PDF §4.1.

| Category | Examples |
|---|---|
| **Time-based** | X-date offsets, birthday, anniversary, Turning XX, scheduled broadcasts, specific-date sequences |
| **Event-based (AMS)** | New Customer, New Bound Customer, New Prospect, Lost Customer, Reinstated Customer, First/Each/Additional New Policy, Lost Policy, New Quoted Policy, Renewed Policy, Policy Premium Rate Change, New Claim, Closed Claim, Endorsement† |
| **Behavior-based** | Form submit, limited email open/click, stop-on-reply, NPS response, tag-apply |
| **Manual** | Pipeline stage change, manual broadcast, manual automation start |
| **Segment-based** | Segment Match entry/exit |
| **External** | Zapier, API webhook §, Lead Parser (Lev) |

- **Likely fields:** `trigger_id ★`, `category ★`, `trigger_type ★` (one of the above), `config_json` (e.g., `{offset_days: -30, anchor: "policy.expiration_date"}` or `{threshold_pct: 10, direction: "up"}`), `backfill_suppress_flag ★` (critical pattern — AR suppresses on initial sync), `respects_consent_categories[]`.

### 4.5 Enrollment / Job

Per-contact state in a sequence — the unit of work. Idempotent state machine.

- **Likely fields:** `enrollment_id ★`, `contact_id ★`, `campaign_id ★`, `sequence_id ★`, `enrolled_at`, `current_step_id`, `state` (queued / scheduled / sent / paused / exited / completed / canceled), `exit_reason` (segment_removal / cross_sell_purchase / unsubscribe / manual_pause / criteria_changed / completed), `next_fire_at`, `last_fired_at`, `attempt_count`.

### 4.6 Message

The actual outbound artifact destined for a recipient.

- **Likely fields:** `message_id ★`, `enrollment_id`, `contact_id ★`, `policy_id` (if policy-contextual), `channel ★` (email / sms / postcard / handwritten / internal / push / web_chat / voice), `direction` (outbound / inbound), `sender_id ★`, `subject`, `body_rendered`, `template_id`, `merge_field_snapshot_json`, `status ★` (`drafted` → `queued` → `outbox_pending` → `approved` → `sent` → `delivered` → `opened` → `clicked` → `replied` → `bounced` → `failed` → `canceled`), `outbox_decision`, `approved_by_user_id`, `approved_at`, `provider_message_id`, `cost_unit_cents` (e.g., $4–$5 handwritten).

### 4.7 Outbox (Approval Queue)

First-class architectural concept in AR. Lev offers equivalent via non-YOLO mode. Differentiation opportunity § = extend to **all channels** (omnichannel approval).

- **Likely fields:** `outbox_item_id ★`, `message_id ★`, `submitted_at`, `expires_at`, `assigned_reviewers[]`, `decision` (approve / reject / hold), `decided_by_user_id`, `decided_at`, `bulk_action_ref`, `daily_digest_sent_at`.

### 4.8 Engagement Event

The "what happened to the message" stream.

- **Likely fields:** `event_id ★`, `message_id ★`, `type ★` (delivered / opened / clicked / replied / bounced_hard / bounced_soft / complained / unsubscribed / stop_keyword / opted_in), `timestamp ★`, `provider_event_id`, `link_url` (for clicks), `device_metadata`, `tag_writeback_flag` (e.g., apply `Email Bounced`).

### 4.9 Activity (writeback to AMS)

The artifact that lands back in HawkSoft / AMS360 / etc. as a note.

- **Likely fields:** `activity_id ★`, `message_id`, `target_ams ★`, `account_id`, `policy_id`, `kind` (note / log / call / email / text / card), `summary_text`, `posted_at`, `provider_activity_id`, `writeback_status` (pending / posted / failed).

### 4.10 Template

The reusable content unit, before merge.

- **Likely fields:** `template_id ★`, `agency_id`, `channel`, `name`, `subject_template`, `body_template` (block-based DSL for managed ESP; plain-text or HTML for mailbox), `merge_token_schema[]`, `library_origin` (prebuilt / cloned / custom / 4-per-year-custom), `carrier_approved_for[]` § (carrier_id list — for the carrier-content-marketplace opportunity), `lob_scope[]`, `state_regulatory_flags[]` (CA / NY / TX), `approval_expiration`, `version`, `replaced_by_template_id`.

### 4.11 Calendar (Marketing Calendar)

Visualization layer over scheduled + sent comms. AR 2026 surface; Lev has drag-drop content calendar.

- **Likely fields:** `entry_id ★`, `agency_id`, `message_id` *or* `campaign_id`, `scheduled_at`, `actual_sent_at`, `channel`, `included_in_analytics_flag` (AR Marketing Analytics excludes texts and postcards — gap to fix §).

---

## 5. Compliance & Consent Layer (cross-cutting)

### 5.1 Consent Record

Per-channel, per-category opt-in/opt-out — gap §: neither platform has a unified channel-native model.

- **Likely fields:** `consent_id ★`, `contact_id ★`, `channel ★` (email / sms / postcard / handwritten / call), `category ★` (`marketing` / `service_transactional` / `renewal_notice` / `claims_required` / `regulatory`), `state` (opt_in / opt_out / unknown / pending_double_opt_in), `source` (web_form / sms_keyword / verbal_logged / imported / inferred), `timestamp ★`, `keyword_used`, `revoked_at`, `notes`.
- **Critical edge case (Lev — Small PDF):** Renewal Automations DO NOT respect Unsubscribe tag; birthday automations DO. The successor needs explicit per-category override rules.

### 5.2 Suppression List

Append-only blacklist, applied at send time across all sequences.

- **Likely fields:** `suppression_id ★`, `agency_id` (or global), `contact_id` *or* `email_or_phone`, `reason ★` (`unsubscribe` / `hard_bounce` / `soft_bounce_threshold` / `deceased` / `do_not_market` / `tcpa_stop` / `complaint` / `regulatory_lockout`), `applied_at`, `expires_at`, `scope` (channel-specific or all).

### 5.3 Compliance Ledger (immutable, append-only)

For TCPA audit. SMS opt-in source + timestamp + keyword history; CAN-SPAM unsubscribe events; CASL flags; STOP/HELP.

- **Likely fields:** `entry_id ★`, `agency_id`, `contact_id`, `event_kind`, `payload_hash`, `timestamp ★`, `actor_user_id`, `regulation_tag` (`tcpa` / `can_spam` / `casl` / `state_specific:CA` / etc.).

### 5.4 Carrier Appointments (gating for carrier-approved content)

§ Opportunity — block agents from sending non-approved templates given the carriers they're appointed under.

- **Likely fields:** `appointment_id ★`, `agency_id`, `user_id`, `carrier_id`, `lob_scope[]`, `valid_from`, `valid_to`, `status`.

---

## 6. Attribution & Analytics Layer

The single biggest gap in both incumbents (§§). The successor needs first-class objects here.

### 6.1 Attribution Window

A configuration that says "credit a campaign with a policy outcome if the outcome happens within N days of a touch."

- **Likely fields:** `window_id ★`, `agency_id`, `name`, `lookback_days` (e.g., 30), `model` (`last_touch` / `linear` / `time_decay` / `position_based`), `weights_json`, `applies_to_outcomes[]` (`policy_bound` / `policy_renewed` / `policy_cross_sold` / `claim_satisfaction_score`).

### 6.2 Attribution Event (the join result)

- **Likely fields:** `attribution_id ★`, `outcome_event` (e.g., `policy.bound` with FK), `policy_id`, `account_id`, `attributed_messages[]` (refs to Message), `weights_applied`, `attributed_premium`, `attributed_commission` § (premium × commission_schedule.rate), `producer_id`, `carrier_id`, `lob`, `computed_at`.

### 6.3 Aggregate Metric Snapshot

Pre-aggregated rollups: per-producer, per-carrier, per-LOB, per-campaign, per-office.

- **Likely fields:** `snapshot_id ★`, `dimension` (producer / carrier / lob / campaign / office), `dimension_value`, `period`, `messages_sent`, `opens`, `clicks`, `replies`, `bounces`, `unsubscribes`, `policies_bound`, `policies_renewed`, `premium_attributed`, `commission_attributed`, `nps_avg`, `happiness_score_avg`.

### 6.4 Risk / Health Scores

§ Opportunities: at-risk account scoring (Big Opp #18), producer coaching benchmarks (Opp #19).

- **Likely fields:** `score_id ★`, `subject_type` (`account` / `policy` / `producer`), `subject_id`, `kind` (`churn_risk` / `cross_sell_propensity` / `producer_cadence_health` / `cross_sell_ratio`), `value`, `factors_json`, `computed_at`.

---

## 7. Integration / Sync Layer

### 7.1 AMS Connector

Per-AMS adapter implementing a common interface: `syncBaseline()`, `syncDelta()`, `writeback(event)`.

- **Likely fields:** `connector_id ★`, `agency_id`, `ams_kind ★` (epic / ams360 / qq_catalyst / hawksoft_v2 / ezlynx / nowcerts / xanatek / nasa_eclipse / partner_platform / power_broker / wealthbox / clio / agencyzoom / veruna / sagitta), `auth_config_json`, `sync_mode ★` (api_polling / api_realtime / scheduled_email_report / webhook † / csv_upload), `last_baseline_at`, `last_delta_at`, `field_map_json`, `health_state` (`healthy` / `degraded` / `failed` — EZLynx's email-report ingest needs explicit health-checks §), `writeback_capabilities[]`.

### 7.2 Sync Job

One execution.

- **Likely fields:** `job_id ★`, `connector_id ★`, `kind` (baseline / delta / writeback), `started_at`, `finished_at`, `status`, `records_in`, `records_out`, `events_emitted`, `errors[]`, `backfill_suppression_flag`.

### 7.3 Field Mapping

The "this AMS field maps to our canonical field" registry. The CS team has flagged that customers need to **see exactly how their AMS fields become the fields in front of them** (client_feedback.md).

- **Likely fields:** `mapping_id ★`, `connector_id`, `source_ams_field ★`, `canonical_field ★` (e.g., `contact.email_primary`), `transform_rule` (trim, lowercase, dedupe — Eclipse `emailList` example), `is_visible_to_customer_flag` § (for the mapping-debugger opportunity).

### 7.4 External Integration

Zapier, webhooks out, rater integrations (PL Rating / EZLynx Rater / Turbo Rater — §), Forge.

- **Likely fields:** `integration_id ★`, `kind`, `direction`, `auth`, `event_subscriptions[]`.

---

## 8. Event Bus (system-design layer)

Central streams that everything publishes to and consumes from. Per Big PDF §12.1.

- **`ams.events`** — `account.created`, `account.lost`, `policy.bound`, `policy.renewed`, `policy.lost`, `policy.rate_changed`, `claim.filed`, `claim.closed`, `contact.created`, `contact.updated`.
- **`behavior.events`** — `email.opened`, `email.clicked`, `email.replied`, `sms.replied`, `form.submitted`, `nps.responded`.
- **`time.events`** — cron anchors firing date-relative steps (X-date − 30d, lost_customer + 21d grace).
- **`user.events`** — manual broadcast, pipeline-stage-change, Zapier ingest.
- **`compliance.events`** — `opt_out`, `bounce`, `stop_keyword`, `complaint`, `consent_granted`.
- **Cross-cutting flag:** every event carries `backfill_suppress_flag` so automations don't fire on initial sync.

---

## 9. Connection / Relationship Cheat Sheet

A quick reference for "who FKs to whom" — useful for schema reviewers.

| From | →  | To | Cardinality | Notes |
|---|---|---|---|---|
| Agency | → | Office | 1:N | |
| Agency | → | User | 1:N | |
| Office | → | User | 1:N | A user can belong to one primary office |
| Agency | → | Household | 1:N | |
| Household | → | Account | 1:N | Personal-line households often = 1 account; commercial may differ |
| Household | → | Contact | 1:N | Via member relationships |
| Account | → | Contact | 1:N | Roles: primary / secondary / spouse / employee |
| Account | → | Policy | 1:N | |
| Policy | → | Coverage | 1:N | Sub-object |
| Policy | → | Carrier | N:1 | Includes Writing Company distinction |
| Policy | → | Claim | 1:N | |
| Policy | → | Quote | 1:1 (optional pre-bind) | `bound_policy_id` back-reference |
| Contact | → | Tag | M:N | Through `contact_tag` |
| Account | → | Tag | M:N | |
| Policy | → | Tag | M:N | LOB tag, Carrier tag, Policy Source tag |
| Contact | → | Key Fact | 1:N | |
| Contact | → | Custom Field Value | 1:N | Field schema lives on Agency |
| Segment | → | Contact / Account / Policy | dynamic query | Recomputed |
| Campaign | → | Sequence | 1:N | |
| Sequence | → | Step | 1:N (DAG) | |
| Trigger Point | → | Sequence | N:M | One trigger can launch many sequences; one sequence can have multiple entry triggers |
| Enrollment | → | Contact + Sequence | N:1 each | |
| Enrollment | → | Message | 1:N | One per step that produced an outbound |
| Message | → | Outbox Item | 1:0..1 | Only if approval mode requires |
| Message | → | Engagement Event | 1:N | |
| Message | → | Activity (AMS writeback) | 1:0..1 | |
| Outcome Event (policy.bound / renewed / cross_sold) | → | Attribution Event | 1:1 | Joined via Attribution Window |
| Attribution Event | → | Message(s) | 1:N | Multi-touch |
| Contact | → | Consent Record | 1:N | One per channel × category |
| Contact | → | Suppression entry | 1:N | |
| Agency | → | AMS Connector | 1:N (typically 1) | |
| AMS Connector | → | Sync Job | 1:N | |
| AMS Connector | → | Field Mapping | 1:N | |

---

## 10. Cross-Platform Comparison (collapsed view)

A condensed restatement of how the same concept manifests on each side, so the team can see which competitor's model we should lean toward for each entity.

| Concept | Agency Revolution | Levitate | Successor recommendation |
|---|---|---|---|
| Primary party | **Account** (event-rich) | **Contact** (relationship-rich) | **Hybrid Account + Household + Contact** § (Small Opp) |
| Policy data | Deep; full status + premium + rate change + future premium | Translated into tags + key facts; thinner | Lean AR — keep first-class Policy with full lifecycle |
| Household | Implicit via secondary contacts | Explicit via Household key facts | Make Household a first-class object with cross-household membership § |
| Tags | Account-level, lighter | First-class, colored, categorized, AND/OR logic | Lean Lev model + add searchable custom fields § |
| Segmentation | Rule-based query over 100+ predicates | Tag-logic + Policy Board filters | AR-style segment engine + Lev-style live tag logic |
| Automation structure | Linear `Campaign→Sequence→Step` | Visual canvas with branching, automation chaining | Visual DAG canvas § (Big Opp #3) representing both as special cases |
| Approval | First-class Outbox | YOLO vs non-YOLO toggle | Omnichannel Outbox § (Small Opp) |
| Sending | Managed ESP, branded domain | User-mailbox OAuth | **Hybrid §** (Big Opp #4) — choose per-template |
| Triggers (insurance) | Rich event catalog | Date- and tag-driven mostly | Unified insurance event bus § (Small Opp) with real-time §§ |
| Reporting | Email-centric + Business Insights | Mailbox-native opens/clicks/replies + Happiness Score | Add **policy-level revenue + commission attribution §** as the centerpiece |
| AI | Compose/rewrite in editor | Lev AI Assistant + Universal AI Agent | Match Lev parity + Agentic inbox copilot § (Big Opp #5) |
| AMS coverage | Broadest (Epic, AMS360, HawkSoft V2, EZLynx, Nowcerts, Xanatek, Eclipse, Partner Platform, PowerBroker, QQ Catalyst) | Strong on AMS360 + EZLynx + QQ + Epic; weak on Epic-only-deep & Nowcerts; rich on wealth/legal verticals | Match AR's insurance coverage; preserve Lev's wealth/legal patterns if applicable |
| Consent | CAN-SPAM unsubscribe + 10DLC + STOP | Same + auto-tagging | Unified channel-native consent + preference center § (Small Opp) |

---

## 11. Open Questions for the Team

(These echo the "Open Questions & Risks" section of `email_automation_system_requirements.md` and surface new ones from the teardown.)

1. **Commission schema:** neither AR nor Lev pulls commission rates today. Do we model `commission_schedule` per carrier × LOB on the Carrier object, or do we accept manual upload?
2. **Quote ingest:** which raters (PL Rating / EZLynx Rater / Turbo Rater) do we integrate first for the real-time quote-trigger differentiation? Webhook availability matters.
3. **Coverage sub-object granularity:** how rich does `Coverage` need to be to serve The Insurance Center's "state minimum limits" campaign? Per-coverage limits or a flag is enough?
4. **Cross-household membership:** do we model person ↔ multiple households (e.g., business owner = personal lines client + commercial lines on agency-owned LLC)?
5. **Eclipse company-vs-writing-company logic:** Phase 1 vs Phase 2 logic in client_feedback.md — when do we expose the database flag to users in our mapping debugger?
6. **HawkSoft custom-tag writeback:** confirmed impossible; default plan is to use substatus instead. Does that satisfy Marker Insurance's "inspection-complete" stop-rule, and what does the UX of that look like?
7. **Renewal-automation consent edge case:** if we move Renewal under `service_transactional` category, does that satisfy compliance without trapping us into Lev's "doesn't respect Unsubscribe" footgun?
8. **Legacy data migration:** historical unsubscribe lists + contact data — do we import as Consent Records with `source=imported` or as Suppression entries? (Affects audit trail.)
9. **Carrier co-op compliance:** what's the data shape for proof-of-performance reports that carriers reimburse against? Probably an `attribution_report_export_id` per carrier.
10. **API gating workarounds:** Zywave and similar — how do we degrade gracefully and surface what's missing in the integration console?

---

*Generated 2026-05-25 by Claude from the two engineering teardown PDFs in `email/`, cross-referenced with `client_feedback.md` and `email_automation_system_requirements.md`. Pairs with [[research_feature_list]] for the feature inventory.*
