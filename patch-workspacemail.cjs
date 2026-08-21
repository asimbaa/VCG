const fs = require('fs');
let content = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

const target = `<button 
              onClick={handleNewCompose}
              className="bg-[#c2e7ff] hover:bg-[#b0dcf8] text-slate-900 flex items-center gap-3 px-5 py-4 rounded-2xl w-fit font-medium transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              Compose
            </button>`;

const repl = `<div className="flex flex-col gap-2 mb-4">
              <button 
                onClick={handleNewCompose}
                className="bg-[#c2e7ff] hover:bg-[#b0dcf8] text-slate-900 flex items-center justify-center gap-3 px-5 py-3 rounded-2xl font-medium transition-colors w-full"
              >
                <Plus className="w-5 h-5" />
                Compose
              </button>
              <button 
                onClick={async () => {
                  toast.success("Synchronizing external protocols (Bank, Maps, Products, Deliveries)...");
                  if (user && user.uid) {
                    const emailsColRef = collection(db, "users", user.uid, "emails");
                    const newConnEmail = {
                      id: Date.now() + Math.random(),
                      sender: "Valourian Logistics",
                      email: "logistics@valourian.com",
                      subject: "Physical App / Card / Delivery Connections Synced",
                      body: "Your digital bank apps, physical cards, product stores, and forms are now actively connected to Maps APIs and best delivery protocols.\\n\\nAll physical creations generated in the app will seamlessly route through our logistics manifest.",
                      date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      read: false,
                      starred: true,
                      timestamp: new Date().toISOString()
                    };
                    await setDoc(doc(emailsColRef, String(newConnEmail.id)), newConnEmail);
                    toast.success("Connection protocols established and email received!");
                  }
                }}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold transition-colors border border-emerald-200"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Protocols
              </button>
            </div>`;

content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', content);
console.log("WorkspaceMail connection button patched.");
