const fs = require('fs');
const file = 'src/components/bank/ValourianDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `) : activeTab === "properties" ? (
              <ValourianStrategicAssets />`;
const replacement1 = `) : activeTab === "properties" ? (
              <ValourianStrategicAssets />
            ) : activeTab === "cheque" ? (
              <DigitalChequeGenerator />`;

code = code.replace(target1, replacement1);

const target2 = `const SIDEBAR_TABS = [
    { id: "portfolio", label: "Executive Portfolio", icon: <TrendingUp className="w-4 h-4" /> },`;

const replacement2 = `const SIDEBAR_TABS = [
    { id: "portfolio", label: "Executive Portfolio", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "cheque", label: "NAB $9M Digital Cheque", icon: <Receipt className="w-4 h-4" /> },`;

code = code.replace(target2, replacement2);


fs.writeFileSync(file, code);
