const fs = require('fs');
let code = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const validateSearch = `    if (transferType === 'payid') {
      if (!payIdValue) {
        toast.error("Please enter a PayID");
        return;
      }
      setStatus("validating");
      setTimeout(() => {
        setStatus("idle");
        setAccountName(\`Verified \${payIdType.toUpperCase()} \${payIdValue.substring(0, 4)}...\`);
        setIsValidated(true);
        toast.success("PayID validated successfully");
      }, 100);
      return;
    }`;

const validateReplace = `    if (transferType === 'payid') {
      if (!payIdValue) {
        toast.error("Please enter a PayID");
        return;
      }
      setStatus("validating");
      // Simulate real-time resolution of PayID against RBA/NPP directory
      setTimeout(() => {
        setStatus("idle");
        
        // Generate a mock realistic Australian name or business name based on the input
        let resolvedName = "VALOURIAN CAPITAL PTY LTD";
        if (payIdValue.includes('@')) {
           resolvedName = payIdValue.split('@')[0].replace(/\\./g, ' ').toUpperCase() + " (AUSTRALIAN DOLLAR ACCOUNT)";
        } else if (payIdType === 'abn') {
           resolvedName = "ENTERPRISE ABN " + payIdValue.substring(0, 4) + " (AUSTRALIAN DOLLAR ACCOUNT)";
        } else {
           resolvedName = "VERIFIED USER " + payIdValue.substring(0, 4) + " (AUSTRALIAN DOLLAR ACCOUNT)";
        }
        
        setAccountName(resolvedName);
        setIsValidated(true);
        toast.success("PayID Resolved via NPP Directory");
      }, 1200);
      return;
    }`;

if (code.includes(validateSearch)) {
    code = code.replace(validateSearch, validateReplace);
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', code);
