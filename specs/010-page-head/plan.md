# Plan: The page head

**Status**: Signed off (2026-09-07) — drafted by the `sdd-planner`,
signed off by the `skeptical-reviewer` at the top tier on the second
pass; pending the product owner's approval of the conformance summary
**Implements**: spec.md in this directory

## Shape of the change

Two independent changes to page templates and one stylesheet, no
content, no schema, no registry. The category row the pieces index
writes inline becomes one component that three pages render; the
head's vertical air on the three reading pages moves onto two tokens
that only those pages read, so every other page's cascade is untouched
by construction and its geometry is measured to prove it. The tokens'
values are chosen at the photographer's gate from a dev-only sampler
route, and no value is committed before he names one.

- **The row** (`src/components/CategoryRow.astro`, props
  `{ current?: Category }`): the pieces index's `<nav class="meta
category-row" aria-label="Browse by category">` moved verbatim,
  fed by a pure `categoryRow(current?)` in `src/lib/categories.ts`
  returning `{ label: string; href: string | null }[]` in `CATEGORIES`
  order — without `current`, the four categories each linking to
  `/categories/<category>/`; with it, `All` → `/pieces/` first, the
  current category with `href: null`, the others linking. The
  component applies `withBase` and renders an item with no href as
  `<span aria-current="page">Landscape</span>`, the separators `' · '`
  exactly as the pieces index writes them. The component carries **no
  `<style>` block**: Astro would otherwise stamp a per-file
  `data-astro-cid-*` on every element (the 009 cards lesson), and the
  pieces index's built HTML is to stay identical. The current item's
  marking lives in `global.css` beside `.meta`:
  `.category-row [aria-current='page'] { color: var(--color-text);
text-decoration: underline 1px; text-decoration-color:
var(--color-accent); text-underline-offset: 0.2em; }` — the site nav's
  way of marking the current item (text colour and an accent underline)
  as closely as a `span` can take it: the nav draws its underline with
  a gradient on the `a`, which cannot reach a non-link, so the row
  names the accent on the decoration instead, in the row's mono type.
  The pieces index renders
  `<CategoryRow />` (no "All", nothing marked); the category page
  `<CategoryRow current={category} />` and the galleries index
  `<CategoryRow />`, each after its `<h1>` inside `.page-head.section`,
  so the accent rule (`.page-head::after`) still closes the head under
  the row. "All" goes to `/pieces/`, the spec's decided destination. The
  constitution's no-per-block-components rule is about piece body
  blocks in `.md`; page templates are ordinary `.astro` and already
  share `PieceList`, `GalleryCards`, `CoverCards`.
- **The section headings as links** (`categories/[category].astro`):
  `<h2 id="category-galleries" class="eyebrow"><a href={withBase('/galleries/')}>Galleries</a></h2>`
  and the same for Pieces → `/pieces/` — the galleries index's group
  headings already have this exact shape (`h2.eyebrow > a`), so the
  eyebrow style and the link's hover underline need no new rule.
- **The head's air — the mechanism.** Today `.section` gives every
  section `padding-block: clamp(3.5rem, 5.5vw, 5.5rem)` (79.2px at
  1440, 59.4 at 1080, 56 at 375), so the head's padding above, its
  padding below, and the body's padding-top — the gap — are one
  value on every page. Two tokens in `:root`, declared at that same
  value, and two rules keyed on a class only the three reading pages
  carry:

  ```css
  :root {
    /* The reading pages' head (spec 010): the padding above and below
       the head, and the gap before the body. Declared at .section's
       value (keep the clamp in step with .section by hand), then
       tightened below for a landscape screen only — the gate's values. */
    --head-pad-reading: clamp(3.5rem, 5.5vw, 5.5rem);
    --head-gap-reading: clamp(3.5rem, 5.5vw, 5.5rem);
  }
  .reading-head {
    padding-block: var(--head-pad-reading);
  }
  .reading-head + .section {
    padding-block-start: var(--head-gap-reading);
  }
  ```

  `pieces/[slug]`, `galleries/[slug]`, and `places/[slug]` add
  `reading-head` to their `<header class="page-head section">`; on
  each the header's next sibling is a `.section` (the piece's and the
  gallery's body `div`, the place's writing `div` or its first
  `.outing`), so the sibling rule reaches the gap on all three.
  `.reading-head` is later in source than `.section` at equal
  specificity and wins; the sibling rule out-specifies `.section`.
  Placed straight after the `.page-head` rules. Nothing else in
  `global.css` moves: `.section` and `.page-head` keep their
  declarations, so a page without the class computes exactly what it
  computed before — the by-construction half of "provably unchanged";
  the measured half is T801 against T804. With the tokens at
  `.section`'s value the mechanism is inert (T803 measures the three
  reading pages equal to T801), which is what lets it land before the
  gate and be the thing the sampler exercises.

