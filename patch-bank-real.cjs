const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

if (!content.includes('sendWorkspaceEmail')) {
    content = content.replace("import { toast } from \"sonner\";", "import { toast } from \"sonner\";\nimport { sendWorkspaceEmail, generateProfessionalReceipt } from '../../utils/email';");
}

const target = `await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -parsedAmount,
        currency,
        description: \`Transfer to \${recipient}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        recipient: recipient,
        network: "Sovereign Network",
        icon: "arrow-up-right",
      });

      toast.success(\`Successfully sent \${formatCurrencySafe(parsedAmount, currency)} to \${recipient}!\`);`;
      
const repl = `await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "transfer",
        amount: -parsedAmount,
        currency,
        description: \`Transfer to \${recipient}\`,
        timestamp: new Date().toISOString(),
        status: "completed",
        recipient: recipient,
        network: "Sovereign Network",
        icon: "arrow-up-right",
      });
      
      // REAL EMAIL SENDING TO WORKSPACE (Transfer Receipt)
      if (user && user.email) {
          const receiptHtml = generateProfessionalReceipt({
              id: 'SOV-TRX-' + Math.random().toString(36).substring(2,8).toUpperCase(),
              merchant: recipient,
              recipient: user.email,
              amount: formatCurrencySafe(parsedAmount, currency)
          });
          const emailBody = \`
             <div style="margin-bottom: 20px;">
               <h2 style="color: #0f172a;">Funds Transferred Successfully</h2>
               <p style="color: #334155;">You have securely sent funds via the Sovereign Network.</p>
               <p style="color: #334155;"><strong>Recipient:</strong> \${recipient}</p>
             </div>
             \${receiptHtml}
          \`;
          const success = await sendWorkspaceEmail(user.email, \`Transfer Receipt: \${recipient}\`, emailBody);
          if (success) {
              toast.success("Real Workspace Email Receipt Delivered!");
          }
      }

      toast.success(\`Successfully sent \${formatCurrencySafe(parsedAmount, currency)} to \${recipient}!\`);`;
      
content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
console.log("BankDashboard real email patched.");
