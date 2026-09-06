const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

code = code.replace(/    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-\[2\.5rem\]">\n      <div className="absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 w-full h-full border-\[1px\] border-emerald-500\/10 rounded-full animate-\[spin_10s_linear_infinite\]" \/>\n      <div className="absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 w-3\/4 h-3\/4 border-\[1px\] border-emerald-500\/20 rounded-full animate-\[spin_15s_linear_infinite_reverse\]" \/>\n  \);\n\};/, `    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-[1px] border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
    </div>
  );
};`);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
