import re

with open("server.ts", "r") as f:
    code = f.read()

fleet_apis = """
// ==========================================
// REAL-TIME FLEET & WORKFORCE INFRASTRUCTURE
// ==========================================
interface FleetDriver {
  id: string;
  name: string;
  vehicle: string;
  status: 'offline' | 'available' | 'delivering';
  currentLocation: { lat: number; lng: number };
  activeOrderId: string | null;
}

let workforceFleet: FleetDriver[] = [
  { id: "drv_001", name: "David K.", vehicle: "Toyota Prius", status: "available", currentLocation: { lat: -33.8688, lng: 151.2093 }, activeOrderId: null },
  { id: "drv_002", name: "Sarah M.", vehicle: "Honda PCX", status: "available", currentLocation: { lat: -33.875, lng: 151.2 }, activeOrderId: null },
  { id: "drv_003", name: "James L.", vehicle: "E-Bike", status: "available", currentLocation: { lat: -33.88, lng: 151.21 }, activeOrderId: null }
];

app.get("/api/fleet/drivers", (req, res) => {
  res.json({ success: true, drivers: workforceFleet });
});

app.post("/api/fleet/dispatch", (req, res) => {
  try {
    const { orderId, restaurantLocation, dropoffLocation } = req.body;
    // Find available driver
    const driver = workforceFleet.find(d => d.status === 'available');
    if (!driver) {
      return res.status(503).json({ success: false, error: "No available drivers in the workforce at this time. Surge pricing in effect." });
    }
    
    // Assign order to driver
    driver.status = 'delivering';
    driver.activeOrderId = orderId;
    
    // In a real system, we'd trigger a background task to update location
    
    res.json({ 
      success: true, 
      driver: { id: driver.id, name: driver.name, vehicle: driver.vehicle },
      estimatedArrival: "15-20 mins"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// GLOBAL FINTECH & AUSTRALIAN DEPOSITS
// ==========================================
app.post("/api/fintech/deposit-au", (req, res) => {
  try {
    const { amount, bsb, account, payId, recipientName } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid deposit amount." });
    }
    
    if (!payId && (!bsb || !account)) {
      return res.status(400).json({ success: false, error: "Must provide PayID or BSB/Account for Australian NPP deposit." });
    }
    
    // Simulate connection to New Payments Platform (NPP) / Osko
    const txId = `NPP-TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const clearanceTime = new Date().toISOString();
    
    res.json({
      success: true,
      transactionId: txId,
      status: "CLEARED_FUNDS",
      clearingRail: "Australian NPP / Osko",
      depositAmount: amount,
      currency: "AUD",
      timestamp: clearanceTime,
      recipient: recipientName || "Verified Account Holder",
      message: "Funds successfully deposited into Australian Bank Account via New Payments Platform (NPP)."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

"""

# Insert before Vite middleware
if "createViteServer" in code:
    code = code.replace("// Vite middleware for development", fleet_apis + "\n// Vite middleware for development")
else:
    print("Could not find Vite middleware block")

with open("server.ts", "w") as f:
    f.write(code)

