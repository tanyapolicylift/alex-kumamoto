# PolicyLift Prototype — Changelog

Running log of how we prototype PolicyLift platform features — what we tried, what
worked, what didn't, and why. Reverse-chronological (newest first). Tag entries
`[proto]`, `[infra]`, `[docs]` so slices are grep-able.

See `README.md` for what's in the skeleton today and how to use it.

---

## 2026-06-02 — `[proto]` Campaigns nav group + Segment Library page (email tool, Step 1)

First email-tool screen. Added a **new collapsible "Campaigns" sidebar group** (the tool replacing Reach) to `assets/chrome/agency-shell.html`, between the top-level items and Marketing — modeled exactly on the Marketing group so `wireGroups()` handles it. Sub-items: **Segments** (live → `/agency/segments.html`), Templates / Broadcasts / Automations (`#`, auto-dimmed). Icon: lucide `send`.

Built **`agency/segments.html`** — the Segment Library list, mirroring Reach's segment list (clients know it): search + Kind filter + New Segment button; table = status dot · name + description · **Kind badge (Managed / Regular)** · count *with unit* ("284 policies" / "150 customers" — unit conveys the anchor) · last modified · row action (**View** for Managed, **Edit** for Regular). 9 mock segments (7 Managed from `../../segment_library_poc.md` S1–S5 + extras, 2 Regular). Static (no JS) — search/filter are display-only for now.

Reused the captured pages' exact table/toolbar/input/select markup. Verified every non-obvious utility class against the compiled `app.css` before using it (badge colors `bg-green-100`/`text-green-700` + `bg-gray-100`/`text-gray-700`, `text-primary-foreground`, `tabular-nums`, etc.) — `bg-primary/10` and shadcn's `badge` component are **not** in the bundle, so badges are built from base utilities.

Blueprint Step 1 done; next is Step 2 (Segment Detail) per `blueprint.md`.

---

## 2026-05-29 — `[proto]` Website Wizard page + preview-iframe handling

From `html refs/agency website wizard.html` (Marketing ▸ Website Wizard). Wrapper
had `@container … flex flex-col` (prefix match handles it). The page embeds a live
site-**preview `<iframe>`** whose saved src was `./agency website wizard_files/
a2ae7666.html` (a full third-party Duda-style builder page with a deep local asset
tree). Rather than copy/curate that tree, the iframe is repointed at the capture
folder with URL-encoded spaces:
`src="/html%20refs/agency%20website%20wizard_files/a2ae7666.html"` — the Fairs
"load from the reference folder" pattern, so all the preview's relative CSS/JS/HTML
resolve in place.

**Update (same day):** the saved builder preview rendered broken without its JS
(misplaced sections, empty device frames). Replaced the iframe with a static
**placeholder image** (`assets/img/website-preview-placeholder.png` — a clean
screenshot of the responsive preview, green toolbar + desktop/tablet/phone
mockups) and dropped the card's `min-h-[80vh]` so it hugs the image. The iframe +
its capture-folder asset tree are no longer referenced by the page.

