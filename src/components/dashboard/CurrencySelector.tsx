
import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate relative to USD
};

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', exchangeRate: 1500 },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.78 },
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
];

interface CurrencySelectorProps {
  onCurrencyChange: (currency: Currency) => void;
  selectedCurrency: Currency;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onCurrencyChange,
  selectedCurrency,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg font-semibold">{selectedCurrency.symbol}</span>
            <span>{selectedCurrency.code}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            className="cursor-pointer"
            onClick={() => onCurrencyChange(currency)}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-lg font-semibold">{currency.symbol}</span>
                <span>{currency.code}</span> - <span className="text-muted-foreground text-xs">{currency.name}</span>
              </span>
              {selectedCurrency.code === currency.code && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
