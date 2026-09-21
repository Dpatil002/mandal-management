import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';

export function PublicMandalCommittee({ onOpenLogin }) {
  const { config } = useMandalData();
  const { organizers } = useAuth();

  return (
    <div className="flex flex-col w-full gap-6 sm:gap-7 pb-24 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif] max-w-md mx-auto">
      
      {/* =========================================================================
          MANDAL HERO CARD (LOGO, NAME, ESTB 1998, 28 YEARS)
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-[#F5E8D6] border border-[#EAE0D2] shadow-sm text-center">
        {/* Decorative Background Accents */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#E65A15]/10 pointer-events-none blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-[#7A1C16]/10 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo with Glow Ring */}
          <div className="relative mb-3.5">
            <div className="w-20 h-20 rounded-full p-1 bg-white shadow-md border-2 border-[#EAE0D2] flex items-center justify-center overflow-hidden">
              <img
                src="/mandal-logo.png"
                alt="Indrayani Vihar Mitra Mandal Logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-3xl font-black text-[#7A1C16]">ॐ</span>';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7A1C16] text-[#FAF6EE] flex items-center justify-center shadow-xs border border-white text-xs font-black">
              🚩
            </div>
          </div>

          {/* Mandal Name & Subtitle */}
          <h1 className="text-xl font-black text-[#7A1C16] tracking-tight leading-tight">
            {config?.name || 'इंद्रायणी विहार मित्र मंडळ'}
          </h1>
          <p className="text-xs font-bold text-[#8B2616] mt-0.5">
            Indrayani Vihar Mitra Mandal
          </p>
          <p className="text-[12px] text-[#6B5E57] font-medium mt-1">
            {config?.location || 'Indrayani Vihar, Lohegaon, Pune'}
          </p>

          {/* Heritage Badges: Estb. 1995 & 31 Years Completed */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7A1C16]/10 border border-[#7A1C16]/20 text-[#7A1C16]">
              <span className="material-symbols-outlined text-[15px]">history_edu</span>
              <span className="text-xs font-extrabold tracking-tight">Estb. 1995</span>
              <span className="text-[11px] font-semibold text-[#7A1C16]/80">(स्थापना १९९५)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E65A15]/15 border border-[#E65A15]/30 text-[#A23F1A]">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span className="text-xs font-extrabold tracking-tight">31 Years Completed</span>
              <span className="text-[11px] font-semibold text-[#A23F1A]/80">(३१ वर्षे पूर्ण)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ORGANISERS LIST (NAME & PHONE NUMBER ONLY)
      ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE0D2] shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#F0DFD5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] text-[#7A1C16] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#241913]">Organisers & Committee</h2>
              <p className="text-[11px] text-[#6B5E57]">कार्यकर्ते व संपर्क सूची</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4ED] text-[#7A1C16] text-xs font-bold border border-[#EAE0D2]">
            {organizers?.length || 0} Members
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {organizers && organizers.length > 0 ? (
            organizers.map((org) => (
              <div
                key={org.id}
                className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#F0DFD5] hover:border-[#DEC0BA] flex items-center justify-between transition-all hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7A1C16] to-[#A23F1A] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {org.name ? org.name.charAt(0) : 'क'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#241913] truncate">
                      {org.name}
                    </h3>
                    <p className="text-xs text-[#6B5E57] font-semibold mt-0.5 tracking-wide">
                      {org.phone ? `+91 ${org.phone}` : 'No phone provided'}
                    </p>
                  </div>
                </div>

                {/* Quick Call and WhatsApp Action Buttons */}
                {org.phone && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://wa.me/91${org.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all active:scale-95"
                      title={`WhatsApp ${org.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </a>
                    <a
                      href={`tel:${org.phone.replace(/[^0-9]/g, '')}`}
                      className="w-8 h-8 rounded-xl bg-[#14553C]/10 text-[#14553C] border border-[#14553C]/20 flex items-center justify-center hover:bg-[#14553C] hover:text-white transition-all active:scale-95"
                      title={`Call ${org.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-[#6B5E57] text-center py-4">No organisers listed.</p>
          )}
        </div>
      </div>

      {/* =========================================================================
          LOGIN TO ORGANISER'S SIDE CARD (PROMINENT CTA)
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#7A1C16] via-[#64140E] to-[#4A0D08] text-white shadow-md border border-[#912820]">
        {/* Glow Accent */}
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#E65A15]/20 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/15">
                <span className="material-symbols-outlined text-[24px] text-[#FD8359]">admin_panel_settings</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight text-white">
                    Login to Organiser's Side
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white/90 border border-white/20">
                    Private
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  पदाधिकारी / कार्यकर्ता प्रवेश
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/75 leading-relaxed">
            Authorized committee members can login with their PIN to record collections, manage expenses, and view accounts.
          </p>

          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#E65A15] hover:bg-[#D44F0F] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Login as Organiser</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

    </div>
  );
}
