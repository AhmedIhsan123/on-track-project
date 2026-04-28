import puppeteer from 'puppeteer';
import { inferRemoteType } from '../utils.js';

// Site-specific DOM selectors as a fallback when JSON-LD is absent/incomplete
const SITE_SELECTORS = {
  'microsoft.com': {
    job_title: '[data-automation-id="jobPostingHeader"], h1',
    company_name: () => 'Microsoft',
    location: '[data-automation-id="jobPostingLocation"], [class*="location"]',
    job_description: '[data-automation-id="jobPostingDescription"], [class*="description"]',
  },
  'amazon.jobs': {
    job_title: 'h1.title, h1',
    company_name: () => 'Amazon',
    location: '.location, [class*="location"]',
    job_description: '.job-description, [class*="description"]',
  },
  'careers.google.com': {
    job_title: '[data-test="header-title"], h1',
    company_name: () => 'Google',
    location: '[data-test="header-location"], [class*="location"]',
    job_description: '[data-test="job-description"], [class*="description"]',
  },
  'metacareers.com': {
    job_title: '[data-testid="job-detail-title"], h1',
    company_name: () => 'Meta',
    location: '[data-testid="job-detail-location"], [class*="location"]',
    job_description: '[data-testid="job-detail-description"], [class*="description"]',
  },
  'linkedin.com': {
    job_title: 'h1.top-card-layout__title, h1',
    company_name: '.topcard__org-name-link, .topcard__flavor:not(.topcard__flavor--bullet)',
    location: '.topcard__flavor--bullet, [class*="location"]',
    job_description: '.description__text, [class*="description"]',
  },
  'apple.com': {
    job_title: '.jd__header--title, h1',
    company_name: () => 'Apple',
    location: '.jd__header--subtitle, [class*="location"]',
    job_description: '.jd__content, [class*="description"]',
  },
  'netflix.jobs': {
    job_title: 'h1',
    company_name: () => 'Netflix',
    location: '[class*="location"]',
    job_description: '[class*="description"], main',
  },
};

function getSiteSelectors(url) {
  for (const [domain, selectors] of Object.entries(SITE_SELECTORS)) {
    if (url.includes(domain)) return selectors;
  }
  return null;
}

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
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });

    const siteSelectors = getSiteSelectors(url);

    const result = await page.evaluate((selectors) => {
      function cleanText(str) {
        return (str || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ').trim();
      }

      function getText(selector) {
        if (!selector) return '';
        const el = document.querySelector(selector);
        return el ? cleanText(el.innerText || el.textContent) : '';
      }

      function formatSalary(baseSalary) {
        if (!baseSalary) return '';
        const currency = baseSalary.currency || '';
        const value = baseSalary.value;
        if (!value) return '';
        const fmt = (n) => Number(n).toLocaleString('en-US');
        if (value.minValue && value.maxValue) return `${currency} ${fmt(value.minValue)} – ${fmt(value.maxValue)}`.trim();
        if (value.value) return `${currency} ${fmt(value.value)}`.trim();
        if (typeof value === 'number') return `${currency} ${fmt(value)}`.trim();
        return '';
      }

      function extractLocation(jobLocation) {
        if (!jobLocation) return '';
        const locs = Array.isArray(jobLocation) ? jobLocation : [jobLocation];
        return locs.map((l) => {
          if (typeof l === 'string') return l;
          const addr = l.address;
          if (!addr) return '';
          return [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(', ');
        }).filter(Boolean).join(' | ');
      }

      // 1. JSON-LD JobPosting (richest source)
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const candidates = item['@type'] === 'JobPosting'
              ? [item]
              : (item['@graph'] || []).filter((g) => g['@type'] === 'JobPosting');

            for (const posting of candidates) {
              const location = extractLocation(posting.jobLocation);
              const salary_range = formatSalary(posting.baseSalary);
              const job_description = posting.description
                ? cleanText(posting.description).slice(0, 3000)
                : '';
              const date_posted = posting.datePosted ? posting.datePosted.slice(0, 10) : '';

              if (posting.title) {
                return {
                  job_title: posting.title,
                  company_name: posting.hiringOrganization?.name || '',
                  location,
                  salary_range,
                  job_description,
                  date_posted,
                  source: 'json-ld',
                };
              }
            }
          }
        } catch {}
      }

      // 2. Site-specific DOM selectors
      if (selectors) {
        const job_title = getText(selectors.job_title);
        const company_name = typeof selectors.company_name === 'string'
          ? getText(selectors.company_name)
          : selectors.company_name?.() || '';
        const location = getText(selectors.location);
        const descEl = document.querySelector(selectors.job_description);
        const job_description = descEl
          ? cleanText(descEl.innerText || descEl.textContent).slice(0, 3000)
          : '';

        if (job_title) {
          return { job_title, company_name, location, job_description, salary_range: '', date_posted: '', source: 'site-selectors' };
        }
      }

      // 3. Generic meta/title fallback
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content?.trim() || '';
      const ogSite = document.querySelector('meta[property="og:site_name"]')?.content?.trim() || '';
      const pageTitle = document.title.trim();
      const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim() || '';

      let job_title = ogTitle;
      let company_name = ogSite;

      if (!job_title && pageTitle) {
        const atMatch = pageTitle.match(/^(.+?)\s+at\s+(.+)$/i);
        const dashMatch = pageTitle.match(/^(.+?)\s*[-|–]\s*(.+)$/);
        if (atMatch) { job_title = atMatch[1].trim(); company_name = company_name || atMatch[2].trim(); }
        else if (dashMatch) { job_title = dashMatch[1].trim(); company_name = company_name || dashMatch[2].trim(); }
        else { job_title = pageTitle; }
      }

      const location = document.querySelector(
        '[class*="location"], [itemprop="jobLocation"], [data-testid*="location"]'
      )?.textContent?.trim() || '';

      const mainEl = document.querySelector('main, article, [role="main"]');
      const job_description = mainEl
        ? cleanText(mainEl.innerText || mainEl.textContent).slice(0, 3000)
        : metaDesc;

      // Salary from visible text
      const bodyText = document.body.innerText || '';
      const salaryMatch = bodyText.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:k|K|USD))?(?:\s*\/\s*(?:yr|year|hour|hr))?/);
      const salary_range = salaryMatch?.[0] || '';

      return { job_title, company_name, location, job_description, salary_range, date_posted: '', source: 'fallback' };
    }, siteSelectors);

    const remote_type = inferRemoteType(`${result.location} ${result.job_title}`);
    return { ...result, remote_type, job_url: url };
  } finally {
    await browser.close();
  }
}
