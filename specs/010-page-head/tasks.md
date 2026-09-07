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

- [x] **T803** (`review: per-task`) — The mechanism, inert, and the
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

**T803 record** (dispatched to the `sdd-implementer`; `review: per-task`,
so the verification below is the orchestrator's own re-run and the
`skeptical-reviewer` reviewed the task on its own).

`sh scripts/verify.sh` (orchestrator, after the reviewer's two banner
fixes):

```
## build (full log: …/photo-pieces-verify/build.log)
13:03:24 [build] 77 page(s) built in 2.22s
  Indexed 16 pages
[prune-originals] 34 emitted originals in dist/_astro/: pruned 34 unreferenced, kept 0 referenced.
[check-no-gps] 637 images scanned in dist/ — no GPS metadata.
[check-no-dev-routes] no dev routes in dist/.
BUILD EXIT 0
## astro check
- 0 errors - 0 warnings - 0 hints CHECK EXIT 0
## vitest (full log: …/photo-pieces-verify/test.log)
 Test Files  9 passed (9)
      Tests  255 passed (255)
TEST EXIT 0
```

_The absence checks_ (implementer, verbatim): `test ! -e dist/dev` →
`absent`; `grep -r "page-head sampler" dist` → no match (exit 1);
`grep -c "/dev/" dist/sitemap-0.xml` → `0`; no build-log line naming
`dev/page-head`.

_The barrier's negative control_ — the `DEV` guard deleted, `npm run build`:

```
[check-no-gps] 637 images scanned in dist/ — no GPS metadata.
[check-no-dev-routes] dist/dev/ exists — a dev-only route was built: dist/dev/page-head/a/index.html, dist/dev/page-head/b/index.html, dist/dev/page-head/current/index.html, dist/dev/page-head/index.html
BUILD PIPE EXIT 1
```

Guard restored, the polluted `dist/` removed, the verify run above is
post-restore.

_The three reading pages, measured now against T801_ — every number
equal, at all three viewports, so the mechanism is inert:

| viewport  | page    | head            | pad           | gap    | prose.top / nextFirst | vs T801 |
| --------- | ------- | --------------- | ------------- | ------ | --------------------- | ------- |
| 1440×900  | piece   | 73.78 – 559.94  | 78.375/78.375 | 78.375 | 638.31                | equal   |
| 1440×900  | gallery | 73.78 – 540.64  | 78.375/78.375 | 78.375 | 619.02                | equal   |
| 1440×900  | place   | 73.78 – 502.75  | 78.375/78.375 | 78.375 | 581.13                | equal   |
| 1080×1920 | piece   | 73.78 – 486.06  | 58.575/58.575 | 58.575 | 544.63                | equal   |
| 1080×1920 | gallery | 73.78 – 471.77  | 58.575/58.575 | 58.575 | 530.33                | equal   |
| 1080×1920 | place   | 73.78 – 439.22  | 58.575/58.575 | 58.575 | 497.78                | equal   |
| 375×812   | piece   | 119.38 – 533.13 | 56/56         | 56     | 589.13                | equal   |
| 375×812   | gallery | 119.38 – 565.67 | 56/56         | 56     | 621.67                | equal   |
| 375×812   | place   | 119.38 – 533.13 | 56/56         | 56     | 589.13                | equal   |

_The sampler at 1440×900_:

| page                      | pad    | gap    | prose.top | 4th line | lead bottom | `.piece-column` left / width |
| ------------------------- | ------ | ------ | --------- | -------- | ----------- | ---------------------------- |
| `/dev/page-head/current/` | 78.375 | 78.375 | 638.31    | 750.31   | 414.09      | 379.578 / 665.844            |
| the fog piece's own page  | 78.375 | 78.375 | 638.31    | 750.31   | 414.09      | 379.578 / 665.844            |
| `/dev/page-head/a/`       | 48/48  | 48     | 547.19    | 659.19   | 383.72      | 379.578 / 665.844            |
| `/dev/page-head/b/`       | 32/32  | 32     | 499.19    | 611.19   | 367.72      | 379.578 / 665.844            |

