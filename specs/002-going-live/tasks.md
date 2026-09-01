# Tasks: Going Live

**Status**: Complete (as amended) — T113–T117 moved to specs/005-going-live
**Implements**: plan.md in this directory

Ordered, small, independently verifiable. Resume by finding the first
unchecked task. Per the constitution: every implementation task ends
with an actual build (and test-suite run where relevant) reported, not
summarized. Review cadence: stop after each phase.

Tasks marked **[author]** are blocked on the photographer and may
trail; nothing else depends on them unless stated.

---

## Phase 0 — Identity & config

- [x] **T101** — Site identity in `src/consts.ts`: title "Erik Haake
      Photography", author, interim factual description marked
      `TODO-AUTHOR`, Instagram social link (add an Instagram SVG to
      the footer icon set), remove upstream author's socials/values.
      _Verify: build green; footer renders the Instagram link._
- [x] **T102** — `astro.config.mjs`: `site: 'https://erikhaakephoto.com'`,
      remove `base`. _Verify: build green; canonical/sitemap URLs in
      `dist/` carry the new domain and no `/astro-keel` paths remain
      anywhere in built output._
- [x] **T103** — Add `wrangler.jsonc` (name, compatibility_date,
      `assets: { directory: "./dist" }`). _Verify: `npx wrangler deploy
--dry-run` accepts the config (no account needed for a dry run);
      build unaffected._

## Phase 1 — Dark mode removal

- [x] **T104** — Remove the theme-init script, toggle markup, and
      toggle wiring from `BaseLayout.astro` (and any separate toggle
      component file). _Verify: build green; no `data-theme` attribute
      appears in built HTML._
- [x] **T105** — Remove the dark and `[data-theme]` token blocks from
      `global.css`; collapse Shiki to single `github-light` theme in
      `astro.config.mjs` + drop the dual-theme CSS block. _Verify:
      build green; the accent is defined on exactly one line; a
      dark-preference browser (emulated) renders the light palette._

## Phase 2 — Teardown

- [x] **T106** — Delete `works`: pages, content, collection,
      nav entry. _Verify: build green; no `/works/` href in `dist/`._
- [x] **T107** — Delete `blog`: pages (index, slug, tags), content,
      collection, nav entry, Giscus/Comments component + config.
      _Verify: build green; no `/blog/` href in `dist/`; unit suite
      still green (18 tests)._
- [x] **T108** — Reshape `rss.xml.ts` to pieces. _Verify: build green;
      feed lists the test piece with a `/pieces/` URL; no blog/works
      items._
- [x] **T109** — Reshape the OG route to `og/pieces/[slug].png.ts`
      over non-draft pieces, categories as the eyebrow. _Verify: build
      green; the test piece's OG PNG generates; piece page's `og:image`
      points at it._
- [x] **T110** — Interim homepage edit: replace works/blog sections
      with a "latest pieces" list (shared markup with T111). _Verify:
      build green; homepage renders with no dead sections; no
      upstream-theme demo content visible._

## Phase 3 — New pages

- [x] **T111** — `src/pages/pieces/index.astro` (newest-first,
      non-draft, title/date/categories/description, cover thumb if
      present) + "Pieces" nav entry. _Verify: build green; index lists
      the test piece; draft pieces excluded (test with a temporary
      draft)._
- [x] **T112** — `src/pages/contact/index.astro`: email
      (erik@erikhaakephoto.com) + Instagram, footer link. _Verify:
      build green; mailto href correct; Instagram resolves._

## Phases 4–5 and author-content tasks — moved

T113, T114 (author text), T115–T116 (deploy), and T117 (domain flip)
moved to `specs/005-going-live/` at the Phase 3 review: the
photographer paused public availability until the block vocabulary
(003), sample pieces, and galleries (004) exist. The About page's
structure landed here (with `TODO-AUTHOR` markers); its words land
there. Groundwork that already shipped in this spec — wrangler.jsonc,
site config, OG/RSS — stays.

---

## Handoff note

> Read CLAUDE.md and specs/002-going-live/spec.md, plan.md, tasks.md,
> then begin at the first unchecked task. Stop for review after each
> phase. [author] tasks are blocked on the photographer — skip past
> them and keep going; they close whenever the input arrives.
