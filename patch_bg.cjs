const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const bgStyles = `
@keyframes slowPan {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.valourian-ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background-color: #020617;
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  animation: slowPan 120s linear infinite alternate;
  pointer-events: none;
}
`;

code += bgStyles;
fs.writeFileSync('src/index.css', code);
