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
    <div id="hotel-reports-view" className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-700" />
            Financial & KPI Reports
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Operational yield metrics, department revenues, and invoice registers.
          </p>
        </div>

        <button
          onClick={exportInvoicesCSV}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Invoices CSV</span>
        </button>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Collected Revenue */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Collected Revenue</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-semibold font-mono-numbers text-zinc-900">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono-numbers">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            <span>All folios paid</span>
          </div>
        </div>

        {/* Real-Time Occupancy Rate */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Current Occupancy</span>
            <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-semibold font-mono-numbers text-zinc-900">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-400 font-mono-numbers">
            {occupiedRoomsCount} of {rooms.length} rooms occupied
          </div>
        </div>

        {/* ADR (Average Daily Rate) */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Average Daily Rate</span>
            <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-semibold font-mono-numbers text-zinc-900">
            {formatCurrency(adr, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-zinc-400">
            Avg tariff per occupied room
          </div>
        </div>

        {/* RevPAR */}
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">RevPAR</span>
            <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-semibold font-mono-numbers text-zinc-900">
            {formatCurrency(revPar, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-zinc-400">
            Revenue per available room
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Sections: Categories & Payment Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Revenue Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            Revenue by Service Department
          </h3>

          <div className="space-y-2.5">
            {Object.entries(categoryTotals).length === 0 ? (
              <div className="p-4 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                No departmental charges posted yet.
              </div>
            ) : (
              Object.entries(categoryTotals).map(([catKey, amount]) => {
                const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={catKey} className="space-y-1 font-mono-numbers">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-700 capitalize">
                        {catKey.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(amount, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-zinc-800 h-full rounded-full transition-all duration-500"
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
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
            Collections by Settlement Channel
          </h3>

          <div className="space-y-2.5">
            {Object.entries(paymentMethodTotals).map(([method, amount]) => {
              const totalPayments = Object.values(paymentMethodTotals).reduce((a, b) => a + b, 0);
              const percentage = totalPayments > 0 ? (amount / totalPayments) * 100 : 0;

              return (
                <div key={method} className="space-y-1 font-mono-numbers">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-700 uppercase">
                      {method.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {formatCurrency(amount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
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
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden text-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900">Tax & Invoicing Register</h3>
            <p className="text-zinc-500 mt-0.5 font-mono-numbers">
              {invoices.length} invoices generated • Total GST: {formatCurrency(totalTaxCollected, settings.currencySymbol)}
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            No tax invoices generated yet. Invoices are produced when guests complete departure checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">Invoice #</th>
                  <th className="py-2.5 px-3.5 font-medium">Date</th>
                  <th className="py-2.5 px-3.5 font-medium">Guest</th>
                  <th className="py-2.5 px-3.5 font-medium">Room</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">Taxable</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">GST</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono-numbers font-medium text-zinc-900">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-500">{formatDate(inv.issuedAt)}</td>
                    <td className="py-2.5 px-3.5 font-medium text-zinc-900">{inv.guestSnapshot.fullName}</td>
                    <td className="py-2.5 px-3.5 font-mono-numbers text-zinc-600">#{inv.stayDetails.roomNumber}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers text-zinc-600">
                      {formatCurrency(inv.financialSummary.subtotal, inv.hotelSnapshot.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers text-zinc-500">
                      {formatCurrency(inv.financialSummary.totalTax, inv.hotelSnapshot.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono-numbers font-semibold text-zinc-900">
                      {formatCurrency(inv.financialSummary.grandTotal, inv.hotelSnapshot.currencySymbol)}
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
