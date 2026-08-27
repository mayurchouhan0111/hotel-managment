import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus } from '../../types/hotel';
import { RoomStatusModal } from './RoomStatusModal';
import { Search } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface RoomManagementProps {
  onCheckInRoom: (room: Room) => void;
  onViewActiveStay: (stayId: string) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  onCheckInRoom,
  onViewActiveStay,
}) => {
  const { rooms, settings } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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

  const getStatusIndicator = (status: RoomStatus) => {
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
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Reserved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Out of Order
          </span>
        );
    }
  };

  return (
    <div id="room-management-view" className="space-y-4 select-none">
      {/* Header & Quick stats */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Room Inventory & Status
          </h2>
          <p className="text-xs text-zinc-400">
            {rooms.length} total units configured across floors
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-numbers">
          <div className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600">
            <span>Vacant: </span>
            <span className="font-semibold text-emerald-700">{countByStatus('available')}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600">
            <span>Occupied: </span>
            <span className="font-semibold text-zinc-900">{countByStatus('occupied')}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600">
            <span>Cleaning: </span>
            <span className="font-semibold text-amber-700">{countByStatus('cleaning')}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600">
            <span>Maintenance: </span>
            <span className="font-semibold text-rose-700">{countByStatus('maintenance')}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room # or guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
          />
        </div>

        {/* Floor selector */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedFloor('all')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              selectedFloor === 'all' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Floors
          </button>
          {[1, 2, 3].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                selectedFloor === f ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
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
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="available">Vacant (Clean)</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
            <option value="out_of_service">Out of Order</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-zinc-900 cursor-pointer"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === 'occupied';

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between h-40 bg-white hover:border-zinc-300 shadow-xs ${
                isOccupied
                  ? 'border-zinc-200'
                  : room.status === 'available'
                  ? 'border-zinc-200'
                  : room.status === 'cleaning'
                  ? 'border-amber-200/80 bg-amber-50/20'
                  : 'border-zinc-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-semibold font-mono-numbers text-zinc-900">#{room.roomNumber}</span>
                    <span className="text-[11px] text-zinc-400">Fl {room.floor}</span>
                  </div>
                  <div className="text-xs text-zinc-500 capitalize">{room.type}</div>
                </div>
                {getStatusIndicator(room.status)}
              </div>

              {/* Middle Section: Occupant or Amenities */}
              <div className="my-1">
                {isOccupied ? (
                  <div className="p-1.5 rounded bg-zinc-50 border border-zinc-100 text-[11px]">
                    <div className="text-zinc-400 text-[10px]">Resident</div>
                    <div className="font-medium text-zinc-900 truncate">{room.currentGuestName || 'Active Stay'}</div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((a, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-zinc-50 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-200"
                      >
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[10px] text-zinc-400">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 font-mono-numbers">
                  {formatCurrency(room.baseRate, settings.currencySymbol)}
                  <span className="text-zinc-400 font-normal text-[10px]">/nt</span>
                </span>

                <span className="text-zinc-500 text-xs hover:text-zinc-900 transition-colors">
                  Details →
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

