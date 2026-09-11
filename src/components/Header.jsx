import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMandalData } from '../context/MandalDataContext';

const MANDAL_LOGO_IMG = '/mandal-logo.png';

export function Header({ isOrganiserMode, onOpenLogin }) {
  const { currentOrganizer, logout } = useAuth();
  const { config, isOnline } = useMandalData();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E8DAC4] px-4 py-2.5 shadow-xs">
      <div className={`max-w-2xl mx-auto flex items-center ${isOrganiserMode ? 'justify-between' : 'justify-center'}`}>
        {/* Mandal Brand Info with Actual Logo */}
        <div className={`flex items-center gap-2.5 ${!isOrganiserMode ? 'justify-center text-center' : ''}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#7A1C16]/20 bg-[#FAF6EE] flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={MANDAL_LOGO_IMG}
              alt="Mandal Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-[#7A1C16] font-black text-lg">ॐ</span>';
              }}
            />
          </div>
          <div className={!isOrganiserMode ? 'text-left sm:text-center' : ''}>
            <h1 className="text-[15px] sm:text-base font-black text-[#7A1C16] leading-tight flex items-center gap-1.5 font-['Mukta','Plus_Jakarta_Sans',sans-serif]">
              {config.name || 'इंद्रायणी विहार मित्र मंडळ'}
              {!isOnline && (
                <span className="text-[10px] bg-[#E2F1F4] text-[#1C5D6C] border border-[#C5E5EC] px-1.5 py-0.5 rounded-full font-extrabold">
                  Offline
                </span>
              )}
            </h1>
            <p className="text-xs font-bold text-[#C94709] leading-snug font-['Mukta','Plus_Jakarta_Sans',sans-serif]">
              {config.subtitle || 'सार्वजनिक गणेशोत्सव २०२६ • ३२ वे वर्ष'}
            </p>
          </div>
        </div>

        {/* Action / Mode Switch (Organiser Only) */}
        {isOrganiserMode && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#7A1C16]">{currentOrganizer?.name}</span>
              <span className="text-[10px] text-[#6B5E57]">{currentOrganizer?.phone ? `+91 ${currentOrganizer.phone}` : ''}</span>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-[#FAF6EE] text-[#7A1C16] border border-[#D9C4B7] hover:bg-[#F2EADB] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
