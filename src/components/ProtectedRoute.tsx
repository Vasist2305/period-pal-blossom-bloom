
import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, initialized, devModeBypass } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Only show toast if we're fully initialized and have no user
    if (initialized && !user && !devModeBypass) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
    }
  }, [user, toast, initialized, devModeBypass]);

  // In development, when auth isn't initialized yet, allow access
  if (devModeBypass) {
    return <>{children}</>;
  }

  // Still loading auth state
  if (!initialized) {
    return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;
  }

  // Normal protection behavior
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
