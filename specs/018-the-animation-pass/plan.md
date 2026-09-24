# Plan: The animation pass

**Status**: Signed off (2026-09-23) by the `skeptical-reviewer` at the
top tier — five blocking findings fixed and eight notes folded in, then
the re-review's four remaining lines transcribed from their exact text
below ("Carried from the sign-off") and into T1603 and T1604; see
tasks.md's tier log.
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
  reduced-motion block if the photographer wants it. (Astro ships a
  `components/viewtransitions.css` whose lines 56–66 put
  `animation: none !important` on the view-transition pseudo-elements
  under `prefers-reduced-motion`; nothing in `node_modules/astro`
  imports or references it, so it is dead on this site. If a later
  Astro wires it in, its `!important` would beat this spec's
  `html[data-moving]::view-transition-group(*)` rules under reduced
  motion — which would reverse the spec's corrected line and cut the
  quiet view's ground fade as well.)

- **The grammar** (`src/styles/global.css`, `:root`, after
  `--place-wall-gap`). Three durations, three curves (`--ease-appear` added at the Phase 1
  pause, D1606 Q3, so the appearance's curve moves without the
  travel's or the hovers'), and beside them the
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
      --motion-appear-covers: 1; /* the covers on the three indexes and the front door: their own appearance and arrival flags */
      --motion-arrive-covers: 1;
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
  `.button` and `.social-links a` (their colour transitions — three on `.button`, two on `.social-links a`), and
  `.hero > *` — `animation: keel-enter calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both`
  with the three delays `calc(var(--hero-stagger) * 1 * var(--hero-enter))`,
  `calc(var(--hero-stagger) * 2 * var(--hero-enter))`,
  `calc(var(--hero-stagger) * 3 * var(--hero-enter))`. The hero's 560ms
  becomes the move duration's value (three durations, not four — the
  spec's "on the order of three"); a multiplier of 0 on the flag makes
  the animation and its delays zero-length, and `both` lands every child
  on its end state at once, which is how "switched off" keeps the code.
  The delays read the flag too: a zero-length animation behind a
  surviving delay holds its child at `from` (opacity 0) for the delay
  and then shows it — a staggered pop, not off. Reduced motion switches
  the entrance off through the same flag. _(T1600 review, 2026-09-23:
  B2, the decision review's option D.)_ The page-level
  `::view-transition-group(*)` rule gives every page change's root
  cross-fade `--dur-state --ease-state` in place of the UA's 0.25s
  (old/new pseudo-elements inherit the group's duration per the UA
  stylesheet); under `html[data-moving]` — the attribute the script
  sets while a photograph is travelling, stepping or growing — every
  group takes `--dur-move --ease-move`, so the page beneath lands with
  the photograph. Beside those two, `::view-transition-old(*), ::view-transition-new(*) { animation-timing-function: inherit; }`:
  the UA stylesheet inherits duration, fill and delay from the group
  but not the timing function (csswg-drafts #11546; closed via PR #12498, which adds `inherit` to the UA sheet — the rule stays for browsers on the older sheet), and `inherit` is
  not a literal to the scanner. One rule and one attribute rather than
  a per-case duration: the simpler shape, and the token is the tunable.
  The two `*-covers` flags exist because the envelope names the covers
  as their own question: script reads `--motion-appear` and
  `--motion-arrive` from the **host's** computed style, not the root's
  — custom properties inherit, so one rule in the Motion section,
  `.note-cover, .gallery-card .image-link { --motion-appear: var(--motion-appear-covers); --motion-arrive: var(--motion-arrive-covers); }`,
  gives the covers their own switch and any later surface gets one in
  one line. Twenty-one tokens in all (twenty until D1606).

- **Reduced motion** (`global.css`, the `@media (prefers-reduced-motion: reduce)`
  block). The blanket `* { animation-duration: 1ms; transition-duration: 1ms; scroll-behavior: auto }`
  is replaced by the distinction the spec draws — movements instant,
  fades kept — as four rules, pinned by string:

      :root { --arrive-rise: 0px; --hero-enter: 0; }   /* the arrival loses its rise; the hero lands on its end state, delays included */
      a:not(.brand, .button, .social-links *) { transition-property: color; }   /* the underline's size change is instant; the colour still fades — the social links, which cancel the underline, keep their border and colour fades */
      .site-header { transition-duration: 0s; }
      img[data-shown='fade'], img[data-shown='rise'] { animation-duration: calc(var(--dur-appear) * var(--rm-appear)); }

  `scroll-behavior` leaves with the blanket: the site never sets it
  (the scroll settle is a non-goal), so the reset was resetting
  nothing. One rule reaches the view transitions:
  `::view-transition-group(*) { animation-name: none; }`. Every group
  lands on its new box at once — the header returning from
  `data-hidden` or `data-held-active` would otherwise slide in on its
  own group — while `::view-transition-old(*)` / `-new(*)` inherit the
  group's `animation-duration`, which the rule leaves set, so every
  cross-fade keeps its length; it also makes harmless any name that
  reaches a group under the setting (D1604, Q1). The script never
  names the photograph under reduced motion; the quiet view's ground fade runs as a nameless view
  transition when `--rm-quiet` is 1 and as a plain toggle when it is 0.
  `0s` is the one literal the scan allows in a duration slot — a zero
  is the absence of motion, not a duration.
  The hero goes through its flag, not a `.hero > *` rule: that rule's
  `animation-delay: 0s` (0,1,0) lost to the `.hero > :nth-child(n)`
  delays (0,2,0). The link rule excludes `.social-links *` at unchanged
  specificity (0,1,1) because `.social-links a` is also (0,1,1) and the
  later reduced-motion rule would otherwise cut its border fade. Every
  rule here overrides its base rule at equal specificity by coming later
  in the file, so the block stays after them. _(T1600 review,
  2026-09-23: B1 and B2.)_ Because the dev switch writes tokens inline on
  `<html>`, which outranks these `:root` overrides, the switch writes
  only the tokens the person has changed (a note for T1602).

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
  layout's head, before the body is parsed, writes `html[data-motion]`
  and arms its own release:

      document.documentElement.dataset.motion = '';
      addEventListener('load', () => { if (!window.__motion) delete document.documentElement.dataset.motion; }, { once: true });

  The module sets `window.__motion = true` the moment `appear()` binds;
  a deferred module always evaluates — or fails — before `load`, so the
  release never races a healthy run and never fires on one, and a page
  whose module never arrives (a stale hashed chunk after a deploy, a
  throw ahead of `appear()` in the layout's script) shows every frame
  at `load`: a response to an event, which Goal 2 allows, not a timer.
  The gate rule reads the attribute:

      html[data-motion] :is(FRAME_HOSTS) > img:not([data-shown]) { opacity: 0; }
      html[data-motion]:not([data-quiet]) :is(FRAME_HOSTS):has(> img:is(:not([data-shown]), [data-shown='fade'])) { background-color: var(--wait-fill); }
      img[data-shown='fade'] { animation: motion-appear var(--dur-appear) var(--ease-state) both; animation-delay: calc(var(--arrive-stagger) * var(--i, 0)); }
      img[data-shown='rise'] { animation: motion-arrive var(--dur-appear) var(--ease-move) both; animation-delay: calc(var(--arrive-stagger) * var(--i, 0)); }
      @keyframes motion-appear { from { opacity: 0; } to { opacity: 1; } }
      @keyframes motion-arrive { from { opacity: 0; transform: translateY(var(--arrive-rise)); } to { opacity: 1; transform: none; } }

  Without script `<html>` never carries the attribute and every
  photograph is visible; the built HTML carries no `data-motion`, no
  `data-shown` and no `view-transition-name`, which the barrier below
  proves on `dist/`. The `:not([data-quiet])` keeps the waiting fill
  off the quiet view's frame, where the mat is the box (the quiet
  rule's `background` shorthand would otherwise lose its colour to a
  more specific fill). `appear()` then, per frame image in `FRAME_IMG`,
  with the flags read from the image's host
  (`getComputedStyle(host).getPropertyValue('--motion-appear')`, and
  `--motion-arrive` likewise — the covers rule above is what makes a
  surface's own value differ from the root's): an image with `complete`
  true is marked `data-shown=""` at once — no fade, no rise, so a
  return to a page replays nothing — and so is an image whose `load`
  fires before the first animation frame after the hook (a
  `requestAnimationFrame` settles the hook; a `load` that arrives
  before it means the browser already held the file and only the event
  was late): that rule is stated so the design does not rest on whether
  a memory-cached image reads `complete` in the same task the router
  adopts the body — a browser detail T1604 measures rather than assumes
  (Known limitations). Every other image belongs to a **unit** — its
  `.piece-block` when that block holds more than one image and the
  image is not in a strip's band (diptych, triptych, grid, row with a
  pair); an image inside `.piece-strip-scroll` is its own unit — its
  `a.image-link`, or the `img` itself when it is unlinked (`alt=""`),
  since the band is then its host and would otherwise be shared;
  otherwise its host. A strip is excluded because its band scrolls:
  the browser does not fetch a lazy frame beyond the band's edge, so a
  unit spanning the band would hold every frame hidden until the reader
  scrolled it sideways to its end, and fetching early would break AC13.
  Each strip frame arrives as it enters the band's visible width; the
  observer respects the scroller's clip. (Measured at T1603 on the
  sampler at 1280×1440: a 2528px band in a 1280px scroller; decision
  review 2026-09-23, Q1.) A broken file does not hold its unit: an
  image's `error` counts as ready. A unit is revealed as one, when
  every image in it has decoded (`load` then `img.decode()`, never
  `decode()` before `load`, which would fetch a lazy image early) and,
  for a unit not intersecting the viewport at hook time, when one
  `IntersectionObserver` per page has seen it arrive — arrival being
  `entry.intersectionRatio >= --arrive-threshold` (the share of the
  unit in view), or, for a unit too tall ever to reach that share,
  `entry.intersectionRect.height >= --arrive-threshold × rootBounds.height`;
  the observer's thresholds are the token plus steps of 0.05 so a tall
  unit keeps getting callbacks (`isIntersecting` alone fires at the
  first pixel whatever the threshold — Phase 1 review B1); a unit that does not replay is `unobserve`d as it arrives (see
  **Re-entry** below for the units that replay). A unit in view at hook time gets
  `data-shown="fade"`; one below the fold gets `"rise"` when
  `--arrive-rise` is non-zero and reduced motion is off, else `"fade"`;
  `--motion-arrive: 0` on a host treats its unit as in view;
  `--motion-appear: 0` on a host marks its image `""` at once. On
  `animationend` the script writes `data-shown=""`. The waiting fill
  paints while an image waits or fades and leaves with the fade; under
  `"rise"` it leaves as the image starts to move, since the host stays
  still while the photograph travels and a fill kept beneath it shows
  as a band the photograph has not reached (T1606a: 4.78px at 0.5rem,
  10% in; decision review D1606a). The fill rule's `:is(...)` list is
  pinned equal to `FRAME_HOSTS` like the gate's. A host carrying `data-understudy` (the travel's,
  below) is stripped of it and of `--understudy` on **every** path that
  writes `data-shown=""` — the `animationend`, the `complete`
  short-cut, the early-`load` rule, the appear-off case — so a second
  visit to a stage never keeps the previous rendering under a live
  photograph. `--i` is set
  per image in a unit only when `--arrive-stagger` is non-zero. The
  whole of `appear()` is wrapped so that a throw removes `data-motion`
  and shows everything — the one failure that could hide a photograph.
  `appear()` returns a teardown; the layout calls it at
  `astro:before-swap` and calls `appear(document)` again at
  `astro:after-swap`, where it also re-writes `data-motion` on the new
  document's root (the router replaces `<html>`'s attributes). The box
  itself was assumed reserved as today (every `Image` emits width and
  height and every host rule says `width: 100%; height: auto` or sizes
  the box from `--ar`); T1603 measured it false in two places, both
  identical on `main` — `.piece-tall`'s host is 0×0 until its lazy image
  loads, and the image page's related strip moves ~555px at `load` —
  fixed at T1603b and diagnosed at T1603c (decision review 2026-09-23,
  Q2). AC3's "zero layout shift" is measured by the platform's own
  definition: each host's **size** equal at `DOMContentLoaded` and
  after load, its position (in document coordinates) moved by less
  than 3px (the Layout Instability API counts nothing smaller);
  sub-pixel moves are recorded, not fixed.

  **Re-entry (amended at the Phase 1 pause; decision review D1606,
  Q1).** A unit **replays** when every image in it has the appearance
  on, its host has the arrival on (so the covers replay only when
  `--motion-arrive-covers` is on), and the fade has a duration for this
  reader (not `prefers-reduced-motion` with `--rm-appear: 0`: a hidden
  frame snapping in at the threshold would be a pop). Every replaying
  unit is observed for the page's life, whether it is complete, in view
  or waiting at the hook. A unit that does not replay keeps the
  once-only path: observed only when below and waiting, `unobserve`d on
  arrival. On a callback for a replaying unit — **leave:**
  `!entry.isIntersecting`, meaning the unit is wholly off screen: if
  any image in it carries `data-shown`, the attribute is removed from
  every image (the gate hides it; the waiting state's fill rule,
  whatever it is, applies unchanged), then `revealed`, `arrived` and
  `inView` go false, whether or not any image carried the attribute: a
  unit still loading must not fade in off screen. The reset is skipped
  while `<html>` carries `data-quiet`: the quiet view hides the page's
  other frames with `display: none`, which is not leaving the screen,
  and `data-quiet` is set inside the quiet view's update, before any
  report of that hiding. When `data-quiet` is removed, every replaying
  unit is observed afresh (a `MutationObserver` on the root's
  `data-quiet`, `unobserve` then `observe`, disconnected at teardown),
  so a frame the quiet view hid and the exit left off screen is reset
  there, and one on screen is left alone (T1606b review B1). `leave()`
  also strips a host's `data-understudy` and `--understudy`, so a fade
  cut short by scrolling away never replays over the stand-in. It is **not** skipped while `data-moving` is
  set. A page change's transition (the way back, an arrow step) is when
  the observer's first report arrives, and a frame off screen then is
  really off screen. So the held frames below the landing, made eager
  and shown `""` at the hook, are reset there and appear when scrolled
  to (D1606 follow-up, 1). **arrive:**
  `arrives(entry, threshold)`, unchanged, on a unit not yet `arrived`;
  it marks `arrived` and records `edge(entry)`. The gap between the two
  (fully out to reset, the threshold to arrive) is the hysteresis: a
  frame straddling an edge by less than the threshold is never reset
  or replayed. `reveal` also counts a unit as revealed when the
  complete short-cut has shown all of it, so a unit already shown in
  view is left alone by its first callback, and the way back replays
  nothing where it lands: its frames are shown `""` at the hook and are
  on screen at the observer's first report. A replayed unit is never
  "in view at the hook". It reads `"rise"` when rise is on and its edge
  is `top` or `bottom`, with `--rise-sign` set inline on each image
  (`1` from below, `-1` from above: the photograph comes in from the
  edge it crossed); a unit inside `.piece-strip-scroll` reads `"fade"` however it
  entered, on its first arrival and every replay: a strip's band
  scrolls sideways and snaps, and a snap step can take a frame from
  wholly out to wholly in, which no geometry tells apart from a
  vertical entry (D1606 follow-up, 2). `edge(entry, last)` (exported, pure):
  `top` when the box is clipped at the root's top only, `bottom` when
  clipped at its foot only, else `last` — the side the unit was on when
  last seen wholly off screen, recorded in `leave()` (and from the
  hook's rect for a unit off screen at the hook) — so a jump that lands
  a unit wholly in view (Page Down without smooth scrolling, find in
  page, a hash link) still comes in from the edge it crossed (D1606b,
  the T1606b review's F1). There is no geometric `side`: a `100vw` fullbleed image is
  wider than the viewport by a classic scrollbar, and would read as
  clipped sideways. The kind is decided at reveal, not at arrival. A
  unit revealed by its arrival while `<html>` carries `data-quiet`, or
  revealed at all while it carries `data-moving="quiet"`, is shown at
  once (`shown()` on each image, no
  kind written): the quiet view's growth is that photograph's movement,
  entered from further down the image page, where the stage has already
  been reset, and a fade or rise inside it would be a second one. This
  applies to the quiet view only. During a page change's transition the
  stage still fades over its understudy, as the travel was built
  (D1606 follow-up, 3). A unit whose decode ends after the growth
  fades as usual, quiet view or not. The keyframe reads the sign:
  `@keyframes motion-arrive { from { opacity: 0; transform: translateY(calc(var(--arrive-rise) * var(--rise-sign, 1))); } … }`.
  `--rise-sign` is a runtime property like `--i` and `--understudy`:
  never in markup or `:root`, and not in the grammar's family.
  `animationend` still writes `""` through `shown()`, so the
  understudy, the held key and the fill's leaving are unchanged for
  replays. With any replaying unit the observer disconnects only at
  teardown (`astro:before-swap`); its callbacks write attributes only
  when a unit leaves or arrives. The strips' own units and the travel
  are untouched.

- **The travel** (`BaseLayout.astro`'s script, on the router's events;
  `src/lib/motion.ts` for `NAME`, `flag`, `token`, `reducedMotion`).
  Three navigations are told apart in `astro:before-preparation` by
  **what was clicked** (`sourceElement`), not by the paths — the
  related strip lives on the image page, so a path rule would take a
  strip click for an arrow step — and nothing happens unless
  `--motion-travel` is 1. Reduced motion withholds the **names** and
  nothing else (decision review D1604, Q1, 2026-09-23): the kinds are
  still classified, the origin stored, `data-moving` set and cleared,
  the step's and the way back's preloads run, the understudy painted
  and the way back's scroll restored — none of these moves anything,
  and without them a reduced-motion reader would see the stage blank
  and land at the top, which AC 6 forbids and Goal 6 does not suspend.
  `name()` is the one place the script reads the setting: under reduced
  motion it names nothing and returns false, and `data-slide` is
  written only when a name was given. The header's group keeps the
  state duration on a travel
  (`html[data-moving]::view-transition-group(site-header)` at
  `--dur-state` / `--ease-state`) — its inherited slide, not the
  photograph's movement:
  - **in** — `sourceElement.closest('.image-link')` exists, on any
    page (a piece's frame, a gallery cell, the wall, the related strip
    on an image page): that link's `img` (the photograph, not the cell)
    gets an inline `view-transition-name: photograph`; the origin's
    scroll position is stored (`sessionStorage['motion-origin'] = { path, y }`).
  - **step** — `sourceElement.closest('[data-nav]')` exists (the
    arrows; the arrow keys `.click()` them): nothing is named when
    `--arrows-slide` is `0px`, so the root cross-fade carries the
    photograph in its box, as today; the event's `loader` is extended
    to preload the next stage's file — an `Image` given the new
    document's stage `sizes` (or `100vw` when `html[data-quiet]` is
    set, the value `applyQuiet` will give the stage) then `srcset`,
    awaited through `decode()` with a bound of one second — so the new
    stage is `complete` at the swap and the cross-fade goes from one
    photograph straight to the next. The same URL the page requests a
    moment later: a cache hit, not a second request (a claim T1604
    verifies from the resource timeline, in both views). With a slide
    distance the old and new stage figures are named and
    `data-slide="prev|next"` selects the slide keyframes.
  - **out** — `from` is under `/images/` and the click was neither of
    the above (the page's way-back links), or the navigation is a
    `traverse` from an image page: the stage figure is named. For a
    traverse whose `to` is also an image page the kind is settled in
    `astro:before-swap`: **out** when the new document holds
    `.image-link[href="<from.pathname>"]` (the reader came through a
    related strip and is going back to it — that cell is named), else
    **step** (the loader has preloaded the stage as for any
    image-to-image traverse; with a slide the direction is the event's
    `direction`, `back` → prev, `forward` → next). In that one case the
    old figure is named before the kind is known; when it turns out to
    be a nameless step the figure exits on its own group instead of
    inside the root's — the same cross-fade in its box.

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
  href is `from.pathname` is named in the new document — when the
  stored origin's `path` is the destination, the same-path link at the
  stored position `nth` among the page's links to that path (the one
  the reader clicked; a piece may place one photograph twice), else the
  first (Phase 1 review B2) — and at
  `astro:after-swap` (after the router's own scroll: to top for a link,
  to the saved position for a traverse) the page is scrolled to the
  stored `y` when the stored path matches, else the cell is
  `scrollIntoView({ block: 'center' })` — so the photograph lands in
  its own cell. The appearance's after-swap hook is registered after
  this scroll listener (and the `lastY` listener last), so `appear()`
  reads what is in view where the page lands, not at the top (Phase 1
  review B3). Every name, `data-moving` and `data-slide` is cleared
  on the swap event's `viewTransition.finished` — `.then(clear, clear)`,
  never `.finally`, which would re-throw a skipped transition's
  rejection.

  **The way back holds what the reader saw** (D1604, Q2). The way
  back's landing is a lazy `img` in an adopted document: a lazy srcset
  image is not fetched until the next rendering step's intersection
  check, so at `astro:after-swap` it is never `complete` and its `load`
  always comes after the first frame — every frame the reader saw
  re-faded and the landing's new snapshot was the fill (measured at
  T1604, all four surfaces, both screens, dev and preview). Two
  changes, neither adding a request: (1) `motion.ts` keeps, for the
  document's life, the frames it has shown — key
  `<pathname>|<innerWidth>x<innerHeight>x<devicePixelRatio>|<src>|<srcset>|<sizes>`
  (the three attributes as written, each absent one as the empty
  string) — exactly the inputs from which the browser selects a
  candidate, so an image made eager on a held key selects the file the
  shown image already fetched: a memory-cache hit, never a new
  candidate. A key on `src` alone collided when a page places one
  photograph twice with different `sizes` (the fog piece's `land-b`, a
  block frame and a fullbleed: the unseen fullbleed went eager and
  fetched w1668; T1604b's Verify, D1604 follow-up) —
  recorded in `shown()` only when the image is `complete` with a
  `naturalWidth` — and `holdShown(doc)` sets `loading="eager"` on
  every frame image in the new document whose key is held; the layout
  calls it in its existing `astro:before-swap` appearance listener on
  every navigation, whatever the travel flag or the setting. Those
  files are in the document's memory cache, so eager is a cache hit,
  and the existing `complete` short-cut and early-`load` rule hold
  them. (2) For every **out**, the landing `img` is set
  `loading="eager"` and the loader is extended to preload its
  candidate — the same `preload(img, sizes)` the step uses, given the
  landing's own `sizes`, bounded at one second — so the landing is
  decoded and `complete` when the new snapshot is taken. Between image
  pages the loader preloads the landing when the new document holds
  the cell and the traverse is `back`, else the stage.

  **The compare overlays before the swap** (D1604, Q3).
  `enhanceCompare(scope)` moves to `src/lib/compare.ts`; the layout
  calls it at its module's evaluation (the first load — T1603c's
  timing, unchanged) and in `astro:before-swap` on
  `event.newDocument`, so a page the router swaps in is overlaid
  before it is adopted, before the router's scroll and before the new
  snapshot. The image page's module cannot do this: the router runs a
  new page's scripts after `updateCallbackDone` (`router.js`), so its
  first swap into a compare page would be overlaid after the snapshot.
  The image page's script keeps no call. `.site-header`
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
  and its reduced-motion `transition: none` are deleted (until this
  task, the rule reads `var(--dur-state) var(--ease-state)` — T1601
  re-tokens it so the literal scan is green from the scan's own task,
  and the ground keeps its fade at the pauses between; this task
  deletes it as written): under a view
  transition a live background transition would run beneath the
  snapshot cross-fade and fight it; without the API the quiet view
  cuts (the reduced-motion outcome, "simply dark"). `--motion-quiet: 0`
  is the plain toggle; under reduced motion the figure is not named and
  the transition runs nameless when `--rm-quiet` is 1 (the ground
  fades, the frame cuts to its matted size) or not at all when it is 0.

  `withTransition(update, moving, named, animate)`: `animate` false or
  no `startViewTransition` → `update()` synchronously; else name
  `named` (when given), set `data-moving`, start, and clear both on
  `finished` via `.then(clear, clear)`. The image page is its one
  caller today; the layout's
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
  builds a `<details>` panel in the page's corner, in three parts
  (amended at the Phase 1 pause; decision review D1606, Q2). **The
  appearance:** one select of named settings from `APPEARANCE_PRESETS`
  in `src/components/dev-motion-presets.ts` — a data-only module
  imported by the panel and by `motion.test.mjs`, never by a bundled
  script, so nothing in it ships. Each setting has a plain one-line
  description and writes exactly `APPEARANCE_TOKENS` (`--dur-appear`,
  `--ease-appear`, `--arrive-rise`, `--arrive-threshold`) through the
  panel's `set`: faint (400ms, `ease`, 0px, 0.15 — as first built);
  soft (700ms, `cubic-bezier(0.4, 0, 0.2, 1)`, 0px, 0.2); settle
  (800ms, `cubic-bezier(0.33, 1, 0.68, 1)`, 0.75rem, 0.25); float
  (1100ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 1rem, 0.3). The select
  shows the setting whose four values equal the effective ones, else
  "custom". **The behaviours:** the four checkboxes (appearance,
  arrival, travel, quiet view) and the waiting fill (surface / ground).
  **Every value:** a nested `<details>`, collapsed by default, holding
  the full per-token table as before — a row per `MOTION_TOKENS` entry,
  the arrival's shape select with its rise field, the effective value
  beside each — kept because AC 12 requires every tunable to be
  settable from the switch. Reset clears the key and every inline
  property, so the committed stylesheet is the control, and the select
  then reads the committed setting. The travel's and the quiet view's
  tokens are in no setting: he kept them as built. The panel's styles are set by the script, never a `<style>`
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
  `<style>` in `dist/**/*.html`, and also fails a page whose markup —
  `<script>` and `<style>` blocks excluded, since Astro's
  `inlineStylesheets: 'auto'` inlines small stylesheets and the site's
  own rules name these attributes — carries `data-motion`,
  `data-shown`, `data-moving`, `data-understudy`, `autoplay`, or a
  `view-transition-name` inside a `style="…"` attribute — the no-script
  pin on `dist/`. `dist/pagefind/` is excluded: pagefind's UI stylesheet is a
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
  exactly the twenty-one names in `EXPECTED` with those values (the
  table at the top of the file is the one edit a round makes beside
  the stylesheet), and no other rule in `global.css` or in any
  `<style>` block of any `.astro` file under `src/` declares one of
  them — a walk over CSS declarations, not a grep, because
  `motion.ts` and the panel carry the names as strings — except the
  reduced-motion block's `:root { --arrive-rise: 0px; --hero-enter: 0 }` and the covers
  rule's two reads of the `*-covers` tokens (walk, matte.test.mjs
  (a)'s shape).
  (b) `scanMotion(global.css)` is empty; every `<style>` block in every
  `src/**/*.astro` scans empty; no `.astro` file carries a
  `transition:` directive or `autoplay`. (c) The inherited rules, by
  string: `a:not(.brand, .button)`'s `transition`, `.site-header`'s,
  `.button`'s, `.social-links a`'s, `.hero > *`'s `animation` and the
  three delays, and `keel-enter`'s body unchanged; and, by string, the
  two `::view-transition-group` rules, the old/new
  `animation-timing-function: inherit` rule and the covers rule. (d) The
  reduced-motion block contains exactly the four rules above and no
  `*` prelude, no `1ms`, no `scroll-behavior`, and no rule under it
  names an `opacity` transition or the appearance animation with a
  zero. Mutations, each reverted: `220ms` restored on `.site-header` →
  (c) fails naming the rule (and (b) once T1601 lands); `--dur-state` declared on `.button` → (a)
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
  `/places/the-headlands/`, `/images/where-the-fog-lets-go/land-b/`,
  and the three indexes and the front door — `/pieces/`, `/galleries/`,
  `/places/`, `/` (the `CoverCards` spans, the `PieceList` covers, the
  hero) — at 1512×982 and 1280×1440, cache cleared: every
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
  every frame image's computed `opacity` is 1. With the layout's
  module request blocked in the profile (the chunk 404s): `html`
  carries `data-motion` before `load` and none after it,
  `window.__motion` is undefined, every frame's `opacity` is 1 (the
  release). On `/pieces/` and `/` the row cover's rect equals `main`'s
  (the one markup change, measured). With `--motion-appear-covers: 0`
  on `html` the covers read `""` at once while a gallery cell still
  fades (the host-read flag). Under reduced motion: `"fade"` still
  animates at `--dur-appear`; no `"rise"` is written; the
  `.site-header`'s `transition-duration` is 0s. Observer hygiene
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
  `motion-origin`. On the way back, read at `astro:after-swap` after
  the hook: the landing `img.complete`, its `data-shown`, and the
  number of frame images on the page that pass through `"fade"` —
  which must be 0 for the frames the reader saw before the click
  (the premise "a return replays nothing", measured, not assumed; if
  `complete` reads false and the early-`load` rule catches them the
  count is still 0; if neither, the limitation is recorded with the
  browser and the count). From a piece, a place wall and a related
  strip: the same reads — the strip click classified **in**, not
  step (the strip's clipped rect recorded); a second click on the
  same cell: the figure carries no `data-understudy` and no
  `--understudy` after the hook. An arrow: no element named, only
  the root group animates at `--dur-move`, the next stage image is
  `complete` at `astro:after-swap`, and
  `performance.getEntriesByType('resource')` lists its candidate URL
  once — and once more in the quiet view, where the preload's
  candidate equals the stage's `currentSrc` under `sizes="100vw"`;
  with `--arrows-slide: 2rem` both figures are named and the old/new
  photograph pseudo-elements animate the slide keyframes.
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
src/styles/global.css                     :root — the twenty tokens and their comment; a: / .site-header (+ view-transition-name) / .button / .social-links a / .hero rules on the tokens; the reduced-motion block rewritten; the Motion section opened with the view-transition group rules, the old/new timing-function inherit, and the covers rule (T1600). Then the gate, the fill, the two appearance animations and keyframes (T1603), the understudy and the slide variant's rules and keyframes (T1604)
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

- **A page change under reduced motion still cross-fades** (at the
  duration it has without the setting — `--dur-move` while
  `html[data-moving]` is set (a travel, a step, a way back),
  `--dur-state` otherwise): the router has no reduced-motion path on a site
  without `transition:*` directives (verified in `astro/dist`). A fade,
  within Goal 6; a cut is one rule in the reduced-motion block
  (`::view-transition-old(*), ::view-transition-new(*) { animation-duration: 0s }`) if wanted.
- **The gate holds frames hidden until `load` if the module never
  runs.** `html[data-motion]` is written by an inline script before
  the body; the same script releases it at `load` unless the module
  has set `window.__motion`, and `appear()` releases it on any throw
  of its own. So a stale chunk or a throw ahead of `appear()` shows
  every frame at `load` — later than a healthy page, never hidden for
  good. Without script at all nothing is hidden, by construction and
  by the barrier.
- **A frame the document has shown is held on return only at the
  same viewport and the same attributes.** The key is the viewport's
  width, height and pixel ratio plus the image's `src`, `srcset` and
  `sizes`, so after any resize — a phone's toolbar changing the height
  included — a returning page's frames are lazy again and fade as on a
  first visit, and a second placement of a shown photograph with
  different `sizes` (the fog piece's block frame and fullbleed
  `land-b`) stays lazy. The price of never fetching a candidate the
  page would not request (AC 13). (Replaces the T1604-era limitation
  "whether a memory-cached image reads `complete` … is the browser's
  business", refuted by T1604's measurement: the cause was the site's
  own `loading="lazy"` — D1604, Q2.)
- **The way back names a cell the browser may have evicted.** The new
  snapshot for **out** is the cell's live `img`; if its file is no
  longer in the memory cache, the landing's preload re-reads it (from
  the HTTP cache, or the network the page would use a moment later for
  the centred cell), bounded at one second.
