# Agency Profile

**Agency Name:** JAMCO Home & Auto Insurance
**Key Contacts:**
- **Jose Medrano** -- Owner/Principal. Decision-maker. Not always at his computer day-to-day but stays engaged on strategy and tool evaluation. Currently manages the master PolicyLift account (jamco@jamcoinsurance.com) and has a personal login (josemedrano.com domain). [@27:48]
- **Romeo Ocampo** -- Producer / CSR. Hands-on daily quoting workflow. The person who physically enters data into Hawksoft and TurboRater. Walked through the live screen share of Hawksoft during the call. Needs his own PolicyLift login and notification access. [@6:00, @12:24]
- **Lance** -- Additional team member present on the call but experienced persistent audio/connectivity issues and did not contribute substantively. [@6:00, @6:11]

**Location / States Served:** California (primary, inferred from PolicyLift's CA-focused target market and JAMCO's operational context)
**Lines of Business:** Personal Auto, Home (both confirmed). Auto is the dominant line for quoting volume.

---

# Technology Stack

**AMS:** Hawksoft
- Primary system of record. Romeo enters client information directly into Hawksoft during the initial phone call. [@7:53]
- Hawksoft performs VIN lookups (NHTSA-style) when a VIN is entered, providing supplemental vehicle data. [@7:56, @15:59]
- Hawksoft has a **bridge** to TurboRater -- data entered in Hawksoft transfers directly to TurboRater and vice versa, eliminating double-entry. Jose explicitly called this out: *"We can bridge it to Turbo Raider and vice versa. So it just transfers it there. We don't have to re-enter it twice."* [@11:39]

**Rater:** TurboRater
- ~95% of **auto** quotes go through TurboRater. [@1:00]
- ~50% of **home** quotes go through TurboRater; the other 50% go directly to carrier portals due to carrier integration limitations. [@1:00, @1:30]
- Romeo described the home limitation: *"There are some carriers that are not kind of automating any data being entered to Turbo Raider, so we manually input it to carrier."* [@1:30]
- After data entry, they **bridge from TurboRater to each carrier** they have appointments with to get comparative rates. [@9:03]

**Other Tools:**
- Email (for quote presentation and follow-up)
- PolicyLift voice agent and chat agent (currently deployed; Jose receives email notifications of new leads)

**Integration Flow:**
Phone call --> Hawksoft (data entry + VIN lookup) --> Bridge to TurboRater --> Bridge to individual carrier portals --> Email quotes to customer

---

# Today
*What are the Top-of-Funnel interaction patterns present for the agency today?*

## How Leads Come In
- **Phone calls** are the primary top-of-funnel channel. The first interaction is almost always a phone conversation where the customer verbally provides their information. [@7:47, @8:24]
- **PolicyLift voice agent** handles after-hours and overflow calls, capturing intent and basic information (phone number, driver name, DOB), then sending email notifications to Jose/JAMCO. [@27:03]
- **PolicyLift chat agent** also generates leads with email notifications. [@27:03]
- Jose expressed interest in a **website quick-quote link** as a future lead source: *"If you can provide something where they can, we can email or, you know, they can click on our website for a quick quote, basically, and have it all imported, that would work out really well."* [@26:15]

## Step-by-Step Current Workflow (Auto)

1. **Initial phone call** -- Customer calls in (or is connected via PolicyLift voice agent). A producer (Romeo) picks up the call.
2. **Verbal data collection (~5-7 minutes)** -- Romeo asks for the following information directly over the phone [@6:34, @8:24]:
   - Names of all drivers
   - Dates of birth
   - Driver's license numbers
   - Current carrier and coverage details
   - Current premium
   - Vehicles (each car)
   - Coverages per vehicle (bodily injury limits, deductibles, roadside assistance, towing) [@10:36]
   - Tickets or accidents
   - Monthly payment amount / EFT / payment financing method
   - Expiration or renewal date
