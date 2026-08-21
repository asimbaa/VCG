import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');

const lines = content.split('\n');

// Line 315 error: Unexpected token
// Let's add </div> 
lines.splice(314, 0, '                </div>');

// Line 430 error: ')' expected. It means we have too many closing tags before ')'
// Wait, at 430, it is </div> </div> and then it was supposed to close the outer div?
// Let's remove lines 429, 430
// Wait, their index is now shifted by 1.
// Let's find the closing for activeTab === 'funding' && (
let fundingClose = -1;
for (let i = 389; i < lines.length; i++) {
  if (lines[i].includes(')}')) {
    fundingClose = i;
    break;
  }
}

if (fundingClose !== -1) {
    console.log("Found funding close at", fundingClose);
    // remove the </div> </div> after fundingClose
    // If lines[fundingClose+1] is </div> and lines[fundingClose+2] is </div>
    if (lines[fundingClose+1].includes('</div>') && lines[fundingClose+2].includes('</div>')) {
        lines.splice(fundingClose+1, 2);
    }
}

fs.writeFileSync('src/components/bank/EToroApp.tsx', lines.join('\n'));
