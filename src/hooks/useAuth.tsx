
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      try {
        setIsLoading(true);
        // In our offline-first approach, we'll rely on localStorage
        const localUser = localStorage.getItem('local_user_id');
        if (localUser) {
          console.log('Using local user ID:', localUser);
        }
        // We don't actually set the user state here since we're working offline
        setUser(null);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setInitialized(true);
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // In offline mode, just create a local user ID
      const localUserId = 'local_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('local_user_id', localUserId);
      console.log('Created local user ID:', localUserId);
      
      return { user: { id: localUserId, email, user_metadata: { name } } };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // In offline mode, just create a local user ID if it doesn't exist
      let localUserId = localStorage.getItem('local_user_id');
      if (!localUserId) {
        localUserId = 'local_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('local_user_id', localUserId);
      }
      console.log('Using local user ID:', localUserId);
      
      return { user: { id: localUserId, email, user_metadata: { name: email.split('@')[0] } } };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // In offline mode, just clear the local user ID
      localStorage.removeItem('local_user_id');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return { 
    user, 
    signUp, 
    signIn, 
    signOut,
    initialized,
    isLoading,
    devModeBypass: false
  };
};
