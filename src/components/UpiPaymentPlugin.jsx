import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export function UpiPaymentPlugin({
  initialAmount = 2501,
  onPaymentSuccess,
  showDirectForm = true,
  embedded = false,
  onClose
}) {
  const { config, addVargani, isOnline } = useMandalData();

  const [selectedPreset, setSelectedPreset] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState(String(initialAmount));
  const [donorName, setDonorName] = useState('');
  const [wingFlat, setWingFlat] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVargani, setSubmittedVargani] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? Number(customAmount) : selectedPreset;
  const upiId = (config?.upiId || '9673909460@ybl').trim();
  const mandalName = config?.englishName || 'Indrayani Vihar Mitra Mandal';

  // Dynamic amount-embedded QR URL string
  const dynamicUpiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(mandalName)}&am=${effectiveAmount && effectiveAmount > 0 ? Number(effectiveAmount).toFixed(2) : '2501.00'}&cu=INR&tn=${encodeURIComponent(`Ganesh Utsav 2026 Vargani - ${wingFlat || donorName || 'Donor'}`)}`;

  const handlePresetSelect = (amt) => {
    setSelectedPreset(amt);
    setCustomAmount(String(amt));
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setSelectedPreset(Number(val) || 0);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot size should be under 5MB.');
        return;
      }
      setError('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScreenshot('');
    setFileName('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (typeof navigator !== 'undefined' && (!navigator.onLine || !isOnline)) {
      setError('No internet connection. Please connect to Wi-Fi / Mobile Data.');
      return;
    }

    if (!donorName.trim()) {
      setError('Please enter your full name / कृपया आपले नाव लिहा.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number / कृपया १० अंकी व्हॉट्सअ‍ॅप नंबर टाका.');
      return;
    }

    if (!effectiveAmount || effectiveAmount <= 0) {
      setError('Please enter a valid amount / कृपया योग्य रक्कम टाका.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry = await addVargani({
        donorName: donorName.trim(),
        wingFlat: wingFlat.trim(),
        phone: cleanPhone,
        amount: Number(effectiveAmount),
        mode: 'UPI',
        status: 'pending',
        utr: utr.trim(),
        screenshotUrl: screenshot,
        collectedBy: 'Direct UPI Flow',
        notes: `Paid via Dynamic UPI QR (${upiId})`
      });

      setSubmittedVargani(newEntry || {
        donorName: donorName.trim(),
        wingFlat: wingFlat.trim(),
        phone: cleanPhone,
        amount: Number(effectiveAmount),
        receiptNo: 'IVMM-2026-PENDING',
        createdAt: new Date().toISOString()
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(newEntry);
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting UPI payment:', err);
      setError('Error submitting contribution. Please try again.');
      setIsSubmitting(false);
    }
  };



  return (
    <div className={`flex flex-col w-full gap-5 font-['Plus_Jakarta_Sans','Mukta',sans-serif] ${embedded ? '' : 'max-w-xl mx-auto'}`}>
      {/* Plugin Header Badge */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#FFF1EB] via-white to-[#FFF1EB] p-3 rounded-2xl border border-[#F0DFD5] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#8B2616] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#8B2616] tracking-tight">Manual QR Scan / Copy UPI ID Flow</h3>
            <p className="text-[10px] text-[#6B5E57]">Fast • 100% Reliable on all Phones</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#14553C] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full border border-[#BDE5CE]">
            Amount-Linked
          </span>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="w-7 h-7 rounded-full bg-white border border-[#D9C4B7] flex items-center justify-center text-[#6B5E57] hover:text-[#8B2616]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: DONOR INFO */}
        {showDirectForm && (
          <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3 border border-[#F0DFD5]">
            <div className="flex items-center gap-2 border-b border-[#F0DFD5] pb-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2616] text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-[#241913] uppercase tracking-wider">Donor Details</h4>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="plugin-donor-name">
                Full Name (पूर्ण नाव) *
              </label>
              <input
                className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                id="plugin-donor-name"
                placeholder="उदा. राजेश शिंदे"
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="plugin-phone">
                  WhatsApp Number (मोबाईल क्र.) *
                </label>
                <input
                  className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                  id="plugin-phone"
                  placeholder="10-digit WhatsApp number"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="plugin-flat-no">
                  House Name (घराचे नाव)
                </label>
                <input
                  className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                  id="plugin-flat-no"
                  placeholder="उदा. House Name / घराचे नाव किंवा सदनिका क्र..."
                  type="text"
                  value={wingFlat}
                  onChange={(e) => setWingFlat(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: AMOUNT SELECTION (3 Presets: ₹2,501 / ₹3,001 / ₹3,501 + Custom) */}
        <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3 border border-[#F0DFD5]">
          <div className="flex items-center justify-between border-b border-[#F0DFD5] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2616] text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-[#241913] uppercase tracking-wider">Select Amount</h4>
            </div>
            <span className="text-sm font-black text-[#8B2616]">
              {formatCurrency(effectiveAmount)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[2501, 3001, 3501].map((amt) => {
              const isSelected = selectedPreset === amt;
              return (
                <button
                  key={amt}
                  className={`rounded-xl py-2.5 px-2 text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'border-[#8B2616] bg-[#8B2616] text-white shadow-xs'
                      : 'border-[#D9C4B7] bg-[#FFF8F6] text-[#241913] hover:bg-[#FFEAE0]'
                  }`}
                  onClick={() => handlePresetSelect(amt)}
                  type="button"
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 font-bold text-xs text-[#8B2616]">₹</span>
            <input
              className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl pl-7 pr-3.5 py-2 text-xs font-bold focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
              id="plugin-custom-amount"
              placeholder="Or enter custom amount (इतर रक्कम)"
              type="number"
              min="1"
              value={customAmount}
              onChange={handleCustomAmountChange}
            />
          </div>
        </div>

        {/* STEP 3: PAYMENT SCREEN — DYNAMIC QR & UPI ID */}
        <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3 border border-[#F0DFD5]">
          <div className="flex items-center justify-between border-b border-[#F0DFD5] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2616] text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-[#241913] uppercase tracking-wider">Scan QR or Copy UPI ID</h4>
            </div>
            <span className="text-[10px] font-bold text-[#14553C] bg-[#EBF7F0] px-2 py-0.5 rounded-full border border-[#BDE5CE]">
              ₹{effectiveAmount || 0} Embedded
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-[#FFF8F6] p-3.5 rounded-2xl border border-[#F0DFD5]">
            <div 
              onClick={() => setShowQrModal(true)}
              className="group relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-white p-2 border border-[#E8D4C8] flex items-center justify-center shadow-xs cursor-pointer hover:border-[#8B2616] transition-all"
              title="Click to Enlarge QR"
            >
              <QRCodeSVG
                value={dynamicUpiUrl}
                size={114}
                level="H"
                includeMargin={false}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold rounded-2xl transition-opacity gap-1">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                <span>Zoom</span>
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0 text-center sm:text-left w-full">
              <span className="text-xs font-bold text-[#8B2616]">
                Scan to Pay {formatCurrency(effectiveAmount)}
              </span>
              <p className="text-[11px] text-[#6B5E57] mt-0.5">
                Scan with any UPI App or Copy ID below
              </p>

              {/* UPI ID Row */}
              <div className="mt-2 bg-white border border-[#D9C4B7] px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                <span className="text-xs font-mono font-bold text-[#8B2616] truncate select-all">
                  {upiId}
                </span>
                <button
                  className="px-2.5 py-1 bg-[#FFF1EB] rounded-lg text-xs font-bold text-[#8B2616] hover:bg-[#8B2616] hover:text-white transition-all cursor-pointer shrink-0 border border-[#F0DFD5]"
                  onClick={handleCopyUpiId}
                  type="button"
                >
                  {copiedVpa ? 'Copied! ✓' : 'Copy ID'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <button
                  className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-bold text-[#6B5E57] border border-[#D9C4B7] hover:border-[#8B2616] hover:text-[#8B2616] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  onClick={() => setShowQrModal(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                  <span>Enlarge</span>
                </button>
                {config?.qrCodeUrl && (
                  <a
                    href={config.qrCodeUrl}
                    download="Mandal-Payment-QR.png"
                    className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-bold text-[#6B5E57] border border-[#D9C4B7] hover:border-[#8B2616] hover:text-[#8B2616] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Save QR</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: PROOF OF PAYMENT (UTR or Screenshot) */}
        {showDirectForm && (
          <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3 border border-[#F0DFD5]">
            <div className="flex items-center gap-2 border-b border-[#F0DFD5] pb-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2616] text-white text-[11px] font-bold flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-[#241913] uppercase tracking-wider">Proof of Payment</h4>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="plugin-utr">
                Option A: UPI Reference / UTR Number
              </label>
              <input
                className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                id="plugin-utr"
                placeholder="12-digit UTR (उदा. 4256XXXXXXXX)"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>

            <div className="flex items-center my-0.5">
              <div className="flex-1 border-t border-[#F0DFD5]"></div>
              <span className="px-2.5 text-[10px] font-bold text-[#8B2616] uppercase">किंवा / OR</span>
              <div className="flex-1 border-t border-[#F0DFD5]"></div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E57]">
                Option B: Upload Screenshot
              </label>
              <input
                accept="image/*"
                className="hidden"
                id="plugin-payment-screenshot"
                onChange={handleFileSelect}
                type="file"
              />
              <label
                className="rounded-xl border-2 border-dashed border-[#D9C4B7] bg-[#FFFBF7] p-2.5 text-center flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white"
                htmlFor="plugin-payment-screenshot"
              >
                {!fileName ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8B2616] text-[18px]">add_a_photo</span>
                    <span className="text-xs font-bold text-[#241913]">Add Screenshot / पावती फोटो</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-[#241913] font-semibold truncate">{fileName}</span>
                    <button
                      className="px-2 py-0.5 text-[#8B2616] text-xs font-semibold"
                      onClick={clearUpload}
                      type="button"
                    >
                      Change
                    </button>
                  </div>
                )}
              </label>
              {screenshot && (
                <div className="mt-1.5 relative w-20 h-20 rounded-xl overflow-hidden border border-[#D9C4B7]">
                  <img src={screenshot} alt="Screenshot proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              className="w-full rounded-xl py-3 bg-[#8B2616] text-white font-bold text-xs shadow-xs hover:bg-[#731E11] active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer mt-1"
              disabled={isSubmitting}
              type="submit"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{isSubmitting ? 'Recording Vargani...' : `Confirm & Generate Receipt (${formatCurrency(effectiveAmount)})`}</span>
            </button>
          </div>
        )}
      </form>

      {/* Success Modal */}
      {submittedVargani && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center gap-3.5 border border-[#F0DFD5]">
            <div className="w-12 h-12 rounded-full bg-[#b1f0ce] text-[#002114] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[28px]">verified</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#8B2616]">Vargani Submitted!</h3>
              <p className="text-xs text-[#6B5E57] mt-0.5">आपली वर्गणी यशस्वीरित्या नोंदवली गेली आहे</p>
            </div>

            <div className="w-full bg-[#FFF1EB] rounded-2xl p-3.5 flex flex-col gap-1.5 text-xs text-left border border-[#F0DFD5]">
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Receipt No:</span>
                <span className="font-bold text-[#241913]">{submittedVargani.receiptNo || 'IVMM-2026-8492'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Donor:</span>
                <span className="font-bold text-[#241913]">{submittedVargani.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">WhatsApp:</span>
                <span className="font-semibold text-[#241913]">{submittedVargani.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Amount:</span>
                <span className="font-black text-[#8B2616]">{formatCurrency(submittedVargani.amount)}</span>
              </div>
            </div>

            <div className="w-full bg-[#FAF3E8] rounded-xl p-2.5 text-[11px] text-[#6B5E57] border border-[#EAE0D2]">
              मंडळ कार्यकर्त्यांद्वारे पडताळणी झाल्यावर अधिकृत पावती आपल्या WhatsApp नंबरवर पाठवली जाईल.
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                className="w-full py-2.5 bg-[#8B2616] text-white font-bold text-xs rounded-xl hover:bg-[#731E11] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                onClick={() => setSubmittedVargani(null)}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">done</span>
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarge QR Lightbox Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center gap-3.5 border border-[#F0DFD5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-[#F0DFD5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B2616] text-[20px]">qr_code_2</span>
                <h3 className="text-sm font-bold text-[#241913]">Dynamic Payment QR</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                type="button"
                className="w-7 h-7 rounded-full bg-[#FFF1EB] flex items-center justify-center text-[#6B5E57] hover:text-[#8B2616] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="w-full max-w-[260px] aspect-square rounded-2xl bg-white p-3 border border-[#E8D4C8] shadow-inner flex items-center justify-center overflow-hidden">
              <QRCodeSVG
                value={dynamicUpiUrl}
                size={230}
                level="H"
              />
            </div>

            <div className="bg-[#8B2616] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-xs">
              Amount: {formatCurrency(effectiveAmount)}
            </div>

            <div className="w-full bg-[#FFF8F6] border border-[#D9C4B7] px-3.5 py-2 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-[#8B2616] truncate select-all">
                {upiId}
              </span>
              <button
                className="px-2.5 py-1 bg-[#FFF1EB] rounded-lg text-xs font-bold text-[#8B2616] hover:bg-[#8B2616] hover:text-white transition-all cursor-pointer shrink-0"
                onClick={handleCopyUpiId}
                type="button"
              >
                {copiedVpa ? 'Copied! ✓' : 'Copy ID'}
              </button>
            </div>

            <p className="text-[11px] text-[#6B5E57]">
              Scan with GPay, PhonePe, Paytm, or any UPI app
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#8B2616] text-white text-xs font-bold rounded-xl hover:bg-[#731E11] transition-all cursor-pointer shadow-xs"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
