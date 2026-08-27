import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  History,
  LogIn,
  LogOut,
  CreditCard,
  PlusCircle,
  BedDouble,
  User,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '../../utils/date';

export const RecentActivity: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { auditLogs } = useHotel();

  const recentLogs = auditLogs.slice(0, 8);

  const getActionBadge = (action: string) => {
    if (action.includes('CHECKIN') || action.includes('CHECK_IN')) {
      return { icon: LogIn, bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
    if (action.includes('CHECKOUT')) {
      return { icon: LogOut, bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    }
    if (action.includes('PAYMENT')) {
      return { icon: CreditCard, bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    }
    if (action.includes('CHARGE')) {
      return { icon: PlusCircle, bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    }
    if (action.includes('ROOM')) {
      return { icon: BedDouble, bg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
    }
    return { icon: History, bg: 'bg-slate-700/50 text-slate-300 border border-slate-600/50' };
  };

  return (
    <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col h-full select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">
            Recent Audit Stream
          </h2>
        </div>
        <button
          onClick={() => onNavigate('audit')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All Logs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No recent activity recorded.
          </div>
        ) : (
          recentLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;

            return (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 transition-colors flex items-start gap-3 text-xs"
              >
                <div className={`p-1.5 rounded-md shrink-0 ${badge.bg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white truncate text-xs">{log.action.replace('_', ' ')}</span>
                    <span className="text-[11px] text-slate-400 font-mono-numbers shrink-0">
                      {formatDateTime(log.timestamp).split(',')[1] || formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.actorName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono-numbers">{log.entityId}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
