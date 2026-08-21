import * as fs from 'fs';
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const regex = /      \)\}\r?\n\r?\n      <AIGuide \/>\r?\n    <\/div>\r?\n    <\/div>\r?\n    <\/>\r?\n  \);\r?\n\}/g;

content = content.replace(regex, `      )}\n      <AIGuide />\n    </div>\n    </>\n  );\n}`);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
