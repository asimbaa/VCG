const fs = require('fs');
let code = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const processSearch = `    if (transferType === "payid") {
      transferTo = \`\${accountName} (PayID: \${payIdValue}) - Delivered to: Asim Aryal, 712, 15 Barton Rd, Artarmon NSW 2064 Australia\`;
      typeLabel = "au_bsb_payid";
    }`;

const processReplace = `    if (transferType === "payid") {
      transferTo = \`\${accountName} (PayID: \${payIdValue}) - Delivered to: Asim Aryal, 712, 15 Barton Rd, Artarmon NSW 2064 Australia\`;
      typeLabel = "au_bsb_payid";
    }`;

// Since the file already sets typeLabel = "au_bsb_payid" and the success message uses NPP logic for real-time, we are good. Let's just make sure the toast matches "earliest convenience".
const successSearch = `      } else {
        toast.success(\`Transfer of \${amount} to \${transferTo} successful.\`);
      }`;

const successReplace = `      } else {
        if (transferType === 'payid') {
           toast.success(\`Transfer of $\${amount} to \${transferTo} initiated via NPP. Funds will be available in the recipient's account at the earliest convenience.\`, { duration: 6000 });
        } else {
           toast.success(\`Transfer of \${amount} to \${transferTo} successful.\`);
        }
      }`;

if (code.includes(successSearch)) {
    code = code.replace(successSearch, successReplace);
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', code);
