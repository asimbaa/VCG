const fs = require('fs');

const path = './src/components/deployments/Deployments.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("else if(site.id === 3) setShowCorpSite(true);", `else if(site.id === 3) setShowCorpSite(true);
                           else if(site.id === 2) {
                             const event = new CustomEvent('nav-bank');
                             window.dispatchEvent(event);
                           }`);

fs.writeFileSync(path, content);
console.log("Fixed Deployments navigation");
