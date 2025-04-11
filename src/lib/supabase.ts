
import { createClient } from '@supabase/supabase-js';

// Get these from Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndmgtptpgfhmutiwkurt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbWd0cHRwZ2ZobXV0aXdrdXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzk1NjYsImV4cCI6MjA1OTk1NTU2Nn0.cmU_iRe9fucSR1vmGGub0md3uGt3C6BjN26HoqybwGU';

// Check if we have the required values
if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ Supabase Anon Key not set! Please set VITE_SUPABASE_ANON_KEY environment variable.');
}

// Use mock client when in development and missing real credentials
const isMissingCredentials = 
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
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        order: (column: string, options: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
      }),
    })
  };
}
