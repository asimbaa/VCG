const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/    return \(\) => clearInterval\(intv\);\n    return \(\) => clearInterval\(intv\);/g, '    return () => clearInterval(intv);');
code = code.replace(/    return \(\) => observer\.disconnect\(\);\n    return \(\) => observer\.disconnect\(\);/g, '    return () => observer.disconnect();');
code = code.replace(/  return \(\n  return \(/g, '  return (');
code = code.replace(/    return \(\) => window\.removeEventListener\("storage", syncCards\);\n    return \(\) => window\.removeEventListener\("storage", syncCards\);/g, '    return () => window.removeEventListener("storage", syncCards);');
code = code.replace(/    return \(\) => clearInterval\(freezeInterval\);\n    return \(\) => clearInterval\(freezeInterval\);/g, '    return () => clearInterval(freezeInterval);');
code = code.replace(/    return \(\) => unsub\(\);\n    return \(\) => unsub\(\);/g, '    return () => unsub();');
code = code.replace(/    return \(\) => clearInterval\(interval\);\n    return \(\) => clearInterval\(interval\);/g, '    return () => clearInterval(interval);');
code = code.replace(/                                return \(\n                                return \(/g, '                                return (');
code = code.replace(/                    return \(\n                    return \(/g, '                    return (');
code = code.replace(/                  return \(\n                  return \(/g, '                  return (');
code = code.replace(/                        return \(\n                        return \(/g, '                        return (');

fs.writeFileSync(file, code);