`current` equals the piece page **vertically and horizontally** — the
copied `.piece-column` rule landed, which is what the sign-off's B1
finding asked for. Against the plan's predictions with T801's measured
content height (328): `a` ≈ 546.6 predicted / **547.19** actual, `b`
≈ 498.6 / **499.19** — +0.6 each. The three first-paragraph tops are
638 / 547 / 499, visibly apart, and every candidate's fourth line
(750 / 659 / 611) clears 900.

_The banners' live numbers equal the probe's_ on all three:
`current — pad 78px / gap 78px … innerHeight 900, prose p top 638,
fourth line 750 (lh 28), lead bottom 414, lead + 4 lines: yes`;
`a — pad 3rem / gap 3rem … 547 / 659 / 384 / yes`;
`b — pad 2rem / gap 2rem … 499 / 611 / 368 / yes`.

_`/dev/page-head/`_ (stacked): three heads, `pad` 78.375 / 48 / 32,
each followed by a sibling `.section` holding exactly one paragraph,
all three `.piece-column` at `left` 379.578; labels
"current — the tokens as they are", "a — pad 3rem / gap 3rem",
"b — pad 2rem / gap 2rem".

_Deviation, forced_: `CANDIDATES` is declared inside `getStaticPaths()`
and handed to the component as a prop rather than as a module-level
const. Astro runs `getStaticPaths` in an isolated scope where nothing
from the frontmatter but its imports is visible; the guard-removed
negative control is what caught it (`CANDIDATES is not defined`). One
definition, one file; the plan's intent holds.

_The review_ (`skeptical-reviewer`, default tier, one invocation, no
re-review needed): **no blocking findings, signed off.** Seven
second-look notes. Two were fixed before the gate because they bear on
the gate itself, and were dispatched to the implementer rather than
done by hand: the banner's verdict line mixed document and viewport
coordinates (correct at `scrollY` 0, where every recorded number was
read, but wrong after a scroll-then-resize on the photographer's own
screen), and `current`'s banner printed "the tokens as they are" where
`a` and `b` print their values — it now prints `pad 78px / gap 78px`,
resolved at runtime, so the three screens compare at a glance. The
numbers above were re-measured after both fixes.

The five notes left open, for the pre-merge sweep:

1. **Inertness cannot be told from a miss by measurement alone** while
   the tokens equal `.section`'s clamp — the gallery's and the place's
   sibling rule is currently evidenced by reading the markup, not by
   instrumentation. T804 settles it: with the tokens tightened, measure
   `padding-block-start` on the gallery page and the place page, and on
   a place with no writing if one exists (the only path where the gap
   lands on `.outing`).
2. **Three copies of `.section`'s clamp** kept in step by hand
   (`global.css` `:root` ×2 and `.section`); the file comment is the
   only guard. T806 names the coupling in `DECISIONS.md`.
3. **`check-no-dev-routes.mjs` has no test** — its failure path rests
   on the one-time negative control above. This matches the existing
   precedent exactly (`check-no-gps.mjs`, `prune-unreferenced-originals.mjs`
   and `gen-placeholders.mjs` have none either, and `vitest.config.ts`
   picks up nothing under `scripts/`), so it is not a constitution
   contradiction; T806 records the decision either way.
4. **The head's twenty lines are duplicated twice inside the sampler**
   (the stacked view and the full page) — the plan sanctioned copying
   from the piece page, not the internal repeat.
5. **The `<time>` element's whitespace** differs from the piece page's
   (collapses away; the geometry matched exactly), so "copied" is
   near-verbatim rather than verbatim.

### Phase 0 review and the superseding baseline for the two pages the row changed

