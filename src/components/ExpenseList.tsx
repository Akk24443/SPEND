import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Re-import symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥', CAD: 'C$', AUD: 'A$', SGD: 'S$', CHF: 'Fr'
};

export default function ExpenseList() {
  const { expenses, removeExpense } = useExpenses();
  const { format, rates } = useCurrency();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const exportToExcel = () => {
    const data = filteredExpenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Title: e.title,
      Category: e.category,
      Currency: e.currency,
      'Original Amount': e.amount,
      [`Amount in ${profile?.baseCurrency}`]: e.convertedAmount,
      'Exchange Rate': e.exchangeRate,
      Notes: e.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.text("Expense Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`User: ${profile?.email}`, 14, 35);
    doc.text(`Total: ${format(filteredExpenses.reduce((a, b) => a + b.convertedAmount, 0), profile?.baseCurrency || 'INR')}`, 14, 40);

    const tableData = filteredExpenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.title,
      e.category,
      `${CURRENCY_SYMBOLS[e.currency] || ''}${e.amount} (${e.currency})`,
      format(e.convertedAmount, profile?.baseCurrency || 'INR')
    ]);

    autoTable(doc, {
      head: [['Date', 'Title', 'Category', 'Original', `In ${profile?.baseCurrency}`]],
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: '#6366f1' }
    });

    // Add receipts logic if needed (merged PDFs)
    // For now, simple list
    doc.save(`Expenses_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <CardTitle className="text-xl font-bold">Expense History</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 bg-slate-50 border-none dark:bg-slate-800"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={(props) => (
              <Button variant="outline" size="sm" {...props}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
            )} />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet size={16} className="mr-2 text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText size={16} className="mr-2 text-red-500" />
                PDF Report (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Original Amount</TableHead>
                <TableHead className="text-right">Converted ({profile?.baseCurrency})</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No results found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{expense.title}</div>
                      {expense.notes && <div className="text-xs text-slate-500 truncate max-w-[200px]">{expense.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none font-normal">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {CURRENCY_SYMBOLS[expense.currency] || ''}{expense.amount} <span className="text-[10px] text-slate-400 font-sans">{expense.currency}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {format(expense.convertedAmount, profile?.baseCurrency || 'INR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                          <Trash2 size={16} onClick={() => {
                            if (window.confirm('Delete this expense?')) removeExpense(expense.id);
                          }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