**Scope note / correction:** Marketing ▸ **E-Mails (`/campaigns`) and Reviews are
the current Reach integration we're replacing** — not the email tool. So they're
intentionally NOT being rebuilt (supersedes the earlier "E-Mails is the email-tool
entry point" note). The email tool that replaces Reach is a separate workstream.

With Website Wizard done, **every page we intend to build from the current captures
is built**; the only unbuilt sidebar links are the deliberately-skipped Reach ones.

---

## 2026-05-29 — `[proto]` Video Proposals page added — all saved captures rebuilt

From `html refs/agency video proposals.html` (Tools ▸ Video Proposals). Standard
extraction. Content: header + search + Record Proposal button + proposals table
(Title / Password [masked] / Views / Created / actions). Sidebar link un-dimmed.

**Milestone:** every capture in `html refs/` is now rebuilt. The only remaining
dimmed sidebar links are the **Marketing** group (E-Mails → `/campaigns`, Reviews,
Website Wizard) — they need their own captures. E-Mails is the email-tool entry.

---

## 2026-05-29 — `[proto]` Bookings & Calendars page added

From `html refs/agency bookings.html` (Tools ▸ Bookings & Calendars). Standard
extraction. Content: header + Appointments/Calendar/Configure tabs + stat cards
(several "Coming Soon"/disabled) + appointments list. Sidebar link un-dimmed.
Remaining capture: video proposals.

---

## 2026-05-29 — `[proto]` Agency Hub page added

From `html refs/agency agency hub.html` (Tools ▸ Agency Hub). Wrapper had an extra
`overflow-hidden` class, so extraction now prefix-matches `@container p-6 py-10
sm:p-10` instead of requiring the exact closing quote. Content: top tabs (Details
/ Coverage / Licensing / Carriers / Team / Integrations) + a left vertical sub-nav
(Key & Details / Brand & Logo / Locations / …) + the Details→Key&Details form
panel. All tabs static. Sidebar link un-dimmed. Remaining captures: bookings,
video proposals.

---

## 2026-05-29 — `[proto]` Accounts page + full expanded sidebar nav + accordion

Martin supplied a Marketing/Tools-**expanded** sidebar capture, revealing the full
nav. Rebuilt `assets/chrome/agency-shell.html`'s sidebar-inner from it:

- **Marketing** group → E-Mails (`/campaigns`), Reviews, Website Wizard. **E-Mails
  is the email tool's entry point** (so the email work hangs off Marketing →
  E-Mails → `/campaigns`, not a Segments/Templates/... sub-nav as previously
  guessed).
- **Tools** group → Agency Hub, Bookings & Calendars, Video Proposals, **Accounts**.
  So Accounts (and agency-hub/bookings/video-proposals) live under Tools, not the
  top level.

All 11 nav items wired with `data-nav` + proto hrefs (built → real page, rest →
`#`/dimmed); avatar repointed from the (expiring) Supabase signed URL to the local
asset; Radix ids stripped; `data-active` reset (chrome.js owns active state).

Added a **collapsible-group accordion** to `agency-chrome.js` (`wireGroups()`):
each `[data-slot="sidebar-group"]` with a toggle button + submenu div toggles on
click and rotates its chevron via inline `transform` (right = closed, down = open).
Groups start expanded. **Note:** the static `rotate-90` class had to be stripped
from the chevrons — Tailwind v4's `rotate-*` sets the CSS `rotate:` property, which
*stacks* with our `transform: rotate(...)` (open showed 180°/left, closed 90°/down).
With the class gone, the JS transform is the single source of truth.

**Accounts page** (`agency/accounts.html`) built from `html refs/agency accounts
blank.html` — Accounts/Contacts tabs, search + All Types/All Time filters, accounts
table in its empty "No accounts found" state. Sidebar Accounts link → live.

Remaining captures not yet rebuilt: agency hub, bookings, video proposals.

---

## 2026-05-29 — `[proto]` My Forms page added

Fourth agency page, from `html refs/agency form links.html`. Same extraction; no
dnd/assets. Content: header + a grid of 14 cards — a highlighted "Master Form
Link" card (Copy Agency Link / Copy Personal Link) plus per-insurance-type
form-link cards (Auto Insurance, etc., each with a personal/commercial badge and
copy buttons). Copy buttons are static. Sidebar "My Forms" link un-dimmed →
`/agency/my-forms.html`.

**All four top-level sidebar links are now built and wired** (Dashboard,
Conversations, Quote Packets, My Forms). Remaining nav: the collapsible Marketing
and Tools groups (sub-items TBD — Marketing is where the email tool lands).

---

## 2026-05-29 — `[proto]` Quote Packets page added

Third agency page, from `html refs/agency quote packets kanban.html`. Same
extraction; cleanup extended to strip dnd-kit refs too (`id`/`aria-describedby`
pointing at `DndDescribedBy-*` / `DndLiveRegion-*`, whose live-region targets are
portaled outside `@container`).

Content: header + "New Quote Packet" + Packets/AOP tabs + toolbar (search, filter,
My Work/All, table/kanban view toggle — kanban active) + a 6-column kanban board
(Started / Collecting Data / Finalizing / Quoted / Binded / Lost) of draggable
cards. Drag, search, filter, tabs are all static (no app JS). Sidebar "Quote
Packets" link un-dimmed → `/agency/quote-packets.html`.

---