The `skeptical-reviewer` reviewed Phase 0 as a whole (T803 having been
reviewed on its own) and raised **one blocking finding, B1**: T802 adds
the row to `/galleries/` and to every category page, which changes those
two pages' head height — and both the T801 baseline and the spec's third
acceptance criterion ("the pieces, galleries, and places indexes, the
category pages, About, and Contact measure the same as before") still
read as though nothing there had moved. T804 is specified to compare
against T801's rows, and for those two pages T801's `head`, `nextFirst`
and `head→` are pre-row numbers that will not reproduce.

The plan already anticipated the geometry (T804's verify says
`head.bottom` on those two pages is "greater by the row's height plus
the `h1`'s `margin-bottom`", recorded rather than asserted) — the
reviewer's bundle did not carry T804's text — but the anticipation was
not a measurement, and the baseline T804 compares against was still the
pre-row one. **Measured now, post-T802, and superseding T801's rows for
these two pages only:**

| viewport  | page                     | head            | pad           | gap  | nextFirst | row             | vs T801 head.bottom |
| --------- | ------------------------ | --------------- | ------------- | ---- | --------- | --------------- | ------------------- |
| 1440×900  | `/galleries/`            | 73.78 – 407.50  | 78.375/78.375 | 48   | 461.61    | 281.13 – 297.13 | 365.11 → **+42.39** |
| 1440×900  | `/categories/landscape/` | 73.78 – 407.50  | 78.375/78.375 | 48   | 461.61    | 281.13 – 297.13 | 365.11 → **+42.39** |
| 1080×1920 | `/galleries/`            | 73.78 – 357.53  | 58.575/58.575 | 42.6 | 406.23    | 250.97 – 266.97 | 315.14 → **+42.39** |
| 1080×1920 | `/categories/landscape/` | 73.78 – 357.53  | 58.575/58.575 | 42.6 | 406.23    | 250.97 – 266.97 | 315.14 → **+42.39** |
| 375×812   | `/galleries/`            | 119.38 – 386.34 | 56/56         | 32   | 424.45    | 282.34 – 298.34 | 343.95 → **+42.39** |
| 375×812   | `/categories/landscape/` | 119.38 – 386.34 | 56/56         | 32   | 424.45    | 282.34 – 298.34 | 343.95 → **+42.39** |

The growth is **42.39** at every viewport — the row's height (16) plus
the `h1`'s `margin-bottom`, which `getComputedStyle` prints as `26.4px`
and which resolves to 26.39 (the 0.01 is the rounding in that string,
not a discrepancy in the measurement) — exactly the plan's prediction, and
it lands both pages on `/pieces/`'s own head bottom — 407.50 / 357.53 /
386.34 — which is what "the pieces index's row exactly" should produce.
**`pad` and `gap` are unchanged on both pages at all three viewports**:
the head's air, which is what this spec's second half touches, did not
move; only the row was added, which is what its first half requires.
T804 measures those two pages against **this** table, not T801's.

The other four baselined pages (`/pieces/`, `/about/`, `/contact/`,
`/places/`) are still byte-identical to their T801 files after the
hashed CSS link is normalized — re-confirmed here.

The two superseding files are saved beside the originals as
`galleries.index.post-T802.html` and
`categories-landscape.index.post-T802.html`, `sha256`:

```
3743b828e616dde0e408cfbbc08d1ba1d038c5cc87addda397dcf59cb93d6970  galleries.index.post-T802.html
f537c1dd6280ab504add7549dea05b041fb0d5ebede4f6980a783e681a88f221  categories-landscape.index.post-T802.html
```

These two hashes are **provenance, not a comparison target**: they pin
which build the geometry above came from. Phase 1 tightens the head-air
tokens and the CSS bundle's hash moves, so these bytes will change by
design — unlike the four unchanged pages' hashes, which are a real
byte-identity check T804 repeats. Only the geometry table transfers to
T804.

**The wording of the third acceptance criterion** is the product
owner's to settle, and goes to him at the Phase 0 pause: read
literally it contradicts the first criterion, which requires the row on
exactly these pages. The reading the work follows is that "measure the
same as before" is about the head's air — `pad` and `gap` — and not
about the row the spec deliberately adds; on that reading both criteria
hold, and the numbers above are the evidence.

**One non-blocking finding fixed rather than logged** (S1, dispatched to
the implementer, not done by hand): the marking rule wrote
`text-decoration: underline 1px`, and thickness inside the
`text-decoration` shorthand is CSS Level 4 (Chrome 87+, Safari 26.2+) —
where it is unsupported the whole declaration is dropped at parse time,
so the current category would lose the accent underline entirely and
`text-decoration-color` would have nothing to color. It is now
`text-decoration-line: underline` + `text-decoration-thickness: 1px`,
with a comment. **A deviation from the plan**, which quotes the
shorthand verbatim; it preserves the plan's stated intent (text colour
and an accent underline) and degrades to a plain accent underline
instead of to nothing. `dist/pieces/index.html` is still identical to
the baseline after normalizing the CSS link (both sides
`c8d6c79c493ec6a997ffcfdd00a013e0f392ec5612c1af3fb95d711be212ebe7`);
verify green (`BUILD/CHECK/TEST EXIT 0`, 255 passed).

The four other notes go to the pre-merge sweep:

- **S2**: the third `categoryRow` test's name claims the labels are
  `categoryLabel`'s, but its assertion evaluates `categoryLabel` on both
  sides, so that half is self-referential and none of the four
  mutations touches the label mapping. The guarantee does exist in the
  suite (test 1 pins the four literal labels), so the constitution's
  "must be able to fail for the reason its name gives" is not breached
  by the suite as a whole; discharging the name costs one more mutation.
- **S3**: `CategoryRow.astro`'s rendering contract (`withBase` on each
  href, a null href as `<span aria-current="page">`, the `' · '`
  separators, and the no-`<style>` rule the byte-identity rests on) has
  no standing check — each was verified once by grep on the build.