3. **Simultaneous Hawksoft entry** -- While on the phone, Romeo enters data directly into Hawksoft. Hawksoft performs a VIN lookup to supplement vehicle information. [@7:53, @15:59]
4. **Bridge to TurboRater** -- Once initial data is captured, the Hawksoft-to-TurboRater bridge transfers the data. No re-entry needed. [@11:39]
5. **Bridge to carriers** -- From TurboRater, they bridge to each appointed carrier to generate comparative rates. [@9:03]
6. **Quote presentation via email** -- Quotes are presented to the customer in email form. They do NOT present quotes live on the first phone call. [@9:03]
7. **Second touch / Follow-up** -- When the customer responds (calls back or replies), the producer goes over the quote details with them. This is when they request the **declarations page** to do an apples-to-apples comparison. [@10:36]
8. **Finalization** -- If the customer is interested, they run MVR and other reports, finalize coverages, and bind the policy with a personal consultative touch. [@16:46]

## Time to Initial Data Collection
Romeo estimated the initial phone call data collection takes **"at least five to seven minutes"** and that is sufficient to rate through TurboRater. [@8:24]

## Quote Presentation
Quotes are **not** presented on the initial call. They are emailed after the call, and the customer is followed up with for a second conversation. [@9:03]: *"We normally just present it in a form of email. And then from there, if we get a phone call from them, or if we follow up, that's the time we kind of like go over with a quote that they're interested in."*

---

# Core Data Collection Requirements
*What exactly did the partner request be collected for a customer?*

## Auto -- Fields Mentioned (from Romeo's explicit list at [@6:34] and [@10:36])

| Field | Required / Optional | Notes |
|-------|---------------------|-------|
| Driver name(s) -- all drivers in household | Required | First thing asked |
| Date of birth (each driver) | Required | |
| Driver's license number (each driver) | Required | |
| Current carrier | Required | Used for apples-to-apples comparison |
| Current coverage limits (BI, etc.) | Required | Without this, they quote at minimums and "lose the deal" (Raghav framing at [@2:07]) |
| Current premium | Required | Customers are price-sensitive |
| Vehicles -- year, make, model for each | Required | |
| VIN | Important | Hawksoft does a VIN lookup to supplement; enrichment opportunity |
| Coverages per vehicle (deductibles, roadside, towing) | Required | Asked on initial call [@10:36] |
| Tickets / accidents / claims history | Required | Screening criterion |
| Monthly payment amount | Required | |
| Payment method (EFT / financing) | Required | |
| Policy expiration / renewal date | Required | |
| Garaging address | Required | Inferred from Hawksoft screen walkthrough [@16:03] |
| Household members / additional insureds | Required | Discussed during screen share [@16:03] |
| Vehicle usage | Required | Romeo confirmed: *"We have the... of course like the usage"* [@16:46] |

**Fields where enrichment would help most:** VIN lookup (already partially handled by Hawksoft), vehicle details (make/model/year from VIN), household members, garaging address. Alex noted these are areas where the voice agent collects an incomplete picture. [@18:26]

**Dealbreaker if missing:** Current coverage limits -- without them, the agency quotes at minimums and the quote is not competitive, leading to lost deals. Claims/incident history is also critical for risk screening.

## Home
- Not discussed in field-level detail on this call.
- Key constraint: ~50% of home carriers cannot be rated through TurboRater, requiring direct carrier portal entry. [@1:00, @1:30]
- An action item was created to share the list of TurboRater-excluded home carriers. [@1:00 action item]

---

# Pain Points & Friction

1. **Manual verbal data collection is the bottleneck.** The 5-7 minute phone call to collect all auto fields is the core time sink. Every lead requires this same manual process. [@8:24]

2. **Customers withhold information on first contact.** Romeo noted that customers often do not provide their declarations page upfront: *"Normally they just wanted to provide the information. Without a declarations page, sort of like figuring out how much a rate is without even letting us know how much their rate is."* [@9:56] -- Customers are price-cautious and do not want to reveal what they currently pay.

