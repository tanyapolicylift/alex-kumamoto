# ADR-0011: Voice-to-Packet Prefill — Mapping Unified Schema to Quote Packet Templates

  

| Field | Value |

|--------------|--------------------------------|

| **Status** | Proposed |

| **Date** | 2026-02-09 |

| **Author** | Alex |

| **Depends on** | [0009 — Quote Packet Data Model V1](0009-quote-packets.md), [0010 — Quote Packet Service](0010-quote-packet-service.md) |

  

---

  

## 1. Context

  

ADR-0010 §6.4 establishes the entrypoint for creating a quote packet from a call: user clicks "Generate Quote Packet" on a call detail page, picks a template, and a new packet is created with `callId` FK linking it to the source call. But today the packet is created **empty** — the user must manually re-enter every piece of information the caller already provided during the voice conversation.

  

The voice agent already extracts structured data into the **unified schema** (flat Zod schemas in `shared/src/policy-types/`) and stores it as JSON in `calls.data`. Meanwhile, quote packet templates define a rich hierarchical field structure (entity templates → field group templates → field templates). We need a translation layer that takes the flat unified schema data and prefills the appropriate field values across the packet's entity hierarchy.

  

### 1.1 Complications

  

1. **Structural mismatch**: The unified schema is flat — `vehicleYear`, `vehicleMake`, `vehicleModel` are all top-level keys. Quote packet templates organize fields into nested entities (applicant, person, asset, coverage, etc.) with field groups.

  

2. **Cardinality "many" entities**: The unified schema packs multiple items into a single field. For example, `driver: "John Smith; Jane Smith"` is one string, but the packet template expects a separate `person` entity instance per driver, each with its own `full_name`, `date_of_birth`, and `license_number` field values. Reliably decomposing these free-text multi-value strings into discrete entities requires more than delimiter splitting — it requires LLM-based parsing (see §2.2.2 for the phased approach).

  

3. **Imperfect data**: Voice-extracted values are not guaranteed to match the target field types. A `number` field may receive `"twenty"`, a `select` field may get a free-text string that doesn't match any option exactly, dates come in many formats.

  

4. **Editability**: The mapping between schema keys and template fields must be admin-editable. When an admin views a template in the admin interface, they should see which unified schema key each field pulls from, and be able to change it.

  

---

  

## 2. Decision

  

Add a lightweight per-field mapping column to `field_templates`. At packet creation time, when a `callId` is provided, automatically prefill field values by looking up the call's structured data and applying the mapping.

  

### 2.1 Schema Changes

  

#### `field_templates` — new `voiceMapping` column

  

```sql

ALTER TABLE field_templates ADD COLUMN voice_mapping jsonb;

```

  

Stores the mapping from a unified schema key to this field:

  

```typescript

type VoiceMapping = {

schemaKey: string; // key in the unified schema (e.g., "vehicleYear", "driver")

};

```

  

The mapping is intentionally minimal — just a key lookup. Type coercion is derived automatically from the target `field_template.fieldType` (see §2.3). Multi-entity decomposition is handled separately via LLM parsing in a future phase (see §2.2.2).

  

The prefill is **policy-type-agnostic**: the service iterates every field_template that has a `voiceMapping`, looks up `calls.data[schemaKey]`, and takes whatever value is there (or skips if null). Because schema keys share consistent semantics across policy types in the unified schema (e.g., `phoneNumber` means the same thing everywhere), no per-template policy type constraint is needed. If the key exists in the call data, it gets mapped; if it doesn't, the field is simply left empty.

  

**Examples:**

  

Singleton entity (cardinality "one") — direct mapping:

```jsonc

// field_template: "name_insured" in applicant entity

{ "schemaKey": "businessName" }

  

// field_template: "business_phone" in applicant entity

{ "schemaKey": "phoneNumber" }

  

// field_template: "email" in applicant entity

{ "schemaKey": "email" }

```

  

Repeating entity (cardinality "many") — same shape, maps to one instance:

```jsonc

// field_template: "full_name" in person entity (drivers)

{ "schemaKey": "driver" }

  

// field_template: "date_of_birth" in person entity

{ "schemaKey": "driverBirthDate" }

  

// field_template: "vehicle_year" in asset entity (vehicles)

{ "schemaKey": "vehicleYear" }

```

  

Array source fields (unified schema `string[]` types):

```jsonc

// field_template: "claims_description" in loss_run entity

{ "schemaKey": "claimsHistory" }

// V1: takes first element only. V2: LLM parses into multiple entities.

```

  

### 2.2 Prefill Algorithm

  

#### 2.2.1 V1: Single-Entity Prefill (Implemented Now)

  

V1 creates **at most one** instance of each cardinality-many entity and takes the first/best value from the source data. This is simple, deterministic, and handles the common case well (most calls discuss one primary driver, one vehicle, etc.). Users add additional entities manually.

  

When `createQuotePacket` is called with a `callId`:

  

```

1. Create packet + singleton entities (existing behavior)

2. Fetch call.data (the unified schema JSON)

3. If call.data is null or call.type is not "quote", stop

4. Fetch all field_templates for this packet_template that have non-null voiceMapping

5. Group mapped fields by entity_template_id

  

6. For each entity template group:

a. If cardinality "one":

- The packet_entity already exists (auto-created in step 1)

- For each mapped field, extract value from call.data[schemaKey]

- Apply type coercion (§2.3) based on field_template.fieldType

- Write field_value with source="voice", confidence from coercion result

  

b. If cardinality "many":

- Create exactly ONE packet_entity instance

- For each mapped field:

* Extract raw value from call.data[schemaKey]

* If source is a string[] array: use element [0]

* If source is a string: use the full value as-is

(e.g., "Maria Rodriguez; Carlos Rodriguez" stores whole string in full_name)

* Apply type coercion, write field_value with source="voice"

  

7. Recalculate completeness score

```

  

