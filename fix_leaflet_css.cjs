const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Add style tag for smooth stroke transitions
const wrapperMatch = /<div className="relative w-full h-\[60vh\] md:h-\[800px\] min-h-\[400px\] bg-slate-950 overflow-hidden font-sans border border-slate-800 rounded-xl md:rounded-2xl shadow-2xl transform-gpu">/;
const replacement = `<style>{\`
        .leaflet-overlay-pane path.leaflet-interactive {
           transition: stroke-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease, opacity 0.4s ease;
        }
      \`}</style>
      <div className="relative w-full h-[60vh] md:h-[800px] min-h-[400px] bg-slate-950 overflow-hidden font-sans border border-slate-800 rounded-xl md:rounded-2xl shadow-2xl transform-gpu">`;

content = content.replace(wrapperMatch, replacement);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
