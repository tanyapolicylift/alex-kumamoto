#!/usr/bin/env python3
"""
Generate dummy insurance subscribers for testing Klaviyo's segment builder.

Why this exists
---------------
Part of the AR/Klaviyo segment-builder teardown (see ../research_segment_builder_ux.md
and ../changelog.md). We want to rebuild our tier-1 segments (S1-S5 from
../segment_library_poc.md) *inside Klaviyo* and see where its builder strains.

The modeling catch (and itself a teardown finding)
--------------------------------------------------
Klaviyo profiles are FLAT: one row per person/email, no child collections. Our
segments anchor on Policy / Account / Contact and quantify over a customer's
*policies* ("has an active Home with a bundle carrier AND no active Auto"). Klaviyo
can't quantify over a child collection of policies on a profile, so we PRE-FLATTEN
the policy facts onto the profile as boolean/scalar properties (has_auto, has_home,
home_carrier, earliest_renewal_date, ...). That precomputation is exactly the work
AR/our engine does for the user and Klaviyo can't — note it when you compare.

Output: dummy_subscribers.csv  (import into a Klaviyo list; unrecognized columns
become custom profile properties you can segment on).

Reproducible: fixed seed. Stdlib only.
"""

import csv
import json
import random
from datetime import date, timedelta

SEED = 42
N = 150
TODAY = date(2026, 6, 3)  # matches the brainstorm "today"
OUT = "dummy_subscribers.csv"

random.seed(SEED)

FIRST = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda",
         "David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica",
         "Thomas","Sarah","Charles","Karen","Christopher","Nancy","Daniel","Lisa",
         "Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley",
         "Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle",
         "Kenneth","Carol","Kevin","Amanda","Brian","Dorothy","George","Melissa",
         "Edward","Deborah"]
LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
        "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
        "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White",
        "Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young",
        "Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green",
        "Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"]

CITIES = [("Austin","TX","78701"),("Dallas","TX","75201"),("Houston","TX","77002"),
          ("Phoenix","AZ","85004"),("Denver","CO","80202"),("Tampa","FL","33602"),
          ("Columbus","OH","43215"),("Charlotte","NC","28202"),("Nashville","TN","37203"),
          ("Kansas City","MO","64106")]

# Bundle carriers = carriers this agency bundles Home+Auto with (agency-configured;
# S4 cross-sell keys off these). Non-bundle carriers are the rest.
BUNDLE_CARRIERS = ["Nationwide","Travelers","Safeco","Erie"]
NONBUNDLE_CARRIERS = ["Progressive","Geico","Mercury","Dairyland","Allstate"]
ALL_AUTO_CARRIERS = BUNDLE_CARRIERS + NONBUNDLE_CARRIERS
ALL_HOME_CARRIERS = BUNDLE_CARRIERS + ["State Auto","Foremost"]


def iso(d):
    return d.isoformat() if d else ""


def rand_date(start_days_ago, end_days_ago):
    """A date between end_days_ago and start_days_ago before TODAY (positive = past)."""
    delta = random.randint(end_days_ago, start_days_ago)
    return TODAY - timedelta(days=delta)


def rand_future(min_days, max_days):
    return TODAY + timedelta(days=random.randint(min_days, max_days))


