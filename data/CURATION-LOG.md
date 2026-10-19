# Curation log

Changes to the normalization table that are not obvious from the diff, and the
doubts that remain. Newest first. Ownership claims cite their sources in the YAML.

## 2026-10-18: reconciliation of the three initial curation passes

Three curators (US majors, brands from FDA CVM recalls 2016-2026, Canada) wrote
`data/` at the same time. `npm run validate:data` passed for all of them; this pass
looked for the problems the validator cannot see.

### Checks run

- Brand-name containment and standalone-alias overlap across brands. Only expected
  overlaps remain: `purina-pro-plan` inside `purina-pro-plan-veterinary-diets`,
  `healthy-hide` inside `good-n-fit`/`good-n-fun` labels, `whiskas` inside
  `whiskas temptations`, `wellness` inside `nutram sound balanced wellness`. The
  matcher takes the longest alias, and each pair is checked by the fixtures.
- Parent alias collisions across parents: none.
- Brand firm names that match a different parent: none.
- Parents without brands: none.
- Fictional mockup brands from the design files: none (the loader and test/scaffold.test.ts reject them).
- Every standalone alias made only of dictionary words, checked against the
  2016-2026 CVM product descriptions.

### Changes

**Ids made consistent** (nothing has shipped, so renaming was safe):
- Parent `consumers-supply` is now `consumers-supply-distributing`, the same id as
  its manufacturer entry.
- Manufacturer `texas-farm-products` is now `tfp-nutrition`, the same id as its
  parent entry.
- Where a company is both a brand owner (parent) and a contract maker (manufacturer)
  it now has one id in both places: diamond-pet-foods, jm-smucker, sunshine-mills,
  elmira-pet-products, euro-can-manufacturing, consumers-supply-distributing and
  tfp-nutrition.

**Generic brand names.** The brand `name` is always a standalone alias, so several
curator comments that said "the bare name is weak" were not true in practice. These
names are now qualified, and only label forms identify the brand:
- `evolve`: Evolve (Sunshine Mills)
- `triumph`: Triumph (Sunshine Mills); added label "Triumph Wild Spirit".
- `smokehouse`: Smokehouse (Smokehouse Pet Products); added "Smokehouse Brand".
- `smalls`: Smalls (cat food); added "Smalls Diamond Dust".
- `petco-brand`: Petco (store brand). Bare "Petco" also appears in "sold at Petco"
  text. Added "Petco Classic Rawhide" and "Petco Granulated Rawhide".
- `primal`: Primal Pet Foods. Bare "Primal" is common in product copy. Added
  "Primal Formula", "Primal Patties", "Primal Freeze-Dried" and "Primal Raw".
- `performance-dog`: Performance Dog (Bravo Packing). "Performance dog food" is a
  generic phrase: "Sprout Ultra High Performance Dog Food" would have matched it.
  Added "Performance Dog Patties", "Performance Dog Raw" and "Performance Dog Frozen
  Raw". The line formerly named "Performance Dog" is now "Patties".

**Label aliases added for real recall text that only matched through the firm or
not at all** (all are from FDA iRES event 77441 or 76403 unless noted):
- Pet Pride: "Pet Pride". All 11 CVM occurrences are this brand.
- Companion: "Companion Natural Rawhide", "Companion Rawhide", "Companion Chicken
  Flavored Rawhide" and "Companion Peanut Butter Rawhide".
- Priority: "Priority Knotted Rawhide", "Priority Large Rawhide", "Priority Medium
  Assorted Rawhide" and "Priority Munchy Strips".
- Always Save: "Always Save".
- Dentley's: "Dentley" (event 79164).
- Sportsman's Pride: "Sportman's Pride", a misspelling found in event 88031.

**Fixes found by the fixtures:**
- `gravy-train/wet`: added the canned variety names "With Lamb & Rice Chunks", "With
  Beef Chunks" and "With Chicken Chunks" (event 79291).
- `wellness/complete-health`: added "Beef & Chicken Formula", the 2017 canned pâté
  (events 76403 and 76616).
- `doctors-foster-and-smith`: added line `chicken-and-brown-rice` (discontinued).
- `heartland-harvest/biscuits`: added "Biscuits".

