# Tasks: The place page — one wall

**Status**: Signed off (2026-09-13) — by the `skeptical-reviewer` at the
top tier; three blocking findings fixed and cleared on the one re-review,
seven non-blocking notes folded in, five carried to the sweep below.
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T1000–T1001) — the inert spacing mechanism
and the sampler the gate judges; reviewed as a phase, no task marked
`review: per-task` (nothing later inherits a mistake here except through
the gate, which the person attests). Phase 1 and Phase 2 are per-phase
(Phase 2's review is the pre-merge sweep). The Phase 0 pause is the
visual gate.

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
spec.md, or tasks.md in full; the implementer's verbatim `sh
scripts/verify.sh` output is the verification; the reviewer checks each
phase as a whole from a staged, shell-assembled bundle — one review and
at most one re-review, anything still open logged and left to the
sweep. A design question the session cannot triage as routine goes to
the `skeptical-reviewer` at the top tier on a decision bundle, never
resolved in the session. The sweep runs on the documents plus `git diff
main...HEAD`. The orchestrator never does device or browser checks by
hand: geometry is the implementer's Verify criterion (numbers recorded
in this file), and what it cannot measure the person attests at the
phase pause on his two screens. One implementation session runs the
whole spec: a phase pause is a pause in it — the person attests and says
continue — not a session boundary; the person is paused for after each
phase and whenever something unexpected bears on spec adherence. If the
person stops at a pause, the report ends with the continuation prompt
for a fresh session (`/compact` if the context grows large; never
mid-task).

Task ids: 012 = T10xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T10xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the spacing mechanism (inert) and the sampler (reviewer after the phase; the gate at its end)

- [x] **T1000** — The writing-to-wall token and rules, inert.
      `src/styles/global.css`: in the main `:root` beside
      `--head-pad-reading`/`--head-gap-reading`, add `--place-wall-gap:
      clamp(3.5rem, 5.5vw, 5.5rem)` (`.section`'s padding — the inert
      default; the gate's value lands at T1002) with a one-line comment;
      after the `@media (min-width: 720px) { :root { --head-… } }` block
      that follows the reading-head rules, add the plan's three rules with
      its comment — `.place-writing { padding-block-end: 0; }`,
      `.place-writing .prose > :last-child { margin-bottom: 0; }` (a `p`
      carries `--para-gap`; the `.piece-held-prose > :last-child` idiom),
      and `.section.place-wall { padding-block-start: var(--place-wall-gap); }`
      (later in source than `.reading-head + .section`, same specificity,
      on purpose). No template uses either class yet. Pattern: the
      reading-head block just above (spec 010, T807). _Verify: `sh
      scripts/verify.sh` green (265 tests, 12 files — `page-head.test.mjs`
      still green with the added `:root` declaration); `grep -rc
      "place-wall\|place-writing" src/pages/ src/components/
      src/layouts/` → 0 everywhere; `sed -E 's#/_astro/[^"]+\.css#CSS#g'
      dist/places/the-headlands/index.html | shasum` recorded before and
      after the task, identical — the stylesheet's `<link href>` is
      normalised first, because `global.css` is far over the 4 kB
      threshold of Astro's default `build.inlineStylesheets: auto` and is
      emitted as a content-hashed external file, so the raw HTML hash
      changes with any stylesheet edit (the template itself does not
      change at T1000: inert by construction). Output and both hashes
      recorded here._

_T1000 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 748 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`; `astro check` 0 errors 0 warnings 0 hints, `CHECK EXIT 0`; `Test Files 12 passed (12)`, `Tests 265 passed (265)`, `TEST EXIT 0`. Normalised `dist/places/the-headlands/index.html` hash before `f21cc96a5c19b26b3662a2a73ecfa8a50d33e6c8`, after `f21cc96a5c19b26b3662a2a73ecfa8a50d33e6c8` — identical. `grep -rc "place-wall\|place-writing" src/pages/ src/components/ src/layouts/` → 0 everywhere. `prettier --check src/styles/global.css` clean. The plan's two trailing comments were written as block comments above their rules (file style); content unchanged.

- [x] **T1001** — The sampler (dev-only).
      `src/pages/dev/place-wall/[...candidate].astro`
      (`src/pages/dev/galleries/[...candidate].astro` is the pattern —
      copy its three lessons: `getStaticPaths()` returns `[]` unless
      `import.meta.env.DEV`; the candidate table declared **inside**
      `getStaticPaths` and passed as a prop; the REAL predicate
      `img.piece === null && !!img.label?.camera && !/^Fixture/i.test(img.label.camera)`
      with the whole-root fallback below six). The plan's seven
      candidates (`current`, `wall-tight`, `wall-head`, `wall-section`,
      `bare-tight`, `bare-head`, `bare-section`). Each renders one
      `<article>` in the place page's exact markup and classes:
      `header.page-head.section.reading-head` (eyebrow "Place", the
      fixture place `the-headlands`'s title, lead, and `summary` from
      `getImageRegistry().places`), then — unless `bare` —
      `div.section.place-writing > div.prose` with `render(place.entry)`'s
      `<Content />`, then `div.section.place-wall` with
      ``style={`--place-wall-gap: ${gap}`}`` **on that div** and inside it
      the wall of the real photographs: for `current` a
      ``<ul class="gallery-flow" style={`--gallery-short: clamp(200px, 26vw, 280px); --gallery-stretch: ${GALLERY_STRETCH}`}>``
      (`GALLERY_STRETCH` imported, as the galleries sampler does)
      with `galleryCell(image.image, 280)`; for every other candidate
      `<ul class="gallery-flow gallery-wide" style={galleryFlowStyle}>`
      with `galleryCell(image.image)` — consumed from
      `src/lib/gallery-layout.ts`, not retyped. Paths: `/dev/place-wall/`
      (all seven stacked, each under a `.sampler-label` naming id,
      packing, gap value, and with/without writing) and
      `/dev/place-wall/<id>/` (one full-page, with the banner linking the
      others and `stacked`). _Verify: `sh scripts/verify.sh` green with
      `[check-no-dev-routes] no dev routes in dist/.`; `test ! -e dist/dev
      && echo absent`; `grep -c "/dev/" dist/sitemap-0.xml` → 0; the
      temporary negative control — the `DEV` guard removed, `npm run
      build` fails at the barrier naming `dist/dev/place-wall/…`, output
      recorded, guard restored and re-verified. Then on the dev server at
      1512×982: `/dev/place-wall/` renders seven articles; the `wall-*`
      and `bare-*` flows measure wider than `current`'s (≈1433 vs 1160 —
      equal widths mean lesson 1 was missed); the prose-to-first-row
      distance — measured to the **top of the `ul.gallery-flow`**, not to
      the first image (the flow is `align-items: center`, so a landscape
      frame beside a portrait sits below the list's top) — on
      `wall-tight` / `wall-head` / `wall-section` measures three distinct
      values (≈24 / 48 / ≈83px); the `bare-*` articles show head then
      wall with the same three distances; the count of real images the
      set drew on recorded (10 expected). Where the implementer cannot
      drive a browser it says so, line by line, and the Phase 0 pause
      asks the person to attest those lines on his two screens._

_T1001 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 748 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 12 passed (12)`, `Tests 265 passed (265)`, `TEST EXIT 0`; `test ! -e dist/dev` → absent; `grep -c "/dev/" dist/sitemap-0.xml` → 0. Negative control (guard removed): `[check-no-dev-routes] dist/dev/ exists — a dev-only route was built: dist/dev/place-wall/bare-head/index.html, … dist/dev/place-wall/wall-tight/index.html` (eight files), `NPM BUILD EXIT 1`; guard restored, verify re-run green (same counts). Geometry, headless Firefox 155 via WebDriver BiDi at a confirmed 1512×982 viewport on the dev server, `/dev/place-wall/`: seven articles; flow widths `current` 1160.0px vs every `wall-*`/`bare-*` 1448.0px (the plan's ≈1433 assumed a ~15px classic scrollbar; headless reserved none — 1512 − 2×32 page pad); prose→top of `ul.gallery-flow`: `wall-tight` 24.0 / `wall-head` 48.0 / `wall-section` 83.2px; head→flow top on `bare-tight`/`bare-head`/`bare-section` 24.0 / 48.0 / 83.1px; `current` prose→flow 83.2px; 10 cells in every flow (the REAL predicate over a 38-raster root; the fallback did not fire); `/dev/place-wall/<id>/` pages 200 with one article, the banner, six sibling links plus `stacked`; `wall-head` full-page remeasured identical to stacked. Side note: the first *image* sits a further ≈26–29px below the flow's top (`align-items: center`). Nothing left unmeasured; the second screen is the person's at the gate. Deviations: the sampler's scoped `<style>` carries the place page's `.lead { max-width: var(--prose-width) }` so the head reads as it does there; the full-page view also shows its `.sampler-label`; the summary line is annotated "(the fixture place's own counts)". Read beyond the bundle: `global.css`, `scripts/check-no-dev-routes.mjs`, `scripts/verify.sh`, `package.json`, `src/content/places/the-headlands.md`, the gallery-images listing, `src/lib/images.ts` (grep). A BiDi driver script (`measure.mjs`, scratchpad) measured this and can serve T1002.

### Gate record (Phase 0 pause)

**Gate outcome (2026-09-13, the product owner, from the sampler):**
candidate `wall-section`. The packing is the galleries' — width, gap,
and density confirmed as shown, no change to `gallery-layout.ts`'s
constants. The writing-to-wall gap is one `.section` padding,
`clamp(3.5rem, 5.5vw, 5.5rem)` (≈83px on the laptop). The head case (a
place with no writing) takes the same value — no `.reading-head +
.section.place-wall` override, and the CSS test asserts its absence.
Screens: not named in the decision. Consequence for T1002: the token
keeps the literal T1000 landed (it was already the gate's value), with
the comment dated; the reviewer's by-reference suggestion is not taken
because no `.section` token exists and the plan's test pins a literal —
no fifth copy is added either way.

## Phase 1 — The wall and the docs (reviewer after the phase; the person's pause at its end)

<!-- T1002 is the load-bearing visible change under per-phase review;
the phase review must treat its recorded numbers and grep results as
the substance of the review, not a formality (011's sign-off note 4). -->

- [x] **T1002** — The wall. `src/pages/places/[slug].astro`
      (`src/pages/galleries/[slug].astro` is the pattern for the flow and
      the cell): replace the outings loop, `placeFlowStyle`,
      `PLACE_SHORT_PX`, the `formatDate` import, and the four `.outing*`
      scoped rules with the plan's markup — `cells` mapped from
      `place.frames` with `galleryCell(image.image)`; the writing's
      `.section` gains `place-writing`; one `div.section.place-wall`
      with `data-pagefind-ignore` holding `<ul class="gallery-flow
      gallery-wide" style={galleryFlowStyle}>`; the header comment
      rewritten for spec 012; the `.lead` rule kept. `src/styles/global.css`:
      `--place-wall-gap` → the gate's value (comment: the gate date and
      the candidate chosen); if the gate kept spec 010's head gap for the
      no-writing case, add `.reading-head + .section.place-wall {
      padding-block-start: var(--head-gap-reading); }` after the wall
      rule. `src/lib/gallery-layout.ts`: header comment names the place
      wall among what the knobs drive (no code change). If the gate moved
      the packing, the constants in `gallery-layout.ts` and
      `gallery-layout.test.mjs`'s anchors move as 011's T904 did.
      `place-page.test.mjs` (new, root; `page-head.test.mjs` is the
      pattern, its `blocks`/`declarations` helpers copied): the plan's
      cases — (a) the template uses `galleryFlowStyle` and `gallery-wide`,
      has no `--gallery-` literal, no `placeFlowStyle`/`PLACE_SHORT_PX`,
      and every `galleryCell(` call has one argument; (b) it renders from
      `place.frames`, never `place.outings`, one `class="gallery-flow`,
      no `outing`, and still renders `place.summary` (the head's summary
      line, AC 5); (c) `:root` declares `--place-wall-gap` at the gate's
      literal, `.place-writing` zeroes `padding-block-end`,
      `.place-writing .prose > :last-child` zeroes `margin-bottom`,
      `.section.place-wall` reads the token, the head-case rule present or
      absent per the gate, and the rule whose selector is **exactly**
      `.section.place-wall` (not the head-case rule, if present) comes
      **later in the uncommented CSS** than the `.reading-head + .section`
      rule (equal specificity; source order is load-bearing for the head
      case). _Verify: `sh scripts/verify.sh` green with the
      new file; mutations named and reverted — `galleryCell(image.image,
      280)` restored (a fails), a per-outing map restored (b fails), the
      token's literal retuned (c fails), `.place-writing` deleted (c
      fails), the `:last-child` rule deleted (c fails), `place.summary`
      removed from the template (b fails), the wall rule moved above the
      reading-head rule (c fails). Built HTML for `dist/places/the-headlands/index.html` and
      `…/the-jetty/index.html`: between `</header>` and `<footer` no
      `href="…/pieces/`, `<h2`, `<time`, `outing`, or `<hr`; exactly one
      `<ul class="gallery-flow gallery-wide"` carrying the
      `galleryFlowStyle` string; `data-pagefind-ignore` on the wall's
      section; `og:image` the cover; for each consecutive pair of the
      wall's `/images/` hrefs the first's page has a `frame-nav`
      `data-set="place:<slug>"` whose `data-nav="next"` is the second, the
      last has no `next` and the **first has no `prev`** in that
      `frame-nav`, and the wall's href count equals the M in the head's
      "N outings · M frames" line (a shell loop; pairs counted). `git diff main --
      src/lib/images.ts src/lib/image-set.ts src/lib/image-meta.mjs
      src/pages/images/[...id].astro src/pages/places/index.astro
      src/components/CoverCards.astro src/content.config.ts` empty. On
      the dev server at 1512×982, 1280×1440, and 375×812: the place wall's
      `.gallery-flow` width equals `/galleries/every-ratio/`'s at the
      same viewport; `gap` 24px; a landscape cell's short side ≈324 /
      ≈417; `.prose` 666; prose-to-first-row (to the top of the
      `ul.gallery-flow`, as at T1001) = the gate's value;
      head-to-first-row on `the-jetty` with its body temporarily blanked
      on the dev server = the gate's head-case value, the file restored
      after and `git status --short src/content/places/` empty, recorded;
      375: one frame per
      row at 343; `scrollWidth ≤ clientWidth` everywhere. Every number
      recorded here; any line the implementer cannot measure named for
      the person's attestation at the pause._

