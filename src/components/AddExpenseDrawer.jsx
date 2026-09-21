import React, { useState, useEffect } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { validateName, validateAmount, validateUploadedFile, sanitizeText } from '../utils/validators';

export function AddExpenseDrawer({ isOpen, onClose, editItem = null }) {
  const { addExpense, updateExpense, isOnline } = useMandalData();
  const { currentOrganizer, organizers } = useAuth();

  const [title, setTitle] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('Decoration');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setTitle(editItem.title || editItem.description || '');
        setPaidBy(editItem.paidBy || editItem.lastEditedBy || currentOrganizer?.name || organizers[0]?.name || 'Digambar Patil');
        setCategory(editItem.category || 'Decoration');
        setAmount(editItem.amount ? String(editItem.amount) : '');
        setVendor(editItem.vendor || '');
        setDate(editItem.date ? editItem.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
        setNotes(editItem.notes || '');
        setReceiptPhoto(editItem.receiptUrl || '');
      } else {
        setTitle('');
        setPaidBy(currentOrganizer?.name || organizers[0]?.name || 'Digambar Patil');
        setCategory('Decoration');
        setAmount('');
        setVendor('');
        setDate(new Date().toISOString().slice(0, 10));
        setNotes('');
        setReceiptPhoto('');
      }
      setError('');
    }
  }, [isOpen, editItem, currentOrganizer, organizers]);

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
      const fileVal = validateUploadedFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
      if (!fileVal.isValid) {
        setError(fileVal.error);
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    const titleVal = validateName(title, 2, 200);
    if (!titleVal.isValid) {
      setError(titleVal.error);
      return;
    }

    const amtVal = validateAmount(amount, 1, 10000000);
    if (!amtVal.isValid) {
      setError(amtVal.error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem?.id) {
        await updateExpense(editItem.id, {
          title: titleVal.sanitized,
          category: sanitizeText(category) || 'Misc',
          amount: amtVal.value,
          vendor: sanitizeText(vendor),
          date: date || new Date().toISOString().slice(0, 10),
          notes: sanitizeText(notes),
          receiptUrl: receiptPhoto,
          paidBy: sanitizeText(paidBy) || currentOrganizer?.name || 'Digambar Patil',
          lastEditedBy: currentOrganizer ? currentOrganizer.name : 'Organiser',
          lastEditedAt: new Date().toISOString()
        });
      } else {
        await addExpense({
          title: titleVal.sanitized,
          category: sanitizeText(category) || 'Misc',
          amount: amtVal.value,
          vendor: sanitizeText(vendor),
          date: date || new Date().toISOString().slice(0, 10),
          notes: sanitizeText(notes),
          receiptUrl: receiptPhoto,
          paidBy: sanitizeText(paidBy) || currentOrganizer?.name || 'Digambar Patil'
        });
      }

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
              <h3 className="text-base font-extrabold text-[#241913]">
                {editItem ? 'खर्च नोंद संपादित करा (Edit Expense)' : 'नवीन खर्च नोंद (Record Expense)'}
              </h3>
              <p className="text-xs text-[#6B5E57]">Auto updates Treasury Balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B5E57] hover:text-[#241913] hover:bg-[#FAF4ED] cursor-pointer"
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
                  className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
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

          {/* Paid By Organiser Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">खर्च कोणाकडून झाला / Paid By *</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm font-semibold text-[#241913] focus:outline-hidden focus:border-[#8B2616] cursor-pointer"
            >
              {organizers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">टीप / तपशील (Notes - Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. बिल क्रमांक किंवा पेमेंट पद्धत"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
            />
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
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs cursor-pointer"
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
              className="w-full py-3.5 rounded-2xl bg-[#E8734A] text-white font-extrabold text-sm shadow-md hover:bg-[#d6653e] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>{isSubmitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Save Expense')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
