# Customer Success Report

**Customer:** [Customer Name]
**Report Period:** [Date Range]
**Prepared By:** [Team Member]

---

## 1. Voice, Chat, Forms

### 1.1 Voice

1.1.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 1.1.1.a **SQL Query Prompt:**
    1. Retrieve total number of calls for this customer within the report period.
    2. Sum the duration of all calls within the report period (for cumulative time saved calculation).
    3. Count calls that meet ANY of the following success criteria:
       - call_reason IS NOT NULL AND call_reason != 'unknown'
       - callback_requested = true
       - transfer_performed = true
       - appointment_booked = true
    4. Calculate whether calls meeting at least one success criterion represent ≥66% of total calls.
    5. If ≥66% threshold met: break out call counts by subcategory where call_reason = 'service' and call_reason = 'claim'.

    Return: total_calls, cumulative_call_duration, successful_calls_count, successful_calls_percentage, service_calls (if threshold met), claim_calls (if threshold met).

  - 1.1.1.b **Report Setup Prompt:** Generate a success narrative for voice calls highlighting:
    - Total calls handled in the period
    - Number of calls with a successful outcome (identified reason, callback requested, transfer performed, or appointment booked) — emphasize these were serviced without human intervention
    - If subcategory breakdown available: show service vs. claim distribution
    - Cumulative time saved (sum of all call durations) — frame as time the agency didn't need staff on phones
    - Value propositions to emphasize:
      - Calls handled autonomously without human agents
      - Elimination of context-switching for staff
      - 24/7 availability without physical presence or staffing
      - Time freed up for higher-value work

    Format as bullet points with specific numbers. Use cumulative_call_duration to calculate hours/minutes saved.

1.1.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 1.1.2.a **SQL Query Prompt:**
    1. Check if voice calling feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. Since call volume is unavailable for non-activated customers, use website traffic as proxy:
       - Retrieve daily website traffic for the report period.
       - Calculate average daily website visitors.
       - Apply proxy formula: (average_daily_visitors / 15) = estimated off-hours calls per day that could be handled by AI voice.
       - Multiply by number of days in period for total estimated opportunity.

    Return: voice_activated (boolean), average_daily_traffic, estimated_daily_offhours_calls, estimated_total_offhours_calls_in_period.

  - 1.1.2.b **Report Setup Prompt:** Generate an opportunity assessment for voice activation. If not activated:
    - Present the proxy-based estimate of off-hours calls they could be handling
    - Value propositions to emphasize:
      - Serve customers when the agency is closed (evenings, weekends, holidays)
      - Time saved by not manually answering phones during off-hours
      - No context switching—staff aren't interrupted during personal time
      - Prioritized dashboard provides clear visibility into call outcomes and follow-ups needed
      - Highlight missed business: potential customers calling after-hours who currently get no response
    - Frame as revenue/leads potentially lost without 24/7 availability

    Format as an opportunity with specific projected numbers based on their traffic.

1.1.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 1.1.3.a **SQL Query Prompt:**
    1. Check if voice feature is activated for this customer.
    2. If activated, retrieve:
       - Total calls in the report period
       - Count of calls that were NOT filtered
    3. Minimum criteria to be considered adequately activated (NOT in this category):
       - At least 7 total calls, OR
       - At least 3 non-filtered calls
    4. If customer does NOT meet either threshold, they fall into Low Activation.
    5. Also retrieve average daily website traffic for the report period (for comparison).

    Return: voice_activated, total_calls, non_filtered_calls, meets_activation_threshold (boolean), average_daily_traffic.

  - 1.1.3.b **Report Setup Prompt:** Generate a low activation analysis for voice. If customer falls into this category:
    - Compare actual call volume to expected volume based on website traffic proxy (1 off-hours call per 15 daily visitors)
    - Identify the gap: are they getting fewer calls than traffic would suggest?
    - Present common reasons for low activation:
      1. **Customer adoption gap:** The agency's customer base hasn't yet adopted calling the AI voice agent
      2. **Communication gap:** The agency hasn't communicated to customers that the voice agent is live and available
      3. **Configuration issue:** Technical setup problem preventing calls from routing correctly
    - Recommend investigation steps based on the likely root cause
    - Frame as untapped potential given their traffic levels

    Format with specific numbers comparing actual calls to expected calls based on traffic.

### 1.2 Chat