_T1002 record (2026-09-13, implementer at opus):_ `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 13 passed (13)`, `Tests 277 passed (277)`, `TEST EXIT 0`. Mutations, each reverted: `galleryCell(image.image, 280)` → case (a) "every galleryCell( call takes one argument" fails; per-outing map → (b) "maps place.frames and never touches place.outings" and "exactly one gallery-flow list" fail; token retuned → (c) "the gate's value" fails; `.place-writing` deleted → (c) two tests fail (the padding test and the new `.place-writing`-after-`.section` order test); `:last-child` deleted → (c) fails; `place.summary` removed → (b) "still renders the head's summary line" fails; wall rule moved above reading-head → (c) order test fails (`expected 29 to be greater than 30`). Built HTML, article `</header>` to `<footer`: the-headlands / the-jetty — `href="…/pieces/` 0/0, `<h2` `<time` `<hr` 0; one `<ul class="gallery-flow gallery-wide"` each with the emitted `galleryFlowStyle` (`--gallery-short: clamp(280px, 33vmin, 460px); --gallery-stretch: 1.35; --gallery-width: calc(100vw - 2 * var(--page-pad)); --gallery-gap: calc(var(--baseline))`); `data-pagefind-ignore` on the wall, `data-pagefind-body` on the article; `og:image` the covers (`land-a`, `jetty-dawn`); wall hrefs 6 and 2 = M in "1 outing · 6 frames · 2026" / "2 outings · 2 frames · 2026". The one `outing` hit in the-headlands is the fixture's own prose sentence ("Below the writing the page gathers every outing there…"), pre-012 wording — fixed at T1003. Arrow chain: the-headlands 5 pairs of 5 `next` matches, the-jetty 1 of 1; first frames no `prev`, last no `next`. `git diff main --` on the seven untouched files → 0 lines. Geometry (headless Firefox, which reserves a 15px scrollbar, so absolute widths read 15 under 011's records): place wall `.gallery-flow` width = `/galleries/every-ratio/`'s at 1512×982 / 1280×1440 / 375×812 — 1448 / 1216 / 328 both pages; gaps 24/24 everywhere; `--gallery-short` identical on both `ul`s; `.prose` 666.4; prose→flow top 83.2 / 70.4 / 56 = the gate's clamp at each `clientWidth`; head→flow top with the-jetty's body blanked 83.2 / 70.4 / 56 (not the head gap's 48 — the source order renders); 375: one cell per row, 312 in a 328 flow; `scrollWidth ≤ clientWidth` everywhere; landscape short side 324.8 at 1512; at 1280×1440 no cell lands on the bare ≈417 (rows stretch to the 1.35 cap: 570.2/449.9), the density declaration equal by string. Fixture restored, `git status --short src/content/places/` empty; server and Firefox stopped. Read beyond the bundle: `scripts/verify.sh`, `vitest.config.ts`, `the-jetty.md`. No deviations.

