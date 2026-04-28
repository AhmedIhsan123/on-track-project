import * as cheerio from 'cheerio';
import { inferRemoteType } from '../utils.js';

// Matches: jobs.lever.co/company/uuid
export function isLever(url) {
  return /lever\.co/.test(url);
}

export function parseLever(html, url) {
  const $ = cheerio.load(html);

  const job_title = $('h2[data-qa="posting-name"]').first().text().trim()
    || $('h2').first().text().trim();

  const company_name = $('a.main-header-logo img').attr('alt')?.trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || url.split('lever.co/')[1]?.split('/')[0] || '';

  const location = $('[data-qa="posting-categories"] .sort-by-location').first().text().trim()
    || $('.location').first().text().trim()
    || '';

  const commitment = $('[data-qa="posting-categories"] .sort-by-commitment').first().text().trim();
  const remote_type = inferRemoteType(location + ' ' + commitment);

  const job_description = $('[data-qa="posting-description"]').text().trim()
    || $('.section-wrapper').text().trim()
    || '';

  return { job_title, company_name, location, remote_type, job_description, job_url: url };
}
