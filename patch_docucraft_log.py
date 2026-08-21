import re

with open("src/components/bank/DocuCraftAI.tsx", "r") as f:
    content = f.read()

# I will replace the static SmartContractAuditLog component with one that takes a prop or listens to a global event.
# Or better, I will maintain the log state inside DocuCraftAI and pass it as a prop.

new_log_component = """
function SmartContractAuditLog({ logs }: { logs: Array<{id: string, time: string, type: string, status: string, hash: string}> }) {
  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <h4 className="text-white font-black uppercase tracking-widest text-sm">Real-Time Smart Contract Audit Log</h4>
      </div>
      <div className="space-y-3">
        {logs.length === 0 && <div className="text-slate-500 font-mono text-xs text-center py-4">Waiting for execution...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
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

content = re.sub(r'function SmartContractAuditLog\(\) \{.*?\}(?=\nexport function DocuCraftAI)', new_log_component, content, flags=re.DOTALL)

# Add state to DocuCraftAI
state_addition = """export function DocuCraftAI({ onDocumentGenerated }: DocuCraftAIProps) {
  const [auditLogs, setAuditLogs] = useState<Array<{id: string, time: string, type: string, status: string, hash: string}>>([
    { id: 'TX-001', time: '14:02:01.004', type: 'PAYOUT_DEED', status: 'VERIFIED', hash: '0x3F8A...991B' }
  ]);"""

content = content.replace("export function DocuCraftAI({ onDocumentGenerated }: DocuCraftAIProps) {", state_addition)

# Update the log when generating
gen_addition = """    setTimeout(() => {
      setIsGenerating(false);
      
      // Update Audit Logs dynamically
      const newLog = {
        id: `TX-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        time: new Date().toISOString().split('T')[1].slice(0, 12),
        type: 'PAYOUT_DEED',
        status: 'VERIFIED',
        hash: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`
      };
      setAuditLogs(prev => [newLog, ...prev].slice(0, 5));
"""

content = content.replace("    setTimeout(() => {\n      setIsGenerating(false);", gen_addition)

# Render SmartContractAuditLog with logs
content = content.replace("<SmartContractAuditLog />", "<SmartContractAuditLog logs={auditLogs} />")


with open("src/components/bank/DocuCraftAI.tsx", "w") as f:
    f.write(content)
