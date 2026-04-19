# Agent Tool Call Context

All tool definitions registered across PolicyLift's LiveKit voice agents. Includes all hardcoded prompting; Langfuse-sourced prompts are referenced by path only.

**Notation:** `{{variable}}` marks where a dynamic runtime value is interpolated into the prompt string. `{variable}` in Langfuse paths marks a path template segment.

---

## Shared Tools (`agents/src/agents/shared/tools.ts`)

### `transferToBooking`

> Routes callers who want to schedule appointments or check availability to the booking agent. Triggers when the caller expresses interest in booking meetings, scheduling consultations, checking available time slots, or setting up appointments for insurance discussions, policy reviews, or claim meetings.

**Parameters:** None

**Conditional:** Only registered when `config.params.booking.isEnabled` is `true`.

**Used by:** Orchestrator, FallbackQuote, all quote agents (via `make-quote.ts`)

---

### `transferToHuman`

> Hands off the conversation to a live human agent whenever the user explicitly asks to speak to a human.
>
> Available routes:
> — {{route.title}}: {{route.description}}  _(repeated for each entry in `config.params.routes`; description line omitted if not set)_
> — ALL other human names: "default"
>
> Rules:
> — Select the most relevant route based on the user's request.
> — If the request is ambiguous or no route clearly applies, use "default".
> — If the request is for a person or service not in the listed routes, use "default".
> — Do NOT guess or invent routes. Always use "default".

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `route` | enum (dynamic) | Yes | "The route that best matches the user's request, or 'default'" — enum values are `{{route.title}}` for each entry in `config.params.routes`, plus `"default"` |
| `reasoning` | string | No | "Optional short explanation of why this route was selected" |

**Conditional:** Only registered when `config.params.isWorkingHours` is `true`.

**Used by:** Orchestrator, BookingAgent, BookingUpfrontAgent, RecordName, RecordEmail, FallbackQuote, PEO

---

### `hangUp`

**Description:** Loaded from Langfuse — `voice/shared/tools/hang-up-description`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `confirmed` | boolean | Yes | "Always pass false first to trigger the pre-recorded confirmation question. Only pass true after the confirmation question was played and user said they don't need help." |

**Used by:** Orchestrator, BookingAgent, BookingUpfrontAgent, FallbackQuote, PEO

---

### `switchLanguage`

> Switches the conversation to the user's preferred language. Triggers when the user starts speaking or responding in a different language than the current one, OR when the user explicitly asks to communicate in a different language, requests a language switch, asks if a specific language is available, or expresses a language preference (e.g., 'let's speak Spanish', 'can we talk in French?', 'I'd prefer Italian'). If you detect the user is speaking in a supported language different from the current conversation language, call this tool immediately without asking for confirmation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `language` | enum (dynamic) | Yes | "The language code to switch to (e.g., 'es', 'fr', 'hi')" — enum values are `{{language}}` for each entry in `config.params.languages` |

**Used by:** Orchestrator, BookingAgent, BookingUpfrontAgent, RecordName, RecordPhoneNumber, RecordEmail, SmsConsent, FallbackQuote, PEO, GeneralInfo

---

## Orchestrator Tools (`agents/src/agents/orchestrator.ts`)

### `transferToQuote`

> Routes callers who want to get a new insurance quote to the correct sub insurance specific agent. Triggers when the caller expresses interest in pricing, coverage options, or purchasing a new policy.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | enum (dynamic) | Yes | "The type of insurance policy being quoted." — enum values are `{{policyType}}` for each entry in `config.params.policyTypes` |

**Note:** Enforces one quote per session; throws `llm.ToolError` if already transferred. Increments `voice.quote.activated` Sentry counter.

---

### `transferToPEOIntake`

> Routes callers who want Professional Employer Organization (PEO) services. Triggers when the caller expresses interest in pricing, options, or other PEO-related services.

**Parameters:** None

**Conditional:** Only registered when `config.params.flags.shouldAgentSupportPEO` is `true`.

