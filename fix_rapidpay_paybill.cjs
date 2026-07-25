const fs = require('fs');

const path = './src/components/pay/RapidPay.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldUpdateBlock = `      // 2. Reduce card currentBalance in funding_sources collection
      const cardRef = doc(db, "funding_sources", payingCard.id);
      await updateDoc(cardRef, {
        currentBalance: (payingCard.currentBalance || 0) - payAmt
      });`;

const newUpdateBlock = `      // 2. Reduce card currentBalance in funding_sources collection or local storage
      try {
        const cardRef = doc(db, "funding_sources", payingCard.id);
        await updateDoc(cardRef, {
          currentBalance: (payingCard.currentBalance || 0) - payAmt
        });
      } catch(e) {
        const saved = window.localStorage.getItem('valourian_digital_cards_v7');
        if (saved) {
          let localCards = JSON.parse(saved);
          const cIndex = localCards.findIndex(c => c.id === payingCard.id);
          if (cIndex > -1) {
            localCards[cIndex].currentBalance = (localCards[cIndex].currentBalance || 0) - payAmt;
            window.localStorage.setItem('valourian_digital_cards_v7', JSON.stringify(localCards));
          }
        }
      }`;

content = content.replace(oldUpdateBlock, newUpdateBlock);
fs.writeFileSync(path, content);
console.log("Pay card bill fixed");
