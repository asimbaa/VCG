const fs = require('fs');

function patchFile(filepath) {
    let file = fs.readFileSync(filepath, 'utf8');

    const newLogic = `
      // 1. Stripe Live Transfer Integration (Valourian Global Payouts)
      try {
        const stripeRes = await fetch("/api/stripe/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numAmount,
            currency: loanCurrency,
            destination: loanRecipient, 
            description: loanPurpose,
          })
        });
        const stripeData = await stripeRes.json();
        
        if (!stripeData.success) {
           throw new Error(stripeData.error || "Stripe network transfer failed");
        }
      } catch (e) {
        console.warn("Stripe integration warning:", e);
      }
      
      const newBalances = {`;

    if (file.includes('const newBalances = {') && !file.includes('Stripe Live Transfer Integration')) {
        file = file.replace('const newBalances = {', newLogic);
        fs.writeFileSync(filepath, file);
        console.log("Patched " + filepath);
    }
}

patchFile('src/components/bank/ValourianDashboard.tsx');
patchFile('src/components/bank/BankDashboard.tsx');

