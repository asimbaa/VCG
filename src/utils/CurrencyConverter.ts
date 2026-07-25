import { useState, useEffect } from 'react';

// Hardcoded real-time interbank rates fallback
export const EXCHANGE_RATES: Record<string, number> = {
  AUD: 1,
  USD: 0.65,
  EUR: 0.60,
  GBP: 0.51,
  CAD: 0.88,
  NZD: 1.08,
  SGD: 0.88,
  JPY: 98.5,
  CHF: 0.58,
};

export const SYMBOLS: Record<string, string> = {
  AUD: '$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  NZD: '$',
  SGD: '$',
  JPY: '¥',
  CHF: 'CHf',
};

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const baseAmount = amount / (EXCHANGE_RATES[from] || 1);
  return baseAmount * (EXCHANGE_RATES[to] || 1);
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function useCurrency() {
  const [currency, setCurrency] = useState('AUD');

  const toggleCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const getConvertedPrice = (amountInAud: number) => {
    return convertCurrency(amountInAud, 'AUD', currency);
  };

  const formatConverted = (amountInAud: number) => {
    const converted = getConvertedPrice(amountInAud);
    return formatCurrency(converted, currency);
  };

  return { currency, toggleCurrency, getConvertedPrice, formatConverted, supportedCurrencies: Object.keys(EXCHANGE_RATES) };
}
