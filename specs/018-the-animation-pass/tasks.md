# Tasks: The animation pass

**Status**: Signed off (2026-09-23) by the `skeptical-reviewer` at the
top tier — five blocking findings fixed and eight notes folded in; the
re-review's four remaining lines carried into T1603, T1604 and plan.md's
"Carried from the sign-off" from their exact text.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1600–T1602) — the grammar's tokens and
the flags on `:root` with every inherited transition moved onto them
and the reduced-motion split in place of the blanket, the scanner and
the barrier that make "no literal duration anywhere" a fact of every
build, and the dev switch with the motion module's helpers — so every
behaviour built after it is tunable from the switch at its first look
and pinned by name from its first commit.
**T1600 is marked `review: per-task`**: every later task reads its
tokens, its reduced-motion block and its `EXPECTED` table — a token
misnamed, a curve on the wrong side of the reduced-motion split, or a
pin that cannot fail is what the four behaviours, the switch and every
tuning round would inherit. T1601 and T1602 are reviewed with the
phase; Phases 1, 2 and 3 are per-phase (Phase 3's review is the
pre-merge sweep). The Phase 1 pause is where the person judges, over
as many rounds as it takes.

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
files, the pattern file to copy, any recorded value), telling it not to
read plan.md, spec.md, or tasks.md in full; the implementer's verbatim
`sh scripts/verify.sh` output is the verification, re-run by the
orchestrator for T1600; the reviewer checks each phase as a whole from
a staged, shell-assembled bundle — one review and at most one
re-review, anything still open logged and left to the sweep. A design
question the session cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle, never
resolved in the session. The sweep runs on the documents plus
`git diff main...HEAD`. The orchestrator never does device or browser
checks by hand: attributes, animations and computed styles are the
implementer's Verify criterion (numbers recorded in this file), and
what it cannot measure the person attests at the phase pause on his two
screens (the 16:10 laptop and the LG DualUp, 2560×2880), with a mouse
and a trackpad. **The tuning envelope** (spec.md): a round at the
Phase 1 pause is one sub-lettered task under T1606 (`T1606a`, `b`, …)
— the value set in `global.css`'s `:root`, the matching row of
`motion.test.mjs`'s `EXPECTED` updated, one line in spec.md's Decided
section, `sh scripts/verify.sh` green — dispatched as routine and
reviewed with the phase against the outcome the spec records. One
implementation session runs the whole spec: a phase pause is a pause in
it — the person attests and says continue — not a session boundary;
the person is paused for after each phase whose header says there is
something to try, and whenever something unexpected bears on spec
adherence. If the person stops at a pause, the report ends with the
continuation prompt for a fresh session (`/compact` if the context
grows large; never mid-task).

Task ids: 018 = T16xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T16xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the grammar, the scanner and barrier, the switch (reviewer after the phase; `review: per-task` on T1600; walkthrough: none — the tokens carry today's motion with its feel unchanged, the barrier and the switch move nothing on their own; the switch is judged with the behaviours at Phase 1's pause)

