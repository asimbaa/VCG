import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Car, 
  Smartphone, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Bot,
  Zap,
  HelpCircle,
  Clock,
  Compass,
  FileCheck,
  Users,
  Download,
  Send,
  FileText,
  MapPin,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { sendEmailViaService, EmailPreviewModal, EmailData } from "./EmailService";

interface Product {
  id: string;
  name: string;
  brand: "Apple" | "Tesla" | "BYD" | "Kia";
  category: "Hardware" | "Energy" | "Automotive" | "Enterprise";
  price: number;
  image: string;
  specs: string[];
}

const STORE_PRODUCTS: Product[] = [
  // Apple
  {
    id: "app1",
    name: "MacBook Pro M4 Max (Sovereign Edition)",
    brand: "Apple",
    category: "Hardware",
    price: 7299,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    specs: ["M4 Max 16-Core CPU", "128GB Unified Memory", "4TB SSD Storage", "Valourian Secure Boot ROM"]
  },
  {
    id: "app2",
    name: "iPhone 17 Pro Max (IP Propagated)",
    brand: "Apple",
    category: "Hardware",
    price: 2999,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80",
    specs: ["A19 Pro Neural Chip", "Biometric Neural Link ready", "Sovereign Encrypted DNS Routing", "Titanium Raw Satin Finish"]
  },
  {
    id: "app3",
    name: "Apple Studio Display Pro XDR",
    brand: "Apple",
    category: "Hardware",
    price: 8499,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    specs: ["32-inch 6K Retina Display", "Nano-Texture Antireflective Glass", "1600 nits Peak Brightness"]
  },
  // Tesla
  {
    id: "tes1",
    name: "Tesla Cybertruck Cyberbeast",
    brand: "Tesla",
    category: "Automotive",
    price: 189000,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80",
    specs: ["Tri-Motor AWD", "845 Horsepower", "0-100 km/h in 2.7s", "Armor Glass & Stainless Steel Exoskeleton"]
  },
  {
    id: "tes2",
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    category: "Automotive",
    price: 164000,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&q=80",
    specs: ["Tri-Motor Plaid AWD", "1,020 hp Peak Output", "0-100 km/h in 2.1s", "Carbon-sleeved Rotors"]
  },
  {
    id: "tes3",
    name: "Tesla Megapack 3 Custom Grid System",
    brand: "Tesla",
    category: "Energy",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&q=80",
    specs: ["3.9 MWh Storage Power", "Integrated Power Inverters", "Valourian National Smart-Grid Gateway"]
  },
  // BYD
  {
    id: "byd1",
    name: "BYD Yangwang U9 Hypercar",
    brand: "BYD",
    category: "Automotive",
    price: 350000,
    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80",
    specs: ["DiSus-X Intelligent Body Control", "4 Independent Electric Motors", "1,300 Horsepower", "Dancing Mode Deployed"]
  },
  {
    id: "byd2",
    name: "BYD Sealion 7 Smart SUV",
    brand: "BYD",
    category: "Automotive",
    price: 89900,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80",
    specs: ["CTB Cell-to-Body architecture", "BYD Blade Battery Technology", "Dual-Motor Intelligence AWD"]
  },
  {
    id: "byd3",
    name: "BYD Blade Battery Substation 2.5MW",
    brand: "BYD",
    category: "Energy",
    price: 620000,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80",
    specs: ["Ultra-High Safety Lithium Iron Phosphate", "2.5MWh Peak Discharge Rate", "Anti-Thermal Runway Enclosure"]
  },
  // Kia
  {
    id: "kia1",
    name: "Kia EV9 GT-Line Ultimate AWD",
    brand: "Kia",
    category: "Automotive",
    price: 121000,
    image: "https://images.unsplash.com/photo-1549399542-7ee3dc85067e?w=500&q=80",
    specs: ["3-row luxury electric SUV", "Swivel 2nd-row executive seats", "Dual-Motor 700Nm Torque", "Digital Pattern Lighting Grille"]
  },
  {
    id: "kia2",
    name: "Kia EV6 GT Performance Sportback",
    brand: "Kia",
    category: "Automotive",
    price: 99500,
    image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=500&q=80",
    specs: ["0-100 km/h in 3.5 seconds", "Neon green calipers & trim", "Active Electronic suspension"]
  }
];