- **S4**: the sampler applies its candidate values at every viewport
  while the shipped tokens are to be tightened for a landscape screen
  only; this is what makes the gate usable on the portrait monitor, but
  T804's record should name which viewport each accepted number was
  chosen at.
- **S5**: a category page now carries two `aria-current="page"`
  elements, the site nav's and the row's. Valid ARIA — the attribute is
  scoped per set of navigation links — noted so no later assertion
  assumes uniqueness.

<!-- The gate record's instructions, as drafted, are kept below the record itself. -->

**The gate record** (the visual gate, 2026-09-07; the photographer on
his laptop and his portrait monitor, from the sampler at
`/dev/page-head/`):

- **The candidate: `a`** — `--head-pad-reading: 3rem` and
  `--head-gap-reading: 3rem` (48px each), ~60% of today's air. Named
  without a mix and without a fourth value, so T804 writes the two
  token lines exactly as the sampler previewed them and its
  regression number is T803's measured **547.19** for `a` at 1440×900
  (±2px).
- **The portrait monitor takes it too** ("it looks good on the vertical
  monitor as well"). So T804's override is
  `@media (min-width: 720px)`, the plan's alternative — **not**
  `(orientation: landscape) and (min-width: 720px)`. The phone at
  375×812 is below the breakpoint and stays at today's value either
  way, as the spec requires. Consequence for T804's verification: at
  1080×1920 the three reading pages no longer measure equal to T801 —
  they take the tightened value, and the number to hold them to is the
  sampler's at that width, not T801's; only 375×812 measures equal to
  T801.
- **His laptop's fold: `innerHeight` 778** (not the emulated 900 the
  sampler previewed under). This is the number T804 measures the
  criterion against. `a` clears it with room: at 1440×900 the lead ends
  at **383.72** and the fourth line of prose at **659.19**, both inside
  778, so "the lead and at least the first four lines visible without
  scrolling" holds at his real fold and not merely at an emulated one.
  Since he named `a` rather than a mix or a fourth value, the
  sign-off reviewer's caveat does not apply — the value he chose is the
  value the sampler showed him.
- **The sampler's `a` at 1080×1920**, measured at the gate because the
  portrait monitor now takes the value and T804 needs a target there:
  `pad` 48/48, `gap` 48, head 73.78 – 464.94, `lead` 352.34,
  `prose.top` **512.94**, fourth line 624.94 (T801's 1080 numbers for
  the fog piece were 58.575/58.575, head 73.78 – 486.06, `prose.top`
  544.63). That is the number T804 holds the fog piece to at 1080,
  ±2px.
- **No remark on the row.**

