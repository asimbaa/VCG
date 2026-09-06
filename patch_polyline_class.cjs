const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const targetClass = 'className: `transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[600ms] transform-gpu ${torrensSync ? "animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]" : ""} ${hoveredRouteId === route.id || selectedRouteIds.includes(route.id) ? "animate-pulse scale-110 stroke-[5px]" : "stroke-[2px]"} ${isVisible ? "" : "pointer-events-none"} ${trafficView ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] stroke-rose-500" : "drop-shadow-none"}`';

const replacementClass = 'className: `transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-[600ms] transform-gpu ${torrensSync ? "animate-[dash_2s_linear_infinite] [stroke-dasharray:10_20]" : ""} ${hoveredRouteId === route.id ? "route-hover-glow" : selectedRouteIds.includes(route.id) ? "scale-110 stroke-[5px]" : "stroke-[2px]"} ${isVisible ? "" : "pointer-events-none"} ${trafficView ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] stroke-rose-500" : "drop-shadow-none"}`';

code = code.replace(targetClass, replacementClass);
fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
