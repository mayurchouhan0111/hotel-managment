import React from 'react';
import {
  UserPlus,
  PlusCircle,
  CreditCard,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';

interface QuickActionsProps {
  onNewCheckIn: () => void;
  onNavigate: (tab: string) => void;
  onOpenQuickCharge: () => void;
  onOpenQuickPayment: () => void;
  onOpenQuickCheckout: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewCheckIn,
  onOpenQuickCharge,
  onOpenQuickPayment,
  onOpenQuickCheckout,
}) => {
  const actions = [
    {
      id: 'quick-checkin',
      title: 'New Check-In',
      description: 'KYC onboarding & room key assignment',
      icon: UserPlus,
      accent: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      badge: 'Arrival',
      badgeColor: 'bg-indigo-700/80 text-white',
      onClick: onNewCheckIn,
    },
    {
      id: 'quick-charge',
      title: 'Post Service Charge',
      description: 'Room dining, laundry, minibar, or spa',
      icon: PlusCircle,
      accent: 'bg-slate-800 hover:bg-slate-700/90 text-white border border-slate-700',
      badge: 'Add Charge',
      badgeColor: 'bg-slate-700 text-slate-300',
      onClick: onOpenQuickCharge,
    },
    {
      id: 'quick-payment',
      title: 'Record Payment',
      description: 'UPI QR, credit/debit card, or cash',
      icon: CreditCard,
      accent: 'bg-slate-800 hover:bg-slate-700/90 text-white border border-slate-700',
      badge: 'Settlement',
      badgeColor: 'bg-slate-700 text-slate-300',
      onClick: onOpenQuickPayment,
    },
    {
      id: 'quick-checkout',
      title: 'Express Checkout',
      description: 'Settle folio & generate GST tax invoice',
      icon: LogOut,
      accent: 'bg-slate-800 hover:bg-slate-700/90 text-white border border-slate-700',
      badge: 'Departure',
      badgeColor: 'bg-slate-700 text-slate-300',
      onClick: onOpenQuickCheckout,
    },
  ];

  return (
    <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm select-none">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">
            Front Desk Quick Actions
          </h2>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">Frequent Workflows</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              id={action.id}
              onClick={action.onClick}
              className={`p-4 rounded-xl text-left transition-all duration-150 flex flex-col justify-between cursor-pointer group shadow-sm ${action.accent}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${action.badgeColor}`}>
                  {action.badge}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-indigo-300" />
                  <h3 className="font-semibold text-sm text-white">{action.title}</h3>
                </div>
                <p className="text-xs text-slate-300/90 leading-relaxed">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
