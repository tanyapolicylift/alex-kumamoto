## Scope
Improve Personal Auto quote cycle time
* 3-4 raters
* 4 states
	* CA
	* OH
	* TX
	* FL
* Raters
    * TurboRater (ITC Zywave)
        * FOCO (Design Partner target)
        * JAMCO (Design Partner target)
    * PLRater
        * Seguros (Design Partner target)
        * Ley (Design Partner target)
    * EZLynx Rater
        * Venture Casualty
        * All Texas (Design Partner target)
    * Applied
        * Coverlink
    * QuoteRush
        * E&L



## Lifecycle
ToF -> Data Enrichment Attempt 1 -> Interaction 2 -> Data Enrichment 2 -> Present Quote Packet

* Data Retrieval
	* Current ToF Hooks
		* Call
		* Chat
		* Form
	* Customer Interaction-Based
		* Interaction Hypothesis 1: One "session", multiple modalities, net info gain. Requires mid-session linking of all of these modalities.
		* Interaction Hypothesis 2: Automated followups for later save time, cut turns between customer, and multiple modalities increase chance of full info-gain
		* Modalities
			* Email
			* Text
			* Smart Form
			* Dec Page Uploader
			* Link-based portal with subsets of all of these
	* Data enrichment
		* Public apps
		* Regional sites of associations/organizations with info
		* Enrichment APIs
			* Canopy Connect
			* Other
* Market Selection
	* Assumed solved problem
* Data translation
	* Assumed P2