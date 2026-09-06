const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Replace the icon block
const iconBlockStart = `                  {activeTab === "reality" ? (<RealityBridge balances={balances} onComplete={() => setActiveTab("treasury")} />) : activeTab === "send" ? (`;
const iconBlockEnd = `                  )}
                </div>`;

const iconBlockRegex = /\{activeTab === "reality" \? \(\<RealityBridge[\s\S]*? \)\}([\s\n]+)<\/div>/;

if (iconBlockRegex.test(content)) {
    content = content.replace(iconBlockRegex, `{/* Dynamic icon rendered from tab list */}
                  <Activity className="w-5 h-5 text-blue-600" />$1</div>`);
    console.log("Replaced icon block!");
} else {
    console.log("Could not find icon block.");
}

const missingTabs = `
                ) : activeTab === "crypto" ? (
                  <CryptoPortfolioTab />
                ) : activeTab === "documents" || activeTab === "properties" ? (
                  <VaultRecords />
                ) : activeTab === "treasury" ? (
                  <GlobalTreasuryTab />
                ) : activeTab === "portfolio" ? (
                  <PortfolioEntitiesTab />
                ) : activeTab === "compliance" ? (
                  <ComplianceBankingTab />
                ) : activeTab === "store" ? (
                  <SovereignStore />
                ) : activeTab === "receipts" ? (
                  <ReceiptsSection />
                ) : activeTab === "email" ? (
                  <WorkspaceMail />
                ) : activeTab === "uber" ? (
                  <UberApp />
                ) : activeTab === "ubereats" ? (
                  <UberEatsApp />
                ) : activeTab === "gateways" ? (
                  <SovereignGatewaysTab />
                ) : activeTab === "logistics" ? (
                  <SovereignLogisticsTab />
                ) : activeTab === "dispatch" ? (
                  <SovereignDispatchMonitor />
                ) : activeTab === "past-orders" ? (
                  <PastOrdersView />
                ) : activeTab === "strategic_equities" ? (
                  <GlobalEquities />
                ) : activeTab === "strategic_assets" ? (
                  <ValourianStrategicAssets />
                ) : activeTab === "chat" ? (
                  <SovereignAI />
                ) : activeTab === "terminal" ? (
                  <TerminalMax />
                ) : activeTab === "booking" ? (
                  <BookingApp />
                ) : activeTab === "wiki" ? (
                  <EnterpriseWikiTab />
                ) : activeTab === "gateway" ? (
                  <PartnerNetworkTab />
                ) : activeTab === "aura" ? (
                  <div className="h-[800px] w-full bg-slate-900 rounded-3xl overflow-hidden"><AuraDriveMap /></div>
                ) : activeTab === "website" ? (
                  <WebsiteDeployments />
                ) : activeTab === "team" ? (
                  <SwarmIntelligenceTab />
                ) : activeTab === "concierge" ? (
                  <OrderSummary />
                ) : activeTab === "reality" ? (
                  <RealityBridge balances={balances} onComplete={() => setActiveTab("treasury")} />`;

content = content.replace(/(\s+)\) : null\}(\s+)<\/motion\.div>/, `$1${missingTabs}$1) : null}$2</motion.div>`);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
