const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Inject the CSS variable to the root container
content = content.replace(
  /<div className="w-full h-full relative" style=\{style\}>/,
  '<div className="w-full h-full relative" style={{ ...style, "--anim-speed": `${animSpeed}ms` } as React.CSSProperties}>'
);

// Update pathOptions className to use the CSS variable
content = content.replace(
  /className: \`transition-all ease-in-out duration-\\\$\{animSpeed\} \\\$\{\(hoveredRouteId === route.id \|\| selectedRouteIds.includes\(route.id\)\) \? "animate-pulse" : ""\}\`/,
  'className: `transition-all ease-in-out duration-[var(--anim-speed)] ${(hoveredRouteId === route.id || selectedRouteIds.includes(route.id)) ? "animate-pulse" : ""}`'
);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