const INTELLECTUAL_PROPERTIES = [
  { name: "apple.com", tld: ".com", type: "Digital Core", status: "Active Propagation", apps: ["Apple Store App", "FaceID Secure Protocol"] },
  { name: "apple.com.au", tld: ".com.au", type: "Sovereign Domestic Route", status: "DNS Anchored", apps: ["Apple PAY Gateway Australia"] },
  { name: "tesla.com", tld: ".com", type: "Electric Motorway IP", status: "Active Propagation", apps: ["Tesla App Integration", "FSD Core"] },
  { name: "tesla.com.au", tld: ".com.au", type: "DNS Routing Hub", status: "DNS Anchored", apps: ["Virtual Power Plant Australia"] },
  { name: "byd.com", tld: ".com", type: "Advanced Battery Patent Grid", status: "100% Acquired", apps: ["Blade Battery App Engine"] },
  { name: "byd.com.au", tld: ".com.au", type: "Domestic Fleet Distribution", status: "DNS Anchored", apps: ["Yangwang Core Link"] },
  { name: "kia.com", tld: ".com", type: "EV platform blueprints", status: "100% Acquired", apps: ["Kia Connect App Core"] },
  { name: "kia.com.au", tld: ".com.au", type: "Domestic Electric IP", status: "DNS Anchored", apps: ["EV9 OTA Delivery Hub"] }
];

