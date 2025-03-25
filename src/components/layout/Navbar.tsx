import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
    title: 'Budget',
    path: '/budget'
  }, {
    title: 'Reports',
    path: '/reports'
  }];

  // Don't render navbar on auth pages
  if (isAuthPage) return null;
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-morphism py-2' : 'bg-transparent py-4'}`}>
      

      {/* Mobile Menu */}
      {isMenuOpen && isAuthenticated && <div className="md:hidden glass-morphism animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => <Link key={link.path} to={link.path} className={`font-medium text-sm py-2 transition-colors duration-200 ${location.pathname === link.path ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`} onClick={() => setIsMenuOpen(false)}>
                  {link.title}
                </Link>)}
              <Link to="/login" className="font-medium text-sm py-2 text-destructive" onClick={() => setIsMenuOpen(false)}>
                Log out
              </Link>
            </nav>
          </div>
        </div>}
    </header>;
};
export default Navbar;