import re

with open('src/components/bank/OrderTrackingDashboard.tsx', 'r') as f:
    content = f.read()

state_add = """  const [trackingData, setTrackingData] = useState<TrackingData>({"""
new_state = """  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  
  const handleReroute = () => {
    if(newAddress.trim()) {
      setTrackingData(prev => ({...prev, deliveryAddress: newAddress}));
      setShowRerouteModal(false);
    }
  };

  const [trackingData, setTrackingData] = useState<TrackingData>({"""
content = content.replace(state_add, new_state)

btn_old = """            <div className="flex-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Delivering To</h4>
              <p className="text-sm font-bold text-slate-900">{trackingData.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );"""

btn_new = """            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Delivering To</h4>
                <button 
                  onClick={() => setShowRerouteModal(true)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider"
                >
                  Re-Route
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900">{trackingData.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {showRerouteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Re-Route Delivery</h3>
            <p className="text-sm text-slate-500 mb-4">Enter a new delivery destination for your order.</p>
            <input 
              type="text" 
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="e.g. 100 George St, Sydney"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowRerouteModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReroute}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );"""

content = content.replace(btn_old, btn_new)

with open('src/components/bank/OrderTrackingDashboard.tsx', 'w') as f:
    f.write(content)
