# Browser Automation for P&C Personal Lines Insurance — Research Prompt

## Context

**Product**: PolicyLift — a platform for independent insurance agents that automates data-fragmented workflows across carrier portals, agency management systems (AMS), and comparative raters.

**Current stack**: Next.js on Vercel (serverless functions), Supabase backend, Node runtime. Currently using BrowserBase cloud sessions triggered from the Next.js UX layer.

**Primary goal**: Comparative rating — enter applicant data once, push it into 50–100 carrier portals simultaneously, and pull back quotes. Secondary goals include data entry into AMS platforms and third-party raters (TurboRater, EZLynx, QuoteRush, PL Rating).

**Scale**: 3–10 quote sessions per day per agency. Each session fans out to multiple carrier portals.

**Deployment preference**: Cloud-hosted preferred. Agent-side (on the IA's machine) is acceptable only if it requires no software install beyond Chrome. Hybrid is fine.

**Browser mode**: Headed preferred — needed for MFA flows and to avoid headless detection by carrier portals. Anti-detection/stealth capabilities are important.

---

## Section 1 — Primary Targets to Evaluate

Research each of the following in depth. For each, produce a summary covering architecture, pricing, strengths, weaknesses, and insurance-specific fit.

### 1.1 BrowserBase
- Cloud browser automation platform (PolicyLift's current provider)
- Evaluate: session management, anti-detection, headed mode support, Vercel/serverless integration, pricing at our scale, reliability for long-running carrier portal sessions

### 1.2 Kaizen Automation (kaizenautomation.com)
- Insurance-focused automation vendor
- Evaluate: what carriers/raters they support, how they handle UI changes, whether they offer an API or white-label service, pricing model, whether PolicyLift could integrate vs. compete

### 1.3 CamoFox Browser (github.com/jo-inc/camofox-browser)
- Open-source anti-detection browser (Firefox-based)
- Evaluate: fingerprint spoofing capabilities, carrier portal compatibility, self-hostability, maintenance activity, how it compares to commercial anti-detect solutions, licensing

### 1.4 Other Automation Platforms to Discover
Research and include any other relevant tools, including but not limited to:
- **Playwright / Puppeteer** (baseline open-source)
- **Selenium Grid / SeleniumBase**
- **MultiLogin, GoLogin, Dolphin Anty** (commercial anti-detect browsers)
- **Apify, Browserless.io** (cloud browser services)
- **UiPath, Automation Anywhere, Power Automate** (enterprise RPA)
- **AgentQL, Skyvern, LaVague** (AI-native browser agents)
- Any insurance-specific automation vendors discovered during research

---

## Section 2 — Insurance Industry Raters & Their Automation Methods

Investigate how existing P&C personal lines comparative raters handle automation internally. PolicyLift's relationship to these tools is as a **data source and integration partner** — we push data into them, not replace them.

### Tools to investigate:
- **TurboRater** (Insurance Technologies Corporation / Vertafore)
- **EZLynx Rater**
- **QuoteRush**
- **PL Rating / PL Rater**
- **ITC Comparative Rater**
- **HawkSoft Rating**
- **Applied Rater (Applied Systems)**
- **QQ Catalyst Rater**
- Any others discovered

### For each rater, answer:
1. Does it use browser automation, RPA, direct API integrations, or carrier-provided rating APIs?
2. Does it offer an API that PolicyLift could call instead of screen-scraping?
3. What carriers does it support and how many?
4. How does it handle carrier portal UI changes?
5. What is the typical integration path for a vendor like PolicyLift?
6. Is there a white-label or embedded option?

---

## Section 3 — Comparison Framework

Build a comparison table using the dimensions below. Use checkmarks (✅), partial (⚠️), or missing (❌) for boolean features. Use qualitative ratings (Excellent / Good / Fair / Poor) for subjective dimensions.

### 3.1 Architecture & Deployment
| Dimension | Why it matters to PolicyLift |
|---|---|
| Cloud-hosted sessions | We run serverless on Vercel — no persistent infra |
| Headed browser support | Needed for MFA and anti-detection |
| Anti-detection / stealth | Carrier portals block bots |
| Session persistence / resume | Long forms may timeout or require multi-step |
| Parallel session support | Fan-out to 50–100 carriers simultaneously |
| Node.js SDK / API | Must integrate with our existing stack |
| Vercel / serverless compatible | No long-running server processes |
| Self-hostable option | Fallback if cloud costs scale poorly |

### 3.2 Developer Experience
| Dimension | Why it matters to PolicyLift |
|---|---|
| Time to first automation | We want fast scaffolding |
| Recorder / codegen tooling | Speed up carrier portal script creation |
| Debugging / replay tools | Diagnose failures on carrier sites |
| Documentation quality | Team velocity |
| Community / ecosystem size | Long-term viability, support |
| CI/CD integration | Automated testing of scripts |

### 3.3 Reliability & Maintenance
| Dimension | Why it matters to PolicyLift |
|---|---|
| Selector change detection | Carrier portals update without notice |
| Proactive breakage alerts | We need to know before agents complain |
| Auto-retry / error recovery | Flaky carrier sites need resilience |
| CAPTCHA solving | Some portals use CAPTCHAs |
| MFA / 2FA handling | Agent credentials often have MFA |
| Session recording on failure | Debugging production issues |

### 3.4 Insurance-Specific Fit
| Dimension | Why it matters to PolicyLift |
|---|---|
| Pre-built carrier portal scripts | Avoid writing 100 scripts from scratch |
| Insurance industry experience | Understanding of carrier portal patterns |
| AMS integration support | Data flows both ways |
| Rater integration support | Push data into TurboRater, EZLynx, etc. |
| Multi-state / multi-LOB handling | P&C personal lines varies by state |
| Compliance / TOS risk awareness | Carriers may prohibit automation |

### 3.5 Pricing & Scale
| Dimension | Why it matters to PolicyLift |
|---|---|
| Pricing model | Per-session, per-minute, flat rate? |
| Cost at our scale (3–10 sessions/day/agency × N agencies) | Unit economics |
| Free tier / trial | Low-friction evaluation |
| Volume discounts | Growth path |
| Build-vs-buy total cost | Full picture |

---

## Section 4 — Carrier TOS & Compliance Risk

Research and document:
1. Do major P&C carriers (State Farm, Progressive, Travelers, Liberty Mutual, Nationwide, Hartford, etc.) explicitly prohibit automated data entry or screen scraping in their agent portal TOS?
2. Are there known enforcement actions against agencies or vendors for using automation?
3. How do existing raters (TurboRater, EZLynx) operate without violating TOS — do they have carrier agreements?
4. What is the legal distinction between RPA on behalf of a credentialed agent vs. unauthorized access?
5. Are there industry groups or standards (ACORD, AUGIE, IVANS) that provide a sanctioned path for automation?

---

## Section 5 — Best-in-Class Assessment

After completing all research, answer:

1. **What is the current best-in-class approach** for browser automation in P&C personal lines insurance? Who is doing it best and how?
2. **What is the optimal architecture for PolicyLift** given our stack (Node/Next.js/Vercel/Supabase), our scale, and our need for headed anti-detect sessions?
3. **Build vs. buy recommendation**: Should PolicyLift build its own automation layer (using open-source tools + CamoFox/Playwright), buy a managed service (BrowserBase, Kaizen, etc.), or pursue a hybrid?
4. **Integration strategy for raters**: Is it better to automate into raters (TurboRater, EZLynx) or go direct to carrier portals? What does the cost/benefit look like?
5. **Risk assessment**: What are the top 3 technical risks and top 3 compliance risks for this approach?

---

## Output Format

Deliver the research as a single document with:
1. **Executive summary** (1 page max)
2. **Detailed findings per Section 1–4** with sources cited
3. **Comparison table** (Section 3) — a single wide table or a set of category tables
4. **Recommendations** (Section 5) with clear rationale
5. **Appendix**: links, screenshots, and raw notes
