import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf-8');

content = content.replace(
  'import { WebsiteDeployments } from "./WebsiteDeployments";\nimport { DeepSpaceTerminal } from "./DeepSpaceTerminal";\nimport { HelpTooltip } from "../ui/HelpTooltip";',
  'import { WebsiteDeployments } from "./WebsiteDeployments";'
);

content = content.replace(
  `return (
    <>
      <DeepSpaceTerminal />`,
  'return ('
);

content = content.replace(
  'Valourian Capital Dashboard <HelpTooltip content="Central executive hub for global wealth management, deployment readiness, and sovereign asset oversight." />',
  'Valourian Capital Dashboard'
);
content = content.replace(
  'Live Uber Data <HelpTooltip content="Real-time geo-spatial mapping of Valourian corporate fleet and Uber/UberEats voucher distribution." />',
  'Live Uber Data'
);
content = content.replace(
  'Private Black Cards <HelpTooltip content="Access exclusive virtual and physical Black Cards with global tap-and-pay NFC capabilities." />',
  'Private Black Cards'
);
content = content.replace(
  'Website Deployments <HelpTooltip content="Track deployment readiness, DNS status, and SSL certificates for Valourian websites." />',
  'Website Deployments'
);

const lastIndex = content.lastIndexOf('</div>\n    </>');
if (lastIndex !== -1) {
  content = content.slice(0, lastIndex) + '</div>' + content.slice(lastIndex + 14);
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
