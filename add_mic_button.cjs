const fs = require('fs');

const path = './src/components/docucraft/DocuCraft.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "                />";
const buttonInjection = `                />
                
                <button
                  type="button"
                  onClick={toggleListening}
                  className={\`absolute right-3 bottom-3 p-2 rounded-xl transition-all shadow-sm flex items-center justify-center \${
                    isListening
                      ? "bg-rose-100 text-rose-600 animate-pulse border border-rose-200"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                  }\`}
                  title={isListening ? "Stop Neural Link Mic" : "Start Neural Link Voice Dictation"}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>`;

content = content.replace(targetStr, buttonInjection);

fs.writeFileSync(path, content);
console.log("Mic button added.");
