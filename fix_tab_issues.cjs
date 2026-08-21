const fs = require('fs');
const file = 'src/components/bank/ValourianDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `) : activeTab === "properties" ? (
              <div className="space-y-8">`;
const replacement1 = `) : activeTab === "properties" ? (
              <ValourianStrategicAssets />
            ) : activeTab === "cheque" ? (
              <DigitalChequeGenerator />
            ) : activeTab === "properties_legacy" ? (
              <div className="space-y-8">`;

code = code.replace(target1, replacement1);


fs.writeFileSync(file, code);
