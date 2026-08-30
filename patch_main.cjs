const fs = require('fs');

let content = fs.readFileSync('src/main.tsx', 'utf8');
content = content.replace('<StrictMode>', '');
content = content.replace('</StrictMode>', '');
content = content.replace('import {StrictMode} from \'react\';', '');

const noOpMeasure = `
const originalMeasure = performance.measure;
performance.measure = (...args) => {
  try {
    originalMeasure.apply(performance, args);
  } catch(e) {
    // Ignore DataCloneError from massive React trees
  }
};
`;

content = content.replace("import './index.css';", "import './index.css';\n" + noOpMeasure);
fs.writeFileSync('src/main.tsx', content);