- [x] **T1003** — Docs: `AUTHORING.md` and `README.md`. `AUTHORING.md`
      "Places": the paragraph beginning "`/places/<slug>/` shows the
      title…" describes the page as the writing and then one wall — every
      published frame at the place as one packed gallery, outings oldest
      first, each piece's frames in its order, no heading or divider
      between visits — and says the frame's own page names its piece;
      the closing "A gallery-root photograph cannot join a place — the
      page groups by piece and it has none" becomes: not grouped under a
      place because they have no publish date to take a turn by
      (`ROADMAP.md`). `README.md`: the "Place" paragraph's "grouped by the
      piece it lives in" → the one-wall description; the galleries
      paragraph's "Place pages pack their outings … keep their own pre-011
      packing" → place pages share the galleries' width, gap, and
      format-aware density from `gallery-layout.ts`; the
      `lib/gallery-layout.ts` tree comment drops "place pages call
      galleryCell but keep their own pre-011 packing"; the `pages/dev/`
      tree comment gains the place-wall sampler. Also (added after T1002's
      record): `src/content/places/the-headlands.md`'s sentence "Below the
      writing the page gathers every outing there, oldest first, as the
      pieces were published" describes the pre-012 page — reword it to the
      one wall (frontmatter untouched). Hand-edit the prose
      (never script-rewrap). _Verify: every claim read against the built
      pages and the gate record; `npx prettier --check AUTHORING.md
      README.md` clean; `sh scripts/verify.sh` green._

