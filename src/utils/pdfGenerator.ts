import { jsPDF } from "jspdf";

export interface ReceiptData {
  id: string;
  date: string;
  amount: number | string;
  currency: string;
  merchant: string;
  type: string;
  status: string;
  cardNetwork?: string;
  cardLast4?: string;
  sealText?: string;
}

export const generatePdfReceipt = (data: ReceiptData) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Colors
  const primary = "#1e293b"; // slate-800
  const accent = "#4f46e5"; // indigo-600
  const emerald = "#10b981"; // emerald-500
  const lightBg = "#f8fafc"; // slate-50

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, "F");

  // Header Box
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 60, "F");

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("VALOURIAN SOVEREIGN", 105, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL TREASURY DISPATCH", 105, 33, { align: "center" });
  doc.text("GLOBAL NETWORK SETTLEMENT", 105, 38, { align: "center" });

  // Receipt Details Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TRANSACTION RECEIPT", 20, 80);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, 85, 190, 85);

  // Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const startY = 100;
  const lineSpacing = 12;

  // Left column labels
  doc.setTextColor(100, 100, 100);
  doc.text("Transaction ID:", 20, startY);
  doc.text("Date / Time:", 20, startY + lineSpacing);
  doc.text("Merchant:", 20, startY + lineSpacing * 2);
  doc.text("Transaction Type:", 20, startY + lineSpacing * 3);
  if (data.cardNetwork) doc.text("Funding Source:", 20, startY + lineSpacing * 4);
  doc.text("Status:", 20, startY + lineSpacing * 5);

  // Right column values
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(data.id, 70, startY);
  doc.text(data.date, 70, startY + lineSpacing);
  doc.text(data.merchant, 70, startY + lineSpacing * 2);
  doc.text(data.type, 70, startY + lineSpacing * 3);
  if (data.cardNetwork) doc.text(`${data.cardNetwork} ****${data.cardLast4 || '0000'}`, 70, startY + lineSpacing * 4);
  
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(data.status.toUpperCase(), 70, startY + lineSpacing * 5);

  // Amount Box
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(120, startY - 10, 70, 40, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL AMOUNT", 155, startY, { align: "center" });
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const amtStr = typeof data.amount === "number" ? `$${data.amount.toFixed(2)}` : data.amount;
  doc.text(`${amtStr} ${data.currency}`, 155, startY + 12, { align: "center" });

  // Treasury Seal (Visual simulation)
  const sealY = 200;
  doc.setDrawColor(79, 70, 229); // indigo
  doc.setLineWidth(1);
  doc.circle(105, sealY, 20, "S");
  doc.circle(105, sealY, 18, "S");
  
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SOVEREIGN", 105, sealY - 2, { align: "center" });
  doc.text("TREASURY", 105, sealY + 4, { align: "center" });
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(data.sealText || "Certified by Valourian Quantum Network", 105, sealY + 30, { align: "center" });
  doc.text("Cryptographically signed & verified on Torrens Layer 2", 105, sealY + 35, { align: "center" });

  // Footer
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 280, 210, 17, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Valourian Sovereign • Global E-Commerce & Asset Management • Document is electronically generated.", 105, 288, { align: "center" });

  doc.save(`Valourian_Receipt_${data.id}.pdf`);
};