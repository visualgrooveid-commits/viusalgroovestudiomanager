/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface PrintOptions {
  elementId: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Prints a specific HTML element cleanly without sidebar, header, or dashboard clutter.
 * Uses a sandboxed, hidden iframe to avoid popup blockers and ensure flawless media styling.
 */
export async function printInvoiceElement({
  elementId,
  onStart,
  onSuccess,
  onError
}: PrintOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    const err = new Error(`Element dengan ID "${elementId}" tidak ditemukan.`);
    if (onError) onError(err);
    return false;
  }

  if (onStart) onStart();

  try {
    // 1. Create a temporary, invisible iframe
    const iframe = document.createElement("iframe");
    iframe.id = "invoice-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Gagal menginisialisasi dokumen cetak (Iframe context unavailable).");
    }

    // 2. Extract parent stylesheets (Tailwind, Fonts, global CSS)
    let stylesHTML = "";
    
    // Copy all style tags
    const styleElements = document.getElementsByTagName("style");
    for (let i = 0; i < styleElements.length; i++) {
      stylesHTML += styleElements[i].outerHTML;
    }

    // Copy all link tags (external CSS stylesheets)
    const linkElements = document.querySelectorAll("link[rel='stylesheet']");
    linkElements.forEach((link) => {
      stylesHTML += link.outerHTML;
    });

    // 3. Define the critical print styles directly to ensure compatibility
    const criticalPrintStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 15mm;
        }

        body {
          background-color: #ffffff !important;
          color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Watermark formatting */
        .watermark-wrapper {
          position: relative;
        }

        .print-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(20deg);
          pointer-events: none;
          user-select: none;
          opacity: 0.05 !important;
          border: 8px solid currentColor;
          font-size: 6rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 1rem 3rem;
          border-radius: 1.5rem;
          color: #000000 !important;
        }

        /* Specific colour overrides to keep text fully legible on print */
        .text-slate-400, .text-neutral-400 {
          color: #52525b !important;
        }
        .text-slate-500, .text-neutral-500 {
          color: #3f3f46 !important;
        }
        .text-slate-900, .text-neutral-900 {
          color: #000000 !important;
          font-weight: 600 !important;
        }
        .border-slate-900 {
          border-color: #000000 !important;
        }
        .opacity-10 {
          opacity: 0.25 !important;
        }
        .divide-slate-100 > * + * {
          border-color: #e4e4e7 !important;
        }
        .border-slate-100 {
          border-color: #e4e4e7 !important;
        }
        .bg-neutral-50, .bg-slate-50 {
          background-color: #f4f4f5 !important;
        }

        /* Hide anything with no-print */
        .no-print {
          display: none !important;
        }

        /* Ensure grid and flex layout function inside printing frame */
        .flex { display: flex !important; }
        .flex-col { flex-direction: column !important; }
        .justify-between { justify-content: space-between !important; }
        .items-start { align-items: flex-start !important; }
        .items-center { align-items: center !important; }
        .grid { display: grid !important; }
        .grid-cols-2 { grid-template-cols: repeat(2, minmax(0, 1fr)) !important; }
        .grid-cols-4 { grid-template-cols: repeat(4, minmax(0, 1fr)) !important; }
        .text-right { text-align: right !important; }
        .w-full { width: 100% !important; }
        
        @media print {
          body {
            width: 100%;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      </style>
    `;

    // 4. Construct complete isolated HTML page for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          ${stylesHTML}
          ${criticalPrintStyles}
        </head>
        <body>
          <div class="print-wrapper-target py-4 px-6 watermark-wrapper">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `;

    // 5. Write content and close streams
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // 6. Give resources (images, fonts) a brief window to load fully
    await new Promise<void>((resolve) => {
      const checkReadyState = () => {
        if (iframeDoc.readyState === "complete") {
          resolve();
        } else {
          setTimeout(checkReadyState, 50);
        }
      };
      checkReadyState();
    });

    // Wait an additional 250ms for fonts to actually bind and render
    await new Promise((resolve) => setTimeout(resolve, 250));

    // 7. Focus and print the iframe
    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
      if (onSuccess) onSuccess();
    } else {
      throw new Error("Gagal memanggil dialog printer (Iframe window unavailable).");
    }

    // 8. Clean up and remove elements from DOM
    setTimeout(() => {
      const frame = document.getElementById("invoice-print-iframe");
      if (frame && frame.parentNode) {
        frame.parentNode.removeChild(frame);
      }
    }, 1500);

    return true;
  } catch (err: any) {
    console.error("Print utility error:", err);
    
    // Clean up if error occurs
    const frame = document.getElementById("invoice-print-iframe");
    if (frame && frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }

    if (onError) onError(err instanceof Error ? err : new Error(String(err)));
    return false;
  }
}
