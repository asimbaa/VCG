import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

// replace the return ( 
content = content.replace(
  /return\s*\(\s*<div className="space-y-6">/,
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

// fix the end
content = content.replace(
  /    <\/div>\n    <\/div>\n    <\/>\n  \);\n\};\n\nconst Cloud/g,
  `    </div>\n    </>\n  );\n};\n\nconst Cloud`
);
content = content.replace(
  /    <\/div>\r?\n  \);\r?\n\};\r?\n\r?\nconst Cloud/g,
  `    </div>\n    </>\n  );\n};\n\nconst Cloud`
);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
