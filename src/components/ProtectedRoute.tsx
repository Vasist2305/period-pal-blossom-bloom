
import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).isLoggedIn : false;
  };

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // If not authenticated, don't render children
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
