const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const targetStr = `        // Simulated premium card authorization successful!
        toast.info(
          \`Authorising payment via Secure \${checkoutCreditCardNetwork}...\`,
        );
      } else {`;

const replaceStr = `        // Simulated premium card authorization successful!
        toast.info(
          \`Authorising payment via Secure \${checkoutCreditCardNetwork}...\`,
        );

        // Process actual digital card deduction if possible
        try {
          const savedCardsStr = window.localStorage.getItem('valourian_digital_cards_v8');
          if (savedCardsStr) {
            let savedCards = JSON.parse(savedCardsStr);
            const cardIndex = savedCards.findIndex((c: any) => c.id === checkoutCardNumber || c.cardNumber === checkoutCreditCardNumber);
            if (cardIndex !== -1) {
              if (savedCards[cardIndex].balance < totalToPay) {
                toast.error(\`Card \${checkoutCreditCardNetwork} has insufficient balance. (\${savedCards[cardIndex].balance} AUD)\`);
                setIsProcessing(false);
                return;
              }
              savedCards[cardIndex].balance -= totalToPay;
              window.localStorage.setItem('valourian_digital_cards_v8', JSON.stringify(savedCards));
            }
          }
        } catch (e) {
          console.error("Failed to deduct from digital card", e);
        }

      } else {`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
