import React from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';

export function PublicMandalCommittee({ onOpenLogin }) {
  const { config } = useMandalData();
  const { organizers } = useAuth();

  return (
    <div className="space-y-3.5 pb-20 max-w-md mx-auto font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Mandal Profile Card */}
      <div className="bg-[#7A1C16] text-[#FAF6EE] p-4 rounded-2xl shadow-xs text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-white/10 mx-auto flex items-center justify-center text-lg font-black">
          ॐ
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">{config.name}</h2>
        <p className="text-xs text-[#E65A15] font-semibold">{config.subtitle}</p>
        <p className="text-xs text-white/80">
          {config.location}
        </p>
      </div>

      {/* Executive Committee Members */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE0D2] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE0D2]">
          <div>
            <h3 className="text-sm font-bold text-[#7A1C16]">Committee Members</h3>
            <span className="text-xs text-[#6B5E57]">पदाधिकारी संपर्क</span>
          </div>
          <span className="text-xs text-[#57423E] font-semibold">{organizers.length} सदस्य</span>
        </div>

        <div className="space-y-2">
          {organizers.map((org) => (
            <div
              key={org.id}
              className="p-2.5 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5] flex items-center justify-between hover:border-[#DEC0BA] transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-[#241913]">{org.name}</h4>
                <p className="text-[11px] text-[#6B5E57] font-medium">+91 {org.phone}</p>
              </div>
              <a
                href={`tel:${org.phone}`}
                className="w-7 h-7 rounded-full bg-white border border-[#DEC0BA] flex items-center justify-center text-[#14553C] hover:bg-[#14553C] hover:text-white transition-all shadow-xs"
                title={`Call ${org.name}`}
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
