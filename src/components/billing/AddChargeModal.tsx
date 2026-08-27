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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs select-none">
      <div className="bg-white max-w-lg w-full p-5 rounded-2xl border border-zinc-200 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Post Charge to Ledger</h3>
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Category */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Charge Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
            >
              {settings.chargeCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} (GST: {c.defaultTaxRate}%)
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Club Sandwich & Fresh Lime Soda"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Price, Quantity, Discount Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Price ({settings.currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">GST Tax (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 font-mono-numbers text-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span>{formatCurrency(calc.subtotal, settings.currencySymbol)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Tax ({taxRate}%):</span>
              <span>+{formatCurrency(calc.taxAmount, settings.currencySymbol)}</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-200 flex items-center justify-between font-semibold text-zinc-900 text-xs">
              <span>Total Charge:</span>
              <span className="font-mono-numbers">
                {formatCurrency(calc.total, settings.currencySymbol)}
              </span>
            </div>
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
              {isSubmitting ? 'Posting...' : 'Post Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