_T1003 record (2026-09-13, implementer at opus):_ `npx prettier --check AUTHORING.md README.md` → `All matched files use Prettier code style!`; `sh scripts/verify.sh` — `87 page(s) built`, `[check-no-gps] 741 images scanned in dist/ — no GPS metadata.`, `[check-no-dev-routes] no dev routes in dist/.`, `BUILD EXIT 0`, `CHECK EXIT 0` (0/0/0), `Test Files 13 passed (13)`, `Tests 277 passed (277)`, `TEST EXIT 0`. Built the-headlands, article `</header>` (the last one before `<footer`, not the site nav's) to `<footer`: `outing` 0, `/pieces/` 0, headings 0, 6 frames. Changes: AUTHORING "Places" paragraph and its gallery-root closing; README galleries paragraph, "Place" paragraph (two passages — the second, "not grouped under a place", is beyond the task line's list but contradicted the wall in the same paragraph; declared), and the two tree comments; the-headlands.md's body sentence now "Below the writing every frame made there hangs as one wall, oldest first, in the order the pieces were published." Adjacent sentences rewrapped by hand, wording unchanged. Read beyond the bundle: `src/pages/images/[...id].astro` (grep), the sampler's header comment.

## Phase 2 — Close-out (the docs, the reviewer sweep, then merge)

