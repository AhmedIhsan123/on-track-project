import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields, normalizeSalary } from '../utils.js';

export function isGreenhouse(url) {
  return /greenhouse\.io/.test(url);
}

function extractRequirements($) {
  let sectionHeading = null;
  $('h1, h2, h3, h4, strong, b').each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    if (/requirement|qualification|what you.ll|must have|you bring|about you/i.test(text)) {
      sectionHeading = $(el);
      return false;
    }
  });
  if (!sectionHeading) return '';

  let ul = sectionHeading.next('ul');
  if (!ul.length) ul = sectionHeading.nextAll('ul').first();
  if (!ul.length) ul = sectionHeading.parent().nextAll('ul').first();
  if (!ul.length) ul = sectionHeading.closest('section, div').find('ul').first();
  if (!ul.length) return '';

  const bullets = [];
  ul.find('> li').slice(0, 8).each((_, li) => {
    const text = $(li).text().replace(/\s+/g, ' ').trim();
    if (text.length > 5) bullets.push(`• ${text}`);
  });

  if (!bullets.length) return '';
  return `Requirements:\n${bullets.join('\n')}`;
}

const SALARY_RE = /\$[\d,.]+\s*(?:[-–]\s*\$[\d,.]+\s*)?(?:\/\s*h(?:r|our)\b|per\s+hour)|\$[\d,]+\s*k?\s*[-–]\s*\$[\d,]+\s*k?|\$[\d,]+\s*k(?:\s*[-–]\s*\$?[\d,]+\s*k?)?/i;

export function parseGreenhouse(html, url) {
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    if (!fields.company_name) {
      fields.company_name = url.match(/greenhouse\.io\/([^/]+)/)?.[1]?.replace(/-/g, ' ') || '';
    }
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
    const $ = cheerio.load(html);
    if (!fields.salary_range) {
      const salaryMatch = $('body').text().match(SALARY_RE);
      fields.salary_range = salaryMatch ? normalizeSalary(salaryMatch[0]) : '';
    }
    fields.notes = extractRequirements($);
    return fields;
  }

  const $ = cheerio.load(html);

  const job_title = $('h1.app-title, h1').first().text().trim();

  const company_name = $('.company-name').first().text().trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || url.match(/greenhouse\.io\/([^/]+)/)?.[1]?.replace(/-/g, ' ')
    || '';

  const location = $('.location, [class*="location"]').first().text().trim();
  const remote_type = inferRemoteType(`${location} ${job_title}`);

  const descEl = $('#content, .job-description, [class*="description"]').first();
  const job_description = cleanText(descEl.html() || descEl.text()).slice(0, 3000);

  const pageText = $('body').text();
  const salaryMatch = pageText.match(SALARY_RE);
  const salary_range = salaryMatch ? normalizeSalary(salaryMatch[0]) : '';

  const notes = extractRequirements($);

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted: '', notes, job_url: url };
}
