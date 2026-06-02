# Email Tool Prototype — Blueprint

> **Disposable.** This is the build guide for the email-tool prototype — what screens to build, in what order, and how they map to the design. It deliberately holds **no unique concept content**: the model lives in the `../../` companion docs (`segments.md`, `segment_library_poc.md`, `dynamic-content.md`, `automations.md`, `concepts_working_doc.md`). When the prototype is done, **delete this file** — nothing of record is lost.

Starts with **Segments**; expands to Templates / Broadcasts / Automations as those get built.

---

## How we build (recap of the proto conventions)

Per [`README.md`](README.md): static HTML rebuilt on the platform's compiled CSS (Tailwind v4 + shadcn). Each page is body-only content; `agency-chrome.js` injects the shell. New pages live in `agency/`; nav is edited in `assets/chrome/agency-shell.html`; active state via `data-page-active`. **Only use Tailwind classes already present in `assets/app.css`** — invented utilities silently no-op. Interactive widgets are static unless a flow needs a little inline JS.

Net-new wrinkle vs. the existing pages: the email-tool screens aren't captures of a real platform page — we're *designing* them with the platform's tokens/components. Stick to the shadcn `data-slot` patterns the captured pages already use (tables, tabs, cards, filters, buttons) so it stays platform-accurate.

## Nav plan

A **new collapsible sidebar group** for the email tool (label placeholder — e.g. "Email" / "Outreach" / product name TBD), with sub-items:

- **Segments** ← build first
- Templates *(stub)*
- Broadcasts *(stub)*
- Automations *(stub)*

The existing **Marketing ▸ E-Mails / Reviews** (Reach) stay as-is — this tool *replaces* them eventually, but we leave them dimmed for now. Built sub-items get real hrefs; the rest stay `#`/dimmed (the chrome dims unbuilt links automatically).

## Field-picker stance

Builder field picker shows **`ams.*`** (from the AMS) and **`pl.*`** (from PolicyLift) for now. A curated set of friendly **`calc.*`** fields (e.g. "days until renewal") gets added later — see `segments.md` → Fields by source. Don't build the picker in a way that hard-codes two namespaces only; leave room for a third.

---

## Segments

### The model in one picture (full detail in `segments.md`)

One **Library** + one **Builder**. Two segment kinds (Reach-style): **Managed** = PolicyLift/ops-built, **read-only** to the client; **Regular** = client-built, **editable**. Each library row is marked as such, and the edit affordance is gated by kind. (Tiers collapse into this badge + a builder *mode* — write rules vs. compose existing segments.) There is **no in-product "request a segment"** flow — clients arrange new/changed Managed segments with the ops team directly, out of band.

```
LIBRARY ── browse/search/filter saved segments  (each marked Managed / Regular)
   ├─▶ DETAIL  ── description · live count · sample preview · "Use in Broadcast/Automation"
   │              (Managed → read-only; Regular → Edit)
   └─▶ BUILDER ── Anchor → category conditions → CNF groups → quantifiers → live count + preview → save
                  mode: ( Rules | Compose )   ·   only for Regular segments
```

### Screens to build

1. **Segment Library** *(list)* — Reach-style. Columns: **name + description** (a **Managed** pill sits inline *after* the name; **no pill for Regular**) · **Type** = the anchor as a plural noun (Policies / Accounts / Contacts) · **Count** = a pure number, **right-aligned** (Type now carries the anchor, so the count drops its unit) · **Last modified** = **right-aligned** (trailing column — a date as last column reads better right-aligned, per Tanya/Fairs). **The whole row is clickable → Detail** (`cursor-pointer` + onclick; no per-row Edit/View button). Toolbar: search + **Kind filter** (Managed / Regular); "New Segment" button. *No status dot, no actions column, no category/AMS/owner columns.* **Managed pill = the platform's shadcn green badge** (`bg-green-50 text-green-700 border-green-200`, the "Quote Packet Generated" style). Layout: Name column is greedy (`w-full`, `table-auto`); Type/Count/Last are content-width and cluster at the right edge (the Fairs Documents pattern) rather than floating in fixed-width boxes.
2. **Segment Detail** — full description; current count + refresh; **sample preview** table using the per-anchor display columns (Account: name/primary contact/status/premium · Policy: number/type/carrier/effective/renewal/account · Contact: name/email/role/account); "Use in Broadcast/Automation" CTA. **Managed → read-only** (no edit; a subtle "Managed by PolicyLift" note). **Regular → Edit** opens the Builder.
3. **Segment Builder** *(the real authoring UI — the hard one; Regular segments only)* —
   - **Anchor selector** at top (Account / Policy / Contact) — sets result shape + available fields.
   - **Condition groups** — two-level CNF (AND of OR-groups); "Add condition" / "Add group".
   - **Each condition is category-first**: pick category (Properties / Related records / Engagement / Consent / Membership / Tags) → field picker (`ams.`/`pl.`, categorized + searchable) → operator (by type) → value editor (by type). Child-collection conditions add a **quantifier** (`count > 0` / `= 0` / threshold) + the **same-row** prompt when a 2nd predicate touches the same collection.
   - **Live count + sample preview** panel (right / drawer) — the trust surface.
   - **Save**: name · description · category.
   - **Compose mode**: combine saved segments with include / intersect / except.

### Mock data

A fictional agency. Need: ~8–10 library segments across categories (our S1–S5 from `segment_library_poc.md` + a few like "Active personal lines," "Lapsed last 6 months," "Commercial book"), each with a believable count; mark most as **Managed** (PL-built) and 1–2 as **Regular** (client-built) so both states show. Plus sample accounts / policies / contacts to populate the preview tables. (Can extend from `../../data_object_map.md`.) Counts/SQL are faked — this is a clickable mock.

### Build steps (ordered)

- **Step 1 — Nav group + Segment Library page.** ✅ *Done (2026-06-02).* Added the **Campaigns** group to `agency-shell.html`; built `agency/segments.html` (library list, Managed/Regular badges, 9 mock segments). Nav label chosen: **Campaigns** (may roll into Marketing later).
- **Step 2 — Segment Detail page.** `agency/segment-detail.html` (or a representative one): count + sample preview.
- **Step 3 — Segment Builder.** `agency/segment-builder.html`: anchor → category conditions → CNF groups → quantifier → count/preview → save. The big one; may need minimal inline JS for add-condition / category-switch interactions.
- **Step 4 — Compose mode.** Combine saved segments (include / intersect / except) into a new Regular segment.

### Open prototype decisions (small, settle in-flight)

- Nav group **label** (Email / Outreach / product name).
- How **interactive** the builder is (fully static snapshots vs. minimal inline JS for add/remove condition + category switch). Lean: static for Library/Detail; a little JS for the Builder so it demos.
- Mock **agency identity** (name, a few producers/CSRs) — pick once, reuse across all email-tool screens.

---

## Templates / Broadcasts / Automations

*To expand once Segments screens are up. Each gets its own section here mirroring the Segments structure (model-in-a-picture → screens → mock data → build steps), referencing `templates.md` / `broadcasts.md` / `automations.md`.*
