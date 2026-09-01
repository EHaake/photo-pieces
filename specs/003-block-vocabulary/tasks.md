# Tasks: Block Vocabulary

**Status**: Draft — pending review
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with an actual build and test run reported,
not summarized. Review cadence: stop after each phase. The existing
18-test contract suite must stay green through every task — no
weakening tests to pass.

---

## Phase 0 — Foundations

- [x] **T201** — Amend CLAUDE.md's closed-vocabulary enumeration to
      the 003 set (constitution rule: own commit, before
      implementation). _Verify: the enumeration matches spec.md's
      vocabulary exactly._
- [x] **T202** — Refactor the transform to the block-descriptor model
      with behavior identical for the existing vocabulary: same
      output, same errors (sequence keeps its bespoke reserved
      message), plus closed attribute validation (unknown attribute
      → named offender + allowed set; `{#id .class}` rejected; enum
      values checked) and textDirective attribute re-serialization.
      _Verify: existing 18 tests green unchanged; new validation
      tests; build green._
- [x] **T203** — Container/caption core: inline-level body partition,
      `<figcaption>` emission with inline markdown, directive-label
      fail-loudly (both forms), no-nesting body scan; `single`'s
      directive form (leaf + captioned container) as the proving
      block; global `image.layout: 'constrained'` in astro.config
      (check the remaining `<Image>` components for interaction).
      _Verify: tests for partition edge cases (consecutive lines,
      same-line images, blank-line separation, caption without blank
      line, mixed paragraph, label, nesting); shorthand single now
      emits srcset in built output; build green._

## Phase 1 — Standalone treatments

- [x] **T204** — `wide` (+ `bleed` attribute), `inset`, `tall`:
      transform entries, CSS (including the width-override form that
      can never stretch or crop), sizes per the table with the shared
      720px breakpoint constant commented at both ends. _Verify:
      tests per block (happy, caption, fails); built-output srcset
      spot-checks; build green._
- [x] **T205** — diptych/triptych upgrades: midline-centered default
      (`align-items: center`), async metadata probe via
      `astro/assets/utils` `imageMetadata`, `match="height"` with
      ratio normalization + `var(--ar, 1)` fallback, `weight`
      (diptych), `weight`+`match` contradiction fails. _Verify:
      orientation-6 EXIF fixture test proves the swap; `--ar` asserted
      via `__ASTRO_IMAGE_` markers; style-passthrough to rendered
      output verified once against dist; build green._

## Phase 2 — Multi-image and prose blocks

- [x] **T206** — `grid` (2–6 body images + trailing caption) and
      `strip` (band height, native scroll + snap CSS, probe-derived
      per-image sizes). _Verify: partition tests incl. count
      validation; built output optimized for body-sourced images;
      build green._
- [x] **T207** — `aside` (unwrap splice, float CSS, `.prose::after`
      clearfix, mobile float-none) and `row` (wrapped grid, mobile
      stack). _Verify: unwrap structure asserted in tests;
      aside-as-last-block contained (browser check vs the footer);
      build green._

## Phase 3 — Mattes

- [x] **T208** — `--matte` / `--color-matte` tokens; application map
      (matted: single both forms, inset, wide, diptych, triptych,
      grid, aside, row; unmatted: fullbleed, tall, strip; half-bleed
      column-side only); shorthand-single rule (`.prose > p > img`);
      figcaption inside the matte field. _Verify: browser check of
      the presence/absence map; retuning each token is a one-line
      change demonstrated; build green._

## Phase 4 — Demo content and full verification

- [x] **T209** — Placeholder-image generation script (varied ratios:
      3:2, 2:3, ~3:1 pano, square, 4:5); the reference sampler piece
      (every treatment, both forms, all attributes, captions); two
      essay-style demo pieces using the vocabulary naturally; edit
      `specs/005-going-live/spec.md`'s unpublish criterion to list
      all three fixtures. _Verify: build green; full browser geometry
      pass (midline centering, equal heights measured equal, aside
      wrap, strip scroll, collapse at 720px, centered-column contract
      for fullbleed/wide/half-bleed/strip, matte map); screenshots
      delivered for the photographer's reading-experience review._

- [x] **T209R** — Sampler-review amendments (photographer's feedback):
      `width="wide|fullbleed"` on diptych/triptych (breakout math
      shared with wide/fullbleed; combines with match and weight;
      fullbleed-width pairs unmatted; sizes scaled per variant), and
      mattes moved from the container to **each image** — every frame
      its own mat, gutters show the page, captions sit below the mats.
      _Verify: 79 tests green; browser-measured — per-image mats,
      match-height still exact with mats (flex basis floor), wide pair
      spans 1160px centered, fullbleed pair spans the viewport,
      mobile stacking intact; build green._

- [x] **T209G** — Ground-tone retune (sampler review): four candidates
      compared live; "gallery warm" chosen (bg 0.968/95 with
      surface/soft/line in step; mat edge rejected as noisy). OG hexes
      and public/og.jpg resynced; brief and DECISIONS record it.
      _Verify: build green; mats legible on the new ground; hairlines
      and code surfaces checked in the browser._

## Phase 5 — Authoring side and docs

- [ ] **T210** — Obsidian plugin: leaf-form rendering for all
      standalone blocks (shared multi-image widget), anchored regex
      (`m` flag), README build instructions replacing the phantom
      `main.js` path, alt-no-longer-rendered-as-caption. _Verify:
      `tsc -noEmit` + esbuild build green; behavior summary reported
      for the photographer's hand-check in Obsidian._
- [ ] **T211** — Docs: README syntax table (name, forms, attributes,
      captions, matte, Obsidian honesty); AUTHORING.md (grid/strip
      body syntax, no-nesting, no baked mattes, mid-paragraph
      correction); DECISIONS.md (plugin approximations; breadth-first
      reversal); ROADMAP.md (vocabulary entry + plugin claims);
      jetty piece's stale closing line. _Verify: build green; grep
      finds no doc claiming the old vocabulary state._

---

## Handoff note

> Read CLAUDE.md and specs/003-block-vocabulary/spec.md, plan.md,
> tasks.md, then begin at the first unchecked task. Stop for review
> after each phase. The sampler review at the end of Phase 4 is the
> photographer's visual/reading gate — expect knob-tuning feedback
> (matte width/color, tall cap, strip band height) before Phase 5.
