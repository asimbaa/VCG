import React, { createContext, useContext, useState, ReactNode } from 'react';
import { convertCurrency, formatCurrency, SYMBOLS, EXCHANGE_RATES } from '../utils/CurrencyConverter';

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  getConvertedPrice: (amountInAud: number) => number;
  formatConverted: (amountInAud: number) => string;
  supportedCurrencies: string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('AUD');

  const getConvertedPrice = (amountInAud: number) => {
    return convertCurrency(amountInAud, 'AUD', currency);
  };

  const formatConverted = (amountInAud: number) => {
    return formatCurrency(getConvertedPrice(amountInAud), currency);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      getConvertedPrice,
      formatConverted,
      supportedCurrencies: Object.keys(EXCHANGE_RATES)
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useGlobalCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useGlobalCurrency must be used within a CurrencyProvider');
  }
  return context;
}
