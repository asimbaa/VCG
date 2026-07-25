const fs = require('fs');
const files = [
  'src/components/bank/BankDashboard.tsx',
  'src/components/bank/AuraDriveMap.tsx',
  'src/components/bank/DeliveryMap.tsx',
  'src/components/bank/SovereignStore.tsx',
  'src/components/bank/SovereignAI.tsx',
  'src/components/bank/ValourianDashboard.tsx',
  'src/components/bank/UberEatsApp.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace transition={{ ... }} with transition={{ type: "tween", ... }}
  // Match transition={{ starting bracket, then anything, but don't add type: "tween" if it already exists
  code = code.replace(/transition=\{\{\s*(?!.*type:\s*['"]tween['"])/g, 'transition={{ type: "tween", ');

  // For animate={{ something: [a, b, c] }} where there's NO transition=
  // We need to inject transition={{ type: "tween", duration: 2, repeat: Infinity }}
  // A bit risky with regex, so let's do something simpler:
  // Find animate={{ scale: [1, 1.1, 1] }}
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.1,\s*1\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.1, 1] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*y:\s*\[0,\s*-10,\s*0\]\s*\}\}(?!.*transition=)/g, 'animate={{ y: [0, -10, 0] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*y:\s*\[0,\s*10,\s*0\]\s*\}\}(?!.*transition=)/g, 'animate={{ y: [0, 10, 0] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*x:\s*\["-100%",\s*"200%"\]\s*\}\}(?!.*transition=)/g, 'animate={{ x: ["-100%", "200%"] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*x:\s*\["-100%",\s*"100%"\]\s*\}\}(?!.*transition=)/g, 'animate={{ x: ["-100%", "100%"] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*4,\s*opacity:\s*\[0,\s*0\.5,\s*0\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: 4, opacity: [0, 0.5, 0] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*2,\s*1\],\s*opacity:\s*\[0\.8,\s*0,\s*0\.8\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[0\.9,\s*1\.1,\s*0\.9\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.4,\s*1\],\s*rotate:\s*\[0,\s*-10,\s*10,\s*0\],\s*opacity:\s*1\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.4, 1], rotate: [0, -10, 10, 0], opacity: 1 }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.2,\s*1\],\s*opacity:\s*\[0\.5,\s*1,\s*0\.5\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.5\],\s*opacity:\s*\[1,\s*0\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.2\],\s*opacity:\s*\[1,\s*0\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.2], opacity: [1, 0] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.5,\s*1\],\s*opacity:\s*1\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.5, 1], opacity: 1 }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*top:\s*\["0%",\s*"100%",\s*"0%"\]\s*\}\}(?!.*transition=)/g, 'animate={{ top: ["0%", "100%", "0%"] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*scale:\s*\[1,\s*1\.6,\s*1\],\s*opacity:\s*\[0\.4,\s*0,\s*0\.4\]\s*\}\}(?!.*transition=)/g, 'animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');
  code = code.replace(/animate=\{\{\s*height:\s*isMuted\s*\?\s*4\s*:\s*\[6,\s*16,\s*6\]\s*\}\}(?!.*transition=)/g, 'animate={{ height: isMuted ? 4 : [6, 16, 6] }} transition={{ type: "tween", duration: 2, repeat: Infinity }}');

  fs.writeFileSync(file, code);
}
