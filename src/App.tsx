
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
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CycleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