1.2.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 1.2.1.a **SQL Query Prompt:**
    1. Retrieve total number of chats for this customer within the report period.
    2. Retrieve total messages across all chat conversations in the report period.
    3. Count chats where chat_reason IS NOT NULL AND chat_reason != 'unknown'.
    4. Calculate whether chats with valid chat_reason (not null, not 'unknown') represent ≥66% of total chats.
    5. If ≥66% threshold met: break out chat counts by subcategory where chat_reason = 'service' and chat_reason = 'claim'.
    6. Count new quote requests initiated via chat (if trackable).

    Return: total_chats, total_messages, valid_reason_count, valid_reason_percentage, service_chats (if threshold met), claim_chats (if threshold met), quote_requests.

  - 1.2.1.b **Report Setup Prompt:** Generate a success narrative for chat highlighting:
    - Total chats handled in the period
    - Total messages exchanged across all conversations
    - If subcategory breakdown available: show service vs. claim distribution
    - Time saved calculation using message proxy:
      - Assume average message = 20 words
      - Typing speed = 50 words per minute
      - Formula: (total_messages × 20) / 50 = minutes saved
      - Example: 50 messages × 20 words = 1,000 words ÷ 50 wpm = 20 minutes saved
    - Value propositions to emphasize:
      - Customers serviced via chat without human intervention
      - Questions answered autonomously
      - New quote requests captured (potential revenue)
      - 24/7 availability for chat inquiries

    Format as bullet points with specific numbers. Convert time saved to hours if substantial.

1.2.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 1.2.2.a **SQL Query Prompt:**
    1. Check if chat feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. Since chat data is unavailable for non-activated customers, use website traffic as proxy:
       - Retrieve daily website traffic for the report period.
       - Calculate average daily website visitors.
       - Apply proxy formula: (average_daily_visitors / 15) = estimated chat users per day.
       - Multiply by number of days in period for total estimated chat opportunity.

    Return: chat_activated (boolean), average_daily_traffic, estimated_daily_chat_users, estimated_total_chat_users_in_period.

  - 1.2.2.b **Report Setup Prompt:** Generate an opportunity assessment for chat activation. If not activated:
    - Present the proxy-based estimate of chat users they could be engaging
    - Project potential value:
      - Estimated time saved (using message proxy: assume avg 10 messages per chat × 20 words ÷ 50 wpm per chat session)
      - Potential quote requests that could be captured
      - New business opportunities from chat-initiated inquiries
    - Value propositions to emphasize:
      - 24/7 availability for customer questions
      - Capture leads and quote requests outside business hours
      - Reduce phone call volume by offering chat alternative
      - Instant responses improve customer experience
    - Frame as missed engagement and potential revenue

    Format as an opportunity with specific projected numbers based on their traffic.

1.2.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 1.2.3.a **SQL Query Prompt:**
    1. Check if chat feature is activated for this customer.
    2. If activated, retrieve total number of chats in the report period.
    3. Low Activation threshold: 3 or fewer chats in the period.
    4. If customer has ≤3 chats, they fall into Low Activation.
    5. Also retrieve average daily website traffic for the report period (for comparison).

    Return: chat_activated, total_chats, meets_activation_threshold (boolean, true if >3 chats), average_daily_traffic.

  - 1.2.3.b **Report Setup Prompt:** Generate a low activation analysis for chat. If customer falls into this category:
    - Compare actual chat volume to expected volume based on website traffic proxy (1 chat user per 15 daily visitors)
    - Identify the gap: are they getting fewer chats than traffic would suggest?
    - Present common reasons for low activation:
      1. **Awareness gap:** Users don't know they can chat with the website
      2. **Communication gap:** The agency hasn't educated customers that they are now available 24/7 via chat
      3. **Experience issues:** Users may be having trouble or experiencing negative interactions with the chat
      4. **Negative feedback:** Users may have had poor experiences and stopped using chat
    - Recommend the agency raise any experience or feedback issues with the PolicyWeb team for investigation
    - Suggest promotional strategies to increase chat visibility and adoption

    Format with specific numbers comparing actual chats to expected based on traffic.

### 1.3 Forms

1.3.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 1.3.1.a **SQL Query Prompt:**
    1. Retrieve total number of form submissions for this customer within the report period.
    2. Assume most forms are quote requests (no service/claim breakdown needed).
    3. Break down form submissions by quote type:
       - Count of personal quote submissions
       - Count of commercial quote submissions

    Return: total_form_submissions, personal_quote_submissions, commercial_quote_submissions.

  - 1.3.1.b **Report Setup Prompt:** Generate a success narrative for forms highlighting:
    - Total form submissions in the period
    - Breakdown of personal vs. commercial quote requests
    - Value propositions to emphasize:
      - Each submission represents potential new business generated with zero effort from the agency
      - These are hot leads ready to contact immediately
      - Forms provide customers a convenient way to request quotes on their own terms and timeline
      - People who submit forms expect a callback as soon as possible—high intent leads
      - Every form submission is a win: new value and potential revenue for the agency
    - Frame form submissions as inbound lead generation working automatically

    Format as bullet points with specific numbers. Emphasize the effortless nature of these leads.

