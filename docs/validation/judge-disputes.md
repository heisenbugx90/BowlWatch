# Judge findings: disputes and partial fixes

The independent judges reviewed the 2016-2026 validation run. Most findings were fixed,
in the catalog (`data/`, see `data/CURATION-LOG.md`) or in code. Each fix has a
regression test in `test/judge-regressions.test.ts`, `src/match/lots.test.ts`,
`src/lib/upc.test.ts` or `src/match/run.test.ts`. This file covers the findings where we
disagree, where we fixed only part of the finding, and where the call belongs to the
owner.

Event numbers are report ids, with the iRES event id or FDA listing in brackets.

## Where we disagree

### 18 (iRES 76151) V-0097: "8113179041 is missing from the UPCs"

The finding is wrong. The stored UPC list already contained `8113179041`, both before and
after the fix. The row's description is longer than the excerpt the report shows, and the
missing UPC is in the truncated part.

### 103 (iRES 80683) G & C Raw and 398 (iRES 92718) What The Raw: "emit a brand-level match from the firm"

These rows name no brand in their text: "Ground Lamb Dog Food packaged in clear plastic
containers", and "Single Dried Sardine ... No labeling on product". A core rule
(CLAUDE.md, `data/README.md` rule 1) is that a brand comes from the product text, never
from the recalling firm alone. A firm can be a co-packer, a distributor or a retailer, and
a Heads-up email that names the wrong company's brand is the kind of published claim
BowlWatch avoids. These rows stay `ambiguous`, with the firm's brand offered as a
suggestion that one review confirms. A UPC company prefix counts as independent evidence,
so it does give a brand-level match: Steve's (iRES 80983) and Redbarn (iRES 79164)
V-0039..41 now match that way.

### 749 (listing, Revival feline milk replacers): "make the milk-replacer exclusion match plurals so this is excluded"

Two other judges (iRES 98774 and 99743) flagged the same product family in the other
direction, and we agree with them. A puppy or kitten milk replacer is complete nutrition
for a dog or cat. The `milk replacer` exclusion now applies only when no dog or cat word is
present, so calf, lamb and kid replacers stay excluded. It also covers the plural. Listing
749 is pet food and links to iRES 99743 (Breeder's Edge, Shelter's Choice).

### 306 (iRES 88479): the suggested fix "take the last 10 digits"

The core the judge expected (`3725792262` ...) is right, and we adopted it. The general
rule is narrower than "take the last 10 digits", though. An 11-digit UPC printed as
`dddddd ddddd` (6+5) or `d ddddd ddddd` is a number-system digit plus the core, with no
check digit, so we drop the first digit. Printed as `ddddd ddddd d` or `ddddd dddddd`, it
is the core plus a check digit, so we drop the last digit.

### 255 (iRES 86569) V-0019 and 41 (iRES 77441) V-0244: what an 11-digit typo resolves to

For `70155505120` we adopted the judge's answer, `7015505120`. A single-digit typo is
repaired when exactly one deletion shares 8 or more leading digits with another UPC in the
same text (here `7015505119`). For V-0244, `21130420135` is printed as a UPC: "1 count
11'' bones packages, UPC 21130420135". It is not spurious. Its check digit is wrong, and
several deletions fit the sibling UPCs equally well, so it resolves to `2113042013`: the
Albertsons/Lucerne prefix 021130 with the leading 0 dropped, not the shifted
`1130420135`.

## Partly fixed

### 82 (iRES 79388) V-0086: the copy-pasted "Case Label: ... Kitten Grind; Lot # GA 1102"

The description lot `GA 1102` contradicts the Code Info lot `GA0131`, so it now needs
review and can no longer give a Stop. The judge offered "flag the line or the lot", and we
flagged the lot. The Kitten Grind line match stays, because telling a copy-paste error
from a real second product would need knowledge of the notice that the row does not
carry. A Kitten Grind owner gets a line-level Alert ("check lot and best-by"), not a Stop.

### 130 (iRES 81526) and other Sunshine Mills / Lidl codes such as "TD2 26 FEB 2019"

The judge suggested treating the date as a clean best-by when the firm is Sunshine Mills
or Lidl. The 2020 Sunshine records contradict that. Champ (iRES 86569) prints
"Lot: TC2 3/APRIL/2020 Best By: 03 April 2021": the date inside the code is the
production date, one year before the best-by. The parser now behaves as follows. The whole
code is always a clean exact lot, with the date's spacing kept as printed. The date is
also a best-by:

