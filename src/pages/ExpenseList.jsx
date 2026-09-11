import React, { useState, useMemo } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportExpensesToCSV } from '../utils/csvExport';
import { 
  Receipt, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Store, 
  Calendar, 
  User, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  PieChart
} from 'lucide-react';

export function ExpenseList({ onOpenAddExpense }) {
  const { expenses, deleteExpense, config } = useMandalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    'All',
    'Decoration & Mandap',
    'Murti / Idol',
    'Sound & Lighting',
    'Prasad & Bhandara',
    'Security & Permissions',
    'Printing & Banners',
    'Pooja Samagri',
    'Miscellaneous'
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.paidBy || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredExpenses]);

  // Category-wise totals for summary chips
  const categoryTotals = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const cat = item.category || 'Miscellaneous';
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0);
    });
    return map;
  }, [expenses]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" /> Expense Records (खर्च यादी)
          </h2>
          <p className="text-xs text-slate-400">
            Total {filteredExpenses.length} bills • Total Payout: <strong className="text-rose-400">{formatCurrency(totalExpenseAmount)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExpensesToCSV(filteredExpenses, config?.name)}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            title="Download CSV for Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export CSV
          </button>

          <button
            onClick={onOpenAddExpense}
            className="btn-saffron py-2 px-3.5 text-xs flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-amber-600 shadow-md shadow-rose-900/20"
          >
            <Plus className="w-4 h-4" /> + Record Expense
          </button>
        </div>
      </div>

      {/* Category Quick Cards Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.entries(categoryTotals).slice(0, 4).map(([cat, amount]) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-rose-500/15 border-rose-500/40'
                : 'bg-slate-900/60 border-white/5 hover:border-white/15'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400 block truncate">{cat}</span>
            <span className="text-sm font-black text-rose-400 mt-0.5 block">{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div className="glass-card p-3 sm:p-4 bg-slate-900/80 border-white/10 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, vendor, or organizer..."
            className="input-field pl-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white border-rose-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs">
            <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No expenses found matching the selected criteria.
          </div>
        ) : (
          filteredExpenses.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 bg-slate-900/70 border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">
                    {item.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
                  {item.vendor && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Store className="w-3 h-3 text-slate-500" /> {item.vendor}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> Paid by: {item.paidBy || 'Mandal'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(item.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-lg font-black text-rose-400 block">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.receiptUrl)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10"
                      title="View Bill Photo"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Image Modal Preview */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Bill Receipt" className="w-full rounded-xl object-contain max-h-[75vh]" />
            <button
              onClick={() => setPreviewImage(null)}
              className="btn-secondary w-full mt-3 text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
