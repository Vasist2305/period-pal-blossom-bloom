
import { createClient } from '@supabase/supabase-js';

// Get these from Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if we have the required values
if (!supabaseUrl || supabaseUrl === 'https://your-project-url.supabase.co') {
  console.warn('⚠️ Supabase URL not set! Please set VITE_SUPABASE_URL environment variable.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ Supabase Anon Key not set! Please set VITE_SUPABASE_ANON_KEY environment variable.');
}

// Use mock client when in development and missing real credentials
const isMissingCredentials = 
  (!supabaseUrl || supabaseUrl === 'https://your-project-url.supabase.co') ||
  (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key');

// For development, use a mock client when credentials are missing
export const supabase = isMissingCredentials && import.meta.env.DEV
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey);

// Simple mock client for development without credentials
function createMockClient() {
  console.info('🛠️ Using mock Supabase client for development');
  
  // This creates a minimal mock implementation that won't throw errors
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Mock: Auth not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Mock: Auth not configured') }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        eq: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    })
  };
}
