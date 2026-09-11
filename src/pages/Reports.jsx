import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateMandalStatementPDF } from '../utils/pdfGenerator';
import { exportVarganiToCSV, exportExpensesToCSV } from '../utils/csvExport';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  IndianRupee, 
  Receipt, 
  Wallet, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Printer 
} from 'lucide-react';

export function Reports() {
  const { vargani, expenses, stats, config } = useMandalData();

  const handleDownloadPDF = () => {
    generateMandalStatementPDF({
      mandalInfo: config,
      varganiList: vargani,
      expenseList: expenses,
      stats
    });
  };

  // Payment Mode Breakdown
  const modeStats = vargani.reduce((acc, curr) => {
    const mode = curr.mode || 'Cash';
    acc[mode] = (acc[mode] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});

  // Expense Category Breakdown
  const expenseCategoryStats = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Miscellaneous';
    acc[cat] = (acc[cat] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" /> Financial Reports & Audits (हिशोब व अहवाल)
          </h2>
          <p className="text-xs text-slate-400">
            Export official PDF balance sheets and spreadsheet-ready CSV files
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="btn-saffron py-2.5 px-4 text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25"
          >
            <FileText className="w-4 h-4" /> Download Official Statement PDF
          </button>
        </div>
      </div>

      {/* Overview Balance Summary Card */}
      <div className="glass-card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-white/10">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Executive Financial Summary ({config?.year || 2026})
            </h3>
            <p className="text-xs text-slate-400">{config?.name}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Balanced Books
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">Total Vargani Collected</span>
            <span className="text-2xl font-black text-emerald-400 block">{formatCurrency(stats.totalReceived)}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">From {stats.donorCount} Devotees</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <span className="text-xs font-semibold text-rose-400 block mb-1">Total Expenses Incurred</span>
            <span className="text-2xl font-black text-rose-400 block">{formatCurrency(stats.totalExpenses)}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Across {stats.expenseCount} Bills</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <span className="text-xs font-semibold text-amber-400 block mb-1">Net Closing Balance</span>
            <span className="text-2xl font-black text-amber-400 block">{formatCurrency(stats.netBalance)}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Surplus Funds Available</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet & CSV Export Center */}
      <div className="glass-card p-5 bg-slate-900/80 border-white/10">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" /> Export Data for Google Sheets / Microsoft Excel
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Download sanitized CSV spreadsheets with full UTF-8 formatting for easy accounting and WhatsApp sharing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => exportVarganiToCSV(vargani, config?.name)}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Vargani Donors Spreadsheet (.CSV)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Donor names, amounts, receipt numbers, phone & payment modes ({vargani.length} entries)
              </p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
          </button>

          <button
            onClick={() => exportExpensesToCSV(expenses, config?.name)}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-rose-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  Expenses & Vendor Bills (.CSV)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Item descriptions, vendor names, dates & categorized payouts ({expenses.length} bills)
              </p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment Mode Share */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" /> Payment Mode Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(modeStats).map(([mode, amt]) => {
              const pct = stats.totalReceived > 0 ? Math.round((amt / stats.totalReceived) * 100) : 0;
              return (
                <div key={mode}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">{mode}</span>
                    <span className="font-bold text-white">{formatCurrency(amt)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-400" /> Expense Category Payouts
          </h3>
          <div className="space-y-3">
            {Object.entries(expenseCategoryStats).map(([cat, amt]) => {
              const pct = stats.totalExpenses > 0 ? Math.round((amt / stats.totalExpenses) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300 truncate pr-2">{cat}</span>
                    <span className="font-bold text-rose-400 flex-shrink-0">{formatCurrency(amt)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
