# Roadmap

Deliberately unordered and unscheduled — this is a backlog to revisit
once there's a working v1 site to actually use, not a plan with dates
attached.

- **Shop / print sales** — let visitors purchase prints of showcased
  images. Deferred out of `specs/001-site-foundation` because it's a
  substantial feature in its own right (payments, fulfillment,
  licensing) that deserves its own spec once the core site exists.
- ~~**The rich image detail page**~~ — done in spec 006, on the
  foundation spec 004 laid: the sidecar body is the image's story;
  place, time, "How it was made", and "The print" (with an enquiry
  link until the shop) are sidecar fields; a raw-to-finished compare
  against a private camera's frame (`_<basename>.<ext>`); the passage
  of the piece the image sits in; related frames of the outing; a
  neighbour line and arrow keys through the gallery or piece the
  reader came from; quiet view on a dimmed ground; image pages with
  something to find in the search index. Every section optional per
  image — the 004 page is the floor. Follow-ups it surfaced: set
  selection needs a click on this site (a typed URL shows the default
  set); the passage is the nearest earlier prose block, a heuristic;
  one camera's frame per photograph (a sequence of frames is the
  showcase's to design); the page's wording is a `const` block in the
  page, retuned by hand; the print enquiry is `mailto:` until the shop
  spec; galleries' `sizes`/srcset math and the related strip's now
  share `gallery-layout.ts`, so a density change is one number.
