# ADR-014: CSV Upload/Download for Quote Packet Templates

| Field        | Value                          |
|--------------|--------------------------------|
| **Status**   | Proposed                       |
| **Date**     | 2026-03-01                     |
| **Author**   | Alex                           |

---

## 1. Context & Problem Statement

Creating quote packet templates through the admin UI is tedious — each field must be added one at a time through nested dialogs (Template → Entity → Field Group → Field). A single personal auto template has 30+ fields across multiple entities and field groups.

Insurance professionals already maintain field lists in spreadsheets. We need a way to:

1. **Upload** a CSV to bulk-create an entire template's entity/field-group/field hierarchy in one step
2. **Download** an existing template as CSV for backup, duplication, or editing outside the app

## 2. Decision

### 2.1 CSV Column Specification

Each row represents one **field template**. Entity and field group metadata is denormalized (repeated) on every row belonging to that entity/group. Ordering is implicit from row position.

| # | Column | Required | Maps To | Allowed Values / Format | Notes |
|---|--------|----------|---------|------------------------|-------|
| | **Field** | | | | |
| 1 | `field_label` | Yes | `field_templates.label` | Free text | Human-readable label shown in the form. |
| 2 | `field_key` | Yes | `field_templates.key` | `snake_case` identifier | Must be unique within the template. |
| 3 | `field_type` | Yes | `field_templates.field_type` | `text`, `number`, `date`, `boolean`, `select`, `multi_select`, `email`, `phone`, `address`, `currency`, `percentage`, `vin`, `textarea`, `ein`, `ssn` | Determines the rendered input component. |
| 4 | `field_required` | No | `field_templates.required` | `true`, `false` | Defaults to `false`. |
| 5 | `field_intake_priority` | No | `field_templates.intake_priority` | `critical`, `high`, `medium`, `low` | Defaults to `medium`. |
| 6 | `field_help_text` | No | `field_templates.help_text` | Free text | Tooltip shown next to the field label. |
| 7 | `field_options` | No | `field_templates.options` | JSON string, e.g. `[{"label":"Yes","value":"yes"}]` | Required when `field_type` is `select` or `multi_select`. |
| 8 | `field_default_value` | No | `field_templates.default_value` | JSON string | Pre-populated value for the field. |
| | **Field Group** | | | | |
| 9 | `field_group_label` | Yes | `field_group_templates.label` | Free text | Rows with the same value (within the same entity) are grouped. First occurrence defines the group. |
| 10 | `field_group_description` | No | `field_group_templates.description` | Free text | |
| 11 | `field_group_collapsible` | No | `field_group_templates.collapsible` | `true`, `false` | Defaults to `true`. |
| | **Entity** | | | | |
| 12 | `entity_label` | Yes | `entity_templates.label` | Free text | Rows with the same value are grouped into one entity. First occurrence defines the entity. |
| 13 | `entity_type` | Yes | `entity_templates.entity_type` | `applicant`, `business`, `person`, `asset`, `loss_run`, `coverage`, `operations`, `miscellaneous` | Must be consistent across all rows sharing the same `entity_label`. |
| 14 | `entity_cardinality` | Yes | `entity_templates.cardinality` | `one`, `many` | Must be consistent across all rows sharing the same `entity_label`. |
| 15 | `entity_description` | No | `entity_templates.description` | Free text | |
| 16 | `entity_min_count` | No | `entity_templates.min_count` | Integer ≥ 0 | Defaults to `0`. Only meaningful when cardinality is `many`. |
| 17 | `entity_max_count` | No | `entity_templates.max_count` | Integer ≥ 1 or empty | Defaults to `null` (unlimited). Only meaningful when cardinality is `many`. |

### 2.2 Ordering

- **Entity sort order**: determined by the order of first appearance of each unique `entity_label`.
- **Field group sort order**: determined by the order of first appearance of each unique `field_group_label` within its entity.
- **Field sort order**: determined by row order within its field group.

### 2.3 Example CSV

