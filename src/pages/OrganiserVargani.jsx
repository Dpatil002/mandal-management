import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate, buildWhatsAppShareUrl } from '../utils/formatters';
import { generateSingleReceiptPDF } from '../utils/pdfGenerator';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';

export function OrganiserVargani({ onOpenAddVargani, onOpenProof }) {
  const { vargani, config, updateVargani, deleteVargani, stats } = useMandalData();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'verified'
  const [searchQuery, setSearchQuery] = useState('');
  const [unverifyConfirmId, setUnverifyConfirmId] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  const filteredList = vargani.filter((item) => {
    if (activeFilter === 'pending' && item.status !== 'pending') return false;
    if (activeFilter === 'verified' && item.status !== 'verified') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.donorName || '').toLowerCase().includes(q);
      const matchFlat = (item.wingFlat || item.address || '').toLowerCase().includes(q);
      const matchUtr = (item.utr || '').toLowerCase().includes(q);
      const matchReceipt = (item.receiptNo || '').toLowerCase().includes(q);
      return matchName || matchFlat || matchUtr || matchReceipt;
    }

    return true;
  });

  const handleVerify = async (id) => {
    await updateVargani(id, { status: 'verified' });
  };

  const handleUnverify = async (id) => {
    await updateVargani(id, { status: 'pending' });
    setUnverifyConfirmId(null);
  };

  const handleWhatsAppShare = (item) => {
    const msg = `🚩 *इंद्रायणी विहार मित्र मंडळ - गणेशोत्सव २०२६* 🚩\n\nसस्नेह नमस्कार, *${item.donorName}*!\nआपली *${formatCurrency(item.amount)}* वर्गणी यशस्वीरित्या प्राप्त झाली असून पावती क्र. *${item.receiptNo}* नोंदवली गेली आहे.\n\nमंडळाच्या वतीने आपले मनःपूर्वक आभार! गणपती बाप्पा आपल्या परिवारास सुख, समृद्धी आणि उत्तम आरोग्य देवो हीच श्रींच्या चरणी प्रार्थना.\n\n📍 *पत्ता:* ${config.location}\n🙏 *गणपती बाप्पा मोरया!*`;
    const url = buildWhatsAppShareUrl(item.phone, msg);
    window.open(url, '_blank');
  };

  const handleDownloadSinglePDF = (item) => {
    generateSingleReceiptPDF({
      mandalInfo: config,
      varganiItem: item
    });
  };

  return (
    <div className="flex flex-col w-full px-4 pb-20 max-w-xl mx-auto font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in space-y-4">
      {/* Top Stats Bar & Quick Add Banner */}
      <div className="w-full pt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h2 className="text-xl font-bold text-[#8B2616] truncate">Vargani Records</h2>
            <span className="text-xs text-[#6B5E57]">वर्गणी नोंदवही २०२६</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPaymentDetailsOpen(true)}
              title="Payment QR & Bank Details"
              className="flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 bg-white text-[#8B2616] font-bold text-xs border border-[#D9C4B7] shadow-2xs hover:bg-[#FAF6EE] active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
              <span className="hidden sm:inline">Payment Details</span>
              <span className="sm:hidden">QR / Bank</span>
            </button>
            <button
              onClick={onOpenAddVargani}
              className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 bg-[#8B2616] text-white font-semibold text-xs shadow-xs hover:bg-[#731E11] active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span className="whitespace-nowrap">Add Vargani</span>
            </button>
          </div>
        </div>

        {/* Festive Total Collected Strip */}
        <div className="w-full rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FD8359]/20 flex items-center justify-center text-[#6F2000] shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#241913]">{formatCurrency(stats.totalReceived)}</span>
              <span className="text-xs text-[#6B5E57]">Total Collected</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#14553c] text-[#8ac8a7] px-2.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> {stats.progressPercent}%
            </span>
            <span className="text-xs text-[#6B5E57] mt-0.5">{stats.verifiedCount} Donors</span>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="w-full flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'border border-[#8B2616] bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#fae4da]'
          }`}
          type="button"
        >
          <span>सर्व नोंदी</span>
          <span className={`${activeFilter === 'all' ? 'bg-white/20' : 'bg-[#fae4da] text-[#241913]'} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
            {vargani.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'pending'
              ? 'border border-[#8B2616] bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#fae4da]'
          }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-[#FD8359] animate-pulse"></span>
          <span>प्रलंबित पडताळणी</span>
          <span className={`${activeFilter === 'pending' ? 'bg-white/20' : 'bg-[#FD8359]/30 text-[#6F2000]'} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
            {stats.pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('verified')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'verified'
              ? 'border border-[#8B2616] bg-[#8B2616] text-white shadow-sm'
              : 'border border-[#D9C4B7] bg-white text-[#6B5E57] hover:bg-[#fae4da]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
          <span>मंजूर पावती</span>
          <span className={`${activeFilter === 'verified' ? 'bg-white/20' : 'bg-[#b1f0ce] text-[#002114]'} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
            {stats.verifiedCount}
          </span>
        </button>
      </div>

      {/* Search Input & Count */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#6B5E57]/70 pointer-events-none">
            search
          </span>
          <input
            id="vargani-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by donor name / नाव किंवा पावती क्र. शोधा..."
            className="w-full pl-10 pr-9 py-2.5 bg-white/90 border border-[#D9C4B7] rounded-xl text-xs text-[#241913] placeholder:text-[#6B5E57]/70 focus:outline-none focus:border-[#6b0e03] shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              type="button"
              className="absolute right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#6B5E57] hover:bg-[#ffeae0] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-[#6B5E57]">
            Showing {filteredList.length} records / {filteredList.length} नोंदी दर्शवित आहे
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-3 w-full">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white/95 rounded-2xl border border-[#F0DFD5] text-xs text-[#6B5E57]">
            <span className="material-symbols-outlined text-[36px] text-[#D9C4B7] mb-2">receipt_long</span>
            <p className="font-bold text-[#241913]">कोणतीही वर्गणी नोंद सापडली नाही</p>
            <p className="mt-1">नवीन नोंद करण्यासाठी वरील '+ वर्गणी जोडा' बटण वापरा.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isVerified = item.status === 'verified';
            return (
              <div
                key={item.id}
                className="w-full rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-2.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        isVerified ? 'bg-[#b1f0ce] text-[#002114]' : 'bg-[#fae4da] text-[#6b0e03]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isVerified ? 'verified_user' : 'person'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#241913] leading-tight truncate">
                          {item.donorName}
                        </span>
                        <span className="bg-[#ffeae0] text-[#57423e] text-[11px] font-bold px-2 py-0.5 rounded">
                          {item.wingFlat || item.address || 'सदनिका'}
                        </span>
                      </div>
                      <span className="text-xs text-[#6B5E57] mt-0.5">
                        {item.mode || 'UPI Transfer'} • {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-bold text-[#6b0e03]">
                      {formatCurrency(item.amount)}
                    </span>
                    {isVerified ? (
                      <span className="text-[11px] text-[#003d28] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> स्वीकृत
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#FD8359]/20 text-[#6f2000] font-bold px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Proof / Pending Box */}
                {!isVerified ? (
                  <div className="bg-[#fff1eb] rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6B5E57] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span> UTR / Ref:{' '}
                        <strong className="text-[#241913] font-semibold">{item.utr || 'UPI-Direct'}</strong>
                      </span>
                      {item.screenshotUrl && (
                        <button
                          onClick={() => onOpenProof(item.screenshotUrl, `Payment Proof - ${item.donorName}`)}
                          className="text-xs text-[#a23f1a] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                          type="button"
                        >
                          <span>मोठी पावती पाहा</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                      )}
                    </div>

                    {item.screenshotUrl && (
                      <div
                        onClick={() => onOpenProof(item.screenshotUrl, `Payment Proof - ${item.donorName}`)}
                        className="flex items-center gap-2.5 bg-white p-2 rounded-lg shadow-2xs cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0 relative">
                          <img className="w-full h-full object-cover" src={item.screenshotUrl} alt="Proof thumbnail" />
                          <div className="absolute inset-0 bg-[#6b0e03]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[18px]">zoom_in</span>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs text-[#241913] font-bold truncate">Receipt_Proof.png</span>
                          <span className="text-[11px] text-[#6B5E57]">मोबाईल स्क्रीनशॉट पडताळणी</span>
                          <span className="text-[11px] text-[#003d28] flex items-center gap-1 mt-0.5 font-medium">
                            <span className="material-symbols-outlined text-[13px]">verified</span> QR स्कॅन करून जमा
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => handleVerify(item.id)}
                        className="rounded-xl py-2 px-3 bg-[#003d28] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>मान्य करा (Verify)</span>
                      </button>
                      <button
                        onClick={() => handleWhatsAppShare(item)}
                        className="rounded-xl py-2 px-3 border border-[#D9C4B7] bg-white text-[#8B2616] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>संपर्क साधा</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Verified Receipt Footer Details */
                  <div className="pt-2 border-t border-[#F0DFD5] bg-[#fff1eb]/60 px-3 py-2 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#6b0e03] text-[18px]">receipt</span>
                      <span className="text-xs text-[#6B5E57] font-medium">
                        ई-पावती क्र: <strong className="text-[#241913]">{item.receiptNo}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWhatsAppShare(item)}
                        className="h-8 px-3 flex items-center gap-1 bg-white border border-[#D9C4B7] text-[#6b0e03] hover:bg-[#ffeae0] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">share</span>
                        <span>WhatsApp पावती</span>
                      </button>

                      <button
                        onClick={() => handleDownloadSinglePDF(item)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#241913] hover:bg-[#ffeae0] rounded-lg text-xs transition-colors cursor-pointer"
                        title="Download PDF"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                      </button>

                      {unverifyConfirmId === item.id ? (
                        <button
                          onClick={() => handleUnverify(item.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold"
                          title="Confirm Un-verify"
                        >
                          Unverify
                        </button>
                      ) : (
                        <button
                          onClick={() => setUnverifyConfirmId(item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#6B5E57] hover:text-red-600 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Un-verify"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[15px]">undo</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Official UPI QR Standee Banner */}
      <div className="w-full bg-[#ffeae0] p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs border border-[#F0DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-2xs shrink-0 text-[#6b0e03]">
            <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#6b0e03] leading-tight">मंडळाचा अधिकृत UPI QR</h3>
            <span className="text-xs text-[#6B5E57]">सोसायटी नोटीस बोर्ड व प्रवेशद्वारावर लावण्यासाठी प्रिंट करा</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaymentDetailsOpen(true)}
            className="py-2 px-3 bg-white border border-[#D9C4B7] text-[#6b0e03] rounded-xl text-xs font-bold hover:bg-[#FAF6EE] transition-all cursor-pointer"
          >
            बदला / Manage
          </button>
          <a
            href="/assets/mandal_qr_final.png"
            download="Indrayani_Mandal_UPI_QR.png"
            className="py-2 px-3 bg-[#6b0e03] hover:bg-[#8b2616] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>QR डाऊनलोड</span>
          </a>
        </div>
      </div>

      {/* Payment QR and Bank Details Modal */}
      <PaymentDetailsModal
        isOpen={isPaymentDetailsOpen}
        onClose={() => setIsPaymentDetailsOpen(false)}
      />
    </div>
  );
}

