
import React from 'react';
import { SendIcon, Download, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAction = async (actionName: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature",
        variant: "destructive",
      });
      return;
    }
    
    // Create a record of the action in the database
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: actionName === 'Deposit' ? 'income' : 'expense',
          amount: 0, // Placeholder amount that will be updated later
          description: `New ${actionName} action initiated`,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      toast({
        title: `${actionName} initiated`,
        description: `Your ${actionName.toLowerCase()} action has been started successfully.`,
      });
    } catch (error) {
      console.error(`Error initiating ${actionName}:`, error);
      toast({
        title: `${actionName} failed`,
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const actions = [
    { 
      name: 'Deposit', 
      icon: <Download className="h-5 w-5" />, 
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => handleAction('Deposit') 
    },
    { 
      name: 'Send', 
      icon: <SendIcon className="h-5 w-5" />, 
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => handleAction('Send') 
    },
    { 
      name: 'Receive', 
      icon: <Upload className="h-5 w-5" />, 
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => handleAction('Receive') 
    },
    { 
      name: 'Receipt', 
      icon: <FileText className="h-5 w-5" />, 
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => handleAction('Receipt') 
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => (
            <Button
              key={action.name}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center h-24 ${action.color} text-white`}
              variant="ghost"
            >
              <div className="bg-white/20 rounded-full p-2 mb-2">
                {action.icon}
              </div>
              <span className="text-sm">{action.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
