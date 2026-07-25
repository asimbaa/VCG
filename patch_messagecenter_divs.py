with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    content = f.read()

target = """            </button>
          </div>
          </div>
          
          <div className="mt-4 relative">
             <input 
               type="text" 
               placeholder="Search documents..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-indigo-500"
             />
             <VoiceInputButton 
               isListening={isSearchListening}
               setIsListening={setIsSearchListening}
               onTranscript={(text) => setSearchQuery((prev) => prev ? prev + ' ' + text : text)}
               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
             />
          </div>
        </div>"""

replace = """            </button>
          </div>
          
          <div className="mt-6 relative">
             <input 
               type="text" 
               placeholder="Search documents..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-indigo-500"
             />
             <VoiceInputButton 
               isListening={isSearchListening}
               setIsListening={setIsSearchListening}
               onTranscript={(text) => setSearchQuery((prev) => prev ? prev + ' ' + text : text)}
               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
             />
          </div>
        </div>"""

with open('src/components/messagecenter/MessageCenter.tsx', 'w') as f:
    f.write(content.replace(target, replace))
