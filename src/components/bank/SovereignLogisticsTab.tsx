import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, Car, Navigation, Zap, Box, Lock, Activity, Wifi, CheckCircle2, AlertTriangle, Crosshair, ChevronRight, Package, Server } from 'lucide-react';
import { toast } from 'sonner';

export function SovereignLogisticsTab() {
  const [activeView, setActiveView] = useState<'map' | 'fleet' | 'assets'>('map');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const fleet = [
    { id: 'VLF-01-MASC', model: 'Tesla Model Y Stealth', type: 'Armored Carrier', status: 'ACTIVE', location: 'Mascot, NSW', lat: -33.9317, lng: 151.1895, speed: '42 km/h', payload: 'Sovereign Core Servers', battery: '89%' },
    { id: 'VLF-02-CHAT', model: 'Tesla Model 3 LR', type: 'Executive Transport', status: 'CHARGING', location: 'Chatswood, NSW', lat: -33.7997, lng: 151.1837, speed: '0 km/h', payload: 'None', battery: '95%' },
    { id: 'VLF-03-CBD', model: 'Range Rover Sentinel', type: 'Heavy Armored', status: 'ACTIVE', location: 'Sydney CBD', lat: -33.8688, lng: 151.2093, speed: '24 km/h', payload: 'Hardware Security Modules', battery: '100%' },
    { id: 'VLF-04-AERO', model: 'Sovereign Drone X1', type: 'Airborne Express', status: 'STANDBY', location: 'Aura Base, Clontarf', lat: -33.8055, lng: 151.2612, speed: '0 km/h', payload: 'Ready', battery: '100%' }
  ];

  const highValueAssets = [
    { id: 'ASSET-291', name: 'Global Treasury Hardware Wallet', origin: 'Mascot HQ', destination: 'Secure Data Center (CBD)', ETA: '14 Mins', status: 'EN ROUTE', carrier: 'VLF-01-MASC' },
    { id: 'ASSET-994', name: 'Mac Studio Server Cluster', origin: 'Apple Store Sydney', destination: 'Clontarf Base', ETA: 'Delivered', status: 'SECURED', carrier: 'VLF-02-CHAT' },
    { id: 'ASSET-101', name: 'Physical AUD Reserves', origin: 'RBA Mascot', destination: 'Global Vault 9', ETA: 'Pending Clearance', status: 'PREPARING', carrier: 'VLF-03-CBD' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-slate-900 to-slate-900 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-950 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Truck className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                Valourian <span className="text-blue-400">Logistics</span>
              </h1>
              <p className="text-slate-400 font-mono text-sm max-w-xl">
                Global Mobile HQ & High-Value Asset Transport Tracking. Fully autonomous neural routing synchronized with the Sovereign Credit Rails.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sovereign Grid Online
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              14 Active Routes
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px]">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Navigation */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
            {[
              { id: 'map', icon: MapPin, label: 'Live Map' },
              { id: 'fleet', icon: Car, label: 'Fleet Status' },
              { id: 'assets', icon: Package, label: 'Asset Tracker' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl transition-all ${
                  activeView === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contextual Side Panel */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-y-auto shadow-xl flex flex-col relative">
            {activeView === 'map' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-blue-400" /> Active Tracking Vectors
                </h3>
                {fleet.filter(f => f.status === 'ACTIVE').map(vehicle => (
                  <button 
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedVehicle?.id === vehicle.id ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold text-sm">{vehicle.id}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{vehicle.status}</span>
                    </div>
                    <div className="text-slate-400 font-mono text-xs mb-3">{vehicle.model}</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-blue-400" /> {vehicle.speed}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" /> {vehicle.location}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeView === 'fleet' && (
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400" /> Global Fleet Roster
                </h3>
                {fleet.map(vehicle => (
                  <div key={vehicle.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-sm">{vehicle.id}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        vehicle.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        vehicle.status === 'CHARGING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg text-slate-400"><span className="text-slate-600 block text-[9px] font-sans font-black tracking-widest uppercase mb-1">Model</span>{vehicle.model}</div>
                      <div className="bg-slate-900 p-2 rounded-lg text-slate-400"><span className="text-slate-600 block text-[9px] font-sans font-black tracking-widest uppercase mb-1">Type</span>{vehicle.type}</div>
                      <div className="bg-slate-900 p-2 rounded-lg text-slate-400"><span className="text-slate-600 block text-[9px] font-sans font-black tracking-widest uppercase mb-1">Battery</span>{vehicle.battery}</div>
                      <div className="bg-slate-900 p-2 rounded-lg text-slate-400"><span className="text-slate-600 block text-[9px] font-sans font-black tracking-widest uppercase mb-1">Payload</span>{vehicle.payload}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'assets' && (
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" /> Secure Transport Ledger
                </h3>
                {highValueAssets.map(asset => (
                  <div key={asset.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] font-mono font-bold text-slate-400">{asset.id}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        asset.status === 'EN ROUTE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        asset.status === 'SECURED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {asset.status}
                      </div>
                    </div>
                    <div className="text-white font-bold text-sm mb-4 leading-snug">{asset.name}</div>
                    
                    <div className="relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-800" />
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950" />
                          <div className="text-xs text-slate-400 font-medium">{asset.origin}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-950 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <div className="text-xs text-white font-bold">{asset.destination}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Carrier: <span className="text-slate-300">{asset.carrier}</span></div>
                      <div className="text-xs font-mono font-bold text-blue-400">{asset.ETA}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Interactive Area (Map / Diagnostics) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
          {/* Header Bar */}
          <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
              <Server className="w-4 h-4 text-blue-500" />
              Global Telemetry Link
            </div>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <Wifi className="w-3 h-3" /> UPLINK SECURE
               </span>
               <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  LAT: 12ms
               </span>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 relative bg-[#020617]">
             {/* Mock Map Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#020617_80%)] pointer-events-none" />
             
             {/* Rendering Mock Map UI based on selected vehicle or default overview */}
             <div className="absolute inset-0 flex items-center justify-center p-8">
               {selectedVehicle && activeView === 'map' ? (
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-md border border-blue-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden"
                 >
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                   
                   <div className="relative z-10 flex flex-col items-center text-center">
                     <div className="relative mb-8">
                       <div className="w-32 h-32 rounded-full border border-blue-500/30 flex items-center justify-center relative">
                         <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                         <div className="absolute inset-2 border-r-2 border-emerald-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                         <Car className="w-10 h-10 text-white" />
                       </div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/10 rounded-full flex items-center justify-center pointer-events-none">
                          <div className="w-4 h-4 bg-blue-500/50 rounded-full blur-md absolute top-0 -translate-y-1/2 animate-ping" />
                       </div>
                     </div>

                     <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">{selectedVehicle.id}</h2>
                     <p className="text-blue-400 font-mono text-sm tracking-wider mb-8">{selectedVehicle.model}</p>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                       <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Velocity</div>
                         <div className="text-lg font-bold text-white font-mono">{selectedVehicle.speed}</div>
                       </div>
                       <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Battery</div>
                         <div className="text-lg font-bold text-emerald-400 font-mono">{selectedVehicle.battery}</div>
                       </div>
                       <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Lat/Lng</div>
                         <div className="text-xs font-bold text-slate-300 font-mono pt-1">{selectedVehicle.lat.toFixed(3)} / {selectedVehicle.lng.toFixed(3)}</div>
                       </div>
                       <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center flex flex-col justify-center">
                         <button onClick={() => toast.success(`Secure comms established with ${selectedVehicle.id}`)} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-colors w-full">
                           Ping Unit
                         </button>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="flex flex-col items-center justify-center text-center opacity-50 relative z-10">
                   <GlobeIcon className="w-32 h-32 text-blue-500/50 mb-6 animate-pulse" />
                   <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Global Overseer Active</h3>
                   <p className="text-slate-400 font-mono text-sm max-w-md">Select a vehicle from the tracking vectors panel to initiate a focused neural link and view live telemetry.</p>
                 </div>
               )}
             </div>

             {/* UI Overlay Indicators */}
             <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
               <div className="bg-slate-950/80 backdrop-blur border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">GPS Link Active</span>
               </div>
               <div className="bg-slate-950/80 backdrop-blur border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-3">
                 <Lock className="w-3 h-3 text-blue-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Crypto Routing</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
