# Tasks: The image page, refined

**Status**: Signed off (2026-09-24) by the `skeptical-reviewer` at the top tier — three blocking findings fixed and re-reviewed (the slider's segments indexed from the right, the borrowed-stage rule tested both ways, the sidecar clause corrected in the amendment), nine notes folded in; the re-review's non-blocking lines are in tasks.md's tier log. Phase 3a (the 2026-09-26 amendment) drafted and signed off 2026-09-26 at the top tier — one blocking finding (B1) fixed and re-reviewed, eight second looks taken. Phase 3b (the plugin amendment) drafted and signed off 2026-09-26 at the top tier — one blocking finding (B1) fixed and re-reviewed, nine second looks taken. Phase 3c (the lexicon amendment) drafted 2026-09-29 — pending sign-off.
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
(T1709, T1713, T1729, T1717) — the value set in its one place as plan.md's
"The tuning envelope, placed" (and its amendment table) names it, the matching row of its test
updated, one line in spec.md's Decided section, `sh scripts/verify.sh`
green — dispatched as routine and reviewed with the phase against the
outcome the spec records. A round that wants what the envelope sends to
the ordinary path (a fifth method, a fourth block that takes stages, the private-file
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

- [x] **T1709** — The first look, and the rounds. Not an
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

- [x] **T1709j** — Round: space and a divider between the label and
      its note ("CAMERA and then the tagline are … too close together,
      there needs to be some more space between them and/or a dividing
      character"). Plan: the T1709j paragraph. `global.css`: the one
      rule; compare.test.mjs (c): its pin. _Verify: green; BiDi at
      1512×982: the live note's label and note rects with the dot's
      computed content and margins between them; the no-script caption
      the same._

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
uses the site's accent color." Round: T1709i. **The decisions (2026-09-25):** gear names "look
good"; the method control's words and placement "fine unless you can
think of anything better"; the rest pair Camera | Finished confirmed;
no snapping; the method remembered for the tab's session ("keep tab's
session if it's not hard"); side by side stacks on the phone "for now,
though we may need to revisit later"; the switch's keys "good"; the
fade "fine, though maybe slightly longer, like 250ms?" — not a spec
018 token (180 / 480 / 950); put back to him; the heading and hint
words fine; the divider line "fine for now"; the switch's legend fine
as is. One more round: the label and its note too close — T1709j. **The
fade stays at 180ms** ("That's fine honestly. Keep it at 180ms"). "I
think the design on this is settled." Noted for the amendment: he
expects several compares through one piece or story — raw to
finished first, then raw to stage 1, raw through stage 2, … raw to
final with every stage — and asked that this load no duplicate
images.

## Phase 2 — The loupe (reviewer after the phase; walkthrough: under `npm run dev` on both screens with a mouse and a trackpad, and on a phone — on `/images/where-the-fog-lets-go/land-b/`, enter the quiet view; the cursor over the photograph says zoom, over the mat it still says leave; click a corner and the photograph grows to full detail around that point while the mat and the dark ground stay where they are, soft at first and then sharp as the larger export fades in; drag to move around it, scroll or pinch (trackpad and phone) to zoom between the fit and full detail, + and − to zoom, the arrows to pan; Esc or a click without dragging goes back to the fit, Esc again back to the page; at the fit the arrows step to the next photograph as before; on `/images/where-the-fog-lets-go/land-a/` (a 1800×1200 placeholder with no larger export, whose own file is already past full detail at its quiet size on both his screens — the number T1712 recorded, quoted in the report; if that read found it ready, the report names the page T1712 found not ready instead) the quiet view is exactly as before and a click leaves it, while some real portrait exports on the laptop do get a loupe from their own file (T1712's numbers); the question put to him: at the fit, a click on the photograph now zooms and a click on the mat or the dark ground leaves — is that the right reading of "a click at the fit steps back out", or should a single click keep leaving and the loupe open another way; with the system's reduce-motion setting on, the zoom jumps rather than grows and the sharp export still fades in; optionally, in the browser's network panel, the larger export is requested only at the first zoom and once; as many rounds as it takes, each a sub-lettered task under T1713)

- [x] **T1710** — The loupe's file on the page. Pattern: `src/lib/og.ts`
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

- [x] **T1711** — The loupe's state, pure. Pattern: T1707's shape in
      `compare.ts` and `compare.test.mjs`. Plan: "The loupe's state".
      `src/lib/loupe.ts`: `fullScale`, `zoomAbout`, `clampPan`,
      `loupeReduce` exactly as plan.md describes, the effects as a
      string union, each with a one-line comment. `loupe.test.mjs`:
      describe "(b) the state" — T1711's testing bullet in full, every
      transition listed in plan.md a case of its own. _Verify:
      `sh scripts/verify.sh` green (count recorded); mutation, reverted:
      Escape at zoomed made `leave-quiet` → the two-level case fails._

- [x] **T1712** — The loupe, wired. Pattern: the image page's
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
      with the barrier's line; matte.test.mjs green with one deliberate addition (the fourth quiet rule, T1712);
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

- [x] **T1713** — The second look, and the rounds. Not an
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

- [x] **T1712a** — Phase 2 review fixes. (1) `LOUPE.opensOn`
      semantics: `'gesture'` means a click on the photograph leaves
      and the wheel, a pinch or + opens (the reducer's fit click →
      `leave-quiet`), with a case; `'dblclick'` withdrawn from the
      union and the comment corrected (the zoom-in key opens under
      every value). (2) Safari's `gesturechange`: the ratio of
      successive `event.scale` into `pinch`, `preventDefault` on all
      three gesture events, bound with the wheel over the photograph.
      (3) `loupe.ts`'s comment no longer claims the loupe can share a
      stage's file. Plan: the T1712a paragraph. _Verify: green (count);
      the (b) case for `'gesture'` fails if the branch returns `stay`
      (mutation, reverted); a synthesised `gesturechange` with scale
      1.5 then 1.8 in the browser scales the loupe by 1.5 then 1.2
      (recorded at 1512×982)._

- [x] **T1713a** — Round: the loupe follows the mouse ("simply
      moving the mouse across the image moves the loupe, and it should
      track relative to the unzoomed image … when the mouse is in the
      center, the zoomed in loupe should be in the center … Then a
      click zooms back out"). Plan: rounds paragraph (a). `loupe.ts`:
      `LOUPE.pan: 'follow'`, the `hover` action and its reducer case,
      `createLoupe` sending `pointermove` without a press as `hover`
      for a mouse; `loupe.test.mjs`: `EXPECTED`, hover cases (centre →
      centre, corners → corners, clamped), the drag value's cases kept
      under `'drag'`. _Verify: green; `pan` mutation → EXPECTED fails;
      BiDi at 1512×982: with the loupe open, a mouse move to the box's
      centre gives tx = w(1−s)/2, to the bottom-right corner w(1−s),
      to the top-left 0; a click without movement closes._

- [x] **T1713b** — Round: the mat goes while zoomed ("Maybe remove
      the matte when zooming in"). Plan: rounds paragraph (b).
      `loupe.ts`: `LOUPE.mat: 'off'`, `data-loupe-open` on the stage
      while open (the overlay stays placed from the image's rect);
      `global.css`: the fifth quiet rule and the padding
      transition; barrier lists; matte (b)'s quiet list (a deliberate
      fifth); `loupe.test.mjs` (c) pins the rules; the padding
      transition reads the move token (motion barrier). _Verify: green;
      BiDi: the frame's padding 0 while open and its rect equal to the
      image's (the mat gone, the photograph unmoved), 40px after close;
      the padding transition 480ms, none under reduced motion._

- [x] **T1713c** — Round: the zoomed loupe is the full area ("there
      is still a matte sized frame around the zoomed in image that
      shows the unzoomed image which makes it look broken. We need
      the zoomed in loupe view to be the full area"). Plan: the T1713c
      paragraph. `global.css`: the fifth quiet rule gains `--mat: 0px`,
      the padding transition rule removed; `loupe.ts`: the attribute
      set and layout forced before the overlay is built from the
      grown box; tests: (c) pins, matte (b) as needed, the reducer's
      box unchanged in kind. _Verify: green; BiDi at 1280×1440 (the
      width-bound case) and 1512×982 on land-b: while open the loupe's
      rect equals the image's equals the frame's, the frame's rect
      equal to the quiet frame's outer rect before opening (the mat's
      box), no stage image visible outside the loupe; after close the
      fit rect and 40px mat return; s = fullScale of the grown box._

### Phase 2 record (the person's walkthrough)

**First look (2026-09-26).** The click at the fit "is fine"; what he
doesn't like is dragging: the loupe should follow the mouse, tracking
"relative to the unzoomed image", a click zooming back out. Keeps: the
loupe without a larger export ("Keep it"), the zoom range, the
gestures and keys, the durations. The window: "Maybe remove the matte
when zooming in." The recommended larger export: 4000px on the long
edge, "limited by the camera's resolution" (AUTHORING.md, T1715).
Rounds: T1713a, T1713b. **Second look:** the mouse tracking "works";
removing the mat "introduced a different issue where there is still a
matte sized frame around the zoomed in image that shows the unzoomed
image … We need the zoomed in loupe view to be the full area." Round:
T1713c. **Third look:** "Looks good, continue." Phase 2 closed.

## Phase 3 — Obsidian and the documents (reviewer after the phase; walkthrough: in Obsidian, with the rebuilt plugin installed as its README says — the fog piece's closing `:::compare` shows its three stages as images with their labels beneath in Live Preview, and turns back into its text when the cursor enters it; a leaf block like `::fullbleed` renders as before; `AUTHORING.md`'s new parts — the block, the stages, the larger export, the gear table — read as the rest of that document does and tell him what he needs to finish his piece)

- [x] **T1714** — The plugin shows a compare. Pattern: `LEAF_BLOCKS`,
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

- [x] **T1715** — The documents. Pattern: spec 018's T1607 (the docs
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

- [x] **T1715a** — Phase 3 review fixes. README's loupe sentence
      ("fills the whole area the mat and photograph had") and the same
      overstatement in `loupe.ts`'s doc comment, loupe.test.mjs (c)'s
      and matte.test.mjs (b)'s comments → "grows into the freed space
      with its shape kept; nothing of the unzoomed photograph shows
      around it"; `global.css`'s "the one assignment besides the forms"
      → "on the quiet frame"; a comment beside the fifth quiet rule
      that its order after the ready form is load-bearing;
      `src/content/gear.md`'s header: an unknown camera prints make and
      model as before, a lens its string; README's tree lists
      `obsidian-plugin.test.mjs`; any stale "The camera's frame"
      cross-reference in AUTHORING.md. _Verify: greps for each old
      phrase → 0; prettier clean on the three docs; `sh scripts/verify.sh`
      green._

### Phase 3 record (the person's walkthrough)

_Filled in at the pause._

## Phase 3a — The amendment: the stage's share, the pair blocks, the filmstrip (reviewer after the phase; `review: per-task` on T1721; walkthrough: under `npm run dev`, on both screens with a mouse and a trackpad, and on a phone — on `/images/where-the-fog-lets-go/land-b/` (a 3:2) and on a 2:3 page, the photograph now takes a share of the screen: on the laptop the horizontal one fills the height below the header, about 1,170 wide where it was 780, the vertical the same 520 × 780 it was; on the DualUp the horizontal 1,216 wide as before, the vertical 1,239 tall where it was 1,216 — the nav line under it on the first screen and the title one piece-spacing below the nav on both; the shares open at one, so the question is whether either should come down (at nine tenths three of these four would be smaller than before — plan.md's table), and whether a square goes with the verticals; the quiet view and the loupe exactly as before; on the fog piece, after the switch compare, a side block — Camera and Tones beside each other, each with its label and note beneath, nothing to choose, the same with script off, stacked on the phone — and a slider block — the handle at the centre, Camera left and Finished right, "Camera · Finished" fixed beneath and the note, no method words, dragged by mouse, trackpad, finger and the arrow keys, stacked with script off; every compare's method words gain "Filmstrip": one stage in the frame, arrows at its sides (none before the first, none after the last), ← → Home End once it has focus, a two-finger sideways scroll on the trackpad and a swipe on the phone that follow the hand and settle on the nearest stage, a legend click that slides there, the note following — the strip slides, it does not fade, and it stops at the last; land-b's page carries a slider in its story above the "Raw to finished" section, and the browser's network panel shows each stage file requested once there and on the fog piece; in Obsidian, the fog piece's side and slider show as its compare does; as many rounds as it takes, each a sub-lettered task under T1729)

**Status**: Signed off (2026-09-26) at the top tier (B1 fixed and re-reviewed; S1–S8 taken). Plan: "Amendment (2026-09-26)"
and its sections. The spec amendment's three changes, folded in after
the Phase 3 pause and before the real piece, so Phase 4 judges them on
his photograph too. Foundational within the phase, and ordered first:
T1719 (the constitution, alone in its commit), T1721 (the transform's
two descriptors and the fourth mode — the markup every later task
reads; `review: per-task`) and T1722 (the barrier that makes "one file
per stage" a fact of every build). The pause after this phase is a
tuning pause like Phase 1's and 2's: a round is one sub-lettered task
under T1729, per the cadence paragraph and plan.md's "The tuning
envelope, placed (amendment)"; a round that wants a fifth method or a
fourth block that takes stages goes to the person as a spec amendment
(spec.md's amended "ordinary path" list, as the preamble now reads). Task ids continue from T1718; the phase order is the
headers'.

- [x] **T1719** — The constitution, amended again, in its own commit
      before T1720. Pattern: T1700 and plan.md's "The constitution,
      first". Plan: "The constitution, again" — the three edits
      verbatim. `CLAUDE.md` only. Prettier on it (T1700's note: the
      role table's padding). _Verify: over `tr -s '\n ' ' ' < CLAUDE.md`
      (the prose wraps), `grep -o` finds "three blocks that take a
      photograph's stages", "and any after them" and "the three blocks
      that take stages" once each, and "looked at three ways" not at
      all; `git show --stat HEAD` lists `CLAUDE.md` alone;
      `sh scripts/verify.sh` green (nothing under test changes — the
      run is the record)._

- [x] **T1720** — The stage's share. Pattern: the paper rule it
      replaces and its comment in `global.css`; `src/lib/stage-sizes.ts`
      as it is (the literals' comment); matte.test.mjs's "one
      rectangle, turned", "the sizes hint agrees with the rule" and its
      (a) token pins. Plan: "The stage's share" and T1720's testing
      bullet. `global.css`: `:root` gains the two share tokens after
      `--frame-nav-h`'s block, under a comment (what they size; that
      `stage-sizes.ts` mirrors them and matte.test.mjs pins both); the
      `html:not([data-quiet]) .image-frame` rule deleted and the two
      `[data-shape]` rules written as plan.md spells them; the stage
      section's comment rewritten for the share rule (the L × S text
      out). `stage-sizes.ts`: `STAGE_SQUARE`, `STAGE_SHARE`,
      `stageShape`, `stageSizes` retuned, the header comment (the rule,
      the tokens it mirrors, now seven). `[...id].astro` and the mat
      sampler: `data-shape={stageShape(ar)}` on the stage figure.
      `matte.test.mjs`: (b) and (c) per T1720's bullet — "one
      rectangle, turned" replaced by "the stage's share" (the rule it
      pinned is gone; say so in the case's comment), the new pins, the
      table's eight numbers. _Verify: `sh scripts/verify.sh` green
      (count recorded); the two mutations named and reverted, each
      failing its case; `git diff -U0 main -- src/styles/global.css |
      grep '^@@'` → hunks only in `:root`'s two lines, the stage
      section's comment and the paper rule beside the earlier tasks'
      (listed) — none in `.image-stage`, `.image-frame`, `.image-frame
      img`, a quiet rule or the loupe section; matte.test.mjs's quiet
      pins and loupe.test.mjs unedited (`git diff main -- loupe.test.mjs`
      empty); in Firefox headless via BiDi at 1512×982 and 1280×1440 on
      land-b and a 2:3 page (named): the frame's rect against plan.md's
      table (±1px, the real header height recorded), frame bottom → nav
      top and nav bottom → head top (48 ± 1 each), `currentSrc`'s width,
      and the quiet view's frame rect equal to `main`'s — each number
      recorded here._

      _Recorded (T1720, Firefox 156 headless, DPR 2; header 75.80px
      real, `--header-h` 76px):_ 1512×982 land-b 1171.50 × 781.00 (main:
      781.00 × 520.67), `currentSrc` 1800w (the largest candidate;
      1668w on main); port-a (2:3, `--ar` 0.667) 520.92 × 781.00,
      1080w; 1280×1440 land-b 1216.00 × 810.67, 1800w; port-a
      826.40 × 1239.00 (main: 810.67 × 1216.00), 1200w. Frame → nav
      48.00 and nav → head 48.00 everywhere; the nav's bottom in view
      on the first screen at both (981.80; 1439.80). The quiet frame's
      rect equals main's in all four cases. 585 tests (+1).

- [x] **T1721** — The pair blocks in the transform, and the fourth
      mode. `review: per-task`. Pattern: T1705 — the `compare`
      descriptor, its `structure: 'compare'` branch and its test cases
      and fixtures in remark-pieces-blocks.test.mjs. Plan: "The pair
      blocks in the transform, and the fourth mode", its failure lines
      and T1721's testing bullet. `image-meta.mjs`: `COMPARE_MODES`
      gains `'filmstrip'`; `PAIR_WIDTH`; `BLOCK_BODIES` gains `side`
      and `slider` (`'stages'`) in the same commit as the descriptors;
      `firstAltFor` skips by the `'stages'` kind, its comment saying
      so. `remark-pieces-blocks.mjs`: `stageSizing` named once; the
      `side` and `slider` descriptors after `compare`, each with a
      comment (two stages, no attributes; `side` static, `slider` the
      compare's slider alone); the count check reading `max`; the root's
      width class from `PAIR_WIDTH`; `rejectBorrowedPrivate` naming the
      block; the no-attributes line; the header comment's descriptor
      notes. Tests per T1721's bullet in full. _Verify:
      `sh scripts/verify.sh` green (count recorded) — re-run by the
      orchestrator before committing; the `max` mutation named and
      reverted; `grep -n "rejectPrivateSrc(" remark-pieces-blocks.mjs`
      → the block loop's and the shorthand pass's calls as at T1705,
      none on a stage path._

- [x] **T1722** — The barrier: one file per stage. Pattern: T1703's
      scans in `scripts/check-private-files.mjs` and its temp-dir cases
      in private-files.test.mjs. Plan: "The barrier: one file per
      stage", its lines, T1722's testing bullet. Scan 2's two lists;
      `compares()` keeping the pane `img`'s `srcset` and `sizes`; scan
      4 and its line; the summary's count; the header comment's fourth
      paragraph. Tests per the bullet. _Verify: `sh scripts/verify.sh`
      green (count recorded) with the barrier's new summary line quoted
      (its stage-image count on today's build); each failing case
      exits 1 naming the page and the URL._

- [x] **T1723** — The side's static form; the fixtures; the page's
      stage images. Pattern: T1706 (the static rules, the fog piece's
      compare as fixture prose); the side-by-side view's rules in the
      compare section; `.prose`'s `container-type` rule for the
      container idiom. Plan: "The side block's static form, the
      fixtures, the page's stage images". `global.css`: the side's
      rules and container query, the selector lists extended.
      `compare.ts`: `enhanceCompare` skips `.piece-side` (one line,
      its comment). `image-meta.mjs`: `stageImageOptions(surface)`.
      `remark-pieces-blocks.mjs`: `stageSizing = () =>
      stageImageOptions('piece')`. `[...id].astro`: the section's stage
      `<img>` from `getImage({ src, alt: label, ...stageImageOptions('page')
      })`, `<Image>` gone from the section (D1723). `where-the-fog-lets-go/index.md` and
      `_land-b.md`: the fixture sentences and blocks as plan.md lists
      them (_Fixture_ marked). compare.test.mjs (a): the two source
      pins. _Verify: `sh scripts/verify.sh` green (count recorded), the
      barrier's line counting the new compares (three new blocks: the
      count before and after recorded); the built reads in
      T1723's bullet greped and quoted (the side's and slider's root
      classes, `_land-b.jpg`'s one `srcset` on both pages); the
      mutation (`width: 1400` added to the page's `getImage` call) →
      test (a)'s failing line pasted, reverted; on the built land-b page
      the story slider's and the section's panes for `_land-b.jpg`
      quoted with one identical `srcset` string and the section `<img>`'s
      attribute list equal to the story's; BiDi at 1512×982: the
      side's pane rects (equal widths, one top), captions visible, no
      `data-js`, the same with script off (the sandboxed-iframe
      recipe); at 480px stacked; the resource timeline on the fog piece
      and on land-b, one request per stage file (listed)._

      _Recorded (T1723, Firefox 156 headless, DPR 1, 1512×982):_ the fog
      piece's side wears no `data-js`, script on or off; its panes
      574 × 382.7 at x 176 and 762, one top, captions shown beneath;
      at 480px stacked (460.8 wide, y 0.3 and 361.5). Resource timeline:
      one request per stage file on the fog piece (`_land-b` →
      `_Z1L8xdw`, tones → `_2beXEa`, `land-b` → `_22INTs`) and on
      land-b (the story slider's and the section's Camera both
      `_Z1L8xdw`, Finished both `_22INTs`). Barrier: 6 compares, 14
      stage images. 612 tests; 784 images in dist (13 fewer).

- [x] **T1724** — The filmstrip's state, pure. Pattern: T1707 in
      `compare.ts` and compare.test.mjs (d). Plan: "The filmstrip's
      state". `compare.ts`: the six `COMPARE` keys and the words
      exactly as plan.md spells them, each commented; `stripAt`,
      `stripSettle`, `stripEnds`; `restView` and `noteIndex` taking
      `'filmstrip'`; the header comment's method count. Until T1726
      the control's fourth word shows the switch's view — no pause
      falls between. compare.test.mjs (d) per T1724's bullet, its
      header comment's (d) paragraph extended. _Verify:
      `sh scripts/verify.sh` green (count recorded); both mutations
      named and reverted, each failing its case by name._

- [x] **T1725** — The slider block, enhanced. Pattern: T1708's
      `enhance()` and T1709d's legend in `compare.ts`; compare.test.mjs
      (c)'s exact-body cases. Plan: "The slider block, enhanced".
      `compare.ts`: the `fixed` branch as plan.md describes, the
      comment above `enhanceCompare` naming the slider block and the
      side's skip. `global.css`: the fixed legend's rule. compare.test.mjs:
      a new describe "(e) the pair blocks and the filmstrip (the
      amendment)" with the rule's body, and (e)'s paragraph in the
      header comment. _Verify: `sh scripts/verify.sh` green (count
      recorded); the BiDi reads in T1725's bullet at 1512×982 and
      1280×1440, each recorded here; a touch-type pointer drag
      synthesised, or said line by line where it cannot be._

      _Recorded (T1725, Firefox 156 headless, the fog piece's slider,
      identical at 1512×982 and 1280×1440):_ `data-js`,
      `data-view="slider"`, no control, no hint, no legend button, no
      slot; legend "Camera" and "Finished" with the dot before the
      second; at rest split 50, `aria-valuetext` "Camera | Finished",
      divider at 333 of 666; drags to 25/50/75 → 24.94 / 50 / 75.06
      (whole-pixel pointer), Camera left each time; ← moves
      `aria-valuenow` by 2; the live note Finished's; a BiDi touch
      pointer drag 30→70% → 69.96; `compare-mode` null before and after,
      a stored `side` leaves the block a slider while the page's
      compare opens in side by side; script off: stacked (Camera 666×500
      at y 0, Finished at y 537 at 1512).

- [x] **T1726** — The filmstrip, enhanced. Pattern: T1708's slider in
      `enhance()` (the pointer capture, `slide`, the settle behind
      `!reducedMotion()`, `transitionend` on `--split`); the loupe's
      non-passive `wheel` listener and its `deltaMode` conversion in
      `src/lib/loupe.ts`; the handle's rules for the arrows' look.
      Plan: "The filmstrip, enhanced". `compare.ts`: the filmstrip
      view in `render()`, the arrows, `--i` and `--strip-at`, the
      keys, the drag, the wheel and its idle settle, the legend's
      paging, `data-paging` and `data-settling` behind
      `!reducedMotion()` and only when the target differs from `at`
      (a key at an end writes neither — a BiDi read), the width swap
      per `stripWidth`; the
      comment's list of what the script builds and writes. `global.css`:
      `:root`'s `--compare-peek` beside the handle's tokens (their
      comment extended), `@property --strip-at`, the filmstrip, arrow
      and hint rules, the two motion rules, the section's header
      comment ("five rules"). compare.test.mjs (b), (c), (e) per
      T1726's bullet. _Verify: `sh scripts/verify.sh` green (count
      recorded) with the motion and private-files barriers' lines;
      motion.test.mjs and matte.test.mjs green unedited
      (`git diff main -- motion.test.mjs` empty); `git diff -U0 main --
      src/styles/global.css | grep '^@@'` listed; the BiDi reads in
      T1726's bullet at both screens, each number recorded here; what
      headless cannot drive (a real trackpad scroll, a real swipe) said
      line by line for the pause._

      _Recorded (T1726, Firefox 156 headless, land-b's section, frame
      666.4 wide, identical at 1512×982 and 1280×1440):_ Filmstrip →
      `data-view`, `--strip-at` 0, offsets [0, 666.4, 1332.8], back
      arrow hidden, next 24px wide 8px in, centred; next → `data-paging`
      with `--strip-at 0.48s cubic-bezier(0.22, 1, 0.36, 1)`, 0.927 at
      200ms, `transitionend` clears it, lands at 1, note Tones; → to 2
      (next hidden), Home to 0, End to 2; → at the last and Home/← at
      the first write no `data-paging`; legend click from the last
      slides to 0; drag −0.6w → 0.60024 held with no transition, release
      → `data-settling` at `0.18s ease`, lands at 1; wheel deltaX 0.4w
      → 0.4, settles to 0 after the idle (220ms) with `data-settling`;
      deltaMode 1 × 3 lines → 0.072; vertical and diagonal wheels not
      prevented, no move; a click on the frame does nothing; reduced
      motion: no `data-paging`/`data-settling`, `all 0s`, the cut;
      `--compare-peek: 2rem` → `inset(0px -32px)`, 16px outside each
      edge hits the neighbour; script off: stacked (y 0, 540, 1025).
      Needs eyes at the pause: a real two-finger scroll's momentum
      against the settle, a real swipe under `pan-y`, the slide's and
      settle's feel, the arrows' look; the frames' focus ring is clipped
      by the strip's `clip-path` at peek 0 (inferred).

- [x] **T1727** — The plugin shows a side and a slider. Pattern: T1714.
      Plan: "Obsidian" (amendment). `obsidian-plugin/compare.ts`:
      `STAGES_PATTERN`, its comment; `main.ts`: the import and the
      comments. obsidian-plugin.test.mjs per T1727's bullet. _Verify:
      `sh scripts/verify.sh` green (count recorded); in
      `obsidian-plugin/`, `npm run build` exit 0 (or said, as T1714);
      the vocabulary test's "nothing knows the word" walk green._

- [x] **T1728** — The documents, again. Pattern: T1715 (its
      hand-editing rule) and AUTHORING.md's "A compare in a piece" for
      the voice. Plan: "The documents, again". Every claim read against
      the code and the kept values, not the first draft. _Verify:
      `grep -n "filmstrip\|:::side\|:::slider" AUTHORING.md README.md
      obsidian-plugin/README.md` and `grep -n "share" README.md` (hits
      listed); no README line still describes a 3:2 rectangle;
      `npx prettier --check AUTHORING.md README.md
      obsidian-plugin/README.md` clean; `sh scripts/verify.sh` green._

- [x] **T1728a** — Phase 3a review fixes. B1: the envelope row "where a
      `side` stacks" names compare.test.mjs (e) by string but no case
      pins it — add an (e) case pinning `.piece-side { container:
      compare-side / inline-size }`, `.piece-side .compare-frames {
      grid-template-columns: 1fr 1fr }` and the `@container compare-side
      (width < 560px)` block with its one-column body, by exact string
      or body. Fix-now notes: `choose()` clears `data-paging` and
      `data-settling` (a method change mid-settle cancels the
      transition, so `transitionend` never fires and the next filmstrip
      glide would inherit the state); compare.test.mjs's (c) opening
      line ("Three rules and nothing else") rewritten for five. _Verify:
      `sh scripts/verify.sh` green (count recorded); 560 changed →
      the new case fails by name, reverted._

- [x] **T1729a** — Round (Phase 3a pause, first look, 2026-09-26): the
      filmstrip's arrows looked cheap, the glyph off-centre. Cause: the
      mono face carries no ← → glyphs, so a system fallback drew them
      (Menlo in Firefox), off-centre by up to 1.5 × 2.5px. The arrow
      rules only: the chevron drawn in CSS as the handle draws its
      "=" — a `calc(var(--compare-handle) / 4)` square, 1px
      `currentColor` on `border-block-start` and `border-inline-end`,
      `rotate(45deg)` next / `rotate(-135deg)` back, then `translate(calc(-25%
      + 0.5px), calc(25% - 0.5px))`; the button `display: grid;
      place-content: center; padding: 0; font-size: 0` (the text keeps
      the name through `aria-label`); a `[hidden] { display: none }`
      rule (grid outranks the UA's hidden). Ring, fill and colour
      unchanged — measured equal to the handle's already. (e) pins by
      body. _Recorded:_ ink centroid vs the ring's centre +0.2/−0.19 × 0
      at both screens; muted computes `oklch(0.5 0.012 250)` on ring
      and chevron; 629 tests.

- [x] **T1729b** — Round (Phase 3a pause, first look, 2026-09-26): a
      trackpad gesture landed between stages too easily; he wants a
      sideways gesture to move one whole stage. `COMPARE.stripWheel`
      becomes `false | 'follow' | 'page'`, opening at `'page'`: the first
      sideways wheel event of a gesture at or past `stripWheelStepPx`
      (new, 4) pages one stage through `page()` and the gesture is then
      ignored, momentum included, until `stripWheelIdleMs` of quiet (any
      wheel event restarts it); `'follow'` is the hand-tracking path as
      built at T1726; a gesture at an end does nothing. Pure
      `stripWheelStep(mode, gated, deltaX, threshold)` pinned by a (d)
      table; `EXPECTED` updated; AUTHORING.md's filmstrip sentence.
      _Recorded (1512×982, land-b's section):_ a decaying burst
      40,30,20,10,5,2 → one page with `data-paging`, at 1; a second burst
      after 150ms → 2; at the last, nothing; leftward → 1; a single 3px
      event → nothing; a vertical burst not prevented, nothing; a
      25-event momentum tail over 600ms → one page. 630 tests. The 4px
      threshold is reasoned (settling fingers send 1–3px; a tilt wheel
      16px), not measured — his trackpad judges it.

- [x] **T1729c** — Round (Phase 3a pause, second look, 2026-09-26): after
      one gesture paged, another did nothing until the mouse moved.
      Cause: the gate's 150ms idle restarted on every wheel event —
      zero-delta and vertical ones too — and macOS's phase and momentum
      stream (Firefox's wheel transaction ends on a timeout or a mouse
      move) kept it shut; reproduced headless on the old code. Fix, one
      place: zero-delta events ignored; `COMPARE.stripWheelGateMaxMs`
      (new, 800) opens the gate under any stream; `stripWheelStep` takes
      the direction spent (−1/0/1) and a gesture the other way at or
      over the step pages back at once. `EXPECTED`, the (d) table (four
      reversal rows). _Recorded (1512×982):_ a burst then 2s of
      zero-delta events then a burst → 2; the same with 1px alternating
      jitter → 2; right then left within 100ms → back to 0; a same-way
      burst inside the gate → no second page; T1729b's checks hold; an
      unbroken ≥4px stream past 800ms pages again (the cap's trade).
      630 tests.

- [x] **T1729d** — Round (Phase 3a pause, second look, 2026-09-26): the
      arrows' lines still a little dark. One token, `--compare-arrow-color`
      on `:root` beside the handle's, at `color-mix(in oklab,
      var(--color-accent) 70%, var(--color-bg))`; the arrow rule's ring
      and chevron read it, the handle keeps the accent, muted stays
      `--color-muted`. `TOKENS` pins the value; (e) bodies updated.
      _Recorded:_ live arrows compute L 0.549 against the accent's 0.36
      at the same hue (the implementer's first oklch mix landed at hue
      159.5 — greener — and the orchestrator switched it to oklab
      before committing, 630 tests green); muted computes `oklch(0.5
      0.012 250)`, now darker in L than a live arrow — moot while
      `stripEnds` is 'hide', a look if it ever turns 'quiet'.

- [x] **T1729e** — Round (Phase 3a pause, third look, 2026-09-26): the
      arrows covered the photograph; he wants them outside the frame.
      `--compare-arrow-gap: 0.5rem` beside the handle tokens; the discs
      at `calc(-1 * (var(--compare-handle) + var(--compare-arrow-gap)))`
      outside each edge, centred on the frame's row (`grid-row: 1 / 2`
      on a `position: relative` figure); under `(max-width: 719.98px)`
      back inside at 0.5rem. The arrows become the figure's children
      (the frame's `clip-path` would hide them, and widening it would
      show the neighbours' edges), inserted after the frames so the tab
      order holds; `stripKey` listens on the frame and each arrow.
      `TOKENS`, (e) bodies, the phone block and the keys pinned.
      _Recorded:_ 1512×982 discs 8px outside the frame both sides,
      centred at its y; 1280×1440 the same; 390×844 8px inside; hidden
      at the ends; keys from a focused arrow page. Found: the strip's
      off-frame stages widen the page (`scrollWidth` 2422 at stage 0 on
      1512) — pre-existing since T1726, fixed at T1729f; a focused arrow
      that hides at an end drops focus (`stripEnds` 'hide', noted at
      the review); `legend: 'above'` would put the frame in row 2
      (not today's setting); a `compare-w-stage` block between 720 and
      ~1070px could push a disc past the window edge — unmeasured.
      631 tests.

- [x] **T1729f** — Defect found at T1729e, not a round: the filmstrip's
      off-frame stages counted toward the page's scrollable width
      (`clip-path` clips paint, not layout) — `scrollWidth` 2422 / 1756 /
      1512 at stages 0 / 1 / 2 on 1512, 2306 / 1640 / 1280 on 1280,
      1090 / 732 / 390 on the phone; no scrollbar (the body's
      `overflow-x: clip`) but scrollable by code. The frames rule now
      `overflow: clip; overflow-clip-margin: var(--compare-peek)`; the
      (b) pin retargeted. _Recorded:_ scrollWidth == clientWidth at
      every stage on all three; peek 2rem shows 32px of each neighbour
      (hit tests) and reverts; next → paging → 1, drag −0.6w → 0.6 →
      settles 1; the slider view byte-identical to before. Safari
      ignores `overflow-clip-margin` (peek reads 0 there); a peek past
      the phone's 16px padding brings the overflow back on phones —
      both in the rule's comment. 631 tests.

- [ ] **T1729** — The amendment's look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 3a
      pause, in the person's words, with T1720's, T1725's and T1726's
      numbers beside it. The questions, in plain language: the two
      shares — opening at one, where the laptop's landscape and the
      DualUp's portrait grow (781 → 1171 wide; 1216 → 1239 tall) and
      nothing shrinks; at nine tenths three of the four boxes
      he knows would be smaller than before (plan.md's table) — and
      whether a square is sized with the verticals or the horizontals;
      whether the title now sits where he wants it; the side block (its
      width, where it stacks); the slider block (its width, its fixed
      legend's look, and its note: the second stage's, as built, or
      both stages'); land-b's page, which now shows the photograph
      twice — the story's slider over the camera's frame and the
      finished photograph, then "Raw to finished" over all three
      stages — because only a compare in the story makes the section
      step aside: is that right, or should a side or a slider in the
      story do the same (a spec amendment if so); the filmstrip — its arrows (where, their look,
      hidden or quiet at the ends), its keys, whether it wraps, whether
      a sliver of each neighbour shows, whether the sideways scroll
      should move it, its width; the slide's and the settle's
      durations. The plugin's Live Preview of the two blocks. Each
      round is one sub-lettered task here (`T1729a`, `b`, …) as the
      cadence paragraph says; a round that changes a documented value
      also updates the sentence in `AUTHORING.md` or `README.md` that
      states it, in the same task. When he names the keeps they are
      recorded here and Phase 4 waits for his piece as its intro says.
      _Verify: every sub-lettered task green; each kept value agrees in
      its one place, its test row and spec.md's Decided line (a `grep`
      of each, listed); the documents agree (`grep` listed); the Phase
      3a record below filled in._

### Phase 3a record (the person's walkthrough)

Reached 2026-09-26 after T1728a's sign-off. First look, in his words:
"Almost everything looks good now! Only the filmstrip needs work now.
The arrow buttons don't look right. They look a bit 'cheap'. The arrows
aren't centered in the bubbles, and the outline color doesn't seem to
match the rest. They seem a bit dark, might lighten them up slightly.
Also, the trackpad controls for the filmstrip work, but they end up
landing somewhere between images too easily. I think that a left or
right gesture should just fully transition the image." → T1729a
(arrows drawn in CSS, centred), T1729b (a gesture pages one stage).
Second look: "I think the lines are still a little bit dark, but the
arrows are centered now. The trackpad gesture is good, but there is a
bug. If I do a gesture to move the next or previous, it works great,
except that I can't do another (nothing happens) until I move the
mouse slightly, and then it works again." → T1729c (the gate cannot
stick), T1729d (the arrows a third lighter). Third look: "Can the
arrow buttons on the filmstrip be outside the images rather than
inside them? It's not great that they are covering parts of the image
they are being showcased." → T1729e (outside the frame), and T1729f
for the page-width defect found there. (A stray `npm run dev` inside
`obsidian-plugin/` was his terminal, not the site.) **Keeps**, by
"almost everything looks good": both shares at 1 and a square sized
with the verticals; the title where it now sits; the side block wide
and stacking under 560px; the slider block at the column with its
fixed labels and the second stage's note; land-b's story slider beside
"Raw to finished" (only a compare stands in); the filmstrip's keys, no
wrap, no sliver, and the move and state durations. The look then
moved to Obsidian, where the plugin's figures were found wanting —
the second amendment (Phase 3b).

## Phase 3b — The plugin, representative (reviewer after the phase; `review: per-task` on T1730; walkthrough: in Obsidian on the laptop and on the DualUp, with the rebuilt plugin (0.3.0) installed as its README says and Readable line length on — the sampler piece in Live Preview shows every block as a figure: the singles at the text's width, the insets smaller and centred, the wides past the text on both sides and the half-bleeds out to one edge of the pane, the fullbleeds across the whole pane, the talls standing at most about four fifths of the window's height, centred; every diptych and triptych in one row (the weighted ones two to one, the wide and fullbleed ones breaking out), the grid in two columns, both strips as one row that scrolls sideways across the pane; each aside, row and held a frame on its named side with its paragraphs wrapping beside it (no hold); every caption beneath its frame in a smaller, muted face with its italics; the fog piece's compare, side and slider as rows of stages with their labels and a line naming the method ("Switch", "side", "slider"); the cursor put into any block turns it back into its text; switched to Reading view, the same page; a held's third paragraph edited in Live Preview shows the edit in Reading view; a src changed to a file that isn't there shows the dashed "not found" box in both views; the console check (View → Toggle Developer Tools → Console): `getComputedStyle(document.querySelector('[data-block="diptych"] .photo-pieces-frames')).display` prints `flex` and the grid's prints `grid`, where the old rows printed `block`, and a fullbleed's frames measure the pane's width (`document.querySelector('[data-block="fullbleed"] .photo-pieces-frames').getBoundingClientRect().width` against `document.querySelector('.cm-scroller').clientWidth`, less its padding); the editor otherwise behaves as it did — hover previews, menus, scrolling; as many rounds as it takes, each a sub-lettered task under T1735)

**Status**: Signed off (2026-09-26) at the top tier (B1 fixed and re-reviewed; S1–S9 taken). Plan: "Amendment 2 (2026-09-26): the plugin, representative".
the plugin, representative" and its sections. The spec's second
amendment, folded in at the Phase 3a pause and before the real piece,
because the piece is written in Obsidian. The plugin only: nothing the
site builds changes, and the suite's existing cases stay green. Foundational within the phase, and
ordered first: T1730 (the block table and the scanner — what both
renderers and the stylesheet's class test read; `review: per-task`,
because a block misread there is misdrawn in both views and the
equality test is what keeps it honest from here on) and T1731 (the
one figure and the stylesheet). The renderers follow, then the
documents, then the look. The implementer has no Obsidian: its Verify
is the suite, the plugin's `npm run build` and greps; what the figures
look like in both views is the person's at the pause. A round at the
pause is one sub-lettered task under T1735, as the cadence paragraph
says of its look tasks: a value in `styles.css`'s `body` rule and its
row in `PLUGIN_TOKENS`, one line in spec.md's Decided section; a round
that wants interaction, motion, the site's typography or ground in the
plugin, or the plugin importing the transform goes to the person as a
spec amendment (spec.md's ordinary-path list). Task ids continue from
T1729.

- [x] **T1730** — The block table and the scanner. `review: per-task`.
      Pattern: `LEAF_BLOCKS`, `parseAttrs` and `resolveRelative` in
      `obsidian-plugin/main.ts`; `obsidian-plugin/compare.ts` (the
      obsidian-free file shape, its header comment); the vocabulary
      test's processor harness (`remark-pieces-vocabulary.test.mjs`
      ~18–37) for the cross-check. Plan: "The block table", "The
      scanner", and the testing bullets "The table equals the
      vocabulary" and "The scanner". New `obsidian-plugin/blocks.ts`:
      the types, `PLUGIN_BLOCKS` in the transform's order,
      `METHOD_WORDS`, `DEFAULT_MODE`, `parseAttrs` and
      `resolveRelative` moved unchanged, `parseBlocks`.
      `compare.ts`: the image regex exported and read by
      `parseCompareBody` and `parseBlocks` alike (`STAGES_PATTERN`
      stays until T1732). `main.ts`: imports `parseAttrs` and
      `resolveRelative` from `blocks.ts`, its local copies deleted;
      nothing else. `obsidian-plugin.test.mjs`: the equality, scanner,
      edge and `resolveRelative` cases as the plan lists them, the
      sampler's and the fog piece's tables hand-written from the files.
      _Verify: `sh scripts/verify.sh` green (count recorded); in
      `obsidian-plugin/`, `npm run build` exit 0; the three mutations
      (a `mystery` entry; `held`'s forms `'both'`; the fence skip
      removed) each fail by name and are reverted, the failing lines
      pasted; the cross-check's two counts (33, 8) and its image-src
      comparison quoted from the test output; the paragraph-then-leaf
      case green both through the scanner and through the harness._

- [x] **T1731** — The figure and the stylesheet. Pattern: `BlockWidget.toDOM`
      in `main.ts` (the DOM it builds, the missing box's text);
      `styles.css` as it is; compare.test.mjs's (b) `TOKENS` and its
      use of `blocks`/`uncomment` from `src/lib/ground.ts`. Plan: "The
      figure", "The stylesheet", "The tuning envelope, placed
      (amendment 2)" and the testing bullets "The figure" and "The
      stylesheet". New `obsidian-plugin/figure.ts`: `FigureNode`,
      `figureTree`, `toDom` (standard DOM calls only — no Obsidian
      `addClass`/`setText`, so the file stays obsidian-free).
      `styles.css` rewritten: the `body` tokens at the table's values,
      the two pane hosts, every layout, `white-space: normal` on
      `.photo-pieces-block`, `.photo-pieces-hidden`; every
      non-custom declaration `!important`; a header comment saying why
      (the Phase 3a collapse) and that the test refuses one without.
      Live Preview draws with the old classes until T1732 — no pause
      falls between. `obsidian-plugin.test.mjs`: the figure and
      stylesheet cases, `PLUGIN_TOKENS`. _Verify: `sh scripts/verify.sh`
      green (count recorded); `npm run build` exit 0; the three
      mutations (an `!important` removed; a token's value; a class
      misspelt) each fail by name, reverted, lines pasted._

- [x] **T1732** — Live Preview draws every block. Pattern: today's
      `buildDecorations`, `directiveField` and `BlockWidget` in
      `main.ts`. Plan: "Live Preview", "The plugin's own files".
      `main.ts`: one pass over `parseBlocks`, `FigureWidget` (toDOM
      through `figureTree` and `toDom`, a `Component` per widget
      unloaded in `destroy`, `MarkdownRenderer.render` for caption and
      prose, `view.requestMeasure()` after it resolves, `eq` by
      content and path), `resolver(app, sourcePath)`; `LEAF_BLOCKS`,
      `DIRECTIVE_PATTERN` and `BlockWidget` deleted; the header comment
      rewritten. `compare.ts`: `STAGES_PATTERN` and its comment deleted.
      `obsidian-plugin.test.mjs`: the `STAGES_PATTERN` describe block
      deleted — its three cases were retargeted to the scanner at
      T1730; the commit message names them. `manifest.json`,
      `package.json`: 0.3.0 and the descriptions.
      `remark-pieces-vocabulary.test.mjs`: the "nothing … knows the
      word" walk's file list (~974–979) gains
      `obsidian-plugin/blocks.ts` and `obsidian-plugin/figure.ts` beside
      `main.ts` — the one edit to a site test file in this phase,
      authorized at sign-off (plan: "The vocabulary walk reaches the new
      files"). _Verify:
      `sh scripts/verify.sh` green (count recorded — the three deleted
      cases accounted for against T1730's additions); `npm run build`
      exit 0; `grep -n "STAGES_PATTERN\|LEAF_BLOCKS\|DIRECTIVE_PATTERN\|photo-pieces-preview" obsidian-plugin/*.ts obsidian-plugin/styles.css obsidian-plugin.test.mjs`
      → no hits; `grep -n "figureTree" obsidian-plugin/main.ts` → the
      widget's call; the vocabulary walk green with
      `git diff -U0 -- remark-pieces-vocabulary.test.mjs` showing the
      two added paths and nothing else. The figures in Obsidian
      are the person's at the pause._

- [x] **T1733** — Reading view draws the same figures. Pattern: T1732's
      `resolver` and `toDom` call; the plan's `sectionPieces` signature.
      Plan: "Reading view" and the testing bullet "Reading view's
      sections". `blocks.ts`: `sectionPieces`, `blockSignature`.
      `main.ts`: `registerMarkdownPostProcessor` — `getSectionInfo`
      (`null` → leave), the cached parse, the section emptied and
      rebuilt from its pieces (runs through `MarkdownRenderer.render` on
      a `MarkdownRenderChild` given to `ctx.addChild`; figures through
      `toDom(figureTree(…))`), `photo-pieces-hidden` added for none and
      removed when a run yields pieces; the signature map by
      `sourcePath`, computed on every call with section info, and the
      once-per-tick `previewMode.rerender(true)` for that file's leaves
      in `'preview'` mode whenever the signature differs.
      `obsidian-plugin.test.mjs`: the `sectionPieces` and
      `blockSignature` cases. _Verify: `sh scripts/verify.sh` green
      (count recorded); `npm run build` exit 0; the dropped
      `startLine >= lineStart` mutation fails by name, reverted, line
      pasted; `grep -n "registerMarkdownPostProcessor\|figureTree" obsidian-plugin/main.ts`
      → the post-processor and both renderers' calls._

- [x] **T1734** — The documents, for the plugin. Pattern: T1728 (its
      hand-editing rule) and the plugin README's own voice. Plan: "The
      documents" (amendment 2). `obsidian-plugin/README.md` rewritten
      as the plan says (every block in the table with both views; the
      one raw case; the path paragraph, install and rebuild kept; "How
      to check it"; "Extending" for the table, the equality test and the
      `!important` rule). `AUTHORING.md`'s "Obsidian settings that
      matter" plugin bullet rewritten, the Reading-view-out-of-scope
      sentence gone; any other sentence in `AUTHORING.md` or
      `README.md` that says containers stay raw or Reading view is not
      handled, corrected. Every claim read against the code as built.
      Hand-edit the prose (never script-rewrap; grep for lines beginning
      with a CSS `>` or `+` before any format run). _Verify:
      `grep -n "raw text\|raw by\|Reading view\|Reading View\|out of scope" obsidian-plugin/README.md AUTHORING.md README.md`
      (hits listed — none says a block of the vocabulary stays raw or
      Reading view is unhandled); `grep -c ":::held\|:::grid\|:::aside" obsidian-plugin/README.md`
      ≥ 1; `npx prettier --check obsidian-plugin/README.md AUTHORING.md README.md`
      clean; `sh scripts/verify.sh` green; `npm run build` exit 0._

- [x] **T1734a** — Phase 3b review fix-now (signed off, nothing
      blocking). (1) The plugin's own `MarkdownRenderer.render` calls
      (captions, prose, Reading view's runs) run every post-processor
      again with the note's `sourcePath`; if `getSectionInfo` there
      returns the fragment as `text`, its signature (`''`) differs from
      the note's and schedules `rerender(true)` — a possible loop. Guard
      it: key the signature by `ctx.docId` with the path (a sub-render
      is another document), or accept a call only when the info's text
      is the note's whole text — pick the one the typings support and
      say why; a `.catch` on the widget's `Promise.all`. (2) A case
      refusing any import in `obsidian-plugin/*.ts` other than
      `obsidian`, `@codemirror/*` and `./` — the plugin never imports
      the transform. (3) The token case asserts `body`'s custom
      properties equal `Object.keys(PLUGIN_TOKENS)`. (4) AUTHORING.md
      ~433: the missing box shows in both views. _Verify:
      `sh scripts/verify.sh` green (count recorded); `npm run build`
      exit 0; a stray import added to blocks.ts → (2) fails by name,
      reverted; a `--photo-pieces-foo` added to body → (3) fails,
      reverted._

- [x] **T1735a** — Round (Phase 3b pause, first look, 2026-09-27, on
      the laptop): "some of them still don't [render], such as the full
      and half-bleed … Triptych isn't keeping the correct ratios … it
      seems to have a pretty narrow space for content and keeps
      everything inside it." His console: the fullbleed frame 849 wide,
      margin-left −74.5px, flex, in a 913 scroller with the sizer at
      700 — sized right, clipped. Cause, read from Obsidian 1.8.7's own
      app.css (in the installed asar): `.markdown-source-view.mod-cm6
      .cm-content > [contenteditable=false] { contain: paint
      !important }` on every CodeMirror widget, and `.cm-content > * {
      margin: 0 !important }`. Fix: one rule on the widget root at
      higher specificity, `contain: none` and `margin-block:
      var(--photo-pieces-gap)`, both `!important`; pinned by a
      stylesheet case that checks the selector outranks both. Reading
      view has no such clip. The narrow space is Readable line length
      (700px), the intended setting; off, every block is the pane and
      nothing breaks out. Held not holding and equal heights drawn as
      equal widths are as designed. The triptych: no cause found in the
      code (equal columns at each image's own ratio, as the site); a
      wide/fullbleed triptych was clipped by the same bug; a console
      read is with him. Found: `full` stops at the hosts' 32px file
      margins, not the pane's edge; the plugin weights a triptych, the
      site only a diptych. 727 tests.

- [x] **T1735b** — Round (Phase 3b pause, second look, 2026-09-27): the
      grid's frames top-aligned (a 3:2 high beside a 4:5 with white
      under it) where the site centres each row on the midline. One
      declaration, `align-items: center !important`, on the grid's
      frames rule; a stylesheet case pins it. Judged as built from his
      screenshots: the midline triptych (equal columns, own ratios,
      centred — the site's rule); equal heights drawn as equal widths
      (the known limitation, offered as a round); the stage blocks'
      labels beneath each stage and the method line under the row
      (representative; a one-line legend offered as a round). 728
      tests. Finding: no stylesheet case checks a layout rule's body
      against the site's equivalent (the pair's centring is unpinned)
      — sweep note.

- [x] **T1735c** — Round (Phase 3b pause, third look, 2026-09-27):
      "Triptychs still aren't rendering correctly. Can we fix that?" —
      the equal-heights triptych at equal widths (the midline one is
      the site's rule and stays). The known limitation superseded:
      `figureTree` marks a `match="height"` pair
      `photo-pieces-match-height`; the pane rule `flex:
      var(--photo-pieces-ar) 1 0`, default 1, after the weight rule;
      `matchHeights(figure)` (figure.ts, standard DOM) writes each
      pane's ratio from the image's natural size once every pane has
      loaded, normalised by `paneRatios` so the smallest is 1; both
      renderers call it after `toDom`. Four root-class cases, a
      `paneRatios` table, the rule pinned; the README row. A pair with
      a missing or unloaded image stays at equal widths. 737 tests.

- [ ] **T1735** — The plugin's look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 3b
      pause, in the person's words. The questions, in plain language:
      does a piece read through in Obsidian now give a good sense of
      its layout and flow, in both views, on both screens; the widths
      — the inset (about two thirds of the text), the wide (past the
      text, up to nearly the whole pane), the fullbleed (the whole
      pane), the side frames (under half the text), the tall (at most
      four fifths of the window's height — the whole Obsidian window,
      not the note's pane, which the spec's sentence names: ask which
      he wants, and record the answer as a Decided line that settles
      that sentence; the pane is the plan's named fallback) — and the grid's columns, the
      gaps, the strip's height, the caption's size and colour; the line
      naming the method under a compare, side or slider — keep it, and
      are the words right (the side and slider blocks show their own
      names, lowercase, so they read apart from a compare's "Slider");
      whether Reading view refreshing after an edit is noticeable; the
      console check's three lines, pasted as he reads them; whether
      anything else in Obsidian changed with the plugin on. Each round
      is one sub-lettered task here (`T1735a`, `b`, …); a round that
      changes a value the plugin README states updates it in the same
      task. When he names the keeps, they are recorded here and Phase 4
      waits for his piece as its intro says. _Verify: every
      sub-lettered task green; each kept value agrees in `styles.css`,
      `PLUGIN_TOKENS` and spec.md's Decided line (a `grep` of each,
      listed); the plugin README agrees; the Phase 3b record below
      filled in._

### Phase 3b record (the person's walkthrough)

_Filled in at the pause._

## Phase 3c — The lexicon and the photograph's home (reviewer after the phase; `review: per-task` on T1739; walkthrough: on the laptop, the site built and previewed (`npm run build && npm run preview` — search needs the build): the nav reads Home, Journal, Photographs (where it goes as settled before T1742), Places, Galleries, About, Search, and no page says "piece" or "pieces" in its own words; the front door lists the latest three newest first, "Dock, late" among the journal entries as its frame, its date and its title, opening `/photographs/dock-b/`; the draft fixture is nowhere — not on the front door, nothing at `/photographs/draft-fixture/`, nothing when searching "Draft fixture"; the addresses: the fog entry at `/journal/where-the-fog-lets-go/`, its photographs at `/photographs/where-the-fog-lets-go/land-b/`, a photograph of the photographs folder at `/photographs/dock-a/`, and `/pieces/…` and `/images/…` gone; the journal index, a category page, the search page, a photograph page ("From the journal entry …", "In the journal", "Also in") and the About page's stand-in read in the new words; in Obsidian, the moved samples — `src/content/journal/vocabulary-sampler/index.md`, and the matte sampler, whose borrowed photographs now come from `../../photographs/` — draw every figure as before, none "not found"; and, if he wants to, the spec's publishing flow for real: a photograph and its `_<name>.md` with `draft: true` in `src/content/photographs/`, nothing at its address under `npm run dev`, then the draft line removed and `published:` written, and it stands on the front door; as many rounds as it takes, each a sub-lettered task under T1745)

**Status**: Draft — pending sign-off. Plan: "Amendment 3 (2026-09-29): the
lexicon, the photograph's home" and its sections. The spec's third
amendment, folded in while the Phase 3b pause is held open and before
the real piece, because the piece is written against the folders, the
addresses and the fields it settles. **One product question is open**
(plan: "Open — a product question for the person"): where the nav's
Photographs goes. T1742 is not dispatched until the answer is
transcribed into the plan and into T1742; if the answer is a new index
page, that page is a task drafted from his answer and inserted before
T1742; T1743 follows T1742. Foundational within the phase, and ordered
first: T1736 (the constitution, its own commit), T1737 and T1738 (the
homes and the addresses moved — large and mechanical, each green on its
own, so a failure points at one kind of change) and T1739 (the id rule —
`review: per-task`, because every photograph's address, every gallery
list, every borrowed reference and place cover reads it, and a wrong id
re-addresses pages without failing). Then the draft and the date, the
front door, the words, the barrier that pins them, the documents, the
look. The implementer runs no browser here: every check is the suite,
the build's barriers and greps over `dist/`; the Obsidian samples and
how the words read are the person's at the pause. A round at the pause
is one sub-lettered task under T1745, as the cadence paragraph says of
its look tasks: a value in its one place (plan: "The tuning envelope,
placed (amendment 3)") and its test row, one line in spec.md's Decided
section; a round that wants a fourth form of piece, the place tour, the
study, redirects, or a change to a journal entry's frontmatter or to how
a journal folder's photographs are published goes to the person as a
spec amendment (spec.md's ordinary-path list). Task ids continue from
T1735.

- [ ] **T1736** — The constitution, a third time. Not code; its own
      commit, before T1737. Pattern: T1719 (the constitution, again).
      Plan: "The constitution, a third time". `CLAUDE.md` only: "What
      this project is" replaced by the plan's text (unquoted, the three
      forms as a list); the Content model clause's five replacements
      and the Images paragraph's two, each exactly as the plan writes
      them; nothing else in the file. Hand-edited. _Verify:
      `git diff --stat` → `CLAUDE.md` alone;
      `grep -n "gallery-images\|content/pieces\|/images/<id>\|a single \`pieces\`" CLAUDE.md`
      → no hits;
      `grep -n "src/content/journal\|src/content/photographs\|/photographs/<id>/\|published:\|never an address" CLAUDE.md`
      → the new lines, listed; `npx prettier --check CLAUDE.md` clean;
      the commit's hash recorded here for AC 27, before T1737's._

- [ ] **T1737** — The homes, moved. Large and mechanical: moves and
      path strings only, no behaviour, no id, URL or word on a page
      changes. Pattern: none to copy — the plan's list is the task.
      Plan: "The homes, moved" and the testing bullet "The homes".
      First, recorded here: `git ls-files src/content/pieces | wc -l`,
      `git ls-files src/content/gallery-images | wc -l`,
      `git ls-files tests/pieces tests/gallery-images | wc -l`, and the
      test and page counts from `sh scripts/verify.sh`. Then the four
      `git mv`s and every reader the plan lists: `content.config.ts`;
      the collection's name wherever it is read or typed; `images.ts`'
      glob and message; `image-meta.mjs`' `PHOTOGRAPHS_ROOT`,
      `JOURNAL_ROOT`, `sidecarImageId`'s pattern, the messages
      (`GALLERY_FOLDER` stays until T1739); the transform's flat-root
      check; `gen-placeholders.mjs`; the two samplers'
      `../../photographs/` srcs; the dev pages; every test's path
      strings, `resolveRelative`'s cases among them. _Verify:
      `sh scripts/verify.sh` green, the test count and the page count
      equal to before; the three file counts equal under the new names;
      `git diff -M --cached --stat` before the commit shows every file
      under the four folders as a rename, the two samplers' `index.md`
      the only ones with changed lines;
      `git grep -nE "gallery-images|content/pieces|tests/pieces|GALLERY_ROOT|'pieces'[,)]|<'pieces'>" -- . ':!specs' ':!DECISIONS.md' ':!ROADMAP.md' ':!AUTHORING.md' ':!README.md' ':!obsidian-plugin/README.md'`
      → only the matte sampler's surface name (`'pieces'`, a dev
      route's segment — code), every hit listed; in `obsidian-plugin/`,
      `npm run build` exit 0._

- [ ] **T1738** — The addresses, moved. Mechanical. Pattern: T1737's
      discipline. Plan: "The addresses, moved" and the testing bullet
      "The addresses". The three `git mv`s under `src/pages/`; every URL
      and page path the plan lists; the tests' expected URLs and source
      paths. The nav's label stays "Pieces" until T1742. _Verify:
      `sh scripts/verify.sh` green, counts equal to T1737's;
      `ls -d dist/journal dist/photographs dist/og/journal` present,
      `ls -d dist/pieces dist/images dist/og/pieces` → none;
      `grep -c 'href="/photographs/where-the-fog-lets-go/' dist/journal/where-the-fog-lets-go/index.html`
      ≥ 1;
      `grep -rlE '(="|>)(https?://[^/"<]+)?/(pieces|images)/' dist --include=*.html --include=*.xml`
      → none;
      `git grep -nE "src/pages/(pieces|images)|og/pieces|(^|[^a-z_-])/(pieces|images)/" -- . ':!specs' ':!DECISIONS.md' ':!ROADMAP.md' ':!AUTHORING.md' ':!README.md' ':!obsidian-plugin/README.md'`
      → none, or each hit listed and explained._

- [ ] **T1739** — The id rule. `review: per-task`. Pattern:
      `parseImagePath`, `sidecarImageId`, `homeSlugOf`,
      `validateGalleries` and the place-cover loop as they are;
      image-meta.test.mjs's and galleries.test.mjs's case shapes. Plan:
      "The id rule", the failure lines, and the testing bullet "The id
      rule". `image-meta.mjs`: `PHOTOGRAPHS_FOLDER`, `imageIdOf` and
      every id built through it; `GALLERY_FOLDER` deleted; `homeSlugOf`
      by the slash; `sidecarImageId`; the reference kind `photographs`;
      `oldIdHint`, `placeCoverProblem`, `nameCollisions`;
      `classifyContentImage`'s slug guard. `images.ts`:
      `nameCollisions` after discovery; the place-cover loop through
      `placeCoverProblem`; the places warning's words; the doc comments.
      The transform: `checkReferenceShape`'s comment.
      `src/content/galleries/*.md`: every `gallery/<name>` → `<name>`.
      Tests: every expected `gallery/…` id and `/photographs/gallery/…`
      URL in its bare form; the new cases. _Verify:
      `sh scripts/verify.sh` green (count recorded, the new cases
      named);
      `test -f dist/photographs/dock-a/index.html && test -f dist/photographs/where-the-fog-lets-go/land-b/index.html && test ! -e dist/photographs/gallery && echo ok`;
      `grep -o 'href="/photographs/[^"]*"' dist/galleries/editors-picks/index.html`
      → bare ids, quoted; `grep -rn "gallery/" src/content/galleries` →
      none; `git grep -n "GALLERY_FOLDER"` → none;
      `git grep -nE '\$\{[A-Za-z.]*folder\}/' -- src remark-pieces-blocks.mjs`
      → `imageIdOf` and the related strip's journal-only `startsWith`,
      listed; the mutation and the three one-time build edits as the
      plan lists them, each failing line pasted and each reverted. The
      orchestrator re-runs `sh scripts/verify.sh` before committing._

- [ ] **T1740** — A photograph's draft and date. Pattern: `imageMeta`'s
      commented fields; the registry's orphan loop; the reasons in
      `validateGalleries` and `referenceProblems`;
      `gen-placeholders.mjs`' photographs list. Plan: "A photograph's
      draft and date", the failure lines, and the testing bullet "The
      draft and the date". `content.config.ts`: `draft`, `published`.
      `image-meta.mjs`: `PHOTOGRAPH_FIELDS`, `photographOnlyProblems`,
      the draft reasons for a bare id. `images.ts`: the sidecar-first
      order, the photographs folder's status, `SiteImage.published`.
      Fixtures: `_dock-b.md`'s `published:` (between the two newest
      published journal entries — the three dates recorded) and its
      story's line; `draft-fixture.jpg` generated; `_draft-fixture.md`
      as the plan writes it. Tests as the plan lists them. _Verify:
      `sh scripts/verify.sh` green (count; the page count unchanged —
      the draft has no page); `test ! -e dist/photographs/draft-fixture && echo ok`;
      `grep -rl "draft-fixture" dist --include=*.html --include=*.xml --include=*.json`
      → none; `grep -c "Dock, late" dist/photographs/dock-b/index.html`
      ≥ 1; the four one-time edits as the plan lists them, each failing
      line (or the page count one higher) pasted and each reverted; the
      new fixture's EXIF read with `exifr` and pasted (`Fixture`
      strings, no GPS)._

- [ ] **T1741** — The front door's list. Pattern: `PieceList.astro`'s
      row; the frozen tunables and table-driven cases of
      `src/lib/compare.ts` and compare.test.mjs. Plan: "The front door's
      list" and its testing bullet. New `src/lib/front-door.mjs`
      (`FRONT_DOOR`, `mergeLatest`) and `front-door.test.mjs`.
      `PieceList.astro`: `items` and the photograph row. `index.astro`:
      the merge. `journal/index.astro`, `categories/[category].astro`:
      journal items. _Verify: `sh scripts/verify.sh` green (count); the
      tie mutation fails by name, reverted, line pasted; from
      `dist/index.html`'s `.index-feed`, the rows' hrefs and meta lines
      in order (grep, quoted): `FRONT_DOOR.latest` rows,
      `/photographs/dock-b/` between the two entries its date falls
      between, with its `note-cover` image and "Dock, late", no
      `draft-fixture`; `dist/journal/index.html` and
      `dist/categories/landscape/index.html` (or the category the
      entries carry) with the same number of rows as T1740's build._

- [ ] **T1742** — The words. **Waits on the open question**: dispatched
      once where the nav's Photographs goes is transcribed into the plan
      and here. Pattern: the photograph page's `WORDING` block (the one
      place a page keeps its words); `NAV_ITEMS`. Plan: "The words" and
      the testing bullet "The words". `consts.ts`, `index.astro`,
      `journal/index.astro`, `categories/[category].astro`,
      `search.astro`, the photograph page's `WORDING` and its
      description's fallback, `about/index.astro`, each at the plan's
      opening value. New `lexicon.test.mjs` with the consts case.
      _Verify: `sh scripts/verify.sh` green (count);
      `grep -rniE "\bpieces?\b" src/consts.ts src/pages/about src/pages/search.astro src/pages/index.astro src/pages/journal/index.astro src/pages/categories`
      → each hit listed, every one code (an import, an identifier, a
      comment, an `id`) and none a printed word;
      `grep -rnE "(title|description)=[{\"'\`][^>]*\bpieces?\b" src/pages src/components src/layouts`
      → none; the built nav,
      `grep -oE '>(Home|Journal|Photographs|Places|Galleries|About|Search)<' dist/index.html`
      in order, quoted; `grep -rliE ">[^<]*\bpieces?\b" dist --include=*.html`
      → pages listed, each hit inside a journal entry's own prose (T1743
      pins the rest)._

- [ ] **T1743** — The lexicon barrier. Pattern:
      `scripts/check-private-files.mjs` (its header comment, its
      tag-depth walk from scan 3, its `[dir]` argument, its summary
      line) and private-files.test.mjs (temp trees, `execFileSync`).
      Plan: "The lexicon barrier" and its testing bullet. New
      `scripts/check-lexicon.mjs`; `package.json`'s `postbuild` gains
      `&& node scripts/check-lexicon.mjs` after `check-private-files`;
      `scripts/verify.sh`'s summary grep gains `\[check-lexicon\]`;
      lexicon.test.mjs gains the barrier's cases. _Verify:
      `sh scripts/verify.sh` green with the `[check-lexicon]` line
      quoted (pages read, regions, strings, one draft, one front-door
      photograph); the two mutations fail by name, reverted, lines
      pasted; one-time: `NAV_ITEMS`' "Journal" back to "Pieces" → the
      build fails, its first three lines pasted, reverted;
      `git diff -U0 -- package.json` → the `postbuild` line only._

- [ ] **T1744** — The documents. Pattern: T1728 and T1734 (their
      hand-editing rule; each document's own voice). Plan: "The
      documents" (amendment 3). `AUTHORING.md`, `README.md`,
      `obsidian-plugin/README.md` as the plan says, every claim read
      against the code as built — the ids, the addresses, the fields,
      the messages. Hand-edit the prose (never script-rewrap; grep for
      lines beginning with a CSS `>` or `+` before any format run).
      _Verify:
      `grep -nE "gallery-images|content/pieces|/pieces/|/images/|gallery/[a-z]" AUTHORING.md README.md obsidian-plugin/README.md`
      → none;
      `grep -nE "src/content/photographs|published:|draft: true|\.\./\.\./photographs/" AUTHORING.md README.md`
      → each at least once, listed; `grep -niE "piece folder" AUTHORING.md README.md`
      → none; `npx prettier --check AUTHORING.md README.md obsidian-plugin/README.md`
      clean; `sh scripts/verify.sh` green._

- [ ] **T1745** — The lexicon's look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 3c
      pause, in the person's words. The questions, in plain language:
      the nav's four words, and Photographs where it now goes; the
      front door's list — a photograph among the journal entries as its
      frame, its date and its title, three rows, the headings "Read the
      journal" and "Journal and photographs"; the address shapes —
      `/journal/<entry>/`, `/photographs/<entry>/<name>/` for an
      entry's photographs, `/photographs/<name>/` for the photographs
      folder's; the words on the photograph page ("From the journal
      entry", "In the journal", "Also in"), the search page and the
      About page's stand-in; the sidecar fields' names, `draft` and
      `published`, before his piece is written against them; in
      Obsidian, whether the moved samples draw as before. Each round is
      one sub-lettered task here (`T1745a`, `b`, …); a round that
      changes a word a document states updates it in the same task.
      When he names the keeps, they are recorded here and Phase 4 waits
      for his piece as its intro says. _Verify: every sub-lettered task
      green; each kept value agrees in its one place, its test and
      spec.md's Decided line (a `grep` of each, listed); the documents
      agree; the Phase 3c record below filled in._

### Phase 3c record (the person's walkthrough)

_Filled in at the pause._

## Phase 4 — The first real piece (reviewer after the phase; walkthrough: the photographer's own piece, on both screens with a mouse and a trackpad, and on a phone — a photograph piece's page with his story (from the photographs folder, on the front door once he dates it), or a journal entry's page with his writing and his compare as he wrote it and then his photograph's page; on his photograph's page: the wall label's camera and lens by the names he knows, "Raw to finished" with his camera's frame, his stages and the finished photograph in each of the three ways, the story's own compare instead if he wrote one there; the quiet view's loupe on his larger export, to full detail and around it; every tuning question from the two earlier looks open again here, now on a real photograph; as many rounds as it takes, each a sub-lettered task under T1717)

The content is his, supplied during implementation; these tasks are the
site's support for it and invent nothing. The earlier pauses are judged
on the fixtures. If his piece has not arrived when Phase 3 is signed
off, the orchestrator says so at the Phase 3 pause and waits; whether to
close the spec without it is his decision (it would leave an acceptance
criterion unmet — a spec amendment).

- [ ] **T1716** — His piece, placed. Dispatched when the photographer
      says the files are ready and where they are. Pattern: the fog
      entry's folder (`index.md`, the photograph, `_<basename>.md`,
      the private family beside it) for a journal entry;
      `src/content/photographs/dock-b.jpg` and `_dock-b.md` for a
      photograph piece. _(Amended at Phase 3c: his piece may be either
      form.)_ Copy the files as supplied — a journal entry into
      `src/content/journal/<his slug>/`, or a photograph piece (the
      photograph, its `_<basename>.md` as its writing, its private
      family beside it) into `src/content/photographs/` — no edit to
      his prose, his frontmatter or his files; a photograph piece still
      carrying `draft: true`, or without `published:`, is his to change
      and is said so to the orchestrator (a draft has no page; an
      undated photograph is not on the front door), never edited; a build failure over his content is
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
      label's two rows (greped and quoted); its address —
      `/photographs/<name>/` from the photographs folder,
      `/photographs/<slug>/<name>/` from a journal entry, whose own page
      is `/journal/<slug>/` — and, for a dated photograph piece, its row
      on the front door (greped and quoted)._

- [ ] **T1717** — The last look, and the rounds. Not an implementation
      task: the orchestrator's record of the Phase 4 pause on his piece
      (its photograph's page, and its journal page if it is an entry),
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
      From the 2026-09-26 amendment (Phase 3a): "The stage across
      screen shapes" (~171–193) annotated — spec 017's one rectangle
      turned superseded at spec 019 by the share rule (a landscape a
      share of the width, a portrait or a square a share of the height,
      each bounded by the other axis; the shares as kept at the Phase
      3a pause); the processing showcase's first step gains the pair
      blocks `side` and `slider` and the compare's filmstrip.
      From the second amendment (Phase 3b): "Obsidian live rendering
      for photo blocks" (~594–603) struck as done at spec 019 (every
      block, both views), and the "Block vocabulary expansion" entry's
      "What remains" line (~613–615) struck with it. `DECISIONS.md`'s
      two plugin entries — "Obsidian live-preview plugin: fullbleed
      only, approximation accepted" (~90–110) and "Spec 003: breadth
      over demand-driven growth; plugin approximations" (~278–298) —
      each annotated as superseded at spec 019, in his words: "the
      concession was that 'approximation' would be fine for the
      authoring plugin. By that I meant that things wouldn't be exactly
      the same, be representative. Approximation doesn't mean 'almost
      completely different and unrepresentative in most cases'."
      From the third amendment (Phase 3c): `ROADMAP.md`'s "Every page a
      piece, and the image's study" (~41) annotated — the lexicon and
      the photograph's home settled at spec 019 (a photograph a piece
      of its own in `src/content/photographs/`, with `draft` and
      `published`, on the front door when dated: item (3)'s date and
      front-door half done); the processing overview, the study, the
      pieces about seeing and the place tour remain. Every other
      `ROADMAP.md` mention of the old names — `../../gallery-images/`
      (~410), `src/content/gallery-images/` (~481), `/pieces/` (~490,
      ~493, ~592) — rewritten to `../../photographs/`,
      `src/content/photographs/` or `/journal/` where it describes the
      site as it is or will be, and left where it records what a past
      spec did; `README.md` was swept at T1744 and is greped again
      here. `DECISIONS.md`'s older entries naming the old folders are
      history and stay.
      `DECISIONS.md`: "## Spec 019: the image page, refined" in 018's
      shape — the decision in the photographer's words (the page over
      the mobile pass; the dictionary; Sony's own mark; the handle and
      the legend; three methods; the block; stages in the sidecar; the
      loupe with a larger export, not tiles; the real piece at the end;
      and the amendment's, from the Phase 1 record and its brief: the
      stage's share, side by side and the slider as blocks of their
      own, the filmstrip, no duplicate downloads),
      what the plan chose and why (the family read by one function with
      the frame first; the shape spelled once; the page building the
      block's markup; the chrome script-built with an ARIA handle; the
      stages unlinked; the slider's segments indexed from the right, so
      each end shows an end stage whole, and what the pause kept; the switch's fade-in-over in place of an `opacity: 0` rule;
      the loupe as an overlay in the photograph's own box; the loupe
      file as a webp transform and the barrier reading declared URLs;
      the gear table as Markdown in the content folder; tunables as
      constants; and the amendment's — the stage's shape read at build
      time because the share rule is discontinuous at the square, the
      pair blocks in the compare's one shape told apart by their
      `piece-<name>` class, `side` without script, the filmstrip as a
      transitioned property rather than the browser's scroll, one
      candidate list per stage file as the barrier's fourth scan; and
      the second amendment's — the block table pinned equal to the
      transform's, one figure for both views, `!important` on every
      plugin declaration, the pane as a query container, Reading view
      rebuilding only the sections a block touches; and the third's —
      the lexicon in his words, from spec.md's Decided line ("when I'm
      at images/where-the-fog-lets-go/land-b/ in the site, this is an
      image page that is its own piece"; the physical gallery that
      "carries its own context"; "I don't think I'm going to ship a
      header on the site called 'pieces'"; Journal over Essay, since
      Notes already meant gear notes; no catch-all for the other
      genres, the centre written down instead), and what the plan chose
      — the bare id as an empty folder segment, a shared name refused,
      `draft` and `published` optional and the photographs folder's
      alone, the front door's merge, the barrier's authored-text rule,
      the internals left named), and
      the keeps from each pause in his words, round by round. Both hand-edited (`npx prettier --check` clean; grep for
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
      AC 14 by the final build's GPS line; the amendment's six — AC 15
      by matte.test.mjs's share and sizes-hint cases, T1720's reads and
      the Phase 3a record; AC 16 by T1721's side cases and T1723's
      reads; AC 17 by T1721's slider cases, T1725's reads and the
      record; AC 18 by T1724's tables, T1726's reads and the record;
      AC 19 by scan 4 with its tests and T1723's land-b read and
      timeline; AC 20 by T1719's commit (its hash and its place before
      T1720's), T1728's greps and the Phase 3a record; the second
      amendment's six — AC 21 by T1730's equality cases; AC 22 by
      T1730's cross-check and scanner cases; AC 23 by the Phase 3b
      record; AC 24 by T1731's stylesheet cases and the record's console
      lines; AC 25 by T1730's `resolveRelative` cases, T1731's missing
      case and the record; AC 26 by T1734's greps and the plugin's
      build; the third amendment's six — AC 27 by T1736's commit (its
      hash and its place before T1737's); AC 28 by T1737–T1739's cases
      and `dist/` reads and the lexicon barrier's scan 1; AC 29 by
      T1740's cases and one-time edits and scan 3; AC 30 by
      front-door.test.mjs, T1741's read and scan 4; AC 31 by the consts
      case, scan 2 and the Phase 3c record; AC 32 by T1744's greps,
      T1737's `resolveRelative` cases and the Phase 3c record; AC 13 as
      amended by T1716's reads and the Phase 4 record); build, tests,
      check, and
      the five barriers (GPS, dev routes, motion, private files, and
      from T1743 the lexicon) green
      with actual output; the PR marked ready
      and merged with a merge commit; the close-out box ticked in the
      same shell command as the merge bookkeeping. _Verify: the
      implementer's `sh scripts/verify.sh` green with the documents
      edited; `grep -n "Spec 019" DECISIONS.md ROADMAP.md` → the new
      section and the annotations; `grep -in "superseded at spec 019" DECISIONS.md`
      → the two plugin entries;
      `grep -nE "gallery-images|content/pieces|/pieces/|/images/" ROADMAP.md README.md`
      → only lines recording a past spec, listed; `git diff main --stat` lists no file
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
| T1709j label · note | implementation (`opus`, high) | ~44k | done; 531 tests; label-to-note gap 22.85px, the space character plus margin on the label side (asymmetric by ~4px) — note |
| T1710 loupe file | implementation (`opus`, high) | ~75k + ~20k | done; 535 tests; land-b loupe 39,702 B (5400×3600 webp, flat fixture); dist/_astro main 781 files / 35.45 MB → after 837 / 40.25 MB (+37 files, +4.75 MB, the 62 own-file loupes 4.84 MB, none sharing a stage srcset file — fit/position enter the stage hash); the constrained layout emitted nine unnamed sizes per getImage until layout none (plan amended); og.ts has the same waste — sweep note; exifr cannot open webp (check-no-gps reads through sharp) |
| T1711 loupe state | implementation (`opus`, high) | ~58k | done; 563 tests (+28); every fit→zoomed step (wheel, pinch, key) returns open; click decided after press/move/release by dragSlop; arrows move the view the way they point; in dblclick mode a double click while zoomed would close then reopen — T1712 or a round if the pause picks dblclick |
| T1712 loupe wired | implementation (`opus`, high) | ~127k + ~60k (two rounds) | done; 573 tests (+10); stopped once on matte (b)'s quiet-list count vs the plan's cursor rule — resolved as a deliberate fourth by name (plan noted); the loupe section sits before the compare section (compare.test slices compare → Motion); wheel deltaMode converted; a dblclick listener so opensOn can be retuned; no real 2560px export exists — the Phase 2 report quotes 2000px numbers |
| Phase 2 review | implementation (`opus`, high) | ~133k | signed off, nothing blocking; fix-now as T1712a: opensOn's 'gesture' didn't leave on click as the plan claimed and 'dblclick' cannot coexist with "a click leaves"; Safari's trackpad pinch arrives as gesture events, untaken; loupe.ts's shared-file comment stale; docs: two "matte unedited" lines corrected; pause: own-file loupes at 2000px exports (portrait 1.13 on the laptop only), minGain and withoutDetail together; sweep: motion (d)'s fifth/sixth labels, the data-glide gate test's shape, no automated pin on the page wiring, pinch false leaves touch-action none, snap's inline round untested, the :root "fingertip" comment stale; the browser records were not in the bundle (check 6 unreviewed — the sweep bundle carries them) |
| T1712a review fixes | implementation (`opus`, high) | ~60k | done; 572 tests; dblclick action removed outright; the zoom-in cursor does not depend on opensOn (moot at click) — note; a real Safari trackpad pinch needs the walkthrough |
| T1713a follow the mouse | implementation (`opus`, high) | ~62k | done; 577 tests (+5); a hover during the open glide snaps the view to the end (as a drag does) — may show at the walkthrough; a mouse drag still pans under follow; the personx27s own astro dev holds 4321 — previews use 4322 |
| T1713b mat off while zoomed | implementation (`opus`, high) | ~59k + ~40k (two rounds) | done; 581 tests; stopped once: the orchestratorx27s first paragraph had the loupe filling the matx27s box, impossible without resizing the stage image — corrected to option 1; the padding transition is keyed to the overlayx27s glide, not quiet view, so entering quiet and resizing stay still; no seventh reduced-motion rule; a width-bound photograph (a panorama on a narrow screen) might grow when the mat goes — unmeasured, walkthrough |
| T1713c full area | implementation (`opus`, high) | ~85k | done; 580 tests; the grown box is the stagex27s available area, not the matx27s box (a 3:2 photograph can match the old frame on one axis only: 1280×1440 width, 13px bands top and bottom; 1512×982 height, 20px wider each side); a photograph ready at the fit but not over the grown box opens nothing (attribute removed in the same task); the attribute lives with the overlay |
| T1714 plugin compare | implementation (`opus`, high) | ~44k | done; 584 tests (+4); plugin build exit 0; a leaf line inside a compare span is never decorated; a compare with no images stays raw |
| T1715 documents | implementation (`opus`, high) | ~145k | done; prettier clean; "no duplicate download" checked with a second compare in the fog piece (same URLs); gear.mdx27s own header says an unknown camera prints "as the camera wrote it" while the code falls back to make + model — sweep note |
| Phase 3 review | implementation (`opus`, high) | ~88k | blocked once: README's loupe sentence false in the width-bound case (T1715a, with the matching comments, gear.md's header, plan's 6000px, the CSS "one assignment" comment); AC 4's text (a three-stage sweep, neighbouring pairs) is superseded by T1709a/d/g's Decided lines — noted for the close-out; sweep: readiness between the fit and the grown box (the click opens nothing — check the reducer's return), mat 'off' has no automated pin beyond the toggle line, a mouse drag under follow is undone by the next move, the plugin's and transform's parsers unbound (a shared fixture), "each stage once" unpinned, the plugin's parse tests can't tell paragraph joining |
| T1715a review fixes | implementation (`opus`, high) | ~44k | done; 584 tests; src/content/gear.md fails prettier --check as it did at T1704 (a code span with inner spaces, no blank line after the comments) — sweep note, run --write after checking the parser |
| Phase 3 re-review | implementation (`opus`, high) | ~8k | signed off; the record corrections (spec T1713c line, plan one-axis sentence, 4000px, AC 4 superseded) confirmed present by the orchestratorx27s grep; sweep: global.cssx27s "space the mat had" comment, notes 4–10 and 13 from the first review |
| Amendment planning (2026-09-26) | implementation (`opus`, high, no override) | ~315k | drafted plan.md's Amendment section and Phase 3a (T1719–T1729, T1721 per-task); two spec points raised — the Non-goals line still ceding nothing on the stage on paper (fixed in spec.md), and the opening shares of 0.9 shrinking three of four known boxes (spec set to 1) |
| Amendment sign-off | top (`fable`, high, override) | ~130k | blocked: B1 the DualUp 2:3 box at share 1 computed with spec 017's L (1215.5) instead of --avail-h (1239) — two boxes grow, not one; S1 cadence paragraph stale, S2 stageShape pin must hold the literal, S3 side's static grid, S4 data-paging at an end, S5 the slider block's note a reading, S6 land-b's photograph twice put to him, S7 shares ≤ 1, S8 paperEnv retargeted |
| Sign-off fixes (planner resumed) | implementation (`opus`, high) | ~25k | B1 fixed in the table, the walkthrough, T1729 and the Known-limitations line (spec.md's Decided parenthetical corrected by the orchestrator); S1–S8 taken |
| Amendment re-review | top (`fable`, high, override) | ~20k | signed off; the S3 code claim (`.compare-frames` static grid, global.css 2129) verified; nothing open for the sweep. Session tier for the amendment session: the spec amendment written in-session at high effort (raised for the spec session as the policy says) |
| T1720 stage share | implementation (`opus`, high) | ~101k | done; 585 tests; both mutations fail by name; boxes match the plan's table within 0.4px (port-a's written 0.667); quiet rects equal main's; findings: DPR 2 laptop landscape asks ~2343 device px but land-b's largest candidate is 1800w (export-bound, not cap-bound); gallery-only images have no frame nav; a worktree build must clone node_modules, never symlink (a symlink re-optimised the repo's .vite deps — the person's astro dev may need a restart) |
| T1721 pair blocks in the transform | implementation (`opus`, high) | ~70k | done; 603 tests (+18); max mutation fails both three-stage cases; the no-attributes line now also serves grid and strip (their old line ended in an empty "allowed:") |
| T1721 per-task review | implementation (`opus`, high) | ~47k | signed off, nothing blocking; notes: "exactly two" hardcoded where `exactly ${min}` would generalise; pair tests tied to portrait.jpgx27s 0.6667 |
| T1722 barrier scan 4 | implementation (`opus`, high) | ~47k | done; 610 tests (+7); summary today: "3 compares in one shape; 8 stage images, one candidate list per file"; a stage shown by two blocks counts twice; a src-only pane keyed by its src; only the first clashing URL reported |
| D1723 decision review (one URL per stage across the page's two builders) | top (`fable`, high, override) | ~111k | option B made structural: `stageImageOptions(surface)` spelled once in image-meta.mjs, the transform's `stageSizing` and the page's `getImage` both read it, `<Image>` leaves the section (it hashes fit: cover and position: center; getImage never reads image.objectFit — verified in Astro's sources); scan 4 stays URL-keyed, the one-URL fact pinned at the source by test (a) and observed on the built land-b page; the plan's "scan 4 fails otherwise" was a wrong claim; stays in T1723 |
| T1723 side static form, fixtures, page stage images | implementation (`opus`, high) | ~64k + ~110k (two rounds, D1723 between) | done; 612 tests (+2); stopped once on the plan's shared-files premise (D1723); one srcset per stage on both pages; the section's raw <img> also carries Astro's scoped class and cid attribute (request-identical to the story's); a stage's sizes follow the surface not the width class (the side at wide still carries column sizes — what keeps one list); prettier flags pre-existing lines in compare.test.mjs and [...id].astro — sweep note |
| T1724 filmstrip state | implementation (`opus`, high) | ~57k | done; 618 tests (+6); both mutations fail by name; stripEnds defaults wraps to COMPARE.stripWraps as switchNext does; prettier flags compare.ts and compare.test.mjs at HEAD already — sweep note |
| T1725 slider block enhanced | implementation (`opus`, high) | ~71k | done; 619 tests (+1); reads at both screens recorded; refit() still writes data-narrow on a narrow fixed block (every [data-narrow] rule is side-scoped, no visible effect) — note; no script-level pin on the fixed branch beyond the CSS body and the browser reads — sweep note |
| T1726 filmstrip enhanced | implementation (`opus`, high) | ~129k | done; 625 tests (+6); reads at both screens and under reduced motion recorded; six deviations noted in plan.md's bullet (the wheel clears both states first; the idle settle only in the filmstrip with no drag; keys from anything inside the frames; pointerdown on an arrow ignored; the arrows' small literals pinned in (e); --strip-at rounded to 1e6); pause note: the frames' focus ring is clipped at peek 0 (inferred) — possibly a round |
| T1727 plugin side and slider | implementation (`opus`, high) | ~34k | done; 628 tests (+3); plugin build exit 0; the widgetx27s data-block stays `compare` for all three |
| T1728 documents again | implementation (`opus`, high) | ~57k | done; prettier clean; sentences beyond the three named spots corrected where side and slider made them false (listed in its report); the plugin draws a side or slider at any stage count, only the build enforces two — README says so |
| Phase 3a review | implementation (`opus`, high) | ~153k | blocked once: B1 the side's stacking literal has no (e) pin though the envelope table names one (T1728a); fix-now: choose() leaves data-settling set after a mid-settle method change; stale (c) opening comment; pause: hide vs quiet at the ends (hiding drops keyboard focus), the clipped focus ring, trackpad momentum vs the 150ms settle, the slider's note, land-b's photograph twice; sweep: the wheel's px-per-line conversion spelled twice (loupe.ts, compare.ts), the two scripted blocks pinned only by one-off reads (the fixed slider's store, the arrows at the ends), a post-build one-srcset assertion on land-b would pin 'fetched once' for real, 'exactly two' hardcoded |
| T1728a review fixes | implementation (`opus`, high) | ~36k | done; 629 tests (+1); 560→600 fails the new case by name; compare.test.mjs not prettier-clean on the branch (six lines in (c)/(d)) — sweep note |
| Phase 3a re-review | implementation (`opus`, high) | ~5k | signed off; notes 3–8 of the first review to the sweep |
| T1729a arrows' look round | implementation (`opus`, high) | ~83k + ~70k (two passes) | done; 629 tests; first pass centred the fallback glyph with a Menlo-tuned nudge and found the mono face has no arrow glyphs; second pass drew the chevron in CSS; a 'lighter' ask conflicts with 'match the handle' (measured equal) — put to the person |
| T1729b wheel pages one stage | implementation (`opus`, high) | ~64k | done; 630 tests (+1); both mutations fail by name; the gate restarts on any wheel event (vertical too) so a tail's drift cannot end it early |
| T1729c wheel gate sticks | implementation (`opus`, high) | ~60k | done; 630 tests; cap mutation fails EXPECTED by name; old code reproduced stuck headless; if hard flicks double-page the lever is the cap or a rising-delta rule (not built) |
| T1729d arrows lighter | implementation (`opus`, high) | ~56k | done; 630 tests; mutation fails TOKENS by name; its oklch mix shifted hue — orchestrator changed the one word to oklab and re-verified (a footprint fix, not a design call) |
| T1729e arrows outside | implementation (`opus`, high) | ~95k | done; 631 tests (+1); gap mutation fails TOKENS by name; found the strip's sideways page overflow (pre-existing) → T1729f |
| T1729f strip page overflow | implementation (`opus`, high) | ~40k | done; 631 tests; baseline on the T1729e build reproduced the overflow, fixed build equal at every stage on three sizes |
| T1730 plugin block table and scanner | implementation (`opus`, high) | ~91k | done; 689 tests (+58); plugin build exit 0; three mutations fail by name; cross-check 33 / 8 by name and order, image srcs equal; grid/strip bodies read any image-only paragraph (the transform takes the leading run) — fix-now at T1731; the plugin's tsconfig lib is ES5–ES7 (no Object.hasOwn/flatMap/.at) |
| T1730 per-task review | implementation (`opus`, high) | ~77k | signed off, nothing blocking; notes: grid/strip leading run (fix-now at T1731), FENCE_LINE looser than CommonMark (a backtick in the info string; a `:::` inside a fenced body closes a container) — known limitation, the vocabulary walk's file list still reads main.ts only (T1732 adds blocks.ts and figure.ts; compare.ts too) |
| T1731 plugin figure and stylesheet | implementation (`opus`, high) | ~83k | done; 714 tests (+25); plugin build exit 0; three mutations fail by name; the T1730 fix-now (leading run) with a case failing on the old file; deviations: beside roots carry w-side / w-held sizing the floated frames; bleed rules scoped to w-wide; a beside block always emits .photo-pieces-prose; the missing box keeps literal padding/border/radius/0.85em (not shares); the 'every class emitted' case depends on the sampler holding every variant — a note for whoever edits the sampler |
| T1732 Live Preview | implementation (`opus`, high) | ~54k | done; 710 tests (714 − the deleted describe's 4 instances, retargeted at T1730); plugin build exit 0; the widget's Component kept in a WeakMap by element (eq-true widgets never build, so a field would leak the older one); the walk gains compare.ts too; README:66 still names LEAF_BLOCKS — T1734 |
| T1733 Reading view | implementation (`opus`, high) | ~59k | done; 720 tests (+10); plugin build exit 0; the startLine mutation fails three cases; each Markdown run renders into its own div (render is async, a figure could land ahead); once-per-tick is setTimeout 0 per path; note: a hidden element whose section later returns null stays hidden until rerender(true) replaces it — watch at the look |
| T1734 plugin documents | implementation (`opus`, high) | ~70k | done; prettier clean; 720 tests; README.md's table cells, header and three sentences corrected beyond the five named cells; findings: the sampler holds no compare/side/slider (the fog piece does; his plugin-check draft holds every block), side/slider's method line reads the lowercase block name while a compare reads the site's words — a pause question (T1735 lists it) |
| Phase 3b review | implementation (`opus`, high) | ~132k | signed off, nothing blocking; fix-now T1734a: the plugin's own renders may feed the Reading-view signature and loop (guard by docId or whole-text), no pin on 'never imports the transform', the token case does not refuse an unlisted body token, AUTHORING ~433 reads Live-Preview-only; sweep: the walk gained compare.ts (plan's file-structure line names two), AC 22's mid-paragraph clause pinned synthetically not over the sampler, AC 23 names stage blocks the sampler lacks, no .catch on the widget's Promise.all, DECISIONS.md still says Reading view out of scope (T1718); pause: tall by window or pane, the method line's words, Reading view sitting still, the sampler gaining stage blocks, Readable line length off |
| T1734a review fix-now | implementation (`opus`, high) | ~43k | done; 726 tests (+6); both mutations fail by name; the signature keyed by docId + path (the typings give docId on every context and no synchronous whole-text read); the signatures map grows one entry per document and is never pruned — sweep note; whether docId survives rerender(true) is not in the typings — the walkthrough's edit-then-Reading-view check covers it |
| Phase 3b re-review | implementation (`opus`, high) | ~8k | signed off; the docId guard closes the loop; it now rests on Reading view keeping one docId across an edit and rerender(true) (not in the typings) — the walkthrough's edit-then-Reading-view check carries that weight, and the fallback is to skip calls whose el sits inside a plugin render target; sweep: the signatures map unbounded, the `parsed` comment says whole note |
| T1735a bleeds clipped (diagnosis + fix) | implementation (`opus`, high) | ~90k (two passes) | done; 727 tests (+1); the cause read from Obsidian's app.css in the installed asar (a future dispatch can read the real rules); the plan's 'layout not on the root' line deviated by one declaration on the root, as the !important strategy foresaw |
| T1735b grid centred | implementation (`opus`, high) | ~30k | done; 728 tests (+1); mutation fails by name; the pair's centring unpinned — sweep note |
| T1735c equal heights | implementation (`opus`, high) | ~53k | done; 737 tests (+9); both mutations fail by name; beyond a one-value round (a class, a rule, a DOM walk) — logged as the person's ask against Goal 10, not an envelope value |
| T1719 constitution amendment (2026-09-26) | implementation (`opus`, high) | ~32k | done; three edits verbatim, prettier clean, 584 tests; barrier reads "3 compares in one shape" — T1723x27s before |

| Amendment 2 planning (2026-09-26, evening) | implementation (`opus`, high, no override) | ~220k | drafted plan.md's Amendment 2 section and Phase 3b (T1730–T1735, T1730 per-task): one block table pinned equal to the transform's descriptors, a line scanner, one figure builder for both views, a Reading-view post-processor, an `!important` stylesheet with a test; no product question |
| Amendment 2 sign-off | top (`fable`, high, override) | ~105k | blocked: B1 the T1714 Obsidian bullet claimed standing while T1731–T1732 delete what it describes; S1 tall by window not pane (to him), S2 white-space in widgets, S3 freshness rule misses fences typed around text, S4 "cannot outrank" too strong, S5 cross-check images too, S6 the vocabulary walk's file list (authorized), S7 hidden class removal, S8 directive-after-paragraph case, S9 API present at 1.4.0 |
| Sign-off fixes (planner resumed) | implementation (`opus`, high) | ~35k | B1 fixed with the two pointers; S1–S9 all taken (S3 by the simpler signature rule) |
| Amendment 2 re-review | top (`fable`, high, override) | ~20k | signed off; S3's rule checked for a re-render loop (none); S6's one-line edit to remark-pieces-vocabulary.test.mjs authorized at sign-off and pinned by T1732's Verify; nothing open to the sweep |
_(Session-tier allowance draw noted at each pause.)_ Phase 3b pause reached 2026-09-27 (five implementer dispatches, one fix-now, one per-task review, one phase review with re-review). Phase 3a pause reached 2026-09-26; the session tier's draw for T1719–T1728a plus D1723 and the two reviews: eleven implementer dispatches, one decision review, one per-task review, one phase review with re-review.

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
