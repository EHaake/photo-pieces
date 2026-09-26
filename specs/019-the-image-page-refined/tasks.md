# Tasks: The image page, refined

**Status**: Signed off (2026-09-24) by the `skeptical-reviewer` at the top tier — three blocking findings fixed and re-reviewed (the slider's segments indexed from the right, the borrowed-stage rule tested both ways, the sidecar clause corrected in the amendment), nine notes folded in; the re-review's non-blocking lines are in tasks.md's tier log.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1700–T1703) — the constitution amended
first, in its own commit; the private-file family as pure rules with
the compare's shared shape beside them; the registry reading stages and
the detail export, with the fixtures that exercise both; and the
private-files barrier that makes "a detail export is named nowhere but
its loupe", "no page ships a script-only state" and "every compare has
the one shape" facts of every build
— so the block, the page's section and the loupe are built on rules
that are already tested and a barrier that already runs.
**T1705 is marked `review: per-task`**: the transform's `compare` is
the markup every later task reads — the stylesheet, the enhancement
script, the image page's section (which must build the same shape), the
barrier's state list and the plugin — so a wrong nesting, a stage image
left inside a frame host, or a private-file rule loosened beyond the
compare is what they would all inherit. Every other task is reviewed
with its phase; Phase 5's review is the pre-merge sweep. The pauses
after Phases 1, 2 and 4 are where the person tunes, over as many rounds
as it takes.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy's Fable profile and its role table — the session on
`claude-fable-5-1` at medium effort; the planner at the implementation
tier with no override, on trial; the plan/tasks sign-off and any
decision review at the top tier with an explicit override; the
`sdd-implementer` and the `skeptical-reviewer`'s per-task, per-phase
reviews and sweep at their definitions' `opus`; close-out the one
implementer dispatch at the top tier, `sdd-implementer-fable`): the
orchestrating session triages each task and dispatches routine ones to
the `sdd-implementer` on a task bundle assembled with shell (the task
line, the plan sections it names, the acceptance criteria, the files,
the pattern file to copy, any recorded value), telling it not to read
plan.md, spec.md or tasks.md in full; the implementer's verbatim
`sh scripts/verify.sh` output is the verification, re-run by the
orchestrator for T1705; the reviewer checks each phase as a whole from
a staged, shell-assembled bundle — one review and at most one
re-review, anything still open logged and left to the sweep. A design
question the session cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle, never
resolved in the session; a product question goes to the person. The
orchestrator never does device or browser checks by hand: the
implementer measures in the browser (Firefox 156 headless via BiDi,
spec 015's recipe) and records the numbers here, and what it cannot
measure the person attests at the pause on his two screens (the 16:10
laptop, 1512×982 at 2×, and the LG DualUp, 1280×1440 at 2×), with a
mouse, a trackpad and a phone. **The tuning envelope** (spec.md): a
round at a pause is one sub-lettered task under that phase's look task
(T1709, T1713, T1717) — the value set in its one place as plan.md's
"The tuning envelope, placed" names it, the matching row of its test
updated, one line in spec.md's Decided section, `sh scripts/verify.sh`
green — dispatched as routine and reviewed with the phase against the
outcome the spec records. A round that wants what the envelope sends to
the ordinary path (a fourth method, a second block, the private-file
rule widened further, the loupe elsewhere, a dependency, tiles, the
wall label beyond its two values) stops and goes to the person as a
spec amendment. One implementation session runs the whole spec: a phase
pause is a pause in it — the person attests and says continue — not a
session boundary; the person is paused for after each phase whose
header names something to try, and whenever something unexpected bears
on spec adherence. If the person stops at a pause, the report ends with
the continuation prompt for a fresh session (`/compact` if the context
grows large; never mid-task).

Task ids: 019 = T17xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T17xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the constitution, the private-file family, the registry, the barrier (reviewer after the phase; walkthrough: none — the new private files have no page and the sidecar's stages are read but not yet shown; the one visible difference is the sampler's `land-b` gaining the existing two-frame compare from its new fixture frame, which is spec 006's behaviour, not something new to try; the barrier moves nothing; runs on without a pause)

- [x] **T1700** — The constitution, amended before any code, in its own
      commit. Pattern: plan.md's "The constitution, first" — the four
      edits verbatim. `CLAUDE.md` only: the Architecture paragraph's
      sidecar phrase ("frontmatter-only" out; "an optional sidecar
      (`_<basename>.md`) whose frontmatter overrides it and whose body is
      the photograph's story (spec 006), and from spec 019 whose
      `stages:` declare its processing" in), the block-vocabulary clause's
      list ("as of spec 019: … and one interactive block, compare …"),
      the `sequence` sentence replaced by its retirement, the
      interactive-block sentence ("an _interactive_ block — `compare`,
      and any after it — is built as …, and without script its content
      stands as plain figures"), and the Images paragraph's private-file
      sentences. Hand-edited; no rewrap of neighbouring lines.
      _Verify: `grep -n "as of spec 019" CLAUDE.md` → 1 line;
      `grep -n "sequence" CLAUDE.md` → the retirement sentence only;
      `grep -n "_<basename>.detail" CLAUDE.md` → 1 line;
      `grep -n "carousel/slider" CLAUDE.md` → 0;
      `grep -n "frontmatter-only" CLAUDE.md` → 0 matches;
      `grep -n "declare its processing" CLAUDE.md` → 1; `git diff --stat` →
      `CLAUDE.md` alone; `npx prettier --check CLAUDE.md` clean;
      `sh scripts/verify.sh tests` green (nothing under test changes —
      the run is the record). The orchestrator commits this task alone,
      before T1701 is dispatched._

- [x] **T1701** — The private-file family and the compare's shared
      shape, as pure rules. Pattern: `sectionsFor`, `validateGalleries`
      and `passageFor` in `src/lib/image-meta.mjs` for the functions'
      shape and comment voice; image-meta.test.mjs's describes for the
      tests. Plan: "The private-file family". `src/lib/image-meta.mjs`:
      `DETAIL_WORD = 'detail'`; `privateRole(basename, publicBasenames)`
      (frame first, then the last-dot split, then orphan);
      `privateTargetOf` widened (strip `_`, then a trailing `.<word>` —
      messages only; say so in its comment); `privateMessage`'s sentence
      and `validateGalleries`' private line naming the family;
      `attachPrivates(privates, basenamesByFolder)`;
      `resolveStages(listed, own, where)` with the four `stages` problem lines
      from plan.md's "Failure messages"; `COMPARE_MODES`,
      `COMPARE_CLASSES`, `COMPARE_WIDTHS`, `COMPARE_WIDTH`,
      `compareSizes(width)`; `compareStages(…, words)`;
      `hasBlock(text, name)` over `splitBlocks`/`blockName`;
      `firstAltFor` skipping references inside a `:::compare` container;
      `sectionsFor`'s `compareShown`. Tests in image-meta.test.mjs, one
      describe "the private-file family (T1701, spec 019)" and cases
      added to the sections, alt and passage describes, each case named
      for what fails it — plan.md's Testing strategy, first bullet, in
      full. An existing assertion on the old private-message wording is
      updated to the new sentence, never loosened to a fragment; each
      one is listed in the report. _Verify: `sh scripts/verify.sh`
      green (the count recorded; the message change reaches the
      transform's tests); the two mutations in plan.md's first testing
      bullet named and reverted, the tree restored byte-identically._

- [x] **T1702** — The registry reads the family; the schema's `stages`;
      the fixtures. Pattern: `src/lib/images.ts`'s camera's-frame loop
      and its orphan-sidecar collection (the all-at-once throw);
      `src/content.config.ts`'s `imageMeta` field comments;
      `scripts/gen-placeholders.mjs`'s `FRAMES` and `flat` option. Plan:
      "The registry". `content.config.ts`: `stages` as plan.md spells
      it, with a comment (spec 019: the steps between the camera's frame
      and the finished photograph, each a private file beside it; the
      frame and the photograph are implied, never listed).
      `images.ts`: the frame loop replaced by `attachPrivates`; per
      sidecar, `resolveStages` over the photograph's own stage files,
      problems collected across sidecars and thrown once under
      `[images] stages:`; `SiteImage` gains `stages`, `detail`,
      `storyHasCompare` with doc comments in the interface's voice.
      `gen-placeholders.mjs`: `FRAMES` → `PRIVATES` (the `frames`
      target kept), a `{ tones: true }` option (half the `flat`
      treatment), and four entries — `where-the-fog-lets-go/_land-b.tones.jpg`
      1800×1200, `where-the-fog-lets-go/_land-b.detail.jpg` 5400×3600,
      `vocabulary-sampler/_land-b.jpg` (the fog frame's twin), each with
      `TRAFALGAR_GPS` — and `tests/fixtures/_photo.tones.jpg` in
      `FIXTURES`; run the `frames` and `fixtures` targets; only the new
      files may appear in `git status` (an existing fixture whose bytes
      changed is restored and the new file written alone).
      `where-the-fog-lets-go/_land-b.md`: `stages:` with one entry —
      `_land-b.tones.jpg`, label `Tones`, note "Shadows lifted on the
      ridge, the fog's highlights held. _Fixture stage._" _Verify:
      `sh scripts/verify.sh` green, the page count unchanged; the byte
      size of each new fixture recorded (`_land-b.detail.jpg` above all:
      a flat field may compress to almost nothing); `node -e`
      with `exifr.gps` over the three new site fixtures → each carries
      GPS (so the barrier and the GPS scan are proving something);
      temporary edits, each built and reverted, the build's tail
      pasted: a `_ghost.tones.jpg` beside nothing → the orphan line; a
      `_land-b.detail.png` beside the jpg → the second-detail line;
      `_land-b.jpg` listed in the sidecar's `stages` → the frame line;
      `git diff main -- 'src/pages/images/[...id].astro'` empty (the
      page is T1706's)._

- [x] **T1703** — The private-files barrier. Pattern:
      `scripts/check-motion.mjs` (the dir argument, stripping `<script>`
      and `<style>` before the markup scan, `[name]` lines, `exit 1`
      naming files, one summary line) and `gps-barrier.test.mjs` (temp
      dirs, `execFileSync`, the outcomes). Plan: "The private-files
      barrier" and its failure lines. New `scripts/check-private-files.mjs [dir]`
      with the three scans, `MAX_BYTES = 25 * 1024 * 1024` with a
      comment naming its source; scan 3's expected shape from
      `COMPARE_CLASSES` (imported from `src/lib/image-meta.mjs`), read by
      a small tag-depth walk, with the temporary skip for a `.compare`
      holding `.compare-range` (spec 006's, until T1706) and a comment
      saying T1706 deletes it; the header comment says what each scan
      proves and why scan 1 reads declared URLs rather than emitted
      names.
      `package.json` `postbuild`: `&& node scripts/check-private-files.mjs`
      after `check-no-gps`; `scripts/verify.sh`'s summary grep gains
      `|\[check-private-files\]`. New `private-files.test.mjs`: every
      case in plan.md's third testing bullet, scans 1 to 3. Check Cloudflare's
      Workers static-assets per-file limit in its documentation and
      record the figure and the page here; if it cannot be checked,
      record that and keep 25 MiB. _Verify: `sh scripts/verify.sh`
      green with the barrier's line among the summary lines (quoted: 0
      detail exports until T1710, the page count in its last clause);
      `node scripts/check-private-files.mjs dist` → exit 0 alone;
      `grep -n "check-private-files" package.json scripts/verify.sh` →
      the two lines; mutation, reverted: `data-js` written on the stage
      figure in `[...id].astro` → the build's barrier names an image
      page and `BUILD EXIT` is non-zero (the tail pasted)._

## Phase 1 — The label and the compare (reviewer after the phase; `review: per-task` on T1705; walkthrough: under `npm run dev`, on both screens with a mouse and a trackpad, and on a phone — the ten real photographs' image pages (the gallery-root exports, reached from the galleries) read `Sony α7R V`, `Sony FE 16-35mm f/2.8 GM II`, `Tamron 50-400mm f/4.5-6.3 Di III VC VXD`, `Pentax K-1` and the rest where the camera's strings were, and `dock-b` still prints its own sidecar names; on `/images/where-the-fog-lets-go/land-b/`, "Raw to finished" shows the photograph with a divider and a round handle at its centre, the legend Camera · Tones · Finished beneath it with the showing pair marked, and the note of the step beneath; drag the handle across with the mouse, the trackpad and a finger, and with the arrow keys once it has focus — at the right edge the camera's frame fills the box, at the left edge the finished photograph, and Tones shows as one half of a pair in between; "Side by side" puts two neighbouring stages next to each other, the legend choosing which, and on the phone they stack; "Switch" shows one stage whole and a click, a tap, Space, Enter or → brings the next in with a quick fade, the legend and the note following; `/images/vocabulary-sampler/land-b/` shows two stages, Camera and Finished, as the page did before; the fog piece's closing compare opens in Switch, and a method chosen on the image page is the one it opens in for the rest of the visit; with script off the stages stand stacked with their labels and notes; as many rounds as it takes, each a sub-lettered task under T1709)

- [x] **T1704** — Gear names. Pattern: `parseImagePath`'s error style
      and `formatExposure`/`formatCamera` in `image-meta.mjs`;
      `images.ts`'s `console.warn` notes (`[places] note:`) for the
      warning's voice; `exif.test.mjs` for reading real files under
      Vitest. Plan: "Gear names". New `src/content/gear.md` in the
      plan's shape: the paragraph, `## Cameras` (`ILCE-7RM4`,
      `ILCE-7RM5`, `ILCE-7M5`, `PENTAX K-1`, then the fixture line under
      an HTML comment "fixtures — the placeholder images' invented
      strings"), `## Lenses` (the six Decided lenses, then the fixture
      lens) — every display name exactly as spec.md's Decided section
      spells it. New `src/lib/gear.mjs`: `GEAR_FILE`, `EMPTY_GEAR`,
      `parseGearTable(text, file)`, `unknownGear(entries, gear)`, a
      header comment (the file, the line format, that a malformed table
      fails the build and an unknown string warns). `image-meta.mjs`:
      `formatExposure(raw, gear = EMPTY_GEAR)` looking up as plan.md
      says. `images.ts`: the table read once in `buildRegistry`, the raw
      tags kept beside each published image's exposure read, the
      `[gear]` warnings after the images are built. `scripts/verify.sh`:
      `\[gear\]` in the flagged-lines grep. New `gear.test.mjs`: plan.md's
      "Gear names" testing bullet in full, the Decided table as a
      literal in the test. _Verify: `sh scripts/verify.sh` green (the
      count recorded) and no `[gear]` line in its output; the build log
      carries no warning about `src/content/gear.md` (a file in the
      content folder that belongs to no collection — a claim, read
      here); mutation, reverted: the `ILCE-7RM4` line deleted → the repo
      case fails naming a file **and** `npm run build` prints exactly
      one `[gear]` line for it (pasted); a built image page for an
      `ILCE-7RM5` frame greps `Sony α7R V` and `Sony FE 16-35mm f/2.8 GM II`
      (the page named); `dist/images/gallery/dock-b/index.html` still
      carries the sidecar's camera and lens._

- [x] **T1705** — The `compare` block in the transform. `review: per-task`.
      Pattern: the `grid` and `strip` descriptors, `partitionBody`, and
      the `scroll` structure's branch in `remark-pieces-blocks.mjs`;
      remark-pieces-blocks.test.mjs's render helper and its failure
      cases (file and line asserted). Plan: "The block", its failure
      lines, and T1705's testing bullet. The descriptor as plan.md
      spells it (`COMPARE_MODES`, `compareSizes(COMPARE_WIDTH.piece)`
      imported from image-meta.mjs); `partitionStages(children, fail)`;
      a `structure: 'compare'` branch building the nesting with
      `COMPARE_CLASSES` (`pieceWrap` nodes for the frames, stage, pane
      and caption; the label and note as `pieceWrap` spans), the root's
      class `piece-block piece-compare compare compare-w-${COMPARE_WIDTH.piece}`,
      the last stage's raw `--ar`, `data-mode` only when written; the
      stage src rule (shape, then private-must-be-local, then
      existence), no `rejectPrivateSrc` and no link for a stage,
      `pieceFrame` on each stage image; `rejectPrivateSrc`'s hint
      widened. The header comment's descriptor list gains `stages` and
      the `compare` structure; the spec-004 exceptions paragraph gains
      "a compare's stages (a device, not frames)". `image-meta.mjs`:
      `BLOCK_BODIES.compare = 'stages'` in the same commit as the
      descriptor (the agreement case compares the two tables, so neither
      may land alone); image-meta.test.mjs's "the passage by body kind"
      kinds list gains `stages` — a deliberate addition — with a
      `passageFor` case that a compare contributes no caption. Tests:
      T1705's testing bullet in full, the borrowing pair among them —
      `../beta/photo.jpg` as a stage renders (a public photograph,
      spec 008's path) and `../beta/_photo.jpg` fails with the
      borrowed-private line though the file exists (AC 6 as narrowed:
      only a borrowed _private_ stage fails). _Verify:
      `sh scripts/verify.sh` green (count recorded) — re-run by the
      orchestrator before committing; the mutation named and reverted;
      `grep -n "rejectPrivateSrc(" remark-pieces-blocks.mjs` → the block
      loop's and the shorthand pass's calls, and none on the compare
      path._

- [x] **T1706** — The block's static form on both surfaces; the image
      page's section built as the block; the fog piece's compare.
      Pattern: the page's current `sec-compare` section and its scoped
      `.compare*` rules (what moves and what goes); `.piece-wide` in
      `global.css` for the breakout; `.piece-block figcaption` for the
      note's style; the record's `recordRows`. Plan: "The block on the
      image page". `src/pages/images/[...id].astro`: `WORDING.compare`
      as plan.md gives it; the section from `compareStages(image,
      WORDING.compare)`, every class through `COMPARE_CLASSES`, the
      width class from `COMPARE_WIDTH.page`, `sizes` from
      `compareSizes`; `recordRows` drops processing when
      `shows('compare')`; the scoped `.compare*` rules and their comment
      deleted. `src/styles/global.css`: a new `/* ---- The compare
      (spec 019) ---- */` section before the Motion section, header
      comment (the block's static form — stacked figures, labels,
      notes — is the no-script page, the enhanced rules follow at T1708;
      the class names are `COMPARE_CLASSES`, spelled twice because CSS
      cannot import, pinned by compare.test.mjs), the static rules and
      the three width classes. `where-the-fog-lets-go/index.md`: after
      the closing fullbleed, one sentence of fixture prose and
      `:::compare{mode="switch"}` with `_land-b.jpg`, `_land-b.tones.jpg`
      and `land-b.jpg`, labels Camera, Tones, Finished, a fixture note
      each. `scripts/check-private-files.mjs`: the spec-006 skip
      (one block, cutting the old compare from scans 2 and 3 — Phase 0
      review) deleted, and its `private-files.test.mjs` case turned from exit 0
      to exit 1. `src/lib/compare.ts` is not touched: spec 006's
      `enhanceCompare` finds no `.compare-range` in the new markup and
      `continue`s past every figure, so it does nothing until T1708
      replaces it — read, not assumed (below). New `compare.test.mjs`,
      describe "(a) one shape, spelled once": plan.md's T1706 source
      pins. _Verify: `sh scripts/verify.sh`
      green (count recorded) with the barrier's line counting the
      site's compares in one shape; in the browser on `land-b` and the
      fog piece, the console holds no error and every compare stands
      stacked; the built-page reads in plan.md's T1706
      bullet, each greped and quoted (land-b three stages, the
      sampler's two, `port-a` none, the fog piece's `data-mode`, no
      Processing row on land-b); the temporary story compare → section
      absent, reverted; `git diff -U0 main -- src/styles/global.css | grep '^@@'`
      → hunks only in the new section (listed)._

- [x] **T1707** — The compare's state, pure. Pattern:
      `src/lib/image-set.ts` for a small typed module; motion.test.mjs's
      `EXPECTED` table and its header comment's voice. Plan: "The
      compare's state". `src/lib/compare.ts`: `COMPARE`,
      `COMPARE_WORDING`, `COMPARE_MODE_KEY` and the pure functions
      exactly as plan.md names them, each with a one-line comment;
      `enhanceCompare` untouched in this task. `compare.test.mjs`:
      `EXPECTED` (every `COMPARE` key and value, and `COMPARE_WORDING`)
      at the top of the file with the comment "to retune, move the value
      in src/lib/compare.ts and here"; describe "(d) the state" with
      T1707's testing bullet in full. _Verify: `sh scripts/verify.sh`
      green (count recorded); a mutation, reverted: `restAt` changed in
      `compare.ts` alone → the `EXPECTED` case fails naming it._

- [x] **T1708** — The compare, enhanced. Pattern: the current
      `enhanceCompare` and its comment (kept: why it runs at module
      evaluation and at `astro:before-swap`), `BaseLayout.astro`'s two
      calls (unchanged), spec 018's T1604c Verify for the swap read.
      Plan: "The compare, enhanced". `src/lib/compare.ts`:
      `enhanceCompare(scope)` rewritten to build the chrome and run the
      three views on T1707's functions, the pointer, key and click
      handling, the module-level `resize` listener, the stored choice
      per `COMPARE.remember`, `data-settling` only when
      `!reducedMotion()` (imported from `./motion`), `data-fresh` on
      every mode change; the comment extended with what the static HTML
      is and what the script adds. The calls stay where they are — the
      layout's module evaluation and `astro:before-swap` on the new
      document, the last moment before the snapshot and the router's
      scroll; `astro:after-swap` is only where the Verify reads the
      result — and the `resize` listener is bound once at module
      evaluation. `src/pages/images/[...id].astro`'s
      `keydown`: return for a target inside `.compare`, beside the
      input guard. `global.css`: `:root` gains `--compare-handle: 2.75rem;`
      and `--compare-handle-radius: 50%;` after the motion tokens under
      their own comment (the compare's handle, spec 019; compare.test.mjs
      pins them — to retune, move the value here and in `TOKENS`); the
      compare section gains the enhanced rules, the `@property --split`
      block, and the three motion rules exactly as plan.md spells them.
      `compare.test.mjs`: describes "(b) the handle's tokens" and "(c)
      the compare's motion" per T1708's testing bullet. _Verify:
      `sh scripts/verify.sh` green (count recorded) with the motion and
      private-files barriers' lines; motion.test.mjs, matte.test.mjs
      green unedited; the browser reads in plan.md's T1708 bullet at
      1512×982 and 1280×1440, each number recorded here (the handle's
      rect against the divider's, `--split` and the parts at the three
      synthesised positions, `aria-valuenow` after ←, the side panes'
      widths and `data-narrow` at 480px, the switch's animation name and
      duration and the parts sequence, the stored mode across a
      navigation, the swap read against a full load, the empty
      `FRAME_IMG` query); `git diff -U0 main -- src/styles/global.css | grep '^@@'`
      listed. Where the headless run cannot synthesise a touch drag or
      a pinch it says so line by line, and the pause asks the person._

      **T1708 browser record (Firefox 156 headless via BiDi, preview
      build at 4e6d229; identical at 1512×982 and 1280×1440 except
      positions):** load: data-js, view slider, control Slider chosen,
      legend Camera·Tones·Finished, handle a tabindex-0 slider, note
      aria-live polite, captions display none, 0 animations, FRAME_IMG
      over the compare empty. Rest: split 50, parts left/right/off,
      valuenow 50, valuetext "Camera | Tones". Handle 44×44 (2.75rem)
      centred on the 1px divider and on the frames (666.40×444.27):
      1512 → cx 748.5 cy 491.28; 1280 → cx 632.5 cy 719.72; fill
      oklch(0.99 0.003 100) (--color-bg), radius 50%, no shadow. Drags
      at 25/50/75 → 25.01 / 50.08 / 74.99, parts off,left,right at 25
      ("Tones | Finished"), left,right,off at 50. ← from 74.99 → 72.99
      (step 2), focus stays; Home 0, End 100, PageDown 90. Side: fresh,
      three motion-appear 180ms on the panes, sessionStorage
      compare-mode=side; panes 327.2×218.13, gap 12.8 (1512: left 415
      and 755; 1280: 299 and 639); legend buttons Camera+Tones chosen;
      picking Finished → off,left,right. Switch: on,off,off, note
      Camera; click → during under,in,off (in-stage motion-appear
      180ms) → off,on,off; Space → off,off,on; Enter → on,off,off; →
      then ← as expected; the path never changes. Stored mode: the fog
      piece (authored switch) opens in side after the page chose it;
      fresh openings: piece switch, page slider. Swap from fog-frames:
      at astro:after-swap data-js, slider, compare 504 / frames 444,
      equal to a full load; a drag after the swap → 25.01. No script
      (sandboxed iframe): no chrome, three stacked stages, captions
      shown. Touch-type pointer drag 20→60% → 59.98. 480px: data-narrow,
      frames 433, side panes stacked (both 433 wide); back up: narrow
      off, 666, still side, split 50. Nothing in the list unmeasured.

- [ ] **T1709** — The first look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 1
      pause, in the person's words, with T1704–T1708's numbers beside
      it. The questions the spec puts to him here, in plain language:
      the gear names as they read; the handle (size, shape); the legend
      and the method control (words, placement; whether the corner tags
      come back); the slider across three stages — as built, the first
      stage whole at the right edge and the last at the left, a middle
      stage only ever half of a pair and both halves changing at each
      stop, against each stage whole at its stop with the next wiping
      in (plan.md, Known limitations); continuous
      or snapping; which pair at rest; the default method and whether
      his choice should be remembered, and for how long; side by side on
      the phone (stack, or switch); the switch's keys and whether it
      wraps; the compare's width on each surface; the fades' durations;
      the section's heading and the block's words. Each round he asks
      for is one sub-lettered task here (`T1709a`, `b`, …) as the
      cadence paragraph says. When he names the keeps, the orchestrator
      records them under this task and dispatches Phase 2. _Verify:
      every sub-lettered task green; each kept value agrees in its one
      place, its test row and spec.md's Decided line (a `grep` of each,
      listed); the Phase 1 record below filled in._

- [x] **T1708a** — Phase 1 review fixes. (1) `compare.test.mjs`: a
      page-source case pinning `WORDING.compare` (the heading and the
      two labels as literal strings) and a (c)-style exact-body case
      for the legend/control rule in `global.css` — the two pins the
      envelope table names and T1706/T1708's bullets left out (plan.md
      amended). (2) The image page renders a sidecar stage note and the
      `processing` fallback as inline Markdown through the page's
      existing `renderMarkdown` (no `<p>` inside the note span), and
      `enhanceCompare`'s live note clones the note span's children
      instead of reading `textContent`, so emphasis survives on both
      surfaces. _Verify: `sh scripts/verify.sh` green (count recorded);
      mutation, reverted: the legend rule's `gap` changed → the new (c)
      case fails naming it; `WORDING.compare.heading` changed → the
      page-source case fails; the built land-b page's Tones note carries
      `<em>Fixture stage.</em>` (greped); the fog piece's compare note
      unchanged._

- [x] **T1709a** — Round: the slider is two-way and the legend picks
      the pair (the person, 2026-09-25: "it fundamentally needs to be
      a 2-way comparison … I do like being able to switch between
      different comparisons"; first pair Camera | Finished; the pair
      buttons no longer do the same thing). Plan: "The compare,
      enhanced", the T1709a paragraph. `src/lib/compare.ts`: `COMPARE`
      gains `restPair: 'ends'`; `pickPair(pair, k, n)`; `sliderView(p,
      pair)`; `restView` on the pair; `snapTo` and the segment geometry
      removed; `enhanceCompare` holds one `pair` for the slider and
      side by side, the legend choosing it in both, the handle wiping
      between the two. `compare.test.mjs` (d): `EXPECTED` gains the key;
      the `sliderView` tables replaced by pair-based cases; `pickPair`
      cases for every click on three and four stages (no click on an
      outside stage leaves the pair unchanged; the pair stays in
      order). spec.md Decided: one line. _Verify: `sh scripts/verify.sh`
      green (count); the browser reads re-taken with the driver at both
      viewports (the pair at rest, each legend click's pair in slider
      and side, the wipe at 25/50/75 between the pair); mutation:
      `restPair` changed → `EXPECTED` fails by name._

- [x] **T1709b** — Round: the compare's width is `wide` on both
      surfaces (the person: "needs to be larger (maybe allow it beyond
      the text margins)"). `COMPARE_WIDTH` → `{ piece: 'wide', page:
      'wide' }` in image-meta.mjs; compare.test.mjs's row; spec.md
      Decided: one line. _Verify: `sh scripts/verify.sh` green; the
      built land-b and fog piece carry `compare-w-wide` (greped); the
      barrier's `sizes` read `(min-width: 1240px) 1160px, 96vw`._

- [x] **T1709c** — Round: only side by side is wide ("only wanted the
      side by side to get larger"). Plan: rounds paragraph (c).
      `COMPARE_WIDTH` back to column; `COMPARE.sideWidth: 'wide'` in
      `compare.ts`, the script swapping the width class while in side
      view; `EXPECTED` row; the transform tests' pins back to column.
      _Verify: `sh scripts/verify.sh` green; BiDi at 1512×982: the
      compare box 666 in slider and switch, 1160 in side, 666 again
      after leaving side; mutation `sideWidth` → `EXPECTED` fails._

- [x] **T1709d** — Round: the pair picked in order, left then right,
      with the picked stages marked ("it's not clear which I'm
      selecting for which side … bold or darken the text for a selected
      one and some additional indicator that a second click selects the
      right image"). Plan: rounds paragraph (d). `compare.ts`:
      `pickSlot`, the slot state, the legend's tags and hint from
      `COMPARE_WORDING`; `global.css`: the picked button bold in
      `--color-text`, the tag and hint in the legend's small style (the
      (c) legend rule updated with its pinned body). Tests: `pickSlot`
      tables for three and four stages, the wording rows. _Verify:
      green; BiDi: from rest, clicks T then C give T | C with tags
      left/right on T and C and the hint flipping; the wipe shows T
      left of the divider._

- [x] **T1709e** — Finding: the Finished stage has no corner caption
      inside the image while the others do. Diagnose in `compare.ts`
      and the compare CSS; fix if routine. _Verify: green; BiDi: with
      `cornerTags` as set, every showing stage's tag state listed per
      view._

- [x] **T1709f** — Round: the camera stage's note on the page reads
      "The RAW file straight out of camera — no edits, no adjustments".
      `WORDING.compare.cameraNote` in the page, passed through
      `compareStages`; the page-source pin's row. _Verify: green; the
      built land-b page's Camera note greped._

- [x] **T1709g** — Round: a picked stage may move to the other side,
      leaving its old side empty until the next pick ("you can't select
      an already selected one … maybe in this case you just have an
      empty selection until the partner is selected. I actually like
      that second idea better"); the left/right tags beneath their
      buttons, space reserved ("this causes things to jump around … the
      left and right indicators should be underneath their selections").
      Plan: the T1709g paragraph. `compare.ts`: nullable slots in
      `pickSlot` and the views; `global.css`: the legend button as a
      two-line block with a reserved tag row, the (c) pin's body
      updated; tests: the `pickSlot` tables regenerated for three and
      four stages including empty slots. _Verify: green; BiDi at
      1512×982: from rest (C left, F right, next left) click F → F
      left, right empty, next right; click T → F | T; the legend
      buttons' tops and widths unchanged across the clicks (recorded);
      the empty pane's stage state `off` and no image showing on that
      side._

- [x] **T1709h** — Round: any stage may be picked at any step ("Allow
      the same image to be picked at any stage"): a click on the stage
      already holding the `next` side keeps it and flips `next`. Plan:
      the T1709g paragraph as amended. `pickSlot`'s one branch; the
      tables regenerated; the property test's "does nothing" clause
      replaced by "flips next". _Verify: green; BiDi: from rest (next
      left) click Camera → unchanged sides, next right; click Tones → C
      | T._

- [x] **T1709i** — Round: the handle "significantly smaller. Maybe a
      small circle with a '=' inside whose outline uses the site's
      accent color". Plan: the T1709i paragraph. `global.css`: the
      token to 1.5rem; the handle rule's border in `--color-accent`,
      the two bars; compare.test.mjs (b): `TOKENS` and the rule pin.
      _Verify: green; BiDi at 1512×982: the handle 24×24, border
      colour the accent, the two bars' rects inside it, still centred
      on the divider._

### Phase 1 record (the person's walkthrough)

**First look (2026-09-25).** The three-way slider: "I don't like the
3-way slider, it just doesn't work. I think it fundamentally needs to
be a 2-way comparison. I do like being able to switch between
different comparisons though." Side by side: "actually is good" but
the legend's Tones and Finished buttons "do the same thing which is a
little confusing", and the compare "needs to be larger (maybe allow it
beyond the text margins) … it shrinks the images down too much".
Beyond the envelope, held for a spec amendment after Phase 3 ("there
may be more amendments to the spec coming so let's get through the
rest first"): side by side as its own block; any number of stages
with a final filmstrip view that pages or scrolls through them (a
fourth method); the slider usable on its own for one pair. Rounds
run: T1709a, T1709b. **Second look:** "only wanted the side by side
to get larger. The slider and switch is now too large"; the pair
picking "is confusing … not clear which I'm selecting for which side";
Finished has no corner caption "like the others do"; the camera's
subtitle should read "The RAW file straight out of camera - no edits,
no adjustments". Rounds: T1709c–f. **Third look:** "it's getting close but it's still
a little confusing": a picked stage can't be picked for the other side
— "you just have an empty selection until the partner is selected. I
actually like that second idea better"; the left/right tags "cause
things to jump around … should be underneath their selections". Round:
T1709g. **Fourth look:** "Almost! … you can't pick the same image for
the next pick … Allow the same image to be picked at any stage." Round:
T1709h. **Fifth look:** "Perfect" — one more: the handle "should be
significantly smaller … a small circle with a '=' inside whose outline
uses the site's accent color." Round: T1709i. Then the decision list.

## Phase 2 — The loupe (reviewer after the phase; walkthrough: under `npm run dev` on both screens with a mouse and a trackpad, and on a phone — on `/images/where-the-fog-lets-go/land-b/`, enter the quiet view; the cursor over the photograph says zoom, over the mat it still says leave; click a corner and the photograph grows to full detail around that point while the mat and the dark ground stay where they are, soft at first and then sharp as the larger export fades in; drag to move around it, scroll or pinch (trackpad and phone) to zoom between the fit and full detail, + and − to zoom, the arrows to pan; Esc or a click without dragging goes back to the fit, Esc again back to the page; at the fit the arrows step to the next photograph as before; on `/images/where-the-fog-lets-go/land-a/` (a 1800×1200 placeholder with no larger export, whose own file is already past full detail at its quiet size on both his screens — the number T1712 recorded, quoted in the report; if that read found it ready, the report names the page T1712 found not ready instead) the quiet view is exactly as before and a click leaves it, while some real portrait exports on the laptop do get a loupe from their own file (T1712's numbers); the question put to him: at the fit, a click on the photograph now zooms and a click on the mat or the dark ground leaves — is that the right reading of "a click at the fit steps back out", or should a single click keep leaving and the loupe open another way; with the system's reduce-motion setting on, the zoom jumps rather than grows and the sharp export still fades in; optionally, in the browser's network panel, the larger export is requested only at the first zoom and once; as many rounds as it takes, each a sub-lettered task under T1713)

- [ ] **T1710** — The loupe's file on the page. Pattern: `src/lib/og.ts`
      (`ogImageOptions` and its comment) and `og.test.mjs`; the page's
      `og` `getImage` call. Plan: "The loupe's file". New
      `src/lib/loupe.ts`: `LOUPE` as plan.md spells it (each key's
      comment; no quality key — the stage's default, so Astro can serve
      one file where the widths meet), `loupeImageOptions(source)` with its comment (why webp
      at full size, the 16383px edge, the passthrough case). The page's
      frontmatter: the two lines in plan.md; the `.image-stage` div's
      four `data-loupe-*` attributes. New `loupe.test.mjs`: `EXPECTED`
      at the top (as compare.test.mjs's), describe "(a) the file" with
      T1710's testing bullet's unit cases. _Verify: `sh scripts/verify.sh`
      green (count recorded) with the barrier's line now counting one
      detail export and the GPS scan's line (both quoted); the build
      reads in T1710's bullet — land-b's attributes greped, its loupe
      file present in `dist/_astro/` with its byte size recorded, `exifr`
      (`gps: true`) over that file reads nothing, the detail original
      absent (the pruner's counts before and after, recorded),
      the fog piece's `land-a`'s attributes; `withoutDetail: false`
      built once and reverted → `land-a` carries none; the size and file
      count of `dist/_astro/` on `main` and after this task, and how many
      own-file loupe URLs equal a stage `srcset` candidate (recorded —
      the own-file loupes' cost); the stage's `<img>` and `srcset`
      on land-b byte-identical to `main`'s except the new attributes on
      its parent (`git diff --no-index` of the two `<figure>`s,
      recorded)._

- [ ] **T1711** — The loupe's state, pure. Pattern: T1707's shape in
      `compare.ts` and `compare.test.mjs`. Plan: "The loupe's state".
      `src/lib/loupe.ts`: `fullScale`, `zoomAbout`, `clampPan`,
      `loupeReduce` exactly as plan.md describes, the effects as a
      string union, each with a one-line comment. `loupe.test.mjs`:
      describe "(b) the state" — T1711's testing bullet in full, every
      transition listed in plan.md a case of its own. _Verify:
      `sh scripts/verify.sh` green (count recorded); mutation, reverted:
      Escape at zoomed made `leave-quiet` → the two-level case fails._

- [ ] **T1712** — The loupe, wired. Pattern: the image page's
      `setQuiet`, `init()`, stage click handler and `keydown` (the
      routing extended, not rewritten); the quiet cursor rules' comment
      in `global.css` for where a cursor rule must live and why. Plan:
      "The loupe, wired". `src/lib/loupe.ts`: `createLoupe(stage)`
      (readiness, the overlay placed from the image's rect, the one
      request and its cache, the drag with `dragSlop`, the wheel as a
      non-passive listener over the photograph, the pinch from two
      pointers, `data-glide` only when `!reducedMotion()`, `reset()`),
      its header comment (why an overlay and not the stage image, why
      the file is fetched only at `open`). The page's script: the
      controller made in `init()` when the stage carries
      `data-loupe-src`; the stage click and `keydown` asking it first
      and acting on its effect; `setQuiet(false)` calling `reset()`.
      `global.css`: a new `/* ---- The loupe (spec 019) ---- */` section
      after the quiet rules (before the Motion section) with the seven
      rules exactly as plan.md spells them and a header comment; and,
      inside the reduced-motion block at the file's end, the sixth rule
      `.loupe-detail { animation-duration: calc(var(--dur-appear) * var(--rm-appear)); }`
      with the block's comment updated ("Six rules", the detail export's
      fade following the frames'). `motion.test.mjs` (d): `REDUCED_RULES`
      gains the rule, the order case's expected list gains
      `{ prelude: '.loupe-detail', bases: 1, after: [] }`, and the case
      names say six — a deliberate addition the count exists to notice,
      not a loosened test; nothing else in the file changes.
      `loupe.test.mjs`: describe "(c) the loupe's rules" — each by
      string. _Verify: `sh scripts/verify.sh` green (count recorded)
      with the barrier's line; matte.test.mjs green unedited;
      `git diff main -- motion.test.mjs` shows (d)'s additions only;
      mutation, reverted: the RM rule moved above the loupe section →
      the order case fails naming it; in the browser under reduced
      motion with `--rm-appear: 0` inline, the detail's animation
      computes 0s, and with 1, 950ms;
      `git diff -U0 main -- src/styles/global.css | grep '^@@'`
      → the new section's hunk and the one RM-block line beside
      T1706/T1708's (listed); the
      browser reads in plan.md's T1712 bullet at 1512×982 and
      1280×1440, each recorded here (the resource timeline before and
      after the first and second zoom, the point-under-pointer offset,
      the scale against `fullScale`, the loupe's rect against the
      image's, the frame's padding and background while zoomed, the
      detail's animation, the pan clamp, the wheel and two-pointer
      scale, the keys, the two-level Escape, the 480ms transition and
      its absence under reduced motion, no script; `fullScale` at both
      viewports for `land-a`, for one real 2560px portrait export and
      one real 2560px landscape export — the numbers the Phase 2 report
      quotes, and the not-ready control it names).
      What headless cannot drive (a real trackpad pinch) is said line
      by line for the pause._

- [ ] **T1713** — The second look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 2
      pause, as T1709's. The spec's questions here: the click at the
      fit — the photograph zooms, the mat and the ground leave (plan.md,
      Resolved decisions: a reading of Goal 4's "a click at the fit
      steps back out") — or a single click keeps leaving and the loupe
      opens another way; how the loupe opens (a click, a double click, a
      pinch only); the zoom range — full detail at one image pixel per
      device pixel, and whether a photograph without a larger export
      should get a loupe at all on his screens, where the landscape
      exports have no detail to add and some portraits do (T1712's
      numbers); the gestures and
      keys; the zoom's and the fade's durations; the loupe's window (the
      photograph's own box, as built, or the whole screen — plan.md,
      Resolved decisions); the recommended size for the larger export
      that AUTHORING.md will state. Rounds as `T1713a`, `b`, …; when he
      names the keeps they are recorded here and Phase 3 is dispatched.
      _Verify: as T1709's, for the loupe's values._

### Phase 2 record (the person's walkthrough)

_Filled in at the pause._

## Phase 3 — Obsidian and the documents (reviewer after the phase; walkthrough: in Obsidian, with the rebuilt plugin installed as its README says — the fog piece's closing `:::compare` shows its three stages as images with their labels beneath in Live Preview, and turns back into its text when the cursor enters it; a leaf block like `::fullbleed` renders as before; `AUTHORING.md`'s new parts — the block, the stages, the larger export, the gear table — read as the rest of that document does and tell him what he needs to finish his piece)

- [ ] **T1714** — The plugin shows a compare. Pattern: `LEAF_BLOCKS`,
      `BlockWidget` and `buildDecorations` in `obsidian-plugin/main.ts`;
      its `.photo-pieces-preview-row` rule in `styles.css`. Plan:
      "Obsidian". New `obsidian-plugin/compare.ts` (no `obsidian`
      import): `COMPARE_PATTERN` and `parseCompareBody(body)`.
      `main.ts`: the second regex pass in `buildDecorations` (cursor
      inside → raw), a `CompareWidget` (or `BlockWidget` given labels)
      rendering each stage's image with its label; the header comment's
      "what stays raw" list amended (the compare's container renders;
      the other containers stay raw). `styles.css`: the compare's
      preview (images in a row that wraps, each label beneath in the
      muted small style the plugin already uses). New
      `obsidian-plugin.test.mjs`: T1714's cases. _Verify:
      `sh scripts/verify.sh` green (count recorded); in
      `obsidian-plugin/`, `npm run build` exit 0 when its
      `node_modules` is present (else say so — the build is the
      photographer's, per its README); the remark-pieces-vocabulary
      "nothing knows the word" walk green (it reads `main.ts`)._

- [ ] **T1715** — The documents. Pattern: spec 018's T1607 (the docs
      task's shape and its hand-editing rule) and AUTHORING.md's "The
      camera's frame" section for the voice. Plan: "The documents".
      `AUTHORING.md`: the camera's-frame section becomes the private
      files (the frame, stages, the detail export — names, where they
      sit, what fails), then a section on the `compare` block (the
      flow's example verbatim, the rules, `mode`, what Live Preview
      shows), the sidecar's `stages:` (the flow's example), the larger
      export (the name, the size recommendation as kept at T1713, strip
      location on export, the 25 MiB ceiling), and "Gear names" (the
      file, the line format, the warning); the underscore bullet (~166)
      names the family. `README.md`: the image-page paragraph (the
      label's names, the compare's three ways and its stages, the
      loupe), the tree's new files in the existing entries' voice, the
      spec list gains "019 the image page, refined".
      `obsidian-plugin/README.md`: a `:::compare` row in the table and
      the Extending note that the compare is the one container parsed.
      Every claim read against the code and T1709's and T1713's keeps,
      not against the first draft. Hand-edit the prose (never
      script-rewrap; grep for lines beginning with a CSS `>` or `+`
      before any format run). _Verify: `grep -n "compare" AUTHORING.md README.md obsidian-plugin/README.md`
      and `grep -n "gear.md\|detail" AUTHORING.md README.md` (hits
      listed); `npx prettier --check AUTHORING.md README.md obsidian-plugin/README.md`
      clean; `sh scripts/verify.sh` green (nothing under test changes
      — the run is the record)._

### Phase 3 record (the person's walkthrough)

_Filled in at the pause._

## Phase 4 — The first real piece (reviewer after the phase; walkthrough: the photographer's own piece, on both screens with a mouse and a trackpad, and on a phone — the piece page with his writing and his compare as he wrote it; his photograph's image page: the wall label's camera and lens by the names he knows, "Raw to finished" with his camera's frame, his stages and the finished photograph in each of the three ways, the story's own compare instead if he wrote one there; the quiet view's loupe on his larger export, to full detail and around it; every tuning question from the two earlier looks open again here, now on a real photograph; as many rounds as it takes, each a sub-lettered task under T1717)

The content is his, supplied during implementation; these tasks are the
site's support for it and invent nothing. The earlier pauses are judged
on the fixtures. If his piece has not arrived when Phase 3 is signed
off, the orchestrator says so at the Phase 3 pause and waits; whether to
close the spec without it is his decision (it would leave an acceptance
criterion unmet — a spec amendment).

- [ ] **T1716** — His piece, placed. Dispatched when the photographer
      says the files are ready and where they are. Pattern: the fog
      piece's folder (`index.md`, the photograph, `_<basename>.md`,
      the private family beside it). Copy the files as supplied into
      `src/content/pieces/<his slug>/` — no edit to his prose, his
      frontmatter or his files; a build failure over his content is
      returned to the orchestrator as the build's message and a plain
      sentence on what it asks of him, never fixed by rewriting his
      content. Before copying: `exifr` with `gps: true` over every
      supplied raster — any GPS block stops the task and goes to him to
      re-export (the repository would publish it; the site never
      would). For each camera or lens string the gear test reports
      unknown, add a line with a proposed display name in the Decided
      section's pattern (Sony's own mark; the maker's own lens name)
      and list each proposal for the orchestrator to put to him at the
      pause. _Verify: `sh scripts/verify.sh` green (count and page
      count recorded); no `[gear]` line; the barrier's line counts his
      detail export and its loupe file's byte size is recorded against
      `MAX_BYTES`; the supplied files' sizes and the detail export's
      pixel size recorded; the GPS read's output pasted; his image page
      carries `data-loupe-detail`, his compare section's stages in his
      order (or the story's compare, and no automatic section), his
      label's two rows (greped and quoted)._

- [ ] **T1717** — The last look, and the rounds. Not an implementation
      task: the orchestrator's record of the Phase 4 pause on his piece,
      as T1709's — the gear proposals put to him first, then any of the
      envelope's questions he reopens. Rounds as `T1717a`, `b`, …; a
      round that changes a documented value also updates the sentence
      in `AUTHORING.md` or `README.md` that states it, in the same task.
      When he names the keeps, they are recorded here and the close-out
      is dispatched. _Verify: as T1709's; the documents agree with the
      kept values (`grep` listed)._

### Phase 4 record (the person's walkthrough)

_Filled in at the pause._

## Phase 5 — Close-out (the documents, the reviewer sweep, then merge; walkthrough: none — `ROADMAP.md` and `DECISIONS.md` change nothing on the site, and the site was judged at the last pause)

- [ ] **T1718** — Close-out. The repo-wide documents are edited by
      `sdd-implementer-fable` — the close-out row of `CLAUDE.md`'s role
      table — on the close-out bundle the model policy describes (each
      acceptance criterion with the test names and Done notes that
      satisfied it, the walkthrough lines and what the person said at
      each pause, the tier log, spec.md's summary and Decided list,
      plan.md's "Resolved decisions" and "Known limitations",
      `ROADMAP.md`'s entries named here, and `DECISIONS.md`'s "Spec 018"
      section as the shape), told not to read spec.md, plan.md or
      tasks.md in full, and committed by the orchestrator on this
      branch, to reach `main` with the PR; the sweep, the merge and the
      bookkeeping are the orchestrator's own part. `ROADMAP.md`: the
      external image store's entry notes the day moved closer (detail
      exports committed beside their photographs, his words: "I plan to
      have many images"); the `sequence` entry (~579) and the two
      mentions (~23, ~40) struck or rewritten as retired at spec 019 —
      answered by `compare` with stages; the processing showcase marked
      first step taken (the block, the sidecar's stages); the gear
      entry annotated (the name table is its seed — "a gear file
      declares the strings it answers to"); a new entry, "The image
      page's layout", for the candidates this spec left (the story
      beside the photograph on wide screens, a jump line for long
      pages, the wall label's shape); anything the pauses surfaced.
      `DECISIONS.md`: "## Spec 019: the image page, refined" in 018's
      shape — the decision in the photographer's words (the page over
      the mobile pass; the dictionary; Sony's own mark; the handle and
      the legend; three methods; the block; stages in the sidecar; the
      loupe with a larger export, not tiles; the real piece at the end),
      what the plan chose and why (the family read by one function with
      the frame first; the shape spelled once; the page building the
      block's markup; the chrome script-built with an ARIA handle; the
      stages unlinked; the slider's segments indexed from the right, so
      each end shows an end stage whole, and what the pause kept; the switch's fade-in-over in place of an `opacity: 0` rule;
      the loupe as an overlay in the photograph's own box; the loupe
      file as a webp transform and the barrier reading declared URLs;
      the gear table as Markdown in the content folder; tunables as
      constants), and the keeps from each pause in his words, round by
      round. Both hand-edited (`npx prettier --check` clean; grep for
      lines beginning with a CSS `>` or `+` before any format run).
      Then, the orchestrator's part: the pre-merge whole-spec sweep at
      the reviewer's default tier and its findings resolved; the
      acceptance criteria checked against their records (AC 1 by
      gear.test.mjs's lookup table and T1704's page grep; AC 2 by the
      repo case, T1704's mutation line and the clean build; AC 3 by
      T1705's shape case and T1708's no-script read; AC 4 by T1707's
      state tables, T1708's browser reads and the Phase 1 record; AC 5
      by T1701's `sectionsFor` and `compareStages` cases and T1706's
      three page reads and the story edit; AC 6 by T1705's failure cases
      — the borrowed private stage failing though its file exists, beside
      the borrowed public photograph rendering as a stage, the pair that
      shows the rule is the narrowed one — and T1702's orphan edit; AC 7 by T1701's gallery case, the
      barrier's scan 1 with its tests and T1712's resource timeline and
      the Phase 2 record; AC 8 by T1711's reducer cases, T1712's reads
      and the Phase 2 record; AC 9 by the barrier's scan 2 and T1712's
      no-script read; AC 10 by motion.test.mjs (unedited but for
      T1712's sixth reduced-motion rule), compare.test.mjs
      (c), loupe.test.mjs (c) and the motion barrier's line; AC 11 by
      the Phase 3 record; AC 12 by T1700's commit (its hash and its
      place before T1701's) and T1715's greps; AC 13 by T1716's reads
      and the Phase 4 record, the fixtures' `Fixture` strings unchanged;
      AC 14 by the final build's GPS line); build, tests, check, and
      the four barriers (GPS, dev routes, motion, private files) green
      with actual output; the PR marked ready
      and merged with a merge commit; the close-out box ticked in the
      same shell command as the merge bookkeeping. _Verify: the
      implementer's `sh scripts/verify.sh` green with the documents
      edited; `grep -n "Spec 019" DECISIONS.md ROADMAP.md` → the new
      section and the annotations; `git diff main --stat` lists no file
      outside plan.md's File structure and this directory;
      `git diff main -- package.json` shows the `postbuild` line only;
      `main` green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log

> **The Fable profile**, as `CLAUDE.md`'s role table fixes it: the
> session on `claude-fable-5-1` at medium effort; the planner at the
> implementation tier (`opus`, high) with no override — stepped down on
> trial at this spec; the plan/tasks sign-off and any decision review
> at the top tier (`fable`, high) with an explicit per-call override;
> task implementation, the per-task and per-phase reviews and the sweep
> at `opus`; close-out at the top tier's model at medium
> (`sdd-implementer-fable`). Fallback, if the top tier's allowance runs
> out: the whole table at `opus` for the rest of the window, recorded
> here with the time. Baseline — spec 018's tier log: planning at the
> top tier 390,978 and sign-off 197,107, then every row at `opus` by the
> person's step-down; this spec's planning row is the first measure of
> the planner at the implementation tier.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation | Tier | Tokens | Outcome / miss reason |
| ----------------- | ---- | ------ | --------------------- |
| Plan and tasks draft (2026-09-24) | implementation (`opus`, high, no override — first run of the stepped-down row) | ~374k | drafted; 19 tasks in six phases; 12 deviations reported, all judged inside the envelope or plan defects at sign-off |
| Plan and tasks sign-off | top (`fable`, high, override) | ~120k | blocked: B1 slider segment order (middle stage at both ends), B2 AC 6 vs the borrowed-public allowance, untested, B3 CLAUDE.md "frontmatter-only" sidecar; nine second-look notes |
| Sign-off fixes (planner resumed) | implementation (`opus`, high) | ~60k | B1–B3 fixed; S1–S8 taken, S9 in part |
| Sign-off re-review | top (`fable`, high, override) | ~40k | signed off; five non-blocking lines below. Against 018: planning 390,978 at the top tier → ~434k at the implementation tier here (draft + fix round); sign-off 197,107 → ~160k |
| T1700 constitution amendment | implementation (`opus`, high) | ~36k | done; prettier failed on a pre-existing defect (role table padding, one indented line) — fixed on `main` in c4c5e86 and merged in, not part of this task |
| T1701 private-file family | implementation (`opus`, high) | ~84k | done; 428 tests; both mutations fail the named cases; compareStages takes/returns { src, label, note } (T1702 maps key → src); resolveStages reads the photograph name from `where` |
| T1702 registry, schema, fixtures | implementation (`opus`, high) | ~66k | done; 87 pages, 428 tests; fixture sizes: detail 125,235 B (5400×3600, flat), tones 16,333 B, sampler frame 14,962 B, test tones 472 B; all three site fixtures carry GPS; the private-file heading is now `[images] private file(s):`; second-frame line keeps attachPrivatesx27 wording (second-detail shape plus "(any accepted extension)") |
| T1703 private-files barrier | implementation (`opus`, high) | ~57k | done; 446 tests (+18); Cloudflare Workers static assets per-file limit confirmed 25 MiB, Free and Paid, https://developers.cloudflare.com/workers/platform/limits/ (curl, 2026-09-24) — MAX_BYTES stays; the temporary spec-006 skip covers scan 2 as well as scan 3 (the old markup ships compare-tag/compare-line), one skip, T1706 deletes both uses and flips the test case to exit 1 |
| Phase 0 review | implementation (`opus`, high) | ~96k | signed off, nothing blocking; three plan-text notes transcribed (scan 3 reads compare-classed elements and img only; the skip covers scan 2; `over 25.0 MiB`); the style-half of one barrier test cannot fail on its own, `MAX_BYTES` and the width list each spelled twice, `resolveStages` parsing `where` for the name, a live gap until T1706 (stages without a frame) — carried to the sweep; `privateTargetOf`'s remaining callers checked by the orchestrator: messages only (image-meta.mjs:365 unread target, :1118, remark-pieces-blocks.mjs:746) |
| T1704 gear names | implementation (`opus`, high) | ~74k | done; 471 tests (+25); the mutation fails the repo case naming cozy-brook.jpg and the build prints one [gear] line; latourelle-glow reads Sony α7R V / Sony FE 16-35mm f/2.8 GM II; dock-b keeps its sidecar names; the bundle was cut short by the Phase 0 plan amendment shifting line numbers — the implementer read four plan ranges directly; bundles now slice by header |
| T1705 compare block | implementation (`opus`, high) | ~97k | done; 488 tests (+17); the pieceFrame mutation fails five named cases; compare sits after held in the table (the vocabulary test pins the order); partitionStages takes the directive name as partitionBody does |
| T1705 per-task review | implementation (`opus`, high) | ~55k | signed off, nothing blocking; two lines added to plan.md's "The block" (no note → label span alone; the stage img carries no --ar); carried: the label-missing line prints the plan's literal example, a later paragraph without an image joins the previous note (AUTHORING.md should say so, T1715), a linked or reference-style image before the first stage is silently dropped, a same-folder `../own/_x.jpg` may read as a borrow |
| T1706 static form, page section | implementation (`opus`, high) | ~130k (two rounds) | done; 493 tests; 3 compares in one shape; stopped once on matte.test.mjs (b), whose pinned page rules the plan deletes — orchestrator resolved it as a retarget to the new section with an empty --color-matte list T1708 extends, both mutations fail; carried to the pause: a sidecar stage note prints as literal text while the block renders inline Markdown (`_Fixture stage._` shows underscores); no browser read (no BiDi helper in the repo) — the person attests; stale page comments left for T1708 |
| T1707 compare state | implementation (`opus`, high) | ~55k | done; 508 tests (+15); restAt mutation fails EXPECTED by name; switchNext and openingMode take an optional trailing argument defaulting to the constant so the no-wrap and no-remember paths are testable; restView('side') is the pair the slider shows at rest; split carries float noise at thirds (T1708 rounds where it writes it) |
| D1708 decision review (the compare's chrome and --color-matte) | top (`fable`, high, override) | ~43k | option B: every fill in the compare section reads `--color-bg`, the ground; matte.test.mjs (b) and (d) untouched — a matte-white bar on paper is a mat by spec 017's definition, and spec 006's comment was a fact about the page's white then, not a decision; plan.md's two mentions corrected; DECISIONS.md at close-out |
| T1708 compare enhanced | implementation (`opus`, high) | ~165k (two rounds) | done; 517 tests (+9); stopped once on D1708; no browser would start in its sandbox ("Could not find profile folder"); orchestrator miss: the D1708 plan commit (`git commit -a`) swept the implementer's uncommitted draft into aee4e7e — the decision's fills landed in 4e6d229; carried: no legend-shape pin in (c) though the envelope table names one; the legend runs left→right while the slider's track runs right→left (first stage whole at the right edge); with sideNarrow 'switch' the control would still show Side by side (not today's setting) |
| T1708 browser pass | general-purpose (session tier, medium) | ~98k | every read taken at both viewports, recorded under T1708; the driver had four duplicate `const f` declarations, fixed in the scratchpad copy; Firefox launches via `open -na` with HOME overridden and MOZ_HEADLESS=1 (the direct binary cannot find a profile under this macOS) |
| Phase 1 review | implementation (`opus`, high) | ~142k | blocked once: the envelope table names two pins (the legend rule's strings; WORDING.compare by page source) that compare.test.mjs lacks — a plan-bullet defect, fixed as T1708a with the sidecar-note Markdown gap (the reviewer's recommendation: renderMarkdown, the live note cloning children); pause questions: the legend reads left→right while the track runs right→left; the 1px --color-bg divider on a bright photograph; sweep notes: matte (b)'s scan is section-bounded, AC 4's "page tests" are unit tables plus a browser record, unused envelope branches (cornerTags, 'above', remember 'always', sideNarrow 'switch') to prune at close-out, CLICK_SLOP_PX outside COMPARE, the switch frame's missing accessible name, aria-current on two stops, gear.mjs's duplicate cleaner and `in SECTIONS` |
| T1708a review fixes | implementation (`opus`, high) | ~46k | done; 519 tests (+2); both mutations fail the named case; land-b reads <em>Fixture stage.</em>; a multi-paragraph sidecar note would keep its <p>s inside the span (single paragraph unwrapped by regex) — sweep note; the live note clone has no DOM test |
| Phase 1 re-review | implementation (`opus`, high) | ~12k | signed off; to the sweep: a multi-paragraph sidecar note keeps <p>s in the span — plan and AUTHORING.md (T1715) should state one rule (fail the build, or "one paragraph"); the live note clone untested; `processing` renders as Markdown as the comparex27s last note but plain text in the How-it-was-made row |
| T1709a two-way slider round | implementation (`opus`, high) | ~82k + ~40k (two rounds) | done; 523 tests; the orchestratorx27s first pairing rule (nearest member) could never reach Tones | Finished — the implementer caught it; corrected to "replace the older pick"; orchestrator miss again: 4ffc0e8 (`commit -a`) swept the first-rule draft — explicit paths from now on; dead `.compare-legend [aria-current]` selector left in the legend rule (pinned by (c)) — sweep note |
| T1709b wide round | implementation (`opus`, high) | ~36k | done; 523 tests; compare 1160px (176px margins) on both pages at 1512×982, text column 666px; the enhanced compare is 833px tall against a 982px viewport — watch at the pause |
| T1709c side-only wide | implementation (`opus`, high) | ~45k | done; 523 tests; 666 / 1160 / 666 / 666 on both pages; the swap keys on the view shown, so a narrow side that yielded to switch would keep the column — moot with stack; the swap has only the EXPECTED pin and the browser read |
| T1709d ordered picking | implementation (`opus`, high) | ~93k | done; 525 tests; the hint sits after the control (the root is a 1fr auto grid, so anything among legend and control needs grid-column 1/-1); bold follows aria-pressed in the switch too; the live note follows the right slot; ordered pairs are not all reachable in two clicks (unordered are) |
| T1709e Finished caption finding | implementation (`opus`, high) | ~40k | diagnosed, no site defect: the corner text is painted into the placeholder pixels by gen-placeholders (camera "4:3 · camera", tones "3:2 · tones", finished only "3:2"); no corner tags drawn (cornerTags false), captions display none, no pseudo-elements; nothing changed |
| T1709f camera note | implementation (`opus`, high) | ~27k | done; 526 tests; land-b and the sampler read the note |
| T1709g empty sides, tags beneath | implementation (`opus`, high) | ~98k | done; 529 tests; data-label (a script-written attribute, not a state) not on the barrier list — sweep note; with sides kept apart some arrangements take three clicks (the first stage on the left of a middle stage); narrow stacked side by side with an empty right shows one pane; the switch keeps blank tag rows |
| T1709h any stage any step | implementation (`opus`, high) | ~43k | done; 529 tests; worst case two clicks either way round; the hidden handlex27s aria-valuetext goes stale in side by side — sweep note |
| T1709i small handle | implementation (`opus`, high) | ~42k | done; 530 tests; 24×24, accent border, bars 8×1 at ±1.5px from centre |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- Spec.md AC 6 was narrowed by one word ("a _private_ stage borrowed from another folder") to match its own Authoring rule; carried to the person in the spec-conformance summary for his approval, not passed silently.
- Scan 3's "class-bearing descendants … and nothing else" should be defined as the `COMPARE_CLASSES` nesting, tolerant of any class Astro's Markdown image pipeline or `pieceWrap` adds, or T1706 fails on markup the plan didn't anticipate (implementer's footprint at T1703/T1706).
- `attachPrivates` names a second-frame problem but "Failure messages" lists no second-frame line (only second-detail); the implementer writes it in the second-detail's shape (T1702).
- Closed at sign-off bookkeeping: `tests/pieces/beta/photo.jpg` and `_photo.jpg` both exist on disk (T1705's borrowing pair needs no new fixture); the fog piece has `land-a` (the Phase 2 control exists).
- The spec is internally inconsistent on the switch under reduced motion (Goal 5 keeps fades; Design requirements say "or a cut"); the plan follows Goal 5, inside the envelope's reduced-motion split. Named in the spec-conformance summary.

## Handoff note

Not started. The continuation prompt for the implementation session:

> Read `CLAUDE.md` and `specs/019-the-image-page-refined/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's Fable profile and its role table (`/effort status`
> first; medium is right for this session). T1700 is the constitution
> amendment: dispatch it, verify, and commit it alone before anything
> else. Then triage; dispatch each routine task to the
> `sdd-implementer` on a task bundle assembled with shell (the task
> line, the plan sections it names, the acceptance criteria, the files,
> the pattern file, any recorded value), telling it not to read plan.md,
> spec.md or tasks.md in full; take the verification from the
> implementer's verbatim `sh scripts/verify.sh` output, except T1705,
> which you re-run yourself before committing (`review: per-task`); do
> no browser or device checks by hand — the implementer measures and
> records, the person attests the rest; stage, then bundle the diff for
> the `skeptical-reviewer` per phase (and once for T1705 on its own),
> one review and at most one re-review, the rest logged; commit, check
> the box, and log the tier and tokens in one shell command.
> Involvement level is product owner: Phase 0 runs on without a pause;
> pause after Phase 1, Phase 2, Phase 3 and Phase 4 — each report names
> what the phase header's walkthrough names, in plain language, and the
> questions its look task lists; each round he asks for is a
> sub-lettered task under that look task (one value in its one place,
> its test row, one Decided line in spec.md), and a change the tuning
> envelope sends to the ordinary path is a spec amendment, not a round;
> Phase 4 waits for his piece, and if it has not arrived by the Phase 3
> pause, say so there; pause whenever something unexpected bears on
> spec adherence; the same session continues after each pause when the
> person says so, and if the person stops at a pause, end the report
> with the continuation prompt for a fresh session.

Every pause produces a report in this shape, in this order, in plain
language (no task ids, agent names, or tier names):

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
