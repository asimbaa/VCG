const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const authBlockStart = content.indexOf('if (!user) {');
const authBlockEnd = content.indexOf('return (', content.indexOf('<div className="min-h-screen bg-slate-50 text-slate-900 font-sans">'));

if (authBlockStart !== -1 && authBlockEnd !== -1) {
  content = content.substring(0, authBlockStart) + 'if (!user) {\n    return <ValourianAuth />;\n  }\n\n  ' + content.substring(authBlockEnd);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Fixed App.tsx");
} else {
  console.log("Could not find blocks", authBlockStart, authBlockEnd);
}