- clean when the text labels the code itself as a best-by ("Lot Code and Best By Date TA2
  20 Nov 2019", iRES 81654)
- absent when the field has its own best-by clause
- needs review otherwise

This adds `lot_parse` review items for the 2018-2020 Sunshine and Lidl rows that print no
best-by.

### 85961 (iRES 85961): "Product Number: 2363353227 belongs in upcs"

Product and catalog numbers are no longer read as lot codes, so the row is clean. They do
not go into `upcs`: Smucker's product number happens to equal the UPC core, but most
firms' item numbers do not. The brand now comes from the short alias "Ultra Premium",
corroborated by Smucker as Natural Balance's co-packer, and the iRES event links to
listing 667.

### 41 (iRES 77441): "the bare prefix A"

The one-character prefix `A` now needs review, and the expiration window is attached to
each prefix rule as a conjunction (see `LotRule` in `src/types.ts`). As a result, about 75
rows of that event are `mixed` rather than `clean`. This is intended: the other prefixes
(AH, AV, AI, AO, AB) still allow a Stop.

### 680 (listing, Bravo Packing 2021)

Not a finding, but related to the linker fix. The listing still opens a `link_listing`
review. The two candidate iRES events (87408, 87534) share brand, lines and timing, and
neither the line tie-break nor the same-day tie-break separates them.

## Decisions for the owner (first round, now settled)

The first round left cat grass, edible supplements and pet-food ingredients `unreviewed`. The
second round settled them as `no`, for consistency with the rules already in place (see the second
round below). The owner can reverse any of them in `src/match/classify.ts`.

# Second round

The second set of judges reviewed the regenerated report. Every finding was fixed in the catalog
(`data/`, see `data/CURATION-LOG.md`) or in code, with a regression test in
`test/judge-regressions-2.test.ts`, `src/match/lots.test.ts` ("second judge round"),
`src/lib/upc.test.ts`, `src/lib/normalize.test.ts`, `src/catalog/catalog.test.ts` or
`src/match/run.test.ts`. Below: where we disagree, where we fixed only part, and the policy calls.

## Where we disagree

### 304 (iRES 88355) V-0006: "the correct core is 7365700857; strip the leading 0"

The finding is right that `3657008575` was wrong, but neither the suggested value nor the
suggested rule holds. Stripping the leading 0 of `0736570085750` and reading the rest as a UPC-A is
exactly what produced `3657008575`. Reading `073657008575` instead fails the UPC-A check digit. Of
all single-digit deletions of the 13 digits, exactly one is a valid UPC-A: `073657008750`, core
`7365700875`, which also sits next to its sibling on the same row, `073657008736` (core
`7365700873`). The rule is now general: a 13-digit value that is not a valid EAN-13 resolves to the
single one-deletion that is a valid UPC-A. The same rule gives the judges' Kitten Mix answer for
473 / 487 (`8542980013436` -> `854298001436`, core `5429800143`).

### 131 (iRES 81543): "keep 8-digit UPC-E codes, expanded to UPC-A"

`20735302` cannot be a UPC-E: a UPC-E starts with number system 0 or 1. It is an EAN-8 (Lidl prints
EAN-8 on store-brand bags). It is now kept as printed, 8 digits, and user input is normalized the
same way, but it is not expanded.

### 23 (iRES 76403): "propagate a line from a UPC already resolved in another event"

We took the judges' first option, UPCs stored per line in the catalog (new line field `upcs`). We
did not take the second. Propagating from other events would make one event's match depend on the
order in which events are matched, and would spread any wrong match. A line UPC is a reviewed
catalog fact and shows up in the diff.

### 202 (iRES 83272) and 538 (iRES 98983): "add the missing product names as aliases"

We did not add `Blend`, `Tripe`, `Ground Whole` or `Frozen product` as aliases. They would also fire
on the brands' future non-raw products. We used the judges' other suggestion, in general form: when
a row matches a brand at brand level and says `Keep Frozen`, `Frozen` or `raw` (never next to
"freeze dried" or "dehydrated"), and the brand has exactly one raw line, that line is used. This
is the same mechanism that already maps `canned` to a brand's only wet line.

### 318 (iRES 88842): "prefer the more specific line when two lines match"

We fixed the cause (the bare line name "Grain Free" no longer counts), but not this general rule.
Rows that legitimately name two lines of one brand are common (variety packs, iRES 79291
V-0069/70), so "keep only the more specific" would drop real matches.

## Partly fixed

### 281 (iRES 87625): brands named alone in a brand list

When a brand is named alone as an item of a brand list ("... Pro Pac, Pro Pac Ultimates, ..."),
the row now carries a brand-level match next to the line matches. Its detail starts with
`brand-wide (named alone in a brand list)`. Today a brand-level match means a Heads-up
(CLAUDE.md). Whether a brand-wide match should instead be worded as an Alert for every line of the
brand is decided in the email step (build step 4). The data now carries the distinction it needs.
We did not expand the match to one line match per catalog line, because a line added to the
catalog later would be missing from old recalls.

"Multiple codes" is now an `all_lots` rule that needs review.

### 680 / 678 (listings, Bravo Packing 2021)

Brands and lines follow the judges' model: a Bravo Packing house brand with ground beef, green
tripe and bones lines, and Performance Dog with its patties line. Both listings still open a
`link_listing` review. The two iRES events (87408, 87534) are 17 days apart, share firm and
brands, and the listings fall between them, so neither the line tie-break nor the date tie-break
can choose.

### 10 (iRES 75919) V-0089 "Turkey with bone"

The UPC prefix 854298 now gives the Blue Ridge Beef brand match. There is no line: "Turkey with
bone" is not a curated Blue Ridge line. "Mfg. Date: 1276" is not a date, so it goes to the review
notes as unread text instead of an empty rule.

### 519 (iRES 98343): the original Raaw Energy listing

As the judge suspected, the original listing is not in the listing window, so there is nothing to
link. The production dates are now `production_date` rules with ISO dates, needing review.

### 260 (iRES 86729)

Case codes are exact rules scoped to `case`, and the bag ranges are `range` rules (needs review).
One range in item 3 prints `BEF-A-08` for `BEEF-A-08` on one side. It is not guessed: it goes to the
review notes as unread text.

## Policy calls (classification)

- **Supplements are not dog or cat food.** "probiotics", "multivitamin", "supplements" or
  "hip & joint", with no food noun (food, treat, kibble, diet, dinner, meal, entree, recipe),
  is `no` whatever the species. This settles ZP soft chews (iRES 96442), Ozona probiotics (iRES
  92716, listing 698) and Fi supplements (listing 751, read from the notice title). It matches the
  existing exclusions: Phycox joint supplement, BioLifePet probiotics, omega-3 soft gels. "Dog food
  with probiotics" stays food. We did not add a Zesty Paws brand: with supplements out of scope it
  would never be used.
- **Cat grass is not food** (iRES 91393). The ground truth in `src/match/evaluate.ts` already said
  so.
- **Bulk ingredients are not consumer pet food** when no dog or cat word and no catalog brand is
  present: diatomaceous earth, gypsum / terra alba, canola meal, by-product meal, flax, and
  packaging in totes, IBC, hopper trailers, pneumatic tanks or tight heads. A picking stone is food
  for birds or livestock.
- **Upstream ingredients stay visible.** An excluded premix or ingredient that names dogs, cats,
  canine, feline or canned / pet food (the DSM "2217 Canned Canine PMX", iRES 82087) opens an
  `upstream_ingredient` review item. It is never matched to users.
- **A potency failure is a drug problem.** A Reason for Recall that says "sub-potent" or "super
  potent" makes an otherwise undecided event `no` (MediGel FBZ, iRES 78807; fenbendazole, FBZ and
  MediGel are also drug terms now).

## Side effects worth knowing

- A best-by date before the recall started now needs review (75402, 90584). In What The Raw (iRES
  92718) three of five printed expiration dates are earlier than the recall start, so those three
  need review too. The lots of that row are unaffected.
- Listing links are now recomputed on every run, not only for unlinked items. There is no manual
  link workflow yet; when one exists, manual links must be exempt from recomputation.
- The listing date of older notices is often a later edit date (14 items of the 2017-2021 file
  are dated 2018-02-08). That is why the linker has a wide window for strong fingerprints: the same
  firm, every listing brand present in the iRES event, and either two or more brands or a
  follow-up notice. With it, listings 561 / 564 link to iRES 76151, the actual 9Lives / EverPet /
  Special Kitty thiamine recall (not "unlinked", as the judges proposed). 608 links to 77476 (the
  Loving Pets event itself) and 609 to 77441 (United Pet Group recalls under its parent Spectrum
  Brands).
