import { getApplications, getStats, getApplicationById, updateApplication, createApplication, deleteApplicationById } from '../db/applications.js';
import { scrapeJob } from '../scraper/index.js';

export async function listStats(req, res) {
  const stats = await getStats(req.user.id);
  res.json(stats);
}

export async function listApplications(req, res) {
  const applications = await getApplications(req.user.id);
  res.json(applications);
}

export async function getApplication(req, res) {
  const application = await getApplicationById(req.user.id, req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json(application);
}

export async function editApplication(req, res) {
  const application = await updateApplication(req.user.id, req.params.id, req.body);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json(application);
}

export async function removeApplication(req, res) {
  await deleteApplicationById(req.user.id, req.params.id);
  res.status(204).end();
}

export async function createApplicationFromUrl(req, res) {
  const { url } = req.body;

  if (!url?.trim()) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let scraped = {};
  try {
    scraped = await scrapeJob(url);
  } catch {
    scraped = {};
  }

  const hostname = new URL(url).hostname.replace(/^www\./, '');

  const application = await createApplication(req.user.id, {
    job_title: scraped.job_title || 'Untitled Position',
    company_name: scraped.company_name || hostname,
    location: scraped.location || null,
    remote_type: scraped.remote_type || null,
    salary_range: scraped.salary_range || null,
    job_description: scraped.job_description || null,
    job_url: scraped.job_url || url,
    date_posted: scraped.date_posted || null,
    stage: 'applied',
    date_applied: new Date().toISOString().slice(0, 10),
  });

  res.status(201).json(application);
}

export async function addApplication(req, res) {
  const { job_title, company_name } = req.body;

  if (!job_title?.trim()) {
    return res.status(400).json({ error: 'job_title is required' });
  }
  if (!company_name?.trim()) {
    return res.status(400).json({ error: 'company_name is required' });
  }

  const application = await createApplication(req.user.id, req.body);
  res.status(201).json(application);
}
