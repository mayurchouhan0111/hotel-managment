import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Guest, Invoice } from '../../types/hotel';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  FileText,
  X,
  Plus,
  FileImage,
  Calendar,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';

interface GuestProfileModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckInGuest: (guest: Guest) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  guest,
  isOpen,
  onClose,
  onCheckInGuest,
  onViewInvoice,
}) => {
  const { stays, folios, settings, getInvoiceByStayId, updateGuest } = useHotel();
  const [isVip, setIsVip] = useState(guest?.isVip || false);
  const [notes, setNotes] = useState(guest?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !guest) return null;

  const guestStays = stays.filter((s) => s.guestId === guest.id);

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await updateGuest(guest.id, {
        isVip,
        notes: notes.trim(),
      });
      alert('Guest profile updated successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto select-none">
      <div className="bg-slate-900 max-w-3xl w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-850 text-white p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold text-lg flex items-center justify-center">
              {guest.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white">{guest.fullName}</h2>
                {guest.isVip && (
                  <span className="text-[10px] px-2 py-0.5 font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" />
                    VIP GUEST
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono-numbers mt-0.5">
                ID: {guest.id} • Registered {formatDate(guest.createdAt)}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-white">
          {/* Lifetime Value Metric Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-800/80 rounded-xl border border-slate-700 font-mono-numbers">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">TOTAL STAYS</span>
              <span className="font-bold text-white text-base">{guest.totalStaysCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">LIFETIME REVENUE</span>
              <span className="font-bold text-emerald-400 text-base">
                {formatCurrency(guest.totalSpent, settings.currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">NATIONALITY</span>
              <span className="font-bold text-white text-base">{guest.nationality || 'Indian'}</span>
            </div>
          </div>

          {/* Contact and KYC Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Details */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Contact & Residential Details
              </h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono-numbers">{guest.phone}</span>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{guest.email}</span>
                  </div>
                )}
                {guest.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {guest.address}
                      {guest.city ? `, ${guest.city}` : ''}
                      {guest.state ? `, ${guest.state}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Details */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Identity Credentials & KYC
              </h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">
                    {guest.idType.toUpperCase()}:
                  </span>
                  <span className="font-mono-numbers">{guest.idNumber}</span>
                </div>
                {guest.idExpiryDate && (
                  <div className="text-[11px] text-slate-400">
                    Expiry: {guest.idExpiryDate}
                  </div>
                )}

                {/* Uploaded Documents */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Attached Verification Files ({guest.documents?.length || 0})
                  </span>
                  {guest.documents && guest.documents.length > 0 ? (
                    <div className="space-y-1.5">
                      {guest.documents.map((d) => (
                        <div
                          key={d.id}
                          className="p-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate text-white font-medium">{d.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">No documents attached.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Past Stays History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Stay History & Invoices ({guestStays.length})
            </h3>
            {guestStays.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
                No past stays recorded for this guest profile.
              </div>
            ) : (
              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Stay ID</th>
                      <th className="py-2.5 px-3 font-semibold">Room</th>
                      <th className="py-2.5 px-3 font-semibold">Dates</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                    {guestStays.map((stay) => {
                      const invoice = getInvoiceByStayId(stay.id);
                      return (
                        <tr key={stay.id} className="hover:bg-slate-800/60">
                          <td className="py-2.5 px-3 font-mono-numbers text-slate-300">{stay.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">#{stay.roomNumber}</td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {formatDate(stay.checkInDate)} → {formatDate(stay.actualCheckOutDate || stay.expectedCheckOutDate)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                stay.status === 'active'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {stay.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {invoice ? (
                              <button
                                onClick={() => onViewInvoice(invoice)}
                                className="text-indigo-400 hover:text-indigo-300 font-medium text-xs cursor-pointer"
                              >
                                View #{invoice.invoiceNumber}
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Pending Checkout</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VIP Preference & Notes Editing */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white">Guest Preferences & VIP Tier</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
                <span className="font-semibold text-amber-400">Mark as VIP Guest</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">Special Requests & Preferences Note</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefers high floor, feather-free pillows, vegetarian breakfast..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile Updates'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-850 border-t border-slate-800 px-6 py-3.5 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-medium"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onCheckInGuest(guest);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Check In to a Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};
