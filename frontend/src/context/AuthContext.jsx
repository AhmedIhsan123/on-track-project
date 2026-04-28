import { createContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function syncUserWithBackend(session) {
  try {
    await fetch(`${API_URL}/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });
  } catch {
    // non-fatal — user is still authenticated
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession) {
        syncUserWithBackend(newSession);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signInWithOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const loading = session === undefined;

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithPassword, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