- [ ] **T1004** — Close-out. The two repo-wide documents are edited by
      the `sdd-implementer` on a bundle (T1003 is the pattern; the bundle
      carries the gate record, plan.md's "Resolved decisions" and its
      gate amendment, and the ROADMAP entry to strike) and committed by
      the orchestrator; the sweep, the merge, and the bookkeeping are the
      orchestrator's own part, as CLAUDE.md assigns them. `ROADMAP.md`:
      strike "The place page's own treatment" (shipped as spec 012 — one
      wall, no attribution on the page, the galleries' knobs, the gap
      chosen at the gate); in spec 009's follow-ups, the gallery-root
      note now reads that the grouping reason is gone and only an
      ordering rule (a pieceless frame has no publish date) keeps them
      out — the cost has fallen; note the summary line still counts
      outings. `DECISIONS.md`: a spec 012 section — one seamless wall
      over per-piece bands and why (the label had nowhere to sit on a
      bleed band; attribution already on the image page); the wall
      rendered from the registry's flat frame list so the page's order
      and the arrows' order are one list; one spacing token on the wall's
      section with the writing's padding zeroed, so the gate names the
      number that renders; the head case's outcome; what the gate
      confirmed or moved. Both ride this branch and merge with the PR, in
      their own commit (`npx prettier --check` clean; hand-edited prose,
      never script-rewrapped). Then, the orchestrator's part: the
      pre-merge whole-spec sweep at the
      reviewer's default tier and its findings resolved; the acceptance
      criteria checked against their records (the sampler's absence from
      `dist/` by T1001's and the final build's barrier line); build,
      tests, check, GPS scan, dev-routes scan, and format green with
      actual output; the PR marked ready and merged with a merge commit;
      the close-out box ticked in the same shell command as the merge
      bookkeeping. _Verify: the implementer's `sh scripts/verify.sh`
      green with the two documents edited; main green after the merge._

