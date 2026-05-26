# PolicyLift Dashboard Spec

## Context

- Full visibility for all users (managers + producers see the same data)
- Assignment model: entities (conversations, QPs, bookings) are assigned to producers
- Producers typically work on: (1) unassigned items they pick up, or (2) items already assigned to them
- No urgency/deadline system -- just entities with statuses and activity logs
- No proper notification system yet -- rely on "activity" property of entities (no read/unread)
- No separate task system

## Mental Model

The dashboard is built around four layers of awareness:

1. **My Work** -- entities assigned to me, grouped by status
2. **What Happened** -- recent activity on things assigned to me
3. **Unassigned** -- stuff nobody owns yet (can/should I grab this?)
4. **Everything Else** -- KPIs, agency-wide activity, pipeline health

## Proposed Layout

```
+------------------------------------------------------------------+
|  Good morning, Martin                                             |
+------------------------------------------------------------------+
|                                                                   |
|  MY WORK                    |  WHAT HAPPENED                      |
|  (left ~55%)                |  (right ~45%)                       |
|                             |                                     |
|  [entity list]              |  [activity feed on my stuff]        |
|                             |                                     |
|                             |                                     |
+-----------------------------+-------------------------------------+
|                                                                   |
|  UNASSIGNED                 |  AGENCY                             |
|  (left ~55%)                |  (right ~45%)                       |
|                             |                                     |
+-----------------------------+-------------------------------------+
```

---

### Section 1: My Work (top-left)

