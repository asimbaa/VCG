const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Find where app.listen is
content = content.replace(
  /app\.listen\(PORT, "0\.0\.0\.0", \(\) => \{\s*console\.log\(`Server running on http:\/\/localhost:\$\{PORT\}`\);\s*\}\);/,
  `const httpServer = app.listen(PORT, "0.0.0.0", () => {
        console.log(\`Server running on http://localhost:\${PORT}\`);
      });
      vite.config.server.hmr = { server: httpServer };`
);

content = content.replace(
  /server: \{ middlewareMode: true, hmr: false \}/,
  `server: { middlewareMode: true }`
);

fs.writeFileSync('server.ts', content);
