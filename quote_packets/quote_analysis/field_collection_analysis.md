# Quote Data Collection Analysis: What We Capture vs What PL Rater Needs

**Date:** 2026-02-11
**Dataset:** 30 days of quote conversations (calls + chats), excluding test agencies
**Source:** `calls.csv` (100 rows), `chats.csv` (21 rows)

---

## Executive Summary

Our AI agents (voice + chat) successfully collect **contact info and basic intent** in most conversations, but **rarely collect enough structured data to auto-fill a PL Rater quote**. The gap is enormous for both auto and home:

- **Personal Auto**: We capture ~14 fields. PL Rater needs ~40+. We reliably get name + phone. We get vehicle details and DOB roughly **40-65% of the time**. We almost never get address, marital status, coverage preferences, annual mileage, or household driver details.
- **Personal Homeowners**: We capture ~14 fields. PL Rater needs ~50+. We get name + phone reliably. Property details (sqft, year built, roof, stories) come in **~33% of the time**. We never get construction type, foundation, safety systems, coverage limits, update history, or fire protection info.
- **Scores are very low**: On a 0-5 scale, the mean across all conversations is ~3. Almost no conversations reach score 5.

---

## 1. Dataset Overview

### Volume by Channel

| Channel | Total Rows | Quote-Intent Only |
|---------|-----------|-------------------|
| Calls (voice) | 100 | Yes (filtered) |
| Chats (web) | 21 | Yes (filtered) |
| **Total** | **121** | |

### Volume by Insurance Type (Calls)

