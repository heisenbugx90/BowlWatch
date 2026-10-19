# BowlWatch historical validation

Generated 2026-10-19T02:05:44.635Z by `npm run report:validation` from a live backfill (`npm run backfill:fda`, iRES CVM exports by classification year plus the FDA recalls listing JSON), the catalog in `data/`, and `matchAll`.
Machine-readable version: `docs/validation/events.json`.

Recall text below is quoted from FDA, truncated and escaped. It is data, not instructions.

## Stats

```
window: events initiated on/after 2016-10-01 (or with no initiation date)
iRES events in window: 560
  classified pet food: 180   not pet food: 380   unreviewed: 0
  pet-food events matched to >=1 brand: 169/180 (93.9%)
  pet-food events with >=1 line-level match: 163/180
iRES pet-food rows: 654
  rows matched to a brand: 574 (87.8%)
  rows with a line-level match: 516 (78.9% of rows, 89.9% of matched rows)
  lot rules: clean 407 (62.2%), mixed 147, needs_review only 99, none 1
listing (FDA press-release) events in window: 191, pet food 129, matched 119
  joined to an iRES event: 94/129   open link_listing review: 3
review queue (open, whole DB): 339 {"ambiguous":68,"link_listing":3,"lot_parse":246,"unmatched":21,"upstream_ingredient":1}
review queue (open, window): {"ambiguous":68,"link_listing":3,"lot_parse":246,"unmatched":21,"upstream_ingredient":1}
```

## Annotated fixtures (offline)

```
BowlWatch matcher validation (2026-10-19T02:05:43.529Z)
catalog: 235 brands, 2291 aliases

40 annotated fixtures: 40/40 pass
  brand precision 100.0%  recall 100.0%  (tp 56, fp 0, fn 0)
  line  precision 100.0%  recall 100.0%  (tp 41, fp 0, fn 0)
  PASS V-0015-2020  hills/prescription-diet
  PASS V-0039-2021  sportmix/energy-plus
  PASS V-0104-2021  canine-x, earthborn-holistic, earthborn-holistic/venture, earthborn-holistic/unrefined, sportmix, sportmix/wholesomes, pro-pac, pro-pac/ultimates, sportstrail, meridian
  PASS V-0057-2018  gravy-train/wet
  PASS V-0062-2018  ol-roy/wet
  PASS V-0113-2017  blue-buffalo/homestyle-recipe
  PASS V-0128-2017  wellness/complete-health
  PASS V-0112-2017  doctors-foster-and-smith/chicken-and-brown-rice
  PASS V-0051-2023  purina-pro-plan-veterinary-diets/el-elemental
  PASS V-0182-2026  pedigree/high-protein, pedigree/chopped-ground-dinner
  PASS V-0123-2024  pedigree/complete-nutrition
  PASS V-0140-2026  steves-real-food/freeze-dried
  PASS V-0195-2026  northwest-naturals/raw-diet-cats
  PASS V-0027-2026  bonnihill-farms/beefibowls
  PASS V-0192-2026  fromm/pate
  PASS V-0004-2021  champ/mini-chunk
  PASS V-0021-2024  retriever-tsc/mini-chunk
  PASS V-0026-2024  country-acres/farm-dog, country-acres/farm-cat, exclusive/red-flannel, exclusive/signature, heb-texas-pets/dry-dog, heb-texas-pets/dry-cat, hill-country-fare/dry-dog, lone-star-tfp/dog, members-mark/dog-dry, retriever-tsc/hi-protein, retriever-tsc/bites-and-bones, retriever-tsc/choice-chops, retriever-tsc/mini-chunk, retriever-tsc/puppy-blend, star-pro, economax/dry-cat, feline-medley/formula
  PASS V-0023-2023  heb-texas-pets/dry-cat
  PASS V-0027-2024  blue-ridge-beef/puppy-mix
  PASS V-0128-2019  darwins/natural-selections
  PASS V-0075-2018  darwins/zoologics
  PASS V-0100-2021  ranch-hound/maintenance
  PASS V-0063-2022  
  PASS V-0029-2026  
  PASS V-0030-2026  country-vet/biscuits, heartland-harvest/biscuits
  PASS N/A          victor/classic
  PASS V-0019-2025  answers/detailed
  PASS V-0142-2021  freshpet/select
  PASS V-0106-2021  meow-mix/original-choice
  PASS V-0005-2020  
  PASS V-0118-2021  zukes/mini-naturals
  PASS V-0034-2021  authority/savory-blends
  PASS V-0009-2020  orlando/grain-free
  PASS V-0158-2017  good-n-fun/chews
  PASS V-0142-2026  raaw-energy?
  PASS V-0468-2020  
  PASS V-0218-2022  beg-and-barker/chicken-breast-strips, green-coast-pet/chicken-crisps
  PASS V-0049-2019  g-and-c-raw?
  PASS V-0273-2017  evangers/hand-packed

pet-food classification, CVM exports initiated 2016-10 onward: 560 events, 180 pet food
  precision 100.0%  recall 100.0%  unreviewed 0
  (ground truth: pet_food_rows_window.json plus 64 documented corrections in src/match/evaluate.ts)

lot rules over 552 pet-food rows: 99.3% have rules, 84.1% have a clean (Stop-capable) rule, 39.9% have a rule needing review
```

## Events

Pet-food and unreviewed events in the window, oldest first. Rows: brand/line match (level), lot rule status, open review items.

### fda\_ires 75402: Mars Petcare USA

- initiated 2016-10-07, classified 2016-12-21 (Class I), status Terminated
- pet food: **yes** (alias:cesar)
- brands: cesar
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2275402%22%7D%5D)
- reason: There is a potential presence of white plastic in the finished product.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0049-2017 | CESAR Classics Filet Mignon Flavor, 100 g \(3.5 oz\) in plastic trays, 24 or 30 trays/case | cesar/classic-loaf-in-sauce \(line\) | mixed: best\_by\_date 2018-08-04; best\_by\_date 2018-08-05; best\_by\_date 2016-08-04 \(needs\_review\); best\_by\_date 2016-08-05 \(needs\_review\) \+13 | lot\_parse |

### fda\_ires 75457: Arrow Reliance Inc

- initiated 2016-10-17, classified 2016-12-21 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2275457%22%7D%5D)
- reason: Several meals for dogs are recalled due to contamination with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0050-2017 | Darwin's Natural Selections brand, frozen, raw Turkey with Organic Vegetable Meals for Dogs, 2 lbs. packages | darwins/natural-selections \(line\) | clean: exact 3142070 |  |
| V-0051-2017 | Darwin's Natural Selections brand, frozen, raw Beef with Organic Vegetables Meals for Dogs, 2 lbs. packages | darwins/natural-selections \(line\) | clean: exact 3146070 |  |
| V-0052-2017 | ZooLogics brand, frozen, raw Turkey with Vegetable Meals for Dogs, 2 lbs. packages. | darwins/zoologics \(line\) | clean: exact 3155070 |  |

### fda\_ires 75919: blue ridge beef

- initiated 2016-12-09, classified 2017-04-17 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-product-because-possible-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2275919%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-product-because-possible-health-risk)
- reason: Samples collected by FDA revealed the presence of Salmonella and Listeria monocytogenes.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0087-2017 | Beef For Dogs, 100% Pure Natural Pet Food, Net Wt. 2 lbs., Blue Ridge Beef | blue-ridge-beef/beef-for-dogs \(line\) | clean: exact GA8516 |  |
| V-0088-2017 | Kitten Grind, 100% Pure Natural Pet Food, Net Wt. 2 lbs., Blue Ridge Beef. | blue-ridge-beef/kitten-grind \(line\) | clean: exact GA81216 |  |
| V-0089-2017 | Turkey with bone, UPC Code 854298001887 | blue-ridge-beef \(brand\) | mixed: exact 103 | lot\_parse |

### fda\_ires 76151: J M Smucker Co

- initiated 2017-01-03, classified 2017-04-17 (Class I), status Terminated
- pet food: **yes** (alias:9lives; alias:special-kitty; alias:9lives\+special-kitty; brand 9lives but other animal:poultry)
- brands: 9lives, everpet, special-kitty; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-expands-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-announces-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276151%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-expands-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-announces-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels)
- reason: A limited voluntary recall is being implemented on certain lots of canned cat food due to possible low levels of thiamine \(Vitamin B1\). This issue was identifi…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0093-2017 | 9Lives Meaty Pate Seafood Platter sold in 5.5 oz. cans with 4 cans per pack and 6 packs per case, lot numbers 6355803 and 6356803, Individu… | 9lives/meaty-pate \(line\) | clean: exact 6355803; exact 6356803 |  |
| V-0094-2017 | 9Lives Meaty Pate with Ocean Whitefish, sold in 5.5 oz. cans with 24 cans per case, lot number 6358803, and Individual Unit/Case UPC 791000… | 9lives/meaty-pate \(line\) | clean: exact 6358803 |  |
| V-0095-2017 | Special Kitty Classic Tuna Dinner, sold in 13 oz. cans with 12 cans per case, lot number 6358803, and Individual Unit/Case UPC 8113112157; … | special-kitty/wet \(line\) | clean: exact 6358803 |  |
| V-0096-2017 | 9Lives Meaty Pate with Chicken and Tuna, sold in 13 oz. cans with 12 cans per case, lot number 6354803, Individual Unit UPC 7910052238, Cas… | 9lives/meaty-pate \(line\) | clean: exact 6354803; exact 6356803; exact 6357803 |  |
| V-0097-2017 | 9Lives Meaty Pate Super Supper, sold in 5.5 oz. cans with 24 cans per case, lot number 6358803, Individual Unit/Case UPC 7910000327; also s… | 9lives/meaty-pate \(line\), special-kitty/wet \(line\) | clean: exact 6358803; exact 6357803; exact 6354803; exact 6355803 \+1 |  |
| V-0098-2017 | 9Lives Meaty Pate with Chicken and Seafood, sold in 5.5 oz. cans with 4 cans per pack and 6 packs per case, lot number 6356803, Individual … | 9lives/meaty-pate \(line\) | clean: exact 6356803 |  |
| V-0099-2017 | 9Lives Meaty Pate with Chicken Dinner, sold in 5.5 oz. cans with 24 cans per case, lot number 6356803, and Individual Unit/Case UPC 7910000… | 9lives/meaty-pate \(line\) | clean: exact 6356803 |  |
| V-0100-2017 | 9Lives Meaty Pate with Liver and Chicken, sold in 5.5 oz. cans with 4 cans per pack and 6 packs per case, lot number 6355803, and Individua… | 9lives/meaty-pate \(line\) | clean: exact 6355803 |  |
| V-0101-2017 | 9Lives Seafood &amp; Poultry Favorites, sold in 5.5 oz. cans with 24 cans total per case, including 8 cans per case of Real Ocean Whitefish, 8 … | 9lives/meaty-pate \(line\) | clean: exact 6307803 |  |
| V-0102-2017 | EverPet Mixed Grill Dinner, sole in 13 oz. cans with 12 cans per case, lot number 6356803, and Individual Unit/Case UPC 7910053114 Distribu… | everpet/wet \(line\), special-kitty/wet \(line\) | clean: exact 6355803; exact 6356803 |  |
| V-0103-2017 | Special Kitty Beef and Liver Dinner, sold in 13 oz. can with 12 cans per case, lot number 6355803, and Individual Unit/Case UPC 8113112120 … | special-kitty/wet \(line\) | clean: exact 6355803 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-product-because-possible-health-risk: Blue Ridge Beef

- initiated 2017-01-17, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:75919
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-product-because-possible-health-risk)
- reason: potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Raw Dog and Cat food | blue-ridge-beef \(brand\) | none |  |

### fda\_ires 76403: Simmons Foods Inc

- initiated 2017-02-01, classified 2017-05-19 (Class II), status Terminated
- pet food: **yes** (alias:doctors-foster-and-smith; alias:blue-buffalo; alias:companion-ahold; alias:always-save)
- brands: 4health, always-save, blue-buffalo, cat-cuisine, companion-ahold, doctors-foster-and-smith, grreat-choice, home-360-pet, sprout, triumph, wellness
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276403%22%7D%5D)
- reason: This recall has been initiated due to receiving a notification of a consumer complaint regarding foreign material in Doctors Fosters and Smith Chicken and Brow…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0112-2017 | Doctors Fosters &amp; Smith Chicken and Brown Rice Formula Adult Dog Food Net Wt. 12.7 oz. Distributed by Foster &amp; Smith, Inc. Rhinelander, WI … | doctors-foster-and-smith/chicken-and-brown-rice \(line\) | clean: exact 32CDS116 |  |
| V-0113-2017 | Blue Buffalo Homestyle Recipe Healthy Weight Chicken Dinner With Garden Vegetable , Net Wt. 12.5 oz. Distributed by Blue Buffalo Co., Ltd 1… | blue-buffalo/homestyle-recipe \(line\) | clean: exact 62HYCS1 |  |
| V-0114-2017 | Companion with Chicken and Rice Dog Food Net Wt. 13.2 oz Distributed by Foodhold USA LLC Landover, MD 20785 UPC 6-88267-07501-8 | companion-ahold/canned-dog \(line\) | clean: exact PCR1S1 |  |
| V-0115-2017 | Companion with Turkey and Bacon Dog Food Net Wt. 13.2 oz Distributed by Foodhold USA LLC Landover, MD 20785 UPC 6-88267-00356-1 | companion-ahold/canned-dog \(line\) | clean: exact PTB1S1 |  |
| V-0116-2017 | Companion with Chicken, Lamb and Rice Dog Food Net Wt. 13.2 oz Distributed by Foodhold USA LLC Landover, MD 20785 UPC 6-88267-00360-8 | companion-ahold/canned-dog \(line\) | clean: exact PCM1S1 |  |
| V-0117-2017 | Always Save Fish Flavor Cat Food Net Wt. 13.2 oz. Proudly Distributed By: Associated Wholesale Grocers, Inc. Kansas City, Kansas 66106 UPC … | always-save \(brand\) | clean: exact RLC7 16JJJS1 |  |
| V-0118-2017 | Always Save Chicken Flavor Cat Food Net Wt. 13.2 oz Proudly Distributed By: Associated Wholesale Grocers, Inc. Kansas City, Kansas 66106 UP… | always-save \(brand\) | clean: exact RLF7 16JJJS1 |  |
| V-0119-2017 | Home 360 Pet Dog Food with Turkey &amp; Bacon Net Wt. 13.2 oz Proudly Distributed By: DZA Brands LLC 2110 Executive Drive, Salisbury, NC 28147 … | home-360-pet \(brand\) | clean: exact PTB1S1 |  |
| V-0120-2017 | Sprout Ultra High Performance Cat Food Country Chicken Dinner Net Wt. 13.2 oz Distributed By: Mills Fleet Farm PO Box 1199, Appleton, WI 54… | sprout/ultra-high-performance \(line\) | clean: exact CCF1S1 |  |
| V-0121-2017 | Sprout Ultra High Performance Dog Food with Beef, Bacon &amp; Cheese Net Wt. 13.2 oz. Distributed By: Mills Fleet Farm PO Box 1199, Appleton, W… | sprout/ultra-high-performance \(line\) | clean: exact PBB1S1 |  |
| V-0122-2017 | Grreat Choice with Chicken and Rice Classic Ground Dog Food Net Wt 13.2 oz Dist. by: Pacific Coast Distributing, Inc. 19601 N. 27th Avenue … | grreat-choice \(brand\) | clean: exact PCR1S1 |  |
| V-0123-2017 | Cat Cuisine Turkey &amp; Giblets Dinner Cat Food Net Wt. 13.2 oz Distributed by: Save-A-Lot Food Stores, LTD Earth City, MO 63045 UPC 7-37257-2… | cat-cuisine \(brand\) | clean: exact FTG151 |  |
| V-0124-2017 | Triumph Premium Cat Food Ocean Fish Formula Net Wt. 13.2 oz UPC 0-73657-00289-5 | triumph \(brand\) | clean: exact TOF1S1 |  |
| V-0125-2017 | 4Health Chicken &amp; Rice Formula For Dogs Net Wt. 13.2 oz. Distributed by: Tractor Supply Company 200 Powell Place Brentwood, TN 37027 UPC 7-… | 4health \(brand\) | clean: exact UDC1S1 |  |
| V-0126-2017 | 4Health Turkey &amp; Salmon Dinner for Cats Net Wt. 13.2 oz. Distributed by: Tractor Supply Company 200 Powell Place Brentwood, TN 37027 UPC 7-… | 4health \(brand\) | clean: exact UCTSS1 |  |
| V-0127-2017 | 4Health Lamb and Rice Formula Net Wt. 13.2 oz. Distributed by: Tractor Supply Company 200 Powell Place Brentwood, TN 37027 UPC 0-49394-0185… | 4health \(brand\) | clean: exact UDL1S1 |  |
| V-0128-2017 | Wellness Beef &amp; Chicken Formula Net Wt. 12.5 oz. Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08821-9 | wellness/complete-health \(line\) | clean: exact 7WBCS1 |  |
| V-0129-2017 | Wellness Beef &amp; Salmon Formula Net Wt. 12.5 oz. Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-09122-6 | wellness/complete-health \(line\) | clean: exact 7WBSS1 |  |
| V-0130-2017 | Wellness Chicken Formula Net Wt. 12.5 oz. Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08822-6 | wellness/complete-health \(line\) | clean: exact 7WCCS1 |  |
| V-0131-2017 | Wellness Chicken &amp; Herring Formula Net Wt. 12.5 oz. Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08820-2 | wellness/complete-health \(line\) | clean: exact 7WCHS1 |  |
| V-0132-2017 | Wellness Chicken &amp; &amp; Lobster Formula Net Wt. 12.5 oz Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08869-1 | wellness/complete-health \(line\) | clean: exact 7WCLS1 |  |
| V-0133-2017 | Wellness Turkey Formula Net Wt. 12.5 oz Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08823-3 | wellness/complete-health \(line\) | clean: exact 7WTKS1 |  |
| V-0134-2017 | Wellness Turkey &amp; Salmon Formula Net Wt. 12.5 oz Old Mother Hubbard, Inc. Tewksbury, MA 01876 UPC 0-76344-08819-6 | wellness/complete-health \(line\) | clean: exact 7WTSS1 |  |

### fda\_ires 76385: Evanger's Dog &amp; Cat Food Co

- initiated 2017-02-03, classified 2017-08-03 (Class I), status Terminated
- pet food: **yes** (alias:evangers)
- brands: evangers
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276385%22%7D%5D)
- reason: Product is potentially contaminated with the barbiturate pentobarbital.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0273-2017 | Evanger's Hand Packed Hunk of Beef Au Jus; Grain and Gluten Free; NET WT 12 OZ; Manufactured in the USA by Evanger's Dog &amp; Cat Food Co., In… | evangers/hand-packed \(line\) | clean: best\_by\_range 2019-12-01..2021-01-31 |  |
| V-0274-2017 | Evanger's Hand Packed Braised Beef Chunks with Gravy; NET WT 12 OZ; Manufactured in the USA by Evanger's Dog &amp; Cat Food Co., Inc. Markham, … | evangers/hand-packed \(line\) | clean: best\_by\_range 2019-12-01..2021-01-31 |  |

### fda\_ires 76466: AGAINST THE GRAIN

- initiated 2017-02-09, classified 2017-07-18 (Class I), status Terminated
- pet food: **yes** (alias:against-the-grain)
- brands: against-the-grain
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276466%22%7D%5D)
- reason: Product sampled and tested positive for the barbiturate pentobarbital.
- review #15 unclassified (resolved): pet food undecided; firm: AGAINST THE GRAIN; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0272-2017 | Against the Grain PULLED BEEF with Gravy. Slow Simmered, Grain Free. NET WT. 12 OZ | against-the-grain/canned \(line\) | clean: best\_by\_range 2019-12-01..2021-01-31 |  |

### fda\_ires 76616: WellPet, LLC

- initiated 2017-02-10, classified 2017-05-19 (Class II), status Terminated
- pet food: **yes** (alias:wellness)
- brands: wellness
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276616%22%7D%5D)
- reason: Product may contain metal fragments.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0135-2017 | Wellness Chicken &amp; Herring Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 08820 2 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-04 |  |
| V-0136-2017 | Wellness Canned Chicken Formula, Natural Food for Cats, Net WT. 12.5 oz \(354 g\)0 76344 08822 6 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-03; best\_by\_date 2019-08-04 |  |
| V-0137-2017 | Wellness Chicken &amp; Lobster Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 08869 1 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-04 |  |
| V-0138-2017 | Wellness Turkey &amp; Salmon Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 08819 6 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-05 |  |
| V-0139-2017 | Wellness Turkey Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 08823 3 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-04; best\_by\_date 2019-08-05 |  |
| V-0140-2017 | Wellness Beef &amp; Chicken Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 08821 9 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-05 |  |
| V-0141-2017 | Wellness Beef &amp; Salmon Formula, Natural Food for Cats, Net Wt. 12.5 oz \(354g\); UPC: 0 76344 09122 6 | wellness/complete-health \(line\) | clean: best\_by\_date 2019-08-05 |  |

### fda\_ires 76453: Blue Buffalo Company Ltd

- initiated 2017-02-13, classified 2017-05-19 (Class II), status Terminated
- pet food: **yes** (alias:blue-buffalo)
- brands: blue-buffalo
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276453%22%7D%5D)
- reason: Product may contain metal fragments.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0152-2017 | Blue Homestyle Recipe Healthy Weight Chicken Dinner with Garden Vegetables; 12.5 oz. Can, UPC Code: 840243100170 | blue-buffalo/homestyle-recipe \(line\) | needs\_review: best\_by\_date 2019-08-03 \(needs\_review\) | lot\_parse |

### fda\_ires 76755: Wellpet Llc

- initiated 2017-03-17, classified 2017-04-17 (Class I), status Terminated
- pet food: **yes** (alias:wellness)
- brands: wellness
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276755%22%7D%5D)
- reason: Product contains Elevated Levels of Thyroid Hormones

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0107-2017 | WELLNESS\*\*\*ninety-five percent\*\*\*BEEF\*\*\*ALL NATURAL GRAIN FREE NOTHING ARTIFICIAL \*\*\*Packed with super premium real beef. As a mixer or top… | wellness/ninety-five-percent \(line\) | clean: best\_by\_date 2019-02-02; best\_by\_date 2019-08-29; best\_by\_date 2019-08-30 |  |

### fda\_ires 76706: Blue Buffalo Company Ltd

- initiated 2017-03-17, classified 2017-04-17 (Class I), status Terminated
- pet food: **yes** (alias:blue-buffalo)
- brands: blue-buffalo
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276706%22%7D%5D)
- reason: Product may contain elevated levels of thyroid hormones.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0106-2017 | BLUE Wilderness Rocky Mountain Recipe Red Meat Dinner Wet Food for Adult Dogs 12.5 oz can UPC\# 840243101153 | blue-buffalo/wilderness \(line\) | clean: best\_by\_date 2019-06-07 |  |

### fda\_ires 76781: Euro Can Manufacturing Inc.

- initiated 2017-03-20, classified 2017-07-18 (Class I), status Terminated
- pet food: **yes** (alias:barnsdale-farms\+houndstooth\+macs-choice)
- brands: barnsdale-farms, houndstooth, macs-choice
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2276781%22%7D%5D)
- reason: Potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0271-2017 | Barnsdale Farms, HoundsTooth and Mac's Choice Brand Pig Ears, individually shrink-wrapped, 6-pack, 12-pack, 25-pack and 100-pack plastic ba… | barnsdale-farms/pig-ears \(line\), houndstooth/pig-ears \(line\), macs-choice/pig-ears \(line\) | clean: exact 84 |  |

### fda\_ires 77118: Party Animal Inc.

- initiated 2017-04-17, classified 2017-09-07 (Class I), status Terminated
- pet food: **yes** (alias:cocolicious)
- brands: cocolicious
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2277118%22%7D%5D)
- reason: Party Animal is recalling canned dog foods because they tested positive for pentobarbital.
- review #18 unclassified (resolved): pet food undecided; firm: Party Animal Inc.; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0283-2017 | Cocolicious Beef and Turkey, Size: 13 ounce cans | cocolicious/canned \(line\) | clean: best\_by\_range 2019-07-01..2019-07-31; exact 0136E15204 04 |  |
| V-0284-2017 | Cocolicious Chicken and Beef, Size: 13 ounce cans | cocolicious/canned \(line\) | clean: best\_by\_range 2019-08-01..2019-08-31; exact 0134E15 237 13 |  |

### fda\_ires 77207: Smallbatch Pets, Inc.

- initiated 2017-05-03, classified 2017-08-03 (Class I), status Terminated
- pet food: **yes** (alias:smallbatch)
- brands: smallbatch
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2277207%22%7D%5D)
- reason: The Smallbatch brand, frozen chicken blend for dogs and cats, 2 lbs. packages are recall due to the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0275-2017 | Chicken blend for dogs and cats, Smallbatch brand, frozen, Net wt. 2 lbs. UPC 7 05105 97097 4. The label is read in parts: "\*\*\*smallbatch\*\*… | smallbatch/frozen-blends \(line\) | clean: exact D032; exact E058 |  |

### fda\_ires 77441: Spectrum Brands Inc

- initiated 2017-06-05, classified 2017-07-11 (Class II), status Terminated
- pet food: **yes** (alias:companion-ahold; alias:good-n-fun; alias:good-n-fit; alias:healthy-hide)
- brands: american-beefhide, companion-ahold, dentleys, digest-eeze, enzadent, essential-everyday, exer-hides, good-lovin, good-n-fit, good-n-fun, healthy-hide, hill-country-fare, luvsome, pet-pride, petco-brand, priority-albertsons, yourpet; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/united-pet-group-expands-voluntary-recall-multiple-brands-rawhide-chew-products-dogs-also-include
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2277441%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/united-pet-group-expands-voluntary-recall-multiple-brands-rawhide-chew-products-dogs-also-include)
- reason: Investigation of complaints of an off odor on the product revealed that the product is potentially contaminated with an equipment sanitizer \(quaternary ammoniu…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0157-2017 | Companion, Skin &amp; Coat Chicken Flavored Chews, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 2 count roll packages | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0158-2017 | Good 'n' Fun, Triple Flavor Chews, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 2 count 7'' rolls, UPC 0 91… | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0159-2017 | Good 'n' Fun, Beefhide Chicken Sticks, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, 10 count stick packages, UPC 0 9109… | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0160-2017 | Good 'n' Fun, Triple Flavor Chews, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in the following ways 1\) 3 cou… | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0161-2017 | Good 'n' Fun, Pro Dips, Beef Flavored Liver Flavored, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in the foll… | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0162-2017 | Good 'n' Fun, Pro Dips, Peanut Butter Flavored, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in the following … | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0163-2017 | Good 'n' Fun, Beefy Ribs, Beef Flavored, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in the following ways 1\)… | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0164-2017 | Good 'n' Fun, Beefy sticks, Beef Flavored, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 100 count packages,… | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0165-2017 | Good 'n' Fun, Chew Bone, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1\) 1 count 7'' packages, UPC 0 91093 … | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0166-2017 | Good 'n' Fun, Beef Bone, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1\) 1 count 9'' packages, UPC 0 91093 … | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0167-2017 | Good 'n' Fun, Chew Roll, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 count 10'' packages, UPC 0 91093 14… | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0168-2017 | Good 'n' Fun, Chicken Chew Roll, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 count 10'' packages, UPC 0 … | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0169-2017 | Good 'n' Fun, Natural Chew Ring, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 count 6'' packages, UPC 0 9… | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0170-2017 | Good 'n' Fun, Chew Bones, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 8 count 4'' bone packages, UPC 0 910… | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0171-2017 | Good 'n' Fun, Beef bone, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 count 10'' roll packages, UPC 0 910… | good-n-fun \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0172-2017 | Good 'n' Fun, Chew Chips, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 lb packages, UPC 0 91093 96270 9; | good-n-fun/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0173-2017 | Good 'n' Fit, Skin &amp; Coat Chews Beef Flavored, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1\) 5 count 4'' … | good-n-fit/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0174-2017 | Good 'n' Fit, Skin &amp; Coat Beef Flavored Chips, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 4 oz packages, … | good-n-fit \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0175-2017 | Good 'n' Fit, Skin &amp; Coat Beef Flavored Crunchy Sticks, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 20 cou… | good-n-fit \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0176-2017 | Good 'n' Fit, Skin &amp; Coat Chews, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 7 count 5'' roll packages, UP… | good-n-fit/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0177-2017 | Good 'n' Fit, Skin &amp; Coat Chews Chips, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 4 oz packages, UPC 0 91… | good-n-fit/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0178-2017 | Healthy Hide, Skin &amp; Coat Bone Artificial Chicken Flavor, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 1 co… | healthy-hide \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0179-2017 | Healthy Hide, Dental Rolls, United Pet Group, a Division of Spectrum Brands, Blacksburg, VA, packaged in 2 count 5'' rolls packages, UPC 0 … | healthy-hide \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0180-2017 | Digest-eeze, Natural Savory Beefhide, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 8 count 4'' bone packag… | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0181-2017 | Digest-eeze, Natural Savory Beefhide, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 5 count 5'' roll packag… | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0182-2017 | Digest-eeze, Natural Savory Beefhide, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 3.5 oz packages of chips, … | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0183-2017 | Digest-eeze, Natural Savory Beefhide, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 8 count 8'' ring packages,… | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0184-2017 | Digest-eeze, Plus Pork, Beef &amp; Chicken, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 4 count 4'' bone pack… | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0185-2017 | Digest-eeze, Plus Peanut Butter Basted, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 2 count 7'' roll pack… | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0186-2017 | Digest-eeze, Plus Pork &amp; Beef, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 20 count 5'' twist packages, UPC … | digest-eeze \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0187-2017 | American Beefhide, Chew Bone, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 5 count 4'' bone packages; 2\) 1… | american-beefhide/chews \(line\) | clean: prefix AH |  |
| V-0188-2017 | American Beefhide, Beef Bone Beef Flavored, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1\) 4 count 5'' bone … | american-beefhide \(brand\) | clean: prefix AH |  |
| V-0189-2017 | American Beefhide, Bone Chicken Flavored, Manufactured by: Salix Animal Health, LLC Deerfield Beach, FL, packaged in 1 count 6'' bone packa… | american-beefhide \(brand\) | clean: prefix AH |  |
| V-0190-2017 | Companion, Natural Rawhide Chews, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 1\) 4 count 4'' bone packages, UPC 415200… | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0191-2017 | Companion, Natural Rawhide Rolls, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 1\) 4 count 8'' roll packages, UPC 415200… | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0192-2017 | Companion, Rawhide Chew Chips, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 1\) 4 oz packages, UPC 41520022189; 2\) 1 lb … | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0193-2017 | Companion, Chicken Flavored Rawhide Chew Chips, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 4 oz packages, UPC 4152002… | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0194-2017 | Companion, Peanut Butter Rawhide Chews, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 2 count 8'' rolls packages, UPC 41… | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0195-2017 | Companion, Peanut Butter Rawhide Chews, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 1\) 4 count 7'' bone packages, UPC … | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0196-2017 | Companion, Peanut Butter Rawhide Chews, Distributed by: Foodhold USA LLC Landover, MD 20785, packaged in 1\) 4 count 7'' bone packages, UPC … | companion-ahold/chews \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0197-2017 | Dentahex, Oral Care Chews Petite, Manufactured For Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 17030030… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0198-2017 | Dentahex, Oral Care Chews Small Dogs, Manufactured For Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 1703… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0199-2017 | Dentahex, Oral Care Chews Medium Dogs, Manufactured For Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 170… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0200-2017 | Dentahex, Oral Care Chews Large Dogs, Manufactured For Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 1703… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0201-2017 | Dentley's, Natural Flavor Rawhide Knotted Bones, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 16 count 3'' bone p… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0202-2017 | Dentley's, Natural Flavor Rawhide Rolls, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 6 count 5'' retriever stick… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0203-2017 | Dentley's, Assorted Flavors, Beef Chicken, Rawhide Rolls, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 3 count 10… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0204-2017 | Dentley's, Assorted Flavors Beef Chicken Peanut Butter Granulated Rawhide Munchy Logs, Pacific Coast Distributing, Inc. Phoenix, AZ USA 850… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0205-2017 | Dentley's, Assorted Flavors, Beef Chicken, Rawhide Knotted Bones, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 16… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0206-2017 | Dentley's, Natural Flavor, Rawhide Curls, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 12 count 4'' curl packages… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0207-2017 | Dentley's, Peanut Butter Flavor Rawhide Knotted Bones, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1 count 7'' bone… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0208-2017 | Dentley's, Beef Flavor, Rawhide Munchy Strip, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 50 count 6'' strip packag… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0209-2017 | Dentley's, Peanut Butter Flavor, Rawhide Munchy Strip, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 50 count 6'' str… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0210-2017 | Dentley's, Natural Flavor, Bully Sticks, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 6 count 6'' pizzle packages, U… | dentleys/bully-sticks \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0211-2017 | Dentley's, Natural Flavor, Rawhide Munchy Strip, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 50 count strip package… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0212-2017 | Dentley's, Chicken Flavor, Rawhide Munchy Strip, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 50 count strip package… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0213-2017 | Enzadent, Oral Care Chews Petite Dogs, Manufactured for Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 170… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0214-2017 | Enzadent, Oral Care Chews Small Dogs, Manufactured for Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 1703… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0215-2017 | Enzadent, Oral Care Chews Medium Dogs, Manufactured for Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 170… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0216-2017 | Enzadent, Oral Care Chews Large Dogs, Manufactured for Vetoquinol USA Inc. Ft. Worth, TX USA 76137, packaged in 30 count packages, UPC 1703… | enzadent/oral-care-chews \(line\) | clean: best\_by\_range 2021-06-01..2022-05-31 |  |
| V-0217-2017 | Exer-Hides, Natural Beefhide Bones, Distributed by Wal-Mart Stores, Inc. Bentonville, AR 72716, packaged in 3 count packages 9'' bone packa… | exer-hides/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0218-2017 | Exer-Hides, Chicken Flavor Beefhide Bones, Distributed by Wal-Mart Stores, Inc. Bentonville, AR 72716, packaged in 3 count packages 9'' bon… | exer-hides/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0219-2017 | Essential Everyday, Natural Rawhide Premium Dog Bones, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 1\) 4 count 4'' … | essential-everyday/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0220-2017 | Essential Everyday, Retriever Rolls Natural Rawhide Chews, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 1\) 1 lb 8''… | essential-everyday/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0221-2017 | Essential Everyday, Dental Rolls Daily Oral Care, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 7 count 5'' bone pac… | essential-everyday \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0222-2017 | Essential Everyday, Skin &amp; Coat Premium Beef Flavor Chews, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 20 count cr… | essential-everyday \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0223-2017 | Essential Everyday, Skin &amp; Coat Premium Rawhide Chews, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 1\) 2 count 8'' … | essential-everyday/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0224-2017 | Essential Everyday, Natural Rawhide Flip Chip Premium Dog Chews, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 1lb p… | essential-everyday/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0225-2017 | Essential Everyday, Beef Basted Rawhide Flip Chip Premium Dog Chews, Distributed by Supervalu Inc Eden Prairie, MN 55344 USA, packaged in 1… | essential-everyday/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0226-2017 | Essential Everyday, Triple-Flavor Chews Beef Hide, Premium Chicken &amp; Artificial Bacon Flavor, Distributed by Supervalu Inc Eden Prairie, MN… | essential-everyday \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0227-2017 | Good Lovin', Beef Flavor Butcher's Block Rawhide Bone, Distributed by: International Pet Supplies and Distribution, Inc. San Diego, CA, pac… | good-lovin/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0228-2017 | Good Lovin', Chicken Flavor Rawhide Bone, Distributed by: International Pet Supplies and Distribution, Inc. San Diego, CA, packaged in 3 co… | good-lovin/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0229-2017 | Good Lovin', Hand Wrapped Jerky Rolls with Beef, Distributed by: International Pet Supplies and Distribution, Inc. San Diego, CA, packaged … | good-lovin \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0230-2017 | Hill Country Fare, Rawhide For Dogs, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1\) 5 count 4'' bone packages, UPC 41220780280… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0231-2017 | Hill Country Fare, Rawhide For Dogs Beef Basted Retriever Rolls, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1\) 2 count 8'' ro… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0232-2017 | Hill Country Fare, Rawhide For Dogs Chicken Basted Retriever Rolls, Distributed by: H-E-B San Antonio, TX 78204, packaged in 2 count 8'' ro… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0233-2017 | Hill Country Fare, Rawhide For Dogs Beef Basted Bones, Distributed by: H-E-B San Antonio, TX 78204, packaged in 4 count 4'' bone packages, … | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0234-2017 | Hill Country Fare, Rawhide For Dogs Chicken Basted Bones, Distributed by: H-E-B San Antonio, TX 78204, packaged in 4 count 4'' bone package… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0235-2017 | Hill Country Fare, Rawhide For Dogs All Natural Dog Chews, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1\) 4 count 10'' roll pa… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0236-2017 | Hill Country Fare, Rawhide For Dogs Natural Chips, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1.5 lb packages, UPC 4122092889… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0237-2017 | Hill Country Fare, Rawhide For Dogs Chicken Chips, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1.5 lb packages, UPC 4122092890… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0238-2017 | Hill Country Fare, Rawhide For Dogs Beef Basted Ribs, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1.5 lb packages, UPC 4122092… | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0239-2017 | Hill Country Fare, Rawhide For Dogs Beef Chips, Distributed by: H-E-B San Antonio, TX 78204, packaged in 1.5 lb packages, UPC 41220928910; | hill-country-fare/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0240-2017 | PetCo, Granulated Rawhide, Ribs Natural Flavored Dog Chews Beef, Distributed by: International Pet Supplies and Distribution, Inc. San Dieg… | petco-brand/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0241-2017 | PetCo, Classic Rawhide, Knot Bones, Natural Flavored Dog Chews Beef, Distributed by: International Pet Supplies and Distribution, Inc. San … | petco-brand \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0242-2017 | Priority, Rawhide Retriever Rolls Beef Basted, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1\) 2 count … | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0243-2017 | Priority, Munchy Strips Beef Basted, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 50 count packages, UP… | priority-albertsons \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0244-2017 | Priority, Knotted Rawhide Bones Natural, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1\) 1 lb packages,… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0245-2017 | Priority, Knotted Rawhide Bone Beef Basted, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1 count 9'' bo… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0246-2017 | Priority, Large Rawhide Ring, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1 count packages, UPC 211304… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0247-2017 | Priority, Medium Assorted Rawhide Natural, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 4 count package… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0248-2017 | Priority, Rawhide Chew Flip Chips Natural, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1\) 3 OZ package… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0249-2017 | Priority, Rawhide Chips Beef Basted, Distributed by: Lucerne North America LLC Pleasanton, CA 94566-0009, packaged in 1 lb packages, UPC 21… | priority-albertsons/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0250-2017 | yourpet, Beef Basted Beefhide Chips, Distributed by: Harris Teeter Matthews, NC, packaged in 1 lb packages, UPC 72036250407; | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0251-2017 | yourpet, Beef Basted Beefhide Rolls, Distributed by: Harris Teeter Matthews, NC, packaged in 2 count 7'' roll packages, UPC 72036977175; | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0252-2017 | yourpet, Natural Beefhide Chips, Distributed by: Harris Teeter Matthews, NC, packaged in 1\) 1 lb packages, UPC 72036977964; 2\) 2 lb package… | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0253-2017 | yourpet, Natural Beefhide Bones, Distributed by: Harris Teeter Matthews, NC, packaged in 1\) 1 count 4'' bone packages, UPC 72036977083; 2\) … | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0254-2017 | yourpet, Natural Beefhide Rolls, Distributed by: Harris Teeter Matthews, NC, packaged in 1\) 3 count 5'' roll packages, UPC 72036981363; 2\) … | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0255-2017 | yourpet, Beef Basted Beefhide Bones, Distributed by: Harris Teeter Matthews, NC, packaged in 1\) 1 count 4'' bone packages, UPC 72036977120;… | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0256-2017 | yourpet, Natural Beefhide Ring, Distributed by: Harris Teeter Matthews, NC, packaged in 1 count 5.5'' ring packages, UPC 72036977113; | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0257-2017 | yourpet, Chicken Basted Beefhide Basted Chips, Distributed by: Harris Teeter Matthews, NC, packaged in 1 lb packages, UPC 72036977229; | yourpet/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0258-2017 | Pet Pride, Chicken Flavored Beefhide Small Bones for Dogs, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 7 OZ 4'' bone… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0259-2017 | Pet Pride, Premium Beefhide Rolls for Dogs, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 2 count 8'' bone packages, U… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0260-2017 | Pet Pride, Chicken Beefhide Rolls for Dogs, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 2 count 8'' bone packages, U… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0261-2017 | Pet Pride, Premium Beefhide Mini Curls for Dogs, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 10 count curls packages, U… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0262-2017 | Pet Pride, Rawhide Ring for Dogs, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 1 count ring packages, UPC 11110830432… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0263-2017 | Pet Pride, Dental Care Rolls, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1 lb 5'' roll packages, UPC 11110804099; | pet-pride \(brand\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0264-2017 | Pet Pride, Rawhide Bone for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 7 oz 4'' bone packages, UPC 11110884350… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0265-2017 | Pet Pride, Beef Flavored Basted Rawhide Bone for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 1 lb 4'' bone pack… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0266-2017 | Pet Pride, Beef Flavored Beefhide Chips for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1 lb chip packages, UPC 11… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0267-2017 | Pet Pride, Chicken Flavor Basted Chips for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1\) 1 lb chip packages, UPC … | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0268-2017 | Pet Pride, Premium Beefhide Chips for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1 lb chip packages, UPC 11110882… | pet-pride/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0269-2017 | Luvsome, Premium Beefhide Chips for Dog, Distributed by: The Kroger Company, Cincinnati, OH, packaged in 1 lb chip packages, UPC 1111088207… | luvsome/beefhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |
| V-0270-2017 | Dentley's, Peanut Butter Flavor Rawhide Rolls, Pacific Coast Distributing, Inc. Phoenix, AZ USA 85027, packaged in 1\) 1 count 10'' roll pac… | dentleys/rawhide \(line\) | mixed: prefix AH; prefix AV; prefix A \(needs\_review\); prefix AI \+2 | lot\_parse |

