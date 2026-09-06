const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

content = content.replace(/<div className="pointer-events-auto">\s*<Button/g, '<div className="pointer-events-auto">\n        <Button');
content = content.replace(/<\/Button>\s*<\/div>\s*<\/div>\s*\);\s*\}/g, '</Button>\n        </div>\n      </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
