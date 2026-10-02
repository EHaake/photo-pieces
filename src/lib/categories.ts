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
  ...(current ? [{ label: 'All', href: '/journal/' }] : []),
  ...CATEGORIES.map((category) => ({
    label: categoryLabel(category),
    href: category === current ? null : `/categories/${category}/`,
  })),
];

/**
 * The eyebrow on a photograph's page (spec 019, amendment 4): its
 * journal entry's categories; else its sidecar's `categories:`, whole —
 * the galleries' are not merged in; else the categories of the
 * galleries that hold it, first seen first; else none.
 */
export const eyebrowCategories = ({
  entry,
  own,
  galleries,
}: {
  entry: readonly Category[] | null;
  own: readonly Category[] | undefined;
  galleries: readonly Category[];
}): Category[] => (entry ? [...entry] : own && own.length > 0 ? [...own] : [...new Set(galleries)]);
