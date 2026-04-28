import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields } from '../utils.js';

export function isGreenhouse(url) {
  return /greenhouse\.io/.test(url);
}

export function parseGreenhouse(html, url) {
  // JSON-LD first — Greenhouse embeds it on most boards
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    // Greenhouse JSON-LD sometimes omits company — fall back to URL slug
    if (!fields.company_name) {
      fields.company_name = url.match(/greenhouse\.io\/([^/]+)/)?.[1]?.replace(/-/g, ' ') || '';
    }
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
    return fields;
  }

  // DOM fallback
  const $ = cheerio.load(html);

  const job_title = $('h1.app-title, h1').first().text().trim();

  const company_name = $('.company-name').first().text().trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || url.match(/greenhouse\.io\/([^/]+)/)?.[1]?.replace(/-/g, ' ')
    || '';

  const location = $('.location, [class*="location"]').first().text().trim();

  const remote_type = inferRemoteType(`${location} ${job_title}`);

  // Grab full description HTML and convert to plain text
  const descEl = $('#content, .job-description, [class*="description"]').first();
  const job_description = cleanText(descEl.html() || descEl.text()).slice(0, 3000);

  // Try to find salary in the page text
  const pageText = $('body').text();
  const salaryMatch = pageText.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:k|K|USD))?(?:\s*\/\s*(?:yr|year|hour|hr))?/);
  const salary_range = salaryMatch?.[0] || '';

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted: '', job_url: url };
}
