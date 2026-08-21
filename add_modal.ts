import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

if (!content.includes('<NFCTapModal')) {
  content = content.replace(
    'return (\n    <div className="space-y-6">',
    `return (
    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={INITIAL_CARDS.filter(c => c.status === 'active')} 
        onPaymentComplete={(amt, merch) => {
          toast.success(\`NFC Payment completed: $\${amt} to \${merch}\`);
        }}
      />
      <div className="space-y-6">`
  );

  content = content.replace(
    '    </div>\n  );\n};',
    '    </div>\n    </>\n  );\n};'
  );
}

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
