# Tasks: The hero stage

**Status**: Draft — pending sign-off
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1400–T1404) — the constitution's clause
amended first in its own commit, the tokens and the stylesheet's
arrival block with their pins, the head script with its stub test and
browser reads, the dev-only control, and the two small carried items,
so the gate judges the arrival on the site as it will ship, with the
knobs live. **T1401 is marked `review: per-task`**: it names the
tokens, the attribute, the custom properties and the selectors that
T1402, T1403, the tests, the landing and the docs all read, and a
wrong mix string or a rule outside the quiet gate is what every later
task would inherit. T1400, T1402, T1403 and T1404 are reviewed with the
phase. Phase 1 and Phase 2 are per-phase (Phase 2's review is the
pre-merge sweep). The Phase 0 pause is the visual gate, and the Phase 1
pause is the same gate looked at again; it repeats until the person
says done.

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
files, the pattern file to copy, any recorded gate value), telling it
not to read plan.md, spec.md, or tasks.md in full; the implementer's
verbatim `sh scripts/verify.sh` output is the verification, re-run by
the orchestrator for T1401; the reviewer checks each phase as a whole
from a staged, shell-assembled bundle — one review and at most one
re-review, anything still open logged and left to the sweep. A design
question the session cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle, never
resolved in the session. The sweep runs on the documents, the
close-out patch, and `git diff main...HEAD`. The orchestrator never
does device or browser checks by hand: computed colours, the lights'
values and the geometry are the implementer's Verify criterion
(numbers recorded in this file), and what it cannot measure — a flash,
the look on the phone, the dimmed chrome's legibility — the person
attests at the phase pause on his two screens. One implementation
session runs the whole spec: a phase pause is a pause in it — the
person attests and says continue — not a session boundary; the person
is paused for after each phase and whenever something unexpected bears
on spec adherence. If the person stops at a pause, the report ends
with the continuation prompt for a fresh session (`/compact` if the
context grows large; never mid-task).

Task ids: 016 = T14xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T14xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the constitution, the arrival, the control, and the carried items (reviewer after the phase; the gate at its end) — walkthrough: an image page under `npm run dev` opens dark with the photograph matted and the header, frame nav, toggle and title faint; scrolling down lightens the page to paper over about one screen and scrolling up darkens it again; the quiet view deepens from it; a reload mid-page shows the light page at once; the bottom-right bar moves the depth, the chrome and the fade live and shows the numbers

- [ ] **T1400** — The constitution first. `CLAUDE.md`'s block-vocabulary
      bullet says "the site mats only the image page's stage and its
      quiet view (spec 015) — a piece's frames sit unmatted on the
      ground, the pause frame excepted until its own spec": true in
      effect, false in framing once this spec states the rule, and the
      constitution requires its amendment "first, explicitly, in its own
      commit". Amend that clause to: the site mats a frame where its
      ground is dark (spec 016) — the image page's stage on arrival, its
      quiet view, and a piece's pause frame — and every other frame sits
      bare on the ground. One clause, no other edit. Pattern: spec 015's
      T1300 (the same clause, the previous amendment). _Verify:
      `npx prettier --check CLAUDE.md` clean;
      `git log -1 --stat` after the orchestrator's commit shows
      `CLAUDE.md` plus `tasks.md`'s bookkeeping and nothing else;
      `grep -n "excepted until its own spec" CLAUDE.md` → 0;
      `sh scripts/verify.sh tests` green (the record that the suite was
      green before T1401)._

