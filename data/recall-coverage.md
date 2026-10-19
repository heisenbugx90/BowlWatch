# FDA CVM recall coverage (events 2016-10 to 2026-10)

Every event in `test/fixtures/pet_food_rows_window.json` (552 rows, 134 events) mapped to the brand ids in
`data/brands/` that its rows name. Brand ids are file names without `.yaml`. `-` means no brand applies
(not dog/cat food, or a retailer/distributor-wide recall); the reason is in Notes.

Written by the recall-derived catalog curator on 2026-10-18. Brand comes from Product Description, never from
the recalling firm alone; co-packers are in `data/manufacturers.yaml`.

| Event ID | Classified | Recalling firm | Brand ids | Notes |
| --- | --- | --- | --- | --- |
| 75457 | 12/21/2016 | Arrow Reliance Inc | darwins |  |
| 75919 | 04/17/2017 | blue ridge beef | blue-ridge-beef |  |
| 76385 | 08/03/2017 | Evanger's Dog & Cat Food Co | evangers |  |
| 76403 | 05/19/2017 | Simmons Foods Inc | wellness, companion-ahold, home-360-pet, triumph, sprout, 4health, doctors-foster-and-smith, always-save, cat-cuisine, grreat-choice, blue-buffalo | Co-packer Simmons Foods (manufacturers.yaml: simmons-foods). |
| 76616 | 05/19/2017 | WellPet, LLC | wellness |  |
| 76706 | 04/17/2017 | Blue Buffalo Company Ltd | blue-buffalo |  |
| 76755 | 04/17/2017 | Wellpet Llc | wellness |  |
| 77207 | 08/03/2017 | Smallbatch Pets, Inc. | smallbatch |  |
| 77441 | 07/11/2017 | Spectrum Brands Inc | good-n-fun, good-n-fit, healthy-hide, digest-eeze, american-beefhide, companion-ahold, dentleys, exer-hides, essential-everyday, good-lovin, petco-brand, hill-country-fare, priority-albertsons, yourpet, pet-pride, luvsome, enzadent | United Pet Group (Spectrum Brands) rawhide chews incl. retailer store brands. |
| 78090 | 02/26/2018 | Arrow Reliance, Inc | darwins |  |
| 78676 | 03/15/2018 | Arrow Reliance Inc | darwins |  |
| 79164 | 11/01/2018 | Redbarn Pet Products | dentleys, good-lovin, petco-brand, redbarn, chewy-louie | Redbarn bully sticks incl. retailer store brands. |
| 79173 | 06/29/2018 | Smokehouse Pet Products | smokehouse |  |
| 79188 | 03/15/2018 | Arrow Reliance Inc | darwins |  |
| 79291 | 03/14/2018 | The J.M. Smucker Company, Inc. | gravy-train, kibbles-n-bits, skippy-dog-food, ol-roy |  |
| 79323 | 11/01/2018 | Northwest Naturals Inc | northwest-naturals |  |
| 79388 | 04/11/2018 | Environmental Trade INC | blue-ridge-beef | Recalling firm Environmental Trade Inc (manufacturers.yaml: environmental-trade). |
| 79414 | 10/23/2018 | STEVE'S REAL FOOD FOR PETS | steves-real-food |  |
| 79434 | 05/02/2018 | Raw Basics, LLC | tuckers |  |
| 79586 | 05/02/2018 | Radagast Pet Food, Inc. | rad-cat |  |
| 79596 | 05/02/2018 | The J.M. Smucker Company, Inc. | milos-kitchen |  |
| 79623 | 06/05/2018 | Arrow Reliance Inc | darwins |  |
| 79827 | 07/26/2018 | TRUPET, LLC | trudog |  |
| 79897 | 06/28/2018 | Carnivore Meat Company, LLC | vital-essentials |  |
| 79913 | 08/29/2018 | OC Raw Dog, LLC | oc-raw-dog |  |
| 79914 | 07/26/2018 | OC Raw Dog, LLC | oc-raw-dog |  |
| 80013 | 11/01/2018 | TRUPET, LLC | trudog |  |
| 80273 | 02/22/2019 | Dave'S Soda And Pet City | daves-pet-food |  |
| 80455 | 08/10/2018 | Radagast Pet Food Inc. | rad-cat |  |
| 80683 | 12/20/2018 | G & C Raw, LLC | g-and-c-raw | Brand evidence mostly in firm name (G & C Raw). |
| 80859 | 10/22/2018 | Radagast Pet Food Inc | rad-cat |  |
| 80942 | 11/01/2018 | Bravo Packing, Inc. | performance-dog |  |
| 80983 | 10/22/2018 | STEVE'S REAL FOOD FOR PETS | steves-real-food, quest-cat-food |  |
| 81499 | 02/14/2019 | Whitebridge Pet Brands Llc | natural-life, nutrisca |  |
| 81543 | 10/05/2019 | Lidl US TRADING | orlando | Made by Sunshine Mills (not named in the notice). |
| 81617 | 04/03/2019 | SUNSHINE MILLS INC | evolve, sportsmans-pride, triumph |  |
| 81654 | 10/05/2019 | Anf Pet Inc | anf |  |
| 81713 | 10/05/2019 | Columbia River Natural Pet Foods Inc | columbia-river |  |
| 81822 | 06/26/2019 | SUNSHINE MILLS INC | old-glory |  |
| 82018 | 10/05/2019 | Hill's Pet Nutrition Inc | hills |  |
| 82087 | 10/05/2019 | DSM Nutritional Products, Inc. | - | Vitamin premix sold to manufacturers (DSM), not a consumer dog/cat product; no brand. |
| 82268 | 05/02/2019 | Arrow Reliance Inc dba Darwin's Natural Pet Products | darwins |  |
| 82482 | 07/22/2019 | Nestle Purina PetCare Co | muse |  |
| 82895 | 01/23/2020 | G & C Raw, LLC | g-and-c-raw |  |
| 83261 | 10/05/2019 | Pet Supplies Plus | - | Unbranded bulk pig ears from Pet Supplies Plus self-serve bins; retailer-scope, no brand. |
| 83272 | 01/23/2020 | Texas Tripe | texas-tripe |  |
| 83405 | 01/23/2020 | Boesl Packing Company, Inc. | k9-kraving |  |
| 83458 | 01/23/2020 | Raw Advantage | raw-advantage | Brand evidence only in firm name (Raw Advantage). |
| 83630 | 11/08/2019 | Brutus and Barnaby, LLC | brutus-and-barnaby |  |
| 83683 | 01/23/2020 | Bravo Packing, Inc. | performance-dog |  |
| 83713 | 01/23/2020 | Woody's Pet Food Deli | woodys-pet-food-deli |  |
| 83755 | 11/12/2019 | Big Dan's Trucking Inc. | big-dans |  |
| 84267 | 01/23/2020 | Go Raw, LLC DBA Steve's Real Food | quest-cat-food |  |
| 84354 | 12/19/2019 | Washington Homeopathic Products, Inc. | - | HomeoPet homeopathic remedies (drug), not food. |
| 86321 | 09/14/2020 | SUNSHINE MILLS INC | natures-menu |  |
| 86357 | 09/23/2020 | SUNSHINE MILLS INC | heartland-farms, family-pet, paws-happy-life |  |
| 86569 | 10/21/2020 | SUNSHINE MILLS INC | sportsmans-pride, old-glory, paws-happy-life, champ, field-trial, good-dog, hunters-special, pet-expert, principle, river-bend, thrifty, top-runner, whiskers-and-tails, sprout, retriever-tsc |  |
| 86729 | 11/23/2020 | Cargill Meat Solutions Corp | - | Unbranded "Frozen Food for Dogs Beef" made by Cargill Meat Solutions (manufacturers.yaml: cargill); customer brand not named. Review queue. |
| 86747 | 12/02/2020 | ALBRIGHTS RAW DOG FOOD | albrights |  |
| 86870 | 12/17/2020 | Petsmart Inc | authority |  |
| 87068 | 02/08/2021 | Midwestern Pet Foods Chickasha Operation | sportmix, pro-pac, nunn-better, sportstrail | Also lists Splash Fat Cat fish food (not dog/cat; no brand file). |
| 87408 | 03/19/2021 | Bravo Packing, Inc. | performance-dog |  |
| 87534 | 04/29/2021 | Bravo Packing, Inc. | performance-dog |  |
| 87553 | 04/06/2021 | Cargill, Inc Corporate Headquarters | ranch-hound | Made by Cargill (manufacturers.yaml: cargill). |
| 87625 | 04/20/2021 | MIdwestern Pet Foods Inc. | sportmix, pro-pac, sportstrail, earthborn-holistic, canine-x, meridian | Earthborn Holistic lines unrefined and venture (earthborn-holistic.yaml) are named as brands in the notice. |
| 87691 | 04/27/2021 | The J.M. Smucker Company, Inc. | meow-mix |  |
| 87892 | 06/11/2021 | Tejas Industries - Amarillo Distribution | zukes | Co-packer Tejas Industries (manufacturers.yaml: tejas-industries). |
| 87979 | 06/07/2021 | Natural Balance Pet Foods, Inc. | natural-balance |  |
| 88031 | 06/21/2021 | Sunshine Mills, Inc. | sportsmans-pride, frm-gold-select, intimidator, sprout |  |
| 88063 | 06/24/2021 | True Pet Food Project, Inc dba Smalls | smalls |  |
| 88102 | 07/01/2021 | Freshpet Inc. | freshpet |  |
| 88248 | 02/11/2022 | NomNomNow Inc. | nom-nom |  |
| 88544 | 02/08/2022 | Top Quality Dog Food, LLC | top-quality-dog-food |  |
| 88786 | 11/26/2021 | Fromm Family Foods, LLC | fromm |  |
| 88842 | 11/05/2021 | Tuffy's Pet Foods, Inc. | nutrisource |  |
| 89217 | 01/11/2022 | Pet Brands Products LLC | pure-being |  |
| 89302 | 01/13/2022 | Agila Corporation | woodys-pet-food-deli |  |
| 89627 | 04/05/2022 | Dollar Tree Distribution, Inc. | - | Family Dollar store-wide recall (AL, AR, LA, MS, MO, TN; Jan 2021 onwards); retailer-scope, no brand. |
| 90570 | 08/23/2022 | Primal Pet Foods Inc. | primal |  |
| 90584 | 08/23/2022 | Stormberg Foods LLC | beg-and-barker, green-coast-pet | Co-packer Stormberg Foods (manufacturers.yaml: stormberg-foods). |
| 90832 | 10/14/2022 | BREUER PREMIUM PET FOOD CO, INC | spot-and-tango |  |
| 91233 | 12/19/2022 | Nestle Purina PetCare Co | purina-pro-plan, purina-pro-plan-veterinary-diets |  |
| 91342 | 01/08/2023 | Texas Farm Products Company dba TFP Nutrition | heb-texas-pets | Made by TFP Nutrition (manufacturers.yaml: tfp-nutrition). |
| 91393 | 01/08/2023 | Wegmans Food Markets, Inc. | - | Wegmans Organic Farm & Orchard Cat Grass (plant), not dog/cat food. |
| 91551 | 02/06/2023 | Royal Canin USA Inc | royal-canin |  |
| 91662 | 03/10/2023 | Nestle Purina PetCare Co | purina-pro-plan, purina-pro-plan-veterinary-diets |  |
| 91877 | 05/08/2023 | Stratford Care USA, Inc. | - | Omega-3 soft gels (supplement), not food. |
| 91881 | 04/18/2023 | Nestle Purina PetCare Co | purina-pro-plan, purina-pro-plan-veterinary-diets |  |
| 92422 | 06/12/2023 | Cargill, Inc Corporate Headquarters | best-choice | Made by Cargill (manufacturers.yaml: cargill). |
| 92990 | 09/28/2023 | Mid America Pet Food LLC | victor |  |
| 93284 | 11/21/2023 | Texas Farm Products Company dba TFP Nutrition | retriever-tsc | Made by TFP Nutrition (manufacturers.yaml: tfp-nutrition). |
| 93324 | 11/24/2023 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 93333 | 01/30/2024 | Mid America Pet Food LLC | victor |  |
| 93445 | 01/23/2024 | Texas Farm Products Company dba TFP Nutrition | hill-country-fare, retriever-tsc, members-mark, heb-texas-pets, exclusive, country-acres, lone-star-tfp, star-pro, economax, feline-medley | Made by TFP Nutrition (manufacturers.yaml: tfp-nutrition). Also lists Lone Star Floating Catfish Food (not dog/cat). |
| 93641 | 01/23/2024 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 93862 | 02/26/2024 | Viva Raw | viva-raw |  |
| 94362 | 07/02/2024 | Viva Raw | viva-raw |  |
| 94657 | 06/21/2024 | MARS PETCARE U.S INC | pedigree |  |
| 95076 | 08/15/2024 | Predator Pet, Inc. | savage-cat |  |
| 95340 | 10/21/2024 | Lystn LLC | answers |  |
| 95555 | 11/20/2024 | Carolina Prime Pet, Inc. | hollywood-feed | Made by Carolina Prime Pet (manufacturers.yaml: carolina-prime-pet). |
| 95771 | 12/13/2024 | Ceva Animal Health, LLC | - | Douxo Calm Serum (Ceva, topical), not food. |
| 95833 | 12/11/2024 | Carolina Prime Pet, Inc. | hollywood-feed | Made by Carolina Prime Pet (manufacturers.yaml: carolina-prime-pet). |
| 95879 | 12/19/2024 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 96016 | 01/26/2025 | Smallbatch Pets LLC | smallbatch |  |
| 96096 | 02/12/2025 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 96213 | 02/19/2025 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 96410 | 04/24/2025 | Wild Coast LLC | wild-coast-raw |  |
| 96498 | 04/21/2025 | Ceva Animal Health, LLC | - | Douxo Calm Serum (Ceva, topical), not food. |
| 96509 | 05/06/2025 | PREDATOR PET INC DBA SAVAGE PET | savage-cat |  |
| 96687 | 05/01/2025 | Lea-Way Farms Inc. dba Blue Ridge Beef | blue-ridge-beef |  |
| 97494 | 10/01/2025 | Viva Raw | viva-raw |  |
| 97658 | 10/28/2025 | Arrow Reliance Inc | darwins |  |
| 97762 | 11/04/2025 | Glacial Freeze Dry, LLC | raw-dog-barkery, bellepepper-cats, kanu-pet, whats-in-the-bowl | Co-packer Glacial Freeze Dry (manufacturers.yaml: glacial-freeze-dry). |
| 97769 | 10/22/2025 | Raw Bistro, Inc. | raw-bistro |  |
| 97982 | 12/21/2025 | Fromm Family Foods, LLC | bonnihill-farms |  |
| 98221 | 01/20/2026 | Consumers Supply Distributing, LLC | heartland-harvest, country-vet | Heartland Harvest made by Consumers Supply Distributing for Mid-States Distributing. |
| 98224 | 01/14/2026 | GOLD STAR DISTRIBUTION INC | - | Gold Star Distribution distributor-wide recall (Aug 1 - Nov 24, 2025); distributor-scope, no brand. |
| 98309 | 02/19/2026 | Stratford Care USA, Inc. | - | Curaseb antiseptic pads, not food. |
| 98343 | 04/09/2026 | Raaw Energy, LLC | raaw-energy | Brand evidence only in firm name (Raaw Energy). |
| 98446 | 03/23/2026 | Go Raw, LLC DBA Steve's Real Food | quest-cat-food |  |
| 98465 | 04/09/2026 | Pretty Bird International, Inc | young-again |  |
| 98474 | 03/19/2026 | elite treats LLC | elite-treats |  |
| 98645 | 04/09/2026 | Farmina Pet Food USA LLC | farmina |  |
| 98912 | 06/12/2026 | Hoosier Processing LLC | albrights | Recalling firm Hoosier Processing LLC (manufacturers.yaml: hoosier-processing). |
| 98950 | 05/27/2026 | Allprovide Pet Foods LLC | allprovide |  |
| 99033 | 07/10/2026 | Raaw Energy, LLC | raaw-energy | Brand evidence only in firm name (Raaw Energy). |
| 99212 | 07/15/2026 | Midwest Legacy Beef, L.L.C. | midwest-legacy |  |
| 99620 | 08/26/2026 | Raw Bistro, Inc. | raw-bistro |  |
| 99623 | 09/03/2026 | Miller Foods, Inc. | omas-pride |  |
| 99714 | 09/22/2026 | A Place for Paws LLC | a-place-for-paws |  |
| 99719 | 09/03/2026 | Fromm Family Foods, LLC | fromm |  |
| 99786 | 09/22/2026 | Morasch Meats Inc | northwest-naturals | Recalling firm Morasch Meats is the owner of Northwest Naturals. |
| 99910 | 10/05/2026 | GreenTripe.com,Inc. | greentripe |  |

Totals: 134 events; 123 mapped to at least one brand; 11 with no brand (see Notes).
