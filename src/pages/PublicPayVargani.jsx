import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, getUpiDeepLinks } from '../utils/formatters';

const STITCH_QR_IMG = 'https://lh3.googleusercontent.com/aida/AEtjO1XLVDinjlPmxe4l8-00ypjYvKvalqYXLUsqgk2Wu6_ojADQR9nF_XoY1VN1BphkMGwOkfYPDMsUy2L9PHRtQ6kw9wdSQFAp_TgENzUQY18DH8vo6XYgJnIn76prMfhWLn7QgSSNooLg5R0_XHMSJsUhQRKJoF-8lPaF150HT7_oPwyih6QhQNrNcq9FWFyq6QFWh3IzkjB81fYwYuGusaUOGMB3M9P0DYV16d_XgIzyrVUHmqxLDEu_kpI';

export function PublicPayVargani({ onNavigateHome }) {
  const { config, addVargani, isOnline } = useMandalData();

  const [selectedAmount, setSelectedAmount] = useState(1001);
  const [customAmount, setCustomAmount] = useState('1001');
  const [donorName, setDonorName] = useState('');
  const [wingFlat, setWingFlat] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReceiptNo, setSubmittedReceiptNo] = useState('IVMM-2026-8492');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;

  const upiLinks = getUpiDeepLinks({
    vpa: config.upiId || 'mandal.indrayani@upi',
    name: config.englishName || 'Indrayani Vihar Mitra Mandal',
    amount: effectiveAmount,
    note: `Ganesh Utsav 2026 Vargani - ${wingFlat || 'Donor'}`
  });

  const handlePresetClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount(String(amt));
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(Number(e.target.value) || 0);
  };

  const setWing = (prefix) => {
    if (!wingFlat.startsWith(prefix)) {
      setWingFlat(prefix);
    }
  };

  const handleCopyVpa = () => {
    const vpa = config.upiId || 'mandal.indrayani@upi';
    navigator.clipboard.writeText(vpa).then(() => {
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    e.preventDefault();
    setError('');

    if (typeof navigator !== 'undefined' && (!navigator.onLine || !isOnline)) {
      setError('No internet connection. Please connect to the internet and try again / इंटरनेट कनेक्शन उपलब्ध नाही. कृपया कनेक्ट करून पुन्हा प्रयत्न करा.');
      return;
    }

    if (!donorName.trim()) {
      setError('Please enter your full name / कृपया आपले नाव लिहा.');
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
        phone: phone.trim(),
        amount: Number(effectiveAmount),
        mode: 'UPI',
        status: 'pending',
        utr: utr.trim(),
        screenshotUrl: screenshot,
        collectedBy: 'Online Portal',
        notes: 'Submitted via Public Pay Vargani'
      });

      setSubmittedReceiptNo(newEntry?.receiptNo || 'IVMM-2026-8492');
      setIsSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      setError('Error submitting vargani. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-3.5 pb-10 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#fae4da] p-4 shadow-xs border border-[#F0DFD5]">
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-[#6b0e03] tracking-tight leading-tight">
              Pay Vargani / Contribution
            </h1>
            <p className="text-xs text-[#57423e] mt-0.5">
              Contribute in a minute
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[#a23f1a] text-[22px]">volunteer_activism</span>
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
              Live UPI submissions and screenshot uploads require an internet connection. Please connect to Wi-Fi/Mobile Data to submit.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form Section: Contributor Details */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3.5 border border-[#F0DFD5]">
        <div>
          <h2 className="text-sm font-bold text-[#241913]">Donor Details</h2>
          <p className="text-xs text-[#6B5E57]">आपली माहिती भरा</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="contributor-name">
            Full Name *
          </label>
          <input
            className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
            id="contributor-name"
            placeholder="e.g. Rajesh Shinde"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="flat-no">
            Flat / House No.
          </label>
          <input
            className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all placeholder:text-[#8b716c]"
            id="flat-no"
            placeholder="e.g. B-402"
            type="text"
            value={wingFlat}
            onChange={(e) => setWingFlat(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <label className="text-xs font-semibold text-[#6B5E57]">
            Select Amount *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[501, 1001, 2100, 5001].map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <button
                  key={amt}
                  className={`rounded-xl py-2 px-2 border text-xs font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'border-[#8B2616] bg-[#8B2616] text-white shadow-xs'
                      : 'border-[#D9C4B7] bg-[#ffeae0] text-[#241913] hover:bg-[#fae4da]'
                  }`}
                  onClick={() => handlePresetClick(amt)}
                  type="button"
                >
                  <span>₹{amt.toLocaleString('en-IN')}</span>
                </button>
              );
            })}
          </div>
          <div className="relative flex items-center mt-1">
            <span className="absolute left-3.5 font-bold text-xs text-[#8B2616]">₹</span>
            <input
              className="w-full bg-white text-[#241913] border border-[#D9C4B7] rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-semibold focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] outline-none transition-all"
              id="custom-amount"
              placeholder="Custom amount"
              type="number"
              value={customAmount}
              onChange={handleCustomChange}
            />
          </div>
        </div>
      </div>

      {/* UPI QR & Payment */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3.5 border border-[#F0DFD5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#241913]">Pay via UPI</h2>
            <p className="text-xs text-[#6B5E57]">यूपीआय द्वारे वर्गणी जमा करा</p>
          </div>
          <span className="text-[11px] font-bold text-[#14553C] bg-[#EBF7F0] px-2.5 py-0.5 rounded-full border border-[#BDE5CE]">
            Instant
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <a
            className="rounded-xl py-2.5 px-2 bg-[#FFF8F6] border border-[#F0DFD5] flex flex-col items-center justify-center text-xs font-semibold text-[#241913] hover:bg-[#FFEAE0] active:scale-95 transition-all text-center"
            href={upiLinks.gpay}
          >
            <span className="truncate">GPay</span>
          </a>
          <a
            className="rounded-xl py-2.5 px-2 bg-[#FFF8F6] border border-[#F0DFD5] flex flex-col items-center justify-center text-xs font-semibold text-[#241913] hover:bg-[#FFEAE0] active:scale-95 transition-all text-center"
            href={upiLinks.phonepe}
          >
            <span className="truncate">PhonePe</span>
          </a>
          <a
            className="rounded-xl py-2.5 px-2 bg-[#FFF8F6] border border-[#F0DFD5] flex flex-col items-center justify-center text-xs font-semibold text-[#241913] hover:bg-[#FFEAE0] active:scale-95 transition-all text-center"
            href={upiLinks.standard}
          >
            <span className="truncate">BHIM UPI</span>
          </a>
        </div>

        {/* QR Box (Custom Uploaded QR or Dynamic SVG) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FFF1EB]/60 p-3 rounded-2xl border border-[#F0DFD5]">
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white p-1.5 border border-[#F0DFD5] flex items-center justify-center shadow-xs">
            {config.qrCodeUrl ? (
              <img
                src={config.qrCodeUrl}
                alt="Mandal Payment QR"
                className="w-full h-full object-contain"
              />
            ) : (
              <QRCodeSVG
                value={upiLinks.standard || `upi://pay?pa=${config.upiId || 'indrayanivihar@upi'}&pn=Indrayani+Vihar+Mitra+Mandal&am=${effectiveAmount}&cu=INR`}
                size={84}
                level="M"
              />
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0 text-center sm:text-left">
            <span className="text-xs text-[#8B2616] font-bold truncate">
              {config.upiId || 'indrayanivihar@upi'}
            </span>
            <p className="text-[11px] text-[#6B5E57] mt-0.5">
              स्कॅन करा किंवा UPI ID कॉपी करा
            </p>
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
              <button
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-[#241913] border border-[#D9C4B7] hover:bg-[#8B2616] hover:text-white transition-all cursor-pointer shadow-2xs"
                onClick={handleCopyVpa}
                type="button"
              >
                {copiedVpa ? 'Copied! ✓' : 'Copy UPI ID'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Screenshot Upload */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-xs gap-3 border border-[#F0DFD5]">
        <div>
          <h2 className="text-sm font-bold text-[#241913]">Upload Screenshot</h2>
          <p className="text-xs text-[#6B5E57]">पावती स्क्रीनशॉट</p>
        </div>

        <input
          accept="image/*"
          className="hidden"
          id="payment-screenshot-input"
          onChange={handleFileSelect}
          type="file"
        />

        <label
          className="rounded-xl border-2 border-dashed border-[#D9C4B7] bg-[#FFFBF7] p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white"
          htmlFor="payment-screenshot-input"
        >
          {!fileName ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B2616] text-[20px]">add_a_photo</span>
              <span className="text-xs font-bold text-[#241913]">Add Screenshot</span>
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
      </div>

      {/* Submit CTA */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          className="w-full rounded-xl py-3 bg-[#8B2616] text-white font-semibold text-xs shadow-xs hover:bg-[#731E11] active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          disabled={isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
          <span>{isSubmitting ? 'Submitting...' : 'Pay Vargani / Contribution'}</span>
        </button>
      </div>

      {/* Success Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#b1f0ce] text-[#002114] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#8B2616]">Vargani / Contribution Submitted</h3>
              <p className="text-xs text-[#6B5E57] mt-0.5">Receipt under verification</p>
            </div>

            <div className="w-full bg-[#FFF1EB] rounded-xl p-3 flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Receipt No:</span>
                <span className="font-bold text-[#241913]">{submittedReceiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Amount:</span>
                <span className="font-bold text-[#8B2616]">{formatCurrency(effectiveAmount)}</span>
              </div>
            </div>

            <button
              className="w-full py-2.5 bg-[#8B2616] text-white font-bold text-xs rounded-xl hover:bg-[#731E11] transition-all cursor-pointer"
              onClick={onNavigateHome}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
