/**
 * The set a reader steps through from an image page (spec 006) — the
 * one definition of its storage key and key format, shared by the
 * layout's click handler (the writer), the image page's script (the
 * reader), and the page's markup (the `data-set` values). Keeping the
 * three in one module is what stops them drifting apart.
 */

/** sessionStorage key for the set the reader is stepping through. */
export const IMAGE_SET_KEY = 'image-set';
/** sessionStorage key for quiet view's persistence between image pages. */
export const IMAGE_QUIET_KEY = 'image-quiet';

export type SetKind = 'gallery' | 'piece' | 'place';

/** `gallery:fog-frames`, `piece:where-the-fog-lets-go`, `place:sombrio-beach`. */
export function setKey(kind: SetKind, id: string): string {
  return `${kind}:${id}`;
}

/** The set a page is, from its path (`/galleries/<slug>/`,
 *  `/journal/<slug>/`, or `/places/<slug>/`, base prefix allowed), else
 *  null. */
export function setKeyFromPath(pathname: string): string | null {
  const m = pathname.match(/\/(galleries|journal|places)\/([^/]+)\/?$/);
  return m ? setKey(KINDS[m[1] as keyof typeof KINDS], m[2]) : null;
}

const KINDS = { galleries: 'gallery', journal: 'piece', places: 'place' } as const;

/** A photograph's page (`/photographs/<id>/`, base allowed) — not the index at `/photographs/` itself. */
export function isPhotographPath(pathname: string, base: string): boolean {
  const prefix = `${base.replace(/\/$/, '')}/photographs/`;
  return pathname.startsWith(prefix) && pathname.length > prefix.length;
}
