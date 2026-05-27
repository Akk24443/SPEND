import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  RefreshCw, 
  Plane, 
  Settings, 
  LogOut,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { useCurrency } from '../contexts/CurrencyContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddExpense: () => void;
}

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

import { Logo } from './Logo';

export default function Layout({ children, activeTab, setActiveTab, onAddExpense }: LayoutProps) {
  const { logout, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    // Set status bar style on load
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setStyle({ style: Style.Light });
      } catch (e) {
        // Not on native device, ignore
      }
    }
  }, []);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Not on native device, ignore
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: History },
    { id: 'converter', label: 'Converter', icon: RefreshCw },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden dark:bg-slate-950/50 relative">
      <div className="absolute inset-0 bg-gradient-soft pointer-events-none opacity-80 dark:opacity-30" />
      {/* Floating Glowing Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-500/5 animate-float-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[150px] dark:bg-purple-500/5 animate-float-2 pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-cyan-400/10 blur-[110px] dark:bg-cyan-400/5 animate-float-1 pointer-events-none" />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 dark:bg-slate-900/70 dark:border-slate-800/50 z-10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Spend</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Multi-currency Tracker</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all glow-border-hover ${
                activeTab === item.id 
                  ? 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-900/30' 
                  : 'text-slate-600 hover:bg-white/40 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
              }`}
            >
              <item.icon size={18} className={`${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate dark:text-slate-200">{profile?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-950/20"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>


      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden shadow-2xl dark:bg-slate-900"
            >
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Logo size={36} />
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Spend</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <nav className="px-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      activeTab === item.id 
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 dark:border-slate-800">
                <Button variant="destructive" className="w-full" onClick={logout}>
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 z-40 pb-[safe-area-inset-bottom] h-[calc(64px+safe-area-inset-bottom)]">
        {menuItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 flex-1 transition-colors ${
              activeTab === item.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center p-2 flex-1 text-slate-500 dark:text-slate-400"
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-[calc(64px+safe-area-inset-bottom)] md:pb-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white/70 backdrop-blur-md border-b border-slate-200/50 dark:bg-slate-900/70 dark:border-slate-800/50 shrink-0 pt-[safe-area-inset-top] h-[calc(64px+safe-area-inset-top)]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold dark:text-slate-200 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
             <Button size="sm" onClick={onAddExpense} className="bg-indigo-600 hover:bg-indigo-700">
                <PlusCircle size={16} className="mr-2" />
                New Expense
             </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
