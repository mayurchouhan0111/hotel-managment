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

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    return true;
  });

  const filteredStays = activeStays.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.guestName.toLowerCase().includes(q) ||
      s.roomNumber.toLowerCase().includes(q) ||
      s.guestPhone.includes(q)
    );
  });

  const getStatusIndicator = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Vacant
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
            Occupied
          </span>
        );
      case 'cleaning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Cleaning
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Reserved
          </span>
        );
    }
  };

  return (
    <div id="dashboard-overview-view" className="space-y-6 select-none">
      {/* 1. Top KPI Summary */}
      <StatCards />

      {/* 2. Quick Operations Bar */}
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
        {/* Left 2 Cols: Room Matrix */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Room Inventory Status
              </h2>
              <p className="text-[11px] text-zinc-400">Live floor distribution</p>
            </div>

            {/* Floor selector filter */}
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  selectedFloor === 'all' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All
              </button>
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    selectedFloor === f ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Floor {f}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredRooms.map((room) => {
              const isOccupied = room.status === 'occupied';

              return (
                <div
                  key={room.id}
                  onClick={() => handleNav('rooms')}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between h-28 ${
                    isOccupied
                      ? 'bg-zinc-50/60 border-zinc-200 hover:border-zinc-300'
                      : room.status === 'available'
                      ? 'bg-white border-zinc-200 hover:border-zinc-300'
                      : room.status === 'cleaning'
                      ? 'bg-amber-50/30 border-amber-200/60 hover:border-amber-300'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold font-mono-numbers text-zinc-900">#{room.roomNumber}</span>
                      <div className="text-[11px] text-zinc-400 capitalize">{room.type}</div>
                    </div>
                    {getStatusIndicator(room.status)}
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    {isOccupied ? (
                      <span className="text-[11px] font-medium text-zinc-700 truncate max-w-[100px]">
                        {room.currentGuestName || 'Guest'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-mono-numbers">
                        {formatCurrency(room.baseRate, settings.currencySymbol)}/nt
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400">Fl {room.floor}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={() => handleNav('rooms')}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage all rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Live Audit Log Activity */}
        <div className="lg:col-span-1">
          <RecentActivity onNavigate={handleNav} />
        </div>
      </div>

      {/* 4. Active In-House Guests Table */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              In-House Guests ({activeStays.length})
            </h2>
            <p className="text-[11px] text-zinc-400">Current resident records and folio balances</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>
            <button
              onClick={() => handleNav('stays')}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredStays.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400">No active in-house stays found.</p>
            <button
              onClick={handleCheckIn}
              className="mt-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Check In Guest</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 text-zinc-400 text-[11px]">
                <tr>
                  <th className="py-2 px-3 font-medium">Room</th>
                  <th className="py-2 px-3 font-medium">Guest</th>
                  <th className="py-2 px-3 font-medium">Check-In</th>
                  <th className="py-2 px-3 font-medium">Departure</th>
                  <th className="py-2 px-3 font-medium">Folio Balance</th>
                  <th className="py-2 px-3 font-medium text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredStays.slice(0, 6).map((stay) => {
                  const folio = folios.find((f) => f.stayId === stay.id);
                  const balance = folio?.balanceDue || 0;

                  return (
                    <tr key={stay.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-zinc-900 font-mono-numbers">
                          #{stay.roomNumber}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-zinc-900">{stay.guestName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono-numbers">
                          {stay.guestPhone}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 font-mono-numbers">
                        {formatDate(stay.checkInDate)}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 font-mono-numbers">
                        {formatDate(stay.expectedCheckOutDate)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold font-mono-numbers ${
                            balance > 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(balance, settings.currencySymbol)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenChargeModal(stay)}
                            className="px-2 py-1 rounded hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer border border-zinc-200 transition-colors"
                          >
                            + Charge
                          </button>
                          <button
                            onClick={() => onOpenPaymentModal(stay)}
                            className="px-2 py-1 rounded hover:bg-zinc-100 text-zinc-700 text-xs cursor-pointer border border-zinc-200 transition-colors"
                          >
                            + Pay
                          </button>
                          <button
                            onClick={() => onOpenCheckoutModal(stay)}
                            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
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

