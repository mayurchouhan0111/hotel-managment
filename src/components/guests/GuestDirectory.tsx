import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Guest, Invoice } from '../../types/hotel';
import { GuestProfileModal } from './GuestProfileModal';
import { InvoiceView } from '../billing/InvoiceView';
import {
  Users,
  Search,
  Star,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface GuestDirectoryProps {
  onCheckInGuest: (guest: Guest) => void;
}

export const GuestDirectory: React.FC<GuestDirectoryProps> = ({ onCheckInGuest }) => {
  const { guests, settings } = useHotel();
  const [searchQuery, setSearchQuery] = useState('');
  const [vipFilter, setVipFilter] = useState<'all' | 'vip' | 'regular'>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const filteredGuests = guests.filter((g) => {
    if (vipFilter === 'vip' && !g.isVip) return false;
    if (vipFilter === 'regular' && g.isVip) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        g.fullName.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.email && g.email.toLowerCase().includes(q)) ||
        g.idNumber.toLowerCase().includes(q) ||
        (g.city && g.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="guest-directory-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Central Guest CRM</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">KYC & Document Vault</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            Guest Directory & KYC Profiles
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
            <span className="text-slate-400 block text-[10px]">Total Guests</span>
            <span className="font-bold text-white font-mono-numbers">{guests.length}</span>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
            <span className="text-slate-400 block text-[10px]">VIP Profiles</span>
            <span className="font-bold text-amber-400 font-mono-numbers">
              {guests.filter((g) => g.isVip).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, Aadhaar / Passport, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-slate-400 text-xs w-full sm:w-auto">
          <button
            onClick={() => setVipFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              vipFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            All ({guests.length})
          </button>
          <button
            onClick={() => setVipFilter('vip')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              vipFilter === 'vip' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>VIP ({guests.filter((g) => g.isVip).length})</span>
          </button>
          <button
            onClick={() => setVipFilter('regular')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              vipFilter === 'regular' ? 'bg-indigo-600 text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Standard ({guests.filter((g) => !g.isVip).length})
          </button>
        </div>
      </div>

      {/* Guest Directory Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => (
          <div
            key={guest.id}
            onClick={() => setSelectedGuest(guest)}
            className="p-5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/70 hover:border-slate-500 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {guest.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-white text-sm">{guest.fullName}</h3>
                      {guest.isVip && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono-numbers">
                      {guest.id}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700 border border-slate-600 text-slate-300 font-mono-numbers">
                  {guest.totalStaysCount} Stays
                </span>
              </div>

              {/* Contact & ID Details */}
              <div className="mt-3.5 space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono-numbers">{guest.phone}</span>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono-numbers">{guest.idType.toUpperCase()}: {guest.idNumber}</span>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Spent: <strong className="text-white font-mono-numbers">{formatCurrency(guest.totalSpent, settings.currencySymbol)}</strong>
              </span>
              <span className="text-indigo-400 font-medium hover:underline text-xs">
                View Profile →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Guest Profile Modal */}
      {selectedGuest && (
        <GuestProfileModal
          guest={selectedGuest}
          isOpen={!!selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onCheckInGuest={onCheckInGuest}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
        />
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <InvoiceView
          invoice={viewingInvoice}
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};
