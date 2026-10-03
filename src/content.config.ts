import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './lib/categories';

// Astro 7 Content Layer API: each collection declares a `loader`.
//
// Every Markdown `glob()` below sets `deferRender: true` (spec 017).
// Without it the loader renders each body itself, and when the block
// transform throws (an unknown directive, the case run at T1501a) the
// loader catches the error, logs `[ERROR] [glob-loader]`, stores the
// entry with no body, and `astro build` still exits 0 — the page ships empty
// (withastro/astro#18054). Deferred, the body renders in the Vite
// Markdown plugin at page build, where the throw fails the build. It
// stays after upstream's fix: it also keeps rendered bodies out of the
// content store for a collection meant to grow for years.
// Pieces are plain Markdown only (no MDX) so the files stay renderable
// and editable in Obsidian — enforced here by the loader pattern.
const journal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/journal', deferRender: true }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishDate: z.coerce.date(),
      categories: z.array(z.enum(CATEGORIES)).min(1),
      description: z.string(),
      cover: image().optional(),
      // Spec 009: the piece's default place for its own folder's frames —
      // a declared place's slug, which the image registry checks, or
      // `none` for no default. A frame's own `at:` always wins.
      at: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

// Galleries (spec 004): hand-curated, ordered lists of image ids
// (`<journal-slug>/<basename>` or a bare `<basename>`), one category
// each. Whether every id names a real, published image is the image
// registry's check (src/lib/images.ts) — it reports file + line; this
// schema covers shape only. `cover` defaults to the first image.
const galleries = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/galleries', deferRender: true }),
  schema: z
    .object({
      title: z.string(),
      category: z.enum(CATEGORIES),
      description: z.string().optional(),
      date: z.coerce.date().optional(),
      cover: z.string().optional(),
      images: z.array(z.string()).min(1),
    })
    .superRefine((gallery, ctx) => {
      if (gallery.cover !== undefined && !gallery.images.includes(gallery.cover)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cover'],
          message: `cover "${gallery.cover}" is not one of this gallery's images`,
        });
      }
    })
    .transform((gallery) => ({ ...gallery, cover: gallery.cover ?? gallery.images[0] })),
});

// Image sidecars (spec 004): an optional `_<basename>.md` beside an
// image — the wall label's overrides and, since spec 006, the rich
// page's fields, with the body as the image's own story. The leading underscore keeps sidecars out of the
// `journal` loader by construction. The id is the path verbatim
// (`journal/<slug>/_land-b`, `photographs/_dock-b`) so the registry
// maps it to the image id deterministically, without Astro's slugger
// in between. Every label field is a string that overrides the
// EXIF-derived value as written; `date` overrides the capture date.
const imageMeta = defineCollection({
  loader: glob({
    pattern: '{journal,photographs}/**/_*.md',
    base: './src/content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    deferRender: true,
  }),
  schema: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    date: z.coerce.date().optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    focalLength: z.string().optional(),
    aperture: z.string().optional(),
    shutter: z.string().optional(),
    iso: z.string().optional(),
    // Spec 006 — the rich page's authored fields, all optional; a section
    // renders only when at least one of its fields exists. The body of
    // the sidecar is the image's story.
    place: z.string().optional(),
    time: z.string().optional(),
    // Spec 009: this frame's place — a declared place's slug, or `none`
    // for no place. Wins over the piece's `at:`; the registry checks it.
    at: z.string().optional(),
    format: z.string().optional(),
    filters: z.string().optional(),
    support: z.string().optional(),
    processing: z.string().optional(),
    // Spec 019: the steps between the camera's frame and the finished
    // photograph, in order, each a private file beside it
    // (`_<basename>.<word>.<ext>`) with a label and an optional note. The
    // frame and the photograph are implied, never listed; the registry
    // checks every `file` against the photograph's own stage files.
    stages: z
      .array(z.object({ file: z.string(), label: z.string().min(1), note: z.string().optional() }))
      .optional(),
    edition: z.string().optional(),
    sizes: z.string().optional(),
    paper: z.string().optional(),
    // Spec 019: a photograph in the photographs folder is published unless
    // its sidecar says `draft: true`, stands on the front door when it
    // has a `published:` date (not `date`, the capture date's override),
    // and may name its `categories:` as a journal entry's frontmatter
    // writes them (amendment 4). A journal entry's photographs are
    // published, dated and categorised by their entry, so the registry
    // refuses any of the three lines in a journal folder — optional, not
    // defaulted, so a written `draft: false` is refused too.
    // The names are PHOTOGRAPH_FIELDS (src/lib/image-meta.mjs).
    draft: z.boolean().optional(), // photographs folder only
    published: z.coerce.date().optional(), // photographs folder only
    categories: z.array(z.enum(CATEGORIES)).min(1).optional(), // photographs folder only
  }),
});

// Places (spec 009): the coast, the trail, the room a photograph was
// made at — one file per place, its name the URL segment every `at:`
// line names, so the id is the file name verbatim (`generateId`, as
// `imageMeta` does). The registry (src/lib/images.ts) checks that the
// id is a usable slug, that `cover` is one of the place's own frames,
// and that every `at:` on a piece or a sidecar names a declared place;
// this schema covers shape only. The body is the place's writing.
const places = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/places',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    deferRender: true,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal, galleries, imageMeta, places };