3. **Two-touch minimum to close.** Because customers withhold dec pages and full coverage details on the first call, the agency must always do a second follow-up to get the dec page and do an apples-to-apples match. This extends the cycle time. [@10:36]

4. **AI voice agent fatigue.** Romeo acknowledged that customers do not want to spend 10-20 minutes on the phone with an AI agent: *"If PolicyLift AI would just ask all those pertinent information, they're going to feel like, you know, this is a pain in the [butt] to just talk to someone with... AI."* [@20:58] -- This limits how much data the voice agent can realistically collect in a single call.

5. **Old-school customer segment.** A meaningful portion of clients are uncomfortable providing personal information to AI or through digital channels: *"Some clients are sort of old school and they are afraid of kind of providing those information, especially to an AI."* [@20:58]

6. **Home quoting is fragmented.** 50% of home quotes must go directly to carrier portals because those carriers are not integrated with TurboRater, creating a split workflow. [@1:30]

7. **Notification routing.** Jose cannot easily route PolicyLift lead notifications to other team members (e.g., Romeo). He currently has to manually forward emails. [@27:03]: *"Whenever we get the... chat or somebody on AI and it sends us the email, you know, with the notification, I need to forward that to somebody else so that they can open it up."*

---

# Dec Page & Prior Policy Workflow

- **Dec pages are NOT collected on the first call.** Customers typically do not offer their declarations page initially. They prefer to give verbal information and see what rate they can get first. [@9:56]
- **Dec pages are requested on the second touch.** Once the initial quote is presented via email and the customer expresses interest, the agency asks for the declarations page to perform an apples-to-apples comparison. [@10:36]: *"Once they kind of like, hey, this is something that we are interested in, we normally right at the bat, ask for their declarations page just to make sure we... do apples to apples."*
- **Dec pages serve a verification function.** They are used to verify and adjust the initial quote -- matching coverages to what the customer actually has vs. what they verbally reported. [@10:36]: *"This can still change if you think you have a different coverages that you currently have. And so we will match it."*
- **Jose was excited about dec page parsing.** One of his two unprompted questions was whether PolicyLift could parse uploaded dec pages: *"If they were to provide the deck page, would we be able to upload it and then you guys would parse it and take all the data out?"* [@24:33]. He also noted: *"The deck page, uploading it and parsing it, I don't think that anyone does that yet... So that would be unique for you."* [@26:51]

---

# Risk Screening & Qualification

- **Claims history / incidents** are collected on the first call as a screening mechanism. [@6:34]
- **MVR (Motor Vehicle Report)** is run at finalization, not during initial quoting. Romeo described this as part of the binding step: *"We go directly to the carrier, kind of, hey, this is like the rate. If we finalize this, including MVR and all that reports, this is how your rate is going to be."* [@16:46]
- No explicit disqualification criteria were discussed (e.g., DUI thresholds, claims count cutoffs). However, Raghav framed the general principle that without incident information, agencies "don't even want to try" rating because results will be wrong. [@2:07]
- The personal/consultative touch at finalization serves as a final risk screen: Romeo wants to maintain human judgment in the binding decision. [@16:46]

---

# Customer Communication Preferences

## Follow-Up Channels
- **Email** is the primary channel for presenting quotes after the initial call. [@9:03]
- **Phone** is used for follow-up conversations when the customer calls back or the agency reaches out. [@9:03]
- **Text/SMS** -- Romeo expressed interest in using follow-up as a way to text or email customers: *"I think it's going to be helpful if we use the follow-up as a way of calling them or texting them or emailing them."* [@20:58]
- **Portal link** -- Jose specifically asked about providing a link customers could use to self-serve: *"Will you be able to provide basically like a link that we could email or text to them so that they can actually input all their data?"* [@24:33]

## Two Buckets of Customers
Romeo and the team validated the existence of two distinct customer segments:

