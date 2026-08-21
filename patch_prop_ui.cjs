const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Also display the amenities if available
if (!file.includes('prop.amenities')) {
    file = file.replace(/<p className="text-xs text-slate-400 truncate mb-4">\s*\{prop\.address[\s\S]*?<\/p>/, 
        `$&
                            {prop.amenities && (
                                <p className="text-[10px] text-emerald-400/80 mb-2 font-mono line-clamp-3 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">{prop.amenities}</p>
                            )}`
    );
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
    console.log("Prop UI patched.");
}
