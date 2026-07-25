const fs = require('fs');

const path = './src/components/pay/RapidPay.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldUpdateBlock = `      // Update Firestore balance
      const cardRef = doc(db, "funding_sources", selectedBsbCard.id);
      await updateDoc(cardRef, {
        currentBalance: currentBal + convertedAud
      });`;

const newUpdateBlock = `      // Update balance
      try {
        const cardRef = doc(db, "funding_sources", selectedBsbCard.id);
        await updateDoc(cardRef, {
          currentBalance: currentBal + convertedAud
        });
      } catch(e) {
        // If it's a local storage card, update local storage instead
        const saved = window.localStorage.getItem('valourian_digital_cards_v7');
        if (saved) {
          let localCards = JSON.parse(saved);
          const cIndex = localCards.findIndex(c => c.id === selectedBsbCard.id);
          if (cIndex > -1) {
            localCards[cIndex].currentBalance = (localCards[cIndex].currentBalance || 0) + convertedAud;
            window.localStorage.setItem('valourian_digital_cards_v7', JSON.stringify(localCards));
          }
        }
      }`;

content = content.replace(oldUpdateBlock, newUpdateBlock);
fs.writeFileSync(path, content);
console.log("Tap & Go fixed");
