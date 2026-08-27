import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Folio, FolioCharge, FolioPayment, Invoice, Stay } from '../../types/hotel';
import { AddChargeModal } from './AddChargeModal';
import { AddPaymentModal } from './AddPaymentModal';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceView } from './InvoiceView';
import {
  CreditCard,
  Plus,
  LogOut,
  Receipt,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDateTime } from '../../utils/date';

interface FolioManagementProps {
  initialFolioId?: string | null;
  onOpenGuestProfile?: (guestId: string) => void;
}

export const FolioManagement: React.FC<FolioManagementProps> = ({
  initialFolioId,
  onOpenGuestProfile,
}) => {
  const { folios, stays, settings, voidCharge, getInvoiceByStayId } = useHotel();
  const [selectedFolioId, setSelectedFolioId] = useState<string | null>(
    initialFolioId || (folios.length > 0 ? folios[0].id : null)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'settled'>('all');

  // Modals state
  const [chargeModalStay, setChargeModalStay] = useState<Stay | null>(null);
  const [paymentModalStay, setPaymentModalStay] = useState<Stay | null>(null);
  const [checkoutModalStay, setCheckoutModalStay] = useState<Stay | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Active Selected Folio
  const selectedFolio = folios.find((f) => f.id === selectedFolioId) || folios[0] || null;
  const currentStay = selectedFolio ? stays.find((s) => s.id === selectedFolio.stayId) : null;

  // Filtered List
  const filteredFolios = folios.filter((f) => {
    if (statusFilter === 'open' && f.status !== 'open') return false;
    if (statusFilter === 'settled' && f.status !== 'settled') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        f.guestName.toLowerCase().includes(q) ||
        f.roomNumber.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVoidCharge = async (chargeId: string) => {
    if (!selectedFolio) return;
    const reason = prompt('Please specify a reason for voiding this charge:') || 'Entry correction';
    try {
      await voidCharge(selectedFolio.id, chargeId, reason);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenInvoice = () => {
    if (!selectedFolio) return;
    const inv = getInvoiceByStayId(selectedFolio.stayId);
    if (inv) {
      setViewingInvoice(inv);
    } else {
      alert('Tax Invoice is generated upon checkout & final settlement.');
    }
  };

  return (
    <div id="folio-management-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Financial Ledger</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">Multi-Charge Billing Engine</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Billing, Folios & Invoicing Ledger
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
            <span className="text-slate-400 block text-[10px]">Total Folios</span>
            <span className="font-bold text-white font-mono-numbers">{folios.length}</span>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
            <span className="text-slate-400 block text-[10px]">Receivables</span>
            <span className="font-bold text-rose-400 font-mono-numbers">
              {formatCurrency(
                folios.reduce((acc, f) => acc + (f.balanceDue || 0), 0),
                settings.currencySymbol
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Folio Workspace: Master List (Left) + Detail Statement (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Folios List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/70 shadow-sm space-y-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, room #, folio ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-400 text-xs">Filter:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
                  }`}
                >
                  All ({folios.length})
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'open' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
                  }`}
                >
                  Open Due
                </button>
                <button
                  onClick={() => setStatusFilter('settled')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'settled' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
                  }`}
                >
                  Settled
                </button>
              </div>
            </div>
          </div>

          {/* List of Folio Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredFolios.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/90 rounded-xl border border-slate-700 text-slate-400 text-xs">
                No folios matching your search.
              </div>
            ) : (
              filteredFolios.map((f) => {
                const isSelected = selectedFolio?.id === f.id;
                const balance = f.balanceDue || 0;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolioId(f.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono-numbers font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs">
                          #{f.roomNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{f.guestName}</div>
                          <div className="text-[11px] text-slate-400 font-mono-numbers">{f.id}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          f.status === 'settled'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {f.status === 'settled' ? 'Settled' : 'Open Due'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-[11px] font-mono-numbers">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total</span>
                        <span className="font-medium text-slate-200">
                          {formatCurrency(f.grandTotal, settings.currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Paid</span>
                        <span className="font-medium text-emerald-400">
                          {formatCurrency(f.totalPaid, settings.currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Balance</span>
                        <span className={`font-bold ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatCurrency(balance, settings.currencySymbol)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Folio Statement & Itemized Charges (7 cols) */}
        <div className="lg:col-span-7">
          {selectedFolio ? (
            <div className="bg-slate-800/90 rounded-xl border border-slate-700/70 shadow-sm overflow-hidden flex flex-col h-full">
              {/* Statement Header */}
              <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers font-bold text-lg text-white px-2.5 py-0.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      Room #{selectedFolio.roomNumber}
                    </span>
                    <span className="text-base font-bold text-white">
                      {selectedFolio.guestName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono-numbers">
                    Folio ID: {selectedFolio.id} • Stay: {selectedFolio.stayId}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentStay?.status === 'active' && (
                    <>
                      <button
                        onClick={() => setChargeModalStay(currentStay)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Charge</span>
                      </button>

                      <button
                        onClick={() => setPaymentModalStay(currentStay)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Add Payment</span>
                      </button>

                      <button
                        onClick={() => setCheckoutModalStay(currentStay)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Checkout</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleOpenInvoice}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-700/60 bg-slate-900/60 font-mono-numbers text-xs">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Subtotal</span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(selectedFolio.subtotal, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Tax / GST</span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(selectedFolio.totalTax, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Total Payments</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatCurrency(selectedFolio.totalPaid, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Outstanding</span>
                  <span
                    className={`text-sm font-bold ${
                      selectedFolio.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(selectedFolio.balanceDue, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Itemized Charges Table */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Itemized Folio Charges ({selectedFolio.charges.length})
                    </h3>
                  </div>

                  {selectedFolio.charges.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
                      No charges posted to this folio yet.
                    </div>
                  ) : (
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3.5 font-semibold">Description</th>
                            <th className="py-2.5 px-3.5 font-semibold">Category</th>
                            <th className="py-2.5 px-3.5 font-semibold text-center">Qty</th>
                            <th className="py-2.5 px-3.5 font-semibold text-right">Tax</th>
                            <th className="py-2.5 px-3.5 font-semibold text-right">Amount</th>
                            <th className="py-2.5 px-3.5 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                          {selectedFolio.charges.map((charge) => (
                            <tr
                              key={charge.id}
                              className={`hover:bg-slate-800 transition-colors ${
                                charge.voided ? 'opacity-40 line-through bg-slate-900/50' : ''
                              }`}
                            >
                              <td className="py-3 px-3.5">
                                <div className="font-medium text-white">{charge.description}</div>
                                {charge.voided && (
                                  <div className="text-[10px] text-rose-400 font-semibold no-underline">
                                    Voided: {charge.voidReason}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3.5">
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                                  {charge.category}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-center font-mono-numbers text-slate-300">
                                {charge.quantity}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono-numbers text-slate-400">
                                {formatCurrency(charge.taxAmount, settings.currencySymbol)}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono-numbers font-semibold text-white">
                                {formatCurrency(charge.total, settings.currencySymbol)}
                              </td>
                              <td className="py-3 px-3.5 text-right">
                                {!charge.voided && currentStay?.status === 'active' && (
                                  <button
                                    onClick={() => handleVoidCharge(charge.id)}
                                    title="Void Charge"
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payments Section */}
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                    Payments & Settlement Receipts ({selectedFolio.payments.length})
                  </h3>

                  {selectedFolio.payments.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
                      No payments recorded yet.
                    </div>
                  ) : (
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3.5 font-semibold">Payment ID</th>
                            <th className="py-2.5 px-3.5 font-semibold">Method</th>
                            <th className="py-2.5 px-3.5 font-semibold">Reference</th>
                            <th className="py-2.5 px-3.5 font-semibold">Date & Time</th>
                            <th className="py-2.5 px-3.5 font-semibold text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                          {selectedFolio.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800 transition-colors">
                              <td className="py-3 px-3.5 font-mono-numbers text-slate-400">{p.id}</td>
                              <td className="py-3 px-3.5">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium uppercase">
                                  {p.method}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 font-mono-numbers text-slate-300">
                                {p.referenceNumber || '—'}
                              </td>
                              <td className="py-3 px-3.5 text-slate-400">
                                {formatDateTime(p.timestamp)}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono-numbers font-semibold text-emerald-400">
                                +{formatCurrency(p.amount, settings.currencySymbol)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-12 text-center text-slate-400">
              Select a folio from the left list to view statement and charges.
            </div>
          )}
        </div>
      </div>

      {/* Charge Modal */}
      {chargeModalStay && (
        <AddChargeModal
          stay={chargeModalStay}
          isOpen={!!chargeModalStay}
          onClose={() => setChargeModalStay(null)}
        />
      )}

      {/* Payment Modal */}
      {paymentModalStay && (
        <AddPaymentModal
          stay={paymentModalStay}
          isOpen={!!paymentModalStay}
          onClose={() => setPaymentModalStay(null)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutModalStay && (
        <CheckoutModal
          stay={checkoutModalStay}
          isOpen={!!checkoutModalStay}
          onClose={() => setCheckoutModalStay(null)}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
        />
      )}

      {/* Invoice Modal */}
      {viewingInvoice && (
        <InvoiceView
          invoice={viewingInvoice}
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};