1. **Old-school / cautious customers:** Do not want to interact with AI. Reluctant to share personal information digitally. Need the personal human touch. *"Some clients are sort of old school and they are afraid of kind of providing those information, especially to an AI."* [@20:58]. For these customers, nothing replaces a phone conversation with a real person.

2. **Tech-forward / fast-movers:** Want to get a quote as quickly as possible. Open to self-service portals, uploading documents, and providing data digitally. *"I don't want to tell you 40 fields of information over the phone. I would like to just type it out because I'm a fast typer, or I would like to upload a deck page and you take care of it."* (Alex framing, validated by Jose at [@26:15])

## Tone & Messaging
- The agency places high value on **personal touch** and **consultative feel**. Romeo was explicit that they want automation for data intake but human interaction for closing and binding: *"It's something that we don't want to kind of add to automation just so at least we have that personal touch in order for them to feel like, hey, we're running an actual finalization of your policy."* [@16:46]
- Follow-up communications should make the customer feel they are working with a real person, not an automated system. [@20:58]: *"That way, they know that... after that initial call, they're talking to a person that's going to assist them with the quotes."*

---

# Solution Potential
*How exactly will we implement Quote Packets to meet the customer where they are and reduce cycle time?*

## Mapping Quote Packets Solutions to JAMCO's Workflow

### 1. Voice Agent (Already Deployed)
- **Current state:** PolicyLift voice agent handles after-hours calls, captures basic intent and minimal data (name, DOB, phone number). Sends email notification to Jose.
- **Gap:** Cannot collect the full field set Romeo listed without fatiguing the caller. Romeo confirmed: collecting all fields via AI voice would be "a pain." [@20:58]
- **Recommendation:** Keep voice agent collection focused on high-value, easy-to-provide fields: name, DOB, phone, email, number of vehicles, current carrier name. Do NOT attempt to collect VINs, DL numbers, or detailed coverage info via voice. Hand off to follow-up channels.