**New brands:**
- `pup-peroni` (J.M. Smucker). Smucker kept it in the 2023 sale to Post. This fixes
  the only pet-food classification false negative (event 88480).
- `castor-and-pollux` (Nestlé Purina, through Merrick). Event 80152.
- `special-kitty` (Walmart store brand, made by Smucker). Events 76151 and 84423.
- `wild-harvest` (UNFI own brand, made by Sunshine Mills). Event 88355.

**Ownership updates:**
- `whitebridge-pet-brands`: notes rewritten, and General Mills' 2024-12-18 closing
  release added (see doubts below).
- `primal`: added the Pure Treats acquisition announcement (Feb 2026) as a second
  source.
- `sunshine-mills`: added the USPTO trademark owner page (CHAMP and FIELD TRIAL are
  Sunshine Mills marks).

### Ownership spot-check (web, 2026-10-18)

| Brand(s) | Parent in data/ | Finding |
| --- | --- | --- |
| Orijen, Acana | mars | Confirmed. Mars closed Champion Petfoods on 2023-02-28. |
| Nom Nom | mars | Confirmed. Mars (Royal Canin) acquired it in Jan 2022. |
| Canidae, Natural Balance | ethos-pet-brands | Confirmed. Merged in 2023; L Catterton and Nexus own 50/50. |
| 9Lives, Kibbles 'n Bits, Gravy Train, Nature's Recipe, Rachael Ray Nutrish | post-holdings | Confirmed. The Smucker sale closed in 2023. |
| Meow Mix, Milk-Bone, Pup-Peroni | jm-smucker | Confirmed. Smucker retained them; no later divestiture found. |
| Milo's Kitchen | jm-smucker | No divestiture found. Whether it is still sold is unverified. |
| Zuke's | nestle-purina | Confirmed. Purina has owned it since Dec 2013 (a 2018 plan merged its operations into Merrick). |
| Instinct | agrolimen | Confirmed. Agrolimen has fully owned Nature's Variety since 2016. |
| Wellness | wellness-pet-company | Confirmed. Clearlake has owned it since Nov 2020; nothing newer found. |
| Solid Gold | health-and-happiness-group | Confirmed. H&H bought it for $163M. |
| Victor | mid-america-pet-food | Confirmed. TA Associates and Rx3 have owned it since Dec 2020. |
| Nulo | nulo | Confirmed. Apax has held a majority stake since 2021. |
| K9 Natural | natural-pet-food-group | Confirmed. KKR bought it in May 2021. |
| ZIWI | ziwi | Only Wikipedia confirms FountainVest. No 2025 sale found. |
| Open Farm | open-farm | Confirmed independent. General Atlantic holds a minority stake; a PetSmart distribution deal followed in June 2026. |
| Primal | pure-treats | Confirmed. Pure Treats bought it from Kinderhook in Feb 2026. |
| Stella & Chewy's | stella-and-chewys | Owner unclear. One PE directory names Stripes; the Symrise claims are spam pages. |
| Good 'n' Fun, Healthy Hide, Good 'n' Fit, Digest-eeze, American Beefhide | spectrum-brands | Confirmed. Still in Spectrum's Global Pet Care segment in FY2026; no sale found. |
| Freshpet | freshpet | Confirmed independent. No takeover found in 2025-2026 filings. |
| Petcurean brands (GO!, Now Fresh, Gather, Summit) | petcurean | Confirmed independent. The 2024 news was about distribution deals only. |
| Horizon | horizon-pet-nutrition | Confirmed. Founder-owned. |
| Vital Essentials | carnivore-meat-company | Confirmed. Arbor Investments invested in 2021 (stake size not disclosed). |
| Northwest Naturals | morasch-meats | Confirmed. The Morasch brothers own it. |
| Smalls | true-pet-food-project | Confirmed independent through 2026. |
| Answers | lystn | Confirmed. Lystn LLC is named as the brand owner in the 2024 recall. |
| Champ, Field Trial | sunshine-mills | Confirmed. USPTO lists Sunshine Mills as the owner. |
| Evolve, Triumph, Sportsman's Pride | sunshine-mills | Confirmed. The Alabama Living profile lists them as Sunshine Mills' consumer brands. |
| Nutrisca, Natural Life | whitebridge-pet-brands | Uncertain; see doubts. |
| Exclusive, Country Acres | land-o-lakes | Not confirmed by any independent source; see doubts. |
| Spot & Tango | breuer-premium-pet-food | Likely. CB Insights files Spot & Tango under "Breuer Premium Pet Food", and the founder is Russell Breuer. |
| Wild Harvest | unfi | Confirmed. It is UNFI's own brand. |

