const fs = require('fs');

function addPDFExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add exportMonthlyStatementPDF function
  const functionCode = `
  const exportMonthlyStatementPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Valourian Capital", 14, 20);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Official Monthly Financial Statement", 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      const today = new Date();
      doc.text(\`Statement Period: \${today.toLocaleString('default', { month: 'long' })} \${today.getFullYear()}\`, 14, 40);
      doc.text(\`Generated: \${today.toLocaleString()}\`, 14, 45);
      
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const monthlyTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      
      doc.text(\`Total Transactions this month: \${monthlyTxns.length}\`, 14, 50);
      
      const tableData = monthlyTxns.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.recipient || "N/A",
        t.type || "Transfer",
        t.amount > 0 ? "+" + t.amount.toLocaleString() : t.amount.toLocaleString(),
        t.currency || "USD"
      ]);
      
      autoTable(doc, {
        startY: 60,
        head: [['Date', 'Description', 'Type', 'Amount', 'Currency']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });
      
      doc.save(\`valourian_statement_\${today.toLocaleString('default', { month: 'short' })}_\${currentYear}.pdf\`);
      toast.success("Monthly Statement PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF statement.");
    }
  };
`;

  // Find exportTransactionsToCSV and insert before it
  const exportCsvIndex = content.indexOf('const exportTransactionsToCSV = () => {');
  if (exportCsvIndex > -1) {
    content = content.slice(0, exportCsvIndex) + functionCode + '\n  ' + content.slice(exportCsvIndex);
  }

  // 2. Add button to the UI
  // For BankDashboard
  const btnStr1 = `<Button
                  onClick={exportTransactionsToCSV}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>`;
                
  const newBtns1 = `<div className="flex gap-2">
                <Button
                  onClick={exportMonthlyStatementPDF}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10 text-emerald-600"
                >
                  <Download className="w-4 h-4 mr-2" /> Monthly PDF
                </Button>
                <Button
                  onClick={exportTransactionsToCSV}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10"
                >
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
                </div>`;

  content = content.replace(btnStr1, newBtns1);
  
  // For ValourianDashboard (it has a slightly different button structure)
  const btnStr2 = `<Button
                    onClick={exportTransactionsToPDF}
                    variant="outline"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10"
                  >
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>`;
                  
  const newBtns2 = `<Button
                    onClick={exportMonthlyStatementPDF}
                    variant="outline"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10 text-emerald-600"
                  >
                    <Download className="w-4 h-4 mr-2" /> Monthly Statement
                  </Button>
                  <Button
                    onClick={exportTransactionsToPDF}
                    variant="outline"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10"
                  >
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>`;
                  
  content = content.replace(btnStr2, newBtns2);

  fs.writeFileSync(filePath, content);
  console.log(filePath + " updated.");
}

addPDFExport('./src/components/bank/BankDashboard.tsx');
addPDFExport('./src/components/bank/ValourianDashboard.tsx');