---

### The pre-merge sweep

The `skeptical-reviewer` sweeps the whole spec at its default tier, on
`spec.md`, `plan.md`, `tasks.md`, the carried notes, the final
verification, and `git diff main...HEAD`. Blocking findings fixed and
re-reviewed once; anything open after goes to the tier log below.

## Tier log (the first spec under experiment 1)

> **Experiment 1** — the session on `claude-fable-5-1` at medium effort;
> the planner and the plan/tasks sign-off at the top tier
> (`claude-fable-5-1`, effort high) with an explicit per-call override;
> implementer and per-phase reviews at `opus`. This log measures the
> allowance draw and the readability of the reports for the first time.
> Baselines — spec 011 (all opus, budget fallback): planner 148,300;
> sign-off 48,861; implementer 178,802 over 5 dispatches; reviewer 246,857
> over 5 invocations. Spec 010: planner 139,477 (top tier); implementer
> 399,793 over 11; reviewer 461,195 all tiers.

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, the fallback switch
if the top tier's budget runs out (the row and the time), and the third
tier if it is ever on (it is off). -->

| Task / invocation                            | Tier                         | Tokens | Outcome / miss reason |
| -------------------------------------------- | ---------------------------- | ------ | --------------------- |
| Planning: draft (`sdd-planner`)              | top (`claude-fable-5-1`, high) | 133,795 | drafted first pass; no product question returned |
| Sign-off: plan/tasks (`skeptical-reviewer`)  | top (`claude-fable-5-1`, high) | 88,526 | 3 blocking (T1000 hash Verify; session-per-phase wording; T1004 by hand), 7 notes |
| Sign-off re-review (`skeptical-reviewer`)    | top (`claude-fable-5-1`, high) | 35,920 | signed off; 5 notes carried below |
| T1000 impl (`sdd-implementer`)               | implementation (opus)        | 24,471 | green first pass; no miss |
| T1001 impl (`sdd-implementer`)               | implementation (opus)        | 61,789 | green first pass; all geometry measured headless; no miss |
| Phase 0 review (`skeptical-reviewer`)        | reviewer default (opus)      | 51,330 | signed off, no blocking; 7 notes, 4 carried to T1002 below |
| T1002 impl (`sdd-implementer`)               | implementation (opus)        | 83,601 | green first pass; 7 mutations proven; all geometry measured; no miss |
| T1003 impl (`sdd-implementer`)               | implementation (opus)        | 40,401 | green first pass; one declared extra passage; no miss |
| Phase 1 review (`skeptical-reviewer`)        | reviewer default (opus)      |        |                       |
| T1004 impl (`sdd-implementer`)               | implementation (opus)        |        |                       |
| Pre-merge sweep (`skeptical-reviewer`)       | reviewer default (opus)      |        |                       |

_(Session-tier allowance draw noted at each pause.)_ Session open, 2026-09-13, before T1000: Fable allowance 69% left. Phase 0 pause (the gate), 2026-09-13: 67% left.

**Open non-blocking notes carried to the pre-merge sweep:**