- **A frame inside the strip's scroller** travels from its clipped
  rect (the snapshot is what was visible). Recorded at T1604.
- **The preload for an arrow step is bounded at one second**; on a
  slow network the step proceeds when the bound is hit, and what the
  reader then sees is the stage's box waiting — the surface fill on
  paper, and in the quiet view the white mat around an empty content
  box (the fill is excluded under `data-quiet` and the understudy is
  in-only) — until the photograph decodes and fades in. A wait bound,
  not a timer-started animation.
- **`dist/pagefind/pagefind-ui.css` carries literal transitions** —
  pagefind's, on the search page's results only; excluded from the
  barrier by path and from the grammar's claim, which is about the
  site's own styles. Recorded here and in the brief's Motion section.
- **The waiting fill reaches every frame through its host**; the
  hosts are the six in `FRAME_HOSTS`. A new surface that places an
  `img` outside them waits on the ground and fades without a fill —
  the pins on both lists (the gate's and the fill's) are where it is added.
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

- **The build barrier sees what the minifier leaves.** Lightning CSS
  rewrites `220ms` as `.22s` and drops a bare `ease` (the default
  curve), so `check-motion` on `dist/` catches a literal time but not a
  lone default curve; the source scan (describe (b) over `global.css`
  and every `.astro` `<style>`) is the guard for curves. The example
  failure line above shows the source spelling; the build prints the
  minified one. _(Phase 0 review, 2026-09-23.)_

