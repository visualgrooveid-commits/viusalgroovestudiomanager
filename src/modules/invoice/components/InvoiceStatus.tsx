/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking } from "../../../types";
import { calculateInvoiceTotals } from "../utils/invoiceHelpers";

interface InvoiceStatusProps {
  booking: Booking;
}

export type InvoiceStatusType = "PAID" | "PARTIALLY PAID" | "UNPAID" | "OVERDUE";

export default function InvoiceStatus({ booking }: InvoiceStatusProps) {
  const { isPaid, isDPPaid } = calculateInvoiceTotals(booking);

  // Determine status
  let status: InvoiceStatusType = "UNPAID";
  if (isPaid) {
    status = "PAID";
  } else if (isDPPaid) {
    status = "PARTIALLY PAID";
  } else {
    // If overdue (dueDate has passed and not paid)
    const dueDate = new Date(booking.invoice.dueDate);
    const today = new Date();
    if (dueDate < today) {
      status = "OVERDUE";
    }
  }

  // Soft premium styling colors
  let bgClass = "bg-amber-50 text-amber-800 border-amber-200";
  let dotClass = "bg-amber-500";

  if (status === "PAID") {
    bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
    dotClass = "bg-emerald-500";
  } else if (status === "PARTIALLY PAID") {
    bgClass = "bg-blue-50 text-blue-800 border-blue-200";
    dotClass = "bg-blue-500";
  } else if (status === "OVERDUE") {
    bgClass = "bg-rose-50 text-rose-800 border-rose-200";
    dotClass = "bg-rose-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{status === "PARTIALLY PAID" ? "DP Paid" : status}</span>
    </span>
  );
}
