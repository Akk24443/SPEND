import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

export default function Dashboard() {
  const { expenses } = useExpenses();
  const { profile } = useAuth();
  const { format } = useCurrency();

  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.convertedAmount, 0);
    
    const categoryData: { name: string; value: number }[] = [];
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(e => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.convertedAmount);
    });
    
    categoryMap.forEach((value, name) => {
      categoryData.push({ name, value });
    });

    // Recent 5 expenses
    const recent = expenses.slice(0, 5);

    return { total, categoryData, recent };
  }, [expenses]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item} whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}>
          <Card className="border border-white/20 dark:border-slate-800/50 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-md overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={48} className="text-indigo-600" />
             </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Spending</CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {format(stats.total, profile?.baseCurrency || 'INR')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <TrendingUp size={14} />
                <span>Computed in {profile?.baseCurrency}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Add more summary cards if needed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
          <Card className="border border-white/20 dark:border-slate-800/50 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
              <CardDescription>Breakdown of expenses across various categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => format(value, profile?.baseCurrency || 'INR')}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
          <Card className="border border-white/20 dark:border-slate-800/50 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Expense Density</CardTitle>
              <CardDescription>Distribution of expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                    formatter={(value: number) => format(value, profile?.baseCurrency || 'INR')}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="border border-white/20 dark:border-slate-800/50 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.length === 0 ? (
                <div className="text-center py-12 text-slate-500 italic">No expenses recorded yet.</div>
              ) : (
                stats.recent.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        {expense.category.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{expense.title}</p>
                        <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{format(expense.amount, expense.currency)}</p>
                      <p className="text-[10px] text-slate-500">≈ {format(expense.convertedAmount, profile?.baseCurrency || 'INR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
