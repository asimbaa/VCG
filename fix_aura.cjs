const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const searchBarReplacement = `
  const [activeCar, setActiveCar] = useState<any>(null);
  const [sentryActive, setSentryActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const localFleet = fleet || [
    { id: 1, lat: -33.8688, lng: 151.2093, name: "AURA-9 Alpha", status: "Active" },
    { id: 2, lat: -33.8700, lng: 151.2000, name: "AURA-9 Beta", status: "Charging" },
    { id: 3, lat: -33.8800, lng: 151.2100, name: "AURA-9 Gamma", status: "Active" },
    { id: 4, lat: -33.8650, lng: 151.2050, name: "Route Segment - Harbour", status: "Patrol" },
    { id: 5, lat: -33.8750, lng: 151.2150, name: "Route Segment - CBD Core", status: "Secured" }
  ];

  const filteredFleet = localFleet.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.id.toString() === searchQuery
  );
`;

const uiReplacement = `
      <MapContainer 
         center={[-33.8688, 151.2093]} 
         zoom={13} 
         style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {filteredFleet.map(car => (
          <Marker 
            key={car.id} 
            position={[car.lat, car.lng]} 
            icon={transportIcon}
            eventHandlers={{
              click: () => setActiveCar(car),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-black text-slate-800 mb-1">{car.name}</h4>
                <p className="text-xs text-slate-500">{car.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map UI Overlays */}
      <div className="absolute top-4 left-4 z-[400] w-64 md:w-80">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
           <Search className="w-4 h-4 text-slate-400 ml-2" />
           <input 
             type="text"
             placeholder="Search routes or IDs..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-medium py-1"
           />
        </div>
      </div>

      {sentryActive && <NeuralSentryOverlay />}
      
      <div className="absolute top-4 right-4 z-[400]">
`;

content = content.replace(/const \[activeCar, setActiveCar\] = useState<any>\(null\);\s*const \[sentryActive, setSentryActive\] = useState\(false\);\s*const localFleet = fleet \|\| \[[^\]]+\];/, searchBarReplacement);
content = content.replace(/<MapContainer[\s\S]*?<\/MapContainer>\s*\{sentryActive && <NeuralSentryOverlay \/>\}\s*<div className="absolute top-4 right-4 z-\[400\]">/, uiReplacement);

if (!content.includes('Search')) {
    content = content.replace(/Thermometer } from 'lucide-react';/, "Thermometer, Search } from 'lucide-react';");
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
