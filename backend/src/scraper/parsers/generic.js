import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields, normalizeSalary } from '../utils.js';

function extractDatePosted($) {
  // 1. <time> with datetime attribute
  let found = '';
  $('time[datetime]').each((_, el) => {
    const dt = $(el).attr('datetime');
    if (dt && /^\d{4}-\d{2}-\d{2}/.test(dt)) { found = dt.slice(0, 10); return false; }
  });
  if (found) return found;

  // 2. Meta tags
  const metaDate = $('meta[property="article:published_time"], meta[name="date"], meta[itemprop="datePosted"]')
    .first().attr('content');
  if (metaDate && /^\d{4}-\d{2}-\d{2}/.test(metaDate)) return metaDate.slice(0, 10);

  // 3. "Posted N days/weeks ago" in body text
  const bodyText = $('body').text();
  const agoMatch = bodyText.match(/posted\s+(\d+)\s+(day|week|month)s?\s+ago/i);
  if (agoMatch) {
    const n = parseInt(agoMatch[1]);
    const unit = agoMatch[2].toLowerCase();
    const d = new Date();
    if (unit === 'day') d.setDate(d.getDate() - n);
    else if (unit === 'week') d.setDate(d.getDate() - n * 7);
    else if (unit === 'month') d.setMonth(d.getMonth() - n);
    return d.toISOString().slice(0, 10);
  }

  return '';
}

function extractRequirements($) {
  // Find a heading that looks like a requirements/qualifications section
  let sectionHeading = null;
  $('h1, h2, h3, h4, strong, b').each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    if (/requirement|qualification|what you.ll|what we.re looking|must have|you have|you bring|you.ll bring|about you/i.test(text)) {
      sectionHeading = $(el);
      return false;
    }
  });
  if (!sectionHeading) return '';

  // Try to find the nearest <ul> after that heading
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

export function parseGeneric(html, url) {
  // JSON-LD first — many ATS platforms embed it even in server-rendered HTML
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
    // Extract date posted from DOM if JSON-LD didn't have it
    if (!fields.date_posted) {
      const $ = cheerio.load(html);
      fields.date_posted = extractDatePosted($);
    }
    // Extract requirements into notes
    const $ = cheerio.load(html);
    fields.notes = extractRequirements($);
    return fields;
  }

  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  const ogSite = $('meta[property="og:site_name"]').attr('content')?.trim();
  const pageTitle = $('title').text().trim();

  let job_title = ogTitle || '';
  let company_name = ogSite || '';

  if (!job_title && pageTitle) {
    const atMatch = pageTitle.match(/^(.+?)\s+at\s+(.+)$/i);
    const dashMatch = pageTitle.match(/^(.+?)\s*[-|–]\s*(.+)$/);
    if (atMatch) { job_title = atMatch[1].trim(); company_name = company_name || atMatch[2].trim(); }
    else if (dashMatch) { job_title = dashMatch[1].trim(); company_name = company_name || dashMatch[2].trim(); }
    else { job_title = pageTitle; }
  }

  const location = $('[class*="location"], [itemprop="jobLocation"], [data-testid*="location"]').first().text().trim();
  const remote_type = inferRemoteType(`${location} ${job_title} ${pageTitle}`);

  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
  const mainContent = $('main, article, [role="main"], [class*="description"], [class*="content"]').first();
  const job_description = (mainContent.length
    ? cleanText(mainContent.html() || mainContent.text())
    : metaDesc
  ).slice(0, 3000);

  const pageText = $('body').text();
  const salaryMatch = pageText.match(/\$[\d,]+\s*k?\s*[-–]\s*\$[\d,]+\s*k?|\$[\d,]+\s*k(?:\s*[-–]\s*\$?[\d,]+\s*k?)?/i);
  const salary_range = salaryMatch ? normalizeSalary(salaryMatch[0]) : '';

  const date_posted = extractDatePosted($);
  const notes = extractRequirements($);

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted, notes, job_url: url };
}
