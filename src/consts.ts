// Site-wide settings. Edit this file to rebrand the theme — every page,
// the RSS feed, and Open Graph tags read from here.

import type { UIKey } from './i18n/en';

export const SITE = {
  /** BCP 47 language tag. Sets `<html lang>`, date formatting, and the RSS
   *  feed language. One dictionary ships, `src/i18n/en.ts`; a regional
   *  variant like `en-GB` reuses its strings while keeping its own date
   *  format. */
  locale: 'en',
  /** Site name — used in the header brand, <title>, and og:site_name. */
  title: 'Erik Haake Photography',
  /** Default meta description for pages that don't set their own.
   *  Interim factual wording until Erik supplies his own (spec 005,
   *  task T114). */
  description:
    'Photography by Erik Haake — landscape and nature first, with street, portrait and event work, and the writing that goes with it.',
  /** Description of the RSS feed at /rss.xml.
   *  Interim factual wording until Erik supplies his own (spec 005,
   *  task T114). */
  rssDescription: 'The journal of Erik Haake Photography.',
  /** Default social share image, relative to the site root (see public/). */
  ogImage: '/og.jpg',
  /** Post author, emitted in JSON-LD BlogPosting structured data.
   *  Leave empty ('') to omit the author field. */
  author: 'Erik Haake',
  /** Footer credit line. */
  footerText: '© Erik Haake',
} as const;

/** Public contact address — used by the Contact page and the footer's
 *  email icon. The interim contact mechanism until the roadmapped
 *  contact-form spec. */
export const CONTACT_EMAIL = 'erik@erikhaakephoto.com';

/** Instagram profile — the primary arrival path spec 001 names. */
export const INSTAGRAM_URL = 'https://www.instagram.com/erik.haake/';

/** Icons bundled with the theme — see `src/components/SocialLinks.astro`. */
export type SocialIcon = 'github' | 'x' | 'linkedin' | 'rss' | 'email' | 'instagram';

export interface SocialLink {
  /** Accessible name announced on the icon-only link. */
  label: string;
  /** Full URL, `mailto:` address, or site-root path (gets `base` applied). */
  href: string;
  icon: SocialIcon;
}

/** Social profiles rendered as inline SVG icons in the footer.
 *  Add or remove entries here — no template edits needed. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Instagram', href: INSTAGRAM_URL, icon: 'instagram' },
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}`, icon: 'email' },
  { label: 'RSS feed', href: '/rss.xml', icon: 'rss' },
];

export type NavItem =
  | { href: string; label: string; labelKey?: never }
  | { href: string; labelKey: UIKey; label?: never };

/** Header navigation. `href` is relative to the site root; the configured
 *  `base` is applied automatically via `withBase()`. The bundled entries
 *  localize through the UI dictionary; give a page you add yourself a literal
 *  `label` instead — one of the two is required. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/journal/', label: 'Journal' },
  { href: '/places/', label: 'Places' },
  { href: '/galleries/', label: 'Galleries' },
  { href: '/about/', labelKey: 'nav.about' },
  { href: '/search/', labelKey: 'nav.search' },
];

export interface FooterLink {
  href: string;
  label: string;
}

/** The footer's links, in the order they stand — each link's word and
 *  its place in one array. `href` is relative to the site root; `base` is
 *  applied by the layout. The index of photographs lives here, not in
 *  `NAV_ITEMS` (spec 019). */
export const FOOTER_LINKS: readonly FooterLink[] = [
  { href: '/contact/', label: 'Contact' },
  { href: '/photographs/', label: 'Index of photographs' },
];
