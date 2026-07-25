import re

with open('src/components/bank/VaultRecords.tsx', 'r') as f:
    content = f.read()

state_add = """  const [selectedScotPacTab, setSelectedScotPacTab] = useState<"assets" | "tech" | "businesses" | "approval">("assets");"""

state_new = """  const [selectedScotPacTab, setSelectedScotPacTab] = useState<"assets" | "tech" | "businesses" | "approval">("assets");
  const [showOpsModal, setShowOpsModal] = useState<boolean>(false);
  const [opsType, setOpsType] = useState<"keys" | "cash" | "post">("keys");"""

content = content.replace(state_add, state_new)

btn_old = """                      <button 
                        onClick={() => {
                          toast.success(`Instructions sent to Operations for ${selectedPreviewProperty.id}. Key deliveries and notifications are scheduled.`);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                         <ShieldCheck className="w-4 h-4" /> Instruct Ops
                      </button>"""

btn_new = """                      <button 
                        onClick={() => setShowOpsModal(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                         <ShieldCheck className="w-4 h-4" /> Instruct Ops
                      </button>"""

content = content.replace(btn_old, btn_new)

modal_code = """
        {showOpsModal && selectedPreviewProperty && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-2">Operations Dispatch</h3>
               <p className="text-sm text-slate-500 mb-6">Schedule physical deliveries or pickups for {selectedPreviewProperty.id}.</p>
               
               <div className="space-y-4 mb-6">
                 <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                   <input type="radio" name="opsType" checked={opsType === 'keys'} onChange={() => setOpsType('keys')} className="w-4 h-4 text-blue-600" />
                   <div>
                     <p className="text-sm font-bold text-slate-900">Physical Key Delivery</p>
                     <p className="text-xs text-slate-500">Dispatch keys and title deeds to secure location via Aura Drive Tesla Fleet.</p>
                   </div>
                 </label>
                 
                 <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                   <input type="radio" name="opsType" checked={opsType === 'cash'} onChange={() => setOpsType('cash')} className="w-4 h-4 text-emerald-600" />
                   <div>
                     <p className="text-sm font-bold text-slate-900">Cash Treasury Delivery</p>
                     <p className="text-xs text-slate-500">Secure armed transport of physical cash reserves to property.</p>
                   </div>
                 </label>
                 
                 <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                   <input type="radio" name="opsType" checked={opsType === 'post'} onChange={() => setOpsType('post')} className="w-4 h-4 text-amber-600" />
                   <div>
                     <p className="text-sm font-bold text-slate-900">Post Office Pickup Notice</p>
                     <p className="text-xs text-slate-500">Generate secure PIN for post office collection of sensitive packages.</p>
                   </div>
                 </label>
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowOpsModal(false)}
                   className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                     if (opsType === 'keys') {
                       toast.success(`Key delivery dispatched via Tesla Fleet for ${selectedPreviewProperty.id}. ETA 45m.`);
                     } else if (opsType === 'cash') {
                       toast.success(`Armored cash transport initiated to ${selectedPreviewProperty.address}.`);
                     } else {
                       toast.success(`Pickup notification and secure PIN sent to your Comm channels for ${selectedPreviewProperty.id}.`);
                     }
                     setShowOpsModal(false);
                   }}
                   className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                 >
                   Confirm Dispatch
                 </button>
               </div>
            </div>
          </div>
        )}
      </AnimatePresence>
"""

content = content.replace("      </AnimatePresence>", modal_code)

with open('src/components/bank/VaultRecords.tsx', 'w') as f:
    f.write(content)