1.3.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 1.3.2.a **SQL Query Prompt:**
    1. Check if forms feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. Since form data is unavailable for non-activated customers, use website traffic as proxy:
       - Retrieve daily website traffic for the report period.
       - Calculate average daily website visitors.
       - Apply proxy formula: (average_daily_visitors / 15) = estimated form submissions per day.
       - Multiply by number of days in period for total estimated form opportunity.

    Return: forms_activated (boolean), average_daily_traffic, estimated_daily_form_submissions, estimated_total_form_submissions_in_period.

  - 1.3.2.b **Report Setup Prompt:** Generate an opportunity assessment for forms activation. If not activated:
    - Present the proxy-based estimate of form submissions they could be receiving
    - Frame each estimated submission as a potential new quote request
    - Value propositions to emphasize:
      - Additional avenue for capturing new leads with zero effort
      - Quote requests coming in automatically while agency focuses on other work
      - Customers can inquire on their own schedule (evenings, weekends)
      - Every missed form is a missed opportunity and potential lost revenue
    - Highlight the competitive disadvantage of not having forms when competitors do
    - Frame as missed leads and missed potential revenue

    Format as an opportunity with specific projected numbers based on their traffic.

1.3.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 1.3.3.a **SQL Query Prompt:**
    1. Check if forms feature is activated for this customer.
    2. If activated, retrieve total number of form submissions in the report period.
    3. Low Activation threshold: 1 or fewer form submissions in the period.
    4. If customer has ≤1 form submission, they fall into Low Activation.
    5. Also retrieve:
       - Average daily website traffic for the report period
       - Total voice calls in the period (if voice activated)
       - Total chats in the period (if chat activated)

    Return: forms_activated, total_form_submissions, meets_activation_threshold (boolean, true if >1 submission), average_daily_traffic, total_voice_calls, total_chats.

  - 1.3.3.b **Report Setup Prompt:** Generate a low activation analysis for forms. If customer falls into this category:
    - Note the low form adoption, but provide context that this may not be concerning
    - Present possible explanations (not necessarily problems):
      1. **Low website traffic:** Overall site visitors may be low, limiting form exposure
      2. **Strong phone engagement:** Agency may be receiving direct phone calls instead—this is positive as people are getting in touch immediately
      3. **Chat/Voice preference:** Visitors may be interacting with AI chat or AI voice assistant instead of filling out forms
    - Key insight: Overall conversion and inbound lead generation across all channels should be evaluated before being concerned about low form activation
    - Recommend reviewing total inbound leads (forms + calls + chats) holistically

    Format with specific numbers showing form submissions alongside voice and chat activity for full picture.

---

## 2. Website

2.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 2.1.a **SQL Query Prompt:**
    1. Retrieve total site visits for this customer within the report period.
    2. Retrieve engagement metrics from Duda:
       - Click-to-call count
       - Click-to-mail count

    Return: total_site_visits, click_to_call_count, click_to_mail_count.

  - 2.1.b **Report Setup Prompt:** Generate a success narrative for website highlighting:
    - Total website traffic in the period
    - Engagement metrics:
      - Click-to-call actions (people wanting to speak directly)
      - Click-to-mail actions (people reaching out via email)
    - Celebrate where engagement is coming from and what actions visitors are taking
    - Value propositions to emphasize:
      - The website is the agency's digital storefront
      - Provides trust and authority to potential customers researching online
      - Helps convert website visitors into prospects and leads
      - Every click-to-call and click-to-mail represents an engaged potential customer

    Format as bullet points with specific numbers. Frame engagement actions as proof the website is working.

2.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 2.2.a **SQL Query Prompt:**
    1. Check if website feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. No proxy calculations available—without a website, there is no traffic data to reference.

    Return: website_activated (boolean).

  - 2.2.b **Report Setup Prompt:** Generate an opportunity assessment for website activation. If not activated:
    - Emphasize what they are missing without a PolicyWeb website:
      - Potential web traffic and conversions from online searches
      - Inbound lead capture and customer servicing capabilities
      - 24/7 availability through AI chat and AI voice widgets
      - Ability to handle quote requests and policy inquiries automatically
    - Value propositions to emphasize:
      - High-fidelity, insurance-specific websites built for trust and authority
      - Custom AI widgets (voice and chat) that keep the agency "open" 24/7
      - Without a proper well-built website, they are losing:
        - Web traffic from potential customers searching online
        - Conversions when people do find them—lack of trust and authority drives visitors away
      - A professional digital presence is essential for modern insurance agencies

    Format as an opportunity assessment. No specific numbers available—focus on qualitative value and competitive positioning.

