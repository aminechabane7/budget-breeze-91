
import React from 'react';
import { CreditCard, Copy, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  isPrimary?: boolean;
}

interface CreditCardType {
  id: string;
  bankName: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  cardType: 'visa' | 'mastercard';
}

const LinkedAccounts: React.FC = () => {
  const { toast } = useToast();
  
  const bankAccounts: BankAccount[] = [
    { id: '1', bankName: 'Chase Bank', accountNumber: '•••• 4582', balance: 12480.55, isPrimary: true },
    { id: '2', bankName: 'Bank of America', accountNumber: '•••• 7723', balance: 4235.12 },
  ];
  
  const cards: CreditCardType[] = [
    { 
      id: '1', 
      bankName: 'Chase Bank', 
      cardNumber: '•••• •••• •••• 4582', 
      expiryDate: '12/25', 
      cardholderName: 'John Doe',
      cardType: 'visa'
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Account number has been copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Linked Accounts & Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bank Accounts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Bank Accounts</h3>
          {bankAccounts.map((account) => (
            <div 
              key={account.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{account.bankName}</p>
                    {account.isPrimary && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{account.accountNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 rounded-full"
                      onClick={() => copyToClipboard(account.accountNumber)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy account number</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${account.balance.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</p>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Credit/Debit Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Cards</h3>
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="p-4 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm opacity-80">
                    {card.bankName}
                  </p>
                  <p className="font-medium">
                    {card.cardholderName}
                  </p>
                </div>
                <div>
                  {card.cardType === 'visa' ? (
                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.5392 0.586182L13.5167 19.424H8.54233L4.58956 4.65101C4.40183 3.9644 4.23268 3.67393 3.71138 3.39827C2.79344 2.90356 1.27625 2.43745 0 2.15426L0.107652 0.586182H8.00245C9.06198 0.586182 9.99849 1.25135 10.2292 2.40641L12.2583 13.4457L17.6213 0.586182H21.5392ZM39.2666 13.3321C39.2881 7.92282 31.7453 7.67465 31.7883 5.38259C31.8098 4.67742 32.4851 3.92721 33.9162 3.74123C34.591 3.65466 36.4201 3.58665 38.5115 4.47102L39.2236 1.26991C38.0925 0.883041 36.6614 0.5 34.8967 0.5C31.1771 0.5 28.4944 2.52159 28.4514 5.42344C28.4084 7.57046 30.3731 8.74752 31.8528 9.45269C33.3755 10.1795 33.8753 10.6518 33.8538 11.2946C33.8323 12.274 32.6583 12.7045 31.5772 12.7254C29.5266 12.7671 28.3095 12.1452 27.3272 11.6713L26.5879 15.0066C27.5916 15.4789 29.4209 15.8875 31.3213 15.9083C35.2822 15.9083 37.9219 13.9232 37.9434 10.7986C37.965 9.35659 37.2132 8.22609 35.1842 7.19676C33.9591 6.51853 33.2622 6.08829 33.2837 5.41006C33.2837 4.82472 33.9162 4.19337 35.25 4.19337C36.3311 4.15253 37.0924 4.36694 37.6781 4.60255L38.3959 1.33791L39.2666 13.3321ZM51.3174 19.424H46.9544L50.0008 0.586182H54.3638L51.3174 19.424ZM59.9247 0.586182L55.2382 19.424H51.4034L56.0899 0.586182H59.9247Z" fill="white"/>
                    </svg>
                  ) : (
                    <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4865 29.8458H19.7125V2.15479H11.4865V29.8458Z" fill="#FF5F00"/>
                      <path d="M12.0865 16.0003C12.0865 10.9109 14.4994 6.37152 18.1994 3.15479C16.2666 1.67818 13.8809 0.843262 11.3726 0.843262C5.09238 0.843262 0 7.67717 0 16.0003C0 24.3234 5.09238 31.1573 11.3726 31.1573C13.8809 31.1573 16.2666 30.3224 18.1994 28.8458C14.4994 25.6291 12.0865 21.0897 12.0865 16.0003Z" fill="#EB001B"/>
                      <path d="M42.9126 16.0003C42.9126 24.3234 37.8202 31.1573 31.54 31.1573C29.0317 31.1573 26.646 30.3224 24.7131 28.8458C28.4195 25.6291 30.826 21.0897 30.826 16.0003C30.826 10.9109 28.4131 6.37152 24.7131 3.15479C26.646 1.67818 29.0317 0.843262 31.54 0.843262C37.8202 0.843262 42.9126 7.67717 42.9126 16.0003Z" fill="#F79E1B"/>
                      <path d="M41.8994 26.0749V25.5282H42.1397V25.3933H41.456V25.5282H41.6963V26.0749H41.8994ZM43.1397 26.0749V25.3933H42.8737L42.6399 25.827L42.4061 25.3933H42.1401V26.0749H42.3368V25.5736L42.5513 25.9815H42.7287L42.9432 25.5736V26.0749H43.1397Z" fill="#F79E1B"/>
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-mono text-lg mb-1">{card.cardNumber}</p>
                  <p className="text-xs opacity-80">Expires {card.expiryDate}</p>
                </div>
                <button className="text-white/80 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              {/* Card patterns for decoration */}
              <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-12 -bottom-6 h-20 w-20 rounded-full bg-white/5"></div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2">
            <CreditCard className="h-4 w-4 mr-2" />
            Add new card
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedAccounts;
