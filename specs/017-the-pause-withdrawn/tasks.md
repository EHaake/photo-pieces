# Tasks: The pause withdrawn, and the stage refit

**Status**: Signed off (2026-09-22), twice — the plan and tasks by the
`skeptical-reviewer` at the top tier (three blocking findings fixed,
four notes folded, one carried item transcribed into T1503), then the
stage refit's amendment by a second invocation at the top tier (two
blocking findings fixed — the fit for every ratio, the acceptance-map
renumbered — nine notes folded, and the re-review's one remaining line
and two notes transcribed from their exact text into T1503 and
plan.md). — signed off 2026-09-22
by the `skeptical-reviewer` at the top tier (three blocking findings
fixed, four notes folded in, one carried item transcribed), then
reopened the same day when the product owner folded the stage's
geometry into the spec: T1503 is rewritten as the stage refit, T1502
amended in one detail (`--r`/`--q` stay on the base frame), T1505 and
T1506 gain the refit's documents; T1500, T1501 and T1504 stand as
signed off.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1500–T1504) — the fixtures rewritten so
the build stays green through every task, the pause out of the
transform and the plugin with the closed-vocabulary failure pinned, the
stylesheet and the piece page's script cleared of it with the mat moved
to the quiet view and `matte.test.mjs` rewritten pin by pin, the stage
refit (the box hugging the frame, one rectangle turned, the cue inside
its height, the `sizes` hint on the same rule), and the sampler made
honest — so the person judges the refit and the bare stage on a site
with nothing of the pause left in it.
**T1502 is marked `review: per-task`**: it is the largest deletion of
the spec and every later task edits the same regions of the same two
files — a token taken with the pause that the held block reads, a held
rule lost with the lights, or a stage formula wrong there is what the
cue, the sampler and the docs would inherit. T1500, T1501, T1503 and
T1504 are reviewed with the phase. Phase 1 and Phase 2 are per-phase
(Phase 2's review is the pre-merge sweep). The Phase 0 pause is where
the person tries the site.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy's standard profile and its role table — the session on
`claude-fable-5-1` at medium effort; the planner and the plan/tasks
sign-off at the top tier with an explicit override; the
`sdd-implementer` and the `skeptical-reviewer`'s per-phase reviews and
sweep at their definitions' `opus`, with close-out the one implementer
dispatch at the top tier — `sdd-implementer-fable`, per the role
table): the orchestrating session triages each task and dispatches
routine ones to the `sdd-implementer` on a task bundle assembled with
shell (the task line, the plan sections, the acceptance criteria, the
files, the pattern file to copy, any recorded value), telling it not to
read plan.md, spec.md, or tasks.md in full; the implementer's verbatim
`sh scripts/verify.sh` output is the verification, re-run by the
orchestrator for T1502; the reviewer checks each phase as a whole from
a staged, shell-assembled bundle — one review and at most one
re-review, anything still open logged and left to the sweep. A design
question the session cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle, never
resolved in the session. The sweep runs on the documents plus
`git diff main...HEAD`. The orchestrator never does device or browser
checks by hand: geometry and the computed styles are the implementer's
Verify criterion (numbers recorded in this file), and what it cannot
measure the person attests at the phase pause on his two screens (the
16:10 laptop and the LG DualUp, 2560×2880). One implementation session
runs the whole spec: a phase pause is a pause in it — the person
attests and says continue — not a session boundary; the person is
paused for after each phase whose header says there is something to
try, and whenever something unexpected bears on spec adherence. If the
person stops at a pause, the report ends with the continuation prompt
for a fresh session (`/compact` if the context grows large; never
mid-task).

Task ids: 017 = T15xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T15xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the pause out, the mat to the quiet view, the stage refit (reviewer after the phase; `review: per-task` on T1502; walkthrough: the fog piece reads with a fullbleed panorama where its pause was; every image page opens with the photograph bare and centred just below the header, a 3:2 and a 2:3 the same rectangle turned — the height deciding on the laptop, the width on the DualUp — the previous / where / next line directly beneath at a piece's spacing and at or above the fold — at it where the height decides — the title following; a panorama at the box's full width; a click still takes the photograph to the quiet dark in its white mat; the person judges the equal rectangle on both screens)

- [x] **T1500** — The fixtures first, so the build is green at every
      later task. `src/content/pieces/where-the-fog-lets-go/index.md`
      line 68: `::pause{src="./pano.jpg" alt="The full sweep of coastline after the fog cleared"}`
      becomes `::fullbleed{…}` with the same `src` and `alt`, on the same
      line, the prose either side untouched (pattern: the piece's own
      `::fullbleed` at line 78). `src/content/pieces/vocabulary-sampler/index.md`:
      delete "## Pause" through the end of "## After the pause" (lines
      242–283, up to "## Borrowed"), and in the held section end the
      sentence at "which is what keeps the header away." (line 231
      loses "The lights belong to a pause."). `src/content/pieces/matte-sampler/index.md`:
      delete "## Pause" (lines 189–201); the held section ends the
      fixture. Hand-edit; never script-rewrap. _Verify:
      `sh scripts/verify.sh` green with `87 page(s) built` and both
      barrier lines; `grep -rn -i "pause" src/content/` → 0;
      `grep -n 'fullbleed{src="./pano.jpg"' src/content/pieces/where-the-fog-lets-go/index.md`
      → line 68 with the alt above; the pano's built page
      (`dist/images/where-the-fog-lets-go/pano/index.html`) still
      contains "From the top of the bluff" (its passage, unchanged);
      `npx prettier --check` on the three files no worse than at
      `main`._

- [x] **T1501** — The pause out of the transform, the passage table and
      the plugin, and the closed vocabulary's failure pinned. Pattern:
      the transform's own descriptors and spec 007's T501 line
      (specs/007-held-image/tasks.md) for the shape of the cases being
      removed. `remark-pieces-blocks.mjs`: delete the `pause` descriptor,
      `PAUSE_SCALE`, `PAUSE_MARGIN_VMIN`, `roundUp`, `roundDown`,
      `pauseWidth`, the `block.structure === 'frame'` branch and
      `claimStageNeighbour`; delete the `block.forms === 'leaf'`
      container-form check (no leaf-only block remains) and read
      `forms: 'container' | 'both'` and `body` without `'none'` in the
      descriptor comment; drop the `dims` fourth argument from the
      `sizing` call and its comment line (its one reader was the pause);
      drop the `pieceUnwrapped` marking loop in the aside branch and its
      comment (its one reader was `claimStageNeighbour`); the
      `needsRatios` comment at ~595 loses "pause"; the `single` comment
      at ~113 loses "minus the mat" and the shorthand comment at ~749
      loses "but IS matted in the column" (stale since spec 015; this
      spec edits the file). `src/lib/image-meta.mjs`: `BLOCK_BODIES`
      loses `pause: 'none'`; its comment loses "or nothing (leaf-only
      blocks)". `obsidian-plugin/main.ts`: `LEAF_BLOCKS` loses
      `pause: one,`. Tests: `remark-pieces-blocks.test.mjs` — the
      `['pause', …]` row leaves the `cases` table; "held and pause keep
      the raw --ar on the wrapper…" → "held keeps the raw --ar on the
      wrapper as well as the frame", the held assertion untouched.
      `image-meta.test.mjs` — "a pause leaf gives the paragraph before
      it and no caption" deleted; the agreement case unedited (it now
      holds both tables to twelve). `remark-pieces-vocabulary.test.mjs`
      — the describe "held and pause: the durational blocks" → "held:
      the durational block (T501, spec 007)"; the eleven pause cases
      from "a pause with no neighbours" through "pause keeps the family
      error contract" deleted; "the probe failure names the block that
      asked" loses its `::pause` expectation and keeps held, match and
      strip; "a borrowed held and a gallery-root pause…" → "a borrowed
      held keeps the local --ar and sizes", its pause half deleted; no
      held assertion edited. **New**, in a new
      `describe('the closed vocabulary (T1501, spec 017)')`: one case,
      named for what it can fail on here — "the pause is gone from the
      vocabulary: ::pause and :::pause fail as an unknown block naming
      the piece" — `Before.\n\n::pause{src="./photo.jpg" alt="x"}` rejects
      with `/unknown block directive "pause" — the block vocabulary is closed; known blocks: single, fullbleed, wide, tall, inset, diptych, triptych, grid, strip, aside, row, held/`,
      the caught error's `.file` ends with `tests/fixtures/piece.md` and
      its `.line` is 3 (**verify at the task** that the harness carries
      the `VFileMessage` through; if it does not, stop and report — do
      not pin the message alone); `Before.\n\n:::pause{src="./photo.jpg" alt="x"}\nA caption.\n:::`
      rejects with the same message, its `.file` and `.line` (3) pinned
      the same way. (The describe's second `it` — the walk over the
      source for the block's spellings — is T1502's, where it can pass;
      the describe is the one test that names the word, and the suite
      is green at the end of every task.) _Verify: `sh scripts/verify.sh`
      green (the count recorded);
      `grep -n -i pause remark-pieces-blocks.mjs src/lib/image-meta.mjs obsidian-plugin/main.ts remark-pieces-blocks.test.mjs image-meta.test.mjs`
      → 0; `grep -n -i pause remark-pieces-vocabulary.test.mjs` → only
      the new case's lines (listed); `grep -c "structure: 'frame'\|forms === 'leaf'\|pieceUnwrapped\|claimStageNeighbour\|roundUp" remark-pieces-blocks.mjs`
      → 0; `git diff main -- remark-pieces-vocabulary.test.mjs` shows no
      hunk inside a held case's body (the hunks listed). Negative
      control at the build: `::pause` written back onto line 68 of the
      fog piece, `rm -f node_modules/.astro/data-store.json && npm run build`
      → fails; the error's line naming
      `src/content/pieces/where-the-fog-lets-go/index.md`, the line, the
      directive and the twelve known blocks recorded verbatim; reverted,
      `git diff --stat -- src/content` empty. Mutation, reverted: a
      `pause: { forms: 'both', body: 'caption', attrs: {…}, images, sizing }`
      stub restored in `BLOCKS` → the new case fails on the first
      `rejects` and `image-meta.test.mjs`'s agreement case fails._

