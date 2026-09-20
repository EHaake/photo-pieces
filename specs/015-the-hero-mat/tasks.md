# Tasks: The hero mat

**Status**: Signed off (2026-09-19) — by the `skeptical-reviewer` at the
top tier; one blocking finding fixed and cleared on the one re-review,
eight notes folded in, and one item the re-review carried (O1 in the
tier log) transcribed from its exact text into T1303 and plan.md.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1300, T1301, T1302) — the constitution's
clause amended first in its own commit, the mat taken off every surface
but the stage and the pause with its test rewritten pin by pin, and the
sampler's bars made honest, so the gate judges the ground on the site
as it will ship. **T1301 is marked `review: per-task`**: it is the
whole visible change of the spec — every later measurement, the gate
and the docs inherit its stylesheet, and a residual padding or a broken
fit there is what the person would judge the ground on. T1300 and
T1302 are reviewed with the phase. Phase 1 and Phase 2 are per-phase
(Phase 2's review is the pre-merge sweep). The Phase 0 pause is the
visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`, or `sh scripts/verify.sh tests` for a
pure-rule change) reported, not summarized; the existing suite stays
green through every task. Cadence (product owner, under the model
policy's standard profile and its role table — the session on
`claude-fable-5-1` at medium effort; the planner and the plan/tasks sign-off at the top tier with an
explicit override; the `sdd-implementer` and the `skeptical-reviewer`'s
per-phase reviews and sweep at their definitions' `opus`, with close-out
the one implementer dispatch at the top tier — `sdd-implementer-fable`,
per the role table): the
orchestrating session triages each task and dispatches routine ones to
the `sdd-implementer` on a task bundle assembled with shell (the task
line, the plan sections, the acceptance criteria, the files, the pattern
file to copy, any recorded gate value), telling it not to read plan.md,
spec.md, or tasks.md in full; the implementer's verbatim
`sh scripts/verify.sh` output is the verification, re-run by the
orchestrator for T1301; the reviewer checks each phase as a whole from a
staged, shell-assembled bundle — one review and at most one re-review,
anything still open logged and left to the sweep. A design question the
session cannot triage as routine goes to the `skeptical-reviewer` at the
top tier on a decision bundle, never resolved in the session. The sweep
runs on the documents plus `git diff main...HEAD`. The orchestrator
never does device or browser checks by hand: geometry and the computed
colours are the implementer's Verify criterion (numbers recorded in
this file), and what it cannot measure the person attests at the phase
pause on his two screens. One implementation session runs the whole
spec: a phase pause is a pause in it — the person attests and says
continue — not a session boundary; the person is paused for after each
phase and whenever something unexpected bears on spec adherence. If the
person stops at a pause, the report ends with the continuation prompt
for a fresh session (`/compact` if the context grows large; never
mid-task).

Task ids: 015 = T13xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T13xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the constitution, the mat off, and the sampler (reviewer after the phase; the gate at its end)

- [x] **T1300** — The constitution first. `CLAUDE.md`'s block-vocabulary
      bullet says "with captions via the container form and site-applied
      mattes" — a statement about piece-body treatments that goes false
      when T1301 lands, and the constitution requires its amendment
      "first, explicitly, in its own commit". Amend that clause to: the
      captions via the container form; the site mats only the image
      page's stage and its quiet view (spec 015) — a piece's frames sit
      unmatted on the ground, the pause frame excepted until its own
      spec. One clause, no other edit. Pattern: spec 012's T1004a and
      spec 013's T1103a (the same clause, written for this branch).
      _Verify: `npx prettier --check CLAUDE.md` no worse than at `main`
      (one pre-existing line warns — spec 012's record);
      `git log -1 --stat` after the orchestrator's commit shows
      `CLAUDE.md` plus `tasks.md`'s bookkeeping (the checkbox and the
      tier row ride the same commit) and nothing else;
      `grep -n "site-applied mattes" CLAUDE.md` → 0;
      `sh scripts/verify.sh tests` green (nothing under test changes —
      the run is the record that the suite was green before T1301)._

- [x] **T1301** — The mat off every surface but the stage and the pause,
      and the test that pins it. `review: per-task`. Pattern: spec 013's
      presence table (specs/013-the-matte/plan.md, "The four surfaces,
      and what off is") and T1101's forms in `src/styles/global.css`;
      plan.md's surface table is the edit list. `src/styles/global.css`:
      the `:root` comment above the three tokens rewritten (the mat is
      the hero's since spec 015 — the stage and its quiet view, and the
      pause frame until its spec; the tokens unchanged at spec 013's
      values; the forms that remain), the four token lines untouched;
      the **form W rule** and the **padding/background rule** each keep
      exactly one selector, `.piece-pause-frame > :is(a.image-link, img)`
      — the piece entries, the two `:is(.prose, .piece-row-prose) > p > …`
      shorthand entries (the shorthand is `single`'s captionless form and
      follows it), `.gallery-card .image-link` and `.compare` all dropped
      — their declarations unchanged, and **both rules stay after
      `.piece-block a.image-link` (~1188) in source**: at (0,2,1) they now
      tie it and the mat's white beats its `background: none` by order
      alone (the Mattes comment says so); the **form P rule**, the two
      **half-bleed** rules and the **`width-fullbleed`** rule deleted;
      `.piece-held figure`: `--q` deleted, `--mat: 0px` in place of form
      H, `--avail-h` and the `max-width` formula unchanged, the comment
      rewritten (the zero is the rule's value; the formula keeps its term
      so a mat is one edit); `.gallery-flow > li`: `--mat: 0px` in place
      of form R, `flex`, `max-width` and the `<720px` `.related-flow` cap
      unchanged; `.gallery-flow > li > a.image-link`: `padding` and
      `background` deleted, `display: block` kept; the match-height
      block's two comments (the gap read once now; the members' base
      size is no longer floored by a mat), the sizing-coupling comment
      at ~1294–1304 (the hints assume no mat now: the single's 680px and
      the compare's 700px over-deliver by design, the gallery's is exact
      with no constant term) and the Mattes section comment rewritten
      for the new state (which surfaces are matted, the forms that
      remain, off as `--mat: 0px` where a formula still reads it, the
      pause deferred, the source-order tie above, and one line that the
      transform still emits `--ar-sum` and `--n` on match="height"
      blocks with no reader since form P went; spec 013's history in a
      few lines). The transform's own stale line (~113, "minus the mat")
      is **not** edited — the transform is a non-goal and the diff check
      below forbids it; the record names it as carried. **Nothing
      inside `.piece-pause` through `.piece-pause-frame`, the
      `html[data-pause-active]` block, or `.image-stage` through the
      last `html[data-quiet]` stage rule changes by a byte.**
      `src/components/CoverCards.astro`: `.gallery-card .image-link`
      loses `padding` and `background` (keeps `display: block`; the
      span's `--ar` stays), the comment reworded.
      `src/components/LatestWork.astro`: `.image-link` loses `--mat`,
      `padding`, `background` (keeps `--avail-h`, `display`, `height`),
      the header and style comments reworded (unmatted since spec 015;
      `--avail-h` is the band's one height string).
      `src/pages/images/[...id].astro`: `.compare` loses `padding` and
      `background`; the `.compare-frames` and `.compare-note` T1104a
      comments reworded (prose spacing; the figure is unmatted since
      spec 015); the frontmatter comment on `ar` reworded (the stage's
      form V+H and the compare box's `aspect-ratio` read it); the
      `data-js` letterbox fill and the divider keep `--color-matte` with
      a comment saying they are the compare's own device, not a mat.
      `matte.test.mjs`: the header comment and the cases as plan.md's
      Testing strategy names them — **each old case named here with what
      it becomes**: (b) "form W is declared once, on the matted list plus
      the cover card and the compare figure" → "form W is declared once,
      on the pause's anchor alone (spec 015)"; "the surfaces read --mat
      and nothing else: the matted list, the packed row's anchor, the
      stage" → "the two matted surfaces read --mat as a padding — the
      pause's anchor and the stage's frame — and no other rule applies
      --mat or --color-matte" (the walk over every block, plus the pin
      that the padding/background rule's index is greater than
      `.piece-block a.image-link`'s — sign-off N1); "form H: the
      held figure's mat and box formula" → "the held figure at zero: --mat
      0px, no --q, the box formula unchanged"; the pause and stage V+H
      cases unchanged; "the image page reads --mat only as a padding: the
      compare figure's" → "the image page reads --mat nowhere; the compare
      is unmatted and --color-matte is its letterbox and divider only";
      "the latest-work band: one height string, and a mat that is a
      share of it" → "…and no mat"; a new "the cover card's span reads no
      mat"; "form R: the mat is the packed row's constant term…" → "form R
      at zero: the constant term is 0px and the formulas keep it"; "form
      P: one mat for the matched block…" → "form P is gone: no rule gives
      the matched members a --mat or a padding; --pair-gap stays"; "form
      P comes after form W in source" deleted. (c) "form W: m is the
      share…" unchanged (evaluates the pause anchor's string); "form H:
      the held frame fits its height exactly, and form W inside it
      agrees" → "the held frame at zero mat fits its height exactly" (m
      0 on every grid point, box `H × ar`); "form R: the mat never enters
      the photograph's width" → "form R at zero: the photograph's width is
      the row's math, at any growth" (m 0 everywhere); "form R: the cap
      agrees with the srcset" kept, now at zero; the form P evaluator
      case deleted (a heights-equal clause with no mat is true by algebra
      — 013's B1); "the inert identity" → "the off identity: at share 0
      with floor = ceiling the pause anchor, the pause and the stage give
      the fixed mat, the held figure and the packed cell give 0, form R's
      basis has no constant"; "the gate identity" → "at :root's tokens the
      stage's 3:2 frame at 1512×982 wears 40px (the ceiling) and the
      reading-width single has no --mat reader". Every rewritten case
      keeps a name that says what would fail. _Verify: **at the start of
      the task, before any edit**, on the dev server at 1512×982 and
      375×812 (Firefox headless via BiDi — the recipe in
      specs/013-the-matte/tasks.md's T1104 record and
      specs/014-ground-tone/tasks.md's T1202 record; clear the quiet
      state before measuring): on `/pieces/vocabulary-sampler/` the
      pause anchor's computed `padding-top` and `background-color`, the
      pause frame's `offsetWidth`/`offsetHeight` and its probed
      `--frame-w`/`--frame-h`; on `/images/where-the-fog-lets-go/land-b/`
      the stage frame's padding, its image's height, and the quiet
      view's frame background — recorded. **After**: `sh scripts/verify.sh`
      green with the rewritten file, re-run by the orchestrator; the
      before reads identical after (the pause within 1/60 px; the stage
      exact); `git diff -U0 main -- src/styles/global.css | grep '^@@'`
      lists no hunk whose range falls inside `.piece-pause` through
      `.piece-pause-frame`, the `html[data-pause-active]` block, the
      stage's rules, or the fullbleed, tall and strip rules (~1289,
      ~1344–1355, ~1377–1400) — the six ranges' line numbers recorded;
      `git diff main -- 'src/pages/pieces/[slug].astro' src/lib/pause-shape.ts remark-pieces-blocks.mjs src/lib/gallery-layout.ts src/content.config.ts obsidian-plugin/`
      empty; `grep -c "color-matte" src/components/LatestWork.astro src/components/CoverCards.astro`
      → 0 and 0; `grep -n "var(--mat)" src/styles/global.css` → only the
      held `max-width`, the pause's three formulas, the pause anchor's
      padding, form R's three formulas, the stage's padding and the
      stage image's `max-height` (every line listed). Then the plan's
      rendered-result run at 1512×982, 1280×1440 and 375×812: on
      `/pieces/vocabulary-sampler/` every frame but the pause's (single
      ×3, inset, wide, a grid cell, default and weighted diptych members,
      match="height" members, aside, row, the held anchor) computes
      `padding` 0 on all four sides and `background-color`
      `rgba(0, 0, 0, 0)`, and the fullbleed, tall and strip frames read
      the same 0 they read in the before run (AC 1's "unchanged"); the
      match="height" pair's and triptych's image
      heights equal within 0.2px; the held portrait figure's height
      equals `100svh − 2·hold-margin` within 0.5px where height-bound and
      its image is the figure's width; on `/galleries/every-ratio/` and
      `/places/the-headlands/` every row's cells share one short side
      within 0.5px and every anchor pads 0; the related strip on the
      image page likewise; `/places/` and `/` cards pad 0; the compare
      figure pads 0 with a transparent background and its `data-js` box's
      `aspect-ratio` equals `--ar`; the stage frame's padding is T1104's
      40 / 40 / 12.988 and the quiet view's frame background `#ffffff`
      (canvas round-trip); `scrollWidth ≤ clientWidth` on the galleries,
      place, places and image pages (the vocabulary sampler's known
      headless-scrollbar overshoot excluded, as at T1104); at 1512 the
      rendered image width of the 3:2 single, a `/` cover card, the
      compare's after-frame and a gallery cell at full growth beside its
      `sizes` hint's px (680, 373, 700, its `galleryCell` value),
      recorded as "hint − rendered": positive is over-delivery and fine
      (the single's and the compare's are, by design — ~15px and ~35px
      over the prose column); negative beyond −2px is under-delivery and
      is reported at the pause, not fixed. Mutations named and reverted,
      tree restored
      byte-identically: `padding: var(--mat)` reintroduced on
      `.gallery-flow > li > a.image-link` → the two-readers case fails
      naming it; form R's clamp restored on `.gallery-flow > li` → the
      form-R-at-zero string case and the off identity fail; `--mat: 0px`
      removed from `.piece-held figure` → the held cases fail;
      `.compare { padding: var(--mat) }` restored → the image-page case
      fails;
      `.piece-single` re-added to form W's list → "on the pause's anchor
      alone" fails; a `2 *` → `1 *` in the stage's form → the stage V+H
      string case fails. `LatestWork` unmeasured (placed on no page; the
      test is its pin) — said so in the record. Where the implementer
      cannot drive a browser it says so, line by line, and the Phase 0
      pause asks the person to attest those lines._

- [x] **T1301a** — Record corrections from T1301's per-task review
      (all notes, none blocking; logged here so they do not evaporate).
      `src/styles/global.css`: the sizing-coupling comment (~1271) loses
      its "None falls under" clause — the cover card renders 374.667px
      against a 373px hint (−1.667px, inside the 2px threshold); the
      `.prose > p > a.image-link` comment (~1163) and the anchor comment
      (~1152) stop giving the mat as their reason (the rules stay, for
      the anchor's width); the gallery-grid paragraph (~1942) is
      rewritten to say why the two `.gallery-grid > li > a.image-link`
      rules are absent without describing a card mat that no longer
      exists; the Mattes comment gains one clause saying the two
      identical-prelude rules (form W and padding/background) are
      separate on purpose — merging them fails two tests.
      `matte.test.mjs`: the off-identity case takes the task line's
      name ("at share 0 with floor = ceiling …"); the gate-identity
      comment stops claiming that moving any token moves the number
      (it pins the ceiling; token drift is caught by case (a)).
      `plan.md` Known limitations: add the −1.667px cover-card
      under-delivery; add the match-height residual (0.234px after,
      0.217px before at 1512/1280 — Gecko flex rounding above the
      0.2px figure carried from 013, not a regression) with the
      corrected tolerance; list the three global.css comments above as
      carried-stale until this task lands; note that `/` has no cover
      cards (they are on `/places/`, `/galleries/`, `/categories/<c>/`),
      that the stage's 375px padding is 12.704 (12.988 is the quiet
      view's), and that the latest-work band row is moot since PR #15
      deleted the component. No rule changes. _Verify:
      `sh scripts/verify.sh` green; `git diff --stat` touches only
      those three files; `grep -n "None falls under" src/styles/global.css` → 0._

- [x] **T1302** — The sampler's bars, honest. `src/pages/dev/matte/[...surface].astro`
      (spec 013's file, extended at 014 — its own template is the
      pattern): the wrapper `<section>`'s inline tokens and the
      `.sampler-bar` (candidate buttons, floor and ceiling inputs) render
      for the `stage` section only; the `pieces`, `galleries` and `cards`
      sections render no bar and no inline tokens, and their
      `.sampler-label` reads "<surface> — unmatted since spec 015 (the
      mat is the stage's; the pause frame is deferred to its own spec)";
      `SURFACE_NOTE` updated (the stage: form V+H; the others: unmatted,
      the pause frame form W); the header comment and the `START` comment
      say the gate's recorded values live in `specs/015-the-hero-mat/`
      and that spec 014's gate was not answered. `src/pages/dev/matte/_sampler.ts`:
      comments only (the mat bar is the stage's; the recorded values'
      path) — `applySurface` already returns from a section with no
      buttons, and nothing else changes. The ground bar is untouched.
      _Verify: `sh scripts/verify.sh` green with `87 page(s) built` and
      the barrier line; `grep -rl "matte-sampler\|dev-ground" dist/`
      empty; `test ! -e dist/dev && echo absent`;
      `grep -c "getComputedStyle" "src/pages/dev/matte/[...surface].astro" src/pages/dev/matte/_sampler.ts`
      → 0 and 0; `npx prettier --check` clean on both files. On the dev
      server at 1512×982: `/dev/matte/` renders four sections;
      `[data-candidate]` buttons number 5 on the stage section and 0 on
      each of the other three, whose labels carry "unmatted since spec
      015"; the fixture piece's 3:2 single pads 0 and its pause anchor
      pads form W's value for its ratio at its frame width (recorded);
      the gallery section's cells and the cards' spans pad 0; on the
      stage section `none` → the landscape frame pads 0 and `share-60` →
      40 (the ceiling); the ground bar: clicking `paper` sets `<html>`'s
      background to `oklchToRgb255(paper)` within 1/255, writes the key
      with five tokens (no deepened muted) and the readout's seven rows
      are recorded; `today` removes the key and every inline token;
      `/pieces/where-the-fog-lets-go/` opened afterwards with `paper`
      selected wears it. Where the implementer cannot drive a browser it
      says so, line by line._

### Gate record (Phase 0 pause)

_(The product owner's decision from the site under `npm run dev` with no
mats on it — a piece, a gallery, a place, an image page and its quiet
view, the indexes, About — and `/dev/matte/`, on both screens, with the
stage's mat bar left on `share-60`: the tone — a candidate id (`paper`,
`light`, `today`, or another on the bar), or the tune's numbers
`oklch(L C h)` — the family it derives (the bar's tokens line, copied),
the readout's seven ratios at that tone, and whether the muted text
deepens: its L and the pair that forced it, or "muted unchanged". If
today's tone is kept, "kept" and why, in the person's words. One line
that the unmatted surfaces were seen on both screens as the spec
describes them, and anything he saw that the spec did not say. Recorded
here by the orchestrator, in the person's words and the numbers, before
T1303 is dispatched.)_


**Measured record before the gate** (the implementer's Firefox 155
headless reads via BiDi, dev server, taken at T1301 and T1302; the
person attests by eye, these are the numbers):

- Pause anchor, before → after, identical: padding 25.883 / 21.083 /
  5.983 px at 1512×982 / 1280×1440 / 375×812; background oklch(1 0 0);
  frame 1346×483 / 1097×394 / 311×112. Both pieces carrying a pause.
- Stage frame padding 40 / 40 / 12.704 before and after (12.988 is the
  quiet view's at 375); stage image height 719.717 / 719.717 / 201.883;
  quiet frame white before and after.
- 279 other frames across the two pieces, `/galleries/every-ratio/`,
  `/places/the-headlands/`, `/places/`, `/`, and an image page: every
  one pads 0 on four sides with a transparent background after (single
  24.667→0, inset 23.567→0, wide 40→0, grid 12.183/17.633→0, diptych
  →0, match-height 16.4/11.05→0, aside 16.05→0, row 18.2/12.583→0,
  held anchors 23.75/32.733→0, prose shorthand 24.667→0; fullbleed,
  tall, strip 0 before and after).
- Held portrait at 1512: figure 883.85 vs 100svh − 2·margin 883.80.
  Packed rows: worst short-side spread 0.050 / 0 / 0; related strip
  rows 122.483×4 and 161.75/162. Cards on `/places/`, `/galleries/`,
  `/categories/landscape/`: pad 0, transparent (`/` has no cards).
  Compare figure pad 0, transparent, aspect-ratio 1.5 = --ar.
- Hint − rendered at 1512: single +13.6, compare +33.6, cover card
  −1.667 (inside 2px), gallery cells ≥ +183.5. Match-height residual
  0.234 after / 0.217 before (Gecko rounding; tolerance now 0.25).
- Sampler: sections pieces/galleries/stage/cards, bars 0/0/1/0,
  candidates 0/0/5/0, inline tokens on the stage alone; fixture pause
  anchor 25.883 from :root; stage bar share-60 → 40 / 31.389 / 22.308
  / 40 (landscape/portrait/panorama/square), none → 0. Ground bar:
  paper → html [252,252,250] = oklchToRgb255(paper), five tokens
  written, muted unchanged, readout text/bg 15.58, text/surface 14.55,
  text/soft 13.51, muted/bg 5.82, muted/surface 5.44, muted/soft 5.05,
  mat/bg 1.02 ΔL 0.01; today → no override, [246,244,240]; paper
  follows to a piece page.

**Environment note for whoever drives a browser next**: Firefox 155
BiDi needs `-remote-allow-system-access`, the driver must
`browsingContext.create {type:'tab'}` (the first context is
privileged), and one BiDi session per Firefox process.

## Phase 1 — The tone landed, the copies moved, and the docs (reviewer after the phase; the person's pause at its end)

<!-- T1303 is the load-bearing visible change under per-phase review;
the phase review must treat its recorded reads and grep results as the
substance of the review. T1303 is written for every gate outcome; the
bundle carries the gate record, and the implementer follows the branch
it names. -->

- [ ] **T1303** — The gate's tone, or the record that it stayed.
      Pattern: spec 014's T1204 line (specs/014-ground-tone/tasks.md —
      never run; this is it) and `:root` in `src/styles/global.css` with
      its comment above `--color-bg`. **Changed**: `src/styles/global.css`
      `:root` — `--color-bg` to the gate's tone and `--color-surface`,
      `--color-soft`, `--color-line`, `--color-line-strong` to
      `tokensFor(tone)`'s strings, pasted from the failing test's expected
      values or `npm run og`'s print (never retyped from the sampler by
      eye), token order unchanged; the comment rewritten (this gate's
      date, the tone as numbers, the candidate or "tuned from <id>", the
      pair that bound, spec 003's warming and spec 014's unanswered gate
      as one line of history each); **only if the record says the muted
      text deepened**: `--color-muted` to the recorded value with its own
      comment naming the pair and the undeepened value, **and `MUTED` in
      `src/lib/ground.ts` to the same value** (test case (b) demands
      both). `src/lib/ground.ts`: `CANDIDATES.today.bg` → the landed tone;
      a new entry `warm-003` carrying the former control's tone with the
      note "spec 003's warm — the control at spec 014's and 015's gates";
      the taken candidate's entry (`paper`, say) **dropped** — its tone
      is now `today` and two buttons with one tone would mislead the next
      gate (a tuned tone has no entry to drop); `CONTROL` untouched.
      `src/lib/og-card.mjs`: `COLOR.bg` and `.line` (and `.muted` on the
      deepens branch) from `npm run og`'s print; then `npm run og` writes
      `public/og.jpg`. **Only on the deepens branch** (a tuned tone
      darker than today — `paper`, `light` and `today` never deepen):
      `ground.test.mjs`'s readout case asserts `deepened.L` is 0.49 on
      `oklch(0.95 0.007 95)` stepping from the default `MUTED`, and with
      `MUTED` landed deeper `deepenMuted` returns `null` there and the
      case throws — so `readout(bg, from = MUTED)` in `src/lib/ground.ts`
      gains the optional starting muted, passed to `deepenMuted`, used
      for `shipped`, and as the readout's muted ink (`inks.muted`) — the
      row is graded at the starting muted, or the case would still fail
      on `soft.passes` (transcribed from the sign-off's re-review, O1
      below) — and that case passes the literal
      `oklch(0.5 0.012 250)` (the fixed-point move 014's O1 made for
      `deepenMuted`; the sampler keeps the default); on every other
      branch neither file is touched for this. **Kept**: no edit to any
      of those files; the record says so. _Verify: `sh scripts/verify.sh`
      green; changed — `ground.test.mjs` green against the new literals
      with every delta recorded;
      `grep -rn "0.968 0.006 95\|0.945 0.007 95\|0.92 0.008 95\|0.86 0.008 95\|0.72 0.012 95" src/`
      → exactly the `:root` history comment line(s) and nothing else
      (every hit listed — a fill left at the old tone is a hit;
      `src/lib/ground.ts` cannot hit: it spells tones as object
      literals, and `warm-003`'s and `CONTROL`'s tones are pinned by
      `ground.test.mjs` (b) and (c) instead — sign-off B1);
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` shows no
      hunk inside the `html[data-pause-active]` block, `.piece-pause`
      through `.piece-pause-frame`, or the stage's rules beyond T1301's,
      and no change on `--color-quiet`, `--pause-depth`, `--color-text`,
      `--color-accent`, `--color-matte`, `--mat-share`, `--mat-min`,
      `--mat-max`; on the dev server with no `dev-ground` key at 1512×982
      and 375×812: `<html>`'s background on `/pieces/where-the-fog-lets-go/`,
      a cover card on `/`, a `code` on `/pieces/vocabulary-sampler/`, the
      footer's `border-top-color`, and the quiet view's background on
      one image page — each the landed token's conversion (or
      `--color-quiet`'s) within 1/255, recorded; a built OG PNG's
      (10, 10) pixel equals `COLOR.bg` within 2; `sharp` reads
      `public/og.jpg` as 1200×630, and the file's path is named in the
      record so the Phase 1 pause report can show it to the person (its
      card is the generator's; the old one was hand-made and may differ
      beyond the tone). Kept —
      `git diff main -- src/styles/global.css` touches no `--color-*`
      line, `git diff main -- src/lib/og-card.mjs public/og.jpg` empty
      and `git diff main -- src/lib/ground.ts` empty; `ground.test.mjs`
      green is the pin. Both —
      `git diff main -- src/content.config.ts remark-pieces-blocks.mjs obsidian-plugin/ src/lib/gallery-layout.ts 'src/pages/pieces/[slug].astro'`
      empty; `matte.test.mjs` unedited since T1301; `page-head.test.mjs`,
      `og.test.mjs` unedited; `ground.test.mjs` unedited except the one
      readout case on the deepens branch. The pause's dimming follows the ground by
      construction (the lights block's diff is empty) and is not driven
      headless: named for the person's attestation at the pause, with
      any other unmeasured line, on both screens._

- [ ] **T1304** — Docs: `README.md`, `AUTHORING.md`, `design/brief.md`.
      Pattern: spec 013's T1106 and spec 014's T1205 lines. `README.md`:
      the block table's Matted column — `single`, `inset`, `wide`,
      `diptych`, `triptych`, `grid`, `aside`, `row`, `held` → "no";
      `pause` stays "yes" with a footnote (keeps spec 007's mat until its
      own spec); the ¹ and ² footnotes struck (no bled edge or fullbleed
      pair to except); the sentence after the table ("Every matted
      treatment carries its own flat white matte…") rewritten: since
      spec 015 the site mats only the image page's stage and its quiet
      view — 6% of the frame's rendered short side, 4–40px, equal on four
      sides, white — and a piece's frames sit on the ground, edge to
      edge with the page; the "Current status" line's "mattes" reworded;
      the image-page paragraph (~148) says the stage is the one matted
      surface; the OG sentence (~339) gains how `public/og.jpg` is
      regenerated (`npm run og`, after `:root` moves and `COLOR` is
      resynced — `ground.test.mjs` pins both); the project-structure tree
      gains `scripts/gen-og.mjs`, `lib/ground.ts` and `lib/og-card.mjs`
      where it lists `scripts/` and `src/lib/`, and the `pages/dev/`
      comment says the matte sampler carries the ground switch.
      `AUTHORING.md` (~598): "never bake a matte into the file" stands,
      reworded — the site mats only the image page's stage (and, until
      its spec, the pause frame); a baked mat would be the only mat in a
      piece, would double the stage's, and would lie to the layout math
      that counts the mat; the sentence on the two prose frames with no
      measured ratio reworded (they are unmatted now, so the ratio no
      longer sizes anything on them). `design/brief.md`: "The matte
      carve-out" (~116) narrowed — the site mats the image page's stage
      and its quiet view only, since spec 015; a piece's frames and the
      galleries' present the photograph on the ground; the reasoning in
      one sentence (the mat is a hero treatment); the "Palette" section
      gains one paragraph, appended — the ground re-judged at spec 015's
      gate on both screens on the unmatted pages, the tone taken (or
      kept) as numbers, the fills at fixed steps from it
      (`src/lib/ground.ts`), the text floor of 4.5:1 pinned by a test, the
      muted text's value if it deepened; the "two manually synced hex
      copies" sentence (~70) now says the OG copies are pinned by
      `ground.test.mjs` and regenerated by `npm run og`. Hand-edit the
      prose (never script-rewrap). _Verify: every claim read against the
      built stylesheet, `og-card.mjs` and the gate record;
      `grep -n "Every matted treatment\|the bled edge runs clean" README.md`
      → 0; `npx prettier --check README.md AUTHORING.md design/brief.md`
      clean; `sh scripts/verify.sh` green._

## Phase 2 — Close-out (the documents, the reviewer sweep, then merge)

- [ ] **T1305** — Close-out. The repo-wide documents are edited by
      `sdd-implementer-fable` — the close-out row of `CLAUDE.md`'s role
      table, the one dispatch that runs at the top tier, because this
      task is synthesis and prose rather than bounded transcription —
      on a bundle (T1304 is the pattern; the bundle
      carries the gate record, plan.md's "Resolved decisions", spec.md's
      "Decided" list, the ROADMAP entries named here and DECISIONS' "Spec
      013" section) and committed by the orchestrator; the sweep, the
      merge, and the bookkeeping are the orchestrator's own part, as
      CLAUDE.md assigns them. `ROADMAP.md`: strike "The ground tone,
      rethought" as superseded by spec 015 (its Phase 0 machinery — the
      family rule, the switch, the readout, the generator — shipped and
      served this gate; its own gate was never answered); annotate the
      struck "The matte, rethought" entry with one clause (its every-
      surface answer reversed at spec 015: the mat is the stage's);
      annotate "Aspect-ratio treatment for packed galleries" — gallery
      frames are no longer matted since spec 015, so its option (2)
      "uniform matted frames" would mean putting a mat back on the
      galleries and option (4)'s sliver has no mat to sit in; the entry
      needs a rethink (the product owner's note at approval), decided
      later; add two entries in the file's shape — "The pause, rethought"
      (mid-piece and as a hero presentation of one frame; until then the
      pause keeps spec 007's mat, ground and lights; spec 007's own
      follow-ups fold in) and "The stage's darker field" (the image
      page's stage in a field much darker than the page, near the quiet
      dark, giving way to the light ground as the reader scrolls into
      the words; the two leans recorded — the field is the stage's own
      background and scrolls away with it, no script; it ends at the
      stage's edge, the header and the frame nav on the page ground;
      until then the white mat reads faintly on the landed ground
      outside the quiet view; likely the pause's spec). `DECISIONS.md`:
      annotate "Mattes: site-applied, never baked into files" (stands —
      the site still applies the one mat it has; where it applies it
      changed at spec 015), "Ground tone: warmed so the mattes read"
      (superseded by spec 015's tone, or re-judged and kept — per the
      record; the reason the warming existed is gone from every page
      but the image page's), and the "Spec 013" section's gate paragraph
      (its every-surface answer reversed at spec 015, one paragraph, not
      rewritten); add "Spec 015: the hero mat" in 013's shape — the
      decision in the photographer's words ("in the galleries and
      pieces, I think it looks better to remove them"; the mat as a hero
      treatment), off as `--mat: 0px` in place of the form where a
      formula still reads it and why, the pause deferred wholesale and
      the held frame unmatted with the piece, the stage's darker field
      deferred with its leans, the ground's outcome on both screens in
      his words and numbers with the muted's fate, spec 014's machinery
      built and its gate closed unanswered, the aspect-ratio rethink.
      Both ride this branch and merge with the PR, in their own
      commit(s) (`npx prettier --check` clean; hand-edited prose — grep
      for lines beginning with a CSS `>` or `+` before any format run).
      Then, the orchestrator's part: the pre-merge whole-spec sweep at
      the reviewer's default tier and its findings resolved; the
      acceptance criteria checked against their records (AC 1 and 3 by
      T1301's numbers and the Phase 0 attestation; AC 2 by T1301's
      before/after reads and the empty diffs; AC 4 by T1303's grep and
      reads; AC 5 by the diff on `--color-quiet` and the lights block;
      AC 6 by T1303's deltas and the Phase 1 pause; AC 7 by T1302's
      barrier line and the gate record; AC 8 by the final run and the
      greps below); build, tests, check, GPS scan, dev-routes scan, and
      format green with actual output; the PR marked ready and merged
      with a merge commit; the close-out box ticked in the same shell
      command as the merge bookkeeping. _Verify: the implementer's
      `sh scripts/verify.sh` green with the documents edited;
      `grep -rn "site-applied mattes\|every surface keeps\|mats all over\|Every matted treatment\|own flat matte" CLAUDE.md README.md AUTHORING.md DECISIONS.md ROADMAP.md design/brief.md`
      → only lines that are history or annotated as reversed (every hit
      listed);
      `grep -rn "0.968 0.006 95\|0.945 0.007 95\|0.92 0.008 95\|0.86 0.008 95\|0.72 0.012 95\|#f6f4f0\|#d2d1cb" README.md DECISIONS.md ROADMAP.md design/brief.md src/`
      → only lines consistent with the gate's outcome — on the change
      branch the `:root` history comment and the documents' history
      lines; on the kept branch the token lines, `og-card.mjs`'s two
      hexes and the same history lines; `src/lib/ground.ts` never hits
      (object literals — sign-off B1); every hit listed;
      `grep -n "Superseded" specs/014-ground-tone/plan.md specs/014-ground-tone/tasks.md`
      → both status lines (spec 014 is closed in its own documents
      already; the sweep confirms); main green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the first spec under the settled standard profile)

> **The standard profile**, as `CLAUDE.md`'s role table now fixes it:
> the session on `claude-fable-5-1` at medium effort; the planner, the
> plan/tasks sign-off and any decision review at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> task implementation and the per-phase reviews and sweep at `opus`;
> close-out at the top tier's model at medium
> (`sdd-implementer-fable`). What specs 012 to 014 ran as an experiment
> has been consolidated into the skill and the constitution, so this
> log measures a settled policy rather than a trial — the rows still
> earn their keep as the evidence behind any later move of a row.
> Baselines — spec 014 (the last of the three, Phase 0 only): planner 166,322 + 54,636
> resumed; sign-off 125,254 + re-review 28,042; implementer ≈402k over 4
> tasks plus fixes; reviewer ≈286k over 3 invocations (one decision
> review at the top tier, 84,082); no tier miss, no fallback. Spec 013:
> planner 236,089 + 36,776 + 48,134; sign-off 86,096 + re-review 59,061;
> implementer 906,991 over 14 dispatches; reviewer 582,663 over 8
> invocations (one decision review at the top tier, 48,125).

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation                                   | Tier                           | Tokens  | Outcome / miss reason                                                  |
| --------------------------------------------------- | ------------------------------ | ------- | ---------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                     | top (`claude-fable-5-1`, high) | 291,534 | drafted; no product question returned                                  |
| Planning: findings folded (`sdd-planner`, resumed)  | top (`claude-fable-5-1`, high) | 24,466  | B1 (option i), N1–N8 folded; no disagreement                           |
| Sign-off: plan/tasks (`skeptical-reviewer`)         | top (`claude-fable-5-1`, high) | 184,475 | fix and re-review — 1 blocking, 8 notes, 2 product items to the person |
| Sign-off: re-review (`skeptical-reviewer`, resumed) | top (`claude-fable-5-1`, high) | 16,984  | signed off; O1 carried and transcribed                                 |
| T1300 (`sdd-implementer`)                           | implementation (`opus`, high)  | 28,396  | done first dispatch; Verify note stale: CLAUDE.md at main is prettier-clean |
| T1301 (`sdd-implementer`)                           | implementation (`opus`, high)  | 209,163 | done first dispatch; LatestWork bullet moot (PR #15); BiDi before/after identical on pause and stage |
| T1301 per-task review (`skeptical-reviewer`)        | implementation (`opus`, high)  | 99,818  | SIGN OFF, 0 blocking, N1–N7 → T1301a and the sweep                      |
| T1301a (`sdd-implementer`)                          | implementation (`opus`, high)  | 44,775  | done first dispatch; match-height tolerance set to 0.25px             |
| T1302 (`sdd-implementer`)                           | implementation (`opus`, high)  | 108,355 | done first dispatch; Firefox 155 BiDi needs -remote-allow-system-access |
| Phase 0 review (`skeptical-reviewer`)               | implementation (`opus`, high)  | 113,339 | SIGN OFF, 0 blocking, N1–N6 → the sweep; gate walk names an inline paragraph image |

_(Session-tier allowance draw noted at each pause.)_

**Role table changed at this spec (2026-09-19, at the person's
request).** `CLAUDE.md`'s model policy gained the two profiles and the
role table, and the close-out dispatch moved up from the implementation
tier to the top tier's model at medium (`sdd-implementer-fable`); task
implementation stays on `sdd-implementer`. T1305 and the cadence
paragraph above follow the new row. Not temporary — it holds until the
person says otherwise. The close-out line in the table is the one worth
watching here: the measurement behind it is confounded, so record
T1305's tokens against the implementation-tier close-outs of specs 012
and 013.

**Open non-blocking notes carried to the pre-merge sweep:**

- **T1301 review N1–N7** (2026-09-19): N1 "None falls under" false by
  the cover card's −1.667px; N2 match-height residual 0.234/0.217px
  above the plan's 0.2px before and after; N3 three stale mat comments
  in global.css (~1152, ~1163, ~1942); N4 off-identity test name wider
  than its body; N5 gate-identity comment overstates sensitivity; N6
  two identical-prelude rules that must not be merged; N7 three verify
  items resolved by substitution (`/` has no cards, stage 375px pad is
  12.704, LatestWork moot). N1–N6 addressed by T1301a; the sweep
  confirms. Still stale for the sweep: matte.test.mjs case (a)'s
  name "the cards' mat is one place" (an assertion name, outside
  T1301a's one rename), and plan.md's original LatestWork bullet in
  Known limitations (the new bullet beside it says the component is gone).
- **Phase 0 review N1–N6** (2026-09-19): N1 plan.md's "The rendered
  result" and Testing strategy still say 0.2px, 12.988 at 375px, and
  the latest-work pin — Known limitations corrects all three; one
  line each at the sweep. N2 the Mattes comment says merging the two
  identical-prelude rules "fails two tests"; the reviewer counts one
  (the "declared once" case) — fix the count. N3 the sampler's header
  comment says nothing landed under specs/014-ground-tone/; the T1202
  record did — the claim is that no gate values landed; keep it
  consistent with what T1305 writes there. N4 the prose shorthand
  image is pinned structurally but was not in T1301's measured list —
  named in the gate walk. N5 the per-task measurement records live in
  the reports and the gate record below, not per task line. N6 the
  off-identity's basis assertion passes with or without the
  `+ 2 * var(--mat)` term; the "still read" guarantee is case (b)'s
  string pin — move the comment.

- **O1** (from the sign-off's re-review, 2026-09-19; blocking on the
  deepens branch only, so transcribed at once): `readout(bg, from = MUTED)`
  must also grade the muted rows at `from` (`inks.muted = from`), or the
  readout case still fails on `soft.passes` when `MUTED` lands deeper.
  Transcribed into T1303 and plan.md; the sweep confirms it against the
  module if that branch ran.
- The transform's comment at `remark-pieces-blocks.mjs` ~113 ("minus
  the mat") stays stale by construction (non-goal, empty-diff check).
- The transform's unread `--ar-sum`/`--n` on match-height blocks.
- The pause anchor's white now wins over `.piece-block a.image-link
{ background: none }` by source order alone — pinned by T1301's test;
  the sweep confirms the pin exists and bites.
- Two product items answered by the person or defaulted at the gate:
  the compare's letterbox fill and divider (white unless he says
  otherwise); prose shorthand images unmatted with the rest.

## Handoff note

Nothing is implemented; the next session begins at **T1300** (Phase 0)
as the orchestrator under the model policy's standard profile and its
role table: it opens on `claude-fable-5-1` at medium effort from
`.claude/settings.json`
(`/effort status` to confirm); it dispatches the `sdd-implementer` one
task at a time at `opus` and the `skeptical-reviewer` per phase at
`opus`, re-running `sh scripts/verify.sh` itself for **T1301**
(`review: per-task`); a design question it cannot triage as routine goes
to the `skeptical-reviewer` at the top tier on a decision bundle from
Plan Mode. **T1300 is the constitution's amendment and is committed on
its own before T1301 is dispatched.** The **Phase 0 pause is the visual
gate**: the site under `npm run dev` with no mats on it (a piece, a
gallery, a place, an image page and its quiet view, the indexes, About),
the sampler's URL (`/dev/matte/` and its four surface pages), the three
grounds the spec asks him to see — `paper`, `light`, `today` — and the
five others on the bar, the free tune, the readout and what a failing
row means, that the stage's mat bar should stay on `share-60`, that a
chosen ground follows him across the whole site under the dev server
until `today` or `reset` is pressed, and the one question — which
ground, as an id or as the numbers the bar shows, and whether he accepts
the deepened muted text if the readout says his tone needs it — go to
the person on both screens; the values are not in the plan. The
orchestrator does no browser or device checks itself. T1303 is written
for every outcome; the gate record names the branch. The **Phase 1
pause** report, on the change branch, shows the person the regenerated
`public/og.jpg` (its card is the generator's, not the hand-made one)
beside the pages, and asks him to look at a pause once, since its
dimming now runs from the landed ground.

> Read `CLAUDE.md` and `specs/015-the-hero-mat/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's standard profile and its role table (`/effort status`
> first; medium is right for this session): triage; dispatch each routine task to the
> `sdd-implementer` on a task bundle assembled with shell (the task
> line, the plan sections, the acceptance criteria, the files, the
> pattern file, any recorded gate value), telling it not to read
> plan.md, spec.md, or tasks.md in full; commit T1300 on its own before
> anything else; take the verification from the implementer's verbatim
> `sh scripts/verify.sh` output, except T1301, which you re-run yourself
> before committing (`review: per-task`); do no browser or device checks
> by hand — the implementer measures and records, the person attests
> the rest; stage, then bundle the diff for the `skeptical-reviewer` per
> phase (and once for T1301 on its own), one review and at most one
> re-review, the rest logged; commit, check the box, and log the tier
> and tokens in one shell command. Involvement level is product owner:
> pause after each phase — the Phase 0 pause is the gate, and its report
> carries the pages to walk, the sampler's URL, the three grounds to
> see, the readout's meaning, "leave the stage's mat bar on share-60"
> and the one question in plain language; the Phase 1 pause shows the
> regenerated social image and asks for one look at a pause — and
> whenever something unexpected bears on spec adherence; the same
> session continues after each pause when the person says so, and if
> the person stops at a pause, end the report with the continuation
> prompt for a fresh session.

Every pause produces a report in this shape, in this order, in plain
language (no task ids, agent names, or tier names):

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
