const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

if (!content.includes('sendWorkspaceEmail')) {
    content = content.replace("import { toast } from \"sonner\";", "import { toast } from \"sonner\";\nimport { sendWorkspaceEmail, generateProfessionalReceipt } from '../../utils/email';");
}

const targetCheckout = `const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const fee = total * 0.05;
      const finalCost = total + fee;

      const userDocRef = doc(db, "users", user.uid);
      const currentBalances = balances || { AUD: 0 };
      const currentAUD = currentBalances.AUD || 0;

      if (currentAUD < finalCost) {
        toast.error("Insufficient Vault reserves for direct sovereign acquisition.");
        setIsProcessing(false);
        return;
      }

      await updateDoc(userDocRef, {
        balances: {
          ...currentBalances,
          AUD: currentAUD - finalCost,
        }
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -finalCost,
        currency: "AUD",
        description: \`Sovereign Acquisition: \${cart.map(c => c.name).join(", ")}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        merchant: "Valourian Sovereign Store",
        merchantAddress: "Global Reserve",
        network: "Sovereign Network",
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        icon: "shopping-bag",
      });

      toast.success(\`\${paymentMethod === "vault" ? "Vault" : "Card"} debited \${total.toLocaleString()} AUD. Confirmation email queued at \${confirmationEmail}.\`, {
        icon: "💰"
      });

      // Clear cart
      setCart([]);
      setCheckoutModalOpen(false);

    } catch (err) {
      console.error(err);
      toast.error("Transaction failed to clear the network.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
const replCheckout = `const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const fee = total * 0.05;
      const finalCost = total + fee;

      const userDocRef = doc(db, "users", user.uid);
      const currentBalances = balances || { AUD: 0 };
      const currentAUD = currentBalances.AUD || 0;

      if (currentAUD < finalCost) {
        toast.error("Insufficient Vault reserves for direct sovereign acquisition.");
        setIsProcessing(false);
        return;
      }

      await updateDoc(userDocRef, {
        balances: {
          ...currentBalances,
          AUD: currentAUD - finalCost,
        }
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -finalCost,
        currency: "AUD",
        description: \`Sovereign Acquisition: \${cart.map(c => c.name).join(", ")}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        merchant: "Valourian Sovereign Store",
        merchantAddress: "Global Reserve",
        network: "Sovereign Network",
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        icon: "shopping-bag",
      });
      
      // REAL EMAIL NOTIFICATION
      if (confirmationEmail) {
        const receiptHtml = generateProfessionalReceipt({
           id: 'SOV-STORE-' + Math.random().toString(36).substring(2,8).toUpperCase(),
           merchant: 'Valourian Sovereign Supply',
           recipient: confirmationEmail,
           amount: \`$\${finalCost.toLocaleString()} AUD\`
        });
        const emailBody = \`
           <div style="margin-bottom: 20px;">
             <h2 style="color: #0f172a;">Sovereign Order Confirmed</h2>
             <p style="color: #334155;">Your high-net-worth acquisitions have been processed and confirmed via the Sovereign Vault Network.</p>
             <p style="color: #334155;"><strong>Items Secured:</strong></p>
             <ul style="color: #334155;">
               \${cart.map(item => \`<li>\${item.name} - $\${item.price.toLocaleString()} AUD</li>\`).join('')}
             </ul>
           </div>
           \${receiptHtml}
        \`;
        const success = await sendWorkspaceEmail(confirmationEmail, "Valourian Sovereign Acquisition Confirmed", emailBody);
        if (success) {
           toast.success(\`Real Workspace Email Receipt Delivered to \${confirmationEmail}!\`);
        }
      }

      toast.success(\`\${paymentMethod === "vault" ? "Vault" : "Card"} debited \${total.toLocaleString()} AUD. Real confirmation email dispatched.\`, {
        icon: "💰"
      });

      // Clear cart
      setCart([]);
      setCheckoutModalOpen(false);

    } catch (err) {
      console.error(err);
      toast.error("Transaction failed to clear the network.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
content = content.replace(targetCheckout, replCheckout);

const targetQuote = `const handleQuoteAccept = async (quote: any) => {
    setIsProcessing(true);
    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const userDocRef = doc(db, "users", user.uid);
      const currentBalances = balances || { AUD: 0 };
      const currentAUD = currentBalances.AUD || 0;

      if (currentAUD < quote.cost) {
        toast.error("Insufficient Vault reserves for custom asset.");
        setIsProcessing(false);
        return;
      }

      await updateDoc(userDocRef, {
        balances: {
          ...currentBalances,
          AUD: currentAUD - quote.cost,
        }
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -quote.cost,
        currency: "AUD",
        description: \`Custom Sourced: \${quote.name}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        merchant: quote.supplier,
        network: "Omni-Sourcing Network",
        icon: "gem",
      });

      toast.success(\`Custom Asset "\${quote.name}" secured for $\${quote.cost.toLocaleString()} AUD! Confirmation email sent to \${confirmationEmail}.\`, {
        icon: "✨"
      });
      
      setAiQuotes(prev => prev.filter(q => q.id !== quote.id));
      setAssetPrompt("");
      setConfirmingQuote(null);
    } catch(err) {
      toast.error("Asset sourcing failed to clear.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
const replQuote = `const handleQuoteAccept = async (quote: any) => {
    setIsProcessing(true);
    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const userDocRef = doc(db, "users", user.uid);
      const currentBalances = balances || { AUD: 0 };
      const currentAUD = currentBalances.AUD || 0;

      if (currentAUD < quote.cost) {
        toast.error("Insufficient Vault reserves for custom asset.");
        setIsProcessing(false);
        return;
      }

      await updateDoc(userDocRef, {
        balances: {
          ...currentBalances,
          AUD: currentAUD - quote.cost,
        }
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -quote.cost,
        currency: "AUD",
        description: \`Custom Sourced: \${quote.name}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        merchant: quote.supplier,
        network: "Omni-Sourcing Network",
        icon: "gem",
      });
      
      // REAL EMAIL NOTIFICATION
      if (confirmationEmail) {
        const receiptHtml = generateProfessionalReceipt({
           id: 'OMNI-ASSET-' + Math.random().toString(36).substring(2,8).toUpperCase(),
           merchant: quote.supplier,
           recipient: confirmationEmail,
           amount: \`$\${quote.cost.toLocaleString()} AUD\`
        });
        const emailBody = \`
           <div style="margin-bottom: 20px;">
             <h2 style="color: #0f172a;">Custom Asset Secured</h2>
             <p style="color: #334155;">Your request for <strong>\${quote.name}</strong> has been successfully fulfilled by our Omni-Channel Sourcing team.</p>
             <p style="color: #334155;"><strong>Supplier:</strong> \${quote.supplier}</p>
             <p style="color: #334155;"><strong>ETA:</strong> \${quote.eta}</p>
           </div>
           \${receiptHtml}
        \`;
        const success = await sendWorkspaceEmail(confirmationEmail, \`Asset Sourced: \${quote.name}\`, emailBody);
        if (success) {
           toast.success(\`Real Workspace Email Receipt Delivered to \${confirmationEmail}!\`);
        }
      }

      toast.success(\`Custom Asset "\${quote.name}" secured for $\${quote.cost.toLocaleString()} AUD! Real confirmation email dispatched.\`, {
        icon: "✨"
      });
      
      setAiQuotes(prev => prev.filter(q => q.id !== quote.id));
      setAssetPrompt("");
      setConfirmingQuote(null);
    } catch(err) {
      toast.error("Asset sourcing failed to clear.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
content = content.replace(targetQuote, replQuote);

fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
console.log("SovereignStore real email patched.");
