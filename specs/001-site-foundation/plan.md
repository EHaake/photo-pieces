# Plan: Site Foundation

**Status**: Draft — pending review
**Implements**: spec.md in this directory

Scoped deliberately: this pass targets one thing — writing a piece as
a plain Markdown file and seeing it render correctly in `astro dev` —
as directly as possible. Everything not required for that is named and
deferred below, not silently skipped.

## Data model / core types

### `pieces` collection (new, alongside `blog` for now)

```ts
const pieces = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pieces' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishDate: z.coerce.date(),
      categories: z.array(z.enum(['landscape', 'street', 'portrait', 'event'])).min(1),
      description: z.string(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});
```

The glob pattern matches `.md` only, not `.mdx` — CLAUDE.md's "no MDX
for pieces" rule is enforced structurally at the loader, not just
followed by convention.

### Directive-based blocks — verified, not assumed

Confirmed working through an actual `astro build`, not just a syntax
check: `remark-directive` registers cleanly in Astro's existing
`remarkPlugins` array, and a plain `.md` file using
`::fullbleed{src="..." alt="..."}` produces real HTML in the built
output.

The dominant case — a single image — needs no directive at all. Plain
Markdown image syntax (`![alt](photo.jpg)`) already works and is the
right choice for it, styled through the theme's existing prose rules.
Directives are only for what plain Markdown can't express:

- `::fullbleed{src="..." alt="..."}` — built, styled, tested
- `::diptych{left="..." right="..." leftAlt="..." rightAlt="..."}` —
  built alongside fullbleed at T004 (shared transform machinery), with
  side-by-side grid styling added at the pre-merge review
- `::triptych{...}` — same, three-up
- `sequence` — reserved; the directive exists but fails the build
  deliberately until its presentation is designed (see `ROADMAP.md`)

The closed vocabulary is enforced _site-wide_, not just for pieces:
the transform registers on the global markdown pipeline (which MDX
inherits), so a stray `::name` in `blog`/`works` content also fails
the build loudly. Intentional — the alternative (scoping to pieces)
would leave directives in other collections silently rendering as
broken markup.

### Image handling — a deliberate, scoped starting point

Local, co-located with each piece
(`src/content/pieces/<slug>/photo.jpg`), read through Astro's built-in
local image handling. No CDN, no external store, nothing to configure.
This required amending `CLAUDE.md` — done, in the same commit as this
plan — since the constitution previously ruled this out. The trigger
for actually migrating to an external store is concrete: repo size or
clone speed becoming a real problem, not a hypothetical one.

Directive-rendered images go through `astro:assets` optimization —
resolved in T004, differently than first guessed. `getImage()` cannot
be called from a remark plugin (`astro:assets` is a Vite virtual
module, and it requires ESM-imported image metadata, not a path
string). Instead the transform emits real mdast `image` nodes as the
directive's children; Astro's own `remarkCollectImages`/`rehypeImages`
pair, which runs after user plugins, then optimizes them identically
to plain `![alt](./photo.jpg)` images. Per-treatment `layout`/`sizes`
hints ride each image node's `hProperties` into `getImage()`, so a
fullbleed gets `full-width`/`100vw` responsive variants
(diptych/triptych carry provisional values until T005's real column
CSS).

Still open, recorded deliberately: no global `image.layout` is set, so
_plain-markdown_ single images (the dominant case) are optimized but
get no srcset — one full-resolution derivative. Setting a site-wide
layout would change `/blog/` too; that's its own decision, not a T004
side effect.

### `galleries` collection — deferred

