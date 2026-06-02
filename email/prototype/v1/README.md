# PolicyLift Prototype — Email Tool (v1)

> **Forked from `proto-skeleton/` on 2026-05-30 (commit f5d709d) as the email-tool prototype.**
> Standalone copy — serve this folder directly (`npx serve .`). New email-tool screens go
> here; `proto-skeleton/` stays the current-platform baseline. Pull baseline updates in
> deliberately (re-copy changed files / re-run the build) rather than depending on it live.


Clickable, platform-accurate prototype of the PolicyLift app. Built the same way
as the Fairs.com proto-skeleton: we **capture** real platform pages (saved HTML +
the platform's compiled CSS) and **rebuild** clean, clickable pages on top of the
platform's own design tokens — so it looks like the real thing without touching
the production codebase.

Two areas (mirrors Fairs' manager/public split):

- **Agency** — the authenticated agency app (sidebar + content). Where the email
  tool (Segments / Templates / Broadcasts / Automations) will be prototyped.
- **Public** — customer-facing surfaces (quote-packet forms, template selectors).
  *Coming later.*

The platform is **Next.js + Tailwind v4 + shadcn/ui** (new-york, neutral base,
lucide icons, class-based dark mode). Brand green is `--primary: #12b76d`; the
sidebar is dark (`--sidebar: #1e1f21`).

---

## Run it

From the `proto-skeleton/` directory:

```bash
npx serve .
```

Open <http://localhost:3000>. The root page links to both areas. (Serve from
inside `proto-skeleton/` so the absolute `/assets/...` and `/agency/...` paths
resolve.)

---

## Current state

### Agency

| Sidebar item    | Status      | What exists                                   |
| --------------- | ----------- | --------------------------------------------- |
| Dashboard       | ✅          | `agency/dashboard.html` — Recent Quote Packets + Recent Conversations tables, My Work/All tabs, Create Quote Packet button |
| Conversations   | ✅          | `agency/conversations.html` — 4 stat cards + Calls/Chats/Forms sub-tabs + call list |
| Quote Packets   | ✅          | `agency/quote-packets.html` — Packets/AOP tabs, search/filter, table/kanban toggle, 6-column kanban board |
| My Forms        | ✅          | `agency/my-forms.html` — Master Form Link card + per-insurance-type form-link cards (Copy Agency/Personal Link) |
| **Campaigns** ▸ | group       | **new email-tool group** (collapsible) — the tool replacing Reach |
| Campaigns ▸ Segments        | ✅       | `agency/segments.html` — segment library list (Managed/Regular kind badge, count with unit, last modified, search + kind filter, New Segment) |
| Campaigns ▸ Templates / Broadcasts / Automations | ⏳ stub | dimmed `#` links — to build |
| **Marketing** ▸ | group       | collapsible group (expandable).               |
| Marketing ▸ E-Mails        | ⛔ skipped | current **Reach**-backed feature (`/campaigns`) — being *replaced* by the new email tool, so not rebuilt |
| Marketing ▸ Reviews        | ⛔ skipped | current **Reach**-backed feature — out of scope for now |
| Marketing ▸ Website Wizard | ✅       | `agency/website-wizard.html` — wizard panel + site-preview area (static **placeholder image** — the saved builder preview didn't render without its JS) |
| **Tools** ▸     | group       | collapsible group (expandable).               |
| Tools ▸ Agency Hub          | ✅       | `agency/agency-hub.html` — Details/Coverage/Licensing/Carriers/Team/Integrations tabs + left sub-nav (Key & Details, Brand & Logo, Locations…) + form panel |
| Tools ▸ Bookings & Calendars| ✅       | `agency/bookings.html` — Appointments/Calendar/Configure tabs + stat cards + appointments list |
| Tools ▸ Video Proposals     | ✅       | `agency/video-proposals.html` — search + Record Proposal + proposals table (Title/Password/Views/Created) |
| Tools ▸ Accounts            | ✅       | `agency/accounts.html` — Accounts/Contacts tabs, search + type/time filters, accounts table (empty state) |

The full sidebar nav is in place (from a Marketing/Tools-expanded capture) with a
working accordion (`wireGroups()` in `agency-chrome.js`). Every captured page has
been rebuilt. The two remaining dimmed links — **Marketing ▸ E-Mails / Reviews** —
are the current **Reach** integration we're replacing, so they're intentionally
left unbuilt (the email tool that replaces Reach is a separate workstream).

### Public

Not started. Will get its own chrome (no sidebar) when we build the first
customer-facing page.

---

## How the chrome works

Each agency page is **just its content** in the body:

```html
<body class="inter_… geist_… antialiased" data-page-active="dashboard">
  …page content (what lives in the platform's @container area)…
</body>
```

`assets/agency-chrome.js` runs on load and:

1. fetches `assets/chrome/agency-shell.html` (the shadcn Sidebar + main shell),
2. moves the page's content into the shell's `#agency-content` slot,
3. sets `data-active="true"` on the sidebar link whose `data-nav` matches
   `data-page-active` (shadcn's CSS does the active styling — no class swapping),
4. wires the sidebar collapse toggle + the collapsible nav groups (Marketing /
   Tools accordion), dims unbuilt links (`href="#"`), and
5. loads `assets/proto-settings.js` (gear, bottom-right).

To change the sidebar/nav, edit **`assets/chrome/agency-shell.html`**.

### Prototype settings (gear, bottom-right)

`assets/proto-settings.js` renders a slide-in drawer. **Global** section has a
**Theme** Light/Dark toggle (flips `.dark` on `<html>` — the bundle ships full
dark tokens). A page can add its own toggles by declaring
`window.__protoToggles = [...]` before the chrome script; each sets
`body[data-<key>]` and the page owns the reaction. State persists in localStorage.

---

## Adding an agency page

1. **Save the platform page.** In a logged-in session, browser → Save As
   "Webpage, Complete". Drop it in `html refs/` named `agency <name>.html`
   (its `_files/` folder comes along). The first save also bootstrapped the
   compiled CSS (`assets/app.css`) and the chrome — later saves are just for the
   page body.
2. **Create the page** at `agency/<name>.html` using the template below.
3. **Lift the content.** Copy the inner of the platform's
   `<div class="@container p-6 py-10 sm:p-10">` into the body.
4. **Clean runtime cruft:** strip `id="radix-…"`, `aria-controls/​describedby/​labelledby="radix-…"`,
   `data-radix-collection-item`. **Keep** all `data-slot`, `data-state`, and class
   attributes — the compiled CSS keys off them.
5. **Neutralize external links:** `href="https://app.policylift.ai/…"` → `href="#"`
   (or point at the proto page once it exists).
6. **Wire the nav.** In `assets/chrome/agency-shell.html`, give the matching
   sidebar link a real `href` (and add a `data-nav` if it's new). Dimmed links
   light up automatically once they point somewhere real.

### Minimal agency page template

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Page — PolicyLift</title>
<script>try{if(localStorage.getItem('proto-toggle-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:opsz,wght@14..32,100..900&display=swap">
<link rel="stylesheet" href="/assets/app.css">
<link rel="stylesheet" href="/assets/fonts.css">
<style>body{visibility:hidden}</style>
<script src="/assets/agency-chrome.js" defer></script>
</head>
<body class="inter_fe8b9d92-module__LINzvG__variable geist_91de93b2-module__aTViIa__variable antialiased" data-page-active="my-nav-id">
  <!-- page content goes directly here -->
</body>
</html>
```

The two `…_variable` body classes set `--font-inter` / `--font-geist` (see
`assets/fonts.css`). `body{visibility:hidden}` avoids a flash before the chrome
wraps the page.

---

## Known quirks / gotchas

- **Interactive widgets are static.** Radix tabs, selects ("Assign"), dropdowns
  render but don't open — the proto ships no app JS. The active tab is whichever
  was active in the capture. Add tiny inline JS only if a flow needs it.
- **Captured page may actually be the login route under the hood.** The saved
  dashboard's RSC payload was the login shell; we only lift the rendered DOM
  (sidebar + `@container`) and strip all `<script>`/`__next_f` data.
- **Fonts** come from Google Fonts (Inter + Geist); the platform's woff2 aren't
  in the saves. Visually identical.
- **External links** in lifted content are set to `#` to keep the proto
  self-contained — retarget to proto pages as you build them.
- **Don't invent Tailwind classes.** Only classes present in `assets/app.css`
  (the compiled bundle) work; arbitrary utilities silently no-op.

---

## File tree

```
index.html                     Root hub → Agency / Public
README.md
changelog.md
assets/
  app.css                      Platform's compiled Tailwind v4 + theme tokens (from the dashboard save)
  fonts.css                    Inter + Geist wiring (next/font module classes + body default)
  agency-chrome.js             Agency chrome: injects shell, sets active nav, collapse, dim-unbuilt
  proto-settings.js            Settings drawer (gear → slide-in); Theme Light/Dark + per-page toggles
  chrome/
    agency-shell.html          shadcn Sidebar (250px) + main + #agency-content slot — edit nav here
  img/
    policylift-wordmark.svg     Brand wordmark (recolored to --primary green)
    avatar-raghav.png           Sidebar footer user avatar
agency/
  dashboard.html               Dashboard (landing)
html refs/                     "Webpage, Complete" captures of the real app. Prefixed `agency …`.
                               GITIGNORED — local-only source material (large). Built pages don't
                               depend on it at runtime; re-save a page here to rebuild/extend.
```
