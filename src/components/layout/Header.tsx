import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  ChevronDown,
  Building2,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onOpenCheckIn?: () => void;
  onQuickCheckIn?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCheckIn, onQuickCheckIn }) => {
  const { settings, rooms, seedInitialData } = useHotel();
  const { currentUser, switchStaffUser, availableStaffUsers } = useAuth();
  const [showStaffMenu, setShowStaffMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleCheckInTrigger = onOpenCheckIn || onQuickCheckIn || (() => {});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalRooms = rooms.length || 12;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const occupancyPercent = Math.round((occupiedCount / totalRooms) * 100);

  return (
    <header id="main-app-header" className="bg-white border-b border-zinc-200 sticky top-0 z-30 select-none">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Hotel Brand & Occupancy Pills */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-zinc-900 tracking-tight leading-none">
                  {settings.name || 'Grand Horizon Royale'}
                </h1>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  PMS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono-numbers">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
              <span className="text-zinc-400">Occupancy</span>
              <span className="font-semibold text-zinc-900 font-mono-numbers">{occupancyPercent}%</span>
              <span className="text-zinc-400 font-mono-numbers">({occupiedCount}/{totalRooms})</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-400">Available</span>
              <span className="font-semibold text-emerald-700 font-mono-numbers">{availableCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Staff Profile Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Seed Demo Data Button */}
          <button
            id="header-seed-demo-btn"
            onClick={() => seedInitialData()}
            title="Seed sample hotel rooms, guests & stays"
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reseed Data</span>
          </button>

          {/* Primary Quick Check-in Button */}
          <button
            id="header-quick-checkin-btn"
            onClick={handleCheckInTrigger}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Check-In</span>
          </button>

          {/* Staff Switcher Menu */}
          <div className="relative">
            <button
              id="staff-profile-dropdown-btn"
              onClick={() => setShowStaffMenu(!showStaffMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 transition-colors text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-800 flex items-center justify-center font-semibold text-xs border border-zinc-200">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-zinc-900 leading-tight">
                  {currentUser.name}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Staff Switcher Dropdown */}
            {showStaffMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStaffMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl p-1.5 z-50 shadow-lg">
                  <div className="px-2.5 py-1.5 border-b border-zinc-100">
                    <p className="text-xs font-medium text-zinc-900">
                      Switch Active Staff Role
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Preview different RBAC permissions
                    </p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {availableStaffUsers.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => {
                          switchStaffUser(staff);
                          setShowStaffMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          currentUser.id === staff.id
                            ? 'bg-zinc-100 text-zinc-900 font-medium'
                            : 'hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center font-medium text-[11px] ${
                              currentUser.id === staff.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-xs text-zinc-900">{staff.name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono-numbers">
                              {staff.role}
                            </div>
                          </div>
                        </div>
                        {currentUser.id === staff.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

