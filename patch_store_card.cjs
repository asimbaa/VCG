const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

const targetStr = `    try {
      const updatedBalances = {
        ...balances,
        AUD: audBalance - total
      };

      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      }
      setBalances(updatedBalances);`;

const replaceStr = `    try {
      if (paymentMethod === 'card' && activeCard) {
        try {
          const savedCardsStr = window.localStorage.getItem('valourian_digital_cards_v8');
          if (savedCardsStr) {
            let savedCards = JSON.parse(savedCardsStr);
            const cardIndex = savedCards.findIndex((c: any) => c.id === activeCard.id);
            if (cardIndex !== -1) {
              savedCards[cardIndex].balance -= total;
              window.localStorage.setItem('valourian_digital_cards_v8', JSON.stringify(savedCards));
            }
          }
        } catch (e) {
          console.error("Failed to deduct from card", e);
        }
      } else {
        const updatedBalances = {
          ...balances,
          AUD: audBalance - total
        };

        if (user && user.uid) {
          await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
        }
        setBalances(updatedBalances);
      }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
