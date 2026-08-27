import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { StatCards } from './StatCards';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import {
  BedDouble,
  Users,
  Search,
  ChevronRight,
  ArrowRight,
  Plus,
  CreditCard,
  LogOut,
  Calendar,
  Phone,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';
import { Stay, Room } from '../../types/hotel';

interface DashboardOverviewProps {
  onCheckInClick?: () => void;
  onNavigateRooms?: () => void;
  onNavigateStays?: () => void;
  onNavigateBilling?: () => void;
  onNewCheckIn?: () => void;
  onNavigate?: (tab: string) => void;
  onSelectStay?: (stay: Stay) => void;
  onSelectRoom?: (room: Room) => void;
  onOpenChargeModal: (stay: Stay) => void;
  onOpenPaymentModal: (stay: Stay) => void;
  onOpenCheckoutModal: (stay: Stay) => void;
  onViewInvoice?: (invoice: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onCheckInClick,
  onNavigateRooms,
  onNavigateStays,
  onNavigateBilling,
  onNewCheckIn,
  onNavigate,
  onSelectStay,
  onSelectRoom,
  onOpenChargeModal,
  onOpenPaymentModal,
  onOpenCheckoutModal,
}) => {
  const { rooms, activeStays, folios, settings } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckIn = onCheckInClick || onNewCheckIn || (() => {});
  const handleNav = onNavigate || ((tab: string) => {
    if (tab === 'rooms' && onNavigateRooms) onNavigateRooms();
    if (tab === 'stays' && onNavigateStays) onNavigateStays();
    if (tab === 'billing' && onNavigateBilling) onNavigateBilling();
  });

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    return true;
  });

  // Filter active stays
  const filteredStays = activeStays.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.guestName.toLowerCase().includes(q) ||
      s.roomNumber.toLowerCase().includes(q) ||
      s.guestPhone.includes(q)
    );
  });

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Available</span>;
      case 'occupied':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">Occupied</span>;
      case 'cleaning':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">Cleaning</span>;
      case 'maintenance':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">Maintenance</span>;
      case 'reserved':
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">Reserved</span>;
      default:
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">Out of Order</span>;
    }
  };

  return (
    <div id="dashboard-overview-view" className="space-y-6 select-none">
      {/* 1. Top KPI Summary */}
      <StatCards />

      {/* 2. Quick Action Bar */}
      <QuickActions
        onNewCheckIn={handleCheckIn}
        onNavigate={handleNav}
        onOpenQuickCharge={() => {
          if (activeStays.length > 0) onOpenChargeModal(activeStays[0]);
          else handleNav('stays');
        }}
        onOpenQuickPayment={() => {
          if (activeStays.length > 0) onOpenPaymentModal(activeStays[0]);
          else handleNav('stays');
        }}
        onOpenQuickCheckout={() => {
          if (activeStays.length > 0) onOpenCheckoutModal(activeStays[0]);
          else handleNav('stays');
        }}
      />

      {/* 3. Operational Grid & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Room Status Grid */}
        <div className="lg:col-span-2 bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Live Room Status Matrix</h2>
                <p className="text-xs text-slate-400">Click to update status or view folio</p>
              </div>
            </div>

            {/* Floor selector filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedFloor === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Floors
              </button>
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedFloor === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredRooms.map((room) => {
              const isOccupied = room.status === 'occupied';

              return (
                <div
                  key={room.id}
                  onClick={() => handleNav('rooms')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-32 hover:shadow-md ${
                    isOccupied
                      ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                      : room.status === 'available'
                      ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600'
                      : room.status === 'cleaning'
                      ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-600'
                      : 'bg-slate-900/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-bold font-mono-numbers text-white">#{room.roomNumber}</span>
                      <div className="text-[11px] text-slate-400">{room.type}</div>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isOccupied ? (
                      <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                        {room.currentGuestName || 'Guest In-House'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono-numbers">
                        {formatCurrency(room.baseRate, settings.currencySymbol)}/nt
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Fl {room.floor}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleNav('rooms')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Manage Full Room Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Live Audit Log Activity */}
        <div className="lg:col-span-1">
          <RecentActivity onNavigate={handleNav} />
        </div>
      </div>

      {/* 4. Active In-House Guests Quick Table */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Currently In-House Guests ({activeStays.length})</h2>
              <p className="text-xs text-slate-400">Manage stay charges, payments & checkouts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => handleNav('stays')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredStays.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No active in-house guests found.</p>
            <button
              onClick={handleCheckIn}
              className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Check In First Guest</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Room</th>
                  <th className="py-2.5 px-3 font-semibold">Guest</th>
                  <th className="py-2.5 px-3 font-semibold">Check-In</th>
                  <th className="py-2.5 px-3 font-semibold">Departure</th>
                  <th className="py-2.5 px-3 font-semibold">Folio Balance</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredStays.slice(0, 6).map((stay) => {
                  const folio = folios.find((f) => f.stayId === stay.id);
                  const balance = folio?.balanceDue || 0;

                  return (
                    <tr key={stay.id} className="hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white font-mono-numbers px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                          #{stay.roomNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{stay.guestName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{stay.guestPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {formatDate(stay.checkInDate)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {formatDate(stay.expectedCheckOutDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold font-mono-numbers ${
                            balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatCurrency(balance, settings.currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenChargeModal(stay)}
                            title="Add Charge"
                            className="px-2 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                          >
                            + Charge
                          </button>
                          <button
                            onClick={() => onOpenPaymentModal(stay)}
                            title="Add Payment"
                            className="px-2 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                          >
                            + Pay
                          </button>
                          <button
                            onClick={() => onOpenCheckoutModal(stay)}
                            title="Checkout"
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Checkout
                          </button>
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
    </div>
  );
};
