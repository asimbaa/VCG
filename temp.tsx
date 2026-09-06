                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Column 1: Hardware Security Module (HSM) Status */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Hardware Security Module</span>
                        </div>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">FIPS Standard</span>
                          <span className="text-[10px] text-emerald-450 font-mono font-black uppercase tracking-wider">
                            {hsmStatus?.hsm?.fipsLevel || "FIPS 140-2 L4"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Tamper Detection</span>
                          <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            ACTIVE
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Multi-Officer Keys</span>
                          <span className="text-[10px] text-slate-200 font-mono font-black bg-slate-800 px-2 py-0.5 rounded">
                            {hsmStatus?.hsm?.securityOfficerKeysPresent || 3} / 3 Online
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Sovereign Encryption Standard */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4 font-sans text-left">
                      <div className="flex items-center gap-2 text-slate-350 border-b border-slate-800/60 pb-3">
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Sovereign Vault Cipher</span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40 text-left">
                          <label className="text-[8px] text-slate-400 font-black uppercase tracking-wider block mb-1">Active HSM Key Checksum</label>
                          <div className="text-[11px] font-mono font-extrabold text-[#7c8fff] truncate tracking-normal bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {hsmStatus?.hsm?.masterKeyChecksum || "HMAC-SHA256-0x7F2A9B8D"}
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Last Rotation Date</span>
                          <span className="text-[9px] text-slate-300 font-mono">
                            {hsmStatus?.hsm?.lastRotation ? new Date(hsmStatus.hsm.lastRotation).toLocaleDateString() : "30 days ago"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">PCI Compli Flag</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest">
                            {hsmStatus?.pciAuditFlag || "COMPLIANT-PASS"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Token Vault Maps */}
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center gap-2 text-slate-350 border-b border-slate-800/60 pb-3">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">Vault Partition Map</span>
                      </div>

                      <div className="space-y-3 text-left">
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Active PAN Proxy mappings</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black font-mono text-white">
                              {hsmStatus?.partitionCount ?? digitalCards.length}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Dynamic Targets</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
                          Sovereign tokenization partitions actual credential PAN records dynamically. Interconnected merchants (such as Uber/Booking) execute clearance routes securely through anonymous proxy tokens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategic Roadmap Step 3: Card Issuer Schemes UI Section */}
                <div className="bg-slate-905 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mt-6 text-left">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-505/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Workflow className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Roadmap Step 3
                          </span>
                          <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-505/20">
                            ACTIVATED - LIVE INTEGRATION
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-wider mt-1.5">
                          Card Issuer Schemes & BIN Range Allocator
                        </h4>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 max-w-xs font-medium leading-relaxed italic text-right">
                      Interoperable 16-digit debit/credit PANs fully compatible with ISO 8583 configurations in EU/US/UK/AU fields.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {/* Left Panel: Allocate custom sponsor BIN range on active networks */}
                    <div className="space-y-4">
                      <div className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1">
                        <span>Sponsor Range Configuration Panel</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[8px] text-slate-400 font-black uppercase tracking-widest block mb-1">Payment Scheme</label>
                          <select
                            value={binScheme}
                            onChange={(e) => setBinScheme(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white h-10 px-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="VISA">VISA (Infinite Tiers)</option>
                            <option value="MASTERCARD">MASTERCARD (World Elite Tiers)</option>
                            <option value="AMEX">AMEX (Centurion Core Tiers)</option>
                            <option value="SOVEREIGN">SOVEREIGN CORE (Treasury Ledger)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] text-slate-400 font-black uppercase tracking-widest block mb-1">8-Digit BIN Prefix</label>
                          <input
                            type="text"
