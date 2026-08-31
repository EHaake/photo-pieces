# Spec: Going Live

**Status**: Draft — pending review
**Depends on**: `001-site-foundation` (merged) — the piece-authoring
loop, block vocabulary, and reading page all exist and are tested.

## Summary

Turn the working-but-borrowed codebase into *this photographer's* site,
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
8. The site is deployed and publicly reachable at a stable URL, with
   deploys triggered by `git push` (completing the authoring flow spec
   001 described: write → preview → push → live).

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

- **Hosting target.** GitHub Pages (workflow already in the repo) vs
  Netlify vs Cloudflare Pages. Criteria: zero cost at this scale,
  static-only, no lock-in that complicates a later image-store
  migration.
- **Domain.** Custom domain vs host-provided subdomain. (The
  photographer plausibly already holds one — to be confirmed at plan
  review; this changes `site`/`base` and canonical URLs, so it must be
  settled before deploy, and is cheap to change later only until URLs
  are shared.)
- **Contact mechanism.** A static site rules out a self-hosted form
  backend. Direct email link vs a form service (a new dependency
  needing justification) vs Instagram DM as primary with email
  fallback. The photographer's preference decides; the page must not
  expose the email to scrapers more than the photographer accepts.
- **What replaces the homepage's blog/works sections** in the interim
  — the minimal edit that keeps the homepage coherent after teardown,
  without pre-empting spec 003.

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

### Publishing
The photographer pushes to `main`; the site rebuilds and deploys
without further manual steps. A failed build never replaces the
currently-live site.

## Acceptance criteria

- [ ] No dark-mode code remains: no toggle renders, `prefers-color-
      scheme` does not change the site's appearance, and the dark
      token blocks are gone from the stylesheet (accent retuning is a
      single-line change again)
- [ ] No `blog`/`works` collection, route, nav entry, or demo content
      remains; `astro build` is green after the teardown and no
      internal link 404s
- [ ] Site title, author, description, footer, and social links are
      the photographer's; an Instagram link is present and correct
- [ ] `site` (and `base` if any) produce correct canonical URLs,
      sitemap entries, and RSS item links on the deployed site
- [ ] A `/pieces/` index lists published pieces newest-first,
      excluding drafts, and the nav links to it
- [ ] Sharing a piece URL yields a piece-specific OG card (verified
      with a real link-preview debugger, not just markup inspection)
- [ ] The About page renders the photographer's own text
- [ ] The Contact page provides the chosen mechanism and it works
      end-to-end (a test message actually arrives)
- [ ] The site is live at its stable URL; a push to `main` deploys;
      the test piece reads correctly on the live site including the
      full-bleed and diptych treatments
- [ ] RSS contains pieces (and no blog/works remnants)

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
