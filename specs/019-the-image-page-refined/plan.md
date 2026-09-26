# Plan: The image page, refined

**Status**: Signed off (2026-09-24) by the `skeptical-reviewer` at the top tier — three blocking findings fixed and re-reviewed (the slider's segments indexed from the right, the borrowed-stage rule tested both ways, the sidecar clause corrected in the amendment), nine notes folded in; the re-review's non-blocking lines are in tasks.md's tier log.
**Implements**: spec.md in this directory

## Shape of the change

Four additions on the image registry and the image page, one block in
the vocabulary, one post-build barrier, and the tests that make each a
fact. The wall label looks two strings up in a hand-edited table. The
private-file rule (`_…`) grows from one relation (the camera's frame)
to a family of three, read once by a pure function the registry, the
transform and the barrier share. `compare` joins the transform as the
vocabulary's first interactive block; its static HTML is stacked
figures, and one module, `src/lib/compare.ts`, enhances it wherever it
appears — a piece, a sidecar story, or the image page's "Raw to
finished", which is now the same markup built from the registry. The
loupe lives in the quiet view alone, a script-built layer over the
stage's photograph that never touches the stage, the frame, the mat or
any quiet-view rule. No dependency is added.

Nothing here changes at rest what spec 018 pinned: the quiet view's
rules, the mat, the stage, `FRAME_HOSTS`, the motion grammar, the
scanner and the motion barrier are untouched, and their tests pass
unedited. The reduced-motion block gains one rule, deliberately — the
detail export's fade reading `--rm-appear`, as the frames' fade does —
and motion.test.mjs (d)'s expected rules rise from five to six with it
(T1712). Every other new movement is a rule on the grammar's tokens or
a script gate on `reducedMotion()`, spec 018's own split (the travel
withholds names in script).

The constitution has no "Scale" section (as at spec 018); the five
tests from the planner brief are applied at each choice below, and
where the simpler shape was taken it is said in one line.

- **The constitution, first** (`CLAUDE.md`, T1700, its own commit on
  this branch before any code). Four edits, exact text:
  - The Architecture paragraph's "an optional frontmatter-only sidecar
    (`_<basename>.md`) that overrides it" (whatever its exact wording
    around the phrase, the phrase "frontmatter-only" goes) becomes "an
    optional sidecar (`_<basename>.md`) whose frontmatter overrides it
    and whose body is the photograph's story (spec 006), and from spec
    019 whose `stages:` declare its processing" — the registry reads the
    body (`storyHasCompare`) and the stages, so the constitution may not
    call the sidecar frontmatter-only.
  - The block-vocabulary clause's list becomes "as of spec 019: single,
    fullbleed, wide, tall, inset, diptych, triptych, grid, strip, aside,
    row, one durational block, held, and one interactive block, compare
    (an ordered list of a photograph's stages — each an image, a label
    and a note — looked at three ways), with captions via the container
    form;".
  - The sentence beginning "A `sequence` treatment is a roadmap
    candidate" becomes: "The `sequence` reservation, carried since spec
    003, was retired at spec 019: an ordered list of image-and-label
    pairs for a processing narrative is what `compare` with stages is."
    The later "a future _interactive_ block (`sequence`'s
    carousel/slider candidates) must be built as" becomes "an
    _interactive_ block — `compare`, and any after it — is built as",
    and the sentence gains ", and without script its content stands as
    plain figures".
  - The Images paragraph gains, after "unpublished with it.": "A raster
    whose name starts with `_` is private, never an image of the site —
    no id, no page, never in a gallery: `_<basename>.<ext>` is that
    photograph's camera's frame (spec 006), `_<basename>.<word>.<ext>` a
    stage of its processing, and `_<basename>.detail.<ext>` a larger
    export for the image page's loupe alone, fetched only when the loupe
    opens (spec 019). A private file sits beside its photograph and may
    be placed in a body only as a stage of a `compare` block in its own
    folder."

  On the branch, not `main`: CLAUDE.md lets a constitution amendment
  commit straight to `main`, but its own test is "whether the change
  implements part of some spec's `tasks.md`", and this one is T1700 —
  it describes behaviour that exists only on this branch until the
  merge.

- **The private-file family** (`src/lib/image-meta.mjs`, T1701). The
  underscore still marks every private file (`isPrivateRaster` is
  unchanged: `^_`). What a private file _is_ needs its folder, so it is
  a new pure function beside it:

      privateRole(basename, publicBasenames) → { role: 'frame' | 'stage' | 'detail' | 'orphan', target, word? }

  `_X` with `X` in the folder's public basenames is the camera's frame
  of `X`; otherwise `X` split at its last dot, `T.W` with `T` public, is
  the stage `W` of `T`, or its detail export when `W` is `detail`
  (`DETAIL_WORD`); anything else is an orphan. Frame first, because
  `BASENAME` allows dots: `_land.b.jpg` beside `land.b.jpg` is that
  photograph's frame, not stage `b` of `land`. `privateTargetOf` keeps
  its signature and widens to "strip the `_`, then a trailing
  `.<word>`" — it now serves messages only, where a folder is not to
  hand. `privateMessage` names the family: `"<file>" is private — a file
  of "<target>" (its camera's frame, a stage, or the loupe's export),
  not an image of the site: <advice>`; `validateGalleries`' private line
  says the same. Then the two pure steps the registry runs:

      attachPrivates(privates, basenamesByFolder) → { frame, detail, stages, problems }

  (`privates` is `{ key, folder, basename, file }[]`; the three maps are
  keyed by the photograph's id — `frame` and `detail` to one key,
  `stages` to `{ file, key }[]` in file-name order; `problems` are the
  orphan, second-frame and second-detail lines below) and

      resolveStages(listed, own, where) → { stages: { key, label, note? }[], problems }

  which checks a sidecar's `stages:` against the photograph's own stage
  files — a listed `file` must be one of them, by exact name; the
  camera's frame and the detail export fail with their own line, a name
  listed twice fails, anything else fails as "not a stage of" — and
  returns them in the sidecar's order. "Two or more stages of one
  photograph" is enforced here, on the page's compare, by construction;
  in a body the transform does not check that the stages share a
  photograph (see Resolved decisions).

  Beside them, the compare's shared shape, one spelling each, imported
  by the transform, the image page and `compare.ts`:

      export const COMPARE_MODES = Object.freeze(['slider', 'side', 'switch']);
      export const COMPARE_CLASSES = Object.freeze({ root: 'compare', frames: 'compare-frames', stage: 'compare-stage', pane: 'compare-pane', caption: 'compare-caption', label: 'compare-label', note: 'compare-note' });
      export const COMPARE_WIDTHS = Object.freeze(['column', 'wide', 'stage']);
      export const COMPARE_WIDTH = Object.freeze({ piece: 'column', page: 'column' });   // tunable: the compare's width per surface
      export function compareSizes(width) → the `sizes` hint: column '(min-width: 720px) 680px, 94vw', wide '(min-width: 1240px) 1160px, 96vw', stage '100vw'

  `compareStages({ before, stages, image, processing }, { camera, finished })`
  builds the page's list: the camera's frame first (label `camera`, no
  note), the declared stages in order, the photograph last (label
  `finished`, note `processing`) — the one place the `processing:`
  fallback is written. `hasBlock(text, name)` answers "this markdown
  writes a `:::name` container" through the existing `splitBlocks` /
  `blockName`. `BLOCK_BODIES` gains `compare: 'stages'` (with the
  descriptor, at T1705 — the agreement test compares the two); `passageFor`
  treats a `stages` body as contributing no caption (it is not in
  `CAPTION_BODIES` — the stages' notes are not the photograph's
  caption), and `firstAltFor` skips references inside a `:::compare`
  container, because a stage's image text is its label ("Finished"),
  not the photograph's title. `sectionsFor` reads two new fields:

      const compareShown = (Boolean(image.before) || (image.stages?.length ?? 0) > 0) && !image.storyHasCompare;

  and `record` takes the processing note when `!compareShown` (today:
  `!image.before`), so a story that writes its own compare hands the
  note back to "How it was made".

