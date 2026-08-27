import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  ChevronDown,
  Clock,
  Database,
  Building2,
  BedDouble,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenCheckIn?: () => void;
  onQuickCheckIn?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCheckIn, onQuickCheckIn, activeTab, setActiveTab }) => {
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
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;
  const occupancyPercent = Math.round((occupiedCount / totalRooms) * 100);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <header id="main-app-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 select-none">
      <div className="px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Hotel Brand & Live Clock */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  {settings.name || 'Grand Horizon Royale'}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                  PMS Enterprise
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-medium text-slate-400">Front Desk</span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-slate-300 font-mono-numbers">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-white font-semibold">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3 pl-6 border-l border-slate-800">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">Occupancy:</span>
              <span className="font-semibold text-white font-mono-numbers">{occupancyPercent}%</span>
              <span className="text-slate-400 text-[11px]">({occupiedCount}/{totalRooms})</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-[11px] font-medium text-slate-400">Available:</span>
              <span className="font-semibold text-emerald-400 font-mono-numbers">{availableCount}</span>
            </div>
            {cleaningCount > 0 && (
              <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-amber-500/30 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-[11px] font-medium text-amber-300">Cleaning:</span>
                <span className="font-semibold text-amber-300 font-mono-numbers">{cleaningCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Staff Profile Switcher */}
        <div className="flex items-center gap-3">
          {/* Primary Quick Check-in Button */}
          <button
            id="header-quick-checkin-btn"
            onClick={handleCheckInTrigger}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-In</span>
          </button>

          {/* Seed Demo Data Button */}
          <button
            id="header-seed-demo-btn"
            onClick={() => seedInitialData()}
            title="Seed sample hotel rooms, guests & stays"
            className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-3 py-2 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Demo Data</span>
          </button>

          {/* Staff Switcher Menu */}
          <div className="relative">
            <button
              id="staff-profile-dropdown-btn"
              onClick={() => setShowStaffMenu(!showStaffMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/90 hover:bg-slate-800 transition-all text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-2">
                  <span>{currentUser.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-medium uppercase ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono-numbers">{currentUser.employeeId}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Staff Switcher Dropdown */}
            {showStaffMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStaffMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl p-2 z-50 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">
                      Switch Active Staff Persona
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Test role-based access & permissions.
                    </p>
                  </div>
                  <div className="py-1 space-y-1">
                    {availableStaffUsers.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => {
                          switchStaffUser(staff);
                          setShowStaffMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          currentUser.id === staff.id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                              currentUser.id === staff.id ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-white'
                            }`}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className={`text-[11px] ${currentUser.id === staff.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {staff.email}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-medium ${
                            currentUser.id === staff.id
                              ? 'border-indigo-400 text-white'
                              : getRoleBadge(staff.role)
                          }`}
                        >
                          {staff.role}
                        </span>
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