- [x] **T1600** — The grammar: the tokens on `:root`, every inherited
      transition and animation on them, the reduced-motion split, and
      the pins. `review: per-task`. Pattern: the `:root` mat and ground
      token comments in `src/styles/global.css` (~65–103) for the
      comment's shape; `matte.test.mjs` case (a) ("declared ONLY here")
      and its `blocks`/`declarations` reading of the stylesheet for the
      test's shape; plan.md's "The grammar" and "Reduced motion" for
      the exact strings. `src/styles/global.css`: after
      `--place-wall-gap`, the twenty tokens exactly as plan.md lists
      them, under one comment (THE MOTION GRAMMAR, spec 018: three
      durations, two curves, read by every transition and animation on
      the site; the flags and numbers the tuning envelope names; the
      dev switch sets any of them on `<html>`; motion.test.mjs pins each
      by name — to retune, move the value here and in its `EXPECTED`
      row; the rule: motion answers the reader). Then the inherited
      rules: `a:not(.brand, .button)` → `transition: background-size var(--dur-state) var(--ease-state), color var(--dur-state) var(--ease-state);`
      (Prettier will wrap the list); `.site-header` →
      `transition: transform var(--dur-state) var(--ease-state);` and,
      after it, `view-transition-name: site-header;` with a one-line
      comment (chrome: its own group, never blended with the page's
      cross-fade — spec 018); `.button` and `.social-links a` → their
      three properties at `var(--dur-state) var(--ease-state)`;
      `.hero > *` → `animation: keel-enter calc(var(--dur-move) * var(--hero-enter)) var(--ease-state) both;`
      and the three `:nth-child` delays `calc(var(--hero-stagger) * 1 * var(--hero-enter))`,
      `* 2 *`, `* 3 *` (the delays read the flag — T1600 review B2); `keel-enter`'s keyframes untouched. The
      reduced-motion block replaced by exactly the four rules in
      plan.md ("Reduced motion") with a comment (movements instant,
      fades kept — spec 018's split; `0s` is the one literal a duration
      slot may carry; the travel and the growth need no rule: the
      script never names the photograph under reduced motion). Add a
      first `::view-transition-group(*) { animation-duration: var(--dur-state); animation-timing-function: var(--ease-state); }`
      and `html[data-moving]::view-transition-group(*) { animation-duration: var(--dur-move); animation-timing-function: var(--ease-move); }`,
      then `::view-transition-old(*), ::view-transition-new(*) { animation-timing-function: inherit; }`
      (the UA stylesheet inherits the group's duration, fill and delay
      but not its timing function — csswg-drafts #11546), then the
      covers rule `.note-cover, .gallery-card .image-link { --motion-appear: var(--motion-appear-covers); --motion-arrive: var(--motion-arrive-covers); }`
      (the script reads the two flags from the host's computed style;
      this is how the covers get their own switch), at the start of a
      new `/* ---- Motion (spec 018) ---- */` section at the end of the
      file, with its header comment (what the section holds, task by
      task; `.note-cover` is T1603's wrapper — the rule may precede the
      markup). **`motion.test.mjs`**, new, header comment in
      matte.test.mjs's voice (what can go wrong and which case catches
      it): the `EXPECTED` table (the twenty names → values, verbatim);
      describe "(a) the grammar is declared once": `:root` declares
      exactly `EXPECTED` (every name, every value, nothing of the
      family missing or extra — the set of `--dur-*`, `--ease-*`,
      `--motion-*`, `--arrive-*`, `--wait-fill`, `--hero-*`,
      `--arrows-slide`, `--rm-*` names in `:root` equals the table's
      keys), and a walk over every CSS declaration in `global.css` and
      in every `<style>` block of every `.astro` file under `src/` — a
      declaration walk, not a grep: `motion.ts` and the panel carry the
      names as strings — finds none of the twenty declared elsewhere
      except the reduced-motion block's `:root { --arrive-rise: 0px; --hero-enter: 0 }`
      and the covers rule's `--motion-appear` / `--motion-arrive`
      reading the two `*-covers` tokens;
      describe "(c) the inherited motion reads the tokens": the six
      rules' declarations by string (normalised), plus the two group
      rules, the old/new `animation-timing-function: inherit` rule and
      the covers rule, each by string; describe "(d) reduced
      motion keeps the fades and drops the movement": the
      `@media (prefers-reduced-motion: reduce)` block's rules are
      exactly the four (preludes and declarations; five until the T1600 review's B1/B2, plan.md "Reduced motion"), no prelude is `*`,
      no declaration in it carries `1ms` or `scroll-behavior`, and no
      rule in it sets a zero on an `opacity` transition or on
      `img[data-shown='fade']` other than the `--rm-appear` product.
      (Describe (b), the literal scan, is T1601's — it needs the
      module; the file is green at the end of this task.) Every case
      named for what fails it. _Verify: `sh scripts/verify.sh` green
      (the count recorded); `grep -n "ms\b\|ease" src/styles/global.css | grep -v -- "--dur\|--ease\|--hero-stagger\|--arrive-stagger\|var(--\|/\*\|\*/\|^\s*\*"`
      → 0 lines with a literal time or curve in a transition/animation
      (every hit listed and explained); `grep -c "!important" src/styles/global.css`
      recorded (the three from the blanket gone); `grep -n "view-transition" src/styles/global.css`
      → the header's declaration, the two group rules and the old/new
      inherit rule; `grep -n -- "-covers" src/styles/global.css` → the
      two `:root` tokens and the covers rule's two reads;
      `git diff -U0 main -- src/styles/global.css | grep '^@@'` — every
      hunk listed, none inside `.image-stage`, `.image-frame`,
      `.image-frame img`, the `html:not([data-quiet])` or
      `html[data-quiet]` rules, `.gallery-flow*`, any `.piece-*` rule
      or the `--color-*` lines; on the dev server at 1512×982 the
      header's computed `transition-duration` is `0.18s`, a link's
      `0.18s, 0.18s`, the hero's first child's `animation-duration`
      `0.48s` and its second child's `animation-delay` `0.09s`, and with
      `ui.prefersReducedMotion=1` in the profile the header's is `0s`,
      the hero's `0s`, a link's `transition-property` `color`, and a
      `.button`'s `transition-duration` still `0.18s` on each property;
      `getComputedStyle(document.documentElement).getPropertyValue('--dur-move')`
      is `480ms`. Mutations named and reverted, tree restored
      byte-identically: `220ms` restored on `.site-header` → (c) fails
      naming the rule; `--dur-state: 180ms` declared on `.button` → (a)
      fails naming it; the `*` blanket restored under reduced motion →
      (d) fails; `--dur-move` retyped `500ms` in `:root` alone → (a)
      fails against `EXPECTED`._

- [x] **T1601** — The scanner, the barrier, and the marker. Pattern:
      `scripts/check-no-dev-routes.mjs` (the barrier's shape: a dir
      argument, `[name]` prefixes, exit 1 naming files, one summary
      line) and `page-head.test.mjs`'s barrier describe (temp dirs,
      `execFileSync`, the three outcomes) for the tests; plan.md's
      "The scanner and the barrier" and "Failure messages and notes".
      New `src/lib/motion-scan.mjs` exporting `scanMotion(css, file = '')`
      → `[{ file, line, declaration, findings: string[] }]`: comments
      stripped; every `transition`, `transition-duration`,
      `transition-delay`, `transition-timing-function`, `animation`,
      `animation-duration`, `animation-delay`,
      `animation-timing-function` and `animation-iteration-count`
      declaration (minified or not); `var(…)` and `calc(…)` groups
      removed (nested parens balanced); then a finding for each literal
      time not zero (`\d*\.?\d+(ms|s)`), each easing keyword or function
      (`ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`,
      `step-start`, `step-end`, `steps(`, `cubic-bezier(`), each bare
      number (an iteration count) and `infinite`; a header comment
      naming the rule it enforces and the one allowance (a zero). New
      `scripts/check-motion.mjs [dir]` (default `dist`): every
      `_astro/*.css` and every `<style>…</style>` block of every
      `.html` under the dir except under `<dir>/pagefind/`, through
      `scanMotion`; every `.html` searched — with `<script>` and
      `<style>` blocks removed first, since a page script names these
      attributes and Astro's `inlineStylesheets: 'auto'` puts the
      site's own rules into `<style>` — for the attributes
      `data-motion`, `data-shown`, `data-moving`, `data-understudy`
      and `autoplay`, and for `view-transition-name` inside a
      `style="…"` attribute (`/style="[^"]*view-transition-name/`);
      on any finding the
      lines plan.md shows to stderr and `process.exit(1)`; else the
      summary line. `package.json` `postbuild`: `&& node scripts/check-motion.mjs`
      after the dev-routes check; `scripts/verify.sh` line 26 gains
      `|\[check-motion\]`. `scripts/check-no-dev-routes.mjs`: `MARKER`
      → `const MARKERS = ['dev-ground', 'dev-motion']` with the comment
      (the ground switch's and the motion switch's markers — spec 014
      and 018), the shipped message naming which marker, the summary
      `no dev-ground or dev-motion marker in N files.`
      `page-head.test.mjs`: the clean-run expectation reads the new
      summary; a fourth fixture dir with
      `<script data-dev-motion>localStorage.getItem("dev-motion")</script>`
      exits 1 naming the file. `src/pages/images/[...id].astro` `<style>`: the one literal the source scan finds on this branch — `transition: background-color 220ms ease;` on `:global(html), :global(body), .image-stage` — becomes `transition: background-color var(--dur-state) var(--ease-state);` (a holding edit so the scan is green from this task; T1605 deletes the rule — decision review 2026-09-23, option B). Its reduced-motion `transition: none` twin is untouched (no literal). `motion.test.mjs`: describe "(b) no
      literal duration or curve outside the token block" — the unit
      cases plan.md's Testing strategy lists (eight, each one
      declaration → the expected findings), then `scanMotion(global.css)`
      is `[]`, every `<style>` block of every `src/**/*.astro` scans
      `[]` (the file and line in the failure message), no `.astro`
      file matches `/\stransition:(name|animate|persist)\b/` and none
      contains `autoplay`; describe "(e) the barrier fails on the
      built output": seven temp dirs — `_astro/x.css` with `220ms`
      (exit 1, stderr names the file and `"220ms"`), a page with
      `data-shown=""` on an `img` (exit 1), a page with `<video autoplay>`
      (exit 1), a page whose `<style>` carries `ease` (exit 1), a page
      with `style="view-transition-name: photograph"` on a figure
      (exit 1), a page whose `<style>` and `<script>` mention
      `data-shown` and `view-transition-name` in rule and code text
      only (exit 0), a clean dir with a `pagefind/pagefind-ui.css` full
      of literals (exit 0, the summary line with its counts). _Verify: `sh scripts/verify.sh`
      green with 87 pages and **three** barrier lines (the new line
      quoted); `node scripts/check-motion.mjs dist` alone → exit 0 and
      the line; `grep -rn "check-motion" package.json scripts/verify.sh`
      → the two lines; `grep -n MARKERS scripts/check-no-dev-routes.mjs`; `grep -n "220ms" 'src/pages/images/[...id].astro'` → 0 lines; on the dev server, entering the quiet view on an image page, `getComputedStyle(document.body).transitionDuration` is `0.18s` (the ground still fades);
      mutations, reverted: `transition: transform 220ms ease` written
      into `src/pages/about/index.astro`'s `<style>` → the (b) source
      case fails naming the file and line, **and** `npm run build` →
      `[check-motion] literal motion in dist/_astro/…` with `BUILD EXIT`
      non-zero (the tail pasted); `data-shown=""` written on the stage
      `img` in `[...id].astro` → the build's barrier names an image
      page._

