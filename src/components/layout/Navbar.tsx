
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Search, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthProvider';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Check if we're on the authentication pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Mock authentication state (to be replaced with actual auth)
  const isAuthenticated = location.pathname !== '/login' && location.pathname !== '/register';
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Don't render navbar on auth pages
  if (isAuthPage) return null;
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-morphism py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200 focus:border-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Calendar className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src="/lovable-uploads/ff7b9736-dea6-4fed-9297-4f41ced94292.png" alt="User" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut && signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isAuthenticated && (
        <div className="md:hidden glass-morphism animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} 
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/transactions" 
                className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === '/transactions' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} 
                onClick={() => setIsMenuOpen(false)}
              >
                Transactions
              </Link>
              <Link 
                to="/categories" 
                className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === '/categories' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} 
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/budget" 
                className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === '/budget' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} 
                onClick={() => setIsMenuOpen(false)}
              >
                Budget
              </Link>
              <Link 
                to="/reports" 
                className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === '/reports' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} 
                onClick={() => setIsMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/login" 
                className="font-medium text-sm py-2 text-destructive" 
                onClick={() => setIsMenuOpen(false)}
              >
                Log out
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
