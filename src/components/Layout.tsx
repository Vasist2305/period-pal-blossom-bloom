
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, LineChart, Settings, Home } from 'lucide-react';
import HeaderDropdown from './HeaderDropdown';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-6 bg-white border-b border-border">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-primary">
            Her Cycle Diary
          </h1>
          <HeaderDropdown />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4">
        {children}
      </main>
      
      <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-card py-2 px-4">
        <div className="max-w-md mx-auto">
          <ul className="flex justify-around items-center">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `flex flex-col items-center p-2 text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Home className="w-5 h-5 mb-1" />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/calendar"
                className={({ isActive }) => 
                  `flex flex-col items-center p-2 text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <CalendarDays className="w-5 h-5 mb-1" />
                <span>Calendar</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/stats"
                className={({ isActive }) => 
                  `flex flex-col items-center p-2 text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <LineChart className="w-5 h-5 mb-1" />
                <span>Stats</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => 
                  `flex flex-col items-center p-2 text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Settings className="w-5 h-5 mb-1" />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
