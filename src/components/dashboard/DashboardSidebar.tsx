
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  CreditCard,
  ArrowDownUp,
  Receipt,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  UserCircle,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { href: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { href: '/transactions', icon: <ArrowDownUp className="h-5 w-5" />, label: 'Transactions' },
    { href: '/reports', icon: <BarChart3 className="h-5 w-5" />, label: 'Reports' },
    { href: '/notifications', icon: <Bell className="h-5 w-5" />, label: 'Notifications', notification: true },
    { href: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col border-r border-border h-screen fixed left-0 top-0 w-20 bg-background z-10">
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-center border-b border-border">
          <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold">
            F
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8">
          <ul className="space-y-6">
            {menuItems.map((item) => (
              <li key={item.href} className="px-4">
                <Link
                  to={item.href}
                  className={`flex flex-col items-center justify-center rounded-lg p-3 ${
                    location.pathname === item.href 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors'
                  }`}
                  aria-label={item.label}
                >
                  <div className="relative">
                    {item.icon}
                    {item.notification && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-border mt-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 rounded-full"
            onClick={() => signOut && signOut()}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src="/lovable-uploads/ff7b9736-dea6-4fed-9297-4f41ced94292.png" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
