const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// 1. Add import
if (!content.includes('import { DataMigrationTerminal }')) {
  content = content.replace(
    'import { WebsiteDeployments } from "./WebsiteDeployments";',
    'import { WebsiteDeployments } from "./WebsiteDeployments";\nimport { DataMigrationTerminal } from "./DataMigrationTerminal";'
  );
}

// 2. Add Tab rendering
if (!content.includes('activeTab === "migration"')) {
  const targetLine = `            ) : activeTab === "website" ? (
                <WebsiteDeployments />`;
                
  const replacement = `            ) : activeTab === "migration" ? (
                <DataMigrationTerminal />
            ) : activeTab === "website" ? (
                <WebsiteDeployments />`;
                
  content = content.replace(targetLine, replacement);
}

// 3. Change button onClick to setActiveTab("migration")
content = content.replace(
  'toast.loading("Initiating lossless data migration & global synchronization...");',
  'setActiveTab("migration"); window.scrollTo({ top: 0, behavior: "smooth" });\n// toast.loading("Initiating lossless data migration & global synchronization...");'
);

// Remove the setTimeouts inside that button onClick
content = content.replace(
  /setTimeout\(\(\) => \{\s*toast\.success\("Zero-Loss Migration Complete\..*?\n\s*\}, 2000\);/s,
  ''
);
content = content.replace(
  /setTimeout\(\(\) => \{\s*toast\.success\("valourian\.com\.au .*?\n\s*\}, 3500\);/s,
  ''
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
