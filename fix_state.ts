import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

if (!content.includes('isNfcModalOpen')) {
  content = content.replace(
    "const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_CARDS[0].id);",
    "const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_CARDS[0].id);\n  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);"
  );
  fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
}
