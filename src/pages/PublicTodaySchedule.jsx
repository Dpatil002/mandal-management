import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { FESTIVAL_DAYS_CONFIG, getFestivalDayInfo } from '../utils/festivalSchedule';

const STITCH_CULTURAL_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFng43v9k73E7rH9_KFkaLPsFhywivy85J8itC8lxdWV6PbbDiTMQ4zuDsp-40MxVf7p69j0RNzORcrkvo9PV-HM-fMFEUosY4XmP7cBXoMxoIyLwJlDOn_gVhrSLWHr_veLBht6ul3wciriUrXl17ms6pRuNx_mTfGVGPMzxSJrp4gBCFA1we-j27bWbUIqwIgS5JVzH2Ye9xH2mVXLhTj_MTEDk-RCCV0K1Sb03kFiostkj6M4xMhw';

export function PublicTodaySchedule() {
  const { publicContent, mankariList, culturalEvents } = useMandalData();
  const [selectedDay, setSelectedDay] = useState(1);
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  const dayMankaris = (mankariList || []).filter((m) => {
    const d = typeof m.day === 'string' ? m.day.replace(/\D/g, '') : m.day;
    return Number(d) === selectedDay || m.day === `Day ${selectedDay}` || m.day === selectedDay;
  });

  const eventForDay = (culturalEvents || []).find((e) => Number(e.day) === selectedDay) ||
    (publicContent?.events || []).find((e) => Number(e.day) === selectedDay);

  const dayInfo = getFestivalDayInfo(selectedDay);

  return (
    <div className="flex flex-col w-full gap-3.5 pb-12 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Date & Title Header Card */}
      <div className="rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EB] border border-[#F5DACB] text-xs font-semibold text-[#8B2616]">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_today
            </span>
            Day {selectedDay} • {dayInfo.date} • {dayInfo.tithi || `उत्सव दिवस ${selectedDay}`}
          </span>
          <span className="text-xs font-semibold text-[#A23F1A] bg-[#FFF5EE] px-2.5 py-0.5 rounded-full border border-[#F0DFD5]">
            {dayInfo.date}
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#241913] tracking-tight mt-0.5">
          Festival Schedule (वेळापत्रक)
        </h2>
        <p className="text-xs text-[#6B5E57]">
          १४ सप्टेंबर ते २५ सप्टेंबर • Daily rituals, cultural events &amp; mankari list
        </p>

        {/* Day Selector Tabs with Dates */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar border-t border-[#F0DFD5]/70 mt-1">
          {FESTIVAL_DAYS_CONFIG.map((d) => {
            const isSelected = selectedDay === d.day;
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(d.day)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[64px] ${
                  isSelected
                    ? 'bg-[#8B2616] text-white shadow-xs'
                    : 'bg-[#FFF5EE] text-[#6B5E57] hover:bg-[#FFEAE0] border border-[#F0DFD5]'
                }`}
              >
                <span className="text-xs leading-tight">Day {d.day}</span>
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-white/90' : 'text-[#8B2616]'}`}>
                  {d.date}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Morning Ritual Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[#241913] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8B2616] text-[18px]">wb_twilight</span>
            Morning Ritual
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF7F0] border border-[#BDE5CE] text-xs font-semibold text-[#003D28]">
            <span className="material-symbols-outlined text-[14px] text-[#003D28]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            Completed
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-[#8B2616] tracking-tight">
                {publicContent?.morningAartiTime || '10:00 AM'}
              </span>
              <span className="text-xs font-semibold text-[#241913]">सकाळची आरती व स्तोत्र</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFF2EB] border border-[#F5DACB] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-[#8B2616]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B5E57] pt-1 border-t border-[#F0DFD5]/60">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#A23F1A]">church</span>
              Main Hall • मुख्य मंडप
            </span>
            <span className="inline-flex items-center gap-1 text-[#003D28] font-bold">
              Daily
            </span>
          </div>
        </div>
      </div>

      {/* Evening Maha Aarti Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[#8B2616] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              flare
            </span>
            Evening Maha Aarti
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF2EB] border border-[#F5DACB] text-xs font-semibold text-[#A23F1A]">
            <span className="material-symbols-outlined text-[14px]">alarm</span>
            Upcoming
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-3.5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-[#8B2616] tracking-tight">
                {publicContent?.eveningAartiTime || '08:00 PM'}
              </span>
              <span className="text-xs font-semibold text-[#241913]">संध्याकाळची महाआरती</span>
            </div>
            <button
              onClick={handleSetReminder}
              className="w-10 h-10 rounded-full bg-[#8B2616] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications_active
              </span>
            </button>
          </div>

          {/* Day-Wise Mankari Chips */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#F0DFD5]/60">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B2616]">
                <span className="material-symbols-outlined text-[16px]">family_restroom</span>
                Mankari List • मानकरी परिवार (Day {selectedDay})
              </span>
              <span className="text-xs text-[#6B5E57] font-semibold">{dayMankaris.length} Families</span>
            </div>

            {dayMankaris.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dayMankaris.map((mankari) => (
                  <span
                    key={mankari.id}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-[#FFF2EB] border border-[#F5DACB] text-xs font-semibold text-[#8B2616] shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#A23F1A]">house</span>
                    <span>{mankari.name || mankari.family}</span>
                    {mankari.flat && <span className="text-[#6B5E57] font-normal">({mankari.flat})</span>}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5] text-center text-xs text-[#6B5E57]">
                No mankari assigned for Day {selectedDay} yet.
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={handleSetReminder}
              className="w-full rounded-xl py-3 bg-[#8B2616] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              <span>{reminderSet ? 'Reminder Saved! ✓' : 'Set Aarti Reminder'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cultural Evening Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold text-[#241913] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#A23F1A] text-[18px]">theater_comedy</span>
            <span>Cultural Event • सांस्कृतिक कार्यक्रम</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF2EB] border border-[#F5DACB] text-xs font-bold text-[#8B2616]">
            Day {selectedDay} • {dayInfo.date}
          </span>
        </div>

        <div className="rounded-2xl p-4 bg-white/95 border border-[#F0DFD5] shadow-xs flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#241913] leading-tight">
                {eventForDay?.title || publicContent?.todayEvent || 'Cultural Performance'}
              </h3>
              {eventForDay?.marathiTitle && (
                <p className="text-xs font-semibold text-[#8B2616] mt-0.5">
                  {eventForDay.marathiTitle}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-[#6B5E57] font-medium bg-[#FFF5EE] px-2 py-0.5 rounded-md border border-[#F0DFD5]">
                  <span className="material-symbols-outlined text-[14px] text-[#A23F1A]">schedule</span>
                  <span>{eventForDay?.time || '06:00 PM'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#6B5E57] font-medium bg-[#FFF5EE] px-2 py-0.5 rounded-md border border-[#F0DFD5]">
                  <span className="material-symbols-outlined text-[14px] text-[#A23F1A]">pin_drop</span>
                  <span>{eventForDay?.location || 'Main Stage • मुख्य मंडप'}</span>
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EB] border border-[#F5DACB] text-[#8B2616] flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">nightlife</span>
            </div>
          </div>

          {/* Performers Badge if present */}
          {eventForDay?.performers && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6EE] rounded-xl border border-[#EAE0D2] text-xs text-[#7A1C16] font-semibold">
              <span className="material-symbols-outlined text-[15px] text-[#E65A15]">groups</span>
              <span>कलाकार: {eventForDay.performers}</span>
            </div>
          )}

          {/* Image & Description Banner */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-xs border border-[#F0DFD5]">
            <img
              className="w-full h-full object-cover"
              alt="Cultural Performance"
              src={eventForDay?.imageUrl || STITCH_CULTURAL_IMG}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-3">
              <span className="text-xs text-white font-semibold leading-snug">
                {eventForDay?.description || 'इंद्रायणी विहार बाल कलाकार व महिला मंडळाचे सादरीकरण'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Chant */}
      <div className="text-center py-2">
        <p className="text-sm text-[#8B2616] font-bold tracking-wide">॥ गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥</p>
        <p className="text-[11px] text-[#6B5E57] mt-0.5">Indrayani Vihar Mitra Mandal 2026</p>
      </div>
    </div>
  );
}
