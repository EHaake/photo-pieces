# Plan: Cross-piece image references

**Status**: Draft — for the skeptical-reviewer's sign-off at the top
tier, then the product owner's spec-conformance summary
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
  gallery root, or `null` for local (the caller's own folder).
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
  as `pieceOrder` does today (which it replaces; a borrowed frame
  referenced twice appears once, at its first reference). A pure
  `crossReferences(body)` returns the borrowed ids a body places, for
  the registry's checks.
- **The registry** (`images.ts`): the piece's frames are
  `pieceFrames(...)` — `orderByFolder` becomes `framesByPiece`, ids —
  and the piece set on an image's page is built for **every**
  published piece whose frames include the id: the home first (after
  the galleries, as today), then the appearances newest first, each
  `{ kind: 'piece', id, title, url, count, prev, next }` with
  neighbours from that piece's frames. The 006 set-key mechanism
  (`piece:<slug>`) then selects the borrowing piece's set with no new
  case. **Related frames** stay the outing's: the home piece's frames
  filtered to the home folder, nearest six. **Appearances**
  (`image.appearances`): every published piece other than the home
  whose body or cover places the id, newest first. **The draft rule**:
  for every published piece, every borrowed id in its body and its
  cover must be a published image; an id that exists but is `draft`
  or `unowned`, or that does not exist at all (a file that is not in
  the registry — a non-photograph format, say), fails the build with
  a message naming the borrowing piece, the id, and the home piece
  (or "the gallery root"). A draft piece is skipped, as its images are.
  The cover's id comes from `piece.data.cover.fsPath` (Astro's
  `ImageMetadata` carries the source path) through `parseImagePath`,
  which also replaces the current basename-only private check.
- **The image page** renders `WORDING.alsoIn` ("Also in") with the
  appearances as links, in an `image-from` paragraph after "From the
  piece" (or where it would be); nothing when there are none. The
  eyebrow's categories, the passage, the related strip, the record,
  the compare: the home's, untouched.
- **Covers** need no schema change: `image()` resolves `../` paths
  relative to the entry as it resolves `./` ones. `PieceList` renders
  whatever the cover is.
- **The pieces row** (`PieceList.astro`): the `<article class="note-row">`
  becomes `<a class="note-row" href=…>`, the `h3` loses its inner
  anchor (its text in a `span`), the `Image` and both paragraphs stay
  inside. CSS: `a.note-row` drops the theme's link background and
  keeps its text colours (`color: inherit` on the anchor already
  applies), and on `:hover` / `:focus-visible` the title's span takes
  the underline the theme gives a hovered link (`background-size:
100% 1px`), so the row reads exactly as it did at rest and the
  title still announces itself as the link. The row is used by the
  homepage feed and `/pieces/` alike, so both change at once.
- **The Obsidian plugin** resolves `src` explicitly: the note's folder
  joined with the path and normalized, then `getAbstractFileByPath`;
  `getFirstLinkpathDest` stays as the fallback for the bare-name case
  it handles today. A `../` path then previews whether or not
  Obsidian's link resolution would have found it.

## Failure messages

- Invalid shape (transform): `image src "<src>" is not a path this
site accepts — a piece places its own images as ./<file>, another
piece's as ../<slug>/<file>, and a gallery-root image as
../../gallery-images/<file>`.
- Draft or unknown target (registry): `[images] <borrower-slug>
places <id> (from <home-slug> | the gallery root), which is not a
published image — publish <home-slug> first, or place a photograph
that has a page`.
- Private frame: unchanged (the file-part check).
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
  `crossReferences`, and a `referenceProblems(borrower, ids, known,
homeOf)` that returns the messages — tested in `galleries.test.mjs`'s
  style beside `validateGalleries`. The Astro-coupled wiring (sets,
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
src/styles/global.css             a.note-row and the title's hover underline
obsidian-plugin/main.ts           explicit relative-path resolution
scripts/gen-placeholders.mjs      tests/pieces/{alpha,beta}/photo.jpg,
                                  tests/gallery-images/photo.jpg
src/content/pieces/vocabulary-sampler/index.md   the Borrowed section, the cover
image-meta.test.mjs, remark-pieces-vocabulary.test.mjs, galleries.test.mjs
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
- **The row as an anchor, the title still the visible link**: the
  look at rest does not change; the click target does.
