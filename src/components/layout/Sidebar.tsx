import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  History,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { hasRole } = useAuth();
  const { activeStays, rooms } = useHotel();

  const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'rooms',
      label: 'Rooms Matrix',
      icon: BedDouble,
      badge: cleaningRooms > 0 ? `${cleaningRooms} Cleaning` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'stays',
      label: 'Active Stays',
      icon: Users,
      badge: activeStays.length > 0 ? `${activeStays.length}` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'billing',
      label: 'Folios & Billing',
      icon: Receipt,
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'guests',
      label: 'Guest Directory',
      icon: FileText,
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'reports',
      label: 'Analytics & RevPAR',
      icon: BarChart3,
      roles: ['manager', 'admin'] as const,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      roles: ['admin', 'manager'] as const,
    },
    {
      id: 'settings',
      label: 'Hotel Settings',
      icon: Settings,
      roles: ['admin'] as const,
    },
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const isAllowed = hasRole(item.roles as any);
          if (!isAllowed) return null;

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 m-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Property Cloud PMS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-medium text-emerald-400">Online</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          GST-compliant billing, real-time KYC repository & operational logs.
        </p>
      </div>
    </aside>
  );
};
