import { supabase } from './supabase.js';

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
