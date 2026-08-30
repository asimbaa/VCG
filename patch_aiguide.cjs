const fs = require('fs');
let content = fs.readFileSync('src/components/AIGuide.tsx', 'utf8');

content = content.replace(
  'className={`fixed bottom-28',
  'className={`hidden fixed bottom-28'
);

fs.writeFileSync('src/components/AIGuide.tsx', content);
