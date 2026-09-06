const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf8');

const replaceTitle = `<div className="flex flex-col mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Valourian Black Cards & Manufacturing
              </h2>
              <div className="flex items-center gap-2 mt-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> God Mode: Mr. Asim Aryal</span>
                  <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1"><Zap className="w-3 h-3"/> Outsourced Manufacturing: Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">`;

content = content.replace(/<div className="flex justify-between items-center mb-6">[\s\S]*?Global Card Management & Tokenization\s*<\/h2>\s*<div className="flex items-center gap-2">/, replaceTitle);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
