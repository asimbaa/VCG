import re

with open('src/components/bank/VaultRecords.tsx', 'r') as f:
    content = f.read()

btn_old = """                      <button 
                        onClick={() => handlePrint(selectedPreviewProperty)}
                        className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                         <Printer className="w-4 h-4" /> Export Title PDF Record
                      </button>"""

btn_new = """                      <button 
                        onClick={() => handlePrint(selectedPreviewProperty)}
                        className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                         <Printer className="w-4 h-4" /> Export PDF
                      </button>
                      <button 
                        onClick={() => {
                          toast.success(`Instructions sent to Operations for ${selectedPreviewProperty.id}. Key deliveries and notifications are scheduled.`);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                         <ShieldCheck className="w-4 h-4" /> Instruct Ops
                      </button>"""

content = content.replace(btn_old, btn_new)

with open('src/components/bank/VaultRecords.tsx', 'w') as f:
    f.write(content)

