# Tasks: Going Live

**Status**: Draft — pending review
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
      *Verify: build green; footer renders the Instagram link.*
- [x] **T102** — `astro.config.mjs`: `site: 'https://erikhaakephoto.com'`,
      remove `base`. *Verify: build green; canonical/sitemap URLs in
      `dist/` carry the new domain and no `/astro-keel` paths remain
      anywhere in built output.*
- [x] **T103** — Add `wrangler.jsonc` (name, compatibility_date,
      `assets: { directory: "./dist" }`). *Verify: `npx wrangler deploy
      --dry-run` accepts the config (no account needed for a dry run);
      build unaffected.*

## Phase 1 — Dark mode removal

- [x] **T104** — Remove the theme-init script, toggle markup, and
      toggle wiring from `BaseLayout.astro` (and any separate toggle
      component file). *Verify: build green; no `data-theme` attribute
      appears in built HTML.*
- [x] **T105** — Remove the dark and `[data-theme]` token blocks from
      `global.css`; collapse Shiki to single `github-light` theme in
      `astro.config.mjs` + drop the dual-theme CSS block. *Verify:
      build green; the accent is defined on exactly one line; a
      dark-preference browser (emulated) renders the light palette.*

## Phase 2 — Teardown

- [x] **T106** — Delete `works`: pages, content, collection,
      nav entry. *Verify: build green; no `/works/` href in `dist/`.*
- [x] **T107** — Delete `blog`: pages (index, slug, tags), content,
      collection, nav entry, Giscus/Comments component + config.
      *Verify: build green; no `/blog/` href in `dist/`; unit suite
      still green (18 tests).*
- [x] **T108** — Reshape `rss.xml.ts` to pieces. *Verify: build green;
      feed lists the test piece with a `/pieces/` URL; no blog/works
      items.*
- [x] **T109** — Reshape the OG route to `og/pieces/[slug].png.ts`
      over non-draft pieces, categories as the eyebrow. *Verify: build
      green; the test piece's OG PNG generates; piece page's `og:image`
      points at it.*
- [x] **T110** — Interim homepage edit: replace works/blog sections
      with a "latest pieces" list (shared markup with T111). *Verify:
      build green; homepage renders with no dead sections; no
      upstream-theme demo content visible.*

## Phase 3 — New pages

- [ ] **T111** — `src/pages/pieces/index.astro` (newest-first,
      non-draft, title/date/categories/description, cover thumb if
      present) + "Pieces" nav entry. *Verify: build green; index lists
      the test piece; draft pieces excluded (test with a temporary
      draft).*
- [ ] **T112** — `src/pages/contact/index.astro`: email
      (erik@erikhaakephoto.com) + Instagram, footer link. *Verify:
      build green; mailto href correct; Instagram resolves.*
- [ ] **T113 [author]** — About page with the photographer's text
      (until then: structure in place, visible `TODO-AUTHOR` markers,
      task stays open). *Verify: renders the real text, zero
      `TODO-AUTHOR` markers remain on the page.*
- [ ] **T114 [author]** — Replace the interim site description in
      `consts.ts` with the photographer's wording. *Verify: no
      `TODO-AUTHOR` remains in `consts.ts`.*

## Phase 4 — Deploy (needs the photographer's Cloudflare account)

- [ ] **T115 [author]** — Create the Cloudflare account, pick the
      workers.dev subdomain, connect the GitHub repo per the
      walkthrough. *Verify: a push to this branch produces a preview
      deployment.*
- [ ] **T116** — Verify the deployed test URL end-to-end: the test
      piece renders (fullbleed + diptych correct), search works, RSS
      validates, a link-preview debugger shows the piece-specific OG
      card, and a deliberately broken build does not replace the live
      deployment. *Verify: each check reported with actual results.*

## Phase 5 — Domain flip (deferrable by the photographer)

- [ ] **T117 [author-gated]** — Attach `erikhaakephoto.com` as the
      Worker's custom domain; add the DNS records at Squarespace;
      confirm HTTPS. No code change (site already set). *Verify: the
      domain serves the site; canonicals match; workers.dev still
      works or redirects.*

---

## Handoff note

> Read CLAUDE.md and specs/002-going-live/spec.md, plan.md, tasks.md,
> then begin at the first unchecked task. Stop for review after each
> phase. [author] tasks are blocked on the photographer — skip past
> them and keep going; they close whenever the input arrives.
