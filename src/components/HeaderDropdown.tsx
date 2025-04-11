
import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HeaderDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = React.useState<{ name: string; email: string; isLoggedIn: boolean } | null>(null);

  React.useEffect(() => {
    // Check for user in localStorage
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    if (user) {
      // Get all users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Update the current user's login status
      const updatedUsers = users.map((u: any) => 
        u.email === user.email ? { ...u, isLoggedIn: false } : u
      );
      
      // Save updated users array
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Update current user
      const updatedUser = { ...user, isLoggedIn: false };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    
    navigate("/login");
  };

  if (!user || !user.isLoggedIn) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Log in</Button>
        <Button size="sm" onClick={() => navigate("/register")}>Sign up</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm hidden md:inline">Welcome, {user.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderDropdown;
