import React, { useEffect, useState, useRef } from 'react';
import { collection, query, onSnapshot, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Truck, Navigation, Activity, ShieldCheck, Battery, Thermometer, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


interface VehicleHealth {
    battery: number;
    tirePressure: number;
    engineTemp: number;
    overall: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

interface FleetVehicle {
    id: string;
    vehicleId: string;
    vehicleType: string;
    courierName: string;
    status: 'EN_ROUTE' | 'DELIVERED' | 'MAINTENANCE';
    cargo: string;
    destination: string;
    coordinates: { lat: number; lng: number };
    health: VehicleHealth;
    estimatedArrival: string;
}

export const SovereignDispatchMonitor = () => {
    const [fleet, setFleet] = useState<FleetVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);

    
    const previousFleetRef = useRef<FleetVehicle[]>([]);

    useEffect(() => {
        if (previousFleetRef.current.length > 0 && fleet.length > 0) {
            fleet.forEach(currentVehicle => {
                const prevVehicle = previousFleetRef.current.find(v => v.id === currentVehicle.id);
                if (prevVehicle && prevVehicle.status !== 'DELIVERED' && currentVehicle.status === 'DELIVERED') {
                    toast.success(`${currentVehicle.vehicleId} has arrived at ${currentVehicle.destination}. Package Ready for Signature.`, {
                        duration: 8000,
                        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    });
                }
            });
        }
        previousFleetRef.current = fleet;
    }, [fleet]);

    useEffect(() => {
        const q = query(collection(db, 'active_orders'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const vehicles: FleetVehicle[] = [];
            querySnapshot.forEach((doc) => {
                vehicles.push({ id: doc.id, ...doc.data() } as FleetVehicle);
            });
            setFleet(vehicles);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching fleet data:", error);
            toast.error("Failed to connect to dispatch stream.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const seedFleet = async () => {
        toast.info("Seeding Global Fleet...");
        const initialFleet: Omit<FleetVehicle, 'id'>[] = [
            {
                vehicleId: "VC-TSL-001",
                vehicleType: "Tesla Model X Plaid (Armored)",
                courierName: "Alpha-1 Actual",
                status: "EN_ROUTE",
                cargo: "Valourian Centurion Black Cards & GPT HQ Keys",
                destination: "Valourian Global HQ, 1 Farrer Pl, Sydney",
                coordinates: { lat: -33.8634, lng: 151.2110 },
                health: { battery: 98, tirePressure: 42, engineTemp: 88, overall: 'OPTIMAL' },
                estimatedArrival: "In 14 Minutes"
            },
            {
                vehicleId: "VC-CYB-042",
                vehicleType: "Tesla Cybertruck (Cyberbeast)",
                courierName: "Echo-4 Heavy",
                status: "EN_ROUTE",
                cargo: "SpaceX Starlink Terminals & Data Arrays",
                destination: "Sydney Data Nexus",
                coordinates: { lat: -33.8720, lng: 151.2010 },
                health: { battery: 82, tirePressure: 45, engineTemp: 92, overall: 'OPTIMAL' },
                estimatedArrival: "In 38 Minutes"
            },
            {
                vehicleId: "VC-AERO-09",
                vehicleType: "Valourian Executive Helo",
                courierName: "Sky-Link Actual",
                status: "DELIVERED",
                cargo: "Executive Hardware (M-Series MacBooks)",
                destination: "Sydney CBD Rooftop Pad",
                coordinates: { lat: -33.8600, lng: 151.2100 },
                health: { battery: 100, tirePressure: 100, engineTemp: 180, overall: 'OPTIMAL' },
                estimatedArrival: "Arrived"
            }
        ];

        try {
            for (const v of initialFleet) {
                await setDoc(doc(db, 'active_orders', v.vehicleId), v);
            }
            toast.success("Fleet synchronized to tracking grid.");
        } catch (error) {
            console.error("Error seeding fleet:", error);
            toast.error("Failed to seed fleet.");
        }
    };

    const simulateTelemetry = async () => {
        if (fleet.length === 0) {
            toast.error("No active fleet to simulate. Seed fleet first.");
            return;
        }
        setIsSimulating(true);
        toast.info("Activating live telemetry stream...");
        
        let count = 0;
        const interval = setInterval(async () => {
            if (count > 10) {
                clearInterval(interval);
                setIsSimulating(false);
                toast.success("Telemetry simulation concluded.");
                return;
            }
            
            for (const vehicle of fleet) {
                if (vehicle.status !== 'DELIVERED' && vehicle.coordinates) {
                    const newLat = vehicle.coordinates.lat + (Math.random() - 0.5) * 0.005;
                    const newLng = vehicle.coordinates.lng + (Math.random() - 0.5) * 0.005;
                    const newBat = vehicle.health ? Math.max(0, vehicle.health.battery - Math.floor(Math.random() * 2)) : 100;
                    
                    try {
                        await updateDoc(doc(db, 'active_orders', vehicle.id), {
                            'coordinates.lat': newLat,
                            'coordinates.lng': newLng,
                            'health.battery': newBat
                        });
                    } catch (e) {
                        // ignore
                    }
                }
            }
            count++;
        }, 2000);
    };

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Navigation className="w-8 h-8 text-emerald-400" />
                            Sovereign Dispatch Monitor
                        </h2>
                        <p className="text-slate-400 text-lg">24/7 Global Fleet Tracking & Asset Delivery Coordination.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={seedFleet}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm border border-slate-700 transition-colors"
                        >
                            Initialize Fleet
                        </button>
                        <button 
                            onClick={simulateTelemetry}
                            disabled={isSimulating}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-xl font-black text-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                            {isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                            {isSimulating ? "Streaming Telemetry..." : "Live Telemetry Stream"}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-emerald-400">
                        <Activity className="w-8 h-8 animate-spin" />
                    </div>
                ) : fleet.length === 0 ? (
                    <div className="bg-slate-800/40 p-12 rounded-3xl border border-slate-700 text-center">
                        <Truck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Active Deployments</h3>
                        <p className="text-slate-400">Initialize the fleet to commence global asset distribution.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {fleet.map((vehicle) => (
                            <div key={vehicle.id} className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between group hover:border-emerald-500/50 transition-all shadow-xl">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl border ${vehicle.status === 'DELIVERED' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 font-mono font-bold mb-1">{vehicle.vehicleId}</div>
                                                <h3 className="font-bold text-white leading-tight">{vehicle.vehicleType}</h3>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                            vehicle.status === 'DELIVERED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                            {vehicle.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex gap-3 items-start">
                                            <ShieldCheck className="w-4 h-4 text-slate-500 mt-0.5" />
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">High-Value Cargo</div>
                                                <div className="text-sm font-medium text-slate-300">{vehicle.cargo}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Destination</div>
                                                <div className="text-sm font-medium text-white">{vehicle.destination}</div>
                                                <div className="text-xs font-mono text-emerald-400/80 mt-1">
                                                    COORD: {vehicle.coordinates?.lat?.toFixed(5) || 'N/A'}, {vehicle.coordinates?.lng?.toFixed(5) || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Health Diagnostics</div>
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                            <CheckCircle2 className="w-3 h-3" /> {vehicle.health?.overall || 'UNKNOWN'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/50">
                                            <Battery className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                                            <div className="text-xs font-bold text-white">{vehicle.health?.battery || 0}%</div>
                                        </div>
                                        <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/50">
                                            <Thermometer className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                                            <div className="text-xs font-bold text-white">{vehicle.health?.engineTemp || 0}°</div>
                                        </div>
                                        <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/50">
                                            <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                            <div className="text-xs font-bold text-white">{vehicle.health?.tirePressure || 0} PSI</div>
                                        </div>
                                    </div>
                                    {vehicle.status !== 'DELIVERED' && (
                                        <div className="mt-4 text-center">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Estimated Arrival</div>
                                            <div className="text-sm font-black text-emerald-400">{vehicle.estimatedArrival}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
