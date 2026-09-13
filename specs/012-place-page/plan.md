# Plan: The place page — one wall

**Status**: Draft — pending sign-off
**Implements**: spec.md in this directory

## Shape of the change

One template loses its structure and gains the galleries' knobs; one
spacing token is added and chosen at a gate; a dev-only sampler exists
for that gate. No schema, no registry, no image-page change.

- **The wall replaces the outings** (`src/pages/places/[slug].astro`).
  Today the page maps `place.outings` to one `<section class="section
  outing">` each — an `<h2>` link to the piece, its date, and a
  `.gallery-flow` at a local `placeFlowStyle`
  (`--gallery-short: clamp(200px, 26vw, 280px)`, stretch 1.35, no
  `gallery-wide`, no `--gallery-width`/`--gallery-gap`) with
  `galleryCell(image.image, 280)` — spec 011's deliberate revert. This
  spec deletes that: the outings loop, the local style, `PLACE_SHORT_PX`,
  the `formatDate` import, and the four `.outing*` scoped rules. In their
  place, one list rendered from the registry's **existing** flat frame
  list, exactly as `galleries/[slug].astro` renders a gallery:

  ```astro
  const cells = place.frames.map((id) => {
    const image = registry.byId.get(id)!;
    return { image, ...galleryCell(image.image) };
  });
  ---
  {hasWriting && (
    <div class="section place-writing"><div class="prose"><Content /></div></div>
  )}
  <div class="section place-wall" data-pagefind-ignore>
    <ul class="gallery-flow gallery-wide" style={galleryFlowStyle}>
      {cells.map(({ image, ar, width, sizes }) => ( <li style={`--ar: ${ar}`}> …the gallery page's cell… </li> ))}
    </ul>
  </div>
  ```

  `place.frames` (`SitePlace.frames` in `src/lib/images.ts`) is already
  "the outings' frames concatenated — the set the arrows step through":
  outings oldest first, each piece's own-folder frames in the piece's
  order, pinned by `image-meta.test.mjs`'s `groupByPlace` cases. Rendering
  from it means the wall's order **is** the image page's arrow order by
  construction — no second ordering rule, and the non-goal "the image
  page is unchanged" holds without touching it. The head (`.page-head
  .section .reading-head`, the eyebrow, title, lead, `place.summary`) and
  the writing (`.prose` in its `.section`) keep their markup; the OG
  image stays the cover; `data-pagefind-ignore` moves from each outing to
  the wall, so search still indexes the head and writing and never the
  frames.

- **The galleries' knobs, consumed, not copied.** The wall takes
  `galleryFlowStyle` (the bleed width, one-baseline gap, and
  `clamp(280px, 33vmin, 460px)` density from `src/lib/gallery-layout.ts`)
  and `galleryCell(image)` with its default short (460, the srcset
  ceiling), plus the `gallery-wide` breakout class — the same three
  things the gallery page uses. `gallery-layout.ts` is **not edited**
  except for its header comment, which names the place wall among what
  the knobs drive again (011's revert struck it). The place page carries
  no `--gallery-*` literal after this spec; `place-page.test.mjs` pins
  that (T1002). If the gate moves the width or density it moves the
  constants in `gallery-layout.ts` for galleries and places together —
  the spec's "cannot split the source"; the plan expects the gate to
  confirm, since 011 chose these on the same photographs.

- **The writing-to-wall transition — one token** (`src/styles/global.css`,
  beside the reading-head rules). Today the distance from the last line
  of prose to the first frame is two `.section` paddings plus a heading,
  a date, and a baseline — nothing the gate can name as one number. The
  mechanism makes it one number:

  ```css
  :root { --place-wall-gap: clamp(3.5rem, 5.5vw, 5.5rem); } /* inert default = .section's padding; the gate's value lands at T1002 */

  /* The place page's wall (spec 012). The writing's section drops its
     bottom padding and the wall's section carries the whole transition,
     so the space from prose to first row is --place-wall-gap alone. */
  .place-writing { padding-block-end: 0; }
  .place-writing .prose > :last-child { margin-bottom: 0; } /* p carries --para-gap; the idiom .piece-held-prose uses */
  .section.place-wall { padding-block-start: var(--place-wall-gap); }
  ```

  Without the middle rule the rendered distance would be the token plus
  a paragraph's `--para-gap`, and the number the photographer names would
  not be the number that renders. `.section.place-wall` is (0,2,0), the same specificity as spec 010's
  `.reading-head + .section` and later in source, so on a place with no
  writing (head, then wall) the wall's gap applies after the head too —
  AC3's literal reading. The sampler shows that case (`bare-*`
  candidates); if the photographer wants the head case to keep spec 010's
  head gap instead, T1002 adds `.reading-head + .section.place-wall {
  padding-block-start: var(--head-gap-reading); }` after it and the CSS
  test pins whichever was chosen. The token is one value at every width
  (a `rem`/`clamp` candidate reads on the phone too); a phone-specific
  value is not a candidate unless the gate asks. Landing the two rules at
  T1000 with no template using the classes is inert by construction —
  the shipped place page is unchanged until T1002 — and lets the sampler
  exercise the shipped mechanism, spec 010's and 011's pattern.

- **The sampler** (`src/pages/dev/place-wall/[...candidate].astro`, dev
  only; `src/pages/dev/galleries/[...candidate].astro` is the pattern,
  copied with its three lessons: the candidate table declared **inside**
  `getStaticPaths` and passed as a prop; the REAL-photograph predicate
  `img.piece === null && !!img.label?.camera && !/^Fixture/i.test(img.label.camera)`
  with the whole-root fallback below six; every candidate custom property
  set inline **on the element whose rule reads it**). `getStaticPaths()`
  returns `[]` unless `import.meta.env.DEV`; the standing barrier
  `scripts/check-no-dev-routes.mjs` scans all of `dist/dev/` and needs no
  change. Each candidate renders one `<article>` in the place page's
  exact markup and classes — `header.page-head.section.reading-head`
  (eyebrow "Place", the fixture place's title, lead, and summary line),
  `div.section.place-writing > .prose` with the fixture place's rendered
  body (`the-headlands`, the fixture place with the longer writing;
  `render(entry)` as the page does), then `div.section.place-wall` with
  `--place-wall-gap` inline on that div and the wall of the real
  photographs — so the rendered distance and packing are what T1002
  ships. Paths: `/dev/place-wall/` (every candidate stacked, each under a
  `.sampler-label`) and `/dev/place-wall/<id>/` (one candidate full-page
  with the banner linking the others).

  The candidates (starting points; the gate may name a fourth spacing):

  | id             | packing                                                               | `--place-wall-gap`             | writing |
  | -------------- | --------------------------------------------------------------------- | ------------------------------ | ------- |
  | `current`      | today's: `.gallery-flow` (no `gallery-wide`), `clamp(200px, 26vw, 280px)`, stretch 1.35, `galleryCell(image, 280)` | `clamp(3.5rem, 5.5vw, 5.5rem)` | yes |
  | `wall-tight`   | the galleries': `gallery-wide` + `galleryFlowStyle` + `galleryCell(image)` | `1.5rem` (one baseline)     | yes     |
  | `wall-head`    | the galleries'                                                        | `3rem` (spec 010's head gap)   | yes     |
  | `wall-section` | the galleries'                                                        | `clamp(3.5rem, 5.5vw, 5.5rem)` (one `.section` padding) | yes |
  | `bare-tight` / `bare-head` / `bare-section` | the galleries'                           | as above                       | no      |

  `current` is the spec's "today's content-width packing" beside the
  wall; its values are retyped in the sampler because T1002 retires them
  from the template. The `wall-*` rows consume `galleryFlowStyle` and
  `galleryCell` from the source, not retyped, so they cannot drift from
  what ships. The summary line on the sampler's head is the fixture
  place's real one (its outing/frame counts, not the ten real exports'),
  labelled as such.

## Failure messages and notes

No new build barrier. The two that exist cover this spec:

```
[check-no-dev-routes] no dev routes in dist/.
[check-no-gps] <n> images scanned in dist/ — no GPS metadata.
```

The template can fail `astro build` only through the registry's existing
place validation (`[places] …` lines), which is untouched.

## Testing strategy

Every claim above is owned by a task and a check:

- **The template carries none of its own packing values** (AC 2) —
  `place-page.test.mjs` (new, root; `page-head.test.mjs` is the pattern
  for reading a source file and parsing `global.css`), owned by
  **T1002**: (a) `src/pages/places/[slug].astro` imports and uses
  `galleryFlowStyle`, carries `gallery-wide`, contains no `--gallery-`
  literal, no `placeFlowStyle`/`PLACE_SHORT_PX`, and every `galleryCell(`
  call has one argument (regex over the source); (b) it renders from
  `place.frames`, never `place.outings`, and has exactly one
  `class="gallery-flow` occurrence and no `outing`. Mutation-checked:
  restore `galleryCell(image.image, 280)` → (a) fails; restore a
  per-outing map → (b) fails.

- **The transition is one gate value in CSS** (AC 3) — the same file,
  **T1002**, with `page-head.test.mjs`'s `blocks`/`declarations`
  helpers copied (they are file-local there; the copy is ~30 lines and
  keeps that test untouched): a `:root` declares `--place-wall-gap` at
  the gate's literal; `.place-writing` sets `padding-block-end: 0`;
  `.place-writing .prose > :last-child` sets `margin-bottom: 0`; a rule
  selecting `.section.place-wall` sets `padding-block-start:
  var(--place-wall-gap)`; and the head-case rule is present or absent per
  the gate. Mutation-checked: retune the literal → fails; delete the
  `.place-writing` rule → fails; delete the `:last-child` rule → fails. Spec 010's reason applies verbatim: a
  gate value that lives only in CSS would otherwise fail nothing.

- **The wall's order is the arrow order** (AC 1, AC 4) — **T1002**,
  on the built HTML: the sequence of `/images/…` hrefs in
  `dist/places/the-headlands/index.html` and `…/the-jetty/index.html`
  is such that, for each consecutive pair, the first image's page holds
  `<nav class="frame-nav" data-set="place:<slug>">` whose `data-nav="next"`
  link is the second href, and the last has none — checked with a shell
  loop, the pairs counted and recorded. This is the claim "rendering
  from `place.frames` makes the wall the arrows' set" made falsifiable;
  the registry's own ordering is already pinned in `image-meta.test.mjs`
  (`outings follow the piece order given, oldest first`; `within an
  outing the piece's own order is kept`).

- **Nothing names a piece between head and footer** (AC 1) — **T1002**,
  built HTML: between `</header>` and `<footer` the place page holds no
  `href="…/pieces/`, no `<h2`, no `<time`, no `outing`, no `<hr`; exactly
  one `<ul class="gallery-flow gallery-wide"` with the emitted
  `galleryFlowStyle` string; `data-pagefind-ignore` on the wall's
  section; `og:image` still the cover's asset.

- **The mechanism is inert before the gate** — **T1000**: with the two
  rules landed and no template using the classes, `grep -c
  "place-wall\|place-writing" src/pages/**/*.astro` → 0 outside
  `src/pages/dev/`, and the built `dist/places/the-headlands/index.html`
  is byte-identical to the one built before the task (a hash, since the
  template does not change at T1000). `page-head.test.mjs` stays green
  with the added `:root` declaration.

- **The sampler is dev-only and its candidates differ** — **T1001**:
  the barrier line green, `dist/dev` absent, sitemap `/dev/` count 0; the
  negative control (guard removed → build fails naming
  `dist/dev/place-wall/…`, guard restored); on the dev server the
  `wall-*` flows measure wider than `current`'s (the bleed against the
  content width — if they measure equal, lesson 1 was missed) and the
  three spacings measure three distinct prose-to-first-row distances at
  1512×982 (≈24 / 48 / ≈83px); the real-image count recorded.

