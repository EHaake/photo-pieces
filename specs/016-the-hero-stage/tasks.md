# Tasks: The hero stage

**Status**: Signed off (2026-09-20) — by the `skeptical-reviewer` at
the top tier; two blocking findings fixed and cleared on the one
re-review, nine notes folded in, and one item the re-review carried (O1
in the tier log) transcribed from its exact text into T1402 and
plan.md.
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
resolved in the session. The sweep runs on the documents plus
`git diff main...HEAD`. The orchestrator never
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

- [x] **T1400** — The constitution first. `CLAUDE.md`'s block-vocabulary
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

- [x] **T1401** — The tokens, the arrival's rules, and the pins.
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
      added to the muted rule → (b)'s dimmed-set case fails;
      `.site-header .site-nav a[aria-current='page']` dropped from the
      focus rule's `:is()` → (b)'s focus case fails; the h1 rule's
      `var(--color-text)` changed to `var(--color-muted)` → (b)'s
      source-string case fails naming the rule. Where the
      implementer cannot drive a browser it says so, line by line, and
      the Phase 0 pause asks the person to attest those lines._

_T1401 record (2026-09-20, implementer at opus; per-task review at opus, one re-review):_ orchestrator's re-run of `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/; no dev-ground marker in 97 files.`, `BUILD EXIT 0`, `CHECK EXIT 0`, `Test Files 16 passed (16)`, `Tests 347 passed (347)`, `TEST EXIT 0` (335 on main + 12 in `arrival.test.mjs`... 347 total with matte's four (d) cases). Before-read (Firefox 155 headless via BiDi, dev server, quiet state cleared; `<html>` [252,252,250] paper everywhere, `.image-stage` transparent): land-b 1512×982 stage rect x0 y75.8 1497×906 pad 29.45/32, frame x168.5 y128.93 1160×799.72 pad 40, img h 719.72; port-a 1512 frame x455.67 y105.25 585.65×847.08 pad 31.3886, img h 784.32; land-b 375×812 stage x0 y136.4 360×676 pad 24.35/16, frame x16 y360.75 328×227.28 pad 12.7037, img h 201.88; port-a 375 frame x16 y237.58 328×473.63 pad 18.375, img h 436.9; sampler stage frame x168.5 y227 1160×799.72 pad 40. After: `<html>` still paper; `.image-stage` computed `oklch(0.279 0.0075 95.5)` → [42,41,37] = the test's arithmetic exactly (0/255); every rect, padding and image height identical to before on all five reads; the sampler's four stages [42,41,37]; quiet view on land-b: `<html>`, `body`, stage [23,22,18] = `--color-quiet`; left → `<html>` paper, stage [42,41,37]. Hunks against main: -22,3 / -61 / -63 (comments), -96,0 +101,23 (tokens after `--color-quiet`), -1855,5 (the Mattes-section comment's third "until the pause gets a spec" — reworded too, reported as a deviation), -2089,0 (the stage's background), -2155,0 +2185,110 (the arrival block); protected regions `.piece-pause`→`.piece-pause-frame` 1672–1765, `html[data-pause-active]` 1778–1836, `.image-frame` 2095–2114, `.image-frame img` 2116–2122, the two `html[data-quiet] .image-` rules 2140–2155, form W 1922–1928 and the six token lines extracted from both revisions and identical. The named diff over the pieces page, pause-shape, the transform, `src/pages/dev/`, `DevGround.astro` empty; `data-arrival` in global.css only inside the block. All seven named mutations fail their named cases (quoted in the review bundle), tree restored by checksum. Review B-1: the eyebrow's link was in the dimmed set but not the focus rule's `:is()` (AC 10) — the plan's CSS amended (focus rule and specificity paragraph, dated), the rule, the pinned prelude and the mutation added; N-3 the one-source case now counts declaring blocks (`[':root']` exactly — a second `:root`, plain or in a media query, fails it; the file has one at 389); N-4 matte (d)'s duplicate exact-string pin dropped, `toContain` kept; N-6 the third `ruleFor` argument is a real disambiguator, kept. Findings: `--header-h` is 76px at 1512 and 136px at 375 (the nav wraps), so the phone's dark field is 676 of 812px; one BiDi session per Firefox process (kill port 9222 first); Firefox serialises the mix in oklch — canvas round-trip for rgb.

