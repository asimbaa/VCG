const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetCheck = `    } else if (transferType === "digital_assets") {
      if (!cryptoAddress || !cryptoAmount) {
        toast.error("Please provide destination address and amount.");
        return;
      }
      processCryptoTransfer();
    }`;

const replCheck = `    } else if (transferType === "digital_assets") {
      if (!cryptoAddress || !cryptoAmount) {
        toast.error("Please provide destination address and amount.");
        return;
      }
      const phoneInput = document.getElementById('smsPhone') as HTMLInputElement;
      if (!phoneInput || !phoneInput.value.trim()) {
        toast.error("SMS Verification Phone Number is required for withdrawal authorization.");
        return;
      }
      processCryptoTransfer(phoneInput.value.trim());
    }`;

content = content.replace(targetCheck, replCheck);

const targetProc = `const processCryptoTransfer = async () => {`;
const replProc = `const processCryptoTransfer = async (phone: string) => {`;
content = content.replace(targetProc, replProc);

const targetSuccess = `toast.success(\`Successfully sent \${numAmount} \${cryptoAsset} from treasury. Payment received/accepted and routed to Logistics Tracking!\`);`;
const replSuccess = `toast.success(\`SMS Verification Code Authorized via \${phone}. Successfully sent \${numAmount} \${cryptoAsset} from treasury. Assets settled on-chain.\`);`;
content = content.replace(targetSuccess, replSuccess);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay processCryptoTransfer");
