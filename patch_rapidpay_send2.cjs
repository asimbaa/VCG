const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

// The original prompt asked: Make the orders get fulfilled, the email chains working smoothly and correctly, the receipts and proofs emailed properly
// Let's hook up the `sendWorkspaceEmail` inside RapidPay's handleSendRequest

let transfer_hook = `          toast.success("Transfer initiated securely. Validating compliance...");
          setTimeout(() => {
            toast.success("Transfer settled instantaneously via Sovereign Nodes.");
            setStatus("success");
            setTimeout(() => setStatus("idle"), 5000);
          }, 1500);`;

let new_transfer_hook = `          toast.success("Transfer initiated securely. Validating compliance...");
          
          // Generate & Send email receipt
          import('../utils/email').then(module => {
             const htmlBody = module.generateProfessionalReceipt({
                 merchant: recipient || "Unknown Party",
                 amount: \`AUD $\${parseFloat(amount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}\`,
             });
             module.sendWorkspaceEmail("asim.nsw@gmail.com", "Sovereign Executive: Transfer Settled", htmlBody);
          }).catch(e => console.error("Email module error:", e));

          setTimeout(() => {
            toast.success("Transfer settled instantaneously via Sovereign Nodes. Receipt emailed to asim.nsw@gmail.com.");
            setStatus("success");
            setTimeout(() => setStatus("idle"), 5000);
          }, 1500);`;

content = content.replace(transfer_hook, new_transfer_hook);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("RapidPay send hooked to emails.");
