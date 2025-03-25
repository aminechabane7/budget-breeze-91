
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  CreditCard,
  PieChart,
  ArrowDownUp,
  Receipt,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuLabel, 
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const menuItems = [
    {
      label: 'Overview',
      items: [
        { href: '/dashboard', icon: <Home />, label: 'Dashboard' },
        { href: '/business', icon: <BarChart3 />, label: 'Business' },
      ]
    },
    {
      label: 'Finances',
      items: [
        { href: '/transactions', icon: <ArrowDownUp />, label: 'Transactions' },
        { href: '/categories', icon: <PieChart />, label: 'Categories' },
        { href: '/budget', icon: <CreditCard />, label: 'Budget' },
        { href: '/reports', icon: <Receipt />, label: 'Reports' },
      ]
    },
  ];

  return (
    <aside className="hidden md:block border-r border-border h-screen fixed left-0 top-0 w-60 bg-background z-10">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold">
              F
            </div>
            <h1 className="text-xl font-bold">FinTrack</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h2 className="text-xs uppercase font-semibold text-muted-foreground mb-2 px-3">
                {group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        location.pathname === item.href 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
            <Avatar>
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => signOut && signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
