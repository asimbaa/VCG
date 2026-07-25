const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src/components -type f -name "*.tsx"').toString().trim().split('\n');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  let originalCode = code;

  code = code.replace(/ transition=\{\{ type: "tween", duration: 2, repeat: Infinity \}\}/g, '');
  code = code.replace(/type: "tween", type: "spring"/g, 'type: "tween"');

  if (code !== originalCode) {
    fs.writeFileSync(file, code);
    console.log("Fixed", file);
  }
}