- **The registry** (`src/lib/images.ts`, `src/content.config.ts`,
  T1702). The `imageMeta` schema gains

      stages: z.array(z.object({ file: z.string(), label: z.string().min(1), note: z.string().optional() })).optional(),

  Discovery keeps setting private rasters aside; the camera's-frame
  block (today's `beforeByTarget` loop) becomes one `attachPrivates`
  call, its problems thrown under the existing `[images]` heading.
  `SiteImage` gains `stages: { image: ImageMetadata; label: string;
  note?: string }[]` (from `resolveStages` over the sidecar, the keys
  mapped through `discovered`), `detail: ImageMetadata | null`, and
  `storyHasCompare: boolean` (`hasBlock(sidecar.body, 'compare')`);
  `before` keeps its name and meaning. A sidecar's stage problems are
  collected across every sidecar and thrown at once, as the orphan
  sidecars are. Nothing private ever enters `files`, `known` or `byId`,
  so no private file gets an id, a page, a set, a gallery slot or an
  OG image — the existing structure, now covering the family.

  Fixtures (`scripts/gen-placeholders.mjs`, its `FRAMES` list renamed
  `PRIVATES`, target `frames` kept as an alias): beside
  `where-the-fog-lets-go/_land-b.jpg`, `_land-b.tones.jpg` (1800×1200,
  the same field half-processed — a new `{ tones: true }` option between
  `flat` and none) and `_land-b.detail.jpg` (5400×3600, the photograph's
  field at three times its size), both carrying `TRAFALGAR_GPS` like the
  frame, so the GPS barrier proves both are stripped on `dist/` (the
  detail fixture's byte size is recorded at T1702: a flat placeholder
  field compresses to little, so it proves the mechanics, not the
  loupe's cost — that is judged on the real piece); and
  `tests/fixtures/_photo.tones.jpg` for the transform's tests; and
  `vocabulary-sampler/_land-b.jpg` (the fog piece's frame, same
  options), so one photograph on the site has a camera's frame and
  nothing else — AC 5's "two stages, as today" on a real page.
  `_land-b.md` gains one `stages:` entry (Tones, with a note). The
  fixtures stay fixtures: `Fixture` EXIF, the sidecar's _Fixture_ prose.

- **The private-files barrier** (`scripts/check-private-files.mjs`,
  T1703; `postbuild` after the GPS scan). Three scans over `dist/`,
  `dist/pagefind/` excluded:
  1. Every `/images/**/index.html` stage carrying `data-loupe-detail`
     names its loupe file in `data-loupe-src`; that file must exist
     under `dist/` (so the pruner cannot have taken it), and its URL
     must occur **nowhere else** in any text file in `dist/` — no
     `src`, no `srcset`, no `og:image`, no gallery page, no `rss.xml`,
     no stylesheet or script. One rule, name-independent (it does not
     assume how Vite names emitted files). A loupe file over the deploy
     target's per-file limit fails too (`MAX_BYTES`, 25 MiB — the
     Workers static-assets limit, a claim T1703 verifies against
     Cloudflare's documentation and records; see Known limitations).
  2. No page's markup — `<script>` and `<style>` blocks removed first,
     as `check-motion` does — carries a state only the scripts write:
     the attributes `data-js`, `data-view`, `data-narrow`,
     `data-settling`, `data-fresh`, `data-part`, `data-loupe-ready`, `data-glide`,
     `data-dragging`, or a `class` naming `compare-line`,
     `compare-handle`, `compare-legend`, `compare-stop`,
     `compare-control`, `compare-now`, `compare-tag`, `loupe`,
     `loupe-layer`, `loupe-base` or `loupe-detail`. This is AC 9's
     "no page ships a loupe state", and the compare's no-script pin.
  3. Every `.compare` in any page's markup — a piece's, a sidecar
     story's, the image page's section — has the one shape: its
     `compare-`-classed descendants and its `img`s (any other element,
     such as a wrapper Astro's image pipeline or `pieceWrap` adds, is
     transparent — its children count as its parent's; amended at the
     Phase 0 review), read by a small tag-depth walk from the
     figure's open tag to its matching close, form `compare-frames` >
     two or more `compare-stage`, each `compare-pane` > `img` then
     `compare-caption` > `compare-label` and at most one `compare-note`,
     and nothing else. This makes "two builders, one shape" a fact of
     every build rather than a one-time grep.

  Built in the foundation, like spec 018's barrier: its temp-dir tests
  prove it can fail from its first commit; scan 1 has a detail export to
  read from T1710 on and scan 3 a compare in the new shape from T1706 on
  (T1703 writes scan 3 against the shape in `COMPARE_CLASSES`, and it
  skips spec 006's old compare — a `.compare` holding `.compare-range`
  — until T1706 removes it; the skip is deleted at T1706. As built the
  one skip also cuts that old compare out of scan 2, since spec 006's
  markup ships `compare-tag` and `compare-line`; T1706 deletes both
  uses — amended at the Phase 0 review). The summary
  line's counts show what each scan read. The motion barrier is not edited: these
  attributes are not motion.

- **Gear names** (`src/content/gear.md`, `src/lib/gear.mjs`,
  `formatExposure`, T1704). The table is a Markdown file in the content
  folder, so it opens in the vault like everything the photographer
  edits, and belongs to no collection (no loader globs the content
  root). Shape:

      # Gear names
      (one paragraph: what the file is, the line format, that the build warns on a string it lacks)

      ## Cameras
      - `ILCE-7RM4` = Sony α7R IV
      ## Lenses
      - `100-400mm F5-6.3 DG DN OS | Contemporary 020` = Sigma 100-400mm f/5-6.3 DG DN OS Contemporary

  The EXIF string sits in backticks, exact, so a `|` or a double space
  in it needs no escaping; the key is the string as `cleanString`
  leaves it (NULs dropped, trimmed). A camera is keyed by `Model` alone
  — the table's line is the whole display name, so the make is
  discarded when an entry exists. Seeded with the spec's Decided list
  (four cameras, `ILCE-7M5` → `Sony α7 V` among them, and six lenses) and,
  under a "Fixtures" comment line, `Fixture FX-1` = `Fixture FX-1` and
  `Fixture 24-85mm f/1.8` = `Fixture 24-85mm f/1.8`, which print what
  they print today. `parseGearTable(text, file)` returns
  `{ cameras: Map, lenses: Map }` and throws on a malformed line, a line
  outside the two sections, or a key listed twice in one section, naming
  the file and line — a broken table fails the build. `formatExposure(raw, gear = EMPTY_GEAR)`
  looks each string up (`cameras.get(Model) ?? formatCamera(Make, Model)`;
  `lenses.get(LensModel) ?? LensModel`); `mergeOverrides` still lets a
  sidecar's `camera:` / `lens:` win over both, unchanged.
  `unknownGear(entries, gear)` returns one `{ kind, value, file }` per
  distinct unknown string, the first file that carries it; the registry
  reads the table once (`readFile(new URL(GEAR_FILE, root))`), collects
  every published image's raw tags as it already reads them, and warns
  each: `[gear] no display name for the lens "<value>" (first in <file>)
  — add it to src/content/gear.md`. A new module rather than more of
  `image-meta.mjs`: it owns a file format, and nothing else there does.

- **The block** (`remark-pieces-blocks.mjs`, T1705). One descriptor:

      compare: { forms: 'container', body: 'stages', structure: 'compare', count: { min: 2 },
                 attrs: { required: [], optional: ['mode'], enums: { mode: COMPARE_MODES } },
                 sizing: () => ({ layout: 'constrained', sizes: compareSizes(COMPARE_WIDTH.piece) }) }

  The body is parsed stage by stage (`partitionStages`, beside
  `partitionBody`): every child must be a paragraph; within each, an
  `image` node opens a stage, its `alt` is the label (required, non-empty),
  and the inline nodes up to the next image are its note, trimmed of the
  line breaks between stages — so consecutive lines, or stages separated
  by blank lines, both parse. Text before the first image, a
  non-paragraph child, or an empty label fails. Each stage's src:
  `checkReferenceShape` as for any block; then, if it is private, it
  must be `local` (a private file of another folder fails, public ones
  may be borrowed by spec 008's paths); then `checkSrcExists`. No stage
  runs `rejectPrivateSrc`, and no stage is wrapped in a link: the
  compare is a device, as spec 006's was, and a link would make a switch
  click navigate. Every other block and the shorthand pass keep
  `rejectPrivateSrc`, now with the widened message and the hint `place
  "<target>.<ext>" here, or show it as a stage of a :::compare in this
  folder`. Stage images carry `pieceFrame`, so the shorthand pass skips
  them. Every stage is probed; the root carries the last stage's raw
  `--ar` (the finished photograph's box). Output — identical, below the
  root, to what the image page builds:

      <figure class="piece-block piece-compare compare compare-w-column" style="--ar: 1.5" data-mode="switch">   (data-mode only when written)
        <div class="compare-frames">
          <figure class="compare-stage">
            <span class="compare-pane"><img …></span>
            <figcaption class="compare-caption"><span class="compare-label">Camera</span> <span class="compare-note">…note…</span></figcaption>
          </figure>
          …
        </div>
      </figure>

  A stage with no note renders the label span alone — no empty note
  span and no separating space; the stage `<img>` carries only its
  sizing props, no `--ar` of its own (the root's is the box); the
  page's section builds both the same way (T1705 review). The image
  sits in a `span`, not directly in a `figure`, so no stage
  image matches `FRAME_IMG` (`.piece-block figure > img`): the compare's
  images stay outside the appearance hooks, as spec 018 decided of
  spec 006's compare. The vocabulary's unknown-directive message lists
  `compare` from `Object.keys(BLOCKS)` with no change.

- **The block on the image page** (`src/pages/images/[...id].astro`,
  `src/styles/global.css`, T1706). The section renders when
  `shows('compare')`, from `compareStages(image, WORDING.compare)`, as
  `<figure class="compare compare-w-{COMPARE_WIDTH.page}">` with the
  structure above, every class through `COMPARE_CLASSES`, each stage an
  `<Image layout="constrained" width={Math.min(w, 1400)} sizes={compareSizes(COMPARE_WIDTH.page)} alt={label}>`.
  `WORDING.compare` becomes `{ heading: 'Raw to finished', camera:
  'Camera', finished: 'Finished' }`; `before`, `after`, `beforeTag`,
  `afterTag` and `reveal` leave (the tags go; the handle's words are the
  block's own). "How it was made" drops processing when
  `shows('compare')`. The page's scoped `.compare*` rules are deleted
  and the block's static rules move to a new `/* ---- The compare
  (spec 019) ---- */` section of `global.css`, before the Motion
  section, because pieces render the block too and cannot reach a
  page's scoped styles. Static: the stages stacked in the column with
  prose spacing, each label in the mono eyebrow style of today's
  `.compare-tag`, each note in the caption style of `.piece-block
  figcaption`; the three width classes (`compare-w-column` the
  container's width; `compare-w-wide` `min(var(--content-width), 96vw)`
  and `compare-w-stage` `calc(100vw - 2 * var(--page-pad))`, each
  centred out of its column with `margin-inline: calc((100% - W) / 2)`,
  the `.piece-wide` technique). The fog piece gains, after its closing
  fullbleed, `:::compare{mode="switch"}` with the three stages — so a
  body compare, an authored mode, a private stage and the photograph
  itself are all on one fixture page.

  Phase 1 review (T1708a): a sidecar stage note (and the `processing`
  fallback) is rendered as inline Markdown through the page's existing
  `renderMarkdown`, so `_emphasis_` reads the same in both builders —
  AC 5's "the same block"; the enhanced live note clones the note
  span's children rather than reading `textContent`, so a note's
  emphasis or link survives enhancement on both surfaces.
- **The compare's state** (`src/lib/compare.ts`, T1707) — pure
  functions and the tunables, no DOM, unit-tested:

      export const COMPARE = {
        defaultMode: 'slider',     // the method a block opens in when its author wrote none
        remember: 'visit',         // the reader's choice: 'visit' (sessionStorage), 'always' (localStorage) or 'none'
        restAt: 0.5,               // the slider's rest position on its track, 0–1 — which pair shows at rest
        snap: false,               // on release the handle settles on the nearest stop
        sliderStep: 0.02,          // an arrow key's step along the track (Page Up/Down: five steps)
        sideMinPx: 280,            // the narrowest a stage may be shown side by side
        sideNarrow: 'stack',       // where two won't fit: 'stack' them, or yield to 'switch'
        switchWraps: true,         // the last stage advances to the first
        switchOnClick: true,       // a click or a tap on the frame advances
        switchKeys: [' ', 'Enter', 'ArrowRight'],
        switchBackKeys: ['ArrowLeft'],
        legend: 'below',           // 'below' or 'above' the frame
        control: 'with-legend',    // the method control: 'with-legend' (the legend's row) or 'above'
        cornerTags: false,         // spec 006's corner tags, returned on the showing stages
      } as const;
      export const COMPARE_WORDING = { modes: { slider: 'Slider', side: 'Side by side', switch: 'Switch' }, control: 'How to compare', legend: 'Stages', handle: 'Move between the stages' };
      export const COMPARE_MODE_KEY = 'compare-mode';

  `openingMode(authored, stored)` — the stored choice if remembering and
  valid, else the author's `data-mode`, else `defaultMode`.
  `sliderView(p, n)` — the spec's geometry: the track `p ∈ [0, 1]` is
  the frame's width, the handle sits on the divider at `p`, the stops
  are at `k / (n − 1)`, the frame shows the pair of the segment the
  handle is in with the earlier stage on the left, and the segments are
  indexed **from the right**, so the handle at the right edge shows the
  first stage whole and at the left edge the last:
  `{ left: i, right: i + 1, split: 100 p }` with
  `i = n − 2 − min(⌊p (n − 1)⌋, n − 2)`. Exactly at an interior stop the
  floor puts the handle in the segment to the stop's right (for three
  stages, `p = 0.5` → the pair (0, 1) at 50). For two stages `i` is
  always 0 — today's compare exactly. `snapTo(p, n)`, `sidePair(k, n)`
  (stage `k` and the next; the last with the one before),
  `switchNext(i, n, dir)` (wrapping per `switchWraps`), `restView(mode,
  n)` (the slider's position and the side pair from `restAt`; the switch
  opens on the first stage), `noteIndex(mode, view)` (slider and side:
  the pair's later stage — the step being shown; switch: the stage), and
  `sideFits(width)`. What the geometry leaves inherent is in Known
  limitations; changing it is one function and its table, a round the
  envelope allows.

- **The compare, enhanced** (`src/lib/compare.ts`'s `enhanceCompare`,
  `global.css`, T1708). Called exactly where it is called today — the
  layout's module evaluation and `astro:before-swap` on the new
  document, for the reason `compare.ts`'s comment gives (T1603c,
  T1604c): before-swap is the last moment before the new snapshot and
  the router's scroll, so the box is final when they are taken;
  `astro:after-swap` would be too late for both, and it is used only by
  the Verify, as the moment to read the result. It skips a figure
  already carrying `data-js`; the module-level `resize` listener is
  bound once, at module evaluation. Per
  `.compare` with two or more stages it reads each stage's label and
  note, then builds, all script-only: the method control (three
  `button`s, `aria-pressed`), the legend (`ol.compare-legend`, one item
  per stage; spans in the slider, which marks the showing pair; buttons
  in side and switch, which choose), the divider `span.compare-line` and
  the handle `span.compare-handle` (`role="slider"`, `tabindex="0"`,
  `aria-valuenow` 0–100, `aria-valuetext` "Tones | Finished",
  `aria-label` from `COMPARE_WORDING.handle`), the live note
  `p.compare-now` (`aria-live="polite"`), and the corner tags when
  `COMPARE.cornerTags`. It writes `data-js`, `data-view` on the root,
  `data-part="left|right|on|in|under|off"` on each stage and `--split`
  on the root. The slider: `pointerdown` on the frames captures the pointer and
  sets `p` from its x, `pointermove` follows, `pointerup` snaps when
  `snap`; `touch-action: pan-y` on the frames lets a vertical swipe
  scroll the page while a horizontal one drags. The handle's keys:
  ←/→ by `sliderStep`, Page Up/Down by five, Home/End. The switch: the
  frames take `tabindex="0"`; a click without movement, a tap, or a
  `switchKeys` key advances, a `switchBackKeys` key goes back. Side by
  side: the legend's buttons choose the pair; `data-narrow` is set when
  `!sideFits(frames width)` and `sideNarrow` is `stack`, or the view
  yields to switch when it is `switch`, re-read by one module-level
  `resize` listener. Every key the compare consumes stops propagating,
  and the image page's `keydown` returns for a target inside
  `.compare`, so an arrow on the handle never steps the set. The
  reader's choice is written per `remember` and read by every later
  compare in the visit. CSS, in the compare section, all under
  `.compare[data-js]`: the frames one box at `aspect-ratio: var(--ar)`,
  `overflow: hidden`, the stages overlaid (`position: absolute; inset:
  0`) outside side by side, the panes' images `object-fit: contain` on
  `--color-bg` (spec 006's letterbox, unchanged in meaning: at 006 it read
  `--color-matte` because that was the page's white; since spec 017 the
  page's white is the paper ground and the matte token is the quiet
  frame's alone — matte.test.mjs (b) and (d) stay unedited, as the
  task's Verify says; decision review D1708, 2026-09-24), the
  static captions `display: none` (the legend and the live note carry
  them), `[data-part='off']` `visibility: hidden` in every view (and
  `"under"` beneath `"in"`), the slider's left stage `clip-path: inset(0 calc(100% -
  var(--split-pct)) 0 0)` above the right, side by side a two-column
  grid (one column under `[data-narrow]`) with each pane at the
  photograph's ratio, the line and the handle at `left:
  var(--split-pct)`. The handle: a disc of `--compare-handle`
  (2.75rem, a fingertip) with `border-radius: var(--compare-handle-radius)`
  (50%), filled `--color-bg` (the spec's 'the ground's family'), a 1px `--color-text` hairline (D1708), no
  shadow, the focus ring the site draws. `--split` and `--split-pct`
  move here from the page, with one `@property --split { syntax:
  '<number>'; inherits: true; initial-value: 50; }` so the snap can
  glide. Motion, three rules and nothing else:

      .compare[data-view='switch'] .compare-stage[data-part='in'] { z-index: 1; animation: motion-appear var(--dur-state) var(--ease-state) both; }
      .compare[data-fresh] .compare-pane { animation: motion-appear var(--dur-state) var(--ease-state) both; }
      .compare[data-settling] { transition: --split var(--dur-state) var(--ease-state); }

  The divider follows the hand directly (no transition). A stage change
  in the switch is a cross-fade built without an `opacity: 0` rule: the
  arriving stage is `data-part="in"` and fades in over the leaving one,
  held beneath as `"under"`, and on `animationend` they become `"on"`
  and `"off"` — an opaque photograph dissolving in over another is the
  cross-fade. The stage a block opens on is `"on"`, never `"in"`, so
  nothing fades at load. A mode change sets `data-fresh` on the root
  until the panes' `animationend`, so the new view fades in from the
  ground (not a flag: no envelope line asks for a cut, and one would be
  a round deleting a line). Both reuse
  spec 018's `motion-appear` keyframes. No new rule sets `opacity: 0`,
  which matters twice over: motion.test.mjs (g) requires every such
  rule to begin `html[data-motion]` _and_ finds exactly one such rule
  (the gate), so a second one could satisfy neither. `data-settling` is
  written for a snap only when `!reducedMotion()` (the settle is a
  movement — spec 018's split, in script, as the travel does it); the
  two fades are kept under reduced motion.

  **Round T1709a (Phase 1 pause, 2026-09-25).** The slider is two-way:
  it wipes between one pair of stages, never three. The pair is state
  shared by the slider and side by side — `pair: ComparePair` — and
  at rest it is the first and last stage (Camera | Finished), set by
  `COMPARE.restPair: 'ends'` (the one tunable of this round; the other
  value, `'neighbours'`, is the old rest pair). The legend chooses the
  pair in both views by one rule, `pickPair(pair, k)`: the pair
  remembers which member was picked longer ago; clicking a stage
  already in the pair does nothing; clicking another replaces the
  member picked longer ago, and the clicked stage becomes the newer;
  the two are shown in stage order (left = earlier). At rest the first
  stage is the older pick. Every click on a stage outside the pair
  changes it, no two legend buttons do the same thing, and every pair
  is reachable from rest in at most two clicks (the implementer's
  first rule — replace the nearest member — could never reach Tones |
  Finished from three stages; corrected 2026-09-25). `sliderView(p, pair)` returns
  `{ left: pair.left, right: pair.right, split }` — the divider at
  `p`, the earlier stage showing left of it; the three-or-more segment
  geometry, `snapTo`'s stops and `restAt`'s "which pair" meaning are
  retired: `restAt` is only the divider's rest position. The switch is
  unchanged. The legend marks the pair in both views. Known
  limitations' "three or more stages" paragraph is moot.

  **Rounds T1709c–f (Phase 1 pause, second look, 2026-09-25).**
  (c) Only side by side is wide: `COMPARE_WIDTH` returns to `column`
  on both surfaces (the static markup and `sizes`), and a new
  `COMPARE.sideWidth: 'wide'` names the width class the script swaps
  onto the root while `data-view="side"` (`compare-w-column` off,
  `compare-w-wide` on; back on leaving side). The stage's `sizes`
  stays the surface's: each side pane is half the wide width, under
  the column's hint. (d) The pair is picked in order: `pickPair`
  becomes `pickSlot(pair, k)` over `{ left, right, next: 'left' |
  'right' }` — a click on a stage in the pair does nothing; otherwise
  the stage takes the `next` slot and `next` flips; at rest left is
  the first stage, right the last, `next` is `'left'`. Left and right
  are the picked order, not stage order, in both the slider (the left
  stage shows left of the divider) and side by side. The legend marks
  the picked buttons bold in `--color-text` with a small tag "left" /
  "right" (`COMPARE_WORDING.slots`), the unpicked muted, and a hint
  after the legend, "next pick: left" / "next pick: right"
  (`COMPARE_WORDING.next`). (e) A finding: the Finished stage shows
  no corner tag while the other stages do — diagnosed and fixed in
  place if routine (every showing stage carries its tag when
  `cornerTags` is on, or none does when off). (f) `WORDING.compare`
  gains `cameraNote: 'The RAW file straight out of camera — no edits,
  no adjustments'`, the camera stage's note on the page (the
  photograph's own `processing:` stays the finished stage's).

  **Round T1709g (Phase 1 pause, third look, 2026-09-25).** A slot may
  be empty: the state is `{ left: number | null, right: number | null,
  next }`. `pickSlot(pair, k)`: the stage takes the `next` slot and
  `next` flips; if the stage already held the other slot, that slot
  becomes `null` (so a stage moves sides, and the side it left stays
  empty until the next pick fills it); a click on the stage already in
  the `next` slot keeps it there and flips `next` all the same (round
  T1709h: no click is ever a no-op, so a side can be confirmed and the
  other side picked without rearranging). An empty side shows no stage: in the
  slider the divider wipes between the one stage and the bare ground,
  in side by side the empty pane is the ground, the live note follows
  the right slot and is blank when that is empty. The legend's tags sit
  beneath their buttons: each button is a two-line block with a tag
  row always present (a blank when unpicked, `visibility: hidden` or a
  non-breaking space) so nothing shifts; the hint line stays beneath
  the legend. The switch is unchanged.

  **Round T1709i (2026-09-25).** The handle is small: `--compare-handle:
  1.5rem` (24px), still a circle, its 1px border in `--color-accent`
  on the ground, and a "=" drawn inside as two short horizontal bars
  (`::before` and `::after`, `--color-accent`, each about a third of
  the diameter wide and 1px tall, centred, a few px apart) — no glyph
  font. compare.test.mjs (b) pins the token and the handle rule's body.

  **Round T1709j (2026-09-25).** The label and the note are set apart:
  wherever a `.compare-note` follows a `.compare-label` (the live note
  and the static caption alike), a muted middle dot with space on both
  sides stands between them — one CSS rule, `.compare-note::before`
  scoped to the caption and the live note, `content: '·'`,
  `margin-inline: 0.45em`, `color: var(--color-muted)` — no markup
  change in either builder, pinned by compare.test.mjs (c) by body.

- **The loupe's file** (`src/lib/loupe.ts`, the image page's
  frontmatter, T1710). `LOUPE` holds the loupe's tunables:

      export const LOUPE = {
        withoutDetail: true,   // a photograph with no detail export still has the loupe, to its own file's full size
        pixelRatio: 1,         // image pixels per device pixel at full detail (1: one to one)
        minGain: 1.05,         // no loupe when full detail is less than this over the fit
        opensOn: 'click',      // 'click', 'dblclick', or 'gesture' (only a wheel or a pinch opens it)
        pinch: true,
        wheelStep: 0.002,      // scale × e^(−deltaY × step)
        keyStep: 1.5,          // + and − multiply and divide the scale
        panStep: 0.15,         // an arrow pans this share of the view
        dragSlop: 4,           // px a press may move and still be a click
        zoomInKeys: ['+', '='],
        zoomOutKeys: ['-', '_'],
      } as const;

  `loupeImageOptions(source)` in `ogImageOptions`' shape: webp at the
  source's full size — a format change, so a real transform that strips
  metadata — capped at WebP's 16383px edge, and one pixel less when the
  source is already webp (the passthrough og.ts guards). No quality is
  given, the same default the stage's `<Image>` uses, so where the full
  size equals a stage candidate's width (a source of 2320px or less)
  Astro can serve one file for both; the growth of `dist/_astro/` that
  the own-file loupes cost is measured and recorded at T1710. The page:

      const loupeSource = image.detail ?? (LOUPE.withoutDetail ? image.image : null);
      const loupe = loupeSource ? await getImage(loupeImageOptions(loupeSource)) : null;

  and the `.image-stage` div carries `data-loupe-src`, `data-loupe-w`,
  `data-loupe-h` (the transform's own size) and `data-loupe-detail` when
  the file is a detail export. A data attribute is not a resource: the
  browser fetches nothing for it, and the stage's `<img>`, its `srcset`,
  the OG image and the feed are untouched. The detail's emitted original
  is named by no page, so the pruner removes it; its transform is not an
  original, so the pruner never touches it — the barrier's scan 1 checks
  both outcomes on every build.

  T1710 finding (2026-09-25): the site-wide `image: { layout:
  'constrained' }` makes every `getImage()` emit a responsive set, so
  a loupe call named one file and shipped nine (+234 files, +15.7 MB
  across the site). `loupeImageOptions` therefore returns `{ src,
  width, format: 'webp', layout: 'none' }` — one file per loupe, the
  URL unchanged (layout is not in the hash). `ogImageOptions` has the
  same waste (six unnamed og candidates per page) — a sweep note, not
  this spec's. Own-file loupes share no file with the stage (the
  stage's fit/position enter the hash): 62 of them cost 4.84 MB; the
  Phase 2 pause asks whether a photograph without a detail export
  gets a loupe at all.

- **The loupe's state** (`src/lib/loupe.ts`, T1711) — pure and
  unit-tested. `fullScale({ natural, fit, dpr })` is
  `natural / (fit × dpr × pixelRatio)`; a stage is loupe-ready when it
  is at least `minGain`. `zoomAbout(view, point, scale, box)` keeps the
  point under the pointer fixed (`t′ = p − (p − t) × s′ / s`, transform
  origin top left); `clampPan(view, box)` keeps the photograph covering
  its box. `loupeReduce(state, action, ctx)` is the state machine the
  controller runs, returning the new view and one effect:
  - at the fit, in the quiet view: `open(point)` by `opensOn` → full
    detail about the point (effect `open`); a wheel or a pinch →
    continuous from 1; a zoom-in key → `keyStep` about the centre;
    Escape → effect `leave-quiet`; ← / → → `step-prev` / `step-next`;
    a click on the mat or the ground → `leave-quiet`;
  - zoomed: a drag pans; a click without movement → back to the fit
    (effect `close`); Escape → `close`; ←/→/↑/↓ pan by `panStep`;
    the zoom keys, the wheel and the pinch between 1 and full detail;
    reaching 1 → `close`.

  Escape always steps back one level; the arrows step the set only at
  the fit.

- **The loupe, wired** (`src/lib/loupe.ts`'s `createLoupe(stage)`, the
  image page's script, `global.css`, T1712). The image page's `init()`
  creates the controller when the stage carries `data-loupe-src`; it
  marks the stage `data-loupe-ready` when `fullScale` of the stage image
  at the quiet fit reaches `minGain`, re-read on entering the quiet view
  and on `resize`. On `open` it builds, inside `.image-stage` (already
  `position: relative`), `div.loupe` placed over the photograph's own
  box from `img.getBoundingClientRect()` — so the mat, the frame and the
  stage are untouched and not zoomed — holding `div.loupe-layer` with
  `img.loupe-base` (the stage's `currentSrc`, already decoded: no
  request) and, when it has decoded, `img.loupe-detail`. The loupe file
  is requested once per page, at the first `open`: `new Image()`,
  `src`, `decode()`, then appended — cached for the page's life, so a
  second zoom requests nothing. The layer's `transform: translate(tx,
  ty) scale(s)` is written by the controller. The page's click handler
  and `keydown` ask the controller first and act on its effect
  (`setQuiet(false)`, the arrows' `go()`); `setQuiet(false)` resets the
  loupe at once. The wheel listener is non-passive and only prevents
  scrolling over the photograph. CSS, a new `/* ---- The loupe
  (spec 019) ---- */` section after the quiet rules:

      html[data-quiet] .image-stage[data-loupe-ready] .image-frame img { cursor: zoom-in; touch-action: none; }
      .loupe { position: absolute; overflow: hidden; cursor: zoom-out; touch-action: none; }
      .loupe[data-dragging] { cursor: grabbing; }
      .loupe-layer { transform-origin: 0 0; }
      .loupe[data-glide] .loupe-layer { transition: transform var(--dur-move) var(--ease-move); }
      .loupe-base, .loupe-detail { position: absolute; inset: 0; width: 100%; height: 100%; }
      .loupe-detail { animation: motion-appear var(--dur-appear) var(--ease-appear) both; }

  and, inside the reduced-motion block at the file's end (so it wins by
  order, as T1608a's pin requires of every rule there), a sixth rule
  beside the frames' appearance:

      .loupe-detail { animation-duration: calc(var(--dur-appear) * var(--rm-appear)); }

  motion.test.mjs (d)'s `REDUCED_RULES` and its order expectation gain
  this rule and the block's comment says six — a deliberate addition
  the count exists to notice, not a loosened test. `data-glide` is
  written for a discrete zoom (open, a key, close) only when
  `!reducedMotion()`, and removed on `transitionend`; a drag, a wheel
  and a pinch follow the hand without it. Under reduced motion the zoom
  cuts and the detail export fades in exactly as the frames do, on
  `--rm-appear` (spec 018's split).
  The detail image is inserted only once decoded and its animation's
  `both` fill starts it at opacity 0, so there is no `opacity: 0` rule.
  Without script there is no `data-loupe-ready`, no `.loupe`, and the
  quiet view is today's. A photograph whose gain is below `minGain`
  keeps today's quiet view exactly: any click leaves. For a
  loupe-ready photograph a click on the photograph opens the loupe and
  a click on the mat or the ground leaves the quiet view — a reading of
  Goal 4 (see Resolved decisions).

  T1712 note (2026-09-25): matte.test.mjs (b)'s quiet list pins exactly
  three `html[data-quiet] .image-…` preludes; the loupe's cursor rule
  is a planned fourth, so that list gains it by name and "no fourth"
  becomes "no fifth" — a deliberate addition the count exists to
  notice, as motion (d)'s sixth rule is; the rule's text stays as
  spelled. The loupe section sits after the quiet rules and before
  the compare section (compare.test.mjs slices compare → Motion).

  Phase 2 review (T1712a, 2026-09-25): (N1) `LOUPE.opensOn` is
  `'click'` (a click on the photograph zooms) or `'gesture'` (a click
  on the photograph leaves the quiet view as before; the wheel, a
  pinch or + opens the loupe) — the reducer's `click` at the fit
  returns `leave-quiet` under `'gesture'`, with a test; `'dblclick'`
  is withdrawn, since the first click of a double click would leave
  before the dblclick event arrives. (N2) Safari reports a trackpad
  pinch as `gesturestart` / `gesturechange` / `gestureend`, not
  ctrl+wheel: `createLoupe` feeds the ratio of successive
  `event.scale` values into the `pinch` action and prevents the
  default, so the page does not zoom instead. (N4) No own-file loupe
  shares a file with its stage (fit/position enter the stage's
  hash); the sentence in "The loupe's file" claiming it could is
  superseded by the T1710 note.

  **Rounds T1713a–b (Phase 2 pause, 2026-09-26).** (a) `LOUPE.pan:
  'follow'` (the other value `'drag'`, the loupe as first built): when
  zoomed, a mouse pointer's position over the box sets the pan
  directly — the pointer at fraction (fx, fy) of the box shows the
  view at `tx = fx · w(1 − s)`, `ty = fy · h(1 − s)`, so the pointer
  at the centre shows the centre and at the bottom right the bottom
  right, as if reading the unzoomed photograph — a new reducer action
  `hover` (`pointerType` mouse only; touch and pen keep the drag);
  a click without movement still closes; the arrows still pan and
  the next hover overrides them; under `'drag'` nothing changes.
  (b) `LOUPE.mat: 'off'` (the other value `'kept'`, as first built):
  while the loupe is open the stage carries `data-loupe-open` (a state
  attribute, on the barrier's list) and the quiet frame drops its mat
  — `html[data-quiet] .image-stage[data-loupe-open] .image-frame
  { padding: 0; }` (a fifth quiet rule, by name in matte (b); it reads
  no `--mat`, so the one-matted-surface case still holds). The quiet
  frame is shrink-to-fit around the photograph and the image's cap
  reads the frame's `--mat`, so the frame collapses onto the
  photograph and the dark ground shows where the mat was; the
  photograph does not move or grow, and the overlay stays placed from
  the image's rect. The mat shrinks under the glide: a transition on
  the frame's padding reading `--dur-move` / `--ease-move` (the first
  transition on `.image-frame`; a seventh reduced-motion rule beside
  the sixth if the block's rule needs it). On close the attribute goes
  and the mat returns. (Corrected 2026-09-26: the first draft of this
  paragraph had the loupe filling the mat's box — measured impossible
  without resizing the stage image.)

- **Obsidian** (`obsidian-plugin/compare.ts`, `main.ts`, `styles.css`,
  T1714). A second pattern beside `DIRECTIVE_PATTERN`, for the one
  container the plugin renders: `^:::compare(\{[^}]*\})?[ \t]*\n([\s\S]*?)\n:::[ \t]*$`
  (`gm`), its body read by `parseCompareBody(body)` → `{ src, label }[]`
  (one `![label](src)` per stage, the note ignored), in its own
  obsidian-free file so the suite can test it; `main.ts` replaces the
  whole block with a `BlockWidget` showing each stage's image with its
  label beneath (`photo-pieces-preview-compare`), unless the cursor is
  inside it, as every leaf block does. A private stage resolves like any
  image. The methods, the handle and the loupe are the site's.

- **The documents** (T1715): `AUTHORING.md` — the block (the flow's
  example, the rules: two stages, own folder for a private file,
  `mode`), the sidecar's `stages:`, the private-file family, the detail
  export (the name, "about 6000 px on the long edge" as the starting
  recommendation, location stripped on export, the 25 MiB ceiling), the
  gear table (where, the line format, the warning); `README.md` — the
  image-page paragraph, the tree (`lib/compare.ts`, `lib/loupe.ts`,
  `lib/gear.mjs`, `content/gear.md`, `scripts/check-private-files.mjs`),
  the spec list; `obsidian-plugin/README.md` — the table's `:::compare`
  row and the Extending note. `ROADMAP.md` and `DECISIONS.md` at
  close-out (T1718).

- **The tuning envelope, placed.** Every item the spec's envelope names,
  where it lives and what pins it. A round is the value, its row in the
  named test, and one Decided line in spec.md.

  | Envelope item                                                              | One place                                                                                          | Pinned by                                   |
  | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------- |
  | handle's size and shape                                                    | `--compare-handle`, `--compare-handle-radius` (`:root`)                                            | compare.test.mjs `TOKENS`                   |
  | legend's placement / shape                                                 | `COMPARE.legend` / the `.compare-legend` rules                                                     | `EXPECTED` / (c) rule strings               |
  | method control's words / placement                                         | `COMPARE_WORDING.modes` / `COMPARE.control`                                                        | `EXPECTED`                                  |
  | corner tags' return                                                        | `COMPARE.cornerTags`                                                                               | `EXPECTED`                                  |
  | width per surface                                                          | `COMPARE_WIDTH` (image-meta.mjs) — class and `sizes` both follow                                   | image-meta.test.mjs                         |
  | slider: continuous or snapping / pair at rest / geometry                   | `COMPARE.snap` / `COMPARE.restAt` / `sliderView()`                                                 | `EXPECTED` / the `sliderView` table         |
  | default method; remembered, how long                                       | `COMPARE.defaultMode`; `COMPARE.remember`                                                          | `EXPECTED`                                  |
  | side by side where two won't fit                                           | `COMPARE.sideNarrow`, `COMPARE.sideMinPx`                                                          | `EXPECTED`                                  |
  | switch's gestures and keys; wrapping                                       | `COMPARE.switchOnClick`, `switchKeys`, `switchBackKeys`; `switchWraps`                             | `EXPECTED`                                  |
  | loupe's gestures, keys, zoom range, how it opens                           | `LOUPE.opensOn`, `pinch`, `zoomInKeys`, `zoomOutKeys`, `pixelRatio`, `minGain`, `wheelStep`, `keyStep`, `panStep` | loupe.test.mjs `EXPECTED`                   |
  | the loupe without a detail export                                          | `LOUPE.withoutDetail`                                                                              | `EXPECTED`                                  |
  | recommended detail size                                                    | the one AUTHORING.md sentence                                                                      | T1715's grep                                |
  | each duration's token                                                      | the five motion rules (switch, mode change, settle: state; zoom: move; detail: appear)             | (c) rule strings in both tests              |
  | reduced-motion split per movement                                          | the script gates (`data-settling`, `data-glide` on `!reducedMotion()`); the detail fade's RM rule on `--rm-appear` | the gate's unit case in each test           |
  | the section's heading, the block's words                                   | the page's `WORDING.compare`; `COMPARE_WORDING`                                                    | compare.test.mjs (page source, `EXPECTED`)  |
  | sidecar field names; the note's fallback to `processing:`                  | `content.config.ts`'s `stages`; `compareStages()`                                                  | image-meta.test.mjs                         |

  The legend's shape is a set of rules, not a value: its round edits the
  `.compare-legend` rules and the pinned strings beside them. The
  slider's geometry is a function: its round edits `sliderView` and its
  table. Both are the smallest honest unit.

## Failure messages and notes

The transform (every line through `file.fail`, naming the piece and the
line):

```
compare takes two or more stages (one per line: ![Label](./file.jpg) then its note); got 1
a compare's body is its stages, one per line — "Before the images" comes before the first image
a compare's body is its stages, one per line — no lists, headings or blocks inside it
a compare stage needs its label as the image's text: ![Camera](./_land-b.jpg)
"../beta/_photo.jpg" is a private file of another folder — a compare may show a private file only from its own folder; a public photograph may be borrowed (../beta/photo.jpg)
"./_land-b.tones.jpg" is private — a file of "land-b" (its camera's frame, a stage, or the loupe's export), not an image of the site: place "land-b.jpg" here, or show it as a stage of a :::compare in this folder
image not found: ./_land-b.tones.jpg (relative to the piece's folder)
invalid value "carousel" for mode on compare — allowed: slider | side | switch
```

The registry, under `[images]`, all at once:

```
src/content/pieces/x/_land-b.tones.jpg has no photograph: a "_" file belongs to the photograph it names, so "land-b.<ext>" should sit beside it (its camera's frame is _land-b.<ext>, a stage _land-b.<word>.<ext>, the loupe's export _land-b.detail.<ext>)
src/content/pieces/x/_land-b.detail.png is a second detail export for "x/land-b" — keep one
src/content/pieces/x/_land-b.md: stages lists "_land-b.tone.jpg", which is not a stage of "land-b" — a stage is _land-b.<word>.<ext> beside the photograph
src/content/pieces/x/_land-b.md: stages lists "_land-b.jpg", the camera's frame — it is always the first stage; leave it out
src/content/pieces/x/_land-b.md: stages lists "_land-b.detail.jpg", the loupe's export — not a stage
src/content/pieces/x/_land-b.md: stages lists "_land-b.tones.jpg" twice
```

The table and the warning:

```
[gear] src/content/gear.md:14 — expected "- `<EXIF string>` = <display name>" under "## Cameras" or "## Lenses"
[gear] src/content/gear.md:21 — "ILCE-7RM4" is listed twice under Cameras
[gear] no display name for the lens "E 70-180mm F2.8 A056" (first in src/content/pieces/x/y.jpg) — add it to src/content/gear.md
```

The barrier, green and failing:

```
[check-private-files] N loupe files on M image pages, K of them detail exports named nowhere else; C compares in one shape; no compare or loupe state in P pages.
[check-private-files] a compare out of shape in dist/pieces/x/index.html: compare-stage > compare-caption before compare-pane
[check-private-files] a detail export named outside its loupe in dist/galleries/fog-frames/index.html: /_astro/…webp
[check-private-files] a loupe file missing from dist/: /_astro/…webp (dist/images/where-the-fog-lets-go/land-b/index.html)
[check-private-files] a loupe file over 25.0 MiB: dist/_astro/…webp (31.2 MiB)
[check-private-files] a script-only state in the markup of dist/pieces/x/index.html: data-js
```

`scripts/verify.sh` gains `\[gear\]` in its flagged-lines grep and
`\[check-private-files\]` in its summary grep; `package.json`'s
`postbuild` runs the barrier after `check-no-gps`. The page count moves
by nothing; the test count rises by the new files' cases, recorded per
task.

## Testing strategy

Every claim above is owned by a task and a check. "Page tests" in the
spec's acceptance criteria are, here, two things, because the project
has no browser test runner and this spec adds no dependency: the
mechanics as pure functions (`sliderView`, `loupeReduce`, …) run by
Vitest on every build, and the wiring read in the browser by the
implementer (Firefox 156 headless via BiDi, spec 015's recipe) with the
numbers recorded in `tasks.md`, as spec 018 recorded its motion. The
feel is the person's at each pause.

  Round T1709b (2026-09-25): `COMPARE_WIDTH` → `{ piece: 'wide', page: 'wide' }`, the value in its one place, compare.test.mjs's row updated.
- **The private-file family** — `image-meta.test.mjs`, **T1701**:
  `privateRole` over `_land-b` / `_land-b.tones` / `_land-b.detail` /
  `_land.b` beside `land.b` (frame, not a stage) / `_land-b.tones` with
  no `land-b` (orphan); `privateTargetOf('_land-b.tones') === 'land-b'`;
  `attachPrivates` returns the frame, the detail, the stages in name
  order, and one problem each for an orphan, a second frame, a second
  detail; `resolveStages` keeps the sidecar's order and fails the four
  cases above with their lines; `validateGalleries` refuses
  `x/_land-b.detail` naming `x/land-b`; `compareStages` puts the frame
  first, the photograph last with `processing` as its note, and omits
  the frame when there is none; `hasBlock` finds `:::compare` and not
  `::compare` or prose; `firstAltFor` returns the held block's alt, not
  a compare's "Finished", for a body whose compare comes first, and
  `undefined` when the compare is the only reference; `sectionsFor`:
  stages alone show the compare, `storyHasCompare` suppresses it and
  moves `processing` to the record; `COMPARE_WIDTH`'s values are in `COMPARE_WIDTHS` and
  `compareSizes` returns the three strings. Mutations: drop the
  frame-first rule → the `_land.b` case fails; drop the compare skip in
  `firstAltFor` → the title case fails.

- **The registry and the fixtures** — **T1702**, by build (the
  registry is Astro-coupled, verified by build like `pieces.ts`): the
  build is green with the new fixtures; `land-b`'s page shows the
  compare section; each registry error fires, by temporary edit and
  revert — a stray `_ghost.tones.jpg`, a second `_land-b.detail.png`, a
  sidecar listing `_land-b.jpg` — the build's tail naming the file.

- **The barrier can fail** — `private-files.test.mjs`, **T1703**,
  gps-barrier.test.mjs's shape (temp dirs, `execFileSync`): a stage
  with `data-loupe-detail` whose file is missing → exit 1 naming both;
  the same URL also in an `<img srcset>` on a gallery page → 1; in an
  `og:image` meta → 1; in `rss.xml` → 1; a clean dir with the URL only
  in its attribute → 0 and the summary; a loupe file of `MAX_BYTES + 1`
  (a sparse file) → 1; `data-js` on a figure → 1; `class="loupe"` → 1;
  `data-js` and `.loupe` in `<script>` and `<style>` text only → 0; a
  loupe URL without `data-loupe-detail` also in a `srcset` → 0 (the
  own-file loupe may share a candidate, by Astro's dedupe); scan 3 — a
  compare in the shape with two and with three stages → 0, a stage
  without `compare-pane` → 1, a caption before its pane → 1, one stage
  → 1, a stray element with a class inside the frames → 1, a note
  without a label → 1, a compare holding `.compare-range` (spec 006's)
  → 0 until T1706 deletes that skip and turns the case to 1.

- **Gear names** — `gear.test.mjs`, **T1704**: the parser (the
  committed table parses; a malformed line, a line before any section
  that is not prose, a duplicate key each throw naming the line); the
  lookups: `formatExposure` with the table gives `Sony α7R V` for
  `ILCE-7RM5`, `Pentax K-1` for make `RICOH IMAGING COMPANY, LTD.` and
  model `PENTAX K-1`, the Sigma's display name for the `|` string, and
  every Decided row verbatim (a table in the test); without the table,
  today's strings; `mergeOverrides` with a sidecar `camera:` still wins;
  `unknownGear` returns one entry per distinct string with the first
  file. **The build over the repo prints none**: every public raster
  under `src/content/` read with `readExposure` has its `Model` and
  `LensModel` in the table (absent strings excepted) — the failure lists
  the string and the file. Mutation: delete the `ILCE-7RM4` line → that
  case fails naming a file. Then the built page: `/images/…` for an
  `ILCE-7RM5` frame reads `Sony α7R V` (grep of `dist/`, recorded), and
  `gallery/dock-b` still reads its sidecar's names.

- **The block's shape and its failures** — `remark-pieces-blocks.test.mjs`,
  **T1705**, its render helper: three stages render as
  `figure.piece-block.piece-compare.compare.compare-w-column` >
  `div.compare-frames` > three `figure.compare-stage`, each
  `span.compare-pane > img` and `figcaption.compare-caption` with its
  label and note in order (no-script: stacked figures, AC 3); the root's
  `--ar` is the last stage's; `data-mode` present only when written; no
  `a.image-link` inside; a note with `_emphasis_` keeps it; stages
  separated by blank lines parse like consecutive ones. **The borrowing
  pair**, rendered from a piece in `tests/pieces/alpha/`, beside which
  `tests/pieces/beta/` holds both `photo.jpg` and `_photo.jpg` on disk
  (the implementer copies how the suite's spec-008 borrowing cases set
  the render's path, and names the case it copied): a compare with
  `./photo.jpg` and `../beta/photo.jpg` — a public photograph borrowed
  by spec 008's path — renders, two stages, the borrowed image's `src`
  resolved like any borrowed frame; the same compare with
  `../beta/_photo.jpg` fails naming the file with the borrowed-private
  line — the file exists, so the refusal is the rule, not a missing
  file. Failures, each naming the piece and the line: one stage;
  `./_missing.jpg`; the borrowed private above; `![](./photo.jpg)`; text
  before the first image; a list inside; `mode="carousel"`;
  `::single{src="./_photo.jpg" alt="x"}` still fails with the widened
  message; a shorthand `![x](./_photo.jpg)` still fails; a private stage
  inside `:::grid` fails. `image-meta.test.mjs`: the descriptor-agreement
  case passes with `BLOCK_BODIES.compare = 'stages'`, landed with the
  descriptor; the kinds list in "the passage by body kind" gains
  `stages` — a deliberate addition — with a `passageFor` case that a
  compare contributes no caption. Mutation: let the shorthand pass run over
  stage images → the three-stage case fails.

- **The page's section is the block** — **T1706**: the built
  `land-b` page's section holds `figure.compare.compare-w-column` with
  three stages labelled Camera, Tones, Finished and Finished's note the
  sidecar's `processing` (grep of `dist/`, recorded); the barrier's
  scan 3 counts every compare on the site in one shape, its old-compare
  skip deleted and that test case turned to 1; spec 006's
  `enhanceCompare`, still in place until T1708, finds no
  `.compare-range` in the new markup and skips every figure (its
  `continue`), so the stacked form shows and no script throws — read in
  the browser console on `land-b` and the fog piece; "How it was made"
  on that page has no Processing row; `vocabulary-sampler/land-b`'s
  section holds two stages, Camera and Finished; `port-a` has no
  section; the fog
  piece's compare carries `data-mode="switch"` and three stages; a
  temporary compare written into `_land-b.md`'s story → the automatic
  section is absent from the built page and the story's is present,
  reverted; compare.test.mjs (a): the page source builds every compare
  element with `COMPARE_CLASSES` and no `class="compare` literal; every
  `COMPARE_CLASSES` value and each width class has a rule in
  `global.css`; the page's `<style>` holds no `.compare` rule;
  `FRAME_HOSTS` holds no compare class (so the stage images stay outside
  the appearance hooks). motion.test.mjs (i) green unedited (the page's
  `<style>` declares no transition).

  Phase 1 review (T1708a): compare.test.mjs also pins `WORDING.compare`
  by page source — the heading and the two labels as literal strings —
  so a wording round is one value, one test row, one Decided line.
- **The compare's state** — `compare.test.mjs`, **T1707**: `EXPECTED`,
  every `COMPARE` key and value verbatim, and `COMPARE_WORDING`;
  `sliderView` as a table — two stages: `p` 0, 0.5, 1 → split 0, 50, 100,
  pair (0, 1) throughout (unchanged from spec 006); three stages: 0 →
  (1, 2) at 0 (the last stage whole); 0.25 → (1, 2) at 25; 0.5 — the
  interior stop, which belongs to the segment on its right — → (0, 1)
  at 50; 0.75 → (0, 1) at 75; 1 → (0, 1) at 100 (the first stage
  whole); four stages at 0, each interior stop, and 1 (the last whole
  at 0, the first at 1, each interior stop the pair to its right);
  `snapTo`; `sidePair` for first, middle and last;
  `switchNext` at the end with and without wrapping, and backwards from
  the first; `restView` per mode; `noteIndex` per mode; `sideFits` at
  `2 × sideMinPx` ± 1; `openingMode` for stored/authored/default and an
  invalid stored value. Each case named for what fails it.

- **The compare, enhanced** — **T1708**: compare.test.mjs (b) `TOKENS`
  (`--compare-handle: 2.75rem`, `--compare-handle-radius: 50%`, declared
  once, in `:root`), (c) the three motion rules by string and the
  `@property --split` block; motion.test.mjs green unedited — (a) the
  family untouched, (b) the source scan over the new rules, (d) the
  five-rule reduced-motion block, (g) the `opacity: 0` walk and its one
  gate unchanged (no new rule sets `opacity: 0`); the build's motion and
  private-files barriers green. In the browser, at 1512×982 and
  1280×1440, on `/images/where-the-fog-lets-go/land-b/` and the fog
  piece: the control, legend, handle and live note exist only with
  script; with script off (spec 017's sandboxed-iframe recipe) the
  three stages stand stacked with labels and notes; the handle's rect is
  centred on the divider and at least 44px; dragging (pointer events
  synthesised at 25%, 50%, 75%) sets `--split` and the parts as
  `sliderView` says and the live note to the later stage's; ← on the
  handle moves `aria-valuenow` by 2 and does not navigate; the method
  control switches `data-view`; side by side shows two panes of equal
  width, and at a 480px-wide viewport `data-narrow` stacks them; switch:
  a click, Space, Enter and → advance, ← goes back, the last wraps, and
  `getAnimations()` holds a `motion-appear` animation of 180ms on the
  arriving stage while the leaving one reads `"under"`, then `"on"` and
  `"off"`; enhancing the block starts no animation; a mode change
  writes `data-fresh` and removes it after 180ms; the fog piece opens in switch, the page in slider; a mode
  chosen on the page is the mode the fog piece opens in after a
  navigation (sessionStorage); after a swap into `land-b` from a gallery
  the compare is enhanced at `astro:after-swap` with its box height equal
  to a full load's (T1604c's read, repeated); inside `.compare`,
  `querySelectorAll(FRAME_IMG)` is empty.

  Phase 1 review (T1708a): (c) also pins the legend and control rule
  (`.compare[data-js] .compare-legend, .compare[data-js] .compare-control`)
  by exact body, as the envelope table's "Pinned by" column says.
- **The loupe's file** — `loupe.test.mjs`, **T1710**: `EXPECTED`, every
  `LOUPE` key and value verbatim; `loupeImageOptions` — a 5400×3600 jpg
  → webp 5400, a 2400×1600 webp → 2399, a 20000×10000 jpg → 16383 wide,
  a 10000×20000 → 8191 wide; then the build: `land-b`'s stage carries
  `data-loupe-detail` and a `data-loupe-src` whose file exists, the
  barrier's line counts one detail export, `check-no-gps` green with the
  GPS-bearing detail fixture (and `exifr` over the emitted file reads no
  GPS — recorded), the detail's original is absent from `dist/_astro/`
  (the pruner's line counts it), the fog piece's `land-a`'s stage
  carries a loupe file and no `data-loupe-detail`, and with
  `withoutDetail: false` (temporary) it carries none; the size and file
  count of `dist/_astro/` before and after this task (the own-file
  loupes' cost) and how many own-file loupe URLs equal a stage `srcset`
  candidate (Astro's dedupe, measured, not assumed).

- **The loupe's state** — `loupe.test.mjs`, **T1711**: `fullScale`
  (5400 over a 1400px fit at dpr 2 → 1.93; 1800 over 1400 at 2 → 0.64,
  not ready); `zoomAbout` keeps the point fixed (the point's screen
  position before and after equal); `clampPan` at each edge;
  `loupeReduce` — every transition listed in "The loupe's state", each
  a case, including Escape twice from zoomed (close, then leave-quiet),
  ← at the fit (step-prev) against ← zoomed (a pan, no effect), a click
  after a movement under `dragSlop` (a click) and over it (a drag),
  `opensOn: 'dblclick'` ignoring a single click, the wheel reaching 1
  (close); and (c) the loupe's CSS rules by string, the glide on
  `--dur-move`/`--ease-move`, the detail on `--dur-appear`/`--ease-appear`.

- **The loupe, wired** — **T1712**: matte.test.mjs green with one deliberate addition (the fourth quiet rule, by name) (the
  quiet rules, the mat, the stage); motion.test.mjs green with one
  deliberate edit — (d)'s `REDUCED_RULES` and its order expectation gain
  `.loupe-detail { animation-duration: calc(var(--dur-appear) * var(--rm-appear)) }`
  (`bases: 1`, `after: []`) and the "five rules" names say six — and a
  mutation: the rule moved above its base → the order case fails; in
  the browser,
  at both viewports, on `land-b` in the quiet view: the stage carries
  `data-loupe-ready`; the resource timeline holds no loupe URL before the
  first click and exactly one after it and after a second zoom; a click
  at a point zooms so that the image-pixel under the pointer stays under
  it (±1px) with the layer's scale equal to `fullScale`; the loupe's rect
  equals the stage image's (±0.5px) and the frame's padding and
  background are unchanged while zoomed; the base shows at once and the
  detail is appended after decode with a `motion-appear` animation of
  950ms; a drag pans and is clamped; the wheel and a synthesised
  two-pointer pinch change the scale continuously; +/− zoom; ← zoomed
  pans and at the fit steps to the previous photograph; Escape zoomed →
  fit, Escape again → the page; a click zoomed without movement → the
  fit; during a click zoom `getAnimations()` holds a 480ms transform
  transition, and under reduced motion none (the detail's fade still
  950ms); the not-ready control is chosen by computation, not assumed:
  the fog piece's `land-a` (the 1800×1200 placeholder; at the quiet fit
  about 1,300 CSS px wide on both screens, so `fullScale` ≈ 0.7 at 2×)
  has its `fullScale` read at both viewports and recorded, is not
  loupe-ready, and a click leaves the quiet view as on `main`; the same
  read is recorded for one real 2560px portrait export and one real
  2560px landscape export (a portrait's quiet fit on the laptop is
  narrow, so its gain can pass `minGain` — the Phase 2 walkthrough
  quotes these numbers, and if `land-a` reads ready, the report names
  a page this read found not ready instead); without
  script, no `data-loupe-ready` and the quiet view as on `main`.

- **Obsidian** — `obsidian-plugin.test.mjs`, **T1714**:
  `parseCompareBody` on the flow's three lines, on stages separated by
  blank lines, and on a body with a stray line (skipped); the photographer
  attests Live Preview at the Phase 3 pause.

- **Nothing else moves** — every task's Verify carries
  `git diff -U0 main -- src/styles/global.css | grep '^@@'`: no hunk
  inside `.image-stage`, `.image-frame`, `.image-frame img`, the
  `html:not([data-quiet])` or `html[data-quiet]` rules, the Motion
  section, the reduced-motion block (save T1712's one added rule), or
  the `:root` motion tokens; `matte.test.mjs`, `ground.test.mjs`,
  `galleries.test.mjs`, `place-page.test.mjs` green and unedited, and
  `motion.test.mjs` unedited but for T1712's (d) addition.

- Existing suites stay green; build with its four barriers (GPS, dev routes, motion, private files); `astro
  check`; Prettier on every touched file.

## File structure

```
CLAUDE.md                                 the block-vocabulary clause and the images paragraph (T1700, its own commit)
src/lib/image-meta.mjs                    privateRole, privateTargetOf and privateMessage widened, attachPrivates, resolveStages, COMPARE_MODES/CLASSES/WIDTHS/WIDTH, compareSizes, compareStages, hasBlock, firstAltFor's skip, sectionsFor (T1701); formatExposure's gear argument (T1704); BLOCK_BODIES.compare (T1705)
src/content.config.ts                     imageMeta: stages (T1702)
src/lib/images.ts                         attachPrivates, resolveStages, stages/detail/storyHasCompare on SiteImage (T1702); the gear table read and the [gear] warnings (T1704)
scripts/gen-placeholders.mjs              PRIVATES: the tones stage and the detail export; the tones option; tests/fixtures/_photo.tones.jpg (T1702)
src/content/pieces/where-the-fog-lets-go/ _land-b.tones.jpg, _land-b.detail.jpg (generated); _land-b.md stages (T1702); index.md's compare (T1706)
src/content/pieces/vocabulary-sampler/    _land-b.jpg (generated — a frame and nothing else) (T1702)
tests/fixtures/_photo.tones.jpg           generated (T1702)
scripts/check-private-files.mjs           new: the barrier's three scans (T1703); scan 3's spec-006 skip deleted (T1706)
package.json, scripts/verify.sh           postbuild; the two grep additions (T1703, T1704)
private-files.test.mjs                    new (T1703)
src/content/gear.md                       new: the table (T1704)
src/lib/gear.mjs                          new: parseGearTable, unknownGear, GEAR_FILE, EMPTY_GEAR (T1704)
gear.test.mjs                             new (T1704)
remark-pieces-blocks.mjs                  the compare descriptor, partitionStages, the stage src rule, the widened hint (T1705)
remark-pieces-blocks.test.mjs             the compare cases (T1705)
image-meta.test.mjs                       T1701's cases
src/pages/images/[...id].astro            the section as the block, WORDING.compare, the record's processing, the scoped .compare rules deleted (T1706); the stage's data-loupe-* (T1710); the loupe controller in init(), the click and key routing, the .compare key guard (T1708, T1712)
src/styles/global.css                     :root: --compare-handle, --compare-handle-radius (T1708); the compare section — static (T1706), enhanced and its three motion rules (T1708); the loupe section (T1712)
src/lib/compare.ts                        COMPARE, COMPARE_WORDING, COMPARE_MODE_KEY and the pure state (T1707); enhanceCompare rewritten (T1708)
compare.test.mjs                          new (T1706–T1708)
src/lib/loupe.ts                          new: LOUPE, loupeImageOptions (T1710); fullScale, zoomAbout, clampPan, loupeReduce (T1711); createLoupe (T1712)
loupe.test.mjs                            new (T1710–T1712)
motion.test.mjs                           (d): the sixth reduced-motion rule, deliberately (T1712)
obsidian-plugin/compare.ts, main.ts, styles.css   the compare widget (T1714)
obsidian-plugin.test.mjs                  new (T1714)
AUTHORING.md, README.md, obsidian-plugin/README.md   T1715
src/content/pieces/<his slug>/            the photographer's piece, as supplied (T1716)
ROADMAP.md, DECISIONS.md                  close-out (T1718)
```

Untouched, named so the reviewer can confirm the non-goals hold:
`src/lib/exif.mjs` (the allowlist and `gps: false`); `src/lib/motion.ts`,
`src/lib/motion-scan.mjs`, `scripts/check-motion.mjs`; the reduced-motion
block's five existing rules and the Motion section of `global.css`; every `.image-stage`,
`.image-frame` and quiet rule; `src/layouts/BaseLayout.astro` (it already
calls `enhanceCompare` where it must); the galleries, the place wall, the
front door, the piece page and its script, the sets and the arrows;
`src/pages/og/`, `src/pages/rss.xml.ts`; `package.json`'s dependencies.

## Known limitations

- **What the slider's geometry leaves inherent for three or more
  stages.** The ends are right: the handle at the right edge shows the
  first stage whole, at the left edge the last, for every count. What no
  arrangement with the handle on the divider can avoid: a middle stage
  is never shown whole (it is always one half of a pair), and at each
  interior stop both halves change at once — the pair (i, i + 1) hands
  to (i − 1, i). Two stages are today's compare exactly. The
  alternative — each stage whole at its stop, the next wiping in over
  it — is continuous but takes the handle off the divider; it is one
  function, `sliderView`, and a round inside the envelope. The pause is
  where this is judged, as the spec says.
- **On a 2× screen many photographs without a detail export get no
  loupe.** Full detail is one image pixel to one device pixel. A
  landscape 2560px export shown about 1,300 CSS px wide in the quiet
  view is already past that at 2× (`fullScale` ≈ 0.98), so it keeps
  today's quiet view; a 2560px-tall portrait, whose quiet fit on the
  laptop is short and narrow, can pass `minGain` (≈ 1.5). T1712 records
  the numbers. `LOUPE.pixelRatio` (a looser "full detail") and
  `minGain` are the envelope's zoom range.
- **25 MiB per file.** The deploy target's static-asset limit applies
  to the loupe file; the barrier fails a larger one. The limit is
  Cloudflare's documented figure as of T1703's check (recorded there);
  if the check cannot be made, the number stays and this line says so.
- **Repository weight.** Detail exports are committed beside their
  photographs, as the spec's non-goal says; `ROADMAP.md`'s external
  store entry records that the day moved closer.
- **The loupe is reset by a resize** (to the fit), rather than
  re-projecting the zoomed view onto the new box.
- **The side-by-side fit is re-read on `resize` only**, not on a
  container change without one.

## Resolved decisions

- **One barrier for the private files, name-independent.** It reads
  the loupe URLs the pages declare and checks where else they appear,
  rather than inferring private files from emitted names, which depend
  on Vite's naming; the no-script state rides in it as spec 018's
  no-script pin rode in its barrier. The motion barrier is not edited.
- **The compare's shape is spelled once** (`COMPARE_CLASSES`) and
  imported by the transform, the page and the script; the stylesheet is
  the second spelling, pinned by the rule-per-class test — spec 018's
  `FRAME_HOSTS` arrangement.
- **The page builds the block's markup itself** rather than rendering a
  generated `:::compare` through Markdown: the site's Markdown pipeline
  optimises images only inside content collections, and the page needs
  `<Image>`. Two builders, one shape, pinned on every build by the
  barrier's scan 3.
- **The chrome is script-built.** The static HTML is only the stacked
  figures, so without script nothing dead ships and the barrier can
  prove it; the handle is an ARIA slider on a `span`, not an invisible
  full-area range input, so no `opacity: 0` control is needed and the
  handle itself is the focus target the spec asks for.
- **The stages are not linked to their pages** — the compare is a
  device, as spec 006's was; the photograph's page is one link away in
  the piece.
- **The switch's cross-fade is kept under reduced motion.** Goal 5 and
  spec 018's rule keep fades; the Design requirement's "or a cut under
  reduced motion" is the other reading, and one reduced-motion rule if
  the pause asks for it (which would make the block seven rules — a
  deliberate change to motion.test.mjs (d)).
- **A mode change moves the geometry at once and fades the new view in**
  (`data-fresh`, always — no envelope line asks for a cut); morphing one layout into the other would need a
  view transition for a change inside one figure, and a view transition
  here would also cross-fade the page around it.
- **The switch's cross-fade is a fade-in over the held stage**, not two
  opacity transitions: it needs no `opacity: 0` rule, which
  motion.test.mjs (g) forbids outside the one gate.
- **The loupe zooms inside the photograph's own box**; the mat, the
  frame and the dark ground stay as they are — the spec's "the mat is
  not zoomed with the photograph" read as the window, not the page. A
  loupe filling the screen is a change to `createLoupe`'s placement,
  judged at the pause.
- **At the fit, a click on the photograph opens the loupe and a click
  on the mat or the ground leaves the quiet view.** Goal 4 says both "a
  click or a tap on the photograph zooms" and "a click at the fit steps
  back out"; they cannot both hold for the same click, so this is a
  reading: the photograph zooms, everything around it leaves, and once
  zoomed a click without movement returns to the fit. A photograph that
  is not loupe-ready keeps today's "any click leaves". It is put to the
  person at the Phase 2 pause; `LOUPE.opensOn` (`dblclick`, `gesture`)
  is the envelope's alternative if he wants a single click to keep
  leaving.
- **The loupe is an overlay, not a transform of the stage image**, so
  nothing spec 018 or the mat rule pinned moves, and removing it
  restores the page byte for byte.
- **The loupe file is a webp transform at full size**, for a detail
  export and — while `withoutDetail` holds — for the photograph's own
  file: a real transform strips metadata, the detail's original is
  pruned, and the URL is a data attribute the browser never fetches on
  its own. Copying the original would publish its EXIF.
- **In a body, the transform does not check that a compare's stages are
  one photograph's.** The spec defines a compare that way and the page
  builds it that way; the block enforces what the authoring rules list
  (two stages, the own-folder rule, existence). A cross-photograph check
  would refuse two public frames compared on purpose.
- **`detail` is reserved in the family**: a sidecar that lists it as a
  stage fails, because by the spec's definition it is the loupe's. A
  compare block may still show it — the private-file rule allows any
  private file of its folder there.
- **The gear table is Markdown in the content folder**, with backticked
  keys: the vault opens it, the keys need no escaping, and the parser is
  one line pattern. A new module, `gear.mjs`, owns the format.
- **Tunables are constants in two modules and two tokens**, not a
  settings file or a dev panel: the envelope asks for one value in one
  place pinned by name; spec 018's panel existed because its tokens were
  CSS and needed trying live — these are mostly script behaviour, tried
  by editing a value and reloading `npm run dev`.
- **No new dependency.**
