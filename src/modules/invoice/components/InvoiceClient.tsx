/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking } from "../../../types";
import { InvoiceDocType, formatDate } from "../utils/invoiceHelpers";
import InvoiceStatus from "./InvoiceStatus";

interface InvoiceClientProps {
  booking: Booking;
  docType: InvoiceDocType;
}

export default function InvoiceClient({ booking, docType }: InvoiceClientProps) {
  // Format dates elegantly
  const issuedFormatted = formatDate(booking.invoice.issuedDate);
  const dueFormatted = formatDate(booking.invoice.dueDate);

  // Custom labels and numbers
  let numberLabel = "Invoice Number";
  let numberValue = booking.invoice.invoiceNumber;

  if (docType === "quotation") {
    numberLabel = "Quote Number";
    numberValue = booking.invoice.invoiceNumber.replace("INV-", "QT-");
  } else if (docType === "receipt") {
    numberLabel = "Receipt Number";
    numberValue = `REC-${booking.invoice.invoiceNumber.replace("INV-", "")}`;
  } else if (docType === "confirmation") {
    numberLabel = "Booking ID";
    numberValue = booking.invoice.invoiceNumber.replace("INV-", "CONF-");
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs border-y border-slate-200 py-5 bg-slate-50/30 px-5 rounded-2xl border">
      <div>
        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">{numberLabel}</p>
        <p className="font-bold text-slate-900 mt-1 font-mono text-xs">{numberValue}</p>
      </div>
      <div>
        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
          {docType === "quotation" ? "Date Estimated" : "Tanggal Terbit (Date Issued)"}
        </p>
        <p className="text-slate-700 font-semibold mt-1">{issuedFormatted}</p>
      </div>
      <div>
        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
          {docType === "quotation" ? "Valid Until" : "Tenggat Waktu (Due Date)"}
        </p>
        <p className="text-rose-700 font-semibold mt-1">{dueFormatted}</p>
      </div>
      <div className="text-right flex flex-col justify-between items-end">
        <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">Status Dokumen</p>
        <InvoiceStatus booking={booking} />
      </div>
    </div>
  );
}
