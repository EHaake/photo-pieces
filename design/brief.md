# Design Brief: Photography Site

For Claude Design and the piece/gallery reading experience specifically.
Functional requirements live in `specs/001-site-foundation/spec.md`;
this document is visual and interaction direction only.

## Audience and their existing visual vocabulary

The audience is mixed, not a narrow hobbyist niche: personal creative
archive first, but also the photographer's main professional presence —
where visitors arriving from Instagram are expected to land, alongside
potential portrait/event clients and other photographers. There's no
single obvious shared object-vocabulary for a general audience like
this, so the visual language is drawn from photography's own
conventions rather than the audience's.

Two candidates were considered directly against real reference images:
the literal **contact sheet** (ruled out — reads as skeuomorphic, too
literal an object to sit inside a clean modern site) and the **museum
gallery wall label** (kept — became the signature element below, but
strictly as a typographic treatment, never a rendered plaque).

## What to explicitly avoid

- **Skeuomorphism.** No literal rendering of physical photographic
  objects — no contact-sheet borders, sprocket holes, tape, or
  film-grain textures standing in for real UI. **Amended at spec 003
  review**: the flat matte is explicitly _not_ on this list — see the
  Skeuomorphism boundary below. Frames (rendered wood/metal borders,
  shadows, bevels) remain out.
- **Overly "design-y" or pretentious.** The explicit standard set is
  clean, minimal, sophisticated, and elegant — but approachable, not
  showy.
- **A generic, popular accent color chosen because it's trending.** The
  theme's default warm terracotta was tried and rejected on exactly
  these grounds — it's a very common "sophisticated but safe" choice
  across portfolio and indie-SaaS sites right now, not a distinctive
  one. The replacement is open (see below), but "on-trend and safe"
  should not be the reason it gets picked.
- **A display serif with more personality than the site wants**, for the
  same reason — the theme's default (Fraunces) was rejected as more
  characterful than intended, not just wrong at its current size.
- Current over-used AI-generated design defaults, ruled out
  explicitly — glassmorphism/frosted-glass panels, gradient-mesh or
  "aurora blob" backgrounds, fully-rounded corners on every element,
  purple-to-blue gradient accents, generic bento-grid hero sections,
  and stock 3D-render illustrations.

## Palette

Light-first, and light-_only_ — no dark mode toggle. This is a
deliberate content decision, not a v1 corner cut: the photographer
controls how the work is seen, the way an exhibition controls its own
lighting rather than handing each viewer a dimmer switch. The same
images read differently against light and dark backgrounds, and that
difference shouldn't be left to a visitor's OS setting.

Base neutrals (background, surface, text, muted, borders) started as
the astro-keel fork's warm-neutral off-whites with near-black charcoal
text, all CSS custom properties in `src/styles/global.css`. Amended at
the spec-003 sampler review: the ground was warmed one step
(oklch 0.99 → 0.968, hue 95) so the pure-white mattes read as mats on
a gallery wall — the wall is never paper-white; the mat is the
brightest surface.