- **Geometry after the gate** (AC 2, AC 3) — **T1002**, on the dev
  server at a 16:10 laptop shape (1512×982), a DualUp shape (1280×1440),
  and 375×812: the place wall's `.gallery-flow` width equals the gallery
  page's at the same viewport (bleed: 1433 / 1201 per 011's record);
  measured `gap` 24px; a landscape cell's short side ≈ 324 / 417; the
  `.prose` still 666 wide; the prose-to-first-row distance equals the
  gate's value (and head-to-first-row on a temporarily writing-less
  fixture, body blanked on the dev server and restored); at 375 one
  frame per row at 343; `documentElement.scrollWidth ≤ clientWidth`
  everywhere. The implementer measures and records numbers; where it
  cannot drive a browser it says so, and the Phase 1 pause asks the
  person to attest those lines on his two screens (the constitution:
  the orchestrator never does browser checks by hand).

- **Untouched by construction** (AC 4, AC 5, the non-goals) — **T1002**
  and the sweep: `git diff main -- src/lib/images.ts src/lib/image-set.ts
  src/lib/image-meta.mjs src/pages/images/[...id].astro
  src/pages/places/index.astro src/components/CoverCards.astro
  src/content.config.ts` is empty; `image-set.test.mjs`,
  `galleries.test.mjs`, `gallery-layout.test.mjs`, `gps-barrier.test.mjs`
  green and unedited.

