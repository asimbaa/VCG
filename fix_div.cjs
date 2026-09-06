const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Replace the stray </div> right before <div className="absolute top-4 right-4 z-[400] flex flex-col
code = code.replace(/<\/div>\s*<div className="absolute top-4 right-4 z-\[400\] flex flex-col gap-2 items-end pointer-events-none">/, '<div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end pointer-events-none">');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
