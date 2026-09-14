# Plan: The matte, rethought

**Status**: Signed off (2026-09-13) — by the `skeptical-reviewer` at the
top tier, one review and one re-review; see tasks.md's tier log.
**Implements**: spec.md in this directory

## Shape of the change

One token becomes three and a rule; every place that reads the token
reads the rule instead; a dev-only sampler shows the rule on the four
surfaces, and the gate sets the values (and, on one branch, the ground).
No schema, no registry, no data change. The transform gains one thing:
every frame it places carries its ratio, which the rule needs.

- **The rule and its single source** (`src/styles/global.css`, `:root`,
  replacing `--matte`):

  ```css
  --mat-share: 0; /* the share of the photograph's rendered short side; 0 = the floor wins */
  --mat-min: clamp(
    0.5rem,
    1.4vw,
    1.05rem
  ); /* floor — at T1101 today's --matte, so nothing changes */
  --mat-max: clamp(0.5rem, 1.4vw, 1.05rem); /* ceiling — likewise */
  --color-matte: oklch(1 0 0); /* unchanged */
  ```

  A frame's mat is `m = clamp(--mat-min, --mat-share × σ, --mat-max)`
  where σ is the photograph's rendered short side (inside the mat). The
  three tokens are declared **only** in `:root` (T1101's test pins that);
  a surface reads them through one computed property, `--mat`, set on
  the frame by the rule for its geometry, and applies
  `padding: var(--mat)`. With share 0 and floor = ceiling = today's
  clamp, every
  form below resolves to today's `--matte` exactly and every formula
  that counts the mat reduces to today's — so T1101 lands inert, the
  sampler's "today" control is a token setting rather than a second
  stylesheet, and a per-surface "off" after the gate is `--mat: 0px`
  on that surface, not a second mechanism.

- **Four forms of σ, because CSS cannot measure a rendered height.** A
  box's percentage padding resolves against its containing block's
  width, never its own height, so the rule needs the frame's ratio
  (`--ar`, width ÷ height, raw) and solves for `m` algebraically; the
  clamp is exact in every form because the clamp regime depends only on
  known lengths. With `r = max(--ar, 1)` and `q = min(--ar, 1)`:

  | form                                | where                                                                                                                                                                                        | σ and `--mat`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
  | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **W** — column-bound                | single (both forms, the shorthand), inset, wide, grid, aside, row, default/weighted diptych and triptych, held and pause **anchors**, the cover card's `span.image-link`, the compare figure | the frame fills its container of width `W` (`100%`); image width `W − 2m`, σ = `(W − 2m)/r` → `--mat: clamp(var(--mat-min), calc(100% * var(--mat-share) / (max(var(--ar, 1), 1) + 2 * var(--mat-share))), var(--mat-max))`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
  | **H** — height-bound box            | `.piece-held figure` (its `max-width`)                                                                                                                                                       | the frame fits `--avail-h: calc(100svh - 2 * var(--hold-margin))`; σ = `(H − 2m)·q` → `--mat: clamp(var(--mat-min), calc(var(--avail-h) * var(--mat-share) * var(--q) / (1 + 2 * var(--mat-share) * var(--q))), var(--mat-max))`; then today's box formula with `--mat` in place of `--matte`: `max-width: calc((var(--avail-h) - 2 * var(--mat)) * var(--ar, 1) + 2 * var(--mat))`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
  | **V + H** — two limits, the smaller | `.piece-pause` (its `--frame-w`/`--frame-h`), `.image-frame` (the stage)                                                                                                                     | `--avail-w` and `--avail-h` as lengths; `--mat: min(clamp(…V…), clamp(…H…))` where V is form W with `var(--avail-w)` for `100%`; clamp is monotone, so the min of the two clamped mats is the mat of the binding limit. Pause: `--avail-w: calc((100vw - 2 * var(--hold-margin)) / var(--pause-scale))`, `--avail-h` the same over `100svh`, `--frame-w: min(var(--avail-w), calc((var(--avail-h) - 2 * var(--mat)) * var(--ar, 1) + 2 * var(--mat)))`, `--frame-h: calc((var(--frame-w) - 2 * var(--mat)) / var(--ar, 1) + 2 * var(--mat))`. Stage: `--avail-w: min(calc(100vw - 2 * var(--page-pad)), var(--content-width))`, `--avail-h: calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad))`; quiet view redeclares both over `--stage-pad` alone; `img { max-height: calc(var(--avail-h) - 2 * var(--mat)) }` |
  | **R** — packed rows                 | `.gallery-flow > li` (galleries, the place wall, the related strip)                                                                                                                          | σ\* = the row's **target** short side, `--gallery-short` → `--mat: clamp(var(--mat-min), calc(var(--gallery-short) * var(--mat-share)), var(--mat-max))`; the cell math keeps the mat as its constant term: `flex: var(--w) 1 calc(var(--gallery-short) * var(--w) + 2 * var(--mat))`, `max-width: min(100%, calc(var(--gallery-short) * var(--w) * var(--gallery-stretch) + 2 * var(--mat)))`, the `<720px` `.related-flow` cap likewise; the anchor inherits `--mat`                                                                                                                                                                                                                                                                                                                                                       |
  | **P** — matched heights             | `.piece-diptych.match-height > …`, `.piece-triptych.match-height > …`                                                                                                                        | one mat for the block, a share of the matched height `h = (W − G − 2nm)/A` (A = Σ raw ratios, n = frames, G = gaps): `--mat: clamp(var(--mat-min), calc((100% - (var(--n) - 1) * var(--pair-gap)) * var(--mat-share) / (var(--ar-sum) + 2 * var(--n) * var(--mat-share))), var(--mat-max))`, with `--pair-gap: calc(var(--baseline) / 3)` declared on the block and read by its `gap` too                                                                                                                                                                                                                                                                                                                                                                                                                                    |

  Forms W and H/V agree on the held, pause and stage frames: when the
  height binds, the box's width is `(H − 2m)·ar + 2m` and form W at that
  width returns the same `m`, clamped or not (`W·s/(r+2s) ≥ C` exactly
  when `s(H−2C)q ≥ C`); when the width binds, the box formula is not
  the binding constraint and form W is right by itself. That identity
  is the plan's central claim and T1101's evaluator test checks it over
  a grid of ratios, viewports, shares and clamps (Testing strategy).
  Form W is declared once, on one selector list — the existing matted
  list plus `.gallery-card .image-link` and `.compare` — so a scoped
  stylesheet only ever reads `var(--mat)`; forms H, V+H, R and P are
  each written once on the element that owns that geometry. The cover
  card's mat is one place: `CoverCards.astro`'s `span.image-link`, which
  carries its own `--ar` (no anchor falls back to 1 — the card's anchor
  is `a.gallery-card`, not `.image-link`). `global.css`'s
  `.gallery-grid > li > a.image-link` rules (~1884–1894) match no markup
  since spec 009 moved the cards' mat to the span — the cards' `<ul>` is
  the only `.gallery-grid` — and T1101 deletes them, so "cards off" is
  one edit.

- **Form R is a deliberate deviation from the spec's letter.** A packed
  row's actual short side is the target grown by up to `--gallery-stretch`
  (1.35), and the growth is flex's, not a length CSS can read: a mat
  that followed the grown side exactly would put the mat inside the
  proportional term, which cannot express today's fixed mat (no
  constant term) and goes inexact the moment the clamp bites. A mat
  proportional to the target keeps the equal-short-side math exact
  (the constant term stays), scales with the density knob (33vmin:
  ≈324px at 1512×982, ≈422px at 1280×1440 — "wider mats by the same
  share"),
  makes every cell in a row wear one mat, and expresses today's mat as
  a token setting. The cost: a stretched row wears its mat at between
  `share/1.35` and `share` of its actual short side. Stated here, in
  the test, and in the CSS comment.

- **The ratio on every frame** (`remark-pieces-blocks.mjs`). Today only
  match="height", strip, held and pause probe dimensions, and only
  match (normalized), held and pause emit `--ar`. Now the probe runs
  for every block and the shorthand pass, and every anchor (or bare
  `img` when `alt=""`) carries `style="--ar: <raw ratio, trimNumber>"`;
  match="height" keeps its **normalized** `--ar` on the anchors (the
  flex-grow factors) and the container additionally carries
  `--ar-sum: <Σ raw ratios>` and `--n: <count>` for form P. The
  shorthand visit
  becomes collect-then-await (the transform is already async). Cover
  cards set `--ar` on the span from the cover's dimensions; the gallery
  cell already carries it; the image page sets it on `.image-frame` and
  changes the compare figure's `--ar` from `W / H` to the same decimal
  (`aspect-ratio` accepts a number). The span, the cell, the stage
  figure and the compare figure are the elements form W or V+H is
  declared on, so each reads its own `--ar`. A frame with no `--ar`
  falls back to 1, which is a share of the width — right for a portrait or square,
  over by the ratio for a landscape — so the transform test pins that
  every frame has one.

- **The stage's rules move to `global.css`** (`.image-stage`,
  `.image-frame`, `.image-frame img`, the three `html[data-quiet]` stage
  rules; the page's scoped `<style>` keeps everything else). Two reasons:
  the sampler must render the real stage, and a page-scoped stylesheet
  cannot be reached from a dev page without retyping it; and form V+H
  belongs beside the other forms. The `vh` fallback lines for
  `max-height` are dropped where the value now passes through a custom
  property (a fallback cannot ride a custom property; `svh` has shipped
  everywhere since 2022) — the `min-height` pair stays as it is.

- **The four surfaces, and what "off" is.** Each surface's decision is
  landed at T1104 by one edit per surface, whichever way the gate goes:

  | surface                                                        | mat today                                                                                                                                           | off = (T1104)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | a piece's reading-flow frames (one group)                      | the matted-list rule (`padding`, `background`), the half-bleed and `width-fullbleed` exceptions, held/pause box formulas, form P                    | **first**, T1103a: `CLAUDE.md`'s block-vocabulary bullet ("captions via the container form and site-applied mattes") amended in its own commit — the constitution's rule, and the statement is about piece-body treatments, so it goes false on this branch, not only on "nowhere"; then delete the matted-list rule's `padding`/`background` and the two exception rules; `.piece-held figure` and `.piece-pause` set `--mat: 0px` in place of their forms; delete the form P rule; drop the piece entries from the form W list |
  | the packed rows (galleries, the place wall, the related strip) | form R; `.gallery-flow > li > a.image-link` `padding`/`background`                                                                                  | `.gallery-flow > li { --mat: 0px }`; delete the anchor's `padding`/`background` (and `LatestWork.astro`'s, see below)                                                                                                                                                                                                                                                                                                                                                                                                            |
  | the image page's stage                                         | form V+H on `.image-frame`; the compare figure (form W) with `.compare-frames { gap }` and `.compare-note { margin }` reading `--mat`               | `.image-frame { --mat: 0px }`, delete its `padding`/`background`; the compare's `padding`/`background` deleted and its gap and margin set to `calc(var(--baseline) / 2)`; drop `.compare` from the form W list                                                                                                                                                                                                                                                                                                                   |
  | the index cover cards                                          | `CoverCards.astro` `.gallery-card .image-link` `padding`/`background` — the one place, once T1101 has deleted the dead `.gallery-grid` anchor rules | delete those two declarations; drop `.gallery-card .image-link` from the form W list                                                                                                                                                                                                                                                                                                                                                                                                                                             |

  Two matted things the spec's groups do not name, assigned here: the
  image page's **compare figure** follows the stage (same page, same
  decision); **`LatestWork.astro`** — a curated strip no page places —
  follows the packed rows (it is the related strip's kin) and gets
  form H over its band height (`--ar` on its anchor, `--avail-h` declared
  there and read by both its `--mat` and its `img { height }`, so the
  band's height is one string) so it keeps compiling; neither is a gate
  candidate. If
  **no** surface keeps a mat, T1104 also deletes the three tokens, the
  form W rule and the CSS-test cases that pin them, and T1105 moves the
  ground; `--color-matte` stays only if the compare's divider still
  reads it (reworded comment). If the gate keeps **everything as
  today**, T1104 keeps T1101's literals (share 0, today's clamp) with
  the comment dated and the machinery live.

- **The ground** (`--color-bg`, with `--color-surface`, `--color-soft`,
  `--color-line`, `--color-line-strong` shifted in step, as spec 003 did).
  Mats anywhere: untouched. Nowhere: T1105 lands the gate's white,
  recomputes `COLOR.bg` in `src/pages/og/pieces/[slug].png.ts` and
  regenerates `public/og.jpg`. The sampler's white candidate is the
  pre-003 value `oklch(0.99 0.003 100)` with its companions taken from
  `git show f8d87af^:src/styles/global.css` (the bundle records the
  background only). `ground.test.mjs` (T1102) makes "the derived copies
  match the ground" falsifiable in both directions, today and after.

- **The sampler** (`src/pages/dev/matte/[...surface].astro`, dev only;
  `src/pages/dev/place-wall/[...candidate].astro` is the pattern with
  its three lessons: `getStaticPaths()` returns `[]` unless
  `import.meta.env.DEV`; the candidate table declared **inside**
  `getStaticPaths` and passed as a prop; a candidate's custom
  properties set on an element whose rules read them — here the three
  tokens go on each surface's wrapper `<section>`, which works because
  nothing between `:root` and a frame redeclares them). Paths:
  `/dev/matte/` (the four surfaces stacked) and `/dev/matte/<surface>/`
  for `pieces`, `galleries`, `stage`, `cards`. Each surface renders in
  its page's exact markup and classes, on the real exports (the REAL
  predicate and fallback from the place-wall sampler):
  - `pieces`: the piece page's `article > header.page-head.section.reading-head > .piece-column` and `.section > .prose.piece-column > <Content />` of the **fixture piece** `src/content/pieces/matte-sampler/index.md` (`draft: true`, so it ships nothing; rendered via `getEntry` + `render`), which places the ten exports by their spec-008 shape `../../gallery-images/<file>.jpg` in every matted treatment — the shorthand, single, inset, wide and one half-bleed, a mixed-orientation default diptych, a mixed match="height" diptych, a match="height" triptych, a four-image grid, aside, row, held, pause — with fullbleed, tall and strip between them as the unmatted controls. The vocabulary-sampler piece cannot serve: its images are grey placeholders and the gate judges mats on photographs. No piece-page script (the pause pins on the light ground; its width is CSS).
  - `galleries`: the gallery page's `ul.gallery-flow.gallery-wide` at `galleryFlowStyle` with `galleryCell(image.image)`, and below it the related strip's `ul.gallery-flow.related-flow` at `relatedFlowStyle` with `galleryCell(image.image, RELATED_SHORT_PX, RELATED_NARROW_SHORT_PX)` — consumed, not retyped.
  - `stage`: four `div.image-stage > figure.image-frame[style=--ar]` (a landscape, a portrait, a panorama, a square) with the image page's `<Image>` (`width` capped at 2320, its `sizes`), each a viewport tall as on the page.
  - `cards`: `<CoverCards cards={…}>` over the exports, as the galleries sampler builds them.

  A fixed toolbar per surface switches the three tokens between the
  candidates (`style.setProperty` on the wrapper, the active one
  marked) with two inputs for floor and ceiling in rem that re-apply to
  the share candidates; a page toolbar switches the ground (the five
  tokens on `<html>`); both remembered in `sessionStorage` so walking
  the surface pages keeps the state. The candidates:

  | id         | `--mat-share` | `--mat-min`                     | `--mat-max`                     | on a 3:2 reading-width single (666px column, 1512×982)            |
  | ---------- | ------------- | ------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
  | `none`     | `0`           | `0px`                           | `0px`                           | 0                                                                 |
  | `today`    | `0`           | `clamp(0.5rem, 1.4vw, 1.05rem)` | `clamp(0.5rem, 1.4vw, 1.05rem)` | 16.8px (the control — T1101's inert literals)                     |
  | `share-25` | `0.025`       | `0.25rem`                       | `2.5rem`                        | ≈10.7px (thinner than today)                                      |
  | `share-40` | `0.04`        | `0.25rem`                       | `2.5rem`                        | ≈16.9px (today's width on this one frame, proportional elsewhere) |
  | `share-60` | `0.06`        | `0.25rem`                       | `2.5rem`                        | ≈24.7px (wider); the 440px square inset ≈23.6px                   |

  Floor 4px and ceiling 40px are the plan's starting points; the gate may
  move them. At 4% the ceiling bites nowhere on the laptop (the held
  frame's 884px height gives 32.7px) and only the stage's tallest
  portrait on the DualUp reaches it; at 6% the stage and held frames
  sit on it (≈43–49px unclamped). The floor bites on the related strip
  (σ\* 96–120px → 2.4–4.8px) and on nothing else above the collapse.

## Failure messages and notes

No new build barrier. The two that exist cover this spec:

```
[check-no-dev-routes] no dev routes in dist/.
[check-no-gps] <n> images scanned in dist/ — no GPS metadata.
```

The transform's probe now runs for every block; its existing failure
`could not read image dimensions for <src> (<block> needs them)` can now
name any block. The draft fixture piece is never built (87 pages stay
87).

## Testing strategy

Every claim above is owned by a task and a check:

- **Every frame carries its ratio** — `remark-pieces-blocks.test.mjs`,
  **T1100**: for each of single (both forms), inset, wide, grid, aside,
  row, default diptych, weighted diptych, triptych, held, pause and the
  shorthand, the emitted anchor (or the bare `img` for `alt=""`) carries
  `style="--ar: <raw>"` with the fixture's true ratio to `trimNumber`'s
  four decimals; match="height" anchors keep the normalized `--ar` (the
  smallest 1) and the figure carries `--ar-sum` and `--n`; held and pause
  keep the raw `--ar` on the wrapper too; fullbleed, tall and strip
  carry it as well (one rule for every local frame; a remote or
  root-absolute src, or a render with no `file.path`, gets none and the
  CSS falls back to 1). Mutation-checked: drop the probe for a block →
  its case fails.

- **The mechanism is one rule, declared once, inert on landing** —
  `matte.test.mjs` (new, root; `place-page.test.mjs` is the pattern, its
  `blocks`/`declarations`/`indexOf` helpers copied, declarations
  whitespace-normalised because Prettier wraps long values), **T1101**
  (the stylesheet and the test; the three files that still read
  `--matte` switch at **T1101b**, which also deletes `--matte` and adds
  the "`--matte` appears nowhere under `src/` or in the transform" case):
  (a) `:root` declares the three tokens at T1101's literals; no other
  top-level or nested block in `global.css` and no file under `src/`
  outside `src/pages/dev/` declares `--mat-share`, `--mat-min` or
  `--mat-max` (grep in the test); no rule selecting
  `.gallery-grid > li > a.image-link` remains; (b) the form W rule's
  selector list and `--mat` string exact; the piece matted rule,
  `.gallery-flow > li > a.image-link` and `.image-frame` declare
  `padding: var(--mat)`; form R's three declarations, the
  `.related-flow` cap, form H's `--mat` and `max-width`, form V+H's
  `--mat`, `--frame-w`, `--frame-h` on `.piece-pause` and
  `--mat`/`max-height` on `.image-frame` / `.image-frame img`, form P's
  `--mat` and `--pair-gap` — each pinned as a string; the form P rule's
  index greater than the form W rule's (its (0,3,1) outranks (0,2,2)
  anyway, pinned for the reader); (c) the **geometry evaluator**: a
  ~25-line evaluator over the pinned strings (textual `var()`
  substitution from `:root`'s declarations plus per-case values,
  `calc(`→`(`, `clamp`/`min`/`max`→JS, units `px` `rem`(16) `vw` `vh`
  `svh` `vmin` `%`(the case's W) → numbers, then `Function`), run over
  ratios {0.5, 0.667, 0.8, 1, 1.5, 1.78, 3} × shares {0, 0.025, 0.04,
  0.06} × (floor, ceiling) {(0, 0), (8, 16.8), (4, 40)} × viewports
  {1512×982, 1280×1440, 375×812}: form W at W = 666 gives
  `m == clamp(F, s·σ, C)` with σ recomputed from `m` (the algebra);
  held: the figure's `max-width` from form H, form W at that width
  equals the figure's `--mat`, and the frame's height
  `(W − 2m)/ar + 2m == H` (fits exactly); pause and stage: `--mat`,
  `--frame-w`/the stage box, form W at the box width equals `--mat`,
  the box within both limits and tight on one; form R at growth g ∈
  {1, 1.2, 1.35}: image width `== --gallery-short × w × g` for every
  share (the mat never enters the photograph's width) and at g = 1.35
  equals the px in `galleryCell(image, short).sizes` — **the CSS/srcset
  agreement**; form P for n = 2, 3 over mixed ratio sets: every
  member's padding equal, heights equal, `m == clamp(F, s·h, C)`; and
  the **inert identity**: share 0, floor = ceiling = 16.8 → every form's
  `m == 16.8` and form R's basis `== short × w + 2 × 16.8`.
  Mutation-checked: change a `2 *` to `1 *` in any pinned string → (b)
  and (c) fail; swap `max` for `min` in form W → (c) fails at ratio 1.5.

- **The rendered geometry is unchanged at landing** — **T1101** and
  **T1101b**, on the dev server at 1512×982 and 375×812
  (`/pieces/vocabulary-sampler/`, `/galleries/every-ratio/`, `/places/`,
  one image page), with the same driver as spec 012's T1001: the
  computed `padding-top` of a single, an inset, a grid cell, a
  match-height member, the held anchor, the pause anchor, a gallery
  cell, a related thumbnail, a cover card span, the compare figure and
  the stage frame — every one 16.8px / 8px before and after each task
  (amended 2026-09-13 at T1101's review: within 1/60 px in Firefox on
  the frames whose padding now resolves through a percentage — the
  Known limitation below; a real regression is anything larger)
  (the before run recorded at the start of T1101, before editing, on the
  branch as T1100 left it — T1100 changes no geometry); the held figure's
  and pause frame's widths and the stage image's height identical
  before/after; the gallery page's built HTML identical once the
  stylesheet link is normalised
  (`sed -E 's#/_astro/[^"]+\.css#CSS#g' … | shasum`, the template is
  untouched); after T1101b the image page
  differs from T1100's build only by the `--ar` style attributes (diff
  recorded). Where the implementer cannot drive a browser it says so and
  the Phase 0 pause asks the person to attest those lines. Both runs are
  at share 0, so they prove the inert identity, not the forms: the
  forms' first browser exercise is T1103's, below.

- **The derived copies match the ground** — `ground.test.mjs` (new,
  root), **T1102**: an in-test oklch→sRGB conversion (OKLab → linear →
  gamma, ~30 lines) of `:root`'s `--color-bg` equals `COLOR.bg` in the OG
  route (parsed from the source) within ±2/255 per channel, and
  `public/og.jpg`'s pixel at (10, 10) (read with `sharp`, already a
  dependency) matches within ±3. If either fails at landing the copies
  already drift — reported, not loosened. Mutation-checked:
  `bg: '#f6f4f1'` → passes (tolerance), `'#f6f0f0'` → fails.

- **The sampler is dev-only, shows the four surfaces, and its candidates
  differ** — **T1103**: the barrier line green, `dist/dev` absent, the
  sitemap's `/dev/` count 0, `grep -rl matte-sampler dist/` empty (the
  draft ships no page, no appearance, no OG); the negative control (guard
  removed → the build fails naming `dist/dev/matte/…`, guard restored);
  on the dev server at 1512×982: `/dev/matte/` renders four sections;
  with the wrapper's tokens set to each candidate in turn (the driver
  calls `setProperty`, as the toolbar does), the fixture piece's 3:2
  single measures padding ≈0 / 16.8 / 10.7 / 16.9 / 24.7 and its inset
  (440px, the square export) ≈0 / 16.8 / 10.5 / 16.3 / 23.6 — the same
  frame smaller, so `share-40` reads thinner there than on the single;
  the gallery's cells one value per flow (≈13px at `share-40` on the
  laptop, ≈4.8 on the related strip); the stage frame's padding equals
  `min(V, H)` for its ratio; at `share-40` the **held** figure (the
  portrait) is height-bound at 1512×982 — its height equals
  `100svh − 2·hold-margin` (≈883.8px) and its anchor's computed padding
  equals the
  figure's computed `--mat` (form W meeting form H in a browser, the
  first time percentage padding inside a `max-width`-bound figure is
  exercised) — and the **pause** frame's computed `--frame-h` equals its
  measured height, its width ≤ `--avail-w` and height ≤ `--avail-h` with
  one tight within 0.5px; the ground buttons change `<html>`'s computed
  `background-color`; the fixture piece's page count and the REAL count
  (10) recorded.

