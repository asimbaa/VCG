const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Remove Duplicate Download
code = code.replace(/  AlertTriangle,\n  Plus,\n  Minus,\n  Download\n} from "lucide-react";/g, '  AlertTriangle,\n  Plus,\n  Minus\n} from "lucide-react";');

// Remove activePolylinesCount at line 606
code = code.replace(/  const activePolylinesCount = routeSegments\.filter\(checkIsVisible\)\.length;\n  const getRouteColor =/g, '  const getRouteColor =');

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
