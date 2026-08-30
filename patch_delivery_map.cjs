const fs = require('fs');
let code = fs.readFileSync('src/components/bank/DeliveryMap.tsx', 'utf8');

code = code.replace(
  "const [map, setMap] = useState<google.maps.Map | null>(null);",
  "const mapRef = useRef<google.maps.Map | null>(null);"
);

code = code.replace(
  "onLoad={(mapInstance) => setMap(mapInstance)}",
  "onLoad={(mapInstance) => { mapRef.current = mapInstance; }}"
);

code = code.replace(
  "onUnmount={() => setMap(null)}",
  "onUnmount={() => { mapRef.current = null; }}"
);

// We need to replace all usages of `map` with `mapRef.current` globally EXCEPT the `map` inside standard array `.map(...)`
// It's safer to just replace specific patterns

code = code.replace(/if \(map\)/g, "if (mapRef.current)");
code = code.replace(/if \(map &&/g, "if (mapRef.current &&");
code = code.replace(/map\.setTilt/g, "mapRef.current.setTilt");
code = code.replace(/map\.getZoom/g, "mapRef.current.getZoom");
code = code.replace(/map\.setZoom/g, "mapRef.current.setZoom");
code = code.replace(/map\.panTo/g, "mapRef.current.panTo");

code = code.replace(/\[map, isTilted\]/g, "[isTilted]");
code = code.replace(/\[map, telemetry/g, "[telemetry");

fs.writeFileSync('src/components/bank/DeliveryMap.tsx', code);
console.log("Patched DeliveryMap.tsx");
