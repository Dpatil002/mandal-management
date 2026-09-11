import React from 'react';

export function OrganiserBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard' },
    { id: 'vargani', label: 'Vargani', icon: 'receipt_long' },
    { id: 'expenses', label: 'Expenses', icon: 'payments' },
    { id: 'tasks', label: 'Tasks', icon: 'checklist' },
    { id: 'dhol-tasha', label: 'Dhol-Tasha', icon: 'music_note' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6EE] border-t-2 border-[#D9C4B7] pb-safe shadow-[0_-4px_20px_rgba(43,23,14,0.12)]">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1.5 py-2 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-[#7A1C16]'
                  : 'text-[#2B170E] hover:text-black'
              }`}
            >
              <div
                className={`w-10 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-[#EEDDC8] text-[#7A1C16] shadow-xs scale-105' : 'text-[#2B170E]'
                }`}
              >
                <span className={`material-symbols-outlined text-[23px] ${isActive ? 'text-[#7A1C16]' : 'text-[#2B170E]'}`}>
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[11.5px] sm:text-xs mt-0.5 tracking-tight text-center leading-tight truncate ${
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
