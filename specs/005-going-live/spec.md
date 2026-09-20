# Spec: Going Live (deferred)

**Status**: Deferred — not scheduled. Split out of `002-going-live` at
its Phase 3 review: the photographer paused public availability until
the block vocabulary (003), sample pieces, and galleries (004) exist.
Until this spec executes, the site is local-only (`npm run dev`) and
the GitHub repo is private.
**Depends on**: 002 (merged), and in practice 003/004 — the
photographer decides when "ready to be seen" is met.

## Summary

Everything from spec 002 that only matters once the site faces the
public: the Cloudflare deployment, the domain flip, the photographer's
own words where interim placeholders sit, and the live-URL
verifications. All groundwork already exists on `main`: identity,
`wrangler.jsonc` (validated via dry run), per-piece OG images, RSS,
and `site: 'https://erikhaakephoto.com'` — the domain flip is
DNS + dashboard only, zero code change.

## Carried-over acceptance criteria (from spec 002)

- [ ] The About page renders the photographer's own text (zero
      `TODO-AUTHOR` markers anywhere in the built site)
- [ ] The interim site description in `consts.ts` is replaced with the
      photographer's wording
- [ ] The site deploys to the workers.dev test URL on every push to
      `main`; branch pushes produce preview URLs
- [ ] The deployed test URL verifies end-to-end: pieces render
      correctly (all block treatments), search works against the built
      index (scope note: Pagefind indexes only piece bodies — the
      pages carrying `data-pagefind-body` — so "works" means pieces
      are findable, not About/Contact), RSS validates, and a failed
      build does not replace the live deployment
- [ ] The link-preview debugger check on OG cards runs **after the
      domain flip** (ordering note from 002's review: `og:image` URLs
      absolutize against `site` = erikhaakephoto.com, which doesn't
      serve this site until T117 — a debugger pointed at the test URL
      would fetch cards from whatever the domain serves meanwhile)
- [ ] All fixture pieces are replaced by real pieces or set
      `draft: true` before the site faces the public:
      `first-light-at-the-jetty` (spec 001's test piece),
      `vocabulary-sampler`, `where-the-fog-lets-go`, and
      `market-day-camera-low` (spec 003's reference and demo
      fixtures — invented prose, placeholder images). Spec 004's
      fixtures go too: the placeholder images in
      `src/content/gallery-images/` (`dock-a`, `dock-b` — the latter
      carries a deliberate GPS block — and the ratio-ladder set
      `wide-3x2-*`, `tall-2x3-*`, `tall-4x5-*`, `tall-5x8-*`,
      `square-*`, `wide-16x9-*`, `pano-3x1-*`; gallery-root images
      have no draft flag, so these are **deleted**, not drafted), the
      fixture galleries `fog-frames`, `editors-picks`, and the four
      ladder galleries `one-ratio`, `near-ratios`, `both-orientations`,
      `every-ratio`, and the sidecars `_land-b.md` (in
      `where-the-fog-lets-go`) and `_dock-b.md`. Spec 006 added to
      those two sidecars a fixture story and, in `_land-b.md`, every
      rich-page field — invented copy, all of it — and the camera's
      frame `where-the-fog-lets-go/_land-b.jpg` (a private raster that
      carries a deliberate GPS block): drafting the piece removes its
      page, but the frame and both sidecars are deleted with the rest
- [ ] The custom-domain flip is executed: `erikhaakephoto.com` serves
      the site over HTTPS via Squarespace DNS records (registration
      stays at Squarespace), canonicals match
- [ ] The repo's visibility decision is revisited at launch (private
      was chosen for pre-launch; a public repo is optional, as the
      workflow-demonstration value returns once the site itself is
      public)

## Carried-over tasks (from spec 002 tasks.md)

- [ ] **T113 [author]** — About page text. Since 2026-09-19 the page
      carries interim wording written from the project's own documents
      (no invented biography), at Erik's request, so no `TODO-AUTHOR`
      marker is visible; the page's header comment says so. Still open
      until his own words replace it.
- [ ] **T114 [author]** — Site description wording in `consts.ts`.
- [ ] **T115 [author]** — Cloudflare account, workers.dev subdomain,
      repo connection (walkthrough already provided; repo is now
      private, which Workers Builds supports).
- [ ] **T116** — End-to-end verification against the deployed test
      URL, each check reported with actual results. Include the CI
      workflow itself: as of 2026-09-02 (spec 004's close-out) GitHub
      has recorded **zero** Actions runs for this repo although
      `.github/workflows/ci.yml` has been on `main` since 002 and
      triggers on `pull_request` — every verification so far has been
      local. Find out why (Actions settings, billing for a private
      repo, or the workflow never being picked up) before relying on a
      green check at the domain flip.
- [ ] **T117 [author-gated]** — Domain flip via Squarespace DNS +
      Cloudflare custom domain.
