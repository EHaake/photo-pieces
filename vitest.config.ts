import { defineConfig } from 'vitest/config';

// Pin the suite to a zone west of Greenwich. The site formats every date
// in UTC and re-bases EXIF capture times to UTC wall-clock (spec 004);
// on a UTC runner (GitHub's ubuntu-latest) that re-basing is the
// identity and the tests guarding it would pass with the code deleted —
// the "cannot fail for its named reason" case the constitution forbids.
// exif.test.mjs asserts the zone is in effect.
export default defineConfig({
  test: {
    env: { TZ: 'America/Vancouver' },
  },
});
