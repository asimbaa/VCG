const fs = require('fs');

const path = './src/components/deployments/Deployments.tsx';
let content = fs.readFileSync(path, 'utf8');
console.log(content.includes('const event = new CustomEvent'));
