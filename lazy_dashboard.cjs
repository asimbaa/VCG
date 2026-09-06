const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const importsToLazy = [
  'WebsiteDeployments', 'DataMigrationTerminal', 'DeepSpaceTerminal',
  'PartnerNetworkTab', 'CommandCenterTab', 'SwarmIntelligenceTab',
  'EnterpriseWikiTab', 'SovereignGatewaysTab', 'GlobalTreasuryTab',
  'CryptoPortfolioTab', 'ComplianceBankingTab', 'PaymentStatusOverlay',
  'SovereignLogisticsTab', 'PortfolioEntitiesTab', 'GlobalEquities',
  'PastOrdersView', 'TreasuryGrowthChart'
];

importsToLazy.forEach(comp => {
  const syncImport = new RegExp('import { ' + comp + ' } from "./' + comp + '";\\n?', 'g');
  const lazyImport = 'const ' + comp + ' = React.lazy(() => import("./' + comp + '").then(module => ({ default: module.' + comp + ' })));\n';
  content = content.replace(syncImport, lazyImport);
});

const suspensePattern = /\{activeTab === "send" \? \(/;
const suspenseReplacement = `
          <React.Suspense fallback={
            <div className="flex items-center justify-center w-full h-96 bg-slate-50/50 rounded-3xl border border-slate-100">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <div className="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing Module...</div>
               </div>
            </div>
          }>
            {activeTab === "send" ? (`;
content = content.replace(suspensePattern, suspenseReplacement);

const endSuspensePattern = /\{activeTab === "treasury" && \(/;
const endSuspenseReplacement = `</React.Suspense>
          {activeTab === "treasury" && (`;
content = content.replace(endSuspensePattern, endSuspenseReplacement);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