2.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 2.3.a **SQL Query Prompt:**
    1. Check if website feature is activated for this customer.
    2. If activated, retrieve total site visits for the report period.
    3. Calculate average daily site visits (total_site_visits / number_of_days_in_period).
    4. Low Activation threshold: less than 5 average daily site visits.
    5. If customer has <5 average daily visits, they fall into Low Activation.

    Return: website_activated, total_site_visits, average_daily_site_visits, meets_activation_threshold (boolean, true if ≥5 daily avg).

  - 2.3.b **Report Setup Prompt:** Generate a low activation analysis for website. If customer falls into this category:
    - Acknowledge low website traffic and provide possible explanations with solutions:
      1. **Competitive pressure:** They may be losing traffic to competitors and other agencies. If they haven't considered SEO, recommend PolicyWeb's SEO services to improve Google ranking and drive more organic traffic.
      2. **Demographic factors:** Their customer base or community may not be heavily online and prefers calling directly—this is common in certain markets.
      3. **Referral-heavy business:** If the agency relies on referrals, customers often call directly or use business cards rather than visiting the website.
    - Key messaging to emphasize:
      - Importance of a digital storefront in the modern world
      - Most customers today search online when looking to purchase insurance or request a quote
      - PolicyWeb websites are optimized for conversion and meet customers where they prefer to communicate—phone, email, AI chat, AI voice, or form
      - A strong web presence captures customers who are researching online, even if referrals remain strong

    Format with specific traffic numbers and recommend SEO services if appropriate.

---

## 3. Email

3.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 3.1.a **SQL Query Prompt:**
    1. Retrieve total number of emails sent for this customer within the report period.
    2. Retrieve open rate (as percentage or decimal).
    3. Retrieve total number of clicks.

    Return: total_emails_sent, open_rate, total_clicks.

  - 3.1.b **Report Setup Prompt:** Generate a success narrative for email highlighting:
    - Total emails sent in the period
    - Open rate and total clicks
    - Email categories (cannot bifurcate via data, so use 50/50 proxy):
      1. **Cross-sell/Upsell emails (~50%):** Drive additional revenue and policy growth
         - Calculate: (total_emails_sent / 2) × open_rate = estimated cross-sell emails opened
      2. **Hygiene emails (~50%):** Renewals, happy birthday campaigns—help with retention
    - Benchmarks to celebrate:
      - If open rate > 20%: Celebrate—this is above industry standard
      - If clicks > 0: Celebrate—clicks are rare as most recipients read and call or take no action; any clicks are a win
      - If clicks = 0: No cause for concern—not all emails have clickable content, and most engagement happens via phone follow-up
    - Value propositions to emphasize:
      - Cross-sell/upsell emails drive incremental revenue
      - Hygiene emails strengthen retention and renewal rates
      - Email keeps the agency top-of-mind with existing customers

    Format as bullet points with specific numbers. Celebrate open rates and clicks appropriately.

3.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 3.2.a **SQL Query Prompt:**
    1. Check if email feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. Retrieve count of customers with email addresses from their AMS (if available).
    4. Apply proxy: assume 5 emails per customer per year.
    5. Calculate: customers_with_email × 5 = estimated annual automated emails they are missing.
    6. Note: If customers_with_email = 0, this likely indicates no AMS integration.

    Return: email_activated (boolean), customers_with_email_count, estimated_annual_emails_missing.

  - 3.2.b **Report Setup Prompt:** Generate an opportunity assessment for email activation. If not activated:
    - If customer email data is available:
      - Present the proxy-based estimate of automated emails they're missing (customers × 5/year)
      - Frame as missed touchpoints for cross-sells, upsells, and retention campaigns
    - If customers_with_email = 0 (no data available):
      - Explain this likely means we are not integrated with their AMS
      - Recommend manual CSV upload feature to activate email campaigns if they wish
    - Value propositions to emphasize:
      - Automated cross-sell and upsell campaigns drive incremental revenue
      - Hygiene emails (renewals, birthdays) improve retention
      - Stay top-of-mind with existing customers effortlessly

    Format as opportunity with specific numbers if available, or CSV upload recommendation if not.

