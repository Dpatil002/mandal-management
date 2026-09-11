import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMandalData } from '../context/MandalDataContext';
import { Flame, Lock, ShieldCheck, UserCheck, KeyRound, ArrowRight } from 'lucide-react';

export function Login() {
  const { organizers, loginWithPin } = useAuth();
  const { config } = useMandalData();

  const [selectedOrgId, setSelectedOrgId] = useState(organizers[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumpad = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your 4-digit PIN');
      return;
    }
    const result = loginWithPin(pin, selectedOrgId);
    if (!result.success) {
      setError(result.error || 'Incorrect PIN');
      setPin('');
    }
  };

  // Quick auto-login helper for demo ease
  const handleQuickDemoLogin = (org) => {
    loginWithPin(org.pin, org.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 shadow-2xl shadow-orange-500/30 mb-3 border border-amber-300/20">
            <Flame className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {config?.name || 'श्री गणेश उत्सव मंडळ'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mandal Management & Vargani PWA | वर्ष {config?.year || 2026}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 bg-slate-900/90 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Organiser Login (प्रवेश)
              </h2>
              <p className="text-xs text-slate-400">Select your name and enter PIN</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              OTP-Free PIN
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Organiser Selector Carousel/Chips */}
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Organiser (कार्यकर्ता / पदाधिकारी)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {organizers.map((org) => {
              const isSelected = selectedOrgId === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    setPin('');
                    setError('');
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {org.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {org.phone || ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PIN Dots Indicator */}
          <div className="mb-5 text-center">
            <div className="flex justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    pin.length > idx
                      ? 'bg-amber-400 border-amber-300 scale-110 shadow-md shadow-amber-400/50'
                      : 'bg-slate-800 border-white/15'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Default demo PIN for {organizers.find(o => o.id === selectedOrgId)?.name}: <strong className="text-amber-400 font-mono">{organizers.find(o => o.id === selectedOrgId)?.pin}</strong>
            </p>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpad(String(num))}
                className="h-12 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 active:bg-amber-500 active:text-slate-950 font-bold text-lg text-white border border-white/5 transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-white/5 transition-colors flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleNumpad('0')}
              className="h-12 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 active:bg-amber-500 active:text-slate-950 font-bold text-lg text-white border border-white/5 transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-white/5 transition-colors flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={pin.length < 4}
            className={`btn-saffron w-full py-3 text-sm font-bold transition-opacity ${
              pin.length === 4 ? 'opacity-100 shadow-lg shadow-amber-500/25' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Unlock Dashboard (प्रवेश करा) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
          <p className="text-[11px] text-slate-400 mb-1.5 font-medium">⚡ One-Click Instant Sign-In for Testing:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {organizers.map(org => (
              <button
                key={org.id}
                onClick={() => handleQuickDemoLogin(org)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10 transition-colors"
              >
                {org.name.split(' ')[0]} ({org.pin})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
