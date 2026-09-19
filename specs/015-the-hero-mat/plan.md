# Plan: The hero mat

**Status**: Signed off (2026-09-19) — by the `skeptical-reviewer` at the
top tier, one review and one re-review; one item the re-review carried
(the readout's muted ink on the deepens branch) transcribed from its
exact text by the spec session; see tasks.md's tier log.
**Implements**: spec.md in this directory

## Shape of the change

Every surface but two stops reading the mat rule; the rule itself, its
three tokens, the stage's form and the sampler stay. "Off" is one
declaration per surface — `--mat: 0px` where a layout formula still
reads the mat, and nothing at all where only the padding did — so every
formula spec 013 built now includes zero from the same property it
always read. The pause frame keeps its mat by being the one entry left
on the piece list's selector, its own rules and script byte-identical.
Then spec 014's switch, readout and generator re-judge the ground on the
unmatted pages, and the gate's tone lands exactly as 014's T1204 was
written to land it. No schema, no transform, no registry, no plugin
change; no new dependency.

- **Where the mat lives after this spec.** Two readers of
  `padding: var(--mat)` and `background: var(--color-matte)` remain in
  the whole of `src/`, both in `global.css`: the stage's `.image-frame`
  (form V+H, unchanged) and the pause's anchor
  `.piece-pause-frame > :is(a.image-link, img)` (form W, unchanged
  string, on a list of one). Everything else that read them is edited
  as the table says. The three tokens keep spec 013's values
  (`0.06`, `0.25rem`, `2.5rem`) and `--color-matte` stays `oklch(1 0 0)`;
  the stage's mat is therefore the number T1104 measured — 40px (the
  ceiling) at 1512×982 — and nothing about it is re-derived.

  | surface (spec Goal 1)                                          | today                                                                                                                                                                                                  | after T1301                                                                                                                                                                                                                                                                                                                                                                                                           |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | a piece's reading-flow frames (single … row, the held one)     | the matted-list rule (`padding`, `background`) and form W on the same list; the half-bleed and `width-fullbleed` exception rules; form H on `.piece-held figure`; form P on the match="height" members | the two list rules keep **only** `.piece-pause-frame > :is(a.image-link, img)`; the three exception rules deleted; `.piece-held figure` declares `--mat: 0px` in place of form H (its `--q` goes; `--avail-h` and the `max-width` formula stay, reading the zero); the form P rule deleted (the members' `flex: var(--ar, 1) 1 0` with no padding is exact by itself; `--pair-gap` stays on the block, read once now) |
  | the packed rows (galleries, the place wall, the related strip) | form R on `.gallery-flow > li`; the anchor's `padding`/`background`                                                                                                                                    | `.gallery-flow > li { --mat: 0px }` in place of form R; its `flex`, `max-width` and the `<720px` `.related-flow` cap keep their `+ 2 * var(--mat)` term (now zero — the constant term is what keeps the packing and the srcset exact, AC 3); the anchor keeps `display: block` only                                                                                                                                   |
  | the index cover cards (`CoverCards.astro`)                     | `.gallery-card .image-link { padding: var(--mat); background }`, on form W's list                                                                                                                      | the two declarations deleted; `display: block` and the span's `--ar` stay (every frame carries its ratio; nothing reads this one)                                                                                                                                                                                                                                                                                     |
  | the latest-work band (`LatestWork.astro`)                      | its own form-R-shaped `--mat`, `padding`, `background`                                                                                                                                                 | the three deleted; `--avail-h` stays as the band's one height string, read by the `img`                                                                                                                                                                                                                                                                                                                               |
  | the compare figure (`src/pages/images/[...id].astro`)          | `.compare { padding: var(--mat); background }`, on form W's list                                                                                                                                       | the two deleted. `--color-matte` keeps its two other uses on that page — the `data-js` letterbox fill behind a camera frame whose crop differs, and the slider's divider — which are the compare's own device inside its box, not a field around the photograph (Resolved decisions)                                                                                                                                  |
  | the pause frame                                                | form W on the list, the list's padding/background, form V+H on `.piece-pause`                                                                                                                          | **untouched in effect**: the same three declarations reach the same element (the list is now that one selector), `.piece-pause` through `.piece-pause-frame` and the lights block byte-identical, the piece page's script and the transform untouched                                                                                                                                                                 |
  | the stage and the quiet view                                   | form V+H on `.image-frame`; the quiet redeclarations                                                                                                                                                   | byte-identical                                                                                                                                                                                                                                                                                                                                                                                                        |

  Why `--mat: 0px` in place of a form, rather than the form left
  computing beside an override: two declarations of `--mat` on one
  element is a cascade, not a value; a form left live on a surface
  whose padding is gone would still put `2m` into the row basis and the
  held box and break the very fits AC 3 protects; and the tokens cannot
  be zeroed per surface (`matte.test.mjs` case (a) forbids declaring
  them outside `:root`, which is the single source the spec keeps).
  This is the "off" spec 013's presence table already wrote for each
  surface, accepted at its sign-off. Turning a surface back on later is
  the form restored to its element (spec 013's plan carries every form's
  string) plus `padding: var(--mat)` and the background — one edit per
  surface, as before.

