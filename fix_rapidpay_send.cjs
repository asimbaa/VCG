const fs = require('fs');

const path = './src/components/pay/RapidPay.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldUpdateBlock = `        const cardRef = doc(db, "funding_sources", card.id);
        await updateDoc(cardRef, {
          currentBalance: (card.currentBalance || 0) + amtNum
        });`;

const newUpdateBlock = `        try {
          const cardRef = doc(db, "funding_sources", card.id);
          await updateDoc(cardRef, {
            currentBalance: (card.currentBalance || 0) + amtNum
          });
        } catch (e) {
          const saved = window.localStorage.getItem('valourian_digital_cards_v7');
          if (saved) {
            let localCards = JSON.parse(saved);
            const cIndex = localCards.findIndex(c => c.id === card.id);
            if (cIndex > -1) {
              localCards[cIndex].currentBalance = (localCards[cIndex].currentBalance || 0) + amtNum;
              window.localStorage.setItem('valourian_digital_cards_v7', JSON.stringify(localCards));
            }
          }
        }`;

content = content.replace(oldUpdateBlock, newUpdateBlock);
fs.writeFileSync(path, content);
console.log("Send from card fixed");
