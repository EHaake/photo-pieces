# Plan: The hero stage

**Status**: Signed off (2026-09-20) — by the `skeptical-reviewer` at
the top tier; two blocking findings fixed and cleared on the one
re-review, nine notes folded in, and one item the re-review carried (O1
in tasks.md's tier log) transcribed from its exact text into T1402 and
"The rendered result".
**Implements**: spec.md in this directory

## Shape of the change

The image page gets one new page state, the arrival, and everything
else is the pause's mechanism borrowed as a pattern: a number on
`<html>` written by a scroll listener, and a block of `color-mix()`
rules that mix each token toward the dark by that number. Nothing is
timed, nothing moves, no layout property changes. Three knobs, two
new stylesheet tokens and one derived colour, one inline head script,
one dev-only control, one test file, and the mat rule restated and
pinned. No schema, transform, registry or plugin change; no new
dependency; the pause's markup, CSS and script byte-identical.

- **The state, and where it lives.** `<html data-arrival style="--arrival-lights: <0..1>">`
  on an image page with script — `data-arrival` says the page-wide
  rules apply, `--arrival-lights` says how far down the lights are
  (1 at the top, 0 once the stage has scrolled off). Both are the
  script's; the server renders neither, so a page without script is a
  page without them, and the no-script look is what the stylesheet
  says with no attribute on `<html>`. The router replaces `<html>`'s
  attributes on every navigation (the quiet view and spec 014's switch
  re-apply theirs at `astro:after-swap` for the same reason), so the
  script re-applies at after-swap and removes nothing by hand.

- **The tokens** (`:root` in `src/styles/global.css`, beside
  `--color-quiet`):

  | token              | start | what it is                                                                                                                                                                                          |
  | ------------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `--arrival-depth`  | `0.9` | the ground's share of the way from `--color-bg` to `--color-quiet` at full lights — the pause's `--pause-depth` model (0.85 there)                                                                   |
  | `--arrival-chrome` | `1`   | the dimmed chrome's share of the way from its own token to `--color-quiet`, scaled by the lights — the pause's rule for words is all the way (1), the spec's starting value                          |
  | `--arrival-fade`   | `1`   | the fade's length in viewport heights; **read by nothing in CSS** — it is the head script's `FADE` constant written a second time so the dev control can show the default, and the test pins the two equal |
  | `--color-arrival`  | —     | `color-mix(in oklch, var(--color-bg), var(--color-quiet) calc(var(--arrival-depth) * 100%))` — the arrival's dark, defined once, read by the no-script field and by the page mix                          |

  **Why 0.9, and what it computes to.** The spec asks for a start
  between the pause's dimmed ground and the quiet dark. In oklch the
  mix is linear in L: the ground is L 0.99, the quiet dark L 0.2, so
  the pause's ground at full lights sits at L ≈ 0.319 and depth 0.9
  gives the arrival L ≈ 0.279 (≈ `oklch(0.279 0.0075 95)`). That is
  0.079 above the quiet dark — a legible step, so entering quiet view
  still goes somewhere — and 0.04 below the pause's ground, so the
  hero reads as a wall rather than as a pause. The midpoint of the
  range (0.925) would put the dimmed words 0.06 off the wall; 0.9
  gives them 0.079 (below), a hair more readable, which matters
  because the header is the reader's way back. The gate sets it.

  **What the chrome knob does, so the gate is not surprised.** Each
  dimmed element mixes from *its own* token toward `--color-quiet` by
  `lights × chrome` (the pause's rule, so at lights 0 every element is
  exactly its unmixed colour and nothing snaps when the state appears).
  The muted-coloured chrome (nav links, frame nav, toggle) starts at
  L 0.5 and ends at 0.2; the text-coloured chrome (the brand, the
  title) starts at 0.25 and ends at 0.2. On a wall at depth _d_ the
  muted chrome crosses the wall's lightness at chrome ≈ (0.79·_d_ −
  0.49) / 0.3 — 0.74 at depth 0.9 — sitting lighter than the wall
  below that and darker above it; the text-coloured chrome (L 0.25 →
  0.2) is darker than the wall at every chrome value while _d_ < 0.937
  (the wall is above 0.25 there — at 0.9 it is 0.279, so the text sits
  0.03 below it at chrome 0 and 0.08 below at chrome 1), and from
  _d_ ≥ 0.94 the wall is the darker one at low chrome and the text
  crosses it on the way down. This is the pause's own arithmetic
  (its words end 0.12 below its ground); it is stated so the
  photographer can read the slider. If "dimmed" reads as broken at
  the gate, "away" is one rule — the scene rule's `transform:
  translateY(-100%)` on the header under `data-arrival` — and the
  spec names it as the alternative.

- **The stylesheet** (`src/styles/global.css`, a new "The arrival
  (spec 016)" block right after the quiet-view rules at the end of the
  file — the stage's rules are there, and this is the stage's state).
  The no-script field is one declaration added to the existing
  `.image-stage` rule (`matte.test.mjs` looks that rule up by selector
  and requires it unique, so it cannot be a second block):

  ```css
  .image-stage {
    …existing…
    background: var(--color-arrival); /* no script: the stage's own field */
  }
  ```

  Every page-wide rule is gated on script **and** on not-quiet:
  `html[data-arrival]:not([data-quiet])`. The quiet view's own rules
  are then never in competition — under `data-quiet` the arrival's
  rules do not match, so no source-order or specificity argument is
  needed and the quiet block stays byte-identical. The mixes are
  written once as two custom properties on that selector and read by
  the others:

  ```css
  html[data-arrival]:not([data-quiet]),
  html[data-arrival]:not([data-quiet]) body {
    --arrival-ground: color-mix(
      in oklch,
      var(--color-bg),
      var(--color-arrival) calc(var(--arrival-lights, 0) * 100%)
    );
    --arrival-ink: calc(var(--arrival-lights, 0) * var(--arrival-chrome) * 100%);
    background: var(--arrival-ground);
    transition: none; /* the page's quiet-view easing must not ride the scroll */
  }
  html[data-arrival]:not([data-quiet]) .image-stage {
    background: transparent; /* the page's ground is the field now */
  }
  html[data-arrival]:not([data-quiet]) .site-header {
    background: var(--arrival-ground);
    border-bottom-color: color-mix(in oklch, var(--color-line), var(--color-quiet) var(--arrival-ink));
  }
  /* The text-coloured chrome: the brand, the current page's nav link,
     the title. The [aria-current] compound is what makes the split
     from the muted links real — by specificity, not by source order. */
  html[data-arrival]:not([data-quiet]) .site-header :is(.brand, .site-nav a[aria-current='page']),
  html[data-arrival]:not([data-quiet]) .image-head h1 {
    color: color-mix(in oklch, var(--color-text), var(--color-quiet) var(--arrival-ink));
  }
  /* The muted-coloured chrome: the other nav links, the frame nav, the
     toggle. */
  html[data-arrival]:not([data-quiet]) :is(.frame-nav, .frame-nav a, .quiet-toggle),
  html[data-arrival]:not([data-quiet]) .site-nav a:not([aria-current='page']) {
    color: color-mix(in oklch, var(--color-muted), var(--color-quiet) var(--arrival-ink));
  }
  html[data-arrival]:not([data-quiet]) .image-head :is(.eyebrow, .eyebrow a) {
    color: color-mix(in oklch, var(--color-accent), var(--color-quiet) var(--arrival-ink));
  }
  /* The theme eases a link's colour 180ms for the hover; on the dimmed
     links that ease would run behind every scroll step and at every
     router arrival. The underline's ease stays; the colour's goes. */
  html[data-arrival]:not([data-quiet]) :is(.site-nav a, .frame-nav a, .image-head .eyebrow a) {
    transition: background-size 180ms ease;
  }
  /* Focus on the dimmed chrome: readable at every lights value — the
     text colour on paper, paper on the dark wall. The ring is the
     theme's. The long compound in the :is() list is deliberate: it
     lifts this rule above the current-page link's text rule. */
  html[data-arrival]:not([data-quiet]) :is(.site-header .site-nav a[aria-current='page'], .site-header a, .frame-nav a, .quiet-toggle):focus-visible {
    color: color-mix(in oklch, var(--color-text), var(--color-bg) calc(var(--arrival-lights, 0) * 100%));
  }
  ```

  **Specificity, so nothing depends on source order.** With html plus
  two attribute compounds every selector starts at (0,2,1). The text
  rule's `:is()` takes its most specific argument,
  `.site-nav a[aria-current='page']` (0,2,1), so with `.site-header` it
  is (0,5,2); the muted nav rule's `.site-nav a:not([aria-current='page'])`
  is (0,2,1), so (0,4,2) — the two never match the same link, so no
  tie arises; the transition rule declares nothing the others do; the
  focus rule's `:is()` takes `.site-header .site-nav a[aria-current='page']`
  (0,3,1) plus `:focus-visible`, so (0,6,2), above both colour rules on
  every link it names. The theme's `a:not(.brand, .button):hover`
  (0,2,1) loses to all of them, so a dimmed link does not change colour
  on hover at the top; its underline still draws. Test (b) pins each
  rule's full selector list, the focus rule's long compound included,
  so a later edit that drops the compound fails by name rather than by
  a link that happens to look right.

  The dimmed set is exactly the spec's: the header (its ground, its
  hairline, the brand, the nav), the frame nav, the quiet toggle, and
  the label beneath the stage read as the page head (`.image-head`:
  eyebrow and title). `.image-body` is **not** in the set — the spec's
  "Reading down" flow has the story and the label read at full
  strength on the light ground, and at fade 1 the body's top enters
  the viewport when the lights are already below half; the gate can
  add it with one selector if he sees it. `.site-nav a` is split on
  `aria-current` because the current page's link reads the text token,
  not the muted one, and the pause's rule is "each element from its
  own token". Nothing in the block declares `display`, `visibility`,
  `opacity` or any box property: the dimming is colour only, so
  nothing is hidden from assistive technology and nothing can shift —
  a test walks the block and allows only `background`, `color`,
  `border-bottom-color`, `transition` and the two custom properties.

  `transition: none` on `html`/`body` under the arrival is the one
  place this spec touches the quiet view's neighbourhood: the page's
  scoped `:global(html), :global(body), .image-stage { transition:
  background-color 220ms ease }` would otherwise ease every
  scroll-driven step of the ground by 220ms — a settle after the
  scroll stops, which is the roadmap's "motion, considered", not this
  spec. Under `data-quiet` the gate rule stops matching, the page's
  transition applies again, and entering quiet view from the top eases
  from the arrival's dark to the quiet dark exactly as it eased from
  paper before; leaving snaps `<html>` to the arrival while the stage's
  own 220ms ease (still on `.image-stage`) carries the visible change.
  The quiet rules themselves are untouched.

- **The script**: one `<script is:inline data-arrival>` in the image
  page's `<Fragment slot="head">`, plain JS, ~40 lines, render-blocking
  on purpose. It is inline and in the head because that is the only
  place a script is guaranteed to run before the first paint; a hoisted
  module runs after parsing, and the browser may paint before it. It
  is one script rather than a pure module plus a head stub because the
  head cannot import, and a rule written twice would need a test to
  hold the copies together; instead the whole rule lives in the head
  script and the test evaluates that script in a stub browser.
  Bound once (`window.__arrival`, spec 014's `__devGround` shape); the
  router re-executes nothing it has already run, and the guard makes
  that irrelevant either way.

  ```js
  (() => {
    const FADE = 1; // viewport heights; :root's --arrival-fade repeats it for the dev control (arrival.test.mjs pins them equal)
    const root = document.documentElement;
    let last = '';
    const lightsAt = (y, vh, fade) => {
      const p = Math.min(1, Math.max(0, y / (vh * fade)));
      return 1 - p * p * (3 - 2 * p);
    };
    const apply = (y) => {
      const override = Number.parseFloat(root.style.getPropertyValue('--arrival-fade'));
      const fade = Number.isFinite(override) && override > 0 ? override : FADE;
      const value = lightsAt(y, root.clientHeight, fade).toFixed(3);
      if (value !== last) {
        root.style.setProperty('--arrival-lights', value);
        last = value;
      }
      if (!root.hasAttribute('data-arrival')) root.setAttribute('data-arrival', '');
    };
    // Before the first paint: the DESTINATION, not scrollY, which is 0
    // until the browser or the router restores it. The router keeps the
    // position in history.state; a fragment lands below the stage.
    const state = history.state;
    const restored = state && typeof state.scrollY === 'number' ? state.scrollY : 0;
    apply(location.hash ? Infinity : restored);
    if (window.__arrival) return;
    window.__arrival = true;
    const update = () => {
      if (document.querySelector('.image-page')) apply(window.scrollY);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    document.addEventListener('astro:after-swap', () => {
      last = '';
      update();
    });
    document.addEventListener('astro:page-load', update);
  })();
  ```

  The curve is the pause's smoothstep (`pause-shape.ts`'s `t²(3 − 2t)`),
  descending: lights are 1 at y = 0, ½ at half the fade, 0 at the
  fade's length and beyond, monotone between. The fade's unit is the
  viewport height (`document.documentElement.clientHeight` — the
  layout viewport, which is the small viewport on iOS, so the collapsing
  toolbar does not stretch the fade mid-scroll). At fade 1 the lights
  reach 0 when the stage's bottom edge (at `100svh` from the page's top:
  the sticky header's height plus the stage's `100svh − header`) passes
  the viewport's top — "by the time the frame has left the screen"; the
  frame itself, centred with the stage's padding, leaves a little
  earlier. Scrolling up runs the same function backwards. The scroll
  listener does one `scrollY` read and writes only when the
  three-decimal value changes (the pause's `lastLights`). No rAF —
  scroll events already throttle to frames.

  **The no-flash rule.** On a hard load — a reload, back navigation
  into a page the cache dropped, a link with a fragment — the head
  script runs while `scrollY` is 0 and the page will be scrolled later.
  Astro's router stores every entry's position in `history.state`
  (`{ index, scrollX, scrollY }`, written at `scrollend`) and restores
  it at its module's evaluation; a fragment is scrolled to when its
  target parses. So the script decides from `history.state.scrollY`
  and `location.hash`, not from `scrollY`: a restored page paints light
  at once, a first visit paints dark at once, and the exact value for a
  position inside the fade is computed rather than guessed. Then
  `astro:page-load` (the `load` event on a hard load) re-applies from
  the real `scrollY`, correcting only the two cases the head cannot
  know: a fragment that matches nothing (the page stays at the top and
  goes dark at load — a light-then-dark step, the direction the spec
  allows, in a broken-link case) and a position the browser restores
  differently from what the router stored (they agree in practice —
  the router stores at scrollend). On a router navigation there are
  two paths, and both land on the same function. **The first
  client-side arrival at an image page in a session**: the arrival
  script is not yet on the page, so the router's `runScripts()` — which
  runs after `astro:after-swap`, on `updateCallbackDone.finally`, still
  before the new page is shown — executes it for the first time; its
  head-time branch runs with `history.state` already pushed by
  `moveToLocation` (`{ scrollX: 0, scrollY: 0 }` for a forward
  navigation, the stored entry for a traversal), so the destination
  rule gives the right answer there too, and the guard then binds the
  listeners. **Every later arrival**: the script is already present
  and identical, the router does not re-run it, and the `astro:after-swap`
  listener does the work — it fires after `moveToLocation` has pushed
  the new entry and scrolled (`updateDOM` calls `moveToLocation` before
  it triggers the event — T1402 reads the router source in
  `node_modules/astro` and records the lines, `runScripts`'s position
  included), inside the swap and before the new page paints, so
  `scrollY` is already the destination and one `apply(scrollY)` is
  exact. The stub test in `arrival.test.mjs` pins the head decision
  directly: with `history.state.scrollY` past the fade the script
  writes `0.000` before any event fires, and with the router's fresh
  `{ scrollY: 0 }` and no hash it writes `1.000`.

- **The dev-only control** (`src/components/DevArrival.astro` +
  `src/components/dev-arrival.ts`), spec 014's switch and the sampler's
  ground bar as the pattern. Rendered by the image page inside the head
  slot, **before** the arrival script, as `{import.meta.env.DEV && <DevArrival />}`
  — a build-time constant, so `astro build` renders nothing. The
  component carries two script tags and no markup or `<style>` (a
  component's `<style>` is bundled by its import whether or not it
  renders, and a rule of the control in the built CSS is "something of
  the control reaching the build"):
  - `<script is:inline data-dev-arrival>` — the head applier, spec
    014's `DevGround` verbatim in shape: read `localStorage['dev-arrival']`
    (JSON `{ depth, chrome, fade }`, strings), set `--arrival-depth`,
    `--arrival-chrome`, `--arrival-fade` inline on `<html>`, re-apply at
    `astro:after-swap` (registered once, `window.__devArrival`). It runs
    before the arrival script in document order, and its after-swap
    listener is registered first and so fires first, which is what
    lets the arrival script read the fade override inline with no
    stylesheet involved.
  - `<script is:inline type="module" src="/src/components/dev-arrival.ts">`
    — served, never bundled (spec 014's resolved decision; `ground.test.mjs`
    case (h) already covers every `src/components/Dev*.astro`). At
    `astro:page-load` on a page with `.image-page` it builds the bar —
    a fixed bottom-right `<aside class="meta" data-dev-arrival-bar>`
    with an injected `<style>` copied from the sampler's
    `.sampler-banner`, hidden under `html[data-quiet]` — with three
    range inputs and outputs (`depth` 0.5–0.99 step 0.01, `chrome`
    0.01–1 step 0.01, `fade` 0.25–2 step 0.05 — the depth's ceiling and
    the chrome's floor are the open ends test (a) rejects, so the bar
    cannot offer a value the landing would refuse), a live `lights`
    readout (the
    inline `--arrival-lights`, updated on scroll), a `<code>` line in
    the exact form the landing pastes
    (`--arrival-depth: 0.9; --arrival-chrome: 1; --arrival-fade: 1`),
    the words "no override — the stylesheet" when nothing is stored,
    and a `reset` button. On input: set the inline property, write the
    key, redraw the line, and dispatch a `scroll` event on `window` so
    the arrival script recomputes (the fade is the one knob the script
    reads; depth and chrome are CSS's). On reset: remove the key and
    the three inline properties, dispatch `scroll`, and read the
    defaults back from `getComputedStyle(document.documentElement)` —
    the stylesheet's, which is why `--arrival-fade` exists in `:root`.
    The control reads no computed colour and does no arithmetic: the
    numbers it shows are the numbers on `<html>`.
  - `scripts/check-no-dev-routes.mjs` learns the second marker:
    `MARKER` becomes `MARKERS = ['dev-ground', 'dev-arrival']`, the scan
    gains `.css` beside `.html` and `.js`, and the log line names both.
    The control's storage key, its script attribute and its bar
    attribute all carry the string, so any of them in `dist/` fails the
    build by name.

  The control stays in the repo after the values land: the gate loops,
  and the next round is the same bar.

- **The mat rule, restated and pinned.** "The mat is worn where the
  ground is dark: the stage on arrival, the quiet view, the pause —
  and nowhere else." Spec 015's `matte.test.mjs` already pins _which_
  two selectors read `--mat` as a padding and that no other rule does;
  this spec adds case (d), which pins the _why_: the stage's ground is
  `var(--color-arrival)` without script and `var(--color-quiet)` in
  quiet view; the pause's ground mixes `--color-bg` toward
  `--color-quiet` (the lights block's string, read not retyped); and
  `--color-arrival` is lighter than `--color-quiet` by computation —
  `parseOklch` on both tokens and `--arrival-depth` in (0, 1) gives
  L<sub>arrival</sub> = L<sub>bg</sub> + (L<sub>quiet</sub> − L<sub>bg</sub>)·depth > L<sub>quiet</sub>.
  The compare's two `--color-matte` uses stay pinned as spec 015 left
  them (its device inside its box, white). The pause frame keeps its
  mat _by the rule_ now, not as a deferred exception: the comments
  that said "until the pause gets a spec of its own" in `global.css`'s
  `:root` mat comment and `matte.test.mjs`'s header say "on a dark
  ground, by the rule" instead — the pause's _rework_ is still on the
  roadmap, its mat is not.

- **The sampler shows the no-script look.** `/dev/matte/stage/` renders
  the real `.image-stage` markup on the real stylesheet with no arrival
  script, so its four frames now sit on the arrival's dark — the
  no-script field, which is also the one place the mat can be seen on
  the dark without scrolling. The sampler's files are untouched (spec
  non-goal); the look changes because the stylesheet did, which is what
  the sampler is for. Recorded, and read by T1401.

- **The gate, and its loop.** Phase 0 ends at the first look: the
  image pages under `npm run dev` on both screens, the bar open, the
  three sliders, scrolling down and up on a landscape and a portrait
  frame, the quiet view entered from the top, a reload mid-page, a
  fragment link, a page with script disabled (or the sampler's stage
  section for the field). He reports the three numbers, or "the
  defaults". T1405 types them into `:root` and the script's `FADE`
  (from the bar's line, never re-read by eye), and the Phase 1 pause is
  the second look with no override stored. If he wants another round,
  the orchestrator logs T1405a with the new line and pauses again — the
  bar is still there, the task line is written to be run as many times
  as the gate takes, and only the last landing's values are the record.

- **The documents.** `CLAUDE.md`'s block-vocabulary clause says the
  site mats "only the image page's stage and its quiet view (spec 015)
  … the pause frame excepted until its own spec": true in effect,
  false in framing once the rule is "worn where the ground is dark",
  and the constitution is amended first, in its own commit (T1400, as
  spec 015's T1300 and spec 013's T1103a). Then the living documents
  that state spec 015's interim: `README.md` (the pause footnote, the
  "since spec 015 the site mats only…" sentence, the status line, the
  image page paragraph — plus the arrival described in one sentence,
  and the project tree's missing entries, carried item N10),
  `design/brief.md` (the Palette note's last three sentences; the
  carve-out's rule and its parenthesis), `AUTHORING.md`'s one clause
  (the pause frame "until the pause gets a spec of its own" → by the
  rule — the spec says AUTHORING needs nothing, and it needs no new
  content; this is a correction of the same interim framing, see
  Deviations in the report). `ROADMAP.md` and `DECISIONS.md` at
  close-out (T1407), edited on the branch and merged through the PR
  exactly as spec 015's T1305 did — spec.md's AC 11 and AC 12 name
  them, so they are the spec's implementation by the constitution's
  test. `specs/015` is frozen and never edited.

- **Carried from spec 015's sweep.** N6: `CoverCards.astro`'s hint
  `373px` → `375px` (the 1160px grid at three columns with the
  `.gallery-grid` gap of 18px renders 374.667px; 375 over-delivers by a
  third of a pixel; a pin of the grid's arithmetic is not worth a
  parser for one literal). N9: `ground.test.mjs`'s `og.jpg` case gains
  `info.width === 1200 && info.height === 630` — `sharp` already
  returns `info` there. N10: the README tree, with this spec's files.
  N7 needs nothing (015's `plan.md` records it).

## Failure messages and notes

One barrier line changes; the build's page count does not (87 stays
87; the draft fixture piece is still never built):

```
[check-no-dev-routes] no dev routes in dist/; no dev-ground or dev-arrival marker in <n> files.
[check-no-dev-routes] a dev-only marker shipped (dev-arrival): <files>
[check-no-gps] <n> images scanned in dist/ — no GPS metadata.
```

The dev control writes nothing to the console. A malformed
`dev-arrival` key is ignored (the stylesheet's defaults), as
`DevGround` ignores a malformed `dev-ground`.

## Testing strategy

Every claim above is owned by a task and a check:

- **The constitution goes false nowhere** — **T1400**: the clause
  amended in its own commit before any code; the sweep greps it.

- **The tokens and the rules** — `arrival.test.mjs` (new; it reads
  `global.css` and the page through `ground.ts`'s `blocks`/`uncomment`,
  as `matte.test.mjs` does), **T1401**:
  - (a) `:root` declares `--arrival-depth` in (0, 1), `--arrival-chrome`
    in (0, 1], `--arrival-fade` > 0, and `--color-arrival` as exactly
    the mix string above; none of the four is declared by any other
    rule in `global.css` or any file under `src/` outside
    `src/pages/dev/` and `src/components/Dev*` (the single source, as
    the mat tokens); `--color-arrival`'s L, computed from the tokens,
    is greater than `--color-quiet`'s (AC 3's first half — this is the
    "lighter than" claim, made numeric).
  - (b) every rule whose prelude contains `[data-arrival]` has every
    selector begin `html[data-arrival]:not([data-quiet])` (the quiet
    gate, so the quiet view's rules never compete); the union of their
    declared properties is a subset of `{background, color, border-bottom-color, transition, --arrival-ground, --arrival-ink}`
    (no layout, no `display`/`visibility`/`opacity` — the no-shift and
    the AT claims at the stylesheet level); the `html`/`body` rule's
    `--arrival-ground`, `--arrival-ink`, `background` and `transition`
    strings pinned; `.image-stage`'s base rule carries
    `background: var(--color-arrival)` and the gated stage rule
    `background: transparent`; the dimmed set's selectors are exactly
    the list above (an addition is deliberate); the focus rule exists
    and mixes toward `--color-bg`; **each colour rule's `color` value
    is pinned as a string with its source token** (`--color-text`,
    `--color-muted`, `--color-accent`, and `--color-bg` on the focus
    rule) — at chrome 1 and lights 1 every dimmed element computes to
    exactly `--color-quiet` whichever token it started from, so a
    browser read at the top cannot tell a wrong source and this pin is
    what can; the focus rule's `:is()` list contains
    `.site-header .site-nav a[aria-current='page']` (the compound that
    lifts it above the text rule — dropped, the current page's link
    would keep its dim colour under focus with everything else green);
    the link transition rule declares `transition` alone, its value
    `background-size 180ms ease`. (That the pause's lights block, the
    quiet rules and the page's `<style>` are untouched is the task's
    diff check, below, and `matte.test.mjs`'s existing quiet-rule pins
    — not a second string pin here.)
  - (d) in `matte.test.mjs`, "worn where the ground is dark": the
    stage's base rule's background is `var(--color-arrival)`; the quiet
    stage rule's is `var(--color-quiet)`; the pause's `html[data-pause-active]`
    background string reads `var(--color-quiet)` as its mix target; the
    two matted selectors from case (b) are the surfaces those three
    grounds sit under; `--color-arrival` reads `--color-quiet` and
    `--arrival-depth`. Every existing case unchanged.
  - Mutation-checked, each reverted: `--arrival-depth: 1` → (a)'s
    "lighter than quiet" fails; a `padding` added to the header rule →
    (b)'s allowlist fails naming it; `:not([data-quiet])` dropped from
    one selector → (b)'s gate case fails; `--color-arrival` retyped as a
    literal `oklch()` → (a) and (d) fail; `.image-body p` added to the
    dimmed set → (b)'s list case fails.

- **The script's behaviour, and the no-flash rule** — `arrival.test.mjs`
  (c), **T1402**: the script's text is extracted from `[...id].astro`
  (between `<script is:inline data-arrival>` and `</script>`) and run
  with `new Function('window', 'document', 'history', 'location', body)`
  against a stub — `document.documentElement` with a `style` that
  records `setProperty`/`getPropertyValue`, `clientHeight`, and the
  attribute methods; `document.querySelector('.image-page')`
  switchable; `window`/`document.addEventListener` recording listeners
  so the test can fire `scroll`, `astro:after-swap` and
  `astro:page-load`. Cases, each named for what would fail:
  - first paint at the top (no state, no hash): `data-arrival` set and
    `--arrival-lights` `1.000` **before any event**; the router's fresh
    entry (`history.state = { scrollY: 0 }`, no hash — the first
    client-side arrival, run by `runScripts`) → `1.000` likewise;
  - **a restored position paints light first**: `history.state = { scrollY: 3·vh }`
    → `0.000` before any event; a hash → `0.000`; a restored position
    inside the fade (vh/2 → `0.500`; vh/4 → `0.844`) → the computed
    value, not a guess;
  - the curve: monotone non-increasing over y ∈ [0, vh] in twenty
    steps, `1.000` at 0, `0.500` at vh/2, `0.000` at vh and at 10·vh;
    symmetric (`lights(vh/4) + lights(3vh/4) = 1` within 1e-9);
  - the fade override: inline `--arrival-fade: 2` → `0.500` at y = vh;
    `''`, `0`, `-1`, `abc` → the default;
  - after-swap: the stub clears `<html>`'s attributes and inline style
    (as the router does), fires `astro:after-swap` with `.image-page`
    present at scrollY 0 → both re-set; with no `.image-page` → neither
    set;
  - bound once: running the script twice registers each listener once;
  - writes only on change: two `scroll` events at one y → one
    `setProperty('--arrival-lights', …)`;
  - the script's `FADE` literal equals `:root`'s `--arrival-fade`.

- **The rendered result** — **T1401** and **T1402**, on the dev server
  (Firefox headless via BiDi, spec 015's recipe and environment note),
  at 1512×982 and 375×812: **before the edit** (T1401's start) the stage
  frame's rect, padding and image height on `/images/where-the-fog-lets-go/land-b/`
  and on a portrait frame, and `<html>`'s background — recorded.
  **After T1401** (no script yet): `<html>` still paper; `.image-stage`'s
  computed background = `oklchToRgb255(mix)` within 1/255 (the mix
  computed in the test's arithmetic from the tokens: L, C linear, hue
  on the shorter arc); the frame's rect identical to the before read
  (no shift); `/dev/matte/stage/`'s four stages on the same colour.
  **After T1402**: at y = 0, `--arrival-lights` `1.000`, `<html>`,
  `body` and `.site-header` backgrounds = the arrival's rgb within
  1/255, `.image-stage` transparent, the frame's rect identical to the
  before read, the brand's, a nav link's, the frame nav's, the
  toggle's, the eyebrow's and the h1's computed colours each their
  token mixed all the way to quiet (chrome 1), `transition-property`
  on `<html>` `none`; at y = vh/2 `0.500`, the ground half-way, and
  **one muted element (a nav link) and one text element (the h1) each
  at its own token's half mix** (the test's arithmetic again — the
  two differ here, so a rule mixing from the wrong token shows; at
  the top they do not); at y ≥ vh `0.000` and every read the pre-spec
  value **within 1/255** (paper, the tokens unmixed — a
  `color-mix(… 0%)` through oklch need not serialize identically to
  the raw token); back to 0 → `1.000`; on the router path, right after
  `astro:page-load`, `document.getAnimations().filter((a) => a
  instanceof CSSTransition && a.transitionProperty === 'color')` empty,
  and empty again after one `scrollBy(0, 40)` at the top (no link
  colour easing — the transition rule; the unfiltered list is non-empty
  on a correct page, since the stage's 220ms ease and Astro's root fade
  are running at that moment);
  `scrollTo(2000)` then `browsingContext.reload` → after load `0.000`
  with `scrollY` restored (the value; a flash is not observable
  headless — the stub test is the pin, and the person reloads mid-page
  at the gate); a `script.addPreloadScript` that reads
  `document.documentElement.clientHeight` and `history.state` before
  any page script → the viewport height and the stored state (the head
  script's two inputs exist at head time — recorded, Claims needing
  verification); entering quiet view from the top → `<html>` background
  = quiet's rgb, the frame nav `display: none`, leaving → the arrival's
  rgb at `scrollY` 0; with `data-arrival` removed by script →
  `.image-stage` reads the arrival's rgb and `<html>` paper (the
  no-script look, computed); `scrollWidth ≤ clientWidth`; a focused
  nav link at y = 0 reads `--color-bg`'s rgb; the after-swap path:
  navigate from `/galleries/fog-frames/` to a frame by click →
  `1.000` at load; navigate frame → frame by the next link → `1.000`;
  `browsingContext.traverseHistory(-1)` after scrolling the first
  frame past vh → `0.000` at the restored position.

- **The control is there under dev and nowhere in the build** — **T1403**:
  `sh scripts/verify.sh` green with the new barrier line;
  `grep -rl "dev-arrival\|dev-ground" dist/` empty; `test ! -e dist/dev`;
  `grep -c "getComputedStyle" src/components/dev-arrival.ts` → 1 (the
  reset's default read, and nothing else); on the dev server at
  1512×982: the bar renders on an image page and not on `/pieces/…/`;
  moving `depth` to 0.95 sets `--arrival-depth` inline, writes the key
  with three strings, and `<html>`'s background at y = 0 moves to the
  new mix within 1/255; moving `fade` to 0.5 → at y = vh/2 the lights
  read `0.000`; the line reads the three values verbatim; reload keeps
  them; `/images/<another>/` opened afterwards wears them; `reset`
  removes the key and the inline properties and the outputs show
  `0.9 / 1 / 1`; under quiet view the bar is `display: none`.

- **The housekeeping** — **T1404**: `ground.test.mjs`'s new case green
  against `public/og.jpg`, and failing against a 1199-wide copy written
  to a temp path with `sharp` (named and reverted); the cover card's
  hint read at 1512 on `/galleries/`: rendered 374.667 vs hint 375 →
  +0.333 (over-delivery, fine).

- **The values landed** — **T1405** (each round): `arrival.test.mjs`
  green against the new literals (the `FADE`-equals-`--arrival-fade` pin
  is what catches one typed and not the other); the old literals grep'd
  out of `src/` and the head script; on the dev server with no
  `dev-arrival` key at y = 0 `<html>`'s background = the new depth's mix
  within 1/255 on both viewports.

- **Untouched by construction** — **T1401**, **T1402** and the sweep:
  `git diff -U0 main -- src/styles/global.css | grep '^@@'` lists no
  hunk whose range falls inside `.piece-pause` through
  `.piece-pause-frame`, the `html[data-pause-active]` block, the two
  `html[data-quiet] .image-` rules, `.image-frame`, `.image-frame img`,
  or the three mat tokens and `--color-matte` (the ranges' line numbers
  recorded); `git diff main -- 'src/pages/pieces/[slug].astro' src/lib/pause-shape.ts remark-pieces-blocks.mjs src/content.config.ts obsidian-plugin/ src/components/DevGround.astro src/pages/dev/ src/lib/ground.ts src/lib/og-card.mjs public/og.jpg`
  empty; `pause-shape.test.mjs`, `matte.test.mjs` cases (a)–(c),
  `page-head.test.mjs`, `og.test.mjs` unedited and green;
  `--color-quiet`, `--pause-depth`, the mat tokens and `--color-matte`
  unchanged by string.

- Existing suites stay green (the count from `main` plus the new
  cases); build with both barriers; `astro check`; Prettier on the
  documents.

## File structure

```
CLAUDE.md                                      the block-vocabulary clause: the mat is worn where the ground is dark — the stage on arrival, the quiet view, the pause frame; every other frame bare (T1400, its own commit)
src/styles/global.css                          :root — four arrival tokens beside --color-quiet, the ground comment's last sentence and the mat comment's "until its own spec" reworded; .image-stage gains its background; the arrival block after the quiet rules (T1401); the landed literals (T1405)
matte.test.mjs                                 header reworded; case (d) "worn where the ground is dark" (T1401)
arrival.test.mjs                               new — (a) tokens, (b) rules, (c) the script in a stub, the FADE pin (T1401 a/b, T1402 c)
src/pages/images/[...id].astro                 <Fragment slot="head"> with {import.meta.env.DEV && <DevArrival />} then <script is:inline data-arrival> (T1402; the DevArrival line at T1403); the header comment's script sentence
src/components/DevArrival.astro                new — the head applier and the served-script tag, no markup, no <style> (T1403)
src/components/dev-arrival.ts                  new — the bar, built at page-load on image pages (T1403)
scripts/check-no-dev-routes.mjs                MARKERS = ['dev-ground', 'dev-arrival']; .css scanned; the log line (T1403)
src/components/CoverCards.astro                sizes 373px → 375px, comment (T1404)
ground.test.mjs                                og.jpg 1200×630 asserted (T1404)
README.md, AUTHORING.md, design/brief.md       the rule, the arrival, the tree (T1406)
ROADMAP.md, DECISIONS.md                       close-out (T1407, implementer-edited, orchestrator-committed on the branch, as spec 015's T1305)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`.piece-pause` through `.piece-pause-frame` and the `html[data-pause-active]`
block; `src/pages/pieces/[slug].astro`, `src/lib/pause-shape.ts`,
`pause-shape.test.mjs`; the two quiet-view stage rules and the page's
quiet rules and transition; `.image-frame`, `.image-frame img`, the
three mat tokens, `--color-matte`, `--color-quiet`, `--pause-depth`;
the transform and its tests, the schema, the fixture pieces, the
Obsidian plugin; `DevGround.astro`, `BaseLayout.astro`, `src/pages/dev/`,
`src/lib/ground.ts`, `src/lib/og-card.mjs`, `public/og.jpg`,
`scripts/gen-og.mjs`; `specs/015-the-hero-mat/`.

## Known limitations

- **The dimmed links do not change colour on hover** at the top of the
  page: the theme's hover rule loses to the arrival's colour rules by
  specificity. The underline still draws (its `background-size` ease is
  kept by the transition rule); the colour's 180ms ease is dropped on
  those links because it would otherwise run behind every scroll step
  and at every router arrival — `moveToLocation` scrolls and flushes
  style before the listener sets `data-arrival`. The pause's links keep
  the theme's ease, as spec 007 left them.
- **A fragment that matches nothing** goes dark at `load` after
  painting light: the head cannot know the target is missing. A broken
  link, in the direction the spec allows.
- **The head decides from the router's stored position**, which is
  written at `scrollend`; a reload during a scroll may restore a few
  pixels from where the head computed. Inside the fade that is a step
  of a percent or two at `load`; outside it, nothing.
- **The text-coloured chrome is close to the wall at every chrome
  value** (Shape of the change, the arithmetic): `--color-text` is
  L 0.25 and the proposed wall L 0.279. The gate judges; the header's
  "away" alternative is one rule.
- **`.image-body` is not dimmed**; the spec's list does not name it and
  its top enters the viewport with the lights already below half. One
  selector if the gate wants it.
- **The sampler's stage section now sits on the arrival's dark** with
  no script and no bar for it — the no-script field, shown by
  construction. The sampler's files are untouched.
- **The dev control shows numbers, not colours**: depth and chrome are
  read as the values on `<html>`, and the arrival's colour is the
  browser's mix — the gate is by eye, which is what the spec asks.
- **The fade is measured in layout-viewport heights**
  (`documentElement.clientHeight`), stable on iOS as the toolbar
  collapses; the stage's own `100svh` is the same quantity, so the two
  agree, but the person is the check on the phone — Firefox headless
  has no dynamic toolbar.
- **The control's bar covers the bottom-right corner** of the page
  under dev, including the frame nav's next link on a phone; drag it
  aside is not built — collapse is `reset` and a reload with the
  component's line commented, or the built site. Dev only.

## Resolved decisions

- **The state is script-written, not a CSS scroll-driven animation.**
  `animation-timeline: scroll()` would compute before first paint for
  free, but the spec's no-script look is the stage's own field with the
  header on the page ground (AC 6, from spec 015's recorded lean), and a
  CSS timeline would make the no-script page the full hero; its
  support in Firefox is also not something this project has measured.
  The pause's mechanism is the pattern the spec names.
- **One inline head script, the rule inside it, tested in a stub** —
  not a pure module plus a head stub (a rule written twice), not a
  module alone (runs after the first paint), not the rule exported as a
  source string and `set:html`'d (a string is not a function anyone can
  read). The cost is a plain-JS block in an `.astro` file evaluated by
  the test through `new Function`; the project already reads `.astro`
  files as text in `matte.test.mjs` and `ground.test.mjs`.
- **The head decides from `history.state` and the hash, then `load`
  corrects** — the only way to know the destination before the browser
  or the router has scrolled there. Astro's router keeps the position
  in `history.state` for its own restoration, so the script reads what
  is already there and stores nothing of its own.
- **`:not([data-quiet])` on every arrival rule** rather than the
  script removing `data-arrival` in quiet view or source order deciding:
  declarative, order-free, and the quiet block stays byte-identical.
- **`transition: none` on `html`/`body` under the arrival**, not the
  page's transition list edited: the quiet view's rules are untouched,
  the ground never eases behind the scroll, and the quiet entry keeps
  its 220ms because the gate rule stops matching when `data-quiet`
  appears.
- **Depth as a share, not a colour literal** (`--arrival-depth` and the
  derived `--color-arrival`): one number is the knob, the pause has the
  same model, the arrival follows the ground if the ground moves, and
  "lighter than quiet" is a computed fact rather than two literals
  compared by eye. `--color-arrival` exists so the dark is written once
  and read twice.
- **The fade's default lives in the script and is repeated in `:root`,
  pinned equal** — the script cannot read the stylesheet before the
  first paint (the head slot precedes the injected `<link>`), and the
  dev control must show a default it can read; the test holds the two
  together, as `ground.test.mjs` holds `MUTED` to `:root`. The simpler
  structure (the script alone) would leave the control unable to
  reset. The more general one (the script reading CSS at after-swap
  and the constant at first load) would be two sources at two times.
- **The dimmed set is enumerated, as the pause's is**, not
  `opacity` on containers: the spec says the chrome dims "the way the
  pause dims its words", and opacity on the sticky header would blend
  its paper background toward the wall instead of taking it there.
- **The dev control is head-only with a script-built bar**: markup in
  a head-slot component is impossible, a body render site would put
  the applier after the arrival script, and a component `<style>` would
  ship. The bar's CSS is a string in the served module.
- **The constitution is amended first** (T1400): the clause's framing
  ("the pause frame excepted until its own spec") contradicts the rule
  this spec states, and the constitution's own rule is amendment first,
  explicitly, in its own commit.
- **Close-out follows spec 015's T1305**: `ROADMAP.md` and
  `DECISIONS.md` are edited on the branch, committed there by the
  orchestrator in their own commit, read by the sweep as files, and
  reach `main` through the PR — they implement AC 11 and AC 12, which
  is the constitution's test for what rides a spec branch.
- **N6 is the hint moved, not pinned**: one literal; a parser for the
  grid's column arithmetic is an abstraction with one caller.