### fda\_ires 77476: Loving Pets

- initiated 2017-06-07, classified 2017-11-16 (Class I), status Terminated
- pet food: **yes** (alias:loving-pets; alias:loving-pets\+petco-brand)
- brands: loving-pets, petco-brand; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/loving-pets-voluntarily-recalls-limited-lot-numbers-air-puffed-dog-treats-because-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2277476%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/loving-pets-voluntarily-recalls-limited-lot-numbers-air-puffed-dog-treats-because-possible)
- reason: According to Loving Pets Corporation, raw materials received from their supplier was potentially contaminated with salmonella. The Raw materials came with a CO…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0007-2018 | Loving Pets, 5 oz. Barksters Sweet Potato and Chicken UPC 842982057005 | loving-pets/barksters \(line\) | clean: best\_by\_range 2019-02-01..2019-02-28; exact 021619 |  |
| V-0008-2018 | Loving Pets, 5 oz. Barksters Brown Rice and Chicken UPC 842982057050 | loving-pets/barksters \(line\) | clean: best\_by\_range 2019-02-01..2019-02-28; exact 021419 |  |
| V-0009-2018 | Loving Pets, Puffsters Snack Chips 4 oz. Apple and Chicken UPC 842982051003 | loving-pets/puffsters \(line\) | clean: best\_by\_range 2019-05-01..2019-05-31; best\_by\_range 2018-11-01..2018-11-30; best\_by\_range 2019-01-01..2019-01-31; exact 051219 \+5 |  |
| V-0010-2018 | Loving Pets, Puffsters Snack Chips 4 oz. Banana and Chicken UPC 842982051102 | loving-pets/puffsters \(line\) | clean: best\_by\_range 2018-11-01..2018-11-30; best\_by\_range 2019-01-01..2019-01-31; exact 112218; exact 112818 \+2 |  |
| V-0011-2018 | Loving Pets, Puffsters Snack Chips 4 oz. Sweet Potato and Chicken UPC 842982051201 | loving-pets/puffsters \(line\) | clean: best\_by\_range 2018-11-01..2018-11-30; best\_by\_range 2019-02-01..2019-02-28; exact 112818; exact 020119 |  |
| V-0012-2018 | Loving Pets, Whole Hearted, 2.4 oz. Apple and Chicken Puff Treats UPC 800443220696 | loving-pets \(brand\), petco-brand/whole-hearted \(line\) | clean: best\_by\_range 2018-12-01..2018-12-31; best\_by\_range 2019-01-01..2019-01-31; exact 121418; exact 121918 \+4 |  |
| V-0013-2018 | Loving Pets, Puffsters 4 oz. Cranberry and Chicken UPC 842982051300 | loving-pets/puffsters \(line\) | clean: best\_by\_range 2019-02-01..2019-02-28; best\_by\_range 2018-11-01..2018-11-30; exact 020319; exact 112918 \+1 |  |

### fda\_ires 78090: Arrow Reliance, Inc

- initiated 2017-09-08, classified 2018-02-26 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2278090%22%7D%5D)
- reason: Natural Selections Frozen Duck Meals for Cats product is recalled due to a potential contamination with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0031-2018 | Natural Selections Duck Meals for Cats, frozen, packaged in 2 lb. net weight flexible film, partitioned into 4 quadrants. Darwin s Natural … | darwins/natural-selections \(line\) | clean: exact 38277 |  |

### fda\_ires 78676: Arrow Reliance Inc

- initiated 2017-12-04, classified 2018-03-15 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2278676%22%7D%5D)
- reason: Natural Selections brand Chicken with Organic Vegetables Meals for Dogs is recalled due to Salmonella and Listeria monocytogenes. Natural Selections brand Duck…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0072-2018 | Natural Selections Chicken with Organic Vegetables Meals for Dogs, packaged in 2 lb. net weight flexible film, partitioned into 4 quadrants. | darwins/natural-selections \(line\) | clean: exact 40727 |  |
| V-0073-2018 | Natural Selections Duck With Organic Vegetables Meals for Dogs, packaged in 2 lb. net weight flexible film, partitioned into 4 quadrants. | darwins/natural-selections \(line\) | clean: exact 40487 |  |
| V-0074-2018 | Natural Selections Turkey With Organic Vegetables Meals for Dogs, packaged in 2 lb. net weight flexible film, partitioned into 4 quadrants. | darwins/natural-selections \(line\) | clean: exact 39937; exact 40507 |  |

### fda\_ires 78945: JustFoodForDogs

- initiated 2018-01-12, classified 2018-10-22 (Class I), status Terminated
- pet food: **yes** (alias:justfoodfordogs)
- brands: justfoodfordogs; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/justfoodfordogs-voluntarily-recalls-three-daily-diets-because-possible-listeria-monocytogenes-health
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2278945%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/justfoodfordogs-voluntarily-recalls-three-daily-diets-because-possible-listeria-monocytogenes-health)
- reason: Consumer complaint initiated testing of dog food was positive for Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0012-2019 | JustFoodForDogs Turducken: USDA Certified Ground Turney, USDA Certified Ground Duck Breast, USDA Certified Ground Chicken Thigh; Butternut … | justfoodfordogs/daily-diets \(line\) | needs\_review: range DM12.1.18..DM12.31.18 \[14 oz\] \(needs\_review\); range WH11.1.18..WH12.31.18 \[14 oz\] \(needs\_review\); range WH11.1.18..WH12.31.18 \[72 oz\] \(needs\_review\); range DM12.1.18..DM12.31.18 \[… | lot\_parse |
| V-0013-2019 | JustFoodForDogs Beef and Russet Potato; USDA certified lean ground beef, russet potatoes, sweet potatoes, carrots, green beans, USDA certif… | justfoodfordogs/daily-diets \(line\) | needs\_review: range WH11.1.18..WH1.14.19 \[7 oz\] \(needs\_review\); range DM11.1.18..DM1.14.19 \[7 oz\] \(needs\_review\); range CM11.1.18..CM1.14.19 \[7 oz\] \(needs\_review\); range MB11.1.18..MB1.14.19 \[7 oz\] \(… | lot\_parse |
| V-0014-2019 | JustFoodForDogs Fish and Sweet Potato; Wild Caught Pacific Cod; Sweet Potatoes, Russet Potatoes, Green Beans, Broccoli, Safflower oil. Sold… | justfoodfordogs/daily-diets \(line\) | needs\_review: range WH11.1.18..WH1.14.19 \[7 oz\] \(needs\_review\); range DM11.1.18..DM1.14.19 \[7 oz\] \(needs\_review\); range CM11.1.18..CM1.14.19 \[7 oz\] \(needs\_review\); range MB11.1.18..MB1.14.19 \[7 oz\] \(… | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/justfoodfordogs-voluntarily-recalls-three-daily-diets-because-possible-listeria-monocytogenes-health: JustFoodForDogs

- initiated 2018-01-22, classified ?, status ?
- pet food: **yes** (alias:justfoodfordogs)
- brands: justfoodfordogs; linked: fda\_ires:78945
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/justfoodfordogs-voluntarily-recalls-three-daily-diets-because-possible-listeria-monocytogenes-health)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | JustFoodForDogs Dog Food | justfoodfordogs/daily-diets \(line\) | none |  |

### fda\_ires 79151: Christofersen Meats Co, Inc.

- initiated 2018-02-05, classified 2018-03-15 (Class I), status Terminated
- pet food: **yes** (alias:raws-for-paws)
- brands: raws-for-paws; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/raws-paws-recalls-turkey-pet-food-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279151%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raws-paws-recalls-turkey-pet-food-because-possible-salmonella-health-risk)
- reason: Turkey Pet food was found to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0081-2018 | Raws for Paws Ground Turkey Food for Pets, packaged in 1 lb. or 5 lbs. chubs in the following package configurations: 1. Product Code 99000… | raws-for-paws/raw-frozen \(line\) | needs\_review: production\_date 10/12/17 \[product code 9900008, 9900009\] \(needs\_review\); production\_date 10/12/2017 and 2/2/18 \[product code 9900014, 9900015\] \(needs\_review\) | lot\_parse |

### fda\_ires 79164: Redbarn Pet Products

- initiated 2018-02-06, classified 2018-11-01 (Class I), status Terminated
- pet food: **yes** (alias:redbarn; alias:petco-brand; alias:chewy-louie; alias:dentleys)
- brands: chewy-louie, dentleys, good-lovin, petco-brand, redbarn; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-expands-voluntary-recall-dog-chews, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-issues-voluntary-recall-dog-chews
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279164%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-expands-voluntary-recall-dog-chews) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-issues-voluntary-recall-dog-chews)
- reason: A sample collected by the Colorado Department of agriculture was positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0018-2019 | Redbarn, 5 Inch Bully Sticks, Premium Dog Chews, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas, UPC 785184205006; No packaging: the … | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0019-2019 | Redbarn, 7 Inch Bully Sticks, Premium Dog Chews, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas, UPC 785184207000; No packaging: the … | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0020-2019 | petco PRIME CUTS, 7'' Bully Stick, Net Wt. .74 OZ \(20 g\), Distributed by: International Pet Supplies and Distribution, Inc. San Diego, CA 9… | petco-brand/prime-cuts \(line\) | clean: suffix BC |  |
| V-0021-2019 | Time for Joy Holiday, bully stick chew for dogs, Net Wt. .49 OZ \(13.9 g\), 800443287781; No packaging: the label is a tag on the stick. | petco-brand/time-for-joy \(line\) | clean: suffix BC |  |
| V-0022-2019 | petco, PRIME CUTS, 3 pk, 7'' Steer Stick Net Wt. 1 OZ \(28 g\), 800443120446; No packaging: the label is a tag on a stick. | petco-brand/prime-cuts \(line\) | clean: suffix BC |  |
| V-0023-2019 | Redbarn 7 Inch Bully Sticks, Premium Dog Chews, 6 Count, Redbarn Pet Products, LLC Great Bend Kansas Net Wt. 4.2 OZ \(119 g\), 785184207161; … | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0024-2019 | Redbarn 9 in Bully Sticks, Premium Dog Chews, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas UPC 785184209004; No packaging: the labe… | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0025-2019 | Redbarn 30 in Bully Sticks, Premium Dog Chews, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas UPC 785184230015; No packaging: the lab… | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0026-2019 | Redbarn 36 in Bully Sticks, Premium Dog Chews, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas UPC 785184236017; No packaging: the lab… | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0027-2019 | Redbarn, Steer Sticks, Premium Dog Chews, 6 Count, Redbarn Pet Products, LLC Great Bend Kansas Net Wt. 0.8 OZ \(23 g\) UPC 785184245026; Pack… | redbarn/steer-sticks \(line\) | clean: suffix BC |  |
| V-0028-2019 | Redbarn, 5 in Steer Sticks, 10 Count, Redbarn Pet Products, LLC Great Bend Kansas Net Wt. 1.1 OZ \(31 g\) UPC 785184245101; Packaged in plast… | redbarn/steer-sticks \(line\) | clean: suffix BC |  |
| V-0029-2019 | Redbarn, 7 in Steer Sticks, 1 Count, Redbarn Pet Products, LLC Great Bend Kansas; UPC 785184247006; No packaging: the label is a tag on the… | redbarn/steer-sticks \(line\) | clean: suffix BC |  |
| V-0030-2019 | Redbarn, 7 in Steer Sticks, 3 Count, Redbarn Pet Products, LLC Great Bend Kansas; Net Wt. 2.4 OZ \(68 g\); UPC 785184251058; Packaged in plas… | redbarn/steer-sticks \(line\) | clean: suffix BC |  |
| V-0031-2019 | Redbarn 9'' Bully 1-Lb. Redbarn Pet Products, LLC Great Bend Kansas; UPC 785184290095; Packaged in plastic bags. | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0032-2019 | Chewy Louie 7in Bully Stick Premium Dog Chew Redbarn Pet Products, LLC Great Bend Kansas; Net Wt. 0.63 oz \(17 g\) UPC 785184807019; Packaged… | chewy-louie/bully-sticks \(line\) | clean: suffix BC |  |
| V-0033-2019 | Dentley 7 in Bully Stick, 1 stick / 7in / Net Wt 0.49 oz \(13.9 g\) UPC 737257479852; No packaging: the label is a tag on the stick. | dentleys/bully-sticks \(line\) | clean: suffix BC |  |
| V-0034-2019 | Good Lovin' Dog Chews Traditional Beef Steer Chews, Net Wt. 1.05 Oz \(29.8 g\) 10 Count, UPC 800443272732; Packaged in plastic bags | good-lovin \(brand\) | clean: suffix BC |  |
| V-0035-2019 | Good Lovin' Dog Chews Traditional Beef Bully Sticks, Net Wt. 2.4 Oz \(68 g\) 6 Count, UPC 800443272862; Packaged in plastic bags. | good-lovin/bully-sticks \(line\) | clean: suffix BC |  |
| V-0036-2019 | Good Lovin' 7 Inch Dog Chews Traditional Beef Bully Sticks, Net Wt. .49 Oz \(13.9 g\) 1 Count, UPC 800443272893; No packaging: the label is a… | good-lovin/bully-sticks \(line\) | clean: suffix BC |  |
| V-0037-2019 | Good Lovin' 5 Inch Dog Chews Traditional Beef Bully Sticks, Net Wt. .38 Oz \(10.8 g\) 1 Count, UPC 800443272947; No packaging: the label is a… | good-lovin/bully-sticks \(line\) | clean: suffix BC |  |
| V-0038-2019 | Good Lovin' XL Dog Chews Traditional Beef Bully Sticks, Net Wt. 1.7 Oz \(48.2 g\) 1 Count, UPC 800443273012; No packaging: the label is a tag… | good-lovin/bully-sticks \(line\) | clean: suffix BC |  |
| V-0039-2019 | Dog Chew 7'' Bully Stick, 1 Count, UPC 785184207017; No packaging: the label is a tag on the stick. | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0040-2019 | Dog Chew 7'' Bully Stick, 6 Count, UPC 785184207062; Packaged in plastic bags; No packaging: the label is a tag on the stick. | redbarn/bully-sticks \(line\) | clean: suffix BC |  |
| V-0041-2019 | Dog Chew 36'' Bully Stick, 1 Count, UPC 785184236116; No packaging: the label is a tag on the stick. | redbarn/bully-sticks \(line\) | clean: suffix BC |  |

### fda\_ires 79173: Smokehouse Pet Products

- initiated 2018-02-06, classified 2018-06-29 (Class I), status Terminated
- pet food: **yes** (alias:smokehouse)
- brands: smokehouse; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/recall-expansion-smokehouse-pet-products-inc-recalls-all-lots-beefy-munchies-sold-nationwide-because, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/smokehouse-pet-products-inc-recalls-limited-lots-beefy-munchies-sold-regionally-because-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279173%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/recall-expansion-smokehouse-pet-products-inc-recalls-all-lots-beefy-munchies-sold-nationwide-because) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/smokehouse-pet-products-inc-recalls-limited-lots-beefy-munchies-sold-regionally-because-possible)
- reason: Colorado Department of Agriculture sampled Beefy Munchies at retail and had a positive result for Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0250-2018 | Smokehouse Brand Beefy Munchies, Real flavors of Beef, slow roasted to perfection. Beef Lungs dog treats, Made in the USA. Ingredient: Beef… | smokehouse/beefy-munchies \(line\) | clean: all\_lots; best\_by\_date 2019-10-25; exact 449294 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/united-pet-group-expands-voluntary-recall-multiple-brands-rawhide-chew-products-dogs-also-include: United Pet Group, a division of Spectrum Brands, Inc.

- initiated 2018-02-06, classified ?, status ?
- pet food: **yes** (alias:companion-ahold\+dentleys)
- brands: companion-ahold, dentleys; linked: fda\_ires:77441
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/united-pet-group-expands-voluntary-recall-multiple-brands-rawhide-chew-products-dogs-also-include)
- reason: POSSIBLE CHEMICAL CONTAMINATION

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Companion, Dentley's and more Rawhide chew products | dentleys/rawhide \(line\), companion-ahold \(brand\), companion-ahold/chews \(line\), dentleys \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/evangers-voluntarily-recalls-hunk-beef-because-pentobarbital-exposure-one-batch-food: Evanger’s Dog &amp; Cat Food Co.

- initiated 2018-02-07, classified ?, status ?
- pet food: **yes** (alias:evangers)
- brands: evangers
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/evangers-voluntarily-recalls-hunk-beef-because-pentobarbital-exposure-one-batch-food)
- reason: Pentobarbital

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Evanger’s 12oz Hunk of Beef Dog food | evangers/hand-packed \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-expands-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels: J.M. Smucker Company

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:9lives\+everpet\+special-kitty)
- brands: 9lives, everpet, special-kitty; linked: fda\_ires:76151
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-expands-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels)
- reason: Due to Low Levels of Thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | 9LivesTM, EverPetTM, and Special KittyTM Canned cat food | 9lives \(brand\), everpet/wet \(line\), special-kitty/wet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-announces-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels: J.M. Smucker Company

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:9lives\+everpet\+special-kitty)
- brands: 9lives, everpet, special-kitty; linked: fda\_ires:76151
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-announces-limited-voluntary-recall-certain-lots-canned-cat-food-due-low-levels)
- reason: Possible low levels of thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | 9LivesTM, EverPetTM, and Special KittyTM Canned cat food | 9lives \(brand\), everpet/wet \(line\), special-kitty/wet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/petsmart-voluntarily-recalls-single-lot-grreat-choicer-canned-dog-food-due-possible-health-risk: PetSmart

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:grreat-choice)
- brands: grreat-choice
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/petsmart-voluntarily-recalls-single-lot-grreat-choicer-canned-dog-food-due-possible-health-risk)
- reason: metal contamination that could potentially be a choking hazard to pets

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Grreat Grreat Choice Adult Dog Food with Chicken &amp; Rice | grreat-choice/canned-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/against-grain-pet-food-voluntarily-recalls-one-lot-pulled-beef-due-potential-adulteration: Against The Grain Pet Foods

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:against-the-grain)
- brands: against-the-grain
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/against-grain-pet-food-voluntarily-recalls-one-lot-pulled-beef-due-potential-adulteration)
- reason: Potential Adulteration with Pentobarbital

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Against the Grain Dog Food | against-the-grain/canned \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/wellpet-voluntarily-recalls-limited-amount-one-recipe-canned-topper-dogs-due-potential-elevated: WellPet LLC

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:wellness)
- brands: wellness
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/wellpet-voluntarily-recalls-limited-amount-one-recipe-canned-topper-dogs-due-potential-elevated)
- reason: Elevated Levels of Naturally Occurring Beef Thyroid Hormone

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Wellness Beef Topper for Dogs | wellness/ninety-five-percent \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/eurocan-manufacturing-voluntarily-recalling-barnsdale-farmsr-pig-ears-because-possible-salmonella: EuroCan Manufacturing

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:barnsdale-farms\+houndstooth\+macs-choice)
- brands: barnsdale-farms, eurocan, houndstooth, macs-choice
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/eurocan-manufacturing-voluntarily-recalling-barnsdale-farmsr-pig-ears-because-possible-salmonella)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Barnsdale Farms®, HoundsTooth® and Mac's Choice® Dog treat- Pig Ears | barnsdale-farms/pig-ears \(line\), houndstooth/pig-ears \(line\), macs-choice/pig-ears \(line\), eurocan \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/smallbatch-pets-inc-voluntarily-recalls-frozen-2lb-chicken-blend-dogs-and-cats-due-possible: Smallbatch Pets Inc.

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:smallbatch)
- brands: smallbatch
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/smallbatch-pets-inc-voluntarily-recalls-frozen-2lb-chicken-blend-dogs-and-cats-due-possible)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Smallbatch Dog and cat food | smallbatch/frozen-blends \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/party-animal-recalls-dog-food-due-potential-presence-pentobarbital: Party Animal

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:cocolicious)
- brands: cocolicious
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/party-animal-recalls-dog-food-due-potential-presence-pentobarbital)
- reason: Presence of Pentobarbital

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Cocolicious Beef &amp; Turkey Dog Food | cocolicious \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/united-pet-group-voluntary-recalls-multiple-brands-rawhide-chew-products-dogs-due-possible-chemical: United Pet Group

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:american-beefhide\+digest-eeze\+healthy-hide\+good-n-fun\+good-n-fit)
- brands: american-beefhide, digest-eeze, good-n-fit, good-n-fun, healthy-hide
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/united-pet-group-voluntary-recalls-multiple-brands-rawhide-chew-products-dogs-due-possible-chemical)
- reason: Potential Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Various brands: American Beefhide, Digest-eeze, Healthy Hide, Healthy Hide Good n Fun, Healthy Hide Good n Fit Rawhide dog chews | american-beefhide \(brand\), digest-eeze \(brand\), good-n-fit/chews \(line\), healthy-hide/rawhide \(line\), good-n-fun/chews \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/loving-pets-voluntarily-recalls-limited-lot-numbers-air-puffed-dog-treats-because-possible: Loving Pets

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:loving-pets\+petco-brand)
- brands: loving-pets, petco-brand; linked: fda\_ires:77476
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/loving-pets-voluntarily-recalls-limited-lot-numbers-air-puffed-dog-treats-because-possible)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Loving Pets, Whole Hearted Dog treats | loving-pets \(brand\), petco-brand/whole-hearted \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-buffalo-voluntarily-recalls-one-lot-blue-wildernessr-rocky-mountain-recipe-tm-red-meat-dinner: Blue Buffalo Company

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:blue-buffalo)
- brands: blue-buffalo
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-buffalo-voluntarily-recalls-one-lot-blue-wildernessr-rocky-mountain-recipe-tm-red-meat-dinner)
- reason: elevated levels of naturally- occurring beef thyroid hormones

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | BLUE Wilderness, Rocky Mountain Recipe Dog food | blue-buffalo/wilderness \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/evangers-pet-food-and-against-grain-voluntarily-recalls-additional-products-out-abundance-caution: Evanger's Dog and Cat Food

- initiated 2018-02-08, classified ?, status ?
- pet food: **yes** (alias:evangers\+against-the-grain)
- brands: against-the-grain, evangers
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/evangers-pet-food-and-against-grain-voluntarily-recalls-additional-products-out-abundance-caution)
- reason: Potential Adulteration with Pentobarbital

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Evanger's, Against the Grain Hunk of Beef, Braised Beef, and Pulled Beef canned dog food | evangers/hand-packed \(line\), against-the-grain/canned \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/raws-paws-recalls-turkey-pet-food-because-possible-salmonella-health-risk: Raws for Paws

- initiated 2018-02-09, classified ?, status ?
- pet food: **yes** (alias:raws-for-paws)
- brands: raws-for-paws; linked: fda\_ires:79151
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raws-paws-recalls-turkey-pet-food-because-possible-salmonella-health-risk)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Raws for Paws Ground turkey pet food | raws-for-paws \(brand\) | none |  |

### fda\_ires 79188: Arrow Reliance Inc

- initiated 2018-02-10, classified 2018-03-15 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/fda-announcement-certain-raw-pet-foods-made-arrow-reliance-inc-including-darwins-natural-pet
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279188%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fda-announcement-certain-raw-pet-foods-made-arrow-reliance-inc-including-darwins-natural-pet)
- reason: ZooLogics Chicken Meals for Dogs is recalled due to the potential for contamination with Salmonella. ZooLogics Duck Meals for Dogs is recalled due to the poten…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0075-2018 | ZooLogics Chicken Meals for Dogs, Darwin's Natural Pet Products, each package contains 4 /8 oz. quadrants, Net wt: 2 lbs. No UPC. | darwins/zoologics \(line\) | clean: exact 41567 |  |
| V-0076-2018 | ZooLogics Duck Meals for Dogs, Darwin's Natural Pet Products, each package contains 4 /8 oz. quadrants, Net wt: 2 lbs. No UPC. | darwins/zoologics \(line\) | clean: exact 41957 |  |

### fda\_ires 79291: The J.M. Smucker Company, Inc.

- initiated 2018-02-12, classified 2018-03-14 (Class III), status Terminated
- pet food: **yes** (alias:gravy-train; alias:ol-roy; alias:kibbles-n-bits; alias:skippy-dog-food)
- brands: gravy-train, kibbles-n-bits, ol-roy, skippy-dog-food
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279291%22%7D%5D)
- reason: A TV station notified the firm and stated that certain varieties of their canned pet food products may contain Pentobarbital in low levels. The firm performed …

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0057-2018 | Gravy Train With Lamb &amp; Rice Chunks, packaged in metal cans with Net WT 13.2 OZ; UPC: 7910005430 on flat case and 7910052543 on cans; Distr… | gravy-train/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0058-2018 | Gravy Train; With T-Bone Flavor Chunks; packaged in metal cans with Net WT 13.2 OZ; UPC: 7910005410 on flat case and 7910052541 on cans; Di… | gravy-train/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0059-2018 | Gravy Train With Beef Chunks; packaged in metal cans with Net WT 22 OZ and UPC: 7910051647 on flat case and 7910051647 on cans; or with Net… | gravy-train/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0060-2018 | Gravy Train With Chicken Chunks; packaged in metal cans; Net WT 22 OZ with UPC: 7910051645 on flat case and 7910051645 on cans; and Net WT … | gravy-train/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0061-2018 | Gravy Train With Strips In Gravy; packaged in metal cans with Net WT 13.2 OZ; UPC: 7910005420 on flat case and 7910052542 on cans; Distribu… | gravy-train/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0062-2018 | Ol' Roy Dog Food Strips in Gravy With Turkey &amp; Bacon; packaged in metal cans with Net Wt 13.2 OZ; UPC: 7910017570 on flat case and 81131175… | ol-roy/wet \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0063-2018 | Kibbles 'n Bits brand Dog Food; Chef's Choice Homestyle Tender Slices With Real Beef, Chicken &amp; Vegetables in Gravy; packaged in metal cans… | kibbles-n-bits/homestyle \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0064-2018 | Kibbles 'n Bits brand Dog Food; Chef's Choice Bistro Tender Cuts With Real Turkey, Bacon &amp; Vegetables; packages in metal cans with Net Wt. … | kibbles-n-bits/bistro \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0065-2018 | Kibbles 'n Bits brand Dog Food; Chef's Choice Bistro Tender Cuts With Real Beef &amp; Vegetables In Gravy; packaged in metal cans with Net Wt. … | kibbles-n-bits/bistro \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0066-2018 | Skippy Premium Chunks in gravy; Chunky Stew; packaged in metal cans with Net Wt. 13.2 OZ; UPC: 7910052469 on flat case and 7910050249 on ca… | skippy-dog-food/premium \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0067-2018 | Skippy Premium Chunks in gravy; With Beef; packaged in metal cans with Net Wt. 13.2 OZ; UPC: 7910052508 on flat case and 7910050250 on cans… | skippy-dog-food/premium \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0068-2018 | Skippy Premium Strips in Gravy; With Beef; packaged in metal cans with Net Wt. 13.2 OZ; UPC: 7910052509 on flat case and 7910050245 on cans… | skippy-dog-food/premium \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0069-2018 | Kibbles 'n Bits 12 Can Variety Pack; Chef's Choice Bistro, containing 4 cans of Hearty Cuts with Real Beef, Chicken &amp; Vegetables In Gravy; … | kibbles-n-bits/bistro \(line\), kibbles-n-bits/homestyle \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0070-2018 | Kibbles 'n Bits 12 Can Variety Pack; containing 4 cans of Chef's Choice Bistro, Hearty Cuts with Real Beef, Chicken &amp; Vegetables In Gravy; … | kibbles-n-bits/bistro \(line\), kibbles-n-bits/homestyle \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |
| V-0071-2018 | Kibbles 'n Bits 12 Can Variety Pack; containing 6 cans of Chef's Choice American Grill, Burger Dinner With Real Bacon &amp; Cheese Bits In Grav… | kibbles-n-bits/bistro \(line\), kibbles-n-bits/american-grill \(line\) | mixed: best\_by\_range 2019-10-25..2021-02-09; range 6299..8040 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/smokehouse-pet-products-inc-recalls-limited-lots-beefy-munchies-sold-regionally-because-possible: Smokehouse Pet Products, Inc.

- initiated 2018-02-15, classified ?, status ?
- pet food: **yes** (alias:smokehouse)
- brands: smokehouse; linked: fda\_ires:79173
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/smokehouse-pet-products-inc-recalls-limited-lots-beefy-munchies-sold-regionally-because-possible)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Smokehouse Dog treats | smokehouse/beefy-munchies \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/fda-announcement-certain-raw-pet-foods-made-arrow-reliance-inc-including-darwins-natural-pet: Arrow Reliance Inc. dba Darwin’s Natural

- initiated 2018-02-15, classified ?, status ?
- pet food: **yes** (alias:darwins)
- brands: darwins; linked: fda\_ires:79188
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fda-announcement-certain-raw-pet-foods-made-arrow-reliance-inc-including-darwins-natural-pet)
- reason: Positive findings of Shiga toxin-producing E. coli O128, Salmonella and/or Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | ZooLogics and more ZooLogics Duck with Vegetable Meals for Dogs, ZooLogics Chicken with Vegetable Meals for Dogs and more | darwins/zoologics \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/recall-expansion-smokehouse-pet-products-inc-recalls-all-lots-beefy-munchies-sold-nationwide-because: Smokehouse Pet Products, Inc.

- initiated 2018-02-16, classified ?, status ?
- pet food: **yes** (alias:smokehouse)
- brands: smokehouse; linked: fda\_ires:79173
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/recall-expansion-smokehouse-pet-products-inc-recalls-all-lots-beefy-munchies-sold-nationwide-because)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Smokehouse Dog treats | smokehouse/beefy-munchies \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/updated-northwest-naturals-voluntarily-recalls-5lb-frozen-chicken-and-salmon-pet-food-chubs-because: Northwest Naturals

- initiated 2018-02-18, classified ?, status ?
- pet food: **yes** (alias:northwest-naturals)
- brands: northwest-naturals; linked: fda\_ires:79323
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/updated-northwest-naturals-voluntarily-recalls-5lb-frozen-chicken-and-salmon-pet-food-chubs-because)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Northwest Naturals Dog food | northwest-naturals \(brand\) | none |  |

### fda\_ires 79323: Northwest Naturals Inc

- initiated 2018-02-21, classified 2018-11-01 (Class I), status Terminated
- pet food: **yes** (alias:northwest-naturals)
- brands: northwest-naturals; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/updated-northwest-naturals-voluntarily-recalls-5lb-frozen-chicken-and-salmon-pet-food-chubs-because
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279323%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/updated-northwest-naturals-voluntarily-recalls-5lb-frozen-chicken-and-salmon-pet-food-chubs-because)
- reason: Raw Diet for Dogs Chicken &amp; Salmon Recipe, frozen, is recalled due to a potential for contamination with Listeria monocytogenes.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0042-2019 | Raw Diet for Dogs Chicken &amp; Salmon Recipe, Northwest Natural brand, frozen product, Net wt. 5 lbs. UPC 0 87316 38440 6 | northwest-naturals/raw-diet-dogs \(line\) | clean: best\_by\_date 2018-08-22; exact 15 082218 |  |

### fda\_ires 79330: Carnivore Meat Company, LLC

- initiated 2018-02-23, classified 2018-11-01 (Class I), status Terminated
- pet food: **yes** (alias:vital-essentials)
- brands: vital-essentials; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-vital-essentials-freeze-dried-beef-nibblets-entree
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279330%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-vital-essentials-freeze-dried-beef-nibblets-entree)
- reason: Pet food has the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0043-2019 | Vital Essentials Freeze-Dried Beef Nibblets. Purely raw. Instinctively healthy. Net Wt. 1 lb. \(452g\) UPC 33211-00894, Product \# 3894. Carni… | vital-essentials/freeze-dried \(line\) | clean: exact 20190614 13753; exact 13753 |  |

### fda\_ires 80013: TRUPET, LLC

- initiated 2018-02-23, classified 2018-11-01 (Class I), status Terminated
- pet food: **yes** (alias:trudog)
- brands: trudog; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/trupet-llc-issues-voluntary-recall-certain-treat-me-crunchy-beef-delight-pet-treats
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280013%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/trupet-llc-issues-voluntary-recall-certain-treat-me-crunchy-beef-delight-pet-treats)
- reason: Pet food has the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0046-2019 | TruDog, Treat Me Crunchy Beef Delight, Freeze-Dried Raw Super Treats for Dogs. Net Wt. 2.5 oz. \(71g\), UPC 52990-00522. TruPet, LLC, 100 Tec… | trudog/treat-me \(line\) | clean: exact 20190514 13753 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/trupet-llc-issues-voluntary-recall-certain-treat-me-crunchy-beef-delight-pet-treats: TruPet, LLC

- initiated 2018-02-23, classified ?, status ?
- pet food: **yes** (alias:trudog)
- brands: trudog; linked: fda\_ires:80013
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/trupet-llc-issues-voluntary-recall-certain-treat-me-crunchy-beef-delight-pet-treats)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | TruDog Dog food | trudog/treat-me \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-vital-essentials-freeze-dried-beef-nibblets-entree: Carnivore Meat Company

- initiated 2018-02-26, classified ?, status ?
- pet food: **yes** (alias:vital-essentials)
- brands: vital-essentials; linked: fda\_ires:79330
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-vital-essentials-freeze-dried-beef-nibblets-entree)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Vital Essentials Freeze-dried beef nibblets for dogs | vital-essentials/freeze-dried \(line\) | none |  |

### fda\_ires 79388: Environmental Trade INC

- initiated 2018-02-28, classified 2018-04-11 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-voluntarily-recalls-brb-complete-raw-pet-food-lotga0131-because-possible, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-kitten-grind-raw-pet-food-lotga1102-because-possible-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279388%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-voluntarily-recalls-brb-complete-raw-pet-food-lotga0131-because-possible) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-kitten-grind-raw-pet-food-lotga1102-because-possible-contamination)
- reason: May be contaminated with Listeria monocytogenes and Salmonella, as revealed by FDA sample analysis.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0085-2018 | Product label: Blue Ridge Beef Kitten Grind for Cats; Ingredients: Ground Beef; Keep Frozen until Ready for Use; Manufactured by Blue Ridge… | blue-ridge-beef/kitten-grind \(line\) | clean: exact GA1102; exact GA 1102 |  |
| V-0086-2018 | Blue Ridge Beef BRB Complete; Net Wt. 2 lbs. \(.91kg\); Keep Frozen Until Ready for Use; Manufactured by Blue Ridge Beef; Statesville, NC Cas… | blue-ridge-beef/kitten-grind \(line\), blue-ridge-beef/brb-complete \(line\) | mixed: exact GA0131; exact GA 1102 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-kitten-grind-raw-pet-food-lotga1102-because-possible-contamination: Name Blue Ridge Beef

