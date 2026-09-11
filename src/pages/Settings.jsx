import React, { useState } from 'react';
import { useMandalData } from '../context/MandalDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Save, 
  QrCode, 
  Users, 
  ShieldCheck, 
  Flame, 
  Key, 
  Plus, 
  Check, 
  Database,
  RotateCcw
} from 'lucide-react';

export function Settings({ onClose }) {
  const { config, updateMandalConfig, isConfigured } = useMandalData();
  const { organizers, updateOrganizerPin, addOrganizer } = useAuth();

  const [formData, setFormData] = useState({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Organizer State
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgPin, setNewOrgPin] = useState('1111');

  // PIN edit map
  const [pinEdits, setPinEdits] = useState({});

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateMandalConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdatePin = (orgId) => {
    const newPin = pinEdits[orgId];
    if (newPin && newPin.length === 4) {
      updateOrganizerPin(orgId, newPin);
      setPinEdits(prev => ({ ...prev, [orgId]: '' }));
      alert('PIN updated successfully!');
    } else {
      alert('Please enter a valid 4-digit PIN');
    }
  };

  const handleAddOrganizer = (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    addOrganizer({
      name: newOrgName.trim(),
      phone: newOrgPhone,
      pin: newOrgPin || '1111'
    });

    setNewOrgName('');
    setNewOrgPhone('');
    setShowAddOrg(false);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" /> Mandal Settings & PINs (मंडळ व्यवस्थापन)
          </h2>
          <p className="text-xs text-slate-400">
            Configure mandal profile, UPI payment handle, and organiser access PINs
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Settings updated successfully!
        </div>
      )}

      {/* Main Form: Mandal Profile & UPI */}
      <form onSubmit={handleSaveConfig} className="glass-card p-5 bg-slate-900/80 border-white/10 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4" /> Mandal Details & Official Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mandal Name (मंडळाचे नाव) *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subtitle / Registration No
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Festival Year (उत्सव वर्ष)
            </label>
            <input
              type="number"
              value={formData.year || 2026}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pandal Address / Location (मंडप पत्ता)
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official UPI VPA / QR ID (उदा. mandal@upi) *
            </label>
            <input
              type="text"
              required
              value={formData.upiId || ''}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. ganeshutsav@sbi"
              className="input-field font-mono text-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Collection Target Goal (₹)
            </label>
            <input
              type="number"
              value={formData.targetGoal || 150000}
              onChange={(e) => setFormData({ ...formData, targetGoal: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="btn-saffron py-2.5 px-5 text-xs font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Mandal Profile
          </button>
        </div>
      </form>

      {/* Organisers & PIN Security */}
      <div className="glass-card p-5 bg-slate-900/80 border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Organisers & Access PINs (कार्यकर्ते व गुप्त पिन)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              4-digit client-side PIN access for each committee member
            </p>
          </div>

          <button
            onClick={() => setShowAddOrg(!showAddOrg)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" /> {showAddOrg ? 'Cancel' : 'Add Organiser'}
          </button>
        </div>

        {/* Add Organiser Subform */}
        {showAddOrg && (
          <form onSubmit={handleAddOrganizer} className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white">Add New Committee Member</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name (नाव)"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="input-field text-xs"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={newOrgPhone}
                onChange={(e) => setNewOrgPhone(e.target.value)}
                className="input-field text-xs"
              />
              <input
                type="password"
                maxLength={4}
                placeholder="4-Digit PIN (e.g. 1234)"
                value={newOrgPin}
                onChange={(e) => setNewOrgPin(e.target.value)}
                className="input-field text-xs font-mono font-bold"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddOrg(false)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-saffron py-1 px-4 text-xs font-bold"
              >
                Add Member
              </button>
            </div>
          </form>
        )}

        {/* Organiser PIN Rows */}
        <div className="space-y-2.5">
          {organizers.map((org) => (
            <div
              key={org.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{org.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Phone: {org.phone || '-'} • Current PIN: <span className="text-amber-400 font-mono font-bold">{org.pin}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="New PIN"
                  value={pinEdits[org.id] || ''}
                  onChange={(e) => setPinEdits({ ...pinEdits, [org.id]: e.target.value })}
                  className="w-24 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-center font-mono font-bold text-amber-400 outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleUpdatePin(org.id)}
                  className="btn-secondary py-1 px-2.5 text-xs text-amber-400 hover:text-white"
                >
                  Update PIN
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud & Sync Status */}
      <div className="glass-card p-4 bg-slate-900/60 border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">
              Storage Mode: {isConfigured ? 'Live Firebase Cloud' : 'Local Storage PWA (Offline Resilient)'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isConfigured
                ? 'Connected to Google Firebase Firestore for instant real-time multi-device sync.'
                : 'Running on local PWA storage with full offline caching. Add Firebase API keys in .env when ready to deploy.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
