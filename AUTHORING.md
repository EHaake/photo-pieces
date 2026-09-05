# Authoring Environment: Obsidian Setup & Usage

Reference for how the writing environment is set up and why. The piece
_format_ (frontmatter fields, directive syntax) is documented in
`README.md`; this file covers the vault around it.

## Vault layout

The vault is a **parent** of the repo, not the content folder itself:

```
~/photo-brain/                  <- Obsidian vault root
├── photo-pieces/               <- this repo, a normal git clone
│   └── src/content/
│       ├── pieces/             <- published pieces live here
│       ├── gallery-images/     <- images that belong to no piece
│       └── galleries/          <- one file per gallery
├── notes/                      <- private second-brain material
└── templates/                  <- Obsidian template files
```

Why this shape:

- **Astro only reads its configured content directory**, so nothing
  outside `src/content/pieces/` can leak into the built site.
- **Private notes live outside the repo entirely** — shoot planning,
  location scouting, gear research, journal fragments. They can never
  be committed by accident because git never sees them. No `.gitignore`
  discipline required.
- **One vault means one graph.** A scouting note can link to the piece
  that came out of that trip; the graph grows across private and
  published material together.

## Obsidian settings that matter

- **Files & links → "Use Wikilinks": OFF.** Obsidian then writes
  standard markdown links, which the Astro build can parse. The `[[`
  autocomplete still works exactly the same — it just inserts a
  portable link instead of wiki syntax.
- **Files & links → Excluded files:** add `.git`, `node_modules`, and
  `dist` so search, the graph, and link suggestions don't drown in
  repo machinery.
- **Core Templates plugin:** point it at `templates/`, and keep a
  `piece.md` template there (skeleton below).
- **Community plugins → Photo Pieces Blocks: enabled.** The plugin
  renders leaves: a standalone block written in leaf form (`::single`,
  `::fullbleed`, `::wide`, `::tall`, `::inset`, `::diptych`,
  `::triptych`, `::pause`) shows its image while you write. Everything
  else is raw text by construction — container forms (captions), and
  the container-only `grid`, `strip`, `aside`, `row`, and `held` — and
  the site build is the truth for those. A `::pause` previews as a
  plain image: the pin, the dim, and the frame's approach are the
  site's alone. Live Preview only — Reading view is intentionally out
  of scope (see `DECISIONS.md`). Build/install instructions:
  `obsidian-plugin/README.md`.

## Piece template

Contents for `templates/piece.md` — frontmatter is simultaneously the
Astro schema (build-validated) and Obsidian's Properties panel, so
there is no separate metadata system to maintain:

```markdown
---
title:
publishDate:
categories: []
description:
cover:
draft: true
---
```

`categories` values: `landscape`, `street`, `portrait`, `event`.

Two more skeletons worth keeping in `templates/` (spec 004 — the
field reference is in `README.md`):

```markdown
---
title:
caption:
date:
camera:
lens:
focalLength:
aperture:
shutter:
iso:
place:
time:
format:
filters:
support:
processing:
edition:
sizes:
paper:
---

The story, if there is one.
```

saved as `_<basename>.md` beside an image (every field optional — see
"Metadata: EXIF, then a sidecar" below), and

```markdown
---
title:
category:
description:
date:
images:
  -
---
```

saved in `src/content/galleries/`.

## A piece folder is public territory

Since spec 004 every accepted image in a published piece's folder has
its own page at `/images/<piece-folder>/<basename>/` — whether or not
the piece's text references it. Consequences worth internalizing:

- **Don't park alternates in the folder.** An unreferenced frame is
  still published with a page. Keep contact-sheet material in `notes/`
  or the archive; move a frame into the folder when it's chosen.
- **No sub-folders.** Images live directly in the piece folder; a
  `detail/` folder is ignored with a build warning, and a directive
  pointing into one fails the build.
- **File names are URLs.** `land-b.jpg` becomes `/images/<slug>/land-b/`.
  Renaming or moving an image changes its URL (no redirects yet —
  nothing is live), so name frames before publishing, not after.
