# Google Ads task list (source of truth for the template)

Format: Phase > Section > Task. "How:" text is only shown when a task is opened.
Tasks marked (R) are recurring. Phase 5 appears automatically once phases 1 to 4 are complete.

## Phase 1: Research (shared across every project)

### Market research
- Market research

### Map out the funnel
- Map out the funnel
  How: Write the path the person goes through: search, ad, landing page, form or call, sales call, close. Write the mental step needed at each stage. Count the stages that need persuasion. Each one gets its own Winner's Writing Process.

### Winner's Writing Process
- Winner's Writing Process: Google Ads
  How: Score desire, belief and trust out of 10 for the person searching. The action you want is a click. Name the gap, the one lever the ad must pull.
- Winner's Writing Process: landing page
  How: Score desire, belief and trust out of 10 for the person who just clicked. The action you want is a form or call. Name the gap, the one lever the page must pull.

### CIA interviews
- CIA interviews
  How: Interview 3 to 5 people in the target market. Ask what they searched, what almost stopped them from calling, and why they chose who they chose. Update the research and the scores to match what they said.

### Top player analysis
- Top player analysis
  How: Search the main keywords in the client's area. Collect the competitors' ads, offers and landing pages (screenshots). Note the angles they use and the language they use. Note the gaps nobody covers. That is where we come in.

## Phase 2: Google Ads research

### Keyword research
- Set Keyword Planner to the target location
  How: Tools > Keyword Planner > Discover new keywords. Set the location to the service area, not the whole country.
- Pick 10 to 15 high-intent keywords per ad group
  How: Keep "service + near me / in city / cost / company" terms. Drop "how to", "DIY", "jobs" and "free".
- Check total search volume is 3k+ per campaign
  How: Add up the monthly searches. Under 3k, widen the location or add a service.
- Build the starting negative keyword list
  How: Add jobs, DIY, how to, training, cheap, free, rental. Add competitor names if we don't want to pay for those clicks.

### Budget
- Double check the budget
  How: For each keyword, average "top of page bid low" and "top of page bid high". Then average all the averages.
- Calculate the daily budget
  How: Average CPC x 10 clicks a day. Example: $10 x 10 = $100 a day, about $3,000 a month.

## Phase 3: Build

### Access and account
- Make sure the Google Ads account exists
  How: The client creates it. If they have none, send them the steps and tell them to choose Expert Mode, not Smart campaigns.
- Make sure we have access to the Google Ads account
  How: Ask the client to invite our manager account email as Admin. Accept the invite and open the account.
- Make sure billing is added
  How: Billing > Payment settings. The client adds their own card. Check the status says active.
- Get GA4 access
  How: The client adds us as Admin under Admin > Property access management.
- Get Tag Manager access
  How: The client adds us as Admin on the container. If they have none, create one and install it on the site.
- Get website access
  How: A CMS login or a developer contact.
- Link GA4 to Google Ads
  How: Tools > Data manager > Linked products.
- Link the Google Business Profile to Google Ads
  How: Tools > Data manager > Linked products.

### Ad copy
- Write 15 headlines
  How: Use all 15 slots: keyword and location, trust, differentiator, offer, CTA. Example: "House Washing Near Minneapolis".
- Write 4 descriptions
  How: Use all 4 slots: core value, offer, differentiator, CTA.
- Check the copy against the top player analysis
  How: Use the gaps and the language you collected.

### Landing page
- Landing page requirements
  How: If we need to build or fix a page, it needs the main keyword in the H1, the offer, social proof, a form and call button, and a /thank-you page. Add to this list per client.
- Make sure the landing page is live
  How: Open the final URL in a private window.
- Make sure the landing page loads quickly
  How: Run PageSpeed Insights on mobile. Fix the biggest items first (images, scripts).
- Make sure the landing page is mobile optimized
  How: Open it on a real phone. Check the form, call button and text size.
- Make sure the H1 matches the ad
  How: The H1 should use the same keyword as the headline.
- Make sure conversion tracking works on the page
  How: See the conversion tracking tasks.

### Conversion tracking
- Set up form fill tracking
  How: In Google Ads: Goals > Conversions > New > Website. Copy the conversion ID and label. In Tag Manager, create a Google Ads conversion tag with them. Set the trigger to the /thank-you page view. Publish the container.
- Set up calls from ads
  How: Goals > Conversions > New > Phone calls > "Calls from ads". Make sure the call asset is on.
- Set up landing page phone calls
  How: Goals > Conversions > New > Phone calls > "Calls to a phone number on your website". Add the Google forwarding number snippet to the page (free), or CallRail if the client pays for it.
- Turn on Enhanced Conversions
  How: Goals > Settings > Enhanced conversions. Choose Tag Manager as the method.
