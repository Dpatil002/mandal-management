import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function OrganisersDrawer({ isOpen, onClose }) {
  const { organizers, addOrganizer, updateOrganizer, removeOrganizer, currentOrganizer } = useAuth();

  // Add Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addError, setAddError] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');

  // Remove Confirmation State
  const [confirmDeleteOrg, setConfirmDeleteOrg] = useState(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setAddError('');

    if (!newName.trim()) {
      setAddError('Please enter organiser name / कृपया नाव टाका.');
      return;
    }
    if (!newPhone.trim() || newPhone.replace(/\D/g, '').length < 10) {
      setAddError('Please enter a valid 10-digit phone number / योग्य १०-अंकी मोबाईल नंबर टाका.');
      return;
    }

    addOrganizer({ name: newName.trim(), phone: newPhone.trim() });
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleStartEdit = (org) => {
    setEditingId(org.id);
    setEditName(org.name);
    setEditPhone(org.phone ? org.phone.replace(/\D/g, '').slice(-10) : '');
    setEditError('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Please enter name / कृपया नाव टाका.');
      return;
    }
    if (!editPhone.trim() || editPhone.replace(/\D/g, '').length < 10) {
      setEditError('Please enter a valid 10-digit phone number / योग्य १०-अंकी मोबाईल नंबर टाका.');
      return;
    }

    updateOrganizer(editingId, { name: editName.trim(), phone: editPhone.trim() });
    setEditingId(null);
  };

  const handleConfirmRemove = () => {
    if (confirmDeleteOrg) {
      removeOrganizer(confirmDeleteOrg.id);
      setConfirmDeleteOrg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-fade-in font-['Plus_Jakarta_Sans','Mukta',sans-serif]">
      <div
        className="w-full max-w-lg bg-[#FAF6EE] border border-[#EAE0D2] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EAE0D2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1C16] text-[#FAF6EE] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-[#7A1C16] leading-tight">Organisers List</h3>
              <span className="text-xs text-[#6B5E57]">कार्यकर्ते व्यवस्थापन • {organizers.length} Members</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B5E57] hover:text-[#241913] hover:bg-[#F2EADB] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Add Organiser CTA / Form */}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setAddError('');
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#7A1C16] text-[#FAF6EE] font-bold text-xs shadow-sm hover:bg-[#63140F] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add Organiser • नवीन कार्यकर्ता</span>
          </button>
        ) : (
          <div className="rounded-2xl p-4 bg-[#FFFDF9] border border-[#EAE0D2] shadow-xs flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#7A1C16]">New Organiser Registration</h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-[#6B5E57] hover:text-[#241913] font-semibold"
              >
                Cancel
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6B5E57] mb-1">Full Name (पूर्ण नाव) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Shinde"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DECDB9] rounded-xl text-xs text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B5E57] mb-1">Mobile Number (मोबाईल नंबर) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-[#6B5E57] font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98220 XXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-[#DECDB9] rounded-xl text-xs text-[#241913] focus:outline-none focus:border-[#7A1C16]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#7A1C16] text-[#FAF6EE] font-bold text-xs shadow-xs hover:bg-[#63140F] transition-all cursor-pointer"
                >
                  Save Organiser • नोंदवा
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#DECDB9] text-[#6B5E57] font-bold text-xs hover:bg-[#F2EADB] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Organisers List */}
        <div className="flex flex-col gap-2.5">
          {organizers.map((org) => {
            const isSelf = currentOrganizer?.id === org.id;
            const isCurrentlyEditing = editingId === org.id;

            if (isCurrentlyEditing) {
              return (
                <div
                  key={org.id}
                  className="rounded-2xl p-3.5 bg-[#FFFDF9] border-2 border-[#7A1C16] shadow-xs flex flex-col gap-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7A1C16]">Edit Organiser</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-[#6B5E57] hover:text-[#241913]"
                    >
                      Cancel
                    </button>
                  </div>

                  {editError && (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      {editError}
                    </div>
                  )}

                  <form onSubmit={handleSaveEdit} className="flex flex-col gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B5E57] mb-0.5">Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DECDB9] rounded-xl text-xs text-[#241913]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B5E57] mb-0.5">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DECDB9] rounded-xl text-xs text-[#241913]"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-[#7A1C16] text-white font-bold text-xs shadow-xs"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 rounded-xl border border-[#DECDB9] text-xs font-semibold text-[#6B5E57]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            return (
              <div
                key={org.id}
                className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EAE0D2] shadow-xs flex items-center justify-between gap-3 hover:border-[#DECDB9] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] border border-[#EAE0D2] flex items-center justify-center text-[#7A1C16] font-bold text-xs shrink-0 shadow-2xs">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#241913] truncate">{org.name}</span>
                      {isSelf && (
                        <span className="px-1.5 py-0.2 bg-[#E65A15]/15 text-[#E65A15] border border-[#E65A15]/30 rounded-md text-[10px] font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#6B5E57] truncate font-medium">
                      मो. {org.phone || '98200XXXXX'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Edit & Remove */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(org)}
                    className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#DECDB9] text-[#7A1C16] hover:bg-[#F2EADB] flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit Organiser"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOrg(org)}
                    className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#DECDB9] text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Organiser"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDeleteOrg && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFDF9] border border-[#EAE0D2] w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">person_remove</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#241913]">
                  Remove {confirmDeleteOrg.name} as an organiser?
                </h3>
                <p className="text-xs text-[#6B5E57] mt-1">
                  They will no longer be able to log in to the organiser portal.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all cursor-pointer shadow-xs"
                >
                  Remove Organiser
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOrg(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#DECDB9] text-[#6B5E57] font-bold text-xs hover:bg-[#F2EADB] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
