# Plan: The ground tone, rethought

**Status**: Draft — pending sign-off
**Implements**: spec.md in this directory

## Shape of the change

Five ground literals become one number's family kept in step by a rule
in code and a test; a dev-only switch carries a candidate ground across
every page the dev server serves and provably ships nothing; the matte
sampler's two-button ground bar grows into the candidate set, the free
tune and a contrast readout; a committed generator makes the static
social image reproducible on any ground; and the gate sets the tone (and,
on one branch, deepens the muted text). No schema, no transform, no
registry, no plugin change.

- **The family, and where its steps live** (`src/lib/ground.ts`, new —
  pure functions, no imports, importable by an Astro `<script>`, by the
  `.mjs` tests as `categories.test.mjs` imports `categories.ts`, and by a
  Node script under type stripping). The page ground is one oklch tone
  `{ L, C, h }`; the four tones that live on it are fixed steps from it,
  **today's steps** (so today's ground derives today's family exactly —
  the control is the identity):

  | token                 | L step  | C step  | h            | today (`:root`)         |
  | --------------------- | ------- | ------- | ------------ | ----------------------- |
  | `--color-bg`          | —       | —       | —            | `oklch(0.968 0.006 95)` |
  | `--color-surface`     | − 0.023 | + 0.001 | the ground's | `oklch(0.945 0.007 95)` |
  | `--color-soft`        | − 0.048 | + 0.002 | the ground's | `oklch(0.92 0.008 95)`  |
  | `--color-line`        | − 0.108 | + 0.002 | the ground's | `oklch(0.86 0.008 95)`  |
  | `--color-line-strong` | − 0.248 | + 0.006 | the ground's | `oklch(0.72 0.012 95)`  |

  `STEPS` is that table; `deriveFamily(bg)` applies it (L and C rounded
  to three decimals, C floored at 0, L capped at 1; h copied);
  `formatOklch` prints `oklch(L C h)` with trailing zeros trimmed, so
  `formatOklch(deriveFamily(today).surface)` is the string `:root`
  carries today, byte for byte. **The committed stylesheet keeps five
  literals** — not `oklch(from var(--color-bg) …)` — and the test pins
  them to the rule (Resolved decisions says why: AC 7's byte-for-byte
  keep branch, the tests that parse `:root` as plain literals, the OG
  route and Satori needing resolved numbers anyway). The steps are the
  spec's "fixed steps"; a retune of a step is a change to `STEPS`, which
  the test then demands of `:root`.

  The same module carries: `parseOklch` and `oklchToRgb255` (moved out of
  `ground.test.mjs`, unchanged maths, still pinned there against
  Ottosson's published values), `toHex`; `relativeLuminance` and
  `contrast` (below); `PAIRS` — text × {bg, surface, soft}, muted × {bg,
  surface, soft}, and mat × bg as information; `deepenMuted`;
  `readout(bg, muted)` returning the family, the seven ratios with a
  pass flag on the six text pairs, and the muted tone that would ship;
  `tokensFor(bg, muted)` returning the token → string map the switch
  applies; and `CANDIDATES`, the gate's fixed set, with `TODAY` its
  control.

- **The contrast formula** — WCAG 2 for normal text, on the 8-bit sRGB
  the browser paints: each channel `/255`, linearised
  (`c ≤ 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4`),
  `Y = 0.2126 R + 0.7152 G + 0.0722 B`, ratio
  `(Y_lighter + 0.05) / (Y_darker + 0.05)`.
  Both ends go through `oklchToRgb255` first (rounded to integers), so
  the test and the readout compute the number a checker given the hex
  would give. The floor is `≥ 4.5`, compared unrounded — no tolerance,
  a pass is a pass; the readout prints two decimals rounded **down**, so
  nothing shows "4.50" while failing. Pinned against known pairs: black
  on white 21; `#777777` on white 4.48; `#767676` on white 4.54 (the
  well-known pair either side of the floor). For a neutral grey OKLab's
  L is exactly the cube root of Y, which is what makes the estimates
  below quick and the test's numbers exact.

- **Where the text sits, and today's numbers.** The prose paragraphs
  (`.prose p, .prose li`, `global.css` ~641), the lead, the cards' copy
  and the captions read `--color-muted`; headings and the nav read
  `--color-text`. Inline `code` in a paragraph is muted text on the
  soft fill; the search fallback and the note rows are muted text on
  the surface fill. So the muted floor is the reading floor, and its
  tightest pair today is muted-on-soft. Estimates (greys; T1200's test
  computes and records the exact values, which replace these):

  | pair            | today            | the pair's reading                       |
  | --------------- | ---------------- | ---------------------------------------- |
  | text / bg       | ≈14.6            | never near the floor in the tune's range |
  | text / soft     | ≈12.6            |                                          |
  | muted / bg      | ≈5.5             | the prose                                |
  | muted / surface | ≈5.1             |                                          |
  | muted / soft    | ≈4.7             | inline code — the pair that binds        |
  | mat / bg        | ≈1.10 (ΔL 0.032) | the question, shown, no floor            |

  Every darker candidate takes muted-on-soft under 4.5, so **the
  muted-deepens branch is the likely branch for any darker tone**, and
  the readout says so beside the candidate. `deepenMuted(family, muted)`
  is the spec's "least step": lower `--color-muted`'s L by 0.01 at a
  time (C and h unchanged) until all three muted pairs pass; the first L
  that passes ships. Estimates: `deep-1` → 0.49, `deep-2` → 0.48,
  `deep-3` → 0.46. `--color-text` never moves; if a tuned tone fails a
  text pair (impossible above L 0.85 — ≈9:1 there) the readout marks it
  and the shipped test would refuse it.

- **The candidates** (`CANDIDATES` in `ground.ts`; the sampler's
  `getStaticPaths` imports the table — imports are the one thing its
  isolated scope can see, the spec-010 gotcha is about frontmatter
  consts):

  | id       | `--color-bg`             | why it is on the switch                                                         | muted / bg | muted / soft |
  | -------- | ------------------------ | ------------------------------------------------------------------------------- | ---------- | ------------ |
  | `paper`  | `oklch(0.99 0.003 100)`  | the pre-003 paper-white, spec 013's "white" — its companions now by the rule    | ≈5.8       | ≈5.1         |
  | `light`  | `oklch(0.98 0.005 95)`   | one step lighter than today                                                     | ≈5.7       | ≈4.9         |
  | `today`  | `oklch(0.968 0.006 95)`  | the control — selecting it removes the override, so it is the stylesheet itself | ≈5.5       | ≈4.7         |
  | `deep-1` | `oklch(0.95 0.007 95)`   | one step darker                                                                 | ≈5.2       | ≈4.5 ✗       |
  | `deep-2` | `oklch(0.93 0.008 95)`   | two steps darker                                                                | ≈4.9       | ≈4.2 ✗       |
  | `deep-3` | `oklch(0.90 0.009 95)`   | the far bracket, where muted-on-ground itself fails                             | ≈4.5 ✗     | ≈3.8 ✗       |
  | `cool`   | `oklch(0.968 0.008 250)` | today's lightness at the text's hue — a cool grey                               | ≈5.5       | ≈4.7         |
  | `warm`   | `oklch(0.968 0.012 75)`  | today's lightness, warmer and more coloured                                     | ≈5.5       | ≈4.7         |

  The chroma steps up with darkness because a flat 0.006 reads greyer
  as L falls. Beside the set, the **free tune**: three range inputs —
  L 0.85–1.00 by 0.001, C 0–0.03 by 0.001, h 0–360 by 1 — seeded from
  the selected candidate; a move gives id `tune` and the tone is shown
  as `oklch(L C h)` text so it can be named as numbers.

- **The site-wide switch, dev only** (`src/components/DevGround.astro`,
  new; rendered by `src/layouts/BaseLayout.astro`'s `<head>` as
  `{import.meta.env.DEV && <DevGround />}` — a build-time constant, so
  the build renders nothing). It is one
  `<script is:inline data-dev-ground>` of plain JS, ~25 lines, no
  imports: read
  `localStorage['dev-ground']` (JSON `{ id, bg, muted, tokens }`),
  `setProperty` each entry of `tokens` on `document.documentElement`,
  and do the same on `astro:after-swap` (the router replaces `<html>`'s
  attributes on navigation, so the inline style must be re-applied; the
  listener is registered once behind a `window` flag). Inline in the
  head so the first paint is already on the candidate — no flash of
  the stylesheet's ground on a hard reload. `localStorage`, not
  `sessionStorage`: the candidate must survive a new tab and a
  dev-server restart between the two screens. `today` and reset remove
  the key and the inline properties, so the control is the stylesheet
  with nothing on top. The tokens the sampler stores are the derived
  five plus `--color-muted` when deepened; the applier does no maths.
  The pause's lights (`html[data-pause-active]`, ~1786) mix from
  `var(--color-bg)` toward `--color-quiet`, and the inline token is what
  `var()` finds on `<html>`, so the pause follows the candidate by
  construction; the quiet view's ground is `--color-quiet` and does not
  move.

  **Provably absent from the build**: `scripts/check-no-dev-routes.mjs`
  gains a second scan — every `.html` and `.js` under `dist/` for the
  string `dev-ground` — and fails naming the files if any carries it.
  Its green line becomes
  `[check-no-dev-routes] no dev routes in dist/; no dev-ground marker in <n> files.`
  (`scripts/verify.sh` greps the prefix, unchanged). The negative
  control (guard removed → the barrier fails; restored) is T1202's.

- **The sampler** (`src/pages/dev/matte/[...surface].astro`, spec 013's,
  extended — not a new fixture: the four surfaces on the real exports
  are exactly the thing to judge a ground on, and its ground bar is the
  seam). The `aside[data-ground-bar]` becomes: the candidate buttons
  (`data-l`/`data-c`/`data-h`/`data-note` from the `candidates` prop),
  the three tune inputs with their numbers, the tone as text, a
  seven-row readout (`<table>`, `is-fail` on a row under the floor),
  one line "muted ships at `oklch(…)` — deepened for muted/soft" or
  "muted unchanged", and `reset`. Its script imports from
  `../../../lib/ground` (bundled — the sampler is never built), writes
  `localStorage['dev-ground']` and applies the tokens to `<html>`
  itself so the readout and the page move together on every input.
  The sampler's own `sessionStorage` state (`matte-sampler`: the mat
  candidates, floor, ceiling) loses its `ground` field; `WHITE`, `WARM`,
  `GROUND_TOKENS` and `applyGround` go — the ground is the switch's,
  read by the head applier on this page like every other. The mat
  candidates open on `share-60` (the shipped rule) rather than spec
  003's `today`, so the mats the gate judges are the mats that ship;
  the button ids stay.

