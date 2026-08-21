import re

with open('src/components/bank/DocuCraftAI.tsx', 'r') as f:
    content = f.read()

audit_log = """

function SmartContractAuditLog() {
  const logs = [
    { id: 'TX-001', time: '14:02:01.004', type: 'PAYOUT_DEED', status: 'VERIFIED', hash: '0x3F8A...991B' },
    { id: 'TX-002', time: '14:02:15.820', type: 'SMART_ESCROW', status: 'VERIFIED', hash: '0x992B...A104' },
    { id: 'TX-003', time: '14:03:42.115', type: 'TREASURY_SETTLE', status: 'VERIFIED', hash: '0x1A4C...77F3' },
  ];

  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <h4 className="text-white font-black uppercase tracking-widest text-sm">Real-Time Smart Contract Audit Log</h4>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-mono text-xs">{log.time}</span>
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">{log.type}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 font-mono text-xs">{log.hash}</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

content = content.replace("export function DocuCraftAI", audit_log + "\nexport function DocuCraftAI")

content = content.replace("</div>\n         </div>\n      </div>\n    </div>", "</div>\n         </div>\n      </div>\n      <SmartContractAuditLog />\n    </div>")

with open('src/components/bank/DocuCraftAI.tsx', 'w') as f:
    f.write(content)
