# Tasks: The ground tone, rethought

**Status**: Superseded (2026-09-19) by spec 015 after Phase 0 (T1200–T1203a
done, reviewed, merged as machinery); T1204–T1206 never ran. Signed off
(2026-09-17) — by the `skeptical-reviewer` at the
top tier; two blocking findings fixed and cleared on the one re-review,
nine notes folded in, and the two items the re-review carried (O1, O2 in
the tier log) transcribed from its exact text into T1200, T1204, and
T1206.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1200, T1201, T1202, T1203) — the family's
rule and the contrast formula in one module with the test that pins
`:root` to them, the social image's generator, the site-wide dev switch
behind the barrier, and the sampler the gate judges. **T1200 is marked
`review: per-task`**: the steps, the converter and the contrast formula
are what the readout shows the person, what the gate decides on, and
what the shipped test enforces — a wrong number there is judged and
then pinned. The other Phase 0 tasks are reviewed with the phase. Phase
1 and Phase 2 are per-phase (Phase 2's review is the pre-merge sweep).
The Phase 0 pause is the visual gate.

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
orchestrator for T1200; the reviewer checks each phase as a whole from a
staged, shell-assembled bundle — one review and at most one re-review,
anything still open logged and left to the sweep. A design question the
session cannot triage as routine goes to the `skeptical-reviewer` at the
top tier on a decision bundle, never resolved in the session. The sweep
runs on the documents plus `git diff main...HEAD`. The orchestrator
never does device or browser checks by hand: the computed colours are
the implementer's Verify criterion (numbers recorded in this file), and
what it cannot measure the person attests at the phase pause on his two
screens. One implementation session runs the whole spec: a phase pause
is a pause in it — the person attests and says continue — not a session
boundary; the person is paused for after each phase and whenever
something unexpected bears on spec adherence. If the person stops at a
pause, the report ends with the continuation prompt for a fresh session
(`/compact` if the context grows large; never mid-task).

Task ids: 014 = T12xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T12xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the rule and the floor, the generator, the switch, and the sampler (reviewer after the phase; the gate at its end)

- [x] **T1200** — The family's rule and the contrast floor, in one
      module and its test. `review: per-task`. `src/lib/ground.ts`
      (new; plain exported functions, no imports — `src/lib/pause-shape.ts`
      is the pattern for a pure module with a `.mjs` test): `STEPS`
      (plan.md's table — surface −0.023/+0.001, soft −0.048/+0.002,
      line −0.108/+0.002, line-strong −0.248/+0.006; h the ground's),
      `deriveFamily(bg)` (L and C rounded to 3 decimals, C ≥ 0, L ≤ 1),
      `formatOklch` (`oklch(L C h)`, trailing zeros trimmed, so today's
      ground formats today's four literals byte for byte), `parseOklch`
      and `oklchToRgb255` moved verbatim from `ground.test.mjs`,
      `toHex`, `rootTokens(css)` (the test's `blocks`/`declarations`/
      `selects` helpers moved in as pure string functions, returning
      `:root`'s declarations — the test and T1201's generator both read
      the stylesheet through it), `relativeLuminance` and `contrast`
      (plan.md's formula, on the rounded 8-bit channels), `PAIRS`
      (text × bg/surface/soft, muted × bg/surface/soft, mat × bg),
      `FLOOR = 4.5`, `TEXT`, `MUTED` and `MAT` (the literal tones of
      `--color-text`, `--color-muted`, `--color-matte` as `:root` has
      them today — the readout's fixed ends, never a computed style),
      `deepenMuted(family, from = MUTED)` (the starting muted's L down
      by 0.01 until the three muted pairs pass; `null` if none fails), `readout(bg)`,
      `tokensFor(bg)` (the five strings plus `--color-muted` only when
      deepened), `CANDIDATES` (plan.md's eight, `today` first-class with
      `TODAY` its id), `CONTROL` (`oklch(0.968 0.006 95)` as a literal
      — the tone at spec 014's gate, which T1204 never moves) and the
      `Tone` type. Erasable TypeScript only (no enums, no parameter
      properties): T1201's script imports it under type stripping.
      `ground.test.mjs` (extended; its CSS helpers now imported from
      the module; the converter case now imports): the plan's cases —
      (a) the four derived `:root` literals equal the rule's strings,
      each named; (b) `CANDIDATES.today.bg` is `:root`'s `--color-bg`,
      `TEXT` its `--color-text`, `MUTED` its `--color-muted`, `MAT` its
      `--color-matte`; (c) the spread **against `CONTROL`** (two lighter
      incl. `oklch(0.99 0.003 100)`, two darker, one within L 0.01 with
      h ≥ 200, one with h < 95 and C above `CONTROL`'s, ids unique), and
      `CONTROL` equals `CANDIDATES.today.bg` or
      `CANDIDATES['warm-003'].bg`; (d) the six text pairs at `:root`'s
      values `≥ 4.5`, each named with its ratio; (e) the formula's
      fixtures — black/white 21, `#777777`/white 4.48, `#767676`/white
      4.54, each `toBeCloseTo(x, 2)` on the unrounded ratio; (f)
      `deepenMuted` from literals, not the candidate table:
      `deepenMuted(deriveFamily(parseOklch('oklch(0.93 0.008 95)')), parseOklch('oklch(0.5 0.012 250)'))`
      returns L 0.48, passing all three muted pairs while 0.49 fails
      muted/soft, and `deepenMuted(deriveFamily(CANDIDATES.today.bg))`
      with the default is `null`; (g) the five ground tokens are declared only in
      `:root` — no other block in `global.css`, no file under `src/`
      outside `src/pages/dev/` (`matte.test.mjs`'s declared-once case is
      the pattern). _Verify: `sh scripts/verify.sh tests` green, re-run
      by the orchestrator; the seven ratios at today's values recorded
      here to three decimals (they replace plan.md's estimates);
      `npx prettier --check` clean on both files; mutations named and
      reverted — `--color-soft` L 0.92 → 0.921 fails (a) naming
      `--color-soft`; `STEPS.line.L` −0.108 → −0.11 fails (a); `MUTED`
      L 0.5 → 0.49 in the module fails (b); `--color-muted` L 0.5 →
      0.55 in `:root` fails (b) and (d) on muted/soft with the ratio in
      the message; `0.7152` → `0.7` in the luminance fails (e); a second
      `--color-bg` declared on `.site-header` fails (g). If (d) fails at
      landing on today's values the site is already under the floor:
      the numbers are reported and the task stops for the phase review
      — the floor is not lowered._

_T1200 record (2026-09-17):_ landed green; the seven ratios at today's `:root` — text/bg 14.571, text/surface 13.654, text/soft 12.681, muted/bg 5.451, muted/surface 5.108, muted/soft 4.744 (the binding pair), mat/bg 1.098 at ΔL 0.032. `deepenMuted` lands deep-1 → 0.49, deep-2 → 0.48, deep-3 → 0.46. Every mutation failed as named, except that `--color-muted` 0.5 → 0.55 names muted/bg (4.430) first, not muted/soft — all three muted pairs fail there. Per-task review: two blocking (the floor loop could go vacuous; a pass flag on the unfloored mat pair) fixed and cleared on the re-review; a readout case added, pinned from the literal `oklch(0.95 0.007 95)`._

- [x] **T1201** — The social image's generator, and the OG copies all
      pinned. `src/lib/og-card.mjs` (new; plain JS with JSDoc): `COLOR`
      (the five hexes, moved from the route with their comment),
      `loadFonts()` (the two `readFile(require.resolve(…))` reads,
      lazy), `card({ title, description, kind })` → the Satori tree the
      route builds today, unchanged, with `kind === ''` rendering no
      eyebrow row. `src/pages/og/pieces/[slug].png.ts`: imports those
      three and keeps only `getStaticPaths`, `GET`, `truncate` and the
      Satori/sharp calls. `scripts/gen-og.mjs` (new; the header comment
      shape of `scripts/check-no-gps.mjs`): reads `:root` from
      `src/styles/global.css` with `rootTokens` and converts
      `--color-bg`, `--color-text`, `--color-muted`, `--color-line`,
      `--color-accent` with `ground.ts` — both imported as
      `../src/lib/ground.ts`, and `SITE` as `../src/consts.ts`
      (type stripping needs the extension on the specifier; both files
      are erasable syntax), prints each beside `COLOR`'s hex, exits 1
      with plan.md's drift line if any channel differs by more than 2,
      else renders
      `card({ title: SITE.title, description: SITE.description, kind: '' })`
      at 1200×630 → sharp → JPEG quality 90 → `public/og.jpg` (or
      `--out <path>`), printing the wrote line. `package.json`:
      `"og": "node --experimental-strip-types scripts/gen-og.mjs"` (an
      ExperimentalWarning on Node 22.12–22.17 is expected; v26 aliases
      the flag). `ground.test.mjs`: the OG case imports `COLOR` from
      `og-card.mjs` (the regex parse of the route deleted) and pins all
      five hexes within ±2/255 per channel of their token's conversion;
      the `og.jpg` case unchanged. _Verify: **at the start of the task,
      before any edit**, with no dev server running, a fresh
      `npm run build` on the branch and
      `shasum dist/og/pieces/where-the-fog-lets-go.png` recorded (a
      stale or absent `dist/` is not a before); after, the same hash
      from `sh scripts/verify.sh`'s build, identical; `node --version`
      recorded and `npm run og -- --out <scratchpad>/og.jpg` prints the
      five hex pairs and writes a 1200×630 JPEG whose (10, 10) pixel is
      within ±3 of the committed `public/og.jpg`'s (both triples
      recorded — the ground is what this proves; the card's layout may
      differ from the hand-made file, and that is not a failure: the
      scratch image is attached to the record and shown to the person
      at the Phase 1 pause if the change branch regenerates it);
      `git diff main -- public/og.jpg` empty; mutation —
      `COLOR.bg` set to `#f6f0f0` → the test fails and `npm run og`
      refuses with the drift line, restored. If any of the five hexes
      drifts from its token at landing, resync the hex in `og-card.mjs`
      in this task and record the old and new values — a copy resync,
      no design change. If type stripping fails on the installed Node,
      stop and return the error: plan.md names the fallback and it is a
      deviation to record, not to take silently._

_T1201 record (2026-09-17):_ Node v26.7.0, no ExperimentalWarning. Before and after hash of `dist/og/pieces/where-the-fog-lets-go.png` identical (`989f1827…7053`). `npm run og`: all five hexes equal their tokens (bg `#f6f4f0`, text `#1e2226`, muted `#5e646a`, line `#d2d1cb`, accent `#004942`), no resync. Scratch and committed `og.jpg` both 1200×630, (10,10) = [245,244,240] in both, delta 0; the scratch card's layout is the generator's, not compared beyond the ground. Mutation `#f6f0f0`: the test names the green channel (240 vs 244); the generator refuses with the drift line. The drift line prints COLOR's hex first, then `:root`'s. One `astro check` error mid-task (Satori's `weight` union) fixed with an explicit JSDoc type on the fonts memo._

- [x] **T1202** — The site-wide switch, dev only, and the barrier that
      proves it. `src/components/DevGround.astro` (new): one
      `<script is:inline data-dev-ground>` of plain JS — read
      `localStorage['dev-ground']` (JSON `{ id, bg, muted, tokens }`),
      `setProperty` each `tokens` entry on `document.documentElement`,
      register one `astro:after-swap` listener that does the same
      (behind a `window.__devGround` flag), swallow storage errors; a
      header comment saying what it is and that
      `scripts/check-no-dev-routes.mjs` scans for its marker.
      `src/layouts/BaseLayout.astro`: import it and render
      `{import.meta.env.DEV && <DevGround />}` in `<head>` after the
      `<title>` (the pattern: the dev samplers' `import.meta.env.DEV`
      guard in `getStaticPaths`). `scripts/check-no-dev-routes.mjs`: a
      second scan of every `.html` and `.js` under `dist/` for the
      string `dev-ground`, failing with plan.md's line naming the files;
      the green line gains `; no dev-ground marker in <n> files.`
      _Verify: `sh scripts/verify.sh` green with `87 page(s) built` and
      the new barrier line; `grep -rl dev-ground dist/` empty;
      `test ! -e dist/dev && echo absent`; the negative control — the
      `import.meta.env.DEV &&` guard removed, `npm run build` fails at
      the barrier naming `dist/index.html` among the files, output
      recorded, guard restored and re-verified green. Then on the dev
      server (Firefox headless via BiDi, T1104's launch recipe in
      specs/013-the-matte/tasks.md): with `localStorage['dev-ground']`
      set to `tokensFor(CANDIDATES deep-2)` (the driver writes the JSON
      the sampler will), `<html>`'s computed `background-color` on `/`,
      `/pieces/`, `/pieces/where-the-fog-lets-go/`,
      `/galleries/every-ratio/`, `/places/the-headlands/`, one image
      page and its quiet view (still `--color-quiet`'s conversion),
      `/about/`, `/search/` equals `oklchToRgb255(deep-2)` within 1/255
      (every read recorded); a cover card's background on `/` and a
      `code`'s on `/pieces/vocabulary-sampler/` equal the derived
      surface and soft, a `.site-footer` `border-top-color` the derived
      line; the same reads after a **router navigation** from `/` to
      `/pieces/` by clicking the nav link (not a reload); with the key
      removed and the page reloaded, every read is the stylesheet's
      value. Where the implementer cannot drive a browser it says so,
      line by line, and the Phase 0 pause asks the person to attest
      those lines._

_T1202 record (2026-09-17):_ `87 page(s) built`, `[check-no-dev-routes] no dev routes in dist/; no dev-ground marker in 97 files.`, 338 tests. `grep -rl dev-ground dist/` empty; `dist/dev` absent. Negative control: guard removed → the barrier names 89 files including `dist/index.html`, `BUILD EXIT 1`; restored, green. Firefox 155 headless via BiDi, every read exact (0/255): with `deep-2` stored (`bg oklch(0.93 0.008 95)`, muted deepened to `oklch(0.48 0.012 250)`, six tokens) `<html>` reads [233,232,226] on `/`, `/pieces/`, the fog piece, the vocabulary sampler, `/galleries/every-ratio/`, `/places/the-headlands/`, `/about/`, `/search/`, the land-a image page, and `/pieces/` after a router navigation; the quiet view [23,22,18] (`--color-quiet`, unmoved); `code` on the sampler [218,216,209] (soft); `.search-fallback` [226,224,218] (surface); `.site-footer` and `.note-row` borders [199,197,190] (line). Key removed: every read the stylesheet's ([246,244,240] etc.). Substitution: no card on `/` sits on the surface — `.entry-card`/`.work-card` use `--color-bg`, and `--color-surface` has exactly one shipped use, `.search-fallback` — so the surface was measured on `/search/` and the line on `/`'s `.note-row`. Deviations: `page-head.test.mjs`'s verbatim green-line assertion updated to the new line, and one test added for the new failure path (a fixture carrying the marker exits 1 naming the file). Drivers in the scratchpad._

- [x] **T1203** — The sampler's ground bar: the candidates, the tune,
      the readout. `src/pages/dev/matte/[...surface].astro` (spec 013's
      file; its own toolbar script is the pattern for the button and
      input handling): `getStaticPaths` imports `CANDIDATES` from
      `../../../lib/ground` and passes it as a `grounds` prop (imports
      are visible in its isolated scope; frontmatter consts are not —
      the spec-010 gotcha, restated in the comment); the
      `aside[data-ground-bar]` becomes plan.md's bar — a button per
      candidate (`data-ground={id}`, `data-l`/`data-c`/`data-h`,
      `data-note`, `is-active` on the selected one), three `range`
      inputs (`data-tune="l"|"c"|"h"`, L 0.85–1.00 step 0.001, C 0–0.03
      step 0.001, h 0–360 step 1) each with a `<output>`, a
      `.ground-tone` line with the tone as `oklch(L C h)` text and the
      id, a seven-row `<table class="ground-readout">` (pair, ratio to
      two decimals rounded down, `is-fail` under 4.5 on the six text
      rows; the mat row shows the ratio and ΔL), a `.ground-muted` line
      ("muted ships at `oklch(…)` — deepened for <pair>" or "muted
      unchanged"), a `.ground-tokens` line listing the stored key's
      tokens one per `token: value` (empty, "no override — the
      stylesheet", on `today`), and a `reset` button; the surface links
      stay. The script: import `CANDIDATES`, `TODAY`, `readout`,
      `tokensFor`, `formatOklch` from `../../../lib/ground`;
      `applyGround(tone, id)` computes `readout(tone)` — its fixed ends
      are the module's `TEXT`/`MUTED`/`MAT`; **no `getComputedStyle`
      read of any colour token anywhere in the script** (the head
      applier has already set a deepened `--color-muted` on `<html>`
      when a stored candidate needed one, and a DOM read would grade
      the tone against the wrong muted) — fills the readout and the
      tokens line, writes `localStorage['dev-ground']` =
      `{ id, bg, muted, tokens }` and `setProperty`s the tokens on
      `<html>`; `today` and `reset` remove the key and `removeProperty`
      each of the six; a candidate click seeds the sliders; a slider
      `input` gives id `tune`. On load the script reads the stored key
      to mark the active button and seed the sliders, and recomputes
      the readout from the stored `bg` (not from the DOM). Delete
      `GROUND_TOKENS`, `WHITE`, `WARM`, `applyGround`'s old body and the
      `ground` field of the `matte-sampler` session state; the file's
      header comment and the script's comment say the ground is the
      switch's and where the values are recorded. `START` for the mat
      candidates becomes `share-60` (the shipped rule), the comment
      updated; ids unchanged. _Verify: `sh scripts/verify.sh` green with
      `87 page(s) built` and the barrier line; `grep -rl matte-sampler dist/`
      empty; `grep -c "getComputedStyle" "src/pages/dev/matte/[...surface].astro"`
      → 0; `npx prettier --check` clean. On the dev server at 1512×982:
      `/dev/matte/` shows eight ground buttons in the table's order and
      the mat candidates open on `share-60`; clicking `deep-2` — `<html>`'s
      background equals its conversion, the key holds six tokens (muted
      deepened), the readout's muted/soft row shows the failing
      undeepened ratio and the muted line the shipped L, the tokens line
      lists the six (all recorded); **then a reload of `/dev/matte/`
      with `deep-2` still stored** — the same readout, the same muted
      line, the key still six tokens, `<html>`'s `--color-muted` the
      deepened value (the sign-off's B2 case); the L slider to 0.90 —
      id `tune`, the tone text `oklch(0.9 0.008 95)` (C and h from
      `deep-2`), the muted line deeper still; `today` — the key gone,
      `<html>` carrying no inline token, the tokens line reading "no
      override"; `/pieces/where-the-fog-lets-go/` opened afterwards with
      `deep-2` selected wears it; the readout's seven numbers on `today`
      equal T1200's recorded ratios floored to two decimals. Where the
      implementer cannot drive a browser it says so, line by line._

_T1203 record (2026-09-18):_ first landing stopped on a judgment call — the bar's hoisted `<script>` (7,960 B, over Astro's 4 KB `assetsInlineLimit`) was emitted as an orphan chunk in `dist/_astro/` carrying `dev-ground`, and T1202's barrier failed the build; spec 013's toolbar had sat under that cliff by chance. Decision review at the top tier: the script is served, never bundled — moved verbatim to `src/pages/dev/matte/_sampler.ts`, loaded by `<script is:inline type="module" src=…>`; plan.md's sampler bullet and a resolved decision transcribed; a new test (h) pins every dev-fixture `<script` to `is:inline` and every `src` to a file on disk (negative controls: `is:inline` removed → (h) fails; a renamed src → (h) fails; a type error in `_sampler.ts` → `CHECK EXIT 1`). Final: `87 page(s) built`, barrier line `no dev-ground marker in 97 files`, 340 tests, no `surface_` chunk, `dev-ground` and `matte-sampler` absent from `dist/`, `getComputedStyle` 0 in both files, Prettier clean. Firefox BiDi at 1512×982: `_sampler.ts` served 200 `text/javascript` with types stripped; eight buttons in table order; mat candidates on `share-60`; `today`'s readout 14.57 / 13.65 / 12.68 / 5.45 / 5.10 / 4.74 / 1.09 (ΔL 0.032) = T1200's floored; `deep-2` → rgb(233,232,226), key of six tokens, rows 13.03 / 12.12 / 11.22 / 4.87 / 4.53 / 4.19 (is-fail) / 1.22, muted line "ships at oklch(0.48 0.012 250) — deepened for muted/soft"; reload with `deep-2` stored identical, `<html>` inline `--color-muted` the deepened value; L slider 0.90 → `tune`, `oklch(0.9 0.008 95)`, muted 0.46 deepened for all three; `today` → key null, no inline colour token (only BaseLayout's `--header-h`), "no override"; the fog piece under `deep-2` rgb(233,232,226); the mat toolbar and a router navigation still work. Deviations: ground imports aliased in the frontmatter (`getStaticPaths` declares its own CANDIDATES/ TODAY for the mats); `MAT` and `parseOklch` also imported; the banner gained a bounded scroll; `.is-fail` uses a fixture literal, the theme has no failure tone._

- [x] **T1203a** — Phase 0 review fixes (2026-09-18). B1: on the three
      muted rows, when the tone deepens, the readout shows the ratio at
      the shipped muted beside the undeepened one (`4.19 → 4.58 ✓ at
the shipped muted`; `is-fail` stays on the undeepened value; on
      `deep-2` 4.87 → 5.32, 4.53 → 4.95, 4.19 → 4.58; `today` unchanged).
      B2: plan.md's "unedited" claim now exempts `page-head.test.mjs`
      (T1202's), the file table gains `_sampler.ts` and that test, and
      the untrue "note rows on the surface" sentence is corrected. The
      script tag moved inside the layout (`document.body.contains` true
      on load, reload and router navigation). Then, found after the
      re-review: the page's scoped `<style>` never matched the readout's
      runtime-created rows and cells, so the failing row's red was dead
      — `.ground-readout :global(tr.is-fail …)` and `:global(th|td)`;
      measured on `deep-2`: muted/soft row `rgb(187,6,30)` bold, every
      other row `rgb(0,73,66)`; on `today` no row red. Carried to the
      sweep: the two `COPIES` maps, the barrier's raw string scan, test
      (h)'s reach, the root-absolute `src` under a future `base`, the
      untested Node 22.12 branch, `tune` impersonating the control.
      Verify: 87 pages, no dev-ground marker in 97 files, BUILD 0,
      CHECK 0, 340 tests, TEST 0, Prettier clean.

### Gate record (Phase 0 pause)

**Not answered (2026-09-19).** At the gate, looking at the candidates on
the sampler and the site, the product owner decided the mats should go
from every surface except the image page's stage and its quiet view
("in the galleries and pieces, I think it looks better to remove
them"), which removes this spec's premise. His lean for the ground was
paper (`oklch(0.99 0.003 100)`), with the concern that the stage's white
mat vanishes on it, and an idea for the stage to sit in a darker field
while centred. All of that goes to spec 015, "The hero mat", which
re-judges the ground on the unmatted site with this spec's switch. The
sections below stay as written; nothing under them ran.

_(The product owner's decision from `/dev/matte/` and the site under the
switch, on both screens, with the mat bar left on `share-60`: the tone
— a candidate id, or the tune's numbers `oklch(L C h)` — the family it
derives (the bar's tokens line, copied), the readout's seven ratios at
that tone, and whether
the muted text deepens: its L and the pair that forced it, or "muted
unchanged". If today's tone is kept, "kept" and why, in the person's
words. Recorded here by the orchestrator, in the person's words and the
numbers, before T1204 is dispatched.)_

## Phase 1 — The tone landed, the copies moved, and the docs (reviewer after the phase; the person's pause at its end)

<!-- T1204 is the load-bearing visible change under per-phase review;
the phase review must treat its recorded reads and grep results as the
substance of the review. T1204 is written for every gate outcome; the
bundle carries the gate record, and the implementer follows the branch
it names. -->

- [ ] **T1204** — The gate's tone, or the record that it stayed.
      Pattern: `:root` in `src/styles/global.css` and its comment above
      `--color-bg`; spec 003's T209G record. **Changed**:
      `src/styles/global.css` `:root` — `--color-bg` to the gate's tone
      and `--color-surface`, `--color-soft`, `--color-line`,
      `--color-line-strong` to `tokensFor(tone)`'s strings, pasted from
      the failing test's expected values or the generator's print (never
      retyped from the sampler by eye), token order unchanged; the
      comment rewritten (this gate's date, the tone as numbers, the
      candidate or "tuned from <id>", the pair that bound, spec 003's
      warming kept as one line of history); **only if the record says
      the muted text deepened**: `--color-muted` to the recorded value
      with its own comment naming the pair and the undeepened value,
      **and `MUTED` in `src/lib/ground.ts` to the same value** (test
      case (b) demands both). `src/lib/ground.ts`: `CANDIDATES.today.bg`
      → the landed tone; a new entry `warm-003` carrying the former
      control's tone with the note "spec 003's warm — the control at
      spec 014's gate"; the taken candidate's entry (`deep-2`, say)
      **dropped** — its tone is now `today` and two buttons with one
      tone would mislead the next gate (a tuned tone has no entry to
      drop); `CONTROL` untouched. `src/lib/og-card.mjs`: `COLOR.bg` and
      `.line` (and `.muted` on the deepens branch) from `npm run og`'s
      print; then `npm run og` writes `public/og.jpg`. **Kept**: no edit
      to any of those files; the record says so. _Verify:
      `sh scripts/verify.sh` green; changed — `ground.test.mjs` green
      against the new literals with every delta recorded;
      `grep -rn "0.968 0.006 95\|0.945 0.007 95\|0.92 0.008 95\|0.86 0.008 95\|0.72 0.012 95" src/`
      → exactly the `:root` history comment line(s), the `warm-003`
      entry, and `CONTROL`'s line in `src/lib/ground.ts`, nothing else (every hit listed in the record — a fill left
      at the old tone is a hit); `git diff main -- src/styles/global.css` shows
      no change inside the `html[data-pause-active]` block or on
      `--color-quiet`, `--pause-depth`, `--color-text`, `--color-accent`,
      `--color-matte`, `--mat-share`, `--mat-min`, `--mat-max`; on the
      dev server with no `dev-ground` key at 1512×982 and 375×812:
      `<html>`'s background on `/pieces/where-the-fog-lets-go/`, a cover
      card on `/`, a `code` on `/pieces/vocabulary-sampler/`, the
      footer's `border-top-color`, and the quiet view's background on
      one image page — each the landed token's conversion (or
      `--color-quiet`'s) within 1/255, recorded; a built OG PNG's
      (10, 10) pixel equals `COLOR.bg` within 2; `sharp` reads
      `public/og.jpg` as 1200×630, and the regenerated file's path is
      named in the record so the Phase 1 pause report can show it to
      the person (its card is the generator's; the old one was
      hand-made and may differ beyond the tone). Kept —
      `git diff main -- src/styles/global.css src/lib/og-card.mjs public/og.jpg`
      empty and `git diff main -- src/lib/ground.ts` touching no
      `CANDIDATES` line; `ground.test.mjs` green is the pin. Both —
      `git diff main -- src/content.config.ts remark-pieces-blocks.mjs obsidian-plugin/ src/lib/gallery-layout.ts`
      empty; `matte.test.mjs`, `page-head.test.mjs`, `og.test.mjs`
      unedited. Unmeasured lines named for the person's attestation at
      the pause on both screens._

- [ ] **T1205** — Docs: `README.md` and `design/brief.md`. `README.md`:
      the sentence at ~339 ("`public/og.jpg` is the site-wide fallback")
      gains how it is regenerated (`npm run og`, after `:root` moves and
      `COLOR` is resynced — the test pins both); the project-structure
      tree (~355) gains `scripts/gen-og.mjs` and `src/lib/ground.ts`
      / `src/lib/og-card.mjs` where the tree lists `src/lib/`, and the
      `pages/dev/` comment says the matte sampler also carries the
      ground switch. `design/brief.md` "Palette" (~58–64): one
      paragraph appended, not a rewrite — the ground was re-judged at
      spec 014's gate on both screens against the settled mats, the
      tone taken (or kept) as numbers, the fills at fixed steps from it
      (`src/lib/ground.ts`), the text floor of 4.5:1 now pinned by a
      test, and the muted text's value if it deepened; the "two manually
      synced hex copies" sentence (~70–72) now says the OG copies are
      pinned by `ground.test.mjs` and regenerated by `npm run og`.
      Hand-edit the prose (never script-rewrap). _Verify: every claim
      read against the built stylesheet, `og-card.mjs` and the gate
      record; `npx prettier --check README.md design/brief.md` clean;
      `sh scripts/verify.sh` green._

## Phase 2 — Close-out (the documents, the reviewer sweep, then merge)

- [ ] **T1206** — Close-out. The repo-wide documents are edited by the
      `sdd-implementer` on a bundle (T1205 is the pattern; the bundle
      carries the gate record, plan.md's "Resolved decisions" and the
      ROADMAP entry) and committed by the orchestrator; the sweep, the
      merge, and the bookkeeping are the orchestrator's own part, as
      CLAUDE.md assigns them. `ROADMAP.md`: strike "The ground tone,
      rethought" (shipped as spec 014 — the tone as numbers or "kept",
      whether the muted text deepened, the switch and generator now in
      the repo; relative colour syntax as a follow-up if a second
      palette ever appears); the aspect-ratio entry's annotation gains
      the ground it will be judged on. `DECISIONS.md`: a "Spec 014: the
      ground tone, re-judged" section in 013's shape — the candidates
      and what each was for, the outcome on both screens in the
      person's words, why five literals and a test rather than relative
      colour, why the muted text deepened or did not, the generator;
      and "Ground tone: warmed so the mattes read" annotated with the
      outcome, not rewritten (superseded by the new tone, or re-judged
      and kept). Both ride this branch and merge with the PR, in their
      own commit(s) (`npx prettier --check` clean; hand-edited prose —
      check for lines beginning with a CSS `>` before any format run).
      Then, the orchestrator's part: the pre-merge whole-spec sweep at
      the reviewer's default tier and its findings resolved; the
      acceptance criteria checked against their records (the switch's
      absence from `dist/` by T1202's and the final build's barrier
      line; the floor by `ground.test.mjs`; the copies by T1204's
      deltas; the mat by `git diff` on its tokens and `matte.test.mjs`
      unedited); build, tests, check, GPS scan, dev-routes scan, and
      format green with actual output; the PR marked ready and merged
      with a merge commit; the close-out box ticked in the same shell
      command as the merge bookkeeping. _Verify: the implementer's
      `sh scripts/verify.sh` green with the documents edited;
      `grep -rn "0.968 0.006 95\|0.945 0.007 95\|0.92 0.008 95\|0.86 0.008 95\|0.72 0.012 95\|#f6f4f0\|#d2d1cb" README.md DECISIONS.md ROADMAP.md design/brief.md src/`
      → only lines consistent with the gate's outcome (history lines,
      `warm-003`, and `CONTROL`'s line in `src/lib/ground.ts` say so;
      every hit listed); main green after the
      merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the third spec under experiment 1)

> **Experiment 1** — the session on `claude-fable-5-1` at medium effort;
> the planner and the plan/tasks sign-off at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> implementer and per-phase reviews at `opus`. Baselines — spec 013 (the
> second spec under this policy): planner 236,089 + 36,776 + 48,134
> resumed; sign-off 86,096 + re-review 59,061; implementer 906,991 over
> 14 dispatches; reviewer 582,663 over 8 invocations (one decision
> review at the top tier, 48,125); no tier miss, no fallback. Spec 012:
> planner 133,795; sign-off 124,446; implementer 287,531 over 6;
> reviewer 230,463 over 4.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation                                   | Tier                           | Tokens  | Outcome / miss reason                                                                                           |
| --------------------------------------------------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                     | top (`claude-fable-5-1`, high) | 166,322 | drafted; no product question returned                                                                           |
| Planning: findings folded (`sdd-planner`, resumed)  | top (`claude-fable-5-1`, high) | 54,636  | B1, B2, N1–N9 folded; no disagreement                                                                           |
| Sign-off: plan/tasks (`skeptical-reviewer`)         | top (`claude-fable-5-1`, high) | 125,254 | fix and re-review — 2 blocking, 9 notes, no product question                                                    |
| Sign-off: re-review (`skeptical-reviewer`, resumed) | top (`claude-fable-5-1`, high) | 28,042  | signed off; O1, O2 carried and transcribed                                                                      |
| T1200 (`sdd-implementer`)                           | impl (`opus`)                  | 102,298 | done; one orchestrator correction before review (readout graded against the deepened muted), one fix pass after |
| T1200 per-task review (`skeptical-reviewer`)        | impl (`opus`)                  | 76,363  | 2 blocking + 5 notes; fixed, re-reviewed, signed off                                                            |
| T1201 (`sdd-implementer`)                           | impl (`opus`)                  | 63,858  | done; no deviation                                                                                              |
| T1202 (`sdd-implementer`)                           | impl (`opus`)                  | 86,030  | done; page-head test's verbatim line updated + 1 test added                                                     |
| T1203 (`sdd-implementer`)                           | impl (`opus`)                  | 149,220 | stopped on a judgment call (orphan chunk), resumed after the decision; done                                     |
| T1203 decision review (`skeptical-reviewer`)        | top (`claude-fable-5-1`, high) | 84,082  | served-file B′ chosen; transcribed into plan.md                                                                 |
| T1203 fixes + T1203a (`sdd-implementer`, resumed)   | impl (`opus`)                  | 33,626  | the shipped ratio shown; tag moved; the scoped-style fix                                                        |
| Phase 0 review (`skeptical-reviewer`)               | impl (`opus`)                  | 125,460 | 2 blocking + second look; fixed, re-reviewed, signed off                                                        |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- **O1** (from the sign-off's re-review, 2026-09-17; blocking by
  definition, so transcribed at once rather than left): T1200's case (f)
  was written against `CANDIDATES['deep-2']` and stepped from `MUTED`,
  both of which T1204 moves — on a `deep-2`, `deep-3`, or tuned landing
  that deepens, (f) would throw or return `null`. The reviewer's text is
  transcribed into plan.md (the family module, Testing strategy) and
  T1200 (f): `deepenMuted(family, from = MUTED)`, and (f) pinned from
  literals. The sweep confirms the transcription against the test that
  landed.
- **O2** (same re-review): `CONTROL` in `src/lib/ground.ts` is a certain
  hit of the old-literal grep on every branch; T1204's and T1206's
  expected hits now name it. The sweep confirms the grep lines.

## Handoff note

Nothing is implemented; the next session begins at **T1200** (Phase 0)
as the orchestrator under the model policy's experiment 1: it opens on
`claude-fable-5-1` at medium effort from `.claude/settings.json`
(`/effort status` to confirm); it dispatches the `sdd-implementer` one
task at a time at `opus` and the `skeptical-reviewer` per phase at
`opus`, re-running `sh scripts/verify.sh tests` itself for **T1200**
(`review: per-task`); a design question it cannot triage as routine goes
to the `skeptical-reviewer` at the top tier on a decision bundle from
Plan Mode. The **Phase 0 pause is the visual gate**: the sampler's URL
(`/dev/matte/` and its four surface pages), the eight candidates and
what each is for, the free tune, the readout and what a failing row
means, that the mat bar should stay on `share-60` (the shipped mat)
while the ground is judged, that a chosen candidate follows the person
across the whole site under `npm run dev` until `today` or `reset` is
pressed, and the one question — which tone, as an id or as the numbers
the bar shows, and whether he accepts the deepened muted text if the
readout says his tone needs it — go to the person on both screens; the
values are not in the plan. The orchestrator does no browser or device
checks itself. T1204 is written for every outcome; the gate record
names the branch. The **Phase 1 pause** report, on the change branch,
shows the person the regenerated `public/og.jpg` (its card is the
generator's, not the hand-made one) beside the pages.

> Read `CLAUDE.md` and `specs/014-ground-tone/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's experiment 1 (`/effort status` first; medium is right
> for this session): triage; dispatch each routine task to the
> `sdd-implementer` on a task bundle assembled with shell (the task
> line, the plan sections, the acceptance criteria, the files, the
> pattern file, any recorded gate value), telling it not to read
> plan.md, spec.md, or tasks.md in full; take the verification from the
> implementer's verbatim `sh scripts/verify.sh` output, except T1200,
> which you re-run yourself before committing (`review: per-task`); do
> no browser or device checks by hand — the implementer measures and
> records, the person attests the rest; stage, then bundle the diff for
> the `skeptical-reviewer` per phase (and once for T1200 on its own),
> one review and at most one re-review, the rest logged; commit, check
> the box, and log the tier and tokens in one shell command.
> Involvement level is product owner: pause after each phase — the
> Phase 0 pause is the gate, and its report carries the sampler's URL,
> the candidate table, the readout's meaning, "leave the mat bar on
> share-60" and the one question in plain language; the Phase 1 pause
> shows the regenerated social image — and whenever something
> unexpected bears on spec
> adherence; the same session continues after each pause when the
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
