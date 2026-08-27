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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs overflow-y-auto select-none">
      <div className="bg-white max-w-2xl w-full rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="border-b border-zinc-100 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-zinc-100 border border-zinc-200 font-mono-numbers font-semibold text-lg text-zinc-900 flex items-center justify-center">
              #{stay.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900">{stay.guestName}</h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    stay.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {stay.status === 'active' ? 'In-House' : 'Departed'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono-numbers">
                Stay #{stay.id} • Folio: {stay.folioId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Contact & Stay Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Guest Summary Card */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-500 text-[11px]">
                  Guest Information
                </span>
                {onOpenGuestProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGuestProfile(stay.guestId);
                    }}
                    className="text-xs text-zinc-900 font-medium hover:underline cursor-pointer"
                  >
                    CRM Profile →
                  </button>
                )}
              </div>
              <div className="space-y-1 pt-0.5 text-zinc-700">
                <div className="flex items-center gap-1.5 font-mono-numbers">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{stay.guestPhone}</span>
                </div>
                {stay.guestEmail && (
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{stay.guestEmail}</span>
                  </div>
                )}
                <div className="text-zinc-400 text-[11px] pt-1">
                  Guests: {stay.adultsCount} Adults, {stay.childrenCount || 0} Children
                </div>
              </div>
            </div>

            {/* Stay Timeline & Tariff */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <span className="font-medium text-zinc-500 text-[11px]">
                Stay Parameters
              </span>
              <div className="space-y-1 pt-0.5 text-zinc-700 font-mono-numbers text-[11px]">
                <div>
                  <span className="text-zinc-400">Check-In: </span>
                  <span className="font-medium text-zinc-900">{formatDateTime(stay.checkInDate)}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Departure: </span>
                  <span className="font-medium text-zinc-900">{formatDateTime(stay.expectedCheckOutDate)}</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-zinc-400">Room Rate:</span>
                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(stay.roomRatePerNight, settings.currencySymbol)}/nt
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Folio Financial Breakdown */}
          {folio && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900 text-xs">
                  Financial Folio Summary
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold font-mono-numbers ${
                    balance > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Balance Due: {formatCurrency(balance, settings.currencySymbol)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-[11px] text-zinc-400">Total Charges</div>
                  <div className="text-xs font-semibold text-zinc-900 font-mono-numbers mt-0.5">
                    {formatCurrency(folio.grandTotal, settings.currencySymbol)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-[11px] text-zinc-400">Total Paid</div>
                  <div className="text-xs font-semibold text-emerald-700 font-mono-numbers mt-0.5">
                    {formatCurrency(folio.totalPaid, settings.currencySymbol)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-zinc-200">
                  <div className="text-[11px] text-zinc-400">Balance Due</div>
                  <div className={`text-xs font-semibold font-mono-numbers mt-0.5 ${balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {formatCurrency(balance, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Itemized Charges Mini-List */}
              <div className="pt-2">
                <div className="text-[11px] font-medium text-zinc-500 mb-1.5">
                  Itemized Charges ({folio.charges.length})
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-zinc-100">
                  {folio.charges.map((c) => (
                    <div key={c.id} className="pt-1.5 flex items-center justify-between text-xs text-zinc-700">
                      <div>
                        <span className="font-medium text-zinc-900">{c.description}</span>
                        {c.voided && (
                          <span className="ml-1.5 text-[10px] text-rose-500 font-medium">(VOIDED)</span>
                        )}
                        <div className="text-[10px] text-zinc-400">
                          {c.category} • {c.quantity}x @ {formatCurrency(c.unitPrice, settings.currencySymbol)}
                        </div>
                      </div>
                      <span className={`font-mono-numbers font-medium ${c.voided ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
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
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-1.5">
            {stay.status === 'active' ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCharge(stay);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Charge</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPayment(stay);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Payment</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout(stay);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Checkout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleInvoiceClick}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

