const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!file.includes('AutomatedQA')) {
    file = file.replace(
        'import { SovereignDispatchMonitor } from "./SovereignDispatchMonitor";', 
        'import { SovereignDispatchMonitor } from "./SovereignDispatchMonitor";\nimport { AutomatedQA } from "./AutomatedQA";'
    );
    
    file = file.replace(
        '</button>\n                            </div>\n                        </div>',
        '</button>\n                            </div>\n                        </div>\n                        <AutomatedQA />'
    );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