**The third acceptance criterion's wording** — left to the orchestrator
by the product owner at this pause, so, decided here: criterion 3's
"the pieces, galleries, and places indexes, the category pages, About,
and Contact measure the same as before" means **the head's air** —
`pad` and `gap` — and not the row that criterion 1 deliberately adds to
two of those pages. Read any other way the two criteria contradict each
other outright. `spec.md` is not edited (it is the product owner's, and
approved); this record is the reading, and the evidence for it is
already in the section above: on `/galleries/` and
`/categories/landscape/` `pad` and `gap` are unchanged at all three
viewports, and the whole of the 42.39px growth is the row plus the
`h1`'s margin. T804 attests criterion 3 on that reading.

<details>
<summary>What the gate record was asked to capture (as drafted)</summary>

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

</details>

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

| Task / invocation                                    | Tier                | Tokens                 | Outcome / miss reason                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning: draft (`sdd-planner`)                      | top tier            | 139,477                | drafted first pass                                                                                                                                                                                                                                                                                                                                                                                        |
| T801 baseline (orchestrator, not dispatched)         | step-down (session) | — (orchestrator turns) | 27 probe results + built-HTML baseline recorded; no code change                                                                                                                                                                                                                                                                                                                                           |
| T802 the row and the headings (`sdd-implementer`)    | step-down           | 36,777                 | done first pass; one mechanical deviation (unused imports dropped)                                                                                                                                                                                                                                                                                                                                        |
| T803 the mechanism + the sampler (`sdd-implementer`) | step-down           | 71,663                 | done first pass; one forced deviation (getStaticPaths scope)                                                                                                                                                                                                                                                                                                                                              |
| T803 per-task review (`skeptical-reviewer`)          | step-down (default) | 66,152                 | no blocking findings, signed off; 7 second-look notes, 2 fixed, 5 to the sweep                                                                                                                                                                                                                                                                                                                            |
| T803 banner fixes, notes 4 and 7 (`sdd-implementer`) | step-down           | 36,498                 | dispatched rather than done by hand; both bear on the gate                                                                                                                                                                                                                                                                                                                                                |
| Phase 0 review (`skeptical-reviewer`)                | step-down (default) | 70,518                 | 1 blocking (B1, the superseding baseline), fixed; 5 second-look notes, 1 fixed, 4 to the sweep                                                                                                                                                                                                                                                                                                            |
| S1 marking-rule longhands (`sdd-implementer`)        | step-down           | 32,727                 | dispatched rather than done by hand; a recorded deviation from the plan's verbatim shorthand                                                                                                                                                                                                                                                                                                              |
| Phase 0 re-review (`skeptical-reviewer`)             | step-down (default) | 23,652                 | B1 discharged, S1 sound; signed off, two record corrections applied                                                                                                                                                                                                                                                                                                                                       |
| plan/tasks sign-off ×2 (planner-drafted)             | top tier            | 102,587 + 24,650       | fix and re-review ×1 (B1: the sampler copied the piece head's markup but not the piece page's scoped `.piece-column` rule, so the gate would have judged a left-aligned head that the vertical-only probe could not tell from the real one), then signed off. Packet note for T803: the sampler declares that rule in its own `<style>` and its Verify compares `left` and `width` against the piece page |

<!-- Totals, written at the merge: implementer over its dispatches;
reviewer at its default tier over its invocations; top tier; all
tiers, against 009's; what held and what to carry to the next spec. -->

## Handoff note

**Phase 0 is complete, reviewed, and pushed** (T801–T803, plus the
phase review's B1 fix and the S1 marking-rule fix). **The gate has
happened**: the record above names candidate `a` (3rem / 3rem), on the
portrait monitor as well as the laptop, with his fold at
`innerHeight` 778. The next session begins at **T804** (Phase 1).

Two things the gate changed for T804, both already in the record above:
the override is `@media (min-width: 720px)`, not the plan's
landscape-scoped default, so at 1080×1920 the three reading pages
**take** the tightened value rather than measuring equal to T801 — the
target there is the sampler's `prose.top` **512.94** — and only 375×812
measures equal to T801. At 1440×900 the fog's `prose.top` target is
**547.19** (±2), with `lead` 383.72 and the fourth line 659.19 inside
his 778 fold. The six other pages measure against T801, except
`/galleries/` and `/categories/landscape/`, which measure against the
post-T802 table in the Phase 0 review section.

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
