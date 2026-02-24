# Quote Conversations Dataset — Context & Field Reference

## Overview

This dataset contains two CSV files exported from PolicyLift, an AI-powered platform for independent insurance agencies. The platform deploys AI voice agents (phone calls) and chat agents (web widget) that handle inbound insurance inquiries on behalf of agencies.

Both files contain **only conversations where the AI determined the caller/chatter's intent was to get an insurance quote** (i.e. `reason = 'quote'`). They cover the last 30 days and exclude internal test agencies.

---

## File: `calls.csv`

Each row represents a single **phone call** between a caller and an AI voice agent. The voice agent collects insurance information, answers questions, and may transfer the caller to a human agent or book an appointment.

### Fields

| Field | Type | Description |
|---|---|---|
| `created_at_et` | string | Timestamp of when the call record was created, formatted in **US Eastern Time** (e.g. `Jan 15, 2026 02:30 PM`). This is when the call was initiated. |
| `agency_name` | string | The name of the insurance agency whose AI agent handled the call. Each agency is a PolicyLift customer. |
| `id` | UUID | Unique identifier for the call. Can be used to cross-reference or deduplicate. |
| `call_url` | URL | Direct link to view the call in the PolicyLift app (e.g. `https://app.policylift.ai/calls/<uuid>`). Useful for manual review but requires authenticated access. |
| `status` | string | The final status of the call. Common values: `completed` (call finished normally), `transferred` (caller was transferred to a human agent), `voicemail` (went to voicemail), `missed`, `failed`. |
| `line` | string | The **insurance line of business** the caller is inquiring about. Values are either `personal` (auto, home, renters, umbrella, etc.) or `commercial` (business insurance, workers comp, general liability, etc.). |
| `type` | string | The type/category of insurance being quoted. More specific than `line`. Examples: `auto`, `home`, `renters`, `umbrella`, `general_liability`, `workers_compensation`, `business_owners`, `commercial_auto`, etc. This corresponds to one of 40+ supported policy types. |
| `score` | integer (0–100) | An AI-assigned **quality/completeness score** for the conversation. Higher scores indicate the agent successfully collected more of the required information for a quote. A score of 80+ generally means enough data was gathered to begin quoting. Low scores may indicate the caller hung up early, was uncooperative, or the conversation went off-track. |
| `phone_number` | string or null | The caller's phone number in E.164-ish format (e.g. `+15551234567`). May be null if the number was withheld or unavailable. |
| `short_summary` | string | A brief (1–2 sentence) AI-generated summary of the call. Describes who called, what they wanted, and the outcome. |
| `call_duration` | interval | How long the call lasted, expressed as a PostgreSQL interval (e.g. `00:04:32` for 4 minutes 32 seconds). Measured from call start to call end. |
| `message_count` | integer | The number of individual messages (turns) in the conversation transcript. Each time the agent or caller speaks, it counts as one message. Higher counts generally indicate longer, more substantive conversations. |
| `data` | JSON | **Structured data extracted from post-call AI analysis.** This is a JSON object containing the insurance-relevant information the agent collected during the call. The shape varies by policy type but typically includes fields like: name, date of birth, address, vehicle details (for auto), property details (for home), business info (for commercial), coverage preferences, current carrier, etc. This is the primary structured output of the conversation. |
| `raw_agent_data` | JSON | **Raw structured data captured by the voice agent during the live call.** This is the real-time data the agent accumulated as the conversation progressed, before any post-call cleanup or normalization. It may contain additional context, intermediate states, or slightly different field names compared to `data`. Useful for understanding exactly what the agent captured in the moment vs. what post-processing refined. |
| `transcript` | string | The **full conversation transcript**, with each turn on a new line in the format `role: content`. Roles are typically `assistant` (the AI agent) and `user` (the caller). Messages are ordered chronologically. This is the raw text of everything said during the call. |

---

## File: `chats.csv`

Each row represents a single **web chat session** between a visitor and an AI chat agent embedded on the agency's website. The chat agent serves the same purpose as the voice agent but via text.

### Fields

| Field | Type | Description |
|---|---|---|
| `created_at_et` | string | Timestamp of when the chat session was created, formatted in **US Eastern Time**. |
| `agency_name` | string | The name of the insurance agency whose AI chat agent handled the conversation. |
| `id` | UUID | Unique identifier for the chat session. |
| `chat_url` | URL | Direct link to view the chat in the PolicyLift app (e.g. `https://app.policylift.ai/chats/<uuid>`). Requires authenticated access. |
| `status` | string | The final status of the chat. Common values: `completed` (chat finished normally), `active` (still in progress at time of export — unlikely given the query window), `abandoned` (visitor left without finishing). |
| `line` | string or null | The insurance line of business — `personal` or `commercial`. May be null if the chat ended before the agent could determine the line. |
| `type` | string or null | The specific insurance type being quoted (e.g. `auto`, `home`, `general_liability`). May be null if undetermined. |
| `score` | integer (0–100) | AI-assigned quality/completeness score, same semantics as calls. Indicates how much relevant quote information was successfully collected. |
| `short_summary` | string or null | Brief AI-generated summary of the chat. May be null if the chat was too short or abandoned before analysis. |
| `chat_duration` | interval or null | Duration of the chat session. May be null if the chat was never formally closed (i.e. `finished_at` is null). |
| `message_count` | integer | Number of individual messages exchanged. Each agent or user message counts as one. |
| `data` | JSON | **Structured data extracted from the chat.** Same concept as the calls `data` field — contains the insurance information collected during the conversation, structured as a JSON object. The shape depends on the policy type. |
| `transcript` | string | The full chat transcript with each turn on a new line as `role: content`. Roles are `assistant` (the AI agent) and `user` (the website visitor). Note: chat messages are stored internally as multi-part JSON structures, so the transcript here is a flattened text extraction of all text parts from each message. |

---

## Key Differences Between Calls and Chats

| Aspect | Calls (`calls.csv`) | Chats (`chats.csv`) |
|---|---|---|
| Channel | Phone (voice via LiveKit) | Web chat widget |
| `phone_number` | Present (caller's number) | Not available |
| `raw_agent_data` | Present (real-time agent capture) | Not available — chats do not have this field |
| `transcript` format | Plain text (`role: content`) | Extracted from JSON parts (`role: flattened text`) |
| Nullable fields | Most fields are non-null | `line`, `type`, `short_summary`, `chat_duration` may be null |

## Important Notes

- **All rows have `reason = 'quote'`**: Every conversation in both files was classified by the AI as a quote request. Other possible reasons (not in this dataset) include `service`, `claims`, `billing`, `general_inquiry`, `spam`, etc.
- **Test agencies are excluded**: Two known internal/test agencies (ACME Agency Demo and Raghav Texas Insurance Test) have been filtered out. All rows represent real customer agencies and real conversations.
- **Time window**: Both datasets cover conversations from the last 30 days relative to when the query was run.
- **The `data` JSON is the most valuable field for structured analysis**: It contains the actual insurance quote information (applicant details, coverage needs, property/vehicle info, etc.) in machine-readable form. The exact keys depend on the policy `type` — an auto quote will have vehicle VINs and driver info, while a home quote will have property address and construction details.
- **Scores are relative, not absolute**: A score of 60 on a complex commercial policy might represent a solid conversation, while a 60 on a simple renters quote might indicate missing critical info. Consider scores in the context of the policy `type`.
- **Transcripts may be long**: Voice call transcripts especially can be thousands of words. Chat transcripts tend to be shorter but more structured.
