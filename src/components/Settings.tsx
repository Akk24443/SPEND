import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SUPPORTED_CURRENCIES, Currency } from '../types';
import { Bell, Shield, User, Globe, Moon, Sun } from 'lucide-react';
import { Switch } from './ui/switch';
import { listUpcomingEvents } from '../services/calendarService';

export default function Settings() {
  const { profile, updateProfile, accessToken, login, logout } = useAuth();
  const [calendarEvents, setCalendarEvents] = React.useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [eventsError, setEventsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (accessToken) {
      setEventsLoading(true);
      setEventsError(null);
      listUpcomingEvents(accessToken)
        .then((items) => {
          setCalendarEvents(items);
        })
        .catch((err) => {
          console.error(err);
          setEventsError(err.message || 'Could not verify active token scope or connection.');
        })
        .finally(() => {
          setEventsLoading(false);
        });
    } else {
      setCalendarEvents([]);
    }
  }, [accessToken]);

  const handleBaseCurrencyChange = (value: string) => {
    updateProfile({ baseCurrency: value as Currency });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Account Preferences</h3>
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
          <CardContent className="divide-y divide-slate-50 dark:divide-slate-800 p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-semibold">{profile?.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500">{profile?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit Profile</Button>
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-semibold">Base Currency</p>
                  <p className="text-xs text-slate-500">All expenses will be converted to this currency for reporting.</p>
                </div>
              </div>
              <Select value={profile?.baseCurrency} onValueChange={handleBaseCurrencyChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">App Settings</h3>
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
          <CardContent className="divide-y divide-slate-50 dark:divide-slate-800 p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Bell size={20} />
                </div>
                <p className="font-semibold">Push Notifications</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                  <Moon size={20} />
                </div>
                <p className="font-semibold">Dark Mode</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-semibold">Data Privacy</p>
                  <p className="text-xs text-slate-500">Manage how your data is synced and stored.</p>
                </div>
              </div>
              <Button variant="link" className="text-xs text-indigo-600 h-auto p-0">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Connected Services</h3>
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Google Calendar Integration</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    Seamlessly link your travels and expenses directly to your Google Calendar schedule.
                  </p>
                  
                  {accessToken ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span>Connected & Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Not Synchronized</span>
                    </div>
                  )}
                </div>
              </div>
              
              {accessToken ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout} 
                  className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20"
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={login}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Connect Calendar
                </Button>
              )}
            </div>

            {accessToken && (
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <span className="text-indigo-500 text-sm">📅</span>
                  Your Google Calendar Schedule
                </h4>
                
                {eventsLoading ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">Fetching upcoming events...</p>
                ) : eventsError ? (
                  <p className="text-xs text-red-500 py-2">Could not sync events list: {eventsError}</p>
                ) : calendarEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">No upcoming events scheduled on your primary calendar.</p>
                ) : (
                  <div className="space-y-2">
                    {calendarEvents.map((ev: any) => (
                      <div key={ev.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{ev.summary}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{ev.description || 'Spend calendar sync event'}</p>
                        </div>
                        <div className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 ml-4 pb-0.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {ev.start?.date ? new Date(ev.start.date).toLocaleDateString() : ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleDateString() : 'Active'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
        <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">Danger Zone</h4>
        <p className="text-xs text-red-600 dark:text-red-500 mb-4">Deleting your account will permanently remove all your expenses, trips, and receipts. This action cannot be undone.</p>
        <Button variant="destructive" size="sm">Delete Account & Data</Button>
      </div>
    </div>
  );
}
