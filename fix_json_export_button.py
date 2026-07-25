import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

csv_btn = """                  <Button
                    onClick={exportTransactionsToCSV}"""

json_btn = """                  <Button
                    onClick={exportTreasuryDataJSON}
                    variant="outline"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-4 h-10"
                  >
                    <FileJson className="w-4 h-4 mr-2" /> JSON
                  </Button>
                  <Button
                    onClick={exportTransactionsToCSV}"""

content = content.replace(csv_btn, json_btn)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

