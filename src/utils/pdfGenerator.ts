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

export interface BpayPdfData {
  receiptNumber: string;
  timestamp: string;
  formattedTimestamp?: string;
  amount: number | string;
  currency: string;
  senderName: string;
  sourceAccount: string;
  billerCode: string;
  billerName: string;
  crn: string;
  category?: string;
  schemeLicense?: string;
  debitAuthCode?: string;
  notes?: string;
}

export const generateBpayPdfReceipt = (data: BpayPdfData) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Page background
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, 210, 297, "F");

  // Top CommBank & AP+ Yellow Accent Line
  doc.setFillColor(255, 204, 0); // #ffcc00 CommBank Yellow
  doc.rect(0, 0, 210, 6, "F");

  // Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 6, 210, 56, "F");

  // BPAY Badge
  doc.setFillColor(255, 204, 0);
  doc.roundedRect(20, 16, 28, 12, 2, 2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BPAY®", 34, 24, { align: "center" });

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL BPAY® PAYMENT RECEIPT", 54, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("COMMONWEALTH BANK OF AUSTRALIA • VALOURIAN SOVEREIGN TREASURY", 54, 30);
  doc.text("AUSTRALIAN PAYMENTS PLUS (AP+) REGISTERED SCHEME PARTICIPANT", 54, 35);
  doc.text(`LICENCE: ${data.schemeLicense || "BPAY-AU-LIC-2026-9921 • APRA ADI CLEARED"}`, 54, 40);

  // Status Banner
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 68, 170, 14, 2, 2, "FD");
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("✓ PAYMENT PROCESSED & CLEARED VIA AP+ BPAY® SETTLEMENT STREAM", 105, 77, { align: "center" });

  // Receipt Content Box
  const startY = 92;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, startY, 170, 140, 4, 4, "FD");

  // Amount Highlight Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(25, startY + 5, 160, 28, 3, 3, "F");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL AMOUNT DEBITED (AUD)", 105, startY + 13, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const amtFormatted = typeof data.amount === "number" ? `$${data.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}` : data.amount;
  doc.text(`${amtFormatted} ${data.currency || "AUD"}`, 105, startY + 26, { align: "center" });

  // Key Details Table
  const rowStart = startY + 44;
  const rowHeight = 11;

  const rows = [
    { label: "BPAY Biller Name:", value: data.billerName },
    { label: "Biller Code:", value: data.billerCode },
    { label: "Customer Reference No (CRN):", value: data.crn },
    { label: "Biller Category:", value: data.category || "Bills & Corporate Liabilities" },
    { label: "Receipt Number:", value: data.receiptNumber },
    { label: "Debit Authorisation Code:", value: data.debitAuthCode || "AUTH-CBA-BPAY-284910" },
    { label: "Source Account:", value: data.sourceAccount },
    { label: "Account Holder / Debited Party:", value: data.senderName },
    { label: "Settlement Date & Time (AEST):", value: data.timestamp },
  ];

  rows.forEach((r, idx) => {
    const y = rowStart + idx * rowHeight;
    // alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(25, y - 4, 160, rowHeight, "F");
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(r.label, 30, y + 3);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(String(r.value), 95, y + 3);
  });

  // Official Stamp & Verification
  const sealY = 248;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, sealY, 170, 24, 2, 2, "F");

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("AUSTRALIAN PAYMENTS PLUS (AP+) • SETTLEMENT CERTIFICATE", 25, sealY + 7);
  doc.setFont("helvetica", "normal");
  doc.text("Funds have been irrevocably cleared under the BPAY Scheme Regulations. APRA ADI Participant Authorization Confirmed.", 25, sealY + 13);
  doc.text(`Official CommBank Core Gateway • Trace Code: ${data.receiptNumber}-${data.debitAuthCode || "CLEARED"}`, 25, sealY + 18);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 282, 210, 15, "F");
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Commonwealth Bank of Australia ABN 48 123 123 124 AFSL and Australian credit licence 234945 • Valourian Sovereign Operating System", 105, 291, { align: "center" });

  doc.save(`BPAY_Receipt_${data.receiptNumber}.pdf`);
};

