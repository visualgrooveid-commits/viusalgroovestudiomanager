/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking } from "../../../types";
import { InvoiceDocType, formatRupiah, calculateInvoiceTotals } from "../utils/invoiceHelpers";

interface InvoiceSummaryProps {
  booking: Booking;
  docType: InvoiceDocType;
}

export default function InvoiceSummary({ booking, docType }: InvoiceSummaryProps) {
  const {
    subtotal,
    discount,
    totalDue,
    dpAmount,
    remainingAmount,
    dpPercent,
    remainingPercent,
    isPaid
  } = calculateInvoiceTotals(booking);

  const isReceipt = docType === "receipt";
  
  // Tax architecture support (configurable / ready for multi-language or PPN settings)
  // For now, we will display it as 0% or tax-exempt but keeping it beautifully styled.
  const taxRate = 0; // percentage
  const taxAmount = (totalDue * taxRate) / 100;
  const grandTotal = totalDue + taxAmount;

  return (
    <div className="flex justify-end pt-4">
      <div className="w-full md:w-96 text-xs">
        {/* Premium bordered summary card inspired by Stripe */}
        <div className="border border-slate-200 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Rincian Pembayaran (Payment Details)
            </h4>
          </div>
          
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900">{formatRupiah(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Diskon (Discount)</span>
                <span className="font-mono font-medium">-{formatRupiah(discount)}</span>
              </div>
            )}
            
            {/* Tax field support for future expansion, keeping it clean */}
            <div className="flex justify-between text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span>Pajak (Tax / PPN)</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 rounded-md font-semibold text-slate-500">0%</span>
              </div>
              <span className="font-mono text-slate-500">{formatRupiah(0)}</span>
            </div>

            <div className="h-px bg-slate-100 my-1" />

            {!isReceipt ? (
              <div className="space-y-2.5">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Milestone 1: Down Payment ({dpPercent}%)</span>
                  <span className="font-mono text-slate-700">{formatRupiah(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Milestone 2: Sisa Pelunasan ({remainingPercent}%)</span>
                  <span className="font-mono text-slate-700 font-semibold">{formatRupiah(remainingAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Milestone 1 Terbayar (DP)</span>
                  <span className="font-mono text-slate-700">{formatRupiah(dpAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Milestone 2 Terbayar (Final)</span>
                  <span className="font-mono text-slate-700">{formatRupiah(remainingAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 text-[11px] bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <span>Sisa Tagihan (Remaining Balance)</span>
                  <span className="font-mono font-bold">LUNAS / IDR 0</span>
                </div>
              </div>
            )}
          </div>

          {/* Grand Total - Visually Dominant Footer */}
          <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {isReceipt ? "Total Kontrak" : "Grand Total"}
            </span>
            <div className="text-right">
              <span className="text-lg font-mono font-black tracking-tight">
                {formatRupiah(grandTotal)}
              </span>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">
                Rupiah (IDR) Net
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
