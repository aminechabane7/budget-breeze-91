
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-primary font-bold text-xl tracking-tight">
              Bolt
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Simple, intuitive financial management
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex flex-col space-y-2">
              <h4 className="font-medium text-sm">App</h4>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/transactions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Transactions
              </Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h4 className="font-medium text-sm">Resources</h4>
              <Link to="/budget" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Budget
              </Link>
              <Link to="/reports" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Reports
              </Link>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h4 className="font-medium text-sm">Legal</h4>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bolt Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
