import { isVersionSupported } from '@/utils/semver';

describe('isVersionSupported', () => {
  const cases: [string, string, boolean][] = [
    // The user's stated parity / boundary cases.
    ['1.2.12', '1.2.12', true], // equal → supported
    ['1.2.13', '1.2.12', true], // ahead by patch → supported
    ['1.2.11', '1.2.12', false], // behind by patch → trigger
    ['1.1.14', '1.2.12', false], // behind by minor → trigger

    // Major boundary
    ['2.0.0', '1.9.9', true],
    ['1.9.9', '2.0.0', false],
    ['1.0.0', '2.0.0', false],

    // Mixed: ahead in higher-order segment beats any lower-order deficit
    ['1.3.0', '1.2.99', true],
    ['1.2.99', '1.3.0', false],

    // Missing trailing segments default to 0
    ['1.2', '1.2.0', true],
    ['1.2.0', '1.2', true],
    ['1', '1.0.0', true],
    ['1.2', '1.2.1', false],

    // Pre-release / build suffixes ignored
    ['1.2.12-rc.1', '1.2.12', true],
    ['1.2.11+build.5', '1.2.12', false],

    // Non-numeric segments treated as 0
    ['1.x.0', '1.0.0', true],
    ['1.x.0', '1.0.1', false],

    // Empty / malformed → treated as 0.0.0
    ['', '0.0.0', true],
    ['', '0.0.1', false],
  ];

  it.each(cases)(
    'current %s vs min %s → %s',
    (current, min, expected) => {
      expect(isVersionSupported(current, min)).toBe(expected);
    },
  );
});