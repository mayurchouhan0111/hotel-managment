import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, PaymentMethod } from '../../types/hotel';
import { CreditCard, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface AddPaymentModalProps {
  stay: Stay | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ stay, isOpen, onClose }) => {
  const { folios, settings, addPayment } = useHotel();
  const folio = stay ? folios.find((f) => f.stayId === stay.id) : null;
  const balanceDue = folio?.balanceDue || 0;

  const [amount, setAmount] = useState<number | ''>(balanceDue > 0 ? balanceDue : '');
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !stay || !folio) return null;

  const numAmount = typeof amount === 'number' ? amount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPayment(folio.id, {
        stayId: stay.id,
        amount: numAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-400">Payment Receipt</div>
              <h3 className="text-base font-bold text-white">Record Payment & Settle</h3>
              <p className="text-xs text-slate-400 font-mono-numbers">
                Room #{stay.roomNumber} • {stay.guestName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Folio Summary Box */}
        <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-white flex items-center justify-between text-xs font-mono-numbers">
          <div>
            <span className="text-slate-400 block text-[10px]">Grand Total</span>
            <span className="font-bold text-white">{formatCurrency(folio.grandTotal, settings.currencySymbol)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Paid So Far</span>
            <span className="font-bold text-emerald-400">{formatCurrency(folio.totalPaid, settings.currencySymbol)}</span>
          </div>
          <div className="text-right">
            <span className="text-rose-400 block text-[10px] font-medium">Balance Due</span>
            <span className="text-sm font-bold text-rose-400">
              {formatCurrency(folio.balanceDue, settings.currencySymbol)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick full balance settle button */}
          {balanceDue > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
              <span className="text-slate-300 text-xs">Settle full outstanding balance?</span>
              <button
                type="button"
                onClick={() => setAmount(balanceDue)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md text-xs transition-colors cursor-pointer"
              >
                Pay Full ({formatCurrency(balanceDue, settings.currencySymbol)})
              </button>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Payment Amount ({settings.currencySymbol}) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="upi">UPI / QR Code (GPay, PhonePe, Paytm)</option>
              <option value="card">Credit / Debit Card (POS Machine)</option>
              <option value="cash">Cash Received at Desk</option>
              <option value="bank_transfer">Direct Bank Wire / NEFT / RTGS</option>
              <option value="other">Other Settlement</option>
            </select>
          </div>

          {/* Reference / Transaction ID */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Transaction Ref / UTR / Auth Code
            </label>
            <input
              type="text"
              placeholder="e.g. UPI/2026/89421 or POS-Auth-992"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono-numbers"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Internal Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid in full at front counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