- **`draft: true` hides the images too.** A gallery that lists one of
  them fails the build until the piece is published.
- **The folder name must be a slug** (`lowercase-with-hyphens`), as
  they all are already — the build says so, with the fix, if not.
- **An underscore makes a file private.** `_land-b.jpg` beside
  `land-b.jpg` is that photograph's camera's frame (spec 006): it gets
  no page, can't be listed in a gallery, and a piece that places it
  fails the build. See "The camera's frame" below.

## Metadata: EXIF, then a sidecar

The wall label on an image's page fills itself from the file's EXIF —
camera, lens, focal length, aperture, shutter, ISO, capture date — so
**the web export has to keep EXIF**. In Lightroom's export dialog that
is Metadata → "All Except Camera Raw Info" (or "All Metadata"); the
options that mention "Camera" strip exactly the exposure fields the
label needs, and "Copyright Only" strips the lot, so the label comes
out empty. Tick "Remove Location Info" while you're there: the site
never reads GPS and the build fails if any built image carries it, but
there is no reason to commit coordinates to git either.

Anything the file gets wrong or lacks goes in a sidecar, `_<basename>.md`
beside the image, whose `title`, `caption` (one paragraph, inline
markdown), `date`, and label fields (`camera`, `lens`, `focalLength`,
`aperture`, `shutter`, `iso`) override what EXIF said, field by field,
as written. Obsidian treats a sidecar as an ordinary note; the leading
underscore is what keeps it out of the pieces collection. A misspelled
field is silently ignored (Obsidian adds properties of its own, so the
schema can't be strict); a field of the wrong type fails the build
naming it.

### The rich page's fields and the story

Since spec 006 the same sidecar carries everything else an image's
page can show — every field optional, every section appearing only
when its fields exist, so most sidecars will stay short:

```yaml
---
title: The bank letting go
caption: One paragraph, *inline markdown* allowed.
date: 2026-08-28 # the label's overrides, each replacing what EXIF said
camera: Leica M6
lens: Summicron 35
focalLength: 35 mm
aperture: f/8
shutter: 1/250 s
iso: ISO 400
place: The headlands above the cove # prose, never coordinates
time: 06:40 — forty minutes before sunrise, late November
format: Digital, full-frame # "How it was made", with the three below
filters: None
support: Tripod, two-second timer
processing: Single frame. Lifted the shadows on the ridge…
edition: Open edition, signed on the back # "The print", with the two below
sizes: 12 × 18, 16 × 24, and 24 × 36 inches
paper: Hahnemühle Photo Rag Baryta
---

The body is the photograph's story: ordinary markdown, in your own
words, rendered under the title ahead of the wall label. The block
vocabulary works here too (a diptych in a story is legal), though
plain prose is the expectation.
```

**A story is prose — no holds, no pauses.** The image page renders the
story through the same pipeline, but not through the piece page's
script, so a `pause` written in a sidecar never dims and a `held`
frame never keeps the header away; the bled shapes assume the piece
page's column besides. Write those two in a piece, where they work.

The page also quotes **the passage** of the piece the image sits in:
the nearest paragraph before the block that first places it, plus that
block's caption where it has one. Only caption-bodied blocks
contribute the caption — the container forms of `single`, `wide`,
`tall`, `fullbleed`, `inset`, `diptych`, `triptych`, and the caption
line of a `grid` or `strip`. The body of a `held`, `row`, or `aside`
is the piece's own prose, not a caption, so it never appears on the
image page. If you want words quoted there, write them as the block's
caption, not beside the frame.

The page's headings and row names ("How it was made", "Ask about a
print"…) live in one block at the top of
`src/pages/images/[...id].astro` — retune them there.

### The camera's frame

To show the raw-to-finished compare, export the camera's frame — the
unprocessed file, at web size like everything else — and drop it
beside the photograph under the same name with a leading underscore:
`_land-b.jpg` beside `land-b.jpg` (any accepted extension; the two
need not match). Nothing to declare: the site finds it. One frame per
photograph. The frame is private — no page, never in a gallery, never
placed in a piece; a frame with no photograph beside it fails the
build naming the file, as a stray sidecar does. Two relations share
one prefix, deliberately: `_land-b.md` is _about_ `land-b.jpg`, and
`_land-b.jpg` is _the raw of_ `land-b.jpg`. Strip location metadata
from the frame's export as from any other (the build fails on GPS in
the output either way).

