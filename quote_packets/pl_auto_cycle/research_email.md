# Research: Email Integration for Post-Lead Follow-Up Automation (BYOD vs Transactional)

References: [[spec_email]], [[cycle_spec]], [[cycle_prd]]

---

**Date**: 2026-02-10
**Author**: Alex
**Purpose**: Evaluate the "Bring Your Own Domain" (BYOD) approach -- sending/receiving emails through the producer's actual inbox via email API abstraction layers (Nylas, Microsoft Graph, Gmail API) -- versus traditional transactional email providers (Postmark, SendGrid). Determine the best architecture for automated post-lead follow-up emails in our insurance agency platform.

**Use Case Summary**: After a customer calls an insurance agency for a personal auto or home quote but doesn't provide all needed data, we automatically send emails asking them to complete a smart form or upload their current policy declaration page. The key question: should these emails come from our infrastructure (e.g., `quotes@abcinsurance.com` via Postmark) or from the producer's actual inbox (e.g., `john@abcinsurance.com` via Nylas/Graph API)?

---

## 1. Email API Abstraction Layers (BYOD Approach)

### 1.1 Nylas (Primary Candidate)

[Nylas](https://www.nylas.com/) provides a unified REST API for integrating with email, calendar, and contacts across Google Workspace, Microsoft 365, and IMAP providers.

#### Current Product Offerings (v3 API)

Nylas v3 is the current generation API, which introduced significant improvements over v2:

- **Unified Email API**: Send, receive, read, search, and organize emails across all major providers through a single API.
- **Threads API**: Retooled for v3, gives fine-grained control over detecting collections of messages and managing conversations.
- **Webhooks**: Improved in v3 -- webhook payloads now contain the full object that triggered the notification (up to 1 MB), eliminating the need for follow-up API calls. Notification types include `message.created`, `message.updated`, `message.opened`, `message.link_clicked`, `thread.replied`.
- **Scheduled Send**: Native "Send Later" -- post a message with a timestamp and Nylas handles delivery at the exact time.
- **Bounce Detection**: Real-time notifications when emails bounce.
- **Message Tracking**: Open tracking (via transparent pixel), link click tracking, and thread reply tracking. Available in production apps only.
- **Attachment Handling**: Full support for sending and receiving attachments. Download via `GET /v3/grants/{grant_id}/attachments/{id}/download`.
- **Smart Compose**: AI-powered email drafting (less relevant for our automated use case).

#### Pricing Tiers

As of early 2026, Nylas offers four tiers under its Full Platform plan:

| Tier | Cost per Connected Account (CA) / Month | Notes |
|---|---|---|
| **Entry** | ~$3.29/CA/month | Basic email, calendar, contacts |
| **Core** | ~$4.59/CA/month | Adds message tracking, scheduled send |
| **Plus** | ~$5.29/CA/month | Premium features, higher rate limits |
| **Custom** | Contact sales | Enterprise pricing, volume discounts |

A "connected account" (CA) is each end-user email account connected through Nylas. If we connect 50 producer inboxes, that's 50 CAs.

**Cost projections for our use case**:

| Scale | Connected Accounts | Monthly Nylas Cost (Core tier) |
|---|---|---|
| Launch (5 agencies, 2 producers each) | 10 | ~$46/month |
| Growth (20 agencies, 3 producers each) | 60 | ~$275/month |
| Scale (50 agencies, 4 producers each) | 200 | ~$918/month |
| Large scale (200 agencies) | 600+ | ~$2,754/month (likely negotiable) |

**Key pricing note**: At scale, Nylas becomes a significant line item. EmailEngine ($995/year flat, unlimited accounts) becomes more cost-effective at ~30+ connected accounts.

Sources: [Nylas Pricing](https://www.nylas.com/pricing/), [Nylas Pricing Guide (Zeeg)](https://zeeg.me/en/blog/post/nylas-api-pricing)

#### Send and Receive Capabilities

**Sending**: When you call `POST /v3/grants/{grant_id}/messages/send`, Nylas connects directly to the provider (Gmail, Outlook) and sends the message *as the user*. The provider sees the activity as the user sending a message, not from an external service. **The email appears in the user's Sent folder automatically.** This is the core differentiator vs. transactional ESPs.

**Receiving**: Nylas syncs incoming messages and fires `message.created` webhooks in real time. We receive the full message payload including body, headers, attachments, and thread context.

**Thread tracking**: The Threads API lets us follow the full conversation thread. If our system sends an automated message and the customer replies, the reply is part of the same thread. If the producer then jumps in manually, that message is also in the thread. We can read the entire conversation history.

Sources: [Sending Messages with Nylas](https://developer.nylas.com/docs/v3/email/send-email/), [Nylas Messages API](https://developer.nylas.com/docs/v3/email/)

#### OAuth Integration

Nylas uses OAuth 2.0 for authenticating user accounts:

**Google Workspace**:
- Scopes needed: `https://www.googleapis.com/auth/gmail.modify` (read/write/send), `https://www.googleapis.com/auth/gmail.send` (send only). Nylas also supports the more limited `gmail.metadata` scope for read-only scenarios.
- The producer clicks through a Google consent screen during onboarding.
- Google Workspace admins can pre-approve the Nylas app for their domain, eliminating per-user consent.

**Microsoft 365**:
- Requires Entra ID (Azure AD) app registration.
- Scopes: `Mail.ReadWrite`, `Mail.Send`, `offline_access`.
- Admin consent can be granted org-wide by a Microsoft 365 admin, or individual users can consent if the org's policy allows it.
- Microsoft issues new refresh tokens with each access token request. Nylas leverages this to extend token lifespans.

**Token management**:
- Access tokens expire after 1 hour.
- Refresh tokens don't expire unless revoked.
- Nylas's "Hosted OAuth with API Key" method handles token refresh automatically after initial setup. Your app stores the grant ID, access token, and refresh token. Nylas manages the refresh cycle.
- If a token becomes invalid (user revokes, admin changes policy), Nylas fires a `grant.expired` webhook so you can prompt re-authentication.

Sources: [Nylas Authentication](https://developer.nylas.com/docs/v3/auth/), [Google Provider Guide](https://developer.nylas.com/docs/dev-guide/provider-guides/google/), [Token Lifetimes](https://support.nylas.com/hc/en-us/articles/16115127208221)

#### Webhook Support for Inbound Emails

Nylas v3 webhooks deliver JSON payloads containing the full message object. Key triggers:

| Trigger | Description |
|---|---|
| `message.created` | New message received (inbound reply) |
| `message.updated` | Message flags changed (read/unread) |
| `message.opened` | Recipient opened a tracked message |
| `message.link_clicked` | Recipient clicked a tracked link |
| `thread.replied` | New reply in a tracked thread |
| `message.bounce_detected` | Email bounced |
| `grant.expired` | OAuth token needs re-authentication |

If a payload exceeds 1 MB, Nylas truncates the body and appends `.truncated` to the trigger name.

Source: [Nylas Webhooks](https://developer.nylas.com/docs/v3/notifications/webhooks/)

#### Rate Limits

Nylas itself does not impose strict sending rate limits, but the underlying providers do:

| Provider | Daily Sending Limit | Per-Message Recipient Limit | Notes |
|---|---|---|---|
| **Google Workspace** | 2,000 emails/day per user | 100 recipients via API per message | 3,000 total recipients/day; 2,000 external recipients/day. Exceeding triggers 24-hour lockout. |
| **Microsoft 365** | 10,000 messages/day (E3/E5) | 500 recipients per message | More generous than Google. Lower tiers may have lower limits. |
| **Gmail (free)** | 500 emails/day | 100 recipients per message | Not relevant for business use. |

**For our use case**: A single producer sending 20-50 follow-up emails per day is well within limits. At 2,000/day per Google Workspace user, we'd need to send ~80 follow-ups per hour for 24 hours to hit the cap. This is not a concern at our current scale.

Sources: [Gmail Sending Limits](https://support.google.com/a/answer/166852), [Gmail API Quota](https://developers.google.com/workspace/gmail/api/reference/quota)

#### Reliability / Uptime

- Nylas publishes status pages for [v2](https://status-v2.nylas.com/) and [v3](https://status-v3.nylas.com/).
- StatusGator has tracked 449+ incidents over ~4 years. The last acknowledged outage as of this writing was December 30, 2025 ("Small number of API Calls returning 400 JSON input errors for Microsoft").
- Nylas does not publish a formal SLA percentage on their public website, but enterprise contracts typically include SLA terms.
- Overall: reliable for a managed service, but you should build retry logic and graceful degradation (e.g., queue emails if Nylas is temporarily unreachable).

Sources: [Nylas v3 Status](https://status-v3.nylas.com/), [StatusGator Nylas](https://statusgator.com/services/nylas)

#### Compliance and Security

- **SOC 2 Type II** certified (security, availability, confidentiality). Report available under NDA.
- **GDPR** compliant. CCPA, Privacy Shield, HIPAA/HITECH, FINRA support.
- **Data residency**: Two regions (US and Europe), completely isolated. You choose on the Nylas Dashboard.
- **Encryption**: AES-256 at rest, TLSv1.2+ in transit.
- **Data storage**: Nylas does sync and store email metadata and content to provide its API. The extent depends on configuration (e.g., the `gmail.metadata` scope stores less). This is an important consideration for insurance data.

Sources: [Nylas Security](https://www.nylas.com/security/), [Nylas Data Residency](https://developer.nylas.com/docs/dev-guide/platform/data-residency/)

#### Insurance Industry Relevance

Nylas specifically markets to fintech and insurance. Their blog discusses insurance use cases including:
- Automating bi-directional engagement across email providers
- Email parsing for real-time policy personalization
- Central communication hub for claims communication
- Nowsite case study mentions insurance brokers as key users

No publicly available dedicated insurance case study, but the platform is clearly used in the vertical.

Sources: [Nylas Insurance Solutions](https://www.nylas.com/blog/fintech-insurance-digital-innovation/), [Nylas Case Studies](https://www.nylas.com/case-studies/)

---

### 1.2 Alternatives to Nylas

#### Microsoft Graph API (Direct)

Bypass Nylas and integrate directly with Microsoft 365 via [Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview).

**Capabilities**:
- Send email as user: `POST /users/{id}/sendMail` -- email appears in user's Sent folder.
- Read email: `GET /users/{id}/messages` -- full access to inbox, attachments, threads.
- Webhooks: Subscribe to `messages` resource changes for real-time notifications.
- Attachment handling: Full CRUD for attachments.

**Authentication**:
- Requires registering an app in Microsoft Entra ID (Azure AD).
- **Delegated permissions**: User signs in via OAuth, app acts on their behalf. Requires `Mail.ReadWrite`, `Mail.Send`.
- **Application permissions**: App acts without user sign-in. Requires `Mail.Send` application permission + admin consent. More powerful but raises security concerns (app can send as *any* user in the org).
- Admin consent can be granted tenant-wide by a Global Admin or Privileged Role Administrator.

**Pros**: Free (no per-account cost), full control, first-party API, high reliability.

**Cons**: Only works for Microsoft 365 users. You'd need a separate integration for Google Workspace agencies. Higher implementation complexity -- you handle token management, rate limiting, retry logic, webhook subscriptions yourself. Microsoft's documentation is vast but can be hard to navigate.

**Integration effort**: 2-4 weeks for a production-ready implementation with proper error handling, token refresh, and webhook management.

Sources: [Graph Mail API](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview), [Send Mail on Behalf of User](https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user), [Graph Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)

#### Google Gmail API (Direct)

Bypass Nylas and integrate directly with Google Workspace via the [Gmail API](https://developers.google.com/gmail/api).

**Capabilities**:
- Send email as user: `users.messages.send` -- email appears in user's Sent folder.
- Read email: `users.messages.get`, `users.messages.list`.
- Incoming email notifications: Via Google Cloud Pub/Sub push notifications. Gmail pushes change notifications to a Pub/Sub topic; your app subscribes.
- Thread tracking: Gmail natively uses thread IDs.
- Attachment handling: Download attachments via `users.messages.attachments.get`.

**Authentication**:
- OAuth 2.0 via Google Cloud Console app registration.
- Scopes: `gmail.send`, `gmail.modify`, `gmail.readonly`.
- Google Workspace admins can pre-approve apps via the Admin Console.

**Pros**: Free (no per-account cost), native Gmail thread model, good documentation.

**Cons**: Only works for Google Workspace users. Pub/Sub setup adds complexity. You handle token management yourself. Rate limits are quota-unit based (250 units/user/second, `messages.send` = 100 units). The 2,000 emails/day sending limit applies.

**Integration effort**: 2-3 weeks for a production-ready implementation. Slightly simpler than Graph API due to more straightforward auth flow.

Sources: [Gmail API](https://developers.google.com/workspace/gmail/api/reference/quota), [Gmail Sending Limits](https://support.google.com/a/answer/166852)

#### Postmark / SendGrid with Custom SMTP (Transactional ESP)

Traditional transactional email providers can send "on behalf of" a custom domain by configuring DKIM and SPF DNS records.

**How it works**: The agency adds DNS records (CNAME for DKIM, TXT for SPF) pointing to the ESP. Emails are sent from the ESP's infrastructure but authenticated against the agency's domain. The "From" address can be `john@abcinsurance.com`.

**Key difference from BYOD**: The email does *not* appear in the producer's Sent folder. The producer has no visibility into what was sent unless they check our dashboard. The email was technically sent by Postmark/SendGrid's servers, not from the producer's mailbox.

**Deliverability**: Good, but requires domain warm-up for new sending domains. The agency's existing domain reputation doesn't directly transfer because the email is sent from a different IP/infrastructure.

**Pros**: Full control over sending infrastructure, built-in analytics, higher volume limits, no OAuth complexity, easier to manage at scale.

**Cons**: No Sent folder visibility, feels less personal, requires DNS setup per agency, domain warm-up needed, producer has no context if customer calls about the email.

#### Mailgun

[Mailgun](https://www.mailgun.com/) is a transactional email service with strong inbound routing.

- **Pricing**: Foundation plan at $35/month for 50,000 emails, supports 1,000 custom domains.
- **Inbound routing**: Flexible regex-based routing rules. Routes inbound emails to webhooks.
- **SMTP relay**: Can relay emails through custom domains with proper DKIM/SPF.
- **Same limitation as Postmark/SendGrid**: Sends from Mailgun's infrastructure, not the producer's inbox. No Sent folder visibility.

Source: [Mailgun Pricing](https://www.mailgun.com/pricing/)

#### EmailEngine (Self-Hosted Nylas Alternative)

[EmailEngine](https://emailengine.app/) is a self-hosted email API that provides REST access to Gmail, Outlook, and IMAP mailboxes.

- **Pricing**: $995/year flat license, unlimited mailboxes and instances. No per-account cost.
- **Capabilities**: Send/receive, webhooks (near-instant), attachment handling, HTML templates, delivery tracking. Supports Gmail API, Microsoft Graph, and IMAP/SMTP natively.
- **Data privacy**: Email never leaves your network. Ideal for GDPR, HIPAA, or fintech constraints.
- **Self-hosted**: You manage the infrastructure (server, uptime, updates).
- **Break-even vs Nylas**: ~30 connected accounts. Below that, Nylas is cheaper; above that, EmailEngine saves money.
- **14-day free trial** available.

**Pros**: Dramatically cheaper at scale, full data control, no vendor dependency on Nylas.

**Cons**: You own the infrastructure and uptime. Requires DevOps capacity. Less polished developer experience than Nylas. Community support vs. Nylas's enterprise support.

**Assessment for our use case**: Strong option if we reach 50+ connected accounts and want to control costs. Not ideal for V1 launch when we need to move fast, but worth considering for V2.

Sources: [EmailEngine vs Nylas](https://learn.emailengine.app/docs/comparison/emailengine-vs-nylas), [EmailEngine Docs](https://learn.emailengine.app/docs)

#### Unipile

[Unipile](https://www.unipile.com/) is a unified messaging API covering email, LinkedIn, WhatsApp, Instagram, Messenger, Telegram, and X.

- **Pricing**: Starts at EUR 49/month (~$55) including 10 connected accounts. Additional accounts ~$5-5.50 each.
- **Email support**: Gmail, Outlook, IMAP. Send, receive, organize, track, thread management.
- **SOC 2 Type II** certified (as of October 2025).
- **99.9% uptime SLA**.
- **No usage limits** on messages sent/received.

**Pros**: Multi-channel beyond email (LinkedIn messaging could be useful for prospecting). Cheaper per-account than Nylas. SOC 2 certified.

**Cons**: Younger company, less established than Nylas. Email is one of many channels rather than their core focus. The LinkedIn/WhatsApp features are not relevant to our current use case.

**Assessment**: Worth a POC if we want to save on per-account costs vs. Nylas. The multi-channel angle is interesting but not critical for V1.

Sources: [Unipile Pricing](https://www.unipile.com/pricing-api/), [Unipile Email API](https://www.unipile.com/communication-api/email-api/)

---

### 1.3 Comparison Matrix

| Criteria | **Nylas** | **MS Graph (Direct)** | **Gmail API (Direct)** | **ESP (Postmark/SendGrid)** | **EmailEngine** | **Unipile** |
|---|---|---|---|---|---|---|
| **Integration complexity** | Low (1-2 weeks). Unified API for all providers. | Medium (2-4 weeks). Microsoft only. Must handle auth, webhooks, retries. | Medium (2-3 weeks). Google only. Pub/Sub setup. | Low (1 week). Well-documented, battle-tested SDKs. | Medium (2-3 weeks). Self-hosted setup + API integration. | Low-Medium (1-2 weeks). Similar to Nylas. |
| **Cost per account/month** | $3.29-5.29/CA | Free | Free | Free (pay per email: ~$0.001-0.002/email) | $995/year flat (unlimited) | ~$5.50/CA |
| **Send-as (from producer's address)** | Yes, fully. Email appears in Sent folder. | Yes, fully. Email appears in Sent folder. | Yes, fully. Email appears in Sent folder. | Partial. From address can be customized, but email does NOT appear in Sent folder. | Yes, fully. Email appears in Sent folder. | Yes, fully. Email appears in Sent folder. |
| **Inbound email handling** | Webhooks with full payload. Attachments accessible via API. | Webhook subscriptions (change notifications). Must fetch full message separately. | Pub/Sub notifications. Must fetch full message separately. | Inbound parse webhook. Full message as JSON/multipart. | Near-instant webhooks. Full payload. | Webhooks. Full payload. |
| **Thread tracking** | Native Threads API. Full conversation history. | Thread via `conversationId`. Good support. | Native `threadId`. Excellent support. | No native thread tracking. Must implement via `In-Reply-To` / `References` headers. | Thread support via message references. | Thread management supported. |
| **Deliverability** | Excellent. Uses producer's established domain and IP reputation. No warm-up. | Excellent. Same as Nylas -- sends from producer's actual mailbox. | Excellent. Same as Nylas -- sends from producer's actual mailbox. | Good, but requires domain warm-up. DNS setup per agency. Shared IP reputation unless dedicated IP. | Excellent. Same as Nylas -- sends from actual mailbox. | Excellent. Same as Nylas -- sends from actual mailbox. |
| **Producer visibility** | Full. Sent folder + inbox replies visible in their normal email client. | Full. Same as Nylas. | Full. Same as Nylas. | None. Producer doesn't see sent emails or replies unless they check our dashboard. | Full. Same as Nylas. | Full. Same as Nylas. |
| **Scalability** | 1000s of accounts. Per-account cost scales linearly. | Unlimited accounts. Free. But must handle Microsoft-only limitation. | Unlimited accounts. Free. But must handle Google-only limitation. | Unlimited. Cost scales per email, not per account. Most scalable option. | Unlimited accounts on flat license. Infrastructure scales with your servers. | 1000s of accounts. Per-account cost scales linearly (cheaper than Nylas). |
| **OAuth complexity** | Low. Nylas handles token refresh. You store grant ID. | Medium. You manage Entra ID app registration, token refresh, admin consent. | Medium. You manage Google Cloud Console, token refresh, pub/sub. | None. API key or SMTP credentials. | Medium. You configure per-provider OAuth apps. EmailEngine manages tokens. | Low. Similar to Nylas. |
| **Maintenance burden** | Low. Managed service. | Medium. You maintain auth, webhooks, error handling for Microsoft. | Medium. You maintain auth, pub/sub, error handling for Google. | Low. Managed service. | High. You own the infrastructure (server, updates, monitoring). | Low. Managed service. |
| **Email tracking (opens/clicks)** | Yes. Built-in pixel tracking and link rewriting. | No built-in tracking. Must implement yourself. | No built-in tracking. Must implement yourself. | Yes. Built-in open/click tracking, detailed analytics. | No built-in tracking. Must implement yourself. | Limited tracking capabilities. |
| **Provider coverage** | Google, Microsoft, IMAP (covers ~99% of business email) | Microsoft only | Google only | Any domain (you control DNS) | Google, Microsoft, IMAP | Google, Microsoft, IMAP |

---

## 2. Tradeoffs: BYOD vs Transactional Sender

### 2.1 BYOD (Nylas / Graph API / Gmail API)

**Pros**:

1. **Emails come from the producer's actual address** (`john@abcinsurance.com`). The customer sees a real person they spoke with, not a generic system email.

2. **Lands in the producer's Sent folder**. The producer has full visibility into every automated email sent on their behalf. If a customer calls and says "I got an email from you," the producer can see it in their Sent folder and respond intelligently.

3. **Customer replies go to the producer's inbox**. The producer can jump in manually at any time. They can seamlessly take over the conversation without the customer knowing it was automated.

4. **Uses established domain reputation**. No domain warm-up needed. The agency's domain has years of email history, proper SPF/DKIM/DMARC, and a clean reputation. Deliverability is excellent from day one.

5. **Feels personal, not automated**. A customer receiving an email from `john@abcinsurance.com` with a normal email signature is far more likely to engage than one from `noreply@quotesystem.com`.

6. **Thread coherence**. Automated messages and manual producer messages live in the same thread. The customer sees one coherent conversation.

7. **No DNS setup per agency**. The agency doesn't need to add any DNS records for white-labeling. We just connect their existing inbox via OAuth.

**Cons**:

1. **Dependent on producer's email provider**. Must be Google Workspace or Microsoft 365 (or IMAP). If the agency uses a niche provider (GoDaddy email, Rackspace, etc.), IMAP/SMTP may work but with reduced functionality (no thread tracking, less reliable webhooks).

2. **Rate limits**. Gmail caps at 2,000 emails/day per user. Microsoft is more generous (~10,000/day). For our use case (20-50 follow-ups per producer per day), this is not a concern, but it becomes relevant if a high-volume agency has one producer handling hundreds of leads.

3. **OAuth token management**. Tokens expire and need refreshing. If a producer changes their password, revokes app access, or their admin changes security policies, the integration breaks. We need monitoring and re-auth flows. Nylas mitigates this with managed token refresh and `grant.expired` webhooks.

4. **Per-account cost with Nylas**. At $3.29-5.29/CA/month, Nylas costs add up. 200 connected accounts = ~$660-1,058/month. This can be mitigated by switching to EmailEngine at scale.

5. **Limited deliverability analytics**. Nylas provides open/click tracking via pixel/link rewriting, but it's less comprehensive than a dedicated ESP's analytics. No built-in bounce rate dashboards, deliverability scores, or inbox placement testing.

6. **Inherited deliverability issues**. If the producer's domain has a poor reputation (e.g., they've been sending spam from their personal email), we inherit that. No way to control or improve it.

7. **Admin consent required**. For Microsoft 365, an org admin may need to approve the app. For Google Workspace, the admin may need to whitelist the Nylas app. This adds friction to onboarding.

8. **Nylas stores email data**. Nylas syncs and caches email metadata and content on their servers. For insurance communications containing PII (names, DOB, VIN), this is a compliance consideration. Data residency options (US/EU) help but don't eliminate the concern.

### 2.2 Transactional Sender (Postmark / SendGrid)

**Pros**:

1. **Full control over sending infrastructure**. We decide which IPs, which domains, which sending patterns.

2. **Built-in analytics**. Open rates, click rates, bounce rates, spam complaints, delivery times -- all in a dashboard. Invaluable for optimizing our follow-up sequences.

3. **Higher volume limits**. No per-user daily cap. Postmark and SendGrid can handle millions of emails/month.

4. **Mature inbound parse**. Both Postmark and SendGrid have battle-tested inbound email parsing via webhooks. Full message body, headers, attachments delivered as JSON.

5. **No dependency on producer's email provider**. Works regardless of whether the agency uses Gmail, Outlook, or any other email service.

6. **Easier to manage at scale**. One integration, one set of API keys, one monitoring dashboard. No OAuth tokens to manage per-producer.

7. **Cost-effective**. Postmark costs ~$15-50/month for our volume. No per-account charge. Dramatically cheaper than Nylas at scale.

**Cons**:

1. **No Sent folder visibility**. The producer has no idea what emails were sent on their behalf unless they check our dashboard. If a customer says "I got your email," the producer is caught off-guard.

2. **Requires DNS setup per agency**. Each agency needs to add DKIM/SPF DNS records for their domain. This is a friction point in onboarding -- many small agency owners are not technical.

3. **Domain warm-up needed**. New sending domains need gradual volume ramp-up (50/day -> 100/day -> 200/day over 2-4 weeks). If we onboard 10 agencies at once, each needs its own warm-up period.

4. **May feel impersonal**. Even with a custom "From" address, subtle cues (email headers, `via postmarkapp.com` shown by some clients) can make it feel automated.

5. **Customer replies are tricky**. If we set the "Reply-To" to the producer's address, replies go to the producer -- but the producer has no context (they didn't send the email). If we route replies to a system inbox (for parsing), the producer is out of the loop.

6. **Separate conversation threads**. If the producer wants to follow up manually, they start a new thread (they can't reply to the automated email because it's not in their Sent folder). The customer sees a fragmented conversation.

### 2.3 Hybrid Approach

**Recommended hybrid**: Use BYOD for customer-facing emails and transactional ESP for internal system notifications.

| Email Type | Approach | Rationale |
|---|---|---|
| **Quote follow-up emails to customers** | BYOD (Nylas/Graph) | Must feel personal. Producer visibility is critical. Customer replies should land in producer's inbox. |
| **Reminder emails to customers** | BYOD (Nylas/Graph) | Same thread as initial follow-up. Producer visibility maintained. |
| **Internal notifications to producers** ("New lead assigned", "Customer submitted form") | Transactional ESP (Postmark) | No need for Sent folder visibility. System-to-user notifications. High deliverability. |
| **System alerts** ("OAuth token expired", "Weekly digest") | Transactional ESP (Postmark) | Operational emails from our system identity. |

This hybrid gives us the best of both worlds: personal, high-deliverability customer communication through the producer's inbox, and reliable system notifications through our own infrastructure.

**Integration architecture**:
```
Customer-facing emails:
  [Our Backend] --> [Nylas API] --> [Producer's Gmail/Outlook] --> Customer

Internal notifications:
  [Our Backend] --> [Postmark API] --> Producer's inbox (from noreply@oursystem.com)

Inbound replies:
  Customer --> [Producer's Gmail/Outlook] --> [Nylas webhook] --> [Our Backend] --> [LLM Parser]
```

---

## 3. Nylas Deep Dive

### 3.1 Pricing Details

| Component | Cost |
|---|---|
| **Base platform (Core tier)** | ~$4.59/connected account/month |
| **14-day free trial** | Full functionality |
| **Free tier** | Available (limited features, for development) |
| **Volume discounts** | Available on Custom tier (contact sales) |
| **Annual billing discount** | ~$1.35/CA/month (annual) vs. ~$3.30/CA/month (monthly) -- significant savings |

**Important**: Annual billing reduces per-CA cost by ~60%. At 100 CAs, this means ~$135/month (annual) vs. ~$330/month (monthly).

### 3.2 v3 API Capabilities

**Send email**:
```
POST /v3/grants/{grant_id}/messages/send
{
  "to": [{"name": "Customer Name", "email": "customer@email.com"}],
  "subject": "Almost done with your auto quote",
  "body": "<html>...</html>",
  "tracking_options": {
    "opens": true,
    "links": true,
    "thread_replies": true,
    "label": "quote-followup-123"
  }
}
```
- Email is sent from the connected account's address.
- Appears in the user's Sent folder.
- Tracking options enable open/click/reply webhooks.

**Read messages**:
```
GET /v3/grants/{grant_id}/messages?in=INBOX&limit=10
```
- Returns messages with full body, headers, attachment metadata.

**Threads**:
```
GET /v3/grants/{grant_id}/threads/{thread_id}
```
- Returns all messages in a thread. Useful for checking if a customer has already replied.

**Webhooks**:
```
POST /v3/webhooks
{
  "trigger_types": ["message.created", "message.opened", "thread.replied"],
  "webhook_url": "https://our-api.com/webhooks/nylas",
  "notification_email_addresses": ["ops@ourcompany.com"]
}
```

**Scheduled send**:
```
POST /v3/grants/{grant_id}/messages/send
{
  "to": [...],
  "subject": "...",
  "body": "...",
  "send_at": 1707580800  // Unix timestamp
}
```
- Nylas holds the message and sends at the exact specified time.

### 3.3 Authentication Flow for Agency Onboarding

**Step-by-step onboarding**:

1. Producer visits our app and clicks "Connect Email."
2. Our app redirects to Nylas's Hosted OAuth URL:
   ```
   https://api.us.nylas.com/v3/connect/auth?
     client_id=NYLAS_CLIENT_ID&
     redirect_uri=https://our-app.com/oauth/callback&
     response_type=code&
     provider=google  (or microsoft)
   ```
3. Producer sees their provider's consent screen (Google or Microsoft).
4. After consent, Nylas redirects back to our callback URL with an authorization code.
5. We exchange the code for a grant ID, access token, and refresh token.
6. The producer's inbox is now connected. We can send and receive on their behalf.

**Time to connect**: ~30 seconds for the producer. No DNS changes, no technical setup.

**Admin consent (Microsoft 365)**: If the agency's IT admin pre-approves our Nylas app in Entra ID, individual producers skip the consent screen entirely. This is the ideal path for multi-producer agencies.

**Admin consent (Google Workspace)**: The Workspace admin can add our Nylas app to the "Trusted apps" list, pre-granting the required scopes for all users in the domain.

**Non-Google/Microsoft providers**: Nylas supports IMAP/SMTP as a fallback. The producer enters their email server credentials (host, port, username, password). This works for GoDaddy, Rackspace, etc. but with reduced functionality (no thread tracking, no native Pub/Sub).

### 3.4 Email Tracking

- **Open tracking**: Nylas injects a transparent 1x1 pixel. Fires `message.opened` webhook.
- **Click tracking**: Nylas rewrites HTML links to track clicks. Fires `message.link_clicked` webhook with `link_index` and `click_id`.
- **Thread reply tracking**: Fires `thread.replied` when a new message appears in a tracked thread.
- **Limitations**: Ad blockers and CDNs can block the tracking pixel. Apple Mail Privacy Protection pre-loads images, inflating open rates. Link tracking doesn't work for links with embedded credentials (e.g., private Google Forms).
- **Not available in Sandbox** -- requires production app.

**Assessment**: Nylas tracking is sufficient for our V1 needs. We'll know if a customer opened the email and clicked the smart form link. For more advanced deliverability analytics (inbox placement rates, spam folder rates), we'd need a separate tool like Google Postmaster Tools.

### 3.5 Attachment Handling

- **Outbound**: Attach files to outgoing emails via the Send API. Supports any file type up to provider limits (Gmail: 25 MB, Outlook: 25 MB).
- **Inbound**: When a customer replies with an attachment (e.g., a photo of their dec page), the `message.created` webhook includes attachment metadata. Download via:
  ```
  GET /v3/grants/{grant_id}/attachments/{attachment_id}/download
  ```
- **Use case**: Customer emails a photo of their declaration page. We receive the webhook, download the attachment, route it to our OCR/extraction pipeline.

### 3.6 Template Support

Nylas does not have a built-in template engine. You render your HTML email body before passing it to the Send API. This aligns with our plan to use React Email for template rendering:

```
[React Email template] --> [Server-side render to HTML] --> [Nylas Send API with HTML body]
```

This gives us full control over dynamic content (missing fields, bilingual rendering, agency branding) without being constrained by Nylas's template limitations.

### 3.7 Failure Modes

| Failure | What Happens | Mitigation |
|---|---|---|
| **OAuth token expires** | API calls return 401. `grant.expired` webhook fired. | Auto-refresh via Nylas. If refresh fails, prompt producer to re-authenticate. |
| **Producer's mailbox is full** | Send fails with provider-specific error. | Detect error, alert producer via alternative channel (SMS, in-app notification). Queue email for retry. |
| **Gmail rate limit hit** | 429 error from Gmail via Nylas. | Implement exponential backoff. Spread sends across time. Alert if a single producer is hitting limits. |
| **Nylas outage** | API calls timeout or return 5xx. | Queue emails in our system. Retry with backoff. Fall back to direct Graph/Gmail API if critical. |
| **Producer revokes app access** | `grant.expired` webhook. All API calls fail. | Alert producer in-app. Re-authentication required. |
| **Admin removes consent (Microsoft)** | All grants for that org fail. | Alert agency admin. Re-consent required. |

### 3.8 Competitors Comparison (Features We Need)

| Feature | **Nylas** | **EmailEngine** | **Unipile** | **Direct API (Graph + Gmail)** |
|---|---|---|---|---|
| Send-as with Sent folder | Yes | Yes | Yes | Yes |
| Inbound webhooks | Yes (real-time) | Yes (near-instant) | Yes | Must build (Pub/Sub for Google, subscriptions for Microsoft) |
| Thread tracking | Native API | Via message references | Supported | Native per provider |
| Open/click tracking | Built-in | Not built-in | Limited | Not built-in |
| Scheduled send | Built-in | Not built-in | Unknown | Not built-in (must build) |
| Attachment download | API endpoint | API endpoint | API endpoint | API endpoint per provider |
| Token management | Managed | Self-managed (EmailEngine handles) | Managed | Self-managed |
| Multi-provider (Google + Microsoft) | Single API | Single API | Single API | Two separate integrations |
| Pricing at 100 accounts (annual) | ~$135/month | ~$83/month ($995/year) | ~$550/month | $0 |
| Infrastructure burden | None (managed) | Self-hosted server | None (managed) | None (but more code to maintain) |

---

## 4. Implementation Considerations for Insurance Use Case

### 4.1 Agency Email Onboarding Flow

**Ideal flow (Google Workspace or Microsoft 365)**:
1. Agency admin signs up on our platform.
2. Admin is prompted to "Connect your agency's email."
3. If Microsoft 365: Admin grants org-wide consent in Entra ID. All producers are then pre-approved.
4. If Google Workspace: Admin adds our app to trusted apps. All producers are then pre-approved.
5. Each producer clicks "Connect my inbox" and goes through OAuth (which auto-completes if admin pre-approved).
6. Takes ~1 minute per producer. No DNS changes.

**Fallback flow (non-Google/Microsoft provider)**:
1. Producer enters IMAP/SMTP credentials.
2. Reduced functionality (no native thread tracking, less reliable notifications).
3. Consider recommending these agencies migrate to Google Workspace or Microsoft 365.

**What if the agency uses GoDaddy, Rackspace, or another provider?**
- IMAP/SMTP fallback works but is a degraded experience.
- For V1, we may choose to require Google Workspace or Microsoft 365 as a prerequisite.
- Market data: ~70% of small businesses use either Google Workspace or Microsoft 365. Most insurance agencies will be covered.

### 4.2 Multi-Producer Support

An agency with 5-10 producers needs each inbox connected separately. Each producer goes through OAuth individually (unless admin pre-approved the org).

**Data model**:
```
Agency
  |-- Producer 1 (Nylas Grant ID: abc123)
  |-- Producer 2 (Nylas Grant ID: def456)
  |-- Producer 3 (Nylas Grant ID: ghi789)
```

When a lead comes in assigned to Producer 2, we send the follow-up email using Producer 2's grant. Replies are routed to Producer 2's inbox and our webhook.

**Cost implication**: An agency with 5 producers = 5 connected accounts = ~$23/month on Nylas Core (annual). This cost should be factored into our agency pricing.

### 4.3 Reply Handling (Dual-Read Scenario)

When a customer replies to our automated follow-up:

1. The reply lands in the **producer's inbox** (visible in Gmail/Outlook).
2. Nylas fires a `message.created` webhook to **our backend**.
3. Both the producer and our system now have the reply.

**How to handle**:
- Our system processes the reply (LLM extraction of insurance data fields).
- We do **not** mark the email as read via Nylas. The producer sees it as unread in their inbox and can respond manually if needed.
- If our LLM successfully extracts all requested data, we update the lead record and potentially send a confirmation email (via the producer's inbox) thanking the customer.
- If the reply contains a question or something we can't parse, we flag it for the producer's attention (via in-app notification or a separate system email).

**Key design decision**: Our system is a "silent observer" of the inbox. We read and process replies but don't mark them as read or archive them. The producer's inbox experience is unchanged.

### 4.4 Automation vs Manual Handoff

**Detection rules for "needs human attention"**:

| Signal | Action |
|---|---|
| Reply contains extracted data fields (VIN, DOB, vehicle info) | Auto-process. Update lead record. Send confirmation. |
| Reply contains an attachment (likely dec page photo) | Auto-process attachment via OCR pipeline. If extraction succeeds, update lead. If not, flag for producer. |
| Reply contains a question ("What coverage do I need?", "How much will this cost?") | Flag for producer. Send in-app notification. Do not auto-respond. |
| Reply is unrelated ("Please remove me from your list", "Wrong number") | Flag for producer. If opt-out detected, stop all automated emails for this contact. |
| Reply is ambiguous or low-confidence extraction | Flag for producer with extracted data + confidence scores. Producer reviews and confirms. |
| No reply after full follow-up sequence | Mark lead as "unresponsive" in our system. Notify producer. |

**Implementation**: The LLM parsing service returns a `classification` field alongside extracted data:
```json
{
  "classification": "data_response" | "question" | "opt_out" | "unrelated" | "ambiguous",
  "extracted_fields": { ... },
  "confidence": 0.92,
  "needs_human_review": false
}
```

### 4.5 Thread Management

**Challenge**: If our system sends an automated email and the producer later wants to add to the conversation manually, the thread must stay coherent.

**How it works with Nylas BYOD**:
- Our automated email is sent from the producer's inbox. It gets a `thread_id` and `message_id`.
- If the customer replies, the reply is in the same thread.
- If the producer opens their email client and replies manually, their reply is also in the same thread.
- Our system sees all messages in the thread via the Threads API. We can track the full conversation.

**This is a major advantage over the transactional ESP approach**, where the producer would need to start a new thread because the original email isn't in their Sent folder.

### 4.6 CAN-SPAM Compliance

**Who is the "sender" when sending through the producer's inbox?**

Under CAN-SPAM, the "sender" is the person whose product, service, or website is advertised in the email. In our case, the sender is the insurance agency/producer, not our technology platform.

**Requirements still apply**:
1. **Accurate header information**: The "From" address is the producer's real address. Header info is accurate. No issue.
2. **Non-deceptive subject lines**: Our automated subject lines must accurately describe the email content. "Almost done with your auto quote" is fine.
3. **Identification as an ad** (if applicable): Our emails are transactional (triggered by the customer's quote request), not unsolicited marketing. Transactional emails are largely exempt from CAN-SPAM's advertising requirements.
4. **Physical address**: Include the agency's physical address in the email footer.
5. **Opt-out mechanism**: Must include a way for the customer to opt out of future emails. Even though these are transactional, including an unsubscribe link is best practice.

**Our responsibility**: As the technology provider initiating the sends, we share responsibility. Both we and the agency must ensure compliance. Our terms of service should require agencies to maintain CAN-SPAM compliance.

**Key difference from transactional ESP**: When sending via the producer's inbox, CAN-SPAM compliance is clearer because the email genuinely comes from the producer. There's no ambiguity about who the sender is.

Sources: [CAN-SPAM Compliance Guide](https://cookie-script.com/privacy-laws/can-spam-act), [Email Compliance Guide](https://wpmailsmtp.com/email-compliance-guide-to-can-spam-gdpr-and-more/)

---

## 5. Orchestration Layer

### 5.1 Do We Still Need an Orchestration Platform?

**With BYOD, the answer is: maybe, but differently.**

Traditional orchestration platforms (Customer.io, Knock, Courier) assume they control the sending channel. They integrate with an ESP (Postmark, SendGrid) and send emails through it. They don't natively support "send this email through the user's connected inbox via Nylas."

**What we need from orchestration**:
1. **Timing logic**: Send initial follow-up 1 hour after call. Reminder #1 at 72 hours. Reminder #2 at 5-7 days.
2. **Conditional logic**: If customer opened email but didn't click, send reminder. If customer submitted form, stop sequence. If customer replied, evaluate response.
3. **Channel fallback**: If email follow-up gets no response, fall back to SMS.
4. **State tracking**: Track where each lead is in the follow-up sequence.

**Option A: Use Customer.io / Knock with custom webhook action**

Both Customer.io and Knock support "webhook" actions in their workflows. Instead of sending an email directly, the workflow step fires a webhook to our backend, which then sends the email via Nylas.

```
[Customer.io/Knock Workflow]
  Step 1: Wait 1 hour after "call_completed" event
  Step 2: Fire webhook to our API: POST /send-followup
  Step 3: Wait 72 hours
  Step 4: Check: did customer respond? (via custom event)
  Step 5 (if no response): Fire webhook: POST /send-reminder-1
  ...
```

**Pros**: We get the visual workflow builder, timing engine, and state management. Customer.io/Knock handles the "when" logic; our backend handles the "how" (Nylas).

**Cons**: Adding an orchestration layer on top of Nylas adds another vendor, another integration point, and another potential failure mode. The webhook approach means we lose some native email features (delivery confirmation from the orchestrator's perspective).

**Option B: Build custom orchestration**

Since our sending mechanism is fundamentally different (Nylas, not ESP), we may be better served by a custom state machine:

```
Lead State Machine:
  [call_completed]
    --> wait(1 hour) --> [send_initial_followup via Nylas]
    --> wait(72 hours) --> check_response
      --> if responded: [process_response]
      --> if opened_not_clicked: [send_reminder_1 via Nylas]
      --> if no_open: [send_reminder_1 via Nylas]
    --> wait(5 days) --> check_response
      --> if responded: [process_response]
      --> if no_response: [send_sms_fallback via Twilio]
    --> wait(3 days) --> [mark_unresponsive]
```

**Pros**: Full control. No extra vendor. Tightly integrated with Nylas events (opens, clicks, replies). Simpler architecture.

**Cons**: Building a reliable, scalable workflow engine with delay/scheduling, retry logic, and state persistence is non-trivial. Estimated 2-3 weeks of engineering.

### 5.2 Recommendation

**For V1: Build custom orchestration.** Here's why:

1. Our workflow is relatively simple (3-step email sequence with SMS fallback). It doesn't justify the complexity of integrating an orchestration platform that doesn't natively support our sending mechanism.

2. The core "when to send" logic is a state machine with timed transitions. This is straightforward to build with a job queue (BullMQ, Temporal, or even cron + database).

3. Nylas webhooks give us all the signals we need (opened, clicked, replied, bounced) to drive transitions.

4. We avoid the awkward "orchestration platform calls webhook which calls Nylas" chain.

**For V2/V3**: If our workflows become more complex (A/B testing subject lines, multi-branch conditional logic, dozens of workflow variations), revisit Customer.io or Knock with webhook actions.

### 5.3 SMS Integration Coexistence

Our SMS channel (via Twilio, as planned in the SMS spec) is a separate sending mechanism from email. In a custom orchestration layer, SMS is just another action:

```
if lead_state == "no_email_response_after_reminders":
    send_sms(lead, twilio_client)
```

If we later adopt an orchestration platform, both Nylas (via webhook) and Twilio (via native integration) can coexist. Customer.io and Knock both have native Twilio integrations for SMS.

---

## 6. Recommendations

### 6.1 Primary Approach: BYOD via Nylas (V1) with EmailEngine Migration Path (V2)

**Rationale**:
- The BYOD approach is fundamentally superior for our use case. Emails from the producer's real inbox, with Sent folder visibility and seamless reply handling, create a dramatically better experience for both producers and customers.
- Nylas is the fastest path to production. Unified API, managed token refresh, built-in tracking, and scheduled send. 1-2 weeks to integrate.
- EmailEngine becomes the cost-optimization play once we exceed ~50 connected accounts. Same BYOD benefits, but at a flat $995/year regardless of account count.

### 6.2 Vendor Choices

| Component | V1 Choice | V2 Consideration | Rationale |
|---|---|---|---|
| **Customer-facing email** | Nylas (Core tier) | EmailEngine (self-hosted) | Nylas for speed to market. EmailEngine for cost optimization at scale. |
| **Internal notifications** | Postmark | Keep Postmark | Best deliverability for transactional email. $15-50/month. |
| **SMS** | Twilio | Keep Twilio | Already planned per SMS spec. |
| **Orchestration** | Custom state machine (BullMQ/Temporal) | Customer.io or Knock (if workflows get complex) | Simple workflow doesn't justify orchestration platform overhead. |
| **Email templates** | React Email (open source) | Keep React Email | Maximum flexibility for dynamic, bilingual content. |
| **Reply parsing** | Custom (OpenAI/Claude structured output) | Keep custom | Domain-specific insurance field extraction. Shared with SMS parsing. |
| **Deliverability monitoring** | Nylas tracking + Google Postmaster Tools | Keep | Sufficient for V1. |

### 6.3 Cost Model at Different Scales

#### V1: Nylas

| Scale | Agencies | Connected Accounts | Nylas (Core, annual) | Postmark | Twilio SMS | LLM Parsing | **Total/month** |
|---|---|---|---|---|---|---|---|
| **Launch** | 5 | 10 | ~$14 | $15 | ~$10 | ~$5 | **~$44** |
| **Growth** | 20 | 50 | ~$68 | $30 | ~$40 | ~$20 | **~$158** |
| **Traction** | 50 | 150 | ~$203 | $50 | ~$100 | ~$50 | **~$403** |
| **Scale** | 200 | 600 | ~$810 | $75 | ~$400 | ~$150 | **~$1,435** |

*Nylas annual billing assumed at ~$1.35/CA/month.*

#### V2: EmailEngine (at scale)

| Scale | Agencies | Connected Accounts | EmailEngine | Postmark | Twilio SMS | LLM Parsing | Server Costs | **Total/month** |
|---|---|---|---|---|---|---|---|---|
| **Traction** | 50 | 150 | ~$83 | $50 | ~$100 | ~$50 | ~$50 | **~$333** |
| **Scale** | 200 | 600 | ~$83 | $75 | ~$400 | ~$150 | ~$100 | **~$808** |
| **Large Scale** | 500 | 1,500 | ~$83 | $100 | ~$1,000 | ~$300 | ~$200 | **~$1,683** |

*EmailEngine is $995/year = ~$83/month regardless of account count. Server costs for hosting EmailEngine.*

**The crossover point**: At ~50 connected accounts, EmailEngine becomes cheaper than Nylas. By 200 accounts, the savings are substantial (~$730/month).

### 6.4 Implementation Timeline

| Phase | Scope | Duration | Dependencies |
|---|---|---|---|
| **Phase 1: Nylas Integration** | OAuth flow, Nylas account connection, send email endpoint, webhook receiver for inbound messages | 1.5-2 weeks | Nylas account setup, API keys |
| **Phase 2: Email Templates** | React Email templates for initial follow-up, reminders. Dynamic content from MissingDataProfile. Bilingual support. | 1-2 weeks | Can start in parallel with Phase 1 |
| **Phase 3: Custom Orchestration** | Lead follow-up state machine (BullMQ/Temporal). Timed sends, conditional logic, SMS fallback trigger. | 1.5-2 weeks | Phase 1 complete for Nylas integration |
| **Phase 4: Inbound Processing** | Reply parsing (LLM structured output), attachment routing to OCR pipeline, classification (data/question/opt-out) | 1.5-2 weeks | Phase 1 webhook receiver complete |
| **Phase 5: Postmark for Internal** | Postmark integration for system notifications (new lead, form submitted, token expired) | 3-5 days | Independent of other phases |
| **Phase 6: Producer Onboarding UI** | OAuth consent flow in our app, connected accounts dashboard, re-auth prompts | 1 week | Phase 1 complete |
| **Total V1** | | **6-9 weeks** | |

### 6.5 Key Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Nylas outage disrupts sending** | Low-Medium | High | Queue emails locally. Retry with backoff. Build circuit breaker. Consider direct Graph/Gmail API as emergency fallback. |
| **OAuth token expires, producer doesn't re-auth** | Medium | Medium | `grant.expired` webhook triggers in-app notification + SMS alert to producer. Grace period queues emails. |
| **Agency uses non-Google/Microsoft email** | Medium | Low | IMAP/SMTP fallback. For V1, may require Google Workspace or Microsoft 365 as a prerequisite. |
| **Gmail rate limit hit** | Low | Low | At 20-50 emails/day per producer, well below 2,000/day limit. Monitor and alert if approaching. |
| **Nylas pricing increases** | Medium | Medium | EmailEngine migration path is our hedge. Direct API integration is the ultimate fallback. |
| **Nylas stores PII (compliance concern)** | Low | Medium | Use Nylas US data residency. Review DPA. Consider EmailEngine (self-hosted) for data-sensitive agencies. |
| **Producer's domain has poor reputation** | Low | Medium | Check domain reputation during onboarding (MxToolbox, Google Postmaster). Warn producer if issues found. |
| **Customer confused by automated email from producer** | Low | Low | Use clear, non-deceptive subject lines. Natural email tone. Producer's real signature. If customer asks "Did you send this?", the producer can see it in their Sent folder and say "Yes." |

### 6.6 Decision Summary

**We recommend BYOD via Nylas for V1.** The benefits of sending from the producer's actual inbox -- Sent folder visibility, established domain reputation, seamless reply handling, personal feel -- are overwhelming for our insurance use case. The per-account cost is manageable at launch and can be optimized with EmailEngine at scale.

The transactional ESP approach (Postmark/SendGrid) remains valuable for internal system notifications but is **not recommended** for customer-facing follow-up emails due to the lack of producer visibility and the awkward reply-handling dynamic.

**The hybrid architecture** (Nylas for customer emails, Postmark for system notifications) gives us the best of both worlds and is the recommended path forward.

---

## Sources

### Nylas
- [Nylas Pricing](https://www.nylas.com/pricing/)
- [Nylas Pricing Guide (Zeeg)](https://zeeg.me/en/blog/post/nylas-api-pricing)
- [Nylas Email API](https://www.nylas.com/products/email-api/)
- [Nylas v3 API Guide (Zeeg)](https://zeeg.me/en/blog/post/nylas-api)
- [Nylas Messages API Docs](https://developer.nylas.com/docs/v3/email/)
- [Nylas Send Email Docs](https://developer.nylas.com/docs/v3/email/send-email/)
- [Nylas Authentication Docs](https://developer.nylas.com/docs/v3/auth/)
- [Nylas Google Provider Guide](https://developer.nylas.com/docs/dev-guide/provider-guides/google/)
- [Nylas Webhooks Docs](https://developer.nylas.com/docs/v3/notifications/webhooks/)
- [Nylas Notification Schemas](https://developer.nylas.com/docs/v3/notifications/notification-schemas/)
- [Nylas Message Tracking](https://developer.nylas.com/docs/v3/email/message-tracking/)
- [Nylas Security](https://www.nylas.com/security/)
- [Nylas Data Residency](https://developer.nylas.com/docs/dev-guide/platform/data-residency/)
- [Nylas Token Lifetimes](https://support.nylas.com/hc/en-us/articles/16115127208221)
- [Nylas v3 Status](https://status-v3.nylas.com/)
- [Nylas Insurance Solutions Blog](https://www.nylas.com/blog/fintech-insurance-digital-innovation/)
- [Nylas Case Studies](https://www.nylas.com/case-studies/)

### Microsoft Graph API
- [Graph Mail API Overview](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [Graph Send Mail on Behalf](https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user)
- [Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Graph Admin Consent](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-admin-consent)

### Gmail API
- [Gmail API Usage Limits](https://developers.google.com/workspace/gmail/api/reference/quota)
- [Gmail Sending Limits (Google Workspace)](https://support.google.com/a/answer/166852)
- [Gmail Sending Limits Guide (Smartlead)](https://www.smartlead.ai/blog/gmail-sending-limits)

### EmailEngine
- [EmailEngine vs Nylas](https://learn.emailengine.app/docs/comparison/emailengine-vs-nylas)
- [EmailEngine Docs](https://learn.emailengine.app/docs)

### Unipile
- [Unipile Pricing](https://www.unipile.com/pricing-api/)
- [Unipile Email API](https://www.unipile.com/communication-api/email-api/)

### Mailgun
- [Mailgun Pricing](https://www.mailgun.com/pricing/)
- [Mailgun Inbound Routing](https://www.mailgun.com/features/inbound-email-routing/)

### Nylas Alternatives
- [Best Nylas Alternatives 2026 (OneCal)](https://www.onecal.io/blog/the-best-nylas-alternatives)
- [Best Nylas Alternatives (Zeeg)](https://zeeg.me/en/blog/post/nylas-alternatives)

### Compliance
- [CAN-SPAM Compliance Guide](https://cookie-script.com/privacy-laws/can-spam-act)
- [Email Compliance Guide (WPMailSMTP)](https://wpmailsmtp.com/email-compliance-guide-to-can-spam-gdpr-and-more/)

### Orchestration
- [Knock](https://knock.app/)
- [Customer.io](https://customer.io/)
- [Knock vs Marketing Automation Comparison](https://knock.app/blog/marketing-automation-notification-infra-comparison)
