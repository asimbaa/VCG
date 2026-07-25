import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

import_str = "import { VoiceInputButton } from '../shared/VoiceInputButton';\n"
if "VoiceInputButton" not in content:
    content = content.replace('import { HistoricalYieldComparison } from "./HistoricalYieldComparison";', import_str + 'import { HistoricalYieldComparison } from "./HistoricalYieldComparison";')

state_str = """  const [isTransferRefListening, setIsTransferRefListening] = useState(false);
  const [isPayrollRefListening, setIsPayrollRefListening] = useState(false);
"""
if "isTransferRefListening" not in content:
    content = content.replace("  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false);", "  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false);\n" + state_str)

# Reference / Description input:
target1 = """                    <input
                      type="text"
                      placeholder="e.g. Asset Purchase #9948"
                      value={transferData.reference}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          reference: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />"""

replace1 = """                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Asset Purchase #9948"
                        value={transferData.reference}
                        onChange={(e) =>
                          setTransferData({
                            ...transferData,
                            reference: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-12 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInputButton 
                          isListening={isTransferRefListening}
                          setIsListening={setIsTransferRefListening}
                          onTranscript={(text) => setTransferData({ ...transferData, reference: (transferData.reference ? transferData.reference + ' ' + text : text) })}
                        />
                      </div>
                    </div>"""

if "isTransferRefListening" not in content or "VoiceInputButton" in content:
    content = content.replace(target1, replace1)


with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)