export function SovereignStore({ user, balances, setBalances }: {
  user: any;
  balances: Record<string, number>;
  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const [activeSegment, setActiveSegment] = useState<"catalog" | "ai_procure" | "ip_routing" | "board_proofs">("catalog");
  const [selectedBrand, setSelectedBrand] = useState<"All" | "Apple" | "Tesla" | "BYD" | "Kia">("All");
  const [cart, setCart] = useState<Product[]>([]);
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailData | null>(null);
  const [activeBoardMember, setActiveBoardMember] = useState<"Asim" | "Aleks" | "Justin">("Asim");
  const [deliveryAddress, setDeliveryAddress] = useState("Level 55, Sovereign Tower, Sydney CBD, NSW 2000, Australia");
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || "asim.nsw@gmail.com");

  // AI guide/sourcing simulation state
  const [aiInput, setAiInput] = useState("");
  const [aiSourcingLogs, setAiSourcingLogs] = useState<string[]>([]);
  const [isSourcing, setIsSourcing] = useState(false);
  const [foundQuotes, setFoundQuotes] = useState<any[]>([]);

  const filteredProducts = STORE_PRODUCTS.filter(p => {
    if (selectedBrand === "All") return true;
    return p.brand === selectedBrand;
  });

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    toast.success(`Allocated ${product.name} to direct checkout cart!`, { icon: "🛒" });
  };

  const removeFromCart = (index: number) => {
    const product = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    toast.info(`Removed ${product.name} from checkout.`);
  };

  const executeCheckout = async () => {
    const total = cart.reduce((acc, p) => acc + p.price, 0);
    const audBalance = balances.AUD || 0;

    if (audBalance < total) {
      toast.error(`Insufficient Vault Reserves. Requirement: $${total.toLocaleString()} AUD. Current balance: $${audBalance.toLocaleString()} AUD.`);
      return;
    }

    setCheckoutProcessing(true);
    try {
      const updatedBalances = {
        ...balances,
        AUD: audBalance - total
      };

      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      }
      setBalances(updatedBalances);

      // Log transaction to Firestore
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: -total,
        currency: "AUD",
        recipient: "Sovereign Omni-Store Procurement Division",
        type: "Purchase",
        date: new Date().toISOString(),
        status: "completed",
        description: `Purchased Hardware/Capital Assets: ${cart.map(c => c.name).join(", ")}`,
        deliveryAddress,
        confirmationEmail
      });

      // Send confirmation email
      const assetNamesList = cart.map(c => c.name).join(", ");
      await sendEmailViaService(user, {
        sender: "Valourian Procurement Delivery",
        email: "procurement@valourian.com",
        receiverEmail: confirmationEmail,
        subject: `[CONFIRMED] Sovereign Procurement Dispatch - Order #${Math.floor(Math.random() * 89999 + 10000)}`,
        preview: `Your shipment with ${cart.length} item(s) has been cleared for immediate sovereign dispatch.`,
        body: `Dear Valourian Stakeholder,\n\nWe are pleased to confirm that your procurement order has been cleared for immediate airlift dispatch and physical transport.\n\nORDER SUMMARY:\n----------------------------------------\nOrdered Items: ${assetNamesList}\nTotal Cost: $${total.toLocaleString()} AUD (Vault Ledger Settled)\n\nDELIVERY ADDRESS:\n----------------------------------------\n${deliveryAddress}\n\nCONFIRMATION SENT TO:\n----------------------------------------\n${confirmationEmail}\n\nOur diplomatic transport team will secure custody of the hardware containers. Transition checkpoints are registered under your primary SSL DNS routing configuration on valourian.com.\n\nIf you have any questions, please contact Aleks or Justin of the Operations Board.\n\nBest regards,\nSovereign Omni-Store Logistics`
      }, setPreviewEmail);

      toast.success(`Vault debited $${total.toLocaleString()} AUD. Confirmation email queued at ${confirmationEmail}.`, {
        duration: 5000,
        icon: "🛡️"
      });
      setCart([]);
    } catch (e) {
      console.error(e);
      toast.error("Fulfillment checkout failed. Please check local database latency.");
    } finally {
      setCheckoutProcessing(false);
    }
  };

  // Sourcing trigger
  const handleAiSource = () => {
    if (!aiInput.trim()) return;
    setIsSourcing(true);
    setAiSourcingLogs([]);
    setFoundQuotes([]);

    const promptText = aiInput.toLowerCase();
    
    const logs = [
      "📡 Swarming neural intelligence channels...",
      "🔍 Querying global hardware arrays & Bloomberg commodities raw feed...",
      "🔗 Correlating Namecheap DNS records & live market indices...",
      "⚙️ Translating local custom clearance parameters & VIP tax waivers...",
      "✅ Optimum sovereign sourcing pipeline locked in."
    ];

    let quoteItems: any[] = [];
    if (promptText.includes("luxury") || promptText.includes("penthouse") || promptText.includes("house") || promptText.includes("property")) {
      quoteItems = [
        { name: "Sovereign Penthouse Asset (Sydney Harbour Reserve)", cost: 42000000, duration: "3 Days Transfer", source: "Sotheby's Global Syndicate" },
        { name: "Tokyo Azabudai Hills Sky Residence (Fitted Out)", cost: 68000000, duration: "5 Days Transfer", source: "Valourian Real Estate Holdings" }
      ];
    } else if (promptText.includes("server") || promptText.includes("titan") || promptText.includes("h100") || promptText.includes("compute")) {
      quoteItems = [
        { name: "NVIDIA H100 Custom Sovereign Tensor Node (x8 Interlinked)", cost: 380000, duration: "Direct Air Drop", source: "TSMC Direct Procurement Channel" },
        { name: "Valourian Supercomputing Node Module V5 (2000 TFlops)", cost: 1540000, duration: "Active Fiber Link", source: "Valourian Alpha Silicon Lab" }
      ];
    } else {
      // Default dynamic sourcing based on user prompt
      const costEstimate = Math.floor(Math.random() * 120000) + 15000;
      quoteItems = [
        { name: `Direct Premium Fulfillment: "${aiInput}"`, cost: costEstimate, duration: "48 hours Priority Transport", source: "Omni-Channel Global Source" },
        { name: `Alternative Bulk Supply Channel ("${aiInput}" - Enterprise)`, cost: Math.floor(costEstimate * 0.85), duration: "10 Days Sea Cargo", source: "BYD Logistics Subsidiary" }
      ];
    }

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setAiSourcingLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setIsSourcing(false);
          setFoundQuotes(quoteItems);
          toast.success("Omni-Channel Sourcing COMPLETE. Quotes mapped instantly.");
        }
      }, (idx + 1) * 800);
    });
  };

  const purchaseCustomQuote = async (quote: any) => {
    const audBalance = balances.AUD || 0;
    if (audBalance < quote.cost) {
      toast.error(`Reserves insufficient for custom sourcing. Required: $${quote.cost.toLocaleString()} AUD.`);
      return;
    }

    setCheckoutProcessing(true);
    try {
      const updatedBalances = {
        ...balances,
        AUD: audBalance - quote.cost
      };

      if (user && user.uid) {
        await updateDoc(doc(db, "users", user.uid), { balances: updatedBalances });
      }
      setBalances(updatedBalances);

      await addDoc(collection(db, "transactions"), {
        userId: user?.uid || "anonymous",
        amount: -quote.cost,
        currency: "AUD",
        recipient: quote.source,
        type: "Purchase",
        date: new Date().toISOString(),
        status: "completed",
        description: `Custom AI Guide Sourced Asset: ${quote.name}`,
        deliveryAddress,
        confirmationEmail
      });

      // Send confirmation email
      await sendEmailViaService(user, {
        sender: "Sovereign Sourced Logistics",
        email: "procurement@valourian.com",
        receiverEmail: confirmationEmail,
        subject: `[CONFIRMED] Custom Air-Drop Dispatch - ${quote.name}`,
        preview: `Your custom-sourced asset is now in priority transit queue.`,
        body: `Dear Valourian Stakeholder,\n\nYour custom-sourced order from our AI Procurement channel has been cleared.\n\nORDER SUMMARY:\n----------------------------------------\nSourced Asset: ${quote.name}\nTotal Cost: $${quote.cost.toLocaleString()} AUD (Vault Ledger Settled)\nSource Channel: ${quote.source}\nEstimated Lead Time: ${quote.duration || "Immediate Dispatch"}\n\nDELIVERY ADDRESS:\n----------------------------------------\n${deliveryAddress}\n\nCONFIRMATION SENT TO:\n----------------------------------------\n${confirmationEmail}\n\nDiplomatic transit pipelines are fully online.\n\nBest regards,\nSovereign Omni-Store Logistics`
      }, setPreviewEmail);

      toast.success(`Custom Asset "${quote.name}" secured for $${quote.cost.toLocaleString()} AUD! Confirmation email sent to ${confirmationEmail}.`, {
        duration: 5000,
        icon: "🤖"
      });
      // Clear sourcing and input
      setAiInput("");
      setFoundQuotes([]);
      setAiSourcingLogs([]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to execute custom sourcing purchase.");
    } finally {
      setCheckoutProcessing(false);
    }
  };

  const downloadCertificateToFile = (assetName: string, assetType: string, cost: number) => {
    const signatureKey = `VC-SIG-${Math.floor(Math.random() * 899999 + 100000)}-SVRN`;
    const certificateId = `VC-CERT-${Math.floor(Math.random() * 899999 + 100000)}`;
    const content = `===================================================================
                  VALOURIAN CAPITAL GROUP - SOVEREIGN CERTIFICATE
                       PROOF OF INTELLECTUAL & CAPITAL PROPERTY
===================================================================
DEED ID         : ${certificateId}
ASSET TITLE     : ${assetName}
CLASSIFICATION  : ${assetType}
VALUATION BASIS : $${cost.toLocaleString()} AUD
REGISTRY STATUS : Fully Secured & DNS Propagated (valourian.com)
SECURITY PROTOCOL: Quantum-Resistant DNS Anchoring
DEPLOYMENT DATE : ${new Date().toLocaleDateString()}

VALOURIAN CUSTODY SUMMARY:
-------------------------------------------------------------------
This legal instrument confirms that Valourian Capital, under the
leadership of Founder, CEO & Chairman Mr. Asim Aryal, retains full 
unconditional sovereign title, absolute IP propagation rights, and 
all related physical/digital proprietary interests in this asset.

REPRESENTATIVES & ATTESTATION:
-------------------------------------------------------------------
All corporate actions and payments are fully debited from safe 
liquidity pools and authenticated by the Valourian Board:

- Founder & CEO: Mr. Asim Aryal (asim.nsw@gmail.com)
- Director of Operations: Aleks (aleks@valourian.com)
- Director of Security: Justin (justin@valourian.com)

CRYPTOGRAPHIC SEAL VALIDATION:
-------------------------------------------------------------------
[SYSTEM_ANCHOR] hash: ${signatureKey}
[STATUS] Active propagation verified on Valourian Central Mesh.

THE CORPORATE BOARD SEAL IS DULY AFFIXED.
===================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Valourian_Title_Deed_${assetName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Title Deed Certificate for "${assetName}" successfully downloaded to your device!`, { icon: "📥" });
  };

  const forwardConfirmationToBoard = async (assetName: string, assetType: string, cost: number) => {
    if (!user) return toast.error("User context lost. Re-login required.");
    
    try {
      // Send email to Aleks
      await sendEmailViaService(user, {
        sender: "Valourian Capital Board Registry",
        email: "board-registry@valourian.com",
        receiverEmail: "aleks@valourian.com",
        subject: `[BOARD RESOLUTION] Safe-Sync Active Title Clearance - ${assetName}`,
        preview: `Notification of Sovereign IP Acquisition for "${assetName}" under custody of Valourian Capital.`,
        body: `Hello Aleks,\n\nThis board memo confirms that Valourian Capital has successfully finalized the acquisition, checkout clearance, and custody protocol for the following asset:\n\nAsset: ${assetName}\nType: ${assetType}\nAllocated Funds: $${cost.toLocaleString()} AUD\n\nThis asset has been fully linked with our active DNS routes and resolved on valourian.com. Direct safe-sync validation is online.\n\nBest regards,\nMr. Asim Aryal\nFounder, CEO & Chairman\nValourian Capital`
      }, setPreviewEmail);

      // Send email to Justin
      await sendEmailViaService(user, {
        sender: "Valourian Capital Board Registry",
        email: "board-registry@valourian.com",
        receiverEmail: "justin@valourian.com",
        subject: `[BOARD RESOLUTION] Safe-Sync Active Title Clearance - ${assetName}`,
        preview: `Notification of Sovereign IP Acquisition for "${assetName}" under custody of Valourian Capital.`,
        body: `Hello Justin,\n\nThis board memo confirms that Valourian Capital has successfully finalized the acquisition, checkout clearance, and custody protocol for the following asset:\n\nAsset: ${assetName}\nType: ${assetType}\nAllocated Funds: $${cost.toLocaleString()} AUD\n\nThis asset has been fully linked with our active DNS routes and resolved on valourian.com. Direct safe-sync validation is online.\n\nBest regards,\nMr. Asim Aryal\nFounder, CEO & Chairman\nValourian Capital`
      });

      toast.success(`Audit notice forwarded to Board members Aleks & Justin. Received successfully in workspace.`, { icon: "📧" });
    } catch (e) {
      console.error(e);
      toast.error("Error routing board notification email.");
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col font-sans">
      
      {/* Top Bar Banner with branding and VIP status */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
            <ShoppingBag className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Sovereign Omni-Store</h2>
              <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md uppercase border border-amber-500/30">100% IP Proprietary</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Apple • Tesla • BYD • Kia • AI Guide Sourcing Channels</p>
          </div>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">Vault Cash Reserves (AUD)</p>
          <p className="text-xl font-black text-emerald-400 font-mono mt-1">${(balances.AUD || 0).toLocaleString()} <span className="text-xs text-emerald-500">AUD</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-950/50 border-b border-slate-800 flex text-xs font-black uppercase tracking-wider overflow-x-auto">
        {[
          { id: "catalog", label: "Hardware & Auto Catalog", icon: Cpu },
          { id: "ai_procure", label: "AI Sourcing & Custom Markets", icon: Bot },
          { id: "ip_routing", label: "Own & IP DNS routing", icon: Layers },
          { id: "board_proofs", label: "Board Hub & Ownership Docs", icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSegment(tab.id as any)}
            className={`flex-1 py-4 px-3 text-center flex items-center justify-center gap-2 border-b-2 transition-all min-w-[150px] ${
              activeSegment === tab.id
                ? "border-amber-500 text-amber-400 bg-slate-900"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Body GRID */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 bg-slate-950/35">
        
        {/* SEGMENT 1: CATALOG STORE */}
        {activeSegment === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Products grid columns */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Brand filters */}
              <div className="flex flex-wrap gap-2">
                {(["All", "Apple", "Tesla", "BYD", "Kia"] as const).map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      selectedBrand === brand
                        ? "bg-amber-500 text-slate-950 shadow-md font-heavy"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 hover:shadow-xl transition-all">
                    
                    <div className="h-44 relative bg-slate-950 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/20">
                        {p.brand}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-sm px-3 py-1 rounded-xl font-mono text-emerald-400 text-sm font-black border border-slate-800">
                        ${p.price.toLocaleString()} AUD
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-heavy text-base text-slate-100 mb-2 leading-snug">{p.name}</h4>
                        <div className="space-y-1 mt-3">
                          {p.specs.map((spec, i) => (
                            <div key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5 font-sans">
                              <span className="w-1 h-1 rounded-full bg-amber-500/50"></span>
                              {spec}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(p)}
                        className="w-full mt-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-widest text-[11px] py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-slate-950 stroke-[3]" /> Add to Procurement Cart
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Shopping cart summary col */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-fit flex flex-col gap-5 sticky top-6">
              <h3 className="font-black text-lg text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Sovereign Cart
              </h3>

              {/* Delivery Preferences Form */}
              <div className="bg-slate-950/45 border border-slate-800/85 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery Preferences
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wide block">DISPATCH ADDRESS</label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans resize-none"
                    placeholder="Enter delivery destination..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wide block flex items-center justify-between">
                    <span>CONFIRMATION EMAIL</span>
                    <span className="text-[8px] text-emerald-400 font-heavy lowercase font-mono">live-routed</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={confirmationEmail}
                      onChange={(e) => setConfirmationEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-sans"
                      placeholder="e.g. name@domain.com"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 italic text-xs flex flex-col items-center gap-2">
                  <Compass className="w-8 h-8 opacity-25" />
                  Cart is empty. Select hardware or luxury fleet items from the left.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-slate-200 truncate">{item.name}</p>
                          <p className="text-[9px] text-amber-400 font-extrabold uppercase mt-0.5">{item.brand}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100">${item.price.toLocaleString()}</span>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-3">
                    <div className="flex justify-between font-black text-sm text-slate-300">
                      <span>Logistics Fee</span>
                      <span className="text-emerald-500 text-[10px] uppercase font-heavy">0 (VIP WAIVED)</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-slate-300 mt-2">
                      <span>Import Tariffs</span>
                      <span className="text-emerald-500 text-[10px] uppercase font-heavy">0 (M&A EXEMPTION)</span>
                    </div>
                    <div className="flex justify-between font-black text-base text-white mt-3 pt-3 border-t border-slate-800">
                      <span>Total Procurement</span>
                      <span className="font-mono text-emerald-400">
                        ${cart.reduce((s, c) => s + c.price, 0).toLocaleString()} AUD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={executeCheckout}
                    disabled={checkoutProcessing}
                    className="w-full mt-4 bg-emerald-500 font-extrabold text-slate-950 text-xs py-3.5 rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                  >
                    {checkoutProcessing ? (
                      <>
                        <Zap className="w-4 h-4 text-slate-950 animate-spin" />
                        Routing Liquid AUD Ledger...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-slate-950" />
                        Sovereign Order Checkout
                      </>
                    )}
                  </button>
                  
                  <p className="text-[9px] text-slate-500 text-center leading-normal">
                    Fulfillment routed via Valourian Digital DNS networks. Hardware delivery is tracked 100% via registered air-cargo networks.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SEGMENT 2: AI CO-ORDINATOR GUIDE */}
        {activeSegment === "ai_procure" && (
          <div className="max-w-4xl mx-auto w-full bg-slate-900/50 border border-slate-850 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/15 p-2 rounded-xl border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-purple-300 tracking-wide">AI Procurement Concierge</h3>
                <p className="text-xs text-slate-400">Query and purchase physical hardware, luxury commodities, or niche services directly using your cash reserves.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Tell our AI Assistant exactly what you wish to source. It will query premium B2B supplier listings, industrial manufacturing contracts, and private real-estate databases to instantly negotiate a custom sovereign checkout pipeline.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  placeholder="e.g. Sourced x8 interlinked Nvidia H100 GPU racks OR Penthouse in Melbourne with Helipad..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAiSource(); }}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 placeholder-slate-500 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-sans"
                />
                <button
                  onClick={handleAiSource}
                  disabled={isSourcing}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl flex items-center justify-center gap-1 flex-shrink-0 disabled:opacity-50"
                >
                  {isSourcing ? "Sourcing S1..." : "Query Markets"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time scanning animation */}
              <AnimatePresence>
                {(isSourcing || aiSourcingLogs.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 mt-2 font-mono text-xs space-y-1.5 max-h-[220px] overflow-y-auto"
                  >
                    {aiSourcingLogs.map((log, lIdx) => (
                      <div key={lIdx} className="text-slate-300 flex items-center gap-2">
                        <span className="text-amber-500 inline-block animate-pulse">■</span>
                        {log}
                      </div>
                    ))}
                    {isSourcing && (
                      <div className="text-slate-500 flex items-center gap-2 italic">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        AI Agent is assessing transport clearance codes...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delivery Preferences Form for custom quotes */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4 text-purple-400" /> Sourced Delivery Preferences
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">DISPATCH ADDRESS</label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 leading-relaxed font-sans resize-none"
                    placeholder="Enter delivery destination..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block flex items-center justify-between">
                    <span>CONFIRMATION EMAIL</span>
                    <span className="text-[8px] text-emerald-400 font-heavy lowercase font-mono">live-routed</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={confirmationEmail}
                      onChange={(e) => setConfirmationEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-805 rounded-xl pl-8 pr-3 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 font-sans"
                      placeholder="e.g. name@domain.com"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sourced results */}
            {foundQuotes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-300 text-xs uppercase tracking-wider leading-none">AI Sourced Marketplace Quotes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foundQuotes.map((q, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-extrabold text-slate-100 text-sm leading-snug">{q.name}</span>
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            Verified Source
                          </span>
                        </div>
                        <div className="space-y-1 mt-3 text-[11px] text-slate-400 font-sans">
                          <div>Fulfillment Route: <span className="text-slate-200 font-medium">{q.source}</span></div>
                          <div>Estimated dispatch duration: <span className="text-slate-200 font-medium">{q.duration}</span></div>
                        </div>
                      </div>

                      <div className="border-t border-slate-850 pt-4 mt-4 flex items-center justify-between">
                        <div className="font-mono text-emerald-400 font-black text-sm">
                          ${q.cost.toLocaleString()} AUD
                        </div>
                        <button
                          onClick={() => purchaseCustomQuote(q)}
                          disabled={checkoutProcessing}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all"
                        >
                          Checkout Asset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEGMENT 3: OWNED IP & DNS ROUTING MAP */}
        {activeSegment === "ip_routing" && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Parent Hold Namecheap.com</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Through the integration of NamecheapDNS systems, we completely own, host, and route premium digital properties and applications. Custom DNS redirects guarantee high-speed, direct sovereign checkout loops.
                </p>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                  Safe-Sync Active
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex flex-col items-center gap-1.5 flex-shrink-0">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                <span className="text-xs font-black text-indigo-300">100% Locked IP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTELLECTUAL_PROPERTIES.map((ip, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-white font-black text-base">{ip.name}</span>
                    <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md w-fit font-mono">
                      {ip.type}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase mt-1">
                      <FileCheck className="w-3.5 h-3.5 text-amber-500" /> {ip.apps.join(" • ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-heavy tracking-wider uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {ip.status}
                    </span>
                    <p className="text-[9px] text-slate-500 uppercase font-mono mt-1">TTL 300 SEC</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSegment === "board_proofs" && (
          <div className="space-y-8 max-w-4xl mx-auto w-full">
            {/* Board Members Credentials Header wrapper */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-400/40">
                    <Users className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Valourian Board Resolution Port</h3>
                    <p className="text-xs text-indigo-200 mt-1">Authorized Board Members Aleks, Justin, and Founder CEO Mr. Asim Aryal.</p>
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 font-sans">
                  Board Active Clearances
                </div>
              </div>

              {/* Board switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "Asim", name: "Mr. Asim Aryal", role: "Founder, CEO & Chairman", email: "asim.nsw@gmail.com" },
                  { key: "Aleks", name: "Aleks", role: "Board Director (Ops)", email: "aleks@valourian.com" },
                  { key: "Justin", name: "Justin", role: "Board Director (Sec)", email: "justin@valourian.com" }
                ].map((member) => (
                  <div
                    key={member.key}
                    onClick={() => {
                      setActiveBoardMember(member.key as any);
                      toast.info(`Active viewer switched to ${member.name} (${member.role})`);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all flex flex-col gap-1 ${
                      activeBoardMember === member.key
                        ? "bg-indigo-600/25 border-indigo-500 text-white shadow-lg"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm text-slate-100">{member.name}</span>
                    <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider">{member.role}</span>
                    <span className="text-[9px] font-mono text-slate-500 truncate mt-1">{member.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proofs of Ownership Sub-section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base uppercase text-emerald-400 tracking-wide flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-emerald-400" /> Proprietary Assets & Cryptographic Deeds
                  </h4>
                  <p className="text-xs text-slate-400">Download immutable title deeds or forward custody sign-offs to Aleks & Justin instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "valourian.com", type: "Digital Core Domain IP", cost: 125000000 },
                  { name: "apple.com", type: "Digital Core Domain IP", cost: 28200000000 },
                  { name: "apple.com.au", type: "Domain IP", cost: 8200000000 },
                  { name: "tesla.com", type: "Domain IP", cost: 18400000000 },
                  { name: "tesla.com.au", type: "Domain IP", cost: 5400000000 },
                  { name: "byd.com", type: "Domain IP", cost: 9500000000 },
                  { name: "byd.com.au", type: "Domain IP", cost: 2300000000 },
                  { name: "kia.com", type: "Domain IP", cost: 4200000000 },
                  { name: "kia.com.au", type: "Domain IP", cost: 1200000000 },
                  { name: "booking.com", type: "Domain IP", cost: 7200000000 },
                  { name: "uber.com.au", type: "Domain IP", cost: 1200000000 },
                  { name: "ubereats.com.au", type: "Domain IP", cost: 800000800 },
                  { name: "MacBook Pro M4 Max (Sovereign Edition)", type: "Physical Micro-Hardware Core", cost: 7299 },
                  { name: "Tesla Cybertruck Cyberbeast", type: "Direct Physical Automotive asset", cost: 189000 }
                ].map((docItem, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/25 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-heavy text-white text-base leading-snug">{docItem.name}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5 uppercase tracking-wide font-bold">
                          Deed Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-sans font-medium">{docItem.type}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">Value Basis: ${docItem.cost.toLocaleString()} AUD</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/60">
                      <button
                        onClick={() => downloadCertificateToFile(docItem.name, docItem.type, docItem.cost)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center min-w-0"
                      >
                        <Download className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Download</span>
                      </button>
                      <button
                        onClick={() => forwardConfirmationToBoard(docItem.name, docItem.type, docItem.cost)}
                        className="bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-[10px] uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center min-w-0"
                      >
                        <Send className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 animate-pulse" />
                        <span className="truncate">Forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      
      <EmailPreviewModal data={previewEmail} onClose={() => setPreviewEmail(null)} />
    </div>
  );
}
