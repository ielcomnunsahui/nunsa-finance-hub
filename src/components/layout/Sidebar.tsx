import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  Shield,
  Users,
  Package,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import nunsaLogo from '@/assets/nunsa-logo.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { role, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/income', icon: TrendingUp, label: 'Income' },
    { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/monthly-reports', icon: Calendar, label: 'Monthly Reports' },
    ...(role === 'super_admin' || role === 'admin'
      ? [
          { to: '/audit-log', icon: Shield, label: 'Audit Log' },
          { to: '/settings', icon: Settings, label: 'Settings' },
        ]
      : []),
    ...(role === 'super_admin'
      ? [{ to: '/users', icon: Users, label: 'User Management' }]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={nunsaLogo} 
                  alt="NUNSA Logo" 
                  className="h-12 w-12 rounded-full bg-white p-0.5"
                />
                <div>
                  <h1 className="font-display font-bold text-lg text-sidebar-foreground">
                    NUNSA HUI
                  </h1>
                  <p className="text-xs text-sidebar-foreground/60">Café Finance</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={onToggle}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onToggle()}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'text-sidebar-foreground/80'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-xs text-sidebar-foreground/60 mb-1">Al-Hikmah University</p>
              <p className="text-sm font-medium text-sidebar-foreground">NUNSA Chapter</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
