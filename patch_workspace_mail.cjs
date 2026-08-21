const fs = require('fs');
let file = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

if (!file.includes('getEmailQueueStatus') && file.includes('import { sendWorkspaceEmail }')) {
    file = file.replace('import { sendWorkspaceEmail }', 'import { sendWorkspaceEmail, getEmailQueueStatus, retryFailedEmails }');
    
    const queueUI = `
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-300">Outbox Queue: {getEmailQueueStatus().length} pending</span>
            </div>
            <button onClick={() => {
                if (retryFailedEmails()) toast.success("Retrying SMTP queue...");
                else toast.info("Queue is empty or currently processing.");
            }} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition-colors">
                Retry Failed
            </button>
        </div>
    `;
    
    file = file.replace('<div className="space-y-4">', queueUI + '<div className="space-y-4">');
    fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', file);
    console.log("WorkspaceMail queue UI added.");
}
