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
          particleCount: 40,
          spread: 50,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs select-none">
      <div className="bg-white max-w-lg w-full p-5 rounded-2xl border border-zinc-200 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Guest Checkout & Tax Invoice</h3>
            <p className="text-xs text-zinc-500 font-mono-numbers">
              Room #{stay.roomNumber} • {stay.guestName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stay & Financial Summary */}
        <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <div>
              <span className="text-zinc-400 block text-[10px]">Dates</span>
              <span className="font-medium text-zinc-900">{formatDate(stay.checkInDate)} → {formatDate(new Date().toISOString())}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 block text-[10px]">Room Tariff</span>
              <span className="font-semibold text-zinc-900 font-mono-numbers">{formatCurrency(stay.dailyRate, settings.currencySymbol)}/nt</span>
            </div>
          </div>

          <div className="space-y-1 font-mono-numbers">
            <div className="flex items-center justify-between text-zinc-500">
              <span>Total Charges:</span>
              <span className="text-zinc-900">{formatCurrency(folio.grandTotal, settings.currencySymbol)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Prior Payments:</span>
              <span className="text-emerald-700">-{formatCurrency(folio.totalPaid, settings.currencySymbol)}</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-200 flex items-center justify-between font-semibold text-xs">
              <span className="text-zinc-900">Balance Due:</span>
              <span className={hasOutstanding ? 'text-rose-600 font-mono-numbers' : 'text-emerald-700 font-mono-numbers'}>
                {formatCurrency(balanceDue, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Settlement Option */}
        {hasOutstanding ? (
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Collect Balance: {formatCurrency(balanceDue, settings.currencySymbol)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Settlement Method</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-9821 or Cash"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none font-mono-numbers"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Folio is fully settled. No pending balance due.</span>
          </div>
        )}

        <div className="text-[11px] text-zinc-400 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
          Checking out will vacate Room #{stay.roomNumber}, set housekeeping to Cleaning, and generate the final GST invoice.
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCheckout}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Checkout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