- initiated 2018-03-01, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:79388
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-kitten-grind-raw-pet-food-lotga1102-because-possible-contamination)
- reason: Due to Possible Salmonella and L. Mono Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Raw pet food for cats | blue-ridge-beef/kitten-grind \(line\) | none |  |

### fda\_ires 79414: STEVE'S REAL FOOD FOR PETS

- initiated 2018-03-02, classified 2018-10-23 (Class I), status Terminated
- pet food: **yes** (alias:steves-real-food)
- brands: steves-real-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-raw-frozen-dog-food-turkey-canine-recipe-due-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279414%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-raw-frozen-dog-food-turkey-canine-recipe-due-possible)
- reason: One lot of Raw Frozen Dog Food Turkey Canine Recipe, 5 lb. packages, is recalled due to potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0015-2019 | Raw Frozen Dog Food Turkey Canine Recipe, Steve's Real Food brand, packaged in a flexible printed plastic bag. Net wt. 5 lb. UPC 6 91730 15… | steves-real-food/raw-frozen \(line\) | clean: best\_by\_date 2018-09-27; exact E 178 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-raw-frozen-dog-food-turkey-canine-recipe-due-possible: Steve’s Real Foods

- initiated 2018-03-02, classified ?, status ?
- pet food: **yes** (alias:steves-real-food)
- brands: steves-real-food; linked: fda\_ires:79414
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-raw-frozen-dog-food-turkey-canine-recipe-due-possible)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Steve’s Real Foods Raw frozen dog food turkey canine recipe | steves-real-food/raw-frozen \(line\) | none |  |

### fda\_ires 79434: Raw Basics, LLC

- initiated 2018-03-06, classified 2018-05-02 (Class I), status Terminated
- pet food: **yes** (alias:tuckers)
- brands: tuckers; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/raw-basics-llc-recalls-tuckers-5lb-pork-bison-box-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279434%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raw-basics-llc-recalls-tuckers-5lb-pork-bison-box-because-possible-salmonella-health-risk)
- reason: Product has the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0090-2018 | Tucker's Pork-Bison Formula, Raw Frozen, Complete &amp; Balanced Formula, Dog Food for all life stages. 2 - 2-1/2 LB Pouches, Net Weight 5 LB \(… | tuckers/raw-frozen \(line\) | clean: best\_by\_date 2019-04-17; exact 27717 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/raw-basics-llc-recalls-tuckers-5lb-pork-bison-box-because-possible-salmonella-health-risk: Raw Basics, LLC

- initiated 2018-03-06, classified ?, status ?
- pet food: **yes** (alias:tuckers)
- brands: tuckers; linked: fda\_ires:79434
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raw-basics-llc-recalls-tuckers-5lb-pork-bison-box-because-possible-salmonella-health-risk)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Tucker's 5lb Pork-Bison Box | tuckers/raw-frozen \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-issues-voluntary-recall-dog-chews: Redbarn Pet Products

- initiated 2018-03-07, classified ?, status ?
- pet food: **yes** (alias:redbarn)
- brands: redbarn; linked: fda\_ires:79164
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-issues-voluntary-recall-dog-chews)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Redbarn Dog Chews | redbarn \(brand\) | none |  |

### fda\_ires 79586: Radagast Pet Food, Inc.

- initiated 2018-03-20, classified 2018-05-02 (Class I), status Terminated
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279586%22%7D%5D)
- reason: Rad Cat Raw Diet Free-Range Chicken is recalled because they have the potential to be contaminated with Listeria monocytogenes. Rad Cat Raw Diet Free-Range Tur…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0088-2018 | Rad Cat Raw Diet Free-Range Chicken. Product has the following UPCs: UPC 851536001036 - 8 oz. tub UPC 851536001043 - 16 oz. tub UPC 8515360… | rad-cat/raw-diet \(line\) | clean: exact 62762 |  |
| V-0089-2018 | Rad Cat Raw Diet Free-Range Turkey. Product has the following UPCs: UPC 851536001005 - 8 oz. tub UPC 851536001012 - 16 oz. tub UPC 85153600… | rad-cat/raw-diet \(line\) | clean: exact 62926 |  |

### fda\_ires 79596: The J.M. Smucker Company, Inc.

- initiated 2018-03-22, classified 2018-05-02 (Class I), status Terminated
- pet food: **yes** (alias:milos-kitchen)
- brands: milos-kitchen
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279596%22%7D%5D)
- reason: The firm was notified that the product contains harmful, elevated levels of beef thyroid hormone.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0091-2018 | Milo's Kitchen home-style dog treats Grilled Burger Bites with Sweet Potato and Bacon 15 oz. bag UPC 079100521265 DISTRIBUTED FOR: Milo's K… | milos-kitchen/burger-bites \(line\) | clean: best\_by\_date 2018-11-19; exact 7147 |  |
| V-0092-2018 | Milos Kitchen Steak HOMESTYLE DOG TREATS Grillers/Steak Grillers Recipe with Angus Steak 10 oz. bag UPC 079100527762, 18 oz. bag UPC 079100… | milos-kitchen/grillers \(line\) | clean: best\_by\_date 2019-04-26; best\_by\_date 2018-11-15; exact 7305; exact 7143 |  |

### fda\_ires 79623: Arrow Reliance Inc

- initiated 2018-03-26, classified 2018-06-05 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279623%22%7D%5D)
- reason: Natural Selections Chicken Meals for Dogs and ZooLogics Chicken with Organic Vegetables Meals for Dogs are recalled due to potential to be contaminated with Sa…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0093-2018 | Natural Selections Chicken with Organic Vegetables Meals for Dogs, Net wt. 2 lbs. ZooLogics Chicken with Vegetables Meals for Dogs, Net wt.… | darwins/zoologics \(line\), darwins/natural-selections \(line\) | clean: exact 43887 \[Natural Selections\]; exact 44037 \[ZooLogics\] |  |
| V-0094-2018 | Natural Selections Duck with Organic Vegetables Meals for Dogs, Net wt. 2 lbs. The label is read in parts: "\*\*\*DARWIN'S Natural Pet Product… | darwins/natural-selections \(line\) | clean: exact 44147 |  |
| V-0095-2018 | ZooLogics Turkey with Vegetables Meals for Dogs, Net wt. 2 lbs. The ZooLogics brand label is read in parts: "\*\*\*DARWIN'S Natural Pet Produc… | darwins/zoologics \(line\) | clean: exact 44127 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-voluntarily-recalls-brb-complete-raw-pet-food-lotga0131-because-possible: Blue Ridge Beef

- initiated 2018-03-26, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:79388
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-voluntarily-recalls-brb-complete-raw-pet-food-lotga0131-because-possible)
- reason: Potential of contamination with Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Complete raw pet food | blue-ridge-beef/brb-complete \(line\) | none |  |

### fda\_ires 79827: TRUPET, LLC

- initiated 2018-04-03, classified 2018-07-26 (Class I), status Terminated
- pet food: **yes** (alias:trudog)
- brands: trudog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279827%22%7D%5D)
- reason: TruDog Boost Me, Freeze-Dried Raw Super Boost for Dogs, Lot 20190531 13815 has the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0276-2018 | TruDog Boost Me, Mighty Meaty Beef Booster, Freeze-Dried Raw Super Boost for Dogs. Net Wt. 3.5 oz. \(99g\), UPC 852990005028. TruPet LLC, 100… | trudog/boost-me \(line\) | clean: exact 20190531 13815 |  |

### fda\_ires 79829: K9 Natural Food Ltd

- initiated 2018-04-13, classified 2018-07-26 (Class I), status Terminated
- pet food: **yes** (alias:k9-natural)
- brands: k9-natural
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279829%22%7D%5D)
- reason: Colorado Department of Agriculture tested one sample of K9 Natural New Zealand Cage Free Chicken Feast lot 170517, 1 KG/2.2 LB, that resulted positive for List…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0277-2018 | K9 Natural, New Zealand Cage-Free Chicken Feast, Net Weight 1 KG/2.2 LB and 5 KG/11 LB | k9-natural/frozen \(line\) | clean: best\_by\_date 2018-11-17 \[2.2 LB\]; exact 170517 \[2.2 LB\]; best\_by\_date 2018-11-15 \[11 LB\]; best\_by\_date 2018-11-16 \[11 LB\] \+4 |  |

### fda\_ires 79897: Carnivore Meat Company, LLC

- initiated 2018-04-16, classified 2018-06-28 (Class I), status Terminated
- pet food: **yes** (alias:vital-essentials)
- brands: vital-essentials; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-limited-batches-vital-essentialsr-freeze-dried-beef
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279897%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-limited-batches-vital-essentialsr-freeze-dried-beef)
- reason: Raw dog food may have the potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0097-2018 | Vital Essentials Freeze-Dried Beef Toppers. Purely raw, Instinctively healthy. Entre for Dogs and Cats. Packaged in poly bags, Net Wt. 6 oz… | vital-essentials/freeze-dried \(line\) | clean: exact 20190601 13815; exact 20190604 13815; exact 20190620 13815 |  |
| V-0098-2018 | Vital Essentials Frozen Beef Entre For Dogs. Purely raw, Instinctively healthy. Packaged in chubs, Net Wt. 5 lbs. \(2.27kg\) UPC 033211008817… | vital-essentials/frozen \(line\) | clean: exact 20181227 13816 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-limited-batches-vital-essentialsr-freeze-dried-beef: Carnivore Meat Company

- initiated 2018-04-17, classified ?, status ?
- pet food: **yes** (alias:vital-essentials)
- brands: vital-essentials; linked: fda\_ires:79897
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carnivore-meat-company-issues-voluntary-recall-limited-batches-vital-essentialsr-freeze-dried-beef)
- reason: Salmonella
- review #576 link_listing (resolved): several iRES events match: 79330, 79897 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Vital Essentials® Dog/pet food Freeze-Dried Beef Toppers and Frozen Beef Chub | vital-essentials/freeze-dried \(line\), vital-essentials/frozen \(line\) | none |  |

### fda\_ires 79913: OC Raw Dog, LLC

- initiated 2018-04-20, classified 2018-08-29 (Class I), status Terminated
- pet food: **yes** (alias:oc-raw-dog)
- brands: oc-raw-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279913%22%7D%5D)
- reason: Potential C. bot. contamination due to fish being un-eviscerated and greater than 5 inches.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0283-2018 | OC Raw Dog Freeze Dried Sardines packaged in 3.2 oz. poly printed bags UPC No. 095225853043 | oc-raw-dog/freeze-dried \(line\) | clean: exact 17219; exact 17266; exact 17268; exact 18021 \+2 |  |

### fda\_ires 79914: OC Raw Dog, LLC

- initiated 2018-04-20, classified 2018-07-26 (Class I), status Terminated
- pet food: **yes** (alias:oc-raw-dog)
- brands: oc-raw-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2279914%22%7D%5D)
- reason: Potential Listeria monocytogenes contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0272-2018 | OC Raw Dog Chicken, Fish &amp; Produce Meaty Rox packages in 3 lb. Bags, UPC 022099069171 | oc-raw-dog/frozen \(line\) | clean: best\_by\_date 2018-10-11; exact 3652 |  |
| V-0273-2018 | OC Raw Dog Chicken, Fish &amp; Produce Slider packages in 4 lb. Bags, UPC 095225852640 | oc-raw-dog/frozen \(line\) | clean: best\_by\_date 2018-10-11; exact 3652 |  |
| V-0274-2018 | OC Raw Dog Chicken, Fish &amp; Produce Doggie Dozen Patty packages in 6.5 lb. Bags, UPC 022099069225 | oc-raw-dog/frozen \(line\) | clean: best\_by\_date 2018-10-11; exact 3652 |  |
| V-0275-2018 | OC Raw Dog Chicken, Fish &amp; Produce Meaty Rox packaged in 7 lb. Bags, UPC 095225852756 | oc-raw-dog/frozen \(line\) | clean: best\_by\_date 2018-10-11; exact 3652 |  |

### fda\_ires 80152: Merrick Pet Care \(Dry Plant\), Inc.

- initiated 2018-05-23, classified 2019-02-11 (Class II), status Terminated
- pet food: **yes** (alias:castor-and-pollux; alias:merrick)
- brands: castor-and-pollux, merrick; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/merrick-pet-care-voluntarily-recalls-limited-amount-good-buddy-and-backcountry-treats-containing
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280152%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/merrick-pet-care-voluntarily-recalls-limited-amount-good-buddy-and-backcountry-treats-containing)
- reason: Potential to contain elevated levels of a naturally-occurring beef thyroid hormone.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0103-2019 | Castor &amp; Pollux Good Buddy Prime Patties Real Beef 4 oz. packaged in a plastic pouch 6 per case | castor-and-pollux/good-buddy \(line\) | needs\_review: best\_by\_range 2017-05-01..2019-09-01 \(needs\_review\) | lot\_parse |
| V-0104-2019 | Castor &amp; Pollux Good Buddy Sausage Cuts Real Beef 5 oz. packaged in a plastic pouch 6 per case | castor-and-pollux/good-buddy \(line\) | needs\_review: best\_by\_range 2017-05-01..2019-09-01 \(needs\_review\) | lot\_parse |
| V-0105-2019 | Merrick Backcountry Great Plains Real Beef Jerky 4.5 oz. packaged in a plastic pouch 6 per case | merrick/backcountry \(line\) | needs\_review: best\_by\_range 2017-05-01..2019-09-01 \(needs\_review\) | lot\_parse |
| V-0106-2019 | Merrick Backcountry Great Plains Real Beef Sausage Cuts 5 oz. packaged in a plastic pouch 6 per case | merrick/backcountry \(line\) | needs\_review: best\_by\_range 2017-05-01..2019-09-01 \(needs\_review\) | lot\_parse |
| V-0107-2019 | Merrick Backcountry Great Plains Real Steak Patties 4 oz. packaged in a plastic pouch 6 per case | merrick/backcountry \(line\) | needs\_review: best\_by\_range 2017-05-01..2019-09-01 \(needs\_review\) | lot\_parse |

### fda\_ires 80273: Dave'S Soda And Pet City

- initiated 2018-06-12, classified 2019-02-22 (Class II), status Terminated
- pet food: **yes** (alias:daves-pet-food)
- brands: daves-pet-food
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280273%22%7D%5D)
- reason: Product contains elevated levels of thyroid hormones.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0110-2019 | dave's DOG FOOD 95% premium beef in a 13 oz. can, UPC \# of 6 85038-11167 8 | daves-pet-food/95-premium \(line\) | clean: best\_by\_range 2020-08-01..2020-08-31; exact P7SLBF81211A |  |

### fda\_ires 80455: Radagast Pet Food Inc.

- initiated 2018-07-06, classified 2018-08-10 (Class I), status Terminated
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280455%22%7D%5D)
- reason: Rad Cat Raw Diet Free-Range Chicken Recipe is recalled because it has the potential to be contaminated with Listeria monocytogenes. Rad Cat Raw Diet Pasture-Ra…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0279-2018 | Rad Cat Raw Diet Free-Range Chicken Recipe, packaged in plastic tubs. Product has the following UPCs: UPC 8 51536 00103 6 - 8oz tub, UPC 8 … | rad-cat/raw-diet \(line\) | clean: best\_by\_date 2019-10-09; best\_by\_date 2019-10-23; best\_by\_date 2019-10-31; exact 63057 \+2 |  |
| V-0280-2018 | Rad Cat Raw Diet Pasture-Raised Venison Recipe, packaged in plastic tubs. Product has the following UPCs: UPC 8 51536 00121 0 - 8oz tub, UP… | rad-cat/raw-diet \(line\) | clean: best\_by\_date 2019-10-15; exact 63063 |  |

### fda\_ires 80683: G &amp; C Raw, LLC

- initiated 2018-07-30, classified 2018-12-20 (Class I), status Terminated
- pet food: **yes** (species\+food:dog\+food; species\+food:dog\+patties; species\+food:dog\+chunks; alias:g-and-c-raw)
- brands: g-and-c-raw; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-expanding-recall-include-all-product-lots-manufactured-february-27-2018-through-july-20
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280683%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-expanding-recall-include-all-product-lots-manufactured-february-27-2018-through-july-20)
- reason: Positive for Listeria monocytogenes positive for Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0049-2019 | Ground Lamb Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0050-2019 | Ground Lamb Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0051-2019 | Turkey Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0052-2019 | Lamb Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0053-2019 | Beef Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0054-2019 | Ground beef Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0055-2019 | Sliced Beef Heart Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0056-2019 | Ground Beef Heart Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0057-2019 | Kim's Special Beef Organ Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0058-2019 | Ground Chicken Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0059-2019 | Chicken Mix Patties Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0060-2019 | Duck Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0061-2019 | Ground Duck Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0062-2019 | Ground Rabbit Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0063-2019 | Rabbit Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0064-2019 | Ground Beef Pancreas Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0065-2019 | Beef Liver Chunks Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0066-2019 | Beef Sweet Breads Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0067-2019 | Ground Pork Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0068-2019 | Pork Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0069-2019 | Shelby's Pork Organ Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0070-2019 | Tripe Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0071-2019 | Pat's Cat Beef cat food packaged in clear plastic containers | g-and-c-raw/pats-cat \(line\) | needs\_review: range 022718..072018 \(needs\_review\) | lot\_parse |
| V-0072-2019 | Pat's Cat Rabbit cat food packaged in clear plastic containers | g-and-c-raw/pats-cat \(line\) | needs\_review: range 022718..072018 \(needs\_review\) | lot\_parse |
| V-0073-2019 | Pat's Cat Duck cat food packaged in clear plastic containers | g-and-c-raw/pats-cat \(line\) | needs\_review: range 022718..072018 \(needs\_review\) | lot\_parse |
| V-0074-2019 | Ground Pollock Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0075-2019 | Chicken Veggie Mix Dog Food packaged in clear plastic containers | none | needs\_review: range 022718..072018 \(needs\_review\) | ambiguous, lot\_parse |
| V-0076-2019 | Pat's Cat Chicken cat food packaged in clear plastic containers | g-and-c-raw/pats-cat \(line\) | needs\_review: range 022718..072018 \(needs\_review\) | lot\_parse |
| V-0077-2019 | Pat's Cat Turkey cat food packaged in clear plastic containers | g-and-c-raw/pats-cat \(line\) | needs\_review: range 022718..072018 \(needs\_review\) | lot\_parse |

### fda\_ires 80859: Radagast Pet Food Inc

- initiated 2018-08-21, classified 2018-10-22 (Class I), status Terminated
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280859%22%7D%5D)
- reason: Radagast Pet Food, Inc. of Portland, OR is expanding its voluntary recall to include an additional quantity of Rad Cat Raw Diet across all varieties with the B…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0005-2019 | Rad Cat Raw Diet Free-Range Chicken, packaged in plastic tubs including 8 oz tubs with UPC 851536001036, 16 oz tubs with UPC 851536001043, … | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |
| V-0006-2019 | Rad Cat Raw Diet Free-Range Turkey Recipe, packaged in plastic tubs including 8 oz tubs with UPC 8515360010005, 16 oz tubs with UPC 8515360… | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |
| V-0007-2019 | Rad Cat Raw Diet Grass-Fed Beef Recipe, packaged in plastic tubs including 8 oz tubs with UPC 851536001241, 16 oz tubs with UPC 85153600125… | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |
| V-0008-2019 | Rad Cat Raw Diet Pasture-Raised Lamb Recipe, packaged in plastic tubs including 8 oz tubs with UPC 851536001067, 16 oz tubs with UPC 851536… | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |
| V-0009-2019 | Rad Cat Raw Diet Natural Pork Recipe, packaged in plastic tubs including 8 oz tubs with UPC 851536001296, 16 oz tubs with UPC 851536001289,… | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |
| V-0010-2019 | Rad Cat Raw Diet Pasture-Raised Venison Recipe, packaged in plastic tubs including 8 oz tubs with UPC 851536001210, 16 oz tubs with UPC 851… | rad-cat/raw-diet \(line\) | clean: best\_by\_range 2018-10-19..2019-12-03; range 62763..63101 |  |

### fda\_ires 80942: Bravo Packing, Inc.

- initiated 2018-08-31, classified 2018-11-01 (Class I), status Terminated
- pet food: **yes** (alias:performance-dog)
- brands: performance-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280942%22%7D%5D)
- reason: Potential for Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0017-2019 | Ground frozen dog food packaged in 2-pound bags, labeled in part, "PERFORMANCE DOG FOOD". Please note that there are no code dates on the b… | performance-dog/performance-dog \(line\) | mixed: exact 071418 \[case\]; all\_lots \[bag \(no code printed\)\] \(needs\_review\) | lot\_parse |

### fda\_ires 80983: STEVE'S REAL FOOD FOR PETS

- initiated 2018-09-07, classified 2018-10-22 (Class I), status Terminated
- pet food: **yes** (alias:steves-real-food; alias:quest-cat-food)
- brands: quest-cat-food, steves-real-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-one-lot-turducken-recipe-one-lot-quest-emu-and-one-lot-quest
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2280983%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-one-lot-turducken-recipe-one-lot-quest-emu-and-one-lot-quest)
- reason: Steves Real Food is voluntarily recalling one lot of 5lb Turducken Recipe, one lot of Quest Emu Diet, and one lot of Quest Beef Diet, due to their potential to…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0002-2019 | Raw Frozen Pet Food Turducken Recipe for cats and dogs, packaged in 5 lb bags with UPC 6-91730-15304-5 | steves-real-food/raw-frozen \(line\) | clean: best\_by\_date 2019-06-04; exact J155 |  |
| V-0003-2019 | Super Premium Food for Your Feline, Quest Cat Food, Emu Diet, packages in 2 lb bags with UPC 6-91730-17103-2 | quest-cat-food \(brand\) | clean: best\_by\_date 2019-08-18; exact B138 |  |
| V-0004-2019 | Super Premium Food For Your Feline, Quest Cat Food, Beef Diet, packages in 2 lb bags with UPC 6-91730-17101-8 | quest-cat-food \(brand\) | clean: best\_by\_date 2019-08-18; exact A138 |  |

### fda\_ires 81499: Whitebridge Pet Brands Llc

- initiated 2018-11-02, classified 2019-02-14 (Class I), status Terminated
- pet food: **yes** (alias:natural-life; alias:nutrisca)
- brands: natural-life, nutrisca; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-issues-recall-dry-food-due-elevated-levels-vitamin-d
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281499%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-issues-recall-dry-food-due-elevated-levels-vitamin-d)
- reason: Dry dog food may have high levels of vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0108-2019 | Natural Life Chicken &amp; Potato Dry Dog Food packaged Net Wt. 17.5 lbs packaged in paper bags, UPC: 0-12344-08175-1 | natural-life/dry-dog \(line\) | clean: best\_by\_range 2019-12-05..2020-08-10 |  |
| V-0109-2019 | Nutrisca Chicken and Chickpea Dry Dog Food packaged in the following sizes 1\) 4 lbs paper bags, UPC: 8-84244-12495-7; 2\) 15 lbs paper bags,… | nutrisca/dry-dog \(line\) | clean: best\_by\_range 2020-02-25..2020-09-13 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-issues-recall-dry-food-due-elevated-levels-vitamin-d: Natural Life Pet Products

- initiated 2018-11-02, classified ?, status ?
- pet food: **yes** (alias:natural-life)
- brands: natural-life; linked: fda\_ires:81499
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-issues-recall-dry-food-due-elevated-levels-vitamin-d)
- reason: Due to Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Natural Life Chicken &amp; Potato Dry Dog Food | natural-life/dry-dog \(line\) | none |  |

### fda\_ires 81526: Elm Pet Foods

- initiated 2018-11-06, classified 2019-08-07 (Class I), status Terminated
- pet food: **yes** (alias:elm)
- brands: elm; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/elm-pet-foods-recall-dry-dog-food-due-elevated-levels-vitamin-d
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281526%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/elm-pet-foods-recall-dry-dog-food-due-elevated-levels-vitamin-d)
- reason: ELM Pet Foods, Inc. is issuing a voluntary recall of Elm Chicken and Chickpea Recipe dog food because the products contain elevated levels of Vitamin D.
- review #144 unclassified (resolved): pet food undecided; firm: Elm Pet Foods; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0219-2019 | 3lb ELM CHICKEN AND CHICKPEA RECIPE - UPC \(0-70155-22507-8\) | elm/chicken-and-chickpea \(line\) | mixed: exact TD2 26 FEB 2019; best\_by\_date 2019-02-26 \(needs\_review\); exact TE1 30 APR 2019; best\_by\_date 2019-04-30 \(needs\_review\) \+3 | lot\_parse |
| V-0220-2019 | 28lb ELM CHICKEN AND CHICKPEA RECIPE - UPC \(0-70155-22513-9\) | elm/chicken-and-chickpea \(line\) | mixed: exact TB3 6 APR 2019; best\_by\_date 2019-04-06 \(needs\_review\); exact TA1 2 JULY 2019; best\_by\_date 2019-07-02 \(needs\_review\) \+1 | lot\_parse |

### fda\_ires 81543: Lidl US TRADING

- initiated 2018-11-06, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (alias:orlando)
- brands: orlando
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281543%22%7D%5D)
- reason: Lidl US, LLC has initiated a recall because their supplier notified them of elevated Vitamin D in the following products Nutrisca Life and Chicken pea Dry Dog …

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0009-2020 | Orlando Grain Free, Chicken &amp; Chickpea Super Food Recipe Dog Food, 10 lbs Bag, UPC 20735302 | orlando/grain-free \(line\) | clean: exact TI1 3 MAR 2019; exact TB2 21 MAR 2019; exact TB3 21 MAR 2019; exact TA2 19 APR 2019 \+4 |  |

### fda\_ires 81617: SUNSHINE MILLS INC

- initiated 2018-11-19, classified 2019-04-03 (Class I), status Terminated
- pet food: **yes** (alias:evolve; alias:sportsmans-pride; alias:triumph)
- brands: evolve, sportsmans-pride, triumph; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-dry-dog-food-due-potentially-elevated-levels-vitamin-d
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281617%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-dry-dog-food-due-potentially-elevated-levels-vitamin-d)
- reason: Possible elevated levels of Vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0119-2019 | Evolve Puppy Formula Natural Dog Food NET WT. 28 lbs UPC: 0-73657-00863-7 | evolve/puppy \(line\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |
| V-0120-2019 | Evolve Puppy Formula Natural Dog Food NET WT. 14 lbs UPC: 0-73657-00862-0 | evolve/puppy \(line\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |
| V-0121-2019 | Sportsman's Pride Large Breed Puppy Formula NET WT. 40 lbs. UPC 0-70155-10566-0 and 0-70155-10564-0 | sportsmans-pride/large-breed-puppy \(line\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |
| V-0122-2019 | Triumph Super Premium Dog Food Chicken &amp; Rice Recipe NET WT. 30 LBS UPC 0-73657-00875-0 | triumph \(brand\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |
| V-0123-2019 | Triumph Super Premium Dog Food Chicken &amp; Rice Recipe NET WT. 3.5 LBS UPC 0-73657-00873-6 | triumph \(brand\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |
| V-0124-2019 | Triumph Super Premium Dog Food Chicken &amp; Rice Recipe NET WT. 16 LBS UPC 0-73657-00874-3 | triumph \(brand\) | clean: best\_by\_range 2018-11-01..2019-11-08 |  |

### fda\_ires 81726: The Kroger Co

- initiated 2018-11-19, classified 2019-04-03 (Class I), status Terminated
- pet food: **yes** (alias:abound)
- brands: abound
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281726%22%7D%5D)
- reason: Possible elevated levels of Vitamin D.
- review #145 unclassified (resolved): pet food undecided; firm: The Kroger Co; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0116-2019 | Abound Chicken &amp; Brown Rice Recipe Net Wt 14 lb with UPC 11110-83573 | abound/dry-dog \(line\) | clean: best\_by\_range 2018-11-01..2019-11-16 |  |
| V-0117-2019 | Abound Chicken &amp; Brown Rice Recipe Net Wt 4 lb with UPC 11110-83556 | abound/dry-dog \(line\) | clean: best\_by\_range 2018-11-01..2019-11-16 |  |
| V-0118-2019 | Abound Chicken &amp; Brown Rice Recipe Net Wt 24 lb with UPC 11110-89076 | abound/dry-dog \(line\) | clean: best\_by\_range 2018-11-01..2019-11-16 |  |

### fda\_ires 81654: Anf Pet Inc

- initiated 2018-11-20, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (alias:anf)
- brands: anf; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/anf-pet-inc-issues-voluntary-precautionary-recall-dry-dog-food-due-potentially-elevated-levels
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281654%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/anf-pet-inc-issues-voluntary-precautionary-recall-dry-dog-food-due-potentially-elevated-levels)
- reason: Firm was notified by contact manufacturer of potential high levels of Vitamin D due to formulation error in concentration of vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0007-2020 | ANF Lamb and Rice Formula Adult Dry Dog Food: 7.5 Kilogram bags - UPC:9097203300 Made in the USA | anf/lamb-and-rice \(line\) | clean: exact TA2 20 NOV 2019; best\_by\_date 2019-11-20 |  |
| V-0008-2020 | ANF Lamb and Rice Formula Adult Dry Dog Food: 3 Kilograms - UPC: 9097231622 and Made in the USA | anf/lamb-and-rice \(line\) | clean: exact TE1 23 NOV 2019; best\_by\_date 2019-11-23 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/anf-pet-inc-issues-voluntary-precautionary-recall-dry-dog-food-due-potentially-elevated-levels: ANF, Inc

- initiated 2018-11-28, classified ?, status ?
- pet food: **yes** (alias:anf)
- brands: anf; linked: fda\_ires:81654
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/anf-pet-inc-issues-voluntary-precautionary-recall-dry-dog-food-due-potentially-elevated-levels)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | ANF Lamb and Rice Dry Dog Food | anf \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/elm-pet-foods-recall-dry-dog-food-due-elevated-levels-vitamin-d: ELM Pet Foods

- initiated 2018-11-29, classified ?, status ?
- pet food: **yes** (alias:elm)
- brands: elm; linked: fda\_ires:81526
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/elm-pet-foods-recall-dry-dog-food-due-elevated-levels-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Elm Pet Foods Pet Food | elm \(brand\) | none |  |

### fda\_ires 81713: Columbia River Natural Pet Foods Inc

- initiated 2018-12-04, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (alias:columbia-river)
- brands: columbia-river; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-voluntarily-expands-recall-include-cow-pie-and-chicken
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281713%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-voluntarily-expands-recall-include-cow-pie-and-chicken)
- reason: Cow Pie Fresh Frozen Meats Whole Food Nutrition for Dogs and Cats product \( lot 81917\) is recalled due to contamination with Listeria monocytogenes. Cow Pie Fr…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0010-2020 | Cow Pie Fresh Frozen Meats Whole Food Nutrition for Dogs and Cats, net wt. 2 lbs. The product label is read in parts: "\*\*\*COW PIE \*\*\* Fresh… | columbia-river/cow-pie \(line\) | clean: exact 81917; exact 72618 |  |
| V-0011-2020 | Chicken &amp; Vegetables Fresh Frozen Meats Whole Food Nutrition for Dogs and Cats, net wt. 2 lbs. The product label is read in parts: "\*\*\*CHIC… | columbia-river/chicken-and-vegetables \(line\) | clean: exact 111518 |  |

### fda\_ires 81735: The J.M. Smucker Company, Inc.

- initiated 2018-12-06, classified 2019-08-13 (Class II), status Terminated
- pet food: **yes** (alias:9lives)
- brands: 9lives
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281735%22%7D%5D)
- reason: Possible low levels of thiamine \(Vitamin B1\).

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0221-2019 | 9Lives Protein Plus with Tuna &amp; Chicken, 4 pack of cans, 5.5 oz each, UPC 7910021549 | 9lives/protein-plus \(line\) | clean: exact 8086 803; exact 8087 803; exact 8122 803; exact 8123 803 \+8 |  |
| V-0222-2019 | 9Lives Protein Plus with Tuna &amp; Liver, 4 pack of cans, 5.5 oz each, UPC 7910021748 | 9lives/protein-plus \(line\) | clean: exact 8257 803; exact 8107 803; exact 8205 803 |  |

### fda\_ires 81739: OMAHA STEAKS

- initiated 2018-12-10, classified 2019-05-16 (Class II), status Terminated
- pet food: **yes** (alias:omaha-steaks)
- brands: omaha-steaks
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281739%22%7D%5D)
- reason: Beef bone dog chews being recalled because they may splinter and injure dogs
- review #146 unclassified (resolved): pet food undecided; firm: OMAHA STEAKS; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0141-2019 | Real Beef Bone Bone Chews, Net Wt. 12 oz, Omaha Steaks International Inc., Omaha, NE. Packaged in plastic bags | omaha-steaks/bone-chews \(line\) | clean: exact 18 216; exact 18 220; exact 18 271; exact 18 281 \+1 |  |

### fda\_ires 81822: SUNSHINE MILLS INC

- initiated 2018-12-18, classified 2019-06-26 (Class II), status Terminated
- pet food: **yes** (alias:old-glory)
- brands: old-glory
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2281822%22%7D%5D)
- reason: Possible elevated levels of vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0207-2019 | Old Glory Dog Food Hearty Turkey &amp; Cheese Flavor 12.75 lbs UPC 0-70155-14297-9 | old-glory \(brand\) | mixed: exact TC3 29 OCTOBER 2018; best\_by\_date 2018-10-29 \(needs\_review\); exact TA1 30 OCTOBER 2018; best\_by\_date 2018-10-30 \(needs\_review\) \+4 | lot\_parse |

### fda\_ires 82018: Hill's Pet Nutrition Inc

