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
  Plus,
  CreditCard,
  LogOut,
  FileText,
  UserCheck,
  Phone,
  Building2,
  Receipt,
  User,
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

  // Modals state
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

  const getStatusBadge = (status: StayStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            In-House
          </span>
        );
      case 'checked_out':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
            Checked Out
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div id="stays-management-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Front Desk Register</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">{stays.length} Registered Stays</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            Guest Stays & In-House Register
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCheckInClick}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>New Guest Check-In</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest name, room #, phone, or stay ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400 font-medium w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            All Stays
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'active' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            In-House ({stays.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('checked_out')}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              statusFilter === 'checked_out' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Departed ({stays.filter((s) => s.status === 'checked_out').length})
          </button>
        </div>
      </div>

      {/* Stays List Table */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/70 shadow-sm overflow-hidden">
        {filteredStays.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <CalendarDays className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p>No stays match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Room</th>
                  <th className="py-3 px-4 font-semibold">Guest Details</th>
                  <th className="py-3 px-4 font-semibold">Dates & Nights</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Tariff / Balance</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredStays.map((stay) => {
                  const folio = folios.find((f) => f.stayId === stay.id);
                  const balance = folio?.balanceDue || 0;
                  const invoice = getInvoiceByStayId(stay.id);

                  return (
                    <tr key={stay.id} className="hover:bg-slate-800 transition-colors">
                      {/* Room */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono-numbers px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-sm">
                            #{stay.roomNumber}
                          </span>
                        </div>
                      </td>

                      {/* Guest Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{stay.guestName}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-mono-numbers">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {stay.guestPhone}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>{stay.totalGuests || 1} Guests</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-xs">
                          {formatDate(stay.checkInDate)} → {formatDate(stay.expectedCheckOutDate)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {stay.actualCheckOutDate
                            ? `Checked out ${formatDate(stay.actualCheckOutDate)}`
                            : 'Currently In-House'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(stay.status)}
                      </td>

                      {/* Folio Balance */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-mono-numbers text-slate-300">
                          Rate: {formatCurrency(stay.dailyRate, settings.currencySymbol)}/nt
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`font-semibold font-mono-numbers text-xs ${
                              balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            Bal: {formatCurrency(balance, settings.currencySymbol)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStay(stay)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                          >
                            Details
                          </button>

                          {stay.status === 'active' && (
                            <>
                              <button
                                onClick={() => setChargeStay(stay)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                              >
                                + Charge
                              </button>
                              <button
                                onClick={() => setPaymentStay(stay)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                              >
                                + Pay
                              </button>
                              <button
                                onClick={() => setCheckoutStay(stay)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                              >
                                Checkout
                              </button>
                            </>
                          )}

                          {stay.status === 'checked_out' && invoice && (
                            <button
                              onClick={() => setViewInvoice(invoice)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium cursor-pointer flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
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
