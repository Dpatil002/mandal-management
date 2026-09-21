import React, { useState, useMemo } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OrganiserExpenses({ onOpenAddExpense, onOpenProof, onOpenReport }) {
  const { expenses, deleteExpense, stats } = useMandalData();
  const { organizers } = useAuth();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Organiser-wise expense totals based on 'paidBy' / loggedBy (active organisers with total > 0 only)
  const organiserExpenseTotals = useMemo(() => {
    const map = {};

    // Aggregate expenses per payer
    (expenses || []).forEach((item) => {
      const payer = (item.paidBy || item.loggedBy || item.lastEditedBy || '').trim();
      if (payer && !['mandal', 'mandal fund', 'paid via mandal', 'cash', 'upi'].includes(payer.toLowerCase())) {
        map[payer] = (map[payer] || 0) + (Number(item.amount) || 0);
      }
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .filter(({ total }) => total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Decoration', label: 'Decoration' },
    { id: 'Mahaprasad', label: 'Mahaprasad' },
    { id: 'Programs', label: 'Programs' },
    { id: 'Misc', label: 'Misc' }
  ];

  const filteredExpenses = expenses.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || item.description || '').toLowerCase().includes(q);
      const matchVendor = (item.vendor || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      return matchTitle || matchVendor || matchCat || matchNotes;
    }
    return true;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Decoration':
        return { bg: 'bg-[#b1f0ce]', text: 'text-[#002114]', icon: 'theater_comedy' };
      case 'Mahaprasad':
        return { bg: 'bg-[#ffdbd0]', text: 'text-[#822803]', icon: 'restaurant' };
      case 'Programs':
      case 'Sound & Lights':
        return { bg: 'bg-[#ffdad4]', text: 'text-[#3f0300]', icon: 'volume_up' };
      default:
        return { bg: 'bg-[#fae4da]', text: 'text-[#241913]', icon: 'receipt' };
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmItem) {
      await deleteExpense(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  const budget = stats.totalReceived > 0 ? stats.totalReceived : 220000;
  const utilizedPercent = Math.min(100, Math.round((stats.totalExpenses / (budget || 1)) * 100));
  const remaining = Math.max(0, budget - stats.totalExpenses);

  return (
    <div className="flex flex-col w-full px-4 max-w-xl mx-auto pb-20 space-y-6 sm:space-y-7 font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in pt-1">

      {/* Total Outflow Progress Card */}
      <section className="w-full rounded-2xl bg-white/95 border border-[#F0DFD5] p-4 text-[#241913] shadow-xs relative overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#6B5E57]">Total Spent</span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#fae4da] text-[#8B2616] font-semibold">
              {expenses.length} Bills
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#8B2616]">
              {formatCurrency(stats.totalExpenses)}
            </span>
            <span className="text-xs text-[#6B5E57]">
              Budget: {formatCurrency(budget)}
            </span>
          </div>
          <div className="w-full bg-[#f4ded4] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#8B2616] h-full rounded-full transition-all duration-500"
              style={{ width: `${utilizedPercent}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-[#6B5E57] pt-0.5">
            <span className="font-medium text-[#8B2616]">{utilizedPercent}% Utilized</span>
            <span>
              Remaining: {formatCurrency(remaining)}
            </span>
          </div>
          <div className="pt-1">
            <button
              onClick={() => onOpenAddExpense && onOpenAddExpense(null)}
              className="w-full rounded-xl py-3 bg-[#8B2616] text-white font-semibold text-xs shadow-xs hover:bg-[#731E11] active:scale-[0.99] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              id="quickAddBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </section>

      {/* Organiser-wise Expense Cards */}
      {organiserExpenseTotals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
          {organiserExpenseTotals.map(({ name, total }) => (
            <div
              key={name}
              className="bg-white/95 border border-[#F0DFD5] rounded-xl px-3 py-2 shadow-2xs flex items-center justify-between gap-2"
            >
              <span className="text-xs font-semibold text-[#241913] truncate" title={name}>
                {name}
              </span>
              <span className="text-xs font-bold text-[#8B2616] shrink-0">
                {formatCurrency(total)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Search and Category Chips */}
      <div className="w-full flex flex-col gap-2.5">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#8B2616] text-[20px] pointer-events-none">
            search
          </span>
          <input
            id="expenseSearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-white border border-[#D9C4B7] text-[#241913] text-sm placeholder:text-[#6B5E57] focus:outline-none focus:ring-2 focus:ring-[#8B2616] shadow-xs transition-all"
            placeholder="Search description, vendor or category / खर्च शोधा..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#6B5E57] hover:text-[#241913] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#8B2616] text-white'
                  : 'bg-[#fff1eb] border border-[#D9C4B7] text-[#8B2616]'
              }`}
              type="button"
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#8B2616] text-[18px]">receipt_long</span>
          <h3 className="text-sm font-bold text-[#241913]">Expense Records / खर्च नोंद</h3>
        </div>
        <span className="text-xs text-[#6B5E57]">
          Showing {filteredExpenses.length} entries
        </span>
      </div>

      {/* Expense List Cards */}
      <div className="flex flex-col gap-3">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#6B5E57] gap-2 bg-white rounded-2xl border border-[#F0DFD5]">
            <span className="material-symbols-outlined text-[36px] text-[#D9C4B7]">receipt_long</span>
            <p className="text-sm font-bold text-[#8B2616]">कोणतीही नोंद आढळली नाही / No expense entries found</p>
            <p className="text-xs text-[#6B5E57]">Try clearing filters or adding new expense</p>
          </div>
        ) : (
          filteredExpenses.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <article
                key={item.id}
                className="bg-white rounded-xl p-3.5 border border-[#F0DFD5] shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} text-xs font-semibold`}>
                        <span className="material-symbols-outlined text-[13px] mr-1">{badge.icon}</span>
                        {item.category || 'Misc'}
                      </span>
                      <span className="text-xs text-[#6B5E57] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span> {formatDate(item.date)}
                      </span>
                      {item.lastEditedAt && (
                        <span className="text-[10px] text-[#A23F1A] bg-[#FFEAE0] px-1.5 py-0.2 rounded font-medium">
                          Edited
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#241913] line-clamp-1">
                      {item.title || item.description}
                    </h4>
                    <p className="text-xs text-[#6B5E57] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#8B2616]">storefront</span>
                      {item.vendor || 'स्थानिक खरेदी'}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-[#8B2616] mt-1 bg-[#FFF1EB] px-2 py-0.5 rounded italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-bold text-[#8B2616]">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[11px] text-[#14553c] font-semibold">
                      {item.paidBy || 'Paid via Mandal'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#fff1eb] rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#6B5E57] flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[15px] text-[#8B2616]">check_circle</span>
                    Verified voucher &amp; approved
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.receiptUrl && (
                      <button
                        onClick={() => onOpenProof(item.receiptUrl, `Bill Photo - ${item.title}`)}
                        className="rounded-xl py-1 px-2.5 border border-[#D9C4B7] bg-white text-[#8B2616] text-xs font-semibold hover:bg-[#FFF5EE] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        type="button"
                        title="View Bill Photo"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>View</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenAddExpense && onOpenAddExpense(item)}
                      className="rounded-xl py-1 px-2.5 border border-[#D9C4B7] bg-white text-[#8B2616] text-xs font-semibold hover:bg-[#FFF5EE] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      type="button"
                      title="Edit Expense"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-1 rounded-lg text-[#6B5E57] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Expense"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Download Full Ledger Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#F0DFD5] shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#fae4da] flex items-center justify-center text-[#8B2616] shrink-0">
          <span className="material-symbols-outlined text-[22px]">download</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#241913]">Download Full Ledger</h4>
          <p className="text-xs text-[#6B5E57]">Export audited spreadsheet report with GST details.</p>
        </div>
        <button
          onClick={onOpenReport}
          className="rounded-xl py-2 px-3.5 border border-[#D9C4B7] bg-white text-[#8B2616] text-xs font-semibold hover:bg-[#FFF5EE] transition-colors shrink-0 shadow-xs cursor-pointer"
          type="button"
        >
          PDF / Excel
        </button>
      </div>

      {/* Delete Expense Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-red-100 flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#241913]">Delete Expense Entry?</h4>
                <p className="text-xs text-[#6B5E57]">हा खर्च रेकॉर्ड हटवायचा आहे का?</p>
              </div>
            </div>

            <div className="bg-[#FFF8F6] p-3 rounded-2xl border border-[#F0DFD5] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Description:</span>
                <span className="font-bold text-[#241913] truncate max-w-[180px]">{deleteConfirmItem.title || deleteConfirmItem.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Amount:</span>
                <span className="font-bold text-[#8B2616]">{formatCurrency(deleteConfirmItem.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Category:</span>
                <span className="font-medium text-[#241913]">{deleteConfirmItem.category}</span>
              </div>
            </div>

            <p className="text-xs text-red-700 font-medium">
              Delete this entry? This can't be undone. Total Spent and Treasury Balance will recalculate immediately.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="py-2.5 px-4 rounded-xl border border-[#D9C4B7] bg-white text-[#241913] text-xs font-bold hover:bg-[#FAF4ED] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
