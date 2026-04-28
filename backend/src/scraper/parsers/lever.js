import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields } from '../utils.js';

export function isLever(url) {
  return /lever\.co/.test(url);
}

export function parseLever(html, url) {
  // JSON-LD first
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    if (!fields.company_name) {
      fields.company_name = url.split('lever.co/')[1]?.split('/')[0]?.replace(/-/g, ' ') || '';
    }
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
    return fields;
  }

  // DOM fallback
  const $ = cheerio.load(html);

  const job_title = $('h2[data-qa="posting-name"], h2').first().text().trim();

  const company_name = $('a.main-header-logo img').attr('alt')?.trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || url.split('lever.co/')[1]?.split('/')[0]?.replace(/-/g, ' ')
    || '';

  const location = $('[data-qa="posting-categories"] .sort-by-location, .location').first().text().trim();
  const commitment = $('[data-qa="posting-categories"] .sort-by-commitment').first().text().trim();
  const team = $('[data-qa="posting-categories"] .sort-by-team').first().text().trim();
  const remote_type = inferRemoteType(`${location} ${commitment}`);

  const descEl = $('[data-qa="posting-description"], .section-wrapper').first();
  const job_description = cleanText(descEl.html() || descEl.text()).slice(0, 3000);

  const pageText = $('body').text();
  const salaryMatch = pageText.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:k|K|USD))?(?:\s*\/\s*(?:yr|year|hour|hr))?/);
  const salary_range = salaryMatch?.[0] || '';

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted: '', job_url: url };
}
