const fs = require('fs');
let content = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

// Ensure QRCodeSVG is imported
if (!content.includes('import { QRCodeSVG }')) {
  content = content.replace("import React,", "import React,\nimport { QRCodeSVG } from 'qrcode.react';");
}

const target = `<div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                         <div className="text-center sm:text-left">
                           <span className="text-[8px] font-black text-green-300 uppercase tracking-widest block mb-0.5 font-sans">Secure Redemption Code</span>
                           <span className="font-mono text-sm font-extrabold tracking-widest text-emerald-300 uppercase select-all">{selectedEmail.voucherCode || "UBEREATS-VCS-9942"}</span>
                         </div>`;

const repl = `<div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                         <div className="flex items-center gap-4">
                           <div className="bg-white p-1 rounded-lg">
                             <QRCodeSVG value={selectedEmail.voucherCode || "UBEREATS-VCS-9942"} size={64} level="Q" />
                           </div>
                           <div className="text-center sm:text-left">
                             <span className="text-[8px] font-black text-green-300 uppercase tracking-widest block mb-0.5 font-sans">Secure Redemption Code</span>
                             <span className="font-mono text-sm font-extrabold tracking-widest text-emerald-300 uppercase select-all">{selectedEmail.voucherCode || "UBEREATS-VCS-9942"}</span>
                             <span className="text-[8px] mt-1 text-slate-300 font-medium block">Scan at supported merchant POS globally</span>
                           </div>
                         </div>`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', content);
console.log("WorkspaceMail patched successfully.");
