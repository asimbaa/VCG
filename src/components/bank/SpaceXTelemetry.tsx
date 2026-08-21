import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Satellite, Car, Smartphone, Activity, MapPin, Compass, ShieldCheck } from 'lucide-react';

interface AssetTelemetry {
  id: string;
  type: 'spacex' | 'tesla' | 'uber' | 'ubereats';
  name: string;
  status: string;
  lat: number;
  lng: number;
  altitude?: number;
  velocity: number;
  battery?: number;
  destination?: string;
  progress: number;
}

const MOCK_ASSETS: AssetTelemetry[] = [
  { id: 'sx-1', type: 'spacex', name: 'Starlink V2 LEO-99', status: 'Orbit Stabilized', lat: -33.8688, lng: 151.2093, altitude: 540, velocity: 27500, progress: 100 },
  { id: 'sx-2', type: 'spacex', name: 'Falcon 9 Booster B1060', status: 'Landing Approach', lat: -34.0, lng: 151.3, altitude: 12, velocity: 800, progress: 95 },
  { id: 'ts-1', type: 'tesla', name: 'Model S Plaid (Valourian Fleet)', status: 'Autopilot Active', lat: -33.872, lng: 151.205, velocity: 112, battery: 84, destination: 'Sovereign Tower', progress: 45 },
  { id: 'ub-1', type: 'uber', name: 'Uber Black VIP', status: 'En Route to Pickup', lat: -33.875, lng: 151.210, velocity: 45, destination: 'Sydney Airport (SYD)', progress: 20 },
  { id: 'ue-1', type: 'ubereats', name: 'Elite Eats Courier', status: 'Delivering', lat: -33.810, lng: 151.185, velocity: 62, destination: 'Unit 712, 15 Barton Rd', progress: 78 }
];

export const SpaceXTelemetry: React.FC<{
  onClose?: () => void;
}> = ({ onClose }) => {
  const [assets, setAssets] = useState<AssetTelemetry[]>(MOCK_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<AssetTelemetry | null>(MOCK_ASSETS[0]);

  // Simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        // slight variations
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        const velChange = (Math.random() - 0.5) * 10;
        return {
          ...asset,
          lat: asset.lat + latChange,
          lng: asset.lng + lngChange,
          velocity: Math.max(0, asset.velocity + velChange),
          progress: asset.progress < 100 ? Math.min(100, asset.progress + (Math.random() * 0.5)) : 100
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'spacex': return <Rocket className="w-5 h-5 text-purple-400" />;
      case 'tesla': return <Car className="w-5 h-5 text-red-400" />;
      case 'uber': return <Car className="w-5 h-5 text-white" />;
      case 'ubereats': return <Smartphone className="w-5 h-5 text-[#06C167]" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col md:flex-row border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Satellite className="w-5 h-5 text-emerald-500" />
              Global Telemetry
            </h2>
            <p className="text-slate-400 text-xs font-medium">Real-time asset tracking</p>
          </div>
          {onClose && (
             <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
               ✕
             </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {assets.map(asset => (
            <div 
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedAsset?.id === asset.id ? 'bg-slate-800 border-slate-600 shadow-lg' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getIcon(asset.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-100 font-bold text-sm">{asset.name}</h3>
                  <p className="text-slate-400 text-xs font-mono mt-1">{asset.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Telemetry View */}
      <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
        {/* Background Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {selectedAsset ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedAsset.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative z-10 flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
                    {getIcon(selectedAsset.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-black text-white">{selectedAsset.name}</h1>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">{selectedAsset.id} // {selectedAsset.status}</p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Network Uplink</div>
                  <div className="text-emerald-400 font-mono font-bold">SECURE / ENCRYPTED</div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Latitude</span>
                  <div className="text-xl font-mono text-white">{selectedAsset.lat.toFixed(5)}°</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Longitude</span>
                  <div className="text-xl font-mono text-white">{selectedAsset.lng.toFixed(5)}°</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Velocity</span>
                  <div className="text-xl font-mono text-amber-400">{selectedAsset.velocity.toFixed(0)} <span className="text-sm text-slate-500">km/h</span></div>
                </div>
                {selectedAsset.altitude !== undefined ? (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Altitude</span>
                    <div className="text-xl font-mono text-purple-400">{selectedAsset.altitude.toFixed(0)} <span className="text-sm text-slate-500">km</span></div>
                  </div>
                ) : selectedAsset.battery !== undefined ? (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Battery</span>
                    <div className="text-xl font-mono text-emerald-400">{selectedAsset.battery.toFixed(1)}%</div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Progress</span>
                    <div className="text-xl font-mono text-blue-400">{selectedAsset.progress.toFixed(0)}%</div>
                  </div>
                )}
              </div>

              {/* Progress Bar / Destination */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Destination Target</span>
                    <div className="text-white font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {selectedAsset.destination || 'ORBITAL INSERTION / STABLE'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Completion</span>
                    <div className="text-white font-mono font-bold">{selectedAsset.progress.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedAsset.progress}%` }}
                    transition={{ type: "tween", duration: 1 }}
                  />
                </div>
              </div>

            
          
              {/* Control Panel Form */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Tactical Command Interface
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const cmd = formData.get('command');
                    const params = formData.get('params');
                    alert(`Executing Tactical Command: ${cmd} with params: ${params} on Asset: ${selectedAsset.name}`);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Primary Directive</label>
                      <select name="command" className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors">
                        <option value="RE-ROUTE">Reroute Asset Vector</option>
                        <option value="HOLD">Hold Position / Hover</option>
                        <option value="ACCELERATE">Engage Maximum Velocity</option>
                        <option value="RTB">Return to Base (Sovereign HQ)</option>
                        <option value="ABORT">Emergency Abort</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Execution Parameters</label>
                      <input name="params" type="text" placeholder="e.g. Authorized Override Code 99" className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors" required />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20">
                      Transmit Command
                    </button>
                  </div>
                </form>
              </div>

            
          
            </motion.div>
          </AnimatePresence>

        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm uppercase">
            Select an asset to view telemetry
          </div>
        )}
      </div>
    </div>
  );
};
