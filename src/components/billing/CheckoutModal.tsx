import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, PaymentMethod, Invoice } from '../../types/hotel';
import { LogOut, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  stay: Stay | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  stay,
  isOpen,
  onClose,
  onViewInvoice,
}) => {
  const { folios, settings, checkoutStay } = useHotel();
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('upi');
  const [settlementRef, setSettlementRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !stay) return null;

  const folio = folios.find((f) => f.stayId === stay.id);
  if (!folio) return null;

  const balanceDue = folio.balanceDue || 0;
  const hasOutstanding = balanceDue > 0.01;

  const handleConfirmCheckout = async () => {
    try {
      setIsSubmitting(true);

      const finalPayment = hasOutstanding
        ? {
            amount: balanceDue,
            method: settlementMethod,
            referenceNumber: settlementRef.trim() || undefined,
            notes: 'Settled at final departure checkout',
          }
        : undefined;

      const res = await checkoutStay({
        stayId: stay.id,
        folioId: folio.id,
        roomId: stay.roomId,
        finalSettlementPayment: finalPayment,
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      onClose();
      onViewInvoice(res.invoice);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="bg-slate-900 max-w-lg w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-indigo-400">Departure Settlement</div>
              <h3 className="text-base font-bold text-white">Guest Checkout & Tax Invoice</h3>
              <p className="text-xs text-slate-400 font-mono-numbers">
                Room #{stay.roomNumber} • {stay.guestName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stay & Financial Summary */}
        <div className="bg-slate-800/80 text-white p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <div>
              <span className="text-slate-400 block text-[11px]">Duration</span>
              <span className="font-medium text-white">{formatDate(stay.checkInDate)} → {formatDate(new Date().toISOString())}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Room Tariff</span>
              <span className="font-semibold text-white font-mono-numbers">{formatCurrency(stay.dailyRate, settings.currencySymbol)}/nt</span>
            </div>
          </div>

          <div className="space-y-1.5 font-mono-numbers">
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Charges Accrued:</span>
              <span className="text-white">{formatCurrency(folio.grandTotal, settings.currencySymbol)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Advance & Prior Payments:</span>
              <span className="text-emerald-400">-{formatCurrency(folio.totalPaid, settings.currencySymbol)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between font-bold text-sm">
              <span>Outstanding Balance Due:</span>
              <span className={hasOutstanding ? 'text-rose-400' : 'text-emerald-400'}>
                {formatCurrency(balanceDue, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Settlement Option */}
        {hasOutstanding ? (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Collect Outstanding Balance of {formatCurrency(balanceDue, settings.currencySymbol)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Settlement Method</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-9821 or Cash"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono-numbers"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Folio is fully settled. No pending balance due.</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400 bg-slate-850 p-3 rounded-lg border border-slate-800">
          Checking out will vacate Room #{stay.roomNumber}, set its housekeeping status to Cleaning, and generate the final GST Tax Invoice.
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCheckout}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing Checkout...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Confirm Checkout & Vacate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
