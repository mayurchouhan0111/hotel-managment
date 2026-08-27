import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, ChargeCategory } from '../../types/hotel';
import { PlusCircle, X } from 'lucide-react';
import { calculateChargeItem } from '../../utils/billing';
import { formatCurrency } from '../../utils/format';

interface AddChargeModalProps {
  stay: Stay | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddChargeModal: React.FC<AddChargeModalProps> = ({ stay, isOpen, onClose }) => {
  const { folios, settings, addCharge } = useHotel();
  const [category, setCategory] = useState<ChargeCategory>('room_service');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !stay) return null;

  const folio = folios.find((f) => f.stayId === stay.id);
  const price = typeof unitPrice === 'number' ? unitPrice : 0;
  const calc = calculateChargeItem(quantity, price, discountAmount, taxRate);

  const handleCategoryChange = (cat: ChargeCategory) => {
    setCategory(cat);
    const configured = settings.chargeCategories.find((c) => c.key === cat);
    if (configured) {
      setTaxRate(configured.defaultTaxRate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folio) {
      alert('Folio not found for this stay.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description for the charge.');
      return;
    }
    if (price <= 0) {
      alert('Please enter a valid unit price.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCharge(folio.id, {
        stayId: stay.id,
        category,
        description: description.trim(),
        quantity: Math.max(1, quantity),
        unitPrice: price,
        discountAmount: Math.max(0, discountAmount),
        taxRate,
        taxAmount: calc.taxAmount,
        total: calc.total,
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-indigo-400">Folio Billing</div>
              <h3 className="text-base font-bold text-white">Post Charge to Ledger</h3>
              <p className="text-xs text-slate-400 font-mono-numbers">
                Room #{stay.roomNumber} • {stay.guestName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Charge Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
            >
              {settings.chargeCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} (Default GST: {c.defaultTaxRate}%)
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Charge Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Club Sandwich & Fresh Lime Soda"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Price, Quantity, Discount Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Unit Price ({settings.currencySymbol}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">GST Tax (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5 font-mono-numbers text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Taxable Subtotal:</span>
              <span>{formatCurrency(calc.subtotal, settings.currencySymbol)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Tax ({taxRate}%):</span>
              <span>+{formatCurrency(calc.taxAmount, settings.currencySymbol)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between font-bold text-white text-sm">
              <span>Charge Total:</span>
              <span className="text-indigo-400 font-mono-numbers">
                {formatCurrency(calc.total, settings.currencySymbol)}
              </span>
            </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
