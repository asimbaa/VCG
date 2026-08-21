import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf-8');

if (!content.includes('DeepSpaceTerminal')) {
  content = content.replace(
    'import { WebsiteDeployments } from "./WebsiteDeployments";',
    'import { WebsiteDeployments } from "./WebsiteDeployments";\nimport { DeepSpaceTerminal } from "./DeepSpaceTerminal";\nimport { HelpTooltip } from "../ui/HelpTooltip";'
  );

  content = content.replace(
    'return (',
    `return (
    <>
      <DeepSpaceTerminal />`
  );

  // Add tooltips to titles
  content = content.replace(
    'Valourian Capital Dashboard',
    'Valourian Capital Dashboard <HelpTooltip content="Central executive hub for global wealth management, deployment readiness, and sovereign asset oversight." />'
  );
  content = content.replace(
    'Live Uber Data',
    'Live Uber Data <HelpTooltip content="Real-time geo-spatial mapping of Valourian corporate fleet and Uber/UberEats voucher distribution." />'
  );
  content = content.replace(
    'Private Black Cards',
    'Private Black Cards <HelpTooltip content="Access exclusive virtual and physical Black Cards with global tap-and-pay NFC capabilities." />'
  );
  content = content.replace(
    'Website Deployments',
    'Website Deployments <HelpTooltip content="Track deployment readiness, DNS status, and SSL certificates for Valourian websites." />'
  );
  
  // Close fragment
  const lastIndex = content.lastIndexOf('</div>');
  if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '</div>\n    </>' + content.slice(lastIndex + 6);
  }
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
