---
created: 2026-02-10
author: Alex
status: open
tags: [pl-auto-cycle, data-enrichment, research, home, auto]
---

# Public Data Enrichment Research: Personal Auto & Homeowners

> **Goal**: Identify every publicly or commercially available data source that can auto-fill insurance quote fields, so the customer answers fewer questions and our quote cycle compresses.
>
> **Target States**: CA, TX, OH, FL | **Lines**: Personal Auto, Personal Homeowners

---

## Table of Contents

1. [County Assessor / Property Record Access by State](#1-county-assessor--property-record-access-by-state)
2. [Property Data Aggregator APIs](#2-property-data-aggregator-apis)
3. [Zillow / Redfin / Realtor.com / MLS Data Access](#3-zillow--redfin--realtorcom--mls-data-access)
4. [Satellite Imagery / Geospatial AI for Property](#4-satellite-imagery--geospatial-ai-for-property)
5. [FEMA Flood Zone Data](#5-fema-flood-zone-data)
6. [Wildfire Risk Data](#6-wildfire-risk-data)
7. [Fire Protection / Distance Calculations](#7-fire-protection--distance-calculations)
8. [NHTSA VIN Decoder API](#8-nhtsa-vin-decoder-api)
9. [Vehicle Valuation APIs](#9-vehicle-valuation-apis)
10. [Address & People Data](#10-address--people-data)
11. [Prioritized Enrichment Stack](#11-prioritized-enrichment-stack)

---

## 1. County Assessor / Property Record Access by State

### Overview

Every county maintains property tax assessment records, which are public data. The question is how accessible these records are for programmatic lookup. The answer varies enormously by county.

### California (Top 5 Counties by Population)

| County | Online Portal | API Available | Bulk Download | Key Fields | Programmatic Accessibility |
|---|---|---|---|---|---|
| **Los Angeles** | Yes - [LA County Assessor Portal](https://portal.assessor.lacounty.gov/) | Partial - LA County Open Data Hub exposes some datasets via Socrata API | Yes - via LA County Open Data (data.lacounty.gov) | Year built, sq ft, bedrooms, baths, assessed value, lot size, use code | **Medium-High**. Open Data portal has API endpoints. 2.7M+ properties. |
| **San Diego** | Yes - via SanGIS and SANDAG Parcel Lookup Tool | Yes - ArcGIS-based GIS services via SanGIS (sangis.org) and San Diego Open Data Portal | Yes - SanGIS provides GIS downloads; SANDAG open data in CSV/GeoJSON/KML | Year built, sq ft, assessed value, lot size, use code, zoning | **Medium-High**. SanGIS JPA between City and County provides centralized GIS data. |
| **Orange** | Yes - [OC Assessor](https://www.ocassessor.gov/) | Partial - County of Orange open data (data-ocpw.opendata.arcgis.com) provides GIS layers with ArcGIS REST services | Yes - GIS downloads in CSV, KML, GeoJSON, GeoTIFF formats | Year built, sq ft, assessed value, lot size, bedrooms, baths | **Medium**. GIS services available; property detail may require parcel-level lookup. |
| **Riverside** | Yes - online Public Access portal | No public API | Bulk data available for purchase via [Bulk Data Sales](https://www.rivcoacr.org/bulk-data-sales) | Year built, sq ft, assessed value, lot size, bedrooms, baths, construction type | **Low-Medium**. Bulk data requires purchase. Individual lookups only via web portal. |
| **San Bernardino** | Yes - [govPIMS portal](https://arcpropertyinfo.sbcounty.gov/) | No public API | Bulk data available only via 3rd-party vendors (ParcelQuest, CoreLogic, DataTree) | Year built, sq ft, assessed value, lot size | **Low**. No free bulk or API access. Must use vendors. |

**California Note**: [ParcelQuest](https://www.parcelquest.com/) provides data for all 58 California counties, updated daily from assessors. This is the most practical path for comprehensive CA coverage.

### Texas (Top 5 Counties by Population)

| County | Online Portal | API Available | Bulk Download | Key Fields | Programmatic Accessibility |
|---|---|---|---|---|---|
| **Harris** | Yes - [HCAD](https://hcad.org/) | Yes - ArcGIS REST MapServer (gis.hctx.net/arcgis/rest/services/HCAD/Parcels/MapServer). Max 1,000 records per query. | Yes - **Free** text file downloads via [PDATA](https://hcad.org/pdata/pdata-property-downloads.html); GIS shapefiles quarterly | Year built, sq ft, bedrooms, baths, construction type, assessed value, lot size, use code | **High**. Free bulk downloads + GIS API. Best in TX. |
| **Dallas** | Yes - [DCAD](https://www.dallascad.org/) | Partial - ArcGIS hub (tax-appraisal-data-dallasgis.hub.arcgis.com) | Yes - **Free** zip file downloads of current/prior appraisal data via [Data Products](https://www.dallascad.org/dataproducts.aspx) | Year built, sq ft, assessed value, lot size, use code, improvements | **High**. Free bulk downloads available. |
| **Tarrant** | Yes - [TAD](https://www.tad.org/) | Yes - ArcGIS Open Data Portal (gis-tad.opendata.arcgis.com) | Yes - **Free** downloads in multiple formats (full set, residential, commercial, GIS parcels) via [Data Downloads](https://www.tad.org/resources/data-downloads) | Year built, sq ft, bedrooms, baths, assessed value, lot size, construction type | **High**. Free bulk downloads + open data portal. |
| **Bexar** | Yes - [BCAD](https://bcad.org/) | Partial - Bexar County Open Data Portal (gis-bexar.opendata.arcgis.com) | Partial - some data via open data portal | Year built, sq ft, assessed value, lot size | **Medium**. Open data portal exists but less comprehensive than Harris/Dallas/Tarrant. |
| **Travis** | Yes - [TCAD](https://traviscad.org/) | Yes - Travis County GIS ArcGIS services with API links for GeoServices, WMS, WFS | Yes - downloads in CSV, KML, GeoJSON formats | Year built, sq ft, assessed value, lot size, improvements | **Medium-High**. GIS downloads and API available. |

**Texas Note**: Texas appraisal districts are generally excellent about providing free bulk data downloads. Harris, Dallas, and Tarrant are among the best in the nation for data accessibility.

### Ohio (Top 5 Counties by Population)

| County | Online Portal | API Available | Bulk Download | Key Fields | Programmatic Accessibility |
|---|---|---|---|---|---|
| **Cuyahoga** | Yes - County Fiscal Office property search | No public API documented | Not readily available | Year built, sq ft, assessed value, lot size | **Low**. Web portal only. |
| **Franklin** | Yes - [Franklin County Auditor](https://audr-api.franklincountyohio.gov/) | **Yes** - Franklin County Auditor Mobile App API returns detailed parcel information | Not documented | Year built, sq ft, assessed value, lot size, bedrooms, baths | **Medium-High**. API exists for parcel data. Standout in OH. |
| **Hamilton** | Yes - County Auditor property search | No public API documented | Not documented | Year built, sq ft, assessed value, lot size | **Low**. Web portal only. |
| **Summit** | Yes - [Summit County Auditor](https://summitcountyauditor.site/) | No public API documented | Not documented | Year built, sq ft, assessed value, lot size, tax info | **Low**. Web-based search only. |
| **Montgomery** | Yes - [Montgomery County Auditor](https://montgomerycountyauditors.org/) | No public API documented | Not documented | Year built, sq ft, assessed value, lot size | **Low**. Web-based search only. |

**Ohio Note**: Ohio counties are generally behind Texas and California in making data programmatically accessible. Franklin County is the exception with a documented API. For the others, a property data aggregator is essential.

### Florida (Top 5 Counties by Population)

| County | Online Portal | API Available | Bulk Download | Key Fields | Programmatic Accessibility |
|---|---|---|---|---|---|
| **Miami-Dade** | Yes - [Property Appraiser](https://bbs.miamidade.gov/) | No public API documented | Yes - File downloads from Property Appraiser File Library at $50/file | Year built, sq ft, bedrooms, baths, assessed value, lot size, use code, construction type | **Medium**. Bulk data available but paid. |
| **Broward** | Yes - [BCPA](https://bcpa.net/) | No public API documented | Not prominently documented | Year built, sq ft, assessed value, lot size | **Low-Medium**. Web portal; bulk access unclear. |
| **Palm Beach** | Yes - [PAPA system](https://pbcpao.gov/) | No public API | Yes - Large files available, many free. Excel/PDF formatting $33/file; programming fees $66/hr | Year built, sq ft, bedrooms, baths, assessed value, lot size, construction type | **Medium**. Free bulk files available. |
| **Hillsborough** | Yes - [HCPA](https://www.hcpafl.org/) | No public API documented | Not prominently documented | Year built, sq ft, assessed value, lot size | **Low**. Web portal only. |
| **Orange** | Yes - [Orange County PA](https://ocpaweb.ocpafl.org/) | No public API documented | Not prominently documented | Year built, sq ft, assessed value, lot size | **Low**. Web portal only. |

**Florida Statewide Note**: The [Florida Geographic Information Office](https://www.floridagio.gov/) publishes **Florida Statewide Parcels** -- a consolidated dataset of all 67 county parcel records updated annually from county property appraisers. This includes 10.8M+ parcels. This is a powerful free resource.

### Summary: County-Level Assessor Data

**Best programmatic access**: TX (Harris, Dallas, Tarrant) > CA (via LA Open Data, SanGIS) > FL (statewide parcels) > OH (Franklin only)

**Recommendation**: Do NOT rely on county-by-county integrations. Use a property data aggregator API (Section 2) as the primary source, and supplement with county data for validation or gap-filling.

---

## 2. Property Data Aggregator APIs

These commercial APIs aggregate assessor, deed, mortgage, and other property data into a single clean API call by address or APN.

### Comparison Table

| Feature | ATTOM Data | CoreLogic (now Cotality) | Estated (now part of ATTOM) | HouseCanary | Precisely (fka Pitney Bowes) |
|---|---|---|---|---|---|
| **Coverage** | 158M+ US properties (99% population) | ~150M+ US properties | 155M+ US properties | Nationwide (focus on residential) | Nationwide |
| **Data Points per Property** | 9,000+ attributes, 70B rows total | Extensive (not publicly quantified) | 150+ data points per property | Rich analytics + public records | Property characteristics + risk data |
| **Insurance-Critical Fields** | Year built, sq ft, bedrooms, baths, construction type, roof type, lot size, assessed value, AVM, flood zone, fire risk | All of the above + replacement cost, hazard risk, portfolio analysis | Year built, sq ft, beds, baths, construction type, roof material, roof style, foundation, heating, cooling, exterior walls, lot size, pool, basement, quality rating, condition | AVM, rent estimates, comps, risk scores, market forecasts | Property characteristics, fire/flood/earthquake risk, geocoding |
| **Specific Estated/ATTOM Fields** | -- | -- | `year_built`, `total_area_sq_ft`, `beds_count`, `baths`, `construction_type`, `roof_material_type`, `roof_style_type`, `foundation_type`, `exterior_wall_type`, `heating_type`, `heating_fuel_type`, `air_conditioning_type`, `lot area_sq_ft`, `pool_type`, `basement_type`, `quality`, `condition` | -- | -- |
| **Pricing Model** | Subscription + per-call. Starts ~$500/mo. Custom enterprise pricing. | Enterprise pricing only. Typically $10K+/year minimum. | Contact sales (now redirects to ATTOM) | Tiered plans: Individual to Enterprise | Enterprise pricing |
| **API Quality** | REST API, JSON/XML, 200 calls/min limit | REST/XML APIs, cloud-based, batch delivery | REST API, simple address-based lookup, excellent docs | REST API, well-documented | Developer portal (developer.precisely.com) |
| **Insurance Relevance** | High -- multi-sourced risk data (flood, fire, earthquake, environmental) | **Highest** -- dominant in insurance industry. Specific insurance underwriting products. Hazard Hub integration. | High -- specifically marketed to insurtechs. Simplest API for insurance use case. | Medium -- strong AVM/analytics, less insurance-specific | High -- fire/flood/earthquake risk data, geocoding for insurance |
| **Data Freshness** | Updated regularly from county sources | Updated frequently | Historical data spanning 40+ years | AVMs updated regularly | Varies by product |
| **Best For** | Startups needing broad property + risk data in one API | Enterprise carriers needing deep insurance analytics | **Startups/insurtechs** wanting simplest possible integration (note: now part of ATTOM) | Investors/lenders needing valuation analytics | Carriers needing location-based risk data |

### Key Observations

1. **Estated was the best fit for an insurtech startup** -- simple API, insurance-focused fields, 150+ data points. However, Estated was acquired by ATTOM and their documentation will be deprecated sometime in 2026. Evaluate ATTOM's offering as the successor.

2. **CoreLogic/Cotality is the industry incumbent** -- used by most large carriers. Enterprise-grade pricing likely starts at $10K+/year. They have specific insurance products (Hazard Hub, replacement cost estimators). Worth evaluating but may be cost-prohibitive early on.

3. **ATTOM (including Estated) is the practical choice** -- broad coverage, reasonable pricing for startups, and now includes Estated's insurance-friendly schema. Start here.

4. **HouseCanary** excels at AVMs and property analytics but is less focused on the structural details insurance underwriting needs (construction type, roof material, etc.).

5. **Precisely** is strong on risk/hazard data overlays (fire, flood, earthquake scores) but not as comprehensive on structural property details.

### Estimated Per-Lookup Costs

| Provider | Estimated Cost per Lookup | Notes |
|---|---|---|
| ATTOM | $0.05 - $0.50 per call (volume-dependent) | Depends on endpoints used; bulk discounts available |
| CoreLogic | $0.50 - $5.00+ per call | Enterprise pricing; high minimums |
| Estated (via ATTOM) | $0.03 - $0.20 per call (historical) | Was cheapest option; now folded into ATTOM |
| HouseCanary | $0.10 - $1.00 per call | Tiered plans |
| Precisely | Custom | Typically bundled with other services |

---

## 3. Zillow / Redfin / Realtor.com / MLS Data Access

### Zillow

- **Current state**: Zillow deprecated its public API years ago. Data access is now through the [Zillow Bridge API](https://www.bridgeinteractive.com/developers/bridge-api/), which is **invite-only** and requires formal partnership.
- **What's available**: MLS listings, Zestimates, public records (via partner access through Bridge Interactive).
- **Can a startup get access?**: Difficult. Zillow states they "do not have the resources necessary to discuss more involved partnerships with API Network Members at this time." Access to data is at the discretion of individual MLS partners.
- **Requirements**: Create account on Bridge Interactive Platform, agree to Zillow Data Terms of Use, request access. Many public endpoints have been discontinued; most access requires enterprise contracts.
- **Recommendation**: **Not a viable path for a startup.** Use property data aggregators instead.

### Redfin

- **API**: No official public API for property data. Redfin operates as a tech-first brokerage with direct MLS access in 100+ markets.
- **Data licensing**: Redfin partnered with Constellation Data Labs for MLS data delivery. Licensing available but oriented toward real estate professionals.
- **Downloadable data**: Redfin provides free [housing market data downloads](https://www.redfin.com/news/data-center/) (home prices, sales, inventory, days on market) -- useful for market analysis but not individual property lookups.
- **Scraping**: Redfin's Terms of Use prohibit scraping. Legal risk is real.
- **Recommendation**: **Not viable for property-level data enrichment.**

### Realtor.com

- **API**: The Connections Plus API exists but is focused on lead generation for real estate professionals, not property data access.
- **Requirements**: Valid real estate license or established tech provider status. OAuth 2.0 authentication. Must comply with MLS display guidelines.
- **Recommendation**: **Not relevant for insurance data enrichment.**

### MLS Data Access (Direct)

- **RESO Web API**: The industry standard for MLS data access. Access is granted through individual MLSs after signing licensing agreements.
- **Requirements**: Must sign a Listing Content Licensing Agreement (LCLA) with each MLS. Data cannot be used for internal business purposes except as specified. Technology companies need proper licensing. Monthly vendor fees + per-request fees.
- **Tiered Vendor Access Program**: Some MLSs support small vendors serving 1-2 clients who don't need real-time data.
- **Migration**: RETS (legacy) is being sunset; migration to RESO Web API recommended before June 30, 2025.
- **Recommendation**: **Overkill for insurance.** MLS data is optimized for active listings, not property characteristics. Assessor data / aggregator APIs give us what we need.

### Bottom Line

None of these consumer real estate platforms are practical data sources for insurance quote enrichment. Property data aggregators (Section 2) are the right tool.

---

## 4. Satellite Imagery / Geospatial AI for Property

These vendors use aerial/satellite imagery + AI to extract property attributes that assessor data often lacks -- especially roof condition, roof age, and hazard indicators.

### Comparison Table

| Feature | Cape Analytics | Betterview (by Nearmap) | Nearmap | EagleView |
|---|---|---|---|---|
| **Property Attributes Detected** | 120+ attributes: roof condition/age/material/geometry, solar panels, pool, tree overhang, stories, lot debris, vegetation encroachment, paved area quality | Roof condition scores, roof age, roof characteristics, maintenance indicators, property change monitoring | High-res aerial imagery + AI analytics: roof age (95% accuracy on replacement year), property condition, 250+ insurance carrier customers | Roof measurements (98.77% accuracy), roof age, pitch, heights, condition, structure identification, solar suitability. 60+ PB of asset data. |
| **Coverage** | 100M+ US buildings; also Canada, Australia | US coverage via Nearmap imagery + permit records + assessor records + climate data | 94% of US population. 3B+ image library | 94% of US population. 3B+ image library. |
| **Insurance Relevance** | **Very High**. Roof Condition Rating approved for ratemaking in 39+ US states. Used by half of top property insurers. DOI-approved rate filings include Cape attributes. | **Very High**. Platform designed for P&C insurance. Integrated with Guidewire PolicyCenter (Oct 2025). Claims dataset training. | **Very High**. 7 of top 10 US insurers by DWP are customers. Portfolio-level risk analysis (launched March 2025). | **Very High**. Property and casualty insurers use for claims processing. Integrated with Verisk Xactimate. |
| **Pricing Model** | Enterprise; per-property or subscription. Not publicly disclosed. | Enterprise; per-property, API, or platform access. Not publicly disclosed. | Enterprise subscription. Not publicly disclosed. | Per-report or subscription. Reports ~$15-40 for roofing; insurance pricing varies. |
| **Integration** | API + batch data delivery | API, platform UI, CSV/Excel upload, Guidewire integration | API + platform | API + batch processing |
| **Accuracy vs. Assessor Data** | Complementary. Cape detects attributes assessors don't track (roof condition, vegetation, debris). Roof age often more accurate than assessor records since assessors don't track reroofing. | Complementary. Multi-source approach (imagery + permits + assessor) gives more complete picture than any single source. | Roof Age Gen2 (Oct 2025) uses multiple sources for 95% accuracy on exact replacement year. | Roof measurements validated at 98.77% accuracy against independent benchmarks. |

### Key Insights

1. **Roof condition/age is the highest-value attribute** from aerial imagery. Assessors rarely track reroofing, so a home built in 1980 with a 2020 roof replacement shows "1980" in assessor data but accurate roof age from Cape/Betterview/Nearmap.

2. **Cape Analytics is the leader for insurance-specific use cases** -- DOI-approved for ratemaking in 39+ states, used by 50% of top property insurers.

3. **Betterview + Nearmap merged** (Nearmap acquired Betterview in 2023). The combined offering is powerful: Nearmap imagery + Betterview AI = full lifecycle property intelligence.

4. **EagleView** is strongest for detailed roof measurements and 3D modeling, primarily used for claims and roofing contractors. Less focused on underwriting/quoting.

5. **For a startup**: Cape Analytics or Betterview/Nearmap would be the most relevant. Expect enterprise sales cycles and pricing. Likely $0.50-$5.00+ per property lookup depending on volume and attributes requested.

### Recommendation

- **Tier 2-3 priority**: These are valuable but expensive. Start with assessor data + aggregator API for structural fields. Layer in aerial imagery data when you have enough quote volume to justify the cost and when you need roof condition for underwriting refinement.

---

## 5. FEMA Flood Zone Data

### FEMA National Flood Hazard Layer (NFHL)

- **Availability**: **Free and publicly accessible**
- **Official endpoint**: `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer` (ArcGIS REST service)
- **How it works**: Query by geographic coordinates (point-in-polygon) against the S_Fld_Haz_Ar (Special Flood Hazard Areas) layer.

### Fields Returned

| Field | Description |
|---|---|
| `FLD_ZONE` | Flood zone designation (A, AE, AH, AO, V, VE, X, D, etc.) |
| `ZONE_SUBTY` | Zone subtype (additional classification) |
| `STATIC_BFE` | Static Base Flood Elevation (where applicable) |
| `SFHA_TF` | Whether the area is in a Special Flood Hazard Area (True/False) |
| `FLOODWAY` | Floodway designation |
| `STUDY_TYP` | Type of flood study |
| `SOURCE_CIT` | Source citation for the data |

### Access Details

- **Cost**: Free (no API key required for the public ArcGIS REST endpoint)
- **Rate limits**: MaxRecordCount of 2,000 per query. No documented rate limit on queries per second for the public endpoint, but standard ArcGIS server throttling applies.
- **Data format**: JSON, GeoJSON, PBF
- **Coverage**: Nationwide. Updated as new Flood Insurance Rate Maps (FIRMs) are published.
- **Freshness**: Varies by community. Some maps are decades old; others recently updated.

### Complementary Flood Data Sources

| Source | Type | Cost | Notes |
|---|---|---|---|
| **National Flood Data (nationalflooddata.com)** | Commercial API wrapping FEMA + enhanced data | Paid (API key required). Rate limit: 4 req/sec, burst of 3. | Adds distance to nearest water body, enhanced flood risk scoring. |
| **First Street Foundation / Risk Factor** | Flood risk scores (past, present, future projections) | Free consumer access; API licensing for commercial use | Forward-looking climate risk projections. Used by Realtor.com, Redfin. |
| **USGS StreamStats** | Watershed analysis, flood frequency | Free | More technical; useful for advanced flood modeling. |

### Recommendation

- **FEMA NFHL is Tier 1**: Free, comprehensive, and standard in the industry. Query by lat/lon after geocoding the address.
- **First Street Foundation / Risk Factor**: Consider as a Tier 2 add-on for forward-looking flood risk (climate change projections). Increasingly important for underwriting.

---

## 6. Wildfire Risk Data

### California

- **CAL FIRE Fire Hazard Severity Zones (FHSZ)**
  - **Classification**: Moderate, High, Very High
  - **2025 update**: Major update released in phases (Feb-March 2025) -- first comprehensive revision since 2007 for Local Responsibility Areas.
  - **Data access**: GIS data available on a countywide basis from OSFM (Office of the State Fire Marshal). Online map viewer allows address lookup.
  - **API**: No dedicated REST API. Data available as GIS shapefiles for download. Can host as your own map service or use ArcGIS Online.
  - **Recommendation**: Download shapefiles and build a point-in-polygon lookup service.

### Texas

- **Texas Wildfire Risk Assessment Portal (TxWRAP)**
  - Created by Texas A&M Forest Service
  - **Data**: Fine 10-meter resolution wildfire hazard data generated from high-resolution satellite imagery
  - **Layers**: Wildfire threat, wildland-urban interface, surface fuels, historic ignitions, fire behavior
  - **Access**: Web-based explorer at [texaswildfirerisk.com](https://texaswildfirerisk.com/). GIS data downloadable.
  - **API**: No documented public API. Data is raster-based (10m resolution).

### Ohio

- **Low wildfire risk state overall.**
- No state-specific wildfire risk portal found.
- [Southern Wildfire Risk Assessment Portal (SouthWRAP)](https://southernwildfirerisk.com/) covers 13 southern states but does NOT include Ohio.
- USFS Wildfire Risk to Communities (see below) provides national coverage including Ohio.

### Florida

- **Florida Wildland Fire Risk Assessment System (FRAS)**
  - Maintained by Florida Department of Agriculture and Consumer Services (FDACS)
  - GIS-based system for mitigation planning and fuel reduction
  - **Access**: Available via the Florida Forest Service
- **SouthWRAP**: Florida is included in the 13-state Southern Wildfire Risk Assessment Portal
- Florida's peatlands in some areas are especially vulnerable to wildfires.

### National / Commercial Sources

| Source | Coverage | Cost | API | Key Feature |
|---|---|---|---|---|
| **USFS Wildfire Risk to Communities** ([wildfirerisk.org](https://wildfirerisk.org/)) | All US | **Free** | No dedicated API; downloadable data (spreadsheets + GIS) | Risk to homes, wildfire likelihood, exposure types. USDA Forest Service. 2024 version uses LANDFIRE 2020 data. |
| **Zesty.ai Z-FIRE** | 100% of US properties | Enterprise pricing (per-property) | Yes - API integration for real-time quoting | AI-driven, property-level wildfire risk scores. **Filing-ready in California** (PRID process). Approved in 6+ state rate filings. Integrates into quoting workflows. |
| **Cape Analytics** | 100M+ US buildings | Enterprise pricing | Yes - API + batch | Vegetation encroachment, defensible space, wildfire exposure. |
| **Verisk FireLine** | Nationwide | Enterprise (Verisk subscription) | Yes | Industry standard wildfire risk scoring. 7 risk classes. Used by most major carriers. |

### Recommendation

- **Tier 1**: USFS Wildfire Risk to Communities (free, national, downloadable). Build a lookup service from their data.
- **Tier 1 for CA**: CAL FIRE FHSZ shapefiles (free, recently updated, CA-specific).
- **Tier 2**: Zesty.ai Z-FIRE -- if you need property-level wildfire scoring for underwriting. Already filing-ready in CA, which is critical given CA wildfire exposure.
- **Tier 3**: Verisk FireLine (industry standard but expensive).

---

## 7. Fire Protection / Distance Calculations

### Fire Station Location Data

| Source | Coverage | Cost | Format | Notes |
|---|---|---|---|---|
| **USFA National Fire Department Registry** | 27,000+ US fire departments | **Free** | Downloadable at [apps.usfa.fema.gov/registry/download](https://apps.usfa.fema.gov/registry/download) | Includes department name, address, type, state. May need geocoding. **NFIRS will sunset Feb 2026, transitioning to NERIS.** |
| **OpenStreetMap** | Global, community-maintained | **Free** (ODbL license) | Extractable via Overpass API or bulk download | Fire stations tagged as `amenity=fire_station`. Quality varies by area. Good in urban areas, spotty in rural. |
| **Kaggle: US Fire Department Stations** | US-wide | **Free** | CSV/dataset | Community-curated dataset based on USFA and other sources. |
| **NFPA** | Reference data | Paid/membership | Reports | Standards organization; not a primary data source for station locations. |

### Distance to Nearest Fire Station Calculation

**Recommended approach**:
1. Download USFA registry + geocode all stations (one-time batch job)
2. Store in a spatial database (PostGIS)
3. For each property address: geocode the address, then calculate the straight-line distance to nearest fire station
4. For road distance: use Google Distance Matrix API or cheaper alternative

**Distance API pricing**:

| Provider | Cost per Calculation | Free Tier | Notes |
|---|---|---|---|
| **Google Distance Matrix API** | $5.00 per 1,000 elements | 10,000 free/month (Essentials tier, post-March 2025) | Max 25 origins/destinations per request. 60K elements/min. Now marked "Legacy". |
| **Mapbox Directions API** | $0.50 per 1,000 requests | 100,000 free requests/month | More cost-effective than Google for high volume. |
| **HERE Routing API** | ~$0.50 per 1,000 requests | 250,000 free transactions/month | Used by automotive industry. Generous free tier. |
| **OSRM (Open Source)** | Free (self-hosted) | Unlimited | Uses OpenStreetMap data. Requires server infrastructure. Best for high volume. |

### Fire Hydrant Proximity Data

- **No national database exists.** Fire hydrant data is maintained at the municipal level.
- **OpenStreetMap**: Hydrants tagged as `emergency=fire_hydrant`. Coverage is inconsistent -- good in some cities (LA County has 118,676 mapped), poor in others.
- **Municipal open data portals**: Some cities publish hydrant data (Baltimore, DC, Boise, etc.). Must be aggregated city by city.
- **Recommendation**: This is a **Tier 3** data point. The cost of aggregating hydrant data across all target markets exceeds the value for quoting. Most carriers use ISO PPC class instead.

### ISO Protection Class (PPC) Lookup

- **Owner**: Verisk (ISO)
- **What it is**: A 1-10 rating of a community's fire protection capability. Used by virtually all carriers in homeowners pricing.
- **Public access**: **No free public API.** ISO does not make PPC data available to the general public -- only to insurance industry subscribers.
- **Workarounds**:
  - Contact ISO at 1-800-444-4554 (option 2) for individual lookups
  - Some local fire departments and city websites publish their PPC rating
  - Some state insurance departments publish PPC data
- **Subscription**: Verisk's Location Intelligence products provide PPC lookup by address
- **Recommendation**: **Tier 2 -- must subscribe to Verisk or find an alternative.** PPC is essential for homeowners rating. If you use a carrier's rating engine, PPC is typically built in. If building your own, Verisk subscription is required.

---

## 8. NHTSA VIN Decoder API

### Overview

The NHTSA vPIC (Product Information Catalog and Vehicle Listing) API is a **free, publicly available government API** that decodes Vehicle Identification Numbers (VINs) into vehicle specifications.

### Access Details

| Detail | Value |
|---|---|
| **Cost** | **Free** -- no registration, no API key required |
| **Endpoint** | `https://vpic.nhtsa.dot.gov/api/` |
| **Formats** | JSON, XML, CSV |
| **Rate Limits** | No daily limit. Servers handle 1,000-2,000 transactions/min during normal hours. Automated traffic control applies. Batch processing recommended nights/weekends EST. |
| **Availability** | 24/7 |
| **Current Version** | v3.66 (last code change 11/15/2025) |
| **Registration** | Not required |
| **APIs Available** | 25+ endpoints |

### Fields Returned (130+ Attributes)

The `DecodeVin` and `DecodeVinExtended` endpoints return the following categories of fields:

**Core Vehicle Identification**:
- Make, MakeId, Model, ModelId, ModelYear
- VIN, Manufacturer, ManufacturerId
- Vehicle Type, Body Class

**Specifications**:
- Doors, Windows
- Engine: Cylinders, Displacement (CC, CI, L), Configuration, Horsepower, KW, Manufacturer
- Drive Type (FWD, RWD, AWD, 4WD)
- Transmission: Style, Speeds
- Fuel Type (Primary and Secondary)
- Gross Vehicle Weight Rating (GVWR)
- Curb Weight
- Wheelbase, Track Width
- Bed Length, Bed Type (trucks)

**Safety Features** (insurance-relevant):
- Air Bag Locations (Front, Side, Curtain, Knee)
- Seat Belt Type
- Automatic Emergency Braking (AEB)
- Forward Collision Warning (FCW)
- Lane Departure Warning (LDW)
- Lane Keeping Assistance (LKA)
- Adaptive Cruise Control (ACC)
- Blind Spot Detection
- Electronic Stability Control (ESC)
- Traction Control
- Anti-lock Braking System (ABS)
- Tire Pressure Monitoring System (TPMS)
- Backup Camera
- Parking Assist
- Daytime Running Lights (DRL)
- Automatic Headlights
- Pedestrian Automatic Emergency Braking (PAEB)
- Crash Imminent Braking (CIB)
- Dynamic Brake Support (DBS)

**Manufacturing**:
- Plant City, Plant State, Plant Country, Plant Company Name
- Manufacturer Country

**Classification**:
- Vehicle Type, Body Class
- Engine Type (Electric, ICE, Hybrid, etc.)
- Electrification Level
- EV-related fields (battery info, charger level, range)

### Coverage

- **US-market vehicles**: Comprehensive coverage for vehicles sold in the US
- **Imports**: Covered if they have a valid 17-character VIN
- **Older vehicles**: VINs standardized to 17 characters in 1981. Pre-1981 vehicles may have limited data.
- **Motorcycles, trucks, trailers**: Covered
- **Incomplete/altered VINs**: Returns error codes with partial decoding

### Insurance Relevance

This is extremely valuable for auto quotes. From a VIN alone, we can auto-fill:
- Year, Make, Model, Trim
- Body type, number of doors
- Engine specs (cylinders, displacement, fuel type)
- Safety features (ADAS, airbags, ABS, ESC) -- directly relevant to insurance discounts
- Drive type
- Electric/hybrid status
- GVWR (affects commercial vs. personal classification)

**What it does NOT provide**: Vehicle color, mileage, ownership history, accident history, current market value.

---

## 9. Vehicle Valuation APIs

### Comparison Table

| Feature | KBB (Kelley Blue Book) | Edmunds | NADA / J.D. Power Values | Black Book |
|---|---|---|---|---|
| **API Availability** | Yes - InfoDriver Web Service (IDWS) 4.0 (REST). Currently in pilot with select customers. | **No longer publicly available.** Must be existing Edmunds partner to request access. | Yes - Available via MicroBilt (RapidAPI marketplace) | Yes - Custom Trade Value API, Truck API |
| **Access Requirements** | Contact B2B sales at b2b.kbb.com. Enterprise agreement required. | Existing partner relationship required. Not available to new developers. | Available via MicroBilt; also J.D. Power Values for commercial use | Contact sales; enterprise agreement |
| **Key Fields** | Market value (trade-in, private party, retail), VIN decode, condition adjustment, 5-year cost to own | True Market Value (TMV), True Cost to Own (TCO), vehicle specs. Historical data back to 1990. | Retail, trade-in, and loan values by VIN. Make/model/body style. | Trade value, retail, wholesale. History-adjusted valuation (AutoCheck integration). Real-time transaction data analysis. |
| **Pricing** | Enterprise pricing; not publicly disclosed. Complex, usage-dependent. Self-service via QuickValues.com for individual lookups. | N/A (not available) | Via MicroBilt/RapidAPI -- likely $0.05-$0.50 per call | Enterprise pricing; not publicly disclosed |
| **Update Frequency** | Weekly | N/A | Regularly updated | Continuously (real-time transaction analysis) |
| **Insurance Relevance** | High -- used for coverage limits and total loss valuation | Was high, but no longer accessible | **Highest for insurance** -- J.D. Power Valuation Services (formerly NADA) is the standard for insurance underwriting, claims thresholds, and total loss assessments | High -- used by lenders and insurers for LTV and valuation |
| **Coverage** | US-market new and used vehicles | US-market vehicles | Vehicles, motorcycles, boats, RVs, manufactured homes | New and used cars, trucks, medium/heavy-duty |
| **Best For** | Consumer-facing value estimates | Not available | **Insurance industry standard** for claims and underwriting | Wholesale/dealer-oriented; lending/insurance |

### Other Vehicle Data Sources

| Source | Data Available | Cost | Notes |
|---|---|---|---|
| **Cars.com / AutoTrader / CarGurus** | Listed prices, market comparisons | No official API for valuation data | Scraping prohibited by ToS |
| **Marketcheck API** | VIN decode, pricing, listings | Paid API | Aggregates dealer inventory data |
| **VehicleDatabases.com** | VIN decode, valuation, history | Paid API (alternative to KBB) | Positioned as KBB API alternative |
| **ClearVin** | VIN decode, auction data | Paid | Auction and wholesale data |

### Recommendation

- **Tier 1**: NHTSA VIN Decoder (free, comprehensive specs)
- **Tier 2**: J.D. Power / NADA Values for insurance-standard vehicle valuation. This is what adjusters and underwriters use.
- **Tier 3**: KBB or Black Book for consumer-facing value estimates (if you want to show customers their vehicle's value).
- **Skip**: Edmunds (no longer available).

---

## 10. Address & People Data

### USPS Address Validation

**Critical Change: Legacy Web Tools retired January 25, 2026.**

| Detail | Old (Web Tools) | New (USPS APIs at developers.usps.com) |
|---|---|---|
| **Cost** | Free | Free (for valid shipping/mailing use) |
| **Rate Limit** | Essentially unlimited | **60 calls per hour** (1 per minute) per product |
| **Registration** | Required | Required (OAuth) |
| **Key Capability** | Address standardization, ZIP+4, deliverability | Same capabilities, much lower throughput |
| **Restrictions** | General use permitted | "Only for validating shipping addresses during label generation." Bulk use, batch reporting, mailing list generation prohibited. |
| **Higher Limits** | N/A | Can request but approval is not guaranteed, no documentation on what higher limits are available |

**Impact**: The new 60 calls/hour rate limit makes USPS APIs **unusable for real-time quote enrichment**. A single busy hour of quoting could exceed this.

**Alternatives**:

| Provider | Cost | Free Tier | CASS Certified | Speed | Notes |
|---|---|---|---|---|---|
| **Smarty (fka SmartyStreets)** | Plans from $20/mo (500 lookups) to $1,000/mo (unlimited) | 250 lookups/mo free | Yes | Fast | Also validates 20M+ non-postal addresses USPS doesn't cover. Industry leader for address verification. |
| **Google Address Validation API** | $17 per 1,000 requests | 10,000 free/month (Essentials tier) | No (but high accuracy) | Fast | More expensive than Smarty at scale. |
| **Melissa** | Custom pricing | Free trial | Yes | Fast | Comprehensive data quality suite. Global coverage. |
| **Geocodio** | $0.50 per 1,000 lookups | 2,500 free/day | Not CASS certified | Fast | Cheapest option. Not CASS certified but adequate for address standardization. |
| **Lob** | Included in mail API | N/A | Yes | Fast | Address verification built into mailing platform. |

### Address Autocomplete & Geocoding

| Provider | Autocomplete Cost | Geocoding Cost | Free Tier | Notes |
|---|---|---|---|---|
| **Google Places API (New)** | Session-based: first 12 requests billed per session + Place Details | $5 per 1,000 requests (Geocoding) | 10,000 events/month (Essentials) | Most accurate. Post-March 2025 restructured pricing. Volume discounts 20-80%. |
| **Mapbox** | Session-based (Autofill). Temporary Geocoding: $0.75/1,000 | Permanent: $5/1,000. Temporary: $0.75/1,000 | 100,000 requests/month (temporary geocoding) | **Best free tier.** Note: temporary geocoding results cannot be stored. Permanent geocoding has no free tier. |
| **HERE** | Competitive pricing | ~$0.50/1,000 | 250,000 free transactions/month | **Most generous free tier.** Used by automotive industry. |
| **OpenStreetMap / Nominatim** | N/A (no autocomplete) | Free (self-hosted or limited free API) | Free but rate-limited (1 req/sec on public instance) | Free but requires self-hosting for production. Lower accuracy than commercial options. |

### Recommendation

- **Address Autocomplete**: Start with **Mapbox** or **HERE** for cost efficiency. Switch to Google if accuracy issues arise.
- **Address Validation**: Use **Smarty** -- CASS certified, handles non-postal addresses, reasonable pricing. Do NOT rely on USPS API (too slow now).
- **Geocoding**: **HERE** has the best free tier (250K/month). Mapbox is good for temporary use. Google for highest accuracy.

---

## 11. Prioritized Enrichment Stack

### Tier 1: Free/Cheap, High Accuracy, Easy Implementation, High Field Coverage

These should be implemented first. Maximum value per dollar.

| Data Source | Fields Covered | Cost per Lookup | Implementation Time | Accuracy | Priority |
|---|---|---|---|---|---|
| **NHTSA VIN Decoder** | Year, make, model, trim, body type, engine, safety features (ADAS, airbags), fuel type, drive type, EV status | **Free** | 1-2 days | Very High (government source) | **P0 -- implement immediately** |
| **FEMA NFHL (Flood Zones)** | Flood zone designation, SFHA status, base flood elevation | **Free** | 2-3 days (need geocoding first) | High (official FIRM data) | **P0 -- implement immediately** |
| **USFS Wildfire Risk to Communities** | Wildfire risk score, likelihood, exposure type | **Free** (download + build lookup) | 1 week (data processing + spatial query service) | Medium-High (national model, not property-level) | **P1** |
| **CAL FIRE FHSZ** (CA only) | Fire Hazard Severity Zone (Moderate/High/Very High) | **Free** (download shapefiles) | 3-5 days | High (state regulatory data, 2025 update) | **P0 for CA** |
| **USFA Fire Station Registry** | Nearest fire station distance | **Free** (download + geocode + spatial calc) | 1 week | Medium (depends on geocoding quality; ~27K stations) | **P1** |
| **HERE Geocoding** | Lat/lon, standardized address, ZIP+4 | **Free up to 250K/month** | 1-2 days | High | **P0 -- needed for all spatial lookups** |
| **TX Appraisal District Downloads** (TX only) | Year built, sq ft, bedrooms, baths, assessed value, lot size, construction type | **Free** | 1-2 weeks (ETL from bulk downloads for Harris, Dallas, Tarrant) | Very High (official tax records) | **P0 for TX** |

**Tier 1 Summary**: With $0 in data costs and 3-4 weeks of engineering, we can auto-fill: year/make/model/trim/safety features (auto), flood zone, wildfire risk zone (CA), nearest fire station distance, and full property details for TX. Geocoding enables all spatial queries.

### Tier 2: Moderate Cost, Good Accuracy, Moderate Implementation

| Data Source | Fields Covered | Cost per Lookup | Implementation Time | Accuracy | Priority |
|---|---|---|---|---|---|
| **ATTOM Data API** (property) | Year built, sq ft, bedrooms, baths, construction type, roof type, lot size, assessed value, AVM, foundation, heating, cooling, exterior walls, pool, basement, quality/condition | $0.05 - $0.50 | 2-3 weeks | High (aggregated from 155M+ properties) | **P1 -- primary property data source for all states** |
| **Smarty Address Validation** | Standardized address, deliverability, ZIP+4, county, residential/commercial flag | $0.04 - $0.10 | 1-2 days | Very High (CASS certified) | **P1** |
| **J.D. Power / NADA Valuation** | Vehicle market value (retail, trade-in, loan) | $0.05 - $0.50 | 1-2 weeks | Very High (insurance industry standard) | **P1 for auto** |
| **Mapbox Autofill** | Address autocomplete for quote form | $0.75 per 1,000 sessions | 2-3 days | High | **P1 -- great UX improvement** |
| **Zesty.ai Z-FIRE** (CA priority) | Property-level wildfire risk score | Enterprise pricing (est. $0.50-$2.00/lookup) | 2-4 weeks | Very High (filing-ready in CA) | **P2 for CA** |
| **ISO PPC (via Verisk)** | Fire Protection Class (1-10) | Subscription-based | 2-4 weeks | Very High (industry standard) | **P2** |

**Tier 2 Summary**: ~$500-2,000/month in API costs depending on volume. Adds comprehensive property details nationally, vehicle valuation, and enhanced address/fire protection data. 6-8 weeks of engineering.

### Tier 3: Expensive or Difficult, but Valuable

| Data Source | Fields Covered | Cost per Lookup | Implementation Time | Accuracy | Priority |
|---|---|---|---|---|---|
| **Cape Analytics** | Roof condition rating, roof age, roof material, solar panels, pool, tree overhang, stories, vegetation, defensible space | Enterprise ($1.00-$5.00+/lookup est.) | 4-6 weeks (enterprise sales cycle) | Very High (DOI-approved in 39+ states) | **P3 -- add when underwriting needs roof data** |
| **Betterview / Nearmap** | Similar to Cape + property change monitoring, multi-source roof age | Enterprise | 4-6 weeks | Very High | **P3 -- alternative to Cape** |
| **CoreLogic / Cotality** | Full property data + insurance-specific products (replacement cost, hazard risk) | Enterprise ($10K+/year) | 6-8 weeks | Very High (industry incumbent) | **P3 -- evaluate when scaling** |
| **KBB Valuation** | Consumer-friendly vehicle value | Enterprise | 3-4 weeks | High | **P3 -- add for consumer-facing value display** |
| **First Street Foundation** | Forward-looking flood risk (climate projections) | Licensing required | 3-4 weeks | High (best forward-looking model) | **P3** |
| **EagleView** | Detailed roof measurements, 3D models | Per-report ($15-40+) | 4-6 weeks | Very High (98.77% roof accuracy) | **P3 -- claims-focused** |

### Full Enrichment Coverage Map

This table shows every field on a typical personal home or auto quote, mapped to the best data source for auto-filling it.

#### Personal Homeowners

| Quote Field | Data Source (Tier 1) | Data Source (Tier 2) | Data Source (Tier 3) | Can We Auto-Fill? |
|---|---|---|---|---|
| Property Address | Customer input | Smarty validation | -- | Validated |
| Year Built | TX bulk data | ATTOM | CoreLogic | **Yes** |
| Square Footage | TX bulk data | ATTOM | CoreLogic | **Yes** |
| Bedrooms | TX bulk data | ATTOM | CoreLogic | **Yes** |
| Bathrooms | TX bulk data | ATTOM | CoreLogic | **Yes** |
| Stories | -- | ATTOM | Cape Analytics | **Yes** |
| Construction Type | TX bulk data | ATTOM (construction_type) | CoreLogic | **Yes** |
| Roof Material | -- | ATTOM (roof_material_type) | Cape Analytics | **Yes** |
| Roof Age / Condition | -- | -- | Cape Analytics, Betterview | **Tier 3 only** |
| Foundation Type | -- | ATTOM (foundation_type) | CoreLogic | **Yes** |
| Heating System | -- | ATTOM (heating_type, heating_fuel_type) | CoreLogic | **Yes** |
| Cooling System | -- | ATTOM (air_conditioning_type) | CoreLogic | **Yes** |
| Lot Size | TX bulk data | ATTOM (area_sq_ft, area_acres) | CoreLogic | **Yes** |
| Assessed Value | TX bulk data | ATTOM | CoreLogic | **Yes** |
| Replacement Cost | -- | -- | CoreLogic, carrier tools | **Tier 3** |
| Pool | -- | ATTOM (pool_type) | Cape Analytics | **Yes** |
| Flood Zone | FEMA NFHL | National Flood Data | First Street | **Yes** |
| Wildfire Risk | USFS / CAL FIRE | Zesty.ai | Verisk FireLine | **Yes** |
| Fire Protection Class | -- | Verisk ISO PPC | -- | **Tier 2** |
| Distance to Fire Station | USFA registry + geocoding | Google/Mapbox distance | -- | **Yes** |
| Distance to Fire Hydrant | -- | -- | Municipal data (spotty) | **Difficult** |

#### Personal Auto

| Quote Field | Data Source (Tier 1) | Data Source (Tier 2) | Data Source (Tier 3) | Can We Auto-Fill? |
|---|---|---|---|---|
| VIN | Customer input | -- | -- | Input |
| Year | NHTSA VIN Decoder | -- | -- | **Yes** |
| Make | NHTSA VIN Decoder | -- | -- | **Yes** |
| Model | NHTSA VIN Decoder | -- | -- | **Yes** |
| Trim | NHTSA VIN Decoder | -- | -- | **Yes** |
| Body Type | NHTSA VIN Decoder | -- | -- | **Yes** |
| Engine (cylinders, displacement) | NHTSA VIN Decoder | -- | -- | **Yes** |
| Fuel Type | NHTSA VIN Decoder | -- | -- | **Yes** |
| Drive Type (FWD/AWD/etc.) | NHTSA VIN Decoder | -- | -- | **Yes** |
| Safety Features (ADAS) | NHTSA VIN Decoder | -- | -- | **Yes** |
| Vehicle Value | -- | J.D. Power / NADA | KBB, Black Book | **Yes** |
| Annual Mileage | -- | -- | -- | **Must ask customer** |
| Vehicle Use (commute/pleasure) | -- | -- | -- | **Must ask customer** |
| Garaging Address | Customer input | Smarty validation | -- | Validated |
| Anti-theft Device | NHTSA (partial) | -- | -- | **Partial** |
| EV / Hybrid Status | NHTSA VIN Decoder | -- | -- | **Yes** |

### Estimated Total Per-Quote Enrichment Cost

| Tier | APIs Used | Cost per Home Quote | Cost per Auto Quote |
|---|---|---|---|
| **Tier 1 only** | NHTSA, FEMA, USFS wildfire, HERE geocoding, USFA fire stations | $0.00 - $0.01 | $0.00 |
| **Tier 1 + 2** | Add ATTOM, Smarty, NADA, Mapbox, Zesty (CA) | $0.30 - $1.50 | $0.10 - $0.60 |
| **Tier 1 + 2 + 3** | Add Cape Analytics, CoreLogic, KBB | $2.00 - $7.00 | $0.50 - $1.50 |

### Implementation Roadmap

**Phase 1 (Weeks 1-4): Tier 1 -- Zero-cost foundation**
- Integrate NHTSA VIN Decoder (auto)
- Set up HERE geocoding
- Build FEMA NFHL flood zone lookup
- Download and serve CAL FIRE FHSZ data (CA)
- Download and serve USFS Wildfire Risk data
- Download USFA fire station registry, geocode, build proximity lookup
- ETL TX appraisal district bulk data (Harris, Dallas, Tarrant)

**Phase 2 (Weeks 4-8): Tier 2 -- Core commercial APIs**
- Integrate ATTOM property data API (all states)
- Add Smarty address validation
- Integrate J.D. Power / NADA vehicle valuation
- Add Mapbox Autofill for quote form UX
- Evaluate Zesty.ai Z-FIRE for CA wildfire
- Begin Verisk ISO PPC evaluation

**Phase 3 (Months 3-6): Tier 3 -- Premium enrichment**
- Evaluate Cape Analytics vs Betterview/Nearmap for roof condition
- Consider CoreLogic for replacement cost estimation
- Add KBB for consumer-facing vehicle values
- Evaluate First Street Foundation for forward-looking flood risk

---

## Appendix: Key API Endpoints Reference

| API | Base URL | Auth | Format |
|---|---|---|---|
| NHTSA VIN Decoder | `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json` | None | JSON/XML/CSV |
| FEMA NFHL | `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer` | None | JSON/GeoJSON |
| ATTOM Property | `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail` | API Key | JSON/XML |
| Estated Property | `https://apis.estated.com/v4/property` | API Key | JSON |
| HERE Geocoding | `https://geocode.search.hereapi.com/v1/geocode` | API Key | JSON |
| Mapbox Geocoding | `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json` | Access Token | JSON |
| Smarty US Street | `https://us-street.api.smarty.com/street-address` | Auth ID + Token | JSON |
| USPS Addresses | `https://api.usps.com/addresses/v3/address` | OAuth | JSON |
| Google Address Validation | `https://addressvalidation.googleapis.com/v1:validateAddress` | API Key | JSON |
