import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateName, validatePhone, validateAmount, validateUploadedFile, sanitizeText } from '../utils/validators';
import { checkRequestBurst, logSecurityEvent } from '../utils/securityLogger';

export function PublicPayVargani({ onNavigateHome }) {
  const { config, addVargani, isOnline } = useMandalData();

  // Step 1: Donor Info
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [wingFlat, setWingFlat] = useState('');

  // Step 2: Amount Selection (3 Presets: 2501, 3001, 3501 + Custom)
  const [selectedPreset, setSelectedPreset] = useState(2501);
  const [customAmount, setCustomAmount] = useState('2501');

  // Step 4: Proof of Payment (UTR or Screenshot)
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [fileName, setFileName] = useState('');

  // UI States
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVargani, setSubmittedVargani] = useState(null);
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? Number(customAmount) : selectedPreset;
  const upiId = (config?.upiId || '9673909460@ybl').trim();
  const mandalName = config?.englishName || 'Indrayani Vihar Mitra Mandal';

  // Dynamic UPI Intent String with exact amount and reference note
  const dynamicUpiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(mandalName)}&am=${effectiveAmount && effectiveAmount > 0 ? Number(effectiveAmount).toFixed(2) : '2501.00'}&cu=INR&tn=${encodeURIComponent(`Ganesh Utsav 2026 Vargani - ${wingFlat || donorName || 'Donor'}`)}`;

  const handlePresetSelect = (amount) => {
    setSelectedPreset(amount);
    setCustomAmount(String(amount));
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
      const fileValidation = validateUploadedFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
      if (!fileValidation.isValid) {
        setError(fileValidation.error);
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

    // Request burst monitoring (DDoS / rapid spam mitigation)
    const burst = checkRequestBurst('public-vargani-submit', 8, 10000);
    if (!burst.allowed) {
      setError('Too many requests in a short period. Please wait a few seconds and try again.');
      return;
    }

    if (typeof navigator !== 'undefined' && (!navigator.onLine || !isOnline)) {
      setError('No internet connection. Please connect to Wi-Fi / Mobile Data to submit.');
      return;
    }

    const nameValidation = validateName(donorName, 2, 100);
    if (!nameValidation.isValid) {
      setError(nameValidation.error);
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error);
      return;
    }

    const amountValidation = validateAmount(effectiveAmount, 1, 1000000);
    if (!amountValidation.isValid) {
      setError(amountValidation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry = await addVargani({
        donorName: nameValidation.sanitized,
        phone: phoneValidation.cleanPhone,
        wingFlat: sanitizeText(wingFlat),
        amount: amountValidation.value,
        mode: 'UPI',
        status: 'pending',
        utr: sanitizeText(utr),
        screenshotUrl: screenshot,
        collectedBy: 'Online Portal',
        notes: `Paid via Dynamic UPI QR (${upiId})`
      });

      setSubmittedVargani(newEntry || {
        donorName: nameValidation.sanitized,
        phone: phoneValidation.cleanPhone,
        wingFlat: sanitizeText(wingFlat),
        amount: amountValidation.value,
        receiptNo: 'IVMM-2026-PENDING',
        createdAt: new Date().toISOString()
      });
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting vargani:', err);
      logSecurityEvent({
        type: 'FIRESTORE_PERMISSION_DENIED',
        severity: 'WARN',
        message: `Vargani submission failed: ${err?.code || err?.message}`,
        details: { donorName: nameValidation.sanitized, phone: phoneValidation.cleanPhone, errorCode: err?.code }
      });
      setError('Error submitting contribution. Please try again.');
      setIsSubmitting(false);
    }
  };



  return (
    <div className="flex flex-col w-full max-w-xl mx-auto gap-5 pb-16 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Intro Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#fae4da] p-4 shadow-xs border border-[#F0DFD5]">
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-[#6b0e03] tracking-tight leading-tight">
              Pay Vargani / Contribution
            </h1>
            <p className="text-xs text-[#57423e] mt-0.5">
              Scan QR or Copy UPI ID • झटपट डिजिटल पावती
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[#a23f1a] text-[22px]">qr_code_scanner</span>
          </div>
        </div>
      </div>

      {/* Offline Status Warning Banner */}
      {(!isOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1EB] border border-[#FD8359]/70 text-[#8B2616] text-xs font-bold flex items-start gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[#8B2616] text-[20px] shrink-0 mt-0.5">wifi_off</span>
          <div>
            <p className="font-bold text-[#8B2616]">Offline Mode (तुम्ही ऑफलाइन आहात)</p>
            <p className="text-[11px] font-normal text-[#6B5E57] mt-0.5">
              Live submission requires internet connection. Please connect to Wi-Fi/Mobile Data to submit.
            </p>
          </div>
        </div>
      )}

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: DONOR INFO */}
        <div className="flex flex-col bg-white rounded-2xl p-4 sm:p-5 shadow-xs gap-3.5 border border-[#F0DFD5]">
          <div className="flex items-center gap-2 border-b border-[#F0DFD5] pb-2.5">
            <span className="w-6 h-6 rounded-full bg-[#8B2616] text-white text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <h2 className="text-sm font-bold text-[#241913]">Donor Details</h2>
              <p className="text-[11px] text-[#6B5E57]">आपली माहिती भरा (पावतीसाठी आवश्यक)</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="donor-full-name">
              Full Name (पूर्ण नाव) *
            </label>
            <input
              className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
              id="donor-full-name"
              placeholder="उदा. राजेश शिंदे (Rajesh Shinde)"
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="donor-phone">
                WhatsApp Phone No. (मोबाईल क्र.) *
              </label>
              <input
                className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                id="donor-phone"
                placeholder="10-digit WhatsApp number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="donor-flat">
                House Name (घराचे नाव)
              </label>
              <input
                className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                id="donor-flat"
                placeholder="उदा. House Name / घराचे नाव किंवा सदनिका क्र..."
                type="text"
                value={wingFlat}
                onChange={(e) => setWingFlat(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* STEP 2: AMOUNT SELECTION */}
        <div className="flex flex-col bg-white rounded-2xl p-4 sm:p-5 shadow-xs gap-3.5 border border-[#F0DFD5]">
          <div className="flex items-center justify-between border-b border-[#F0DFD5] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8B2616] text-white text-xs font-bold flex items-center justify-center">2</span>
              <div>
                <h2 className="text-sm font-bold text-[#241913]">Select Amount</h2>
                <p className="text-[11px] text-[#6B5E57]">रक्कम निवडा किंवा लिहा</p>
              </div>
            </div>
            <span className="text-base font-black text-[#8B2616]">
              {formatCurrency(effectiveAmount)}
            </span>
          </div>

          {/* 3 Preset Chips: ₹2,501 / ₹3,001 / ₹3,501 */}
          <div className="grid grid-cols-3 gap-2">
            {[2501, 3001, 3501].map((amt) => {
              const isSelected = selectedPreset === amt;
              return (
                <button
                  key={amt}
                  className={`rounded-xl py-3 px-2 text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer border ${
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

          {/* Custom Amount Field */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#6B5E57]" htmlFor="custom-amount-input">
              Or Enter Custom Amount (इतर रक्कम)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-sm text-[#8B2616]">₹</span>
              <input
                className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
                id="custom-amount-input"
                placeholder="उदा. 501, 5001"
                type="number"
                min="1"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>
        </div>

        {/* STEP 3: PAYMENT SCREEN — NO APP REDIRECT BUTTONS */}
        <div className="flex flex-col bg-white rounded-2xl p-4 sm:p-5 shadow-xs gap-4 border border-[#F0DFD5]">
          <div className="flex items-center justify-between border-b border-[#F0DFD5] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8B2616] text-white text-xs font-bold flex items-center justify-center">3</span>
              <div>
                <h2 className="text-sm font-bold text-[#241913]">Scan QR or Copy UPI ID</h2>
                <p className="text-[11px] text-[#6B5E57]">कोणत्याही UPI ॲपवरून स्कॅन करा</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#14553C] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full border border-[#BDE5CE]">
              Amount Embedded: ₹{effectiveAmount || 0}
            </span>
          </div>

          {/* Dynamic Amount QR Code Card */}
          <div className="flex flex-col items-center justify-center bg-[#FFF8F6] p-4 rounded-2xl border border-[#F0DFD5] gap-3">
            <div className="w-full text-center">
              <p className="text-xs font-bold text-[#6b0e03]">{mandalName}</p>
              <p className="text-[11px] text-[#6B5E57]">Ganesh Utsav 2026 Fund</p>
            </div>

            {/* Dynamic QR Code */}
            <div 
              onClick={() => setShowQrModal(true)}
              className="relative p-3 bg-white rounded-2xl border-2 border-[#8B2616]/30 shadow-md flex items-center justify-center cursor-pointer hover:border-[#8B2616] transition-all group"
              title="Click to Enlarge QR"
            >
              <QRCodeSVG
                value={dynamicUpiUrl}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#241913"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold rounded-2xl transition-opacity gap-1">
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                <span>Enlarge QR</span>
              </div>
            </div>

            {/* Dynamic Amount Tag */}
            <div className="bg-[#8B2616] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-xs">
              Scan to Pay {formatCurrency(effectiveAmount)}
            </div>

            {/* UPI ID Row with Instant Copy */}
            <div className="w-full max-w-sm mt-1 bg-white border border-[#D9C4B7] px-3.5 py-2 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#6B5E57] uppercase font-bold tracking-wider">Mandal UPI ID</span>
                <span className="text-xs font-mono font-black text-[#8B2616] truncate select-all">
                  {upiId}
                </span>
              </div>
              <button
                className="px-3 py-1.5 bg-[#FFF1EB] hover:bg-[#8B2616] hover:text-white rounded-lg text-xs font-bold text-[#8B2616] transition-all cursor-pointer shrink-0 border border-[#F0DFD5]"
                onClick={handleCopyUpiId}
                type="button"
              >
                {copiedVpa ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1 bg-white rounded-lg text-[11px] font-bold text-[#6B5E57] border border-[#D9C4B7] hover:border-[#8B2616] hover:text-[#8B2616] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                <span>Enlarge QR</span>
              </button>
              {config?.qrCodeUrl && (
                <a
                  href={config.qrCodeUrl}
                  download="Mandal-Payment-QR.png"
                  className="px-3 py-1 bg-white rounded-lg text-[11px] font-bold text-[#6B5E57] border border-[#D9C4B7] hover:border-[#8B2616] hover:text-[#8B2616] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>Save QR</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* STEP 4: PROOF OF PAYMENT (UTR or Screenshot - Either Accepted) */}
        <div className="flex flex-col bg-white rounded-2xl p-4 sm:p-5 shadow-xs gap-3.5 border border-[#F0DFD5]">
          <div className="flex items-center gap-2 border-b border-[#F0DFD5] pb-2.5">
            <span className="w-6 h-6 rounded-full bg-[#8B2616] text-white text-xs font-bold flex items-center justify-center">4</span>
            <div>
              <h2 className="text-sm font-bold text-[#241913]">Proof of Payment</h2>
              <p className="text-[11px] text-[#6B5E57]">UTR नंबर टाका किंवा स्क्रीनशॉट जोडा (कोणताही एक पर्याय पुरेसा आहे)</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="utr-input">
              Option A: UPI Reference / UTR Number
            </label>
            <input
              className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
              id="utr-input"
              placeholder="उदा. 12-digit UTR No (उदा. 4256XXXXXXXX)"
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
            />
          </div>

          <div className="flex items-center my-0.5">
            <div className="flex-1 border-t border-[#F0DFD5]"></div>
            <span className="px-3 text-[11px] font-bold text-[#8B2616] uppercase">किंवा / OR</span>
            <div className="flex-1 border-t border-[#F0DFD5]"></div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6B5E57]">
              Option B: Upload Payment Screenshot
            </label>
            <input
              accept="image/*"
              className="hidden"
              id="payment-screenshot-file"
              onChange={handleFileSelect}
              type="file"
            />
            <label
              className="rounded-xl border-2 border-dashed border-[#D9C4B7] bg-[#FFFBF7] p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white"
              htmlFor="payment-screenshot-file"
            >
              {!fileName ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B2616] text-[20px]">add_a_photo</span>
                  <span className="text-xs font-bold text-[#241913]">Add Screenshot / पावती फोटो</span>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-[#241913] font-bold truncate">{fileName}</span>
                  <button
                    className="px-2.5 py-1 text-[#8B2616] hover:bg-[#FFEAE0] rounded-lg text-xs font-bold"
                    onClick={clearUpload}
                    type="button"
                  >
                    Change
                  </button>
                </div>
              )}
            </label>
            {screenshot && (
              <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-[#D9C4B7] shadow-2xs">
                <img src={screenshot} alt="Screenshot proof" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* STEP 5: CONFIRM & GENERATE RECEIPT BUTTON */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full rounded-2xl py-3.5 bg-[#8B2616] text-white font-extrabold text-sm shadow-md hover:bg-[#731E11] active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            disabled={isSubmitting}
            type="submit"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{isSubmitting ? 'Recording Vargani...' : `Confirm Payment & Generate Receipt (${formatCurrency(effectiveAmount)})`}</span>
          </button>
        </div>
      </form>

      {/* CONFIRMATION & RECEIPT MODAL */}
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

            <div className="w-full bg-[#FFF1EB] rounded-2xl p-3.5 flex flex-col gap-2 text-xs text-left border border-[#F0DFD5]">
              <div className="flex justify-between items-center border-b border-[#F0DFD5] pb-1.5">
                <span className="text-[#6B5E57]">Receipt No:</span>
                <span className="font-mono font-bold text-[#241913] bg-white px-2 py-0.5 rounded border border-[#D9C4B7]">
                  {submittedVargani.receiptNo || 'IVMM-2026-8492'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Donor:</span>
                <span className="font-bold text-[#241913]">{submittedVargani.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">WhatsApp:</span>
                <span className="font-semibold text-[#241913]">{submittedVargani.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#F0DFD5]">
                <span className="text-[#6B5E57] font-bold">Amount:</span>
                <span className="font-black text-base text-[#8B2616]">{formatCurrency(submittedVargani.amount)}</span>
              </div>
            </div>

            <div className="w-full bg-[#FAF3E8] rounded-xl p-2.5 text-[11px] text-[#6B5E57] border border-[#EAE0D2]">
              मंडळ कार्यकर्त्यांद्वारे पडताळणी झाल्यावर अधिकृत पावती आपल्या WhatsApp नंबरवर पाठवली जाईल.
            </div>

            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                className="w-full py-3 bg-[#8B2616] text-white font-bold text-xs rounded-xl hover:bg-[#731E11] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                onClick={onNavigateHome || (() => setSubmittedVargani(null))}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span>Done / होमपेजवर जा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENLARGE QR MODAL */}
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
                includeMargin={false}
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
