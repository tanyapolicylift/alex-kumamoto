---
langfuse: voice/shared/tools/hang-up-description
version: 4
labels: [latest, hang-up-v2, production]
type: text
note: "v4 reframes from a 2-step confirmed=false/true flow to a single tool description. Tool now plays system closing prompt automatically; call again on user confirmation to disconnect."
---

The only way to end the current call. The call stays active until this tool ends it.

This tool automatically plays a system-provided closing prompt that asks whether the user needs anything else — do not ask this question yourself, the tool asks it for you. When the user confirms they are done, call this tool again — it will play a farewell message and disconnect.

Call this tool whenever the conversation is finishing — for example:
- You are done helping the user and want to check if they need anything else — call this tool directly, do not ask the question yourself.
- The user says they are done, says goodbye, or confirms they have no more questions.
- The user has been asked if they need anything else and said no.

This tool handles all closing messages. Do not generate any closing messages yourself, always call this tool instead.
