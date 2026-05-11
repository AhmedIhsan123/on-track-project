import { describe, it, expect } from 'vitest';
import {
  inferRemoteType,
  cleanText,
  formatSalary,
  extractJobLocation,
  extractJsonLdPosting,
  postingToFields,
} from './utils.js';

describe('inferRemoteType', () => {
  it('returns remote', () => expect(inferRemoteType('fully remote position')).toBe('remote'));
  it('returns hybrid', () => expect(inferRemoteType('hybrid work model')).toBe('hybrid'));
  it('returns onsite for onsite', () => expect(inferRemoteType('onsite required')).toBe('onsite'));
  it('returns onsite for on-site', () => expect(inferRemoteType('on-site role')).toBe('onsite'));
  it('returns onsite for in-office', () => expect(inferRemoteType('in office 5 days')).toBe('onsite'));
  it('returns empty string for no match', () => expect(inferRemoteType('competitive salary')).toBe(''));
  it('hybrid takes priority over remote in same string', () => expect(inferRemoteType('hybrid remote')).toBe('hybrid'));
});

describe('cleanText', () => {
  it('strips HTML tags', () => expect(cleanText('<p>Hello <b>world</b></p>')).toBe('Hello world'));
  it('decodes &amp;', () => expect(cleanText('a &amp; b')).toBe('a & b'));
  it('decodes &lt; and &gt;', () => expect(cleanText('&lt;div&gt;')).toBe('<div>'));
  it('replaces &nbsp; with space', () => expect(cleanText('a&nbsp;b')).toBe('a b'));
  it('collapses whitespace', () => expect(cleanText('  too   many   spaces  ')).toBe('too many spaces'));
  it('handles empty string', () => expect(cleanText('')).toBe(''));
});

describe('formatSalary', () => {
  it('returns empty string for null', () => expect(formatSalary(null)).toBe(''));
  it('returns empty string for missing value', () => expect(formatSalary({ currency: 'USD' })).toBe(''));

  it('formats a min/max range', () => {
    const sal = {
      currency: 'USD',
      value: { '@type': 'QuantitativeValueDistribution', minValue: 80000, maxValue: 120000 },
    };
    expect(formatSalary(sal)).toBe('USD 80,000 – 120,000');
  });

  it('formats a single value', () => {
    const sal = { currency: '$', value: { value: 100000 } };
    expect(formatSalary(sal)).toBe('$ 100,000');
  });

  it('formats a numeric value directly', () => {
    const sal = { currency: 'GBP', value: 75000 };
    expect(formatSalary(sal)).toBe('GBP 75,000');
  });
});

describe('extractJobLocation', () => {
  it('returns empty string for null', () => expect(extractJobLocation(null)).toBe(''));

  it('handles a plain string', () => {
    expect(extractJobLocation('New York, NY')).toBe('New York, NY');
  });

  it('handles an address object', () => {
    const loc = { address: { addressLocality: 'San Francisco', addressRegion: 'CA', addressCountry: 'US' } };
    expect(extractJobLocation(loc)).toBe('San Francisco, CA, US');
  });

  it('joins multiple locations with pipe', () => {
    expect(extractJobLocation(['New York', 'Remote'])).toBe('New York | Remote');
  });

  it('filters empty address parts', () => {
    const loc = { address: { addressLocality: 'Austin', addressRegion: '', addressCountry: 'US' } };
    expect(extractJobLocation(loc)).toBe('Austin, US');
  });
});

describe('extractJsonLdPosting', () => {
  it('returns null when no ld+json present', () => {
    expect(extractJsonLdPosting('<html><body>no scripts</body></html>')).toBeNull();
  });

  it('extracts a top-level JobPosting', () => {
    const posting = { '@type': 'JobPosting', title: 'Engineer' };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    expect(extractJsonLdPosting(html)).toMatchObject({ title: 'Engineer' });
  });

  it('extracts JobPosting from @graph', () => {
    const graph = { '@graph': [{ '@type': 'Organization' }, { '@type': 'JobPosting', title: 'Dev' }] };
    const html = `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
    expect(extractJsonLdPosting(html)).toMatchObject({ title: 'Dev' });
  });

  it('extracts from an array of ld+json objects', () => {
    const data = [{ '@type': 'WebPage' }, { '@type': 'JobPosting', title: 'Designer' }];
    const html = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    expect(extractJsonLdPosting(html)).toMatchObject({ title: 'Designer' });
  });

  it('returns null for malformed JSON', () => {
    const html = `<script type="application/ld+json">{ bad json }</script>`;
    expect(extractJsonLdPosting(html)).toBeNull();
  });
});

describe('postingToFields', () => {
  it('maps posting fields to the application schema', () => {
    const posting = {
      title: 'Frontend Engineer',
      hiringOrganization: { name: 'Acme Corp' },
      jobLocation: 'San Francisco, CA',
      datePosted: '2024-01-15T00:00:00Z',
      description: '<p>Great role</p>',
    };
    const result = postingToFields(posting, 'https://example.com/job/1');
    expect(result.job_title).toBe('Frontend Engineer');
    expect(result.company_name).toBe('Acme Corp');
    expect(result.location).toBe('San Francisco, CA');
    expect(result.date_posted).toBe('2024-01-15');
    expect(result.job_description).toBe('Great role');
    expect(result.job_url).toBe('https://example.com/job/1');
  });

  it('returns empty strings for missing fields', () => {
    const result = postingToFields({}, 'https://example.com');
    expect(result.job_title).toBe('');
    expect(result.company_name).toBe('');
    expect(result.salary_range).toBe('');
  });
});
