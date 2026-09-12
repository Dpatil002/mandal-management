import React from 'react';
import { useMandalData } from '../context/MandalDataContext';

export function PublicHome({ onNavigateToPay, onNavigateToSchedule, onNavigateToCommittee }) {
  const { config, publicContent } = useMandalData();

  return (
    <div className="home-card-stack pb-20 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* =========================================================================
          FEATURE 1: PAY VARGANI (TOP CORE FOCUS)
          Deep Maroon (#7A1C16) + Saffron (#E65A15) + Fort Ramparts Motif
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-[#F5E8D6] border border-[#EAE0D2] shadow-sm">
        {/* Subtle Fort Silhouette & Sun Glow Motif in Background */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#E65A15]/10 pointer-events-none blur-xl"></div>
        <div className="absolute right-3 bottom-0 opacity-10 pointer-events-none">
          <svg width="110" height="70" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 70V30H25V40H35V30H50V40H60V30H75V40H85V30H100V70H10Z" fill="#7A1C16" />
            <path d="M40 70V50C40 45 45 42 55 42C65 42 70 45 70 50V70H40Z" fill="#FAF6EE" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7A1C16] text-[#FAF6EE] flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[26px]">volunteer_activism</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-[#7A1C16] tracking-tight leading-tight">Pay Vargani / Contribution</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E65A15]/15 text-[#E65A15] text-[11px] font-extrabold border border-[#E65A15]/20 shrink-0">
                    २०२६
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#E65A15] mt-0.5">
                  वर्गणी जमा करा • उत्सव सहकार्य
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#57423E] leading-snug">
            {publicContent?.varganiMessage || 'Contribute in a minute • झटपट डिजिटल पावती'}
          </p>

          <button
            type="button"
            onClick={onNavigateToPay}
            className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#7A1C16] text-[#FAF6EE] font-bold text-sm shadow-md hover:bg-[#63140F] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">payments</span>
            <span className="truncate">Pay Vargani / Contribution</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FEATURE 2: PHOTOS & VIDEOS (SECOND CORE FOCUS)
          Teal Wave Motif (#1C5D6C / #E2F1F4) Echoing Indrayani River
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#F5FBFD] via-[#EAF5F8] to-[#DDF0F4] border border-[#C5E5EC] shadow-sm">
        {/* Water Wave Motif in Background */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
          <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 45C30 35 45 55 75 45C105 35 120 55 140 45V60H0V45Z" fill="#1C5D6C" />
            <path d="M0 30C25 20 45 40 70 30C95 20 115 40 140 30V60H0V30Z" fill="#236B7D" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1C5D6C] text-[#FAF6EE] flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[26px]">photo_camera</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-[#1C5D6C] tracking-tight leading-tight">Photos &amp; Videos</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#1C5D6C]/15 text-[#1C5D6C] text-[11px] font-extrabold border border-[#1C5D6C]/20">
                    Drive
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1C5D6C]/90 mt-0.5">
                  उत्सव फोटो व व्हिडिओ • आठवणी
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#241913] leading-snug">
            Share and view festival photos &amp; videos in our shared Google Drive.
          </p>

          {/* Action Buttons: View Album & Upload Media */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              className="min-h-[48px] py-3 px-3 rounded-2xl bg-[#1C5D6C] text-white font-bold text-xs shadow-md hover:bg-[#154652] active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all text-center"
              href={config.driveUrl || 'https://drive.google.com'}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              <span>Open Drive</span>
            </a>

            <a
              className="min-h-[48px] py-3 px-3 rounded-2xl bg-white border border-[#1C5D6C] text-[#1C5D6C] font-bold text-xs shadow-xs hover:bg-[#E2F1F4] active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all text-center"
              href={config.driveUrl || 'https://drive.google.com'}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>Upload Photos</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECONDARY SECTION: TODAY'S SCHEDULE & AARTI
      ========================================================================= */}
      <div className="rounded-3xl p-5 bg-[#FFFDF9] border border-[#EAE0D2] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#EAE0D2]/70">
          <div>
            <h3 className="text-base font-bold text-[#7A1C16]">Today's Schedule</h3>
            <span className="text-xs text-[#6B5E57]">आजचे नियोजन व महाआरती</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#EBF7F0] text-[#14553C] text-xs font-bold border border-[#BDE5CE]">
            Day 4 • चतुर्थी
          </span>
        </div>

        {/* Aarti Rows */}
        <div className="flex flex-col gap-2.5">
          {/* Morning Aarti */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6EE] border border-[#EAE0D2]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE0D2] flex items-center justify-center text-[#E65A15] shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">wb_twilight</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#241913] truncate">Morning Aarti</span>
                <span className="text-xs text-[#6B5E57] truncate">सकाळची पूजा व प्रसाद</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#7A1C16] bg-white px-2.5 py-1 rounded-xl border border-[#EAE0D2]">
              {publicContent?.morningAartiTime || '10:00 AM'}
            </span>
          </div>

          {/* Evening Maha Aarti */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FDF5EB] border border-[#F3E0C8]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#7A1C16] text-[#FAF6EE] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">flare</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#7A1C16] truncate">Evening Maha Aarti</span>
                <span className="text-xs text-[#6B5E57] truncate">संध्याकाळची महाआरती व भजन</span>
              </div>
            </div>
            <span className="text-xs font-bold text-white bg-[#7A1C16] px-2.5 py-1 rounded-xl shadow-xs">
              {publicContent?.eveningAartiTime || '08:00 PM'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToSchedule}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-[#DECDB9] bg-[#FAF6EE] text-[#7A1C16] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F2EADB] transition-colors cursor-pointer"
        >
          <span>View Full Schedule • पूर्ण वेळापत्रक</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
