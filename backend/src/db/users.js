import { supabase } from './supabase.js';

export async function upsertUser({ id, email, name, avatar_url, provider }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { id, email, name, avatar_url, provider },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
