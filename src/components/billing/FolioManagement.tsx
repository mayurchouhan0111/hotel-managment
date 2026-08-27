import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Invoice, Stay } from '../../types/hotel';
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
  Ban,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDateTime } from '../../utils/date';

interface FolioManagementProps {
  initialFolioId?: string | null;
  onOpenGuestProfile?: (guestId: string) => void;
}

export const FolioManagement: React.FC<FolioManagementProps> = ({
  initialFolioId,
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
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-600" />
            Billing & Folios
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Guest billing ledgers, room charges, and tax settlements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-400 block text-[10px]">Total Folios</span>
            <span className="font-semibold text-zinc-900 font-mono-numbers">{folios.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-400 block text-[10px]">Receivables</span>
            <span className="font-semibold text-rose-700 font-mono-numbers">
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
        <div className="lg:col-span-5 space-y-3">
          {/* Search and Filters */}
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs space-y-2.5 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, room #, folio ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-500 text-xs">Filter:</span>
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-zinc-600 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
                  }`}
                >
                  All ({folios.length})
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'open' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setStatusFilter('settled')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === 'settled' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
                  }`}
                >
                  Settled
                </button>
              </div>
            </div>
          </div>

          {/* List of Folio Cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredFolios.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
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
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-semibold px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs">
                          #{f.roomNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-zinc-900">{f.guestName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono-numbers">{f.id}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          f.status === 'settled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {f.status === 'settled' ? 'Settled' : 'Open Due'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-[11px] font-mono-numbers">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Total</span>
                        <span className="font-medium text-zinc-800">
                          {formatCurrency(f.grandTotal, settings.currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Paid</span>
                        <span className="font-medium text-emerald-700">
                          {formatCurrency(f.totalPaid, settings.currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Balance</span>
                        <span className={`font-semibold ${balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
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
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full">
              {/* Statement Header */}
              <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers font-semibold text-sm text-zinc-900 px-2 py-0.5 rounded-md bg-white border border-zinc-200">
                      Room #{selectedFolio.roomNumber}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {selectedFolio.guestName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono-numbers">
                    Folio: {selectedFolio.id} • Stay: {selectedFolio.stayId}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {currentStay?.status === 'active' && (
                    <>
                      <button
                        onClick={() => setChargeModalStay(currentStay)}
                        className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Charge</span>
                      </button>

                      <button
                        onClick={() => setPaymentModalStay(currentStay)}
                        className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Payment</span>
                      </button>

                      <button
                        onClick={() => setCheckoutModalStay(currentStay)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Checkout</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleOpenInvoice}
                    className="px-2.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-zinc-100 bg-zinc-50/30 font-mono-numbers text-xs">
                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block">Subtotal</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-0.5 block">
                    {formatCurrency(selectedFolio.subtotal, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block">GST Tax</span>
                  <span className="text-xs font-semibold text-zinc-900 mt-0.5 block">
                    {formatCurrency(selectedFolio.totalTax, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block">Total Paid</span>
                  <span className="text-xs font-semibold text-emerald-700 mt-0.5 block">
                    {formatCurrency(selectedFolio.totalPaid, settings.currencySymbol)}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block">Outstanding</span>
                  <span
                    className={`text-xs font-semibold mt-0.5 block ${
                      selectedFolio.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(selectedFolio.balanceDue, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Itemized Charges Table */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-zinc-900">
                      Itemized Charges ({selectedFolio.charges.length})
                    </h3>
                  </div>

                  {selectedFolio.charges.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl">
                      No charges posted to this folio yet.
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                          <tr>
                            <th className="py-2 px-3 font-medium">Description</th>
                            <th className="py-2 px-3 font-medium">Category</th>
                            <th className="py-2 px-3 font-medium text-center">Qty</th>
                            <th className="py-2 px-3 font-medium text-right">Tax</th>
                            <th className="py-2 px-3 font-medium text-right">Total</th>
                            <th className="py-2 px-3 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {selectedFolio.charges.map((charge) => (
                            <tr
                              key={charge.id}
                              className={`hover:bg-zinc-50/50 transition-colors ${
                                charge.voided ? 'opacity-40 line-through bg-zinc-50' : ''
                              }`}
                            >
                              <td className="py-2 px-3">
                                <div className="font-medium text-zinc-900">{charge.description}</div>
                                {charge.voided && (
                                  <div className="text-[10px] text-rose-600 font-medium no-underline">
                                    Voided: {charge.voidReason}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-600">
                                  {charge.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-mono-numbers text-zinc-600">
                                {charge.quantity}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-numbers text-zinc-500">
                                {formatCurrency(charge.taxAmount, settings.currencySymbol)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-numbers font-semibold text-zinc-900">
                                {formatCurrency(charge.total, settings.currencySymbol)}
                              </td>
                              <td className="py-2 px-3 text-right">
                                {!charge.voided && currentStay?.status === 'active' && (
                                  <button
                                    onClick={() => handleVoidCharge(charge.id)}
                                    title="Void Charge"
                                    className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 transition-colors cursor-pointer"
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
                  <h3 className="text-xs font-semibold text-zinc-900 mb-2">
                    Recorded Payments ({selectedFolio.payments.length})
                  </h3>

                  {selectedFolio.payments.length === 0 ? (
                    <div className="p-4 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl">
                      No payments recorded yet.
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                          <tr>
                            <th className="py-2 px-3 font-medium">Payment ID</th>
                            <th className="py-2 px-3 font-medium">Method</th>
                            <th className="py-2 px-3 font-medium">Reference</th>
                            <th className="py-2 px-3 font-medium">Date</th>
                            <th className="py-2 px-3 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {selectedFolio.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-2 px-3 font-mono-numbers text-zinc-400">{p.id}</td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium uppercase">
                                  {p.method}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono-numbers text-zinc-600">
                                {p.referenceNumber || '—'}
                              </td>
                              <td className="py-2 px-3 text-zinc-500">
                                {formatDateTime(p.timestamp)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-numbers font-semibold text-emerald-700">
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
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400 text-xs">
              Select a folio from the list to view statement and charges.
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

