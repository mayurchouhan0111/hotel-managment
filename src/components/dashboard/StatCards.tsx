import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  BedDouble,
  Users,
  LogIn,
  LogOut,
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

  // Today's date boundary
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Expected departures today
  const departuresToday = activeStays.filter((s) => {
    if (!s.expectedCheckOutDate) return false;
    const d = new Date(s.expectedCheckOutDate);
    return (
      d.getDate() === todayStart.getDate() &&
      d.getMonth() === todayStart.getMonth() &&
      d.getFullYear() === todayStart.getFullYear()
    );
  }).length;

  // Calculate Today's Payments Revenue & Outstanding
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Occupancy & Available */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-numbers text-white">{occupancyRate}%</span>
            <span className="text-xs text-slate-400 font-mono-numbers">({occupiedRooms}/{totalRooms} Rooms)</span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium mt-2.5">
            <span className="text-emerald-400">{availableRooms} Available</span>
            {cleaningRooms > 0 && <span className="text-amber-400">{cleaningRooms} Cleaning</span>}
          </div>
        </div>
      </div>

      {/* 2. In-House Guests */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In-House Guests</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-numbers text-white">{totalGuests}</span>
            <span className="text-xs text-slate-400">across {activeStays.length} active stays</span>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeStays.length} In-House</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>{departuresToday} Due Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Today's Revenue */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Collections</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">
              {formatCurrency(todayRevenue, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2.5">
            Settled payments & front desk collections
          </p>
        </div>
      </div>

      {/* 4. Outstanding Folios */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Receivables</span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">
              {formatCurrency(totalOutstanding, settings.currencySymbol)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2.5">
            Pending checkout folio balances
          </p>
        </div>
      </div>
    </div>
  );
};
