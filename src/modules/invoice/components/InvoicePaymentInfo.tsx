/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking, StudioSettings } from "../../../types";
import { CreditCard, Landmark, Calendar, CheckSquare, Info } from "lucide-react";
import { formatDate } from "../utils/invoiceHelpers";

interface InvoicePaymentInfoProps {
  booking: Booking;
  studioSettings: StudioSettings;
}

export default function InvoicePaymentInfo({ booking, studioSettings }: InvoicePaymentInfoProps) {
  const hasAccounts = studioSettings.bcaAccount || studioSettings.briAccount || studioSettings.shopeepayAccount;

  if (!hasAccounts) return null;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
      {/* Header */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center space-x-2">
        <Landmark className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Informasi Pembayaran (Payment Information)
        </h3>
      </div>

      {/* Accounts List & Details Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destination Accounts */}
        <div className="space-y-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Rekening Tujuan Transfer (Destination Accounts)
          </p>
          <div className="space-y-3">
            {studioSettings.bcaAccount && (
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Landmark className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Bank BCA</p>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5 select-all">
                    {studioSettings.bcaAccount}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">A/N Alwi Muhammad A</p>
                </div>
              </div>
            )}

            {studioSettings.briAccount && (
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Landmark className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Bank BRI</p>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5 select-all">
                    {studioSettings.briAccount}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">A/N Alwi Muhammad A</p>
                </div>
              </div>
            )}

            {studioSettings.shopeepayAccount && (
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CreditCard className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600">ShopeePay / e-Wallet</p>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5 select-all">
                    {studioSettings.shopeepayAccount}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">A/N Alwi Muhammad A</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Guidelines & References */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Referensi Transfer (Transfer Metadata)
            </p>
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400 text-[11px]">Berita Acara / Memo</span>
                <span className="font-mono font-bold text-slate-900 select-all">{booking.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400 text-[11px]">Batas Waktu Pelunasan</span>
                <span className="font-semibold text-slate-800">{formatDate(booking.invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 text-[11px]">Status Booking</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider text-[9px] border border-emerald-100">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-800 space-y-1">
              <p className="font-bold uppercase tracking-wider">Catatan Penting (Notes):</p>
              <p className="leading-relaxed text-slate-600">
                Mohon cantumkan nomor invoice <span className="font-mono font-bold text-slate-900">{booking.invoice.invoiceNumber}</span> di berita transfer untuk verifikasi otomatis yang cepat. Simpan bukti transfer dan konfirmasi melalui WhatsApp setelah pembayaran berhasil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
