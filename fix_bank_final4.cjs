const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

// replace everything after </AnimatePresence> to the end of the file
const start = content.indexOf('      </AnimatePresence>');
const goodEnd = `      </AnimatePresence>
      <DashboardFooter onTerminalOpen={() => setShowTerminal(true)} />
    </div>
    </>
  );
}

const DashboardFooter = ({
  onTerminalOpen,
}: {
  onTerminalOpen: () => void;
}) => (
  <footer className="mt-20 py-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto px-6">
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
      <button
        onClick={onTerminalOpen}
        className="group relative flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-2xl hover:shadow-blue-500/10 active:scale-95 border border-slate-800"
      >
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-mono text-sm font-black shadow-inner border border-white/20">
          &gt;_
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 leading-none mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> SOVEREIGN CORE
          </div>
          <div className="text-sm font-black text-white leading-none tracking-tight">
            AI MAX MAGIC TERMINAL
          </div>
        </div>
      </button>

      <div className="h-10 w-px bg-slate-200 hidden lg:block" />

      <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
        {[
          "Founder Privacy",
          "Settlement Protocol",
          "Neural Status: Active",
          "Portfolio: $100B+",
        ].map((link) => (
          <button
            key={link}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            {link}
          </button>
        ))}
      </div>
    </div>

    <div className="text-center md:text-right">
      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-end gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Sovereign OS v9.42-Stable-Lush
      </div>
      <div className="text-sm font-black text-slate-900 tracking-tighter">
        © 2026 VALOURIAN CAPITAL • ASIM ARYAL
      </div>
    </div>
  </footer>
);
`;

content = content.slice(0, start) + goodEnd;
fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