- initiated 2019-01-30, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (alias:hills)
- brands: hills; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-additionally-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-voluntarily-recalls-select-canned-dog-food-excessive-vitamin-d, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2282018%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-additionally-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-voluntarily-recalls-select-canned-dog-food-excessive-vitamin-d) · [notice 3](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d)
- reason: Product may contain elevated levels of vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0014-2020 | Hill's Prescription Diet, Urinary Care, Chicken &amp; Vegetable Stew, 3384, Net Wt. 12.5 oz \(354 g\), Manufactured by: Hill's Pet Nutrition, Top… | hills/prescription-diet \(line\) | clean: exact 102020T10; exact 102020T25; exact 092020T29 |  |
| V-0015-2020 | Hill's Prescription Diet, Digestive Care, Chicken &amp; Vegetable Stew, Manufactured by: Hill's Pet Nutrition, Topeka, KS packaged in the follo… | hills/prescription-diet \(line\) | clean: exact 092020T28 \[SKU 3389\]; exact 102020T04 \[SKU 3389\]; exact 102020T10 \[SKU 3389\]; exact 102020T19 \[SKU 3389\] \+11 |  |
| V-0016-2020 | Hill's Science Diet, Small &amp; Toy Breed, Chicken &amp; Barley Entre, Adult 7\+, 4969, Net Wt. 5.8 oz \(164 g\), Manufactured by: Hill's Pet Nutriti… | hills/science-diet \(line\) | clean: exact 102020T18 |  |
| V-0017-2020 | Hill's Prescription Diet, Aging Care, g/d, Turkey Flavor, 7006, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, Topeka, KS; p… | hills/prescription-diet \(line\) | clean: exact 092020T22; exact 112020T19; exact 112020T20 |  |
| V-0018-2020 | Hill's Prescription Diet, Digestive Care, i/d, with Turkey, 7008, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, Topeka, KS;… | hills/prescription-diet \(line\) | clean: exact 092020T21; exact 092020T30; exact 102020T07; exact 102020T11 \+7 |  |
| V-0019-2020 | Hill's Prescription Diet, Joint Care, j/d, with Lamb, 7009, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, Topeka, KS; packa… | hills/prescription-diet \(line\) | clean: exact 112020T20 |  |
| V-0020-2020 | Hill's Prescription Diet, Kidney Care, k/d, with Chicken, 7010, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, Topeka, KS; p… | hills/prescription-diet \(line\) | clean: exact 102020T10; exact 102020T11 |  |
| V-0021-2020 | Hill's Prescription Diet, Digestive/Weight Glucose Management, w/d, Chicken Flavor, 7017, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pe… | hills/prescription-diet \(line\) | clean: exact 092020T30; exact 102020T11; exact 102020T12; exact 102020T24 \+3 |  |
| V-0022-2020 | Hill's Prescription Diet, Skin/Food Sensitivities, z/d, Original Flavor, Manufactured by: Hill's Pet Nutrition, packaged in the following w… | hills/prescription-diet \(line\) | clean: exact 102020T17 \[SKU 5403\]; exact 112020T22 \[SKU 5403\]; exact 102020T04 \[SKU 7018\]; exact 112020T22 \[SKU 7018\] |  |
| V-0023-2020 | Hill's Science Diet, Chicken &amp; Barley Entre, Puppy &lt;1, 7036, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans… | hills/science-diet \(line\) | clean: exact 102020T12 |  |
| V-0024-2020 | Hill's Science Diet, Turkey &amp; Barley Entre, Adult 1 - 6, 7038, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in ca… | hills/science-diet \(line\) | clean: exact 102020T06 |  |
| V-0025-2020 | Hill's Science Diet, Chicken &amp; Beef Entre, Adult 1 - 6, 7040, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in can… | hills/science-diet \(line\) | clean: exact 102020T13; exact 112020T10; exact 112020T11 |  |
| V-0026-2020 | Hill's Science Diet, Light, With Liver, Adult 1 - 6, 7048, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans, … | hills/science-diet \(line\) | clean: exact 112020T19 |  |
| V-0027-2020 | Hill's Science Diet, Chicken &amp; Barley Entre, Adult 7\+, 7055, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans… | hills/science-diet \(line\) | clean: exact 092020T31; exact 102020T13; exact 112020T03; exact 112020T31 |  |
| V-0028-2020 | Hill's Science Diet, Beef &amp; Barley Entre, Adult 7\+, 7056, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans, 1… | hills/science-diet \(line\) | clean: exact 092020T31; exact 102020T28; exact 112020T20; exact 112020T24 \+2 |  |
| V-0029-2020 | Hill's Science Diet, Turkey &amp; Barley Entre, Adult 7\+, 7057, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans,… | hills/science-diet \(line\) | clean: exact 112020T19 |  |
| V-0030-2020 | Hill's Prescription Diet, Metabolic \+ Mobility, Weight \+ Joint Care, Vegetable &amp; Tuna Stew, 10086, Net Wt. 12.5 oz \(354 g\), Manufactured by… | hills/prescription-diet \(line\) | clean: exact 102020T05; exact 102020T26 |  |
| V-0031-2020 | Hill's Prescription Diet, Digestive/Weight/Glucose Management, w/d, Vegetable &amp; Chicken Stew, 10129, Net Wt. 12.5 oz \(354 g\), Manufactured … | hills/prescription-diet \(line\) | clean: exact 102020T04; exact 102020T21; exact 112020T05; exact 112020T11 |  |
| V-0032-2020 | Hill's Prescription Diet, Digestive Care, i/d, Low Fat, Rice Vegetable &amp; Chicken Stew, 10423, Net Wt. 12.5 oz \(354 g\), Manufactured by: Hil… | hills/prescription-diet \(line\) | clean: exact 102020T17; exact 102020T19; exact 102020T28; exact 112020T04 |  |
| V-0033-2020 | Hill's Science Diet, Healthy Cuisine, Braised Beef, Carrots &amp; Peas Stew, Adult 7\+, 10452, Net Wt. 12.5 oz \(354 g\), Manufactured by: Hill's … | hills/science-diet \(line\) | clean: exact 102020T14; exact 102020T21; exact 102020T28 |  |
| V-0034-2020 | Hill's Prescription Diet, Derm Defense, Environmental Sensitivities, Chicken &amp; Vegetable Stew, 10509, Net Wt. 12.5 oz \(354 g\), Manufactured… | hills/prescription-diet \(line\) | clean: exact 102020T05 |  |
| V-0035-2020 | Hill's Science Diet, Youthful Vitality, Adult 7\+, Chicken &amp; Vegetable Stew, 10763, Net Wt. 12.5 oz \(354 g\), Manufactured by: Hill's Pet Nut… | hills/science-diet \(line\) | clean: exact 102020T04; exact 102020T05; exact 112020T11 |  |
| V-0036-2020 | Hill's Science Diet, Chicken &amp; Barley Entre, Adult 1 - 6, 7037, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in c… | hills/science-diet \(line\) | clean: exact 092020T22; exact 102020T13; exact 102020T14; exact 112020T23 \+1 |  |
| V-0037-2020 | Hill's Prescription Diet, Kidney Care, k/d, with Lamb, 2697, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans… | hills/prescription-diet \(line\) | clean: exact 102020T25 |  |
| V-0038-2020 | Hill's Science Diet, Perfect Weight, Adult, Chicken &amp; Vegetable Entre, 2975, Net Wt. 12.8 oz \(363 g\), Manufactured by: Hill's Pet Nutrition… | hills/science-diet \(line\) | clean: exact 092020T28 |  |
| V-0039-2020 | Hill's Prescription Diet, Urinary Care, c/d, multicare, Chicken &amp; Vegetable Stew, 3388, Net Wt. 5.5 oz \(156 g\), Manufactured by: Hill's Pet… | hills/prescription-diet \(line\) | clean: exact 102020T18 |  |
| V-0040-2020 | Hill's Prescription Diet, Weight Reduction, r/d, Original, 7014, Net Wt. 12.3 oz \(350 g\), Manufactured by: Hill's Pet Nutrition, packaged i… | hills/prescription-diet \(line\) | clean: exact 092020T28; exact 102020T27; exact 102020T28 |  |
| V-0041-2020 | Hill's Science Diet, Beef &amp; Barley Entre, Adult 1 - 6, 7039, Net Wt. 13 oz \(370 g\), Manufactured by: Hill's Pet Nutrition, packaged in cans… | hills/science-diet \(line\) | clean: exact 092020T31; exact 102020T21 |  |
| V-0042-2020 | Hill's Prescription Diet, Digestive Care, i/d, Low Fat, Rice, Vegetable, &amp; Chicken Stew, 3391, Net Wt. 5.5 oz \(156 g\), Manufactured by: Hil… | hills/prescription-diet \(line\) | clean: exact 092020T27 |  |
| V-0043-2020 | Hill's Science Diet, Healthy Cuisine, Braised Beef, Carrots &amp; Peas Stew, Adult 1 - 6, Premium Dog Food, 10451, Net Wt. 12.5 oz \(354 g\), Man… | hills/science-diet \(line\) | clean: exact 102020T28 |  |
| V-0044-2020 | Hill's Science Diet, Healthy Cuisine, Roasted Chicken, Carrots &amp; Spinach Stew, Adult 7\+, Premium Dog Food, 10449, Net Wt. 12.5 oz \(354 g\), … | hills/science-diet \(line\) | clean: exact 092020T28 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-voluntarily-recalls-select-canned-dog-food-excessive-vitamin-d: Hill's Pet Nutrition

- initiated 2019-01-31, classified ?, status ?
- pet food: **yes** (alias:hills)
- brands: hills; linked: fda\_ires:82018
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-voluntarily-recalls-select-canned-dog-food-excessive-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Hill's Science Diet Canned Dog Food | hills/science-diet \(line\) | none |  |

### fda\_ires 82268: Arrow Reliance Inc dba Darwin's Natural Pet Products

- initiated 2019-02-07, classified 2019-05-02 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2282268%22%7D%5D)
- reason: Natural Selections Chicken and Vegetable Meals for Dogs are recalled due to a potential contamination with Salmonella. Natural Selections Turkey and Vegetable …

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0128-2019 | Natural Selections Chicken and Vegetable Meals for Dogs, frozen, raw dog meals, packaged in 2 lbs. thermo-formed sealed plastic package, di… | darwins/natural-selections \(line\) | clean: exact 5309\(11\)181019; exact 5375\(11\)181106; exact 5309; exact 5375 |  |
| V-0129-2019 | Natural Selections Turkey and Vegetable Meals for Dogs, frozen, raw dog meals, packaged in 2 lbs. thermo-formed sealed plastic package, div… | darwins/natural-selections \(line\) | clean: exact 5339\(11\)181026; exact 5339 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d: Hill’s Pet Nutrition

- initiated 2019-03-20, classified ?, status ?
- pet food: **yes** (alias:hills)
- brands: hills; linked: fda\_ires:82018
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d)
- reason: Due to Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Hill’s Canned Dog Food | hills \(brand\) | none |  |

### fda\_ires 82482: Nestle Purina PetCare Co

- initiated 2019-03-29, classified 2019-07-22 (Class II), status Terminated
- pet food: **yes** (alias:muse)
- brands: muse; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/nestle-purina-petcare-company-voluntarily-recalls-limited-amount-muse-wet-cat-food-natural-chicken
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2282482%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/nestle-purina-petcare-company-voluntarily-recalls-limited-amount-muse-wet-cat-food-natural-chicken)
- reason: Product is contaminated with foreign objects which are a potential choking hazard.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0218-2019 | Muse by Purina Natural Chicken Recipe Plus Essential Nutrients in gravy Adult Cat Food in 3 oz \(85 g\) cans. | muse/wet \(line\) | clean: exact 80941162 L1MX1 |  |

### fda\_ires 82527: True Pet Food Project, Inc dba Smalls

- initiated 2019-03-30, classified 2019-04-30 (Class II), status Terminated
- pet food: **yes** (alias:smalls)
- brands: smalls
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2282527%22%7D%5D)
- reason: Product is not 100% meat.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0127-2019 | "Smalls Diamond Dust" Chicken Liver Powder, packaged in 1 oz plastic jars with black caps and yellow labels | smalls \(brand\) | needs\_review: all\_lots \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/nestle-purina-petcare-company-voluntarily-recalls-limited-amount-muse-wet-cat-food-natural-chicken: Nestle Purina PetCare Company

- initiated 2019-04-04, classified ?, status ?
- pet food: **yes** (alias:muse)
- brands: muse; linked: fda\_ires:82482
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/nestle-purina-petcare-company-voluntarily-recalls-limited-amount-muse-wet-cat-food-natural-chicken)
- reason: Potential Presence of Rubber Pieces

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Muse Wet Cat Food | muse/wet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/thorgensen-family-farm-recalls-raw-frozen-ground-pet-food-rabbit-duck-llama-pork-because-possible: Thogersen Family Farm

- initiated 2019-04-05, classified ?, status ?
- pet food: **yes** (pet food term:pet food)
- brands: none
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/thorgensen-family-farm-recalls-raw-frozen-ground-pet-food-rabbit-duck-llama-pork-because-possible)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Thogersen Family Farm raw frozen ground pet food | none | none | unmatched |

### fda\_ires 82895: G &amp; C Raw, LLC

- initiated 2019-05-20, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:g-and-c-raw)
- brands: g-and-c-raw
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2282895%22%7D%5D)
- reason: Possible presence of Listeria monocytogenes.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0342-2020 | G &amp; C Raw brand Ground Turkey dog food, 5 lb plastic bags | g-and-c-raw \(brand\) | clean: exact WWP042519 |  |
| V-0343-2020 | G &amp; C Raw brand Turkey Veggie Fruit Mix dog food, 2 lb plastic container with lid | g-and-c-raw \(brand\) | clean: exact WWP042519 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-additionally-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d: Hill’s Pet Nutrition

- initiated 2019-05-21, classified ?, status ?
- pet food: **yes** (alias:hills)
- brands: hills; linked: fda\_ires:82018
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/hills-pet-nutrition-additionally-expands-voluntary-recall-select-canned-dog-food-elevated-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Hill’s Canned Dog Food | hills \(brand\) | none |  |

### fda\_ires 83261: Pet Supplies Plus

- initiated 2019-06-25, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (pet food term:pig ears)
- brands: none; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/pet-supplies-plus-issues-consumer-advisory-bulk-pig-ear-product-fda-investigating-contaminated-pig
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283261%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/pet-supplies-plus-issues-consumer-advisory-bulk-pig-ear-product-fda-investigating-contaminated-pig)
- reason: Bulk pig ear products supplied to all locations by several different vendors are being recalled due to the potential of Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0005-2020 | Pig ears - pet treat. unpackaged. sold from self-serve bulk bins | none | mixed: exact PLU 15033 \(needs\_review\); retailer\_scope Pet Supplies Plus \(bulk bins\) | unmatched, lot\_parse |

### fda\_ires 83272: Texas Tripe

- initiated 2019-07-03, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:texas-tripe)
- brands: texas-tripe; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/fda-cautions-pet-owners-not-feed-texas-tripe-inc-raw-pet-food-due-salmonella-listeria-monocytogenes
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283272%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fda-cautions-pet-owners-not-feed-texas-tripe-inc-raw-pet-food-due-salmonella-listeria-monocytogenes)
- reason: Listeria monocytogenes and Salmonella detected in raw frozen pet food.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0357-2020 | Texas Tripe Boneless Beef Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case and 40 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0358-2020 | Texas Tripe Beef Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0359-2020 | Texas Tripe Coarse Ground Beef with Bone Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0360-2020 | Texas Tripe Shepherd's Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0361-2020 | Texas Tripe Wolf Run Dog Food Keep Frozen in 2lb and 5 lb bags. | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0362-2020 | Texas Tripe Wolf Run Plus Dog Food Keep Frozen in 2lb and 5 lb bags. | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0363-2020 | Texas Tripe All Star Bully Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0364-2020 | Texas Tripe Senior Pro Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0365-2020 | Texas Tripe Chicken BlendDog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0366-2020 | Texas Tripe Ground Chicken with Bone Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0367-2020 | Texas Tripe Ground Turkey Necks Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0368-2020 | Texas Tripe Turkey Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0369-2020 | Texas Tripe Chicken/Pork/Salmon with Eggs Keep Frozen Dog Food in 2lb and 5 lb bags. | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0370-2020 | Texas Tripe Green Tripe Dog Food Keep Frozen in 2lb and 5 lb bags. | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0371-2020 | Texas Tripe Chicken Tripe Complete Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0372-2020 | Texas Tripe Pork Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0373-2020 | Texas Tripe Beginners Choice Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0374-2020 | Texas Tripe Goat Tripe Complete Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0375-2020 | Texas Tripe Turkey Pork Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0376-2020 | Texas Tripe Beef Tripe with Ground Rabbit Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0377-2020 | Texas Tripe Phat Katz Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case and 40 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0378-2020 | Texas Tripe Duck-Rabbit Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case and 40 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |
| V-0379-2020 | Texas Tripe Boneless Chicken Blend Dog Food Keep Frozen in 2lb and 5 lb bags packaged in 20 lb case and 40 lb case | texas-tripe/raw \(line\) | clean: exact 19148; exact 19149; exact 19150; exact 19151 \+22 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/pet-supplies-plus-issues-consumer-advisory-bulk-pig-ear-product-fda-investigating-contaminated-pig: Pet Supplies Plus

- initiated 2019-07-03, classified ?, status ?
- pet food: **yes** (pet food term:pig ears)
- brands: none; linked: fda\_ires:83261
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/pet-supplies-plus-issues-consumer-advisory-bulk-pig-ear-product-fda-investigating-contaminated-pig)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | PSP Pig ears | none | none | unmatched |

### fda\_ires 83404: The Lennox Intl

- initiated 2019-07-21, classified 2019-10-05 (Class I), status Terminated
- pet food: **yes** (pet food term:pig ears)
- brands: none; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/expanded-lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283404%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/expanded-lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019)
- reason: The Lennox Intl Inc, 930 New Durham Rd, Edison NJ 08817 USA has initiated a recall of Pig Ears because of Salmonella contamination. Product with UPC, may or ma…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0004-2020 | Pig Ears, sold in bulk and individually wrapped | none | clean: best\_by\_range 2021-11-01..2021-11-30 | unmatched |

### fda\_ires 83405: Boesl Packing Company, Inc.

- initiated 2019-07-22, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:k9-kraving)
- brands: k9-kraving
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283405%22%7D%5D)
- reason: Raw pet food tested positive for Listeria monocytogenes.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0345-2020 | K9 Kraving Dog Food Beef and Vegetable Raw Dog Food, Net Wt. 1 lb \(454 g\), Boesl Packing Company, Inc. Baltimore, MD. | k9-kraving/raw \(line\) | clean: exact 14993 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019: Lennox Intl

- initiated 2019-07-26, classified ?, status ?
- pet food: **yes** (pet food term:pig ears)
- brands: none; linked: fda\_ires:83404
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Lennox Pig ears | none | none | unmatched |

### fda\_ires 83458: Raw Advantage

- initiated 2019-07-29, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:raw-advantage)
- brands: raw-advantage
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283458%22%7D%5D)
- reason: Frozen Chicken Dinner for Dogs product is recalled due to a potential for contamination with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0338-2020 | Chicken Dinner for Dogs, frozen, packaged in 1 lbs. \(453g\). UPC 8 34242 00100 2. The label is read in parts: "\*\*\* Chicken Dinner For Dogs \*… | raw-advantage/dinners \(line\) | none | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/expanded-lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019: Lennox Intl

- initiated 2019-07-30, classified ?, status ?
- pet food: **yes** (pet food term:pet treat)
- brands: none; linked: fda\_ires:83404
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/expanded-lennox-intl-inc-voluntary-recalling-natural-pig-ears-july-26-2019)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Lennox Pet treat-Pig ears | none | none | unmatched |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/fda-cautions-pet-owners-not-feed-texas-tripe-inc-raw-pet-food-due-salmonella-listeria-monocytogenes: Texas Tripe Inc.

- initiated 2019-08-15, classified ?, status ?
- pet food: **yes** (alias:texas-tripe)
- brands: texas-tripe; linked: fda\_ires:83272
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fda-cautions-pet-owners-not-feed-texas-tripe-inc-raw-pet-food-due-salmonella-listeria-monocytogenes)
- reason: Potential to be contaminated with Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Texas Tripe Raw frozen pet food | texas-tripe/raw \(line\) | none |  |

### fda\_ires 83570: Dog Goods USA

- initiated 2019-08-16, classified 2019-10-29 (Class I), status Ongoing
- pet food: **yes** (alias:chef-toby; alias:berkley-and-jensen)
- brands: berkley-and-jensen, chef-toby; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-expands-voluntary-recall-chef-toby-pig-ears-pet-treats-because-possible-salmonella, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-conduct-voluntary-recall-chef-toby-pig-ears-treats-because-possible-salmonella
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283570%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-expands-voluntary-recall-chef-toby-pig-ears-pet-treats-because-possible-salmonella) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-conduct-voluntary-recall-chef-toby-pig-ears-treats-because-possible-salmonella)
- reason: Non-irradiated, bulk and packaged "Chef Toby Pig Ears" are being recalled due to potential Salmonella contamination. The U.S. Food and Drug Administration \("FD…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0219-2020 | Non-irradiated, bulk and packaged "Chef Toby Pig Ears" Bulk pig ears in large bags have no lot codes, unknown weight. Packaged pig ears wit… | chef-toby/pig-ears \(line\) | mixed: exact 428590; exact 074599; exact 1106709; exact 210393 \+30 | lot\_parse |
| V-0220-2020 | 30 Packs of "Berkley &amp; Jensen" irradiated pig ears purchased at BJ's Wholesale Club stores since 9/1/2018. | berkley-and-jensen/pig-ears \(line\) | clean: retailer\_scope BJ's Wholesale Club |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-conduct-voluntary-recall-chef-toby-pig-ears-treats-because-possible-salmonella: Dog Goods USA LLC

- initiated 2019-08-16, classified ?, status ?
- pet food: **yes** (alias:chef-toby)
- brands: chef-toby; linked: fda\_ires:83570
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-conduct-voluntary-recall-chef-toby-pig-ears-treats-because-possible-salmonella)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Chef Toby Pig ears | chef-toby/pig-ears \(line\) | none |  |

### fda\_ires 83589: TDBBS, LLC.

- initiated 2019-08-17, classified 2019-11-08 (Class I), status Completed
- pet food: **yes** (alias:best-bully-sticks)
- brands: best-bully-sticks
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283589%22%7D%5D)
- reason: The products are being recalled due to potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0235-2020 | "Premium Thick Cut USA-Baked Pig Ears, 7ct", packaged in plastic bags sold through the firm's website \(lot 1759T1\); USA Pig Ears by Best Bu… | best-bully-sticks/treats \(line\) | mixed: exact 1759T1 \[7-pack\]; best\_by\_date 2021-04-22 \[8-pack\]; exact 1129T1 \[8-pack\]; exact 1549T1 \[8-pack\] \+9 | lot\_parse |

### fda\_ires 83630: Brutus and Barnaby, LLC

- initiated 2019-08-22, classified 2019-11-08 (Class I), status Terminated
- pet food: **yes** (alias:brutus-and-barnaby)
- brands: brutus-and-barnaby; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/brutus-barnaby-llc-recalls-all-size-bags-pig-ears-natural-treats-dogs-because-possible-salmonella
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283630%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/brutus-barnaby-llc-recalls-all-size-bags-pig-ears-natural-treats-dogs-because-possible-salmonella)
- reason: Brutus &amp; Barnaby Pig Ears product sampled by Michigan Department of Agriculture resulted positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0236-2020 | Brutus &amp; Barnaby PIG EARS, 100% Natural Pig Ears, Healthy Treat for Dogs 8 count, 12 count, 25 count and 100 count | brutus-and-barnaby/pig-ears \(line\) | needs\_review: all\_lots \(needs\_review\) | lot\_parse |

### fda\_ires 83683: Bravo Packing, Inc.

- initiated 2019-08-26, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:performance-dog)
- brands: performance-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283683%22%7D%5D)
- reason: Bravo Packing is recalling approximately 8,000 pounds \(200 boxes\) of "Performance Dog" frozen raw dog food, lot code "072219" because of the potential for the …

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0347-2020 | "Performance Dog" raw frozen dog food. Approximately 8,000 pounds \(200 boxes\) of "Performance Dog" frozen raw dog food, lot code "072219". … | performance-dog/performance-dog \(line\) | mixed: exact 072219 \[case\]; all\_lots \[bag \(no code printed\)\] \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/brutus-barnaby-llc-recalls-all-size-bags-pig-ears-natural-treats-dogs-because-possible-salmonella: Brutus &amp; Barnaby

- initiated 2019-08-27, classified ?, status ?
- pet food: **yes** (alias:brutus-and-barnaby)
- brands: brutus-and-barnaby; linked: fda\_ires:83630
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/brutus-barnaby-llc-recalls-all-size-bags-pig-ears-natural-treats-dogs-because-possible-salmonella)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Brutus &amp; Barnaby Pig ears | brutus-and-barnaby/pig-ears \(line\) | none |  |

### fda\_ires 83713: Woody's Pet Food Deli

- initiated 2019-08-30, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:woodys-pet-food-deli)
- brands: woodys-pet-food-deli
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283713%22%7D%5D)
- reason: Product was found to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0340-2020 | Woody's Pet Food Deli, Raw Chicken, Homemade Cat and Dog Food, with supplements, Net wt. 15 oz | woodys-pet-food-deli/raw \(line\) | clean: best\_by\_date 2020-08-17; exact 1521 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-expands-voluntary-recall-chef-toby-pig-ears-pet-treats-because-possible-salmonella: Dog Goods USA LLC

- initiated 2019-09-03, classified ?, status ?
- pet food: **yes** (alias:berkley-and-jensen)
- brands: berkley-and-jensen, chef-toby; linked: fda\_ires:83570
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/dog-goods-usa-llc-expands-voluntary-recall-chef-toby-pig-ears-pet-treats-because-possible-salmonella)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Berkley &amp; Jensen Pig Ears | berkley-and-jensen/pig-ears \(line\), chef-toby/pig-ears \(line\) | none |  |

### fda\_ires 83755: Big Dan's Trucking Inc.

- initiated 2019-09-09, classified 2019-11-12 (Class I), status Terminated
- pet food: **yes** (alias:big-dans)
- brands: big-dans
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283755%22%7D%5D)
- reason: Raw Ground Beef pet food was found positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0320-2020 | Big Dan's Trucking &amp; Pet Food, Inedible Ground Beef, Raw Product, Keep Frozen, Net Wt. 1 lb. \(454 g\) | big-dans/raw-ground \(line\) | needs\_review: all\_lots \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/tdbbs-voluntarily-recalls-pig-ear-pet-treats-no-illnesses-reported-strictly-precautionary: TDBBS LLC

- initiated 2019-09-24, classified ?, status ?
- pet food: **yes** (pet food term:pig ear)
- brands: none
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tdbbs-voluntarily-recalls-pig-ear-pet-treats-no-illnesses-reported-strictly-precautionary)
- reason: Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | TDBBS Pig ear pet treat | none | none | unmatched |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/tdbbs-voluntarily-recalls-pig-ear-pet-treats-no-illnesses-report-strictly-precautionary-xxxx: TDBBS LLC

- initiated 2019-09-26, classified ?, status ?
- pet food: **yes** (pet food term:pig ear)
- brands: none
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tdbbs-voluntarily-recalls-pig-ear-pet-treats-no-illnesses-report-strictly-precautionary-xxxx)
- reason: Possible Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | TDBBS Pig ear pet treat | none | none | unmatched |

### fda\_ires 83998: Hollywood Feed, LLC

- initiated 2019-10-11, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (pet food term:pig ears)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2283998%22%7D%5D)
- reason: The product is being recalled due to potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0339-2020 | Made in South America brand single pig ears sold in bulk containers. | none | clean: exact 3188; exact 428590-C; exact 428590-D; exact 428590-B \+7 | unmatched |

### fda\_ires 84267: Go Raw, LLC DBA Steve's Real Food

- initiated 2019-11-08, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:quest-cat-food)
- brands: quest-cat-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-recalls-one-lot-quest-beef-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2284267%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-recalls-one-lot-quest-beef-because-possible-salmonella-health-risk)
- reason: One lot of Quest Cat Food Prey Model Beef Diet, 2 lb. bags, is being voluntarily recalled due to its potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0346-2020 | Raw, frozen, pet food; Quest Cat Food Prey Model Beef Diet, packaged in a flexible, printed, plastic bag. Net wt. 2 lbs \(907 g\), 10 bags/ca… | quest-cat-food/frozen \(line\) | clean: best\_by\_date 2020-11-06; exact N218 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-recalls-one-lot-quest-beef-because-possible-salmonella-health-risk: Go Raw, LLC

- initiated 2019-11-14, classified ?, status ?
- pet food: **yes** (alias:quest-cat-food)
- brands: quest-cat-food; linked: fda\_ires:84267
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-recalls-one-lot-quest-beef-because-possible-salmonella-health-risk)
- reason: May be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Quest Beef Cat Food | quest-cat-food/frozen \(line\) | none |  |

### fda\_ires 84423: The J.M. Smucker Company, Inc.

- initiated 2019-12-04, classified 2020-01-23 (Class I), status Terminated
- pet food: **yes** (alias:special-kitty)
- brands: special-kitty; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-specific-lots-special-kittyr-wet-canned-cat-food-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2284423%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-specific-lots-special-kittyr-wet-canned-cat-food-due)
- reason: Firm is voluntarily recalling Special Kitty Mix Grilled Pate, canned feed, due to excessive level of choline chloride in product. Firm is voluntarily recalling…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0380-2020 | Special Kitty Mix Grilled Dinner Pate | special-kitty/wet \(line\) | clean: exact 9263803 |  |
| V-0381-2020 | Special Kitty Surf &amp; Turf Variety Pack Pate | special-kitty/wet \(line\) | clean: exact 9266803 |  |
| V-0382-2020 | Special Kitty Surf &amp; Turf Variety Pack Pate | special-kitty/wet \(line\) | clean: exact 9267803 |  |
| V-0383-2020 | Special Kitty Surf &amp; Turf Variety Pack Pate | special-kitty/wet \(line\) | clean: exact 9287803 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-specific-lots-special-kittyr-wet-canned-cat-food-due: The J. M. Smucker Company

- initiated 2019-12-05, classified ?, status ?
- pet food: **yes** (alias:special-kitty)
- brands: special-kitty; linked: fda\_ires:84423
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-specific-lots-special-kittyr-wet-canned-cat-food-due)
- reason: Products don’t meet the Company’s quality and safety standards

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Special Kitty Wet, canned cat food | special-kitty/wet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/kroger-louisville-division-recalls-abound-chicken-and-brown-rice-dog-food-because-elevated-vitamin-d: The Kroger Company

- initiated 2020-03-11, classified ?, status ?
- pet food: **yes** (alias:abound)
- brands: abound
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/kroger-louisville-division-recalls-abound-chicken-and-brown-rice-dog-food-because-elevated-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Abound Chicken &amp; Brown Rice Recipe dog food | abound/dry-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-recalls-cow-pie-fresh-frozen-meats-dogs-and-cats-because: Columbia River Natural Pet Foods

- initiated 2020-03-11, classified ?, status ?
- pet food: **yes** (alias:columbia-river)
- brands: columbia-river
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-recalls-cow-pie-fresh-frozen-meats-dogs-and-cats-because)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Columbia River Natural Pet Foods Frozen meat product for dogs and cats | columbia-river/cow-pie \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-voluntarily-expands-recall-include-cow-pie-and-chicken: Columbia River Natural Pet Foods

- initiated 2020-03-11, classified ?, status ?
- pet food: **yes** (alias:columbia-river)
- brands: columbia-river; linked: fda\_ires:81713
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/columbia-river-natural-pet-foods-inc-voluntarily-expands-recall-include-cow-pie-and-chicken)
- reason: Due to Possible Salmonella and L. Mono Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Columbia River Natural Pet Foods Dog and Cat fresh frozen meats | columbia-river/cow-pie \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/king-soopers-and-city-market-recalls-abound-chicken-and-brown-rice-dog-food-because-elevated-vitamin: Abound

- initiated 2020-03-11, classified ?, status ?
- pet food: **yes** (alias:abound)
- brands: abound
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/king-soopers-and-city-market-recalls-abound-chicken-and-brown-rice-dog-food-because-elevated-vitamin)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Abound Chicken &amp; Brown Rice Recipe dog food | abound/dry-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-issues-voluntary-recall-specific-lots-9livesr-protein-plusr-wet-canned-cat-food: J.M Smuckers Company

- initiated 2020-03-11, classified ?, status ?
- pet food: **yes** (alias:9lives)
- brands: 9lives
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/jm-smucker-company-issues-voluntary-recall-specific-lots-9livesr-protein-plusr-wet-canned-cat-food)
- reason: Due to Low Levels of Thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | 9Lives Cat food | 9lives/protein-plus \(line\) | none |  |

### fda\_ires 85245: IcelandicPlus LLC

- initiated 2020-03-13, classified 2020-04-02 (Class I), status Terminated
- pet food: **yes** (alias:icelandicplus)
- brands: icelandicplus; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/icelandicplus-llc-voluntarily-recalls-whole-capelin-fish-pet-treats-because-product-exceeds-fda-size
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2285245%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/icelandicplus-llc-voluntarily-recalls-whole-capelin-fish-pet-treats-because-product-exceeds-fda-size)
- reason: IcelandicPLUS LLC is initiating a voluntary recall of Capelin Whole Fish. A package of Capelin Whole Fish was found to contain some capelin fish greater than 5…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0410-2020 | Capelin Whole Fish Treats, 1.5 oz, 2.5 oz packages . Package in plastic tube or plastic gusseted bags . 6 bags per case for 2.5 oz packages… | icelandicplus/whole-fish \(line\) | needs\_review: best\_by\_range 2020-02-01..2020-02-29 \(needs\_review\); best\_by\_range 2020-03-01..2020-03-31 \(needs\_review\); best\_by\_range 2020-04-01..2020-04-30 \(needs\_review\); best\_by\_range 2020-05-01..… | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-dry-dog-food-due-potentially-elevated-levels-vitamin-d: Sunshine Mills Inc.

- initiated 2020-03-16, classified ?, status ?
- pet food: **yes** (alias:evolve\+sportsmans-pride\+triumph)
- brands: evolve, sportsmans-pride, triumph; linked: fda\_ires:81617
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-dry-dog-food-due-potentially-elevated-levels-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Evolve, Sportsman's Pride, and Triumph Dry Dog Food | sportsmans-pride \(brand\), evolve \(brand\), triumph/dry-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/nutrisca-issues-recall-dry-dog-food-due-elevated-levels-vitamin-d: Nutrisca

- initiated 2020-03-16, classified ?, status ?
- pet food: **yes** (alias:nutrisca)
- brands: nutrisca
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/nutrisca-issues-recall-dry-dog-food-due-elevated-levels-vitamin-d)
- reason: Due to Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Nutrisca Chicken and Chickpea Dry Dog Food | nutrisca/dry-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-expands-recall-dry-food-due-elevated-levels-vitamin-d: Natural Life Pet Products

- initiated 2020-03-16, classified ?, status ?
- pet food: **yes** (alias:natural-life)
- brands: natural-life
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/natural-life-pet-products-expands-recall-dry-food-due-elevated-levels-vitamin-d)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Natural Life Chicken and Potato Dry Dog Food | natural-life/dry-dog \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/association-sunshine-mills-lidl-voluntarily-recalls-orlando-brand-grain-free-chicken-chickpea: Lidl US

- initiated 2020-03-16, classified ?, status ?
- pet food: **yes** (alias:orlando)
- brands: orlando
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/association-sunshine-mills-lidl-voluntarily-recalls-orlando-brand-grain-free-chicken-chickpea)
- reason: Potentially Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Orlando Chicken and Chickpea dog food | orlando/grain-free \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-one-lot-turducken-recipe-one-lot-quest-emu-and-one-lot-quest: Steve's Real Food

- initiated 2020-03-19, classified ?, status ?
- pet food: **yes** (alias:steves-real-food\+quest-cat-food)
- brands: quest-cat-food, steves-real-food; linked: fda\_ires:80983
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/steves-real-food-voluntarily-recalls-one-lot-turducken-recipe-one-lot-quest-emu-and-one-lot-quest)
- reason: Due to Possible Salmonella and L. Mono Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Steve's Real Food, Quest Pet food | steves-real-food \(brand\), quest-cat-food \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-recalls-performance-dog-raw-pet-food-because-possible-salmonella-health-risk: Bravo Packing, Inc.

- initiated 2020-03-19, classified ?, status ?
- pet food: **yes** (alias:performance-dog)
- brands: bravo-packing-house, performance-dog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-recalls-performance-dog-raw-pet-food-because-possible-salmonella-health-risk)
- reason: Potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Performance Dog frozen raw pet food | performance-dog/performance-dog \(line\), bravo-packing-house \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-expanding-recall-include-all-product-lots-manufactured-february-27-2018-through-july-20: G &amp; C Raw, LLC

- initiated 2020-03-19, classified ?, status ?
- pet food: **yes** (alias:g-and-c-raw)
- brands: g-and-c-raw; linked: fda\_ires:80683
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-expanding-recall-include-all-product-lots-manufactured-february-27-2018-through-july-20)
- reason: Listeria

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | G &amp; C Raw, Kim’s Special, Pat’s Cat Raw dog and cat food | g-and-c-raw/dog-raw \(line\), g-and-c-raw/pats-cat \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-voluntarily-expands-recall-include-rad-cat-raw-diet-products-best-dates-101918: Radagast Pet Food, Inc.

- initiated 2020-03-20, classified ?, status ?
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-voluntarily-expands-recall-include-rad-cat-raw-diet-products-best-dates-101918)
- reason: Potential to be contaminated with Listeria monocytogenes
- review #574 link_listing (open): several iRES events match: 79586, 80455, 80859

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Rad Cat Rad Cat Raw Diet | rad-cat/raw-diet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-recalls-pats-cat-turkey-and-ground-lamb-pet-food-because-possible-listeria-monocytogenes: G &amp; C Raw LLC

- initiated 2020-03-23, classified ?, status ?
- pet food: **yes** (alias:g-and-c-raw)
- brands: g-and-c-raw
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/g-c-raw-llc-recalls-pats-cat-turkey-and-ground-lamb-pet-food-because-possible-listeria-monocytogenes)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | G &amp; C Raw, more Ground Lamb Dog Food and Ground Turkey Cat Food | g-and-c-raw/pats-cat \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/icelandicplus-llc-voluntarily-recalls-whole-capelin-fish-pet-treats-because-product-exceeds-fda-size: IcelandicPlus LLC

- initiated 2020-03-23, classified ?, status ?
- pet food: **yes** (alias:icelandicplus)
- brands: icelandicplus; linked: fda\_ires:85245
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/icelandicplus-llc-voluntarily-recalls-whole-capelin-fish-pet-treats-because-product-exceeds-fda-size)
- reason: Potential for Clostridium botulinum

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Icelandic\+ Whole Capelin Fish Pet Treats | icelandicplus/whole-fish \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-inc-voluntarily-recalls-three-lots-rad-cat-raw-diet-free-range-chicken-recipe-and: Radagast Pet Food, Inc.

- initiated 2020-03-24, classified ?, status ?
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-inc-voluntarily-recalls-three-lots-rad-cat-raw-diet-free-range-chicken-recipe-and)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Rad Cat Raw Diet Cat Food \(Free Range Chicken; Pasture-Raised Venison\) | rad-cat/raw-diet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/daves-pet-food-voluntarily-recalls-95-premium-beef-canned-dog-food-due-potentially-elevated-levels: Dave’s Pet Food

- initiated 2020-03-25, classified ?, status ?
- pet food: **yes** (alias:daves-pet-food)
- brands: daves-pet-food
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/daves-pet-food-voluntarily-recalls-95-premium-beef-canned-dog-food-due-potentially-elevated-levels)
- reason: Due to Potentially Elevated Levels of Thyroid Hormone

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Dave’s Pet Food ‎95% Premium beef cans | daves-pet-food/95-premium \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/merrick-pet-care-voluntarily-recalls-limited-amount-good-buddy-and-backcountry-treats-containing: Merrick Pet Care

- initiated 2020-03-27, classified ?, status ?
- pet food: **yes** (alias:castor-and-pollux\+merrick)
- brands: castor-and-pollux, merrick; linked: fda\_ires:80152
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/merrick-pet-care-voluntarily-recalls-limited-amount-good-buddy-and-backcountry-treats-containing)
- reason: Ingredient Level

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Castor &amp; Pollux, Merrick ‎Beef dog treat varieties | castor-and-pollux/good-buddy \(line\), merrick/backcountry \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/trupet-llc-recalls-boost-me-mighty-meaty-beef-topper-meal-enhancer-because-possible-salmonella: TruPet, LLC

- initiated 2020-04-06, classified ?, status ?
- pet food: **yes** (alias:trudog)
- brands: trudog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/trupet-llc-recalls-boost-me-mighty-meaty-beef-topper-meal-enhancer-because-possible-salmonella)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | TRUDOG Pet food-freezed dried raw beef topper | trudog/boost-me \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/oc-raw-dog-llc-recalls-freeze-dried-sardines-because-product-exceeds-fda-size-restrictions: OC Raw Dog, LLC

- initiated 2020-04-06, classified ?, status ?
- pet food: **yes** (alias:oc-raw-dog)
- brands: oc-raw-dog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/oc-raw-dog-llc-recalls-freeze-dried-sardines-because-product-exceeds-fda-size-restrictions)
- reason: Incorrect compliance guidelines

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | OC Raw Dog Freeze Dried Sardines | oc-raw-dog/freeze-dried \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/oc-raw-dog-llc-recalls-one-lot-chicken-fish-produce-because-possible-health-risk: OC Raw Dog, LLC

- initiated 2020-04-06, classified ?, status ?
- pet food: **yes** (alias:oc-raw-dog)
- brands: oc-raw-dog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/oc-raw-dog-llc-recalls-one-lot-chicken-fish-produce-because-possible-health-risk)
- reason: Listeria

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | OC Raw Dog Chicken, Fish, &amp; Produce Dog Food | oc-raw-dog/frozen \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/darwins-natural-pet-products-issues-voluntary-recalls-darwins-brand-dog-foods-due-contamination: Darwin’s Natural Pet Products

