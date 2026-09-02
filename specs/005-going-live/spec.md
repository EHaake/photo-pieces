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
      `where-the-fog-lets-go`) and `_dock-b.md`
- [ ] The custom-domain flip is executed: `erikhaakephoto.com` serves
      the site over HTTPS via Squarespace DNS records (registration
      stays at Squarespace), canonicals match
- [ ] The repo's visibility decision is revisited at launch (private
      was chosen for pre-launch; a public repo is optional, as the
      workflow-demonstration value returns once the site itself is
      public)

## Carried-over tasks (from spec 002 tasks.md)

- [ ] **T113 [author]** — About page text (structure already in place
      with `TODO-AUTHOR` markers).
- [ ] **T114 [author]** — Site description wording in `consts.ts`.
- [ ] **T115 [author]** — Cloudflare account, workers.dev subdomain,
      repo connection (walkthrough already provided; repo is now
      private, which Workers Builds supports).
- [ ] **T116** — End-to-end verification against the deployed test
      URL, each check reported with actual results.
- [ ] **T117 [author-gated]** — Domain flip via Squarespace DNS +
      Cloudflare custom domain.
