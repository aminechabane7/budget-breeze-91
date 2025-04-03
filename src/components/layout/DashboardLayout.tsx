
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {!isMobile && <DashboardSidebar />}
      
      <div className={`${!isMobile ? 'md:pl-60' : 'w-full'}`}>
        <Navbar />
        
        <main className="flex-1 pt-16 md:pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              {isMobile && (
                <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Menu />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[85%]">
                    <DrawerHeader>
                      <DrawerTitle>Menu</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 overflow-y-auto">
                      <DashboardSidebar />
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
              
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
              </div>
            </div>
            
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
