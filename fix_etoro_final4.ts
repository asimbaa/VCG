import * as fs from 'fs';

let etoro = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');
etoro = etoro.replace("useState<'portfolio' | 'trade' | 'funding'>('portfolio');", "useState<string>('portfolio');");
fs.writeFileSync('src/components/bank/EToroApp.tsx', etoro);

let valourian = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
valourian = valourian.replace(/newTxnRef\.id/g, "(newTxnRef as any).id");
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', valourian);
