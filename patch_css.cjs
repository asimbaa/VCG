const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const keyframeCSS = `
@keyframes routePulseGlow {
  0% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.9)); transform: scale(1.02); }
  100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); transform: scale(1); }
}

.route-hover-glow {
  animation: routePulseGlow 1.5s infinite ease-in-out;
  transform-origin: center;
}
`;

code += keyframeCSS;
fs.writeFileSync('src/index.css', code);
