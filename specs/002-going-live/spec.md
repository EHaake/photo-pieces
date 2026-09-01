# Spec: Going Live

**Status**: Amended at Phase 3 review — deployment, the domain flip,
and the author-content tasks moved to `specs/005-going-live/`
(deferred). The photographer paused public availability until the
block vocabulary (003), sample pieces, and galleries (004) exist; the
site stays local-only and the repo went private. What remains in this
spec (identity, dark-mode removal, teardown, pieces index, contact,
About structure) is complete and merges now.
**Depends on**: `001-site-foundation` (merged) — the piece-authoring
loop, block vocabulary, and reading page all exist and are tested.

## Summary

Turn the working-but-borrowed codebase into _this photographer's_ site,
live at a real URL. Everything here is either already decided and
deferred (light-only appearance, `blog`/`works` teardown), wrong in a
way that publishing would expose (the upstream theme author's identity
in every canonical URL, OG tag, and footer), or small and fully
specified by spec 001 (About, Contact). Nothing in this spec needs a
design-exploration pass — that's deliberate, so the homepage design
work (spec 003 candidate) can happen as its own conversation in
parallel.

## Goals

1. Every visitor sees the site's one photographer-curated light
   appearance — the dark palette, toggle, and OS-preference handling
   are removed, not just unused. (Decided in spec 001 / the design
   brief; currently violated for dark-preference visitors.)
2. The site presents the photographer's identity, not the theme's:
   site title, author, description, social links (including Instagram,
   named in spec 001 as a primary arrival source), and correct
   canonical URLs / share metadata throughout.
3. The theme's leftover `blog` and `works` collections, routes, nav
   entries, and demo content are removed. Pieces are the only
   long-form content model.
4. Pieces are reachable: a minimal pieces index exists and the nav
   links to it. (Interim navigation — the homepage remains the
   primary entry point once spec 003 designs it; this just ends the
   direct-URL-only state.)
5. A shared piece renders a correct, piece-specific preview card in
   chats and social feeds (per-piece Open Graph images, replacing the
   blog/works-only OG route).
6. An About page introduces the photographer (spec 001 criterion).
7. A Contact page gives visitors a working way to get in touch,
   suitable for arrivals from Instagram (spec 001 criterion).
8. _(Moved to spec 005 at the Phase 3 amendment.)_ The site is
   deployed and publicly reachable at a stable URL, with deploys
   triggered by `git push`.

## Non-goals (explicitly deferred)

- **Homepage redesign.** The landing experience keeps the theme's
  current homepage shell (with identity corrected) until the spec 003
  design pass. Ugly-but-honest beats designing it twice.
- **Galleries.** Unchanged from spec 001's deferral.
- **The `sequence` block, shop, comments, search, newsletter** — all
  unchanged on `ROADMAP.md`.
- **Migrating images off the repo.** Local co-located images remain
  correct until repo size is a real problem (constitution).
- **Analytics.** Not part of going live; revisit only if wanted.

## Decisions this spec forces (resolved in plan.md, not here)

- **Hosting target.** Compared at spec review (see `DECISIONS.md` once
  chosen): GitHub Pages, Cloudflare (Workers static assets — the
  current recommended path; Pages is legacy-track), Netlify (new
  accounts are on the 2025 credit-pool free tier, the stingiest of the
  three). Criteria set by the photographer: stability and low
  ongoing hassle first, free or cheap, and a push-to-deploy test URL
  _before_ anything is publicly "live". The final pick lands in
  `plan.md`.
- **Domain.** `erikhaakephoto.com` is owned, registered at
  Squarespace. No transfer is required to use it — DNS records at
  Squarespace can point at any host; transferring the registration is
  a separate, optional, later step. Deployment is staged deliberately:
  first to the host's own subdomain as the testing URL, with the
  custom-domain flip as the final act of this spec (or trailing it),
  so nothing is publicly "the site" until the photographer says so.
- **What replaces the homepage's blog/works sections** in the interim
  — the minimal edit that keeps the homepage coherent after teardown,
  without pre-empting spec 003.

Resolved at spec review, no longer open: **contact mechanism**. The
photographer wants a real contact form eventually — deferred to its
own future spec (`ROADMAP.md`), since form handling on a static site
is a dependency decision worth its own pass. The 002 Contact page
ships the interim mechanism: direct email plus Instagram, satisfying
spec 001's "working way to get in touch" without pre-empting the form.

## Entities

- **Pieces index** — a simple reverse-chronological list of published
  pieces (title, date, categories, description; cover thumbnails
  optional). Interim surface; spec 003's homepage may absorb or
  replace it.
- **About page** — static content, photographer-written (the brief's
  voice rule: their words, not invented copy; layout may be built with
  placeholder-marked text but must not ship invented biography).
- **Contact page** — static content presenting the chosen contact
  mechanism.
- **Site identity** — title, author, description, social links,
  favicon/OG fallback image, `site`/`base` configuration.

## Key user flows

### Arriving from a shared link

A piece link shared in a chat or on social media shows a piece-specific
preview card (title, description, image). Following it lands on the
piece at its canonical URL.

### Arriving from Instagram

A visitor taps the profile link, lands on the site, and can reach any
piece (via the index) and the Contact page within two interactions.

### Publishing _(moved to spec 005)_

The photographer pushes to `main`; the site rebuilds and deploys
without further manual steps. A failed build never replaces the
currently-live site.

## Acceptance criteria

- [x] No dark-mode code remains: no toggle renders, `prefers-color-
scheme` does not change the site's appearance, and the dark
      token blocks are gone from the stylesheet (accent retuning is a
      single-line change again)
- [x] No `blog`/`works` collection, route, nav entry, or demo content
      remains; `astro build` is green after the teardown and no
      internal link 404s
- [x] Site title, author, description, footer, and social links are
      the photographer's; an Instagram link is present and correct
      (description wording is interim `TODO-AUTHOR` — its replacement
      moved to spec 005)
- [x] `site` (and `base` if any) produce correct canonical URLs,
      sitemap entries, and RSS item links in built output (live-URL
      verification moved to spec 005 with the deployment)
- [x] A `/pieces/` index lists published pieces newest-first,
      excluding drafts, and the nav links to it
- [x] Per-piece OG cards generate and each piece's `og:image` points
      at its card (the link-preview-debugger check needs a public URL
      — moved to spec 005)
- [x] The Contact page provides the interim mechanism (email +
      Instagram) with a correctly-addressed mailto and resolving
      Instagram link
- [x] RSS contains pieces (and no blog/works remnants)

Moved to `specs/005-going-live/` at the Phase 3 amendment: the About
page's real text, the description wording, deployment to the test
URL, the live end-to-end verification, and the domain flip.

## Resolved decisions

- **Interim pieces index is in scope** — reachability shouldn't wait
  for the homepage design pass; the index is deliberately minimal so
  spec 003 owes it nothing.
- **About/Contact ride along** — they're small, fully specified by
  spec 001, and more meaningful live than local.
- **Teardown before redesign** — removing `blog`/`works` now, with the
  homepage patched minimally, keeps the eventual homepage work honest:
  it starts from the real content model, not around dead code.
- **Per-piece OG images are in scope** — "going live" is precisely
  when share cards start mattering; spec 001's plan.md already names
  this gap.
