import { describe, it, expect } from 'vitest';
import { fmtDate, fmtMonth, formatDate } from './format';

describe('fmtDate', () => {
  it('returns em-dash for falsy values', () => {
    expect(fmtDate('')).toBe('—');
    expect(fmtDate(null)).toBe('—');
    expect(fmtDate(undefined)).toBe('—');
  });

  it('formats to short month + day', () => {
    // Use noon local time to avoid UTC midnight off-by-one in negative-offset timezones
    expect(fmtDate('2024-06-15T12:00:00')).toMatch(/Jun 15/);
  });
});

describe('fmtMonth', () => {
  it('returns empty string for falsy values', () => {
    expect(fmtMonth('')).toBe('');
    expect(fmtMonth(null)).toBe('');
  });

  it('formats to long month + year', () => {
    expect(fmtMonth('2024-06-15T12:00:00')).toMatch(/June 2024/);
  });
});

describe('formatDate', () => {
  it('returns em-dash for falsy values', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('formats to short month + day + year', () => {
    expect(formatDate('2024-06-15T12:00:00')).toMatch(/Jun 15, 2024/);
  });
});