- initiated 2020-04-07, classified ?, status ?
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/darwins-natural-pet-products-issues-voluntary-recalls-darwins-brand-dog-foods-due-contamination)
- reason: Due To Contamination Salmonella And Shiga Toxin-Producing Escherichia Coli O128

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Natural Selections and ZooLogics Fresh raw meals for dogs | darwins/zoologics \(line\), darwins/natural-selections \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/k9-natural-ltd-voluntarily-recalls-k9-natural-frozen-chicken-feast-raw-pet-food-22lb-and-11lb-bags: K9 Natural Ltd

- initiated 2020-04-07, classified ?, status ?
- pet food: **yes** (alias:k9-natural)
- brands: k9-natural
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/k9-natural-ltd-voluntarily-recalls-k9-natural-frozen-chicken-feast-raw-pet-food-22lb-and-11lb-bags)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | K9 Natural Pet food | k9-natural/frozen \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-inc-voluntarily-recalls-one-lot-rad-cat-raw-diet-free-range-chicken-and-one-lot: Radagast Pet Food, Inc.

- initiated 2020-04-08, classified ?, status ?
- pet food: **yes** (alias:rad-cat)
- brands: rad-cat
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/radagast-pet-food-inc-voluntarily-recalls-one-lot-rad-cat-raw-diet-free-range-chicken-and-one-lot)
- reason: Potential to be contaminated with Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Rad Cat Free-Range Chicken and Turkey Recipes \(Raw Diet\) for Cats | rad-cat/raw-diet \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/limited-production-two-varieties-milos-kitchenr-dog-treats-voluntarily-recalled-due-potentially: J.M. Smucker Company

- initiated 2020-04-08, classified ?, status ?
- pet food: **yes** (alias:milos-kitchen)
- brands: milos-kitchen
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/limited-production-two-varieties-milos-kitchenr-dog-treats-voluntarily-recalled-due-potentially)
- reason: Elevated Levels of Thyroid Hormone

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Milo’s Kitchen Dog treats | milos-kitchen \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-expands-voluntary-recall-dog-chews: Redbarn Pet Products, LLC

- initiated 2020-04-10, classified ?, status ?
- pet food: **yes** (alias:redbarn\+chewy-louie\+dentleys\+good-lovin)
- brands: chewy-louie, dentleys, good-lovin, redbarn; linked: fda\_ires:79164
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/redbarn-pet-products-expands-voluntary-recall-dog-chews)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Redbarn, Chewy Louie, Dentley's, and Good Lovin' Bully Stick dog food | redbarn/bully-sticks \(line\), chewy-louie/bully-sticks \(line\), dentleys/bully-sticks \(line\), good-lovin/bully-sticks \(line\) | none |  |

### fda\_ires 85961: The J.M. Smucker Company, Inc.

- initiated 2020-07-02, classified 2020-07-17 (Class I), status Terminated
- pet food: **yes** (alias:natural-balance)
- brands: natural-balance; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-one-lot-natural-balancer-ultra-premium-chicken-liver
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2285961%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-one-lot-natural-balancer-ultra-premium-chicken-liver)
- reason: Product potentially contains an excessive level of choline chloride.
- review #176 unclassified (resolved): pet food undecided; firm: The J.M. Smucker Company, Inc.; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0449-2020 | Ultra Premium Chicken and Liver Pate Formula in a 5.5 oz. metal can \(24 cans per case\). | natural-balance/original-ultra \(line\) | clean: best\_by\_date 2021-08-04; exact 9217803 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-one-lot-natural-balancer-ultra-premium-chicken-liver: J. M. Smucker Company

- initiated 2020-07-03, classified ?, status ?
- pet food: **yes** (alias:natural-balance)
- brands: natural-balance; linked: fda\_ires:85961
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-company-issues-voluntary-recall-one-lot-natural-balancer-ultra-premium-chicken-liver)
- reason: Due to elevated levels of choline chloride

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Natural Balance Ultra Premium Chicken &amp; Liver Paté Formula | natural-balance/original-ultra \(line\) | none |  |

### fda\_ires 86321: SUNSHINE MILLS INC

- initiated 2020-08-24, classified 2020-09-14 (Class I), status Terminated
- pet food: **yes** (alias:natures-menu)
- brands: natures-menu; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-natures-menur-super-premium-dog-food-blend-real-chicken
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286321%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-natures-menur-super-premium-dog-food-blend-real-chicken)
- reason: Potential contamination with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0478-2020 | Nature's Menu brand Super Premium Dog Food with a Blend of Real Chicken &amp; Quail in a 3 lb. and 13.5 lb. bags. | natures-menu/super-premium \(line\) | mixed: exact TE1 20/APRIL/2020 \[3 lb\]; best\_by\_date 2020-04-20 \[3 lb\] \(needs\_review\); exact TE1 21/APRIL/2020 \[3 lb\]; best\_by\_date 2020-04-21 \[3 lb\] \(needs\_review\) \+20 | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-natures-menur-super-premium-dog-food-blend-real-chicken: Sunshine Mills, Inc.

- initiated 2020-08-24, classified ?, status ?
- pet food: **yes** (alias:natures-menu)
- brands: natures-menu; linked: fda\_ires:86321
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-natures-menur-super-premium-dog-food-blend-real-chicken)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Nature’s Menu Nature’s Menu Super Premium Dog Food with a Blend of Real Chicken &amp; Quail | natures-menu/super-premium \(line\) | none |  |

### fda\_ires 86357: SUNSHINE MILLS INC

- initiated 2020-08-31, classified 2020-09-23 (Class I), status Terminated
- pet food: **yes** (alias:heartland-farms; alias:family-pet; alias:paws-happy-life)
- brands: family-pet, heartland-farms, paws-happy-life; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-due-potentially-elevated-levels
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286357%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-due-potentially-elevated-levels)
- reason: Potential for elevated levels of aflatoxin in the product.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0479-2020 | Heartland Farms brand Grill Favorites for Adult Dogs in 14 lb. and 31 lb. bags. | heartland-farms/grill-favorites \(line\) | mixed: exact TB 2 4/APRIL/2020 \[14 lb\]; best\_by\_date 2020-04-04 \[14 lb\] \(needs\_review\); exact TB 1 4/APRIL/2020 \[14 lb\]; exact TA 2 4/APRIL/2020 \[31 lb\] \+2 | lot\_parse |
| V-0480-2020 | Family Pet brand Meaty Cuts Beef, Chicken and Cheese Flavors Premium Dog Food in 4 lb., 14 lb., and 28 lb. bags. | family-pet/meaty-cuts \(line\) | mixed: exact TD 1 5/APRIL/2020 \[4 lb\]; best\_by\_date 2020-04-05 \[4 lb\] \(needs\_review\); exact TD 3 4/APRIL/2020 \[4 lb\]; best\_by\_date 2020-04-04 \[4 lb\] \(needs\_review\) \+7 | lot\_parse |
| V-0481-2020 | Paws Happy Life brand Butcher's Choice Dog Food in 16 lb. bags. | paws-happy-life/butchers-choice \(line\) | mixed: exact TA 1 4/APRIL/2020 \[16 lb\]; best\_by\_date 2020-04-04 \[16 lb\] \(needs\_review\); exact TA 2 4/APRIL/2020 \[16 lb\] | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-due-potentially-elevated-levels: Sunshine Mills, Inc.

- initiated 2020-09-02, classified ?, status ?
- pet food: **yes** (alias:family-pet\+heartland-farms\+paws-happy-life)
- brands: family-pet, heartland-farms, paws-happy-life; linked: fda\_ires:86357
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-due-potentially-elevated-levels)
- reason: Elevated levels of aflatoxin

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Family Pet, Heartland Farms, Paws Happy Life Dog Food | heartland-farms \(brand\), paws-happy-life \(brand\), family-pet \(brand\) | none |  |

### fda\_ires 86475: REAL PET FOOD COMPANY, LLC

- initiated 2020-09-22, classified 2020-10-20 (Class I), status Terminated
- pet food: **yes** (alias:billy-and-margot)
- brands: billy-and-margot; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/real-pet-food-company-phoenix-az-voluntarily-recalls-one-lot-billymargot-wild-kangaroo-and
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286475%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/real-pet-food-company-phoenix-az-voluntarily-recalls-one-lot-billymargot-wild-kangaroo-and)
- reason: Potential to be contaminated with Salmonella
- review #177 unclassified (resolved): pet food undecided; firm: REAL PET FOOD COMPANY, LLC; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0002-2021 | Billy \+ Margot Wild Kangaroo \+ Superfoods Recipe Multiple Protein Sources Net Wt 4 lb \(1.8 kg\) packaged in plastic bags | billy-and-margot/dry-dog \(line\) | mixed: exact V 07 FEB 2022; best\_by\_date 2022-02-07 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/real-pet-food-company-phoenix-az-voluntarily-recalls-one-lot-billymargot-wild-kangaroo-and: Real Pet Food Company

- initiated 2020-09-22, classified ?, status ?
- pet food: **yes** (alias:billy-and-margot)
- brands: billy-and-margot; linked: fda\_ires:86475
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/real-pet-food-company-phoenix-az-voluntarily-recalls-one-lot-billymargot-wild-kangaroo-and)
- reason: Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Billy\+Margot Wild Kangaroo and Superfoods Recipe Dog food | billy-and-margot \(brand\) | none |  |

### fda\_ires 86569: SUNSHINE MILLS INC

- initiated 2020-10-07, classified 2020-10-21 (Class I), status Terminated
- pet food: **yes** (alias:champ; alias:field-trial; alias:good-dog; alias:hunters-special)
- brands: champ, field-trial, good-dog, hunters-special, old-glory, paws-happy-life, pet-expert, principle, retriever-tsc, river-bend, sportsmans-pride, sprout, thrifty, top-runner, whiskers-and-tails; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-expands-previously-announced-voluntary-recall-certain-pet-food-products-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286569%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-expands-previously-announced-voluntary-recall-certain-pet-food-products-due)
- reason: Potential for elevated levels of aflatoxin in the product.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0004-2021 | Champ brand Mini Chunk Dog Food Beef and Chicken Flavor in 12 lb. bags. UPC: 7328315416 | champ/mini-chunk \(line\) | clean: exact TC2 3/APRIL/2020; best\_by\_date 2021-04-03 |  |
| V-0005-2021 | Field Trial brand Complete Nutrition Dog Food in 16 lb. bags. UPC: 7015514530 | field-trial/complete-nutrition \(line\) | clean: exact TC2 4/APRIL/2020; best\_by\_date 2021-04-04 |  |
| V-0006-2021 | Good Dog Brand HI Energy Formula in 50 lb. bags. UPC: 5216624165 | good-dog/hi-energy \(line\) | clean: exact TA1 5/APRIL/2020; best\_by\_date 2021-04-05 |  |
| V-0007-2021 | Hunters Special brand Dog Food HI Energy Formula in 50 lb. bags. UPC: 7015510145 | hunters-special/hi-energy \(line\) | clean: exact TA1 5/APRIL/2020; exact TA2 5/APRIL/2020; exact TA3 5/APRIL/2020; best\_by\_date 2021-04-05 |  |
| V-0008-2021 | Hunter s Special brand Dog Food Maintenance Formula in 50 lb. bags. UPC: 7015510135 | hunters-special/maintenance \(line\) | clean: exact TB3 4/APRIL/2020; exact TB1 5/APRIL/2020; best\_by\_date 2021-04-04; best\_by\_date 2021-04-05 |  |
| V-0009-2021 | Hunter s Special brand Farm &amp; Ranch Recipe Super Chunks Dog Food in 50 lb. bags. UPC: 7015510182 | hunters-special/farm-and-ranch \(line\) | clean: exact TC2 5/APRIL/2020; exact TC3 5/APRIL/2020; best\_by\_date 2021-04-05 |  |
| V-0010-2021 | Old Glory brand Hearty Beef &amp; Chicken Flavor in 4 lb. &amp; 12.75 lb. bags. 4 lb. UPC: 7015514339 12.75 lb. UPC: 7015514298 | old-glory \(brand\) | clean: exact TE3 3/APRIL/2020 \[4 lb\]; exact TE2 4/APRIL/2020 \[4 lb\]; best\_by\_date 2021-04-03 \[4 lb\]; best\_by\_date 2021-04-04 \[4 lb\] \+12 |  |
| V-0011-2021 | Paws Happy Life brand Nutritionally Complete Dog Food in 17 lb. bags. UPC: 3680042561 | paws-happy-life/nutritionally-complete \(line\) | clean: exact TC2 4/APRIL/2020; best\_by\_date 2021-04-04 |  |
| V-0012-2021 | Pet Expert Always Fit Formula in 50 lb. bags. UPC: 5208887976 | pet-expert/always-fit \(line\) | clean: exact TC2 5/APRIL/2020; best\_by\_date 2021-04-05 |  |
| V-0013-2021 | Principle brand Super Premium Natural Dog Breeder Pack in 40 lb. bags. UPC: 580179586032 | principle/breeder-pack \(line\) | clean: exact TA3 4/APRIL/2020; exact TA1 5/APRIL/2020; best\_by\_date 2021-04-04; best\_by\_date 2021-04-05 |  |
| V-0014-2021 | Retriever brand Bites and Bones Adult Complete Nutrition Savory Chicken Flavor in 52 lb. bags. UPC: 4939422642 | retriever-tsc/bites-and-bones \(line\) | clean: exact TC3 4/APRIL/2020; exact TC1 5/APRIL/2020; best\_by\_date 2021-04-04; best\_by\_date 2021-04-05 |  |
| V-0015-2021 | River Bend brand Dog Food Basic Nutrition in 40 lb. and 50 lb. bags. No UPC on bags. | river-bend/basic-nutrition \(line\) | clean: exact TC1 5/APRIL/2020 \[40 lb\]; best\_by\_date 2021-04-05 \[40 lb\]; exact TC1 5/APRIL/2020 \[50 lb\]; best\_by\_date 2021-04-05 \[50 lb\] |  |
| V-0016-2021 | River Bend brand Dog Food Select in 50 lb. bags. No UPC on bags. | river-bend/select \(line\) | clean: exact TB3 4/APRIL/2020 \[50 lb\]; best\_by\_date 2021-04-04 \[50 lb\] |  |
| V-0017-2021 | Sportsman's Pride brand Maintenance Adult Formula Dog Food in 20 lb. &amp; 50 lb. bags. 20 lb. UPC: 7015510082 50 lb. UPC: 7015510110 | sportsmans-pride/maintenance \(line\) | clean: exact TB1 5/APRIL/2020 \[20 lb\]; best\_by\_date 2021-04-05 \[20 lb\]; exact TB1 5/APRIL/2020 \[50 lb\]; best\_by\_date 2021-04-05 \[50 lb\] |  |
| V-0018-2021 | Sprout brand Bites &amp; Bones in 40 lb. bags. UPC: 7015505091 | sprout/bites-and-bones \(line\) | clean: exact TC2 4/APRIL/2020; best\_by\_date 2021-04-04 |  |
| V-0019-2021 | Sprout brand HI-Protein in 20 lb. &amp; 40 lb. bags. 20 lb. UPC: 70155505120 40 lb. UPC: 7015505119 | sprout/sporting \(line\) | clean: exact TI2 4/APRIL/2020 \[20 lb\]; exact TI3 4/APRIL/2020 \[20 lb\]; best\_by\_date 2021-04-04 \[20 lb\]; exact TI3 4/APRIL/2020 \[40 lb\] \+1 |  |
| V-0020-2021 | Sprout brand Maintenance in 40 lb. bags. UPC: 7015505096 | sprout/maintenance \(line\) | clean: exact TB1 5/APRIL/2020; best\_by\_date 2021-04-05 |  |
| V-0021-2021 | Sprout brand Puppy in 20 lb. bags. UPC: 7015505095 | sprout/puppy \(line\) | clean: exact TA3 4/APRIL/2020; exact TA1 5/APRIL/2020; best\_by\_date 2021-04-04; best\_by\_date 2021-04-05 |  |
| V-0022-2021 | Thrifty brand Adult Dog Food in 12 lb. bags. UPC: 7015513096 | thrifty/adult \(line\) | clean: exact TI1 3/APRIL/2020; exact TI2 3/APRIL/2020; exact TI3 3/APRIL/2020; exact TA2 4/APRIL/2020 \+2 |  |
| V-0023-2021 | Top Runner brand Premium Dog Food in 50 lb. bags. UPC: 3540650070 | top-runner/premium \(line\) | clean: exact TB1 3/APRIL/2020; best\_by\_date 2021-04-03 |  |
| V-0024-2021 | Whiskers &amp; Tails brand Adult Recipe Complete Dog Food in 17 lb. bags. UPC: 2114003022 | whiskers-and-tails/adult-recipe \(line\) | clean: exact TC2 4/APRIL/2020; best\_by\_date 2021-04-04 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-expands-previously-announced-voluntary-recall-certain-pet-food-products-due: Sunshine Mills, Inc.

- initiated 2020-10-08, classified ?, status ?
- pet food: **yes** (alias:champ\+field-trial\+good-dog)
- brands: champ, field-trial, good-dog; linked: fda\_ires:86569
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-expands-previously-announced-voluntary-recall-certain-pet-food-products-due)
- reason: May Contain Aflatoxin

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Champ, Field Trial, Good Dog, and Others Pet Food | champ \(brand\), field-trial \(brand\), good-dog \(brand\) | none |  |

### fda\_ires 86616: Stella &amp; Chewy's, LLC

- initiated 2020-10-14, classified 2020-10-28 (Class I), status Terminated
- pet food: **yes** (alias:stella-and-chewys)
- brands: stella-and-chewys
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286616%22%7D%5D)
- reason: Dog food has the potential to be contaminated with Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0025-2021 | Stella &amp; Chewy's Raw Blend, Kibble \+ Wholesome Grains Red Meat Recipe, with Pumpkin &amp; Quinoa. UPC 8 10027 37021 1. Net Wt. 22 lbs. \(10kg\) M… | stella-and-chewys/raw-blend-kibble \(line\) | clean: best\_by\_date 2022-02-22; exact 20083 1PR00271 47 |  |

### fda\_ires 86625: Grassland Beef

- initiated 2020-10-20, classified 2020-11-23 (Class I), status Terminated
- pet food: **yes** (alias:dr-siegels)
- brands: dr-siegels
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286625%22%7D%5D)
- reason: Raw pet food may have contained an ingredient which tested positive for E. coli O157:H7

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0028-2021 | Dr. Siegel's S. A. F. E. Petfood, Ground Beef 70% Lean / 30% Fat Net Wt.: 2 lb 18841 | dr-siegels/raw \(line\) | clean: exact 20157 |  |
| V-0029-2021 | Dr. Siegel's S. A. F. E. Petfood, Ground Beef 85% Lean / 15% Fat Net Wt.: 2 lb 18851 | dr-siegels/raw \(line\) | clean: exact 20157 |  |

### fda\_ires 86729: Cargill Meat Solutions Corp

- initiated 2020-11-07, classified 2020-11-23 (Class II), status Terminated
- pet food: **yes** (species\+food:dogs\+food)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286729%22%7D%5D)
- reason: Frozen Dog Food may contain plastic pieces

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0030-2021 | Frozen Food for Dogs Beef, 20 units per case packaged in the following sized individual bags: 1. Beef 06, 13.50 oz., Case item 760308, Net … | none | mixed: range BEEF-A-06 422503 2025..BEEF-A-06 422504 0042 \[item 1\] \(needs\_review\); exact 20200812 \[item 1; case\]; range BEEF-A-07 422603 0750..BEEF-A-07 422603 0956 \[item 2\] \(needs\_review\); range BEE… | unmatched, lot\_parse |

### fda\_ires 86870: Petsmart Inc

- initiated 2020-11-11, classified 2020-12-17 (Class II), status Terminated
- pet food: **yes** (alias:authority)
- brands: authority
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286870%22%7D%5D)
- reason: Product samples contain elevated levels of the mycotoxin Zearalenone.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0034-2021 | Authority Savory Blends Chicken Formula Cat Food, Adult Ages 1-7, UPC 7 37257 83108 3.5 lb. bag, and UPC 7 37257 83107 7 lb. bag | authority/savory-blends \(line\) | clean: all\_lots |  |
| V-0035-2021 | Authority Savory Blends Turkey Formula Cat Food, Adult Ages 1-7, UPC 7 37257 83105 3.5 lb. bag, and UPC 7 37257 85016 7 lb. bag | authority/savory-blends \(line\) | clean: all\_lots |  |

### fda\_ires 86747: ALBRIGHTS RAW DOG FOOD

- initiated 2020-11-13, classified 2020-12-02 (Class I), status Terminated
- pet food: **yes** (alias:albrights)
- brands: albrights; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-dog-food-recalls-chicken-recipe-dogs-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286747%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-dog-food-recalls-chicken-recipe-dogs-because-possible-salmonella-health-risk)
- reason: Product tested positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0032-2021 | Albright's Raw Dog Food Chicken Recipe For Dogs. Sold individually as a 2lb chub or 16 chubs in a case. UPC code on 2lb chub 855404008134 U… | albrights/raw \(line\) | clean: exact C000185 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/albrights-raw-dog-food-recalls-chicken-recipe-dogs-because-possible-salmonella-health-risk: Albright’s Raw Dog Food

- initiated 2020-11-13, classified ?, status ?
- pet food: **yes** (alias:albrights)
- brands: albrights; linked: fda\_ires:86747
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-dog-food-recalls-chicken-recipe-dogs-because-possible-salmonella-health-risk)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Albright’s Raw Dog Food Chicken Recipe for Dogs | albrights/raw \(line\) | none |  |

### fda\_ires 86854: TDBBS, LLC.

- initiated 2020-11-20, classified 2020-12-18 (Class I), status Terminated
- pet food: **yes** (alias:best-bully-sticks)
- brands: best-bully-sticks
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2286854%22%7D%5D)
- reason: TDBBS, LLC 5701 Eastport Boulevard Richmond, VA 23231 is initiating a recall of the following products, TDBBS "12 Bully Sticks: 8 oz. \( Standard , Amazon.com\),…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0036-2021 | 12 Jumbo Bully Stick 8-pack / 12-pack , 8 oz. , Poly \(plastic\) bag 12 Standard Bully Stick 8 oz. Poly \(plastic\) bag | best-bully-sticks/treats \(line\) | clean: best\_by\_date 2022-10-18; best\_by\_date 2022-10-25; exact WO125317; exact WO125367 \+1 |  |
| V-0037-2021 | Natural Cow Ears 12-pack \(Chewy.com\) 12-pack , Poly \(plastic\) bag | best-bully-sticks \(brand\) | clean: best\_by\_date 2022-11-08; exact WO125540 |  |

### fda\_ires 87068: Midwestern Pet Foods Chickasha Operation

- initiated 2020-12-30, classified 2021-02-08 (Class I), status Terminated
- pet food: **yes** (alias:sportmix; alias:pro-pac; not dog/cat:fish food; alias:nunn-better)
- brands: nunn-better, pro-pac, sportmix, sportstrail; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recalls-pet-food-recall-aflatoxin-health-risk, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-expands-recall-pet-food-aflatoxin-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287068%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recalls-pet-food-recall-aflatoxin-health-risk) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-expands-recall-pet-food-aflatoxin-health-risk)
- reason: Elevated levels of aflatoxin

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0039-2021 | Sportmix Premium Energy Plus Targeted Nutrition for Dogs UPC 034846700916 packaged in 50 pound bag and Sportmix Premium Energy Plus Targete… | sportmix/energy-plus \(line\) | mixed: exact 01022021L2 05; exact 01022021L3 05; exact 01102021L2 05; exact 01102021L3 05 \+216 | lot\_parse |
| V-0040-2021 | Sportmix Premium High Energy Targeted Nutrition for Dogs UPC 034846700435 packaged in 50 pound bag and Sportmix Premium High Energy Targete… | sportmix/high-energy \(line\) | clean: exact 01022021L2 05; exact 01022021L3 05; exact 01102021L2 05; exact 01102021L3 05 \+120 |  |
| V-0041-2021 | Sportmix Cat Food Original Recipe Targeted Nutrition for Cats and Kittens UPC 034846600834 packaged in 31 pound bag and Sportmix Cat Food O… | sportmix/original-cat \(line\) | clean: exact 01252021L2 05; exact 01252021L3 05; exact 02082021L2 05; exact 02082021L3 05 \+39 |  |
| V-0042-2021 | Pro Pac Dog Adult Mini Chunk Superpremium Dog Food UPC 034846704518 packaged in 40 pound bag | pro-pac/adult-mini-chunk \(line\) | clean: exact 02062021L2 05; exact 02062021L3 05; exact 04152021L2 05; exact 04152021L3 05 \+10 |  |
| V-0043-2021 | Pro Pac Dog Performance Puppy Superpremium Dog Food UPC 034846704112 packaged in 40 pound bag | pro-pac/performance-puppy \(line\) | clean: exact 01092021L3 05; exact 02072021L2 05; exact 02072021L3 05; exact 04082021L2 05 \+11 |  |
| V-0044-2021 | Splash Fat Cat Fish Food Floater For All Fresh Water Fish 32% UPC 078337601054 packaged in 50 pound bag | none | none |  |
| V-0045-2021 | Nunn Better Hunter's Select Dog Food Maintenance UPC 041694008712 packaged in 50 pound bag | nunn-better/maintenance \(line\) | clean: exact 01152021L2 05; exact 03162021L2 05; exact 03172021L2 05; exact 04072021L3 05 \+15 |  |
| V-0046-2021 | Sportstrail Bite Size Dog Food UPC 034846599015 packaged in 50 pound bag | sportstrail/bite-size \(line\) | clean: exact 04022021L3 05; exact 04252021L2 05; exact 05042021L3 05; exact 05052021L3 05 \+40 |  |
| V-0047-2021 | Sportmix Premium Maintenance Targeted Nutrition for Dogs UPC 034846700565 packaged in 44 pound bag and Sportmix Premium Maintenance Targete… | sportmix/maintenance \(line\) | clean: exact 01032021L3 05; exact 01152021L2 05; exact 01152021L3 05; exact 01232021L2 05 \+66 |  |
| V-0048-2021 | Sportmix High Protein Targeted Nutrition for Dogs UPC 034846700114 packaged in 50 pound bag | sportmix/high-protein \(line\) | clean: exact 02052021L3 05; exact 02062021L3 05; exact 03092021L3 05; exact 04142021L2 05 \+19 |  |
| V-0049-2021 | Sportmix Premium Stamina Targeted Nutrition for Dogs UPC 034846700879 packaged in 44 pound bag and Sportmix Premium Stamina Targeted Nutrit… | sportmix/stamina \(line\) | clean: exact 01172021L2 05; exact 01182021L2 05; exact 02142021L3 05; exact 03102021L3 05 \+20 |  |
| V-0050-2021 | Sportmix Bite Size Targeted Nutrition for Dogs UPC 034846600520 packaged in 40 pound bags and Sportmix Bite Size Targeted Nutrition for Dog… | sportmix/bite-size \(line\) | clean: exact 01082021L3 05; exact 01092021L3 05; exact 01192021L2 05; exact 01192021L3 05 \+71 |  |
| V-0051-2021 | Sportmix Premium Puppy Small Bites Targeted Nutrition for Dogs UPC 034846600131 packaged in 16.5 pound bags and Sportmix Premium Puppy Smal… | sportmix/premium-puppy \(line\) | clean: exact 01232021L3 05; exact 03122021L2 05; exact 03122021L3 05; exact 05142021L2 05 \+24 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recalls-pet-food-recall-aflatoxin-health-risk: Sportmix

- initiated 2020-12-30, classified ?, status ?
- pet food: **yes** (alias:sportmix)
- brands: sportmix; linked: fda\_ires:87068
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recalls-pet-food-recall-aflatoxin-health-risk)
- reason: Elevated levels of aflatoxin

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Sportmix Dog and Cat Food | sportmix \(brand\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-expands-recall-pet-food-aflatoxin-health-risk: Midwestern Pet Foods Inc.

- initiated 2021-01-11, classified ?, status ?
- pet food: **yes** (alias:sportmix\+nunn-better\+pro-pac)
- brands: nunn-better, pro-pac, sportmix; linked: fda\_ires:87068
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-expands-recall-pet-food-aflatoxin-health-risk)
- reason: Aflatoxin Levels Exceed Acceptable Levels

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Sportmix, Nunn Better, ProPac, and Others Dog and Cat Pet Food | sportmix \(brand\), nunn-better \(brand\), pro-pac \(brand\) | none |  |

### fda\_ires 87408: Bravo Packing, Inc.

- initiated 2021-02-26, classified 2021-03-19 (Class I), status Terminated
- pet food: **yes** (alias:performance-dog; species\+food:dog\+raw)
- brands: performance-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287408%22%7D%5D)
- reason: Possible Listeria monocytogenes and Salmonella spp. contamination in frozen dog food

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0096-2021 | "Performance Dog" raw frozen dog food. The product is packaged in 2-lb bags, 20 bags to a box or in 5-lb bags, 8 bags to a box. | performance-dog/performance-dog \(line\) | clean: all\_lots; exact 112320; exact 011821; exact 011020 \+6 |  |
| V-0097-2021 | "Ground Beef" raw frozen dog food. The product is packaged in 2-lb bags, 20 bags to a box or in 5-lb bags, 8 bags to a box. | none | clean: all\_lots; exact 073020; exact 040320 | unmatched |

### fda\_ires 87420: Visionary Pet Food

- initiated 2021-02-26, classified 2021-03-18 (Class I), status Terminated
- pet food: **yes** (alias:visionary-pet-foods)
- brands: visionary-pet-foods
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287420%22%7D%5D)
- reason: Testing by Virginia Department of Agriculture found Salmonella and Listeria monocytogenes in the product.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0093-2021 | Visionary Keto Pet Foods, Enlightened Choice; Beef Recipe Beef and Beef Heart, Veggies, Seeds &amp; Coconut Oil, Beef Liver, Added vitamins and… | visionary-pet-foods/enlightened-choice \(line\) | clean: best\_by\_date 2021-09-01; exact 6626 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-recalls-all-performance-dog-and-ground-beef-raw-pet-food-because-possible: Bravo Packing, Inc.

- initiated 2021-03-03, classified ?, status ?
- pet food: **yes** (alias:bravo-packing-house\+performance-dog)
- brands: bravo-packing-house, performance-dog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-recalls-all-performance-dog-and-ground-beef-raw-pet-food-because-possible)
- reason: Potential for Salmonella and Listeria monocytogenes
- review #397 link_listing (open): several iRES events match: 87408, 87534

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Bravo Packing, Inc. Ground Beef and Performance Dog, frozen raw pet food | bravo-packing-house/ground-beef \(line\), performance-dog/performance-dog \(line\) | none |  |

### fda\_ires 87534: Bravo Packing, Inc.

- initiated 2021-03-15, classified 2021-04-29 (Class I), status Terminated
- pet food: **yes** (species\+food:dog\+chub; alias:performance-dog; species\+food:dog\+patties)
- brands: performance-dog
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287534%22%7D%5D)
- reason: Possible Listeria monocytogenes and Salmonella spp. contamination in frozen dog food and bones

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0107-2021 | Green Tripe \(chub - ground bovine stomach\) frozen raw dog food. The product is packaged in 2lbs and 5lb chubs | none | clean: all\_lots | unmatched |
| V-0108-2021 | Performance Dog \(patties lbs\) frozen raw dog food. Unknown packaging size. | performance-dog/performance-dog \(line\) | clean: exact 072720; exact 110819; exact 052320; all\_lots \+6 |  |
| V-0109-2021 | Tripe \(patties 1/4 lbs.\) frozen raw dog food. Unknown packaging size | none | clean: all\_lots | unmatched |
| V-0110-2021 | Bones \(smoked\) 14 varieties. Unknown packaging size | none | clean: all\_lots | unmatched |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-expands-previously-announced-voluntary-recall-pet-food-products-due-potential: Bravo Packing, Inc.

- initiated 2021-03-16, classified ?, status ?
- pet food: **yes** (alias:bravo-packing-house\+performance-dog)
- brands: bravo-packing-house, performance-dog
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/bravo-packing-inc-expands-previously-announced-voluntary-recall-pet-food-products-due-potential)
- reason: Due to Potential Salmonella and Listeria monocytogenes
- review #525 link_listing (open): several iRES events match: 87408, 87534

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Bravo Packing, Inc. Pet food: Performance Dog, beef, green tripe, and bone | bravo-packing-house/ground-beef \(line\), bravo-packing-house/green-tripe \(line\), bravo-packing-house/bones \(line\), performance-dog/performance-dog \(line\) | none |  |

### fda\_ires 87553: Cargill, Inc Corporate Headquarters

- initiated 2021-03-17, classified 2021-04-06 (Class I), status Terminated
- pet food: **yes** (alias:ranch-hound)
- brands: ranch-hound
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287553%22%7D%5D)
- reason: Dog food product tested positive for Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0100-2021 | Ranch Hound Maintenance Mini-Chunk Dog Food UPC 7 22304 39123 2, Manufactured for Atwood Distributing, L.P., Enid, OK. 40 lb. bag | ranch-hound/maintenance \(line\) | clean: best\_by\_date 2022-03-07; best\_by\_date 2022-03-08; exact E1066; exact E1067 |  |

### fda\_ires 87625: MIdwestern Pet Foods Inc.

- initiated 2021-03-26, classified 2021-04-20 (Class I), status Terminated
- pet food: **yes** (alias:canine-x\+earthborn-holistic\+sportmix\+pro-pac\+sportstrail\+meridian)
- brands: canine-x, earthborn-holistic, meridian, pro-pac, sportmix, sportstrail; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recall-due-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287625%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recall-due-possible-salmonella-health-risk)
- reason: Product potentially contaminated with Salmonella spp.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0104-2021 | Certain dog and cat food brands including CanineX, Earthborn Holistic, Venture, Unrefined, Sportmix Wholesomes, Pro Pac, Pro Pac Ultimates,… | canine-x \(brand\), earthborn-holistic/venture \(line\), earthborn-holistic/unrefined \(line\), sportmix/wholesomes \(line\), pro-pac/ultimates \(line\), sportstrail \(brand\), earthborn-holistic \(brand\), sportmix \(brand\), meridian \(brand\), pro-pac \(brand\) | needs\_review: all\_lots \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recall-due-possible-salmonella-health-risk: Midwestern Pet Foods

- initiated 2021-03-27, classified ?, status ?
- pet food: **yes** (species\+food:dog\+food)
- brands: none; linked: fda\_ires:87625
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/midwestern-pet-foods-voluntarily-recall-due-possible-salmonella-health-risk)
- reason: Potential Salmonella Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Multiple brands Dog and Cat Food | none | none | ambiguous |

### fda\_ires 87691: The J.M. Smucker Company, Inc.

- initiated 2021-04-08, classified 2021-04-27 (Class I), status Terminated
- pet food: **yes** (alias:meow-mix)
- brands: meow-mix; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-co-issues-limited-voluntary-recall-two-lots-meow-mixr-original-choice-dry-cat-food
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287691%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-co-issues-limited-voluntary-recall-two-lots-meow-mixr-original-choice-dry-cat-food)
- reason: Presumptive positive for Salmonella placed on hold was inadvertently released.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0106-2021 | Meow Mix Original Cat Food, 30 pound bags | meow-mix/original-choice \(line\) | clean: best\_by\_date 2022-09-14; best\_by\_date 2022-09-15; exact 1081804; exact 1082804 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-co-issues-limited-voluntary-recall-two-lots-meow-mixr-original-choice-dry-cat-food: J. M. Smucker Co.

- initiated 2021-04-12, classified ?, status ?
- pet food: **yes** (alias:meow-mix)
- brands: meow-mix; linked: fda\_ires:87691
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/j-m-smucker-co-issues-limited-voluntary-recall-two-lots-meow-mixr-original-choice-dry-cat-food)
- reason: Potential Salmonella Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Meow Mix® Meow Mix® Original Choice Dry Cat Food | meow-mix/original-choice \(line\) | none |  |

### fda\_ires 87892: Tejas Industries - Amarillo Distribution

- initiated 2021-04-30, classified 2021-06-11 (Class II), status Terminated
- pet food: **yes** (alias:zukes)
- brands: zukes
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287892%22%7D%5D)
- reason: Pet treat products show presence of mold.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0118-2021 | Zuke's Mini Naturals Dog Treats Chicken Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 0 13423 33051 7\) and 16 oz \(UPC… | zukes/mini-naturals \(line\) | clean: exact 3450 \[16 oz\]; exact 3460 \[16 oz\]; exact 0431 \[16 oz\]; exact 0441 \[16 oz\] \+12 |  |
| V-0119-2021 | Zuke's Mini Naturals Dog Treats Peanut Butter &amp; Oats Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 0 13423 33052 4\) a… | zukes/mini-naturals \(line\) | clean: exact 3450 \[16 oz\]; exact 3460 \[16 oz\]; exact 0431 \[16 oz\]; exact 0441 \[16 oz\] \+11 |  |
| V-0120-2021 | Zuke's Mini Naturals Dog Treats Duck Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 6 13423 33053 3\) and 16 oz \(UPC 6 … | zukes/mini-naturals \(line\) | clean: exact 0191 \[16 oz\]; exact 0481 \[16 oz\]; exact 0851 \[16 oz\]; exact 0861 \[16 oz\] \+4 |  |
| V-0121-2021 | Zuke's Mini Naturals Dog Treats Salmon Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 0 13423 33054 8\) and 16 oz \(UPC … | zukes/mini-naturals \(line\) | clean: exact 0521 \[16 oz\]; exact 0531 \[16 oz\]; exact 0541 \[16 oz\]; exact 0881 \[16 oz\] \+6 |  |
| V-0122-2021 | Zuke's Mini Naturals Dog Treats Rabbit Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 6 13423 33056 4\) and 16 oz \(UPC … | zukes/mini-naturals \(line\) | clean: exact 0491 \[16 oz\]; exact 0501 \[16 oz\]; exact 0821 \[16 oz\]; exact 0201 \[6 oz\] \+3 |  |
| V-0123-2021 | Zuke's Mini Naturals Dog Treats Pork Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 6 13423 33055 7\) and 16 oz \(UPC 6 … | zukes/mini-naturals \(line\) | clean: exact 3140 \[16 oz\]; exact 0211 \[16 oz\]; exact 0511 \[16 oz\]; exact 0871 \[16 oz\] \+2 |  |
| V-0124-2021 | Zuke's Mini Naturals Dog Treats Beef Recipe Distributed by Zuke's LLC Amarillo, TX packaged in 6 oz \(UPC 6 13423 33058 8\) and 16 oz \(UPC 6 … | zukes/mini-naturals \(line\) | clean: exact 3350 \[16 oz\]; exact 3360 \[16 oz\]; exact 0141 \[16 oz\]; exact 0471 \[16 oz\] \+5 |  |

### fda\_ires 87979: Natural Balance Pet Foods, Inc.

- initiated 2021-05-19, classified 2021-06-07 (Class I), status Terminated
- pet food: **yes** (alias:natural-balance)
- brands: natural-balance; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/natural-balance-pet-foods-inc-voluntarily-recalls-lid-green-pea-chicken-dry-cat-formula-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2287979%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/natural-balance-pet-foods-inc-voluntarily-recalls-lid-green-pea-chicken-dry-cat-formula-possible)
- reason: Product tested by the Minnesota Department of Agriculture found Salmonella 21:y:in Limited Ingredient Died Green Pea and Chicken Cat Food.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0117-2021 | Natural Balance L.I.D. Limited Ingredient Diets Green Pea &amp; Chicken Formula Dry Cat Food- 5 LB Bag; 1- lb bag. 5 lb. bag - Case item code: … | natural-balance/limited-ingredient \(line\) | clean: best\_by\_date 2022-03-10; exact 1008080 N811202-20 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/natural-balance-pet-foods-inc-voluntarily-recalls-lid-green-pea-chicken-dry-cat-formula-possible: Natural Balance Pet Foods, Inc.

