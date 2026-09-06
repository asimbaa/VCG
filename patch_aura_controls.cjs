const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Add more aggregate metrics
const targetAggregateDistance = `  const aggregateDistance = selectedRouteIds
    .reduce((acc, id) => {
      const r = routeSegments.find((rs) => rs.id === id);
      return acc + (r ? (r as any).numericDistance : 0);
    }, 0)
    .toFixed(1);`;

const replacementAggregateMetrics = `  const aggregateMetrics = selectedRouteIds.reduce((acc, id) => {
    const r = routeSegments.find((rs) => rs.id === id);
    if (!r) return acc;
    acc.distance += r.numericDistance || 0;
    
    // Parse ETA (e.g. "14 mins" or "1.5 hours")
    let mins = 0;
    if (r.eta) {
      const match = r.eta.match(/(\\d+(\\.\\d+)?)\\s*(min|hour)/i);
      if (match) {
        mins = parseFloat(match[1]) * (match[3].toLowerCase().startsWith('hour') ? 60 : 1);
      }
    }
    acc.etaMins += mins;
    return acc;
  }, { distance: 0, etaMins: 0 });
  const aggregateDistance = aggregateMetrics.distance.toFixed(1);
  const aggregateEta = aggregateMetrics.etaMins > 60 
    ? (aggregateMetrics.etaMins / 60).toFixed(1) + ' hrs' 
    : Math.round(aggregateMetrics.etaMins) + ' mins';`;

code = code.replace(targetAggregateDistance, replacementAggregateMetrics);

// Move the button
const buttonTarget1 = `<button
                    onClick={() => {
                      setSelectionMode(!selectionMode);
                      if (selectionMode) setSelectedRouteIds([]);
                    }}
                    className={\`flex-1 rounded-lg p-1.5 flex justify-center items-center gap-1 transition-colors text-[9px] font-black uppercase tracking-wider \${selectionMode ? "bg-amber-500 hover:bg-amber-400 text-slate-900" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}\`}
                  >
                    <MousePointer2 className="w-3 h-3" /> Select
                  </button>`;

code = code.replace(buttonTarget1, '');

const searchBarTarget = `<div className="flex items-center gap-2 w-full">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search routes or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
              />`;

const searchBarReplacement = `<div className="flex items-center gap-2 w-full">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search routes or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
              />
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedRouteIds([]);
                }}
                className={\`p-1.5 rounded transition-colors mr-1 \${selectionMode ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-slate-200"}\`}
                title="Selection Mode"
              >
                <MousePointer2 className="w-4 h-4" />
              </button>`;

code = code.replace(searchBarTarget, searchBarReplacement);

const aggregateUiTarget = `<div className="text-2xl font-black font-mono">
              {aggregateDistance} km
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold opacity-80">
              Aggregate Distance
            </div>`;
const aggregateUiReplacement = `<div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-black font-mono leading-none">
                  {aggregateDistance} <span className="text-sm">km</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1">
                  Total Distance
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black font-mono leading-none text-slate-800">
                  {aggregateEta}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-bold opacity-80 mt-1">
                  Est. Travel Time
                </div>
              </div>
            </div>`;

code = code.replace(aggregateUiTarget, aggregateUiReplacement);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
