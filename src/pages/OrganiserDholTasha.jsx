import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateName, validatePhone, validateAmount, sanitizeText } from '../utils/validators';

const STITCH_DHOL_PHOTO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYguzE_lt-isdX2R5wvMAf2fxQ24f31kWXNo4SKCDbNyTH-aHiKn7j8OqWRmndXmkja_RS9lm_K5_-tZee7Pr_KUAe0D8LBDnUN6_1dMmoO7eVU7NgWX1Rhe7c8llYjJUDtrGEO9ph10CFYMt_md4K4fEjMTCC38sZrp3Ns-Z2PYHUulPOeKbH70qgQil71TOOnHPW1xQg0NuLD0PkVzRVPKvUGP6Pani3VP1x-w0vAy9j7yD3Udgmgw';

export function OrganiserDholTasha() {
  const {
    dholInventory,
    dholMaintenance,
    dholStorage,
    addDholMaintenance,
    addDholStorage,
    updateDholStorage,
    deleteDholStorage,
    stats
  } = useMandalData();

  // Active sub-tab or view toggle (Optional overview vs storage vs maintenance)
  const [activeTab, setActiveTab] = useState('storage'); // 'storage', 'inventory', 'maintenance'

  // Storage Form State
  const [isAddingStorage, setIsAddingStorage] = useState(false);
  const [editingStorageId, setEditingStorageId] = useState(null);
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [dholCount, setDholCount] = useState(4);
  const [tashaCount, setTashaCount] = useState(2);
  const [storageStatus, setStorageStatus] = useState('In Storage');
  const [storageNotes, setStorageNotes] = useState('');
  const [storageError, setStorageError] = useState('');

  // Maintenance Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [instrumentType, setInstrumentType] = useState('Dhol Leather Tightening & Strings');
  const [amount, setAmount] = useState('');
  const [servicedBy, setServicedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceError, setServiceError] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  const totalUnits =
    (Number(dholInventory?.dhol) || 0) +
    (Number(dholInventory?.tasha) || 0) +
    (Number(dholInventory?.dhwaja) || 0) +
    (Number(dholInventory?.tol) || 0);

  // Storage Aggregates
  const totalStoredDhols = (dholStorage || [])
    .filter((s) => s.status === 'In Storage')
    .reduce((sum, s) => sum + (Number(s.dholCount) || 0), 0);

  const totalStoredTashas = (dholStorage || [])
    .filter((s) => s.status === 'In Storage')
    .reduce((sum, s) => sum + (Number(s.tashaCount) || 0), 0);

  // Open Add Storage
  const handleOpenAddStorage = () => {
    setEditingStorageId(null);
    setPersonName('');
    setPhone('');
    setLocation('');
    setDholCount(4);
    setTashaCount(2);
    setStorageStatus('In Storage');
    setStorageNotes('');
    setStorageError('');
    setIsAddingStorage(true);
  };

  // Open Edit Storage
  const handleEditStorage = (item) => {
    setEditingStorageId(item.id);
    setPersonName(item.personName || '');
    setPhone(item.phone || '');
    setLocation(item.location || '');
    setDholCount(item.dholCount || 0);
    setTashaCount(item.tashaCount || 0);
    setStorageStatus(item.status || 'In Storage');
    setStorageNotes(item.notes || '');
    setStorageError('');
    setIsAddingStorage(true);
  };

  // Save Storage (Add or Update)
  const handleSaveStorage = (e) => {
    e.preventDefault();
    setStorageError('');

    const nameVal = validateName(personName, 2, 100);
    if (!nameVal.isValid) {
      setStorageError(nameVal.error);
      return;
    }

    let cleanPhone = '';
    if (phone.trim()) {
      const phoneVal = validatePhone(phone);
      if (!phoneVal.isValid) {
        setStorageError(phoneVal.error);
        return;
      }
      cleanPhone = phoneVal.cleanPhone;
    }

    const dNum = Math.max(0, parseInt(dholCount, 10) || 0);
    const tNum = Math.max(0, parseInt(tashaCount, 10) || 0);

    if (dNum > 100 || tNum > 100) {
      setStorageError('संख्या मर्यादा १०० पेक्षा जास्त असू शकत नाही (Count cannot exceed 100)');
      return;
    }

    if (dNum === 0 && tNum === 0) {
      setStorageError('किमान १ ढोल किंवा १ ताशा नोंदवा (At least 1 Dhol or Tasha required)');
      return;
    }

    if (editingStorageId) {
      updateDholStorage(editingStorageId, {
        personName: nameVal.sanitized,
        phone: cleanPhone,
        location: sanitizeText(location) || 'सोसायटी साठवणूक',
        dholCount: dNum,
        tashaCount: tNum,
        status: storageStatus,
        notes: sanitizeText(storageNotes)
      });
    } else {
      addDholStorage({
        personName: nameVal.sanitized,
        phone: cleanPhone,
        location: sanitizeText(location) || 'सोसायटी साठवणूक',
        dholCount: dNum,
        tashaCount: tNum,
        status: storageStatus,
        notes: sanitizeText(storageNotes)
      });
    }

    setIsAddingStorage(false);
    setEditingStorageId(null);
  };

  // Delete Storage Item
  const handleDeleteStorage = (id) => {
    deleteDholStorage(id);
    setDeletingId(null);
  };

  // Handle Service Add
  const handleAddService = (e) => {
    e.preventDefault();
    setServiceError('');

    const amtVal = validateAmount(amount, 1, 500000);
    if (!amtVal.isValid) {
      setServiceError(amtVal.error);
      return;
    }

    addDholMaintenance({
      instrumentType: sanitizeText(instrumentType) || 'Dhol Service',
      amount: amtVal.value,
      servicedBy: sanitizeText(servicedBy) || 'स्थानिक वादक केंद्र',
      notes: sanitizeText(notes),
      date: new Date().toISOString()
    });

    setAmount('');
    setServicedBy('');
    setNotes('');
    setIsAddingService(false);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-2 pb-24 max-w-xl mx-auto space-y-6 sm:space-y-7 font-['Plus_Jakarta_Sans','Mukta',sans-serif] animate-fade-in">
      
      {/* Hero Banner Card */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xs bg-[#FFF1EB] border border-[#F0DFD5]">
        <div className="relative h-24 sm:h-28 w-full">
          <img
            alt="Dhol-Tasha"
            className="w-full h-full object-cover"
            src={STITCH_DHOL_PHOTO}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#6B0E03]/90 via-[#6B0E03]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#E65A15] text-[11px] font-black tracking-wider uppercase shadow-xs">
                Indrayani Yuva Pathak
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-white bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                {totalUnits} Total Units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-[#F0DFD5] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('storage')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'storage'
              ? 'bg-[#7A1C16] text-white shadow-xs'
              : 'text-[#57423E] hover:bg-[#FAF4ED]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">warehouse</span>
          <span>Storage ({dholStorage?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#7A1C16] text-white shadow-xs'
              : 'text-[#57423E] hover:bg-[#FAF4ED]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>Live Stock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-[#7A1C16] text-white shadow-xs'
              : 'text-[#57423E] hover:bg-[#FAF4ED]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">build</span>
          <span>Repairs</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: INVENTORY GIVEN TO STORAGE (CORE USER REQUEST)
      ========================================================================= */}
      {activeTab === 'storage' && (
        <div className="flex flex-col gap-3.5 animate-fade-in">
          
          {/* Storage Summary Highlights Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF4ED] to-[#F5E8D6] rounded-3xl p-4 sm:p-5 border border-[#EAE0D2] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#7A1C16] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">inventory</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#241913]">Storage Distribution</h2>
                  <p className="text-[11px] text-[#6B5E57]">साठवणुकीसाठी दिलेल्या वाद्यांची नोंद</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddStorage}
                className="px-3 py-1.5 rounded-xl bg-[#7A1C16] hover:bg-[#63140F] text-white font-bold text-xs shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+ Add Record</span>
              </button>
            </div>

            {/* Storage Metric Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white rounded-2xl p-3 border border-[#F0DFD5] text-center shadow-xs">
                <span className="text-lg sm:text-xl font-black text-[#7A1C16] block">
                  {totalStoredDhols} / {dholInventory?.dhol ?? 0}
                </span>
                <span className="text-[11px] font-bold text-[#57423E]">Dhols in Storage</span>
                <span className="text-[10px] text-[#A23F1A] block font-medium mt-0.5">साठवणुकीतील ढोल</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-[#F0DFD5] text-center shadow-xs">
                <span className="text-lg sm:text-xl font-black text-[#E65A15] block">
                  {totalStoredTashas} / {dholInventory?.tasha ?? 0}
                </span>
                <span className="text-[11px] font-bold text-[#57423E]">Tashas in Storage</span>
                <span className="text-[10px] text-[#A23F1A] block font-medium mt-0.5">साठवणुकीतील ताशा</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-[#F0DFD5] text-center shadow-xs">
                <span className="text-lg sm:text-xl font-black text-[#14553C] block">
                  {dholStorage?.length || 0}
                </span>
                <span className="text-[11px] font-bold text-[#57423E]">Custodians</span>
                <span className="text-[10px] text-[#14553C] block font-medium mt-0.5">एकूण साठेदार</span>
              </div>
            </div>
          </div>

          {/* Add / Edit Storage Modal / Drawer Form */}
          {isAddingStorage && (
            <div className="bg-white rounded-3xl p-5 border-2 border-[#7A1C16] shadow-md animate-slide-up space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFEAE0] text-[#7A1C16] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#7A1C16] uppercase tracking-wider">
                    {editingStorageId ? 'संपादित करा (Edit Storage Record)' : '+ नवीन साठवणूक वाटप नोंद'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingStorage(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF4ED] text-[#6B5E57] hover:text-[#241913] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {storageError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {storageError}
                </div>
              )}

              <form onSubmit={handleSaveStorage} className="space-y-3">
                {/* Person Name */}
                <div>
                  <label className="block text-xs font-bold text-[#6B5E57] mb-1" htmlFor="storage-person-name">
                    साहित्य ज्यांच्याकडे दिले त्यांचे नाव (Person Name) *
                  </label>
                  <input
                    id="storage-person-name"
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="उदा. सचिन जोशी / विजय पवार"
                    className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D9C4B7] rounded-xl text-xs font-bold text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B5E57] mb-1" htmlFor="storage-phone">
                      मोबाईल नंबर (Phone)
                    </label>
                    <input
                      id="storage-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98220 XXXXX"
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D9C4B7] rounded-xl text-xs font-semibold text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                    />
                  </div>

                  {/* Storage Location */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B5E57] mb-1" htmlFor="storage-loc">
                      साठवणूक जागा (Storage Location)
                    </label>
                    <input
                      id="storage-loc"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="उदा. A-Wing Parking / B-304"
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D9C4B7] rounded-xl text-xs font-semibold text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                    />
                  </div>
                </div>

                {/* Counts: Dhols & Tashas */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#FFF8F6] border border-[#F0DFD5]">
                  {/* Dhol Count */}
                  <div>
                    <label className="block text-xs font-bold text-[#7A1C16] mb-1" htmlFor="storage-dhol-count">
                      🥁 ढोल संख्या (Number of Dhols) *
                    </label>
                    <input
                      id="storage-dhol-count"
                      type="number"
                      min="0"
                      value={dholCount}
                      onChange={(e) => setDholCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm font-black text-[#7A1C16] focus:outline-none focus:border-[#7A1C16] text-center"
                    />
                  </div>

                  {/* Tasha Count */}
                  <div>
                    <label className="block text-xs font-bold text-[#E65A15] mb-1" htmlFor="storage-tasha-count">
                      🪘 ताशा संख्या (Number of Tashas) *
                    </label>
                    <input
                      id="storage-tasha-count"
                      type="number"
                      min="0"
                      value={tashaCount}
                      onChange={(e) => setTashaCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-sm font-black text-[#E65A15] focus:outline-none focus:border-[#E65A15] text-center"
                    />
                  </div>
                </div>

                {/* Status & Notes */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#6B5E57] mb-1">
                      स्थिती (Status)
                    </label>
                    <select
                      value={storageStatus}
                      onChange={(e) => setStorageStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D9C4B7] rounded-xl text-xs font-bold text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                    >
                      <option value="In Storage">साठवणुकीत (In Storage)</option>
                      <option value="Returned">परत आले (Returned / Mandap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6B5E57] mb-1">
                      शेरा / साहित्य तपशील (Notes)
                    </label>
                    <input
                      type="text"
                      value={storageNotes}
                      onChange={(e) => setStorageNotes(e.target.value)}
                      placeholder="उदा. दांड्या व स्टँडसह"
                      className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D9C4B7] rounded-xl text-xs text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                    />
                  </div>
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingStorage(false)}
                    className="flex-1 py-2.5 bg-[#FAF4ED] text-[#57423E] font-bold text-xs rounded-xl hover:bg-[#F0DFD5] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#7A1C16] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#63140F] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{editingStorageId ? 'Update Record' : 'Save Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Storage Assignments */}
          <div className="flex flex-col gap-2.5">
            {dholStorage && dholStorage.length > 0 ? (
              dholStorage.map((item) => {
                const isInStorage = item.status === 'In Storage';
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-white border border-[#EAE0D2] shadow-xs flex flex-col gap-3 hover:border-[#DEC0BA] transition-all"
                  >
                    {/* Header Row: Person Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7A1C16] to-[#A23F1A] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                          {item.personName ? item.personName.charAt(0) : 'क'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-sm font-bold text-[#241913] truncate">
                            {item.personName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B5E57] mt-0.5">
                            <span className="material-symbols-outlined text-[14px] text-[#A23F1A]">pin_drop</span>
                            <span className="truncate">{item.location || 'सोसायटी साठवणूक'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border ${
                          isInStorage
                            ? 'bg-[#E65A15]/10 text-[#A23F1A] border-[#E65A15]/20'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isInStorage ? '📦 In Storage' : '✓ Returned'}
                      </span>
                    </div>

                    {/* Inventory Assigned Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F0DFD5]">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1EB] border border-[#F0DFD5]">
                        <span className="text-sm font-black text-[#7A1C16]">
                          {item.dholCount || 0}
                        </span>
                        <span className="text-xs font-bold text-[#7A1C16]">Dhols (ढोल)</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8F6] border border-[#F0DFD5]">
                        <span className="text-sm font-black text-[#E65A15]">
                          {item.tashaCount || 0}
                        </span>
                        <span className="text-xs font-bold text-[#E65A15]">Tashas (ताशा)</span>
                      </div>

                      {item.notes && (
                        <span className="text-[11px] text-[#6B5E57] italic ml-auto truncate max-w-[150px]">
                          "{item.notes}"
                        </span>
                      )}
                    </div>

                    {/* Footer Row: Phone Actions & Edit/Delete Controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#FAF4ED]">
                      {item.phone ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${item.phone}`}
                            className="flex items-center gap-1 text-xs font-semibold text-[#14553C] bg-[#14553C]/10 hover:bg-[#14553C] hover:text-white px-2.5 py-1 rounded-lg transition-all"
                            title={`Call ${item.personName}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">call</span>
                            <span>+91 {item.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${item.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg text-[#128C7E] hover:bg-[#25D366]/15 transition-all"
                            title="WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6B5E57]">No contact saved</span>
                      )}

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditStorage(item)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] text-[#57423E] hover:bg-[#7A1C16] hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete assignment"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation */}
                    {deletingId === item.id && (
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 animate-fade-in">
                        <span className="text-xs font-bold text-red-800">
                          खात्री आहे? ही साठवणूक नोंद काढून टाकायची आहे?
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 bg-white text-xs font-semibold rounded-lg border border-red-200 text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStorage(item.id)}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#F0DFD5] text-xs text-[#6B5E57]">
                कोणतीही साठवणूक नोंद उपलब्ध नाही. वरील बटणावर क्लिक करून नवीन नोंद जोडा.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE INVENTORY STOCK
      ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Dhol Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                  <span className="material-symbols-outlined text-[20px]">album</span>
                </div>
                <span className="text-2xl font-black text-[#6B0E03]">{dholInventory?.dhol ?? 0}</span>
              </div>
              <div>
                <h3 className="text-sm text-[#241913] font-bold">Dhol (ढोल)</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs text-[#6B5E57]">{totalStoredDhols} in storage</span>
                </div>
              </div>
            </div>

            {/* Tasha Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                  <span className="material-symbols-outlined text-[20px]">radio_button_checked</span>
                </div>
                <span className="text-2xl font-black text-[#6B0E03]">{dholInventory?.tasha ?? 0}</span>
              </div>
              <div>
                <h3 className="text-sm text-[#241913] font-bold">Tasha (ताशा)</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs text-[#6B5E57]">{totalStoredTashas} in storage</span>
                </div>
              </div>
            </div>

            {/* Dhwaja Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </div>
                <span className="text-2xl font-black text-[#6B0E03]">{dholInventory?.dhwaja ?? 0}</span>
              </div>
              <div>
                <h3 className="text-sm text-[#241913] font-bold">Dhwaja (भगवे ध्वज)</h3>
                <span className="text-[11px] text-emerald-800 font-semibold block mt-1">सजलेले व सज्ज</span>
              </div>
            </div>

            {/* Tol Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#F0DFD5] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FFEAE0] flex items-center justify-center text-[#6B0E03]">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </div>
                <span className="text-2xl font-black text-[#6B0E03]">{dholInventory?.tol ?? 0}</span>
              </div>
              <div>
                <h3 className="text-sm text-[#241913] font-bold">Tol (टोल / झांज)</h3>
                <span className="text-[11px] text-[#6B5E57] block mt-1">{dholInventory?.tol ? `${dholInventory.tol} Pairs Ready` : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MAINTENANCE & REPAIRS
      ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div className="flex flex-col gap-3.5 animate-fade-in">
          {/* Total Spend Card */}
          <div className="w-full rounded-2xl bg-white p-4 border border-[#F0DFD5] shadow-xs flex flex-col gap-3">
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

          {/* Action Button */}
          <button
            onClick={() => setIsAddingService(!isAddingService)}
            className="w-full rounded-xl py-3 px-4 bg-[#8B2616] hover:bg-[#731E11] text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Add Maintenance Cost</span>
          </button>

          {/* Inline Form */}
          {isAddingService && (
            <div className="p-4 rounded-2xl bg-white border-2 border-[#8B2616] shadow-md animate-slide-up space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0DFD5]">
                <h3 className="text-xs font-bold text-[#8B2616] uppercase tracking-wider">
                  + वाद्य दुरुस्ती नोंद
                </h3>
                <button
                  onClick={() => setIsAddingService(false)}
                  className="p-1 rounded-full text-[#6B5E57] hover:text-[#241913] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {serviceError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {serviceError}
                </div>
              )}

              <form onSubmit={handleAddService} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#6B5E57] mb-1">दुरुस्ती प्रकार *</label>
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
                  Save Record
                </button>
              </form>
            </div>
          )}

          {/* Service Log List */}
          <div className="space-y-2 mt-1">
            {dholMaintenance.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#F0DFD5] text-xs text-[#6B5E57]">
                कोणतीही देखभाल नोंद उपलब्ध नाही.
              </div>
            ) : (
              dholMaintenance.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#F0DFD5] shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFEAE0] text-[#8B2616] flex items-center justify-center shrink-0 mt-0.5">
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
      )}

    </div>
  );
}