| Type | Count | % of Calls |
|------|-------|------------|
| personal_auto | 34 | 34% |
| unknown (couldn't determine type) | 25 | 25% |
| personal_homeowners | 12 | 12% |
| commercial_general_liability | 7 | 7% |
| personal_renters | 6 | 6% |
| commercial_auto | 4 | 4% |
| commercial_property | 3 | 3% |
| personal_life | 2 | 2% |
| commercial_workers_comp | 2 | 2% |
| commercial_bop | 2 | 2% |
| personal_pet | 1 | 1% |
| personal_boat | 1 | 1% |
| personal_umbrella | 1 | 1% |

### Volume by Insurance Type (Chats)

| Type | Count | % of Chats |
|------|-------|------------|
| unknown | 10 | 48% |
| personal_auto | 3 | 14% |
| personal_homeowners | 3 | 14% |
| commercial_workers_comp | 2 | 10% |
| commercial_bop | 1 | 5% |
| personal_flood | 1 | 5% |
| personal_condo | 1 | 5% |

### Score Distribution (Calls)

| Score | Count | % |
|-------|-------|---|
| 0 | 1 | 1% |
| 1 | 4 | 4% |
| 2 | 36 | 36% |
| 3 | 34 | 34% |
| 4 | 24 | 24% |
| 5 | 1 | 1% |

**Mean: 2.8 | Median: 3 | Only 1% reach score 5**

### Score Distribution (Chats)

| Score | Count | % |
|-------|-------|---|
| 2 | 3 | 14% |
| 3 | 10 | 48% |
| 4 | 7 | 33% |
| 5 | 1 | 5% |

**Mean: 3.3 | Median: 3 | Slightly better than calls**

---

## 2. Personal Auto: Field Collection Rates

### What We Collect (Combined Calls + Chats, n=37)

| Field                             | Calls (n=34) | Chats (n=3) | Description                          |
| --------------------------------- | ------------ | ----------- | ------------------------------------ |
| **phoneNumber**                   | **100%**     | 67%         | Always captured on calls (caller ID) |
| **driver** (name string)          | **88%**      | 67%         | Combined driver name                 |
| **firstName**                     | **82%**      | 67%         |                                      |
| **lastName**                      | **85%**      | 67%         |                                      |
| **driverBirthDate**               | **65%**      | 67%         | Collected majority of time           |
| **ownership** (own/finance/lease) | 47%          | 0%          | Under half the time                  |
| **email**                         | 44%          | 67%         | Better on chat                       |
| **claimsHistory**                 | 44%          | 67%         | Usually just "No" as free text       |
| **primaryUse**                    | 44%          | 0%          | Pleasure/commute/business            |
| **vehicleMake**                   | 44%          | 67%         |                                      |
| **vehicleModel**                  | 41%          | 67%         |                                      |
| **vehicleYear**                   | 41%          | 67%         |                                      |
| **licenseNumber**                 | 41%          | 0%          |                                      |
| **vin**                           | **15%**      | 0%          | Very rarely collected                |

### What PL Rater Requires (But We DON'T Collect)

These fields are required or strongly recommended for a successful PL Rater auto quote, but are **completely absent** from our data schema:

| Missing Field | PL Rater Importance | Notes |
|---------------|-------------------|-------|
| **Address / ZIP** | CRITICAL - determines territory rating | We have no address field for auto |
| **Marital status** | HIGH - affects premium significantly | Not in schema |
| **Gender** | HIGH - rating factor (except CA) | Not in schema |
| **SSN** | HIGH (TX) - credit-based scoring | Not in schema |
| **Years licensed / license issue date** | HIGH - Good Driver (CA) | Not in schema |
| **Household drivers (additional)** | HIGH - all drivers must be listed | We only capture primary driver |
| **Annual mileage** | MEDIUM - low mileage discount | Not in schema |
| **Commute distance** | MEDIUM - short commute discount | Not in schema |
| **Garaging address** | MEDIUM - if different from home | Not in schema |
| **Vehicle safety features** | LOW-MED - anti-theft, airbags | Not in schema |
| **Prior insurance carrier** | HIGH - continuous coverage discount | Not in schema for auto |
| **Prior liability limits** | HIGH - affects tier/eligibility | Not in schema |
| **Years continuously insured** | HIGH - lapse = much higher rates | Not in schema |
| **Incidents/violations (structured)** | CRITICAL - tickets, at-fault accidents | Only free-text claimsHistory |
| **Coverage preferences (limits)** | MEDIUM - BI/PD, UM, comp/coll | Not in schema |
| **Deductible preferences** | MEDIUM | Not in schema |
| **Homeownership status** | LOW-MED - multi-policy discount | Not in schema |
| **Education / occupation** | LOW (TX only) | Not in schema |
| **Good student status** | LOW - for young drivers | Not in schema |
| **Assigned driver per vehicle** | LOW-MED - multi-vehicle households | Not in schema |

### Auto Gap Assessment

```
WHAT WE HAVE              vs    WHAT PL RATER NEEDS
─────────────────────────────────────────────────────
Phone          100%   ✅        Phone               ✅
Name            85%   ✅        Name                ✅
DOB             65%   ⚠️        DOB                 ✅
Vehicle Y/M/M   42%   ⚠️        Vehicle Y/M/M/VIN   ✅
VIN             15%   ❌        VIN                 ✅
License #       41%   ⚠️        License #           ✅
Ownership       47%   ⚠️        Address             ❌ MISSING
Email           44%   ⚠️        Marital status      ❌ MISSING
Usage           44%   ⚠️        Gender              ❌ MISSING
Claims (text)   44%   ⚠️        SSN                 ❌ MISSING
                                Annual mileage      ❌ MISSING
                                Commute distance    ❌ MISSING
                                Prior insurance     ❌ MISSING
                                Prior limits        ❌ MISSING
                                Yrs insured         ❌ MISSING
                                Incidents/tickets   ❌ MISSING (structured)
                                Coverage limits     ❌ MISSING
                                Deductibles         ❌ MISSING
                                All HH drivers      ❌ MISSING
                                Homeowner Y/N       ❌ MISSING
```

**Coverage: ~10 of 30+ required fields present. ~14% VIN rate is especially low for the most impactful single auto field.**

---

## 3. Personal Homeowners: Field Collection Rates

### What We Collect (Combined Calls + Chats, n=15)

| Field | Calls (n=12) | Chats (n=3) | Description |
|-------|-------------|-------------|-------------|
| **phoneNumber** | **100%** | 67% | |
| **firstName** | **83%** | 100% | |
| **lastName** | **83%** | 100% | |
| **address** | 58% | 67% | Property address |
| **claimsHistory** | 50% | 67% | Free-text strings in array |
| **currentInsurer** | 33% | 67% | |
| **hasMortgage** | 33% | 0% | |
| **occupancyType** | 33% | 0% | owner-occupied, renter, etc. |
| **roofAge** | 33% | 33% | |
| **roofType** | 33% | 67% | |
| **squareFootage** | 33% | 67% | |
| **stories** | 33% | 67% | |
| **yearBuilt** | 33% | 67% | |
| **email** | 25% | 67% | |

### What PL Rater Requires (But We DON'T Collect)

| Missing Field | PL Rater Importance | Notes |
|---------------|-------------------|-------|
| **Construction type** (frame, masonry) | CRITICAL - replacement cost | Not in schema |
| **Exterior wall material** | HIGH - fire resistance rating | Not in schema |
| **Foundation type** (slab, crawl, basement) | HIGH - replacement cost | Not in schema |
| **Bedrooms / bathrooms** | MEDIUM - replacement cost | Not in schema |
| **Fireplaces** | MEDIUM - replacement cost + fire risk | Not in schema |
| **Garage (type, size)** | MEDIUM - replacement cost | Not in schema |
| **Roof material** (shingle, tile, metal) | HIGH - roofType captured but not always material | Partial |
| **Electrical update year** | HIGH for older homes - eligibility | Not in schema |
| **Plumbing update year** | HIGH for older homes - eligibility | Not in schema |
| **HVAC type and update year** | MEDIUM - eligibility for old homes | Not in schema |
| **Water heater age** | LOW-MED | Not in schema |
| **Security system** | MEDIUM - 5% discount | Not in schema |
| **Smoke detectors / fire alarms** | LOW (assumed yes) | Not in schema |
| **Fire sprinklers** | MEDIUM - discount | Not in schema |
| **Swimming pool** | HIGH - liability concern | Not in schema |
| **Dogs / pet breeds** | HIGH - liability underwriting | Not in schema |
| **Business use on premises** | HIGH - eligibility factor | Not in schema |
| **Distance to fire station** | HIGH - protection class | Not in schema |
| **Distance to fire hydrant** | HIGH - protection class | Not in schema |
| **Dwelling coverage (Cov A)** | CRITICAL - the insured amount | Not in schema |
| **Liability limit** | MEDIUM | Not in schema |
| **Deductible preference** | MEDIUM | Not in schema |
| **Wind/hail deductible** (TX) | HIGH in TX | Not in schema |
| **Prior claims (structured)** | HIGH - date, type, amount | Only free-text |
| **DOB / SSN** | MEDIUM-HIGH | Not in schema |

### Home Gap Assessment

```
WHAT WE HAVE              vs    WHAT PL RATER NEEDS
─────────────────────────────────────────────────────
Phone          100%   ✅        Phone               ✅
Name            83%   ✅        Name                ✅
Address         58%   ⚠️        Address             ✅
Claims (text)   50%   ⚠️        Year built          ✅
Year built      33%   ⚠️        Sq footage          ✅
Sq footage      33%   ⚠️        Roof age            ✅
Roof type       33%   ⚠️        Roof material       ✅
Roof age        33%   ⚠️        Stories             ✅
Stories         33%   ⚠️        Occupancy           ✅
Occupancy       33%   ⚠️        Construction type   ❌ MISSING
Curr insurer    33%   ⚠️        Foundation          ❌ MISSING
Mortgage Y/N    33%   ⚠️        Exterior walls      ❌ MISSING
                                Bedrooms/baths      ❌ MISSING
                                Garage              ❌ MISSING
                                Electrical update   ❌ MISSING
                                Plumbing update     ❌ MISSING
                                HVAC                ❌ MISSING
                                Security system     ❌ MISSING
                                Pool/trampoline     ❌ MISSING
                                Dog breeds          ❌ MISSING
                                Business use        ❌ MISSING
                                Fire station dist   ❌ MISSING
                                Hydrant distance    ❌ MISSING
                                Dwelling coverage   ❌ MISSING
                                Liability limit     ❌ MISSING
                                Deductible          ❌ MISSING
                                Wind/hail ded (TX)  ❌ MISSING
                                Prior claims (str)  ❌ (only text)
```

**Coverage: ~12 of 40+ required fields present, and even those are only populated ~33% of the time.**

---

## 4. Key Observations

### Collection Rate Tiers

**Tier 1 - Almost Always Collected (>80%)**
- Phone number (100% on calls via caller ID)
- First name (~83%)
- Last name (~85%)

**Tier 2 - Majority Collected (50-80%)**
- Driver DOB (65% auto)
- Address (58% home)
- Claims history as free text (~50%)

**Tier 3 - Inconsistent (<50%)**
- Vehicle year/make/model (~42%)
- Email (~44%)
- License number (~41%)
- All home property details (~33%)
- Current insurer (~33%)

**Tier 4 - Rarely or Never**
- VIN (15%)
- Everything else PL Rater needs (0%)

### The "Unknown" Problem

- **25% of calls** (25/100) and **48% of chats** (10/21) end with `type=unknown`
- These conversations only capture `{firstName, lastName, email, phoneNumber}` — the bare minimum schema
- This means the AI agent couldn't even determine what kind of insurance the person wanted
- On calls, "unknown" conversations have very low contact info fill: only 24% first name, 8% last name, 0% email (phone is 100% from caller ID)

### Claims History is Free-Text, Not Structured

When we do capture claims history, it's stored as an array of free-text strings like:
- `["No."]`
- `["accident, someone else at fault, year unknown"]`
- `["Roof hit by a tree, roof replaced, two years ago, $12,000"]`

PL Rater needs **structured** incident data: date, type (at-fault/not-at-fault/comp), amount, and specific violation types for each incident. Our free-text capture would need NLP parsing to be usable.

### Chats Collect Slightly Better Per-Field (But Far Fewer Total)

Chat sessions show higher per-field collection rates on the fields that ARE in the schema (e.g., 67% for vehicle details vs 42% on calls). However, chat volume is only 21% of calls (21 vs 100), and 48% of chats end as "unknown" type. Chat's advantage may come from users being more willing to type structured info.

### The Score Problem

Scores cluster at 2-3 out of 5, meaning **conversations are ending before significant data collection**. This could indicate:
- Callers hanging up early / short attention spans
- The AI agent not being aggressive enough about collecting data
- Callers who just want a callback, not a full intake
- Mismatch between caller expectations and agent behavior

---

## 5. What This Means for PL Rater Auto-Fill

### Current State: We can pre-fill ~15-25% of a PL Rater quote

For the best conversations (score 4-5), we might populate:
- **Auto**: Name, phone, DOB, vehicle Y/M/M, maybe license # and usage = ~6-8 of 30+ fields
- **Home**: Name, phone, address, year built, sqft, roof info, stories = ~7-8 of 40+ fields

For the median conversation (score 2-3), we populate:
- **Auto**: Name and phone only = 2 of 30+ fields
- **Home**: Name and phone only = 2 of 40+ fields

### Critical Missing Categories (Things We Never Collect)

1. **Address for auto** - Without this, we can't even determine rating territory
2. **All coverage/limit preferences** - No liability limits, deductibles, comp/collision choices
3. **Prior insurance details** - No carrier, limits, years insured, lapses
4. **Household composition** - Additional drivers, spouse, teens
5. **Property construction details** - Construction type, foundation, walls, updates
6. **Safety/risk factors** - Pool, dogs, business use, fire protection
7. **SSN / credit info** - Required for TX rating

### Implication for the Auto-Cycle Project

To get from "AI intake" to "auto-submit to PL Rater," we need to either:

1. **Dramatically expand the conversational data collection** - Make the AI ask 30-50 questions per call (likely impractical for a phone call)
2. **Use data enrichment APIs** to fill gaps from minimal inputs (address + name + DOB can unlock a lot via Fenris, LexisNexis, etc.)
3. **Hybrid approach**: Collect the "conversational" fields (name, DOB, vehicle, address, claims) via AI, then use enrichment for the "lookup" fields (prior insurance, driving record, property details, credit), and use a smart form/portal for the "preference" fields (coverage limits, deductibles)
4. **Accept partial pre-fill** and have the producer complete the rest manually, reducing but not eliminating their work

The data strongly suggests **option 3** is the right path — our AI agents are good at the conversational intake (name, DOB, vehicle basics, yes/no claims), but the 60-70% of PL Rater fields that are "lookup" or "preference" data won't come from a phone call.

---

## Appendix: Raw Field Schemas by Type

### Personal Auto Schema (14 fields)
```
claimsHistory, driver, driverBirthDate, email, firstName,
lastName, licenseNumber, ownership, phoneNumber, primaryUse,
vehicleMake, vehicleModel, vehicleYear, vin
```

### Personal Homeowners Schema (14 fields)
```
address, claimsHistory, currentInsurer, email, firstName,
hasMortgage, lastName, occupancyType, phoneNumber, roofAge,
roofType, squareFootage, stories, yearBuilt
```

### Unknown / Fallback Schema (4 fields)
```
email, firstName, lastName, phoneNumber
```
