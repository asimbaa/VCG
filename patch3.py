import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

pattern = re.compile(r'\s*\)\s*:\s*\(\s*/\*\s*Original Internal Ledger Transfer.*?</form>\s*</div>\s*</div>\s*\)', re.DOTALL)

replacement = """      ) : transferType === 'standard' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Internal Ledger Transfer
            </h3>
            <form onSubmit={handleSendRequest} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Recipient Wallet or Email
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-800 font-semibold"
                  placeholder="e.g. Acme Corp or john@example.com"
                  disabled={status !== "idle"}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-3 pl-8 px-4 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-800 font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Transfer Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-slate-500 transition-colors text-slate-800 font-medium"
                  placeholder="What is this for?"
                />
              </div>
              <button
                type="submit"
                disabled={status === "processing"}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {status === "processing" ? "Processing..." : "Transfer Funds"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
             <h4 className="text-slate-800 font-bold mb-4">Instant Settlement</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">Internal ledger transfers are fully settled within milliseconds. Both parties immediately see the transaction reflected on their balances without intermediary clearing delays.</p>
             <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white p-4 rounded-xl border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                No Fees. Zero Delays.
             </div>
          </div>
        </div>
      ) : transferType === 'au_bsb' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600" />
              International SWIFT & RTGS
            </h3>
            <form onSubmit={handleSendRequest} className="space-y-5">
              {!isValidated ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        BSB / Routing Number
                      </label>
                      <input
                        type="text"
                        value={bsb}
                        onChange={(e) => setBsb(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                        placeholder="000-000"
                        disabled={status === "validating"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                        placeholder="12345678"
                        disabled={status === "validating"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      SWIFT Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                      placeholder="ABCDEFGH"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={status === "validating" || !bsb || !accountNumber}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
                  >
                    {status === "validating" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} 
                    {status === "validating" ? "Validating Route..." : "Validate Route"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Landmark className="w-16 h-16 text-blue-500" /></div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Route Verified</span>
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-800">{accountName || "Validated Account"}</div>
                       <div className="text-xs text-slate-500 font-mono mt-1">BSB: {bsb} • ACC: {accountNumber}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-medium"
                      placeholder="e.g. Invoice 12345"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsValidated(false)} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors">Edit Route</button>
                    <button
                      type="submit"
                      disabled={!amount}
                      className="w-2/3 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                       Review Transfer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
             <h4 className="text-slate-800 font-bold mb-4">SWIFT / RTGS Connectivity</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">Cross-border and domestic high-value clearing connects directly through institutional rails. The Valourian Treasury Node will clear these funds with priority sequencing.</p>
             <div className="space-y-3">
               <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Global Clearing Network
               </div>
               <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Institutional Traceability
               </div>
             </div>
          </div>
        </div>
      ) : transferType === 'payid' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Real-Time Settlement (NPP)
            </h3>
            <form onSubmit={handleSendRequest} className="space-y-5">
              {!isValidated ? (
                <>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar">
                    {(['phone', 'email', 'abn', 'organization'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setPayIdType(type); setPayIdValue(""); }}
                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${payIdType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200/50'}`}
                      >
                        {type === 'organization' ? 'Org ID' : type}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      {payIdType.toUpperCase()} Address
                    </label>
                    <input
                      type={payIdType === 'email' ? 'email' : 'text'}
                      value={payIdValue}
                      onChange={(e) => setPayIdValue(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                      placeholder={payIdType === 'phone' ? '04XX XXX XXX' : payIdType === 'email' ? 'name@example.com' : 'Enter ID'}
                      disabled={status === "validating"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={status === "validating" || !payIdValue}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20 mt-4 flex items-center justify-center gap-2"
                  >
                    {status === "validating" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                    {status === "validating" ? "Resolving PayID..." : "Validate PayID"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles className="w-16 h-16 text-indigo-500" /></div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PayID Resolved</span>
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-800">{accountName || "Validated Account"}</div>
                       <div className="text-xs text-slate-500 font-mono mt-1">{payIdValue}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800 font-bold"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Osko Reference
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-medium"
                      placeholder="280 characters max"
                      maxLength={280}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsValidated(false)} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors">Edit PayID</button>
                    <button
                      type="submit"
                      disabled={!amount}
                      className="w-2/3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                       Review Transfer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col">
             <h4 className="text-slate-800 font-bold mb-4">New Payments Platform (NPP)</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">Experience 24/7 real-time settlement via Osko. PayID routes are instantaneously resolved against the centralized RBA clearing directory.</p>
             <div className="mt-auto space-y-4">
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <span>Clearing Status</span>
                   <span className="text-emerald-500">Online & Fast</span>
                </div>
             </div>
          </div>
        </div>
      ) : null"""

new_content, count = pattern.subn(replacement, content)

if count > 0:
    print(f"Replaced {count} instances.")
    with open("src/components/pay/RapidPay.tsx", "w") as f:
        f.write(new_content)
else:
    print("Not found")

