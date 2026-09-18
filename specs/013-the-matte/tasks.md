# Tasks: The matte, rethought

**Status**: Signed off (2026-09-13) — by the `skeptical-reviewer` at the
top tier; three blocking findings (one a product call the person took,
two fixed) cleared on the one re-review, seven notes folded in, four
carried to the sweep below.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1100, T1101, T1101b, T1102, T1103) — the
ratio on every frame, the mat rule landed inert (the stylesheet, then
the three files that read it), the ground test, and the sampler the gate
judges. **T1101 is marked `review: per-task`**: every later task lands
its values into T1101's forms, and a wrong form there is what the gate
would judge and Phase 1 would inherit. The other Phase 0 tasks
(T1101b included) are reviewed with the phase. Phase 1 and Phase 2 are per-phase (Phase 2's
review is the pre-merge sweep). The Phase 0 pause is the visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy's experiment 1 — the session on `claude-fable-5-1` at medium
effort; the planner and the plan/tasks sign-off at the top tier with an
explicit override; the `sdd-implementer` and the `skeptical-reviewer`'s
per-phase reviews and sweep at their definitions' `opus`): the
orchestrating session triages each task and dispatches routine ones to
the `sdd-implementer` on a task bundle assembled with shell (the task
line, the plan sections, the acceptance criteria, the files, the pattern
file to copy, any recorded gate value), telling it not to read plan.md,
spec.md, or tasks.md in full; the implementer's verbatim
`sh scripts/verify.sh` output is the verification, re-run by the
orchestrator for T1101; the reviewer checks each phase as a whole from a
staged, shell-assembled bundle — one review and at most one re-review,
anything still open logged and left to the sweep. A design question the
session cannot triage as routine goes to the `skeptical-reviewer` at the
top tier on a decision bundle, never resolved in the session. The sweep
runs on the documents plus `git diff main...HEAD`. The orchestrator
never does device or browser checks by hand: geometry is the
implementer's Verify criterion (numbers recorded in this file), and what
it cannot measure the person attests at the phase pause on his two
screens. One implementation session runs the whole spec: a phase pause
is a pause in it — the person attests and says continue — not a session
boundary; the person is paused for after each phase and whenever
something unexpected bears on spec adherence. If the person stops at a
pause, the report ends with the continuation prompt for a fresh session
(`/compact` if the context grows large; never mid-task).

Task ids: 013 = T11xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T11xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the ratio, the rule (inert), the ground test, and the sampler (reviewer after the phase; the gate at its end)

