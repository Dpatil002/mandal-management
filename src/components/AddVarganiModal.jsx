import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, IndianRupee, User, Phone, MapPin, CreditCard, Sparkles, Image as ImageIcon, QrCode } from 'lucide-react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';

export function AddVarganiModal({ isOpen, onClose, onOpenQr, initialData }) {
  const { addVargani, updateVargani } = useMandalData();
  const { currentOrganizer } = useAuth();

  const [formData, setFormData] = useState(() => initialData || {
    donorName: '',
    phone: '',
    address: '',
    amount: '',
    mode: 'Cash',
    status: 'Received',
    notes: '',
    receiptUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [251, 501, 1001, 2100, 5001, 11000];

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

    if (!formData.donorName.trim()) {
      setError('Please enter donor name');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        collectedBy: currentOrganizer ? currentOrganizer.name : 'Organiser'
      };

      if (initialData?.id) {
        await updateVargani(initialData.id, payload);
      } else {
        await addVargani(payload);
        // Fire festive celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FF6F00', '#FFD54F', '#10B981', '#FFFFFF']
          });
        } catch {
          // Ignore confetti errors
        }
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Vargani Entry' : 'Record Vargani / वर्गणी नोंद'}
              </h3>
              <p className="text-xs text-slate-400">Add donor details & generate instant receipt</p>
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
          {/* Amount Field with Quick Preset Chips */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-300">
                Donation Amount (रक्कम) *
              </label>
              {onOpenQr && (
                <button
                  type="button"
                  onClick={() => onOpenQr(formData.amount)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" /> Show UPI QR
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 501"
                className="input-field pl-10 text-lg font-black text-amber-400"
                autoFocus={!initialData}
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amt })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex-shrink-0 ${
                    Number(formData.amount) === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Donor / Devotee Name (नाव) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                placeholder="Full Name (e.g. Ramesh Kadam)"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Phone & Flat/Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp / Mobile (मोबाईल)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit number"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Wing / Flat / Address (पत्ता)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. B-204 / Shop 3"
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          {/* Mode & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Mode (माध्यम)
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="input-field"
              >
                <option value="Cash">Cash (रोख)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank NEFT/IMPS</option>
                <option value="Cheque">Cheque (धनादेश)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status (स्थिती)
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="Received">Received (प्राप्त)</option>
                <option value="Promised">Promised (बाकी / नंतर)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Pooja / Aarti Intent (पर्यायी टीप)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Modak sponsor / evening Aarti"
              className="input-field"
            />
          </div>

          {/* Optional Screenshot Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              UPI Screenshot / Cheque Photo (पावती फोटो)
            </label>
            <div className="flex items-center gap-3">
              <label className="btn-secondary py-2 px-3 text-xs cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                {formData.receiptUrl ? 'Change Image' : 'Attach Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.receiptUrl && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Photo Attached
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-saffron w-full py-3 font-bold text-sm shadow-lg shadow-amber-500/25"
            >
              {loading ? 'Saving...' : initialData ? 'Update Donation' : 'Save Donation & Generate Receipt (नोंद करा)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