This means for a call with `driver: "Maria Rodriguez; Carlos Rodriguez"`, V1 creates **one** person entity with `full_name = "Maria Rodriguez; Carlos Rodriguez"`. The user sees the prefilled value and can manually correct it and add a second driver. This is an acceptable UX tradeoff: the data is surfaced, just not decomposed.

  

#### 2.2.2 V2: LLM-Based Multi-Entity Parsing (Future Phase)

  

The unified schema stores multi-value data as free-text strings or loosely structured arrays. Reliably decomposing `"Maria Rodriguez; Carlos Rodriguez"` into two structured driver records — each with correlated name, birth date, and license number — is not a delimiter-splitting problem. The source data may use semicolons, commas, "and", line breaks, or inconsistent formatting. It requires semantic understanding.

  

The long-term approach follows the same `generateObject` + Zod schema pattern already established in `transcript-processing/service.ts`:

  

```typescript

// Conceptual — V2 implementation

async function parseMultiEntityValues(

entityTemplate: EntityTemplate,

fieldTemplates: FieldTemplate[], // mapped fields for this entity type

callData: Record<string, unknown>, // the flat unified schema data

): Promise<ParsedEntity[]> {

// 1. Build a Zod schema dynamically from the entity's mapped field templates

const entitySchema = z.array(

z.object(

Object.fromEntries(

fieldTemplates.map((ft) => [

ft.key,

zodTypeForFieldType(ft.fieldType).describe(ft.label),

]),

),

),

);

  

// 2. Collect the raw source values to send as context

const sourceData = Object.fromEntries(

fieldTemplates

.filter((ft) => ft.voiceMapping && callData[ft.voiceMapping.schemaKey] != null)

.map((ft) => [ft.label, callData[ft.voiceMapping!.schemaKey]]),

);

  

// 3. Call generateObject to decompose into structured array

const { object } = await generateObject({

model: openrouter("openai/gpt-4.1"),

schema: entitySchema,

messages: [

{

role: "system",

content: `Parse the following voice-extracted data into individual ${entityTemplate.label} records. Each record should have its fields properly correlated.`,

},

{

role: "user",

content: JSON.stringify(sourceData),

},

],

});

  

return object; // Array of parsed entity records

}

```

  

This approach:

- Leverages the existing LLM infrastructure (OpenRouter, Vercel AI SDK, `generateObject`)

- Uses the field templates themselves as the target schema, so the LLM output is already in the right shape

- Handles arbitrary formatting (semicolons, commas, "and", etc.) without brittle delimiter logic

- Correlates related fields across entities (name ↔ DOB ↔ license number)

- Runs only for cardinality-many entities that have mapped fields with non-null source data

  

**V2 replaces step 6b** in the algorithm above. Step 6a (singleton entities) remains unchanged — no LLM call needed for direct key→field mapping.

  

### 2.3 Type Coercion

  

The target field type is known from `field_template.fieldType`. The source value type comes from the unified schema (typically `string | number | boolean | string[] | null`). Coercion is automatic:

  

| Source → Target | Coercion | Confidence |

|-----------------|----------|------------|

| string → text/textarea | passthrough | 1.0 |

| string → number | `parseFloat`, fail → store raw | 0.9 / 0.5 |

| string → currency | `parseFloat`, strip `$,` | 0.9 / 0.5 |

| string → percentage | `parseFloat`, strip `%` | 0.9 / 0.5 |

| string → date | parse with dayjs (multiple formats) | 0.9 / 0.5 |

| string → boolean | `"yes"/"true"/"1"` → true, else false | 0.9 |

| string → select | case-insensitive match → substring match → store raw | 1.0 / 0.7 / 0.5 |

| string → phone/email/ein/ssn/vin | passthrough (validation at save time) | 0.9 |

| string → address | store as string (structured parsing in future) | 0.7 |

| number → text | `String(n)` | 1.0 |

| number → number/currency | passthrough | 1.0 |

| string[] → text | `join(", ")` | 0.9 |

| null → any | skip (no field_value created) | — |

  

**Select matching** deserves special attention. Given a source string and a `field_template.options` array:

1. Exact value match (case-insensitive) → confidence 1.0

2. Label substring match (e.g., source "corp" matches option label "Corporation") → confidence 0.7

3. No match → store raw string as value, confidence 0.5, flag for review

  

When coercion fails or produces low confidence, the original value is preserved in `field_value.aiExtractedRaw` for user reference.

  

### 2.4 Confidence & Source Tracking

  

The existing `field_values` columns handle this naturally:

  

| Column | Usage |

|--------|-------|

| `source` | `"voice"` for all prefilled values |

| `confidence` | Numeric score from type coercion (see §2.3) |

| `aiExtractedRaw` | Original value from `calls.data` before coercion |

| `value` | Coerced value in the target field's expected format |

  

This gives the packet detail UI everything it needs to show provenance: "This value came from the voice call, with 70% confidence. Original: 'corp'. Resolved to: 'corporation'."

  

### 2.5 Personal Details Mapping

  

Every policy type in the unified schema inherits from `PersonalDetailsSchema` which provides `firstName`, `lastName`, `phoneNumber`, and `email`. These four fields appear on virtually every packet template's `applicant` entity. Rather than requiring every template to manually map these, the prefill service checks for standard applicant fields by key:

  

| Applicant field key | Schema key |

