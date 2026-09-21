import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { generateMandalStatementPDF } from '../utils/pdfGenerator';
import { exportVarganiToCSV, exportExpensesToCSV, exportDholMaintenanceToCSV } from '../utils/csvExport';

export function ReportModal({ isOpen, onClose }) {
  const { config, vargani, expenses, dholMaintenance, stats } = useMandalData();
  const [reportLanguage, setReportLanguage] = useState('en'); // 'en' or 'mr'

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    generateMandalStatementPDF({
      mandalInfo: config,
      varganiList: vargani,
      expenseList: expenses,
      stats,
      language: reportLanguage
    });
  };

  const handleExportVarganiCSV = () => {
    exportVarganiToCSV(vargani, config.name, reportLanguage);
  };

  const handleExportExpensesCSV = () => {
    exportExpensesToCSV(expenses, config.name, reportLanguage);
  };

  const handleExportDholCSV = () => {
    exportDholMaintenanceToCSV(dholMaintenance, config.name, reportLanguage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in">
      <div
        className="w-full max-w-md bg-[#FFF8F6] border border-[#F0DFD5] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0DFD5]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B2616] text-[22px]">description</span>
            <h3 className="text-base font-bold text-[#241913]">हिशोब व अहवाल (Reports & Audit)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#57423E] hover:text-[#241913] hover:bg-[#FFF1EB] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Language Selection Toggle */}
        <div className="mt-4 p-3 bg-white rounded-2xl border border-[#F0DFD5] shadow-2xs">
          <label className="block text-xs font-bold text-[#6B5E57] mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#8B2616]">language</span>
              <span>अहवाल भाषा (Report Language)</span>
            </span>
            <span className="text-[11px] font-semibold text-[#8B2616]">
              {reportLanguage === 'mr' ? 'मराठी अहवाल' : 'English Report'}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReportLanguage('en')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                reportLanguage === 'en'
                  ? 'bg-[#8B2616] text-white shadow-xs'
                  : 'bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] hover:border-[#8B2616]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">translate</span>
              <span>English</span>
            </button>

            <button
              type="button"
              onClick={() => setReportLanguage('mr')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                reportLanguage === 'mr'
                  ? 'bg-[#8B2616] text-white shadow-xs'
                  : 'bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] hover:border-[#8B2616]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">flag</span>
              <span>मराठी (Marathi)</span>
            </button>
          </div>
          <p className="text-[10px] text-[#6B5E57] mt-2">
            {reportLanguage === 'mr' 
              ? 'मराठी निवडल्यास सर्व शीर्षके व स्तंभ मराठीत निर्यात होतील.' 
              : 'Export headers & summary titles in English.'}
          </p>
        </div>

        <div className="space-y-2.5 mt-4">
          {/* PDF Audit Statement */}
          <button
            onClick={handleDownloadPDF}
            className="w-full p-3.5 rounded-xl bg-[#8B2616] text-white flex items-center justify-between hover:bg-[#731E11] active:scale-[0.99] transition-all shadow-md group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#FFA391]">picture_as_pdf</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold">
                  {reportLanguage === 'mr' ? 'हिशोब पत्रक (Audit PDF)' : 'Audit Statement (PDF)'}
                </h4>
                <p className="text-[11px] text-[#FFA391]">
                  {reportLanguage === 'mr' ? 'अधिकृत बॅलन्स शीट व वर्गणी पत्रक' : 'हिशोब पत्रक • Full Balance Sheet'}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
              download
            </span>
          </button>

          {/* Vargani CSV / Google Sheets */}
          <button
            onClick={handleExportVarganiCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#14553C]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#14553C]">table_chart</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">
                  {reportLanguage === 'mr' ? 'वर्गणी नोंद वही (Vargani CSV)' : 'Vargani Register (CSV)'}
                </h4>
                <p className="text-[11px] text-[#57423E]">देणगी यादी • {vargani.length} Donors</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>

          {/* Expenses CSV */}
          <button
            onClick={handleExportExpensesCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#A23F1A]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#A23F1A]">receipt_long</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">
                  {reportLanguage === 'mr' ? 'खर्च नोंदवही (Expense CSV)' : 'Expense Ledger (CSV)'}
                </h4>
                <p className="text-[11px] text-[#57423E]">खर्च नोंदी • {expenses.length} Expenses</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>

          {/* Dhol Tasha CSV */}
          <button
            onClick={handleExportDholCSV}
            className="w-full p-3.5 rounded-xl bg-white border border-[#DEC0BA] text-[#241913] flex items-center justify-between hover:bg-[#FFF1EB] active:scale-[0.99] transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-[#8B2616]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#8B2616]">music_note</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#241913]">
                  {reportLanguage === 'mr' ? 'वाद्य दुरुस्ती पत्रक (Dhol Sheet)' : 'Dhol Tasha Sheet (CSV)'}
                </h4>
                <p className="text-[11px] text-[#57423E]">वाद्य दुरुस्ती • {dholMaintenance.length} Records</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#57423E]">file_download</span>
          </button>
        </div>

        <div className="mt-4 pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#57423E] hover:text-[#241913] py-2 px-5 rounded-lg hover:bg-[#FFF1EB] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