- **The derived copies.** `src/pages/og/pieces/[slug].png.ts`'s `COLOR`
  and its Satori tree move to `src/lib/og-card.mjs` (plain JS: `COLOR`,
  `loadFonts()`, `card({ title, description, kind })` → the tree; the
  route becomes a thin endpoint calling them — same PNG bytes, checked).
  `scripts/gen-og.mjs` (new;
  `node --experimental-strip-types scripts/gen-og.mjs [--out path]`,
  wired as `npm run og`) reads
  `:root`'s tokens from `global.css`, converts them with `ground.ts`
  (type stripping, since the module is erasable-syntax TypeScript;
  `.nvmrc` says Node 22 and 22.6+ carries the flag, 22.18+ needs none),
  prints each token's hex beside `COLOR`'s, **refuses to write** if any
  differs by more than 2/255 ("update COLOR in src/lib/og-card.mjs
  first"), else renders
  `card({ title: SITE.title, description: SITE.description, kind: '' })`
  at 1200×630 through Satori and sharp
  to JPEG (quality 90) at `public/og.jpg`. Spec 002 made that file "with
  the existing satori setup" ad hoc and spec 003 "resynced" it by hand;
  now that `ground.test.mjs` pins it, every retune needs the same run,
  so it is one command. The generator is exercised in Phase 0 against
  the committed file (`--out` to the scratchpad, pixel compare) so the
  keep branch leaves `public/og.jpg` byte-identical and the change
  branch runs a proven script.

- **The gate's landing** (T1204, written for every outcome). **Changed**:
  `:root`'s five literals become `tokensFor(tone)`'s strings (the four
  derived ones pasted from the test's expected values or the
  generator's print — never retyped from the sampler by eye), the
  comment above `--color-bg` rewritten (this gate's date, the tone as
  numbers, the pair that bound, the history in one line);
  `--color-muted` to the deepened value only if the record says so, with
  its own comment naming the pair; `CANDIDATES.today` becomes the landed
  tone and the old control stays as `warm-003`; `COLOR` in `og-card.mjs`
  recomputed (bg, line, and muted if deepened); `public/og.jpg`
  regenerated; `README.md` and `design/brief.md` by T1205. **Kept**: no
  edit to the stylesheet, `og-card.mjs`, `og.jpg` or `CANDIDATES` —
  `git diff main` on those paths empty is the check — and the documents
  say the tone was re-judged and kept.

## Failure messages and notes

The barrier's line changes shape; nothing else in the build's output
moves:

```
[check-no-dev-routes] no dev routes in dist/; no dev-ground marker in <n> files.
[check-no-dev-routes] dist/dev/ exists — a dev-only route was built: <files>
[check-no-dev-routes] the dev ground switch shipped: <files>
[gen-og] COLOR in src/lib/og-card.mjs drifts from :root (<token>: <hex> vs <hex>) — update it first
[gen-og] wrote public/og.jpg (1200×630) on <bg hex>
```

The draft fixture piece is still never built (87 pages stay 87).

## Testing strategy

Every claim above is owned by a task and a check:

- **The family is one number's, and today's is its own** —
  `ground.test.mjs` (extended; its helpers stay, its converter moves
  into `ground.ts` and is imported), **T1200**: (a) the four derived
  `:root` literals equal `formatOklch(deriveFamily(parse(--color-bg)))`
  as strings — today, byte for byte; (b) `CANDIDATES.today.bg` is
  `:root`'s `--color-bg`; (c) the spread: at least two candidates with
  L above today's (one of them `oklch(0.99 0.003 100)`), at least two
  below, at least one with L within 0.01 of today's and h ≥ 200, one
  with h < 95 and C > today's; ids unique. Mutation-checked: `--color-soft`
  L changed by 0.001 → (a) fails naming the token; a step in `STEPS`
  changed → (a) fails.

- **The words stay readable at the committed values** — `ground.test.mjs`,
  **T1200** (lands green today, so the floor is a fact before the gate,
  not a hope after it): the six text pairs from `:root`'s tokens are
  `≥ 4.5`, each named; the formula's fixtures (21 / 4.48 / 4.54, to two
  decimals); the converter's published values (the existing case);
  `deepenMuted` returns `null` for today's family and, for
  `deriveFamily(deep-2)`, an L that passes all three muted pairs while
  L + 0.01 fails at least one (the least step, pinned both ways).
  Mutation-checked: `--color-muted` L 0.5 → 0.55 → the muted/soft case
  fails with the ratio in the message.

- **The derived copies match the tokens** — `ground.test.mjs`, **T1201**:
  `COLOR.bg`, `.line`, `.text`, `.muted`, `.accent` — imported from
  `og-card.mjs`, no longer regex-parsed from the route — each within
  ±2/255 per channel of its token's conversion (the spec asks for bg and
  line; text, muted and accent are the same kind of copy and cost three
  lines — a drift found at landing is resynced in the task and recorded,
  not loosened); `public/og.jpg` at (10, 10) within ±3 of `--color-bg`
  (the existing case). The generator: `--out <scratch>` on today's
  tokens → the scratch file's (10, 10) within ±3 of the committed
  file's, both 1200×630; `COLOR.bg` set to `#f6f0f0` → the generator
  refuses with the drift line, restored; the route's PNG for one piece
  byte-identical before and after the refactor (`shasum` of
  `dist/og/pieces/<slug>.png`).

