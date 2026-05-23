import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields, normalizeSalary } from '../utils.js';

export function isLever(url) {
  return /lever\.co/.test(url);
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

export function parseLever(html, url) {
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    if (!fields.company_name) {
      fields.company_name = url.split('lever.co/')[1]?.split('/')[0]?.replace(/-/g, ' ') || '';
    }
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
    const $ = cheerio.load(html);
    fields.notes = extractRequirements($);
    return fields;
  }

  const $ = cheerio.load(html);

  const job_title = $('h2[data-qa="posting-name"], h2').first().text().trim();

  const company_name = $('a.main-header-logo img').attr('alt')?.trim()
    || $('meta[property="og:site_name"]').attr('content')?.trim()
    || url.split('lever.co/')[1]?.split('/')[0]?.replace(/-/g, ' ')
    || '';

  const location = $('[data-qa="posting-categories"] .sort-by-location, .location').first().text().trim();
  const commitment = $('[data-qa="posting-categories"] .sort-by-commitment').first().text().trim();
  const remote_type = inferRemoteType(`${location} ${commitment}`);

  const descEl = $('[data-qa="posting-description"], .section-wrapper').first();
  const job_description = cleanText(descEl.html() || descEl.text()).slice(0, 3000);

  const pageText = $('body').text();
  const salaryMatch = pageText.match(/\$[\d,]+\s*k?\s*[-–]\s*\$[\d,]+\s*k?|\$[\d,]+\s*k/i);
  const salary_range = salaryMatch ? normalizeSalary(salaryMatch[0]) : '';

  const notes = extractRequirements($);

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted: '', notes, job_url: url };
}
