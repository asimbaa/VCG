import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

if (!content.includes('import { NFCTapModal }')) {
  content = content.replace(
    "import { useGlobalCurrency } from '../../contexts/CurrencyContext';",
    "import { useGlobalCurrency } from '../../contexts/CurrencyContext';\nimport { NFCTapModal } from '../pay/NFCTapModal';"
  );
}

if (!content.includes('isNfcModalOpen')) {
  content = content.replace(
    "const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_CARDS[0].id);",
    "const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_CARDS[0].id);\n  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);"
  );
  
  content = content.replace(
    "<div className=\"flex justify-between items-center gap-4\">",
    "<div className=\"flex justify-between items-center gap-4\">\n                    <button onClick={() => setIsNfcModalOpen(true)} className=\"flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest\">\n                      <SmartphoneNfc className=\"w-4 h-4\" />\n                      Tap & Pay\n                    </button>"
  );

  content = content.replace(
    "return (",
    "return (\n    <>\n      <NFCTapModal \n        isOpen={isNfcModalOpen} \n        onClose={() => setIsNfcModalOpen(false)} \n        cards={INITIAL_CARDS.filter(c => c.status === 'active')} \n        onPaymentComplete={(amt, merch) => {\n          toast.success(`NFC Payment completed: $${amt} to ${merch}`);\n        }}\n      />"
  );
  
  content = content.replace(
    "</AnimatePresence>\n    </div>\n  );",
    "</AnimatePresence>\n    </div>\n    </>\n  );"
  );
}
fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
