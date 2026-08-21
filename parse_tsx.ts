import * as fs from 'fs';
['src/components/bank/DeliveryMap.tsx', 'src/components/bank/UberEatsApp.tsx'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf-8');
  const regex = /\.\s*x\b/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(content.length, match.index + 30);
    console.log(`[${file}] Match at ${match.index}: ${content.substring(start, end).replace(/\n/g, ' ')}`);
  }
});
