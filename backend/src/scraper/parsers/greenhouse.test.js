import { describe, it, expect } from 'vitest';
import { isGreenhouse, parseGreenhouse } from './greenhouse.js';

describe('isGreenhouse', () => {
  it('matches greenhouse.io URLs', () => {
    expect(isGreenhouse('https://boards.greenhouse.io/acme/jobs/123')).toBe(true);
    expect(isGreenhouse('https://job-boards.greenhouse.io/company/jobs/456')).toBe(true);
  });

  it('rejects non-greenhouse URLs', () => {
    expect(isGreenhouse('https://lever.co/acme/abc-123')).toBe(false);
    expect(isGreenhouse('https://example.com/jobs')).toBe(false);
  });
});

describe('parseGreenhouse', () => {
  const url = 'https://boards.greenhouse.io/acme/jobs/123';

  it('extracts job details from JSON-LD', () => {
    const posting = {
      '@type': 'JobPosting',
      title: 'Frontend Engineer',
      hiringOrganization: { name: 'Acme Corp' },
      jobLocation: { address: { addressLocality: 'New York', addressRegion: 'NY' } },
      datePosted: '2024-03-01',
    };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseGreenhouse(html, url);
    expect(result.job_title).toBe('Frontend Engineer');
    expect(result.company_name).toBe('Acme Corp');
    expect(result.location).toBe('New York, NY');
    expect(result.date_posted).toBe('2024-03-01');
  });

  it('falls back to URL slug when JSON-LD omits company name', () => {
    const posting = { '@type': 'JobPosting', title: 'Engineer', hiringOrganization: { name: '' } };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseGreenhouse(html, 'https://boards.greenhouse.io/acme-corp/jobs/1');
    expect(result.company_name).toBe('acme corp');
  });

  it('infers remote_type from location text', () => {
    const posting = {
      '@type': 'JobPosting',
      title: 'Engineer',
      hiringOrganization: { name: 'Co' },
      jobLocation: 'Remote',
    };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseGreenhouse(html, url);
    expect(result.remote_type).toBe('remote');
  });

  it('falls back to DOM parsing when no JSON-LD', () => {
    const html = `
      <html><body>
        <h1 class="app-title">Backend Developer</h1>
        <div class="company-name">Test Company</div>
        <div class="location">Austin, TX</div>
      </body></html>
    `;
    const result = parseGreenhouse(html, url);
    expect(result.job_title).toBe('Backend Developer');
    expect(result.company_name).toBe('Test Company');
    expect(result.location).toBe('Austin, TX');
  });
});
