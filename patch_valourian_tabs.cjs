const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetLine = `            ) : activeTab === "dispatch" || activeTab === "aura" ? (
                <SovereignLogisticsTab />`;

const additionalTabs = `
            ) : activeTab === "website" ? (
                <WebsiteDeployments />
            ) : activeTab === "email" ? (
                <WorkspaceMail />
            ) : activeTab === "documents" ? (
                <VaultRecords />
            ) : activeTab === "receipts" ? (
                <ReceiptsSection />
            ) : activeTab === "past-orders" ? (
                <PastOrdersView />
            ) : activeTab === "booking" ? (
                <BookingApp />
            ) : activeTab === "uber" ? (
                <UberApp />
            ) : activeTab === "ubereats" ? (
                <UberEatsApp />
            ) : activeTab === "store" ? (
                <SovereignStore user={user} balances={balances} setBalances={setBalances} />
            ) : activeTab === "dispatch" || activeTab === "logistics" ? (
                <SovereignDispatchMonitor />
            ) : activeTab === "strategic_assets" ? (
                <ValourianStrategicAssets />
            ) : activeTab === "strategic_equities" ? (
                <GlobalEquities />
            ) : activeTab === "chat" ? (
                <SovereignAI />
            ) : activeTab === "properties" ? (
                <VaultRecords />
`;

content = content.replace(targetLine, additionalTabs + targetLine);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
