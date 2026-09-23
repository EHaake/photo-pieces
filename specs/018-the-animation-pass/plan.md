# Plan: The animation pass

**Status**: Draft — pending sign-off
**Implements**: spec.md in this directory

## Shape of the change

A grammar, four behaviours on it, a switch to tune them, and the tests
that make the grammar a fact. Nothing at rest changes: no schema, no
registry, no transform handler, no dependency, no frame's geometry —
the stage's, the quiet view's, the galleries' and the wall's rules are
byte-identical to `main` (matte.test.mjs already pins the stage and
the quiet frame; this spec pins the page's scoped quiet rules beside
them). The means are the stylesheet and two browser APIs the site
already stands on: CSS animations/transitions on the compositor, and
the View Transitions API that the layout's `<ClientRouter />` already
drives for every page change. The five tests the constitution's Scale
guidance asks for are applied at each decision below; where the
simpler shape was chosen it is said in one line.

Two facts of the router, read in `node_modules/astro/dist/transitions/`
(7.2.2), shape the design and are stated once here:

- On the initial load `astro:page-load` fires on `window`'s `load`
  event (`router.js:414`) — after every image has loaded — so a script
  that hides undecoded photographs cannot bind there: every image would
  be `complete`. The appearance hooks run at the layout module's own
  evaluation (a hoisted `<script>` is a deferred module: after the
  parse, before `DOMContentLoaded`) and after each swap at
  `astro:after-swap`, which fires inside the router's update callback
  (`router.js:208`) — after the swap and the scroll, before the new
  snapshot is captured. A deviation from the project's "bind on
  `astro:page-load`" habit, for that reason; the image page's own
  script keeps its `page-load` binding.
- The router has no reduced-motion behaviour on this site. The DEV
  warning in `ClientRouter.astro` speaks of Astro's own directive
  animations (`transition:animate`), which this site does not use, and
  no `prefers-reduced-motion` rule exists anywhere in `astro/dist`. A
  page change under reduced motion therefore cross-fades at the
  duration this spec gives the root group — a fade, kept under Goal 6's
  principle — rather than cutting as the spec expected of the router.
  Said in the report as a deviation; a cut is one line in the
  reduced-motion block if the photographer wants it.