- **Geometry after the gate** (AC 1–3, 6) — **T1104**, on the dev
  server at 1512×982, 1280×1440 and 375×812 on the shipped pages: each
  surface's padding matches the gate's decision (0 where off; where on,
  `clamp(F, share × σ, C)` from the measured σ within 0.5px — a 3:2
  single, a portrait single and an inset on `/pieces/vocabulary-sampler/`
  give three different values in that order of size); the held figure's
  height equals `100svh − 2·hold-margin` where it is height-bound and the
  pause frame's `--frame-h` equals its measured height; the stage
  photograph's height plus twice its padding equals the stage's inner
  height (or its width the content width) and the quiet view (toggle
  clicked) keeps the mat's colour `rgb(255, 255, 255)`; a gallery row's
  members share one short side within 0.5px at each viewport and one
  padding; `scrollWidth ≤ clientWidth` everywhere; 375: the floor holds
  on the related strip. Numbers recorded; unmeasured lines named for the
  Phase 1 pause on both screens.

- **The ground moved, or didn't** — **T1105**: mats anywhere →
  `git diff main -- src/pages/og/pieces/[slug].png.ts public/og.jpg`
  empty and `:root`'s five ground tokens unchanged (`page-head.test.mjs`
  and
  `ground.test.mjs` green); nowhere → `ground.test.mjs` green against the
  new hex and file, the token literals pinned in `matte.test.mjs`'s
  ground case, and `grep -c "0.968 0.006 95" src/styles/global.css` → 0
  except in the comment that records the history.