export interface SalaryRemittanceData {
  receiptNumber: string;
  transferDate: string;
  amount: number;
  currency: string;
  senderName: string;
  sourceAccount: string;
  beneficiaryName: string;
  destinationBank: string;
  bsb: string;
  accountNumber: string;
  payoutType: string;
  reference: string;
  speedNote?: string;
  traceId?: string;
}

export const generateSalaryRemittancePdf = (data: SalaryRemittanceData) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Page background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, "F");

  // Header Banner - Deep Slate
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 55, "F");

  // Accent Line - Emerald Gold
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 54, 210, 1.5, "F");

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("VALOURIAN CAPITAL", 20, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("GLOBAL TREASURY & INSTITUTIONAL PAYROLL CLEARING", 20, 29);
  doc.text("APRA ADI AUTHORISED • RBA EXCHANGE SETTLEMENT SYSTEM (ESS) #062-951", 20, 34);

  // Remittance Badge
  doc.setFillColor(16, 185, 129, 0.15);
  doc.roundedRect(140, 14, 50, 18, 2, 2, "F");
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("OSKO® REAL-TIME (NPP)", 165, 21, { align: "center" });
  doc.text("FUNDS CLEARED", 165, 27, { align: "center" });

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE SALARY REMITTANCE ADVICE", 20, 72);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Official Settlement Timestamp: ${new Date(data.transferDate).toLocaleString("en-AU")} (AEST)`, 20, 78);
  doc.text(`Payment Trace ID: ${data.receiptNumber} • Scheme: NPP Real-Time Direct Credit`, 20, 83);

  // Prominent Amount Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, 92, 170, 32, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, 92, 170, 32, 3, 3, "S");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("NET SALARY / PAYOUT CREDITED TO EXTERNAL ACCOUNT", 28, 102);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`$${Number(data.amount).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${data.currency}`, 28, 115);

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text("• Status: 100% Cleared & Available in External Bank Account", 115, 115);

  // Details Table
  const startY = 136;
  const rows = [
    { label: "Beneficiary / Account Holder:", value: data.beneficiaryName },
    { label: "Destination External Bank:", value: data.destinationBank },
    { label: "External BSB & Account No:", value: `BSB ${data.bsb} • Account ${data.accountNumber}` },
    { label: "Payment Purpose / Category:", value: data.payoutType.toUpperCase().replace("_", " ") },
    { label: "Payment Reference:", value: data.reference },
    { label: "Source Treasury Reserve:", value: data.sourceAccount },
    { label: "Payer Entity:", value: data.senderName },
    { label: "Clearing Protocol:", value: "New Payments Platform (NPP) Osko® 24/7/365 Direct Credit" },
    { label: "Regulatory Supervision:", value: "APRA Supervised ADI Protocol & AUSTRAC Monitored Transaction" },
    { label: "Funds Availability:", value: "IMMEDIATELY ACCESSIBLE FOR SPENDING / WITHDRAWAL" },
  ];

  rows.forEach((r, idx) => {
    const y = startY + (idx * 8.5);
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(20, y - 5, 170, 8.5, "F");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(r.label, 25, y + 1);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(String(r.value), 88, y + 1);
  });

  // Official Regulatory Certificate Seal
  const sealY = 230;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, sealY, 170, 36, 2, 2, "F");
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(20, sealY, 170, 36, 2, 2, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("APRA ADI EXECUTIVE REMITTANCE CERTIFICATE", 25, sealY + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("This remittance advice certifies that funds totaling the stated amount have been debited from the Valourian", 25, sealY + 15);
  doc.text("Sovereign Treasury Reserve and irrevocably credited to the external designated beneficiary account.", 25, sealY + 20);
  doc.text(`Clearing ID: ${data.receiptNumber} • Certified by Valourian Automated Payroll Engine`, 25, sealY + 26);
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text("NO REVERSAL POSSIBLE • IRREVOCABLE APRA/RBA SETTLED TRANSACTION", 25, sealY + 31);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 282, 210, 15, "F");
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Valourian Capital Pty Ltd ACN 662 948 102 • Commonwealth Bank of Australia Partner Integration • APRA ADI", 105, 291, { align: "center" });

  doc.save(`Executive_Salary_Remittance_${data.receiptNumber}.pdf`);
};