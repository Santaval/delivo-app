import { formatMemberCode, normalizeMemberCode } from '@/utils/memberCode';

describe('formatMemberCode', () => {
  it('groups a full code in two blocks of three', () => {
    expect(formatMemberCode('482913')).toBe('482 913');
    expect(formatMemberCode('012345')).toBe('012 345');
  });

  it('groups partial codes', () => {
    expect(formatMemberCode('')).toBe('');
    expect(formatMemberCode('48')).toBe('48');
    expect(formatMemberCode('482')).toBe('482');
    expect(formatMemberCode('4829')).toBe('482 9');
  });

  it('handles null / undefined', () => {
    expect(formatMemberCode(null)).toBe('');
    expect(formatMemberCode(undefined)).toBe('');
  });
});

describe('normalizeMemberCode', () => {
  it('strips everything that is not a digit', () => {
    expect(normalizeMemberCode('482 913')).toBe('482913');
    expect(normalizeMemberCode(' 4-8a2\n913 ')).toBe('482913');
  });

  it('caps at 6 digits', () => {
    expect(normalizeMemberCode('48291399')).toBe('482913');
  });

  it('keeps leading zeros', () => {
    expect(normalizeMemberCode('012345')).toBe('012345');
  });
});
