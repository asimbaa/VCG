const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetStr = `            ) : activeTab === "crypto" ? (`;

const replacementStr = `            ) : activeTab === "compliance" ? (
                <ComplianceBankingTab />
            ) : activeTab === "crypto" ? (`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
