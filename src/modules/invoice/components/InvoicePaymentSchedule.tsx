/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking } from "../../../types";
import { formatRupiah, calculateInvoiceTotals } from "../utils/invoiceHelpers";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface InvoicePaymentScheduleProps {
  booking: Booking;
}

export default function InvoicePaymentSchedule({ booking }: InvoicePaymentScheduleProps) {
  const { totalDue, dpAmount, remainingAmount, dpPercent, remainingPercent, isPaid, isDPPaid } = calculateInvoiceTotals(booking);

  // Parse dates safely
  const formatDateStr = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Milestones schedule data
  const milestones = [
    {
      id: "down-payment",
      name: `Milestone 1: Down Payment (DP) (${dpPercent}%)`,
      percentage: `${dpPercent}%`,
      amount: dpAmount,
      dueDate: formatDateStr(booking.invoice.issuedDate),
      isPaid: isDPPaid || isPaid,
      color: "blue"
    },
    {
      id: "remaining-payment",
      name: `Milestone 2: Pelunasan Sisa (${remainingPercent}%)`,
      percentage: `${remainingPercent}%`,
      amount: remainingAmount,
      dueDate: formatDateStr(booking.invoice.dueDate),
      isPaid: isPaid,
      color: "slate"
    }
  ];

  return (
    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
        Jadwal Pembayaran (Payment Schedule)
      </h3>
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const statusText = milestone.isPaid ? "Terbayar / Settled" : "Belum Bayar / Unpaid";
          const statusColor = milestone.isPaid 
            ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
            : "text-amber-700 bg-amber-50/50 border-amber-200";

          return (
            <div 
              key={milestone.id}
              className={`flex items-center justify-between p-3.5 bg-white border rounded-xl transition-all duration-150 ${
                milestone.isPaid ? "border-emerald-100 shadow-[0_1px_4px_rgba(16,185,129,0.04)]" : "border-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="shrink-0">
                  {milestone.isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{milestone.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Tenggat: <span className="font-semibold text-slate-700">{milestone.dueDate}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-mono font-bold text-slate-900">
                  {formatRupiah(milestone.amount)}
                </p>
                <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
