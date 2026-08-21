const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const repl = `                    </form>

                    {/* Active Vouchers List */}
                    <div className="mt-8 relative z-10 border-t border-slate-800 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Gift className="w-4 h-4 text-emerald-400" /> Active Global Vouchers
                        </h4>
                        <div className="flex items-center gap-2">
                          {isSyncingVouchers ? (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Syncing...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Mirrored to Registry
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {myVouchers.length === 0 && !isSyncingVouchers ? (
                        <div className="text-center py-6 text-slate-500 text-xs font-medium">
                          No active vouchers found in global registry.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myVouchers.map((v) => (
                            <div key={v.id} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex gap-4 items-center">
                              <div className="bg-white p-1 rounded-lg shrink-0 shadow-sm">
                                <QRCodeSVG value={v.code} size={50} level="Q" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">\${v.amount.toFixed(2)} {v.currency}</span>
                                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">{v.status}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{v.code}</p>
                                <p className="text-[9px] text-slate-500 mt-1 truncate">To: {v.recipientEmail}</p>
                              </div>
                              <button
                                onClick={() => {
                                  toast.success("Voucher shared across linked sub-accounts!");
                                }}
                                className="shrink-0 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                title="Share across sub-accounts"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>`;
                  
const target = `                    </form>

                    {/* Active Vouchers List */}
                    <div className="mt-8 relative z-10 border-t border-slate-800 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Gift className="w-4 h-4 text-emerald-400" /> Active Global Vouchers
                        </h4>
                        <div className="flex items-center gap-2">
                          {isSyncingVouchers ? (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Syncing...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Mirrored to Registry
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {myVouchers.length === 0 && !isSyncingVouchers ? (
                        <div className="text-center py-6 text-slate-500 text-xs font-medium">
                          No active vouchers found in global registry.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myVouchers.map((v) => (
                            <div key={v.id} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex gap-4 items-center">
                              <div className="bg-white p-1 rounded-lg shrink-0 shadow-sm">
                                <QRCodeSVG value={v.code} size={50} level="Q" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">$\\{v.amount.toFixed(2)} \\{v.currency}</span>
                                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">\\{v.status}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono truncate">\\{v.code}</p>
                                <p className="text-[9px] text-slate-500 mt-1 truncate">To: \\{v.recipientEmail}</p>
                              </div>
                              <button
                                onClick={() => {
                                  toast.success("Voucher shared across linked sub-accounts!");
                                }}
                                className="shrink-0 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                title="Share across sub-accounts"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>`;
                  
content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
console.log("Vouchers UI patched correctly.");
