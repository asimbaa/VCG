const fs = require('fs');

const path = './src/components/bank/WorkspaceMail.tsx';
let content = fs.readFileSync(path, 'utf8');

const getDocContentInjection = `
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Valourian Standard Document</h1>
                    <p className="text-[10px] text-slate-500 font-bold">SOVEREIGN ENCRYPTED DOCUMENT • READ ONLY</p>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-lg font-bold underline mb-4">{name.toUpperCase().replace('.PDF', '')}</h2>
                <p className="text-sm leading-relaxed mb-6 font-mono bg-slate-50 p-6 rounded-xl border border-slate-200">
                    Document verified by AURA-9. 
                    Please click "Download PDF" to generate the final high-resolution certificate.
                </p>
            </div>
        </div>
    );
`;

content = content.replace(/    return \(\s*<div className="flex flex-col items-center justify-center p-12 text-slate-400">\s*<FileText className="w-16 h-16 mb-4 text-slate-300" \/>\s*<p>Standard Document Preview<\/p>\s*<p className="text-xs">Click Download PDF for high-fidelity render<\/p>\s*<\/div>\s*\);/g, getDocContentInjection);

// If the generic fallback wasn't there exactly like that, let's just append it to the end of the getDocContent function
if(!content.includes("Valourian Standard Document")) {
   // find the end of getDocContent.
   content = content.replace(/                <\/div>\s*<\/div>\s*\);\s*}\s*return \(\s*<div className="flex flex-col items-center justify-center p-12 text-slate-400">/s, `                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Valourian Standard Document</h1>
                    <p className="text-[10px] text-slate-500 font-bold">SOVEREIGN ENCRYPTED DOCUMENT • READ ONLY</p>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-lg font-bold underline mb-4">{name.toUpperCase().replace('.PDF', '')}</h2>
                <p className="text-sm leading-relaxed mb-6 font-mono bg-slate-50 p-6 rounded-xl border border-slate-200">
                    Document verified by AURA-9. 
                    Please click "Download PDF" to generate the final high-resolution certificate.
                </p>
            </div>
        </div>
    );
`);
}

fs.writeFileSync(path, content);
console.log("Fixed WorkspaceMail fallback");