## The two blocks that take time

Most blocks are a shape on the page. `held` and `pause` (spec 007)
spend the reader's scrolling instead, and each asks something of the
writing around it.

### A held image

A container whose body is the prose that passes beside the frame while
the frame stays put:

```markdown
:::held{src="./land-b.jpg" alt="The ridgeline emerging" side="right"}
The paragraphs that pass beside the frame.

As many as the frame deserves.
:::
```

`side` puts the frame on the `left` (the default) or the `right`, and
the bare `bleed` flag runs it out to the viewport's edge with the
prose keeping its column on the other side. The body is prose only —
a markdown image or another directive inside it fails the build,
because the body is the piece's own writing, not a caption.

**Write enough for the frame, or don't hold it.** The frame lets go as
the last line passes it and never after: the site will not pad a hold
out with empty scroll, so the hold lasts exactly as long as the words
outlast the frame. A tall vertical beside three short paragraphs holds
for a moment and releases, which reads as a stutter rather than a
hold. On a laptop screen a landscape frame takes about five paragraphs
to outlast, a full-height vertical about eight — the sampler piece
(`src/content/pieces/vocabulary-sampler/`) is the calibration. Count
the paragraphs before deciding a photograph deserves a hold.

**No hold where no column fits.** The frame is sized from its own ratio
and the height it may use, so on a portrait viewport a landscape frame
leaves no room for a reading column: there it renders as an ordinary
figure at the full width with its words after it. A portrait frame
keeps its column on a portrait screen, and on a phone nothing is held
at all. Write the body so it reads as plain paragraphs too — that is
what a phone reader gets.

### A pause

A leaf, one image, nothing else:

```markdown
::pause{src="./pano.jpg" alt="The full sweep of coastline"}
```

The frame arrives an ordinary figure's margin below the last
paragraph, pins at the centre of the screen, and the page's lights go
down and back up as the reader scrolls through it.

**A pause has nothing to read.** No caption, no body — the container
form fails the build saying so. Whatever needs saying goes in the
paragraph before it or the paragraph after. A pause suits the frame
too wide to hold beside words, and it costs the reader the frame's own
height plus 1.2 screens of scrolling, so one or two in a piece is the
dose.

The header stays away for the whole of a pause and while any frame is
held, and it stays away even if a keyboard reader tabs into the nav
mid-scene — the links are focusable but off-screen until the scene
releases. Known and accepted (spec 007); worth remembering if a piece
is nothing but held frames end to end.

Neither block takes tuning attributes beyond `side` and `bleed`. The
hold's margin, the reading measure, the pause's length, how far the
lights go down and how close the frame comes are site knobs, so every
hold and every pause on the site reads the same.

## Curating a gallery

A gallery is one file in `src/content/galleries/`: a title, one
category, an optional description and date, an ordered list of image
ids, and an optional cover (defaults to the first image). Ids are
`<piece-folder>/<basename>` for a piece's image and
`gallery/<basename>` for one in `src/content/gallery-images/`. The
order is the order on the page; the layout packs rows so every image
in a row renders at the same short side, and it never reorders to fill
a row — so a lone frame before a panorama sits centered in a short row
by design. The build refuses a missing, duplicate, or draft-owned id
and names the file and line. Images that belong to no piece go in
`gallery-images/`, flat, and have no draft flag: to unpublish one,
delete it.

## Hard-won syntax rules

Learned by breaking them — each of these fails quietly if violated:

- **`---` must be the literal first line of the file** or frontmatter
  doesn't parse anywhere, in Obsidian or the build.
