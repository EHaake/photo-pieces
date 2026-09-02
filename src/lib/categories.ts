/**
 * The site's category taxonomy — one definition shared by the `pieces`
 * and `galleries` schemas and by every page that groups or filters by
 * category. Array order is display order (the galleries index, the
 * category link row). Extend here, never inline in a schema or page.
 */
export const CATEGORIES = ['landscape', 'street', 'portrait', 'event'] as const;

export type Category = (typeof CATEGORIES)[number];

/** Display form of a category value: `landscape` → `Landscape`. */
export const categoryLabel = (category: Category): string =>
  category.charAt(0).toUpperCase() + category.slice(1);