---

## Booking Tools (`agents/src/agents/booking.ts`, `booking-upfront.ts`)

### `scheduleAppointment`

> Schedules appointments for callers who want to meet with agents. Use when the caller has confirmed a specific date, time, appointment type, and provided their contact information (name and email) for consultations or meetings.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `startTime` | string | Yes | 'Start time for the appointment in ISO 8601 format without timezone offset (e.g., "2025-12-15T16:00:00")' |
| `endTime` | string | Yes | 'End time for the appointment in ISO 8601 format without timezone offset (e.g., "2025-12-15T16:00:00")' |

**Langfuse:** Tool intro message — `voice/booking/messages/{language}/schedule-appointment-tool-intro`

---

### `checkAvailability`

> Checks available time slots for callers who want to schedule meetings with agents. Use when the caller expresses interest in booking an appointment and provides a date or time range to see what slots are available for consultations or meetings.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `startTime` | string | Yes | 'Start time to check availability in ISO 8601 format without timezone offset (e.g., "2025-12-15T16:00:00")' |
| `endTime` | string | Yes | 'End time to check availability in ISO 8601 format without timezone offset (e.g., "2025-12-15T16:00:00")' |

**Langfuse:** Tool intro message — `voice/booking/messages/{language}/check-availability-tool-intro`

---

## RecordName Tools (`agents/src/agents/shared/record-name.ts`)

### `updateName`

> Update both the first name and last name provided by the user.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | string | Yes | "First name provided by the user. It should be in proper case e.g. John or Anna-Marie" |
| `lastName` | string | Yes | "Last name provided by the user. It should be in proper case e.g. Smith or O'Reilly" |

**Langfuse:** Verification prompts (language-specific):
- `voice/shared/record-name/messages/{language}/verify-first-name`
- `voice/shared/record-name/messages/{language}/verify-last-name`
- `voice/shared/record-name/messages/{language}/verify-first-and-last-name`

**Note:** Triggers spelling confirmation flow when `config.params.flags.spellingEnabled` is `true`.

---

### `confirmName`

> Validates/confirms the first name and last name provided by the user once the user has explicitly provided both first and last name.

**Parameters:** None

---

## RecordPhoneNumber Tools (`agents/src/agents/shared/record-phone-number.ts`)

### `updatePhoneNumber`

> Update the phone number provided by the user.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `phoneNumber` | string | Yes | "Phone number provided by the user. It should be in proper case with country code e.g. +1234567890. Use +1 if country code is not provided." |

**Langfuse:** Verification prompt — `voice/shared/record-phone-number/messages/{language}/verify-phone-number`

**Note:** Phone number is validated using `libphonenumber-js`.

---

### `confirmPhoneNumber`

> Validates/confirms the phone number provided by the user.

**Parameters:** None

---

## RecordEmail Tools (`agents/src/agents/shared/record-email.ts`)

### `updateEmail`

> Update the email address provided by the user.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | string | Yes | "The email address provided by the user" |

**Langfuse:** Verification prompt — `voice/shared/record-email/messages/{language}/verify-email`

---

### `confirmEmail`

> Validates/confirms the email address provided by the user.

**Parameters:** None

---

### `moveOnWithoutEmail`

> Moves on without collecting the email address.

**Parameters:** None

---

## SmsConsent Tools (`agents/src/agents/shared/sms-consent.ts`)

### `recordSmsConsent`

> Records the user's response to SMS consent. Call with granted=true if user agrees to receive SMS messages, granted=false if user declines.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `granted` | boolean | Yes | "Whether the user consented to receive SMS messages" |

**Note:** Increments `voice.consent.granted` or `voice.consent.denied` Sentry counter.

---

## Quote Tools (`agents/src/make-quote.ts`)

### `recordQuoteInformation`

> Record insurance quote information provided by the customer.

**Parameters:** Dynamically generated from the policy-specific Zod schema in `shared/src/` (e.g., `PersonalAutoQuoteSchema` for `{{policyType}} = personal_auto`). Each policy type produces its own parameter set with field names and descriptions sourced from the schema.

