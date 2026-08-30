const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
let fixedCount = 0;

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes('<ResponsiveContainer')) {
        const newCode = code.replace(/<ResponsiveContainer width="100%"/g, '<ResponsiveContainer width="99%"');
        if (newCode !== code) {
            fs.writeFileSync(file, newCode);
            fixedCount++;
            console.log("Fixed ResponsiveContainer in " + file);
        }
    }
});

console.log("Fixed " + fixedCount + " files.");
