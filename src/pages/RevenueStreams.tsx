import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BlurredCard from '@/components/shared/BlurredCard';
import RevenueGrowthChart from '@/components/revenue/RevenueGrowthChart';
import RevenueComparisonChart from '@/components/revenue/RevenueComparisonChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

interface RevenueStream {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  date: string;
  recurring: boolean;
  recurrence_period: string | null;
  created_at: string;
  updated_at: string;
}

const RevenueStreams = () => {
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sampleStreams = [
    {
      name: 'Consulting Services',
      description: 'Monthly consulting retainer',
      amount: 5000,
      recurring: true,
      recurrence_period: 'monthly'
    },
    {
      name: 'Software Licensing',
      description: 'Annual software license fees',
      amount: 12000,
      recurring: true,
      recurrence_period: 'annually'
    },
    {
      name: 'Online Courses',
      description: 'Revenue from online course sales',
      amount: 3000,
      recurring: false,
      recurrence_period: null
    },
    {
      name: 'Affiliate Marketing',
      description: 'Commissions from affiliate links',
      amount: 1500,
      recurring: true,
      recurrence_period: 'monthly'
    }
  ];

  const fetchRevenueStreams = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('revenue_streams')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      setRevenueStreams(data || []);
    } catch (error) {
      console.error('Error fetching revenue streams:', error);
      toast({
        title: "Failed to load revenue streams",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRevenueStreams();
  }, [user]);

  const handleAddStreams = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Map form data to database structure
      const streamsToAdd = sampleStreams.map(stream => ({
        name: stream.name,
        description: stream.description,
        amount: stream.amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        recurring: stream.recurring,
        recurrence_period: stream.recurrence_period,
        user_id: user.id
      }));
      
      // Insert each stream individually to avoid type issues
      for (const stream of streamsToAdd) {
        const { error } = await supabase
          .from('revenue_streams')
          .insert(stream);
          
        if (error) throw error;
      }
      
      toast({
        title: "Sample revenue streams added",
        description: "Your sample revenue streams have been added successfully.",
      });
      
      // Refresh data
      fetchRevenueStreams();
    } catch (error) {
      console.error('Error adding streams:', error);
      toast({
        title: "Failed to add revenue streams",
        description: "There was an error adding your revenue streams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Revenue Streams"
      description="Track and visualize your revenue sources"
    >
      <BlurredCard>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Sample Revenue Streams</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Quickly populate your revenue streams with sample data to see the charts in action.
          </p>
          <Button onClick={handleAddStreams} disabled={isSubmitting}>
            {isSubmitting ? 'Adding Streams...' : 'Add Sample Streams'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Revenue Growth</h3>
            <RevenueGrowthChart data={revenueStreams} />
          </div>
          <div className="h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Revenue Comparison</h3>
            <RevenueComparisonChart data={revenueStreams} />
          </div>
        </div>
      </BlurredCard>
    </DashboardLayout>
  );
};

export default RevenueStreams;