- Existing suites stay green (265 tests + the new file); build with both
  barriers; `astro check`; Prettier on the docs.

## File structure

```
src/styles/global.css                          --place-wall-gap in :root; .place-writing (+ its :last-child) / .section.place-wall (T1000, inert); the gate's value (T1002)
src/pages/dev/place-wall/[...candidate].astro  the sampler (dev only, new; T1001)
src/pages/places/[slug].astro                  the wall: one flow from place.frames at the galleries' knobs; outings, placeFlowStyle, PLACE_SHORT_PX, .outing* styles removed (T1002)
src/lib/gallery-layout.ts                      header comment only: the place wall named among what the knobs drive (T1002)
place-page.test.mjs                            template consumes the knobs, carries none; the gap token and rules in CSS (new; T1002)
AUTHORING.md, README.md                        the place page as one wall (T1003)
ROADMAP.md, DECISIONS.md                       close-out (T1004)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`src/lib/images.ts` (`SitePlace.frames`/`outings`, the sets and
neighbours), `src/lib/image-meta.mjs` (`groupByPlace`, `placeSummary`),
`src/lib/image-set.ts`, `src/pages/images/[...id].astro`,
`src/pages/places/index.astro`, `src/components/CoverCards.astro`,
`src/content.config.ts`, the constants and functions of
`src/lib/gallery-layout.ts`, the `.gallery-flow` rules, the `gallery-wide`
breakout and the `<720px` collapse in `global.css`, the two fixture
places and their pieces, `scripts/check-no-dev-routes.mjs`, the Obsidian
plugin.

## Known limitations

- **The summary line still says "N outings".** The head counts visits
  the wall no longer shows as groups — the spec keeps it deliberately
  (Goal 2). The sampler's head shows the fixture place's summary, not a
  count of the ten real exports.
- **No fixture has no writing.** The head-then-wall case is judged in the
  sampler (`bare-*`) and measured at T1002 by blanking a fixture body on
  the dev server and restoring it, not by a committed fixture — the spec
  asks for no new fixtures.
- **The pieceless frames stay out** (a non-goal), so the fixture wall on
  `the-headlands` is the fixture pieces' frames, not the real exports;
  the real photographs are judged in the sampler only.
- **The dev server caches `getStaticPaths`**: editing the sampler's
  candidate table needs a restart.
- **`.section.place-wall` outranks `.reading-head + .section` by source
  order, not specificity** — they are both (0,2,0). Moving the reading-head
  rules below the wall rules would silently flip the head case; the CSS
  test pins the rules' presence and value, not their order, so the
  head-case measurement at T1002 is the check on that.

## Resolved decisions

- **Render from `place.frames`, not a re-flattened `place.outings`**: the
  registry already exposes the list the arrows step through; using it
  makes "the wall's order is the arrows' order" true by construction and
  leaves the registry untouched.
- **Consume `galleryFlowStyle`, `galleryCell(image)`, and `gallery-wide`
  as the gallery page does**, and edit nothing in `gallery-layout.ts` but
  its comment: the spec's single-source rule, and the gate confirms
  rather than re-chooses (011 chose these on the same photographs).
- **The transition is one token on the wall's section, with the writing's
  bottom padding zeroed**, rather than a margin on the flow or a value the
  gate would have to add to a hidden `.section` padding: the number the
  photographer names is the number that renders.
- **The head case takes the same token by default** (AC 3's literal
  reading), with the head-gap override as the one-line alternative if the
  gate says so; the `bare-*` candidates put that in front of him.
- **The mechanism lands inert at T1000, the template at T1002**, so the
  sampler exercises the shipped rules and the shipped place page does not
  change before the gate — the pattern 010 and 011 followed.
- **A source-reading test for the template** (as `page-head.test.mjs`
  reads `global.css`) rather than a `dist/`-dependent one: `sh
  scripts/verify.sh tests` must stay runnable without a build, and the
  built-HTML checks belong to T1002's Verify.
- **The sampler is a new route, not a mode on `/dev/galleries/`**: the
  galleries sampler is gate history for 011 and shows no head or writing;
  this one needs the place page's exact markup.
