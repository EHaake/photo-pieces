# Plan: Cross-piece image references

**Status**: Implemented (2026-09-05) — signed off by the
skeptical-reviewer at the top tier (2026-09-05, second pass), then
executed T601–T607 with the pre-merge sweep's findings resolved; T608
closes at the merge
**Implements**: spec.md in this directory

## Shape of the change

One rule loosened in three places that today agree by construction:
the transform (which refuses a `src` that leaves the folder), the pure
reference scanner in `image-meta.mjs` (which ignores such a `src`),
and the registry (which builds a piece's frames from its folder). Each
learns the same two path shapes, from one parser. The image page gains
a line; the pieces row becomes an anchor; the Obsidian plugin resolves
a relative path on purpose. Nothing in the content model changes: no
new frontmatter, no new collection, the same ids and URLs.

- **A reference's shape** (`parseReference(src)` in `image-meta.mjs`,
  pure, the single definition): `local` — `./<file>` or `<file>`;
  `piece` — `../<slug>/<file>` with `<slug>` a slug; `gallery` —
  `../../gallery-images/<file>`. Everything else is `invalid` with a
  message that names the two borrowed shapes; a sub-folder (`./a/b.jpg`),
  three levels up, `../gallery-images/<file>` (the wrong depth), and
  `../<slug>/sub/<file>` are all invalid. Remote and root-absolute
  `src`s are outside the rule as today (Astro's, not the registry's).
  The parser returns `{ kind, folder, file, basename, ext }` where
  `folder` is the id's folder: the piece's slug, or `gallery` for the
  gallery root, or `null` for local (the caller's own folder). **The
  long shape into the piece's own folder** (`../<own-slug>/<file>`) is
  refused by the transform, which knows its folder from the file's
  path: "this is the piece's own folder — write ./<file>" (sign-off:
  accepted, it would pass the build and give a wrong page — the alt and passage lookups read local references only, so the frame would keep its id and its place but lose the alt the piece wrote and its passage). `pieceFrames` dedupes by id as well, defensively. **A borrowed
  image must be a photograph this site pages**: a borrowed `src` whose
  extension is not one of the registry's accepted rasters is refused by
  the transform (T601's review: `../beta/land-a.tif` would otherwise
  mint the id `beta/land-a` — the registered `land-a.jpg`'s — pass the
  draft rule, and seat a frame that links to another file's page), and
  the pure helpers never mint an id for one; a local non-raster (an svg
  diagram) stays allowed and unlinked as today. And since the parser's
  slug rule accepts the name `gallery-images`, the piece branch excludes
  it explicitly so the wrong-depth shape stays invalid — a piece whose
  folder is literally `gallery-images` could never be borrowed from,
  which is fine.
- **The transform** replaces `rejectNestedSrc` with `parseReference`:
  invalid fails with the parser's message; `checkSrcExists` and
  `rejectPrivateSrc` run on every kind as today (the private check on
  the file part); `imagePageUrl` already derives the id from the
  resolved path — `resolve(folder, '../<slug>/x.jpg')` lands in
  `pieces/<slug>/`, `../../gallery-images/x.jpg` in `gallery-images/`,
  and `parseImagePath` names the gallery root's folder `gallery` — so
  the link goes to the home page with no new case. `sizes`, `--ar`,
  mats, the stage, the hold: untouched, because the image node is the
  same node.
- **The scanner** (`imageReferences` in `image-meta.mjs`) yields each
  reference with its parsed shape; `refersTo(src, basename)` keeps
  meaning "a local reference to this basename", so `firstAltFor`,
  `referencesImage`, `passageFor`, and the sidecar title fallback are
  unchanged — a borrowed frame's title, passage, and story are its
  home's. A new pure `pieceFrames(body, folder, basenames)` returns
  the piece's frames as **ids** in document order — local references
  as `<folder>/<basename>`, borrowed ones as `<slug>/<basename>` or
  `gallery/<basename>` — then the folder's unreferenced files sorted,
  as `pieceOrder` does today (which it replaces at T603, once the
  registry calls the new function; T601 adds `pieceFrames` beside it
  and migrates `pieceOrder`'s tests to ids); any frame referenced
  twice appears once, at its first reference. A pure `crossReferences(body)` returns the borrowed ids a body
  places — accepted rasters only — for the registry's checks.
- **The registry** (`images.ts`): the piece's frames are
  `pieceFrames(...)` — `orderByFolder` becomes `framesByPiece`, ids —
  and the piece set on an image's page is built for **every**
  published piece whose frames include the id: the home first (after
  the galleries, as today), then the appearances newest first —
  `publishDate` descending, the order `getPublishedPieces` already
  uses, ties by id — each
  `{ kind: 'piece', id, title, url, count, prev, next }` with
  neighbours from that piece's frames. A piece that places a photograph
  only as its cover is an appearance but has no set for it: a set is
  the piece's body order, and a cover has no position in it (T604's
  fixture is the first cover-only borrow). The 006 set-key mechanism
  (`piece:<slug>`) then selects the borrowing piece's set with no new
  case. **Related frames** stay the outing's: the home piece's frames
  filtered to the home folder, nearest six. **Appearances**
  (`image.appearances`): every published piece other than the home
  whose body or cover places the id, newest first. **The draft rule**:
  for every published piece, every borrowed id in its body and its
  cover must be a published image; an id that exists but is `draft` or `unowned`, or that does not exist at all (a file that is
  not in the registry — a non-photograph format, say), fails the build
  with a message naming the borrowing piece, the id, and the home
  piece (or, for an unowned folder, that the folder has no piece yet;
  or the gallery root). The rule runs before any set is built, so a
  refused id never reaches a neighbour link. A draft piece is skipped,
  as its images are. **The cover's id** comes from
  `piece.data.cover.fsPath`, read directly off the entry (Astro's
  `ImageMetadata` carries the source path in dev and at build — the
  server environment's proxy returns it by name; the field is
  non-enumerable and `@internal`, so a spread, a clone, or
  `JSON.stringify` of the cover loses it silently, and T603 confirms it
  and throws, not skips, if it is ever absent — a decision DECISIONS
  records) through `classifyContentImage`, which knows nested files and
  private frames: a private cover is refused with the cover hint as
  today; a cover that is not a site image (a sub-folder, a
  non-photograph format) is allowed as it is today and simply counts
  as no appearance; a cover that is a site image counts as an
  appearance and obeys the draft rule.
- **The image page** renders `WORDING.alsoIn` ("Also in") with the
  appearances as links, in an `image-from` paragraph (with
  `data-pagefind-ignore`, like its siblings) after "From the piece"
  (or where it would be); nothing when there are none. The
  eyebrow's categories, the passage, the related strip, the record,
  the compare: the home's, untouched.
- **Covers** need no schema change: `image()` resolves `../` paths
  relative to the entry as it resolves `./` ones. `PieceList` renders
  whatever the cover is.
- **The pieces row** (`PieceList.astro`): the `<article class="note-row">`
  becomes `<a class="note-row" href=…>`, the `h3` loses its inner
  anchor, the `Image` and both paragraphs stay inside — flow content
  in an anchor with no interactive descendants, valid HTML. It is
  treated exactly as the gallery card is: `a.note-row { background-image:
none }` drops the theme's underline gradient and nothing else (the
  row keeps its own `background: var(--color-bg)`, so the at-rest
  measurement compares like with like; the card uses `background:
none` because it has no ground of its own), and on hover the anchor's colour goes to the theme's
  hover colour, which the title inherits while `.meta` and the
  description keep their own colours — no underline, since the card
  has none (the first draft added one; dropped at sign-off to match
  the card literally). At rest nothing changes. The anchor's
  accessible name becomes the row's text (date, categories, title,
  description), the same shape as the card's. The row is used by the
  homepage feed and `/pieces/` alike, so both change at once.
