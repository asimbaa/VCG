const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetStr = `      setTimeout(async () => {
        await updateDoc(doc(db, "transactions", newTxnRef.id), {
          status: "completed",
        });
        toast.success(
          \`Payroll of \${getSymbol(payrollCurrency)}\${numTotal.toLocaleString()} completed successfully. Payslips generated.\`,
        );
      }, 1500);`;

const newStr = `      setTimeout(async () => {
        await updateDoc(doc(db, "transactions", newTxnRef.id), {
          status: "completed",
        });
        toast.success(
          \`Payroll of \${getSymbol(payrollCurrency)}\${numTotal.toLocaleString()} completed successfully. Payslips generating...\`,
        );
        try {
          const { jsPDF } = await import("jspdf");
          const autoTable = (await import("jspdf-autotable")).default;
          const doc = new jsPDF();
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 210, 40, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(24);
          doc.setFont("helvetica", "bold");
          doc.text("VALOURIAN CAPITAL", 14, 25);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("GLOBAL PAYROLL & HR SETTLEMENT", 14, 32);
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.text("BULK PAYSLIP MANIFEST", 14, 55);
          doc.setFontSize(11);
          doc.setTextColor(71, 85, 105);
          doc.text(\`Execution Date: \${new Date().toLocaleDateString()}\`, 14, 65);
          doc.text(\`Total Employees Compensated: \${numCount}\`, 14, 71);
          doc.text(\`Total Disbursed: \${getSymbol(payrollCurrency)}\${numTotal.toLocaleString()} \${payrollCurrency}\`, 14, 77);
          doc.text(\`Description: \${payrollDescription}\`, 14, 83);
          const mockEmployees = Array.from({ length: Math.min(numCount, 25) }).map((_, i) => {
            const id = \`EMP-\${String(Math.floor(Math.random() * 90000) + 10000)}\`;
            const baseAmt = (numTotal / numCount) * (0.8 + Math.random() * 0.4);
            return [id, \`Executive Tier \${(i%3)+1}\`, \`\${getSymbol(payrollCurrency)}\${baseAmt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 'CLEARED'];
          });
          autoTable(doc, {
            startY: 95,
            head: [['Employee ID', 'Band', 'Net Pay', 'Status']],
            body: mockEmployees,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
            styles: { fontSize: 9 }
          });
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "italic");
          doc.text(\`* Displaying \${Math.min(numCount, 25)} of \${numCount} records. Full ledger securely archived.\`, 14, doc.lastAutoTable.finalY + 10);
          doc.save(\`Valourian_Payslips_Manifest_\${Date.now()}.pdf\`);
        } catch (err) {
          console.error("PDF Error", err);
          toast.error("Payslips PDF generation failed.");
        }
      }, 1500);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
  console.log("ValourianDashboard updated successfully.");
} else {
  console.log("Could not find the target string in ValourianDashboard.");
}

let bankCode = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');
if (bankCode.includes(targetStr)) {
  bankCode = bankCode.replace(targetStr, newStr);
  fs.writeFileSync('src/components/bank/BankDashboard.tsx', bankCode);
  console.log("BankDashboard updated successfully.");
} else {
  console.log("Could not find the target string in BankDashboard.");
}

