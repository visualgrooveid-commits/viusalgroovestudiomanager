/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Booking } from "../../../types";
import { getInvoiceFilename, InvoiceDocType } from "./invoiceHelpers";

interface DownloadOptions {
  elementId: string;
  booking: Booking;
  docType: InvoiceDocType;
  onStart?: () => void;
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Downloads an HTML elements as a pixel-perfect, crisp, multi-page A4 PDF file.
 */
export async function downloadInvoiceAsPDF({
  elementId,
  booking,
  docType,
  onStart,
  onSuccess,
  onError
}: DownloadOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    const err = new Error(`Element dengan ID "${elementId}" tidak ditemukan di halaman.`);
    if (onError) onError(err);
    return false;
  }

  if (onStart) onStart();

  // Cache original styles to prevent permanent visual glitches
  const originalBoxShadow = element.style.boxShadow;
  const originalBorderRadius = element.style.borderRadius;
  const originalBorder = element.style.border;
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalPadding = element.style.padding;
  const originalHeight = element.style.height;

  try {
    const filename = getInvoiceFilename(booking, docType);

    // Apply strict, stable layout styles to the container specifically for capturing
    element.style.width = "800px";
    element.style.maxWidth = "800px";
    element.style.height = "auto";
    element.style.boxShadow = "none";
    element.style.borderRadius = "0";
    element.style.border = "none";
    element.style.padding = "48px"; // Spacious editorial margins

    // Wait 100ms for browser layout recalculation and font styling adjustments
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 3.0, // Retains supreme typography sharpness
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 800
    });

    // Restore original styles instantly to prevent screen flickering
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    element.style.border = originalBorder;
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.padding = originalPadding;
    element.style.height = originalHeight;

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    
    // Calculate page image dimensions
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Height of one A4 page in terms of canvas pixels
    const pageHeightPx = (canvas.width * pdfHeight) / pdfWidth;

    let heightRemaining = canvas.height;
    let position = 0;

    // Check if the canvas height is longer than one A4 page
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    } else {
      // Elegant multi-page split
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightRemaining -= pageHeightPx;

      while (heightRemaining > 0) {
        position = (heightRemaining - canvas.height) * (pdfWidth / canvas.width); // Recalculate negative print offset
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightRemaining -= pageHeightPx;
      }
    }

    pdf.save(filename);
    if (onSuccess) onSuccess(filename);
    return true;
  } catch (error: any) {
    // Make absolutely sure original styles are restored even if the canvas fails
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    element.style.border = originalBorder;
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.padding = originalPadding;
    element.style.height = originalHeight;

    console.error("PDF generation engine failure:", error);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}
