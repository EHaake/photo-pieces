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

export type SetKind = 'gallery' | 'piece';

/** `gallery:fog-frames`, `piece:where-the-fog-lets-go`. */
export function setKey(kind: SetKind, id: string): string {
  return `${kind}:${id}`;
}

/** The set a page is, from its path (`/galleries/<slug>/` or
 *  `/pieces/<slug>/`, base prefix allowed), else null. */
export function setKeyFromPath(pathname: string): string | null {
  const m = pathname.match(/\/(galleries|pieces)\/([^/]+)\/?$/);
  return m ? setKey(m[1] === 'galleries' ? 'gallery' : 'piece', m[2]) : null;
}