## Resolved decisions

- **The waiting fill leaves when a rise starts** (D1606a), not at its
  end: moving the rise onto the host would animate a figure's caption
  and the reserved box, and a short fill fade would leave half the
  band. The price is one frame in which a rising frame's box gives way
  to the ground; the bare-ground fill, the photographer's other choice,
  removes even that.

- **A navigation is classified by what was clicked, not by its
  paths.** `closest('.image-link')` is a travel in from any page — the
  related strip is on the image page, and a path rule would have made
  its click an arrow step (the sign-off's first finding);
  `closest('[data-nav]')` is a step; the rest from an image page is
  out, with the one traverse case settled at before-swap by whether the
  new document holds the cell.
- **The appearance flags are read from the host, not the root.**
  Custom properties inherit, so a surface's own value is one rule and
  the covers' two root tokens are the envelope's "whether the covers
  take the appearance at all" as tokens, pinned by name and on the
  panel, rather than a code constant; `FRAME_HOSTS` still says where a
  photograph can be, the flags say whether it moves.
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
  once it has arrived" at less cost than one observer per frame; since
  the Phase 1 amendment, units that replay stay observed for the page's
  life (the spec's Performance line amended).
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

## Carried from the sign-off (the re-review's exact text; binding on T1603 and T1604)

14. **A forward traverse between two image pages can be settled as
    `out` in the wrong direction.** plan.md "The travel", out: a
    traverse whose `to` is an image page becomes **out** "when the new
    document holds `.image-link[href="<from.pathname>"]`". After back
    (B → A's strip), pressing forward (A → B) is a traverse whose new
    document (B) will often hold A in _its_ related strip, so the rule
    names A's cell on B and shrinks A's stage into it, while B's stage
    arrives by the root fade — the reverse of what forward should
    replay. Exact change, in that paragraph and in T1604's before-swap
    settle: "**out** when `event.direction === 'back'` and the new
    document holds the cell; a `forward` traverse between image pages
    is a **step**." (The **in** replay on forward would need the old
    page's strip cell plus the understudy; a step is the honest minimum
    and forward is not in AC 6.)
15. **The root `--motion-appear` / `--motion-arrive` toggles no longer
    reach the covers.** The covers rule sets
    `--motion-appear: var(--motion-appear-covers)` on the cover hosts,
    so the host read ignores the root's value there: unchecking
    "appearance" on the panel leaves the covers fading. AC 10's "toggles
    each behaviour" is met for every non-cover surface, so this is a
    switch-usability wrinkle, not a failure. Exact change, plan.md
    "Appearance and arrival" and T1603: "a flag is off when **either**
    the host's computed value or the root's is `0`" (two reads, one
    `&&`), and T1603's Verify adds "with `--motion-appear: 0` on `html`
    alone, the covers read `""` at once too".
16. **Two implementer-facing loose ends.** (a) tasks.md T1604's
    `moving` type literal (`{ kind; src?; dir?; navigationType }`) does
    not include the `direction` field the same line now stores. (b)
    `window.__motion` is set from `motion.ts`, which `astro check`
    type-checks; it needs a
    `declare global { interface Window { __motion?: boolean } }`
    (DevGround's `__devGround` lives in an inline script and never met
    the checker). Both are one line for the implementer.
17. **Wording** — the `viewtransitions.css` parenthesis in "Two facts of
    the router": applied above.
