const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const target1 = `      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          balances: updatedBalances,
        });
      }`;

const repl1 = `      const generatedVoucherCode = "UBEREATS-VCS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          balances: updatedBalances,
        });
        
        // GLOBAL VOUCHER REGISTRY
        await addDoc(collection(db, "global_vouchers"), {
          code: generatedVoucherCode,
          amount: voucherAmount,
          currency: "AUD",
          creatorId: user.uid,
          recipientEmail: recipientEmail,
          status: "active",
          createdAt: new Date().toISOString(),
          sharingPermissions: {
            allowedAccounts: [recipientEmail, "asim.nsw@gmail.com", "asim.aryal@protonmail.com", "asimaryal2@gmail.com"],
            globalAccess: true
          }
        });
      }`;

let newContent = content.replace(target1, repl1);

const target2 = `            body: \`Hello,\\n\\nYou've received an exclusive corporate Uber Eats voucher.\\n\\nSender: Asim Aryal\\nAmount: \${formatConverted(voucherAmount)}\\n\\nUse this digital cash voucher to order premium dining experiences right to your door.\`,
            isVoucher: true,
            voucherAmount: voucherAmount,`;
            
const repl2 = `            body: \`Hello,\\n\\nYou've received an exclusive corporate Uber Eats voucher.\\n\\nSender: Asim Aryal\\nAmount: \${formatConverted(voucherAmount)}\\n\\nUse this digital cash voucher to order premium dining experiences right to your door.\`,
            isVoucher: true,
            voucherAmount: voucherAmount,
            voucherCode: generatedVoucherCode,`;

newContent = newContent.replace(target2, repl2);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', newContent);
console.log("UberEatsApp patched successfully.");
