import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  ShieldAlert,
  Search,
  UserCheck,
  LogOut,
  PlusCircle,
  CreditCard,
  Trash2,
  BedDouble,
  Settings,
} from 'lucide-react';
import { formatDateTime } from '../../utils/date';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useHotel();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && !log.action.includes(actionFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('CHECKIN')) return <UserCheck className="w-4 h-4 text-emerald-400" />;
    if (action.includes('CHECKOUT')) return <LogOut className="w-4 h-4 text-amber-400" />;
    if (action.includes('CHARGE_ADD')) return <PlusCircle className="w-4 h-4 text-indigo-400" />;
    if (action.includes('CHARGE_VOID')) return <Trash2 className="w-4 h-4 text-rose-400" />;
    if (action.includes('PAYMENT')) return <CreditCard className="w-4 h-4 text-emerald-400" />;
    if (action.includes('ROOM')) return <BedDouble className="w-4 h-4 text-sky-400" />;
    return <Settings className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div id="audit-trail-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Security Ledger</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">Immutable Event Logs</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Security & Operational Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of staff transactions, charge voids, guest check-ins, and folio events.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
          <span className="text-slate-400 block text-[10px]">Total Logs</span>
          <span className="font-bold text-white font-mono-numbers">{auditLogs.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff, action, or entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              actionFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActionFilter('CHECKIN')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              actionFilter === 'CHECKIN' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Check-Ins
          </button>
          <button
            onClick={() => setActionFilter('CHECKOUT')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              actionFilter === 'CHECKOUT' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Checkouts
          </button>
          <button
            onClick={() => setActionFilter('PAYMENT')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              actionFilter === 'PAYMENT' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActionFilter('CHARGE')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              actionFilter === 'CHARGE' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Charges
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/70 shadow-sm overflow-hidden text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No audit logs found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Staff Operator</th>
                  <th className="py-3 px-4 font-semibold">Action & Event</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Details & Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono-numbers">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-semibold text-slate-200 uppercase text-[11px]">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-300">
                      <span className="text-slate-400 uppercase text-[10px] block">{log.entityType}</span>
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono-numbers text-[11px] max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
