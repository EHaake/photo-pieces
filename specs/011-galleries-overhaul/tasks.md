# Tasks: The galleries overhaul

**Status**: Signed off (2026-09-07) — by the `skeptical-reviewer`; no
blocking findings, four non-blocking second-look notes folded in.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T900–T903) — reviewed as a phase, except
T900 (the real-photograph fixtures and the GPS barrier proven against
them) and T902 (the single-source knobs that the CSS, the srcset math,
Phase 1's values, and the gate all inherit), which carry
`review: per-task`. Phase 1 and Phase 2 are per-phase (Phase 2's review
is the pre-merge sweep). The Phase 0 pause is the visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy — this spec runs under the budget fallback, so the planner and
the sign-off ran at the implementation tier; the review invocations run at
the reviewer's default tier): the orchestrating session triages each
task and dispatches routine ones to the `sdd-implementer` on a task
bundle assembled with shell (the task line, the plan sections, the
acceptance criteria, the files, the pattern file to copy), telling it
not to read plan.md, spec.md, or tasks.md in full; for a `review:
per-task` task it re-runs the verification command itself and has the
`skeptical-reviewer` review the task from a staged, shell-assembled
bundle — one review and at most one re-review, anything still open
logged and left to the sweep; otherwise the implementer's verbatim
output is the verification and the reviewer checks the phase as a whole.
The sweep runs on the documents plus `git diff main...HEAD`. A fresh
orchestrator session starts each phase; the person is paused for after
each phase and whenever something unexpected bears on spec adherence.
Geometry is measured by the orchestrator with `javascript_tool` against
an emulated viewport (the in-app Browser pane's screenshots are blank
when scrolled; numbers, not pictures).

Task ids: 011 = T9xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T9xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the fixtures, the barrier's proof, the knobs, and the sampler (reviewer after the phase, T900 and T902 on their own; the gate at its end)

- [x] **T900** (`review: per-task`) — The real photographs, and the GPS
      barrier proven against them. The photographer supplies about ten
      real camera exports into `src/content/gallery-images/` and/or an
      existing published piece's folder (his to add; the orchestrator
      places whatever is provided). No frontmatter, no sidecar, no schema
      change — the registry derives an id, a page, and a wall label for
      each. _Verify: `sh scripts/verify.sh` green — the build indexes the
      new images, `astro check` clean, and `[check-no-gps] … no GPS
      metadata.` in the output; for each supplied export a `/images/<id>/`
      page renders on the dev server with its wall label
      (camera/lens/exposure where the EXIF carries it); a naive
      `node -e "import('exifr').then(m => m.default.parse('<file>')).then(o => console.log(Object.keys(o||{}).filter(k => /gps|latitude|longitude/i.test(k))))"`
      over the supplied files reports at least one with GPS keys; if
      none of the supplied exports carry GPS, the orchestrator adds one
      genuinely GPS-bearing real raster as an extra fixture, so the
      barrier is proven on a real file and the spec's "first time on
      real files" intent is met — T901's synthetic `gps.jpg` stays the
      standing falsifiable anchor either way; the `exif.test.mjs`
      allowlist assertions still green.
      The count of exports added and the naive-GPS result recorded here._
      _**Recorded:** 10 real exports added to `src/content/gallery-images/`
      (cozy-brook, latourelle-glow, latourelle-gold, lower-falls-spring,
      multnomah-gold, mystic-falls, rainbow-falls, those-fall-feelings,
      two-medicine-twilight, water-and-ice; Sony A7RIV/A7RV + Pentax K-1,
      full EXIF). Naive `exifr.parse` (no `gps:false`): mystic-falls carries
      GPS (GPSLatitude/Longitude/Altitude + latitude/longitude), the other
      nine clean — so the barrier is proven against a real GPS-bearing
      export, no extra fixture needed. `sh scripts/verify.sh` green:
      `BUILD EXIT 0` (87 pages, 16 indexed), `[check-no-gps] 766 images
      scanned in dist/ — no GPS metadata.`, `CHECK EXIT 0`,
      `TEST EXIT 0` (260 tests, 10 files — `exif.test.mjs` allowlist green).
      Each of the ten has a page at `dist/images/gallery/<basename>/`; wall
      labels populate (e.g. mystic-falls: PENTAX K-1, 15-30mm, f/5.6, 106 s,
      ISO 200) with zero GPS tokens on the GPS-bearing file's page.
      `skeptical-reviewer` signed off (per-task), no blocking findings._

