import fs from 'fs';

const filePath = 'src/components/bank/BankDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newLogistics = `                      <div className="space-y-4 mb-8">
                                    {notifications.map((shipment) => (
                                      <div key={shipment.id} className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 transition-all hover:shadow-2xl hover:border-blue-500/20 overflow-hidden mb-4">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
                                        
                                        <div className="flex items-start gap-6 relative z-10">
                                          <div className={"w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 " + (shipment.type === "alert" ? "bg-rose-500 text-white" : "bg-slate-900 text-white")}>
                                            {shipment.type === "alert" ? <Shield className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                                          </div>
                                          
                                          <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{shipment.time} • Global Corridor Priority Alpha</div>
                                                <div className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{shipment.title}</div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 tracking-widest">{shipment.manifest.courier}</span>
                                              </div>
                                            </div>

                                            <div className="flex gap-4">
                                               <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Breakthrough AI Note: {shipment.message}</p>
                                               </div>
                                               <div className="w-36 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center">
                                                  <div className="flex items-center gap-1.5 mb-1">
                                                     <Activity className="w-3 h-3 text-emerald-600" />
                                                     <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Quantum Twin</span>
                                                  </div>
                                                  <div className="text-sm font-black text-emerald-900 uppercase">Live Alpha</div>
                                                  <div className="text-[8px] font-bold text-emerald-500 mt-1">ID: TWIN-ALPHA</div>
                                               </div>
                                            </div>

                                            <div className="flex items-center gap-6 pt-2">
                                               {[
                                                  { label: "Temp", val: "18.2°C" },
                                                  { label: "Humidity", val: "42%" },
                                                  { label: "G-Force", val: "1.02G" },
                                                  { label: "Security", val: "Max" }
                                               ].map((stat, idx) => (
                                                  <div key={idx} className="flex items-center gap-2">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        {stat.label}: <span className="text-slate-900">{stat.val}</span>
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>`;

const startMarker = '<div className="space-y-4 mb-8">\\s*{notifications.map((shipment) => (';
// Let's use a simpler marker
const simpleStart = 'notifications.map((shipment) => (';
const simpleEnd = 'activeTab === "documents"'; // Roughly where it ends

const startIndex = content.indexOf('notifications.map((shipment) => (');
// Find the wrapping div for the map
const wrapStart = content.lastIndexOf('<div className="space-y-4 mb-8">', startIndex);
const wrapEnd = content.indexOf(') : activeTab === "aura"', startIndex);

if (wrapStart !== -1 && wrapEnd !== -1) {
    const updatedContent = content.substring(0, wrapStart) + newLogistics + content.substring(wrapEnd);
    fs.writeFileSync(filePath, updatedContent);
    console.log('Logistics updated successfully');
} else {
    console.log('Markers not found', { wrapStart, wrapEnd });
}
