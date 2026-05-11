import { describe, it, expect } from 'vitest';
import { parseGeneric } from './generic.js';

const BASE_URL = 'https://example.com/jobs/123';

describe('parseGeneric', () => {
  it('extracts details from JSON-LD when available', () => {
    const posting = {
      '@type': 'JobPosting',
      title: 'Data Engineer',
      hiringOrganization: { name: 'Data Co' },
      jobLocation: 'San Francisco, CA',
    };
    const html = `<script type="application/ld+json">${JSON.stringify(posting)}</script>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.job_title).toBe('Data Engineer');
    expect(result.company_name).toBe('Data Co');
    expect(result.location).toBe('San Francisco, CA');
  });

  it('uses og:title and og:site_name meta tags', () => {
    const html = `<html><head>
      <meta property="og:title" content="Senior Engineer" />
      <meta property="og:site_name" content="Acme" />
    </head><body></body></html>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.job_title).toBe('Senior Engineer');
    expect(result.company_name).toBe('Acme');
  });

  it('parses "role at company" page title format', () => {
    const html = `<html><head><title>Software Engineer at StartupCo</title></head><body></body></html>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.job_title).toBe('Software Engineer');
    expect(result.company_name).toBe('StartupCo');
  });

  it('parses "role — company" dash-separated page title', () => {
    const html = `<html><head><title>Product Manager – BigCorp</title></head><body></body></html>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.job_title).toBe('Product Manager');
  });

  it('infers remote work type from page text', () => {
    const html = `<html><head><title>Remote Software Engineer at Co</title></head><body></body></html>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.remote_type).toBe('remote');
  });

  it('extracts salary range from page text', () => {
    const html = `<html><body><p>Salary: $80,000 – $120,000 / year</p></body></html>`;
    const result = parseGeneric(html, BASE_URL);
    expect(result.salary_range).toMatch(/\$80,000/);
  });

  it('always includes job_url in the result', () => {
    const result = parseGeneric('<html></html>', BASE_URL);
    expect(result.job_url).toBe(BASE_URL);
  });
});
