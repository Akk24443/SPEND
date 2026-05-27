/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import CurrencyConverter from './components/CurrencyConverter';
import Trips from './components/Trips';
import Settings from './components/Settings';
import Login from './components/Login';
import ExpenseEntry from './components/ExpenseEntry';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEntryOpen, setIsEntryOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Spend...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <ExpenseList />;
      case 'converter': return <CurrencyConverter />;
      case 'trips': return <Trips />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAddExpense={() => setIsEntryOpen(true)}>
      <div className="max-w-7xl mx-auto pb-10">
        {renderContent()}
      </div>
      <ExpenseEntry open={isEntryOpen} onOpenChange={setIsEntryOpen} />
      
      {/* Global Add FAB (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => setIsEntryOpen(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      {/* Desktop Header Add Button Hook */}
      {/* We need to pass the open state or handle it via context, 
          but for now I'll just put a hidden button in the layout that triggers it 
          OR I can just add a button in each page. 
          Actually, I'll update Layout to take onAddExpense prop.
      */}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
        <Toaster position="top-right" />
      </CurrencyProvider>
    </AuthProvider>
  );
}