## 2026-05-29 — `[proto]` Conversations page added

Second agency page, built from `html refs/agency conversations.html` (same
extraction: lift the `@container` inner, strip Radix ids, neutralize external
`app.policylift.ai` links → `#`). No local assets needed (the only `<img>` is the
sidebar avatar; no audio/charts in the content).

Content: header + Conversations/Configure tabs + 4 stat cards (Calls / Avg Call
Duration / Avg Call Score [disabled] / Top Policy Type) + Calls/Chats/Form-
submissions sub-tab bar with a long call list (capture had 744 calls; ~230 rows
rendered). Tabs/sub-tabs are static (no app JS). Sidebar "Conversations" link
un-dimmed and pointed at `/agency/conversations.html`.

Page is large (~290 KB) — it's just a faithfully long list; no blobs/scripts.

---

## 2026-05-29 — `[infra]` Skeleton bootstrapped from the dashboard capture

First build. Modeled on the Fairs.com `proto-skeleton` (capture-the-real-HTML +
rebuild-on-compiled-CSS approach), adapted to PolicyLift's stack: **Next.js +
Tailwind v4 + shadcn/ui** (new-york, neutral base, lucide, class-based dark mode).

Bootstrapped everything from the single **agency dashboard** save in `html refs/`:

- **`assets/app.css`** — copied verbatim from the dashboard save's compiled bundle
  (`55f799b475876196.css`, 167 KB). Carries the theme tokens: `--primary #12b76d`,
  `--sidebar #1e1f21`, `--sidebar-accent-foreground #85ec7c` (active nav), full
  `:root` + `.dark` sets, and every utility the captures use. No external `url()`s.
- **`assets/fonts.css`** — the platform ships Inter + Geist via next/font but the
  woff2 aren't in the saves (broken `../media/` paths), so we load both from Google
  Fonts in each page's `<head>` and re-declare the two next/font CSS-module classes
  the platform puts on `<body>` (they set `--font-inter` / `--font-geist`).
- **Chrome** — unlike Fairs (which swaps classes for active nav), shadcn drives
  active styling off `data-active`, so `agency-chrome.js` just sets
  `data-active="true"` on the `[data-nav]` link matching `<body data-page-active>`.
  The sidebar + main shell is factored once into `assets/chrome/agency-shell.html`
  (extracted from the capture: sidebar subtree + a `#agency-content` slot; Radix
  ids stripped, avatar path rewritten, nav links given `data-nav` + proto hrefs).
  Collapse toggle wired (expanded ↔ icon-rail). Unbuilt links (`#`) are dimmed.
- **`agency/dashboard.html`** — the capture's `@container` content lifted and
  cleaned (Radix runtime ids removed; external `app.policylift.ai` links → `#`).
  Recent Quote Packets + Recent Conversations tables, My Work/All tabs, Create
  Quote Packet button.
- **`proto-settings.js`** — slimmed from Fairs. Global **Theme** Light/Dark toggle
  (flips `.dark` on `<html>`; the bundle ships full dark tokens). Per-page toggle
  mechanism (`window.__protoToggles`) retained. State persisted to localStorage; a
  tiny inline head script restores the theme pre-paint to avoid a flash.
- **`index.html`** — hub linking Agency (live) + Public (disabled, "Soon").
- **`assets/img/`** — `policylift-wordmark.svg` (extracted, recolored to the
  primary green) + `avatar-raghav.png` (from the save).

Sidebar nav as captured: Dashboard / Conversations / Quote Packets / My Forms +
collapsible **Marketing** and **Tools** groups (no sub-items captured). The email
tool will live under **Marketing** — its sub-items are TBD and will come from a
Marketing-expanded capture or from the email brainstorm (`../email/`).

Other captures saved but not yet rebuilt: accounts, agency hub, bookings,
conversations, form links, quote packets kanban, video proposals.

**Open / next:**
- Build the next agency pages from the existing captures (likely Quote Packets
  kanban + Conversations, since they're already in the sidebar).
- Decide the Marketing sub-nav for the email tool (Segments / Templates /
  Broadcasts / Automations per `../email/concepts_working_doc.md`).
- Tabs/selects are static (no app JS) — add minimal inline JS only where a flow
  needs it.
