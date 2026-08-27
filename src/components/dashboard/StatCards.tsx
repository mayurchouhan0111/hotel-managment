import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Users,
  TrendingUp,
  CreditCard,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const StatCards: React.FC = () => {
  const { rooms, activeStays, folios, settings } = useHotel();

  const totalRooms = rooms.length || 12;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;

  const totalGuests = activeStays.reduce((acc, s) => acc + (s.totalGuests || 1), 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const departuresToday = activeStays.filter((s) => {
    if (!s.expectedCheckOutDate) return false;
    const d = new Date(s.expectedCheckOutDate);
    return (
      d.getDate() === todayStart.getDate() &&
      d.getMonth() === todayStart.getMonth() &&
      d.getFullYear() === todayStart.getFullYear()
    );
  }).length;

  let todayRevenue = 0;
  let totalOutstanding = 0;

  for (const folio of folios) {
    if (folio.status !== 'refunded') {
      totalOutstanding += folio.balanceDue || 0;
    }
    for (const payment of folio.payments || []) {
      if (payment.refunded) continue;
      const pDate = new Date(payment.timestamp);
      if (
        pDate.getDate() === todayStart.getDate() &&
        pDate.getMonth() === todayStart.getMonth() &&
        pDate.getFullYear() === todayStart.getFullYear()
      ) {
        todayRevenue += payment.amount || 0;
      }
    }
  }

  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Occupancy */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Occupancy</span>
          <Percent className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono-numbers text-zinc-900">{occupancyRate}%</span>
            <span className="text-xs text-zinc-400 font-mono-numbers">{occupiedRooms}/{totalRooms} Rooms</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1 mt-2.5 overflow-hidden">
            <div
              className="bg-zinc-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono-numbers">
            <span>{availableRooms} vacant</span>
            {cleaningRooms > 0 && <span className="text-amber-600">{cleaningRooms} cleaning</span>}
          </div>
        </div>
      </div>

      {/* 2. In-House Guests */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>In-House Guests</span>
          <Users className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono-numbers text-zinc-900">{totalGuests}</span>
            <span className="text-xs text-zinc-400 font-mono-numbers">{activeStays.length} stays</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-3 pt-1 border-t border-zinc-100 font-mono-numbers">
            <span>Active: {activeStays.length}</span>
            <span>Due out: {departuresToday}</span>
          </div>
        </div>
      </div>

      {/* 3. Today's Revenue */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Today's Collections</span>
          <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold font-mono-numbers text-zinc-900">
              {formatCurrency(todayRevenue, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 pt-1 border-t border-zinc-100 truncate">
            Settled today
          </p>
        </div>
      </div>

      {/* 4. Outstanding Folios */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Open Receivables</span>
          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold font-mono-numbers text-zinc-900">
              {formatCurrency(totalOutstanding, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 pt-1 border-t border-zinc-100 truncate">
            Unsettled folio balance
          </p>
        </div>
      </div>
    </div>
  );
};