- **The processing showcase** — the photographer's own reason for
  building the site rather than using a builder: presenting
  post-processing as a semi-interactive, semi-educative showcase of how
  processing is core to the work and how creative and transformative it
  can be — ideas for workflow, and how specific techniques and
  approaches change an image, more than tool-specific step lists
  (though those aren't ruled out). Spec 006 shipped the seed: a single
  raw-to-finished compare slider on the image page, fed by a private
  camera's frame beside the photograph, with the processing note. The
  showcase itself needs its own spec and design exploration once real
  processed work exists to test against: it could be part of the image
  detail page, its own kind of piece, or spread across both. Subsumes
  the `sequence` block's open interaction design below.
- ~~**Galleries and image pages**~~ — done in spec 004: the image
  registry, image pages, named galleries with a category (rows packed to
  equal short sides in editorial order — the photographer's rule from
  the sampler review, `DECISIONS.md`), the galleries index, category
  pages, every piece image linking to its page, and the GPS barriers.
  Follow-ups it surfaced: the homepage design pass places the
  `LatestWork` strip (built, unplaced); renaming an image changes its
  URL with no redirect (fine while nothing is live — a redirect map
  becomes worth having once URLs are public); an image's page doesn't
  distinguish "referenced by the piece" from "in the folder", and an
  image can belong to one piece only; image pages were not in Pagefind's
  index (spec 006 indexes the ones with something to find); and the
  post-build pruner (`scripts/prune-unreferenced-originals.mjs`) exists
  because Astro leaves untouched originals in the output — worth an
  upstream issue, and a no-op if they fix it. - **A galleries overhaul**
  — noted by the photographer at the spec 007 close-out (2026-09-05),
  for a spec of its own (since spec 009 the place pages share the
  gallery's packing knobs and rows, so the overhaul moves them too): the
  gallery grid feels too constrained by the prose column's width — it
  should be able to run wider on the page than the text does, closer to
  the content width — and the spacing between the images wants retuning.
  Both are knobs of `gallery-layout.ts` and the `.gallery-grid` rules
  today; the spec decides the widths and the gaps by looking, on both of
  the photographer's screens, and folds in whatever the real photographs
  (below) teach about density.
- **The front door** — to be workshopped with the photographer
  (decided 2026-09-02): the interim homepage (spec 002) stands until
  then. The starting position: the homepage is the site's thesis —
  one photograph, one sentence, the latest piece a scroll away — not
  a grid of recent work, which would undo the argument the rest of
  the site makes. The `LatestWork` strip is built and unplaced.
- ~~**The held image**~~ — done in spec 007: two durational blocks.
  `held` is a container whose body is the prose that passes beside a
  frame that stays — the frame left or right, at the content width or
  bled to the viewport edge, letting go the moment the words are spent
  (plain sticky positioning, no script), and no hold at all where no
  column fits beside it, where the frame is an ordinary figure and the
  words follow. `pause` is the leaf for the frame too wide to hold
  beside words: the frame pins at the centre of the screen with its
  neighbouring paragraphs anchored above and below it, the ground goes
  to a dark grey with the words a shade darker and still faintly there,
  the mat keeps its own colour, and after 1.2 screens of pinned scroll
  the lights come back up and the page moves on — script-driven,
  degrading without script to a pin on the light ground. Follow-ups it
  surfaced: a tall pause frame on a short viewport can push an anchored
  paragraph partly off-screen while pinned (a pause is for the wide
  frame); a pause needs about half of the screen its stage leaves empty
  in words after it, or it cannot finish; a collapsed hold keeps the
  held reading size rather than its neighbours'; the header's
  focus-reveal is knowingly overridden while a scene is active, so a
  keyboard user tabbing into the nav mid-pause focuses off-screen links;
  a `held` or `pause` written into a sidecar story gets the CSS but not
  the script; the lights' list of elements is enumerated, so anything
  outside it stays light on the dark ground; and the sampler's
  site-absolute link after its pause is the one exception to
  vault-relative links, until a link rewrite exists.
- **The slow view** — a piece or gallery experienced one frame at a
  time: full viewport on the dimmed ground, the piece's words between
  frames, stepped by key or swipe. Every part exists (quiet view, sets,
  arrow keys, the passage); the anti-feed in its purest form.
- ~~**Cross-piece image references**~~ — done in spec 008, by path
  rather than by the id the entry sketched: a piece places another
  piece's photograph as `../<slug>/<file>` and a gallery-root one as
  `../../gallery-images/<file>`, in every block, the shorthand, and
  `cover`. The photograph keeps its home page, which gains an "Also
  in" line naming every other published piece that places it; the
  arrows follow the piece the reader came from; a published piece may
  not borrow from a draft one. The pieces row became one link, as the
  gallery card is. Follow-ups it leaves: renaming a folder or a file
  now breaks every reference to it from another piece as well as its
  own URL, so the redirect-map item above stands; the
  passage on an image's page stays the home piece's even when the
  borrowing piece has the richer paragraph ("One page, one home" in
  `DECISIONS.md`);
  and a missing file written as the plain `![alt](…)` shorthand still
  fails with Astro's opaque error rather than the transform's — the
  check can be extended to the shorthand in a later spec; and the
  registry's scanner reads the raw body, fenced code included, so a
  borrowed reference quoted in a code block of a published piece
  counts as a placement (a build failure if its target has no page, a
  phantom "Also in" if it does) — strip fences in the scanner when
  the first gear-notes piece quotes one.
- ~~**Places**~~ — shipped as spec 009 (2026-09-06), reframed from the
  earlier "series entity": a place is declared once as its own file
  (`src/content/places/<slug>.md`, a title, an optional description and
  cover, and the writing), and the photograph is the unit that names it
  — `at: <slug>` in a frame's sidecar, with a piece's own `at:` as an
  optional default for its folder and `at: none` to opt a frame out. The
  build refuses a slug with no file and lists the places that exist. The
  page at `/places/<slug>/` carries the writing, then the outings oldest
  first, each the piece's own frames at the place in the piece's order,
  packed as a gallery; `/places/` lists cards, and Places sits in the
  nav after Galleries. The wall label's place is the place's title as a
  link, and the arrows step through a place's frames when the reader
  arrives from it. Never by GPS and never by the free-text `place`,
  which stays prose. Follow-ups it leaves: a place's writing is prose
  only — no photograph lives beside a place file, so images in a place's
  body need a reference shape of their own; gallery-root photographs
  cannot join a place (the page groups by piece and they have none — a
  group for frames without a piece is the obvious extension, and their
  `at:` is warned about and ignored until then); and renaming a place is
  renaming its file, which breaks every `at:` naming it until updated,
  as the redirect-map item above already notes for images.
- **Real photographs as fixtures, before more design** — every visual
  decision so far (the warm ground, the mats, the quiet dark, the
  packing) was judged on flat placeholder rectangles. Ten real exports
  as fixtures, no writing needed, then re-judge the samplers.
- **Reading typography pass for pieces** — measure, size, and rhythm
  were inherited from a blog theme; immersive reading wants a slightly
  narrower column, larger type, more air between blocks.
- **Image loading choreography** — a large frame popping in
  half-decoded breaks the spell: a fade on decode and a mat-coloured
  placeholder.
- **Output formats and a page-weight budget** — eight exports at two
  megabytes is a sixteen-megabyte piece; AVIF output and a stated
  budget per piece.
- **A colophon** — one paragraph in the photographer's words about how
  the site shows work (why the mats, why the quiet view), so the
  design has its meaning without the pages explaining themselves.
- **Browse by place** — a names-only index of the places sidecars
  name; no coordinates, ever.
- **Keyboard help** — arrow keys and Escape exist and nobody will
  know: a line on the image page, or a small hint on first use.
- **Standing tests for the image page's section order** — verified
  once by script at spec 006's T406; should be a test.
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
  editing narratives) is reserved in the content model now, and the
  directive still fails the build. Spec 006's before/after compare on
  the image page is a page section fed by a file-naming convention (the
  private camera's frame beside the photograph), not this block. The
  block's presentation — carousel, step-through, multi-step narratives —
  belongs to the processing showcase entry above, once real
  processing-themed pieces exist to test it against.
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
  see `DECISIONS.md` for that scoping. As of spec 007 the plugin
  renders the leaf form of every standalone block (single, fullbleed,
  wide, tall, inset, diptych, triptych, pause). What remains: Reading View is
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
  forms (captions, grid, strip, aside, row, held), which needs a real parser
  rather than the plugin's line regex.
- ~~**Dark mode removal**~~ — done in spec 002 (T104/T105): palette,
  toggle, and `prefers-color-scheme` handling all removed; the accent
  is a single-line change again.
