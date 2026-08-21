import * as fs from 'fs';
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

if (!content.includes('import { NFCTapModal }')) {
  content = content.replace(
    'import { AIGuide } from "../AIGuide";',
    'import { AIGuide } from "../AIGuide";\nimport { NFCTapModal } from "./NFCTapModal";'
  );
}

if (!content.includes('isNfcModalOpen')) {
  content = content.replace(
    'const [transferType, setTransferType] = useState<"standard"',
    'const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);\n  const [transferType, setTransferType] = useState<"standard"'
  );
  
  // Replace the return to include modal
  content = content.replace(
    'return (\n    <div className="max-w-6xl mx-auto flex flex-col gap-8">',
    `return (
    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={bsbLinkedCards} 
        onPaymentComplete={(amt, merch) => {
          toast.success(\`RapidPay NFC completed: \$\${amt} to \${merch}\`);
        }}
      />
      <div className="max-w-6xl mx-auto flex flex-col gap-8">`
  );
  
  // Close the fragment at the end
  const lines = content.split('\n');
  let i = lines.length - 1;
  while (i >= 0 && !lines[i].includes('  );')) {
    i--;
  }
  if (i >= 0) {
    lines[i] = '    </div>\n    </>\n  );';
    content = lines.join('\n');
  }
}

// Add the Tap & Pay button if not added
if (!content.includes('() => setIsNfcModalOpen(true)')) {
  content = content.replace(
    '<button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Settings">',
    `<button onClick={() => setIsNfcModalOpen(true)} className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2" title="Tap and Pay"><Smartphone className="w-5 h-5"/> Tap & Pay</button>\n          <button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Settings">`
  );
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
