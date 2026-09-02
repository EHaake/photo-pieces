# Roadmap

Deliberately unordered and unscheduled — this is a backlog to revisit
once there's a working v1 site to actually use, not a plan with dates
attached.

- **Shop / print sales** — let visitors purchase prints of showcased
  images. Deferred out of `specs/001-site-foundation` because it's a
  substantial feature in its own right (payments, fulfillment,
  licensing) that deserves its own spec once the core site exists.
- **The rich image detail page** — the photographer's motivating
  feature: an image page richer than any site builder offers — deep
  metadata, the image's own story, potentially its own writing, and
  eventually the print-sales entry point. Spec 004 (shipped) gives
  every image a stable id and URL (`/images/<folder>/<basename>/`), an
  image-first page with a baseline wall label (title, exposure info
  from EXIF with sidecar overrides, piece and gallery links, caption),
  and a metadata model to grow from: the sidecar's frontmatter is the
  label today and its body is deliberately reserved for the image's
  own writing. The rich version is its own spec with its own design
  conversation; nothing has to move.
- ~~**Galleries and image pages**~~ — done in spec 004: the image
  registry, image pages, named galleries with a category (rows packed
  to equal short sides in editorial order — the photographer's rule
  from the sampler review, `DECISIONS.md`), the galleries index,
  category pages, every piece image linking to its page, and the GPS
  barriers. Follow-ups it surfaced: the homepage design pass places the
  `LatestWork` strip (built, unplaced); renaming an image changes its
  URL with no redirect (fine while nothing is live — a redirect map
  becomes worth having once URLs are public); an image's page doesn't
  distinguish "referenced by the piece" from "in the folder", and an
  image can belong to one piece only; image pages aren't in Pagefind's
  index (only piece bodies are); and the post-build pruner
  (`scripts/prune-unreferenced-originals.mjs`) exists because Astro
  leaves untouched originals in the output — worth an upstream issue,
  and a no-op if they fix it.
- **Homepage design pass** — the interim homepage (spec 002) stands
  until a design pass decides what the front door shows: the latest-
  work strip, the newest pieces, a hero. Waits on real content.
- **Comments** — not wanted for v1. Revisit if reader engagement makes
  the moderation overhead feel worth it.
- **User accounts** — no identified need without comments or a shop;
  would likely arrive alongside whichever of those gets built first.
- ~~**Site search**~~ — inherited working from the theme (Pagefind at
  `/search`, indexing piece bodies); never needed building. Revisit
  only if its scope should widen beyond pieces.
- **Newsletter / subscription** — revisit if there's a reason to want a
  push channel independent of Instagram.
- **A CMS** (e.g. Keystatic) — not planned; the Obsidian + live-preview
  workflow covers v1 authoring. Revisit only if authoring away from the
  project repo becomes a real need.
- **The "sequence" block's final interaction design** — the underlying
  data (an ordered list of image + label pairs, for image-processing/
  editing narratives) is reserved in the content model now. The actual
  presentation — carousel, step-through, before/after slider — needs a
  dedicated Claude Design exploration once real processing-themed pieces
  exist to test it against.
- **Internal piece-to-piece link rewriting** — links between pieces
  authored as vault-relative markdown links (which is what Obsidian's
  `[[` autocomplete inserts, and what feeds its graph/backlinks) need a
  small build-time remark transform to become published route URLs
  (`/pieces/<slug>/`). Same pipeline as the block directives. Needed
  the day the first cross-piece link gets written, not before.
- **Obsidian live rendering for photo blocks** — built, in a
  deliberately minimal form: a custom plugin in `obsidian-plugin/`
  rendered `fullbleed` directives as images in Live Preview, the mode
  actually used while writing. The bar was set at seeing the photo
  instead of raw directive text, not matching the real site's styling —
  see `DECISIONS.md` for that scoping. As of spec 003 the plugin
  renders the leaf form of every standalone block (single, fullbleed,
  wide, tall, inset, diptych, triptych). What remains: Reading View is
  intentionally not handled, and container forms stay raw text (see
  the vocabulary entry below).
- **Contact form** — wanted (decided at spec 002 review), deferred to
  its own spec: form handling on a static site means either a form
  service (new dependency to justify) or host-provided handling, and
  the choice interacts with the hosting decision. Until then the
  Contact page carries direct email + Instagram.
- ~~**Block vocabulary expansion**~~ — done in spec 003, which chose
  breadth over the demand-driven growth this entry originally
  prescribed (the photographer's call: better to have the vocabulary
  ready before writing than to interrupt writing to build it — see
  `DECISIONS.md`). What remains: Obsidian Live Preview for container
  forms (captions, grid, strip, aside, row), which needs a real parser
  rather than the plugin's line regex.
- ~~**Dark mode removal**~~ — done in spec 002 (T104/T105): palette,
  toggle, and `prefers-color-scheme` handling all removed; the accent
  is a single-line change again.
