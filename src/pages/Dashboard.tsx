
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  LineChart, 
  Settings, 
  Home, 
  User, 
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.isLoggedIn) {
        setUser(userData);
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Update user login status in localStorage
    if (user) {
      const updatedUser = { ...user, isLoggedIn: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    
    navigate("/login");
  };

  if (!user) return null;

  const features = [
    {
      title: "Track Your Cycle",
      description: "Log your period days and symptoms",
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      path: "/calendar"
    },
    {
      title: "View Statistics",
      description: "Understand your cycle patterns",
      icon: <LineChart className="h-8 w-8 text-primary" />,
      path: "/stats"
    },
    {
      title: "Customize Settings",
      description: "Personalize your tracking experience",
      icon: <Settings className="h-8 w-8 text-primary" />,
      path: "/settings"
    },
    {
      title: "Home Dashboard",
      description: "Get a quick overview",
      icon: <Home className="h-8 w-8 text-primary" />,
      path: "/"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(feature.path)}>
              <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  navigate(feature.path);
                }}>
                  Go to {feature.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
