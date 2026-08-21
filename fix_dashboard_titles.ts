import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');

// The naive replace caused syntax errors in objects
content = content.replace(/Valourian Capital Dashboard <HelpTooltip content="[^"]+" \/>/g, 'Valourian Capital Dashboard');
content = content.replace(/Live Uber Data <HelpTooltip content="[^"]+" \/>/g, 'Live Uber Data');
content = content.replace(/Private Black Cards <HelpTooltip content="[^"]+" \/>/g, 'Private Black Cards');
content = content.replace(/Website Deployments <HelpTooltip content="[^"]+" \/>/g, 'Website Deployments');

// For string literals with double quotes inside them that got broken:
content = content.replace(/Valourian Capital Dashboard <HelpTooltip content=\\"[^"]+\\" \/>/g, 'Valourian Capital Dashboard');
content = content.replace(/Live Uber Data <HelpTooltip content=\\"[^"]+\\" \/>/g, 'Live Uber Data');
content = content.replace(/Private Black Cards <HelpTooltip content=\\"[^"]+\\" \/>/g, 'Private Black Cards');
content = content.replace(/Website Deployments <HelpTooltip content=\\"[^"]+\\" \/>/g, 'Website Deployments');

content = content.replace('label: "Website Deployments <HelpTooltip content="Track deployment readiness, DNS status, and SSL certificates for Valourian websites." />"', 'label: "Website Deployments"');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
