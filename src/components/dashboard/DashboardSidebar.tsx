
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || ''
  });

  // Simulated notifications
  const notifications = [
    { id: 1, title: 'New transaction', message: 'You received $250 from ABC Company', isRead: false },
    { id: 2, title: 'Account updated', message: 'Your account details were updated successfully', isRead: true },
    { id: 3, title: 'Budget alert', message: 'You\'ve reached 80% of your monthly budget', isRead: false }
  ];
  
  const handleSettingsSave = async () => {
    if (!user) return;
    
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName
        }
      });
      
      if (updateError) throw updateError;

      // Also update the profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName
        })
        .eq('id', user.id);
      
      // Close dialog
      setIsSettingsOpen(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationRead = async (id: number) => {
    try {
      // Mark notification as read in state (in a real app, this would update the database)
      // This is just a simulated function since we don't have notifications table
      
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending a help request
    toast({
      title: "Help request sent",
      description: "Our support team will get back to you soon.",
    });
    setIsHelpOpen(false);
  };
  
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

  // Load profile data when the component mounts
  React.useEffect(() => {
    if (user) {
      const loadProfileData = async () => {
        try {
          // Try to get data from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setProfileData({
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              email: user.email || ''
            });
          } else if (user.user_metadata) {
            // Fallback to user metadata
            setProfileData({
              firstName: user.user_metadata.firstName || '',
              lastName: user.user_metadata.lastName || '',
              email: user.email || ''
            });
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
        }
      };
      
      loadProfileData();
    }
  }, [user]);

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
            <Button variant="ghost" size="icon" onClick={() => setIsNotificationsOpen(true)}>
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
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
                {profileData.firstName 
                  ? `${profileData.firstName} ${profileData.lastName}` 
                  : user?.email || 'User'}
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

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your profile information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first-name" className="text-right">
                First Name
              </Label>
              <Input
                id="first-name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last-name" className="text-right">
                Last Name
              </Label>
              <Input
                id="last-name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={profileData.email}
                readOnly
                className="col-span-3 bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSettingsSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Your recent notifications and alerts.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-4">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${notification.isRead ? 'border-border' : 'border-primary bg-primary/5'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.isRead && (
                        <Badge variant="outline" className="text-xs bg-primary text-primary-foreground">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-7 text-xs" 
                        onClick={() => handleNotificationRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Have a question or need assistance? Let us know.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitHelp}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="help-topic">Topic</Label>
                <Input id="help-topic" placeholder="What do you need help with?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="help-message">Message</Label>
                <textarea 
                  id="help-message" 
                  rows={4} 
                  className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="help-email">Email for reply</Label>
                <Input 
                  id="help-email" 
                  type="email" 
                  defaultValue={user?.email || ''} 
                  placeholder="your@email.com" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default DashboardSidebar;