- [ ] **T1401** — The tokens, the arrival's rules, and the pins.
      `review: per-task`. Pattern: the pause's lights block in
      `src/styles/global.css` (~1767–1836: the `color-mix()` rules, each
      from its own token) and `:root`'s `--pause-depth`; `matte.test.mjs`
      for the test's craft; plan.md's "The stylesheet" is the edit, its
      CSS verbatim. **At the start, before any edit**, on the dev
      server at 1512×982 and 375×812 (Firefox headless via BiDi — the
      recipe and environment note in specs/015-the-hero-mat/tasks.md's
      gate record; clear the quiet state first): on
      `/images/where-the-fog-lets-go/land-b/` and on one portrait frame
      the stage frame's `getBoundingClientRect()`, computed `padding`
      and image height, `<html>`'s and `.image-stage`'s computed
      backgrounds — recorded. `src/styles/global.css`: `:root` gains,
      directly after `--color-quiet`, `--arrival-depth: 0.9`,
      `--arrival-chrome: 1`, `--arrival-fade: 1` and `--color-arrival`
      as plan.md's mix string, with a comment (the arrival, spec 016;
      what each is; the fade read by the head script alone and repeated
      here for the control; the values are the plan's start until the
      gate); the ground comment's last sentence ("the mat reads faintly
      here, and the stage's darker field is its own spec") → the stage
      sits on the arrival's dark since spec 016 (the mat/bg row is the
      no-script page's only); the mat comment's "WHERE IT IS" paragraph:
      the pause frame "until the pause gets a spec of its own" → by the
      rule — worn where the ground is dark: the stage on arrival, the
      quiet view, the pause; `.image-stage` gains
      `background: var(--color-arrival)` as its last declaration with
      the no-script comment; the arrival block appended after the last
      `html[data-quiet]` rule, plan.md's CSS verbatim with its comments
      (the pattern borrowed, the quiet gate, the dimmed set and why
      `.image-body` is not in it, the `transition: none` reason, the
      focus rule). **Nothing inside `.piece-pause` through
      `.piece-pause-frame`, the `html[data-pause-active]` block, the two
      `html[data-quiet] .image-` rules, `.image-frame`, `.image-frame img`,
      or the mat tokens changes by a byte.** `matte.test.mjs`: the header
      comment's "which keeps its mat until the pause gets a spec of its
      own" → by the rule; a new `describe('(d) worn where the ground is
      dark (T1401, spec 016)')` as plan.md's Testing strategy (d) names
      it. `arrival.test.mjs` (new; imports `blocks`, `uncomment`,
      `declarations`, `parseOklch` from `src/lib/ground.ts` and the
      `norm`/`selects`/`ruleFor` helpers copied from `matte.test.mjs`
      with a comment saying so): cases (a) and (b) as Testing strategy
      names them, each named for what would fail; case (c) and the
      `FADE` pin are T1402's and are not written here. _Verify:
      `sh scripts/verify.sh` green, re-run by the orchestrator;
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` lists
      no hunk whose range falls inside `.piece-pause` through
      `.piece-pause-frame`, the `html[data-pause-active]` block, the two
      `html[data-quiet] .image-` rules, `.image-frame` through
      `.image-frame img`, or the `--mat-*`/`--color-matte`/`--color-quiet`/`--pause-depth`
      lines — the ranges' line numbers recorded;
      `git diff main -- 'src/pages/pieces/[slug].astro' src/lib/pause-shape.ts pause-shape.test.mjs remark-pieces-blocks.mjs src/pages/dev/ src/components/DevGround.astro`
      empty; `grep -n "data-arrival" src/styles/global.css` → only lines
      inside the arrival block (listed); then the rendered result on the
      dev server at both viewports: `<html>` still paper;
      `.image-stage`'s computed background equals the test's own
      arithmetic for the mix (L and C linear between `--color-bg` and
      `--color-quiet` at 0.9, hue on the shorter arc, through
      `oklchToRgb255`) within 1/255 — the rgb recorded; the stage
      frame's rect, padding and image height identical to the before
      read; `/dev/matte/stage/`'s four `.image-stage` backgrounds the
      same rgb; the quiet view entered on `land-b` reads `<html>`
      background = `--color-quiet`'s rgb and the stage the same, left
      → paper. Mutations named and reverted, tree restored
      byte-identically: `--arrival-depth: 1` → (a)'s lighter-than-quiet
      case fails; `padding: 1px` added to the arrival's header rule →
      (b)'s allowlist case fails naming it; `:not([data-quiet])` removed
      from the `.image-stage` gate rule → (b)'s gate case fails;
      `--color-arrival` retyped as `oklch(0.279 0.0075 95)` → (a)'s
      string case and (d) fail; `html[data-arrival]:not([data-quiet]) .image-body p`
      added to the muted rule → (b)'s dimmed-set case fails. Where the
      implementer cannot drive a browser it says so, line by line, and
      the Phase 0 pause asks the person to attest those lines._

- [ ] **T1402** — The script, and the no-flash rule. Pattern:
      `src/components/DevGround.astro` (an inline, render-blocking head
      script, bound once with a `window.__…` guard, re-applied at
      `astro:after-swap`) and the piece page's `update()` in
      `src/pages/pieces/[slug].astro` (one read per scroll event, a
      write only on change); plan.md's "The script" is the code,
      verbatim. `src/pages/images/[...id].astro`: a
      `<Fragment slot="head">` inside `<BaseLayout …>` before
      `<article>`, carrying `<script is:inline data-arrival>` with
      plan.md's script and a comment above it (what it is; why inline
      and in the head; the destination rule; the one guard); the
      file's header comment's "the script below is page-level
      enhancement: the compare slider, quiet view, and set selection"
      gains "and, in the head, the arrival (spec 016)". The page's
      module `<script>` and `<style>` are untouched. **First**, read
      Astro's router in `node_modules/astro/dist/transitions/router.js`
      and record the lines where `updateDOM` calls `moveToLocation`
      before triggering `astro:after-swap`, and where the initial
      `history.state` restore and `scrollend` store happen — the plan's
      claim, checked against the installed version (`package.json`
      pins `astro ^7.2.2`; record the resolved version). `arrival.test.mjs`
      gains case (c) — the script extracted from the page's text and run
      with `new Function('window', 'document', 'history', 'location', body)`
      against the stub Testing strategy describes (a small fake in the
      test file: `documentElement` with a recording `style`,
      `clientHeight`, attribute methods; `querySelector` switchable;
      listener registries on `window` and `document`; `scrollY`
      settable) — every case Testing strategy (c) lists, each named for
      what would fail, plus the pin that the script's `FADE` literal
      equals `:root`'s `--arrival-fade`. _Verify: `sh scripts/verify.sh`
      green; `grep -c "data-arrival" "src/pages/images/[...id].astro"`
      → 1; `git diff main -- 'src/pages/images/[...id].astro'` touches
      only the head fragment and the header comment (hunks listed);
      `git diff main -- src/styles/global.css` unchanged since T1401;
      the router lines recorded. Then on the dev server (Firefox
      headless via BiDi) at 1512×982 and 375×812, plan.md's "The
      rendered result, after T1402" in full, each number recorded: at
      y = 0 the lights `1.000` and `<html>`, `body`, `.site-header`
      backgrounds the arrival's rgb within 1/255, `.image-stage`
      transparent, the frame's rect identical to T1401's before read;
      the six chrome colours (brand, a nav link, the frame nav, the
      toggle, the eyebrow, the h1) each their token mixed all the way
      to `--color-quiet`; `<html>`'s `transition-property` `none`; at
      y = vh/2 `0.500` and the ground at the half mix; at y ≥ vh
      `0.000` and every read the pre-spec value; back to 0 `1.000`;
      `scrollTo(0, 2000)` then reload → `0.000` and `scrollY` restored;
      a `script.addPreloadScript` reading `documentElement.clientHeight`
      and `history.state` before any page script → the viewport height
      and the stored state (recorded as the check on the head script's
      two inputs); quiet view from the top → quiet's rgb and the frame
      nav `display: none`; leaving → the arrival's rgb at `scrollY` 0;
      `data-arrival` removed by script → `.image-stage` the arrival's
      rgb and `<html>` paper; a nav link focused at y = 0 →
      `--color-bg`'s rgb; `scrollWidth ≤ clientWidth`; the after-swap
      path — a click from `/galleries/fog-frames/` to a frame → `1.000`
      at page-load; the next link → `1.000`; scroll past vh then
      `traverseHistory(-1)` and forward again → `0.000` at the restored
      position. A flash is not observable headless: said so in the
      record, with the stub case named as the pin and the reload
      mid-page named for the person at the pause. Where the implementer
      cannot drive a browser it says so, line by line._

- [ ] **T1403** — The dev-only tuning control. Pattern:
      `src/components/DevGround.astro` (the head applier: the key, the
      inline properties, the once-guard, after-swap) and
      `src/pages/dev/matte/_sampler.ts` with its `.sampler-banner` rules
      in `src/pages/dev/matte/[...surface].astro` (the served module, the
      bar, the reset that removes every override); plan.md's "The
      dev-only control" is the shape. `src/components/DevArrival.astro`:
      a header comment (dev-only; how it is kept out of the build; the
      key's JSON; that it must precede the arrival script), then
      `<script is:inline data-dev-arrival>` — read `localStorage['dev-arrival']`,
      set `--arrival-depth`, `--arrival-chrome`, `--arrival-fade` inline
      on `<html>` from the stored strings (a malformed key or a missing
      field applies nothing for that field), register `astro:after-swap`
      once (`window.__devArrival`) — then
      `<script is:inline type="module" src="/src/components/dev-arrival.ts">`;
      no markup, no `<style>`. `src/components/dev-arrival.ts`: at
      `astro:page-load`, if `.image-page` exists and no bar exists,
      inject a `<style data-dev-arrival>` (the banner's rules from the
      sampler, fixed bottom-right, `.meta`, hidden under
      `html[data-quiet]`) and build `<aside class="meta" data-dev-arrival-bar>`:
      three labelled `<input type="range">`s with `<output>`s (depth
      0.5–1 step 0.01; chrome 0–1 step 0.01; fade 0.25–2 step 0.05), a
      `lights` readout kept current on `scroll` from `<html>`'s inline
      `--arrival-lights`, a `<code data-dev-arrival-line>` in the exact
      form `--arrival-depth: <d>; --arrival-chrome: <c>; --arrival-fade: <f>`,
      the words "no override — the stylesheet" when no key is stored,
      and a `reset` button. On `input`: set the inline property, write
      the key (three strings), redraw the line, `window.dispatchEvent(new Event('scroll'))`.
      On reset: remove the key and the three inline properties, dispatch
      `scroll`, and seed the inputs from
      `getComputedStyle(document.documentElement).getPropertyValue(...)`
      — the one computed read in the file, for the defaults. On load
      with a key: seed from the key. `src/pages/images/[...id].astro`:
      `import DevArrival from '../../components/DevArrival.astro'` and
      `{import.meta.env.DEV && <DevArrival />}` as the head fragment's
      first child, before the arrival script, with a one-line comment.
      `scripts/check-no-dev-routes.mjs`: `MARKER` → `MARKERS = ['dev-ground', 'dev-arrival']`
      with the header comment's third paragraph (spec 016's control,
      three carriers of the string), the scan over `.html`, `.js` **and
      `.css`**, the failure line naming the marker and the files, the
      success line as plan.md's "Failure messages" gives it. _Verify:
      `sh scripts/verify.sh` green with `87 page(s) built` and the new
      barrier line quoted; `grep -rl "dev-arrival\|dev-ground" dist/`
      empty; `test ! -e dist/dev && echo absent`;
      `grep -c "getComputedStyle" src/components/dev-arrival.ts` → 1;
      `grep -c "is:inline" src/components/DevArrival.astro` → 2;
      `ground.test.mjs` case (h) green over the new component (it
      matches `src/components/Dev*`); `npx prettier --check` clean on
      the three new or edited files. On the dev server at 1512×982:
      the bar renders on `/images/where-the-fog-lets-go/land-b/` and
      not on `/pieces/where-the-fog-lets-go/`; with no key the line
      reads `no override — the stylesheet` and the outputs `0.9 / 1 / 1`;
      `depth` → 0.95 sets the inline property, writes the key
      `{"depth":"0.95","chrome":"1","fade":"1"}`, and `<html>`'s
      background at y = 0 moves to the 0.95 mix within 1/255 (the
      test's arithmetic); `fade` → 0.5 → at y = vh/2 the lights read
      `0.000` and at vh/4 `0.500`; reload keeps all three (the head
      applier: the inline properties present before `astro:page-load`
      — read via a preload script); `/images/<another frame>/` wears
      them; `reset` removes the key and the inline properties, the
      outputs return to `0.9 / 1 / 1` and `<html>` at y = 0 to the 0.9
      mix; under quiet view the bar's `display` is `none`. Where the
      implementer cannot drive a browser it says so, line by line._

- [ ] **T1404** — Two items carried from spec 015's sweep (N6, N9;
      N10 rides T1406). Pattern: the `sizes` comment in
      `src/components/CoverCards.astro` and the `og.jpg` case in
      `ground.test.mjs`. `src/components/CoverCards.astro`: the hint's
      `373px` → `375px` (the 1160px grid's three columns at the
      `.gallery-grid` gap of 18px render 374.667px — spec 015's T1301
      measured −1.667px under; 375 over-delivers by a third of a pixel)
      with a comment giving the arithmetic. `ground.test.mjs`: in the
      copies' describe, a new case "public/og.jpg is 1200×630 — the
      card's size, asserted by nothing before spec 016" reading
      `info.width` and `info.height` from the `sharp` call `beforeAll`
      already makes (keep them in module scope beside `jpegPixel`).
      _Verify: `sh scripts/verify.sh` green; the new case fails against
      a 1199-wide copy (written with `sharp` to a temp path and pointed
      at by a one-line edit, named and reverted); on the dev server at
      1512×982 a cover card on `/galleries/` renders 374.667px against
      the 375px hint → +0.333, recorded; `git diff --stat main` for this
      task touches only the two files._

### Gate record (Phase 0 pause — round 1)

_(The product owner's decision from the image pages under `npm run dev`
on both screens: a landscape and a portrait frame opened from a gallery
and from a piece, scrolled down and back up, the quiet view entered
from the top and left, a reload mid-page, a link to a section, the arrow
keys through a set, the bar's three sliders moved and the line read
off, and the no-script field seen (`/dev/matte/stage/`, or script
disabled). Recorded here by the orchestrator, in the person's words and
the numbers, before T1405 is dispatched: the bar's line verbatim
(`--arrival-depth: <d>; --arrival-chrome: <c>; --arrival-fade: <f>`),
or "the defaults"; whether the header reads dimmed or should go away;
whether the body's words should dim too; anything he saw that the spec
did not say; one line that the pause mid-piece was not looked at, or
what he saw if he did. If he stopped at a value he is not sure of, say
so — Phase 1 is the second look.)_

## Phase 1 — The values landed, and the docs (reviewer after the phase; the person's pause at its end, repeated until done) — walkthrough: the same image pages with the bar reading "no override — the stylesheet": the dark, the chrome and the fade as he chose them on both screens; if he wants another round, the bar is still there and the next landing is one more line below

<!-- T1405 is written to be run once per round: the first round as
T1405, a second as T1405a, a third as T1405b, each a copy of the line
with its round's values and its own tier-log row. Only the last
round's values are the record; the docs (T1406) cite no numbers, so
they run once. The phase review after the first round reviews T1405
and T1406 together; a later round is reviewed with the sweep. -->

- [ ] **T1405** — The gate's values landed (round 1; further rounds
      as T1405a, T1405b, …). Pattern: spec 015's T1303 (a gate's
      numbers typed from the record, never re-read by eye) and `:root`
      in `src/styles/global.css`. From the gate record's line:
      `--arrival-depth`, `--arrival-chrome` and `--arrival-fade` in
      `:root` to the recorded values, token order unchanged, the
      comment's "the plan's start until the gate" replaced by the
      gate's date and round and the values as numbers (the earlier
      round's kept as one line of history from round 2 on); `FADE` in
      the head script of `src/pages/images/[...id].astro` to the same
      fade (the test forbids one without the other). **If the record
      says the header should go away instead of dimming, that is not
      this task**: "away" changes the dimmed set and the no-flash
      arithmetic (a header that moves with the lights is motion, which
      the allowlist forbids; a header that is simply gone at the top is
      the scene rule's `transform: translateY(-100%)` under
      `data-arrival` with the allowlist widened for that one rule) — the
      orchestrator takes it to a decision review at the top tier from
      Plan Mode and logs the outcome as T1405x. If the record says
      the body's words should dim, the muted and text rules gain
      `.image-body :is(p, dt, dd, li)` and `.image-body :is(h2, h3)`
      respectively and `arrival.test.mjs`'s dimmed-set case is updated
      to the new list in the same task; "the defaults" → no edit, the
      record says so. _Verify: `sh scripts/verify.sh` green;
      `arrival.test.mjs`'s `FADE` pin and (a) green against the new
      literals; `grep -rn "arrival-depth: 0.9;\|arrival-chrome: 1;\|arrival-fade: 1;" src/`
      → only the `:root` history line, if the values moved (every hit
      listed); on the dev server with no `dev-arrival` key at 1512×982
      and 375×812, `<html>`'s background at y = 0 = the landed depth's
      mix within 1/255 and the lights at y = vh × fade / 2 read
      `0.500`; `git diff main -- src/styles/global.css` shows no hunk
      inside the pause's block, the quiet rules or the stage's mat
      rules; kept — no edit, `arrival.test.mjs` green is the pin._

- [ ] **T1406** — Docs: `README.md`, `AUTHORING.md`, `design/brief.md`
      (and carried item N10). Pattern: spec 015's T1304 line. `README.md`:
      the block table's `pause` row stays "yes" and footnote ¹ becomes
      "the pause frame's ground is dark while the pause is active, so it
      wears the mat by the rule (spec 016)"; the sentence after the
      table ("Since spec 015 the site mats only the image page's stage
      and the quiet view that grows out of it (a piece's pause frame
      excepted until its own spec): …") → the rule: the mat is worn
      where the ground is dark — the image page's stage on arrival, its
      quiet view, and a piece's pause frame — a flat white field 6% of
      the frame's rendered short side, 4–40px, equal on four sides,
      applied by the site's CSS; every other frame sits bare on the
      ground; the "Current status" line's "the mat rule (the image
      page's stage alone since spec 015, a piece's pause frame excepted
      until its own spec)" → "the mat rule (worn where the ground is
      dark, spec 016)"; the image-page paragraph (~151): "matted on the
      stage — since spec 015 the one matted surface on the site, a
      piece's pause frame excepted until the pause gets its own spec"
      → the arrival in two sentences (the page opens dark with the
      photograph matted and the chrome faint; scrolling gives the page
      back over about a screen and scrolling up takes it again; nothing
      is timed; without script the stage sits in its own dark field);
      the project tree gains `arrival.test.mjs` and the test files it
      omits (`categories`, `gallery-layout`, `gps-barrier`, `ground`,
      `matte`, `og`, `page-head`, `place-page` — check against
      `ls *.test.mjs`), `components/` gains `DevGround.astro` and
      `DevArrival.astro` + `dev-arrival.ts` ("dev-only: the ground
      switch and the arrival's tuning bar; postbuild fails if either
      ships"), and `pages/images/` a clause that the image page carries
      the arrival's head script. `AUTHORING.md` (~599–601): "and since
      spec 015 those are the image page's stage and the quiet view that
      grows out of it — plus the pause frame, until the pause gets a
      spec of its own" → "and those are the frames whose ground is dark:
      the image page's stage on arrival, its quiet view, and the pause
      frame (spec 016)"; nothing else. `design/brief.md`: the Palette
      note's last three sentences ("…on paper the stage's mat stands
      only 1.02:1 off the ground outside the quiet view. That is accepted
      for now; the darker field the stage wants is its own spec
      (`ROADMAP.md`).") → the arrival: the image page opens on a dark
      ground a share of the way to the quiet dark (`--arrival-depth`,
      `--color-arrival`, spec 016), lightening to paper as the reader
      scrolls, so the white mat is seen on a dark wall and never sits on
      paper for long; the carve-out's "Since spec 015 it is worn by the
      image page's stage and the quiet view that grows out of it, and by
      nothing else" and its closing parenthesis → the rule, stated once:
      worn where the ground is dark — the stage on arrival, the quiet
      view, the pause frame — and nowhere else; the compare's fill and
      divider are its own device. Hand-edit the prose (never
      script-rewrap). _Verify: every claim read against the built
      stylesheet and the gate record;
      `grep -n "excepted until its own spec\|until the pause gets\|darker field the stage wants\|reads faintly" README.md AUTHORING.md design/brief.md`
      → 0; `npx prettier --check README.md AUTHORING.md design/brief.md`
      clean; `sh scripts/verify.sh` green._

### Phase 1 record (the person's walkthrough, round by round)

_(Each round: the date, "done" or the next line of values, and anything
seen. A round that changes the values adds a T1405x line above and a
tier-log row; the phase pause repeats. The last entry is the verdict
the docs and the close-out cite.)_

## Phase 2 — Close-out (the documents, the reviewer sweep, then merge) — walkthrough: none — the roadmap and decisions text, the sweep and the merge change nothing the person can try; the arrival was attested at Phase 1

- [ ] **T1407** — Close-out. The repo-wide documents are edited by
      `sdd-implementer-fable` — the close-out row of `CLAUDE.md`'s role
      table — on a bundle (T1406 is the pattern; the bundle carries the
      gate records, plan.md's "Resolved decisions", spec.md's "Decided"
      and "Non-goals", the three ROADMAP entries and the motion entry,
      DECISIONS' "Spec 015" section and its "Ground tone" and "Mattes"
      entries) and **captured as a patch by the orchestrator** rather
      than committed on the branch: after the implementer's edit and
      `npx prettier --check ROADMAP.md DECISIONS.md`, the orchestrator
      runs `git diff -- ROADMAP.md DECISIONS.md > specs/016-the-hero-stage/close-out.patch`,
      then `git checkout -- ROADMAP.md DECISIONS.md`, and commits the
      patch with the close-out bookkeeping (plan.md, Resolved decisions:
      the two documents are not the spec's implementation and reach
      `main` by their own commit after the merge). `ROADMAP.md`: strike
      "The stage's darker field" as done in spec 016 with the hero form
      taken in one clause (the whole page dark on arrival, lightening on
      the reader's scroll; the recorded lean — the stage's own field,
      ending at its edge — became the no-script look); strike "The mat
      only where the ground goes dark" as done in spec 016 (the rule
      stated and pinned; the compare's fill and divider white); annotate
      "The pause, rethought" — kept untouched at spec 016 with the
      photographer's description quoted from spec.md's Non-goals and
      the hero form the stage took, so the pause's rework can borrow it
      back or diverge; "Motion, considered" stands, with one clause that
      the hero stage it names now exists and its ground is the arrival
      token. `DECISIONS.md`: add "Spec 016: the hero stage" in 015's
      shape — the decision in the photographer's words ("taking part of
      the pause elements … when you begin scrolling down, the background
      fades back into the normal ground"; "I like the second one for
      now"), the mat rule in its final form and where it is pinned, the
      pause kept with his words, the mechanism borrowed and where it
      differs (the head script and the destination rule; the quiet
      gate; the fade in viewport heights), the depth model and the
      proposed start against the landed values from the gate records
      (every round, the last as the record), the "dimmed, not away"
      lean confirmed or reversed, the no-script look, the dev control
      kept for the next round; annotate "Ground tone: warmed so the
      mattes read" (its last two sentences: the stage's field is spec
      016's, the faint mat on paper is the no-script page's only) and
      "Mattes: site-applied, never baked into files" (the where, in its
      final form: where the ground is dark) with one clause each; the
      "Spec 015" section's two deferral paragraphs ("The pause is
      deferred wholesale…", "The stage's darker field is deferred…")
      annotated with one clause each, not rewritten. Hand-edited prose
      (`npx prettier --check` clean; grep for lines beginning with a
      CSS `>` or `+` before any format run). Then, the orchestrator's
      part: the pre-merge whole-spec sweep at the reviewer's default
      tier on the documents, the patch and `git diff main...HEAD`, its
      findings resolved; the acceptance criteria checked against their
      records (AC 1, 2 by T1402's reads and the gate records; AC 3 by
      `arrival.test.mjs` (a) and T1402's quiet reads; AC 4 by T1403's
      barrier line and reads; AC 5 by the stub case and the person's
      reload at the gate; AC 6 by T1401's no-attribute read and the
      sampler; AC 7 by `matte.test.mjs` (d); AC 8 by T1401/T1402's rect
      reads and (b)'s allowlist; AC 9 by the empty diffs; AC 10 by
      T1402's focus read and (b)'s allowlist; AC 11 by T1405's record
      and the DECISIONS entry; AC 12 by T1406's greps and the patch; AC
      13 by the final run); build, tests, check, GPS scan, dev-routes
      scan, and format green with actual output; the PR marked ready
      and merged with a merge commit; **then on `main`**:
      `git apply specs/016-the-hero-stage/close-out.patch`,
      `npx prettier --check ROADMAP.md DECISIONS.md`, and one commit
      ("Spec 016 close-out: roadmap and decisions"), pushed; a failed
      apply (roadmap grooming on `main` meanwhile) is dispatched to the
      `sdd-implementer` as a re-draft on `main`, not merged by hand;
      the close-out box ticked in the same shell command as the merge
      bookkeeping. _Verify: the implementer's `sh scripts/verify.sh`
      green with the documents edited; `git apply --check` of the patch
      on the branch before it is committed;
      `grep -rn "excepted until its own spec\|until the pause gets\|darker field the stage wants\|reads faintly\|interim state" CLAUDE.md README.md AUTHORING.md design/brief.md`
      → 0, and the same grep over the patched `ROADMAP.md` and
      `DECISIONS.md` → only lines that are history or annotated as done
      (every hit listed); `git diff main -- specs/015-the-hero-mat/`
      empty; `main` green after the merge and after the patch commit._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the close-out
patch, the final verification, and `git diff main...HEAD`. Blocking
findings fixed and re-reviewed once; anything open after goes to the
tier log below.

## Tier log (the second spec under the settled standard profile)

> **The standard profile**, as `CLAUDE.md`'s role table fixes it: the
> session on `claude-fable-5-1` at medium effort; the planner, the
> plan/tasks sign-off and any decision review at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> task implementation and the per-phase reviews and sweep at `opus`;
> close-out at the top tier's model at medium (`sdd-implementer-fable`).
> Baselines — spec 015 (the first under the settled profile): planner
> 291,534 + 24,466 resumed; sign-off 184,475 + re-review 16,984;
> implementer ≈741k over 8 dispatches (T1301 209,163 the largest;
> close-out on the top tier at medium 78,551); reviewer ≈533k over 5
> invocations; no tier miss, no fallback. Spec 014 (Phase 0 only):
> planner 166,322 + 54,636; sign-off 125,254 + 28,042; implementer
> ≈402k over 4 tasks plus fixes; reviewer ≈286k over 3 invocations.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). One row per gate round for T1405x. -->

| Task / invocation                          | Tier                           | Tokens | Outcome / miss reason                |
| ------------------------------------------ | ------------------------------ | ------ | ------------------------------------ |
| Planning: draft (`sdd-planner`)            | top (`claude-fable-5-1`, high) | —      | drafted; no product question returned |
| Sign-off: plan/tasks (`skeptical-reviewer`) | top (`claude-fable-5-1`, high) | —      |                                      |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- The theme's 180ms `color` transition on links runs behind the
  scroll on the dimmed nav, frame nav and eyebrow links (plan.md,
  Known limitations) — as the pause's links have since spec 007; the
  gate may name it.
- `.image-body` is outside the dimmed set by the plan's reading of the
  spec's list; the gate may add it (T1405 carries the edit).
- The sampler's stage section now renders on the arrival's dark with
  no script — by construction, files untouched; the sweep confirms
  `git diff main -- src/pages/dev/` is empty.
- The two documents drafted as a patch (`close-out.patch`) rather than
  committed on the branch, per the dispatcher's instruction; the
  sweep reads the patch.

## Handoff note

Nothing is implemented; the next session begins at **T1400** (Phase 0)
as the orchestrator under the model policy's standard profile and its
role table: it opens on `claude-fable-5-1` at medium effort from
`.claude/settings.json` (`/effort status` to confirm); it dispatches
the `sdd-implementer` one task at a time at `opus` and the
`skeptical-reviewer` per phase at `opus`, re-running
`sh scripts/verify.sh` itself for **T1401** (`review: per-task`); a
design question it cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle from Plan
Mode. **T1400 is the constitution's amendment and is committed on its
own before T1401 is dispatched.** The **Phase 0 pause is the visual
gate, round 1**: the image pages under `npm run dev` on both screens
(a landscape and a portrait frame, opened from a gallery and from a
piece), what to try (scroll down and up; the quiet view from the top;
a reload mid-page; a link to a section; the arrow keys; the
bottom-right bar's three sliders and the line beneath them; the
no-script field at `/dev/matte/stage/`), that the bar's values follow
him across image pages until `reset`, and the questions — the three
numbers as the bar's line, or "the defaults"; whether the dimmed header
should instead go away; whether the words below the title should dim
too — go to the person in plain language; the values are not in the
plan. The orchestrator does no browser or device checks itself. The
**Phase 1 pause** is the second look with nothing stored, and it
repeats: another round is one more T1405x line and one more pause,
until he says done. Phase 2 has no pause of its own; the merge report
carries the continuation prompt for the next spec on `ROADMAP.md`.

> Read `CLAUDE.md` and `specs/016-the-hero-stage/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's standard profile and its role table (`/effort status`
> first; medium is right for this session): triage; dispatch each
> routine task to the `sdd-implementer` on a task bundle assembled with
> shell (the task line, the plan sections, the acceptance criteria, the
> files, the pattern file, any recorded gate value), telling it not to
> read plan.md, spec.md, or tasks.md in full; commit T1400 on its own
> before anything else; take the verification from the implementer's
> verbatim `sh scripts/verify.sh` output, except T1401, which you
> re-run yourself before committing (`review: per-task`); do no browser
> or device checks by hand — the implementer measures and records, the
> person attests the rest; stage, then bundle the diff for the
> `skeptical-reviewer` per phase (and once for T1401 on its own), one
> review and at most one re-review, the rest logged; commit, check the
> box, and log the tier and tokens in one shell command. Involvement
> level is product owner: pause after each phase — the Phase 0 pause is
> the gate's first round, and its report carries the pages to walk,
> what to try, the bar and its line, and the three questions in plain
> language; the Phase 1 pause is the second look and repeats (a new
> T1405x line per round) until he says done — and whenever something
> unexpected bears on spec adherence; the same session continues after
> each pause when the person says so, and if the person stops at a
> pause, end the report with the continuation prompt for a fresh
> session.

Every pause produces a report in this shape, in this order, in plain
language (no task ids, agent names, or tier names):

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