- **The values — where they apply.** After the gate the tokens are
  overridden inside
  `@media (orientation: landscape) and (min-width: 720px)` — the
  laptop, not the portrait monitor (1080×1920, "needs no change") and
  not the phone (375×812, "must not get tighter"); orientation is
  already the site's axis for the held block. If the gate chooses the
  tighter head on the portrait monitor too, the query becomes
  `(min-width: 720px)`; the phone stays at today's value either way.
  Values are plain `rem` lengths (the laptop is one width; a wider
  desktop has more height to spare), one per token, so a mix the gate
  asks for is two lines.
- **The candidates.** Two knobs, three sets, labelled by their values:

  | id        | `--head-pad-reading`          | `--head-gap-reading`          | first paragraph at 1440×900, predicted |
  | --------- | ----------------------------- | ----------------------------- | -------------------------------------- |
  | `current` | the tokens as they are (79px) | the tokens as they are (79px) | 638 (the spec's measurement)           |
  | `a`       | `3rem` (48px, ~60% of today)  | `3rem`                        | ≈ 545                                  |
  | `b`       | `2rem` (32px, ~40% of today)  | `2rem`                        | ≈ 497                                  |

  From the spec's numbers: the head's content between its paddings is
  560 − 74 − 2 × 79.2 − 1 ≈ 327px, so the first paragraph's top is
  `74 + 2·pad + 327 + gap` (T801 replaces 327 with the measured value
  and T803 records each candidate's actual top). The two sit either
  side of the midpoint so the gate compares distinct proportions, not
  neighbours. **The spec's criterion is a floor, not the
  discriminator**: the first paragraph is four lines (line-height 28px)
  ending near 750, inside an emulated 900, so "the lead and four lines
  visible" already holds today and holds for every candidate; what the
  candidates change, and what the gate judges, is where the reading
  starts. The plan therefore records each candidate's first-paragraph
  top as its number, and the chosen candidate's number becomes the
  regression value T804 measures against, with the four-lines floor
  checked beside it.

- **The sampler** (`src/pages/dev/page-head/[...candidate].astro`, a
  rest route): `getStaticPaths()` returns `[]` unless
  `import.meta.env.DEV`, so the dev server has it and `astro build`
  emits nothing. Its paths in dev: `/dev/page-head/` — the three heads
  stacked, each labelled with its id and values, each a
  `<header class="page-head section reading-head">` copied from the
  piece page followed by a `.section` holding the fog piece's first
  paragraph (`piece.body` up to the first blank line; it is plain
  prose), inside a wrapper carrying the candidate's tokens inline
  (`style="--head-pad-reading: 3rem; --head-gap-reading: 3rem"`; the
  `current` wrapper sets nothing, so it always shows the site's own
  tokens); and `/dev/page-head/<id>/` — the fog piece in full under
  one candidate (`render(piece)`'s `<Content />` after the same head),
  so the fold is real on each of the photographer's screens, with a
  fixed banner bottom-right in `.meta` type: the id, the two values,
  links to the other two and to the stacked view, and live numbers
  from a small inline script run at `document.fonts.ready` and on
  resize — `innerHeight`, the first `.prose p`'s top, the bottom of its
  fourth line (top + 4 × line-height), the lead's bottom, and "lead +
  4 lines: yes/no". The fog piece is `where-the-fog-lets-go` from
  `getPublishedPieces()`; `CANDIDATES` is a const in the file. The head
  markup is a copy of `pieces/[slug].astro`'s (the head is twenty
  lines and extracting it would move the page's scoped `.piece-column`
  rule; a fixture may copy) — and because that rule is scoped, the copy
  is not laid out by it. The sampler therefore declares its own
  `.piece-column` rule (the piece page's two declarations) in its own
  `<style>` — its elements carry its own cid, so scoped is right here —
  and wraps the head's content and the body in it exactly as the piece
  page does; without it the gate would see a left-aligned head that the
  vertical probe cannot tell from the real one, since the title is
  bounded at `12.5ch` and the lead at `68ch` and the heights would
  match. The full page carries no pause script: the
  fog's pause pins on the light ground by CSS and the held frame holds
  by CSS — the head is what the fixture is for. The sampler stays in
  the repo after the gate as a dev-only fixture: the reading typography
  pass (`ROADMAP.md`) owns the same measures and will want to look
  again; its candidates then are two values to edit.
- **The barrier** (`scripts/check-no-dev-routes.mjs`, in `postbuild`
  after `check-no-gps`): fails the build if `dist/dev/` exists. Ten
  lines, the GPS scan's shape, so "the sampler never ships" is a
  standing check rather than one task's grep. `scripts/verify.sh`'s
  summary grep gains `\[check-no-dev-routes\]` so the line shows.

## Failure messages and notes

The barrier's two lines, the GPS scan's shape:

```
[check-no-dev-routes] dist/dev/ exists — a dev-only route was built: <the paths under it>
[check-no-dev-routes] no dev routes in dist/.
```

Nothing else in this spec can fail a build with a message of its own.

## Testing strategy

- **The measurement probe** — the one snippet every geometry number in
  this spec comes from, run with `javascript_tool` against an emulated
  viewport at `scrollY` 0 (viewport and document coordinates coincide),
  after the page's fonts have loaded. Numbers are `px`, rounded to
  integers in the record:

  ```js
  (() => {
    const r = (el) => el.getBoundingClientRect();
    const head = document.querySelector('.page-head');
    const next = head.nextElementSibling;
    const cs = getComputedStyle(head),
      ns = getComputedStyle(next);
    const row = head.querySelector('.category-row');
    const lead = head.querySelector('.lead');
    const p = document.querySelector('.prose p');
    const lh = p && parseFloat(getComputedStyle(p).lineHeight);
    return JSON.stringify({
      viewport: [innerWidth, innerHeight],
      headerBottom: r(document.querySelector('.site-header')).bottom,
      head: [r(head).top, r(head).bottom],
      pad: [cs.paddingTop, cs.paddingBottom],
      row: row ? [r(row).top, r(row).bottom] : null,
      gap: ns.paddingTop,
      nextFirst: r(next.firstElementChild).top,
      lead: lead ? r(lead).bottom : null,
      prose: p ? { top: r(p).top, fourth: r(p).top + 4 * lh, lh } : null,
    });
  })();
  ```

  `pad`, `gap`, and the distances `headerBottom → head.top`,
  `head.bottom → nextFirst` are the "air" numbers; `head` and `row` are
  the extents. The nine pages: the fog piece, the `fog-frames` gallery,
  `/places/the-headlands/` (the reading three); `/pieces/`,
  `/galleries/`, `/places/`, `/categories/landscape/`, `/about/`,
  `/contact/` (the six that stay). The three viewports: 1440×900,
  1080×1920, 375×812.

- **T801, the baseline**: the probe on the nine pages at the three
  viewports before any code changes, recorded in `tasks.md`; the
  fog's numbers should reproduce the spec's (header bottom 74, head
  74–560, first paragraph ≈ 638 at 1440×900 — a disagreement is
  recorded, not reconciled, and the plan's ≈ 327 content height is
  replaced by the measured one). Also the built-HTML baseline: `npm
run build`, then `dist/{pieces,about,contact,places}/index.html`,
  `dist/galleries/index.html`, and `dist/categories/landscape/index.html`
  copied to `${TMPDIR:-/tmp}/photo-pieces-verify/baseline-010/` with
  their `sha256` recorded, for T802's and T804's comparisons (if the
  folder is gone by then, rebuild it from a worktree at
  `git merge-base main HEAD`).
- `categories.test.mjs` (new; `image-set.test.mjs` is the pattern for
  a `.ts` import), a `describe('the category row (T802, spec 010)')`:
  without a current category, four items in `CATEGORIES` order, every
  one an `href` to its category page, and no "All"; with `street`,
  five items, "All" first with `/pieces/`, `street`'s `href` null and
  its label `Street`, the other three linking; the labels are
  `categoryLabel`'s. Each mutation-checked: the rule broken (All
  always; All never; the current left as a link; the order reversed),
  the test named as failing.
- **T802's built output**: `dist/pieces/index.html` identical to the
  baseline after normalizing the hashed CSS link and collapsing runs of
  whitespace between tags (the component's indentation is Astro's, not
  the page's; the raw diff is recorded if it is not clean, and must be
  whitespace only). On `dist/categories/landscape/index.html`: the nav
  present inside `.page-head` after the `<h1>`, its first child
  `<a href="/pieces/">All</a>`, then `<span aria-current="page">Landscape</span>`,
  then three links; `<h2 id="category-galleries" class="eyebrow"><a href="/galleries/">Galleries</a></h2>`
  and the Pieces one to `/pieces/`. On `dist/galleries/index.html`: the
  nav present after the `<h1>` with four links and no `All`, no
  `aria-current`. Grepped on the build and recorded. The page's CSS
  gains one rule (`.category-row [aria-current='page']`) — the
  `global.css` diff is the record.
- **T803, the mechanism inert and the sampler**: build green with
  `[check-no-dev-routes] no dev routes in dist/.` in the output;
  `test ! -e dist/dev`; `grep -rl "page-head sampler" dist` empty;
  `grep -c "/dev/" dist/sitemap-0.xml` → 0; the build log has no line
  naming `dev/page-head`. A temporary run: `getStaticPaths` made to
  return the candidates in build (the `DEV` guard commented out) — the
  build fails at the barrier with the first message naming
  `dist/dev/page-head/…`, the guard restored after, output recorded.
  Then the orchestrator on the dev server: the three reading pages
  measure equal to T801 at the three viewports (the class is on, the
  tokens equal `.section`); `/dev/page-head/current/` measures equal
  to the fog piece's own page, vertically and horizontally — the head's
  `.piece-column` has the same `left` and `width` as the piece page's,
  which is what proves the copied rule landed; `/dev/page-head/a/` and `/b/` measure
  `pad` 48/48 and 32/32, `gap` 48 and 32, and their first-paragraph
  tops recorded against the predicted ≈ 545 and ≈ 497 — each candidate
  visibly apart from the others and every one with `prose.fourth ≤
900`; the banner's numbers equal the probe's; `/dev/page-head/`
  shows three labelled heads stacked with one paragraph under each.
- **The gate**: the photographer's, on his laptop and his portrait
  monitor, in the report at the Phase 0 pause. An emulated 900 is not
  his fold: on a real 1440×900 laptop the menu bar and the browser's
  chrome leave something nearer 750–800, which is why he saw the
  reading start below it. The sampler's banner reports `innerHeight`,
  so the gate record captures the number his browser actually gave and
  T804 measures against that, with 900 as the fallback if it goes
  unrecorded. His choice — `a`, `b`, a
  mix, or a fourth value — and whether the portrait monitor takes it
  too is recorded in `tasks.md` under T803 before Phase 1 starts. A
  fourth value is two token lines in the sampler and a second look;
  not a spec question unless he wants something the two knobs cannot
  express (a different title size, a different rule), which goes back
  to him as a spec change.
- **T804, the values**: the three reading pages at 1440×900 measure
  `pad` and `gap` at the chosen values, and the fog's `prose.top`
  equals the sampler's recorded number for that candidate (±2px, font
  metrics), `lead ≤ 900`, `prose.fourth ≤ 900`; at 1080×1920 and
  375×812 they measure equal to T801 (the query excludes portrait) —
  or, if the gate chose the portrait monitor too, 1080 equals the
  sampler's number and 375 still equals T801. The six other pages at
  the three viewports measure equal to T801 in `pad`, `gap`,
  `headerBottom → head.top`, and `head.bottom → nextFirst`; on
  `/galleries/` and `/categories/landscape/` `head.bottom` is greater
  by the row's height plus the margin between the `h1` and the row
  (the `h1`'s `margin-bottom`; the row's own bottom margin collapses
  into the accent rule's `margin-top`, where the `h1`'s collapses
  today) — the number recorded, not asserted from the prediction — on
  the other four `head` is equal. `dist/{pieces,about,contact,places}/index.html`
  identical to the baseline after normalizing the CSS link (and
  whitespace, for `/pieces/`). All recorded in `tasks.md` as numbers,
  not as "matches".
- Existing suites green (252 + 4); build with the barriers; `astro
check`; Prettier.

## File structure

```
src/lib/categories.ts                         categoryRow(current?)
categories.test.mjs                           its tests (new)
src/components/CategoryRow.astro              the row; no <style>
src/pages/pieces/index.astro                  <CategoryRow /> (output unchanged)
src/pages/categories/[category].astro         <CategoryRow current={category} />; the two headings as links
src/pages/galleries/index.astro               <CategoryRow />
src/styles/global.css                         .category-row [aria-current]; the two tokens; .reading-head rules; the landscape override (T804)
src/pages/pieces/[slug].astro                 class reading-head on the header
src/pages/galleries/[slug].astro              class reading-head
src/pages/places/[slug].astro                 class reading-head
src/pages/dev/page-head/[...candidate].astro  the sampler (dev only)
scripts/check-no-dev-routes.mjs               the barrier; package.json postbuild; scripts/verify.sh grep
README.md, ROADMAP.md, DECISIONS.md
```

## Known limitations

- **The criterion at 1440×900 is a floor today's head already meets**
  (four lines end near 750 of 900), so it cannot on its own tell the
  chosen head from the old one; the chosen candidate's measured
  first-paragraph top is the number that does, recorded at T803 and
  held at T804.
- **The token default duplicates `.section`'s clamp** rather than
  sharing a token, so `.section` itself is not edited; a future change
  to `.section`'s padding must change the default too (the comment
  says so).
