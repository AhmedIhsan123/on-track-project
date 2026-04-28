import axios from 'axios';
import { isGreenhouse, parseGreenhouse } from './parsers/greenhouse.js';
import { isLever, parseLever } from './parsers/lever.js';
import { parseGeneric } from './parsers/generic.js';
import { scrapeWithPuppeteer } from './parsers/puppeteer.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

async function fetchHtml(url) {
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
  return data;
}

export async function scrapeJob(url) {
  // Greenhouse and Lever are server-rendered — fast Cheerio path
  if (isGreenhouse(url)) {
    const html = await fetchHtml(url);
    return parseGreenhouse(html, url);
  }
  if (isLever(url)) {
    const html = await fetchHtml(url);
    return parseLever(html, url);
  }

  // Everything else (Microsoft, Amazon, Google, LinkedIn, Meta, etc.)
  // needs a real browser to execute JavaScript first
  return scrapeWithPuppeteer(url);
}
