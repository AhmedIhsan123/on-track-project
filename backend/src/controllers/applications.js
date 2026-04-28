import { getApplications, createApplication } from '../db/applications.js';

export async function listApplications(req, res) {
  const applications = await getApplications(req.user.id);
  res.json(applications);
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
