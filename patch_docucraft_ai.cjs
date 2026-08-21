const fs = require('fs');
let content = fs.readFileSync('src/components/bank/DocuCraftAI.tsx', 'utf8');

const imports = `import React, { useState, useRef } from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Server, FileSignature, Download, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { SmartContractAuditGraph } from './SmartContractAuditGraph';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
`;

content = content.replace(/import React, \{ useState \} from 'react';[\s\S]*?import \{ SmartContractAuditGraph \} from '\.\/SmartContractAuditGraph';/m, imports);

const downloadFunction = `
  const contractRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!contractRef.current) return;
    try {
      toast.info("Generating Secured PDF...");
      const imgData = await toPng(contractRef.current, { pixelRatio: 2, skipFonts: false });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (contractRef.current.offsetHeight * pdfWidth) / contractRef.current.offsetWidth;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const activeDoc = contracts.find(c => c.id === activeContract);
      const filename = \`\${activeDoc?.title?.replace(/\s+/g, '_') || 'Valourian_Document'}_Official.pdf\`;
      pdf.save(filename);
      toast.success("Document downloaded securely.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF.");
    }
  };
`;

content = content.replace(/const handleGenerate =/, downloadFunction + '\n  const handleGenerate =');

// Wrap the contract view in a div with the ref
const originalView = `<div className="bg-slate-100 rounded-xl p-6 font-mono text-xs text-slate-700 h-64 overflow-y-auto mb-6 border border-slate-200">`;
const newView = `<div ref={contractRef} className="bg-slate-100 rounded-xl p-6 font-mono text-xs text-slate-700 overflow-y-auto mb-6 border border-slate-200" style={{minHeight: '256px', backgroundColor: '#f8fafc'}}>`;
content = content.replace(originalView, newView);

// Replace the download button onClick
const originalButton = `onClick={() => {
                               toast.success("Document downloading securely over Sovereign network...");
                               setTimeout(() => {
                                 const link = document.createElement("a");
                                 const activeDoc = contracts.find(c => c.id === activeContract);
                                 link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(\`Valourian Capital Official Document\\n\\nTitle: \${activeDoc?.title}\\nStatus: EXECUTED & SECURED\\n\\nDocument contents would be retrieved from Sovereign Vault...\`);
                                 link.download = \`\${activeDoc?.title?.replace(/\\s+/g, '_')}_Official.txt\`;
                                 link.click();
                               }, 1000);
                             }}`;

content = content.replace(originalButton, `onClick={downloadPDF}`);

fs.writeFileSync('src/components/bank/DocuCraftAI.tsx', content);
