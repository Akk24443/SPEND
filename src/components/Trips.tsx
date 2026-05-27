import React, { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { 
  Plane, 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Search,
  MoreVertical,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Switch } from './ui/switch';
import { createCalendarEvent } from '../services/calendarService';

export default function Trips() {
  const { trips, addTrip, removeTrip } = useTrips();
  const { expenses } = useExpenses();
  const { profile, accessToken } = useAuth();
  const { format } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [syncToCalendar, setSyncToCalendar] = useState(false);

  const handleAddTrip = async () => {
    if (!newTrip.name) {
      toast.error('Trip name is required');
      return;
    }
    try {
      await addTrip(newTrip);
      toast.success('Trip created successfully');

      if (syncToCalendar) {
        if (!accessToken) {
          toast.error('Google Calendar is not connected. Re-auth via Settings to sync.');
        } else if (!newTrip.startDate) {
          toast.info('Trip created, but calendars require a start date to sync.');
        } else {
          try {
            await createCalendarEvent(accessToken, {
              summary: `Trip: ${newTrip.name}`,
              description: newTrip.description || 'Planned journey tracked in Spend app.',
              startDate: new Date(newTrip.startDate).toISOString(),
              endDate: newTrip.endDate ? new Date(newTrip.endDate).toISOString() : undefined,
              allDay: true
            });
            toast.success('Synced trip to Google Calendar!');
          } catch (calErr: any) {
            console.error('Google Calendar sync failed:', calErr);
            toast.error(`Could not sync to Google Calendar: ${calErr.message}`);
          }
        }
      }

      setIsAddOpen(false);
      setNewTrip({ name: '', description: '', startDate: '', endDate: '' });
      setSyncToCalendar(false);
    } catch (error) {
      toast.error('Failed to create trip');
    }
  };

  const handleRemoveTrip = async (id: string) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await removeTrip(id);
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const getTripStats = (tripId: string) => {
    const tripExpenses = expenses.filter(e => e.tripId === tripId);
    const total = tripExpenses.reduce((acc, curr) => acc + curr.convertedAmount, 0);
    return { count: tripExpenses.length, total };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Journeys</h2>
        <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} className="mr-2" />
          Create Trip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500">
            <Plane size={48} className="mb-4 opacity-20" />
            <p className="font-medium">No trips planned yet.</p>
            <p className="text-xs">Group your expenses by trip to keep things organized.</p>
          </div>
        ) : (
          trips.map((trip) => {
            const stats = getTripStats(trip.id);
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="group border-none shadow-sm dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveTrip(trip.id)}>
                        <Trash2 size={14} />
                     </Button>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                        <MapPin size={16} />
                      </div>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-none px-2 py-0">
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Ongoing'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">{trip.name}</CardTitle>
                    {trip.description && <CardDescription className="line-clamp-2">{trip.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Expenses</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {format(stats.total, profile?.baseCurrency || 'INR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Entries</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan a New Journey</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Name</label>
              <Input 
                placeholder="e.g. Europe 2024" 
                value={newTrip.name} 
                onChange={(e) => setNewTrip({...newTrip, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input 
                placeholder="Describe your trip" 
                value={newTrip.description} 
                onChange={(e) => setNewTrip({...newTrip, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Start Date</label>
                <Input 
                  type="date" 
                  value={newTrip.startDate} 
                  onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">End Date</label>
                <Input 
                  type="date" 
                  value={newTrip.endDate} 
                  onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs mt-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 cursor-pointer">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Add to Google Calendar
                </label>
                <span className="text-xs text-slate-500 block">
                  Add this journey as a calendar event
                </span>
              </div>
              <Switch
                checked={syncToCalendar}
                onCheckedChange={setSyncToCalendar}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTrip} className="bg-indigo-600 hover:bg-indigo-700 font-medium">Create Journey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
