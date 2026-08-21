const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// The UI text we want to change
file = file.replace(/title: "Biometric Sovereign Security"/g, 'title: "Zero-Friction Sovereign Identity"');
file = file.replace(/description: "Configure card limit authorizations and access biometric tap-and-pay codes."/g, 'description: "Configure card limits and one-click Valourian overriding capabilities."');
file = file.replace(/Biometric Overlay/g, 'Zero-Friction Override Overlay');
file = file.replace(/Scanning biometrics\.\.\./g, 'Verifying Sovereign Master Key...');
file = file.replace(/Biometric Unlock/g, 'Sovereign Passkey');
file = file.replace(/biometric_retina/g, 'sovereign_auth');
file = file.replace(/biometric_facial/g, 'sovereign_auth2');
file = file.replace(
    `Instant loan approval requires biometric identity verification.`,
    `Instant loan approval authorized via Zero-Friction Sovereign Identity.`
);
file = file.replace(
    `High-value or international digital coin transfers require biometric verification.`,
    `Sovereign Override: Bypassing standard transfer limits for Executive Account.`
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
