import { supabase } from './supabase.js';

export async function getApplications(userId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('date_applied', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getStats(userId) {
  const { data, error } = await supabase
    .from('applications')
    .select('stage, date_applied')
    .eq('user_id', userId);

  if (error) throw error;

  const total = data.length;
  const byStageCounts = {};
  const STAGES = ['applied', 'screen', 'interview', 'final', 'offer', 'rejected', 'withdrawn'];
  for (const s of STAGES) byStageCounts[s] = 0;
  for (const row of data) byStageCounts[row.stage] = (byStageCounts[row.stage] || 0) + 1;

  const responded = ['screen', 'interview', 'final', 'offer', 'rejected'];
  const interviewed = ['interview', 'final', 'offer'];
  const active = ['applied', 'screen', 'interview', 'final'];

  const response_rate = total ? Math.round((responded.reduce((s, k) => s + byStageCounts[k], 0) / total) * 100) : 0;
  const interview_rate = total ? Math.round((interviewed.reduce((s, k) => s + byStageCounts[k], 0) / total) * 100) : 0;
  const active_count = active.reduce((s, k) => s + byStageCounts[k], 0);

  return { total, response_rate, interview_rate, active_count, by_stage: byStageCounts };
}

export async function getApplicationById(userId, id) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateApplication(userId, id, fields) {
  const allowed = [
    'job_title', 'company_name', 'location', 'remote_type', 'salary_range',
    'job_description', 'job_url', 'stage', 'date_applied', 'date_posted', 'notes',
  ];

  const updates = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  );

  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createApplication(userId, fields) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      job_title: fields.job_title,
      company_name: fields.company_name,
      location: fields.location ?? null,
      remote_type: fields.remote_type ?? null,
      salary_range: fields.salary_range ?? null,
      job_description: fields.job_description ?? null,
      job_url: fields.job_url ?? null,
      stage: fields.stage ?? 'applied',
      date_applied: fields.date_applied ?? new Date().toISOString().slice(0, 10),
      date_posted: fields.date_posted ?? null,
      notes: fields.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
