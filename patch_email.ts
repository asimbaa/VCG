import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EmailService.tsx', 'utf-8');

content = content.replace(
  '<p className="mt-4 text-xs text-green-100/80">Valid for immediate redemption.</p>',
  `<p className="mt-4 text-xs text-green-100/80 mb-4">Valid for immediate redemption.</p>
                 <div className="flex gap-2">
                   <a href={\`uber://voucher?code=\${data.voucherCode || "UBEREATS-VCS-9942"}\`} className="bg-black text-white font-bold py-2 px-6 rounded-full text-xs hover:bg-slate-800 transition-colors shadow-xl">
                     Claim in Uber
                   </a>
                   <a href={\`ubereats://voucher?code=\${data.voucherCode || "UBEREATS-VCS-9942"}\`} className="bg-emerald-900 text-emerald-100 font-bold py-2 px-6 rounded-full text-xs hover:bg-emerald-800 transition-colors shadow-xl">
                     Claim in UberEats
                   </a>
                 </div>`
);

fs.writeFileSync('src/components/bank/EmailService.tsx', content);
