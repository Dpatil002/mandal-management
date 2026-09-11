import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { extractTextFromPdf, parseMankariListFromLines } from '../utils/mankariPdfParser';

export function EditPublicViewDrawer({ isOpen, onClose, initialTab = 'cultural' }) {
  const {
    publicContent,
    updatePublicContent,
    mankariList,
    updateMankariList,
    addMankari,
    deleteMankari,
    culturalEvents,
    updateCulturalEvent
  } = useMandalData();

  const [activeTab, setActiveTab] = useState(initialTab || 'cultural'); // 'cultural', 'schedule', 'mankari'
  const [formData, setFormData] = useState({ ...publicContent });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Day-Wise Cultural Performance State
  const [selectedCulturalDay, setSelectedCulturalDay] = useState(1);
  const currentEvent = (culturalEvents || []).find((e) => Number(e.day) === selectedCulturalDay) || {
    day: selectedCulturalDay,
    dayLabel: `Day ${selectedCulturalDay}`,
    date: `${selectedCulturalDay + 6} Sept`,
    title: '',
    marathiTitle: '',
    time: '06:00 PM',
    location: 'Main Stage (मुख्य मंडप)',
    performers: '',
    description: ''
  };

  const [culturalForm, setCulturalForm] = useState({ ...currentEvent });

  // Update cultural form when selected day changes
  React.useEffect(() => {
    const evt = (culturalEvents || []).find((e) => Number(e.day) === selectedCulturalDay);
    if (evt) {
      setCulturalForm({ ...evt });
    } else {
      setCulturalForm({
        day: selectedCulturalDay,
        dayLabel: `Day ${selectedCulturalDay}`,
        date: `${selectedCulturalDay + 6} Sept`,
        title: '',
        marathiTitle: '',
        time: '06:00 PM',
        location: 'Main Stage (मुख्य मंडप)',
        performers: '',
        description: ''
      });
    }
  }, [selectedCulturalDay, culturalEvents]);

  // Update formData if publicContent changes
  React.useEffect(() => {
    setFormData({ ...publicContent });
  }, [publicContent]);

  // Reset activeTab if initialTab changes when opening
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // PDF Upload & Review state
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsedReviewList, setParsedReviewList] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');

  // Manual Mankari Add State
  const [newMankari, setNewMankari] = useState({
    day: 'Day 4',
    date: '10 Sept',
    family: '',
    flat: '',
    aarti: 'Evening'
  });

  if (!isOpen) return null;

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    updatePublicContent(formData);
    setSuccessMessage('Aarti timings & messages updated!');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSuccessMessage('');
    }, 2000);
  };

  const handleCulturalFormChange = (e) => {
    const { name, value } = e.target;
    setCulturalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCulturalEvent = (e) => {
    e.preventDefault();
    updateCulturalEvent(selectedCulturalDay, culturalForm);
    setSuccessMessage(`Day ${selectedCulturalDay} Cultural Performance saved!`);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSuccessMessage('');
    }, 2000);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setIsParsingPdf(true);

    try {
      const lines = await extractTextFromPdf(file);
      const parsed = parseMankariListFromLines(lines);
      setParsedReviewList(parsed);
    } catch (err) {
      console.error('Failed to parse PDF:', err);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleReviewItemChange = (index, field, value) => {
    setParsedReviewList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteReviewItem = (index) => {
    setParsedReviewList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddReviewRow = () => {
    setParsedReviewList((prev) => [
      ...prev,
      {
        id: `mk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        day: 'Day 4',
        date: '10 Sept',
        family: 'नवीन परिवार',
        flat: 'A-101',
        aarti: 'Evening'
      }
    ]);
  };

  const handleConfirmAndPublishMankaris = () => {
    if (parsedReviewList && parsedReviewList.length > 0) {
      updateMankariList(parsedReviewList);
      setParsedReviewList(null);
      setPdfFileName('');
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    }
  };

  const handleAddManualMankari = (e) => {
    e.preventDefault();
    if (!newMankari.family.trim()) return;
    addMankari(newMankari);
    setNewMankari({
      day: newMankari.day,
      date: newMankari.date,
      family: '',
      flat: '',
      aarti: 'Evening'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      <div
        className="w-full max-w-lg bg-[#FFF8F6] border border-[#F0DFD5] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Strict Headline + Short Subheadline */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F0DFD5]">
          <div>
            <h3 className="text-lg font-bold text-[#8B2616]">Edit Public View</h3>
            <p className="text-xs text-[#6B5E57]">Update schedule &amp; mankari</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-[#FFF1EB] border border-[#F0DFD5] flex items-center justify-center text-[#6B5E57] hover:text-[#8B2616] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#FFF1EB] p-1 rounded-2xl mt-3 border border-[#F0DFD5] gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('cultural')}
            className={`flex-1 py-2 px-1 text-[11.5px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'cultural'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">theater_comedy</span>
            <span className="truncate">Cultural Events</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2 px-1 text-[11.5px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">alarm</span>
            <span className="truncate">Aarti &amp; Messages</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mankari')}
            className={`flex-1 py-2 px-1 text-[11.5px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'mankari'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">family_restroom</span>
            <span className="truncate">Mankari &amp; PDF</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-3 pb-2 space-y-4">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>{successMessage || 'Changes published to Public View!'}</span>
            </div>
          )}

          {activeTab === 'cultural' ? (
            /* =========================================================================
               TAB 1: DAY-WISE CULTURAL PERFORMANCES (CULTURAL EVENTS)
            ========================================================================= */
            <div className="space-y-4">
              {/* Day Selector Ribbon */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#8B2616] text-[18px]">calendar_month</span>
                    <h4 className="text-xs font-bold text-[#241913]">Select Festival Day (दिवस निवडा)</h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#8B2616] bg-[#FFF1EB] px-2 py-0.5 rounded-full border border-[#F5DACB]">
                    Day {selectedCulturalDay} of 10
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => {
                    const evt = (culturalEvents || []).find((e) => Number(e.day) === d);
                    const isSelected = selectedCulturalDay === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedCulturalDay(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[62px] ${
                          isSelected
                            ? 'bg-[#8B2616] text-white shadow-xs scale-100'
                            : 'bg-[#FFF5EE] text-[#6B5E57] hover:bg-[#FFEAE0] border border-[#F0DFD5]'
                        }`}
                      >
                        <span className="text-xs">Day {d}</span>
                        <span className={`text-[9.5px] font-normal ${isSelected ? 'text-white/80' : 'text-[#8B2616]'}`}>
                          {evt?.date || `${d + 6} Sept`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day-Wise Cultural Performance Edit Form */}
              <form onSubmit={handleSaveCulturalEvent} className="bg-white p-4 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]/70">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] text-[#8B2616] flex items-center justify-center shrink-0 border border-[#F5DACB]">
                      <span className="material-symbols-outlined text-[18px]">theater_comedy</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#8B2616]">
                        Edit Day {selectedCulturalDay} Performance
                      </h4>
                      <p className="text-[11px] text-[#6B5E57]">
                        {culturalForm.dayLabel || `Day ${selectedCulturalDay} Cultural Program`}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#EBF7F0] border border-[#BDE5CE] text-[11px] font-bold text-[#003D28]">
                    Day {selectedCulturalDay}
                  </span>
                </div>

                {/* Event Title */}
                <div>
                  <label className="text-[11px] font-bold text-[#241913] block mb-1">
                    Event Title (English / मुख्य शीर्षक) *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={culturalForm.title || ''}
                    onChange={handleCulturalFormChange}
                    placeholder="e.g. Children Dance, Drama & Skits"
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs font-bold text-[#241913] outline-none focus:border-[#8B2616]"
                  />
                </div>

                {/* Marathi Title / Subtitle */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">
                    Marathi Name / उपशीर्षक (मराठीत नाव)
                  </label>
                  <input
                    type="text"
                    name="marathiTitle"
                    value={culturalForm.marathiTitle || ''}
                    onChange={handleCulturalFormChange}
                    placeholder="उदा. बाल गोपाळ नृत्य, नाटिका व कलाविष्कार"
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616]"
                  />
                </div>

                {/* Time & Stage Location */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">
                      Event Time (वेळ)
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={culturalForm.time || ''}
                      onChange={handleCulturalFormChange}
                      placeholder="06:00 PM"
                      className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs font-bold text-[#241913] outline-none focus:border-[#8B2616]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">
                      Stage / Location (स्थान)
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={culturalForm.location || ''}
                      onChange={handleCulturalFormChange}
                      placeholder="Main Stage (मुख्य मंडप)"
                      className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616]"
                    />
                  </div>
                </div>

                {/* Performers / Group */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">
                    Performers / Group (कलाकार / मंडळ)
                  </label>
                  <input
                    type="text"
                    name="performers"
                    value={culturalForm.performers || ''}
                    onChange={handleCulturalFormChange}
                    placeholder="e.g. Indrayani Bal Kala Manch & Kids Group"
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616]"
                  />
                </div>

                {/* Description / Details */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">
                    Description &amp; Highlights (तपशील)
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    value={culturalForm.description || ''}
                    onChange={handleCulturalFormChange}
                    placeholder="उदा. इंद्रायणी विहार बाल कलाकार सादरीकरण व नृत्य स्पर्धा"
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616] resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#8B2616] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#6b0e03] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Day {selectedCulturalDay} Performance</span>
                </button>
              </form>

              {/* All 10 Days Schedule Overview */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#241913]">All 10 Days Cultural Schedule</h4>
                    <p className="text-[11px] text-[#6B5E57]">Tap any day to edit</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#8B2616] bg-[#FFF1EB] px-2.5 py-0.5 rounded-full">
                    10 Days Total
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(culturalEvents || []).map((item) => {
                    const isCur = Number(item.day) === selectedCulturalDay;
                    return (
                      <div
                        key={item.id || item.day}
                        onClick={() => setSelectedCulturalDay(Number(item.day))}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isCur
                            ? 'bg-[#FFF1EB] border-[#8B2616] shadow-2xs'
                            : 'bg-[#FFFDF9] border-[#F0DFD5] hover:border-[#D9C4B7]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`px-2 py-1 rounded-lg text-[11px] font-black shrink-0 ${
                            isCur ? 'bg-[#8B2616] text-white' : 'bg-[#FAF6EE] text-[#8B2616] border border-[#EAE0D2]'
                          }`}>
                            Day {item.day}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[#241913] truncate">
                              {item.title || 'Cultural Program'}
                            </span>
                            <span className="text-[11px] text-[#6B5E57] truncate">
                              {item.time || '06:00 PM'} • {item.location || 'Main Stage'}
                            </span>
                            {item.performers && (
                              <span className="text-[10.5px] text-[#8B2616] font-medium truncate">
                                🎭 {item.performers}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCulturalDay(Number(item.day));
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors cursor-pointer ${
                            isCur ? 'bg-[#8B2616] text-white' : 'bg-white border border-[#D9C4B7] text-[#8B2616] hover:bg-[#FFF1EB]'
                          }`}
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'schedule' ? (
            /* =========================================================================
               TAB 2: Aarti, General Times & Announcements
            ========================================================================= */
            <form onSubmit={handleSaveSchedule} className="space-y-3.5">
              {/* Aarti Times */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B2616] text-[18px]">alarm</span>
                  <h4 className="text-xs font-bold text-[#241913]">Aarti Timings</h4>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">Morning Aarti</label>
                    <input
                      type="text"
                      name="morningAartiTime"
                      value={formData.morningAartiTime || ''}
                      onChange={handleScheduleChange}
                      placeholder="10:00 AM"
                      className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs font-bold text-[#241913] outline-none focus:border-[#8B2616]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">Evening Maha Aarti</label>
                    <input
                      type="text"
                      name="eveningAartiTime"
                      value={formData.eveningAartiTime || ''}
                      onChange={handleScheduleChange}
                      placeholder="8:00 PM"
                      className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs font-bold text-[#241913] outline-none focus:border-[#8B2616]"
                    />
                  </div>
                </div>
              </div>

              {/* Vargani Message & Announcement */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B2616] text-[18px]">campaign</span>
                  <h4 className="text-xs font-bold text-[#241913]">Messages</h4>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">Vargani Message</label>
                  <input
                    type="text"
                    name="varganiMessage"
                    value={formData.varganiMessage || ''}
                    onChange={handleScheduleChange}
                    placeholder="सहकार्य आणि भक्तीभावाने उत्सव साजरा करूया."
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B5E57] block mb-1">Announcement</label>
                  <input
                    type="text"
                    name="announcementTitle"
                    value={formData.announcementTitle || ''}
                    onChange={handleScheduleChange}
                    placeholder="Grand Mahaprasad on Anant Chaturdashi"
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3 py-2 text-xs text-[#241913] outline-none focus:border-[#8B2616]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8B2616] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#731E11] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>Publish Schedule &amp; Messages</span>
              </button>
            </form>
          ) : (
            /* TAB 2: Mankari List & PDF Upload */
            <div className="space-y-4">
              {/* PDF Upload Area */}
              <div className="bg-white p-4 rounded-2xl border border-[#F0DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#8B2616]">Upload Mankari PDF</h4>
                    <p className="text-[11px] text-[#6B5E57]">Auto-extract day-wise names</p>
                  </div>
                  <span className="material-symbols-outlined text-[#8B2616] text-[22px]">picture_as_pdf</span>
                </div>

                <label className="border-2 border-dashed border-[#DEC0BA] hover:border-[#8B2616] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-[#FFF8F6] cursor-pointer transition-colors text-center">
                  <span className="material-symbols-outlined text-[#8B2616] text-[28px]">upload_file</span>
                  <span className="text-xs font-bold text-[#241913]">
                    {pdfFileName ? pdfFileName : 'Select PDF File'}
                  </span>
                  <span className="text-[11px] text-[#6B5E57]">Tap to choose schedule document</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>

                {isParsingPdf && (
                  <div className="flex items-center justify-center gap-2 text-xs text-[#8B2616] font-bold py-2">
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Extracting mankari list from PDF...</span>
                  </div>
                )}
              </div>

              {/* PDF Review Modal / Screen Section */}
              {parsedReviewList && (
                <div className="bg-[#FFF1EB] p-3.5 rounded-2xl border-2 border-[#FD8359] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#8B2616]">Review Extracted Mankaris</h4>
                      <p className="text-[11px] text-[#6B5E57]">{parsedReviewList.length} families found</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddReviewRow}
                      className="px-2.5 py-1 bg-[#8B2616] text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {parsedReviewList.map((item, idx) => (
                      <div key={item.id || idx} className="p-2.5 bg-white rounded-xl border border-[#F0DFD5] flex items-center gap-2 text-xs">
                        <select
                          value={item.day}
                          onChange={(e) => handleReviewItemChange(idx, 'day', e.target.value)}
                          className="border border-[#D9C4B7] bg-[#FFF8F6] rounded-lg px-2 py-1 text-[11px] font-bold text-[#8B2616] outline-none"
                        >
                          {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.family}
                          onChange={(e) => handleReviewItemChange(idx, 'family', e.target.value)}
                          placeholder="Family name"
                          className="flex-1 border border-[#D9C4B7] bg-[#FFF8F6] rounded-lg px-2 py-1 text-xs font-semibold text-[#241913] outline-none"
                        />
                        <input
                          type="text"
                          value={item.flat}
                          onChange={(e) => handleReviewItemChange(idx, 'flat', e.target.value)}
                          placeholder="Flat"
                          className="w-16 border border-[#D9C4B7] bg-[#FFF8F6] rounded-lg px-2 py-1 text-xs text-[#6B5E57] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteReviewItem(idx)}
                          className="text-[#BA1A1A] hover:opacity-80 p-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAndPublishMankaris}
                    className="w-full py-3 bg-[#14553C] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#003D28] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Confirm &amp; Publish</span>
                  </button>
                </div>
              )}

              {/* Manual Add Mankari Form */}
              <form onSubmit={handleAddManualMankari} className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] space-y-2.5">
                <h4 className="text-xs font-bold text-[#241913]">Add Mankari Manually</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newMankari.day}
                    onChange={(e) => setNewMankari({ ...newMankari, day: e.target.value })}
                    className="border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-2.5 py-2 text-xs font-bold text-[#8B2616] outline-none"
                  >
                    {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newMankari.flat}
                    onChange={(e) => setNewMankari({ ...newMankari, flat: e.target.value })}
                    placeholder="Flat (e.g. A-102)"
                    className="border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-2.5 py-2 text-xs text-[#241913] outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMankari.family}
                    onChange={(e) => setNewMankari({ ...newMankari, family: e.target.value })}
                    placeholder="Family name / कुटुंब नाव"
                    className="flex-1 border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#241913] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8B2616] text-white text-xs font-bold rounded-xl shrink-0"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Current Active Mankari List */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#241913]">Published Mankari List</h4>
                  <span className="text-[11px] text-[#6B5E57] font-semibold">{mankariList.length} families</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {mankariList.map((m) => (
                    <div key={m.id} className="p-2 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#8B2616] bg-[#FFEAE0] px-1.5 py-0.5 rounded mr-1.5">{m.day}</span>
                        <span className="font-bold text-[#241913]">{m.family}</span>
                        <span className="text-[#6B5E57] ml-1">({m.flat})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMankari(m.id)}
                        className="text-[#BA1A1A] hover:opacity-80 p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
