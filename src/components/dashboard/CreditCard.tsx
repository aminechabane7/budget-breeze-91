
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard as CreditCardIcon } from 'lucide-react';

interface CreditCardProps {
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cardType?: 'mastercard' | 'visa';
}

const CreditCard: React.FC<CreditCardProps> = ({
  cardNumber = '4562 1122 4595 7852',
  cardHolder = 'John Doe',
  expiryDate = '12/25',
  cardType = 'mastercard',
}) => {
  // Mask all but last 4 digits
  const maskedNumber = cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  
  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white overflow-hidden rounded-xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div className="bg-white/10 p-2 rounded">
            <CreditCardIcon className="h-6 w-6 text-gray-100" />
          </div>
          {cardType === 'mastercard' ? (
            <div className="flex">
              <div className="h-8 w-8 bg-red-500 rounded-full opacity-80 -mr-4"></div>
              <div className="h-8 w-8 bg-yellow-500 rounded-full opacity-80"></div>
            </div>
          ) : (
            <div className="text-white font-bold text-xl">VISA</div>
          )}
        </div>
        
        <div className="text-2xl font-medium tracking-widest mb-6">
          {maskedNumber}
        </div>
        
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-300 mb-1">CARD HOLDER</p>
            <p className="font-medium">{cardHolder}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-300 mb-1">EXPIRES</p>
            <p className="font-medium">{expiryDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditCard;