- [ ] **T1602** — The motion module's helpers and the dev switch.
      Pattern: `src/components/DevGround.astro` (the applier — its
      comment, its `astro:after-swap` re-apply, its `window.__devGround`
      once-guard) and `src/pages/dev/matte/_sampler.ts` with
      `[...surface].astro`'s ground bar (a served module, the stored
      shape, `reset` as the absence of an override); `src/lib/image-set.ts`
      for a small typed module's shape; plan.md's "The dev switch" and
      "The quiet view as one movement" (for `withTransition`). New
      `src/lib/motion.ts`: `MOTION_TOKENS` — the twenty names with
      `kind: 'time' | 'curve' | 'flag' | 'length' | 'number' | 'fill'`
      and a short `label` — `NAME = 'photograph'`, `FRAME_HOSTS` and
      `FRAME_IMG` as plan.md spells them, `ms(value)` (`480ms` → 480,
      `.5s` → 500, anything else → 0), `token(name)` (the computed
      value on `documentElement`, trimmed), `flag(name)` (`=== '1'`),
      `reducedMotion()`, and `withTransition(update, moving, named, animate)`
      exactly as plan.md describes (synchronous `update()` when
      `!animate` or no `startViewTransition`; else the name and
      `data-moving` set, `document.startViewTransition(update)`, both
      cleared on `finished` via `.then(clear, clear)` — never
      `.finally`, which re-throws a skipped transition's rejection —
      the promise returned). `appear()` is
      T1603's and is not stubbed here: nothing unread ships. Header comment: the
      module's three readers (the layout, the image page, the panel)
      and the pin that ties `FRAME_HOSTS` to the stylesheet. New
      `src/components/DevMotion.astro`: the applier
      (`<script is:inline data-dev-motion>`: read
      `localStorage['dev-motion']`, `{ tokens }`, set each on
      `<html>`; re-apply at `astro:after-swap` once; the comment names
      the marker and the barrier) and
      `<script is:inline type="module" src="/src/components/dev-motion-panel.ts"></script>`.
      New `src/components/dev-motion-panel.ts`: at `astro:page-load`
      build (or rebuild — the swap replaces the body) a
      `<details class="dev-motion">` fixed at the viewport's bottom
      left, summary "motion", with one row per `MOTION_TOKENS` entry
      (a checkbox for a flag writing `1`/`0`, a text input otherwise,
      the effective value from `getComputedStyle` beside it), a
      "shape" select (fade → `--arrive-rise: 0px`; rise → the rise
      field's value, kept in the stored object as `rise` so the toggle
      restores it), a "fill" select (surface → `var(--color-surface)`,
      ground → `var(--color-bg)`), and reset (remove the key and every
      inline motion property; the fields re-read from the stylesheet);
      every change writes the property on `<html>` and the key; the
      panel's styles set from the script (`style.cssText`), no `<style>`
      block; the header comment says why it is served, not bundled
      (`_sampler.ts`'s reason) and that the applier, not this file, is
      what runs before first paint. `src/layouts/BaseLayout.astro`:
      `{import.meta.env.DEV && <DevMotion />}` after `<DevGround />`,
      the import. `motion.test.mjs`: describe "(f) the module": `ms`'s
      three cases; `MOTION_TOKENS`' names equal `EXPECTED`'s keys;
      `FRAME_IMG` is the six hosts each `> img`, comma-joined.
      _Verify: `sh scripts/verify.sh` green (count recorded);
      `ground.test.mjs` (h) green unedited (the two DevMotion scripts
      are `is:inline`; the served path exists); `grep -rl "dev-motion" dist/`
      empty and `test ! -e dist/dev && echo absent`; on the dev server
      at 1512×982 on `/pieces/where-the-fog-lets-go/`: the panel
      renders with twenty rows; setting `--dur-move` to `900ms`
      writes `localStorage['dev-motion']` with that token and
      `getComputedStyle(html).getPropertyValue('--dur-move')` reads
      `900ms`; a navigation to `/galleries/fog-frames/` keeps it (the
      applier re-applies at after-swap — read after `astro:page-load`);
      a hard reload keeps it; the shape select "rise" writes
      `--arrive-rise` as the rise field's value and "fade" writes `0px`;
      the fill select "ground" writes `var(--color-bg)`; reset removes
      the key and every inline property (`html.style.length` back to
      what `main` has — DevGround's, if any); `astro check` clean on
      the panel's types._

## Phase 1 — The four behaviours (reviewer after the phase; walkthrough: on both screens, mouse and trackpad, under `npm run dev` — the fog piece `/pieces/where-the-fog-lets-go/`: its first frame's box waits in the fill and the photograph fades into it, each block below the fold appears once as it scrolls in — the diptych's two frames together — and scrolling back up moves nothing; `/galleries/fog-frames/` and `/places/the-headlands/`: click a frame and the photograph lifts from its cell into the stage while the page changes beneath it, never blank; the browser's back and the page's "In the gallery" / "At" link return it to its cell where he left it; `/images/where-the-fog-lets-go/land-b/`: the arrows and the arrow keys cross-fade one photograph into the next in the box; a click on the photograph darkens the ground and grows it into its mat as one movement, Esc or a click the same way back; the "motion" panel at the bottom left turns each of the four off and on, tries the fade alone against the fade with a rise, the surface fill against the ground, and moves the durations and curves — and with the system's reduce-motion setting on, the photographs still fade in and nothing travels, grows, rises or slides; as many rounds as it takes, each a sub-lettered task under T1606)

- [ ] **T1603** — Appearance and arrival. **Carried from the sign-off
      (plan.md, item 15, binding):** a flag is off when _either_ the
      host's computed value or the root's is `0` (two reads, one `&&`);
      the Verify also reads, with `--motion-appear: 0` on `html` alone,
      that the covers read `""` at once too. Item 16(b): `motion.ts`
      declares `Window.__motion` globally for `astro check`. Pattern: plan.md's
      "Appearance and arrival" (the CSS strings, the unit rule, the
      order of operations); `src/pages/pieces/[slug].astro`'s script
      for the reads-then-writes discipline and the `init` shape;
      `src/components/CoverCards.astro`'s `span.image-link` for the
      wrapper. `src/styles/global.css`, the Motion section: the gate
      rule, the fill rule, the two `img[data-shown]` rules and the two
      keyframes exactly as plan.md spells them, with comments (the
      hidden state is the root attribute the layout's inline script
      writes — without script nothing is hidden, and the barrier
      proves it on `dist/`; the host list is `FRAME_HOSTS` in
      `motion.ts`, pinned equal; the fill stays through the fade and
      leaves at `data-shown=""`; why the stage is excluded under
      `data-quiet`). `src/lib/motion.ts`: `appear(scope)` as plan.md
      describes — `window.__motion = true` as its first line, the
      flags `--motion-appear` and `--motion-arrive` read from each
      image's **host** computed style (the covers rule is what makes
      them differ from the root's), the `complete` short-cut, the
      early-`load` rule (a `requestAnimationFrame` settles the hook; an
      image whose `load` fires before it counts as held: `""`, no
      animation), the unit rule (a `.piece-block` holding more than
      one `img`, else the image's host), `load`-then-`decode()` per
      image (never `decode()` on an image not yet loaded), one
      `IntersectionObserver` with
      `threshold: Number(token('--arrive-threshold'))`, in-view units
      (`getBoundingClientRect` intersecting the viewport at hook time)
      revealed on decode alone as `"fade"`, others on decode and
      intersection as `"rise"` when `--arrive-rise` parses above zero
      and `reducedMotion()` is false, else `"fade"`; `--i` per image
      only when `ms(token('--arrive-stagger')) > 0`; one `shown(img)`
      writer for `data-shown=""` that also strips the host's
      `data-understudy` and `--understudy` when present, called from
      `animationend`, the `complete` short-cut, the early-`load` rule
      and the appear-off path alike; `--motion-arrive` off on a host →
      its unit is in view; `--motion-appear` off on a host → its image
      `""` at once; `unobserve` on arrival, `disconnect` when none
      remain; the whole in `try` with `delete root.dataset.motion` in
      the `catch`; returns the teardown. `src/layouts/BaseLayout.astro`:
      in the `<head>`, before `<slot name="head" />`, the inline gate
      `<script is:inline>document.documentElement.dataset.motion = ''; addEventListener('load', () => { if (!window.__motion) delete document.documentElement.dataset.motion; }, { once: true });</script>`
      with an Astro comment (the gate and its release; spec 018 — a
      photograph never paints before the script decides, and a page
      whose module never runs shows every frame at `load`, a response
      to an event, not a timer); in the
      body's script: `import { appear } from '../lib/motion';`, a
      `let teardown = appear(document);` at module evaluation (a
      comment: the initial `astro:page-load` fires on `load`, after
      every image — router.js:414 — so the hooks bind here and at
      after-swap), `astro:before-swap` → `teardown()` and
      `event.newDocument.documentElement.dataset.motion = ''`,
      `astro:after-swap` → `teardown = appear(document)`.
      `src/components/PieceList.astro`: `<span class="note-cover">`
      around the `Image`, one comment (the cover's own box, the
      waiting fill's host — spec 018; the image's rule is unchanged).
      `global.css`: `.note-cover { display: block; }` beside
      `.note-row img`. `motion.test.mjs`: describe "(g) the hidden
      state is the script's" — every rule in `global.css` whose
      declarations include `opacity: 0` has a prelude beginning
      `html[data-motion]` or is inside a `@keyframes` block; the gate
      rule's `:is(…)` list, split and normalised, equals `FRAME_HOSTS`;
      no `.astro` file, `remark-pieces-blocks.mjs` or file under
      `src/content/` contains `data-motion`, `data-shown`,
      `data-moving` or `data-understudy` in markup (the inline gate
      script's `dataset.motion` and the scripts' writes are the
      allowed spellings — the case lists them); the transform's source
      contains `'image-link'` and `'piece-block'`; `PieceList.astro`
      contains `class="note-cover"`. _Verify: `sh scripts/verify.sh`
      green (count recorded); `grep -c "unobserve(\|disconnect()" src/lib/motion.ts`
      ≥ 2; `git diff -U0 main -- src/styles/global.css | grep '^@@'`
      listed as T1600's rule; on the dev server (Firefox 156 headless
      via BiDi, spec 015's recipe; a `script.addPreloadScript` that
      records every `FRAME_IMG` host's `getBoundingClientRect()` at
      `DOMContentLoaded`), cache cleared, at 1512×982 and 1280×1440,
      on `/pieces/where-the-fog-lets-go/`, `/pieces/vocabulary-sampler/`,
      `/galleries/fog-frames/`, `/places/the-headlands/`,
      `/images/where-the-fog-lets-go/land-b/`, and the three indexes
      and the front door — `/pieces/`, `/galleries/`, `/places/`, `/`
      (the `CoverCards` spans, the `PieceList` covers, the hero): every
      host's rect at `DOMContentLoaded` equals its rect after `load`
      (zero shift — each page's count of hosts and any difference
      recorded); at hook time (read from the preload script at the
      first `data-shown` write) each in-view undecoded `img` has no
      `data-shown`, computed `opacity` `0`, and its host's computed
      `background-color` is `--color-surface`'s rgb, and each
      `complete` image reads `data-shown=""`; after `load` every
      in-view image passed through `"fade"` (a `MutationObserver` log)
      and an animation named `motion-appear` with duration 400 was in
      `document.getAnimations()`; on the fog piece, scrolling until
      the diptych intersects: neither image shown before both decoded
      and the block intersected, both attributes written in the same
      animation frame (the log's timestamps); with `--arrive-rise: 0.5rem`
      on `html` the below-fold images read `"rise"` and
      `getAnimations()` shows `motion-arrive`; with `--arrive-stagger: 80ms`
      the diptych's second image has computed `animation-delay` `0.08s`;
      scrolling back to the top writes nothing (the log is silent); a
      warm reload writes `""` on every image and creates no animation.
      Without script (spec 017's sandboxed-iframe recipe): `html` has
      no `data-motion`, every `FRAME_IMG` image's computed `opacity` is
      `1`. With the layout's module request blocked in the BiDi
      profile (`network.addIntercept` on its chunk URL, or a 404 via
      the dev server): `html` carries `data-motion` before `load` and
      none after it, `window.__motion` is undefined, every frame's
      `opacity` is `1` (the release). On `/pieces/` and `/` the row
      cover's rect (the `PieceList` wrapper is the one markup change)
      equals the same row's rect on `main` at both viewports. With
      `--motion-appear-covers: 0` on `html`, the covers on `/`,
      `/pieces/`, `/galleries/` and `/places/` read `""` at once while
      a gallery cell still fades (the host-read flag). Under reduced
      motion: `"fade"` animates at 400, no `"rise"` is ever written. `performance.getEntriesByType('resource')`
      image entries on the gallery page equal `main`'s in count and
      URLs (recorded). Mutations, reverted: `html[data-motion]`
      dropped from the gate's prelude → (g)'s opacity walk fails; a
      seventh host added to the CSS list alone → the list pin fails._

- [ ] **T1604** — **Carried from the sign-off (plan.md, items 14 and
      16(a), binding):** a traverse between two image pages is **out**
      only when `event.direction === 'back'` and the new document holds
      the cell; a `forward` traverse between image pages is a **step**;
      the `moving` type literal includes the `direction` field it
      stores. The travel: in, out, step; the understudy; the
      header's group. Pattern: `BaseLayout.astro`'s existing capture
      click handler (the one writer of `image-set`; the same
      `IMAGES_PATH` test) and its comment style; plan.md's "The travel"
      for the three cases and their reads; `router.js`'s event order
      (before-preparation → `startViewTransition` → swap → scroll →
      after-swap) is the reason each write sits where it does — say so
      in the comment. `src/layouts/BaseLayout.astro` script:
      `import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';`
      and `NAME`, `flag`, `token`, `ms`, `reducedMotion` from
      `../lib/motion`; a module-level `moving` record
      (`{ kind: 'in' | 'step' | 'out'; src?: string; dir?: 'prev' | 'next'; navigationType: string }`
      or null) and `landing: HTMLImageElement | null`;
      **`astro:before-preparation`**: return unless `--motion-travel`
      is `1` and `reducedMotion()` is false; classify by **what was
      clicked**, never by the paths alone — the related strip is on the
      image page, and a path rule would take its click for an arrow
      step: `link` is `sourceElement.closest('a')` when the source is an
      element, else null. **in** — `link?.closest('.image-link')`
      exists: that link's `img` (else return) gets inline
      `viewTransitionName = NAME`; `moving = { kind: 'in', src: img.currentSrc, … }`;
      `sessionStorage['motion-origin']` set to the JSON of
      `{ path: from.pathname, y: scrollY }`. **step** —
      `link?.closest('[data-nav]')` exists:
      `moving = { kind: 'step', dir: that element's data-nav }`, and if
      `parseFloat(token('--arrows-slide')) > 0` the current
      `.image-frame` is named; the loader extended —
      `const load = event.loader; event.loader = async () => { await load(); await preloadStage(event.newDocument); }`
      — where `preloadStage` reads the new document's `.image-frame img`,
      creates an `Image`, sets `sizes` (`'100vw'` when the current
      `html` has `data-quiet` — the value `applyQuiet` will give the
      stage — else the attribute's) then `srcset` then `src`, and
      awaits `decode()` raced against a one-second bound, swallowing
      errors. **out** — otherwise, when `from.pathname` starts with
      `IMAGES_PATH`: the current `.image-frame` is named and
      `moving = { kind: 'out', navigationType: event.navigationType, direction: event.direction }`;
      when `to.pathname` also starts with `IMAGES_PATH` (a traverse
      between image pages — the kind is settled at before-swap) the
      loader is extended as for a step. Nothing else is a travel.
      **`astro:before-swap`**: if `moving`, first settle the traverse
      case — `kind === 'out'` with `to` an image page becomes `'step'`
      (`dir` from `direction`: `back` → `prev`, `forward` → `next`)
      unless the new document holds an `.image-link` whose `href` is
      `event.from.pathname`; then `newDocument.documentElement.dataset.moving = moving.kind`;
      **in** → the new `.image-frame` named, `dataset.understudy = ''`
      and `--understudy` set to `url("<moving.src>")` by
      `style.setProperty`; **step** with a slide → the new figure named
      and `dataset.slide = moving.dir`; **out** → `landing` is the
      `img` inside the `.image-link` whose `href` is
      `event.from.pathname` in the new document, named when found;
      `event.viewTransition?.finished.then(clear, clear)` (never
      `.finally`, which re-throws a skipped transition's rejection),
      where `clear` empties every inline `viewTransitionName` the
      script set, deletes `data-moving` and `data-slide`, and nulls
      `moving` and `landing`. **`astro:after-swap`**: if
      `moving?.kind === 'out'` and `landing` and
      `moving.navigationType !== 'traverse'`: scroll to the stored
      origin's `y` when its `path` is `location.pathname`, else
      `landing.scrollIntoView({ block: 'center', behavior: 'instant' })`
      (the existing `lastY = scrollY` line follows). `global.css`, the
      Motion section: the understudy rule as plan.md spells it (a
      comment: the photograph the reader saw stays in the box until the
      page's own file has decoded — same photograph, same ratio, so
      `100% 100%` is not a distortion; removed by `appear()` on every
      path that shows the image); the slide variant —
      `html[data-slide='next'] { --dir: -1; }`,
      `html[data-slide='prev'] { --dir: 1; }`,
      `html[data-slide]::view-transition-old(photograph) { animation: motion-slide-out var(--dur-move) var(--ease-move) both; }`,
      `html[data-slide]::view-transition-new(photograph) { animation: motion-slide-in var(--dur-move) var(--ease-move) both; }`,
      `@keyframes motion-slide-out { to { opacity: 0; transform: translateX(calc(var(--arrows-slide) * var(--dir))); } }`,
      `@keyframes motion-slide-in { from { opacity: 0; transform: translateX(calc(var(--arrows-slide) * var(--dir) * -1)); } }`
      (a comment: built for the pause's "or slide" question; off at
      `0px`). `motion.test.mjs`: describe (b) already covers the new
      rules (re-run); add to (g): the understudy and slide rules'
      preludes carry `[data-understudy]` / `[data-slide]` (transient
      attributes, never in markup — the markup walk covers them).
      _Verify: `sh scripts/verify.sh` green (count recorded);
      `git diff main -- src/layouts/BaseLayout.astro` shows the three
      listeners and nothing in the header-hide or `image-set` code
      beyond the `lastY` line's neighbours (hunks listed); on the dev
      server (the BiDi recipe) at 1512×982 and 1280×1440: from
      `/galleries/fog-frames/` scrolled so `land-b`'s cell is
      mid-screen, `click` it — during the transition
      `document.getAnimations()` includes effects on
      `::view-transition-group(photograph)` and
      `::view-transition-group(root)` with `getTiming().duration` 480
      and `easing` `cubic-bezier(0.22, 1, 0.36, 1)` (recorded), `html`
      reads `data-moving="in"`, the new figure `data-understudy` and
      `--understudy` equal to the clicked image's `currentSrc`; after
      the stage's `animationend` the figure has neither and `html` no
      `data-moving` after `finished`; history back — during:
      `data-moving="out"`, the cell for
      `/images/where-the-fog-lets-go/land-b/` named; after: `scrollY`
      equals the value before the click (±1); the image page's "In the
      gallery" link — the same reads, `scrollY` from `motion-origin`;
      **on each way back**, read at `astro:after-swap` after the hook:
      the landing `img.complete`, its `data-shown` (`""` expected), and
      the number of frame images on the page that pass through `"fade"`
      (a `MutationObserver` log) — 0 expected for every frame the
      reader saw before the click; if `complete` read false, say
      whether the early-`load` rule caught it; if the count is above
      zero, record the browser and the count and repeat the read on
      `astro preview` (plan.md's known limitation); from
      `/pieces/where-the-fog-lets-go/` (a frame in the prose),
      `/places/the-headlands/` (a wall cell) and an image page's
      related strip — the strip click classified **in**
      (`data-moving="in"`, the strip image named, the understudy on the
      new figure; its clipped rect recorded) and its browser back
      classified **out** with the strip cell named — the same in/out
      reads; a second click on the same gallery cell after returning:
      the figure carries no `data-understudy` and no `--understudy`
      after the hook; an arrow (`→` key and the link): no element named,
      only the root group animates (at 480), the next stage
      `img.complete` is `true` at `astro:after-swap`, and the resource
      timeline lists its candidate URL exactly once (the URL and the
      count recorded), the swap happening within 1.2 s of the key on
      the dev server — and the same arrow taken in the quiet view: the
      preload's URL equals the stage's `currentSrc` under `sizes="100vw"`
      and appears once; with `--arrows-slide: 2rem` on `html` both
      figures named and `getAnimations()` includes `motion-slide-out`
      and `motion-slide-in`; `::view-transition-group(site-header)`
      present on every navigation; with `dom.viewTransitions.enabled=false`
      in the profile: no console error, `startViewTransition`
      undefined, the pages change and `html` carries no leftover
      attribute; under reduced motion: nothing named on any of the
      three navigations, the root group animates (the plan's recorded
      deviation), `data-moving` still set and cleared. Where the
      headless run cannot observe a pseudo-element animation it says so
      line by line and the Phase 1 pause asks the person to attest
      those lines._

- [ ] **T1605** — The quiet view as one movement. Pattern: the
      `setQuiet`/`applyQuiet` pair in `src/pages/images/[...id].astro`
      (~874–886) and the page's comment voice; plan.md's "The quiet
      view as one movement"; spec 017's T1502 record for the numbers
      the after-reads must equal. `[...id].astro` `<style>`: delete the
      `:global(html), :global(body), .image-stage { transition: background-color var(--dur-state) var(--ease-state); }`
      rule (`main`'s `220ms ease`, re-tokened at T1601) and its `@media (prefers-reduced-motion: reduce)` twin; the
      quiet comment above `.quiet-toggle` loses "the ground dimmed …
      cross-fade" wording if any and gains one sentence (entering and
      leaving are one view transition, the frame named for it — spec
      018; the resting rules are unchanged). The script: import
      `NAME`, `flag`, `reducedMotion`, `withTransition` from
      `../../lib/motion`; `setQuiet(quiet)` becomes
      `withTransition(() => { applyQuiet(quiet); store.set(QUIET_KEY, quiet ? '1' : null); if (quiet) window.scrollTo({ top: 0 }); }, 'quiet', reducedMotion() ? null : figure, flag('--motion-quiet') && (!reducedMotion() || flag('--rm-quiet')))`
      with `figure` the `.image-frame` looked up in the call (the
      router swaps it); `applyQuiet` and the `astro:after-swap`
      re-apply untouched. `motion.test.mjs`: describe "(h) the quiet
      view's resting rules are `main`'s": the page's scoped
      `:global(html[data-quiet]) :global(.site-header), …, :global(html[data-quiet]) .quiet-toggle { display: none; }`
      and `:global(html[data-quiet]), :global(html[data-quiet] body) { background: var(--color-quiet); }`
      rules equal the strings pasted from `main` (normalised); the
      page's `<style>` contains no `transition` declaration and no
      `220ms`; `matte.test.mjs`'s stage, frame and quiet cases are
      unedited (`git diff main -- matte.test.mjs` empty — asserted in
      the Verify, not the test). _Verify: `sh scripts/verify.sh` green
      (count recorded); `git diff main -- matte.test.mjs` empty;
      `grep -n "220ms\|transition" 'src/pages/images/[...id].astro'`
      → only the `withTransition` import and call lines (listed);
      `git diff main -- 'src/pages/images/[...id].astro'` shows the
      deleted style block, the import and `setQuiet` and nothing else
      (hunks listed); on the dev server (the BiDi recipe) at 1512×982
      and 1280×1440 on `land-b` (3:2) and `port-a` (2:3): before the
      edit and after, the frame's computed padding, `background-color`,
      the figure's and image's `offsetWidth`/`offsetHeight` and the
      stage's `offsetHeight` in the normal view and in the quiet view
      — identical to each other and to spec 017's T1502/T1503 records
      (the numbers pasted); clicking the frame: `getAnimations()`
      during the transition holds `::view-transition-group(photograph)`
      and `::view-transition-group(root)` at duration 480 and the
      move curve, `html` reads `data-moving="quiet"` and `data-quiet`,
      the figure's inline `view-transition-name` is `photograph`;
      after `finished` the name is empty and `data-moving` gone,
      `data-quiet` stays; Esc: the same in reverse, `scrollY`
      unchanged; the toggle button the same; with `--motion-quiet: 0`
      on `html` no animation is created and the attribute toggles at
      once; under reduced motion with `--rm-quiet` `1` only the root
      group animates and the figure is never named, with `0` nothing
      animates; an arrow in the quiet view keeps `data-quiet` across
      the swap as on `main`. Mutation, reverted: the 220ms rule
      restored → (h) fails and T1601's (b) source scan fails naming
      the page and line._

- [ ] **T1606** — The first look, and the rounds. Not an
      implementation task: the orchestrator's record of the Phase 1
      pause, in the person's words, with T1603–T1605's numbers beside
      it, and the standing instruction for what follows. Each round
      the person asks for at the pause is one sub-lettered task here
      (`T1606a`, `T1606b`, …), dispatched as routine on a bundle of
      the `:root` block, `motion.test.mjs`'s `EXPECTED` table and the
      spec's Decided section: set the value (or the flag, or the fill,
      or the shape — one token in `global.css`), update its `EXPECTED`
      row, add one line to spec.md's Decided section naming the round
      and the outcome, `sh scripts/verify.sh` green. A round that
      wants what the envelope excludes — a fifth behaviour, a resting
      state, the rule, a dependency, a surface the four do not name —
      stops here and goes to the person as a spec amendment. When the
      person names the keeps, the orchestrator records under this task:
      the arrival's shape, the waiting fill, which behaviours stay on,
      the durations and curves kept, the hero's fate for now, whether
      the arrows slide, the reduced-motion split — and Phase 2 is
      dispatched. _Verify: every sub-lettered task green; the `:root`
      values, `EXPECTED` and spec.md's Decided lines agree (`grep` of
      each token's value in the three places, listed); the Phase 1
      record below filled in._

### Phase 1 record (the person's walkthrough)

_(The product owner's attestation from the site under `npm run dev`
on both screens, mouse and trackpad: the fog piece's frames waiting
and fading, the arrivals below the fold, the diptych as one, nothing
replayed on the way back up; the travel from the fog gallery, the
headlands wall, a piece and a related strip, and the way back by the
browser and by the page's links; the arrows; the quiet view's one
movement and its return; the panel's toggles, shape, fill and numbers;
reduced motion on. The rounds as sub-lettered tasks above, and the
keeps in his words. Anything he saw that the spec did not say.)_

## Phase 2 — The documents (reviewer after the phase; walkthrough: none — README, AUTHORING, the brief and spec 007's annotation change nothing on the site; runs on without a pause)

- [ ] **T1607** — Docs: `design/brief.md`, `README.md`, `AUTHORING.md`,
      and spec 007's annotation. Pattern: spec 017's T1505 line
      (specs/017-the-pause-withdrawn/tasks.md) and the brief's
      "Skeuomorphism boundary" section for its voice. `design/brief.md`:
      a new `## Motion` section between "Skeuomorphism boundary" and
      "Screens to design": the rule in Goal 2's words (motion answers
      the reader — a response to arriving, scrolling, clicking,
      hovering, going to another page, or a photograph finishing
      loading; nothing loops, breathes, plays by itself or moves on a
      timer — replacing spec 007's narrower line), the grammar's names
      and the values the pause kept (from T1606's record: three
      durations, two curves, what reads which), the four behaviours in
      one sentence each and the reduced-motion split, what stayed out
      — the glow, closed by the rule and left open; the scroll settle,
      out at the photographer's call ("I don't want to mess with the
      page scroll behavior at this point. I may change my mind later")
      — and the one exclusion (pagefind's own stylesheet on the search
      page). `specs/007-held-image/spec.md`: after the "Timed or
      automatic motion" non-goal's two lines, one trailing line:
      "_Widened at spec 018 to "motion answers the reader": every
      animation is a response to the reader or to a photograph
      finishing loading; nothing loops, breathes or plays by itself.
      The brief's Motion section is the rule now._" `README.md`: the
      image-page paragraph (~170–174) gains, after "the one matted
      surface on the site", a sentence: photographs never pop — every
      frame's box waits in a fill and the photograph fades in when it
      has decoded, below the fold as it scrolls into view; clicking a
      frame carries the photograph into its page's stage and the way
      back returns it; the quiet view grows the photograph into its
      mat as the ground darkens; reduced motion keeps the fades and
      drops the movement; the tree gains `lib/motion.ts`,
      `lib/motion-scan.mjs`, `scripts/check-motion.mjs`,
      `components/DevMotion.astro` and `motion.test.mjs` in the
      existing entries' voice; the spec list gains "018 the animation
      pass". `AUTHORING.md`: one sentence where the treatments are
      introduced (the plugin bullet ~46 or the section after it — the
      implementer names the line): the frames a writer places animate
      by the site's rules — they fade in as they load and travel to
      their pages — and there is nothing to author for it; the plugin
      does not change. Hand-edit the prose (never script-rewrap; grep
      for lines beginning with a CSS `>` or `+` before any format run).
      _Verify: every claim read against T1606's record and the
      stylesheet's `:root`; `grep -n "## Motion" design/brief.md` → 1;
      `grep -n "Widened at spec 018" specs/007-held-image/spec.md` → 1;
      `grep -n "motion" README.md AUTHORING.md` (hits listed);
      `npx prettier --check README.md AUTHORING.md design/brief.md specs/007-held-image/spec.md`
      clean; `sh scripts/verify.sh` green (nothing under test changes —
      the run is the record)._

## Phase 3 — Close-out (the documents, the reviewer sweep, then merge)

- [ ] **T1608** — Close-out. The repo-wide documents are edited by
      `sdd-implementer-fable` — the close-out row of `CLAUDE.md`'s role
      table — on a bundle (T1607 is the pattern; the bundle carries the
      Phase 1 record with every round, plan.md's "Resolved decisions"
      and "Known limitations", spec.md's "Decided" list, `ROADMAP.md`'s
      four entries named here and `DECISIONS.md`'s "Spec 017" section
      for the shape) and committed by the orchestrator on this branch,
      to reach `main` with the PR; the sweep, the merge and the
      bookkeeping are the orchestrator's own part. `ROADMAP.md`:
      strike "Image loading choreography" and "A considered animation
      pass" as done at spec 018 (one clause each: the fade on decode
      and the waiting fill, in the ground's family; the four
      behaviours and the grammar); annotate "Motion, considered" (its
      italic gains: the rule bent to "motion answers the reader" and no
      further — the glow is closed by it and left for a later
      conversation, not decided against; the settle is out at the
      photographer's call, in his words, to be revisited if he changes
      his mind) and "A design language of its own" (first step taken
      at 018: the grammar, the four behaviours; the rest open).
      `DECISIONS.md`: add "## Spec 018: the animation pass" in 017's
      shape — the decision in the photographer's words (from spec.md's
      Summary and Decided: the subset of the modernization, the rule
      widened once, the four surfaces, reduced motion keeps the fades,
      the settle out and why, the spec experimental with its envelope),
      what the plan chose and why — the tokens as the single source
      with the flags beside them, off as a flag not a deletion, the
      gate on the root for the hidden state, the hooks bound at module
      time because the router's first `page-load` is `load`, the
      understudy for the travel in and the preload for the step, the
      figure named on the stage and the image elsewhere, the header's
      own group, the arrows nameless by default, the page's 220ms
      transition deleted, the router's absent reduced-motion path and
      what that means, pagefind's stylesheet excluded — and the keeps
      from the pause in his words, round by round. Both hand-edited
      (`npx prettier --check` clean; grep for lines beginning with a
      CSS `>` or `+` before any format run). Then, the orchestrator's
      part: the pre-merge whole-spec sweep at the reviewer's default
      tier and its findings resolved; the acceptance criteria checked
      against their records (AC 1 by T1600's (a)/(c)/(d) and T1601's
      (b)/(e) with the build's barrier line; AC 2 by T1607's brief
      section; AC 3 by T1603's rect and fill reads on the nine pages
      (the three indexes and the front door among them);
      AC 4 by T1603's no-script read and T1601's barrier; AC 5 by
      T1603's diptych and warm-reload reads and the Phase 1
      attestation; AC 6 by T1604's reads on the four surfaces, the
      back and link returns, the arrows, the understudy, the no-API
      profile, and the attestation; AC 7 by T1605's animation reads,
      its before/after geometry, and T1605's (h); AC 8 by T1600's (d)
      and the reduced-motion reads in T1603–T1605; AC 9 by T1600's (c)
      and its computed reads; AC 10 by T1602's panel reads and the
      barrier's `dev-motion` line; AC 11 by the Phase 1 record; AC 12
      by (a)'s `EXPECTED` and T1606's three-place grep; AC 13 by
      T1603's and T1604's resource timelines and `package.json`'s
      unchanged dependencies; AC 14 by the final run and the greps
      below); build, tests, check, GPS scan, dev-routes scan, motion
      scan and format green with actual output; the PR marked ready
      and merged with a merge commit; the close-out box ticked in the
      same shell command as the merge bookkeeping. _Verify: the
      implementer's `sh scripts/verify.sh` green with the documents
      edited; `grep -n "Spec 018" DECISIONS.md ROADMAP.md` → the new
      section and the four annotations; `git diff main --stat` lists
      no file outside plan.md's File structure and this directory;
      `git diff main -- package.json` shows the `postbuild` line only;
      main green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log

> **The standard profile**, as `CLAUDE.md`'s role table fixes it: the
> session on `claude-fable-5-1` at medium effort; the planner, the
> plan/tasks sign-off and any decision review at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> task implementation and the per-phase reviews and sweep at `opus`;
> close-out at the top tier's model at medium (`sdd-implementer-fable`).
> Baseline — spec 017 (the previous spec under this profile):
> implementer 10 dispatches ≈ 717k (the close-out at the top tier,
> 80k); reviewer 8 invocations ≈ 591k; top tier: planning ≈ 452k,
> sign-off ≈ 320k, one decision review 57k; no tier miss, no fallback.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation                                           | Tier                           | Tokens                      | Outcome / miss reason                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                             | top (`claude-fable-5-1`, high) | 301,018                     | drafted; 8 deviations reported, 2 corrected the spec's router claims                                                                                                       |
| Planning: sign-off fixes (`sdd-planner`, resumed)           | top (`claude-fable-5-1`, high) | 89,960 (cumulative 390,978) | five blocking fixed, eight notes folded                                                                                                                                    |
| Sign-off (`skeptical-reviewer`)                             | top (`claude-fable-5-1`, high) | 164,289                     | fix and re-review: 5 blocking, 8 notes                                                                                                                                     |
| Sign-off re-review (`skeptical-reviewer`, resumed)          | top (`claude-fable-5-1`, high) | 32,818 (cumulative 197,107) | signed off; 4 lines carried (14–17)                                                                                                                                        |
| Step-down (the person's request, 2026-09-23)                | all rows → `opus` (Opus 5.5)   | —                           | low Fable allowance; session on `claude-opus-5-5` medium; decision review and close-out at `opus`, no override, for the rest of 018 (CLAUDE.md's role table)               |
| T1600 (`sdd-implementer`, + one fix round)                  | `opus` (Opus 5.5)              | 96,822                      | done; 341 tests; `!important` 4 → 1; `.social-links a` has two properties, not three                                                                                       |
| T1600 review + decision (`skeptical-reviewer`)              | `opus` (Opus 5.5)              | 63,733                      | 2 blocking (reduced-motion cascade: social-link border fade cut; hero delays survive) → option D transcribed into plan.md                                                  |
| T1600 re-review (`skeptical-reviewer`, resumed)             | `opus` (Opus 5.5)              | 69,238 cumulative           | signed off                                                                                                                                                                 |
| T1600→T1601 decision review (`skeptical-reviewer`, resumed) | `opus` (Opus 5.5)              | 78,021 cumulative           | option B: T1601 re-tokens the quiet ground's 220ms; T1605 deletes it                                                                                                       |
| T1601 (`sdd-implementer`)                                   | `opus` (Opus 5.5)              | 74,700                      | done; 360 tests; three barrier lines; minifier drops `ease` and writes `.22s` — the source scan is what catches a bare `ease`; headless Firefox defaults to reduced motion |

_(Session-tier allowance draw noted at each pause.)_

**Open non-blocking notes carried to the pre-merge sweep:**

- Sign-off re-review 14–16 are transcribed into plan.md's "Carried from
  the sign-off" and into T1603/T1604 as binding text; the sweep checks
  they landed. 17 (the `viewtransitions.css` wording) is applied in
  plan.md.

## Handoff note

Nothing is implemented; the next session begins at **T1600** (Phase 0)
as the orchestrator under the model policy's standard profile and its
role table: it opens on `claude-fable-5-1` at medium effort from
`.claude/settings.json` (`/effort status` to confirm); it dispatches
the `sdd-implementer` one task at a time at `opus` and the
`skeptical-reviewer` per phase at `opus`, re-running `sh scripts/verify.sh`
itself for **T1600** (`review: per-task`); a design question it cannot
triage as routine goes to the `skeptical-reviewer` at the top tier on
a decision bundle from Plan Mode. The suite is green at the end of
every task; `motion.test.mjs` grows describe by describe (a/c/d at
T1600, b/e at T1601, f at T1602, g at T1603–T1604, h at T1605). **Phase
0 has no walkthrough** and runs on. **The Phase 1 pause is the
walkthrough and the spec's judgement**, over as many rounds as it
takes: the fog piece, the fog gallery, the headlands wall, the `land-b`
and `port-a` image pages, the quiet view, the panel, reduced motion on
— on both screens, mouse and trackpad — with T1603–T1605's numbers in
the report; each round is a sub-lettered task under T1606, and the
keeps are recorded there and in spec.md's Decided section before Phase
2 is dispatched. The orchestrator does no browser or device checks
itself. **Phase 2 has no walkthrough** and runs on to the close-out
without stopping; the merge pause is the second and last.

> Read `CLAUDE.md` and `specs/018-the-animation-pass/{spec,plan,tasks}.md`,
> then begin at the first unchecked task as the orchestrator under the
> model policy's standard profile and its role table (`/effort status`
> first; medium is right for this session): triage; dispatch each
> routine task to the `sdd-implementer` on a task bundle assembled with
> shell (the task line, the plan sections, the acceptance criteria, the
> files, the pattern file, any recorded value — for T1603 and T1604,
> plan.md's "Appearance and arrival" and "The travel" with their CSS
> and the router facts at the top of "Shape of the change"), telling
> it not to read plan.md, spec.md, or tasks.md in full; take the
> verification from the implementer's verbatim `sh scripts/verify.sh`
> output, except T1600, which you re-run yourself before committing
> (`review: per-task`); do no browser or device checks by hand — the
> implementer measures and records, the person attests the rest;
> stage, then bundle the diff for the `skeptical-reviewer` per phase
> (and once for T1600 on its own), one review and at most one
> re-review, the rest logged; commit, check the box, and log the tier
> and tokens in one shell command. Involvement level is product owner:
> Phase 0 runs on without a pause; pause after Phase 1 — its report
> names the fog piece, the fog gallery, the headlands wall, the `land-b`
> and `port-a` image pages and the quiet view to open on both screens
> with a mouse and a trackpad, what to look for (frames waiting and
> fading, arrivals once, the diptych together, the photograph lifting
> into the stage and back into its cell, the arrows' cross-fade, the
> quiet view's one movement, the panel's toggles and fields, reduced
> motion), and the questions the spec puts to him there (the arrival's
> shape, the fill, the behaviours kept on, the numbers) in plain
> language; each round he asks for is a sub-lettered task under T1606
> (one value, one test row, one Decided line), and a change outside
> the tuning envelope is a spec amendment, not a round; Phase 2 runs
> on without a pause; pause whenever something unexpected bears on
> spec adherence; the same session continues after the pause when the
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
