import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // PKCE stores a code_verifier locally so recovery/magic links carry a
  // one-time code instead of a bearer token — a link-scanning email client
  // (e.g. Gmail) prefetching the URL can't consume it before the real user clicks.
  auth: { flowType: 'pkce' },
});