- **The switch reaches every page under the dev server and nothing in
  the build** — **T1202**: the barrier line green with the new count;
  `grep -rl dev-ground dist/` empty; `test ! -e dist/dev`; the negative
  control — the `import.meta.env.DEV &&` guard removed, `npm run build`
  fails at the barrier naming `dist/index.html` among the files, output
  recorded, guard restored and re-verified; on the dev server with
  `localStorage['dev-ground']` set to `tokensFor(deep-2)` (the driver
  writes it as the sampler will), `<html>`'s computed `background-color`
  on `/`, `/pieces/`, one piece, `/galleries/every-ratio/`,
  `/places/the-headlands/`, one image page (and its quiet view: still
  `--color-quiet`'s value), `/about/`, `/search/` equals
  `oklchToRgb255(deep-2)` within 1/255; a card's background on `/` and a
  `code`'s on the vocabulary sampler equal the derived surface and soft;
  a hairline's `border-color` the derived line; **after a router
  navigation** (a link clicked, not a reload) the same reads hold
  (the after-swap claim); with the key removed, every read returns the
  stylesheet's value. Measurement as spec 013's: Firefox headless via
  BiDi with T1104's launch recipe; where the implementer cannot drive a
  browser it says so, line by line, and the pause asks the person.

- **The sampler shows the spread, the tune and the readout** — **T1203**:
  `sh scripts/verify.sh` green with 87 pages and the barrier line; on the
  dev server at 1512×982: `/dev/matte/` shows eight ground buttons in the
  table's order; clicking `deep-2` sets `<html>`'s background to its
  conversion, writes the key with six tokens (muted deepened) and the
  readout's muted/soft row is marked failing at the undeepened value and
  passing at the shipped one — recorded; the tune's L slider moved to
  0.90 gives id `tune`, the tone text `oklch(0.9 0.008 95)`, and a muted
  line reading a deeper L; `today` removes the key and every inline
  token; `/pieces/where-the-fog-lets-go/` opened afterwards with `deep-2`
  selected wears it (the site-wide claim, sampler → site); the mat
  candidates open on `share-60`; the readout's seven numbers for `today`
  equal T1200's test values to two decimals (the page and the test share
  the code, so this is the check that they do).

