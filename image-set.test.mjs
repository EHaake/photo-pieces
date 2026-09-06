import { describe, expect, it } from 'vitest';
import { setKey, setKeyFromPath } from './src/lib/image-set.ts';

// The set key (spec 006, extended by spec 009's places): the layout
// writes it and the image page reads it, so the format and the paths it
// is derived from are pinned here rather than in either caller.

describe('image sets (T701, spec 009)', () => {
  it('a key is its kind and its id', () => {
    expect(setKey('place', 'x')).toBe('place:x');
    expect(setKey('gallery', 'fog-frames')).toBe('gallery:fog-frames');
    expect(setKey('piece', 'where-the-fog-lets-go')).toBe('piece:where-the-fog-lets-go');
  });

  it('a place page is a set, beside the two kinds that already were', () => {
    expect(setKeyFromPath('/places/x/')).toBe('place:x');
    expect(setKeyFromPath('/galleries/g/')).toBe('gallery:g');
    expect(setKeyFromPath('/pieces/p/')).toBe('piece:p');
  });

  it('a base prefix and a missing trailing slash do not change the key', () => {
    expect(setKeyFromPath('/base/places/x/')).toBe('place:x');
    expect(setKeyFromPath('/base/places/x')).toBe('place:x');
    expect(setKeyFromPath('/base/galleries/g/')).toBe('gallery:g');
  });

  it('a page that is not a set has no key', () => {
    expect(setKeyFromPath('/images/p/x/')).toBe(null);
    expect(setKeyFromPath('/places/')).toBe(null);
    expect(setKeyFromPath('/')).toBe(null);
  });
});