3.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 3.3.a **SQL Query Prompt:**
    1. Check if email feature is activated for this customer.
    2. If activated, retrieve total number of emails sent in the report period.
    3. Low Activation threshold: fewer than 20 emails sent in the period.
    4. If customer has <20 emails sent, they fall into Low Activation.
    5. If available, retrieve count of customers with email addresses in their AMS.

    Return: email_activated, total_emails_sent, meets_activation_threshold (boolean, true if ≥20 emails), customers_with_email_count (if available).

  - 3.3.b **Report Setup Prompt:** Generate a low activation analysis for email. If customer falls into this category:
    - Acknowledge low email volume and provide possible explanations:
      1. **Missing email records:** A large portion of contacts in their AMS may not have email addresses on file, limiting who can receive automated emails.
      2. **Smaller customer base:** The agency may have fewer customers overall, which naturally results in fewer automated emails being triggered.
    - Keep the analysis general—avoid assuming the agency is new or young, as this can be difficult to determine.
    - Recommendations:
      - Encourage the agency to ensure email addresses are captured for all customers in their AMS
      - Highlight that as their customer base grows, email automation will scale with them

    Format with specific numbers on emails sent. Keep tone supportive and avoid assumptions about agency size or age.

---

## 4. Calendar

4.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 4.1.a **SQL Query Prompt:**
    1. Retrieve total number of meetings scheduled for this customer within the report period.
    2. Retrieve total number of meetings held within the report period.

    Return: meetings_scheduled, meetings_held.

  - 4.1.b **Report Setup Prompt:** Generate a success narrative for calendar highlighting:
    - Total meetings scheduled and meetings held in the period
    - Celebrate any value above zero:
      - Each meeting was an opportunity to meet face-to-face with a customer (in person or virtual)
      - Meeting was booked autonomously by AI tools—no back-and-forth required
    - Time saved calculation:
      - Each booked meeting saved approximately 20 minutes of email back-and-forth that would otherwise be spent finding a mutually available time
      - Calculate: meetings_scheduled × 20 minutes = total time saved
    - Value propositions to emphasize:
      - Agencies who meet face-to-face with customers have a much higher chance of closing new policies
      - Automated booking removes friction from the scheduling process
      - AI assistance handles availability and booking on the agency's behalf

    Format as bullet points with specific numbers. Celebrate all meetings as wins.

4.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 4.2.a **SQL Query Prompt:**
    1. Check if calendar feature is activated for this customer.
    2. If NOT activated, this customer qualifies for this section.
    3. Check Agency Help settings: does the customer have only personal lines selected, or do they have commercial policies listed?

    Return: calendar_activated (boolean), has_personal_lines_only (boolean), has_commercial_policies (boolean).

  - 4.2.b **Report Setup Prompt:** Generate an opportunity assessment for calendar activation. If not activated:
    - If personal lines only:
      - Lower priority, but still mention the free calendar tool
      - Booking links allow customers to book time directly with the agency
    - If commercial policies listed:
      - Higher value opportunity—emphasize strongly
      - Key messaging:
        - Policies are not sold in isolation without the customer
        - Booking meetings is critical to get in front of commercial customers
        - No longer need to manually schedule—AI assistance reviews availability and books meetings on your behalf
        - Activation provides booking links for direct customer booking, plus AI assistants can book meetings for customers automatically
    - Value propositions to emphasize:
      - Face-to-face meetings (in person or virtual) dramatically increase close rates
      - Eliminates scheduling back-and-forth
      - AI handles the logistics so the agency can focus on selling

    Format as opportunity assessment. Tailor urgency based on personal vs. commercial lines.

4.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 4.3.a **SQL Query Prompt:**
    1. Check if calendar feature is activated for this customer.
    2. If activated, retrieve total meetings scheduled and meetings held in the report period.
    3. Low Activation threshold: zero meetings scheduled OR zero meetings held.
    4. If customer has 0 meetings in either category, they fall into Low Activation.

    Return: calendar_activated, meetings_scheduled, meetings_held, meets_activation_threshold (boolean, true if >0 in both).

  - 4.3.b **Report Setup Prompt:** Generate a low activation analysis for calendar. If customer falls into this category:
    - Acknowledge zero or low meeting activity and provide actionable recommendations:
      1. **Email signature integration:**
         - Create a booking link and add it to their email signature with text like "Schedule time with me"
         - Bookmark the booking link for easy access—anytime there's a relevant opportunity to schedule a meeting (internal or external), they can quickly copy/paste the link into emails or texts
      2. **Social media promotion:**
         - Add the booking link to social media channel profiles
         - Include the booking link in relevant social media posts to drive meeting requests
    - Frame as a visibility and habit issue—the tool works, it just needs to be promoted and used consistently
    - Emphasize the value: every meeting booked is an opportunity to close business

    Format with specific recommendations. Keep tone encouraging and actionable.

---

## 5. Reputation Management