|---------------------|------------|

| `contact_name` / `full_name` / `name_insured` | `firstName` + " " + `lastName` |

| `first_name` | `firstName` |

| `last_name` | `lastName` |

| `business_phone` / `phone` | `phoneNumber` |

| `email` | `email` |

  

These are **fallback** mappings — if a field_template already has a `voiceMapping`, that takes precedence. This avoids forcing every template to explicitly map the obvious personal details.

  

### 2.6 Business Details Mapping

  

Similarly, commercial policy types extend `BusinessDetailsQuoteSchema` with `businessName`. For templates with a `business` or `applicant` entity:

  

| Field key | Schema key |

|-----------|------------|

| `name_insured` / `business_name` | `businessName` |

  

Same precedence rule: explicit `voiceMapping` overrides these fallbacks.

  

---

  

## 3. Implementation Plan

  

### 3.1 Database Migration

  

Single migration adding one column:

  

```sql

ALTER TABLE field_templates ADD COLUMN voice_mapping jsonb;

```

  

No new tables. No changes to existing columns.

  

### 3.2 Drizzle Schema Update

  

In `src/lib/db/schema.ts`, add to the `fieldTemplates` table definition:

  

```typescript

voiceMapping: jsonb(),

```

  

### 3.3 Prefill Service

  

New file: `src/server/quote-packets/prefill.ts`

  

Exports one public function:

  

```typescript

export async function prefillFromCall(

quotePacketId: string,

callId: string,

agencyId: string,

): Promise<void>

```

  

Called from `createQuotePacket` when `callId` is provided. Contains:

- `resolveCallData(callId)` — fetches `calls.data` and `calls.type`

- `buildFieldMappings(packetTemplateId)` — fetches all field_templates with voiceMapping, grouped by entity_template

- `prefillSingletonEntities(...)` — handles cardinality "one" entities (already auto-created)

- `prefillRepeatingEntities(...)` — creates one instance per cardinality "many" entity type that has mapped data, fills with first/raw value

- `coerceValue(rawValue, fieldType, options?)` — type coercion with confidence scoring

- `matchSelectOption(rawValue, options)` — select field matching logic

  

### 3.4 Seed Data Update

  

Update `src/server/admin/templates/seed.ts` to include `voiceMapping` on each field_template where a clear mapping exists.

  

Example additions for PLRater Personal Auto template:

  

```typescript

// In the "Drivers" entity (person, cardinality: many):

{ key: "full_name", voiceMapping: { schemaKey: "driver" } }

{ key: "date_of_birth", voiceMapping: { schemaKey: "driverBirthDate" } }

{ key: "license_number", voiceMapping: { schemaKey: "licenseNumber" } }

  

// In the "Vehicles" entity (asset, cardinality: many):

{ key: "vehicle_year", voiceMapping: { schemaKey: "vehicleYear" } }

{ key: "vehicle_make", voiceMapping: { schemaKey: "vehicleMake" } }

{ key: "vehicle_model", voiceMapping: { schemaKey: "vehicleModel" } }

{ key: "vin", voiceMapping: { schemaKey: "vin" } }

{ key: "primary_use", voiceMapping: { schemaKey: "primaryUse" } }

{ key: "ownership", voiceMapping: { schemaKey: "ownership" } }

```

  

### 3.5 Admin UI

  

In the admin template detail view, each field_template row should display:

- Existing columns (key, label, type, required, priority, etc.)

- NEW: Voice mapping schema key (editable text input)

  

This requires updating the admin template detail endpoint to include `voiceMapping` in the response (it will come through automatically via the Drizzle schema) and adding an update endpoint or extending the existing template update to support editing field-level voice mappings.

  

---

  

## 4. Worked Examples

  

### 4.1 V1 Prefill: Personal Auto from Voice Call

  

**Call data** (stored in `calls.data`):

```json

{

"firstName": "Maria",

"lastName": "Rodriguez",

"phoneNumber": "(555) 867-5309",

"email": "maria@example.com",

"vehicleYear": 2020,

"vehicleMake": "Honda",

"vehicleModel": "Civic",

"vin": null,

"driver": "Maria Rodriguez; Carlos Rodriguez",

"driverBirthDate": "March 15, 1985; June 2, 1988",

"licenseNumber": "D1234567; D7654321",

"primaryUse": "commute",

"ownership": "financed",

"claimsHistory": ["fender bender 2024, $2500", "no other claims"]

}

```

  

**Template**: PLRater Personal Auto

  

**V1 prefill result:**

  

1. **Applicant entity** (cardinality one, auto-created):

  

| Field | Source Key | Raw Value | Coerced Value | Confidence |

|-------|-----------|-----------|---------------|------------|

| contact_name | firstName+lastName | "Maria Rodriguez" | "Maria Rodriguez" | 1.0 |

| phone | phoneNumber | "(555) 867-5309" | "(555) 867-5309" | 0.9 |

| email | email | "maria@example.com" | "maria@example.com" | 0.9 |

  

2. **Person entity** (cardinality many — **1 created**):

  

V1 creates one entity and stores the raw value as-is. The user sees both drivers in one field and can manually split them.

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| full_name | driver | "Maria Rodriguez; Carlos Rodriguez" | 1.0 |

| date_of_birth | driverBirthDate | "March 15, 1985; June 2, 1988" | 0.5 (not a clean date) |

| license_number | licenseNumber | "D1234567; D7654321" | 0.9 |

  

3. **Asset entity** (cardinality many — **1 created**):

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| vehicle_year | vehicleYear | 2020 | 1.0 |

| vehicle_make | vehicleMake | "Honda" | 1.0 |

