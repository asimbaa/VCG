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
        injectRegister: null,
        includeAssets: ['apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        devOptions: { enabled: false },
        manifest: {
          id: '/',
          name: 'Valourian Capital Management',
          short_name: 'Valourian',
          description: 'Tier 1 Global Treasury OS. Encrypted administrative interface securing over $1.02 Trillion AUD in unified global assets, real estate, global transportation networks, and deep tech investments.',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          categories: ['finance', 'business', 'productivity'],
          icons: [
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ],
          shortcuts: [
            {
              name: 'RapidPay Fast Test',
              short_name: 'RapidPay',
              description: 'Launch 6-rail rapid payments and settlement test suite',
              url: '/?tab=rapidpay',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'VBank Virtual Cards',
              short_name: 'Cards',
              description: 'Manage sovereign digital credit cards and dynamic Quantum CVVs',
              url: '/?tab=cards',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Sovereign Treasury',
              short_name: 'Treasury',
              description: 'View institutional reserves and CommBank linked balances',
              url: '/?tab=treasury',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
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
