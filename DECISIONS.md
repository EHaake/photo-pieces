# Decisions

Business, product, and process context that doesn't fit the structured
docs — naming rationale, tooling choices, comparisons between options
that were considered and passed on. Keeps `plan.md` from accumulating
things that aren't actually technical design, and keeps this reasoning
from being lost the moment a chat conversation ends.

## Base theme: astro-keel

Five Astro themes were compared against real reference images before
forking one as the site's foundation:

- **refined-x** — ruled out. Its standout feature, "Ask this site," is
  a chat interface wired to a live MCP server (NLWeb-compatible), not a
  static search index — that needs a running backend, which conflicts
  with the static-only, no-server rule in `CLAUDE.md`. Also visually
  busy with agent-infrastructure chrome (`llms.txt`, `openapi.json`,
  MCP-discovery links) irrelevant to a photography audience.
- **astro-tone** — not chosen as the fork base, but its architecture
  informed the project regardless: a single token file controlling all
  color/spacing/type theme-wide, and an explicit "two or three custom
  blocks per post is plenty" philosophy that's essentially the closed
  block vocabulary already committed to in `CLAUDE.md`.
- **astro-sienna** — not chosen (skews warm/editorial-tech rather than
  the neutral direction wanted), but its image pipeline — Zod-validated
  frontmatter, build-time resize/re-encode/content-hash, lazy-loaded
  body images, eager-loaded cover — is worth referencing when the real
  image pipeline gets built, independent of which theme's skin won.
- **template-journal** — not chosen as a fork base at all: it's a
  commercial template (linked to a paid marketplace), not an
  open-source repo. Still the best reference seen for how a piece
  should _feel_ — large cover-led entries, generous whitespace,
  essay-first framing.
- **astro-keel** — chosen. Its own stated design philosophy ("readable
  first, decorative last") matches the target aesthetic almost
  word-for-word: a single accent color carried through thin structural
  rules, a steady baseline rhythm for long-form reading, distinct
  light/dark values both clearly designed. (Dark mode was later dropped
  entirely — see `spec.md` — but the light-mode system it left behind
  was the actual reason for picking this theme.)

## CMS: none adopted; Keystatic is the leading candidate if ever needed

`spec.md` records the actual decision — no CMS for v1, the Obsidian +
`astro dev` live-preview loop covers the need. This is the tooling
comparison behind that, kept for whenever it's revisited:

- **Keystatic** — cleanest Astro-specific integration seen, with a
  genuinely usable editor and support for custom component blocks
  matching the directive-based block vocabulary. Runs in local mode
  (filesystem) or GitHub mode (API-backed), no database. Sources
  disagreed on maturity — one flagged it as still experimental, another
  called it the best git-based CMS available for Astro today.
- **TinaCMS** — true in-context visual editing, a real differentiator
  over Keystatic. Worse fit for this stack specifically: visual editing
  needs React-hook instrumentation, and Astro support is explicitly
  experimental. Shines on Next.js, not here.
- **EmDash** — ruled out; a different category of tool than a
  comparison, really. It's database-backed (SQLite locally, Cloudflare
  D1 in production), which conflicts with the file-based, git-based
  content model chosen for this project — not a stylistic mismatch, an
  architectural one. Also still in beta (launched this year) — real
  maturity risk for a project meant to last decades. _(Relocated here
  from `spec.md`, where it was originally logged as a resolved
  decision — this is a tooling comparison, not a spec-level behavior
  decision.)_

## Repository naming: `photo-pieces`

Domain is `erikhaakephoto.com` (already the plan), so the repo name
never needed to carry brand weight — just needed to be descriptive
without undermining the project's own framing.

Considered and passed on:

- **"Photography Portfolio Site"** — too generic to mean anything, and
  not usable as-typed anyway (repo names are conventionally
  lowercase-with-hyphens).
- **"portfolio-pieces"** — closer, but re-introduces the exact word the
  whole project has been de-emphasizing. Pieces were never meant to be
  a flavor of portfolio-as-gallery — they're the alternative to
  gallery-first browsing, with galleries kept as secondary. Putting
  "portfolio" back in the name quietly re-centers that framing.

Landed on **`photo-pieces`** — keeps "pieces," the one word that's done
real conceptual work throughout every document, without reintroducing
the word the project deliberately moved away from.

## Obsidian live-preview plugin: fullbleed only, approximation accepted

Built rather than deferred, once the actual bar was clarified: not
matching the real site's styling, just seeing an image instead of raw
directive text while writing in Live Preview. That's a much smaller
target than a Reading-View-and-Live-Preview, style-matched renderer —
a single CodeMirror 6 `StateField` supplying the decorations (it began
as a `ViewPlugin`, but CodeMirror requires block decorations to come
from a `StateField` — the cause of the 0.1.0 editor crash), using a
plain regex rather than a full remark-directive parser, since it only
needs to recognize the one
block type actually built on the Astro side so far (`fullbleed`).
Reading View is intentionally not handled — Live Preview is the mode
actually used while writing, which is the specific problem this
solves.

Source lives in `obsidian-plugin/` in this repo. _Superseded in part
by spec 003 — see "Spec 003: breadth over demand-driven growth; plugin
approximations" below: the plugin now renders every standalone leaf
block; container forms stay raw._

## Markdown processor: legacy remark pipeline kept over Sätteri

Astro 7's default Markdown processor is Sätteri, which implements
directives natively but does not run remark/rehype plugins at all.
This project's `astro.config.mjs` opts into the legacy unified
pipeline (`markdown.processor: unified({...})`) — a deliberate
commitment, recorded here after the T004 review flagged it as
undocumented: the block vocabulary is built on `remark-directive`
plus a custom remark transform, and the transform's whole mechanism
(emitting mdast image nodes for Astro's collector to optimize)
depends on the remark plugin hooks Sätteri removes. Revisit only if
the unified path is ever deprecated outright; the ROADMAP item about
rewriting internal vault links at build time is the natural moment to
re-evaluate, since Sätteri handles wikilinks natively.

## Hosting: Cloudflare Workers static assets

Chosen at spec 002 review against GitHub Pages and Netlify, on the
photographer's criteria (stability, low ongoing hassle, free/cheap,
push-to-deploy testing before anything is publicly live):