- [x] **T901** — The GPS barrier as a standing test. `gps-barrier.test.mjs`
      (new; `page-head.test.mjs`'s `run(dir)` child-process helper is the
      pattern): run `scripts/check-no-gps.mjs` as a child process against
      a `mkdtemp` fixture directory — once containing a copy of
      `tests/fixtures/gps.jpg`, asserting a non-zero exit and stderr
      naming the file and a GPS hit, and once containing a clean raster
      (`tests/fixtures/photo.jpg`), asserting exit 0 and the "no GPS
      metadata" line. The barrier already takes an optional `[dir]`
      argument, so no `dist/` is touched. _Verify: `sh scripts/verify.sh`
      green with the two new tests; each mutation-checked and the test
      named that each fails, output recorded here — the barrier's GPS
      regex neutered (the leak case stops failing); the success wording
      changed (the clean case stops matching)._
      _**Recorded:** `gps-barrier.test.mjs` added at repo root (two tests,
      the `run(dir)` child-process idiom). `sh scripts/verify.sh` green:
      `BUILD EXIT 0`, `CHECK EXIT 0`, `TEST EXIT 0` — 11 test files, 262
      tests. Mutations (each reverted; `check-no-gps.mjs` unchanged at the
      end): (1) `EXIF_GPS`/`XMP_GPS` neutered to `/^\0NEVER/` → the leak
      test "a GPS-bearing image fails with a non-zero exit, naming the file
      and a GPS hit" fails (`expected +0 to be 1` — barrier reported gps.jpg
      clean, exit 0); (2) the success `console.log` wording changed to
      `— all clear.` → the clean test "a clean raster exits 0 and reports no
      GPS metadata" fails its `stdout` `toContain`. Note: the barrier prints
      "1 images scanned" (no pluralization), pinned in the clean assertion._

- [x] **T902** (`review: per-task`) — The three knobs in one source, and
      the width breakout, inert. `src/lib/gallery-layout.ts`: add
      `GALLERY_WIDTH` (`'var(--content-width)'`) and `GALLERY_GAP`
      (`'calc(var(--baseline) * 0.75)'`) with the plan's comments;
      `galleryFlowStyle` emits `--gallery-width` and `--gallery-gap`
      beside `--gallery-short` / `--gallery-stretch`; `relatedFlowStyle`
      emits neither. `src/styles/global.css`: `.gallery-flow`'s `gap`
      literal → `var(--gallery-gap, calc(var(--baseline) * 0.75))`; the
      `@media (min-width: 720px) { .gallery-flow.gallery-wide { … } }`
      breakout per the plan (`--gw: min(var(--gallery-width, …), calc(100vw - 2 * var(--page-pad)))`,
      `width`, `margin-inline`); the `.gallery-flow > li` packing rule
      and the `<720px` collapse untouched. `galleries/[slug].astro` and
      `places/[slug].astro`: add `gallery-wide` to the flow's class.
      `gallery-layout.test.mjs` (new; `image-set.test.mjs` is the pattern
      for a `.ts` import) per the plan's contract cases. _Verify (implementer):
      `sh scripts/verify.sh` green with the new suite; each contract test
      mutation-checked and named — `GALLERY_SHORT_PX` changed (both the
      emitted-property test and the srcset-ceiling test fail); a literal
      short hardcoded in `galleryFlowStyle` (the emitted-property test
      fails alone); `relatedFlowStyle` given a `--gallery-width` (the
      strip-does-not-widen test fails) — output recorded. Verify
      (orchestrator, re-running `sh scripts/verify.sh` first): on the dev
      server at 1440×900, 1080×1920, 375×812, a gallery page and a place
      page's outing render the `.gallery-flow` at the same width as
      before this task (at 1440 exactly `--content-width`; at 1080/375
      within the scrollbar-width overshoot, `documentElement.scrollWidth ≤
      clientWidth` on all three — no horizontal scrollbar); a sample
      cell's rendered width and its `sizes` unchanged; the image page's
      related strip unchanged (grep confirms it has no `gallery-wide` and
      no `--gallery-width`); the place's `.prose` and the gallery's lead
      at their reading measure, unchanged. Numbers recorded here._
      _**Recorded:** Four source edits (gallery-layout.ts adds `GALLERY_WIDTH`
      / `GALLERY_GAP`, `galleryFlowStyle` emits all four props, `relatedFlowStyle`
      neither; global.css gap→`var(--gallery-gap, …)` + the `@media (min-width:
      720px) .gallery-flow.gallery-wide` breakout, packing rule + `<720` collapse
      unedited; `gallery-wide` added to the gallery and place flows). New
      `gallery-layout.test.mjs` (root). Implementer + orchestrator both ran
      `sh scripts/verify.sh` green: `BUILD/CHECK/TEST EXIT 0`, 12 files, 265
      tests. Mutations (reverted): (1) `GALLERY_SHORT_PX` 280→300 fails both
      data tests (density anchor `280px`; srcset `567px→608px`); (2) a divergent
      `260px` literal in `galleryFlowStyle` fails the emitted test alone; (3)
      `relatedFlowStyle` given `--gallery-width` fails the strip test. Geometry
      (javascript_tool, emulated): gallery `/galleries/every-ratio/`
      `.gallery-flow.gallery-wide` — 1440: **1160 = --content-width** exactly,
      gap 18px, cell `sizes (min-width: 720px) 1134px, 94vw` (unchanged); 1080:
      1001 = section width; 375: 343 = full width, one frame per row; no
      h-scroll at any (scrollWidth ≤ clientWidth). Place `/places/the-headlands/`
      @1440: outing flow 1160, gap 18px, `.prose` 666 (reading measure). Lead
      732. Related strip: grep confirms no `gallery-wide`/`--gallery-*`,
      `images/[...id].astro` untouched; `.gallery-flow > li` unedited.
      `skeptical-reviewer` signed off (per-task), no blocking findings — two
      non-blocking notes, both pre-resolved (AC3 density-only is the plan's
      Known-limitations decision, recorded at T906; root test placement is the
      repo convention)._

