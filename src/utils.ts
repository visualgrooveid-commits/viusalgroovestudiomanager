/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, BookingStatus } from "./types";

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
 * Capitalizes first letter
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple date formatter
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Get status color badge mapping
 */
export function getStatusStyles(status: BookingStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "Inquiry":
      return {
        bg: "bg-amber-50/70",
        text: "text-amber-800",
        border: "border-amber-200/50",
        dot: "bg-amber-500"
      };
    case "Booked":
      return {
        bg: "bg-blue-50/70",
        text: "text-blue-800",
        border: "border-blue-200/50",
        dot: "bg-blue-500"
      };
    case "DP Paid":
      return {
        bg: "bg-emerald-50/70",
        text: "text-emerald-800",
        border: "border-emerald-200/50",
        dot: "bg-emerald-500"
      };
    case "Shoot Done":
      return {
        bg: "bg-sky-50/70",
        text: "text-sky-800",
        border: "border-sky-200/50",
        dot: "bg-sky-500"
      };
    case "Editing":
      return {
        bg: "bg-purple-50/70",
        text: "text-purple-800",
        border: "border-purple-200/50",
        dot: "bg-purple-500"
      };
    case "Ready to Deliver":
      return {
        bg: "bg-indigo-50/70",
        text: "text-indigo-800",
        border: "border-indigo-200/50",
        dot: "bg-indigo-500"
      };
    case "Completed":
      return {
        bg: "bg-neutral-100",
        text: "text-neutral-800",
        border: "border-neutral-300",
        dot: "bg-neutral-500"
      };
    case "Cancelled":
      return {
        bg: "bg-rose-50/70",
        text: "text-rose-800",
        border: "border-rose-200/50",
        dot: "bg-rose-500"
      };
    default:
      return {
        bg: "bg-neutral-50",
        text: "text-neutral-600",
        border: "border-neutral-200",
        dot: "bg-neutral-400"
      };
  }
}

/**
 * Generate PDF Invoice filename
 */
export function getInvoiceFilename(booking: Booking): string {
  const cleanClient = booking.clientName.replace(/[^a-zA-Z0-9]/g, "");
  const cleanDate = booking.eventDate.replace(/-/g, "");
  return `VG-Invoice-${cleanDate}-${cleanClient}.pdf`;
}

/**
 * Generate custom WhatsApp message for invoicing
 */
export function getWhatsAppMessage(booking: Booking, studioName: string): string {
  const finalPrice = booking.price - booking.discount;
  const greeting = `Dear ${booking.clientName},\n\nThis is ${studioName}. We are delighted to share the invoice for your upcoming *${booking.eventType}* session:\n\n*Invoice No:* ${booking.invoice.invoiceNumber}\n*Event Date:* ${formatDate(booking.eventDate)}\n*Total:* ${formatRupiah(finalPrice)}\n*Down Payment Due:* ${formatRupiah(booking.payments.dpAmount)}\n\nPlease view your dashboard or invoice via our portal to complete the booking. Thank you for booking with us!\n\nBest regards,\n${studioName}`;
  return `https://wa.me/${booking.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(greeting)}`;
}

/**
 * Returns Month and Year key for grouping (e.g., "Juli 2026")
 */
export function getMonthYearKey(dateString: string): string {
  if (!dateString) return "Tanpa Tanggal";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Tanggal Tidak Valid";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long"
    });
  } catch (e) {
    return "Tanpa Tanggal";
  }
}
