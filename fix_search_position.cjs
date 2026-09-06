const fs = require('fs');

let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Replace localFleet with routes + fleet
const newLocalData = `
  const [activeCar, setActiveCar] = useState<any>(null);
  const [sentryActive, setSentryActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const localFleet = fleet || [
    { id: 1, lat: -33.8688, lng: 151.2093, name: "AURA-9 Alpha", status: "Active" },
    { id: 2, lat: -33.8700, lng: 151.2000, name: "AURA-9 Beta", status: "Charging" },
    { id: 3, lat: -33.8800, lng: 151.2100, name: "AURA-9 Gamma", status: "Active" }
  ];

  const routeSegments = [
    { id: "R-101", name: "Route Segment - Harbour", positions: [[-33.8650, 151.2050], [-33.8600, 151.2100], [-33.8550, 151.2150]], color: "#06C167" },
    { id: "R-102", name: "Route Segment - CBD Core", positions: [[-33.8750, 151.2150], [-33.8700, 151.2100], [-33.8650, 151.2000]], color: "#3b82f6" },
    { id: "R-103", name: "Route Segment - Eastern Suburbs", positions: [[-33.8800, 151.2200], [-33.8850, 151.2250], [-33.8900, 151.2300]], color: "#8b5cf6" }
  ];

  const filteredFleet = localFleet.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.id.toString() === searchQuery
  );

  const filteredRoutes = routeSegments.filter(route => 
    searchQuery === "" || 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
`;

content = content.replace(/const \[activeCar, setActiveCar\][\s\S]*?car\.id\.toString\(\) === searchQuery\s*\);/, newLocalData);

const newUI = `
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
        
        {/* Render filtered routes */}
        {filteredRoutes.map((route) => (
          <Polyline 
            key={route.id} 
            positions={route.positions as [number, number][]} 
            pathOptions={{ 
               color: route.color, 
               weight: searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase())) ? 8 : 4,
               opacity: searchQuery && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || route.id.toLowerCase().includes(searchQuery.toLowerCase())) ? 1 : 0.6
            }} 
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-black text-slate-800 mb-1">{route.name}</h4>
                <p className="text-xs text-slate-500">ID: {route.id}</p>
              </div>
            </Popup>
          </Polyline>
        ))}

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
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end pointer-events-none">
        
        {/* Fixed Top-Right Search Interface */}
        <div className="w-64 md:w-80 pointer-events-auto">
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

        <div className="pointer-events-auto">
`;

content = content.replace(/<MapContainer[\s\S]*?<div className="absolute top-4 right-4 z-\[400\]">/, newUI);

// add missing import if needed
if (!content.includes('Search')) {
    content = content.replace(/Thermometer } from 'lucide-react';/, "Thermometer, Search } from 'lucide-react';");
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
