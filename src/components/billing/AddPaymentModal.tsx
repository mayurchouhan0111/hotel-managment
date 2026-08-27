import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, PaymentMethod } from '../../types/hotel';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs select-none">
      <div className="bg-white max-w-lg w-full p-5 rounded-2xl border border-zinc-200 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Record Payment</h3>
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

        {/* Current Folio Summary Box */}
        <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs font-mono-numbers">
          <div>
            <span className="text-zinc-400 block text-[10px]">Total</span>
            <span className="font-semibold text-zinc-900">{formatCurrency(folio.grandTotal, settings.currencySymbol)}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px]">Paid</span>
            <span className="font-semibold text-emerald-700">{formatCurrency(folio.totalPaid, settings.currencySymbol)}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-400 block text-[10px] font-medium">Balance Due</span>
            <span className={`text-xs font-semibold ${folio.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(folio.balanceDue, settings.currencySymbol)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Quick full balance settle button */}
          {balanceDue > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-600 text-xs">Settle full balance</span>
              <button
                type="button"
                onClick={() => setAmount(balanceDue)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                Pay Full ({formatCurrency(balanceDue, settings.currencySymbol)})
              </button>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Payment Amount ({settings.currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
            >
              <option value="upi">UPI / QR Code</option>
              <option value="card">Card (POS)</option>
              <option value="cash">Cash Desk</option>
              <option value="bank_transfer">Bank Wire / Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Reference / Transaction ID */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Transaction Reference / UTR (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI/2026/89421"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none font-mono-numbers"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid in full at front counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