- [x] **T1501 record** — Done as specified; 320 tests. The negative
      control ran and the error printed as the plan said — the file
      path, the line, the directive and the twelve known blocks — but
      `astro build` **exited 0** and published the fog piece with an
      empty body: Astro's `glob()` loader catches a per-entry render
      error, logs `[ERROR] [glob-loader] Error rendering
      where-the-fog-lets-go/index.md: Failed to parse Markdown file …
      unknown block directive "pause" — the block vocabulary is closed;
      known blocks: single, fullbleed, wide, tall, inset, diptych,
      triptych, grid, strip, aside, row, held`, and stores the entry
      bodiless (withastro/astro#18054, fix pending in PR #18064). The
      reported line was 56 — the body's line, after the 11-line
      frontmatter — not the file's 68. Decision review at the top tier
      (tier log): option D, the mechanism Astro's own `deferRender`.
      Every earlier "fails the build" claim about the transform (spec
      001 on) was never checked against the exit code. T1501a closes
      the gap.

- [x] **T1501a** — A transform error fails `astro build`.
      `review: per-task`. Astro's `glob()` loader catches a per-entry
      render error, logs `[ERROR] [glob-loader] Error rendering …`,
      stores the entry bodiless, and exits 0 (withastro/astro#18054, fix
      pending). Set `deferRender: true` on every Markdown `glob()`
      collection in `src/content.config.ts` (pieces, galleries, places,
      sidecars), with one comment naming the issue and the reason, so
      the transform runs in the Vite markdown plugin at page build,
      where its throw fails the build. Files: `src/content.config.ts`,
      `scripts/verify.sh` (comment at line 17: the store still caches
      entry data; the removal stays as cheap insurance). _Verify:
      `sh scripts/verify.sh` green; then, with `::pause` written back
      into `where-the-fog-lets-go/index.md`, `sh scripts/verify.sh`
      prints `BUILD EXIT` non-zero and the tail shows the closed
      vocabulary's message with the file path, line, and known blocks —
      paste both, and the line number reported, verbatim; on a built
      piece page confirm reading time renders and body images carry
      `srcset`; the postbuild counts (prune, GPS scan) recorded. If the
      control still exits 0 under `deferRender`, stop and return the
      output — the fallback (a wrapper around `astro build`) is a
      decision, not this task. No `[ERROR]` grep is added to
      `verify.sh`: the exit code is the one mechanism._

- [x] **T1501a record** — `deferRender: true` on the four collections;
      the control with `::pause` on line 68 gave `BUILD EXIT 1`, the
      tail `[…/where-the-fog-lets-go/index.md:68:1-68:82: Failed to
      parse Markdown file …: unknown block directive "pause" — the
      block vocabulary is closed; known blocks: single, fullbleed, wide,
      tall, inset, diptych, triptych, grid, strip, aside, row, held]`
      with `line: 68` (the file's line now, not the body's 56), then
      `[ERROR] [vite] ✗ Build failed`; reverted, `src/content` diff
      empty. Built fog page before/after: `srcset=` 7/7, `<img` 7/7,
      piece-block 5/5; the place page's prose renders; postbuild counts
      identical (87 pages, prune 43/43/0, GPS 741, dev-routes 97).
      Reading time: the site renders none and nothing reads
      `remarkPluginFrontmatter` — the Verify's assumption was false; the
      implementer substituted the `srcset` check. Build time 3.16s →
      1.4s. Orchestrator re-run: 87 pages, `BUILD EXIT 0`, `CHECK EXIT
      0`, 320 tests, `TEST EXIT 0`. Per-task review: signed off, no
      blocking; notes carried below.

- [x] **T1502** — The pause out of the stylesheet and the piece page's
      script, the shape module gone, the mat to the quiet view alone,
      and `matte.test.mjs` rewritten. `review: per-task`. Pattern: spec
      015's T1301 line (specs/015-the-hero-mat/tasks.md) and its
      measured record; plan.md's mat table is the edit list.
      `src/styles/global.css`: delete `--pause-scale`, `--pause-stretch`,
      `--pause-depth` and reword the durational comment for
      `--hold-margin` alone; delete the pause section from
      `/* ---- The pause (spec 007)` through the `@media (prefers-reduced-motion: reduce) { .piece-pause-frame … }`
      block (the scene, its `::after`, `.with-before/.with-after`, the
      stage, the frame, the `html[data-pause-active]` lights block);
      delete form W's two rules on `.piece-pause-frame > :is(a.image-link, img)`;
      `html[data-scene-active] .site-header` → `html[data-held-active] .site-header`,
      its comment restated for the held block alone (the header stays
      away while a frame is parked, whichever way the reader scrolls;
      the piece page's script sets the attribute). **The mat**:
      `.image-frame` keeps `--r`, `--q` (amended after sign-off: the
      refit's width reads `--q` on the base frame — T1503), `max-width`
      and `margin: 0`, declares `--mat: 0px` (the image's height cap
      still reads it), and loses form V+H, `padding` and `background`;
      a **new rule**
      `html[data-quiet] .image-frame { --mat: min(V, H); padding: var(--mat); background: var(--color-matte) }`
      with the unchanged strings, placed after `html[data-quiet] .image-stage`
      and before the two-selector cursor rule, which stays
      byte-identical, as do `.image-frame img`, the zoom-in rule and the
      quiet stage rule. Comments rewritten without the word: the ground
      comment's "the mat is the image page's stage and the pause frame
      now"; the two-rhythms note (`p` reads `--para-gap`; the held
      prose's idiom relies on it); the `:root` mat comment (WHERE IT IS
      since spec 017: the quiet view's frame, form V+H over the quiet
      stage's limits; the stage on paper bare at `--mat: 0px`; one form
      left); `--tall-max`'s derivation (the 85 stays: the screen inside
      a 5vmin margin with 5% to spare, spec 007's number); the anchor
      comment at ~1171 (no anchor carries a mat since spec 015); the
      stage comment at ~2061 (the image fills the stage's limits on
      paper and sits inside the mat in the quiet view); the Mattes
      section comment (the one matted surface, form W gone with the
      pause at spec 017 and spec 013's plan keeping its string, the
      source-order paragraph deleted, the `--ar-sum`/`--n` note kept).
      `src/pages/pieces/[slug].astro`: the script loses the
      `pause-shape` import, `pauses`, `lastLights`, `stageSizes`,
      `measureStage`, the scenes loop and every `--pause-*`/`data-pause-*`
      write; keeps `parkOf`, the holds loop, the listeners and `init`;
      writes `root.toggleAttribute('data-held-active', active)`; the
      header comment rewritten for the held block alone (the hold is
      pure CSS; the script only marks that a frame is parked). Delete
      `src/lib/pause-shape.ts` and `pause-shape.test.mjs`.
      `remark-pieces-vocabulary.test.mjs`: T1501's describe gains a
      second `it`, "nothing under src/, the transform or the plugin
      knows the word, and the held block's attribute is spelled once" —
      a walk over every text file under `src/`, `remark-pieces-blocks.mjs`,
      `obsidian-plugin/main.ts` and the root `*.test.mjs` files except
      this one, comments included, finds no match for
      `/(::pause|piece-pause|--pause|data-pause|data-scene|pause-shape|['"]pause['"]|\bpause:\s)/i`
      (spelled for the block, not the English word:
      `src/pages/about/index.astro` says "go-live pause" and stays);
      and `src/styles/global.css` contains
      `html[data-held-active] .site-header` while
      `src/pages/pieces/[slug].astro` contains
      `toggleAttribute('data-held-active'` — the two spellings of the
      one attribute, pinned together.
      `matte.test.mjs`: the header comment and the constants
      (`PAUSE_ANCHOR` gone; `MATTED` is `['html[data-quiet] .image-frame']`),
      and the cases as plan.md's Testing strategy names them — **each
      old case named here with what it becomes**: (a) unchanged (T1504
      tightens its sampler exemption). (b) "form W is declared
      once, on the pause's anchor alone" → "form V+H is declared once,
      under html[data-quiet] .image-frame, and every other --mat in the
      file is 0px" (prelude exactly that string, `--mat` exactly
      `min(FORM_V, FORM_H)`; a walk over every
      `--mat` declaration in the file finds that one form and otherwise
      only `0px`); "the two matted surfaces read --mat as a padding…" →
      "the one matted surface reads --mat as a padding — the quiet
      view's frame — and no other rule applies --mat or --color-matte"
      (the walk expects the two rows on `MATTED[0]`; the tokens-read
      check kept; the source-order pin against `.piece-block a.image-link`
      deleted); "the held figure at zero" unchanged; "form V+H: the
      pause's two limits…" deleted; "form V+H: the stage's limits, its
      mat, and the image's height" → "the stage on paper is bare and the
      quiet view wears form V+H — in global.css, not on the page"
      (`.image-stage`'s `--avail-w` unchanged and `--avail-h` as today
      — T1503 refits the rule; `.image-frame` declares `--r`, `--q`,
      `--mat: 0px` and neither `padding` nor `background`; `.image-frame img`'s
      `max-height` unchanged; the quiet stage's three limits unchanged;
      the quiet rules list is now three preludes, the new one between;
      the page's scoped style has no `.image-frame` rule; the zoom-in
      rule's index below the quiet frame rule's — use `indexOf`'s
      `declares` argument, `'--mat'` and `'cursor'`, since two rules
      now select `html[data-quiet] .image-frame`); "the image page reads
      --mat nowhere…", "the cover card's span…", "form R at zero", "form
      P is gone" unchanged. (c) "form W: m is the share…" deleted;
      `fitsBothTight`'s identity now evaluates the pinned `FORM_V` with
      `--avail-w` set to the box width and `--r` from `--ar` (form W
      with the container's width named); "the held frame at zero mat"
      unchanged; "form V+H: the pause frame…" deleted; "form V+H: the
      stage frame takes the smaller mat…" → "form V+H: the quiet view's
      frame takes the smaller mat, fits both limits and is tight on one"
      over `html[data-quiet] .image-stage`'s limits and the quiet
      frame's declarations; **new** "the stage on paper is bare: --mat
      is 0 at every grid point and the image's cap is the whole of
      --avail-h"; "form R at zero" and "form R: the cap agrees" unchanged;
      "the off identity" → the quiet frame gives 16.8, the paper stage,
      the held figure and the packed cell give 0, form R's basis has no
      constant; "the gate identity" → at `:root`'s tokens the quiet
      view's 3:2 frame at 1512×982 wears the 40px ceiling, the paper
      stage's wears 0, the reading-width single has no `--mat` reader.
      **(d) new**, "worn where the ground is dark — in global.css, one
      dark ground (spec 017)": every `background*` in `global.css`
      reading `--color-quiet` sits on `html[data-quiet] .image-stage`
      and nowhere else; `--avail-w` is published by `.image-stage` and
      `html[data-quiet] .image-stage` only; `MATTED[0]` is gated by the
      same `html[data-quiet]` (the image page's scoped
      `:global(html[data-quiet]) { background }` is the page ground
      under the same attribute, outside this file — the name says so).
      Every rewritten case keeps a name that says what would fail. _Verify: **at the start of the task, before
      any edit**, on the dev server at 1512×982, 1280×1440 and 375×812
      (Firefox headless via BiDi — the recipe in
      specs/015-the-hero-mat/tasks.md's T1301 record and its environment
      note; clear the quiet state before measuring): on
      `/images/where-the-fog-lets-go/land-b/` (3:2) and `…/port-a/`
      (2:3) the frame's computed padding, `background-color`, the
      figure's `offsetWidth`/`offsetHeight` and the image's height in
      the normal view and in the quiet view (spec 015's numbers: 40 /
      40 / 12.704 and 40 / 40 / 12.988); on `/pieces/vocabulary-sampler/`
      scrolled so the first held frame parks: `html` has
      `data-scene-active`, `.site-header`'s computed transform, the held
      figure's `offsetHeight` and `top` — recorded. **After**:
      `sh scripts/verify.sh` green, re-run by the orchestrator (the
      count recorded); the normal view pads 0 on four sides with
      `rgba(0, 0, 0, 0)` and the height-bound image's height equals the
      stage's `--avail-h` in px (recorded, with the arithmetic); the
      quiet view's reads identical to the before reads; the held
      figure's reads identical, `html` carrying `data-held-active` and
      the header's transform the same `translateY(-100%)` matrix;
      `test ! -e src/lib/pause-shape.ts && test ! -e pause-shape.test.mjs && echo gone`;
      `grep -rn -i "pause" src/styles/global.css 'src/pages/pieces/[slug].astro'`
      → 0; `grep -rn "data-scene" src/` → 0;
      `grep -n "var(--mat)" src/styles/global.css` → only the held
      `max-width`, form R's three formulas, the quiet frame's `padding`
      and the stage image's `max-height` (every line listed);
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` — every
      hunk listed, none inside `.gallery-flow`'s rules, the place wall's,
      the `--color-*` lines or `--color-quiet`, none inside a
      `.piece-held*` rule; `git diff main -- src/lib/ground.ts src/lib/og-card.mjs public/og.jpg src/lib/gallery-layout.ts src/content.config.ts 'src/pages/images/[...id].astro'`
      empty; `ground.test.mjs`, `page-head.test.mjs`, `og.test.mjs`
      green and unedited. Mutations named and reverted, tree restored
      byte-identically: `padding: var(--mat)` restored on `.image-frame`
      → the one-surface walk fails naming it; `--mat: 0px` removed from
      `.image-frame` → the bare-stage case fails (`px()` throws); the
      five declarations moved into the cursor list rule → "declared
      once" fails on the prelude; `--pause-depth: 0.85` re-added to
      `:root` → the closed-vocabulary walk fails naming `global.css`;
      `data-scene-active` restored in the script → the walk fails
      naming the piece page; the selector alone respelled → the
      two-string pin fails. Where the implementer cannot
      drive a browser it says so, line by line, and the Phase 0 pause
      asks the person to attest those lines._

- [x] **T1502 record** — Before/after at 1512×982, 1280×1440, 375×812
      (Firefox 156 headless via BiDi; the header measures **76px**, not
      the plan's 72px fallback — the page publishes `--header-h`).
      Normal view, land-b then port-a: padding 40 → 0 (31.389 → 0;
      12.704 → 0; 18.375 → 0), background `oklch(1 0 0)` →
      `rgba(0, 0, 0, 0)`; the height-bound image equals `--avail-h`:
      port-a 847.1 at 1512 (982 − 76 − 2 × 29.46), 1300 at 1280
      (1440 − 76 − 64). Quiet view identical before and after (land-b
      padding 40 / 40 / 12.988, port-a 35.297 / 40 / 18.786; figures
      1389×953 / 1233×848 / 336×233 and 659×953 / 965×1408 / 336×485).
      Held park identical: 1512 figure 0 height 428 top 49.1; 1280
      figure 1 height 898 top 64; header `matrix(1, 0, 0, 1, 0, -75.8)`
      both, `data-scene-active` → `data-held-active`; at 375 both held
      figures are collapsed. Six mutations each failed the named case.
      Orchestrator re-run: 87 pages, `BUILD EXIT 0`, `CHECK EXIT 0`, 14
      files / 316 tests, `TEST EXIT 0`. Per-task review: signed off, no
      blocking; eight notes — N1 (the anchor comment's "since spec 015"
      should read 017; the task line's own slip) to T1503's bundle, the
      rest below.

- [x] **T1503** — The stage refit: the box hugs the frame, one
      rectangle turned, the cue inside the height, the `sizes` hint on
      the same rule. (Rewritten after sign-off, when the product owner
      folded the stage's geometry into the spec; the cue's token and
      the nav's claim from the signed-off line are kept inside it.)
      Pattern: the `.image-stage` and `.image-frame` rules in
      `src/styles/global.css` and their comment; `.piece-block`'s
      `margin-block: var(--block-margin)` (~1161) for the spacing;
      `src/lib/gallery-layout.ts`'s `galleryCell` for a pure module
      whose `sizes` string a test evaluates against the CSS; plan.md's
      "The stage refit" for the CSS and the numbers.
      **The token.** `src/styles/global.css` `:root`, after `--baseline`:
      `--frame-nav-h: calc(0.78rem * 1.362 + var(--baseline) * 0.5);`
      with a comment (one row of the nav's 0.78rem mono at the font's
      `normal` line-height, 1.362 measured, plus its half-baseline
      bottom padding — 29px; the phone query below mirrors the nav's own
      719.98px wrap — 62px; retune both together); directly after the
      `:root` block, `@media (max-width: 719.98px) { :root { --frame-nav-h: calc(0.78rem * 1.362 * 2 + 1rem + var(--baseline) * 0.5); } }`.
      **The stage.** `.image-stage` becomes exactly: `--stage-pad: var(--block-margin);`
      (the spacing a piece keeps between a frame and its prose — the
      token `.piece-block` reads; the quiet rule redeclares `--stage-pad`,
      which is why the token moves and the shared `padding` shorthand
      stays), `--avail-w: calc(100vw - 2 * var(--page-pad));` (the
      `var(--content-width)` cap gone — the quiet rule redeclares the
      width), `--avail-h: calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad) - var(--frame-nav-h));`,
      `position: relative; display: grid; place-items: center; padding: var(--stage-pad) var(--page-pad);`
      — **both `min-height` lines deleted** (the quiet rule carries its
      own pair). `html[data-quiet] .image-stage`, the cursor rules,
      `.image-frame img` and T1502's `html[data-quiet] .image-frame`:
      **byte-identical**. **The frame.** `.image-frame`'s `max-width`
      becomes `100%` (no column cap); it keeps `--r`, `--q`, `--mat: 0px`,
      `margin: 0`. Two new rules after it and before the zoom-in rule:
      `html:not([data-quiet]) .image-frame { --L: min(var(--avail-w), var(--avail-h)); --S: calc(var(--L) * 2 / 3); width: min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r))); }`
      (the L × S box, turned: a 3:2 is L × S, a 2:3 S × L, a square
      S × S, a 3:1 L wide and shallower, a 4:5 S wide — spec 4a89ceb)
      and `html:not([data-quiet]) .image-frame img { width: 100%; }` —
      gated on the absence of `data-quiet` because the quiet rules may
      not change and today's quiet frame is shrink-to-fit around its
      mat; the image's `width: 100%` makes the figure the sizing box
      rather than the `sizes` hint (spec 007's trap). The stage comment
      rewritten: the box hugs the frame at the piece's spacing; the
      frame fits the L × S box turned (`--L: min(var(--avail-w), var(--avail-h))`,
      `--S: calc(var(--L) * 2 / 3)`, `width: min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r)))`
      — the two custom properties and the `width` are the whole of the
      `html:not([data-quiet]) .image-frame` rule); the nav's token inside
      `--avail-h` is what keeps the previous /
      where / next line above the fold for the tallest frame the rule
      allows, script or not; the quiet view keeps its viewport box by
      redeclaring every changed property; spec 013's `max-height` on
      the image never binds here and stays for the quiet view.
      **The nav and the title's block.** `src/pages/images/[...id].astro`
      `.frame-nav`: `min-height: var(--frame-nav-h);` after `width`,
      with a comment (the reserve the stage's height takes out, claimed
      here so the two cannot drift; border-box by the global reset;
      keep the token, the 0.78rem and the 719.98px query in step), and
      `margin-block-end: var(--block-margin);` (the nav puts the piece's
      spacing between itself and the title; a hidden nav is
      `display: none` and adds nothing, so the no-set page needs no
      second rule); a scoped `.image-head { padding-block-start: 0; }`
      with a comment (the stage's bottom padding is the spacing above
      the title's block; the shared `.section` rule stays every page's
      rhythm, and the head keeps its bottom padding and hairline — the
      words below the title keep their layout). **The hint.** New
      `src/lib/stage-sizes.ts` exporting `stageSizes(ar: number): string`
      as plan.md spells it — the rule in literals (`clamp(1rem, 3vw, 2rem)`,
      `4.5rem`, `3rem`, `100vh` not `svh`, the two nav strings with
      `0.75rem` for the half-baseline), the exported `PHONE`
      literal `(max-width: 719.98px)` as the first branch, the width as
      `min(calc(L * q), calc(L * 2r/3))` with the coefficients as
      numbers — with a header comment naming the five tokens it
      mirrors and the test that pins them; `[...id].astro` ~238
      `sizes={stageSizes(ar)}` in place of the static string;
      `src/pages/dev/matte/[...surface].astro` ~363 likewise from the
      frame's ratio (one line; the rest of the sampler is T1504's).
      **The tests**, `matte.test.mjs`: the stage case rewritten —
      `.image-stage` declares exactly the seven declarations above (the
      `--avail-h` string pinned; `/min-height:/` finds nothing in its
      body); `html[data-quiet] .image-stage`'s body equals `main`'s
      byte for byte (the exact string, pasted from `main`, and it
      carries no `--frame-nav-h`; its min-heights still read
      `['100vh', '100svh']`); `.image-frame` declares `--r`, `--q`,
      `--mat`, `max-width: 100%`, `margin` and nothing else; a rule
      with prelude exactly `html:not([data-quiet]) .image-frame`
      declares `--L` as `min(var(--avail-w), var(--avail-h))`, `--S` as
      `calc(var(--L) * 2 / 3)`, `width` as
      `min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r)))` and
      nothing else, and `html:not([data-quiet]) .image-frame img`
      declares `width: 100%` and nothing else; `.image-frame img`'s
      body equals `main`'s; the quiet rules list gains nothing (the
      `:not` preludes do not match its regex — assert so). **New** case
      in (b), "--frame-nav-h is :root's at both widths — the reserve the
      stage's height takes out and the nav claims": the two strings on
      `:root` and on the phone query's `:root`, declared on `:root`
      twice and on no other selector; the `.image-stage` prelude exactly
      `.image-stage`; the page's scoped `.frame-nav` rule declares
      `min-height: var(--frame-nav-h)`, `margin-block-end: var(--block-margin)`
      and `font-size: 0.78rem`, the scoped `.image-head` rule declares
      `padding-block-start: 0`, and the page's scoped style has a
      `@media (max-width: 719.98px)` block with a `.frame-nav` rule
      inside it. **New** cases in (c): "one
      rectangle, turned" — over the grid (its `RATIOS` already hold 0.5,
      0.667, 0.8, 1, 1.5, 1.78 and 3), `--header-h` absent (the
      fallback), `--frame-nav-h` from `root` (the phone string below
      720px): width from the `:not` rule (its `--L` and `--S` resolved
      through the rule's own strings), height = width / ar, and the
      test's own L = min(availW, availH), S = 2L/3: for `ar ≥ 1` width
      ≤ L and height ≤ S, for `ar < 1` width ≤ S and height ≤ L, and one
      bound tight within 1e-6; ratio 1 gives S × S; the exact swapped
      pair is asserted on `1.5` and `1 / 1.5` evaluated in the case
      itself (the grid's literal `0.667` gives a height 0.9995L, which
      cannot pass at 1e-6 — that grid point is left to the fit-and-tight
      bounds; transcribed from the re-review's exact text); 3 gives
      L × L/3; 0.8 gives width S; and the
      image's `max-height` ≥ height at every point; "the sizes hint
      agrees with the rule" — `stageSizes(ratio)` from
      `src/lib/stage-sizes.ts` starts with the literal
      `(max-width: 719.98px) ` (and the module's `PHONE` equals it),
      and the branch the viewport width selects, evaluated with `px()`
      (`vh` as `svh`), equals the CSS width at every grid point within
      1e-6. The quiet evaluator case and the off/gate identities as T1502
      left them; the evaluator's envs gain `--frame-nav-h` and
      `--block-margin` from `root`. _Verify: `sh scripts/verify.sh`
      green (the count recorded);
      `grep -n -- "--frame-nav-h" src/styles/global.css 'src/pages/images/[...id].astro'`
      → the two `:root` declarations, the stage's one read, the nav's
      one (lines listed);
      `sed -n '/^\.image-stage {/,/^}/p' src/styles/global.css | grep -c min-height`
      → 0; `grep -rn "1160px, 94vw" src/` → 0;
      `grep -c "100svh" src/lib/stage-sizes.ts` → 0;
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` — every
      hunk listed, none inside `.gallery-flow`'s rules, the place wall's,
      the `--color-*` lines, `--color-quiet`, a `.piece-held*` rule, the
      `html[data-quiet] .image-stage` rule or the cursor rules;
      `git diff main -- 'src/pages/images/[...id].astro'` → the `sizes`
      line, the `.frame-nav` rule's hunk and the `.image-head` rule's,
      and nothing under `.compare` (the hunks listed). On the dev server
      at 1512×982, 1280×1440 and
      375×812, script on, scroll 0, quiet cleared, on
      `/images/where-the-fog-lets-go/land-b/` (3:2), `…/port-a/` (2:3)
      and `…/pano/` (3:1 — the one panorama with an image page in a
      set; confirm its ratio from the registry and re-derive the
      height from it, so a 2.9:1 file is not reported as a miss):
      `.site-header`'s
      `offsetHeight` (expected 72 — if it differs, re-derive the numbers
      below from it and record both); each figure's
      `offsetWidth`/`offsetHeight` and its image's — expected 785 × 523
      and 523 × 785 at 1512×982 (the height decides), 1216 × 811 and
      811 × 1216 at 1280×1440 (the width decides, wider than the 1160
      column), 343 × 229 and 229 × 343 at 375×812 (±0.5), the long and
      short sides equal across the pair on each viewport (the ⅔ rule
      changes nothing for this pair: S × 1.5 = L), and the panorama
      785 × 262, 1216 × 405, 343 × 114 (L wide, shallower than the box);
      the figure's horizontal centre = `innerWidth / 2`
      (±0.5); the stage's `offsetHeight` = frame height + 96 and its
      `offsetWidth` = `innerWidth`; the visible `.frame-nav`'s
      `offsetHeight` = the token (29 / 29 / 62), its top = the frame's
      bottom + 48, its bottom ≤ `innerHeight` (the value recorded; for
      `port-a` at 1512×982 it is 982 exactly); `.image-head`'s top −
      the frame's bottom = 48 + the nav's height + 48 (125 / 125 / 158,
      ±0.5), its computed `padding-block-start` 0px, and the `h1`'s top
      the eyebrow's box further where the image has categories — each
      part recorded; an image page rendering no `.frame-nav` (find one:
      `grep -L 'class="frame-nav"' dist/images/*/*/index.html | head -1`)
      has the same stage height for its ratio and its head's top = the
      frame's bottom + 48 (±0.5); `git diff main -- 'src/pages/images/[...id].astro'`
      shows no hunk inside `.image-body` or `.sec*` rules (the words
      below the title keep their layout); `img.sizes` equals `stageSizes(ar)` and
      `img.currentSrc` names the smallest srcset candidate at or above
      the rendered width (the `min()`-in-`sizes` claim — if the
      browser fell back to `100vw` the candidate is the largest, and
      that is reported, not fixed); the quiet view's frame padding,
      background, figure and image sizes and the stage's height
      identical to T1502's after-reads; the stage's `offsetHeight` at
      `DOMContentLoaded` equals its height after `astro:page-load`.
      Script off (`user_pref("javascript.enabled", false)` in the
      headless profile's `user.js`): the nav's bottom and the header's
      height at the three viewports — recorded; where the header is
      taller than 72px without script (the phone width, if the nav
      wraps) the difference is recorded as the plan's known limitation;
      if the recipe cannot run without script, say so and the
      `:not([data-quiet])`/bare-`.image-stage` pins stand. Mutations
      named and reverted, tree restored byte-identically:
      `- var(--frame-nav-h)` dropped from `--avail-h` → the stage case
      fails; `min-height: 100svh` restored on `.image-stage` → the stage
      case fails; the `calc(var(--S) * var(--r))` arm dropped from the
      width (a square at L × L) → the turned-rectangle case fails on
      ratios 1 and 0.8 (invisible at 1.78, where the arm is 1.185L);
      `2 / 3` retyped `3 / 4` in `--S` → it
      fails on ratio 1 (the test computes S itself); `3rem` retyped
      `2rem` in `stage-sizes.ts`, or its `PHONE` literal retyped
      `(max-width: 720px)` → the sizes case fails;
      `--frame-nav-h: 0px` declared on `.image-stage` → the
      twice-on-:root case fails; `min-height` removed from `.frame-nav`
      → the nav-claims case fails; the nav's query retyped `719px` → the
      breakpoint pin fails; `padding-block-start: 0` removed from
      `.image-head` or `margin-block-end` from `.frame-nav` → the
      page-pins case fails naming the declaration. The person judges
      the equal rectangle on both screens at the pause._

- [x] **T1503 record** — Script on, scroll 0, quiet cleared, Firefox
      156 headless. The header is **76 / 76 / 136** (75.8 at desktop;
      136.4 at 375, where the nav wraps), so L re-derived from it:
      781 at 1512×982 (the plan's 785 assumed 72), 1216 at 1280×1440,
      343 at 375×812. Frames (figure = image): land-b 781×520.7 /
      1216×810.4 / 343×228.9; port-a 520.7×781 / 810.7×1216 /
      228.7×343; pano (registry 2320×773, `--ar: 3`) 781×260.3 /
      1216×404.7 / 343×114.2. The long and short sides are equal across
      the pair on every viewport. Stage − frame = 96 on all twelve
      reads; the nav 29 / 29 / 62 tall, its top the frame's bottom +
      48; nav bottom for the tallest frame 981.8 of 982 at 1512, 1416.8
      of 1440, 637.4 of 812; head top − frame bottom 125 / 125 / 158,
      `padding-block-start` 0; the h1 46.4 below the head's top (the
      eyebrow's box). No-nav page (`gallery/cozy-brook`, 0.698): stage
      = frame + 96, head = frame bottom + 48 at all three. `img.sizes`
      = `stageSizes(ar)` on all twelve; `currentSrc` the smallest
      candidate at or above the rendered width on all twelve (828 /
      640 at 1512; 1280 / 828 at 1280; 640 at 375 — the `min()` hint
      honoured; a `100vw` fallback would have picked 1280 for port-a at
      1280). Quiet reads identical to T1502's on all six; stage height
      = `innerHeight` there. Stage height at `DOMContentLoaded` equals
      after `astro:page-load` on all twelve (`--header-h` is set by a
      module script before DOMContentLoaded). **Script off** (a
      sandboxed iframe without `allow-scripts` — the `user.js` profile
      hung BiDi): header 75.8 / 75.8 / 136.4 against the 72 fallback;
      at 1512 the frames are 785×523.3 and 523.3×785 and **port-a's
      nav bottom is 985.8 — 3.8px below the fold**; 1280 and 375
      identical to script on. **Missed by the headless 15px scrollbar
      gutter** (`scrollbar-gutter: stable`): the stage's `offsetWidth`
      is `innerWidth − 15` and the figure's centre 748.5 at 1512, and
      at 1280 and 375 the `100vw`-sized frames overhang the stage's
      content box by 15px — the plan's `100vw` known limitation, moot
      on overlay scrollbars. Eleven mutations each failed the named
      cases (the dropped `S·r` arm and the `3 / 4` retype fail first at
      the grid's 0.667, the loop stopping there). Implementer's verify:
      87 pages, `BUILD EXIT 0`, `CHECK EXIT 0`, 14 files / 319 tests,
      `TEST EXIT 0`. Deviations: the two import lines; the stage case
      also pins `position: relative`; the sampler's `sizes` call
      wrapped over three lines for Prettier.

- [x] **T1503a** — The header's fallback to the measured height, and
      a guard on the build-exit fix (Phase 0 review B1 and S4).
      **B1:** without script the tallest frame's nav line ends 3.8px
      below the fold at 1512×982 (985.8 of 982), because the desktop
      header is 75.8px and the fallback in `var(--header-h, 4.5rem)`
      is 72 — Goal 5 and AC 7 say "with and without script". Change
      the fallback to `4.75rem` in `src/styles/global.css`'s
      `.image-stage` `--avail-h` and the `4.5rem` literal in
      `src/lib/stage-sizes.ts` (its header comment too), and the pinned
      `--avail-h` string in `matte.test.mjs`'s stage case; the sizes
      case evaluates the module against the stylesheet, so it fails if
      only one moves (mutation: move one, not the other → the sizes
      case fails; recorded). No other `--header-h` fallback exists in
      CSS (grep). `BaseLayout.astro`'s comment ("matches the desktop
      size") is close-out's (S5). **S4:** a new case in
      `remark-pieces-vocabulary.test.mjs`'s closed-vocabulary describe
      (or `image-meta.test.mjs` — whichever file already reads the
      repo's sources), "every Markdown glob() collection sets
      deferRender: true — the build's exit on a transform error rests
      on it (T1501a)": read `src/content.config.ts`, find every
      `glob({` call, assert each carries `deferRender: true` and that
      there are four. Mutation: one `deferRender` removed → the case
      fails naming the collection. _Verify: `sh scripts/verify.sh`
      green (count recorded); `grep -rn "4.5rem" src/styles/global.css src/lib/stage-sizes.ts`
      → 0 for the fallback (any other 4.5rem listed);
      `grep -rn "4.75rem" src/ matte.test.mjs` → the three places; on
      the dev server at 1512×982 script off (the sandboxed-iframe
      recipe T1503 used) on `port-a`: the nav's bottom ≤ 982 (the
      value); script on: the same page's frame and nav as T1503
      recorded (781 wide L, nav bottom 981.8) — unchanged, since script
      publishes the real header; at 375×812 script off the nav's
      bottom recorded (the phone wrap is the plan's remaining known
      limitation)._

- [x] **T1503a record** — Fallback 4.75rem in `global.css:1887`,
      `stage-sizes.ts` and the pinned string; the deferRender guard
      case in the closed-vocabulary describe (four collections pinned
      by name). Script off at 1512×982, port-a: header 75.8, frame
      520.7×781, nav bottom **981.8** of 982 (was 985.8); script on
      unchanged (781, 981.8). Script off 375×812: header 136.4, frame
      228.7×343, nav bottom 637.4 (width-bound). Script off 1280×1440:
      port-a nav bottom 1416.8, land-b 1011.2, pano 605.5. Three
      mutations each failed the named case. Verify: 87 pages, `BUILD
      EXIT 0`, `CHECK EXIT 0`, 320 tests, `TEST EXIT 0`. Re-review:
      signed off; notes carried (the plan's phone sentence could say
      it does not bind at 375; the guard test pins the count on
      purpose — comment it; `100vh` vs `100svh` is the plan's known
      limitation).

- [x] **T1504** — The sampler, honest. Pattern:
      `src/pages/dev/matte/[...surface].astro` and `_sampler.ts` (spec
      013's, made honest at 015's T1302 — the same move, one section
      further). `[...surface].astro`: delete the `Candidate` type, the
      mat `CANDIDATES` table and `START` from `getStaticPaths` and the
      props (`candidates` gone; `surfaces` and `grounds` stay), the
      wrapper's inline `style` tokens, the `.sampler-bar` block with its
      `[data-candidate]` buttons and floor/ceiling inputs, and the
      `.sampler-bar*` styles; `SURFACE_NOTE` reads: pieces / galleries /
      cards "unmatted since spec 015", stage "bare on paper since spec
      017 — the mat is the quiet view's, judged on the image page"; the
      label's `START` suffix goes; the header comment says the mat bar
      is gone and why (nothing on this page wears a mat; the tokens are
      `:root`'s alone), and loses every mention of the pause; the
      `pieces` comment ("No piece-page script: the pause pins…") →
      "No piece-page script: the fixture shows the frames, not the
      hold's header hand-off". `_sampler.ts`: delete `KEY`, `State`,
      `read`, `state`, `save`, `applySurface`, the floor/ceil seeding in
      `init` and the `[data-candidate]`, `[data-floor]`, `[data-ceil]`
      handlers; `init` calls `initGround()` (the `.sampler-surface`
      guard may go with the sections' loop); the header comment's mat
      bar paragraph → one sentence saying the mat bar left at spec 017.
      The ground bar is untouched. `matte.test.mjs` case (a): "no file
      under src/ outside src/pages/dev/ declares one — the sampler alone
      may override" → "no file under src/ declares one" (the exemption
      dropped; the sampler carries no tokens now). _Verify:
      `sh scripts/verify.sh` green with `87 page(s) built` and the
      barrier line; `grep -rl "dev-ground\|matte-sampler" dist/` empty;
      `test ! -e dist/dev && echo absent`;
      `grep -c "data-candidate\|data-floor\|data-ceil\|applySurface\|mat-share" "src/pages/dev/matte/[...surface].astro" src/pages/dev/matte/_sampler.ts`
      → 0 and 0; `grep -c -i pause` on both → 0 and 0;
      `grep -c "getComputedStyle"` on both → 0 and 0;
      `npx prettier --check` clean on both. On the dev server at
      1512×982: `/dev/matte/` renders four sections; the stage section's
      four `.image-frame`s pad 0 with `rgba(0, 0, 0, 0)`; the `pieces`
      section has no `.piece-pause` and its held figure renders; the
      ground bar: `paper` sets `<html>`'s background to
      `oklchToRgb255(paper)` within 1/255 and writes the key with five
      tokens, `today` removes the key and every inline token (spec 015's
      T1302 reads, repeated); `ground.test.mjs` green and unedited._

- [x] **T1504 record** — Mat bar gone; every grep 0; `dist/dev` absent,
      no `dev-ground` or `matte-sampler` in `dist/`; prettier clean on
      the two sampler files. On the dev server at 1512×982: four
      sections, no bar elements, the four stage frames padding 0 with
      `rgba(0, 0, 0, 0)`, no `.piece-pause` and the held figure laid
      out as a grid with its image complete; the ground bar read on
      `light` (there is no `paper` button — `today` is the paper ground
      since spec 015; the Verify copied 015's wording): html background
      `rgb(249, 248, 245)` = `oklchToRgb255(light)` exactly, the key
      with five tokens; `today` removes the key and every ground token.
      Case (a) can fail: HEAD's sampler file put back → `Received
      ["--mat-max","--mat-min","--mat-share"]`. Verify: 87 pages, `BUILD
      EXIT 0`, `CHECK EXIT 0`, 319 tests, `TEST EXIT 0`. Noted:
      `matte.test.mjs` is prettier-unclean at ~340 (pre-existing on
      `main`); the sampler's "each a viewport tall" stage comment may be
      stale after T1503 — for the phase review.

### Phase 0 record (the person's walkthrough)

**Attested 2026-09-22** (both screens): "Honestly looks great now. This
is much better than before. Both 3:2, 3:2 [2:3], and panos look great,
as do all the others I've checked. good to continue." **The rule kept:
equal rectangle** (AC 10) — equal area is not tried. The fog piece's
panorama stays a fullbleed. No finding reported; no deviation beyond
the report's own list (the build's exit fixed at T1501a, the header
fallback at T1503a, the sampler's bar and the README's Matted column).
Numbers beside it: T1502's and T1503's records above (781 × 521 on the
laptop, 1216 × 811 on the DualUp, the nav's bottom 981.8 of 982).


_(The product owner's attestation from the site under `npm run dev` on
both screens: `/pieces/where-the-fog-lets-go/` reads on with a fullbleed
panorama where its pause was — or he names `wide` or `single` instead,
one line at T1500's file; `/pieces/vocabulary-sampler/` and the held
frame's header hand-off; the three image pages `land-b` (3:2), `port-a`
(2:3) and `pano` (3:1), on the laptop and on the DualUp — the
photograph bare and centred just below the header, the two frames the
same rectangle turned (the height deciding on the laptop, the width on
the DualUp), the panorama at the box's full width and shallower, the
previous / where / next line directly beneath at a piece's spacing and
at or above the fold (at it where the height decides), the title
following; the click into the quiet
view's white mat and back; anything he saw that the spec did not say.
**The judgement the spec puts here**: whether the equal rectangle reads
right, or a landscape frame looks too small beside a portrait of the
same short side — in which case the alternative the spec names is
equal area, and that is a spec amendment (spec.md's AC on the rule
kept), not a plan decision; the report lists it under "what needs your
decision". The pause report says plainly, in its "what you can now do"
item, that the photograph on paper is resized by the rule — on the
laptop a 3:2 is narrower than today's (785 against 1080) and a 2:3
taller, on the DualUp both are larger, and every frame has lost the
80px of mat it wore — and that the title's block now follows the nav
line at the piece's spacing (the words below it as before); and its "where
execution deviated" item lists the two scope extensions the plan
authorised on its own: the dev sampler's mat bar removed, and the
README block table's Matted column dropped. Recorded here by the
orchestrator in his words, with T1502's and T1503's numbers beside
them — and his rule kept or the one to try — before Phase 1 is
dispatched.)_

## Phase 1 — The documents (reviewer after the phase; walkthrough: none — README, AUTHORING, the plugin's README, the brief and two earlier specs' annotations change nothing on the site; runs on without a pause)

- [x] **T1505** — Docs: `README.md`, `AUTHORING.md`,
      `obsidian-plugin/README.md`, `design/brief.md`, and the two
      annotations. Pattern: spec 015's T1304 line. `README.md`: the
      block table loses its `pause` row and the `¹` footnote, and its
      Matted column (every remaining row "no"); the sentence after the
      table says the site mats only the image page's quiet view (spec
      015, narrowed at 017) — a flat white field 6% of the frame's
      rendered short side, 4–40px, equal on four sides — and that every
      other frame, the stage on paper included, sits on the ground; the
      spec list at ~20 reads "007 the held image (its pause withdrawn at
      017)"; "Current status" (~131) reads "the spec-003 blocks and spec
      007's held block" and "the mat rule (the quiet view alone since
      spec 017)"; the image-page paragraph (~151) says the page shows the
      photograph bare and centred just below the header, one rectangle
      turned — its long side the smaller of the page's width and the
      first screen's height below the header less the previous / next
      line and a piece's frame-to-prose spacing above and below — the
      previous / next line directly beneath at that spacing and above
      the fold, then the title, and the photograph matted on the quiet
      dark in the quiet view — the one matted surface; no sentence is
      left that calls the stage a screen below the header; the tree
      loses `pause-shape.test.mjs` and `lib/pause-shape.ts` and gains
      `lib/stage-sizes.ts` (the stage's `sizes` rule in literals).
      `AUTHORING.md`: the plugin bullet (~46)
      loses `::pause` from its list and the "A `::pause` previews…"
      sentence; ~183 loses `pause`; "A story is prose — no holds, no
      pauses." (~269) → "A story is prose — no holds." with the sentence
      after it about the held frame alone; "## The two blocks that take
      time" → "## The block that takes time" with its intro for `held`
      alone; "### A pause" through "…reads the same." (~348–402) deleted
      except that the header paragraph (~393) is restated for the held
      block alone and the last paragraph reads "`held` takes no tuning
      attributes beyond `side` and `bleed`; the hold's margin and the
      reading measure are site knobs, so every hold reads the same";
      the sampler-link paragraph (~555–561) deleted with its "one
      exception" framing; the never-bake rule (~598) says the mat is the
      quiet view's alone and "in the quiet view it would render
      double-matted", and any sentence in the file describing the image
      page's stage as a screen below the header (grep `stage` — ~600 is
      the one hit outside the deleted section) is corrected to the rule
      above in one clause. `obsidian-plugin/README.md`: the table's first row
      loses `::pause`. `design/brief.md` (~152): "Since spec 015 it is
      worn by the image page's stage and the quiet view" → since spec
      017 by the quiet view alone, the stage bare on paper, and the
      parenthetical about the pause frame deleted.
      `specs/007-held-image/spec.md`: after the `**Status**` line, one
      line: "**Status (2026-09-22)**: the pause half withdrawn at spec
      017 — its block, presentation, script and fixtures left the site;
      the held block stands as specified here. Not rewritten; read the
      pause's clauses as history." `specs/015-the-hero-mat/spec.md`, the
      "The pause block" non-goal: one trailing line, "_Answered at spec
      017: the pause was withdrawn, not reworked; its deferred mat went
      with it._" Hand-edit the prose (never script-rewrap; grep for lines
      beginning with a CSS `>` or `+` before any format run). _Verify:
      every claim read against the built stylesheet and T1502/T1503's
      records; `grep -n -i pause README.md AUTHORING.md design/brief.md obsidian-plugin/README.md`
      → only the README spec-list line (every hit listed);
      `grep -n "Status (2026-09-22)" specs/007-held-image/spec.md` → 1;
      `grep -n "Answered at spec 017" specs/015-the-hero-mat/spec.md` → 1;
      `npx prettier --check README.md AUTHORING.md design/brief.md obsidian-plugin/README.md`
      clean; `sh scripts/verify.sh` green (nothing under test changes —
      the run is the record)._

- [x] **T1505 record** — Six files, +83/−137. Greps: the pause in
      the four docs → README:20 (the spec list) and README:396 ("going
      live is paused", the deployment section — the plain word, not
      the block); the 007 status line and the 015 non-goal line → 1
      each; prettier clean on the four; verify 87 pages, 320 tests,
      all `EXIT 0`. Deviations: README's "one matted surface" clause
      sits on the paragraph's quiet-view sentence, not its first;
      AUTHORING had no "screen below the header" sentence to correct.
      Left for close-out: `design/brief.md` ~81–100 (spec 015's
      Palette paragraph still says "every surface but the image page's
      stage" and "the darker field the stage wants is its own spec")
      and its "narrowed at spec 015" heading — history, annotate.

## Phase 2 — Close-out (the documents, the reviewer sweep, then merge)

- [ ] **T1506** — Close-out. The repo-wide documents are edited by
      `sdd-implementer-fable` — the close-out row of `CLAUDE.md`'s role
      table — on a bundle (T1505 is the pattern; the bundle carries the
      Phase 0 record, plan.md's "Resolved decisions", spec.md's
      "Decided" list, `ROADMAP.md`'s four entries named here and
      `DECISIONS.md`'s "Spec 007", "Spec 015" and "Spec 016" sections)
      and committed by the orchestrator on this branch, to reach `main`
      with the PR; the sweep, the merge and the bookkeeping are the
      orchestrator's own part. `ROADMAP.md`: strike "The pause and the
      hero leave the site" as done at spec 017 (one clause: the block,
      its presentation and its fixtures gone; the cue kept on the paper
      stage; the mat the quiet view's) and strike "The stage across
      screen shapes" as done at spec 017 too (folded in after sign-off
      at the product owner's call; the rule kept — equal rectangle, or
      equal area if the pause chose it — named in one clause, with the
      questions the entry left answered: equal sides, a share of the
      screen, the width past the text column, the same distance);
      annotate "The pause, rethought"
      (its italic gains: the block is `main`'s history up to 017's
      merge; a rework starts from that history and the archive) and
      "The mat only where the ground goes dark" (its italic gains: done
      at 017 — the stage bare on paper, the quiet view matted, pinned);
      `DECISIONS.md` also gains, inside the Spec 017 section, the
      T1501a discovery (the "fails the build" claim was never checked
      against the exit code from spec 001 on; withastro/astro#18054 and
      PR #18064; the four options and why `deferRender` won; it need
      not be reverted when the upstream fix ships), and `CLAUDE.md`'s
      Testing section gains, after "A malformed entry should fail the
      build loudly, not silently.", the sentence: "A transform error is
      the same kind of failure: Astro's content loader would only log
      it and publish the entry bodiless, so every Markdown collection
      sets `deferRender: true` (spec 017, T1501a) and the error fails
      the build from the page instead. That option is the mechanism
      behind every "fails the build" claim about the transform;
      removing it reopens the gap." — the constitution line committed
      to `main` in its own commit after the merge, not on the branch.
      `DECISIONS.md`: annotate "Spec 007" (one paragraph at its
      top: half withdrawn at 017 — the pause's decisions are history,
      the held block's stand), "Spec 015" (one clause where it defers
      the pause: withdrawn at 017 rather than reworked; the stage's mat
      narrowed to the quiet view there) and "Spec 016" (one clause: the
      removal spec is 017, merged); add "## Spec 017: the pause
      withdrawn" in 016's shape — the decision in the photographer's
      words (from spec.md's Summary and Decided), what left and what
      stayed (the held block, `data-scene-active` renamed for it), the
      failure-by-name choice and why the closed vocabulary's own error,
      the mat rule's one surface and the `--mat: 0px` shape, the stage
      refit in his words ("centered and is as large as needs to be …
      the title and text follows as it would in any other piece") with
      the rule he kept at the pause and why the long side is `min` of
      the two limits, the cue as a term inside that height rather than
      a switch, the normal-view frame rules gated on `:not([data-quiet])`
      so the quiet view stays byte-identical, the `sizes` hint as a
      module, the head's own padding left to the words' layout, the
      sampler's mat bar gone, the fixture's fullbleed (or what he chose
      at the pause), and the archive as the way back. Both hand-edited
      (`npx prettier --check` clean; grep for lines beginning with a
      CSS `>` or `+` before any format run). Then, the orchestrator's
      part: the pre-merge whole-spec sweep at the reviewer's default
      tier and its findings resolved; the acceptance criteria checked
      against their records (AC 1 by T1501's case and its negative
      control; AC 2 by T1501's walk, T1502's greps and the grep below;
      AC 3 by T1501's diff and T1502's held reads; AC 4 by T1502's reads
      and the one-surface walk; AC 5 by T1503's stage, nav and head
      reads at the three viewports; AC 6 by T1503's turned-rectangle
      case and the pair's reads on both screens; AC 7 by T1503's
      nav-bottom reads at the three viewports and the Phase 0
      attestation; AC 8 by the sizes case and T1503's `currentSrc`
      read; AC 9 by the quiet rules' string pins and T1503's quiet
      reads; AC 10 by the Phase 0 record's "rule kept" line; AC 11 by
      T1502's and T1503's empty diffs and hunk lists; AC 12 by T1500's
      build; AC 13 by the final run and the greps below); build, tests,
      check, GPS scan, dev-routes scan and format green with actual
      output; the PR marked ready and merged with a merge commit; the
      close-out box ticked in the same shell command as the merge
      bookkeeping. _Verify: the implementer's `sh scripts/verify.sh`
      green with the documents edited;
      `grep -rn -i "pause" src/ remark-pieces-blocks.mjs *.test.mjs obsidian-plugin/main.ts`
      → the one test's lines and `src/pages/about/index.astro`'s
      "go-live pause" and nothing else (every hit listed);
      `grep -rn -i "pause" README.md AUTHORING.md design/brief.md obsidian-plugin/README.md CLAUDE.md`
      → only lines that are history or say the pause was withdrawn
      (every hit listed); `grep -n "Spec 017" DECISIONS.md ROADMAP.md`
      → the new section and the three annotations;
      `git diff main --stat` lists no file outside plan.md's File
      structure and this directory; main green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log

> **The standard profile**, as `CLAUDE.md`'s role table fixes it: the
> session on `claude-fable-5-1` at medium effort; the planner, the
> plan/tasks sign-off and any decision review at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> task implementation and the per-phase reviews and sweep at `opus`;
> close-out at the top tier's model at medium (`sdd-implementer-fable`).
> Baseline — spec 015 (the first spec under the settled profile):
> planner 291,534 + 24,466 resumed; sign-off 184,475 + re-review
> 16,984; implementer 741,422 over 8 dispatches (T1300–T1305a);
> reviewer 532,734 over 4 invocations; no tier miss, no fallback. Spec
> 016's log lives on its archive branch (`016-the-hero-stage`) and is
> not a baseline here: it was withdrawn before close-out.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation              | Tier                           | Tokens | Outcome / miss reason |
| ------------------------------ | ------------------------------ | ------ | --------------------- |
| Planning: draft (`sdd-planner`) | top (`claude-fable-5-1`, high) | 318,823 | drafted; no product question returned; one reading (AC 6) and one rename (`data-held-active`) flagged |
| Planning: fixes (`sdd-planner`, resumed) | top (`claude-fable-5-1`, high) | 14,593 | B1–B3 fixed, N1/N2/N4/N6 folded, N3/N5 into the Phase 0 record note |
| Sign-off (`skeptical-reviewer`) | top (`claude-fable-5-1`, high) | 130,852 | fix and re-review: B1 (T1503's 375×812 shrink claim could not pass — the 2:3 is width-bound there), B2 (AC 7's diff pins missing from T1503), B3 (T1501's case name claimed the source walk its body deferred); six notes |
| Sign-off re-review (`skeptical-reviewer`, resumed) | top (`claude-fable-5-1`, high) | 11,786 | signed off; one note carried: the 3:2 equality claim narrowed to one viewport in fixing B1 though it holds at all three — transcribed into T1503 |
| Planning: the stage refit (`sdd-planner`, resumed, after the spec amendment) | top (`claude-fable-5-1`, high) | 73,644 + 10,357 | T1503 rewritten as the refit; one product question (the title block's own padding) returned and settled in the spec, folded in |
| Amendment sign-off (`skeptical-reviewer`, new invocation) | top (`claude-fable-5-1`, high) | 152,025 | fix and re-review: B1 (the rule undefined for ratios beyond 3:2 — the spec's square sentence contradicted the plan's formula; settled in the spec as the L × ⅔L reference rectangle, turned), B2 (T1506's AC map at the pre-amendment numbering); nine notes |
| Planning: amendment fixes (`sdd-planner`, resumed) | top (`claude-fable-5-1`, high) | 35,150 | B1–B2 fixed, notes folded |
| Amendment re-review (`skeptical-reviewer`, resumed) | top (`claude-fable-5-1`, high) | 24,979 | signed off once one line is fixed: the exact-pair assertion at the grid's literal 0.667 cannot pass at 1e-6 — transcribed into T1503 and plan.md (assert on 1.5 and 1/1.5 in the case); two notes transcribed (the 1.78 mutation claim dropped; the panorama's height re-derived from its registry ratio) |
| T1500 (`sdd-implementer`) | implementation (`opus`, high) | 28,167 | done; 87 pages, 332 tests; one blank line more deleted in matte-sampler (188) so the file does not end on a blank |
| T1501 (`sdd-implementer`) | implementation (`opus`, high) | 73,631 | done, 320 tests; stopped on the negative control (build exits 0 on a render error) — returned as a design question, correctly |
| Decision review: build exit on `file.fail` (`skeptical-reviewer`) | top (`claude-fable-5-1`, high) | 56,655 | option D with `deferRender: true` (astro#18054); T1501a added; constitution Testing sentence and DECISIONS entry to close-out |
| T1501a (`sdd-implementer`) | implementation (`opus`, high) | 37,196 | done; BUILD EXIT 1 on the control, line 68; 320 tests |
| T1501a per-task review (`skeptical-reviewer`) | implementation (`opus`, high) | 29,101 | signed off, no blocking; seven notes, five carried to the sweep |
| T1502 (`sdd-implementer`) | implementation (`opus`, high) | 137,230 | done first dispatch; BiDi before/after identical on the quiet view and the held park; 316 tests |
| T1502 per-task review (`skeptical-reviewer`) | implementation (`opus`, high) | 72,565 | signed off, no blocking; N1 → T1503, N2–N8 carried |
| T1503 (`sdd-implementer`) | implementation (`opus`, high) | 146,717 | done first dispatch; header 76 not 72, L 781 at the laptop; no-script nav 3.8px under the fold there (known limitation, to the pause report); 319 tests |
| T1504 (`sdd-implementer`) | implementation (`opus`, high) | 80,634 | done first dispatch; 319 tests |
| Phase 0 review (`skeptical-reviewer`) | implementation (`opus`, high) | 163,719 | one blocking: B1 no-script nav 3.8px under the fold on the laptop (fallback 4.5rem vs 75.8 measured) → T1503a; S4 folded into T1503a; S1–S3, S5–S8 carried |
| T1503a (`sdd-implementer`) | implementation (`opus`, high) | 46,666 | done first dispatch; no-script nav 981.8 of 982; 320 tests |
| Phase 0 re-review (`skeptical-reviewer`, new invocation) | implementation (`opus`, high) | 26,217 | SIGNED OFF; three notes carried |
| T1505 (`sdd-implementer`) | implementation (`opus`, high) | 57,786 | done first dispatch; 320 tests |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- T1501a N1: no automated guard on the build's exit — a Vitest
  assertion that each Markdown collection sets `deferRender: true`
  would catch the likeliest regression; otherwise the gap stands
  recorded. (The T1501 test's name says "fail as an unknown block",
  the transform's throw, not the build — checked, no rename needed.)
- T1501a N2: the container form `:::pause` was not run as a build
  control (the leaf was); run it once at the sweep.
- T1501a N3: the Verify's "reading time renders" assumed a feature
  the site does not have; correct the wording at close-out.
- T1501a N5: `src/content.config.ts`'s comment names "a missing
  image" as a case that fails the build; only the unknown directive
  was run — narrow the comment or run it at close-out.
- T1501a N7: `deferRender` needs astro ≥ 7.1.0; note the floor in
  DECISIONS.md at close-out.
- T1502 N2/N3: two comments in `global.css` read awkwardly or carry a
  leftover phrase (the ground comment ~1238; `--hold-margin`'s
  "decision 5: one margin" ~1324) — cosmetic, for close-out.
- T1502 N4/N5: the word-walk test resolves paths from the cwd (the
  sibling `matte.test.mjs` uses `here()`), and reads every photograph
  under `src/` to find a NUL byte — skip by image extension.
- T1502 N6: the two-spelling pin is a raw `toContain` and would pass
  on commented-out text; the header's behaviour was read in the
  browser, which is the real check.
- T1502 N7: only end states were measured — if any transition on the
  frame animates the quiet toggle, the mat may now snap in; a look at
  the phase walkthrough.
- Phase 0 review S1: the DualUp with a permanent scrollbar (a mouse
  attached) would show the frame 7.5px right of centre and 15px over
  the stage's box — ask the person to look, do not assume overlay
  scrollbars.
- Phase 0 review S2: the DOMContentLoaded read cannot prove "no
  layout shift" — `--header-h` is written by a module script that may
  run after first paint; B1's fix zeroes the desktop jump.
- Phase 0 review S5: stale comments for close-out — the sampler's
  stage comment "each a viewport tall" (`[...surface].astro` ~108) and
  `BaseLayout.astro` ~119–123 ("layouts that fill the viewport below
  it", "matches the desktop size").
- Phase 0 review S6: the nav token floors a one-row nav above 720px;
  a long middle label wrapping on the laptop would push the tallest
  frame's nav line under the fold — a look at the longest set title
  at the walkthrough.
- Phase 0 review S7: the close-out grep lists `src/pages/about/index.astro`'s
  "go-live pause" explicitly.
- Phase 0 review S8: `stageSizes` prints full-precision coefficients
  (`0.6666666666666666`) — valid, noisy; cosmetic.
- T1502 N8: the walk's pattern misses upper-case constants and any
  plugin stylesheet; the close-out grep must include `obsidian-plugin/`.

## Handoff note

Nothing is implemented; the next session begins at **T1500** (Phase 0)
as the orchestrator under the model policy's standard profile and its
role table: it opens on `claude-fable-5-1` at medium effort from
`.claude/settings.json` (`/effort status` to confirm); it dispatches
the `sdd-implementer` one task at a time at `opus` and the
`skeptical-reviewer` per phase at `opus`, re-running `sh scripts/verify.sh`
itself for **T1502** (`review: per-task`); a design question it cannot
triage as routine goes to the `skeptical-reviewer` at the top tier on
a decision bundle from Plan Mode. The suite is green at the end of
every task; the closed-vocabulary case grows its source walk at T1502,
where it can pass. The **Phase 0 pause is the walkthrough and the
spec's judgement**: the fog piece with its fullbleed panorama (and the
offer of `wide` or `single` instead), the vocabulary sampler's held
frame, the `land-b`, `port-a` and `pano` image pages on both screens —
the frame bare and centred just below the header, the pair the same
rectangle turned and the panorama at the box's width, the previous /
where / next line beneath at the piece's spacing and at or above the
fold, the quiet view — with T1502's and T1503's
numbers in the report, and the one question the spec puts to him
there: does the equal rectangle read right, or should the next look
try equal area (a spec amendment if so). The orchestrator does no
browser or device checks itself. **Phase 1 has no walkthrough** and
runs on to the close-out without stopping; the merge pause is the
second and last.

> Read `CLAUDE.md` and `specs/017-the-pause-withdrawn/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's standard profile and its role table (`/effort status`
> first; medium is right for this session): triage; dispatch each
> routine task to the `sdd-implementer` on a task bundle assembled with
> shell (the task line, the plan sections, the acceptance criteria, the
> files, the pattern file, any recorded value — for T1503, plan.md's
> "The stage refit" with its CSS and numbers), telling it not to read plan.md, spec.md,
> or tasks.md in full; take the verification from the implementer's
> verbatim `sh scripts/verify.sh` output, except T1502, which you re-run
> yourself before committing (`review: per-task`); do no
> browser or device checks by hand — the implementer measures and
> records, the person attests the rest; stage, then bundle the diff for
> the `skeptical-reviewer` per phase (and once for T1502 on its own),
> one review and at most one re-review, the rest logged; commit, check
> the box, and log the tier and tokens in one shell command.
> Involvement level is product owner: pause after Phase 0 — its report
> names the fog piece, the sampler's held frame and the three image
> pages (`land-b`, `port-a`, `pano`) to open on both screens, what to
> look for (the frame bare and centred below the header, the pair the
> same rectangle turned, the panorama at the box's width, the line
> beneath at the piece's spacing and at or above the fold, the quiet
> view's mat), the spec's one judgement (equal rectangle kept, or equal
> area to try — a spec amendment) and the one open offer (fullbleed,
> wide or single for the panorama) in plain language; Phase 1 runs on
> without a pause; pause whenever something unexpected bears on spec
> adherence; the same session continues after the pause when the
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
