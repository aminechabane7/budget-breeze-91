
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from '../dashboard/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <DashboardSidebar />
      
      <div className="md:pl-60">
        <Navbar />
        
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4">
            {(title || description) && (
              <div className="mb-8">
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
              </div>
            )}
            
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
