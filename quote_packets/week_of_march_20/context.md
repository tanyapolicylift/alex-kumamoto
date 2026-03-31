# Browser Automation Research — Context File

> Reference this file at the start of any research query to ground the agent in PolicyLift's situation, constraints, and evaluation criteria. Do not repeat this context in query prompts — just point to it.

---

## Who We Are

**Company**: PolicyLift
**Space**: InsurTech — tooling for independent insurance agents (IAs) in P&C personal lines
**Team**: Small startup team. Node/TypeScript developers. No dedicated QA or infra team.

## What We're Building

A platform that lets an independent agent enter applicant data once and have it pushed into multiple destinations simultaneously:

- **3–4 carrier portals** per session (selected from a supported pool of 50–100 carriers)
- **The agency's third-party comparative rater** of choice (TurboRater, EZLynx, QuoteRush, PL Rating, etc.)
- **Agency management systems (AMS)** — secondary priority

The core value proposition is eliminating redundant data entry across fragmented carrier and vendor systems.

## Current Stack & Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) on Vercel |
| Backend | Vercel serverless functions (Node.js) |
| Database | Supabase (Postgres + Auth + Storage) |
| Browser automation | BrowserBase (cloud-hosted browser sessions) |
| Trigger model | Next.js UX → serverless function → BrowserBase session |

We are currently using BrowserBase but are evaluating whether it is the right long-term choice.

## Deployment Constraints

- **Cloud-hosted preferred** — we run serverless, no persistent infra
- **Agent-side acceptable** only if it requires nothing beyond Chrome (no installer, no desktop app)
- **Hybrid is fine** — cloud for most work, local for MFA-gated steps
- **Headed browser preferred** — needed for MFA flows and to survive headless detection by carrier portals
- **Anti-detection/stealth is important** — carrier portals actively block bots

## Operational Profile

- **Volume**: 3–10 quote sessions per day per agency
- **Fan-out**: Each session hits 3–4 carrier portals + 1 rater
- **Session duration**: Carrier portal forms are multi-page, multi-minute
- **Failure modes**: Carrier UI changes, CAPTCHAs, MFA prompts, session timeouts, flaky pages

## Must-Have Capabilities

1. **Headed browser sessions** with anti-detection
2. **CAPTCHA solving** (or delegation to the agent)
3. **MFA / 2FA handling** — either automated or with human-in-the-loop handoff
4. **Node.js SDK or API** — must integrate with our serverless functions
5. **Parallel sessions** — run 3–4 carrier entries concurrently per quote
6. **Proactive breakage detection** — know when a carrier portal script breaks before agents report it (self-healing is nice-to-have, but detection + alerting is the minimum)
7. **Session recording on failure** — video/screenshot replay for debugging

## Nice-to-Have Capabilities

- Recorder / codegen tooling to speed up script creation for new carriers
- Self-healing selectors (AI-based element detection that survives UI changes)
- CI/CD integration for automated script testing
- Self-hostable fallback option

## Relationship to Raters

PolicyLift is **not** a comparative rater. We are a **data entry layer** that pushes data into an agency's existing rater of choice. The raters are integration partners, not competitors.

Raters we need to integrate with:
- TurboRater (Insurance Technologies Corporation / Vertafore)
- EZLynx Rater
- QuoteRush
- PL Rating / PL Rater
- ITC Comparative Rater
- Applied Rater (Applied Systems)
- HawkSoft Rating
- QQ Catalyst Rater

Key questions about raters: Do they expose APIs we can call directly? Or must we automate their web UIs via browser automation too?

## Primary Evaluation Targets

| Target | Type | Why evaluate |
|---|---|---|
| **BrowserBase** | Cloud browser service | Current provider — is it the right long-term bet? |
| **Kaizen Automation** (kaizenautomation.com) | Insurance-specific automation vendor | May have pre-built carrier scripts and industry knowledge |
| **CamoFox Browser** (github.com/jo-inc/camofox-browser) | Open-source anti-detect browser | Potential self-hosted stealth layer |
| **Playwright / Puppeteer** | Open-source browser automation | Baseline comparison — build-it-yourself option |
| **Apify / Browserless.io** | Cloud browser services | BrowserBase alternatives |
| **Skyvern / AgentQL / LaVague** | AI-native browser agents | Next-gen approach — AI handles UI changes |
| **MultiLogin / GoLogin / Dolphin Anty** | Commercial anti-detect browsers | Stealth-first alternatives |
| **UiPath / Automation Anywhere / Power Automate** | Enterprise RPA | Overkill? Or does insurance-specific support justify it? |

## Comparison Dimensions

When producing comparison tables, evaluate across these five categories:

### A. Architecture & Deployment
Cloud-hosted sessions, headed browser support, anti-detection/stealth, session persistence/resume, parallel session support, Node.js SDK/API, Vercel/serverless compatibility, self-hostable option

### B. Developer Experience
Time to first automation, recorder/codegen tooling, debugging/replay tools, documentation quality, community/ecosystem size, CI/CD integration

### C. Reliability & Maintenance
Selector change detection, proactive breakage alerts, auto-retry/error recovery, CAPTCHA solving, MFA/2FA handling, session recording on failure

### D. Insurance-Specific Fit
Pre-built carrier portal scripts, insurance industry experience, AMS integration support, rater integration support, multi-state/multi-LOB handling, compliance/TOS risk awareness

### E. Pricing & Scale
Pricing model (per-session, per-minute, flat rate), cost at our scale, free tier/trial, volume discounts, build-vs-buy total cost of ownership

## Compliance Questions to Address

1. Do major P&C carriers explicitly prohibit automated data entry in their agent portal TOS?
2. Are there known enforcement actions against agencies or vendors for using automation?
3. How do existing raters (TurboRater, EZLynx) operate without violating TOS — do they have carrier agreements?
4. What is the legal distinction between RPA on behalf of a credentialed agent vs. unauthorized access?
5. Are there industry standards (ACORD, AUGIE, IVANS) that provide sanctioned automation paths?

## Desired Final Output

A comparison document with:
1. Executive summary (1 page)
2. Detailed findings per target and per rater
3. Comparison tables using the dimensions above (checkmarks for booleans, Excellent/Good/Fair/Poor for subjective)
4. Best-in-class assessment: who is doing browser automation best in P&C personal lines today?
5. Architecture recommendation for PolicyLift (build vs. buy, optimal stack)
6. Rater integration strategy: automate into raters vs. go direct to carriers
7. Risk assessment: top technical and compliance risks
