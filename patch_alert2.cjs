const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

code = code.replace("import { AlertTriangle, sendEmail }", "import { sendEmail }");
code = code.replace("import { Briefcase, Key, Copy, Terminal,", "import { AlertTriangle, Briefcase, Key, Copy, Terminal,");

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
