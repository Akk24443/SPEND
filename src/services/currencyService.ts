import { Currency } from '../types';

const BASE_URL = 'https://open.er-api.com/v6/latest';

export interface ExchangeRates {
  [key: string]: number;
}

export async function fetchExchangeRates(baseCurrency: Currency): Promise<ExchangeRates> {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { rates, timestamp } = JSON.parse(cached);
    // Cache for 24 hours
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return rates;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${baseCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    
    const rates = data.rates;
    localStorage.setItem(cacheKey, JSON.stringify({
      rates,
      timestamp: Date.now()
    }));
    
    return rates;
  } catch (error) {
    console.error('Error fetching rates:', error);
    if (cached) {
      return JSON.parse(cached).rates;
    }
    throw error;
  }
}

export function convertCurrency(amount: number, fromRate: number, toRate: number): number {
  if (fromRate === 0) return 0;
  // Convert to original base then to target
  // But usually we fetch with 'baseCurrency' as the target BASE
  // So if we fetch for INR, INR is 1.0. If we have USD amount, rate for USD is e.g. 0.012
  // amount_in_inr = amount_in_usd / rate_of_usd_to_inr
  return amount / fromRate;
}
