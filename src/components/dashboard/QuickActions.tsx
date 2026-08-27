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
      description: 'KYC & room key assignment',
      icon: UserPlus,
      primary: true,
      onClick: onNewCheckIn,
    },
    {
      id: 'quick-charge',
      title: 'Add Charge',
      description: 'Dining, laundry, or room service',
      icon: PlusCircle,
      primary: false,
      onClick: onOpenQuickCharge,
    },
    {
      id: 'quick-payment',
      title: 'Record Payment',
      description: 'UPI QR, cards, or cash',
      icon: CreditCard,
      primary: false,
      onClick: onOpenQuickPayment,
    },
    {
      id: 'quick-checkout',
      title: 'Express Checkout',
      description: 'Settle folio & GST invoice',
      icon: LogOut,
      primary: false,
      onClick: onOpenQuickCheckout,
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs select-none">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
          Quick Operations
        </h2>
        <span className="text-[11px] text-zinc-400">Common desk actions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              id={action.id}
              onClick={action.onClick}
              className={`p-3 rounded-lg text-left transition-colors cursor-pointer group border flex flex-col justify-between ${
                action.primary
                  ? 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-50/50 hover:bg-zinc-100/70 border-zinc-200 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${action.primary ? 'text-zinc-300' : 'text-zinc-600'}`} />
                <ArrowUpRight className={`w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ${action.primary ? 'text-white' : 'text-zinc-700'}`} />
              </div>
              <div>
                <div className={`font-medium text-xs ${action.primary ? 'text-white' : 'text-zinc-900'}`}>{action.title}</div>
                <p className={`text-[11px] mt-0.5 ${action.primary ? 'text-zinc-300' : 'text-zinc-500'}`}>{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

