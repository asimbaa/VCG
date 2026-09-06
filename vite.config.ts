import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
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
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@react-google-maps') || id.includes('@vis.gl/react-google-maps')) return 'google-maps';
              if (id.includes('framer-motion') || id.includes('motion')) return 'framer-motion';
              if (id.includes('recharts') || id.includes('d3')) return 'recharts';
              if (id.includes('lucide-react')) return 'lucide-react';
              if (id.includes('firebase')) return 'firebase';
              if (id.includes('three') || id.includes('@react-three')) return 'three';
              if (id.includes('leaflet') || id.includes('react-leaflet')) return 'leaflet';
              if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-core';
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      hmr: false,
    },
  };
});
