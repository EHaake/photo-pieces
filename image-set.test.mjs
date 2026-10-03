import { describe, expect, it } from 'vitest';
import { isPhotographPath, setKey, setKeyFromPath } from './src/lib/image-set.ts';

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
    expect(setKeyFromPath('/journal/p/')).toBe('piece:p');
  });

  it('a base prefix and a missing trailing slash do not change the key', () => {
    expect(setKeyFromPath('/base/places/x/')).toBe('place:x');
    expect(setKeyFromPath('/base/places/x')).toBe('place:x');
    expect(setKeyFromPath('/base/galleries/g/')).toBe('gallery:g');
  });

  it('a page that is not a set has no key', () => {
    expect(setKeyFromPath('/photographs/p/x/')).toBe(null);
    expect(setKeyFromPath('/places/')).toBe(null);
    expect(setKeyFromPath('/')).toBe(null);
  });
});

describe("a photograph's page (spec 019, T1747)", () => {
  it('the photographs index is not a photograph\'s page', () => {
    expect(isPhotographPath('/photographs/', '/')).toBe(false);
    expect(isPhotographPath('/sub/photographs/', '/sub/')).toBe(false);
  });

  it('a photograph of either folder is', () => {
    expect(isPhotographPath('/photographs/dock-a/', '/')).toBe(true);
    expect(isPhotographPath('/photographs/fog/land-b/', '/')).toBe(true);
    expect(isPhotographPath('/sub/photographs/dock-a/', '/sub/')).toBe(true);
    expect(isPhotographPath('/sub/photographs/fog/land-b/', '/sub/')).toBe(true);
  });

  it('a journal page is not', () => {
    expect(isPhotographPath('/journal/fog/', '/')).toBe(false);
    expect(isPhotographPath('/sub/journal/fog/', '/sub/')).toBe(false);
  });
});
