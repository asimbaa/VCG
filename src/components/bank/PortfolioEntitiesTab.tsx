import React from 'react';
import { Building2, Globe, ShieldCheck, MapPin, Hash, Briefcase, ChevronRight, Lock } from 'lucide-react';

export function PortfolioEntitiesTab() {
  const entities = [
    {
      name: "Valourian Capital Pty Ltd",
      type: "Holding Company & Regional HQ",
      region: "Australia (APAC)",
      duns: "74-510-4321",
      status: "Active - Good Standing",
      established: "2023",
      address: "100 Barangaroo Avenue, Sydney NSW 2000",
      description: "Primary regional holding entity for APAC operations, real estate, and treasury allocations.",
      core: true
    },
    {
      name: "Valourian Capital Inc.",
      type: "Global Treasury & Asset Management",
      region: "United States (Global)",
      duns: "08-142-9982",
      status: "Active - Sovereign Authority",
      established: "2023",
      address: "One World Trade Center, Suite 4500, New York, NY 10007",
      description: "Global apex entity controlling all subsidiary treasuries, Sovereign AI Core, and cross-border M&A.",
      core: true
    },
    {
      name: "DocuCraft Technologies",
      type: "B2B SaaS & AI Infrastructure",
      region: "Global Distributed",
      duns: "11-442-7763",
      status: "Active - High Growth",
      established: "2024",
      address: "2 Herbert St, St Leonards NSW 2065",
      description: "Enterprise document generation and LLM-powered institutional reporting infrastructure.",
      core: false
    },
    {
      name: "Valourian Logistics Fleet",
      type: "Supply Chain & Physical Security",
      region: "Global",
      duns: "99-311-2244",
      status: "Active - Fleet Deployed",
      established: "2024",
      address: "Global Fleet (Mobile HQ)",
      description: "Autonomous routing, high-value asset transport, and private executive logistics.",
      core: false
    },
    {
      name: "Sovereign Payment Gateways",
      type: "Financial Infrastructure",
      region: "Switzerland & UAE",
      duns: "42-881-0091",
      status: "Active - Audited",
      established: "2025",
      address: "Dubai International Financial Centre (DIFC), Dubai",
      description: "Crypto-to-Fiat high speed routing, merchant BIN issuance, and Treasury multi-sig ledgers.",
      core: false
    }
  ];

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-500" />
          Global Portfolio & Entities
        </h2>
        <p className="text-slate-400 mt-2">Immutable registry of active holding companies, subsidiaries, and validated D-U-N-S® identifiers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {entities.map((entity, idx) => (
          <div key={idx} className={`bg-slate-900 border rounded-2xl p-6 shadow-xl ${entity.core ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-800'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xl font-black text-white">{entity.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1 text-indigo-400"><Briefcase className="w-4 h-4" /> {entity.type}</span>
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {entity.region}</span>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
                <Hash className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">D-U-N-S® Number</div>
                  <div className="text-lg font-mono font-black text-emerald-400">{entity.duns}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Address</div>
                <div className="text-sm text-slate-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> {entity.address}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status</div>
                <div className="text-sm text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> {entity.status}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <p className="text-sm text-slate-400 leading-relaxed">{entity.description}</p>
            </div>
            
            {entity.core && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold w-fit">
                <Lock className="w-3 h-3" /> Apex Treasury Authority
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
