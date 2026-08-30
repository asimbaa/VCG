const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetStr = `            ) : activeTab === "concierge" ? (
                <PurchaseConciergeTab />
            ) : null}`;

const replacementStr = `            ) : activeTab === "concierge" ? (
                <PurchaseConciergeTab />
            ) : activeTab === "dispatch" || activeTab === "aura" ? (
                <SovereignLogisticsTab />
            ) : null}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
