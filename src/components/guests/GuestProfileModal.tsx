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
  const { stays, settings, getInvoiceByStayId, updateGuest } = useHotel();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs overflow-y-auto select-none">
      <div className="bg-white max-w-2xl w-full rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-white p-5 flex items-start justify-between border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl font-semibold text-sm flex items-center justify-center">
              {guest.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">{guest.fullName}</h2>
                {guest.isVip && (
                  <span className="text-[10px] px-2 py-0.5 font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono-numbers mt-0.5">
                ID: {guest.id} • Registered {formatDate(guest.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-900">
          {/* Lifetime Value Metric Banner */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 font-mono-numbers">
            <div>
              <span className="text-[10px] text-zinc-400 block">Total Stays</span>
              <span className="font-semibold text-zinc-900 text-sm">{guest.totalStaysCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Lifetime Spend</span>
              <span className="font-semibold text-emerald-700 text-sm">
                {formatCurrency(guest.totalSpent, settings.currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Nationality</span>
              <span className="font-semibold text-zinc-900 text-sm">{guest.nationality || 'Indian'}</span>
            </div>
          </div>

          {/* Contact and KYC Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Contact Details */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-900">
                Contact Details
              </h3>
              <div className="space-y-1.5 text-zinc-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="font-mono-numbers text-zinc-900">{guest.phone}</span>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{guest.email}</span>
                  </div>
                )}
                {guest.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
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
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-900">
                Identity & KYC
              </h3>
              <div className="space-y-1.5 text-zinc-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="font-medium text-zinc-900">
                    {guest.idType.toUpperCase()}:
                  </span>
                  <span className="font-mono-numbers text-zinc-900">{guest.idNumber}</span>
                </div>
                {guest.idExpiryDate && (
                  <div className="text-[11px] text-zinc-400">
                    Expiry: {guest.idExpiryDate}
                  </div>
                )}

                {/* Uploaded Documents */}
                <div className="pt-1">
                  <span className="text-[10px] text-zinc-400 block mb-1">
                    Documents ({guest.documents?.length || 0})
                  </span>
                  {guest.documents && guest.documents.length > 0 ? (
                    <div className="space-y-1">
                      {guest.documents.map((d) => (
                        <div
                          key={d.id}
                          className="p-1.5 bg-white border border-zinc-200 rounded-lg flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate text-zinc-800">{d.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 px-1 rounded bg-emerald-50 font-medium">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400 text-[11px]">No documents attached.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Past Stays History */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-900">
              Stay History ({guestStays.length})
            </h3>
            {guestStays.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                No past stays recorded for this guest profile.
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                    <tr>
                      <th className="py-2 px-3 font-medium">Stay</th>
                      <th className="py-2 px-3 font-medium">Room</th>
                      <th className="py-2 px-3 font-medium">Dates</th>
                      <th className="py-2 px-3 font-medium">Status</th>
                      <th className="py-2 px-3 font-medium text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {guestStays.map((stay) => {
                      const invoice = getInvoiceByStayId(stay.id);
                      return (
                        <tr key={stay.id} className="hover:bg-zinc-50/50">
                          <td className="py-2 px-3 font-mono-numbers text-zinc-500">{stay.id}</td>
                          <td className="py-2 px-3 font-semibold text-zinc-900">#{stay.roomNumber}</td>
                          <td className="py-2 px-3 text-zinc-600">
                            {formatDate(stay.checkInDate)} → {formatDate(stay.actualCheckOutDate || stay.expectedCheckOutDate)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                stay.status === 'active'
                                  ? 'bg-zinc-900 text-white'
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}
                            >
                              {stay.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {invoice ? (
                              <button
                                onClick={() => onViewInvoice(invoice)}
                                className="text-zinc-900 hover:underline font-medium text-xs cursor-pointer"
                              >
                                View #{invoice.invoiceNumber}
                              </button>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">Active</span>
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
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900">Guest Preferences</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="rounded text-zinc-900 border-zinc-300 focus:ring-0"
                />
                <span className="font-medium text-zinc-700">VIP Guest</span>
              </label>
            </div>

            <div>
              <label className="block text-zinc-500 mb-1 text-[11px]">Special Requests & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefers high floor, feather-free pillows, vegetarian breakfast..."
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-medium rounded-lg text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-zinc-100 px-5 py-3 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer font-medium"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onCheckInGuest(guest);
            }}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Check In to Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

