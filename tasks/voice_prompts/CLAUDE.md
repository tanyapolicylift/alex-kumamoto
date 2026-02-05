# Voice Prompts - Langfuse Prompt System

This folder contains the voice assistant prompts managed through Langfuse. These prompts power our AI voice receptionist for insurance agencies.

## Langfuse Prompt Reference Syntax

Prompts use inline references to include shared content:

```
@@@langfusePrompt:name=voice/shared/agency-information|label=production@@@
```

**How to read this:**
- `name=voice/shared/agency-information` → Maps to file `shared/agency-information.md`
- `label=production` → Always assume production label (Langfuse handles versioning)

**Path mapping:** The Langfuse name `voice/X/Y` corresponds to local file `X/Y.md` in this folder.

## Template Variables

Variables use double curly braces: `{{variableName}}`

**Common variables:**
- `{{assistantName}}` - Name of the voice assistant
- `{{agencyName}}` - Insurance agency name
- `{{currentDate}}` - Today's date for time-based reasoning
- `{{currentLanguage}}` - Active conversation language
- `{{availableLanguages}}` - Languages the assistant can speak
- `{{licensedStates}}` - States where agency is licensed
- `{{locationAddress}}` - Physical address
- `{{locationHours}}` - Business hours
- `{{insuranceCarriers}}` - Insurance companies represented
- `{{policyTypes}}` - Types of insurance offered
- `{{agencyLocationGeneralInfo}}` - Additional agency details

## Folder Structure

```
voice_prompts/
├── CLAUDE.md              # This context file
├── orchestrator/          # Main entry-point prompts
│   └── instructions.md    # Primary orchestrator prompt
└── shared/                # Reusable prompt components
    ├── agency-information.md   # Agency details template
    ├── system-instructions.md  # Tone and style guidelines
    └── language.md             # Multi-language handling
```

## Prompt Architecture

```
orchestrator/instructions.md
    ├── @@@voice/shared/agency-information@@@
    ├── @@@voice/shared/system-instructions@@@
    └── @@@voice/shared/language@@@
```

The orchestrator is the main prompt that gets compiled with all referenced shared prompts expanded inline.

## Working with Prompts

### When making changes:
1. **Shared prompts** (`shared/`) - Changes affect ALL prompts that reference them
2. **Orchestrator prompts** (`orchestrator/`) - Specific to that voice flow

### Before editing:
- Check which other prompts reference a shared component
- Consider if the change should be universal or flow-specific

### Tools referenced in prompts:
- `transferToQuote` - Hand off to quote flow (by insurance type)
- `hangUp` - End the call gracefully
- `switchLanguage` - Change conversation language

## Key Guidelines from the Prompts

**Tone:** Human, not scripted. Short and direct. React before responding.

**TTS Output Rules:**
- Spell out abbreviations (TX → Texas)
- No ellipses, colons, dashes - only periods and commas
- One question at a time

**Routing Logic:**
1. Quotes → Get insurance type, then `transferToQuote`
2. Existing policy → Take message, warn about no binding, `hangUp`
3. Done → `hangUp`
