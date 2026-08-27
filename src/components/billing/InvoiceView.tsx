import React from 'react';
import { Invoice } from '../../types/hotel';
import { Printer, X, Building2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/40 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white select-none">
      <div className="bg-white max-w-3xl w-full rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-zinc-100 print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-zinc-900">
              Tax Invoice #{invoice.invoiceNumber}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
              Paid in Full
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-8 overflow-y-auto space-y-6 text-zinc-900 bg-white text-xs">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 font-semibold flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h1 className="text-base font-semibold text-zinc-900">
                  {invoice.hotelSnapshot.name}
                </h1>
              </div>
              <p className="text-zinc-500 mt-1 text-xs leading-relaxed">
                {invoice.hotelSnapshot.address}, {invoice.hotelSnapshot.city}
                <br />
                Phone: {invoice.hotelSnapshot.phone} • Email: {invoice.hotelSnapshot.email}
              </p>
              <div className="mt-1 text-xs text-zinc-700">
                <span className="font-medium text-zinc-900">GSTIN:</span> {invoice.hotelSnapshot.gstin}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium text-[11px]">
                Tax Invoice
              </div>
              <div className="text-sm font-semibold mt-1 text-zinc-900 font-mono-numbers">
                #{invoice.invoiceNumber}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Issued: {formatDateTime(invoice.issuedAt)}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono-numbers">
                Stay #{invoice.stayId}
              </div>
            </div>
          </div>

          {/* Guest & Stay Details Cards */}
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            {/* Bill To */}
            <div>
              <span className="text-[11px] font-medium text-zinc-400 block mb-1">
                Billed To
              </span>
              <div className="font-semibold text-xs text-zinc-900">{invoice.guestSnapshot.fullName}</div>
              <div className="text-xs text-zinc-600 mt-0.5 space-y-0.5">
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
              <span className="text-[11px] font-medium text-zinc-400 block mb-1">
                Stay Details
              </span>
              <div className="text-xs text-zinc-600 space-y-0.5">
                <div>
                  <span className="text-zinc-500">Room:</span>{' '}
                  <span className="font-semibold text-zinc-900">
                    #{invoice.stayDetails.roomNumber} ({invoice.stayDetails.roomType})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Duration:</span>{' '}
                  <span className="font-medium text-zinc-900 font-mono-numbers">{invoice.stayDetails.nightsCount} Nights</span> (
                  {invoice.stayDetails.checkInDate.slice(0, 10)} to {invoice.stayDetails.checkOutDate.slice(0, 10)})
                </div>
                <div>
                  <span className="text-zinc-500">Occupancy:</span>{' '}
                  <span>{invoice.stayDetails.adultsCount} Adults</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                <tr>
                  <th className="py-2 px-3 font-medium">Item & Description</th>
                  <th className="py-2 px-3 font-medium text-center">Qty</th>
                  <th className="py-2 px-3 font-medium text-right">Price</th>
                  <th className="py-2 px-3 font-medium text-right">Taxable</th>
                  <th className="py-2 px-3 font-medium text-right">GST</th>
                  <th className="py-2 px-3 font-medium text-right">GST Amt</th>
                  <th className="py-2 px-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="py-2 px-3 font-medium text-zinc-900">
                      {item.description}
                      <span className="text-[10px] text-zinc-400 ml-1.5 font-normal">({item.category})</span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono-numbers text-zinc-600">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-numbers text-zinc-600">
                      {formatCurrency(item.unitPrice, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-numbers text-zinc-600">
                      {formatCurrency(item.taxableAmount, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-numbers text-zinc-500">
                      {item.taxRate}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono-numbers text-zinc-500">
                      {formatCurrency(item.taxAmount, invoice.financialSummary.currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-numbers font-semibold text-zinc-900">
                      {formatCurrency(item.total, invoice.financialSummary.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Tax Breakup */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-2 max-w-sm w-full">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-700 space-y-1">
                <span className="font-semibold text-zinc-900 block text-xs">Settlements</span>
                <div className="space-y-1 pt-0.5 font-mono-numbers text-xs">
                  {invoice.settlements.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="uppercase text-zinc-500">{s.method} ({s.referenceNumber || 'Direct'}):</span>
                      <span className="text-emerald-700 font-medium">{formatCurrency(s.amount, invoice.financialSummary.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full sm:max-w-xs bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal:</span>
                <span className="text-zinc-900">{formatCurrency(invoice.financialSummary.subtotal, invoice.financialSummary.currency)}</span>
              </div>
              {invoice.financialSummary.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.financialSummary.discountTotal, invoice.financialSummary.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Total GST:</span>
                <span className="text-zinc-900">+{formatCurrency(invoice.financialSummary.totalTax, invoice.financialSummary.currency)}</span>
              </div>
              <div className="pt-1.5 border-t border-zinc-200 flex justify-between font-semibold text-zinc-900 text-xs">
                <span>Grand Total:</span>
                <span>
                  {formatCurrency(invoice.financialSummary.grandTotal, invoice.financialSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 pt-0.5">
                <span>Paid:</span>
                <span>{formatCurrency(invoice.financialSummary.totalPaid, invoice.financialSummary.currency)}</span>
              </div>
              <div className="flex justify-between font-medium text-zinc-600">
                <span>Balance:</span>
                <span>{formatCurrency(invoice.financialSummary.balanceDue, invoice.financialSummary.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-zinc-100 text-center text-zinc-400 text-[11px]">
            Thank you for staying with {invoice.hotelSnapshot.name}. Computer-generated tax invoice.
          </div>
        </div>
      </div>
    </div>
  );
};

