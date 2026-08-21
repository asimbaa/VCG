import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

// Replace the `<>` block around line 229 to 239
const blockToReplace = `    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={INITIAL_CARDS.filter(c => c.status === 'active')} 
        onPaymentComplete={(amt, merch) => {
          toast.success(\`NFC Payment completed: \${amt} to \${merch}\`);
        }}
      />`;

content = content.replace(blockToReplace, "");

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
