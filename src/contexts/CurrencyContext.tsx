import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchExchangeRates, ExchangeRates } from '../services/currencyService';
import { Currency } from '../types';

interface CurrencyContextType {
  rates: ExchangeRates;
  loading: boolean;
  convert: (amount: number, from: Currency, to: Currency) => number;
  format: (amount: number, currency: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = profile?.baseCurrency || 'INR';
    setLoading(true);
    fetchExchangeRates(base)
      .then(setRates)
      .finally(() => setLoading(false));
  }, [profile?.baseCurrency]);

  const convert = (amount: number, from: Currency, to: Currency) => {
    if (!rates[from] || !rates[to]) return amount;
    // to / from * amount? 
    // If base is INR, rates[USD] = 0.012. 
    // USD amount = 100. 
    // INR amount = 100 / 0.012 = 8333.
    // Wait, if base is INR, 1 INR = rates[USD] USD.
    // So 1 USD = 1/rates[USD] INR.
    // amount in base = amount / rates[from]
    // amount in target = amount_in_base * rates[to]
    const inBase = amount / rates[from];
    return inBase * rates[to];
  };

  const format = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ rates, loading, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
