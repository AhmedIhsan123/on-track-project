import * as cheerio from 'cheerio';
import { inferRemoteType } from '../utils.js';

// Matches: boards.greenhouse.io/company/jobs/123 or boards.eu.greenhouse.io/...
export function isGreenhouse(url) {
  return /greenhouse\.io/.test(url);
}

export function parseGreenhouse(html, url) {
  const $ = cheerio.load(html);

  const job_title = $('h1.app-title').first().text().trim()
    || $('h1').first().text().trim();

  // Company name sits in the header logo alt or a dedicated element
  const company_name = $('.company-name').first().text().trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || '';

  const location = $('.location').first().text().trim()
    || $('[class*="location"]').first().text().trim()
    || '';

  const remote_type = inferRemoteType(location + ' ' + job_title);

  const job_description = $('#content').text().trim()
    || $('.job-description').text().trim()
    || '';

  return { job_title, company_name, location, remote_type, job_description, job_url: url };
}
