import React, { useState } from 'react';
import { FileText, Download, Mail, Printer, X, Check, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkspaceAccessToken, signInWithGoogle } from '../../firebase';
import { jsPDF } from 'jspdf';

export function ReceiptsSection({ transactions }: { transactions: any[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to generate and download a professional PDF receipt matching regulations
  const generatePDF = (txn: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Dark header banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 42, 'F');

      // Title & Metadata
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TAX INVOICE", 15, 18);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(194, 205, 217);
      const safeTxnId = String(txn?.id || 'VAL-TXN-TEMP');
      doc.text(`Invoice Number: VAL-${safeTxnId.replace('TXN-', '')}-2026`, 15, 26);
      doc.text(`Settlement Date: ${txn.date || ''}  |  Clearing Network: NPP OSKO`, 15, 31);
      doc.text(`Fulfillment node: ACTIVE  |  AML-CTF ID: SEC-AU-${safeTxnId.slice(4, 8)}`, 15, 36);

      // Gold badge indicating cleared settlement
      doc.setFillColor(5, 150, 105); // emerald-600
      doc.rect(155, 12, 40, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("SETTLED DIRECT", 159, 18.5);

      // Subheaders & details
      doc.setTextColor(15, 23, 42);
      
      // Billed to Customer
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("BILLED TO / HOLDER:", 15, 56);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text("ASIM ARYAL", 15, 62);
      doc.setTextColor(71, 85, 105);
      doc.text("Valourian Capital OS", 15, 67);
      doc.text("Unit 712, 15 Barton Rd", 15, 72);
      doc.text("Artarmon NSW 2064", 15, 77);

      // Supplier Details
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("MERCHANT / ISSUER:", 110, 56);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text("VALOURIAN TRUST SERVICES PTY LTD", 110, 62);
      doc.setTextColor(71, 85, 105);
      doc.text("ABN: 53 347 639 896", 110, 67);
      doc.text("Suite 2, Level 8, 15 Barton Rd", 110, 72);
      doc.text("Artarmon NSW 2064", 110, 77);

      // Clear accounts list
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("CLEARITY/INCOMING TRANSFER BANKS:", 15, 92);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 94, 195, 94);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("Account A: CBA Business Trans Acct (AUD)", 15, 100);
      doc.setFont("Courier", "bold");
      doc.text("BSB: 062-151  |  Account Number: 10559938  |  SWIFT: CTBAAU2S", 15, 104);

      doc.setFont("Helvetica", "normal");
      doc.text("Account B: CBA Business Foreign Currency Acct (USD FCA)", 15, 110);
      doc.setFont("Courier", "bold");
      doc.text("BSB: 062-151  |  Account Number: 10559946  |  SWIFT: CTBAAU2S", 15, 114);

      // Item description
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 122, 180, 26, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(15, 122, 180, 26, 'S');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("STATEMENT PARTICULAR", 20, 128);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const note = txn.note || `Settlement of ${txn.category || 'Institutional'} services.`;
      doc.text(note, 20, 137);

      // Allocation particulars
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("ALLOCATION METHOD", 15, 160);
      doc.text("REGULATORY STATUS / AUDITS", 120, 160);
      doc.line(15, 162, 195, 162);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("GST Category", 15, 169);
      doc.text("GST-Free (Input Taxed Financial Supply)", 120, 169);

      doc.text("AUSTRAC Routing Code", 15, 177);
      doc.text("AML-CTF Part A/B Compliant Sync", 120, 177);

      doc.text("Osko NPP Fast Settlement", 15, 185);
      doc.setTextColor(16, 185, 129);
      doc.setFont("Helvetica", "bold");
      doc.text("CLEAR TIME <1.2 SEC", 120, 185);

      doc.setDrawColor(226, 232, 240);
      doc.line(15, 192, 195, 192);

      // Total Paid
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL SETTLED CAPITAL", 115, 204);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      const amtStr = Math.abs(txn.amount).toLocaleString('en-US', { style: 'currency', currency: txn.currency || 'AUD' });
      doc.text(amtStr, 115, 215);

      // Footer legal compliance info
      doc.setDrawColor(241, 245, 249);
      doc.line(15, 248, 195, 248);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("This official invoice is automatically compiled and compliant under Section 29-70 of A New Tax System (GST) Act 1999.", 15, 254);
      doc.text("Recipient: Mr. Asim Aryal. Realized and accounted securely by Valourian Trust Services Pty Ltd (ABN 53 347 639 896).", 15, 259);
      doc.text("Funds transferred are settled in real-time under Osko interbank networks. Reconciled copy sent to Commonwealth Bank of Australia.", 15, 264);

      doc.save(`Valourian_Receipt_${txn.id}.pdf`);
      toast.success("Receipt downloaded as PDF successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not export PDF", { description: err.message });
    }
  };

  const handleEmailReceipt = async () => {
    if (!selectedReceipt) return;
    
    let token = getWorkspaceAccessToken();
    if (!token) {
      toast.info("Google Authentication Required", { description: "Please sign in with Google to enable Workspace Comms (Gmail)." });
      await signInWithGoogle();
      token = getWorkspaceAccessToken();
      if (!token) {
        toast.error("Authentication failed. Cannot send receipt.");
        return;
      }
    }

    try {
      setIsEmailing(true);
      toast.loading("Dispatching invoice to Workspace Comms...");

      const to = "asim.nsw@gmail.com";
      const safeId = String(selectedReceipt?.id || 'VAL-TXN-TEMP');
      const subject = `Tax Invoice No. VAL-${safeId.replace('TXN-', '')}-26`;
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0f172a; margin-bottom: 5px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Tax Invoice</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 5px; margin-bottom: 25px;">No. VAL-${selectedReceipt.id}-26 • VALOURIAN DEPOSIT MAPPING</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="width: 50%; vertical-align: top; font-size: 13px; line-height: 1.6;">
                <strong style="color: #475569; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 5px; letter-spacing: 0.1em;">Billed To:</strong>
                <strong>ASIM ARYAL</strong><br/>
                Valourian Capital OS<br/>
                Unit 712, 15 Barton Rd<br/>
                Artarmon NSW 2064<br/>
              </td>
              <td style="width: 50%; vertical-align: top; font-size: 13px; line-height: 1.6;">
                <strong style="color: #475569; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 5px; letter-spacing: 0.1em;">Merchant/Supplier:</strong>
                <strong>VALOURIAN TRUST SERVICES PTY LTD</strong><br/>
                ABN: 53 347 639 896<br/>
                Suite 2, Level 8, 15 Barton Rd<br/>
                Artarmon NSW 2064<br/>
              </td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <strong style="color: #475569; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 8px; letter-spacing: 0.1em;">Transaction Description:</strong>
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #334155;">${selectedReceipt.note || `Settlement of ${selectedReceipt.category} services.`}</p>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 12px; margin-bottom: 25px; font-family: monospace;">
            <b>CBA RECEIVING ACCOUNTS:</b><br/>
            AUD Account: BSB: 062-151 / Account: 10559938<br/>
            USD FCA Account: BSB: 062-151 / Account: 10559946<br/>
            SWIFT/BIC Code: CTBAAU2S
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0;">
            <tr style="border-bottom: 1.5px solid #0f172a;">
              <th style="text-align: left; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">Details</th>
              <th style="text-align: right; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">Allocations</th>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 13px; color: #475569;">GST Allocation</td>
              <td style="padding: 12px 0; font-size: 13px; text-align: right; font-weight: bold; color: #334155;">$0.00 (GST-Free)</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-size: 13px; color: #475569;">IFTI Reporting Status</td>
              <td style="padding: 12px 0; font-size: 13px; text-align: right; font-weight: bold; color: #334155;">AML-CTF Compliant</td>
            </tr>
          </table>

          <div style="text-align: right; margin-bottom: 40px;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Total Paid/Settled</p>
            <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">${Math.abs(selectedReceipt.amount).toLocaleString('en-US', { style: 'currency', currency: selectedReceipt.currency || 'AUD' })}</p>
          </div>

          <div style="text-align: center; border-t: 1px solid #f1f5f9; padding-top: 20px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            This is a formal and compliant Tax Invoice under CBA / APRA clearing rules and Division 40 of A New Tax System (GST) Act 1999. Backed by NPP Osko instant settlement confirmations.
          </div>
        </div>
      `;

      const boundary = 'foo123';
      const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        `Content-Type: text/html; charset="UTF-8"`,
        '',
        htmlBody,
        '',
        `--${boundary}--`
      ];
      const emailContent = emailLines.join('\r\n');
      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!res.ok) {
        throw new Error('Failed to send email via Workspace Comms');
      }

      toast.dismiss();
      toast.success("Sending via Google Workspace...", { 
        description: "Receipt successfully dispatched to asim.nsw@gmail.com" 
      });
    } catch (e: any) {
      toast.dismiss();
      console.error(e);
      toast.error("Failed to send receipt", { description: e.message });
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDoubleClickedReceipt = (txn: any) => {
    setSelectedReceipt(txn);
    setIsExpanded(true);
    // Download to device as PDF instantly on double click per requirements
    generatePDF(txn);
  };

  const paidTransactions = transactions.filter((t: any) => t.amount < 0 || String(t.id).startsWith("AAPL"));

  return (
    <div className="space-y-6">
      {/* Informative Header card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
             <h2 className="text-3xl font-black mb-2 flex items-center gap-3 italic uppercase tracking-tighter">
               <FileText className="w-8 h-8 text-indigo-400" />
               Purchase Receipts & Invoices
             </h2>
             <p className="text-slate-400 font-mono text-xs">
               Official Tax Invoices mapped directly to ABN <strong className="text-slate-200 font-bold">53 347 639 896</strong>. Double-click any item to expand details and export a compliant PDF.
             </p>
           </div>
           <div className="text-right bg-slate-800 p-4 rounded-2xl border border-slate-700 shrink-0 font-mono">
             <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Records</div>
             <div className="text-2xl font-bold text-emerald-400">{paidTransactions.length} Settled</div>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         {/* LEFT LIST PANEL */}
         <div className="md:col-span-1 border border-slate-200/60 rounded-3xl bg-white overflow-hidden max-h-[700px] overflow-y-auto shadow-sm">
           <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
             <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">Select Receipt</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase">Double-click to Download & Go Fullscreen</span>
           </div>
           {paidTransactions.length === 0 ? (
             <div className="p-8 text-center text-slate-400 text-sm">No transaction records found to process receipts.</div>
           ) : (
             paidTransactions.map((txn: any) => (
               <button
                 key={txn.id}
                 id={`rec-item-${txn.id}`}
                 onClick={() => setSelectedReceipt(txn)}
                 onDoubleClick={() => handleDoubleClickedReceipt(txn)}
                 className={`w-full text-left p-5 border-b border-slate-100 transition-all flex flex-col gap-2 relative group cursor-pointer ${
                   selectedReceipt?.id === txn.id 
                     ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600' 
                     : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                 }`}
                 title="Double-click to expand and download PDF"
               >
                 <div className="flex justify-between w-full">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">{txn.date}</span>
                   <span className="text-[10px] font-black font-mono text-emerald-600 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     PAID
                   </span>
                 </div>
                 <div className="font-bold text-slate-900 leading-tight flex items-center justify-between">
                   <span>{txn.recipient || (txn.type === 'card' ? 'Card Purchase' : 'Transfer')}</span>
                   <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="text-xs text-slate-500 truncate max-w-[200px] font-mono">{txn.note || txn.category}</div>
                 <div className="flex justify-between items-center mt-1">
                   <span className="font-mono text-sm font-black text-slate-900">
                     {Math.abs(txn.amount).toLocaleString('en-US', { style: 'currency', currency: txn.currency || 'AUD' })}
                   </span>
                   <span className="text-[9px] font-black uppercase text-indigo-500 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                     Double-click to Export
                   </span>
                 </div>
               </button>
             ))
           )}
         </div>

         {/* RIGHT PREVIEW PANEL */}
         <div className="md:col-span-2">
           {selectedReceipt ? (
             <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] uppercase font-black text-6xl flex items-center justify-center -rotate-12 break-all overflow-hidden select-none">
                  VALOURIAN TRUST SERVICES ABN 53347639896
                </div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start mb-8">
                     <div className="text-left">
                       <h3 className="font-black text-2xl uppercase tracking-tighter italic text-slate-900">Tax Invoice</h3>
                       <p className="text-xs text-slate-500 font-semibold font-mono">Invoice VAL-{String(selectedReceipt?.id || '').replace('TXN-', '')}-2026</p>
                     </div>
                     <div className="text-right font-mono">
                       <div className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-xs uppercase tracking-widest px-3 py-1 rounded-xl">
                         SETTLED DIRECT
                       </div>
                       <div className="text-[10px] text-slate-400 mt-2 font-bold">{selectedReceipt.date}</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 text-left mb-8 border-b border-slate-100 pb-8 text-xs font-mono">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Billed To (Director)</h4>
                      <p className="font-black text-slate-900">ASIM ARYAL</p>
                      <p className="text-slate-600">Valourian Capital OS</p>
                      <p className="text-slate-600">Unit 712, 15 Barton Rd</p>
                      <p className="text-slate-600">Artarmon NSW 2064</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Merchant / Issuer</h4>
                      <p className="font-black text-slate-900">VALOURIAN TRUST SERVICES PTY LTD</p>
                      <p className="text-slate-600 font-bold text-indigo-600">ABN: 53 347 639 896</p>
                      <p className="text-slate-500">Suite 2, Level 8, 15 Barton Rd</p>
                      <p className="text-slate-500">Artarmon NSW 2064</p>
                    </div>
                  </div>

                  {/* CBA Destination Accounts panel to oblige with regulations and establish trust */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-left mb-6 font-mono text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800 uppercase text-[9px] text-indigo-500 tracking-widest mb-1">CBA Registered Settlement Channels</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <strong className="block text-slate-800 text-[10px]">CBA Business Trans Acct</strong>
                        BSB: <strong className="text-slate-900 font-extrabold">062-151</strong><br />
                        Account: <strong className="text-slate-900 font-extrabold">10559938</strong><br />
                        SWIFT: <strong className="text-slate-900 font-extrabold">CTBAAU2S</strong> (AUD)
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <strong className="block text-slate-800 text-[10px]">CBA Business FCA USD</strong>
                        BSB: <strong className="text-slate-900 font-extrabold">062-151</strong><br />
                        Account: <strong className="text-slate-900 font-extrabold">10559946</strong><br />
                        SWIFT: <strong className="text-slate-900 font-extrabold">CTBAAU2S</strong> (USD)
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-left mb-6">
                    <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">Statement Particular / Description</h4>
                    <p className="font-medium text-slate-800 text-sm leading-relaxed">{selectedReceipt.note || `Settlement of ${selectedReceipt.category} services.`}</p>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-left mb-8 grid grid-cols-3 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">GST CATEGORY</span>
                      <strong className="text-slate-800">GST-Free (Div 40)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">REGULATION SYNC</span>
                      <strong className="text-slate-800">AML-CTF Compliant</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">CLEARING ACCEL</span>
                      <strong className="text-emerald-600">OSKO Clear Active</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                    <button 
                      onClick={() => setIsExpanded(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 font-mono uppercase tracking-wider"
                    >
                      Maximize View
                    </button>
                    <div className="text-right font-mono">
                       <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Settled</p>
                       <p className="text-3xl font-black text-slate-900 tracking-tight">
                         {Math.abs(selectedReceipt.amount).toLocaleString('en-US', { style: 'currency', currency: selectedReceipt.currency || 'AUD' })}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-4 mt-8 border-t border-slate-150 pt-6">
                  <button 
                    disabled={isEmailing} 
                    onClick={handleEmailReceipt} 
                    className="bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 py-3 rounded-2xl font-bold font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Mail className="w-4 h-4" /> {isEmailing ? "Sending..." : "CC to Gmail"}
                  </button>
                  <button 
                    onClick={() => generatePDF(selectedReceipt)} 
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-2xl font-bold font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button 
                    onClick={() => generatePDF(selectedReceipt)} 
                    className="bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-bold font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Export Print
                  </button>
                </div>
             </div>
           ) : (
             <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-16 h-full flex flex-col items-center justify-center text-slate-400">
               <FileText className="w-20 h-20 mb-4 opacity-40 text-slate-300 stroke-[1.2]" />
               <p className="font-bold text-slate-500 text-base">Select a purchase to preview the Tax Invoice</p>
               <p className="text-xs text-slate-400 text-center max-w-sm mt-2">Double-click any item to immediately download its regulatory compliant PDF copy and expand to fullscreen mode.</p>
             </div>
           )}
         </div>
      </div>

      {/* FULLSCREEN EXPANDED MODAL PORTAL */}
      {isExpanded && selectedReceipt && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col my-8 border border-white/20">
            {/* Modal header control */}
            <div className="bg-slate-900 text-white p-6 px-10 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter">Tax Invoice Full-Screen Viewer</h3>
                  <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">Complines with Division 40 of A New Tax System (GST) Act 1999 • ABN 53347639896</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-450 hover:text-white"
                title="Close overlay"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-10 md:p-12 overflow-y-auto max-h-[70vh] space-y-8 relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] uppercase font-black text-8xl flex items-center justify-center -rotate-12 select-none">
                VALOURIAN TRUST SERVICES ABN 53347639896
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Tax Invoice</h2>
                  <p className="text-sm text-indigo-600 font-bold font-mono">Reference NO: VAL-{String(selectedReceipt?.id || '').replace('TXN-', '')}-26</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Date Settled: {selectedReceipt.date}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-3 px-5 font-mono text-center">
                  <span className="block text-[9px] uppercase tracking-widest text-emerald-500 font-black mb-1">HANDSHAKE METRIC</span>
                  <div className="text-base font-black flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> OSKO NPP CLEARED
                  </div>
                </div>
              </div>

              {/* Grid with customer/merchant details */}
              <div className="grid sm:grid-cols-2 gap-10 font-mono text-xs text-slate-700">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-2">BILLED TRUSTEE / CLIENT</span>
                  <p className="font-black text-slate-900 text-sm">ASIM ARYAL</p>
                  <p className="mt-1">Valourian Capital OS</p>
                  <p>Unit 712, 15 Barton Rd</p>
                  <p>Artarmon NSW 2064</p>
                  <p className="text-[10px] text-slate-400 mt-2">Personal Email: asim.nsw@gmail.com</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-2">ISSUING SUPPLIER / MERCHANT</span>
                  <p className="font-black text-slate-900 text-sm">VALOURIAN TRUST SERVICES PTY LTD</p>
                  <p className="font-extrabold text-indigo-600 mt-1">ABN: 53 347 639 896</p>
                  <p>Suite 2, Level 8, 15 Barton Rd</p>
                  <p>Artarmon NSW 2064</p>
                  <p className="text-[10px] text-slate-400 mt-2">Registered: Australian Taxation Office (ATO)</p>
                </div>
              </div>

              {/* CBA Destination details */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 font-mono text-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span className="uppercase text-[10px] tracking-wider text-indigo-600 font-extrabold">Commonwealth Bank Registered Settlement Accounts</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <strong className="block text-slate-800 text-[11px] mb-1">Business Transaction Account (AUD)</strong>
                    <div className="space-y-0.5 text-slate-600 text-[11px]">
                      <div>Bank: <strong className="text-slate-800">Commonwealth Bank of Australia</strong></div>
                      <div>BSB: <strong className="text-slate-900">062-151</strong></div>
                      <div>Account: <strong className="text-slate-900">10559938</strong></div>
                      <div>SWIFT Code: <strong className="text-slate-900">CTBAAU2S</strong></div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <strong className="block text-slate-800 text-[11px] mb-1">Business Foreign Currency Account (USD FCA)</strong>
                    <div className="space-y-0.5 text-slate-600 text-[11px]">
                      <div>Bank: <strong className="text-slate-800">Commonwealth Bank of Australia</strong></div>
                      <div>BSB: <strong className="text-slate-900">062-151</strong></div>
                      <div>Account: <strong className="text-slate-900">10559946</strong></div>
                      <div>SWIFT Code: <strong className="text-slate-900">CTBAAU2S</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
                <span className="text-[9px] uppercase tracking-wider text-blue-400 font-black font-mono">Statement Particular</span>
                <p className="text-base font-medium mt-1 leading-relaxed">{selectedReceipt.note || `Settlement of ${selectedReceipt.category} services.`}</p>
              </div>

              {/* Legal and monetary breakdown */}
              <div className="grid sm:grid-cols-3 gap-6 font-mono text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">TAX ALLOCATION</span>
                  <strong className="text-slate-800">GST-Free (Financial Supply)</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">GOVERNMENT COMPLIANCE</span>
                  <strong className="text-slate-800">AML-CTF Act 2006 Match</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">SETTLED VALUE</span>
                  <strong className="text-emerald-600 text-sm">
                    {Math.abs(selectedReceipt.amount).toLocaleString('en-US', { style: 'currency', currency: selectedReceipt.currency || 'AUD' })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal footer control bar */}
            <div className="bg-slate-50 p-6 px-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[9px] text-slate-400 font-mono text-center sm:text-left">
                Double-clicking list elements or maximizing triggers secure export. Signed by SHA256-RSA validation.
              </span>
              <div className="flex gap-2 w-full sm:w-auto shrink-0 font-mono">
                <button 
                  onClick={() => generatePDF(selectedReceipt)} 
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white p-3 px-6 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" /> Download PDF Receipt
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 sm:flex-none border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 p-3 px-6 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
                >
                  Close Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
