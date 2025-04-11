import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // In development, provide a mock user experience
        if (import.meta.env.DEV) {
          console.info('🧪 Using mock user in development mode');
          // No user is set, keeping it as null
        }
      } finally {
        setInitialized(true);
      }
    };

    checkUser();

    // Listen to auth state changes
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.error('Auth subscription error:', error);
    }

    // Cleanup subscription
    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth:', error);
        }
      }
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      // In development mode with no Supabase, provide a mock successful response
      if (import.meta.env.DEV && error.message && error.message.includes('Mock: Auth not configured')) {
        console.info('🧪 Using mock signup in development mode');
        setUser({
          id: 'mock-user-id',
          email: email,
          user_metadata: { name }
        });
        return { user: { id: 'mock-user-id', email, user_metadata: { name } } };
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      // In development mode with no Supabase, provide a mock successful response
      if (import.meta.env.DEV && error.message && error.message.includes('Mock: Auth not configured')) {
        console.info('🧪 Using mock signin in development mode');
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_metadata: { name: email.split('@')[0] }
        };
        setUser(mockUser);
        return { user: mockUser };
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Always clear the user state even if there's an error
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // In development without Supabase, still allow sign out
      if (import.meta.env.DEV) {
        setUser(null);
        navigate('/login');
      } else {
        throw error;
      }
    }
  };

  // Development mode bypass for ProtectedRoute
  const devModeBypass = import.meta.env.DEV && !initialized;

  return { 
    user, 
    signUp, 
    signIn, 
    signOut,
    initialized,
    devModeBypass
  };
};