| vehicle_model | vehicleModel | "Civic" | 1.0 |

| primary_use | primaryUse | "commute" → select match | 1.0 |

| ownership | ownership | "financed" → select match | 1.0 |

  

4. **Loss run entity** (cardinality many — **1 created**, takes first array element):

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| claims_description | claimsHistory | "fender bender 2024, $2500" | 0.9 |

  

5. **Completeness recalculated** — required fields that now have values count toward the score.

  

**V1 tradeoff**: The driver data is surfaced but not decomposed. The user sees `"Maria Rodriguez; Carlos Rodriguez"` in the full_name field, recognizes there are two drivers, and manually creates a second person entity. This is better than an empty packet, and the raw data is preserved for reference.

  

### 4.2 V2 Prefill: Same Call with LLM Parsing

  

With the same call data, V2 would call `generateObject` on the person entity's mapped fields and produce:

  

```json

[

{ "full_name": "Maria Rodriguez", "date_of_birth": "1985-03-15", "license_number": "D1234567" },

{ "full_name": "Carlos Rodriguez", "date_of_birth": "1988-06-02", "license_number": "D7654321" }

]

```

  

This creates **2 person entities** with properly correlated and type-coerced values. The LLM handles the semicolon-delimited format, date parsing, and field correlation in one pass — the same pattern used by `extractQuoteDetails` in transcript processing today.

  

---

  

## 5. Rationale

  

### 5.1 Column on `field_templates` vs. Separate Mapping Table

  

A separate `voice_field_mappings` junction table would be more normalized, but adds a new table, new relations, new queries, and a new admin CRUD surface — all for what is a 1:1 relationship (each field template has at most one voice mapping). The jsonb column is simpler, co-located with the field definition, and included automatically in every template query.

  

### 5.2 V1 Single-Entity + V2 LLM Parsing vs. Delimiter Splitting

  

We considered adding a `splitDelimiter` field to `voiceMapping` so the prefill service could split `"Maria Rodriguez; Carlos Rodriguez"` by `";"` into two entities deterministically. **Rejected** because:

- The unified schema's multi-value encoding is inconsistent — callers may say "Maria and Carlos Rodriguez", use commas, semicolons, or natural language

- Correlated fields (name ↔ DOB ↔ license) must be split in lockstep, which a simple delimiter approach can't guarantee when formatting varies across fields

- The codebase already has a proven pattern for this exact problem: `generateObject` with a Zod schema, used by `extractQuoteDetails` in transcript processing

  

Instead: V1 takes the first/raw value (no splitting) and lets users manually decompose. V2 adds an LLM call using the same infrastructure to properly parse multi-entity data. The `voiceMapping` schema stays clean — `{ schemaKey }` only — and the parsing intelligence lives in the service layer where it can be improved without schema migrations.

  

### 5.3 Automatic Type Coercion vs. Explicit Transform Column

  

An explicit `transform` field (e.g., `"to_number"`, `"to_date"`) on the mapping would be redundant with information already present on the `field_template` (its `fieldType`). Since the target type is already known, the coercion can be derived. This avoids the admin needing to specify both "this field is a number" and "coerce the voice value to a number."

  

### 5.4 Fallback Personal/Business Mappings

  

These four fields (name, phone, email, businessName) are universal across all policy types and nearly all templates. Requiring explicit `voiceMapping` on every template for these obvious mappings would be tedious. The fallback-by-key-convention approach handles the 90% case with zero configuration, while allowing override for the 10% edge case.

  

---

  

## 6. Alternatives Considered

  

### 6.1 Full AI-Based Mapping (Bypass Unified Schema Entirely)

  

Use an LLM to read the call transcript and fill in the packet fields directly, bypassing the unified schema and voiceMapping config. **Rejected** because:

- Doesn't leverage the existing unified schema extraction that already happened at call-processing time

- Not editable — no admin-visible mapping to adjust when the LLM gets a field wrong

- Would need to re-extract data that's already been extracted and stored

  

Note: This is different from the V2 LLM-based entity parsing (§2.2.2), which uses the LLM only for the narrow task of decomposing multi-value strings into structured entity arrays. V2 still relies on the voiceMapping to know *which* schema keys feed *which* entity fields — the LLM just handles the splitting/correlation.

  

### 6.2 Template-Level Mapping Config (jsonb on `packet_templates`)

  

Store the entire mapping as a single large JSON object on the template. **Rejected** because:

- Mapping is not visible at the field level in admin UI

- Harder to validate (no FK to field_template)

- Must be kept in sync manually with field additions/removals

- Breaks the co-location principle (field definition in one place, mapping in another)

  

### 6.3 New Junction Table (`voice_field_mappings`)

  

Fully normalized table with `packet_template_id`, `schema_key`, `field_template_id`, etc. **Rejected** because:

- Adds a table for a 1:1 relationship

- Requires its own CRUD endpoints

- Complicates the template detail query (another join)

- Minimal benefit over a jsonb column for this use case

  

---

  

## 7. Consequences

  

### Positive

  

- **Immediate value**: Users creating packets from calls will see data pre-populated, drastically reducing manual entry

- **Transparency**: Every prefilled value has a clear source (`voice`), confidence score, and raw extraction preserved in `aiExtractedRaw`

- **Admin control**: Mappings are visible and editable per field in the admin template interface

- **Minimal schema change**: One column added, zero new tables

  

### Negative

  

- **Imperfect data**: Some voice-extracted values will not coerce cleanly and will require manual correction. The confidence score helps users identify these, but it's not perfect.

