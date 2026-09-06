# Plan: Places

**Status**: Draft (2026-09-06) — drafted against the codebase; pending
the skeptical-reviewer's sign-off at the top tier
**Implements**: spec.md in this directory

## Shape of the change

A fourth content collection, `places`, beside pieces, galleries, and
sidecars; two optional frontmatter lines, `at:` on a sidecar and
`at:` on a piece; and a derived structure in the image registry —
the place's outings — that two new pages and the image page read. The
registry already knows, for every published piece, the frames it
places in the piece's order (`framesByPiece`, ids since spec 008) and
which piece is each frame's home (the id's folder). A place is a
filter over that: the frames of each piece's own folder whose
resolved place is the slug, grouped by piece, pieces oldest first.
Nothing about ids, URLs, galleries, or the pieces' own pages changes.

- **The place file** (`src/content/places/<slug>.md`): `title`,
  optional `description`, optional `cover` (an image id, as a gallery's
  cover is), `draft` defaulting to false, and the body — the writing.
  The collection's id is the file name verbatim (`generateId`, as the
  sidecar collection does), and the registry refuses an id that is not
  a slug (`[a-z0-9-]+`, the rule piece folders already obey): the file
  name is the URL segment and the value every `at:` line
  must match, so nothing may sit between the two. The name `none` is
  refused too: it is the word for "no place", and a place so named
  could never be reached by an `at:` line. Both refusals are one pure
  `placeNameProblem(name)` in `image-meta.mjs`, tested in T701 and
  called by the registry, so neither needs a build to prove it.
- **A frame's place** (`placeOf(at, pieceDefault)`, pure, in
  `image-meta.mjs`): the sidecar's `at` if it is a slug; `null` if it
  is `none`; else the piece's `at`; else `null`. Blank strings count
  as unset, and a piece whose `at` is `none` has no default — Obsidian
  will offer `none` on a piece, since the property is shared, and it
  means there what it means on a sidecar (re-review: second look). This is the spec's "a frame's own line always wins" in one
  function, and the only place the precedence is written.
- **The slug rule**: every `at:` on every piece, draft or not, and
  every `at:` other than `none` on every sidecar, must name a declared
  place, draft or not. A typo in a draft is still a typo, and the
  sidecar orphan rule already checks drafts' sidecars. Unknown slugs
  fail the build all at once, each message listing the declared places.
- **Outings** (`groupByPlace`, pure): for each published piece, its
  own-folder frames — `framesByPiece.get(slug)` filtered to ids whose
  home is the piece, which keeps the piece's order (body order, then
  the folder's unreferenced files sorted, exactly as the piece's set
  steps) and drops every borrowed frame — bucketed by their resolved
  place. A place's outings are the pieces with at least one frame at
  it, oldest first (`byOldestPublished` in `pieces.ts`: `publishDate`
  ascending, ties by id — the mirror of `byNewestPublished`, beside
  it, so the two cannot disagree about ties). The place's frames are
  the outings' frames concatenated — the set the arrows step through.
- **A draft place** is declared for the slug rule but publishes
  nothing: its frames resolve to no place (the label shows the free
  text alone, no link to a page that does not exist), it has no page
  and no card, and the build prints a note. **An empty place** — no
  published frame — likewise: a note, nothing built.
- **A gallery-root sidecar's `at:`** is checked for its slug and then
  ignored with a warning naming the file: a place page groups by piece
  and a gallery-root frame has none (spec non-goal). It gets no link
  and no set, so nothing points at a page that might not exist.
