const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// There is a missing </div> closing tag before the return statement ends. 
code = code.replace(/      <\/div>\n  \);\n\}/, '      </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