Not part of this pass. `works` (currently a software-portfolio schema —
`tech`, `repo` fields that don't apply here) stays as-is rather than
being torn out mid-transition. Reshaping it into `galleries` is
separate work, once the piece-authoring loop itself is proven.

## Architecture / screens / components

- `src/content/pieces/<slug>/index.md` + co-located images — one folder
  per piece. Matches how Obsidian already handles attachments, and
  keeps a piece self-contained if it ever needs to move to a different
  image store later.
- `remark-pieces-blocks.mjs` (repo root, alongside the theme's existing
  `remark-reading-time.mjs`) — the directive transform, registered
  after `remarkDirective` in `astro.config.mjs`.
- No per-block `.astro` components — amended in T004, with a matching
  constitution amendment. A plain-`.md` pipeline cannot map rendered
  elements to Astro components (MDX-only feature), so a block's
  identity is its handler in the remark transform (the vocabulary's
  source of truth) plus a CSS hook (`figure.piece-fullbleed`), styled
  in T005 with the theme's tokens. Future interactive blocks
  (`sequence`) will be page-level progressive enhancement over the
  transform's HTML.
- A piece reading page at `/pieces/[slug]/` — new route, parallel to
  the existing `/blog/[slug]/` rather than replacing it, so nothing
  currently working breaks mid-transition.
- `blog` and `works` — collections, pages, and nav entries all stay in
  place, untouched. Removing them is real work that doesn't need to
  block getting pieces working, and doing it later, deliberately, is
  safer than doing it as a side effect of this pass.

## Cross-cutting decisions

Explicitly not decided here — worth their own conversation once they
actually matter, not guessed at now:

- **Image hosting/CDN.** Local images are the starting point (above);
  which external store to eventually migrate to is untouched.
- **Deploy target.** GitHub Pages is available for free via the theme's
  existing workflow; whether that's the real answer or just a way to
  see something live isn't decided.
- **Testing framework.** Vitest — confirmed at T008 (was CLAUDE.md's
  unconfirmed default). Dev dependency; `npm test` runs `vitest run`.
- **Authoring-side tooling dependencies.** `obsidian-plugin/` (built
  mid-flight; see `DECISIONS.md` and tasks.md Phase 4) carries its own
  dev-only `package.json`: `obsidian`, `@codemirror/{state,view}`,
  `@types/node`, `esbuild`, `typescript`. Editor tooling, never part of the site
  build — recorded here per the dependency policy rather than in the
  site's own `package.json`.
- **Galleries' technical shape.** Deferred alongside the collection.

## Known limitations

- Plain-markdown single images get one optimized derivative, no srcset,
  until the global `image.layout` decision is made (see Image handling).
  Directive images are fully responsive as of T004.
- Piece-page parity gaps versus `/blog/`, all deferred deliberately:
  no per-piece OG image (pieces fall back to the site-wide `og.jpg`),
  no JSON-LD structured data, no RSS inclusion, no `/pieces/` index or
  nav entry (awaiting the homepage design pass), and the schema's
  `cover` field is validated but not yet consumed by any page.
- `site`/`base` in `astro.config.mjs` and the title/author/social
  values in `src/consts.ts` still carry the upstream theme author's
  values — fixing them is part of the deploy-target decision.
- `blog`/`works` remain, unused by the new workflow, until a deliberate
  cleanup pass.
- Only `fullbleed` exists as a working directive; `diptych`/`triptych`
  follow the same verified pattern but aren't built yet.
- No galleries, no homepage redesign, no About/Contact work — all out
  of scope for "prove the authoring loop works."

## Testing strategy

Resolved at T008 (the blanket deferral contradicted CLAUDE.md's
Testing section, which requires real unit tests for the transform):
`remark-pieces-blocks.test.mjs` runs the directive transform through
the real Astro pipeline (`createMarkdownProcessor`), covering every
block's happy path, every fail-loudly case, and the mdast-image-
children → `__ASTRO_IMAGE_` handshake the optimization design rests
on — so a future Astro upgrade that reorders user plugins after image
collection fails tests, not production. `astro build` remains the
other required verification per CLAUDE.md.

## File structure

```
photo-pieces/
├── astro.config.mjs              # + remarkDirective, remarkPiecesBlocks
├── remark-pieces-blocks.mjs      # new — the directive transform
├── src/
│   ├── content.config.ts         # + pieces collection
│   ├── content/
│   │   ├── pieces/                # new
│   │   │   └── <slug>/
│   │   │       ├── index.md
│   │   │       └── *.jpg
│   │   ├── blog/                  # unchanged, untouched for now
│   │   └── works/                 # unchanged, untouched for now
│   └── pages/
│       └── pieces/
│           └── [slug].astro       # new
```

## Resolved decisions

- **Directive mechanism verified**, not assumed — confirmed via a real
  build, not just a syntax check.
- **Single images use plain Markdown, not a directive** — directives
  are reserved for treatments plain Markdown can't express.
- **Local images for now, external store later** — a deliberate,
  scoped starting point; required amending `CLAUDE.md`.
- **New route (`/pieces/`) rather than replacing `/blog/`** — keeps the
  existing site working throughout the transition.
- **`galleries`/`works` rework deferred** — not required for the
  piece-authoring loop specifically, which is this pass's actual goal.
