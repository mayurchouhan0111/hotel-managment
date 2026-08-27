import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  History,
  LogIn,
  LogOut,
  CreditCard,
  PlusCircle,
  BedDouble,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '../../utils/date';

export const RecentActivity: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { auditLogs } = useHotel();

  const recentLogs = auditLogs.slice(0, 6);

  const getActionIcon = (action: string) => {
    if (action.includes('CHECKIN') || action.includes('CHECK_IN')) {
      return <LogIn className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (action.includes('CHECKOUT')) {
      return <LogOut className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (action.includes('PAYMENT')) {
      return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (action.includes('CHARGE')) {
      return <PlusCircle className="w-3.5 h-3.5 text-purple-600" />;
    }
    if (action.includes('ROOM')) {
      return <BedDouble className="w-3.5 h-3.5 text-indigo-600" />;
    }
    return <History className="w-3.5 h-3.5 text-zinc-500" />;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
          Audit Activity
        </h2>
        <button
          onClick={() => onNavigate('audit')}
          className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 cursor-pointer transition-colors"
        >
          <span>All logs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No activity recorded.
          </div>
        ) : (
          recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex items-start gap-2.5 text-xs"
            >
              <div className="p-1 rounded bg-white border border-zinc-200 shrink-0">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium text-zinc-900 truncate text-xs">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-zinc-400 font-mono-numbers shrink-0">
                    {formatDateTime(log.timestamp).split(',')[1] || formatDateTime(log.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500">
                  <span>{log.actorName}</span>
                  <span>•</span>
                  <span className="font-mono-numbers text-zinc-400">{log.entityId}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