- **Netlify** — ruled out: accounts created after Sept 2025 sit on a
  300-credit/month pool shared across bandwidth, builds, and compute;
  the most restrictive free tier of the three for an image-heavy site,
  with expensive overages. Its built-in form handling (relevant to the
  roadmapped contact form) has good free alternatives.
- **GitHub Pages** — closest second: zero new accounts, the deploy
  workflow already ships in the repo, and unmatched platform
  stability. Passed on because a photography site is the genre most
  likely to meet its soft ~1GB site / ~100GB-month limits, it has no
  per-branch preview URLs, and its project-page base path makes test
  and live URL structures differ.
- **Cloudflare Workers (static assets)** — chosen: unlimited free
  static-asset bandwidth (the criterion that compounds as a photo site
  grows), git-connected deploys with per-branch preview URLs, a free
  workers.dev subdomain for the whole pre-live phase, and identical
  URL structure between test and live. Known trade-off, accepted:
  Cloudflare's recommended path churned once recently (Pages →
  Workers), so this is guidance-stable, not GitHub-Pages-stable.
  Workers static assets, not the legacy-track Pages product.

The domain (erikhaakephoto.com) stays registered at Squarespace with
DNS pointed at Cloudflare when the flip happens — no registration
transfer required or planned.

Post-decision cleanup (caught by 002's pre-merge review): the theme's
GitHub Pages workflow (`.github/workflows/deploy.yml`) was still armed
to publish on every push to `main` — removed, since Pages lost the
comparison and the go-live pause forbids any auto-publish. CI
(`ci.yml`) stays, and now runs the unit suite too.

## Go-live paused; repo private; images stay in git for now

Three decisions from spec 002's Phase 3 review (2026-08-31):

- **Public availability is paused.** Deploy, domain flip, and the
  author-content tasks moved to `specs/005-going-live/` (deferred).
  The order the photographer wants before anyone sees the site: block
  vocabulary (003), sample pieces written against it, galleries (004).
  Until then the site is `npm run dev` only.
- **The GitHub repo went private** for the pre-launch period — a
  public repo would have exposed pieces and photos before launch.
  Cloudflare Workers Builds supports private repos, so the eventual
  deploy is unaffected. Revisit visibility at launch (the
  workflow-demonstration value of a public repo returns once the site
  itself is public).
- **Images stay committed to git, export-sized.** Asked directly
  whether a separate asset store should come first, the answer stays
  what the constitution says: not until repo size or clone speed is a
  real problem. Visitors never receive committed originals — the build
  generates optimized derivatives — so the only cost is repo growth.
  Practice that keeps that cost low: commit web exports (~2560px long
  edge, 1–3MB), never RAW or full-res masters; at that size, ~100
  pieces ≈ 1GB. When the trigger fires, the likely destination is
  Cloudflare R2 (same account as hosting); the remark transform is the
  single seam where relative paths would become store URLs, so pieces
  themselves won't change. Git LFS was considered and rejected: it
  complicates CI and its bandwidth pricing punishes exactly this use.

## Mattes: site-applied, never baked into files

Surfaced at spec 003 review: the photographer mattes every image they
present, on every channel — so the site presents images matted, and
the design brief's skeuomorphism ban was amended (its own commit) to
carve out the flat matte specifically. Frames, shadows, bevels, and
textures remain banned; the matte is a flat, token-driven color field.

How to apply them was compared directly:

- **Baked into uploaded files** — rejected: retuning means
  re-exporting every image ever committed; files become unusable
  elsewhere without double-matting; the matte shrinks with the image
  on small viewports; srcset pixels are wasted on matte; and every
  aspect ratio lies to the layout math (including diptych/triptych
  centered alignment).
- **Applied by site CSS** — chosen: one token retunes all mattes;
  source files stay clean exports; responsive behavior is controlled;
  the pipeline's dimensions stay honest; edge-to-edge treatments
  (fullbleed, tall, strip) can stay unmatted since the bleed is the
  point.

Spec 013 re-asked the first question — whether the site mattes at all,
and where — at a sampler gate on real photographs (2026-09-17), and the
answer was yes on every surface. This decision and the design brief's
flat-matte carve-out therefore stand as written. What changed is the
width: the mat is now a share of the frame rather than of the viewport
(see "Spec 013: the mat as a share of the frame" below) — a retune that
only the site-applied choice makes possible, since baked mattes would
have meant re-exporting every image ever committed.

## Ground tone: warmed so the mattes read

At the spec-003 sampler review the pure-white mattes were nearly
invisible against the paper-white page (~1% lightness apart). Four
candidates were compared live on the sampler via a dev-only switcher:
current ground, two warmed grounds, and a hairline mat edge on the
current ground. Chosen: **gallery warm** — background to
oklch(0.968 0.006 95) with surface/soft shifted in step (0.945/0.92)
and the line hue warmed to match. The photographer's read: "initially
looks slightly too warm, but our eyes adjust quickly." The mat-edge
option was rejected as visually noisy; tinted mats were rejected as
inverting the mat-brighter-than-wall logic. Derived copies resynced:
the OG route's bg hex (#f6f4f0) and public/og.jpg.

Still the ground at spec 013, which kept mattes on every surface and so
left this tone alone — but the tone itself is now up for a rethink: at
that gate the photographer read the mattes as possibly not standing out
enough, this warming as possibly not having gone far enough, and asked
for a spec that tries a range of tones (`ROADMAP.md`).

## Header: full width, hides on scroll down

Surfaced at the spec-003 sampler review on the photographer's laptop:
the sticky header inherited the content-width `.section` rule, so an
edge-to-edge image scrolling beneath it showed on both sides of a
narrower header band. Options weighed — full-width sticky, the
headroom pattern (hide on scroll down, reveal on scroll up; the
editorial/portfolio standard), a non-sticky header, and a translucent
header (out: the brief bans glassmorphism). Chosen: full width **and**
hide/reveal, the photographer's own instinct — the width fixes the
bug; the hide/reveal keeps chrome off the photographs while reading,
per the brief's images-as-interface principle. Details that keep it
from being annoying: always visible near the top of the page, an
8px jitter threshold, a reveal when keyboard focus enters the header,
and the global reduced-motion rule collapsing the slide.

## Spec 003: breadth over demand-driven growth; plugin approximations

ROADMAP originally prescribed growing the block vocabulary "from a
concrete list gathered by writing real pieces — not speculatively."
At spec 003 the photographer reversed that deliberately: the vocabulary
was built broad first (eleven treatments plus captions and mattes), on
the reasoning that unused treatments cost little now that the pipeline
is proven, while missing ones interrupt writing. Real writing may still
surface a gap; additions have become cheap (a descriptor, CSS, tests).

The Obsidian plugin's approximation widened accordingly and stays an
approximation: it renders the leaf form of the seven standalone blocks (eight since
spec 007's pause)
(pairs and triptychs as side-by-side thumbnails), anchored to whole
lines so it agrees with the pipeline about mid-paragraph directives,
and no longer shows `alt` as a caption. Container forms — captions,
grid, strip, aside, row, and since spec 007 held — remain raw text in
Live Preview: they need a
real parser, not a line regex, and raw text is honest about the build
being the source of truth. Reading View stays out of scope.

## EXIF via `exifr`; GPS never leaves the build

Spec 004's wall label reads exposure fields from each image file at
build time. `exifr` (7.1.3, pinned) was chosen over `sharp().metadata()`
plus a second decoder: purpose-built, zero transitive dependencies,
and its `pick` option plus `gps: false` let the read be scoped to an
allowlist at the source. It is a single-maintainer package with no
release since 2022 — accepted, because it is small, stable, and does
one thing; if it ever breaks, the reader is one file (`src/lib/exif.mjs`)
behind a pure formatter, and the fixture-backed tests say exactly what
a replacement must return.

The standing constraint is that no location data can reach the site,
enforced three ways because each covers a different failure: the
reader's allowlist (tested against a fixture that carries GPS, and
shown to fail against a naive reader before the test was trusted),
the registry's output shape, and a post-build scan of every raster in
`dist/` (`scripts/check-no-gps.mjs`, wired into `npm run build`'s
`postbuild`, which CI runs — though CI itself has yet to execute for
this repo, see spec 005 — and shown to fail on a planted file). One
fixture image in content carries GPS on purpose so the last barrier
always has something real to strip.

The last barrier caught two real leaks on its first run. First, the
Open Graph request for a 1200px-wide JPEG at 1200px as JPEG: Astro's
service passes the original through untouched when width and format
match the source, so the page's OG image was the file itself, GPS
included (`src/lib/og.ts` now asks for one pixel less in that case).
Second, and larger: Astro emits every ESM-imported image into
`dist/_astro/` as an untouched original so its service can read it,
and is meant to delete the ones nothing references afterwards — but
in this static build its "referenced outside processing" check marks
every imported image (piece covers and registry imports alike), so
33 originals shipped unlinked from any page, metadata and all. It
predates spec 004 (covers were already imported) and is Astro's
behavior, not the registry's. `scripts/prune-unreferenced-originals.mjs`
now does the deletion Astro meant to, in `postbuild` before the scan:
an original with transform siblings that no file in `dist/` mentions
is removed. If Astro fixes the check the pruner becomes a no-op; the
scan stays regardless.

## Category browsing: one route family, not per-genre sections

Spec 001 ruled out per-genre site sections; spec 004 needed category
browsing anyway (galleries grouped by category, pieces filterable).
Chosen at plan review: a single `/categories/<category>/` route family
listing a category's galleries then its pieces, reached only from
category labels on piece, gallery, and image pages and from a link row
on `/pieces/` — never from the nav. The alternative, per-category list
pages under `/pieces/`, would have needed a second family for
galleries and drifted toward the sections the site deliberately
doesn't have.

## Gallery layout: rows packed to equal short sides, in editorial order

Spec 004's plan and the design brief said "plain grid" — equal
columns, each image at its own height, rows midline-centered. At the
sampler review (2026-09-01) the photographer saw a 3:1 panorama render
as a sliver in one of three columns beside a full-height portrait and
set the rule the layout now follows: _every image's short side should
render about the same_, so a pano fills a row, a 3:2 takes one and a
half times a portrait's width, and nothing looks small for being wide.

The mechanism is the triptych's `match="height"` math with a different
target: each cell's flex basis is its width at a common short side S,
grow is proportional to that width, rows wrap in the photographer's
order, and one factor scales each row to fill — so short sides are
exactly equal within a row. Integer column spans were rejected (a 3:2
in two of three columns is a third too big, in one a third too small,
and spans leave holes once order is fixed). Masonry was never on the
table (it reorders); equal-height justified rows were rejected because
they make portraits the smallest frames on the page — the opposite of
the rule. The accepted cost: a row that can't fill stays short and
centered rather than pulling a later image forward. Density (S) and
the short-row stretch cap are knobs. The index's gallery cards keep
the plain grid, since a card's text wants uniform columns.

## Spec 006: the rich image page

Decisions made at the mock-up review, the plan gate, and the visual
gate (2026-09-02), recorded here because the code only shows the
outcome.

**Private rasters by `_` prefix, not a sidecar field.** The camera's
frame for the compare is `_land-b.jpg` beside `land-b.jpg` — the
sidecar's own underscore rule, extended. A sidecar field pointing at
any file was the alternative; it would have been a second mechanism
saying the same thing (drift), and it would still have needed the
private rule to keep the frame off the site. Two relations share one
prefix on purpose (`_x.md` is _about_ x, `_x.jpg` is _the raw of_ x);
`AUTHORING.md` says so. One frame per photograph; an orphan or a
second frame fails the build. The photographer delegated this call.

**Story first.** The photographer, over the recommendation of label
first: "if there is a story, I want that to be more important than the
settings." A page without a story is the same page minus one section;
the title is the story's heading.

**Related frames are the outing only.** Six nearest in the piece's
order; none for gallery-root images — the flat gallery root is a pool,
not an outing, and would have listed every fixture it holds. The strip
uses the gallery's own equal-short-side packing at a smaller target
(`gallery-layout.ts`), not a second rule.

**Set selection by a click, with the default as every failure mode.**
Static pages can't know the referrer, so the HTML shows the default
set (the newest gallery holding the image, else the piece). A
capture-phase click handler in the layout is the one writer of the
set (a neighbour link's own set, else the gallery or piece the click
came from); the image page reads it. A typed URL or an outside link
shows the default or the last clicked set — accepted.

**Search takes pages with something to find.** Image pages join the
Pagefind index only with a story, a caption, or a place; exposure
rows, from-lines, navs, and the related strip are ignored. Thirty
label-only fixture pages would otherwise swamp four pieces with
junk excerpts.

**Quiet view dims the ground — the one dark surface.** The first cut
kept the light ground and the reading width, and the photographer's
verdict was that it "didn't really do anything". Now a click on the
photograph hides the chrome, dims `html`, `body`, and the stage to a
`--color-quiet` token beside the matte tokens, and gives the frame the
viewport with a small margin: "the dark mode, but only in specific
controlled situations". Spec 002's light-only decision stands
everywhere else; this is a state of one page, entered and left on
purpose, not a mode.

**The pruner prunes every unreferenced original.** The spec-004 rule
required a transform sibling as the sign Astro had processed an image;
the camera's-frame fixture, imported by the registry but not yet
rendered, shipped as an untouched original with its GPS block and the
scan failed the build at T403. Unreferenced is the whole test: nothing
can reach a file no page names.

**Unknown sidecar fields are stripped, not rejected.** Astro's
collection schemas aren't strict, none here are, and Obsidian writes
properties of its own into frontmatter; a strict schema would fail the
build on them. A wrong-typed known field is rejected with its name.

## Spec 007: the held image and the pause

Decisions from the exploration branch (`explore/held-block`, deleted
at close-out) and the plan gate, recorded here because the shipped CSS
only shows the outcome.

**Words beside the frame, never over or under it.** Text over a
photograph is a standing non-goal; the exploration also tried the
words below a held frame, and the photographer's call on a portrait
desktop settled it — beside, in a narrow column, or not held at all.
That is why a hold exists only where a column fits.

**Script-driven pause, CSS-only holds.** A hold is a sticky figure —
no script, so it works everywhere and can't stutter. The pause's dim
and approach need scroll progress, which CSS scroll-driven animations
would give if Safari before 26 and older Firefox supported them; a
small page-level script does it instead, and without script a pause
still pins, on the light ground. Per the constitution, an interactive
block is enhancement over the transform's HTML, never an island.

**Frames sized by ratio, never by `sizes`.** The exploration's trap: a
responsive image with `width: auto` takes its natural width from the
`sizes` hint, so a 3:2 frame was sized by a media-query string instead
of the space it had. The layout now computes every frame from `--ar`
and the height available; `sizes` is a hint for the srcset choice
alone, and the two are allowed to disagree.

**The `sizes` hints are `calc()` in `vmin`, not a share of the
screen.** A pause's margin is a clamp in `vmin`, not a percentage, so
treating it as one made the hint fall 3.7% under at 1440×900 — and a
short hint picks a soft image, since the srcset picks the next size up
from what the hint asks. The hints are written `calc(95.24vw −
9.52vmin)` and its height twin, coefficients rounded so the hint can
never fall under (T504 review).

**Margins, not padding, around a scene.** A hold ends with its last
line: padding inside the scene would leave the frame parked over empty
space after the words are spent, which the photographer named as the
failure to avoid ("the text keeps scrolling up for a while"). Margins
put the air outside the sticky context, so the release is exact.

**No hold where no column fits.** A landscape frame on a portrait
viewport, and anything on a phone, renders as an ordinary figure with
its words after it. The orientation comes from the image's own pixels
at build time — a class on the wrapper from the transform, no script
and no measurement — so the decision is made before the page loads,
and a square counts as landscape because it is width-starved the same
way.

**The hold's margin is the pause's.** One token (`--hold-margin`,
about 5vmin) sets both, so a held frame and a pinned one sit the same
distance from the edge and the page has one rhythm rather than two
that nearly match.

**The pause's words go down with the lights.** The alternative — dark
text left on a darkening ground — was tried and read as a fault. Text,
headings, captions, the page head's and the footer's text, and the
hairlines all mix toward `--color-quiet` as the ground does, each from
its own token, which means the rule is a list: an element outside it
would stay light on the dark ground. A link in the text inherits its
paragraph's colour and needs no rule; only the footer's and the page
head's links are named. The words do not disappear into the ground,
though — the ground stops short and the words go all the way — and the
mats are not on the list: see the two entries below. The sampler carries
a link and a heading after its pause as the standing check, read by eye.

**The words anchor to the frame** (visual gate, 2026-09-04). On the
exploration the paragraph before a pause scrolled away above the
pinned frame and the next one arrived out of an empty space below; the
photographer wants the words anchored to the frame. The transform
moves the two neighbouring paragraphs into the stage, so they pin with
it and stay above and below it for the whole pause — and only
paragraphs: a heading, a list, an image, or another block beside a
pause stays outside the scene, which keeps the rule one an author can
predict from the source.

**The dark is a depth, not the quiet ground** (visual gate).
"The screen shouldn't go entirely black": the ground stops 85 percent
of the way to `--color-quiet` (`--pause-depth`) and reads as a dark
grey, while the words go all the way, so they sit a shade darker than
the ground and stay faintly readable instead of dissolving into it.
One knob sets how dark the ground gets, and the words' end colour
stays the palette's own — no second scale to keep in step with it.

**The mat stays** (visual gate). The mats used to mix toward the quiet
colour with everything else, and the photographer's note was "the
matte goes away". A white mat on a dark ground is what quiet view
already does, so the mats are simply left out of the lights' list.

**A pause needs room after it: half of what the stage leaves empty.**
The sticky stage releases only when the scene's bottom reaches the
stage's bottom, which needs about half the empty viewport's worth of
document below the scene: a pause nearer than that to the end of a piece
never lightens on a tall viewport, and the page ends with the lights
part-way up (T506b measured exactly that on the sampler). An authoring
rule rather than a mechanism — `AUTHORING.md` says leave words after a
pause, and the sampler now carries closing paragraphs after its own.

**A collapsed hold keeps the held reading size** (1.05rem / 1.85). On
a phone, or a landscape frame on a portrait screen, the passage reads
a little larger than its neighbours rather than changing size with the
window — the block is the same block whether or not it holds.

**The image page's passage reads captions by body kind.** A spec-006
defect this spec's fixtures forced open: `passageFor` treated every
non-image line of a container's body as a caption, so converting a
`wide` to a `held` would have quoted two paragraphs of the piece's own
prose as an italic caption on the image page. The body kinds now live
in one map (`BLOCK_BODIES` in `image-meta.mjs`), a test asserts the
transform's table against it, and only caption-bodied blocks
contribute a caption — a `held`, `row`, or `aside` body never does.

**The second visual gate (2026-09-05): a tall sits inside the screen; a
fullbleed does not shrink.** On the laptop a 2:3 `tall` at 92vh was
hard to centre while scrolling so the whole frame showed, so
`--tall-max` is 85svh — the same share of the screen the pause's frame
takes, so the site's verticals have one sense of air. The 3:2
`fullbleed` is taller than a 16:10 screen and stays so: a fullbleed
that shrank would not be full bleed, and the photographer's own
leaning was to choose wider frames for it — so the fix is a rule in
`AUTHORING.md` (a frame's shape picks its treatment) rather than a
mechanism.

## Spec 008: cross-piece image references

Why a piece may now place a photograph it does not own, and what the
loosened rule still protects.

**A path, not an id.** The roadmap sketched `::single{id="…"}`. A
relative path won instead: it is what Obsidian previews in Live
Preview, it is what the build can check against the disk, and it means
a local and a borrowed image are written the same way — one syntax,
`./<file>` / `../<slug>/<file>` / `../../gallery-images/<file>`, with
the site deriving the id from the resolved path.

**One page, one home.** A borrowed photograph keeps the id, URL,
passage, related frames, categories, and title of the folder it lives
in; its page gains an "Also in" line naming the pieces that place it.
The alternatives were a page per placement, which duplicates a
photograph the site is built to give one address, or moving the file,
which breaks the URL it already had.

**The arrows follow the reader.** Each piece that places a photograph
gets its own set — that piece's frames, in that piece's order, the
borrowed one in its place — and the set key from spec 006 picks the
one the reader arrived through. A single merged set would have walked
the reader out of the piece they were reading.

**The registry enforces the draft rule, not the transform.** Only the
registry knows whether a piece is published, and the check sits beside
the ownership and gallery checks it already runs. The cost is that
`astro dev` shows a borrowed draft image until the next build refuses
it, which is the same shape as the registry's other build-time rules.

**The row as an anchor, treated as the gallery card is.** The pieces
row became one link because the gallery card already was one, so the
row is given the card's treatment literally: the look at rest is
unchanged, the whole area is the click target, and hover shifts the
title's colour with no underline the card doesn't have.

**The cover's id comes from Astro's internal `fsPath`.** The built
`src` is content-hashed, so the only way back to the source file is
`ImageMetadata.fsPath`, read directly off the collection entry. The
field is non-enumerable and marked `@internal`: a spread, a clone, or
a `JSON.stringify` of the cover drops it silently. The registry
therefore reads it in place and throws — not skips — when it is
absent, so an Astro upgrade that stops carrying it fails the build
loudly instead of quietly forgetting every borrowed cover.

**The published-pieces order gained an id tie-break.**
`byNewestPublished` in `src/lib/pieces.ts` sorts by `publishDate`
descending and then by id, so pieces published on the same day have
one order everywhere.
The registry's "Also in" list and appearance order and the site's
piece lists then agree by construction rather than by whatever order
the content loader happened to return (T603).

**The long self-reference is refused.** `../<own-slug>/<file>` would
resolve to a piece's own image — the same id, the same place in the
frames list — but the lookups that read a frame's alt and its passage
from the body stay local-only, so a frame written the long way would
lose the alt the piece wrote for it, its page falling back, absent a
sidecar title, to the humanized filename, and lose its passage. The transform
knows the file's folder and says so: write `./<file>`. One way to
write a local image.

**A borrowed non-raster is refused.** `../beta/land-a.tif` would mint
the id `beta/land-a` — the registered `land-a.jpg`'s — pass the draft
rule, and seat a frame linking to another file's page. A borrowed
`src` must be one of the accepted rasters; a local non-raster (an svg
diagram) stays allowed and unlinked as before.

**The image page's way-back links take the accent colour.** Not in
the spec: at the Phase 0 gate the product owner found that "From the
piece The vocabulary sampler" read as plain text until hovered, since
the theme's links inherit their colour and the line is muted. Every
link under that line's class — the piece, the galleries, "Read it in
place", the print link — now takes the accent at rest and the theme's
hover colour on hover, for every photograph, borrowed or not; recorded
as spec 008's decision 8.

## Spec 009: places

**The photograph is the unit; the piece's line is a shortcut.** The
spec was first drafted with the piece declaring its place and the
frames declaring exceptions. The product owner expects pieces whose
frames were made in several places, or in none worth declaring, to be
common, so the declaration moved to the sidecar (`at: <slug>`), and
the piece-level line stayed only as an optional default for the
frames that say nothing — because the outing shot entirely at one
place, the case Places exists for, would otherwise need one sidecar
per frame all saying the same thing. A piece that sets no default
imposes none: its frames are wherever their own lines say (the spec's
third goal first said such a piece "never touches Places", which read
as the opposite and was corrected at Phase 1's review).

**One property name, `at`, on both files, and `none` accepted on
either.** The field's name was left to the orchestrator. `at` reads as
the label does — "at Sombrio" — pairs with `at: none`, and cannot be
mistaken for the sidecar's free-text `place`. The piece's line was
drafted as `place:` and renamed at the plan's sign-off: Obsidian's
property autocomplete is keyed by property name across the vault, so
`place:` on pieces (slugs) beside `place:` on sidecars (prose) would
have offered each the other's values. With one name for the slug
everywhere, `at` suggests slugs and `place` suggests prose. Since the
property is shared, Obsidian offers `none` on a piece too, and it means
there what it means on a frame: no place. A place may not be named
`none`. The slug rule checks every piece and every sidecar, drafts
included — a typo in a draft is still a typo, and the sidecar orphan
rule already works that way — while the grouping reads published pieces
only, so a draft's frames join no place until it publishes.

**Outings oldest first**, so ten years read as ten years, though every
other list on the site is newest first; the index of places is most
recent outing first, like the rest.

**Places in the nav**, beside Galleries, rather than a section on the
galleries index.

**The cover check lives in the registry and runs only on a place that
publishes.** A gallery's cover is checked in its schema because a
gallery's list is authored; a place's frames are derived, so only the
registry knows them. A place declared ahead of its first outing may
name a cover from a piece not yet published and gets the build's note,
not a failure, as the spec promises.

**The card treatment became one component.** `GalleryCards` gave its
markup and styles to `CoverCards`, which galleries and places share; the
galleries index and the category page show no delta attributable to the
refactor once Astro's per-file scoped-style hash is normalized — two
deltas excepted and explained: the nav's new Places item, which the same
task adds to every page, and the order of two inlined scoped sheets on
the galleries index, since moving a `<style>` into a nested component
puts the deeper import's sheet first. That reordering is harmless while
the two sheets never match one element, and the plan records it for the
next such move.

## Spec 010: the page head

**"All" goes to the pieces index, and the section headings are each
kind's way back.** The spec left both the destination and the headings
to the orchestrator. A category page lists galleries first, then
pieces, so "All" alone would answer only half the question: it means
"show me everything", and the site being static, it cannot remember
which kind the reader was filtering. The two `h2` headings became
links — Galleries to `/galleries/`, Pieces to `/pieces/` — so "show
me all of this kind" has its own answer, and a reader who filtered
galleries returns to galleries rather than to the full list of
pieces.

**One row component, no scoped style, the current item marked the
nav's way.** `CategoryRow.astro` is rendered by three pages and
carries no `<style>` block on purpose: a scoped block would have
stamped a `data-astro-cid-*` attribute on every element it wraps, and
the pieces index's built HTML was to stay identical — it is, once the
hashed stylesheet link is normalized. The caveat is not the row's: a
later task in this same spec added the head's two tokens to
`global.css`, which changed that sheet's content hash and so its
`href`. Every other byte matches. The current category is a `<span
aria-current="page">` marked by text colour and an accent underline,
as closely as a non-link can take the site nav's own marking, rather
than by bold: the row is mono at 0.76rem, and bold mono at that size
reads as a different word instead of the same word emphasized. The
underline is written as `text-decoration-line` plus
`text-decoration-thickness` longhands and not the `underline 1px`
shorthand, because thickness inside the shorthand is CSS Level 4 — an
older browser drops the whole declaration and loses the underline
entirely, where the longhands lose only the thickness.

**A class and two tokens, not a change to `.section`.** The reading
pages opt in with `reading-head`; every other page is untouched by
construction, and was measured at three viewports to prove it. The
override is scoped to `min-width: 720px`, by width alone: the plan's
default was landscape-only, but at the gate the photographer took the
tighter head on his portrait monitor as well as the laptop, and width
alone gives it to him there while leaving the phone below the
breakpoint. Note that `720` is now a fourth use of that number in
`global.css`, sharing a value with the collapse breakpoint but
independent of it — a later change to one is not a change to the
other.

**The sampler is kept as a dev-only route behind a build barrier**,
not deleted after the gate: the reading typography pass wants the same
fixture, three candidates side by side on real pages. It is kept
behind a barrier rather than on trust in the `DEV` guard alone because
an empty `getStaticPaths` has regressed before — Astro 5.1.2 emitted
such routes anyway (withastro/astro#12891, fixed in #12906) — and the
cost of the barrier is one `if`, in exchange for proof on every build
rather than a promise.

**The spec's four-lines criterion is a floor; the first-paragraph top
is the number.** At 1440×900 today's head already showed the lead and
four lines, so the criterion could not tell the candidates apart. What
the gate actually judged was where the reading starts, and the chosen
candidate's measured first-paragraph top is the regression number: 547
at 1440×900, down from 638. The gate was judged against the
photographer's real fold — an `innerHeight` of 778 in his browser —
not against an emulated 900.

**The third acceptance criterion reads as being about the head's
air.** Criterion 3 says the galleries index and the category pages
"measure the same as before", while criterion 1 requires putting the
category row on exactly those pages; read literally, the two
contradict each other. The reading taken, and measured, is that
criterion 3 governs the head's padding and gap — unchanged on those
pages at all three viewports — and not the row the spec deliberately
adds. `spec.md` was left unedited: it is the product owner's, and it
is approved.

**Two one-time checks became tests, because a claim the project
makes should be able to fail out loud.** At the Phase 1 pause
(2026-09-07) the product owner found two of this spec's claims
resting on inspection alone. The head's values are a visual-gate
decision that lives only in CSS: deleting the `@media (min-width:
720px)` block, or retuning it, would have failed nothing in the
suite. The dev-route barrier's failure path had been exercised
exactly once, by hand, by removing the `DEV` guard and watching the
build stop. Both are now instrumented rather than left inspected:
`page-head.test.mjs` parses `global.css` for the two tokens, their
`3rem` override and its `720px` breakpoint, and runs the barrier as
a child process against a temporary fixture directory — once
containing a dev route, once not. The general point outlasts the
spec: a claim a project makes in its own docs should be able to fail
out loud. The guard has a limit worth naming, though:
`page-head.test.mjs` pins the values the stylesheet declares, not the
wiring that reads them. Nothing in the suite fails if the
`reading-head` class were dropped from one of the three page
templates, or if the two `.reading-head` rules were deleted — the
tokens would be declared and unread, and every test would still pass.
So the claim that the three reading pages share one head still rests
on the one-time measurement; a built-HTML assertion — the class
present on each of the three pages — is what would close it. One
detail of the test carries its own reason — the `:root` base
declarations are pinned to `.section`'s own `padding-block` value
rather than to a second copy of the clamp string, so the "keep these
in step by hand" coupling the stylesheet comment asks for is now
enforced by a test and not by the comment alone.

## Spec 011: the galleries overhaul

A gallery page was a wall of photographs boxed into the same column the
writing uses. Spec 011 let a gallery's packed rows run wider than that column
— out to a viewport bleed — and retuned the gap and the density (the common
short side), all three chosen by looking rather than by argument, the way
spec 010's page head was: a dev-only sampler at `/dev/galleries/` renders the
candidates against real photographs, behind the same `check-no-dev-routes`
barrier, and the photographer names the set on both of his screens.

The width reuses the site's existing wide/fullbleed idiom
(`width: var(--gw); margin-inline: calc(50% - var(--gw) / 2)`, with `body`'s
`overflow-x: clip` absorbing the `vw` overshoot) rather than a new transform:
it is viewport-centred, the body already clips its overshoot, and one knob
expresses every width form the gate might pick (a fixed content width, a wider
fixed width, or a bleed). Width and gap join the density in `gallery-layout.ts`
so all the packing knobs sit in one file, even though only the density (and
the stretch cap) feeds the srcset — a wider page must never fetch a larger
image, so `galleryCell`'s ceiling tracks density, not width. AC3's phrase
"srcset ceilings track the new width and density" is therefore read as density
(and stretch), never width; the approved `spec.md` was left unedited, the same
imprecise-AC call spec 010 made.

The gate's real find was about **density**, and it changed the mechanism.
A single value could not serve both of the photographer's screens: his second
display is an LG DualUp (16:18, nearly square, ~2560×2880), and a width-based
term (`26vw`) sizes off the viewport width, which is not the DualUp's large
dimension — so frames came out small there while the 16:10 laptop looked
right, and no single width-based number can size the DualUp up without
oversizing the laptop. The fix, folded into the spec at the gate, is a
**format-aware density** that sizes off `vmin` (the smaller viewport
dimension): `clamp(280px, 33vmin, 460px)` holds the laptop near its chosen 320
and lets the tall/square DualUp size up on its own. `GALLERY_SHORT_PX` became
the clamp ceiling (460, still the srcset driver); the floor and the `vmin`
rate are CSS-only, like the width and gap. The general lesson: a "responsive"
size keyed to viewport width silently assumes a landscape screen — key it to
`vmin` when a tall or square display is a real target.

Two smaller calls. The **index card grids** on the galleries and places
indexes were left boxed at the content width rather than following the pages
out to the bleed (the gate's decision — the narrower index reads as a calm
counterpoint to the wide walls). And the **GPS barrier** got a standing
child-process test (`gps-barrier.test.mjs`), closing spec 010's open note that
`check-no-gps.mjs` had none, and — because ten real camera exports came in as
fixtures — it proved itself on a genuinely GPS-bearing file for the first
time: `mystic-falls.jpg` carries GPS at source, yet its page and the whole
`dist/` scan are clean, because the registry's reader is allowlist-only with
`gps: false`.

**The place page was pulled from this spec.** Since spec 009 places had shared
the galleries' packing, so widening the galleries widened the place outings
too. But a wide band fronted (or footed) by its outing's piece label opened a
design question — where that label sits, and whether a place should read as
per-piece bands at all or as one seamless gallery with the pieces listed below
— that is a place-page redesign, larger than this spec's width/gap/density
scope. Rather than improvise it in the close-out, the place page was reverted
to its pre-011 rendering (decoupled from the galleries' retuned knobs via a
local `placeFlowStyle`, so it renders exactly as it did on `main`) and given
its own spec (`ROADMAP.md`). Spec 011 ships the galleries only; `spec.md`
carries a head amendment saying so. The principle: when a spec's change
uncovers a design question bigger than the spec's scope, split it out rather
than let the close-out sprawl — the repeated non-landing tweaks were the
signal.

## Spec 012: the place page as one wall

Spec 009 built a place page as a list of visits: the writing, then one
labelled group of frames per piece that photographed there, oldest first.
Spec 011 widened the galleries to a viewport bleed and the place page was to
follow, but a short piece title over a full-width band read as an indented
label over a wall, and set below the band its rule collided with the footer's
own divider. Rather than keep hunting for somewhere to put the label, spec
012 removes it: **a place page is one wall** — the writing, then every
published photograph at the place as one continuous packed gallery, in the
order the page already used (oldest visit first, each piece's frames in the
piece's order), with nothing between the visits and no list of pieces after
them.

**No attribution on the place page at all** is the decision that makes the
rest of it possible, so it is worth naming what carries the attribution
instead. Each frame's own page names the piece it belongs to and links back
to it, and the wall label's place link is how the reader arrived. The piece
is one click from every frame rather than repeated beside all of them, and a
place reads as a gallery that grows rather than as a timeline of outings.
The grouping is gone from the page, not from the registry: `place.outings`
still exists and the places index card still summarises "N outings · M frames
· years".

**The wall renders from `place.frames`, the registry's flat list, not from a
re-flattened `place.outings`.** `frames` is the list the image page's arrows
already step through when the reader arrives from a place, so rendering from
it makes "the wall's order is the arrows' order" true by construction instead
of by two pieces of code agreeing. Nothing in `gallery-layout.ts` changed but
its comment: the page consumes `galleryFlowStyle`, `galleryCell`, and
`gallery-wide` exactly as the gallery page does, which finally gives galleries
and places one packing system — spec 011's original Goal 3, before the place
page was pulled from it.

**The writing-to-wall gap is one token on the wall's own section, with the
writing's bottom padding zeroed** (`--place-wall-gap`, `.place-writing`,
`.section.place-wall`), rather than a margin on the flow or a value stacked on
top of `.section`'s existing padding. The reason is the gate: the photographer
names a number by looking at candidates, and the number he names has to be the
number that renders — with two paddings stacking, the visible gap would have
been his value plus a hidden one, and the token would have lied about what it
controls. The cost is that the token's clamp is a literal copy of `.section`'s
padding: that padding has no token of its own to reference, so the copy is
kept in step by a comment in `global.css` and by `place-page.test.mjs`, which
pins the literal.

**The gate (2026-09-13) confirmed more than it moved.** The photographer chose
candidate `wall-section` from the dev-only sampler at `/dev/place-wall/`: the
galleries' width, gap, and format-aware density carry to a wall that sits
under prose unchanged — spec 011 chose them on these same photographs, and
this gate's job was to check that they still hold with writing above them,
not to re-judge them. What it decided was the transition: one `.section`
padding, `clamp(3.5rem, 5.5vw, 5.5rem)`, measured at 83.2 / 70.4 / 56px from
prose to first row at 1512×982, 1280×1440, and 375×812. **The head case took
the same value.** A place with no writing (head, then wall) was the one spot
the plan expected might want a tighter gap, and the answer was no, so no
`.reading-head + .section.place-wall` override exists and the test asserts
that rule's absence rather than its value. That leaves a source-order
dependency in `global.css` — `.section.place-wall` has the same specificity as
`.reading-head + .section` and must stay after it for the wall's gap to win
after a head — which the test pins and the stylesheet's comment explains.

The sampler is a route of its own rather than a mode on `/dev/galleries/`,
kept after the gate behind the same `check-no-dev-routes` barrier: the
galleries sampler is spec 011's gate history and shows neither head nor
writing, while this gate was entirely about what happens where the writing
stops and the wall starts.

## Spec 013: the mat as a share of the frame

Spec 003 gave the site one mat width — `--matte: clamp(0.5rem, 1.4vw,
1.05rem)`, a share of the viewport — worn identically by a single at the
reading width, a grid cell, a packed gallery frame, a cover card, and the
image page's stage. On real photographs that is the wrong rule: a small
frame's mat reads heavy, a large frame's reads thin, and a wall of frames at
different sizes wearing the same mat reads as the site not having noticed. A
framer does the opposite — the mat grows with the print. So spec 013 asked two
questions and settled both by looking: whether the site wants mats at all and
where, and, where one stays, a width that is a share of the frame itself.

**Three tokens and one rule, resolved per geometry**, rather than a token per
surface. `--mat-share` (0.06), `--mat-min` (0.25rem) and `--mat-max` (2.5rem)
are the single source, and the rule that spends them lives in `global.css`,
written out once per form — because the CSS for a frame knows different things
in different places: only the frame's width (form W), only its height (H),
both (V+H), a packed row's target short side (R), or a matched pair's shared
height (P). The per-form algebra is what lets one number drive all of them
while the existing fits stay exact. Every frame carries its aspect ratio as a
raw `--ar` written by the remark transform, rather than container units or
`attr()`: `cqmin` needs size containment, which breaks auto heights, and typed
`attr()` has not shipped in Firefox.

**A packed row's mat follows the row's target short side, not its grown one**,
which is a deliberate deviation from "a share of the frame". Flex grows a
row's frames by up to `--gallery-stretch` (1.35) to justify the row, and that
growth is not a length CSS can read; a mat that followed it exactly would have
to sit inside the proportional term, which then cannot express a fixed mat (no
constant term) and goes inexact the moment the clamp bites. Following the
target keeps the equal-short-side math exact, scales with the format-aware
density knob, and makes every cell in a row wear one mat. The cost — stated
here, in the CSS comment, and in the test — is that a stretched row wears its
mat at between `share/1.35` and `share` of its actual short side.

**A matched-height pair wears one mat for the block**, not one per member, and
that is a clamp-exactness necessity rather than a look. With a mat per member
the matched height depends on which members sit at the floor or the ceiling,
and which do depends on that height — the regime is decided by the answer, and
CSS cannot branch on it inside one flex row. One mat for the block puts the
whole clamp on a known expression, `s(W − G)/(A + 2ns)`, so the heights stay
exact in every regime, as the held frame's form already does. The product
owner accepted this and the packed row's target side together at sign-off
(2026-09-13), and the sampler put mixed pairs in front of the gate so both
behaviours were seen, not just described.

**Today's mat is expressed by the same tokens** — share 0, floor equal to
ceiling — so the inert landing, the sampler's control, and the "everything as
today" branch are one mechanism rather than a special case. It is also why
form R has to keep the mat as the row's constant term: a fixed mat must stay
sayable.

**The gate (2026-09-17, both of the photographer's screens, ten real
photographs, from the dev-only sampler at `/dev/matte/`) kept every surface
and chose the largest candidate share.** Pieces, the packed rows (galleries,
the place wall, the related strip), the image page's stage, and the cover
cards are all matted: "let's stick with mats all over with warm background".
The share is **6%** (`--mat-share: 0.06`), which "looks a bit more refined and
doesn't change the overall size of the frame" for a small loss of image inside
it. The floor and ceiling are the plan's `0.25rem` (4px) and `2.5rem` (40px) —
the sampler's defaults, so the values that were judged. At 6% the ceiling
bites on the wide block and on the image page's stage on both screens, and the
floor never binds; the photographer kept the ceiling at the Phase 1 pause
("both screens look right, keep the 40px ceiling"), which is the constraint on
any later move to a larger mat.

**The ground is unchanged.** One rule bound the answer: the ground was warmed
at spec 003 so white mats would read, so mats going nowhere would have taken
it back toward white. Mats stayed everywhere, so the warm ground stays and the
"Ground tone" decision above is not superseded. What the gate raised instead
is the opposite worry — that the mats may not stand out enough against the
ground, that the 003 warming may not have gone far enough — so the tone itself
gets its own look in a later spec (`ROADMAP.md`), not a change made here.

**The compare slider's note margin and its no-JS frames gap are prose spacing,
not mats** (`calc(var(--baseline) / 2)`; decision review at the top tier,
2026-09-17). `--mat` is applied only as `padding`, because its `100%` resolves
against the reader's containing block — on the padded figure's children that
is the content box, and for a grid `row-gap` the height axis. A second
expression of form W on those children would break the single source, and
accepting the shortfall would have documented an approximation that varies
with share and ratio. The look changes on one page: the note sits half a
baseline below the frames rather than a mat's width.

The sampler stays in the repo after the gate behind the same
`check-no-dev-routes` barrier the page-head, galleries, and place-wall
samplers use, and so does the draft fixture piece it renders. That fixture
borrows the gallery images by spec 008's `../../gallery-images/<file>` path
instead of copying them: the gate needed photographs rather than placeholders,
and a draft piece ships nothing.
