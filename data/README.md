# Normalization table

The curated map from recall-notice text and user input to clean entities:
parent company → brand → product line. Loaded by `src/catalog/load.ts`,
validated by `npm run validate:data`, written to the database by `npm run seed`.

## Files

- `parents/<id>.yaml` — one parent company per file.
- `brands/<id>.yaml` — one brand per file, with its product lines.
- `manufacturers.yaml` — co-packers / contract manufacturers.

The file name must equal the `id`. Ids are lowercase slugs (`blue-buffalo`).
Line ids are local to the brand; in the database a line is `<brand>/<line>`
(`hills/science-diet`). Never rename an id that has shipped: matches reference it.

## Parent

```yaml
id: general-mills
name: General Mills, Inc.
aliases: [...]          # optional; other legal names (default kind: firm)
sources: [https://...]  # required: evidence of ownership
notes: ...              # optional
```

## Brand

```yaml
id: blue-buffalo
name: Blue Buffalo              # also an alias (kind: name)
parent: general-mills           # must exist in parents/
markets: [US, CA]
aliases:                        # each identifies the brand ON ITS OWN
  - Blue Buffalo Pet Products   # bare string = kind: name
  - { text: "...", kind: dba }  # kinds: name | dba | label | short
  - { text: Meridian, kind: short }  # short: counts only when the recalling firm corroborates
firm_names:                     # legal recalling-firm names of the brand owner
  - Blue Buffalo Company Ltd
manufacturers: [simmons-foods]  # co-packer ids from manufacturers.yaml (optional)
upc_prefixes: ["785184"]        # GS1 company prefixes of the owner's UPCs (optional)
sources: [https://...]          # required
lines:
  - id: wilderness
    name: Wilderness            # context-only alias: counts once the brand is established
    aliases:
      - { text: "BLUE Wilderness", kind: label }   # label = identifies brand + line on its own
      - { text: "Natural Selections", kind: short } # short = brand + line, with firm corroboration
    species: [dog, cat]         # dog | cat
    formats: [dry, wet, treat]  # dry | wet | raw | freeze-dried | treat | topper | other
    discontinued: false         # optional
    upcs: ["076344088226"]      # optional: known product UPCs as printed (12-digit UPC-A, EAN-13 or EAN-8)
```

## Manufacturers

```yaml
manufacturers:
  - id: simmons-foods
    name: Simmons Foods
    firm_names: [Simmons Foods Inc]
    sources: [https://...]      # or `evidence:` free text when no URL exists
```

## Curation rules

1. **Brand comes from the product text, never from the recalling firm alone.**
   Firm names are supporting evidence. Co-packers go in `manufacturers.yaml`,
   never in a brand's `aliases` or `firm_names`.
2. **No ambiguous standalone aliases.** A brand alias or a line `label` alias
   must not collide with any other brand after normalization (the loader
   rejects it). Example: Blue Buffalo has no bare `BLUE` alias because it would
   match Blue Ridge Beef; it uses `BLUE Wilderness`, `BLUE Basics`, etc.
3. **Line names are context-only.** "Wilderness" or "Basics" alone could be
   anyone's. They only match once the brand is established in the same notice.
   Add a `label` alias for text that names brand + line together.
4. **Firm names** may repeat across brands only when the brands share a parent
   (e.g. one legal entity for several Purina brands).
5. **Cite sources.** Every parent and brand needs at least one URL. Prefer the
   company's own site, a regulator notice, or a press release about the deal.
6. **Real brands only.** The fictional brands used in the design mockups must
   never appear here; the loader and a test reject them.
7. Aliases are compared after `normalizeText()` (`src/lib/normalize.ts`):
   case, accents, ®/™, apostrophes, `&`/`and` and punctuation do not matter, so
   do not add spelling variants that differ only in those.
8. One entity per file keeps diffs reviewable. Keep files sorted the way they
   are (aliases, firm names, sources, lines) and comment non-obvious choices.
9. **Short aliases** (`kind: short`) are generic words that name the brand only
   in a recall from the brand's own firm: "Meridian", "Quest", "Elm", "Smokehouse",
   Sunshine Mills' "Champ" / "Evolve". The matcher accepts one only when the
   recalling firm is one of the brand's `firm_names`, its parent, or one of its
   `manufacturers`. Two brands may share a short alias. On a line, a short alias
   also works as a context-only line name.
10. **UPC prefixes** (`upc_prefixes`) are GS1 company prefixes as printed (with
   the number-system digit, 6 to 10 digits). A UPC with the prefix gives a
   brand-level match only when the recalling firm is the brand owner, so a
   co-packer's UPC never names a brand. Line names of that brand anywhere in the
   row still give the line. A retailer's prefix may sit on several of its store
   brands (PetSmart 737257 on Grreat Choice and Dentley's); it also decides which
   row keeps a UPC that FDA copied onto another brand's row.
11. **Line UPCs** (`upcs` on a line) are known product UPCs, as printed. A row of
   that brand that carries one gets the line even when its text names only the
   brand ("Wellness Chicken Formula ... UPC 0-76344-08822-6"). A UPC belongs to
   one line only (the loader rejects duplicates). They never name a brand on
   their own.
12. **Line names match singular or plural** ("Bully Stick" / "Bully Sticks",
   "Diner Classic" / "Diner Classics"); do not add the other number as an alias.
   When a bare line name is a common descriptor ("Grain Free"), name the line
   with the brand ("NutriSource Grain Free") so the bare words never match.

