import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Check if we have a local user ID
  const hasLocalUserId = localStorage.getItem('local_user_id') !== null;
  
  // If auth is still loading, show nothing yet
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If user is authenticated or we have a local user ID, allow access
  if (user || hasLocalUserId) {
    return <>{children}</>;
  }
  
  // Otherwise, generate a local user ID and allow access
  localStorage.setItem('local_user_id', 'local_' + Math.random().toString(36).substr(2, 9));
  return <>{children}</>;
};

export default ProtectedRoute;
