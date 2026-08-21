const fs = require('fs');

function fixFile(filepath) {
    let file = fs.readFileSync(filepath, 'utf8');

    const badLogic = `
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

    file = file.replace(badLogic, 'const newBalances = {');
    
    // Now insert it in executeLoan correctly
    const executeLoanSig = 'const executeLoan = async (numAmount: number) => {';
    if (file.includes(executeLoanSig)) {
        const parts = file.split(executeLoanSig);
        // Find the const newBalances inside executeLoan
        let executeBody = parts[1];
        executeBody = executeBody.replace('const newBalances = {', badLogic);
        file = parts[0] + executeLoanSig + executeBody;
    }
    
    fs.writeFileSync(filepath, file);
    console.log("Fixed " + filepath);
}

fixFile('src/components/bank/ValourianDashboard.tsx');
fixFile('src/components/bank/BankDashboard.tsx');
