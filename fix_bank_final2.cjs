const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const targetReturnClose = '      <DashboardFooter onTerminalOpen={() => setShowTerminal(true)} />\n    </div>\n  );\n}';
const replacementReturnClose = '      <DashboardFooter onTerminalOpen={() => setShowTerminal(true)} />\n    </div>\n    </>\n  );\n}';

if (content.includes(targetReturnClose)) {
  content = content.replace(targetReturnClose, replacementReturnClose);
}

// Clean up the bad ends at the very end of the file
const badEnds = [
  '    </>\n  );',
  '    </>\n  );\n}',
  '    </>\n  );}',
  '    </>\n  );\n}\n}',
  '    </>\n  );\n}\n'
];
for (const b of badEnds) {
  if (content.endsWith(b)) {
    content = content.slice(0, content.length - b.length);
  }
}

// Ensure DashboardFooter is closed correctly
if (!content.endsWith('  </footer>\n)')) {
  if (content.endsWith('  </footer>')) content = content + '\n)';
  else if (content.endsWith('  </footer>\n')) content = content + ')';
}
if (!content.endsWith(';')) content = content + ';';

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
