/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, StudioSettings } from "../../../types";
import { InvoiceDocType, calculateInvoiceTotals } from "../utils/invoiceHelpers";

interface InvoiceFooterProps {
  booking: Booking;
  studioSettings: StudioSettings;
  docType: InvoiceDocType;
}

export default function InvoiceFooter({ booking, studioSettings, docType }: InvoiceFooterProps) {
  const { isPaid, dpPercent } = calculateInvoiceTotals(booking);
  const isReceipt = docType === "receipt";
  const isQuotation = docType === "quotation";

  return (
    <div className="border-t border-slate-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-slate-400">
      <div className="space-y-1">
        {isReceipt ? (
          <>
            <p className="font-semibold text-emerald-700 uppercase tracking-wider font-mono text-[8px]">
              Payment Status: Settled
            </p>
            <p>This transaction is fully cleared and verified.</p>
            <p>No further actions or outstanding milestones are required.</p>
          </>
        ) : isQuotation ? (
          <>
            <p className="font-semibold text-slate-700 uppercase tracking-wider font-mono text-[8px]">
              Estimate Guidelines
            </p>
            <p>Pricing estimates are valid for 14 days from date issued.</p>
            <p>Down payment wire of {dpPercent}% is required to lock dates.</p>
          </>
        ) : (
          <>
            {!isPaid && (
              <>
                <p className="font-semibold text-slate-700 uppercase tracking-wider font-mono text-[8px]">
                  Payment Guidelines
                </p>
                <p>To lock booking dates, a {dpPercent}% Down Payment must be wired.</p>
                <p>Remaining balance due post-session before raw asset deliveries.</p>
                
                {/* Wiring accounts details */}
                {(studioSettings.bcaAccount || studioSettings.briAccount || studioSettings.shopeepayAccount) && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500">
                    <p className="font-semibold text-slate-700 uppercase tracking-wider font-mono text-[8px] mb-1">
                      Transfer Destination Accounts:
                    </p>
                    {studioSettings.bcaAccount && (
                      <p>
                        BCA: <span className="font-mono font-semibold text-slate-700">{studioSettings.bcaAccount}</span> (A/N Alwi Muhammad A)
                      </p>
                    )}
                    {studioSettings.briAccount && (
                      <p>
                        BRI: <span className="font-mono font-semibold text-slate-700">{studioSettings.briAccount}</span> (A/N Alwi Muhammad A)
                      </p>
                    )}
                    {studioSettings.shopeepayAccount && (
                      <p>
                        ShopeePay: <span className="font-mono font-semibold text-slate-700">{studioSettings.shopeepayAccount}</span> (A/N Alwi Muhammad A)
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className="text-left md:text-right space-y-2 flex flex-col justify-end">
        <p className="italic text-slate-600 text-xs font-serif">
          Thank you for making us a part of your story.
        </p>
        <p className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
          © {studioSettings.studioName} Studio OS
        </p>
      </div>
    </div>
  );
}
