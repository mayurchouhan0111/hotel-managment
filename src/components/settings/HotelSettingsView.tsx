import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { HotelSettings } from '../../types/hotel';
import {
  Settings,
  Building2,
  Clock,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const HotelSettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useHotel();
  const [formData, setFormData] = useState<HotelSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof HotelSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetDemoData();
      setShowResetConfirm(false);
      alert('Demo data has been cleanly reseeded.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="hotel-settings-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">System Configuration</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">Property & Financial Rules</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            Property Setup & Operational Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure legal entity details, GSTIN registration, standard checkout hours, and tax percentages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reseed Demo Dataset</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Identity */}
        <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-700/70 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Property Identity & Contact Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Hotel Property Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">GSTIN Tax Registration Number</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono-numbers focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Front Desk Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Billing / Inquiries Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">Physical Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Currency */}
        <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-700/70 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Standard Timings & Currency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Standard Check-In Time</label>
              <input
                type="text"
                value={formData.defaultCheckInTime}
                onChange={(e) => handleChange('defaultCheckInTime', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Standard Check-Out Time</label>
              <input
                type="text"
                value={formData.defaultCheckOutTime}
                onChange={(e) => handleChange('defaultCheckOutTime', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Reset Demo Data Modal */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset to Fresh Demo Dataset?"
        message="This will re-initialize all rooms, create clean guest profiles, reset sample in-house stays, and clear folios back to standard default states. All previous logs will be restored to demo baseline."
        confirmLabel={isResetting ? 'Resetting...' : 'Yes, Reseed Everything'}
        isDangerous={true}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
