import { scrapeJob } from '../scraper/index.js';

export async function scrape(req, res) {
  const { url } = req.body;

  if (!url?.trim()) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url); // validate it's a real URL
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const result = await scrapeJob(url);
    res.json(result);
  } catch (_err) {
    // Return a partial result so the frontend can still pre-fill the URL
    res.json({ job_title: '', company_name: '', location: '', remote_type: '', job_description: '', job_url: url, scrape_error: true });
  }
}