- initiated 2021-05-20, classified ?, status ?
- pet food: **yes** (alias:natural-balance)
- brands: natural-balance; linked: fda\_ires:87979
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/natural-balance-pet-foods-inc-voluntarily-recalls-lid-green-pea-chicken-dry-cat-formula-possible)
- reason: Potential Salmonella Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Natural Balance L.I.D. Green Pea &amp; Chicken Dry Cat Formula | natural-balance/limited-ingredient \(line\) | none |  |

### fda\_ires 88031: Sunshine Mills, Inc.

- initiated 2021-06-01, classified 2021-06-21 (Class I), status Terminated
- pet food: **yes** (alias:frm-gold-select; alias:sportsmans-pride; alias:sprout; alias:intimidator)
- brands: frm-gold-select, intimidator, sportsmans-pride, sprout; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-because-possible-salmonella
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288031%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-because-possible-salmonella)
- reason: Positive Salmonella Sampling

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0128-2021 | FRM Gold Select High Performance Dog Food 50lb bag | frm-gold-select/high-performance \(line\) | clean: exact TA1 06/OCT/2020; best\_by\_date 2021-10-06 |  |
| V-0129-2021 | Sportman's Pride Professional Formula 30/20 Dog Food 40lb Bag | sportsmans-pride/professional \(line\) | clean: exact TI1 07/OCT/2020; best\_by\_date 2021-10-07 |  |
| V-0130-2021 | Sprout Sporting Dog Food 5lb Bag 40lb Bag | sprout/sporting \(line\) | clean: exact TE1 06/OCT/2020 \[5lb\]; best\_by\_date 2021-10-06 \[5lb\]; exact TI3 06/OCT/2020 \[40lb\]; best\_by\_date 2021-10-06 \[40lb\] |  |
| V-0131-2021 | Intimidator Chicken &amp; Rice Formula Dog Food 16lb Bags 40lb Bags | intimidator/chicken-and-rice \(line\) | clean: exact TA1 06/OCT/2020 \[16lb\]; best\_by\_date 2021-10-06 \[16lb\]; exact TA1 06/OCT/2020 \[40lb\]; best\_by\_date 2021-10-06 \[40lb\] |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-because-possible-salmonella: Sunshine Mills, Inc.

- initiated 2021-06-03, classified ?, status ?
- pet food: **yes** (alias:sportsmans-pride\+sprout\+intimidator\+frm-gold-select)
- brands: frm-gold-select, intimidator, sportsmans-pride, sprout; linked: fda\_ires:88031
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-dog-food-products-because-possible-salmonella)
- reason: Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Sportsman’s Pride, Sprout Sporting, Intimidator, FRM Gold Select Dog Food Products | sportsmans-pride \(brand\), intimidator \(brand\), frm-gold-select \(brand\), sprout/sporting \(line\) | none |  |

### fda\_ires 88063: True Pet Food Project, Inc dba Smalls

- initiated 2021-06-09, classified 2021-06-24 (Class II), status Terminated
- pet food: **yes** (alias:smalls)
- brands: smalls
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288063%22%7D%5D)
- reason: Cat food has off odor and color

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0133-2021 | Smalls Cat Food - Ground Chicken Recipe- 11.05 oz. | smalls \(brand\) | clean: exact 21098; exact 21109 |  |
| V-0134-2021 | Smalls Cat Food -Pate Chicken Recipe - 11.05 oz. | smalls \(brand\) | clean: exact 21136 |  |
| V-0135-2021 | Smalls Cat Food -Ground Turkey Recipe - 11.05 oz. | smalls \(brand\) | clean: exact 21113 |  |
| V-0136-2021 | Smalls Cat Food -Pate Turkey Recipe - 11.05 oz. | smalls \(brand\) | clean: exact 21110; exact 21132 |  |

### fda\_ires 88102: Freshpet Inc.

- initiated 2021-06-10, classified 2021-07-01 (Class I), status Terminated
- pet food: **yes** (alias:freshpet)
- brands: freshpet; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/freshpet-voluntarily-recalls-one-lot-freshpetr-select-small-dog-bite-size-beef-egg-recipe-dog-food
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288102%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/freshpet-voluntarily-recalls-one-lot-freshpetr-select-small-dog-bite-size-beef-egg-recipe-dog-food)
- reason: Possible salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0142-2021 | Freshpet Select Small Dog Bite Size Beef &amp; Egg Recipe NET WT 1 LB \(454 g\) Keep Refrigerated UPC: 627975012939. Sell By 10/30/2021 L2 | freshpet/select \(line\) | clean: exact 1421FBP0101; best\_by\_date 2021-10-30 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/freshpet-voluntarily-recalls-one-lot-freshpetr-select-small-dog-bite-size-beef-egg-recipe-dog-food: Freshpet Inc.

- initiated 2021-06-13, classified ?, status ?
- pet food: **yes** (alias:freshpet)
- brands: freshpet; linked: fda\_ires:88102
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/freshpet-voluntarily-recalls-one-lot-freshpetr-select-small-dog-bite-size-beef-egg-recipe-dog-food)
- reason: Potential for Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Freshpet Select Small Dog Bite Size Beef &amp; Egg Recipe Dog Food | freshpet/select \(line\) | none |  |

### fda\_ires 88248: NomNomNow Inc.

- initiated 2021-07-08, classified 2022-02-11 (Class I), status Terminated
- pet food: **yes** (alias:nom-nom)
- brands: nom-nom
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288248%22%7D%5D)
- reason: Downstream Recall. Potential L. mono contamination due to ingredient used.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0051-2022 | NomNom Cat Chicken Cuisine 50gm, 70gm, 90gm, and 110gm bags 7meal bags per bundle - up to 8 bundles per month | nom-nom/fresh-cat \(line\) | clean: exact 18700; exact 18714; exact 18728; exact 18742 \+2 |  |

### fda\_ires 88269: Nestle Purina PetCare Co

- initiated 2021-07-14, classified 2021-09-08 (Class II), status Terminated
- pet food: **yes** (alias:purina-pro-plan)
- brands: purina-pro-plan
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288269%22%7D%5D)
- reason: Canned cat food may contain foreign black rubber material

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0151-2021 | Purina Pro Plan Complete Essentials Tuna Entree, Net Wt. 3 oz, UPC 38100-11197 | purina-pro-plan/complete-essentials \(line\) | clean: best\_by\_range 2023-06-01..2023-06-30; exact 11621160 |  |

### fda\_ires 88355: Sunshine Mills, Inc.

- initiated 2021-07-26, classified 2021-11-05 (Class II), status Terminated
- pet food: **yes** (alias:wild-harvest; alias:triumph; alias:nurture-farms; alias:elm)
- brands: elm, evolve, nurture-farms, pure-being, triumph, wild-harvest; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-products-due-potentially-elevated-levels
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288355%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-products-due-potentially-elevated-levels)
- reason: Elevated levels of Aflatoxins

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0005-2022 | Wild Harvest Chicken &amp; Brown Rice 14lb bag | wild-harvest/dry-dog \(line\) | clean: exact TA2 11/FEB/2021; best\_by\_date 2022-02-11 |  |
| V-0006-2022 | Triumph Wild Spirit Deboned Chicken &amp; Brown Rice 3.5lb bag 30lb bag | triumph \(brand\) | clean: exact TA2 11/FEB/2021 \[30lb\]; exact TD2 11/FEB/2021 \[3.5lb\]; best\_by\_date 2022-02-11 |  |
| V-0007-2022 | Nuture Farms Deboned Chicken &amp; Brown Rice 15lb bag | nurture-farms/dry-dog \(line\) | clean: exact TA2 11/FEB/2021; best\_by\_date 2022-02-11 |  |
| V-0008-2022 | Elm Naturals Chicken &amp; Rice 40lb bag | elm/naturals \(line\) | clean: exact TA1 11/FEB/2021; best\_by\_date 2022-02-11 |  |
| V-0009-2022 | Evolve Classic Deboned Chicken &amp; Brown Rice 15lb bag 30lb bag | evolve/classic \(line\) | mixed: exact TA2 11/FEB/2021; best\_by\_date 2022-02-11; exact TA1/FEB/2021 \(needs\_review\) | lot\_parse |
| V-0010-2022 | Heart to Tail Pure Being Deboned Chicken &amp; Brown Rice 5lb bag | pure-being \(brand\) | clean: exact TD3 11/FEB/2021; best\_by\_date 2022-02-11 |  |

### fda\_ires 88480: The J.M. Smucker Company, Inc.

- initiated 2021-07-28, classified 2021-08-28 (Class III), status Terminated
- pet food: **yes** (alias:pup-peroni)
- brands: pup-peroni
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288480%22%7D%5D)
- reason: Visible mold on product

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0148-2021 | Pup-peroni Original Beef Flavor 25oz, 38oz, 50oz 25oz - 4 pouches per case 38oz - 4 pouches per case 50oz - 6 pouches per case | pup-peroni/original \(line\) | mixed: best\_by\_date 2022-09-28; best\_by\_date 2022-10-06; best\_by\_date 2022-10-08; best\_by\_date 2022-10-19 \+61 | lot\_parse |
| V-0149-2021 | Pup-peroni Triple Steak Flavor 25oz, 38oz 25oz - 4 pouches per case 38oz - 4 pouches per case | pup-peroni \(brand\) | mixed: best\_by\_date 2022-10-21; best\_by\_date 2022-10-19; best\_by\_date 2022-09-25; exact 1179395 \+22 | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-products-due-potentially-elevated-levels: Sunshine Mills, Inc.

- initiated 2021-07-29, classified ?, status ?
- pet food: **yes** (alias:triumph\+evolve\+nurture-farms\+elm)
- brands: elm, evolve, nurture-farms, triumph; linked: fda\_ires:88355
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/sunshine-mills-inc-issues-voluntary-recall-certain-products-due-potentially-elevated-levels)
- reason: Elevated Levels of Aflatoxin

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Triumph, Evolve, Nature Farms, Elm and others Dog Food | triumph \(brand\), evolve \(brand\), nurture-farms \(brand\), elm \(brand\) | none |  |

### fda\_ires 88479: WET NOSES NATURAL DOG TREATS

- initiated 2021-08-10, classified 2021-09-15 (Class I), status Terminated
- pet food: **yes** (alias:simply-nourish)
- brands: simply-nourish; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/wet-noses-natural-dog-treat-companyr-voluntarily-recalls-simply-nourish-brand-frozen-dog-food-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288479%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/wet-noses-natural-dog-treat-companyr-voluntarily-recalls-simply-nourish-brand-frozen-dog-food-due)
- reason: Elevated levels of Vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0155-2021 | Simply Nourish Fresh Market Chicken &amp; Vegetable Recipe, net wt. 2 lb. UPC 737257 92262. Simply Nourish Fresh Market Chicken &amp; Vegetable Rec… | simply-nourish/fresh-market \(line\) | clean: best\_by\_range 2022-11-10..2023-01-12 |  |
| V-0156-2021 | Simply Nourish Fresh Market Beef &amp; Barley Recipe, net wt. 2 lb. UPC 737257 92266. Simply Nourish Fresh Market Beef &amp; Barley Recipe, net wt.… | simply-nourish/fresh-market \(line\) | clean: best\_by\_range 2022-11-10..2023-01-12 |  |
| V-0157-2021 | Simply Nourish Fresh Market Turkey &amp; Sweet Potato Recipe , net wt. 2 lb. UPC 737257 92260. Simply Nourish Fresh Market Turkey &amp; Sweet Potat… | simply-nourish/fresh-market \(line\) | clean: best\_by\_range 2022-11-10..2023-01-12 |  |
| V-0158-2021 | Simply Nourish Pork &amp; Vegetable Recipe, net wt. 2 lb. UPC 737257 92079. Simply Nourish Pork &amp; Vegetable Recipe, net wt. 4.5 lb. UPC 737257 … | simply-nourish/fresh-market \(line\) | clean: best\_by\_range 2022-11-10..2023-01-12; best\_by\_range 2022-08-26..2023-01-13 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/wet-noses-natural-dog-treat-companyr-voluntarily-recalls-simply-nourish-brand-frozen-dog-food-due: Wet Noses Natural Dog Treat Company

- initiated 2021-08-13, classified ?, status ?
- pet food: **yes** (alias:simply-nourish)
- brands: simply-nourish; linked: fda\_ires:88479
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/wet-noses-natural-dog-treat-companyr-voluntarily-recalls-simply-nourish-brand-frozen-dog-food-due)
- reason: Due to elevated levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Simply Nourish Frozen dog food | simply-nourish \(brand\) | none |  |

### fda\_ires 88544: Top Quality Dog Food, LLC

- initiated 2021-08-19, classified 2022-02-08 (Class I), status Terminated
- pet food: **yes** (alias:top-quality-dog-food)
- brands: top-quality-dog-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/top-quality-dog-food-recalls-batch-beef-hvm-1-pound-packages-lot-number-071521-because-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288544%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/top-quality-dog-food-recalls-batch-beef-hvm-1-pound-packages-lot-number-071521-because-possible)
- reason: Top Quality Dog Food, LLC. 3630 East St. Hyattsville, MD 20785 has initiated a recall of Top Quality Dog Food, Beef HVM, 1 lb. pkgs in film casings, 1 package …

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0049-2022 | Top Quality Dog Food, Beef HVM, 1 lb. pkgs in film casings, 1package is 1 lb., Keep Frozen. Refrigerate after opening. | top-quality-dog-food/raw \(line\) | clean: exact 071521 |  |
| V-0050-2022 | Duck Wing Keystone Katie Brand packages in film casings, 1package is 19.35 lb., Keep Frozen. Refrigerate after opening. | top-quality-dog-food/keystone-katie \(line\) | none | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/top-quality-dog-food-recalls-batch-beef-hvm-1-pound-packages-lot-number-071521-because-possible: Top Quality Dog Food

- initiated 2021-08-26, classified ?, status ?
- pet food: **yes** (alias:top-quality-dog-food)
- brands: top-quality-dog-food; linked: fda\_ires:88544
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/top-quality-dog-food-recalls-batch-beef-hvm-1-pound-packages-lot-number-071521-because-possible)
- reason: Potential Salmonella &amp; Listeria monocytogenes contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Top Quality Dog Food.com Beef HVM | top-quality-dog-food/raw \(line\) | none |  |

### fda\_ires 88774: WET NOSES NATURAL DOG TREATS

- initiated 2021-09-27, classified 2021-11-02 (Class III), status Terminated
- pet food: **yes** (species\+food:dogs\+recipe)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288774%22%7D%5D)
- reason: pH level exceeded low acid level guidelines.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0003-2022 | Chicken Cacciatore Recipe, Clearly Good Food Made for All Dogs, shelf stable product packaged in glass jar, net weight 15oz. UPC 8 50201 00… | none | clean: best\_by\_date 2022-01-08; exact 000841 | unmatched |

### fda\_ires 88786: Fromm Family Foods, LLC

- initiated 2021-09-29, classified 2021-11-26 (Class I), status Terminated
- pet food: **yes** (alias:fromm)
- brands: fromm; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-four-star-shredded-entree-canned-food-dogs-due-elevated
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288786%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-four-star-shredded-entree-canned-food-dogs-due-elevated)
- reason: Dog food may contain elevated levels of Vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0026-2022 | Fromm Four-Star Nutritionals Shredded Beef in Gravy Entre, food for Dogs, Can UPC 72705-11876. Net Wt 12 oz \(340 g\) Manufactured by Fromm F… | fromm/four-star-nutritionals \(line\) | needs\_review: best\_by\_range 2024-08-01..2024-08-31 \(needs\_review\) | lot\_parse |
| V-0027-2022 | Fromm Four-Star Nutritionals Shredded Chicken in Gravy Entree, food for Dogs, Can UPC 72705-11880. Net Wt 12 oz \(340 g\) Manufactured by Fro… | fromm/four-star-nutritionals \(line\) | needs\_review: best\_by\_range 2024-08-01..2024-08-31 \(needs\_review\) | lot\_parse |
| V-0028-2022 | Fromm Four-Star Nutritionals Shredded Pork in Gravy Entree, food for Dogs, Can UPC 72705-11878. Net Wt 12 oz \(340 g\) Manufactured by Fromm … | fromm/four-star-nutritionals \(line\) | needs\_review: best\_by\_range 2024-08-01..2024-08-31 \(needs\_review\) | lot\_parse |
| V-0029-2022 | Fromm Four-Star Nutritionals Shredded Turkey in Gravy Entree, food for Dogs, Can UPC 72705-11878. Net Wt 12 oz \(340 g\) Manufactured by From… | fromm/four-star-nutritionals \(line\) | needs\_review: best\_by\_range 2024-08-01..2024-08-31 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-four-star-shredded-entree-canned-food-dogs-due-elevated: Fromm Family Foods

- initiated 2021-10-01, classified ?, status ?
- pet food: **yes** (alias:fromm)
- brands: fromm; linked: fda\_ires:88786
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-four-star-shredded-entree-canned-food-dogs-due-elevated)
- reason: Elevated levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Fromm Four-Star Nutritionals Shredded Entrée canned dog food | fromm/four-star-nutritionals \(line\) | none |  |

### fda\_ires 88842: Tuffy's Pet Foods, Inc.

- initiated 2021-10-08, classified 2021-11-05 (Class II), status Terminated
- pet food: **yes** (alias:nutrisource)
- brands: nutrisource; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/tuffys-pet-foods-inc-issues-voluntary-recall-limited-quantity-pure-vita-salmon-entree-dog-food
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2288842%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tuffys-pet-foods-inc-issues-voluntary-recall-limited-quantity-pure-vita-salmon-entree-dog-food)
- reason: Dog food may contain elevated levels of Vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0004-2022 | Nutri Source Pure Vita limited Ingredient Salmon Entree. Single Source Animal Protein. Grain Free Pate-Style Dog Food. Net Wt. 12.5 oz. \(35… | nutrisource/pure-vita \(line\) | clean: best\_by\_date 2023-06-29; best\_by\_date 2023-09-01; exact 0629101 N1; exact 0901101 N1 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/tuffys-pet-foods-inc-issues-voluntary-recall-limited-quantity-pure-vita-salmon-entree-dog-food: Tuffy’s Pet Foods, Inc.

- initiated 2021-10-12, classified ?, status ?
- pet food: **yes** (alias:nutrisource)
- brands: nutrisource; linked: fda\_ires:88842
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tuffys-pet-foods-inc-issues-voluntary-recall-limited-quantity-pure-vita-salmon-entree-dog-food)
- reason: Elevated Levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Nutri Source Pure Vita Salmon Entrée Dog Food | nutrisource/pure-vita \(line\) | none |  |

### fda\_ires 89067: Wal Mart Stores, Inc

- initiated 2021-11-12, classified 2021-12-08 (Class II), status Terminated
- pet food: **yes** (alias:members-mark)
- brands: members-mark
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2289067%22%7D%5D)
- reason: Potential to contain metal fragments

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0034-2022 | Members Mark Beef Sticks, 2.2lb bag, UPC 0019396804731 packaged in flexible plastic bags | members-mark \(brand\) | clean: all\_lots |  |

### fda\_ires 89217: Pet Brands Products LLC

- initiated 2021-12-10, classified 2022-01-11 (Class I), status Terminated
- pet food: **yes** (alias:pure-being)
- brands: pure-being
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2289217%22%7D%5D)
- reason: Potential choking hazard

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0048-2022 | Pure Being Dog &amp; Cat Advent Calendar 5.15oz - 6 calendars per case Treats individually wrapped in plastic wrap then placed inside plastic t… | pure-being \(brand\) | mixed: exact 210166PBST000P06 \[cat\]; exact PBST000P06 \[cat\] \(needs\_review\); exact 210168PBST000P06 \[cat\]; exact 210169PBST0000P06 \[cat\] \(needs\_review\) \+5 | lot\_parse |

### fda\_ires 89302: Agila Corporation

- initiated 2021-12-23, classified 2022-01-13 (Class I), status Ongoing
- pet food: **yes** (alias:woodys-pet-food-deli)
- brands: woodys-pet-food-deli
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2289302%22%7D%5D)
- reason: Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0047-2022 | Woody's Pet Food Deli RAW CORNISH HEN w/SUPP, Item 5230. Packaged in Net Wt. 80 oz. \(5 lbs\), and 15 oz. white plastic containers. Keep Froz… | woodys-pet-food-deli/raw \(line\) | needs\_review: best\_by\_date 2022-11-20 \(needs\_review\) | lot\_parse |

### fda\_ires 89627: Dollar Tree Distribution, Inc.

- initiated 2022-02-18, classified 2022-04-05 (Class II), status Terminated
- pet food: **yes** (pet food term:pet food)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2289627%22%7D%5D)
- reason: Potential exposure to rodents and rodent activity in the distribution center.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0063-2022 | Pet food and treats purchased from Family Dollar retail stores in Alabama, Arkansas, Louisiana, Mississippi, Missouri and Tennessee that ar… | none | needs\_review: retailer\_scope Family Dollar \[AL, AR, LA, MS, MO, TN; packaged in material other than glass or metal can\] \(needs\_review\) | unmatched, lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/family-dollar-stores-issues-voluntary-recall-certain-fda-regulated-products-six-states-including: Family Dollar, Inc.

- initiated 2022-02-18, classified ?, status ?
- pet food: **yes** (pet food term:pet food)
- brands: none
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/family-dollar-stores-issues-voluntary-recall-certain-fda-regulated-products-six-states-including)
- reason: Potential Salmonella contamination and presence of rodent activity at the distribution center

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Numerous brand names Numerous human food, animal \(pet\) food, medical devices, and drug products | none | none | unmatched |

### fda\_ires 95076: Predator Pet, Inc.

- initiated 2022-05-27, classified 2024-08-15 (Class II), status Terminated
- pet food: **yes** (alias:savage-cat)
- brands: savage-cat
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295076%22%7D%5D)
- reason: Product tested positive for L. mono.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0134-2024 | Savage Cat Food Rabbit \+ Lamb Raw, RTE | savage-cat/raw \(line\) | clean: exact 030324 |  |

### fda\_ires 90470: Freshpet Inc.

- initiated 2022-06-15, classified 2022-07-11 (Class I), status Terminated
- pet food: **yes** (alias:freshpet)
- brands: freshpet
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2290470%22%7D%5D)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0157-2022 | Freshpet Select, Fresh From the Kitchen, Home Cooked Chicken Recipe 4.5 lb. UPC:627975011673 | freshpet/select \(line\) | clean: best\_by\_date 2022-10-29 |  |

### fda\_ires 90570: Primal Pet Foods Inc.

- initiated 2022-07-06, classified 2022-08-23 (Class I), status Terminated
- pet food: **yes** (alias:primal)
- brands: primal
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2290570%22%7D%5D)
- reason: Potential Listeria monocytogenes contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0217-2022 | Primal Patties For Dogs Beef Formula Complete and balanced raw diet. Antibiotic-free beef raised without added hormones Grain &amp; gluten free… | primal/frozen-raw \(line\) | clean: best\_by\_date 2023-05-22; exact W10068709 |  |

### fda\_ires 90584: Stormberg Foods LLC

- initiated 2022-07-08, classified 2022-08-23 (Class I), status Ongoing
- pet food: **yes** (alias:beg-and-barker\+green-coast-pet)
- brands: beg-and-barker, green-coast-pet
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2290584%22%7D%5D)
- reason: The firm was notified by the NCDA &amp; CS that they received positive test results for Salmonella in various dog treats.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0218-2022 | 100% CHICKEN BREAST NO FILLERS, CHICKEN BREAST STRIPS, Human Grade Dogs Treats, NET WT 1 oz, UPC 8 50025 54628 7 4 oz \(113g\), UPC 8 50025 5… | beg-and-barker/chicken-breast-strips \(line\), green-coast-pet/chicken-crisps \(line\) | mixed: best\_by\_date 2023-06-17; best\_by\_date 2023-06-08; best\_by\_date 2023-06-06; best\_by\_date 2020-06-08 \(needs\_review\) \+9 | lot\_parse |

### fda\_ires 90832: BREUER PREMIUM PET FOOD CO, INC

- initiated 2022-09-06, classified 2022-10-14 (Class I), status Terminated
- pet food: **yes** (alias:spot-and-tango)
- brands: spot-and-tango
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2290832%22%7D%5D)
- reason: Contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0009-2023 | Spot &amp; Tango Chicken and Brown Rice UnKibble Dog Food - 28oz, 38oz, 47oz, 56oz | spot-and-tango/unkibble \(line\) | clean: exact T-22220 \[SKU U-C-004\]; exact T-22223 \[SKU U-C-005\]; exact T-22220 \[SKU U-C-006\] |  |

### fda\_ires 91233: Nestle Purina PetCare Co

- initiated 2022-11-30, classified 2022-12-19 (Class II), status Terminated
- pet food: **yes** (alias:purina-pro-plan-veterinary-diets)
- brands: purina-pro-plan-veterinary-diets
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291233%22%7D%5D)
- reason: Cans of a complete adult wet dog food are mislabeled as a prescription diet low fat wet dog food.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0019-2023 | Purina Pro Plan Veterinary Diets EN Gastroenteric Low Fat prescription wet dog food in 13.4 oz can, case of 12, UPC 38100 17599 | purina-pro-plan-veterinary-diets/en-gastroenteric \(line\) | clean: best\_by\_range 2024-09-01..2024-09-30; exact 22581159 L4TR6 |  |

### fda\_ires 91342: Texas Farm Products Company dba TFP Nutrition

- initiated 2022-12-15, classified 2023-01-08 (Class I), status Terminated
- pet food: **yes** (alias:heb-texas-pets)
- brands: heb-texas-pets
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291342%22%7D%5D)
- reason: Potential Salmonella contamination of dry cat food

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0023-2023 | H-E-B Texas Pets Indoor Complete Formulated especially for Indoor Cats NET WT 16 LBS packaged in a poly-woven sewn bag UPC 4122081223 | heb-texas-pets/dry-cat \(line\) | needs\_review: production\_date 13 NOV 22 \(needs\_review\) | lot\_parse |

### fda\_ires 91551: Royal Canin USA Inc

- initiated 2023-01-23, classified 2023-02-06 (Class II), status Terminated
- pet food: **yes** (alias:royal-canin)
- brands: royal-canin
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291551%22%7D%5D)
- reason: Product is mislabeled and some bags may contain a different product.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0047-2023 | Royal Canin Veterinary Feline Renal Support F, Net Weight 6.6 lb \(3 kg\), packaged in a flexible plastic bag. | royal-canin/veterinary-diets \(line\) | clean: best\_by\_date 2024-04-17; exact 242B4RCR04 |  |

### fda\_ires 91662: Nestle Purina PetCare Co

- initiated 2023-02-08, classified 2023-03-10 (Class I), status Terminated
- pet food: **yes** (alias:purina-pro-plan-veterinary-diets)
- brands: purina-pro-plan-veterinary-diets
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291662%22%7D%5D)
- reason: Prescription diet dry dog food may contain elevated levels of vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0051-2023 | Purina Pro Plan Veterinary Diets EL Elemental prescription dry dog food packaged in 8lb \(UPC 38100 19190\) and 20lb \(UPC 38100 19192\) bags. | purina-pro-plan-veterinary-diets/el-elemental \(line\) | mixed: exact 2249 1082 \(needs\_review\); exact 2250 1082 \(needs\_review\); exact 2276 1082 \(needs\_review\); exact 2277 1082 \(needs\_review\) \+4 | lot\_parse |

### fda\_ires 91881: Nestle Purina PetCare Co

- initiated 2023-03-10, classified 2023-04-18 (Class I), status Terminated
- pet food: **yes** (alias:purina-pro-plan-veterinary-diets)
- brands: purina-pro-plan-veterinary-diets
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291881%22%7D%5D)
- reason: Prescription diet dry dog food may contain elevated levels of vitamin D.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0054-2023 | Purina Pro Plan Veterinary Diets EL Elemental prescription dry dog food packaged in 8lb \(UPC 38100 19190\) and 20lb \(UPC 3810019192\) bags. | purina-pro-plan-veterinary-diets/el-elemental \(line\) | clean: best\_by\_range 2023-08-01..2023-08-31; exact 2213 1082; exact 2214 1082 |  |

### fda\_ires 91965: Spectrum Brands Pet Group Inc

- initiated 2023-03-24, classified 2023-04-06 (Class II), status Terminated
- pet food: **yes** (alias:good-n-fun)
- brands: good-n-fun
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2291965%22%7D%5D)
- reason: May be contaminated with foreign material \(metal\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0053-2023 | Good n Fun Triple Flavor Crunchy Spirals Net Wt. 4.2 oz \(120g\) UPC:0 91093 94250 6 Packaged in plastic bags. | good-n-fun/chews \(line\) | clean: best\_by\_date 2025-08-19; exact JA22232 |  |

### fda\_ires 92330: Ark Naturals Company

- initiated 2023-05-11, classified 2023-06-05 (Class II), status Ongoing
- pet food: **yes** (alias:ark-naturals)
- brands: ark-naturals
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2292330%22%7D%5D)
- reason: Potential mold.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0123-2023 | Every Day Naturals No Brush Toothpaste Natural Dental Chew 4-in-1 Dental Chew Distributed by: Ark Naturals Company Tampa, Florida 33602 a\) … | ark-naturals/dental-chews \(line\) | clean: best\_by\_date 2024-08-09 \[item a\]; best\_by\_date 2024-09-30 \[item a\]; best\_by\_date 2024-12-20 \[item a\]; exact AUG092022 \[item a\] \+46 |  |
| V-0124-2023 | Ark Naturals Brushless Toothpaste Dental Chew 4-in-1 Original Dental Chew Distributed by: Ark Naturals Company Tampa, Florida 33602 www.ark… | ark-naturals/dental-chews \(line\) | clean: best\_by\_date 2025-02-06 \[item c\]; exact AUG112022 \[item c\]; exact AUG162022 \[item c\]; exact AUG182022 \[item c\] \+36 |  |

### fda\_ires 92422: Cargill, Inc Corporate Headquarters

- initiated 2023-05-30, classified 2023-06-12 (Class II), status Terminated
- pet food: **yes** (alias:best-choice)
- brands: best-choice
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2292422%22%7D%5D)
- reason: Elevated aflatoxin levels

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0125-2023 | Best Choice Complete Puppy Formula Dog Food, 4.4 lb bags \(UPC 0 70038 60378 8\) and 16.5 lb bags \(UPC 0 70038 60381 8\) | best-choice/complete-puppy \(line\) | clean: best\_by\_date 2023-09-21; exact EP2264 |  |

### fda\_ires 92718: What The Raw

- initiated 2023-07-14, classified 2023-09-28 (Class I), status Terminated
- pet food: **yes** (firm brand:what-the-raw)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2292718%22%7D%5D)
- reason: Uneviscerated whole dried sardines used in raw pet food. Potentially contaminated with Clostridium botulinum
- review #223 unclassified (resolved): pet food undecided; firm: What The Raw; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0163-2023 | Single Dried Sardine packaged in shrink wrap. Individually sold. No labeling on product. | none | mixed: best\_by\_date 2022-11-10 \(needs\_review\); best\_by\_date 2023-04-02 \(needs\_review\); best\_by\_date 2023-12-28; best\_by\_date 2023-05-10 \(needs\_review\) \+6 | ambiguous, lot\_parse |

### fda\_ires 92990: Mid America Pet Food LLC

- initiated 2023-09-02, classified 2023-09-28 (Class I), status Ongoing
- pet food: **yes** (alias:victor)
- brands: victor
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2292990%22%7D%5D)
- reason: Positive Salmonella Sample

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Victor Super Premium Dog Food, Hi-Pro Plus packaged in 5lb poly bag; UPC 94308 00214 | victor/classic \(line\) | clean: best\_by\_date 2024-04-30; exact 1000016385 |  |

### fda\_ires 93131: Carolina Prime Pet, Inc.

- initiated 2023-09-27, classified 2023-10-26 (Class I), status Ongoing
- pet food: **yes** (alias:hollywood-feed; brand hollywood-feed but other animal:feed)
- brands: hollywood-feed
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293131%22%7D%5D)
- reason: The firm was notified by their customer that the products test positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0010-2024 | Hollywood Feed CAROLINA Made USA FARM RAISED BEEF JERKY NET WEIGHT 5OZ \(141 G\) DISTRIBUTED BY HOLLYWOOD FEED, LLC 1341 WARFORD STREET MEMPH… | hollywood-feed/carolina-made \(line\) | clean: exact 20082323; best\_by\_date 2025-02-25 |  |
| V-0011-2024 | Hollywood Feed CAROLINA Made USA FARMED RAISED CHICKEN JERKY NET WEIGHT 5OZ \(141 G\) DISTRIBUTED BY HOLLYWOOD FEED, LLC 1341 WARFORD STREET … | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2025-02-24; best\_by\_date 2025-02-25; exact 20082323; exact 20082423 |  |
| V-0012-2024 | Hollywood Feed CAROLINA Made WILD ELK JERKY NET WEIGHT 5OZ \(141 G\) DISTRIBUTED BY HOLLY WOOD FEED, LLC 1341 WARFORD STREET MEMPHIS, TN 3810… | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2025-02-24; exact 20082423 |  |
| V-0013-2024 | Hollywood Feed CAROLINA Made PORK JERKY NET WEIGHT 6OZ \(141 G\) DISTRIBUTED BY HOLLYWOOD FEED, LLC 1341 WARFORD STREET MEMPHIS, TN 38108 UPC… | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2025-02-25; exact 20082523 |  |
| V-0014-2024 | Hollywood Feed CAROLINA Made USA FARMED RAISED TURKEY JERKY NET WEIGHT 6OZ \(141 G\) DISTRIBUTED BY HOLLYWOOD FEED, LLC 1341 WARFORD STREET M… | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2025-02-24; exact 20082423 |  |

### fda\_ires 93284: Texas Farm Products Company dba TFP Nutrition

- initiated 2023-10-20, classified 2023-11-21 (Class I), status Completed
- pet food: **yes** (alias:retriever-tsc)
- brands: retriever-tsc
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293284%22%7D%5D)
- reason: potential salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0021-2024 | Retriever All Life Stages Mini Chunk Chicken Recipe Dry Dog Food, Lot numbers: BEST BY 10 2024 3277 TFP and BEST BY 10 2024 3278 TFP | retriever-tsc/mini-chunk \(line\) | clean: best\_by\_range 2024-10-01..2024-10-31; exact 3277 TFP; exact 3278 TFP |  |

### fda\_ires 93324: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2023-10-27, classified 2023-11-24 (Class I), status Ongoing
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293324%22%7D%5D)
- reason: The firm was notified by the FDA that the product test positive for Salmonella.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0023-2024 | BLUE RIDGE BEEF Breeders Choice For Dogs Higher Fat Content Keep Frozen Until Ready for Use Net Wt. 2 lbs. \(.91kg\) Not intended for Human F… | blue-ridge-beef/breeders-choice \(line\) | clean: exact 08/02/24 |  |

### fda\_ires 93333: Mid America Pet Food LLC

- initiated 2023-10-30, classified 2024-01-30 (Class I), status Completed
- pet food: **yes** (alias:victor)
- brands: victor
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293333%22%7D%5D)
- reason: Positive Salmonella sample

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0033-2024 | Victor Super Premium Dog Food, Select Beef Meal &amp; Brown Rice Formula 1000016890 5 pound bag 6/12/2024, 1000016891 15 pound bag 6/12/2024, 1… | victor/select \(line\) | clean: best\_by\_date 2024-06-12; best\_by\_range …..2024-10-31; exact 1000016890; exact 1000016891 \+1 |  |

### fda\_ires 93445: Texas Farm Products Company dba TFP Nutrition

- initiated 2023-11-13, classified 2024-01-23 (Class I), status Terminated
- pet food: **yes** (alias:country-acres\+exclusive\+heb-texas-pets\+hill-country-fare\+lone-star-tfp\+members-mark\+retriever-tsc\+star-pro\+econom…)
- brands: country-acres, economax, exclusive, feline-medley, heb-texas-pets, hill-country-fare, lone-star-tfp, members-mark, retriever-tsc, star-pro
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293445%22%7D%5D)
- reason: Positive Salmonella Sample

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0026-2024 | Country Acres Farm Dog 55lb 23233TFP 18 -23316TFP 18 Exclusive Red Flannel Adult Formula Dog Food 40lb 23233TFP 18- 23316TFP 18; Exclusive … | country-acres/farm-dog \(line\), country-acres/farm-cat \(line\), exclusive/red-flannel \(line\), exclusive/signature \(line\), heb-texas-pets/dry-dog \(line\), heb-texas-pets/dry-cat \(line\), hill-country-fare/dry-dog \(line\), lone-star-tfp/dog \(line\), members-mark/dog-dry \(line\), retriever-tsc/hi-protein \(line\), retriever-tsc/bites-and-bones \(line\), retriever-tsc/choice-chops \(line\), retriever-tsc/mini-chunk \(line\), retriever-tsc/puppy-blend \(line\), star-pro \(brand\), economax/dry-cat \(line\), feline-medley/formula \(line\) | clean: best\_by\_range 2024-10-05..2024-11-06; range 23233TFP 18..23316TFP 18 |  |

