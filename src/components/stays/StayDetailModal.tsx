import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, Invoice } from '../../types/hotel';
import {
  CreditCard,
  Plus,
  LogOut,
  Receipt,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDateTime } from '../../utils/date';

interface StayDetailModalProps {
  stay: Stay | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCharge: (stay: Stay) => void;
  onOpenPayment: (stay: Stay) => void;
  onOpenCheckout: (stay: Stay) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onOpenGuestProfile?: (guestId: string) => void;
}

export const StayDetailModal: React.FC<StayDetailModalProps> = ({
  stay,
  isOpen,
  onClose,
  onOpenCharge,
  onOpenPayment,
  onOpenCheckout,
  onViewInvoice,
  onOpenGuestProfile,
}) => {
  const { folios, settings, getInvoiceByStayId } = useHotel();

  if (!isOpen || !stay) return null;

  const folio = folios.find((f) => f.stayId === stay.id);
  const balance = folio?.balanceDue || 0;

  const handleInvoiceClick = () => {
    const inv = getInvoiceByStayId(stay.id);
    if (inv) {
      onViewInvoice(inv);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto select-none">
      <div className="bg-slate-900 max-w-2xl w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-850 border-b border-slate-800 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-mono-numbers font-bold text-xl flex items-center justify-center">
              #{stay.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{stay.guestName}</h2>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    stay.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {stay.status === 'active' ? 'In-House' : 'Checked Out'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono-numbers">
                Stay ID: {stay.id} • Folio: {stay.folioId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Contact & Stay Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest Summary Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 uppercase text-[11px]">
                  Guest Information
                </span>
                {onOpenGuestProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGuestProfile(stay.guestId);
                    }}
                    className="text-xs text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    View CRM Profile →
                  </button>
                )}
              </div>
              <div className="space-y-1.5 pt-1 text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono-numbers">{stay.guestPhone}</span>
                </div>
                {stay.guestEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{stay.guestEmail}</span>
                  </div>
                )}
                <div className="text-slate-400 text-[11px] pt-1">
                  Total Guests: {stay.adults} Adults, {stay.children || 0} Children
                </div>
              </div>
            </div>

            {/* Stay Timeline & Tariff */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <span className="font-semibold text-slate-400 uppercase text-[11px]">
                Stay Parameters
              </span>
              <div className="space-y-1.5 pt-1 text-slate-300">
                <div>
                  <span className="text-slate-400">Check-In: </span>
                  <span className="font-medium">{formatDateTime(stay.checkInDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Expected Departure: </span>
                  <span className="font-medium">{formatDateTime(stay.expectedCheckOutDate)}</span>
                </div>
                <div className="pt-1 text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Daily Room Rate:</span>
                  <span className="font-bold text-white font-mono-numbers">
                    {formatCurrency(stay.dailyRate, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Folio Financial Breakdown */}
          {folio && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase text-xs">
                  Financial Folio Summary
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    balance > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  Balance Due: {formatCurrency(balance, settings.currencySymbol)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 font-medium">Total Charges</div>
                  <div className="text-sm font-bold text-white font-mono-numbers mt-0.5">
                    {formatCurrency(folio.totalCharges, settings.currencySymbol)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 font-medium">Total Paid</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono-numbers mt-0.5">
                    {formatCurrency(folio.totalPayments, settings.currencySymbol)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/60">
                  <div className="text-[11px] text-slate-400 font-medium">Balance Due</div>
                  <div className={`text-sm font-bold font-mono-numbers mt-0.5 ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(balance, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Itemized Charges Mini-List */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">
                  Itemized Folio Items ({folio.charges.length})
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-800">
                  {folio.charges.map((c) => (
                    <div key={c.id} className="pt-1.5 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="font-medium text-white">{c.description}</span>
                        {c.voided && (
                          <span className="ml-1.5 text-[10px] text-rose-400 font-medium">(VOIDED)</span>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {c.category} • {c.quantity}x @ {formatCurrency(c.unitPrice, settings.currencySymbol)}
                        </div>
                      </div>
                      <span className={`font-mono-numbers font-medium ${c.voided ? 'line-through text-slate-500' : 'text-white'}`}>
                        {formatCurrency(c.total, settings.currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {stay.status === 'active' ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCharge(stay);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Charge</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPayment(stay);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout(stay);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Checkout Stay</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleInvoiceClick}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Tax Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
