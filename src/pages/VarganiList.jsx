import React, { useState, useMemo } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate, buildWhatsAppShareUrl } from '../utils/formatters';
import { exportVarganiToCSV } from '../utils/csvExport';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Receipt, 
  MessageCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Phone,
  MapPin
} from 'lucide-react';

export function VarganiList({ onOpenAddVargani, onOpenReceipt, onEditVargani }) {
  const { vargani, deleteVargani, config } = useMandalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredVargani = useMemo(() => {
    return vargani.filter((item) => {
      const matchSearch =
        (item.donorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.phone || '').includes(searchQuery) ||
        (item.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.address || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchMode = selectedMode === 'All' || item.mode === selectedMode;
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchSearch && matchMode && matchStatus;
    });
  }, [vargani, searchQuery, selectedMode, selectedStatus]);

  const totalFilteredAmount = useMemo(() => {
    return filteredVargani.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredVargani]);

  const handleQuickWhatsApp = (item, e) => {
    e.stopPropagation();
    const message = `🙏 *${config?.name || 'श्री गणेश उत्सव मंडळ'}* 🙏\n` +
      `*अधिकृत वर्गणी पावती*\n` +
      `👤 *नाव:* ${item.donorName}\n` +
      `📄 *पावती क्र:* ${item.receiptNo}\n` +
      `💰 *रक्कम:* ${formatCurrency(item.amount)}\n` +
      `💳 *माध्यम:* ${item.mode} (${item.status})\n` +
      `📅 *तारीख:* ${formatDate(item.createdAt)}\n` +
      `मंडळाच्या उत्सवात आपले बहुमूल्य योगदान दिल्याबद्दल धन्यवाद! गणपती बाप्पा मोरया! 🌺`;

    const url = buildWhatsAppShareUrl(item.phone, message);
    window.open(url, '_blank');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this vargani record?')) {
      deleteVargani(id);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-400" /> Vargani Records (वर्गणी यादी)
          </h2>
          <p className="text-xs text-slate-400">
            Total {filteredVargani.length} records • Total: <strong className="text-emerald-400">{formatCurrency(totalFilteredAmount)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportVarganiToCSV(filteredVargani, config?.name)}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            title="Download CSV for Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export CSV
          </button>

          <button
            onClick={onOpenAddVargani}
            className="btn-saffron py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> + Add Vargani
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-3 sm:p-4 bg-slate-900/80 border-white/10 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Donor Name, Mobile, Flat No, or Receipt No..."
            className="input-field pl-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Mode Chips */}
          {['All', 'Cash', 'UPI', 'Cheque', 'Bank Transfer'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                selectedMode === mode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/15'
              }`}
            >
              {mode}
            </button>
          ))}

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Status Chips */}
          {['All', 'Received', 'Promised'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                selectedStatus === status
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/15'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Vargani List Items */}
      <div className="space-y-2.5">
        {filteredVargani.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs">
            <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No contributions matching your search filters.
          </div>
        ) : (
          filteredVargani.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenReceipt(item)}
              className="glass-card p-4 bg-slate-900/70 hover:bg-slate-800/80 border-white/10 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Column */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-white/5">
                    {item.receiptNo}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                    {item.donorName}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'Received' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
                  {item.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {item.address}
                    </span>
                  )}
                  {item.phone && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3 h-3 text-slate-500" /> {item.phone}
                    </span>
                  )}
                  <span className="text-slate-500">•</span>
                  <span>{formatDate(item.createdAt)}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-slate-300">{item.mode}</span>
                </div>
              </div>

              {/* Right Column: Amount & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-lg font-black text-emerald-400 block">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    By {item.collectedBy || 'Organiser'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleQuickWhatsApp(item, e)}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                    title="Send WhatsApp Receipt"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReceipt(item);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                    title="View Digital Receipt"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>

                  {onEditVargani && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditVargani(item);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
