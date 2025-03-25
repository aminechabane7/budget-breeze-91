
import React, { useState } from 'react';
import { SendIcon, Download, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    name: string;
    type: 'income' | 'expense';
    color: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const openActionDialog = (action: {
    name: string;
    type: 'income' | 'expense';
    color: string;
  }) => {
    setCurrentAction(action);
    // Pre-fill description based on action name
    setDescription(`${action.name} transaction`);
    setAmount('');
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature",
        variant: "destructive",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for this transaction",
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
          type: currentAction?.type || 'expense',
          amount: parseFloat(amount),
          description: description,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      setShowDialog(false);
      toast({
        title: `${currentAction?.name} successful`,
        description: `Your ${currentAction?.name.toLowerCase()} of $${parseFloat(amount).toFixed(2)} has been processed.`,
      });
    } catch (error) {
      console.error(`Error processing ${currentAction?.name}:`, error);
      toast({
        title: `${currentAction?.name} failed`,
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
      type: 'income' as const,
      onClick: () => openActionDialog({ 
        name: 'Deposit', 
        type: 'income', 
        color: 'bg-green-500' 
      })
    },
    { 
      name: 'Send', 
      icon: <SendIcon className="h-5 w-5" />, 
      color: 'bg-blue-500 hover:bg-blue-600',
      type: 'expense' as const,
      onClick: () => openActionDialog({ 
        name: 'Send', 
        type: 'expense', 
        color: 'bg-blue-500' 
      })
    },
    { 
      name: 'Receive', 
      icon: <Upload className="h-5 w-5" />, 
      color: 'bg-purple-500 hover:bg-purple-600',
      type: 'income' as const,
      onClick: () => openActionDialog({ 
        name: 'Receive', 
        type: 'income', 
        color: 'bg-purple-500' 
      })
    },
    { 
      name: 'Receipt', 
      icon: <FileText className="h-5 w-5" />, 
      color: 'bg-amber-500 hover:bg-amber-600',
      type: 'expense' as const,
      onClick: () => openActionDialog({ 
        name: 'Receipt', 
        type: 'expense', 
        color: 'bg-amber-500' 
      })
    }
  ];

  return (
    <>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentAction?.name}</DialogTitle>
            <DialogDescription>
              Enter the details for your {currentAction?.name.toLowerCase()} transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter a description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
