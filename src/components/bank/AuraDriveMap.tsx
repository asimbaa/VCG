// AuraDriveMap.tsx - Updated with Route Simulation & Neural Sentry
import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from "../ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, MessageSquare, Volume2, BellRing, ChevronRight, Globe, ShieldCheck, Activity, Cpu, Fingerprint, Zap, Lock, Unlock, Thermometer } from 'lucide-react';

const NeuralSentryOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#60a5fa';
      
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Horizontal scan lines
        if (Math.random() > 0.98) {
          ctx.globalAlpha = 0.05;
          ctx.fillRect(0, p.y, canvas.width, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full opacity-40" />;
};

const API_KEY =
  (typeof process !== "undefined" ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : "") ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface AuraDriveMapProps {
  fleet: any[];
}

const RouteDisplay = ({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;
    
    // Clear previous
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING' as any,
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    }).catch(err => console.error("Routing Error:", err));

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
};

export const AuraDriveMap: React.FC<AuraDriveMapProps> = ({ fleet }) => {
  const [activeCar, setActiveCar] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isSpotting, setIsSpotting] = useState(false);
  
  // Custom interactive control states for owned IPs (Tesla, Kia, BYD, Apple)
  const [lockedCars, setLockedCars] = useState<Record<string, boolean>>({});
  const [climateTemps, setClimateTemps] = useState<Record<string, number>>({});
  const [summoningCarId, setSummoningCarId] = useState<string | null>(null);
  const [summonProgress, setSummonProgress] = useState(0);
  const [summonStatus, setSummonStatus] = useState("");

  const [addressInput, setAddressInput] = useState("");
  const [recentAddresses, setRecentAddresses] = useState<{label: string, type: string}[]>(() => {
    try {
      const saved = window.localStorage.getItem('recent_uber_addresses_v2');
      return saved ? JSON.parse(saved) : [
        { label: "Emergency Evac (Neuralink Priority)", type: "emergency" },
        { label: "Work HQ (Artarmon)", type: "work" },
        { label: "Sydney Airport", type: "recent" }, 
        { label: "St Leonards Reserve", type: "recent" },
        { label: "Woolworths Neutral Bay", type: "utility" },
        { label: "Wants & Desires (Surprise Me)", type: "desire" }
      ];
    } catch {
      return [
        { label: "Emergency Evac (Neuralink Priority)", type: "emergency" },
        { label: "Work HQ (Artarmon)", type: "work" },
        { label: "Sydney Airport", type: "recent" }, 
        { label: "St Leonards Reserve", type: "recent" },
        { label: "Woolworths Neutral Bay", type: "utility" },
        { label: "Wants & Desires (Surprise Me)", type: "desire" }
      ];
    }
  });
  const [showRecent, setShowRecent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const [tripSummary, setTripSummary] = useState<{distance: string, fare: string, duration: string} | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddressChange = (input: string) => {
    setAddressInput(input);
    setShowRecent(true);
    
    // Dynamic fare and duration estimation based on input length/mock calculation
    if (input.length > 2) {
      const distanceCalc = (input.length * 0.8).toFixed(1);
      const fareCalc = (input.length * 2.5 + 5).toFixed(2);
      const durationCalc = Math.max(5, input.length * 2);
      setTripSummary({
        distance: `${distanceCalc} km`,
        fare: `$${fareCalc} AUD`,
        duration: `${durationCalc} min`
      });
    } else {
      setTripSummary(null);
    }
  };

  const handleDispatch = (destination: string, service: string = "Uber Enterprise") => {
    if (!destination.trim()) return;
    
    // Finalize Trip Calculation
    const dist = (destination.length * 0.8).toFixed(1);
    const fare = (destination.length * 2.5 + 5).toFixed(2);
    const dur = Math.max(5, destination.length * 2);
    const summary = { distance: `${dist} km`, fare: `$${fare} AUD`, duration: `${dur} min` };
    setTripSummary(summary);
    
    toast.success(`Trip Confirmed: ${service} dispatched to ${destination}`);
    toast.info(`Text Alert: Your driver is enroute. ETA: ${dur} minutes. Status: Secure Transit.`);
    
    speak(`Dispatching ${service} to ${destination}. Your driver is enroute, estimated duration is ${dur} minutes.`);
    
    setRecentAddresses(prev => {
      const isExisting = prev.find(a => a.label === destination);
      let newList = prev;
      if (!isExisting) {
        newList = [{ label: destination, type: 'recent' }, ...prev].slice(0, 8);
      }
      window.localStorage.setItem('recent_uber_addresses_v2', JSON.stringify(newList));
      return newList;
    });
    setAddressInput("");
    setShowRecent(false);
    
    setTimeout(() => {
      speak("Trip completed. Please rate your experience on the console.");
      setShowFeedback(true);
      setTripSummary(null);
    }, 8000); // Simulate trip end
  };

  const handleSubmitFeedback = () => {
    toast.success("Feedback saved securely to trip history ledger.");
    setShowFeedback(false);
    setRating(0);
    setFeedbackText("");
  };

  const homePos = { lat: -33.8085, lng: 151.1832 }; // Precise Barton Rd X Reserve Rd intersection

  const handleSpotCar = () => {
    setIsSpotting(true);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Light honk sound
    audio.play().catch(() => {}); // Ignore silent failures
    setTimeout(() => setIsSpotting(false), 5000);
  };

  useEffect(() => {
    if (activeCar) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 100));
      }, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeCar]);

  if (!hasValidKey) {
    return (
      <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group flex flex-col">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Aura Drive: Sovereign Map Link Active
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Starlink Satellite Handshake: COMPLETED // FSD v12.5 Live</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[9px] font-black text-emerald-400 uppercase">Secure Feed</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-900 relative">
           <NeuralSentryOverlay />
           <iframe 
              src={`https://maps.google.com/maps?q=${activeCar ? activeCar.lat : -33.805},${activeCar ? activeCar.lng : 151.185}&z=13&output=embed`}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
           
           <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              {fleet.map(car => (
                <div key={car.id} className="bg-slate-900/90 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl shadow-2xl min-w-[180px]">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-white">{car.plate}</span>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">{car.battery}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium truncate">{car.model}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest leading-none">Live - FSD Active</span>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {fleet.map(car => (
            <button 
              key={car.id}
              onClick={() => setActiveCar(car)}
              className={`flex-none px-6 py-3 rounded-2xl border transition-all ${activeCar?.id === car.id ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-900/80 backdrop-blur-xl border-slate-700 text-slate-300 hover:border-slate-500'}`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">{car.plate}</div>
              <div className="text-[9px] opacity-80 whitespace-nowrap">{car.model}</div>
            </button>
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Sydney coordinates around Artarmon & Chatswood Hubs
  const carPositions: Record<string, google.maps.LatLngLiteral> = {
    "A1": { lat: -33.8085, lng: 151.1832 }, // Barton Rd X Reserve Rd
    "A2": { lat: -33.8085, lng: 151.1832 }, // Barton Rd X Reserve Rd (Beast Standby)
    "A3": { lat: -33.848, lng: 151.212 },   // Milsons Point
    "A4": { lat: -33.815, lng: 151.189 },   // Brand St Garage
    "A5": { lat: -33.791, lng: 151.192 },   // Tesla Chatswood
    "A6": { lat: -33.791, lng: 151.192 },   // Tesla Chatswood
    "A7": { lat: -33.883, lng: 151.216 },   // Surry Hills (Yangwang)
    "A8": { lat: -33.832, lng: 151.221 },   // Neutral Bay (Sealion)
    "A9": { lat: -33.8085, lng: 151.1832 }, // Barton Rd (EV9)
    "A10": { lat: -33.935, lng: 151.171 },  // Mascot Terminal (EV6)
    "A11": { lat: -33.8085, lng: 151.1832 },// Barton Rd (iVision Concept)
  };

  const activePos = activeCar ? { lat: activeCar.lat, lng: activeCar.lng } : null;

  // Enhance the fleet with Global Uber Enterprise Partner vehicles
  const UBER_ENTERPRISE_MOCK = [
    { id: 'uber-1', plate: 'UBER-E101', model: 'Uber Black (S Class)', status: 'Active (Uber Partner)', lat: -33.811, lng: 151.181, battery: '100%' },
    { id: 'uber-2', plate: 'UBER-E205', model: 'Uber Exec (Model Y)', status: 'Active (Uber Partner)', lat: -33.805, lng: 151.192, battery: '92%' },
    { id: 'uber-3', plate: 'UBER-E311', model: 'Uber Prem (7 Series)', status: 'Active (Uber Partner)', lat: -33.820, lng: 151.178, battery: '88%' }
  ];
  
  const ACTIVE_FLEET = [...fleet, ...UBER_ENTERPRISE_MOCK];

  return (
    <div id="mapContainerRef" className="relative h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col pointer-events-auto">
      {/* UBER DISPATCH & VOICE CONTROL PANEL */}
      <AnimatePresence>
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="uber-dispatch-panel absolute top-4 left-4 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl w-80 pointer-events-auto flex flex-col gap-3"
        >
          <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center justify-between">
             <span>Uber Enterprise + Aura</span>
             <button 
               onClick={() => {
                  if (navigator.share) {
                    const cryptoUrl = `${window.location.origin}/track?token=SEC-${Date.now().toString(16)}-${Math.random().toString(36).substr(2, 9)}&expire=30m`;
                    navigator.share({
                      title: 'Uber Enterprise Secure Trip',
                      text: 'Track my ride in real-time. Link encrypted and expires in 30 minutes.',
                      url: cryptoUrl,
                    }).catch(err => console.log('Share failed:', err));
                  } else {
                    toast.error("Web Share API not supported on this browser.");
                  }
               }}
               className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40 transition-colors pointer-events-auto shadow-sm"
             >
               Share Trip
             </button>
          </h4>
          {!showFeedback ? (
            <div className="relative">
              <input 
                 type="text" 
                 value={addressInput}
                 onChange={(e) => handleAddressChange(e.target.value)}
                 onFocus={() => setShowRecent(true)}
                 placeholder="Where to? (or say 'Take me to...')"
                 className="w-full bg-slate-800 text-sm text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 pr-10"
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDispatch(addressInput);
                    }
                 }}
              />
              <button 
                className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-white"
                onClick={() => {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.onresult = (event: any) => {
                       let transcript = event.results[0][0].transcript;
                       let parsedDest = transcript.replace(/take me to /i, '').replace(/pick me up at /i, '');
                       
                       if (transcript.toLowerCase().includes('emergency') || transcript.toLowerCase().includes('neuralink')) {
                         parsedDest = "Neuralink Secure Evac Zone";
                         toast.error("EMERGENCY OVERRIDE DETECTED. NEURALINK SECURE PROTOCOL ACTIVE.");
                         speak("Emergency override. Dispatching secure evac unit immediately.");
                         handleDispatch(parsedDest, "Neuralink Armored Evac");
                       } else {
                         setAddressInput(parsedDest);
                         handleDispatch(parsedDest);
                       }
                    };
                    recognition.start();
                    toast.info("Listening for destination...");
                  } else {
                    toast.error("Web Speech API not supported.");
                  }
                }}
              >
                <Volume2 className="w-5 h-5 pointer-events-auto cursor-pointer" />
              </button>
              {showRecent && recentAddresses.length > 0 && (
                 <div className="absolute top-12 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl mt-2 overflow-hidden z-20">
                   {recentAddresses.map((addr, idx) => (
                     <div 
                        key={idx} 
                        onClick={() => handleDispatch(addr.label)}
                        className={`px-4 py-2.5 text-xs text-slate-300 hover:bg-blue-600/20 hover:text-white cursor-pointer border-b border-slate-700/50 last:border-0 flex items-center justify-between ${
                          addr.type === 'emergency' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 font-bold' : ''
                        }`}
                     >
                       <span>{addr.label}</span>
                       <span className="text-[9px] uppercase tracking-widest opacity-50">{addr.type}</span>
                     </div>
                   ))}
                 </div>
              )}
              {tripSummary && (
                <div className="mt-3 bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Dispatch</span>
                     <span className="text-[10px] text-emerald-400 font-bold animate-pulse">● LIVE STATUS</span>
                  </div>
                  <div className="space-y-1.5">
                     <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-400">Est. Distance</span>
                       <span className="text-xs font-bold text-white">{tripSummary.distance}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-400">Est. Duration</span>
                       <span className="text-xs font-bold text-white">{tripSummary.duration}</span>
                     </div>
                     <div className="flex justify-between items-center pt-1 mt-1 border-t border-slate-700/30">
                       <span className="text-[10px] text-slate-400">Treasury Billed Fare</span>
                       <span className="text-xs font-bold text-emerald-300">{tripSummary.fare}</span>
                     </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                     <button onClick={() => handleDispatch(addressInput, 'Uber Enterprise')} className="flex-1 bg-black text-white hover:bg-slate-800 border border-slate-700 rounded-lg text-[9px] uppercase tracking-widest font-black py-2 transition-colors">Uber</button>
                     <button onClick={() => handleDispatch(addressInput, 'Didi/Lyft')} className="flex-1 bg-amber-600 text-white hover:bg-amber-500 rounded-lg text-[9px] uppercase tracking-widest font-black py-2 transition-colors">Rideshare</button>
                     <button onClick={() => handleDispatch(addressInput, 'Local Taxi')} className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 rounded-lg text-[9px] uppercase tracking-widest font-black py-2 transition-colors">Taxi</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-3">
               <div className="text-center">
                 <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Rate your trip</div>
                 <div className="flex justify-center gap-1 mt-1">
                   {[1,2,3,4,5].map(star => (
                     <span 
                       key={star} 
                       onClick={() => setRating(star)}
                       className={`text-2xl cursor-pointer transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                     >
                       ★
                     </span>
                   ))}
                 </div>
               </div>
               <textarea 
                 value={feedbackText}
                 onChange={(e) => setFeedbackText(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white resize-none"
                 rows={2}
                 placeholder="Leave a comment (saved to history)..."
               />
               <button onClick={handleSubmitFeedback} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg">
                 Submit to Ledger
               </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {fleet.length > 10 && (
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
           <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/50 p-4 rounded-xl shadow-2xl">
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
                Continental Expansion Active
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">5,000+ FSD Units • Major Cities Connected</p>
           </div>
           <div className="bg-slate-900/90 backdrop-blur-md border border-blue-500/50 p-4 rounded-xl shadow-2xl text-right">
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center justify-end gap-2">
                Neural Sentry Dev Loop
                <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Continuous compilation: Self-Charging Grids LIVE</p>
           </div>
        </div>
      )}
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
           defaultCenter={fleet.length > 10 ? { lat: 20, lng: 0 } : { lat: -33.81, lng: 151.18 }}
           defaultZoom={fleet.length > 10 ? 2 : 13}
           mapId="AURA_DRIVE_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
        >
          {ACTIVE_FLEET.map((car) => {
             const pos = { lat: car.lat, lng: car.lng };
             const isAsim01 = car.plate === 'ASIM-01';
             const isSelected = activeCar?.id === car.id;
             const isUber = car.id.startsWith('uber');
             
             return (
               <AdvancedMarker 
                key={car.id} 
                position={pos} 
                onClick={() => setActiveCar(car)}
                zIndex={isAsim01 || isSelected ? 100 : 1}
               >
                 <div className="relative group/marker">
                  {car.status.includes('Active') && (
                    <motion.div 
                      key={`ping-${car.id}`}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: isUber ? 2.5 : 3, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className={`absolute inset-0 rounded-full pointer-events-none ${isAsim01 ? 'bg-blue-500' : isUber ? 'bg-slate-400' : 'bg-emerald-500'}`}
                    />
                  )}
                  {(isSelected && isSpotting) && (
                    <motion.div 
                      key="pulse"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 4, opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-500 rounded-full pointer-events-none"
                    />
                  )}
                  <Pin 
                    background={isAsim01 ? "#1e40af" : isUber ? "#0f172a" : car.status.includes('Active') ? "#10b981" : "#f59e0b"} 
                    glyphColor={isUber ? "#38bdf8" : "#fff"}
                    borderColor={isSelected ? "#fff" : "rgba(255,255,255,0.2)"}
                    scale={isSelected ? 1.2 : 1}
                  >
                    {isAsim01 ? <span className="text-[10px] font-black pointer-events-none">CEO</span> : isUber ? <span className="text-[10px] font-black pointer-events-none">UBX</span> : null}
                  </Pin>
                  
                  {isSelected && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl w-48 z-50 pointer-events-auto">
                       <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                         <div className="w-8 h-8 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center border border-slate-700">
                           {isUber ? "🚗" : "⚡"}
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-white">{car.plate}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase">{isUber ? 'Uber Enterprise' : 'Aura Native'}</div>
                         </div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-500 block">Model</span>
                            <span className="text-white font-bold">{car.model}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-500 block">Status</span>
                            <span className={car.status.includes('Active') ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{car.status}</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-500 block">Energy</span>
                            <span className="text-blue-400 font-bold">{car.battery}</span>
                          </div>
                       </div>
                       <button className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors shadow-lg">
                          Connect Feed
                       </button>
                    </div>
                  )}
                 </div>
               </AdvancedMarker>
             );
          })}
          
          {fleet.length > 10 && (
            <>
              {/* Added stylish pulsing charging stations */}
              {[
                { lat: 40.7128, lng: -74.0060, label: "NYC Charging Hub & FSD Depot" },
                { lat: 51.5074, lng: -0.1278, label: "London Charging Hub & FSD Depot" },
                { lat: 35.6762, lng: 139.6503, label: "Tokyo Charging Hub & FSD Depot" },
                { lat: 48.8566, lng: 2.3522, label: "Paris Charging Hub & FSD Depot" },
                { lat: -37.8136, lng: 144.9631, label: "Melbourne Charging Hub & FSD Depot" },
                { lat: 25.2048, lng: 55.2708, label: "Dubai Charging Hub & FSD Depot" },
                { lat: 1.3521, lng: 103.8198, label: "Singapore Charging Hub & FSD Depot" },
              ].map((hub, idx) => (
                <AdvancedMarker key={idx} position={{lat: hub.lat, lng: hub.lng}} zIndex={40}>
                   <div className="relative group cursor-pointer">
                      <motion.div 
                        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500 rounded-full blur-md"
                      />
                      <div className="relative w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                         <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="text-[10px] font-black tracking-widest text-white uppercase">{hub.label}</div>
                         <div className="text-[8px] font-mono text-emerald-400">100% Uptime | Solar Linked</div>
                      </div>
                   </div>
                </AdvancedMarker>
              ))}
            </>
          )}

          {activePos && <RouteDisplay origin={activePos} destination={homePos} />}
          
          <AdvancedMarker position={homePos} title="Your Home (712/15 Barton Rd)">
             <Pin background="#ef4444" glyphText="H" glyphColor="#fff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
      
      {activeCar && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl z-10 transition-all text-left">
          <div className="flex justify-between items-center mb-2">
             <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center border border-white/10 text-white font-black shadow-inner">
                    {activeCar.plate.split('-')[1] || activeCar.id}
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-lg leading-tight">{activeCar.model}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${activeCar.status.includes('Active') ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {activeCar.status}
                       </p>
                       <span className="w-1 h-1 bg-slate-600 rounded-full" />
                       <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Sovereign Protected
                       </p>
                    </div>
                 </div>
             </div>
             <div className="text-right">
                <div className="text-white font-black text-2xl tracking-tighter">{Math.max(1, Math.floor((100 - progress) / 10))} MIN</div>
                <div className="flex flex-col items-end">
                   <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase leading-none mb-1">ETA Arriving</p>
                   <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-1 rounded ring-1 ring-emerald-500/20">1T Treasury Backed</p>
                </div>
             </div>
          </div>

          {/* Summoning Progress Tracker */}
          {summoningCarId === activeCar.id ? (
            <div className="mb-4 bg-blue-950/45 border border-blue-500/30 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-blue-300 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  Sovereign Autonomous summon
                </span>
                <span className="font-mono text-blue-400 font-black text-xs">{summonProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${summonProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-400 h-full rounded-full"
                  style={{ width: `${summonProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 italic font-medium leading-relaxed font-sans">
                Status: {summonStatus}
              </p>
            </div>
          ) : activeCar.navigationGuide ? (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Spotting Guide & Telematics
              </p>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {activeCar.navigationGuide}
              </p>
            </div>
          ) : null}

          {/* Telematics Bento Controllers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Lock / Unlock */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2.5">
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider">DOOR LOCKS</p>
                <p className="text-xs font-bold text-white mt-0.5 whitespace-nowrap">
                  {lockedCars[activeCar.id] !== false ? "🔒 SECURED" : "🔓 UNLOCKED"}
                </p>
              </div>
              <Button 
                onClick={() => {
                  const isCarLocked = lockedCars[activeCar.id] !== false;
                  const nextValue = !isCarLocked;
                  setLockedCars(prev => ({ ...prev, [activeCar.id]: nextValue }));
                  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
                  audio.play().catch(() => {});
                  if (nextValue) {
                    toast.success(`Securely Locked ${activeCar.model}. Sentry Active.`);
                    speak(`${activeCar.model} locked.`);
                  } else {
                    toast.success(`Unlocked ${activeCar.model}. Welcoming driver.`);
                    speak(`${activeCar.model} unlocked.`);
                  }
                }}
                className="w-10 h-10 p-0 rounded-lg bg-slate-850 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                {lockedCars[activeCar.id] !== false ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
              </Button>
            </div>

            {/* Climate Sync */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2.5">
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider">CABIN TEMP</p>
                <p className="text-xs font-bold mt-0.5 text-white flex items-center gap-1 font-mono">
                  <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                  {climateTemps[activeCar.id] || 21}°C
                </p>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <button 
                  onClick={() => {
                    const current = climateTemps[activeCar.id] || 21;
                    const next = Math.max(16, current - 0.5);
                    setClimateTemps(prev => ({ ...prev, [activeCar.id]: next }));
                    toast.info(`Climate decremented: ${next}°C`);
                  }}
                  className="w-5 h-4 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  -
                </button>
                <button 
                  onClick={() => {
                    const current = climateTemps[activeCar.id] || 21;
                    const next = Math.min(28, current + 0.5);
                    setClimateTemps(prev => ({ ...prev, [activeCar.id]: next }));
                    toast.info(`Climate incremented: ${next}°C`);
                  }}
                  className="w-5 h-4 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Sentry Mode */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-1.5">
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider">NEURAL SENTRY</p>
                <p className="text-[10px] font-bold text-white mt-0.5">360° LIVE FEED</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/50" />
            </div>

            {/* Range */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-1.5">
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider">EST. RANGE</p>
                <p className="text-xs font-bold text-blue-400 mt-0.5 font-mono">
                  {Math.floor(parseInt(activeCar.battery || "85") * 5.2 || 450)} km
                </p>
              </div>
              <Activity className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Direct Action Drawer Buttons */}
          <div className="flex flex-wrap md:flex-nowrap gap-3">
             <Button 
                onClick={handleSpotCar}
                className={`flex-1 min-w-[130px] ${isSpotting ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-200'} hover:bg-blue-700 hover:text-white font-black h-12 text-xs uppercase tracking-widest transition-all gap-2`}
              >
                {isSpotting ? <BellRing className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
                {isSpotting ? 'Honking & Flashing...' : 'Spot My Car'}
             </Button>

             <Button 
                onClick={() => {
                  if (summoningCarId) {
                    toast.error("An autopilot summon is already engaged.");
                    return;
                  }
                  
                  setSummoningCarId(activeCar.id);
                  setSummonProgress(0);
                  setSummonStatus("Connecting to SpaceX Starlink Safe-Gateway...");
                  speak("Autonomous summon initialized. Accessing private satellite mesh.");

                  const states = [
                    { p: 15, s: "Retinal match verified. Cabin ventilation initialized..." },
                    { p: 40, s: "Disengaging mechanical brakes. Safe-GPS routing computed..." },
                    { p: 70, s: "Navigating secure lane channels. Active object scanner online..." },
                    { p: 90, s: "Approaching Barton Rd main roundabout. Slowing for pedestrian safety..." },
                    { p: 100, s: "Arrived at destination entrance. Autopilot parked successfully." }
                  ];

                  let step = 0;
                  const timerInterval = setInterval(() => {
                    if (step < states.length) {
                      setSummonProgress(states[step].p);
                      setSummonStatus(states[step].s);
                      speak(states[step].s);
                      step++;
                    } else {
                      clearInterval(timerInterval);
                      setTimeout(() => {
                        setSummoningCarId(null);
                        setSummonProgress(0);
                        setSummonStatus("");
                      }, 3000);
                    }
                  }, 2500);
                }}
                disabled={!!summoningCarId}
                className="flex-1 min-w-[130px] bg-emerald-600 text-white hover:bg-emerald-500 font-black h-12 text-xs uppercase tracking-widest transition-all gap-2"
              >
                <Navigation className="w-4 h-4 text-emerald-100" />
                FSD Auto Summon
             </Button>

             <Button 
                onClick={() => {
                  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); 
                  audio.play().catch(() => {});
                  toast.promise(new Promise(resolve => setTimeout(resolve, 2500)), {
                    loading: 'Syncing Biometrics over Secure Link...',
                    success: `Cabin target temperature set to ${climateTemps[activeCar.id] || 21}°C. Optimized.`,
                    error: 'Handshake fault'
                  });
                }}
                className="flex-1 min-w-[130px] bg-slate-900 text-white hover:bg-slate-800 font-black h-12 text-xs uppercase tracking-widest transition-all gap-2 border border-slate-800"
              >
                <Fingerprint className="w-4 h-4 text-blue-400" />
                Pre-Condition
             </Button>

             <Button 
                variant="outline" 
                className="w-12 h-12 p-0 border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl"
                onClick={() => {
                  window.open(`tel:+61491570156`);
                }}
              >
                <MessageSquare className="w-4 h-4" />
             </Button>

             <Button 
                variant="outline" 
                className="w-12 h-12 p-0 border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl font-black text-xs" 
                onClick={() => {
                  setActiveCar(null);
                  if (summoningCarId === activeCar.id) {
                    setSummoningCarId(null);
                  }
                }}
              >
                ESC
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