- **Untouched by construction** (the non-goals) — **T1104** and the
  sweep:
  `git diff main -- src/content.config.ts src/lib/images.ts src/lib/image-meta.mjs src/lib/image-set.ts src/lib/gallery-layout.ts obsidian-plugin/`
  empty; `gallery-layout.test.mjs`, `image-set.test.mjs`,
  `galleries.test.mjs`, `gps-barrier.test.mjs`, `place-page.test.mjs`
  green and unedited; the pause's lights rules and `--color-quiet`,
  `--pause-depth` unchanged (`git diff` of the lights block empty).

- Existing suites stay green (277 tests + the new files); build with both
  barriers; `astro check`; Prettier on the docs.

## File structure

```
src/styles/global.css                          the three tokens beside a transitional --matte (T1101); form W once, forms H, V+H, R, P on their elements; the stage's rules arrive (T1101), the dead .gallery-grid anchor rules go (T1101); --matte deleted (T1101b); the gate's values and per-surface presence (T1104); the ground (T1105)
remark-pieces-blocks.mjs                       the probe for every block and the shorthand; raw --ar on every frame; --ar-sum/--n on match="height" (T1100)
remark-pieces-blocks.test.mjs                  the ratio cases (T1100)
src/components/CoverCards.astro                --ar on the span; padding: var(--mat) (T1101b); presence (T1104)
src/components/LatestWork.astro                --ar and --avail-h on the anchor; form H over the band height (T1101b); presence (T1104)
src/pages/images/[...id].astro                 scoped stage rules deleted; --ar on .image-frame; the compare's decimal --ar and var(--mat) (T1101b); presence (T1104)
src/pages/og/pieces/[slug].png.ts, public/og.jpg   the ground's derived copies (T1105, nowhere branch only)
matte.test.mjs                                 tokens once; every form pinned; the geometry evaluator; the inert identity (new; T1101); no --matte anywhere (T1101b); the gate's literals (T1104)
ground.test.mjs                                the OG hex and og.jpg match --color-bg (new; T1102)
src/content/pieces/matte-sampler/index.md      the draft fixture piece on the real exports (new; T1103)
src/pages/dev/matte/[...surface].astro         the sampler (dev only, new; T1103)
README.md, AUTHORING.md                        the block table's Matted column; "never bake a matte" (T1106)
CLAUDE.md                                      the block-vocabulary bullet's "site-applied mattes", amended in its own commit on any branch where pieces go off (T1103a, before T1104)
ROADMAP.md, DECISIONS.md, design/brief.md (nowhere branch)   close-out (T1107, implementer-edited, orchestrator-committed)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`src/content.config.ts`, `src/lib/images.ts`, `src/lib/image-meta.mjs`,
`src/lib/image-set.ts`, `src/lib/gallery-layout.ts` and its test, the
gallery, place and index templates, the `.gallery-flow` packing (only
its mat term changes), the `<720px` collapses, the lights and quiet
rules and their tokens, the fixture places, `scripts/check-no-dev-routes.mjs`,
the Obsidian plugin.

## Known limitations

- **A packed row's mat follows the target short side, not the grown
  one** (form R, above): a stretched row's mat is `share/1.35`–`share`
  of its actual short side, and on a phone the one-per-row cell (343px
  wide, target 280) wears its mat at about 5% of the actual short side
  at a 4% share.
- **A matched-height pair wears one mat** — a share of the matched
  height, which for a portrait member is its long side; below the
  collapse the stacked members keep that (smaller) mat rather than the
  column frame's, the floor holding. The sampler's mixed pairs put both
  in front of the gate.
- **The shorthand image narrower than its column**
  (`width: fit-content`) gets a share of the column, since its
  containing block is the paragraph; exports at 2560px always fill the
  column.
- **A half-bleed's short side counts one mat, not two**, so its mat is
  off by `m/2` on the bled side's account — invisible.
- **The `sizes` hints are unchanged**: single's 680px, the pairs' and
  the pause's hints already over-deliver by the mat, so a smaller mat
  only widens the margin and a mat at the 40px ceiling widens the
  over-delivery (a match="height" pair at 40px mats delivers ≈37% over).
  The gallery's hint is exact by form R. None falls under.
- **The probe runs for every block**, reading each file once per render
  (`imageMetadata` over the whole buffer); the build time is recorded at
  T1100 and a header-only read is a follow-up if it ever matters.
- **Firefox floors a percentage-bearing padding to 1/60 px** (found at
  T1101, 2026-09-13): Gecko quantises lengths to 1/60 CSS px and
  truncates a `calc()` that carries a percentage, so form W — which must
  carry `100%` for the share — resolves today's 16.8px as 16.7833px on a
  666.4px column, one app unit low; the literal `16.8px` and form R (no
  percentage) resolve exactly. Invisible, and moot once the share is
  above 0 (the mat is then no round number); the landing checks at
  T1101, T1101b and T1103 read "identical" as within 1/60 px on those
  frames, in Firefox. Blink (1/64 px) and WebKit were not driven; the
  Phase 0 pause attests the rendered result.
- **The dev server caches `getStaticPaths`**: editing the sampler's
  candidate table needs a restart. The toolbar state lives in
  `sessionStorage`; a hard reload keeps it, a new tab starts at `today`
  on the warm ground.
- **The sampler's pause has no script**: its lights never dim; the frame
  and mat are what the gate judges. The quiet view is judged on the
  shipped image page at the Phase 1 pause, not in the sampler.

## Resolved decisions

- **Three tokens and one rule, resolved per geometry**, rather than a
  per-surface token: the spec's "one share, chosen once" is a
  single-source rule, and the per-form algebra is what lets one number
  drive frames whose CSS knows only their width, only their height, or
  both.
- **Raw `--ar` on every frame from the transform**, rather than
  container units or `attr()`: `cqmin` needs size containment (which
  breaks auto heights), typed `attr()` has not shipped in Firefox, and
  the probe already exists.
- **Today's mat is expressed by the tokens** (share 0, floor = ceiling)
  so the inert landing, the sampler's control and the "everything as
  today" branch are one mechanism — the reason form R keeps the mat as
  the row's constant term.
- **Form P's single mat per matched block** is a clamp-exactness
  necessity, not a look: with a mat per member (`clamp(F, s·h·q_i, C)`)
  the matched height `h` depends on which members sit at the floor or
  ceiling, and which do depends on `h` — the regime is decided by the
  answer, and CSS cannot branch on it inside one flex row. One mat for
  the block puts the whole clamp on a known expression,
  `s(W − G)/(A + 2ns)`, so the heights stay exact in every regime, as
  form H does for the held frame. (The person accepted both at sign-off, 2026-09-13;
  spec.md's Goal 2, its candidates requirement, and its second
  acceptance criterion now say so.)
- **The stage's rules move to `global.css`** so the sampler renders the
  real stage and the form lives with the others; the compare figure
  follows the stage's decision and `LatestWork` the packed rows' — both
  named as plan decisions, neither a candidate.
- **`--matte` survives T1101 as a transitional alias** at its literal,
  so the stylesheet and its test land under one review
  (`review: per-task`) while the three files that still read `--matte`
  stay inert, and T1101b switches them and deletes it: the page's scoped
  stage rules outrank `global.css`'s `.image-frame` until T1101b removes
  them, so the moved-in form V+H is shadowed, not doubled, in between.
- **A draft fixture piece on the borrowed exports**, not copies of the
  photographs and not the vocabulary sampler: spec 008's
  `../../gallery-images/<file>` shape exists for exactly this, a draft
  ships nothing, and the gate needs photographs, not placeholders.
- **The sampler switches, it does not stack candidates**: five copies of
  four surfaces is not a comparison; the ground was judged at spec 003
  by switching live, and a switch is what the spec asks for. The driver
  measures by setting the same properties the toolbar sets.
- **`ground.test.mjs` lands in Phase 0** whatever the gate does, because
  it is the check that the copies match today, and a drift found before
  the gate is a finding, not a surprise after it.
