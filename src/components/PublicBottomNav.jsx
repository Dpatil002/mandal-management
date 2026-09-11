import React from 'react';

export function PublicBottomNav({ activeTab, setActiveTab, onOpenLogin }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'festival' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
    { id: 'vargani', label: 'Pay Vargani', icon: 'payments', highlight: true },
    { id: 'mandal', label: 'Mandal', icon: 'account_balance' }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'mandal') {
      if (onOpenLogin) {
        onOpenLogin();
      }
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6EE] border-t-2 border-[#D9C4B7] pb-safe shadow-[0_-4px_20px_rgba(43,23,14,0.12)]">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#7A1C16]'
                  : 'text-[#2B170E] hover:text-black'
              }`}
            >
              {tab.highlight && !isActive && (
                <span className="absolute top-1 right-3.5 w-2.5 h-2.5 bg-[#E65A15] border-2 border-[#FAF6EE] rounded-full animate-pulse"></span>
              )}
              <div
                className={`w-11 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-[#EEDDC8] text-[#7A1C16] shadow-xs scale-105' : 'text-[#2B170E]'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'text-[#7A1C16]' : 'text-[#2B170E]'}`}>
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[12px] sm:text-[13px] mt-0.5 text-center leading-tight tracking-tight ${
                isActive ? 'font-black text-[#7A1C16]' : 'font-bold text-[#2B170E]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
