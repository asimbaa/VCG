const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const lines = code.split('\n');
let i = lines.length - 1;
while(i > 0 && !lines[i].includes('Allocate Sponsor Range')) {
    i--;
}
// i is the line with "Allocate Sponsor Range"
// Let's keep up to i + 2
code = lines.slice(0, i + 2).join('\n');
code += `
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