**Note:** Increments `voice.quote.recorded` Sentry counter.

**Applies to all quote agents:**
- Personal: Auto, Boat, Condo, DwellingFire, Earthquake, Flood, HomeWarranty, Homeowners, Jewelry, Landlord, Life, MobileHome, Motorcycle, NamedNonOwnerAuto, OffRoadVehicle, Pet, RentalDwelling, Renters, RV, ShortTermRental, SR22, Travel, Umbrella, VacantProperty, Watercraft
- Commercial: Auto, BusinessOwnersPolicy, CyberLiability, DirectorsOfficers, GeneralLiability, ProfessionalLiability, Property, WorkersCompensation
- FallbackQuote

---

## GeneralInfo Tools (`agents/src/agents/genral-info.ts`)

### `transferToOrchestrator`

> Transfer to the Orchestrator agent after answering to user questions.

**Parameters:** None

---

## Langfuse Prompt Path Reference

### Agent Instructions
| Path | Agent |
|------|-------|
| `voice/orchestrator/instructions` | Orchestrator (non-working hours) |
| `voice/orchestrator/instructions-working-hours` | Orchestrator (working hours) |
| `voice/general-info/instructions` | GeneralInfo |
| `voice/booking/instructions` | BookingAgent |
| `voice/booking-upfront/instructions` | BookingUpfrontAgent |
| `voice/peo/instructions` | PEO |
| `voice/quote/{policyType}/instructions` | Per-policy quote agents |
| `voice/shared/record-name/instructions` | RecordName |
| `voice/shared/record-phone-number/instructions` | RecordPhoneNumber |
| `voice/shared/record-email/instructions` | RecordEmail |
| `voice/shared/sms-consent/instructions` | SmsConsent |
| `voice/quote/fallback/instructions` | FallbackQuote |

### Message Prompts (language-specific: `en`, `es`)
| Path | Purpose |
|------|---------|
| `voice/orchestrator/messages/{lang}/intro` | Orchestrator greeting |
| `voice/orchestrator/messages/{lang}/outro` | Orchestrator sign-off |
| `voice/orchestrator/messages/{lang}/pre-hang-up` | Pre-hangup confirmation |
| `voice/orchestrator/messages/{lang}/farewell` | Farewell message |
| `voice/orchestrator/messages/{lang}/transfer-to-human` | Transfer message |
| `voice/booking/messages/{lang}/intro` | Booking agent greeting |
| `voice/booking/messages/{lang}/check-availability-tool-intro` | Before checking availability |
| `voice/booking/messages/{lang}/schedule-appointment-tool-intro` | Before scheduling |
| `voice/shared/messages/{lang}/quote-intro` | Quote agent greeting |
| `voice/shared/record-name/messages/{lang}/ask-name` | Ask for name |
| `voice/shared/record-name/messages/{lang}/verify-first-name` | Verify first name |
| `voice/shared/record-name/messages/{lang}/verify-last-name` | Verify last name |
| `voice/shared/record-name/messages/{lang}/verify-first-and-last-name` | Verify full name |
| `voice/shared/record-phone-number/messages/{lang}/ask-phone-number` | Ask for phone |
| `voice/shared/record-phone-number/messages/{lang}/verify-phone-number` | Verify phone |
| `voice/shared/record-phone-number/messages/{lang}/verify-initial-phone-number` | Verify caller's initial phone |
| `voice/shared/record-email/messages/{lang}/ask-email` | Ask for email |
| `voice/shared/record-email/messages/{lang}/verify-email` | Verify email |
| `voice/shared/sms-consent/messages/{lang}/ask-consent` | Ask for SMS consent |
| `voice/quote/{policyType}/messages/{lang}/intro` | Per-policy quote intro |

### Tool Description Prompts
| Path | Tool |
|------|------|
| `voice/shared/tools/hang-up-description` | `hangUp` tool description |
