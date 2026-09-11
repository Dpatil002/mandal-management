import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function OrganiserLogin({ onBackToPublic }) {
  const { loginWithPin, organizers } = useAuth();

  const [selectedOrgId, setSelectedOrgId] = useState(organizers[0]?.id || '');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [customName, setCustomName] = useState(organizers[0]?.name || '');
  const [phone, setPhone] = useState(organizers[0]?.phone?.replace('+91', '').trim() || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedOrgId) {
      const found = organizers.find((o) => o.id === selectedOrgId);
      if (found) {
        setCustomName(found.name);
        setPhone(found.phone ? found.phone.replace('+91', '').trim() : '');
      }
    }
  }, [organizers, selectedOrgId]);

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrgId(orgId);
    if (orgId) {
      const found = organizers.find((o) => o.id === orgId);
      if (found) {
        setCustomName(found.name);
        setPhone(found.phone ? found.phone.replace('+91', '').trim() : '');
      }
    } else {
      setCustomName('');
      setPhone('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('Incorrect PIN / अयोग्य पिन. कृपया योग्य ४-अंकी कोड टाका.');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithPin(pin, customName, phone, selectedOrgId);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Incorrect PIN / अयोग्य पिन. कृपया योग्य ४-अंकी कोड टाका (PIN: 2026).');
    }
  };

  return (
    <div className="bg-[#FFF8F6] font-['Plus_Jakarta_Sans','Mukta',sans-serif] text-[#241913] flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-[#FFF8F6]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              aria-label="Go back"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#241913] hover:bg-[#fae4da] transition-colors cursor-pointer"
              onClick={onBackToPublic}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="w-[36px] h-[36px] rounded-full bg-[#8B2616] text-[#FAF4ED] flex items-center justify-center font-black text-lg shrink-0 shadow-sm border border-[#F0DFD5]">
              ॐ
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[18px] font-bold text-[#8B2616] truncate leading-tight">Indrayani Vihar Mitra Mandal</span>
              <h1 className="text-[12px] text-[#6B5E57] font-medium truncate">Organiser Dashboard</h1>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#8B2616] flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-[#FAF4ED] min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12 max-w-md mx-auto">
          {/* Emblem & Title */}
          <div className="pt-6 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-[72px] h-[72px] rounded-2xl border border-[#F0DFD5] shadow-xs object-contain bg-white p-1 flex items-center justify-center text-3xl font-extrabold text-[#8B2616]">
                🚩
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#8B2616] tracking-tight">Organiser Login</h2>
            <p className="text-xs text-[#6B5E57] mt-0.5">
              Enter details to manage seva
            </p>
          </div>

          {/* Form Card */}
          <div className="mt-4 rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs">
            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              {/* Profile Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="organizer-select">
                  Select Organiser
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-[#6B5E57]/60 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  </div>
                  <select
                    id="organizer-select"
                    value={selectedOrgId}
                    onChange={handleOrgChange}
                    className="w-full border border-[#D9C4B7] bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#241913] outline-none transition-all focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616]"
                  >
                    {organizers.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.phone ? `+91 ${org.phone}` : ''})
                      </option>
                    ))}
                    <option value="">+ Custom Registered Organiser</option>
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="organizer-name">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-[#6B5E57]/60 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input
                    id="organizer-name"
                    name="organizer-name"
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Ramesh Shinde"
                    className="w-full border border-[#D9C4B7] bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#241913] placeholder:text-[#6B5E57]/40 outline-none transition-all focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616]"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="organizer-mobile">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-[#6B5E57]/60 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </div>
                  <span className="absolute left-9 text-xs text-[#6B5E57] font-medium select-none pointer-events-none">+91</span>
                  <input
                    id="organizer-mobile"
                    name="organizer-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98220 XXXXX"
                    className="w-full border border-[#D9C4B7] bg-white rounded-xl pl-16 pr-4 py-2.5 text-xs text-[#241913] placeholder:text-[#6B5E57]/40 outline-none transition-all focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616]"
                  />
                </div>
              </div>

              {/* Mandal PIN */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#6B5E57]" htmlFor="organizer-pin">
                    Mandal PIN (2026)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPin('2026')}
                    className="text-[11px] text-[#8B2616] font-bold hover:underline cursor-pointer"
                  >
                    Use PIN
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-[#6B5E57]/60 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input
                    id="organizer-pin"
                    name="organizer-pin"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    required
                    className={`w-full border ${
                      error ? 'border-red-500 ring-1 ring-red-400' : 'border-[#D9C4B7]'
                    } bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#241913] placeholder:text-[#6B5E57]/40 outline-none transition-all focus:border-[#8B2616] focus:ring-1 focus:ring-[#8B2616] tracking-[0.35em] font-bold text-center`}
                  />
                  <button
                    type="button"
                    aria-label="Toggle PIN visibility"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 text-[#6B5E57]/60 hover:text-[#8B2616] flex items-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPin ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium mt-1">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl py-3 bg-[#8B2616] text-white font-semibold text-xs shadow-xs hover:bg-[#731E11] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Logging in...' : 'Login to Portal'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Footer chant */}
          <div className="mt-6 text-center flex flex-col items-center justify-center gap-0.5 opacity-75">
            <span className="text-xs font-bold text-[#8B2616]">॥ गणपती बाप्पा मोरया ॥</span>
            <span className="text-[11px] text-[#6B5E57]">Indrayani Vihar 2026</span>
          </div>
        </div>
      </main>
    </div>
  );
}
