/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking } from "../../../types";
import { InvoiceDocType, formatRupiah } from "../utils/invoiceHelpers";

interface InvoiceItemsProps {
  booking: Booking;
  docType: InvoiceDocType;
}

export default function InvoiceItems({ booking, docType }: InvoiceItemsProps) {
  const isReceipt = docType === "receipt";

  return (
    <div className="pt-2">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-900 border-opacity-10">
            <th className="py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Description</th>
            <th className="py-3 text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">Duration</th>
            <th className="py-3 text-right text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              {isReceipt ? "Settled Amount" : "Price"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="py-4">
              <p className="font-semibold text-slate-900 text-sm">{booking.packageName}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Primary fine art curations and high-resolution composition.
              </p>
            </td>
            <td className="py-4 text-center text-slate-600 font-mono text-sm">{booking.duration}</td>
            <td className="py-4 text-right font-mono text-slate-900 text-sm">{formatRupiah(booking.price)}</td>
          </tr>
          {booking.additionalServices && booking.additionalServices !== "None" && (
            <tr className="border-b border-slate-50">
              <td className="py-4">
                <p className="font-semibold text-slate-900 text-sm">Additional Services Bundle</p>
                <p className="text-[11px] text-slate-400 mt-1">{booking.additionalServices}</p>
              </td>
              <td className="py-4 text-center text-slate-600 font-mono text-sm">-</td>
              <td className="py-4 text-right font-mono text-slate-900 text-sm">Included</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
