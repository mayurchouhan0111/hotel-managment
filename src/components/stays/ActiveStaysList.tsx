import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Stay, StayStatus, Invoice } from '../../types/hotel';
import { StayDetailModal } from './StayDetailModal';
import { AddChargeModal } from '../billing/AddChargeModal';
import { AddPaymentModal } from '../billing/AddPaymentModal';
import { CheckoutModal } from '../billing/CheckoutModal';
import { InvoiceView } from '../billing/InvoiceView';
import {
  CalendarDays,
  Search,
  UserCheck,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';

interface ActiveStaysListProps {
  onCheckInClick: () => void;
  onOpenGuestProfile?: (guestId: string) => void;
}

export const ActiveStaysList: React.FC<ActiveStaysListProps> = ({
  onCheckInClick,
  onOpenGuestProfile,
}) => {
  const { stays, folios, settings, getInvoiceByStayId } = useHotel();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StayStatus | 'all'>('active');

  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [chargeStay, setChargeStay] = useState<Stay | null>(null);
  const [paymentStay, setPaymentStay] = useState<Stay | null>(null);
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const filteredStays = stays.filter((stay) => {
    if (statusFilter !== 'all' && stay.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        stay.guestName.toLowerCase().includes(q) ||
        stay.roomNumber.toLowerCase().includes(q) ||
        stay.guestPhone.includes(q) ||
        stay.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusIndicator = (status: StayStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In-House
          </span>
        );
      case 'checked_out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Departed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
    }
  };

  return (
    <div id="stays-management-view" className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Stay Registry & In-House Guests
          </h2>
          <p className="text-xs text-zinc-400 font-mono-numbers">
            {stays.length} total registered records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCheckInClick}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>New Check-In</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, room #, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All ({stays.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'active' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            In-House ({stays.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('checked_out')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'checked_out' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Departed ({stays.filter((s) => s.status === 'checked_out').length})
          </button>
        </div>
      </div>

      {/* Stays List Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {filteredStays.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs">
            <CalendarDays className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
            <p>No stays match the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 text-zinc-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Room</th>
                  <th className="py-2.5 px-3 font-medium">Guest Details</th>
                  <th className="py-2.5 px-3 font-medium">Dates</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Rate / Balance</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredStays.map((stay) => {
                  const folio = folios.find((f) => f.stayId === stay.id);
                  const balance = folio?.balanceDue || 0;
                  const invoice = getInvoiceByStayId(stay.id);

                  return (
                    <tr key={stay.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Room */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-900 font-mono-numbers">
                          #{stay.roomNumber}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-900">{stay.guestName}</div>
                        <div className="text-zinc-400 text-[11px] font-mono-numbers mt-0.5">
                          {stay.guestPhone} • {stay.totalGuests || 1} guest{(stay.totalGuests || 1) > 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3 text-zinc-600 font-mono-numbers">
                        <div>
                          {formatDate(stay.checkInDate)} → {formatDate(stay.expectedCheckOutDate)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {stay.actualCheckOutDate
                            ? `Checked out ${formatDate(stay.actualCheckOutDate)}`
                            : 'In-House'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {getStatusIndicator(stay.status)}
                      </td>

                      {/* Folio Balance */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-mono-numbers text-zinc-500">
                          Rate: {formatCurrency(stay.roomRatePerNight, settings.currencySymbol)}/nt
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`font-semibold font-mono-numbers ${
                              balance > 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            Bal: {formatCurrency(balance, settings.currencySymbol)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStay(stay)}
                            className="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer transition-colors"
                          >
                            Details
                          </button>

                          {stay.status === 'active' && (
                            <>
                              <button
                                onClick={() => setChargeStay(stay)}
                                className="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer transition-colors"
                              >
                                + Charge
                              </button>
                              <button
                                onClick={() => setPaymentStay(stay)}
                                className="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer transition-colors"
                              >
                                + Pay
                              </button>
                              <button
                                onClick={() => setCheckoutStay(stay)}
                                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                              >
                                Checkout
                              </button>
                            </>
                          )}

                          {stay.status === 'checked_out' && invoice && (
                            <button
                              onClick={() => setViewInvoice(invoice)}
                              className="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Receipt className="w-3 h-3 text-zinc-500" />
                              <span>Invoice</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stay Detail Drawer / Modal */}
      {selectedStay && (
        <StayDetailModal
          stay={selectedStay}
          isOpen={!!selectedStay}
          onClose={() => setSelectedStay(null)}
          onOpenCharge={(s) => setChargeStay(s)}
          onOpenPayment={(s) => setPaymentStay(s)}
          onOpenCheckout={(s) => setCheckoutStay(s)}
          onViewInvoice={(inv) => setViewInvoice(inv)}
          onOpenGuestProfile={onOpenGuestProfile}
        />
      )}

      {/* Add Charge Modal */}
      {chargeStay && (
        <AddChargeModal
          stay={chargeStay}
          isOpen={!!chargeStay}
          onClose={() => setChargeStay(null)}
        />
      )}

      {/* Add Payment Modal */}
      {paymentStay && (
        <AddPaymentModal
          stay={paymentStay}
          isOpen={!!paymentStay}
          onClose={() => setPaymentStay(null)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutStay && (
        <CheckoutModal
          stay={checkoutStay}
          isOpen={!!checkoutStay}
          onClose={() => setCheckoutStay(null)}
          onViewInvoice={(inv) => setViewInvoice(inv)}
        />
      )}

      {/* Invoice Modal */}
      {viewInvoice && (
        <InvoiceView
          invoice={viewInvoice}
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </div>
  );
};

