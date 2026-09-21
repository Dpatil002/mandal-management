import React, { useState, useEffect } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, generateReceiptNumber } from '../utils/formatters';
import { validateName, validatePhone, validateAmount, validateUploadedFile, sanitizeText } from '../utils/validators';
import { UpiPaymentPlugin } from './UpiPaymentPlugin';

export function AddVarganiDrawer({ isOpen, onClose, onOpenReceipt, editItem = null }) {
  const { addVargani, updateVargani, config, vargani, isOnline } = useMandalData();
  const { currentOrganizer, organizers } = useAuth();

  const [donorName, setDonorName] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('UPI');
  const [utr, setUtr] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiPlugin, setShowUpiPlugin] = useState(false);
  const [error, setError] = useState('');

  // Sync state whenever drawer opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setDonorName(editItem.donorName || '');
        setPaidTo(editItem.collectedBy || editItem.paidTo || currentOrganizer?.name || organizers[0]?.name || 'Digambar Patil');
        setPhone(editItem.phone || '');
        setAmount(editItem.amount ? String(editItem.amount) : '');
        setMode(editItem.mode || 'UPI');
        setUtr(editItem.utr || '');
        setNotes(editItem.notes || '');
        setScreenshotPreview(editItem.screenshotUrl || '');
      } else {
        setDonorName('');
        setPaidTo(currentOrganizer?.name || organizers[0]?.name || 'Digambar Patil');
        setPhone('');
        setAmount('');
        setMode('UPI');
        setUtr('');
        setNotes('');
        setScreenshotPreview('');
      }
      setError('');
    }
  }, [isOpen, editItem, currentOrganizer, organizers]);

  if (!isOpen) return null;

  const presetAmounts = [501, 1001, 2501];

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
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    const nameVal = validateName(donorName, 2, 100);
    if (!nameVal.isValid) {
      setError(nameVal.error);
      return;
    }

    const amtVal = validateAmount(amount, 1, 1000000);
    if (!amtVal.isValid) {
      setError(amtVal.error);
      return;
    }

    let cleanPhone = '';
    if (phone.trim()) {
      const phoneVal = validatePhone(phone);
      if (!phoneVal.isValid) {
        setError(phoneVal.error);
        return;
      }
      cleanPhone = phoneVal.cleanPhone;
    }

    const selectedCollector = paidTo.trim() || currentOrganizer?.name || organizers[0]?.name || 'Organiser';

    setIsSubmitting(true);
    try {
      if (editItem?.id) {
        // Edit existing entry
        await updateVargani(editItem.id, {
          donorName: nameVal.sanitized,
          collectedBy: selectedCollector,
          paidTo: selectedCollector,
          phone: cleanPhone,
          amount: amtVal.value,
          mode,
          utr: sanitizeText(utr),
          notes: sanitizeText(notes),
          screenshotUrl: screenshotPreview,
          lastEditedBy: currentOrganizer ? currentOrganizer.name : 'Organiser',
          lastEditedAt: new Date().toISOString()
        });

        setIsSubmitting(false);
        onClose();
      } else {
        // Add new entry
        const newEntry = await addVargani({
          donorName: nameVal.sanitized,
          collectedBy: selectedCollector,
          paidTo: selectedCollector,
          phone: cleanPhone,
          amount: amtVal.value,
          mode,
          status: 'verified', // Organiser added directly is verified
          utr: sanitizeText(utr),
          notes: sanitizeText(notes),
          screenshotUrl: screenshotPreview
        });

        setIsSubmitting(false);
        onClose();

        if (onOpenReceipt && newEntry) {
          onOpenReceipt(newEntry);
        }
      }
    } catch (err) {
      setError('Error saving vargani entry. Please try again.');
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
            <div className="w-8 h-8 rounded-full bg-[#8B2616] text-[#FFF8F6] flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#241913]">
                {editItem ? 'वर्गणी नोंद संपादित करा (Edit Vargani)' : 'नवीन वर्गणी नोंद (Add Vargani)'}
              </h3>
              <p className="text-xs text-[#6B5E57]">
                {editItem ? `Receipt: ${editItem.receiptNo || 'IVMM-2026'}` : `Next Receipt: ${generateReceiptNumber(vargani.length + 1, config.year)}`}
              </p>
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
            <span>Offline Mode: Entry will be saved locally on this device.</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Preset Amounts */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1.5">रक्कम निवडा किंवा टाका (Amount)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {presetAmounts.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                    Number(amount) === p
                      ? 'bg-[#8B2616] text-white border-[#8B2616] shadow-sm'
                      : 'bg-white text-[#241913] border-[#D9C4B7] hover:border-[#8B2616]'
                  }`}
                >
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B2616] font-bold text-base">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom Amount (उदा. 2500)"
                required
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm font-bold text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
            </div>
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">देणगीदाराचे नाव (Donor Full Name) *</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="उदा. रमेश कुलकर्णी (Ramesh Kulkarni)"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
            />
          </div>

          {/* Paid To / Vargani Given To Dropdown & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">
                वर्गणी कोणाकडे दिली (Paid To) *
              </label>
              <div className="relative">
                <select
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] font-semibold focus:outline-hidden focus:border-[#8B2616] appearance-none pr-8 cursor-pointer"
                >
                  {organizers && organizers.length > 0 ? (
                    organizers.map((org) => (
                      <option key={org.id || org.name} value={org.name}>
                        {org.name} {org.phone ? `(${org.phone})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value={currentOrganizer?.name || 'Digambar Patil'}>
                      {currentOrganizer?.name || 'Digambar Patil'}
                    </option>
                  )}
                  {/* Keep previous custom name if not in list */}
                  {paidTo && !organizers.some(o => o.name === paidTo) && (
                    <option value={paidTo}>{paidTo}</option>
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B5E57] pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
              <p className="text-[10px] text-[#6B5E57] mt-0.5">ज्या कार्यकर्त्याकडे रोख/UPI दिले</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">
                मोबाईल नंबर / WhatsApp (Optional / ऐच्छिक)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number (नंबर नसल्यास रिक्त ठेवा)"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
              <p className="text-[10px] text-[#6B5E57] mt-0.5">नंबर दिल्यास WhatsApp वर पावती पाठवता येईल</p>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1.5">पेमेंट पद्धत (Payment Mode)</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'Cash', 'Bank Transfer'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                      : 'bg-white text-[#241913] border-[#D9C4B7]'
                  }`}
                >
                  {m === 'Cash' ? 'रोख (Cash)' : m}
                </button>
              ))}
            </div>

            {mode === 'UPI' && !editItem && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowUpiPlugin(true)}
                  className="w-full py-2.5 px-3 bg-[#FFF1EB] border border-[#F0DFD5] hover:bg-[#FFEAE0] text-[#8B2616] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  <span>Open Live UPI Payment Plugin / QR (₹{amount || '1001'})</span>
                </button>
              </div>
            )}
          </div>

          {/* UTR / Reference */}
          {mode !== 'Cash' && (
            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">UPI UTR / ट्रान्झॅक्शन नंबर (Optional)</label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="12-digit UTR No"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">विशेष नोंद / टीप (Notes - Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. हार-फुलांसाठी किंवा विशेष देणगी"
              className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm text-[#241913] focus:outline-hidden focus:border-[#8B2616]"
            />
          </div>

          {/* Screenshot Proof */}
          <div>
            <label className="block text-xs font-bold text-[#6B5E57] mb-1">पेमेंट स्क्रीनशॉट / पावती फोटो (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-[#6B5E57] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF4ED] file:text-[#8B2616] hover:file:bg-[#F0DFD5]"
            />
            {screenshotPreview && (
              <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-[#D9C4B7]">
                <img src={screenshotPreview} alt="Proof preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setScreenshotPreview('')}
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
              className="w-full py-3.5 rounded-2xl bg-[#8B2616] text-white font-extrabold text-sm shadow-md hover:bg-[#731E11] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{isSubmitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Save & Issue Receipt')}</span>
            </button>
          </div>
        </form>

        {/* UPI Payment Plugin Modal */}
        {showUpiPlugin && (
          <div 
            className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowUpiPlugin(false)}
          >
            <div 
              className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <UpiPaymentPlugin
                initialAmount={Number(amount) || 2501}
                embedded={true}
                showDirectForm={false}
                onClose={() => setShowUpiPlugin(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