- [x] **T1100** — The ratio on every frame. `remark-pieces-blocks.mjs`:
      the dimension probe runs for every block (drop the `needsRatios`
      gate on the probe; keep `probeAsker` for the message), and every
      image the transform places carries `--ar` with its **raw** ratio
      (`trimNumber`) on the anchor, or on the bare `img` when `alt=""`
      — the `arStyle` path that exists today, now for every block;
      match="height" keeps its **normalized** `--ar` on the anchors and
      its figure additionally carries `--ar-sum: <Σ raw ratios>` and
      `--n: <images.length>` in `wrapperStyle`; held and pause keep the
      raw `--ar` on the wrapper as today. The shorthand pass
      (`visit(tree, 'image', …)`) collects its nodes, awaits
      `probeDimensions` for them, and wraps with `--ar` in `extraProps`.
      A frame the probe
      cannot read — a remote or root-absolute src, or a file rendered
      with no `file.path` (some transform tests) — carries no `--ar` and
      falls back to 1 in CSS; the probe's existing failure stays for a
      local file that cannot be read. Comments at ~106 and
      ~431 that say "matte" now say "the mat" (the coupling is unchanged
      in kind). `remark-pieces-blocks.test.mjs`: the plan's cases —
      every treatment's anchor/img carries the fixture's true ratio to
      four decimals; match keeps normalized plus `--ar-sum`/`--n`; the
      shorthand carries it; fullbleed, tall and strip carry it too;
      existing assertions that pinned an anchor **without** a style
      attribute are updated to the new output and each such change is
      named in the record (a deliberate behaviour change, not a
      weakening). Pattern: the held/pause `rawAr` path in the same file.
      _Verify: `sh scripts/verify.sh` green (the build's wall time
      recorded from the build log's timing line, beside `main`'s for the
      same command, for the plan's "probe on every block" limitation);
      mutation — the probe skipped for `single` → its case fails,
      restored; `grep -o 'style="--ar:' dist/pieces/vocabulary-sampler/index.html | wc -l`
      recorded and equal to the page's count of `class="image-link"`
      plus its bare-img frames (every frame has one) **plus one per
      `piece-held` and `piece-pause` figure** (their wrappers carry the
      raw `--ar` too — the expected surplus, counted with
      `grep -o 'class="piece-block piece-held[^"]*"\|class="piece-block piece-pause[^"]*"' … | wc -l`
      (amended at the Phase 0 review, N6: the bare `piece-held\|piece-pause`
      pattern also matches the prose, stage and frame wrappers); a
      match-height figure's `--ar-sum` does not match the pattern);
      `git diff main -- obsidian-plugin/` empty._

_T1100 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built in 1.44s`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 13 passed (13)`, `Tests 297 passed (297)` (277 + 20 new), `TEST EXIT 0`. Build wall time: before the edit (the branch's code identical to `main`) `87 page(s) built in 1.41s`; after, 1.44s and a second sample 1.26s — probing every block is inside run-to-run noise at this content size; the plan's header-only read stays a follow-up. Counts on `dist/pieces/vocabulary-sampler/index.html`: `style="--ar:` 61 = `class="image-link"` 58 + bare-img frames 0 + held/pause figures 3 (counted as `class="piece-block piece-held…"|…piece-pause…"` — the task's bare `piece-held\|piece-pause` pattern also matches the prose/stage/frame wrappers and gives 15); `--ar-sum` 2, matching neither; anchors with no `--ar` across `dist/pieces/` 0. Mutation: probe nulled for `single` → both single cases fail (`expected [ undefined ] to deeply equal [ '--ar: 1.6' ]`), restored. `git diff main -- obsidian-plugin/` empty. Assertions updated to the new output (deliberate, none loosened), all in `remark-pieces-vocabulary.test.mjs`: the match="height" figure now carries `--ar-sum: 2.2667; --n: 2`; the block-image wrap, strip, shorthand, borrowed-single and gallery-root-shorthand cases now expect `style="--ar: 1.6"` on the anchor. Interpretation recorded: `needsRatios` survives as "this block's own layout requires the numbers" (held, pause, strip, match="height"), where an unmeasurable frame still fails with the pinned messages (`remark-pieces-vocabulary.test.mjs` ~882–903 tests exactly that, and pause's `sizing` reads the dims); every other block and the shorthand measures null and emits no `--ar` for a remote or root-absolute src or a render with no `file.path`. The shorthand probes per node (asker "the image") so a failure keeps the image's own position. Findings: a decorative shorthand (`![](./x.jpg)`) carries no `--ar` (falls back to 1; none in content); a decorative block frame's `--ar` rides Astro's image marker props onto the built `<img>` (none in content; unit-tested only). Read beyond the bundle: `remark-pieces-vocabulary.test.mjs`, `src/lib/image-meta.mjs`, `src/lib/markdown.ts`, Astro's `Image.astro`.

- [x] **T1100a** — A decorative shorthand image carries its ratio (from
      the Phase 0 review, B1). The shorthand pass returned before probing
      when `alt === ''`, so a decorative `![](./x.jpg)` — matted by the
      list's bare-`img` entry — would wear form W at the fallback ratio
      1. Now the pass collects decorative images too and puts the raw
      `--ar` on the `img`'s own properties; block-placed image nodes carry
      `data.pieceFrame` so the visit skips them (extending the pass had
      re-measured a matched pair's decorative member and overwritten its
      normalized `--ar`, which the vocabulary suite caught). _Verify:
      `sh scripts/verify.sh` green; the new case fails when the decorative
      collection is reverted._

_T1100a record (2026-09-13, implementer at opus, resumed):_ `sh scripts/verify.sh` — `87 page(s) built in 1.56s`, both barrier lines, `BUILD EXIT 0`, `CHECK EXIT 0`, `Test Files 15 passed (15)`, `Tests 323 passed (323)`, `TEST EXIT 0`. Mutation: collection reverted → `expected undefined to be '--ar: 1.6'`, restored. Sampler counts unchanged (61 = 58 + 0 + 3). Left as designed: a local non-raster with alt text in prose is never probed (falls back to 1); an image inside an author's own link likewise (the re-review's note, carried to the sweep).

- [x] **T1101** — The mat rule, inert (the stylesheet and its test).
      `review: per-task`. `src/styles/global.css`: in `:root` add the
      plan's three tokens at the inert literals (`--mat-share: 0`,
      `--mat-min` and `--mat-max` both `clamp(0.5rem, 1.4vw, 1.05rem)`)
      with the plan's comment (the rule, the forms, that share 0 with
      floor = ceiling is today's mat), **keeping `--matte` beside them
      for now** with a one-line comment "transitional — T1101b deletes
      it" (the three files that still read it stay inert until T1101b);
      no rule in `global.css` reads `--matte` after this task. In the
      Mattes section add the **form W** rule — one `--mat` declaration on
      the existing matted selector list plus `.gallery-card .image-link`
      and `.compare`, the string exactly as plan.md's table gives it —
      and make the matted-list rule read `padding: var(--mat)`; delete
      the two `.gallery-grid > li > a.image-link` rules (~1884–1894):
      they match no markup — the only `.gallery-grid` is
      `CoverCards.astro`'s, whose anchor is `a.gallery-card` and whose
      mat sits on the `span.image-link` (checked by
      `grep -rn "gallery-grid" src/` → CoverCards and the dev sampler's
      comment only), so the cards' mat becomes one place; **form P** on
      the
      match-height members (`--pair-gap`
      declared on `.piece-diptych.match-height, .piece-triptych.match-height`
      and read by their `gap`; the members' `--mat` string from the
      plan) after form W in source; **form H** on `.piece-held figure`
      (`--q`, `--avail-h`, `--mat`, the `max-width` with `--mat`);
      **form V+H** on `.piece-pause` (`--r`, `--q`, `--avail-w`,
      `--avail-h`, `--mat`, `--frame-w`, `--frame-h`); **form R** on
      `.gallery-flow > li` (`--mat` from `--gallery-short`, the `flex` and
      `max-width` with `--mat`, the `<720px` `.related-flow` cap with
      `--mat`) and the anchor's `padding: var(--mat)`; the stage's rules
      **added** (`.image-stage` with `--avail-w`/`--avail-h`,
      `.image-frame` with `--r`/`--q`/`--mat`/`padding: var(--mat)`,
      `.image-frame img` with
      `max-height: calc(var(--avail-h) - 2 * var(--mat))`, the three
      `html[data-quiet]` stage rules redeclaring `--avail-w`/`--avail-h`
      over `--stage-pad`) — the page's scoped
      copies stay until T1101b and outrank these by their scoped
      attribute, so the stage stays inert in between; the `vh` fallback
      lines dropped only where a value passes through a custom property;
      the coupling comment at ~1271 and the Mattes comment updated (the
      mat is a share of the frame; form R's deviation stated). The
      Mattes section's per-surface comment names which rule each of the
      spec's four surfaces reads, so T1104's edits are a lookup.
      `matte.test.mjs` (new; the plan's cases (a) the three tokens
      declared once, in `:root`, and nowhere under `src/` outside
      `src/pages/dev/`; no rule selects
      `.gallery-grid > li > a.image-link`; (b) every form's strings
      pinned, whitespace-normalised; (c) the geometry evaluator over the
      plan's grid — the algebra of form W, the held fit, the pause and
      stage fits, form R's image width against
      `galleryCell(image, short).sizes`, form P's equal paddings and
      heights, and the inert identity at share 0 with floor = ceiling =
      16.8). Pattern:
      `place-page.test.mjs` for the CSS reading; the held/pause formulas
      in `global.css` for the forms. _Verify: **at the start of the
      task, before editing** (the branch as T1100 left it — T1100 changes
      no geometry; do not switch branches), the dev-server geometry run
      recorded (the plan's list of eleven frames' `padding-top`, the held
      figure's and pause frame's widths, the stage image's height at
      1512×982 and 375×812; and
      `sed -E 's#/_astro/[^"]+\.css#CSS#g' dist/galleries/every-ratio/index.html | shasum`);
      **after**: `sh scripts/verify.sh` green with the new file, re-run
      by the orchestrator; the same run identical to the before run,
      number for
      number (16.8 / 8 on every frame); the gallery page's normalised
      hash identical; `grep -rn "var(--matte)" src/styles/global.css` →
      0 and `grep -c "^  --matte:" src/styles/global.css` → 1 (the
      transitional token); mutations named and reverted — a `2 *`
      changed to `1 *` in form W (b and c fail), `max` swapped for `min`
      in form W (c fails at 1.5), form R's `+ 2 * var(--mat)` removed
      from the basis (b and the inert identity fail), a second
      `--mat-share` declared on `.gallery-flow` (a fails). Where the
      implementer cannot drive a browser it says so, line by line, and
      the Phase 0 pause asks the person to attest those lines._

_T1101 record (2026-09-13, implementer at opus; per-task review at opus, one re-review):_ `sh scripts/verify.sh` (orchestrator's re-run) — `87 page(s) built in 1.20s`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 14 passed (14)`, `Tests 317 passed (317)` (297 + 20 in `matte.test.mjs`), `TEST EXIT 0`; after the review fixes `sh scripts/verify.sh tests` 317/317 green again. Geometry (Firefox 155 headless via WebDriver BiDi on the dev server, computed `padding-top`, all four sides equal), before → after: at 1512×982 the six form-W piece frames (single ×3, inset ×2, grid cell ×4, match-height member ×5, held anchor ×2, pause anchor) 16.8 → **16.7833**; gallery cell ×12, related thumbnail ×6, cover card span ×6, compare figure, stage frame 16.8 → 16.8; at 375×812 every frame 8 → 8; held figure width 641.4 / 600.43 (375: 328), pause frame width 1346.48 (375: 311.43), stage image height 750.63 (375: 208.15) — all identical. Gallery page normalised hash identical, `2f34aa047be18d0717e873e6f8a2b863a0dd925c`. The 1/60 px: Gecko floors a percentage-bearing `calc()` to 1/60 px app units and 16.8px sits on a unit boundary (probe in the same page: `clamp(16.8px, 0%, 16.8px)` → 16.7833, the literal → 16.8); inherent to form W carrying `100%`, invisible, moot above share 0; plan.md's landing line and a Known limitation amended at the review (its B2); only Firefox driven. Greps: `var(--matte)` in global.css 0; `^  --matte:` 1. Mutations (each reverted, checksum verified): form W `2 *`→`1 *` fails (b) and (c) plus the H/pause/stage identities; `max`→`min` fails (c) (first at ratio 0.5 over the full grid; at 1.5 with the grid restricted); form R's `+ 2 * var(--mat)` removed fails (b), the inert identity (`expected 460 to be 493.6`) and (c); a second `--mat-share` on `.gallery-flow` fails (a) (`expected [ '.gallery-flow' ] to deeply equal []`). Review: B1 — the form P "heights stay matched" clause was `free/sum` by construction and could not fail; remodelled from each member's own flex base and padding with a per-member-mat sensitivity branch (mutation: per-member mats → `form P heights n=2 at ratio 0.5, share 0.04 …` true→false); B2 — the plan amendment above; N1 form R's magnitude now evaluated; N2 three test names made true (form W at 343/666/1160, the "nothing else" sweep, "declared once" literal). Carried to T1101b's bundle: `.image-frame` carries no `--ar` today (shadowed until the scoped rules go); the moved quiet `.image-frame img` rule duplicates the base rule (drop at T1101b); `.image-frame`'s `--avail-*` reads have no fallback (N3 of the review); the test hardcodes the `--gallery-short` clamp as a fallback (N6) and its nesting sweep is one level deep (N7) — both to the sweep. Deviations: the test's selector/declaration splitter is paren-aware (commas inside `min(clamp(),clamp())`), otherwise `place-page.test.mjs`'s helpers. Read beyond the bundle: `remark-pieces-blocks.mjs` 600–660, `src/lib/images.ts`, `_dock-b.md`, `gallery-layout.test.mjs`, `vitest.config.ts`, `CoverCards.astro`, `[...id].astro` (read, not edited).

- [x] **T1101b** — The three files that still read `--matte`, and its
      deletion. `src/pages/images/[...id].astro`: the stage rules T1101
      added to `global.css` deleted from the scoped style (`.image-stage`,
      `.image-frame`, `.image-frame img`, the three `html[data-quiet]`
      stage rules); `--ar` on `.image-frame`
      (`Math.round(w / h * 1000) / 1000`, `galleryCell`'s rounding); the
      compare figure's `--ar` as the same decimal; `.compare` reads
      `padding: var(--mat)` and `.compare-frames { gap: var(--mat) }`,
      `.compare-note { margin: var(--mat) 0 0 }`.
      `src/components/CoverCards.astro`: `--ar` on the span from
      `card.cover.width / height`; `padding: var(--mat)` (the form W rule
      in `global.css` computes `--mat` on this span).
      `src/components/LatestWork.astro`: `--ar` and
      `--avail-h: clamp(180px, 30vh, 260px)` on the anchor, its `--mat`
      in form R's shape over `var(--avail-h)` (a share of the known
      length; sign-off N3, plan amended at the Phase 0 review), and the `img` reads
      `height: var(--avail-h)` (one
      string, no restated coupling); `padding: var(--mat)`.
      `src/styles/global.css`: the transitional `--matte` deleted.
      `matte.test.mjs`: case (a) gains "`--matte` appears nowhere under
      `src/` or in `remark-pieces-blocks.mjs`". Pattern: T1101's forms.
      _Verify: `sh scripts/verify.sh` green; the T1101 geometry run
      repeated, identical to T1101's before run (the compare figure and
      the cover card span included: 16.8 / 8); the image page's built
      HTML differs from T1100's build only by the `--ar` style attributes
      on `.image-frame` and `.compare` (diff recorded);
      `grep -rn "var(--matte)\|--matte:" src/ remark-pieces-blocks.mjs`
      → 0._

_T1101b record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built in 1.35s`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 14 passed (14)`, `Tests 319 passed (319)` (317 + the `--matte`-gone case and a LatestWork pin), `TEST EXIT 0`. Geometry against T1101's before-run (Firefox 155 headless, BiDi, dev server): the six form-W piece frames 16.7833 at 1512 (the known 1/60 px), the compare figure and the cover card span now 16.7833 too (they moved onto form W's percentage), the stage frame 16.8 (form V+H carries lengths only), gallery cell and related thumbnail 16.8; every frame 8 at 375; held figure 641.4 / 600.43 (375: 328), pause frame 1346.48 (375: 311.43), stage image height 750.63 (375: 208.15) — identical; quiet view probed as an extra: frame padding, image 773.03×1160, frame width 1193.6, cursor `zoom-out` identical before and after. Image page (`/images/where-the-fog-lets-go/land-b/`) built HTML, stylesheet link normalised, differs from the before-build only by `style="--ar: 1.5"` on `.image-frame` and the compare figure's `--ar: 1800 / 1200` → `1.5` (the scoped sheet is linked, not inlined — `inlineStylesheets` unset, ~5 kB sheet — so N4 did not bite). Greps: `var(--matte)\|--matte:` under `src/` and the transform 0; no `--matte` in any built stylesheet. Findings from T1101 handled: `--ar` on `.image-frame` from one `ar` const; the duplicate quiet `.image-frame img` rule deleted in both files (the pin is now "two quiet stage rules and no third"); no fallback on `--avail-w`/`--avail-h` — the stage comment states `.image-frame` lives only inside `.image-stage` (the implementer's call: a fallback would be a second copy of the stage's limits); LatestWork's mat in form R's shape over `--avail-h` declared once (N3), pinned in a new case. Deviation: one more rule moved than the task names — `.image-stage[data-quiet-ready] .image-frame { cursor: zoom-in }` from the scoped style to global.css, because Astro's attribute scoping puts `[data-astro-cid-…]` on every compound, so the scoped rule (0,5,0) out-specified global.css's quiet `zoom-out` (0,4,1) once the page's quiet rules were gone — measured (`zoom-in` over the photograph in quiet view), moved, re-measured `zoom-out`, pinned three ways. Prettier reflowed `--mat-min` onto one line (comment shortened); comments naming `--matte` reworded. Unmeasured: LatestWork's band (placed on no page — the gate cannot see it); the compare box's `aspect-ratio` under `data-js` (same value by definition). Mutations: `var(--matte)` reintroduced, the duplicate quiet rule, a second height string in the band, a scoped `.image-frame` rule, the zoom-in rule after the quiet rule — each fails its named test, tree restored byte-identically. Lesson for T1104: any rule left on the image page out-specifies global.css's; the page now styles `.image-frame` not at all. Read beyond the bundle: `astro.config.mjs`, `gallery-layout.ts`, `package.json` scripts, `scripts/verify.sh`.

- [x] **T1102** — The ground's derived copies, pinned. `ground.test.mjs`
      (new, root; `page-head.test.mjs` for reading `:root`): an oklch →
      sRGB hex conversion in the test (OKLab, linear sRGB, the sRGB
      transfer, ~30 lines, the standard matrices); `:root`'s `--color-bg`
      converted equals `COLOR.bg` parsed from
      `src/pages/og/pieces/[slug].png.ts` within ±2/255 per channel;
      `public/og.jpg`'s pixel at (10, 10) via `sharp(...).raw()` matches
      within ±3. _Verify: `sh scripts/verify.sh tests` green with the new
      file; the three channel deltas recorded; mutation — `bg` set to
      `#f6f0f0` → fails, restored. If the test fails on today's values
      the copies already drift: the numbers are reported and the task
      stops for the phase review — the tolerance is not loosened._

_T1102 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh tests` — `Test Files 15 passed (15)`, `Tests 322 passed (322)` (319 + 3 in `ground.test.mjs`), `TEST EXIT 0`; `npx prettier --check ground.test.mjs` clean. Today's values: `--color-bg: oklch(0.968 0.006 95)` converts to `[246, 244, 240]` (`#f6f4f0`); the OG route's `COLOR.bg` `#f6f4f0` → deltas 0 / 0 / 0; `public/og.jpg` at (10, 10) `[245, 244, 240]` → deltas 1 / 0 / 0 (tolerance 3). No drift; nothing loosened. Mutation: `COLOR.bg` `#f6f0f0` → `AssertionError: green: route 240 vs ground 244: expected 4 to be less than or equal to 2`; `#f6f4f1` → passes; restored, `shasum -a 256 -c` OK. Deviation (additive): a third test pins the in-test conversion against published oklch → sRGB values (white, black, the three primaries), since with a near-white ground a mis-transcribed matrix row could still pass both named assertions. Read beyond the bundle: `package.json`, `vitest.config.ts`, greps of `og.test.mjs` and two scripts for the `sharp` import style.

- [x] **T1103** — The fixture piece and the sampler (dev-only).
      `src/content/pieces/matte-sampler/index.md` (new; `draft: true`;
      frontmatter as `vocabulary-sampler/index.md` with a gallery-root
      cover; `categories` the same): the plan's treatments in order —
      the shorthand, `::single`, `::inset` (a square export), `::wide`
      and one `bleed="left"`, a default `::diptych` with a landscape and
      a portrait, a `::diptych{match="height"}` with the same pair, a
      `::triptych{match="height"}`, a four-image `:::grid`, `:::aside`,
      `:::row`, `:::held` (a portrait), `::pause` (a panorama), with a
      `::fullbleed`, `::tall` and `:::strip` between them as unmatted
      controls — every `src` the spec-008 shape
      `../../gallery-images/<file>.jpg` over the ten real exports (chosen
      by their dimensions; the file names are subjects, not ratios), a
      sentence or two of prose between blocks so held and pause have
      words to hold. `src/pages/dev/matte/[...surface].astro` (new;
      `src/pages/dev/place-wall/[...candidate].astro` is the pattern with
      its three lessons — `getStaticPaths()` returns `[]` unless
      `import.meta.env.DEV`; the candidate table (the plan's five, ids
      `none`, `today`, `share-25`, `share-40`, `share-60`, each with the
      three token values) declared **inside** `getStaticPaths` and passed
      as a prop; the tokens set inline on each surface's wrapper
      `<section>`, which the frames inherit because T1101 declares them
      only in `:root`; the REAL predicate with the whole-root fallback).
      Paths `/dev/matte/` (four sections) and `/dev/matte/<surface>/`.
      `pieces`: `getEntry('pieces', 'matte-sampler')` + `render`, in the
      piece page's exact markup (`article`,
      `header.page-head.section.reading-head > .piece-column` with
      eyebrow, title, lead, date;
      `.section > .prose.piece-column > <Content />`; the page's scoped
      `.piece-column` rule copied). `galleries`:
      `ul.gallery-flow.gallery-wide` at `galleryFlowStyle` +
      `galleryCell(image.image)`, then `ul.gallery-flow.related-flow` at
      `relatedFlowStyle` +
      `galleryCell(image.image, RELATED_SHORT_PX, RELATED_NARROW_SHORT_PX)`
      — imported, not retyped. `stage`: four
      `div.image-stage > figure.image-frame[style=--ar]` (a landscape, a
      portrait, a panorama, a square) with the image page's `<Image>`
      props. `cards`: `<CoverCards>` over the set as `dev/galleries/`
      builds them. A per-section toolbar (buttons per candidate →
      `style.setProperty` of the three tokens on the section, the active
      one marked; two `rem` inputs, floor and ceiling, applied to the
      share candidates) and a page toolbar for the ground (warm = today's
      five tokens; white = `--color-bg: oklch(0.99 0.003 100)` with
      `--color-surface`, `--color-soft`, `--color-line`,
      `--color-line-strong` from
      `git show f8d87af^:src/styles/global.css`, recorded here), on
      `<html>`; both kept in `sessionStorage`; a `.sampler-label` per
      section naming the surface and the active candidate's values.
      _Verify: `sh scripts/verify.sh` green with `87 page(s) built` (the
      draft ships nothing) and
      `[check-no-dev-routes] no dev routes in dist/.`;
      `test ! -e dist/dev && echo absent`;
      `grep -c "/dev/" dist/sitemap-0.xml` → 0;
      `grep -rl matte-sampler dist/` empty (no page, no appearance on any
      export's page, no OG); the negative control — the `DEV` guard
      removed, `npm run build` fails at the barrier naming
      `dist/dev/matte/…`, output recorded, guard restored and
      re-verified. Then on the dev server at 1512×982: `/dev/matte/`
      renders four sections; the driver sets each candidate on the
      `pieces` section in turn and the fixture's 3:2 single measures
      `padding-top` ≈ 0 / 16.8 / 10.7 / 16.9 / 24.7 and its inset ≈ 0 /
      16.8 / 10.5 / 16.3 / 23.6 (the same rule on a smaller frame gives
      less — if the inset equals the single, `--ar` or the form is
      wrong); the mixed match="height" pair's two members equal paddings
      and equal image heights at every candidate; at `share-40` the held
      figure (the portrait) is height-bound: its `offsetHeight` equals
      `100svh − 2·hold-margin` (≈883.8) within 0.5px and its anchor's
      computed `padding-top` equals the figure's computed `--mat` (form W
      meeting form H in the browser — the forms' first exercise, since
      T1101's runs are at share 0); the pause frame's computed
      `--frame-h` equals its `offsetHeight`, its width ≤ the scene's
      computed `--avail-w` and height ≤ `--avail-h`, one of them tight
      within 0.5px; the gallery flow's cells one padding per flow (≈13 at
      `share-40`, the related strip ≈ 4.8); the stage's landscape frame ≈
      29.4 at `share-40` (width-bound at 1160) and its portrait the
      height form, its image height + 2·padding = the stage's inner
      height within 0.5px; the ground buttons change `<html>`'s computed
      `background-color` (both values recorded); the REAL count (10)
      recorded. Where the implementer cannot drive a browser it says so,
      line by line, and the Phase 0 pause asks the person to attest those
      lines on his two screens._

_T1103 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built in 1.42s` (the draft ships nothing), `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 15 passed (15)`, `Tests 322 passed (322)`, `TEST EXIT 0`; `test ! -e dist/dev` → absent; `grep -c "/dev/" dist/sitemap-0.xml` → 0; `grep -rl matte-sampler dist/` empty; `npx prettier --check` clean on both new files. Negative control (guard removed): `92 page(s) built`, `[check-no-dev-routes] dist/dev/ exists — a dev-only route was built: dist/dev/matte/cards/index.html, dist/dev/matte/galleries/index.html, dist/dev/matte/index.html, dist/dev/matte/pieces/index.html, dist/dev/matte/stage/index.html`, `BUILD EXIT 1`; guard restored, re-verified green (the run above). URLs: `/dev/matte/`, `/dev/matte/pieces/`, `/dev/matte/galleries/`, `/dev/matte/stage/`, `/dev/matte/cards/`. Measurements (Firefox 155 headless, BiDi, 1512×982; the driver sets the three tokens on the section as the toolbar does; `--mat` read through an out-of-flow probe span that inherits it into a `padding-top`, since form W's `100%` makes it unregistrable as `<length>`): the 3:2 single (`latourelle-gold`, column 666.4) none / today / share-25 / share-40 / share-60 = 0 / 16.783 / 10.733 / 16.85 / 24.667 (plan 0 / 16.8 / 10.7 / 16.9 / 24.7); the inset (440px, `water-and-ice` 0.963) 0 / 16.783 / 10.467 / 16.283 / 23.567 (plan 0 / 16.8 / 10.5 / 16.3 / 23.6) — below the single at every share; the mixed match="height" pair (1.5 + 0.6975) equal paddings at every candidate (0, 16.783, 7.15, 11.167, 16.2) and image heights equal within 0.15–0.17px, the same residual at `none` (pre-existing flex rounding); held at share-40 (portrait 0.667): figure height 883.467 vs `100svh − 2·hold-margin` 883.8 (0.333, height-bound, width 604.4 in a 641px column), anchor `padding-top` 22.383 vs the figure's `--mat` 22.385 (0.002) — form W meets form H; pause at share-40 (panorama 3): `--frame-h` 472.141 vs height 472.133, width 1346.483 vs `--avail-w` 1346.48 (tight, width-bound), height ≤ `--avail-h` 841.714. Galleries: one padding per flow, 10 cells each — `.gallery-wide` 0 / 16.8 / 8.101 / 12.962 / 19.443 (plan ≈13 at share-40), `.related-flow` 0 / 16.8 / 4.0 (floor) / 4.8 / 7.2. Stage at share-40: landscape 29.367 (plan ≈29.4), width 1160 = `--avail-w` (width-bound); portrait 21.456 (the height form; V would give 42.96), image 804.167 + 2·21.456 = 847.079 vs inner height 847.1 (0.021); panorama 15.065; square 30.296. Cards: 10. Ground buttons: `<html>` `background-color` `oklch(0.968 0.006 95)` → `oklch(0.99 0.003 100)` → back; the warm five read off the stylesheet at load. White candidate recorded in the sampler: `--color-bg: oklch(0.99 0.003 100)`, `--color-surface: oklch(0.965 0.004 100)`, `--color-soft: oklch(0.94 0.006 100)`, `--color-line: oklch(0.86 0.008 100)`, `--color-line-strong: oklch(0.72 0.012 120)`. REAL count 10 (`dock-a`/`dock-b` are subject-named but carry fixture EXIF). Toolbar: all sections open on `today`; a choice on one section moves only it; floor 3rem → 48px, ceiling 1rem → 16px; state survives navigating to a surface page. Deviations: the inset is `water-and-ice` (1926×2000, 0.963), not a square — no real export is square (the numbers hold: width-bound, ratio ≤ 1); the pause's panorama and the stage's panorama frame are the placeholder `pano-3x1-01.jpg` — no real export is a panorama; so the fixture places 10 real exports + 1 placeholder; a `data-start` attribute so a surface with no stored choice opens on `today`, not the table's first row. Findings for the gate: at share-60 the 40px ceiling already bites on the laptop's stage (landscape and square at exactly 40.0), which the plan expected only on the DualUp at 4%; the 4px floor bites on the related strip at share-25 and nowhere else above the collapse; the 1/60 px floor is form-specific (16.7833 on form W, 16.8 on form R side by side). Not driven: Blink, WebKit, below-collapse widths, the DualUp — the pause's. Read beyond the bundle: `content.config.ts`, `CoverCards.astro`, `images.ts` (grep), `BaseLayout.astro` (grep), the transform (grep), `_dock-b.md`, an exifr/sharp pass over the gallery root, `scripts/verify.sh`.

_Phase 0 review (2026-09-13, `skeptical-reviewer` at opus, one review and one re-review):_ 2 blocking — B1 the decorative shorthand's missing `--ar` (fixed as T1100a); B2 plan.md named form H for LatestWork's mat where the code (rightly, per sign-off N3) uses form R's shape (plan and T1101b's line amended). Signed off on the re-review; one adjacent gap named for the sweep (an image inside an author's own link is matted at the fallback ratio 1). Notes for the gate (N1–N4): the pause frame and the stage's wide frame are the grey placeholder panorama (no real export is that wide) and the inset is a near-square photograph; at share-60 the stage's ceiling (40px) is what shows on the laptop and at share-25 the related strip's floor (4px) — the two inputs move those limits; the sampler's sticky toolbar can overlap a held frame's top edge while scrolling; Blink, WebKit, the phone width, the DualUp and the quiet view were not driven. Carried to the sweep: N5 the image page's remaining scoped `.image-stage` rule now outranks global.css's for any shared property (nothing visible changed; look at its declarations once); N7 `needsRatios` keeps its narrower meaning (recorded at T1100).

### Gate record (Phase 0 pause)

_(The product owner's decisions from `/dev/matte/` on both screens: for
each of the four surfaces, mat on or off; the one share; the floor and
ceiling; and — only if no surface keeps a mat — the white. Recorded here
by the orchestrator, in the person's words and the candidate ids, before
T1104 is dispatched.)_

**Gate record (2026-09-17, product owner, from the sampler on both
screens):**

- **Every surface keeps its mat** — pieces, the packed rows (galleries,
  place wall, related strip), the stage, the cover cards: all **on**.
  "Let's stick with mats all over with warm background."
- **The share: `share-60`** — `--mat-share: 0.06`. "I also like the
  larger mat, so share-60 would be my choice. It looks a bit more
  refined and doesn't change the overall size of the frame. It does
  make the image itself within the mat slightly smaller, but not by a
  large amount so I think it's worth it for the perceptual win. I might
  even go with mattes even slightly bigger."
- **Floor and ceiling: the plan's `0.25rem` (4px) and `2.5rem` (40px)**
  — the sampler's defaults, which is what was judged; no other values
  named. Noted to the person: at 6% the stage's largest frames on the
  laptop already sit on the 40px ceiling (T1103's record), so a larger
  mat would need the ceiling raised too.
- **The ground: unchanged** (mats stay everywhere, so the rule leaves
  the warm ground). T1105 is the no-edit branch.
- **Reasoning the person gave, for the record:** the mats may not stand
  out enough against the ground — the warming at spec 003 may not have
  gone far enough — and a **follow-up spec should rethink the ground
  colour** with a number of tones, lighter and darker, some slightly
  coloured, now that mats stay. Goes to `ROADMAP.md` at T1107.
- **Branch for the tasks below:** T1103a closes with no edit (pieces
  keep their mat); T1104 sets the tokens and turns nothing off; T1105
  is the no-edit branch; the compare figure and LatestWork follow the
  stage's and the packed rows' "on".
- Session-tier allowance at this pause: not reported.

## Phase 1 — The gate's values, the ground, and the docs (reviewer after the phase; the person's pause at its end)

<!-- T1104 is the load-bearing visible change under per-phase review;
the phase review must treat its recorded numbers and grep results as
the substance of the review, not a formality (011's sign-off note 4).
Each of T1103a, T1104 and T1105 is written for every gate outcome; the
bundle carries the gate record, and the implementer follows the branch
it names. -->

- [x] **T1103a** — The constitution first, if a piece's frames lose
      their mat. **Only if the gate turned the pieces surface off** (on
      its own or as part of "nowhere"): `CLAUDE.md`'s block-vocabulary
      bullet — "captions via the container form and site-applied
      mattes" — is a statement about piece-body treatments and goes
      false on that branch, and the constitution requires its amendment
      "first, explicitly, in its own commit". Amend the clause to what
      the gate decided (the treatments unmatted, the site presenting the
      photograph on the ground; where other surfaces keep a mat, say the
      mat is theirs), in **its own commit**, before T1104 is dispatched.
      If the pieces surface stays on, this task is closed with the note
      "pieces keep their mat (gate: …)" and no edit. Pattern: spec 012's
      T1004a (the Places clause amendment). _Verify:
      `npx prettier --check CLAUDE.md` no worse than at `main` (one
      pre-existing line warns, spec 012's T1004a record);
      `git log -1 --stat` shows the commit touching `CLAUDE.md` alone;
      `grep -n "site-applied mattes" CLAUDE.md` → 0 on the off branch._

_T1103a record (2026-09-17, orchestrator):_ pieces keep their mat (gate: every surface on, `share-60`); no edit, no commit of its own. `CLAUDE.md`'s "site-applied mattes" clause stays true.

- [ ] **T1104** — The gate's values and each surface's presence.
      Pattern: T1101's forms in `src/styles/global.css` and the Mattes
      section's per-surface comment (the lookup for every edit below).
      `src/styles/global.css` `:root`: `--mat-share`, `--mat-min`,
      `--mat-max` → the gate's share, floor and ceiling (comment: the
      gate date and the candidate chosen); if the gate kept everything
      as today, the T1101 literals stay with the comment dated. Then per
      surface, from plan.md's presence table, exactly one of: **on** —
      nothing; **off** — the listed edits (pieces: the matted-list
      rule's `padding`/`background` and the half-bleed and
      `width-fullbleed` exception rules deleted, `.piece-held figure` and
      `.piece-pause` set `--mat: 0px` in place of their forms, form P
      deleted, the piece entries dropped from form W's list; packed rows:
      `.gallery-flow > li { --mat: 0px }`, the anchor's `padding`/`background`
      deleted, `LatestWork.astro` likewise; stage:
      `.image-frame { --mat: 0px }` and its `padding`/`background`
      deleted, the compare's
      `padding`/`background` deleted and its gap and note margin set to
      `calc(var(--baseline) / 2)`, `.compare` dropped from form W's
      list; cards: `CoverCards.astro`'s two declarations deleted and its
      selector dropped from form W's list). If **no** surface keeps a
      mat: also delete the three tokens and the form W rule, keep
      `--color-matte` only if the compare's divider still reads it (its
      comment reworded: a white for the divider, not a mat), and the
      Mattes comment says the site presents photographs unmatted since
      this gate. `matte.test.mjs`: the token case pins the gate's
      literals (or asserts the tokens' absence on the nowhere branch);
      the per-form cases follow the branch — a surface turned off has
      its `--mat: 0px` pinned and its `padding`/`background` asserted
      absent; the evaluator's inert identity case stays and a **gate
      identity** case is added: at the gate's tokens, form W on the 666px
      3:2 single equals the value recorded at the gate. `README.md`'s
      block table is T1106's. _Verify: `sh scripts/verify.sh` green; the
      dev-server run at 1512×982, 1280×1440 and 375×812 on
      `/pieces/vocabulary-sampler/`, `/galleries/every-ratio/`,
      `/places/the-headlands/`, `/places/`, and one image page with a
      compare (the plan's "Geometry after the gate" list: each surface's
      padding per the decision, three different values on three frame
      sizes where on, the held and pause and stage fits tight, the quiet
      view's mat `rgb(255, 255, 255)` where the stage is on, one short
      side and one padding per gallery row, `scrollWidth ≤ clientWidth`,
      the floor holding at 375 on the related strip);
      `git diff main -- src/content.config.ts src/lib/images.ts src/lib/image-meta.mjs src/lib/image-set.ts src/lib/gallery-layout.ts obsidian-plugin/`
      empty; every number recorded here; unmeasured lines named for the
      person's attestation at the pause._

- [ ] **T1105** — The ground follows the mats. **If the gate kept a mat
      anywhere**: no edit; the record says so,
      `git diff main -- src/pages/og/pieces/[slug].png.ts public/og.jpg`
      is empty, and `ground.test.mjs` green is the pin. **If no surface keeps a mat**:
      `src/styles/global.css` `:root` — `--color-bg` to the gate's white
      (the pre-003 `oklch(0.99 0.003 100)` unless the gate moved it),
      `--color-surface`, `--color-soft`, `--color-line`,
      `--color-line-strong` in step (the values the sampler showed,
      recorded at T1103), the `:root` comment above `--color-bg` rewritten
      to say the ground went back toward white at this gate because the
      mats it was warmed for are gone (history kept in one line);
      `src/pages/og/pieces/[slug].png.ts` `COLOR.bg` and `COLOR.line`
      recomputed (the test's converter, run in a scratch script, gives
      the hex); `public/og.jpg` regenerated with the same ground (the
      route's satori markup with the site's title and description in a
      scratch script, saved as JPEG at the same dimensions); a `ground`
      case in `matte.test.mjs` pinning the five literals. Pattern: spec
      003's T209G record. _Verify: `sh scripts/verify.sh` green (the
      pause's lights rules untouched: `git diff main -- src/styles/global.css`
      shows no change inside the `html[data-pause-active]` block, and
      `--color-quiet`/`--pause-depth` unchanged); `ground.test.mjs` green
      against the new hex and file with the deltas recorded; on the dev
      server `<html>`'s computed `background-color` equals the gate's
      white converted; one built OG PNG's corner pixel (`sharp`) equals
      the hex._

- [ ] **T1106** — Docs: `README.md` and `AUTHORING.md`, and the CSS
      comments the gate settled. `README.md`: the block table's Matted
      column per the pieces decision (every matted treatment flips
      together; fullbleed, tall and strip stay "no"), the footnotes
      kept or struck to match; the sentence after the table ("Every
      image carries its own flat matte…") says the mat is a share of the
      frame's short side within a floor and ceiling — or, on the nowhere
      branch, that the site presents photographs unmatted on a
      near-white ground; the image-page paragraph (~142, "shows the image
      matted") per the stage decision; the `pages/dev/` tree comment
      gains the matte sampler. `AUTHORING.md` (~598): "never bake a matte
      into the file" stands, reworded per the outcome — the site's mat
      is proportional and a baked one would double it and lie to the
      layout math; or, nowhere, that a baked mat would be the only mat
      and would still lie to the layout math. Hand-edit the prose (never
      script-rewrap). _Verify: every claim read against the built pages
      and the gate record; `npx prettier --check README.md AUTHORING.md`
      clean; `sh scripts/verify.sh` green._

## Phase 2 — Close-out (the documents, the reviewer sweep, then merge)

- [ ] **T1107** — Close-out. The repo-wide documents are edited by the
      `sdd-implementer` on a bundle (T1106 is the pattern; the bundle
      carries the gate record, plan.md's "Resolved decisions" and its
      gate amendment, and the two ROADMAP entries) and committed by the
      orchestrator; the sweep, the merge, and the bookkeeping are the
      orchestrator's own part, as CLAUDE.md assigns them. `ROADMAP.md`:
      strike "The matte, rethought" (shipped as spec 013 — the decision
      per surface, the share and clamp, the ground's outcome, form R's
      target-side deviation and the probe-on-every-block cost as
      follow-ups if they ever matter); annotate "Aspect-ratio treatment
      for packed galleries" with what it now knows — whether gallery
      frames are matted and at what rule, so its "uniform matted frames"
      option can be costed. `DECISIONS.md`: a spec 013 section in 012's
      shape — the rule and why three tokens (one rule, four geometries;
      why the packed rows follow the target side; why matched pairs wear
      one mat; the inert landing as a token setting); the gate's outcome
      per surface and the share; the ground; annotate "Mattes:
      site-applied, never baked into files" with the 013 outcome (it
      stands either way) and, on the nowhere branch, "Ground tone: warmed
      so the mattes read" as superseded, not deleted. **If no surface
      keeps a mat**: `design/brief.md`'s flat-matte carve-out is
      annotated as unused since spec 013 (the ban's scope unchanged).
      `CLAUDE.md` is not this task's: its amendment, where the pieces
      surface went off, was T1103a's own commit before T1104 — the sweep
      confirms the clause matches the gate on every branch (the sweep at
      spec 012 found the constitution missed, so it is named here). Both
      ride this branch and merge with the PR, in their own commit(s)
      (`npx prettier --check` clean; hand-edited prose). Then, the
      orchestrator's part:
      the pre-merge whole-spec sweep at the reviewer's default tier and
      its findings resolved; the acceptance criteria checked against
      their records (the sampler's absence from `dist/` by T1103's and
      the final build's barrier line; the geometry by T1104's numbers
      and the Phase 1 attestation); build, tests, check, GPS scan,
      dev-routes scan, and format green with actual output; the PR
      marked ready and merged with a merge commit; the close-out box
      ticked in the same shell command as the merge bookkeeping.
      _Verify: the implementer's `sh scripts/verify.sh` green with the
      documents edited; `grep -rn "site-applied mattes\|shows the image matted\|own flat matte" CLAUDE.md README.md AUTHORING.md DECISIONS.md ROADMAP.md`
      → only lines consistent with the gate's outcome; main green after
      the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the second spec under experiment 1)

> **Experiment 1** — the session on `claude-fable-5-1` at medium effort;
> the planner and the plan/tasks sign-off at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> implementer and per-phase reviews at `opus`. Baselines — spec 012 (the
> first spec under this policy): planner 133,795; sign-off 88,526 +
> re-review 35,920 = 124,446; implementer 287,531 over 6 dispatches;
> reviewer 230,463 over 4 invocations; no tier miss, no fallback. Spec 011
> (all opus, budget fallback): planner 148,300; sign-off 48,861;
> implementer 178,802 over 5; reviewer 246,857 over 5.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation                                  | Tier                           | Tokens  | Outcome / miss reason                                                                                                                                |
| -------------------------------------------------- | ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                    | top (`claude-fable-5-1`, high) | 236,089 | drafted first pass; no product question returned                                                                                                     |
| Sign-off: plan/tasks (`skeptical-reviewer`)        | top (`claude-fable-5-1`, high) | 86,096  | 3 blocking (B1 packed-row/matched mat rules vs AC 2 — product call; B2 CLAUDE.md amendment trigger; B3 cards-off edit — wrong on the facts), 7 notes |
| Planning: sign-off fixes (`sdd-planner`, resumed)  | top (`claude-fable-5-1`, high) | 36,776  | B2, B3 (corrected), N2–N7 applied; T1101 split into T1101/T1101b                                                                                     |
| Sign-off re-review (`skeptical-reviewer`)          | top (`claude-fable-5-1`, high) | 59,061  | signed off; B3 correction accepted; 4 notes carried below                                                                                            |
| Planning: Prettier repair (`sdd-planner`, resumed) | top (`claude-fable-5-1`, high) | 48,134  | formatting only — code spans broken across lines had read as blockquotes                                                                             |
| T1100 (`sdd-implementer`)                          | implementation (`opus`)        | 111,037 | done; 297 tests; one interpretation recorded (blocks whose layout needs the numbers keep their pinned failure)                                        |
| T1101 (`sdd-implementer`)                          | implementation (`opus`)        | 155,495 | done; 317 tests; the 1/60 px Firefox floor found and pinned                                                                                          |
| T1101 per-task review (`skeptical-reviewer`)       | implementation (`opus`)        | 85,836  | 2 blocking (B1 form P heights clause unfalsifiable; B2 plan's "number for number" false after the 1/60 px), 7 notes                                  |
| T1101 fixes (`sdd-implementer`, resumed)           | implementation (`opus`)        | 16,843  | B1, N1, N2 applied to the test only; plan.md amended by the orchestrator for B2                                                                      |
| T1101 re-review (`skeptical-reviewer`, resumed)    | implementation (`opus`)        | 53,860  | signed off; B1 and B2 cleared, nothing new                                                                                                           |
| T1101b (`sdd-implementer`)                         | implementation (`opus`)        | 121,909 | done; 319 tests; --matte gone; the zoom-in cursor rule moved with the stage (scoped specificity)                                                    |
| T1102 (`sdd-implementer`)                          | implementation (`opus`)        | 36,148  | done; 322 tests; the copies match today (max delta 1/255)                                                                                            |
| T1103 (`sdd-implementer`)                          | implementation (`opus`)        | 139,728 | done; sampler dev-only, negative control proven; every plan number met; no real square or panorama export                                          |
| Phase 0 review (`skeptical-reviewer`, resumed)     | implementation (`opus`)        | 111,839 | 2 blocking (B1 decorative shorthand `--ar`; B2 plan named form H for LatestWork), 8 notes                                                            |
| T1100a (`sdd-implementer`, resumed)                | implementation (`opus`)        | 16,515  | B1 fixed; 323 tests                                                                                                                                  |
| Phase 0 re-review (`skeptical-reviewer`, resumed)  | implementation (`opus`)        | 9,116   | signed off; one adjacent gap to the sweep                                                                                                            |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- _(Phase 0 re-review)_ An image inside an author's own link in prose
  (`[![x](./a.jpg)](…)`) is matted by the list's `a:not(.image-link) > img`
  entry but never probed, so it wears the fallback ratio 1; likewise a
  local non-raster with alt text. Probably absent from content; the sweep
  decides between the same treatment and a Known-limitation line.
- _(Phase 0 review, N5)_ The image page's remaining scoped `.image-stage`
  rule now outranks global.css's `.image-stage` for any shared property;
  nothing visible changed (T1101b's quiet probe); read its declarations
  once at the sweep.
- _(T1101 review, N6/N7)_ `matte.test.mjs` hardcodes the `--gallery-short`
  clamp as a fallback and its nesting sweep is one level deep (the
  src-wide case covers the rest).

- _(sign-off re-review, N2 — for T1101's and T1103's bundles)_ Reading a
  computed custom property (`--mat`, `--frame-h`, `--avail-w`) with
  `getComputedStyle().getPropertyValue()` returns the substituted token
  stream, not a resolved length, unless the property is registered with
  a `<length>` syntax. The measurement driver should `CSS.registerProperty`
  those names before reading, or compare the anchor's `padding-top` and
  the frame's `offsetHeight` against the evaluator's expected number.
  The claim is right; the method as written would not return px.
- _(sign-off re-review, N3 — for T1101b's bundle)_ `LatestWork`'s form H
  takes the share of `(H − 2m)·q` but its image is `H` tall (the `img`
  reads `--avail-h` and the anchor adds the mat around it), so its true
  short side is `H·q` and the mat undershoots by `2msq` — sub-pixel at
  4%. Inert at share 0, no AC names it; either say so in the plan or
  write it as a share of the known length (`calc(var(--avail-h) * s * q)`,
  form R's shape).
- _(sign-off re-review, N4 — for T1101b's bundle)_ "The image page's HTML
  differs only by the `--ar` attributes" assumes the scoped stylesheet is
  linked, not inlined (`inlineStylesheets: 'auto'` inlines small
  sheets). If inlined, deleting the scoped stage rules changes the HTML
  beyond the attributes; record the diff and say why rather than fail
  the line.
- _(sign-off re-review, N1 — done)_ The Prettier-mangled paragraphs were
  repaired by the planner before the drafts were marked signed off (the
  tier-log row above); the sweep should confirm no line outside the two
  legitimate blockquotes begins with `>`.
- _(sign-off, N1)_ The compare figure following the stage's decision and
  `LatestWork` the packed rows' were named to the person at sign-off and
  accepted (spec.md's Decided list); the gate report names them again.

## Handoff note

**Nothing is implemented yet.** The next session begins at **T1100**
(Phase 0) as the orchestrator under the model policy's experiment 1: it
opens on `claude-fable-5-1` at medium effort from `.claude/settings.json`
(`/effort status` to confirm); it dispatches the `sdd-implementer` one
task at a time at `opus` and the `skeptical-reviewer` per phase at
`opus`, re-running `sh scripts/verify.sh` itself for **T1101**
(`review: per-task`); a design question it cannot triage as routine goes
to the `skeptical-reviewer` at the top tier on a decision bundle from
Plan Mode. The **Phase 0 pause is the visual gate**: the sampler's URLs
(`/dev/matte/` and `/dev/matte/<surface>/`), the candidate table, and
the four questions — mat on or off per surface (a piece's frames as one
group; the galleries, the place wall and the related strip together;
the image page's stage; the index cover cards), the one share, the floor
and ceiling, and the white only if no surface keeps a mat — go to the
person on both screens; the values are not in the plan. The orchestrator
does no browser or device checks itself. T1103a, T1104 and T1105 are
written for every outcome; the gate record names the branch — and if
the pieces surface goes off, the constitution's amendment (T1103a) is
the first commit after the gate record, on its own.

> Read `CLAUDE.md` and `specs/013-the-matte/{spec,plan,tasks}.md`, then
> begin at the first unchecked task as the orchestrator under the model
> policy's experiment 1 (`/effort status` first; medium is right for this
> session): triage; dispatch each routine task to the `sdd-implementer`
> on a task bundle assembled with shell (the task line, the plan
> sections, the acceptance criteria, the files, the pattern file, any
> recorded gate value), telling it not to read plan.md, spec.md, or
> tasks.md in full; take the verification from the implementer's
> verbatim `sh scripts/verify.sh` output, except T1101, which you re-run
> yourself before committing (`review: per-task`); do no browser or
> device checks by hand — the implementer measures and records, the
> person attests the rest; stage, then bundle the diff for the
> `skeptical-reviewer` per phase (and once for T1101 on its own), one
> review and at most one re-review, the rest logged; commit, check the
> box, and log the tier and tokens in one shell command. Involvement
> level is product owner: pause after each phase — the Phase 0 pause is
> the gate, and its report carries the sampler's URLs, the candidate
> table and the four questions in plain language — and whenever
> something unexpected bears on spec adherence; the same session
> continues after each pause when the person says so, and if the person
> stops at a pause, end the report with the continuation prompt for a
> fresh session.

Every pause produces a report in this shape, in this order, in plain
language (no task ids, agent names, or tier names):

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
