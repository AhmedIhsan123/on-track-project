import axios from 'axios';
import { isGreenhouse, parseGreenhouse } from './parsers/greenhouse.js';
import { isLever, parseLever } from './parsers/lever.js';
import { parseGeneric } from './parsers/generic.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

export async function scrapeJob(url) {
  const { data: html } = await axios.get(url, {
    headers: HEADERS,
    timeout: 10000,
  });

  if (isGreenhouse(url)) return parseGreenhouse(html, url);
  if (isLever(url)) return parseLever(html, url);
  return parseGeneric(html, url);
}
