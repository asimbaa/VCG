import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/WebsiteDeployments.tsx', 'utf-8');

if (!content.includes('valouriancapital.io')) {
  content = content.replace(
    'const websites = [',
    `const [dnsConfig, setDnsConfig] = useState(false);
  const [sslVerify, setSslVerify] = useState(false);
  const [prodSanitize, setProdSanitize] = useState(false);

  const websites = [`
  );

  content = content.replace(
    '{ domain: "valourian.com.au"',
    `{
      domain: "valouriancapital.io",
      name: "Valourian Capital IO",
      status: "PENDING_DEPLOYMENT",
      type: "Global Sovereign Applet",
      encryption: "Pending TLS 1.3",
      visitors: "0/hr",
      server: "Global Edge Network"
    },
    { domain: "valourian.com.au"`
  );
  
  content = content.replace(
    'return (',
    `return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Server className="w-32 h-32 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-400" />
            valouriancapital.io Deployment Readiness
          </h2>
          <div className="space-y-3 relative z-10 max-w-2xl">
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input type="checkbox" checked={dnsConfig} onChange={(e) => setDnsConfig(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Domain DNS Configuration</div>
                <div className="text-xs text-slate-400">Map A/AAAA and CNAME records to Sovereign Cluster.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input type="checkbox" checked={sslVerify} onChange={(e) => setSslVerify(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">SSL Certificate Verification</div>
                <div className="text-xs text-slate-400">Deploy TLS 1.3 Quantum-Safe certs via Global Edge.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input type="checkbox" checked={prodSanitize} onChange={(e) => setProdSanitize(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Production Environment Sanitization</div>
                <div className="text-xs text-slate-400">Clear test tokens, isolate prod database, enforce security rules.</div>
              </div>
            </label>
            
            <button 
              disabled={!(dnsConfig && sslVerify && prodSanitize)}
              className="mt-4 w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
            >
              Execute Final Deployment Pipeline
            </button>
          </div>
        </div>
        `
  );
  
  const lastReturnDiv = content.lastIndexOf('</div>\n    );');
  if (lastReturnDiv !== -1) {
    content = content.slice(0, lastReturnDiv) + '</div>\n' + content.slice(lastReturnDiv);
  }
}

fs.writeFileSync('src/components/bank/WebsiteDeployments.tsx', content);
