import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { generateMandalStatementPDF } from '../utils/pdfGenerator';
import { exportVarganiToCSV, exportExpensesToCSV, exportDholMaintenanceToCSV } from '../utils/csvExport';

export function ReportModal({ isOpen, onClose }) {
  const { config, vargani, expenses, dholMaintenance, stats } = useMandalData();

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    generateMandalStatementPDF({
      mandalInfo: config,
      varganiList: vargani,
      expenseList: expenses,
      stats
    });
  };

  const handleExportVarganiCSV = () => {
    exportVarganiToCSV(vargani, config.name);
  };

  const handleExportExpensesCSV = () => {
    exportExpensesToCSV(expenses, config.name);
  };

  const handleExportDholCSV = () => {
    exportDholMaintenanceToCSV(dholMaintenance, config.name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      <div
        className="w-full max-w-md bg-[#FFF8F6] border border-[#F0DFD5] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0DFD5]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B2616] text-[22px]">description</span>
            <h3 className="text-sm font-bold text-[#241913]">हिशोब व अहवाल (Reports & Audit)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#57423E] hover:text-[#241913] hover:bg-[#FFF1EB] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5 mt-3.5">
          {/* PDF Audit Statement */}
          <button
            onClick={handleDownloadPDF}
            className="w-full p-3.5 rounded-xl bg-[#8B2616] text-white flex items-center justify-between hover:bg-[#731E11] active:scale-[0.99] transition-all shadow-md group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#FFA391]">picture_as_pdf</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold">Audit Statement (PDF)</h4>
                <p className="text-[11px] text-[#FFA391]">हिशोब पत्रक • Full Balance Sheet</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
              download
            </span>
          </button>

          {/* Vargani CSV / Google Sheets */}
          <button
            onClick={handleExportVarganiCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#14553C]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#14553C]">table_chart</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">Vargani Register (CSV)</h4>
                <p className="text-[11px] text-[#57423E]">देणगी यादी • {vargani.length} Donors</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>

          {/* Expenses CSV */}
          <button
            onClick={handleExportExpensesCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#A23F1A]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#A23F1A]">receipt_long</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">Expense Ledger (CSV)</h4>
                <p className="text-[11px] text-[#57423E]">खर्च नोंदी • {expenses.length} Expenses</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>

          {/* Dhol Tasha CSV */}
          <button
            onClick={handleExportDholCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#8B2616]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#8B2616]">music_note</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">Dhol Tasha Sheet (CSV)</h4>
                <p className="text-[11px] text-[#57423E]">वाद्य दुरुस्ती • {dholMaintenance.length} Records</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>
        </div>

        <div className="mt-4 pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#57423E] hover:text-[#241913] py-2 px-5 rounded-lg hover:bg-[#FFF1EB] transition-colors"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