- [x] **T903** — The sampler (dev-only).
      `src/pages/dev/galleries/[...candidate].astro`
      (`src/pages/dev/page-head/[...candidate].astro` is the pattern):
      `getStaticPaths()` returns `[]` unless `import.meta.env.DEV`; the
      candidate list declared **inside** `getStaticPaths` and passed as a
      prop (the isolated-scope gotcha); the candidates the plan's table
      names (`current` / `wide` / `bleed`). It builds a gallery-like set
      from `getImageRegistry()`'s gallery-root images (the new exports
      included) and renders, per candidate, a `.gallery-flow gallery-wide`
      and a `.gallery-grid gallery-cards`, each at the candidate's
      `--gallery-width` / `--gallery-gap` / `--gallery-short` set inline
      on a wrapper, each labelled with its id and values, in the site's
      real mats and ground. Paths in dev: `/dev/galleries/` (all
      candidates stacked) and `/dev/galleries/<id>/` (one candidate
      full-page). _Verify: `sh scripts/verify.sh` green with
      `[check-no-dev-routes] no dev routes in dist/.` in its output;
      `test ! -e dist/dev && echo absent`; `grep -c "/dev/"
      dist/sitemap-0.xml` → 0; no build-log line naming `dev/galleries`;
      the temporary negative control — the `DEV` guard removed, `npm run
      build` fails at the barrier with the first message naming
      `dist/dev/galleries/…`, its output recorded and the guard restored.
      Then on the dev server: `/dev/galleries/` and each
      `/dev/galleries/<id>/` render the real photographs packed and the
      card grid at the candidate's width, labelled; the count of real
      images the set drew on recorded here (enough to pack several rows)._
      _**Recorded:** `src/pages/dev/galleries/[...candidate].astro` (new,
      DEV-gated). `sh scripts/verify.sh` green (12 files, 265 tests),
      `[check-no-dev-routes] no dev routes in dist/.`; `dist/dev` absent;
      `grep -c "/dev/" dist/sitemap-0.xml` → 0; no build-log `dev/galleries`
      line. Negative control (guard removed): `npm run build` fails at the
      barrier — `[check-no-dev-routes] dist/dev/ exists … dist/dev/galleries/
      bleed/index.html, …/current/…, …/index.html, …/wide/…` (exit 1); guard
      restored, re-verified green. Dev-server render (1440×900): stacked
      `/dev/galleries/` shows 3 flows + 3 grids, **10 real cells each**, the
      candidates rendering distinctly — flow/grid widths 1160 / 1361 / 1361
      (card grids follow), gaps 18 / 16 / 24px, short 280 / 320 / 360px; each
      `/dev/galleries/<id>/` full-page clean (bleed 32→1393 within 1425, no
      h-scroll). **Set = the 10 real exports** (Fixture-camera images excluded;
      fallback not triggered)._
      _**Orchestrator-applied fixes** (the implementer passed verify + the
      negative control but did not render; the render surfaced these, fixed
      directly — SendMessage to the subagent was unavailable): (1) the
      candidate's four custom properties now ride on the flow itself, not a
      wrapper `galleryFlowStyle` shadowed (all three candidates had rendered at
      the inert values — this traced to a wrong inheritance claim in the
      orchestrator's own bundle); (2) the REAL predicate excludes any
      `/^Fixture/i` camera, dropping dock-b (sidecar camera `Fixture FX-2
      (override)`) so the set is the 10 real exports; (3) `.sampler-cards` uses
      the flow's viewport-centring breakout idiom, ending a wide/bleed
      horizontal overshoot. Phase-reviewed (per-phase, with T901); signed off,
      no blocking findings._
      _**Deviation (to ratify at the gate):** the sampler draws its set from the
      real photographs, not the plan's literal "the registry's gallery-root
      images" — the root now mixes 10 real exports with ~28 synthetic
      placeholders and the gate judges real photographs (spec Goal 4/5)._

### Gate record (Phase 0 pause, 2026-09-09)

Chosen by looking on the 16:10 laptop and the **LG DualUp (16:18,
~2560×2880 — nearly square, slightly taller than wide)**, from the
`/dev/galleries/` sampler, on the ten real photographs:

- **Width**: bleed — `--gallery-width: calc(100vw - 2 * var(--page-pad))`.
- **Gap**: `--gallery-gap: calc(var(--baseline))` — one full baseline (24px),
  wider than the previous default (baseline × 0.75 = 18px).
- **Density**: **format-aware** — `--gallery-short: clamp(280px, 33vmin, 460px)`.
  A single-value density could not serve both screens: a width-based term
  (`26vw`) can't size up the DualUp because width is not its large dimension.
  `vmin` (the smaller viewport dimension) holds the laptop near its chosen 320
  (measured **324** at 1512×982) and sizes the tall/square DualUp up on its own
  (measured **417** at a 1280×1440 shape, with the rows now filling the full
  width). `GALLERY_SHORT_PX` becomes the clamp **ceiling (460)** — it still
  feeds the srcset ceiling; the **floor (280)** and the **`33vmin` rate** are
  CSS-only, like width and gap. This is a gate-driven amendment to the plan's
  density mechanism, folded into 011 at the photographer's direction
  (2026-09-09) — see plan.md, "Gate outcome (format-aware density)".
- **Index card grids**: **stay boxed** at the content width — they do NOT
  follow the pages to the bleed width (the photographer's call).
  `galleries/index.astro` and `places/index.astro` are left unchanged.
- **Sampler set**: the real photographs only (Fixture-camera images excluded)
  — ratified.

The format-aware density stays *within* the three-knob mechanism (the ceiling
still drives the srcset; the floor and `vmin` rate are CSS-only additions to
the density knob), so it is not the "per-screen width" kind of change that
would go back as a spec question — it is the density knob, done to serve both
of the photographer's real screens (spec Goal 5).

## Phase 1 — The chosen values and the docs (reviewer after the phase; the person's pause at its end)

<!-- T904 is the load-bearing visible change (all three knobs, both index
card grids, the geometric checks for ACs 2–5) under per-phase review, not
per-task. That is the right set — T900 and T902 are the contracts later
tasks inherit — but the phase review must treat T904's recorded numbers
as the substance of the review, not a formality (sign-off note 4). -->


- [x] **T904** — The gate's values (format-aware density).
      `src/lib/gallery-layout.ts`: `GALLERY_WIDTH` →
      `'calc(100vw - 2 * var(--page-pad))'`; `GALLERY_GAP` →
      `'calc(var(--baseline))'`; `GALLERY_SHORT_PX` → `460` (the density
      clamp **ceiling**, which still feeds the srcset ceiling); add a
      **CSS-only** floor constant `GALLERY_SHORT_MIN_PX` = `280` and use the
      `33vmin` rate so `galleryFlowStyle` emits
      `--gallery-short: clamp(${GALLERY_SHORT_MIN_PX}px, 33vmin, ${GALLERY_SHORT_PX}px)`
      (format-aware — `vmin`, not `vw`; the DualUp reason and the gate date
      in a comment). `galleryCell` is unchanged in shape — its `short`
      default is still `GALLERY_SHORT_PX` (now 460), so the srcset ceiling
      tracks the clamp ceiling. Update `gallery-layout.test.mjs`'s literal
      anchors to the new values (the emitted `--gallery-short` clamp string;
      the srcset ceiling recomputed from 460) — keep all three mutation
      checks falsifiable. **The index card grids stay boxed**:
      `galleries/index.astro`, `places/index.astro`, and the
      `.gallery-grid`/card CSS are **left unchanged** (the gate's call). The
      dev sampler stays as gate history (dev-only); `current` no longer
      previews the shipped values, which is fine. `relatedFlowStyle` and the
      `.gallery-flow > li` packing rule and the `<720` collapse are untouched.
      _Verify: `sh scripts/verify.sh` green; the orchestrator's probe on a
      **16:10 laptop shape (1512×982)** and a **DualUp shape (1280×1440,
      16:18)** — a gallery page and a place page's outing render the
      `.gallery-flow` at the bleed width; the measured `gap` = 24px; the
      density resolves to ~**324** on the laptop and sizes **up** on the
      DualUp shape (~**417**, rows filling the full width) — format-awareness
      confirmed on both formats; a sample cell's `sizes` ceiling tracks 460;
      the place's `.prose`, the gallery's lead, and a piece's body still
      measure their reading measure (equal to T902); at 375×812 the flow is
      one frame per row at the full width; the image page's related strip
      keeps its width and its smaller short side (measured, equal to T902 —
      `relatedFlowStyle` unchanged); the index card grids are still boxed at
      the content width (unchanged); no horizontal scrollbar
      (`documentElement.scrollWidth ≤ clientWidth`) at any tested viewport; a
      row holding a panorama and a portrait lands them on the same short side
      (measured) and the `.gallery-flow > li` rule is unedited (grep) — the
      packing rule unchanged. Every number recorded here._
      _**Recorded:** Two files changed — `gallery-layout.ts` (`GALLERY_SHORT_PX`
      = 460 ceiling, new CSS-only `GALLERY_SHORT_MIN_PX` = 280, `GALLERY_WIDTH`
      = `calc(100vw - 2 * var(--page-pad))`, `GALLERY_GAP` = `calc(var(--baseline))`,
      `galleryFlowStyle` emits `--gallery-short: clamp(280px, 33vmin, 460px)`)
      and `gallery-layout.test.mjs` (anchors moved; srcset 567→**932**, width
      1134→**1864**). `global.css`, the templates, and the index pages
      untouched (grep/diff). `sh scripts/verify.sh` green (12 files, 265 tests);
      three mutations re-proven falsifiable (GALLERY_SHORT_PX 460→480 fails both
      data tests; a divergent literal in the clamp fails the emitted test alone;
      `relatedFlowStyle` given `--gallery-width` fails the strip test). Geometry
      (javascript_tool), gallery `/galleries/every-ratio/` + place
      `/places/the-headlands/`:_
      - _**Laptop 1512×982 (16:10):** gallery flow **1433** (bleed); gap **24px**;
        density resolves to **324** (≈ the chosen 320); lead **852** (reading
        measure, ≪ flow); no h-scroll (scrollW 1497 = clientW 1497)._
      - _**DualUp 1280×1440 (16:18):** gallery flow **1201** (bleed); gap 24px;
        density resolves to **417** — it **sizes up** on the tall/square format;
        lead 842 / place `.prose` **666** (reading measure); place outing flow
        **1201** at density **417**; no h-scroll. (Some `every-ratio` rows centre
        rather than fill — the unchanged packing rule for those extreme
        placeholder ratios; the ten real photographs pack fuller, per the
        sampler.)_
      - _**Phone 375×812:** one frame per row at the full width (343); no
        h-scroll._
      - _Related strip: `relatedFlowStyle` and `images/[...id].astro` unchanged
        (diff); `.gallery-flow > li` packing rule and the `<720` collapse
        unedited (global.css diff empty). Index card grids still boxed
        (index pages unchanged)._

- [x] **T905** — Docs: `README.md`. The galleries description says the
      packed rows on a gallery page and a place page's outings run wider
      than the text column, to a width chosen at a visual gate on the
      photographer's two screens, while all prose keeps its reading
      measure; that `gallery-layout.ts` holds the width, gap, and density
      knobs, density driving both the CSS and the srcset math; that the
      related strip is unchanged; and the structure listing gains
      `src/pages/dev/galleries/` as a dev-only fixture the build refuses
      to emit. _Verify: every claim read against the built pages and the
      gate record by the orchestrator; `npx prettier --check README.md`
      clean (note: Prettier does not enforce README's hand-wrapped prose
      width — check over-long lines by eye); `sh scripts/verify.sh`
      green._
      _**Recorded:** README updated in three places — the gallery-page
      paragraph (rows run wider to a viewport bleed chosen at the gate; prose
      keeps its reading measure; the format-aware `vmin` density sizes up on a
      tall/near-square display like the 16:18 DualUp; the related strip left as
      it was), the `gallery-layout.ts` tree comment (bleed width, gap,
      format-aware density; density also drives the srcset/sizes; related
      strip's knobs unchanged), and the `pages/dev/` tree comment (gains the
      gallery sampler). Claims read against the built pages measured at T904.
      `npx prettier --check README.md` clean; `sh scripts/verify.sh` green (12
      files, 265 tests)._

- [x] **T905b** — Places pulled from spec 011 (product owner, 2026-09-10).
      At the Phase 1 pause Erik tried the widened place page and decided the
      place-page treatment (the outing label against a bleed band; per-piece
      bands vs. one seamless gallery with the pieces listed below) wants its
      own design pass, larger than this spec's width/gap/density scope. So the
      place page is **reverted to pre-011** and deferred to its own spec.
      `src/pages/places/[slug].astro`: `gallery-wide` removed from the outing
      flow (no breakout → content width), and the page decoupled from the
      galleries' retuned `galleryFlowStyle` — a local `placeFlowStyle`
      (`clamp(200px, 26vw, 280px)`, stretch 1.35, no `--gallery-width`/`-gap`)
      plus `galleryCell(image, 280)`, so it renders IDENTICALLY to `main`
      (measured: content width 1160, density 280, gap 18px, srcset ceiling
      567). `gallery-layout.ts` unchanged (galleryCell already took a `short`
      arg); galleries, the registry, the GPS barrier, and the sampler are
      untouched. Docs reconciled: `spec.md` head amendment (supersedes Goal 3
      and the place clauses — 011 ships galleries only), `plan.md` amendment,
      `README.md` (no longer claims place outings run wider). T904's and T905's
      records above describe the place geometry as it was BEFORE this revert;
      this task supersedes their place lines. `ROADMAP.md`/`DECISIONS.md` get
      the deferral and the place-page follow-up spec at T906. _Verify:
      `sh scripts/verify.sh` green (12 files, 265 tests); the place template's
      only diff from `main` is `placeFlowStyle` + the `galleryCell` short arg
      (a decoupling that reproduces `main`'s render), grep-confirmed no
      `gallery-wide` on the place flow._

## Phase 2 — Close-out (the docs, the reviewer sweep, then merge)

- [ ] **T906** — `ROADMAP.md`: strike "A galleries overhaul" and, for the
      gallery surfaces this spec covers, "Real photographs as fixtures,
      before more design" (real exports now judge the packing, the width,
      the gap, and the density); add the follow-ups the plan and the gate
      raise (the mats, the warm ground, and the quiet dark left for a
      later spec if the real photographs reveal a problem there — the
      spec's non-goal; the related strip left at its width; the reading
      typography pass unchanged; the external-store and page-weight-budget
      items noted, not triggered, by the added exports' weight). `DECISIONS.md`:
      a spec 011 section — the width/gap/density chosen at a sampler gate
      on both screens, the way spec 010's head sampler worked; the
      wide/fullbleed breakout idiom reused for the gallery width and why
      (viewport-centred, body already clips the `vw` overshoot, one knob
      for all three width forms); width and gap kept in `gallery-layout.ts`
      beside density for one-source bookkeeping though only density (and
      the stretch cap) feeds the srcset — AC3's "srcset ceilings track the
      new width and density" is read as density (and stretch), never
      width, since a wider page must never fetch a larger image, the
      approved spec.md left unedited (the spec 010 precedent for an
      imprecise AC); the GPS barrier given a standing child-process test and
      proven against real exports for the first time; whether the index
      card grids follow the pages (the gate's outcome). Both ride this
      spec branch and merge with the PR, so the sweep's diff against
      `main` contains them. Then the pre-merge whole-spec sweep at the
      reviewer's default tier and its findings resolved; the spec's
      acceptance criteria checked against their records (the sampler's
      absence from `dist/` by T903's and the final build's barrier line;
      the GPS scan green against the real exports); build, tests, check,
      GPS scan, dev-routes scan, and format green with actual output; the
      PR marked ready and merged with a merge commit. _Verify: main green
      after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the fifth spec under the model policy)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare against spec 010's totals:
implementer 399,793 over 11 dispatches; reviewer 461,195 all tiers
(333,958 at the default tier over 5 invocations, 127,237 at the top tier
over 2 sign-off passes); planner 139,477 (one dispatch, top tier).
Spec 011 runs under the budget fallback: the planner and the sign-off
run at the implementation tier, the override dropped. -->

| Task / invocation              | Tier                | Tokens             | Outcome / miss reason |
| ------------------------------ | ------------------- | ------------------ | --------------------- |
| Planning: draft (`sdd-planner`)| implementation (fallback) | 148,300 | drafted first pass |
| Sign-off: plan/tasks (`skeptical-reviewer`) | implementation (fallback) | 48,861 | signed off; 4 non-blocking notes folded in |
| T900 review (`skeptical-reviewer`) | reviewer default (opus) | 26,687 | signed off; no blocking findings |
| T901 impl (`sdd-implementer`) | implementation (opus) | 27,990 | green; both mutations confirmed, barrier reverted |
| T902 impl (`sdd-implementer`) | implementation (opus) | 38,253 | green; 3 mutations confirmed, inert |
| T902 review (`skeptical-reviewer`) | reviewer default (opus) | 33,020 | signed off; 2 non-blocking notes, both pre-resolved |
| T903 impl (`sdd-implementer`) | implementation (opus) | 56,893 | verify+neg-control green; render surfaced 3 defects (fixed by orchestrator) |
| Phase 0 review (`skeptical-reviewer`) | reviewer default (opus) | 39,368 | signed off (T901+T903); no blocking; 2 notes carried below |
| T904 impl (`sdd-implementer`) | implementation (opus) | 35,898 | green; format-aware density; 3 mutations re-proven |
| T905 impl (`sdd-implementer`) | implementation (opus) | 19,768 | README updated; prettier + verify green |
| Phase 1 review (`skeptical-reviewer`) | reviewer default (opus) | 34,485 | signed off (T904+T905); no blocking; 2 notes carried below |
| Pre-merge sweep (`skeptical-reviewer`) | reviewer default (opus) | 113,297 | signed off; no blocking; docs/code consistent post place-split |

_(T905b — places pulled — and T906's ROADMAP/DECISIONS were orchestrator-run
doc work, no subagent dispatch.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- _T901 (from the Phase 0 review):_ `gps-barrier.test.mjs`'s
  `expect(stderr).toContain('GPS')` is satisfied by the barrier's header line
  ("… carry GPS metadata:"), which is present for any leak — so that third
  assertion is redundant with `status === 1` and does not bite on a
  GPS-specific hit. The test remains falsifiable (status + the named file, and
  the implementer's mutation record confirms neutering the regex flips it), so
  this is polish, not a gap. Candidate fix at the sweep: assert on a `hits`
  token (`exif:GPS` / `xmp:GPS`) instead.
- _T903 (from the Phase 0 review), for the gate, not a code note:_ `wide`
  (`1440px`, capped to the viewport) and `bleed` (`100vw − 2·page-pad`) render
  at the **same width** on any screen ≤ ~1500px wide, diverging only above
  that; they still differ in gap and short side. Surfaced to the product owner
  at the gate so the width comparison happens where the two actually differ (or
  a distinct fixed width is named).
- _T904 (from the Phase 1 review):_ `GALLERY_WIDTH` is now literally
  `calc(100vw - 2 * var(--page-pad))`, the same expression `global.css`'s
  breakout uses to cap `--gw`, so `min(var(--gallery-width), calc(100vw - 2 *
  var(--page-pad)))` is currently `min(X, X)` — a no-op that still protects a
  future wider-than-viewport width. Harmless; the page-pad breakout math now
  lives in two spots. No change made (global.css out of scope in Phase 1).
- _AC5 (index grids boxed) — confirmed by construction:_ the Phase 1 diff
  carries no `galleries/index.astro` / `places/index.astro` / `.gallery-grid`
  changes, so the card grids stay boxed as the gate decided.

**Totals (at the merge).** Everything ran at opus this spec — the budget
fallback kept the planner and the plan/tasks sign-off off the top tier, and
the implementer and reviewer run at opus by default, so **no top-tier (fable)
tokens were spent.**

- **Planner:** 148,300 (one dispatch, fallback opus). Spec 010: 139,477.
- **Sign-off (plan/tasks):** 48,861 (fallback opus).
- **Implementer:** 178,802 over 5 dispatches (T901 27,990; T902 38,253; T903
  56,893; T904 35,898; T905 19,768), all verified first try, no escape hatch.
  Spec 010: 399,793 over 11 — this spec had fewer, smaller tasks.
- **Reviewer:** 246,857 over 5 invocations, all at the default tier (T900
  26,687; T902 33,020; Phase 0 39,368; Phase 1 34,485; sweep 113,297) — the
  sweep alone was ~46% of that, reading six docs in full after the mid-spec
  place-split. Spec 010: 461,195 all tiers.
- **Tier misses:** none. Third tier: off.

Note the mid-spec scope change: the **place page was pulled from 011** at the
Phase 1 pause (product owner) and deferred to its own spec — spec 011 shipped
the galleries only. Two gate-driven amendments (format-aware `vmin` density;
places deferred) were folded in and recorded in spec.md/plan.md rather than
re-planned.

## Handoff note

**Nothing is implemented yet.** The next session begins at **T900**
(Phase 0) as the orchestrator under the model policy, running under the
budget fallback (the planner and the sign-off ran at the implementation tier;
review invocations run at the reviewer's default tier, no top-tier
override). **The real photographs are the photographer's to supply** —
T900 cannot complete until about ten real exports are in
`src/content/gallery-images/` and/or a published piece's folder; the
orchestrator places whatever he provides and proves the GPS barrier
against them. The **Phase 0 pause is the visual gate**: the sampler's
URLs (`/dev/galleries/` and `/dev/galleries/<id>/`) and the candidate
sets go to him on both screens, and he names the width, the gap, the
density, and whether the index card grids follow — the values are not in
the plan.

> Read `CLAUDE.md` and `specs/011-galleries-overhaul/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy: triage; dispatch each routine task to the
> `sdd-implementer` on a task bundle assembled with shell (the task line,
> the plan sections, the acceptance criteria, the files, the pattern
> file, any recorded finding or gate value), telling it not to read
> plan.md, spec.md, or tasks.md in full; verify with `sh scripts/verify.sh`
> only — re-run by you for T900 and T902 (`review: per-task`), taken from
> the implementer's verbatim output otherwise; run the geometry checks
> with `javascript_tool` and record numbers; stage, then bundle the diff
> for the `skeptical-reviewer` (T900 and T902 on their own; each phase as
> a whole), one review and at most one re-review per invocation, the rest
> logged; commit, check the box, log the tier and tokens. Involvement
> level is product owner: pause after each phase — the Phase 0 pause is
> the gate, and its report carries the sampler's URLs and the candidate
> sets — and whenever something unexpected bears on spec adherence, and
> start a fresh session for the next phase.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
