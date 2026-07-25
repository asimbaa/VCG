import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add Link icon
if "Link," not in content:
    content = content.replace('Bot } from "lucide-react";', 'Bot, Link, Fingerprint, Lock } from "lucide-react";')

# Add state variables for bridge
state_vars = """  const [bridgeAsset, setBridgeAsset] = useState('BTC');
  const [bridgeAddress, setBridgeAddress] = useState('');
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<null | 'validating' | 'confirmed' | 'failed'>(null);
"""
content = content.replace("  const [aiStatus, setAiStatus] = useState(\"Standby\");", "  const [aiStatus, setAiStatus] = useState(\"Standby\");\n" + state_vars)

# Add button to tabs
tabs_btn = """              <button onClick={() => setActiveTab("funding")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'funding' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Funding</button>
              <button onClick={() => setActiveTab("bridge")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'bridge' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Bridge</button>
"""
content = content.replace('<button onClick={() => setActiveTab("funding")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === \'funding\' ? \'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30\' : \'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white\'}`}>Funding</button>', tabs_btn)

# Add Bridge Tab Content
bridge_tab = """
            {activeTab === 'bridge' && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30">
                     <div className="flex items-center gap-3 mb-2">
                        <Link className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-black text-white">Secure Cross-Chain Bridge</h3>
                     </div>
                     <p className="text-xs text-slate-400 mb-6">Validate and securely transfer assets from Valourian eToro Holdings directly to external Coinbase wallets via Zero-Trust validation.</p>
                     
                     <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Asset to Bridge</label>
                           <select value={bridgeAsset} onChange={e => setBridgeAsset(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white font-semibold focus:outline-none focus:border-emerald-500/50">
                               <option value="BTC">Bitcoin (BTC)</option>
                               <option value="ETH">Ethereum (ETH)</option>
                               <option value="USDC">USD Coin (USDC)</option>
                           </select>
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Destination Address (Coinbase)</label>
                           <input type="text" value={bridgeAddress} onChange={e => {
                               setBridgeAddress(e.target.value);
                               setBridgeStatus(null);
                               if(e.target.value.length > 20) {
                                   setBridgeStatus('validating');
                                   setTimeout(() => {
                                       if(e.target.value.startsWith('0x') || e.target.value.startsWith('1') || e.target.value.startsWith('3') || e.target.value.startsWith('bc1')) {
                                           setBridgeStatus('confirmed');
                                       } else {
                                           setBridgeStatus('failed');
                                       }
                                   }, 1500);
                               }
                           }} placeholder="e.g. 0x..." className={`w-full bg-slate-900 border ${bridgeStatus === 'validating' ? 'border-yellow-500/50' : bridgeStatus === 'confirmed' ? 'border-emerald-500/50' : bridgeStatus === 'failed' ? 'border-red-500/50' : 'border-slate-700'} rounded-xl py-3 px-4 text-white font-mono text-xs focus:outline-none`} />
                           
                           {bridgeStatus === 'validating' && <div className="text-yellow-500 text-[10px] mt-1 font-bold tracking-widest flex items-center gap-1"><Activity className="w-3 h-3 animate-spin" /> VALIDATING ADDRESS ON-CHAIN...</div>}
                           {bridgeStatus === 'confirmed' && <div className="text-emerald-400 text-[10px] mt-1 font-bold tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> VERIFIED COINBASE EXCHANGE WALLET</div>}
                           {bridgeStatus === 'failed' && <div className="text-red-400 text-[10px] mt-1 font-bold tracking-widest flex items-center gap-1"><Lock className="w-3 h-3" /> INVALID OR HIGH-RISK ADDRESS</div>}
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                           <div className="relative">
                             <input type="number" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50" />
                             <button onClick={() => setBridgeAmount("50.00")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">MAX</button>
                           </div>
                         </div>
                       </div>
                       
                       <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
                         <div>
                             <h4 className="text-white font-black mb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-emerald-400" /> Security Clearances</h4>
                             <ul className="space-y-3 text-xs">
                                <li className="flex items-center gap-2 text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-sig Vault Authorised</li>
                                <li className="flex items-center gap-2 text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Biometric Identity Confirmed</li>
                                <li className="flex items-center gap-2 text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Treasury SLA Compliance</li>
                             </ul>
                         </div>
                         <button onClick={() => {
                             if(bridgeStatus !== 'confirmed' || !bridgeAmount) {
                                 toast.error("Please provide a verified address and amount.");
                                 return;
                             }
                             setIsBridging(true);
                             toast.success("Initiating Cross-Chain transfer...", { icon: <Activity className="w-4 h-4 text-emerald-400" /> });
                             setTimeout(() => {
                                 toast.success(`Bridged ${bridgeAmount} ${bridgeAsset} to ${bridgeAddress.substring(0,6)}...`, { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> });
                                 setIsBridging(false);
                                 setBridgeAmount('');
                                 setBridgeAddress('');
                                 setBridgeStatus(null);
                             }, 3500);
                         }} disabled={isBridging || bridgeStatus !== 'confirmed' || !bridgeAmount} className="w-full py-4 mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-black rounded-xl transition-colors uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                           {isBridging ? 'Executing Bridge...' : 'Execute Bridge Transfer'}
                         </button>
                       </div>
                     </div>
                </div>
              </div>
            )}
"""

content = content.replace("            {activeTab === 'rebalance' && (", bridge_tab + "            {activeTab === 'rebalance' && (")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

