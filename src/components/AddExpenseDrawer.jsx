import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';

export function AddExpenseDrawer({ isOpen, onClose }) {
  const { addExpense, isOnline } = useMandalData();
  const { currentOrganizer } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Decoration');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Decoration',
    'Mahaprasad',
    'Sound & Lights',
    'Murti',
    'Dhol Tasha',
    'Programs',
    'Misc'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('कृपया खर्चाचे कारण किंवा वर्णन टाका (Please enter expense description)');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('कृपया योग्य खर्च रक्कम टाका (Please enter valid amount)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        title: title.trim(),
        category,
        amount: Number(amount),
        vendor: vendor.trim(),
        date,
        notes: notes.trim(),
        receiptUrl: receiptPhoto,
        paidBy: currentOrganizer ? currentOrganizer.name : 'Organiser'
      });

      setTitle('');
      setAmount('');
      setVendor('');
      setNotes('');
      setReceiptPhoto('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError('Error saving expense. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#FFF8F6] border border-[#F0DFD5] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F0DFD5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8734A] text-white flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#241913]">नवीन खर्च नोंद (Record Expense)</h3>
              <p className="text-xs text-[#6B5E57]">Auto updates Treasury Balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B5E57] hover:text-[#241913] hover:bg-[#FAF4ED]"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {!isOnline && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#FFF1EB] border border-[#FD8359]/60 text-[#8B2616] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#8B2616]">cloud_off</span>
            <span>Offline Mode: Expense will be saved locally on this device.</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">खर्चाची रक्कम (Amount) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B2616] font-bold text-base">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 4500"
                required
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm font-bold text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">खर्चाचे वर्णन / कारण (Description) *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flower Garland for Pandal Entrance"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1.5">वर्गवारी / प्रकार (Category)</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                    category === c
                      ? 'bg-[#8B2616] text-white border-[#8B2616]'
                      : 'bg-white text-[#241913] border-[#D9C4B7] hover:border-[#8B2616]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">दुकान / विक्रेता (Vendor Name)</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Om Decorators"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">तारीख (Date)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
            </div>
          </div>

          {/* Bill / Receipt Photo */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">बिलाचा फोटो / पावती (Upload Bill Photo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-[#6B5E57] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF4ED] file:text-[#8B2616] hover:file:bg-[#F0DFD5]"
            />
            {receiptPhoto && (
              <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-[#D9C4B7]">
                <img src={receiptPhoto} alt="Bill preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setReceiptPhoto('')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#E8734A] text-white font-extrabold text-sm shadow-md hover:bg-[#d6653e] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>{isSubmitting ? 'नोंद होत आहे...' : 'खर्च नोंदवा (Save Expense)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