- _(Phase 0 review, for T1002's bundle)_ The sampler's `<article>` drops
  `data-pagefind-body` and the wall carries no `data-pagefind-ignore`;
  T1002 must add both on the shipped page deliberately (the spec's
  "search still ignores the wall") — verify by grep on the template.
- _(Phase 0 review, for T1002's test)_ `.place-writing { padding-block-end:
  0 }` beats `.section` by source order alone (both (0,1,0)); case (c)
  should pin that index relationship too, beside the wall/reading-head one.
- _(Phase 0 review, for T1002)_ `clamp(3.5rem, 5.5vw, 5.5rem)` now sits in
  four places in `global.css`; if the gate chooses "one `.section`
  padding", land it by reference (a token `.section` also reads, or
  `--head-gap-reading` where equal), not a fifth literal.
- _(Phase 0 review, for T1002)_ The sampler's `current` row retypes
  `PLACE_SHORT_PX`/`placeFlowStyle` on purpose; T1002 must retire both
  from `places/[slug].astro` or two copies of one density remain.
- _(Phase 0 review, dev-only, no action)_ The stacked sampler renders
  `<Content />` four times, so body heading ids repeat; no layout effect.

- _(sign-off re-review)_ Test case (c)'s order assertion must take the
  index of the rule whose selector is exactly `.section.place-wall`, not
  the head-case rule `.reading-head + .section.place-wall` if the gate adds
  it (folded into T1002's text).
- _(sign-off re-review)_ T1004's `npx prettier --check ROADMAP.md
  DECISIONS.md` clause was not confirmed from the bundle; checked by the
  orchestrator at sign-off: both clean on 2026-09-13.
- _(sign-off re-review)_ The arrow-chain loop's "href count equals M"
  rests on the head's summary reading "N outings · M frames · years"
  (`placeSummary`); if the wording differs, adjust the regex, don't drop
  the check.
- _(sign-off re-review)_ T1000's "265 tests, 12 files" is a count at
  sign-off; T1002 adds a file — later Verify lines must not copy it.
- _(sign-off re-review)_ plan.md's description of today's page says
  "stretch 1.35" and the sampler's `current` row says `GALLERY_STRETCH`
  (imported); they agree only while the constant stays 1.35.

**Totals (at the merge).** _To be filled: planner, sign-off,
implementer (per dispatch), reviewer (per invocation), tier misses,
fallback switches, against the baselines above._

## Handoff note

**Nothing is implemented yet.** The next session begins at **T1000**
(Phase 0) as the orchestrator under the model policy's experiment 1: it
opens on `claude-fable-5-1` at medium effort from `.claude/settings.json`
(`/effort status` to confirm); it dispatches the `sdd-implementer` one
task at a time at `opus` and the `skeptical-reviewer` per phase at
`opus`; a design question it cannot triage as routine goes to the
`skeptical-reviewer` at the top tier on a decision bundle from Plan
Mode. The **Phase 0 pause is the visual gate**: the sampler's URLs
(`/dev/place-wall/` and `/dev/place-wall/<id>/`) and the candidate table
go to the person on both screens, and he confirms the packing and names
the writing-to-wall gap and the head case — the values are not in the
plan. The orchestrator does no browser or device checks itself.

> Read `CLAUDE.md` and `specs/012-place-page/{spec,plan,tasks}.md`, then
> begin at the first unchecked task as the orchestrator under the model
> policy's experiment 1 (`/effort status` first; medium is right for this
> session): triage; dispatch each routine task to the `sdd-implementer`
> on a task bundle assembled with shell (the task line, the plan
> sections, the acceptance criteria, the files, the pattern file, any
> recorded gate value), telling it not to read plan.md, spec.md, or
> tasks.md in full; take the verification from the implementer's
> verbatim `sh scripts/verify.sh` output (no task is `review: per-task`);
> do no browser or device checks by hand — the implementer measures and
> records, the person attests the rest; stage, then bundle the diff for
> the `skeptical-reviewer` per phase, one review and at most one
> re-review, the rest logged; commit, check the box, and log the tier and
> tokens in one shell command. Involvement level is product owner: pause
> after each phase — the Phase 0 pause is the gate, and its report
> carries the sampler's URLs and the candidate table in plain language —
> and whenever something unexpected bears on spec adherence; the same
> session continues after each pause when the person says so, and if the
> person stops at a pause, end the report with the continuation prompt
> for a fresh session.

Every pause produces a report in this shape, in this order, in plain
language (no task ids, agent names, or tier names):

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
