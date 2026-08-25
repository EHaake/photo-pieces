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
      categories: z
        .array(z.enum(['landscape', 'street', 'portrait', 'event']))
        .min(1),
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

- `::fullbleed{src="..." alt="..."}` — verified working
- `::diptych{left="..." right="..."}` — same pattern, not yet built
- `::triptych{...}` — same pattern, not yet built
- `sequence` — reserved, no directive yet (see `ROADMAP.md`)

### Image handling — a deliberate, scoped starting point

Local, co-located with each piece
(`src/content/pieces/<slug>/photo.jpg`), read through Astro's built-in
local image handling. No CDN, no external store, nothing to configure.
This required amending `CLAUDE.md` — done, in the same commit as this
plan — since the constitution previously ruled this out. The trigger
for actually migrating to an external store is concrete: repo size or
clone speed becoming a real problem, not a hypothetical one.

Directive-rendered images render as plain `<img>` for now, not run
through `astro:assets`' optimization pipeline. Calling `getImage()`
from inside an async remark plugin is a real next step, just not
required to prove pieces work end-to-end.

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
- `src/components/blocks/FullBleed.astro` — first real block component,
  replacing the spike's placeholder output with an actual image render.
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
- **Testing framework.** CLAUDE.md names Vitest as a reasonable
  default, unconfirmed. Not required to prove the dev loop works.
- **Galleries' technical shape.** Deferred alongside the collection.

## Known limitations

- Images unoptimized (plain `<img>`, no responsive variants) until
  `astro:assets` gets wired into the directive pipeline.
- `blog`/`works` remain, unused by the new workflow, until a deliberate
  cleanup pass.
- Only `fullbleed` exists as a working directive; `diptych`/`triptych`
  follow the same verified pattern but aren't built yet.
- No galleries, no homepage redesign, no About/Contact work — all out
  of scope for "prove the authoring loop works."

## Testing strategy

Deferred — see Cross-cutting decisions. The build succeeding
(`astro build`) is the only verification this pass requires, per
CLAUDE.md's existing verification rule.

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
│   ├── components/
│   │   └── blocks/
│   │       └── FullBleed.astro    # new
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
