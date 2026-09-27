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
  _(Amendment 2026-09-26: the filmstrip's width is `COMPARE.stripWidth`, the pair blocks' `PAIR_WIDTH` — see "Amendment (2026-09-26)".)_

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

  **Round T1713c (2026-09-26).** The mat-off round left a band: on a
  screen where the photograph is width-bound (the DualUp), the image
  grows when the padding goes, and the overlay placed from the old
  rect shows the unzoomed image around it. The person: "We need the
  zoomed in loupe view to be the full area." So, under `mat: 'off'`,
  the open loupe takes the whole frame: the rule becomes
  `html[data-quiet] .image-stage[data-loupe-open] .image-frame
  { padding: 0; --mat: 0px; }` (the mat's token zeroed on that
  surface, so the image's caps let the photograph fill the space the
  mat had, ratio kept — the fifth quiet rule as before; if matte (b)'s
  "no other rule applies --mat" reads an assignment as a read, the
  case names this rule as the one allowed assignment); the padding
  transition is removed (the mat goes at once, under the glide, and
  returns at once on close); `createLoupe` sets `data-loupe-open`
  first, forces layout, then reads the image's rect and builds the
  overlay from the grown box — `fullScale` for the zoom target is of
  that box; readiness (`data-loupe-ready`) is still judged on the fit
  before opening. On close the overlay glides to s = 1 over the grown
  box, then the attribute goes and the mat returns with the image at
  its fit size. The follow rule's fractions are of the grown box.

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
  export (the name, "about 4000 px on the long edge (6000 in the first draft; 4000 kept at the Phase 2 pause)" as the starting
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
  _(Amendment 2026-09-26: the amended envelope's rows are a second table, "The tuning envelope, placed (amendment)".)_

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

## Amendment (2026-09-26): the stage's share, the pair blocks, the filmstrip

**Status**: Signed off (2026-09-26) by the `skeptical-reviewer` at the top tier — one blocking finding fixed and re-reviewed (the DualUp portrait's expected box, computed with the wrong available height), eight second-look notes taken; nothing open for the sweep from this sign-off.
**Implements**: spec.md's sections marked _(amended 2026-09-26)_ —
Goal 2's filmstrip, Goals 7–9, Entities, the flows "Looking through
every stage", "Arriving at the photograph" and "Writing a pair", the
Design requirements "Width", "The stage's size", "The filmstrip" and
"The pair blocks", the Authoring requirements, the envelope's new
bullet, and the six criteria under "_Amended 2026-09-26:_" (AC 15–20
here, numbered on from AC 14).

Three additions to a built spec, in the same arrangement as the rest:
one CSS rule and its `sizes` mirror for the stage; two descriptors in
the transform that reuse the compare's structure and markup; one more
view in `enhanceCompare`. No dependency. Everything above this section
stands except two statements this section supersedes, deliberately:
"Nothing else moves"' ban on hunks in the paper frame's rule (T1720
replaces `html:not([data-quiet]) .image-frame`; `.image-stage`,
`.image-frame`, `.image-frame img`, every quiet rule and the loupe
section stay untouched, and their pins in matte.test.mjs pass
unedited), and the compare's "three motion rules and nothing else"
(five, T1726). The five scale tests are applied as before; where the
simpler shape was taken the bullet says so.

### Shape of the change (amendment)

- **The constitution, again** (`CLAUDE.md`, T1719, its own commit
  before T1720, on this branch for the reason "The constitution,
  first" gives). Three edits, exact text:
  - The block-vocabulary list's tail "and one interactive block,
    compare (an ordered list of a photograph's stages — each an image,
    a label and a note — looked at three ways), with captions via the
    container form;" becomes "and three blocks that take a
    photograph's stages (each an image, a label and a note): compare,
    an interactive block that looks at an ordered list of them four
    ways, and two that hold a pair — side, the two beside each other
    as plain figures, and slider, an interactive wipe between them —
    with captions via the container form;".
  - "an _interactive_ block — `compare`, and any after it — is built
    as" becomes "an _interactive_ block — `compare` and `slider`, and
    any after them — is built as".
  - The Images paragraph's "may be placed in a body only as a stage of
    a `compare` block in its own folder." becomes "may be placed in a
    body only as a stage of a `compare`, `side` or `slider` block —
    the three blocks that take stages — in its own folder."

- **The stage's share** (`src/styles/global.css`,
  `src/lib/stage-sizes.ts`, the image page, the mat sampler, T1720).
  Spec 017's rule — `--L`, `--S` and `width: min(L·q, S·r)` on
  `html:not([data-quiet]) .image-frame` — is deleted and replaced by
  one rule per shape:

      /* :root, beside --frame-nav-h; the comment above them says a share
         is at most 1 — a portrait share over 1 makes the frame taller
         than --avail-h and pushes the nav off the first screen, and a
         landscape share over 1 only runs into the frame's max-width */
      --stage-share-landscape: 1; /* a landscape's width: this share of the stage's available width */
      --stage-share-portrait: 1; /* a portrait's (and by STAGE_SQUARE a square's) height: this share of the available height */

      html:not([data-quiet]) .image-frame[data-shape='landscape'] {
        width: min(calc(var(--avail-w) * var(--stage-share-landscape)), calc(var(--avail-h) * var(--ar, 1)));
      }
      html:not([data-quiet]) .image-frame[data-shape='portrait'] {
        width: min(calc(var(--avail-h) * var(--stage-share-portrait) * var(--ar, 1)), var(--avail-w));
      }

  `--avail-w` and `--avail-h` are the stage's, unchanged (the page
  less its side pads; the first screen below the header less the two
  spacings and `--frame-nav-h`), so while each share is at most 1 the
  frame's height is at most `--avail-h` in both rules — the nav line stays on the first screen
  and spec 013's cap on the image still never binds. The shape is read
  at build time: `stage-sizes.ts` gains

      export const STAGE_SQUARE = 'portrait';   // tunable: a square is sized as a 'portrait' or a 'landscape'
      export const STAGE_SHARE = { landscape: 1, portrait: 1 } as const;   // mirrors :root's two tokens
      export function stageShape(ar: number): 'landscape' | 'portrait'   // ar > 1 landscape, < 1 portrait, 1 → STAGE_SQUARE

  and the page's stage figure and the sampler's both write
  `data-shape={stageShape(ar)}` beside `--ar`. Why an attribute and
  not CSS math: the rule is discontinuous at the square whenever the
  two shares differ (with the portrait share at 0.9, at 1512×982 a
  1.001 frame is 782px wide by the landscape rule, a 1.0 frame 703 by
  the portrait one — at the opening shares of 1 the two expressions
  agree at the square, but the shares are tunables) and no
  `min`/`max`/`clamp` expression is; `sign()`
  could, but the square's side would then be an edit to the rule and
  matte.test.mjs's evaluator would have to learn it — the attribute
  keeps the square one value and each rule one line of the spec's
  words. `stageSizes(ar)` spells the rule of `stageShape(ar)` in
  literals, the shares from `STAGE_SHARE`: landscape
  `min(calc(AVAIL_W * 1), calc(availH(nav) * ar))`, portrait
  `min(calc(availH(nav) * <1·ar>), AVAIL_W)`, at both nav branches
  as today. The token and the literal stay one by the existing
  evaluation ("the sizes hint agrees with the rule" reads the shares
  from `:root`) and by a pin that `STAGE_SHARE` equals the two tokens.
  The stage section's comment (global.css ~1893–1929) is rewritten for
  the share rule; the comments on `.image-stage` and the quiet rules
  keep their words. The spacing needs no rule: the stage hugs the
  frame (`--stage-pad` = `--block-margin` above and below), the nav's
  `margin-block-end` is `--block-margin` and `.image-head` adds no top
  padding, so the nav line sits one frame-to-prose spacing under the
  frame and the title one under the nav — the spec's "no further",
  read (T1720 measures it). The stage `<img>` keeps its 2320px cap:
  the laptop's landscape at 1171.5 CSS px asks 2343 device px, 1%
  over it.

  Expected boxes at `:root`'s opening shares of 1 (header 76px, nav
  29px, pads 32px; spec 017's rule beside them, and the boxes at nine
  tenths, for the pause):

  | Screen    | Ratio | Share rule at 1 (w × h) | Bound by        | Spec 017 (w × h) | At 0.9 (w × h) |
  | --------- | ----- | ----------------------- | --------------- | ---------------- | -------------- |
  | 1512×982  | 3:2   | 1171.5 × 781.0          | height          | 781.0 × 520.7    | 1171.5 × 781.0 |
  | 1512×982  | 2:3   | 520.7 × 781.0           | portrait share  | 520.7 × 781.0    | 468.6 × 702.9  |
  | 1280×1440 | 3:2   | 1216.0 × 810.7          | landscape share | 1216.0 × 810.7   | 1094.4 × 729.6 |
  | 1280×1440 | 2:3   | 826.0 × 1239.0          | portrait share  | 810.7 × 1216.0   | 743.4 × 1115.1 |

  (2:3 at exactly ⅔, which is what T1720's matte.test case evaluates
  to ±0.1px; a page's written `--ar` of 0.667 reads up to 0.4px wider,
  inside the browser read's ±1px.) At 1 the share rule differs from spec 017's
  in two boxes of the four — the laptop's landscape grows from 781 to
  1171.5 wide and the DualUp's portrait from 1216 to 1239 tall (spec
  017 bound it by the width, the share rule by the height); the other
  two stay within a pixel of what he sees today. The share is the
  lever he asked for, tuned at the pause.

- **The pair blocks in the transform, and the fourth mode**
  (`remark-pieces-blocks.mjs`, `src/lib/image-meta.mjs`, T1721). Two
  descriptors after `compare`, the compare's structure reused whole:

      side:   { forms: 'container', body: 'stages', structure: 'compare', count: { min: 2, max: 2 },
                attrs: { required: [], optional: [], enums: {} }, sizing: stageSizing }
      slider: { …the same… }

  `stageSizing` is the compare's existing sizing function, named once
  and shared by the three descriptors, so every stage image in a body
  carries `compareSizes(COMPARE_WIDTH.piece)` whatever block holds it
  (AC 19). The count check reads `max` when present: `min === max`
  says "takes exactly two stages". The `compare` branch builds all
  three: root classes `piece-block piece-<name> compare
  compare-w-<width>` with `<width>` = `PAIR_WIDTH[name] ??
  COMPARE_WIDTH.piece`; below the root the one shape, class for class;
  `data-mode` only on a compare that wrote one. One shape, one root
  class, told apart by the `piece-<name>` class every block already
  carries — no new attribute, and the barrier's scan 3 and the plugin
  keep one rule (simpler than three root classes, which would need
  scan 3 and `enhanceCompare` to learn a list). `rejectBorrowedPrivate`
  takes the block's name so its line reads "a side may show…";
  `validateAttributes`, when a block allows none, says "side takes no
  attributes". `image-meta.mjs`: `COMPARE_MODES` gains `'filmstrip'`
  (so the transform's `mode` enum does); `PAIR_WIDTH =
  Object.freeze({ side: 'wide', slider: 'column' })` — the pair
  blocks' width, one value each (side by side's and the slider's
  kept widths; bodies are their only surface); `BLOCK_BODIES` gains
  `side: 'stages'`, `slider: 'stages'` in the descriptors' commit;
  `firstAltFor` skips a container whose `BLOCK_BODIES` kind is
  `'stages'` (not only `compare`), since a stage's image text is its
  label. `hasBlock(story, 'compare')` stays the section's suppressor:
  the spec steps the section aside for a story's `compare` only, so a
  story's `side` or `slider` shows beside the section — the case
  AC 19 pins.

- **The barrier: one file per stage** (`scripts/check-private-files.mjs`,
  T1722). Scan 2's lists gain `data-paging` and the class
  `compare-arrow` (T1726's script-only state). A fourth scan, in the
  same pass: `compares()` keeps each pane `img`'s `srcset` and `sizes`;
  per page, every candidate URL of every stage image maps to the
  `srcset`+`sizes` pair it first appeared in, and a stage image whose
  candidate is already mapped to a different pair fails. Identical
  `srcset` and `sizes` at one viewport give the browser one choice, so
  "one candidate list per stage file per page" is "fetched once"
  (AC 19); keyed by URL equality alone, it stays name-independent like
  scan 1. The summary line gains "S stage images, one candidate list
  per file".

- **The side block's static form, the fixtures, the page's stage
  images** (`global.css`, `src/lib/compare.ts`, the fixtures, the
  image page, T1723). `side` is final without script: the side-by-side
  view's rules take `.piece-side` into their selector lists — the pane
  at `aspect-ratio: var(--ar)`, the image `object-fit: contain` on
  `--color-bg` — and the static form adds `.piece-side { container:
  compare-side / inline-size; }`, `.piece-side .compare-frames {
  grid-template-columns: 1fr 1fr; }` (the grid itself and its gap
  are the static `.compare-frames` rule's — `display: grid; gap:
  calc(var(--baseline) / 2)`, global.css ~2129, under no `data-js` —
  so the side's two columns need only the template; the enhanced
  `[data-view='side']` frames rule is never matched by a block without
  script) and `@container compare-side
  (width < 560px) { .piece-side .compare-frames {
  grid-template-columns: 1fr; } }` (560px = 2 × `sideMinPx`, the
  compare's own threshold at opening; the side's is its own tunable
  from here). Each stage's caption stays shown, label · note beneath
  its pane (T1709j's dot). `enhanceCompare` skips `.piece-side` (one
  line), so no script touches it. The page's section builds its stage `<img>` from `getImage`, not
  `<Image>` (D1723): under a layout, `<Image>` writes `fit: 'cover'` and
  `position: 'center'` into every request (`components/Image.astro`,
  `props.fit ??= imageConfig.objectFit ?? 'cover'`), both are in
  `DEFAULT_HASH_PROPS`, the transform's Markdown images reach `getImage`
  with neither, and `getImage` never reads `image.objectFit` — so the
  component and the transform cannot hash alike whatever the page passes
  (`fit="none"` is dropped by the service; `position` cannot be unset
  through `??=`). A stage's request is spelled once:
  `stageImageOptions(surface)` in `image-meta.mjs` returns `{ layout:
  'constrained', sizes: compareSizes(COMPARE_WIDTH[surface]) }`; the
  transform's `stageSizing` is `() => stageImageOptions('piece')`, and the
  page calls `getImage({ src, alt: label, ...stageImageOptions('page') })`
  in the `compare` map and writes `<img src={stage.src}
  srcset={stage.srcSet.attribute} {...stage.attributes} />` in the pane —
  attribute for attribute what Astro's Markdown pipeline writes
  (`vite-plugin-markdown/images.js`), as the og and loupe files are
  already built. Neither side passes `width`, so both request the
  source's own widths. The section's `<img>` loses
  `data-astro-image-fit="cover"`; nothing reads it
  (`image.responsiveStyles` is off, so Astro's `[data-astro-image-fit]`
  rules never ship; the pane's `object-fit: contain` is the site's own).
  Scan 4 cannot see this: keyed by URL, two builders emitting disjoint URL
  sets for one source never collide — the one-request fact is pinned at
  the source (test (a)) and observed on the built land-b page. Fixtures: the
  fog piece, after its compare, gains a fixture sentence, `:::side`
  (Camera, Tones) and `:::slider` (Camera, Finished); `_land-b.md`'s
  story gains, at its end, a fixture sentence and `:::slider` (Camera,
  Finished) — so the land-b page holds both builders over two stages
  on every build.

- **The filmstrip's state** (`src/lib/compare.ts`, T1724). `COMPARE`
  gains, each with its comment:

      stripWraps: false,          // the filmstrip's last stage pages on to the first
      stripEnds: 'hide',          // an arrow with nowhere to go: 'hide' it, or 'quiet' (muted, aria-disabled)
      stripKeys: { back: ['ArrowLeft'], next: ['ArrowRight'], first: ['Home'], last: ['End'] },
      stripWheel: true,           // a horizontal wheel or trackpad scroll moves the strip
      stripWheelIdleMs: 150,      // a wheel's end: the strip settles after this long without one
      stripWidth: 'surface',      // the width class the filmstrip wears: 'surface' (the block's own, as the switch) or one of COMPARE_WIDTHS

  `COMPARE_WORDING.modes` gains `filmstrip: 'Filmstrip'` (the control's
  fourth word) and `strip: { back: 'Previous stage', next: 'Next
  stage' }` (the arrows' names). Pure: `stripAt(from, by, n)` — the
  strip's position, clamped to `[0, n − 1]`; `stripSettle(at, n)` —
  the nearest stage (`Math.round`, clamped); `stripEnds(stage, n,
  wraps)` — `{ back, next }`, whether each arrow has somewhere to go.
  Stepping reuses `switchNext(i, n, dir, COMPARE.stripWraps)` — a
  second caller, not a second function. `restView('filmstrip', n)` is
  `{ stage: 0 }` and `noteIndex('filmstrip', view)` the stage, as the
  switch's. The strip and the switch show one `stage`: entering the
  filmstrip opens on the switch's stage and back.

- **The slider block, enhanced** (`compare.ts`, `global.css`, T1725).
  `enhance()` reads `fixed = root.classList.contains('piece-slider')`:
  the mode is `'slider'` whatever is stored or authored, nothing is
  read from or written to the store, no method control and no hint are
  built, and the legend is two `li.compare-stop`, each its label as
  text — no buttons, no side tags; the pair is `restView('slider', 2)`
  (first left, second right) and never changes; the handle, the drag,
  the touch, the keys and the live note are the compare's, the note
  the second stage's (`noteIndex`). CSS, one rule on the legend's
  existing row (its 1rem gap): `.piece-slider .compare-stop +
  .compare-stop::before { content: '·'; margin-inline-end: 1rem;
  color: var(--color-muted); }` — "Camera · Finished", T1709j's dot;
  the fixed legend's shape, pinned by body.

- **The filmstrip, enhanced** (`compare.ts`, `global.css`, T1726). The
  fourth view of `render()`. The script writes `--i: k` on each stage
  and `--strip-at` (the strip's position, a number) on the root; the
  showing stage is `stripSettle(at)`, its part `"on"`, every other
  `"strip"` (visible, off the frame); the legend's buttons go to a
  stage, marking the showing one; no side tags, no hint (the switch's
  hint rule takes the filmstrip into its list); the note is the
  showing stage's. Two `button.compare-arrow` (`data-dir="back"` /
  `"next"`, `aria-label` from `COMPARE_WORDING.strip`, text `←` / `→`)
  are appended to the frames, per `stripEnds` hidden (`'hide'`) or
  `aria-disabled` (`'quiet'`). The frames take `tabindex="0"`; a
  `stripKeys` key steps, goes first or last, and stops propagating. A
  pointer drag (touch or mouse — one path, as the slider's) follows
  the hand: `at = stripAt(start, −dx / width, n)`, no transition; on
  release `stripSettle`. A `wheel` listener on the frames (non-passive,
  its `deltaMode` converted as the loupe's is) acts only in the
  filmstrip, with `stripWheel`, and when `|deltaX| > |deltaY|`:
  `preventDefault`, `at = stripAt(at, deltaX / width, n)`, and the
  settle after `stripWheelIdleMs` with no wheel. A click on the frame
  does nothing (the spec lists arrows, keys, swipe, scroll and legend).
  The width class swaps per `stripWidth` as side by side's does per
  `sideWidth`. Movement: a page (arrow, key, legend) writes
  `data-paging`, the settle after a drag or a wheel writes
  `data-settling` — each only when `!reducedMotion()`, so under reduced
  motion both cut, and each only when the target differs from the
  current `at` (the slider's settle guard, `if (to === p) return`,
  T1708): a key or a legend click at an end of a strip that does not
  wrap, or a settle already on a stage, writes neither, since no
  transition would run to clear it and the next drag would lag the
  hand — and `transitionend` on `--strip-at` clears both; a drag's
  `pointerdown` clears both too.
  CSS:

      :root { --compare-peek: 0px; }   /* how far each neighbour shows beyond the frame's edge */
      @property --strip-at { syntax: '<number>'; inherits: true; initial-value: 0; }
      .compare[data-view='filmstrip'] .compare-frames { overflow: clip; overflow-clip-margin: var(--compare-peek); touch-action: pan-y; }   /* T1729f: was overflow: visible + clip-path, which left the off-frame stages in the page's width */
      .compare[data-view='filmstrip'] .compare-stage { transform: translateX(calc((var(--i) - var(--strip-at)) * 100%)); }
      .compare[data-paging] { transition: --strip-at var(--dur-move) var(--ease-move); }
      .compare[data-view='filmstrip'][data-settling] { transition: --strip-at var(--dur-state) var(--ease-state); }

  plus the arrows' rules — the handle's look: a `--compare-handle`
  disc, 1px `--color-accent` border, `--color-bg` fill, accent glyph in
  the mono face, no shadow; at the frame's sides, 0.5rem in, vertically
  centred; muted when `aria-disabled`; `display: none` outside the
  filmstrip. The strip is a transitioned registered property, not
  native scrolling: a smooth scroll or `scroll-snap` settles on the
  browser's curve and cannot read `--dur-move`. The settle rule is
  scoped to the filmstrip so the slider's pinned `.compare[data-settling]`
  stays byte for byte. No rule sets `opacity: 0`; no reduced-motion
  rule is added (the gates are in script, spec 018's split).
  _As built (T1726):_ the wheel clears `data-paging` and `data-settling`
  before it moves the strip (else the strip lags a running slide); the
  wheel's idle settle fires only while the block is still in the
  filmstrip and no drag is in progress; the strip keys work from anything
  inside the frames (a focused arrow too); a `pointerdown` on an arrow
  does not start a drag (capture would swallow the click); the arrows'
  small literals (0.75rem, line-height 1, no padding, pointer; muted as
  `--color-muted` border and colour with a default cursor) are pinned in
  (e); `--strip-at` is written rounded to 1e6 as `slide()` does. The
  frames rule's `clip-path` clips the frames' own focus ring at peek 0 —
  put to the person at the pause.

- **Obsidian** (`obsidian-plugin/compare.ts`, `main.ts`, T1727).
  `COMPARE_PATTERN` becomes `STAGES_PATTERN`,
  `^:::(?:compare|side|slider)(\{[^}]*\})?[ \t]*\n([\s\S]*?)\n:::[ \t]*$`
  — the group numbers unchanged, `:::sidebar` not matched; `main.ts`
  imports it under the new name and renders all three with the
  compare's widget and class; comments say "the three blocks that take
  stages".

- **The documents, again** (T1728): `AUTHORING.md` — "A compare in a
  piece" gains `mode="filmstrip"` and what it does; a new "A pair: side
  and slider" section after it (the flow's example verbatim, exactly
  two stages, no attributes, a private file from its own folder, the
  same files fetched once however many blocks show them); the private
  files' text names the three blocks. `README.md` — the image page's
  stage sentence (~149) states the share rule; the vocabulary table
  gains `side` and `slider`, the compare's `mode` list `filmstrip`.
  `obsidian-plugin/README.md` — the table's rows for `:::side` and
  `:::slider`, shown as a compare is. `ROADMAP.md` and `DECISIONS.md`
  at close-out (T1718, amended).

### The tuning envelope, placed (amendment)

The envelope's amended bullet, row by row; a round is the value, its
row in the named test, and one Decided line in spec.md, as above.

| Envelope item                                        | One place                                                                                           | Pinned by                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| the stage's two shares                               | `--stage-share-landscape`, `--stage-share-portrait` (`:root`); `STAGE_SHARE` mirrors them            | matte.test.mjs "the stage's shares", "the sizes hint agrees with the rule" |
| a square as a portrait or a landscape                | `STAGE_SQUARE` (stage-sizes.ts)                                                                     | matte.test.mjs "stageShape"                                         |
| the filmstrip's arrows: place and shape              | the `.compare[data-js] .compare-arrow` rules                                                        | compare.test.mjs (e) rule bodies                                    |
| the arrows at the ends; wrapping                     | `COMPARE.stripEnds`; `COMPARE.stripWraps`                                                           | `EXPECTED`                                                          |
| the filmstrip's keys; how a wheel moves it           | `COMPARE.stripKeys`; `COMPARE.stripWheel` (`false` / `'follow'` / `'page'`, T1729b), `stripWheelStepPx`, `stripWheelIdleMs` | `EXPECTED`; compare.test.mjs (d) `stripWheelStep` table            |
| the neighbours' sliver                               | `--compare-peek` (`:root`)                                                                          | compare.test.mjs `TOKENS`                                           |
| the filmstrip's width                                | `COMPARE.stripWidth`                                                                                | `EXPECTED`                                                          |
| each pair block's width                              | `PAIR_WIDTH` (image-meta.mjs)                                                                       | image-meta.test.mjs; the transform's side/slider shape cases        |
| the `slider` block's fixed legend's shape            | the `.piece-slider .compare-stop + .compare-stop::before` rule                                      | compare.test.mjs (e) rule body                                      |
| where a `side` stacks                                | the `@container compare-side (width < 560px)` literal                                               | compare.test.mjs (e) by string                                      |
| the filmstrip's durations                            | the two strip motion rules (page: move; settle: state)                                              | compare.test.mjs (c) rule strings                                   |

`stripWheelIdleMs` is not an envelope item; it sits in `COMPARE` so no
constant hides outside it (the Phase 1 review's note on
`CLICK_SLOP_PX`).

### Failure messages (amendment)

The transform, through `file.fail`, naming the piece and the line:

```
side takes exactly two stages (one per line: ![Label](./file.jpg) then its note); got 3
slider takes exactly two stages (one per line: ![Label](./file.jpg) then its note); got 1
unknown attribute "mode" on side — side takes no attributes
"../beta/_photo.jpg" is a private file of another folder — a slider may show a private file only from its own folder; a public photograph may be borrowed (../beta/photo.jpg)
invalid value "carousel" for mode on compare — allowed: slider | side | switch | filmstrip
```

The barrier:

```
[check-private-files] one stage, two candidate lists in dist/images/where-the-fog-lets-go/land-b/index.html: /_astro/…webp (its srcset or sizes differ)
[check-private-files] a script-only state in the markup of dist/pieces/x/index.html: data-paging
[check-private-files] N loupe files on M image pages, K of them detail exports named nowhere else; C compares in one shape; S stage images, one candidate list per file; no compare or loupe state in P pages.
```

The refusal of a private file in any other block keeps its hint ("…or
show it as a stage of a :::compare in this folder"): still true
advice, and its pins stay unedited.

### Testing strategy (amendment)

- **The constitution** — **T1719**: the three edits greped verbatim;
  the commit touches `CLAUDE.md` alone and precedes T1720's.

- **The stage's share** — matte.test.mjs, **T1720**. (b): the two
  shape rules' declarations exactly (the `--L`/`--S` pin goes with the
  rule it pinned); the two tokens declared once, on `:root`, at `1`;
  `STAGE_SHARE` equal to them; `.image-stage`, `.image-frame`,
  `.image-frame img` and the quiet list unedited. (c): "one rectangle,
  turned" is replaced — its rule is the one the spec removes, so this
  is a retargeted test, not a weakened one — by "the stage's share":
  over the grid, the evaluated width equals the share rule computed in
  the test from the stage's limits and `:root`'s shares for
  `stageShape(ratio)`, the frame fits both limits and touches its
  share or the other bound, the cap never binds; and the table above
  at the fallback header (76px), 3:2 and 2:3 at 1512×982 and
  1280×1440, to ±0.1px. "stageShape": 1.5 landscape, 0.667 portrait,
  and 1 → the literal `'portrait'` in the test's row — not the
  imported `STAGE_SQUARE`, which would move both sides of the
  assertion (a square round edits this row, as every envelope row is
  edited); the page's and the sampler's source write
  `data-shape={stageShape(`. The `paperEnv` helper (matte.test.mjs
  ~777–799) is retargeted with the case: it now picks the
  `${PAPER_FRAME}[data-shape='…']` rule by `stageShape(ratio)` and
  drops `--L`/`--S` from its env (the evaluator already honours
  `var(--ar, 1)` and reads the shares from `:root`), and the
  sizes-hint case then runs unchanged over it. Mutations: a share
  moved in `:root` alone → the token pin and "sizes = width" fail;
  `STAGE_SQUARE` flipped → "stageShape" fails. In the browser (BiDi)
  at both screens on a 3:2 and a 2:3 page: the frame's rect against the
  table (±1px, the real header measured), frame bottom → nav top and
  nav bottom → head top (each `--block-margin`, 48px ± 1), the stage
  image's `currentSrc` width; the quiet view's frame rect equal to
  `main`'s at the same viewport.

- **The pair blocks' shape and failures** —
  remark-pieces-blocks.test.mjs, **T1721**, the compare cases'
  helper and fixtures: `:::side` with two stages →
  `figure.piece-block.piece-side.compare.compare-w-wide` > frames > two
  stages, labels and notes in order, no `data-mode`, no link;
  `:::slider` the same with `piece-slider` and `compare-w-column`; each
  stage `img`'s `sizes` equal to a compare's; one and three stages each
  fail naming the count; `mode="slider"` on `side` fails with the
  no-attributes line; an own-folder private stage renders; the
  borrowed private fails naming the block though the file exists, the
  borrowed public renders; `:::compare{mode="filmstrip"}` renders with
  `data-mode="filmstrip"`, `mode="carousel"`'s line lists four.
  image-meta.test.mjs: the agreement case with the two new bodies;
  `PAIR_WIDTH`'s values in `COMPARE_WIDTHS`; `firstAltFor` skipping a
  `side` that comes first; `passageFor` giving no caption for a
  `slider`. remark-pieces-vocabulary.test.mjs: the known-blocks list
  ends `…held, compare, side, slider`. Mutation: the `max` check
  dropped → the three-stage case fails.

- **One file per stage** — private-files.test.mjs, **T1722**, T1703's
  temp-dir shape: two compares whose stage images share URLs with
  identical `srcset` and `sizes` → 0 and the summary's count; the same
  URL in two stage images with different `sizes` → 1; with different
  `srcset` → 1, both naming the page and the URL; a URL shared by a
  stage image and a non-stage `img` → 0; `data-paging` and
  `class="compare-arrow"` in markup → 1 each, and in `<script>` text
  only → 0.

- **The side's static form; one file on a built page** — **T1723**:
  the build's barrier line counts the three new blocks among its
  compares (before and after recorded) and the stage images; greped from `dist/`: the fog piece's side and slider (their
  root classes, two stages each) and every `_land-b.jpg` stage image
  on the fog piece and on land-b carrying one `srcset` string
  (quoted); mutation: `width: 1400` added to the page's `getImage` call → test
  (a)'s failing line pasted, reverted (D1723: scan 4 cannot see it); the
  story slider's and the section's panes for `_land-b.jpg` quoted with
  one identical `srcset` string, the section `<img>`'s attribute list
  equal to the story's. compare.test.mjs (a): the section's stage
  `<Image>` passes no `width`; `enhanceCompare` skips `.piece-side`. In
  the browser at 1512×982: the side's two panes at equal widths and one
  top, captions shown, no `data-js`, script on or off; at 480px
  stacked; the resource timeline on the fog piece and on land-b holds
  one request per stage file.

- **The filmstrip's state** — compare.test.mjs (d), **T1724**:
  `EXPECTED` with the six keys and the words; `stripAt` (adds, clamps
  both ends), `stripSettle` (0.49 → 0, 0.5 → 1, clamps), `stripEnds`
  at first, middle, last, and wrapping; `switchNext` with `stripWraps`
  at both ends; `restView` and `noteIndex` for the filmstrip; the
  control's modes equal `COMPARE_MODES` in order. Mutations:
  `stripWraps` flipped → `EXPECTED` fails by name; `stripSettle` by
  `Math.floor` → the 0.5 case fails.

- **The slider block** — **T1725**: compare.test.mjs (e): the fixed
  legend's rule by exact body. In the browser at both screens on
  the fog piece's slider: `data-js`, `data-view="slider"`, no
  `.compare-control`, no `.compare-hint`, no `button` in the legend,
  legend text "Camera", "Finished"; split 50 at rest, drags at
  25/50/75 set it and the parts (Camera left), ← moves `aria-valuenow`
  by 2; the note Finished's; `sessionStorage`'s `compare-mode` unchanged
  by it, and a stored `side` does not change it; no script: stacked.

- **The filmstrip, enhanced** — **T1726**: compare.test.mjs (b)
  `TOKENS` gains `--compare-peek: 0px`, read by the frames rule; (c)
  `MOTION` gains the two rules and "the five are all its motion", the
  `@property --strip-at` block, and `data-paging` and `data-settling`
  written only behind `!reducedMotion()`; (e) the arrows' rules by
  body. motion.test.mjs green unedited. In the browser at both screens
  on land-b's section: Filmstrip → `data-view`, `--strip-at` 0, stage
  k's rect at `k × w` from the frame's left, back arrow hidden; next →
  `data-paging` and a 480ms transition on `--strip-at`, then 1, note
  Tones; →, End, Home; at the last, next hidden; a legend click slides
  back; a synthesised pointer drag of −0.6w → 0.6 while held, settling
  to 1 on release with `data-settling` and 180ms; a synthesised wheel
  of `deltaX` 0.4w → +0.4, settling after the idle; a vertical wheel
  moves nothing; under reduced motion (the `ui.prefersReducedMotion`
  pref) no `data-paging`, no transition, the cut; `--compare-peek`
  set to 2rem inline → the neighbours' 32px showing beyond each edge
  (rects), reverted; no script: stacked.

- **Obsidian** — obsidian-plugin.test.mjs, **T1727**: the pattern
  matches `:::side` and `:::slider` blocks whole and not `:::sidebar`;
  the compare cases unchanged.

- **The documents** — **T1728**: greps and Prettier, as T1715.

### File structure (amendment)

```
CLAUDE.md                                 the vocabulary clause, the interactive sentence, the images paragraph (T1719, its own commit)
src/styles/global.css                     :root: the two stage shares (T1720), --compare-peek (T1726); the stage's paper rule and its comment (T1720); the side's static rules (T1723); the slider block's legend (T1725); the filmstrip, its arrows, @property --strip-at, two motion rules (T1726)
src/lib/stage-sizes.ts                    STAGE_SQUARE, STAGE_SHARE, stageShape, stageSizes retuned (T1720)
src/pages/images/[...id].astro            data-shape on the stage figure (T1720); the section's stage <Image> without width (T1723)
src/pages/dev/matte/[...surface].astro    data-shape on the sampler's stage figure (T1720)
matte.test.mjs                            (b) the shape rules and the shares; (c) "the stage's share" in place of "one rectangle, turned" (T1720)
src/lib/image-meta.mjs                    COMPARE_MODES + filmstrip, PAIR_WIDTH, BLOCK_BODIES side/slider, firstAltFor's skip by kind (T1721)
remark-pieces-blocks.mjs                  side and slider, stageSizing, the count's max, the borrowed line's block name, the no-attributes line (T1721)
remark-pieces-blocks.test.mjs, image-meta.test.mjs, remark-pieces-vocabulary.test.mjs   T1721's cases
scripts/check-private-files.mjs           scan 2's two names, scan 4 (T1722)
private-files.test.mjs                    T1722's cases
src/content/pieces/where-the-fog-lets-go/ index.md's side and slider; _land-b.md's story slider (T1723)
src/lib/compare.ts                        the side skip (T1723); COMPARE's strip keys, the words, stripAt/stripSettle/stripEnds (T1724); the fixed slider (T1725); the filmstrip view (T1726)
compare.test.mjs                          (a) T1723; (d) T1724; (e) new, T1725–T1726; (b), (c) T1726
obsidian-plugin/compare.ts, main.ts       STAGES_PATTERN (T1727)
obsidian-plugin.test.mjs                  T1727's cases
AUTHORING.md, README.md, obsidian-plugin/README.md   T1728
```

Untouched, as above, and now also: the quiet rules, `.image-stage`,
`.image-frame`, `.image-frame img` and the loupe section of
`global.css`; `src/lib/loupe.ts`; `motion.test.mjs`; the reduced-motion
block; `content.config.ts`; `src/lib/images.ts`.

### Known limitations (amendment)

- **A share below 1 shrinks boxes he knows** (the table above): at
  nine tenths the laptop's portrait (703 tall against 781) and both
  on the DualUp (a 3:2 1094 wide against 1216, a 2:3 1115 tall
  against 1216) are smaller than under spec 017, and a phone's
  landscape narrows (322px on a 390px phone against 358). The spec
  opens both shares at 1 for that reason (Decided, 2026-09-26), where
  the laptop's landscape and the DualUp's portrait grow and nothing
  shrinks; the Phase 3a look puts the
  numbers to him before any share is lowered.
- **The first screen weighs more on the laptop**: a larger landscape
  picks a larger candidate (the 2320px one where 1668 served).
- **`sizes` follows `COMPARE_WIDTH` per surface.** A round that sets
  the piece's and the page's widths apart makes land-b's story slider
  and its section two candidate lists of one stage; scan 4 then fails
  naming the page, and that round sets one hint for both.
- **Scan 4 is blind to disjoint URL sets from one source** (D1723).
  Keyed by URL and reading no names, it cannot tell that two hashed
  files are one photograph, so a builder that requests a different
  transform (a `fit`, `quality`, `width` or `position`) passes it. The
  source pin (test (a)) holds that line for the two builders that exist.
  Should a third builder of stage images appear, the key to add is a
  declared identity both builders write (the stage file's basename as a
  data attribute, required by scan 3) — not Astro's file-name shape.
- **`<Image>` and `getImage` never share a file under a layout.**
  `Image.astro` adds `fit: 'cover'` and `position: 'center'` to every
  request; both are hashed; `getImage` adds neither and ignores
  `image.objectFit` (that option changes only the component's defaults
  and an unshipped stylesheet). Anywhere the site needs two `<img>`s of
  one file to share transforms, both must be built from `getImage` —
  the loupe (T1710) and the stage section (D1723) are the two cases so
  far.
- **The side's stacking is CSS, the compare's side by side script**:
  both open at 560px and are separate tunables from here.
- **A settle is by position**: the nearest stage on release, no
  flick; a wheel's end is inferred from `stripWheelIdleMs` of quiet
  (browsers send no end event). A wrapping strip, if a round turns it
  on, slides back across every stage.
- **A real trackpad's horizontal scroll and a real swipe** are
  synthesised in the headless reads; the person attests them.

### Resolved decisions (amendment)

- **The stage's shape is read at build time** (`data-shape` from
  `stageShape`), because the share rule is discontinuous at the square;
  see the bullet.
- **The shares are `:root` tokens, mirrored in `stage-sizes.ts`** and
  held to them by evaluation, the arrangement `stageSizes` already has
  with five tokens.
- **The pair blocks are the compare's markup**, one root class and one
  shape, told apart by `piece-side` / `piece-slider`; scan 3 and the
  plugin keep one rule, and the image page builds neither.
- **`side` has no script at all**; its stacking is a container query.
- **"Fetched once" is pinned two ways** (D1723). Scan 4 pins one
  candidate list per stage URL per page — a stage the builders emit at
  one URL cannot carry two lists. That the builders emit one URL at all
  is pinned at the source: the stage request is spelled once
  (`stageImageOptions`), both builders reach `getImage` with it, and
  test (a) holds the page to that call. The earlier claim that scan 4
  fails on a restored width cap was wrong — scan 4 reads no names, so
  two builders with disjoint URL sets pass it. The story's `side` or
  `slider` does not suppress the section, as the spec says only a
  `compare` does.
- **The filmstrip moves a registered property on the tokens**, not the
  browser's scroll; the switch and the filmstrip share one showing
  stage; a click on its frame does nothing; a mouse drags it as a
  finger does (one pointer path).
- **The filmstrip's settle reuses `data-settling`** in a rule of its
  own, so the slider's pinned rule is unedited.
- **The slider block's note is the live note of its second stage** — a
  reading: the spec says "the pair's note" (Goal 9, Entities), "the
  live note" (Design requirements) and "the note following" (AC 17);
  the compare's live note, following the right side, satisfies all
  three with no new markup. Showing both stages' notes is the
  alternative, put to him at the Phase 3a look.
- **No new dependency.**
