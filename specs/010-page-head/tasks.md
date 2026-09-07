# Tasks: The page head

**Status**: Signed off (2026-09-07) — drafted by the `sdd-planner`,
signed off by the `skeptical-reviewer` at the top tier on the second
pass; pending the product owner's approval of the conformance summary
**Implements**: plan.md in this directory
**Foundational phases**: 0 (T801–T803) — reviewed as a phase, except
T803, which carries `review: per-task` (the mechanism and the sampler
that Phase 1's values and the gate itself inherit); Phases 1 and 2 are
per-phase (Phase 2's review is the pre-merge sweep). The Phase 0 pause
is the visual gate.

Ordered, small, independently verifiable. Per the constitution: every
implementation task ends with the verification command's actual output
(`sh scripts/verify.sh`) reported, not summarized; the existing
252-test suite stays green through every task. Cadence (product owner,
under the model policy): the orchestrating session triages each task
and dispatches routine ones to the `sdd-implementer` (the step-down
tier) on a task bundle assembled with shell, telling it not to read
plan.md, spec.md, or tasks.md in full; for T803 it re-runs the
verification command itself and has the `skeptical-reviewer` review
the task from a staged, shell-assembled bundle — one review and at
most one re-review, anything still open logged and left to the sweep;
otherwise the implementer's verbatim output is the verification and
the reviewer checks the phase as a whole at its default tier; the
sweep runs at the reviewer's default tier on the documents plus
`git diff main...HEAD`; a fresh orchestrator session starts each
phase; the person is paused for after each phase and whenever
something unexpected bears on spec adherence. Geometry is measured by
the orchestrator with `javascript_tool` and the plan's probe against an
emulated viewport (the in-app Browser pane's screenshots are blank when
scrolled; numbers, not pictures); T801 is the orchestrator's own and is
not dispatched.

Task ids: 010 = T8xx.

<!-- Once implementation starts this file has more than one writer.
Never edit it from a stale copy; prefer small targeted edits over
regenerating it; after any edit, grep the T8xx sequence and the phase
headers to confirm nothing was duplicated or dropped. -->

---

## Phase 0 — Foundation: the baseline, the row, the mechanism and the sampler (reviewer after the phase, T803 on its own; the gate at its end)

- [x] **T801** — The baseline, before any code changes (the
      orchestrator, not dispatched). The plan's probe on the nine pages
      at 1440×900, 1080×1920, and 375×812 — the fog piece, the
      `fog-frames` gallery, `/places/the-headlands/`, `/pieces/`,
      `/galleries/`, `/places/`, `/categories/landscape/`, `/about/`,
      `/contact/` — on the dev server, fonts loaded, `scrollY` 0. Then
      `npm run build` and `dist/{pieces,about,contact,places}/index.html`,
      `dist/galleries/index.html`, `dist/categories/landscape/index.html`
      copied to `${TMPDIR:-/tmp}/photo-pieces-verify/baseline-010/`.
      _Verify: the 27 probe results recorded here as numbers (pattern:
      the T703 record in `specs/009-places/tasks.md`); the fog's at
      1440×900 checked against the spec's (header bottom 74, head
      74–560, first paragraph ≈ 638) and any disagreement recorded, not
      reconciled; the head's content height, which is
      `head.bottom - head.top - pad - pad - 1`, written down as the
      number that replaces the plan's ≈ 327 in the candidates'
      predictions; the six baseline
      files' `sha256sum` recorded with the folder's path._

**T801 record** (the baseline, before any code change; the plan's probe
on the dev server, fonts loaded, `scrollY` 0; px as reported, rounded
to two decimals). `pad`/`gap` are the computed values;
`head` is `[top, bottom]`; `→head` is `head.top − headerBottom`;
`head→` is `nextFirst − head.bottom`.

_1440×900_ (`headerBottom` 73.78 on all nine)

| page                     | head           | pad           | gap    | nextFirst | →head | head→ | row             | lead   | prose top / 4th |
| ------------------------ | -------------- | ------------- | ------ | --------- | ----- | ----- | --------------- | ------ | --------------- |
| piece (fog)              | 73.78 – 559.94 | 78.375/78.375 | 78.375 | 638.31    | 0     | 78.38 | —               | 414.09 | 638.31 / 750.31 |
| gallery `fog-frames`     | 73.78 – 540.64 | 78.375/78.375 | 78.375 | 619.02    | 0     | 78.38 | —               | 394.80 | — / —           |
| place `the-headlands`    | 73.78 – 502.75 | 78.375/78.375 | 78.375 | 581.13    | 0     | 78.38 | —               | 356.91 | 581.13 / 693.13 |
| `/pieces/`               | 73.78 – 407.50 | 78.375/78.375 | 78.375 | 486.88    | 0     | 79.38 | 281.13 – 297.13 | —      | — / —           |
| `/galleries/`            | 73.78 – 365.11 | 78.375/78.375 | 48     | 419.22    | 0     | 54.11 | —               | —      | — / —           |
| `/places/`               | 73.78 – 365.11 | 78.375/78.375 | 78.375 | 443.48    | 0     | 78.38 | —               | —      | — / —           |
| `/categories/landscape/` | 73.78 – 365.11 | 78.375/78.375 | 48     | 419.22    | 0     | 54.11 | —               | —      | — / —           |
| `/about/`                | 73.78 – 429.39 | 78.375/78.375 | 78.375 | 507.77    | 0     | 78.38 | —               | 319.02 | — / —           |
| `/contact/`              | 73.78 – 365.11 | 78.375/78.375 | 78.375 | 443.48    | 0     | 78.38 | —               | —      | — / —           |

_1080×1920_ (`headerBottom` 73.78 on all nine; `pad` 58.575/58.575 on all nine)

| page                     | head           | gap    | nextFirst | head→ | row             | lead   | prose top / 4th |
| ------------------------ | -------------- | ------ | --------- | ----- | --------------- | ------ | --------------- |
| piece (fog)              | 73.78 – 486.06 | 58.575 | 544.63    | 58.56 | —               | 362.91 | 544.63 / 656.63 |
| gallery `fog-frames`     | 73.78 – 471.77 | 58.575 | 530.33    | 58.56 | —               | 348.61 | — / —           |
| place `the-headlands`    | 73.78 – 439.22 | 58.575 | 497.78    | 58.56 | —               | 316.06 | 497.78 / 609.78 |
| `/pieces/`               | 73.78 – 357.53 | 58.575 | 417.09    | 59.56 | 250.97 – 266.97 | —      | — / —           |
| `/galleries/`            | 73.78 – 315.14 | 42.6   | 363.84    | 48.70 | —               | —      | — / —           |
| `/places/`               | 73.78 – 315.14 | 58.575 | 373.70    | 58.56 | —               | —      | — / —           |
| `/categories/landscape/` | 73.78 – 315.14 | 42.6   | 363.84    | 48.70 | —               | —      | — / —           |
| `/about/`                | 73.78 – 374.08 | 58.575 | 432.64    | 58.56 | —               | 283.52 | — / —           |
| `/contact/`              | 73.78 – 315.14 | 58.575 | 373.70    | 58.56 | —               | —      | — / —           |

_375×812_ (`headerBottom` 119.375 on all nine; `pad` 56/56 on all nine)

| page                     | head            | gap | nextFirst | head→ | row             | lead   | prose top / 4th |
| ------------------------ | --------------- | --- | --------- | ----- | --------------- | ------ | --------------- |
| piece (fog)              | 119.38 – 533.13 | 56  | 589.13    | 56.00 | —               | 412.53 | 589.13 / 701.13 |
| gallery `fog-frames`     | 119.38 – 565.67 | 56  | 621.67    | 56.00 | —               | 445.08 | — / —           |
| place `the-headlands`    | 119.38 – 533.13 | 56  | 589.13    | 56.00 | —               | 412.53 | 589.13 / 701.13 |
| `/pieces/`               | 119.38 – 386.34 | 56  | 443.34    | 57.00 | 282.34 – 298.34 | —      | — / —           |
| `/galleries/`            | 119.38 – 343.95 | 32  | 382.06    | 38.11 | —               | —      | — / —           |
| `/places/`               | 119.38 – 343.95 | 56  | 399.95    | 56.00 | —               | —      | — / —           |
| `/categories/landscape/` | 119.38 – 343.95 | 32  | 382.06    | 38.11 | —               | —      | — / —           |
| `/about/`                | 119.38 – 467.98 | 56  | 523.98    | 56.00 | —               | 379.98 | — / —           |
| `/contact/`              | 119.38 – 343.95 | 56  | 399.95    | 56.00 | —               | —      | — / —           |

Against the spec's numbers at 1440×900 on the fog piece: header bottom
73.78 (spec 74), head 73.78 – 559.94 (spec 74 – 560), first paragraph
638.31 (spec ≈ 638). No disagreement to record.

**The head's content height** (fog, 1440×900):
`559.9375 − 73.78125 − 78.375 − 78.375 − 1 = 328.41`, so **328**
replaces the plan's ≈ 327 in the candidates' predictions. With it the
predicted first-paragraph tops are
`73.78 + 2·pad + 328.41 + gap`: `a` (48/48) ≈ **546.6**, `b` (32/32)
≈ **498.6** (the plan's ≈ 545 and ≈ 497, +1.6).

Two notes, recorded not reconciled: on `/galleries/` and
`/categories/landscape/` the head's next sibling is not a `.section`
(its `gap` is 48 / 42.6 / 32, not the section clamp) — those two pages'
`gap` and `head→` numbers are that sibling's own padding, and T804
compares them to these, not to the clamp. On `/pieces/` `head→` is 1px
greater than on the other pages with the same `gap` (79.38 vs 78.38 at
1440, 59.56 vs 58.56 at 1080, 57.00 vs 56.00 at 375); the measured
value, not the clamp, is what T804 matches.

**The built-HTML baseline**: `npm run build` green
(`[prune-originals] 34 emitted originals … pruned 34`,
`[check-no-gps] 637 images scanned in dist/ — no GPS metadata.`), six
files copied to
`${TMPDIR:-/tmp}/photo-pieces-verify/baseline-010/`
(resolved: `/var/folders/lg/gnmg3pvx3wb_gx4012x5jxd40000gn/T/photo-pieces-verify/baseline-010`),
`sha256`:

```
28d77b0af3798825eec83d8271665c5ed8e72e996ed65502681cd4439c3af35d  about.index.html
83e6a3fbe42ab9b9d9eaefdde80de7c8198a3dead5e1f495d5250cc56626ea46  categories-landscape.index.html
3a40a01d39ef4f57fab17c94149a426919d5fff40a671f21ac453fd08177b407  contact.index.html
6bfcea0e8219a9e1ced5f6a2aec58419f9d3bc2ac08238c397bdf0138982f153  galleries.index.html
72b702b8e7fa47e2973b063ed86ebce7a7472a6394cf58d27981db4441f3c358  pieces.index.html
8cc80821c16318f3b4dbb80c322b95734c2529493175520c37f87dc5684e082a  places.index.html
```

- [x] **T802** — The row and the headings. `categories.ts`:
      `categoryRow(current?: Category): { label: string; href: string | null }[]`
      per the plan (All → `/pieces/` first only when `current` is given;
      the current item `href: null`; `CATEGORIES` order; `categoryLabel`
      labels). `categories.test.mjs` (new; `image-set.test.mjs` is the
      pattern) with the plan's cases. `src/components/CategoryRow.astro`
      (`CoverCards.astro` is the pattern for props; **no `<style>`**):
      the pieces index's category-row `<nav>` — its `class` and its
      `aria-label` — moved verbatim, `withBase` on
      each href, a null href rendered `<span aria-current="page">`, the
      `' · '` separators as today. `pieces/index.astro` renders
      `<CategoryRow />` in place of the inline nav; `galleries/index.astro`
      renders `<CategoryRow />` after its `<h1>`; `categories/[category].astro`
      renders `<CategoryRow current={category} />` after its `<h1>` and
      wraps its two `h2.eyebrow` texts in links to `/galleries/` and
      `/pieces/` (the galleries index's `h2.eyebrow > a` is the pattern).
      `global.css`: `.category-row [aria-current='page']` beside `.meta`,
      the plan's declarations. _Verify: vitest — the new group green and
      each test mutation-checked (All always; All never; the current
      left as a link; the order reversed), the test named that each
      mutation fails; build, check green; `dist/pieces/index.html`
      identical to the baseline after normalizing the hashed CSS link
      and collapsing whitespace runs between tags (the raw diff recorded
      if not clean, and whitespace-only); on
      `dist/categories/landscape/index.html` the nav inside `.page-head`
      after the `<h1>` with `<a href="/pieces/">All</a>` first,
      `<span aria-current="page">Landscape</span>`, three links, and the
      two `h2.eyebrow` links to `/galleries/` and `/pieces/`; on
      `dist/galleries/index.html` the nav after the `<h1>` with four
      links, no `All`, no `aria-current` — all grepped on the build and
      recorded verbatim._

**T802 record** (dispatched to the `sdd-implementer`; its verbatim
output is the verification). `sh scripts/verify.sh`:

```
## build (full log: …/photo-pieces-verify/build.log)
12:43:01 [build] 77 page(s) built in 1.25s
  Indexed 16 pages
[prune-originals] 34 emitted originals in dist/_astro/: pruned 34 unreferenced, kept 0 referenced.
[check-no-gps] 637 images scanned in dist/ — no GPS metadata.
BUILD EXIT 0
## astro check
- 0 errors - 0 warnings - 0 hints CHECK EXIT 0
## vitest (full log: …/photo-pieces-verify/test.log)
 Test Files  9 passed (9)
      Tests  255 passed (255)
TEST EXIT 0
```

252 → 255: the three new tests in `categories.test.mjs`.

_`dist/pieces/index.html` against the baseline_: **byte-identical**
once the hashed CSS link is normalized — the whitespace-collapse step
was not needed (`RAW IDENTICAL`), so there is no diff to record. The
no-`<style>` rule held.

_`dist/categories/landscape/index.html`_, the head and the two
headings:

```
<section class="page-head section" data-astro-cid-bt5tsl34><p class="eyebrow" data-astro-cid-bt5tsl34>Category</p><h1 data-astro-cid-bt5tsl34>Landscape</h1><nav class="meta category-row" aria-label="Browse by category"><a href="/pieces/">All</a> · <span aria-current="page">Landscape</span> · <a href="/categories/street/">Street</a> · <a href="/categories/portrait/">Portrait</a> · <a href="/categories/event/">Event</a></nav></section>
<h2 id="category-galleries" class="eyebrow" data-astro-cid-bt5tsl34><a href="/galleries/" data-astro-cid-bt5tsl34>Galleries</a></h2>
<h2 id="category-pieces" class="eyebrow" data-astro-cid-bt5tsl34><a href="/pieces/" data-astro-cid-bt5tsl34>Pieces</a></h2>
```

_`dist/galleries/index.html`_:

```
<section class="page-head section" data-astro-cid-u7zljvsj><p class="eyebrow" data-astro-cid-u7zljvsj>Index</p><h1 data-astro-cid-u7zljvsj>Galleries</h1><nav class="meta category-row" aria-label="Browse by category"><a href="/categories/landscape/">Landscape</a> · <a href="/categories/street/">Street</a> · <a href="/categories/portrait/">Portrait</a> · <a href="/categories/event/">Event</a></nav></section>
```

Four links, no `All`, no `aria-current` inside the row. (Noted for
later greps: the site nav emits its own `aria-current="page"` on every
page, so a bare `grep -c aria-current` on a built page is never 0.)

_The mutation checks_ — each mutation made, vitest run, mutation
reverted; the restored file re-runs 3 passed:

| mutation                                                                                    | tests that failed                                                                                                                                                          |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **All always**: `...(current ? [{label:'All',href:'/pieces/'}] : []),` → the item unguarded | "without a current category the row is the four categories, each a link, and no All"; "the labels are categoryLabel's and the order is CATEGORIES'" (2 failed \| 1 passed) |
| **All never**: the spread deleted                                                           | "with a current category All leads to the pieces index and the current item is not a link" (1 failed \| 2 passed)                                                          |
| **the current left as a link**: `href: category === current ? null : …` → always the href   | "with a current category All leads to the pieces index and the current item is not a link" (1 failed \| 2 passed)                                                          |
| **the order reversed**: `CATEGORIES.map(` → `[...CATEGORIES].reverse().map(`                | all three (3 failed)                                                                                                                                                       |

_Deviation, mechanical_: `pieces/index.astro` also lost its now-unused
`CATEGORIES`, `categoryLabel`, and `withBase` imports — the inline nav
was their only user and `astro check` fails on unused imports here. The
task named the nav, not the imports; the built page is unchanged.

- [ ] **T803** (`review: per-task`) — The mechanism, inert, and the
      sampler. `global.css`: `--head-pad-reading` and
      `--head-gap-reading` in `:root` at `.section`'s clamp with the
      plan's comment; `.reading-head { padding-block }` and
      `.reading-head + .section { padding-block-start }` straight after
      the `.page-head` rules — no edit to `.section` or `.page-head`.
      `pieces/[slug].astro`, `galleries/[slug].astro`,
      `places/[slug].astro`: `reading-head` added to the header's class
      list. `src/pages/dev/page-head/[...candidate].astro` per the plan
      (`getStaticPaths` `[]` unless `import.meta.env.DEV`; `CANDIDATES`
      `current` / `a` 3rem,3rem / `b` 2rem,2rem; the stacked index and
      the three full pages; the head copied from the piece page — with
      the piece page's scoped `.piece-column` rule copied into the
      fixture's own `<style>` and wrapping the head's content and the
      body, or the fixture lays out left-aligned — inside a wrapper
      carrying the candidate's tokens inline (the wrapper holds the
      header and the following `.section` as siblings, or the `+` rule
      misses the gap); the banner with its live numbers). `scripts/check-no-dev-routes.mjs`
      (`check-no-gps.mjs` is the pattern), appended to `postbuild`;
      `scripts/verify.sh`'s summary grep gains `\[check-no-dev-routes\]`.
      _Verify (implementer): `sh scripts/verify.sh` green with
      `[check-no-dev-routes] no dev routes in dist/.` in its output;
      `test ! -e dist/dev && echo absent`; a recursive `grep` for
      `page-head sampler` under `dist` empty;
      `grep -c "/dev/" dist/sitemap-0.xml` → 0; no build-log
      line naming `dev/page-head`; the temporary run with the `DEV`
      guard removed — the build fails at the barrier with the first
      message naming `dist/dev/page-head/…` — its output recorded and
      the guard restored. Verify (orchestrator, re-running
      `sh scripts/verify.sh` first): the three reading pages measure
      equal to T801 at the three viewports; `/dev/page-head/current/`
      equal to the fog piece's page at 1440×900, and its head's
      `.piece-column` equal in `left` and `width` to the piece page's
      (the copied rule landed); `/a/` and `/b/` measure
      `pad` 48/48 and 32/32, `gap` 48 and 32, their first-paragraph
      tops recorded against the plan's predictions (≈ 545, ≈ 497, with
      T801's content height), each visibly apart and every one with
      `prose.fourth ≤ 900`; the banner's numbers equal the probe's;
      `/dev/page-head/` shows three labelled heads stacked, one
      paragraph under each. Numbers recorded here._

**The gate record** (written by the orchestrator at the Phase 0 pause,
before Phase 1 starts): the candidate the photographer named — `a`,
`b`, a mix, or a fourth value, as two token values — and whether the
portrait monitor takes it too or stays as it is; the `innerHeight` his
laptop browser reported in the sampler's banner, which is the fold T804
measures against (900 if it goes unrecorded); any remark on the row.
If he names a mix or a fourth value rather than `a` or `b`, say in the
Phase 0 report that T804 checks it against that fold rather than
against the emulated 900 the sampler previewed it under — a miss
there is the criterion doing its job, not a T804 bug (the sign-off
reviewer's note).

## Phase 1 — The values and the docs (reviewer after the phase; the person's pause at its end)

- [ ] **T804** — The chosen values. `global.css`: the two tokens
      overridden inside `@media (orientation: landscape) and (min-width: 720px)`
      — or `(min-width: 720px)` if the gate chose the portrait monitor
      too — at the gate record's values, with a comment naming the
      gate's date and the candidate; the sampler's `CANDIDATES` untouched
      (`current` now shows the shipped value). _Verify: build, check,
      tests green; the orchestrator's probe — the three reading pages at
      1440×900 with `pad` and `gap` at the chosen values, the fog's
      `prose.top` equal to T803's number for that candidate (±2px),
      `lead` and `prose.fourth` within the gate record's fold (his
      browser's `innerHeight`; 900 if it went unrecorded); at 1080×1920
      and 375×812 equal
      to T801 (or, if the gate took portrait, 1080 equal to T803's
      sampler number and 375 equal to T801); the six other pages at the
      three viewports equal to T801 in `pad`, `gap`,
      `headerBottom → head.top`, `head.bottom → nextFirst` — on
      `/galleries/` and `/categories/landscape/` `head.bottom` greater
      by the row's height plus the `h1`'s `margin-bottom` (the row's
      own bottom margin collapses into the accent rule's `margin-top`,
      where the `h1`'s collapses today) — the number recorded rather
      than asserted from the prediction — on the other four `head`
      equal; `dist/{pieces,about,contact,places}/index.html`
      identical to the baseline after normalizing the CSS link (and
      whitespace for `/pieces/`). Every number recorded here._
- [ ] **T805** — Docs: `README.md`'s galleries-and-categories sentences
      (the paragraph that begins "`/galleries/` groups galleries by
      category") say that the galleries index carries the category row
      under its title and that a category page's head carries it with
      "All" back to `/pieces/` and the current category marked, its
      "Galleries" and "Pieces" headings linking to their indexes; the
      reading pages' description mentions that the piece, gallery, and
      place heads share one tightened head (the two tokens, landscape
      only unless the gate said otherwise); the structure listing gains
      `CategoryRow.astro` and `pages/dev/` as dev-only fixtures that the
      build refuses to emit. _Verify: every claim read against the built
      pages and the gate record by the orchestrator; Prettier clean;
      build green._

## Phase 2 — Close-out (reviewer sweep, then merge)

- [ ] **T806** — `ROADMAP.md`: "A way back from a category" and "The
      header's proportion on a laptop" struck, with the follow-ups the
      plan names (the title, the lead's measure, and the body column to
      the reading typography pass, which the sampler now serves; a
      landscape phone or tablet unmeasured; the row on the front door
      if that workshop comes). `DECISIONS.md`: a spec 010 section
      ("All" to the pieces index and the section headings as each
      kind's way back; one row component with the current marked the
      nav's way; a class and two tokens scoped to landscape ≥ 720px,
      with the portrait monitor's outcome; the sampler kept as a
      dev-only route behind a barrier, and why a barrier rather than
      trust in the `DEV` guard — an empty `getStaticPaths` has regressed
      before, in Astro 5.1.2 (withastro/astro#12891, fixed in #12906);
      the spec's criterion as a floor and the first-paragraph top as the
      number). Both ride this spec
      branch and merge with the PR, as 009's did, so the sweep's diff
      against `main` contains them. Then the pre-merge whole-spec sweep
      at the reviewer's default tier and its findings resolved; the
      spec's acceptance criteria checked against their records (the
      sampler's absence from `dist/` by T803's and the final build's
      barrier line); build, tests, check, GPS scan, dev-routes scan, and
      format green with actual output; the PR marked ready and merged
      with a merge commit. _Verify: main green after the merge._

---

## Tier log (the fourth spec under the model policy)

<!-- Token usage from each subagent return — implementer runs and
reviewer invocations alike — any escape-hatch miss, and the third tier
if it is ever on (it is off). Compare against spec 009's totals:
implementer 275,282 over five dispatches; reviewer 599,867 all tiers
(403,955 at the default tier over ten invocations, 195,912 at the top
tier over four sign-off passes). -->

| Task / invocation                                 | Tier                | Tokens                 | Outcome / miss reason                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                   | top tier            | 139,477                | drafted first pass                                                                                                                                                                                                                                                                                                                                                                                        |
| T801 baseline (orchestrator, not dispatched)      | step-down (session) | — (orchestrator turns) | 27 probe results + built-HTML baseline recorded; no code change                                                                                                                                                                                                                                                                                                                                           |
| T802 the row and the headings (`sdd-implementer`) | step-down           | 36,777                 | done first pass; one mechanical deviation (unused imports dropped)                                                                                                                                                                                                                                                                                                                                        |
| plan/tasks sign-off ×2 (planner-drafted)          | top tier            | 102,587 + 24,650       | fix and re-review ×1 (B1: the sampler copied the piece head's markup but not the piece page's scoped `.piece-column` rule, so the gate would have judged a left-aligned head that the vertical-only probe could not tell from the real one), then signed off. Packet note for T803: the sampler declares that rule in its own `<style>` and its Verify compares `left` and `width` against the piece page |

<!-- Totals, written at the merge: implementer over its dispatches;
reviewer at its default tier over its invocations; top tier; all
tiers, against 009's; what held and what to carry to the next spec. -->

## Handoff note

**Nothing is implemented.** The next session begins at T801 (Phase 0):
the baseline is the orchestrator's own measurement and build, taken
before any code changes; T802 and T803 are dispatched; T803's
verification is re-run by the orchestrator and reviewed on its own;
the Phase 0 pause is the visual gate, and Phase 1 does not start until
the gate record above is written.

> Read `CLAUDE.md` and `specs/010-page-head/{spec,plan,tasks}.md`, then
> begin at the first unchecked task as the orchestrator under the model
> policy: triage; take T801 yourself with the plan's probe; dispatch
> each routine task to the `sdd-implementer` on a task bundle assembled
> with shell (the task line, the plan sections, the acceptance
> criteria, the files, the pattern file, the signatures, any recorded
> finding), telling it not to read plan.md, spec.md, or tasks.md in
> full; verify with `sh scripts/verify.sh` only — re-run by you for
> T803, taken from the implementer's verbatim output otherwise; run the
> geometry checks with the probe and record numbers; stage, then bundle
> the diff for the `skeptical-reviewer` (T803 on its own; each phase as
> a whole), one review and at most one re-review per invocation, the
> rest logged; commit, check the box, log the tier and tokens.
> Involvement level is product owner: pause after each phase — the
> Phase 0 pause is the gate, and its report carries the sampler's three
> URLs and their numbers — and whenever something unexpected bears on
> spec adherence, and start a fresh session for the next phase.

Every pause produces a report in this shape, in this order:

1. **Why this pause** — a phase boundary, a spec-adherence question, or
   an escalation trigger. One line.
2. **What you can now do** — behavior that exists and can be tried,
   stated as a user would experience it, so attestation is possible.
3. **Where execution deviated from the spec, and why** — every place,
   per the "never silently" principle, not just the interesting ones.
4. **What needs your decision** — product questions only.
