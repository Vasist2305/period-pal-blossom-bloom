
import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isAuthenticated = () => {
    // Check for currentUser in localStorage
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return false;
    
    try {
      // Parse the user and check login status
      const user = JSON.parse(currentUser);
      return user.isLoggedIn === true;
    } catch (error) {
      // If there's an error parsing the user, consider not authenticated
      console.error("Error parsing user data:", error);
      return false;
    }
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
