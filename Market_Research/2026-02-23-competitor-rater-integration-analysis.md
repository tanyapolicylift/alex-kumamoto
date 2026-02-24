---
created: 2026-02-23
author: Alex
status: done
tags: [competitive-intelligence, rater-integration, insurtech, EZLynx, TurboRater, PLRater]
---

# Competitor Rater Integration Analysis: XILO, Salt, RiskAdvisor

Deep analysis of how three InsurTech competitors integrate with comparative raters (EZLynx, PL Rating, TurboRater, Applied Rater, QuoteRush). Research conducted 2026-02-23 from public help sites, marketing pages, and web sources.

---

## Executive Summary

All three competitors (XILO, Salt, RiskAdvisor) follow a similar core pattern: collect insurance application data through web forms, then push that data one-way into comparative raters. None offer two-way/bidirectional integration with raters. The primary differentiator is **how** they push data:

| Competitor | Primary Method | Secondary Method | Raters Supported | Lines |
|---|---|---|---|---|
| **XILO** | Direct API (EZLynx, TurboRater) | Chrome Extension AI auto-fill (any system) + File Upload (Applied Rater) | EZLynx, TurboRater, PL Rating, Applied Rater, Applied Epic Quotes, QuoteRUSH, IBQ, Tarmika | Auto, Home |
| **Salt** | Direct API (EZLynx) | Manual send (PL Rating) | EZLynx, PL Rating, Epic Quotes | Auto, Home |
| **RiskAdvisor** | Direct API (EZLynx) | Direct integration (PL Rating, QuoteRush) | EZLynx, PL Rating, QuoteRush | Auto, Home |

**Key finding**: XILO is the only competitor with a Chrome Extension (XAI) that uses AI-based browser form filling to integrate with "virtually any" web-based system, functioning as a universal RPA-like fallback for systems without direct API integration.

---

## 1. XILO (xilo.io)

### Company Overview
- Founded 2018, 500+ agencies, $6M+ VC raised
- Serves 10 of top 50 US insurance brokerages
- Product: AI-powered quote request forms + integration platform
- Has evolved from pure form tool to AI-powered "XAI" platform

### Integration Methods

XILO uses **three distinct integration methods** depending on the rater:

#### Method A: Direct API Integration (EZLynx, TurboRater)

**EZLynx Rater**
- **Technical method**: Direct API via EZLynx's API/credentials system. XILO stores EZLynx usernames in their "secure credentials locker." They use "licensed access to the EZLynx ecosystem" -- this means they are using EZLynx's partner API endpoints, NOT ACORD file exchange.
- **Setup steps** (5-7 steps):
  1. Obtain EZLynx account credentials
  2. Navigate to XILO Settings > API
  3. Click "All Services," search for EZLynx, click "Integrate"
  4. Enter EZLynx account username in configuration popup
  5. Assign individual agent EZLynx usernames via Team tab
  6. XILO CSM liaises with EZLynx for approval (~24 hours)
  7. Post-approval, data flows automatically
- **Data flow**: XILO Form submission --> XILO backend --> EZLynx API --> EZLynx Rater applicant record
- **Automation**: Fully automated push on form submission. No manual steps after setup.
- **Notable**: Bypasses Zapier; direct platform-to-platform transfer of "intricate quoting data"

**TurboRater**
- **Technical method**: Explicit API integration. Documentation states clients must "reach out to Zywave to obtain API access and your unique credentials."
- **Setup steps** (3 steps):
  1. Contact Zywave (TurboRater parent) for API access credentials
  2. Provide API Key to XILO Customer Success Manager
  3. CSM activates integration
- **Data flow**: XILO Form --> XILO backend --> TurboRater API --> TurboRater record. User receives email or dashboard link to access the lead in TurboRater.
- **Notable**: TurboRater described as "particularly for non-standard auto insurance"

#### Method B: Link/Redirect Integration (PL Rating)

**PL Rating (Vertafore)**
- **Technical method**: Appears to use a link-based handoff rather than direct API. When a form is submitted, "a link is sent via email or displayed on the XILO Dashboard. This link directs you straight to the new client's details in PL Rating."
- **Setup**: Managed entirely by XILO CSM -- "no separate activation process is required"
- **Data flow**: XILO Form --> XILO backend --> generates link --> user clicks link --> lands in PL Rating with pre-populated data
- **Notable**: This suggests XILO may be using PL Rating's URL-based import or web service, not a full REST API

