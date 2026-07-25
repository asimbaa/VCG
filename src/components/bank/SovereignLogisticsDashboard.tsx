import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Package, Truck, ShieldCheck, MapPin, Navigation, Bell, 
  MessageSquare, PenTool, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, Send, ChevronRight, X
} from 'lucide-react';

// Setup custom icons for Leaflet to fix default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.0/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.0/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Coordinates
const CHATSWOOD_STORE = { lat: -33.7969, lng: 151.1834 };
const ARTARMON_HUB = { lat: -33.8115, lng: 151.1866 }; // approx Artarmon hub
const GLOBAL_POINTS = [
  { name: 'Apple Store, Sydney (367 George St)', lat: -33.8688, lng: 151.2069 },
  { name: 'Westfield Sydney (Pitt St Mall)', lat: -33.8698, lng: 151.2081 },
  { name: 'Tesla Showroom (Alexandria, NSW)', lat: -33.9103, lng: 151.1963 }
];

export function SovereignLogisticsDashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'order' | 'support'>('map');
  const [vehiclePos, setVehiclePos] = useState(CHATSWOOD_STORE);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: "Sovereign Fleet #01 Dispatched from Chatswood", time: "Just now", type: "info" }
  ]);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "Sovereign Control", text: "How can we assist with your high-value transit today?", time: "09:00 AM" }
  ]);
  const [orderForm, setOrderForm] = useState({
    item: "",
    value: "",
    origin: "Westfield Chatswood",
    signatureRequired: true,
    noAuthorityToLeave: true,
    knockOnDoor: true
  });

  // Animate vehicle movement from Chatswood to Artarmon
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      if (progress > 1) progress = 0; // loop for demo
      
      const newLat = CHATSWOOD_STORE.lat + (ARTARMON_HUB.lat - CHATSWOOD_STORE.lat) * progress;
      const newLng = CHATSWOOD_STORE.lng + (ARTARMON_HUB.lng - CHATSWOOD_STORE.lng) * progress;
      
      setVehiclePos({ lat: newLat, lng: newLng });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = (e: any) => {
    e.preventDefault();
    setNotifications(prev => [
      { id: Date.now(), text: `High-value order initiated: ${orderForm.item}. Routing via Secure Fleet to Artarmon.`, time: "Just now", type: "success" },
      ...prev
    ]);
    setActiveTab('map');
  };

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatHistory(prev => [...prev, { sender: "You", text: chatMsg, time: "Now" }]);
    setChatMsg("");
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: "Sovereign Control", text: "Confirmed. Fleet routing parameters updated. ETA remains stable.", time: "Now" }]);
      setNotifications(prev => [
        { id: Date.now(), text: "Logistics update confirmed by Control.", time: "Just now", type: "info" },
        ...prev
      ]);
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen rounded-[2.5rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-black tracking-widest uppercase text-sm">Sovereign</h2>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Global Logistics Fleet</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('map')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'map' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Live Fleet Map</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => setActiveTab('order')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'order' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><Package className="w-4 h-4" /> Secure Receivables</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${activeTab === 'support' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Command & Requests</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
        
        {/* Live Notifications Feed */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bell className="w-3 h-3" /> Live Feed
          </h3>
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map(n => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={n.id}
                  className="bg-black/40 border border-white/5 rounded-xl p-4"
                >
                  <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-2">{n.text}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{n.time}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white relative">
        {activeTab === 'map' && (
          <div className="h-full w-full relative">
             {/* Overlay UI */}
             <div className="absolute top-6 left-6 right-6 z-[400] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none">
               <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto flex items-center gap-6">
                 <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Tracking ID</h3>
                   <p className="text-sm font-bold text-slate-900 font-mono">VAL-9942-8812-XC</p>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Delivery Status</h3>
                   <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                     In Transit
                   </p>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Active Transit</h3>
                   <p className="text-xs font-semibold text-slate-600">Chatswood <span className="mx-1">→</span> Artarmon Hub</p>
                 </div>
               </div>
               <button 
                 className="pointer-events-auto bg-slate-900 text-white hover:bg-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 transition-all"
                 onClick={() => {
                   toast.success("Re-routing sequence initiated. The Sovereign Fleet is calculating the optimal secure vector.");
                 }}
               >
                 <Navigation className="w-4 h-4" />
                 Initiate Re-route
               </button>
             </div>
             
             <MapContainer 
               center={[-33.8042, 151.1850]} 
               zoom={14} 
               scrollWheelZoom={true} 
               style={{ height: '100%', width: '100%', zIndex: 10 }}
               zoomControl={false}
             >
               <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               />
               
               {/* Westfield Chatswood */}
               <Marker position={[CHATSWOOD_STORE.lat, CHATSWOOD_STORE.lng]} icon={hubIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Westfield Chatswood</p>
                     <p className="text-xs text-slate-500">Origin Point</p>
                   </div>
                 </Popup>
               </Marker>
               
               {/* Artarmon Hub */}
               <Marker position={[ARTARMON_HUB.lat, ARTARMON_HUB.lng]} icon={hubIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Artarmon Sovereign Hub</p>
                     <p className="text-xs text-slate-500">Destination Point</p>
                   </div>
                 </Popup>
               </Marker>
               
               {/* Moving Vehicle */}
               <Marker position={[vehiclePos.lat, vehiclePos.lng]} icon={vehicleIcon}>
                 <Popup>
                   <div className="font-sans">
                     <p className="font-bold text-sm">Sovereign Fleet #01</p>
                     <p className="text-xs text-emerald-600 font-bold">En Route to Artarmon</p>
                   </div>
                 </Popup>
               </Marker>
               
               <Polyline 
                 positions={[
                   [CHATSWOOD_STORE.lat, CHATSWOOD_STORE.lng],
                   [ARTARMON_HUB.lat, ARTARMON_HUB.lng]
                 ]} 
                 color="#0f172a" 
                 weight={4} 
                 dashArray="10, 10" 
                 opacity={0.5} 
               />
               
               {/* Global Points */}
               {GLOBAL_POINTS.map((pt, i) => (
                 <Marker key={i} position={[pt.lat, pt.lng]}>
                   <Popup>{pt.name} - Global Intercept Point</Popup>
                 </Marker>
               ))}
             </MapContainer>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="h-full overflow-y-auto p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <div className="mb-10">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Order & Receive High-Value Goods</h1>
                <p className="text-slate-500 font-medium">Deploy the Sovereign Fleet to acquire and transport items globally to the Artarmon Hub. Full door-to-door escort guaranteed.</p>
              </div>
              
              <form onSubmit={handleOrderSubmit} className="space-y-8">
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Item Description</label>
                    <input 
                      required
                      type="text" 
                      value={orderForm.item}
                      onChange={e => setOrderForm({...orderForm, item: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                      placeholder="e.g. Apple Vision Pro, 10kg Gold Bullion, Rare Art" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Declared Value (USD)</label>
                      <input 
                        required
                        type="text" 
                        value={orderForm.value}
                        onChange={e => setOrderForm({...orderForm, value: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                        placeholder="$10,000+" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Origin Point</label>
                      <select 
                        value={orderForm.origin}
                        onChange={e => setOrderForm({...orderForm, origin: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="Westfield Chatswood">Westfield Chatswood</option>
                        <option value="Apple Store, Sydney (367 George St)">Apple Store, Sydney (367 George St)</option>
                        <option value="Westfield Sydney (Pitt St Mall)">Westfield Sydney (Pitt St Mall)</option>
                        <option value="Custom Location">Custom Location...</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200/50">
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" /> Strict Delivery Protocol
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Strict Signature Required</p>
                          <p className="text-xs text-slate-500">Only release parcel to verified ID.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.signatureRequired} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <X className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">NO Authority to Leave (ATL)</p>
                          <p className="text-xs text-slate-500">Do not leave parcel unattended under any circumstances.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.noAuthorityToLeave} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Direct Door Knock</p>
                          <p className="text-xs text-slate-500">Physical notification upon arrival at Artarmon Hub.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={orderForm.knockOnDoor} readOnly className="w-5 h-5 text-amber-600 rounded" />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Truck className="w-5 h-5" />
                  Dispatch Sovereign Fleet
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 bg-white">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">Logistics Command Center</h1>
              <p className="text-slate-500 text-sm font-medium">Direct secure line to fleet operators for routing changes, questions, and intercepts.</p>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 space-y-6">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'You' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm font-semibold">{msg.text}</p>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">{msg.sender} • {msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Request reroute, ETA update, or special handling..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button 
                  type="submit"
                  className="bg-slate-900 hover:bg-black text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
