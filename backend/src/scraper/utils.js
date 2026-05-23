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

// Normalize a salary number to a short format (75000 → "75k", 120000 → "120k")
function toK(n) {
  const num = Math.round(Number(n));
  return num >= 1000 ? `${Math.round(num / 1000)}k` : String(num);
}

// Format a JSON-LD baseSalary object into "$75k-85k" style
export function formatSalary(baseSalary) {
  if (!baseSalary) return '';
  const value = baseSalary.value;
  if (!value) return '';
  if (value.minValue && value.maxValue) {
    return `$${toK(value.minValue)}-${toK(value.maxValue)}`;
  }
  if (value.value) return `$${toK(value.value)}`;
  if (typeof value === 'number') return `$${toK(value)}`;
  return '';
}

// Normalize a raw salary text match (e.g. "$75,000 - $85,000/yr") into "$75k-85k"
export function normalizeSalary(raw) {
  if (!raw) return '';
  // Leave hourly rates as-is
  if (/\/\s*h(r|our)/i.test(raw)) return raw.trim();
  const parts = [];
  const re = /\$\s*([\d,]+)\s*(k)?/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    let n = Number(m[1].replace(/,/g, ''));
    if (m[2]) n *= 1000;
    parts.push(n);
  }
  if (parts.length === 0) return raw.trim();
  if (parts.length >= 2) return `$${toK(parts[0])}-${toK(parts[1])}`;
  return `$${toK(parts[0])}`;
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
