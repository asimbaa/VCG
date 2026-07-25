import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Package, Clock, Navigation, CheckCircle2, Phone, MessageSquare, Star, Truck } from 'lucide-react';
import { DeliveryMap } from './DeliveryMap';

interface TrackingData {
  orderId: string;
  status: 'preparing' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered';
  estimatedDeliveryTime: string;
  courierName: string;
  courierVehicle: string;
  courierRating: number;
  restaurantName: string;
  deliveryAddress: string;
  progress: number;
  latitude: number;
  longitude: number;
}

export function OrderTrackingDashboard() {
  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  
  const handleReroute = () => {
    if(newAddress.trim()) {
      setTrackingData(prev => ({...prev, deliveryAddress: newAddress}));
      setShowRerouteModal(false);
    }
  };

  const [trackingData, setTrackingData] = useState<TrackingData>({
    orderId: "VAL-STORE-9901-AUS",
    status: 'in_transit',
    estimatedDeliveryTime: "8:45 PM",
    courierName: "Valourian VIP Fleet (Alex V.)",
    courierVehicle: "Black Mercedes-Benz Sprinter (V-Class)",
    courierRating: 5.0,
    restaurantName: "Valourian Sovereign Storefront (Chatswood)",
    deliveryAddress: "Unit 712 15 Barton Rd Artarmon NSW 2064 Australia",
    progress: 45,
    latitude: -33.7969, // near Chatswood
    longitude: 151.1834,
  });

  useEffect(() => {
    // Simulate real-time progress
    if (trackingData.status === 'delivered') return;

    const interval = setInterval(() => {
      setTrackingData(prev => {
        let nextProgress = prev.progress + Math.floor(Math.random() * 5);
        let nextStatus = prev.status;
        
        if (nextProgress >= 100) {
          nextProgress = 100;
          nextStatus = 'delivered';
        } else if (nextProgress > 80) {
          nextStatus = 'arriving';
        }

        return {
          ...prev,
          progress: nextProgress,
          status: nextStatus,
          // Slightly jitter latitude/longitude for simulation
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [trackingData.status]);

  const getStatusText = (status: TrackingData['status']) => {
    switch (status) {
      case 'preparing': return 'Kitchen is preparing your order';
      case 'picked_up': return 'Courier has picked up your order';
      case 'in_transit': return 'Order is on the way';
      case 'arriving': return 'Courier is arriving soon';
      case 'delivered': return 'Order delivered';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-[800px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative font-sans">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10 relative shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Tracking</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{trackingData.orderId}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
          <Clock className="w-3.5 h-3.5" />
          {trackingData.estimatedDeliveryTime}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-72 w-full bg-slate-200 z-0">
        <DeliveryMap 
          progress={trackingData.progress}
          latitude={trackingData.latitude}
          longitude={trackingData.longitude}
          restaurantName={trackingData.restaurantName}
        />
        
        {/* Map Overlay Status */}
        <div className="absolute top-4 left-4 right-4 flex justify-center pointer-events-none z-50">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10"
          >
            <div className="bg-emerald-500/20 p-1.5 rounded-full border border-emerald-500/30">
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-black tracking-wider uppercase text-slate-100">
              {getStatusText(trackingData.status)}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 z-20 relative p-6 space-y-6 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] overflow-y-auto">
        
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Prepared</span>
            <span>Picked Up</span>
            <span>Delivered</span>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#06C167] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${trackingData.progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        {/* Courier Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                 <img src="https://i.pravatar.cc/150?u=alex" alt="Courier" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <div className="bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current" /> {trackingData.courierRating}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{trackingData.courierName}</h3>
              <p className="text-xs font-semibold text-slate-500">{trackingData.courierVehicle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-[#06C167] rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-500/20 hover:bg-[#05a155] transition-colors">
              <Phone className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Package className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div className="flex-1 pb-4 border-b border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pickup From</h4>
              <p className="text-sm font-bold text-slate-900">{trackingData.restaurantName}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Delivering To</h4>
              <p className="text-sm font-bold text-slate-900">{trackingData.deliveryAddress}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