### Remaining doubts

1. **Nutrisca and Natural Life.** General Mills bought Whitebridge's North American
   "cat feeding and pet treating" business: Tiki Pets and Cloud Star, which includes
   Dogswell treats. Nutrisca and Natural Life are dog foods, and no source says
   whether they moved with it. They stay under `whitebridge-pet-brands` (NXMH).
2. **Exclusive, Red Flannel, Country Acres.** Only the brand site and one
   recall-history site point to Land O'Lakes / Purina Animal Nutrition.
3. **Stella & Chewy's.** The equity owner is unknown, so the parent is the operating
   company itself.
4. **ZIWI.** FountainVest ownership rests on Wikipedia only.
5. **Sunshine Mills value brands.** Thrifty, Top Runner, River Bend, Principle, Pet
   Expert, Whiskers & Tails, FRM Gold Select, Old Glory, Hunter's Special, Nature's
   Menu, Heartland Farms, Family Pet and Paws Happy Life are all under sunshine-mills
   without confirmation (the curator's doubt stands). Some may be retailer-owned.
6. **Meridian (Midwestern).** Fixture V-0104-2021 still misses it: the notice prints
   bare "Meridian", which is too generic to be an alias. The row still alerts on the
   other nine Midwestern brands it names. To fix it, either add a firm-scoped alias
   kind to the matcher, or accept "Meridian" as an alias.
7. **Darwin's "Natural Selections ... Meals for Dogs".** These rows match only
   through the Arrow Reliance firm name, so they go to review as `ambiguous`. The
   phrase "Natural Selections" alone was judged too generic.
8. **Generic-but-kept standalone names.** "Wellness", "Temptations", "Pedigree",
   "Cesar", "Puppy Love", "Heartland Farms", "Old Glory", "Wild Harvest" and "Raw
   Advantage" stay as standalone aliases. In the 2016-2026 CVM text every hit is
   either the brand itself or an event the classifier excludes as non-food (for
   example Wellness Pharmacy). Revisit these if false Heads-up matches appear in the
   review queue.
9. **Brands seen in recalls but still not in the catalog:** Nurture Farms (Sunshine
   Mills per its brand list, not fetched), Elm Naturals, Best Bully Sticks (TDBBS),
   Gaines Pet Treats, Petdine, EVO (Natura, discontinued). They reach the review
   queue as `unmatched`.
10. **Sources that block scripts.** Several still cite pages that return 403 to
    scripts (General Mills investor site, petfoodindustry.com, purina.com). Search
    results confirmed they exist.

## 2026-10-18: fixes from the independent validation judges

Source: judge findings on the 2016-2026 validation run. Each change has a regression
test in `test/judge-regressions.test.ts`. Disagreements are in
`docs/validation/judge-disputes.md`. Every new brand cites the FDA notice or the iRES
enforcement record it was seen in. Where the record names only the recalling firm, the
parent is that firm and the file says the owner was not checked.

### New brands

EverPet (Dollar General), Against the Grain (under Evanger's), Cocolicious (Party Animal),
Loving Pets (Barksters, Puffsters), Raws for Paws (Christofersen Meats), Elm (Elm Pet Foods,
made by Sunshine Mills), Abound (Kroger, made by Sunshine Mills), Chef Toby (Dog Goods
USA), Berkley & Jensen (BJ's), Best Bully Sticks and Barkworthies (TDBBS), Billy + Margot
(Real Pet Food Company), Dr. Siegel's (Grassland Beef), Visionary Pet Foods, Nurture
Farms (Sunshine Mills; FDA also prints "Nuture Farms" and "Nature Farms"), Ark Naturals,
What The Raw, Gaines Family Farmstead, Ollie, JustFoodForDogs, IcelandicPlus, My Pet
Carnivore and The Butcher's Hound (both made by Montgomery Meats), Doggone Raw,
Breeder's Edge and Shelter's Choice (Revival Animal Health; puppy and kitten milk
replacers), Omaha Steaks (dog chews only).

New lines: eurocan HoundsTooth and Mac's Choice, petco-brand WholeHearted, victor Select
(split out of Classic), answers Detailed / Straight now carry their label aliases.

New co-packers: montgomery-meats, united-pet-group (Companion rawhide for Ahold).

### Short aliases (new alias kind, firm-corroborated)

This closes doubts 6 (Meridian) and 7 (Darwin's Natural Selections) above.
Meridian, Smokehouse, Evolve, Triumph, Champ, Field Trial, Good Dog, Family Pet, Muse,
Orlando, Answers, Quest, Viva, Performance Dog, Companion, Elm, Ollie, Nature Farms;
line short aliases: Darwin's Natural Selections, Natural Balance "Ultra Premium"
(J.M. Smucker is listed as a Natural Balance co-packer because it owned the brand and
recalled it in 2020), IcelandicPlus "Capelin".

### UPC company prefixes (new field)

Redbarn 785184 and Steve's Real Food 691730. Used only with the brand owner as the
recalling firm.

### Smaller alias fixes

Wellness Complete Health "Formula, Natural Food for Cats" (the 2017 pate cans) and 95%
"Beef Topper"; Evanger's Hand Packed "Hunk of Beef"; Special Kitty "Super Supper";
Tucker's "Pork-Bison"; Quest "Frozen"; Redbarn "Bully"; Sprout "Sprout Sporting" moved
from a brand label to the Sporting line; Savage Pet; Kanu Pets brand; Performance Dog
lines "Beef", "Bone(s)"; Omaha Steaks parent name shortened so the printed company
line reads as the brand.

### Still not in the catalog

"Clearly Good Food Made for All Dogs" (Wet Noses, iRES 88774): the record does not show
whether it is a brand or a tagline. Supercan and Nature's Own Pet Chews: the iRES and
listing records now link by firm, but the brands are not curated yet.

## 2026-10-18: second round of validation judge findings

Matching code changed too (see docs/validation/judge-disputes.md, second round). Catalog changes:

### New brands

- `bravo-packing-house` (Bravo Packing): ground beef, green tripe (alias Tripe) and smoked bones,
  which iRES 87408 / 87534 list as Bravo products separate from Performance Dog. `performance-dog`
  keeps only its patties line, and its "Performance Dog" short alias moved to that line.
- `barnsdale-farms`, `houndstooth`, `macs-choice` (parent euro-can-manufacturing): the names printed
  on the 2017 pig-ear bags. They were EuroCan lines; EuroCan's generic "Treats" line (alias "Pig
  Ears") is gone, so a EuroCan pig-ear notice no longer alerts every EuroCan treat.
- `natures-own-pet-chews` (new parent `best-buy-bones`), line Bully Bites. No bare "Nature's Own"
  alias: that is a bread brand.

### Lines

- Kibbles 'n Bits: Chef's Choice Homestyle and Chef's Choice American Grill (iRES 79291).
- Sprout: Bites & Bones is its own line; the alias left the Sporting line (iRES 86569).
- NutriSource: the Grain Free line is named "NutriSource Grain Free" so the bare descriptor
  "Grain Free" no longer matches it (iRES 88842).
- yourpet / Pet Pride / Companion (Ahold) chew lines: aliases Beefhide, Rawhide (and "Basted Chips"
  for Pet Pride), covering the bones, rolls, rings and chips of iRES 77441.

### UPCs

- Line `upcs` (new field): Wellness Complete Health 2017 pate cans (7 UPCs from iRES 76403 /
  76616); Blue Ridge Beef Kitten Mix 854298001436 (iRES 93641).
- `upc_prefixes`: Blue Ridge Beef 854298, Best Bully Sticks (TDBBS) 840139, PetSmart 737257 on
  Grreat Choice and Dentley's.
