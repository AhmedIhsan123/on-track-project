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

// Convert hourly rate to annual equivalent (40hr/wk × 52wk)
function hourlyToAnnual(h) {
  return Math.round(Number(h) * 2080);
}

// Format a JSON-LD baseSalary object into "$75k-85k" style
// Converts hourly baseSalary (unitText: "HOUR") to annual automatically
export function formatSalary(baseSalary) {
  if (!baseSalary) return '';
  const value = baseSalary.value;
  if (!value) return '';
  const isHourly = /hour/i.test(baseSalary.unitText || '');
  const convert = isHourly ? hourlyToAnnual : (n) => Math.round(Number(n));
  if (value.minValue && value.maxValue) {
    return `$${toK(convert(value.minValue))}-${toK(convert(value.maxValue))}`;
  }
  if (value.value) return `$${toK(convert(value.value))}`;
  if (typeof value === 'number') return `$${toK(convert(value))}`;
  return '';
}

// Normalize a raw salary text match into "$75k-85k"
// Hourly rates ($/hr, per hour) are converted to annual equivalent
export function normalizeSalary(raw) {
  if (!raw) return '';
  const isHourly = /\/\s*h(r|our)\b|per\s+hour/i.test(raw);
  const parts = [];
  const re = /\$\s*([\d,.]+)\s*(k)?/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    let n = Number(m[1].replace(/,/g, ''));
    if (m[2]) n *= 1000;
    parts.push(n);
  }
  if (parts.length === 0) return raw.trim();
  const vals = isHourly ? parts.map(hourlyToAnnual) : parts;
  if (vals.length >= 2) return `$${toK(vals[0])}-${toK(vals[1])}`;
  return `$${toK(vals[0])}`;
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
