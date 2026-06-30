// LogisticsMap.tsx - Updated with focus support
import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { motion } from 'motion/react';
import { Globe, ShieldCheck } from 'lucide-react';

const API_KEY =
  (typeof process !== "undefined" ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : "") ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface LogisticsMapProps {
  shipments: any[];
  selectedShipment?: any;
}

export const LogisticsMap: React.FC<LogisticsMapProps> = ({ shipments, selectedShipment }) => {
  if (!hasValidKey) {
    return (
      <div className="bg-slate-950 h-full min-h-[400px] flex items-center justify-center border border-slate-800 relative overflow-hidden rounded-[2rem] p-8 shadow-2xl text-center group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {/* Radar Sweeps */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-96 border-r border-blue-500/20 origin-top animate-[spin_8s_linear_infinite]" />
        
        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-slate-900/80 text-blue-400 rounded-full flex items-center justify-center mb-8 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            <Globe className="w-10 h-10" />
          </motion.div>
          
          <h3 className="text-white font-black text-2xl tracking-tighter mb-2 uppercase">Logistics Link Required</h3>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-8 px-4 leading-loose">
            Awaiting Secure Google Maps Integration<br/><span className="text-blue-500/50">Asset Tracking Locked</span>
          </p>
          
          <div className="space-y-4 w-full">
            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex items-start gap-4 transform transition-all hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest block mb-1">
                  System Auth Missing
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Setup <code className="text-blue-400">GOOGLE_MAPS_PLATFORM_KEY</code> in Settings → Secrets
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-defined static locations for effect (Sydney logistics hubs)
  const locs = [
    { lat: -33.8688, lng: 151.2093 },
    { lat: -33.91, lng: 151.18 },
    { lat: -33.82, lng: 151.19 },
    { lat: -33.88, lng: 151.22 }
  ];

  const sicilianoPos = { lat: -33.806, lng: 151.186 };
  const isSiciliano = (s: any) => s?.title?.toLowerCase().includes('siciliano');

  const getPos = (s: any, idx: number) => isSiciliano(s) ? sicilianoPos : locs[idx % locs.length];

  const center = selectedShipment ? getPos(selectedShipment, shipments.indexOf(selectedShipment)) : { lat: -33.86, lng: 151.20 };

  return (
    <div className="relative h-full min-h-[400px] shadow-2xl">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          center={center}
          zoom={selectedShipment ? 15 : 11}
          mapId="LOGISTICS_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {shipments.filter(s => s.status === 'in-transit').map((shipment, idx) => {
             const pos = getPos(shipment, idx);
             const isSelected = selectedShipment?.id === shipment.id;
             return (
               <AdvancedMarker key={shipment.id} position={pos}>
                 <Pin 
                    background={isSelected ? "#10b981" : "#3b82f6"} 
                    glyphColor="#fff" 
                    borderColor={isSelected ? "#fff" : "rgba(255,255,255,0.2)"} 
                    scale={isSelected ? 1.2 : 1}
                 />
               </AdvancedMarker>
             );
          })}
        </Map>
      </APIProvider>
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 border border-slate-700 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Asset Radar Active
        </div>
      </div>
    </div>
  );
};

