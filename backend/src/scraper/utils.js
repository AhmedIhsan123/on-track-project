export function inferRemoteType(text) {
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  if (/\bremote\b/.test(t)) return 'remote';
  if (/\bonsite\b|\bon-site\b|\bin.office\b|\bin person\b/.test(t)) return 'onsite';
  return '';
}

export function cleanText(str = '') {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatSalary(baseSalary) {
  if (!baseSalary) return '';
  const currency = baseSalary.currency || '';
  const value = baseSalary.value;
  if (!value) return '';
  const fmt = (n) => Number(n).toLocaleString('en-US');
  if (value['@type'] === 'QuantitativeValueDistribution' || (value.minValue && value.maxValue)) {
    return `${currency} ${fmt(value.minValue)} – ${fmt(value.maxValue)}`.trim();
  }
  if (value.value) return `${currency} ${fmt(value.value)}`.trim();
  if (typeof value === 'number') return `${currency} ${fmt(value)}`.trim();
  return '';
}

export function extractJobLocation(jobLocation) {
  if (!jobLocation) return '';
  const locs = Array.isArray(jobLocation) ? jobLocation : [jobLocation];
  return locs.map((l) => {
    if (typeof l === 'string') return l;
    const addr = l.address;
    if (!addr) return '';
    return [addr.addressLocality, addr.addressRegion, addr.addressCountry]
      .filter(Boolean).join(', ');
  }).filter(Boolean).join(' | ');
}

// Parse JSON-LD JobPosting from raw HTML string (for Cheerio-based parsers)
export function extractJsonLdPosting(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'JobPosting') return item;
        // handle @graph arrays
        if (item['@graph']) {
          const found = item['@graph'].find((g) => g['@type'] === 'JobPosting');
          if (found) return found;
        }
      }
    } catch {}
  }
  return null;
}

export function postingToFields(posting, url) {
  return {
    job_title: posting.title || '',
    company_name: posting.hiringOrganization?.name || '',
    location: extractJobLocation(posting.jobLocation),
    salary_range: formatSalary(posting.baseSalary),
    date_posted: posting.datePosted ? posting.datePosted.slice(0, 10) : '',
    job_description: posting.description ? cleanText(posting.description).slice(0, 3000) : '',
    job_url: url,
  };
}
