import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { extractTextFromPdf, parseMankariListFromLines } from '../utils/mankariPdfParser';
import { FESTIVAL_DAYS_CONFIG, getFestivalDayInfo } from '../utils/festivalSchedule';
import { validateGoogleDriveUrl, validateUploadedFile, validateName, sanitizeText } from '../utils/validators';

export function EditPublicViewDrawer({ isOpen, onClose, initialTab = 'cultural' }) {
  const {
    config,
    updateMandalConfig,
    publicContent,
    updatePublicContent,
    mankariList,
    updateMankariList,
    addMankari,
    deleteMankari,
    culturalEvents,
    updateCulturalEvent
  } = useMandalData();

  const [activeTab, setActiveTab] = useState(initialTab || 'cultural'); // 'cultural', 'schedule', 'mankari', 'media'
  const [formData, setFormData] = useState({ ...publicContent });
  const [driveUrlInput, setDriveUrlInput] = useState(config.driveUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Day-Wise Cultural Performance State
  const [selectedCulturalDay, setSelectedCulturalDay] = useState(1);
  const selectedDayMeta = getFestivalDayInfo(selectedCulturalDay);
  const currentEvent = (culturalEvents || []).find((e) => Number(e.day) === selectedCulturalDay) || {
    day: selectedCulturalDay,
    dayLabel: selectedDayMeta.marathiLabel,
    date: selectedDayMeta.date,
    title: selectedDayMeta.defaultTitle || '',
    marathiTitle: selectedDayMeta.defaultMarathiTitle || '',
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
      const meta = getFestivalDayInfo(selectedCulturalDay);
      setCulturalForm({
        day: selectedCulturalDay,
        dayLabel: meta.marathiLabel,
        date: meta.date,
        title: meta.defaultTitle || '',
        marathiTitle: meta.defaultMarathiTitle || '',
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

  React.useEffect(() => {
    setDriveUrlInput(config.driveUrl || '');
  }, [config.driveUrl]);

  // Reset activeTab if initialTab changes when opening
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setErrorMessage('');
    }
  }, [isOpen, initialTab]);

  const handleSaveDriveLink = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const driveVal = validateGoogleDriveUrl(driveUrlInput);
    if (!driveVal.isValid) {
      setErrorMessage(driveVal.error);
      return;
    }

    updateMandalConfig({ driveUrl: driveVal.sanitized });
    setSuccessMessage('Centralised Google Drive link updated for Public View!');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSuccessMessage('');
    }, 2000);
  };

  // PDF Upload & Review state
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsedReviewList, setParsedReviewList] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');

  // Manual Mankari Add State
  const [newMankari, setNewMankari] = useState({
    day: 'Day 4',
    date: '10 Sept',
    family: '',
    aarti: 'Evening'
  });

  if (!isOpen) return null;

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const sanitizedData = {
      ...formData,
      morningAartiTime: sanitizeText(formData.morningAartiTime) || '10:00 AM',
      eveningAartiTime: sanitizeText(formData.eveningAartiTime) || '8:00 PM',
      varganiMessage: sanitizeText(formData.varganiMessage),
      announcementTitle: sanitizeText(formData.announcementTitle)
    };

    updatePublicContent(sanitizedData);
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

  const handleSaveCulturalEvent = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const titleVal = validateName(culturalForm.title, 2, 150);
    if (!titleVal.isValid) {
      setErrorMessage('कृपया कार्यक्रमाचे शीर्षक टाका (Please enter valid event title)');
      return;
    }

    const sanitizedEvent = {
      ...culturalForm,
      day: Number(selectedCulturalDay),
      title: titleVal.sanitized,
      marathiTitle: sanitizeText(culturalForm.marathiTitle),
      time: sanitizeText(culturalForm.time) || '06:00 PM',
      location: sanitizeText(culturalForm.location) || 'Main Stage (मुख्य मंडप)',
      performers: sanitizeText(culturalForm.performers),
      description: sanitizeText(culturalForm.description)
    };

    try {
      await updateCulturalEvent(selectedCulturalDay, sanitizedEvent);
      setSuccessMessage(`Day ${selectedCulturalDay} Performance timings & details saved!`);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSuccessMessage('');
      }, 2500);
    } catch (err) {
      setErrorMessage('जतन करताना त्रुटी आली (Failed to save event details)');
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    const fileVal = validateUploadedFile(file, ['application/pdf'], 10 * 1024 * 1024);
    if (!fileVal.isValid) {
      setErrorMessage(fileVal.error);
      return;
    }

    setPdfFileName(file.name);
    setIsParsingPdf(true);

    try {
      const lines = await extractTextFromPdf(file);
      const parsed = parseMankariListFromLines(lines);
      // Sanitize extracted strings
      const sanitizedParsed = parsed.map(item => ({
        ...item,
        family: sanitizeText(item.family)
      }));
      setParsedReviewList(sanitizedParsed);
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      setErrorMessage('PDF प्रक्रिया करताना त्रुटी आली (Failed to parse PDF).');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleReviewItemChange = (index, field, value) => {
    setParsedReviewList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: sanitizeText(value) };
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
        aarti: 'Evening'
      }
    ]);
  };

  const handleConfirmAndPublishMankaris = () => {
    if (parsedReviewList && parsedReviewList.length > 0) {
      const cleanedList = parsedReviewList.map(item => ({
        ...item,
        family: sanitizeText(item.family)
      }));
      updateMankariList(cleanedList);
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
    setErrorMessage('');

    const familyVal = validateName(newMankari.family, 2, 100);
    if (!familyVal.isValid) {
      setErrorMessage(familyVal.error);
      return;
    }

    addMankari({
      ...newMankari,
      family: familyVal.sanitized
    });

    setNewMankari({
      day: newMankari.day,
      date: newMankari.date,
      family: '',
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
        <div className="flex bg-[#FFF1EB] p-1 rounded-2xl mt-3 border border-[#F0DFD5] gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('cultural')}
            className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 min-w-[76px] cursor-pointer ${
              activeTab === 'cultural'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">theater_comedy</span>
            <span className="truncate">Events</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 min-w-[76px] cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">alarm</span>
            <span className="truncate">Aarti</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mankari')}
            className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 min-w-[76px] cursor-pointer ${
              activeTab === 'mankari'
                ? 'bg-[#8B2616] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">family_restroom</span>
            <span className="truncate">Mankari</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 min-w-[76px] cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#1C5D6C] text-white shadow-xs'
                : 'text-[#6B5E57] hover:text-[#241913] hover:bg-[#FFEAE0]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">photo_library</span>
            <span className="truncate">Drive</span>
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

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
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
                    Day {selectedCulturalDay} of 11 • {getFestivalDayInfo(selectedCulturalDay).date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {FESTIVAL_DAYS_CONFIG.map((d) => {
                    const isSelected = selectedCulturalDay === d.day;
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => setSelectedCulturalDay(d.day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[62px] ${
                          isSelected
                            ? 'bg-[#8B2616] text-white shadow-xs scale-100'
                            : 'bg-[#FFF5EE] text-[#6B5E57] hover:bg-[#FFEAE0] border border-[#F0DFD5]'
                        }`}
                      >
                        <span className="text-xs">Day {d.day}</span>
                        <span className={`text-[9.5px] font-semibold ${isSelected ? 'text-white/90' : 'text-[#8B2616]'}`}>
                          {d.date}
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

              {/* All 11 Days Schedule Overview */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#241913]">All 11 Days Cultural Schedule</h4>
                    <p className="text-[11px] text-[#6B5E57]">14 Sep – 25 Sep • Tap any day to edit</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#8B2616] bg-[#FFF1EB] px-2.5 py-0.5 rounded-full border border-[#F5DACB]">
                    11 Days Total
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
          ) : activeTab === 'mankari' ? (
            /* TAB 3: Mankari List & PDF Upload */
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
                          className="border border-[#D9C4B7] bg-[#FFF8F6] rounded-lg px-2 py-1 text-[11px] font-bold text-[#8B2616] outline-none shrink-0"
                        >
                          {FESTIVAL_DAYS_CONFIG.map((d) => (
                            <option key={d.day} value={`Day ${d.day}`}>Day {d.day} ({d.date})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.family}
                          onChange={(e) => handleReviewItemChange(idx, 'family', e.target.value)}
                          placeholder="Family name / कुटुंब नाव"
                          className="flex-1 border border-[#D9C4B7] bg-[#FFF8F6] rounded-lg px-2 py-1 text-xs font-semibold text-[#241913] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteReviewItem(idx)}
                          className="text-[#BA1A1A] hover:opacity-80 p-1 shrink-0"
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newMankari.day}
                    onChange={(e) => setNewMankari({ ...newMankari, day: e.target.value })}
                    className="border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-2.5 py-2 text-xs font-bold text-[#8B2616] outline-none sm:w-44 shrink-0"
                  >
                    {FESTIVAL_DAYS_CONFIG.map((d) => (
                      <option key={d.day} value={`Day ${d.day}`}>Day {d.day} ({d.date})</option>
                    ))}
                  </select>
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={newMankari.family}
                      onChange={(e) => setNewMankari({ ...newMankari, family: e.target.value })}
                      placeholder="Family name / कुटुंब नाव"
                      className="flex-1 border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#241913] outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#8B2616] text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8B2616] bg-[#FFEAE0] px-1.5 py-0.5 rounded">{m.day}</span>
                        <span className="font-bold text-[#241913]">{m.family}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMankari(m.id)}
                        className="text-[#BA1A1A] hover:opacity-80 p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               TAB 4: Centralised Google Drive Link (Photos & Videos)
            ========================================================================= */
            <form onSubmit={handleSaveDriveLink} className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-[#F0DFD5] shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E2F1F4] text-[#1C5D6C] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">photo_library</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1C5D6C]">Photos &amp; Videos Google Drive</h4>
                    <p className="text-[11px] text-[#6B5E57]">One single source of truth for public view</p>
                  </div>
                </div>

                <p className="text-xs text-[#57423E] leading-relaxed bg-[#FFF8F6] p-3 rounded-xl border border-[#F0DFD5]">
                  The Google Drive folder link entered here is the <strong>single stored source of truth</strong> across the entire app. Updating it here immediately updates the <em>Open Drive</em> and <em>Upload Photos</em> buttons on the Public Home screen across all devices.
                </p>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#241913] block" htmlFor="central-drive-url">
                    Google Drive Folder URL *
                  </label>
                  <input
                    id="central-drive-url"
                    type="url"
                    required
                    value={driveUrlInput}
                    onChange={(e) => setDriveUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full border border-[#D9C4B7] bg-[#FFF8F6] rounded-xl px-3.5 py-2.5 text-xs text-[#241913] font-mono focus:border-[#1C5D6C] outline-none"
                  />
                </div>

                {driveUrlInput && (
                  <div className="pt-1 flex items-center justify-between">
                    <a
                      href={driveUrlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1C5D6C] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Test Drive Link in New Tab</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1C5D6C] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#154652] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save &amp; Update Public View</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
