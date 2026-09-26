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
│       ├── galleries/          <- one file per gallery
│       └── places/             <- one file per place (spec 009)
├── notes/                      <- private second-brain material
└── templates/                  <- Obsidian template files
```

Why this shape:

- **Astro only reads its configured content directory**, so nothing
  outside `src/content/` can leak into the built site.
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
  `::triptych`) shows its image while you write, and one container,
  `:::compare`, shows its stages' images with their labels beneath.
  Everything else is raw text by construction — the other container
  forms (captions), and the container-only `grid`, `strip`, `aside`,
  `row`, and `held` — and the site build is the truth for those, as it
  is for how a compare actually behaves. On the site, the frames you
  place animate by the site's own rules — they fade in as they load and
  as they scroll into view, and travel into their pages when clicked —
  so there is nothing to author for motion, and the plugin does not
  change. Live Preview only — Reading
  view is intentionally out of scope (see `DECISIONS.md`). Build/install instructions:
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
at:
draft: true
---
```

`categories` values: `landscape`, `street`, `portrait`, `event`.
`at`: the slug of a declared place — the default for every frame in
the folder that names none — see "Places" below.

Three more skeletons worth keeping in `templates/` (spec 004 — the
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
at:
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

saved in `src/content/galleries/`, and

```markdown
---
title:
description:
cover:
draft: true
---

Why you keep going back.
```

saved in `src/content/places/` (spec 009 — "Places" below).

## A piece folder is public territory

Since spec 004 every accepted image in a published piece's folder has
its own page at `/images/<piece-folder>/<basename>/` — whether or not
the piece's text references it. Consequences worth internalizing:

- **Don't park alternates in the folder.** An unreferenced frame is
  still published with a page. Keep contact-sheet material in `notes/`
  or the archive; move a frame into the folder when it's chosen.
- **No sub-folders.** A piece's own images live directly in its
  folder; a `detail/` folder is ignored with a build warning, and a
  directive pointing into one fails the build. A piece may also
  _place_ another piece's photograph, or one from the gallery root, by
  path — see "Borrowing a photograph" below.
- **File names are URLs.** `land-b.jpg` becomes `/images/<slug>/land-b/`.
  Renaming or moving an image — or renaming the folder — changes its
  URL (no redirects yet — nothing is live), so name frames before
  publishing, not after. Since spec 008 a rename also breaks every
  reference to that photograph from another piece; the build fails
  naming each missing file until they are updated.
- **`draft: true` hides the images too.** A gallery that lists one of
  them fails the build until the piece is published, and so does a
  published piece that places one — the message names both pieces. A
  draft piece may place anything.
- **The folder name must be a slug** (`lowercase-with-hyphens`), as
  they all are already — the build says so, with the fix, if not.
- **An underscore makes a file private.** `_land-b.jpg` beside
  `land-b.jpg` is that photograph's camera's frame (spec 006);
  `_land-b.tones.jpg` is one of its stages, and `_land-b.detail.jpg`
  its larger export for the loupe (spec 019). None gets a page or can
  be listed in a gallery, and a piece may place one only as a stage of
  a `compare` in the same folder — anywhere else fails the build. See
  "The private files" below.

### Borrowing a photograph

A piece writes its own images as `./<file>`. Since spec 008 two more
shapes reach out of the folder:

```md
::single{src="../where-the-fog-lets-go/land-b.jpg" alt="The ridgeline emerging from fog"}

![A dock at the water's edge](../../gallery-images/dock-a.jpg)
```

`../<other-piece-slug>/<file>` is another piece's photograph;
`../../gallery-images/<file>` is one from the gallery root. Both work
everywhere an image is written — every block, the `diptych` and
`triptych` slots, `grid` and `strip` bodies, `held`, the
plain `![alt](…)` shorthand, and the `cover` field in frontmatter.
Obsidian previews them as it previews any image, because the path is
real.

The photograph keeps its home. Its id, its page's URL, "From the
piece", the quoted passage, the related frames, the categories, and
the title stay the home folder's — nothing moves and nothing is
duplicated. The alt written in the borrowing piece is used for that
image element and nowhere else.

The photograph's page says where else it appears: below "From the
piece" — or in its place, for a gallery-root photograph — an "Also
in" line links every other published piece that places it, newest
first.
The arrows follow the reader: arriving from a borrowing piece they
step through that piece's frames with the borrowed one in its place;
arriving from the home piece or a gallery, as before. A piece that
borrows a photograph only as its `cover` is named under "Also in" but
gets no arrows for it — a cover has no place in the reading order.

The sampler's "Borrowed" section
(`src/content/pieces/vocabulary-sampler/`) is the standing example,
its borrowed cover included.

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

### Gear names

The label prints the camera and the lens by name rather than as the
camera wrote them: `ILCE-7RM4` in the file reads "Sony α7R IV" on the
page. The names live in one hand-edited file, `src/content/gear.md` —
it opens in the vault as a note, and nothing regenerates it — one line
per string, under `## Cameras` or `## Lenses`:

```markdown
## Cameras

- `ILCE-7RM4` = Sony α7R IV

## Lenses

- `FE 16-35mm F2.8 GM II` = Sony FE 16-35mm f/2.8 GM II
```

A dash, the string exactly as the file's EXIF carries it in backticks,
an equals sign, then the name to print. A camera is keyed by its model
alone, and its line is the whole name. The file's title and a
paragraph may sit above the first list; inside a list, only entries,
blank lines and one-line `<!-- … -->` comments. **A malformed table
fails the build** — a line in any other shape, or a string listed
twice in one list — naming the file and the line. **A string the
table lacks only warns**: the build prints one `[gear]` line for each,
naming the first file that carries it, and the label prints what it
printed before the table existed until a line is added. A sidecar's
own `camera:` or `lens:` still wins over the table. The table is read
where the image registry is built, so restart `npm run dev` to see an
edit, as for a new image ("The writing loop" below).

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
at: the-headlands # the declared place's slug — the wall label links to it; `none` opts out of the piece's default
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

`place` and `at` are two properties, not one: `place` is the prose the
label shows, `at` is the slug of a declared place, which the label
links to — see "Places" below.

**A story is prose — no holds.** The image page renders the story
through the same pipeline, but not through the piece page's script,
so a `held` frame written in a sidecar never keeps the header away;
the bled shapes assume the piece page's column besides. Write it in a
piece, where it works.

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

## The private files

A photograph can carry three kinds of private file: rasters beside it,
named for it, with a leading underscore (spec 006, widened at spec
019). Any accepted extension, and it need not match the photograph's.

- **The camera's frame** — `_land-b.jpg` beside `land-b.jpg`: the
  unprocessed file, at web size like everything else. One per
  photograph. Nothing to declare: the site finds it, and it is the
  first stage of the compare on the photograph's page.
- **A stage** — `_land-b.tones.jpg`: one step between the camera's
  frame and the finished photograph, the word after the basename
  naming it for you (`tones`, `crop`, `dodge` — any word but
  `detail`). As many as the photograph took. A stage shows where you
  put it: in a `compare` block, or on the image page when the sidecar
  lists it.
- **The larger export** — `_land-b.detail.jpg`: the finished
  photograph exported bigger, for the loupe alone. One per photograph,
  found by name like the frame ("The larger export" below).

Two relations share one prefix, deliberately: `_land-b.md` is _about_
`land-b.jpg`, and every `_land-b…` raster is _part of the making of_
it. None of them is an image of the site — no page, never in a
gallery — and the one place a piece may write one is as a stage of a
`compare` in its own folder. The build fails, naming the file:

- a private file with no photograph beside it (`_land-c.tones.jpg`
  with no `land-c.jpg`), as a stray sidecar does;
- a second camera's frame, or a second larger export, for one
  photograph;
- a private file placed anywhere else — another block, the plain
  `![alt](…)` shorthand, a `cover` — or listed in a gallery;
- a private file of another folder in a `compare`: a piece may borrow
  another piece's finished photograph, not its making-of.

Strip location metadata from every one of these exports as from any
other (the build fails on GPS in the output either way).

### A compare in a piece

A `compare` shows one photograph's stages one against another — the
camera's frame, the steps between, the finished photograph:

```markdown
:::compare{mode="slider"}
![Camera](./_land-b.jpg) Straight out of the camera, flat profile.
![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.
![Finished](./land-b.jpg) A touch of warmth over the whole frame.
:::
```

Container form only, one stage per line. **A stage is an image whose
text is its label, the text to the next image its note** — a label of
a word or two, which is also the image's alt text, and a note of a
sentence or a short paragraph, inline markdown allowed. A later
paragraph without an image joins the previous note, so a blank line
between stages changes nothing, and text written after the last stage
becomes the finished stage's note: the block has no caption of its
own. The build fails on

- fewer than two stages;
- a stage without its label — `![](./_land-b.jpg)`;
- anything in the body but stages: text before the first image, a
  list, a heading, another block;
- a missing file, or a private file from another folder. A private
  file comes from the block's own folder (`./_land-b.jpg`); a public
  photograph may be borrowed by path, as anywhere ("Borrowing a
  photograph" above).

A stage links nowhere, and its label never becomes the photograph's
title on its page: a compare's image text names a stage, it does not
describe the photograph.

`mode` picks the way the compare opens: `slider` (the default),
`side`, or `switch`. The reader can change it with the "How to
compare" control on the row beneath, and their choice holds for every
compare they open in that tab, outranking the `mode` written, until
the tab closes. The three ways:

- **Slider** — two stages in one frame, wiping between them: drag the
  handle, or use the arrow keys. At rest it shows the first stage
  against the last — Camera | Finished above — with the handle in the
  middle. The legend of stage names beneath picks the pair: the first
  click sets the left side, the next the right, and any stage can be
  picked at any step, so every pair is two clicks away.
- **Side by side** — the same pair next to each other, picked in the
  legend the same way, and the one way that runs wider than the text
  column. Where two won't fit — on a phone — they stack.
- **Switch** — one stage at a time, in the column: a click or tap on
  the photograph, Space, Enter or → moves to the next, ← steps back,
  and the last wraps to the first.

Without script the compare is its stages one under another, each with
its label and note. In Obsidian's Live Preview it shows its stages'
images in a row, each with its label beneath — no notes, no slider;
put the cursor in the block and it turns back into its text, and a
file that isn't there shows the dashed "not found" box.

A piece may write several compares over the same stages — Camera
against Finished early on, Tones against Finished further down, each
a subset. They ask for the same files, so a reader downloads each
stage once. The same block in a sidecar's story puts the compare in
the writing, and the page's own "Raw to finished" section steps aside.

### Stages on the image page

Without writing a block, a photograph's page shows its compare in a
"Raw to finished" section whenever it has a camera's frame or its
sidecar lists a stage. List the stages in the sidecar:

```yaml
stages:
  - file: _land-b.tones.jpg
    label: Tones
    note: Shadows lifted on the ridge, the fog's highlights held.
```

and drop `_land-b.tones.jpg` beside the photograph. The section shows
the camera's frame first when there is one, labelled Camera, with the
site's own note ("The RAW file straight out of camera — no edits, no
adjustments"); then the listed stages in the order written; then the
finished photograph, labelled Finished, whose note is the sidecar's
`processing:` line when it has one. It is the same compare as the
block, with the same three ways; it opens as the slider unless the
reader has already chosen another way in that tab.

`label` is required, `note` optional. **A note is one paragraph**,
inline markdown allowed. The frame and the finished photograph are
implied — never list them. A listed `file` that is not a stage of this
photograph — a typo, another photograph's stage, the camera's frame,
the larger export — fails the build naming the sidecar, and so does a
file listed twice. A stage file the sidecar doesn't list stays off the
page; a `compare` in a piece can still show it.

### The larger export

In the quiet view, a click on the photograph opens the loupe: it zooms
to full detail, one pixel of the file to one pixel of the screen, and
follows the mouse. By default it reads the photograph's own file, and
only where that file has detail to add at the screen's size. For more,
export the finished photograph larger as `_land-b.detail.jpg` beside
`land-b.jpg`. Nothing to declare: the loupe finds it, and nothing else
uses it — the build checks that no page, feed or gallery names it.

- **Size** — 4000px on the long edge is the recommendation, limited
  by the camera's resolution: a sensor with fewer pixels than that
  gives what it has. The size is your call per photograph.
- **Location** — strip it on export, as for every file ("Metadata:
  EXIF, then a sidecar" above); the build's GPS check covers the
  loupe's file like every image it ships.
- **The ceiling** — the site makes the loupe's file from the export at
  its full size, and the host takes no file over 25 MiB (Cloudflare
  Workers static assets' per-file limit): the build fails naming the
  file if one comes out larger. A 4000px export is far below it.

## The block that takes time

Most blocks are a shape on the page. `held` (spec 007) spends the
reader's scrolling instead, and asks something of the writing around
it.

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
outlast the frame. A frame taller than its prose does not hold at all —
the row is only as tall as the frame, so there is nothing to stick
through — it sits in the flow with the words beside it. On a laptop
screen a landscape frame takes about five paragraphs to outlast, a
full-height vertical about eight — the sampler piece
(`src/content/pieces/vocabulary-sampler/`) is the calibration. Count the
paragraphs before deciding a photograph deserves a hold.

**No hold where no column fits.** The frame is sized from its own ratio
and the height it may use, so on a portrait viewport a landscape frame
leaves no room for a reading column: there it renders as an ordinary
figure at the full width with its words after it. A portrait frame
keeps its column on a portrait screen, and on a phone nothing is held
at all. Write the body so it reads as plain paragraphs too — that is
what a phone reader gets.

The header stays away while any frame is held, and it stays away even
if a keyboard reader tabs into the nav mid-hold — the links are
focusable but off-screen until the frame lets go. Known and accepted
(spec 007); worth remembering if a piece is nothing but held frames end
to end.

`held` takes no tuning attributes beyond `side` and `bleed`; the hold's
margin and the reading measure are site knobs, so every hold reads the
same.

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

## Places

A place is somewhere you keep going back to: declared once, then grown
by the photographs that name it. One file in `src/content/places/`
— a title, an optional description, an optional cover (the id of one
of the place's own frames), an optional `draft`, and a body that is
your writing about the place. The file name is the slug and the URL,
so it is lowercase letters, digits, and hyphens only; `none` is
refused, because that is the word for no place. The writing is prose:
no photograph lives beside a place file, and the place's photographs
are the frames below it.

A frame says where it was made in its sidecar, `at: <slug>`. A piece
shot entirely in one place says it once instead, `at: <slug>` in its
frontmatter, and every frame in its folder that names no place of its
own is taken to be there; a frame's own line always wins, and
`at: none` keeps a frame out of its piece's default. A piece that sets
no default imposes none: its frames are wherever their own lines
say, and a frame that says nothing is at no place (`at: none` on a
piece means the same as leaving the line out — Obsidian will offer
the value there, since the property is shared). `at` is a
slug wherever it is written — on a piece and on a sidecar alike —
while the sidecar's `place` stays prose for the wall label; they are
two properties, so Obsidian's autocomplete offers each its own values
and keeps them apart.

```
# the piece: src/content/pieces/where-the-fog-lets-go/index.md
at: the-headlands # the default for every frame in the folder

# a frame that was elsewhere: _pano.md
at: none # shot on the drive home
place: The road home, from the car window # the label shows the text alone

# a frame at another place: _land-c.md
at: the-jetty # its own line wins over the piece's default
```

`/places/<slug>/` shows the title, the description, a summary line
("N outings · M frames · 2019–2026", the years being the outings'
publish years), your writing, and then one wall — every published
frame at the place as a single packed gallery, at the galleries'
width, gap, and density. The order is the outings oldest first, each
piece's frames in the piece's own order, with no heading, date, or
divider between one visit and the next. The page names no piece
anywhere; a frame's own page says which piece it came from and links
there. That is the whole act of adding photographs: publish a
piece whose frames name the place, and the page grows. A borrowed
photograph stays with its home piece, never counted twice.
`/places/` lists the places as cards, most recent outing first, and
Places is in the nav after Galleries. On a photograph's page the
label's place is the place's title as a link,
with the sidecar's free text after it where there is any, and arrows
from a place step through that place's frames.

The build refuses an `at:` naming a place that does not exist — on a
piece or a sidecar, draft or not — and lists the places that do; it
refuses a `cover` that is not one of the place's frames, once the
place publishes. A draft place and a place with no published frame
yet get a note, not a failure: no page, no card, and their frames
show no place, so a place can be declared ahead of its first outing.
A gallery-root photograph still cannot join a place: belonging to no
piece, it has no publish date to take its turn by in the wall's order
(`ROADMAP.md`). Its `at:` is checked for the slug and then ignored
with a warning naming the file.

## Hard-won syntax rules

**A frame's shape picks its treatment.** `fullbleed` never scales
down: it runs edge to edge and its height follows the frame's ratio,
so a 3:2 frame is taller than a 16:10 laptop screen and the reader
scrolls through it. Use `fullbleed` for frames wider than the screens
you care about — 16:9 and panoramas — and `wide` for a 3:2 that
should be seen whole. A `tall` caps at about 85 percent of the
viewport's height, so a vertical can be centred on the screen while
scrolling; a `held` vertical uses the whole hold height beside its
words instead.

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
- **Images must live in the vault**, written as one of three paths:
  the piece's own image as `./<file>`, another piece's as
  `../<slug>/<file>`, a gallery-root one as
  `../../gallery-images/<file>` ("Borrowing a photograph" above). Any
  other relative shape — a sub-folder, a further level up, a home-dir
  path (`~/Downloads/...`), which resolves nowhere in Obsidian's
  preview either — fails the build with a message naming those three;
  so does the long way of writing your own image
  (`../<own-slug>/<file>`), refused with the hint to write `./<file>`.
  A remote `https://…` src (any `scheme:` src) and a root-absolute
  `/…` one are left to Astro, unchecked by this rule and without a
  page. Only an accepted raster
  can be borrowed, so a `.tif` beside a `.jpg` is refused rather than
  quietly taking the jpg's page, and a borrowed path that points at
  nothing fails with the same missing-file message a local image gets.
  The plugin resolves a path with a folder in it from the note's
  folder, as the build resolves it, so a wrong `../` path shows the
  dashed "not found" box instead of a same-named file from somewhere
  else; it checks the path's existence, not its shape, so the build
  is still the judge of which shapes are allowed.

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
stay committed to git".) The one larger file is the loupe's export,
at most one per photograph, about 4000px — "The larger export" above.
And **never bake a matte into the file**:
the site mats the frames it mats itself, and since spec 017 that is
the image page's quiet view alone. Every other frame — in a piece, in
a gallery, or on the image page's stage on paper — sits on the ground
unmatted. So a baked mat would be the only mat in a piece, white
around one photograph in a reading flow where nothing else has any;
in the quiet view it would render double-matted, the site measuring
its own share — 6% of the
photograph's rendered short side, between 4px and 40px, spec 003 and
spec 013 — over your baked one as if that were part of the picture; and
anywhere it would lie to the layout math that counts the mat. Two
frames carry no measured ratio — an image inside a link you write
yourself in prose (`[![alt](./a.jpg)](…)`), and a local non-raster (an
SVG, say) with alt text. Both used to wear a mat computed as if the
photograph were square; they are unmatted now, so the missing ratio no
longer sizes anything on them.