#### Method C: File Upload (Applied Rater)

**Applied Rater**
- **Technical method**: File-based upload. "When a XILO Form is submitted, a file is generated that can be uploaded into Applied Rater to create a new Prospect."
- **Data flow**: XILO Form --> XILO generates file (likely ACORD XML or proprietary format) --> user manually uploads file into Applied Rater
- **Setup**: CSM enables it; then manual per-submission
- **Limitation**: Requires manual file upload step -- not fully automated

#### Method D: Chrome Extension AI Auto-Fill (XAI -- Universal Fallback)

**XAI Chrome Extension**
- **Technical method**: Browser-based AI form detection and auto-fill. XILO describes having "built our own AI that can scan and fill any web form you need to fill out." This is functionally RPA/browser automation at the DOM level.
- **How it works**:
  1. Customer completes XILO quote form
  2. Client data appears in Chrome Extension under "Client List"
  3. Agent navigates to ANY web-based system (rater, AMS, carrier portal)
  4. Agent clicks "Fill Page" for the relevant client
  5. Extension auto-populates form fields on the page
- **Pricing tiers**: Hobby (free) = 7 auto-fills/month; Pro = unlimited
- **Scope**: "Virtually any system" -- raters, AMS, carrier portals, CRMs
- **Reduction**: Claims 50%+ reduction in data entry time
- **Limitation**: Still requires agent to navigate to each system and click "Fill Page" -- semi-automated, not fully hands-off

### Other XILO Integrations (Non-Rater)
- **AMS**: AMS360, Applied Epic, EZLynx AMS, HawkSoft, QQ Catalyst, Sagitta, Novidea
- **CRM**: Salesforce, Dynamics 365, AgencyZoom, EZLynx Sales Center, Keap, Pipedrive
- **Automation**: Zapier
- **Additional Raters**: Applied Epic Quotes, QuoteRUSH, IBQ Rater, Tarmika

