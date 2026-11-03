const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/startPeriodicBackup\(u\.uid\);/g, 'startPeriodicBackup();');
code = code.replace(/completeEmailLogin\(\)\.then\(u => \{\n\s*if \(u\) setUser\(u\);\n\s*\}\)/g, 'completeEmailLogin()');
fs.writeFileSync('src/App.tsx', code);
