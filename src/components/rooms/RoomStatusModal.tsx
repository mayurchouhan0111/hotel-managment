import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus } from '../../types/hotel';
import { X, BedDouble, CheckCircle2, User, Sparkles } from 'lucide-react';
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

  const statuses: Array<{ value: RoomStatus; label: string; desc: string; color: string }> = [
    {
      value: 'available',
      label: 'Available (Clean & Inspected)',
      desc: 'Room is sanitized, linens changed, and ready for check-in.',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-white',
    },
    {
      value: 'cleaning',
      label: 'Housekeeping in Progress',
      desc: 'Cleaning crew is currently refreshing or sanitizing the room.',
      color: 'border-amber-500/50 bg-amber-950/20 text-white',
    },
    {
      value: 'maintenance',
      label: 'Maintenance / Out of Order',
      desc: 'Blocked for technical repairs, plumbing, HVAC, or painting.',
      color: 'border-rose-500/50 bg-rose-950/20 text-white',
    },
    {
      value: 'reserved',
      label: 'Reserved (Upcoming Arrival)',
      desc: 'Room is pre-allocated for an incoming guest arrival.',
      color: 'border-purple-500/50 bg-purple-950/20 text-white',
    },
    {
      value: 'out_of_service',
      label: 'Out of Service (Renovation)',
      desc: 'Long-term decommissioned or undergoing floor renovation.',
      color: 'border-slate-600 bg-slate-800 text-slate-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="bg-slate-900 max-w-lg w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-mono-numbers font-bold text-lg flex items-center justify-center">
              #{room.roomNumber}
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Room Information</div>
              <h3 className="text-base font-bold text-white">{room.type}</h3>
              <p className="text-xs text-slate-400 font-mono-numbers">
                Floor {room.floor} • Base Tariff: {formatCurrency(room.baseRate, settings.currencySymbol)}/night
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Occupant Info if Occupied */}
        {room.status === 'occupied' ? (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Current Occupant:</span>
              <span className="text-sm font-bold text-white">{room.currentGuestName || 'Active In-House Guest'}</span>
            </div>
            {room.currentStayId && onViewActiveStay && (
              <button
                onClick={() => {
                  onClose();
                  onViewActiveStay(room.currentStayId!);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                View Stay Folio & Charges →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Operational Status
              </label>
              <div className="space-y-2">
                {statuses.map((st) => (
                  <label
                    key={st.value}
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedStatus === st.value
                        ? `${st.color} border-indigo-500 shadow-sm font-medium`
                        : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="room_status_radio"
                        value={st.value}
                        checked={selectedStatus === st.value}
                        onChange={() => setSelectedStatus(st.value)}
                        className="accent-indigo-600"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{st.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Housekeeping / Maintenance Note
              </label>
              <input
                type="text"
                placeholder="e.g. Linens replaced, AC sanitized, minibar restocked"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Amenities Preview */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Room Amenities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          {room.status === 'available' ? (
            <button
              onClick={() => {
                onClose();
                onCheckInRoom(room);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check In Room #{room.roomNumber}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            {room.status !== 'occupied' && (
              <button
                onClick={handleSaveStatus}
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
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
