# Plan: The pause withdrawn

**Status**: Draft — pending sign-off
**Implements**: spec.md in this directory

## Shape of the change

A deletion with two small rules landing in the space it leaves. The
pause leaves every layer it touched — the transform's descriptor and
its `frame` structure, the passage table's body kind, the plugin's
entry, the piece page's script, the stylesheet's scene and lights, its
shape module, its fixtures, its tests — and nothing is kept for it: a
piece that still writes `::pause` hits the transform's existing
unknown-directive failure, which already names the file, the line, the
directive and the known blocks. The held block keeps its markup, CSS,
script and tests; the one thing it shared with the pause (the header
hiding while a frame is parked, keyed on `data-scene-active`) is
restated for it alone as `data-held-active`. Then the mat rule narrows
to the quiet view — form V+H moves under `html[data-quiet]` and the
stage's normal view declares `--mat: 0px`, spec 015's "off" shape — and
the cue lands: one token, `--frame-nav-h`, that the base `.image-stage`
rule subtracts from its height and the frame nav's own rule claims as a
`min-height`, so the previous / where / next line ends exactly at the
fold on every image page, with script and without. No schema, no
registry, no dependency; `astro.config.mjs` untouched.

- **The transform** (`remark-pieces-blocks.mjs`). The `pause`
  descriptor, `PAUSE_SCALE`, `PAUSE_MARGIN_VMIN`, `roundUp`,
  `roundDown`, `pauseWidth` and `claimStageNeighbour` are deleted, with
  the `structure === 'frame'` branch. Three things existed only for the
  pause and go with it rather than staying as stubs: the
  `forms === 'leaf'` container-form check (no leaf-only block remains;
  the descriptor comment reads `forms: 'container' | 'both'` and `body`
  loses `'none'`), the `dims` fourth argument to `sizing` (its only
  reader was the pause's `min-aspect-ratio` hint), and the
  `pieceUnwrapped` mark the aside put on its prose (its only reader was
  `claimStageNeighbour`). `BLOCKS` keeps its twelve entries in order;
  the unknown-directive failure is untouched, so the error a stale
  `::pause` produces is the one every unknown name produces:

      unknown block directive "pause" — the block vocabulary is closed; known blocks: single, fullbleed, wide, tall, inset, diptych, triptych, grid, strip, aside, row, held

  thrown by `file.fail(message, node)`, which carries the file path and
  the directive's line; Astro prints them ahead of the message in the
  build error. `BLOCK_BODIES` in `src/lib/image-meta.mjs` loses
  `pause: 'none'` (the existing agreement test then holds both tables
  to twelve). Two comments in the transform stale since spec 015 — ~113
  "minus the mat" and ~749 "IS matted in the column" — are corrected
  here because this spec edits the file (015 carried the first as owed).

- **The piece page's script** (`src/pages/pieces/[slug].astro`). The
  import of `pause-shape`, `pauses`, `lastLights`, `stageSizes`,
  `measureStage`, the scenes loop and its writes go; what stays is the
  holds loop, `parkOf`, the scroll/resize listeners and `init`, and the
  one attribute write becomes `root.toggleAttribute('data-held-active',
  active)`. `src/lib/pause-shape.ts` and `pause-shape.test.mjs` are
  deleted. The header rule in `global.css` becomes
  `html[data-held-active] .site-header { transform: translateY(-100%) }`
  with its comment rewritten for the held block alone. The spec's "no
  `data-scene-*` attribute on the document" and "the held block's shared
  rules restated for it alone" are both met by the rename; the
  behaviour — the header away while a frame is parked, whichever way
  the reader scrolls — is identical and measured before and after.

- **The stylesheet** (`src/styles/global.css`), the removal. Gone: the
  three `--pause-*` tokens; the pause section (`.piece-pause` through
  `.piece-pause-frame`), the `html[data-pause-active]` lights block and
  the reduced-motion rule for the frame; form W (`.piece-pause-frame >
  :is(a.image-link, img)`, both rules — the last surface that read it
  went with the pause, so the form leaves the file; spec 013's plan.md
  keeps its string). `--hold-margin`, `--block-margin` and `--para-gap`
  stay — the held frame, every piece block and `p` read them. Comments
  that named the pause are rewritten without the word: the ground
  comment's "and the pause frame now", the two-rhythms note, the mat
  comment, `--tall-max`'s derivation (the 85 stays; it is "the screen
  inside a 5vmin margin with 5% to spare", no longer "the share the
  pause's frame takes"), the anchor comment at ~1171 and the Mattes
  section comment.

- **The mat, to the quiet view alone.** Today `.image-frame` declares
  `--r`, `--q`, form V+H, `padding: var(--mat)` and
  `background: var(--color-matte)`, in both views. After:

  | rule                                       | today                                                     | after T1502                                                                                                                                                                                       |
  | ------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `.image-frame`                             | `--r`, `--q`, `--mat: min(V, H)`, `max-width`, `margin`, `padding`, `background` | `--mat: 0px`, `max-width`, `margin` — the zero is declared because `.image-frame img`'s `max-height: calc(var(--avail-h) - 2 * var(--mat))` still reads it (an undeclared `--mat` would make that `calc` invalid and drop the cap) |
  | `.image-frame img`                         | the `max-height` above                                    | byte-identical: reads the whole of `--avail-h` in the normal view, `--avail-h − 2m` in the quiet view                                                                                             |
  | `html[data-quiet] .image-frame` (new rule) | —                                                         | `--r`, `--q`, `--mat: min(V, H)` (the unchanged strings, now over the quiet stage's limits only), `padding: var(--mat)`, `background: var(--color-matte)`; placed after `html[data-quiet] .image-stage` and before the two-selector cursor rule |
  | `html[data-quiet] .image-stage`, the cursor rules | —                                                  | byte-identical                                                                                                                                                                                    |

  A separate rule rather than the declarations added to the existing
  `html[data-quiet] .image-frame, html[data-quiet] .image-stage[data-quiet-ready] .image-frame`
  list: that list exists to out-specify the zoom-in rule for `cursor`,
  and form V+H "declared once" should pin one prelude, not a pair. The
  cascade is the mechanism here, deliberately: the same element has two
  states, and `html[data-quiet]` is the one attribute that already
  switches the stage's ground, its limits and its cursor. The presence
  walk's table is then one row: `html[data-quiet] .image-frame` is the
  only selector in `global.css` whose `padding*` reads `var(--mat` or
  whose `background*` reads `--color-matte`. The compare's letterbox
  and divider (in the page's scoped style) keep `--color-matte` as spec
  015 left them; nothing on that page reads `--mat`.

- **The cue.** `:root` gains
  `--frame-nav-h: calc(0.78rem * 1.362 + var(--baseline) * 0.5)` beside
  `--baseline` (one row of the nav's 0.78rem mono at JetBrains Mono
  Variable's `normal` line-height, 1.362 measured at spec 016, plus the
  nav's half-baseline bottom padding: 29px), and a `@media (max-width:
  719.98px) { :root { --frame-nav-h: calc(0.78rem * 1.362 * 2 + 1rem +
  var(--baseline) * 0.5) } }` block directly after `:root`, mirroring
  the nav's own 719.98px query where `where` wraps to a second row over
  its 1rem gap (62px). The base `.image-stage` rule subtracts it in all
  three places — `--avail-h` (which the quiet frame's form H and the
  image's height cap read) and both `min-height` lines — because a
  min-height-only shrink would let a height-bound frame grow the stage
  back:

      --avail-h: calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad) - var(--frame-nav-h));
      min-height: calc(100vh - var(--header-h, 4.5rem) - var(--frame-nav-h));
      min-height: calc(100svh - var(--header-h, 4.5rem) - var(--frame-nav-h));

  `html[data-quiet] .image-stage` redeclares `--avail-h` and both
  min-heights without the token, as it already does, so the quiet view
  keeps the whole viewport. The nav's rule in `[...id].astro` gains
  `min-height: var(--frame-nav-h)` (the global `* { box-sizing:
  border-box }` at ~140 already counts the padding in, so no
  `box-sizing` line): a nav shorter than the reserve would leave a gap,
  and one taller would cross the fold — the measurement checks the two
  are equal. No `--stage-cue` intermediary: spec 016's was a switch the
  arrival's gate flipped; with no gate the stage subtracts the token
  itself, and the rule's prelude stays the bare `.image-stage` — no
  attribute, no script, which is what "with and without script" means
  in CSS. A page with no set renders no nav and the stage is the same
  height: the cue is the token, not a measurement of a line. The width
  formula, `--stage-pad`, `padding` and `place-items` are untouched —
  everything else about the stage's geometry is the next spec's.

  Reading of AC 6, stated so the numbers can be checked: "size" is the
  frame's box. A width-bound landscape frame's box is `--avail-w` wide
  before and after; a height-bound frame's box is `--avail-h` tall, so
  it is shorter by exactly the token once the cue lands. The photograph
  inside is larger than today by the mat it no longer wears (Goal 4:
  "the photograph's box is the frame's box") — 80px at the 40px
  ceiling — which is why T1502 and T1503 each measure against the state
  the previous task left, and the plan does not claim the photograph
  itself is unchanged against `main`.

- **The fixtures.** `where-the-fog-lets-go/index.md` line 68 becomes
  `::fullbleed{src="./pano.jpg" alt="The full sweep of coastline after the fog cleared"}`
  — same src, same alt, same place; the pano's page keeps its passage
  (the paragraph before, no caption: a leaf) and its `_pano.md` sidecar.
  `vocabulary-sampler/index.md` loses "## Pause" and "## After the
  pause" (the second existed only to give a pause room to finish) and
  the held section's closing "The lights belong to a pause."; the
  paragraph's inline link to the sampler leaves with the section.
  `matte-sampler/index.md` loses "## Pause"; the held section ends the
  fixture. No page is added or removed: 87 stays 87.

- **The sampler** (`src/pages/dev/matte/`). The `pieces` section shows
  the fixture without a pause by construction. The stage section's mat
  bar would now move nothing on this page — its frames are bare in the
  normal view and the sampler has no quiet view — which is exactly the
  trap spec 015 removed from the other three sections. So the bar
  goes: the `Candidate` type, the mat `CANDIDATES` table, `START`, the
  wrapper's inline tokens, the `[data-candidate]` buttons and the
  floor/ceiling inputs in `[...surface].astro`, and `applySurface`,
  the `matte-sampler` sessionStorage state and the candidate/floor/ceil
  handlers in `_sampler.ts`; `.sampler-bar*` styles go with them. What
  stays is the four surfaces on the real stylesheet and the ground bar
  (spec 014's, site-wide), untouched. The labels say what each surface
  is now; the header comments say where the mat lives and that the
  quiet view is judged on the image page itself.

- **The documents** are the spec's list, each as "The documents" names
  it, plus the close-out. `README.md`'s Matted column reads "no" in
  every row once the pause's goes, so the column is dropped and the
  sentence after the table carries the rule instead.

## Failure messages and notes

The one line this spec relies on already exists and is unchanged; a
piece still writing the block fails the build with it, prefixed by the
file and line as Astro prints every `file.fail`:

```
unknown block directive "pause" — the block vocabulary is closed; known blocks: single, fullbleed, wide, tall, inset, diptych, triptych, grid, strip, aside, row, held
```

No barrier line changes; the build's output moves by nothing this spec
does (87 pages; the two barriers as spec 015 left them). The test
count falls — the pause's cases in four files and its shape suite go,
four cases arrive (the closed-vocabulary failure, the cue's token, the
bare stage's evaluator case, the one dark ground) — and the implementer
records the number rather than this plan predicting it.

## Testing strategy

Every claim above is owned by a task and a check:

- **A stale pause fails by name, and nothing knows the word** —
  `remark-pieces-vocabulary.test.mjs`, **T1501**, one new case in a new
  describe (the closed vocabulary had no test of its own): `::pause{src
  alt}` on the third line of a body (a paragraph, a blank, the
  directive), and `:::pause{…}\nA caption.\n:::`,
  both reject with the message above (the leaf's error precedes the
  form check, so the container form gets the same one); the thrown
  `VFileMessage` names the harness's file (`tests/fixtures/piece.md`)
  and the directive's line — **a claim to verify at the task**: if the
  harness does not carry `.file`/`.line` through, the implementer
  stops and reports rather than pinning the message alone. At
  **T1502**, once the stylesheet and the piece page are clear, the same
  case gains its second clause — a walk over `src/`, the transform,
  `obsidian-plugin/main.ts` and the root `*.test.mjs` files except
  itself for
  `/(::pause|piece-pause|--pause|data-pause|data-scene|pause-shape|['"]pause['"]|\bpause:\s)/i`
  — the block's spellings, not the English word, because
  `src/pages/about/index.astro` says "go-live pause" and stays. One
  case names the word, as the spec asks; the suite is green at the end
  of every task. The orchestrator's plain-word grep at close-out is the
  other half. Mutation-checked: a `pause` stub restored in `BLOCKS`
  fails this case and `image-meta.test.mjs`'s agreement case; a
  `--pause-depth` token restored in `:root` fails the walk naming
  `global.css`. And a negative control at the build itself:
  `::pause` written back into the fog piece, `npm run build`, the error
  line recorded verbatim (file, line, the message), reverted.

- **The held block is untouched** — **T1501**, **T1502**: every held
  `it(` in the two transform suites passes with its assertions unedited
  (the diff on those files shows only deleted pause cases, one describe
  renamed and one borrowed-frame case with its pause half removed); on
  the dev server the held figure's `offsetHeight`, `top` and park are
  identical before and after, and the header hides while a frame is
  parked — `html` carries `data-held-active` where it carried
  `data-scene-active`, the header's transform `translateY(-100%)` in
  both reads.

- **Off is off, from the single source, on one surface** —
  `matte.test.mjs` rewritten case by case, **T1502**; each old case is
  named in the task line with what it becomes. In brief: (a) unchanged
  here (T1504 tightens the sampler exemption once the sampler carries
  no tokens: no file under `src/` declares one); (b) "form W declared
  once on the pause's anchor" →
  "form V+H is declared once, under `html[data-quiet] .image-frame`,
  and every other `--mat` in the file is `0px`"; "the two matted
  surfaces read --mat as a padding" → "the one matted surface" (the
  walk expects two rows, both on the quiet frame; the source-order pin
  against `.piece-block a.image-link` is deleted with the anchor); the
  pause V+H string case deleted; the stage case rewritten for the bare
  frame, the cue's formulas (`--avail-h` and both raw `min-height`
  lines, spec 016's regex) and the quiet rules list of three; (c) the
  form W evaluator case deleted and the "identity" half of
  `fitsBothTight` now evaluates the pinned FORM_V at `--avail-w` = the
  box width (form W with the container's width named — the same
  algebra); the pause case deleted; the stage case → the quiet view's
  frame over the quiet limits; a new "the stage in its normal view is
  bare" case (m is 0 at every grid point and the image's cap is the
  whole of `--avail-h`); the off identity and the gate identity lose
  their pause and form W lines and gain the bare stage; (d) new, one
  case: every `background*` in `global.css` that reads `--color-quiet`
  sits on `html[data-quiet] .image-stage` and nowhere else, `--avail-w`
  is published by `.image-stage` and the quiet stage only, and the
  matted selector is gated by the same attribute as the dark ground.
  Mutations, each reverted: `padding: var(--mat)` restored on
  `.image-frame` → the one-surface walk fails naming it; `--mat: 0px`
  removed from `.image-frame` → the bare-stage case fails (`px()`
  throws on the unresolved `--mat`); form V+H's declarations moved into
  the cursor list rule → "declared once" fails on the prelude; a
  `--pause-depth` token re-added → T1501's walk fails.

- **The rendered mat** — **T1502**, on the dev server (Firefox headless
  via BiDi, the recipe in spec 015's tasks.md T1301/T1302 records and
  its environment note), at 1512×982, 1280×1440 and 375×812, on
  `/images/where-the-fog-lets-go/land-b/` (3:2) and `…/port-a/` (2:3):
  before the edit the frame's padding (40 / 40 / 12.704 normal, 40 / 40
  / 12.988 quiet — spec 015's numbers), background and image height in
  both views; after, the normal view pads 0 on four sides with
  `background-color` `rgba(0, 0, 0, 0)` and the image's height equals
  the stage's `--avail-h` in px where height-bound, and the quiet view's
  reads are identical to the before reads.

- **The cue** — `matte.test.mjs`, **T1503**, one case in spec 016's
  shape: `--frame-nav-h` is `:root`'s at both widths (the two strings
  above), declared on `:root` twice and on no other selector; the
  stage's three formulas carry `- var(--frame-nav-h)` (pinned in the
  stage case) and the quiet stage's body does not contain the token;
  the stage rule's prelude is exactly `.image-stage`; the page's scoped
  `.frame-nav` rule declares `min-height: var(--frame-nav-h)`. Then the
  measurement at the three viewports, script on: the visible nav's
  `offsetHeight` equals the token's computed px (29 / 29 / 62) and its
  `getBoundingClientRect().bottom` is at most `innerHeight` at scroll 0;
  the stage's `offsetHeight` equals `innerHeight − header − token`
  within 0.5px; the stage's `offsetWidth` and `left` equal the pre-edit
  reads; the 3:2 figure's width and image width equal the pre-edit
  reads; the 2:3 figure is shorter by exactly the token (±0.5) and
  narrower by token × ar; an image page rendering no `.frame-nav` has
  the same stage height as one with; the quiet view's stage is
  `innerHeight` tall, as before; the stage's height read at
  `DOMContentLoaded` equals its height after `astro:page-load` (no
  shift). Script off (`javascript.enabled=false` in the headless
  profile's `user.js`): the same nav-bottom read, with `--header-h` at
  its 4.5rem fallback. Where the recipe cannot run without script the
  implementer says so and the prelude pin stands as the proof. The
  person attests the line above the fold on both screens at the Phase 0
  pause. Mutations, reverted: the token dropped from `--avail-h` → the
  stage case fails; `--frame-nav-h` declared on `.image-stage` → the
  twice-on-:root case fails; `min-height` removed from `.frame-nav` →
  the nav-claims case fails.

- **Nothing else moves** (AC 7) — **T1502**, **T1503**:
  `git diff -U0 main -- src/styles/global.css | grep '^@@'` lists every
  hunk and none falls inside `.gallery-flow`'s rules, the place wall's,
  the ground's `--color-*` lines or `--color-quiet`; `git diff main --
  'src/pages/images/[...id].astro'` shows the `.frame-nav` rule and
  nothing under `.compare`; `src/lib/og-card.mjs`, `public/og.jpg`,
  `src/lib/ground.ts`, `src/lib/gallery-layout.ts`, `src/content.config.ts`
  and every page under `src/pages/` other than the two named are
  unchanged against `main`; `ground.test.mjs`, `page-head.test.mjs`,
  `og.test.mjs`, `galleries.test.mjs`, `place-page.test.mjs` green and
  unedited.

- **The sampler is honest** — **T1504**: `sh scripts/verify.sh` green
  with 87 pages and the barrier line; no `data-candidate`, `data-floor`,
  `data-ceil`, `applySurface` or `matte-sampler` key in either file;
  `grep -rl "dev-ground" dist/` empty and `dist/dev` absent; on the dev
  server the four sections render, the stage's four frames pad 0, the
  `pieces` section has no `.piece-pause`, and the ground bar behaves as
  spec 015's T1302 recorded (`paper` writes the key, `today` clears it).

- **The fixtures build as pieces** — **T1500**: green with 87 pages;
  the pano's built page still quotes "From the top of the bluff" as its
  passage; no `::pause` under `src/content/`.

- Existing suites stay green (the count recorded); build with both
  barriers; `astro check`; Prettier on the four documents.

## File structure

```
src/content/pieces/where-the-fog-lets-go/index.md   line 68: ::pause → ::fullbleed, same src and alt (T1500)
src/content/pieces/vocabulary-sampler/index.md      "## Pause" and "## After the pause" deleted; the held section's last sentence (T1500)
src/content/pieces/matte-sampler/index.md           "## Pause" deleted (T1500)
remark-pieces-blocks.mjs                            the pause descriptor, its helpers, the frame branch, claimStageNeighbour, the leaf-form check, dims, the pieceUnwrapped mark; comments (T1501)
src/lib/image-meta.mjs                              BLOCK_BODIES loses pause; the comment loses 'none' (T1501)
obsidian-plugin/main.ts                             LEAF_BLOCKS loses pause (T1501)
remark-pieces-vocabulary.test.mjs                   the pause cases deleted; the describe and one case renamed; the new closed-vocabulary case (T1501)
remark-pieces-blocks.test.mjs, image-meta.test.mjs  one table row and one case deleted; one case renamed (T1501)
src/pages/pieces/[slug].astro                       the script: holds only, data-held-active; the comment (T1502)
src/lib/pause-shape.ts, pause-shape.test.mjs        deleted (T1502)
src/styles/global.css                               --pause-* tokens, the pause section, the lights, form W deleted; the header rule renamed; the mat to html[data-quiet] .image-frame, .image-frame at zero; every comment that named the pause (T1502). --frame-nav-h at :root and the 719.98px query; the stage's three formulas (T1503)
matte.test.mjs                                      rewritten as Testing strategy names it (T1502); the cue case (T1503); case (a)'s sampler exemption dropped (T1504)
src/pages/images/[...id].astro                      .frame-nav min-height: var(--frame-nav-h) and its comment (T1503)
src/pages/dev/matte/[...surface].astro, _sampler.ts the mat bar and its state removed; labels and comments (T1504)
README.md, AUTHORING.md, design/brief.md, obsidian-plugin/README.md   per the spec's "The documents" (T1505)
specs/007-held-image/spec.md, specs/015-the-hero-mat/spec.md          one status line; one non-goal line (T1505)
ROADMAP.md, DECISIONS.md                            close-out (T1506, implementer-edited, orchestrator-committed)
```

Untouched, named so the reviewer can confirm the non-goals hold: the
three mat tokens and `--color-matte`; `--color-quiet` and the five
ground literals; `--hold-margin`, `--block-margin`, `--para-gap`,
`--tall-max`, `--strip-h`; every `.piece-held*` rule and the held
collapses; `.image-frame img`, the zoom-in rule, `html[data-quiet]
.image-stage` and the cursor list rule; `.gallery-flow*`, the place
wall, the cover cards, the compare's rules; `src/content.config.ts`,
`src/lib/images.ts`, `src/lib/gallery-layout.ts`, `src/lib/ground.ts`,
`src/lib/og-card.mjs`, `public/og.jpg`; `BaseLayout.astro` (which
publishes `--header-h`); the plugin beyond its one line; `CLAUDE.md`
(amended on `main` at 7747217 before this spec).

## Known limitations

- **Without script `--header-h` is its 4.5rem fallback** (spec 006):
  the stage is the viewport below a header of that height, and the cue
  is exact against whichever header height is in effect. If the real
  header differs from the fallback the no-script read differs by that
  much — pre-existing, recorded at T1503, not this spec's to change.
- **The token assumes the mono font's `normal` line-height** (1.362,
  measured at spec 016). A font change would move the nav's natural
  height and the `min-height` would only floor it; T1503's equality
  read is the check, and the two `:root` strings are the one place to
  retune.
- **No test pins `data-held-active`** — none pinned `data-scene-active`
  either; the header's behaviour is read in the browser at T1502.
- **The About page's "go-live pause"** is the one plain-word hit
  outside the test; the test's pattern is spelled for the block, and
  the close-out grep lists the hit.
- **The stage's geometry across screen shapes** — the frame against
  the text column on the tall screen, the words' distance from the
  image — is the next spec's; this one changes the stage's height by
  the token and nothing else.
- **`README.md`'s tree and `CONTRIBUTING.md`** still drift elsewhere
  (spec 015's sweep N10); T1505 removes the two pause lines and adds
  nothing else.

## Resolved decisions

- **The pause out and the mat moved in one task (T1502)**, the cue in
  its own (T1503). Splitting the removal from the mat would rewrite
  `matte.test.mjs`'s stage cases twice (form W's deletion already
  forces the evaluator's identity to change); the cue is separable
  because it touches three strings and one page rule, and its
  measurement is a different question.
- **Off on the stage's normal view is `--mat: 0px`**, spec 015's shape
  for a surface whose formula still reads the mat — here the image's
  height cap. The form moves under `html[data-quiet] .image-frame` as
  its own rule; the cascade between the two is the state switch the
  page already has, not a second declaration on one state.
- **The cue subtracts `--frame-nav-h` directly.** Spec 016's
  `--stage-cue` was a switch (0px, or the token under the arrival's
  gate); with the cue always on there is nothing to switch, and an
  intermediary that is always equal to the token is a second name for
  it. No `box-sizing` on the nav: the global reset already makes every
  box border-box.
- **`data-scene-active` becomes `data-held-active`.** The spec forbids
  a `data-scene-*` attribute and asks that a rule shared with the pause
  be the held block's own, restated for it alone; the attribute was
  set for holds too, so it is renamed, not removed. Behaviour identical
  and measured. If the person would rather keep the old name it is one
  word in two files.
- **The sampler's mat bar goes** rather than being relabelled or given
  a quiet toggle: a bar that moves nothing on the page is the trap spec
  015 named; a toggle would be machinery for a view the image page
  already shows; the tokens are landed and would be a spec to move.
  Deletion over configuring.
- **No stub for the leaf form, `dims` or the aside's mark.** Each had
  one reader and it was the pause; a branch no descriptor reaches is
  the reservation the spec says not to make.
- **The fixture's pause becomes a `fullbleed`** — the spec author's
  choice, the nearest scale; the Phase 0 pause offers the photographer
  `wide` or `single` instead, one line if he prefers.
- **AC 6 is read as the frame's box** (above), and recorded in
  `DECISIONS.md` at close-out rather than by editing the approved
  spec — spec 010's precedent for a wording the numbers cannot satisfy
  literally.
- **`README.md`'s Matted column is dropped.** The spec asks for the
  pause row and footnote to go; a column reading "no" twelve times says
  nothing the sentence under the table does not.
- **`ROADMAP.md` and `DECISIONS.md` are edited on the branch and reach
  `main` through the PR** — spec 015's close-out practice and the
  constitution's rule for a spec's files. The spec's "drafted on the
  branch, applied to `main` after the merge" is satisfied by the merge
  itself; a separate patch file applied afterwards is the form this
  project has declined before (spec 016's sign-off).
- **Two stale transform comments are fixed now** (~113, ~749): spec 015
  could not touch the file; this spec does.
