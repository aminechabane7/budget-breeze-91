
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BusinessList from '@/components/business/BusinessList';
import BusinessOverview from '@/components/business/BusinessOverview';
import AddBusinessDialog from '@/components/business/AddBusinessDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Business {
  id: string;
  name: string;
  category: string;
  revenue: number;
  expenses: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const Business = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch businesses data
  useEffect(() => {
    if (!user) return;
    
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        toast({
          title: "Failed to load businesses",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinesses();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('businesses-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'businesses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newBusiness = payload.new as Business;
            setBusinesses(prev => [newBusiness, ...prev]);
            
            toast({
              title: "Business added",
              description: "Your business has been added successfully.",
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedBusiness = payload.new as Business;
            setBusinesses(prev => 
              prev.map(business => business.id === updatedBusiness.id ? updatedBusiness : business)
            );
            
            if (selectedBusiness?.id === updatedBusiness.id) {
              setSelectedBusiness(updatedBusiness);
            }
            
            toast({
              title: "Business updated",
              description: "Your business has been updated successfully.",
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedBusinessId = payload.old.id;
            setBusinesses(prev => prev.filter(business => business.id !== deletedBusinessId));
            
            if (selectedBusiness?.id === deletedBusinessId) {
              setSelectedBusiness(null);
            }
            
            toast({
              title: "Business deleted",
              description: "Your business has been deleted successfully.",
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleAddBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('businesses')
        .insert({
          ...business,
          user_id: user.id
        });
        
      if (error) throw error;
      
      // Toast notification will come from the realtime subscription
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding business:', error);
      toast({
        title: "Failed to add business",
        description: "There was an error adding your business. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBusiness = async (business: Partial<Business> & { id: string }) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(business)
        .eq('id', business.id);
        
      if (error) throw error;
      
      // Toast notification will come from the realtime subscription
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Failed to update business",
        description: "There was an error updating your business. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Toast notification will come from the realtime subscription
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: "Failed to delete business",
        description: "There was an error deleting your business. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
  };

  return (
    <DashboardLayout
      title="Business Management"
      description="Manage your business financial information"
    >
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Business
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={isMobile ? "col-span-1" : "lg:col-span-7"}>
          <BusinessList 
            businesses={businesses} 
            isLoading={isLoading}
            onSelectBusiness={handleSelectBusiness}
            selectedBusinessId={selectedBusiness?.id}
          />
        </div>
        
        {(!isMobile || (isMobile && selectedBusiness)) && (
          <div className={isMobile ? "col-span-1 mt-6" : "lg:col-span-5"}>
            {selectedBusiness ? (
              <BusinessOverview 
                business={selectedBusiness}
                onEdit={() => setIsEditing(true)}
                onDelete={() => handleDeleteBusiness(selectedBusiness.id)}
              />
            ) : (
              <div className="border rounded-lg p-6 h-full flex items-center justify-center bg-card text-card-foreground">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No Business Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a business from the list to view details or add a new business.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Business
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddBusinessDialog 
        isOpen={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddBusiness}
      />
      
      {selectedBusiness && (
        <AddBusinessDialog 
          isOpen={isEditing} 
          onClose={() => setIsEditing(false)}
          onSubmit={(data) => handleUpdateBusiness({ ...data, id: selectedBusiness.id })}
          business={selectedBusiness}
          isEditing={true}
        />
      )}
    </DashboardLayout>
  );
};

export default Business;
