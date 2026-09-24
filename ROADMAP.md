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
- **Every page a piece, and the image's study** — raised by the
  photographer during spec 014 (2026-09-18), as much a statement of intent
  as a feature: every page but the front door is meant to be a piece — a
  written thing with the site's treatments open to it — the image's page
  included. Spec 006 laid the floor (the sidecar body is the image's
  writing, "How it was made" and the compare its sections); this is the
  ceiling, reached case by case and never for every image. (1) **A
  processing overview** on the image page — the showcase entry above, which
  shares this entry's home. (2) **Analysis and critique** — a breakdown of
  the image's composition with graphics: how the eye moves through the
  frame, its lines and masses, and how the photographer thinks about these
  in the field — drawn over the photograph itself (paths and shapes in the
  frame's own coordinates, so they scale with it) or diagrammed beside it.
  That is a treatment the vocabulary does not have: an annotated image is
  neither a block nor a sidecar field today, and in plain `.md` it needs a
  directive shape and an authoring convention for the drawing (most likely
  an SVG file beside the photograph, named to it the way the private
  camera's frame is), so that a study reads as part of the page rather than
  a section bolted onto it. (3) **A study is news.** When an existing
  image's page gains one, the front door should be able to carry it beside
  new pieces — so an image page needs a date of its own for such an update
  (a sidecar field; its capture date and its piece's outing are the wrong
  dates), and the front door's "latest" has to admit an updated image page
  as well as a new piece, showing the photograph and a line, not what
  changed. (4) **Dedicated pieces about seeing** — a piece may be a study
  across several images, placing them with spec 008's cross-piece
  references, each image's page linking back to the piece that studies it
  the way "Also in" does now. For the design conversation, before any spec:
  whether a study is a sidecar section like "How it was made" or a body
  block in the image's writing that a piece can use too (the second gives
  (2) and (4) one treatment); whether the overlay is one directive with
  kinds — flow, lines, masses — or several; and how much of it the Obsidian
  plugin should render, given that container forms are still raw text there.
- ~~**Galleries and image pages**~~ — done in spec 004: the image
  registry, image pages, named galleries with a category (rows packed
  to equal short sides in editorial order — the photographer's rule
  from the sampler review, `DECISIONS.md`), the galleries index,
  category pages, every piece image linking to its page, and the GPS
  barriers. Follow-ups it surfaced: renaming an image changes its
  URL with no redirect (fine while nothing is live — a redirect map
  becomes worth having once URLs are public); an image's page doesn't
  distinguish "referenced by the piece" from "in the folder", and an
  image can belong to one piece only; image pages were not in
  Pagefind's index (spec 006 indexes the ones with something to find);
  and the post-build pruner
  (`scripts/prune-unreferenced-originals.mjs`) exists because Astro
  leaves untouched originals in the output — worth an upstream issue,
  and a no-op if they fix it.
- ~~**A galleries overhaul**~~ — done in spec 011: a gallery page's packed
  rows run wider than the text column — out to a viewport bleed chosen at a
  sampler gate on both of the photographer's screens — with a retuned gap and
  a **format-aware density** (`clamp(280px, 33vmin, 460px)`; `vmin` so a tall
  or near-square display like the 16:18 LG DualUp sizes frames up while a
  16:10 laptop holds ~320). The width, gap, and density live in
  `gallery-layout.ts`, density driving both the CSS and the srcset. Judged on
  ten real photographs (below), not placeholders. The index card grids stayed
  boxed at the content width (the gate's call). **The place page was pulled
  from this spec** — widening its outings opened a design question of its own
  (see the place-page entry below), so places were left at their pre-011
  packing and given their own spec.
- ~~**The place page's own treatment**~~ — done in spec 012: a place page is
  **one wall**. The writing, then every published photograph at the place as
  one continuous packed gallery — oldest visit first, each piece's frames in
  the piece's order — with nothing between the visits, no piece labels, and no
  list of pieces after them. The attribution the bands carried lives where the
  reader goes to look closer: each frame's own page names its piece and links
  back to it. With the labels gone the wall takes the galleries' knobs from
  `gallery-layout.ts` (spec 011's width, gap, and format-aware density,
  confirmed unchanged at the sampler gate — the local `placeFlowStyle` is
  gone), and the writing-to-wall gap is one `.section` padding chosen there:
  `--place-wall-gap: clamp(3.5rem, 5.5vw, 5.5rem)`, ≈83px prose-to-first-row
  on the laptop, taken unchanged by a place with no writing. Follow-ups it
  leaves: the page's order and the image-page arrows' order are one list only
  because both read `place.frames`, which a source-reading test pins rather
  than the type system; the gap's clamp is a literal copy of `.section`'s
  padding, since that padding has no token to reference, kept in step by a
  test and a comment; and the wall's sampler stays in the repo as the
  dev-only route `/dev/place-wall/`, behind the same build barrier the
  page-head and galleries samplers use.
- ~~**The ground tone, rethought**~~ — superseded by spec 015 (2026-09-19).
  Raised by the photographer at spec 013's matte gate (2026-09-17), in the
  same breath as keeping the mats: the mattes may not stand out enough
  against the page, and the warming at spec 003 — chosen so white mattes
  would read at all against a paper-white ground — may not have gone far
  enough; what he asked for was a look at "a number of different tones,
  both lighter and darker, maybe some with slight color". Spec 014 took it
  up and shipped its Phase 0 machinery — the family rule (the fills and
  hairlines as fixed steps from the ground, `src/lib/ground.ts`), the
  dev-only site-wide switch, the sampler's candidate bar and contrast
  readout, and the social image's generator (`npm run og`) — but its own
  gate was never answered on its terms: looking at the candidates on the
  real photographs, the photographer reconsidered the mats themselves
  rather than the ground behind them. Spec 015 made that change (the mat
  is the stage's alone) and then re-judged the ground on the unmatted
  pages with 014's switch, on both screens; the tone taken is `paper`,
  `oklch(0.99 0.003 100)`, the pre-003 white, muted text unchanged. The
  derived copies (the OG route's hexes, `public/og.jpg`, `DECISIONS.md`'s
  "Ground tone" entry) moved with it by the rule 014 landed. Spec 014 is
  closed in its own documents with the reason.
- **The pause and the hero leave the site** — decided by the
  photographer at spec 016's second look (2026-09-22), and the next
  spec: "I think we should scrap the Pause block and the stage using the
  Pause block for now, though keep it in a branch so we can revisit it at
  a later time, but remove it from the main site for now. My reasoning
  is that after testing it, it is more of an obstacle to the enjoyment
  and reading experience of a piece than an improvement. The viewer can
  still click into the image to view the Quiet View, and the fading in
  and back out is a bit awkward and a clumsy, at least as currently
  implemented." Settled with him the same day, for the spec: the whole
  arrival goes (the dark opening, the dimmed chrome, the fade) and the
  image page opens on paper as before spec 016; the pause block leaves
  the vocabulary — the transform, the styles, the Obsidian plugin, the
  fixtures, the docs — and the constitution's block-vocabulary clause is
  amended first, in its own commit; a piece that still writes `:::pause`
  fails the build loudly, naming the piece (the session's reading of his
  "yes" to an either/or; confirm at the spec); the held block stays; the
  mat rule stays as spec 016 stated it — worn where the ground is dark —
  which now means the quiet view alone, the stage bare on paper (his
  spec 015 words); the cue stays — the frame nav's previous / next line
  sits above the fold at the top of the image page, so the stage is
  shorter by that line's height on paper too (spec 016 built it under
  the arrival only, `--stage-cue` set by the arrival's gate; the removal
  spec sets it unconditionally). Spec 016's hero is archived unmerged on
  branch `016-the-hero-stage` and tag `archive/016-the-hero-stage` (its
  spec, plan, tasks and gate records live there); the pause's code is
  main's history up to this spec. His two other findings from the same
  look stand on their own below ("The stage across screen shapes").
  _Done at spec 017 (2026-09-22): the block, its presentation, its
  script and its fixtures are gone; the cue is kept on the paper stage;
  the mat is the quiet view's._
- **The stage across screen shapes** — raised by the photographer at
  spec 016's second look (2026-09-22), on the DualUp (1280×1440): "if
  the image is horizontal, it's now too small as it seems to conform to
  the text margins, which makes verticals appear much larger. I'd like
  to make sure that images are sized as evenly as possible across all
  screen sizes, again within reason … the difference between 2:3 and
  3:2 images between horizontal and vertical style screens"; and "there
  is way too much margin between the top and bottom of the image and the
  header above it and the start of the title/text below it. The text
  should always be the same distance away from the image." The stage's
  width cap at the text column and its viewport-height box are spec
  013/015's fit; a rule that sizes 2:3 and 3:2 evenly on horizontal and
  vertical screens, and a box that hugs the frame so the words sit a
  fixed distance from it, is a spec of its own after the removal.
  Questions left for it: equal short side, area or height; a share of
  the screen rather than a pixel size; a landscape frame wider than the
  text column on a tall screen; the same distance or the same share.
  _Done at spec 017 too, folded in after sign-off at the product owner's
  call: the rule kept at its pause is one rectangle turned — every frame
  fits the 3:2 reference rectangle, its long side the smaller of the
  page's width and the first screen's height — rather than equal area,
  which the pause could have chosen and did not. The questions above,
  answered: equal sides; a share of the screen, not a pixel size; the
  width past the text column; the same distance — a piece's own
  frame-to-prose spacing._
- **The mat only where the ground goes dark** — raised by the
  photographer at spec 015's gate (2026-09-19), after seeing the site
  unmatted on the paper tone: "Stage's normal view unmatted, as it blends
  into the Paper ground tone." Spec 015 leaves the image page's stage
  matted in both its normal and its quiet view; what he wants is the mat
  only where the ground is darkened — the quiet view, and the pause's dark
  stage — with the stage's normal view bare like every other frame. A
  small spec of its own: the stage rule and its test pin, the quiet view's
  mat kept, the compare's white fill and divider decided in the same
  breath, and the docs that spec 015 writes about the stage corrected.
  Not folded into 015 because the constitution keeps spec changes out of
  implementation sessions. The pause frame's own spec, which 015 also
  defers, may be the same spec. _Stated and pinned at spec 016 (worn
  where the ground is dark), which was closed unmerged; with the pause
  and the arrival withdrawn (2026-09-22) the rule leaves the stage bare
  on paper and matted in the quiet view alone. Done at spec 017: the rule
  restated and landed — the stage bare on paper, the quiet view matted,
  pinned._
- **The pause, rethought** — deferred wholesale at spec 015 (2026-09-19):
  the photographer does not like how the pause works today, and its rework
  is a spec of its own, in two parts — the pause mid-piece (the frame that
  pins at the centre of the screen while the lights go down and the words
  wait above and below it), and the pause as a hero presentation of one
  frame, the same family as the image page's stage. Until that spec lands
  the pause keeps exactly what spec 007 gave it: its white mat (the one
  matted frame a piece can still carry), its dark ground, and its lights —
  spec 015 narrowed the shared mat rules to the pause's anchor alone and
  left its own CSS, markup and script byte-identical. Spec 007's own
  follow-ups fold in here rather than standing on their own: a tall pause
  frame on a short viewport pushing an anchored paragraph partly off-screen
  while pinned; the half-screen of words a pause needs after it to finish;
  the header's focus-reveal overridden while a scene is active; a pause
  written into a sidecar story getting the CSS but not the script; and the
  lights' enumerated list of elements. Likely the same spec as the stage's
  darker field below and "the mat only where the ground goes dark" above:
  all three are about the one frame that is the whole point. _Withdrawn
  (2026-09-22): the pause left the site at spec 017; the block is
  `main`'s history up to 017's merge, and this rework, for the day it is
  revisited, starts from that history and the archive branch._
- **The stage's darker field** — deferred at spec 015 (2026-09-19): the
  photographer wants the image page's stage to sit in a field much darker
  than the page, near the quiet view's dark (`--color-quiet`), giving way
  to the light ground as the reader scrolls down into the words. Two leans
  recorded for whoever writes it: the field is the stage's own background
  and scrolls away with it — no script, no fixed layer, nothing the pause's
  lights do; and it ends at the stage's edge, the header and the frame nav
  staying on the page ground. Until then the stage's white mat on the
  paper ground reads faintly outside the quiet view — mat/bg 1.02:1, ΔL
  0.01 at the gate — an interim state spec 015 accepted and stated. Likely
  the pause's spec, since both are hero presentations of one frame; and
  "the mat only where the ground goes dark" above is the same question
  asked from the other side. _Built at spec 016 as the arrival — the
  whole page dark on arrival, lightening on the reader's scroll — and
  withdrawn at its second look (2026-09-22): "the fading in and back out
  is a bit awkward and a clumsy"; spec 017 withdrew it with the pause.
  Never merged: archived on `016-the-hero-stage`._
- **Aspect-ratio treatment for packed galleries** — raised by the
  photographer at spec 011's visual gate (2026-09-09): he edits each
  image to the crop that suits its content rather than to a house
  shape, so a gallery's frames carry slightly different aspect ratios,
  and the justified rows (equal short side, the photographer's order)
  make that variety read as awkward when frames sit side by side —
  within a row the widths differ, and row to row the heights differ.
  Spec 011 deliberately left the packing rule alone — its knobs only
  size and space the rows — so this is the follow-up that changes the
  presentation, with its own sampler on real photographs and the same
  look-and-decide gate. The options gathered at the 011 gate, to
  compare there: (1) **stay with justified rows** and lean on size and
  spacing — the ceiling of what 011 did, which mitigates but does not
  remove the variety; (2) **uniform matted frames** — every slot one
  outer shape (or two, one wide and one upright) with the photograph at
  its true ratio inside and the mat filling the rest, matted prints on
  a wall, nothing cropped, though photographs read smaller and a wide
  panorama in an upright frame goes small; (3) a **column / masonry
  layout** — a few columns, each frame at its true ratio filling its
  column and heights stacking, so only the width is shared, at the cost
  of the strict left-to-right order (it fills by column); (4) **snap
  near-ratios to a small set of house shapes** (3:2, 4:5, 1:1…) for the
  layout math only, the photograph still shown at its true ratio —
  kills the small misalignments without forcing one shape or
  reordering, the subtlest change, with a thin sliver of mat where a
  true ratio differs from its slot. The photographer's lean at the gate
  was matted frames or ratio-snapping, to be judged by eye on real
  work. **What spec 013 settled for it** (2026-09-17, the entry below):
  gallery frames **are** matted, and the mat is now a share of the frame
  rather than a fixed width — 6% of the row's target short side, clamped to
  4–40px, one width per row, so every cell in a row already wears the same
  mat. That is what options (2) and (4) were waiting on: a uniform outer
  shape is a second mat doing layout work outside the one that exists, and
  ratio-snapping's sliver would sit inside it, so either has to say how the
  two reconcile into one number per frame — costable now that the existing
  mat is a token rule rather than a literal. **What spec 015 changed for it**
  (2026-09-19): gallery frames are **no longer matted** — the mat is the image
  page's stage alone — so what the paragraph above was waiting on is gone
  the other way. Option (2), "uniform matted frames", would now mean putting
  a mat back on the galleries, a surface spec 015 deliberately took it off;
  option (4)'s sliver has no mat to sit in, and would be a field of its own
  or nothing. The entry needs a rethink — the product owner's note at spec
  015's approval — decided later, with (2) either revived by matting the
  galleries again or replaced.
- ~~**The matte, rethought**~~ — done in spec 013: **every surface keeps its
  mat** (reversed at spec 015: the mat is the stage's — the image page's
  stage and its quiet view — and the pause frame's until its own spec;
  every other surface is bare), and its width is a share of the frame
  rather than of the viewport —
  `--mat-share: 0.06`, clamped between `0.25rem` (4px) and `2.5rem` (40px),
  one rule in `global.css` resolved per geometry (a frame that knows only its
  width, only its height, both, a packed row's target short side, a matched
  pair's shared height), with every frame carrying its aspect ratio from the
  remark transform. Judged at one sampler gate on both of the photographer's
  screens and the ten real photographs (2026-09-17) — "let's stick with mats
  all over with warm background" — so the ground stayed warm then, and spec
  015 took the pre-003 white after re-judging it unmatted (the ground-tone
  entry above). `DECISIONS.md`'s "Mattes: site-applied" stands as written;
  the brief's flat-matte carve-out was narrowed at spec 015 to the stage and
  its quiet view. The ceiling bites on the wide block and the image page's
  stage on both screens at 6% and the photographer kept it there, which is the
  constraint on any later move to a larger mat. Two follow-ups it leaves, both
  only if they ever matter: a packed row's mat is a share of the row's
  _target_ short side rather than its flex-grown one, so a stretched row wears
  its mat at between `share/1.35` and `share` of its actual short side (the
  alternative gives up the exact equal-short-side fit); and the ratio probe
  reads every image file once per render for every block, a header-only read
  being the fix if build time ever bites. What the gate raised instead is the
  ground-tone entry above.
- **The front door** — to be workshopped with the photographer
  (decided 2026-09-02): the interim homepage (spec 002) stands until
  then. The starting position: the homepage is the site's thesis —
  one photograph, one sentence, the latest piece a scroll away — not
  a grid of recent work, which would undo the argument the rest of
  the site makes. A "latest" on the front door has to admit an updated
  image page beside a new piece — see the image's-study entry above.
- **A design language of its own** — raised by the photographer after spec
  012 (2026-09-13), as a longer-term direction rather than one spec. The site's
  functionality, flow, and layout come first and are still being settled; but
  as it stands the site looks and feels like a site from ten years ago, and
  there is room for something distinctive. The photographer has been reading
  showcases such as siteinspire and finding designs that use animation and
  layout in ways that serve the site's purpose, without yet seeing one that
  translates directly to this site — so this is expected to take more than one
  design pass, possibly several specs, each with a look-and-decide gate on real
  photographs and the photographer's two screens. What it is not: the
  AI-design defaults the brief already rules out, motion for its own sake, or
  anything that undoes the argument the rest of the site makes (the anti-feed,
  the image page as the signature element, the matte as flat and
  token-driven). Candidates already on this list that are really parts of it:
  the front door, the slow view, image loading choreography, and the reading
  typography pass (the matte itself shipped as spec 013 and the ground tone
  was settled at spec 015, both struck above). The first step is a design
  conversation that names what "modern" means for this site — which of the
  references' moves fit a photographer's site that wants the work looked at
  slowly — and amends `design/brief.md` before any spec is written.
  _First step taken as spec 018 (2026-09-23): a considered animation
  pass, the entry below — a subset of this direction, deliberately, not
  the whole of it. What spec 018 took: the motion grammar (three
  durations and three curves, declared once beside the mat's tokens)
  and the four behaviours on it — a photograph's appearance, its
  arrival on scroll, its travel to its page and back, the quiet view
  as one movement — written into `design/brief.md`'s Motion section;
  image loading choreography went with it. The rest is open: the front
  door, the slow view, the reading typography pass, and what "modern"
  names beyond motion._
- ~~**A considered animation pass**~~ — done in spec 018, the first
  step of the modernization and deliberately a subset of it: the four
  behaviours (a photograph's appearance, its arrival on scroll, its
  travel to its page and back, the quiet view as one movement) and the
  site's motion grammar they and every inherited transition draw from,
  under the rule "motion answers the reader", in `design/brief.md`'s
  Motion section. The glow and the settle it left stay under "Motion,
  considered" below; the rest of the modernization under "A design
  language of its own" above.
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
  page at `/places/<slug>/` carries the writing, then one wall — every
  published frame at the place packed as a single gallery, outings
  oldest first and each piece's frames in the piece's order, naming no
  piece; `/places/` lists cards, and Places sits in the nav after
  Galleries. The wall label's place is the place's title as a
  link, and the arrows step through a place's frames when the reader
  arrives from it. Never by GPS and never by the free-text `place`,
  which stays prose. Follow-ups it leaves: a place's writing is prose
  only — no photograph lives beside a place file, so images in a place's
  body need a reference shape of their own; gallery-root photographs
  still cannot join a place, though the cost of admitting them has
  fallen — spec 012 made the page one wall, so the grouping that the
  exclusion protected is gone and only an ordering rule stands in the
  way (a pieceless frame has no publish date to take its turn by, and
  the index card's summary still counts outings, which such a frame
  would join none of); their `at:` is warned about and ignored until
  then; and renaming a place is renaming its file, which breaks every
  `at:` naming it until updated, as the redirect-map item above already
  notes for images.
- **Gear** — raised by the photographer at the spec 009 close-out
  (2026-09-06), in two parts, the first a design conversation before
  any spec. (1) What a gear section is: the photographer intends to
  write about the cameras, lenses, tripods, and accessories they use —
  a profile or a review of each, possibly several pieces about one
  item over time — and the shape is open: gear as a declared-once
  file with its own page, like a place (`src/content/gear/<slug>.md`,
  the writing plus the frames made with it, gathered by the
  registry), or gear as ordinary pieces tagged to an item, or both,
  the profile gathering the pieces. (2) The links: the image page's
  technical section already names the camera and lens from EXIF and,
  from the sidecar, filters and support; each of those rows becomes a
  link to its gear page where one exists, and stays plain text where
  none does — the same rule places use for the label's place. What
  the conversation has to settle: how a row finds its gear (the EXIF
  strings a camera writes — `Make`, `Model`, `LensModel` — are exact
  but ugly, so a gear file would declare the strings it answers to,
  and a sidecar's `camera:` or `lens:` override would need a slug of
  its own the way `at:` sits beside `place`); whether filters and
  support, prose today, take slugs too; whether an item's page lists
  every frame made with it (a body of work by lens, which the
  registry could derive as it derives a place's outings) or only the
  writing; and how several pieces about one item relate to its page.
  Never a link that leads nowhere: no gear file, no link.
- ~~**Real photographs as fixtures, before more design**~~ — done for the
  gallery packing in spec 011: ten real exports live in
  `src/content/gallery-images/`, and the gallery width, gap, and density were
  judged on them at the sampler gate, not on placeholders. Still open for the
  surfaces spec 011 did **not** re-judge — the warm ground, the mats, and the
  quiet dark were each set on placeholders and would benefit from a look on
  real photographs (folded into the mats/ground/dark follow-up, a later spec).
- ~~**A way back from a category**~~ — done in spec 010: one
  `CategoryRow.astro` under the title on the pieces index, the
  galleries index, and every category page, with the current category
  marked the way the nav marks the current page (colour and an accent
  underline, not bold) and an "All" that returns to `/pieces/`. The
  site is static, so "All" cannot remember which kind the reader was
  looking at; a category page's two section headings became links
  instead — Galleries to `/galleries/`, Pieces to `/pieces/` — so a
  reader who filtered galleries has a way back to galleries. Follow-up
  it leaves: the row on the front door, if that workshop comes.
- ~~**The header's proportion on a laptop**~~ — done in spec 010, by
  looking on both screens rather than by argument. A `reading-head`
  class on the three reading pages (a piece, a gallery, a place) opts
  into two tokens that tighten the head's padding and the gap before
  the prose; every other page is untouched by construction. The
  photographer judged three candidates side by side at
  `/dev/page-head/` and took the middle one — candidate `a` at 3rem,
  tighter than today's head but not as tight as the 2rem candidate —
  on the portrait monitor as well as the laptop, so the override is
  scoped to `min-width: 720px` by width alone and the phone keeps
  today's head. On the fog piece at 1440×900 the first paragraph moved
  from 638 to 547, putting the lead and four lines inside his real fold
  of 778. Follow-ups it leaves:
  the title's size, the lead's measure, and the body column stay the
  reading typography pass's below, which now has the page-head sampler
  to work in — kept in the repo as a dev-only route and excluded from
  the build; and a landscape phone or tablet takes the tightened head
  along with the laptop, neither being one of the photographer's
  screens and neither measured at the gate.
- **Reading typography pass for pieces** — measure, size, and rhythm
  were inherited from a blog theme; immersive reading wants a slightly
  narrower column, larger type, more air between blocks.
- ~~**Image loading choreography**~~ — done in spec 018: a
  photograph's box waits in the ground's own colour, so no box shows,
  and the photograph fades in once it has decoded — the placeholder in
  the ground's family, as the photographer chose, rather than the mat's.
- **Motion, considered** — raised by the photographer in spec 016's
  conversation (2026-09-20): the site "now feels a bit old-school", and
  he can imagine two kinds of subtle animation. (1) On a dark ground —
  the quiet view, the hero stage spec 016 builds, a pause — a faint glow
  or burst behind the frame that moves smoothly and subtly: a light
  that breathes behind the photograph rather than a static field. (2) A
  scroll that settles: some acceleration and deceleration, so that
  things come to rest once the scroll stops rather than stopping dead.
  Both are a design conversation before any spec, because both cross a
  line the site has held since spec 007 — nothing moves unless the
  reader scrolls, no timed or automatic motion — so the first thing to
  decide is whether that rule bends for a glow (motion with no reading
  purpose, which is what the rule was written against), and what
  reduced motion gets instead. The scroll settle is the riskier of the
  two: scroll hijacking is the thing readers most resent on photography
  sites, and a settle that lands mid-paragraph is worse than none, so it
  wants a prototype judged on both screens, and the narrower option of
  a settle only inside the scenes where the site already runs the
  scroll (the hero stage's fade, the pause). Worth asking in that
  conversation what "old-school" names precisely — the type, the static
  ground, the absence of motion, the layouts — since the answer may be
  the reading typography pass below as much as animation. "Image
  loading choreography" above (a fade on decode) is the same family and
  folded in: it shipped at spec 018. _The conversation is spec 018's, "A considered
  animation pass" above (2026-09-23). The rule bent to "motion answers
  the reader" and no further: every animation answers the reader or a
  photograph loading, and nothing loops, breathes or plays by itself.
  The glow is closed by that rule — motion with no reader behind it —
  and left for a later conversation, not decided against. The settle
  is out at spec 018, at the photographer's call: "I don't want to mess
  with the page scroll behavior at this point. I may change my mind
  later" — to be revisited if he does._
- **Output formats and a page-weight budget** — eight exports at two
  megabytes is a sixteen-megabyte piece; AVIF output and a stated
  budget per piece.
- **A colophon** — one paragraph in the photographer's words about how
  the site shows work (why the mats, why the quiet view), so the
  design has its meaning without the pages explaining themselves.
- ~~**Browse by place**~~ — subsumed by spec 009's `/places/`, an
  index of declared places rather than of the sidecars' free-text
  names; no coordinates, ever, still.
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
