import puppeteer from 'puppeteer';
import { inferRemoteType } from '../utils.js';

export async function scrapeWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    const result = await page.evaluate(() => {
      // 1. Try JSON-LD JobPosting schema (used by Google, LinkedIn, Microsoft, Amazon, etc.)
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          const posting = Array.isArray(data)
            ? data.find((d) => d['@type'] === 'JobPosting')
            : data['@type'] === 'JobPosting' ? data : null;

          if (posting) {
            const location = typeof posting.jobLocation === 'object'
              ? (posting.jobLocation?.address?.addressLocality || posting.jobLocation?.address?.addressRegion || '')
              : (posting.jobLocation || '');

            const salary = posting.baseSalary
              ? `${posting.baseSalary.currency || ''} ${posting.baseSalary.value?.minValue || ''} – ${posting.baseSalary.value?.maxValue || ''}`.trim()
              : '';

            return {
              job_title: posting.title || '',
              company_name: posting.hiringOrganization?.name || '',
              location: Array.isArray(location) ? location[0] : location,
              job_description: posting.description ? posting.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000) : '',
              date_posted: posting.datePosted ? posting.datePosted.slice(0, 10) : '',
              salary_range: salary,
              source: 'json-ld',
            };
          }
        } catch {}
      }

      // 2. Fallback: OG tags + title parsing
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content?.trim();
      const ogSite = document.querySelector('meta[property="og:site_name"]')?.content?.trim();
      const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
      const pageTitle = document.title.trim();

      let job_title = ogTitle || '';
      let company_name = ogSite || '';

      if (!job_title && pageTitle) {
        const atMatch = pageTitle.match(/^(.+?)\s+at\s+(.+)$/i);
        const dashMatch = pageTitle.match(/^(.+?)\s*[-|–]\s*(.+)$/);
        if (atMatch) { job_title = atMatch[1].trim(); company_name = company_name || atMatch[2].trim(); }
        else if (dashMatch) { job_title = dashMatch[1].trim(); company_name = company_name || dashMatch[2].trim(); }
        else { job_title = pageTitle; }
      }

      const location = document.querySelector('[class*="location"]')?.textContent?.trim()
        || document.querySelector('[itemprop="jobLocation"]')?.textContent?.trim()
        || '';

      return { job_title, company_name, location, job_description: description, date_posted: '', salary_range: '', source: 'fallback' };
    });

    const remote_type = inferRemoteType(`${result.location} ${result.job_title}`);
    return { ...result, remote_type, job_url: url };
  } finally {
    await browser.close();
  }
}