- **The place's cover**: `cover` must be one of the place's frames,
  checked by the registry once the frames are known (the galleries'
  cover check is in the schema because a gallery's list is authored;
  a place's is derived). The check runs only on a place that
  publishes: a place declared ahead of its first outing, or a draft
  one, may name a cover from a piece not yet published and gets the
  note, not a failure, as the spec says (sign-off: second look). Default:
  the first frame of the most recent outing.
- **The registry** (`images.ts`) reads the `places` collection, runs
  the slug rule, resolves each published piece-folder frame's place,
  builds `SitePlace` objects before the images (they hold ids only, so
  the images can point at them without a cycle), and gives each image
  `place: SitePlace | null` and, when it has one, a set
  of kind `place` — its id the slug, its title and url the place's,
  count, prev, and next from the place's frames — after its piece sets — last, so the page's default set
  stays the gallery or the piece as today. `ImageRegistry.places` is
  the published places, most recent outing first, ties by title.
- **The set key** (`image-set.ts`): `SetKind` gains `'place'`, and
  `ImageSet.kind` in `images.ts` is typed as `SetKind` rather than a
  second hand-written union (sign-off: the two must gain the kind in
  step or `astro check` fails, so make them one fact);
  `setKeyFromPath` matches `/places/<slug>/` to `place:<slug>`. The
  layout's click handler and the image page's script need no change:
  they write and read whatever key the module derives.
- **The place page** (`src/pages/places/[slug].astro`): the gallery
  page's shape. Header: eyebrow "Place", the title, the description as
  the lead, an entry-meta line "N outings · M frames · 2019–2026"
  (`placeSummary`, pure — singulars, one year when first equals last);
  then the writing (`render(place.entry)`, in a `.prose` column, only
  when the body is not blank); then one section per outing — an `h2`
  that is a link to the piece, a `time` with the piece's date — with
  the outing's frames in a `.gallery-flow` list built with
  `galleryCell` and `galleryFlowStyle`, every cell a link to the
  frame's page. The article carries `data-pagefind-body`; the outings
  carry `data-pagefind-ignore` (the frames' titles are found on their
  own pages). OG image: the cover through `ogImageOptions`, as a
  gallery's.
- **The places index** (`src/pages/places/index.astro`): eyebrow
  "Index", "Places", cards in `registry.places` order. The card is the
  gallery card: `GalleryCards.astro`'s markup and styles move to a
  `CoverCards.astro` that takes `{ href, cover, title, meta }[]`, and
  `GalleryCards` becomes the wrapper that builds those from galleries —
  its two consumers (the galleries index, the category page) keep
  their props and their rendered output. Not byte for byte: Astro's
  scoped-style attribute (`data-astro-cid-<hash>`) is a hash of the
  component's path, so moving the markup and its `<style>` into a new
  file changes every card element's attribute, the compiled selectors,
  and the content-hashed CSS file name (sign-off: blocking). T703
  therefore compares the built HTML of `/galleries/` and
  `/categories/landscape/` after normalizing `data-astro-cid-[a-z0-9]+`
  and the `/_astro/*.<hash>.css` link to placeholders, and the page's
  CSS (linked or inlined) the same way — identical then, or the
  refactor changed something real, in the markup or in a rule. The
  place card's meta is the summary line.
- **The nav** (`consts.ts`): `{ href: '/places/', label: 'Places' }`
  after Galleries. Six items; T703 checks the header at the three
  viewports for wrapping.
- **The image page**: the label row `place` becomes, when the image
  has a place, a link to the place page with the sidecar's free text
  after it (`·` between, the meta lines' separator), and the free
  text alone otherwise; the `Row` type gains an optional `href`. A
  third neighbour wording, `neighbours.atPlace: 'At'`, beside `'In'`
  and `'From'`, so the line reads "At The jetty · 1 of 2". `indexed`
  counts a place as something to find, as it counts the free text.
- **Pieces are untouched**: no page reads a piece's `at` except
  through the registry. Obsidian's property autocomplete offers the
  used values for `at` — slugs, on pieces and sidecars alike — and the
  free-text `place` stays its own property with its own prose values.

## Failure messages and notes

Every message starts with `[places]` and names the file. Unknown slug,
one per problem, all in one throw:

```
[places] src/content/pieces/<slug>/index.md: no place named "<slug>" — the places are: <slugs, sorted>
[places] src/content/pieces/<slug>/index.md: no place named "<slug>" — none is declared yet: add src/content/places/<slug>.md
```

A place file whose name is not a slug, or is `none`; a cover that is
not a frame:

```
[places] src/content/places/<file>: a place's file name is its URL — lowercase letters, digits, and hyphens only
[places] src/content/places/none.md: "none" is the word for no place — a place needs another name
[places] src/content/places/<slug>.md: cover "<id>" is not one of this place's frames
```

The two notes (`console.warn`, as the registry's other notes are) and
the gallery-root warning:

```
[places] note: <slug> is a draft — no page, and its frames show no place
[places] note: <slug> has no published frame yet — no page until a photograph names it
[places] src/content/gallery-images/_<basename>.md: gallery-root photographs are not grouped under a place — the line is ignored
```

## Testing strategy

- `image-meta.test.mjs`, a `describe('places (T701, spec 009)')`:
  `placeOf` (own slug wins over a default; `none` under a default is
  null; no line takes the default; nothing is null; blanks are unset);
  `placeProblems` (unknown slug lists the places sorted; the no-places
  wording; a known slug and `none` are no problem; every problem
  returned at once); `groupByPlace` (a borrowed id is never counted
  under the borrower; a frame at another place lands under its own
  piece in the other place; outings in the order given; the piece's
  order kept within an outing; a place with no frame absent);
  `placeSummary` ("1 outing · 1 frame · 2026", "2 outings · 7 frames ·
  2019–2026"); `placeNameProblem` (a slug passes; `Sombrio Beach`,
  `sombrio.beach`, and `none` each get their message). Each mutation-checked: the rule broken, the test named
  as failing.
- `image-set.test.mjs` (new): `setKeyFromPath` maps `/places/x/` to
  `place:x`, keeps the two existing kinds, and returns null for
  `/images/…`; `setKey('place', 'x')`. The module is TypeScript;
  Vitest resolves it as it resolves the `.ts` imports Astro's pipeline
  makes.
- `byOldestPublished`: no unit test (`pieces.ts` imports
  `astro:content` types only, but the module is not loaded under
  Vitest by the existing convention); its order is verified on the
  fixtures — the jetty place's two outings, 2026-08-28 before
  2026-08-30.
- The registry is verified at build, as always, with the fixtures
  below and six temporary runs recorded in `tasks.md` with their
  actual output, each file restored after: a piece naming
  `the-headland` (the message lists `the-headlands, the-jetty`); a
  sidecar `at: nowhere`; an empty `src/content/places/empty.md` that
  also declares `cover: where-the-fog-lets-go/land-a` (the note, no
  `/places/empty/` in `dist/`, and no cover failure — the check skips
  a place that publishes nothing); a draft copy of the fog
  piece naming `the-headlands` (its frames absent from the place); a
  cover naming a frame the place does not hold (the message); and
  `the-jetty.md` marked `draft: true` (the draft note; no
  `/places/the-jetty/` in `dist/`; no card for it on `/places/`;
  land-c's `place` null and no `place:` set in its sets — the draft
  half of the spec's fourth criterion, which no other run covers).
- Fixtures: `src/content/places/the-headlands.md` (title, description,
  two paragraphs of fixture prose) and `the-jetty.md` (title, one
  paragraph, `cover: first-light-at-the-jetty/jetty-dawn`). The fog
  piece gains `at: the-headlands`; new sidecars `_pano.md` with
  `at: none` and `_land-c.md` with `at: the-jetty`; the existing
  `_land-b.md`'s free-text `place` shortens to "above the cove, north
  Pacific coast" so the label reads "The headlands · above the cove…".
  The jetty piece sets no default; a new `_jetty-dawn.md` says
  `at: the-jetty`. Then: `/places/the-headlands/` shows one outing
  (the fog piece, 2026-08-28) with six frames in the piece's order —
  land-a, land-b, port-b, port-a, port-45, square — and neither pano
  nor land-c; `/places/the-jetty/` shows two outings oldest first, the
  fog piece with land-c, then the jetty piece with jetty-dawn;
  `/places/` lists the jetty first ("2 outings · 2 frames · 2026"),
  the headlands second ("1 outing · 6 frames · 2026"); the sampler,
  which borrows fog's land-b and land-c, appears under no place; the
  gallery root is unaffected.
- The image page, in the browser: on land-b's page the label's place
  row is a link "The headlands" to `/places/the-headlands/` followed by
  the free text; arriving at land-c from `/places/the-jetty/` the
  visible neighbour line reads "At The jetty · 1 of 2" and its next
  arrow leads to jetty-dawn (the set key `place:the-jetty` written by
  the layout's click handler — `sessionStorage` read in the page);
  arriving at land-c from the fog piece the line is the piece's, as
  today.
- Geometry (Erik reviews on a 16:10 laptop and a portrait monitor):
  the place page and the index at 1440×900, 1080×1920, 375×812 — rows
  pack as the gallery's do, the outing headings clear the rows, the
  nav's six items do not wrap onto the brand at any of the three (or
  wrap cleanly if they do at 375, measured, not assumed).
- `/galleries/` and `/categories/landscape/` built output identical
  before and after the cards refactor once normalized: the HTML with
  `data-astro-cid-[a-z0-9]+` and the hashed CSS link replaced by
  placeholders, and the page's CSS — the linked `/_astro/*.css` files,
  or the inline `<style>` if Astro inlined them (it inlines small
  sheets by default; the run says which case it was) — with the same
  cid normalization, so a rule dropped in the move shows as well as a
  changed element.
- Existing suites green (230); build with the barriers; `astro check`;
  Prettier.

## File structure

```
src/content.config.ts               places collection; at: on pieces and on sidecars
src/content/places/                 the-headlands.md, the-jetty.md (fixtures)
src/lib/image-meta.mjs              placeOf, placeNameProblem, placeProblems, groupByPlace, placeSummary
src/lib/pieces.ts                   byOldestPublished
src/lib/image-set.ts                'place' kind; /places/ in setKeyFromPath
src/lib/images.ts                   SitePlace, registry.places, image.place, the place set
src/pages/places/[slug].astro       the place page
src/pages/places/index.astro        the index
src/components/CoverCards.astro     the card, generic; GalleryCards.astro wraps it
src/consts.ts                       Places in NAV_ITEMS
src/pages/images/[...id].astro      the label's place link; neighbours.atPlace
src/content/pieces/where-the-fog-lets-go/   at:, _pano.md, _land-c.md, _land-b.md
src/content/pieces/first-light-at-the-jetty/_jetty-dawn.md
image-meta.test.mjs, image-set.test.mjs
AUTHORING.md, README.md, DECISIONS.md, ROADMAP.md
```

## Known limitations

- **A place's writing is prose.** The body renders through the site's
  pipeline, so the block vocabulary parses, but no photograph lives
  beside a place file: a `./x.jpg` src fails as missing and the
  borrowed shapes are refused by the parser. Images in a place's
  writing are a follow-up (a `../pieces/<slug>/<file>` shape, say);
  the frames below the writing are the place's photographs.
- **Gallery-root photographs** cannot join a place (spec non-goal);
  the registry says so when a sidecar tries.
- **Renaming a place** is renaming its file, which breaks every `at:`
  naming it, on sidecars and pieces, until updated — the slug rule
  names each.
- **The dev server** caches the registry for the life of the process:
  a new place, a changed `at:`, or a changed default needs a restart,
  as any registry change does today.
- **The card's years** are the outings' publish years, not capture
  dates — the outing is dated by its piece everywhere else on the site.
- **A draft place's frames** carry no link and no set until the place
  publishes; the free text still shows.

## Resolved decisions

- **The precedence in one pure function** (`placeOf`), the grouping in
  another (`groupByPlace`): the registry composes them, tests cover
  them, and the rule the spec states is written once.
- **Own-folder frames only**, by filtering `framesByPiece` on the id's
  home rather than re-deriving an order: the piece's set and the
  place's outing agree by construction.
- **The slug rule runs on drafts too**, like the sidecar orphan rule.
- **The place set is last** in an image's sets: the default the page
  shows without a key stays what it is today.
- **`generateId` for places**, so the file name is the slug, the URL,
  and the value to type — one string, refused if it is not a slug.
- **The cover check in the registry**, not the schema: a place's
  frames are derived, and only the registry knows them.
- **One card component** rather than a copy: the galleries index and
  the category page keep their output, checked by a diff normalized
  for Astro's per-file scoped-style hash.
- **`at` on the piece too**, not `place:`: one property name for the
  slug wherever it is written, so Obsidian's autocomplete never mixes
  slugs with the sidecar's prose `place` (sign-off: second look; the
  spec's Decided section records it).
- **Oldest first by the mirror comparator** beside the site's newest
  first, not by reversing a sorted list (which would reverse the tie
  order too).
