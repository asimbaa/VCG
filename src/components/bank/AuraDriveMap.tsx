// AuraDriveMap.tsx - Updated with Route Simulation & Neural Sentry (Leaflet version)
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, DivIcon } from 'leaflet';
import { Button } from "../ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MessageSquare, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer } from 'lucide-react';

const transportIcon = new DivIcon({
  html: `<div class="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: '',
  iconSize: [16, 16],
});

const NeuralSentryOverlay = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-[1px] border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
    </div>
  );
};

export function AuraDriveMap({ style, fleet }: { style?: React.CSSProperties; fleet?: any[] }) {
  const [activeCar, setActiveCar] = useState<any>(null);
  const [sentryActive, setSentryActive] = useState(false);

  const localFleet = fleet || [
    { id: 1, lat: -33.8688, lng: 151.2093, name: "AURA-9 Alpha", status: "Active" },
    { id: 2, lat: -33.8700, lng: 151.2000, name: "AURA-9 Beta", status: "Charging" },
    { id: 3, lat: -33.8800, lng: 151.2100, name: "AURA-9 Gamma", status: "Active" },
  ];

  return (
    <div className="w-full h-full relative" style={style}>
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
        {localFleet.map(car => (
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

      {sentryActive && <NeuralSentryOverlay />}
      
      <div className="absolute top-4 right-4 z-[400]">
        <Button 
          onClick={() => {
            setSentryActive(!sentryActive);
            toast.success(sentryActive ? "Neural Sentry Deactivated" : "Neural Sentry Activated");
          }}
          className={sentryActive ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-800 hover:bg-slate-700"}
        >
          <Cpu className="w-4 h-4 mr-2" /> 
          {sentryActive ? "Sentry Active" : "Enable Sentry"}
        </Button>
      </div>
    </div>
  );
}
