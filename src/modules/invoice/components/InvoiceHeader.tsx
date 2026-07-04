/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, StudioSettings } from "../../../types";
import { InvoiceDocType } from "../utils/invoiceHelpers";

interface InvoiceHeaderProps {
  booking: Booking;
  studioSettings: StudioSettings;
  docType: InvoiceDocType;
}

export default function InvoiceHeader({ booking, studioSettings, docType }: InvoiceHeaderProps) {
  // Determine appropriate title and number
  let docTitle = "Invoice";
  let docNumber = booking.invoice.invoiceNumber;

  if (docType === "quotation") {
    docTitle = "Quotation";
    docNumber = booking.invoice.invoiceNumber.replace("INV-", "QT-");
  } else if (docType === "receipt") {
    docTitle = "Official Receipt";
    docNumber = `REC-${booking.invoice.invoiceNumber.replace("INV-", "")}`;
  } else if (docType === "confirmation") {
    docTitle = "Booking Confirmation";
    docNumber = booking.invoice.invoiceNumber.replace("INV-", "CONF-");
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="space-y-1">
        {/* Elegant Serif Brand Title */}
        <h2 className="text-4xl italic font-light tracking-tight text-slate-900 font-serif">
          {studioSettings.studioName}
        </h2>
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">
          {docType === "receipt" ? "Official Payment Receipt" : "Capturing Timeless Moments"}
        </p>
      </div>
      <div className="text-left sm:text-right space-y-1 text-xs text-slate-500">
        <p className="font-semibold text-slate-900 tracking-widest uppercase text-[10px] mb-1">
          {docTitle}
        </p>
        <p className="font-mono text-xs text-slate-400">{docNumber}</p>
      </div>
    </div>
  );
}
