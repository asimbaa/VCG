const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('leaflet/dist/images/marker-icon.png')) {
  const iconFix = `
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
`;
  
  if(code.includes("import App")) {
     code = code.replace("import App", iconFix + "\\nimport App");
     fs.writeFileSync('src/main.tsx', code);
  }
}