```csv
field_label,field_key,field_type,field_required,field_intake_priority,field_help_text,field_options,field_default_value,field_group_label,field_group_description,field_group_collapsible,entity_label,entity_type,entity_cardinality,entity_description,entity_min_count,entity_max_count
First Name,first_name,text,true,critical,,,,,Personal Info,,true,Client Information,applicant,one,Primary applicant,,
Last Name,last_name,text,true,critical,,,,,Personal Info,,true,Client Information,applicant,one,Primary applicant,,
Date of Birth,date_of_birth,date,true,critical,,,,,Personal Info,,true,Client Information,applicant,one,Primary applicant,,
Cell Phone,cell_phone,phone,false,high,,,,,Contact,,true,Client Information,applicant,one,Primary applicant,,
Email,email,email,false,medium,,,,,Contact,,true,Client Information,applicant,one,Primary applicant,,
Year,year,number,true,critical,,,,,Vehicle Details,,true,Vehicles,asset,many,,1,5
Make,make,text,true,critical,,,,,Vehicle Details,,true,Vehicles,asset,many,,1,5
Model,model,text,true,critical,,,,,Vehicle Details,,true,Vehicles,asset,many,,1,5
VIN,vin,vin,false,high,17-character Vehicle Identification Number,,,,Vehicle Details,,true,Vehicles,asset,many,,1,5
Primary Usage,usage,select,true,high,,"[{""label"":""Commute"",""value"":""commute""},{""label"":""Pleasure"",""value"":""pleasure""},{""label"":""Business"",""value"":""business""}]",,Vehicle Details,,true,Vehicles,asset,many,,1,5
```

### 2.4 Excluded Columns

The following fields from `field_templates` are intentionally excluded because they do not impact form rendering and are configured post-creation through the admin UI or programmatically:

- `acord_mapping` — ACORD form coordinate mapping
- `rater_mapping` — rater platform field mapping
- `input_mapping` — voice-to-packet prefill mapping
- `validation_rules` — not currently used in form rendering

### 2.5 Validation Rules (on upload)

1. CSV must have the header row with exact column names from section 2.1.
2. All required columns must be non-empty for every row.
3. Enum columns must contain a valid value (case-insensitive, normalized to lowercase).
4. Within rows sharing the same `entity_label`, `entity_type` and `entity_cardinality` must be consistent — conflicting values are rejected.
5. Within rows sharing the same `field_group_label` (within the same entity), `field_group_collapsible` must be consistent.
6. `field_key` must be unique across all rows in the CSV.
7. `field_options` must be valid JSON array when `field_type` is `select` or `multi_select`.
8. `field_default_value`, when present, must be valid JSON.
9. All validation errors are collected and returned at once (not fail-fast) so the user can fix everything in one pass.

### 2.6 UI Integration

- **Create Template flow**: Add a "Create Template" button next to "Seed Templates" in `admin/agencies/[agencyId]/templates`. This opens a dialog that reuses the existing `PacketTemplateFormDialog` fields (name, slug, lineType, outputType, etc.) plus a CSV file upload zone. The CSV upload is only available during creation, not edit.
- **Download flow**: Add a "Download CSV" action to each template row in the admin table. This exports the current template hierarchy as a CSV matching the spec above.

### 2.7 Server-Side Processing

- **Upload endpoint**: `POST /api/v1/admin/templates/upload` — accepts multipart form with template metadata + CSV file. Parses CSV, validates per section 2.5, and inserts the full hierarchy (packet template → entities → field groups → fields) in a single transaction.
- **Download endpoint**: `GET /api/v1/admin/templates/:id/csv` — queries the template with nested entities/field-groups/fields and serializes to CSV.

## 3. Rationale

- **Single CSV over multiple CSVs**: A denormalized single-file format is easier for non-technical users to create and review in Excel/Google Sheets. The redundancy (repeating entity/group metadata) is an acceptable trade-off for simplicity.
- **Row-order for sort order**: Eliminates the need for explicit sort_order columns. Row position is intuitive and matches how users naturally organize data in spreadsheets.
- **Excluding mapping columns**: Mapping fields (ACORD, rater, input) are complex JSON structures configured by developers, not spreadsheet users. Including them would make the CSV unwieldy. They can be added post-creation through the existing admin field editor.

## 4. Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Multi-CSV upload** (separate files for entities, groups, fields) | More complex UX, requires users to manage ID references between files. |
| **JSON upload** | Less accessible to non-technical users who are comfortable with spreadsheets. |
| **Include all field_templates columns** | Mapping columns are complex JSON that doesn't belong in a spreadsheet workflow. |
| **Explicit sort_order column** | Row order is more intuitive and reduces column count. |

## 5. Consequences

### Positive
- Template creation goes from ~30 minutes of clicking to a single file upload
- Templates become portable and version-controllable as CSV files
- Non-developers can draft templates in Google Sheets and hand them off

### Negative
- Denormalized format means entity/group metadata is repeated and must be validated for consistency
- JSON-in-CSV cells (`field_options`) are awkward to edit in spreadsheets but are only needed for select/multi_select fields