- **V1 doesn't decompose multi-entity data**: Calls mentioning two drivers will prefill one entity with the combined string. Users must manually split. This is an intentional tradeoff — shipping simple prefill now is more valuable than blocking on LLM parsing.

- **One mapping per field**: A field can only map to one schema key. If future templates need to pull from multiple sources or combine schema values, the `voiceMapping` structure would need extension.

  

---

  

## 8. Future Extensions

  

- **V2 LLM multi-entity parsing** (§2.2.2): Add `generateObject`-based decomposition for cardinality-many entities, following the existing transcript-processing pattern. No schema migration needed — the same `voiceMapping.schemaKey` drives what data feeds the LLM prompt.

- **Structured address parsing**: Coerce free-text addresses into `{street, city, state, zip}` for the `address` field type

- **Multi-value support in unified schema**: Future schema versions may support structured arrays (e.g., `drivers: [{name, dob, license}]`) instead of semicolon-delimited strings. This would make V2 parsing trivial or eliminate the need for it entirely.

- **Document-based prefill**: Same `voiceMapping` pattern could be reused with `source="document"` for data extracted from uploaded PDFs

- **Confidence-based UI indicators**: Highlight low-confidence prefilled fields in yellow/orange so users know which values to verify first
  

The mapping is intentionally minimal — just a key lookup. Type coercion is derived automatically from the target `field_template.fieldType` (see §2.3). Multi-entity decomposition is handled separately via LLM parsing in a future phase (see §2.2.2).

  

**Examples:**

  

Singleton entity (cardinality "one") — direct mapping:

```jsonc

// field_template: "name_insured" in applicant entity

{ "schemaKey": "businessName" }

  

// field_template: "business_phone" in applicant entity

{ "schemaKey": "phoneNumber" }

  

// field_template: "email" in applicant entity

{ "schemaKey": "email" }

```

  

Repeating entity (cardinality "many") — same shape, maps to one instance:

```jsonc

// field_template: "full_name" in person entity (drivers)

{ "schemaKey": "driver" }

  

// field_template: "date_of_birth" in person entity

{ "schemaKey": "driverBirthDate" }

  

// field_template: "vehicle_year" in asset entity (vehicles)

{ "schemaKey": "vehicleYear" }

```

  

Array source fields (unified schema `string[]` types):

```jsonc

// field_template: "claims_description" in loss_run entity

{ "schemaKey": "claimsHistory" }

// V1: takes first element only. V2: LLM parses into multiple entities.

```

  

### 2.2 Prefill Algorithm

  

#### 2.2.1 V1: Single-Entity Prefill (Implemented Now)

  

V1 creates **at most one** instance of each cardinality-many entity and takes the first/best value from the source data. This is simple, deterministic, and handles the common case well (most calls discuss one primary driver, one vehicle, etc.). Users add additional entities manually.

  

When `createQuotePacket` is called with a `callId`:

  

```

1. Create packet + singleton entities (existing behavior)

2. Fetch call.data (the unified schema JSON)

3. If call.data is null or call.type is not "quote", stop

4. Fetch all field_templates for this packet_template that have non-null voiceMapping

5. Group mapped fields by entity_template_id

  

6. For each entity template group:

a. If cardinality "one":

- The packet_entity already exists (auto-created in step 1)

- For each mapped field, extract value from call.data[schemaKey]

- Apply type coercion (§2.3) based on field_template.fieldType

- Write field_value with source="voice", confidence from coercion result

  

b. If cardinality "many":

- Create exactly ONE packet_entity instance

- For each mapped field:

* Extract raw value from call.data[schemaKey]

* If source is a string[] array: use element [0]

* If source is a string: use the full value as-is

(e.g., "Maria Rodriguez; Carlos Rodriguez" stores whole string in full_name)

* Apply type coercion, write field_value with source="voice"

  

7. Recalculate completeness score

```

  

This means for a call with `driver: "Maria Rodriguez; Carlos Rodriguez"`, V1 creates **one** person entity with `full_name = "Maria Rodriguez; Carlos Rodriguez"`. The user sees the prefilled value and can manually correct it and add a second driver. This is an acceptable UX tradeoff: the data is surfaced, just not decomposed.

  

#### 2.2.2 V2: LLM-Based Multi-Entity Parsing (Future Phase)

  

The unified schema stores multi-value data as free-text strings or loosely structured arrays. Reliably decomposing `"Maria Rodriguez; Carlos Rodriguez"` into two structured driver records — each with correlated name, birth date, and license number — is not a delimiter-splitting problem. The source data may use semicolons, commas, "and", line breaks, or inconsistent formatting. It requires semantic understanding.

  

The long-term approach follows the same `generateObject` + Zod schema pattern already established in `transcript-processing/service.ts`:

  

```typescript

// Conceptual — V2 implementation

async function parseMultiEntityValues(

entityTemplate: EntityTemplate,

fieldTemplates: FieldTemplate[], // mapped fields for this entity type

callData: Record<string, unknown>, // the flat unified schema data

): Promise<ParsedEntity[]> {

// 1. Build a Zod schema dynamically from the entity's mapped field templates

const entitySchema = z.array(

z.object(

Object.fromEntries(

fieldTemplates.map((ft) => [

ft.key,

zodTypeForFieldType(ft.fieldType).describe(ft.label),

]),

),

),

);

  

// 2. Collect the raw source values to send as context

const sourceData = Object.fromEntries(

fieldTemplates

.filter((ft) => ft.voiceMapping && callData[ft.voiceMapping.schemaKey] != null)

.map((ft) => [ft.label, callData[ft.voiceMapping!.schemaKey]]),

);

  

// 3. Call generateObject to decompose into structured array

const { object } = await generateObject({

model: openrouter("openai/gpt-4.1"),

schema: entitySchema,

messages: [

{

role: "system",

content: `Parse the following voice-extracted data into individual ${entityTemplate.label} records. Each record should have its fields properly correlated.`,

},

{

role: "user",

content: JSON.stringify(sourceData),

},

],

});

  

return object; // Array of parsed entity records

}

```

  

