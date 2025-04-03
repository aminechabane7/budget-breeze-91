import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, Settings, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthProvider';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user,
    signOut
  } = useAuth();

  // Check if we're on the authentication pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
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
  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
      navigate('/login');
    }
  };
  const navLinks = [{
    title: 'Dashboard',
    path: '/dashboard'
  }, {
    title: 'Transactions',
    path: '/transactions'
  }, {
    title: 'Categories',
    path: '/categories'
  }, {
    title: 'Revenue Streams',
    path: '/revenue-streams'
  }, {
    title: 'Budget',
    path: '/budget'
  }, {
    title: 'Reports',
    path: '/reports'
  }];

  // Don't render navbar on auth pages
  if (isAuthPage) return null;
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-morphism py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <div className="md:hidden glass-morphism animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => <Link key={link.path} to={link.path} className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === link.path ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} onClick={() => setIsMenuOpen(false)}>
                  {link.title}
                </Link>)}
              <button className="font-medium text-sm py-2 text-destructive text-left" onClick={handleSignOut}>
                Log out
              </button>
            </nav>
          </div>
        </div>}
    </header>;
};
export default Navbar;