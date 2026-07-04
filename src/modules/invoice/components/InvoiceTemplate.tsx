/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking, StudioSettings } from "../../../types";
import { InvoiceDocType, calculateInvoiceTotals } from "../utils/invoiceHelpers";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceClient from "./InvoiceClient";
import InvoiceEvent from "./InvoiceEvent";
import InvoiceItems from "./InvoiceItems";
import InvoiceSummary from "./InvoiceSummary";
import InvoicePaymentSchedule from "./InvoicePaymentSchedule";
import InvoicePaymentInfo from "./InvoicePaymentInfo";
import InvoiceFooter from "./InvoiceFooter";

interface InvoiceTemplateProps {
  booking: Booking;
  studioSettings: StudioSettings;
  docType: InvoiceDocType;
  id?: string;
}

export default function InvoiceTemplate({
  booking,
  studioSettings,
  docType,
  id = "invoice-print-area"
}: InvoiceTemplateProps) {
  const { isPaid, isDPPaid } = calculateInvoiceTotals(booking);

  // Set top border style color based on status/type
  let topLineColor = "bg-black"; // default
  if (docType === "receipt" || isPaid) {
    topLineColor = "bg-emerald-600";
  } else if (isDPPaid) {
    topLineColor = "bg-blue-600";
  }

  // Watermark text and classes with extreme low opacity (0.03–0.05) to protect readability
  let watermarkText = "";
  let watermarkColorClass = "";

  if (docType === "quotation") {
    watermarkText = "ESTIMATE";
    watermarkColorClass = "border-amber-600/30 text-amber-600/30";
  } else if (docType === "receipt") {
    watermarkText = "LUNAS";
    watermarkColorClass = "border-emerald-600/30 text-emerald-600/30";
  } else if (isPaid) {
    watermarkText = "PAID";
    watermarkColorClass = "border-emerald-600/30 text-emerald-600/30";
  } else if (isDPPaid) {
    watermarkText = "DP PAID";
    watermarkColorClass = "border-blue-600/30 text-blue-600/30";
  } else {
    watermarkText = "UNPAID";
    watermarkColorClass = "border-amber-600/30 text-amber-600/30";
  }

  return (
    <div
      id={id}
      className="invoice-document bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative flex flex-col space-y-8 overflow-hidden h-auto text-slate-800"
    >
      {/* Decorative Brand Accent top line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${topLineColor}`} />

      {/* Rotating status watermark - Subtle opacity (0.03) to ensure text readability */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] md:opacity-[0.04] border-8 font-sans font-black text-6xl md:text-8xl tracking-widest uppercase rotate-[20deg] px-12 py-4 rounded-3xl ${watermarkColorClass}`}
      >
        {watermarkText}
      </div>

      <div className="space-y-8">
        {/* Branding header section */}
        <InvoiceHeader booking={booking} studioSettings={studioSettings} docType={docType} />

        {/* Invoice Metadata Row (Invoice Number, Dates, Status) */}
        <InvoiceClient booking={booking} docType={docType} />

        {/* Client & Event detailed breakdown */}
        <InvoiceEvent booking={booking} />

        {/* Itemised table section */}
        <InvoiceItems booking={booking} docType={docType} />

        {/* Totals & calculations split section */}
        <InvoiceSummary booking={booking} docType={docType} />

        {/* Premium Payment Schedule Milestones */}
        <InvoicePaymentSchedule booking={booking} />

        {/* Dedicated Bank Transfer accounts card */}
        {!isPaid && (
          <InvoicePaymentInfo booking={booking} studioSettings={studioSettings} />
        )}

        {/* Guidelines, copyright, contact details */}
        <InvoiceFooter booking={booking} studioSettings={studioSettings} docType={docType} />
      </div>
    </div>
  );
}
