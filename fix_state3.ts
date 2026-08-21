import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

if (!content.includes('const [isNfcModalOpen')) {
  content = content.replace(
    "const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);",
    "const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);\n  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);"
  );
  fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
}