- **The Obsidian plugin** resolves a `src` that contains a `/`
  explicitly — the note's folder joined with the path and normalized,
  then `getAbstractFileByPath` — with no name-based fallback for such
  paths (Obsidian's best-match lookup would preview a same-named file
  from another folder where the build says "image not found"; every
  fixture piece has a `land-a.jpg`). A bare name keeps
  `getFirstLinkpathDest` as today. This is the build's rule in the
  editor, whatever Obsidian's own link resolution does with `../`. The
  vault root is `~/photo-brain/` with the repo inside it (AUTHORING's
  layout), so `../../gallery-images/` from a piece folder is
  `photo-pieces/src/content/gallery-images/`, inside the vault and
  reachable.

## Failure messages

- Invalid shape (transform): `image src "<src>" is not a path this
site accepts — a piece places its own images as ./<file>, another
piece's as ../<slug>/<file>, and a gallery-root image as
../../gallery-images/<file>`.
- Draft target (registry): `[images] <borrower-slug> places <id> from
<home-slug>, which is a draft — publish <home-slug> first, or place a
photograph that has a page`.
- Unowned target: `[images] <borrower-slug> places <id>, but
src/content/pieces/<folder>/ has no index.md — it is not a piece yet`.
- Unknown id (a file the registry does not list — a non-photograph
  format, or nothing there): `[images] <borrower-slug> places <id>, which
is not an image this site pages`. A gallery-root image is either
  published or unknown; it has no draft state.
