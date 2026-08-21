import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf-8');

content = content.replace(
  /      <\/div>\r?\n    <\/>\r?\n  \);\r?\n\};\r?\n\r?\nconst Cloud/g,
  `      </div>\n    </div>\n    </>\n  );\n};\n\nconst Cloud`
);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
