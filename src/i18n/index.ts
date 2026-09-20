// UI localization. Every user-facing string the theme itself renders comes from
// the dictionary in `./en`; `SITE.locale` in `src/consts.ts` drives
// `<html lang>`, date formatting, and the RSS feed language.
import { SITE, type NavItem } from '../consts';
import { en, type UIKey, type UIStrings } from './en';

export type { UIKey, UIStrings };

/** The active locale, straight from `SITE.locale`. Also the value passed to
 *  `Intl`, `<html lang>`, and the RSS `<language>` element. A regional
 *  variant like `en-GB` keeps its own date format while reading the same
 *  strings — there is one dictionary. */
export const locale: string = SITE.locale;

/**
 * Look up a UI string, filling `{name}` placeholders from `params`.
 * Unknown keys are impossible: `UIKey` is derived from the English dictionary.
 */
export const t = (key: UIKey, params?: Record<string, string | number>): string => {
  const value = en[key];
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
};

/**
 * Render a post's reading time.
 *
 * `remarkPluginFrontmatter` is untyped, and the Content Layer store in
 * `node_modules/.astro/` survives an upgrade — so `minutesRead` may still be
 * the preformatted `"3 min read"` string this theme used to emit. Interpolating
 * that into `post.readingTime` would print "3 min read min read"; going the
 * other way would print a bare "3". Passing an unexpected value straight
 * through degrades to readable-but-untranslated text until the store is
 * rebuilt, instead of showing either kind of garbage.
 */
export const readingTime = (minutesRead: unknown): string =>
  typeof minutesRead === 'number'
    ? t('post.readingTime', { minutes: minutesRead })
    : String(minutesRead ?? '');

/** Format a publish date in the active locale. `long` spells the month out;
 *  `short` abbreviates it. Both are locale-aware, including field order.
 *
 *  Formatted in UTC on purpose: every date on the site is a calendar
 *  date — YAML `2026-08-28` parses to UTC midnight, and EXIF capture
 *  times are normalized to UTC wall-clock by the image registry — so
 *  formatting in the build machine's zone printed the previous day
 *  anywhere west of Greenwich (found at spec 004: a piece dated the
 *  28th read "August 27" on the photographer's laptop). */
export const formatDate = (date: Date, style: 'long' | 'short' = 'long'): string =>
  new Intl.DateTimeFormat(locale, {
    month: style,
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

/** Resolve a nav entry's label. `NavItem` requires exactly one of `label` or
 *  `labelKey`, so there is no unlabelled case to fall back from. */
export const navLabel = (item: NavItem): string =>
  item.label !== undefined ? item.label : t(item.labelKey);
