import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SUPPORTED_CURRENCIES, DEFAULT_CATEGORIES, Currency } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { useTrips } from '../hooks/useTrips';
import { CalendarIcon, Upload, Loader2, X } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

import { Switch } from './ui/switch';
import { createCalendarEvent } from '../services/calendarService';

// Redefining symbol mapping here for ease
const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥', CAD: 'C$', AUD: 'A$', SGD: 'S$', CHF: 'Fr'
};

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExpenseEntry({ open, onOpenChange }: ExpenseFormProps) {
  const { profile, accessToken } = useAuth();
  const { convert, rates, format } = useCurrency();
  const { addExpense } = useExpenses();
  const { trips } = useTrips();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, url: string, type: string}[]>([]);

  const form = useForm({
    defaultValues: {
      title: '',
      amount: '',
      currency: profile?.baseCurrency || 'INR',
      date: new Date(),
      category: 'Miscellaneous',
      tripId: '',
      notes: '',
      syncToCalendar: false
    }
  });

  const watchAmount = form.watch('amount');
  const watchCurrency = form.watch('currency');

  const convertedValue = useMemo(() => {
    const amt = parseFloat(watchAmount);
    if (isNaN(amt)) return 0;
    return convert(amt, watchCurrency as Currency, profile?.baseCurrency || 'INR');
  }, [watchAmount, watchCurrency, convert, profile?.baseCurrency]);

  const onSubmit = async (values: any) => {
    if (!values.title || !values.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const exRate = rates[values.currency as Currency] || 1;
      const finalConvertedAmount = isFinite(convertedValue) ? convertedValue : parseFloat(values.amount);

      const expenseData: any = {
        title: values.title,
        amount: parseFloat(values.amount),
        currency: values.currency as Currency,
        convertedAmount: finalConvertedAmount,
        exchangeRate: isFinite(exRate) ? exRate : 1,
        date: values.date.toISOString(),
        category: values.category,
        notes: values.notes || null,
        attachments: attachments.length > 0 ? attachments : null
      };

      if (values.tripId) {
        expenseData.tripId = values.tripId;
      }

      await addExpense(expenseData);
      toast.success('Expense saved successfully');

      if (values.syncToCalendar) {
        if (!accessToken) {
          toast.error('Google Calendar is not connected. Re-auth via Settings to sync.');
        } else {
          try {
            await createCalendarEvent(accessToken, {
              summary: `Expense: ${values.title} (${CURRENCY_SYMBOLS[values.currency as Currency] || ''}${values.amount})`,
              description: `Category: ${values.category}\nAmount: ${values.amount} ${values.currency}\nConverted Amount: ${profile?.baseCurrency || 'INR'} ${finalConvertedAmount.toFixed(2)}\nNotes: ${values.notes || 'None'}`,
              startDate: values.date.toISOString(),
              allDay: true
            });
            toast.success('Synced to Google Calendar!');
          } catch (calErr: any) {
            console.error('Google Calendar Sync Failed:', calErr);
            toast.error(`Calendar sync failed: ${calErr.message}`);
          }
        }
      }

      form.reset();
      setAttachments([]);
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save expense. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simulate upload - in a real app, this would go to Firebase Storage
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          url: reader.result as string, // Using base64 for preview/storage in Firestore for demo purposes
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Flight to Mumbai" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map(curr => (
                          <SelectItem key={curr} value={curr}>
                            {curr} ({CURRENCY_SYMBOLS[curr]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {watchAmount && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-900/50">
                Converted: {format(convertedValue, profile?.baseCurrency || 'INR')}
                <span className="text-[10px] block opacity-70">Rate: 1 {watchCurrency} = {(1 / (rates[watchCurrency as Currency] || 1)).toFixed(4)} {profile?.baseCurrency}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger render={(props) => (
                        <FormControl {...props}>
                          <Button 
                            variant={"outline"} 
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? formatDate(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      )} />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEFAULT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tripId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {trips.map(trip => (
                        <SelectItem key={trip.id} value={trip.id}>{trip.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syncToCalendar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-850 p-4 shadow-xs">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Add to Google Calendar
                    </FormLabel>
                    <span className="text-xs text-slate-500 block">
                      Sync this expense as an all-day event
                    </span>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Receipts / Attachments</FormLabel>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, i) => (
                  <div key={i} className="relative group w-16 h-16 rounded border bg-slate-50 overflow-hidden">
                    {file.type.startsWith('image') ? (
                      <img src={file.url} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">PDF</div>
                    )}
                    <button 
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-colors">
                  <Upload size={16} className="text-slate-400" />
                  <span className="text-[8px] mt-1 text-slate-500">Upload</span>
                  <input type="file" multiple className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="mr-2 animate-spin" size={16} />}
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
