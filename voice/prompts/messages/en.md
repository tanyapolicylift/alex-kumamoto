---
note: "All English (EN) voice message templates. Short TTS-optimized strings."
updated: 2026-04-04
---

# English Message Templates

## Orchestrator

| Prompt | Ver | Text |
|---|---|---|
| `voice/orchestrator/messages/en/intro` | 12 | Hi - Thanks for calling {{agencyName}}, this is {{assistantName}} on a recorded line. How can I help? |
| `voice/orchestrator/messages/en/farewell` | 2 | Thanks for calling us, we appreciate your time. Have a great day! Goodbye. |
| `voice/orchestrator/messages/en/outro` | 2 | Thank you for your time today. One of our licensed agents will contact you, usually within one business day. Is there anything else I can help you with before we wrap up? |
| `voice/orchestrator/messages/en/pre-hang-up` | 1 | Is there anything else I can help you with today? |
| `voice/orchestrator/messages/en/transfer-to-human` | 1 | Let me connect you with one of our agents who can help you further. Please hold for a moment. |

## Booking

| Prompt | Ver | Text |
|---|---|---|
| `voice/booking/messages/en/intro` | 1 | Okay, I'll help you find an available time and book it. Let's go over a few details |
| `voice/booking/messages/en/check-availability-tool-intro` | 1 | Let me check if that time is available. This might take a few seconds. |
| `voice/booking/messages/en/schedule-appointment-tool-intro` | 1 | Let me book that appointment for you. This might take a few seconds. |
| `voice/booking-with-phone/messages/en/intro` | 1 | Okay, let me get your availability so that a licensed agent can follow up with you. |

## PEO

| Prompt | Ver | Text |
|---|---|---|
| `voice/peo/messages/en/intro` | 2 | Sure. Let me grab some info now so when an agent calls you back, they're ready to go. |

## Shared

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/messages/en/quote-intro` | 4 | Sure. Let me grab some info now so when an agent calls you back, they're ready to go. |
| `voice/shared/messages/en/quote-book-upfront` | 2 | Sure, let's set that up. |

## Record Name

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-name/messages/en/ask-name` | 1 | Can you give me your first and last name? |
| `voice/shared/record-name/messages/en/verify-name` | 1 | Okay, I have that as {{firstName}} {{lastName}}. {{firstName}}: {{spelledFirstName}} and {{lastName}}: {{spelledLastName}}. Is that correct? |
| `voice/shared/record-name/messages/en/verify-first-name` | 4 | Okay, I have that as {{firstName}} {{lastName}}, with your first name spelled {{spelledFirstName}}. Is that correct? |
| `voice/shared/record-name/messages/en/verify-last-name` | 2 | Okay, I have that as {{firstName}} {{lastName}}, with your last name spelled {{spelledLastName}}. Is that correct? |
| `voice/shared/record-name/messages/en/verify-first-and-last-name` | 1 | Okay, I have that as {{firstName}} {{lastName}}. {{firstName}}: {{spelledFirstName}} and {{lastName}}: {{spelledLastName}}. Is that correct? |

## Record Email

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-email/messages/en/ask-email` | 4 | Now, would you be able to provide your email address? |
| `voice/shared/record-email/messages/en/verify-email` | 1 | Okay, I have that as {{spelledEmail}}. Is that correct? |
| `voice/shared/record-email/messages/en/move-on-without-email` | 1 | No worries, we can proceed without your email and a licensed agent will follow up later. |

## Record Phone Number

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-phone-number/messages/en/ask-phone-number` | 1 | Could you please tell me the best phone number to reach you at? |
| `voice/shared/record-phone-number/messages/en/verify-phone-number` | 1 | Just to confirm, your phone number is {{spelledPhoneNumber}}, right? |
| `voice/shared/record-phone-number/messages/en/verify-initial-phone-number` | 2 | Just to confirm, should we use the number you're calling from? {{phoneNumber}} |

## SMS Consent

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/sms-consent/messages/en/ask-consent` | 9 | Okay cool, would you like the ability to text us details and receive updates on your quote? |
| `voice/shared/sms-consent/messages/en/consent-script` | 12 | Awesome, we'll send you a text after this call. Message and data rates apply. Good to go? |

## Quote Intros (All Types)

All 33 EN quote intro messages (25 personal + 8 commercial) use the same text:

> "Okay as a voice assistant I'll work with a licensed agent to get you a quote, but it will greatly speed up the process if we can go over a few details now."
