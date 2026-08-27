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
    <div id="hotel-settings-view" className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-700" />
            Property Setup & Preferences
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure legal entity details, GSTIN registration, standard checkout hours, and property metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium text-xs rounded-lg border border-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Reseed Demo Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* General Identity */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3.5">
          <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-600" />
            Property Identity & Contact Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Hotel Property Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">GSTIN Tax Registration Number</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Front Desk Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Billing / Inquiries Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 mb-1">Physical Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Currency */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3.5">
          <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            Standard Timings & Currency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Standard Check-In Time</label>
              <input
                type="text"
                value={formData.defaultCheckInTime}
                onChange={(e) => handleChange('defaultCheckInTime', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Standard Check-Out Time</label>
              <input
                type="text"
                value={formData.defaultCheckOutTime}
                onChange={(e) => handleChange('defaultCheckOutTime', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {savedSuccess && (
              <span className="text-emerald-700 flex items-center gap-1.5 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
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
