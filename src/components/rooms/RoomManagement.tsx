import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus } from '../../types/hotel';
import { RoomStatusModal } from './RoomStatusModal';
import {
  BedDouble,
  Search,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Wrench,
  User,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface RoomManagementProps {
  onCheckInRoom: (room: Room) => void;
  onViewActiveStay: (stayId: string) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  onCheckInRoom,
  onViewActiveStay,
}) => {
  const { rooms, settings, updateRoomStatus } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.currentGuestName && r.currentGuestName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const roomTypes: string[] = Array.from(new Set(rooms.map((r) => r.type)));

  const countByStatus = (st: RoomStatus) => rooms.filter((r) => r.status === st).length;

  const getStatusBadge = (status: RoomStatus) => {
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
    <div id="room-management-view" className="space-y-6 select-none">
      {/* Top Banner / KPIs */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Inventory & Housekeeping</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">{rooms.length} Total Units</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <BedDouble className="w-5 h-5 text-indigo-400" />
            Room Inventory & Housekeeping Board
          </h2>
        </div>

        {/* Quick status counters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-emerald-400 font-medium">Available: </span>
            <span className="font-bold text-white font-mono-numbers">{countByStatus('available')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs">
            <span className="text-blue-400 font-medium">Occupied: </span>
            <span className="font-bold text-white font-mono-numbers">{countByStatus('occupied')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="text-amber-400 font-medium">Cleaning: </span>
            <span className="font-bold text-white font-mono-numbers">{countByStatus('cleaning')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
            <span className="text-rose-400 font-medium">Maintenance: </span>
            <span className="font-bold text-white font-mono-numbers">{countByStatus('maintenance')}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/70 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room # or guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Floor Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400 font-medium w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedFloor('all')}
            className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              selectedFloor === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            All Floors
          </button>
          {[1, 2, 3].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                selectedFloor === f ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        {/* Status & Type Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available (Clean)</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
            <option value="out_of_service">Out of Order</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Room Types</option>
            {roomTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === 'occupied';

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-48 hover:shadow-md ${
                isOccupied
                  ? 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                  : room.status === 'available'
                  ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600'
                  : room.status === 'cleaning'
                  ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-600'
                  : 'bg-slate-800/90 border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono-numbers text-white">#{room.roomNumber}</span>
                    <span className="text-[11px] text-slate-400">Fl {room.floor}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">{room.type}</div>
                </div>
                {getStatusBadge(room.status)}
              </div>

              {/* Middle Section: Occupant or Amenities */}
              <div className="my-2">
                {isOccupied ? (
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Guest In-House</div>
                    <div className="text-xs font-bold text-white truncate">{room.currentGuestName || 'Active Stay'}</div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((a, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700/60"
                      >
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 font-mono-numbers">
                  {formatCurrency(room.baseRate, settings.currencySymbol)}
                  <span className="text-slate-400 font-normal text-[11px]">/nt</span>
                </span>

                <span className="text-indigo-400 text-xs font-medium hover:underline">
                  Manage Status →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Detail / Status Modal */}
      {selectedRoom && (
        <RoomStatusModal
          room={selectedRoom}
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onCheckInRoom={onCheckInRoom}
          onViewActiveStay={onViewActiveStay}
        />
      )}
    </div>
  );
};