This approach:

- Leverages the existing LLM infrastructure (OpenRouter, Vercel AI SDK, `generateObject`)

- Uses the field templates themselves as the target schema, so the LLM output is already in the right shape

- Handles arbitrary formatting (semicolons, commas, "and", etc.) without brittle delimiter logic

- Correlates related fields across entities (name ↔ DOB ↔ license number)

- Runs only for cardinality-many entities that have mapped fields with non-null source data

  

**V2 replaces step 6b** in the algorithm above. Step 6a (singleton entities) remains unchanged — no LLM call needed for direct key→field mapping.

  

### 2.3 Type Coercion

  

The target field type is known from `field_template.fieldType`. The source value type comes from the unified schema (typically `string | number | boolean | string[] | null`). Coercion is automatic:

  

| Source → Target | Coercion | Confidence |

|-----------------|----------|------------|

| string → text/textarea | passthrough | 1.0 |

| string → number | `parseFloat`, fail → store raw | 0.9 / 0.5 |

| string → currency | `parseFloat`, strip `$,` | 0.9 / 0.5 |

| string → percentage | `parseFloat`, strip `%` | 0.9 / 0.5 |

| string → date | parse with dayjs (multiple formats) | 0.9 / 0.5 |

| string → boolean | `"yes"/"true"/"1"` → true, else false | 0.9 |

| string → select | case-insensitive match → substring match → store raw | 1.0 / 0.7 / 0.5 |

| string → phone/email/ein/ssn/vin | passthrough (validation at save time) | 0.9 |

| string → address | store as string (structured parsing in future) | 0.7 |

| number → text | `String(n)` | 1.0 |

| number → number/currency | passthrough | 1.0 |

| string[] → text | `join(", ")` | 0.9 |

| null → any | skip (no field_value created) | — |

  

**Select matching** deserves special attention. Given a source string and a `field_template.options` array:

1. Exact value match (case-insensitive) → confidence 1.0

2. Label substring match (e.g., source "corp" matches option label "Corporation") → confidence 0.7

3. No match → store raw string as value, confidence 0.5, flag for review

  

When coercion fails or produces low confidence, the original value is preserved in `field_value.aiExtractedRaw` for user reference.

  

### 2.4 Confidence & Source Tracking

  

The existing `field_values` columns handle this naturally:

  

| Column | Usage |

|--------|-------|

| `source` | `"voice"` for all prefilled values |

| `confidence` | Numeric score from type coercion (see §2.3) |

| `aiExtractedRaw` | Original value from `calls.data` before coercion |

| `value` | Coerced value in the target field's expected format |

  

This gives the packet detail UI everything it needs to show provenance: "This value came from the voice call, with 70% confidence. Original: 'corp'. Resolved to: 'corporation'."

  

### 2.5 Personal Details Mapping

  

Every policy type in the unified schema inherits from `PersonalDetailsSchema` which provides `firstName`, `lastName`, `phoneNumber`, and `email`. These four fields appear on virtually every packet template's `applicant` entity. Rather than requiring every template to manually map these, the prefill service checks for standard applicant fields by key:

  

| Applicant field key | Schema key |

|---------------------|------------|

| `contact_name` / `full_name` / `name_insured` | `firstName` + " " + `lastName` |

| `first_name` | `firstName` |

| `last_name` | `lastName` |

| `business_phone` / `phone` | `phoneNumber` |

| `email` | `email` |

  

These are **fallback** mappings — if a field_template already has a `voiceMapping`, that takes precedence. This avoids forcing every template to explicitly map the obvious personal details.

  

### 2.6 Business Details Mapping

  

Similarly, commercial policy types extend `BusinessDetailsQuoteSchema` with `businessName`. For templates with a `business` or `applicant` entity:

  

| Field key | Schema key |

|-----------|------------|

| `name_insured` / `business_name` | `businessName` |

  

Same precedence rule: explicit `voiceMapping` overrides these fallbacks.

  

---

  

## 3. Implementation Plan

  

### 3.1 Database Migration

  

Single migration adding two columns:

  

```sql

-- Add policy type association to templates

ALTER TABLE packet_templates

ADD COLUMN policy_types text[] DEFAULT '{}';

  

-- Add voice mapping to field templates

ALTER TABLE field_templates

ADD COLUMN voice_mapping jsonb;

```

  

No new tables. No changes to existing columns.

  

### 3.2 Drizzle Schema Update

  

In `src/lib/db/schema.ts`, add to the existing table definitions:

  

```typescript

// on packetTemplates

policyTypes: text().array().default([]),

  

// on fieldTemplates

voiceMapping: jsonb(),

```

  

### 3.3 Prefill Service

  

New file: `src/server/quote-packets/prefill.ts`

  

Exports one public function:

  

```typescript

export async function prefillFromCall(

quotePacketId: string,

callId: string,

agencyId: string,

): Promise<void>

```

  

Called from `createQuotePacket` when `callId` is provided. Contains:

- `resolveCallData(callId)` — fetches `calls.data` and `calls.type`

- `buildFieldMappings(packetTemplateId)` — fetches all field_templates with voiceMapping, grouped by entity_template

- `prefillSingletonEntities(...)` — handles cardinality "one" entities (already auto-created)

