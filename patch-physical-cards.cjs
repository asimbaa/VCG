const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const target = `<Button
                        onClick={() => handleCreateCard()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-lg border border-indigo-400/30"
                      >
                        Request New Unit <Plus className="w-4 h-4 ml-2" />
                      </Button>`;

const repl = `<Button
                        onClick={() => {
                          toast.success("Logistics API Triggered: Dispatching 200 Pre-Activated Physical Cards via Secure Courier.");
                          setTimeout(() => {
                            toast.success("Delivery scheduled for Monday. Track in Logistics module.");
                          }, 1500);
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-lg border border-amber-400/30"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" /> Dispatch Physical Cards
                      </Button>
                      <Button
                        onClick={() => handleCreateCard()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-lg border border-indigo-400/30"
                      >
                        Request New Unit <Plus className="w-4 h-4 ml-2" />
                      </Button>`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("ValourianDashboard patched with physical card dispatch.");
