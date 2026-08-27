import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus } from '../../types/hotel';
import { X, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface RoomStatusModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckInRoom: (room: Room) => void;
  onViewActiveStay?: (stayId: string) => void;
}

export const RoomStatusModal: React.FC<RoomStatusModalProps> = ({
  room,
  isOpen,
  onClose,
  onCheckInRoom,
  onViewActiveStay,
}) => {
  const { updateRoomStatus, settings } = useHotel();
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>(room?.status || 'available');
  const [notes, setNotes] = useState<string>(room?.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !room) return null;

  const handleSaveStatus = async () => {
    try {
      setIsLoading(true);
      await updateRoomStatus(room.id, selectedStatus, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const statuses: Array<{ value: RoomStatus; label: string; desc: string }> = [
    {
      value: 'available',
      label: 'Vacant (Clean & Inspected)',
      desc: 'Room is sanitized, linen changed, ready for immediate check-in.',
    },
    {
      value: 'cleaning',
      label: 'Housekeeping in Progress',
      desc: 'Cleaning crew is currently refreshing or sanitizing the room.',
    },
    {
      value: 'maintenance',
      label: 'Maintenance / Out of Order',
      desc: 'Blocked for technical repairs, plumbing, HVAC, or painting.',
    },
    {
      value: 'reserved',
      label: 'Reserved (Upcoming Arrival)',
      desc: 'Room is pre-allocated for an incoming reservation.',
    },
    {
      value: 'out_of_service',
      label: 'Out of Service (Renovation)',
      desc: 'Long-term decommissioned or undergoing floor renovation.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs select-none">
      <div className="bg-white max-w-lg w-full p-6 rounded-2xl border border-zinc-200 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 font-mono-numbers font-semibold text-base text-zinc-900 flex items-center justify-center">
              #{room.roomNumber}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 capitalize">{room.type}</h3>
              <p className="text-xs text-zinc-500 font-mono-numbers">
                Floor {room.floor} • Tariff: {formatCurrency(room.baseRate, settings.currencySymbol)}/night
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Occupant Info if Occupied */}
        {room.status === 'occupied' ? (
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Current Occupant:</span>
              <span className="font-semibold text-zinc-900">{room.currentGuestName || 'Active In-House Guest'}</span>
            </div>
            {room.currentStayId && onViewActiveStay && (
              <button
                onClick={() => {
                  onClose();
                  onViewActiveStay(room.currentStayId!);
                }}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                View Stay Folio & Charges →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-2">
                Operational Status
              </label>
              <div className="space-y-1.5">
                {statuses.map((st) => (
                  <label
                    key={st.value}
                    className={`block p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selectedStatus === st.value
                        ? 'border-zinc-900 bg-zinc-50/80 font-medium'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="room_status_radio"
                        value={st.value}
                        checked={selectedStatus === st.value}
                        onChange={() => setSelectedStatus(st.value)}
                        className="accent-zinc-900"
                      />
                      <div>
                        <div className="text-xs text-zinc-900">{st.label}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{st.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Housekeeping / Maintenance Note
              </label>
              <input
                type="text"
                placeholder="e.g. Linens replaced, AC sanitized, minibar restocked"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Amenities Preview */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 mb-1.5">
            Room Amenities
          </div>
          <div className="flex flex-wrap gap-1">
            {room.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          {room.status === 'available' ? (
            <button
              onClick={() => {
                onClose();
                onCheckInRoom(room);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check In #{room.roomNumber}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {room.status !== 'occupied' && (
              <button
                onClick={handleSaveStatus}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Update Status'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

