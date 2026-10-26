import { jsPDF } from "jspdf";
import autoTable, { applyPlugin } from "jspdf-autotable";

// Ensure jsPDF prototype has autoTable registered
try {
  if (typeof (jsPDF as any)?.prototype?.autoTable !== "function") {
    applyPlugin(jsPDF);
  }
} catch (e) {
  console.warn("Notice applying autoTable plugin to jsPDF prototype:", e);
}

export function renderAutoTable(doc: jsPDF, options: any) {
  try {
    // 1. Ensure plugin is applied
    if (typeof (doc as any).autoTable !== "function") {
      try {
        applyPlugin(jsPDF);
      } catch {}
    }

    // 2. Try doc.autoTable if available
    if (typeof (doc as any).autoTable === "function") {
      (doc as any).autoTable(options);
      return;
    }

    // 3. Try autoTable function directly
    if (typeof autoTable === "function") {
      try {
        autoTable(doc, options);
        return;
      } catch (err) {
        console.warn("Direct autoTable call failed, attempting fallback:", err);
      }
    }
  } catch (err) {
    console.warn("renderAutoTable standard method failed, falling back to clean canvas drawing:", err);
  }

  // 4. Clean vector-based visual table fallback so PDF generation never fails
  try {
    const startY = options.startY || 60;
    let currentY = startY;
    const head = options.head || [];
    const body = options.body || [];

    // Draw header
    if (head.length > 0) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(14, currentY, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      const cols = head[0] || [];
      const colWidth = 182 / (cols.length || 1);
      cols.forEach((colText: string, i: number) => {
        doc.text(String(colText), 16 + i * colWidth, currentY + 5.5);
      });
      currentY += 8;
    }

    // Draw rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    body.forEach((row: any[], rowIndex: number) => {
      const isEven = rowIndex % 2 === 0;
      doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
      doc.rect(14, currentY, 182, 7, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, currentY, 182, 7, "S");
      
      doc.setTextColor(30, 41, 59);
      const colWidth = 182 / (row.length || 1);
      row.forEach((cellText: any, i: number) => {
        const text = String(cellText ?? "");
        const truncated = text.length > 40 ? text.slice(0, 37) + "..." : text;
        doc.text(truncated, 16 + i * colWidth, currentY + 5);
      });
      currentY += 7;
    });

    (doc as any).lastAutoTable = { finalY: currentY };
  } catch (renderError) {
    console.error("Critical fallback PDF table drawing error:", renderError);
  }
}

export default renderAutoTable;
