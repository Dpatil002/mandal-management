import React from 'react';
import { X, Download, Share2, Printer, CheckCircle2, MessageCircle, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate, buildWhatsAppShareUrl } from '../utils/formatters';
import { generateSingleReceiptPDF } from '../utils/pdfGenerator';
import { useMandalData } from '../context/MandalDataContext';

export function ReceiptModal({ isOpen, onClose, varganiItem }) {
  const { config } = useMandalData();

  if (!isOpen || !varganiItem) return null;

  const handleDownloadPDF = () => {
    generateSingleReceiptPDF({
      mandalInfo: config,
      varganiItem
    });
  };

  const handleWhatsAppShare = () => {
    const message = `🙏 *${config?.name || 'श्री गणेश उत्सव मंडळ'}* 🙏\n` +
      `*अधिकृत वर्गणी पावती (Official Vargani Receipt)*\n\n` +
      `👤 *नाव (Name):* ${varganiItem.donorName}\n` +
      `📄 *पावती क्र (Receipt No):* ${varganiItem.receiptNo}\n` +
      `💰 *रक्कम (Amount):* ${formatCurrency(varganiItem.amount)}\n` +
      `💳 *पेमेंट मोड (Mode):* ${varganiItem.mode} (${varganiItem.status})\n` +
      `📅 *तारीख (Date):* ${formatDate(varganiItem.createdAt)}\n` +
      `📍 *पत्ता (Address):* ${varganiItem.address || '-'}\n` +
      `✍️ *स्वीकारकर्ता (Collected By):* ${varganiItem.collectedBy || 'Organiser'}\n\n` +
      `मंडळाच्या उत्सवात आपले बहुमूल्य योगदान दिल्याबद्दल धन्यवाद! गणपती बाप्पा मोरया! 🌺`;

    const url = buildWhatsAppShareUrl(varganiItem.phone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Donation Receipt / पावती</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Card Body */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 relative overflow-hidden shadow-xl">
          {/* Festive Watermark / Accent Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          
          <div className="text-center pb-3 border-b border-white/10">
            <h4 className="text-base font-black text-amber-400 tracking-tight">
              {config?.name || 'श्री गणेश उत्सव मंडळ'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{config?.location}</p>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
              वर्ष {config?.year || 2026}
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Receipt No:</span>
              <span className="font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded">
                {varganiItem.receiptNo}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Date:</span>
              <span className="font-semibold">{formatDate(varganiItem.createdAt)}</span>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-slate-400 block text-[11px]">Received with thanks from:</span>
              <h5 className="text-sm font-bold text-white mt-0.5">{varganiItem.donorName}</h5>
              {varganiItem.address && (
                <p className="text-slate-400 text-xs mt-0.5">{varganiItem.address}</p>
              )}
              {varganiItem.phone && (
                <p className="text-slate-400 text-xs">Ph: {varganiItem.phone}</p>
              )}
            </div>

            {/* Highlighted Amount */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Contribution Amount
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(varganiItem.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Payment Mode</span>
                <span className="text-xs font-bold text-slate-200">{varganiItem.mode}</span>
              </div>
            </div>

            {varganiItem.notes && (
              <div className="text-slate-400 text-[11px] italic bg-slate-900/60 p-2 rounded-lg">
                "{varganiItem.notes}"
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-white/5">
              <span>Collected By: <strong className="text-slate-200">{varganiItem.collectedBy || 'Organiser'}</strong></span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                varganiItem.status === 'Received' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {varganiItem.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`mt-5 ${varganiItem.phone && varganiItem.phone.trim() ? 'grid grid-cols-2 gap-2.5' : 'flex justify-center'}`}>
          {varganiItem.phone && varganiItem.phone.trim() && (
            <button
              onClick={handleWhatsAppShare}
              className="btn-saffron py-2.5 px-3 text-xs bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-900/30"
            >
              <MessageCircle className="w-4 h-4" /> Share on WhatsApp
            </button>
          )}
          
          <button
            onClick={handleDownloadPDF}
            className={`btn-secondary py-2.5 px-3 text-xs ${!varganiItem.phone || !varganiItem.phone.trim() ? 'w-full' : ''}`}
          >
            <Download className="w-4 h-4" /> Download PDF Slip
          </button>
        </div>
      </div>
    </div>
  );
}
