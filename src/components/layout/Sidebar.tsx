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
  CheckCircle2,
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
      badge: cleaningRooms > 0 ? `${cleaningRooms}` : undefined,
      roles: ['receptionist', 'manager', 'admin'] as const,
    },
    {
      id: 'stays',
      label: 'Active Stays',
      icon: Users,
      badge: activeStays.length > 0 ? `${activeStays.length}` : undefined,
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
      label: 'Reports & Revenue',
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
      label: 'Settings',
      icon: Settings,
      roles: ['admin'] as const,
    },
  ];

  return (
    <aside id="app-sidebar" className="w-60 bg-white text-zinc-700 flex flex-col shrink-0 border-r border-zinc-200 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Overview
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white font-medium shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono-numbers ${
                    isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Minimal Footer */}
      <div className="p-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-medium text-zinc-600">Live PMS</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono-numbers">v2.4.0</span>
      </div>
    </aside>
  );
};

