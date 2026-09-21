import React, { useState, useMemo } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, buildWhatsAppShareUrl } from '../utils/formatters';
import { generateSingleReceiptPDF } from '../utils/pdfGenerator';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';

export function OrganiserVargani({ onOpenAddVargani, onOpenProof }) {
  const { vargani, config, updateVargani, deleteVargani, stats } = useMandalData();
  const { organizers } = useAuth();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'verified'
  const [searchQuery, setSearchQuery] = useState('');
  const [unverifyConfirmId, setUnverifyConfirmId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  // Organiser-wise vargani totals based on 'Paid To' / 'collectedBy' (active organisers with total > 0 only)
  const organiserVarganiTotals = useMemo(() => {
    const map = {};

    // Aggregate vargani per collector/paidTo (both organiser-entered and public online attributed during verification)
    (vargani || []).forEach((item) => {
      if (item.status === 'verified' || !item.status) {
        const collector = (item.collectedBy || item.paidTo || '').trim();
        if (collector && !['online portal', 'mandal', 'direct upi', 'self', 'portal'].includes(collector.toLowerCase())) {
          map[collector] = (map[collector] || 0) + (Number(item.amount) || 0);
        }
      }
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .filter(({ total }) => total > 0)
      .sort((a, b) => b.total - a.total);
  }, [vargani]);

  const filteredList = vargani.filter((item) => {
    if (activeFilter === 'pending' && item.status !== 'pending') return false;
    if (activeFilter === 'verified' && item.status !== 'verified') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.donorName || '').toLowerCase().includes(q);
      const matchCollector = (item.collectedBy || item.paidTo || '').toLowerCase().includes(q);
      const matchFlat = (item.wingFlat || item.address || '').toLowerCase().includes(q);
      const matchUtr = (item.utr || '').toLowerCase().includes(q);
      const matchReceipt = (item.receiptNo || '').toLowerCase().includes(q);
      return matchName || matchCollector || matchFlat || matchUtr || matchReceipt;
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

  const handleDelete = async () => {
    if (deleteConfirmItem) {
      await deleteVargani(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  const handleWhatsAppShare = (item) => {
    const msg = `🙏 *${config.name || 'इंद्रायणी विहार मित्र मंडळ'}* 🙏\n` +
      `🚩 *सार्वजनिक गणेशोत्सव २०२६ • अधिकृत पावती* 🚩\n\n` +
      `सस्नेह नमस्कार, *${item.donorName}*!\n\n` +
      `आपली वर्गणी यशस्वीरित्या प्राप्त झाली असून अधिकृत पावती मंजूर करण्यात आली आहे:\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📄 *पावती क्र (Receipt No):* ${item.receiptNo || 'IVMM-2026'}\n` +
      `💰 *वर्गणी रक्कम (Amount):* ${formatCurrency(item.amount)}\n` +
      `💳 *पेमेंट पद्धत (Mode):* ${item.mode || 'UPI'} (स्वीकृत / Verified)\n` +
      `📅 *दिनांक (Date):* ${formatDate(item.createdAt)}\n` +
      (item.collectedBy || item.paidTo ? `👤 *वर्गणी स्वीकारली (Paid To):* ${item.collectedBy || item.paidTo}\n` : '') +
      (item.wingFlat || item.address ? `🏠 *पत्ता (Address):* ${item.wingFlat || item.address}\n` : '') +
      (item.utr ? `🔢 *UTR / Ref No:* ${item.utr}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `मंडळाच्या उत्सवात आपले बहुमूल्य योगदान दिल्याबद्दल मनःपूर्वक धन्यवाद!\n` +
      `श्री गणपती बाप्पा आपल्या परिवारास सुख, समृद्धी आणि उत्तम आरोग्य देवो हीच प्रार्थना.\n\n` +
      `📍 *पत्ता:* ${config.location || 'Indrayani Vihar, Lohegaon, Pune'}\n` +
      `🌺 *गणपती बाप्पा मोरया!* 🌺`;

    const url = buildWhatsAppShareUrl(item.phone, msg);
    window.open(url, '_blank');
  };

  const handleVerifyAndShare = async (item) => {
    await updateVargani(item.id, { status: 'verified' });
    handleWhatsAppShare({ ...item, status: 'verified' });
  };

  const handleDownloadSinglePDF = (item) => {
    generateSingleReceiptPDF({
      mandalInfo: config,
      varganiItem: item
    });
  };

  return (
    <div className="flex flex-col w-full px-4 pb-20 max-w-xl mx-auto font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in space-y-6 sm:space-y-7">
      {/* Top Action Bar with live pending count & action buttons */}
      <div className="w-full pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6B5E57] font-semibold truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${stats.pendingCount > 0 ? 'bg-[#FD8359] animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="truncate">{stats.pendingCount > 0 ? `${stats.pendingCount} Pending Verification` : `${stats.verifiedCount} Donors Verified`}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsPaymentDetailsOpen(true)}
              title="Payment QR & UPI Settings"
              className="flex items-center justify-center gap-1 rounded-xl px-2.5 py-2 bg-white text-[#8B2616] font-bold text-xs border border-[#D9C4B7] shadow-2xs hover:bg-[#FAF6EE] active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>QR Details</span>
            </button>
            <button
              onClick={() => onOpenAddVargani && onOpenAddVargani(null)}
              className="flex items-center justify-center gap-1 rounded-xl px-3 py-2 bg-[#8B2616] text-white font-bold text-xs shadow-xs hover:bg-[#731E11] active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Vargani</span>
            </button>
          </div>
        </div>

        {/* Festive Total Collected Strip */}
        <div className="w-full rounded-2xl p-3.5 bg-white/95 border border-[#F0DFD5] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FD8359]/20 flex items-center justify-center text-[#6F2000] shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#241913]">{formatCurrency(stats.totalReceived)}</span>
              <span className="text-[11px] text-[#6B5E57]">Total Collected</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#14553c] text-[#8ac8a7] px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[13px]">trending_up</span> {stats.progressPercent}%
            </span>
            <span className="text-[11px] text-[#6B5E57] mt-0.5">{stats.verifiedCount} Donors</span>
          </div>
        </div>

        {/* Organiser-wise Collected Totals */}
        {organiserVarganiTotals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-1">
            {organiserVarganiTotals.map(({ name, total }) => (
              <div
                key={name}
                className="bg-white/95 border border-[#F0DFD5] rounded-xl px-3 py-2 shadow-2xs flex items-center justify-between gap-2"
              >
                <span className="text-xs font-semibold text-[#241913] truncate" title={name}>
                  {name}
                </span>
                <span className="text-xs font-bold text-[#6b0e03] shrink-0">
                  {formatCurrency(total)}
                </span>
              </div>
            ))}
          </div>
        )}
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
          <span>All</span>
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
          <span>Pending</span>
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
          <span>Verified</span>
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
            placeholder="Search by donor, paid to, receipt / नाव किंवा कार्यकर्ता शोधा..."
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
            const collectorName = item.collectedBy || item.paidTo;

            return (
              <div
                key={item.id}
                className="w-full rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-2.5 relative hover:shadow-sm transition-shadow"
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
                        {collectorName && (
                          <span className="bg-[#FFF1EB] text-[#8B2616] border border-[#F0DFD5] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">how_to_reg</span>
                            <span>Paid To: {collectorName}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B5E57] mt-1 flex-wrap">
                        <span>{item.mode || 'UPI Transfer'}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.lastEditedAt && (
                          <span className="text-[10px] text-[#A23F1A] bg-[#FFEAE0] px-1.5 py-0.2 rounded font-medium">
                            Edited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-bold text-[#6b0e03]">
                      {formatCurrency(item.amount)}
                    </span>
                    {isVerified ? (
                      <span className="text-[11px] text-[#003d28] font-bold flex items-center gap-0.5 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> स्वीकृत
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#FD8359]/20 text-[#6f2000] font-bold px-1.5 py-0.5 rounded mt-0.5">
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
                          <span>View Proof</span>
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
                          <span className="text-[11px] text-[#6B5E57]">Mobile Screenshot</span>
                          <span className="text-[11px] text-[#003d28] flex items-center gap-1 mt-0.5 font-medium">
                            <span className="material-symbols-outlined text-[13px]">verified</span> QR Scanned Payment
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-1">
                      {item.phone && item.phone.trim() ? (
                        <>
                          <button
                            onClick={() => handleVerifyAndShare(item)}
                            className="w-full rounded-xl py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144A18] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            <span>Verify &amp; Share on WhatsApp</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleVerify(item.id)}
                              className="rounded-xl py-2 px-3 bg-[#003d28] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Verify Only</span>
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(item)}
                              className="rounded-xl py-2 px-3 border border-[#D9C4B7] bg-white text-[#8B2616] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat</span>
                              <span>WhatsApp Contact</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleVerify(item.id)}
                          className="w-full rounded-xl py-2.5 px-3 bg-[#003d28] hover:bg-[#002b1c] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span>Verify Entry</span>
                        </button>
                      )}

                      {/* Edit and Delete Actions for Pending Items */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F0DFD5]/60">
                        <button
                          onClick={() => onOpenAddVargani && onOpenAddVargani(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#8B2616] hover:bg-[#FFEAE0] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          type="button"
                          title="Edit Vargani entry"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          type="button"
                          title="Delete Vargani entry"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Verified Receipt Footer Details */
                  <div className="pt-2 border-t border-[#F0DFD5] bg-[#fff1eb]/60 px-3 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[#6b0e03] text-[16px] shrink-0">receipt</span>
                      <span className="text-xs text-[#6B5E57] truncate">
                        पावती क्र: <strong className="text-[#241913] font-bold">{item.receiptNo}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto flex-wrap">
                      {item.phone && item.phone.trim() && (
                        <button
                          onClick={() => handleWhatsAppShare(item)}
                          className="h-8 px-2.5 sm:px-3 flex items-center gap-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          type="button"
                          title="Share official receipt on WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[16px]">share</span>
                          <span>Share Receipt</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadSinglePDF(item)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#241913] hover:bg-[#ffeae0] rounded-lg text-xs transition-colors cursor-pointer"
                        title="Download PDF"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                      </button>

                      <button
                        onClick={() => onOpenAddVargani && onOpenAddVargani(item)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#8B2616] hover:bg-[#FFEAE0] rounded-lg text-xs transition-colors cursor-pointer"
                        title="Edit entry"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#6B5E57] hover:text-red-600 hover:bg-red-50 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Delete entry"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>

                      {unverifyConfirmId === item.id ? (
                        <button
                          onClick={() => handleUnverify(item.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Confirm Un-verify"
                        >
                          Confirm Un-verify
                        </button>
                      ) : (
                        <button
                          onClick={() => setUnverifyConfirmId(item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-[#D9C4B7] text-[#6B5E57] hover:text-amber-700 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Un-verify to Pending"
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
      <div className="w-full bg-[#ffeae0] p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs border border-[#F0DFD5]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-2xs shrink-0 text-[#6b0e03]">
            <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-xs font-bold text-[#6b0e03] leading-tight truncate">मंडळाचा अधिकृत UPI QR</h3>
            <span className="text-[11px] text-[#6B5E57] truncate">सोसायटी नोटीस बोर्डासाठी प्रिंट करा</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaymentDetailsOpen(true)}
            className="flex-1 sm:flex-initial py-2 px-3 bg-white border border-[#D9C4B7] text-[#6b0e03] rounded-xl text-xs font-bold hover:bg-[#FAF6EE] transition-all cursor-pointer text-center"
          >
            Manage QR
          </button>
          <a
            href="/assets/mandal_qr_final.png"
            download="Indrayani_Mandal_UPI_QR.png"
            className="flex-1 sm:flex-initial py-2 px-3 bg-[#6b0e03] hover:bg-[#8b2616] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-center"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Payment QR and UPI Settings Modal */}
      <PaymentDetailsModal
        isOpen={isPaymentDetailsOpen}
        onClose={() => setIsPaymentDetailsOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-red-100 flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#241913]">Delete Vargani Entry?</h4>
                <p className="text-xs text-[#6B5E57]">वर्गणी नोंद कायमची हटवायची आहे का?</p>
              </div>
            </div>

            <div className="bg-[#FFF8F6] p-3 rounded-2xl border border-[#F0DFD5] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Donor Name:</span>
                <span className="font-bold text-[#241913]">{deleteConfirmItem.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5E57]">Amount:</span>
                <span className="font-bold text-[#8B2616]">{formatCurrency(deleteConfirmItem.amount)}</span>
              </div>
              {deleteConfirmItem.receiptNo && (
                <div className="flex justify-between">
                  <span className="text-[#6B5E57]">Receipt:</span>
                  <span className="font-mono text-[#241913]">{deleteConfirmItem.receiptNo}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-red-700 font-medium">
              Delete this entry? This can't be undone. Total Collected will be recalculated immediately.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="py-2.5 px-4 rounded-xl border border-[#D9C4B7] bg-white text-[#241913] text-xs font-bold hover:bg-[#FAF4ED] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
