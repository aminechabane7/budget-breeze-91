
import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CurrencySelector, { Currency } from './CurrencySelector';
import AnimatedNumber from '../shared/AnimatedNumber';

interface AccountBalanceProps {
  balance: number;
  income: number;
  expenses: number;
  isLoading?: boolean;
}

const AccountBalance: React.FC<AccountBalanceProps> = ({
  balance,
  income,
  expenses,
  isLoading = false,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({ 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar',
    exchangeRate: 1 
  });

  const formatCurrency = (value: number): string => {
    const convertedValue = value * selectedCurrency.exchangeRate;
    return `${selectedCurrency.symbol}${convertedValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <h3 className="font-semibold text-base">Account Balance</h3>
          </div>
          <div className="w-32">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-blue-100">Available Balance</p>
          <h2 className="text-3xl font-bold mt-1">
            {isLoading ? (
              <div className="h-8 w-40 bg-blue-400/30 animate-pulse rounded"></div>
            ) : (
              formatCurrency(balance)
            )}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-green-300" />
              <p className="text-xs text-blue-100">Income</p>
            </div>
            <p className="text-lg font-semibold text-green-300">
              {isLoading ? (
                <div className="h-6 w-20 bg-blue-400/30 animate-pulse rounded"></div>
              ) : (
                formatCurrency(income)
              )}
            </p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-red-300" />
              <p className="text-xs text-blue-100">Expenses</p>
            </div>
            <p className="text-lg font-semibold text-red-300">
              {isLoading ? (
                <div className="h-6 w-20 bg-blue-400/30 animate-pulse rounded"></div>
              ) : (
                formatCurrency(expenses)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalance;
