import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

// Undo the mess
content = content.replace("<>\n      <NFCTapModal \n        isOpen={isNfcModalOpen} \n        onClose={() => setIsNfcModalOpen(false)} \n        cards={INITIAL_CARDS.filter(c => c.status === 'active')} \n        onPaymentComplete={(amt, merch) => {\n          toast.success(`NFC Payment completed: $${amt} to ${merch}`);\n        }}\n      />", "");
content = content.replace("</AnimatePresence>\n    </div>\n    </>\n  );", "</AnimatePresence>\n    </div>\n  );");

// Safely inject modal at the end of the root div
content = content.replace(
  "</AnimatePresence>\n    </div>",
  `</AnimatePresence>\n      <NFCTapModal \n        isOpen={isNfcModalOpen} \n        onClose={() => setIsNfcModalOpen(false)} \n        cards={INITIAL_CARDS.filter(c => c.status === 'active')} \n        onPaymentComplete={(amt, merch) => {\n          toast.success(\`NFC Payment completed: $\${amt} to \${merch}\`);\n        }}\n      />\n    </div>`
);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
