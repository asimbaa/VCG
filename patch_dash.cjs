const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { CryptoPortfolioTab } from "./CryptoPortfolioTab";')) {
  content = content.replace(
    'import { GlobalTreasuryTab } from "./GlobalTreasuryTab";',
    'import { GlobalTreasuryTab } from "./GlobalTreasuryTab";\nimport { CryptoPortfolioTab } from "./CryptoPortfolioTab";\nimport { ComplianceBankingTab } from "./ComplianceBankingTab";'
  );
}

const targetStr = `            ) : activeTab === "crypto" ? (
                    <Bitcoin className="w-5 h-5 text-blue-600" />
            ) : activeTab === "treasury" ? (`;

const replacementStr = `            ) : activeTab === "crypto" ? (
                <CryptoPortfolioTab />
            ) : activeTab === "treasury" ? (`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `            ) : activeTab === "compliance" ? (
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
            ) : activeTab === "comms_policy" ? (`;

const replacementStr2 = `            ) : activeTab === "compliance" ? (
                <ComplianceBankingTab />
            ) : activeTab === "comms_policy" ? (`;

if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, replacementStr2);
} else {
  // Try an alternative check if it's formatted differently
  content = content.replace(
    ') : activeTab === "compliance" ? (',
    ') : activeTab === "compliance" ? (\n                <ComplianceBankingTab />\n            ) : false ? ('
  );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
