import React, { useState } from 'react';
import { X, Receipt, IndianRupee, Store, User, Calendar, Image as ImageIcon, Check } from 'lucide-react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';

export function AddExpenseModal({ isOpen, onClose, initialData }) {
  const { addExpense } = useMandalData();
  const { currentOrganizer, organizers } = useAuth();

  const categories = [
    'Decoration & Mandap',
    'Murti / Idol',
    'Sound & Lighting',
    'Prasad & Bhandara',
    'Security & Permissions',
    'Printing & Banners',
    'Pooja Samagri',
    'Miscellaneous'
  ];

  const [formData, setFormData] = useState(() => initialData || {
    title: '',
    category: 'Decoration & Mandap',
    amount: '',
    vendor: '',
    paidBy: currentOrganizer ? `${currentOrganizer.name}` : 'Mandal Fund',
    date: new Date().toISOString().slice(0, 10),
    receiptUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter expense description/item name');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    setLoading(true);
    try {
      await addExpense(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Expense / खर्च नोंद</h3>
              <p className="text-xs text-slate-400">Log vendor payouts & bills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Expense Amount (खर्च रक्कम) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 2500"
                className="input-field pl-10 text-lg font-black text-rose-400"
                autoFocus
              />
            </div>
          </div>

          {/* Description / Item */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Item Name (खर्च कशासाठी केला) *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Flowers, Garland & Har for Stage"
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category (वर्ग / प्रकार)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Vendor & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vendor / Shop (दुकान / व्यक्ती)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. Sai Flower Mart"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paid By Organiser (कोणी पैसे दिले)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="input-field pl-10"
                >
                  <option value="Mandal Main Account">Mandal Main Fund (मंडळ निधी)</option>
                  {organizers.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Bill Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expense Date (तारीख)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Attach Bill / Receipt Photo
              </label>
              <div className="flex items-center gap-2 pt-1">
                <label className="btn-secondary py-2 px-3 text-xs cursor-pointer flex items-center gap-1.5 w-full justify-center">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  {formData.receiptUrl ? 'Change Bill' : 'Upload Bill Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {formData.receiptUrl && (
            <div className="p-2 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Bill Photo Attached
              </span>
              <img src={formData.receiptUrl} alt="Bill preview" className="w-8 h-8 rounded object-cover border border-white/20" />
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-saffron w-full py-3 font-bold text-sm bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 shadow-lg shadow-rose-900/30"
            >
              {loading ? 'Saving...' : 'Record Expense (खर्च नोंदवा)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
