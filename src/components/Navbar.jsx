import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { Wifi, WifiOff, User, LogOut, Flame, Sparkles, Settings } from 'lucide-react';

export function Navbar({ onOpenSettings }) {
  const { config, isOnline, isConfigured } = useMandalData();
  const { currentOrganizer, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mandal Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {config.name || 'श्री गणेश उत्सव मंडळ'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> {config.year || 2026} • 31 years completed (Est. 1995)
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {config.location || 'Pandal Dashboard'}
            </p>
          </div>
        </div>

        {/* Status Indicators & Organiser Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Online/Offline PWA Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
            title={isOnline ? 'Online (Real-time sync active)' : 'Offline (Working from local cache)'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Offline Cache</span>
              </>
            )}
          </div>

          {/* Active Organiser Pill */}
          {currentOrganizer && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-full px-2.5 py-1">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                {currentOrganizer.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {currentOrganizer.name}
                </div>
              </div>
            </div>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-colors"
              title="Mandal Settings & Config"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors"
            title="Lock / Switch Organiser"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
