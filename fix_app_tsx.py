with open("src/App.tsx", "r") as f:
    content = f.read()

bad_str = """                <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="hidden xl:inline">Torrens Matrix: </span>
                <span className="flex items-center gap-1">
                  {torrensSyncState === 'synced' ? (
                    <>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                       SYNCED
                    </>
                  ) : (
                    <>
                       <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                       EXPORTING...
                    </>
                  )}
                </span>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  Force Batch Export
                </button>
              </div>"""

good_str = """                <div className="flex items-center gap-4">"""

content = content.replace(bad_str, good_str)
# It might replace both, so I will do the first one again.
header_ui = """            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="hidden xl:inline">Torrens Matrix: </span>
                <span className="flex items-center gap-1">
                  {torrensSyncState === 'synced' ? (
                    <>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                       SYNCED
                    </>
                  ) : (
                    <>
                       <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                       EXPORTING...
                    </>
                  )}
                </span>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  Force Batch Export
                </button>
              </div>"""
content = content.replace('            <div className="flex items-center gap-4">', header_ui, 1)

with open("src/App.tsx", "w") as f:
    f.write(content)

