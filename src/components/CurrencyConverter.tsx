import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES, Currency } from '../types';
import { ArrowLeftRight, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥', CAD: 'C$', AUD: 'A$', SGD: 'S$', CHF: 'Fr'
};

export default function CurrencyConverter() {
  const { convert, rates, loading } = useCurrency();
  const [amount, setAmount] = useState<string>('1');
  const [from, setFrom] = useState<Currency>('USD');
  const [to, setTo] = useState<Currency>('INR');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    const amt = parseFloat(amount);
    if (!isNaN(amt)) {
      setResult(convert(amt, from, to));
    }
  }, [amount, from, to, convert]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-none shadow-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Global Currency Converter</CardTitle>
            <CardDescription>Real-time exchange rates powered by live markets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">From</label>
                <div className="flex gap-2">
                  <Select value={from} onValueChange={(v) => setFrom(v as Currency)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button variant="ghost" size="icon" onClick={handleSwap} className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <ArrowLeftRight className="text-indigo-600" size={20} />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">To</label>
                <div className="flex gap-2">
                  <Select value={to} onValueChange={(v) => setTo(v as Currency)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md font-bold text-lg flex items-center">
                    {result.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-sm text-slate-500 font-medium mb-1">Indicative Exchange Rate</span>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                1 {from} = {(result / (parseFloat(amount) || 1)).toFixed(4)} {to}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Symbol</p>
                  <p className="text-lg font-bold">{CURRENCY_SYMBOLS[to]}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Inverse</p>
                  <p className="text-sm font-bold">1 {to} = {(1 / (result / (parseFloat(amount) || 1))).toFixed(4)} {from}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
