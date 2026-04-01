---
created: 2026-03-30
author: Alex
status: open
tags: [browser-automation, anti-detection, camofox, browserbase, research]
---

# CamoFox & BrowserBase Anti-Detection Research

Deep research into CamoFox Browser, the Camoufox engine it's built on, BrowserBase's stealth capabilities, and the broader anti-detection landscape -- all evaluated through the lens of PolicyLift's carrier portal automation needs.

---

## SECTION 1: What Does CamoFox Actually Do?

### 1. What Exactly IS CamoFox?

CamoFox ([github.com/jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser)) is a **REST API server** that wraps **Camoufox**, which is itself a patched Firefox fork. The layers are:

| Layer | What It Is |
|---|---|
| **Camoufox** ([camoufox.com](https://camoufox.com), [github.com/daijro/camoufox](https://github.com/daijro/camoufox)) | A Firefox fork with anti-detection patches applied at the C++ level. This is the actual browser engine. Created by `daijro`. |
| **CamoFox Browser** (jo-inc/camofox-browser) | A Node.js server that launches Camoufox via Playwright, exposes a REST API for tab management, navigation, clicking, typing, and snapshots. Built by the team behind [askjo.ai](https://askjo.ai). |
| **OpenClaw Plugin** | An optional plugin that makes CamoFox's API available as tools for AI agents via the OpenClaw framework. |

CamoFox is **not** a browser extension, and it's **not** just a wrapper around stock Firefox with JS patches. The anti-detection lives in Camoufox's C++ patches to Firefox's source code. CamoFox adds the server/API layer on top.

**Key distinction**: Camoufox modifies Firefox at the implementation level (C++ source), meaning fingerprint spoofing happens _before_ JavaScript ever runs on the page. This is fundamentally different from tools like Puppeteer Stealth or stealth Chrome extensions, which inject JavaScript to override browser APIs -- an approach that modern bot detectors can themselves detect.

### 2. Specific Anti-Detection Features

Each feature is listed with the detection vector it defeats.

#### a) Navigator Property Spoofing (C++ level)
- **What**: `navigator.hardwareConcurrency`, `navigator.platform`, `navigator.userAgent`, `navigator.deviceMemory`, etc. are all spoofed in the C++ implementation.
- **Why it matters**: These properties are the first thing fingerprinting scripts check. JS-level overrides leave detectable traces (e.g., property descriptor checks, prototype chain inspection). C++ spoofing leaves no such traces.
- **Detection vector defeated**: Basic browser fingerprinting, headless browser detection.

#### b) Screen/Display Geometry Spoofing
- **What**: `screen.width`, `screen.height`, `window.innerWidth`, `window.innerHeight`, `window.outerWidth`, viewport dimensions -- all spoofed consistently.
- **Why it matters**: Mismatches between reported screen size and actual rendering viewport are a strong signal of automation. Headless browsers often report impossible or unusual screen geometries.
- **Detection vector defeated**: Viewport/screen consistency checks, headless detection heuristics.

#### c) WebGL Fingerprint Spoofing
- **What**: WebGL vendor/renderer strings, supported extensions, context attributes, and shader precision formats are all spoofed using a database of real-world GPU configurations.
- **Why it matters**: WebGL fingerprinting is one of the most powerful identification techniques. The GPU renderer string alone can narrow a user to a very small population. Camoufox ensures the spoofed WebGL profile is internally consistent (e.g., an Intel GPU won't report NVIDIA-specific extensions).
- **Detection vector defeated**: WebGL fingerprinting (used by Cloudflare, DataDome, PerimeterX/HUMAN, and most commercial bot detection).

#### d) Canvas Fingerprinting Countermeasures
- **What**: Canvas rendering output is spoofed to prevent unique fingerprint generation.
- **Why it matters**: Canvas fingerprinting exploits subtle rendering differences between browsers/GPUs/OS combinations. It produces a hash that is highly unique per device. Without canvas spoofing, every session from the same machine produces the same hash, linking them together.
- **Detection vector defeated**: Canvas fingerprint tracking.

#### e) WebRTC IP Spoofing (Protocol Level)
- **What**: ICE candidates and SDP descriptions are modified at the network layer before transmission, so WebRTC reports the proxy IP rather than the real local IP.
- **Why it matters**: WebRTC is the classic proxy bypass -- even with an HTTP proxy, WebRTC can leak the real local IP address. Camoufox patches this at the protocol level, not via JS overrides.
- **Detection vector defeated**: WebRTC IP leak detection, proxy detection.

#### f) Audio Fingerprinting Spoofing
- **What**: AudioContext properties, speech synthesis voices, and playback rates are spoofed.
- **Why it matters**: AudioContext fingerprinting can distinguish between OS/browser combinations based on how audio is processed. It's a secondary fingerprint that is checked for consistency with other reported properties.
- **Detection vector defeated**: AudioContext fingerprinting.

#### g) Font Fingerprinting Countermeasures
- **What**: Available fonts are spoofed to match what would be expected for the reported OS/locale.
- **Why it matters**: The set of installed fonts is a strong fingerprint, especially cross-platform. A Linux font set paired with a Windows user agent is an obvious inconsistency.
- **Detection vector defeated**: Font enumeration fingerprinting.

#### h) Timezone/Locale/Geolocation Consistency
- **What**: When a proxy is configured, Camoufox (via its GeoIP database) automatically sets the locale, timezone, and geolocation coordinates to match the proxy exit IP.
- **Why it matters**: A US-timezone browser connecting from a Japan IP address is an immediate red flag. Consistency between these signals is critical.
- **Detection vector defeated**: Timezone/locale mismatch detection, geo-consistency checks.

#### i) Headless Mode Patching
- **What**: Firefox's headless mode is patched to appear identical to headed mode from JavaScript's perspective.
- **Why it matters**: Standard headless browsers expose dozens of detectable differences (missing plugins, different rendering behavior, absent window chrome). Camoufox eliminates these tells.
- **Detection vector defeated**: Headless browser detection (a core check for Cloudflare, Akamai, etc.).

#### j) Playwright Isolation (Juggler Protocol Patching)
- **What**: Camoufox patches the Juggler protocol (Firefox's equivalent of CDP) so that Playwright operates on an isolated copy of the page. The real page is completely unaffected by Playwright's instrumentation.
- **Why it matters**: Bot detection scripts look for evidence of automation frameworks (CDP artifacts, injected scripts, modified prototypes). By isolating Playwright into its own sandbox, these artifacts are invisible to the page.
- **Detection vector defeated**: Automation framework detection (CDP detection, Playwright/Puppeteer detection).

#### k) Statistical Fingerprint Distribution (via BrowserForge)
- **What**: Fingerprint values are not random -- they're drawn from statistical distributions that match real-world browser traffic. Screen sizes, hardware specs, and OS combinations follow realistic population curves.
- **Why it matters**: Random fingerprints are themselves suspicious. A 3840x1600 screen with 2 CPU cores and an Intel UHD 620 GPU is plausible. A 1337x1337 screen with 7 CPU cores is not. Statistical realism defeats population analysis.
- **Detection vector defeated**: Statistical anomaly detection, fleet fingerprint analysis.

#### l) Human-like Mouse Movement
- **What**: Bezier curve-based mouse trajectories simulate natural movement patterns.
- **Why it matters**: Programmatic clicks with instant teleportation to exact coordinates are a behavioral signal. Human mice follow curves, overshoot, correct, and have variable velocity.
- **Detection vector defeated**: Behavioral analysis, mouse movement heuristics (used by Kasada, PerimeterX/HUMAN).

### 3. Reviews, Benchmarks, and Community Discussion

**Positive signals:**
- A detailed blog post by Pradeep ([pradeep.md/2026/02/10/camofox-browser-deep-dive.html](https://pradeep.md/2026/02/10/camofox-browser-deep-dive.html)) confirms CamoFox successfully operates on sites that block standard headless browsers, including Google, Amazon, Product Hunt, and X (Twitter).
- The underlying Camoufox engine has 1,147 stars (as of CamoFox repo, which inherits Camoufox's credibility) and active community engagement.
- CamoFox claims to bypass Google, Cloudflare, and "most bot detection" systems.

**Negative signals / caveats:**
- **DataDome has published a detection guide for Camoufox** ([datadome.co/anti-detect-tools/camoufox/](https://datadome.co/anti-detect-tools/camoufox/)), indicating that enterprise bot detection vendors are actively studying and fingerprinting Camoufox specifically. DataDome looks for internal inconsistencies between canvas/WebGL outputs, AudioContext signatures, and timezone settings.
- **Camoufox's upstream maintainer (daijro) has acknowledged performance degradation** in 2025-2026 due to a gap in maintenance. The base Firefox version fell behind, and new fingerprint inconsistencies were discovered. The latest 2026 releases are described as "highly experimental" and "not suitable for production use."
- **IP-based detection remains a weakness**. Camoufox/CamoFox alone cannot solve IP reputation issues. Without quality residential proxies, fingerprint spoofing is insufficient.
- **No head-to-head benchmarks** against MultiLogin, GoLogin, or Dolphin Anty have been published by independent parties. The comparison data that exists comes from competing vendors (GoLogin published a "Camoufox vs GoLogin" comparison, which is not impartial).

**Honest assessment**: CamoFox/Camoufox is strong for open-source anti-detection, likely the best available OSS option. But it is not on par with commercial anti-detect browsers (MultiLogin, GoLogin) that have dedicated teams maintaining fingerprint consistency and regularly testing against evolving detection. The upstream instability is a real concern.

### 4. Project Activity

| Metric | Value |
|---|---|
| **Last commit** | 2026-03-22 (8 days ago) |
| **Last release** | v1.4.1 (2026-03-22) |
| **Release cadence** | Roughly monthly (v1.3.0 Feb 22, v1.4.0 Mar 9, v1.4.1 Mar 22) |
| **Stars** | 1,147 |
| **Forks** | 132 |
| **Open issues** | 4 (including a significant 20-bug report and a mouse simulation feature request) |
| **Contributors** | Primarily 1 (skyfallsin with 67 commits); 3 minor contributors |
| **Language** | JavaScript (Node.js) |

**Bus factor risk**: This is essentially a single-developer project. The primary contributor (`skyfallsin`) appears to be the askjo.ai team lead. If they move on, the project stalls.

### 5. Licensing

**MIT License** -- fully permissive. CamoFox can be used, modified, and distributed commercially without restriction. Camoufox upstream is also open source.

### 6. Automation Compatibility (Playwright/Puppeteer/CDP)

- **Playwright**: YES. CamoFox uses Playwright internally to drive Camoufox. Camoufox is described as "fully compatible with your existing Playwright code" -- you only need to change the browser initialization.
- **Puppeteer**: NOT directly. Puppeteer uses CDP (Chrome DevTools Protocol), which is Chromium-specific. Camoufox is Firefox-based and uses the Juggler protocol. However, Playwright supports both Chromium and Firefox, so Playwright is the integration path.
- **CDP**: NO. Camoufox does not expose CDP. It uses a patched version of Juggler, Firefox's automation protocol. This is actually an advantage -- anti-bot systems heavily target CDP artifacts because 90%+ of bots use Chromium.
- **REST API**: YES. CamoFox wraps everything in a REST API, so any HTTP client can drive it. This is the primary integration point for PolicyLift.

### 7. Limitations

1. **Single-maintainer upstream risk**: Camoufox's original creator had a maintenance gap. CamoFox depends on Camoufox.
2. **Firefox market share is tiny (~3%)**: Using Firefox in an environment where most real users use Chrome may itself be a signal, depending on the carrier portal's detection sophistication.
3. **IP reputation is not solved**: CamoFox provides fingerprint spoofing but does not include proxy infrastructure. You must bring your own residential proxies.
4. **No built-in CAPTCHA solving**: CamoFox has an open issue (#40) requesting Cloudflare Turnstile support. Currently, CAPTCHAs must be solved externally.
5. **Memory footprint**: ~40MB idle but ~735MB with an active browser session (per issue #32). Not trivial for serverless.
6. **Not cloud-native**: CamoFox is designed as a self-hosted server, not a managed cloud service. Deployment on Fly.io/Railway is supported but requires managing infrastructure.
7. **Detection vendors are adapting**: DataDome has published specific Camoufox detection techniques. As Camoufox gains popularity, detection will improve.
8. **Experimental upstream**: Camoufox's 2026 releases are explicitly marked as experimental and not production-ready.

### 8. Bot Detection Landscape (Carrier Portal Context)

Insurance carrier portals typically use one or more of these detection systems:

| Detection System | Primary Techniques | Prevalence | Anti-Detect Difficulty |
|---|---|---|---|
| **Cloudflare Bot Management** | JS challenges, behavioral analysis, TLS fingerprinting, browser integrity checks | Very high -- used by many SaaS/web apps including some carrier portals | Medium. CamoFox/BrowserBase both claim to handle basic Cloudflare. Advanced Cloudflare (with Bot Management, not just free-tier) is harder. BrowserBase has a Cloudflare partnership ("Signed Agents"). |
| **Akamai Bot Manager** | Behavioral analysis, ML-based detection, device fingerprinting, sensor data collection | High -- common in enterprise/financial services | Hard. Akamai collects mouse movements, keystroke timing, scroll patterns, and touch events. Requires sophisticated behavioral mimicry. |
| **DataDome** | Real-time ML, fingerprint consistency analysis, IP reputation, device intelligence | Medium -- growing in adoption | Hard. DataDome actively publishes Camoufox detection research. They look for subtle fingerprint inconsistencies. |
| **PerimeterX/HUMAN** | Behavioral biometrics, proof-of-work challenges, predictive bot detection | Medium | Hard. Heavy behavioral analysis. Mouse movement patterns and interaction timing are key signals. |
| **Kasada** | Proof-of-work challenges, tamper detection, behavioral analysis | Low-Medium | Very Hard. Kasada's proof-of-work challenges are computationally expensive and specifically designed to be uneconomical for bots. |
| **F5 Shape Security** | Deep behavioral analysis, ML models, encrypted telemetry | Medium in insurance/financial | Very Hard. Shape collects encrypted telemetry that is difficult to spoof or intercept. |
| **reCAPTCHA / hCaptcha / Turnstile** | Visual challenges, behavioral scoring, device reputation | Very high (standalone or embedded) | Medium. Third-party CAPTCHA solvers exist (2Captcha, CapSolver) but add latency and cost. |

**Insurance-specific observations**: Most carrier portals are enterprise applications. They tend to use Cloudflare (most common), Akamai, or Imperva/Incapsula rather than specialized bot detection like Kasada. Many smaller carriers have minimal bot detection beyond basic rate limiting and session management. The bigger risk for PolicyLift may be carrier-specific session management (timeouts, CSRF tokens, multi-step form state) rather than sophisticated bot detection per se.

**Most effective anti-detection techniques by system:**
- **Cloudflare**: Residential proxies + consistent fingerprints + TLS fingerprint matching (Camoufox handles the latter via Firefox's native TLS stack, which is less scrutinized than Chrome's)
- **Akamai**: Human-like behavioral patterns (mouse movement, timing) + residential proxies + consistent fingerprints
- **DataDome**: Internal fingerprint consistency (all properties must tell the same story) + clean IP reputation + behavioral patterns
- **PerimeterX/HUMAN**: Behavioral biometrics are the main hurdle -- requires realistic mouse, keyboard, and scroll patterns

---

## SECTION 2: BrowserBase Takeaways & Integration Strategy

### 1. BrowserBase's Built-in Anti-Detection Features

BrowserBase ([browserbase.com](https://www.browserbase.com), [docs.browserbase.com](https://docs.browserbase.com)) provides two stealth tiers:

#### Basic Stealth Mode (all plans)
- Automatic generation of random, realistic fingerprints per session
- Random viewport sizes
- Visual CAPTCHA solving (automatic)
- Surface-level bot detection bypass

#### Advanced Stealth Mode (Scale Plan only)
- Custom-built Chromium browser maintained by BrowserBase's stealth team
- Human-like environmental signals
- OS selection (Windows, Mac, Linux, Mobile, Tablet) to match target environment
- Fingerprint + viewport handled automatically (you can no longer customize fingerprints directly -- BrowserBase phased this out based on "performance feedback," likely meaning users were misconfiguring them)
- **Cloudflare partnership**: "Browserbase Identity" provides cryptographic authentication for official Cloudflare bypass via their "Signed Agents" program

#### Additional features
- **Residential proxies**: Built-in, US-focused by default, with geo-targeting by city/state/country across 201 countries
- **Custom proxies**: Bring your own HTTP/HTTPS proxies with domain-based routing rules
- **Automatic CAPTCHA solving**: Built-in, can be disabled
- **Session Live View**: Real-time browser viewing with read/write interaction (for human-in-the-loop MFA, CAPTCHA fallback)
- **Session recording/replay**: For debugging and failure analysis
- **Browser extensions**: Custom Chrome extensions can be loaded (uploaded as .zip)
- **Long-running sessions**: Explicitly supported
- **Playwright, Puppeteer, Selenium**: All supported natively

### 2. Gaps in BrowserBase's Anti-Detection

| Gap | Why It Matters for PolicyLift |
|---|---|
| **Chromium-only** | BrowserBase runs a custom Chromium, not Firefox. Anti-bot vendors have invested heavily in detecting Chromium-based automation (CDP artifacts, Chromium-specific tells). Firefox-based approaches like Camoufox face less scrutiny. |
| **No behavioral mimicry** | BrowserBase handles fingerprints but does not provide human-like mouse movement, typing cadence, or scroll patterns. PolicyLift's Playwright scripts need to implement this themselves. |
| **Fingerprint customization removed** | You can't fine-tune fingerprints to match a specific persona. BrowserBase auto-generates them, which means you can't maintain a consistent "identity" across sessions to the same carrier portal (which may be important if carriers track returning users). |
| **No persistent browser profiles** | Each session gets a fresh fingerprint. For carrier portals where agents log in repeatedly, the browser profile changing every time may itself be a detection signal. |
| **Advanced stealth is Scale Plan only** | Pricing for Scale is not publicly listed (enterprise sales). The free/developer tiers only get basic stealth. |
| **Cloudflare bypass is partnership-specific** | The "Signed Agents" Cloudflare bypass requires carrier portals to be on Cloudflare and BrowserBase to have an active relationship with them. This likely doesn't cover insurance carrier portals. |

### 3. CamoFox / Custom Firefox Compatibility with BrowserBase

**Short answer: No.** BrowserBase does not support bringing your own browser binary. It runs a managed Chromium environment. You cannot load a Camoufox/Firefox binary into a BrowserBase session.

**You can load Chrome extensions** into BrowserBase sessions (uploaded as .zip), but this is limited to Chrome extension APIs -- you can't fundamentally change the browser engine.

**Implication for PolicyLift**: CamoFox and BrowserBase are **complementary but mutually exclusive** runtime options. You would either:
- **Option A**: Use BrowserBase's managed infrastructure with its built-in stealth (Chromium-based)
- **Option B**: Self-host CamoFox on your own infrastructure (Fly.io, Railway, VPS) for Firefox-based stealth
- **Option C**: Hybrid -- use BrowserBase for carriers with lighter bot detection, CamoFox for carriers with aggressive detection that BrowserBase can't bypass

### 4. Concrete Strategies for Minimizing Detection in BrowserBase Sessions

#### Session Configuration
```javascript
// Use Advanced Stealth with OS matching
const session = await browserbase.createSession({
  projectId: PROJECT_ID,
  browserSettings: {
    // Advanced stealth mode (Scale plan required)
    stealth: true,
    // Match the OS the agent would realistically use
    fingerprintOptions: { operatingSystems: ['windows'] },
    // Enable CAPTCHA solving
    solveCaptchas: true,
  },
  // Enable residential proxy with geo-targeting
  proxies: [{
    type: 'browserbase',
    geolocation: {
      state: 'TX',  // Match agent's actual state
      country: 'US'
    }
  }],
  // Keep session alive for multi-page form fills
  keepAlive: true,
});
```

#### Behavioral Patterns (implement in your Playwright scripts)
1. **Add realistic delays between actions**: 500-2000ms between field entries, not instantaneous. Use randomized delays following a normal distribution.
2. **Implement human-like typing**: Don't `fill()` entire fields at once. Use `type()` with per-character delays (50-150ms, randomized). Occasionally make and correct typos for high-risk portals.
3. **Mouse movement before clicks**: Move to the element before clicking. Use intermediate waypoints rather than teleporting. Libraries like `ghost-cursor` can help.
4. **Scroll naturally**: Don't jump to elements. Scroll incrementally with momentum simulation.
5. **Tab between fields**: Real users tab between form fields rather than clicking each one.
6. **Realistic session timing**: Don't fill forms faster than a human could read them. A multi-page form that takes a human 5-10 minutes should take automation at least 3-5 minutes.
7. **Session warm-up**: Navigate to the carrier's homepage first, pause briefly, then navigate to the login page. Don't deep-link directly to the form URL on session start.

#### Proxy Strategy
- Use **residential proxies** with geo-targeting that matches the agent's actual location.
- **Rotate proxies between carriers** but keep consistent proxies for sessions to the same carrier.
- Avoid datacenter IPs entirely for carrier portals -- they are almost always flagged.

#### Fingerprint Consistency
- Since BrowserBase auto-generates fingerprints, ensure you're using `keepAlive: true` for multi-page form fills so the fingerprint stays consistent within a session.
- For carriers where agents log in repeatedly over days/weeks, the changing fingerprint per session is a risk. Consider whether cookies/session persistence can mitigate this.

### 5. BrowserBase Best Practices for Long-Running Form-Fill Sessions

1. **Use `keepAlive: true`**: Prevents the session from being garbage-collected during multi-page form fills. Without this, BrowserBase may terminate idle-seeming sessions.
2. **Handle navigation carefully**: Carrier forms often use multi-step wizards with server-side state. Use `waitForNavigation` or `waitForSelector` rather than fixed timeouts.
3. **Implement retry logic**: Network-level retries for BrowserBase API calls. If a session drops, capture the error, screenshot the last state, and start a new session.
4. **Use Session Live View for MFA**: When a carrier requires MFA, surface the Live View URL to the agent for manual intervention. BrowserBase supports read/write Live View, so the agent can type the MFA code directly.
5. **Set reasonable timeouts**: Carrier forms can be slow. Use generous page load timeouts (30-60s). BrowserBase's default handler timeout may be too aggressive.
6. **Capture session recordings on failure**: BrowserBase provides session replay for debugging. Enable this for all sessions, not just failures.
7. **Monitor session health**: Use BrowserBase's Session Inspector and structured logs to detect when carrier scripts break.

### 6. Headed Mode and Anti-Detection

BrowserBase supports **Session Live View**, which is effectively headed mode -- you can see and interact with the browser in real-time via a URL. This is useful for:
- Human-in-the-loop MFA handling
- CAPTCHA fallback when auto-solve fails
- Debugging carrier portal issues in real-time
- Giving agents visibility into what the automation is doing

However, the browser itself runs in a cloud environment. "Headed mode" in the traditional sense (a visible browser window on a local machine) is not what BrowserBase provides. The Live View is a remote stream. For anti-detection purposes, BrowserBase's headless mode is patched (via their custom Chromium) to appear headed, so the detection concern is handled at the fingerprint level.

### 7. BrowserBase Alternatives with Better Anti-Detection

| Alternative | Anti-Detection Strength | Trade-offs |
|---|---|---|
| **Bright Data Scraping Browser** | Strongest. 72M+ IP pool, automatic CAPTCHA solving, fingerprinting, IP rotation. | Very expensive ($499/mo minimum). Overkill pricing for PolicyLift's 3-10 sessions/day volume. |
| **nstbrowser** | Cloud-native with anti-detect features, enterprise focus. | Newer, smaller ecosystem. Less proven at scale. |
| **Browserless** | Open-source, self-hostable. Stealth via Puppeteer plugins. | Requires manual stealth configuration. More DevOps burden. |
| **Skyvern** | AI-driven, adapts to layout changes. Built-in CAPTCHA/2FA handling. | ~$0.10/page. Not focused on anti-detection per se, but on resilience to UI changes. Interesting for the self-healing angle. |
| **Self-hosted CamoFox** | Best OSS anti-detection via Firefox C++ patches. | Not managed infrastructure. Single-maintainer risk. No CAPTCHA solving. |
| **MultiLogin / GoLogin / Dolphin Anty** | Commercial anti-detect browsers with dedicated stealth teams and regular updates. | Designed for manual multi-accounting, not API-driven automation. Integration with Playwright is possible but not their primary design. Pricing is per-profile. |

**Recommendation**: BrowserBase remains a reasonable choice for PolicyLift given the serverless architecture preference and low operational burden. Its weaknesses (behavioral mimicry, Chromium-only) can be partially mitigated with good Playwright scripting practices. For carriers with aggressive bot detection that BrowserBase can't handle, a self-hosted CamoFox instance on Fly.io is a viable fallback, though it increases operational complexity.

---

## Summary: What We Know vs. What's Speculation

### What we know (confirmed via documentation, source code, public data):
- CamoFox is a Node.js REST API wrapping the Camoufox Firefox fork, MIT licensed, actively maintained (last release March 22, 2026)
- Camoufox implements C++ level fingerprint spoofing for navigator, screen, WebGL, canvas, WebRTC, audio, and fonts
- BrowserBase provides two tiers of stealth (basic and advanced), with advanced requiring Scale plan
- BrowserBase is Chromium-only; you cannot bring a custom Firefox binary
- BrowserBase has a Cloudflare partnership for cryptographic bot bypass
- DataDome has published specific Camoufox detection techniques
- Camoufox upstream had a maintenance gap and 2026 releases are marked experimental

### What's uncertain (reasonable inference but not confirmed):
- How many insurance carrier portals use sophisticated bot detection vs. basic session management
- Whether Camoufox's experimental status actually degrades its anti-detection effectiveness in practice
- Whether BrowserBase's Cloudflare "Signed Agents" partnership would cover any insurance carrier portals
- The long-term viability of CamoFox given its single-maintainer bus factor
- Whether Firefox's 3% market share is a meaningful detection signal for carrier portals

### What we don't know:
- How BrowserBase's Advanced Stealth compares to CamoFox in controlled testing against specific carrier portals
- Which specific bot detection systems are deployed on each carrier portal PolicyLift needs to target
- Whether any carrier has explicitly blocked BrowserBase or Camoufox traffic
- BrowserBase Scale Plan pricing

---

## Sources

- [CamoFox Browser GitHub](https://github.com/jo-inc/camofox-browser)
- [Camoufox Official Site](https://camoufox.com)
- [Camoufox GitHub](https://github.com/daijro/camoufox)
- [DataDome Camoufox Detection Guide](https://datadome.co/anti-detect-tools/camoufox/)
- [CamoFox Deep Dive (pradeep.md)](https://pradeep.md/2026/02/10/camofox-browser-deep-dive.html)
- [BrowserBase Documentation](https://docs.browserbase.com)
- [BrowserBase Stealth Mode Docs](https://docs.browserbase.com/features/stealth-mode)
- [Camoufox vs GoLogin (GoLogin blog)](https://gologin.com/blog/camoufox-vs-gologin-honest-review/)
- [Camoufox Alternatives (DiCloak)](https://dicloak.com/blog-detail/camoufox-alternatives-in-2025-choosing-the-best-antidetect-browser-for-your-needs)
- [BrowserBase Alternatives (roundproxies.com)](https://roundproxies.com/blog/best-browserbase-alternatives/)
- [Browserless vs BrowserBase](https://www.browserless.io/blog/browserless-vs-browserbase)
- [Web Scraping with Camoufox (Bright Data)](https://brightdata.com/blog/web-data/web-scraping-with-camoufox)
- [Camoufox WebGL Fingerprinting (DeepWiki)](https://deepwiki.com/daijro/camoufox/3.3-webgl-configuration)
