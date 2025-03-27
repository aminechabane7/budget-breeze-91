
import React, { useState, useEffect } from 'react';
import { SendIcon, Download, Upload, FileText, FileDown, PlusCircle, BankIcon, QrCode } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryType } from '@/components/shared/CategoryIcon';
import { ScrollArea } from "@/components/ui/scroll-area";

const QuickActions: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    name: string;
    type: 'income' | 'expense';
    color: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [beneficiary, setBeneficiary] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string, type: string}[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Fetch categories and transactions
  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, type')
          .order('name');
          
        if (error) {
          console.error('Error fetching categories:', error);
        } else if (data) {
          setCategories(data);
        }
      };

      const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) {
          console.error('Error fetching transactions:', error);
        } else if (data) {
          setTransactions(data);
        }
        setIsLoadingTransactions(false);
      };
      
      fetchCategories();
      fetchTransactions();

      // Set up realtime subscription
      const transactionSubscription = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setTransactions(prev => [payload.new, ...prev.slice(0, 19)]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(transactionSubscription);
      };
    }
  }, [user]);

  const openActionDialog = (action: {
    name: string;
    type: 'income' | 'expense';
    color: string;
  }) => {
    setCurrentAction(action);
    // Pre-fill description based on action name
    setDescription(`${action.name} transaction`);
    setAmount('');
    setCategory('');
    setBeneficiary('');
    setShowDialog(true);
  };

  const openReceiveDialog = () => {
    setShowReceiveDialog(true);
  };

  const openReceiptDialog = () => {
    setShowReceiptDialog(true);
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

    // For send action, validate beneficiary
    if (currentAction?.name === 'Send' && !beneficiary.trim()) {
      toast({
        title: "Beneficiary required",
        description: "Please enter the beneficiary who will receive the money",
        variant: "destructive",
      });
      return;
    }

    // For deposit and send, validate category
    if ((currentAction?.name === 'Deposit' || currentAction?.name === 'Send') && !category) {
      toast({
        title: "Category required",
        description: "Please select a category for this transaction",
        variant: "destructive",
      });
      return;
    }
    
    // Create a record of the action in the database
    try {
      // Add beneficiary to description if it's a send transaction
      const fullDescription = currentAction?.name === 'Send' 
        ? `${description} to ${beneficiary}`
        : description;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: currentAction?.type || 'expense',
          amount: parseFloat(amount),
          description: fullDescription,
          category_id: category || null,
          date: new Date().toISOString().split('T')[0],
        })
        .select();

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

  const generatePDF = (transaction: any) => {
    // Create receipt content for PDF
    const receiptContent = `
RECEIPT
------------------------------------------
Transaction ID: ${transaction.id}
Date: ${new Date(transaction.date).toLocaleDateString()}
Type: ${transaction.type.toUpperCase()}
Description: ${transaction.description}
Amount: $${parseFloat(transaction.amount).toFixed(2)}
------------------------------------------
Thank you for using our service!
    `;
    
    // In a real app, we would generate a PDF here
    // For now, we'll just create a text file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt downloaded",
      description: "Your receipt has been downloaded successfully.",
    });
  };

  const handleGeneratePaymentRequest = () => {
    toast({
      title: "Payment request generated",
      description: "Your payment request link has been generated and copied to clipboard.",
    });
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
      onClick: () => openReceiveDialog()
    },
    { 
      name: 'Receipt', 
      icon: <FileText className="h-5 w-5" />, 
      color: 'bg-amber-500 hover:bg-amber-600',
      type: 'expense' as const,
      onClick: () => openReceiptDialog()
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

      {/* Transaction Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentAction?.name}</DialogTitle>
            <DialogDescription>
              Enter the details for your {currentAction?.name.toLowerCase()} transaction.
            </DialogDescription>
          </DialogHeader>
          
          {currentAction?.name === 'Deposit' && (
            <Tabs defaultValue="manual">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="bank">Link Bank</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
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
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(cat => cat.type === 'income')
                            .map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
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
              </TabsContent>
              
              <TabsContent value="bank">
                <div className="py-6">
                  <div className="text-center space-y-4">
                    <BankIcon className="mx-auto h-12 w-12 text-primary" />
                    <h3 className="text-lg font-medium">Connect Your Bank</h3>
                    <p className="text-sm text-muted-foreground">
                      Securely link your bank account to enable quick deposits and transfers.
                    </p>
                    <Button className="w-full">
                      Connect Bank Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {currentAction?.name === 'Send' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="beneficiary" className="text-right">
                  Beneficiary
                </Label>
                <Input
                  id="beneficiary"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter recipient name"
                />
              </div>
              
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
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.type === 'expense')
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
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
          )}
          
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

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Received Payments</DialogTitle>
            <DialogDescription>
              View received payments or generate a new payment request.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Payment History</TabsTrigger>
              <TabsTrigger value="request">Request Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <ScrollArea className="h-[300px] w-full pr-4">
                {transactions.filter(t => t.type === 'income').length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {transactions
                      .filter(t => t.type === 'income')
                      .map((transaction) => (
                        <div 
                          key={transaction.id} 
                          className="flex justify-between items-center border p-3 rounded-md hover:bg-muted/30"
                        >
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-green-500 font-medium mr-2">
                              +${parseFloat(transaction.amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No received payments found.</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="request">
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requestAmount" className="text-right">
                    Amount
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                    <Input
                      id="requestAmount"
                      type="number"
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requestDescription" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="requestDescription"
                    className="col-span-3"
                    placeholder="What is this payment for?"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requestEmail" className="text-right">
                    Recipient Email
                  </Label>
                  <Input
                    id="requestEmail"
                    type="email"
                    className="col-span-3"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={handleGeneratePaymentRequest}
                  >
                    <QrCode className="h-4 w-4" />
                    Generate Payment Request
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Receipts</DialogTitle>
            <DialogDescription>
              Select a transaction to download its receipt as a PDF.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[300px] w-full pr-4">
              {transactions.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center border p-3 rounded-md hover:bg-muted/30 cursor-pointer"
                      onClick={() => generatePDF(transaction)}
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} font-medium mr-2`}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </span>
                        <FileDown className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No transactions found. Create some transactions first.</p>
                </div>
              )}
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
