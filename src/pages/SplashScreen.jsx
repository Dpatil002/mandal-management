import React from 'react';

const STITCH_LOGO_EMBLEM = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7KsmlpeqzD-v71LofxnNcIeq4OWWaoOr2bPG37lZdzdwkcaUOxvWIZ36e_y2H9HwuWV2XGQfxN8ZsVwo5NpbVHbypYNWCfASgyUiZUBWTB79QcgImrlpF-1kCqWaf5gXTkJNmxDSuWREQp-rHnRpMqzocsldpfLSCSu6w101vkoJ_YZhXjAdAZihRHglEKBvmmePjAR6WM6A8w6WhfSp9yY2f1nLQNoSoNyAnqFmZOJDUy0yNH_w_J3oSnp0coTasAtk';

export function SplashScreen({ onFinish }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="bg-[#fff8f6] font-['Plus_Jakarta_Sans','Mukta',sans-serif] text-[#241913] flex flex-col min-h-screen pt-safe pb-safe items-center justify-center relative w-full overflow-hidden">
      {/* Ambient Festive Aura Gradients */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-[#fd8359]/15 blur-3xl transform -translate-y-6 animate-pulse"></div>
        <div className="w-64 h-64 rounded-full bg-[#a63a27]/10 blur-2xl transform translate-y-8"></div>
      </div>

      {/* Soft Decorative Traditional Mandala Aura */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow Container for Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#fd8359]/20 via-[#fae4da]/40 to-[#6b0e03]/10 blur-xl scale-110"></div>
          <div className="relative flex items-center justify-center">
            <img
              alt="Indrayani Vihar Mitra Mandal Emblem"
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-sm select-none pointer-events-none"
              src={STITCH_LOGO_EMBLEM}
            />
          </div>
        </div>

        {/* Minimalist Devotional Pulsing Loading Indicator */}
        <div className="mt-12 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-[#fd8359]/20 blur-md animate-pulse"></div>
            <svg className="animate-spin w-10 h-10 drop-shadow-sm" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="18" stroke="#f4ded4" strokeWidth="3" strokeLinecap="round"></circle>
              <circle cx="22" cy="22" r="18" stroke="#a23f1a" strokeWidth="3" strokeDasharray="60 80" strokeLinecap="round"></circle>
              <circle cx="22" cy="22" r="18" stroke="#fd8359" strokeWidth="2.5" strokeDasharray="30 50" strokeDashoffset="15" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#6b0e03] animate-pulse shadow-sm shadow-[#6b0e03]/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