### fda\_ires 93641: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2023-12-15, classified 2024-01-23 (Class I), status Ongoing
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/expanded-affected-states-blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-kitten-grind-blue
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293641%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/expanded-affected-states-blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-kitten-grind-blue)
- reason: The firm was notified by North Carolina Department of Agriculture and Consumer Services that the products tested positive for Salmonella and Listeria.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0027-2024 | BLUE RIDGE BEEF RAW PET FOOD Puppy Mix For Dogs Net Wt. 2 lbs. \(.91kg\) Manufactured by: Blue Ridge Beef PO Box 7261, Statesville, NC 28687 … | blue-ridge-beef/puppy-mix \(line\) | clean: range N24 1124..N24 1224 |  |
| V-0028-2024 | BLUE RIDGE BEEF RAW PET FOOD Kitten Grind For Cats Net Wt. 2 lbs \(.91 kg\) Manufactured by: Blue Ridge Beef PO Box 7261, Statesville, NC 286… | blue-ridge-beef/kitten-grind \(line\) | clean: range N24 1124..N24 1224 |  |
| V-0029-2024 | BLUE RIDGE BEEF RAW PET FOOD Kitten Mix For Cats Net Wt. 2 lbs. \(.91kg\) Manufactured by: Blue Ridge Beef PO Box 7261, Statesville, NC 28687… | blue-ridge-beef/kitten-mix \(line\) | clean: range N24 1124..N24 1224 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/expanded-affected-states-blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-kitten-grind-blue: Blue Ridge Beef

- initiated 2024-01-03, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:93641
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/expanded-affected-states-blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-kitten-grind-blue)
- reason: Potential contamination of Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Kitten Grind, Kitten Mix, and Puppy Mix | blue-ridge-beef/kitten-grind \(line\), blue-ridge-beef/kitten-mix \(line\), blue-ridge-beef/puppy-mix \(line\) | none |  |

### fda\_ires 93862: Viva Raw

- initiated 2024-01-23, classified 2024-02-26 (Class I), status Ongoing
- pet food: **yes** (alias:viva-raw)
- brands: viva-raw
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2293862%22%7D%5D)
- reason: FDA notified the firm that via our Adverse Event Reporting system that a positive test results for Listeria monocytogenes and Salmonella was found in the produ…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0035-2024 | VIVA for cats duck net wt. 1 lb \(454g\) Viva Raw 500 valley Forge Rd, Hillsborough, NC 27278 | viva-raw/cats \(line\) | clean: exact 22853 |  |
| V-0036-2024 | VIVA for dogs Chunked duck net wt. 1 lb \(454g\) 500 valley Forge Rd, Hillsborough, NC 27278 | viva-raw/dogs \(line\) | clean: exact 22853 |  |
| V-0037-2024 | VIVA for dogs GROUND duck net wt. 1 lb \(454g\) Viva Raw 500 valley Forge Rd, Hillsborough, NC 27278 | viva-raw/dogs \(line\) | clean: exact 22853 |  |
| V-0038-2024 | VIVA PURE duck PETFOODMIXER net wt. 1 lb \(454g\) Viva Raw 500 valley Forge Rd, Hillsborough, NC 27278 | viva-raw/pure \(line\) | clean: exact 22853 |  |

### fda\_ires 94657: MARS PETCARE U.S INC

- initiated 2024-05-17, classified 2024-06-21 (Class II), status Terminated
- pet food: **yes** (alias:pedigree)
- brands: pedigree; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/mars-petcare-us-inc-voluntarily-recalls-315-bags-pedigreer-adult-complete-nutrition-grilled-steak
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2294657%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/mars-petcare-us-inc-voluntarily-recalls-315-bags-pedigreer-adult-complete-nutrition-grilled-steak)
- reason: Potential Metal Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0123-2024 | 44 lb. bag PEDIGREE Adult Complete Nutrition Grilled Steak &amp; Vegetable Flavor Dry Dog Food | pedigree/complete-nutrition \(line\) | clean: best\_by\_date 2025-03-04; exact 410B2TXT02 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/mars-petcare-us-inc-voluntarily-recalls-315-bags-pedigreer-adult-complete-nutrition-grilled-steak: Mars Petcare US, Inc.

- initiated 2024-05-18, classified ?, status ?
- pet food: **yes** (alias:pedigree)
- brands: pedigree; linked: fda\_ires:94657
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/mars-petcare-us-inc-voluntarily-recalls-315-bags-pedigreer-adult-complete-nutrition-grilled-steak)
- reason: Potential Presence of Loose Metal Pieces

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Pedigree Adult Complete Nutrition Grilled Steak &amp; Vegetable Flavor Dry Dog Food | pedigree/complete-nutrition \(line\) | none |  |

### fda\_ires 94732: TDBBS, LLC.

- initiated 2024-05-30, classified 2024-06-26 (Class I), status Ongoing
- pet food: **yes** (alias:best-bully-sticks\+barkworthies)
- brands: barkworthies, best-bully-sticks; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/tdbbs-llc-recalls-green-tripe-dog-treats-due-potential-foreign-metal-object-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2294732%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tdbbs-llc-recalls-green-tripe-dog-treats-due-potential-foreign-metal-object-contamination)
- reason: Foreign material \(metal\) contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0124-2024 | Green Tripe: 2 lbs plastic bag, Best-Bully-Sticks-brand \(UPC:816807016027\); 5 lbs plastic bag, Best-Bully-Sticks-brand \(UPC: 816807016010 \)… | best-bully-sticks/treats \(line\), barkworthies \(brand\) | clean: best\_by\_range 2026-03-01..2026-08-31; best\_by\_range 2026-01-01..2026-04-30; best\_by\_range 2026-02-01..2026-03-31; exact WO152669 \+8 |  |

### fda\_ires 94362: Viva Raw

- initiated 2024-06-12, classified 2024-07-02 (Class II), status Ongoing
- pet food: **yes** (alias:viva-raw)
- brands: viva-raw; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-dog-and-cat-food-including-select-viva-turkey-recipes-lot-21244-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2294362%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-dog-and-cat-food-including-select-viva-turkey-recipes-lot-21244-due)
- reason: After an inspection by the FDA, the firm was notified that their products test positive for Listeria monocytogenes.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0126-2024 | VIVA for cats turkey net wt. 1lb \(454g\) Distributed by Viva Raw, 500 Valley Forge Rd, Hillsborough, NC 27278 | viva-raw/cats \(line\) | clean: exact 21244 |  |
| V-0127-2024 | VIVA for dogs CHUNKED turkey net wt. 1lb \(454g\) Viva Raw, 500 Valley Forge Rd, Hillsborough, NC 27278 | viva-raw/dogs \(line\) | clean: exact 21244 |  |
| V-0128-2024 | VIVA for dogs GROUND turkey net wt. 1lb \(454g\) Viva Raw, 500 Valley Forge Rd, Hillsborough, NC 27278 | viva-raw/dogs \(line\) | clean: exact 21244 |  |
| V-0129-2024 | VIVA for puppies beef &amp; turkey GROUND net wt. 1lb \(454g\) Viva Raw, 500 Valley Forge Rd, Hillsborough, NC 27278 | viva-raw/puppies \(line\) | clean: exact 21244 |  |
| V-0130-2024 | VIVA PURE turkey for cats &amp; dogs net wt. 1lb \(454g\) Viva Raw, 500 Valley Forge Rd, Hillsborough, NC 27278 | viva-raw/pure \(line\) | clean: exact 21244 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/tdbbs-llc-recalls-green-tripe-dog-treats-due-potential-foreign-metal-object-contamination: TDBBS LLC

- initiated 2024-06-21, classified ?, status ?
- pet food: **yes** (alias:barkworthies\+best-bully-sticks)
- brands: barkworthies, best-bully-sticks; linked: fda\_ires:94732
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tdbbs-llc-recalls-green-tripe-dog-treats-due-potential-foreign-metal-object-contamination)
- reason: May Contain Metal Objects

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | BARKWORTHIES and BEST BULLY STICKS Green Tripe Dog Treats | barkworthies/treats \(line\), best-bully-sticks/treats \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-dog-and-cat-food-including-select-viva-turkey-recipes-lot-21244-due: Viva Raw, LLC

- initiated 2024-07-01, classified ?, status ?
- pet food: **yes** (alias:viva-raw)
- brands: viva-raw; linked: fda\_ires:94362
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-dog-and-cat-food-including-select-viva-turkey-recipes-lot-21244-due)
- reason: Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Viva Raw dog and cat food | viva-raw \(brand\) | none |  |

### fda\_ires 95340: Lystn LLC

- initiated 2024-09-22, classified 2024-10-21 (Class I), status Terminated
- pet food: **yes** (alias:answers)
- brands: answers; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/answers-pet-food-voluntarily-withdrawals-certain-limited-lots-beef-and-chicken-dog-foods-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295340%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/answers-pet-food-voluntarily-withdrawals-certain-limited-lots-beef-and-chicken-dog-foods-due)
- reason: Potential Salmonella Newport and Listeria monocytogenes contamination Potential Listeria monocytogenes contamination Potential Salmonella Kentucky contaminatio…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0019-2025 | Answers Pet Food Raw Beef Detailed Formula Net Wt. 4 lb \(64 oz\) \(1.8 kg\) UPC:856554002102. Packaged in 4-pound \(half gallon\) cartons. Froze… | answers/detailed \(line\) | clean: best\_by\_date 2026-05-06 |  |
| V-0020-2025 | Answers Pet Food Raw Beef Straight Formula Net Wt. 4 lb \(64 oz\) \(1.8 kg\) UPC:856554002102. Packaged in 4-pound \(half gallon\) cartons. Froze… | answers/straight \(line\) | clean: best\_by\_date 2026-01-31 |  |
| V-0021-2025 | Answers Pet Food Straight Chicken Formula for Dogs Net Wt. 4lb \(64 oz\) \(1.8 kg\) UPC:856554002065. Packaged in 4-pound \(half gallon\) cartons… | answers/straight \(line\) | clean: best\_by\_date 2026-01-02 |  |
| V-0022-2025 | Answers Pet Food Straight Chicken Formula for Dogs Net Wt. 4lb \(64 oz\) \(1.8 kg\) UPC:856554002065. Packaged in 4-pound \(half gallon\) cartons… | answers/straight \(line\) | clean: best\_by\_date 2026-03-11 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/answers-pet-food-voluntarily-withdrawals-certain-limited-lots-beef-and-chicken-dog-foods-due: Lystn, LLC. d.b.a. ANSWERS

- initiated 2024-09-23, classified ?, status ?
- pet food: **yes** (alias:answers)
- brands: answers; linked: fda\_ires:95340
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/answers-pet-food-voluntarily-withdrawals-certain-limited-lots-beef-and-chicken-dog-foods-due)
- reason: Due to Potential Salmonella and Listeria

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | ANSWERS Beef and Chicken Dog Foods | answers \(brand\) | none |  |

### fda\_ires 95555: Carolina Prime Pet, Inc.

- initiated 2024-10-07, classified 2024-11-20 (Class I), status Ongoing
- pet food: **yes** (alias:hollywood-feed)
- brands: hollywood-feed
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295555%22%7D%5D)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0031-2025 | Hollywood Feed Carolina Made Dog Treat - Chicken Chips 4 oz UPC 8 10125 85028 8. Packaged in a stand up resealable pouch. 24 pouches per ca… | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2026-02-27; exact 20082724; exact 20072924-7 |  |

### fda\_ires 95833: Carolina Prime Pet, Inc.

- initiated 2024-11-15, classified 2024-12-11 (Class I), status Ongoing
- pet food: **yes** (alias:hollywood-feed)
- brands: hollywood-feed; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/carolina-prime-pet-inc-recalls-hollywood-feed-carolina-made-chicken-chips-because-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295833%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carolina-prime-pet-inc-recalls-hollywood-feed-carolina-made-chicken-chips-because-possible)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0042-2025 | Hollywood Feed Carolina Made Dog Treat - Chicken Chips Net Wt. 16 oz. UPC: 810125850295 Packaged in a stand up resealable pouch. 16 bags pe… | hollywood-feed/carolina-made \(line\) | clean: best\_by\_date 2025-11-13; exact 20051324L2 |  |

### fda\_ires 95835: Gaines Pet Treats LLC

- initiated 2024-11-22, classified 2024-12-19 (Class I), status Terminated
- pet food: **yes** (alias:gaines-family-farmstead)
- brands: gaines-family-farmstead; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/gaines-pet-treats-llc-voluntarily-recalls-gaines-family-farmstead-chicken-chips-dogs-due-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295835%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/gaines-pet-treats-llc-voluntarily-recalls-gaines-family-farmstead-chicken-chips-dogs-due-possible)
- reason: Potential Salmonella contamination
- review #238 unclassified (resolved): pet food undecided; firm: Gaines Pet Treats LLC; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0045-2025 | Gaines Family Farmstead Chicken Chips Net Wt. 5 oz. \(142g\). UPC: 860009062373. Packaged in a stand up resealable pouch, 16 pouches per case. | gaines-family-farmstead/chicken-chips \(line\) | clean: best\_by\_date 2025-12-11; exact 20061124 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/gaines-pet-treats-llc-voluntarily-recalls-gaines-family-farmstead-chicken-chips-dogs-due-possible: Gaines Pet Treats LLC

- initiated 2024-11-22, classified ?, status ?
- pet food: **yes** (alias:gaines-family-farmstead)
- brands: gaines-family-farmstead; linked: fda\_ires:95835
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/gaines-pet-treats-llc-voluntarily-recalls-gaines-family-farmstead-chicken-chips-dogs-due-possible)
- reason: Potential Salmonella Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Gaines Family Farmstead Chicken Chips Dog Treats | gaines-family-farmstead/chicken-chips \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/carolina-prime-pet-inc-recalls-hollywood-feed-carolina-made-chicken-chips-because-possible: Carolina Prime Pet

- initiated 2024-11-23, classified ?, status ?
- pet food: **yes** (alias:hollywood-feed)
- brands: hollywood-feed; linked: fda\_ires:95833
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/carolina-prime-pet-inc-recalls-hollywood-feed-carolina-made-chicken-chips-because-possible)
- reason: Potentially contaminated with Salmonella
- review #577 link_listing (resolved): several iRES events match: 95555, 95833 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Hollywood Feed Carolina Made Chicken Chips Dog Treats | hollywood-feed/carolina-made \(line\) | none |  |

### fda\_ires 95879: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2024-11-27, classified 2024-12-19 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-due-salmonella-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295879%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-due-salmonella-contamination)
- reason: Possible Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0046-2025 | Blue Ridge Beef Puppy Mix For Dogs Net Wt. 2 lbs \(.91 kg\) UPC: 854298001696. Packaged in clear plastic chub bags, 15 packages per case. Fro… | blue-ridge-beef/puppy-mix \(line\) | clean: exact 08/06/N25; exact 08/16/N25 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-due-salmonella-contamination: Blue Ridge Beef

- initiated 2024-12-04, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:95879
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-due-salmonella-contamination)
- reason: Potential Foodborne Illness - Salmonella
- review #398 link_listing (resolved): several iRES events match: 95879, 96096 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Puppy Mix | blue-ridge-beef/puppy-mix \(line\) | none |  |

### fda\_ires 95964: SFD Opco, LLC

- initiated 2024-12-11, classified 2025-01-02 (Class III), status Terminated
- pet food: **yes** (alias:open-farm)
- brands: open-farm
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2295964%22%7D%5D)
- reason: Foreign object \(plastic\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0048-2025 | Open Farm Freeze-Dried Raw Pork Recipe. Packaged in pouches. Net Weight 3.5 oz \(99g\), UPC: 683547126053, 12 pouches per case Net Weight 13.… | open-farm/freeze-dried-raw \(line\) | clean: best\_by\_date 2026-08-22; best\_by\_date 2026-11-08; best\_by\_date 2026-08-26; best\_by\_date 2026-08-21 \+10 |  |
| V-0049-2025 | Open Farm Freeze-Dried Raw Homestead Turkey Recipe. Packaged in pouches. Net Weight 3.5 oz \(99g\), UPC: 683547126008, 12 pouches per case Ne… | open-farm/freeze-dried-raw \(line\) | clean: best\_by\_date 2026-09-12; best\_by\_date 2026-10-11; best\_by\_date 2026-10-21; best\_by\_date 2026-10-22 \+19 |  |
| V-0050-2025 | Open Farm Freeze-Dried Raw Grass-Fed Beef Recipe. Packaged in pouches. Net Weight 3.5 oz \(99g\), UPC: 683547126022, 12 pouches per case Net … | open-farm/freeze-dried-raw \(line\) | clean: best\_by\_date 2026-09-04; best\_by\_date 2026-09-13; best\_by\_date 2026-10-24; best\_by\_date 2026-11-15 \+19 |  |
| V-0051-2025 | Open Farm Freeze-Dried Raw Surf &amp; Turf Recipe. Packaged in pouches. Net Weight 3.5 oz \(99g\), UPC: 683547126062, 12 pouches per case Net Wei… | open-farm/freeze-dried-raw \(line\) | clean: exact 24243STDDPS; exact 17-BO-017629; best\_by\_date 2026-10-07; best\_by\_date 2026-10-18 \+22 |  |
| V-0052-2025 | Open Farm Freeze-Dried Raw Lamb Recipe. Packaged in pouches. Net Weight 3.5 oz \(99g\), UPC: 683547126046, 12 pouches per case Net Weight 13.… | open-farm/freeze-dried-raw \(line\) | clean: best\_by\_date 2026-09-17; best\_by\_date 2026-09-19; best\_by\_date 2026-08-26; best\_by\_date 2026-08-27 \+16 |  |
| V-0053-2025 | Global Animal Partnership Open Farm Red Meat Fiesta Freeze Dried Meat Morsels, Barcode 13371. Weight-up to 600 lbs. Packaged in bulk corrug… | open-farm/freeze-dried-raw \(line\) | clean: best\_by\_date 2025-03-26; best\_by\_date 2025-03-27; best\_by\_date 2025-03-28; best\_by\_date 2025-03-30 \+57 |  |

### fda\_ires 96016: Smallbatch Pets LLC

- initiated 2024-12-16, classified 2025-01-26 (Class I), status Terminated
- pet food: **yes** (alias:smallbatch)
- brands: smallbatch
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296016%22%7D%5D)
- reason: Potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0054-2025 | Smallbatch Dog Chicken Recipe Patties 6lbs \(2.72kg\), UPC: 705105969879. Packaged in a plastic pouch, 6 pouches per case. Bulk 18 lb, UPC: 0… | smallbatch/patties \(line\) | clean: best\_by\_date 2026-02-21; exact 24326 CPATL |  |

### fda\_ires 96096: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2025-01-03, classified 2025-02-12 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-blue-ridge-beef-kitten-mix-due-salmonella-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296096%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-blue-ridge-beef-kitten-mix-due-salmonella-contamination)
- reason: Possible Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0059-2025 | Blue Ridge Beef Kitten Mix Net Wt. 2 lbs \(.91 kg\) UPC: 8542980013436. Packaged in clear plastic chub bags, 15 packages per case. | blue-ridge-beef/kitten-mix \(line\) | clean: exact 07/16/N25 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-blue-ridge-beef-kitten-mix-due-salmonella-contamination: Blue Ridge Beef

- initiated 2025-01-03, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:96096
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-recalls-blue-ridge-beef-kitten-mix-due-salmonella-contamination)
- reason: Potential to be contaminated with Salmonella
- review #399 link_listing (resolved): several iRES events match: 96096, 96213 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Kitten mix pet food | blue-ridge-beef/kitten-mix \(line\) | none |  |

### fda\_ires 96213: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2025-01-31, classified 2025-02-19 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-recall-blue-ridge-beef-natural-mix-due-salmonella-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296213%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-recall-blue-ridge-beef-natural-mix-due-salmonella-contamination)
- reason: Potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0060-2025 | Blue Ridge Beef Natural Mix For Dogs Net Wt. 2 lbs \(.91 kg\) UPC:854298001054 clear plastic chub bags, 15 per case. Frozen | blue-ridge-beef/natural-mix \(line\) | clean: exact N25/1231 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-recall-blue-ridge-beef-natural-mix-due-salmonella-contamination: Blue Ridge Beef

- initiated 2025-01-31, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:96213
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-recall-blue-ridge-beef-natural-mix-due-salmonella-contamination)
- reason: Salmonella contamination
- review #400 link_listing (resolved): several iRES events match: 96096, 96213 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Natural Mix | blue-ridge-beef/natural-mix \(line\) | none |  |

### fda\_ires 96410: Wild Coast LLC

- initiated 2025-03-01, classified 2025-04-24 (Class I), status Terminated
- pet food: **yes** (alias:wild-coast-raw)
- brands: wild-coast-raw; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-wild-coast-raw-boneless-free-range-chicken-formula-raw-pet-food-because-possible
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296410%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-wild-coast-raw-boneless-free-range-chicken-formula-raw-pet-food-because-possible)
- reason: Highly Pathogenic Avian Influenza \(HPAI\) contamination in raw cat food

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0074-2025 | Wild Coast Raw Boneless Free Range Chicken Feline Formula 24 oz and 16 oz. Packaged in plastic tubs, 8 tubs per case. | wild-coast-raw/feline \(line\) | clean: best\_by\_range 2025-12-01..2025-12-31; exact 22660; exact 22653; exact 22641 \+3 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-wild-coast-raw-boneless-free-range-chicken-formula-raw-pet-food-because-possible: Wild Coast LLC dba Wild Coast Raw

- initiated 2025-03-01, classified ?, status ?
- pet food: **yes** (alias:wild-coast-raw)
- brands: wild-coast-raw; linked: fda\_ires:96410
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-wild-coast-raw-boneless-free-range-chicken-formula-raw-pet-food-because-possible)
- reason: Possible Bird Flu Health Risk

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Wild Coast Raw Frozen Boneless Free Range Chicken Formula raw pet food for cats | wild-coast-raw \(brand\) | none |  |

### fda\_ires 96509: PREDATOR PET INC DBA SAVAGE PET

- initiated 2025-03-14, classified 2025-05-06 (Class I), status Terminated
- pet food: **yes** (alias:savage-cat)
- brands: savage-cat; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/savage-pet-recalls-savage-cat-food-chicken-large-and-small-boxes-because-possible-bird-flu-health
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296509%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/savage-pet-recalls-savage-cat-food-chicken-large-and-small-boxes-because-possible-bird-flu-health)
- reason: Highly Pathogenic Avian Influenza \(HPAI\) contamination in raw cat food.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0078-2025 | Savage Cat Food Chicken 84 oz. Packaged in boxes containing 28, 3 oz plastic packets of product. Frozen product. Savage Cat Food Chicken 21… | savage-cat/raw \(line\) | clean: exact 11152026 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/savage-pet-recalls-savage-cat-food-chicken-large-and-small-boxes-because-possible-bird-flu-health: Savage Pet

- initiated 2025-03-15, classified ?, status ?
- pet food: **yes** (alias:savage-cat)
- brands: savage-cat; linked: fda\_ires:96509
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/savage-pet-recalls-savage-cat-food-chicken-large-and-small-boxes-because-possible-bird-flu-health)
- reason: Possible Bird Flu Health Risk

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Savage Pet Cat Food Chicken | savage-cat \(brand\) | none |  |

### fda\_ires 96610: SUPERCAN BULLY STICKS LLC

- initiated 2025-03-28, classified 2025-05-02 (Class I), status Terminated
- pet food: **yes** (pet food term:bully sticks)
- brands: none; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/supercan-bulk-recalls-single-lot-pig-ear-slivers-pet-treats-due-salmonella-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296610%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/supercan-bulk-recalls-single-lot-pig-ear-slivers-pet-treats-due-salmonella-contamination)
- reason: Potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0077-2025 | SUPERCAN Bully Sticks Pig Ear Slivers Thick Cut Piggy Ear Slices Pork Chews 15.9 oz/453 grams UPC: 7709417695092 | none | clean: best\_by\_date 2026-11-09 | unmatched |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/supercan-bulk-recalls-single-lot-pig-ear-slivers-pet-treats-due-salmonella-contamination: Supercan Bulk

- initiated 2025-04-02, classified ?, status ?
- pet food: **yes** (pet food term:pig ear)
- brands: none; linked: fda\_ires:96610
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/supercan-bulk-recalls-single-lot-pig-ear-slivers-pet-treats-due-salmonella-contamination)
- reason: Potential Foodborne Illness - Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Supercan Pig ear slivers | none | none | unmatched |

### fda\_ires 96687: Lea-Way Farms Inc. dba Blue Ridge Beef

- initiated 2025-04-11, classified 2025-05-01 (Class I), status Terminated
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-and-kitten-mix-due-salmonella
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2296687%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-and-kitten-mix-due-salmonella)
- reason: Possible contamination with Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0075-2025 | Blue Ridge Beef Kitten Mix For Cats Net Wt. 2 lbs \(.91 kg\) UPC: 8542980013436. Packaged in clear plastic chub bags, 15 packages per case. | blue-ridge-beef/kitten-mix \(line\) | clean: exact N26 0114 |  |
| V-0076-2025 | Blue Ridge Beef Puppy Mix For Dogs Net Wt. 2 lbs \(.91 kg\) UPC: 854298001696. Packaged in clear plastic chub bags, 15 packages per case. Fro… | blue-ridge-beef/puppy-mix \(line\) | clean: exact N25 1230 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-and-kitten-mix-due-salmonella: Blue Ridge Beef

- initiated 2025-04-11, classified ?, status ?
- pet food: **yes** (alias:blue-ridge-beef)
- brands: blue-ridge-beef; linked: fda\_ires:96687
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/blue-ridge-beef-issues-voluntary-recall-blue-ridge-beef-puppy-mix-and-kitten-mix-due-salmonella)
- reason: Salmonella &amp; Listeria contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Blue Ridge Beef Puppy Mix and Kitten Mix | blue-ridge-beef/puppy-mix \(line\), blue-ridge-beef/kitten-mix \(line\) | none |  |

### fda\_ires 97494: Viva Raw

- initiated 2025-08-25, classified 2025-10-01 (Class I), status Terminated
- pet food: **yes** (alias:viva-raw)
- brands: viva-raw; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-two-lots-dog-and-cat-foods-due-salmonella-and-listeria
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297494%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-two-lots-dog-and-cat-foods-due-salmonella-and-listeria)
- reason: Potential Salmonella contamination. Potential Listeria monocytogenes contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0001-2026 | Viva for Dogs Ground Chicken Complete Dog Food Net WT. 1 lb \(454g\) | viva-raw/dogs \(line\) | clean: exact 21975 |  |
| V-0002-2026 | Viva for Dogs Chunked Chicken Complete Dog Food Net Wt. 1 lb \(454g\) | viva-raw/dogs \(line\) | clean: exact 21975 |  |
| V-0003-2026 | Viva for Dogs Ground Beef Complete Dog Food Net Wt. 1 lb \(454g\) | viva-raw/dogs \(line\) | clean: exact 21495 |  |
| V-0004-2026 | Viva for Puppies Beef &amp; Turkey Complete Puppy Food Net Wt. 1 lb \(454g\) | viva-raw/puppies \(line\) | clean: exact 21495 |  |
| V-0005-2026 | Viva for Cats Chicken Complete Cat Food Net Wt. 1 lb \(454g\) | viva-raw/cats \(line\) | clean: exact 21975 |  |
| V-0006-2026 | Viva Pure Chicken Dog &amp; Cat Food Mixer Net Wt. 1 lb \(454g\) | viva-raw/pure \(line\) | clean: exact 21975 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-two-lots-dog-and-cat-foods-due-salmonella-and-listeria: Viva Raw LLC.

- initiated 2025-08-25, classified ?, status ?
- pet food: **yes** (alias:viva-raw)
- brands: viva-raw; linked: fda\_ires:97494
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/viva-raw-issues-voluntary-recall-two-lots-dog-and-cat-foods-due-salmonella-and-listeria)
- reason: Salmonella and Listeria monocytogenes contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Viva Ground Beef for Dogs and Ground Chicken for Dogs and Cats | viva-raw \(brand\) | none |  |

### fda\_ires 97658: Arrow Reliance Inc

- initiated 2025-09-19, classified 2025-10-28 (Class I), status Terminated
- pet food: **yes** (alias:darwins)
- brands: darwins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297658%22%7D%5D)
- reason: Potential Listeria monocytogenes and Salmonella contamination Potential Listeria monocytogenes contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0010-2026 | Darwin's Natural Pet Products BioLogics, All-Natural &amp; Grain-Free BEEF RECIPE FOR DOGS Nt Wt. 2lbs/907g. Packaged in polyethylene vacuum se… | darwins/biologics \(line\) | clean: exact 11895 |  |
| V-0011-2026 | Darwin's Natural Pet Products BioLogics, All-Natural &amp; Grain-Free BEEF RECIPE FOR DOGS Nt Wt. 2lbs/907g. Packaged in polyethylene vacuum se… | darwins/biologics \(line\) | clean: exact 11826 |  |

### fda\_ires 97743: Best Buy Bones Inc.

- initiated 2025-10-01, classified 2025-10-21 (Class I), status Terminated
- pet food: **yes** (alias:natures-own-pet-chews)
- brands: natures-own-pet-chews; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/best-buy-bones-inc-recalls-natures-own-pet-chews-bully-bites-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297743%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/best-buy-bones-inc-recalls-natures-own-pet-chews-bully-bites-because-possible-salmonella-health-risk)
- reason: Potential Salmonella Contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0008-2026 | Nature's Own Pet Chews Bully Bites 1 pound Net Wt. 16oz \(454g\) UPC: 739598900750. Packaged in resealable plastic bags, 12 bags per case. | natures-own-pet-chews/bully-bites \(line\) | clean: best\_by\_range 2027-09-01..2027-09-30; exact 19379; exact 19389; exact 19381 \+1 |  |

### fda\_ires 97762: Glacial Freeze Dry, LLC

- initiated 2025-10-03, classified 2025-11-04 (Class I), status Terminated
- pet food: **yes** (alias:raw-dog-barkery\+whats-in-the-bowl; alias:bellepepper-cats\+kanu-pet; alias:raw-dog-barkery)
- brands: bellepepper-cats, kanu-pet, raw-dog-barkery, whats-in-the-bowl; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/correction-foodynamics-recalls-raw-dog-barkery-bellepepper-cats-and-kanu-pets-brand-freeze-dried-pet
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297762%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/correction-foodynamics-recalls-raw-dog-barkery-bellepepper-cats-and-kanu-pets-brand-freeze-dried-pet)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0012-2026 | Chicken Hearts Whole Raw Dog Barkery Treats for Cats and Dogs Freeze-Dried Whole Chicken Hearts net weight 3 oz \(85 grams\), UPC: 797132 874… | raw-dog-barkery/freeze-dried \(line\), whats-in-the-bowl/freeze-dried \(line\) | clean: exact 030527 |  |
| V-0013-2026 | Chicken Hearts Sliced BellePepper Cats Freeze Dried Chicken Heart Slices Treats for Cats &amp; Dogs Net Wt. 3 oz \(83 grams\), UPC: 711709 141955… | bellepepper-cats/freeze-dried \(line\), kanu-pet/freeze-dried \(line\) | clean: exact 031627 |  |
| V-0014-2026 | Raw Dog Barkery Treats for Cats &amp; Dogs Freeze Dried Noah's Ark net weight 16oz \(453.6 grams\), UPC: 765855 249041, packaged in clear plastic… | raw-dog-barkery/freeze-dried \(line\) | clean: exact 100126 |  |
| V-0015-2026 | Raw Dog Barkery Treats for Cats &amp; Dogs Freeze Dried Uncle Clyde's Bucket of Chicken net weight 16oz \(453.6 grams\), UPC: 765855 249041, pack… | raw-dog-barkery/freeze-dried \(line\) | clean: exact 121426; exact 011526 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/best-buy-bones-inc-recalls-natures-own-pet-chews-bully-bites-because-possible-salmonella-health-risk: Best Buy Bones, Inc.

- initiated 2025-10-03, classified ?, status ?
- pet food: **yes** (alias:natures-own-pet-chews)
- brands: natures-own-pet-chews; linked: fda\_ires:97743
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/best-buy-bones-inc-recalls-natures-own-pet-chews-bully-bites-because-possible-salmonella-health-risk)
- reason: Potential Foodborne illness - Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Nature’s Own Pet Chews Bully Bites Treats | natures-own-pet-chews/bully-bites \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/correction-foodynamics-recalls-raw-dog-barkery-bellepepper-cats-and-kanu-pets-brand-freeze-dried-pet: Foodynamics

- initiated 2025-10-09, classified ?, status ?
- pet food: **yes** (pet food term:pet treats)
- brands: bellepepper-cats, kanu-pet, raw-dog-barkery; linked: fda\_ires:97762
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/correction-foodynamics-recalls-raw-dog-barkery-bellepepper-cats-and-kanu-pets-brand-freeze-dried-pet)
- reason: Potential Foodborne Illness – Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Foodynamics Freeze Dried Pet Treats | raw-dog-barkery/freeze-dried \(line\), bellepepper-cats/freeze-dried \(line\), kanu-pet/freeze-dried \(line\) | none |  |

### fda\_ires 97769: Raw Bistro, Inc.

- initiated 2025-10-10, classified 2025-10-22 (Class I), status Terminated
- pet food: **yes** (alias:raw-bistro)
- brands: raw-bistro; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/raw-bistro-pet-fare-voluntarily-recalls-frozen-beef-entree-because-possible-salmonella-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297769%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raw-bistro-pet-fare-voluntarily-recalls-frozen-beef-entree-because-possible-salmonella-health-risk)
- reason: Potential Salmonella contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0009-2026 | Raw Bistro Dog Fare Grass-Fed Beef Entree Net Wt. 3 lb \(1.36kg\) approx. 24 patties UPC 8 5883300224 7. Packaged in resealable pouches, 6 pe… | raw-bistro/dog-fare \(line\) | clean: best\_by\_date 2026-08-27; exact 239 |  |

### fda\_ires 97982: Fromm Family Foods, LLC

- initiated 2025-10-10, classified 2025-12-21 (Class I), status Terminated
- pet food: **yes** (alias:bonnihill-farms)
- brands: bonnihill-farms; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-bonnihill-beefibowls-food-dogs-due-potential-foreign-material
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2297982%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-bonnihill-beefibowls-food-dogs-due-potential-foreign-material)
- reason: Potential foreign material \(plastic\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0027-2026 | Bonnihill Farms Pet Foods BeefiBowls Beef Recipe Dog Food, Net Wt 16 oz \(454g\) UPC: 172705135004. Packaged in plastic retail chubs. 3, 16 o… | bonnihill-farms/beefibowls \(line\) | mixed: exact 12/25/2026B01; exact B01 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/raw-bistro-pet-fare-voluntarily-recalls-frozen-beef-entree-because-possible-salmonella-health-risk: Raw Bistro Pet Fare

- initiated 2025-10-10, classified ?, status ?
- pet food: **yes** (alias:raw-bistro)
- brands: raw-bistro; linked: fda\_ires:97769
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raw-bistro-pet-fare-voluntarily-recalls-frozen-beef-entree-because-possible-salmonella-health-risk)
- reason: Potential Foodborne Illness - Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Raw Bistro Frozen Beef Dog Food | raw-bistro \(brand\) | none |  |

### fda\_ires 98006: Ollie Pets Inc

- initiated 2025-11-14, classified 2025-12-11 (Class II), status Terminated
- pet food: **yes** (alias:ollie)
- brands: ollie
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298006%22%7D%5D)
- reason: Potential foreign material contamination \(metal\)
- review #248 unclassified (resolved): pet food undecided; firm: Ollie Pets Inc; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0025-2026 | Ollie Gently Baked Beef Dish with Sweet Potatoes Net Wt. 4 lb \(1.81kg\) UPC: 810115450375. Packaged in plastic bags. | ollie/baked \(line\) | clean: best\_by\_date 2026-12-11; exact 5202254 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-bonnihill-beefibowls-food-dogs-due-potential-foreign-material: Fromm Family Foods

- initiated 2025-12-03, classified ?, status ?
- pet food: **yes** (alias:bonnihill-farms)
- brands: bonnihill-farms; linked: fda\_ires:97982
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-bonnihill-beefibowls-food-dogs-due-potential-foreign-material)
- reason: Potential foreign plastic contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Bonnihill Farms BeefiBowls Beef Recipe gently cooked frozen dog food, 16 oz. chubs | bonnihill-farms/beefibowls \(line\) | none |  |

### fda\_ires 98221: Consumers Supply Distributing, LLC

- initiated 2025-12-24, classified 2026-01-20 (Class I), status Terminated
- pet food: **yes** (alias:country-vet\+heartland-harvest)
- brands: country-vet, heartland-harvest; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/consumers-supply-distributing-llc-recalls-country-vet-biscuits-dogs-due-possible-salmonella-health
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298221%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/consumers-supply-distributing-llc-recalls-country-vet-biscuits-dogs-due-possible-salmonella-health)
- reason: Potential contamination with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0030-2026 | 1\) Country Vet Biscuits Original Meaty Flavor with Chicken, Medium Size, Net Weight 4 LBS. \(1.81 KG.\) bag, UPC 899623000463, Manufactured b… | country-vet/biscuits \(line\), heartland-harvest/biscuits \(line\) | clean: best\_by\_date 2026-09-06 \[item 1\]; exact 40906513 \[item 1\]; best\_by\_date 2026-09-06 \[item 2\]; exact 40906513 \[item 2\] |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/consumers-supply-distributing-llc-recalls-country-vet-biscuits-dogs-due-possible-salmonella-health: Consumers Supply Distributing, LLC

- initiated 2025-12-24, classified ?, status ?
- pet food: **yes** (alias:country-vet\+heartland-harvest)
- brands: country-vet, heartland-harvest; linked: fda\_ires:98221
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/consumers-supply-distributing-llc-recalls-country-vet-biscuits-dogs-due-possible-salmonella-health)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Country Vet, Heartland Harvest Dog Biscuits | heartland-harvest/biscuits \(line\), country-vet/biscuits \(line\) | none |  |

