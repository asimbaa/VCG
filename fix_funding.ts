import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');

const correctFunding = `{activeTab === 'funding' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                     <h3 className="text-lg font-black text-white mb-2">Deposit Funds</h3>
                     <p className="text-xs text-slate-400 mb-6">Transfer from Valourian Treasury to eToro instantly.</p>
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                         <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input type="text" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white" />
                         </div>
                       </div>
                       <button onClick={() => handleFunding('deposit')} disabled={isFunding} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                         Deposit Now
                       </button>
                     </div>
                  </div>
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                     <h3 className="text-lg font-black text-white mb-2">Withdraw Funds</h3>
                     <p className="text-xs text-slate-400 mb-6">Transfer from eToro back to Valourian Treasury.</p>
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                         <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input type="text" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white" />
                         </div>
                       </div>
                       <button onClick={() => handleFunding('withdraw')} disabled={isFunding} className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors border border-slate-700">
                         Withdraw Now
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            )}`;

// Replace the block from `{activeTab === 'funding' && (` up to `)}`
const startIndex = content.indexOf("{activeTab === 'funding' && (");
const endIndex = content.indexOf("{activeTab === 'rebalance' && (");

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + correctFunding + '\n            ' + after;
}

fs.writeFileSync('src/components/bank/EToroApp.tsx', content);
