import React from 'react';
import { Invoice } from '../../types/hotel';
import { Printer, X, Download, Building2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { formatDateTime } from '../../utils/date';

interface InvoiceViewProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, isOpen, onClose }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white select-none">
      <div className="bg-slate-900 max-w-3xl w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-850 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white">
              Tax Invoice #{invoice.invoiceNumber}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-medium bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
              Paid in Full
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-8 overflow-y-auto space-y-6 text-white bg-slate-900 text-xs">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-700 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-sm flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h1 className="text-lg font-bold text-white">
                  {invoice.hotelSnapshot.name}
                </h1>
              </div>
              <p className="text-slate-400 mt-1 text-xs leading-relaxed">
                {invoice.hotelSnapshot.address}, {invoice.hotelSnapshot.city}
                <br />
                Phone: {invoice.hotelSnapshot.phone} • Email: {invoice.hotelSnapshot.email}
              </p>
              <div className="mt-2 text-xs text-slate-300">
                <span className="font-semibold text-white">GSTIN:</span> {invoice.hotelSnapshot.gstin}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold text-[11px]">
                Official Tax Invoice
              </div>
              <div className="text-base font-bold mt-2 text-white font-mono-numbers">
                #{invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Issued: {formatDateTime(invoice.issuedAt)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono-numbers">
                Stay ID: {invoice.stayId}
              </div>
            </div>
          </div>

          {/* Guest & Stay Details Cards */}
          <div className="grid grid-cols-2 gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            {/* Bill To */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Guest Details)
              </span>
              <div className="font-bold text-sm text-white">{invoice.guestSnapshot.fullName}</div>
              <div className="text-xs text-slate-300 mt-0.5 space-y-0.5">
                <div>Phone: {invoice.guestSnapshot.phone}</div>
                {invoice.guestSnapshot.email && <div>Email: {invoice.guestSnapshot.email}</div>}
                {invoice.guestSnapshot.address && (
                  <div>
                    Address: {invoice.guestSnapshot.address}
                    {invoice.guestSnapshot.city ? `, ${invoice.guestSnapshot.city}` : ''}
                  </div>
                )}
                <div>
                  ID: {invoice.guestSnapshot.idType.toUpperCase()} ({invoice.guestSnapshot.idNumber})
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Stay Details
              </span>
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-400">Room Allocated:</span>{' '}
                  <span className="font-semibold text-white">
                    #{invoice.stayDetails.roomNumber} ({invoice.stayDetails.roomType})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>{' '}
                  <span className="font-medium text-white font-mono-numbers">{invoice.stayDetails.nightsCount} Nights</span> (
                  {invoice.stayDetails.checkInDate.slice(0, 10)} to {invoice.stayDetails.checkOutDate.slice(0, 10)})
                </div>
                <div>
                  <span className="text-slate-400">Guests:</span>{' '}
                  <span>{invoice.stayDetails.adultsCount} Adults</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Item & Description</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Taxable</th>
                  <th className="py-2.5 px-3 font-semibold text-right">GST %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">GST Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-850">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/60">
                    <td className="py-2.5 px-3 font-medium text-white">
                      {item.description}
                      <span className="text-[10px] text-slate-400 ml-2">({item.category})</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-300">
                      {formatCurrency(item.unitPrice, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-300">
                      {formatCurrency(item.taxableAmount, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-400">
                      {item.taxRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-400">
                      {formatCurrency(item.taxAmount, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold text-white">
                      {formatCurrency(item.total, invoice.financialSummary.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Tax Breakup */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-2 max-w-sm">
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-300 space-y-1">
                <span className="font-semibold text-white block text-xs">Payment Information</span>
                <p className="text-[11px] text-slate-400">
                  Total of {invoice.settlements.length} settlement transactions recorded.
                </p>
                <div className="space-y-1 pt-1 font-mono-numbers text-xs">
                  {invoice.settlements.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="uppercase text-slate-400">{s.method} ({s.referenceNumber || 'Direct'}):</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(s.amount, invoice.financialSummary.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full sm:max-w-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 font-mono-numbers text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white">{formatCurrency(invoice.financialSummary.subtotal, invoice.financialSummary.currency)}</span>
              </div>
              {invoice.financialSummary.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(invoice.financialSummary.discountTotal, invoice.financialSummary.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Total GST / Tax:</span>
                <span className="text-white">+{formatCurrency(invoice.financialSummary.totalTax, invoice.financialSummary.currency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white text-sm">
                <span>Grand Total:</span>
                <span className="text-indigo-400">
                  {formatCurrency(invoice.financialSummary.grandTotal, invoice.financialSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 pt-1">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.financialSummary.totalPaid, invoice.financialSummary.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.financialSummary.balanceDue, invoice.financialSummary.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
            Thank you for staying with {invoice.hotelSnapshot.name}. This is a computer-generated tax invoice.
          </div>
        </div>
      </div>
    </div>
  );
};
