import { getApplications, getStats, getApplicationById, updateApplication, createApplication, deleteApplicationById } from '../db/applications.js';

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
