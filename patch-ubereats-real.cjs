const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

if (!content.includes('sendWorkspaceEmail')) {
    content = content.replace("import { toast } from \"sonner\";", "import { toast } from \"sonner\";\nimport { sendWorkspaceEmail } from '../../utils/email';");
}

const target = `const handleSendVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || voucherAmount <= 0) return;
    setIsProcessing(true);

    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const generatedVoucherCode =
        "UBEREATS-VCS-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();

      // Ensure global_vouchers collection exists and add to it
      await addDoc(collection(db, "global_vouchers"), {
        creatorId: user.uid,
        recipientEmail: recipientEmail,
        code: generatedVoucherCode,
        amount: voucherAmount,
        currency: "AUD",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      // Also send a digital bank message/notification if they are in the network
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", recipientEmail));
      const userDocs = await getDocs(q);

      if (!userDocs.empty) {
        const recipientDoc = userDocs.docs[0];
        const recipientUid = recipientDoc.id;

        const emailsColRef = collection(db, "users", recipientUid, "emails");
        await addDoc(emailsColRef, {
          id: Date.now(),
          sender: "Uber Eats Corporate",
          email: "rewards@ubereats.valourian",
          recipient: \`Uber Eats Voucher\`,
          subject: \`You received an Uber Eats Voucher!\`,
          body: \`You have received a corporate digital cash voucher for $\${voucherAmount} AUD.\\n\\nVoucher Code: \${generatedVoucherCode}\\n\\nApply this code at checkout to redeem.\`,
          date: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
          starred: true,
          isVoucher: true,
          voucherAmount: voucherAmount,
          voucherCode: generatedVoucherCode,
          timestamp: new Date().toISOString(),
        });
      }

      toast.success(
        \`Voucher of AUD \${voucherAmount} sent to \${recipientEmail}\`,
      );
      setRecipientEmail("");
      setVoucherAmount(100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate voucher.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
const repl = `const handleSendVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || voucherAmount <= 0) return;
    setIsProcessing(true);

    try {
      if (!user || !user.uid) throw new Error("Not authenticated");

      const generatedVoucherCode =
        "UBEREATS-VCS-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();

      // Ensure global_vouchers collection exists and add to it
      await addDoc(collection(db, "global_vouchers"), {
        creatorId: user.uid,
        recipientEmail: recipientEmail,
        code: generatedVoucherCode,
        amount: voucherAmount,
        currency: "AUD",
        status: "active",
        timestamp: new Date().toISOString(),
      });

      // Also send a digital bank message/notification if they are in the network
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", recipientEmail));
      const userDocs = await getDocs(q);

      if (!userDocs.empty) {
        const recipientDoc = userDocs.docs[0];
        const recipientUid = recipientDoc.id;

        const emailsColRef = collection(db, "users", recipientUid, "emails");
        await addDoc(emailsColRef, {
          id: Date.now(),
          sender: "Uber Eats Corporate",
          email: "rewards@ubereats.valourian",
          recipient: \`Uber Eats Voucher\`,
          subject: \`You received an Uber Eats Voucher!\`,
          body: \`You have received a corporate digital cash voucher for $\${voucherAmount} AUD.\\n\\nVoucher Code: \${generatedVoucherCode}\\n\\nApply this code at checkout to redeem.\`,
          date: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
          starred: true,
          isVoucher: true,
          voucherAmount: voucherAmount,
          voucherCode: generatedVoucherCode,
          timestamp: new Date().toISOString(),
        });
      }
      
      // REAL EMAIL SENDING TO WORKSPACE
      const htmlBody = \`
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #06C167; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">Uber Eats Corporate</h1>
          </div>
          <div style="padding: 40px; background-color: #ffffff; text-align: center;">
            <p style="font-size: 18px; color: #334155; margin-bottom: 30px;">You've received a global digital cash voucher.</p>
            <div style="font-size: 42px; font-weight: 900; color: #06C167; margin-bottom: 20px;">$\${voucherAmount.toFixed(2)} AUD</div>
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 30px;">
               <div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 2px;">\${generatedVoucherCode}</div>
            </div>
            <p style="font-size: 14px; color: #64748b;">This code is globally accepted at any POS or directly in the Sovereign Application.</p>
          </div>
        </div>
      \`;
      
      if (user.email) {
          await sendWorkspaceEmail(recipientEmail, "You received a Global Uber Eats Voucher!", htmlBody);
          toast.success(\`Real email dispatched to \${recipientEmail}!\`);
      }

      toast.success(
        \`Voucher of AUD \${voucherAmount} generated and broadcasted!\`,
      );
      setRecipientEmail("");
      setVoucherAmount(100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate voucher.");
    } finally {
      setIsProcessing(false);
    }
  };`;
  
content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
console.log("UberEatsApp real email patched.");
