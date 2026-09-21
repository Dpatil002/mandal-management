import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ArrowUpRight, ShieldCheck, IndianRupee } from 'lucide-react';
import { formatCurrency, buildUpiString } from '../utils/formatters';

export function UpiQrModal({ isOpen, onClose, mandalConfig, defaultAmount = '' }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [donorNote, setDonorNote] = useState('Mandal Vargani & Seva');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiId = mandalConfig?.upiId || '9673909460@ybl';
  const mandalName = mandalConfig?.name || 'Indrayani Vihar Mitra Mandal';
  const qrImage = mandalConfig?.qrCodeUrl || '/payment-qr.png';

  const upiUrl = buildUpiString({
    vpa: upiId,
    payeeName: mandalName,
    amount: amount,
    transactionNote: donorNote
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAmounts = [251, 501, 1001, 2100, 5001];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instant UPI Donation QR</h3>
              <p className="text-xs text-slate-400">Scan using GPay, PhonePe, Paytm, or BHIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Amount Selector */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select or Enter Amount (₹)
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex-shrink-0 ${
                  Number(amount) === preset
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom Amount (e.g. 500)"
              className="input-field pl-10 text-base font-bold"
            />
          </div>
        </div>

        {/* QR Code Card */}
        <div className="mt-5 p-5 rounded-2xl bg-white flex flex-col items-center justify-center text-slate-900 shadow-2xl relative overflow-hidden">
          <div className="w-full text-center pb-2 border-b border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Mandal QR</p>
            <h4 className="text-sm font-black text-slate-900 truncate px-2">{mandalName}</h4>
          </div>

          <div className="py-3 flex items-center justify-center">
            {qrImage ? (
              <img
                src={qrImage}
                alt="Official Mandal Payment QR"
                className="w-48 h-48 object-contain rounded-xl border border-slate-200 shadow-inner"
              />
            ) : (
              <QRCodeSVG
                value={upiUrl}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#0F172A"
              />
            )}
          </div>

          {amount && Number(amount) > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-amber-800 text-xs font-black">
              Requested Amount: {formatCurrency(amount)}
            </div>
          )}

          <div className="w-full text-center pt-2 mt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Direct Mandal Bank UPI
          </div>
        </div>

        {/* Copy UPI ID */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/10">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Mandal UPI VPA</p>
            <p className="text-xs font-bold text-amber-400 font-mono truncate">{upiId}</p>
          </div>
          <button
            onClick={handleCopyUpi}
            className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy ID
              </>
            )}
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <a
            href={upiUrl}
            className="btn-saffron w-full text-center"
          >
            Open Installed UPI App <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
