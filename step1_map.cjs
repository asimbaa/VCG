const fs = require('fs');
let file = fs.readFileSync('src/components/bank/SovereignDispatchMonitor.tsx', 'utf8');

// Add Leaflet imports
if (!file.includes('MapContainer')) {
    file = file.replace(
        'import { toast } from \'sonner\';',
        'import { toast } from \'sonner\';\nimport { MapContainer, TileLayer, Marker, Popup, useMap } from \'react-leaflet\';\nimport \'leaflet/dist/leaflet.css\';\nimport L from \'leaflet\';\n\n// Fix leaflet icons\ndelete (L.Icon.Default.prototype as any)._getIconUrl;\nL.Icon.Default.mergeOptions({\n  iconRetinaUrl: \'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png\',\n  iconUrl: \'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png\',\n  shadowUrl: \'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png\',\n});\n'
    );
}

// Modify the view structure to add Map
const mapBlock = `
                    <div className="lg:col-span-1 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative h-[400px] xl:h-auto">
                        <MapContainer center={[-33.8688, 151.2093]} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {fleet.map((v) => (
                                <Marker key={v.id} position={[v.coordinates.lat, v.coordinates.lng]}>
                                    <Popup className="bg-slate-900 border border-slate-800 text-white rounded-xl p-0">
                                        <div className="font-bold text-sm mb-1">{v.vehicleId}</div>
                                        <div className="text-xs text-slate-400">{v.status}</div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl shadow-lg backdrop-blur-md">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                <Activity className="w-4 h-4 animate-pulse" /> LIVE TRACKING ACTIVE
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
`;

// we need to find where the grid starts and split it
if (!file.includes('MapContainer')) {
    file = file.replace(
        '<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">',
        '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">' + mapBlock
    );
    file = file.replace(
        '</button>\n                    </div>\n                </div>\n\n                {loading',
        '</button>\n                    </div>\n                </div>\n\n                {loading'
    );
}

fs.writeFileSync('src/components/bank/SovereignDispatchMonitor.tsx', file);
