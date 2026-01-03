import React from 'react';
import { Bell, Search, User, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  finance_officer: 'Finance Officer',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, role, signOut } = useAuth();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 w-64">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium truncate max-w-[150px]">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {role ? roleLabels[role] : 'No Role'}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