**Current, not final**: the accent is now a dark teal,
`oklch(0.36 0.075 185)` — hand-picked to replace the theme's default
warm terracotta, which was rejected as too generic (see "What to
avoid"). Not yet pressure-tested against real photography. Retuning
is one line in `global.css` (dark mode was removed in spec 002), plus
two manually synced hex copies: `public/favicon.svg`, and the Open
Graph palette (`COLOR` in `src/lib/og-card.mjs`, drawn by both the
per-piece card route and the static social image). Since spec 013 that
second copy's five hexes are pinned to the tokens by `ground.test.mjs`
(T1102); spec 014 folded them into the single `COLOR` and carried them
into `public/og.jpg` by `npm run og`, which refuses to write while the
two disagree — so the copy can go stale in an editor, but not in a
commit.

**The ground, re-judged at spec 015's gate (2026-09-19).** Spec 015
took the mats off every surface but the image page's stage, which left
the ground doing a different job: sitting directly under photographs
and under prose rather than behind white mats. So it was judged again,
on the unmatted pages — a piece, a gallery, a place, an image page and
its quiet view, the indexes and About, under the dev server, on both
screens, switching tones from the sampler's bar. The tone taken is
`paper`, `oklch(0.99 0.003 100)` — the pre-003 white, back now that
nothing but the stage needs a wall to read against. The fills and
hairlines are not separate choices: each is a fixed step from the
ground (`STEPS` in `src/lib/ground.ts`), giving `--color-surface`
`oklch(0.967 0.004 100)`, `--color-soft` `oklch(0.942 0.005 100)`,
`--color-line` `oklch(0.882 0.005 100)` and `--color-line-strong`
`oklch(0.742 0.009 100)`. Text clears 4.5:1 on the ground and on every
fill it sits on, pinned by `ground.test.mjs`; the lowest of the floored
pairs is muted text on the soft fill at 5.05:1, so the muted text ships
unchanged at `oklch(0.5 0.012 250)` — this gate deepened nothing. The
spec-003 warming above is history, not the current reason for anything:
it was done so white mats would read, and on paper the stage's mat
stands only 1.02:1 off the ground outside the quiet view. That is
accepted for now; the darker field the stage wants is its own spec
(`ROADMAP.md`).

## Typography

- **Display / headings**: Spectral, weight 600. Chosen over Newsreader
  (too much serif contrast at display sizes — read as too close to
  Fraunces) and a close second, Source Serif 4 (the safer pairing, at
  the cost of the header having less independent presence — worth
  revisiting if Spectral ever feels wrong once real pieces are set in
  it). Installed as static weight files, not a variable font —
  Fontsource doesn't ship a variable version of this family.
- **Body**: Public Sans (unchanged, no objection raised)
- **Small labels / metadata / tags**: JetBrains Mono (unchanged)

## Signature element

When a visitor clicks an image — in a gallery or inside a piece — it
opens its own page (not an overlay) carrying a consistent, restrained
treatment: title, exposure info, a link to the piece(s) it's featured
in, and optionally a bespoke caption or quote. Purely typographic,
modeled on a museum wall label's restraint rather than any literal
rendering of one. This is recurring (appears from every image site-wide),
functional (it's how a visitor gets back to context, not decoration),
and distinctive enough to be recognizable as this site's, which is the
bar the signature element needs to clear.

The gallery _listing_ view itself stays deliberately plain — a clean,
conventional grid, not styled as a contact sheet or any other physical
object. The distinctiveness lives entirely in the click-through, not the
grid.

**Open**: whether this page's typography borrows the theme's existing
hairline-rule language (thin 1px structural rules already used
throughout astro-keel — dividing grid cells, underlining section labels)
for continuity, or is deliberately visually distinct from the rest of
the site.

## Skeuomorphism boundary

Firmly flat and modern. Physical/photographic vocabulary (the gallery
label, the general idea of curation) can inform structure and metaphor,
but nothing renders as a literal object — no textures, or
shadows standing in for a physical print, plaque, or contact sheet.

**The matte carve-out (amended at spec 003 review; narrowed at spec
015).** The photographer mattes every image they present, on every
channel — it is their presentation style, not decorative imitation of
physicality. A flat, uniform matte field around an image is therefore
part of this site's visual language: no shadow, no texture, no bevel,
no frame — a clean color field, token-driven (width and color in
`global.css`), applied by the site's CSS rather than baked into image
files (decision recorded in `DECISIONS.md`). Since spec 015 it is worn
by the image page's stage and the quiet view that grows out of it, and
by nothing else: a piece's frames and the galleries' rows present the
photograph on the ground, edge to edge with the page. The reason is
that the mat is a hero treatment — it says this one photograph is the
whole point, which is true of the stage and false of a frame passing
under a reader's eye in a flow of prose or sitting in a packed row.
(The pause frame keeps the mat spec 007 gave it until the pause gets a
spec of its own.)

## Screens to design

Maps to the flows in `specs/001-site-foundation/spec.md`; see that
document for exact behavior.

- Homepage (latest pieces + "latest work" gallery — layout still open)
- Piece reading page (the core differentiator — prose + block vocabulary)
- Gallery listing page (category-organized, curated grid)
- Gallery image detail page (the signature element)
- About page
- Contact page

## Voice

Not yet discussed. Deliberately left open rather than guessed — the
photographer's own words are a stated hard requirement for the site's
writing, and that same care should extend to UI copy (button labels,
empty states, captions) rather than having a tone invented on their
behalf.

## Open for the design process to refine

- Accent color (see Palette)
- Whether the signature element borrows the theme's hairline-rule
  language or reads as distinct
- Homepage exact layout and behavior
- Empty states, loading states, and what the single most-frequent
  visitor action should be optimized for
- Voice / copy tone
- The "what to avoid" AI-design-cliché list above — a first pass, not
  yet confirmed
