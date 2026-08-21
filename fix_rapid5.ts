import * as fs from 'fs';
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');
const lines = content.split('\n');

// pop from bottom until we find `<AIGuide />`
while(lines.length > 0 && !lines[lines.length - 1].includes('<AIGuide />')) {
  lines.pop();
}

lines.push('    </div>');
lines.push('    </>');
lines.push('  );');
lines.push('}');

fs.writeFileSync('src/components/pay/RapidPay.tsx', lines.join('\n'));
