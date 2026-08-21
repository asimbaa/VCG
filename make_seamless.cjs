const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Inside handleBiometricScan:
file = file.replace(
    'const handleBiometricScan = () => {',
    'const handleBiometricScan = () => {\n    setBiometricStatus("scanning");\n    setTimeout(() => { setBiometricStatus("success"); setTimeout(() => { setShowBiometric(false); if (biometricAction === "transfer") { confirmTransfer(); } else if (biometricAction === "loan") { approveLoan(); } }, 500); }, 800);\n    return;'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