Everything assigned to me. A unified list across entity types, sorted by most recently updated (since we don't have urgency, recency is the best proxy).

Each row shows:
- Type icon (conversation / QP / booking)
- Name/title (e.g., "John Smith - Auto Quote")
- Status badge (e.g., "New", "Info Collected", "Quoting", "Sent")
- Last activity timestamp ("Updated 2h ago")
- Click → navigates to entity

**Filter tabs above the list:**
- All | Conversations | Quote Packets | Bookings

**Grouping by status** (within each entity type):
```
MY WORK                                          All | Conv | QPs | Book
─────────────────────────────────────────────────────────────────────────
  [QP]  Maria Garcia - Home + Auto    Info Collected    Updated 2h ago
  [QP]  Robert Chen - Commercial GL   Quoting           Updated 1h ago
  [Conv] (818) 555-0142 - Missed      New               35m ago
  [Book] James Lee                    Today 3:00 PM     Confirmed
  [QP]  Sarah Kim - Auto              Sent to Client    Updated 3h ago
  ───
  Completed (3) ▸                                       (collapsed)
```

No priority, no urgency badges -- just entities sorted by recency with their current status visible. The producer scans the list and decides what to work on.

---

### Section 2: What Happened (top-right)

Activity feed filtered to things assigned to me. Pulls from the "activity" property on entities. Chronological, most recent first.

```
WHAT HAPPENED
─────────────────────────────────────────────────────
  System created QP from voice call              12m ago
    → Maria Garcia - Home + Auto
  
  Client submitted additional info via form      1h ago
    → Robert Chen - Commercial GL

  Booking confirmed by client                    2h ago
    → James Lee - Callback

  QP status changed to "Sent"                    3h ago
    → Sarah Kim - Auto

  New voicemail received                         5h ago
    → (818) 555-0142
```

Each entry shows:
- What happened (plain language description from the activity log)
- Which entity it relates to (clickable link)
- When

No read/unread state -- it's just a chronological feed. The value is ambient awareness: "what moved since I last looked?"

**Filter:** could optionally filter by entity type, but probably not needed for MVP.

---

### Section 3: Unassigned (bottom-left)

Items that have no assignee. This is the "grab work" section.

```
UNASSIGNED (7)
─────────────────────────────────────────────────────
  [Conv] Missed call - (323) 555-0199            8m ago     [Assign to me]
  [QP]   Auto quote - web form submission        22m ago    [Assign to me]
  [Conv] Chat - "need renters quote"             1h ago     [Assign to me]
  [QP]   Home quote - voice call                 2h ago     [Assign to me]
  [Book] Callback request - (310) 555-0888       3h ago     [Assign to me]
  ───
  Show all (7) →
```

Each row has a one-click **"Assign to me"** button. Once clicked, the item moves up to "My Work" and disappears from here.

Managers can also click into an item and assign it to a specific producer.

---

### Section 4: Agency (bottom-right)

The "everything else" section. Two possible sub-sections:

#### Option A: KPI Cards + Agency Activity

```
AGENCY
─────────────────────────────────────────────────────
  +----------+----------+----------+----------+
  | New Today | Open QPs | Bound    | Calls    |
  |    8      |   24     |   3      |   15     |
  +----------+----------+----------+----------+

  RECENT ACTIVITY
  Ana assigned "Chen - GL" to herself        10m ago
  Carlos marked "Torres - Renters" Bound     1h ago
  System created QP from voice call          2h ago
  New booking from website                   3h ago
```

#### Option B: Pipeline + KPIs (no agency activity feed)

```
AGENCY
─────────────────────────────────────────────────────
  PIPELINE
  New (12) → Quoting (18) → Sent (8) → Bound (3)

  +----------+----------+----------+----------+
  | New Today | Open QPs | Bound    | Calls    |
  |    8      |   24     |   3      |   15     |
  +----------+----------+----------+----------+
```

**Recommendation:** Option A for MVP. The agency activity feed gives managers visibility into what producers are doing without a separate page. Pipeline visualization can come later as its own analytics view.

---

## Data Requirements

### Activity Property on Entities

For "What Happened" and "Agency Activity" to work, we need an `activity` array on each entity type. Each activity entry:

```json
{
  "timestamp": "2026-04-07T14:30:00Z",
  "action": "status_changed",
  "description": "Status changed to Quoting",
  "actor": "user:martin" | "system",
  "entity_id": "qp_123",
  "entity_type": "quote_packet",
  "entity_name": "Robert Chen - Commercial GL"
}
```

**Entities that need activity tracking:**
- Quote Packets (may already have this)
- Conversations (add)
- Bookings (add)

The dashboard queries:
- "What Happened": all activity where `entity.assigned_to == current_user`, sorted by timestamp desc
- "Agency Activity": all activity across all entities, sorted by timestamp desc

### Assignment Field

Each entity needs an `assigned_to` field (user ID or null).

- `assigned_to == current_user` → appears in "My Work"
- `assigned_to == null` → appears in "Unassigned"
- All entities appear in "Agency" metrics regardless of assignment

---

## What We're NOT Building Yet

- Read/unread state on activity items
- Notification system (bell icon, push, email)
- Priority or urgency indicators
- Personal task management
- Role-based view filtering
- Customizable layout or widgets
- Saved views or custom filters
- Performance metrics per producer

## Progressive Enhancement Path

1. **MVP:** Four sections as described above. Activity feed is purely chronological, no read state.
2. **V2:** Add read/unread to activity. Notification bell that badges unread count.
3. **V3:** Role-based views (manager dashboard vs. producer dashboard). Producer performance metrics.
4. **V4:** Customizable widgets. Saved filters. Pipeline analytics.

## Open Questions

1. Should "My Work" sort by last updated or by entity creation date? (Recommend: last updated -- surfaces active items)
2. Should "Assign to me" on the dashboard also auto-navigate to the entity? (Recommend: no -- let them batch-assign, then work through their list)
3. Should completed items auto-hide after X days or stay collapsed indefinitely? (Recommend: hide after 7 days, viewable via entity list pages)
4. How many items to show per section before "Show all"? (Recommend: 5-8)
5. Do we need a "reassign" quick action for managers, or is that only within the entity detail page? (Recommend: entity detail only for MVP)
