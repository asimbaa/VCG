const fs = require('fs');
const { execSync } = require('child_process');
try {
  execSync('npx esbuild src/components/bank/ValourianDashboard.tsx', { stdio: 'pipe' });
} catch (e) {
  console.log(e.stderr.toString());
}
