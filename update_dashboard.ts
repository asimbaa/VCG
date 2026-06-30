import fs from 'fs';

const filePath = 'src/components/bank/BankDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newPortfolio = `) : activeTab === "portfolio" ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Institutional Portfolio</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Sovereign Wealth & Asset Arbor</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold text-xs px-6">Export Ledger</Button>
                      <Button className="rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-6 h-12 shadow-xl">Stress Test Assets</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm h-[600px] flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32 group-hover:bg-blue-500/10 transition-colors" />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl">
                                 <Workflow className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">The Wealth Arbor</h4>
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Recursive Multi-Corridor Growth Engine</p>
                              </div>
                           </div>
                           <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-[1rem] border border-slate-200">
                              <button className="px-5 py-2 text-[10px] font-black uppercase bg-white text-slate-900 shadow-sm rounded-lg">Hierarchy</button>
                              <button className="px-5 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-colors">Risk Stream</button>
                           </div>
                        </div>
                        
                        <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] relative overflow-hidden border border-slate-200/50 backdrop-blur-3xl z-10 flex items-center justify-center">
                           <div className="relative w-full h-full p-10">
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="relative text-center">
                                    <div className="w-40 h-40 bg-slate-900 rounded-full flex flex-col items-center justify-center border-8 border-white shadow-2xl relative z-10 group cursor-pointer hover:scale-105 transition-all">
                                       <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Founder</div>
                                       <div className="text-3xl font-black text-white">$10.2B</div>
                                    </div>
                                    
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
                                       <svg className="w-full h-full opacity-20">
                                          <circle cx="400" cy="400" r="120" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 8" />
                                          <circle cx="400" cy="400" r="220" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="12 12" />
                                          <line x1="400" y1="400" x2="150" y2="150" stroke="#3b82f6" strokeWidth="2" />
                                          <line x1="400" y1="400" x2="650" y2="150" stroke="#3b82f6" strokeWidth="2" />
                                          <line x1="400" y1="400" x2="150" y2="650" stroke="#3b82f6" strokeWidth="2" />
                                          <line x1="400" y1="400" x2="650" y2="650" stroke="#3b82f6" strokeWidth="2" />
                                       </svg>
                                    </div>

                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -top-[160px] -left-[140px] pointer-events-auto">
                                       <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-2xl w-52 text-left group hover:border-emerald-500 transition-all cursor-pointer">
                                          <div className="flex justify-between items-center mb-3">
                                             <Building className="w-6 h-6 text-emerald-500" />
                                             <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">+24%</div>
                                          </div>
                                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real Estate</div>
                                          <div className="text-lg font-black text-slate-900 mt-1">$2.84B</div>
                                          <div className="mt-3 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                             <div className="w-[85%] h-full bg-emerald-500 shadow-sm" />
                                          </div>
                                       </div>
                                    </motion.div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                       <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                          <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                   <Target className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Executor Pipeline</h4>
                             </div>
                             
                             <div className="space-y-4 mb-10">
                                {todoList.map(item => (
                                  <div key={item.id} className="relative bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:scale-[1.02] cursor-pointer group/item">
                                    <div className="flex items-start gap-4">
                                      <div className={"mt-1 w-6 h-6 rounded-[0.5rem] border-2 flex items-center justify-center transition-all " + (item.completed ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30" : "border-slate-300 group-hover/item:border-blue-400")}>
                                        {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                                      </div>
                                      <div className="flex-1">
                                         <div className={"text-xs font-bold leading-relaxed " + (item.completed ? "text-slate-400 line-through" : "text-slate-800")}>
                                           {item.task}
                                         </div>
                                         <div className="flex items-center gap-3 mt-3">
                                            <span className="text-[9px] font-black uppercase text-blue-600/60 tracking-widest">P-ALpha</span>
                                         </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                             </div>

                             <Button 
                               className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02]"
                               onClick={() => {
                                 toast.loading("Analyzing pending pipeline delta...");
                                 setTimeout(() => {
                                   toast.success("Executor Traversal Active. All dependencies locked.", { icon: "⚙️" });
                                 }, 2000);
                               }}
                             >
                               Start Sovereign Traversal
                             </Button>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>`;

const startMarker = ') : activeTab === "portfolio" ? (';
const endMarker = ') : activeTab === "notifications" ? (';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const updatedContent = content.substring(0, startIndex) + newPortfolio + content.substring(endIndex);
    fs.writeFileSync(filePath, updatedContent);
    console.log('Portfolio updated successfully');
} else {
    console.log('Markers not found', { startIndex, endIndex });
}
