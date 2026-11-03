const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldBlock = `// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
      const httpServer = app.listen(PORT, "0.0.0.0", () => {
        console.log(\`Server running on http://localhost:\${PORT}\`);
      });
      vite.config.server.hmr = { server: httpServer };
    });
  });
}`;

const newBlock = `// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer }
      },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  });
}`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('server.ts', content);