- **The tone landed, or didn't** — **T1204**: changed → `ground.test.mjs`
  green against the new literals, `COLOR` and `og.jpg` (deltas recorded);
  `grep -c "0.968 0.006 95" src/styles/global.css` → 0 outside the
  history comment; on the dev server with **no** key set, `<html>`'s
  background, a card, a code block and a hairline read the landed family;
  the quiet view `--color-quiet`'s value; `git diff main -- src/styles/global.css`
  shows nothing inside the `html[data-pause-active]` block or on
  `--color-quiet`, `--pause-depth`, `--color-text`, `--color-accent`,
  `--color-matte`, the mat tokens; one built OG PNG's corner pixel equals
  `COLOR.bg`; kept → `git diff main -- src/styles/global.css src/lib/og-card.mjs public/og.jpg src/lib/ground.ts`
  empty for the token lines and the candidate table (the module's
  other code is Phase 0's).

- **Untouched by construction** (the non-goals) — **T1204** and the
  sweep: `git diff main -- src/content.config.ts remark-pieces-blocks.mjs obsidian-plugin/ src/lib/gallery-layout.ts`
  empty; `matte.test.mjs`, `page-head.test.mjs`, `og.test.mjs` green and
  unedited; the mat's colour `oklch(1 0 0)` and the three mat tokens
  unchanged.

- Existing suites stay green (325 tests + the new cases); build with
  both barriers; `astro check`; Prettier on the docs.

## File structure

```
src/lib/ground.ts                              STEPS, deriveFamily, formatOklch, parseOklch, oklchToRgb255, toHex, relativeLuminance, contrast, PAIRS, deepenMuted, readout, tokensFor, CANDIDATES (new; T1200); CANDIDATES.today → the landed tone (T1204)
ground.test.mjs                                the family pinned to the rule; the spread; the floor at :root's values; the formula's fixtures (T1200); COLOR from og-card.mjs, all five (T1201)
src/lib/og-card.mjs                            COLOR, loadFonts, card — out of the route (new; T1201); COLOR recomputed (T1204)
src/pages/og/pieces/[slug].png.ts              the thin endpoint (T1201)
scripts/gen-og.mjs, package.json               the generator and `npm run og` (new; T1201)
public/og.jpg                                  regenerated on the landed ground (T1204, change branch only)
src/components/DevGround.astro                 the head applier, is:inline (new; T1202)
src/layouts/BaseLayout.astro                   {import.meta.env.DEV && <DevGround />} in <head> (T1202)
scripts/check-no-dev-routes.mjs                the dev-ground scan (T1202)
src/pages/dev/matte/[...surface].astro         the ground bar: candidates, tune, readout; its ground state removed (T1203)
src/styles/global.css                          :root's five literals, the comment; --color-muted on the deepens branch (T1204)
README.md, design/brief.md                     the OG sentence and the scripts tree; the Palette note (T1205)
ROADMAP.md, DECISIONS.md                       close-out (T1206, implementer-edited, orchestrator-committed)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`--color-text`, `--color-accent` and its two mixes, `--color-on-accent`,
`--color-matte`, `--color-quiet`, `--pause-depth` and the lights block,
the three mat tokens and every form, the transform, the schema, the
fixture piece, `matte.test.mjs`, `page-head.test.mjs`, `og.test.mjs`,
`public/favicon.svg`, `AUTHORING.md` (it names the ground only in
prose about the pause), the Obsidian plugin.

## Known limitations

- **The steps are today's, so `paper`'s companions are not the pre-003
  file's.** Spec 013's white candidate carried the historical
  0.965/0.94/0.86/0.72 (line-strong at hue 120); by the rule the same
  ground gives 0.967/0.942/0.882/0.742 at hue 100. The ground the spec
  names is on the switch exactly; its fills sit a step lighter than the
  pre-003 file's did. Stated at the gate.
- **The readout is arithmetic, not a photometer.** It computes what a
  checker would from the hex; neither screen is calibrated (the spec's
  non-goal), and a P3 display paints the same numbers a little
  differently. The floor is met on the numbers, which is what the
  standard asks.
- **Contrast is checked at seven pairs, not every element.** Text on the
  accent, on the quiet dark and on a mat are unchanged by this spec and
  not in the readout; the pause's mixed colours vary with scroll and
  are not a normal-text surface.
- **`localStorage` is per origin.** The two screens see one candidate
  only if they look at one browser profile on one dev server; on a
  second machine the sampler is opened and the candidate clicked again.
  The key is shown in the bar so it can be checked.
- **The dev server caches `getStaticPaths`**: editing `CANDIDATES`
  needs a restart (spec 013's note; the table now lives in `ground.ts`,
  imported, but the paths are still cached).
- **The generator needs type stripping** to import `ground.ts` and
  `consts.ts`. On a Node 22 below 22.6 it would fail at import; T1201
  records the version, and the fallback — a `.mjs` copy of the two
  converters the script needs — is a deviation to name, not to take
  silently.
- **The estimates in this plan are grey estimates** (L³); the sampler
  and the test compute the exact ratios, and the records replace the
  tables' numbers.

## Resolved decisions

- **Five literals kept in step by a test, not relative colour syntax in
  the stylesheet.** `oklch(from var(--color-bg) calc(l - 0.023) …)` has
  been Baseline since mid-2024 and would make the switch a one-token
  override; it was not taken because AC 7 wants the tokens byte-for-byte
  unchanged on the keep branch (a conversion in Phase 0 breaks that
  before the gate), because `ground.test.mjs` and the sampler read
  `:root` as plain literals and the OG copies need resolved numbers
  either way, and because a test that evaluates a relative-colour
  expression is a second parser to maintain. The rule lives once in
  `STEPS`; the stylesheet is its output, checked. If a second palette
  ever arrives the conversion is mechanical.
- **Today's steps are the fixed steps**, so the control derives itself
  and the keep branch is a no-edit branch; the pre-003 family's slightly
  larger steps are history, not a second rule.
- **The muted deepening is applied in the sampler, not only reported**,
  because the spec says the deepened muted is what ships when a tone
  needs it, and a gate that judged the undeepened prose would judge a
  page that will never exist. The readout shows both numbers.
- **`today` is the absence of an override**, so the control is the
  committed stylesheet itself and a stale override can never pose as it.
- **The switch is a blocking inline script in the head**, not a bundled
  module: no flash on the first paint, no import graph to prove absent,
  and one string (`dev-ground`) for the barrier to find.
- **The static social image gets a committed generator** and the card
  tree moves to a lib the route and the script share, so the two copies
  cannot drift from each other and the test's pin has a one-command
  fix. `COLOR`'s other three hexes are pinned in passing.
- **The matte sampler is extended, not cloned**: its four surfaces, its
  fixture piece and its exports are the judging conditions; only its
  ground bar was too small.
- **`deep-3` sits where muted-on-ground fails**, on purpose: the spec
  wants a failing candidate to be seen failing before it is liked.
