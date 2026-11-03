const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('VitePWA')) {
    content = content.replace("import react from '@vitejs/plugin-react';", "import react from '@vitejs/plugin-react';\nimport { VitePWA } from 'vite-plugin-pwa';");
    content = content.replace(
        "plugins: [react(), tailwindcss()],",
        `plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true, type: 'module' },
        manifest: {
          id: '/',
          name: 'Valourian Sovereign OS',
          short_name: 'Valourian',
          description: 'A sovereign financial & logistics OS for Valourian Capital Inc.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        }
      })
    ],`
    );
    fs.writeFileSync('vite.config.ts', content);
}