- Borrowed non-raster (transform): `borrowed image "<src>" is not a
photograph this site pages — a piece may borrow only an accepted
raster (<the accepted extensions>)`.
- Private frame: the same message as today, but the check must be fed
  the parsed basename (`parseReference(src).basename`): today it strips
  only a leading `./`, which was safe while every `/` was refused —
  `../beta/_land-a.jpg` would slip past it otherwise (T601 review). The
  transform tests the accepted-extension rule with the shared
  `IMAGE_EXTENSIONS` list, the one source of the list.
- Missing file: unchanged (`image not found: <src> (relative to the
piece's folder)`).

## Testing strategy

- `image-meta.test.mjs`: `parseReference` — the three accepted shapes
  and each invalid one with its message; `pieceFrames` with local,
  borrowed-piece, and borrowed-gallery references interleaved (ids in
  document order, a repeat once, unreferenced local files after,
  sorted); `crossReferences`; `firstAltFor` / `referencesImage` /
  `passageFor` unchanged for a body that also borrows (a borrowed
  frame's alt never becomes a local title). Each shown to fail with its
  rule broken (mutation-checked).
- `remark-pieces-vocabulary.test.mjs`: the harness gains a second
  virtual piece — `tests/pieces/alpha/index.md` beside real fixtures
  `tests/pieces/alpha/photo.jpg`, `tests/pieces/beta/photo.jpg`, and
  `tests/gallery-images/photo.jpg` (8 × 5, from the generator's
  fixtures target) — so `../beta/photo.jpg` links to
  `/images/beta/photo/` and `../../gallery-images/photo.jpg` to
  `/images/gallery/photo/`; a borrowed `src` in `single`, a `diptych`
  slot, a `grid` body, `held`, `pause`, and the shorthand; `sizes` and
  `--ar` identical to the local case; the four invalid shapes and the
  private frame fail naming the rule.
- The registry's rules are pure where they can be: `pieceFrames`,
  `crossReferences`, and a `referenceProblems(borrower, ids, known)` that returns the messages (the home derived from the id's folder — the id rule makes it so) — tested in `image-meta.test.mjs` beside `parseReference`, in `galleries.test.mjs`'s style (the plan had placed them beside `validateGalleries`). The Astro-coupled wiring (sets,
  appearances, the cover's `fsPath`) is verified at build with the
  fixtures and, for the draft rule, a temporary draft piece borrowed
  from a published one (the build must fail with the message; deleted
  after, like T503's dump).
- Fixtures: the sampler gains a "Borrowed" section — a `::single` of
  the fog piece's `land-b.jpg`, a shorthand of the gallery root's
  `dock-a.jpg` — and its cover becomes the fog piece's `land-c.jpg`.
  Then: the sampler's page shows both frames linked to their home
  pages; `land-b`'s page reads "From the piece Where the fog lets go"
  and "Also in The vocabulary sampler", its passage the fog's; from
  the sampler the arrows step through the sampler's frames with
  `land-b` in its place; `dock-a`'s page has no "From the piece" and
  an "Also in" with the sampler; `land-c`'s page lists the sampler
  among its appearances (the cover); the pieces index shows the
  sampler with the borrowed cover.
- The pieces row: in the browser, the row is one anchor with the piece's
  URL; clicking the image, the date line, and the description each
  navigate (`read_page` after a `computer` click); at rest the row's
  computed colours and the title's underline state equal the previous
  markup's (measured before and after); `:focus-visible` on the row
  draws the site's ring.
- Existing suites green (205); build with the barriers; `astro check`.

## File structure

```
src/lib/image-meta.mjs            parseReference, pieceFrames, crossReferences,
                                  referenceProblems; imageReferences yields kinds
remark-pieces-blocks.mjs          parseReference in place of rejectNestedSrc
src/lib/images.ts                 framesByPiece, sets for every placing piece,
                                  appearances, the draft rule, cover by fsPath
src/pages/images/[...id].astro    the "Also in" line; WORDING.alsoIn
src/components/PieceList.astro    the row as one anchor
src/styles/global.css             a.note-row: background-image none, the card's hover colour
obsidian-plugin/main.ts           explicit relative-path resolution
scripts/gen-placeholders.mjs      tests/pieces/{alpha,beta}/photo.jpg,
                                  tests/gallery-images/photo.jpg
src/content/pieces/vocabulary-sampler/index.md   the Borrowed section, the cover
image-meta.test.mjs, remark-pieces-vocabulary.test.mjs
AUTHORING.md, README.md, DECISIONS.md, ROADMAP.md
```

## Known limitations

- A borrowed frame's **title** is its home's (sidecar, then the home
  piece's first alt); the borrowing piece's alt is used only for that
  image element. The page is one page.
- **Renaming** a home piece's folder still changes ids and URLs, now
  including every reference to it in other pieces, which fail the
  build until updated — the missing-file message names each. The
  roadmap's redirect-map item stands.
- The **passage** stays the home's even when the borrowing piece has
  the richer paragraph; decision 2.
- The draft rule is the registry's (build time), so `astro dev` shows
  a borrowed draft image until the next build refuses it.
- A gallery-root photograph in no gallery, placed by one piece, gets
  that piece's set as its default arrows — a nav it never had before.
  Acceptable: it is where the reader came from.
- `pieceFrames` puts a borrowed frame where its first reference is;
  a frame borrowed twice in one piece is one step in the arrows.

## Resolved decisions

- **One parser for the shape**, pure, in `image-meta.mjs`, used by the
  transform and the scanner — the two can't disagree about what a
  reference is.
- **Ids, not basenames, as a piece's frames** — the smallest change
  that lets a set contain frames from two folders.
- **The registry enforces the draft rule**, not the transform: only
  the registry knows a piece's status, and the check belongs beside the
  existing ownership and gallery checks.
- **The cover's id from `fsPath`**, since the built `src` is hashed.
- **The row as an anchor, treated as the gallery card is**: the
  look at rest does not change; the click target does; hover matches
  the card (colour, no underline).
- **The long self-reference is refused**, not tolerated: one way to
  write a local image.
