import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Look for exportTransactionsToCSV and add exportTreasuryDataJSON
new_export = """  const exportTreasuryDataJSON = () => {
    try {
        const timestamp = new Date().toISOString();
        const treasuryData = {
            metadata: {
                timestamp,
                institution: "Valourian Capital",
                entity: "Global Treasury",
                user_id: user?.uid
            },
            fiat_balances: balances,
            recent_transactions: filteredTransactions,
            total_assets: Object.values(balances).reduce((a, b) => a + b, 0)
        };
        
        const blob = new Blob([JSON.stringify(treasuryData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `valourian_treasury_audit_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Treasury JSON Audit File Downloaded.");
    } catch(err) {
        toast.error("Failed to export JSON.");
    }
  };

  const exportTransactionsToCSV = () => {"""

content = content.replace('  const exportTransactionsToCSV = () => {', new_export)

# Find the place where CSV export button is and add JSON button
json_button = """                  <div className="flex items-center gap-2">
                    <button onClick={exportTreasuryDataJSON} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                      <FileJson className="w-4 h-4" /> JSON Audit
                    </button>
                    <button onClick={exportTransactionsToCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">"""

content = content.replace('<button onClick={exportTransactionsToCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">', json_button)

# Also check if FileJson is imported
if "FileJson" not in content:
    content = content.replace("import {", "import { FileJson,", 1)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

