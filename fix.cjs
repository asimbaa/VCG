const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const badIndex = code.indexOf('type="text" x\xef\xbf\xbd');
if (badIndex === -1) {
    console.log("Could not find the start of the bad index. Searching for type=\"text\" around line 11946");
    const lines = code.split('\n');
    let badLineIdx = -1;
    for(let i=11940; i<11950; i++) {
        if (lines[i] && lines[i].includes('type="text"')) {
            badLineIdx = i;
            break;
        }
    }
    if (badLineIdx !== -1) {
        code = lines.slice(0, badLineIdx+1).join('\n');
    }
}

code += `
                            placeholder="40000000"
                            className="w-full bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white h-10 px-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-colors mt-2">
                        Allocate Sponsor Range
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