### Limitations
- Personal lines only (Auto, Home)
- No commercial lines rater integration documented
- No two-way/bidirectional data flow (quotes don't come back from raters)
- Applied Rater requires manual file upload
- Chrome extension auto-fill is semi-automated (requires agent click per system)
- EZLynx approval process takes ~24 hours
- Not listed as an official EZLynx technology partner (Salt IS listed; XILO is NOT)

### Sources
- [XILO Integrations Page](https://www.xilo.io/integrations)
- [XILO EZLynx Rater Integration](https://www.xilo.io/integration/ezlynx-rater)
- [XILO TurboRater Integration](https://www.xilo.io/integration/turborater)
- [XILO PL Rating Integration](https://www.xilo.io/integration/pl-rating)
- [XILO Applied Rater Integration](https://www.xilo.io/integration/applied-rater)
- [XILO EZLynx Setup Guide](https://www.xilo.io/post/how-to-setup-xilo-and-the-ezlynx-integration)
- [XAI Chrome Extension Guide](https://www.xilo.io/post/xai-chrome-extension-guide-for-insurance-agents)
- [XILO AI-Powered Integrations](https://www.xilo.io/learn-more/ai-powered-insurance-integrations)
- [XILO XAI Product Page](https://www.xilo.io/xai)

---

## 2. Salt Insurance (saltinsure.com)

### Company Overview
- Digital application/data collection platform for personal lines agencies
- Official EZLynx technology partner (listed on EZLynx partners page)
- Formal partnership announced by EZLynx in 2021
- Focus: web-based consumer self-service forms with rater pre-fill
- Claims 50%+ reduction in data entry time

### Integration Methods

Salt uses **direct API integration** with a simpler, more constrained approach than XILO.

#### EZLynx Integration (Primary -- Direct API)

- **Technical method**: Direct integration via EZLynx Connect partnership. Salt is an official EZLynx partner, meaning they have authorized API access. The 2021 press release confirms Salt was added to "EZLynx Connect."
- **Setup steps** (4 steps):
  1. Navigate to Integrations > EZLynx
  2. Click "Connect" or toggle switch on
  3. Configure team EZLynx usernames via "Configure Usernames"
  4. Submit for EZLynx activation (~24 hours)
- **Data flow (Consumer-Generated, Auto-Sync)**:
  - Consumer completes Salt form on agency website
  - Salt validates all required fields are present
  - Salt automatically sends data to EZLynx via API
  - Applicant record created in EZLynx rater
  - Agent receives notification
- **Data flow (Agency-Generated, Manual)**:
  - Agent fills out Salt form
  - Agent navigates to Lines of Business tab
  - Agent clicks "Send Home/Auto Policy" button
  - Agent confirms send
  - Submission becomes LOCKED after sending (cannot re-edit in Salt)
- **EZLynx Assumptions**: Salt allows agencies to set default values for required fields that Salt's forms don't collect (e.g., phone number classification as "Mobile," driver's license validity, certain vehicle fields). These are appended to every submission automatically.
- **Notable limitation**: Vehicle year compatibility gaps -- newer model years may not sync until EZLynx updates their system. Workaround: adjust to previous model year.

#### PL Rating Integration (Manual Only)

- **Technical method**: Manual sync integration. "Auto-sync is not an available option for PL Rater, so all submissions will need to be synced manually."
- **Setup**: Admin navigates to Integrations > PL Rating > tap "Connect"
- **Data flow** (6-7 steps per submission):
  1. Prospect completes submission; agent gets email with link
  2. Open submission, switch to "Lines of Business" tab
  3. Select PL Rating
  4. Review and correct any missing attributes
  5. Click "Send Auto/Home Data"
  6. Status changes to "Pending Confirmation"
  7. Click "Claim & Confirm on PL Rating" -- opens directly in Vertafore PL Rating
- **Requirement**: User must be logged into PL Rating BEFORE confirming submissions
- **Resync**: Manual resync available via "Request Resync" option
- **Notable**: This is a semi-automated bridge -- Salt sends data, then generates a redirect link to PL Rating where the agent claims the record

#### Epic Quotes Integration
- Listed as supported but no detailed documentation found in public help center

### Other Salt Integrations (Non-Rater)
- **Data Providers**: Estated (property/home data), Fenris (auto/driver data), MeasureOne (dec page retrieval)
- **AMS**: HawkSoft
- **CRM/Other**: AgencyZoom, Gaya AI, Google Analytics, Google Recaptcha, Zapier, SALT Spam Filter

### Limitations
- **One-way data flow only**: Data goes from Salt to raters; no return of quotes or rating results
- **No TurboRater integration**: Unlike XILO, Salt does not support TurboRater
- **No Applied Rater integration**: Not listed
- **PL Rating is manual only**: No auto-sync option
- **Submissions lock after sync**: Cannot edit in Salt after sending to rater
- **Vehicle year gaps**: Newer model years may fail to sync with EZLynx
- **Limited scope**: 1 home and up to 2 automobiles per application
- **No commercial lines**

### Sources
- [Salt Knowledge Base](https://support.saltinsure.com/)
- [Salt EZLynx Guide](https://support.saltinsure.com/article/21-salt-ezlynx-guide)
- [Salt PL Rating Guide](https://support.saltinsure.com/article/68-salt-pl-rating-guide)
- [Salt Integrations 101](https://support.saltinsure.com/article/22-integrations-101-getting-started)
- [EZLynx-SALT Partnership Announcement](https://www.ezlynx.com/news/press-releases/2021/salt-integration/)
- [EZLynx Technology Partners](https://www.ezlynx.com/partners/automation/)
- [Catalyit Salt Profile](https://catalyit.com/solution-provider-directory/salt)

---

## 3. RiskAdvisor (riskadvisor.insure)

### Company Overview
- "Smart Form Technology" platform for personal lines agencies
- Conversational, guided intake approach (not traditional multi-page forms)
- Uses "RiskProfile" concept -- a guided conversation that collects insurance data
- Tiered pricing: Growth and Premium plans include rater integrations
- Also integrates with AgencyZoom CRM

### Integration Methods

RiskAdvisor uses **direct integration** with three raters, emphasizing a "send to rater" workflow.

#### EZLynx Integration (Primary)

- **Technical method**: Direct API integration. Requires EZLynx-side enablement. RiskAdvisor links EZLynx usernames to RiskAdvisor users for routing.
- **Setup steps** (3 steps):
  1. Email EZLynx support (ezl-support@appliedsystems.com) to request integration enablement
  2. In RiskAdvisor Settings, check "Has EZLynx Integration" and click "Save and Map Users" -- associate EZLynx usernames with RiskAdvisor users
  3. Click Save; repeat for additional users
- **Data flow**: RiskProfile conversation --> RiskAdvisor backend --> EZLynx API --> EZLynx applicant record
- **QuickSend feature**: Enables rapid client submission with minimal data -- only First Name, Last Name, Email or Phone, and Line of Business (Auto/Home). Creates a draft in RiskAdvisor and full applicant in EZLynx simultaneously.
- **Existing Contact Sync**: Matches EZLynx contacts to RiskAdvisor profiles using email, phone, or name to prevent duplicates
- **Send options**: Can send to Home, Auto, or Both
- **Data fields**: Includes vehicle/driver info; SSN field support was added. Property data auto pre-fills.
- **Per-QuoteForm toggles**: Individual control over which forms auto-send to which rater

#### PL Rating Integration

- **Technical method**: Direct integration. Documentation describes it as creating "a rater file instantly through a focused conversation" with a "straightforward and simple Bridge Link."
- **Workflow** (3 steps):
  1. Enable PL Rating Integration in RiskAdvisor
  2. Select "Send to PL Rating" and complete the import
  3. Review and complete in PL Rating
- **Data flow**: RiskProfile --> RiskAdvisor generates data/link --> PL Rating receives and opens with pre-populated data
- **Notable**: "Bridge Link" terminology suggests URL-based handoff with embedded data or session reference

#### QuoteRush Integration

- **Technical method**: "Extensive direct integration" that "effortlessly updates QuoteRush with data from RiskAdvisor"
- **Data flow**: RiskProfile --> RiskAdvisor --> QuoteRush (creates "rater file for Home & Auto instantly")
- **Limited documentation on technical specifics

### Other RiskAdvisor Integrations
- **CRM**: AgencyZoom (bidirectional -- retrieves customer/lead data back)
- **Automation**: Zapier ("thousands of other apps")
- **Data**: Property Data Pre-fill (automatically sent to all three raters)

### Limitations
- **No TurboRater integration**
- **No Applied Rater integration**
- **No Tarmika, IBQ, or other raters**
- **Personal lines only** -- "Not at this time" for commercial agents
- **Rater integrations only on Growth/Premium plans** (not Starter)
- **QuickSend limited to Auto and Home** lines of business
- **Only admins/account owners can enable QuickSend**
- **One-way data flow** -- no quote results returned to RiskAdvisor
- **EZLynx data fields documentation is incomplete** -- a "RiskAdvisor --> EZLynx Data Fields" section exists in help docs but contains no visible content
- **Not listed as official EZLynx technology partner**

### Sources
- [RiskAdvisor EZLynx Integration Help](https://help.riskadvisor.insure/articles/4819758-ezlynx-integration)
- [RiskAdvisor Enable EZLynx Help](https://help.riskadvisor.insure/articles/4525492-how-to-enable-your-ezlynx-integration)
- [RiskAdvisor Integrations Page](https://riskadvisor.insure/integrations/)
- [RiskAdvisor + QuoteRush](https://riskadvisor.insure/integrations/quoterush/)
- [RiskAdvisor + PL Rating](https://riskadvisor.insure/integrations/riskadvisor-pl-rating/)
- [RiskAdvisor Changelog](https://feedback.riskadvisor.insure/changelog)

---

## Cross-Competitor Comparison

### Integration Method Comparison

| Dimension | XILO | Salt | RiskAdvisor |
|---|---|---|---|
| **EZLynx method** | Direct API (credentials-based) | Direct API (EZLynx Connect partner) | Direct API (EZLynx-side enablement) |
| **EZLynx auto-sync** | Yes | Yes (consumer forms) / No (agency forms) | Yes |
| **TurboRater** | Yes (API via Zywave) | No | No |
| **PL Rating method** | Link/redirect handoff | Manual send + redirect link | Bridge Link + redirect |
| **PL Rating auto-sync** | Unclear | No (manual only) | Unclear |
| **Applied Rater** | File upload (manual) | No | No |
| **QuoteRush** | Yes (listed) | No | Yes (direct) |
| **Applied Epic Quotes** | Yes | Yes (listed) | No |
| **IBQ, Tarmika** | Yes | No | No |
| **Universal fallback** | XAI Chrome Extension (AI auto-fill) | None | None |
| **Total raters** | 8+ | 3 | 3 |

### User Experience Comparison

| Dimension | XILO | Salt | RiskAdvisor |
|---|---|---|---|
| **Setup complexity** | 5-7 steps (varies by rater) | 4 steps (EZLynx) | 3 steps (EZLynx) |
| **Per-submission effort (best case)** | Zero (auto-sync) | Zero (auto-sync, consumer) | Zero (auto-sync) |
| **Per-submission effort (worst case)** | Manual file upload (Applied Rater) | 6-7 clicks (PL Rating manual) | 3 clicks (PL Rating) |
| **EZLynx approval time** | ~24 hours | ~24 hours | Varies (email request) |
| **Submission locking** | Not documented | Yes (locks after sync) | Not documented |

### Data Flow Architecture

All three competitors follow essentially the same pattern:

```
[Consumer/Agent] --> [Intake Form] --> [Platform Backend] --> [Rater API/Link] --> [Comparative Rater]
```

Key differences:
- **XILO** adds a Chrome Extension layer that can bypass the backend API entirely, doing browser-level DOM auto-fill
- **Salt** has the most sophisticated "Assumptions" system for filling in required rater fields that forms don't collect
- **RiskAdvisor** has the simplest setup (fewest steps) and a "QuickSend" feature for ultra-minimal data transfer

### Data Direction

ALL three are **one-way only** (form platform --> rater). None bring quote results, premiums, or carrier responses back into their platform. This is a significant gap in the market.

---

## Industry Context: How Rater Integration Works Technically

Based on research into the EZLynx and rater ecosystem:

### EZLynx API Solutions
- EZLynx offers formal [API Solutions](https://www.ezlynx.com/products/ezlynx-api-solutions/) supporting "real-time data exchange, automated quoting, and custom workflows"
- APIs support "everything from lead capture to backend rating"
- EZLynx Connect is the official partner marketplace -- Salt is a listed partner; XILO and RiskAdvisor are not
- EZLynx also supports ACORD form creation within the platform

### Common Integration Patterns in Insurance
1. **Direct API (REST/SOAP)**: Most modern approach. Used by EZLynx, TurboRater (Zywave). JSON or XML payloads.
2. **ACORD XML**: Industry standard data exchange format. Used for file-based transfers. Likely what XILO uses for Applied Rater file generation.
3. **URL/Link Handoff**: Pass data via URL parameters or session tokens. Used by PL Rating integrations (Salt, RiskAdvisor, XILO all seem to use this for Vertafore).
4. **Browser Extension / RPA**: DOM-level form filling. Only XILO does this (XAI Chrome Extension).
5. **Zapier/Webhook**: Indirect integration. All three support Zapier as a fallback.

### ACORD Standards Evolution
- Traditional: ACORD XML schemas for policy/claims/billing data exchange
- Modern: ACORD Next Generation Digital Standards (NGDS) -- JSON and YAML-based, RESTful APIs, microservices architecture
- [ACORD Reference Architecture](https://www.acord.org/standards-architecture/reference-architecture)

---

## Strategic Implications

1. **XILO has the broadest rater coverage** (8+ raters) but achieves this partly through a semi-automated Chrome Extension rather than true API integrations for every rater. Their "integrates into everything" claim relies on this browser-level fallback.

2. **Salt has the deepest EZLynx partnership** as an official EZLynx Connect partner. This gives them likely the most reliable and well-supported EZLynx integration.

3. **RiskAdvisor has the simplest UX** with the fewest setup steps and a QuickSend feature that requires minimal data to create an EZLynx applicant.

4. **None solve the return trip** -- getting quote results back from raters into the platform. This is a significant opportunity.

5. **PL Rating integration is uniformly weak** across all three -- all rely on manual or semi-manual link-based handoffs rather than full API automation.

6. **TurboRater is underserved** -- only XILO integrates with it, and TurboRater is significant for non-standard auto.

7. **Commercial lines rater integration is completely absent** across all three competitors.