- **The grammar** (`src/styles/global.css`, `:root`, after
  `--place-wall-gap`). Three durations, two curves, and beside them the
  flags and numbers the tuning envelope names — every one a custom
  property on `:root`, declared nowhere else, so the dev switch can set
  any of them on `<html>` and `motion.test.mjs` pins each by name and
  value (its `EXPECTED` table is the one place a round's new number is
  written beside the stylesheet's):

      --dur-state: 180ms;        /* a state change: hover, underline, the header's slide, a page's cross-fade */
      --dur-move: 480ms;         /* a photograph's movement: the travel, the quiet growth; the hero's entrance */
      --dur-appear: 400ms;       /* a photograph's appearance: the fade on decode, the arrival */
      --ease-state: ease;
      --ease-move: cubic-bezier(0.22, 1, 0.36, 1);
      --motion-appear: 1;        /* the four behaviours' flags, 1 or 0 — read by script; the code stays when one is off */
      --motion-arrive: 1;
      --motion-travel: 1;
      --motion-quiet: 1;
      --arrive-rise: 0px;        /* the arrival's shape: 0px is the fade alone, a length is the fade with a rise */
      --arrive-threshold: 0.15;  /* the share of a frame in view that counts as arrived */
      --arrive-stagger: 0ms;     /* a multi-cell block arrives as one; a stagger only if asked to see one */
      --wait-fill: var(--color-surface);   /* the waiting box: the surface step, or var(--color-bg) for the ground itself */
      --hero-enter: 1;           /* the front door's inherited entrance, on the tokens; 0 turns it off */
      --hero-stagger: 90ms;
      --arrows-slide: 0px;       /* the arrows cross-fade in place; a length is the slide variant's distance */
      --rm-appear: 1;            /* under reduced motion: 1 keeps the appearance fade's duration, 0 cuts it */
      --rm-quiet: 1;             /* under reduced motion: 1 keeps the quiet view's ground fade, 0 cuts */

  Every inherited transition and animation is rewritten to read them
  with its feel unchanged: `a:not(.brand, .button)` (`background-size`
  and `color` at `--dur-state --ease-state`), `.site-header`
  (`transform`, 220ms → the token's 180ms, judged at the pause),
  `.button` and `.social-links a` (their three colour transitions), and
  `.hero > *` — `animation: keel-enter calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both`
  with the three delays `calc(var(--hero-stagger) * 1 | 2 | 3)`. The
  hero's 560ms becomes the move duration's value (three durations, not
  four — the spec's "on the order of three"); a multiplier of 0 on the
  flag makes the animation zero-length and `both` lands it on its end
  state, which is how "switched off" keeps the code. The page-level
  `::view-transition-group(*)` rule gives every page change's root
  cross-fade `--dur-state --ease-state` in place of the UA's 0.25s
  (old/new pseudo-elements inherit the group's duration per the UA
  stylesheet); under `html[data-moving]` — the attribute the script
  sets while a photograph is travelling, stepping or growing — every
  group takes `--dur-move --ease-move`, so the page beneath lands with
  the photograph. One rule and one attribute rather than a per-case
  duration: the simpler shape, and the token is the tunable.

- **Reduced motion** (`global.css`, the `@media (prefers-reduced-motion: reduce)`
  block). The blanket `* { animation-duration: 1ms; transition-duration: 1ms; scroll-behavior: auto }`
  is replaced by the distinction the spec draws — movements instant,
  fades kept — as five rules, pinned by string:

      :root { --arrive-rise: 0px; }
      a:not(.brand, .button) { transition-property: color; }   /* the underline's size change is instant; the colour still fades */
      .site-header { transition-duration: 0s; }
      .hero > * { animation-duration: 0s; animation-delay: 0s; }
      img[data-shown='fade'], img[data-shown='rise'] { animation-duration: calc(var(--dur-appear) * var(--rm-appear)); }

  `scroll-behavior` leaves with the blanket: the site never sets it
  (the scroll settle is a non-goal), so the reset was resetting
  nothing. The travel and the quiet growth need no rule here: the
  script never names the photograph under reduced motion, so no group
  moves; the quiet view's ground fade runs as a nameless view
  transition when `--rm-quiet` is 1 and as a plain toggle when it is 0.
  `0s` is the one literal the scan allows in a duration slot — a zero
  is the absence of motion, not a duration.

- **Appearance and arrival** (`src/lib/motion.ts`'s `appear()`, called
  from `BaseLayout.astro`'s script; the CSS in a new `/* ---- Motion */`
  section at the end of `global.css`). The hooks are the classes the
  markup already carries — the transform's `a.image-link` and
  `.piece-block` (its own string literals, spec 004 and 003), the
  stage's `.image-frame`, the packed cell's `a.image-link`, the cover
  card's `span.image-link`, and one new wrapper, `span.note-cover`,
  around the `PieceList` row's cover so the front door's and the
  pieces index's covers have a box to wait in (a markup change of one
  element; the row's grid and its `img` rule are untouched). The
  transform's vocabulary is not touched. The list is one constant:

      export const FRAME_HOSTS = ['.image-link', '.image-frame', '.piece-block', '.piece-block figure', '.piece-strip-scroll', '.note-cover'];
      export const FRAME_IMG = FRAME_HOSTS.map((host) => `${host} > img`).join(', ');

  and the stylesheet's gate rule spells the same list, pinned equal by
  test (two spellings of one list — the second caller is the CSS, which
  cannot import). The compare figure's two images are a device, not a
  frame, and are not in the list.

  The hidden state is script-set, in two parts so that nothing can pop
  and nothing is hidden without script. An inline script in the
  layout's head — `<script is:inline>document.documentElement.dataset.motion=''</script>`,
  before the body is parsed — writes `html[data-motion]`; the gate rule
  reads it:

      html[data-motion] :is(FRAME_HOSTS) > img:not([data-shown]) { opacity: 0; }
      html[data-motion]:not([data-quiet]) :is(FRAME_HOSTS):has(> img:not([data-shown=''])) { background-color: var(--wait-fill); }
      img[data-shown='fade'] { animation: motion-appear var(--dur-appear) var(--ease-state) both; }
      img[data-shown='rise'] { animation: motion-arrive var(--dur-appear) var(--ease-move) both; animation-delay: calc(var(--arrive-stagger) * var(--i, 0)); }
      @keyframes motion-appear { from { opacity: 0; } to { opacity: 1; } }
      @keyframes motion-arrive { from { opacity: 0; transform: translateY(var(--arrive-rise)); } to { opacity: 1; transform: none; } }

  Without script `<html>` never carries the attribute and every
  photograph is visible; the built HTML carries no `data-motion`, no
  `data-shown` and no `view-transition-name`, which the barrier below
  proves on `dist/`. The `:not([data-quiet])` keeps the waiting fill
  off the quiet view's frame, where the mat is the box (the quiet
  rule's `background` shorthand would otherwise lose its colour to a
  more specific fill). `appear()` then, per frame image in `FRAME_IMG`:
  an image with `complete` true is marked `data-shown=""` at once — no
  fade, no rise, so a return to a page replays nothing; every other
  image belongs to a **unit** — its `.piece-block` when that block
  holds more than one image (diptych, triptych, grid, strip, row with a
  pair), otherwise its host — and a unit is revealed as one, when
  every image in it has decoded (`load` then `img.decode()`, never
  `decode()` before `load`, which would fetch a lazy image early) and,
  for a unit not intersecting the viewport at hook time, when one
  `IntersectionObserver` per page with `threshold: --arrive-threshold`
  has seen it; the observer `unobserve`s a unit as it arrives and
  disconnects when the last has. A unit in view at hook time gets
  `data-shown="fade"`; one below the fold gets `"rise"` when
  `--arrive-rise` is non-zero and reduced motion is off, else `"fade"`;
  `--motion-arrive: 0` treats every unit as in view; `--motion-appear: 0`
  marks everything `""` at once. On `animationend` the script writes
  `data-shown=""` so the fill leaves with the fade, and a host with
  `data-understudy` (the travel's, below) loses it there. `--i` is set
  per image in a unit only when `--arrive-stagger` is non-zero. The
  whole of `appear()` is wrapped so that a throw removes `data-motion`
  and shows everything — the one failure that could hide a photograph.
  `appear()` returns a teardown; the layout calls it at
  `astro:before-swap` and calls `appear(document)` again at
  `astro:after-swap`, where it also re-writes `data-motion` on the new
  document's root (the router replaces `<html>`'s attributes). The box
  itself is reserved as today: every `Image` emits width and height and
  every host rule already says `width: 100%; height: auto` or sizes the
  box from `--ar` — a claim T1603 measures as equal rects at
  `DOMContentLoaded` and after `load`.

- **The travel** (`BaseLayout.astro`'s script, on the router's events;
  `src/lib/motion.ts` for `NAME`, `flag`, `token`, `reducedMotion`).
  Three navigations are told apart in `astro:before-preparation` from
  `from`, `to` and `sourceElement`, and nothing is named unless
  `--motion-travel` is 1 and reduced motion is off:
  - **in** — `to` is under `/images/`, `from` is not: the photograph
    the reader clicked (`sourceElement.closest('.image-link')`'s `img`
    — the photograph, not the cell) gets an inline
    `view-transition-name: photograph`; the origin's scroll position is
    stored (`sessionStorage['motion-origin'] = { path, y }`).
  - **step** — both under `/images/`: nothing is named when
    `--arrows-slide` is `0px`, so the root cross-fade carries the
    photograph in its box, as today; the event's `loader` is extended
    to preload the next stage's file — an `Image` given the new
    document's stage `sizes` then `srcset`, awaited through `decode()`
    with a bound of one second — so the new stage is `complete` at the
    swap and the cross-fade goes from one photograph straight to the
    next. The same URL the page requests a moment later: a cache hit,
    not a second request (a claim T1604 verifies from the resource
    timeline). With a slide distance the old and new stage figures are
    named and `data-slide="prev|next"` selects the slide keyframes.
  - **out** — `from` is under `/images/`, `to` is not, whether by the
    page's way-back links or the browser's back: the stage figure is
    named.

  In `astro:before-swap` the new document is dressed before it is
  swapped in (inline styles and attributes on it survive the swap;
  attributes on `<html>` are copied over by the router):
  `data-moving="in|step|out"` on its root; for **in**, the new stage
  figure is named and given the **understudy** — `data-understudy` and
  `--understudy: url(<the clicked image's currentSrc>)` — read by

      .image-frame[data-understudy] { background-image: var(--understudy); background-size: 100% 100%; background-origin: content-box; background-clip: content-box; background-repeat: no-repeat; }

  so the photograph the reader saw is painted in the stage's box the
  instant the page swaps (same photograph, same ratio: the frame's box
  is the photograph's ratio on every surface, so `100% 100%` is not a
  distortion) and stays until the stage's own file has decoded and
  faded in over it, which is when `appear()` removes it. The old
  snapshot is the cell's `img`, the new is the figure wearing the
  understudy: the group morphs one small rendering of the photograph
  into the other, nothing blank between. For **out**, the cell whose
  href is `from.pathname` is named in the new document, and at
  `astro:after-swap` (after the router's own scroll: to top for a link,
  to the saved position for a traverse) the page is scrolled to the
  stored `y` when the stored path matches, else the cell is
  `scrollIntoView({ block: 'center' })` — so the photograph lands in
  its own cell. Every name, `data-moving` and `data-slide` is cleared
  on the swap event's `viewTransition.finished`. `.site-header`
  declares `view-transition-name: site-header`: chrome, excluded from
  the page's cross-fade and never blended with the photograph; where
  the old page had hidden it (`data-hidden`), it slides in on its own
  group at `--dur-state` — its inherited slide, on the token. A
  browser without `document.startViewTransition` takes the router's
  `fallback="animate"` path, which with no directive animations is a
  cut — the page changes exactly as it does today there.

- **The quiet view as one movement** (`src/pages/images/[...id].astro`'s
  script; `withTransition()` in `motion.ts`). `setQuiet` runs its three
  writes — the attribute toggle, the store, the scroll to top — inside
  `document.startViewTransition`, with the stage figure named for the
  duration and `data-moving="quiet"` on the root: the old snapshot is
  the bare frame on paper, the new is the matted frame on the dark, and
  the group morphs one into the other while their cross-fade brings
  the mat in with the growth and the root's cross-fade darkens the
  ground — one movement, all three at `--dur-move --ease-move`, on the
  compositor. The resting states are untouched: the cascade does what
  it does today (`html[data-quiet]` switches the stage's limits, the
  frame's width gate, the mat and the ground), and no rule of the
  stage's or the quiet view's changes by a byte. The page's scoped
  `transition: background-color 220ms ease` on `html, body, .image-stage`
  and its reduced-motion `transition: none` are deleted: under a view
  transition a live background transition would run beneath the
  snapshot cross-fade and fight it; without the API the quiet view
  cuts (the reduced-motion outcome, "simply dark"). `--motion-quiet: 0`
  is the plain toggle; under reduced motion the figure is not named and
  the transition runs nameless when `--rm-quiet` is 1 (the ground
  fades, the frame cuts to its matted size) or not at all when it is 0.

  `withTransition(update, moving, named, animate)`: `animate` false or
  no `startViewTransition` → `update()` synchronously; else name
  `named` (when given), set `data-moving`, start, and on `finished`
  clear both. The image page is its one caller today; the layout's
  travel wires the router's events instead of calling it, because the
  router owns that transition. One helper, not a module of transition
  kinds: the second caller does not exist.

- **The dev switch** (`src/components/DevMotion.astro`, rendered by
  `BaseLayout.astro` beside `DevGround` under `import.meta.env.DEV`;
  its panel served from `src/components/dev-motion-panel.ts`). Two
  inline scripts, DevGround's pattern: a blocking head applier that
  reads `localStorage['dev-motion']` (`{ tokens }`) and sets each entry
  on `<html>` before first paint and again at `astro:after-swap`; and
  `<script is:inline type="module" src="/src/components/dev-motion-panel.ts">`,
  served by the dev server and never bundled (the sampler's reason,
  ground.test.mjs (h) pins the form), which at `astro:page-load`
  builds a `<details>` panel in the page's corner from `MOTION_TOKENS`
  in `motion.ts` — a checkbox per flag, a field per duration, curve and
  number, a select for the arrival's shape (fade / rise, writing
  `--arrive-rise` as `0px` or the rise field's value) and for the
  waiting fill (surface / ground), the effective value of each token
  read from the computed style beside it, and reset, which clears the
  key and every inline property so the committed stylesheet is the
  control. The panel's styles are set by the script, never a `<style>`
  block, so nothing of it can enter the bundle. Marker: the string
  `dev-motion` (the applier's attribute, the storage key, the panel's
  path); `scripts/check-no-dev-routes.mjs` scans for both markers. The
  switch stays in the repo after the pause.

- **The scanner and the barrier** (`src/lib/motion-scan.mjs`,
  `scripts/check-motion.mjs`, `motion.test.mjs`). `scanMotion(css)`
  finds, in every `transition*` and `animation*` declaration, a
  literal time other than zero, an easing keyword or function, an
  iteration count or `infinite` — after `var()` and `calc()` groups are
  removed, so `calc(var(--dur-move) * var(--hero-enter))` passes and
  `180ms` fails. Two callers: the test runs it over `global.css` and
  every `<style>` block in `src/**/*.astro` (line-numbered findings),
  and the postbuild barrier runs it over `dist/_astro/*.css` and every
  `<style>` in `dist/**/*.html`, and also fails a page that carries
  `data-motion`, `data-shown`, `data-moving`, `data-understudy`, an
  inline `view-transition-name` or `autoplay` — the no-script pin on
  `dist/`. `dist/pagefind/` is excluded: pagefind's UI stylesheet is a
  third party's, loaded on the search page alone, and its transitions
  are not the site's (a known limitation, below). A companion pin in
  the test: no `transition:` directive in any `.astro` file — Astro
  would inject its own literal-duration animations for one.

- **The documents** are the spec's list: the brief's Motion section,
  spec 007's non-goal annotated, README and AUTHORING (T1607), and
  DECISIONS and ROADMAP at close-out (T1608).

## Failure messages and notes

The barrier's two lines, one per scan, on a green build:

```
[check-motion] no literal duration or curve in N stylesheets; no hidden frame, inline transition name or autoplay in M pages.
[check-no-dev-routes] no dev routes in dist/; no dev-ground or dev-motion marker in K files.
```

On a failure each names the file and the finding:

```
[check-motion] literal motion in dist/_astro/index.abc123.css: transition: transform 220ms ease — "220ms", "ease"
[check-motion] a frame hidden by default in dist/pieces/x/index.html: data-shown
```

`scripts/verify.sh` gains `\[check-motion\]` in its grep so the line
prints with the other barriers; `package.json`'s `postbuild` runs it
last. The build's page count moves by nothing (87); the test count
rises by `motion.test.mjs`'s cases and one in `page-head.test.mjs`,
recorded by the implementer.

## Testing strategy

Every claim above is owned by a task and a check:

- **The grammar is one set of tokens, declared once, and everything
  reads it** — `motion.test.mjs`, **T1600**. (a) `:root` declares
  exactly the eighteen names in `EXPECTED` with those values (the
  table at the top of the file is the one edit a round makes beside
  the stylesheet), and no other rule in `global.css` or any file under
  `src/` declares one of them outside the reduced-motion block's
  `:root { --arrive-rise: 0px }` (walk, matte.test.mjs (a)'s shape).
  (b) `scanMotion(global.css)` is empty; every `<style>` block in every
  `src/**/*.astro` scans empty; no `.astro` file carries a
  `transition:` directive or `autoplay`. (c) The inherited rules, by
  string: `a:not(.brand, .button)`'s `transition`, `.site-header`'s,
  `.button`'s, `.social-links a`'s, `.hero > *`'s `animation` and the
  three delays, and `keel-enter`'s body unchanged. (d) The
  reduced-motion block contains exactly the five rules above and no
  `*` prelude, no `1ms`, no `scroll-behavior`, and no rule under it
  names an `opacity` transition or the appearance animation with a
  zero. Mutations, each reverted: `220ms` restored on `.site-header` →
  (b) fails naming the line; `--dur-state` declared on `.button` → (a)
  fails; the blanket `*` rule restored → (d) fails; `--dur-move`
  retyped `500ms` → (a) fails against `EXPECTED`.

- **The scanner can fail** — `motion.test.mjs`, **T1601**, unit cases
  on `scanMotion`: `transition: color 180ms ease` → two findings;
  `transition: color var(--dur-state) var(--ease-state)` → none;
  `animation: k calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both`
  → none; `animation: k var(--d) infinite` → one; `animation-iteration-count: 3`
  → one; `animation-delay: 90ms` → one; `transition-duration: 0s` →
  none; minified `a{transition:color 180ms}` → one. **The barrier**,
  page-head.test.mjs's shape (temp dirs, `execFileSync`): a dir whose
  `_astro/x.css` carries `220ms` exits 1 naming the file; a dir with
  `data-shown` in a page exits 1; `autoplay` exits 1; a clean dir
  exits 0 and prints the line above; a `dist/pagefind/pagefind-ui.css`
  with literals is ignored. `page-head.test.mjs`'s barrier describe
  gains a `data-dev-motion` fixture that fails naming the file, and
  its clean-run string reads the new wording.

- **The hidden state is the script's, and the hooks are the markup's**
  — `motion.test.mjs`, **T1602** and **T1603**: every rule in
  `global.css` whose declarations set `opacity: 0` has a prelude
  beginning `html[data-motion]` or sits inside `@keyframes`; the gate
  rule's `:is(...)` list equals `FRAME_HOSTS` (normalised); no file
  under `src/` or the transform writes `data-motion`, `data-shown`,
  `data-moving` or `data-understudy` in markup (the strings appear in
  `global.css`, `motion.ts`, the layout's inline script and the two
  page scripts only — listed); `remark-pieces-blocks.mjs` still emits
  `'image-link'` and `'piece-block'` (the two literals the hooks lean
  on); `PieceList.astro` wraps its image in `span.note-cover`;
  `ms('480ms')` is 480, `ms('.5s')` 500, `ms('')` 0. Mutation: the
  gate's `html[data-motion]` prefix dropped → the opacity walk fails.

- **The quiet view's rules are byte-identical** — `motion.test.mjs`,
  **T1605**: the page's scoped `:global(html[data-quiet]) …` `display: none`
  list and the two-selector `background: var(--color-quiet)` rule equal
  `main`'s strings (pasted); the page's `<style>` has no `transition`
  declaration at all; matte.test.mjs's stage, frame and quiet-frame
  cases pass unedited. Then the measurement: at 1512×982 and 1280×1440
  on `land-b` and `port-a`, the frame's padding, background, figure
  and image sizes and the stage's height in both views equal spec
  017's T1502/T1503 records; during the toggle `document.getAnimations()`
  holds an animation on `::view-transition-group(photograph)` and one
  on `::view-transition-group(root)` whose `effect.getTiming().duration`
  is `--dur-move`'s number and easing `--ease-move`'s string; after
  `finished` the figure's inline `view-transition-name` is empty and
  `html` has no `data-moving`; with `--motion-quiet: 0` set on `html`
  no animation is created and the states toggle; under reduced motion
  (`ui.prefersReducedMotion=1` in the headless profile) with
  `--rm-quiet` 1 only the root group animates, and with 0 none.

- **Appearance and arrival** — **T1603**, on the dev server
  (Firefox 156 headless via BiDi, spec 015's recipe; a preload script
  records rects at `DOMContentLoaded`): on `/pieces/where-the-fog-lets-go/`
  and `/pieces/vocabulary-sampler/` (every treatment), `/galleries/fog-frames/`,
  `/places/the-headlands/`, `/images/where-the-fog-lets-go/land-b/`
  and `/pieces/` at 1512×982 and 1280×1440, cache cleared: every
  `FRAME_IMG` host's rect at `DOMContentLoaded` equals its rect after
  `load` (zero shift); at hook time each in-view undecoded image has
  no `data-shown` and computed `opacity` 0 with its host's
  `background-color` the resolved `--color-surface`, and each `complete`
  image has `data-shown=""`; after `load`, every in-view image reads
  `data-shown="fade"` then `""` with an animation of `--dur-appear`'s
  duration seen in `getAnimations()`; scrolling to a diptych below the
  fold: no image in it is shown before both have decoded and the block
  intersects at the threshold, and both flip in the same frame
  (`requestAnimationFrame` timestamps equal); with `--arrive-rise: 0.5rem`
  set on `html`, the below-fold block's images read `"rise"` and the
  keyframe's `from` transform is the length; with `--arrive-stagger: 80ms`
  the second image's `animation-delay` is 80ms; scrolling back up
  changes no attribute; a reload with the cache warm marks every image
  `""` at once and creates no animation. Without script (the sandboxed
  iframe recipe from spec 017's T1503): `html` has no `data-motion`,
  every frame image's computed `opacity` is 1. Under reduced motion:
  `"fade"` still animates at `--dur-appear`; no `"rise"` is written;
  the `.site-header`'s `transition-duration` is 0s. Observer hygiene
  is read in the code (`unobserve` on arrival, `disconnect` at the end
  and at teardown) and in behaviour (no attribute changes after all
  units arrived).

- **The travel** — **T1604**, same recipe: from `/galleries/fog-frames/`
  scrolled so a cell is mid-screen, clicking it: during the transition
  `getAnimations()` holds `::view-transition-group(photograph)` at
  `--dur-move` / `--ease-move` and `::view-transition-group(root)` at
  `--dur-move` (under `data-moving`), the clicked `img` carried the
  name and the new figure carries it and `data-understudy` with
  `--understudy` equal to the clicked image's `currentSrc`; after the
  stage decodes and fades the figure has neither; `html` has no
  `data-moving` after `finished`. Back (history): the cell for the
  image page's path is named in the new document, the scroll position
  equals the one before the click, `data-moving="out"` during. The
  page's "In the gallery" link: the same, the scroll restored from
  `motion-origin`. From a piece, a place wall and a related strip:
  the same reads (the strip's clipped rect recorded). An arrow: no
  element named, only the root group animates at `--dur-move`, the
  next stage image is `complete` at `astro:after-swap`, and
  `performance.getEntriesByType('resource')` lists its candidate URL
  once; with `--arrows-slide: 2rem` both figures are named and the
  old/new photograph pseudo-elements animate the slide keyframes.
  The header: `::view-transition-group(site-header)` present, the
  root cross-fade never includes it. With `dom.viewTransitions.enabled=false`
  in the profile: no error in the console, the page changes as on
  `main`. Under reduced motion: nothing named on any navigation; the
  root group still animates (the deviation recorded).

- **Nothing else moves** — every task's Verify carries
  `git diff -U0 main -- src/styles/global.css | grep '^@@'` and the
  hunks are listed: none inside `.image-stage`, `.image-frame`,
  `.image-frame img`, the two `html:not([data-quiet])` rules, the
  three `html[data-quiet]` rules, `.gallery-flow*`, any `.piece-*`
  rule, or the `--color-*` lines; `git diff main -- 'src/pages/images/[...id].astro'`
  shows only the deleted transition block and the script's `setQuiet`
  and imports; `matte.test.mjs`, `ground.test.mjs`, `galleries.test.mjs`,
  `place-page.test.mjs` green and unedited.

- **No new request, no new byte** — T1603's and T1604's resource
  timelines on the gallery and the image page against `main`'s
  (recorded); the preload's URL appears once.

- Existing suites stay green (the count recorded); build with its three
  barriers; `astro check`; Prettier on every touched file.

## File structure

```
src/styles/global.css                     :root — the eighteen tokens and their comment; a: / .site-header (+ view-transition-name) / .button / .social-links a / .hero rules on the tokens; the reduced-motion block rewritten (T1600). The Motion section at the end: the gate, the fill, the two appearance animations and keyframes, the understudy, the view-transition group rules, the slide variant's rules and keyframes (T1603, T1604)
src/lib/motion.ts                         new: MOTION_TOKENS, NAME, FRAME_HOSTS, FRAME_IMG, ms(), token(), flag(), reducedMotion(), withTransition(), appear() (T1602; appear() at T1603)
src/lib/motion-scan.mjs                   new: scanMotion(css) — the literal, easing and iteration finder (T1601)
scripts/check-motion.mjs                  new: the postbuild barrier over dist/ (T1601)
scripts/check-no-dev-routes.mjs           MARKERS = ['dev-ground', 'dev-motion'], the message (T1601)
scripts/verify.sh, package.json           the barrier's grep line; postbuild runs check-motion last (T1601)
motion.test.mjs                           new: the grammar pins, the scanner cases, the barrier cases, the hidden-state walk, the hooks pins, the quiet strings (T1600–T1605 as Testing strategy names them)
page-head.test.mjs                        the clean-run string; a data-dev-motion case (T1601)
src/components/DevMotion.astro            new: the applier and the served panel script (T1602)
src/components/dev-motion-panel.ts        new: the panel (T1602)
src/layouts/BaseLayout.astro              <DevMotion /> beside <DevGround />; the inline data-motion script in the head; the script: appear() at module time and after-swap, the three router listeners of the travel (T1602, T1603, T1604)
src/components/PieceList.astro            span.note-cover around the cover (T1603)
src/pages/images/[...id].astro            the 220ms block and its reduced-motion rule deleted; setQuiet through withTransition (T1605)
README.md, AUTHORING.md, design/brief.md, specs/007-held-image/spec.md   per the spec's "The documents" (T1607)
ROADMAP.md, DECISIONS.md                  close-out (T1608, implementer-edited, orchestrator-committed)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`remark-pieces-blocks.mjs` and the plugin; `src/content/**`;
`src/content.config.ts`; `.image-stage`, `.image-frame`, `.image-frame img`,
both `html:not([data-quiet])` rules, the three `html[data-quiet]`
rules, `.gallery-flow*`, every `.piece-*` rule, `.note-row img`, the
`--color-*` tokens, `--color-quiet`, the mat tokens; `src/lib/gallery-layout.ts`,
`src/lib/stage-sizes.ts`, `src/lib/image-set.ts`; `astro.config.mjs`;
`package.json`'s dependencies.

## Known limitations

- **A page change under reduced motion still cross-fades** (at
  `--dur-state`): the router has no reduced-motion path on a site
  without `transition:*` directives (verified in `astro/dist`). A fade,
  within Goal 6; a cut is one rule in the reduced-motion block
  (`::view-transition-group(*) { animation-duration: 0s }`) if wanted.
- **The gate depends on the module running.** `html[data-motion]` is
  written by an inline script before the body; if the layout's module
  then fails to evaluate (a script error in an old browser), frames
  stay hidden. `appear()` removes the attribute on any throw, and
  `astro check` plus the browser reads are the guard; a timed CSS
  fallback is exactly what the rule forbids. Without script at all
  nothing is hidden, by construction and by the barrier.
- **The way back names a cell the browser may have evicted.** The new
  snapshot for **out** is the cell's live `img`; if its file is no
  longer in cache the photograph fades to the waiting fill as it lands
  and fades back in when the cell decodes. Rare on a page the reader
  just left; recorded, not fixed.
- **A frame inside the strip's scroller** travels from its clipped
  rect (the snapshot is what was visible). Recorded at T1604.
- **The preload for an arrow step is bounded at one second**; on a
  slow network the step proceeds with the fill and the fade. A wait
  bound, not a timer-started animation.
- **`dist/pagefind/pagefind-ui.css` carries literal transitions** —
  pagefind's, on the search page's results only; excluded from the
  barrier by path and from the grammar's claim, which is about the
  site's own styles. Recorded here and in the brief's Motion section.
- **The waiting fill reaches every frame through its host**; the
  hosts are the six in `FRAME_HOSTS`. A new surface that places an
  `img` outside them waits on the ground and fades without a fill —
  the pin on the list is where it is added.
- **The quiet view without the View Transitions API cuts**, where it
  used to fade its ground over 220ms. Firefox 144+, Chrome 111+ and
  Safari 18+ have the API; the photographer's Firefox 156 does.
- **The hero's duration is now the move duration** (480ms, from
  560ms); the pause judges it, and the front door spec decides whether
  the entrance stays.
- **`:has()` and `img.decode()`** are relied on (Firefox 121+ / 68+);
  a browser without `:has()` would not paint the waiting fill and
  would still fade.
- **The constitution has no "Scale" section** to read; the five tests
  the planner brief names were applied from the brief itself, and each
  choice below says which way it went.

## Resolved decisions

- **Off is a flag token, not a deleted rule** (`--motion-*: 0`,
  `--hero-enter: 0`): the envelope says "the code stays, the token or
  flag turns it off, and the test pins the off state". Script-read
  flags are `1`/`0` strings; CSS-read ones are multipliers in `calc()`,
  so a zero is honest in the stylesheet too.
- **The arrival's shape is the rise token's zero** (`--arrive-rise: 0px`
  is the fade alone), not a separate shape flag plus a distance: one
  token, and the switch's shape select writes it. Two fewer things to
  keep in step. The default ships as the fade alone — the quieter of
  the two; the pause picks.
- **The hidden state is a root attribute gating a stylesheet rule**
  (`html[data-motion]` written by an inline script) rather than a
  per-image attribute set when the module runs. The module runs after
  the parse; a long page can paint before that, and an image caught
  mid-paint would blink out when hidden. The gate hides before first
  paint and the module releases what is already complete — the same
  guarantees, no blink, one attribute; the trade is the module-failure
  case above.
- **Hooks at module time and `astro:after-swap`, not `astro:page-load`**
  — the router fires the initial page-load on `window`'s `load`, after
  every image (router.js:414); binding there would make the appearance
  a no-op on every first visit.
- **One IntersectionObserver per page, units not images** — the spec's
  "cells of one block arrive together" is a unit's property; one
  observer with `unobserve` per unit meets "disconnects from a frame
  once it has arrived" at less cost than one observer per frame.
- **The understudy is the previous page's rendering as the figure's
  content-box background**, not a preload before the swap, for the
  travel in: a preload would delay the click's response by the large
  file's load; the understudy starts the travel at once and the stage
  fades in over it. The arrow step, which is not a travel and shows a
  different photograph, preloads instead (bounded), because
  "cross-fade one photograph into the next" needs the next one there.
  Two mechanisms for two different needs; neither shares code.
- **The stage figure is the named element on the image page, the
  `img` on every other surface.** The figure's box is the image's box
  on paper and the image plus its mat in the quiet view, which is what
  "the mat arrives with the growth" needs; naming the `img` would grow
  the photograph and pop the mat in after. On a cell the `img` is the
  photograph and the anchor is the cell (the spec: not the cell, not
  its label).
- **The arrows name nothing by default** (`--arrows-slide: 0px`): the
  root cross-fade is "cross-fade the photograph in its box"; naming
  both figures would morph a 3:2 box into a 2:3 one, a movement the
  spec says the arrows do not make. The slide variant is built on the
  same flag with four rules and two keyframes, judged by eye.
- **`data-moving` on the root sets every group to the move duration**
  rather than a per-kind duration list: one attribute, one rule, one
  token; the page beneath the photograph lands with it. The arrows'
  cross-fade is therefore at `--dur-move` too, which suits a photograph
  better than the state duration; the token is the tunable.
- **The header is named `site-header`**: chrome that neither travels
  nor blends. Its group's morph from a hidden to a shown state is its
  own inherited slide, on the token. One declaration to remove if the
  photographer sees it differently.
- **The page's 220ms ground transition is deleted, not re-tokened**:
  under a view transition it would run live beneath the snapshot
  cross-fade and fight it, and without the API the quiet view cutting
  is the spec's reduced-motion outcome. Deleting over configuring.
- **`PieceList` gets a wrapper span** for its cover, because the fill
  must sit on a box the fade does not hide (opacity on the `img` hides
  its own background), and the row anchor is the whole row. The
  cover-card span already exists; this is its sibling. The `.note-row img`
  rule keeps its own soft background, unread while the image waits.
- **The scanner is a module with two callers** (the test over sources
  with line numbers; the barrier over `dist/`, where Astro's injected
  styles and the minified bundle are what actually ships). The barrier
  also carries the no-script pin because the spec asks for it "on
  `dist/`", and the two scans walk the same files.
- **`dist/pagefind/` is excluded from the barrier**, not the search
  page: the page's own styles are scanned; the third-party stylesheet
  is not the site's grammar.
- **`scroll-behavior: auto !important` leaves with the blanket**: the
  site sets no scroll behaviour and the settle is a non-goal.
- **Three durations, and the hero reads the move one**: a fourth token
  for one inherited entrance would be an abstraction with one reader
  that the front door spec may delete.
- **No new dependency** — the stylesheet, `startViewTransition`,
  `IntersectionObserver`, `img.decode()`.
- **`ROADMAP.md` and `DECISIONS.md` are edited on the branch** and
  reach `main` through the PR — spec 017's practice.
