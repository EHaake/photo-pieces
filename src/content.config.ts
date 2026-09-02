import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './lib/categories';

// Astro 7 Content Layer API: each collection declares a `loader`.
// Pieces are plain Markdown only (no MDX) so the files stay renderable
// and editable in Obsidian — enforced here by the loader pattern.
const pieces = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pieces' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      publishDate: z.coerce.date(),
      categories: z.array(z.enum(CATEGORIES)).min(1),
      description: z.string(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

// Galleries (spec 004): hand-curated, ordered lists of image ids
// (`<piece-folder>/<basename>` or `gallery/<basename>`), one category
// each. Whether every id names a real, published image is the image
// registry's check (src/lib/images.ts) — it reports file + line; this
// schema covers shape only. `cover` defaults to the first image.
const galleries = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/galleries' }),
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
// image, frontmatter-only for now (the body is reserved for the rich
// image page). The leading underscore keeps sidecars out of the
// `pieces` loader by construction. The id is the path verbatim
// (`pieces/<slug>/_land-b`, `gallery-images/_dock-b`) so the registry
// maps it to the image id deterministically, without Astro's slugger
// in between. Every label field is a string that overrides the
// EXIF-derived value as written; `date` overrides the capture date.
const imageMeta = defineCollection({
  loader: glob({
    pattern: '{pieces,gallery-images}/**/_*.md',
    base: './src/content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
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
  }),
});

export const collections = { pieces, galleries, imageMeta };
