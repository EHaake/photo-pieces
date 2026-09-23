# Plan: The pause withdrawn, and the stage refit

**Status**: Signed off (2026-09-22), twice — the plan by the
`skeptical-reviewer` at the top tier, then the stage refit's amendment
by a second invocation at the top tier; the re-review's one remaining
line (the exact-pair assertion evaluated at 1.5 and 1/1.5, not the
grid's 0.667) transcribed from its exact text; see tasks.md's tier
log. — signed off 2026-09-22
by the `skeptical-reviewer` at the top tier (three blocking findings
fixed and four notes folded in; see tasks.md's tier log), then reopened
the same day when the product owner folded the stage's geometry into
the spec; the refit (T1503, and its documents) is what the re-sign-off
reads.
**Implements**: spec.md in this directory

## Shape of the change

A deletion with two rules landing in the space it leaves. The
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
the stage is refit: on paper its box is the frame plus a piece's
frame-to-prose spacing (`--block-margin`) above and below, no minimum
height; the frame is one rectangle turned, its long side
`min(--avail-w, --avail-h)` with the width the page's less its pads and
the height the first screen's below the header less the nav line's
token (`--frame-nav-h`, which the nav's own rule claims) and the two
spacings — so the previous / where / next line can never fall below
the fold, with script and without; the image's `sizes` hint is the same
rule spelled in literals. The quiet view's rules are byte-identical.
No schema, no registry, no dependency; `astro.config.mjs` untouched;
one small pure module (`src/lib/stage-sizes.ts`) for the hint, because
the image page, the sampler and a test all need the string.

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

  Thrown by `file.fail(message, node)`, which carries the file path
  and the directive's line. On its own, Astro's `glob()` loader would
  only _log_ that error and publish the piece with an empty body
  (withastro/astro#18054): every collection therefore sets
  `deferRender: true` (T1501a), so the transform runs in the Vite
  markdown plugin while the page is built, its error propagates, and
  `astro build` exits non-zero with the path, line, and message in the
  tail. The negative control's verbatim output in tasks.md (T1501a) is
  the pin for the exit code; the unit test pins the message, file, and
  line. Under deferred rendering the frontmatter is replaced with
  same-count whitespace, so the line is the file's line; the eager
  path, if ever restored, reports the body's line instead. `BLOCK_BODIES` in `src/lib/image-meta.mjs` loses
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
  | `.image-frame`                             | `--r`, `--q`, `--mat: min(V, H)`, `max-width`, `margin`, `padding`, `background` | `--r`, `--q` (the ratio helpers stay — the refit's width reads `--q` in both views' cascade), `--mat: 0px`, `max-width`, `margin` — the zero is declared because `.image-frame img`'s `max-height: calc(var(--avail-h) - 2 * var(--mat))` still reads it (an undeclared `--mat` would make that `calc` invalid and drop the cap) |
  | `.image-frame img`                         | the `max-height` above                                    | byte-identical: reads the whole of `--avail-h` in the normal view, `--avail-h − 2m` in the quiet view                                                                                             |
  | `html[data-quiet] .image-frame` (new rule) | —                                                         | `--mat: min(V, H)` (the unchanged string, now over the quiet stage's limits only), `padding: var(--mat)`, `background: var(--color-matte)`; placed after `html[data-quiet] .image-stage` and before the two-selector cursor rule |
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

- **The stage refit** (T1503): the box hugs the frame, one rectangle
  turned, the cue inside the height. Three facts of the file decide the
  shape. The spacing a piece keeps between a frame and its prose is
  `--block-margin` (`calc(var(--baseline) * 2)`, 48px), read by
  `.piece-block { margin-block }` at ~1161 — that is the token, not a
  new value. `html[data-quiet] .image-stage` must stay byte-identical,
  and it redeclares `--stage-pad`, `--avail-w`, `--avail-h`, both
  `min-height`s, `padding-inline`, `background` and `cursor` — so every
  base declaration the normal view changes must be one the quiet rule
  already overrides, and the normal view's frame sizing must not reach
  the quiet frame at all. And `--header-h` is published by
  `BaseLayout.astro`'s script from the header's measured height, with
  `4.5rem` as the fallback that "matches the desktop size" — it did
  not (75.8px measured); since T1503a the fallback is `4.75rem`.

  The stage, after (the quiet rule untouched, one line of it shown to
  say why the base's changes stop at it):

      .image-stage {
        --stage-pad: var(--block-margin);   /* the spacing a piece keeps between a frame and its prose */
        --avail-w: calc(100vw - 2 * var(--page-pad));
        --avail-h: calc(100svh - var(--header-h, 4.75rem) - 2 * var(--stage-pad) - var(--frame-nav-h));
        position: relative;
        display: grid;
        place-items: center;
        padding: var(--stage-pad) var(--page-pad);
      }
      html[data-quiet] .image-stage { --stage-pad: clamp(0.5rem, 1.5vh, 1rem); … min-height: 100svh; … }   /* byte-identical */

  Gone from the base rule: both `min-height` lines (the quiet rule
  carries its own pair, so the quiet box is still the viewport) and the
  `var(--content-width)` cap on `--avail-w` (the quiet rule redeclares
  the width). `--stage-pad` is set to the spacing token rather than the
  `padding` shorthand being rewritten, because the shorthand is what
  the quiet rule relies on to read its own pad through: one token
  moves, the shared line stays. `place-items: center` stays and is
  what centres the frame across the page. With no minimum height the
  stage's box is padding + frame + padding, and the nav, then
  `.image-head`, follow in flow.

  The frame — one rectangle, turned (spec 4a89ceb). The reference
  rectangle is L × S with L = `min(--avail-w, --avail-h)` and S = ⅔L;
  every frame fits inside it, turned for a portrait, as large as it
  can while touching at least one side. `--r = max(ar, 1)` and
  `--q = min(ar, 1)` already sit on `.image-frame`, and one `min()`
  covers every ratio: for a landscape (`q = 1`, `r = ar`) the width is
  `min(L, S·ar)` — L for anything at or wider than 3:2, S·ar for a
  squarer frame — and for a portrait (`q = ar`, `r = 1`) it is
  `min(L·ar, S)` — S for anything at or taller than 2:3, L·ar for a
  squarer one:

      html:not([data-quiet]) .image-frame {
        --L: min(var(--avail-w), var(--avail-h));
        --S: calc(var(--L) * 2 / 3);
        width: min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r)));
      }
      html:not([data-quiet]) .image-frame img {
        width: 100%;
      }

  So a 3:2 is L × S and a 2:3 is S × L (S·1.5 = L on both branches — the
  pair is the reference rectangle itself), a square is S × S, a 3:1 is
  L wide and L/3 tall, a 16:9 is L wide and 0.5625L tall, a 4:5 is S
  wide and 1.25S tall. Two custom properties rather than the expression
  inlined twice, so the ⅔ is written once.

  Gated on the absence of `data-quiet` rather than declared on
  `.image-frame` and reset in the quiet rule, because the quiet rules
  may not change by a byte and today's quiet frame is shrink-to-fit
  (`width: auto` on the image, the mat around it); an explicit width
  reaching it would shrink a 3:2 at 1512×982 from 1388px to 952px.
  Without script the attribute is never present, so the gate is the
  normal view exactly, script or not. The image's `width: 100%` is what
  makes the figure the sizing box: a responsive image at `width: auto`
  takes its natural width from the `sizes` hint (spec 007's trap), and
  the frame must be the rule's size whether or not the hint is exact.
  Spec 013's formulas still hold and stay byte-identical: the image's
  `max-height: calc(var(--avail-h) - 2 * var(--mat))` is
  `--avail-h` here and never binds (every frame's height is at most L
  ≤ `--avail-h`); `max-width: 100%` is the figure's width;
  the frame's base `max-width` becomes `100%` (no column cap — the
  spec's "not capped at the text column"; the quiet list rule already
  says `100%`).

  The cue is inside `--avail-h`: `--frame-nav-h` at `:root`
  (`calc(0.78rem * 1.362 + var(--baseline) * 0.5)`, 29px — one row of
  the nav's 0.78rem mono at the font's `normal` line-height, measured
  at spec 016, plus the nav's half-baseline bottom padding) and in a
  `@media (max-width: 719.98px) { :root { … * 2 + 1rem + … } }` block
  directly after `:root` (62px, the nav's own wrap), claimed by the
  nav's rule as `min-height: var(--frame-nav-h)` (no `box-sizing` line:
  the global reset at ~140 is border-box). By construction the tallest
  frame the rule allows ends `spacing` above the nav and the nav ends
  at the fold: header + 48 + L + 48 + 29 ≤ 100svh. A page with no set
  renders no nav; the stage is the same height and the head follows at
  the spacing. No `--stage-cue`: with nothing to switch, the term sits
  in the formula.

  The numbers (drafted at the 4.5rem fallback = 72px; measured 76 and the fallback moved to 4.75rem at T1503a — T1503's record has the re-derived figures; the before-reads
  record the real header at each viewport and the arithmetic is
  re-run against it): 1512×982 — `--page-pad` 32, `--avail-w` 1448,
  `--avail-h` 982 − 72 − 96 − 29 = 785 → L = 785, the height decides;
  3:2 is 785 × 523, 2:3 is 523 × 785; stage 881 tall; nav bottom at
  72 + 881 + 29 = 982. 1280×1440 — pad 32, `--avail-w` 1216,
  `--avail-h` 1440 − 72 − 96 − 29 = 1243 → L = 1216, the width decides,
  wider than the 1160 column; 3:2 is 1216 × 811, 2:3 is 811 × 1216.
  375×812 — pad 16, `--avail-w` 343, `--avail-h` 812 − 72 − 96 − 62 =
  582 → L = 343; 3:2 is 343 × 229, 2:3 is 229 × 343. On every viewport
  the two frames are the same rectangle turned; the ⅔ rule changes
  nothing for that pair. For the other shapes the person sees: the fog
  piece's panorama page (`/images/where-the-fog-lets-go/pano/`, 3:1,
  the one panorama with an image page in a set) is L wide and L/3
  tall — 785 × 262, 1216 × 405, 343 × 114 — and a square would be S × S
  — 523, 811, 229.

  The `sizes` hint. A `sizes` attribute cannot read a custom property,
  so the rule is spelled in literals by `stageSizes(ar)` in
  `src/lib/stage-sizes.ts` — the page's stage (`[...id].astro` ~238,
  today the static `(min-width: 1240px) 1160px, 94vw`) and the
  sampler's stage frames (`[...surface].astro` ~363) both call it, and
  a test evaluates it against the stylesheet:

      const availW = 'calc(100vw - 2 * clamp(1rem, 3vw, 2rem))';
      const availH = (nav) => `calc(100vh - 4.75rem - 2 * 3rem - ${nav})`;
      const NAV = 'calc(0.78rem * 1.362 + 0.75rem)', NAV_PHONE = 'calc(0.78rem * 1.362 * 2 + 1rem + 0.75rem)';
      export const PHONE = '(max-width: 719.98px)';   // the nav's own query, mirrored
      const L = (nav) => `min(${availW}, ${availH(nav)})`;
      export function stageSizes(ar) { const q = Math.min(ar, 1), r = Math.max(ar, 1);
        // the rule: min(L·q, S·r) with S = ⅔L — the coefficients written as numbers
        const w = (nav) => `min(calc(${L(nav)} * ${q}), calc(${L(nav)} * ${(2 * r) / 3}))`;
        return `${PHONE} ${w(NAV_PHONE)}, ${w(NAV)}`; }

  The literals mirror `--page-pad`, `--block-margin` (3rem),
  `--frame-nav-h`, the `--header-h` fallback and the nav's query; the
  test pins them by evaluation, not by string (the query literal by
  string). `100vh`, not `svh`: inside `sizes` the small-viewport unit
  is unconfirmed and on the three viewports the two are equal. The
  hint carries the fallback header, not the measured one, so where the
  real header is taller than 72px the hint over-delivers by the
  difference (× `ar` for a portrait) — the harmless direction, as spec
  015's hints over-deliver. `min()` and `calc()` inside `sizes` is **a
  claim to verify**: the browser's chosen `currentSrc` is read at T1503
  against the rendered
  width.

  The title's block. `.image-head` is `page-head section image-head`,
  and `.section` gives it `clamp(3.5rem, 5.5vw, 5.5rem)` of padding top
  and bottom — the site-wide rhythm every page's sections share. The
  spec (8e61900) wants photograph → nav line → title each one spacing
  apart, and the title alone at one spacing where the frame has no
  set, with the words below the title keeping their layout. Two
  declarations in the page's scoped style do it, and neither touches
  the shared `.section` rule (it is every page's; the image page is
  the one page whose head follows a frame):

      .image-head { padding-block-start: 0; }                 /* the stage's bottom pad is the spacing */
      .frame-nav  { margin-block-end: var(--block-margin); }  /* the nav puts the spacing after itself */

  The stage's bottom padding is the one spacing above whatever follows;
  the nav, where it renders, carries the spacing between itself and
  the title (a hidden nav is `display: none` and contributes no
  margin), so the no-set page needs no second rule. The head keeps its
  bottom padding and its hairline. The head's top is therefore
  48 + 29 + 48 = 125px below the frame with a nav (158 on the phone),
  48 without; the `h1`'s own top adds the eyebrow's box where the image
  has categories, which is inside the title's block and unchanged.

  Reading of AC 6, "the same rectangle turned": the frame's box. The
  photograph on paper is larger than today's by the mat it no longer
  wears and is otherwise resized by the rule — on the laptop a 3:2
  gets smaller (785 wide against today's 1080 image), a 2:3 taller;
  on the DualUp both grow. The Phase 0 report says so plainly, and
  T1503 measures against the rule's numbers, not against `main`.

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
the refit's and the removal's cases arrive — and the implementer
records the number rather than this plan predicting it.

## Testing strategy

Every claim above is owned by a task and a check:

- **A stale pause fails by name, and nothing knows the word** —
  `remark-pieces-vocabulary.test.mjs`, **T1501**, one new case in a new
  describe (the closed vocabulary had no test of its own), named for
  what it can fail on at T1501 — "the pause is gone from the
  vocabulary: ::pause and :::pause fail as an unknown block naming the
  piece": `::pause{src alt}` on the third line of a body (a paragraph,
  a blank, the directive), and `Before.\n\n:::pause{…}\nA caption.\n:::`,
  both reject with the message above (the leaf's error precedes the
  form check, so the container form gets the same one); for **both**
  rejections the thrown `VFileMessage` names the harness's file
  (`tests/fixtures/piece.md`) and line 3 — **a claim to verify at the
  task**: if the harness does not carry `.file`/`.line` through, the
  implementer stops and reports rather than pinning the message alone.
  At **T1502**, once the stylesheet and the piece page are clear, the
  same describe gains a second `it` — "nothing under src/, the
  transform or the plugin knows the word, and the held block's
  attribute is spelled once": a walk over `src/`, the transform,
  `obsidian-plugin/main.ts` and the root `*.test.mjs` files except
  itself for
  `/(::pause|piece-pause|--pause|data-pause|data-scene|pause-shape|['"]pause['"]|\bpause:\s)/i`
  — the block's spellings, not the English word, because
  `src/pages/about/index.astro` says "go-live pause" and stays — and
  the two-string pin that `global.css` contains
  `html[data-held-active] .site-header` and `[slug].astro` contains
  `toggleAttribute('data-held-active'` (the one attribute the held
  block's script writes and the stylesheet reads). The describe is the
  one test that names the word, as the spec asks; each `it` can fail
  for the reason its name gives at the task that adds it, and the suite
  is green at the end of every task. The orchestrator's plain-word grep
  at close-out is the other half. Mutation-checked: a `pause` stub
  restored in `BLOCKS` fails the first case and `image-meta.test.mjs`'s
  agreement case; a `--pause-depth` token restored in `:root` fails the
  walk naming `global.css`; the selector respelled `data-scene-active`
  fails the two-string pin. And a negative control at the build itself:
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
  frame (today's stage formulas still pinned here — T1503 refits them)
  and the quiet rules list of three; (c) the
  form W evaluator case deleted and the "identity" half of
  `fitsBothTight` now evaluates the pinned FORM_V at `--avail-w` = the
  box width (form W with the container's width named — the same
  algebra); the pause case deleted; the stage case → the quiet view's
  frame over the quiet limits; a new "the stage in its normal view is
  bare" case (m is 0 at every grid point and the image's cap is the
  whole of `--avail-h`); the off identity and the gate identity lose
  their pause and form W lines and gain the bare stage; (d) new, one
  case, "worn where the ground is dark — in global.css, one dark
  ground": every `background*` in `global.css` that reads
  `--color-quiet` sits on `html[data-quiet] .image-stage` and nowhere
  else, `--avail-w` is published by `.image-stage` and the quiet stage
  only, and the matted selector is gated by the same attribute as the
  dark ground. Scoped to `global.css` by name because the image page's
  scoped style has its own `:global(html[data-quiet]) { background:
  var(--color-quiet) }` for the page ground behind the stage — the same
  dark under the same attribute, outside this case's file.
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

- **The stage refit, pinned** — `matte.test.mjs`, **T1503**. (b) The
  stage case, rewritten: `.image-stage` declares `--stage-pad` as
  `var(--block-margin)`, `--avail-w` as
  `calc(100vw - 2 * var(--page-pad))`, `--avail-h` as
  `calc(100svh - var(--header-h, 4.5rem) - 2 * var(--stage-pad) - var(--frame-nav-h))`,
  `display: grid`, `place-items: center`, `padding: var(--stage-pad) var(--page-pad)`,
  and no `min-height` (the raw regex finds none in its body); the
  rule's prelude is exactly `.image-stage`; `html[data-quiet] .image-stage`'s
  body is byte-identical to `main`'s (the exact string, pasted from
  `main` into the test) and carries no `--frame-nav-h`; `.image-frame`
  declares `--r`, `--q`, `--mat: 0px`, `max-width: 100%`, `margin: 0`
  and nothing else; a rule with prelude exactly
  `html:not([data-quiet]) .image-frame` declares `--L` as
  `min(var(--avail-w), var(--avail-h))`, `--S` as
  `calc(var(--L) * 2 / 3)`, `width` as
  `min(calc(var(--L) * var(--q)), calc(var(--S) * var(--r)))` and
  nothing else, and `html:not([data-quiet]) .image-frame img` declares
  `width: 100%` and nothing else; `.image-frame img`'s body is
  byte-identical to `main`'s. The cue case: `--frame-nav-h` is
  `:root`'s at both widths, declared on `:root` twice and on no other
  selector; the page's scoped `.frame-nav` rule declares
  `min-height: var(--frame-nav-h)`, `margin-block-end: var(--block-margin)`
  and `font-size: 0.78rem`, the page's scoped `.image-head` rule
  declares `padding-block-start: 0`, and the page's scoped style has a
  `@media (max-width: 719.98px)` block with a `.frame-nav` rule inside
  it. (c) "one rectangle, turned": over the evaluator's grid — its
  ratios already span 0.5, 0.667, 0.8 (4:5), 1, 1.5, 1.78 (16:9) and 3
  — with `--header-h` absent (the 4.5rem fallback), the frame's width
  from the rule and its height from `--ar`, with L = `min(--avail-w,
  --avail-h)` and S = ⅔L computed by the test itself: the frame fits
  inside the box turned (width ≤ L and height ≤ S for `ar ≥ 1`; width ≤
  S and height ≤ L for `ar < 1`) and touches a side (one of the two
  bounds is tight within 1e-6); a square is S × S; the exact swapped
  pair L × S and S × L is asserted on `1.5` and `1 / 1.5` evaluated in
  the case itself, not on the grid's literal `0.667`, whose height
  0.9995L cannot pass at 1e-6 — that grid point is covered by the
  fit-and-tight bounds alone; 3 gives L × L/3; 0.8 gives S wide; the
  image's
  `max-height` never binds (≥ height at every point). "The sizes hint
  agrees with the rule": `stageSizes(ar)` from `src/lib/stage-sizes.ts`
  begins with the literal `(max-width: 719.98px) ` and, the branch
  chosen by the viewport width, evaluated with `px()` equals the CSS
  width at every grid point within 1e-6 — the module's literals against
  the stylesheet's tokens, by evaluation. The quiet view's evaluator
  case and the off/gate identities are as T1502 left them.

  Then the measurement at 1512×982, 1280×1440 and 375×812, script on,
  scroll 0, quiet cleared, on `land-b` (3:2), `port-a` (2:3) and `pano`
  (3:1): `.site-header`'s `offsetHeight` (expected 72; if it differs the
  expected numbers below are re-derived from it and recorded); each
  figure's `offsetWidth`/`offsetHeight` and its image's — expected
  785 × 523 and 523 × 785, 1216 × 811 and 811 × 1216, 343 × 229 and
  229 × 343 (±0.5), the long and short sides equal across the pair on
  each viewport, and the panorama 785 × 262, 1216 × 405, 343 × 114 (L
  wide, at the box's width); the figure's horizontal centre at `innerWidth / 2`;
  the stage's `offsetHeight` = frame height + 96 and its `offsetWidth`
  the viewport's; the visible nav's `offsetHeight` = the token (29 /
  29 / 62), its top = the frame's bottom + 48, its bottom ≤
  `innerHeight` (the value recorded — for the tallest frame at 1512×982
  it is 982 exactly); `.image-head`'s top − the frame's bottom = 48 +
  the nav's height + 48 (125 / 125 / 158), its computed
  `padding-block-start` 0, and the `h1`'s top the eyebrow's box further
  where present — each part recorded; a page with no `.frame-nav` (find
  one by grep in `dist/`) has the same stage height and its head top =
  frame bottom + 48; `img.sizes` equals `stageSizes(ar)`'s string and `img.currentSrc`
  names the smallest srcset candidate at or above the rendered width
  (the `min()`-in-`sizes` claim); the quiet view's frame padding,
  background, figure and image sizes and stage height identical to
  T1502's after-reads (byte-identical rules, identical geometry); the
  stage's height at `DOMContentLoaded` equals its height after
  `astro:page-load`. Script off (`javascript.enabled=false` in the
  profile's `user.js`): the nav's bottom at the three viewports with
  the header at its fallback — recorded; at 375 the header may wrap
  taller than 4.5rem, and the difference is the known limitation
  below. The person judges the equal rectangle on both screens at the
  pause. Mutations, reverted: the token dropped from `--avail-h` → the
  stage case fails; a `min-height` restored on `.image-stage` → the
  stage case fails; the `calc(var(--S) * var(--r))` arm dropped from
  the width (a square at L × L) → the turned-rectangle case fails on
  the square and on 4:5 and 16:9; `2 / 3` retyped `3 / 4` in `--S` → it
  fails on the square (the test computes S itself); the module's
  `3rem` retyped `2rem`, or its query literal retyped `720px` → the
  sizes case fails; `--frame-nav-h` declared
  on `.image-stage` → the twice-on-:root case fails; `min-height`
  removed from `.frame-nav` → the nav-claims case fails; the nav's
  query retyped `719px` → the breakpoint pin fails.

- **Nothing else moves** (AC 11) — **T1502** and, after its own edits,
  **T1503**, each carrying both diff lines in its Verify:
  `git diff -U0 main -- src/styles/global.css | grep '^@@'` lists every
  hunk and none falls inside `.gallery-flow`'s rules, the place wall's,
  the ground's `--color-*` lines or `--color-quiet`; `git diff main --
  'src/pages/images/[...id].astro'` shows the stage image's `sizes`
  line, the `.frame-nav` rule and the `.image-head` rule (T1503) and
  nothing under `.compare`, `.image-body` or the `.sec*` rules;
  `src/lib/og-card.mjs`, `public/og.jpg`,
  `src/lib/ground.ts`, `src/lib/gallery-layout.ts` and every page
  under `src/pages/` other than the two named are unchanged against
  `main` (`src/content.config.ts` changes at T1501a alone —
  `deferRender: true` on the four collections); `ground.test.mjs`, `page-head.test.mjs`,
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
src/styles/global.css                               --pause-* tokens, the pause section, the lights, form W deleted; the header rule renamed; the mat to html[data-quiet] .image-frame, .image-frame at zero; every comment that named the pause (T1502). --frame-nav-h at :root and the 719.98px query; .image-stage refit (no min-height, the spacing token, the two limits); the two html:not([data-quiet]) frame rules; the stage comment (T1503)
matte.test.mjs                                      rewritten as Testing strategy names it (T1502); the refit's stage, frame, cue, turned-rectangle and sizes cases (T1503); case (a)'s sampler exemption dropped (T1504)
src/lib/stage-sizes.ts                              new: stageSizes(ar), the rule in literals for the image's sizes hint (T1503)
src/pages/images/[...id].astro                      the stage image's sizes from stageSizes(ar); .frame-nav min-height: var(--frame-nav-h) and margin-block-end: var(--block-margin) with their comment; .image-head { padding-block-start: 0 } (T1503)
src/pages/dev/matte/[...surface].astro              the stage frames' sizes from stageSizes(ratio) — one line, T1503's; the mat bar (T1504)
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
wall, the cover cards, the compare's rules; `src/content.config.ts`
beyond T1501a's `deferRender` lines, `src/lib/images.ts`, `src/lib/gallery-layout.ts`, `src/lib/ground.ts`,
`src/lib/og-card.mjs`, `public/og.jpg`; `BaseLayout.astro` (which
publishes `--header-h`); the plugin beyond its one line; `CLAUDE.md`
(amended on `main` at 7747217 before this spec).

## Known limitations

- **Without script `--header-h` is its fallback** (spec 006; 4.5rem
  until T1503a, 4.75rem — the measured 76px — since), and
  `BaseLayout.astro` says the real height "varies with width and nav
  wrapping". The rule's available height is exact against whichever
  header height is in effect; where the real header is taller than
  the fallback (the phone width, where the nav wraps to 136px) the no-script
  nav line can cross the fold by the difference, and the `sizes` hint
  — which can only carry the fallback — over-delivers by it.
  Pre-existing, recorded at T1503 at each viewport; a CSS-known header
  height would be its own change. _Measured at T1503: the desktop
  header is 75.8px, not 72, so without script the tallest frame's nav
  line ends 3.8px below the fold at 1512×982 (985.8 of 982); with
  script (the normal case) it ends at 981.8. The one-number fix — the
  fallback to 4.75rem in `global.css` and `stage-sizes.ts` together —
  was first offered to the product owner, then made at T1503a on the
  Phase 0 review's finding: Goal 5 says with and without script, and
  the fallback was meant to match the desktop header (spec 006), which
  it did not. The phone's wrapped header (136px) remains the one
  no-script gap: there the width decides, so the nav stays above the
  fold anyway._
- **The nav line's 12px bottom padding sits inside its claimed height**,
  so the title is 48px below the nav's box and 60px below its text;
  the token counts the padding in (spec 016's measurement), and moving
  it would be a retune of the token and the nav together. Recorded at
  T1503, not changed.
- **`min()` inside a `sizes` attribute** is supported in current
  Firefox, Chrome and Safari; T1503 reads `currentSrc` to prove the
  browser honoured the hint rather than falling back to `100vw`. If a
  browser ignores it, the image over-fetches and renders at the rule's
  size regardless (the figure sizes the image). The hint says `100vh`
  where the stylesheet says `100svh` — equal on the three viewports;
  `svh` inside `sizes` is unconfirmed and not needed.
- **`rem` inside `sizes` resolves against the browser's default
  font-size**, not `html { font-size }`, so a reader with a larger
  default gets a hint slightly under the rendered width and a mild
  under-fetch. Not this spec's; recorded.
- **`100vw` includes a classic scrollbar's width** in `--avail-w` and
  in the hint, so on a platform with a permanent scrollbar the frame
  is up to that much wider than the visible page. Pre-existing (the
  stage's `--avail-w` has read `100vw` since spec 013), moot on macOS's
  overlay scrollbars; recorded, not fixed.
- **Equal rectangle is the spec's lean, judged at the pause.** If a
  landscape reads too small beside a portrait of the same short side,
  the named alternative is equal area — a spec amendment (the rule
  changes from `min(w, h)` on the long side to a fixed area), not a
  plan decision; the report lists it under "what needs your decision".
- **The token assumes the mono font's `normal` line-height** (1.362,
  measured at spec 016). A font change would move the nav's natural
  height and the `min-height` would only floor it; T1503's equality
  read is the check, and the two `:root` strings are the one place to
  retune.
- **The build's exit on a transform error was never true before
  T1501a** (found at T1501): Astro's `glob()` loader logs a render
  error and exits 0 (withastro/astro#18054). `deferRender: true` is
  the fix; the line Astro reports under the eager path is the body's,
  not the file's — recorded, and expected to become the file's under
  the deferred path (T1501a records what it prints). Reading time
  (`remarkPluginFrontmatter`) and body-image `srcset` are checked on
  the built page at T1501a, not assumed. `scripts/verify.sh`'s cache
  comment is half-true after it; the `rm -f` stays.
- **No test pins `data-held-active`** — none pinned `data-scene-active`
  either; the header's behaviour is read in the browser at T1502.
- **The About page's "go-live pause"** is the one plain-word hit
  outside the test; the test's pattern is spelled for the block, and
  the close-out grep lists the hit.
- **The stage's geometry is this spec's now** (folded in after
  sign-off): the rule above replaces the viewport-height box; the
  roadmap entry "The stage across screen shapes" is struck at close-out
  (T1506). What it does not decide is the head's own distance (above).
- **`README.md`'s tree and `CONTRIBUTING.md`** still drift elsewhere
  (spec 015's sweep N10); T1505 removes the two pause lines, adds
  `lib/stage-sizes.ts`, and adds
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
- **The cue is a term in `--avail-h`, not a rule of its own.** Spec
  016's `--stage-cue` was a switch (0px, or the token under the
  arrival's gate); with the stage's box hugging the frame there is no
  minimum height to shorten — the nav stays above the fold because the
  frame's height is bounded by an available height that already has
  the nav's token taken out. No `box-sizing` on the nav: the global
  reset already makes every box border-box.
- **The normal view's frame sizing is gated on `html:not([data-quiet])`**
  (two rules: the figure's width, the image's `width: 100%`) rather
  than declared on `.image-frame` and reset by the quiet rules — the
  quiet rules must stay byte-identical, and today's quiet frame is
  shrink-to-fit around the mat. `--stage-pad` is repointed at
  `--block-margin` for the same reason: the quiet rule already
  redeclares it, and the shared `padding` shorthand stays. The width
  cap at `--content-width` and both `min-height`s leave the base rule
  because the quiet rule carries its own of each.
- **`stageSizes(ar)` is a module** (`src/lib/stage-sizes.ts`): a
  `sizes` attribute cannot read custom properties, so the rule must be
  spelled in literals somewhere; the page and the sampler both render
  the stage, and the test must evaluate the string against the tokens.
  Three callers — the second-caller test met. The literals are pinned
  by evaluation so `3rem` and `calc(var(--baseline) * 2)` compare as
  numbers.
- **The head's top padding is zeroed in the image page's scoped style,
  and the nav carries the spacing after itself** — not the shared
  `.section` rule (every page's rhythm; the image page is the one whose
  head follows a frame), not a second head rule for the no-set case
  (a hidden nav contributes no margin, so one declaration on the nav
  covers both), and the head's bottom padding and hairline stay
  because the words below the title keep their layout (spec 8e61900).
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
- **The frame's "size" is the frame's box** (above), and the photograph
  on paper is larger than today's by the mat it lost and otherwise
  resized by the rule — said plainly in the Phase 0 report and recorded
  in `DECISIONS.md` at close-out.
- **`README.md`'s Matted column is dropped.** The spec asks for the
  pause row and footnote to go; a column reading "no" twelve times says
  nothing the sentence under the table does not.
- **`ROADMAP.md` and `DECISIONS.md` are edited on the branch and reach
  `main` through the PR** — spec 015's close-out practice and the
  constitution's rule for a spec's files. The spec's "drafted on the
  branch, applied to `main` after the merge" is satisfied by the merge
  itself; a separate patch file applied afterwards is the form this
  project has declined before (spec 016's sign-off).
- **A transform error fails the build via `deferRender: true` on all
  four Markdown collections** (decision review at the top tier, at
  T1501): not a `postbuild` barrier on `dist/` (the error never
  reaches `dist/`; "no block and no paragraph" cannot tell a failure
  from a short announcement), not an integration hook
  (`astro:build:done` cannot observe the loader's log), not a softened
  AC (the gutted piece is what Goal 2 exists to prevent). The fallback
  if the control still exits 0 is a wrapper around `astro build`. The
  option stays when upstream ships its fix — it is also the documented
  memory-bounding choice for a collection meant to grow for years.
- **Two stale transform comments are fixed now** (~113, ~749): spec 015
  could not touch the file; this spec does.
