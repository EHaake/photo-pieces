# Plan: The galleries overhaul

**Status**: Signed off (2026-09-07) — by the `skeptical-reviewer`; no
blocking findings, four non-blocking second-look notes folded in.
**Implements**: spec.md in this directory

## Shape of the change

Three moving parts, no schema and no template restructure: the packing
knobs grow from two numbers to three (an outer **width** and the **gap**
join the **density** that already lived in `gallery-layout.ts`), a new
CSS breakout lets a gallery's rows and a place's outings run wider than
the text column while every prose element keeps its reading measure, and
— for the first time on this site — about ten real camera exports go
into the fixtures so the gate judges photographs, not grey rectangles.
The width, gap, and density numbers are chosen at a visual gate from a
dev-only sampler and are **not** in this plan; the plan fixes the
mechanism, the fixtures, the sampler, and the standing tests, so nothing
is committed before the photographer names a set.

The mechanism is built **inert** (the width knob defaults to the content
width, the gap to its present value), exactly as spec 010 built its head
tokens at `.section`'s value: the galleries and places render
geometrically identically until the gate — within the scrollbar-width
overshoot the site's wide-block idiom already accepts, see Known
limitations — which is what lets the mechanism land, be exercised by
the sampler, and only then take values.

- **The knobs — one source, three numbers** (`src/lib/gallery-layout.ts`).
  Today the file exports `GALLERY_SHORT_PX` (280, density) and
  `GALLERY_STRETCH` (1.35, the row's grow cap) and emits them as
  `--gallery-short` / `--gallery-stretch` through `galleryFlowStyle`,
  and `galleryCell` derives each cell's srcset ceiling
  (`short × ratio × stretch`) and `sizes` from the same two numbers.
  This spec adds two knobs to the **same file**, so all the packing
  knobs stay in one place:

  ```ts
  /** The outer width the packed rows may run to (spec 011). CSS-only:
   *  the density, not this, sets the per-cell srcset ceiling, so a wider
   *  row never asks for a larger image. The gate's value (Phase 1). */
  export const GALLERY_WIDTH = 'var(--content-width)'; // inert default
  /** The gap between frames (spec 011). CSS-only. The gate's value. */
  export const GALLERY_GAP = 'calc(var(--baseline) * 0.75)'; // inert default
  ```

  `galleryFlowStyle` gains `--gallery-width: ${GALLERY_WIDTH}` and
  `--gallery-gap: ${GALLERY_GAP}` beside the two it already emits.
  `relatedFlowStyle` gains **neither** — the related strip keeps its
  present width (it never breaks out) and its present gap (a non-goal).
  `GALLERY_SHORT_PX` and `GALLERY_STRETCH` keep their names and their
  role: density is the one knob that drives both the CSS custom property
  and the srcset ceiling, and the contract test (T902) pins that. Width
  and gap are CSS-only knobs; the file is their home so a reviewer can
  point at one place, but they do not touch `galleryCell`.

- **The width breakout** (`src/styles/global.css`, beside `.gallery-flow`).
  The rows sit in a `.section` today (`width: min(--content-width,
  100% - page-pad*2)`), which is the column they feel penned in. The
  site already has an idiom for a block that runs wider than its column,
  viewport-centred: `.piece-block.width-wide`
  (`--w: min(var(--content-width), 96vw); width: var(--w);
  margin-inline: calc(50% - var(--w) / 2)`), with `body { overflow-x:
  clip }` absorbing the scrollbar overshoot of the `vw` unit. This spec
  reuses that idiom rather than inventing a transform:

  ```css
  /* The gallery's rows run to their own width, wider than the text
     column, centred on the viewport (spec 011). Above the collapse
     only; below it the flow stays in .section, one frame per row. The
     width is a knob (src/lib/gallery-layout.ts → --gallery-width); the
     min() caps a fixed or bleed candidate to the viewport, and body's
     overflow-x: clip absorbs the vw overshoot, as .piece-wide does. */
  @media (min-width: 720px) {
    .gallery-flow.gallery-wide {
      --gw: min(var(--gallery-width, var(--content-width)), calc(100vw - 2 * var(--page-pad)));
      width: var(--gw);
      margin-inline: calc(50% - var(--gw) / 2);
    }
  }
  ```

  and `.gallery-flow`'s existing `gap` literal becomes
  `gap: var(--gallery-gap, calc(var(--baseline) * 0.75))` — the fallback
  is today's value, so a `.gallery-flow` that sets no `--gallery-gap`
  (the related strip) is unchanged. Nothing else in the `.gallery-flow`
  rules moves: the `> li` basis/max-width (equal short sides,
  proportional grow, centred short rows, the mat in the basis) and the
  `<720px` collapse are **not touched** — the packing rule is unchanged,
  which the plan commits to and T904 measures.

  With the inert default the breakout is a no-op: `--gw` resolves to
  `min(content-width, 100vw - 2·page-pad)`, the same width `.section`
  computes, so `margin-inline` is ≈0 and the rows render where they do
  today (within the scrollbar-width overshoot the site's wide blocks
  already accept). The single candidate-agnostic knob expresses all
  three forms the spec names: a fixed wider width (`1440px` → capped to
  the viewport by the `min()`), a viewport-relative width (`92vw`), or a
  bleed (a large value → the `min()` lands on `100vw - 2·page-pad`).

- **Where the breakout is applied.** `galleries/[slug].astro` and
  `places/[slug].astro` add `gallery-wide` to their
  `<ul class="gallery-flow">` and keep `style={galleryFlowStyle}` (which
  now carries the two new custom properties). The place page's writing
  (`.prose` in its own `.section`), the gallery's description and lead,
  the outing titles and meta — every prose element — stay in their
  `.section` at the content/reading measure, untouched. The image page's
  related strip (`galleries/[slug]` never renders it; it lives in
  `src/pages/images/[...id].astro` as `<ul class="gallery-flow
  related-flow" style={relatedFlowStyle}>`) is **not** given
  `gallery-wide` and gets no `--gallery-*` overrides, so it keeps its
  width, its smaller short side, and its gap — the spec's non-goal, held
  by construction and checked by grep (T904).

- **The index card grids** (`galleries/index.astro`,
  `places/index.astro`). Their cards render through
  `CoverCards.astro`'s `.gallery-grid.gallery-cards` inside a `.section`
  at the content width. Whether they follow the pages to the wider width
  is the **gate's** decision (a design requirement): the sampler shows
  the card grids at the candidate width, and T903-drafted, T904 applies
  whatever the gate names — the same breakout knob on the index
  `.section`/`.gallery-grid`, or nothing if the gate keeps them boxed.
  No value is chosen here.

- **The real photographs** (`src/content/gallery-images/` and/or an
  existing piece's folder). About ten real exports, the photographer's
  to supply. No frontmatter, no sidecar, no schema change is required —
  the registry (`src/lib/images.ts`) already derives an id, a page, a
  wall label, and exposure metadata for every accepted raster in those
  folders. The registry reads EXIF through `readExposure`
  (`src/lib/exif.mjs`, `gps: false`, allowlist-filtered), so a real
  export's GPS never reaches a page; the post-build `dist/` scan
  (`scripts/check-no-gps.mjs`) is the barrier on the output. Real
  exports commonly carry GPS EXIF where every fixture to date has been
  synthetic — so the barrier proves itself on real files for the first
  time, and T900 records that at least one supplied file carries GPS
  when read naively (else the proof is hollow).

- **The sampler** (`src/pages/dev/galleries/[...candidate].astro`, a
  rest route, dev-only). It mirrors spec 010's page-head sampler exactly:
  `getStaticPaths()` returns `[]` unless `import.meta.env.DEV`, so
  `astro dev` serves it and `astro build` emits nothing under
  `dist/dev/`; the standing barrier (`scripts/check-no-dev-routes.mjs`,
  already in `postbuild`) fails the build if any dev route ships, and it
  already scans all of `dist/dev/`, so it covers this sampler with no
  change. **Note the isolated-scope gotcha spec 010 hit**: a
  module-level `const` is not visible inside `getStaticPaths` (Astro runs
  it in a separate scope), so the candidate list is declared inside
  `getStaticPaths` and handed to the component as a prop. The sampler
  builds a gallery-like set from the registry's real images
  (`getImageRegistry()` → the gallery-root images, which now include the
  new exports) and renders, for each candidate, a `.gallery-flow
  gallery-wide` at the candidate's `--gallery-width` / `--gallery-gap` /
  `--gallery-short` inline, plus the `.gallery-grid.gallery-cards` at the
  same width, each block labelled with its id and values, all in the
  site's real mats and ground (it consumes `global.css`). Paths in dev:
  `/dev/galleries/` (every candidate stacked, to scan on one screen) and
  `/dev/galleries/<id>/` (one candidate full-page, so a row's real size
  is honest on each screen).

- **The candidates the sampler shows.** Starting points for the gate to
  compare and adjust — **not** the chosen values; the gate may name a
  mix or a fourth set, each a few inline lines in the sampler:

  | id        | `--gallery-width`                  | `--gallery-gap`                | `--gallery-short` |
  | --------- | ---------------------------------- | ------------------------------ | ----------------- |
  | `current` | `var(--content-width)` (1160px)    | `calc(var(--baseline) * 0.75)` | `280px`           |
  | `wide`    | `1440px`                           | `1rem`                         | `320px`           |
  | `bleed`   | `calc(100vw - 2 * var(--page-pad))`| `calc(var(--baseline))`        | `360px`           |

  The three width rows are one of each form the design requirement names
  (fixed content width, a wider fixed width, a viewport bleed); the gap
  and density brackets sit either side of today's so the gate compares
  distinct proportions. The gate names the width, the gap, and the
  density independently, and whether the index card grids follow.

## Failure messages and notes

This spec adds no new build barrier. It relies on two that exist:

```
[check-no-gps] <n> images scanned in dist/ — no GPS metadata.
[check-no-dev-routes] no dev routes in dist/.
```

and their failure forms (a GPS leak names the file and its hit; a built
dev route names its paths). The sampler and the fixtures can fail
`astro build` only through the ordinary content-collection and registry
validation, which already name the offending file.

## Testing strategy

Every claim this plan makes about how the system behaves is owned by a
task and a check:

- **The single-source contract** — density drives both the CSS custom
  property and the srcset ceiling from one constant; width and gap live
  in `gallery-layout.ts` and reach the CSS as custom properties.
  `gallery-layout.test.mjs` (new; `image-set.test.mjs` is the pattern
  for a `.ts` import), owned by **T902**: (a) `galleryFlowStyle` emits
  `--gallery-short` at `${GALLERY_SHORT_PX}px`, `--gallery-stretch` at
  `${GALLERY_STRETCH}`, `--gallery-width` at `${GALLERY_WIDTH}`, and
  `--gallery-gap` at `${GALLERY_GAP}` — each pinned to the exported
  constant, not a literal, so a hardcoded divergence fails; (b) for a
  fixed image ratio, `galleryCell(image).sizes` contains
  `(min-width: 720px) ${Math.round(GALLERY_SHORT_PX * w * GALLERY_STRETCH)}px`
  and `.width` is `min(image.width, widest * 2)` — computed from the
  same constants, so changing `GALLERY_SHORT_PX` moves both the emitted
  property and the ceiling together; (c) `relatedFlowStyle` emits
  neither `--gallery-width` nor `--gallery-gap` (the strip does not
  widen or retune). Mutation-checked: change `GALLERY_SHORT_PX` and see
  both the emitted-property test and the srcset test fail; hardcode a
  literal short in `galleryFlowStyle` and see (a) fail alone.

- **The GPS barrier as a standing test** — closing spec 010's open note
  that `check-no-gps.mjs` has no test, and raising this spec's "green
  against real files" to instrumentation. `gps-barrier.test.mjs` (new;
  `page-head.test.mjs`'s `run(dir)` child-process helper is the
  pattern), owned by **T901**: run `scripts/check-no-gps.mjs` against a
  temporary directory (the barrier already takes an optional `[dir]`
  argument) — once holding a copy of `tests/fixtures/gps.jpg`, asserting
  a non-zero exit and the message naming the file and its GPS hit, and
  once holding a clean raster, asserting exit 0 and the "no GPS
  metadata" line. No `dist/` is touched. Mutation-checked: the barrier's
  GPS regex neutered → the leak case stops failing.

- **The barrier already covers the sampler.** `check-no-dev-routes.mjs`
  scans all of `dist/dev/` and `page-head.test.mjs` already guards its
  failure path as a child process; this sampler lives under
  `dist/dev/galleries/` and needs no new test. **T903** verifies the
  live facts: `astro dev` serves the routes, `astro build` emits nothing
  under `dist/dev/`, and the barrier line is green — and, once, the
  `DEV` guard removed as a negative control names `dist/dev/galleries/…`
  and fails the build, the guard restored.

- **The fixtures render and are clean** (**T900**): the build succeeds
  with the ~10 exports present; each has a `/images/<id>/` page with its
  wall label; a naive `exifr.parse` over the supplied files reports at
  least one carrying GPS (the proof has real work); the `dist/` GPS scan
  is green; the allowlist assertion in `exif.test.mjs` still holds.

- **The mechanism is inert before the gate** (**T902**): with the
  default knobs, a gallery page and a place page measured on the dev
  server at 1440×900, 1080×1920, and 375×812 render the `.gallery-flow`
  at the same width as before the change (at 1440 exactly the content
  width; at 1080/375 within the scrollbar-width overshoot, with no
  horizontal scrollbar — `documentElement.scrollWidth ≤ clientWidth`); a
  sample cell's rendered width and its `sizes`/`srcset` are unchanged;
  the related strip on an image page is unchanged; the prose measure on
  the place page and the gallery lead are unchanged. Recorded as
  numbers. (Built HTML is **not** byte-identical — the `style` attribute
  gains two custom properties and the `<ul>` gains a class — so the
  proof is geometric, not a hash.)

- **After the gate, the rows run wider and the prose does not**
  (**T904**): at 1440×900 and 1080×1920 the `.gallery-flow` on a gallery
  page and on a place page's outing measures the gate's width (wider
  than the content width they measured at T902, unless the gate kept
  `current`); the place's `.prose`, the gallery's lead, and a piece's
  body still measure their reading measure; the gap and the common short
  side are the gate's values (measured `gap`, and a landscape cell's
  rendered short side ≈ the gate's density); the srcset ceiling of a
  sample cell tracks the gate's density; below 720px the flow is one
  frame per row at the full width and the related strip keeps its width
  and its smaller short side; the index card grids match whatever the
  gate decided; no horizontal scrollbar at any test viewport. The
  packing rule is unchanged — a panorama and a portrait in one row land
  on the same short side (measured), and the `.gallery-flow > li` CSS is
  unedited (grep). All recorded as numbers.

- Existing suites stay green (the current count + the two new files);
  build with both barriers; `astro check`; Prettier.

## File structure

```
src/lib/gallery-layout.ts                     GALLERY_WIDTH, GALLERY_GAP; galleryFlowStyle emits both
gallery-layout.test.mjs                       the single-source contract (new)
gps-barrier.test.mjs                          check-no-gps failure path as a child process (new)
src/styles/global.css                         .gallery-flow gap → var; .gallery-wide breakout; card-grid width (T904, per gate)
src/pages/galleries/[slug].astro              class gallery-wide on the flow
src/pages/places/[slug].astro                 class gallery-wide on each outing's flow
src/pages/galleries/index.astro               card grid at the gate's width (T904, per gate)
src/pages/places/index.astro                  card grid at the gate's width (T904, per gate)
src/pages/dev/galleries/[...candidate].astro  the sampler (dev only, new)
src/content/gallery-images/ (and/or a piece)  ~10 real exports (owner-supplied)
README.md, ROADMAP.md, DECISIONS.md
```

Untouched and named so the reviewer can confirm the non-goals hold:
`src/lib/gallery-layout.ts`'s `RELATED_SHORT_PX` / `RELATED_NARROW_SHORT_PX`
/ `relatedFlowStyle` (the related strip), `src/lib/exif.mjs` and
`scripts/check-no-gps.mjs` (the GPS reader and barrier — proven, not
changed), the `.gallery-flow > li` packing rule and the `<720px`
collapse in `global.css`.

## Known limitations

- **The scrollbar overshoot of `vw`.** Between 720px and
  content-width+2·page-pad the breakout's `min()` lands on
  `100vw - 2·page-pad`, which on a persistent-scrollbar platform is a
  few px wider than the scrollbar-excluded column; `body { overflow-x:
  clip }` absorbs it, exactly as it does for `.piece-wide` and
  `.piece-fullbleed` today. The inertness check tolerates this band and
  asserts no horizontal scrollbar rather than pixel identity there.
- **The width does not feed the srcset.** A wider row packs more frames
  or grows each toward its cap, but each cell is still capped at
  `short × ratio × stretch`, so the per-cell ceiling tracks density, not
  width. This is correct — a wider page never fetches a larger image —
  but it means "the width knob is in the single source" is a
  bookkeeping fact, not a derivation the contract test can exercise; the
  test exercises density, which genuinely drives both.
- **The sampler builds its set from the registry's gallery-root
  images**, so what it shows depends on which exports the photographer
  supplied; a set too small to pack multiple rows would under-serve the
  gate. T903 notes the count it rendered.
- **The card-grid width is left open until the gate**, so the two index
  pages' final CSS is written at T904, not designed here.
- **The dev server caches `getStaticPaths`**: editing the sampler's
  candidates needs a restart, like any registry change.

## Resolved decisions

- **Reuse the site's wide/fullbleed breakout idiom**
  (`width: var(--gw); margin-inline: calc(50% - var(--gw)/2)`) rather
  than a transform: it is viewport-centred, the body already clips its
  overshoot, and one knob expresses all three width forms the spec
  names.
- **Width and gap join density in `gallery-layout.ts`**, even though
  only density drives the srcset, so all the packing knobs stay in one
  file and the reviewer has one place to point.
- **The breakout is a modifier class (`gallery-wide`)**, applied to the
  two page templates' flows and withheld from the related strip, so the
  non-goal (the strip stays put) holds by construction, not by a value.
- **The mechanism ships inert** (width = content width, gap = today's),
  so it lands and the sampler exercises the shipped mechanism before the
  gate commits a value — spec 010's pattern.
- **The sampler is a `DEV`-gated rest route behind the existing
  barrier**, its candidates declared inside `getStaticPaths` (the
  isolated-scope gotcha), kept after the gate as a dev-only fixture the
  next galleries pass can reuse.
- **The GPS barrier gets a standing child-process test**, closing spec
  010's note that it had none and making this spec's "green against real
  files" an instrumented guarantee, not a one-time grep.

## Gate outcome (format-aware density) — amendment, 2026-09-09

The Phase 0 visual gate (see `tasks.md`, "Gate record") chose the bleed
width and the baseline gap as this plan anticipated, but the density could
**not** be a single value the way this plan's "The knobs" section assumed.
The photographer's second screen is an **LG DualUp (16:18, ~2560×2880 —
nearly square, slightly taller than wide)**. A width-based term (`26vw`)
sizes off the viewport width, which is not the DualUp's large dimension, so
frames came out small and short rows centred in the margins there, while the
16:10 laptop looked right. No single width-based value can size the DualUp up
without oversizing the laptop (the laptop is always the wider viewport). The
gate's fix — folded into 011 at the photographer's direction — is a
**format-aware density** that sizes off `vmin` (the smaller viewport
dimension):

    --gallery-short: clamp(280px, 33vmin, 460px)

Measured: **324px** on the laptop (1512×982 — essentially the 320 the
photographer chose) and **417px** on a DualUp shape (1280×1440), where the
rows now fill the full width. `vmin` is the natural choice: a tall/square
screen's smaller dimension is still large, so it sizes up; a wide-short
laptop sizes to its (smaller) height, as before.

**How `gallery-layout.ts` changes** (T904):

- `GALLERY_SHORT_PX` becomes the clamp **ceiling** (`460`). It keeps its
  existing role: `galleryCell`'s srcset ceiling is still `short × ratio ×
  stretch` with `short` defaulting to `GALLERY_SHORT_PX`, so the srcset
  serves up to the largest the density can reach. The single-source contract
  the plan and T902 pinned is **preserved** — the density ceiling still
  drives both the CSS clamp and the srcset ceiling from one constant.
- A new **CSS-only** floor constant `GALLERY_SHORT_MIN_PX` (`280`) and the
  `33vmin` rate join the emission: `galleryFlowStyle` emits
  `clamp(${GALLERY_SHORT_MIN_PX}px, 33vmin, ${GALLERY_SHORT_PX}px)`. The
  floor and the rate are CSS-only, exactly like width and gap — they do not
  feed `galleryCell`, so a reviewer still has one number (the ceiling) behind
  both the CSS and the srcset. `gallery-layout.test.mjs`'s literal anchors
  move to the new values; the three mutation checks stay falsifiable.
- The `26vw`→`33vmin` change is **only** on the gallery flow
  (`galleryFlowStyle`). `relatedFlowStyle` (the image page's related strip)
  is untouched — a non-goal — and keeps its own width-based clamp.

**Other gate outcomes**: the **index card grids stay boxed** at the content
width — they do NOT follow the pages to the bleed width (the photographer's
call), so `galleries/index.astro` and `places/index.astro` are unchanged.
The sampler set was the ten real photographs only (Fixture-camera images
excluded), ratified.

**Verification note**: because the density is now format-aware, T904's probe
measures on **two screen formats** — a 16:10 laptop shape and a 16:18 DualUp
shape — and confirms the density resolves to ~324 on the former and sizes up
(~417, rows filling) on the latter, not a single value on one viewport.
