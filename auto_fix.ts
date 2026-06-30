import fs from 'fs';
import * as babel from '@babel/core';

const parseOptions = {
    presets: ['@babel/preset-typescript', ['@babel/preset-react', {runtime: 'automatic'}]],
    filename: 'BankDashboard.tsx'
};

let code = fs.readFileSync('/src/components/bank/BankDashboard.tsx', 'utf-8');

while (true) {
    try {
        babel.parseSync(code, parseOptions);
        console.log("No syntax errors found!");
        fs.writeFileSync('/src/components/bank/BankDashboard.tsx', code);
        break;
    } catch (e: any) {
        process.stdout.write('.');
        const msg = e.message;
        if (msg.includes("Expected corresponding JSX closing tag for <>") || msg.includes("Unexpected token")) {
            // Remove one </div> before </>
            let matchIndex = code.lastIndexOf('</>');
            if (matchIndex === -1) break;
            
            let before = code.substring(0, matchIndex);
            let after = code.substring(matchIndex);
            
            let lastDivIndex = before.lastIndexOf('</div>');
            if (lastDivIndex !== -1) {
                code = before.substring(0, lastDivIndex) + before.substring(lastDivIndex + 6) + after;
            } else {
                break;
            }
        } else if (msg.includes("Unexpected closing fragment tag does not match opening \"div\" tag") || msg.includes("Expected corresponding closing tag for JSX fragment")) {
            // Add one </div> before </>
            let matchIndex = code.lastIndexOf('</>');
            if (matchIndex === -1) break;
            code = code.substring(0, matchIndex) + '</div>\n                  ' + code.substring(matchIndex);
        } else {
            console.error('\n' + msg);
            fs.writeFileSync('/src/components/bank/BankDashboard.tsx', code);
            break;
        }
    }
}
