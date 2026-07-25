import re

with open('src/components/bank/BlackCardsController.tsx', 'r') as f:
    content = f.read()

btn_old = """                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 relative z-20">"""

btn_new = """                  </div>

                  {/* Wallet Integrations */}
                  <div className="flex gap-2 relative z-20 mb-4">
                     <button className="flex-1 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-xl">
                       <svg viewBox="0 0 48 48" className="w-5 h-5"><path fill="#fff" d="M11 24.5h5v-3h-5zm0 6h5v-3h-5zm0 6h5v-3h-5zm0-18h5v-3h-5zm0-6h5v-3h-5zm16 24h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zM27 30.5h-5v-3h5zm0 6h-5v-3h5zm0-18h-5v-3h5zm0-6h-5v-3h5zm0 24h-5v-3h5z"/></svg>
                       Apple Pay
                     </button>
                     <button className="flex-1 bg-white hover:bg-slate-100 text-slate-900 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-xl">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" className="h-4" alt="GPay" />
                       Google Pay
                     </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 relative z-20">"""

content = content.replace(btn_old, btn_new)

with open('src/components/bank/BlackCardsController.tsx', 'w') as f:
    f.write(content)
