---
created: 2026-05-21
author: Martin
status: draft
tags: [master-booking-link, design]
---

# Master Booking Link — Improvements

## Context

The master booking link is the page an agency shares so a customer can pick the type of insurance they want before being routed into the type-specific quote flow. Today it's a single scrolling list of every quote template the agency has configured. With ~10-20+ templates, this is hard to scan and customers struggle to find their type.

This document captures the desired behaviors for an improved version. The accompanying prototype demonstrates them in HTML; this doc explains the rules behind it.

## Goals

- Make it fast for a customer to find their insurance type, no matter how many templates the agency has.
- Surface the most common choices first when no other context is available.
- Scale gracefully from 3 templates to 30+ without redesign.
- Work the same way on mobile and desktop; same component, responsive layout.

## Behaviors

### 1. Grouped by category

- Items are grouped into named categories: **Most Popular**, **Vehicles**, **Property**, **Other**.
- Each category has a small uppercase label above its items.
- A category with **zero items is hidden entirely** (label and container both gone). This is true at initial render and when filtering empties a group.
- The exact category taxonomy and which items belong where is a configuration decision, not hardcoded by template name.

### 2. Most Popular section

- The agency designates 1-3 templates as "popular." Today, this is typically the agency's primary Home + Auto products.
- Popular items appear in a single **Most Popular** group at the top of the list.
- **Items move, they don't duplicate.** A popular item appears only in Most Popular, not also in Vehicles or Property. This keeps the page short and avoids duplicate scanning.
- Most Popular is visually distinct: a **green border around the group**, with the internal divider between popular items also drawn in green. The whole section reads as one cohesive "this is what most people pick" block.
- If there are no popular items configured, the Most Popular section doesn't render at all (per the empty-category rule).

### 3. Filter (not search)

- A filter input sits above the grouped list, with placeholder text like "Search coverage types…".
- It's a **filter, not a search.** As the customer types, non-matching cards are hidden in place. The page structure (groups, headers, order) is unchanged.
- Matching is **case-insensitive substring** against the item's title **and** description.
- Categories that empty out during filtering collapse along with their headers (same rule as #1).
- When no items match, the page shows a simple "No matches found." line.
- There is **no result count, no separate "results" view, and no highlight of the matching characters.** Just the existing list with non-matches hidden.
- An X button inside the input clears the filter and restores the full list.

### 4. Filter visibility threshold

- The filter input is **hidden when the agency has fewer than ~5-8 templates total** (exact number TBD). At that size the list is already short enough to scan and a filter input is noise.
- This is a per-page decision, not a per-customer one — based on the agency's configured templates.

### 5. Two contexts the page is used in

| Context | Description | Most Popular section? |
|---|---|---|
| **Case 1 — Generic link** | The agency shares this link directly with a customer who hasn't told us what they want | **Yes** — surface the most common products |
| **Case 2 — Website fallback** | This page sits behind a "Find another type of insurance" CTA on the agency's website, *after* the customer has already declined the Home and Auto CTAs shown above | **No** — Home/Auto are already pinned elsewhere on the page; showing them again is redundant |

The exact way Case 2 is configured (URL param, separate page, an agency-level setting, etc.) is TBD. From a design standpoint it's the same component with Most Popular hidden.

### 6. Naming and descriptions

- **Titles match the agency's template names exactly** (e.g., "Personal Dwelling Fire", "Personal Auto", "Extended Personal Auto"). We do not simplify, rename, or auto-translate.
- **Descriptions are one line.** They retain the technical form codes (HO-3, HO-4, HO-6, DP-1/3, NFIP, etc.) because insurance-savvy customers use them to verify they're picking the right product. They drop filler like "quote template" and the redundant leading word "Personal".
- Descriptions end without a trailing period (a few-word sentence with a period looks awkward).

### 7. Mobile

- Same component, responsive. No separate mobile design.
- On mobile, vertical spacing is tightened (smaller top padding, smaller section gaps, smaller heading) so more cards appear above the fold without scrolling.
- Both header variants (compact bar on mobile, hero band with portal-header image on desktop) come from the existing pattern and stay unchanged.

## Open questions

- **Filter visibility threshold** — exact N. Need data on agency template counts to pick a value.
- **Case 2 configuration** — how is "hide Most Popular" toggled? Per-agency setting? URL param? Different placement page entirely?
- **Card density** — current cards include icon + title + 1-line description (76px tall). A more compact variant (title-only with chevron, rows joined into a single bordered container per category) is in the prototype as an alternative. Which becomes the default is still open.
- **Which templates are "popular"** — for now, agency configures explicitly. If agencies don't want to think about this, we may default to "Home + Auto if present" automatically.

## Explicit non-goals (for this iteration)

- **No variant rollup.** If an agency has multiple Auto templates (e.g., "Personal Auto", "Extended Personal Auto", "High-Net-Worth Auto"), they're listed flat as separate cards. We do not collapse them under a single "Auto" parent with a sub-pick step. If this becomes a problem we'll solve it by adding finer-grained top-level categories, not by introducing a two-step picker.
- **No per-customer personalization.** "Most Popular" is set by the agency, not learned from behavior.
- **No multi-language work.** The existing EN/ES toggle in the header is unchanged.
- **No changes to the actual quote flow.** This page is purely the pre-flow chooser.

## Reference

- Prototype: `personal/martin/master link ui/prototype-v2.html`
- URL params to explore variants:
  - default → full list with description visible
  - `?short` → small-agency demo (filter hidden, ~5 items)
  - `?compact` → title-only cards with chevron
  - `?compacter` → grouped list rows per category (mock-style)
  - Params combine, e.g. `?short&compacter`
- Captured original (the page we're improving): `Quote _ Acme Insurance Agency.html` in the same folder
- Faithful reproduction of the original (for diffing): `prototype.html` (v1)
