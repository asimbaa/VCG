import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, DivIcon } from 'leaflet';
import { GLOBAL_PROPERTIES_DATABASE } from './VaultRecords';

// Custom icons
const propertyIcon = new DivIcon({
  html: `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: '',
  iconSize: [16, 16],
});

const transportIcon = new DivIcon({
  html: `<div class="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: '',
  iconSize: [16, 16],
});

export function GlobalAssetsMap() {
  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {GLOBAL_PROPERTIES_DATABASE.map((prop, idx) => {
          // A rough geocoding mock based on cities since coordinates aren't in the DB natively, 
          // but we can generate them or just map known ones.
          let lat = 0; let lng = 0;
          if (prop.address.includes('Sydney') || prop.address.includes('NSW')) { lat = -33.8688; lng = 151.2093; }
          else if (prop.address.includes('San Francisco')) { lat = 37.7749; lng = -122.4194; }
          else if (prop.address.includes('New York') || prop.address.includes('NY')) { lat = 40.7128; lng = -74.0060; }
          else if (prop.address.includes('Monaco')) { lat = 43.7384; lng = 7.4246; }
          else if (prop.address.includes('Dubai')) { lat = 25.2048; lng = 55.2708; }
          else if (prop.address.includes('Tokyo')) { lat = 35.6762; lng = 139.6503; }
          else if (prop.address.includes('London')) { lat = 51.5074; lng = -0.1278; }
          else if (prop.address.includes('Miami')) { lat = 25.7617; lng = -80.1918; }
          else if (prop.address.includes('Los Angeles') || prop.address.includes('CA')) { lat = 34.0522; lng = -118.2437; }
          else if (prop.address.includes('Paris')) { lat = 48.8566; lng = 2.3522; }
          else { lat = (Math.random() * 100) - 50; lng = (Math.random() * 360) - 180; }

          if (lat === 0) return null;
          
          return (
            <Marker key={`prop-${idx}`} position={[lat + (Math.random() - 0.5) * 0.1, lng + (Math.random() - 0.5) * 0.1]} icon={propertyIcon}>
              <Popup className="custom-popup">
                <div className="p-2">
                  <h4 className="font-black text-slate-800 mb-1">{prop.type}</h4>
                  <p className="text-xs text-slate-500 mb-2">{prop.address}</p>
                  <p className="text-sm font-bold text-emerald-600">{prop.value}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Transportation Assets */}
        <Marker position={[-33.86, 151.21]} icon={transportIcon}>
          <Popup>
            <div className="p-2">
              <h4 className="font-black text-slate-800 mb-1">AURA-9 Private Jet (G700)</h4>
              <p className="text-xs text-slate-500 mb-2">Sydney Kingsford Smith (SYD)</p>
            </div>
          </Popup>
        </Marker>
        <Marker position={[37.61, -122.38]} icon={transportIcon}>
          <Popup>
            <div className="p-2">
              <h4 className="font-black text-slate-800 mb-1">Valourian Executive Helicopter</h4>
              <p className="text-xs text-slate-500 mb-2">SFO International</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
