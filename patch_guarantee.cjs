const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `<button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full bg-[#06C167] text-white font-heavy uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-[#05a155] transition-colors disabled:opacity-50 shadow-md font-black cursor-pointer"
                      >
                        {isProcessing ? "Processing..." : (isScheduled ? "Schedule Dispatch" : "Place Order")}
                      </button>`;

const replacement1 = `<div className="w-full text-center mb-3">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 inline mr-1 mb-0.5" />
                          100000000000% Delivery Guarantee via Valourian Logistics
                        </span>
                      </div>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full bg-[#06C167] text-white font-heavy uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-[#05a155] transition-colors disabled:opacity-50 shadow-md font-black cursor-pointer"
                      >
                        {isProcessing ? "Processing..." : (isScheduled ? "Schedule Dispatch" : "Place Order")}
                      </button>`;

code = code.replace(target1, replacement1);

const target2 = `<span>Payment Method:</span>
                <span className="text-slate-800 capitalize">{checkoutPaymentMethod}</span>
              </div>
            </div>`;

const replacement2 = `<span>Payment Method:</span>
                <span className="text-slate-800 capitalize">{checkoutPaymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-emerald-700 font-bold tracking-wide uppercase text-center flex flex-col gap-1">
                <span>Infrastructure: Sovereign Multi-Satellite Sync</span>
                <span>Guarantee: 100000000000% Secure Transport</span>
                <span>Dest: Unit 712, 15 BARTON RD</span>
              </div>
            </div>`;

code = code.replace(target2, replacement2);

fs.writeFileSync(file, code);
