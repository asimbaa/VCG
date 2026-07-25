const fs = require('fs');

const path = './src/components/bank/WorkspaceMail.tsx';
let content = fs.readFileSync(path, 'utf8');

const getDocContentInjection = `    if (name.includes("guide") || name.includes("clearance") || name.includes("manifest")) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Valourian Document Viewer</h1>
                        <p className="text-[10px] text-slate-500 font-bold">SOVEREIGN ENCRYPTED DOCUMENT • READ ONLY</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-lg font-bold underline mb-4">{name.toUpperCase().replace('.PDF', '')}</h2>
                    <p className="text-sm leading-relaxed mb-6 font-mono bg-slate-50 p-6 rounded-xl border border-slate-200">
                        This document has been decrypted successfully by AURA-9. 
                        It is part of the sovereign data vault of Asim Aryal.
                        Please download the PDF to view the high-fidelity render.
                        <br/><br/>
                        <b>Subject Data:</b> Verified operational clearance, DNS protocols, and Valourian master keys.
                    </p>
                </div>
            </div>
        );
    }
`;

content = content.replace('    if (name.includes("tesla") || name.includes("fleet") || name.includes("vin")) {', getDocContentInjection + '    if (name.includes("tesla") || name.includes("fleet") || name.includes("vin")) {');

fs.writeFileSync(path, content);
console.log("Fixed WorkspaceMail");
