## Highest Priority Segments
Renewal Reminders
* We've seen this 2 ways (this is always on the Policy level): (1) in our own systems we set X days before Renewal Date (which most AMS' have) and (2) in AR it's (360-X) days since Effective Date (presumably because Effective Date is more consistent and universal, and it's assumed that all policies have a 1 year term) 
Cancellations
* A Policy with "Cancelled (Pending)" status in HawkSoft and SubStatus "Non-Payment" indicates a payment was missed (only Marker Insurance listed this as top priority)
Welcome Kits
* Simplistic AR Targeting: Customer/Account Status becomes Active (this fails to account for the fact that when you first start the campaign, many of those customers have not *just* become active - they were already active - so AR must have a way to target "only users after turning on this campaign that enter the segment" whereas Reach targets "all users in or entering the segment" which creates the problem where we'll send to all active users even if they haven't just joined)
* Better Targeting in HawkSoft: Sold Date comes up

## Med Priority Segments
Cross Sells
* Target customers with: X Policy but not Y Policy (usually something like Home but no Auto) that have/do not have a certain set of Carriers (the ones the agency bundles with)
Renewal Notices
* Tricky to indicate, could be the effective date of the Policy if the Policy was already active, but we never really tested that we could measure this
Reputation/NPS
* Customer just signed (see Welcome Kits)
* NPS -> Google Review targeting = Customer gave NPS 9 or higher