### 2. Data Enrichment
- **Opportunity:** Once the voice agent captures a name + DOB + address (or even just name + phone), run enrichment passes to pre-fill:
  - VIN / vehicle details via NHTSA decoder (supplement or replace Hawksoft's VIN lookup)
  - Household members via Fenris prefill
  - Current carrier via Canopy Connect or Fenris
  - Address validation and garaging info
- **JAMCO-specific note:** Hawksoft already does VIN lookups [@7:56], so enrichment adds the most value for fields Hawksoft does NOT supplement: household composition, current carrier/coverage, prior policy details.

### 3. Dec Page Uploader + OCR Parsing
- **This is JAMCO's highest-excitement feature.** Jose asked about it unprompted and called it unique in the market. [@24:33, @26:51]
- **Current pain:** Dec pages are only requested on the second touch, slowing the cycle. Customers are reluctant to share on the first call.
- **Implementation:** Include a dec page upload CTA in the portal link and in follow-up SMS/email. Parse with LLM Vision to extract carrier, policy number, VINs, coverage limits, premium, drivers -- all fields Romeo listed as required.
- **Impact:** Could collapse the two-touch process into a single touch if customers upload their dec page through the portal before the second call.

### 4. Smart Form / Portal
- **Jose explicitly requested this.** *"Will you be able to provide basically like a link that we could email or text to them so that they can actually input all their data and then it goes into Turbo Raider?"* [@24:33]
- **Implementation:** A branded, mobile-first portal link unique to each lead. Pre-filled with whatever the voice agent and enrichment already captured. Shows only missing fields. Includes dec page upload. Can be embedded on JAMCO's website as a "quick quote" widget per Jose's request. [@26:15]
- **For tech-forward customers:** This is the primary data collection channel. They self-serve, fill in the missing fields, upload their dec page, and the quote packet reaches 100% completion without a human phone call.

### 5. Email Follow-up (BYOD)
- **Maps directly to JAMCO's existing workflow.** They already present quotes via email. [@9:03]
- **Implementation:** Send follow-up from Romeo's or Jose's email inbox via Nylas. Include: summary of what was collected, specific missing fields, portal link, and dec page upload CTA.
- **Key requirement:** Must feel personal, not automated. Romeo was emphatic that the customer should feel they are talking to a real person. [@20:58, @16:46]

### 6. SMS Follow-up
- **Romeo expressed interest.** *"I think it's going to be helpful if we use the follow-up as a way of calling them or texting them or emailing them."* [@20:58]
- **Implementation:** Send branded SMS with portal link and/or 1-2 targeted questions for missing fields. Support inbound MMS for dec page photos.
- **Especially valuable for:** Younger/tech-forward customers who may prefer texting over email.

## What Excited Them Most
1. **Dec page upload + parsing** -- Jose's #1 unprompted question. Called it unique. [@24:33, @26:51]
2. **Portal link / smart form** -- Jose's #2 unprompted question. Wants it embeddable on the website. [@24:33, @26:15]
3. **Automated data collection reducing phone time** -- Both Jose and Romeo validated this as a problem worth solving. Jose: *"If you collect all the data, make life easier, and just to populate everything, that would make life a lot easier."* [@6:26]. Romeo: *"I think a hundred percent, this is going to help us for real."* [@16:46]

## Integration Points

### Hawksoft
- **Current:** Data enters Hawksoft first, bridges to TurboRater. Hawksoft does VIN lookups.
- **Future API (later this year):** Hawksoft has indicated to PolicyLift that APIs for creating contacts and accounts will be available later in 2026. [@25:22] This would allow Quote Packets to push completed data directly into Hawksoft, eliminating manual entry entirely.
- **Current workaround:** Until the API is available, Romeo will need to manually transfer data from the PolicyLift quote packet into Hawksoft. The quote packet should be structured to match Hawksoft's data entry flow to minimize friction.

### TurboRater
- **95% of auto flows through TurboRater.** The Hawksoft bridge means that getting data into Hawksoft effectively gets it into TurboRater as well.
- **Direct TurboRater integration** is also possible via [[cycle_spec]] but the Hawksoft bridge makes this lower priority for JAMCO.

### Hawksoft API Timeline & Implications
Alex stated: *"We are working with Hawksoft on this. They've let us know that they're going to help us get access to APIs later this year that will allow us to create contacts and accounts."* [@25:22] He qualified: *"No promises. Obviously, it's dependent on Hawksoft and their willingness to get us those APIs as fast as possible, but they've let us know that they want to do that this year."*

**Implications:**
- **Phase 1 (now):** Quote Packets outputs a structured data set. JAMCO manually enters into Hawksoft. Portal link + dec page parsing reduces the data Romeo has to collect by phone.
- **Phase 2 (post-Hawksoft API):** Quote Packets auto-creates contacts and accounts in Hawksoft. Romeo opens Hawksoft and the lead is already there, ready to bridge to TurboRater. This eliminates the manual entry step entirely and compresses cycle time dramatically.

## Implementation Priority Recommendations
1. **Portal link + smart form** -- Immediately actionable. Jose asked for it by name. Embed on JAMCO website.
2. **Dec page upload + LLM parsing** -- Highest differentiation and excitement. Include as a first-class feature in the portal.
3. **SMS/Email follow-up with portal link** -- Automate the second-touch dec page request. Use BYOD email to maintain personal feel.
4. **Data enrichment** -- Run enrichment after voice agent call to pre-fill portal. Focus on fields Hawksoft does not already supplement (household, current carrier, coverage limits).
5. **Hawksoft API integration** -- Dependent on Hawksoft timeline; build the data model now so integration is turnkey when APIs become available.

---

# Key Quotes

1. **Romeo Ocampo [@6:34]** -- On the auto data collection checklist:
   > "We ask for all the name of the drivers. It's first thing. We ask for the date of births and driver's license number, their current coverage and carrier and premium, then the vehicles, each cars and coverages that entails to each car, deductibles, any tickets or accidents, how much is their monthly payment amount or any automatic EFD, or are they using any kind of payment financing, and then the expiration date or renewal date."

2. **Romeo Ocampo [@8:24]** -- On how long initial data collection takes:
   > "It should probably take like five, at least to seven minutes. And then from there, once we have that initial information, that should be sufficient in order for us to rate it directly to the carriers or, you know, using Turbo Raider."

3. **Romeo Ocampo [@9:03]** -- On quote presentation workflow:
   > "Once we have the information and then we enter it to TurboRater, we bridge over to each carrier that we have a rate with. We normally just present it in a form of email."

4. **Romeo Ocampo [@20:58]** -- On AI agent limitations and old-school customers:
   > "If PolicyLift AI would just ask all those pertinent information, they're going to feel like, you know, this is a pain in the [butt] to just talk to someone with... AI. I think they would pretty much be comfortable speaking to someone that really is a person... Some clients are sort of old school and they are afraid of kind of providing those information, especially to an AI."

5. **Romeo Ocampo [@16:46]** -- On maintaining human touch at finalization:
   > "It's something that we don't want to kind of add to automation just so at least we have that personal touch in order for them to feel like, hey, we're running an actual finalization of your policy."

6. **Jose Medrano [@6:26]** -- On the value proposition:
   > "I can see if you collect all the data, make life easier, and just to populate everything, that would make life a lot easier."

7. **Jose Medrano [@24:33]** -- On dec page parsing and portal link (his two unprompted questions):
   > "Will you be able to, if they were to provide the deck page, would we be able to upload it and then you guys would parse it and take all the data out? ... The other thing is, will you be able to provide basically like a link that we could email or text to them so that they can actually input all their data and then it goes into Turbo Raider?"

8. **Jose Medrano [@26:15]** -- On what would make the biggest impact:
   > "If you can provide something where they can, we can email or, you know, they can click on our website for a quick quote, basically, and have it all imported, that would work out really well."

---

# Action Items

## Explicit (from transcript ACTION ITEM markers)

1. **Share TurboRater-excluded home carriers list** -- JAMCO to share with Raghav & Alex which home carriers cannot be rated through TurboRater and must go direct to carrier portal. [@1:00 action item]

2. **Add Romeo to PolicyLift platform** -- Create a separate login for Romeo Ocampo so he does not depend on Jose forwarding email notifications. Set up notification recipients to include Romeo. [@26:51 action item, @27:03]

## Implicit (derived from call discussion)

3. **Configure notification routing** -- Jose needs the ability to add notification recipients from within his PolicyLift account. He reported that his personal login (josemedrano.com) does not show the option, while the master JAMCO account may. Troubleshoot and resolve. [@27:48]

4. **Map Hawksoft field layout to Quote Packet data model** -- Romeo walked through the Hawksoft screen. The Quote Packet output should mirror Hawksoft's data entry flow (client info --> general info --> vehicles --> drivers --> coverages) to minimize cognitive load during manual transfer. [@12:48 screen share discussion]

5. **Build portal link / smart form for JAMCO** -- Jose explicitly requested a link to email/text to customers and potentially embed on their website. This should be a priority deliverable. [@24:33, @26:15]

6. **Implement dec page upload with LLM parsing** -- Jose identified this as the most unique and exciting feature. Include in portal. [@24:33, @26:51]

7. **Design SMS follow-up flow** -- Romeo expressed interest in texting as a follow-up channel. Build SMS flow that includes portal link and supports inbound MMS for dec page photos. [@20:58]

8. **Track Hawksoft API availability** -- PolicyLift is working with Hawksoft on API access for creating contacts/accounts. Monitor timeline and prepare integration architecture. Target: later 2026. [@25:22]

9. **Schedule follow-up call** -- Discuss home quoting workflow in detail (was not covered at field level in this call), review the TurboRater-excluded carriers list, and demo the portal/dec page features once available.
