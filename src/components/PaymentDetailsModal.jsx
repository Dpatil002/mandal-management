import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMandalData } from '../context/MandalDataContext';

export function PaymentDetailsModal({ isOpen, onClose }) {
  const { config, updateMandalConfig } = useMandalData();

  const [formData, setFormData] = useState({
    upiId: config.upiId || 'indrayanivihar@upi',
    qrCodeUrl: config.qrCodeUrl || '',
    bankName: config.bankName || '',
    bankAccountName: config.bankAccountName || '',
    bankAccountNumber: config.bankAccountNumber || '',
    bankIfsc: config.bankIfsc || ''
  });

  const [previewQr, setPreviewQr] = useState(config.qrCodeUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        upiId: config.upiId || 'indrayanivihar@upi',
        qrCodeUrl: config.qrCodeUrl || '',
        bankName: config.bankName || '',
        bankAccountName: config.bankAccountName || '',
        bankAccountNumber: config.bankAccountNumber || '',
        bankIfsc: config.bankIfsc || ''
      });
      setPreviewQr(config.qrCodeUrl || '');
      setSaveSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleQrFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit size to 1.5MB for snappy Firestore sync
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage('QR image size should be under 1.5 MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewQr(reader.result);
      setFormData((prev) => ({ ...prev, qrCodeUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetToUpi = () => {
    setPreviewQr('');
    setFormData((prev) => ({ ...prev, qrCodeUrl: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.upiId.trim()) {
      setErrorMessage('Please enter a valid UPI ID (e.g. mandal@upi).');
      return;
    }

    updateMandalConfig({
      upiId: formData.upiId.trim(),
      qrCodeUrl: formData.qrCodeUrl,
      bankName: formData.bankName.trim(),
      bankAccountName: formData.bankAccountName.trim(),
      bankAccountNumber: formData.bankAccountNumber.trim(),
      bankIfsc: formData.bankIfsc.trim().toUpperCase()
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Plus_Jakarta_Sans','Mukta',sans-serif]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFF8F6] border border-[#F0DFD5] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0DFD5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] text-[#8B2616] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#8B2616] leading-tight">Payment &amp; Bank Details</h3>
              <p className="text-[11px] text-[#6B5E57]">पेमेंट QR कोड व बँक तपशील</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-[#FFF1EB] border border-[#F0DFD5] flex items-center justify-center text-[#6B5E57] hover:text-[#8B2616] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3.5 space-y-4">
          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>Payment &amp; Bank details updated live!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Payment QR Code */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#241913] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#8B2616] text-[16px]">photo_camera</span>
                <span>Payment QR Code Image</span>
              </h4>
              {previewQr && (
                <button
                  type="button"
                  onClick={handleResetToUpi}
                  className="text-[11px] text-[#8B2616] hover:underline font-semibold"
                >
                  Reset to UPI QR
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-20 h-20 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                {previewQr ? (
                  <img
                    src={previewQr}
                    alt="Payment QR Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QRCodeSVG
                    value={`upi://pay?pa=${formData.upiId || 'indrayanivihar@upi'}&pn=Indrayani+Vihar+Mitra+Mandal&cu=INR`}
                    size={70}
                    level="M"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <p className="text-[11px] text-[#6B5E57] leading-tight">
                  {previewQr
                    ? 'Custom scanner image will be shown to donors on the Pay Vargani screen.'
                    : 'Auto-generated dynamic QR from Mandal UPI ID.'}
                </p>

                <input
                  id="qr-image-uploader"
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="qr-image-uploader"
                  className="w-fit py-1.5 px-3 bg-[#FFF1EB] border border-[#F0DFD5] hover:bg-[#FFEAE0] text-[#8B2616] text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>{previewQr ? 'Replace QR' : 'Upload QR Image'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: UPI ID */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-2">
            <label className="block text-xs font-bold text-[#241913]" htmlFor="modal-upi-id">
              Official Mandal UPI ID (VPA) *
            </label>
            <input
              id="modal-upi-id"
              type="text"
              required
              placeholder="e.g. indrayanivihar@sbi"
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              className="w-full bg-[#FFF8F6] text-[#8B2616] font-mono font-bold border border-[#DECDB9] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:outline-none"
            />
          </div>

          {/* Section 3: Bank Details (Fallback for Public) */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#241913] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#8B2616] text-[16px]">account_balance</span>
                <span>Bank Account Details (बँक तपशील)</span>
              </h4>
              <p className="text-[10.5px] text-[#6B5E57] mt-0.5">
                Shown to donors on the Public Pay screen as a fallback option
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B5E57] mb-1">
                  Bank &amp; Branch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India, Lohegaon"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#DECDB9] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:outline-none placeholder:text-[#6B5E57]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B5E57] mb-1">
                  Account Name (खातेदाराचे नाव)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indrayani Vihar Mitra Mandal"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#DECDB9] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:outline-none placeholder:text-[#6B5E57]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B5E57] mb-1">
                    Account Number (खाते क्र.)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789012"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full bg-[#FFF8F6] text-[#241913] font-mono border border-[#DECDB9] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:outline-none placeholder:text-[#6B5E57]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B5E57] mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                    className="w-full bg-[#FFF8F6] text-[#241913] font-mono uppercase border border-[#DECDB9] rounded-xl px-3 py-2 text-xs focus:border-[#8B2616] focus:outline-none placeholder:text-[#6B5E57]/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#8B2616] text-white font-bold text-xs rounded-xl hover:bg-[#731E11] transition-all cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save &amp; Update Public View</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-[#FFF1EB] border border-[#F0DFD5] text-[#6B5E57] font-semibold text-xs rounded-xl hover:bg-[#FFEAE0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
