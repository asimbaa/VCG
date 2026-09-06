const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf8');

content = content.replace("</button>\n              </div>\n            </div>\n\n            <div className=\"space-y-4\">", "</button>\n              </div>\n\n            <div className=\"space-y-4\">");

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
