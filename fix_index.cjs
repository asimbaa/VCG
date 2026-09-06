const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injection = `
    <script>
      const __originalError = console.error;
      console.error = function(...args) {
        if (typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('WebSocket') || args[0].includes('ResizeObserver'))) return;
        if (args[0] && args[0].message && (args[0].message.includes('WebSocket') || args[0].message.includes('[vite]'))) return;
        __originalError.apply(console, args);
      };
      
      const __originalWarn = console.warn;
      console.warn = function(...args) {
        if (typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('WebSocket'))) return;
        __originalWarn.apply(console, args);
      };

      const __originalLog = console.log;
      console.log = function(...args) {
        if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
        __originalLog.apply(console, args);
      };

      window.addEventListener('error', function(e) {
        if (e.message && (e.message.includes('WebSocket') || e.message.includes('[vite]') || e.message.includes('ResizeObserver'))) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
      window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && (e.reason.message && (e.reason.message.includes('WebSocket') || e.reason.message.includes('[vite]')))) {
          e.preventDefault();
        }
      });
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
`;

code = code.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', injection);
fs.writeFileSync('index.html', code);
