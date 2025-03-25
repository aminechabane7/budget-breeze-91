import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4">
        
        
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bolt Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;