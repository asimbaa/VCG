const fs = require('fs');

// Patch ValourianDashboard imports
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
if (!content.includes('import { PortfolioEntitiesTab }')) {
    content = content.replace('import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";', 'import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";\nimport { PortfolioEntitiesTab } from "./PortfolioEntitiesTab";');
}
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);

// Patch main.tsx
let main = fs.readFileSync('src/main.tsx', 'utf8');
main = main.replace(
`const originalMeasure = performance.measure;
performance.measure = (...args) => {
  try {
    originalMeasure.apply(performance, args);
  } catch(e) {
    // Ignore DataCloneError from massive React trees
  }
};`,
`const originalMeasure = performance.measure;
performance.measure = (...args) => {
  try {
    return originalMeasure.apply(performance, args);
  } catch(e) {
    // Return mock
    return { name: args[0], entryType: 'measure', startTime: 0, duration: 0 };
  }
};`
);
fs.writeFileSync('src/main.tsx', main);

