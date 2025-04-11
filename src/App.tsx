
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CycleProvider } from "@/contexts/CycleContext";
import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import StatsPage from "./pages/Stats";
import SettingsPage from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Check if user is logged in
  const isLoggedIn = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).isLoggedIn : false;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CycleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              <Route path="/stats" element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Redirect to login if not found */}
              <Route path="*" element={
                isLoggedIn() ? <NotFound /> : <Navigate to="/login" />
              } />
            </Routes>
          </BrowserRouter>
        </CycleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
