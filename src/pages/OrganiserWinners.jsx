import React, { useState, useMemo } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { autocorrectName, getNameSuggestions } from '../utils/nameAutocorrect';

export function OrganiserWinners({ onBack }) {
  const {
    gameWinners,
    addGameWinner,
    updateGameWinner,
    toggleGameWinnerVisibility,
    toggleGameGroupVisibility,
    deleteGameWinner,
    updateAllGameWinners
  } = useMandalData();

  // Form State for Adding New Game
  const [gameName, setGameName] = useState('Musical Chair');
  const [category, setCategory] = useState('');
  const [firstPlace, setFirstPlace] = useState('');
  const [secondPlace, setSecondPlace] = useState('');
  const [thirdPlace, setThirdPlace] = useState('');
  const [isPublicVisible, setIsPublicVisible] = useState(true);

  // Editing Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    gameName: '',
    category: '',
    first: '',
    second: '',
    third: '',
    isPublicVisible: true
  });

  // Search & Status Message State
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL'); // 'ALL', 'VISIBLE', 'HIDDEN'
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Common Presets
  const GAME_PRESETS = [
    'Musical Chair',
    'Slow Cycling',
    'Chamcha Limbu',
    'Plate Game',
    'Jump Game',
    'Balloon Competition'
  ];

  const CATEGORY_PRESETS = [
    'Kaku',
    'Vahini',
    'Girls (Kids)',
    'Girls',
    'Girls (Group 2)',
    'Boys',
    'Boys (Group 2)',
    'Boys (Group 3)',
    'Boys (Till 4th)',
    'Boys & Girls',
    'Kids',
    'Mens'
  ];

  // Filtered List
  const filteredWinners = useMemo(() => {
    let list = gameWinners || [];
    if (visibilityFilter === 'VISIBLE') {
      list = list.filter((gw) => gw.isHidden !== true);
    } else if (visibilityFilter === 'HIDDEN') {
      list = list.filter((gw) => gw.isHidden === true);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((gw) => {
      const matchGame = (gw.gameName || '').toLowerCase().includes(q);
      const matchCat = (gw.category || '').toLowerCase().includes(q);
      const match1 = (gw.first || gw.girls?.first || gw.boys?.first || '').toLowerCase().includes(q);
      const match2 = (gw.second || gw.girls?.second || gw.boys?.second || '').toLowerCase().includes(q);
      const match3 = (gw.third || gw.girls?.third || gw.boys?.third || '').toLowerCase().includes(q);
      return matchGame || matchCat || match1 || match2 || match3;
    });
  }, [gameWinners, searchQuery, visibilityFilter]);

  // Counts for tabs
  const visibleCount = useMemo(() => (gameWinners || []).filter((gw) => gw.isHidden !== true).length, [gameWinners]);
  const hiddenCount = useMemo(() => (gameWinners || []).filter((gw) => gw.isHidden === true).length, [gameWinners]);

  // Handle Add Game Form Submission
  const handleAddGame = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!gameName.trim()) {
      setErrorMsg('कृपया खेळाचे नाव निवडा किंवा प्रविष्ट करा (Please enter game name).');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('कृपया कॅटेगरी प्रविष्ट करा उदा. Kaku, Vahini, Girls, Boys, Mens... (Please enter category).');
      return;
    }

    // Auto-correct names before saving
    const cleanFirst = autocorrectName(firstPlace);
    const cleanSecond = autocorrectName(secondPlace);
    const cleanThird = autocorrectName(thirdPlace);

    addGameWinner({
      gameName: gameName.trim(),
      category: category.trim(),
      first: cleanFirst,
      second: cleanSecond,
      third: cleanThird,
      isHidden: !isPublicVisible
    });

    // Reset form
    setCategory('');
    setFirstPlace('');
    setSecondPlace('');
    setThirdPlace('');
    setIsPublicVisible(true);

    setSuccessMsg(
      !isPublicVisible
        ? 'खेळ विजेत्यांची नोंद सेव्ह झाली व लोकांपासून लपवली आहे (Saved as Hidden)!'
        : 'खेळ विजेत्यांची नोंद सेव्ह झाली व सार्वजनिक दिसेल (Saved as Live)!'
    );
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      id: item.id,
      gameName: item.gameName || 'Musical Chair',
      category: item.category || (item.girls ? 'Girls' : item.boys ? 'Boys' : 'General'),
      first: item.first || item.girls?.first || item.boys?.first || '',
      second: item.second || item.girls?.second || item.boys?.second || '',
      third: item.third || item.girls?.third || item.boys?.third || '',
      isPublicVisible: item.isHidden !== true
    });
  };

  // Save Edited Item
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.id) return;

    const cleanFirst = autocorrectName(editForm.first);
    const cleanSecond = autocorrectName(editForm.second);
    const cleanThird = autocorrectName(editForm.third);

    updateGameWinner(editForm.id, {
      gameName: editForm.gameName.trim(),
      category: editForm.category.trim(),
      first: cleanFirst,
      second: cleanSecond,
      third: cleanThird,
      isHidden: !editForm.isPublicVisible
    });

    setEditingItem(null);
    setSuccessMsg('विजेत्यांची माहिती यशस्वीरित्या अपडेट झाली! (Updated successfully)');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Auto-Correct All Records
  const handleAutoCorrectAll = () => {
    const correctedList = (gameWinners || []).map((item) => ({
      ...item,
      first: autocorrectName(item.first || item.girls?.first || item.boys?.first || ''),
      second: autocorrectName(item.second || item.girls?.second || item.boys?.second || ''),
      third: autocorrectName(item.third || item.girls?.third || item.boys?.third || '')
    }));

    updateAllGameWinners(correctedList);
    setSuccessMsg('सर्व नावांचे स्पेलिंग व फॉरमॅट स्वयंचलित दुरुस्त करण्यात आले! ✨ (All names autocorrected)');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownGameFilter, setBreakdownGameFilter] = useState('ALL');

  // Live Prize Requirements Calculation based dynamically on existing Games Data
  const prizeSummary = useMemo(() => {
    let firstReq = 0;
    let secondReq = 0;
    let thirdReq = 0;
    const gameBreakdown = {};

    (gameWinners || []).forEach((item) => {
      const gName = item.gameName || 'Other Games';
      if (!gameBreakdown[gName]) {
        gameBreakdown[gName] = {
          gameName: gName,
          firstCount: 0,
          secondCount: 0,
          thirdCount: 0,
          totalCount: 0,
          categories: []
        };
      }

      let has1st = false;
      let has2nd = false;
      let has3rd = false;

      // 1st place validation
      if (item.first && item.first.trim() && item.first !== '—' && item.first !== '-') {
        has1st = true;
        firstReq++;
      } else if (item.girls?.first && item.girls.first.trim() && item.girls.first !== '—') {
        has1st = true;
        firstReq++;
      } else if (item.boys?.first && item.boys.first.trim() && item.boys.first !== '—') {
        has1st = true;
        firstReq++;
      }

      // 2nd place validation
      if (item.second && item.second.trim() && item.second !== '—' && item.second !== '-') {
        has2nd = true;
        secondReq++;
      } else if (item.girls?.second && item.girls.second.trim() && item.girls.second !== '—') {
        has2nd = true;
        secondReq++;
      } else if (item.boys?.second && item.boys.second.trim() && item.boys.second !== '—') {
        has2nd = true;
        secondReq++;
      }

      // 3rd place validation
      if (item.third && item.third.trim() && item.third !== '—' && item.third !== '-') {
        has3rd = true;
        thirdReq++;
      } else if (item.girls?.third && item.girls.third.trim() && item.girls.third !== '—') {
        has3rd = true;
        thirdReq++;
      } else if (item.boys?.third && item.boys.third.trim() && item.boys.third !== '—') {
        has3rd = true;
        thirdReq++;
      }

      const catTotal = (has1st ? 1 : 0) + (has2nd ? 1 : 0) + (has3rd ? 1 : 0);
      gameBreakdown[gName].firstCount += (has1st ? 1 : 0);
      gameBreakdown[gName].secondCount += (has2nd ? 1 : 0);
      gameBreakdown[gName].thirdCount += (has3rd ? 1 : 0);
      gameBreakdown[gName].totalCount += catTotal;

      gameBreakdown[gName].categories.push({
        id: item.id,
        category: item.category || (item.girls ? 'Girls' : item.boys ? 'Boys' : 'General'),
        first: item.first || item.girls?.first || item.boys?.first || '',
        second: item.second || item.girls?.second || item.boys?.second || '',
        third: item.third || item.girls?.third || item.boys?.third || '',
        isHidden: item.isHidden === true,
        has1st,
        has2nd,
        has3rd,
        total: catTotal
      });
    });

    return {
      firstReq,
      secondReq,
      thirdReq,
      totalReq: firstReq + secondReq + thirdReq,
      games: Object.values(gameBreakdown)
    };
  }, [gameWinners]);

  return (
    <div className="flex flex-col w-full px-4 py-4 max-w-xl mx-auto space-y-6 pb-24 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white/95 border border-[#F0DFD5] p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="w-8 h-8 rounded-xl bg-[#FFF8F6] border border-[#D9C4B7] text-[#8B2616] flex items-center justify-center hover:bg-[#FAF6EE] active:scale-95 transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-[#8B2616] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">emoji_events</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-[#241913] leading-tight">Game Winners</h2>
            <span className="text-[11px] text-[#6B5E57]">खेळ व स्पर्धा विजेते व्यवस्थापन</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoCorrectAll}
            type="button"
            className="px-2.5 py-1 bg-[#FFF5EE] border border-[#F5DACB] text-[#8B2616] hover:bg-[#FFEAE0] active:scale-95 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Auto-Correct Spelling & Titles across all records"
          >
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            <span className="hidden sm:inline">Auto-Correct All</span>
          </button>
          <span className="text-xs font-bold text-[#8B2616] bg-[#FFEAE0] px-2.5 py-1 rounded-full border border-[#F5DACB]">
            {gameWinners.length} Entries
          </span>
        </div>
      </div>

      {/* Global Status Banner */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          PRIZE REQUIREMENTS CARD (LIVE CALCULATION - NEEDED PRIZES)
      ========================================================================= */}
      <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-[#F5E8D6] border border-[#EAE0D2] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE0D2] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#7A1C16] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#7A1C16] tracking-tight flex items-center gap-1.5">
                <span>Prize Requirements</span>
                <span className="text-xs font-normal text-[#8B2616]">(एकूण आवश्यक बक्षिसे)</span>
              </h3>
              <span className="text-[11px] text-[#6B5E57]">
                खेळांच्या नोंदींनुसार आवश्यक बक्षिसांची आकडेवारी (Live Calculation)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D9C4B7] text-[#7A1C16] hover:bg-[#FAF6EE] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              {showBreakdown ? 'expand_less' : 'table_chart'}
            </span>
            <span>{showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}</span>
          </button>
        </div>

        {/* 4 Cards Grid: 1st, 2nd, 3rd, and Total Needed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1st Prize */}
          <div className="bg-white/95 rounded-2xl p-3.5 border border-[#F7E1B5] shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#946200] flex items-center gap-1">
                <span>🥇</span> 1st Prize
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF8EB] text-[#946200] text-[10px] font-extrabold border border-[#F7E1B5]">
                आवश्यक
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1 border-t border-[#F7E1B5]/50">
              <span className="text-2xl font-black text-[#946200]">{prizeSummary.firstReq}</span>
              <span className="text-[11px] font-semibold text-[#6B5E57]">Prizes</span>
            </div>
          </div>

          {/* 2nd Prize */}
          <div className="bg-white/95 rounded-2xl p-3.5 border border-[#E2E5EB] shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B5563] flex items-center gap-1">
                <span>🥈</span> 2nd Prize
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F6F7F9] text-[#4B5563] text-[10px] font-extrabold border border-[#E2E5EB]">
                आवश्यक
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1 border-t border-[#E2E5EB]/50">
              <span className="text-2xl font-black text-[#4B5563]">{prizeSummary.secondReq}</span>
              <span className="text-[11px] font-semibold text-[#6B5E57]">Prizes</span>
            </div>
          </div>

          {/* 3rd Prize */}
          <div className="bg-white/95 rounded-2xl p-3.5 border border-[#ECD9C6] shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A23F1A] flex items-center gap-1">
                <span>🥉</span> 3rd Prize
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FAF3EB] text-[#A23F1A] text-[10px] font-extrabold border border-[#ECD9C6]">
                आवश्यक
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1 border-t border-[#ECD9C6]/50">
              <span className="text-2xl font-black text-[#A23F1A]">{prizeSummary.thirdReq}</span>
              <span className="text-[11px] font-semibold text-[#6B5E57]">Prizes</span>
            </div>
          </div>

          {/* Total Prizes */}
          <div className="bg-[#7A1C16] text-[#FAF6EE] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1">
                <span>🏆</span> Total Prizes
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[#FAF6EE] text-[10px] font-bold">
                एकूण
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1 border-t border-white/20">
              <span className="text-2xl font-black text-white">{prizeSummary.totalReq}</span>
              <span className="text-[11px] font-semibold text-white/80">Total Needed</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Accordion Section */}
        {showBreakdown && (
          <div className="bg-white/95 rounded-2xl p-3.5 border border-[#EAE0D2] shadow-2xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE0D2] pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#7A1C16] text-[18px]">list_alt</span>
                <span className="text-xs font-black text-[#241913]">Detailed Game Breakdown (खेळनिहाय तपशील)</span>
              </div>
              <span className="text-[11px] font-semibold text-[#8B2616] bg-[#FAF0E6] px-2 py-0.5 rounded-full border border-[#EAE0D2]">
                {prizeSummary.games.length} Games
              </span>
            </div>

            {/* Game Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setBreakdownGameFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  breakdownGameFilter === 'ALL'
                    ? 'bg-[#7A1C16] text-white shadow-2xs'
                    : 'bg-[#FAF6EE] text-[#6B5E57] border border-[#EAE0D2] hover:bg-[#FAF0E6]'
                }`}
              >
                All Games ({prizeSummary.totalReq})
              </button>
              {prizeSummary.games.map((g) => (
                <button
                  key={g.gameName}
                  type="button"
                  onClick={() => setBreakdownGameFilter(g.gameName)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    breakdownGameFilter === g.gameName
                      ? 'bg-[#7A1C16] text-white shadow-2xs'
                      : 'bg-[#FAF6EE] text-[#6B5E57] border border-[#EAE0D2] hover:bg-[#FAF0E6]'
                  }`}
                >
                  {g.gameName} ({g.totalCount})
                </button>
              ))}
            </div>

            {/* Games Breakdown Cards */}
            <div className="space-y-2.5 pt-1">
              {prizeSummary.games
                .filter((g) => breakdownGameFilter === 'ALL' || breakdownGameFilter === g.gameName)
                .map((g) => {
                  const isAllHidden = g.categories.length > 0 && g.categories.every((c) => c.isHidden);
                  return (
                    <div key={g.gameName} className="rounded-xl p-3 bg-[#FAF6EE] border border-[#EAE0D2] space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-bold text-[#241913] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#E65A15] text-[16px]">military_tech</span>
                          <span>{g.gameName}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#6B5E57] flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const newSetHidden = !isAllHidden;
                              toggleGameGroupVisibility(g.gameName, newSetHidden);
                              setSuccessMsg(
                                newSetHidden
                                  ? `${g.gameName} चे सर्व निकाल लोकांपासून लपवले (Hidden from Public)`
                                  : `${g.gameName} चे सर्व निकाल लोकांसाठी प्रकाशित केले (Published to Public)`
                              );
                              setTimeout(() => setSuccessMsg(''), 2500);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isAllHidden
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isAllHidden ? 'visibility_off' : 'visibility'}
                            </span>
                            <span>{isAllHidden ? 'Hidden (Click to Publish)' : 'Live (Click to Hide)'}</span>
                          </button>
                          <span className="text-[#946200]">🥇 {g.firstCount}</span>
                          <span className="text-[#4B5563]">🥈 {g.secondCount}</span>
                          <span className="text-[#A23F1A]">🥉 {g.thirdCount}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#7A1C16] text-white text-[10px]">
                            Total: {g.totalCount}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {g.categories.map((c) => (
                          <div
                            key={c.id}
                            className={`rounded-lg p-2 border flex flex-col gap-1 shadow-2xs ${
                              c.isHidden
                                ? 'bg-[#FFF9F2] border-amber-300/80'
                                : 'bg-white border-[#EAE0D2]'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1 border-b border-[#EAE0D2]/50">
                              <span className="font-bold text-[#8B2616] text-[11px] flex items-center gap-1">
                                <span>{c.category}</span>
                                {c.isHidden && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                                    Hidden
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-[#6B5E57] font-semibold">
                                {c.total} {c.total === 1 ? 'Prize' : 'Prizes'}
                              </span>
                            </div>
                          <div className="flex flex-col gap-0.5 text-[10.5px]">
                            {c.has1st && (
                              <div className="flex items-center justify-between text-[#946200]">
                                <span>🥇 1st:</span>
                                <span className="font-bold truncate max-w-[130px]">{c.first}</span>
                              </div>
                            )}
                            {c.has2nd && (
                              <div className="flex items-center justify-between text-[#4B5563]">
                                <span>🥈 2nd:</span>
                                <span className="font-semibold truncate max-w-[130px]">{c.second}</span>
                              </div>
                            )}
                            {c.has3rd && (
                              <div className="flex items-center justify-between text-[#A23F1A]">
                                <span>🥉 3rd:</span>
                                <span className="font-semibold truncate max-w-[130px]">{c.third}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Add Game Winners Form Card */}
      <form onSubmit={handleAddGame} className="bg-white/95 border border-[#F0DFD5] p-4 sm:p-5 rounded-2xl shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]/70">
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-[#241913] uppercase tracking-wider">Add New Competition / Category</h3>
            <span className="text-[11px] text-[#6B5E57]">स्पर्धा, गट व १, २, ३ क्रमांक विजेत्यांची नावे</span>
          </div>
          <span className="material-symbols-outlined text-[#8B2616] text-[18px]">add_circle</span>
        </div>

        {/* 1. Game Name Presets & Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#241913]">Game Name / खेळाचे नाव *</label>
          <div className="flex flex-wrap gap-1.5 pb-1">
            {GAME_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setGameName(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  gameName === p
                    ? 'bg-[#8B2616] text-white shadow-2xs'
                    : 'bg-[#FFF8F6] text-[#6B5E57] border border-[#F0DFD5] hover:bg-[#FFEAE0]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="उदा. Musical Chair, Slow Cycling, Chamcha Limbu..."
            className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-[#8B2616] outline-none"
          />
        </div>

        {/* 2. Category Presets & Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#241913]">Category / गट किंवा विभाग *</label>
          <div className="flex flex-wrap gap-1.5 pb-1">
            {CATEGORY_PRESETS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#8B2616] text-white shadow-2xs'
                    : 'bg-[#FFF8F6] text-[#6B5E57] border border-[#F0DFD5] hover:bg-[#FFEAE0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="उदा. Kaku, Vahini, Girls, Boys (1), Mens, Ranked..."
            className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-[#8B2616] outline-none"
          />
        </div>

        {/* 3. 1st, 2nd, 3rd Places with Suggestions */}
        <div className="space-y-2.5 pt-1 border-t border-[#F0DFD5]/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#241913]">Winners / विजेत्यांची नावे</span>
          </div>

          {/* 1st Place */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#946200] w-14 shrink-0 text-center bg-[#FFF8EB] border border-[#F7E1B5] py-1.5 rounded-lg">
                🥇 1st
              </span>
              <input
                type="text"
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                onBlur={() => setFirstPlace(autocorrectName(firstPlace))}
                placeholder="१ ले नाव (1st Place Winner)"
                className="flex-1 bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-1.5 text-xs font-medium focus:border-[#8B2616] outline-none"
              />
            </div>
            {firstPlace.trim() && getNameSuggestions(firstPlace).length > 0 && (
              <div className="flex items-center gap-1.5 pl-16 flex-wrap">
                <span className="text-[10px] text-[#6B5E57]">सुझाव:</span>
                {getNameSuggestions(firstPlace, 3).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setFirstPlace(sug)}
                    className="text-[10.5px] bg-[#FFEAE0] text-[#8B2616] px-2 py-0.5 rounded-md hover:bg-[#ffd9c7] font-semibold cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2nd Place */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4B5563] w-14 shrink-0 text-center bg-[#F6F7F9] border border-[#E2E5EB] py-1.5 rounded-lg">
                🥈 2nd
              </span>
              <input
                type="text"
                value={secondPlace}
                onChange={(e) => setSecondPlace(e.target.value)}
                onBlur={() => setSecondPlace(autocorrectName(secondPlace))}
                placeholder="२ रे नाव (2nd Place Winner)"
                className="flex-1 bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-1.5 text-xs font-medium focus:border-[#8B2616] outline-none"
              />
            </div>
            {secondPlace.trim() && getNameSuggestions(secondPlace).length > 0 && (
              <div className="flex items-center gap-1.5 pl-16 flex-wrap">
                <span className="text-[10px] text-[#6B5E57]">सुझाव:</span>
                {getNameSuggestions(secondPlace, 3).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setSecondPlace(sug)}
                    className="text-[10.5px] bg-[#FFEAE0] text-[#8B2616] px-2 py-0.5 rounded-md hover:bg-[#ffd9c7] font-semibold cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A23F1A] w-14 shrink-0 text-center bg-[#FAF3EB] border border-[#ECD9C6] py-1.5 rounded-lg">
                🥉 3rd
              </span>
              <input
                type="text"
                value={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.value)}
                onBlur={() => setThirdPlace(autocorrectName(thirdPlace))}
                placeholder="३ रे नाव (3rd Place Winner)"
                className="flex-1 bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-1.5 text-xs font-medium focus:border-[#8B2616] outline-none"
              />
            </div>
            {thirdPlace.trim() && getNameSuggestions(thirdPlace).length > 0 && (
              <div className="flex items-center gap-1.5 pl-16 flex-wrap">
                <span className="text-[10px] text-[#6B5E57]">सुझाव:</span>
                {getNameSuggestions(thirdPlace, 3).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setThirdPlace(sug)}
                    className="text-[10.5px] bg-[#FFEAE0] text-[#8B2616] px-2 py-0.5 rounded-md hover:bg-[#ffd9c7] font-semibold cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Public Visibility Toggle in Add Form */}
        <div className="pt-2 border-t border-[#F0DFD5]/60 flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#241913] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#8B2616]">
                {isPublicVisible ? 'visibility' : 'visibility_off'}
              </span>
              <span>Publish in Public Results (सार्वजनिक प्रदर्शन)</span>
            </span>
            <span className="text-[10.5px] text-[#6B5E57]">
              {isPublicVisible
                ? '🟢 हा निकाल वेबसाइटवर सर्वांना दिसेल (Live for public).'
                : '🟠 निकाल लपवला जाईल, फक्त आयोजकांना दिसेल (Hidden until published).'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPublicVisible((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              isPublicVisible
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isPublicVisible ? 'visibility' : 'visibility_off'}
            </span>
            <span>{isPublicVisible ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-[#8B2616] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#6b0e03] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Save Game Winners</span>
        </button>
      </form>

      {/* Search & Visibility Filter Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#6B5E57]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by game, category, or winner name / नाव शोधा..."
            className="w-full pl-9 pr-3 py-2 bg-white/95 border border-[#D9C4B7] rounded-xl text-xs text-[#241913] focus:border-[#8B2616] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              type="button"
              className="absolute right-3 text-[#6B5E57] hover:text-[#241913] text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills: All, Live, Hidden */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setVisibilityFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              visibilityFilter === 'ALL'
                ? 'bg-[#8B2616] text-white shadow-2xs'
                : 'bg-white border border-[#D9C4B7] text-[#6B5E57] hover:bg-[#FFF5EE]'
            }`}
          >
            <span>All Results</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${visibilityFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#FFF5EE] text-[#8B2616]'}`}>
              {gameWinners.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter('VISIBLE')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              visibilityFilter === 'VISIBLE'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white border border-[#D9C4B7] text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            <span>Live / Visible</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${visibilityFilter === 'VISIBLE' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
              {visibleCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter('HIDDEN')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              visibilityFilter === 'HIDDEN'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-white border border-[#D9C4B7] text-amber-900 hover:bg-amber-50'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">visibility_off</span>
            <span>Hidden</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${visibilityFilter === 'HIDDEN' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
              {hiddenCount}
            </span>
          </button>
        </div>
      </div>

      {/* Recorded Winners List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E57]">
            Recorded Competitions &amp; Categories ({filteredWinners.length})
          </span>
          {visibilityFilter !== 'ALL' && (
            <span className="text-[11px] font-semibold text-[#8B2616]">
              Filtering: {visibilityFilter === 'VISIBLE' ? 'Live Only' : 'Hidden Only'}
            </span>
          )}
        </div>

        {filteredWinners.length > 0 ? (
          <div className="space-y-3">
            {filteredWinners.map((gw) => {
              const firstVal = gw.first || gw.girls?.first || gw.boys?.first || '—';
              const secondVal = gw.second || gw.girls?.second || gw.boys?.second || '—';
              const thirdVal = gw.third || gw.girls?.third || gw.boys?.third || '—';
              const isHidden = gw.isHidden === true;

              return (
                <div
                  key={gw.id}
                  className={`border p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-2.5 transition-all ${
                    isHidden
                      ? 'bg-[#FFFDF9] border-amber-300/80 ring-1 ring-amber-200/50'
                      : 'bg-white/95 border-[#F0DFD5]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#F0DFD5]/70 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isHidden ? 'bg-amber-100 text-amber-800' : 'bg-[#FFEAE0] text-[#8B2616]'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">military_tech</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#241913] truncate">{gw.gameName}</h4>
                          {isHidden ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[11px]">visibility_off</span>
                              <span>Hidden from Public</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[11px]">visibility</span>
                              <span>Live on Website</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-[#8B2616]">
                          Category: {gw.category || (gw.girls ? 'Girls' : gw.boys ? 'Boys' : 'General')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* 1-Click Hide/Show Toggle Button */}
                      <button
                        onClick={async () => {
                          const newIsHidden = await toggleGameWinnerVisibility(gw.id);
                          setSuccessMsg(
                            newIsHidden
                              ? `${gw.gameName} (${gw.category || 'General'}) निकाल लोकांपासून लपवला आहे (Hidden from Public)`
                              : `${gw.gameName} (${gw.category || 'General'}) निकाल प्रकाशित केला आहे (Live on Public View)`
                          );
                          setTimeout(() => setSuccessMsg(''), 2500);
                        }}
                        type="button"
                        title={isHidden ? 'Click to show in Public' : 'Click to hide from Public'}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                          isHidden
                            ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isHidden ? 'visibility_off' : 'visibility'}
                        </span>
                        <span>{isHidden ? 'Hidden' : 'Live'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(gw)}
                        type="button"
                        title="Edit Winners"
                        className="px-2.5 py-1 rounded-lg bg-[#FFF5EE] border border-[#F5DACB] text-[#8B2616] hover:bg-[#FFEAE0] active:scale-95 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmId(gw.id)}
                        type="button"
                        title="Delete Record"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#BA1A1A] hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Places Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#FFF8EB] px-2.5 py-1.5 rounded-lg border border-[#F7E1B5]">
                      <span className="font-bold text-[#946200] text-[10.5px] shrink-0">🥇 1st:</span>
                      <span className="font-bold text-[#241913] truncate">{firstVal}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#F6F7F9] px-2.5 py-1.5 rounded-lg border border-[#E2E5EB]">
                      <span className="font-bold text-[#4B5563] text-[10.5px] shrink-0">🥈 2nd:</span>
                      <span className="font-semibold text-[#241913] truncate">{secondVal}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FAF3EB] px-2.5 py-1.5 rounded-lg border border-[#ECD9C6]">
                      <span className="font-bold text-[#A23F1A] text-[10.5px] shrink-0">🥉 3rd:</span>
                      <span className="font-semibold text-[#241913] truncate">{thirdVal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#6B5E57] bg-white rounded-2xl border border-[#F0DFD5]">
            No competition winners found matching your search.
          </div>
        )}
      </div>

      {/* Edit Winner Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full border border-[#F0DFD5] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF2EB] text-[#8B2616] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#241913]">Edit Competition Result</h3>
                  <span className="text-[11px] text-[#6B5E57]">विजेत्यांची माहिती संपादित करा</span>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 text-[#6B5E57] flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              {/* Game Name */}
              <div>
                <label className="text-xs font-bold text-[#241913] block mb-1">Game Name</label>
                <input
                  type="text"
                  required
                  value={editForm.gameName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, gameName: e.target.value }))}
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#8B2616] outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-[#241913] block mb-1">Category / विभाग</label>
                <input
                  type="text"
                  required
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#8B2616] outline-none"
                />
              </div>

              {/* 1st Place */}
              <div>
                <label className="text-xs font-bold text-[#946200] block mb-1">🥇 1st Place Winner</label>
                <input
                  type="text"
                  value={editForm.first}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, first: e.target.value }))}
                  onBlur={() => setEditForm((prev) => ({ ...prev, first: autocorrectName(prev.first) }))}
                  placeholder="1st Place (— if none)"
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs font-medium focus:border-[#8B2616] outline-none"
                />
              </div>

              {/* 2nd Place */}
              <div>
                <label className="text-xs font-bold text-[#4B5563] block mb-1">🥈 2nd Place Winner</label>
                <input
                  type="text"
                  value={editForm.second}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, second: e.target.value }))}
                  onBlur={() => setEditForm((prev) => ({ ...prev, second: autocorrectName(prev.second) }))}
                  placeholder="2nd Place (— if none)"
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs font-medium focus:border-[#8B2616] outline-none"
                />
              </div>

              {/* 3rd Place */}
              <div>
                <label className="text-xs font-bold text-[#A23F1A] block mb-1">🥉 3rd Place Winner</label>
                <input
                  type="text"
                  value={editForm.third}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, third: e.target.value }))}
                  onBlur={() => setEditForm((prev) => ({ ...prev, third: autocorrectName(prev.third) }))}
                  placeholder="3rd Place (— if none)"
                  className="w-full bg-[#FFF8F6] text-[#241913] border border-[#D9C4B7] rounded-xl px-3 py-2 text-xs font-medium focus:border-[#8B2616] outline-none"
                />
              </div>

              {/* Public Visibility Toggle in Edit Modal */}
              <div className="pt-2 border-t border-[#F0DFD5]/60 flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#241913] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#8B2616]">
                      {editForm.isPublicVisible ? 'visibility' : 'visibility_off'}
                    </span>
                    <span>Public Status (सार्वजनिक प्रदर्शन)</span>
                  </span>
                  <span className="text-[10.5px] text-[#6B5E57]">
                    {editForm.isPublicVisible
                      ? '🟢 Live on website (लोकांना दिसेल)'
                      : '🟠 Hidden from public (लोकांपासून लपवले)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm((prev) => ({ ...prev, isPublicVisible: !prev.isPublicVisible }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                    editForm.isPublicVisible
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {editForm.isPublicVisible ? 'visibility' : 'visibility_off'}
                  </span>
                  <span>{editForm.isPublicVisible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-[#6B5E57] font-semibold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm((prev) => ({
                      ...prev,
                      first: autocorrectName(prev.first),
                      second: autocorrectName(prev.second),
                      third: autocorrectName(prev.third)
                    }));
                  }}
                  className="px-3 py-2.5 bg-[#FFF5EE] border border-[#F5DACB] text-[#8B2616] hover:bg-[#FFEAE0] text-xs font-bold rounded-xl transition-all cursor-pointer"
                  title="Auto-correct names in this entry"
                >
                  ✨ Auto-Correct
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8B2616] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#6b0e03] transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-red-200 shadow-xl space-y-3.5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">delete_forever</span>
            </div>
            <h3 className="text-sm font-bold text-[#241913]">Delete Competition Record?</h3>
            <p className="text-xs text-[#6B5E57]">
              तुम्हाला ही नोंद कायमची हटवायची आहे का? (Are you sure you want to delete this result?)
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                type="button"
                className="flex-1 py-2.5 bg-slate-100 text-[#6B5E57] font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGameWinner(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setSuccessMsg('नोंद हटवण्यात आली (Deleted successfully)');
                  setTimeout(() => setSuccessMsg(''), 2500);
                }}
                type="button"
                className="flex-1 py-2.5 bg-red-700 text-white font-bold text-xs rounded-xl hover:bg-red-800 shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