- **Directives go on their own line.** A `::name{...}` typed
  mid-paragraph is not a block: the site renders it as literal text
  (attributes included, normalized to `key="value"` form), and the
  Obsidian plugin — anchored to whole
  lines since 0.2.0 — leaves it raw too, so the two agree.
- **Captions go in the container body**, not in a `[label]`:
  `:::single{src="…" alt="…"}` / caption text / `:::`. A `[label]` on
  either form fails the build rather than silently vanishing.
- **`grid` and `strip` take their images in the body** — plain
  markdown images, one per line — and any text after a blank line is
  the caption. Mixing images and text in the same paragraph fails with
  a hint to add the blank line.
- **Blocks don't nest.** A block directive inside another block's body
  fails the build.
- **`bleed` is a flag on `held` and an enum on `wide`.** A held image
  takes it bare — `{bleed}` — and bleeds on whichever side `side`
  already gave the frame; `bleed="left"` there fails telling you to
  drop the value. A `wide` takes the side as the value —
  `bleed="left"` or `bleed="right"` — and a bare `{bleed}` there fails
  as an invalid value, since it has no side to inherit.
- **Images must live in the vault**, in the piece's own folder
  (`src/content/pieces/<slug>/`). Absolute OS paths (`~/Downloads/...`)
  resolve nowhere — not in Obsidian's preview, not in the build. The
  plugin's dashed "not found" box is telling the truth about what
  production would do.

## Linking practice

Type `[[`, pick the note, and a standard markdown link gets inserted.
Those links feed backlinks and the graph the same as wiki-links would —
no Obsidian feature is lost by the wikilinks-off setting.

One known seam: a link from one piece to another resolves inside the
vault but is not yet rewritten to its published URL
(`/pieces/<slug>/`) at build time. That transform is logged in
`ROADMAP.md` and becomes necessary the day the first cross-piece link
is written. Fine to write such links now; they just aren't live on the
site yet.

The one exception in the content as written: the paragraph after the
vocabulary sampler's pause links to the sampler itself as a
site-absolute URL (`/pieces/vocabulary-sampler/`). That link exists to
prove a link fades with the pause's lights, which needs a link the
built page actually renders — and the rewrite above doesn't exist
yet. When it does, that link becomes a vault-relative one like every
other.

## The writing loop

Obsidian on one side, a browser tab running `npm run dev` on the
other. Save in Obsidian, the tab hot-reloads. Single images are plain
markdown (`![alt](./photo.jpg)`) and preview natively in Obsidian;
special treatments use directives and render via the plugin. Publish
is `git commit` + `git push` from the repo — though until spec 005
executes, a push updates only the private repo; nothing deploys
anywhere.

One limit of the loop: the image registry is built once per dev-server
run. Text edits hot-reload; **adding, removing, or renaming images,
sidecars, or galleries needs `npm run dev` restarted** before their
pages, links, and validation catch up. (For the record, `astro build`
caches rendered pieces by content digest in
`node_modules/.astro/data-store.json`; a change to the remark
transform itself doesn't show in a local build until that file is
deleted. CI builds fresh.)

## Deliberately no methodology

No Zettelkasten, no PARA, no tagging discipline. Frontmatter that has
to be written anyway, plus `[[` links whenever a connection genuinely
occurs, is the entire system — the graph is a byproduct of writing,
not a thing to maintain. If using Obsidian starts feeling like a
second project, that's the signal it's gone past what this setup
needs.

## Image exports, not masters

Commit web-sized exports to the piece folder — roughly 2560px on the
long edge, 1–3MB. Never RAW files or full-resolution masters: git
history keeps every byte forever, and the build only needs enough
pixels for its largest responsive variant. Masters live in the photo
archive, not the repo. (Decision and numbers: `DECISIONS.md`, "Images
stay committed to git".) And **never bake a matte into the file**:
the site applies every matte itself (spec 003), so a pre-matted export
would render double-matted and lie to the layout math.
