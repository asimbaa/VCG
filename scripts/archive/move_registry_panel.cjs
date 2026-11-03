const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const metadataPanelRegex = /\{\/\* Route Metadata Panel \*\/\}[\s\S]*?(?=\{\/\* List of visible routes \*\/\}|<\/div>\s*<div className="absolute top-4 right-4 z-\[400\] flex flex-col)/;

let panelCode = '';
code = code.replace(/\{\/\* Route Metadata Panel \*\/\}[\s\S]*?(?=\{\/\* List of visible routes \*\/\}|<\/div>\s*<div className="absolute top-4 right-4 z-\[400\] flex flex-col)/, (match) => {
    // The panelCode is essentially the bottom-4 left-4 block
    panelCode = match;
    return ''; // Remove it from the old location
});

// Now we want to insert the Multi-Segment and Route Analysis logic into the top-right search interface.
// Wait, maybe we just replace the existing `selectedRouteIds.length > 0 &&` block in the search interface with the full logic from panelCode?
// panelCode contains:
// 1. `selectionMode && selectedRouteIds.length > 0 && (` block (Multi-Segment Route)
// 2. `selectedRouteIds.length === 1 && (` block (Route Analysis)
// But wait, the search interface ALREADY has `selectedRouteIds.length === 1 && (` (Elevation Profile).
// And the search interface has its own `{selectedRouteIds.length > 0 && (`.

// Let's manually craft the new registry summary block to go into the search interface.

const searchInterfaceTarget = `            {selectedRouteIds.length > 0 && (
              <div className="flex justify-between items-center w-full px-1 mb-1 border-b border-slate-700/50 pb-2">
                <div className="flex items-center gap-1 bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                  {selectedRouteIds.length} Selected
                </div>
                {selectedRouteIds.length === 1 && (
                  <button
                    onClick={() => handleReplayRoute(selectedRouteIds[0])}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[9px] uppercase font-bold"
                  >
                    <Play className="w-3 h-3" />{" "}
                    {replayingRouteId === selectedRouteIds[0]
                      ? "Stop Replay"
                      : "Replay Route"}
                  </button>
                )}
              </div>
            )}`;

const newRegistrySummary = `            {selectedRouteIds.length > 0 && (
              <div className="w-full flex flex-col gap-2 mb-2 border-b border-slate-700/50 pb-2">
                <div className="flex justify-between items-center w-full px-1">
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                    Registry Summary: {selectedRouteIds.length} Segments
                  </div>
                  {selectedRouteIds.length === 1 && (
                    <button
                      onClick={() => handleReplayRoute(selectedRouteIds[0])}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[9px] uppercase font-bold"
                    >
                      <Play className="w-3 h-3" />{" "}
                      {replayingRouteId === selectedRouteIds[0]
                        ? "Stop Replay"
                        : "Replay Route"}
                    </button>
                  )}
                </div>
                
                <div className="flex justify-between items-end px-1 mt-1">
                  <div>
                    <div className="text-xl font-black font-mono leading-none text-emerald-400">
                      {aggregateDistance} <span className="text-xs">km</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1 text-slate-400">
                      Aggregate Distance
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono leading-none text-amber-400">
                      {aggregateEta}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1 text-slate-400">
                      Est. Travel Time
                    </div>
                  </div>
                </div>

                {selectionMode && selectedRouteIds.length > 1 && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleMergeRoutes}
                      className="flex-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Merge className="w-3 h-3" /> Merge
                    </button>
                    <button
                      onClick={handleExportSelectedToKML}
                      className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> KML Export
                    </button>
                  </div>
                )}
                {selectionMode && selectedRouteIds.length === 1 && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleExportSelectedToKML}
                      className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white rounded py-1 text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> KML Export
                    </button>
                  </div>
                )}
              </div>
            )}`;

code = code.replace(searchInterfaceTarget, newRegistrySummary);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
