// English UI dictionary — the only dictionary the site ships.
//
// **Scope: UI chrome only.** Navigation, section labels, aria labels,
// generated strings, and the theme-owned 404 page. Page prose is *not*
// here: it lives in the `.astro` files, where you would edit it anyway.
//
// Keys are flat and dotted; `{name}` placeholders are filled in by `t()`.
// Every key below has a consumer — a `t()` call or a `labelKey` in
// `NAV_ITEMS`. Add a key when a page needs one, not before.
//
// One value, `search.fallback`, carries inline `<code>` markup and is
// rendered with `set:html`. It is theme-authored, never user input.
//
// Values are deliberately *not* `as const`: `UIStrings` widens them to
// `string`, which is what `t()` returns.

export const en = {
  // Header, footer, and other chrome
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.search': 'Search',
  'nav.label': 'Main navigation',
  'nav.brandHome': '{site} home',
  'social.label': 'Social links',

  // Piece metadata
  'post.readingTime': '{minutes} min read',

  // About — section labels only; the biography copy lives in about/index.astro
  'about.title': 'About',
  'about.eyebrow': 'About',

  // Search
  'search.title': 'Search',
  'search.eyebrow': 'Search',
  'search.sectionLabel': 'Site search',
  'search.fallback':
    'The search index is generated at build time. Run <code>npm run build</code> and preview the site to try it — it is not available on the dev server.',

  // 404 — a theme-owned page, so its copy belongs here
  'notFound.title': 'Page not found',
  'notFound.description': 'The page you were looking for does not exist.',
  'notFound.eyebrow': '404 — Not found',
  'notFound.heading': 'Page not found.',
  'notFound.lead': 'The address may have moved, or it never existed.',
  'notFound.linksLabel': 'Recovery links',
  'notFound.home': 'Back home',
};

/** The dictionary's shape. */
export type UIStrings = typeof en;

/** Every valid translation key. */
export type UIKey = keyof UIStrings;
