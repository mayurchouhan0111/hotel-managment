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
    if (action.includes('CHECKIN')) return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
    if (action.includes('CHECKOUT')) return <LogOut className="w-3.5 h-3.5 text-amber-600" />;
    if (action.includes('CHARGE_ADD')) return <PlusCircle className="w-3.5 h-3.5 text-zinc-600" />;
    if (action.includes('CHARGE_VOID')) return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
    if (action.includes('PAYMENT')) return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
    if (action.includes('ROOM')) return <BedDouble className="w-3.5 h-3.5 text-zinc-600" />;
    return <Settings className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div id="audit-trail-view" className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-700" />
            Security & Audit Trail
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tamper-evident logs of staff transactions, charge voids, check-ins, and folio updates.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs self-start md:self-auto">
          <span className="text-zinc-400 block text-[10px]">Total Events</span>
          <span className="font-semibold text-zinc-900 font-mono-numbers">{auditLogs.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff, action, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-200 text-zinc-500 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'CHECKIN', label: 'Check-Ins' },
            { key: 'CHECKOUT', label: 'Checkouts' },
            { key: 'PAYMENT', label: 'Payments' },
            { key: 'CHARGE', label: 'Charges' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActionFilter(tab.key)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                actionFilter === tab.key
                  ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            No audit logs found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3.5 font-medium">Staff Operator</th>
                  <th className="py-2.5 px-3.5 font-medium">Action & Event</th>
                  <th className="py-2.5 px-3.5 font-medium">Target Entity</th>
                  <th className="py-2.5 px-3.5 font-medium">Details & Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 text-zinc-400 whitespace-nowrap font-mono-numbers">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-zinc-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        {getActionIcon(log.action)}
                        <span className="font-medium text-zinc-700 text-xs">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono-numbers text-zinc-600">
                      <span className="text-zinc-400 uppercase text-[10px] block">{log.entityType}</span>
                      {log.entityId}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-500 font-mono-numbers text-[11px] max-w-xs truncate">
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