5.1 **Success Reporting:** _Note wins and positive outcomes from this feature_
  - 5.1.a **SQL Query Prompt:**
    1. Retrieve number of NPS/private feedback emails sent within the report period.
    2. Retrieve number of Google review request emails sent within the report period.
    3. Retrieve average NPS score for the report period.
    4. Retrieve minimum and maximum NPS score for the report period.
    5. Retrieve number of Google reviews received within the report period.
    6. Retrieve average Google review star rating for the report period.
    7. Retrieve minimum and maximum Google review star rating for the report period.

    Return: nps_emails_sent, google_review_requests_sent, avg_nps_score, min_nps_score, max_nps_score, google_reviews_received, avg_google_rating, min_google_rating, max_google_rating.

  - 5.1.b **Report Setup Prompt:** Generate a success narrative for reputation management highlighting:
    - Total NPS/private feedback emails sent and Google review request emails sent
    - Emphasize: all emails were sent automatically with no manual effort
    - NPS metrics: average, min, and max scores
      - If avg NPS < 8/10: highlight that we help screen out bad reviews by not sending Google review requests to low scorers
      - Recommend the agency review private feedback for opportunities to improve their service
    - Google review metrics: reviews received, average rating, min and max ratings
      - If any 5-star reviews received: celebrate and emphasize how 5-star Google reviews boost the Google algorithm, helping the agency rank higher in search results and Google Maps when people search for insurance
    - Value propositions to emphasize:
      - Automated private feedback emails gather sentiment before requesting Google reviews
      - This process generates more 5-star reviews by only requesting reviews from happy customers
      - Helps weed out potentially bad public reviews
      - Builds trust and reputation on Google, generating more leads and business

    Format as bullet points with specific numbers and ratings. Celebrate 5-star reviews prominently.

5.2 **Onboarding Opportunity:** _Flag if not activated and could provide value_
  - 5.2.a **SQL Query Prompt:**
    1. Check if Google reputation feature is activated for this customer.
    2. If NOT activated, also check if email feature is activated.

    Return: google_reputation_activated (boolean), email_activated (boolean).

  - 5.2.b **Report Setup Prompt:** Generate an opportunity assessment for reputation management activation. If Google reputation not activated:
    - If email is NOT activated:
      - This likely means we have not integrated with their AMS
      - Limited action available—recommend AMS integration first to enable automated emails
    - If email IS activated but Google reputation is NOT:
      - This likely means we have not gotten access to their Google Business Profile
      - Action needed: sign in with Google Business Profile to enable the feature
      - Value propositions to emphasize:
        - Google reviews build trust and reputation with potential customers
        - Higher star ratings and review volume improve Google search rankings
        - More visibility on Google Maps when people search for insurance locally
        - All of this can be done automatically once they enable the feature
        - The system screens out bad reviews by gathering private feedback first

    Format as opportunity assessment. Clarify the specific blocker (AMS integration vs. Google Business Profile access).

5.3 **Low Activation:** _Activated but underutilized—may be due to technical issues, market factors, usage patterns, or adoption challenges_
  - 5.3.a **SQL Query Prompt:**
    1. Check if Google reputation feature is activated for this customer.
    2. If activated, retrieve:
       - Number of private feedback/NPS emails sent in the report period
       - Number of Google review request emails sent in the report period
    3. Low Activation threshold: fewer than 2 private feedback emails sent OR fewer than 1 Google review request sent.
    4. If customer meets either threshold, they fall into Low Activation.
    5. Note: If ≥2 private feedback emails OR ≥1 Google review request sent, customer qualifies for Success Reporting instead.

    Return: google_reputation_activated, nps_emails_sent, google_review_requests_sent, meets_activation_threshold (boolean, true if ≥2 NPS emails OR ≥1 Google review request).

  - 5.3.b **Report Setup Prompt:** Generate a low activation analysis for reputation management. If customer falls into this category:
    - Acknowledge low email volume for reputation management
    - Present possible explanations (similar to email low activation):
      1. **Small book of business:** Fewer customers means fewer automated emails triggered
      2. **Missing email addresses:** Low percentage of customer emails populated in their AMS
    - Recommendations to improve activation:
      1. **Bind more policies:** Each new policy binding triggers automated emails to that customer
      2. **Populate email addresses in AMS:** Ensure every customer has an email on file
    - Explain the automated flow:
      - New policy bound → automated private feedback email sent → high NPS score (8+) → Google review request sent → 5-star Google review received
    - Re-emphasize why Google reviews matter:
      - Builds trust and credibility with potential customers
      - Improves Google search rankings and Maps visibility
      - Generates more leads and new business

    Format with specific numbers. Keep tone encouraging with clear action steps.

---

## 6. Summary & Next Steps

