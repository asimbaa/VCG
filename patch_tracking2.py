import re

with open("src/components/bank/OrderTrackingDashboard.tsx", "r") as f:
    content = f.read()

new_comp = """
export function OrderTrackingDashboard({ user }: { user?: User | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "users", user.uid, "receipts"), orderBy("timestamp", "desc"), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Add fake tracking status to each order
        const mapped = data.map((order: any, idx) => {
           const timeDiff = new Date().getTime() - new Date(order.timestamp).getTime();
           const mins = Math.floor(timeDiff / 60000);
           let status = 'in_transit';
           let progress = 45;
           if (mins > 60) {
             status = 'delivered';
             progress = 100;
           } else if (mins > 30) {
             status = 'arriving';
             progress = 85;
           } else if (mins > 10) {
             status = 'picked_up';
             progress = 60;
           } else {
             status = 'in_transit';
             progress = 45;
           }
           
           return {
             ...order,
             status,
             progress,
             estimatedDeliveryTime: new Date(new Date(order.timestamp).getTime() + 60*60*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
           };
        });
        setOrders(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'Preparing Assets';
      case 'picked_up': return 'Courier En Route';
      case 'in_transit': return 'In Transit';
      case 'arriving': return 'Arriving Soon';
      case 'delivered': return 'Delivered Safely';
      default: return 'In Transit';
    }
  };

  const getIconForOrder = (items: any[]) => {
    const names = items.map(i => i.name.toLowerCase() + " " + (i.tag || "").toLowerCase());
    const text = names.join(" ");
    if (text.includes("real estate") || text.includes("sky residence") || text.includes("island") || text.includes("estate")) return <Home className="w-5 h-5 text-emerald-500" />;
    if (text.includes("tesla") || text.includes("vehicle") || text.includes("gulfstream") || text.includes("car")) return <Car className="w-5 h-5 text-blue-500" />;
    return <Package className="w-5 h-5 text-slate-500" />;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Active Deliveries...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-slate-50 min-h-[500px] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-slate-200">
        <Package className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-black text-slate-800">No Active Deliveries</h3>
        <p className="text-slate-500 mt-2 text-sm max-w-md">Your secure vault and physical delivery manifests are currently empty. Visit the Sovereign Store to acquire new assets.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800">
         <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-emerald-400" /> Sovereign Logistics Network
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Real-Time Title Deeds & Physical Asset Tracking</p>
         </div>
      </div>
      
      {orders.map((order, i) => (
        <div key={order.id || i} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 flex flex-col md:flex-row relative">
          <div className="md:w-1/3 bg-slate-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{order.orderId || "SOV-DISPATCH"}</span>
                 <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-100">
                    <Clock className="w-3 h-3" /> {order.estimatedDeliveryTime}
                 </div>
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-1 line-clamp-2">
                {order.items?.map((item: any) => item.name).join(", ")}
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-6">
                Total: ${order.amount?.toLocaleString()} AUD
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Courier Network</h4>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-900">{order.logisticsProvider || "Valourian Escort"}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Secured Transit</div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="md:w-2/3 p-6 flex flex-col justify-between relative bg-slate-50/50">
             <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-lg">
                <div className={`w-2 h-2 rounded-full ${order.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                {getStatusText(order.status)}
             </div>
             
             <div className="flex gap-4 mb-8 mt-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                   {getIconForOrder(order.items || [])}
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Destination</h4>
                   <p className="text-sm font-bold text-slate-800 line-clamp-2 pr-24">{order.deliveryAddress}</p>
                   {order.authorityToLeave && (
                     <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 border border-emerald-200 bg-emerald-50 inline-block px-2 py-0.5 rounded">Authority to Leave Safely</p>
                   )}
                </div>
             </div>
             
             <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <span>Dispatched</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
                <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className={`absolute top-0 left-0 h-full ${order.progress === 100 ? 'bg-emerald-500' : 'bg-slate-900'} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                  />
                </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
"""

content = re.sub(
    r"export function OrderTrackingDashboard\(\{.*?\}\) \{.*",
    new_comp.replace('\\', '\\\\'),
    content,
    flags=re.DOTALL
)

with open("src/components/bank/OrderTrackingDashboard.tsx", "w") as f:
    f.write(content)

print("OrderTrackingDashboard replaced successfully")