def make_profile(i):
    fn = random.choice(FIRST)
    ln = random.choice(LAST)
    city, region, zc = random.choice(CITIES)
    # Unique, obviously-fake, easy to bulk-delete: example.com is RFC-2606 reserved
    # (never routable) and the +klaviyotest tag makes a one-click cleanup filter.
    email = f"{fn.lower()}.{ln.lower()}+klaviyotest{i:03d}@example.com"

    # Account status: mostly active book, some pipeline.
    account_status = random.choices(
        ["active", "lead", "prospect", "dead_file"], weights=[80, 8, 7, 5])[0]

    # Policies (flattened). An active book account usually has >=1 policy.
    has_auto = random.random() < 0.62 and account_status != "lead"
    has_home = random.random() < 0.52 and account_status != "lead"
    # Make sure most active accounts have at least one policy.
    if account_status == "active" and not (has_auto or has_home):
        has_auto = True

    auto_carrier = random.choice(ALL_AUTO_CARRIERS) if has_auto else ""
    home_carrier = random.choice(ALL_HOME_CARRIERS) if has_home else ""

    # Build the customer's policy collection, then flatten it onto the profile.
    # (lobs / carriers are the multi-value "list" properties; the rest are the
    # flattened scalars Klaviyo needs because it can't quantify over this list.)
    lobs, carriers = [], []
    total_premium = 0
    if has_auto:
        lobs.append("Auto"); carriers.append(auto_carrier)
        total_premium += random.randint(900, 2600)
    if has_home:
        lobs.append("Home"); carriers.append(home_carrier)
        total_premium += random.randint(1100, 4200)
    # A few multi-policy households carry an extra umbrella/renters/boat line.
    if lobs and random.random() < 0.15:
        lobs.append(random.choice(["Umbrella", "Renters", "Boat"]))
        carriers.append(random.choice(ALL_AUTO_CARRIERS))
        total_premium += random.randint(300, 1500)
    policy_count = len(lobs)

    # Klaviyo List-typed properties: a stringified array per cell. csv quoting
    # handles the embedded quotes/commas. Empty -> blank (no policies).
    policy_lobs = json.dumps(lobs) if lobs else ""
    carriers_list = json.dumps(sorted(set(carriers))) if carriers else ""

    # Earliest upcoming renewal across active policies. ~16% renew within 30 days.
    earliest_renewal_date = ""
    earliest_renewal_lob = ""
    earliest_renewal_carrier = ""
    if policy_count and account_status == "active":
        soon = random.random() < 0.16
        d = rand_future(1, 30) if soon else rand_future(31, 360)
        # LOB of the soonest-renewing policy.
        choices = []
        if has_auto:
            choices.append(("Auto", auto_carrier))
        if has_home:
            choices.append(("Home", home_carrier))
        lob, carr = random.choice(choices)
        earliest_renewal_date, earliest_renewal_lob, earliest_renewal_carrier = iso(d), lob, carr

    # Flagged policy status (pending cancellation). ~6% of active book.
    flagged_status = ""
    flagged_substatus = ""
    if account_status == "active" and policy_count and random.random() < 0.14:
        flagged_status = "Cancelled (Pending)"
        flagged_substatus = random.choices(
            ["Non-Payment", "Underwriting", "Insured Request"], weights=[70, 18, 12])[0]

    # Last sold date. ~12% sold within the last 14 days (newly-sold), rest spread back.
    if random.random() < 0.12 and account_status in ("active", "prospect"):
        last_sold_date = rand_date(14, 0)
    else:
        last_sold_date = rand_date(1500, 30)

    # NPS: ~45% have responded. Promoters (>=9) are a chunk of those.
    nps_score = ""
    last_nps_date = ""
    if random.random() < 0.45:
        nps_score = random.choices(
            list(range(0, 11)),
            weights=[3,2,2,3,4,6,7,9,12,22,30])[0]  # skews positive, big 9-10 tail
        last_nps_date = iso(rand_date(180, 1))

    return {
        "email": email,
        "first_name": fn,
        "last_name": ln,
        "city": city,
        "region": region,
        "zip": zc,
        "account_status": account_status,
        "total_premium": total_premium,
        "policy_count": policy_count,
        "policy_lobs": policy_lobs,
        "carriers": carriers_list,
        "has_auto": str(has_auto).lower(),
        "has_home": str(has_home).lower(),
        "auto_carrier": auto_carrier,
        "home_carrier": home_carrier,
        "earliest_renewal_date": earliest_renewal_date,
        "earliest_renewal_lob": earliest_renewal_lob,
        "earliest_renewal_carrier": earliest_renewal_carrier,
        "flagged_status": flagged_status,
        "flagged_substatus": flagged_substatus,
        "last_sold_date": iso(last_sold_date),
        "nps_score": nps_score,
        "last_nps_date": last_nps_date,
    }


def main():
    rows = [make_profile(i) for i in range(1, N + 1)]
    fields = list(rows[0].keys())
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    # Report how many rows land in each tier-1 segment, so you know what to expect
    # when you rebuild them in Klaviyo.
    def s1(r):  # Auto policies renewing in 30 days (active)
        return (r["earliest_renewal_lob"] == "Auto"
                and r["earliest_renewal_date"]
                and date.fromisoformat(r["earliest_renewal_date"]) <= TODAY + timedelta(days=30)
                and r["account_status"] == "active")

    def s2(r):  # Pending cancellation - non-payment
        return r["flagged_status"] == "Cancelled (Pending)" and r["flagged_substatus"] == "Non-Payment"

    def s3(r):  # Newly sold - last 14 days
        return bool(r["last_sold_date"]) and date.fromisoformat(r["last_sold_date"]) >= TODAY - timedelta(days=14)

    def s4(r):  # Home (bundle carrier) without Auto
        return r["has_home"] == "true" and r["home_carrier"] in BUNDLE_CARRIERS and r["has_auto"] == "false"

    def s5(r):  # NPS promoters (9+)
        return r["nps_score"] != "" and int(r["nps_score"]) >= 9

    print(f"Wrote {len(rows)} rows to {OUT}\n")
    print("Expected segment counts (rebuild these in Klaviyo and compare):")
    print(f"  S1  Auto renewing in 30 days (active) : {sum(map(s1, rows))}")
    print(f"  S2  Pending cancel - non-payment      : {sum(map(s2, rows))}")
    print(f"  S3  Newly sold - last 14 days         : {sum(map(s3, rows))}")
    print(f"  S4  Home (bundle) without Auto        : {sum(map(s4, rows))}")
    print(f"  S5  NPS promoters (9+)                : {sum(map(s5, rows))}")


if __name__ == "__main__":
    main()
