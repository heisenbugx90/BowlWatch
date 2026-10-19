# BowlWatch design spec

Companion to CLAUDE.md. The `screens/` folder holds the approved mockups as
standalone HTML. They are **reference, not source**: rebuild them with the
tokens below as CSS custom properties and shared components, do not copy the
inline styles verbatim. Open any screen in a browser to see the intended result.

Canvas with the live artboards: https://claude.ai/artifact/N3n1K4t8yCfjR81PjZUyL7

## Direction

"The notice board." Calm, factual, legible at a glance. Borders over shadows,
no gradients, no icons as decoration, no emoji. Signal colours are reserved for
match confidence and the brand traffic light; never used for emphasis elsewhere.

## Tokens

```css
:root {
  /* ground and ink */
  --bone: #F5F3EE;        /* page background */
  --surface: #FFFFFF;     /* cards, header */
  --surface-2: #E9E6DF;   /* email client background only */
  --ink: #16201B;         /* text, dark bands */
  --ink-muted: #4A554F;   /* secondary text, 4.5:1 on bone */
  --ink-on-dark: #B8C3BC; /* muted text on --ink */
  --line: #D9D6CE;        /* borders, dividers */
  --line-strong: #B8B4AA; /* input borders */

  /* action */
  --pine: #1E5A45;
  --pine-hover: #174736;

  /* signals: fill / text / dot. Differ in lightness, always labelled. */
  --stop-fill: #FBE3E0;     --stop-text: #8E1C15;     --stop-dot: #B3261E;
  --alert-fill: #FBEBCB;    --alert-text: #6E4100;    --alert-dot: #C77700;
  --headsup-fill: #E3EBF8;  --headsup-text: #1B3F7A;  --headsup-dot: #2457A6;
  --clear-fill: #E3F1E8;    --clear-text: #14532D;    --clear-dot: #1F7A4D;
  --clear-dot-on-dark: #5FC68F;

  /* shape */
  --radius: 8px;      /* buttons, inputs, chips, small blocks */
  --radius-lg: 12px;  /* cards, sections */
  --radius-pill: 999px;
}
```

Spacing is an 8px step: 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 80.
Content max-width 1120px with 24px side padding.

## Type

Two families, loaded from Google Fonts:

```
https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400&family=JetBrains+Mono:wght@400;500&display=swap
```

| Role | Family | Weight | Size / line | Tracking |
|---|---|---|---|---|
| Page title (h1) | Instrument Sans | 700 | 32–36px / 1.05 | -0.02em |
| Landing hero | Instrument Sans | 700 | clamp(38px, 5vw, 60px) / 1.02 | -0.025em |
| Section (h2) | Instrument Sans | 700 | 34px / 1.1 | -0.02em |
| Card title | Instrument Sans | 700 | 18–24px / 1.1 | -0.02em |
| Body | Instrument Sans | 400 | 15–16px / 1.5 | 0 |
| Small | Instrument Sans | 400 | 13px | 0 |
| Eyebrow label | JetBrains Mono | 400 | 12px, uppercase | 0.08em |
| Lot, best-by, timestamps | JetBrains Mono | 500 | inherit | 0 |

Fallback stacks: `'Instrument Sans', 'Helvetica Neue', Arial, sans-serif` and
`'JetBrains Mono', ui-monospace, monospace`.

## Components

- **Button, primary**: pine fill, white text, 600 weight, min-height 44px
  (48px for hero/email CTAs), padding 0 18–22px, radius 8.
- **Button, secondary**: transparent, 1px ink border, ink text.
- **Text link**: pine, underline offset 3px, 600 weight. Every link to a recall
  notice ends with `↗`.
- **Signal badge**: fill + text from the signal tokens, 10px dot, 700 weight,
  padding 8px 14px, radius 8. Pill variant (radius 999, 13px, 6px 12px) for
  inline status.
- **Lot chip**: ink fill, bone text, mono 13px, padding 4px 10px, radius 6.
  Best-by chip: bone fill. Best-by within ~30 days: alert fill/text.
- **Watch pill**: white, 1px line border, clear dot, "Watching · lot level" or
  "Watching · line level".
- **Card**: surface, 1px line border, radius 12, sections divided by 1px line.
- **Dark band** (last-night check, Canadian notice): ink fill, bone text,
  muted text in --ink-on-dark.
- **Inputs**: 44–52px tall, 1px line-strong border, radius 8; focused search
  uses 2px pine border. Lot and date inputs are set in mono. Always a `<label>`.

## Screens

| File | What it is | Notes |
|---|---|---|
| `01-landing.html` | bowlwatch.ca | Hero + sample Stop email, 3 steps, 3 levels, "record not grade", Canadian notice, data-sources table, footer. Fluid; grids collapse on phone. |
| `02-add-food.html` | Add a food (step 2 of 2) | Search over the normalization table → results show product line, then brand · parent company · format. Optional lot/best-by. Right column is the brand profile card. |
| `03-your-foods.html` | Signed-in home | Last-night check band first; one card per pet; foods as rows with chips and watch level; settings cards. |
| `04-email-stop.html` | Stop | 8px red band, badge, one-sentence headline, fact block, numbered actions, dark CTA to the original notice, "why you got this" footer. |
| `05-email-alert.html` | Alert | Amber. Shows recalled lot and best-by ranges so the user can compare their bag. Secondary CTA: add your lot number. |
| `06-email-headsup.html` | Heads-up | Blue. States plainly that the user's line is not in the notice. Footer offers opt-out of brand-only heads-ups. |
| `00-foundations.html` | Token sheet | Visual reference for the tokens above. Not a product screen. |

## Brand profile card (02-add-food, right column)

1. Eyebrow "On file · [Brand]", product line as h2.
2. Traffic light badge with its meaning spelled out in the badge text:
   green "nothing on file in 5 years"; amber "older recalls at this brand, not
   this line"; red "this product line, last 12 months". One-line legend under it
   ending "This is a record, not a rating."
3. Recalls: 1 / 3 / 10-year counts in three bone blocks, then a list: mono date,
   product line, "your line" or "not your line", "Reason given: …", link to notice.
4. Practices: five WSAVA rows, answer Yes/No/Partly/Unknown in 700 weight,
   a "source ↗" link per row, "no source" for Unknown. Footer sentence explains
   that Unknown means nothing found, not No. Brands outside the curated set
   omit this section.

## Email rules

- 640px container on a --surface-2 background; card is surface with 12px radius.
- Subject line carries the level first: `STOP ·`, `ALERT ·`, `Heads-up ·`.
- Every email: level badge, one-sentence headline naming the pet, fact block,
  what to do, link to the original notice, "why you got this" footer with
  unsubscribe. Stop and Alert use a dark CTA; Heads-up uses the secondary style.
- Use table-free HTML only if the chosen email provider supports it; otherwise
  rebuild with tables and keep the same tokens.

## Accessibility

Real `<button>`, `<a href>`, `<input>` + `<label>`; `aria-current="page"` on the
active nav link; `aria-pressed` on selectable result rows; decorative dots are
`aria-hidden`. Text contrast ≥ 4.5:1 (3:1 at 24px+). Touch targets ≥ 44px.
Colours that must be told apart also differ in lightness and are always labelled.

## Sample data

All brands (Harrow & Finch, Kettle Creek, Ridgeline Pet Foods), pets (Maple,
Juniper), lots and recalls in the mockups are fictional. Do not seed the
normalization table from them.