6.1 **SQL Query Prompt:**
  1. Retrieve total website visits in the given time period.
  2. Sum inbound customer traffic:
     - Total voice calls (regardless of status/reason)
     - Total chats (regardless of status/reason)
     - Total form submissions
     - Combined total = inbound_customer_traffic
  3. Sum outbound automated emails:
     - Total marketing/hygiene emails sent
     - Total private feedback/NPS emails sent
     - Total Google review request emails sent
     - Combined total = outbound_automated_emails
  4. Retrieve activation status for all features: voice, chat, forms, website, email, calendar, Google reputation.

  Return: total_website_visits, total_voice_calls, total_chats, total_form_submissions, inbound_customer_traffic, total_marketing_emails, total_nps_emails, total_google_review_emails, outbound_automated_emails, feature_activation_statuses.

6.2 **Report Setup Prompt:** Generate an executive summary synthesizing insights from all sections:
  - **Overall Assessment (2-3 sentences):**
    - Summarize overall customer health based on website traffic and engagement
    - Highlight inbound customer traffic (voice + chat + forms) as interactions handled
    - Highlight outbound automated emails as touchpoints delivered
  - **Top Wins:**
    - Pull the most significant wins from any of the previous 5 categories (Voice/Chat/Forms, Website, Email, Calendar, Reputation Management)
    - Celebrate specific numbers and outcomes
  - **Opportunities:**
    - List features that are either not activated or in low activation status
    - Prioritize by potential impact to the agency's business
    - Provide brief recommended next steps for each opportunity

  Format as an executive summary suitable for customer presentation. Lead with wins, then opportunities.

---

## 7. Global Styling Guide

### 7.1 Color Palette

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| **Primary** | Teal Green | `#00A67E` | Headers, category titles, metrics highlights, success indicators |
| **Secondary** | Dark Gray | `#2D3748` | Body text, descriptions |
| **Light Gray** | Muted | `#718096` | Subtext, labels, secondary info |
| **Background** | Off-White | `#F7FAFC` | Page background |
| **Card Background** | White | `#FFFFFF` | Section cards |
| **Success** | Green | `#00A67E` | Wins, positive metrics |
| **Warning** | Amber | `#D69E2E` | Low activation, attention needed |
| **Opportunity** | Blue | `#3182CE` | Onboarding opportunities |

### 7.2 Document Structure

**IMPORTANT:** Place the Summary at the TOP of the generated report for quick executive overview.

```
┌─────────────────────────────────────────────────────────────┐
│  REPORT HEADER                                              │
│  Customer Name | Report Period | Prepared By                │
├─────────────────────────────────────────────────────────────┤
│  [chart-icon] EXECUTIVE SUMMARY (Section 6 - placed first)  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Overall Assessment (2-3 sentences)                   │   │
│  │ [check-icon] Top Wins (bulleted highlights)          │   │
│  │ [target-icon] Opportunities (prioritized list)       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  CATEGORY SECTIONS (Each as a "card")                       │
│                                                             │
│  Row 1: Communication Channels (3 cards)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ [phone] Voice│  │ [chat] Chat  │  │ [form] Forms │      │
│  │ [metrics]    │  │ [metrics]    │  │ [metrics]    │      │
│  │ [summary]    │  │ [summary]    │  │ [summary]    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  Row 2: Platform & Engagement (4 cards)                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ [globe]   │  │ [mail]    │  │ [star]    │  │ [calendar│ │
│  │ Website   │  │ Email     │  │ Reputation│  │ ] Calen- │ │
│  │ [metrics] │  │ [metrics] │  │ [metrics] │  │ dar      │ │
│  │ [summary] │  │ [summary] │  │ [summary] │  │ [metrics]│ │
│  └───────────┘  └───────────┘  └───────────┘  │ [summary]│ │
│                                               └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Category Card Format

Each category section should follow this structure:

```markdown
---

## [svg-icon] Category Name

<span style="color: #00A67E; font-size: 0.9em;">STATUS: Active | Needs Attention | Not Activated</span>

### Key Metrics

| Metric | Value | Insight |
|--------|-------|---------|
| Total [X] | **123** | Brief context |
| [Metric 2] | **45%** | Comparison or benchmark |
| Time Saved | **2.5 hrs** | Value statement |

### Summary

> One sentence summarizing performance and value delivered for this category.

### Recommendations (if applicable)

- Action item 1
- Action item 2

---
```

**Note:** Status indicators should use colored SVG icons or colored text/badges rather than emojis. See Section 7.5 for SVG icon specifications.

### 7.4 Typography Hierarchy

| Element | Style | Size | Color |
|---------|-------|------|-------|
| Report Title | Bold, centered | H1 (2em) | `#00A67E` |
| Category Headers | Bold with icon | H2 (1.5em) | `#00A67E` |
| Section Subheaders | Semi-bold | H3 (1.25em) | `#2D3748` |
| Metric Labels | Regular | Body (1em) | `#718096` |
| Metric Values | Bold | Body (1em) | `#2D3748` |
| Summary Text | Italic blockquote | Body (1em) | `#2D3748` |
| Body Text | Regular | Body (1em) | `#2D3748` |

