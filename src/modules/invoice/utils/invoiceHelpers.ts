/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking } from "../../../types";

export type InvoiceDocType = "invoice" | "quotation" | "receipt" | "confirmation";

/**
 * Formats a number into Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Simple date formatter (Indonesian/English)
 */
export function formatDate(dateString: string, language: "en" | "id" = "id"): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const locale = language === "en" ? "en-US" : "id-ID";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Generate automatic premium filenames
 * Example: VG-INV-20260704-AlwiMuhammad.pdf, VG-REC-20260704-AlwiMuhammad.pdf
 */
export function getInvoiceFilename(booking: Booking, docType: InvoiceDocType): string {
  const cleanClient = booking.clientName.replace(/[^a-zA-Z0-9]/g, "");
  const cleanDate = booking.eventDate.replace(/-/g, "");
  const prefix = 
    docType === "quotation" ? "QT" :
    docType === "receipt" ? "REC" :
    docType === "confirmation" ? "CONF" : "INV";
  
  return `VG-${prefix}-${cleanDate}-${cleanClient}.pdf`;
}

/**
 * Calculate totals for invoices, down-payments, and balances
 */
export interface InvoiceCalculations {
  subtotal: number;
  discount: number;
  totalDue: number;
  dpAmount: number;
  remainingAmount: number;
  dpPercent: number;
  remainingPercent: number;
  isPaid: boolean;
  isDPPaid: boolean;
}

export function calculateInvoiceTotals(booking: Booking): InvoiceCalculations {
  const subtotal = booking.price;
  const discount = booking.discount || 0;
  const totalDue = Math.max(0, subtotal - discount);

  // Dynamic DP computations
  const dpAmount = typeof booking.payments.dpAmount === "number" ? booking.payments.dpAmount : Math.round(totalDue * 0.4);
  const remainingAmount = Math.max(0, totalDue - dpAmount);
  const dpPercent = totalDue > 0 ? Math.round((dpAmount / totalDue) * 100) : 40;
  const remainingPercent = 100 - dpPercent;

  const isPaid = booking.payments.fullPaid || booking.status === "Completed";
  const isDPPaid = booking.payments.dpPaid || booking.status === "DP Paid" || isPaid;

  return {
    subtotal,
    discount,
    totalDue,
    dpAmount,
    remainingAmount,
    dpPercent,
    remainingPercent,
    isPaid,
    isDPPaid
  };
}
