"use client";

// window.print() opens the browser's print dialog; "Save as PDF" there gives a downloadable receipt.
export function PrintButton() {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
