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
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-600" />
            Guest Directory & KYC
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registered guest profiles, identification records, and stay history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-400 block text-[10px]">Total Guests</span>
            <span className="font-semibold text-zinc-900 font-mono-numbers">{guests.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-400 block text-[10px]">VIP Guests</span>
            <span className="font-semibold text-amber-700 font-mono-numbers">
              {guests.filter((g) => g.isVip).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, ID number, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-zinc-600 text-xs w-full sm:w-auto">
          <button
            onClick={() => setVipFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              vipFilter === 'all' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
            }`}
          >
            All ({guests.length})
          </button>
          <button
            onClick={() => setVipFilter('vip')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              vipFilter === 'vip' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
            }`}
          >
            <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span>VIP ({guests.filter((g) => g.isVip).length})</span>
          </button>
          <button
            onClick={() => setVipFilter('regular')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              vipFilter === 'regular' ? 'bg-white text-zinc-900 font-medium shadow-xs' : 'hover:text-zinc-900'
            }`}
          >
            Standard ({guests.filter((g) => !g.isVip).length})
          </button>
        </div>
      </div>

      {/* Guest Directory Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredGuests.map((guest) => (
          <div
            key={guest.id}
            onClick={() => setSelectedGuest(guest)}
            className="p-4 bg-white hover:bg-zinc-50/50 rounded-2xl border border-zinc-200 hover:border-zinc-300 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 text-xs"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold flex items-center justify-center text-xs">
                    {guest.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-zinc-900 text-xs">{guest.fullName}</h3>
                      {guest.isVip && (
                        <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono-numbers">
                      {guest.id}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 font-mono-numbers">
                  {guest.totalStaysCount} stays
                </span>
              </div>

              {/* Contact & ID Details */}
              <div className="mt-3 space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2.5">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="font-mono-numbers">{guest.phone}</span>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-500 pt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="font-mono-numbers">{guest.idType.toUpperCase()}: {guest.idNumber}</span>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Spent: <strong className="text-zinc-900 font-mono-numbers font-medium">{formatCurrency(guest.totalSpent, settings.currencySymbol)}</strong>
              </span>
              <span className="text-zinc-900 font-medium hover:underline text-xs">
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