- [x] **T1402** — The script, and the no-flash rule. Pattern:
      `src/components/DevGround.astro` (an inline, render-blocking head
      script, bound once with a `window.__…` guard, re-applied at
      `astro:after-swap`) and the piece page's `update()` in
      `src/pages/pieces/[slug].astro` (one read per scroll event, a
      write only on change); plan.md's "The script" is the code,
      verbatim. `src/pages/images/[...id].astro`: a
      `<Fragment slot="head">` inside `<BaseLayout …>` before
      `<article>`, carrying `<script is:inline data-arrival>` with
      plan.md's script and a comment above it (what it is; why inline
      and in the head; the destination rule; the one guard — **the
      comment spells the attribute as "the arrival attribute", never
      the literal `data-arrival`**, so the Verify grep below counts
      the tag alone); the file's header comment's "the script below is
      page-level enhancement: the compare slider, quiet view, and set
      selection" gains "and, in the head, the arrival (spec 016)". The
      page's module `<script>` and `<style>` are untouched. **First**,
      read Astro's router in `node_modules/astro/dist/transitions/router.js`
      and record the lines where `updateDOM` calls `moveToLocation`
      before triggering `astro:after-swap`, where `runScripts()` sits
      relative to that event (after it, on `updateCallbackDone.finally`
      — the path the script's first client-side run takes, its
      head-time branch seeing the just-pushed `history.state`), and
      where the initial `history.state` restore and the `scrollend`
      store happen — the plan's claims, checked against the installed
      version (`package.json` pins `astro ^7.2.2`; record the resolved
      version). `arrival.test.mjs`
      gains case (c) — the script extracted from the page's text and run
      with `new Function('window', 'document', 'history', 'location', body)`
      against the stub Testing strategy describes (a small fake in the
      test file: `documentElement` with a recording `style`,
      `clientHeight`, attribute methods; `querySelector` switchable;
      listener registries on `window` and `document`; `scrollY`
      settable) — every case Testing strategy (c) lists, the router's
      fresh entry (`history.state = { scrollY: 0 }`, no hash → `1.000`)
      among them, each named for what would fail, plus the pin that the
      script's `FADE` literal equals `:root`'s `--arrival-fade`.
      _Verify: `sh scripts/verify.sh` green;
      `grep -c '<script is:inline data-arrival>' "src/pages/images/[...id].astro"`
      → 1 and `grep -c "data-arrival" "src/pages/images/[...id].astro"`
      → 2 — the tag and the script's own `hasAttribute`/`setAttribute`
      line, which is plan.md's verbatim code (the count was written as
      1 at sign-off and corrected by the orchestrator at T1402; the
      comment avoids the literal; T1403's comment must too);
      `git diff main -- 'src/pages/images/[...id].astro'` touches
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
      to `--color-quiet`; `<html>`'s `transition-property` `none` and
      a nav link's `background-size`; at y = vh/2 `0.500`, the ground
      at the half mix, **and a nav link (muted) and the h1 (text) each
      at its own token's half mix within 1/255** — the two differ
      here, so a rule mixing from the wrong token shows, which the
      lights-1 reads cannot; at y ≥ vh `0.000` and every read the
      pre-spec value **within 1/255**; back to 0 `1.000`;
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
      at page-load and, right after `astro:page-load`,
      `document.getAnimations().filter((a) => a instanceof CSSTransition
      && a.transitionProperty === 'color')` empty, and empty again after
      one `scrollBy(0, 40)` at the top (no link colour easing on arrival
      or behind the scroll — the transition rule; the unfiltered list is
      non-empty on a correct page: the stage's own 220ms ease and Astro's
      root fade are running at that moment, O1 in the tier log); the
      next link → `1.000`; scroll past vh then
      `traverseHistory(-1)` and forward again → `0.000` at the restored
      position. A flash is not observable headless: said so in the
      record, with the stub case named as the pin and the reload
      mid-page named for the person at the pause. Where the implementer
      cannot drive a browser it says so, line by line._

