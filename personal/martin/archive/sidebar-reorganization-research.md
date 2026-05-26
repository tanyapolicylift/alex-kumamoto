# PolicyLift Sidebar Reorganization Research

## Current Sidebar Structure

```
Dashboard              [Coming Soon]
Customers              [Dummy]

WEBSITE
  Agency Hub           (website config)
  Website Wizard       (website stats/Duda)

TRUST & REPUTATION
  Review Management    (Reach)

MARKETING AUTO-PILOT
  Email Campaigns      (Reach)
  Ads Builder          (Reach)
  Ads Dashboard        (Reach)

LEAD MANAGEMENT
  Conversations        (calls/chats/forms tables)
  Quote Packets        (core workflow)
  Booking & Calendars  (white-labeled booking)
  Smart Forms          [Coming Soon]

CXP
  Accounts             (PoC CRM)
```

## Industry Research: How Insurance Software Organizes Navigation

### Tools Reviewed
EZLynx, Applied Epic, HawkSoft, AgencyZoom, InsuredMine, NowCerts, Better Agency, Jenesis

### Common Top-Level Categories (by frequency)

| Category | Prevalence | Notes |
|----------|-----------|-------|
| Dashboard/Home | Universal | Widget-based KPIs, tasks, pipeline |
| Contacts/Clients | Universal | Always top-level, never buried |
| Policies/Transactions | Universal | Core AMS function |
| Sales/Pipeline | Very common | CRM-oriented tools emphasize this |
| Tasks/Activity | Very common | Top-level in every tool |
| Communications | Common | Email, text, calls grouped together |
| Reporting/Analytics | Common | Always top-level |
| Accounting/Billing | Common | More in AMS than CRM tools |
| Settings/Admin | Universal | Bottom of sidebar or top-right |

### Key Patterns

1. **CRM is front-and-center**: Contacts, pipeline, tasks occupy the top of the sidebar
2. **Marketing is secondary**: Nested under Communications or a sub-section, rarely top-level
3. **Website management is rare**: Only HawkSoft includes it; most tools don't offer it
4. **Documents are embedded**: Accessed within client/policy records, not standalone
5. **Action-oriented shortcuts**: Quick actions for frequent operations (quote, endorse, renew)
6. **Role-based visibility**: Advanced tools filter nav by user role

## Problems with Current Structure

1. **Core workflow is buried**: Quote Packets (the primary MVP value) is 4th item under "Lead Management" -- a category name that doesn't clearly signal the quoting workflow
2. **Too many categories for MVP**: 5 section headers + 10 items is a lot when most features are early-stage or coming soon
3. **"Lead Management" is misleading**: The section contains quoting, booking, and conversations -- it's really the operational hub, not just lead tracking
4. **CRM is an afterthought**: "CXP" with just "Accounts" at the bottom doesn't match industry norms where contacts are top-level
5. **Marketing/Website are over-promoted**: These are Reach/Duda integrations, not core to the MVP value prop, yet they take up 5 sidebar slots
6. **Category names are jargon-heavy**: "CXP", "Trust & Reputation", "Marketing Auto-Pilot" are internal/branded terms that don't match user mental models

## Proposed Sidebar Structure

### Option A: Operations-First (Recommended)

Organized around what MVP agencies actually do daily, with core workflow front and center.

```
Dashboard

OPERATIONS
  Conversations          (calls, chats, forms -- the intake point)
  Quote Packets          (core workflow)
  Booking & Calendars

CONTACTS
  Accounts
  Contacts

MARKETING
  Review Management
  Email Campaigns
  Ads Manager            (combine builder + dashboard)

AGENCY SETTINGS
  Website                (combine Hub + Wizard into one page or tabs)
  
[Settings gear icon at bottom]
```

**Rationale:**
- **Operations** replaces "Lead Management" and moves to the top -- this is what agents use all day
- **Contacts** is elevated to a top-level section matching industry norms
- **Marketing** consolidates Trust & Reputation + Marketing Auto-Pilot (both are Reach-powered anyway)
- **Ads Builder + Dashboard** merge into one "Ads Manager" entry (reduce clutter)
- **Website** moves to the bottom -- it's a configure-once-and-forget, not a daily tool
- Smart Forms removed until it ships (avoid "Coming Soon" clutter)
- Dashboard loses "Coming Soon" tag -- either ship a basic version or remove it

### Option B: Minimal MVP

For the leanest possible sidebar, focusing only on what design partners actually use today.

```
Dashboard

Conversations
Quote Packets
Booking & Calendars
Contacts

GROW                     (collapsed by default)
  Reviews
  Campaigns
  Ads

SETTINGS
  Website
  Account
```

**Rationale:**
- No section headers for core items -- they're the whole product
- "Grow" as a collapsed section for marketing tools they'll explore later
- Maximum focus on the quoting workflow

### Option C: Role-Based Hybrid

If different users (agents vs. agency owners) use the product differently:

```
Dashboard

MY WORK
  Conversations
  Quote Packets
  Booking & Calendars
  Tasks                  (future: pulled from QP workflow)

CLIENTS
  Accounts
  Contacts

MARKETING
  Reviews
  Campaigns
  Ads

REPORTS                  (future)

SETUP
  Website
  Smart Forms            (when ready)
  Integrations           (future)
```

## Recommendation

**Go with Option A** for MVP launch. It:
- Puts the core quoting workflow at the top where agencies will spend 80% of their time
- Matches industry conventions (contacts elevated, marketing secondary)
- Reduces sidebar items from 10 to 8
- Uses plain language instead of branded jargon
- Groups logically by user intent (operate / manage contacts / grow / configure)

Consider evolving toward Option C as the product matures and role-based access becomes relevant.

### Quick Wins

1. Rename "Lead Management" to "Operations"
2. Move Conversations + Quote Packets to the top section
3. Merge Ads Builder + Ads Dashboard into "Ads Manager"
4. Drop "Coming Soon" badges (ship it or hide it)
5. Rename "CXP" to "Contacts"
6. Move website config to bottom/settings area
