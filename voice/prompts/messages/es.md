---
note: "All Spanish (ES) voice message templates. Short TTS-optimized strings."
updated: 2026-04-04
---

# Spanish Message Templates

## Orchestrator

| Prompt | Ver | Text |
|---|---|---|
| `voice/orchestrator/messages/es/intro` | 1 | Hola. Soy {{assistantName}} de {{agencyName}}. ¿En que puedo ayudarle hoy? |
| `voice/orchestrator/messages/es/farewell` | 1 | Gracias por su tiempo. ¡Adios! |
| `voice/orchestrator/messages/es/outro` | 1 | Gracias por su tiempo hoy. Uno de nuestros agentes autorizados se pondra en contacto con usted, generalmente dentro de un dia habil. ¿Hay algo mas en lo que pueda ayudarle antes de terminar? |
| `voice/orchestrator/messages/es/pre-hang-up` | 1 | ¿Hay algo mas en lo que pueda ayudarle hoy? |
| `voice/orchestrator/messages/es/transfer-to-human` | 1 | Permitame conectarlo con uno de nuestros agentes que puede ayudarlo mas. Por favor, espere un momento. |

## Booking

| Prompt | Ver | Text |
|---|---|---|
| `voice/booking/messages/es/intro` | 1 | De acuerdo, le ayudare a encontrar un horario disponible y agendarlo. Repasemos algunos detalles. |
| `voice/booking/messages/es/check-availability-tool-intro` | 1 | Permitame verificar si ese horario esta disponible. Esto podria tomar unos segundos. |
| `voice/booking/messages/es/schedule-appointment-tool-intro` | 1 | Permitame agendar esa cita para usted. Esto podria tomar unos segundos. |
| `voice/booking-with-phone/messages/es/intro` | 1 | De acuerdo, permitame obtener su disponibilidad para que un agente autorizado pueda hacer seguimiento con usted |

## PEO

| Prompt | Ver | Text |
|---|---|---|
| `voice/peo/messages/es/intro` | 1 | De acuerdo, un agente autorizado le devolvera la llamada, pero puedo acelerar el proceso si me proporciona algunos detalles ahora. |

## Shared

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/messages/es/quote-intro` | 2 | De acuerdo, un agente autorizado le devolvera la llamada, pero puedo acelerar el proceso si me proporciona algunos detalles ahora. |
| `voice/shared/messages/es/quote-book-upfront` | 1 | Perfecto, vamos a programar una cita para que hable con un agente autorizado. |

## Record Name

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-name/messages/es/ask-name` | 1 | ¿Puede darme su nombre y apellido? |
| `voice/shared/record-name/messages/es/verify-name` | 1 | De acuerdo, tengo esto como {{firstName}} {{lastName}}. {{firstName}}: {{spelledFirstName}} y {{lastName}}: {{spelledLastName}}. ¿Es correcto? |
| `voice/shared/record-name/messages/es/verify-first-name` | 2 | Perfecto, entonces lo tengo como {{firstName}} {{lastName}}, con su nombre escrito como {{spelledFirstName}}. ¿Es correcto? |
| `voice/shared/record-name/messages/es/verify-last-name` | 2 | Perfecto, entonces lo tengo como {{firstName}} {{lastName}}, con su apellido escrito como {{spelledLastName}}. ¿Es correcto? |
| `voice/shared/record-name/messages/es/verify-first-and-last-name` | 1 | De acuerdo, tengo esto como {{firstName}} {{lastName}}. {{firstName}}: {{spelledFirstName}} y {{lastName}}: {{spelledLastName}}. ¿Es correcto? |

## Record Email

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-email/messages/es/ask-email` | 1 | ¡Perfecto! Ahora, ¿podria proporcionar su direccion de correo electronico? |
| `voice/shared/record-email/messages/es/verify-email` | 1 | De acuerdo, tengo esto como {{spelledEmail}}. ¿Es correcto? |
| `voice/shared/record-email/messages/es/move-on-without-email` | 1 | No se preocupe, podemos continuar sin su correo electronico y un agente autorizado hara seguimiento mas tarde. |

## Record Phone Number

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/record-phone-number/messages/es/ask-phone-number` | 1 | ¿Podria decirme el mejor numero de telefono para contactarlo? |
| `voice/shared/record-phone-number/messages/es/verify-phone-number` | 1 | Solo para confirmar, su numero de telefono es {{spelledPhoneNumber}}, ¿correcto? |
| `voice/shared/record-phone-number/messages/es/verify-initial-phone-number` | 1 | Solo para confirmar, ¿debemos usar el numero desde el que esta llamando? {{phoneNumber}} |

## SMS Consent

| Prompt | Ver | Text |
|---|---|---|
| `voice/shared/sms-consent/messages/es/ask-consent` | 2 | Perfecto, ¿le gustaria poder enviarnos los detalles por mensaje de texto y recibir actualizaciones sobre su cotizacion? |
| `voice/shared/sms-consent/messages/es/consent-script` | 2 | Excelente, le enviaremos un mensaje de texto despues de esta llamada. Pueden aplicar tarifas de mensajes y datos. ¿Todo listo? |

## Quote Intros (All Types)

All 33 ES quote intro messages (25 personal + 8 commercial) use the same text:

> "De acuerdo, como asistente de voz trabajare con un agente autorizado para conseguirte una cotizacion, pero acelerara mucho el proceso si podemos repasar algunos detalles ahora."