_T1402 record (2026-09-20, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, both barrier lines, `BUILD EXIT 0`, `CHECK EXIT 0`, `Test Files 16 passed (16)`, `Tests 363 passed (363)`, `TEST EXIT 0` (347 + 16 in (c) with the `FADE` pin). Router (Astro 7.2.2): initial `history.state` restore 35–40; `runScripts` defined 72, called 351 inside `updateCallbackDone.finally` (350); `moveToLocation` 102, `pushState({…scrollX: 0, scrollY: 0})` 121–125, traversal `scrollTo` 132–135; `updateDOM` calls `moveToLocation` at 207 and `triggerEvent("astro:after-swap")` at 208; `onScrollEnd` 405–409 (`updateScrollPosition` from `events.js`), `scrollend` listener 415. Page diff: two hunks (the header comment at 14; the head fragment at 220–288); `git diff main -- src/styles/global.css` md5 unchanged from T1401. Reads (Firefox 155 BiDi, 1512×982 and 375×812, every colour exact): y = 0 lights `1.000`, `<html>`/`body`/`.site-header` [42,41,37], stage transparent, frame rects byte-identical to T1401's before reads, the seven chrome reads [23,22,18], `<html>` `transition-property` none, nav link transition `background-size` only; y = vh/2 lights `0.500`, ground [139,138,135], nav link [53,60,58] (muted's half) vs h1 [24,29,27] (text's half), eyebrow [30,46,26], hairline [112,111,107]; y = 1.5vh `0.000` and every read the pre-spec token exactly; back to 0 `1.000`; `scrollTo(0,2000)` + reload → `0.000` at 1996/1936. `addPreloadScript` never executed in this Firefox (four forms tried) — replaced by polling during load: restored to 491 the first catch at `readyState interactive` reads lights `0.500` with `scrollY` still 0 and `history.state.scrollY` 491; to 246 → `0.843` (the destination rule observed directly). Quiet from the top → [23,22,18], frame nav `display: none`; left → [42,41,37] at 0. Attribute removed → stage [42,41,37], `<html>` paper. Focused nav link at 0 → [252,252,250]. `scrollWidth ≤ clientWidth` 1497/360. Router path from `/galleries/fog-frames/`: first arrival `1.000` at page-load (after-swap sees a clean root — `runScripts` runs after 208, as read); filtered `getAnimations` (CSSTransition on `color`) empty right after page-load and after `scrollBy(0,40)` (unfiltered 6: the stage's background-color ease + Astro's five root animations — O1 confirmed); next link `1.000`; scroll to 1.5vh, back, forward → `0.000` at 1469/1154. (c): 16 cases; mutations — `restored` → `window.scrollY` fails cases 3 and 5; `FADE = 2` fails 7 incl. the pin; once-guard removed fails 15; `last = ''` removed fails 12; `setAttribute` line removed fails 1–4 and 12; page-load listener removed fails 14–15; tree restored by md5. Deviations: the Verify grep count (above, corrected); case 14 (`astro:page-load` corrects from real `scrollY`) added beyond the strategy's list because that listener was otherwise untested; the preload-script check substituted as recorded. Findings: N-1's route is not reachable — entering quiet view scrolls to 0, so leaving happens at lights 1 (`<html>` snaps in 20ms, the stage eases 220ms); re-review note 2 confirmed and visible — a traversal restored to vh/2 fires after-swap with lights `0.500` and the stage's background-color ease already running (alpha 0.73 at +80ms, transparent by +480ms); the phone clean on every read; N-2 now true. A flash is not observable headless: the stub is the pin; the person reloads land-b halfway down the first screen at the pause.

- [x] **T1403** — The dev-only tuning control. Pattern:
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
      0.5–**0.99** step 0.01; chrome **0.01**–1 step 0.01; fade 0.25–2
      step 0.05 — the depth's ceiling and the chrome's floor are the
      open ends `arrival.test.mjs` (a) rejects, so the bar cannot offer
      a value the landing would refuse), a
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
      first child, before the arrival script, with a one-line comment
      that does not spell the literal `data-arrival` (T1402's grep
      counts it).
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
      `ground.test.mjs` case (h) green over the new component (its
      fixture filter at ~385 matches `src/components/Dev*`) — **print
      what (h) enumerates** (a `console.log` of `fixtures().map(([p]) => p)`
      run once and removed, or the list read off a deliberate failure)
      so `src/components/DevArrival.astro` is seen in it, recorded;
      `grep -c "data-arrival" "src/pages/images/[...id].astro"` still
      → 2 (T1402's corrected count); `npx prettier --check` clean on
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

_T1403 record (2026-09-20, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/; no dev-ground or dev-arrival marker in 102 files.` (the `.css` files now scanned), `BUILD EXIT 0`, `CHECK EXIT 0`, `Test Files 16 passed (16)`, `Tests 363 passed (363)`, `TEST EXIT 0`. `grep -rl "dev-arrival\|dev-ground" dist/` empty; `dist/dev` absent; `getComputedStyle` in `dev-arrival.ts` 1; `is:inline` in `DevArrival.astro` 2; `data-arrival` on the page 2; prettier clean on the five files. (h) enumerates `src/components/DevArrival.astro`, `src/components/DevGround.astro`, and the four `src/pages/dev/` routes. Negative control: the marker planted in `dist/_astro/BaseLayout.*.css` → `[check-no-dev-routes] a dev-only marker shipped (dev-arrival): dist/_astro/BaseLayout.BS6OSPyR.css`, exit 1; restored, green. Dev server (Firefox 155 BiDi, 1512×982): bar on land-b, none on the piece page; no key → `no override — the stylesheet`, outputs 0.9 / 1 / 1, `<html>` [42,41,37]; depth 0.95 → inline property, key `{"depth":"0.95","chrome":"1","fade":"1"}`, the line verbatim, `<html>` [32,31,27] = the 0.95 mix exactly; fade 0.5 → lights `0.000` at vh/2 and `0.502` at vh/4 (Firefox clamps `scrollTo` to 245 of 245.5 — the script's arithmetic at 245); reload keeps all three, inline before `astro:page-load` (the during-load poll); land-c by client-side navigation wears them; reset → key null, inline gone, 0.9 / 1 / 1, [42,41,37]; quiet view → bar `display: none`. Deviations: `page-head.test.mjs`'s two pinned barrier strings updated to the new wording (the task changes the messages; the assertions still fail on regression); `const CSS` → `BAR_CSS` (`astro check` ts(2451), a DOM global). Findings: `arrival.test.mjs` (a)'s exemption is `src/components/Dev*` case-sensitively, so the lowercase served module is not exempt — it builds the pasteable line from a `KNOBS` array and never writes `--arrival-depth:` as source text (noted beside `KNOBS`); mid-session only the moved knob is inline while the key holds three (a reload materialises all three); the bar is fixed bottom-right with no small-screen rule and will cover the frame nav on the phone (plan.md's known limitation; the person judges).

- [x] **T1404** — Two items carried from spec 015's sweep (N6, N9;
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

_T1404 record (2026-09-20, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, both barrier lines, `BUILD EXIT 0`, `CHECK EXIT 0`, `Test Files 16 passed (16)`, `Tests 364 passed (364)`, `TEST EXIT 0`; prettier clean on both files. Mutation: a 1199×630 copy written with sharp to the scratchpad and pointed at by the `beforeAll` line → only the new case fails, `expected [ 1199, 630 ] to deeply equal [ 1200, 630 ]` (the background-pixel case passes against the mutant — "asserted by nothing before spec 016" holds); reverted, sha256 restored, `public/og.jpg` untouched. Dev server (Firefox 155 BiDi, 1512×982, `/galleries/`): `.gallery-cards` 1160px, `grid-template-columns` 374.667 ×3, `column-gap` 18px, the first three cards' `li`/link/`img` 374.667; `sizes` reads back `(min-width: 1160px) 375px, (min-width: 720px) 47vw, 94vw`; hint − rendered = +0.333. Footprint: the two files only. Findings: the 18px gap is `calc(var(--baseline) * 0.75)` with `--baseline: 1.5rem` — the comment names both forms; `CoverCards.astro` had no `sizes` comment before, so the convention followed is the image page's.

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
      entries) and committed by the orchestrator on the branch in their
      own commit(s), exactly as spec 015's T1305 (commit 67ebbe8) did —
      they implement AC 11 and AC 12 and merge with the PR; the sweep,
      the merge, and the bookkeeping are the orchestrator's own part,
      as CLAUDE.md assigns them. `ROADMAP.md`: strike
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
      tier on the documents and `git diff main...HEAD`, its
      findings resolved; the acceptance criteria checked against their
      records (AC 1, 2 by T1402's reads and the gate records; AC 3 by
      `arrival.test.mjs` (a) and T1402's quiet reads; AC 4 by T1403's
      barrier line and reads; AC 5 by the stub case and the person's
      reload at the gate; AC 6 by T1401's no-attribute read and the
      sampler; AC 7 by `matte.test.mjs` (d); AC 8 by T1401/T1402's rect
      reads and (b)'s allowlist; AC 9 by the empty diffs; AC 10 by
      T1402's focus read and (b)'s allowlist; AC 11 by T1405's record
      and the DECISIONS entry; AC 12 by T1406's greps and this task's;
      AC 13 by the final run); build, tests, check, GPS scan, dev-routes
      scan, and format green with actual output; the PR marked ready
      and merged with a merge commit; the close-out box ticked in the
      same shell command as the merge bookkeeping. _Verify: the
      implementer's `sh scripts/verify.sh` green with the documents
      edited;
      `grep -rn "excepted until its own spec\|until the pause gets\|darker field the stage wants\|reads faintly\|interim state" CLAUDE.md README.md AUTHORING.md design/brief.md`
      → 0, and the same grep over `ROADMAP.md` and `DECISIONS.md` →
      only lines that are history or annotated as done (every hit
      listed); `git diff main -- specs/015-the-hero-mat/` empty;
      `main` green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking
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
| Planning: draft (`sdd-planner`)            | top (`claude-fable-5-1`, high) | 282,633 | drafted; no product question returned; ≈170k context at return |
| Planning: revision (`sdd-planner`, resumed) | top (`claude-fable-5-1`, high) | 30,669 | B1, B2 fixed; N1–N3, N5–N8, N11 folded; N4, N9, N10 left |
| Sign-off: plan/tasks (`skeptical-reviewer`) | top (`claude-fable-5-1`, high) | 124,686 | BLOCK — B1 (close-out patch flow, the dispatcher's own wrong instruction), B2 (aria-current split by source order); N1–N11 |
| Sign-off: re-review (`skeptical-reviewer`, resumed) | top (`claude-fable-5-1`, high) | 23,108 | B1, B2 cleared; O1 carried and transcribed; two notes below |
| T1400 (`sdd-implementer`)                  | implementation (`opus`, high)  | 23,747 | done first dispatch; 331 tests green before T1401; CLAUDE.md prettier-clean at head |
| T1401 (`sdd-implementer`)                  | implementation (`opus`, high)  | 138,181 | done first dispatch; BiDi before/after identical; seven mutations |
| T1401 fix (`sdd-implementer`)              | implementation (`opus`, high)  | 58,830 | B-1, N-3, N-4 fixed; N-6 reported |
| T1401 per-task review (`skeptical-reviewer`) | implementation (`opus`, high) | 80,999 | BLOCK — B-1 (eyebrow link outside the focus rule, AC 10); N-1–N-8 |
| T1401 re-review (`skeptical-reviewer`)     | implementation (`opus`, high)  | 27,764 | PASS; three second-look notes below |
| T1402 (`sdd-implementer`)                  | implementation (`opus`, high)  | 140,703 | done first dispatch; Verify grep count corrected 1 → 2 (the plan's script names the attribute); preload-script check substituted |
| T1403 (`sdd-implementer`)                  | implementation (`opus`, high)  | 86,328 | done first dispatch; page-head.test.mjs's barrier strings updated (outside the named footprint, reported) |
| T1404 (`sdd-implementer`)                  | implementation (`opus`, high)  | 42,407 | done first dispatch; +0.333 over-delivery recorded |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- **From T1401's per-task review (2026-09-20), non-blocking, carried:**
  N-1 `transition: none` holds at every lights value, so leaving quiet
  view at lights 0 snaps the ground to paper where the pre-spec page
  eased 220ms (entering is fine; the stage's own ease covers leaving
  only while the stage is on screen) — look at the gate under T1402;
  N-2 `:root`'s `--arrival-fade` comment says arrival.test.mjs pins it
  equal to `FADE` — true only once T1402 writes the pin (named in
  T1402's bundle); N-5 matte (d)'s "whole set of dark grounds" is
  scoped to global.css (the quiet view's page-wide dark lives in the
  page's scoped style); N-7 six helpers are now copied between the two
  test files — a third reader lifts them into a module; N-8 the ground
  comment's "the mat/bg row is the no-script page's only" is the
  steady state (during the fade the pair recurs transiently). From
  the re-review: the exact `--color-arrival` string is pinned in
  arrival (a) alone and matte (d)'s comment says so (prose
  dependency); dropping the eyebrow from the focus rule fails two (b)
  cases, so those two are not independent; the one-source case's
  `[':root']` is spelling-sensitive (`:root, html` would fail it).
  For T1402 (the reviewer's inherit notes): the script must set
  `data-arrival` even at a restored position (without it the stage's
  base rule paints the dark field — AC 5's "dark frame first"), and
  must write the attribute and the lights value in one synchronous
  head step (the lights fallback is 0 and the gated stage is
  transparent, so attribute-first paints light then snaps dark).
- **O1** (from the sign-off's re-review, 2026-09-20; transcribed at
  once, the review cap reached): T1402's "`document.getAnimations()`
  empty right after `astro:page-load`" would fail on a correct page —
  the stage's 220ms `background-color` ease from `--color-arrival` to
  transparent and Astro's root fade are both running then. Replaced in
  T1402 and plan.md with the filtered read (`CSSTransition` on `color`)
  right after page-load and again after one `scrollBy(0, 40)` at the
  top. The sweep confirms the criterion as written is the one the
  implementer ran.
- **The hover-colour loss is page-wide on image pages under script,
  not "at the top"** (re-review note 1): `data-arrival` stays on
  `<html>` at every scroll position, so the arrival colour rules
  outrank the theme's hover rule at lights 0 too — the nav, frame-nav
  and eyebrow links never change colour on hover on an image page. A
  small divergence from AC 2's "exactly the pre-spec page" that no
  Verify reads. The Known-limitations wording should say "on an image
  page while the arrival attribute is present"; if the gate minds, the
  one-rule remedy is an arrival `:hover` rule mixing from
  `--color-accent-hover` (`color` is allowlisted). T1405 carries the
  wording and, if asked, the rule.
- **The stage's 220ms ease fires on router arrivals** (re-review note
  2): the same style flush makes `.image-stage` ease from
  `--color-arrival` to transparent on every client-side arrival —
  invisible at lights 1, but on a traversal restored to a position
  inside the fade the partly visible stage fades from full dark over
  220ms, timed motion in a corner. Not a block. The clean remedy is to
  set the attribute and lights on `event.newDocument.documentElement`
  at `astro:before-swap`, so the new DOM's first style carries them —
  a plan change for a decision review if the person sees it at the
  gate, not something to improvise in T1402.
- The dimmed links keep the theme's underline ease and lose its
  colour ease (the transition rule), and do not change colour on
  hover at the top by specificity (plan.md, Known limitations); the
  gate may name either.
- `.image-body` is outside the dimmed set by the plan's reading of the
  spec's list; the gate may add it (T1405 carries the edit).
- The sampler's stage section now renders on the arrival's dark with
  no script — by construction, files untouched; the sweep confirms
  `git diff main -- src/pages/dev/` is empty.

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
