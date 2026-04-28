import * as cheerio from 'cheerio';
import { inferRemoteType } from '../utils.js';

export function parseGeneric(html, url) {
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  const ogSite = $('meta[property="og:site_name"]').attr('content')?.trim();
  const pageTitle = $('title').text().trim();

  // Many job pages put "Job Title - Company" or "Job Title at Company" in the title
  let job_title = '';
  let company_name = ogSite || '';

  if (ogTitle) {
    job_title = ogTitle;
  } else if (pageTitle) {
    const atMatch = pageTitle.match(/^(.+?)\s+at\s+(.+)$/i);
    const dashMatch = pageTitle.match(/^(.+?)\s*[-|–]\s*(.+)$/);
    if (atMatch) {
      job_title = atMatch[1].trim();
      company_name = company_name || atMatch[2].trim();
    } else if (dashMatch) {
      job_title = dashMatch[1].trim();
      company_name = company_name || dashMatch[2].trim();
    } else {
      job_title = pageTitle;
    }
  }

  const location = $('[class*="location"]').first().text().trim()
    || $('[itemprop="jobLocation"]').first().text().trim()
    || '';

  const remote_type = inferRemoteType(location + ' ' + job_title + ' ' + pageTitle);

  const job_description = $('meta[name="description"]').attr('content')?.trim() || '';

  return { job_title, company_name, location, remote_type, job_description, job_url: url };
}