### fda\_ires 98224: GOLD STAR DISTRIBUTION INC

- initiated 2025-12-26, classified 2026-01-14 (Class II), status Ongoing
- pet food: **yes** (pet food term:pet food)
- brands: none; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/gold-star-distribution-inc-issues-recall-certain-fda-regulated-products-three-states-including-drugs
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298224%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/gold-star-distribution-inc-issues-recall-certain-fda-regulated-products-three-states-including-drugs)
- reason: Potential exposure of rodents and rodent activity in the distribution center.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0029-2026 | Pet food and treats purchased from this distributor August 1 thru November 24, 2025. | none | needs\_review: retailer\_scope \(recalling firm\) \(needs\_review\) | unmatched, lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/gold-star-distribution-inc-issues-recall-certain-fda-regulated-products-three-states-including-drugs: Gold Star Distribution, Inc.

- initiated 2025-12-26, classified ?, status ?
- pet food: **yes** (pet food term:pet food)
- brands: none; linked: fda\_ires:98224
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/gold-star-distribution-inc-issues-recall-certain-fda-regulated-products-three-states-including-drugs)
- reason: Potential Salmonella contamination, presence of rodent and avian contamination and insanitary conditions during the storage process.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Multiple brand names All FDA-regulated products held at facility including drugs, medical devices, cosmetics, dietary supplements, human fo… | none | none | unmatched |

### fda\_ires 98343: Raaw Energy, LLC

- initiated 2026-01-26, classified 2026-04-09 (Class I), status Completed
- pet food: **yes** (species\+food:dog\+food)
- brands: none
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298343%22%7D%5D)
- reason: Product tested positive for positive for one or more types of pathogenic \(harmful\) bacteria, specifically: Listeria monocytogenes, Salmonella, Campylobacter je…

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0114-2026 | Dog Food - Chicken Medley 2-lb and 5-lb tubes, 10 per Case | none | needs\_review: production\_date 7.17.25 \[2 lb\] \(needs\_review\); production\_date 11.22.25 \[5 lb\] \(needs\_review\); production\_date 12.12.25 \[5 lb\] \(needs\_review\) | ambiguous, lot\_parse |
| V-0115-2026 | Dog Food - Salmon 5-lb tubes, 10 per Case | none | needs\_review: production\_date 12.5.25 \(needs\_review\); production\_date 12.12.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0116-2026 | Dog Food - Beef Chicken Medley 5-lb tubes, 10 per Case | none | needs\_review: production\_date 11/22//2025 \(needs\_review\); production\_date 12/12/2025 \(needs\_review\); production\_date 7/17/2025 \(needs\_review\) | ambiguous, lot\_parse |
| V-0117-2026 | Dog Food - Beef Turkey Medley 5-lb tubes | none | needs\_review: production\_date 12.18.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0118-2026 | Dog Food - Beef Chicken Tripe Medley 5-lb tubes | none | needs\_review: production\_date 12/23/2025 \(needs\_review\) | ambiguous, lot\_parse |

### fda\_ires 98446: Go Raw, LLC DBA Steve's Real Food

- initiated 2026-02-13, classified 2026-03-23 (Class I), status Terminated
- pet food: **yes** (alias:quest-cat-food)
- brands: quest-cat-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-issues-voluntary-recall-single-lot-quest-cat-food-chicken-recipe-freeze-dried-nuggets-due, fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-quest-diet-cat-food-products-due-low-thiamine-levels-and-enacts
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298446%22%7D%5D) · [notice 1](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-issues-voluntary-recall-single-lot-quest-cat-food-chicken-recipe-freeze-dried-nuggets-due) · [notice 2](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-quest-diet-cat-food-products-due-low-thiamine-levels-and-enacts)
- reason: Inadequate levels of thiamine for cats.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0108-2026 | Quest Cat Food Chicken Freeze Dried Nuggets - shelf stable 10 oz bag - UPC 6-9173018103-1 Distributed by Steves Real Food Aumsville OR 9708… | quest-cat-food/freeze-dried \(line\) | clean: best\_by\_date 2027-10-15; exact C25288 |  |
| V-0109-2026 | Quest Cat Food Chicken Recipe Frozen. Sold in beige, zip-lock, keep frozen refrigerate upon opening 2 lb bag - UPC 6-91730-17104-9. Distrib… | quest-cat-food/frozen \(line\) | clean: best\_by\_date 2027-06-16; best\_by\_date 2027-05-17; exact MCD25350; exact MCC25321 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-issues-voluntary-recall-single-lot-quest-cat-food-chicken-recipe-freeze-dried-nuggets-due: Go Raw LLC

- initiated 2026-02-17, classified ?, status ?
- pet food: **yes** (alias:quest-cat-food)
- brands: quest-cat-food; linked: fda\_ires:98446
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-issues-voluntary-recall-single-lot-quest-cat-food-chicken-recipe-freeze-dried-nuggets-due)
- reason: May contain low levels of thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Quest Quest Cat Food Chicken Recipe Freeze Dried Nuggets, 10oz bag | quest-cat-food/freeze-dried \(line\) | none |  |

### fda\_ires 98465: Pretty Bird International, Inc

- initiated 2026-02-18, classified 2026-04-09 (Class I), status Ongoing
- pet food: **yes** (alias:young-again)
- brands: young-again
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298465%22%7D%5D)
- reason: Dog food tested presumptive Salmonella positive.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0113-2026 | Young Again Pet Food, Core Health, Dog Food. For Breeds 30 lbs &amp; up. Medium - Large Dog &amp; Puppy Formula. Packaged in the following sized co… | young-again/core-health \(line\) | clean: best\_by\_date 2026-10-28 |  |

### fda\_ires 98474: elite treats LLC

- initiated 2026-02-19, classified 2026-03-19 (Class I), status Terminated
- pet food: **yes** (alias:elite-treats)
- brands: elite-treats; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/elite-treats-llc-recalls-single-lot-chicken-chips-due-salmonella-contamination
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298474%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/elite-treats-llc-recalls-single-lot-chicken-chips-due-salmonella-contamination)
- reason: Potential contamination with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0107-2026 | All Natural Chicken Chips for Dogs 100 % Real Whole Chicken Breast, Nt Wt. 6oz \(170g\), 6- 6oz \(170g\) bags per case. manufactured by: Elite … | elite-treats/chicken-chips \(line\) | clean: best\_by\_range 2027-04-01..2027-04-30; exact 24045 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/elite-treats-llc-recalls-single-lot-chicken-chips-due-salmonella-contamination: Elite Treats, LLC.

- initiated 2026-02-24, classified ?, status ?
- pet food: **yes** (alias:elite-treats)
- brands: elite-treats; linked: fda\_ires:98474
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/elite-treats-llc-recalls-single-lot-chicken-chips-due-salmonella-contamination)
- reason: May be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Elite Treats Chicken dog treats | elite-treats/chicken-chips \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-quest-diet-cat-food-products-due-low-thiamine-levels-and-enacts: Go Raw LLC.

- initiated 2026-02-26, classified ?, status ?
- pet food: **yes** (alias:quest-cat-food)
- brands: quest-cat-food; linked: fda\_ires:98446
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-quest-diet-cat-food-products-due-low-thiamine-levels-and-enacts)
- reason: May contain low levels of thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Quest Cat Food Chicken Recipe Frozen | quest-cat-food/frozen \(line\) | none |  |

### fda\_ires 98645: Farmina Pet Food USA LLC

- initiated 2026-03-25, classified 2026-04-09 (Class III), status Terminated
- pet food: **yes** (alias:farmina)
- brands: farmina
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298645%22%7D%5D)
- reason: Mislabeled Dog Food. The ingredient panel on the back list lamb while the front panel of the product list salmon.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0119-2026 | Farmina Pet Foods N&amp;D TROPICAL SELECTION salmon, spelt, oats and tropical fruits recipe Net Wt 22lb UPC 8 01027 60423 85. Dog Food. Ingredi… | farmina/nd-tropical-selection \(line\) | mixed: best\_by\_date 2027-03-17; exact 25260A3453; exact 273-03-01-02 \(needs\_review\) | lot\_parse |

### fda\_ires 98774: Revival Animal Health LLC

- initiated 2026-04-15, classified 2026-05-26 (Class I), status Completed
- pet food: **yes** (alias:breeders-edge; alias:shelters-choice)
- brands: breeders-edge, shelters-choice; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-milk-replacers-due-elevated-levels-vitamin-d
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298774%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-milk-replacers-due-elevated-levels-vitamin-d)
- reason: Milk Replacer may contain vitamin D levels higher or lower than labeled claim.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0125-2026 | Breeder's Edge Foster Care, Puppy Milk Replacer, Provides complete nutrition with digestive and immune support. Newborn Health. For use in … | breeders-edge/milk-replacer \(line\) | clean: best\_by\_date 2026-07-11 \[item 1\]; best\_by\_date 2026-08-15 \[item 1\]; best\_by\_date 2026-09-09 \[item 1\]; best\_by\_date 2027-04-03 \[item 1\] \+17 |  |
| V-0126-2026 | Shelter's Choice Milk Replacer, puppies. Provides complete nutrition and minimizes the potential for loose stools. Exclusively Marketed By:… | shelters-choice/milk-replacer \(line\) | clean: best\_by\_date 2026-06-19 \[item 1\]; best\_by\_date 2026-09-09 \[item 1\]; best\_by\_date 2027-01-16 \[item 1\]; best\_by\_date 2027-11-14 \[item 1\] \+8 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-milk-replacers-due-elevated-levels-vitamin-d: Revival Animal Health

- initiated 2026-04-17, classified ?, status ?
- pet food: **yes** (alias:breeders-edge\+shelters-choice)
- brands: breeders-edge, shelters-choice; linked: fda\_ires:98774
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-milk-replacers-due-elevated-levels-vitamin-d)
- reason: Variable levels of Vitamin D

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Breeder’s Edge, Shelter’s Choice Canine milk replacer | shelters-choice/milk-replacer \(line\), breeders-edge/milk-replacer \(line\) | none |  |

### fda\_ires 98912: Hoosier Processing LLC

- initiated 2026-05-01, classified 2026-06-12 (Class I), status Terminated
- pet food: **yes** (alias:albrights)
- brands: albrights; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-pet-food-announces-voluntary-recall-select-chicken-recipe-dogs-complete-and-balanced-1
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298912%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-pet-food-announces-voluntary-recall-select-chicken-recipe-dogs-complete-and-balanced-1)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0139-2026 | Albright's All Natural Raw Pet Food Chicken Recipe for Dogs Compete and Balanced Net Weight 1 LB \(456G\). Packaged in 1 lb pouches, 30 pouch… | albrights/raw \(line\) | clean: exact C001876-1; exact C001730 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/albrights-raw-pet-food-announces-voluntary-recall-select-chicken-recipe-dogs-complete-and-balanced-1: Albright’s Raw Pet Food

- initiated 2026-05-07, classified ?, status ?
- pet food: **yes** (alias:albrights)
- brands: albrights; linked: fda\_ires:98912
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/albrights-raw-pet-food-announces-voluntary-recall-select-chicken-recipe-dogs-complete-and-balanced-1)
- reason: Potential to be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Albright’s Chicken Recipe for Dogs | albrights/raw \(line\) | none |  |

### fda\_ires 98950: Allprovide Pet Foods LLC

- initiated 2026-05-11, classified 2026-05-27 (Class II), status Terminated
- pet food: **yes** (alias:allprovide)
- brands: allprovide
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298950%22%7D%5D)
- reason: Potential foreign material \(plastic\) contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0128-2026 | AllProvide Holistic Pet Food Gently Cooked Chicken Recipe For Dogs 16 oz UPC: 859125005809. Frozen product, packaged in a plastic vacuum se… | allprovide/gently-cooked \(line\) | clean: exact 048-01; exact 048-2; exact 048-3; exact 048-4 \+10 |  |

### fda\_ires 98983: Montgomery Meats

- initiated 2026-05-13, classified 2026-06-12 (Class I), status Terminated
- pet food: **yes** (alias:my-pet-carnivore; alias:the-butchers-hound)
- brands: my-pet-carnivore, the-butchers-hound
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2298983%22%7D%5D)
- reason: Potential Listeria monocytogenes contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0131-2026 | My Pet Carnivore Coarse Ground Whole Goat Net Wt. 2lbs \(907 grams\). Packaged in a plastic tub. Frozen product. Manufactured Mar 9 Apr 3, 20… | my-pet-carnivore/raw \(line\) | clean: range 20260330..20260403; range 20260309..20260313 |  |
| V-0132-2026 | My Pet Carnivore Coarse Ground Whole Mutton, Net Wt. 2lbs \(907 grams\). Packaged in a plastic tub. Frozen product. Manufactured Mar 16 Mar 2… | my-pet-carnivore/raw \(line\) | clean: range 20260316..20260320 |  |
| V-0133-2026 | My Pet Carnivore Coarse Ground Whole Lamb, Net Wt. 2lbs \(907 grams\). Packaged in a plastic tub. Frozen product. Manufactured Mar 23 Mar 27,… | my-pet-carnivore/raw \(line\) | clean: range 20260323..20260327 |  |
| V-0134-2026 | My Pet Carnivore Fine Ground Whole Mutton, Net Wt. 1lbs \(454 grams\). Packaged in a plastic tub. Frozen product. Manufactured Jan 22 27, 2026 | my-pet-carnivore/raw \(line\) | clean: range 20260122..20260127 |  |
| V-0135-2026 | The Butcher's Hound Ground Whole Pork, Net Wt. 3lbs \(1361 grams\). Packaged in a 3 lb chub. Frozen product. Manufactured Mar 30 Apr 3, 2026 | the-butchers-hound/raw \(line\) | clean: range 20260330..20260403 |  |
| V-0136-2026 | The Butcher's Hound Turkey B.A.R.F. Blend, 3 lb Net Wt. 3lbs \(1361 grams\). Packaged in a 3 lb chub. Frozen product. Manufactured Feb 16 20,… | the-butchers-hound/raw \(line\) | clean: range 20260216..20260220 |  |
| V-0137-2026 | The Butcher's Hound Ground Whole Chicken, 3 lb Net Wt. 3lbs \(1361 grams\). Packaged in a 3 lb chub. Frozen product. Manufactured Mar 2 Mar 6… | the-butchers-hound/raw \(line\) | clean: range 20260302..20260306 |  |
| V-0138-2026 | The Butcher's Hound Beef &amp; Turkey Blend, Net Wt. 5lbs \(2268 grams\). Packaged in a 5 lb chub. Frozen product. Manufactured Mar 2 Mar 27, 2026 | the-butchers-hound/raw \(line\) | clean: range 20260302..20260306; range 20260323..20260327 |  |

### fda\_ires 99033: Raaw Energy, LLC

- initiated 2026-05-19, classified 2026-07-10 (Class I), status Ongoing
- pet food: **yes** (firm brand:raaw-energy; species\+food:dogs\+lb)
- brands: none; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/raaw-energy-expands-recall-dog-food-because-listeria-monocytogenes-health-risk
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299033%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raaw-energy-expands-recall-dog-food-because-listeria-monocytogenes-health-risk)
- reason: Potential Listeria monocytogenes contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0142-2026 | 4411 \(Beef, Tripe, Duck Necks, and Chicken\) packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 … | none | needs\_review: production\_date 9.9.25 \(needs\_review\); production\_date 9.23.25 \(needs\_review\); production\_date 10.14.25 \(needs\_review\); production\_date 10.15.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0143-2026 | 60/30/10 Chicken Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing … | none | needs\_review: production\_date 7.29.25 \(needs\_review\); production\_date 8.6.25 \(needs\_review\); production\_date 8.7.25 \(needs\_review\); production\_date 10.9.25 \(needs\_review\) \+1 | ambiguous, lot\_parse |
| V-0144-2026 | 60/30/10 Turkey Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 20 lb boxes containin… | none | needs\_review: production\_date 7.24.25 \(needs\_review\); production\_date 7.29.25 \(needs\_review\) | lot\_parse, ambiguous |
| V-0145-2026 | 70/30 Beef Heart packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tu… | none | needs\_review: production\_date 8.19.25 \(needs\_review\); production\_date 8.20.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0146-2026 | American Bully packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tube… | none | needs\_review: production\_date 10.21.25 \(needs\_review\); production\_date 10.22.25 \(needs\_review\); production\_date 11.7.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0147-2026 | Beef and Chicken packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing 2-lb tu… | none | needs\_review: production\_date 7.30.25 \(needs\_review\); production\_date 8.8.25 \(needs\_review\); production\_date 8.12.25 \(needs\_review\); production\_date 8.13.25 \(needs\_review\) \+16 | ambiguous, lot\_parse |
| V-0148-2026 | Beef and Chicken Tripe Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes conta… | none | needs\_review: production\_date 7.30.25 \(needs\_review\); production\_date 7.31.25 \(needs\_review\); production\_date 8.5.25 \(needs\_review\); production\_date 8.6.25 \(needs\_review\) \+16 | ambiguous, lot\_parse |
| V-0149-2026 | Beef and Pork packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 20 lb boxes containing 2-lb tu… | none | needs\_review: production\_date 7.17.25 \(needs\_review\); production\_date 10.31.25 \(needs\_review\); production\_date 11.1.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0150-2026 | Beef and Salmon packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing 2-lb tub… | none | needs\_review: production\_date 7.18.25 \(needs\_review\); production\_date 7.26.25 \(needs\_review\); production\_date 8.1.25 \(needs\_review\); production\_date 8.13.25 \(needs\_review\) \+25 | ambiguous, lot\_parse |
| V-0151-2026 | Beef and Turkey Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing 2… | none | needs\_review: production\_date 12.17.25 \(needs\_review\); production\_date 12.19.25 \(needs\_review\); production\_date 7.24.25 \(needs\_review\); production\_date 7.25.25 \(needs\_review\) \+4 | ambiguous, lot\_parse |
| V-0152-2026 | Beef Liver and Kidney packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes and 10 lb boxes containing 2-lb tub… | none | needs\_review: production\_date 9.13.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0153-2026 | Beefturducken packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes… | none | needs\_review: production\_date 7.29.25 \(needs\_review\); production\_date 11.25.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0154-2026 | Chicken Hearts packaged in 2-lb tubes. Frozen. Product sold in 10 lb boxes containing 2-lb tubes. | none | needs\_review: production\_date 11.7.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0155-2026 | Chicken Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing 2-lb tube… | none | needs\_review: production\_date 7.23.25 \(needs\_review\); production\_date 7.24.25 \(needs\_review\); production\_date 8.5.25 \(needs\_review\); production\_date 8.7.25 \(needs\_review\) \+14 | ambiguous, lot\_parse |
| V-0156-2026 | Chips Agility packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes and 10 lb boxes containing 2-lb tubes. | none | needs\_review: production\_date 9.23.25 \(needs\_review\); production\_date 11.1.25 \(needs\_review\); production\_date 11.7.25 \(needs\_review\); production\_date 11.8.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0157-2026 | Chips Beef packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 10 lb boxes containing 2-lb tubes. | none | needs\_review: production\_date 7.22.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0158-2026 | Country Soul packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 9.4.25 \(needs\_review\); production\_date 9.5.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0159-2026 | Dog's Best Friend \(DBF\) packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing … | none | needs\_review: production\_date 7.29.25 \(needs\_review\); production\_date 9.3.25 \(needs\_review\); production\_date 11.13.25 \(needs\_review\); production\_date 11.14.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0160-2026 | Duck packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes, and 10 … | none | needs\_review: production\_date 9.11.25 \(needs\_review\); production\_date 9.12.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0161-2026 | Green Tripe packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 40 lb boxes containing 2-lb tubes, … | none | needs\_review: production\_date 10.17.25 \(needs\_review\); production\_date 10.18.25 \(needs\_review\); production\_date 11.1.25 \(needs\_review\); production\_date 11.5.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0162-2026 | Heart Chunks packaged in 2-lb tubes. Frozen. Product sold in 10 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 7.19.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0163-2026 | Heart Corazon packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes… | none | needs\_review: production\_date 8.9.25 \(needs\_review\); production\_date 10.14.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0164-2026 | Hybrid Beef and Chicken packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 10.17.25 \(needs\_review\) | lot\_parse, ambiguous |
| V-0165-2026 | Hybrid Dog's Best Friend packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 7.29.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0166-2026 | Italian packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes, and … | none | needs\_review: production\_date 8.7.25 \(needs\_review\); production\_date 8.8.25 \(needs\_review\); production\_date 10.14.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0167-2026 | Kidney and Liver packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes and 10 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 10.18.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0168-2026 | Lamb Beef and Chicken packaged in 5-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes | none | needs\_review: production\_date 12.2.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0169-2026 | Natural Remedies packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes and 10 lb boxes containing 2-lb tubes. | none | needs\_review: production\_date 9.4.25 \(needs\_review\); production\_date 9.9.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0170-2026 | Pork packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes, and 10 … | none | needs\_review: production\_date 8.1.25 \(needs\_review\); production\_date 10.14.25 \(needs\_review\); production\_date 11.1.25 \(needs\_review\); production\_date 12.13.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0171-2026 | R Chicken packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 20 lb boxes containing 2-lb tubes. | none | needs\_review: production\_date 11.5.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0172-2026 | R Chicken with Pork packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 20 lb boxes containing 2… | none | needs\_review: production\_date 11.4.25 \(needs\_review\); production\_date 12.10.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0173-2026 | Salmon packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes, and 1… | none | needs\_review: production\_date 7.23.25 \(needs\_review\); production\_date 7.31.25 \(needs\_review\); production\_date 8.8.25 \(needs\_review\); production\_date 9.10.25 \(needs\_review\) \+6 | ambiguous, lot\_parse |
| V-0174-2026 | Terrestrial packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 10 lb boxes containing 2-lb tubes | none | needs\_review: production\_date 10.7.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0175-2026 | Turkey Chicken packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 10 lb boxes containing 2-lb t… | none | needs\_review: production\_date 9.25.25 \(needs\_review\); production\_date 10.24.25 \(needs\_review\); production\_date 12.19.25 \(needs\_review\); production\_date 12.20.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0176-2026 | Turkey Medley packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes and 20 lb boxes containing 2-lb tu… | none | needs\_review: production\_date 9.24.25 \(needs\_review\); production\_date 9.25.25 \(needs\_review\); production\_date 9.26.25 \(needs\_review\); production\_date 10.23.25 \(needs\_review\) \+2 | ambiguous, lot\_parse |
| V-0177-2026 | White Meat Turkey Breast packaged in 2-lb tubes. Frozen. Product sold in 20 lb boxes containing 2-lb tubes and 10 lb boxes containing 2-lb … | none | needs\_review: production\_date 9.3.25 \(needs\_review\); production\_date 11.13.25 \(needs\_review\) | ambiguous, lot\_parse |
| V-0178-2026 | Whole Chicken packaged in 5-lb and 2-lb tubes. Frozen. Product sold in 50 lb boxes containing 5-lb tubes, 20 lb boxes containing 2-lb tubes… | none | needs\_review: production\_date 9.5.25 \(needs\_review\); production\_date 9.6.25 \(needs\_review\) | ambiguous, lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/raaw-energy-expands-recall-dog-food-because-listeria-monocytogenes-health-risk: Raaw Energy

- initiated 2026-05-22, classified ?, status ?
- pet food: **yes** (alias:raaw-energy)
- brands: raaw-energy; linked: fda\_ires:99033
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/raaw-energy-expands-recall-dog-food-because-listeria-monocytogenes-health-risk)
- reason: Due to possible Listeria contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Raaw Energy Dog Food | raaw-energy \(brand\) | none |  |

### fda\_ires 99206: Go Raw, LLC DBA Steve's Real Food

- initiated 2026-06-08, classified 2026-07-02 (Class I), status Terminated
- pet food: **yes** (alias:steves-real-food)
- brands: steves-real-food; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-include-one-lot-steves-real-food-freeze-dried-chicken-recipe-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299206%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-include-one-lot-steves-real-food-freeze-dried-chicken-recipe-due)
- reason: Inadequate levels of thiamine for cats.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0140-2026 | Steves Real Food Chicken Recipe Freeze Dried Net Wt 1.25 lbs \(20oz\) UPC: 6-91730-18103-1. Packaged in plastic bags, 6 bags per case. | steves-real-food/freeze-dried \(line\) | clean: exact C26022 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-include-one-lot-steves-real-food-freeze-dried-chicken-recipe-due: Go Raw, LLC.

- initiated 2026-06-08, classified ?, status ?
- pet food: **yes** (alias:steves-real-food)
- brands: steves-real-food; linked: fda\_ires:99206
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/go-raw-llc-expands-voluntary-recall-include-one-lot-steves-real-food-freeze-dried-chicken-recipe-due)
- reason: May contain low levels of thiamine \(Vitamin B1\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Steve’s Real Food Freeze Dried Chicken Recipe Cat and Dog Food | steves-real-food/freeze-dried \(line\) | none |  |

### fda\_ires 99258: Revival Animal Health LLC

- initiated 2026-06-11, classified 2026-07-21 (Class I), status Terminated
- pet food: **yes** (alias:breeders-edge)
- brands: breeders-edge; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-and-gm-milk-replacers-due-low-or-elevated
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299258%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-and-gm-milk-replacers-due-low-or-elevated)
- reason: Elevated Vitamin D levels

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0180-2026 | Breeder's Edge Foster Care GM Enriched Goat Milk Formula Net Contents 1 LB \(454 GRAM\) Powder Newborn Health UPC:817160010080, 12 packages p… | breeders-edge/milk-replacer \(line\) | clean: best\_by\_date 2028-01-08; best\_by\_date 2027-06-25 |  |

### fda\_ires 99212: Midwest Legacy Beef, L.L.C.

- initiated 2026-06-16, classified 2026-07-15 (Class I), status Terminated
- pet food: **yes** (alias:midwest-legacy)
- brands: midwest-legacy
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299212%22%7D%5D)
- reason: Potential contamination with Salmonella, Listeria monocytogenes, and E. coli O8:H19

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0179-2026 | Midwest Legacy Raw Beef Dog Food BLT &amp; Bones Net Weight 5 lb-2.26 kg UPC: 850039082429. Packaged in a Styrofoam cooler wrapped in a plastic… | midwest-legacy/raw-beef \(line\) | clean: exact A6062 |  |

### fda\_ires 99287: Doggone Raw, LLC

- initiated 2026-06-18, classified 2026-07-09 (Class I), status Terminated
- pet food: **yes** (alias:doggone-raw)
- brands: doggone-raw
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299287%22%7D%5D)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0141-2026 | Bosco's Blend Chicken Doggone Raw Net Weight 2 lbs and 10 lbs Frozen. Packaged in a white plastic tubs | doggone-raw/raw \(line\) | needs\_review: exact 4 24-27 \(needs\_review\) | lot\_parse |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-and-gm-milk-replacers-due-low-or-elevated: Revival Animal Health

- initiated 2026-06-25, classified ?, status ?
- pet food: **yes** (alias:breeders-edge\+shelters-choice)
- brands: breeders-edge, shelters-choice; linked: fda\_ires:99258
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-canine-and-gm-milk-replacers-due-low-or-elevated)
- reason: Variable levels of Vitamin D
- review #575 link_listing (resolved): several iRES events match: 98774, 99258 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Breeder’s Edge, Shelter’s Choice Canine milk replacer | shelters-choice/milk-replacer \(line\), breeders-edge/milk-replacer \(line\) | none |  |

### fda\_ires 99362: MARS PETCARE U.S. INC

- initiated 2026-07-02, classified 2026-07-21 (Class II), status Ongoing
- pet food: **yes** (alias:pedigree)
- brands: pedigree; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-two-lots-pedigreer-can-high-protein-chopped-chicken-duck-flavor-wet-dog-food-due
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299362%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-two-lots-pedigreer-can-high-protein-chopped-chicken-duck-flavor-wet-dog-food-due)
- reason: Potential fraudulent distribution of product which may contain foreign material \(plastic &amp; metal\)

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0182-2026 | Pedigree High Protein Chopped Ground Dinner Chicken &amp; Duck Flavor Net Wt. 375g \(13.2oz\) UPC:023100137230. Packaged in cans and sold as sing… | pedigree/high-protein \(line\), pedigree/chopped-ground-dinner \(line\) | clean: exact 613C3KKCFC; exact 613C1KKCFC |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-two-lots-pedigreer-can-high-protein-chopped-chicken-duck-flavor-wet-dog-food-due: Mars Petcare US, Inc.

- initiated 2026-07-02, classified ?, status ?
- pet food: **yes** (alias:pedigree)
- brands: pedigree; linked: fda\_ires:99362
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-two-lots-pedigreer-can-high-protein-chopped-chicken-duck-flavor-wet-dog-food-due)
- reason: Potential foreign plastic contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Pedigree High Protein Chopped Chicken &amp; Duck Flavor Wet Dog Food | pedigree/high-protein \(line\) | none |  |

### fda\_ires 99620: Raw Bistro, Inc.

- initiated 2026-08-10, classified 2026-08-26 (Class I), status Ongoing
- pet food: **yes** (alias:raw-bistro)
- brands: raw-bistro
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299620%22%7D%5D)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0187-2026 | Raw Bistro Dog Fare Free Range Turkey Entree Premium Raw Food For Dogs Net Wt. 18 lb \(8.16 kg\) bulk box \(36 8 oz patties\) Keep Frozen UPC: … | raw-bistro/dog-fare \(line\) | clean: best\_by\_date 2027-07-20; exact 201 |  |

### fda\_ires 99623: Miller Foods, Inc.

- initiated 2026-08-10, classified 2026-09-03 (Class I), status Ongoing
- pet food: **yes** (alias:omas-pride)
- brands: omas-pride; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/updated-omas-pride-voluntarily-recalls-one-lot-woof-complete-canine-chicken-recipe-6-lb-bag-because
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299623%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/updated-omas-pride-voluntarily-recalls-one-lot-woof-complete-canine-chicken-recipe-6-lb-bag-because)
- reason: Potential Salmonella contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0191-2026 | Oma's Pride Pet Food Woof Complete Canine Chicken Recipe Net Wt. 6 LB \(2.76 KG\) 12 individual 8 oz. portions. UPC: 8 7938400145 9. Frozen. … | omas-pride/woof-complete \(line\) | clean: best\_by\_date 2029-01-27 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/updated-omas-pride-voluntarily-recalls-one-lot-woof-complete-canine-chicken-recipe-6-lb-bag-because: Miller Foods, Inc.

- initiated 2026-08-17, classified ?, status ?
- pet food: **yes** (alias:omas-pride)
- brands: omas-pride; linked: fda\_ires:99623
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/updated-omas-pride-voluntarily-recalls-one-lot-woof-complete-canine-chicken-recipe-6-lb-bag-because)
- reason: Contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Oma’s Pride Canine Food | omas-pride/woof-complete \(line\) | none |  |

### fda\_ires 99910: GreenTripe.com,Inc.

- initiated 2026-08-19, classified 2026-10-05 (Class I), status Ongoing
- pet food: **yes** (alias:greentripe)
- brands: greentripe
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299910%22%7D%5D)
- reason: Product may be contaminated with Salmonella Product may be contaminated with Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0001-2027 | GreenTripe.com Frozen Dog Food Xkaliber Net Wt. 1 lbs \(453g\). Packaged in rolls, 36 rolls per case. GreenTripe.com Frozen Dog Food Xkaliber… | greentripe/frozen \(line\) | needs\_review: production\_date August 11, 2026 \(needs\_review\) | lot\_parse |
| V-0002-2027 | GreenTripe.com Frozen Dog Food Stuffed Cow Hoof Net Wt. 8 oz Packaged in bags, 30 bags per case. | greentripe/frozen \(line\), greentripe/chews \(line\) | needs\_review: production\_date July 9, 2026 \(needs\_review\); production\_date July 10, 2026 \(needs\_review\) | lot\_parse |

### fda\_ires 99714: A Place for Paws LLC

- initiated 2026-08-20, classified 2026-09-22 (Class I), status Terminated
- pet food: **yes** (alias:a-place-for-paws)
- brands: a-place-for-paws
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299714%22%7D%5D)
- reason: Product may be contaminated with Salmonella

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0197-2026 | Beef Lung Treats For Dogs A Place for Paws Nothing But... the Basic Treat Net Weight 5 oz. \(141.747g\). Packaged in plastic bags. | a-place-for-paws/nothing-but \(line\) | clean: exact 559 |  |

### fda\_ires 99719: Fromm Family Foods, LLC

- initiated 2026-08-21, classified 2026-09-03 (Class I), status Ongoing
- pet food: **yes** (alias:fromm)
- brands: fromm; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299719%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf)
- reason: Potential foreign material \(metal\) contamination.

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0192-2026 | Fromm Pate Turkey Pate Net Wt 12.2 oz.\(345 G\). Wet dog food packaged in cans, 12 cans per case. Individual can- item code: 11870, UPC: 0727… | fromm/pate \(line\) | mixed: best\_by\_range 2029-03-01..2029-03-31 \(needs\_review\); exact EP2A3306 551006 | lot\_parse |
| V-0193-2026 | Fromm Diner Classics Milo's Meatloaf Pate, Net Wt 12.5 oz.\(354G\). Wet dog food packaged in cans, 12 cans per case. Individual can- item cod… | fromm/diner-classics \(line\) | mixed: best\_by\_range 2029-03-01..2029-03-31 \(needs\_review\); exact EP2A3306 551029 | lot\_parse |

### fda\_ires 99743: Revival Animal Health LLC

- initiated 2026-08-21, classified 2026-09-24 (Class I), status Ongoing
- pet food: **yes** (alias:breeders-edge\+shelters-choice)
- brands: breeders-edge, shelters-choice; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-feline-milk-replacers-due-inconsistent-levels-vitamins
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299743%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-feline-milk-replacers-due-inconsistent-levels-vitamins)
- reason: Product may contain low levels of potassium, copper, folic acid, choline and/or pyridoxine \(vitamin B6\).

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0198-2026 | Breeder's Edge Foster Care Feline Milk Replacer 12 oz., UPC: 817160010196 Breeder's Edge Foster Care Feline Milk Replacer 18 lbs, UPC: 8171… | breeders-edge/milk-replacer \(line\), shelters-choice/milk-replacer \(line\) | clean: best\_by\_date 2026-09-09; best\_by\_date 2026-10-31; best\_by\_date 2027-04-16; best\_by\_date 2027-04-18 \+8 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf: Fromm Family Foods LLC

- initiated 2026-08-21, classified ?, status ?
- pet food: **yes** (alias:fromm)
- brands: fromm; linked: fda\_ires:99719
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/fromm-family-foods-voluntarily-recalls-turkey-pate-wet-food-dogs-and-diner-classic-milos-meatloaf)
- reason: Potential metal contamination

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Fromm Fromm wet canned dog food | fromm/pate \(line\), fromm/diner-classics \(line\) | none |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-feline-milk-replacers-due-inconsistent-levels-vitamins: Revival Animal Health

- initiated 2026-08-26, classified ?, status ?
- pet food: **yes** (alias:shelters-choice\+breeders-edge)
- brands: breeders-edge, shelters-choice; linked: fda\_ires:99743
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/revival-animal-health-llc-voluntarily-recalls-feline-milk-replacers-due-inconsistent-levels-vitamins)
- reason: Low levels of potassium, copper, folic acid, choline and/or pyridoxine \(vitamin B6\)
- review #395 unclassified (resolved): pet food undecided; firm: Revival Animal Health; no brand, species or exclusion term \| auto-resolved by matcher: condition no longer holds
- review #578 link_listing (resolved): several iRES events match: 99258, 99743 \| auto-resolved by matcher

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Shelter’s Choice, Breeder’s Edge Feline Milk Replacers | shelters-choice/milk-replacer \(line\), breeders-edge/milk-replacer \(line\) | none |  |

### fda\_ires 99786: Morasch Meats Inc

- initiated 2026-08-28, classified 2026-09-22 (Class I), status Completed
- pet food: **yes** (alias:northwest-naturals)
- brands: northwest-naturals; linked: fda\_listing:/safety/recalls-market-withdrawals-safety-alerts/northwest-naturals-voluntarily-recalls-two-raw-pet-food-products-because-possible-salmonella
- links: [enforcement report](https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getExportCSVResult&view=AdvancedSearch&page=product&criteria=%5B%7B%22centercd%22%3A%5B%22CVM%22%5D%7D%2C%7B%22recalleventid%22%3A%2299786%22%7D%5D) · [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/northwest-naturals-voluntarily-recalls-two-raw-pet-food-products-because-possible-salmonella)
- reason: Product may be contaminated with Salmonella Product may be contaminated with Salmonella and Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
| V-0195-2026 | Northwest Naturals Chicken Recipe Raw Diet for Cats, Complete and Balanced Topper for Dogs Raw Frozen Net Weight 2 lbs \(907.18 g\) UPC 08731… | northwest-naturals/raw-diet-cats \(line\) | clean: best\_by\_date 2028-01-26; exact B-5 |  |
| V-0196-2026 | Northwest Naturals Raw Diet for Dogs Chicken Recipe Raw Frozen Net Weight 6 lbs \(2.72 kg\) UPC: 087316380392. Packaged in plastic bags, 6 ba… | northwest-naturals/raw-diet-dogs \(line\) | clean: best\_by\_date 2028-01-25; exact B-19 |  |

### fda\_listing /safety/recalls-market-withdrawals-safety-alerts/northwest-naturals-voluntarily-recalls-two-raw-pet-food-products-because-possible-salmonella: Northwest Naturals

- initiated 2026-08-28, classified ?, status ?
- pet food: **yes** (alias:northwest-naturals)
- brands: northwest-naturals; linked: fda\_ires:99786
- links: [notice](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/northwest-naturals-voluntarily-recalls-two-raw-pet-food-products-because-possible-salmonella)
- reason: Potential contamination with Salmonella and/or Listeria monocytogenes

| # | product | match | lots | review |
| --- | --- | --- | --- | --- |
|  | Northwest Naturals Chicken Recipe | northwest-naturals \(brand\) | none |  |
