import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Shield, Zap, Loader2, Info } from 'lucide-react';
import { Logo } from './Logo';

export default function Login() {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-moving p-0 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full h-full sm:h-auto sm:min-h-[600px] grid grid-cols-1 md:grid-cols-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sm:rounded-3xl shadow-2xl overflow-hidden border-none sm:border border-white/20"
      >
        {/* Left Side: Branding & Features (Visible on md+) */}
        <div className="hidden md:flex p-12 flex-col justify-center items-center md:items-start text-center md:text-left space-y-8 bg-indigo-600/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center relative z-10"
          >
            <Logo size={80} className="drop-shadow-2xl" />
          </motion.div>
          
          <div className="space-y-4 relative z-10">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              Spend
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 dark:text-indigo-100 text-lg leading-relaxed font-normal"
            >
              The world's most intuitive multi-currency expense manager for modern travelers and digital nomads.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-6 w-full pt-4 relative z-10">
            {[
              { icon: Globe, label: "10+ Global Currencies", delay: 0.5 },
              { icon: Zap, label: "Real-time Exchange Rates", delay: 0.6 },
              { icon: Shield, label: "Encrypted Cloud Sync", delay: 0.7 }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: feature.delay }}
                className="flex items-center gap-3 text-slate-700 dark:text-indigo-50 font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <feature.icon size={18} className="text-indigo-600" />
                </div>
                {feature.label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center items-center space-y-10 bg-white dark:bg-slate-900">
          <div className="md:hidden flex flex-col items-center space-y-4 mb-4">
             <Logo size={64} />
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Spend</h1>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
              Sign in with your Google account to sync your data across devices.
            </p>
          </div>

          <div className="w-full space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              size="lg"
              className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm transition-all text-lg font-semibold flex items-center justify-center gap-3 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 relative overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                {isLoggingIn ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="animate-spin" size={20} />
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30"
              >
                <Info size={16} className="mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>

          <div className="pt-8 text-center space-y-4">
             <p className="text-xs text-slate-400 max-w-xs mx-auto text-balance">
              By continuing, you agree to Spend's <span className="underline hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span> and <span className="underline hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
