const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const vaultComponent = `
const DirectorVaultModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
         <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
               <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-fuchsia-500" />
                  <h2 className="text-white font-black uppercase tracking-widest text-sm">Tier-0 Director Vault</h2>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto hide-scrollbar space-y-6">
               <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500"/> Core Banking Credentials</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900 p-3 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Corporate Account Name</div>
                        <div className="text-slate-200 font-mono text-xs">VALOURIAN CAPITAL PTY LTD</div>
                     </div>
                     <div className="bg-slate-900 p-3 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">BSB / Account</div>
                        <div className="text-slate-200 font-mono text-xs">062-000 / 1928 3746</div>
                     </div>
                     <div className="bg-slate-900 p-3 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">PayID (ABN)</div>
                        <div className="text-emerald-400 font-mono text-xs font-bold">12 345 678 901</div>
                     </div>
                     <div className="bg-slate-900 p-3 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">PayID (Email)</div>
                        <div className="text-emerald-400 font-mono text-xs font-bold">treasury@valourian.com</div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Key className="w-4 h-4 text-amber-500"/> Web3 Private Keys & Seeds</h3>
                  <div className="space-y-3">
                     <div className="bg-slate-900 p-3 rounded border border-amber-500/20">
                        <div className="flex justify-between items-center mb-1">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Ethereum Cold Wallet (Main)</div>
                           <button onClick={() => navigator.clipboard.writeText('0xabc123...')} className="text-slate-400 hover:text-white"><Copy className="w-3 h-3"/></button>
                        </div>
                        <div className="text-amber-500 font-mono text-[10px] break-all bg-black/50 p-2 rounded">
                           0x9a8f7e6d5c4b3a210987654321fedcba9876543210fedcba9876543210fedcba
                        </div>
                     </div>
                     <div className="bg-slate-900 p-3 rounded border border-amber-500/20">
                        <div className="flex justify-between items-center mb-1">
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Solana Treasury (Phantom)</div>
                           <button onClick={() => navigator.clipboard.writeText('B1a2...')} className="text-slate-400 hover:text-white"><Copy className="w-3 h-3"/></button>
                        </div>
                        <div className="text-amber-500 font-mono text-[10px] break-all bg-black/50 p-2 rounded">
                           B1a2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
                        </div>
                     </div>
                     <div className="bg-slate-900 p-3 rounded border border-rose-500/20">
                        <div className="text-[10px] text-rose-500 uppercase font-bold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Master Seed Phrase (BIP39)</div>
                        <div className="text-rose-400 font-mono text-[10px] blur-sm hover:blur-none transition-all cursor-pointer bg-black/50 p-2 rounded">
                           abandon ability able about above absent absorb abstract absurd abuse access accident
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Terminal className="w-4 h-4 text-indigo-500"/> API Tokens & OAuth</h3>
                  <div className="grid grid-cols-1 gap-2">
                     <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Stripe Live Secret Key</span>
                        <span className="font-mono text-[10px] text-indigo-300">sk_live_51M... <button onClick={() => navigator.clipboard.writeText('sk_live_51M...')} className="inline ml-1 hover:text-white"><Copy className="w-3 h-3 inline"/></button></span>
                     </div>
                     <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Anthropic Claude API</span>
                        <span className="font-mono text-[10px] text-indigo-300">sk-ant-api03-... <button onClick={() => navigator.clipboard.writeText('sk-ant-api03-...')} className="inline ml-1 hover:text-white"><Copy className="w-3 h-3 inline"/></button></span>
                     </div>
                     <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Valourian Auth Secret (JWT)</span>
                        <span className="font-mono text-[10px] text-indigo-300">v0_auth_sig_x9f... <button onClick={() => navigator.clipboard.writeText('v0_auth_sig_x9f...')} className="inline ml-1 hover:text-white"><Copy className="w-3 h-3 inline"/></button></span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
               <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs uppercase tracking-widest transition-colors">Close Vault</button>
            </div>
         </div>
      </div>
   );
};
`;

if (!code.includes("DirectorVaultModal =")) {
   code = code.replace("export function ValourianDashboard", vaultComponent + "\nexport function ValourianDashboard");
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
