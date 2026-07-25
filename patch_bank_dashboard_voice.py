import re

with open('src/components/bank/BankDashboard.tsx', 'r') as f:
    content = f.read()

import_str = "import { VoiceInputButton } from '../shared/VoiceInputButton';\n"
if "VoiceInputButton" not in content:
    content = content.replace('import { HistoricalYieldComparison } from "./HistoricalYieldComparison";', import_str + 'import { HistoricalYieldComparison } from "./HistoricalYieldComparison";')

state_str = """  const [isGlobalSearchListening, setIsGlobalSearchListening] = useState(false);
  const [isCommandSearchListening, setIsCommandSearchListening] = useState(false);
"""
if "isGlobalSearchListening" not in content:
    content = content.replace("  const [globalSearchQuery, setGlobalSearchQuery] = useState('');", "  const [globalSearchQuery, setGlobalSearchQuery] = useState('');\n" + state_str)


# Global search input: 
target1 = """              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-10 text-white font-medium text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {globalSearchQuery && ("""

replace1 = """              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-16 text-white font-medium text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className={`absolute inset-y-0 right-0 flex items-center ${globalSearchQuery ? 'pr-10' : 'pr-3'}`}>
              <VoiceInputButton 
                isListening={isGlobalSearchListening}
                setIsListening={setIsGlobalSearchListening}
                onTranscript={(text) => { setGlobalSearchQuery((prev) => prev ? prev + ' ' + text : text); setShowGlobalSearchResults(true); }}
              />
            </div>
            {globalSearchQuery && ("""

if "isGlobalSearchListening" not in content or "VoiceInputButton" in content:
    content = content.replace(target1, replace1)


# Command search input:
target2 = """                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search or [Alt+P] Commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}"""

replace2 = """                <VoiceInputButton 
                  isListening={isCommandSearchListening}
                  setIsListening={setIsCommandSearchListening}
                  onTranscript={(text) => setSearchQuery((prev) => prev ? prev + ' ' + text : text)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search or [Alt+P] Commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}"""

content = content.replace(target2, replace2)

with open('src/components/bank/BankDashboard.tsx', 'w') as f:
    f.write(content)