- Make sure GA4 is collecting data
  How: Open GA4 > Reports > Realtime. Visit the site and check your visit appears.
- Make sure GA4 key events are set
  How: In GA4 Admin > Events, mark the form submit and call click as key events.
- Test every conversion
  How: Submit a real form and make a real call. Check each shows in Google Ads under Goals > Conversions. Allow a few hours for it to appear.

### Create the campaign
- Start a new Search campaign
  How: Campaigns > New campaign > goal Leads > type Search. Name it after the service.
- Create one campaign per service
  How: For a starter project, make 1 campaign only. Expand later.
- Set bidding to Manual CPC
  How: In Bidding, choose Clicks, then Manual CPC. Set the max CPC from the budget step.
- Turn off Display and Search Partners
  How: Settings > Networks.
- Set the location to presence only
  How: Locations > Location options > Presence, not "Presence or interest".
- Set the language
  How: The language the customers search in.
- Set the daily budget
  How: Enter the number from the budget step.
- Create an ad group for each theme
  How: Example: "House Washing" and "Roof Washing" as separate ad groups.
- Add the keywords as exact match
  How: Paste the 10 to 15 keywords per ad group in [brackets].
- Add 2 to 3 phrase match keywords
  How: Use only the highest-intent ones, in "quotes".
- Add the negative keywords
  How: Paste the starting list into the campaign.
- Paste in the ad copy
  How: Add the 15 headlines, 4 descriptions and the landing page URL.
- Add call, sitelink, callout and location assets
  How: Assets > add each type so the ad takes more space.
- Save the campaign as paused
  How: Do not publish yet.

### Pre-launch checklist
- Check tracking fires end to end
  How: Open the landing page in a private window with Tag Manager Preview on. Submit the form. Check the conversion tag fires on /thank-you. Then check the conversion shows in Google Ads.
- Check call tracking
  How: Call the forwarding number from your phone. Check it connects and logs a call.
- Check each ad points to the right landing page
  How: Click every final URL and check for 404s.
- Check budget, billing and bidding
  How: Open campaign settings and compare the numbers to the budget step.
- Do a final mobile and speed pass
  How: Open the page on a real phone and rerun PageSpeed Insights.
- Get client approval of the ads and page
  How: Send a screenshot or preview link.

## Phase 4: Launch

### Go live
- Go live
  How: Set the campaign to enabled and note the date.

## Phase 5: Ongoing and milestones (appears after phase 4 is complete; every task repeats on its cadence)

### Every 3 days (R)
- Search term audit
  How: Add negative keywords for unrelated searches. Add long tail terms that convert.
- Check budget pacing
  How: Compare spend to the daily budget. Look for budget that runs out early.
- Check ads for disapprovals and limited approvals
  How: Fix and resubmit any disapproved ads.
- Check all conversion actions are working
  How: Goals > Conversions, check the status column. If tracking calls, review the call report.

### Weekly (R)
- Review keyword performance
  How: Find keywords with a high CPC or high cost per conversion vs the account average, and keywords with a status warning (low search volume, below first page bid, rarely shown).
- Review ads by ad group
  How: Check conversion rate, quality score and CTR. Raise Ad Strength to Good or Excellent.
- Check landing page URLs
  How: No 404s, no slow pages, no disapprovals.
- Check searches from non-targeted locations
  How: Exclude those locations.
- Review the recommendations tab
  How: Apply or reject each one.
- Send client update

### Monthly (R)
- Review match types
  How: Add phrase or exact match versions of converting search terms.
- Check the Auction Insights report
  How: Look for new competitors or higher competitor spend.
- Run ad copy split tests
  How: 2 ads per ad group. Test headlines, descriptions and positions. With low volume, test with less confidence.
- Check assets
  How: Sitelinks, callouts, structured snippets, call, location. Add promotion, price or image assets if they apply to the client.
- Review quality score
  How: For low scores, fix the ad copy or landing page to match the keyword.
- Check bounce rate and session time in GA4
- Review bids by hour, day, demographics and location
  How: Adjust only where the data is clear.
- Check payment and account budgets
- Compare results to the promise

### Every 90 days (R)
- Check whether the campaign goal is still the best option
  How: If actual CPA is lower than the CPA goal, lower the goal. If conversions stalled and nothing else explains it, test another goal.
- Review audiences
  How: Look for new audiences to add.
- Compare landing pages by conversion rate

### Milestones (shown as a result-based gate, tick when reached)
- After month 1: add converting keywords, pause low performers, review budget split
- 30+ conversions in 30 days: switch to tCPA and start ad copy and landing page tests
- At or below target CPA: scale the budget 10 to 20% per 7 days, or add ad groups and locations
