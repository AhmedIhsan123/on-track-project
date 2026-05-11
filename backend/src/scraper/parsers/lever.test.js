import { describe, it, expect } from 'vitest';
import { isLever, parseLever } from './lever.js';

describe('isLever', () => {
  it('matches lever.co URLs', () => {
    expect(isLever('https://jobs.lever.co/acme/abc-123')).toBe(true);
    expect(isLever('https://lever.co/company/posting')).toBe(true);
  });

  it('rejects non-lever URLs', () => {
    expect(isLever('https://boards.greenhouse.io/acme/jobs/1')).toBe(false);
    expect(isLever('https://example.com/careers')).toBe(false);
  });
});

describe('parseLever', () => {
  const url = 'https://jobs.lever.co/acme/abc-123';

  it('extracts job details from JSON-LD', () => {
    const posting = {
      '@type': 'JobPosting',
      title: 'Product Designer',
      hiringOrganization: { name: 'Design Co' },
    };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseLever(html, url);
    expect(result.job_title).toBe('Product Designer');
    expect(result.company_name).toBe('Design Co');
  });

  it('falls back to URL slug when company name is missing', () => {
    const posting = { '@type': 'JobPosting', title: 'Engineer', hiringOrganization: { name: '' } };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseLever(html, 'https://jobs.lever.co/my-startup/abc-123');
    expect(result.company_name).toBe('my startup');
  });

  it('infers remote_type from job title and location', () => {
    const posting = {
      '@type': 'JobPosting',
      title: 'Remote Software Engineer',
      hiringOrganization: { name: 'Co' },
    };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseLever(html, url);
    expect(result.remote_type).toBe('remote');
  });

  it('falls back to DOM parsing when no JSON-LD', () => {
    const html = `
      <html><body>
        <h2 data-qa="posting-name">Senior Backend Engineer</h2>
        <a class="main-header-logo"><img alt="StartupCo" /></a>
        <div data-qa="posting-categories">
          <span class="sort-by-location">San Francisco, CA</span>
        </div>
      </body></html>
    `;
    const result = parseLever(html, 'https://jobs.lever.co/startupco/xyz-456');
    expect(result.job_title).toBe('Senior Backend Engineer');
    expect(result.company_name).toBe('StartupCo');
    expect(result.location).toBe('San Francisco, CA');
  });
});
