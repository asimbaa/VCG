import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');
const lines = content.split('\n');

let target = -1;
for (let i = 425; i < 435; i++) {
  if (lines[i].includes(')}')) {
    if (lines[i+1].includes('</div>') && lines[i+2].includes('</div>')) {
      target = i;
      break;
    }
  }
}

if (target !== -1) {
  lines.splice(target + 1, 2);
}

fs.writeFileSync('src/components/bank/EToroApp.tsx', lines.join('\n'));
