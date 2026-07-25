import re

with open('src/components/pay/RapidPay.tsx', 'r') as f:
    content = f.read()

btn_old = """                            <div className="text-right">
                              <span className="block text-[7px] text-slate-400">SWIFT/BIC</span>
                              {card.swiftCode}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-1 font-bold font-sans">
                            <span className="text-[9px] font-medium opacity-60">Global Credit Line</span>
                            ${parseFloat(card.limit).toLocaleString()} AUD
                          </div>
                        </div>
                      </div>"""

btn_new = """                            <div className="text-right">
                              <span className="block text-[7px] text-slate-400">SWIFT/BIC</span>
                              {card.swiftCode}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-1 font-bold font-sans border-b border-slate-200/10 pb-2">
                            <span className="text-[9px] font-medium opacity-60">Global Credit Line</span>
                            ${parseFloat(card.limit).toLocaleString()} AUD
                          </div>
                          <div className="flex justify-between items-center mt-2 gap-2">
                             <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded py-1.5 flex items-center justify-center gap-1 transition-colors text-[9px] font-bold">
                               <svg viewBox="0 0 48 48" className="w-4 h-4"><path fill="#fff" d="M11 24.5h5v-3h-5zm0 6h5v-3h-5zm0 6h5v-3h-5zm0-18h5v-3h-5zm0-6h5v-3h-5zm16 24h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zm0-6h5v-3h-5zM27 30.5h-5v-3h5zm0 6h-5v-3h5zm0-18h-5v-3h5zm0-6h-5v-3h5zm0 24h-5v-3h5z"/></svg>
                               Apple Pay
                             </button>
                             <button className="flex-1 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded py-1.5 flex items-center justify-center gap-1 transition-colors text-[9px] font-bold">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" className="h-3" alt="GPay" />
                               Google Pay
                             </button>
                          </div>
                        </div>
                      </div>"""

content = content.replace(btn_old, btn_new)

with open('src/components/pay/RapidPay.tsx', 'w') as f:
    f.write(content)