- **Nothing that counted the mat breaks** (AC 3), and how each is
  checked. The held figure's `max-width` becomes `--avail-h × ar` in
  effect and the frame fits its height exactly (evaluator, T1301, and
  the browser: figure height = `100svh − 2·hold-margin` where
  height-bound). The packed row's basis becomes `short × w` and its cap
  `short × w × stretch`, so the image at full growth is exactly the
  `galleryCell(...).sizes` px — the CSS/srcset agreement case keeps
  running with `m = 0` and must still pass. A matched pair's members are
  `flex: var(--ar, 1) 1 0` with no padding: their heights are
  `free × (ar_i / Σar) / ar_i`, equal by algebra — a test of that would
  be vacuous (spec 013's T1101 review B1 rejected exactly such a clause),
  so the pin is structural (no rule gives those members a `--mat` or a
  padding) and the browser reads the heights equal. The `sizes` hints
  are untouched (the transform and templates are non-goals); with no
  mat every image is at most its container wide, and T1301 reads each
  matted-before frame's rendered width against its hint's px at
  1512×982 — an **over**-delivery (the hint above the rendered width,
  as the single's 680px over a ~665px column and the compare's 700px
  are by design) is harmless and only recorded; an **under**-delivery
  (the rendered width above the hint) by more than 2px is what reaches
  the pause report (sign-off N3). The stage's fit is unchanged by being
  unchanged: its rules and their pins are byte-identical.

- **The pause is untouched, and how that is shown** (AC 2). The pause's
  own CSS — `.piece-pause` (form V+H included), `::after`, `.with-before`,
  `.with-after`, `.piece-pause-stage` and its two children,
  `.piece-pause-frame`, the `html[data-pause-active]` lights block — the
  piece page's script (`src/pages/pieces/[slug].astro`),
  `src/lib/pause-shape.ts` and the transform are byte-identical:
  `git diff -U0 main` on those files is empty, and for `global.css` no
  hunk header falls inside the pause's line range. The two shared rules
  the pause anchor reads (form W and the padding/background rule) change
  their selector lists to the pause's entry alone; the anchor's computed
  `padding`, `background-color`, the frame's `--frame-w`/`--frame-h` and
  its rendered box are read before the edit and after it, identical.
  The spec's letter ("does not touch its … CSS") is read as the pause's
  own rules — the list it shares with the pieces cannot lose the pieces
  without being edited — stated here and in the sweep's bundle. **The
  mechanism changes even though the effect does not** (sign-off N1):
  today the list's `:is(…, .piece-row figure, …)` gives both rules
  specificity (0,2,2), which outranks `.piece-block a.image-link`
  (`global.css` ~1188, `display: block; background: none`, (0,2,1)) on
  the pause anchor; narrowed to `.piece-pause-frame > :is(a.image-link, img)`
  they are (0,2,1) too, and the white background wins by source order
  alone. T1301's test pins that order (the padding/background rule's
  index greater than that rule's), so a later move of either rule
  cannot silently take the pause's mat away.

- **The sampler** (`src/pages/dev/matte/[...surface].astro`,
  `_sampler.ts`; spec 013's, extended at 014). The four surfaces show
  the unmatted state by construction (they render the real markup and
  the real stylesheet), so the per-section mat bar on `pieces`,
  `galleries` and `cards` would move nothing — except the fixture
  piece's pause frame, which still reads form W from the tokens on the
  section wrapper, and a bar that silently moves only the deferred
  frame is a trap at the gate. So the mat bar and the wrapper's inline
  tokens render on the `stage` section only; the other three carry a
  label saying they are unmatted since spec 015 (the pause frame
  excepted, deferred). `_sampler.ts` already returns from
  `applySurface` when a section has no buttons; its edits are comments
  (the recorded values now live in `specs/015-the-hero-mat/`). The
  ground bar — candidates, tune, readout, tokens line, reset — is
  014's, unchanged; the stage's mat bar opens on `share-60` as before.

- **The ground gate**, on the unmatted site. The photographer walks a
  piece, a gallery, a place, an image page and its quiet view, the
  indexes and About under `npm run dev` on both screens, switching from
  the sampler's bar between `paper` (`oklch(0.99 0.003 100)`), `light`
  and `today` (the control; the other five may stay on the bar), reading
  the seven ratios beside each. 014's estimates for the two lighter
  candidates (muted/bg ≈5.8 and ≈5.7, muted/soft ≈5.1 and ≈4.9) say
  neither needs the muted text deepened; the readout is the fact. The
  value is recorded as numbers whichever way it was reached (an id, or
  the tune's `oklch(L C h)`), plus the tokens line and whether the muted
  deepened — the gate record in tasks.md, in the person's words.

- **The gate's landing** (T1303) is 014's T1204, verbatim in substance.
  **Changed**: `:root`'s five literals become `tokensFor(tone)`'s
  strings, pasted from the failing test's expected values or the
  generator's print; the comment above `--color-bg` rewritten (this
  gate's date, the tone as numbers, the candidate or "tuned from <id>",
  the pair that bound, spec 003's warming and spec 014's unanswered gate
  as one line of history); `--color-muted` and `MUTED` together only if
  the record says the muted deepened; in `ground.ts`, `CANDIDATES.today`
  becomes the landed tone, `warm-003` is added carrying the former
  control ("spec 003's warm — the control at spec 014's and 015's
  gates"), the taken candidate's entry is dropped, `CONTROL` untouched;
  `COLOR` in `og-card.mjs` recomputed from `npm run og`'s print; then
  `npm run og` writes `public/og.jpg`, and the Phase 1 pause report shows
  it to the person. **Kept**: no edit to the stylesheet's ground lines,
  `og-card.mjs`, `og.jpg` or `CANDIDATES`; the record says why. The
  pause's lights mix from `var(--color-bg)` toward `--color-quiet`, so
  the dimming follows the landed ground by construction (the lights
  block's diff is empty; the person attests a pause at the pause).

- **The documents.** `CLAUDE.md`'s block-vocabulary clause — "captions
  via the container form and site-applied mattes" — is a statement about
  piece-body treatments and goes false the moment T1301 lands; the
  constitution says it is amended first, explicitly, in its own commit.
  Spec.md's document list omits it (Deviations, below); T1300 lands it
  before any code. Then `README.md`'s block table and prose,
  `AUTHORING.md`'s never-bake rule, `design/brief.md`'s carve-out and
  Palette note (T1304), and `ROADMAP.md`/`DECISIONS.md` at close-out
  (T1305), each as the spec's "The documents" requirement lists them —
  plus two items 014's never-run T1205 owed: `README.md`'s OG sentence
  gains `npm run og` and the tree gains `scripts/gen-og.mjs`,
  `src/lib/ground.ts`, `src/lib/og-card.mjs`, since that machinery
  shipped at 014's Phase 0 undocumented and this spec is what uses it.

## Failure messages and notes

No barrier line changes. The build's output moves by nothing this spec
does; the two barriers stay as 014 left them:

```
[check-no-dev-routes] no dev routes in dist/; no dev-ground marker in <n> files.
[check-no-gps] <n> images scanned in dist/ — no GPS metadata.
[gen-og] COLOR in src/lib/og-card.mjs drifts from :root (<token>: <hex> vs <hex>) — update it first
[gen-og] wrote public/og.jpg (1200×630) on <bg hex>
```

The draft fixture piece is still never built (87 pages stay 87).

## Testing strategy

Every claim above is owned by a task and a check:

- **The constitution goes false nowhere** — **T1300**: `CLAUDE.md`'s
  clause amended in its own commit before T1301; the sweep greps it.

- **Off is off, from the single source** — `matte.test.mjs` (spec 013's
  file, rewritten case by case; no pin weakened silently — each old case
  is named in T1301's line with what it becomes), **T1301**:
  - (a) unchanged: the three tokens at `:root` at the gate's values;
    declared nowhere else in `global.css` or under `src/` outside
    `src/pages/dev/`; `--matte` gone; no `.gallery-grid` anchor rule.
  - (b), rewritten: **form W is declared once, on the pause's anchor
    alone** — prelude exactly `.piece-pause-frame > :is(a.image-link, img)`,
    `--mat` the unchanged FORM_W string, the only key, the string
    published by no second rule; **the two matted surfaces read `--mat`
    as a padding and `--color-matte` as a background: the pause's anchor
    and the stage's frame, and no rule anywhere in `global.css` applies
    either otherwise** (a walk over every block: any `padding*` value
    carrying `var(--mat` or any `background*` carrying `--color-matte`
    must sit on one of those two selectors), the tokens still read only
    inside a `--mat` value, **and the pause anchor's padding/background
    rule comes after `.piece-block a.image-link` in source** (equal
    specificity now — the order is what keeps the mat's white over that
    rule's `background: none`); **the held figure at zero**: `--mat` is
    `0px`, no `--q`, `--avail-h` and the `max-width` string unchanged;
    **form V+H on the pause and on the stage**: unchanged pins, byte for
    byte; **the image page reads `--mat` nowhere** (the T1104a walker now
    expects `[]`), `.compare` declares neither `padding` nor `background`,
    and `--color-matte` appears in the page's style on exactly
    `.compare[data-js] .compare-frame :global(img)` and
    `.compare[data-js] .compare-line`; **the latest-work band: one height
    string and no mat** — `--avail-h` and the `img` height unchanged, the
    anchor declares no `--mat`, `padding` or `background`, and
    `--color-matte` is absent from the file; **the cover card's span
    declares `display: block` and nothing that reads the mat**; **form R
    at zero**: the cell's `--mat` is `0px` and its `flex`, `max-width`
    and the narrow cap keep their `+ 2 * var(--mat)` strings; the packed
    row's anchor declares `display: block` only; **form P is gone**: no
    rule gives the match="height" members a `--mat` or a padding, and
    the block still declares `--pair-gap` once and reads it in `gap`.
    Deleted outright: "form P comes after form W in source" (no form P).
  - (c), the evaluator: form W's algebra case runs over the pause
    anchor's string, unchanged; **the held frame at zero mat** — `m` is
    0 on every grid point whatever the tokens, the box is `H × ar` and
    `(boxW)/ar == H` exactly; the pause and stage V+H cases unchanged;
    **form R at zero** — `m` is 0 on every grid point, the image width
    is `short × w × g` at every growth and every frame in the row lands
    on one short side; **the cap agrees with the srcset at zero** — the
    cell's widest image equals `galleryCell(image, short).sizes` px (AC
    3's responsive-sizes claim, pinned); the form P evaluator case
    deleted (nothing to evaluate — the structural pin above replaces it,
    and the browser reads the heights); **the off identity** (replaces
    the inert identity): at share 0 with floor = ceiling = 16.8 the
    pause anchor, the pause and the stage give 16.8, while the held
    figure and the packed cell give 0 and form R's basis is `short × w`
    with no constant — off is off whatever the tokens; **the gate
    identity** (rewritten): at `:root`'s tokens, at 1512×982, the stage's
    3:2 frame wears 40px (the ceiling, T1104's record) and the
    reading-width 3:2 single has no `--mat` reader at all.
  - Mutation-checked, each reverted: `padding: var(--mat)` reintroduced
    on the packed row's anchor → the two-readers case fails naming it;
    form R's clamp restored on `.gallery-flow > li` → the form-R-at-zero
    string and the off identity fail; `--mat: 0px` removed from
    `.piece-held figure` → the held case fails (`px()` throws on the
    unresolved `--mat`); `.compare { padding: var(--mat) }` restored →
    the image-page case fails; `.piece-single` re-added to form W's list
    → "declared once, on the pause's anchor alone" fails; a `2 *`
    changed in the stage's form → the stage V+H string case fails (the
    unchanged pins still bite).

- **The rendered result** — **T1301**, on the dev server (Firefox
  headless via BiDi, the T1104 recipe), at 1512×982, 1280×1440 and
  375×812: **before the edit** the pause anchor's computed `padding-top`
  and `background-color`, the pause frame's `offsetWidth`/`offsetHeight`
  and probed `--frame-w`/`--frame-h`, and the stage frame's padding,
  image height and quiet-view background on one image page — recorded;
  **after**: those identical; on `/pieces/vocabulary-sampler/` every
  other frame (single ×3, inset, wide, grid cell, default and weighted
  diptych members, match="height" members, aside, row, the held anchor)
  computes `padding` 0 on all four sides and `background-color`
  `rgba(0, 0, 0, 0)`, and the fullbleed, tall and strip frames read 0
  before and after with their rules (`global.css` ~1289, ~1344, ~1390)
  inside no hunk (AC 1's "unchanged", sign-off N6); a match="height"
  pair's and triptych's image heights equal within 0.2px (013's flex
  residual) with 0 padding; the
  held portrait figure's height equals `100svh − 2·hold-margin` within
  0.5px where height-bound and its image is the figure's width; on
  `/galleries/every-ratio/` and `/places/the-headlands/` every row's
  cells share one short side within 0.5px and every anchor pads 0; the
  related strip on an image page likewise; `/places/` cards and `/`
  cards pad 0; the compare figure pads 0 with a transparent background
  and its `data-js` box keeps `aspect-ratio` = `--ar`; the stage frame's
  padding is T1104's number at each viewport (40 / 40 / 12.988) and the
  quiet view's frame background `#ffffff`; `scrollWidth ≤ clientWidth`
  on the galleries, place, places and image pages (the vocabulary
  sampler's known 15px headless-scrollbar overshoot excluded, as at
  T1104); at 1512 each formerly-matted frame's rendered image width
  beside its `sizes` hint's px (single 680, cards 373, compare 700, a
  gallery cell its `galleryCell` value), recorded as "hint − rendered":
  a positive number is over-delivery and fine; a negative one beyond
  −2px is under-delivery and is reported at the pause, not fixed here.
  `LatestWork` is placed on no page and the sampler does not render it:
  its pin is the test, said so in the record.

- **The sampler shows the unmatted surfaces, and its bars are honest** —
  **T1302**: `sh scripts/verify.sh` green with 87 pages and the barrier
  line; `grep -rl "matte-sampler\|dev-ground" dist/` empty;
  `grep -c getComputedStyle` 0 in both sampler files; on the dev server
  at 1512×982: `/dev/matte/` renders four sections, `[data-candidate]`
  buttons on the `stage` section only (five, opening on `share-60`) and
  none on the other three, whose labels say unmatted; the fixture
  piece's 3:2 single pads 0 and its pause anchor pads form W's value for
  its ratio at its frame width; the gallery cells pad 0; the stage's
  `none` → the landscape frame pads 0, `share-60` → 40; the ground bar:
  `paper` sets `<html>`'s background to `oklchToRgb255(paper)` within
  1/255, writes the key with five tokens (no deepened muted) and the
  readout's seven rows recorded; `today` removes the key and every
  inline token; `/pieces/where-the-fog-lets-go/` opened afterwards with
  `paper` selected wears it.

- **The tone landed, or didn't** — **T1303**, 014's T1204 checks with
  this spec's expected grep hits: changed → `ground.test.mjs` green
  against the new literals with every delta recorded; the old-literal
  grep over `src/` returns exactly the `:root` history comment line(s)
  and nothing else — `ground.ts` spells its tones as object literals
  (`{ L: 0.968, C: 0.006, h: 95 }`), so `warm-003`'s entry and
  `CONTROL`'s line can never match the pattern (014's O2 predicted hits
  that cannot occur; sign-off B1); those two tones are pinned instead
  by `ground.test.mjs` (b) — `CANDIDATES.today.bg` is `:root`'s ground
  — and (c) — `CONTROL` equals `warm-003`'s tone once that entry exists.
  **On the deepens branch only** (a tuned tone darker than today; paper,
  light and today never deepen): `ground.test.mjs`'s readout case
  asserts `deepened.L === 0.49` on `oklch(0.95 0.007 95)` from the
  default `MUTED`, and with `MUTED` landed deeper it would return `null`
  and throw (sign-off N2) — so on that branch `readout(bg, from = MUTED)`
  gains the optional starting muted, threaded to `deepenMuted`, to
  `shipped`, and as the readout's muted ink (`inks.muted`) — the row is
  graded at the starting muted, or the case would still fail on
  `soft.passes` (transcribed from the sign-off's re-review) — and the
  case passes the literal `oklch(0.5 0.012 250)` (the
  fixed-point move 014's O1 made for `deepenMuted`; the sampler keeps
  the default); on every other branch the module and the case are
  untouched. On the dev
  server with no `dev-ground` key, `<html>`'s background on a piece, a
  cover card on `/`, a `code` on the vocabulary sampler, the footer's
  `border-top-color` and the quiet view's background each the landed
  token's conversion (or `--color-quiet`'s) within 1/255, at 1512×982
  and 375×812; a built OG PNG's (10, 10) pixel equals `COLOR.bg` within
  2; `public/og.jpg` reads 1200×630 and is named for the pause report;
  `git diff -U0 main -- src/styles/global.css` shows no hunk inside the
  pause's block, the lights block or the stage's rules, and no change on
  `--color-quiet`, `--pause-depth`, `--color-text`, `--color-accent`,
  `--color-matte` or the three mat tokens; kept → the token lines,
  `og-card.mjs`, `og.jpg` and the candidate table unchanged against
  `main`, `ground.test.mjs` green is the pin.

- **Untouched by construction** — **T1301**, **T1303** and the sweep:
  `git diff main -- src/content.config.ts remark-pieces-blocks.mjs obsidian-plugin/ src/lib/gallery-layout.ts 'src/pages/pieces/[slug].astro' src/lib/pause-shape.ts`
  empty; `page-head.test.mjs`, `og.test.mjs` and the transform suites
  green and unedited; `ground.test.mjs` green and unedited except on the
  deepens branch (the one case above); the three mat tokens and
  `--color-matte` unchanged; `--color-quiet` unchanged.

- Existing suites stay green (340 tests, less the two deleted cases,
  plus the rewritten ones); build with both barriers; `astro check`;
  Prettier on the documents.

## File structure

```
CLAUDE.md                                      the block-vocabulary clause: the site mats the image page's stage and quiet view only (T1300, its own commit)
src/styles/global.css                          :root comment; the two list rules narrowed to the pause's anchor; the exception rules and form P deleted; held --mat: 0px (no --q); form R → --mat: 0px, the anchor's padding/background gone; the Mattes, match-height and sizing-coupling (~1294) comments (T1301). :root's five ground literals and the comment; --color-muted on the deepens branch (T1303)
src/lib/ground.ts                              (deepens branch only) readout(bg, from = MUTED); ground.test.mjs's readout case from the literal (T1303)
src/components/CoverCards.astro                the span's padding/background gone; comment (T1301)
src/components/LatestWork.astro                --mat, padding, background gone; --avail-h stays; comments (T1301)
src/pages/images/[...id].astro                 .compare's padding/background gone; the T1104a comments and the frontmatter's --ar comment reworded (T1301)
matte.test.mjs                                 the cases rewritten as Testing strategy names them (T1301)
src/pages/dev/matte/[...surface].astro         the mat bar and inline tokens on the stage section only; labels; comments (T1302)
src/pages/dev/matte/_sampler.ts                comments only (T1302)
src/lib/ground.ts                              CANDIDATES.today → the landed tone, warm-003 added, the taken entry dropped; MUTED on the deepens branch (T1303, change branch only)
src/lib/og-card.mjs, public/og.jpg             COLOR recomputed; the social image regenerated (T1303, change branch only)
README.md, AUTHORING.md, design/brief.md       the block table and prose; the never-bake rule; the carve-out and the Palette note; the OG sentence and the tree (T1304)
ROADMAP.md, DECISIONS.md                       close-out (T1305, implementer-edited, orchestrator-committed)
```

Untouched, named so the reviewer can confirm the non-goals hold: the
three mat tokens and `--color-matte`; `.piece-pause` through
`.piece-pause-frame` and the lights block; `.image-stage`, `.image-frame`,
`.image-frame img`, the zoom-in rule and the two quiet stage rules;
`--color-quiet`, `--pause-depth`, `--color-text`, `--color-accent`;
`src/pages/pieces/[slug].astro`, `src/lib/pause-shape.ts`, the
transform and its tests, the schema, the fixture piece, the Obsidian
plugin; `src/lib/gallery-layout.ts`; `DevGround.astro`, `BaseLayout.astro`,
`scripts/check-no-dev-routes.mjs`, `scripts/gen-og.mjs`; `ground.test.mjs`,
`page-head.test.mjs`, `og.test.mjs`; `CONTROL` and `STEPS` in `ground.ts`.

## Known limitations

- **The stage's white mat on a paper ground reads faintly outside the
  quiet view** — the spec's accepted interim state; the darker field is
  its own spec (ROADMAP, T1305). The readout's mat/bg row shows the
  number at the gate (ΔL 0.01 on `paper`).
- **A piece with a pause carries one matted frame** until the pause's
  spec — stated in the spec, restated in README's table.
- **The compare's letterbox fill and divider stay white** — put to the
  person at sign-off. They read `--color-matte` because that is the
  white the page has; they are not a mat and the spec does not name
  them; on a paper ground the letterbox is a hair lighter than the page,
  inside the box only, and only where the camera's crop differs. If he
  wants them on the ground instead, T1301 sets those two values to
  `var(--color-bg)` — one line each in `[...id].astro`'s style, and the
  test's "`--color-matte` on exactly those two" pin becomes "nowhere".
- **A prose shorthand image (`![alt](./x.jpg)` in a paragraph, and an
  image inside an author's own link) loses its mat with everything
  else** — put to the person at sign-off. Goal 1's list names the
  blocks; the shorthand is `single`'s captionless form ("same rendered
  result", README) and follows it. If he wants those two frames matted,
  T1301 keeps the two `:is(.prose, .piece-row-prose) > p > …` entries on
  the list beside the pause's — one line in each of the two rules and
  in the test's expected prelude.
- **The `sizes` hints are the templates' and the transform's**, untouched
  (non-goals). Every hint was written over the frame's outer width, so
  an unmatted image is at most that wide and the single's and compare's
  hints over-deliver by design; T1301 reads the numbers rather than
  assuming them, and only an under-delivery beyond 2px goes to the
  pause report.
- **`remark-pieces-blocks.mjs`'s comment at ~113** ("680px is coupled to
  --prose-width (68ch) minus the mat") goes stale at T1301 and stays: the
  transform is a non-goal and T1301's empty-diff check forbids the edit.
  Carried to the sweep as known, not a finding (sign-off N4); the
  `global.css` sizing-coupling comment (~1294), which is this spec's to
  edit, is rewritten at T1301.
- **The transform still emits `--ar-sum` and `--n` on match="height"
  blocks**, which nothing reads once form P is gone (sign-off N7); the
  Mattes comment says so. Untouched, for the same reason.
- **`LatestWork` is exercised by no page** and not by the sampler; its
  unmatting is pinned by the test alone, as its matting was.
- **"Turning it on" is a restore, not a switch.** The spec's non-goal
  says a later spec may put a mat back on a surface "by turning it on";
  in this plan what stays switched on is the tokens, `--mat`, the
  stage's form and the sampler, and what turning a surface on means is
  the form restored to its element (from spec 013's plan.md or git)
  plus `padding: var(--mat)` and the background — one edit per surface,
  as spec 013's presence table had it. Not a per-surface switch, whose
  live forms would have to be kept in step with nothing. Stated here so
  the spec-conformance summary can carry it (sign-off N8).
- **Firefox floors a percentage-bearing padding to 1/60 px** (spec 013):
  the pause anchor's before/after reads compare at that resolution;
  every other frame now computes a literal 0.
- **014's limitations stand**: the readout is arithmetic, not a
  photometer; contrast is checked at seven pairs; `localStorage` is per
  origin; the generator is proven for the ground, not the card (the
  Phase 1 pause shows the file); the dev server caches
  `getStaticPaths`, so editing `CANDIDATES` needs a restart.

## Resolved decisions

- **Off is `--mat: 0px` in place of the form where a formula still reads
  it, and simply nothing where only the padding did** — not a per-surface
  token, not the tokens zeroed on a wrapper, not a form left computing
  beside an override. The spec's "the formula includes zero, from the
  same single source" is satisfied literally: the formulas are unchanged
  strings reading the same property, and the value is the rule's zero.
  This is spec 013's own presence table, accepted at its sign-off.
- **The pause keeps its mat by staying alone on the list**, rather than
  by a copy of the list's two rules under its own selector — a copy
  would be a second declaration of form W, which the "declared once"
  pin exists to forbid. The pause's own rules are untouched; the shared
  list is narrowed; the anchor's computed style is shown identical.
- **Form P and the held figure's `--q` are deleted, the packed row's
  formulas keep their term.** A deleted declaration cannot drift; a
  formula that still reads `--mat` keeps the fit exact at zero and makes
  a later mat one edit. Where nothing reads the value (form P's members,
  which had no formula but the mat itself) there is nothing to keep.
- **The compare's letterbox and divider are not mats** and keep
  `--color-matte`: they sit inside the box, exist only with script, and
  the spec's "no residual padding, no border, no field" is about what
  surrounds the photograph.
- **The sampler's mat bar is the stage's only.** A bar on an unmatted
  surface would move nothing but the deferred pause frame; the spec
  keeps the sampler as machinery, and honest machinery says which
  surfaces it can still move.
- **`CLAUDE.md` is amended first, in its own commit** (T1300), though
  the spec's document list omits it: the constitution's own rule, and
  spec 013's T1103a was written for exactly this branch.
- **014's undocumented machinery gets its two README lines here** (the
  OG sentence and the tree) rather than being left for a spec that may
  never come: T1205 never ran, and this is the spec that uses
  `npm run og`.
- **The gate's landing is 014's T1204 unchanged in substance**, ids
  updated and the old-literal grep's expected hits corrected to the
  `:root` history line(s) alone (option (i) of sign-off B1: the grep is
  for a fill left at the old tone, `ground.ts` holds object literals the
  pattern cannot match, and spelling a tone into two comments to make a
  list true would be text written for a grep); `CONTROL` stays the tone
  at 014's gate, which is also the tone at this one — the spread test's
  fixed point holds on every branch.
