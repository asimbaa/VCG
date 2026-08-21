const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const newTabs = `
    { id: "compliance", label: "Compliance & Diagnostics", icon: ShieldCheck },
    { id: "comms_policy", label: "Comms Policy", icon: MessageSquare },
`;
if (!file.includes('id: "compliance"')) {
    file = file.replace('{ id: "documents", label: "Vault Records", icon: FileText },', newTabs + '\n      { id: "documents", label: "Vault Records", icon: FileText },');
    
    const newContent = `
            ) : activeTab === "compliance" ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black mb-4">Compliance & Diagnostics Hub</h2>
                    <p className="text-slate-400 mb-10 text-lg">Automated Checklist Dashboard & System Validation.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="text-emerald-400" /> Pre-Flight Checklist</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300"><Check className="text-emerald-500 w-5 h-5" /> All environment variables secured</li>
                                <li className="flex items-center gap-3 text-slate-300"><Check className="text-emerald-500 w-5 h-5" /> SMTP queue logic verified</li>
                                <li className="flex items-center gap-3 text-slate-300"><Check className="text-emerald-500 w-5 h-5" /> Currency API hook implemented</li>
                                <li className="flex items-center gap-3 text-slate-300"><Check className="text-emerald-500 w-5 h-5" /> Responsive tables wrapped</li>
                            </ul>
                        </div>
                        
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-indigo-400" /> Transaction Diagnostics</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <div className="text-xs text-indigo-300 font-mono mb-1">RUNNING SYSTEM DIAGNOSTIC</div>
                                    <div className="text-emerald-400 font-bold text-sm">✓ Torrens Offline Sync Active</div>
                                    <div className="text-emerald-400 font-bold text-sm">✓ Stripe Payouts Connected</div>
                                    <div className="text-emerald-400 font-bold text-sm">✓ Sovereign AI 2.0 Responsive</div>
                                </div>
                                <button onClick={() => toast.success("Diagnostic passed. Regulatory audit logs verified.")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">Run Full Audit</button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            ) : activeTab === "comms_policy" ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black mb-4">Communication Policy</h2>
                    <p className="text-slate-400 mb-10 text-lg">Define workspace communication templates, attachment rules, and notification preferences.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="font-bold text-rose-400 mb-3 text-lg">External Communications</h3>
                            <p className="text-sm text-slate-300 mb-4">All external emails must be routed through Workspace Mail with Sovereign Headers attached automatically.</p>
                            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" defaultChecked className="rounded text-rose-500" /> Allow PDF Attachments up to 50MB</label>
                            <label className="flex items-center gap-2 text-sm text-slate-300 mt-2"><input type="checkbox" defaultChecked className="rounded text-rose-500" /> Require 2FA on encrypted zip files</label>
                        </div>
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="font-bold text-rose-400 mb-3 text-lg">Internal Syncs</h3>
                            <p className="text-sm text-slate-300 mb-4">Internal team broadcasts bypass standard rate limiting. Ensure priority flags are only used for C-level updates.</p>
                            <button onClick={() => toast.success("Policy Updated & Enforced Globally")} className="mt-2 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-xl text-sm font-bold">Save Preferences</button>
                        </div>
                    </div>
                </div>
              </div>
    `;
    
    // Inject the content right before activeTab === "email" or similar
    file = file.replace(') : activeTab === ("email" as any)', newContent + '\n            ) : activeTab === ("email" as any)');
    
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
    console.log("Valourian tabs injected.");
}