- `prefillRepeatingEntities(...)` — creates one instance per cardinality "many" entity type that has mapped data, fills with first/raw value

- `coerceValue(rawValue, fieldType, options?)` — type coercion with confidence scoring

- `matchSelectOption(rawValue, options)` — select field matching logic

  

### 3.4 Seed Data Update

  

Update `src/server/admin/templates/seed.ts` to include:

- `policyTypes` on each template (e.g., `["commercial_workers_compensation"]` for CA Workers' Comp)

- `voiceMapping` on each field_template where a clear mapping exists

  

Example additions for PLRater Personal Auto template:

  

```typescript

// In the "Drivers" entity (person, cardinality: many):

{ key: "full_name", voiceMapping: { schemaKey: "driver" } }

{ key: "date_of_birth", voiceMapping: { schemaKey: "driverBirthDate" } }

{ key: "license_number", voiceMapping: { schemaKey: "licenseNumber" } }

  

// In the "Vehicles" entity (asset, cardinality: many):

{ key: "vehicle_year", voiceMapping: { schemaKey: "vehicleYear" } }

{ key: "vehicle_make", voiceMapping: { schemaKey: "vehicleMake" } }

{ key: "vehicle_model", voiceMapping: { schemaKey: "vehicleModel" } }

{ key: "vin", voiceMapping: { schemaKey: "vin" } }

{ key: "primary_use", voiceMapping: { schemaKey: "primaryUse" } }

{ key: "ownership", voiceMapping: { schemaKey: "ownership" } }

```

  

### 3.5 Template Filtering

  

When creating a packet from a call, the `TemplateSelectionDialog` should prefer templates matching the call's policy type. Update `getActiveTemplates` to accept an optional `policyType` parameter:

- If provided, return templates where `policyTypes` contains the type (or `policyTypes` is empty)

- If not provided, return all active templates (existing behavior)

  

### 3.6 Admin UI

  

In the admin template detail view, each field_template row should display:

- Existing columns (key, label, type, required, priority, etc.)

- NEW: Voice mapping schema key (editable text input)

  

This requires updating the admin template detail endpoint to include `voiceMapping` in the response (it will come through automatically via the Drizzle schema) and adding an update endpoint or extending the existing template update to support editing field-level voice mappings.

  

---

  

## 4. Worked Examples

  

### 4.1 V1 Prefill: Personal Auto from Voice Call

  

**Call data** (stored in `calls.data`):

```json

{

"firstName": "Maria",

"lastName": "Rodriguez",

"phoneNumber": "(555) 867-5309",

"email": "maria@example.com",

"vehicleYear": 2020,

"vehicleMake": "Honda",

"vehicleModel": "Civic",

"vin": null,

"driver": "Maria Rodriguez; Carlos Rodriguez",

"driverBirthDate": "March 15, 1985; June 2, 1988",

"licenseNumber": "D1234567; D7654321",

"primaryUse": "commute",

"ownership": "financed",

"claimsHistory": ["fender bender 2024, $2500", "no other claims"]

}

```

  

**Template**: PLRater Personal Auto

  

**V1 prefill result:**

  

1. **Applicant entity** (cardinality one, auto-created):

  

| Field | Source Key | Raw Value | Coerced Value | Confidence |

|-------|-----------|-----------|---------------|------------|

| contact_name | firstName+lastName | "Maria Rodriguez" | "Maria Rodriguez" | 1.0 |

| phone | phoneNumber | "(555) 867-5309" | "(555) 867-5309" | 0.9 |

| email | email | "maria@example.com" | "maria@example.com" | 0.9 |

  

2. **Person entity** (cardinality many — **1 created**):

  

V1 creates one entity and stores the raw value as-is. The user sees both drivers in one field and can manually split them.

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| full_name | driver | "Maria Rodriguez; Carlos Rodriguez" | 1.0 |

| date_of_birth | driverBirthDate | "March 15, 1985; June 2, 1988" | 0.5 (not a clean date) |

| license_number | licenseNumber | "D1234567; D7654321" | 0.9 |

  

3. **Asset entity** (cardinality many — **1 created**):

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| vehicle_year | vehicleYear | 2020 | 1.0 |

| vehicle_make | vehicleMake | "Honda" | 1.0 |

| vehicle_model | vehicleModel | "Civic" | 1.0 |

| primary_use | primaryUse | "commute" → select match | 1.0 |

| ownership | ownership | "financed" → select match | 1.0 |

  

4. **Loss run entity** (cardinality many — **1 created**, takes first array element):

  

| Field | Source Key | Value | Confidence |

|-------|-----------|-------|------------|

| claims_description | claimsHistory | "fender bender 2024, $2500" | 0.9 |

  

5. **Completeness recalculated** — required fields that now have values count toward the score.

  

**V1 tradeoff**: The driver data is surfaced but not decomposed. The user sees `"Maria Rodriguez; Carlos Rodriguez"` in the full_name field, recognizes there are two drivers, and manually creates a second person entity. This is better than an empty packet, and the raw data is preserved for reference.

  

### 4.2 V2 Prefill: Same Call with LLM Parsing

  

With the same call data, V2 would call `generateObject` on the person entity's mapped fields and produce:

  

```json

[

{ "full_name": "Maria Rodriguez", "date_of_birth": "1985-03-15", "license_number": "D1234567" },

{ "full_name": "Carlos Rodriguez", "date_of_birth": "1988-06-02", "license_number": "D7654321" }

]

```

  

This creates **2 person entities** with properly correlated and type-coerced values. The LLM handles the semicolon-delimited format, date parsing, and field correlation in one pass — the same pattern used by `extractQuoteDetails` in transcript processing today.

  

---

  

## 5. Rationale

  

### 5.1 Column on `field_templates` vs. Separate Mapping Table

  

A separate `voice_field_mappings` junction table would be more normalized, but adds a new table, new relations, new queries, and a new admin CRUD surface — all for what is a 1:1 relationship (each field template has at most one voice mapping). The jsonb column is simpler, co-located with the field definition, and included automatically in every template query.

  

### 5.2 V1 Single-Entity + V2 LLM Parsing vs. Delimiter Splitting

  

We considered adding a `splitDelimiter` field to `voiceMapping` so the prefill service could split `"Maria Rodriguez; Carlos Rodriguez"` by `";"` into two entities deterministically. **Rejected** because:

- The unified schema's multi-value encoding is inconsistent — callers may say "Maria and Carlos Rodriguez", use commas, semicolons, or natural language

- Correlated fields (name ↔ DOB ↔ license) must be split in lockstep, which a simple delimiter approach can't guarantee when formatting varies across fields

- The codebase already has a proven pattern for this exact problem: `generateObject` with a Zod schema, used by `extractQuoteDetails` in transcript processing

  

Instead: V1 takes the first/raw value (no splitting) and lets users manually decompose. V2 adds an LLM call using the same infrastructure to properly parse multi-entity data. The `voiceMapping` schema stays clean — `{ schemaKey }` only — and the parsing intelligence lives in the service layer where it can be improved without schema migrations.

  

### 5.3 Automatic Type Coercion vs. Explicit Transform Column

  

An explicit `transform` field (e.g., `"to_number"`, `"to_date"`) on the mapping would be redundant with information already present on the `field_template` (its `fieldType`). Since the target type is already known, the coercion can be derived. This avoids the admin needing to specify both "this field is a number" and "coerce the voice value to a number."

  

### 5.4 Fallback Personal/Business Mappings

  

These four fields (name, phone, email, businessName) are universal across all policy types and nearly all templates. Requiring explicit `voiceMapping` on every template for these obvious mappings would be tedious. The fallback-by-key-convention approach handles the 90% case with zero configuration, while allowing override for the 10% edge case.

  

---

  

## 6. Alternatives Considered

  

### 6.1 Full AI-Based Mapping (Bypass Unified Schema Entirely)

  

Use an LLM to read the call transcript and fill in the packet fields directly, bypassing the unified schema and voiceMapping config. **Rejected** because:

- Doesn't leverage the existing unified schema extraction that already happened at call-processing time

- Not editable — no admin-visible mapping to adjust when the LLM gets a field wrong

- Would need to re-extract data that's already been extracted and stored

  

Note: This is different from the V2 LLM-based entity parsing (§2.2.2), which uses the LLM only for the narrow task of decomposing multi-value strings into structured entity arrays. V2 still relies on the voiceMapping to know *which* schema keys feed *which* entity fields — the LLM just handles the splitting/correlation.

  

### 6.2 Template-Level Mapping Config (jsonb on `packet_templates`)

  

Store the entire mapping as a single large JSON object on the template. **Rejected** because:

- Mapping is not visible at the field level in admin UI

- Harder to validate (no FK to field_template)

- Must be kept in sync manually with field additions/removals

- Breaks the co-location principle (field definition in one place, mapping in another)

  

### 6.3 New Junction Table (`voice_field_mappings`)

  

Fully normalized table with `packet_template_id`, `schema_key`, `field_template_id`, etc. **Rejected** because:

- Adds a table for a 1:1 relationship

- Requires its own CRUD endpoints

- Complicates the template detail query (another join)

- Minimal benefit over a jsonb column for this use case

  

---

  

## 7. Consequences

  

### Positive

  

- **Immediate value**: Users creating packets from calls will see data pre-populated, drastically reducing manual entry

- **Transparency**: Every prefilled value has a clear source (`voice`), confidence score, and raw extraction preserved in `aiExtractedRaw`

- **Admin control**: Mappings are visible and editable per field in the admin template interface

- **Minimal schema change**: Two columns added, zero new tables

- **Template filtering**: `policyTypes` enables smarter template suggestions when creating from a call

  

### Negative

  

- **Imperfect data**: Some voice-extracted values will not coerce cleanly and will require manual correction. The confidence score helps users identify these, but it's not perfect.

- **V1 doesn't decompose multi-entity data**: Calls mentioning two drivers will prefill one entity with the combined string. Users must manually split. This is an intentional tradeoff — shipping simple prefill now is more valuable than blocking on LLM parsing.

- **One mapping per field**: A field can only map to one schema key. If future templates need to pull from multiple sources or combine schema values, the `voiceMapping` structure would need extension.

  

---

  

## 8. Future Extensions

  

- **V2 LLM multi-entity parsing** (§2.2.2): Add `generateObject`-based decomposition for cardinality-many entities, following the existing transcript-processing pattern. No schema migration needed — the same `voiceMapping.schemaKey` drives what data feeds the LLM prompt.

- **Structured address parsing**: Coerce free-text addresses into `{street, city, state, zip}` for the `address` field type

- **Multi-value support in unified schema**: Future schema versions may support structured arrays (e.g., `drivers: [{name, dob, license}]`) instead of semicolon-delimited strings. This would make V2 parsing trivial or eliminate the need for it entirely.

- **Document-based prefill**: Same `voiceMapping` pattern could be reused with `source="document"` for data extracted from uploaded PDFs

- **Confidence-based UI indicators**: Highlight low-confidence prefilled fields in yellow/orange so users know which values to verify first