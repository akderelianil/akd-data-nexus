
import React, { useState } from 'react';
import { LayoutDashboard, UploadCloud, Settings, Database, Server, Sun, Moon, Menu, X, Monitor, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Ingest Data', icon: UploadCloud, path: '/ingest' },
    { name: 'Configuration', icon: Settings, path: '/config' },
    { name: 'System Docs', icon: BookOpen, path: '/docs' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 transform md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="p-6 h-16 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">Data Nexus</h1>
              <p className="text-[10px] text-muted-foreground">Bronze Layer ETL</p>
            </div>
          </div>
          <button 
            onClick={closeMobileMenu}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-2">
             <span className="text-xs font-medium text-muted-foreground">Theme</span>
             <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className={`w-11 h-6 rounded-full relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-input'}`}
               aria-label="Toggle theme"
             >
               <span className={`absolute top-0.5 left-0.5 bg-background w-5 h-5 rounded-full shadow-sm flex items-center justify-center transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                 {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
               </span>
             </button>
          </div>

          <div className="bg-accent/50 rounded-lg p-3 flex items-center gap-3 border border-border">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-xs font-semibold">MotherDuck</p>
              <p className="text-[10px] text-muted-foreground">Connected</p>
            </div>
            <Server className="w-3 h-3 text-muted-foreground ml-auto" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight">
              {navItems.find(n => n.path === location.pathname)?.name || 'AKD Data Nexus'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">Admin User</p>
              <p className="text-xs text-muted-foreground mt-1">Engineering Team</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent border border-border"></div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
