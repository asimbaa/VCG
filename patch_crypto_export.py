import re

with open("src/components/bank/CryptoPortfolio.tsx", "r") as f:
    content = f.read()

# Add download icon import
if "Download" not in content:
    content = content.replace("RefreshCw, Send,", "RefreshCw, Send, Download, FileJson, FileText,")


export_logic = """
  const exportData = (format: 'csv' | 'json') => {
    try {
        const dataToExport = viewMode === 'crypto' ? prices : fiatBalances;
        const timestamp = new Date().toISOString();
        const filename = `treasury_audit_${viewMode}_${timestamp}.${format}`;
        
        let fileContent = '';
        let mimeType = '';
        
        if (format === 'json') {
            fileContent = JSON.stringify({
                type: 'valourian_treasury_audit',
                timestamp,
                asset_class: viewMode,
                total_value_usd: viewMode === 'crypto' ? totalCryptoValue : totalFiatValue,
                assets: dataToExport
            }, null, 2);
            mimeType = 'application/json';
        } else {
            if (viewMode === 'crypto') {
                const headers = ['Asset', 'Symbol', 'Price (USD)', 'Balance', 'Total Value (USD)'];
                const rows = prices.map(p => [
                    p.name, 
                    p.symbol, 
                    p.current_price, 
                    p.balance, 
                    (p.current_price * p.balance).toFixed(2)
                ]);
                fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
            } else {
                const headers = ['Asset', 'Symbol', 'Balance', 'Value (USD)'];
                const rows = fiatBalances.map(f => [
                    f.name,
                    f.symbol,
                    f.balance,
                    f.balance.toFixed(2)
                ]);
                fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
            }
            mimeType = 'text/csv';
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Successfully exported ${viewMode.toUpperCase()} portfolio as ${format.toUpperCase()}`);
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
    }
  };

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    fetchPrices();", export_logic + "    fetchPrices();")

export_buttons = """
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                  <FileText className="w-4 h-4 mr-2" />
                  CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('json')} className="text-slate-600 border-slate-200 hover:bg-slate-50 mr-4">
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON
              </Button>
              {viewMode === 'crypto' && (
              <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={isLoading} className="text-slate-500">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              )}
          </div>
"""

content = re.sub(
    r"{viewMode === 'crypto' && \(\s*<Button variant=\"ghost\" size=\"sm\" onClick=\{fetchPrices\} disabled=\{isLoading\} className=\"text-slate-500\">\s*<RefreshCw className=\{`w-4 h-4 mr-2 \$\{isLoading \? 'animate-spin' : ''\}`\} />\s*Refresh Data\s*</Button>\s*\)}",
    export_buttons,
    content,
    flags=re.DOTALL
)

with open("src/components/bank/CryptoPortfolio.tsx", "w") as f:
    f.write(content)

