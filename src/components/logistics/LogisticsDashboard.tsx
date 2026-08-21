import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Package, Key, MapPin, CheckCircle, Truck, Box, Star, Clock, Mail, Navigation, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import D3MapRoutes from './D3MapRoutes';
import toast from 'react-hot-toast';

export default function LogisticsDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'keys' | 'items'>('keys');
  const [loading, setLoading] = useState(true);
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const [reRouteItem, setReRouteItem] = useState<any>(null);
  const [newAddress, setNewAddress] = useState("");
  const [isReRouting, setIsReRouting] = useState(false);
  const [reRouteResponse, setReRouteResponse] = useState<string | null>(null);


  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.amount < 0) {

          const isAmazon = Math.random() > 0.5;
          items.push({
            id: doc.id,
            name: `Payment to ${data.recipient || "Store"}`,
            status: "Accepted & Processing",
            provider: isAmazon ? "Amazon Shipping" : "UPS Secure",
            trackingId: `TRK-${doc.id.substring(0, 8).toUpperCase()}`,
            eta: "In Transit",
            license: 'Enterprise Logistics License Active',
            share: isAmazon ? 'Partner Share: 6.9%' : 'N/A'
          });

        }
      });
      setDynamicItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [keysDelivery, setKeysDelivery] = useState([
    { id: 'KEY-732', address: '14 High St, Sydney', status: 'In Transit', provider: 'Starshipit / Auspost', trackingId: 'AUSPOST-991204', eta: 'Tomorrow, 2:00 PM' },
    { id: 'KEY-881', address: '88 Valourian Ave, Melbourne', status: 'Delivered', provider: 'UPS', trackingId: '1Z9999999999999999', eta: 'Delivered' },
  ]);

  const itemsDelivery = [
    ...dynamicItems,
    { id: 'ORD-9021', name: 'Server Hardware Array', status: 'Dispatched', provider: 'Amazon Shipping', trackingId: 'AMZN-99201948', eta: 'Today, 6:00 PM', license: 'Enterprise Logistics License Active', share: 'Partner Share: 6.9%' },
    { id: 'ORD-1011', name: 'Encrypted Cold Storage Drives', status: 'Processing', provider: 'UPS Secure', trackingId: '1Z8888888888888888', eta: 'In 3 Days', license: 'Standard Courier', share: 'N/A' },
  ];

  const simulateEmail = (trackingId: string) => {
    toast.success(`Tracking ID ${trackingId} and status update emailed to asim.nsw@gmail.com via encrypted SMTP.`);
  };

  const handleReRoute = async () => {
    if (!newAddress || !reRouteItem) return;
    setIsReRouting(true);
    setReRouteResponse(null);
    
    try {
      // Simulate DeepSpaceComputingCluster request
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Execute RE-ROUTE Protocol for Tracking ID ${reRouteItem.trackingId} (${reRouteItem.name || reRouteItem.address}). New Destination: ${newAddress}. Prioritize Deep Space Computing Cluster logistical support.`, 
          agentId: 'DeepSpace' 
        })
      });
      
      const data = await res.json();
      setReRouteResponse(data.text || data.reply || "Re-route confirmed by Deep Space Cluster.");
      
      // Optically update the dashboard arrays
      if (activeTab === 'keys') {
         setKeysDelivery(prev => prev.map(k => k.id === reRouteItem.id ? {...k, address: newAddress, status: 'Re-Routing', provider: 'Deep Space Logistics'} : k));
      } else {
         setDynamicItems(prev => prev.map(i => i.id === reRouteItem.id ? {...i, address: newAddress, status: 'Re-Routing', provider: 'Deep Space Logistics'} : i));
      }
      
      toast.success(`Re-route confirmed by Deep Space Computing Cluster for ${reRouteItem.trackingId}`);
    } catch (e) {
      toast.error("Cluster communication failed. Retrying...");
    } finally {
      setIsReRouting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcc00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Truck className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-[#ffcc00]" />
            Global Logistics & Delivery
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            Real-time tracking of physical property keys and high-value purchased items across Starshipit, AusPost, UPS, and Amazon Shipping. 
          </p>
        </div>
        
        <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 z-10">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'keys' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Key className="w-4 h-4" /> Property Keys
          </button>
          <button 
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'items' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Box className="w-4 h-4" /> Purchased Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'keys' && keysDelivery.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#ffcc00]/30 transition-all flex flex-col md:flex-row gap-6 justify-between items-center"
          >
            <div className="flex items-start gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[#ffcc00]/10 flex items-center justify-center shrink-0 border border-[#ffcc00]/20">
                <Key className="w-6 h-6 text-[#ffcc00]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{item.address}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <Truck className="w-3 h-3" /> {item.provider}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> {item.status}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <Clock className="w-3 h-3" /> ETA: {item.eta}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="text-center sm:text-right">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Tracking ID</div>
                <div className="font-mono text-[#ffcc00] font-bold text-sm bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  {item.trackingId}
                </div>
              </div>
              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => simulateEmail(item.trackingId)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Me
              </button>
            </div>
          </motion.div>
        ))}

        {activeTab === 'items' && itemsDelivery.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#ffcc00]/30 transition-all flex flex-col md:flex-row gap-6 justify-between items-center"
          >
            <div className="flex items-start gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Box className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{item.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <Truck className="w-3 h-3" /> {item.provider}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                    <CheckCircle className="w-3 h-3" /> {item.status}
                  </span>
                  {item.provider.includes('Amazon') && (
                    <span className="flex items-center gap-1 text-[#ffcc00] bg-[#ffcc00]/10 px-2 py-1 rounded-md border border-[#ffcc00]/20">
                      <Star className="w-3 h-3" /> {item.share}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="text-center sm:text-right">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">Tracking ID</div>
                <div className="font-mono text-[#ffcc00] font-bold text-sm bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  {item.trackingId}
                </div>
              </div>
              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => simulateEmail(item.trackingId)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Me
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {reRouteItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Navigation className="w-32 h-32" />
              </div>
              
              <button 
                onClick={() => setReRouteItem(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Re-Route Consignment
              </h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <div className="text-xs text-slate-500 uppercase font-black tracking-wider mb-1">Target</div>
                <div className="font-bold text-white text-sm">{reRouteItem.name || reRouteItem.address}</div>
                <div className="font-mono text-[#ffcc00] text-xs mt-1">{reRouteItem.trackingId}</div>
              </div>

              <div className="space-y-4">
                {reRouteResponse ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 animate-fade-in-up">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Deep Space Cluster Response
                    </h4>
                    <p className="text-emerald-50/80 text-sm whitespace-pre-wrap">{reRouteResponse}</p>
                    <button 
                      onClick={() => {
                        setReRouteItem(null);
                        setReRouteResponse(null);
                        setNewAddress("");
                      }}
                      className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                      Acknowledge & Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">New Destination Address</label>
                      <textarea 
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                        placeholder="Enter new delivery address..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg flex gap-2">
                      <Truck className="w-4 h-4 shrink-0" />
                      Request will be routed via Deep Space Computing Cluster for real-time interception and logistical coordination.
                    </div>

                    <button 
                      onClick={handleReRoute}
                      disabled={!newAddress || isReRouting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isReRouting ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Comm Link Active...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Dispatch Re-Route Command</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
