with open('server.ts', 'r') as f:
    content = f.read()

import re

target = """import { createServer as createViteServer } from "vite";"""
content = content.replace(target, "")

target2 = """if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {"""

replacement2 = """if (process.env.NODE_ENV !== "production") {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  });
} else {"""

if target2 in content:
    content = content.replace(target2, replacement2)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Could not find target2 in server.ts")