- **A landscape phone or tablet** gets the tightened head with the
  laptop; neither is one of the photographer's screens and neither is
  measured at the gate.
- **The sampler copies the piece head's markup and its `.piece-column`
  rule**; a change to either must be copied by hand or the fixture
  shows an old head. It also carries no pause script.
- **The pieces index's byte-identity** rests on `CategoryRow.astro`
  having no `<style>`; a scoped rule added later stamps every element
  in the row with a `data-astro-cid-*` (harmless, but the comparison
  then needs the 009 normalization).
- **The dev server** calls `getStaticPaths` once and caches: editing
  `CANDIDATES` needs a restart, like any registry change.

## Resolved decisions

- **One row component, no scoped style, marking rule in `global.css`**:
  three pages render one thing, and the pieces index's built page is
  the same bytes as before.
- **The current category as `<span aria-current="page">`**, marked by
  text colour and a drawn underline — the nav's own marking — not
  bold (the row is mono at 0.76rem; bold mono reads as a different
  word).
- **A class plus two tokens, not a per-layout stylesheet or a change
  to `.section`**: the reading pages opt in; the others are untouched
  by construction and measured to prove it; the sampler overrides the
  same tokens inline, so what the gate sees is the shipped mechanism.
- **The override scoped to landscape ≥ 720px**: the spec exempts the
  portrait monitor and the phone, and orientation is the site's
  existing axis for a viewport-shaped rule (the held block).
- **Candidates at ~60% and ~40% of today**, both knobs equal within a
  candidate: distinct proportions to look at; a mix is the gate's to
  name.
- **The sampler as a rest route with a `DEV`-gated `getStaticPaths`**,
  kept after the gate, with a post-build barrier: the exclusion is one
  `if`, the proof is on every build, and the fixture is there for the
  typography pass.
- **The first-paragraph top as the regression number**, beside the
  spec's four-lines floor: the floor is met by every candidate; the
  number is what the gate actually chose.
