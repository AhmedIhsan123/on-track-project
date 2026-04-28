import * as cheerio from 'cheerio';
import { inferRemoteType, cleanText, extractJsonLdPosting, postingToFields } from '../utils.js';

export function parseGeneric(html, url) {
  // JSON-LD first — many ATS platforms embed it even in server-rendered HTML
  const posting = extractJsonLdPosting(html);
  if (posting) {
    const fields = postingToFields(posting, url);
    fields.remote_type = inferRemoteType(`${fields.location} ${fields.job_title}`);
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
  const salaryMatch = pageText.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:k|K|USD))?(?:\s*\/\s*(?:yr|year|hour|hr))?/);
  const salary_range = salaryMatch?.[0] || '';

  return { job_title, company_name, location, remote_type, salary_range, job_description, date_posted: '', job_url: url };
}
