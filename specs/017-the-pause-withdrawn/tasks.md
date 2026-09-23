# Tasks: The pause withdrawn

**Status**: Draft — pending sign-off
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1500–T1504) — the fixtures rewritten so
the build stays green through every task, the pause out of the
transform and the plugin with the closed-vocabulary failure pinned, the
stylesheet and the piece page's script cleared of it with the mat moved
to the quiet view and `matte.test.mjs` rewritten pin by pin, the cue
landed, and the sampler made honest — so the person attests the cue
and the bare stage on a site with nothing of the pause left in it.
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

## Phase 0 — Foundation: the pause out, the mat to the quiet view, the cue (reviewer after the phase; `review: per-task` on T1502; walkthrough: the fog piece reads with a fullbleed panorama where its pause was, every image page opens bare on paper with the previous / where / next line ending at the fold on both screens, and a click still takes the photograph to the quiet dark in its white mat)

- [ ] **T1500** — The fixtures first, so the build is green at every
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

- [ ] **T1501** — The pause out of the transform, the passage table and
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

- [ ] **T1502** — The pause out of the stylesheet and the piece page's
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
      `.image-frame` keeps `max-width` and `margin: 0`, declares
      `--mat: 0px` (the image's height cap still reads it), and loses
      `--r`, `--q`, form V+H, `padding` and `background`; a **new rule**
      `html[data-quiet] .image-frame { --r; --q; --mat: min(V, H); padding: var(--mat); background: var(--color-matte) }`
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
      `min(FORM_V, FORM_H)`, `--r`/`--q` there; a walk over every
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
      — T1503 adds the cue's term; `.image-frame` declares `--mat: 0px`
      and none of `--r`, `--q`, `padding`, `background`; `.image-frame img`'s
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

- [ ] **T1503** — The cue: one token the stage spends and the nav
      claims. Pattern: `:root`'s `--baseline` line and the `.image-stage`
      rule in `src/styles/global.css`; `.frame-nav` in
      `src/pages/images/[...id].astro`; spec 016's shape, quoted in
      plan.md (the archive is not on this branch). `src/styles/global.css`
      `:root`, after `--baseline`:
      `--frame-nav-h: calc(0.78rem * 1.362 + var(--baseline) * 0.5);`
      with a comment (one row of the nav's 0.78rem mono at the font's
      `normal` line-height, 1.362 measured, plus its half-baseline
      bottom padding — 29px; the phone query below mirrors the nav's own
      719.98px wrap — 62px; retune both together); directly after the
      `:root` block, `@media (max-width: 719.98px) { :root { --frame-nav-h: calc(0.78rem * 1.362 * 2 + 1rem + var(--baseline) * 0.5); } }`.
      `.image-stage`: `--avail-h` gains `- var(--frame-nav-h)` at its
      end and both `min-height` lines gain `- var(--frame-nav-h)`; the
      rule's prelude stays the bare `.image-stage`; the stage comment
      gains the cue's paragraph (the stage gives up the nav's height so
      the previous / where / next line ends at the fold, on paper,
      always, script or not; it comes off `--avail-h` as well as the
      min-heights because a height-bound frame would otherwise grow the
      stage back; the quiet stage rule redeclares all three without it).
      Nothing else in the rule moves — width, pad, padding, centring are
      the next spec's. `src/pages/images/[...id].astro` `.frame-nav`:
      `min-height: var(--frame-nav-h);` after `width`, with a comment
      (the reserve the stage spends, claimed here so the two cannot
      drift; border-box by the global reset; keep the token, the 0.78rem
      and the 719.98px query in step). `matte.test.mjs`: the stage case
      now expects `--avail-h` as
      `calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad) - var(--frame-nav-h))`
      and, read raw with the `/min-height:([^;]*)/g` regex, the two
      lines `calc(100vh - var(--header-h, 4.5rem) - var(--frame-nav-h))`
      and the `svh` twin; the quiet stage's body does not contain
      `--frame-nav-h` and its min-heights read `['100vh', '100svh']`;
      **new** case in (b), "--frame-nav-h is :root's at both widths — the
      reserve the stage spends and the nav claims": the two strings
      above on `:root` and on the phone query's `:root`, declared on
      `:root` twice and on no other selector; the `.image-stage` rule's
      prelude is exactly `.image-stage`; the page's scoped `.frame-nav`
      rule declares `min-height: var(--frame-nav-h)` and
      `font-size: 0.78rem`, and the page's scoped style has a
      `@media (max-width: 719.98px)` block with a `.frame-nav` rule
      inside it (the token's two inputs, pinned where they live). The
      evaluator's envs gain `--frame-nav-h` from `root`. _Verify:
      `sh scripts/verify.sh` green;
      `grep -n -- "--frame-nav-h" src/styles/global.css 'src/pages/images/[...id].astro'`
      → the two `:root` declarations, the stage's three reads, the
      nav's one (lines listed);
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` — every
      hunk listed, none inside `.gallery-flow`'s rules, the place wall's,
      the `--color-*` lines or `--color-quiet`, none inside a
      `.piece-held*` rule; `git diff main -- 'src/pages/images/[...id].astro'`
      → the `.frame-nav` rule's hunk and nothing under `.compare` (the
      hunks listed); on the dev server at 1512×982, 1280×1440 and
      375×812, script on, at scroll 0 with the quiet state cleared: on
      `/images/where-the-fog-lets-go/land-b/` the visible `.frame-nav`'s
      `offsetHeight` equals the token's computed px (29 / 29 / 62) and
      `getBoundingClientRect().bottom ≤ innerHeight` (the value
      recorded); the stage's `offsetHeight` equals
      `innerHeight − header.offsetHeight − token` within 0.5px, the
      header's `offsetHeight` recorded beside it; the stage's
      `offsetWidth` and `left` equal T1502's after-reads. The frame's
      box by the limit that binds it: at 1512×982 the 3:2 figure's
      `offsetWidth` and its image's width equal T1502's after-reads
      (width-bound at 1160 wide, its 773px height against `--avail-h`
      with roughly 50px to spare after the cue — the margin recorded);
      on `…/port-a/` at 1512×982 and 1280×1440 the figure's
      `offsetHeight` is shorter than T1502's after-read by exactly the
      token (±0.5) and its width by token × 0.667 (height-bound there);
      at 375×812 the 2:3 figure is **width-bound** (`--avail-w` is 343px
      at the page-pad clamp's floor, so the frame is 514.5px tall
      against an `--avail-h` of roughly 660–690px) and its `offsetWidth`
      and `offsetHeight` equal T1502's after-reads — AC 6's "unchanged"
      clause from the other side, recorded as such; an image page
      rendering no `.frame-nav` (find one:
      `grep -L 'class="frame-nav"' dist/images/*/*/index.html | head -1`)
      has the same stage height as one with; the quiet view's stage is
      `innerHeight` tall, equal to T1502's after-read; the stage's
      `offsetHeight` at `DOMContentLoaded` equals its height after
      `astro:page-load`. Script off (`user_pref("javascript.enabled", false)`
      in the headless profile's `user.js`): the nav's bottom read at the
      three viewports, `--header-h` at its 4.5rem fallback — recorded;
      if the recipe cannot run without script, say so and the prelude
      pin stands. Mutations named and reverted: `- var(--frame-nav-h)`
      dropped from `--avail-h` → the stage case fails; `--frame-nav-h: 0px`
      declared on `.image-stage` → the twice-on-:root case fails;
      `min-height` removed from `.frame-nav` → the nav-claims case
      fails; the nav's query retyped `719px` → the breakpoint pin
      fails. The person attests the line above the fold on both screens
      at the pause._

- [ ] **T1504** — The sampler, honest. Pattern:
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

### Phase 0 record (the person's walkthrough)

_(The product owner's attestation from the site under `npm run dev` on
both screens: `/pieces/where-the-fog-lets-go/` reads on with a fullbleed
panorama where its pause was — or he names `wide` or `single` instead,
one line at T1500's file; `/pieces/vocabulary-sampler/` and the held
frame's header hand-off; an image page — the stage bare on paper, the
previous / where / next line ending at the fold at the top on the
laptop and on the DualUp, the click into the quiet view's white mat and
back; anything he saw that the spec did not say. The pause report says
plainly, in its "what you can now do" item, that the photograph on
paper is larger than before by the mat it no longer wears — 80px at
the 40px ceiling — and that what the cue changes is the stage's
height, which is what the spec's sizing criterion measures; and its
"where execution deviated" item lists the two scope extensions the
plan authorised on its own: the dev sampler's mat bar removed, and the
README block table's Matted column dropped. Recorded here by the
orchestrator in his words, with T1502's and T1503's numbers beside
them, before Phase 1 is dispatched.)_

## Phase 1 — The documents (reviewer after the phase; walkthrough: none — README, AUTHORING, the plugin's README, the brief and two earlier specs' annotations change nothing on the site; runs on without a pause)

- [ ] **T1505** — Docs: `README.md`, `AUTHORING.md`,
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
      photograph bare on the stage, the previous / next line above the
      fold, and matted on the quiet dark in the quiet view — the one
      matted surface; the tree loses `pause-shape.test.mjs` and
      `lib/pause-shape.ts`. `AUTHORING.md`: the plugin bullet (~46)
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
      double-matted". `obsidian-plugin/README.md`: the table's first row
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
      stage; the mat the quiet view's); annotate "The pause, rethought"
      (its italic gains: the block is `main`'s history up to 017's
      merge; a rework starts from that history and the archive) and
      "The mat only where the ground goes dark" (its italic gains: done
      at 017 — the stage bare on paper, the quiet view matted, pinned);
      "The stage across screen shapes" is untouched and is the next
      spec. `DECISIONS.md`: annotate "Spec 007" (one paragraph at its
      top: half withdrawn at 017 — the pause's decisions are history,
      the held block's stand), "Spec 015" (one clause where it defers
      the pause: withdrawn at 017 rather than reworked; the stage's mat
      narrowed to the quiet view there) and "Spec 016" (one clause: the
      removal spec is 017, merged); add "## Spec 017: the pause
      withdrawn" in 016's shape — the decision in the photographer's
      words (from spec.md's Summary and Decided), what left and what
      stayed (the held block, `data-scene-active` renamed for it), the
      failure-by-name choice and why the closed vocabulary's own error,
      the mat rule's one surface and the `--mat: 0px` shape, the cue
      as one token without a switch, AC 6 read as the frame's box, the
      sampler's mat bar gone, the fixture's fullbleed (or what he chose
      at the pause), and the archive as the way back. Both hand-edited
      (`npx prettier --check` clean; grep for lines beginning with a
      CSS `>` or `+` before any format run). Then, the orchestrator's
      part: the pre-merge whole-spec sweep at the reviewer's default
      tier and its findings resolved; the acceptance criteria checked
      against their records (AC 1 by T1501's case and its negative
      control; AC 2 by T1501's walk, T1502's greps and the grep below;
      AC 3 by T1501's diff and T1502's held reads; AC 4 by T1502's reads
      and the one-surface walk; AC 5 by T1503's reads and the Phase 0
      attestation; AC 6 by T1503's before/after arithmetic; AC 7 by
      T1502's and T1503's empty diffs and hunk lists; AC 8 by T1500's
      build; AC 9 by the final run and the greps below); build, tests,
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
| Planning: draft (`sdd-planner`) | top (`claude-fable-5-1`, high) | _(the dispatcher records the return's figure)_ | drafted; no product question returned; one reading (AC 6) and one rename (`data-held-active`) flagged |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- _(none yet)_

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
where it can pass. The **Phase 0 pause is the walkthrough**: the fog piece with its fullbleed panorama
(and the offer of `wide` or `single` instead), the vocabulary sampler's
held frame, an image page on both screens — the bare stage, the
previous / where / next line ending at the fold, the quiet view — with
T1502's and T1503's numbers in the report; the orchestrator does no
browser or device checks itself. **Phase 1 has no walkthrough** and
runs on to the close-out without stopping; the merge pause is the
second and last.

> Read `CLAUDE.md` and `specs/017-the-pause-withdrawn/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's standard profile and its role table (`/effort status`
> first; medium is right for this session): triage; dispatch each
> routine task to the `sdd-implementer` on a task bundle assembled with
> shell (the task line, the plan sections, the acceptance criteria, the
> files, the pattern file, any recorded value — for T1503, spec 016's
> cue as plan.md quotes it), telling it not to read plan.md, spec.md,
> or tasks.md in full; take the verification from the implementer's
> verbatim `sh scripts/verify.sh` output, except T1502, which you re-run
> yourself before committing (`review: per-task`); do no
> browser or device checks by hand — the implementer measures and
> records, the person attests the rest; stage, then bundle the diff for
> the `skeptical-reviewer` per phase (and once for T1502 on its own),
> one review and at most one re-review, the rest logged; commit, check
> the box, and log the tier and tokens in one shell command.
> Involvement level is product owner: pause after Phase 0 — its report
> names the fog piece, the sampler's held frame and an image page to
> open on both screens, what to look for (the line above the fold, the
> bare stage, the quiet view's mat) and the one open offer (fullbleed,
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
