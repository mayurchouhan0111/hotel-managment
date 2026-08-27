import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  CreditCard,
  PieChart,
  Percent,
  Receipt,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDate } from '../../utils/date';

export const HotelReports: React.FC = () => {
  const { folios, rooms, stays, invoices, settings } = useHotel();

  // Compute key financial metrics
  const totalRevenue = folios.reduce((acc, f) => acc + (f.totalPaid || 0), 0);
  const totalTaxCollected = folios.reduce((acc, f) => acc + (f.totalTax || 0), 0);

  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? (occupiedRoomsCount / rooms.length) * 100 : 0;

  // ADR (Average Daily Rate): Total Room Tariff / Number of occupied rooms
  const activeStays = stays.filter((s) => s.status === 'active');
  const totalDailyRoomRevenue = activeStays.reduce((acc, s) => {
    const room = rooms.find((r) => r.id === s.roomId);
    return acc + (room?.baseRate || 0);
  }, 0);
  const adr = activeStays.length > 0 ? totalDailyRoomRevenue / activeStays.length : 0;
  const revPar = rooms.length > 0 ? totalDailyRoomRevenue / rooms.length : 0;

  // Breakdown by Charge Category
  const categoryTotals: Record<string, number> = {};
  folios.forEach((f) => {
    f.charges.forEach((c) => {
      if (!c.voided) {
        categoryTotals[c.category] = (categoryTotals[c.category] || 0) + c.total;
      }
    });
  });

  // Breakdown by Payment Method
  const paymentMethodTotals: Record<string, number> = {
    upi: 0,
    card: 0,
    cash: 0,
    bank_transfer: 0,
    other: 0,
  };
  folios.forEach((f) => {
    f.payments.forEach((p) => {
      paymentMethodTotals[p.method] = (paymentMethodTotals[p.method] || 0) + p.amount;
    });
  });

  // Export to CSV Function
  const exportInvoicesCSV = () => {
    if (invoices.length === 0) {
      alert('No invoices available to export.');
      return;
    }

    const headers = [
      'Invoice #',
      'Issued Date',
      'Guest Name',
      'Room #',
      'Nights',
      'Subtotal',
      'Tax Amount',
      'Grand Total',
      'Total Paid',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      formatDate(inv.issuedAt),
      `"${inv.guestSnapshot.fullName}"`,
      inv.stayDetails.roomNumber,
      inv.stayDetails.nightsCount,
      inv.financialSummary.subtotal,
      inv.financialSummary.totalTax,
      inv.financialSummary.grandTotal,
      inv.financialSummary.totalPaid,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_invoices_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="hotel-reports-view" className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400">Executive Analytics</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono-numbers">Real-Time Yield Metrics</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Financial Reports & Operational KPI Analytics
          </h2>
        </div>

        <button
          onClick={exportInvoicesCSV}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Invoices to CSV</span>
        </button>
      </div>

      {/* KPI 4-Card Executive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Collected Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-numbers text-white">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-numbers">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Across all closed & active folios</span>
          </div>
        </div>

        {/* Real-Time Occupancy Rate */}
        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Current Occupancy</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-numbers text-white">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono-numbers">
            {occupiedRoomsCount} of {rooms.length} rooms occupied
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Daily Rate (ADR)</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-numbers text-white">
            {formatCurrency(adr, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400">
            Avg realized yield per occupied room
          </div>
        </div>

        {/* RevPAR */}
        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">RevPAR</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono-numbers text-white">
            {formatCurrency(revPar, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400">
            Revenue per available room
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Sections: Categories & Payment Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm space-y-4 text-xs">
          <h3 className="font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Revenue by Service Department
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryTotals).length === 0 ? (
              <div className="p-4 text-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
                No departmental charges posted yet.
              </div>
            ) : (
              Object.entries(categoryTotals).map(([catKey, amount]) => {
                const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={catKey} className="space-y-1.5 font-mono-numbers">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300 capitalize">
                        {catKey.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(amount, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700/70 shadow-sm space-y-4 text-xs">
          <h3 className="font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Collections by Settlement Channel
          </h3>

          <div className="space-y-3">
            {Object.entries(paymentMethodTotals).map(([method, amount]) => {
              const totalPayments = Object.values(paymentMethodTotals).reduce((a, b) => a + b, 0);
              const percentage = totalPayments > 0 ? (amount / totalPayments) * 100 : 0;

              return (
                <div key={method} className="space-y-1.5 font-mono-numbers">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300 uppercase">
                      {method.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(amount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tax & Invoices Summary Register */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/70 shadow-sm overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">GST Tax & Invoicing Register</h3>
            <p className="text-slate-400 mt-0.5 font-mono-numbers">
              {invoices.length} Tax Invoices Generated • Total GST Remitted: {formatCurrency(totalTaxCollected, settings.currencySymbol)}
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border-t border-slate-800">
            No tax invoices generated yet. Invoices are produced when guests complete departure checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Guest</th>
                  <th className="py-3 px-4 font-semibold">Room</th>
                  <th className="py-3 px-4 font-semibold text-right">Taxable</th>
                  <th className="py-3 px-4 font-semibold text-right">GST Total</th>
                  <th className="py-3 px-4 font-semibold text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800 transition-colors">
                    <td className="py-3 px-4 font-mono-numbers font-medium text-white">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inv.issuedAt)}</td>
                    <td className="py-3 px-4 font-medium text-white">{inv.guestSnapshot.fullName}</td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-300">#{inv.stayDetails.roomNumber}</td>
                    <td className="py-3 px-4 text-right font-mono-numbers text-slate-300">
                      {formatCurrency(inv.financialSummary.subtotal, inv.financialSummary.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-numbers text-slate-400">
                      {formatCurrency(inv.financialSummary.totalTax, inv.financialSummary.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-numbers font-bold text-white">
                      {formatCurrency(inv.financialSummary.grandTotal, inv.financialSummary.currency)}
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
