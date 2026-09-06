const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('ResizeObserver loop limit')) {
  const roFix = `
// Suppress ResizeObserver benign errors
const suppressResizeObserver = () => {
  const resizeObserverErrDiv = document.createElement('div');
  const _error = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop limit exceeded')) {
      return;
    }
    _error(...args);
  };
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop limit exceeded') {
      e.stopImmediatePropagation();
    }
  });
};
suppressResizeObserver();
`;
  
  code = code + "\\n" + roFix;
  fs.writeFileSync('src/main.tsx', code);
}
