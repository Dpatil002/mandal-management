import React from 'react';
import { LayoutDashboard, IndianRupee, ReceiptText, FileSpreadsheet, Plus, CalendarClock } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, onQuickAdd }) {
  const navItems = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'vargani', label: 'Vargani', icon: IndianRupee },
    { id: 'fab', label: 'Add', isFab: true },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'schedule', label: 'Aarti & Duties', icon: CalendarClock },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
  ];

  return (
    <nav className="bottom-nav-bar lg:hidden">
      {navItems.map((item) => {
        if (item.isFab) {
          return (
            <button
              key="quick-add-fab"
              onClick={onQuickAdd}
              className="nav-fab-center shadow-lg group active:scale-95 transition-transform"
              aria-label="Quick Add Entry"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          );
        }

        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-wrap">
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <span className={isActive ? 'text-amber-500 font-bold' : 'text-slate-400'}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
