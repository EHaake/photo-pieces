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

/**
 * The category link row shared by the pieces index, the galleries index,
 * and a category page (spec 010). Pure: `href` is a site-root path the
 * caller runs through `withBase`, and `href: null` marks the item the
 * reader is already on. Without a current category the row is the four
 * categories in `CATEGORIES` order; with one, "All" leads, pointing back
 * to the unfiltered pieces index.
 */
export const categoryRow = (current?: Category): { label: string; href: string | null }[] => [
  ...(current ? [{ label: 'All', href: '/pieces/' }] : []),
  ...CATEGORIES.map((category) => ({
    label: categoryLabel(category),
    href: category === current ? null : `/categories/${category}/`,
  })),
];
