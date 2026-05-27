export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'CAD' | 'AUD' | 'SGD' | 'CHF';

export const SUPPORTED_CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF'];

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  baseCurrency: Currency;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Expense {
  id: string;
  userId: string;
  tripId?: string;
  title: string;
  amount: number;
  currency: Currency;
  convertedAmount: number;
  exchangeRate: number;
  date: string;
  category: string;
  notes?: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string; // If undefined, it's a default category
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export const DEFAULT_CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Fuel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Miscellaneous'
];
