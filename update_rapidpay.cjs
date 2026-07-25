const fs = require('fs');

const path = './src/components/pay/RapidPay.tsx';
let content = fs.readFileSync(path, 'utf8');

// We will inject the code right after setBsbLinkedCards(cards)
const injectionPoint = 'setBsbLinkedCards(cards);';
if (content.indexOf(injectionPoint) > -1) {
  const newLogic = `
      let allCards = [...cards];
      try {
        const saved = window.localStorage.getItem('valourian_digital_cards_v7');
        if (saved) {
          const localCards = JSON.parse(saved);
          allCards = [...allCards, ...localCards];
        }
      } catch (e) {}
      setBsbLinkedCards(allCards);
`;
  
  content = content.replace(injectionPoint, newLogic);
  fs.writeFileSync(path, content);
  console.log("RapidPay.tsx updated");
} else {
  console.log("Injection point not found");
}

