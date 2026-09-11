import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const STITCH_DHOL_PHOTO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYguzE_lt-isdX2R5wvMAf2fxQ24f31kWXNo4SKCDbNyTH-aHiKn7j8OqWRmndXmkja_RS9lm_K5_-tZee7Pr_KUAe0D8LBDnUN6_1dMmoO7eVU7NgWX1Rhe7c8llYjJUDtrGEO9ph10CFYMt_md4K4fEjMTCC38sZrp3Ns-Z2PYHUulPOeKbH70qgQil71TOOnHPW1xQg0NuLD0PkVzRVPKvUGP6Pani3VP1x-w0vAy9j7yD3Udgmgw';

export function OrganiserDholTasha() {
  const { dholInventory, dholMaintenance, addDholMaintenance, stats } = useMandalData();

  const [isAddingService, setIsAddingService] = useState(false);
  const [instrumentType, setInstrumentType] = useState('Dhol Leather Tightening');
  const [amount, setAmount] = useState('');
  const [servicedBy, setServicedBy] = useState('');
  const [notes, setNotes] = useState('');

  const totalUnits = (dholInventory.dhol || 24) + (dholInventory.tasha || 12) + (dholInventory.dhwaja || 8) + (dholInventory.tol || 16);

  const handleAddService = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    addDholMaintenance({
      instrumentType,
      amount: Number(amount),
      servicedBy: servicedBy.trim() || 'स्थानिक वादक केंद्र',
      notes: notes.trim(),
      date: new Date().toISOString()
    });

    setAmount('');
    setServicedBy('');
    setNotes('');
    setIsAddingService(false);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-20 max-w-xl mx-auto space-y-4 font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in">
      {/* Hero Banner Card */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xs bg-[#FFF1EB]">
        <div className="relative h-36 sm:h-44 w-full">
          <img
            alt="Dhol-Tasha"
            className="w-full h-full object-cover"
            src={STITCH_DHOL_PHOTO}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#6B0E03]/95 via-[#6B0E03]/45 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3.5 flex flex-col gap-0.5 text-white">
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
              Dhol-Tasha Pathak
            </h2>
            <p className="text-xs text-[#FFDAD4] opacity-95">
              पथक व्यवस्थापन व देखभाल
            </p>
          </div>
        </div>
      </div>

      {/* Total Maintenance Spend Highlight Card */}
      <div className="w-full rounded-2xl bg-white/95 p-4 border border-[#F0DFD5] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
              <span className="material-symbols-outlined text-[20px]">build_circle</span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#241913]">Maintenance Spend</span>
              <span className="text-xs text-[#6B5E57] block">देखभाल खर्च २०२६</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#14553C] text-[#8AC8A7] text-xs font-semibold">
            Audit Ready
          </span>
        </div>

        <div className="bg-[#FFF1EB] rounded-xl p-3 flex items-baseline justify-between">
          <div>
            <span className="text-xl text-[#6B0E03] font-extrabold tracking-tight">
              {formatCurrency(stats.totalDholMaintenance || 28400)}
            </span>
            <span className="text-xs text-[#6B5E57] block">दुरुस्ती खर्च</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#A23F1A] font-bold">{totalUnits}+ Units</span>
          </div>
        </div>
      </div>

      {/* Instrument Counts Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#A23F1A] text-[18px]">queue_music</span>
            <h3 className="text-sm text-[#241913] font-bold">Inventory Status</h3>
          </div>
          <span className="text-xs text-[#6B5E57]">Live Count</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Dhol Card */}
          <div className="bg-white rounded-xl p-3.5 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                <span className="material-symbols-outlined text-[18px]">album</span>
              </div>
              <span className="text-xl font-bold text-[#6B0E03]">{dholInventory.dhol || 24}</span>
            </div>
            <div>
              <h4 className="text-sm text-[#241913] font-bold">Dhol (ढोल)</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs text-[#6B5E57]">22 Ready</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#A23F1A]"></span>
                <span className="text-xs text-[#A23F1A] font-semibold">2 Under Repair</span>
              </div>
            </div>
          </div>

          {/* Tasha Card */}
          <div className="bg-white rounded-xl p-3.5 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
              </div>
              <span className="text-xl font-bold text-[#6B0E03]">{dholInventory.tasha || 12}</span>
            </div>
            <div>
              <h4 className="text-sm text-[#241913] font-bold">Tasha (ताशा)</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs text-[#6B5E57]">11 Ready</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#A23F1A]"></span>
                <span className="text-xs text-[#A23F1A] font-semibold">1 Re-skinning</span>
              </div>
            </div>
          </div>

          {/* Dhwaja Card */}
          <div className="bg-white rounded-xl p-3.5 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                <span className="material-symbols-outlined text-[18px]">flag</span>
              </div>
              <span className="text-xl font-bold text-[#6B0E03]">{dholInventory.dhwaja || 8}</span>
            </div>
            <div>
              <h4 className="text-sm text-[#241913] font-bold">Dhwaja (ध्वज)</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs text-[#6B5E57]">All Good</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">सजलेले व सज्ज</span>
            </div>
          </div>

          {/* Tol Card */}
          <div className="bg-white rounded-xl p-3.5 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </div>
              <span className="text-xl font-bold text-[#6B0E03]">{dholInventory.tol || 16}</span>
            </div>
            <div>
              <h4 className="text-sm text-[#241913] font-bold">Tol (टोल / झांज)</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs text-[#6B5E57]">16 Pairs Ready</span>
              </div>
              <span className="text-[11px] text-[#6B5E57] block mt-0.5">Polished brass</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="w-full">
        <button
          onClick={() => setIsAddingService(!isAddingService)}
          className="w-full rounded-xl py-3.5 px-4 bg-[#8B2616] hover:bg-[#731E11] text-white font-semibold text-sm shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span>+ Add Maintenance Cost / दुरुस्ती खर्च जोडा</span>
        </button>
      </div>

      {/* Inline Form if open */}
      {isAddingService && (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#8B2616] shadow-md animate-slide-up space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]">
            <h3 className="text-xs font-bold text-[#8B2616] uppercase tracking-wider">
              + वाद्य दुरुस्ती व देखभाल नोंद
            </h3>
            <button
              onClick={() => setIsAddingService(false)}
              className="p-1 rounded-full text-[#6B5E57] hover:text-[#241913] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <form onSubmit={handleAddService} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">दुरुस्ती प्रकार (Service Type) *</label>
              <select
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-xs font-bold text-[#241913] focus:outline-none focus:border-[#8B2616]"
              >
                <option value="Dhol Leather Tightening & Strings">ढोल चामडे आवळणे व दोऱ्या बदलणे (Dhol Tightening)</option>
                <option value="Tasha Snare Wire & Brass Polish">ताशा वायर व पितळ पॉलिश (Tasha Service)</option>
                <option value="Dhwaja Brass Rings & Silk Banners">भगवा ध्वज व काठ्या दुरुस्ती (Dhwaja)</option>
                <option value="Tol Sticks & Bell Ring">टोल दांडी व घंटी (Tol Service)</option>
                <option value="Pathak T-shirts & Band Accessories">पथक टी-शर्ट व इतर साहित्य</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#6B5E57] mb-1">खर्च रक्कम (₹) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="उदा. 3500"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-xs font-bold text-[#241913] focus:outline-none focus:border-[#8B2616]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B5E57] mb-1">दुकान / वादक नाव</label>
                <input
                  type="text"
                  value={servicedBy}
                  onChange={(e) => setServicedBy(e.target.value)}
                  placeholder="उदा. श्री वाद्य केंद्र"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-xs text-[#241913] focus:outline-none focus:border-[#8B2616]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B5E57] mb-1">तपशील (Notes)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. ६ ढोल दोऱ्या बदलल्या"
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-xs text-[#241913] focus:outline-none focus:border-[#8B2616]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8B2616] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#731E11] active:scale-98 transition-all cursor-pointer"
            >
              जतन करा (Save Record)
            </button>
          </form>
        </div>
      )}

      {/* Service Log Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm text-[#241913] font-bold">खर्च नोंदवही (Service Log)</h3>
            <p className="text-xs text-[#6B5E57]">Chronological maintenance history</p>
          </div>
        </div>

        {/* Maintenance Log List */}
        <div className="space-y-2 mt-1">
          {dholMaintenance.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-[#F0DFD5] text-xs text-[#6B5E57]">
              कोणतीही देखभाल नोंद उपलब्ध नाही.
            </div>
          ) : (
            dholMaintenance.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-white border border-[#F0DFD5] shadow-xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFEAE0] text-[#8B2616] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">build</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#241913]">{entry.instrumentType}</h4>
                    <p className="text-[11px] text-[#6B5E57]">
                      {entry.servicedBy} • {entry.notes || 'Routine Servicing'}
                    </p>
                    <span className="text-[10px] text-[#6B5E57]">{formatDate(entry.date)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#8B2616]">
                    {formatCurrency(entry.amount)}
                  </span>
                  <span className="block text-[10px] text-[#14553C] font-semibold">Cleared</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
