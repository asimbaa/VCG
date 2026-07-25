import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

deep_research_ui = """
                {/* BigQuery Deep Research Enhanced Treasury Header */}
                <div className="bg-indigo-950 rounded-[3rem] p-8 border border-indigo-500/30 text-white relative overflow-hidden group mb-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] group-hover:bg-indigo-500/30 transition-colors pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="p-4 bg-indigo-900/50 rounded-3xl border border-indigo-400/20 shadow-inner">
                        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">BigQuery Deep Research Boost</h4>
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30">
                            Active Sync
                          </span>
                        </div>
                        <p className="text-sm text-indigo-300/80 leading-relaxed max-w-xl font-medium">
                          Treasury operations are now enhanced with BigQuery Deep Research, providing real-time AI heuristics on global sovereign asset valuations, liquidity constraints, and inter-bank conversion rates instantly.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 bg-indigo-900/30 p-4 rounded-2xl border border-indigo-500/20">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Base Treasury Currency</span>
                      <CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} />
                    </div>
                  </div>
                </div>

                <TreasuryGrowthChart />"""

content = content.replace("<TreasuryGrowthChart />", deep_research_ui)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