### 7.5 Status Indicators

Use consistent SVG icons for feature status. Do NOT use emojis in output text.

| Status | SVG Icon | Color | Label |
|--------|----------|-------|-------|
| Success/Active | `check-circle` | `#00A67E` | "Active" or "Performing Well" |
| Low Activation | `alert-triangle` | `#D69E2E` | "Needs Attention" |
| Not Activated | `circle` (outline) | `#718096` | "Not Activated" |
| Opportunity | `target` | `#3182CE` | "Opportunity" |
| Win/Celebration | `trophy` | `#00A67E` | Use for highlighting wins |

**SVG Implementation Example:**
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A67E" stroke-width="2">
  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
  <polyline points="22 4 12 14.01 9 11.01"></polyline>
</svg>
```

Recommended icon libraries: Lucide, Feather Icons, or Heroicons (all support the icon names above).

### 7.6 Category Icons (SVG)

Use SVG icons for all category headers. Do NOT use emojis.

| Category | SVG Icon Name | Lucide/Feather Equivalent |
|----------|---------------|---------------------------|
| Voice | `phone` | `phone` or `phone-call` |
| Chat | `message-circle` | `message-circle` |
| Forms | `file-text` | `file-text` or `clipboard` |
| Website | `globe` | `globe` |
| Email | `mail` | `mail` |
| Calendar | `calendar` | `calendar` |
| Reputation | `star` | `star` |
| Summary | `bar-chart-2` | `bar-chart-2` or `pie-chart` |

**SVG Implementation:**
```html
<!-- Example: Voice icon in primary color -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A67E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
</svg>
```

All icons should use `stroke="#00A67E"` (primary teal) for consistency.

### 7.7 Metric Display Formats

**Large Hero Metrics (for summary section):**
```markdown
<div style="text-align: center; padding: 1em;">
  <span style="font-size: 2.5em; font-weight: bold; color: #00A67E;">1,234</span>
  <br>
  <span style="color: #718096; font-size: 0.9em;">Total Website Visits</span>
</div>
```

**Inline Metrics (for category cards):**
```markdown
**123** calls handled · **45 min** saved · **89%** had valid reason
```

**Metric Tables (for detailed breakdowns):**
```markdown
| Metric | This Period | Insight |
|--------|-------------|---------|
| Total Calls | **87** | 100% of total |
| Service Calls | **52** | 60% of total |
| Claim Calls | **35** | 40% of total |
```

### 7.8 Summary Section Template (Placed at Top of Report)

**IMPORTANT:** Do not use emojis anywhere in the generated report output. Use SVG icons for visual elements only.

```markdown
# <span style="color: #00A67E;">Customer Success Report</span>

**Customer:** [Name] · **Period:** [Date Range] · **Prepared by:** [Team Member]

---

## [svg: bar-chart-2] Executive Summary

### Overall Health
> [2-3 sentence assessment of overall performance, traffic, and engagement]

### At a Glance

| Inbound Traffic | Outbound Touchpoints | Website Visits |
|-----------------|---------------------|----------------|
| **[X]** interactions | **[Y]** emails sent | **[Z]** visits |
| (Voice + Chat + Forms) | (Marketing + NPS + Reviews) | |

### [svg: trophy] Top Wins
- **[Win 1]:** Brief description with number
- **[Win 2]:** Brief description with number
- **[Win 3]:** Brief description with number

### [svg: target] Opportunities
| Feature | Status | Recommended Action |
|---------|--------|-------------------|
| [Feature 1] | Needs Attention | [Brief action] |
| [Feature 2] | Not Activated | [Brief action] |

---

## Detailed Category Reports

[Category sections follow below...]
```

**Rendering Note:** Replace `[svg: icon-name]` placeholders with actual inline SVG elements or icon component references during report generation.

### 7.9 Visual Separators

Use horizontal rules (`---`) between major sections. Use spacing consistently:

- **Between categories:** `---` with blank line above and below
- **Within categories:** Use H3 headers to separate subsections
- **Metric groups:** Use tables or `·` separated inline metrics

### 7.10 Tone and Voice

- **Celebratory for wins:** "Great news!" "Your agency handled X calls automatically!"
- **Constructive for opportunities:** "There's potential to..." "Consider activating..."
- **Supportive for low activation:** "Here's how to improve..." "This is common and easily addressed..."
- **Never blame or criticize:** Focus on opportunity, not failure